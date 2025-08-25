import { Observable, EventData, Page, Application, Frame, StackLayout, Label, Button, Dialogs, View, Color, SceneEvents, SceneEventData, Utils } from '@nativescript/core';

let page: Page;
let viewModel: MultipleScenesModel;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	viewModel = new MultipleScenesModel();
	page.bindingContext = viewModel;
}

export class MultipleScenesModel extends Observable {
	private _sceneCount = 0;
	private _isMultiSceneSupported = false;
	private _openedWindows = new Map<string, UIWindowScene>();
	private _currentScenes: any[] = [];
	private _currentWindows: any[] = [];
	private _sceneEvents: string[] = [];

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

	get currentScenes(): any[] {
		return this._currentScenes;
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

		// Listen to all scene lifecycle events
		Application.on(SceneEvents.sceneWillConnect, (args: SceneEventData) => {
			this.addSceneEvent(`Scene Will Connect: ${this.getSceneDescription(args.scene)}`);
			this.updateSceneInfo();
		});

		Application.on(SceneEvents.sceneDidActivate, (args: SceneEventData) => {
			this.addSceneEvent(`Scene Did Activate: ${this.getSceneDescription(args.scene)}`);
			this.updateSceneInfo();
		});

		Application.on(SceneEvents.sceneWillResignActive, (args: SceneEventData) => {
			this.addSceneEvent(`Scene Will Resign Active: ${this.getSceneDescription(args.scene)}`);
		});

		Application.on(SceneEvents.sceneWillEnterForeground, (args: SceneEventData) => {
			this.addSceneEvent(`Scene Will Enter Foreground: ${this.getSceneDescription(args.scene)}`);
		});

		Application.on(SceneEvents.sceneDidEnterBackground, (args: SceneEventData) => {
			this.addSceneEvent(`Scene Did Enter Background: ${this.getSceneDescription(args.scene)}`);
		});

		Application.on(SceneEvents.sceneDidDisconnect, (args: SceneEventData) => {
			this.addSceneEvent(`Scene Did Disconnect: ${this.getSceneDescription(args.scene)}`);
			this.updateSceneInfo();
		});

		// Listen for scene content setup events to provide content for new scenes
		Application.on(SceneEvents.sceneContentSetup, (args: SceneEventData) => {
			this.addSceneEvent(`Setting up content for new scene: ${this.getSceneDescription(args.scene)}`);
			this._openedWindows.set(this.getSceneId(args.scene), args.scene);
			this.setupSceneContent(args);
		});
	}

	private getSceneDescription(scene: UIWindowScene): string {
		if (!scene) return 'Unknown';
		return `Scene ${this.getSceneId(scene)}`;
	}

	private getSceneId(scene: UIWindowScene): string {
		return scene?.hash ? `${scene?.hash}` : scene?.description || 'Unknown';
	}

	private setupSceneContent(args: SceneEventData) {
		if (!args.scene || !args.window || !__APPLE__) return;

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

			console.log('setWindowRootView for:', args.window);
			Application.ios.setWindowRootView(args.window, page);
			this.addSceneEvent(`Content successfully set for scene: ${this.getSceneDescription(args.scene)}`);
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

		// Set up the layout as a root view (this creates the native iOS view)
		page._setupAsRootView({});
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

		// Set up the layout as a root view (this creates the native iOS view)
		page._setupAsRootView({});
		return page;
	}

