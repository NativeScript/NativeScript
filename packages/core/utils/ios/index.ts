import { Application } from '../../application';
import { Color } from '../../color';
import { Trace } from '../../trace';
import { CORE_ANIMATION_DEFAULTS, getDurationWithDampingFromSpring } from '../common';

declare let UIImagePickerControllerSourceType: any;

const radToDeg = Math.PI / 180;

function isOrientationLandscape(orientation: number) {
	return orientation === UIDeviceOrientation.LandscapeLeft /* 3 */ || orientation === UIDeviceOrientation.LandscapeRight /* 4 */;
}

function openFileAtRootModule(filePath: string): boolean {
	try {
		const appPath = getCurrentAppPath();
		const path = isRealDevice() ? filePath.replace('~', appPath) : filePath;

		const controller = UIDocumentInteractionController.interactionControllerWithURL(NSURL.fileURLWithPath(path));
		controller.delegate = createUIDocumentInteractionControllerDelegate();

		return controller.presentPreviewAnimated(true);
	} catch (e) {
		Trace.write('Error in openFile', Trace.categories.Error, Trace.messageType.error);
	}

	return false;
}
// TODO: remove for NativeScript 9.0
export function getter<T>(_this: any, property: T | { (): T }): T {
	console.log('utils.ios.getter() is deprecated; use the respective native property instead');
	if (typeof property === 'function') {
		return (<{ (): T }>property).call(_this);
	} else {
		return <T>property;
	}
}

export namespace collections {
	export function jsArrayToNSArray<T>(str: T[]): NSArray<T> {
		return NSArray.arrayWithArray(str);
	}

	export function nsArrayToJSArray<T>(a: NSArray<T>): Array<T> {
		const arr = [];
		if (a !== undefined) {
			const count = a.count;
			for (let i = 0; i < count; i++) {
				arr.push(a.objectAtIndex(i));
			}
		}

		return arr;
	}
}

export function getRootViewController(): UIViewController {
	const win = getWindow();
	let vc = win && win.rootViewController;
	while (vc && vc.presentedViewController) {
		vc = vc.presentedViewController;
	}
	return vc;
}

export function getWindow(): UIWindow {
	const app = UIApplication.sharedApplication;
	if (!app) {
		return;
	}
	return app.keyWindow || (app.windows && app.windows.count > 0 && app.windows.objectAtIndex(0));
}

export function setWindowBackgroundColor(value: string) {
	const win = getWindow();
	if (win) {
		const bgColor = new Color(value);
		win.backgroundColor = bgColor.ios;
		const rootVc = getRootViewController();
		if (rootVc?.view) {
			rootVc.view.backgroundColor = bgColor.ios;
		}
	}
}

export function isLandscape(): boolean {
	console.log('utils.ios.isLandscape() is deprecated; use application.orientation instead');

	const deviceOrientation = UIDevice.currentDevice.orientation;
	const statusBarOrientation = UIApplication.sharedApplication.statusBarOrientation;

	const isDeviceOrientationLandscape = isOrientationLandscape(deviceOrientation);
	const isStatusBarOrientationLandscape = isOrientationLandscape(statusBarOrientation);

	return isDeviceOrientationLandscape || isStatusBarOrientationLandscape;
}

/**
 * @deprecated use Utils.SDK_VERSION instead which is a float of the {major}.{minor} verison
 */
export const MajorVersion = NSString.stringWithString(UIDevice.currentDevice.systemVersion).intValue;

export function openFile(filePath: string): boolean {
	console.log('utils.ios.openFile() is deprecated; use utils.openFile() instead');

	return openFileAtRootModule(filePath);
}

export function getCurrentAppPath(): string {
	const currentDir = __dirname;
	const tnsModulesIndex = currentDir.indexOf('/tns_modules');

	// Module not hosted in ~/tns_modules when bundled. Use current dir.
	let appPath = currentDir;
	if (tnsModulesIndex !== -1) {
		// Strip part after tns_modules to obtain app root
		appPath = currentDir.substring(0, tnsModulesIndex);
	}

	return appPath;
}

export function joinPaths(...paths: string[]): string {
	if (!paths || paths.length === 0) {
		return '';
	}

	return NSString.stringWithString(NSString.pathWithComponents(<any>paths)).stringByStandardizingPath;
}

export function getVisibleViewController(rootViewController: UIViewController): UIViewController {
	let viewController = rootViewController;

	while (viewController && viewController.presentedViewController) {
		viewController = viewController.presentedViewController;
	}
	return viewController;
}

export function applyRotateTransform(transform: CATransform3D, x: number, y: number, z: number): CATransform3D {
	if (x) {
		transform = CATransform3DRotate(transform, x * radToDeg, 1, 0, 0);
	}

	if (y) {
		transform = CATransform3DRotate(transform, y * radToDeg, 0, 1, 0);
	}

	if (z) {
		transform = CATransform3DRotate(transform, z * radToDeg, 0, 0, 1);
	}

	return transform;
}

