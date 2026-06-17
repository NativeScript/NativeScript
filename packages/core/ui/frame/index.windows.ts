import type { BackstackEntry } from './frame-common';
import { FrameBase, NavigationType } from './frame-common';
import { profile } from '../../profiling';
import type { Page } from '../page';
import { SharedTransition } from '../transition/shared-transition';
import { SharedTransitionHelper } from '../transition/shared-transition-helper';
import { ImageSource } from '../../image-source';
import { isFontIconURI } from '../../utils';
// @ts-ignore
import { getFontFamilyCached } from '../styling/font';

export * from './frame-common';

// GC guard: hold running Storyboards until Completed fires (an unheld local sb can be collected,
// dropping the Completed callback that restores the final transform/opacity).
const _activeTransitions = new Set<Microsoft.UI.Xaml.Media.Animation.Storyboard>();

export class Frame extends FrameBase {
	declare nativeViewProtected: Microsoft.UI.Xaml.Controls.Grid; // container
	// Single-cell Grid hosting the current page; Grid.Children.Append() avoids template/binding issues.
	private _pageHost: Microsoft.UI.Xaml.Controls.Grid;
	// Backward-compat alias so _navigateCore and _goBackCore work unchanged.
	private get _windows(): Microsoft.UI.Xaml.Controls.Grid { return this._pageHost; }
	// Plain Grid (not CommandBar) — CommandBar constrains its Content to the left side via its
	// template's ContentPresenter, preventing the title's Star column from actually filling the bar.
	private _topBar: Microsoft.UI.Xaml.Controls.Grid | null = null;
	private _backButton: Microsoft.UI.Xaml.Controls.Button | null = null;
	private _titleBlock: Microsoft.UI.Xaml.Controls.TextBlock | null = null;
	// Grid container for the title area. We swap its single child between _titleBlock (string
	// title) and the titleView's nativeViewProtected (custom View child of ActionBar).
	private _titleArea: Microsoft.UI.Xaml.Controls.Grid | null = null;
	// The native element currently shown in _titleArea (null when showing _titleBlock).
	private _titleViewNative: Microsoft.UI.Xaml.UIElement | null = null;
	// StackPanel in column 2 of _topBar; holds Button elements for ActionItems.
	private _actionArea: Microsoft.UI.Xaml.Controls.StackPanel | null = null;
	private _backButtonDelegate: any = null;
	// GC guard: delegates held only by btn.Click can be collected before the user taps.
	private _actionItemDelegates: any[] = [];
	// ActionBar `color` brush for the current page; applied to title, back button and action items.
	private _abFgBrush: Microsoft.UI.Xaml.Media.SolidColorBrush | null = null;
	// LRU native-view cache. Keeps the last N pages' XAML trees alive so navigating
	// back — or forward — to a previously-visited page skips the entire view-creation +
	// applyAllNativeSetters pipeline. This mirrors what iOS UINavigationController and
	// Android FragmentManager provide natively: visited pages stay in memory until evicted.
	// Map insertion order = arrival order; oldest entry is keys().next().value (LRU eviction).
	private _nativePageCache = new Map<string, any>(); // moduleName → Page
	private static readonly _PAGE_CACHE_LIMIT = 5;

	constructor() {
		super();
		this._pageHost = new Microsoft.UI.Xaml.Controls.Grid();
	}

	public createNativeView(): any {
		this._buildTopBar();
		return this._buildContainer();
	}

