import { Trace } from '../../trace';
import { layout } from '../../utils';
import { traceCategory } from './tab-view-common';

/** Material 3 navigation bar height, above any navigation bar inset. */
const BAR_HEIGHT_DP = 80;
/** Material 3's medium window width class, from which navigation moves to a rail. */
const RAIL_MIN_WIDTH_DP = 600;
/** Material 3 navigation rail width, beside any left inset. */
const RAIL_WIDTH_DP = 80;

const MATERIAL_CLASS = 'com.google.android.material.navigation.NavigationBarView';

/** What the navigation needs from its TabView. */
export interface TabNavigationOwner {
	readonly androidIconRenderingMode: 'alwaysOriginal' | 'alwaysTemplate';
	readonly _context: android.content.Context;
}

/** Throws unless the app links Material Components, which `androidTabsStyle: 'navigation'` is drawn with. */
export function requireMaterial(): void {
	try {
		java.lang.Class.forName(MATERIAL_CLASS);
	} catch (e) {
		throw new Error(`TabView androidTabsStyle 'navigation' needs Material Components: add implementation 'com.google.android.material:material:<version>' to App_Resources/Android/app.gradle`);
	}
}

/**
 * A TabView's tabs as Material 3 navigation: a navigation bar below the content, which becomes a
 * navigation rail beside it once the window is medium width or wider. The visible one owns the
 * system inset on its edge (the bar the bottom one, the rail the left one); the pages get the rest.
 */
export class TabNavigation {
	readonly bar: com.google.android.material.bottomnavigation.BottomNavigationView;
	readonly rail: com.google.android.material.navigationrail.NavigationRailView;
	private railMode = false;
	private insetBottom = 0;
	private insetLeft = 0;
	private suppressSelection = false;
	private pageListener: androidx.viewpager.widget.ViewPager.OnPageChangeListener;
	private viewPager: androidx.viewpager.widget.ViewPager;

