import { NodeSingular } from 'cytoscape';
import { SaveResult, UpsertResult } from 'jsforce';
import { QVueGlobals } from 'quasar';
import { DTfieldName } from '../../../src-electron/frontEndApis/sfdx/PermissionSetHandler';
import { isCytoEdge, NodeData } from 'src/models/GraphTypes';
import { SfRecord } from 'src/models/types';
import { Log } from './Log';
import ProcessStopper from './ProcessStopper';
import { mapStateToClass } from './CytoscapeConf';

export default class GraphUpserter {
  constructor(
    private sourceGraph: cytoscape.Core<NodeData>,
    private $q: QVueGlobals
  ) {}
  public processStopper = new ProcessStopper();
  mapSObjectsWithDataTransField: { [key: string]: boolean } = {};
  ongoingCyclicPathUpserted: string[] = [];
  private _currentNodeId = '';
  currentUserInfo_To: Awaited<
    ReturnType<typeof window.electronApi.sfdx.currentUserInfo>
  > = { userId: '', username: '' };

  set currentNodeId(value) {
    if (this._currentNodeId) {
      this.sourceGraph
        .$id(this._currentNodeId)
        .removeClass(mapStateToClass.CURRENT_NODE);
    }
    this._currentNodeId = value;
    this.sourceGraph
      .$id(this._currentNodeId)
      .addClass(mapStateToClass.CURRENT_NODE);
  }
  get currentNodeId() {
    return this._currentNodeId;
  }

  async init() {
    this.currentUserInfo_To = await window.electronApi.sfdx.currentUserInfo(
      'TO'
    );
    const [, initialNodes] = await Promise.all([
      window.electronApi.sfdx.loadPermissionSetAndAssignement(
        this.currentUserInfo_To.userId
      ),
      this.sourceGraph.nodes(`node.${mapStateToClass.INITIAL_RECORD}`),
    ]);
    for (const node of initialNodes.toArray()) {
      await this.upsertNodeToTarget(node);
    }
  }

