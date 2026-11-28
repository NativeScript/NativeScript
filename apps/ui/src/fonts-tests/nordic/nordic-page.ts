export function pageLoaded(args) {
	const page = args.object;
	page.getViewById('label').text = 'æøå';
}
