import { DataGraph } from './DataGraph';
import { Record } from 'jsforce';

declare module 'cytoscape-dagre';

type SalesforceApiName = string;
type SfRecord = Required<Record>;

type PermissionSetRawData = {
  fullName?: string;
  fieldPermissions?:
    | { [key: string]: string }
    | Array<{ [key: string]: string }>;
};

type PermissionSet = {
  fullName: string;
  fieldPermissions: Array<{ [key: string]: string }>;
};

// type NodeStateChange = Omit<GraphNode, 'sourceId' | 'targetId' | 'type'> & {
//   changeType: 'NODE_STATE_CHANGE';
// };
type WholeGraphChange = {
  changeType: 'WHOLE_GRAPH_CHANGE';
  graph: DataGraph;
};
type CurrentNodeChange = {
  changeType: 'CURRENT_NODE_CHANGE';
  nodeId: string;
};
// type WebSocketMessage = NodeStateChange | WholeGraphChange | CurrentNodeChange;

export {
  SalesforceApiName,
  PermissionSetRawData,
  PermissionSet,
  // WebSocketMessage,
  // NodeStateChange,
  WholeGraphChange,
};

export type { SfRecord };
