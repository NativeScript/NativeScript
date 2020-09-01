export function resetStyles(args) {
	args.object.page.css = '#container { border-color: black; border-width: 1; margin: 5; } #container>Label {  border-width: 2; border-color: black; border-radius: 5; }';
}

export const flexFlow = applyCss();

function applyCss() {
	return function (args) {
		let boxCss = ' #container { ' + args.object.tag + ' }';
		// console.log(boxCss);
		args.object.page.addCss(boxCss);
		// console.log(args.object.page.css);
	};
}

export function applyStyles(args) {
	resetStyles(args);
	// console.log(args.object.tag);
	args.object.page.addCss(args.object.tag);
}
