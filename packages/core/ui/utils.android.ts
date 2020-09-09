export module ios {
	export function getActualHeight(view: any): number {
		throw new Error('Not implemented for Android');
	}

	export function getStatusBarHeight(viewController?: any): number {
		throw new Error('Not implemented for Android');
	}

	export function _layoutRootView(rootView: any, parentBounds: any) {
		throw new Error('Not implemented for Android');
	}
}
