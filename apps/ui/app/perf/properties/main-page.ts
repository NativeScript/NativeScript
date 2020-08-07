import { StackLayout } from '@nativescript/core/ui/layouts/stack-layout';
import { TextView } from '@nativescript/core/ui/text-view';
import { Button } from '@nativescript/core/ui/button';

import * as tests from './tests';

const c = [10, 100, 1000, 10000, 100000];

function getStack(stack: StackLayout): StackLayout {
	let p = new StackLayout();
	stack.removeChildren();
	stack.addChild(p);

	return p;
}

let runner;

export function onNavigatingFrom() {
	clearInterval(runner);
}

export function onTap3(args) {
	let btn = <Button>args.object;
	const p = btn.page.getViewById<StackLayout>('placeholder');
	btn.text = 'Start tests...';

	let result = btn.page.getViewById<TextView>('result');

	result.text = '';

	function track(line: string) {
		console.log(line);
		result.fontSize = 10;
		result.text += line + '\n';
	}

	let text = 'Count';
	c.forEach((e) => {
		text += `\t${e}`;
	});
	track(text);

	let tasks = [
		() => track(tests.setBackgroundColor(c)),
		() => track(tests.setBackgroundColor(c, getStack(p))),
		() => track(tests.setBindingContext(c)),
		() => track(tests.setBindingContext(c, getStack(p))),
		() => track(tests.setBindingContextWithParents(c, getStack(p))),
		() => track(tests.setBindingContextWithParentsBound(c, getStack(p))),
		() => track(tests.setBorderWidths(c)),
		() => track(tests.setBorderWidths(c, getStack(p))),
		() => track(tests.setFontSize(c)),
		() => track(tests.setFontSize(c, getStack(p))),
		() => track(tests.setFontSizeWithParents(c, getStack(p))),
		() => track(tests.setFontWeight(c)),
		() => track(tests.setFontWeight(c, getStack(p))),
		() => track(tests.setFontWeightWithParents(c, getStack(p))),
		() => track(tests.setColor(c)),
		() => track(tests.setColor(c, getStack(p))),
		() => track(tests.setColorWithParents(c, getStack(p))),
		() => track(tests.setText(c)),
		() => track(tests.setText(c, getStack(p))),
		() => track(tests.addRemove(c, getStack(p))),
		() => track('Complete!'),
	];
	let i = 0;
	runner = setInterval(nextTask, 1);
	function nextTask() {
		if (i < tasks.length) {
			tasks[i]();
			i++;
		} else {
			clearInterval(runner);
		}
	}
}
