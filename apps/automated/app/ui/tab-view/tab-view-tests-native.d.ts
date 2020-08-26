//@private
import { TabView } from '@nativescript/core/ui/tab-view';

export function getNativeTabCount(tabView: TabView): number;
export function selectNativeTab(tabView: TabView, index: number): void;
export function getNativeSelectedIndex(tabView: TabView): number;
export function getNativeFont(tabView: TabView): any;
export function getOriginalFont(tabView: TabView): any;
