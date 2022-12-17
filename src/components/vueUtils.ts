import { QVueGlobals } from 'quasar';

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

export { notifyError };
