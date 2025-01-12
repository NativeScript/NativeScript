// Definitions.
import type { Point, CustomLayoutView as CustomLayoutViewDefinition } from '.';
import type { GestureTypes, GestureEventData } from '../../gestures';

// Types.
import { ViewCommon, isEnabledProperty, originXProperty, originYProperty, isUserInteractionEnabledProperty, testIDProperty, AndroidHelper } from './view-common';
import { paddingLeftProperty, paddingTopProperty, paddingRightProperty, paddingBottomProperty, Length } from '../../styling/style-properties';
import { layout } from '../../../utils';
import { Trace } from '../../../trace';
import { ShowModalOptions, hiddenProperty } from '../view-base';
import { EventData } from '../../../data/observable';

import { perspectiveProperty, visibilityProperty, opacityProperty, horizontalAlignmentProperty, verticalAlignmentProperty, minWidthProperty, minHeightProperty, widthProperty, heightProperty, marginLeftProperty, marginTopProperty, marginRightProperty, marginBottomProperty, rotateProperty, rotateXProperty, rotateYProperty, scaleXProperty, scaleYProperty, translateXProperty, translateYProperty, zIndexProperty, backgroundInternalProperty, androidElevationProperty, androidDynamicElevationOffsetProperty } from '../../styling/style-properties';
import { CoreTypes } from '../../../core-types';

import { Background, BackgroundClearFlags, refreshBorderDrawable } from '../../styling/background';
import { profile } from '../../../profiling';
import { topmost } from '../../frame/frame-stack';
import { Device, Screen } from '../../../platform';
import { AndroidActivityBackPressedEventData, Application } from '../../../application';
import { accessibilityEnabledProperty, accessibilityHiddenProperty, accessibilityHintProperty, accessibilityIdentifierProperty, accessibilityLabelProperty, accessibilityLanguageProperty, accessibilityLiveRegionProperty, accessibilityMediaSessionProperty, accessibilityRoleProperty, accessibilityStateProperty, accessibilityValueProperty } from '../../../accessibility/accessibility-properties';
import { AccessibilityLiveRegion, AccessibilityRole, AndroidAccessibilityEvent, isAccessibilityServiceEnabled, sendAccessibilityEvent, updateAccessibilityProperties, updateContentDescription, AccessibilityState } from '../../../accessibility';
import * as Utils from '../../../utils';
import { SDK_VERSION } from '../../../utils/constants';
import { BoxShadow } from '../../styling/box-shadow';
import { _setAndroidFragmentTransitions, _getAnimatedEntries, _updateTransitions, _reverseTransitions, _clearEntry, _clearFragment, addNativeTransitionListener } from '../../frame/fragment.transitions';
import { NativeScriptAndroidView } from '../../utils';

export * from './view-common';
// helpers (these are okay re-exported here)
export * from './view-helper';
// This one can eventually be cleaned up but causes issues with a lot of ui-suite plugins in particular if not exported here
export * from '../properties';

const DOMID = '_domId';
const androidBackPressedEvent = 'androidBackPressed';

const shortAnimTime = 17694720; // android.R.integer.config_shortAnimTime
const statePressed = 16842919; // android.R.attr.state_pressed
const stateEnabled = 16842910; // android.R.attr.state_enabled
const styleAnimationDialog = 16973826; // android.R.style.Animation_Dialog

const VERTICAL_GRAVITY_MASK = 112; // android.view.Gravity.VERTICAL_GRAVITY_MASK
const HORIZONTAL_GRAVITY_MASK = 7; // android.view.Gravity.HORIZONTAL_GRAVITY_MASK
const GRAVITY_LEFT = 3; // android.view.Gravity.LEFT
const GRAVITY_RIGHT = 5; // android.view.Gravity.RIGHT
const GRAVITY_TOP = 48; // android.view.Gravity.TOP
const GRAVITY_BOTTOM = 80; // android.view.Gravity.BOTTOM
const GRAVITY_CENTER_HORIZONTAL = 1; // android.view.Gravity.CENTER_HORIZONTAL
const GRAVITY_FILL_HORIZONTAL = 7; // android.view.Gravity.FILL_HORIZONTAL
const GRAVITY_CENTER_VERTICAL = 16; // android.view.Gravity.CENTER_VERTICAL
const GRAVITY_FILL_VERTICAL = 112; // android.view.Gravity.FILL_VERTICAL

const modalMap = new Map<number, DialogOptions>();

let TouchListener: TouchListener;
let DialogFragment: DialogFragment;

interface DialogOptions {
	owner: View;
	fullscreen: boolean;
	animated: boolean;
	stretched: boolean;
	cancelable: boolean;
	windowSoftInputMode: number;
	shownCallback: () => void;
	dismissCallback: () => void;
}

interface TouchListener {
	new (owner: View): android.view.View.OnTouchListener;
}

interface DialogFragment {
	new (): androidx.fragment.app.DialogFragment;
}

function initializeTouchListener(): void {
	if (TouchListener) {
		return;
	}

	@NativeClass
	@Interfaces([android.view.View.OnTouchListener])
	class TouchListenerImpl extends java.lang.Object implements android.view.View.OnTouchListener {
		private owner: WeakRef<View>;
		constructor(owner: View) {
			super();
			this.owner = new WeakRef(owner);

			return global.__native(this);
		}

		onTouch(view: android.view.View, event: android.view.MotionEvent): boolean {
			const owner = this.owner.get();
			if (!owner) {
				return;
			}
			owner.handleGestureTouch(event);

			const nativeView = owner.nativeViewProtected;
			if (!nativeView || !nativeView.onTouchEvent) {
				return false;
			}

			return nativeView.onTouchEvent(event);
		}
	}

	TouchListener = TouchListenerImpl;
}

