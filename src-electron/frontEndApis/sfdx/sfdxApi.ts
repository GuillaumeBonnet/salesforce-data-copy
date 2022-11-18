import { errorMsg } from '../../utils';
import { AuthInfo, Connection } from '@salesforce/core';
import {
  lookupsMetadataOfSobject,
  queryWithAllCreatableFields,
  SfRecord,
  startOrgConnexion,
} from './sfdxUtils';
import { DTfieldName, PermissionSetHandler } from './PermissionSetHandler';

let connectionFromOrg: Connection;
let connectionToOrg: Connection;
let permissionSetHandler: PermissionSetHandler;

const sfdx = {
  getAliases: async function getSfdxAuthAliases() {
    return (await AuthInfo.listAllAuthorizations()).map(
      (auth) => auth.username
    );
  },
  testConnections: async function testConnections(userNames: {
    fromUsername: string;
    toUsername: string;
  }) {
    const output = {
      fromSandbox: {
        errorMsg: '',
        successfulConnection: false,
      },
      toSandbox: {
        errorMsg: '',
        successfulConnection: false,
      },
    };
    try {
      connectionFromOrg = await startOrgConnexion(userNames.fromUsername);
    } catch (error) {
      output.fromSandbox.errorMsg = errorMsg(error);
    }
    output.fromSandbox.successfulConnection = true;
    try {
      connectionToOrg = await startOrgConnexion(userNames.toUsername);
    } catch (error) {
      output.toSandbox.errorMsg = errorMsg(error);
    }
    output.toSandbox.successfulConnection = true;
    return output;
  },
  queryWithAllCreatableFields: async function (
    sandbox: 'FROM' | 'TO',
    sObjectName: string,
    whereClause?: string
  ) {
    const connection: Connection =
      sandbox == 'FROM' ? connectionFromOrg : connectionToOrg;
    return queryWithAllCreatableFields(connection, sObjectName, whereClause);
  },
  lookupsMetadataOfSobject: async function (
    sandbox: 'FROM' | 'TO',
    sObjectName: string
  ) {
    const connection: Connection =
      sandbox == 'FROM' ? connectionFromOrg : connectionToOrg;
    return lookupsMetadataOfSobject(sObjectName, connection);
  },
  currentUserId: async function (sandbox: 'FROM' | 'TO') {
    const connection: Connection =
      sandbox == 'FROM' ? connectionFromOrg : connectionToOrg;
    return (await connection.identity()).id;
  },
  loadPermissionSetAndAssignement: async function (currentUserIdTo: string) {
    permissionSetHandler = new PermissionSetHandler(
      connectionToOrg,
      currentUserIdTo
    );
    await permissionSetHandler.init();
  },
  findUser: async function (sandbox: 'FROM' | 'TO', userName: string) {
    const userNameBits = userName.split('.');
    userNameBits.pop();
    const userNameProd = userNameBits.join('.');
    const query = `SELECT Id, IsActive FROM User WHERE Username LIKE '${userNameProd}%'`;
    const connection: Connection =
      sandbox == 'FROM' ? connectionFromOrg : connectionToOrg;
    const queryResult_RecordAlreadyExists = await connection.query(query);
    if (
      queryResult_RecordAlreadyExists &&
      queryResult_RecordAlreadyExists.records.length == 0
    ) {
      throw Error(
        `User ${userName} => ${userNameProd} not found in target Org.`
      );
    } else {
      return queryResult_RecordAlreadyExists.records[0];
    }
  },
  upsertOrgTo: async function (record: SfRecord) {
    return await connectionToOrg.upsert(
      record.attributes.type,
      record,
      DTfieldName
    );
  },
  updateOrgTo: async function (record: SfRecord) {
    return await connectionToOrg.update(record.attributes.type, record);
  },
  createDTField_InOrgTo: async function (SObjectType: string) {
    await permissionSetHandler.createDTField_InOrgTo(SObjectType);
  },
};

export { sfdx };
