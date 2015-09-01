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

export var test_DummyTestForSnippetOnly1 = function () {
    // <snippet module="connectivity" title="connectivity">
    // ### Monitoring connection type.
    // ``` JavaScript
    connectivity.startMonitoring(function onConnectionTypeChanged(newConnectionType: number) {
        switch (newConnectionType) {
            case connectivity.connectionType.none:
                ////console.log("Connection type changed to none.");
                break;
            case connectivity.connectionType.wifi:
                ////console.log("Connection type changed to WiFi.");
                break;
            case connectivity.connectionType.mobile:
                ////console.log("Connection type changed to mobile.");
                break;
        }
    });
    ////...
    connectivity.stopMonitoring();
    // ```
    // </snippet>
}