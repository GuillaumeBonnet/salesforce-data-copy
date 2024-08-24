import { SdcData } from 'src/models/GraphTypes';
import { PersistentStore, persistentStore } from './PersistentStore';

const persistentStoreApi = {
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
    initialConditions: PersistentStore['initialConditions'],
  ) => {
    return persistentStore.set('initialConditions', initialConditions);
  },
  getGraphBeforeUpsertion: async () => {
    return persistentStore.get('graphElementsBeforeUpsert');
  },
  setGraphBeforeUpsertion: async (
    graphElementsBeforeUpsert: PersistentStore['graphElementsBeforeUpsert'],
  ) => {
    return persistentStore.set(
      'graphElementsBeforeUpsert',
      graphElementsBeforeUpsert,
    );
  },
  getGraphUiSettings: async () => {
    return persistentStore.get('graphUiSettings', {
      areOwnersHidden: false,
      spacingFactor: 1.5,
    });
  },
  setGraphUiSettings: async (
    graphUiSettings: PersistentStore['graphUiSettings'],
  ) => {
    return persistentStore.set('graphUiSettings', graphUiSettings);
  },
};

export { persistentStoreApi };