  async upsertNodeToTarget(currentNode: NodeSingular<NodeData>) {
    this.processStopper.abortIfNeeded();
    const currentNodeData = currentNode.data().nodeData;
    this.currentNodeId = currentNode.id();
    if (
      currentNodeData.state == 'UPSERTED' ||
      currentNodeData.state == 'SKIPPED'
    ) {
      Log.info('  The record has already been inserted during this run.');
      return;
    }
    if (
      currentNodeData.state == 'PREPARING_UPSERT' &&
      !this.ongoingCyclicPathUpserted.includes(currentNode.id())
    ) {
      await this.handleCyclicPath(currentNode);
      return; //if cycle is an Adress/Location it will be inserted by function above
    }
    // if (
    //   this.configData.sourceToTargetIdMappingOverride[
    //     currentNode.sourceData.Id
    //   ] != undefined
    // ) {
    //   currentNode.targetId =
    //     this.configData.sourceToTargetIdMappingOverride[
    //       currentNode.sourceData.Id
    //     ];
    //   this.changeNodeState(currentNode,'SKIPPED');
    //   return;
    // }
    Log.stepInGreen(
      'Prepare to upsert Node',
      `sourceRecordId:${currentNode.id()}, Object:${currentNodeData.type}`
    );
    this.changeNodeState(currentNode, 'PREPARING_UPSERT');

    if (!currentNode.id()) {
      this.changeNodeState(currentNode, 'ERROR');
      throw Error('sourceRecordId should have a value.');
    }
    currentNodeData.targetData = {
      attributes: {
        type: currentNodeData.type,
        url: '',
      },
      Id: '',
    };
    for (const edgeToParent of currentNode.outgoers().toArray()) {
      if (!isCytoEdge(edgeToParent)) {
        continue; // the currentNode is lumped into the result ouf outgoers (unexpected)
      }
      await this.upsertNodeToTarget(edgeToParent.target());
    }
    /* eslint-disable */
    // @ts-ignore
    if (currentNodeData.state == 'UPSERTED') {
      // if node is part of a cyclic path it will have already been inserted
      // in one of the this.upsertNodeToTarget() calls above
      return;
    }
    this.currentNodeId = currentNode.id();

    for (const edgeToParentRecord of currentNode.outgoers().toArray()) {
      if (!isCytoEdge(edgeToParentRecord)) {
        continue; // the currentNode is lumped into the result ouf outgoers (unexpected)
      }
      if (!edgeToParentRecord.target().data().nodeData.targetId) {
        // this.changeNodeState(currentNode,'ERROR');
        this.changeNodeState(edgeToParentRecord.target(), 'ERROR');
        throw Error(
          `The parentNode ${edgeToParentRecord
            .target()
            .id()} should have a targetId.`
        );
      }
      // switching lookup values from sourceOrgIds to targetOrgIds
      if (edgeToParentRecord.data().label == 'OwnerId') {
        if (
          edgeToParentRecord.target().data().nodeData.type == 'User' && // could be a queue
          !edgeToParentRecord.target().data().nodeData.targetData.IsActive
        ) {
          // inactive user cannot be owners
          currentNodeData.targetData['OwnerId'] =
            this.currentUserInfo_To.userId;
          continue;
        }
      }
      currentNodeData.targetData[edgeToParentRecord.data().label] =
        edgeToParentRecord.target().data().nodeData.targetId;
    }
    const currentNodeType = currentNodeData.type;
    if (currentNodeType == 'User') {
      // TODO username sandbox vs prod
      let userInTargetOrg: SfRecord;
      try {
        userInTargetOrg = await window.electronApi.sfdx.findUser(
          'TO',
          currentNodeData.sourceData.Username
        );
      } catch (err: any) {
        const answer = await new Promise((resolve, reject) => {
          const errorMsg = `User "${currentNodeData.sourceData.Username}" not found in org TO.`;
          this.$q
            .dialog({
              dark: true,
              title: errorMsg,
              message: `Use current user "${this.currentUserInfo_To.username}" instead ?`,
              cancel: true,
              persistent: true,
            })
            .onOk(() => {
              resolve('Ok');
            })
            .onOk(() => {
              resolve('Ok');
            })
            .onCancel(() => {
              reject(errorMsg);
            })
            .onDismiss(() => {
              reject(errorMsg);
            });
        });
        if (answer === 'Ok') {
          userInTargetOrg = await window.electronApi.sfdx.findUser(
            'TO',
            this.currentUserInfo_To.username
          );
        } else {
          throw Error(
            `User "${currentNodeData.sourceData.Username}" not found in org TO.`
          );
        }
        currentNodeData.targetData.IsActive = userInTargetOrg.IsActive;
      }
      currentNodeData.targetId = userInTargetOrg.Id;
      this.changeNodeState(currentNode, 'SKIPPED');
      return;
    } else if (currentNodeType == 'RecordType') {
      //TODO feature upsert recordTypes ?
      //  - IsPersonType force queried but is not creatable
      currentNodeData.targetId = currentNodeData.sourceId; // works because recordTypes ids are copied with org refreshes
      this.changeNodeState(currentNode, 'SKIPPED');
      return;
    } else if (
      [
        'Group',
        'BusinessProcess',
        'Campaign',
        'Product2',
        'ServiceReportLayout',
      ].includes(currentNodeType)
    ) {
      // a Queue is queried as a Group
      currentNodeData.targetId = currentNodeData.sourceId; // works when records have already been copied with org refreshes or manually
      this.changeNodeState(currentNode, 'SKIPPED');
      return;
    }

    for (const key of Object.keys(currentNodeData.sourceData)) {
      if (
        key != 'Id' &&
        currentNodeData.sourceData[key] !== null &&
        !currentNodeData.targetData[key] &&
        typeof currentNodeData.sourceData[key] != 'object' // there would be an error if fields like Owner.Type were copied: "INVALID_FIELD: Cannot specify both an external ID reference Owner and a salesforce id, OwnerId"
      ) {
        currentNodeData.targetData[key] = currentNodeData.sourceData[key];
      }
    }
    if (currentNodeType == 'Account') {
      const matchingRecordType = currentNode
        .connectedEdges()
        .toArray()
        .find((edge) => edge.data().label == 'RecordTypeId')
        ?.target();
      if (!matchingRecordType) {
        throw Error('matchingRecordType not found');
      }
      if (matchingRecordType.data().nodeData.sourceData['IsPersonType']) {
        delete currentNodeData.targetData['Name'];
        // only non PersonAccount Accounts have Name as a creatable field
      }
    }
    if (!this.mapSObjectsWithDataTransField[currentNodeType]) {
      await window.electronApi.sfdx.createDTField_InOrgTo(currentNodeType);
      this.mapSObjectsWithDataTransField[currentNodeType] = true;
    }

    currentNodeData.targetData[DTfieldName] = currentNodeData.sourceData.Id;
    currentNodeData.targetData.Id = '';
    Log.stepInGreen('Upserting an Object', currentNodeType);
    let result: UpsertResult | SaveResult;
    try {
      result = await window.electronApi.sfdx.upsertOrgTo(
        currentNodeData.targetData
      );
    } catch (error: unknown) {
      Log.info(`currentNode.sourceData: ${currentNodeData.sourceData}`);
      Log.info(`DTfieldName: ${DTfieldName}`);
      Log.info('data that failed the upsert:\n', currentNodeData.targetData);
      if ((error as any).name == 'DUPLICATES_DETECTED') {
        result = await this.handleDuplicateRuleError(error, currentNode);
      } else if (
        isUpsertError(error) &&
        error.message == 'That name is already taken.'
      ) {
        result = await this.handleDuplicateNameError(error, currentNode);
      } else if (isUpsertError(error) && error.errorCode == 'DUPLICATE_VALUE') {
        result = await this.handleDuplicateValueError(error, currentNode);
      } else {
        if (
          isUpsertError(error) &&
          error.errorCode == 'FIELD_CUSTOM_VALIDATION_EXCEPTION'
        ) {
          Log.warning(
            'You might need to activate a bypass mechanism to upsert this data.'
          );
        }
        if (isUpsertError(error) && error.errorCode == 'DUPLICATES_DETECTED') {
          Log.warning('A similar records already exists in the target org.');
        }
        this.changeNodeState(currentNode, 'ERROR');
        throw Error('' + error);
      }
    }
    if (Array.isArray(result)) {
      throw Error('Unexpected upsertion of an array.');
    }
    if (result.success) {
      Log.stepInGreen('upsert success', result.id);
      currentNodeData.targetId = result.id;
      this.changeNodeState(currentNode, 'UPSERTED');
    } else {
      Log.error('upsert failed');
      Log.info(`currentNode.sourceData: ${currentNodeData.sourceData}`);
      Log.info(`currentNode.targetData: ${currentNodeData.targetData}`);
      Log.info(`DTfieldName: ${DTfieldName}`);
      this.changeNodeState(currentNode, 'ERROR');
      throw Error('Upsert Error');
    }
  }

