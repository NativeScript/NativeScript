import { View } from '../ui/core/view';

export * from './accessibility-css-helper';
export * from './fontscale-observable';
export * from './accessibility-types';

export function initA11YView(view: View): void;
export function updateAccessibilityProperties(view: View): void;

/**
 * Android helper function for triggering accessiblity events
 */
export function sendAccessibilityEvent(View: View, eventName: string, text?: string): void;

/**
 * Update the content description for android views
 */
export function updateContentDescription(View: View, forceUpdate?: boolean): string | null;

/**
 * Is Android TalkBack or iOS VoiceOver enabled?
 */
export function isAccessibilityServiceEnabled(): boolean;
