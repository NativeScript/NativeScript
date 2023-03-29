import { Application, FlexboxLayout, GridLayout } from '@nativescript/core';
import Benchmark from 'benchmark';
const suite = new Benchmark.Suite();


//@ts-ignore
global.performance = {
	now() {
		if (global.android) {
			return java.lang.System.nanoTime() / 1000000;
		} else {
			return CACurrentMediaTime();
		}
	},
};

//@ts-ignore
//registerElement('view-element', FlexboxLayout);

// declare global {
// 	interface HTMLElementTagNameMap {
// 		'view-element': FlexboxLayout;
// 	}
// }

Application.run({
	create: () => {
		const root = new GridLayout();
		const view = new FlexboxLayout();
		//const element = document.createElement('view-element');
		root.addChild(view);
		//root.addChild(element);

		for (let i = 0; i < 20; i++) {
			//element.on('loaded', () => {});
			view.on('loaded', () => {});
		}
		// Cache views to prevent GC from kicking in.
		const views = [];
		suite
			.add('new FlexboxLayout()', () => {
				views.push(new FlexboxLayout());
			})
			// .add('document.createElement', () => {
			// 	document.createElement('view-element');
			// })
			.add('view.notify (20 Listeners)', () => {
				view.notify({
					eventName: 'loaded',
					object: view,
				});
			})
			// .add('element.dispatchEvent (20 Listeners)', () => {
			// 	element.dispatchEvent(new Event('loaded'));
			// })
			.add('view.addChild (shallow)', () => {
				view.addChild(new FlexboxLayout());
			})
			// .add('element.appendChild (shallow)', () => {
			// 	element.appendChild(document.createElement('view-element'));
			// })
			.add('view.addChild (deep)', () => {
				let current = view;
				for (let i = 0; i < 3; i++) {
					const child = new FlexboxLayout();
					current.addChild(child);
					current = child;
				}
			})
			// .add('element.appendChild (deep)', () => {
			// 	let current = element;
			// 	for (let i = 0; i < 10; i++) {
			// 		const child = document.createElement('view-element');
			// 		current.appendChild(child);
			// 		current = child;
			// 	}
			// })
			.on('cycle', function (event) {
				console.log(String(event.target));
			})
			.run({ async: true });

		return root;
	},
});