export function createUIDocumentInteractionControllerDelegate(): NSObject {
	@NativeClass
	class UIDocumentInteractionControllerDelegateImpl extends NSObject implements UIDocumentInteractionControllerDelegate {
		public static ObjCProtocols = [UIDocumentInteractionControllerDelegate];
		viewController: UIViewController;
		public getViewController(): UIViewController {
			if (!this.viewController) {
				//TODO: refactor to give access to that code to plugins
				let rootView = Application.getRootView();
				if (rootView.parent) {
					rootView = rootView.parent as any;
				}
				let currentView = rootView;
				currentView = currentView.modal || currentView;
				let viewController = currentView.viewController;
				if (!viewController.presentedViewController && rootView.viewController.presentedViewController) {
					viewController = rootView.viewController.presentedViewController;
				}
				while (viewController.presentedViewController) {
					while (viewController.presentedViewController instanceof UIAlertController || (viewController.presentedViewController['isAlertController'] && viewController.presentedViewController.presentedViewController)) {
						viewController = viewController.presentedViewController;
					}
					if (viewController.presentedViewController instanceof UIAlertController || viewController.presentedViewController['isAlertController']) {
						break;
					} else {
						viewController = viewController.presentedViewController;
					}
				}
				this.viewController = viewController;
			}
			return this.viewController;
		}

		public documentInteractionControllerViewControllerForPreview(controller: UIDocumentInteractionController) {
			return this.getViewController();
		}

		public documentInteractionControllerViewForPreview(controller: UIDocumentInteractionController) {
			return this.getViewController().view;
		}

		public documentInteractionControllerRectForPreview(controller: UIDocumentInteractionController): CGRect {
			return this.getViewController().view.frame;
		}
	}
	return new UIDocumentInteractionControllerDelegateImpl();
}

export function isRealDevice() {
	try {
		// https://stackoverflow.com/a/5093092/4936697
		const sourceType = UIImagePickerControllerSourceType.UIImagePickerControllerSourceTypeCamera;
		const mediaTypes = UIImagePickerController.availableMediaTypesForSourceType(sourceType);

		return !!mediaTypes;
	} catch (e) {
		return true;
	}
}

export function printCGRect(rect: CGRect) {
	if (rect) {
		return `CGRect(${rect.origin.x} ${rect.origin.y} ${rect.size.width} ${rect.size.height})`;
	}
}

export function snapshotView(view: UIView, scale: number): UIImage {
	if (view instanceof UIImageView) {
		return view.image;
	}
	// console.log('snapshotView view.frame:', printRect(view.frame));
	const originalOpacity = view.layer.opacity;
	view.layer.opacity = originalOpacity > 0 ? originalOpacity : 1;
	UIGraphicsBeginImageContextWithOptions(CGSizeMake(view.frame.size.width, view.frame.size.height), false, scale);
	view.layer.renderInContext(UIGraphicsGetCurrentContext());
	const image = UIGraphicsGetImageFromCurrentImageContext();
	UIGraphicsEndImageContext();
	setTimeout(() => {
		// ensure set back properly on next tick
		view.layer.opacity = originalOpacity;
	});
	return image;
}

export function copyLayerProperties(view: UIView, toView: UIView, customProperties?: { view?: Array<keyof UIView>; layer?: Array<keyof CALayer> }) {
	const viewPropertiesToMatch: Array<keyof UIView> = customProperties?.view || ['backgroundColor'];
	const layerPropertiesToMatch: Array<keyof CALayer> = customProperties?.layer || ['cornerRadius', 'borderWidth', 'borderColor'];

	viewPropertiesToMatch.forEach((property) => {
		if (view[property] !== toView[property]) {
			// console.log('|    -- matching view property:', property);
			view[property as any] = toView[property];
		}
	});

	layerPropertiesToMatch.forEach((property) => {
		if (view.layer[property] !== toView.layer[property]) {
			// console.log('|    -- matching layer property:', property);
			view.layer[property as any] = toView.layer[property];
		}
	});
}

export function animateWithSpring(options?: { tension?: number; friction?: number; mass?: number; delay?: number; velocity?: number; animateOptions?: UIViewAnimationOptions; animations?: () => void; completion?: (finished?: boolean) => void }) {
	// for convenience, default spring settings are provided
	const opt = {
		...CORE_ANIMATION_DEFAULTS.spring,
		delay: 0,
		animateOptions: null,
		animations: null,
		completion: null,
		...(options || {}),
	};
	const { duration, damping } = getDurationWithDampingFromSpring(opt);

	if (duration === 0) {
		UIView.animateWithDurationAnimationsCompletion(0, opt.animations, opt.completion);
		return;
	}
	UIView.animateWithDurationDelayUsingSpringWithDampingInitialSpringVelocityOptionsAnimationsCompletion(duration, opt.delay, damping, opt.velocity, opt.animateOptions, opt.animations, opt.completion);
}
