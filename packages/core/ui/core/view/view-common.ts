// Definitions.
import { View as ViewDefinition, Point, Size, ShownModallyData } from '.';

import { booleanConverter, ShowModalOptions, ViewBase } from '../view-base';
import { getEventOrGestureName } from '../bindable';
import { layout } from '../../../utils';
import { isObject } from '../../../utils/types';
import { sanitizeModuleName } from '../../../utils/common';
import { Color } from '../../../color';
import { Property, InheritedProperty } from '../properties';
import { EventData } from '../../../data/observable';
import { Trace } from '../../../trace';
import { CoreTypes } from '../../../core-types';
import { ViewHelper } from './view-helper';
import { setupAccessibleView } from '../../../accessibility';

import { PercentLength } from '../../styling/style-properties';

import { observe as gestureObserve, GesturesObserver, GestureTypes, GestureEventData, fromString as gestureFromString, TouchManager, TouchAnimationOptions, VisionHoverOptions } from '../../gestures';

import { CSSUtils } from '../../../css/system-classes';
import { Builder } from '../../builder';
import { StyleScope } from '../../styling/style-scope';
import { LinearGradient } from '../../styling/linear-gradient';

import * as am from '../../animation';
import { AccessibilityEventOptions, AccessibilityLiveRegion, AccessibilityRole, AccessibilityState, AccessibilityTrait } from '../../../accessibility/accessibility-types';
import { accessibilityHintProperty, accessibilityIdentifierProperty, accessibilityLabelProperty, accessibilityValueProperty, accessibilityIgnoresInvertColorsProperty } from '../../../accessibility/accessibility-properties';
import { accessibilityBlurEvent, accessibilityFocusChangedEvent, accessibilityFocusEvent, accessibilityPerformEscapeEvent, getCurrentFontScale } from '../../../accessibility';
import { ShadowCSSValues } from '../../styling/css-shadow';
import { SharedTransition, SharedTransitionInteractiveOptions } from '../../transition/shared-transition';

// helpers (these are okay re-exported here)
export * from './view-helper';

let animationModule: typeof am;
function ensureAnimationModule() {
	if (!animationModule) {
		animationModule = require('../../animation');
	}
}

export function CSSType(type: string): ClassDecorator {
	return (cls) => {
		cls.prototype.cssType = type;
	};
}

export function viewMatchesModuleContext(view: ViewDefinition, context: ModuleContext, types: ModuleType[]): boolean {
	return context && view._moduleName && context.type && types.some((type) => type === context.type) && context.path && context.path.includes(view._moduleName);
}

export function PseudoClassHandler(...pseudoClasses: string[]): MethodDecorator {
	const stateEventNames = pseudoClasses.map((s) => ':' + s);
	const listeners = Symbol('listeners');

	return <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => {
		function update(change: number) {
			const prev = this[listeners] || 0;
			const next = prev + change;
			if (prev <= 0 && next > 0) {
				this[propertyKey](true);
			} else if (prev > 0 && next <= 0) {
				this[propertyKey](false);
			}
		}
		stateEventNames.forEach((s) => (target[s] = update));
	};
}

export const _rootModalViews = new Array<ViewBase>();

type InteractiveTransitionState = { began?: boolean; cancelled?: boolean; options?: SharedTransitionInteractiveOptions };

export abstract class ViewCommon extends ViewBase implements ViewDefinition {
	public static layoutChangedEvent = 'layoutChanged';
	public static shownModallyEvent = 'shownModally';
	public static showingModallyEvent = 'showingModally';
	public static accessibilityBlurEvent = accessibilityBlurEvent;
	public static accessibilityFocusEvent = accessibilityFocusEvent;
	public static accessibilityFocusChangedEvent = accessibilityFocusChangedEvent;
	public static accessibilityPerformEscapeEvent = accessibilityPerformEscapeEvent;

	public accessibilityIdentifier: string;
	public accessibilityLabel: string;
	public accessibilityValue: string;
	public accessibilityHint: string;

	public testID: string;

	public touchAnimation: boolean | TouchAnimationOptions;
	public ignoreTouchAnimation: boolean;
	public touchDelay: number;

	/**
	 * visionOS only
	 */
	public visionHoverStyle: string | VisionHoverOptions;
	public visionIgnoreHoverStyle: boolean;

	protected _closeModalCallback: Function;
	public _manager: any;
	public _modalParent: ViewCommon;
	private _modalContext: any;
	private _modal: ViewCommon;

	/**
	 * Active transition instance id for tracking state
	 */
	transitionId: number;

	private _measuredWidth: number;
	private _measuredHeight: number;

	protected _isLayoutValid: boolean;
	private _cssType: string;

	private _localAnimations: Set<am.Animation>;

	_currentWidthMeasureSpec: number;
	_currentHeightMeasureSpec: number;

	_setMinWidthNative: (value: CoreTypes.LengthType) => void;
	_setMinHeightNative: (value: CoreTypes.LengthType) => void;

	public readonly _gestureObservers = {} as Record<GestureTypes, Array<GesturesObserver>>;

	_androidContentDescriptionUpdated?: boolean;

