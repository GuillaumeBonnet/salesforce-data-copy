import { AuthInfo, Connection } from '@salesforce/core';
import { Record } from 'jsforce';
import { Log } from 'src/components/GraphSteps/Log';
import {
  SfRecord,
  CacheLookupMetadata,
  LookupMetadata,
} from 'src/models/types';

const findAllCreatableFields = async (
  connection: Connection,
  sObjectName: string
) => {
  const describeResult = await connection.describe(sObjectName);
  return describeResult.fields
    .filter(
      (field) =>
        field.createable &&
        !field.name.endsWith('__pc') && // person account readonly, those fields should be set on the related contact
        field.name.split('__').length <= 2 /*=> managed package fields*/
    )
    .map((elem) => {
      return elem.name;
    });
};

const startOrgConnexion = async (username: string) => {
  const allAuthoriaztions = await AuthInfo.listAllAuthorizations();
  const authorization = allAuthoriaztions.find((authorization) => {
    return authorization.username == username;
  });
  if (!authorization) {
    throw new Error('Authorization not found.');
  }
  return Connection.create({
    authInfo: await AuthInfo.create(authorization),
  });
};

//used as a cache the const will be the same at each call of lookupsMetadataOfSobject.
const lookUpCaches: { [orgUrl: string]: CacheLookupMetadata } = {};
const lookupsMetadataOfSobject = async (
  sObjectName: string,
  connection: Connection
) => {
  const url = connection.baseUrl();
  if (!lookUpCaches[url]) {
    lookUpCaches[url] = {};
  }
  const lookupFieldsByObjectName = lookUpCaches[url];
  if (lookupFieldsByObjectName[sObjectName]) {
    return lookupFieldsByObjectName[sObjectName];
  }
  const describeResult = await connection.describe(sObjectName);
  lookupFieldsByObjectName[sObjectName] = describeResult.fields
    .filter((field) => field.type == 'reference')
    .map((elem) => {
      if (elem.referenceTo && elem.referenceTo.length > 1) {
        Log.warning(`lookup ${sObjectName}.${elem.name} is polymorphic`);
      } // TODO delete this warning soon
      if (!elem.referenceTo) {
        throw Error(`Error with metadata of ${sObjectName}.${elem.name}Z`);
      }
      const lookupMetadata: LookupMetadata = {
        name: elem.name,
        sObjectsReferenced: elem.referenceTo,
      };
      return lookupMetadata;
    });
  return lookupFieldsByObjectName[sObjectName];
};

const queryWithAllCreatableFields = async (
  connection: Connection,
  sObjectName: string,
  whereClause?: string
) => {
  if (sObjectName == 'Queue') {
    sObjectName = 'Group';
  }
  const creatableFields = await findAllCreatableFields(connection, sObjectName);
  if (!whereClause) {
    // I don't think this case ever happens as of this comment timestamp
    whereClause = '';
  } else if (!whereClause.trim().toUpperCase().startsWith('WHERE')) {
    whereClause = 'WHERE ' + whereClause;
  }
  if (sObjectName == 'RecordType') {
    creatableFields.unshift('IsPersonType');
  }
  creatableFields.unshift('Id');
  const lookupsMetadata = await lookupsMetadataOfSobject(
    sObjectName,
    connection
  );
  for (const field of creatableFields) {
    const matchingLookupMetadata = lookupsMetadata.find(
      (elem) => elem.name == field
    );
    const isPolymorphic =
      !!matchingLookupMetadata &&
      matchingLookupMetadata.sObjectsReferenced.length > 1;
    if (isPolymorphic && field != 'DelegatedApproverId') {
      //salesforce doesn't allow DelegatedApprover.Type
      creatableFields.push(field.replace(/id$/gi, '.Type'));
    }
  }
  const queryString = `SELECT ${creatableFields.join(
    ', '
  )} FROM ${sObjectName} ${whereClause}`;

  Log.stepInGreen(
    'query',
    `SELECT fields... FROM ${sObjectName} ${whereClause}`
  );
  const recordsData = (await connection.query(queryString)).records; //TODO check about sanitizing user inputs, mb in the generic function that bridges all the electronApi
  if (!isSfRecords(recordsData)) {
    throw Error(
      'one of the recordData should have an Id and an attributes property'
    );
  }
  return recordsData;
};

function isSfRecords(records: Record[]): records is SfRecord[] {
  return !records.some((record) => {
    return !isSfRecord(record);
  });
}
function isSfRecord(record: Record): record is SfRecord {
  return !!record.Id && !!record.attributes;
}

const findCreatableUniqueField = async (
  sObjectName: string,
  connection: Connection
) => {
  const firstUniqueField = (await connection.describe(sObjectName)).fields.find(
    (field) => {
      return (
        field.createable &&
        field.unique &&
        field.type != 'reference' &&
        field.name != 'Id'
      );
    }
  );
  if (firstUniqueField) {
    return firstUniqueField.name;
  } else {
    return null;
  }
};

const findUserInSandboxOrg = async (
  userName: string,
  connection: Connection
) => {
  const userNameBits = userName.split('.');
  userNameBits.pop();
  const userNameProd = userNameBits.join('.');
  const query = `SELECT Id, IsActive FROM User WHERE Username LIKE '${userNameProd}%'`;
  const queryResult_RecordAlreadyExists = await connection.query(query);
  if (
    queryResult_RecordAlreadyExists &&
    queryResult_RecordAlreadyExists.records.length == 0
  ) {
    throw Error(`User ${userName} => ${userNameProd} not found in target Org.`);
  } else {
    return queryResult_RecordAlreadyExists.records[0];
  }
};

interface UpsertError {
  name: string;
  errorCode: string;
  message: string;
  //fields: Array<Object>;
}

const isUpsertError = (value: unknown): value is UpsertError => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'errorCode' in value &&
    'message' in value
  );
};

export {
  findAllCreatableFields,
  startOrgConnexion,
  queryWithAllCreatableFields,
  lookupsMetadataOfSobject,
  findCreatableUniqueField as findUniqueField,
  findUserInSandboxOrg,
  isUpsertError,
};

export type { SfRecord, UpsertError };
