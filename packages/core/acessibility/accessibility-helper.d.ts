import { ViewBase, Observable } from '../ui/core/view-base/view-base';

export declare class AccessibilityHelper {
	public static initA11YView(view: ViewBase): void;
	public static updateAccessibilityProperties(view: ViewBase): void;
	public static sendAccessibilityEvent(View: ViewBase, eventName: string, text?: string): void;
	public static updateContentDescription(View: ViewBase, forceUpdate?: boolean): string;
	public static isAccessibilityServiceEnabled(): boolean;
}
