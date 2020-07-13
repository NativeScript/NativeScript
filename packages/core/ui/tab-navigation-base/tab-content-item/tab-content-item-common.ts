// Types
import { TabContentItem as TabContentItemDefinition } from '.';
import { AddChildFromBuilder } from '../../core/view';
import { TabNavigationBase } from '../tab-navigation-base';

// Requires
import { View, CSSType } from '../../core/view';
import { ViewBase } from '../../core/view-base';
import { ContentView } from '../../content-view';
export const traceCategory = 'TabView';

@CSSType('TabContentItem')
export abstract class TabContentItemBase extends ContentView implements TabContentItemDefinition, AddChildFromBuilder {
	public eachChild(callback: (child: View) => boolean) {
		if (this.content) {
			callback(this.content);
		}
	}

	public loadView(view: ViewBase): void {
		const tabView = <TabNavigationBase>this.parent;
		if (tabView && tabView.items) {
			// Don't load items until their fragments are instantiated.
			if ((<TabContentItemDefinition>this).canBeLoaded) {
				super.loadView(view);
			}
		}
	}
}
