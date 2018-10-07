// Required by V8 snapshot generator
if (!global.__extends) {
  global.__extends = function (d, b) {
      for (var p in b) {
          if (b.hasOwnProperty(p)) {
              d[p] = b[p];
          }
      }
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}

import * as tslib from "tslib";

// Bind the tslib helpers to global scope.
// This is needed when we don't use importHelpers, which
// breaks extending native-classes
for (const fnName of Object.keys(tslib)) {
  if (typeof tslib[fnName] !== "function") {
    continue;
  }

  if (fnName in global) {
    // Don't override globals that are already defined (ex. __extends)
    continue;
  }

  global[fnName] = tslib[fnName];
}
