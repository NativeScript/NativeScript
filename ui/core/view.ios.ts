import proxy = require("ui/core/proxy");

export class View extends proxy.ProxyObject {
    public addToParent(parent: UIKit.UIView) {
        var nativeInstance: UIKit.UIView = this["ios"];
        if (nativeInstance) {
            // TODO: Check for existing parent
            parent.addSubview(nativeInstance);
        }
    }
} 