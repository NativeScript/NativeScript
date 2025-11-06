// stubs to avoid bundler warnings
export const updateContentDescription = (view: any /* View */, forceUpdate?: boolean): string | null => null;
export function applyContentDescription(view: any /* View */, forceUpdate?: boolean) {
	return null;
}
export function androidGetCurrentActivity() {}
export function androidGetForegroundActivity() {}
export function androidSetForegroundActivity(activity: androidx.appcompat.app.AppCompatActivity): void {}
export function androidGetStartActivity() {}
export function androidSetStartActivity(activity: androidx.appcompat.app.AppCompatActivity): void {}

export function setupAccessibleView(view: any /* any */): void {
	const uiView = view.nativeViewProtected as UIView;
	if (!uiView) {
		return;
	}

	/**
	 * We need to map back from the UIView to the NativeScript View.
	 *
	 * We do that by setting the uiView's tag to the View's domId.
	 * This way we can do reverse lookup.
	 */
	uiView.tag = view._domId;
}
