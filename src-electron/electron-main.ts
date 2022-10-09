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
import { ipcApi } from './channels';
import { startOrgConnexion } from './sfdxUtils';
import { Schema } from 'jsforce';
app.whenReady().then(() => {
  createWindow();

  ipcMain.handle(ipcApi.sfdx.getAliases, getSfdxAuthAliases);
  ipcMain.handle(ipcApi.sfdx.testConnections, (event, ...args) => {
    testConnections(...args);
  });
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

async function getSfdxAuthAliases() {
  console.log('gboDebug: list', await AuthInfo.listAllAuthorizations());
  //TODO alias instead of username
  return (await AuthInfo.listAllAuthorizations()).map((auth) => auth.username);
}

let connectionSourceOrg: Connection<Schema>;
let connectionTargetOrg: Connection<Schema>;

async function testConnections(userNames: {
  sourceOrg: string;
  targetOrg: string;
}) {
  const output = {
    sourceOrg: {
      errorMsg: '',
      successfulConnection: false,
    },
    targetOrg: {
      errorMsg: '',
      successfulConnection: false,
    },
  };
  try {
    connectionSourceOrg = await startOrgConnexion(userNames.sourceOrg);
  } catch (error) {
    output.sourceOrg.errorMsg = errorMsg(error);
  }
  output.sourceOrg.successfulConnection = true;
  try {
    connectionTargetOrg = await startOrgConnexion(userNames.targetOrg);
  } catch (error) {
    output.targetOrg.errorMsg = errorMsg(error);
  }
  output.targetOrg.successfulConnection = true;
  return output;
}

export { ipcApi };