	private _buildTopBar(): void {
		// WinRT collection mutations can throw; on failure _topBar stays null.
		try {
			// Plain Grid instead of CommandBar: CommandBar's template ContentPresenter is left-aligned,
			// so setting Content = grid doesn't let the Star column expand to fill the bar width.
			// A bare Grid gives us full-width layout control directly.
			this._topBar = new Microsoft.UI.Xaml.Controls.Grid();
			this._topBar.HorizontalAlignment = 3; // Stretch
			this._topBar.Height = 48;

			const colBack = new Microsoft.UI.Xaml.Controls.ColumnDefinition();
			colBack.Width = Microsoft.UI.Xaml.GridLengthHelper.FromValueAndType(1, Microsoft.UI.Xaml.GridUnitType.Auto);
			const colTitle = new Microsoft.UI.Xaml.Controls.ColumnDefinition();
			colTitle.Width = Microsoft.UI.Xaml.GridLengthHelper.FromValueAndType(1, Microsoft.UI.Xaml.GridUnitType.Star);
			const colActions = new Microsoft.UI.Xaml.Controls.ColumnDefinition();
			colActions.Width = Microsoft.UI.Xaml.GridLengthHelper.FromValueAndType(1, Microsoft.UI.Xaml.GridUnitType.Auto);
			this._topBar.ColumnDefinitions.Append(colBack);
			this._topBar.ColumnDefinitions.Append(colTitle);
			this._topBar.ColumnDefinitions.Append(colActions);

			this._backButton = new Microsoft.UI.Xaml.Controls.Button();
			this._backButton.Content = '←';
			Microsoft.UI.Xaml.Controls.Grid.SetColumn(this._backButton, 0);
			this._topBar.Children.Append(this._backButton);

			this._titleBlock = new Microsoft.UI.Xaml.Controls.TextBlock();
			this._titleBlock.VerticalAlignment = 1; // Center

			this._titleArea = new Microsoft.UI.Xaml.Controls.Grid();
			this._titleArea.VerticalAlignment = 1; // Center
			this._titleArea.Children.Append(this._titleBlock);
			Microsoft.UI.Xaml.Controls.Grid.SetColumn(this._titleArea, 1);
			this._topBar.Children.Append(this._titleArea);

			this._actionArea = new Microsoft.UI.Xaml.Controls.StackPanel();
			this._actionArea.Orientation = Microsoft.UI.Xaml.Controls.Orientation.Horizontal;
			this._actionArea.VerticalAlignment = 1; // Center
			Microsoft.UI.Xaml.Controls.Grid.SetColumn(this._actionArea, 2);
			this._topBar.Children.Append(this._actionArea);

			this._topBar.Visibility = 1; // Collapsed
		} catch (_e) {
			this._topBar = null;
			this._titleArea = null;
			this._actionArea = null;
		}
	}

	private _buildContainer(): any {
		if (!this._topBar) {
			return this._pageHost;
		}

		// Two-row Grid: row 0 (Auto) for CommandBar, row 1 (*) for page content.
		// WinRT collection mutations can throw; on failure fall back to the bare page host.
		try {
			const outerGrid = new Microsoft.UI.Xaml.Controls.Grid();

			const autoRow = new Microsoft.UI.Xaml.Controls.RowDefinition();
			autoRow.Height = Microsoft.UI.Xaml.GridLengthHelper.FromValueAndType(1, Microsoft.UI.Xaml.GridUnitType.Auto);
			const starRow = new Microsoft.UI.Xaml.Controls.RowDefinition();
			starRow.Height = Microsoft.UI.Xaml.GridLengthHelper.FromValueAndType(1, Microsoft.UI.Xaml.GridUnitType.Star);
			outerGrid.RowDefinitions.Append(autoRow);
			outerGrid.RowDefinitions.Append(starRow);

			this._topBar.HorizontalAlignment = 3; // Stretch
			Microsoft.UI.Xaml.Controls.Grid.SetRow(this._topBar, 0);
			outerGrid.Children.Append(this._topBar);

			this._pageHost.HorizontalAlignment = 3; // Stretch
			Microsoft.UI.Xaml.Controls.Grid.SetRow(this._pageHost, 1);
			outerGrid.Children.Append(this._pageHost);

			return outerGrid;
		} catch (_e) {
			return this._pageHost;
		}
	}

	get windows(): any {
		return this._pageHost;
	}

	public initNativeView(): void {
		super.initNativeView();
		this._setupTransitions();
		this._setupBackButton();
		this._setupBackNavigationShortcuts();
	}

	private _backAccelHandlers: any[] = [];

