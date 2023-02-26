import { Application, Label, View, FlexboxLayout } from '@nativescript/core';

const bench = (fn: Function, times = 10) => {
	console.time(`bench: ${fn.name}`);
	for (let i = 0; i < times; i++) {
		fn();
	}
	console.timeEnd(`bench: ${fn.name}`);
};

// //@ts-ignore
// registerElement('view', FlexboxLayout);

// declare global {
// 	interface HTMLElementTagNameMap {
// 		view: View;
// 	}
// }

Application.run({
	create: () => {
		// bench(function warmup() {
		// 	new FlexboxLayout();
		// }, 1000);
		const element = new FlexboxLayout();
		bench(() => {
			bench(function addEvent() {
				element.addEventListener('loaded', (data) => {
					const d = data;
				});
			}, 100);
		}, 100);

		bench(() => {
			bench(function fireEvent() {
				element._emit('loaded');
			}, 1);
		}, 100);

		const view = new FlexboxLayout();

		return view;
	},
});
