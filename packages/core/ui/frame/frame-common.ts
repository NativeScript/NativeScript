import type { BackstackEntry, NavigationContext, NavigationEntry, NavigationTransition } from './frame-interfaces';
import { NavigationType } from './frame-interfaces';
import { Page } from '../page';
import { View, CustomLayoutView, CSSType } from '../core/view';
import { Property } from '../core/properties';
import { Trace } from '../../trace';
import { frameStack, topmost as frameStackTopmost, _pushInFrameStack, _popFromFrameStack, _removeFromFrameStack } from './frame-stack';
import { viewMatchesModuleContext } from '../core/view/view-common';
import { getAncestor } from '../core/view-base';
import { Builder } from '../builder';
import { sanitizeModuleName } from '../builder/module-name-sanitizer';
import { profile } from '../../profiling';

export { NavigationType } from './frame-interfaces';
export type { AndroidActivityCallbacks, AndroidFragmentCallbacks, AndroidFrame, BackstackEntry, NavigationContext, NavigationEntry, NavigationTransition, TransitionState, ViewEntry, iOSFrame } from './frame-interfaces';

function buildEntryFromArgs(arg: any): NavigationEntry {
	let entry: NavigationEntry;
	if (typeof arg === 'string') {
		entry = {
			moduleName: arg,
		};
	} else if (typeof arg === 'function') {
		entry = {
			create: arg,
		};
	} else {
		entry = arg;
	}

	return entry;
}

@CSSType('Frame')
export class FrameBase extends CustomLayoutView {
	public static androidOptionSelectedEvent = 'optionSelected';

	private _animated: boolean;
	private _transition: NavigationTransition;
	private _backStack = new Array<BackstackEntry>();
	private _navigationQueue = new Array<NavigationContext>();

	public actionBarVisibility: 'auto' | 'never' | 'always';
	public _currentEntry: BackstackEntry;
	public _animationInProgress = false;
	public _executingContext: NavigationContext;
	public _isInFrameStack = false;
	public static defaultAnimatedNavigation = true;
	public static defaultTransition: NavigationTransition;

	static getFrameById(id: string): FrameBase {
		return frameStack.find((frame) => frame.id && frame.id === id);
	}

	static topmost(): FrameBase {
		return frameStackTopmost();
	}

	static goBack(): boolean {
		const top = FrameBase.topmost();
		if (top && top.canGoBack()) {
			top.goBack();

			return true;
		} else if (top) {
			let parentFrameCanGoBack = false;
			let parentFrame = <FrameBase>getAncestor(top, 'Frame');

			while (parentFrame && !parentFrameCanGoBack) {
				if (parentFrame && parentFrame.canGoBack()) {
					parentFrameCanGoBack = true;
				} else {
					parentFrame = <FrameBase>getAncestor(parentFrame, 'Frame');
				}
			}

			if (parentFrame && parentFrameCanGoBack) {
				parentFrame.goBack();

				return true;
			}
		}

		if (frameStack.length > 1) {
			top._popFromFrameStack();
		}

		return false;
	}

	/**
	 * @private
	 */
	static reloadPage(): void {
		// Implemented in plat-specific file - only for android.
	}

	/**
	 * @private
	 */
	static _stack(): Array<FrameBase> {
		return frameStack;
	}

	// TODO: Currently our navigation will not be synchronized in case users directly call native navigation methods like Activity.startActivity.
	public _addChildFromBuilder(name: string, value: any) {
		throw new Error(`Frame should not have a view. Use 'defaultPage' property instead.`);
	}

	@profile
	public onLoaded() {
		super.onLoaded();

		this._processNextNavigationEntry();
	}

