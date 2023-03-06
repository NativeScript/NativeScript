import type { Page } from '../ui/page';
import type { View } from '../ui/core/view';
import type { AndroidAccessibilityEvent } from './accessibility-types';

export * from './accessibility-common';
export * from './accessibility-types';
export * from './font-scale';

/**
 * Initialize accessibility for View. This should be called on loaded-event.
 */
export function setupAccessibleView(view: View): void;

/**
 * Update accessibility properties on nativeView
 */
export function updateAccessibilityProperties(view: View): void;

/**
 * Android: helper function for triggering accessibility events
 */
export function sendAccessibilityEvent(View: View, eventName: AndroidAccessibilityEvent, text?: string): void;

/**
 * Android: Update the content description for views
 */
export function updateContentDescription(View: View, forceUpdate?: boolean): string | null;

/**
 * Is Android TalkBack or iOS VoiceOver enabled?
 */
export function isAccessibilityServiceEnabled(): boolean;

/**
 * Find the last view focused on a page.
 */
export function getLastFocusedViewOnPage(page: Page): View | null;
