// Definitions.
import { AndroidActivityCallbacks, AndroidFrame as AndroidFrameDefinition, BackstackEntry, NavigationTransition } from '.';
import { Page } from '../page';
import { TransitionState } from './frame-common';

// Types.
import { Application } from '../../application';

import { Observable } from '../../data/observable';
import { Trace } from '../../trace';
import { View } from '../core/view';
import { _stack, FrameBase, NavigationType } from './frame-common';

import { _clearEntry, _clearFragment, _getAnimatedEntries, _getTransitionState, _restoreTransitionState, _reverseTransitions, _setAndroidFragmentTransitions, _updateTransitions, addNativeTransitionListener } from './fragment.transitions';

import { profile } from '../../profiling';
import { android as androidUtils } from '../../utils/native-helper';
import type { ExpandedEntry } from './fragment.transitions.android';
import { ensureFragmentClass, fragmentClass } from './fragment';
import { FragmentCallbacksImplementation } from './callbacks/fragment-callbacks';
import { ActivityCallbacksImplementation } from './callbacks/activity-callbacks';

export * from './frame-common';
export { setFragmentClass } from './fragment';

const INTENT_EXTRA = 'com.tns.activity';
const FRAMEID = '_frameId';
const CALLBACKS = '_callbacks';

const ownerSymbol = Symbol('_owner');

let navDepth = -1;
let fragmentId = -1;

export { moduleLoaded } from './callbacks/activity-callbacks';

export let attachStateChangeListener: android.view.View.OnAttachStateChangeListener;

function getAttachListener(): android.view.View.OnAttachStateChangeListener {
	if (!attachStateChangeListener) {
		/**
		 * NOTE: We cannot use NativeClass here because this is used in appComponents in webpack.config
		 * Whereby it bypasses the decorator transformation, hence pure es5 style written here
		 */
		const AttachListener = (<any>java.lang.Object).extend({
			interfaces: [android.view.View.OnAttachStateChangeListener],
			init() {
				// init must be defined at least
			},
			onViewAttachedToWindow(view: android.view.View): void {
				const owner: View = view[ownerSymbol];
				if (owner) {
					owner._onAttachedToWindow();
				}
			},
			onViewDetachedFromWindow(view: android.view.View): void {
				const owner: View = view[ownerSymbol];
				if (owner) {
					owner._onDetachedFromWindow();
				}
			},
		});

		attachStateChangeListener = new AttachListener();
	}

	return attachStateChangeListener;
}

export class Frame extends FrameBase {
	public _originalBackground: any;
	private _android: AndroidFrame;
	private _containerViewId = -1;
	private _tearDownPending = false;
	private _attachedToWindow = false;
	private _wasReset = false;
	private _cachedTransitionState: TransitionState;
	private _frameCreateTimeout: NodeJS.Timeout;

	constructor() {
		super();
		this._android = new AndroidFrame(this);
	}

	public static reloadPage(context?: ModuleContext): void {
		const activity = androidUtils.getCurrentActivity();
		const callbacks: AndroidActivityCallbacks = activity[CALLBACKS];
		if (callbacks) {
			const rootView: View = callbacks.getRootView();
			// Handle application root module
			const isAppRootModuleChanged = context && context.path && context.path.includes(Application.getMainEntry().moduleName) && context.type !== 'style';

			// Reset activity content when:
			// + Application root module is changed
			// + View did not handle the change
			// Note:
			// The case when neither app root module is changed, neighter livesync is handled on View,
			// then changes will not apply until navigate forward to the module.
			if (isAppRootModuleChanged || !rootView || !rootView._onLivesync(context)) {
				callbacks.resetActivityContent(activity);
			}
		} else {
			Trace.error(`${activity}[CALLBACKS] is null or undefined`);
		}
	}

	public static get defaultAnimatedNavigation(): boolean {
		return FrameBase.defaultAnimatedNavigation;
	}
	public static set defaultAnimatedNavigation(value: boolean) {
		FrameBase.defaultAnimatedNavigation = value;
	}