	public canGoBack(): boolean {
		let backstack = this._backStack.length;
		let previousForwardNotInBackstack = false;
		this._navigationQueue.forEach((item) => {
			const entry = item.entry;
			const isBackNavigation = item.navigationType === NavigationType.back;
			if (isBackNavigation) {
				previousForwardNotInBackstack = false;
				if (!entry) {
					backstack--;
				} else {
					const backstackIndex = this._backStack.indexOf(entry);
					if (backstackIndex !== -1) {
						backstack = backstackIndex;
					} else {
						// NOTE: We don't search for entries in navigationQueue because there is no way for
						// developer to get reference to BackstackEntry unless transition is completed.
						// At that point the entry is put in the backstack array.
						// If we start to return Backstack entry from navigate method then
						// here we should check also navigationQueue as well.
						backstack--;
					}
				}
			} else if (entry.entry.clearHistory) {
				previousForwardNotInBackstack = false;
				backstack = 0;
			} else {
				backstack++;
				if (previousForwardNotInBackstack) {
					backstack--;
				}

				previousForwardNotInBackstack = entry.entry.backstackVisible === false;
			}
		});

		// this is our first navigation which is not completed yet.
		if (this._navigationQueue.length > 0 && !this._currentEntry) {
			backstack--;
		}

		return backstack > 0;
	}

	/**
	 * Navigates to the previous entry (if any) in the back stack.
	 * @param to The backstack entry to navigate back to.
	 */
	public goBack(backstackEntry?: BackstackEntry): void {
		if (Trace.isEnabled()) {
			Trace.write(`GO BACK`, Trace.categories.Navigation);
		}

		if (!this.canGoBack()) {
			return;
		}

		if (backstackEntry) {
			const index = this._backStack.indexOf(backstackEntry);
			if (index < 0) {
				return;
			}
		}

		const navigationContext: NavigationContext = {
			entry: backstackEntry,
			isBackNavigation: true,
			navigationType: NavigationType.back,
		};

		this._navigationQueue.push(navigationContext);
		this._processNextNavigationEntry();
	}

	public _removeEntry(removed: BackstackEntry): void {
		const page = removed.resolvedPage;
		const frame = page.frame;
		page._frame = null;
		if (frame) {
			frame._removeView(page);
		} else {
			page._tearDownUI(true);
		}

		removed.resolvedPage = null;
	}

	public navigate(param: any) {
		if (Trace.isEnabled()) {
			Trace.write(`NAVIGATE`, Trace.categories.Navigation);
		}

		this._pushInFrameStack();

		const entry = buildEntryFromArgs(param);
		const page = Builder.createViewFromEntry(entry) as Page;

		const backstackEntry: BackstackEntry = {
			entry: entry,
			resolvedPage: page,
			navDepth: undefined,
			fragmentTag: undefined,
		};

		const navigationContext: NavigationContext = {
			entry: backstackEntry,
			isBackNavigation: false,
			navigationType: NavigationType.forward,
		};

		this._navigationQueue.push(navigationContext);
		this._processNextNavigationEntry();
	}

	public isCurrent(entry: BackstackEntry): boolean {
		return this._currentEntry === entry;
	}

	public setCurrent(entry: BackstackEntry, navigationType: NavigationType): void {
		const newPage = entry.resolvedPage;
		// In case we navigated forward to a page that was in the backstack
		// with clearHistory: true
		if (!newPage.frame) {
			this._addView(newPage);
			newPage._frame = this;
		}

		this._currentEntry = entry;

		const isBack = navigationType === NavigationType.back;
		if (isBack) {
			this._pushInFrameStack();
		}

		newPage.onNavigatedTo(isBack);

		// Reset executing context after NavigatedTo is raised;
		// we do not want to execute two navigations in parallel in case
		// additional navigation is triggered from the NavigatedTo handler.
		this._executingContext = null;
	}

	public _updateBackstack(entry: BackstackEntry, navigationType: NavigationType): void {
		const isBack = navigationType === NavigationType.back;
		const isReplace = navigationType === NavigationType.replace;
		this.raiseCurrentPageNavigatedEvents(isBack);
		const current = this._currentEntry;

		// Do nothing for Hot Module Replacement
		if (isBack) {
			const index = this._backStack.indexOf(entry);
			this._backStack.splice(index + 1).forEach((e) => this._removeEntry(e));
			this._backStack.pop();
		} else if (!isReplace) {
			if (entry.entry.clearHistory) {
				this._backStack.forEach((e) => this._removeEntry(e));
				this._backStack.length = 0;
			} else if (FrameBase._isEntryBackstackVisible(current)) {
				this._backStack.push(current);
			}
		}

		if (current && this._backStack.indexOf(current) < 0) {
			this._removeEntry(current);
		}
	}