	get css(): string {
		const scope = this._styleScope;

		return scope && scope.css;
	}
	set css(value: string) {
		this._updateStyleScope(undefined, undefined, value);
	}

	public addCss(cssString: string): void {
		this._updateStyleScope(undefined, cssString);
	}

	public addCssFile(cssFileName: string) {
		this._updateStyleScope(cssFileName);
	}

	public changeCssFile(cssFileName: string): void {
		const scope = this._styleScope;
		if (scope && cssFileName) {
			scope.changeCssFile(cssFileName);
			this._onCssStateChange();
		}
	}

	public _updateStyleScope(cssFileName?: string, cssString?: string, css?: string): void {
		let scope = this._styleScope;
		if (!scope) {
			scope = new StyleScope();
			this.setScopeProperty(scope, cssFileName, cssString, css);
			this._inheritStyleScope(scope);
			this._isStyleScopeHost = true;
		} else {
			this.setScopeProperty(scope, cssFileName, cssString, css);
			this._onCssStateChange();
		}
	}

	private setScopeProperty(scope: StyleScope, cssFileName?: string, cssString?: string, css?: string): void {
		if (cssFileName !== undefined) {
			scope.addCssFile(cssFileName);
		} else if (cssString !== undefined) {
			scope.addCss(cssString);
		} else if (css !== undefined) {
			scope.css = css;
		}
	}

	onLoaded() {
		if (!this.isLoaded) {
			const hasTap = this.hasListeners('tap') || this.hasListeners('tapChange') || !!this.getGestureObservers(GestureTypes.tap);
			const enableTapAnimations = TouchManager.enableGlobalTapAnimations && hasTap;
			if (!this.ignoreTouchAnimation && (this.touchAnimation || enableTapAnimations)) {
				TouchManager.addAnimations(this);
			}

			if (__VISIONOS__) {
				const enableHoverStyle = TouchManager.enableGlobalHoverWhereTap && hasTap;
				if (!this.visionIgnoreHoverStyle && (this.visionHoverStyle || enableHoverStyle)) {
					TouchManager.addHoverStyle(this);
				}
			}
		}
		super.onLoaded();
		if (this.accessible) {
			setupAccessibleView(this);
		}
	}

	public _closeAllModalViewsInternal(): boolean {
		if (_rootModalViews && _rootModalViews.length > 0) {
			_rootModalViews.forEach((v) => {
				v.closeModal();
			});

			return true;
		}

		return false;
	}

	public _getRootModalViews(): Array<ViewBase> {
		return _rootModalViews;
	}

	public _onLivesync(context?: ModuleContext): boolean {
		if (Trace.isEnabled()) {
			Trace.write(`${this}._onLivesync(${JSON.stringify(context)})`, Trace.categories.Livesync);
		}

		let handled = false;

		if (this._closeAllModalViewsInternal()) {
			handled = true;
		}

		if (this._handleLivesync(context)) {
			return true;
		}

		this.eachChildView((child: ViewCommon) => {
			if (child._onLivesync(context)) {
				handled = true;
				return false;
			}
		});

		return handled;
	}

	public _handleLivesync(context?: ModuleContext): boolean {
		if (Trace.isEnabled()) {
			Trace.write(`${this}._handleLivesync(${JSON.stringify(context)})`, Trace.categories.Livesync);
		}

		// Handle local CSS
		if (viewMatchesModuleContext(this, context, ['style'])) {
			if (Trace.isEnabled()) {
				Trace.write(`Change Handled: Changing CSS for ${this}`, Trace.categories.Livesync);
			}

			// Always load styles with ".css" extension. Even when changes are in ".scss" ot ".less" files
			const cssModuleName = `${sanitizeModuleName(context.path)}.css`;

			this.changeCssFile(cssModuleName);

			return true;
		}

		// Handle script/markup changes in custom components by falling back to page refresh
		if (viewMatchesModuleContext(this, context, ['markup', 'script']) && this.page && this.page.frame) {
			if (Trace.isEnabled()) {
				Trace.write(`Change Handled: Changing ${context.type} for ${this} inside ${this.page}`, Trace.categories.Livesync);
			}

			return this.page.frame._handleLivesync({
				type: context.type,
				path: this.page._moduleName,
			});
		}

		return false;
	}

	_setupAsRootView(context: any): void {
		super._setupAsRootView(context);
		if (!this._styleScope) {
			this._updateStyleScope();
		}
	}

	protected _observe(type: GestureTypes, callback: (args: GestureEventData) => void, thisArg?: any): void {
		thisArg = thisArg || undefined;

		if (this._gestureObservers[type]?.find((observer) => observer.callback === callback && observer.context === thisArg)) {
			// Already added.
			return;
		}

		if (!this._gestureObservers[type]) {
			this._gestureObservers[type] = [];
		}

		this._gestureObservers[type].push(gestureObserve(this, type, callback, thisArg));
	}

	public getGestureObservers(type: GestureTypes): Array<GesturesObserver> | undefined {
		return this._gestureObservers[type];
	}