	// On Windows desktop there is no hardware/gesture back, so a page with `actionBarHidden` (no action
	// bar → no back button) traps the user. Register the standard desktop back shortcuts (Alt+Left and the
	// browser Back key) on the frame root so back navigation always works regardless of the action bar.
	private _setupBackNavigationShortcuts(): void {
		const root = this.nativeViewProtected as any;
		if (!root || !root.KeyboardAccelerators) return;
		// Suppress the WinUI3 "Alt+←" accelerator tooltip bubble that shows on hover.
		// KeyboardAcceleratorPlacementMode.Hidden = 1.
		try { root.KeyboardAcceleratorPlacementMode = 1; } catch (_e) { }
		const that = new WeakRef(this);
		const addAccel = (key: number, modifiers: number) => {
			try {
				const accel = new Microsoft.UI.Xaml.Input.KeyboardAccelerator();
				(accel as any).Key = key;
				(accel as any).Modifiers = modifiers;
				const handler = NSWinRT.asDelegate(
					'Windows.Foundation.TypedEventHandler`2<Microsoft.UI.Xaml.Input.KeyboardAccelerator,Microsoft.UI.Xaml.Input.KeyboardAcceleratorInvokedEventArgs>',
					(_s: any, e: any) => {
						const owner = that.deref();
						if (owner?.canGoBack()) {
							owner.goBack();
							try { (e as any).Handled = true; } catch (_e) {}
						}
					}
				);
				(accel as any).Invoked = handler as never;
				this._backAccelHandlers.push(handler);
				root.KeyboardAccelerators.Append(accel);
			} catch (_e) { }
		};
		// VirtualKey: Left = 37, GoBack (browser back) = 166. VirtualKeyModifiers: None = 0, Menu (Alt) = 2.
		addAccel(37, 2); // Alt+Left
		addAccel(166, 0); // browser Back key / mouse back button
	}

	private _setupBackButton(): void {
		if (!this._backButton) return;
		const that = new WeakRef(this);
		this._backButtonDelegate = NSWinRT.asDelegate('Microsoft.UI.Xaml.RoutedEventHandler', () => {
			const owner = that.deref();
			if (owner?.canGoBack()) owner.goBack();
		});
		this._backButton.Click = this._backButtonDelegate;
	}

	private _setupTransitions(): void {
		// ContentControl doesn't support ContentTransitions — transitions skipped.
	}

	// Override frame-common._removeEntry to cache module-based pages instead of tearing
	// them down. The default path calls frame._removeView(page) → _removeViewCore →
	// _tearDownUI, which nulls nativeViewProtected and _context. Cached pages skip
	// _tearDownUI entirely — their native views remain alive in memory so re-navigating
	// to the same module path is instant (no view creation, no applyAllNativeSetters).
	public _removeEntry(removed: any): void {
		const page = removed?.resolvedPage;
		if (page) {
			const moduleName = removed?.entry?.moduleName;
			if (moduleName && (page as any)._context && (page as any).frame === this) {
				// Cacheable: preserve native views, fire JS lifecycle only.
				this._cacheNativePage(moduleName, page);
			} else if ((page as any)._context) {
				// Non-cacheable (create()-fn page or different frame): deferred teardown.
				const frame = (page as any).frame;
				if (frame && typeof (frame as any)._removeView === 'function') {
					(frame as any)._removeView(page);
				} else {
					setTimeout(() => {
						try { if ((page as any)._context) (page as any)._tearDownUI?.(); } catch (_e) { }
					}, 0);
				}
			}
			// else: already torn down — nothing to do.
		}
		if (removed) removed.resolvedPage = null;
	}

	private _cacheNativePage(moduleName: string, page: any): void {
		// LRU eviction: oldest entry (first key) is deferred-torn-down and removed.
		if (this._nativePageCache.size >= Frame._PAGE_CACHE_LIMIT) {
			const oldestKey = this._nativePageCache.keys().next().value as string;
			const evicted = this._nativePageCache.get(oldestKey);
			this._nativePageCache.delete(oldestKey);
			if (evicted) {
				setTimeout(() => {
					try { if ((evicted as any)._context) (evicted as any)._tearDownUI?.(); } catch (_e) { }
				}, 0);
			}
		}
		this._nativePageCache.set(moduleName, page);
		// Fire JS unloaded lifecycle (CSS transitions + observers need this).
		// _tearDownUI is deliberately NOT called — native views stay alive.
		try { (page as any).callUnloaded?.(); } catch (_e) { }
	}

