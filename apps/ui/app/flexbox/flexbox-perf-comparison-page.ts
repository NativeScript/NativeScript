import { TabView } from '@nativescript/core/ui/tab-view';
import * as utils from '@nativescript/core/utils/utils';

const titles = ['Etiam lacinia', 'Imperdiet ante', 'A interdum', 'Quisque tempus', 'Sodales viverra'];
const bodies = [
	'Vivamus ipsum neque, commodo rutrum finibus sit amet, cursus id sapien.',
	'Duis et iaculis odio. Class aptent taciti.',
	'Sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.',
	'Etiam vitae lacinia purus. Vestibulum laoreet nibh a porta aliquet.',
	'Vivamus ut eros vitae felis volutpat aliquet.',
	'Aliquam fermentum mauris consequat hendrerit elementum.',
	'Nam odio tortor, malesuada congue diam volutpat, placerat ullamcorper risus.',
	'Curabitur eget nunc viverra justo bibendum rutrum ut nec lectus.',
	'Pellentesque et lacus vel turpis suscipit posuere sed non sapien.',
	'Integer eget ornare nunc. In lacinia congue sollicitudin.',
	'Quisque lobortis quam in risus porttitor, ac laoreet lacus auctor.',
];

const items = [];
for (var i = 0; i < 64; i++) {
	items.push({
		icon: '~/flexbox/icons/icon' + (1 + (i % 3)) + '.jpg',
		title: titles[i % titles.length],
		body: bodies[i % bodies.length],
		up: (i * 991) % 100,
		down: (i * 997) % 100,
	});
}

export function selectionChanged(args) {
	clear(args);
}

let repeaterIds = ['repeaterFlexGrid', 'repeaterGrid', 'repeaterFlexStack', 'repeaterStack'];

export function clear(args) {
	repeaterIds
		.map((name) => args.object.page.getViewById(name))
		.forEach((repeater) => {
			repeater.bindingContext = null;
		});

	args.object.page.getViewById('title').text = '---';

	utils.GC();
}

export function generate(args) {
	let tab: TabView = args.object.page.getViewById('tabview');
	let index = tab.selectedIndex;

	let repeater = args.object.page.getViewById(repeaterIds[index]);

	clear(args);
	setTimeout(() => {
		let start = Date.now();
		repeater.bindingContext = items;
		setTimeout(() => {
			let end = Date.now();
			args.object.page.getViewById('title').text = (end - start).toString();
			console.log('Duration: ' + (end - start));
		});
	});
}
