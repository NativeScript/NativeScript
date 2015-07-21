import appModule = require("application");
import common = require("connectivity/connectivity-common");

declare var exports;
require("utils/module-merge").merge(common, exports);

var WIFI = "WIFI";
var MOBILE = "MOBILE";

function getActiveNetworkInfo(): android.net.NetworkInfo {
    if (!appModule.android || !appModule.android.context) {
        return null;
    }

    return appModule.android.context.getSystemService(android.content.Context.CONNECTIVITY_SERVICE).getActiveNetworkInfo();
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