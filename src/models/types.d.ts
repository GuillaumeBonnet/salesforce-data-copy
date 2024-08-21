import { DescribeSObjectResult, Record } from '@jsforce/jsforce-node';

type SalesforceApiName = string;
type SfRecord = Required<Record>;

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
export { SalesforceApiName };

export type { SfRecord, LookupMetadata, CacheFieldsMetadata, OptionSandbox };