	public addEventListener(eventNames: string, callback: (data: EventData) => void, thisArg?: any) {
		thisArg = thisArg || undefined;

		// Normalize "ontap" -> "tap"
		const normalizedName = getEventOrGestureName(eventNames);

		// Coerce "tap" -> GestureTypes.tap
		// Coerce "loaded" -> undefined
		const gestureType: GestureTypes | undefined = gestureFromString(normalizedName);

		// If it's a gesture (and this Observable declares e.g. `static tapEvent`)
		if (gestureType && !this._isEvent(normalizedName)) {
			this._observe(gestureType, callback, thisArg);
			return;
		}

		super.addEventListener(normalizedName, callback, thisArg);
	}

	public removeEventListener(eventNames: string, callback?: (data: EventData) => void, thisArg?: any) {
		thisArg = thisArg || undefined;

		// Normalize "ontap" -> "tap"
		const normalizedName = getEventOrGestureName(eventNames);

		// Coerce "tap" -> GestureTypes.tap
		// Coerce "loaded" -> undefined
		const gestureType: GestureTypes | undefined = gestureFromString(normalizedName);

		// If it's a gesture (and this Observable declares e.g. `static tapEvent`)
		if (gestureType && !this._isEvent(normalizedName)) {
			this._disconnectGestureObservers(gestureType, callback, thisArg);
			return;
		}

		super.removeEventListener(normalizedName, callback, thisArg);
	}

	public onBackPressed(): boolean {
		return false;
	}

	public _getFragmentManager(): any {
		return undefined;
	}

	private getModalOptions(args: any[]): { view: ViewCommon; options: ShowModalOptions } {
		if (args.length === 0) {
			throw new Error('showModal without parameters is deprecated. Please call showModal on a view instance instead.');
		} else {
			let options: ShowModalOptions = null;

			if (args.length === 2) {
				options = <ShowModalOptions>args[1];
			} else {
				if (args[0] instanceof ViewCommon) {
					console.log('showModal(view: ViewBase, context: any, closeCallback: Function, fullscreen?: boolean, animated?: boolean, stretched?: boolean) ' + 'is deprecated. Use showModal(view: ViewBase, modalOptions: ShowModalOptions) instead.');
				} else {
					console.log('showModal(moduleName: string, context: any, closeCallback: Function, fullscreen?: boolean, animated?: boolean, stretched?: boolean) ' + 'is deprecated. Use showModal(moduleName: string, modalOptions: ShowModalOptions) instead.');
				}

				options = {
					context: args[1],
					closeCallback: args[2],
					fullscreen: args[3],
					animated: args[4],
					stretched: args[5],
				};
			}

			const firstArgument = args[0];
			const view = firstArgument instanceof ViewCommon ? firstArgument : <ViewCommon>Builder.createViewFromEntry({
							moduleName: firstArgument,
						});

			return { view, options };
		}
	}

	public showModal(...args): ViewDefinition {
		const { view, options } = this.getModalOptions(args);
		if (options.transition?.instance) {
			SharedTransition.updateState(options.transition?.instance.id, {
				page: this,
				toPage: view,
			});
		}
		view._showNativeModalView(this, options);

		return view;
	}

	public closeModal(...args) {
		const closeCallback = this._closeModalCallback;
		if (closeCallback) {
			closeCallback(...args);
		} else {
			const parent = this.parent;
			if (parent) {
				parent.closeModal(...args);
			}
		}
	}

	public get modal(): ViewCommon {
		return this._modal;
	}

	protected _showNativeModalView(parent: ViewCommon, options: ShowModalOptions) {
		_rootModalViews.push(this);

		this.cssClasses.add(CSSUtils.MODAL_ROOT_VIEW_CSS_CLASS);
		const modalRootViewCssClasses = CSSUtils.getSystemCssClasses();
		modalRootViewCssClasses.forEach((c) => this.cssClasses.add(c));

		parent._modal = this;
		this.style.fontScaleInternal = getCurrentFontScale();
		this._modalParent = parent;
		this._modalContext = options.context;
		this._closeModalCallback = (...originalArgs) => {
			const cleanupModalViews = () => {
				const modalIndex = _rootModalViews.indexOf(this);
				_rootModalViews.splice(modalIndex);
				this._modalParent = null;
				this._modalContext = null;
				this._closeModalCallback = null;
				this._dialogClosed();
				parent._modal = null;
			};

			const whenClosedCallback = () => {
				const transitionState = SharedTransition.getState(this.transitionId);
				if (transitionState?.interactiveBegan) {
					SharedTransition.updateState(this.transitionId, {
						interactiveBegan: false,
					});
					if (!transitionState?.interactiveCancelled) {
						cleanupModalViews();
					}
				}

				if (!transitionState?.interactiveCancelled) {
					if (typeof options.closeCallback === 'function') {
						options.closeCallback.apply(undefined, originalArgs);
					}

					this._tearDownUI(true);
				}
			};

			const transitionState = SharedTransition.getState(this.transitionId);
			if (!transitionState?.interactiveBegan) {
				cleanupModalViews();
			}

			this._hideNativeModalView(parent, whenClosedCallback);
		};
	}

	protected _hideNativeModalView(parent: ViewCommon, whenClosedCallback: () => void) {}

	protected _raiseLayoutChangedEvent() {
		const args: EventData = {
			eventName: ViewCommon.layoutChangedEvent,
			object: this,
		};
		this.notify(args);
	}

