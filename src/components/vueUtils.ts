import { QVueGlobals } from 'quasar';

const notifyError = ($q: QVueGlobals, errorMsg: string) => {
  console.error(errorMsg);

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