	private isNestedWithin(parentFrameCandidate: FrameBase): boolean {
		let frameAncestor: FrameBase = this;
		while (frameAncestor) {
			frameAncestor = <FrameBase>getAncestor(frameAncestor, FrameBase);
			if (frameAncestor === parentFrameCandidate) {
				return true;
			}
		}

		return false;
	}

	private raiseCurrentPageNavigatedEvents(isBack: boolean) {
		const page = this.currentPage;
		if (page) {
			if (page.isLoaded) {
				// Forward navigation does not remove page from frame so we raise unloaded manually.
				page.callUnloaded();
			}
			page.onNavigatedFrom(isBack);
		}
	}

	public _processNavigationQueue(page: Page) {
		if (this._navigationQueue.length === 0) {
			// This could happen when showing recreated page after activity has been destroyed.
			return;
		}

		const entry = this._navigationQueue[0].entry;
		const currentNavigationPage = entry.resolvedPage;
		if (page !== currentNavigationPage) {
			// If the page is not the one that requested navigation - skip it.
			return;
		}

		// remove completed operation.
		this._navigationQueue.shift();
		this._processNextNavigationEntry();
		this._updateActionBar();
	}

	public _findEntryForTag(fragmentTag: string): BackstackEntry {
		let entry: BackstackEntry;
		if (this._currentEntry && this._currentEntry.fragmentTag === fragmentTag) {
			entry = this._currentEntry;
		} else {
			entry = this._backStack.find((value) => value.fragmentTag === fragmentTag);
			// on API 26 fragments are recreated lazily after activity is destroyed.
			if (!entry) {
				const navigationItem = this._navigationQueue.find((value) => value.entry.fragmentTag === fragmentTag);
				entry = navigationItem ? navigationItem.entry : undefined;
			}
		}

		return entry;
	}

	public navigationQueueIsEmpty(): boolean {
		return this._navigationQueue.length === 0;
	}

	public static _isEntryBackstackVisible(entry: BackstackEntry): boolean {
		if (!entry) {
			return false;
		}

		const backstackVisibleValue = entry.entry.backstackVisible;
		const backstackHidden = backstackVisibleValue !== undefined && !backstackVisibleValue;

		return !backstackHidden;
	}

	public _updateActionBar(page?: Page, disableNavBarAnimation?: boolean) {
		//Trace.write("calling _updateActionBar on Frame", Trace.categories.Navigation);
	}

	protected _processNextNavigationEntry() {
		if (!this.isLoaded || this._executingContext) {
			return;
		}

		if (this._navigationQueue.length > 0) {
			const navigationContext = this._navigationQueue[0];
			const isBackNavigation = navigationContext.navigationType === NavigationType.back;
			if (isBackNavigation) {
				this.performGoBack(navigationContext);
			} else {
				this.performNavigation(navigationContext);
			}
		}
	}

	@profile
	public performNavigation(navigationContext: NavigationContext) {
		this._executingContext = navigationContext;

		const backstackEntry = navigationContext.entry;
		const isBackNavigation = navigationContext.navigationType === NavigationType.back;
		this._onNavigatingTo(backstackEntry, isBackNavigation);
		this._navigateCore(backstackEntry);
	}

	@profile
	private performGoBack(navigationContext: NavigationContext) {
		let backstackEntry = navigationContext.entry;
		const backstack = this._backStack;
		if (!backstackEntry) {
			backstackEntry = backstack[backstack.length - 1];
			navigationContext.entry = backstackEntry;
		}

		this._executingContext = navigationContext;
		this._onNavigatingTo(backstackEntry, true);
		this._goBackCore(backstackEntry);
	}

	public _goBackCore(backstackEntry: BackstackEntry) {
		if (Trace.isEnabled()) {
			Trace.write(`GO BACK CORE(${this._backstackEntryTrace(backstackEntry)}); currentPage: ${this.currentPage}`, Trace.categories.Navigation);
		}
	}

