export function pageLoaded(args) {
	var page = args.object;
	var itemsArray = [];
	for (var i = 1; i <= 55; i++) {
		itemsArray.push({ number: 'item ' + i });
	}
	page.bindingContext = { items: itemsArray };
}
