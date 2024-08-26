import { Connection } from '@salesforce/core';

let connectionFromOrg: Connection;
let connectionToOrg: Connection;

const setOrgConnection = (connection: Connection, sandbox: 'FROM' | 'TO') => {
  if (sandbox == 'FROM') {
    connectionFromOrg = connection;
  }
  connectionToOrg = connection;
};
const getOrgConnection = (sandbox: 'FROM' | 'TO') => {
  if (sandbox == 'FROM') {
    return connectionFromOrg;
  }
  return connectionToOrg;
};
export { setOrgConnection, getOrgConnection };
