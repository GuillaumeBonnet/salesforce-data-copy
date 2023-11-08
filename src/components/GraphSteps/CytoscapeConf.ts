const mapStateToClass = {
  INITIAL_RECORD: 'node-initial-record',
  ERROR: 'node-error',
  PREPARING_UPSERT: 'node-preparing-upsert',
  UPSERTED: 'node-upsert',
  SKIPPED: 'node-skipped',
  CURRENT_NODE: 'current-node',
  NONE: '',
};

const LAYOUT_OPTIONS_COSE_BILKENT = {
  name: 'cose-bilkent',
  quality: 'default',
  // Whether to include labels in node dimensions. Useful for avoiding label overlap
  nodeDimensionsIncludeLabels: false,
  // number of ticks per frame; higher is faster but more jerky
  refresh: 30,
  // Whether to fit the network view after when done
  fit: true,
  // Padding on fit
  padding: 10,
  // Whether to enable incremental mode
  randomize: true,
  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: 4500,
  // Ideal (intra-graph) edge length
  idealEdgeLength: 50,
  // Divisor to compute edge forces
  edgeElasticity: 0.45,
  // Nesting factor (multiplier) to compute ideal edge length for inter-graph edges
  nestingFactor: 0.1,
  // Gravity force (constant)
  gravity: 0.25,
  // Maximum number of iterations to perform
  numIter: 2500,
  // Whether to tile disconnected nodes
  tile: true,
  // Type of layout animation. The option set is {'during', 'end', false}
  animate: false,
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

const LAYOUT_OPTIONS_FCOSE = {
  name: 'fcose',
  // 'draft', 'default' or 'proof'
  // - "draft" only applies spectral layout
  // - "default" improves the quality with incremental layout (fast cooling rate)
  // - "proof" improves the quality with incremental layout (slow cooling rate)
  quality: 'default',
  // Use random node positions at beginning of layout
  // if this is set to false, then quality option must be "proof"
  randomize: true,
  // Whether or not to animate the layout
  animate: false,
  // Duration of animation in ms, if enabled
  animationDuration: 1000,
  // Easing of animation, if enabled
  animationEasing: undefined,
  // Fit the viewport to the repositioned nodes
  fit: true,
  // Padding around layout
  padding: 30,
  // Whether to include labels in node dimensions. Valid in "proof" quality
  nodeDimensionsIncludeLabels: false,
  // Whether or not simple nodes (non-compound nodes) are of uniform dimensions
  uniformNodeDimensions: false,
  // Whether to pack disconnected components - cytoscape-layout-utilities extension should be registered and initialized
  packComponents: true,
  // Layout step - all, transformed, enforced, cose - for debug purpose only
  step: 'all',

  /* spectral layout options */

  // False for random, true for greedy sampling
  samplingType: true,
  // Sample size to construct distance matrix
  sampleSize: 25,
  // Separation amount between nodes
  nodeSeparation: 75,
  // Power iteration tolerance
  piTol: 0.0000001,

  /* incremental layout options */

  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: (node: any) => 4500,
  // Ideal edge (non nested) length
  idealEdgeLength: (edge: any) => 50,
  // Divisor to compute edge forces
  edgeElasticity: (edge: any) => 0.45,
  // Nesting factor (multiplier) to compute ideal edge length for nested edges
  nestingFactor: 0.1,
  // Maximum number of iterations to perform - this is a suggested value and might be adjusted by the algorithm as required
  numIter: 2500,
  // For enabling tiling
  tile: true,
  // The comparison function to be used while sorting nodes during tiling operation.
  // Takes the ids of 2 nodes that will be compared as a parameter and the default tiling operation is performed when this option is not set.
  // It works similar to ``compareFunction`` parameter of ``Array.prototype.sort()``
  // If node1 is less then node2 by some ordering criterion ``tilingCompareBy(nodeId1, nodeId2)`` must return a negative value
  // If node1 is greater then node2 by some ordering criterion ``tilingCompareBy(nodeId1, nodeId2)`` must return a positive value
  // If node1 is equal to node2 by some ordering criterion ``tilingCompareBy(nodeId1, nodeId2)`` must return 0
  tilingCompareBy: undefined,
  // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
  tilingPaddingVertical: 10,
  // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
  tilingPaddingHorizontal: 10,
  // Gravity force (constant)
  gravity: 0.25,
  // Gravity range (constant) for compounds
  gravityRangeCompound: 1.5,
  // Gravity force (constant) for compounds
  gravityCompound: 1.0,
  // Gravity range (constant)
  gravityRange: 3.8,
  // Initial cooling factor for incremental layout
  initialEnergyOnIncremental: 0.3,

  /* constraint options */

  // Fix desired nodes to predefined positions
  // [{nodeId: 'n1', position: {x: 100, y: 200}}, {...}]
  fixedNodeConstraint: undefined,
  // Align desired nodes in vertical/horizontal direction
  // {vertical: [['n1', 'n2'], [...]], horizontal: [['n2', 'n4'], [...]]}
  alignmentConstraint: undefined,
  // Place two nodes relatively in vertical/horizontal direction
  // [{top: 'n1', bottom: 'n2', gap: 100}, {left: 'n3', right: 'n4', gap: 75}, {...}]
  relativePlacementConstraint: undefined,
};
const LAYOUT_OPTIONS_COLA = {
  name: 'cola',
  animate: true, // whether to show the layout as it's running
  refresh: 1, // number of ticks per frame; higher is faster but more jerky
  maxSimulationTime: 4000, // max length in ms to run the layout
  ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
  fit: true, // on every layout reposition of nodes, fit the viewport
  padding: 30, // padding around the simulation
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node

  // layout event callbacks
  // ready: function () {}, // on layoutready
  // stop: function () {}, // on layoutstop

  // positioning options
  randomize: false, // use random node positions at beginning of layout
  avoidOverlap: true, // if true, prevents overlap of node bounding boxes
  handleDisconnected: true, // if true, avoids disconnected components from overlapping
  convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
  nodeSpacing: function (node: any) {
    return 10;
  }, // extra spacing around nodes
  flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
  alignment: undefined, // relative alignment constraints on nodes, e.g. {vertical: [[{node: node1, offset: 0}, {node: node2, offset: 5}]], horizontal: [[{node: node3}, {node: node4}], [{node: node5}, {node: node6}]]}
  gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]
  centerGraph: true, // adjusts the node positions initially to center the graph (pass false if you want to start the layout from the current position)

  // different methods of specifying edge length
  // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
  edgeLength: undefined, // sets edge length directly in simulation
  edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
  edgeJaccardLength: undefined, // jaccard edge length in simulation

  // iterations of cola algorithm; uses default values on undefined
  unconstrIter: undefined, // unconstrained initial layout iterations
  userConstIter: undefined, // initial layout iterations with user-specified constraints
  allConstIter: undefined, // initial layout iterations with all constraints including non-overlap
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
  nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node
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
  sort: undefined, // a sorting function to order the nodes and edges; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
  // because cytoscape dagre creates a directed graph, and directed graphs use the node order as a tie breaker when
  // defining the topology of a graph, this sort function can help ensure the correct order of the nodes/edges.
  // this feature is most useful when adding and removing the same nodes and edges multiple times in a graph.
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

const LAYOUT_OPTIONS_ELK = {
  name: 'elk',
  nodeDimensionsIncludeLabels: false, // Boolean which changes whether label dimensions are included when calculating node dimensions
  fit: false, // Whether to fit
  padding: 20, // Padding on fit
  animate: false, // Whether to transition the node positions
  animationDuration: 500, // Duration of animation in ms if enabled
  animationEasing: false, // Easing of animation if enabled
  ready: undefined, // Callback on layoutready
  stop: undefined, // Callback on layoutstop
  nodeLayoutOptions: undefined, // Per-node options function
  elk: {
    // All options are available at http://www.eclipse.org/elk/reference.html
    //
    // 'org.eclipse.' can be dropped from the identifier. The subsequent identifier has to be used as property key in quotes.
    // E.g. for 'org.eclipse.elk.direction' use:
    // 'elk.direction'
    //
    // Enums use the name of the enum as string e.g. instead of Direction.DOWN use:
    // 'elk.direction': 'DOWN'
    //
    // The main field to set is `algorithm`, which controls which particular layout algorithm is used.
    // Example (downwards layered layout):
    algorithm: 'mrtree',
    'elk.spacing.nodeNode': 2000,
    'elk.direction': 'RIGHT',
  },
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

const LAYOUT_OPTIONS_SPREAD = {
  name: 'spread',
  animate: true, // Whether to show the layout as it's running
  ready: undefined, // Callback on layoutready
  stop: undefined, // Callback on layoutstop
  fit: false, // Reset viewport to fit default simulationBounds
  minDist: 40, // Minimum distance between nodes
  padding: 20, // Padding
  expandingFactor: 40, // If the network does not satisfy the minDist
  // criterium then it expands the network of this amount
  // If it is set to -1.0 the amount of expansion is automatically
  // calculated based on the minDist, the aspect ratio and the
  // number of nodes
  prelayout: { name: 'cose' }, // Layout options for the first phase
  maxExpandIterations: 4, // Maximum number of expanding iterations
  boundingBox: undefined, // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  randomize: false, // Uses random initial node positions on true
};

const MAIN_LAYOUT = LAYOUT_OPTIONS_DAGRE;

export {
  mapStateToClass,
  LAYOUT_OPTIONS_DAGRE,
  LAYOUT_OPTIONS_GRAVITY,
  LAYOUT_OPTIONS_COLA,
  LAYOUT_OPTIONS_COSE_BILKENT,
  LAYOUT_OPTIONS_FCOSE,
  CYTOSCAPE_STYLESHEETS,
  MAIN_LAYOUT,
};
