import type { View } from '../ui/core/view';
import { IOSHelper } from '../ui/core/view/view-helper';
import { SDK_VERSION } from '../utils/constants';
import { CoreTypes } from '../core-types';
import { Trace } from '../trace';
import { NativeWindow } from './native-window-common';
import { NativeWindowEvents } from './native-window-interfaces';
import type { WindowRole } from './window-base';

/**
 * iOS implementation of NativeWindow.
 * Wraps a UIWindow and, when the app is scene-based, the UIWindowScene hosting it.
 */
export class IOSNativeWindow extends NativeWindow {
	private _scene: UIWindowScene | undefined;
	private _window: UIWindow;

	/**
	 * @internal – set while a scene session destruction request is in flight, so the
	 * following scene disconnect is read as a close rather than a detach.
	 */
	_closeRequested = false;

	/**
	 * @internal – whether the id comes from a scene session identity. Without one the
	 * window cannot be matched to a reconnecting session or to a discarded one.
	 */
	_hasSessionIdentity: boolean;

	constructor(scene: UIWindowScene | undefined, window: UIWindow, id?: string, isPrimary = false, role: WindowRole = 'application') {
		super(id, isPrimary, role);

		// Only an id taken from the scene's session can be matched back to that session.
		// Hand-minted ids ('main', 'embedded-main') are ids all the same, so their mere
		// presence says nothing.
		const sessionId = scene?.session?.persistentIdentifier;
		this._hasSessionIdentity = !!sessionId && id === `${sessionId}`;
		this._scene = scene;
		this._window = window;
	}

	/**
	 * @internal – bind a new scene/window pair to this window session after a detach.
	 */
	_reattach(scene: UIWindowScene, uiWindow: UIWindow): void {
		this._scene = scene;
		this._window = uiWindow;
		this._setState('attached');
	}

	get ios() {
		return {
			scene: this._scene,
			uiWindow: this._window,
		};
	}

	/**
	 * Platform-specific: set the view as root content of this UIWindow.
	 */
	protected _setNativeContent(view: View): void {
		const controller = this._getViewController(view);
		this._setViewControllerView(view);

		if (this.role === 'embedded') {
			// The host app owns this UIWindow: its rootViewController and key/visible state
			// are not ours to change, so the content is handed over as a view controller.
			NativeScriptEmbedder.sharedInstance().delegate?.presentNativeScriptApp(controller);
		} else {
			const haveController = this._window.rootViewController !== null;
			this._window.rootViewController = controller;

			if (!haveController) {
				this._window.makeKeyAndVisible();
			}
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
			this._closeRequested = true;
			app.requestSceneSessionDestructionOptionsErrorHandler(session, null, (error: NSError) => {
				if (error) {
					this._closeRequested = false;
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

	protected _onReleaseRootView(rootView: View): void {
		rootView.off(IOSHelper.traitCollectionColorAppearanceChangedEvent);
		rootView.off(IOSHelper.traitCollectionLayoutDirectionChangedEvent);

		// An embedded window belongs to the host app, so its rootViewController is not ours
		// to clear — `_setNativeContent` never set it in the first place.
		if (this.role !== 'embedded' && this._window?.rootViewController) {
			// The controller's view is moving into another window's hierarchy; leaving it
			// installed here has UIKit holding a controller it no longer hosts.
			this._window.rootViewController = null;
		}
	}

	protected _onDestroy(): void {
		// The trait collection listeners live on the root view, so they have to go
		// before the base drops the reference to it.
		if (this._rootView) {
			this._rootView.off(IOSHelper.traitCollectionColorAppearanceChangedEvent);
			this._rootView.off(IOSHelper.traitCollectionLayoutDirectionChangedEvent);
		}
		super._onDestroy();
		this._scene = null;
		this._window = null;
	}

	/**
	 * The window identity of a scene: the session persistent identifier, which iOS keeps
	 * across a disconnect and hands back when it reconnects the same session.
	 *
	 * Returns `undefined` when the scene carries no session identity — such a window gets
	 * a minted id and will not be recognised on reconnect.
	 */
	static getSceneId(scene: UIWindowScene): string | undefined {
		const persistentIdentifier = scene?.session?.persistentIdentifier;
		if (persistentIdentifier) {
			return `${persistentIdentifier}`;
		}

		Trace.write('NativeWindow: scene has no session persistentIdentifier; window identity will not survive a reconnect.', Trace.categories.NativeLifecycle, Trace.messageType.error);

		return undefined;
	}
}
