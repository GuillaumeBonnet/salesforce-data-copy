import { SfRecord } from 'src/models/types';
import cytoscape from 'cytoscape';

class NodeDataClass {
  constructor(
    public sourceData: SfRecord,
    public targetData: SfRecord = {
      Id: '',
      attributes: {
        type: sourceData.attributes.type,
        url: '',
      },
    },
    // public parentNodes: Array<Edge>,
    public state:
      | 'NONE'
      | 'PREPARING_UPSERT'
      | 'UPSERTED'
      | 'ERROR'
      | 'SKIPPED' = 'NONE',
    public isInitialRecord: boolean = false,
  ) {}

  public get sourceId() {
    return this.sourceData.Id;
  }
  get targetId() {
    if (!this.targetData?.Id) {
      return '';
    }
    return this.targetData.Id;
  }
  set targetId(value: string) {
    if (!this.targetData) {
      throw Error(
        "Can't set targetId because targetData has not been initialized.",
      );
    }
    this.targetData['Id'] = value;
  }
  get type() {
    if (!this.sourceData.attributes?.type) {
      throw Error('Record data should have an attribute.');
    }
    return this.sourceData.attributes.type;
  }

  get label() {
    return `[${this.type}] ${this.sourceData['Name'] || this.sourceId}`;
  }
}

interface NodeData {
  nodeData: NodeDataClass;
  label: string;
}
interface EdgeNotVisited {
  sourceId?: string;
  lookupId: string;
  targetObjectName: string;
  lookupName: string;
  isInitialRecord?: boolean;
}

function isCytoNode(node: any): node is cytoscape.NodeSingular<NodeData> {
  return (
    node && node.isNode && typeof node.isNode == 'function' && node.isNode()
  );
}
function isCytoEdge(edge: any): edge is cytoscape.EdgeSingular {
  return (
    edge && edge.isEdge && typeof edge.isEdge == 'function' && edge.isEdge()
  );
}
export { isCytoNode, isCytoEdge, NodeDataClass };
export type { NodeData, EdgeNotVisited };
