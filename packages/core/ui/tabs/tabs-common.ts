// Types
import { Tabs as TabsDefinition } from '.';

// Requires
import { TabNavigationBase } from '../tab-navigation-base/tab-navigation-base';
import { CSSType } from '../core/view';
import { booleanConverter } from '../core/view-base';
import { Property } from '../core/properties';

export * from '../tab-navigation-base/tab-content-item';
export * from '../tab-navigation-base/tab-navigation-base';
export * from '../tab-navigation-base/tab-strip';
export * from '../tab-navigation-base/tab-strip-item';

export const traceCategory = 'TabView';

@CSSType('Tabs')
export class TabsBase extends TabNavigationBase implements TabsDefinition {
	public swipeEnabled: boolean;
	public offscreenTabLimit: number;
	public tabsPosition: 'top' | 'bottom';
	public iOSTabBarItemsAlignment: IOSTabBarItemsAlignment;
}

// TODO: Add Unit tests
export const swipeEnabledProperty = new Property<TabsBase, boolean>({
	name: 'swipeEnabled',
	defaultValue: true,
	valueConverter: booleanConverter,
});
swipeEnabledProperty.register(TabsBase);

// TODO: Add Unit tests
// TODO: Coerce to max number of items?
export const offscreenTabLimitProperty = new Property<TabsBase, number>({
	name: 'offscreenTabLimit',
	defaultValue: 1,
	valueConverter: (v) => parseInt(v),
});
offscreenTabLimitProperty.register(TabsBase);

export const tabsPositionProperty = new Property<TabsBase, 'top' | 'bottom'>({
	name: 'tabsPosition',
	defaultValue: 'top',
});
tabsPositionProperty.register(TabsBase);

export type IOSTabBarItemsAlignment = 'leading' | 'justified' | 'center' | 'centerSelected';
export const iOSTabBarItemsAlignmentProperty = new Property<TabsBase, IOSTabBarItemsAlignment>({ name: 'iOSTabBarItemsAlignment', defaultValue: 'justified' });
iOSTabBarItemsAlignmentProperty.register(TabsBase);

export const animationEnabledProperty = new Property<TabsBase, boolean>({ name: 'animationEnabled', defaultValue: true, valueConverter: booleanConverter });
animationEnabledProperty.register(TabsBase);
