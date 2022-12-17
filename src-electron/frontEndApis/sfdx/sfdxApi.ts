import { errorMsg, isSfRecord } from '../../utils';
import { AuthInfo, Connection } from '@salesforce/core';
import {
  lookupsMetadataOfSobject,
  queryWithAllCreatableFields,
  startOrgConnexion,
} from './sfdxUtils';
import { DTfieldName, PermissionSetHandler } from './PermissionSetHandler';
import { SfRecord } from 'src/models/types';

let connectionFromOrg: Connection;
let connectionToOrg: Connection;
let permissionSetHandler: PermissionSetHandler;

const sfdx = {
  getAliases: async function getSfdxAuthAliases() {
    return (await AuthInfo.listAllAuthorizations()).map((auth) => {
      return {
        username: auth.username,
        alias: auth.aliases?.[0] || 'No Alias',
      };
    });
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
      output.fromSandbox.successfulConnection = true;
    } catch (error) {
      output.fromSandbox.errorMsg = errorMsg(error);
    }
    try {
      connectionToOrg = await startOrgConnexion(userNames.toUsername);
      output.toSandbox.successfulConnection = true;
    } catch (error) {
      output.toSandbox.errorMsg = errorMsg(error);
    }
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
  currentUserInfo: async function (sandbox: 'FROM' | 'TO') {
    const connection: Connection =
      sandbox == 'FROM' ? connectionFromOrg : connectionToOrg;
    const { user_id, username } = await connection.identity();
    return { username, userId: user_id };
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
        `User ${userName} => ${userNameProd} not found in target Org.`,
        {
          cause: { code: 'USER_NOT_FOUND' },
        }
      );
    }
    const ret = queryResult_RecordAlreadyExists.records[0];

    if (!isSfRecord(ret)) {
      throw Error('Id should not be null.');
    }
    return ret;
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
