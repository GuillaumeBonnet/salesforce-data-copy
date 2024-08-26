/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 */

import { contextBridge, ipcRenderer } from 'electron';
import { ElectronApi_PreloadKeyChecker } from './electron-main';
/**
 * @description to be updated manually. will show errors when electronApi is changed
 *  in the main script. Odd work around because importing the electronApi const doesn't
 *  work so we're importing a type instead
 */
const electronApiKeys: ElectronApi_PreloadKeyChecker = {
  sfdx: {
    getAliases: '',
    testConnections: '',
    getSobjects: '',
    queryWithAllCreatableFields: '',
    fieldsMetadataOfSobject: '',
    currentUserInfo: '',
    loadPermissionSetAndAssignement: '',
    findUser: '',
    upsertOrgTo: '',
    updateOrgTo: '',
    createDTField_InOrgTo: '',
  },
  persistentStore: {
    getInitialConditions: '',
    setInitialConditions: '',
    getGraphBeforeUpsertion: '',
    setGraphBeforeUpsertion: '',
    getGraphUiSettings: '',
    setGraphUiSettings: '',
  },
};

const electronApiExposed = JSON.parse(JSON.stringify(electronApiKeys));

for (const domainKey in electronApiKeys) {
  const typedKey = domainKey as keyof typeof electronApiKeys;
  for (const key in electronApiKeys[typedKey]) {
    electronApiExposed[domainKey][key] = (...args: any[]) => {
      return ipcRenderer.invoke(`${domainKey}.${key}`, ...args);
    };
  }
}
contextBridge.exposeInMainWorld('electronApi', electronApiExposed);
