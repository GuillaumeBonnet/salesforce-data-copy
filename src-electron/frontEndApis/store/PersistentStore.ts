import { ElementDefinition } from 'cytoscape';
import Store from 'electron-store';
import { NodeData } from 'src/models/GraphTypes';

interface PersistentStore {
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
  //TODO do shallow encrypt
});

export { persistentStore };
export type { PersistentStore };
