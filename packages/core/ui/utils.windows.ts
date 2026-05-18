export namespace ios {
	export function getActualHeight(_view: any): number {
		return 0;
	}
	export function getStatusBarHeight(_viewController?: any): number {
		return 0;
	}
	export function _layoutRootView(_rootView: any, _parentBounds: any) {}
}

export namespace windows {
	export function getActualHeight(_view: any): number {
		return 0;
	}
}

export type NativeScriptUIView = any;
