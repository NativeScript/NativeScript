import appModule = require("application");
import common = require("connectivity/connectivity-common");
import utils = require("utils/utils");

global.moduleMerge(common, exports);

var WIFI = "WIFI";
var MOBILE = "MOBILE";

// Get Connection Type
function getConnectivityManager(): android.net.ConnectivityManager {
    return utils.ad.getApplicationContext().getSystemService(android.content.Context.CONNECTIVITY_SERVICE);
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