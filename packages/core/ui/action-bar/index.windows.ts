export * from './action-bar-common';

import { ActionBarBase, ActionItemBase } from './action-bar-common';
import { View } from '../core/view';

export class ActionItem extends ActionItemBase {}

export class NavigationButton extends ActionItem {}

export class ActionBar extends ActionBarBase {
	get windows(): undefined {
		return undefined;
	}

	public _addChildFromBuilder(name: string, value: any): void {
		if (value instanceof NavigationButton) {
			this.navigationButton = value;
		} else if (value instanceof ActionItemBase) {
			this.actionItems?.addItem(value);
		} else if (value instanceof View) {
			this.titleView = value;
		}
	}

	public update(): void {
		const page = this.parent as any;
		if (!page) return;
		const frame = page.frame as any;
		if (!frame?._updateActionBar) return;
		frame._updateActionBar(page);
	}

	public _onTitlePropertyChanged(): void {
		this.update();
	}
}
