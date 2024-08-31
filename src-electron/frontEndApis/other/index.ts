import { shell } from 'electron';
import { cp } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';

const allowedLinks = [
  'https://github.com/GuillaumeBonnet/salesforce-data-copy',
  'https://www.npmjs.com/package/@salesforce/core',
  'https://www.npmjs.com/package/cytoscape',
  'https://quasar.dev/',
  'https://vuejs.org/',
  'https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode',
  'https://developer.salesforce.com/tools/salesforcecli',
] as const;
export default {
  openLink: (url: (typeof allowedLinks)[number]) => {
    if (allowedLinks.includes(url)) {
      shell.openExternal(url);
    }
  },
  getLicenceContent: () => {
    return readFile(path.join('.', '/LICENSE.MD'), 'utf-8');
  },
};