	/** The TabView's native view: the pages in row 0 column 1, the bar in row 1, the rail in column 0. */
	constructor(
		private owner: WeakRef<TabNavigationOwner>,
		readonly grid: org.nativescript.widgets.GridLayout,
		viewPager: androidx.viewpager.widget.ViewPager,
		primaryColor: number,
	) {
		const context = grid.getContext();
		const themed = materialContext(context);
		this.bar = new com.google.android.material.bottomnavigation.BottomNavigationView(themed);
		this.bar.setMinimumHeight(Math.round(BAR_HEIGHT_DP * layout.getDisplayDensity()));
		this.rail = new com.google.android.material.navigationrail.NavigationRailView(themed);
		this.rail.setMenuGravity(android.view.Gravity.CENTER);

		// Sized in pixels: an auto cell measures these Material views at zero.
		grid.addColumn(new org.nativescript.widgets.ItemSpec(0, org.nativescript.widgets.GridUnitType.pixel));
		grid.addColumn(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.star));
		grid.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.star));
		grid.addRow(new org.nativescript.widgets.ItemSpec(0, org.nativescript.widgets.GridUnitType.pixel));

		const pagesLp = new org.nativescript.widgets.CommonLayoutParams();
		pagesLp.row = 0;
		pagesLp.column = 1;
		viewPager.setLayoutParams(pagesLp);
		grid.addView(viewPager);

		const barLp = new org.nativescript.widgets.CommonLayoutParams();
		barLp.row = 1;
		barLp.columnSpan = 2;
		this.bar.setLayoutParams(barLp);
		grid.addView(this.bar);

		const railLp = new org.nativescript.widgets.CommonLayoutParams();
		railLp.rowSpan = 2;
		this.rail.setLayoutParams(railLp);
		grid.addView(this.rail);

		if (primaryColor) {
			this.bar.setBackgroundColor(primaryColor);
			this.rail.setBackgroundColor(primaryColor);
		}
		this.applyMode(this.prefersRail());
		this.routeInsets(viewPager);
	}

	get views(): com.google.android.material.navigation.NavigationBarView[] {
		return [this.bar, this.rail];
	}

	/** Selecting an item shows its page; showing a page checks its item. */
	attach(viewPager: androidx.viewpager.widget.ViewPager): void {
		this.viewPager = viewPager;
		const navigation = new WeakRef(this);
		const selected = new com.google.android.material.navigation.NavigationBarView.OnItemSelectedListener({
			onNavigationItemSelected(item: android.view.MenuItem): boolean {
				const owner = navigation.get();
				if (owner && !owner.suppressSelection) {
					owner.viewPager?.setCurrentItem(item.getItemId(), false);
				}
				return true;
			},
		});
		for (const view of this.views) {
			view.setOnItemSelectedListener(selected);
		}
		this.pageListener = new androidx.viewpager.widget.ViewPager.OnPageChangeListener({
			onPageScrolled(position: number, offset: number, offsetPixels: number): void {},
			onPageScrollStateChanged(state: number): void {},
			onPageSelected(position: number): void {
				navigation.get()?.check(position);
			},
		});
		viewPager.addOnPageChangeListener(this.pageListener);
	}

	dispose(): void {
		for (const view of this.views) {
			view.setOnItemSelectedListener(null);
			view.getMenu().clear();
		}
		if (this.pageListener && this.viewPager) {
			this.viewPager.removeOnPageChangeListener(this.pageListener);
		}
		androidx.core.view.ViewCompat.setOnApplyWindowInsetsListener(this.grid, null);
		this.pageListener = null;
		this.viewPager = null;
	}

	/** Checks item `index` in the bar and the rail without reselecting its page. */
	check(index: number): void {
		this.suppressSelection = true;
		try {
			for (const view of this.views) {
				const menu = view.getMenu();
				if (index >= 0 && index < menu.size()) {
					menu.getItem(index).setChecked(true);
				}
			}
		} finally {
			this.suppressSelection = false;
		}
	}

	clear(): void {
		for (const view of this.views) {
			view.getMenu().clear();
		}
	}

	setItems(specs: org.nativescript.widgets.TabItemSpec[], selectedIndex: number, textColor: number | null, selectedTextColor: number | null): void {
		for (const view of this.views) {
			const menu = view.getMenu();
			menu.clear();
			specs.forEach((spec, i) => {
				const item = menu.add(android.view.Menu.NONE, i, i, spec.title || '');
				const icon = this.drawable(spec);
				if (icon) {
					item.setIcon(icon);
				}
			});
		}
		if (Trace.isEnabled()) {
			Trace.write(`TabView: navigation has ${specs.length} item(s)`, traceCategory);
		}
		this.applyColors(textColor, selectedTextColor);
		this.check(selectedIndex);
		this.grid.requestLayout();
	}

	updateItem(index: number, spec: org.nativescript.widgets.TabItemSpec): void {
		for (const view of this.views) {
			const menu = view.getMenu();
			if (index >= 0 && index < menu.size()) {
				const item = menu.getItem(index);
				item.setTitle(spec.title || '');
				const icon = this.drawable(spec);
				if (icon) {
					item.setIcon(icon);
				}
			}
		}
	}

	/** Labels in the tab text colors; icons tinted to match unless they keep their own colors. */
	applyColors(textColor: number | null, selectedTextColor: number | null): void {
		const original = this.owner.get()?.androidIconRenderingMode === 'alwaysOriginal';
		if (original) {
			for (const view of this.views) {
				view.setItemIconTintList(null);
			}
		}
		if (textColor === null && selectedTextColor === null) {
			return;
		}
		const checked = selectedTextColor ?? textColor;
		const unchecked = textColor ?? selectedTextColor;
		const colors = checkedColors(checked, unchecked);
		for (const view of this.views) {
			view.setItemTextColor(colors);
			if (!original) {
				view.setItemIconTintList(colors);
			}
		}
	}

	setBackground(color: number | null, drawable: android.graphics.drawable.Drawable | null): void {
		for (const view of this.views) {
			if (drawable) {
				view.setBackground(drawable);
			} else {
				view.setBackgroundColor(color);
			}
		}
	}

	/** The Material 3 active indicator behind the selected item. */
	setIndicatorColor(color: number): void {
		for (const view of this.views) {
			view.setItemActiveIndicatorColor(android.content.res.ColorStateList.valueOf(color));
		}
	}

	private prefersRail(): boolean {
		return this.grid.getResources().getConfiguration().screenWidthDp >= RAIL_MIN_WIDTH_DP;
	}

	/** Shows the rail or the bar, and sizes the bar's row and the rail's column with the inset each pads. */
	private applyMode(rail: boolean): void {
		this.railMode = rail;
		this.rail.setVisibility(rail ? android.view.View.VISIBLE : android.view.View.GONE);
		this.bar.setVisibility(rail ? android.view.View.GONE : android.view.View.VISIBLE);
		const density = layout.getDisplayDensity();
		const height = rail ? 0 : Math.round(BAR_HEIGHT_DP * density) + this.insetBottom;
		const rows = this.grid.getRows();
		if (rows.length > 1 && rows[1].getValue() !== height) {
			this.grid.removeRowAt(1);
			this.grid.addRow(new org.nativescript.widgets.ItemSpec(height, org.nativescript.widgets.GridUnitType.pixel));
		}
		const width = rail ? Math.round(RAIL_WIDTH_DP * density) + this.insetLeft : 0;
		const columns = this.grid.getColumns();
		if (columns.length > 1 && columns[0].getValue() !== width) {
			// Columns are only appended: replace both to keep the rail's first.
			this.grid.removeColumnAt(0);
			this.grid.addColumn(new org.nativescript.widgets.ItemSpec(width, org.nativescript.widgets.GridUnitType.pixel));
			this.grid.removeColumnAt(0);
			this.grid.addColumn(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.star));
		}
	}

	/** Insets are dispatched again whenever the window changes size, which is also when the rail and the bar trade places. */
	private routeInsets(viewPager: androidx.viewpager.widget.ViewPager): void {
		const navigation = new WeakRef(this);
		androidx.core.view.ViewCompat.setOnApplyWindowInsetsListener(
			this.grid,
			new androidx.core.view.OnApplyWindowInsetsListener({
				onApplyWindowInsets(view: android.view.View, insets: androidx.core.view.WindowInsetsCompat): androidx.core.view.WindowInsetsCompat {
					const self = navigation.get();
					if (!self) {
						return insets;
					}
					const Type = androidx.core.view.WindowInsetsCompat.Type;
					const Insets = androidx.core.graphics.Insets;
					const bars = insets.getInsets(Type.navigationBars());
					const status = insets.getInsets(Type.statusBars());
					const cutout = insets.getInsets(Type.displayCutout());
					const rail = self.prefersRail();
					self.insetBottom = bars.bottom;
					self.insetLeft = Math.max(bars.left, cutout.left);
					self.applyMode(rail);
					const content = new androidx.core.view.WindowInsetsCompat.Builder(insets);
					if (rail) {
						content.setInsets(Type.navigationBars(), Insets.of(0, bars.top, bars.right, bars.bottom));
						content.setInsets(Type.displayCutout(), Insets.of(0, cutout.top, cutout.right, cutout.bottom));
						androidx.core.view.ViewCompat.dispatchApplyWindowInsets(self.rail, insets);
						self.rail.setPadding(self.insetLeft, Math.max(status.top, cutout.top), 0, bars.bottom);
					} else {
						content.setInsets(Type.navigationBars(), Insets.of(bars.left, bars.top, bars.right, 0));
						androidx.core.view.ViewCompat.dispatchApplyWindowInsets(self.bar, insets);
					}
					androidx.core.view.ViewCompat.dispatchApplyWindowInsets(viewPager, content.build());
					return androidx.core.view.WindowInsetsCompat.CONSUMED;
				},
			}),
		);
	}

	private drawable(spec: org.nativescript.widgets.TabItemSpec): android.graphics.drawable.Drawable | null {
		if (spec.iconDrawable) {
			return spec.iconDrawable;
		}
		if (spec.iconId) {
			try {
				return androidx.core.content.ContextCompat.getDrawable(this.owner.get()?._context ?? this.grid.getContext(), spec.iconId);
			} catch (e) {
				return null;
			}
		}
		return null;
	}
}

