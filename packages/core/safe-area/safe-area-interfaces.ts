import type { EventData } from '../data/observable';

/**
 * Window insets, in device independent pixels, describing the area the system UI covers.
 */
export interface SafeAreaInsets {
	readonly top: number;
	readonly right: number;
	readonly bottom: number;
	readonly left: number;
}

export interface SafeAreaInsetsChangedEventData extends EventData {
	readonly insets: SafeAreaInsets;
	readonly previousInsets: SafeAreaInsets;
}