function initializeDialogFragment() {
	if (DialogFragment) {
		return;
	}

	@NativeClass
	class DialogImpl extends android.app.Dialog {
		constructor(
			public fragment: DialogFragmentImpl,
			context: android.content.Context,
			themeResId: number,
		) {
			super(context, themeResId);

			return global.__native(this);
		}

		public onDetachedFromWindow(): void {
			super.onDetachedFromWindow();
			this.fragment = null;
		}

		public onBackPressed(): void {
			const view = this.fragment.owner;
			const args = <AndroidActivityBackPressedEventData>{
				eventName: 'activityBackPressed',
				object: view,
				activity: view._context,
				cancel: false,
			};

			// Fist fire application.android global event
			Application.android.notify(args);
			if (args.cancel) {
				return;
			}

			view.notify(args);

			if (!args.cancel && !view.onBackPressed()) {
				super.onBackPressed();
			}
		}
	}

	@NativeClass
	class DialogFragmentImpl extends androidx.fragment.app.DialogFragment {
		public owner: View;
		private _fullscreen: boolean;
		private _windowSoftInputMode: number;
		private _animated: boolean;
		private _stretched: boolean;
		private _cancelable: boolean;
		private _shownCallback: () => void;
		private _dismissCallback: () => void;
		private activity: WeakRef<android.app.Activity>;

		constructor() {
			super();

			return global.__native(this);
		}
		public onCreate(savedInstanceState: android.os.Bundle) {
			super.onCreate(savedInstanceState);
			const ownerId = this.getArguments()?.getInt(DOMID);
			const options = getModalOptions(ownerId);
			// The teardown when the activity is destroyed happens after the state is saved, but is not recoverable,
			// Cancel the native dialog in this case or the app will crash with subsequent errors.
			if (savedInstanceState != null && options === undefined) {
				this.dismissAllowingStateLoss();
			}
		}
		public onCreateDialog(savedInstanceState: android.os.Bundle): android.app.Dialog {
			const ownerId = this.getArguments().getInt(DOMID);
			const options = getModalOptions(ownerId);
			this.owner = options.owner;
			// Set owner._dialogFragment to this in case the DialogFragment was recreated after app suspend
			this.owner._dialogFragment = this;
			this._fullscreen = options.fullscreen;
			this._animated = options.animated;
			this._cancelable = options.cancelable;
			this._stretched = options.stretched;
			this._dismissCallback = options.dismissCallback;
			this._shownCallback = options.shownCallback;
			this._windowSoftInputMode = options.windowSoftInputMode;
			this.setStyle(androidx.fragment.app.DialogFragment.STYLE_NO_TITLE, 0);

			let theme = this.getTheme();
			if (this._fullscreen) {
				// In fullscreen mode, get the application's theme.
				theme = this.getActivity().getApplicationInfo().theme;
			}

			const dialog = new DialogImpl(this, this.getActivity(), theme);

			// do not override alignment unless fullscreen modal will be shown;
			// otherwise we might break component-level layout:
			// https://github.com/NativeScript/NativeScript/issues/5392
			if (!this._fullscreen && !this._stretched) {
				this.owner.horizontalAlignment = 'center';
				this.owner.verticalAlignment = 'middle';
			} else {
				this.owner.horizontalAlignment = 'stretch';
				this.owner.verticalAlignment = 'stretch';
			}

			// set the modal window animation
			// https://github.com/NativeScript/NativeScript/issues/5989
			if (this._animated) {
				dialog.getWindow().setWindowAnimations(styleAnimationDialog);
			}

			dialog.setCanceledOnTouchOutside(this._cancelable);

			return dialog;
		}

		public onCreateView(inflater: android.view.LayoutInflater, container: android.view.ViewGroup, savedInstanceState: android.os.Bundle): android.view.View {
			const owner = this.owner;
			this.activity = new WeakRef(this.getActivity());
			owner._setupAsRootView(this.getActivity());
			owner._isAddedToNativeVisualTree = true;

			// we need to set the window SoftInputMode here.
			// it wont work is set in onStart
			const window = this.getDialog().getWindow();
			if (this._windowSoftInputMode !== undefined) {
				window.setSoftInputMode(this._windowSoftInputMode);
			} else {
				// the dialog seems to not follow the default activity softInputMode,
				// thus set we set it here.
				window.setSoftInputMode((<androidx.appcompat.app.AppCompatActivity>owner._context).getWindow().getAttributes().softInputMode);
			}
			return owner.nativeViewProtected;
		}

		public onStart(): void {
			super.onStart();
			if (this._fullscreen) {
				const window = this.getDialog().getWindow();
				const length = android.view.ViewGroup.LayoutParams.MATCH_PARENT;
				window.setLayout(length, length);
				// This removes the default backgroundDrawable so there are no margins.
				window.setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(android.graphics.Color.WHITE));
			}

			const owner = this.owner;
			if (owner && !owner.isLoaded) {
				owner.callLoaded();
			}

			this._shownCallback();
		}

		public onDismiss(dialog: android.content.DialogInterface): void {
			super.onDismiss(dialog);
			const manager = this.getFragmentManager();
			const activity = this.activity?.get();
			if (manager && !activity?.isChangingConfigurations()) {
				removeModal(this.owner._domId);
				this._dismissCallback();
			}

			const owner = this.owner;
			if (owner && owner.isLoaded) {
				owner.callUnloaded();
			}
		}

		public onDestroy(): void {
			super.onDestroy();
			const owner = this.owner;
			const activity = this.activity?.get();
			if (!activity?.isChangingConfigurations()) {
				this.activity = null;
			}

			if (owner) {
				// Android calls onDestroy before onDismiss.
				// Make sure we unload first and then call _tearDownUI.
				if (owner.isLoaded) {
					owner.callUnloaded();
				}

				owner._isAddedToNativeVisualTree = false;
				owner._tearDownUI(true);
			}
		}
	}

	DialogFragment = DialogFragmentImpl;
}

function saveModal(options: DialogOptions) {
	modalMap.set(options.owner._domId, options);
}

function removeModal(domId: number) {
	modalMap.delete(domId);
}

function getModalOptions(domId: number): DialogOptions {
	return modalMap.get(domId);
}

export class View extends ViewCommon {
	public static androidBackPressedEvent = androidBackPressedEvent;

	public _dialogFragment: androidx.fragment.app.DialogFragment;
	public _manager: androidx.fragment.app.FragmentManager;
	private touchListenerIsSet: boolean;
	private touchListener: android.view.View.OnTouchListener;
	private layoutChangeListenerIsSet: boolean;
	private layoutChangeListener: android.view.View.OnLayoutChangeListener;
	private _rootManager: androidx.fragment.app.FragmentManager;

	nativeViewProtected: android.view.View;

	// TODO: Implement unobserve that detach the touchListener.
	_observe(type: GestureTypes, callback: (args: GestureEventData) => void, thisArg?: any): void {
		super._observe(type, callback, thisArg);
		if (this.isLoaded && !this.touchListenerIsSet) {
			this.setOnTouchListener();
		}
	}

	addEventListener(eventNames: string, callback: (data: EventData) => void, thisArg?: any) {
		super.addEventListener(eventNames, callback, thisArg);
		const isLayoutEvent = typeof eventNames === 'string' ? eventNames.indexOf(ViewCommon.layoutChangedEvent) !== -1 : false;

		if (this.isLoaded && !this.layoutChangeListenerIsSet && isLayoutEvent) {
			this.setOnLayoutChangeListener();
		}
	}

