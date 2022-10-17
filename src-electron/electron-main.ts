import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron';
import path from 'path';
import os from 'os';
import { errorMsg } from './utils';

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

try {
  if (platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(
      path.join(app.getPath('userData'), 'DevTools Extensions')
    );
  }
} catch (_) {}

let mainWindow: BrowserWindow | undefined;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
  });

  mainWindow.loadURL(process.env.APP_URL);

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools();
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });
}

import { AuthInfo, Connection } from '@salesforce/core';
// import { ipcApi } from './channels';
import { startOrgConnexion } from './sfdxUtils';
import { Schema } from 'jsforce';
import { electron } from 'process';
import { PersistentStore, persistentStore } from './PersistentStore';

let connectionSourceOrg: Connection<Schema>;
let connectionTargetOrg: Connection<Schema>;

const electronApi = {
  sfdx: {
    getAliases: async function getSfdxAuthAliases() {
      //TODO alias instead of username
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
        connectionSourceOrg = await startOrgConnexion(userNames.fromUsername);
      } catch (error) {
        output.fromSandbox.errorMsg = errorMsg(error);
      }
      output.fromSandbox.successfulConnection = true;
      try {
        connectionTargetOrg = await startOrgConnexion(userNames.toUsername);
      } catch (error) {
        output.toSandbox.errorMsg = errorMsg(error);
      }
      output.toSandbox.successfulConnection = true;
      return output;
    },
  },
  persistentStore: {
    getInitialConditions: async () => {
      return persistentStore.get('initialConditions', {
        fromUsername: '',
        toUsername: '',
        queryBits: {
          sObjectName: '',
          whereClause: '',
        },
      });
    },
    setInitialConditions: async (
      initialConditions: PersistentStore['initialConditions']
    ) => {
      return persistentStore.set('initialConditions', initialConditions);
    },
  },
};

type ElectronApi = typeof electronApi;

type ElectronApi_PreloadKeyChecker = {
  [key in keyof ElectronApi]: {
    [key2 in keyof ElectronApi[key]]: '';
  };
};

app.whenReady().then(() => {
  createWindow();
  for (const domainKey in electronApi) {
    const typedKey = domainKey as keyof typeof electronApi;
    for (const key in electronApi[typedKey]) {
      //todo check good security practice page
      ipcMain.handle(`${domainKey}.${key}`, (event, ...args) => {
        return (electronApi as any)[domainKey][key](...args);
      });
    }
  }
});

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === undefined) {
    createWindow();
  }
});

export { electronApi };
export type { ElectronApi, ElectronApi_PreloadKeyChecker };
