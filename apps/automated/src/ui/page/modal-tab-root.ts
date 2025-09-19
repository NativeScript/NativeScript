import { ShownModallyData, Frame, TabView } from '@nativescript/core';
import * as TKUnit from '../../tk-unit';

export function onShownModally(args: ShownModallyData) {
	const tabView = <TabView>args.object;
	TKUnit.assertNotNull(tabView);
	if (args.context) {
		args.context.shownModally = true;
	}

	const hostFrame = Frame._stack()[0];
	TKUnit.assertNotNull(hostFrame, 'Host frame should not be null');
	TKUnit.assertEqual(hostFrame.currentPage.modal, tabView, 'hostFrame.currentPage.modal should be equal to the tabView instance on tabView.shownModally event handler.');

	// shownModally raised after page.NavigatedTo on iOS
	if (__APPLE__) {
		args.closeCallback('return value');
	}
}