	removeEventListener(eventNames: string, callback?: (data: EventData) => void, thisArg?: any) {
		super.removeEventListener(eventNames, callback, thisArg);
		const isLayoutEvent = typeof eventNames === 'string' ? eventNames.indexOf(ViewCommon.layoutChangedEvent) !== -1 : false;

		// Remove native listener only if there are no more user listeners for LayoutChanged event
		if (this.isLoaded && this.layoutChangeListenerIsSet && isLayoutEvent && !this.needsOnLayoutChangeListener()) {
			this.nativeViewProtected.removeOnLayoutChangeListener(this.layoutChangeListener);
			this.layoutChangeListenerIsSet = false;
		}
	}

	public _getChildFragmentManager(): androidx.fragment.app.FragmentManager {
		return null;
	}

	public _getRootFragmentManager(): androidx.fragment.app.FragmentManager {
		if (!this._rootManager && this._context) {
			this._rootManager = (<androidx.fragment.app.FragmentActivity>this._context).getSupportFragmentManager();
		}

		return this._rootManager;
	}

	public _getFragmentManager(): androidx.fragment.app.FragmentManager {
		let manager = this._manager;
		if (!manager) {
			let view: View = this;
			let frameOrTabViewItemFound = false;
			while (view) {
				// when interacting with nested fragments instead of using getSupportFragmentManager
				// we must always use getChildFragmentManager instead;
				// we have three sources of fragments -- Frame fragments, TabViewItem fragments, and
				// modal dialog fragments

				// modal -> frame / tabview (frame / tabview use modal CHILD fm)
				const dialogFragment = view._dialogFragment;
				if (dialogFragment) {
					manager = dialogFragment.getChildFragmentManager();
					break;
				}

				// - frame1 -> frame2 (frame2 uses frame1 CHILD fm)
				// - tabview -> frame1 (frame1 uses tabview item CHILD fm)
				// - frame1 -> tabview (tabview uses frame1 CHILD fm)
				// - frame1 -> tabview -> frame2 (tabview uses frame1 CHILD fm; frame2 uses tabview item CHILD fm)
				if (view._hasFragments) {
					if (frameOrTabViewItemFound) {
						manager = view._getChildFragmentManager();
						break;
					}

					frameOrTabViewItemFound = true;
				}

				// the case is needed because _dialogFragment is on View
				// but parent may be ViewBase.
				view = view.parent as View;
			}

			if (!manager) {
				manager = this._getRootFragmentManager();
			}

			this._manager = manager;
		}

		return manager;
	}

	@profile
	public onLoaded() {
		this._manager = null;
		this._rootManager = null;
		super.onLoaded();
		this.setOnTouchListener();
	}

	@profile
	public onUnloaded() {
		this._manager = null;
		this._rootManager = null;
		super.onUnloaded();
	}

	public onBackPressed(): boolean {
		const topmostFrame = topmost();

		// Delegate back navigation handling to the topmost Frame
		// when it's a child of the current View.
		if (topmostFrame && topmostFrame._hasAncestorView(this)) {
			return topmostFrame.onBackPressed();
		}

		return false;
	}

	public handleGestureTouch(event: android.view.MotionEvent): any {
		for (const type in this._gestureObservers) {
			const list = this._gestureObservers[type];
			list.forEach((element) => {
				element.androidOnTouchEvent(event);
			});
		}
		if (this.parent instanceof View) {
			this.parent.handleGestureTouch(event);
		}
	}

	hasGestureObservers() {
		return this._gestureObservers && Object.keys(this._gestureObservers).length > 0;
	}

	public initNativeView(): void {
		super.initNativeView();

		if (this.needsOnLayoutChangeListener()) {
			this.setOnLayoutChangeListener();
		}
	}

	public needsOnLayoutChangeListener() {
		return this.hasListeners(ViewCommon.layoutChangedEvent);
	}

	public disposeNativeView(): void {
		if (this.touchListenerIsSet) {
			this.touchListenerIsSet = false;
			if (this.nativeViewProtected) {
				this.nativeViewProtected.setOnTouchListener(null);
			}
		}
		if (this.layoutChangeListenerIsSet) {
			this.layoutChangeListenerIsSet = false;
			if (this.nativeViewProtected) {
				this.nativeViewProtected.removeOnLayoutChangeListener(this.layoutChangeListener);
				this.layoutChangeListener = null;
			}
		}
		super.disposeNativeView();
	}

	setOnTouchListener() {
		if (this.touchListenerIsSet || !this.nativeViewProtected || !this.hasGestureObservers()) {
			return;
		}

		// do not set noop listener that handles the event (disabled listener) if IsUserInteractionEnabled is
		// false as we might need the ability for the event to pass through to a parent view
		initializeTouchListener();
		this.touchListener = this.touchListener || new TouchListener(this);
		this.nativeViewProtected.setOnTouchListener(this.touchListener);

		this.touchListenerIsSet = true;

		if (this.nativeViewProtected.setClickable) {
			this.nativeViewProtected.setClickable(this.isUserInteractionEnabled);
		}
	}

	private setOnLayoutChangeListener() {
		if (this.nativeViewProtected) {
			const owner = this;
			this.layoutChangeListenerIsSet = true;
			this.layoutChangeListener =
				this.layoutChangeListener ||
				new android.view.View.OnLayoutChangeListener({
					onLayoutChange(v: android.view.View, left: number, top: number, right: number, bottom: number, oldLeft: number, oldTop: number, oldRight: number, oldBottom: number): void {
						if (left !== oldLeft || top !== oldTop || right !== oldRight || bottom !== oldBottom) {
							owner._raiseLayoutChangedEvent();
						}
					},
				});

			this.nativeViewProtected.addOnLayoutChangeListener(this.layoutChangeListener);
		}
	}

	get isLayoutRequired(): boolean {
		return !this.isLayoutValid;
	}

	get isLayoutValid(): boolean {
		if (this.nativeViewProtected) {
			return !this.nativeViewProtected.isLayoutRequested();
		}

		return false;
	}

	get _hasFragments(): boolean {
		return false;
	}

	public layoutNativeView(left: number, top: number, right: number, bottom: number): void {
		if (this.nativeViewProtected) {
			this.nativeViewProtected.layout(left, top, right, bottom);
		}
	}

	@profile
	public requestLayout(): void {
		super.requestLayout();
		if (this.nativeViewProtected) {
			this.nativeViewProtected.requestLayout();
		}
	}

