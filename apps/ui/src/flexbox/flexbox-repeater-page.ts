export function pageLoaded(args) {
	const page = args.object;
	const itemsArray = [];
	for (let i = 1; i <= 55; i++) {
		itemsArray.push({ number: 'item ' + i });
	}
	page.bindingContext = { items: itemsArray };
}
