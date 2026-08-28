import { describe, it, expect } from 'vitest';

import { StyleScope } from './style-scope';
import { StackLayout } from '../layouts/stack-layout';
import { Label } from '../label';

function scoped(css: string) {
	const scope = new StyleScope();
	scope.css = css;

	const root: any = new StackLayout();
	root._styleScope = scope;

	return { scope, root };
}

describe('css matches an attribute assigned after the view was inserted', () => {
	function insertedIntoLoadedTree(css: string) {
		const { scope, root } = scoped(css);
		root._isLoaded = true;

		const view: any = new Label();
		root.addChild(view);
		view._styleScope = scope;

		return { root, view };
	}

	it('applies once the attribute lands on the view', () => {
		const { view } = insertedIntoLoadedTree('label[ngcontent] { color: red; }');

		view.ngcontent = '';
		view._cssState.onLoaded();

		expect(view.style.color.toString()).toBe('#FF0000');
	});

	it('applies once the attribute lands on an ancestor', () => {
		const { root, view } = insertedIntoLoadedTree('stacklayout[ngcontent] label { color: red; }');

		root.ngcontent = '';
		view._cssState.onLoaded();

		expect(view.style.color.toString()).toBe('#FF0000');
	});

	it('applies on a later dynamic update', () => {
		const { view } = insertedIntoLoadedTree('label[ngcontent] { color: red; }');

		view.ngcontent = '';
		view._cssState.updateDynamicState();

		expect(view.style.color.toString()).toBe('#FF0000');
	});

	it('leaves a view without the attribute alone', () => {
		const { view } = insertedIntoLoadedTree('label[ngcontent] { color: red; }');

		view._cssState.onLoaded();

		expect(view.style.color).toBeUndefined();
	});
});
