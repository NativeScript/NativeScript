/*!**********************************************************!*\
  !*** ../android-snapshot-bundle-preamble.js ***!
  \**********************************************************/
var global = Function('return this')(); global.global = global; // Mock global object
// Set the __snapshotEnabled flag to true
Object.defineProperty(global, "__snapshotEnabled", {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
});
// Set the __snapshot flag to true
Object.defineProperty(global, "__snapshot", {
    value: true,
    writable: false,
    configurable: true,
    enumerable: false
});

global.__requireOverride = (function() {
    return function(moduleId, dirname) {
        /*
        The android runtime loads in advance all JS modules that contain a native class successor generated statically at build time. 
        In case of snapshot this file always is the bundled one. Since it is snapshoted it is already loaded in the heap and is not meant
        to be required. The main entry file (bundle.js) is responsible for actually executing the modules containing native java classes.
        */
        var resolvedModuleId = moduleId.replace(/^\.\/tns_modules\//, "");
        if (resolvedModuleId === './_embedded_script_.js') {
            return {};
        }
    };
}());


