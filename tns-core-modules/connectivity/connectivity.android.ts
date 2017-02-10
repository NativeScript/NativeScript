import * as appModule from "application";
import * as common from "./connectivity-common";
import * as utils from "utils/utils";

global.moduleMerge(common, exports);

let wifi = "wifi";
let mobile = "mobile";

// Get Connection Type
function getConnectivityManager(): android.net.ConnectivityManager {
    return utils.ad.getApplicationContext().getSystemService(android.content.Context.CONNECTIVITY_SERVICE);
}

function getActiveNetworkInfo(): android.net.NetworkInfo {
    let connectivityManager = getConnectivityManager();
    if (!connectivityManager) {
        return null;
    }

    return connectivityManager.getActiveNetworkInfo();
}

export function getConnectionType(): number {
    let activeNetworkInfo = getActiveNetworkInfo();
    if (!activeNetworkInfo || !activeNetworkInfo.isConnected()) {
        return common.connectionType.none;
    }

    let connectionType = activeNetworkInfo.getTypeName().toLowerCase();
    if (connectionType.indexOf(wifi) !== -1){
        return common.connectionType.wifi;
    }
    
    if (connectionType.indexOf(mobile) !== -1){
        return common.connectionType.mobile;
    }
        
    return common.connectionType.none;
}

export function startMonitoring(connectionTypeChangedCallback: (newConnectionType: number) => void): void {
    let onReceiveCallback = function onReceiveCallback(context: android.content.Context, intent: android.content.Intent) {
        let newConnectionType = getConnectionType();
        connectionTypeChangedCallback(newConnectionType);
    }
    appModule.android.registerBroadcastReceiver(android.net.ConnectivityManager.CONNECTIVITY_ACTION, onReceiveCallback);
}

export function stopMonitoring(): void {
    appModule.android.unregisterBroadcastReceiver(android.net.ConnectivityManager.CONNECTIVITY_ACTION);
}
