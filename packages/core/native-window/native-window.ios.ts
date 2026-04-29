import type { View } from '../ui/core/view';
import { IOSHelper } from '../ui/core/view/view-helper';
import { SDK_VERSION } from '../utils/constants';
import { CoreTypes } from '../core-types';
import { NativeWindow } from './native-window-common';
import { NativeWindowEvents } from './native-window-interfaces';

/**
 * iOS implementation of NativeWindow.
 * Wraps a UIWindowScene + UIWindow pair.
 */
export class IOSNativeWindow extends NativeWindow {
	private _scene: UIWindowScene;
	private _window: UIWindow;

	constructor(scene: UIWindowScene, window: UIWindow, id: string, isPrimary = false) {
		super(id, isPrimary);
		this._scene = scene;
		this._window = window;
	}

	get iosWindow() {
		return {
			scene: this._scene,
			window: this._window,
		};
	}

	/**
	 * Platform-specific: set the view as root content of this UIWindow.
	 */
	protected _setNativeContent(view: View): void {
		const controller = this._getViewController(view);
		this._setViewControllerView(view);

		const haveController = this._window.rootViewController !== null;
		this._window.rootViewController = controller;

		if (!haveController) {
			this._window.makeKeyAndVisible();
		}

		// Listen for trait collection changes per-window
		view.on(IOSHelper.traitCollectionColorAppearanceChangedEvent, () => {
			const userInterfaceStyle = controller.traitCollection.userInterfaceStyle;
			this._setSystemAppearance(this._getSystemAppearanceValue(userInterfaceStyle));
		});

		view.on(IOSHelper.traitCollectionLayoutDirectionChangedEvent, () => {
			const layoutDirection = controller.traitCollection.layoutDirection;
			this._setLayoutDirection(this._getLayoutDirectionValue(layoutDirection));
		});
	}

	/**
	 * Close this window/scene.
	 */
	close(): void {
		if (this.isPrimary) {
			console.log('NativeWindow: Cannot close the primary window.');
			return;
		}

		const session = this._scene?.session;
		if (!session) {
			console.log('NativeWindow: Scene has no session to destroy.');
			return;
		}

		const app = UIApplication.sharedApplication;
		if (app.requestSceneSessionDestructionOptionsErrorHandler) {
			app.requestSceneSessionDestructionOptionsErrorHandler(session, null, (error: NSError) => {
				if (error) {
					console.log('NativeWindow: Error destroying scene session:', error.localizedDescription);
				}
			});
		} else {
			console.log('NativeWindow: Scene destruction API not available on this iOS version.');
		}
	}

	// --- Platform getters ---

	protected _getOrientation(): 'portrait' | 'landscape' | 'unknown' {
		if (__VISIONOS__) {
			return this._getOrientationValue(NativeScriptEmbedder.sharedInstance().windowScene?.interfaceOrientation);
		}
		if (this._scene) {
			return this._getOrientationValue(this._scene.interfaceOrientation);
		}
		return this._getOrientationValue(UIApplication.sharedApplication.statusBarOrientation);
	}

	protected _getSystemAppearance(): 'light' | 'dark' | null {
		if (!__VISIONOS__ && SDK_VERSION <= 11) {
			return null;
		}
		const rootVC = this._window?.rootViewController;
		if (!rootVC) {
			return null;
		}
		return this._getSystemAppearanceValue(rootVC.traitCollection.userInterfaceStyle);
	}

	protected _getLayoutDirection(): CoreTypes.LayoutDirectionType | null {
		const rootVC = this._window?.rootViewController;
		if (!rootVC) {
			return null;
		}
		return this._getLayoutDirectionValue(rootVC.traitCollection.layoutDirection);
	}

	// --- Value converters ---

	private _getOrientationValue(orientation: number): 'portrait' | 'landscape' | 'unknown' {
		switch (orientation) {
			case UIInterfaceOrientation.LandscapeRight:
			case UIInterfaceOrientation.LandscapeLeft:
				return 'landscape';
			case UIInterfaceOrientation.PortraitUpsideDown:
			case UIInterfaceOrientation.Portrait:
				return 'portrait';
			case UIInterfaceOrientation.Unknown:
			default:
				return 'unknown';
		}
	}

	_getSystemAppearanceValue(userInterfaceStyle: number): 'dark' | 'light' {
		switch (userInterfaceStyle) {
			case UIUserInterfaceStyle.Dark:
				return 'dark';
			case UIUserInterfaceStyle.Light:
			case UIUserInterfaceStyle.Unspecified:
			default:
				return 'light';
		}
	}

	_getLayoutDirectionValue(layoutDirection: number): CoreTypes.LayoutDirectionType {
		switch (layoutDirection) {
			case UITraitEnvironmentLayoutDirection.RightToLeft:
				return CoreTypes.LayoutDirection.rtl;
			case UITraitEnvironmentLayoutDirection.LeftToRight:
			default:
				return CoreTypes.LayoutDirection.ltr;
		}
	}

	// --- ViewController helpers ---

	private _getViewController(rootView: View): UIViewController {
		let viewController: UIViewController = rootView.viewController || rootView.ios;

		if (!(viewController instanceof UIViewController)) {
			viewController = IOSHelper.UILayoutViewController.initWithOwner(new WeakRef(rootView)) as UIViewController;
			rootView.viewController = viewController;
		}

		return viewController;
	}

	private _setViewControllerView(view: View): void {
		const viewController: UIViewController = view.viewController || view.ios;
		const nativeView = view.ios || view.nativeViewProtected;

		if (!nativeView || !viewController) {
			throw new Error('Root should be either UIViewController or UIView');
		}

		if (viewController instanceof IOSHelper.UILayoutViewController) {
			viewController.view.addSubview(nativeView);
		}
	}

	/**
	 * @internal
	 */
	_destroy(): void {
		// Remove trait collection listeners from root view before destroying
		if (this._rootView) {
			this._rootView.off(IOSHelper.traitCollectionColorAppearanceChangedEvent);
			this._rootView.off(IOSHelper.traitCollectionLayoutDirectionChangedEvent);
		}
		super._destroy();
		this._scene = null;
		this._window = null;
	}

	/**
	 * Gets the stable scene identifier.
	 */
	static getSceneId(scene: UIWindowScene): string {
		try {
			if (!scene) {
				return 'unknown';
			}
			const session = scene.session;
			const persistentId = session?.persistentIdentifier;
			if (persistentId) {
				return `${persistentId}`;
			}
			if (scene.hash != null) {
				return `${scene.hash}`;
			}
			const desc = scene.description;
			if (desc) {
				return `${desc}`;
			}
		} catch {
			// ignore
		}
		return 'unknown';
	}
}