	//@ts-ignore
	public setCurrent(entry: BackstackEntry, navigationType: NavigationType): void {
		const current = this._currentEntry;
		const currentEntryChanged = current !== entry;
		if (entry?.resolvedPage && currentEntryChanged) {
			// If a navigatedTo handler throws, the base never clears _executingContext, permanently
			// jamming the navigation queue. Guard so a faulty handler can't wedge navigation.
			try {
				this._updateBackstack(entry, navigationType);
				super.setCurrent(entry, navigationType);
			} catch (err) {
				console.error('[Frame.Windows] setCurrent failed; recovering navigation:', err, (err as any)?.stack);
				this._executingContext = null;
				// Restore previous page visually so the user isn't left on a blank screen.
				if (current?.resolvedPage?.nativeViewProtected) {
					try { this._setPageContent(current.resolvedPage.nativeViewProtected); } catch (_e) {}
					this._currentEntry = current;
					this._updateActionBar(current.resolvedPage as Page);
				}
			}
			this._processNavigationQueue(entry.resolvedPage);
		} else {
			// No resolved page (module failed to load) or page already current.
			// _executingContext was set by performNavigation — must clear it unconditionally or
			// all future navigations are permanently blocked.
			this._executingContext = null;
			const queue = (this as any)._navigationQueue as Array<any>;
			if (queue?.length > 0 && queue[0]?.entry === entry) queue.shift();
			(this as any)._processNextNavigationEntry?.();
		}
	}

	@profile
	public _navigateCore(backstackEntry: BackstackEntry) {
		// Restore cached native page before frame-common resolves to a freshly-created one.
		// performNavigation sets backstackEntry.resolvedPage via _resolvePageFromEntry (pure JS,
		// no WinRT), then calls _navigateCore — we replace the just-created page with the cached
		// one here. The cached page's _context is intact, so setCurrent → _addView → _setupUI
		// returns early (page.frame === this), keeping all native views alive with zero WinRT cost.
		const moduleName = (backstackEntry as any)?.entry?.moduleName;
		if (moduleName) {
			const cached = this._nativePageCache.get(moduleName);
			if (cached && (cached as any)._context) {
				this._nativePageCache.delete(moduleName);
				backstackEntry.resolvedPage = cached;
			}
		}

		const fromPage = this.currentPage as Page; // capture before setCurrent swaps it
		// Capture pending queue depth before setCurrent drains it. If taps arrived faster than
		// animations finish, queue.length > 1 here — animate only the final destination.
		const pendingAhead = ((this as any)._navigationQueue?.length ?? 1) - 1;
		super._navigateCore(backstackEntry);

		const navigationType = this._executingContext?.navigationType ?? NavigationType.forward;
		this.setCurrent(backstackEntry, navigationType);

		const page = backstackEntry.resolvedPage;
		if (!this._pageHost || !page?.nativeViewProtected) return;

		// Back-nav doesn't re-fire `loaded` on the restored page's subtree; views stay unloaded with
		// _suspendNativeUpdatesCount set, queuing every setNative (visibility, etc.) indefinitely.
		this._ensureLoaded(page as Page);

		const isForward = navigationType !== NavigationType.back;
		const navTransition = (this as any)._getNavigationTransition?.(backstackEntry.entry);
		const transitionInst = navTransition?.instance;
		const durMs = (transitionInst?.getDuration?.() ?? 0) * 1000 || 180;
		const transName: string = transitionInst?.constructor?.name ?? '';

		// Shared-element morph; returns false when not applicable (falls through to slide/fade).
		if (this._runSharedTransition(fromPage, page as Page, transitionInst, durMs)) {
			this._updateActionBar(page as Page);
			return;
		}

		this._setPageContent(page.nativeViewProtected);
		// Skip animation for intermediate navigations — stacking 250ms Storyboards causes
		// the app to appear frozen while the queue drains.
		const effectiveDur = pendingAhead > 0 ? 0 : durMs;
		// Default to slide; fade only when explicitly requested.
		if (transName.toLowerCase().includes('fade')) {
			this._fadeIn(page.nativeViewProtected, effectiveDur);
		} else {
			this._slideIn(page.nativeViewProtected, isForward, effectiveDur);
		}
		this._updateActionBar(page as Page);
	}

