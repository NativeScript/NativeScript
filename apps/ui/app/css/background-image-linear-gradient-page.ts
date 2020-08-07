import * as pages from '@nativescript/core/ui/page';
import * as button from '@nativescript/core/ui/button';

import { GridLayout } from '@nativescript/core/ui/layouts/grid-layout';

let testIndex = 0;
const tests = [
	{ name: 'black-blue only', backgroundImage: 'linear-gradient(to bottom, black, blue)' },
	{ name: 'to bottom green-blue', backgroundImage: 'linear-gradient(to bottom, green, blue)' },
	{ name: 'to left yellow-blue', backgroundImage: 'linear-gradient(to left, yellow, green)' },
	{ name: 'to right yellow-blue', backgroundImage: 'linear-gradient(to right, yellow, green)' },
	{ name: '-45deg green-blue', backgroundImage: 'linear-gradient(-45deg, green, blue)' },
	{ name: '45deg green-blue', backgroundImage: 'linear-gradient(45deg, green, blue)' },

	{ name: 'black-blue-pink only', backgroundImage: 'linear-gradient(to bottom, black, blue, pink)' },
	{ name: 'to bottom green-blue-pink', backgroundImage: 'linear-gradient(to bottom, green, blue, pink)' },
	{ name: 'to left yellow-blue-pink', backgroundImage: 'linear-gradient(to left, yellow, green, pink)' },
	{ name: 'to right yellow-blue-pink', backgroundImage: 'linear-gradient(to right, yellow, green, pink)' },
	{ name: '-45deg green-blue-pink', backgroundImage: 'linear-gradient(-45deg, green, blue, pink)' },
	{ name: '45deg green-blue-pink', backgroundImage: 'linear-gradient(45deg, green, blue, pink)' },
];

export function onLoaded(args) {
	applyNextStyle(args);
}

export function onButtonTap(args) {
	applyNextStyle(args);
}

function applyNextStyle(args) {
	let page = <pages.Page>args.object.page;
	let btn = <button.Button>args.object;
	let gridElement = <GridLayout>page.getViewById('Container');

	btn.text = tests[testIndex].name;
	gridElement.backgroundImage = tests[testIndex].backgroundImage;

	testIndex = testIndex < tests.length - 1 ? ++testIndex : 0;
}
