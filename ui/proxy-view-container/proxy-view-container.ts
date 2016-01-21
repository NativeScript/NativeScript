import types = require("utils/types");
import view = require("ui/core/view");
import definition = require("ui/proxy-view-container");
import trace = require("trace");
import layout = require("ui/layouts/layout-base");
/**
 * Proxy view container that adds all its native children dirctly to the parent. 
 * To be used as a logical grouping container of views.
 */
// Cases to cover:
// * Child is added to the attached proxy. Handled in _addViewToNativeVisualTree.
// * Proxy (with children) is added to the DOM.
//   - IOS: Handled in _addToSuperview - when the proxy is added, it adds all its children to the new parent.
//   - Android: _onAttached calls _addViewToNativeVisualTree recoursively when the proxy is added to the parent.
// * Child is removed from attached proxy. Handled in _removeViewFromNativeVisualTree.
// * Proxy (with children) is removed form the DOM.
//   - IOS: Handled in _removeFromSuperview - when the proxy is removed, it removes all its children from its parent.
//   - Android: _onDetached calls _removeViewFromNativeVisualTree recoursively when the proxy is removed from its parent.
export class ProxyViewContainer extends layout.LayoutBase implements definition.ProxyViewContainer {
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

    public _addViewToNativeVisualTree(child: view.View, atIndex?: number): boolean {
        trace.write("ViewContainer._addViewToNativeVisualTree for a child " + view + " ViewContainer.parent: " + this.parent, trace.categories.ViewHierarchy);
        super._addViewToNativeVisualTree(child);

        var parent = this.parent;
        if (parent) {
            let baseIndex = 0;
            let insideIndex = 0;
            if (parent instanceof layout.LayoutBase) {
                baseIndex = parent.getChildIndex(this);
                baseIndex = parent._childIndexToNativeChildIndex(baseIndex);
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

    public _removeViewFromNativeVisualTree(child: view.View): void {
        trace.write("ProxyViewContainer._removeViewFromNativeVisualTree for a child " + view + " ViewContainer.parent: " + this.parent, trace.categories.ViewHierarchy);
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
}
