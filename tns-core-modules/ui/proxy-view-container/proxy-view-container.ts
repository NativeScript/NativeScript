import { ProxyViewContainer as ProxyViewContainerDefinition } from "ui/proxy-view-container";
import { LayoutBase, View, traceEnabled, traceWrite, traceCategories } from "ui/layouts/layout-base";
/**
 * Proxy view container that adds all its native children directly to the parent. 
 * To be used as a logical grouping container of views.
 */
// Cases to cover:
// * Child is added to the attached proxy. Handled in _addViewToNativeVisualTree.
// * Proxy (with children) is added to the DOM. In _addViewToNativeVisualTree _addViewToNativeVisualTree recursively when the proxy is added to the parent.
// * Child is removed from attached proxy. Handled in _removeViewFromNativeVisualTree.
// * Proxy (with children) is removed form the DOM. In _removeViewFromNativeVisualTree recursively when the proxy is removed from its parent.
export class ProxyViewContainer extends LayoutBase implements ProxyViewContainerDefinition {
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

    public _createNativeView() {
        // 
    }

    public _getNativeViewsCount(): number {
        let result = 0;
        this.eachChildView((cv) => {
            result += cv._getNativeViewsCount();
            return true;
        });

        return result;
    }

    public _eachLayoutView(callback: (View) => void): void {
        this.eachChildView((cv) => {
            if (!cv.isCollapsed) {
                cv._eachLayoutView(callback);
            }
            return true;
        });
    }

    public _addViewToNativeVisualTree(child: View, atIndex?: number): boolean {
        if (traceEnabled()) {
            traceWrite("ViewContainer._addViewToNativeVisualTree for a child " + child + " ViewContainer.parent: " + this.parent, traceCategories.ViewHierarchy);
        }
        super._addViewToNativeVisualTree(child);

        const parent = this.parent;
        if (parent instanceof View) {
            let baseIndex = 0;
            let insideIndex = 0;
            if (parent instanceof LayoutBase) {
                // Get my index in parent and convert it to native index.
                baseIndex = parent._childIndexToNativeChildIndex(parent.getChildIndex(this));
            }

            if (atIndex !== undefined) {
                insideIndex = this._childIndexToNativeChildIndex(atIndex);
            } else {
                // Add last;
                insideIndex = this._getNativeViewsCount();
            }
            if (traceEnabled()) {
                traceWrite("ProxyViewContainer._addViewToNativeVisualTree at: " + atIndex + " base: " + baseIndex + " additional: " + insideIndex, traceCategories.ViewHierarchy);
            }
            return parent._addViewToNativeVisualTree(child, baseIndex + insideIndex);
        }

        return false;
    }

    public _removeViewFromNativeVisualTree(child: View): void {
        if (traceEnabled()) {
            traceWrite("ProxyViewContainer._removeViewFromNativeVisualTree for a child " + child + " ViewContainer.parent: " + this.parent, traceCategories.ViewHierarchy);
        }
        super._removeViewFromNativeVisualTree(child);

        const parent = this.parent;
        if (parent instanceof View) {
            return parent._removeViewFromNativeVisualTree(child);
        }
    }

    /*
     * Some layouts (e.g. GridLayout) need to get notified when adding and
     * removing children, so that they can update private measure data.
     *
     * We register our children with the parent to avoid breakage.
     */
    public _registerLayoutChild(child: View) {
        const parent = this.parent;
        if (parent instanceof LayoutBase) {
            parent._registerLayoutChild(child);
        }
    }

    public _unregisterLayoutChild(child: View) {
        const parent = this.parent;
        if (parent instanceof LayoutBase) {
            parent._unregisterLayoutChild(child);
        }
    }

    /*
     * Register/unregister existing children with the parent layout.
     */
    public _parentChanged(oldParent: View): void {
        // call super in order to execute base logic like clear inherited properties, etc.
        super._parentChanged(oldParent);
        const addingToParent = this.parent && !oldParent;
        const newLayout = <LayoutBase>this.parent;
        const oldLayout = <LayoutBase>oldParent;

        if (addingToParent && newLayout instanceof LayoutBase) {
            this.eachChildView((child) => {
                newLayout._registerLayoutChild(child);
                return true;
            });
        } else if (oldLayout instanceof LayoutBase) {
            this.eachChildView((child) => {
                oldLayout._unregisterLayoutChild(child);
                return true;
            });
        }
    }
}
