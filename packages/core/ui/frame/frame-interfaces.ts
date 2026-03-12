import type { View } from '../core/view';
import type { Page } from '../page';
import type { Transition } from '../transition';
import type { Observable, EventData } from '../../data/observable';

export enum NavigationType {
	back,
	forward,
	replace,
}

export interface ViewEntry {
	moduleName?: string;
	create?: () => View;
}

export interface NavigationEntry extends ViewEntry {
	context?: any;
	bindingContext?: any;
	animated?: boolean;
	transition?: NavigationTransition;
	transitioniOS?: NavigationTransition;
	transitionAndroid?: NavigationTransition;
	backstackVisible?: boolean;
	clearHistory?: boolean;
}

export interface BackstackEntry {
	entry: NavigationEntry;
	resolvedPage: Page;
	navDepth: number;
	fragmentTag: string;
	fragment?: any;
	viewSavedState?: any;
	frameId?: number;
	recreated?: boolean;
}

export interface NavigationContext {
	entry?: BackstackEntry;
	/**
	 * @deprecated Use navigationType instead.
	 */
	isBackNavigation: boolean;
	navigationType: NavigationType;
}

export interface NavigationTransition {
	name?: string;
	instance?: Transition;
	duration?: number;
	curve?: any;
}

/**
 * Represents an entry in the back stack of a Frame object.
 */
export interface BackstackEntry {
	entry: NavigationEntry;
	resolvedPage: Page;

	//@private
	/**
	 * @private
	 */
	navDepth: number;
	/**
	 * @private
	 */
	fragmentTag: string;
	/**
	 * @private
	 */
	fragment?: any;
	/**
	 * @private
	 */
	viewSavedState?: any;
	/**
	 * @private
	 */
	frameId?: number;
	/**
	 * @private
	 */
	recreated?: boolean;
	//@endprivate
}

export interface NavigationData extends EventData {
	entry?: BackstackEntry;
	fromEntry?: BackstackEntry;
	isBack?: boolean;
}

export interface TransitionState {
	enterTransitionListener: any;
	exitTransitionListener: any;
	reenterTransitionListener: any;
	returnTransitionListener: any;
	transitionName: string;
	entry: BackstackEntry;
}

export interface AndroidFrame extends Observable {
	rootViewGroup: any /* android.view.ViewGroup */;
	activity: any /* androidx.appcompat.app.AppCompatActivity */;
	currentActivity: any /* androidx.appcompat.app.AppCompatActivity */;
	actionBar: any /* android.app.ActionBar */;
	showActionBar: boolean;
	fragmentForPage(entry: BackstackEntry): any;
}

export interface AndroidActivityCallbacks {
	getRootView(): View;
	resetActivityContent(activity: any): void;

	onCreate(activity: any, savedInstanceState: any, intent: any, superFunc: Function): void;
	onSaveInstanceState(activity: any, outState: any, superFunc: Function): void;
	onStart(activity: any, superFunc: Function): void;
	onStop(activity: any, superFunc: Function): void;
	onPostResume(activity: any, superFunc: Function): void;
	onDestroy(activity: any, superFunc: Function): void;
	onBackPressed(activity: any, superFunc: Function): void;
	onRequestPermissionsResult(activity: any, requestCode: number, permissions: Array<string>, grantResults: Array<number>, superFunc: Function): void;
	onActivityResult(activity: any, requestCode: number, resultCode: number, data: any, superFunc: Function);
	onNewIntent(activity: any, intent: any, superSetIntentFunc: Function, superFunc: Function): void;
}

export interface AndroidFragmentCallbacks {
	onHiddenChanged(fragment: any, hidden: boolean, superFunc: Function): void;
	onCreateAnimator(fragment: any, transit: number, enter: boolean, nextAnim: number, superFunc: Function): any;
	onCreate(fragment: any, savedInstanceState: any, superFunc: Function): void;
	onCreateView(fragment: any, inflater: any, container: any, savedInstanceState: any, superFunc: Function): any;
	onSaveInstanceState(fragment: any, outState: any, superFunc: Function): void;
	onDestroyView(fragment: any, superFunc: Function): void;
	onDestroy(fragment: any, superFunc: Function): void;
	onPause(fragment: any, superFunc: Function): void;
	onStop(fragment: any, superFunc: Function): void;
	toStringOverride(fragment: any, superFunc: Function): string;
}

/* tslint:disable */
export interface iOSFrame {
	/* tslint:enable */
	controller: any /* UINavigationController */;
	navBarVisibility: 'auto' | 'never' | 'always';
	_disableNavBarAnimation: boolean;
}
