import { Page as PageDefinition } from '.';
import { ContentView } from '../content-view';
import { View, CSSType } from '../core/view';
import { ShownModallyData } from '../core/view/view-interfaces';
import { booleanConverter } from '../core/view-base';
import { Property, CssProperty } from '../core/properties';
import { Style } from '../styling/style';
import { Color } from '../../color';
import { EventData } from '../../data/observable';
import type { Frame } from '../frame';
import { isFrame } from '../frame/frame-helpers';
import { ActionBar } from '../action-bar';
import { KeyframeAnimationInfo } from '../animation/keyframe-animation';
import { profile } from '../../profiling';
import { PageEvents } from './events';

interface NavigatedData extends EventData {
	context: any;
	isBackNavigation: boolean;
}

@CSSType('Page')
export class PageBase extends ContentView {
	public static navigatingToEvent = PageEvents.navigatingToEvent;
	public static navigatedToEvent = PageEvents.navigatedToEvent;
	public static navigatingFromEvent = PageEvents.navigatingFromEvent;
	public static navigatedFromEvent = PageEvents.navigatedFromEvent;

	private _navigationContext: any;
	private _actionBar: ActionBar;

	public actionBarHidden: boolean;
	public enableSwipeBackNavigation: boolean;
	public backgroundSpanUnderStatusBar: boolean;
	public hasActionBar: boolean;
	public accessibilityAnnouncePageEnabled = true;

	get navigationContext(): any {
		return this._navigationContext;
	}

	get actionBar(): ActionBar {
		if (!this._actionBar) {
			this.hasActionBar = true;
			this._actionBar = new ActionBar();
			this._addView(this._actionBar);
		}

		return this._actionBar;
	}
	set actionBar(value: ActionBar) {
		if (!value) {
			throw new Error('ActionBar cannot be null or undefined.');
		}

		if (this._actionBar !== value) {
			if (this._actionBar) {
				this._removeView(this._actionBar);
			}
			this.hasActionBar = true;
			this._actionBar = value;
			this._addView(this._actionBar);
		}
	}

	public get androidStatusBarBackground(): Color {
		return this.style.androidStatusBarBackground;
	}
	public set androidStatusBarBackground(value: Color) {
		this.style.androidStatusBarBackground = value;
	}

	get page(): PageDefinition {
		return this;
	}

	public _parentChanged(oldParent: View): void {
		const newParent = this.parent;
		if (newParent && !isFrame(newParent)) {
			throw new Error(`Page can only be nested inside Frame. New parent: ${newParent}`);
		}

		super._parentChanged(oldParent);
	}

	public _addChildFromBuilder(name: string, value: any) {
		if (value instanceof ActionBar) {
			this.actionBar = value;
		} else {
			super._addChildFromBuilder(name, value);
		}
	}

	public getKeyframeAnimationWithName(animationName: string): KeyframeAnimationInfo {
		return this._styleScope.getKeyframeAnimationWithName(animationName);
	}

	get frame(): Frame {
		return <Frame>this.parent;
	}

	private createNavigatedData(eventName: string, isBackNavigation: boolean): NavigatedData {
		return {
			eventName: eventName,
			object: this,
			context: this.navigationContext,
			isBackNavigation: isBackNavigation,
		};
	}

	@profile
	public onNavigatingTo(context: any, isBackNavigation: boolean, bindingContext?: any) {
		this._navigationContext = context;

		if (isBackNavigation && this._styleScope) {
			this._styleScope.ensureSelectors();
			if (!this._cssState.isSelectorsLatestVersionApplied()) {
				this._onCssStateChange();
			}
		}

		//https://github.com/NativeScript/NativeScript/issues/731
		if (!isBackNavigation && bindingContext !== undefined && bindingContext !== null) {
			this.bindingContext = bindingContext;
		}
		this.notify(this.createNavigatedData(PageBase.navigatingToEvent, isBackNavigation));
	}

	@profile
	public onNavigatedTo(isBackNavigation: boolean): void {
		this.notify(this.createNavigatedData(PageBase.navigatedToEvent, isBackNavigation));

		if (this.accessibilityAnnouncePageEnabled) {
			this.accessibilityScreenChanged(!!isBackNavigation);
		}
	}

	@profile
	public onNavigatingFrom(isBackNavigation: boolean) {
		this.notify(this.createNavigatedData(PageBase.navigatingFromEvent, isBackNavigation));
	}

	@profile
	public onNavigatedFrom(isBackNavigation: boolean) {
		this.notify(this.createNavigatedData(PageBase.navigatedFromEvent, isBackNavigation));

		this._navigationContext = undefined;
	}

	public eachChildView(callback: (child: View) => boolean) {
		super.eachChildView(callback);
		if (this.hasActionBar) {
			callback(this.actionBar);
		}
	}

	get _childrenCount(): number {
		return (this.content ? 1 : 0) + (this._actionBar ? 1 : 0);
	}

	public accessibilityScreenChanged(refocus?: boolean): void {
		return;
	}
}

PageBase.prototype.recycleNativeView = 'never';

export interface PageBase {
	on(eventNames: string, callback: (data: EventData) => void, thisArg?: any): void;
	on(event: 'navigatingTo', callback: (args: NavigatedData) => void, thisArg?: any): void;
	on(event: 'navigatedTo', callback: (args: NavigatedData) => void, thisArg?: any): void;
	on(event: 'navigatingFrom', callback: (args: NavigatedData) => void, thisArg?: any): void;
	on(event: 'navigatedFrom', callback: (args: NavigatedData) => void, thisArg?: any): void;
	on(event: 'showingModally', callback: (args: ShownModallyData) => void, thisArg?: any): void;
	on(event: 'shownModally', callback: (args: ShownModallyData) => void, thisArg?: any): void;
}

/**
 * Dependency property used to hide the Navigation Bar in iOS and the Action Bar in Android.
 */
export const actionBarHiddenProperty = new Property<PageBase, boolean>({
	name: 'actionBarHidden',
	affectsLayout: __APPLE__,
	valueConverter: booleanConverter,
});
actionBarHiddenProperty.register(PageBase);

/**
 * Dependency property that specify if page background should span under status bar.
 */
export const backgroundSpanUnderStatusBarProperty = new Property<PageBase, boolean>({
	name: 'backgroundSpanUnderStatusBar',
	defaultValue: false,
	affectsLayout: __APPLE__,
	valueConverter: booleanConverter,
});
backgroundSpanUnderStatusBarProperty.register(PageBase);

/**
 * Dependency property used to control if swipe back navigation in iOS is enabled.
 * This property is iOS specific. Default value: true
 */
export const enableSwipeBackNavigationProperty = new Property<PageBase, boolean>({
	name: 'enableSwipeBackNavigation',
	defaultValue: true,
	valueConverter: booleanConverter,
});
enableSwipeBackNavigationProperty.register(PageBase);

/**
 * Property backing androidStatusBarBackground.
 */
export const androidStatusBarBackgroundProperty = new CssProperty<Style, Color>({
	name: 'androidStatusBarBackground',
	cssName: 'android-status-bar-background',
	equalityComparer: Color.equals,
	valueConverter: (v) => new Color(v),
});
androidStatusBarBackgroundProperty.register(Style);
