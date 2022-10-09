import { AuthInfo, Connection } from '@salesforce/core';
import { SobjectData } from 'src/models/types';
import { Log } from './Log';

const findAllCreatableFields = async (
  sObjectName: string,
  connection: Connection
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
  sObjectName: string,
  connection: Connection,
  whereClause?: string
) => {
  const creatableFields = await findAllCreatableFields(sObjectName, connection);
  if (!whereClause) {
    whereClause = '';
  }
  if (sObjectName == 'RecordType') {
    creatableFields.unshift('IsPersonType');
  }
  creatableFields.unshift('Id');
  const querryString = `SELECT ${creatableFields.join(
    ', '
  )} FROM ${sObjectName} ${whereClause}`;
  Log.stepInGreen(
    'query',
    `SELECT fields... FROM ${sObjectName} ${whereClause}`
  );

  return (await connection.query(querryString)).records.map(
    (elem) => elem as SobjectData
  );
};

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
    return queryResult_RecordAlreadyExists.records[0] as SobjectData;
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
