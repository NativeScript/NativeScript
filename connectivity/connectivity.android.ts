import appModule = require("application");
import common = require("connectivity/connectivity-common");

declare var exports;
require("utils/module-merge").merge(common, exports);

var WIFI = "WIFI";
var MOBILE = "MOBILE";

// Get Connection Type
function getConnectivityManager(): android.net.ConnectivityManager {
    if (!appModule.android || !appModule.android.context) {
        return null;
    }

    return appModule.android.context.getSystemService(android.content.Context.CONNECTIVITY_SERVICE);
}

function getActiveNetworkInfo(): android.net.NetworkInfo {
    var connectivityManager = getConnectivityManager();
    if (!connectivityManager) {
        return null;
    }

    return connectivityManager.getActiveNetworkInfo();
}

export function getConnectionType(): number {
    var activeNetworkInfo = getActiveNetworkInfo();
    if (!activeNetworkInfo || !activeNetworkInfo.isConnected()) {
        return common.connectionType.none;
    }

    var connectionType = activeNetworkInfo.getTypeName();
    switch (connectionType) {
        case WIFI:
            return common.connectionType.wifi;
        case MOBILE:
            return common.connectionType.mobile;
    }
}

export function starMonitoring(connectionTypeChangedCallback: (newConnectionType: number) => void): void {
    var onReceiveCallback = function onReceiveCallback(context: android.content.Context, intent: android.content.Intent) {
        var newConnectionType = getConnectionType();
        connectionTypeChangedCallback(newConnectionType);
    }
    appModule.android.registerBroadcastReceiver(android.net.ConnectivityManager.CONNECTIVITY_ACTION, onReceiveCallback);
}

export function stopMonitoring(): void {
    appModule.android.unregisterBroadcastReceiver(android.net.ConnectivityManager.CONNECTIVITY_ACTION);
}