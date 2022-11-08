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

type LookupMetadata = {
  name: string;
  sObjectsReferenced: string[];
};

type CacheLookupMetadata = {
  [lookupApiName: string]: LookupMetadata[];
};

export { SalesforceApiName, PermissionSetRawData, PermissionSet };

export type { SfRecord, CacheLookupMetadata, LookupMetadata };
