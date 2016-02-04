import types = require("utils/types");
import {View} from "ui/core/view";
import definition = require("ui/proxy-view-container");
import trace = require("trace");
import {LayoutBase} from "ui/layouts/layout-base";
/**
 * Proxy view container that adds all its native children directly to the parent. 
 * To be used as a logical grouping container of views.
 */
// Cases to cover:
// * Child is added to the attached proxy. Handled in _addViewToNativeVisualTree.
// * Proxy (with children) is added to the DOM.
//   - IOS: Handled in _addToSuperview - when the proxy is added, it adds all its children to the new parent.
//   - Android: _onAttached calls _addViewToNativeVisualTree recursively when the proxy is added to the parent.
// * Child is removed from attached proxy. Handled in _removeViewFromNativeVisualTree.
// * Proxy (with children) is removed form the DOM.
//   - IOS: Handled in _removeFromSuperview - when the proxy is removed, it removes all its children from its parent.
//   - Android: _onDetached calls _removeViewFromNativeVisualTree recursively when the proxy is removed from its parent.
export class ProxyViewContainer extends LayoutBase implements definition.ProxyViewContainer {
    // No native view for proxy container.
    get ios(): any {
        return null;
    }

    get android(): any {
        return null;
    }

    get _nativeView(): any {
        return null;
    }

    get isLayoutRequested(): boolean {
        // Always return false so all layout requests from children bubble up.
        return false;
    }

    public _createUI() {
        // 
    }

    public _getNativeViewsCount(): number {
        let result = 0;
        this._eachChildView((cv) => {
            result += cv._getNativeViewsCount();
            return true;
        });

        return result;
    }

    public _eachLayoutView(callback: (View) => void): void {
        this._eachChildView((cv) => {
            cv._eachLayoutView(callback);
            return true;
        });
    }

    public _addViewToNativeVisualTree(child: View, atIndex?: number): boolean {
        trace.write("ViewContainer._addViewToNativeVisualTree for a child " + child + " ViewContainer.parent: " + this.parent, trace.categories.ViewHierarchy);
        super._addViewToNativeVisualTree(child);

        var parent = this.parent;
        if (parent) {
            let baseIndex = 0;
            let insideIndex = 0;
            if (parent instanceof LayoutBase) {
                // Get my index in parent and convert it to native index.
                baseIndex = parent._childIndexToNativeChildIndex(parent.getChildIndex(this));
            }

            if (types.isDefined(atIndex)) {
                insideIndex = this._childIndexToNativeChildIndex(atIndex);
            } else {
                // Add last;
                insideIndex = this._getNativeViewsCount();
            }

            trace.write("ProxyViewContainer._addViewToNativeVisualTree at: " + atIndex + " base: " + baseIndex + " additional: " + insideIndex, trace.categories.ViewHierarchy);
            return parent._addViewToNativeVisualTree(child, baseIndex + insideIndex);
        }

        return false;
    }

    public _removeViewFromNativeVisualTree(child: View): void {
        trace.write("ProxyViewContainer._removeViewFromNativeVisualTree for a child " + child + " ViewContainer.parent: " + this.parent, trace.categories.ViewHierarchy);
        super._removeViewFromNativeVisualTree(child);

        var parent = this.parent;
        if (parent) {
            return parent._removeViewFromNativeVisualTree(child);
        }
    }

    public _addToSuperview(superview: any, atIndex?: number): boolean {
        var index = 0;
        this._eachChildView((cv) => {
            if (!cv._isAddedToNativeVisualTree) {
                cv._isAddedToNativeVisualTree = this._addViewToNativeVisualTree(cv, index++);
            }
            return true;
        });

        return true;
    }

    public _removeFromSuperview() {
        this._eachChildView((cv) => {
            if (cv._isAddedToNativeVisualTree) {
                this._removeViewFromNativeVisualTree(cv);
            }
            return true;
        });
    }

    /*
     * Some layouts (e.g. GridLayout) need to get notified when adding and
     * removing children, so that they can update private measure data.
     *
     * We register our children with the parent to avoid breakage.
     */
    public _registerLayoutChild(child: View) {
        if (this.parent instanceof LayoutBase) {
            (<LayoutBase>this.parent)._registerLayoutChild(child);
        }
    }

    public _unregisterLayoutChild(child: View) {
        if (this.parent instanceof LayoutBase) {
            (<LayoutBase>this.parent)._unregisterLayoutChild(child);
        }
    }

    /*
     * Register/unregister existing children with the parent layout.
     */
    public _parentChanged(oldParent: View): void {
        const addingToParent = this.parent && !oldParent;
        const newLayout = <LayoutBase>this.parent;
        const oldLayout = <LayoutBase>oldParent;

        if (addingToParent && newLayout instanceof LayoutBase) {
            this._eachChildView((child) => {
                newLayout._registerLayoutChild(child);
                return true;
            });
        } else if (oldLayout instanceof LayoutBase) {
            this._eachChildView((child) => {
                oldLayout._unregisterLayoutChild(child);
                return true;
            });
        }
    }
}
