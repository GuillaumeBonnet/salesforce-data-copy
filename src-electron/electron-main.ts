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

// import { ipcApi } from './channels';
import { sfdx } from './frontEndApis/sfdx/sfdxApi';
import { persistentStoreApi } from './frontEndApis/store/persistentStoreApi';

const electronApi = {
  sfdx: sfdx,
  persistentStore: persistentStoreApi,
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
