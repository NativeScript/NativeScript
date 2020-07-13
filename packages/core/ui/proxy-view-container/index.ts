import { ProxyViewContainer as ProxyViewContainerDefinition } from '.';
import { View, CSSType } from '../core/view';
import { LayoutBase } from '../layouts/layout-base';
import { Property } from '../core/properties';
import { Trace } from '../../trace';

/**
 * Proxy view container that adds all its native children directly to the parent.
 * To be used as a logical grouping container of views.
 */
// Cases to cover:
// * Child is added to the attached proxy. Handled in _addViewToNativeVisualTree.
// * Proxy (with children) is added to the DOM. In _addViewToNativeVisualTree _addViewToNativeVisualTree recursively when the proxy is added to the parent.
// * Child is removed from attached proxy. Handled in _removeViewFromNativeVisualTree.
// * Proxy (with children) is removed form the DOM. In _removeViewFromNativeVisualTree recursively when the proxy is removed from its parent.
@CSSType('ProxyViewContainer')
export class ProxyViewContainer extends LayoutBase implements ProxyViewContainerDefinition {
	private proxiedLayoutProperties = new Set<string>();

	constructor() {
		super();
		this.nativeViewProtected = undefined;
	}

	// No native view for proxy container.
	get ios(): any {
		return null;
	}

	get android(): any {
		return null;
	}

	// get nativeView(): any {
	//     return null;
	// }

	get isLayoutRequested(): boolean {
		// Always return false so all layout requests from children bubble up.
		return false;
	}

	public createNativeView() {
		return undefined;
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
		if (Trace.isEnabled()) {
			Trace.write('ProxyViewContainer._addViewToNativeVisualTree for a child ' + child + ' ViewContainer.parent: ' + this.parent, Trace.categories.ViewHierarchy);
		}
		super._addViewToNativeVisualTree(child);

		layoutProperties.forEach((propName) => {
			const proxyPropName = makeProxyPropName(propName);
			child[proxyPropName] = child[propName];

			if (this.proxiedLayoutProperties.has(propName)) {
				this._applyLayoutPropertyToChild(child, propName, this[propName]);
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
				// Add last;
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

	/**
	 * Layout property changed, proxy the new value to the child view(s)
	 */
	public _changedLayoutProperty(propName: string, value: string) {
		const numChildren = this._getNativeViewsCount();
		if (numChildren > 1) {
			Trace.write("ProxyViewContainer._changeLayoutProperty - you're setting '" + propName + "' for " + this + ' with more than one child. Probably this is not what you want, consider wrapping it in a StackLayout ', Trace.categories.ViewHierarchy, Trace.messageType.error);
		}

		this.eachLayoutChild((child) => {
			this._applyLayoutPropertyToChild(child, propName, value);

			return true;
		});

		this.proxiedLayoutProperties.add(propName);
	}

	/**
	 * Apply the layout property to the child view.
	 */
	private _applyLayoutPropertyToChild(child: View, propName: string, value: any) {
		const proxyPropName = makeProxyPropName(propName);
		if (proxyPropName in child) {
			if (child[propName] !== child[proxyPropName]) {
				// Value was set directly on the child view, don't override.
				if (Trace.isEnabled()) {
					Trace.write('ProxyViewContainer._applyLayoutPropertyToChild child ' + child + ' has its own value [' + child[propName] + '] for [' + propName + ']', Trace.categories.ViewHierarchy);
				}

				return;
			}
		}

		child[propName] = value;
		child[proxyPropName] = value;
	}
}

// Layout propeties to be proxyed to the child views
const layoutProperties = [
	// AbsoluteLayout
	'left',
	'top',

	// DockLayout
	'dock',

	// FlexLayout
	'flexDirection',
	'flexWrap',
	'justifyContent',
	'alignItems',
	'alignContent',
	'order',
	'flexGrow',
	'flexShrink',
	'flexWrapBefore',
	'alignSelf',
	'flexFlow',
	'flex',

	// GridLayout
	'column',
	'columnSpan',
	'col',
	'colSpan',
	'row',
	'rowSpan',
];

// Override the inherited layout properties
for (const name of layoutProperties) {
	const proxyProperty = new Property<ProxyViewContainer, string>({
		name,
		valueChanged(target, oldValue, value) {
			target._changedLayoutProperty(name, value);
		},
	});

	proxyProperty.register(ProxyViewContainer);
}

function makeProxyPropName(propName) {
	return `_proxy:${propName}`;
}