	public static get defaultTransition(): NavigationTransition {
		return FrameBase.defaultTransition;
	}
	public static set defaultTransition(value: NavigationTransition) {
		FrameBase.defaultTransition = value;
	}

	get containerViewId(): number {
		return this._containerViewId;
	}

	// @ts-ignore
	get android(): AndroidFrame {
		return this._android;
	}

	get _hasFragments(): boolean {
		return true;
	}

	_onAttachedToWindow(): void {
		super._onAttachedToWindow();

		// _onAttachedToWindow called from OS again after it was detach
		// still happens with androidx.fragment:1.3.2
		const activity = androidUtils.getCurrentActivity();
		const lifecycleState = activity?.getLifecycle?.()?.getCurrentState() || androidx.lifecycle.Lifecycle.State.CREATED;
		if ((this._manager && this._manager.isDestroyed()) || !lifecycleState.isAtLeast(androidx.lifecycle.Lifecycle.State.CREATED)) {
			return;
		}

		this._attachedToWindow = true;
		this._wasReset = false;
		this._processNextNavigationEntry();
	}

	_onDetachedFromWindow(): void {
		super._onDetachedFromWindow();
		this._attachedToWindow = false;
	}

	protected _processNextNavigationEntry(): void {
		// In case activity was destroyed because of back button pressed (e.g. app exit)
		// and application is restored from recent apps, current fragment isn't recreated.
		// In this case call _navigateCore in order to recreate the current fragment.
		// Don't call navigate because it will fire navigation events.
		// As JS instances are alive it is already done for the current page.
		if (!this.isLoaded || this._executingContext) {
			return;
		}

		// in case the activity is "reset" using resetRootView we must wait for
		// the attachedToWindow event to make the first navigation or it will crash
		// https://github.com/NativeScript/NativeScript/commit/9dd3e1a8076e5022e411f2f2eeba34aabc68d112
		// though we should not do it on app "start"
		// or it will create a "flash" to activity background color
		if (this._wasReset && !this._attachedToWindow) {
			return;
		}

		const animatedEntries = _getAnimatedEntries(this._android.frameId);
		if (animatedEntries) {
			// Wait until animations are completed.
			if (animatedEntries.size > 0) {
				return;
			}
		}

		const manager = this._getFragmentManager();
		const entry = this._currentEntry;
		const isNewEntry = !this._cachedTransitionState || entry !== this._cachedTransitionState.entry;

		if (isNewEntry && entry && manager && !manager.findFragmentByTag(entry.fragmentTag)) {
			// Simulate first navigation (e.g. no animations or transitions)
			// we need to cache the original animation settings so we can restore them later; otherwise as the
			// simulated first navigation is not animated (it is actually a zero duration animator) the "popExit" animation
			// is broken when transaction.setCustomAnimations(...) is used in a scenario with:
			// 1) forward navigation
			// 2) suspend / resume app
			// 3) back navigation -- the exiting fragment is erroneously animated with the exit animator from the
			// simulated navigation (NoTransition, zero duration animator) and thus the fragment immediately disappears;
			// the user only sees the animation of the entering fragment as per its specific enter animation settings.
			// NOTE: we are restoring the animation settings in Frame.setCurrent(...) as navigation completes asynchronously
			const cachedTransitionState = _getTransitionState(this._currentEntry);

			if (cachedTransitionState) {
				this._cachedTransitionState = cachedTransitionState;
				this._currentEntry = null;
				// NavigateCore will eventually call _processNextNavigationEntry again.
				this._navigateCore(entry);
				this._currentEntry = entry;
			} else {
				super._processNextNavigationEntry();
			}
		} else {
			super._processNextNavigationEntry();
		}
	}

	public _getChildFragmentManager() {
		let backstackEntry;
		if (this._executingContext && this._executingContext.entry) {
			backstackEntry = this._executingContext.entry;
		} else {
			backstackEntry = this._currentEntry;
		}

		if (backstackEntry && backstackEntry.fragment && backstackEntry.fragment.isAdded()) {
			return backstackEntry.fragment.getChildFragmentManager();
		}

		return null;
	}