	public measure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		super.measure(widthMeasureSpec, heightMeasureSpec);
		this.onMeasure(widthMeasureSpec, heightMeasureSpec);
	}

	public layout(left: number, top: number, right: number, bottom: number): void {
		super.layout(left, top, right, bottom);
		this.onLayout(left, top, right, bottom);
	}

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		const view = this.nativeViewProtected;
		if (view) {
			view.measure(widthMeasureSpec, heightMeasureSpec);
			this.setMeasuredDimension(view.getMeasuredWidth(), view.getMeasuredHeight());
		}
	}

	public onLayout(left: number, top: number, right: number, bottom: number): void {
		const view = this.nativeViewProtected;
		if (view) {
			this.layoutNativeView(left, top, right, bottom);
		}
	}

	_getCurrentLayoutBounds(): {
		left: number;
		top: number;
		right: number;
		bottom: number;
	} {
		if (this.nativeViewProtected && !this.isCollapsed) {
			return {
				left: this.nativeViewProtected.getLeft(),
				top: this.nativeViewProtected.getTop(),
				right: this.nativeViewProtected.getRight(),
				bottom: this.nativeViewProtected.getBottom(),
			};
		} else {
			return { left: 0, top: 0, right: 0, bottom: 0 };
		}
	}

	public getMeasuredWidth(): number {
		if (this.nativeViewProtected) {
			return this.nativeViewProtected.getMeasuredWidth();
		}

		return super.getMeasuredWidth();
	}

	public getMeasuredHeight(): number {
		if (this.nativeViewProtected) {
			return this.nativeViewProtected.getMeasuredHeight();
		}

		return super.getMeasuredHeight();
	}

	public focus(): boolean {
		if (this.nativeViewProtected) {
			return this.nativeViewProtected.requestFocus();
		}

		return false;
	}

	public getLocationInWindow(): Point {
		if (!this.nativeViewProtected || !this.nativeViewProtected.getWindowToken()) {
			return undefined;
		}

		const nativeArray = (<any>Array).create('int', 2);
		this.nativeViewProtected.getLocationInWindow(nativeArray);

		return {
			x: layout.toDeviceIndependentPixels(nativeArray[0]),
			y: layout.toDeviceIndependentPixels(nativeArray[1]),
		};
	}

	public getLocationOnScreen(): Point {
		if (!this.nativeViewProtected || !this.nativeViewProtected.getWindowToken()) {
			return undefined;
		}

		const nativeArray = (<any>Array).create('int', 2);
		this.nativeViewProtected.getLocationOnScreen(nativeArray);

		return {
			x: layout.toDeviceIndependentPixels(nativeArray[0]),
			y: layout.toDeviceIndependentPixels(nativeArray[1]),
		};
	}

	public getLocationRelativeTo(otherView: ViewCommon): Point {
		if (!this.nativeViewProtected || !this.nativeViewProtected.getWindowToken() || !otherView || !otherView.nativeViewProtected || !otherView.nativeViewProtected.getWindowToken() || this.nativeViewProtected.getWindowToken() !== otherView.nativeViewProtected.getWindowToken()) {
			return undefined;
		}

		const myArray = (<any>Array).create('int', 2);
		this.nativeViewProtected.getLocationOnScreen(myArray);
		const otherArray = (<any>Array).create('int', 2);
		otherView.nativeViewProtected.getLocationOnScreen(otherArray);

		return {
			x: layout.toDeviceIndependentPixels(myArray[0] - otherArray[0]),
			y: layout.toDeviceIndependentPixels(myArray[1] - otherArray[1]),
		};
	}

	public static resolveSizeAndState(size: number, specSize: number, specMode: number, childMeasuredState: number): number {
		let result = size;
		switch (specMode) {
			case layout.UNSPECIFIED:
				result = size;
				break;

			case layout.AT_MOST:
				if (specSize < size) {
					result = specSize | layout.MEASURED_STATE_TOO_SMALL;
				}
				break;

			case layout.EXACTLY:
				result = specSize;
				break;
		}

		return result | (childMeasuredState & layout.MEASURED_STATE_MASK);
	}
	protected _showNativeModalView(parent: View, options: ShowModalOptions) {
		// if the app is in background while triggering _showNativeModalView
		// then DialogFragment.show will trigger IllegalStateException: Can not perform this action after onSaveInstanceState
		// so if in background we create an event to call _showNativeModalView when loaded (going back in foreground)
		if (Application.inBackground && !parent.isLoaded) {
			const onLoaded = () => {
				parent.off('loaded', onLoaded);
				this._showNativeModalView(parent, options);
			};
			parent.on('loaded', onLoaded);
			return;
		}
		super._showNativeModalView(parent, options);
		initializeDialogFragment();

		const df = new DialogFragment();
		const args = new android.os.Bundle();
		args.putInt(DOMID, this._domId);
		df.setArguments(args);

		let cancelable = true;
		let windowSoftInputMode: number;

		if (options.android) {
			if ((<any>options).android.cancelable !== undefined) {
				cancelable = !!(<any>options).android.cancelable;
				console.log('ShowModalOptions.android.cancelable is deprecated. Use ShowModalOptions.cancelable instead.');
			}
			windowSoftInputMode = (<any>options).android.windowSoftInputMode;
		}

		cancelable = options.cancelable !== undefined ? !!options.cancelable : cancelable;

		const dialogOptions: DialogOptions = {
			owner: this,
			fullscreen: !!options.fullscreen,
			animated: !!options.animated,
			stretched: !!options.stretched,
			cancelable: cancelable,
			windowSoftInputMode: windowSoftInputMode,
			shownCallback: () => this._raiseShownModallyEvent(),
			dismissCallback: () => this.closeModal(),
		};

		saveModal(dialogOptions);

		this._dialogFragment = df;
		this._raiseShowingModallyEvent();

		this._dialogFragment.show(parent._getRootFragmentManager(), this._domId.toString());
	}

	protected _hideNativeModalView(parent: View, whenClosedCallback: () => void) {
		if (this._dialogFragment) {
			const manager = this._dialogFragment.getFragmentManager();
			if (manager) {
				this._dialogFragment.dismissAllowingStateLoss();
			}
		}

		this._dialogFragment = null;
		whenClosedCallback();
	}

	[isEnabledProperty.setNative](value: boolean) {
		this.nativeViewProtected.setEnabled(value);
	}

	[originXProperty.getDefault](): number {
		return this.nativeViewProtected.getPivotX();
	}
	[originXProperty.setNative](value: number) {
		org.nativescript.widgets.OriginPoint.setX(this.nativeViewProtected, value);
	}

	[originYProperty.getDefault](): number {
		return this.nativeViewProtected.getPivotY();
	}
	[originYProperty.setNative](value: number) {
		org.nativescript.widgets.OriginPoint.setY(this.nativeViewProtected, value);
	}

	[isUserInteractionEnabledProperty.setNative](value: boolean) {
		this.nativeViewProtected.setClickable(value);
		this.nativeViewProtected.setFocusable(value);
	}

	[hiddenProperty.getDefault](): boolean {
		return this.nativeViewProtected.getVisibility() === android.view.View.GONE;
	}
	[hiddenProperty.setNative](value: boolean) {
		this.nativeViewProtected.setVisibility(value ? android.view.View.GONE : android.view.View.VISIBLE);
	}

	[visibilityProperty.getDefault](): CoreTypes.VisibilityType {
		const nativeVisibility = this.nativeViewProtected.getVisibility();
		switch (nativeVisibility) {
			case android.view.View.VISIBLE:
				return 'visible';
			case android.view.View.INVISIBLE:
				return 'hidden';
			case android.view.View.GONE:
				return 'collapse';
			default:
				throw new Error(`Unsupported android.view.View visibility: ${nativeVisibility}. Currently supported values are android.view.View.VISIBLE, android.view.View.INVISIBLE, android.view.View.GONE.`);
		}
	}
	[visibilityProperty.setNative](value: CoreTypes.VisibilityType) {
		switch (value) {
			case 'visible':
				this.nativeViewProtected.setVisibility(android.view.View.VISIBLE);
				break;
			case 'hidden':
				this.nativeViewProtected.setVisibility(android.view.View.INVISIBLE);
				break;
			case 'collapse':
				this.nativeViewProtected.setVisibility(android.view.View.GONE);
				break;
			default:
				throw new Error(`Invalid visibility value: ${value}. Valid values are: visible, hidden, collapse.`);
		}
	}

	[opacityProperty.getDefault](): number {
		return this.nativeViewProtected.getAlpha();
	}
	[opacityProperty.setNative](value: number) {
		this.nativeViewProtected.setAlpha(float(value));
	}

	[testIDProperty.setNative](value: string) {
		this.setAccessibilityIdentifier(this.nativeViewProtected, value);
	}

	setAccessibilityIdentifier(view, value) {
		const id = Utils.android.resources.getId(':id/nativescript_accessibility_id');

		if (id) {
			view.setTag(id, value);
			view.setTag(value);
		}

		if (this.testID && this.testID !== value) this.testID = value;
		if (this.accessibilityIdentifier !== value) this.accessibilityIdentifier = value;
	}

	[accessibilityEnabledProperty.setNative](value: boolean): void {
		this.nativeViewProtected.setFocusable(!!value);

		updateAccessibilityProperties(this);
	}

	[accessibilityIdentifierProperty.setNative](value: string): void {
		this.setAccessibilityIdentifier(this.nativeViewProtected, value);
	}

	[accessibilityRoleProperty.setNative](value: AccessibilityRole): void {
		this.accessibilityRole = value;
		updateAccessibilityProperties(this);

		if (SDK_VERSION >= 28) {
			this.nativeViewProtected?.setAccessibilityHeading(value === AccessibilityRole.Header);
		}
	}

	[accessibilityValueProperty.setNative](): void {
		this._androidContentDescriptionUpdated = true;
		updateContentDescription(this);
	}

	[accessibilityLabelProperty.setNative](): void {
		this._androidContentDescriptionUpdated = true;
		updateContentDescription(this);
	}

	[accessibilityHintProperty.setNative](): void {
		this._androidContentDescriptionUpdated = true;
		updateContentDescription(this);
	}

	[accessibilityHiddenProperty.setNative](value: boolean): void {
		if (value) {
			this.nativeViewProtected.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS);
		} else {
			this.nativeViewProtected.setImportantForAccessibility(android.view.View.IMPORTANT_FOR_ACCESSIBILITY_YES);
		}
	}

	[accessibilityLiveRegionProperty.setNative](value: AccessibilityLiveRegion): void {
		switch (value) {
			case AccessibilityLiveRegion.Assertive: {
				this.nativeViewProtected.setAccessibilityLiveRegion(android.view.View.ACCESSIBILITY_LIVE_REGION_ASSERTIVE);
				break;
			}
			case AccessibilityLiveRegion.Polite: {
				this.nativeViewProtected.setAccessibilityLiveRegion(android.view.View.ACCESSIBILITY_LIVE_REGION_POLITE);
				break;
			}
			default: {
				this.nativeViewProtected.setAccessibilityLiveRegion(android.view.View.ACCESSIBILITY_LIVE_REGION_NONE);
				break;
			}
		}
	}

	[accessibilityStateProperty.setNative](value: AccessibilityState): void {
		this.accessibilityState = value;
		updateAccessibilityProperties(this);
	}

	[accessibilityMediaSessionProperty.setNative](): void {
		updateAccessibilityProperties(this);
	}

	[androidElevationProperty.getDefault](): number {
		return this.getDefaultElevation();
	}
	[androidElevationProperty.setNative](value: number) {
		if (SDK_VERSION < 21) {
			return;
		}

		this.refreshStateListAnimator();
	}

	[androidDynamicElevationOffsetProperty.getDefault](): number {
		return this.getDefaultDynamicElevationOffset();
	}
	[androidDynamicElevationOffsetProperty.setNative](value: number) {
		if (SDK_VERSION < 21) {
			return;
		}

		this.refreshStateListAnimator();
	}

	protected getDefaultElevation(): number {
		if (SDK_VERSION < 21) {
			return 0;
		}

		// NOTE: overriden in Button implementation as for widgets with StateListAnimator (Button)
		// nativeView.getElevation() returns 0 at the time of the getDefault() query
		return layout.toDeviceIndependentPixels((<any>this.nativeViewProtected).getElevation());
	}

	protected getDefaultDynamicElevationOffset() {
		// NOTE: overriden in Button implementation
		return 0;
	}

	private refreshStateListAnimator() {
		const nativeView: any = this.nativeViewProtected;

		const ObjectAnimator = android.animation.ObjectAnimator;
		const AnimatorSet = android.animation.AnimatorSet;

		const duration = nativeView.getContext().getResources().getInteger(shortAnimTime) / 2;

		let elevation = this.androidElevation;
		if (typeof elevation === 'undefined' || elevation === null) {
			elevation = this.getDefaultElevation();
		}
		elevation = layout.toDevicePixels(elevation);

		const z = layout.toDevicePixels(0);

		let pressedZ = this.androidDynamicElevationOffset;
		if (typeof pressedZ === 'undefined' || pressedZ === null) {
			pressedZ = this.getDefaultDynamicElevationOffset();
		}
		pressedZ = layout.toDevicePixels(pressedZ);

		const pressedSet = new AnimatorSet();
		pressedSet.playTogether(java.util.Arrays.asList([ObjectAnimator.ofFloat(nativeView, 'translationZ', [pressedZ]).setDuration(duration), ObjectAnimator.ofFloat(nativeView, 'elevation', [elevation]).setDuration(0)]));

		const notPressedSet = new AnimatorSet();
		notPressedSet.playTogether(java.util.Arrays.asList([ObjectAnimator.ofFloat(nativeView, 'translationZ', [z]).setDuration(duration), ObjectAnimator.ofFloat(nativeView, 'elevation', [elevation]).setDuration(0)]));

		const defaultSet = new AnimatorSet();
		defaultSet.playTogether(java.util.Arrays.asList([ObjectAnimator.ofFloat(nativeView, 'translationZ', [0]).setDuration(0), ObjectAnimator.ofFloat(nativeView, 'elevation', [0]).setDuration(0)]));

		const stateListAnimator = new (<any>android.animation).StateListAnimator();
		stateListAnimator.addState([statePressed, stateEnabled], pressedSet);
		stateListAnimator.addState([stateEnabled], notPressedSet);
		stateListAnimator.addState([], defaultSet);

		const currentAnimator = nativeView.getStateListAnimator();
		if (currentAnimator) {
			currentAnimator.jumpToCurrentState();
		}
		nativeView.setStateListAnimator(stateListAnimator);
	}

	[horizontalAlignmentProperty.getDefault](): CoreTypes.HorizontalAlignmentType {
		return <CoreTypes.HorizontalAlignmentType>org.nativescript.widgets.ViewHelper.getHorizontalAlignment(this.nativeViewProtected);
	}
	[horizontalAlignmentProperty.setNative](value: CoreTypes.HorizontalAlignmentType) {
		const nativeView = this.nativeViewProtected;
		const lp: any = nativeView.getLayoutParams() || new org.nativescript.widgets.CommonLayoutParams();
		const gravity = lp.gravity;
		const weight = lp.weight;
		// Set only if params gravity exists.
		if (gravity !== undefined) {
			switch (value) {
				case 'left':
					lp.gravity = GRAVITY_LEFT | (gravity & VERTICAL_GRAVITY_MASK);
					if (weight < 0) {
						lp.weight = -2;
					}
					break;
				case 'center':
					lp.gravity = GRAVITY_CENTER_HORIZONTAL | (gravity & VERTICAL_GRAVITY_MASK);
					if (weight < 0) {
						lp.weight = -2;
					}
					break;
				case 'right':
					lp.gravity = GRAVITY_RIGHT | (gravity & VERTICAL_GRAVITY_MASK);
					if (weight < 0) {
						lp.weight = -2;
					}
					break;
				case 'stretch':
					lp.gravity = GRAVITY_FILL_HORIZONTAL | (gravity & VERTICAL_GRAVITY_MASK);
					if (weight < 0) {
						lp.weight = -1;
					}
					break;
			}
			nativeView.setLayoutParams(lp);
		}
	}

	[verticalAlignmentProperty.getDefault](): CoreTypes.VerticalAlignmentType {
		return <CoreTypes.VerticalAlignmentType>org.nativescript.widgets.ViewHelper.getVerticalAlignment(this.nativeViewProtected);
	}
	[verticalAlignmentProperty.setNative](value: CoreTypes.VerticalAlignmentType) {
		const nativeView = this.nativeViewProtected;
		const lp: any = nativeView.getLayoutParams() || new org.nativescript.widgets.CommonLayoutParams();
		const gravity = lp.gravity;
		const height = lp.height;
		// Set only if params gravity exists.
		if (gravity !== undefined) {
			switch (value) {
				case 'top':
					lp.gravity = GRAVITY_TOP | (gravity & HORIZONTAL_GRAVITY_MASK);
					if (height < 0) {
						lp.height = -2;
					}
					break;
				case 'middle':
					lp.gravity = GRAVITY_CENTER_VERTICAL | (gravity & HORIZONTAL_GRAVITY_MASK);
					if (height < 0) {
						lp.height = -2;
					}
					break;
				case 'bottom':
					lp.gravity = GRAVITY_BOTTOM | (gravity & HORIZONTAL_GRAVITY_MASK);
					if (height < 0) {
						lp.height = -2;
					}
					break;
				case 'stretch':
					lp.gravity = GRAVITY_FILL_VERTICAL | (gravity & HORIZONTAL_GRAVITY_MASK);
					if (height < 0) {
						lp.height = -1;
					}
					break;
			}
			nativeView.setLayoutParams(lp);
		}
	}

	[rotateProperty.setNative](value: number) {
		org.nativescript.widgets.ViewHelper.setRotate(this.nativeViewProtected, float(value));
	}

	[rotateXProperty.setNative](value: number) {
		org.nativescript.widgets.ViewHelper.setRotateX(this.nativeViewProtected, float(value));
	}

	[rotateYProperty.setNative](value: number) {
		org.nativescript.widgets.ViewHelper.setRotateY(this.nativeViewProtected, float(value));
	}

	[perspectiveProperty.setNative](value: number) {
		org.nativescript.widgets.ViewHelper.setPerspective(this.nativeViewProtected, float(value * Screen.mainScreen.scale));
	}

	[scaleXProperty.setNative](value: number) {
		org.nativescript.widgets.ViewHelper.setScaleX(this.nativeViewProtected, float(value));
	}

	[scaleYProperty.setNative](value: number) {
		org.nativescript.widgets.ViewHelper.setScaleY(this.nativeViewProtected, float(value));
	}

	[translateXProperty.setNative](value: CoreTypes.dip) {
		org.nativescript.widgets.ViewHelper.setTranslateX(this.nativeViewProtected, layout.toDevicePixels(value));
	}

	[translateYProperty.setNative](value: CoreTypes.dip) {
		org.nativescript.widgets.ViewHelper.setTranslateY(this.nativeViewProtected, layout.toDevicePixels(value));
	}

	[zIndexProperty.getDefault](): number {
		return 0;
	}
	[zIndexProperty.setNative](value: number) {
		org.nativescript.widgets.ViewHelper.setZIndex(this.nativeViewProtected, value);
	}

	[backgroundInternalProperty.getDefault](): android.graphics.drawable.Drawable {
		const nativeView = this.nativeViewProtected;
		return AndroidHelper.getCopyOrDrawable(nativeView.getBackground(), nativeView.getResources());
	}
	[backgroundInternalProperty.setNative](value: android.graphics.drawable.Drawable | Background) {
		this._redrawNativeBackground(value);
	}

	[minWidthProperty.setNative](value: CoreTypes.LengthType) {
		if (this.parent instanceof CustomLayoutView && this.parent.nativeViewProtected) {
			this.parent._setChildMinWidthNative(this, value);
		} else {
			this._setMinWidthNative(value);
		}
	}

	[minHeightProperty.setNative](value: CoreTypes.LengthType) {
		if (this.parent instanceof CustomLayoutView && this.parent.nativeViewProtected) {
			this.parent._setChildMinHeightNative(this, value);
		} else {
			this._setMinHeightNative(value);
		}
	}

	public _applyBackground(background: Background, isBorderDrawable: boolean, onlyColor: boolean, backgroundDrawable: android.graphics.drawable.Drawable) {
		const nativeView = <NativeScriptAndroidView>this.nativeViewProtected;

		if (onlyColor) {
			const backgroundColor = background.color.android;

			if (isBorderDrawable) {
				// We need to duplicate the drawable or we lose the "default" cached drawable
				backgroundDrawable = nativeView._cachedDrawable != null ? AndroidHelper.getCopyOrDrawable(nativeView._cachedDrawable, nativeView.getResources()) : null;
				nativeView.setBackground(backgroundDrawable);
			}

			// Apply color to drawables when there is the need to maintain visual things like button ripple effect
			if (this.needsNativeDrawableFill && backgroundDrawable) {
				backgroundDrawable.mutate();

				AndroidHelper.setDrawableColor(backgroundColor, backgroundDrawable);
				backgroundDrawable.invalidateSelf();
			} else {
				nativeView.setBackgroundColor(backgroundColor);
			}
		} else {
			if (background.clearFlags & BackgroundClearFlags.CLEAR_BACKGROUND_COLOR) {
				if (backgroundDrawable) {
					backgroundDrawable.mutate();

					AndroidHelper.clearDrawableColor(backgroundDrawable);
					backgroundDrawable.invalidateSelf();
				} else {
					nativeView.setBackgroundColor(-1);
				}
			}

			if (background.isEmpty()) {
				// Reset background to default if not already set
				const defaultDrawable = nativeView._cachedDrawable ?? null;
				if (backgroundDrawable !== defaultDrawable) {
					nativeView.setBackground(defaultDrawable);
				}
			} else {
				if (isBorderDrawable) {
					// org.nativescript.widgets.BorderDrawable
					refreshBorderDrawable(this, backgroundDrawable);
				} else {
					const borderDrawable = new org.nativescript.widgets.BorderDrawable(layout.getDisplayDensity(), this.toString());
					refreshBorderDrawable(this, borderDrawable);
					nativeView.setBackground(borderDrawable);
				}
			}
		}
	}

	protected _drawBoxShadow(boxShadow: BoxShadow) {
		const nativeView = this.nativeViewProtected;
		const config = {
			shadowColor: boxShadow.color.android,
			cornerRadius: Length.toDevicePixels(this.borderRadius as CoreTypes.LengthType, 0.0),
			spreadRadius: boxShadow.spreadRadius,
			blurRadius: boxShadow.blurRadius,
			offsetX: boxShadow.offsetX,
			offsetY: boxShadow.offsetY,
		};
		org.nativescript.widgets.Utils.drawBoxShadow(nativeView, JSON.stringify(config));
	}

	_redrawNativeBackground(value: android.graphics.drawable.Drawable | Background): void {
		if (value instanceof Background) {
			this.onBackgroundOrBorderPropertyChanged();
		} else {
			const nativeView = this.nativeViewProtected;
			nativeView.setBackground(value);

			const style = this.style;
			const paddingTop = paddingTopProperty.isSet(style) ? this.effectivePaddingTop : this._defaultPaddingTop;
			const paddingRight = paddingRightProperty.isSet(style) ? this.effectivePaddingRight : this._defaultPaddingRight;
			const paddingBottom = paddingBottomProperty.isSet(style) ? this.effectivePaddingBottom : this._defaultPaddingBottom;
			const paddingLeft = paddingLeftProperty.isSet(style) ? this.effectivePaddingLeft : this._defaultPaddingLeft;

			if (this._isPaddingRelative) {
				nativeView.setPaddingRelative(paddingLeft, paddingTop, paddingRight, paddingBottom);
			} else {
				nativeView.setPadding(paddingLeft, paddingTop, paddingRight, paddingBottom);
			}
		}
	}

	protected onBackgroundOrBorderPropertyChanged() {
		const nativeView = <NativeScriptAndroidView>this.nativeViewProtected;
		if (!nativeView) {
			return;
		}

		const background = this.style.backgroundInternal;
		const drawable = nativeView.getBackground();
		const isBorderDrawable = drawable instanceof org.nativescript.widgets.BorderDrawable;

		// Use undefined as not set. getBackground will never return undefined only Drawable or null;
		if (nativeView._cachedDrawable === undefined) {
			nativeView._cachedDrawable = drawable;
		}

		if (background.clearFlags & BackgroundClearFlags.CLEAR_BOX_SHADOW) {
			// Clear background if we're clearing the box shadow
			if (drawable instanceof org.nativescript.widgets.BoxShadowDrawable) {
				nativeView.setBackground(nativeView._cachedDrawable ?? null);
			}
		}

		// prettier-ignore
		const onlyColor = !background.hasBorderWidth()
			&& !background.hasBorderRadius()
			&& !background.hasBoxShadow()
			&& !background.clipPath
			&& !background.image
			&& !!background.color;

		this._applyBackground(background, isBorderDrawable, onlyColor, drawable);

		if (background.hasBoxShadow()) {
			this._drawBoxShadow(background.getBoxShadow());
		}

		// TODO: Can we move BorderWidths as separate native setter?
		// This way we could skip setPadding if borderWidth is not changed.
		const leftPadding = Math.ceil(this.effectiveBorderLeftWidth + this.effectivePaddingLeft);
		const topPadding = Math.ceil(this.effectiveBorderTopWidth + this.effectivePaddingTop);
		const rightPadding = Math.ceil(this.effectiveBorderRightWidth + this.effectivePaddingRight);
		const bottomPadding = Math.ceil(this.effectiveBorderBottomWidth + this.effectivePaddingBottom);

		if (this._isPaddingRelative) {
			nativeView.setPaddingRelative(leftPadding, topPadding, rightPadding, bottomPadding);
		} else {
			nativeView.setPadding(leftPadding, topPadding, rightPadding, bottomPadding);
		}

		// reset clear flags
		background.clearFlags = BackgroundClearFlags.NONE;
	}

	public accessibilityAnnouncement(message = this.accessibilityLabel): void {
		this.sendAccessibilityEvent({
			androidAccessibilityEvent: AndroidAccessibilityEvent.ANNOUNCEMENT,
			message,
		});
	}

	public accessibilityScreenChanged(): void {
		this.sendAccessibilityEvent({
			androidAccessibilityEvent: AndroidAccessibilityEvent.WINDOW_STATE_CHANGED,
		});
	}
}