	// Captures each FROM-element's rect before the page swap, then does a normal _setPageContent swap
	// and animates only the incoming elements' transforms. Does NOT keep both pages mounted — that
	// earlier approach collided with frame page management and froze later navigation.
	private _runSharedTransition(fromPage: Page, toPage: Page, transitionInst: any, durMs: number): boolean {
		try {
			if (!transitionInst || !fromPage || !toPage) return false;
			const state = SharedTransition.getState(transitionInst.id);
			if (!state) return false;

			const toNative = toPage.nativeViewProtected as Microsoft.UI.Xaml.UIElement;
			if (!toNative) return false;

			state.page = fromPage;
			state.toPage = toPage;
			const { sharedElements, presented } = SharedTransition.getSharedElements(fromPage, toPage);
			if (!sharedElements || sharedElements.length === 0) return false;

			const host = this._pageHost;
			// Capture FROM-element rects (host coords) BEFORE the page swap removes them.
			const pairs: Array<{ toNative: any; fromRect: { x: number; y: number; w: number; h: number }; tag: string }> = [];
			for (const fromView of sharedElements) {
				const tag = (fromView as any).sharedTransitionTag;
				const toView = presented.find((v) => v.sharedTransitionTag === tag);
				const fromNative = (fromView as any).nativeViewProtected;
				const toEl = toView && (toView as any).nativeViewProtected;
				if (!fromNative || !toEl) continue;
				const r = this._rectInHost(fromNative, host);
				if (!r || r.w <= 0 || r.h <= 0) continue;
				pairs.push({ toNative: toEl, fromRect: r, tag });
			}
			if (pairs.length === 0) return false;

			// Normal page swap — frame keeps full control of the host.
			this._setPageContent(toNative);
			try { host.UpdateLayout(); } catch (_e) { }

			SharedTransitionHelper.animate(state, { host, pairs, durationMs: durMs }, 'page');
			return true;
		} catch (_e) {
			return false;
		}
	}

	private _rectInHost(nativeEl: any, host: any): { x: number; y: number; w: number; h: number } | null {
		try {
			const gt = (nativeEl as any).TransformToVisual(host);
			const p = gt.TransformPoint(new Windows.Foundation.Point(0, 0));
			return { x: p.X, y: p.Y, w: (nativeEl as any).ActualWidth || 0, h: (nativeEl as any).ActualHeight || 0 };
		} catch (_e) {
			return null;
		}
	}

	// Override _removeViewCore to decouple the JS lifecycle from the native teardown.
	// ViewBase._removeViewCore calls both unloadView (JS) and _tearDownUI (native) synchronously.
	// _tearDownUI on a 40-view page fires ~100 WinRT calls (disposeNativeView + Children.RemoveAt
	// per child) while the page is still on screen — this blocks the animation start by 10-20ms.
	// Fix: fire callUnloaded() synchronously (CSS animations + observers depend on it), but defer
	// _tearDownUI to a setTimeout(0). By then _setPageContent has already removed the root from
	// _pageHost, so the WinRT calls operate on a detached subtree with no XAML layout cascade.
	public _removeViewCore(view: any): void {
		try { view.callUnloaded?.(); } catch (_e) { }
		if (view._context) {
			setTimeout(() => {
				try { if (view._context) view._tearDownUI?.(); } catch (_e) { }
			}, 0);
		}
	}

	// Windows back-nav restores a cached page without re-firing the `loaded` lifecycle, leaving the
	// subtree with _suspendNativeUpdatesCount set (every setNative queued, never applied). callLoaded()
	// flips isLoaded and flushes the queued setNatives via _resumeNativeUpdates.
	// Early-exit: if a view is already loaded, NativeScript guarantees its entire subtree is also
	// loaded — skip the O(N) recursion entirely. This is the common case on back navigation.
	private _ensureLoaded(view: any): void {
		if (!view || view.isLoaded) return;
		try {
			if (typeof view.callLoaded === 'function') view.callLoaded();
		} catch (_e) { }
		try {
			if (typeof view.eachChildView === 'function') {
				view.eachChildView((c: any) => { this._ensureLoaded(c); return true; });
			}
		} catch (_e) { }
	}

	private _setPageContent(nativePageView: Microsoft.UI.Xaml.UIElement): void {
		const children = this._pageHost.Children;
		if (!children) return;
		const count = children.Size ?? 0;
		for (let i = count - 1; i >= 0; i--) {
			try { children.RemoveAt(i); } catch (_e) { }
		}
		try { children.Append(nativePageView); } catch (_e) { }
	}

