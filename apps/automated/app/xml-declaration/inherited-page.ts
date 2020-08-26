import { Page } from '@nativescript/core/ui/page';
import { Label } from '@nativescript/core/ui/label';

export function pageLoaded(args) {
	var page = <Page>args.object;
	(<Label>page.content).text += ' and loaded';
}
