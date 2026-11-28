export function loaded(args) {
	const items = [];
	for (let i = 0; i < 100; i++) {
		items.push('name' + i);
	}
	args.object.bindingContext = { items: items };
}
