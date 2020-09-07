export function loaded(args) {
	var items = [];
	for (var i = 0; i < 100; i++) {
		items.push('name' + i);
	}
	args.object.bindingContext = { items: items };
}
