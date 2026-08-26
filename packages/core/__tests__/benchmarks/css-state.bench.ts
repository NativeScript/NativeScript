import { bench, describe } from 'vitest';

import { StyleScope, addTaggedAdditionalCSS, removeTaggedAdditionalCSS } from '../../ui/styling/style-scope';
import { StackLayout } from '../../ui/layouts/stack-layout';
import { Label } from '../../ui/label';
import type { ViewBase } from '../../ui/core/view-base';

/**
 * A stylesheet shaped like a themed app (the kind `@nativescript/theme` ships).
 */
function themeCss(): string {
	const parts: string[] = ['* { font-family: sans-serif; }'];
	const types = ['label', 'button', 'stacklayout', 'image', 'textfield'];

	for (const type of types) {
		parts.push(`${type} { color: #222222; font-size: 14; }`);
		parts.push(`${type}.accent { color: #0088cc; }`);
		parts.push(`${type}:highlighted { background-color: #eeeeee; }`);
	}

	for (let i = 0; i < 80; i++) {
		parts.push(`.cls-${i} { margin: ${i % 20}; padding: ${i % 10}; }`);
		parts.push(`.cls-${i} .child-${i} { color: #333333; }`);
	}

	return parts.join('\n');
}

/**
 * Component-level CSS the way Angular's emulated encapsulation emits it:
 * every rule carries a `[_ngcontent-cN]` attribute selector.
 */
function componentCss(componentIndex: number): string {
	const attr = `_ngcontent-c${componentIndex}`;

	return [`.title[${attr}] { color: #111111; font-size: 18; }`, `.body[${attr}] { color: #444444; font-size: 13; }`, `label[${attr}] { margin: 2; }`].join('\n');
}

const COMPONENT_COUNT = 30;

function buildTree(viewCount: number, ngComponentIndex?: number): { root: StackLayout; views: ViewBase[] } {
	const root = new StackLayout();
	const views: ViewBase[] = [];

	let current: StackLayout = root;
	for (let i = 0; i < viewCount; i++) {
		if (i % 8 === 0) {
			const layout = new StackLayout();
			current.addChild(layout);
			current = layout;
			views.push(layout);
			continue;
		}

		const view = new Label();
		view.className = `cls-${i % 80} ${i % 5 === 0 ? 'accent' : 'title'}`;
		current.addChild(view);
		views.push(view);
	}

	if (ngComponentIndex !== undefined) {
		// Angular's EmulatedRenderer sets a content attribute on every element it creates.
		const attr = `_ngcontent-c${ngComponentIndex}`;
		for (const view of views) {
			view[attr] = '';
		}
	}

	return { root, views };
}

function attachScope(root: StackLayout, views: ViewBase[], scope: StyleScope): void {
	root._styleScope = scope;
	for (const view of views) {
		view._styleScope = scope;
	}
}

function styleTree(views: ViewBase[]): void {
	for (const view of views) {
		// The load path: match selectors, subscribe for dynamic updates, apply values.
		view._cssState.onLoaded();
	}
}

function restyleTree(views: ViewBase[]): void {
	for (const view of views) {
		view._cssState.onChange();
		view._cssState.onLoaded();
	}
}

describe('css state - initial styling', () => {
	const scope = new StyleScope();
	scope.css = themeCss();

	bench('style a 400 view tree (plain css)', () => {
		const { root, views } = buildTree(400);
		attachScope(root, views, scope);
		styleTree(views);
	});

	const ngScope = new StyleScope();
	ngScope.css = themeCss() + '\n' + Array.from({ length: COMPONENT_COUNT }, (_, i) => componentCss(i)).join('\n');

	bench('style a 400 view tree (angular attribute-scoped css)', () => {
		const { root, views } = buildTree(400, 3);
		attachScope(root, views, ngScope);
		styleTree(views);
	});
});

describe('css state - dynamic updates', () => {
	const scope = new StyleScope();
	scope.css = themeCss();

	const { root, views } = buildTree(200);
	attachScope(root, views, scope);
	styleTree(views);

	bench('re-apply matched properties for 200 views (no actual change)', () => {
		for (const view of views) {
			(view._cssState as any).updateDynamicState();
		}
	});

	bench('toggle a pseudo class on 200 views', () => {
		for (const view of views) {
			view.addPseudoClass('highlighted');
		}
		for (const view of views) {
			view.deletePseudoClass('highlighted');
		}
	});
});

describe('css state - adding css at runtime (angular component styles)', () => {
	bench('add 30 component stylesheets and restyle a 200 view tree', () => {
		const scope = new StyleScope();
		scope.css = themeCss();

		const { root, views } = buildTree(200, 3);
		attachScope(root, views, scope);
		styleTree(views);

		for (let i = 0; i < COMPONENT_COUNT; i++) {
			addTaggedAdditionalCSS(componentCss(i), `bench-component-${i}`);
			// Angular creates the component's views right after registering its styles,
			// which forces the scope to rebuild and every view to re-match.
			restyleTree(views);
		}

		for (let i = 0; i < COMPONENT_COUNT; i++) {
			removeTaggedAdditionalCSS(`bench-component-${i}`);
		}
	});
});

describe('css state - angular component loading', () => {
	// What actually happens when an Angular app navigates: each component registers
	// its (attribute scoped) styles the first time it is used, then immediately
	// creates and styles its own views.
	bench('load 30 components (register styles + style 20 views each)', () => {
		const scope = new StyleScope();
		scope.css = themeCss();

		for (let i = 0; i < COMPONENT_COUNT; i++) {
			addTaggedAdditionalCSS(componentCss(i), `bench-ng-${i}`);

			const { root, views } = buildTree(20, i);
			attachScope(root, views, scope);
			styleTree(views);
		}

		for (let i = 0; i < COMPONENT_COUNT; i++) {
			removeTaggedAdditionalCSS(`bench-ng-${i}`);
		}
	});
});

describe('css state - selector scope construction', () => {
	const css = themeCss();

	bench('build a StyleScope from a themed stylesheet', () => {
		const scope = new StyleScope();
		scope.css = css;
		scope.ensureSelectors();
	});
});
