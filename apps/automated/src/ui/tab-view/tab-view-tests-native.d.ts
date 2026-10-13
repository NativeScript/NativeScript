//@private
import { TabView } from '@nativescript/core/ui/tab-view';

export function getNativeTabCount(tabView: TabView): number;
export function selectNativeTab(tabView: TabView, index: number): void;
export function getNativeSelectedIndex(tabView: TabView): number;
/** `undefined` where the platform has no prominent tab (Android, iOS < 27). */
export function getNativeProminentTabIdentifier(tabView: TabView): string | null | undefined;
export function getNativeFont(tabView: TabView): any;
export function getOriginalFont(tabView: TabView): any;
