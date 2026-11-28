import * as buttonModule from '@nativescript/core/ui/button';
import * as stackLayoutModule from '@nativescript/core/ui/layouts/stack-layout';
import * as textFieldModule from '@nativescript/core/ui/text-field';
import * as observable from '@nativescript/core/data/observable';

export function stack0Loaded(args: observable.EventData) {
	const source = new observable.Observable();
	const stack0 = <stackLayoutModule.StackLayout>args.object;
	const target = stack0.getViewById<textFieldModule.TextField>('tf');
	const button = stack0.getViewById<textFieldModule.TextField>('btn');
	const bindingOptions = {
		sourceProperty: 'textSource',
		targetProperty: 'text', // ,
		// twoWay: true
	};
	target.bind(bindingOptions, source);
	source.set('textSource', 'Text');

	button.on(buttonModule.Button.tapEvent, function () {
		button.text = source.get('textSource');
	});
}

export function stack1Loaded(args: observable.EventData) {
	const stack1 = <stackLayoutModule.StackLayout>args.object;
	stack1.bindingContext = { text: 'Label' };
}

export function stack2Loaded(args: observable.EventData) {
	const stack2 = <stackLayoutModule.StackLayout>args.object;
	stack2.bindingContext = {
		myProperty: 'Button',
		myFunction: () => {
			console.log('### onTap event ###');
		},
	};
}

export function stack3Loaded(args: observable.EventData) {
	const stack3 = <stackLayoutModule.StackLayout>args.object;
	stack3.bindingContext = { myItems: [{ text: 'Label1' }, { text: 'Label2' }] };
}