	public _onRootViewReset(): void {
		super._onRootViewReset();
		// used to handle the "first" navigate differently on first run and on reset
		this._wasReset = true;
		// call this AFTER the super call to ensure descendants apply their rootview-reset logic first
		// i.e. in a scenario with nested frames / frame with tabview let the descendandt cleanup the inner
		// fragments first, and then cleanup the parent fragments
		this.disposeCurrentFragment();
	}

	onLoaded(): void {
		if (this._originalBackground) {
			this.backgroundColor = null;
			this.backgroundColor = this._originalBackground;
			this._originalBackground = null;
		}

		this._frameCreateTimeout = setTimeout(() => {
			// there's a bug with nested frames where sometimes the nested fragment is not recreated at all
			// so we manually check on loaded event if the fragment is not recreated and recreate it
			const currentEntry = this._currentEntry || this._executingContext?.entry;
			if (currentEntry) {
				if (!currentEntry.fragment) {
					const manager = this._getFragmentManager();
					const transaction = manager.beginTransaction();
					currentEntry.fragment = this.createFragment(currentEntry, currentEntry.fragmentTag);
					_updateTransitions(currentEntry);
					transaction.replace(this.containerViewId, currentEntry.fragment, currentEntry.fragmentTag);
					transaction.commitAllowingStateLoss();
				}
			}

			this._frameCreateTimeout = null;
		}, 0);

		super.onLoaded();
	}

	onUnloaded() {
		super.onUnloaded();

		if (typeof this._frameCreateTimeout === 'number') {
			clearTimeout(this._frameCreateTimeout);
			this._frameCreateTimeout = null;
		}
	}

	private disposeCurrentFragment(): void {
		if (!this._currentEntry || !this._currentEntry.fragment || !this._currentEntry.fragment.isAdded()) {
			return;
		}
		const fragment: androidx.fragment.app.Fragment = this._currentEntry.fragment;
		const fragmentManager: androidx.fragment.app.FragmentManager = fragment.getFragmentManager();

		const transaction = fragmentManager.beginTransaction();
		const fragmentExitTransition = fragment.getExitTransition();

		// Reset animation to its initial state to prevent mirrored effect when restore current fragment transitions
		if (fragmentExitTransition && fragmentExitTransition instanceof org.nativescript.widgets.CustomTransition) {
			fragmentExitTransition.setResetOnTransitionEnd(true);
		}

		transaction.remove(fragment);
		transaction.commitNowAllowingStateLoss();
	}

	private createFragment(backstackEntry: BackstackEntry, fragmentTag: string): androidx.fragment.app.Fragment {
		ensureFragmentClass();
		const newFragment = new fragmentClass();
		const args = new android.os.Bundle();
		args.putInt(FRAMEID, this._android.frameId);
		newFragment.setArguments(args);
		setFragmentCallbacks(newFragment);

		const callbacks = newFragment[CALLBACKS];
		callbacks.frame = this;
		callbacks.entry = backstackEntry;

		// backstackEntry
		backstackEntry.fragment = newFragment;
		backstackEntry.fragmentTag = fragmentTag;
		backstackEntry.navDepth = navDepth;

		return newFragment;
	}