	public _navigateCore(backstackEntry: BackstackEntry) {
		if (Trace.isEnabled()) {
			Trace.write(`NAVIGATE CORE(${this._backstackEntryTrace(backstackEntry)}); currentPage: ${this.currentPage}`, Trace.categories.Navigation);
		}
	}

	public _onNavigatingTo(backstackEntry: BackstackEntry, isBack: boolean) {
		if (this.currentPage) {
			this.currentPage.onNavigatingFrom(isBack);
		}

		backstackEntry.resolvedPage.onNavigatingTo(backstackEntry.entry.context, isBack, backstackEntry.entry.bindingContext);
	}

	public get animated(): boolean {
		return this._animated;
	}

	public set animated(value: boolean) {
		this._animated = value;
	}

	public get transition(): NavigationTransition {
		return this._transition;
	}

	public set transition(value: NavigationTransition) {
		this._transition = value;
	}

	get backStack(): Array<BackstackEntry> {
		return this._backStack.slice();
	}

	get currentPage(): Page {
		if (this._currentEntry) {
			return this._currentEntry.resolvedPage;
		}

		return null;
	}

	get currentEntry(): NavigationEntry {
		if (this._currentEntry) {
			return this._currentEntry.entry;
		}

		return null;
	}

	public _pushInFrameStackRecursive() {
		this._pushInFrameStack();

		// make sure nested frames order is kept intact i.e. the nested one should always be on top;
		// see https://github.com/NativeScript/nativescript-angular/issues/1596 for more information
		const framesToPush = [];
		for (const frame of frameStack) {
			if (frame.isNestedWithin(this)) {
				framesToPush.push(frame);
			}
		}

		for (const frame of framesToPush) {
			frame._pushInFrameStack();
		}
	}

	public _pushInFrameStack() {
		_pushInFrameStack(this);
	}

	public _popFromFrameStack() {
		_popFromFrameStack(this);
	}

	public _removeFromFrameStack() {
		_removeFromFrameStack(this);
	}

	public _dialogClosed(): void {
		// No super call as we do not support nested frames to clean up
		this._removeFromFrameStack();
	}

	public _onRootViewReset(): void {
		super._onRootViewReset();
		this._removeFromFrameStack();
	}

	get _childrenCount(): number {
		if (this.currentPage) {
			return 1;
		}

		return 0;
	}

	public eachChildView(callback: (child: View) => boolean) {
		const page = this.currentPage;
		if (page) {
			callback(page);
		}
	}

	public _getIsAnimatedNavigation(entry: NavigationEntry): boolean {
		if (entry && entry.animated !== undefined) {
			return entry.animated;
		}

		if (this.animated !== undefined) {
			return this.animated;
		}

		return FrameBase.defaultAnimatedNavigation;
	}

	public _getNavigationTransition(entry: NavigationEntry): NavigationTransition {
		if (entry) {
			if (global.isIOS && entry.transitioniOS !== undefined) {
				return entry.transitioniOS;
			}

			if (global.isAndroid && entry.transitionAndroid !== undefined) {
				return entry.transitionAndroid;
			}

			if (entry.transition !== undefined) {
				return entry.transition;
			}
		}

		if (this.transition !== undefined) {
			return this.transition;
		}

		return FrameBase.defaultTransition;
	}

	public get navigationBarHeight(): number {
		return 0;
	}

	public _getNavBarVisible(page: Page): boolean {
		throw new Error();
	}

	// We don't need to put Page as visual child. Don't call super.
	public _addViewToNativeVisualTree(child: View): boolean {
		return true;
	}

	// We don't need to put Page as visual child. Don't call super.
	public _removeViewFromNativeVisualTree(child: View): void {
		child._isAddedToNativeVisualTree = false;
	}

	public _printFrameBackStack() {
		const length = this.backStack.length;
		let i = length - 1;
		console.log(`Frame Back Stack: `);
		while (i >= 0) {
			let backstackEntry = <BackstackEntry>this.backStack[i--];
			console.log(`\t${backstackEntry.resolvedPage}`);
		}
	}

