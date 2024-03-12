import { View } from '..';

export class ViewHelper {
	/**
	 * Measure a child by taking into account its margins and a given measureSpecs.
	 * @param parent            This parameter is not used. You can pass null.
	 * @param child             The view to be measured.
	 * @param measuredWidth     The measured width that the parent layout specifies for this view.
	 * @param measuredHeight    The measured height that the parent layout specifies for this view.
	 */
	public static measureChild(parent: View, child: View, widthMeasureSpec: number, heightMeasureSpec: number): { measuredWidth: number; measuredHeight: number };

	/**
	 * Layout a child by taking into account its margins, horizontal and vertical alignments and a given bounds.
	 * @param parent    This parameter is not used. You can pass null.
	 * @param left      Left position, relative to parent
	 * @param top       Top position, relative to parent
	 * @param right     Right position, relative to parent
	 * @param bottom    Bottom position, relative to parent
	 */
	public static layoutChild(parent: View, child: View, left: number, top: number, right: number, bottom: number): void;

	/**
	 * Utility to reconcile a desired size and state, with constraints imposed
	 * by a MeasureSpec.  Will take the desired size, unless a different size
	 * is imposed by the constraints.  The returned value is a compound integer,
	 * with the resolved size in the MEASURED_SIZE_MASK bits and
	 * optionally the bit MEASURED_STATE_TOO_SMALL set if the resulting
	 * size is smaller than the size the view wants to be.
	 */
	public static resolveSizeAndState(size: number, specSize: number, specMode: number, childMeasuredState: number): number;

	public static combineMeasuredStates(curState: number, newState): number;
}

/**
 * Various Android view helper methods
 */
export namespace AndroidHelper {
	export function getDrawableColor(drawable: any /* android.graphics.drawable.Drawable */): Color;
	export function setDrawableColor(color: number, drawable: any /* android.graphics.drawable.Drawable */, blendMode?: any /* androidx.core.graphics.BlendModeCompat */): void;
	export function clearDrawableColor(drawable: any /* android.graphics.drawable.Drawable */): void;
	export function getCopyOrDrawable(drawable: any /* android.graphics.drawable.Drawable */, resources?: any /* android.content.res.Resources */): any; /* android.graphics.drawable.Drawable */
}

/**
 * Various iOS view helper methods
 */
export namespace IOSHelper {
	/**
	 * String value used when hooking to traitCollectionColorAppearanceChangedEvent event.
	 */
	export const traitCollectionColorAppearanceChangedEvent: string;

	/**
	 * Returns a view with viewController or undefined if no such found along the view's parent chain.
	 * @param view The view form which to start the search.
	 */
	export function getParentWithViewController(view: View): View;
	export function updateAutoAdjustScrollInsets(controller: any /* UIViewController */, owner: View): void;
	export function updateConstraints(controller: any /* UIViewController */, owner: View): void;
	export function layoutView(controller: any /* UIViewController */, owner: View): void;
	export function getPositionFromFrame(frame: any /* CGRect */): { left; top; right; bottom };
	export function getFrameFromPosition(position: { left; top; right; bottom }, insets?: { left; top; right; bottom }): any; /* CGRect */
	export function shrinkToSafeArea(view: View, frame: any /* CGRect */): any; /* CGRect */
	export function expandBeyondSafeArea(view: View, frame: any /* CGRect */): any; /* CGRect */
	export class UILayoutViewController {
		public static initWithOwner(owner: WeakRef<View>): UILayoutViewController;
	}
	export class UIAdaptivePresentationControllerDelegateImp {
		public static initWithOwnerAndCallback(owner: WeakRef<View>, whenClosedCallback: Function): UIAdaptivePresentationControllerDelegateImp;
	}
	export class UIPopoverPresentationControllerDelegateImp {
		public static initWithOwnerAndCallback(owner: WeakRef<View>, whenClosedCallback: Function): UIPopoverPresentationControllerDelegateImp;
	}
}
