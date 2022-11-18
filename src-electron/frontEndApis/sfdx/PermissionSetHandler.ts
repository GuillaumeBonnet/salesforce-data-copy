import { Connection } from '@salesforce/core';
import { Log } from 'src/components/GraphSteps/Log';
import { PermissionSet, CustomField } from 'jsforce/api/metadata';

const permissionSetDefinition = {
  fullName: 'DataTransfer',
  label: 'Data Transfer',
};

const fieldVersion = '1';
const DTfieldName = 'DataTransferSourceId__c';
class PermissionSetHandler {
  constructor(
    private connectionToOrg: Connection,
    private currentUserId: string
  ) {}
  permissionSet!: PermissionSet;

  async init() {
    this.permissionSet = await this.loadPermissionSetAndAssignement();
  }

  async loadPermissionSetAndAssignement() {
    try {
      const permissionSetInOrg = await this.retrievePermissionset();
      return permissionSetInOrg;
    } catch (e) {
      Log.warning('permission set not in org');
    }
    const permissionSetName = await this.permissionSetCreation();

    const permissionSetId = await this.connectionToOrg.query(
      `SELECT Id FROM PermissionSet WHERE Name = '${permissionSetName}' LIMIT 1`
    ).records[0].Id;

    const permissionSetAssignment = {
      attributes: {
        type: 'PermissionSetAssignment',
        url: 'fakeUrl',
      },
      AssigneeId: this.currentUserId,
      PermissionSetId: permissionSetId,
    };

    const createPermSetAssResult = await this.connectionToOrg.create(
      'PermissionSetAssignment ',
      permissionSetAssignment
    );
    if (createPermSetAssResult.success) {
      const permissionSetInOrg = await this.retrievePermissionset();
      return permissionSetInOrg;
    }
    throw Error('Error creating permissionSetAssignment.');
  }

  async permissionSetCreation() {
    const creationPermSetResult = await this.connectionToOrg.metadata.create(
      'PermissionSet',
      permissionSetDefinition
    );
    Log.stepInGreen('creationPermSetResult', creationPermSetResult);
    if (creationPermSetResult.success) {
      return creationPermSetResult.fullName;
    } else {
      throw Error('PermissionSet DataTransfer could not be created.');
    }
  }

  async retrievePermissionset() {
    const retrievedPermSet = await this.connectionToOrg.metadata.read(
      'PermissionSet',
      permissionSetDefinition.fullName
    );
    // permissionSetInOrg = {} if the permission doesn't exists
    // fieldPermissions:
    //    - doesn't exists if there is not fields
    //    - is an object if there is one field
    //    - is an array if there is more than one field
    if (!retrievedPermSet.fullName) {
      throw Error('Permission set does not exist in target org.');
    }
    if (!retrievedPermSet.fieldPermissions) {
      retrievedPermSet.fieldPermissions = [];
    }
    if (!Array.isArray(retrievedPermSet.fieldPermissions)) {
      retrievedPermSet.fieldPermissions = [retrievedPermSet.fieldPermissions];
    }
    return retrievedPermSet;
  }

  async addFieldToPermissionSet(SObjectType: string, fieldName: string) {
    const existingNode = this.permissionSet.fieldPermissions.find(
      (permission) => permission.field == `${SObjectType}.${fieldName}`
    );
    if (
      existingNode &&
      existingNode.readable == true &&
      existingNode.editable == true
    ) {
      return;
    }
    if (existingNode) {
      existingNode.readable = true;
      existingNode.editable = true;
    } else {
      this.permissionSet.fieldPermissions.push({
        editable: true,
        field: `${SObjectType}.${fieldName}`,
        readable: true,
      });
    }
    const updatePermSetResult = await this.connectionToOrg.metadata.update(
      'PermissionSet',
      this.permissionSet
    );
    if (!updatePermSetResult.success) {
      throw Error(
        'Error updating Data Transfert PermissionSet, errors:' +
          JSON.stringify(updatePermSetResult.errors)
      );
    }
    Log.stepInGreen('updatePermSetResult', updatePermSetResult);
  }

  async createDTField_InOrgTo(SObjectType: string) {
    const fieldMetadata: CustomField = {
      fullName: `${SObjectType}.${DTfieldName}`,
      caseSensitive: true,
      description: `(v${fieldVersion}) Field created by the Data Transfert Script. It is used to know the source recordId a record has been copied from.`,
      externalId: true,
      label: 'Data Transfert Source Id',
      length: 255,
      type: 'Text',
      unique: true,
      summaryFilterItems: [],
    };
    const checkingIfFieldExists = async () => {
      Log.stepInGreen(
        `checking if field ${fieldMetadata.fullName} exist in target org`
      );
      const resultReadField = await this.connectionToOrg.metadata.read(
        'CustomField',
        fieldMetadata.fullName as string
      );
      if (!resultReadField.fullName) {
        throw Error(
          `The CustomField ${fieldMetadata.fullName} doesn't exist in the target org. It is going to be created.`
        );
      } else {
        Log.info(
          `[checking if field ${fieldMetadata.fullName} exist in target org] => yes it does`
        );
        return;
      }
    };

    const creatingTheField = async () => {
      Log.stepInGreen('creatingTheField', fieldMetadata.fullName);
      return await this.connectionToOrg.metadata.create(
        'CustomField',
        fieldMetadata
      );
    };

    try {
      await checkingIfFieldExists();
    } catch (e) {
      Log.warning('field not found in target org');
      await creatingTheField();
    }
    await this.addFieldToPermissionSet(SObjectType, DTfieldName);
  }
}
export { DTfieldName, PermissionSetHandler };
