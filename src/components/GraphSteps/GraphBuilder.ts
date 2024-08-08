import { Log } from './Log';
import { Core } from 'cytoscape';
import { EdgeNotVisited, NodeData, NodeDataClass } from 'src/models/GraphTypes';
import { LookupMetadata, SfRecord } from 'src/models/types';
import ProcessStopper from './ProcessStopper';
import { MAIN_LAYOUT } from './CytoscapeConf';

export class GraphBuilder {
  public processStopper = new ProcessStopper();
  async build(initRecords: SfRecord[], graph: Core<NodeData>) {
    /**
     * @description actually it's edges to nodes that aren't visited
     */
    const edgesNotVisited: Array<EdgeNotVisited> = [];

    for (const recordData of initRecords) {
      if (!recordData.Id || !recordData.attributes) {
        throw Error('recordData should have an Id and an attributes property');
      }
      edgesNotVisited.push({
        lookupId: recordData.Id,
        targetObjectName: recordData.attributes.type,
        lookupName: 'Id',
        isInitialRecord: true,
      });
      // the initial records will be queried twice but it doesn't matter
      // compared to the number of SOQL that will be done anyway
    }
    while (edgesNotVisited.length != 0) {
      this.processStopper.abortIfNeeded();
      const lookupEdge = edgesNotVisited.shift();
      if (!lookupEdge) {
        throw Error('Error when de-queueing edgesNotVisited.');
      }
      if (graph.hasElementWithId(lookupEdge.lookupId)) {
        Log.info(
          `Record ${lookupEdge.targetObjectName}:${lookupEdge.lookupId} already queried before during the run.`
        );
        if (lookupEdge.sourceId) {
          Log.info('Creating edge');
          graph.add({
            group: 'edges',
            data: {
              source: lookupEdge.sourceId,
              target: lookupEdge.lookupId,
              label: lookupEdge.lookupName,
            },
          });
        }
        continue;
      }
      const nextRecordData = (
        await window.electronApi.sfdx.queryWithAllCreatableFields(
          'FROM',
          lookupEdge.targetObjectName,
          `Id = '${lookupEdge.lookupId}'`
        )
      )[0];

      if (!nextRecordData) {
        throw Error('Querry returned nothing.');
      }

      const nextRecordNode = new NodeDataClass(nextRecordData);
      if (lookupEdge.isInitialRecord) {
        // in this case it's not an edge but the queue if just filled to initiate the algorithm
        nextRecordNode.isInitialRecord = true;
      }
      graph.add({
        group: 'nodes',
        data: {
          id: nextRecordNode.sourceData.Id,
          nodeData: nextRecordNode,
          label: nextRecordNode.label,
        },
      });
      if (lookupEdge.sourceId) {
        graph.add({
          group: 'edges',
          data: {
            source: lookupEdge.sourceId,
            target: lookupEdge.lookupId,
            label: lookupEdge.lookupName,
          },
        });
      }
      graph
        .layout({
          name: MAIN_LAYOUT.name,
        })
        .run();

      if (
        lookupEdge.targetObjectName == 'User' ||
        lookupEdge.targetObjectName == 'Group' ||
        lookupEdge.targetObjectName == 'Queue'
      ) {
        continue;
      }
      const lookUpFields =
        await window.electronApi.sfdx.lookupsMetadataOfSobject(
          'FROM',
          lookupEdge.targetObjectName
        );

      for (const lookupField of lookUpFields) {
        const lookupValue = nextRecordNode.sourceData[lookupField.name];
        if (!lookupValue) {
          continue;
        }
        const getTargetObjectName = (lookupField: LookupMetadata) => {
          if (lookupField.sObjectsReferenced.length == 1) {
            return lookupField.sObjectsReferenced[0];
          } else if (lookupField.name == 'DelegatedApproverId') {
            return 'User'; // can't query DelegatedApprover.Type so we bet on user but we should check the id prefix instead.
          } else {
            const lookupField_WithoutId = lookupField.name.replace(/id$/gi, '');
            return (
              (nextRecordNode.sourceData[lookupField_WithoutId] as any).Type ||
              'User'
            );
          }
        };
        const newEdgeToVisit: EdgeNotVisited = {
          sourceId: nextRecordNode.sourceId,
          lookupId: lookupValue,
          targetObjectName: getTargetObjectName(lookupField),
          lookupName: lookupField.name,
        };
        edgesNotVisited.push(newEdgeToVisit);
        Log.stepInGreen(
          '   adding lookup to the queue: ',
          `${newEdgeToVisit.lookupName}(${newEdgeToVisit.targetObjectName})`
        );
      }
    }
  }
}
