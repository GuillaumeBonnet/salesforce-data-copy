import { boot } from 'quasar/wrappers';
import { setCssVar } from 'quasar';

export default boot(({ app }) => {
  setCssVar('primary', '#1f0000');
});
