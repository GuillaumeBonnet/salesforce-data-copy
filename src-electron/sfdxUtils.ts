import { AuthInfo, Connection } from '@salesforce/core';
import { Record } from 'jsforce';
import { Log } from 'src/components/GraphSteps/Log';
import { SfRecord } from 'src/models/types';

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

const queryWithAllCreatableFields = async (
  connection: Connection,
  sObjectName: string,
  whereClause?: string
) => {
  const creatableFields = await findAllCreatableFields(connection, sObjectName);
  if (!whereClause) {
    whereClause = '';
  }
  if (sObjectName == 'RecordType') {
    creatableFields.unshift('IsPersonType');
  }
  creatableFields.unshift('Id');
  const queryString = `SELECT ${creatableFields.join(
    ', '
  )} FROM ${sObjectName} WHERE ${whereClause}`;

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

const lookupsMetadataOfSobject = async (
  sObjectName: string,
  connection: Connection
) => {
  const describeResult = await connection.describe(sObjectName);
  return describeResult.fields
    .filter((field) => field.type == 'reference')
    .map((elem) => {
      if (elem.referenceTo && elem.referenceTo[0] == 'Group') {
        elem.referenceTo.shift();
      }
      if (elem.referenceTo && elem.referenceTo.length > 1) {
        Log.warning(`lookup ${sObjectName}.${elem.name} is polymorphic`);
      }
      return {
        name: elem.name,
        sObjectName: (elem.referenceTo && elem.referenceTo[0]) || '', // toImprove: whatId error here maybe
      };
    });
};

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

export {
  findAllCreatableFields,
  startOrgConnexion,
  queryWithAllCreatableFields,
  lookupsMetadataOfSobject,
  findCreatableUniqueField as findUniqueField,
  findUserInSandboxOrg,
};

export type { SfRecord };
