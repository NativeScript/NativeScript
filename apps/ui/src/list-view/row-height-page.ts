export function onNavigatingTo(args) {
	const page = args.object;
	page.bindingContext = ['Item 1', 'Item 2', 'Item 3'];
}