	protected _raiseShownModallyEvent() {
		const args: ShownModallyData = {
			eventName: ViewCommon.shownModallyEvent,
			object: this,
			context: this._modalContext,
			closeCallback: this._closeModalCallback,
		};
		this.notify(args);
	}

	protected _raiseShowingModallyEvent() {
		const args: ShownModallyData = {
			eventName: ViewCommon.showingModallyEvent,
			object: this,
			context: this._modalContext,
			closeCallback: this._closeModalCallback,
		};
		this.notify(args);
	}

	private _isEvent(name: string): boolean {
		return this.constructor && `${name}Event` in this.constructor;
	}

	private _disconnectGestureObservers(type: GestureTypes, callback?: (data: EventData) => void, thisArg?: any): void {
		// Largely mirrors the implementation of Observable.innerRemoveEventListener().

		const observers = this.getGestureObservers(type);
		if (!observers) {
			return;
		}

		for (let i = 0; i < observers.length; i++) {
			const observer = observers[i];

			// If we have a `thisArg`, refine on both `callback` and `thisArg`.
			if (thisArg && (observer.callback !== callback || observer.context !== thisArg)) {
				continue;
			}

			// If we don't have a `thisArg`, refine only on `callback`.
			if (callback && observer.callback !== callback) {
				continue;
			}

			observer.disconnect();
			observers.splice(i, 1);
			i--;
		}

		if (!observers.length) {
			delete this._gestureObservers[type];
		}
	}

	// START Style property shortcuts
	get borderColor(): string | Color {
		return this.style.borderColor;
	}
	set borderColor(value: string | Color) {
		this.style.borderColor = value;
	}

	get borderTopColor(): Color {
		return this.style.borderTopColor;
	}
	set borderTopColor(value: Color) {
		this.style.borderTopColor = value;
	}

	get borderRightColor(): Color {
		return this.style.borderRightColor;
	}
	set borderRightColor(value: Color) {
		this.style.borderRightColor = value;
	}

	get borderBottomColor(): Color {
		return this.style.borderBottomColor;
	}
	set borderBottomColor(value: Color) {
		this.style.borderBottomColor = value;
	}

	get borderLeftColor(): Color {
		return this.style.borderLeftColor;
	}
	set borderLeftColor(value: Color) {
		this.style.borderLeftColor = value;
	}

	get borderWidth(): string | CoreTypes.LengthType {
		return this.style.borderWidth;
	}
	set borderWidth(value: string | CoreTypes.LengthType) {
		this.style.borderWidth = value;
	}

	get borderTopWidth(): CoreTypes.LengthType {
		return this.style.borderTopWidth;
	}
	set borderTopWidth(value: CoreTypes.LengthType) {
		this.style.borderTopWidth = value;
	}

	get borderRightWidth(): CoreTypes.LengthType {
		return this.style.borderRightWidth;
	}
	set borderRightWidth(value: CoreTypes.LengthType) {
		this.style.borderRightWidth = value;
	}

	get borderBottomWidth(): CoreTypes.LengthType {
		return this.style.borderBottomWidth;
	}
	set borderBottomWidth(value: CoreTypes.LengthType) {
		this.style.borderBottomWidth = value;
	}

	get borderLeftWidth(): CoreTypes.LengthType {
		return this.style.borderLeftWidth;
	}
	set borderLeftWidth(value: CoreTypes.LengthType) {
		this.style.borderLeftWidth = value;
	}

	get borderRadius(): string | CoreTypes.LengthType {
		return this.style.borderRadius;
	}
	set borderRadius(value: string | CoreTypes.LengthType) {
		this.style.borderRadius = value;
	}

	get borderTopLeftRadius(): CoreTypes.LengthType {
		return this.style.borderTopLeftRadius;
	}
	set borderTopLeftRadius(value: CoreTypes.LengthType) {
		this.style.borderTopLeftRadius = value;
	}

	get borderTopRightRadius(): CoreTypes.LengthType {
		return this.style.borderTopRightRadius;
	}
	set borderTopRightRadius(value: CoreTypes.LengthType) {
		this.style.borderTopRightRadius = value;
	}

	get borderBottomRightRadius(): CoreTypes.LengthType {
		return this.style.borderBottomRightRadius;
	}
	set borderBottomRightRadius(value: CoreTypes.LengthType) {
		this.style.borderBottomRightRadius = value;
	}

	get borderBottomLeftRadius(): CoreTypes.LengthType {
		return this.style.borderBottomLeftRadius;
	}
	set borderBottomLeftRadius(value: CoreTypes.LengthType) {
		this.style.borderBottomLeftRadius = value;
	}

	get color(): Color {
		return this.style.color;
	}
	set color(value: Color) {
		this.style.color = value;
	}

	get background(): string {
		return this.style.background;
	}
	set background(value: string) {
		this.style.background = value;
	}

	get backgroundColor(): Color {
		return this.style.backgroundColor;
	}
	set backgroundColor(value: Color) {
		this.style.backgroundColor = value;
	}

	get backgroundImage(): string | LinearGradient {
		return this.style.backgroundImage;
	}
	set backgroundImage(value: string | LinearGradient) {
		this.style.backgroundImage = value;
	}

