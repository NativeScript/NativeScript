import { Observable, EventData, Page, Application, StackLayout, Label, Button, Dialogs, View, Color, NativeWindowEvents, SceneEventData, Utils, WindowEvents, WindowOpenEventData, WindowCloseEventData, NativeWindow } from '@nativescript/core';

let page: Page;
let viewModel: MultipleScenesModel;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	viewModel = new MultipleScenesModel();
	page.bindingContext = viewModel;
}

export function navigatingFrom(args: EventData) {
	if (viewModel) {
		viewModel.destroy();
		viewModel = undefined;
	}
}

export class MultipleScenesModel extends Observable {
	private _sceneCount = 0;
	private _isMultiSceneSupported = false;
	private _currentWindows: any[] = [];
	private _sceneEvents: string[] = [];
	private _windowOpenHandler: (args: WindowOpenEventData) => void;
	private _windowCloseHandler: (args: WindowCloseEventData) => void;
	private _sceneEventHandlers: Map<string, (args: SceneEventData) => void> = new Map();

	constructor() {
		super();
		this.checkSceneSupport();
		this.setupSceneEventListeners();
		this.updateSceneInfo();
		this.checkSceneDelegateRegistration();
	}

	get sceneCount(): number {
		return this._sceneCount;
	}

	get isMultiSceneSupported(): boolean {
		return this._isMultiSceneSupported;
	}

	get currentWindows(): any[] {
		return this._currentWindows;
	}

	get sceneEvents(): string[] {
		return this._sceneEvents;
	}

	get canCreateNewScene(): boolean {
		return this._isMultiSceneSupported && __APPLE__;
	}

	get statusText(): string {
		if (!__APPLE__) {
			return 'Scene support is only available on iOS';
		}
		if (!this._isMultiSceneSupported) {
			return 'Multi-scene support not enabled. Add scene configuration to Info.plist';
		}

		// Check which API is available
		let apiInfo = '';
		try {
			if (typeof UIApplication !== 'undefined') {
				const app = UIApplication.sharedApplication;
				if (typeof app.activateSceneSessionForRequestErrorHandler === 'function') {
					apiInfo = ' (iOS 17+ API available)';
				} else if (typeof app.requestSceneSessionActivationUserActivityOptionsErrorHandler === 'function') {
					apiInfo = ' (iOS 13-16 API available)';
				}
			}
		} catch (e) {
			// Ignore errors in API detection
		}

		return `Multi-scene support enabled. ${this._sceneCount} scene(s) active${apiInfo}`;
	}

	private checkSceneSupport() {
		if (__APPLE__) {
			try {
				// Check if the supportsScenes method exists and call it
				if (typeof Application.ios.supportsScenes === 'function') {
					this._isMultiSceneSupported = Application.ios.supportsScenes();
				} else {
					// Fallback: check for scene manifest in bundle
					this._isMultiSceneSupported = false;
					try {
						const bundle = NSBundle.mainBundle;
						const sceneManifest = bundle.objectForInfoDictionaryKey('UIApplicationSceneManifest');
						this._isMultiSceneSupported = !!sceneManifest;
					} catch (e) {
						console.log('Error checking scene manifest:', e);
					}
				}
				console.log('Scene support check:', this._isMultiSceneSupported);
			} catch (error) {
				console.log('Error checking scene support:', error);
				this._isMultiSceneSupported = false;
			}
		}
		this.notifyPropertyChange('isMultiSceneSupported', this._isMultiSceneSupported);
		this.notifyPropertyChange('canCreateNewScene', this.canCreateNewScene);
		this.notifyPropertyChange('statusText', this.statusText);
	}

	private setupSceneEventListeners() {
		if (!__APPLE__) return;

		// Listen for window open/close on Application
		this._windowOpenHandler = (args: WindowOpenEventData) => {
			const nativeWindow = args.window;
			if (!nativeWindow) return;
			this.addSceneEvent(`Window opened: ${nativeWindow.id}`);
			this.registerNativeWindowListeners(nativeWindow);
			this.updateSceneInfo();
		};
		this._windowCloseHandler = (args: WindowCloseEventData) => {
			const nativeWindow = args.window;
			if (!nativeWindow) return;
			this.addSceneEvent(`Window closed: ${nativeWindow.id}`);
			this.updateSceneInfo();
		};
		Application.ios.on(WindowEvents.windowOpen, this._windowOpenHandler);
		Application.ios.on(WindowEvents.windowClose, this._windowCloseHandler);

		// Register listeners on existing windows
		for (const nativeWindow of Application.ios.getWindows()) {
			this.registerNativeWindowListeners(nativeWindow);
		}
	}

