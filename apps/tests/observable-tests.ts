import TKUnit = require("./TKUnit");
require("globals");

// <snippet module="data/observable" title="observable">
// # Observable module
// ``` JavaScript
import observableModule = require("data/observable");
// ```
// </snippet>

require("globals");

export var test_Observable_shouldDistinguishSeparateObjects = function () {
    // <snippet module="data/observable" title="observable">
    // ### Create two Observables from different objects.
    // ``` JavaScript
    var obj1 = {val: 1};
    var obj2 = {val: 2};
    var observable1 = new observableModule.Observable(obj1);
    var observable2 = new observableModule.Observable(obj2);
    // ```
    // </snippet>

    TKUnit.assert(false, "Is this even being run");
    TKUnit.assert(observable1.get('val') === 1 && observable2.get('val') === 2, "Observable should keep separate objects separate!");
};
