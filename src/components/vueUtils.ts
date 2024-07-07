import { Callback } from '@salesforce/core/lib/status/types';
import { QVueGlobals } from 'quasar';
import { errorMsg } from '../../src-electron/utils';

const notifyError = ($q: QVueGlobals, errorMsg: string, error?: unknown) => {
  console.error(errorMsg);
  console.error(error);

  $q.notify({
    type: 'negative',
    message: errorMsg,
    multiLine: true,
    timeout: 10000,
    position: 'center',
    actions: [
      {
        label: 'Dismiss',
        color: 'white',
        handler: () => {
          /* ... */
        },
      },
    ],
  });
};

const ifErrorNotif = async ($q: QVueGlobals, callback: Callback) => {
  try {
    await callback();
  } catch (err) {
    notifyError($q, errorMsg(err), err);
  }
};

export { notifyError, ifErrorNotif };