	// WinUI Duration: { TimeSpan: { Duration: <100ns ticks> }, Type: 1 (DurationType.TimeSpan) }.
	// The runtime now marshals nested structs correctly; plain object replaces the old ArrayBuffer hack.
	private _duration(ms: number): Microsoft.UI.Xaml.Duration {
		return { TimeSpan: { Duration: Math.max(1, Math.round(ms)) * 10000 }, Type: 1 } as never;
	}

	// Page transitions run as native Storyboards (compositor-driven). The previous
	// requestAnimationFrame/setTimeout interpolation was effectively instant in this host.
	private _runStoryboard(sb: Microsoft.UI.Xaml.Media.Animation.Storyboard, onDone: () => void): void {
		_activeTransitions.add(sb);
		let done = false;
		const finish = () => {
			if (done) return;
			done = true;
			_activeTransitions.delete(sb);
			try { onDone(); } catch (_e) { }
		};
		try { sb.Completed = (() => finish()) as never; } catch (_e) { }
		try { sb.Begin(); } catch (_e) { finish(); return; }
		// Safety timeout: final state must land even if Completed never fires (element detached, etc.).
		setTimeout(finish, 400);
	}

	private _fadeIn(native: Microsoft.UI.Xaml.UIElement, durationMs: number): void {
		if (durationMs <= 0) {
			try { native.Opacity = 1; } catch (_e) { }
			return;
		}
		try {
			native.Opacity = 0;
			const sb = new Microsoft.UI.Xaml.Media.Animation.Storyboard();
			const da = new Microsoft.UI.Xaml.Media.Animation.DoubleAnimation();
			da.From = 0;
			da.To = 1;
			da.Duration = this._duration(durationMs) as never;
			Microsoft.UI.Xaml.Media.Animation.Storyboard.SetTarget(da, native);
			Microsoft.UI.Xaml.Media.Animation.Storyboard.SetTargetProperty(da, 'Opacity');
			sb.Children.Append(da);
			this._runStoryboard(sb, () => { native.Opacity = 1; });
		} catch (_e) {
			native.Opacity = 1;
		}
	}

	// Slides in from right (forward) or left (back). Uses TranslateTransform.X — CompositeTransform.TranslateX
	// did not animate reliably in this host.
	private _slideIn(native: Microsoft.UI.Xaml.UIElement, fromRight: boolean, durationMs: number): void {
		if (durationMs <= 0) {
			try { native.Opacity = 1; } catch (_e) { }
			return;
		}
		try {
			const startX = fromRight ? 380 : -380;
			const tt = new Microsoft.UI.Xaml.Media.TranslateTransform();
			tt.X = startX;
			native.RenderTransform = tt;
			native.Opacity = 0;
			const sb = new Microsoft.UI.Xaml.Media.Animation.Storyboard();
			const slide = new Microsoft.UI.Xaml.Media.Animation.DoubleAnimation();
			slide.From = startX;
			slide.To = 0;
			slide.Duration = this._duration(durationMs) as never;
			const ease = new Microsoft.UI.Xaml.Media.Animation.CubicEase();
			ease.EasingMode = Microsoft.UI.Xaml.Media.Animation.EasingMode.EaseOut;
			slide.EasingFunction = ease;
			Microsoft.UI.Xaml.Media.Animation.Storyboard.SetTarget(slide, tt);
			Microsoft.UI.Xaml.Media.Animation.Storyboard.SetTargetProperty(slide, 'X');
			sb.Children.Append(slide);
			// Fade in alongside the slide to avoid a flash at the gap.
			const fade = new Microsoft.UI.Xaml.Media.Animation.DoubleAnimation();
			fade.From = 0;
			fade.To = 1;
			fade.Duration = this._duration(Math.min(durationMs, 160)) as never;
			Microsoft.UI.Xaml.Media.Animation.Storyboard.SetTarget(fade, native);
			Microsoft.UI.Xaml.Media.Animation.Storyboard.SetTargetProperty(fade, 'Opacity');
			sb.Children.Append(fade);
			this._runStoryboard(sb, () => { try { tt.X = 0; } catch (_e) { } native.Opacity = 1; });
		} catch (_e) {
			this._fadeIn(native, durationMs);
		}
	}

