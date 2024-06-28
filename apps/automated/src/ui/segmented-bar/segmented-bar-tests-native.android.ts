import * as segmentedBarModule from '@nativescript/core/ui/segmented-bar';
import { Color } from '@nativescript/core';
import { AndroidHelper } from '@nativescript/core/ui/core/view';

export function getNativeTabWidget(bar: segmentedBarModule.SegmentedBar): android.widget.TabWidget {
	return (<android.widget.TabHost>bar.android).getTabWidget();
}

export function getNativeItemsCount(bar: segmentedBarModule.SegmentedBar): number {
	return (<android.widget.TabHost>bar.android).getTabWidget().getTabCount();
}

export function checkNativeItemsTextColor(bar: segmentedBarModule.SegmentedBar): boolean {
	var isValid = true;

	// for (var tabIndex = 0; tabIndex < bar.android.getTabWidget().getTabCount(); tabIndex++) {
	//     var tabChild = <android.view.ViewGroup>bar.android.getTabWidget().getChildTabViewAt(tabIndex);
	//     var t = <android.widget.TextView>tabChild.getChildAt(1);

	//     isValid = bar.color && bar.color.android === t.getCurrentTextColor();
	// }

	for (let i = 0, itemsLength = bar.items.length; i < itemsLength; i++) {
		let textView = <android.widget.TextView>bar.items[0].nativeViewProtected;
		isValid = bar.color && bar.color.android === textView.getCurrentTextColor();
	}

	return isValid;
}

export function setNativeSelectedIndex(bar: segmentedBarModule.SegmentedBar, index: number): void {
	(<android.widget.TabHost>bar.android).setCurrentTab(index);
}

export var checkBackgroundColorUpdatedAfterItemSelected = function (bar: segmentedBarModule.SegmentedBar): boolean {
	let isValid = 0;
	bar.selectedIndex = 0;
	bar.selectedTextColor = new Color('green');
	bar.selectedBackgroundColor = new Color('red');

	const tabWidget = getNativeTabWidget(bar);
	if (tabWidget) {
		for (let i = 0; i < tabWidget.getTabCount(); i++) {
			const view = tabWidget.getChildTabViewAt(i);
			const item = bar.items[i];
			const textView = item?.nativeViewProtected;

			const newDrawable = AndroidHelper.getCopyOrDrawable(view.getBackground(), view.getResources());
			newDrawable.setColorFilter(new android.graphics.Paint(bar.selectedBackgroundColor.android).getColorFilter());

			if (bar.selectedIndex == i) {
				if (view.getBackground() !== newDrawable) {
					console.log('>>>>>>>>>>>>>>>>>>>>>> newDrawable', view.getBackground());
					console.log('>>>>>>>>>>>>>>>>>>>>>> bar.selectedBackgroundColor.android', newDrawable);
					console.log('>>>>>>>>>>>>>>>>>>>>>> selectedBackgroundColor', newDrawable.getColorFilter(), view.getBackground().getColorFilter());
					console.log('>>>>>>>>>>>>>>>>>>>>>> selectedBackgroundColor', newDrawable.hashCode(), view.hashCode());

					isValid++;
					break;
				} else if (textView.getCurrentTextColor() !== bar.selectedTextColor) {
					console.log('>>>>>>>>>>>>>>>>>>>>>>');
					console.log('>>>>>>>>>>>>>>>>>>>>>>');
					console.log('>>>>>>>>>>>>>>>>>>>>>> selectedTextColor');

					isValid++;
					break;
				}
			}
		}
	}

	return isValid === 0;
};
