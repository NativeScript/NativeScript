/// <reference path="./references.d.ts" />
// @ts-nocheck
global.NSString = {
	stringWithString() {
		return {
			intValue: 13,
		};
	},
};
global.UIDevice = {
	currentDevice: {
		systemVersion: '13.0',
	},
};
const cgColors = { CGColor: 1 };
global.UIColor = {
	clearColor: cgColors,
};
global.UIDocumentInteractionController = {
	interactionControllerWithURL(url: any) {
		return null;
	},
};
global.NSURL = {
	fileURLWithPath(path: string) {
		return null;
	},
};
// declare class UIDocumentInteractionController extends NSObject implements UIActionSheetDelegate {

// 	static alloc(): UIDocumentInteractionController; // inherited from NSObject

// 	static interactionControllerWithURL(url: NSURL): UIDocumentInteractionController;

// 	static new(): UIDocumentInteractionController; // inherited from NSObject

// 	URL: NSURL;

// 	UTI: string;

// 	annotation: any;

// 	delegate: UIDocumentInteractionControllerDelegate;

// 	readonly gestureRecognizers: NSArray<UIGestureRecognizer>;

// 	readonly icons: NSArray<UIImage>;

// 	name: string;

// 	readonly debugDescription: string; // inherited from NSObjectProtocol

// 	readonly description: string; // inherited from NSObjectProtocol

// 	readonly hash: number; // inherited from NSObjectProtocol

// 	readonly isProxy: boolean; // inherited from NSObjectProtocol

// 	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

// 	readonly  // inherited from NSObjectProtocol

// 	actionSheetCancel(actionSheet: UIActionSheet): void;

// 	actionSheetClickedButtonAtIndex(actionSheet: UIActionSheet, buttonIndex: number): void;

// 	actionSheetDidDismissWithButtonIndex(actionSheet: UIActionSheet, buttonIndex: number): void;

// 	actionSheetWillDismissWithButtonIndex(actionSheet: UIActionSheet, buttonIndex: number): void;

// 	class(): typeof NSObject;

// 	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

// 	didPresentActionSheet(actionSheet: UIActionSheet): void;

// 	dismissMenuAnimated(animated: boolean): void;

// 	dismissPreviewAnimated(animated: boolean): void;

// 	isEqual(object: any): boolean;

// 	isKindOfClass(aClass: typeof NSObject): boolean;

// 	isMemberOfClass(aClass: typeof NSObject): boolean;

// 	performSelector(aSelector: string): any;

// 	performSelectorWithObject(aSelector: string, object: any): any;

// 	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

// 	presentOpenInMenuFromBarButtonItemAnimated(item: UIBarButtonItem, animated: boolean): boolean;

// 	presentOpenInMenuFromRectInViewAnimated(rect: CGRect, view: UIView, animated: boolean): boolean;

// 	presentOptionsMenuFromBarButtonItemAnimated(item: UIBarButtonItem, animated: boolean): boolean;

// 	presentOptionsMenuFromRectInViewAnimated(rect: CGRect, view: UIView, animated: boolean): boolean;

// 	presentPreviewAnimated(animated: boolean): boolean;

// 	respondsToSelector(aSelector: string): boolean;

// 	retainCount(): number;

// 	self(): this;

// 	willPresentActionSheet(actionSheet: UIActionSheet): void;
// }