	get backgroundSize(): string {
		return this.style.backgroundSize;
	}
	set backgroundSize(value: string) {
		this.style.backgroundSize = value;
	}

	get backgroundPosition(): string {
		return this.style.backgroundPosition;
	}
	set backgroundPosition(value: string) {
		this.style.backgroundPosition = value;
	}

	get backgroundRepeat(): CoreTypes.BackgroundRepeatType {
		return this.style.backgroundRepeat;
	}
	set backgroundRepeat(value: CoreTypes.BackgroundRepeatType) {
		this.style.backgroundRepeat = value;
	}

	get boxShadow(): ShadowCSSValues {
		return this.style.boxShadow;
	}
	set boxShadow(value: ShadowCSSValues) {
		this.style.boxShadow = value;
	}

	get minWidth(): CoreTypes.LengthType {
		return this.style.minWidth;
	}

	set minWidth(value: CoreTypes.LengthType) {
		this.style.minWidth = value;
	}

	get minHeight(): CoreTypes.LengthType {
		return this.style.minHeight;
	}
	set minHeight(value: CoreTypes.LengthType) {
		this.style.minHeight = value;
	}

	get width(): CoreTypes.PercentLengthType {
		return this.style.width;
	}
	set width(value: CoreTypes.PercentLengthType) {
		this.style.width = value;
	}

	get height(): CoreTypes.PercentLengthType {
		return this.style.height;
	}
	set height(value: CoreTypes.PercentLengthType) {
		this.style.height = value;
	}

	get margin(): string | CoreTypes.PercentLengthType {
		return this.style.margin;
	}
	set margin(value: string | CoreTypes.PercentLengthType) {
		this.style.margin = value;
	}

	get marginLeft(): CoreTypes.PercentLengthType {
		return this.style.marginLeft;
	}
	set marginLeft(value: CoreTypes.PercentLengthType) {
		this.style.marginLeft = value;
	}

	get marginTop(): CoreTypes.PercentLengthType {
		return this.style.marginTop;
	}
	set marginTop(value: CoreTypes.PercentLengthType) {
		this.style.marginTop = value;
	}

	get marginRight(): CoreTypes.PercentLengthType {
		return this.style.marginRight;
	}
	set marginRight(value: CoreTypes.PercentLengthType) {
		this.style.marginRight = value;
	}

	get marginBottom(): CoreTypes.PercentLengthType {
		return this.style.marginBottom;
	}
	set marginBottom(value: CoreTypes.PercentLengthType) {
		this.style.marginBottom = value;
	}

	get horizontalAlignment(): CoreTypes.HorizontalAlignmentType {
		return this.style.horizontalAlignment;
	}
	set horizontalAlignment(value: CoreTypes.HorizontalAlignmentType) {
		this.style.horizontalAlignment = value;
	}

	get verticalAlignment(): CoreTypes.VerticalAlignmentType {
		return this.style.verticalAlignment;
	}
	set verticalAlignment(value: CoreTypes.VerticalAlignmentType) {
		this.style.verticalAlignment = value;
	}

	get visibility(): CoreTypes.VisibilityType {
		return this.style.visibility;
	}
	set visibility(value: CoreTypes.VisibilityType) {
		this.style.visibility = value;
	}

	get opacity(): number {
		return this.style.opacity;
	}
	set opacity(value: number) {
		this.style.opacity = value;
	}

	get rotate(): number {
		return this.style.rotate;
	}
	set rotate(value: number) {
		this.style.rotate = value;
	}

	get rotateX(): number {
		return this.style.rotateX;
	}
	set rotateX(value: number) {
		this.style.rotateX = value;
	}

	get rotateY(): number {
		return this.style.rotateY;
	}
	set rotateY(value: number) {
		this.style.rotateY = value;
	}

	get perspective(): number {
		return this.style.perspective;
	}
	set perspective(value: number) {
		this.style.perspective = value;
	}

	get textTransform(): CoreTypes.TextTransformType {
		return this.style.textTransform;
	}
	set textTransform(value: CoreTypes.TextTransformType) {
		this.style.textTransform = value;
	}

	get translateX(): CoreTypes.dip {
		return this.style.translateX;
	}
	set translateX(value: CoreTypes.dip) {
		this.style.translateX = value;
	}

	get translateY(): CoreTypes.dip {
		return this.style.translateY;
	}
	set translateY(value: CoreTypes.dip) {
		this.style.translateY = value;
	}

	get scaleX(): number {
		return this.style.scaleX;
	}
	set scaleX(value: number) {
		this.style.scaleX = value;
	}

	get scaleY(): number {
		return this.style.scaleY;
	}
	set scaleY(value: number) {
		this.style.scaleY = value;
	}

	get accessible(): boolean {
		return this.style.accessible;
	}
	set accessible(value: boolean) {
		this.style.accessible = value;
	}

	get accessibilityHidden(): boolean {
		return this.style.accessibilityHidden;
	}
	set accessibilityHidden(value: boolean) {
		this.style.accessibilityHidden = value;
	}

	get accessibilityRole(): AccessibilityRole {
		return this.style.accessibilityRole;
	}
	set accessibilityRole(value: AccessibilityRole) {
		this.style.accessibilityRole = value;
	}

