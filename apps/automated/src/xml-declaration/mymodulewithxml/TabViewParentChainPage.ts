import { Label } from '@nativescript/core/ui/label';
import { Observable } from '@nativescript/core/data/observable';
import { Page } from '@nativescript/core/ui/page';

export function loaded(args) {
	(<Observable>(<Label>args.object).page.bindingContext).set('testPassed', true);
}

export function onNavigatingTo(args) {
	(<Page>args.object).bindingContext = args.context;
}
