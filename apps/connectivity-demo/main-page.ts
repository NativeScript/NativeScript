import connectivity = require("connectivity");

export function onGetConnectionType(args) {
    var connectionType = connectivity.getConnectionType();
    switch (connectionType) {
        case connectivity.connectionType.none:
            args.object.text = "No connection";
            break;
        case connectivity.connectionType.wifi:
            args.object.text = "WiFi connection";
            break;
        case connectivity.connectionType.mobile:
            args.object.text = "Mobile connection";
            break;
    }
}