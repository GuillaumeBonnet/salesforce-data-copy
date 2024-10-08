import { AuthInfo, Connection } from '@salesforce/core';
import {
  fieldsMetadataOfSobject,
  queryWithAllCreatableFields,
  startOrgConnexion,
} from './sfdxUtils';
import { DTfieldName, PermissionSetHandler } from './PermissionSetHandler';
import { SfRecord } from '../../../src/models/types';
import { errorMsg, isSfRecord } from '../../utils';
import { getOrgConnection, setOrgConnection } from './OrgConnector';

let permissionSetHandler: PermissionSetHandler;

const sfdx = {
  getAliases: async function getSfdxAuthAliases() {
    return (await AuthInfo.listAllAuthorizations()).map((auth) => {
      return {
        username: auth.username,
        alias: auth.aliases?.[0] || 'No Alias',
        isExpired: auth.isExpired == 'unknown' ? false : auth.isExpired,
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
      setOrgConnection(await startOrgConnexion(userNames.fromUsername), 'FROM');
      output.fromSandbox.successfulConnection = true;
    } catch (error) {
      output.fromSandbox.errorMsg = errorMsg(error);
    }
    try {
      setOrgConnection(await startOrgConnexion(userNames.toUsername), 'TO');
      output.toSandbox.successfulConnection = true;
    } catch (error) {
      output.toSandbox.errorMsg = errorMsg(error);
    }
    return output;
  },
  getSobjects: async function () {
    const connection = getOrgConnection('FROM');
    const objectList = (await connection.describeGlobal()).sobjects
      .filter((obj) => obj.queryable)
      .map((obj) => obj.name);
    return objectList;
  },
  queryWithAllCreatableFields: async function (
    sandbox: 'FROM' | 'TO',
    sObjectName: string,
    whereClause?: string,
  ) {
    const connection = getOrgConnection(sandbox);
    return queryWithAllCreatableFields(connection, sObjectName, whereClause);
  },
  fieldsMetadataOfSobject: async function (
    sandbox: 'FROM' | 'TO',
    sObjectName: string,
  ) {
    const connection = getOrgConnection(sandbox);
    return fieldsMetadataOfSobject(sObjectName, connection);
  },
  currentUserInfo: async function (sandbox: 'FROM' | 'TO') {
    const connection = getOrgConnection(sandbox);
    const { user_id, username } = await connection.identity();
    return { username, userId: user_id };
  },
  loadPermissionSetAndAssignement: async function (currentUserIdTo: string) {
    const connectionToOrg = getOrgConnection('TO');
    permissionSetHandler = new PermissionSetHandler(
      connectionToOrg,
      currentUserIdTo,
    );
    await permissionSetHandler.init();
  },
  findUser: async function (sandbox: 'FROM' | 'TO', userName: string) {
    const userNameBits = userName.split('.');
    userNameBits.pop();
    const userNameProd = userNameBits.join('.');
    const query = `SELECT Id, IsActive FROM User WHERE Username LIKE '${userNameProd}%'`;
    const connection = getOrgConnection(sandbox);
    const queryResult_RecordAlreadyExists = await connection.query(query);
    if (
      queryResult_RecordAlreadyExists &&
      queryResult_RecordAlreadyExists.records.length == 0
    ) {
      throw Error(
        `USER_NOT_FOUND: User ${userName} => ${userNameProd} not found in target Org.`,
      );
    }
    const ret = queryResult_RecordAlreadyExists.records[0];

    if (!isSfRecord(ret)) {
      throw Error('Id should not be null.');
    }
    return ret;
  },
  upsertOrgTo: async function (record: SfRecord) {
    const connectionToOrg = getOrgConnection('TO');
    return await connectionToOrg.upsert(
      record.attributes.type,
      record,
      DTfieldName,
    );
  },
  updateOrgTo: async function (record: SfRecord) {
    const connectionToOrg = getOrgConnection('TO');
    return await connectionToOrg.update(record.attributes.type, record);
  },
  createDTField_InOrgTo: async function (SObjectType: string) {
    await permissionSetHandler.createDTField_InOrgTo(SObjectType);
  },
};

export { sfdx };