export class ContainerView extends View {
	public iosOverflowSafeArea: boolean;
}

export class CustomLayoutView extends ContainerView implements CustomLayoutViewDefinition {
	nativeViewProtected: android.view.ViewGroup;

	public createNativeView() {
		return new org.nativescript.widgets.ContentLayout(this._context);
	}

	public _addViewToNativeVisualTree(child: ViewCommon, atIndex: number = Number.MAX_SAFE_INTEGER): boolean {
		super._addViewToNativeVisualTree(child);

		if (this.nativeViewProtected && child.nativeViewProtected) {
			if (Trace.isEnabled()) {
				Trace.write(`${this}.nativeView.addView(${child}.nativeView, ${atIndex})`, Trace.categories.VisualTreeEvents);
			}
			this.nativeViewProtected.addView(child.nativeViewProtected, atIndex);
			if (child instanceof View) {
				this._updateNativeLayoutParams(child);
			}

			return true;
		}

		return false;
	}

	public _updateNativeLayoutParams(child: View): void {
		// noop
	}

	public _setChildMinWidthNative(child: View, value: CoreTypes.LengthType): void {
		child._setMinWidthNative(value);
	}

	public _setChildMinHeightNative(child: View, value: CoreTypes.LengthType): void {
		child._setMinHeightNative(value);
	}

