export function pageLoaded(args) {
	const page = args.object;
	page.bindingContext = { html: 'one<br>two' };
}