	get accessibilityState(): AccessibilityState {
		return this.style.accessibilityState;
	}
	set accessibilityState(value: AccessibilityState) {
		this.style.accessibilityState = value;
	}

	get accessibilityLiveRegion(): AccessibilityLiveRegion {
		return this.style.accessibilityLiveRegion;
	}
	set accessibilityLiveRegion(value: AccessibilityLiveRegion) {
		this.style.accessibilityLiveRegion = value;
	}

	get accessibilityLanguage(): string {
		return this.style.accessibilityLanguage;
	}
	set accessibilityLanguage(value: string) {
		this.style.accessibilityLanguage = value;
	}

	get accessibilityMediaSession(): boolean {
		return this.style.accessibilityMediaSession;
	}
	set accessibilityMediaSession(value: boolean) {
		this.style.accessibilityMediaSession = value;
	}

	get iosAccessibilityAdjustsFontSize(): boolean {
		return this.style.iosAccessibilityAdjustsFontSize;
	}
	set iosAccessibilityAdjustsFontSize(value: boolean) {
		this.style.iosAccessibilityAdjustsFontSize = value;
	}

	get iosAccessibilityMinFontScale(): number {
		return this.style.iosAccessibilityMinFontScale;
	}
	set iosAccessibilityMinFontScale(value: number) {
		this.style.iosAccessibilityMinFontScale = value;
	}

	get iosAccessibilityMaxFontScale(): number {
		return this.style.iosAccessibilityMaxFontScale;
	}
	set iosAccessibilityMaxFontScale(value: number) {
		this.style.iosAccessibilityMaxFontScale = value;
	}

	get automationText(): string {
		return this.accessibilityIdentifier;
	}

	set automationText(value: string) {
		this.accessibilityIdentifier = value;
	}

	get androidElevation(): number {
		return this.style.androidElevation;
	}
	set androidElevation(value: number) {
		this.style.androidElevation = value;
	}

	get androidDynamicElevationOffset(): number {
		return this.style.androidDynamicElevationOffset;
	}
	set androidDynamicElevationOffset(value: number) {
		this.style.androidDynamicElevationOffset = value;
	}

	//END Style property shortcuts

	public originX: number;
	public originY: number;
	public isEnabled: boolean;
	public isUserInteractionEnabled: boolean;
	public iosOverflowSafeArea: boolean;
	public iosOverflowSafeAreaEnabled: boolean;
	public iosIgnoreSafeArea: boolean;

	get isLayoutValid(): boolean {
		return this._isLayoutValid;
	}

	get cssType(): string {
		if (!this._cssType) {
			this._cssType = this.typeName.toLowerCase();
		}

		return this._cssType;
	}
	set cssType(type: string) {
		this._cssType = type.toLowerCase();
	}

	get isLayoutRequired(): boolean {
		return true;
	}

