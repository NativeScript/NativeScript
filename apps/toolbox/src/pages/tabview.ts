import { EventData, Observable, Page, Color, TabView, TabViewItem } from '@nativescript/core';

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
			(item as TabViewItem).iconSource = undefined;
		});
	};

	randomizeColors = () => {
		if (!this.tabView || !this.tabView.items) return;
		this.tabView.items.forEach((item) => {
			const color = new Color(this.randomColor());
			(item as TabViewItem).style.color = color;
		});
	};

	private setIcons(iconSources: string[]) {
		const items = this.tabView.items as TabViewItem[];
		for (let i = 0; i < items.length; i++) {
			items[i].iconSource = iconSources[i % iconSources.length];
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
			(item as TabViewItem).style.color = color;
		});
	}

	private randomColor(): string {
		const r = Math.floor(Math.random() * 200 + 30);
		const g = Math.floor(Math.random() * 200 + 30);
		const b = Math.floor(Math.random() * 200 + 30);
		return `#${this.toHex(r)}${this.toHex(g)}${this.toHex(b)}`;
	}

	private toHex(n: number) {
		return n.toString(16).padStart(2, '0');
	}
}

const vm = new TabViewDemoModel();

export function navigatingTo(args: EventData) {
	const page = args.object as Page;
	page.bindingContext = vm;
	vm.init(page);
}
