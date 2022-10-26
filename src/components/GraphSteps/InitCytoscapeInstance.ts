import cytoscape from 'cytoscape';
import { NodeData } from 'src/models/GraphTypes';
import { LAYOUT_OPTIONS_DAGRE } from './CytoscapeConf';

import dagre from 'cytoscape-dagre';

const getEmptyGraph = () => {
  cytoscape.use(dagre);
  const cy = cytoscape<{ nodeData: NodeData }>({
    elements: { nodes: [], edges: [] },
    style: [
      // the stylesheet for the graph
      {
        selector: 'node',
        style: {
          'background-color': '#666',
          label: 'data(id)',
        },
      },

      {
        selector: 'edge',
        style: {
          width: 3,
          'line-color': '#ccc',
          'target-arrow-color': '#ccc',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
        },
      },
    ],
    layout: LAYOUT_OPTIONS_DAGRE,
  });
  return cy;
};

const nodeStatesClasses = {
  INITIAL_RECORD: 'node-initial-record',
  ERROR: 'node-error',
  PREPARING_UPSERT: 'node-preparing-upsert',
  UPSERTED: 'node-upsert',
  SKIPPED: 'node-skipped',
  NONE: '',
};

export { getEmptyGraph, nodeStatesClasses };
