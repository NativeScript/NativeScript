import { Label, Builder, TabView, TabViewItem } from '@nativescript/core/ui';
import * as TKUnit from '../../tk-unit';

export function test_lowercase_declaration() {
	const root = Builder.parse(`
        <tab-view>
            <tab-view-item id="tab-view-item">
                <label text="test" id="tab-view-item-label" />
            </tab-view-item>
        </tab-view>
    `);

	const tabViewItem = root.getViewById('tab-view-item');
	const tabViewItemLabel = root.getViewById('tab-view-item-label');

	TKUnit.assert(root instanceof TabView, 'Expected result: TabView!; Actual result: ' + root);
	TKUnit.assert(tabViewItem instanceof TabViewItem, 'Expected result: TabViewItem!; Actual result: ' + tabViewItem);
	TKUnit.assert(tabViewItemLabel instanceof Label, 'Expected result: Label!; Actual result: ' + tabViewItemLabel);
}
