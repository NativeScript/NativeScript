import { getNativeApplication, android as androidApp} from "application";

export const enum connectionType {
    none = 0,
    wifi = 1,
    mobile = 2,
}

const wifi = "wifi";
const mobile = "mobile";

// Get Connection Type
function getConnectivityManager(): android.net.ConnectivityManager {
    return getNativeApplication().getApplicationContext().getSystemService(android.content.Context.CONNECTIVITY_SERVICE);
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
        return connectionType.none;
    }

    let type = activeNetworkInfo.getTypeName().toLowerCase();
    if (type.indexOf(wifi) !== -1){
        return connectionType.wifi;
    }
    
    if (type.indexOf(mobile) !== -1){
        return connectionType.mobile;
    }
        
    return connectionType.none;
}

export function startMonitoring(connectionTypeChangedCallback: (newConnectionType: number) => void): void {
    let onReceiveCallback = function onReceiveCallback(context: android.content.Context, intent: android.content.Intent) {
        let newConnectionType = getConnectionType();
        connectionTypeChangedCallback(newConnectionType);
    }
    androidApp.registerBroadcastReceiver(android.net.ConnectivityManager.CONNECTIVITY_ACTION, onReceiveCallback);
}

export function stopMonitoring(): void {
    androidApp.unregisterBroadcastReceiver(android.net.ConnectivityManager.CONNECTIVITY_ACTION);
}