	private registerNativeWindowListeners(nativeWindow: NativeWindow) {
		const events = [
			{ name: NativeWindowEvents.sceneWillConnect, label: 'Scene Will Connect' },
			{ name: NativeWindowEvents.sceneDidActivate, label: 'Scene Did Activate' },
			{ name: NativeWindowEvents.sceneWillResignActive, label: 'Scene Will Resign Active' },
			{ name: NativeWindowEvents.sceneWillEnterForeground, label: 'Scene Will Enter Foreground' },
			{ name: NativeWindowEvents.sceneDidEnterBackground, label: 'Scene Did Enter Background' },
			{ name: NativeWindowEvents.sceneDidDisconnect, label: 'Scene Did Disconnect' },
		];

		for (const event of events) {
			const handler = (args: SceneEventData) => {
				this.addSceneEvent(`${event.label}: Window ${nativeWindow.id}`);
				this.updateSceneInfo();

				// Set up content for new scenes when they connect
				if (event.name === NativeWindowEvents.sceneWillConnect) {
					this.setupSceneContent(nativeWindow, args);
				}
			};
			const handlerKey = `${nativeWindow.id}:${event.name}`;
			this._sceneEventHandlers.set(handlerKey, handler);
			nativeWindow.on(event.name, handler as any);
		}
	}

	private unregisterNativeWindowListeners(nativeWindow: NativeWindow) {
		const events = [NativeWindowEvents.sceneWillConnect, NativeWindowEvents.sceneDidActivate, NativeWindowEvents.sceneWillResignActive, NativeWindowEvents.sceneWillEnterForeground, NativeWindowEvents.sceneDidEnterBackground, NativeWindowEvents.sceneDidDisconnect];

		for (const eventName of events) {
			const handlerKey = `${nativeWindow.id}:${eventName}`;
			const handler = this._sceneEventHandlers.get(handlerKey);
			if (handler) {
				nativeWindow.off(eventName, handler);
				this._sceneEventHandlers.delete(handlerKey);
			}
		}
	}

	destroy() {
		if (!__APPLE__) return;

		// Unregister window open/close listeners
		if (this._windowOpenHandler) {
			Application.ios.off(WindowEvents.windowOpen, this._windowOpenHandler);
		}
		if (this._windowCloseHandler) {
			Application.ios.off(WindowEvents.windowClose, this._windowCloseHandler);
		}

		// Unregister all NativeWindow listeners
		for (const nativeWindow of Application.ios.getWindows()) {
			this.unregisterNativeWindowListeners(nativeWindow);
		}
		this._sceneEventHandlers.clear();
	}

	private getSceneDescription(scene: UIWindowScene): string {
		if (!scene) return 'Unknown';
		return `Scene ${this.getSceneId(scene)}`;
	}

	private getSceneId(scene: UIWindowScene): string {
		return scene?.hash ? `${scene?.hash}` : scene?.description || 'Unknown';
	}

	private setupSceneContent(nativeWindow: NativeWindow, args: SceneEventData) {
		if (!args.scene || !args.window || !__APPLE__) return;

		// Skip the primary scene (it already has content)
		if (nativeWindow === Application.ios.primaryWindow) return;

		try {
			let nsViewId: string;
			if (args.connectionOptions?.userActivities?.count > 0) {
				const activity = args.connectionOptions.userActivities.allObjects.objectAtIndex(0) as NSUserActivity;
				nsViewId = Utils.dataDeserialize(activity.userInfo).id;
			}
			console.log('--- Open scene for nsViewId:', nsViewId);
			let page: Page;
			switch (nsViewId) {
				case 'newSceneBasic':
					page = this._createPageForScene(args.scene, args.window);
					break;
				case 'newSceneAlt':
					page = this._createAltPageForScene(args.scene, args.window);
					break;
				// Note: can implement any number of other scene views
			}

			if (page) {
				console.log('setContent for window:', nativeWindow.id);
				nativeWindow.setContent(page);
				this.addSceneEvent(`Content successfully set for window: ${nativeWindow.id}`);
			}
		} catch (error) {
			this.addSceneEvent(`Error setting up scene content: ${error.message}`);
		}
	}

