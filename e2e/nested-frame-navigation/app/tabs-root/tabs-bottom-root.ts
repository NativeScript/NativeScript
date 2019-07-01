import * as application from "tns-core-modules/application";

export function onReset() {
    application._resetRootView({ moduleName: "app-root" });
}