	public _backstackEntryTrace(b: BackstackEntry): string {
		let result = `${b.resolvedPage}`;

		const backstackVisible = FrameBase._isEntryBackstackVisible(b);
		if (!backstackVisible) {
			result += ` | INVISIBLE`;
		}

		if (b.entry.clearHistory) {
			result += ` | CLEAR HISTORY`;
		}

		const animated = this._getIsAnimatedNavigation(b.entry);
		if (!animated) {
			result += ` | NOT ANIMATED`;
		}

		const t = this._getNavigationTransition(b.entry);
		if (t) {
			result += ` | Transition[${JSON.stringify(t)}]`;
		}

		return result;
	}

	public _onLivesync(context?: ModuleContext): boolean {
		if (super._onLivesync(context)) {
			return true;
		}

		// Fallback
		if (!context) {
			return this.legacyLivesync();
		}

		return false;
	}

	public _handleLivesync(context?: ModuleContext): boolean {
		if (super._handleLivesync(context)) {
			return true;
		}

		// Handle markup/script changes in currentPage
		if (this.currentPage && viewMatchesModuleContext(this.currentPage, context, ['markup', 'script'])) {
			Trace.write(`Change Handled: Replacing page ${context.path}`, Trace.categories.Livesync);

			this.replacePage(context.path);

			return true;
		}

		return false;
	}

	private legacyLivesync(): boolean {
		// Reset activity/window content when:
		// + Changes are not handled on View
		// + There is no ModuleContext
		if (Trace.isEnabled()) {
			Trace.write(`${this}._onLivesync()`, Trace.categories.Livesync);
		}

		if (!this._currentEntry || !this._currentEntry.entry) {
			return false;
		}

		const currentEntry = this._currentEntry.entry;
		const newEntry: NavigationEntry = {
			animated: false,
			clearHistory: true,
			context: currentEntry.context,
			create: currentEntry.create,
			moduleName: currentEntry.moduleName,
			backstackVisible: currentEntry.backstackVisible,
		};

		// If create returns the same page instance we can't recreate it.
		// Instead of navigation set activity content.
		// This could happen if current page was set in XML as a Page instance.
		if (newEntry.create) {
			const page = newEntry.create();
			if (page === this.currentPage) {
				return false;
			}
		}

		this.navigate(newEntry);

		return true;
	}

	protected replacePage(pagePath: string): void {
		const currentBackstackEntry = this._currentEntry;
		const contextModuleName = sanitizeModuleName(pagePath);

		const newPage = <Page>Builder.createViewFromEntry({ moduleName: contextModuleName });
		const newBackstackEntry: BackstackEntry = {
			entry: currentBackstackEntry.entry,
			resolvedPage: newPage,
			navDepth: currentBackstackEntry.navDepth,
			fragmentTag: currentBackstackEntry.fragmentTag,
			frameId: currentBackstackEntry.frameId,
		};

		const navigationContext: NavigationContext = {
			entry: newBackstackEntry,
			isBackNavigation: false,
			navigationType: NavigationType.replace,
		};

		this._navigationQueue.push(navigationContext);
		this._processNextNavigationEntry();
	}
}

export function getFrameById(id: string): FrameBase {
	console.log('getFrameById() is deprecated. Use Frame.getFrameById() instead.');

	return FrameBase.getFrameById(id);
}

export function topmost(): FrameBase {
	console.log('topmost() is deprecated. Use Frame.topmost() instead.');

	return FrameBase.topmost();
}

export function goBack(): boolean {
	console.log('goBack() is deprecated. Use Frame.goBack() instead.');

	return FrameBase.goBack();
}

export function _stack(): Array<FrameBase> {
	console.log('_stack() is deprecated. Use Frame._stack() instead.');

	return FrameBase._stack();
}

export const defaultPage = new Property<FrameBase, string>({
	name: 'defaultPage',
	valueChanged: (frame: FrameBase, oldValue: string, newValue: string) => {
		frame.navigate({ moduleName: newValue });
	},
});
defaultPage.register(FrameBase);

export const actionBarVisibilityProperty = new Property<FrameBase, 'auto' | 'never' | 'always'>({ name: 'actionBarVisibility', defaultValue: 'auto', affectsLayout: global.isIOS });
actionBarVisibilityProperty.register(FrameBase);