	/**
	 * Note: When creating UI's with plain core, buttons will be garbage collected if not referenced.
	 * Particularly when opening many new scenes.
	 * If the button is GC'd by the system, the taps will no longer function.
	 * This is more related to iOS delegates getting GC'd than anything.
	 * Most flavors circumvent things like that because their components are retained.
	 * We circumvent the core demo (xml ui) issue but just retaining a map of the created UI buttons.
	 */
	private _closeButtons = new Map<string, Button>();
	private _createPageForScene(scene: UIWindowScene, window: UIWindow): Page {
		const page = new Page();
		page.backgroundColor = new Color('#cdffdb');
		// Create a simple layout for the new scene
		const layout = new StackLayout();
		layout.padding = 32;

		page.content = layout;

		// Add title
		const title = new Label();
		title.text = 'New NativeScript Scene';
		title.fontSize = 35;
		title.fontWeight = 'bold';
		title.textAlignment = 'center';
		title.marginBottom = 30;
		layout.addChild(title);

		// Add scene info
		const sceneInfo = new Label();
		sceneInfo.text = `Scene ID: ${scene.hash || 'Unknown'}\nWindow: ${window.description || 'Unknown'}`;
		sceneInfo.fontSize = 22;
		sceneInfo.textAlignment = 'center';
		sceneInfo.marginBottom = 25;
		layout.addChild(sceneInfo);

		// Add close button
		const closeButton = new Button();
		const sceneId = this.getSceneId(scene);
		closeButton.id = sceneId;
		console.log('scene assigning id to button:', closeButton.id);
		closeButton.text = 'Close This Scene';
		closeButton.fontSize = 22;
		closeButton.fontWeight = 'bold';
		closeButton.backgroundColor = '#ff4444';
		closeButton.color = new Color('white');
		closeButton.borderRadius = 8;
		closeButton.padding = 16;
		closeButton.width = 300;
		closeButton.horizontalAlignment = 'center';
		closeButton.on('tap', this._closeScene.bind(this));
		// retain the close button so we don't lose the tap (iOS delegate binding)
		this._closeButtons.set(sceneId, closeButton);
		layout.addChild(closeButton);

		return page;
	}

	private _createAltPageForScene(scene: UIWindowScene, window: UIWindow): Page {
		const page = new Page();
		page.backgroundColor = new Color('#65ADF1');
		// Create a simple layout for the new scene
		const layout = new StackLayout();
		layout.padding = 32;

		page.content = layout;

		// Add title
		const title = new Label();
		title.text = 'New Alternate NativeScript Scene';
		title.fontSize = 35;
		title.color = new Color('blue');
		title.fontWeight = 'bold';
		title.textAlignment = 'center';
		title.marginBottom = 35;
		layout.addChild(title);

		// Add scene info
		const sceneInfo = new Label();
		sceneInfo.text = `Scene ID: ${scene.hash || 'Unknown'}\nWindow: ${window.description || 'Unknown'}`;
		sceneInfo.fontSize = 24;
		sceneInfo.textAlignment = 'center';
		sceneInfo.marginBottom = 32;
		layout.addChild(sceneInfo);

		// Add close button
		const closeButton = new Button();
		const sceneId = this.getSceneId(scene);
		closeButton.id = sceneId;
		console.log('scene assigning id to button:', closeButton.id);
		closeButton.text = 'Close This Scene';
		closeButton.fontSize = 25;
		closeButton.fontWeight = 'bold';
		closeButton.backgroundColor = '#006ead';
		closeButton.color = new Color('white');
		closeButton.borderRadius = 8;
		closeButton.padding = 16;
		closeButton.width = 350;
		closeButton.horizontalAlignment = 'center';
		closeButton.on('tap', this._closeScene.bind(this));
		// retain the close button so we don't lose the tap (iOS delegate binding)
		this._closeButtons.set(sceneId, closeButton);
		layout.addChild(closeButton);

		return page;
	}

	private _closeScene(args: EventData) {
		const btn = args.object as Button;
		console.log('closing scene from button tap');
		// Let core resolve the scene from the view/window context
		Application.ios.closeWindow(btn);
	}

