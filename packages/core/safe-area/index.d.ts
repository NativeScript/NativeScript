import { Observable } from '../data/observable';
import type { SafeAreaInsets, SafeAreaInsetsChangedEventData } from './safe-area-interfaces';

export * from './safe-area-interfaces';

export declare const ZERO_INSETS: SafeAreaInsets;

/**
 * The window insets backing the css `safe-area-inset-*` environment variables. Values
 * are identical for every view, as the spec describes the viewport, not an element.
 *
 * @see https://drafts.csswg.org/css-env-1/#safe-area-insets
 */
export declare class SafeAreaCommon extends Observable {
	static insetsChangedEvent: string;

	/**
	 * The area the system UI covers, in dip. Includes the system bars and the display
	 * cutout, and excludes the keyboard.
	 */
	readonly insets: SafeAreaInsets;

	/**
	 * The largest inset seen on each edge so far, backing `env(safe-area-max-inset-*)`.
	 * Neither platform reports the true maximum, so this converges on it as the device
	 * is used - typically after the first rotation.
	 */
	readonly maxInsets: SafeAreaInsets;

	/**
	 * Whether a view that insets itself marks those edges consumed for its subtree, so
	 * `env(ns-safe-area-inset-*)` and `View.getRemainingSafeAreaInsets` report what is
	 * left rather than the window value.
	 *
	 * Off by default: turning it on changes what existing layouts inset. The
	 * platform-specific properties (`iosIgnoreSafeArea`, `iosOverflowSafeArea`,
	 * `androidOverflowEdge`) keep precedence either way.
	 */
	trackConsumption: boolean;

	/**
	 * Re-reads the insets from the platform.
	 * @returns Whether anything changed.
	 */
	refresh(): boolean;

	/**
	 * Raised after the insets change, once the css `env()` values have been updated.
	 */
	on(event: 'insetsChanged', callback: (data: SafeAreaInsetsChangedEventData) => void, thisArg?: any): void;
}

export declare const SafeArea: SafeAreaCommon;
