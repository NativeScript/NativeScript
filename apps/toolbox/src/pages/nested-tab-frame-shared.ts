import { Button, Frame, Label, Page, ScrollView, StackLayout, TabView, TabViewItem, Trace } from '@nativescript/core';

/**
 * Playground for a Frame hosted as a TabViewItem view (issue #11444): every tab frame mounts
 * its first page in `loaded`, and the inner pages expose the navigation and frame-stack
 * probes used to reproduce the reported stalls.
 */
export interface NestedTabFrameOptions {
	tabCount: number;
	androidOffscreenTabLimit?: number;
}

const TITLES = ['Home', 'Demos', 'Third', 'Fourth'];

export const registry = { tabView: null as TabView, frames: [] as Frame[] };

export function log(msg: string) {
	console.log(`[NTF] ${msg}`);
}

export function describe(frame: Frame): string {
	const f = frame as any;
	return `isLoaded=${frame.isLoaded} current=${frame.currentPage ? frame.currentPage.id : null} backStack=${frame.backStack.length} executing=${!!f._executingContext} queue=${f._navigationQueue.length} inStack=${f._isInFrameStack}`;
}

export function makePage(frame: Frame, depth: number): Page {
	const page = new Page();
	page.id = `${frame.id}-page${depth}`;
	page.actionBarHidden = true;
	const stack = new StackLayout();
	stack.className = 'p-20';

	const label = new Label();
	label.text = `${page.id}`;
	label.className = 'h2 text-center';
	stack.addChild(label);

	const addButton = (text: string, cls: string, onTap: () => void) => {
		const btn = new Button();
		btn.text = text;
		btn.className = cls;
		btn.on('tap', onTap);
		stack.addChild(btn);
	};

	addButton(`Push page ${depth + 1}`, 'btn btn-primary', () => {
		log(`push from ${page.id}: ${describe(frame)}`);
		frame.navigate({ create: () => makePage(frame, depth + 1) });
		log(`after push: ${describe(frame)}`);
	});
	addButton(`Push page ${depth + 1} (animated=false)`, 'btn btn-primary', () => {
		log(`push (no anim) from ${page.id}: ${describe(frame)}`);
		frame.navigate({ create: () => makePage(frame, depth + 1), animated: false });
		log(`after push: ${describe(frame)}`);
	});
	addButton('Go back', 'btn btn-outline', () => {
		log(`goBack from ${page.id}: canGoBack=${frame.canGoBack()} ${describe(frame)}`);
		frame.goBack();
		log(`after goBack: ${describe(frame)}`);
	});
	addButton('Log status', 'btn btn-outline', () => {
		log(`status ${frame.id}: ${describe(frame)} topmost=${Frame.topmost()?.id}`);
	});
	addButton('callLoaded() workaround', 'btn btn-outline', () => {
		frame.callLoaded();
		log(`after callLoaded: ${describe(frame)}`);
	});
	registry.frames.forEach((f, i) => {
		addButton(`Select tab ${TITLES[i]}`, 'btn btn-outline', () => {
			log(`programmatic select tab ${i} (${TITLES[i]}) from ${page.id}; topmost=${Frame.topmost()?.id}`);
			registry.tabView.selectedIndex = i;
			log(`after select: ${TITLES[i]} ${describe(registry.frames[i])} topmost=${Frame.topmost()?.id}`);
		});
	});
	addButton('Frame.topmost().navigate()', 'btn btn-outline', () => {
		const top = Frame.topmost() as Frame;
		log(`topmost navigate: topmost=${top?.id} (this page's frame=${frame.id}) before ${describe(top)}`);
		top.navigate({ create: () => makePage(top, (top.backStack.length || 0) + 2) });
		log(`after topmost navigate: ${describe(top)}`);
	});
	addButton('Frame.topmost().goBack()', 'btn btn-outline', () => {
		const top = Frame.topmost() as Frame;
		log(`topmost goBack: topmost=${top?.id} canGoBack=${top?.canGoBack()} ${describe(top)}`);
		top.goBack();
		log(`after topmost goBack: ${describe(top)}`);
	});
	addButton('Reassign items (new array)', 'btn btn-outline', () => {
		const tv = registry.tabView;
		log(`reassign items: selectedIndex=${tv.selectedIndex} before ${describe(frame)}`);
		tv.items = [...tv.items];
		log(`after reassign: selectedIndex=${tv.selectedIndex} ${describe(frame)} topmost=${Frame.topmost()?.id}`);
	});
	addButton('Log all frames', 'btn btn-outline', () => {
		registry.frames.forEach((f) => log(`  ${f.id}: ${describe(f)}`));
		log(
			`  topmost=${Frame.topmost()?.id} stack=[${(Frame as any)
				._stack()
				.map((f: Frame) => f.id)
				.join(', ')}]`,
		);
	});
	addButton('Select next tab + push there', 'btn btn-outline', () => {
		const n = registry.frames.length;
		const i = (registry.tabView.selectedIndex + 1) % n;
		const target = registry.frames[i];
		log(`select next tab ${i} + push: before ${describe(target)}`);
		registry.tabView.selectedIndex = i;
		log(`after select: ${describe(target)} topmost=${Frame.topmost()?.id}`);
		target.navigate({ create: () => makePage(target, (target.backStack.length || 0) + 2) });
		log(`after push on ${target.id}: ${describe(target)}`);
	});
	addButton('Push + switch tab', 'btn btn-outline', () => {
		const n = registry.frames.length;
		const i = (registry.tabView.selectedIndex + 1) % n;
		log(`push on ${frame.id} then switch to tab ${i}`);
		frame.navigate({ create: () => makePage(frame, depth + 1) });
		registry.tabView.selectedIndex = i;
		log(`after push+switch: ${describe(frame)} topmost=${Frame.topmost()?.id}`);
	});

	const scroll = new ScrollView();
	scroll.content = stack;
	page.content = scroll;
	page.on('loaded', () => log(`${page.id} loaded; frame ${describe(frame)}`));
	page.on('unloaded', () => log(`${page.id} unloaded; frame ${describe(frame)}`));
	page.on('navigatedTo', () => log(`${page.id} navigatedTo; frame ${describe(frame)}`));
	return page;
}

