import cytoscape, { CytoscapeOptions, ElementsDefinition } from 'cytoscape';
import { isCytoNode, NodeData } from 'src/models/GraphTypes';
import {
  CYTOSCAPE_STYLESHEETS,
  LAYOUT_OPTIONS_DAGRE,
  mapStateToClass,
  LAYOUT_OPTIONS_COLA,
  LAYOUT_OPTIONS_COSE_BILKENT,
  MAIN_LAYOUT,
} from './CytoscapeConf';

import dagre from 'cytoscape-dagre';
import cola from 'cytoscape-cola';
import coseBilkent from 'cytoscape-cose-bilkent';
import fcose from 'cytoscape-fcose';
import elk from 'cytoscape-elk';
import spread from 'cytoscape-spread';

const getGraph = (elements?: CytoscapeOptions['elements']) => {
  if (!elements) {
    elements = { nodes: [], edges: [] };
  }
  cytoscape.use(dagre);
  // cytoscape.use(cola);
  // cytoscape.use(coseBilkent);
  // cytoscape.use(fcose);
  // cytoscape.use(spread);
  const cy = cytoscape({
    elements,
    style: CYTOSCAPE_STYLESHEETS,
    layout: MAIN_LAYOUT,
  });
  cy.on('add', 'node', (event) => {
    if (!isCytoNode(event.target)) {
      throw Error('Unexpected event should be on a node.');
    }
    if ((event.target.data() as NodeData).sdcData.isInitialRecord) {
      event.target.addClass(mapStateToClass.INITIAL_RECORD);
    }
  });
  cy.on('data', 'node', (event, extraParams) => {
    // .. do sdcData changes then
    // you have to call the data function as such to trigger the event:
    // event.target.data('sdcData', event.target.data().sdcData);

    if (!isCytoNode(event.target)) {
      throw Error('Unexpected event, it should be on a node.');
    }
    const isCurrentNode = event.target.hasClass(mapStateToClass.CURRENT_NODE);
    const classes: string[] = [];
    const nodeData: NodeData = event.target.data();
    if (nodeData.sdcData.isInitialRecord) {
      classes.push(mapStateToClass.INITIAL_RECORD);
    }
    if (isCurrentNode) {
      classes.push(mapStateToClass.CURRENT_NODE);
    }
    classes.push(mapStateToClass[nodeData.sdcData.state]);
    event.target.classes(classes);
  });
  return cy;
};

export { getGraph };
