import proxy = require("ui/core/proxy");
import application = require("application");

export class View extends proxy.ProxyObject {
    private _parent: Panel;

    public onInitialized(context: android.content.Context) {
        // TODO: This is used by Android, rethink this routine
    }
    
    public addToParent(native: any) {
        // TODO: Temporary
        if (application.ios && this.ios) {
            native.addSubview(this.ios);
            this.ios.sizeToFit();
        } else if (application.android && this.android) {
            native.addView(this.android);
        }
    }

    /**
    * Gets the Panel instance that parents this view. This property is read-only.
    */
    get parent(): Panel {
        return this._parent;
    }

    /**
    * Gets the android-specific native instance that lies behind this view. Will be available if running on an Android platform.
    */
    get android(): any {
        return undefined;
    }

    /**
    * Gets the ios-specific native instance that lies behind this view. Will be available if running on an Android platform.
    */
    get ios(): any {
        return undefined;
    }

    // TODO: Should these be public?
    public onAddedToParent(parent: Panel) {
        this._parent = parent;
        // TODO: Attach to parent - e.g. update data context, bindings, styling, etc.
    }

    public onRemovedFromParent() {
        this._parent = null;
        // TODO: Detach from parent.
    }
}

/**
* The Panel class represents an extended View which can have other views as children.
*/
export class Panel extends View {
    private _children: Array<View>;

    constructor() {
        super();

        this._children = new Array<View>();
    }

    public onInitialized(context: android.content.Context) {
        super.onInitialized(context);

        // delegate the initialized event to the children
        var i;
        for (i = 0; i < this._children.length; i++) {
            this._children[i].onInitialized(context);
        }
    }

    public addChild(child: View) {
        // Validate child is not parented
        if (child.parent) {
            var message;
            if (child.parent === this) {
                message = "View already added to this panel.";
            } else {
                message = "View is already a child of another panel.";
            }

            throw new Error(message);
        }

        this._children.push(child);
        child.onAddedToParent(this);
    }

    public removeChild(child: View) {
        if (!child) {
            return;
        }

        if (child.parent !== this) {
            throw new Error("View is not parented by this panel.");
        }

        var index = this._children.indexOf(child);
        if (index < 0) {
            throw new Error("View not found in children collection.");
        }

        this._children.splice(index, 1);
        child.onRemovedFromParent();
    }
}

export class StackPanel extends Panel {

}