import { Image, Label, Builder, TabContentItem, Tabs, TabStrip, TabStripItem } from '@nativescript/core/ui';
import * as TKUnit from '../../tk-unit';

export function test_lowercase_declaration() {
	const root = Builder.parse(`
        <tabs>
            <tab-strip id="tab-strip">
                <tab-strip-item id="tab-strip-item">
                    <image src="res://icon"  id="tab-strip-item-image" />
                    <label text="test" id="tab-strip-item-label" />
                </tab-strip-item>
            </tab-strip>
            <tab-content-item id="tab-content-item">
                <label text="test" id="tab-content-item-label" />
            </tab-content-item>
        </tabs>
    `);

	const tabStrip = root.getViewById('tab-strip');
	const tabStripItem = root.getViewById('tab-strip-item');
	const tabStripItemImage = root.getViewById('tab-strip-item-image');
	const tabStripItemLabel = root.getViewById('tab-strip-item-label');
	const tabContentItem = root.getViewById('tab-content-item');
	const tabContentItemLabel = root.getViewById('tab-content-item-label');

	TKUnit.assert(root instanceof Tabs, 'Expected result: Tabs!; Actual result: ' + root);
	TKUnit.assert(tabStrip instanceof TabStrip, 'Expected result: TabStrip!; Actual result: ' + tabStrip);
	TKUnit.assert(tabStripItem instanceof TabStripItem, 'Expected result: TabStripItem!; Actual result: ' + tabStripItem);
	TKUnit.assert(tabStripItemImage instanceof Image, 'Expected result: Image!; Actual result: ' + tabStripItemImage);
	TKUnit.assert(tabStripItemLabel instanceof Label, 'Expected result: Label!; Actual result: ' + tabStripItemLabel);
	TKUnit.assert(tabContentItem instanceof TabContentItem, 'Expected result: TabContentItem!; Actual result: ' + tabContentItem);
	TKUnit.assert(tabContentItemLabel instanceof Label, 'Expected result: Label!; Actual result: ' + tabContentItemLabel);
}