  changeNodeState(
    node: NodeSingular<NodeData>,
    state: NodeData['nodeData']['state']
  ) {
    node.removeClass(mapStateToClass[node.data().nodeData.state]);
    node.addClass(mapStateToClass[state]);
    node.data().nodeData.state = state;
  }

  async handleCyclicPath(currentNode: NodeSingular<NodeData>) {
    const cyclicPathError = () => {
      Log.error('Pontential cyclic path ?');
      this.changeNodeState(currentNode, 'ERROR');
      process.exit();
    };
    const currentNodeData = currentNode.data().nodeData;
    if (currentNodeData.sourceData.type == 'Address') {
      const locationLookup = currentNode
        .connectedEdges()
        .toArray()
        .find(
          (edge) =>
            edge.data().label == 'ParentId' &&
            edge.target().data().nodeData.type == 'Location'
        );
      if (!locationLookup) {
        cyclicPathError();
        return;
      }
      const addressLoopLookup = locationLookup
        .target()
        .connectedEdges()
        .toArray()
        .find((edge) => {
          return edge.target().id() == currentNodeData.sourceId;
        });
      if (!addressLoopLookup) {
        cyclicPathError();
        return;
      }
      await this.upsertLocationAddressCycle(
        locationLookup.target(),
        currentNode
      );
    } else if (currentNodeData.type == 'Location') {
      const addressLookup = currentNode
        .connectedEdges()
        .toArray()
        .find(
          (edge) =>
            edge.data().label == 'VisitorAddressId' &&
            edge.target().data().nodeData.type == 'Address'
        );
      if (!addressLookup) {
        cyclicPathError();
        return;
      }
      const locationLoopLookup = addressLookup
        .target()
        .connectedEdges()
        .toArray()
        .find((edge) => {
          return edge.target().id() == currentNodeData.sourceId;
        });
      if (!locationLoopLookup) {
        cyclicPathError();
        return;
      }
      await this.upsertLocationAddressCycle(
        addressLookup.target(),
        currentNode
      );
      return;
    }
    cyclicPathError();
  }

