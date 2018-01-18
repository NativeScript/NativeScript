// Definitions.
import { ViewBase } from "../view-base";
import { Point, CustomLayoutView as CustomLayoutViewDefinition, dip } from ".";
import { GestureTypes, GestureEventData } from "../../gestures";
import { AndroidActivityBackPressedEventData } from "../../../application";
// Types.
import {
    ViewCommon, layout, isEnabledProperty, originXProperty, originYProperty, automationTextProperty, isUserInteractionEnabledProperty,
    traceEnabled, traceWrite, traceCategories, traceNotifyEvent,
    paddingLeftProperty, paddingTopProperty, paddingRightProperty, paddingBottomProperty,
    Color
} from "./view-common";

import {
    Length, PercentLength, Visibility, HorizontalAlignment, VerticalAlignment,
    visibilityProperty, opacityProperty, horizontalAlignmentProperty, verticalAlignmentProperty,
    minWidthProperty, minHeightProperty, widthProperty, heightProperty,
    marginLeftProperty, marginTopProperty, marginRightProperty, marginBottomProperty,
    rotateProperty, scaleXProperty, scaleYProperty, translateXProperty, translateYProperty,
    zIndexProperty, backgroundInternalProperty
} from "../../styling/style-properties";

import { Background, ad as androidBackground } from "../../styling/background";
import { profile } from "../../../profiling";

export * from "./view-common";

const DOMID = "_domId";
const androidBackPressedEvent = "androidBackPressed";

const modalMap = new Map<number, DialogOptions>();

let TouchListener: TouchListener;
let disableUserInteractionListener: org.nativescript.widgets.DisableUserInteractionListener;
let DialogFragment: DialogFragment;
let Dialog: android.app.Dialog;

interface DialogOptions {
    owner: View;
    fullscreen: boolean;
    shownCallback: () => void;
    dismissCallback: () => void;
}

interface TouchListener {
    new(owner: View): android.view.View.OnTouchListener;
}

interface DialogFragment {
    new(): android.app.DialogFragment;
}

function initializeDisabledListener(): void {
    if (disableUserInteractionListener) {
        return;
    }

    disableUserInteractionListener = new org.nativescript.widgets.DisableUserInteractionListener();
}

