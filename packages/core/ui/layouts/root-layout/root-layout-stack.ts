import { RootLayoutBase } from './root-layout-common';

const rootLayoutStack: RootLayoutBase[] = [];

export function _findRootLayoutById(id: string): RootLayoutBase {
	return rootLayoutStack.find((rootLayout) => rootLayout.id && rootLayout.id === id);
}

export function _pushInRootLayoutStack(rootLayout: RootLayoutBase): void {
	if (!rootLayoutStack.includes(rootLayout)) {
		rootLayoutStack.push(rootLayout);
	}
}

export function _removeFromRootLayoutStack(rootLayout: RootLayoutBase): void {
	const index = rootLayoutStack.indexOf(rootLayout);

	if (index > -1) {
		rootLayoutStack.splice(index, 1);
	}
}

export function _topmost(): RootLayoutBase {
	return rootLayoutStack[rootLayoutStack.length - 1];
}
