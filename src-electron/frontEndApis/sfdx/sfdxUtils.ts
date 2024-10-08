import { AuthInfo, Connection } from '@salesforce/core';
import { Log } from '../../../src/components/GraphSteps/Log';
import {
  SfRecord,
  CacheFieldsMetadata,
  LookupMetadata,
} from '../../../src/models/types';
import { Record } from '@jsforce/jsforce-node';

const findAllCreatableFields = async (
  connection: Connection,
  sObjectName: string,
) => {
  process.on('uncaughtException', (err) => {
    console.error(`Uncaught Exception: ${err.message}`, err);
    process.exit(1);
  });
  process.on('message', function (message: unknown) {
    console.log('process.message', message);
  });
  const fields = (await fieldsMetadataOfSobject(sObjectName, connection))
    .allFields;
  return fields
    .filter(
      (field) =>
        field.createable &&
        !field.name.endsWith('__pc') && // person account readonly, those fields should be set on the related contact
        field.name.split('__').length <= 2 /*=> managed package fields*/,
    )
    .map((elem) => {
      return elem.name;
    });
};

const startOrgConnexion = async (username: string) => {
  const allAuthorizations = await AuthInfo.listAllAuthorizations();
  const authorization = allAuthorizations.find((authorization) => {
    return authorization.username == username;
  });
  if (!authorization) {
    throw new Error('Authorization not found.');
  }

  const connection = await Connection.create({
    authInfo: await AuthInfo.create(authorization),
  });
  try {
    await connection.identity();
  } catch (err) {
    if (err.errorCode == 'ERROR_HTTP_420') {
      throw new Error(
        'ERROR_HTTP_420 connection error. check connection through sfdx.',
      );
    }
  }
  return connection;
};

//used as a cache the const will be the same at each call of fieldsMetadataOfSobject.
const lookUpCaches: { [orgUrl: string]: CacheFieldsMetadata } = {};
const fieldsMetadataOfSobject = async (
  sObjectName: string,
  connection: Connection,
) => {
  const url = connection.baseUrl();
  if (!lookUpCaches[url]) {
    lookUpCaches[url] = {};
  }
  const fieldsInfoByObjectName = lookUpCaches[url];
  if (fieldsInfoByObjectName[sObjectName]) {
    return fieldsInfoByObjectName[sObjectName];
  }
  const describeResult = await connection.describe(sObjectName);
  fieldsInfoByObjectName[sObjectName] = {
    allFields: describeResult.fields,
    lookupFields: describeResult.fields
      .filter((field) => field.type == 'reference')
      .map((elem) => {
        if (elem.referenceTo && elem.referenceTo.length > 1) {
          Log.warning(`lookup ${sObjectName}.${elem.name} is polymorphic`);
        } // TODO delete this warning soon
        if (!elem.referenceTo) {
          throw Error(`Error with metadata of ${sObjectName}.${elem.name}`);
        }
        const lookupMetadata: LookupMetadata = {
          name: elem.name,
          sObjectsReferenced: elem.referenceTo,
        };
        return lookupMetadata;
      }),
  };

  return fieldsInfoByObjectName[sObjectName];
};

const queryWithAllCreatableFields = async (
  connection: Connection,
  sObjectName: string,
  whereClause?: string,
) => {
  if (sObjectName == 'Queue') {
    sObjectName = 'Group';
  }
  const creatableFields = await findAllCreatableFields(connection, sObjectName);
  if (!whereClause || !whereClause?.trim()) {
    whereClause = '';
  } else if (!whereClause.trim().toUpperCase().startsWith('WHERE')) {
    whereClause = 'WHERE ' + whereClause;
  }
  if (
    sObjectName == 'RecordType' &&
    (await fieldsMetadataOfSobject('RecordType', connection)).allFields.find(
      (field) => field.name == 'IsPersonType',
    )
  ) {
    creatableFields.unshift('IsPersonType');
  }
  creatableFields.unshift('Id');
  const fieldsMetadata = await fieldsMetadataOfSobject(sObjectName, connection);
  for (const field of creatableFields) {
    const matchingLookupMetadata = fieldsMetadata.lookupFields.find(
      (elem) => elem.name == field,
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
    ', ',
  )} FROM ${sObjectName} ${whereClause}`;

  Log.stepInGreen(
    'query',
    `SELECT fields... FROM ${sObjectName} ${whereClause}`,
  );
  const recordsData = (await connection.query(queryString)).records; //TODO check about sanitizing user inputs, mb in the generic function that bridges all the electronApi
  if (!isSfRecords(recordsData)) {
    throw Error(
      'one of the recordData should have an Id and an attributes property',
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
  connection: Connection,
) => {
  const firstUniqueField = (
    await fieldsMetadataOfSobject(sObjectName, connection)
  ).allFields.find((field) => {
    return (
      field.createable &&
      field.unique &&
      field.type != 'reference' &&
      field.name != 'Id'
    );
  });
  if (firstUniqueField) {
    return firstUniqueField.name;
  } else {
    return null;
  }
};

const getConnection = () => {};

export {
  findAllCreatableFields,
  startOrgConnexion,
  queryWithAllCreatableFields,
  fieldsMetadataOfSobject,
  findCreatableUniqueField as findUniqueField,
  getConnection,
};
