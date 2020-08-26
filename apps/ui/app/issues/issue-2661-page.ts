import { topmost } from '@nativescript/core/ui/frame';

export function onTap() {
	topmost().navigate('issues/issue-2661-second-page');
}