	public measure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		this._setCurrentMeasureSpecs(widthMeasureSpec, heightMeasureSpec);
	}

	public layout(left: number, top: number, right: number, bottom: number): void {
		this._setCurrentLayoutBounds(left, top, right, bottom);
	}

	public getMeasuredWidth(): number {
		return this._measuredWidth & layout.MEASURED_SIZE_MASK || 0;
	}

	public getMeasuredHeight(): number {
		return this._measuredHeight & layout.MEASURED_SIZE_MASK || 0;
	}

	public getMeasuredState(): number {
		return (this._measuredWidth & layout.MEASURED_STATE_MASK) | ((this._measuredHeight >> layout.MEASURED_HEIGHT_STATE_SHIFT) & (layout.MEASURED_STATE_MASK >> layout.MEASURED_HEIGHT_STATE_SHIFT));
	}

	public setMeasuredDimension(measuredWidth: number, measuredHeight: number): void {
		this._measuredWidth = measuredWidth;
		this._measuredHeight = measuredHeight;
		if (Trace.isEnabled()) {
			Trace.write(this + ' :setMeasuredDimension: ' + measuredWidth + ', ' + measuredHeight, Trace.categories.Layout);
		}
	}

	public requestLayout(): void {
		this._isLayoutValid = false;
		super.requestLayout();
	}

	public abstract onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void;
	public abstract onLayout(left: number, top: number, right: number, bottom: number): void;
	public abstract layoutNativeView(left: number, top: number, right: number, bottom: number): void;

	public static resolveSizeAndState(size: number, specSize: number, specMode: number, childMeasuredState: number): number {
		return ViewHelper.resolveSizeAndState(size, specSize, specMode, childMeasuredState);
	}

	public static combineMeasuredStates(curState: number, newState): number {
		return ViewHelper.combineMeasuredStates(curState, newState);
	}

	public static layoutChild(parent: ViewDefinition, child: ViewDefinition, left: number, top: number, right: number, bottom: number, setFrame = true): void {
		ViewHelper.layoutChild(parent, child, left, top, right, bottom);
	}

	public static measureChild(parent: ViewCommon, child: ViewCommon, widthMeasureSpec: number, heightMeasureSpec: number): { measuredWidth: number; measuredHeight: number } {
		return ViewHelper.measureChild(parent, child, widthMeasureSpec, heightMeasureSpec);
	}

	_setCurrentMeasureSpecs(widthMeasureSpec: number, heightMeasureSpec: number): boolean {
		const changed: boolean = this._currentWidthMeasureSpec !== widthMeasureSpec || this._currentHeightMeasureSpec !== heightMeasureSpec;
		this._currentWidthMeasureSpec = widthMeasureSpec;
		this._currentHeightMeasureSpec = heightMeasureSpec;

		return changed;
	}

	_getCurrentLayoutBounds(): {
		left: number;
		top: number;
		right: number;
		bottom: number;
	} {
		return { left: 0, top: 0, right: 0, bottom: 0 };
	}

	/**
	 * Returns two booleans - the first if "boundsChanged" the second is "sizeChanged".
	 */
	_setCurrentLayoutBounds(left: number, top: number, right: number, bottom: number): { boundsChanged: boolean; sizeChanged: boolean } {
		this._isLayoutValid = true;
		const boundsChanged: boolean = this._oldLeft !== left || this._oldTop !== top || this._oldRight !== right || this._oldBottom !== bottom;
		const sizeChanged: boolean = this._oldRight - this._oldLeft !== right - left || this._oldBottom - this._oldTop !== bottom - top;
		this._oldLeft = left;
		this._oldTop = top;
		this._oldRight = right;
		this._oldBottom = bottom;

		return { boundsChanged, sizeChanged };
	}

	public eachChild(callback: (child: ViewBase) => boolean): void {
		this.eachChildView(<any>callback);
	}

	public eachChildView(callback: (view: ViewDefinition) => boolean) {
		//
	}

	_getNativeViewsCount(): number {
		return this._isAddedToNativeVisualTree ? 1 : 0;
	}

	_eachLayoutView(callback: (View) => void): void {
		return callback(this);
	}

	public focus(): boolean {
		return undefined;
	}

	public getSafeAreaInsets(): { left; top; right; bottom } {
		return { left: 0, top: 0, right: 0, bottom: 0 };
	}

	public getLocationInWindow(): Point {
		return undefined;
	}

	public getLocationOnScreen(): Point {
		return undefined;
	}

	public getLocationRelativeTo(otherView: ViewDefinition): Point {
		return undefined;
	}

	public getActualSize(): Size {
		const currentBounds = this._getCurrentLayoutBounds();
		if (!currentBounds) {
			return undefined;
		}

		return {
			width: layout.toDeviceIndependentPixels(currentBounds.right - currentBounds.left),
			height: layout.toDeviceIndependentPixels(currentBounds.bottom - currentBounds.top),
		};
	}

	public animate(animation: any): am.AnimationPromise {
		return this.createAnimation(animation).play();
	}

	public createAnimation(animation: any): am.Animation {
		ensureAnimationModule();
		if (!this._localAnimations) {
			this._localAnimations = new Set();
		}
		animation.target = this;
		const anim = new animationModule.Animation([animation]);
		this._localAnimations.add(anim);

		return anim;
	}

	public _removeAnimation(animation: am.Animation): boolean {
		const localAnimations = this._localAnimations;
		if (localAnimations && localAnimations.has(animation)) {
			localAnimations.delete(animation);
			if (animation.isPlaying) {
				animation.cancel();
			}

			return true;
		}

		return false;
	}

	public resetNativeView(): void {
		if (this._localAnimations) {
			this._localAnimations.forEach((a) => this._removeAnimation(a));
		}

		super.resetNativeView();
	}

	public _setNativeViewFrame(nativeView: any, frame: any) {
		//
	}

	public _getValue(): never {
		throw new Error('The View._getValue is obsolete. There is a new property system.');
	}

	public _setValue(): never {
		throw new Error('The View._setValue is obsolete. There is a new property system.');
	}

	_updateEffectiveLayoutValues(parentWidthMeasureSize: number, parentWidthMeasureMode: number, parentHeightMeasureSize: number, parentHeightMeasureMode: number): void {
		const style = this.style;

		const availableWidth = parentWidthMeasureMode === layout.UNSPECIFIED ? -1 : parentWidthMeasureSize;

		this.effectiveWidth = PercentLength.toDevicePixels(style.width, -2, availableWidth);
		this.effectiveMarginLeft = PercentLength.toDevicePixels(style.marginLeft, 0, availableWidth);
		this.effectiveMarginRight = PercentLength.toDevicePixels(style.marginRight, 0, availableWidth);

		const availableHeight = parentHeightMeasureMode === layout.UNSPECIFIED ? -1 : parentHeightMeasureSize;

		this.effectiveHeight = PercentLength.toDevicePixels(style.height, -2, availableHeight);
		this.effectiveMarginTop = PercentLength.toDevicePixels(style.marginTop, 0, availableHeight);
		this.effectiveMarginBottom = PercentLength.toDevicePixels(style.marginBottom, 0, availableHeight);
	}

	public _setNativeClipToBounds() {
		//
	}

	public _redrawNativeBackground(value: any): void {
		//
	}
	public _applyBackground(background, isBorderDrawable: boolean, onlyColor: boolean, backgroundDrawable: any) {
		//
	}

	_onAttachedToWindow(): void {
		//
	}

	_onDetachedFromWindow(): void {
		//
	}

	_hasAncestorView(ancestorView: ViewDefinition): boolean {
		const matcher = (view: ViewDefinition) => view === ancestorView;

		for (let parent = this.parent; parent != null; parent = parent.parent) {
			if (matcher(<ViewDefinition>parent)) {
				return true;
			}
		}

		return false;
	}

	public sendAccessibilityEvent(options: Partial<AccessibilityEventOptions>): void {
		return;
	}

	public accessibilityAnnouncement(msg?: string): void {
		return;
	}

	public accessibilityScreenChanged(): void {
		return;
	}

	public setAccessibilityIdentifier(view: any, value: string) {
		return;
	}
}

