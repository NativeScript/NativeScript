// A panel child's index in one native call. From JS, UIElementCollection.IndexOf returns only the
// bool (the runtime drops the out index), so the alternative is a GetAt call per sibling.

type UIElementCollection = Microsoft.UI.Xaml.Controls.UIElementCollection;
type UIElement = Microsoft.UI.Xaml.UIElement;

/** The child's index in `children`, or -1. */
export function nativeChildIndex(children: UIElementCollection, child: UIElement): number {
	return NativeScript.Widgets.PanelHelper.IndexOf(children, child);
}

/** False when `children` doesn't hold the child. */
export function removeNativeChild(children: UIElementCollection, child: UIElement): boolean {
	return NativeScript.Widgets.PanelHelper.Remove(children, child);
}