	public _removeViewFromNativeVisualTree(child: ViewCommon): void {
		super._removeViewFromNativeVisualTree(child);

		const nativeView = this.nativeViewProtected;
		const childView = child.nativeViewProtected;
		if (nativeView && childView) {
			nativeView.removeView(childView);
			if (Trace.isEnabled()) {
				Trace.write(`${nativeView}.removeView(${childView})`, Trace.categories.VisualTreeEvents);
				Trace.notifyEvent(child, 'childInLayoutRemovedFromNativeVisualTree');
			}
		}
	}
}

type NativeSetter = { (view: android.view.View, value: number): void };
type NativeGetter = { (view: android.view.View): number };
const percentNotSupported = (view: android.view.View, value: number) => {
	throw new Error('PercentLength is not supported.');
};
interface NativePercentLengthPropertyOptions {
	getter?: string | symbol;
	setter: string | symbol;
	auto?: number;
	getPixels?: NativeGetter;
	setPixels: NativeSetter;
	setPercent?: NativeSetter;
}

function createNativePercentLengthProperty(options: NativePercentLengthPropertyOptions) {
	const { getter, setter, auto = 0 } = options;
	let setPixels, getPixels, setPercent;
	if (getter) {
		View.prototype[getter] = function (this: View): CoreTypes.PercentLengthType {
			if (options) {
				setPixels = options.setPixels;
				getPixels = options.getPixels;
				setPercent = options.setPercent || percentNotSupported;
				options = null;
			}
			const value = getPixels(this.nativeViewProtected);
			if (value == auto) {
				// tslint:disable-line
				return 'auto';
			} else {
				return { value, unit: 'px' };
			}
		};
	}
	if (setter) {
		View.prototype[setter] = function (this: View, length: CoreTypes.PercentLengthType) {
			if (options) {
				setPixels = options.setPixels;
				getPixels = options.getPixels;
				setPercent = options.setPercent || percentNotSupported;
				options = null;
			}
			if (length == 'auto' || length == null) {
				// tslint:disable-line
				setPixels(this.nativeViewProtected, auto);
			} else if (typeof length === 'number') {
				setPixels(this.nativeViewProtected, layout.round(layout.toDevicePixels(length)));
			} else if (length.unit == 'dip') {
				// tslint:disable-line
				setPixels(this.nativeViewProtected, layout.round(layout.toDevicePixels(length.value)));
			} else if (length.unit == 'px') {
				// tslint:disable-line
				setPixels(this.nativeViewProtected, layout.round(length.value));
			} else if (length.unit == '%') {
				// tslint:disable-line
				setPercent(this.nativeViewProtected, length.value);
			} else {
				throw new Error(`Unsupported PercentLength ${length}`);
			}
		};
	}
}

