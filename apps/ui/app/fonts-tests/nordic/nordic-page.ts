export function pageLoaded(args) {
	var page = args.object;
	page.getViewById('label').text = 'æøå';
}
