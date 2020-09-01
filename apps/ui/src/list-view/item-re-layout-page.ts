import { fromObject } from '@nativescript/core/data/observable';

export function loaded(args) {
	var items = [];

	for (let i = 0; i < 100; i++) {
		items.push(
			fromObject({
				text: '<' + i + '>',
				selected: !!!(i % 5),
			})
		);
	}
	args.object.bindingContext = { items: items };
}

export function toggle(args) {
	console.log('toggle : ');
	let context = args.object.bindingContext;
	console.dir(context);
	context.set('selected', !context.selected);
	// args.object.requestLayout();
}
