// <snippet module="connectivity" title="connectivity">
// # Connectivity
// Obtaining connectivity information requires the "connectivity" module.
// ``` JavaScript
import connectivity = require("connectivity");
// ```
// </snippet>

export var test_DummyTestForSnippetOnly0 = function () {
    // <snippet module="connectivity" title="connectivity">
    // ### Getting connection type
    // ``` JavaScript
    var connectionType = connectivity.getConnectionType();
    switch (connectionType) {
        case connectivity.connectionType.none:
            ////console.log("No connection");
            break;
        case connectivity.connectionType.wifi:
            ////console.log("WiFi connection");
            break;
        case connectivity.connectionType.mobile:
            ////console.log("Mobile connection");
            break;
    }
    // ```
    // </snippet>
}