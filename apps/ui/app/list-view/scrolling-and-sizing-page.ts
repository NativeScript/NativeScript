export function onNavigatingTo(args) {
	const page = args.object;
	page.bindingContext = ['The quick', 'brown fox', 'jumped over', 'the', 'lazy dog.'];
}
