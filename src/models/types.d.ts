import { Fields } from '@salesforce/core';
import { Record, DescribeSObjectResult } from 'jsforce';

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

type LookupMetadata = {
  name: string;
  sObjectsReferenced: string[];
};

type CacheFieldsMetadata = {
  [SObjectName: string]: {
    lookupFields: LookupMetadata[];
    allFields: DescribeSObjectResult['fields'];
  };
};

type OptionSandbox = {
  label: string;
  value: string;
  isExpired: boolean;
};
export { SalesforceApiName, PermissionSetRawData, PermissionSet };

export type { SfRecord, LookupMetadata, CacheFieldsMetadata, OptionSandbox };
