// Types
import { TabContentItem as TabContentItemDefinition } from '.';
import { TabNavigationBase } from '../tab-navigation-base';
import { GridLayout } from '../../layouts/grid-layout';

// Requires
import { TabContentItemBase, traceCategory } from './tab-content-item-common';
import { View } from '../../core/view';
import { Trace } from '../../../trace';

export * from './tab-content-item-common';

export class TabContentItem extends TabContentItemBase {
	public nativeViewProtected: org.nativescript.widgets.GridLayout;
	public tabItemSpec: org.nativescript.widgets.TabItemSpec;
	public index: number;

	get _hasFragments(): boolean {
		return true;
	}

	public createNativeView() {
		const layout = new org.nativescript.widgets.GridLayout(this._context);
		layout.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.star));

		return layout;
	}

	public initNativeView(): void {
		super.initNativeView();
	}

	public _addViewToNativeVisualTree(child: View, atIndex?: number): boolean {
		// Set the row property for the child
		if (this.nativeViewProtected && child.nativeViewProtected) {
			GridLayout.setRow(child, 0);
		}

		return super._addViewToNativeVisualTree(child, atIndex);
	}

	public disposeNativeView(): void {
		super.disposeNativeView();
		(<TabContentItemDefinition>this).canBeLoaded = false;
	}

	public _getChildFragmentManager(): androidx.fragment.app.FragmentManager {
		const tabView = <TabNavigationBase>this.parent;
		let tabFragment = null;
		const fragmentManager = tabView._getFragmentManager();

		if (typeof this.index === 'undefined') {
			Trace.write(`Current TabContentItem index is not set`, traceCategory, Trace.messageType.error);
		}

		const fragments = fragmentManager.getFragments().toArray();
		for (let i = 0; i < fragments.length; i++) {
			if (fragments[i].index === this.index) {
				tabFragment = fragments[i];
				break;
			}
		}

		// TODO: can happen in a modal tabview scenario when the modal dialog fragment is already removed
		if (!tabFragment) {
			// if (Trace.isEnabled()) {
			//     Trace.write(`Could not get child fragment manager for tab item with index ${this.index}`, traceCategory);
			// }

			// TODO: fix d.ts in view module
			return (<any>tabView)._getRootFragmentManager();
		}

		return tabFragment.getChildFragmentManager();
	}
}
