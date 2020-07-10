// Requires
import { TabContentItemBase } from './tab-content-item-common';

export * from './tab-content-item-common';

export class TabContentItem extends TabContentItemBase {
	// tslint:disable-next-line
	private __controller: UIViewController;

	public setViewController(controller: UIViewController, nativeView: UIView) {
		this.__controller = controller;
		this.setNativeView(nativeView);
	}

	public disposeNativeView() {
		this.__controller = undefined;
		this.setNativeView(undefined);
	}

	// TODO: Handle this for BOTTOM NAVIGATION with canBeLoaded in tab-cotent-item-common
	// public loadView(view: ViewBase): void {
	//     const tabView = this.parent as TabNavigationBase;
	//     if (tabView && tabView.items) {
	//         const index = tabView.items.indexOf(this);

	//         // if (index === tabView.selectedIndex) {
	//         //     super.loadView(view);
	//         // }
	//         super.loadView(view);
	//     }
	// }
}
