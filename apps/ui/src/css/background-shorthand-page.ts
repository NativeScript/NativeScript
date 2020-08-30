import * as pages from '@nativescript/core/ui/page';
import * as button from '@nativescript/core/ui/button';

import { GridLayout } from '@nativescript/core/ui/layouts/grid-layout';

let testIndex = 0;
const tests = [
	{ name: 'black hex color only', background: '#000000' },
	{ name: 'yellow hex color only', background: '#ffff00' },
	{ name: 'blue color only', background: 'blue' },

	{ name: 'repeat image only', background: 'url("~/resources/images/icon.png")' },
	{ name: 'linear gradient red-blue only', background: 'linear-gradient(to bottom, red, blue)' },

	{ name: '[straight] image only, no-repeat ', background: 'url("~/resources/images/icon.png") no-repeat' },
	{ name: '[straight] green color, image, no-repeat', background: 'green url("~/resources/images/icon.png") no-repeat' },
	{ name: '[straight] yellow hex color, image, no-repeat, position pixels', background: '#ffff00 url("~/resources/images/icon.png") no-repeat 200px 200px' },
	{ name: '[straight] yellow hex color, image, repeat-y, position pixels', background: '#ffff00 url("~/resources/images/icon.png") repeat-y 100px 500px' },
	{ name: '[straight] orange hex color, image, no-repeat, position percents', background: '#F9791F url("~/resources/images/icon.png") no-repeat 100% 100%' },
	{ name: '[straight] green color, image, repeat-x, position percents', background: 'green url("~/resources/images/icon.png") repeat-x 100% 100%' },
	{ name: '[straight] blue color, image, repeat-x, position', background: 'blue url("~/resources/images/icon.png") repeat-x 150 150' },

	{ name: '[shuffle] no-repeat, image only', background: 'no-repeat url("~/resources/images/icon.png")' },
	{ name: '[shuffle] no-repeat, green color, image, ', background: 'no-repeat green url("~/resources/images/icon.png")' },
	{ name: '[shuffle] yellow hex color, position pixels, image, no-repeat', background: '#ffff00 200px 200px url("~/resources/images/icon.png") no-repeat' },
	{ name: '[shuffle] image, repeat-y, yellow hex color, position pixels', background: 'url("~/resources/images/icon.png") repeat-y #ffff00 100px 500px' },
	{ name: '[shuffle] position percents, image, no-repeat, orange hex color', background: '100% 100% url("~/resources/images/icon.png") no-repeat #F9791F' },
	{ name: '[shuffle] position percents, image, repeat-x, green color', background: '100% 100% url("~/resources/images/icon.png") repeat-x green' },
	{ name: '[shuffle] image, repeat-x, position, blue color,', background: 'url("~/resources/images/icon.png") repeat-x 150 150 blue' },
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
	gridElement.background = tests[testIndex].background;

	testIndex = testIndex < tests.length - 1 ? ++testIndex : 0;
}