	public setCurrent(entry: BackstackEntry, navigationType: NavigationType): void {
		const current = this._currentEntry;
		const currentEntryChanged = current !== entry;
		if (currentEntryChanged) {
			this._updateBackstack(entry, navigationType);

			// If activity was destroyed we need to destroy fragment and UI
			// of current and new entries.
			if (this._tearDownPending) {
				this._tearDownPending = false;
				if (!entry.recreated) {
					this._disposeBackstackEntry(entry);
				}

				if (current && !current.recreated) {
					this._disposeBackstackEntry(current);
				}

				// If we have context activity was recreated. Create new fragment
				// and UI for the new current page.
				const context = this._context;
				if (context && !entry.recreated) {
					entry.fragment = this.createFragment(entry, entry.fragmentTag);
					entry.resolvedPage._setupUI(context);
				}

				entry.recreated = false;

				if (current) {
					current.recreated = false;
				}
			}

			super.setCurrent(entry, navigationType);

			// If we had real navigation process queue.
			this._processNavigationQueue(entry.resolvedPage);
		} else {
			// Otherwise currentPage was recreated so this wasn't real navigation.
			// Continue with next item in the queue.
			this._processNextNavigationEntry();
		}

		// restore cached animation settings if we just completed simulated first navigation (no animation)
		if (this._cachedTransitionState) {
			_restoreTransitionState(this._cachedTransitionState);
			this._cachedTransitionState = null;
		}

		// restore original fragment transitions if we just completed replace navigation (hmr)
		if (navigationType === NavigationType.replace) {
			_clearEntry(entry);

			const animated = this._getIsAnimatedNavigation(entry.entry);
			const navigationTransition = this._getNavigationTransition(entry.entry);
			const currentEntry = null;
			const newEntry = entry;
			const transaction = null;
			_setAndroidFragmentTransitions(animated, navigationTransition, currentEntry, newEntry, this._android.frameId, transaction);
		}
	}

	public onBackPressed(): boolean {
		if (this.canGoBack()) {
			this.goBack();

			return true;
		}

		if (!this.navigationQueueIsEmpty()) {
			const manager = this._getFragmentManager();
			if (manager) {
				manager.executePendingTransactions();

				return true;
			}
		}

		return false;
	}

	// HACK: This @profile decorator creates a circular dependency
	// HACK: because the function parameter type is evaluated with 'typeof'
	@profile
	public _navigateCore(newEntry: BackstackEntry) {
		// should be (newEntry: BackstackEntry)
		super._navigateCore(newEntry);

		// set frameId here so that we could use it in fragment.transitions
		newEntry.frameId = this._android.frameId;

		const activity = this._android.activity;
		if (!activity) {
			// Activity not associated. In this case we have two execution paths:
			// 1. This is the main frame for the application
			// 2. This is an inner frame which requires a new Activity
			const currentActivity = this._android.currentActivity;
			if (currentActivity) {
				startActivity(currentActivity, this._android.frameId);
			}

			return;
		}

		const manager: androidx.fragment.app.FragmentManager = this._getFragmentManager();
		const clearHistory = newEntry.entry.clearHistory;
		const currentEntry = this._currentEntry;

		// New Fragment
		if (clearHistory) {
			navDepth = -1;
		}

		const isReplace = this._executingContext && this._executingContext.navigationType === NavigationType.replace;
		if (!isReplace) {
			navDepth++;
		}

		fragmentId++;
		const newFragmentTag = `fragment${fragmentId}[${navDepth}]`;
		const newFragment = this.createFragment(newEntry, newFragmentTag);
		const transaction = manager.beginTransaction();
		const animated = currentEntry ? this._getIsAnimatedNavigation(newEntry.entry) : false;
		// NOTE: Don't use transition for the initial navigation (same as on iOS)
		// On API 21+ transition won't be triggered unless there was at least one
		// layout pass so we will wait forever for transitionCompleted handler...
		// https://github.com/NativeScript/NativeScript/issues/4895
		let navigationTransition: NavigationTransition;
		if (this._currentEntry) {
			navigationTransition = this._getNavigationTransition(newEntry.entry);
		} else {
			navigationTransition = null;
		}

		const isNestedDefaultTransition = !currentEntry;

		_setAndroidFragmentTransitions(animated, navigationTransition, currentEntry, newEntry, this._android.frameId, transaction, isNestedDefaultTransition);

		if (currentEntry && animated && !navigationTransition) {
			//TODO: Check whether or not this is still necessary. For Modal views?
			// transaction.setTransition(androidx.fragment.app.FragmentTransaction.TRANSIT_FRAGMENT_OPEN);
		}

		transaction.replace(this.containerViewId, newFragment, newFragmentTag);

		navigationTransition?.instance?.androidFragmentTransactionCallback?.(transaction, currentEntry, newEntry);

		transaction.commitAllowingStateLoss();
	}