	public _goBackCore(backstackEntry: BackstackEntry) {
		const fromPage = this.currentPage as Page; // capture before setCurrent swaps it
		const pendingAhead = ((this as any)._navigationQueue?.length ?? 1) - 1;
		super._goBackCore(backstackEntry);

		this.setCurrent(backstackEntry, NavigationType.back);

		const page = backstackEntry.resolvedPage;
		if (!this._pageHost || !page?.nativeViewProtected) return;

		// Re-load the restored page's subtree (see _navigateCore).
		this._ensureLoaded(page as Page);

		const navTransition = (this as any)._getNavigationTransition?.(backstackEntry.entry);
		const transitionInst = navTransition?.instance;
		const durMs = (transitionInst?.getDuration?.() ?? 0) * 1000 || 180;
		const transName: string = transitionInst?.constructor?.name ?? '';

		// Reverse shared-element morph on back; falls back to slide/fade if not applicable.
		if (this._runSharedTransition(fromPage, page as Page, transitionInst, durMs)) {
			this._updateActionBar(page as Page);
			return;
		}

		this._setPageContent(page.nativeViewProtected);
		const effectiveDur = pendingAhead > 0 ? 0 : durMs;
		// Default to slide; fade only when explicitly requested.
		if (transName.toLowerCase().includes('fade')) {
			this._fadeIn(page.nativeViewProtected, effectiveDur);
		} else {
			this._slideIn(page.nativeViewProtected, false, effectiveDur);
		}
		this._updateActionBar(page as Page);
	}

	public _updateActionBar(page?: Page): void {
		super._updateActionBar(page);
		if (!this._topBar) return;

		page = page ?? (this.currentPage as Page);
		if (!page) return;

		const visible = this._isNavBarVisible(page);
		this._topBar.Visibility = visible ? 0 : 1;

		if (!visible) return;

		// ActionBar style → native bar: background-color fills the bar Grid, color becomes the
		// foreground brush for title/back/action items. The bar is shared across pages, so an
		// unset style must RESET to defaults (ClearValue), not keep the previous page's colors.
		const pageActionBar = (page as any).actionBar;
		try {
			const bg = pageActionBar?.style?.backgroundColor;
			this._topBar.Background = bg?.windows ? new Microsoft.UI.Xaml.Media.SolidColorBrush(bg.windows) : (null as never);
		} catch (_e) {}
		try {
			const fg = pageActionBar?.style?.color;
			this._abFgBrush = fg?.windows ? new Microsoft.UI.Xaml.Media.SolidColorBrush(fg.windows) : null;
			if (this._titleBlock) {
				if (this._abFgBrush) this._titleBlock.Foreground = this._abFgBrush;
				else this._titleBlock.ClearValue(Microsoft.UI.Xaml.Controls.TextBlock.ForegroundProperty);
			}
			if (this._backButton) {
				if (this._abFgBrush) this._backButton.Foreground = this._abFgBrush;
				else this._backButton.ClearValue(Microsoft.UI.Xaml.Controls.Control.ForegroundProperty);
			}
		} catch (_e) {}

		if (this._backButton) {
			const navBtn = (page as any).actionBar?.navigationButton;
			const navIconSrc: string = navBtn?.windows?.icon ?? navBtn?.icon ?? '';
			const navIcon = navIconSrc ? this._createActionItemIcon(navIconSrc, navBtn) : null;
			this._backButton.Content = (navIcon ?? navBtn?.text ?? '←') as never;
			this._backButton.Visibility = this.canGoBack() ? 0 : 1;
		}

		if (this._titleArea) {
			const actionBar = (page as any).actionBar;
			const titleView = actionBar?.titleView;
			const newNative: Microsoft.UI.Xaml.UIElement | null = titleView?.nativeViewProtected ?? null;
			if (newNative !== this._titleViewNative) {
				// Swap the child in the title Grid: remove the old one, add the new one.
				try {
					const children = this._titleArea.Children;
					const count = children.Size ?? 0;
					for (let i = count - 1; i >= 0; i--) {
						try { children.RemoveAt(i); } catch (_e) {}
					}
					if (newNative) {
						children.Append(newNative);
					} else if (this._titleBlock) {
						children.Append(this._titleBlock);
					}
					this._titleViewNative = newNative;
				} catch (_e) {}
			}
			if (!newNative && this._titleBlock) {
				this._titleBlock.Text = actionBar?.title ?? '';
			}
		}

		this._rebuildActionItems(page);
	}

