// TODO: this is needed because the polyfills are now evaluated eagerly, so we need to polyfill this first, unfortunately.

import { installPolyfillsFromModule } from './utils';
import * as xhrImpl from '../../xhr';

installPolyfillsFromModule(xhrImpl, ['XMLHttpRequest', 'FormData', 'Blob', 'File', 'FileReader']);
