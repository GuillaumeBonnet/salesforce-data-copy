import { NodeDataClass } from 'src/models/GraphTypes';
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
    initialConditions: PersistentStore['initialConditions']
  ) => {
    return persistentStore.set('initialConditions', initialConditions);
  },
  getGraphBeforeUpsertion: async () => {
    return persistentStore.get('graphElementsBeforeUpsert');
  },
  setGraphBeforeUpsertion: async (
    graphElementsBeforeUpsert: PersistentStore['graphElementsBeforeUpsert']
  ) => {
    return persistentStore.set(
      'graphElementsBeforeUpsert',
      graphElementsBeforeUpsert
    );
  },
};

export { persistentStoreApi };