  async upsertLocationAddressCycle(
    location: NodeSingular<NodeData>,
    address: NodeSingular<NodeData>
  ) {
    Log.bigStep('Upserting a Location Address cycle');
    this.ongoingCyclicPathUpserted = [
      location.data().nodeData.sourceId,
      address.data().nodeData.sourceId,
    ];

    const edgeLocToAddres_asList = this.sourceGraph.edges(
      `[source = "${location.id()}"][target = "${address.id()}"]`
    );
    if (edgeLocToAddres_asList.size() != 1) {
      throw Error('Error parent addressNode not found');
    }
    const edgeLocToAddress = edgeLocToAddres_asList.toArray()[0];
    edgeLocToAddress.remove();
    delete location.data().nodeData.sourceData[edgeLocToAddress.data().label];
    await this.upsertNodeToTarget(location);
    await this.upsertNodeToTarget(address);
    this.sourceGraph.add(edgeLocToAddress);
    location.data().nodeData.sourceData[edgeLocToAddress.data().label] =
      address.id();
    location.data().nodeData.targetData.Id = ''; //TODO I'm not sure why we do this anymore
    location.data().nodeData.state = 'PREPARING_UPSERT';
    await this.upsertNodeToTarget(location);
    this.ongoingCyclicPathUpserted = [];
    Log.bigStep('Upserting a Location Address cycle: END');
  }

  async handleDuplicateNameError(
    error: UpsertError,
    currentNode: NodeSingular<NodeData>
  ) {
    Log.warning(
      'A similar records already exists in the target org with the same name.'
    );
    const currentNodeData = currentNode.data().nodeData;
    const recordToWriteOver = (
      await window.electronApi.sfdx.queryWithAllCreatableFields(
        'TO',
        currentNode.data().nodeData.type,
        `WHERE Name = '${currentNodeData.targetData.Name}'`
      )
    )[0];
    return await this.updateRecordIfConfirmed(
      recordToWriteOver.Id,
      recordToWriteOver,
      currentNodeData.targetData
    );
  }
  async handleDuplicateValueError(
    error: UpsertError,
    currentNode: NodeSingular<NodeData>
  ) {
    Log.warning('A similar records already exists in the target org.');
    const currentNodeData = currentNode.data().nodeData;
    const id = error.message.split('id: ')[1].split(', ')[0];
    const recordToWriteOver = (
      await window.electronApi.sfdx.queryWithAllCreatableFields(
        'TO',
        currentNodeData.type,
        `WHERE Id = '${id}'`
      )
    )[0];
    return await this.updateRecordIfConfirmed(
      id,
      recordToWriteOver,
      currentNodeData.targetData
    );
  }
  async handleDuplicateRuleError(
    error: any,
    currentNode: NodeSingular<NodeData>
  ) {
    Log.warning(
      'A similar records already exists in the target org(duplicate rule).'
    );
    const currentNodeData = currentNode.data().nodeData;
    const id =
      error?.duplicateResut?.matchResults[0]?.matchRecords[0]?.record?.Id;
    //TODO multiple results handling with arrays
    if (!id) {
      throw new Error('Id could not be extracted from matching rule error.');
    }
    const recordToWriteOver = (
      await window.electronApi.sfdx.queryWithAllCreatableFields(
        'TO',
        currentNodeData.type,
        `WHERE Id = '${id}'`
      )
    )[0];
    return await this.updateRecordIfConfirmed(
      id,
      recordToWriteOver,
      currentNodeData.targetData
    );
  }
  async updateRecordIfConfirmed(
    idInTarget: string,
    dataToReplace: SfRecord,
    dataThatReplaces: SfRecord
  ) {
    let fieldDifferences = 'FieldName: (current value) => (future value)\n';
    for (const fieldName of Object.keys(dataThatReplaces)) {
      if (fieldName == 'attributes') {
        continue;
      }
      fieldDifferences += ` ${fieldName}: (${dataToReplace[fieldName]}) => (${dataThatReplaces[fieldName]})\n`;
    }
    const recordUpdated = await new Promise<SaveResult>((resolve, reject) => {
      this.$q
        .dialog({
          title: 'Update record ?',
          message: `Update following record(id: ${idInTarget}) that has not been inserted by the script ?
        ${fieldDifferences}`,
          cancel: true,
          persistent: true,
        })
        .onOk(async () => {
          resolve(
            await window.electronApi.sfdx.updateOrgTo({
              ...dataThatReplaces,
              Id: idInTarget,
            })
          );
        })
        .onOk(() => {
          // console.log('>>>> second OK catcher')
        })
        .onCancel(() => {
          reject('User declined to update an existing record.');
        })
        .onDismiss(() => {
          reject('User declined to update an existing record.');
        });
    });
    return recordUpdated;
  }
}
interface UpsertError {
  name: string;
  errorCode: string;
  message: string;
  //fields: Array<Object>;
}

const isUpsertError = (value: unknown): value is UpsertError => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'errorCode' in value &&
    'message' in value
  );
};
