console.log('Loading inspector modules...');
import { initGlobal } from './globals';
if (!(<any>global).hasInitGlobal) {
  initGlobal();
}
require('./debugger/webinspector-network');
require('./debugger/webinspector-dom');
require('./debugger/webinspector-css');
console.log('Finished loading inspector modules.');
