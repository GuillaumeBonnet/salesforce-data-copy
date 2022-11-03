import { ElementDefinition, ElementsDefinition } from 'cytoscape';
import ElectronStore from 'electron-store';
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
  graphElementsBeforeUpsert?: ElementsDefinition<NodeData>; //array of elements as json
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
              nodeData: {
                type: 'object',
              },
              label: {
                type: 'string',
              },
            },
            required: ['id', 'nodeData', 'label'],
          },
          position: {
            type: 'object',
            properties: {
              x: {
                type: 'integer',
              },
              y: {
                type: 'integer',
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
  },
  clearInvalidConfig: true,
  //TODO do shallow encrypt
});

export { persistentStore };
export type { PersistentStore };