	private getSceneAPIInfo(): string {
		if (!__APPLE__) return 'Not iOS';

		try {
			if (typeof UIApplication !== 'undefined') {
				const app = UIApplication.sharedApplication;

				if (typeof app.activateSceneSessionForRequestErrorHandler === 'function') {
					return `iOS ${Utils.SDK_VERSION} - Modern API (iOS 17+) available`;
				} else if (typeof app.requestSceneSessionActivationUserActivityOptionsErrorHandler === 'function') {
					return `iOS ${Utils.SDK_VERSION} - Legacy API (iOS 13-16) available`;
				} else {
					return `iOS ${Utils.SDK_VERSION} - No scene activation API available`;
				}
			}
		} catch (e) {
			return `Error detecting API: ${e.message}`;
		}

		return 'Unknown API status';
	}

	private addSceneEvent(event: string) {
		const timestamp = new Date().toLocaleTimeString();
		const evt = `${timestamp}: ${event}`;
		this._sceneEvents.unshift(evt);
		console.log(evt);

		// Keep only last 20 events
		if (this._sceneEvents.length > 20) {
			this._sceneEvents = this._sceneEvents.slice(0, 20);
		}

		this.notifyPropertyChange('sceneEvents', this._sceneEvents);
	}

	private updateSceneInfo() {
		if (__APPLE__ && this._isMultiSceneSupported) {
			try {
				const windows = Application.ios.getWindows() || [];
				this._currentWindows = windows;
				this._sceneCount = windows.length;
			} catch (error) {
				console.log('Error getting scene info:', error);
				this._sceneCount = 0;
				this._currentWindows = [];
			}
		} else {
			this._sceneCount = 1; // Traditional single window
			this._currentWindows = [];
		}

		this.notifyPropertyChange('sceneCount', this._sceneCount);
		this.notifyPropertyChange('currentWindows', this._currentWindows);
		this.notifyPropertyChange('statusText', this.statusText);
	}

	onCreateNewScene() {
		Application.ios.openWindow({ id: 'newSceneBasic' });
	}

	onCreateNewSceneAlt() {
		Application.ios.openWindow({ id: 'newSceneAlt' });
	}

	onRefreshSceneInfo() {
		this.updateSceneInfo();
		this.addSceneEvent('Scene info refreshed');
	}

	onClearEvents() {
		this._sceneEvents = [];
		this.notifyPropertyChange('sceneEvents', this._sceneEvents);
	}

	onShowSceneDetails() {
		if (!__APPLE__) {
			Dialogs.alert({
				title: 'Scene Details',
				message: 'Scene functionality is only available on iOS 13+',
				okButtonText: 'OK',
			});
			return;
		}

		const apiInfo = this.getSceneAPIInfo();
		const sceneInfo = this.getSceneAPIInfo(); // Using getSceneAPIInfo for now

		// Add SceneDelegate registration info
		let delegateInfo = '\n--- SceneDelegate Status ---\n';
		if (typeof global.SceneDelegate !== 'undefined') {
			delegateInfo += '✅ SceneDelegate: Registered globally\n';
		} else {
			delegateInfo += '❌ SceneDelegate: NOT registered\n';
		}

		if (typeof UIWindowSceneDelegate !== 'undefined') {
			delegateInfo += '✅ UIWindowSceneDelegate: Available\n';
		} else {
			delegateInfo += '❌ UIWindowSceneDelegate: Not available\n';
		}

		const fullDetails = `${sceneInfo}\n\n${apiInfo}${delegateInfo}`;

		// Show in alert dialog
		const alertOptions = {
			title: 'Scene & API Details',
			message: fullDetails,
			okButtonText: 'OK',
		};

		Dialogs.alert(alertOptions);
	}
	onTestSceneAPI() {
		const apiInfo = this.getSceneAPIInfo();
		this.addSceneEvent(`API Test: ${apiInfo}`);

		// Also log current scene/window counts
		this.addSceneEvent(`Current state: ${this._currentWindows.length} windows`);

		// Add device and system info
		try {
			const device = UIDevice.currentDevice;
			this.addSceneEvent(`Device: ${device.model} (${device.systemName} ${device.systemVersion})`);

			// Check if this is iPad (more likely to support multiple scenes)
			if (device.userInterfaceIdiom === UIUserInterfaceIdiom.Pad) {
				this.addSceneEvent('📱 iPad detected - better scene support expected');
			} else {
				this.addSceneEvent('📱 iPhone detected - limited scene support');
			}
		} catch (e) {
			this.addSceneEvent('Could not get device info');
		}
	}

