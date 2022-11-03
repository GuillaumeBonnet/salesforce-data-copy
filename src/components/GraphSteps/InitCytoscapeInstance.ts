import cytoscape, { CytoscapeOptions, ElementsDefinition } from 'cytoscape';
import { isCytoNode, NodeData } from 'src/models/GraphTypes';
import { LAYOUT_OPTIONS_DAGRE } from './CytoscapeConf';

import dagre from 'cytoscape-dagre';

const nodeStatesClasses = {
  INITIAL_RECORD: 'node-initial-record',
  ERROR: 'node-error',
  PREPARING_UPSERT: 'node-preparing-upsert',
  UPSERTED: 'node-upsert',
  SKIPPED: 'node-skipped',
  NONE: '',
};

const getGraph = (elements?: CytoscapeOptions<NodeData>['elements']) => {
  if (!elements) {
    elements = { nodes: [], edges: [] };
  }
  cytoscape.use(dagre);
  const cy = cytoscape<NodeData>({
    elements,
    wheelSensitivity: 0.7, //TODO test with other mouses
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
        selector: 'node[label]',
        style: {
          label: 'data(label)',
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
      {
        selector: 'edge[label]',
        css: {
          label: 'data(label)',
          'text-rotation': 'autorotate',
          'text-margin-x': 0,
          'text-margin-y': 0,
        },
      },
      {
        selector: '.' + nodeStatesClasses.INITIAL_RECORD,
        style: {
          'border-width': '4px',
          'border-color': '#0066cc',
        },
      },
      {
        selector: '.' + nodeStatesClasses.PREPARING_UPSERT,
        style: {
          'background-color': '#6f99e8',
        },
      },
      {
        selector: '.' + nodeStatesClasses.UPSERTED,
        style: {
          'background-color': 'limegreen',
        },
      },
      {
        selector: '.' + nodeStatesClasses.SKIPPED,
        style: {
          'background-color': '#99ff99',
        },
      },
      {
        selector: '.' + nodeStatesClasses.ERROR,
        style: {
          'background-color': '#d40000',
        },
      },
    ],
    layout: LAYOUT_OPTIONS_DAGRE,
  });
  cy.on('add', 'node', (event) => {
    if (!isCytoNode(event.target)) {
      throw Error('Unexpected event should be on a node.');
    }
    if (event.target.data().nodeData.isInitialRecord) {
      event.target.addClass(nodeStatesClasses.INITIAL_RECORD);
    }
  });
  cy.on('data', 'node', (event, extraParams) => {
    // .. do nodeData changes then
    // you have to call the data function as such to trigger the event:
    // event.target.data('nodeData', event.target.data().nodeData);

    if (!isCytoNode(event.target)) {
      throw Error('Unexpected event, it should be on a node.');
    }
    const classes: string[] = [];
    if (event.target.data().nodeData.isInitialRecord) {
      classes.push(nodeStatesClasses.INITIAL_RECORD);
    }
    classes.push(nodeStatesClasses[event.target.data().nodeData.state]);
    event.target.classes(classes);
  });
  return cy;
};

export { getGraph, nodeStatesClasses };