export const originXProperty = new Property<ViewCommon, number>({
	name: 'originX',
	defaultValue: 0.5,
	valueConverter: (v) => parseFloat(v),
});
originXProperty.register(ViewCommon);

export const originYProperty = new Property<ViewCommon, number>({
	name: 'originY',
	defaultValue: 0.5,
	valueConverter: (v) => parseFloat(v),
});
originYProperty.register(ViewCommon);

export const defaultVisualStateProperty = new Property<ViewCommon, string>({
	name: 'defaultVisualState',
	defaultValue: 'normal',
	valueChanged(this: void, target, oldValue, newValue): void {
		target.defaultVisualState = newValue || 'normal';
		if (!target.visualState || target.visualState === oldValue) {
			target._goToVisualState(target.defaultVisualState);
		}
	},
});
defaultVisualStateProperty.register(ViewCommon);

export const isEnabledProperty = new Property<ViewCommon, boolean>({
	name: 'isEnabled',
	defaultValue: true,
	valueConverter: booleanConverter,
	valueChanged(this: void, target, oldValue, newValue): void {
		target._goToVisualState(newValue ? target.defaultVisualState : 'disabled');
	},
});
isEnabledProperty.register(ViewCommon);

export const isUserInteractionEnabledProperty = new Property<ViewCommon, boolean>({
	name: 'isUserInteractionEnabled',
	defaultValue: true,
	valueConverter: booleanConverter,
});
isUserInteractionEnabledProperty.register(ViewCommon);

export const iosOverflowSafeAreaProperty = new Property<ViewCommon, boolean>({
	name: 'iosOverflowSafeArea',
	defaultValue: false,
	valueConverter: booleanConverter,
});
iosOverflowSafeAreaProperty.register(ViewCommon);

export const iosOverflowSafeAreaEnabledProperty = new InheritedProperty<ViewCommon, boolean>({
	name: 'iosOverflowSafeAreaEnabled',
	defaultValue: true,
	valueConverter: booleanConverter,
});
iosOverflowSafeAreaEnabledProperty.register(ViewCommon);
export const iosIgnoreSafeAreaProperty = new InheritedProperty({
	name: 'iosIgnoreSafeArea',
	defaultValue: false,
	valueConverter: booleanConverter,
});
iosIgnoreSafeAreaProperty.register(ViewCommon);

export const visionHoverStyleProperty = new Property<ViewCommon, string | VisionHoverOptions>({
	name: 'visionHoverStyle',
	valueChanged(view, oldValue, newValue) {
		view.visionHoverStyle = newValue;
	},
});
visionHoverStyleProperty.register(ViewCommon);

const visionIgnoreHoverStyleProperty = new Property<ViewCommon, boolean>({
	name: 'visionIgnoreHoverStyle',
	valueChanged(view, oldValue, newValue) {
		view.visionIgnoreHoverStyle = newValue;
	},
	valueConverter: booleanConverter,
});
visionIgnoreHoverStyleProperty.register(ViewCommon);

const touchAnimationProperty = new Property<ViewCommon, boolean | TouchAnimationOptions>({
	name: 'touchAnimation',
	valueChanged(view, oldValue, newValue) {
		view.touchAnimation = newValue;
	},
	valueConverter(value) {
		if (isObject(value)) {
			return <TouchAnimationOptions>value;
		} else {
			return booleanConverter(value);
		}
	},
});
touchAnimationProperty.register(ViewCommon);

const ignoreTouchAnimationProperty = new Property<ViewCommon, boolean>({
	name: 'ignoreTouchAnimation',
	valueChanged(view, oldValue, newValue) {
		view.ignoreTouchAnimation = newValue;
	},
	valueConverter: booleanConverter,
});
ignoreTouchAnimationProperty.register(ViewCommon);

const touchDelayProperty = new Property<ViewCommon, number>({
	name: 'touchDelay',
	valueChanged(view, oldValue, newValue) {
		view.touchDelay = newValue;
	},
	valueConverter: (v) => parseFloat(v),
});
touchDelayProperty.register(ViewCommon);

export const testIDProperty = new Property<ViewCommon, string>({
	name: 'testID',
});
testIDProperty.register(ViewCommon);

accessibilityIdentifierProperty.register(ViewCommon);
accessibilityLabelProperty.register(ViewCommon);
accessibilityValueProperty.register(ViewCommon);
accessibilityHintProperty.register(ViewCommon);
accessibilityIgnoresInvertColorsProperty.register(ViewCommon);
