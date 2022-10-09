import { DataGraph } from './DataGraph';
import { GraphNode } from './GraphNode';

declare module 'cytoscape-dagre';

interface ConfigData {
  orgAliases: {
    source: string;
    target: string;
  };
  initialConditions: InitConditions;
  sourceToTargetIdMappingOverride: {
    [sourceId: string]: string;
  };
  displayGraphOnError: boolean;
  simulateUpsert: boolean;
}
interface InitConditions {
  sObjectName: string;
  whereClause: string;
}

interface EdgeNotVisited {
  lookupId: string;
  targetObjectName: string;
  lookupName: string;
}

type Edge = EdgeNotVisited;

interface SobjectData {
  attributes: {
    type: string;
    url: string;
  };
  [key: string]: string;
}

type SalesforceApiName = string;

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

type NodeStateChange = Omit<GraphNode, 'sourceId' | 'targetId' | 'type'> & {
  changeType: 'NODE_STATE_CHANGE';
};
type WholeGraphChange = {
  changeType: 'WHOLE_GRAPH_CHANGE';
  graph: DataGraph;
};
type CurrentNodeChange = {
  changeType: 'CURRENT_NODE_CHANGE';
  nodeId: string;
};
type WebSocketMessage = NodeStateChange | WholeGraphChange | CurrentNodeChange;

export {
  ConfigData,
  InitConditions,
  Edge,
  EdgeNotVisited,
  SobjectData,
  SalesforceApiName,
  PermissionSetRawData,
  PermissionSet,
  WebSocketMessage,
  NodeStateChange,
  WholeGraphChange,
};
