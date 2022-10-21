import { Record } from 'jsforce';

export class GraphBuilder {
  async build(initRecords: Record[]) {
    console.log('gboDebug:[initRecords]', initRecords);
  }
}
