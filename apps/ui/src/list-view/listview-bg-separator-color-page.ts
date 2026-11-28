export function loaded(args) {
	const items = [];
	for (let i = 0; i < 5; i++) {
		items.push('name' + i);
	}
	args.object.bindingContext = { items: items };
}
