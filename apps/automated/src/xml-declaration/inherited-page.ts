import { Page } from '@nativescript/core/ui/page';
import { Label } from '@nativescript/core/ui/label';

export function pageLoaded(args) {
	const page = <Page>args.object;
	(<Label>page.content).text += ' and loaded';
}