	public _goBackCore(backstackEntry: BackstackEntry & ExpandedEntry) {
		super._goBackCore(backstackEntry);
		navDepth = backstackEntry.navDepth;

		const manager: androidx.fragment.app.FragmentManager = this._getFragmentManager();
		const transaction = manager.beginTransaction();

		if (!backstackEntry.fragment) {
			// Happens on newer API levels. On older all fragments
			// are recreated once activity is created.
			// This entry fragment was destroyed by app suspend.
			// We need to recreate its animations and then reverse it.
			backstackEntry.fragment = this.createFragment(backstackEntry, backstackEntry.fragmentTag);
			_updateTransitions(backstackEntry);
		}

		_reverseTransitions(backstackEntry, this._currentEntry);

		transaction.replace(this.containerViewId, backstackEntry.fragment, backstackEntry.fragmentTag);

		backstackEntry.transition?.androidFragmentTransactionCallback?.(transaction, this._currentEntry, backstackEntry);

		transaction.commitAllowingStateLoss();
	}

	public _removeEntry(removed: BackstackEntry): void {
		super._removeEntry(removed);

		if (removed.fragment) {
			_clearEntry(removed);
		}

		removed.fragment = null;
		removed.viewSavedState = null;
	}

	protected _disposeBackstackEntry(entry: BackstackEntry): void {
		if (entry.fragment) {
			_clearFragment(entry);
		}

		entry.recreated = false;
		entry.fragment = null;

		super._disposeBackstackEntry(entry);
	}

	public createNativeView() {
		// Create native view with available _currentEntry occur in Don't Keep Activities
		// scenario when Activity is recreated on app suspend/resume. Push frame back in frame stack
		// since it was removed in disposeNativeView() method.
		if (this._currentEntry) {
			this._pushInFrameStack();
		}

		return new org.nativescript.widgets.ContentLayout(this._context);
	}

	public initNativeView(): void {
		super.initNativeView();
		const listener = getAttachListener();
		this.nativeViewProtected.addOnAttachStateChangeListener(listener);
		this.nativeViewProtected[ownerSymbol] = this;
		this._android.rootViewGroup = this.nativeViewProtected;
		if (this._containerViewId < 0) {
			this._containerViewId = android.view.View.generateViewId();
		}
		this._android.rootViewGroup.setId(this._containerViewId);
	}

	public disposeNativeView() {
		const listener = getAttachListener();

		this.nativeViewProtected.removeOnAttachStateChangeListener(listener);
		this.nativeViewProtected[ownerSymbol] = null;
		this._tearDownPending = !!this._executingContext;

		const current = this._currentEntry;
		const executingEntry = this._executingContext ? this._executingContext.entry : null;

		this.backStack.forEach((entry) => {
			// Don't destroy current and executing entries or UI will look blank.
			// We will do it in setCurrent.
			if (entry !== executingEntry) {
				this._disposeBackstackEntry(entry);
			}
		});

		if (current && !executingEntry) {
			this._disposeBackstackEntry(current);
		}

		// Dispose cached transition and store it again if view ever gets re-used
		this._cachedTransitionState = null;

		this._android.rootViewGroup = null;
		this._removeFromFrameStack();
		super.disposeNativeView();
	}

	public _popFromFrameStack() {
		if (!this._isInFrameStack) {
			return;
		}

		super._popFromFrameStack();
	}

	public _getNavBarVisible(page: Page): boolean {
		switch (this.actionBarVisibility) {
			case 'never':
				return false;

			case 'always':
				return true;

			default:
				if (page.actionBarHidden !== undefined) {
					return !page.actionBarHidden;
				}

				if (this._android && this._android.showActionBar !== undefined) {
					return this._android.showActionBar;
				}

				return true;
		}
	}

