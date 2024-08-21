import { Record } from '@jsforce/jsforce-node';
import { SfRecord } from 'src/models/types';

const errorMsg = (error: unknown) => {
  if (typeof error == 'string') {
    return error;
  } else if (error instanceof Error) {
    return error.message;
  } else {
    return JSON.stringify(error || 'empty error');
  }
};

function isSfRecord(record: Record): record is SfRecord {
  return record && !!record.Id && !!record.attributes;
}

export { errorMsg, isSfRecord };
