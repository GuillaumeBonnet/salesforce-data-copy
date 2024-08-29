import { ElementDefinition } from 'cytoscape';
import Store from 'electron-store';
import { NodeData } from 'src/models/GraphTypes';
import packageInfo from '../../../package-lock.json';

interface PersistentStore {
  version: string;
  initialConditions: {
    queryBits: {
      sObjectName: string;
      whereClause: string;
    };
    fromUsername: string;
    toUsername: string;
  };
  graphElementsBeforeUpsert?: ElementDefinition[]; //array of elements as json
  graphUiSettings: {
    spacingFactor: number;
    areOwnersHidden: boolean;
  };
}
const persistentStore = new Store<PersistentStore>({
  schema: {
    version: {
      type: 'string',
    },
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
    graphElementsBeforeUpsert: {
      $schema: 'http://json-schema.org/draft-04/schema#',
      type: 'array',
      contains: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
              sdcData: {
                type: 'object',
              },
              label: {
                type: 'string',
              },
            },
            required: ['id', 'label'],
          },
          position: {
            type: 'object',
            properties: {
              x: {
                type: 'number',
              },
              y: {
                type: 'number',
              },
            },
            required: ['x', 'y'],
          },
          group: {
            type: 'string',
          },
          removed: {
            type: 'boolean',
          },
          selected: {
            type: 'boolean',
          },
          selectable: {
            type: 'boolean',
          },
          locked: {
            type: 'boolean',
          },
          grabbable: {
            type: 'boolean',
          },
          pannable: {
            type: 'boolean',
          },
          classes: {
            type: 'string',
          },
        },
        required: ['data', 'position', 'group', 'removed', 'classes'],
      },
    },
    graphUiSettings: {
      type: 'object',
      required: ['spacingFactor', 'areOwnersHidden'],
      properties: {
        spacingFactor: {
          type: 'number',
        },
        areOwnersHidden: {
          type: 'boolean',
        },
      },
    },
  },
  clearInvalidConfig: true,
});
console.log(
  "gboDebug:[persistentStore.get('version')]",
  persistentStore.get('version'),
);
if (
  !persistentStore.get('version') ||
  persistentStore.get('version') !== packageInfo.version
) {
  // here update format of the data in store from on version to another if needed
  persistentStore.clear();
  persistentStore.set('version', packageInfo.version);
}

export { persistentStore };
export type { PersistentStore };