function checkedColors(checked: number, unchecked: number): android.content.res.ColorStateList {
	const states = Array.create('[I', 2);
	const checkedState = Array.create('int', 1);
	checkedState[0] = android.R.attr.state_checked;
	states[0] = checkedState;
	const uncheckedState = Array.create('int', 1);
	uncheckedState[0] = -android.R.attr.state_checked;
	states[1] = uncheckedState;
	const colors = Array.create('int', 2);
	colors[0] = checked;
	colors[1] = unchecked;
	return new android.content.res.ColorStateList(states, colors);
}

/**
 * The Material views read Material theme attributes an AppCompat app theme lacks (they can measure
 * at zero height without them): a Material theme over the app's context, the first the app has.
 */
function materialContext(context: android.content.Context): android.content.Context {
	const candidates = ['Theme.Material3.DayNight', 'Theme.Material3.Light', 'Theme.MaterialComponents.Light.Bridge', 'Theme.MaterialComponents.DayNight.Bridge'];
	const resources = context.getResources();
	const pkg = context.getPackageName();
	for (const name of candidates) {
		const id = resources.getIdentifier(name, 'style', pkg);
		if (id !== 0) {
			return new android.view.ContextThemeWrapper(context, id);
		}
	}
	if (Trace.isEnabled()) {
		Trace.write(`TabView: no Material theme found; the navigation uses the app's theme`, traceCategory, Trace.messageType.warn);
	}
	return context;
}