	private _closeScene(args: EventData) {
		const btn = args.object as Button;
		const sceneId = btn.id;
		console.log('closing scene id from button:', sceneId);
		const scene = this._openedWindows.get(sceneId);
		this.closeScene(scene);
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
				this._currentScenes = Application.ios.getAllScenes() || [];

				this._currentWindows = Application.ios.getAllWindows() || [];

				this._sceneCount = this._currentScenes.length;
			} catch (error) {
				console.log('Error getting scene info:', error);
				this._sceneCount = 0;
				this._currentScenes = [];
				this._currentWindows = [];
			}
		} else {
			this._sceneCount = 1; // Traditional single window
			this._currentScenes = [];
			this._currentWindows = [];
		}

		this.notifyPropertyChange('sceneCount', this._sceneCount);
		this.notifyPropertyChange('currentScenes', this._currentScenes);
		this.notifyPropertyChange('currentWindows', this._currentWindows);
		this.notifyPropertyChange('statusText', this.statusText);
	}

	onCreateNewScene() {
		this.openWindow({ id: 'newSceneBasic' });
	}

	onCreateNewSceneAlt() {
		this.openWindow({ id: 'newSceneAlt' });
	}

	/**
	 * TODO: move this into application.ios and make available for user usage.
	 * Opens a new window with the specified data.
	 * @param data The data to pass to the new window.
	 * @returns A promise that resolves when the window is opened.
	 */
	openWindow(data: Record<any, any>) {
		if (!this.canCreateNewScene) {
			console.log('Cannot create new scene - not supported');
			return;
		}

		try {
			const app = UIApplication.sharedApplication;

			// iOS 17+ - Use the new activateSceneSessionForRequestErrorHandler method
			if (Utils.SDK_VERSION >= 17) {
				this.addSceneEvent('Using iOS 17+ scene activation API');

				// Create a new scene activation request with proper role
				let request: UISceneSessionActivationRequest;

				try {
					// Use the correct factory method to create request with role
					// Based on the type definitions, this is the proper way
					request = UISceneSessionActivationRequest.requestWithRole(UIWindowSceneSessionRoleApplication);
					this.addSceneEvent('✅ Created request using requestWithRole factory method');

					// Note: may be useful to allow user defined activity type through optional string typed extensible data?
					const activity = NSUserActivity.alloc().initWithActivityType(`${NSBundle.mainBundle.bundleIdentifier}.scene`);
					activity.userInfo = Utils.dataSerialize(data);
					request.userActivity = activity;
					this.addSceneEvent('Set user activity for scene request');

					// Set proper options with requesting scene
					const options = UISceneActivationRequestOptions.new();

					// Note: may want to explore secondary windows spawning other windows
					// and if this context needs to change in that case
					const mainWindow = Application.ios.getPrimaryWindow();
					options.requestingScene = mainWindow?.windowScene;
					this.addSceneEvent('Set requesting scene context');

					/**
					 * This does not work so far in testing but worth exploring further sometime
					 * regarding the size/dimensions of opened secondary windows.
					 * The initial size is ultimately determined by the system
					 * based on available space and user context.
					 */
					// Get the size restrictions from the window scene
					// const sizeRestrictions = (options.requestingScene as UIWindowScene).sizeRestrictions;

					// // Set your minimum and maximum dimensions
					// sizeRestrictions.minimumSize = CGSizeMake(320, 400);
					// sizeRestrictions.maximumSize = CGSizeMake(600, 800);

					request.options = options;

					// Log the final request configuration for debugging
					try {
						const requestRole = request.role;
						this.addSceneEvent(`Final request role: ${requestRole}`);
					} catch (e) {
						this.addSceneEvent('Could not read role from request');
					}
				} catch (roleError) {
					console.log('Error creating request:', roleError);
					this.addSceneEvent(`Error creating request: ${roleError.message}`);
					return;
				}

				this.addSceneEvent('Requesting scene activation...');
				app.activateSceneSessionForRequestErrorHandler(request, (error) => {
					if (error) {
						console.log('Error creating new scene (iOS 17+):', error);
						this.addSceneEvent(`Error creating scene: ${error.localizedDescription}`);
						this.addSceneEvent(`Error domain: ${error.domain}, code: ${error.code}`);

						// Log additional debugging info
						if (error.userInfo) {
							this.addSceneEvent(`Error userInfo: ${error.userInfo.description}`);
						}

						// Handle specific error types
						if (error.localizedDescription.includes('role') && error.localizedDescription.includes('nil')) {
							this.addSceneEvent('❌ Role is nil - this confirms the iOS 17+ API issue');
							this.addSceneEvent('🔄 Falling back to legacy API which handles roles differently');
							this.createSceneWithLegacyAPI();
						} else if (error.domain === 'FBSWorkspaceErrorDomain' && error.code === 2) {
							this.addSceneEvent('⚠️  System declined scene creation - this may be expected behavior');
							this.addSceneEvent('💡 Scene creation might require user gesture or specific device state');
							this.addSceneEvent('🔄 Trying alternative approach...');
							this.addSceneEvent('ℹ️  Note: Scene creation may be restricted on this device/iOS version');
							this.explainSceneCreationLimitations();
							this.createSceneWithLegacyAPI();
						}
					} else {
						this.addSceneEvent('✅ New scene created successfully (iOS 17+)');
					}
				});
			}
			// iOS 13-16 - Use the legacy requestSceneSessionActivationUserActivityOptionsErrorHandler method
			else if (Utils.SDK_VERSION >= 13 && Utils.SDK_VERSION < 17) {
				this.addSceneEvent('Using iOS 13-16 scene activation API');

				app.requestSceneSessionActivationUserActivityOptionsErrorHandler(
					null, // session
					null, // userActivity
					null, // options
					(error) => {
						if (error) {
							console.log('Error creating new scene (legacy):', error);
							this.addSceneEvent(`Error creating scene: ${error.localizedDescription}`);
						} else {
							this.addSceneEvent('New scene creation requested (legacy)');
						}
					},
				);
			}
			// Fallback for older iOS versions or unsupported configurations
			else {
				this.addSceneEvent('Scene creation API not available on this iOS version');
				console.log('Neither new nor legacy scene activation methods are available');
			}
		} catch (error) {
			console.log('Error requesting new scene:', error);
			this.addSceneEvent(`Error: ${error.message || error}`);
		}
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
		this.addSceneEvent(`Current state: ${this._currentScenes.length} scenes, ${this._currentWindows.length} windows`);

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

	onExplainSceneLimitations() {
		this.explainSceneCreationLimitations();
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

	private createSceneWithLegacyAPI() {
		if (!Application.ios || !Application.ios.delegate) {
			this.addSceneEvent('Error: No iOS application delegate available');
			return;
		}

		this.addSceneEvent('Creating new scene using legacy API as fallback...');

		const mainWindow = UIApplication.sharedApplication.windows.firstObject;
		const windowScene = mainWindow.windowScene;

		if (!windowScene) {
			this.addSceneEvent('Error: No window scene available');
			return;
		}

		// Create user activity for the new scene

		// Use the legacy API
		const options = UISceneActivationRequestOptions.new();
		options.requestingScene = windowScene;

		UIApplication.sharedApplication.requestSceneSessionActivationUserActivityOptionsErrorHandler(
			null, // session - null for new scene
			null,
			options,
			(error: NSError) => {
				if (error) {
					this.addSceneEvent(`Legacy API also failed: ${error.localizedDescription}`);
					this.addSceneEvent('ℹ️  This is expected behavior on many iOS configurations');
					this.addSceneEvent('💡 Scene creation often requires specific device support or user gestures');
					this.addSceneEvent('📱 Try using iPad multitasking gestures or external display');
				} else {
					this.addSceneEvent('✅ New scene created successfully using legacy API!');
				}
			},
		);
	}

	private explainSceneCreationLimitations() {
		this.addSceneEvent('--- Scene Creation Information ---');
		this.addSceneEvent('🔍 Programmatic scene creation has system limitations:');
		this.addSceneEvent('• May require specific device support (iPad, external displays)');
		this.addSceneEvent('• System reserves right to decline based on resources');
		this.addSceneEvent('• User-initiated actions (split-screen) usually work better');
		this.addSceneEvent('• Some iOS versions restrict programmatic creation');
		this.addSceneEvent('✅ Scene delegate is working correctly (initial scene loaded)');
	}

	private closeScene(scene: UIWindowScene) {
		if (!scene || !__APPLE__) return;

		try {
			this.addSceneEvent(`Attempting to close scene: ${this.getSceneDescription(scene)}`);

			// Get the scene session
			const session = scene.session;
			if (session) {
				// Check if this is the primary scene (typically can't be closed)
				const isPrimaryScene = Application.ios.getPrimaryScene() === scene;
				const sceneId = this.getSceneId(scene);
				console.log('isPrimaryScene:', isPrimaryScene, 'sceneId:', sceneId);

				if (isPrimaryScene) {
					this.addSceneEvent(`⚠️  This appears to be the primary scene`);
					this.addSceneEvent(`💡 Primary scenes typically cannot be closed programmatically`);
					return;
				} else {
					this.addSceneEvent(`✅ This appears to be a secondary scene - closure should work`);
				}

				// Try the correct iOS API for scene destruction
				const app = UIApplication.sharedApplication;

				if (app.requestSceneSessionDestructionOptionsErrorHandler) {
					this.addSceneEvent(`📞 Calling scene destruction API...`);
					app.requestSceneSessionDestructionOptionsErrorHandler(session, null, (error: NSError) => {
						if (error) {
							console.log('scene destroy error:', error);
							this.addSceneEvent(`❌ Scene destruction failed: ${error.localizedDescription}`);
							this.addSceneEvent(`📋 Error details - Domain: ${error.domain}, Code: ${error.code}`);

							// Provide specific guidance based on error
							if (error.localizedDescription.includes('primary') || error.code === 1) {
								this.addSceneEvent(`💡 Cannot close primary scene - this is iOS system behavior`);
								this.addSceneEvent(`ℹ️  Only secondary scenes can be closed via API`);
							} else if (error.code === 22 || error.domain.includes('FBSWorkspace')) {
								this.addSceneEvent(`💡 System declined scene destruction request`);
								this.addSceneEvent(`🔄 This may be due to system resource management`);
							} else {
								this.addSceneEvent(`🔍 Unexpected error - scene destruction may not be fully supported`);
							}

							this.addSceneEvent(`🖱️  Alternative: Use system UI to close (app switcher or split-screen controls)`);
						} else {
							this._closeButtons.delete(sceneId);
							this.addSceneEvent(`✅ Scene destruction request accepted`);
							this.addSceneEvent(`⏳ Scene should close within a few seconds...`);
						}
					});
				} else {
					this.addSceneEvent(`❌ Scene destruction API not available`);
					this.addSceneEvent(`📱 This iOS version/configuration may not support programmatic scene closure`);
				}
			} else {
				this.addSceneEvent('❌ Error: Could not find scene session to close');
			}
		} catch (error) {
			this.addSceneEvent(`❌ Error closing scene: ${error.message}`);
		}
	}
}
