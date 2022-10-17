import ElectronStore from 'electron-store';

interface PersistentStore {
  initialConditions: {
    queryBits: {
      sObjectName: string;
      whereClause: string;
    };
    fromUsername: string;
    toUsername: string;
  };
}
const persistentStore = new ElectronStore<PersistentStore>({
  schema: {
    initialConditions: {
      type: 'object',
      required: ['queryBits', 'fromUsername', 'toUsername'],
      properties: {
        queryBits: {
          type: 'object',
          required: ['sObjectName', 'whereClause'],
          properties: {
            sObjectName: {
              type: 'string',
            },
            whereClause: {
              type: 'string',
            },
          },
        },
        fromUsername: {
          type: 'string',
          format: 'email',
        },
        toUsername: {
          type: 'string',
          format: 'email',
        },
      },
    },
  },
  clearInvalidConfig: true,
  //TODO do shallow encrypt
});

export { persistentStore };
export type { PersistentStore };
