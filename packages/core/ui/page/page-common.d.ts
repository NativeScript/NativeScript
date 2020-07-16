import { Page as PageDefinition } from '.';
import { ContentView } from '../content-view';
import { Frame } from '../frame';
import { KeyframeAnimationInfo } from '../animation';
import { NavigatedData } from '.';
import { Color } from '../../color';
import { ActionBar } from '../action-bar';
import { View } from '../core/view';
export declare class PageBase extends ContentView {
	static navigatingToEvent: string;
	static navigatedToEvent: string;
	static navigatingFromEvent: string;
	static navigatedFromEvent: string;
	_frame: Frame;
	actionBarHidden: boolean;
	enableSwipeBackNavigation: boolean;
	backgroundSpanUnderStatusBar: boolean;
	hasActionBar: boolean;
	readonly navigationContext: any;

	actionBar: ActionBar;

	statusBarStyle: 'light' | 'dark';
	androidStatusBarBackground: Color;

	readonly page: PageDefinition;

	_addChildFromBuilder(name: string, value: any): void;

	getKeyframeAnimationWithName(animationName: string): KeyframeAnimationInfo;

	readonly frame: Frame;

	createNavigatedData(eventName: string, isBackNavigation: boolean): NavigatedData;

	onNavigatingTo(context: any, isBackNavigation: boolean, bindingContext?: any): void;

	onNavigatedTo(isBackNavigation: boolean): void;

	onNavigatingFrom(isBackNavigation: boolean): void;

	onNavigatedFrom(isBackNavigation: boolean): void;

	eachChildView(callback: (child: View) => boolean): void;
}
