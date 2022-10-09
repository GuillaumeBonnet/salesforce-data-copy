import 'electron';
import { Electron } from 'electron';


declare module 'electron' {
  namespace Electron {
    interface toto extends Electron.IpcMain = {
      handle(
        channel: 'string' | 'toto',
        listener: (
          event: IpcMainInvokeEvent,
          ...args: any[]
        ) => Promise<void> | any
      ): void;
    };
  }
}