	public disposeNativeView(): void {
		this._flushPageCache();
		this._titleArea = null;
		this._titleViewNative = null;
		this._titleBlock = null;
		this._actionArea = null;
		this._actionItemDelegates.length = 0;
		super.disposeNativeView?.();
	}

	private _flushPageCache(): void {
		for (const [, page] of this._nativePageCache) {
			try { if ((page as any)._context) (page as any)._tearDownUI?.(); } catch (_e) { }
		}
		this._nativePageCache.clear();
	}

	private _isNavBarVisible(page: Page): boolean {
		if (this.actionBarVisibility === 'always') return true;
		if (this.actionBarVisibility === 'never') return false;
		if ((page as any).actionBarHidden) return false;
		return !(page as any).actionBar?._isEmpty() || this.canGoBack();
	}

	private _rebuildActionItems(page: Page): void {
		const area = this._actionArea;
		if (!area) return;
		// Clear existing buttons and release old delegate GC-guards.
		this._actionItemDelegates.length = 0;
		const children = area.Children;
		const size = children.Size ?? 0;
		for (let i = size - 1; i >= 0; i--) {
			try { children.RemoveAt(i); } catch (_e) {}
		}
		const items: any[] = (page as any).actionBar?.actionItems?.getVisibleItems() ?? [];
		for (const item of items) {
			try {
				const btn = new Microsoft.UI.Xaml.Controls.Button();
				const del = NSWinRT.asDelegate('Microsoft.UI.Xaml.RoutedEventHandler', () => item._raiseTap());
				this._actionItemDelegates.push(del); // keep alive until next rebuild
				btn.Click = del as never;
				if (this._abFgBrush) {
					btn.Foreground = this._abFgBrush;
				}
				if (item.actionView?.nativeViewProtected) {
					btn.Content = item.actionView.nativeViewProtected as never;
				} else {
					const label: string = item.text ?? '';
					const iconSrc: string = item.windows?.icon ?? item.icon ?? '';
					// Icon takes priority over text when it resolves (matches iOS loadActionIcon).
					const iconContent = iconSrc ? this._createActionItemIcon(iconSrc, item) : null;
					if (iconContent) {
						btn.Content = iconContent as never;
					} else if (label) {
						btn.Content = label as never;
					} else {
						// No text and no usable icon (ios.systemIcon / android.systemIcon are ignored on Windows).
						// Show a generic visible marker so the button is tappable.
						btn.Content = '▶' as never;
					}
				}
				children.Append(btn);
			} catch (_e) {}
		}
	}

	// Resolves an ActionItem icon URI to a XAML element: font:// → glyph TextBlock, res://|~/|file →
	// Image. Returns null if unresolved (caller falls back to text/marker).
	private _createActionItemIcon(iconSrc: string, item: any): Microsoft.UI.Xaml.UIElement | null {
		try {
			if (isFontIconURI(iconSrc)) {
				const glyph = iconSrc.split('//')[1];
				if (!glyph) return null;
				const tb = new Microsoft.UI.Xaml.Controls.TextBlock();
				tb.Text = glyph;
				tb.VerticalAlignment = 1; // Center
				const itemStyle = item.style;
				const font = itemStyle?.fontInternal;
				if (font?.fontFamily) {
					const ff = getFontFamilyCached(font.fontFamily);
					if (ff) tb.FontFamily = ff;
				}
				if (font?.fontSize) tb.FontSize = font.fontSize;
				const color = itemStyle?.color;
				if (color?.windows) tb.Foreground = new Microsoft.UI.Xaml.Media.SolidColorBrush(color.windows);
				else if (this._abFgBrush) tb.Foreground = this._abFgBrush;
				return tb;
			}
			const is = ImageSource.fromFileOrResourceSync(iconSrc);
			const bmp = is?.windows;
			if (bmp && !(bmp instanceof ArrayBuffer) && !(bmp instanceof Uint8Array)) {
				const img = new Microsoft.UI.Xaml.Controls.Image();
				img.Width = 24; img.Height = 24;
				img.Stretch = 2 as never; // Uniform
				img.Source = bmp as never;
				return img;
			}
			return null;
		} catch (_e) {
			return null;
		}
	}
}

// attach on global, so it can be overwritten in NativeScript Angular
global.__onLiveSyncCore = Frame.reloadPage;

export function setActivityCallbacks(_callbacks: any): void { }
export function setWindowContent(_view: any): void { }