createNativePercentLengthProperty({
	setter: marginTopProperty.setNative,
	get setPixels() {
		return org.nativescript.widgets.ViewHelper.setMarginTop;
	},
	get setPercent() {
		return org.nativescript.widgets.ViewHelper.setMarginTopPercent;
	},
});

createNativePercentLengthProperty({
	setter: marginRightProperty.setNative,
	get setPixels() {
		return org.nativescript.widgets.ViewHelper.setMarginRight;
	},
	get setPercent() {
		return org.nativescript.widgets.ViewHelper.setMarginRightPercent;
	},
});

createNativePercentLengthProperty({
	setter: marginBottomProperty.setNative,
	get setPixels() {
		return org.nativescript.widgets.ViewHelper.setMarginBottom;
	},
	get setPercent() {
		return org.nativescript.widgets.ViewHelper.setMarginBottomPercent;
	},
});

createNativePercentLengthProperty({
	setter: marginLeftProperty.setNative,
	get setPixels() {
		return org.nativescript.widgets.ViewHelper.setMarginLeft;
	},
	get setPercent() {
		return org.nativescript.widgets.ViewHelper.setMarginLeftPercent;
	},
});

createNativePercentLengthProperty({
	setter: widthProperty.setNative,
	auto: -1, //android.view.ViewGroup.LayoutParams.MATCH_PARENT,
	get setPixels() {
		return org.nativescript.widgets.ViewHelper.setWidth;
	},
	get setPercent() {
		return org.nativescript.widgets.ViewHelper.setWidthPercent;
	},
});

createNativePercentLengthProperty({
	setter: heightProperty.setNative,
	auto: -1, //android.view.ViewGroup.LayoutParams.MATCH_PARENT,
	get setPixels() {
		return org.nativescript.widgets.ViewHelper.setHeight;
	},
	get setPercent() {
		return org.nativescript.widgets.ViewHelper.setHeightPercent;
	},
});

createNativePercentLengthProperty({
	setter: '_setMinWidthNative',
	get setPixels() {
		return org.nativescript.widgets.ViewHelper.setMinWidth;
	},
});

createNativePercentLengthProperty({
	setter: '_setMinHeightNative',
	get setPixels() {
		return org.nativescript.widgets.ViewHelper.setMinHeight;
	},
});
