import proxy = require("ui/core/proxy");

export class View extends proxy.ProxyObject {
    public addToParent(parent: android.view.ViewGroup) {
        var nativeInstance: android.view.View = this["android"];
        if (nativeInstance) {
            // TODO: Check for existing parent
            parent.addView(nativeInstance);
        }
    }
}