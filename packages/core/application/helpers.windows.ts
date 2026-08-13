// Stubs to avoid bundler warnings on Windows — mirrors helpers.ios.ts shape.
export const updateContentDescription = (_view: any, _forceUpdate?: boolean): string | null => null;

export function applyContentDescription(_view: any, _forceUpdate?: boolean) {
	return null;
}

export function androidGetCurrentActivity() {}
export function androidGetForegroundActivity() {}
export function androidSetForegroundActivity(_activity: any): void {}
export function androidGetStartActivity() {}
export function androidSetStartActivity(_activity: any): void {}

export function setupAccessibleView(_view: any): void {}
