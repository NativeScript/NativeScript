import type { BackstackEntry } from './frame-common';
import { FrameBase, NavigationType } from './frame-common';
import { profile } from '../../profiling';
import type { Page } from '../page';

export * from './frame-common';

export class Frame extends FrameBase {
	declare nativeViewProtected: any; // Windows.UI.Xaml.Controls.Grid container
	// _pageHost is a single-cell Grid used to host the current page by appending it as a child.
	// Using Grid.Children.Append() rather than ContentControl.Content avoids template/binding issues.
	private _pageHost: any; // Windows.UI.Xaml.Controls.Grid
	// Keep backward compat alias (_windows) so _navigateCore and _goBackCore work unchanged.
	private get _windows(): any { return this._pageHost; }
	private _topBar: any = null;
	private _backButton: any = null;
	private _titleBlock: any = null;
	private _backButtonDelegate: any = null;

	constructor() {
		super();
		this._pageHost = new Windows.UI.Xaml.Controls.Grid();
	}

	public createNativeView(): any {
		this._buildTopBar();
		return this._buildContainer();
	}

	private _buildTopBar(): void {
		try {
			this._topBar = new (Windows.UI.Xaml.Controls as any).CommandBar();

			const contentPanel = new Windows.UI.Xaml.Controls.StackPanel();
			contentPanel.Orientation = Windows.UI.Xaml.Controls.Orientation.Horizontal;

			this._backButton = new Windows.UI.Xaml.Controls.Button();
			// Use standard left-arrow character (U+2190) — no special font needed
			(this._backButton as any).Content = '←';

			this._titleBlock = new Windows.UI.Xaml.Controls.TextBlock();
			(this._titleBlock as any).VerticalAlignment = 1; // Center

			(contentPanel as any).Children.Append(this._backButton);
			(contentPanel as any).Children.Append(this._titleBlock);
			(this._topBar as any).Content = contentPanel;
			(this._topBar as any).Visibility = 1; // Collapsed
		} catch (_e) {
			this._topBar = null;
		}
	}

