import { View, CSSType } from '../core/view';
import { LayoutBase } from '../layouts/layout-base';
import { Property } from '../core/properties';
import { Trace } from '../../trace';

/**
 * Proxy view container that adds all its native children directly to the parent.
 * To be used as a logical grouping container of views.
 *
 * @nsView ProxyViewContainer
 */
// Cases to cover:
// * Child is added to the attached proxy. Handled in _addViewToNativeVisualTree.
// * Proxy (with children) is added to the DOM. In _addViewToNativeVisualTree recursively when the proxy is added to the parent.
// * Child is removed from attached proxy. Handled in _removeViewFromNativeVisualTree.
// * Proxy (with children) is removed from the DOM. In _removeViewFromNativeVisualTree recursively when the proxy is removed from its parent.
@CSSType('ProxyViewContainer')
export class ProxyViewContainer extends LayoutBase {
	private proxiedLayoutProperties = new Set<string>();

	constructor() {
		super();
		this.nativeViewProtected = undefined;
	}

	// No native view for proxy container.
	public override get ios(): any {
		return null;
	}

	public override get android(): any {
		return null;
	}

	public get isLayoutRequested(): boolean {
		// Always return false so all layout requests from children bubble up.
		return false;
	}

	public createNativeView(): any {
		return undefined;
	}

	public _getNativeViewsCount(): number {
		let result = 0;
		this.eachChildView((cv: View) => {
			result += (cv as any)._getNativeViewsCount();
			return true;
		});
		return result;
	}

	public _eachLayoutView(callback: (view: View) => void): void {
		this.eachChildView((cv: View) => {
			if (!cv.isCollapsed) {
				(cv as any)._eachLayoutView(callback);
			}
			return true;
		});
	}

	_setupUI(context: any, atIndex?: number, parentIsLoaded?: boolean) {
		let processChildren = false;
		if (this.reusable && this._context === context) {
			processChildren = true;
		}
		super._setupUI(context, atIndex, parentIsLoaded);
		if (this.reusable && processChildren) {
			this.eachChild((child) => {
				const oldReusable = child.reusable;
				child.reusable = true;
				child._setupUI(context);
				child.reusable = oldReusable;
				return true;
			});
		}
	}

	_tearDownUI(force?: boolean) {
		super._tearDownUI(force);
		if (this.reusable && !force) {
			this.eachChild((child) => {
				const oldReusable = child.reusable;
				child.reusable = true;
				child._tearDownUI();
				child.reusable = oldReusable;
				return true;
			});
		}
	}

	public _addViewToNativeVisualTree(child: View, atIndex?: number): boolean {
		if (Trace.isEnabled()) {
			Trace.write('ProxyViewContainer._addViewToNativeVisualTree for a child ' + child + ' ViewContainer.parent: ' + this.parent, Trace.categories.ViewHierarchy);
		}
		super._addViewToNativeVisualTree(child);

		layoutProperties.forEach((propName) => {
			const proxyPropName = makeProxyPropName(propName);
			(child as any)[proxyPropName] = (child as any)[propName];

			if (this.proxiedLayoutProperties.has(propName)) {
				this._applyLayoutPropertyToChild(child, propName, (this as any)[propName]);
			}
		});

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
				insideIndex = this._getNativeViewsCount();
			}
			if (Trace.isEnabled()) {
				Trace.write('ProxyViewContainer._addViewToNativeVisualTree at: ' + atIndex + ' base: ' + baseIndex + ' additional: ' + insideIndex, Trace.categories.ViewHierarchy);
			}

			return parent._addViewToNativeVisualTree(child, baseIndex + insideIndex);
		}

		return false;
	}

	public _removeViewFromNativeVisualTree(child: View): void {
		if (Trace.isEnabled()) {
			Trace.write('ProxyViewContainer._removeViewFromNativeVisualTree for a child ' + child + ' ViewContainer.parent: ' + this.parent, Trace.categories.ViewHierarchy);
		}
		super._removeViewFromNativeVisualTree(child);

		const parent = this.parent;
		if (parent instanceof View) {
			parent._removeViewFromNativeVisualTree(child);
			return;
		}
	}

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

	public _parentChanged(oldParent: View): void {
		super._parentChanged(oldParent);
		const addingToParent = this.parent && !oldParent;
		const newLayout = <LayoutBase>this.parent;
		const oldLayout = <LayoutBase>oldParent;

		if (addingToParent && newLayout instanceof LayoutBase) {
			this.eachLayoutChild((child) => {
				newLayout._registerLayoutChild(child);
				return true;
			});
		} else if (oldLayout instanceof LayoutBase) {
			this.eachLayoutChild((child) => {
				oldLayout._unregisterLayoutChild(child);
				return true;
			});
		}
	}

	public _changedLayoutProperty(propName: string, value: any) {
		const numChildren = this._getNativeViewsCount();
		if (numChildren > 1) {
			Trace.write("ProxyViewContainer._changeLayoutProperty - you're setting '" + propName + "' for " + this + ' with more than one child. Consider wrapping it in a StackLayout ', Trace.categories.ViewHierarchy, Trace.messageType.error);
		}

		this.eachLayoutChild((child) => {
			this._applyLayoutPropertyToChild(child, propName, value);
			return true;
		});

		this.proxiedLayoutProperties.add(propName);
	}

	private _applyLayoutPropertyToChild(child: View, propName: string, value: any) {
		const proxyPropName = makeProxyPropName(propName);
		const childAny = child as any;

		if (proxyPropName in childAny) {
			if (childAny[propName] !== childAny[proxyPropName]) {
				if (Trace.isEnabled()) {
					Trace.write('ProxyViewContainer._applyLayoutPropertyToChild child ' + child + ' has its own value [' + childAny[propName] + '] for [' + propName + ']', Trace.categories.ViewHierarchy);
				}
				return;
			}
		}

		childAny[propName] = value;
		childAny[proxyPropName] = value;
	}

	public override set hidden(value: boolean): void {
		this.eachChildView((child: View) => {
			(child as any).hidden = value;
			return true;
		});
	}
}

// Layout properties to be proxied to the child views
const layoutProperties = ['left', 'top', 'dock', 'flexDirection', 'flexWrap', 'justifyContent', 'alignItems', 'alignContent', 'order', 'flexGrow', 'flexShrink', 'flexWrapBefore', 'alignSelf', 'flexFlow', 'flex', 'column', 'columnSpan', 'col', 'colSpan', 'row', 'rowSpan'];

for (const name of layoutProperties) {
	// CORRECTION: Changed Property<..., string> to Property<..., any>
	const proxyProperty = new Property<ProxyViewContainer, any>({
		name,
		valueChanged(target, oldValue, value) {
			target._changedLayoutProperty(name, value);
		},
	});
	proxyProperty.register(ProxyViewContainer);
}

// CORRECTION: Added types for the function parameter and return value
function makeProxyPropName(propName: string): string {
	return `_proxy:${propName}`;
}
