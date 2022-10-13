/* eslint-disable */

import { ElectronApi } from 'app/src-electron/electron-main';

declare global {
  interface Window {
    electronApi: ElectronApi;
  }
}

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
  }
}
