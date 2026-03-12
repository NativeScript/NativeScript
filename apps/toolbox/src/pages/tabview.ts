import { EventData, Observable, Page, Color, TabView, TabViewItem, StackLayout, Label, Utils, GridLayout, ItemSpec } from '@nativescript/core';

class TabViewDemoModel extends Observable {
	private page: Page;
	private tabView: TabView;

	init(page: Page) {
		this.page = page;
		this.tabView = page.getViewById('demoTabView') as TabView;

		// Ensure initial font icon family so initial font:// icons render as expected
		this.applyFontFamily('ns-playground-font');

		// Give an initial color to demonstrate colorization of font icons
		this.applyItemColor(new Color('#65ADF1'));
	}

	useSysIcons = () => {
		if (!this.tabView || !this.tabView.items) return;

		// Common SF Symbol names on iOS. Android will not render sys:// and this is expected.
		const sysIcons = ['house.fill', 'star.fill', 'gearshape.fill'];
		this.setIcons(sysIcons.map((name) => `sys://${name}`));
	};

	useFontIcons = () => {
		if (!this.tabView || !this.tabView.items) return;

		// Use simple glyphs A/B/C for reliability across fonts
		const fontIcons = ['A', 'B', 'C'].map((c) => `font://${c}`);
		this.setIcons(fontIcons);
		this.applyFontFamily('ns-playground-font');
	};

	clearIcons = () => {
		if (!this.tabView || !this.tabView.items) return;
		this.tabView.items.forEach((item) => {
			item.iconSource = undefined;
		});
	};

	private setIcons(iconSources: string[]) {
		const items = this.tabView.items as TabViewItem[];
		let isSystemIcons: boolean;
		for (let i = 0; i < items.length; i++) {
			const iconSource = iconSources[i % iconSources.length];
			items[i].iconSource = iconSource;
			if (iconSource.startsWith(Utils.SYSTEM_PREFIX)) {
				isSystemIcons = true;
			}
		}
		if (__APPLE__) {
			this.tabView.tabTextFontSize = isSystemIcons ? 11 : null;
		}
	}

	private applyFontFamily(family: string) {
		if (!this.tabView || !this.tabView.items) return;
		(this.tabView.items as TabViewItem[]).forEach((item) => {
			// Use indexer to avoid TS typing gap in core .d.ts
			(item as any)['iconFontFamily'] = family; // explicit per-item
		});
	}

	private applyItemColor(color: Color) {
		(this.tabView.items as TabViewItem[]).forEach((item) => {
			item.style.color = color;
		});
	}

	// iOS bottom accessory demo (iOS 26+). Safe to call on other platforms; will be ignored.
	attachBottomAccessory = () => {
		if (!this.tabView) return;
		const root = new GridLayout();

		// root.backgroundColor = new Color('green');
		root.iosOverflowSafeArea = false;
		root.padding = 12;
		root.width = { unit: '%', value: 100 };
		root.height = 56; // ensure visible height
		const label = new Label();
		// label.backgroundColor = new Color('red');
		label.text = 'Bottom Accessory (iOS 26+)';
		label.color = new Color('#000');
		label.textAlignment = 'center';
		GridLayout.setColumn(label, 0);
		GridLayout.setRow(label, 0);
		root.addChild(label);
		this.tabView.iosBottomAccessory = root;
	};

	clearBottomAccessory = () => {
		if (!this.tabView) return;
		this.tabView.iosBottomAccessory = null;
	};

	setMinimizeScrollDown = () => {
		if (!this.tabView) return;
		this.tabView.iosTabBarMinimizeBehavior = 'onScrollDown';
	};

	setMinimizeNever = () => {
		if (!this.tabView) return;
		this.tabView.iosTabBarMinimizeBehavior = 'never';
	};
}

const vm = new TabViewDemoModel();

export function navigatingTo(args: EventData) {
	const page = args.object as Page;
	page.bindingContext = vm;
	vm.init(page);
}