	public _saveFragmentsState(): void {
		// We save only fragments in backstack.
		// Current fragment is saved by FragmentManager.
		this.backStack.forEach((entry) => {
			const view: android.view.View = entry.resolvedPage.nativeViewProtected;
			if (!entry.viewSavedState && view) {
				const viewState = new android.util.SparseArray<android.os.Parcelable>();
				view.saveHierarchyState(viewState);
				entry.viewSavedState = viewState;
			}
		});
	}
}

export function reloadPage(context?: ModuleContext): void {
	console.warn('reloadPage() is deprecated. Use Frame.reloadPage() instead.');

	return Frame.reloadPage(context);
}

// attach on global, so it can be overwritten in NativeScript Angular
global.__onLiveSyncCore = Frame.reloadPage;

let framesCounter = 0;
const framesCache = new Array<WeakRef<AndroidFrame>>();

class AndroidFrame extends Observable implements AndroidFrameDefinition {
	public rootViewGroup: android.view.ViewGroup;
	public frameId;

	private _showActionBar = true;
	private _owner: Frame;

	constructor(owner: Frame) {
		super();
		this._owner = owner;
		this.frameId = framesCounter++;
		framesCache.push(new WeakRef(this));
	}

	public get showActionBar(): boolean {
		return this._showActionBar;
	}

	public set showActionBar(value: boolean) {
		if (this._showActionBar !== value) {
			this._showActionBar = value;
			if (this.owner.currentPage) {
				this.owner.currentPage.actionBar.update();
			}
		}
	}

	public get activity(): androidx.appcompat.app.AppCompatActivity {
		const activity: androidx.appcompat.app.AppCompatActivity = this.owner._context;
		if (activity) {
			return activity;
		}

		// traverse the parent chain for an ancestor Frame
		let currView = this._owner.parent;
		while (currView) {
			if (currView instanceof Frame) {
				return (<Frame>currView).android.activity;
			}

			currView = currView.parent;
		}

		return undefined;
	}

	public get actionBar(): android.app.ActionBar {
		const activity = this.currentActivity;
		if (!activity) {
			return undefined;
		}

		const bar = activity.getActionBar();
		if (!bar) {
			return undefined;
		}

		return bar;
	}

	public get currentActivity(): androidx.appcompat.app.AppCompatActivity {
		let activity = this.activity;
		if (activity) {
			return activity;
		}

		const frames = _stack();
		for (let length = frames.length, i = length - 1; i >= 0; i--) {
			activity = frames[i].android.activity;
			if (activity) {
				return activity;
			}
		}

		return undefined;
	}

	public get owner(): Frame {
		return this._owner;
	}

	public canGoBack() {
		if (!this.activity) {
			return false;
		}

		// can go back only if it is not the main one.
		return this.activity.getIntent().getAction() !== android.content.Intent.ACTION_MAIN;
	}

	public fragmentForPage(entry: BackstackEntry): any {
		const tag = entry && entry.fragmentTag;
		if (tag) {
			return this.owner._getFragmentManager().findFragmentByTag(tag);
		}

		return undefined;
	}
}

function startActivity(activity: androidx.appcompat.app.AppCompatActivity, frameId: number) {
	// TODO: Implicitly, we will open the same activity type as the current one
	const intent = new android.content.Intent(activity, activity.getClass());
	intent.setAction(android.content.Intent.ACTION_DEFAULT);
	intent.putExtra(INTENT_EXTRA, frameId);

	// TODO: Put the navigation context (if any) in the intent
	activity.startActivity(intent);
}

export function getFrameByNumberId(frameId: number): Frame {
	// Find the frame for this activity.
	for (let i = 0; i < framesCache.length; i++) {
		const aliveFrame = framesCache[i].get();
		if (aliveFrame && aliveFrame.frameId === frameId) {
			return aliveFrame.owner;
		}
	}

	return null;
}

export function setActivityCallbacks(activity: androidx.appcompat.app.AppCompatActivity): void {
	activity[CALLBACKS] = new ActivityCallbacksImplementation();
}

export function setFragmentCallbacks(fragment: androidx.fragment.app.Fragment): void {
	fragment[CALLBACKS] = new FragmentCallbacksImplementation();
}
