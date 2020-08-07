import { EventData } from '@nativescript/core/data/observable';
import { Page } from '@nativescript/core/ui/page';
import { Button } from '@nativescript/core/ui/button';
import { StackLayout } from '@nativescript/core/ui/layouts/stack-layout';

export function toggle(args: EventData) {
	const page = <Page>(<any>args.object).page;

	const getElementById = (id) => page.getViewById(id);

	const toggleBtn = <Button>getElementById('toggleUserInteraction');
	const isEnabled = toggleBtn.text === 'disable' ? true : false;
	toggleBtn.text = !isEnabled ? 'disable' : 'enable';

	(<Button>getElementById('testBtn')).isUserInteractionEnabled = !isEnabled;
	(<Button>getElementById('testLabel')).isUserInteractionEnabled = !isEnabled;
	(<StackLayout>getElementById('testStackLayout')).isUserInteractionEnabled = !isEnabled;
}

export function test() {
	console.log('onTap');
	alert('onTap');
}
