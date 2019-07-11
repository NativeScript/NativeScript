import "./core";

import "./polyfills/timers";
import "./polyfills/dialogs";
import "./polyfills/xhr";
import "./polyfills/fetch";

import "./decorators";

// This is probably not needed any more
if ((<any>global).__snapshot || (<any>global).__snapshotEnabled) {
    // Object.assign call will fire an error when trying to write to a read-only property of an object, such as 'console'
    const consoleModule = require("console").Console;
    global.console = global.console || new consoleModule();
}
