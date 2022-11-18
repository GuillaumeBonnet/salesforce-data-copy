const mapStateToClass = {
  INITIAL_RECORD: 'node-initial-record',
  ERROR: 'node-error',
  PREPARING_UPSERT: 'node-preparing-upsert',
  UPSERTED: 'node-upsert',
  SKIPPED: 'node-skipped',
  CURRENT_NODE: 'current-node',
  NONE: '',
};

const LAYOUT_OPTIONS_DAGRE = {
  name: 'dagre',
  // dagre algo options, uses default value on undefined
  nodeSep: undefined, // the separation between adjacent nodes in the same rank
  edgeSep: undefined, // the separation between adjacent edges in the same rank
  rankSep: undefined, // the separation between each rank in the layout
  rankDir: undefined, // 'TB' for top to bottom flow, 'LR' for left to right,
  align: undefined, // alignment for rank nodes. Can be 'UL', 'UR', 'DL', or 'DR', where U = up, D = down, L = left, and R = right
  acyclicer: undefined, // If set to 'greedy', uses a greedy heuristic for finding a feedback arc set for a graph.
  // A feedback arc set is a set of edges that can be removed to make a graph acyclic.
  ranker: undefined, // Type of algorithm to assign a rank to each node in the input graph. Possible values: 'network-simplex', 'tight-tree' or 'longest-path'
  minLen: function (edge: any) {
    return 1;
  }, // number of ranks to keep between the source and target of the edge
  edgeWeight: function (edge: any) {
    return 1;
  }, // higher weight edges are generally made shorter and straighter than lower weight edges

  // general layout options
  fit: true, // whether to fit to viewport
  padding: 30, // fit padding
  spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
  nodeDimensionsIncludeLabels: true, // whether labels should be included in determining the space used by a node
  animate: false, // whether to transition the node positions
  animateFilter: function (node: any, i: any) {
    return true;
  }, // whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
  animationDuration: 500, // duration of animation in ms if enabled
  animationEasing: undefined, // easing of animation if enabled
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  transform: function (node: any, pos: any) {
    return pos;
  }, // a function that applies a transform to the final node position
  // ready: function () {}, // on layoutready
  // stop: function () {}, // on layoutstop
};
const LAYOUT_OPTIONS_GRAVITY = {
  // Called on `layoutready`
  ready: function () {
    console.log('gboDebug - ready');
  },
  // Called on `layoutstop`
  stop: function () {
    console.log('gboDebug - stop');
  },
  // 'draft', 'default' or 'proof"
  // - 'draft' fast cooling rate
  // - 'default' moderate cooling rate
  // - "proof" slow cooling rate
  quality: 'default',
  // Whether to include labels in node dimensions. Useful for avoiding label overlap
  nodeDimensionsIncludeLabels: false,
  // number of ticks per frame; higher is faster but more jerky
  refresh: 30,
  // Whether to fit the network view after when done
  fit: false,
  // Padding on fit
  padding: 10,
  // Whether to enable incremental mode
  randomize: true,
  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: 100000000,
  // Ideal (intra-graph) edge length
  idealEdgeLength: 100000,
  // Divisor to compute edge forces
  edgeElasticity: 0.1,
  // Nesting factor (multiplier) to compute ideal edge length for inter-graph edges
  nestingFactor: 0.2,
  // Gravity force (constant)
  gravity: 0.001,
  // Maximum number of iterations to perform
  numIter: 5000,
  // Whether to tile disconnected nodes
  tile: true,
  // Type of layout animation. The option set is {'during', 'end', false}
  animate: 'end',
  // Duration for animate:end
  animationDuration: 500,
  // Amount of vertical space to put between degree zero nodes during tiling (can also be a function)
  tilingPaddingVertical: 10,
  // Amount of horizontal space to put between degree zero nodes during tiling (can also be a function)
  tilingPaddingHorizontal: 10,
  // Gravity range (constant) for compounds
  gravityRangeCompound: 1.5,
  // Gravity force (constant) for compounds
  gravityCompound: 1.0,
  // Gravity range (constant)
  gravityRange: 3.8,
  // Initial cooling factor for incremental layout
  initialEnergyOnIncremental: 0.5,
};

const CYTOSCAPE_STYLESHEETS: cytoscape.Stylesheet[] = [
  // the stylesheet for the graph
  {
    selector: 'node',
    style: {
      'background-color': '#666',
      'border-width': '1px',
      label: 'data(id)',
    },
  },
  {
    selector: '.' + mapStateToClass.CURRENT_NODE,
    style: {
      'border-width': '4px',
    },
  },
  {
    selector: '.' + mapStateToClass.INITIAL_RECORD,
    style: {
      'border-width': '1px',
      'border-color': '#0066cc',
    },
  },
  {
    selector: '.' + mapStateToClass.PREPARING_UPSERT,
    style: {
      'background-color': '#6f99e8',
    },
  },
  {
    selector: '.' + mapStateToClass.UPSERTED,
    style: {
      'background-color': 'limegreen',
    },
  },
  {
    selector: '.' + mapStateToClass.SKIPPED,
    style: {
      'background-color': '#99ff99',
    },
  },
  {
    selector: '.' + mapStateToClass.ERROR,
    style: {
      'background-color': '#d40000',
    },
  },
  {
    selector: '.current-node',
    style: {
      'border-width': '6px',
      'border-color': '#42f4c5',
    },
  },
  {
    selector: 'node[label]',
    style: {
      label: 'data(label)',
    },
  },
  {
    selector: '.bottom-center',
    style: {
      'text-valign': 'bottom',
      'text-halign': 'center',
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
];

export {
  mapStateToClass,
  LAYOUT_OPTIONS_DAGRE,
  LAYOUT_OPTIONS_GRAVITY,
  CYTOSCAPE_STYLESHEETS,
};