	private checkSceneDelegateRegistration() {
		if (!__APPLE__) {
			return;
		}

		this.addSceneEvent('Checking SceneDelegate registration...');

		// Check if SceneDelegate is available globally
		if (typeof global.SceneDelegate !== 'undefined') {
			this.addSceneEvent('✅ SceneDelegate is registered globally');
		} else {
			this.addSceneEvent('❌ SceneDelegate NOT found in global scope!');
		}

		// Check if UIWindowSceneDelegate is available
		if (typeof UIWindowSceneDelegate !== 'undefined') {
			this.addSceneEvent('✅ UIWindowSceneDelegate protocol available');
		} else {
			this.addSceneEvent('❌ UIWindowSceneDelegate protocol not available');
		}
	}

	// private closeScene(scene: UIWindowScene) {
	// 	if (!scene || !__APPLE__) return;

	// 	try {
	// 		this.addSceneEvent(`Attempting to close scene: ${this.getSceneDescription(scene)}`);

	// 		// Get the scene session
	// 		const session = scene.session;
	// 		if (session) {
	// 			// Check if this is the primary scene (typically can't be closed)
	// 			const isPrimaryScene = Application.ios.getPrimaryScene() === scene;
	// 			const sceneId = this.getSceneId(scene);
	// 			console.log('isPrimaryScene:', isPrimaryScene, 'sceneId:', sceneId);

	// 			if (isPrimaryScene) {
	// 				this.addSceneEvent(`⚠️  This appears to be the primary scene`);
	// 				this.addSceneEvent(`💡 Primary scenes typically cannot be closed programmatically`);
	// 				return;
	// 			} else {
	// 				this.addSceneEvent(`✅ This appears to be a secondary scene - closure should work`);
	// 			}

	// 			// Try the correct iOS API for scene destruction
	// 			const app = UIApplication.sharedApplication;

	// 			if (app.requestSceneSessionDestructionOptionsErrorHandler) {
	// 				this.addSceneEvent(`📞 Calling scene destruction API...`);
	// 				app.requestSceneSessionDestructionOptionsErrorHandler(session, null, (error: NSError) => {
	// 					if (error) {
	// 						console.log('scene destroy error:', error);
	// 						this.addSceneEvent(`❌ Scene destruction failed: ${error.localizedDescription}`);
	// 						this.addSceneEvent(`📋 Error details - Domain: ${error.domain}, Code: ${error.code}`);

	// 						// Provide specific guidance based on error
	// 						if (error.localizedDescription.includes('primary') || error.code === 1) {
	// 							this.addSceneEvent(`💡 Cannot close primary scene - this is iOS system behavior`);
	// 							this.addSceneEvent(`ℹ️  Only secondary scenes can be closed via API`);
	// 						} else if (error.code === 22 || error.domain.includes('FBSWorkspace')) {
	// 							this.addSceneEvent(`💡 System declined scene destruction request`);
	// 							this.addSceneEvent(`🔄 This may be due to system resource management`);
	// 						} else {
	// 							this.addSceneEvent(`🔍 Unexpected error - scene destruction may not be fully supported`);
	// 						}

	// 						this.addSceneEvent(`🖱️  Alternative: Use system UI to close (app switcher or split-screen controls)`);
	// 					} else {
	// 						this._closeButtons.delete(sceneId);
	// 						this.addSceneEvent(`✅ Scene destruction request accepted`);
	// 						this.addSceneEvent(`⏳ Scene should close within a few seconds...`);
	// 					}
	// 				});
	// 			} else {
	// 				this.addSceneEvent(`❌ Scene destruction API not available`);
	// 				this.addSceneEvent(`📱 This iOS version/configuration may not support programmatic scene closure`);
	// 			}
	// 		} else {
	// 			this.addSceneEvent('❌ Error: Could not find scene session to close');
	// 		}
	// 	} catch (error) {
	// 		this.addSceneEvent(`❌ Error closing scene: ${error.message}`);
	// 	}
	// }
}