	private _buildContainer(): any {
		if (!this._topBar) {
			return this._pageHost;
		}

		// Outer Grid with two rows: row 0 (Auto) for CommandBar, row 1 (*) for page content.
		try {
			const outerGrid = new Windows.UI.Xaml.Controls.Grid();

			const autoRow = new Windows.UI.Xaml.Controls.RowDefinition();
			autoRow.Height = new Windows.UI.Xaml.GridLength(1, Windows.UI.Xaml.GridUnitType.auto);
			const starRow = new Windows.UI.Xaml.Controls.RowDefinition();
			starRow.Height = new Windows.UI.Xaml.GridLength(1, Windows.UI.Xaml.GridUnitType.star);
			(outerGrid as any).RowDefinitions.Append(autoRow);
			(outerGrid as any).RowDefinitions.Append(starRow);

			(this._topBar as any).HorizontalAlignment = 3; // Stretch
			Windows.UI.Xaml.Controls.Grid.SetRow(this._topBar, 0);
			(outerGrid as any).Children.Append(this._topBar);

			(this._pageHost as any).HorizontalAlignment = 3; // Stretch
			Windows.UI.Xaml.Controls.Grid.SetRow(this._pageHost, 1);
			(outerGrid as any).Children.Append(this._pageHost);

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
	}

	private _setupBackButton(): void {
		if (!this._backButton) return;
		const that = new WeakRef(this);
		let usedAdd = false;
		try {
			this._backButtonDelegate = new Windows.UI.Xaml.RoutedEventHandler(() => {
				const owner = that.deref();
				if (owner?.canGoBack()) owner.goBack();
			});
			(this._backButton as any).Click = this._backButtonDelegate as never;
		} catch (_e) {
			this._backButtonDelegate = () => {
				const owner = that.deref();
				if (owner?.canGoBack()) owner.goBack();
			};
			try {
				(this._backButton as any).Click = this._backButtonDelegate as never;
			} catch (_e2) {
				try {
					if (typeof (this._backButton as any).addEventListener === 'function') {
						(this._backButton as any).addEventListener('click', this._backButtonDelegate);
						usedAdd = true;
					}
				} catch (_e3) {}
			}
		}
		// store usedAdd if needed in future (not currently tracked)
	}

	private _setupTransitions(): void {
		// ContentControl doesn't support ContentTransitions — transitions skipped.
	}

	//@ts-ignore
	public setCurrent(entry: BackstackEntry, navigationType: NavigationType): void {
		const current = this._currentEntry;
		const currentEntryChanged = current !== entry;
		if (entry?.resolvedPage && currentEntryChanged) {
			this._updateBackstack(entry, navigationType);
			super.setCurrent(entry, navigationType);
			this._processNavigationQueue(entry.resolvedPage);
		}
	}

	@profile
	public _navigateCore(backstackEntry: BackstackEntry) {
		super._navigateCore(backstackEntry);

		const navigationType = this._executingContext?.navigationType ?? NavigationType.forward;
		this.setCurrent(backstackEntry, navigationType);

		const page = backstackEntry.resolvedPage;
		if (!this._pageHost || !page?.nativeViewProtected) return;

		const isForward = navigationType !== NavigationType.back;
		const navTransition = (this as any)._getNavigationTransition?.(backstackEntry.entry);
		const transitionInst = navTransition?.instance;
		const durMs = (transitionInst?.getDuration?.() ?? 0) * 1000 || 250;
		const transName: string = transitionInst?.constructor?.name ?? '';

		this._setPageContent(page.nativeViewProtected);
		if (transName.toLowerCase().includes('slide')) {
			this._slideIn(page.nativeViewProtected, isForward, durMs);
		} else if (isForward || transitionInst) {
			this._fadeIn(page.nativeViewProtected, durMs);
		}
		this._updateActionBar(page as Page);
	}

	private _setPageContent(nativePageView: any): void {
		const children = this._pageHost.Children as any;
		if (!children) return;
		const count = children.Size ?? 0;
		for (let i = count - 1; i >= 0; i--) {
			try { children.RemoveAt(i); } catch (_e) {}
		}
		children.Append(nativePageView);
	}

	private _easeOutCubic(t: number): number {
		return 1 - Math.pow(1 - t, 3);
	}

	private _animate(durationMs: number, onFrame: (ease: number) => void): void {
		const start = Date.now();
		const step = () => {
			const t = Math.min(1, (Date.now() - start) / Math.max(1, durationMs));
			onFrame(this._easeOutCubic(t));
			if (t < 1) {
				if (typeof requestAnimationFrame === 'function') {
					requestAnimationFrame(step as any);
				} else {
					setTimeout(step, 16);
				}
			}
		};
		if (typeof requestAnimationFrame === 'function') {
			requestAnimationFrame(step as any);
		} else {
			setTimeout(step, 16);
		}
	}

	private _fadeIn(native: any, durationMs: number): void {
		try { native.Opacity = 0; } catch (_e) { return; }
		this._animate(durationMs, (ease) => {
			try { native.Opacity = ease; } catch (_e) {}
		});
	}

	private _slideIn(native: any, fromRight: boolean, durationMs: number): void {
		let tt: any = null;
		try {
			tt = new Windows.UI.Xaml.Media.TranslateTransform();
			tt.X = fromRight ? 320 : -320;
			native.RenderTransform = tt;
		} catch (_e) { this._fadeIn(native, durationMs); return; }
		const startX = tt.X;
		this._animate(durationMs, (ease) => {
			try {
				tt.X = startX * (1 - ease);
				if (ease >= 1) native.RenderTransform = null;
			} catch (_e) {}
		});
	}

	public _goBackCore(backstackEntry: BackstackEntry) {
		super._goBackCore(backstackEntry);

		this.setCurrent(backstackEntry, NavigationType.back);

		const page = backstackEntry.resolvedPage;
		if (!this._pageHost || !page?.nativeViewProtected) return;

		const navTransition = (this as any)._getNavigationTransition?.(backstackEntry.entry);
		const transitionInst = navTransition?.instance;
		const durMs = (transitionInst?.getDuration?.() ?? 0) * 1000 || 250;
		const transName: string = transitionInst?.constructor?.name ?? '';

		this._setPageContent(page.nativeViewProtected);
		if (transName.toLowerCase().includes('slide')) {
			this._slideIn(page.nativeViewProtected, false, durMs);
		} else {
			this._fadeIn(page.nativeViewProtected, durMs);
		}
		this._updateActionBar(page as Page);
	}

	public _updateActionBar(page?: Page): void {
		super._updateActionBar(page);
		if (!this._topBar) return;

		page = page ?? (this.currentPage as Page);
		if (!page) return;

		const visible = this._isNavBarVisible(page);
		(this._topBar as any).Visibility = visible ? 0 : 1;

		if (!visible) return;

		if (this._backButton) {
			const navBtn = (page as any).actionBar?.navigationButton;
			if (navBtn?.text) {
				(this._backButton as any).Content = navBtn.text;
			}
			(this._backButton as any).Visibility = this.canGoBack() ? 0 : 1;
		}

		if (this._titleBlock) {
			(this._titleBlock as any).Text = (page as any).actionBar?.title ?? '';
		}

		this._rebuildActionItems(page);
	}

	private _isNavBarVisible(page: Page): boolean {
		if (this.actionBarVisibility === 'always') return true;
		if (this.actionBarVisibility === 'never') return false;
		if ((page as any).actionBarHidden) return false;
		return !(page as any).actionBar?._isEmpty() || this.canGoBack();
	}

	private _rebuildActionItems(page: Page): void {
		try {
			const commands = (this._topBar as any).PrimaryCommands;
			commands.Clear();
			const items: any[] = (page as any).actionBar?.actionItems?.getVisibleItems() ?? [];
			for (const item of items) {
				try {
					const btn = new (Windows.UI.Xaml.Controls as any).AppBarButton();
					(btn as any).Label = item.text ?? '';
					let delegate: any = null;
					let usedAddListener = false;
					try {
						delegate = new Windows.UI.Xaml.RoutedEventHandler(() => item._raiseTap());
						(btn as any).Click = delegate as never;
					} catch (_e) {
						delegate = () => item._raiseTap();
						try {
							(btn as any).Click = delegate as never;
						} catch (_e2) {
							try {
								if (typeof (btn as any).addEventListener === 'function') {
									(btn as any).addEventListener('click', delegate);
									usedAddListener = true;
								}
							} catch (_e3) {}
						}
					}
					commands.Append(btn);
				} catch (_e) {}
			}
		} catch (_e) {}
	}
}

// attach on global, so it can be overwritten in NativeScript Angular
global.__onLiveSyncCore = Frame.reloadPage;

export function setActivityCallbacks(_callbacks: any): void {}
export function setWindowContent(_view: any): void {}