export function buildTabView(opts: NestedTabFrameOptions): TabView {
	Trace.enable();
	Trace.addCategories(Trace.categories.concat(Trace.categories.Navigation, Trace.categories.Transition, Trace.categories.NativeLifecycle));

	const tabView = new TabView();
	if (opts.androidOffscreenTabLimit !== undefined) {
		tabView.androidOffscreenTabLimit = opts.androidOffscreenTabLimit;
	}
	registry.tabView = tabView;
	registry.frames = [];
	const items: TabViewItem[] = [];
	for (const title of TITLES.slice(0, opts.tabCount)) {
		const item = new TabViewItem();
		item.title = title;
		const frame = new Frame();
		frame.id = `frame-${title}`;
		frame.on('loaded', () => {
			log(`${frame.id} loaded: ${describe(frame)}`);
			if (!frame.currentPage && !(frame as any)._executingContext && (frame as any)._navigationQueue.length === 0) {
				log(`${frame.id} mounting initial page`);
				frame.navigate({ create: () => makePage(frame, 1) });
			}
		});
		frame.on('unloaded', () => log(`${frame.id} unloaded: ${describe(frame)}`));
		item.view = frame;
		items.push(item);
		registry.frames.push(frame);
	}
	tabView.items = items;
	tabView.on('selectedIndexChanged', (a: any) => log(`tab selectedIndexChanged ${a.oldIndex} -> ${a.newIndex}`));
	tabView.on('loaded', () => log(`tabView loaded`));
	tabView.on('unloaded', () => log(`tabView unloaded`));
	return tabView;
}

export function setupPage(page: Page, opts: NestedTabFrameOptions) {
	log(`---- setup ${JSON.stringify(opts)} ----`);
	page.content = buildTabView(opts);
}
