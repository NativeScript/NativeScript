import { NavigatedData } from '@nativescript/core/ui/page';
import { View } from '@nativescript/core/ui/core/view';
import * as TKUnit from '../../tk-unit';
import { Frame } from '@nativescript/core/ui/frame';
import { isAndroid } from '@nativescript/core/platform';

export function onNavigatedTo(args: NavigatedData) {
	TKUnit.assertEqual(Frame._stack().length, 2, 'Host and tab modal frame should be instantiated at this point!');
	// shownModally raised after page.NavigatedTo on iOS so we close modal there
	if (isAndroid) {
		(args.object as View).closeModal();
	}
}