function initializeTouchListener(): void {
    if (TouchListener) {
        return;
    }

    @Interfaces([android.view.View.OnTouchListener])
    class TouchListenerImpl extends java.lang.Object implements android.view.View.OnTouchListener {
        constructor(private owner: View) {
            super();
            return global.__native(this);
        }

        onTouch(view: android.view.View, event: android.view.MotionEvent): boolean {
            const owner = this.owner;
            for (let type in owner._gestureObservers) {
                let list = owner._gestureObservers[type];
                list.forEach(element => {
                    element.androidOnTouchEvent(event);
                });
            }

            let nativeView = owner.nativeViewProtected;
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

    class DialogImpl extends android.app.Dialog {
        constructor(public fragment: DialogFragmentImpl,
            context: android.content.Context,
            themeResId: number) {
            super(context, themeResId);
            return global.__native(this);
        }

        public onBackPressed(): void {
            const view = this.fragment.owner;
            const args = <AndroidActivityBackPressedEventData>{
                eventName: "activityBackPressed",
                object: view,
                activity: view._context,
                cancel: false,
            };
            view.notify(args);

            if (!args.cancel && !view._onBackPressed()) {
                super.onBackPressed();
            }
        }
    }

    class DialogFragmentImpl extends android.app.DialogFragment {
        public owner: View;
        private _fullscreen: boolean;
        private _shownCallback: () => void;
        private _dismissCallback: () => void;

        constructor() {
            super();
            return global.__native(this);
        }

        public onCreateDialog(savedInstanceState: android.os.Bundle): android.app.Dialog {
            const ownerId = this.getArguments().getInt(DOMID);
            const options = getModalOptions(ownerId);
            this.owner = options.owner;
            this._fullscreen = options.fullscreen;
            this._dismissCallback = options.dismissCallback;
            this._shownCallback = options.shownCallback;
            this.owner._dialogFragment = this;
            this.setStyle(android.app.DialogFragment.STYLE_NO_TITLE, 0);
            
            const dialog = new DialogImpl(this, this.getActivity(), this.getTheme());

            // adjust alignment based on fullscreen value.
            this.owner.horizontalAlignment = this._fullscreen ? "stretch" : "center";
            this.owner.verticalAlignment = this._fullscreen ? "stretch" : "middle";
          
            return dialog;
        }

        public onCreateView(inflater: android.view.LayoutInflater, container: android.view.ViewGroup, savedInstanceState: android.os.Bundle): android.view.View {
            const owner = this.owner;
            owner._setupAsRootView(this.getActivity());
            owner._isAddedToNativeVisualTree = true;
            
            return this.owner.nativeViewProtected;
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
            if (!owner.isLoaded) {
                owner.callLoaded();
            }

            this._shownCallback();
        }

        public onStop(): void {
            super.onStop();
            const owner = this.owner;
            if (owner.isLoaded) {
                owner.callUnloaded();
            }
        }

        public onDismiss(dialog: android.content.IDialogInterface): void {
            super.onDismiss(dialog);
            const manager = this.getFragmentManager();
            if (manager) {
                removeModal(this.owner._domId);
                this._dismissCallback();
            }
        }

        public onDestroy(): void {
            super.onDestroy();
            const owner = this.owner;
            owner._isAddedToNativeVisualTree = false;
            owner._tearDownUI(true);
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

    public _dialogFragment: android.app.DialogFragment;
    private _isClickable: boolean;
    private touchListenerIsSet: boolean;
    private touchListener: android.view.View.OnTouchListener;
    private _manager: android.app.FragmentManager;

    nativeViewProtected: android.view.View;

    // TODO: Implement unobserve that detach the touchListener.
    observe(type: GestureTypes, callback: (args: GestureEventData) => void, thisArg?: any): void {
        super.observe(type, callback, thisArg);
        if (this.isLoaded && !this.touchListenerIsSet) {
            this.setOnTouchListener();
        }
    }

    public _getFragmentManager(): android.app.FragmentManager {
        let manager = this._manager;
        if (!manager) {
            let view: View = this;
            while (view) {
                const dialogFragment = view._dialogFragment;
                if (dialogFragment) {
                    manager = dialogFragment.getChildFragmentManager();
                    break;
                } else {
                    // the case is needed because _dialogFragment is on View
                    // but parent may be ViewBase.
                    view = view.parent as View;
                }
            }

            if (!manager && this._context) {
                manager = (<android.app.Activity>this._context).getFragmentManager();
            }

            this._manager = manager;
        }

        return manager;
    }

    @profile
    public onLoaded() {
        this._manager = null;
        super.onLoaded();
        this.setOnTouchListener();
    }

    @profile
    public onUnloaded() {
        if (this.touchListenerIsSet) {
            this.nativeViewProtected.setOnTouchListener(null);
            this.touchListenerIsSet = false;
            this.nativeViewProtected.setClickable(this._isClickable);
        }

        this._manager = null;
        super.onUnloaded();
    }

    private hasGestureObservers() {
        return this._gestureObservers && Object.keys(this._gestureObservers).length > 0
    }

    public initNativeView(): void {
        super.initNativeView();
        this._isClickable = this.nativeViewProtected.isClickable();
    }

    private setOnTouchListener() {
        if (this.nativeViewProtected && this.hasGestureObservers()) {
            this.touchListenerIsSet = true;
            if (this.nativeViewProtected.setClickable) {
                this.nativeViewProtected.setClickable(true);
            }

            initializeTouchListener();
            this.touchListener = this.touchListener || new TouchListener(this);
            this.nativeViewProtected.setOnTouchListener(this.touchListener);
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
        let view = this.nativeViewProtected;
        if (view) {
            view.measure(widthMeasureSpec, heightMeasureSpec);
            this.setMeasuredDimension(view.getMeasuredWidth(), view.getMeasuredHeight());
        }
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        let view = this.nativeViewProtected;
        if (view) {
            this.layoutNativeView(left, top, right, bottom);
        }
    }

    _getCurrentLayoutBounds(): { left: number; top: number; right: number; bottom: number } {
        if (this.nativeViewProtected && !this.isCollapsed) {
            return {
                left: this.nativeViewProtected.getLeft(),
                top: this.nativeViewProtected.getTop(),
                right: this.nativeViewProtected.getRight(),
                bottom: this.nativeViewProtected.getBottom()
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

        let nativeArray = (<any>Array).create("int", 2);
        this.nativeViewProtected.getLocationInWindow(nativeArray);
        return {
            x: layout.toDeviceIndependentPixels(nativeArray[0]),
            y: layout.toDeviceIndependentPixels(nativeArray[1]),
        }
    }

    public getLocationOnScreen(): Point {
        if (!this.nativeViewProtected || !this.nativeViewProtected.getWindowToken()) {
            return undefined;
        }

        let nativeArray = (<any>Array).create("int", 2);
        this.nativeViewProtected.getLocationOnScreen(nativeArray);
        return {
            x: layout.toDeviceIndependentPixels(nativeArray[0]),
            y: layout.toDeviceIndependentPixels(nativeArray[1]),
        }
    }

    public getLocationRelativeTo(otherView: ViewCommon): Point {
        if (!this.nativeViewProtected || !this.nativeViewProtected.getWindowToken() ||
            !otherView.nativeViewProtected || !otherView.nativeViewProtected.getWindowToken() ||
            this.nativeViewProtected.getWindowToken() !== otherView.nativeViewProtected.getWindowToken()) {
            return undefined;
        }

        let myArray = (<any>Array).create("int", 2);
        this.nativeViewProtected.getLocationOnScreen(myArray);
        let otherArray = (<any>Array).create("int", 2);
        otherView.nativeViewProtected.getLocationOnScreen(otherArray);
        return {
            x: layout.toDeviceIndependentPixels(myArray[0] - otherArray[0]),
            y: layout.toDeviceIndependentPixels(myArray[1] - otherArray[1]),
        }
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

    protected _showNativeModalView(parent: View, context: any, closeCallback: Function, fullscreen?: boolean, animated?: boolean) {
        super._showNativeModalView(parent, context, closeCallback, fullscreen);
        if (!this.backgroundColor) {
            this.backgroundColor = new Color("White");
        }

        initializeDialogFragment();

        const df = new DialogFragment();
        const args = new android.os.Bundle();
        args.putInt(DOMID, this._domId);
        df.setArguments(args);

        const dialogOptions: DialogOptions = {
            owner: this,
            fullscreen: !!fullscreen,
            shownCallback: () => this._raiseShownModallyEvent(),
            dismissCallback: () => this.closeModal()
        }

        saveModal(dialogOptions);

        this._dialogFragment = df;
        this._raiseShowingModallyEvent();

        this._dialogFragment.show(parent._getFragmentManager(), this._domId.toString());
    }

    protected _hideNativeModalView(parent: View) {
        const manager = this._dialogFragment.getFragmentManager();
        if (manager) {
            this._dialogFragment.dismissAllowingStateLoss();
        }

        this._dialogFragment = null;
        super._hideNativeModalView(parent);
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

    [automationTextProperty.getDefault](): string {
        return this.nativeViewProtected.getContentDescription();
    }
    [automationTextProperty.setNative](value: string) {
        this.nativeViewProtected.setContentDescription(value);
    }

    [isUserInteractionEnabledProperty.setNative](value: boolean) {
        if (!value) {
            initializeDisabledListener();
            // User interaction is disabled -- we stop it and we do not care whether someone wants to listen for gestures.
            this.nativeViewProtected.setOnTouchListener(disableUserInteractionListener);
        } else {
            this.setOnTouchListener();
            if (!this.touchListenerIsSet) {
                this.nativeViewProtected.setOnTouchListener(null);
            }
        }
    }

    [visibilityProperty.getDefault](): Visibility {
        let nativeVisibility = this.nativeViewProtected.getVisibility();
        switch (nativeVisibility) {
            case android.view.View.VISIBLE:
                return "visible";
            case android.view.View.INVISIBLE:
                return "hidden";
            case android.view.View.GONE:
                return "collapse";
            default:
                throw new Error(`Unsupported android.view.View visibility: ${nativeVisibility}. Currently supported values are android.view.View.VISIBLE, android.view.View.INVISIBLE, android.view.View.GONE.`);
        }
    }
    [visibilityProperty.setNative](value: Visibility) {
        switch (value) {
            case "visible":
                this.nativeViewProtected.setVisibility(android.view.View.VISIBLE);
                break;
            case "hidden":
                this.nativeViewProtected.setVisibility(android.view.View.INVISIBLE);
                break;
            case "collapse":
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

    [horizontalAlignmentProperty.getDefault](): HorizontalAlignment {
        return <HorizontalAlignment>org.nativescript.widgets.ViewHelper.getHorizontalAlignment(this.nativeViewProtected);
    }
    [horizontalAlignmentProperty.setNative](value: HorizontalAlignment) {
        const nativeView = this.nativeViewProtected;
        const lp: any = nativeView.getLayoutParams() || new org.nativescript.widgets.CommonLayoutParams();
        // Set only if params gravity exists.
        if (lp.gravity !== undefined) {
            switch (value) {
                case "left":
                    lp.gravity = android.view.Gravity.LEFT | (lp.gravity & android.view.Gravity.VERTICAL_GRAVITY_MASK);
                    if (lp.weight < 0) {
                        lp.weight = -2;
                    }
                    break;
                case "center":
                    lp.gravity = android.view.Gravity.CENTER_HORIZONTAL | (lp.gravity & android.view.Gravity.VERTICAL_GRAVITY_MASK);
                    if (lp.weight < 0) {
                        lp.weight = -2;
                    }
                    break;
                case "right":
                    lp.gravity = android.view.Gravity.RIGHT | (lp.gravity & android.view.Gravity.VERTICAL_GRAVITY_MASK);
                    if (lp.weight < 0) {
                        lp.weight = -2;
                    }
                    break;
                case "stretch":
                    lp.gravity = android.view.Gravity.FILL_HORIZONTAL | (lp.gravity & android.view.Gravity.VERTICAL_GRAVITY_MASK);
                    if (lp.weight < 0) {
                        lp.weight = -1;
                    }
                    break;
            }
            nativeView.setLayoutParams(lp);
        }
    }

    [verticalAlignmentProperty.getDefault](): VerticalAlignment {
        return <VerticalAlignment>org.nativescript.widgets.ViewHelper.getVerticalAlignment(this.nativeViewProtected);
    }
    [verticalAlignmentProperty.setNative](value: VerticalAlignment) {
        const nativeView = this.nativeViewProtected;
        const lp: any = nativeView.getLayoutParams() || new org.nativescript.widgets.CommonLayoutParams();
        // Set only if params gravity exists.
        if (lp.gravity !== undefined) {
            switch (value) {
                case "top":
                    lp.gravity = android.view.Gravity.TOP | (lp.gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK);
                    if (lp.height < 0) {
                        lp.height = -2;
                    }
                    break;
                case "middle":
                    lp.gravity = android.view.Gravity.CENTER_VERTICAL | (lp.gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK);
                    if (lp.height < 0) {
                        lp.height = -2;
                    }
                    break;
                case "bottom":
                    lp.gravity = android.view.Gravity.BOTTOM | (lp.gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK);
                    if (lp.height < 0) {
                        lp.height = -2;
                    }
                    break;
                case "stretch":
                    lp.gravity = android.view.Gravity.FILL_VERTICAL | (lp.gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK);
                    if (lp.height < 0) {
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

    [scaleXProperty.setNative](value: number) {
        org.nativescript.widgets.ViewHelper.setScaleX(this.nativeViewProtected, float(value));
    }

    [scaleYProperty.setNative](value: number) {
        org.nativescript.widgets.ViewHelper.setScaleY(this.nativeViewProtected, float(value));
    }

    [translateXProperty.setNative](value: dip) {
        org.nativescript.widgets.ViewHelper.setTranslateX(this.nativeViewProtected, layout.toDevicePixels(value));
    }

    [translateYProperty.setNative](value: dip) {
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
        const drawable = nativeView.getBackground();
        if (drawable) {
            const constantState = drawable.getConstantState();
            if (constantState) {
                try {
                    return constantState.newDrawable(nativeView.getResources());
                } catch (e) {
                    return drawable;
                }
            } else {
                return drawable;
            }
        }

        return null;
    }
    [backgroundInternalProperty.setNative](value: android.graphics.drawable.Drawable | Background) {
        this._redrawNativeBackground(value);
    }

    [minWidthProperty.setNative](value: Length) {
        if (this.parent instanceof CustomLayoutView && this.parent.nativeViewProtected) {
            this.parent._setChildMinWidthNative(this);
        } else {
            this._setMinWidthNative(this.minWidth);
        }
    }

    [minHeightProperty.setNative](value: Length) {
        if (this.parent instanceof CustomLayoutView && this.parent.nativeViewProtected) {
            this.parent._setChildMinHeightNative(this);
        } else {
            this._setMinHeightNative(this.minHeight);
        }
    }

    _redrawNativeBackground(value: android.graphics.drawable.Drawable | Background): void {
        if (value instanceof Background) {
            androidBackground.onBackgroundOrBorderPropertyChanged(this);
        } else {
            const nativeView = this.nativeViewProtected;
            org.nativescript.widgets.ViewHelper.setBackground(nativeView, value);

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

            (<any>nativeView).background = undefined;
        }
    }
}

export class CustomLayoutView extends View implements CustomLayoutViewDefinition {
    nativeViewProtected: android.view.ViewGroup;

    public createNativeView() {
        return new org.nativescript.widgets.ContentLayout(this._context);
    }

    public _addViewToNativeVisualTree(child: ViewCommon, atIndex: number = Number.MAX_SAFE_INTEGER): boolean {
        super._addViewToNativeVisualTree(child);

        if (this.nativeViewProtected && child.nativeViewProtected) {
            if (traceEnabled()) {
                traceWrite(`${this}.nativeView.addView(${child}.nativeView, ${atIndex})`, traceCategories.VisualTreeEvents);
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
        this._setChildMinWidthNative(child);
        this._setChildMinHeightNative(child);
    }

    public _setChildMinWidthNative(child: View): void {
        child._setMinWidthNative(child.minWidth);
    }

    public _setChildMinHeightNative(child: View): void {
        child._setMinHeightNative(child.minHeight);
    }

    public _removeViewFromNativeVisualTree(child: ViewCommon): void {
        super._removeViewFromNativeVisualTree(child);

        const nativeView = this.nativeViewProtected;
        const childView = child.nativeViewProtected;
        if (nativeView && childView) {
            nativeView.removeView(childView);
            if (traceEnabled()) {
                traceWrite(`${nativeView}.removeView(${childView})`, traceCategories.VisualTreeEvents);
                traceNotifyEvent(child, "childInLayoutRemovedFromNativeVisualTree");
            }
        }
    }
}

type NativeSetter = { (view: android.view.View, value: number): void };
type NativeGetter = { (view: android.view.View): number };
const percentNotSupported = (view: android.view.View, value: number) => { throw new Error("PercentLength is not supported."); };
interface NativePercentLengthPropertyOptions {
    getter?: string | symbol;
    setter: string | symbol;
    auto?: number;
    getPixels?: NativeGetter;
    setPixels: NativeSetter;
    setPercent?: NativeSetter
}

function createNativePercentLengthProperty(options: NativePercentLengthPropertyOptions) {
    const { getter, setter, auto = 0 } = options;
    let setPixels, getPixels, setPercent;
    if (getter) {
        View.prototype[getter] = function (this: View): PercentLength {
            if (options) {
                setPixels = options.setPixels;
                getPixels = options.getPixels;
                setPercent = options.setPercent || percentNotSupported;
                options = null;
            }
            const value = getPixels(this.nativeViewProtected);
            if (value == auto) { // tslint:disable-line
                return "auto";
            } else {
                return { value, unit: "px" };
            }
        }
    }
    if (setter) {
        View.prototype[setter] = function (this: View, length: PercentLength) {
            if (options) {
                setPixels = options.setPixels;
                getPixels = options.getPixels;
                setPercent = options.setPercent || percentNotSupported;
                options = null;
            }
            if (length == "auto") { // tslint:disable-line
                setPixels(this.nativeViewProtected, auto);
            } else if (typeof length === "number") {
                setPixels(this.nativeViewProtected, layout.round(layout.toDevicePixels(length)));
            } else if (length.unit == "dip") { // tslint:disable-line
                setPixels(this.nativeViewProtected, layout.round(layout.toDevicePixels(length.value)));
            } else if (length.unit == "px") { // tslint:disable-line
                setPixels(this.nativeViewProtected, layout.round(length.value));
            } else if (length.unit == "%") { // tslint:disable-line
                setPercent(this.nativeViewProtected, length.value);
            } else {
                throw new Error(`Unsupported PercentLength ${length}`);
            }
        }
    }
}

createNativePercentLengthProperty({
    setter: marginTopProperty.setNative,
    get setPixels() { return org.nativescript.widgets.ViewHelper.setMarginTop },
    get setPercent() { return org.nativescript.widgets.ViewHelper.setMarginTopPercent }
});

createNativePercentLengthProperty({
    setter: marginRightProperty.setNative,
    get setPixels() { return org.nativescript.widgets.ViewHelper.setMarginRight },
    get setPercent() { return org.nativescript.widgets.ViewHelper.setMarginRightPercent }
});

createNativePercentLengthProperty({
    setter: marginBottomProperty.setNative,
    get setPixels() { return org.nativescript.widgets.ViewHelper.setMarginBottom },
    get setPercent() { return org.nativescript.widgets.ViewHelper.setMarginBottomPercent }
});

createNativePercentLengthProperty({
    setter: marginLeftProperty.setNative,
    get setPixels() { return org.nativescript.widgets.ViewHelper.setMarginLeft },
    get setPercent() { return org.nativescript.widgets.ViewHelper.setMarginLeftPercent }
});

createNativePercentLengthProperty({
    setter: widthProperty.setNative,
    auto: -1, //android.view.ViewGroup.LayoutParams.MATCH_PARENT,
    get setPixels() { return org.nativescript.widgets.ViewHelper.setWidth },
    get setPercent() { return org.nativescript.widgets.ViewHelper.setWidthPercent }
});

createNativePercentLengthProperty({
    setter: heightProperty.setNative,
    auto: -1, //android.view.ViewGroup.LayoutParams.MATCH_PARENT,
    get setPixels() { return org.nativescript.widgets.ViewHelper.setHeight },
    get setPercent() { return org.nativescript.widgets.ViewHelper.setHeightPercent }
});

createNativePercentLengthProperty({
    setter: "_setMinWidthNative",
    get setPixels() { return org.nativescript.widgets.ViewHelper.setMinWidth }
});

createNativePercentLengthProperty({
    setter: "_setMinHeightNative",
    get setPixels() { return org.nativescript.widgets.ViewHelper.setMinHeight }
});