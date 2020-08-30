export function loaded(args) {
	var items = [];
	for (var i = 0; i < 5; i++) {
		items.push('name' + i);
	}
	args.object.bindingContext = { items: items };
}
