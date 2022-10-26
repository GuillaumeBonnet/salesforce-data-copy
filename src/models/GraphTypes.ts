import { SfRecord } from 'app/src-electron/sfdxUtils';

export class NodeData {
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
    public isInitialRecord: boolean = false
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
        "Can't set targetId because targetData has not been initialized."
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
}

interface EdgeNotVisited {
  lookupId: string;
  targetObjectName: string;
  lookupName: string;
}

export type { EdgeNotVisited };
