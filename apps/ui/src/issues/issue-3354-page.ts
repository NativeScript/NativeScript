export function clear(args) {
	const tv1 = args.object.page.getViewById('tv1');
	tv1.text = '';
	const tv2 = args.object.page.getViewById('tv2');
	tv2.text = '';
}
