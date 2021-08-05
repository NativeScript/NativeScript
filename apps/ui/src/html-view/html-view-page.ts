export function pageLoaded(args) {
	var page = args.object;
	page.bindingContext = { html: 'one<br>two' };
}
