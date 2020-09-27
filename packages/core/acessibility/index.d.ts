import { View } from '../ui/core/view';

export * from './accessibility-css-helper';
export * from './fontscale-observable';
export * from './accessibility-types';

export function initA11YView(view: View): void;
export function updateAccessibilityProperties(view: View): void;
export function sendAccessibilityEvent(View: View, eventName: string, text?: string): void;
export function updateContentDescription(View: View, forceUpdate?: boolean): string | null;
export function isAccessibilityServiceEnabled(): boolean;
