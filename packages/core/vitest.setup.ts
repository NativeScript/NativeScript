// @ts-nocheck
// vitest.setup.ts
import { beforeAll, afterAll, vi } from 'vitest';

vi.mock('@nativescript/core/application', () => null);

// Set up global variable
global.__UNIT_TEST__ = true;
global.__DEV__ = true;
global.__ANDROID__ = false;
global.__IOS__ = true;
global.__VISIONOS__ = false;
global.__APPLE__ = true;
global.__UI_USE_EXTERNAL_RENDERER__ = true;
global.__CSS_USE_CSS_TOOLS__ = true;
global.WeakRef.prototype.get = global.WeakRef.prototype.deref;
global.NativeClass = function () {};
global.NSTimer = class NSTimer {};
global.NSObject = class NSObject {
	static new() {
		return new NSObject();
	}
};
global.NSString = {
	stringWithString() {
		return {
			intValue: 13,
		};
	},
	pathWithComponents(components: string[] | NSArray<string>) {
		return {
			stringByStandardizingPath: '',
		};
	},
};
// global.NSObject = class NSObject {};
global.NSFileManager = {
	defaultManager: {
		fileExistsAtPathIsDirectory(path: string, isDirectory?: boolean) {
			return true;
		},
	},
};
global.NSNotificationCenter = {
	defaultCenter: {
		addObserverSelectorNameObject(observer: any, selector: any, name: any, object: any) {},
	},
};
global.interop = {
	Reference: class Reference {
		constructor(type: any, ref?: boolean) {}
	},
	types: {
		bool: {},
	},
};
global.UIApplication = {
	sharedApplication: {
		statusBarOrientation: 1, // Portrait by default
	},
};
global.UIDevice = {
	currentDevice: {
		systemVersion: '13.0',
	},
};
global.UIScreen = {
	mainScreen: {
		scale: 1,
		bounds: {
			origin: {
				x: 0,
				y: 0,
			},
			size: {
				height: 1000,
				width: 1000,
			},
		},
	},
};
global.UIInterfaceOrientation = {
	Unknown: 0,
	Portrait: 1,
	PortraitUpsideDown: 2,
	LandscapeLeft: 4,
	LandscapeRight: 3,
};
const cgColors = { CGColor: 1 };
global.UIColor = {
	alloc() {
		return {
			initWithRedGreenBlueAlpha(r, g, b, a) {
				return {};
			},
		};
	},
	clearColor: cgColors,
};
global.NSSearchPathDirectory = {
	LibraryDirectory: '',
	DeveloperDirectory: '',
	DesktopDirectory: '',
	DownloadsDirectory: '',
};
global.NativeScriptUtils = {
	createUIFont(descriptor: any) {
		return {};
	},
};
global.NSOperationQueue = {
	mainQueue: {
		addOperationWithBlock(fn: Function) {
			if (fn) {
				fn();
			}
		},
	},
};
global.NSThread = {
	isMainThread: true,
};
global.CFRunLoopGetMain = function () {
	return {};
};
global.kCFRunLoopDefaultMode = 1;
global.CFRunLoopPerformBlock = function (runloop, kCFRunLoopDefaultMode, func) {};
global.CFRunLoopWakeUp = function (runloop) {};

global.NativeScriptGlobals = {
	events: {
		on: (args) => {},
		once: (args) => {},
		off: (args) => {},
		notify: (args) => {},
		hasListeners: (args) => {},
	},
};

global.CADisplayLink = function () {};
global.NSNotification = function () {};
global.UIApplicationDelegate = function () {};
global.UIApplicationDidFinishLaunchingNotification = 'UIApplicationDidFinishLaunchingNotification';
global.UIApplicationDidBecomeActiveNotification = 'UIApplicationDidBecomeActiveNotification';
global.UIApplicationDidEnterBackgroundNotification = 'UIApplicationDidEnterBackgroundNotification';
global.UIApplicationWillTerminateNotification = 'UIApplicationWillTerminateNotification';
global.UIApplicationDidReceiveMemoryWarningNotification = 'UIApplicationDidReceiveMemoryWarningNotification';
global.UIApplicationDidChangeStatusBarOrientationNotification = 'UIApplicationDidChangeStatusBarOrientationNotification';
global.UIResponder = function () {};
global.UIResponder.extend = function () {};
global.UIViewController = function () {};
global.UIViewControllerTransitioningDelegate = function () {};
global.UIGestureRecognizer = function () {};
global.UIGestureRecognizerDelegate = function () {};
global.UIAdaptivePresentationControllerDelegate = function () {};
global.UIPopoverPresentationControllerDelegate = function () {};
global.UIContentSizeCategoryExtraSmall = 0.5;
global.UIContentSizeCategorySmall = 0.7;
global.UIContentSizeCategoryMedium = 0.85;
global.UIContentSizeCategoryLarge = 1;
global.UIContentSizeCategoryExtraLarge = 1.15;
global.UIContentSizeCategoryExtraExtraLarge = 1.3;
global.UIContentSizeCategoryExtraExtraExtraLarge = 1.5;
global.UIContentSizeCategoryAccessibilityMedium = 2;
global.UIContentSizeCategoryAccessibilityLarge = 2.5;
global.UIContentSizeCategoryAccessibilityExtraLarge = 3;
global.UIContentSizeCategoryAccessibilityExtraExtraLarge = 3.5;
global.UIContentSizeCategoryAccessibilityExtraExtraExtraLarge = 4;
// global.UIDocumentInteractionController = {
// 	interactionControllerWithURL(url: any) {
// 		return null;
// 	},
// };
// global.NSURL = {
// 	fileURLWithPath(path: string) {
// 		return null;
// 	},
// };
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

// Example of a lifecycle hook
beforeAll(() => {
	console.log('Setting up tests...');
});

afterAll(() => {
	console.log('Cleaning up after tests...');
});
