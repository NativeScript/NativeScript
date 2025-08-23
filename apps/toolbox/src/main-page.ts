import { Application, EventData, Page, SceneEventData, SceneEvents, Utils } from '@nativescript/core';
import { HelloWorldModel } from './main-view-model';

let initSceneEvents = false;
export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	page.bindingContext = new HelloWorldModel();

	// Testing setting window background color
	// if (__APPLE__) {
	// 	Utils.ios.setWindowBackgroundColor('blue');
	// }

	setupSceneEvents();
}

function setupSceneEvents() {
	if (initSceneEvents) {
		return;
	}
	initSceneEvents = true;
	if (__APPLE__) {
		if (Application.ios.supportsScenes()) {
			console.log('Multi-window support available');

			// Get all windows and scenes
			const windows = Application.ios.getAllWindows();
			const scenes = Application.ios.getWindowScenes();
			const primaryWindow = Application.ios.getPrimaryWindow();

			console.log(`App has ${windows.length} windows`);
			console.log(`App has ${scenes.length} scenes`);
			console.log('Primary window:', primaryWindow);

			// Check if using scene lifecycle
			if (Application.ios.isUsingSceneLifecycle()) {
				console.log('App is using scene-based lifecycle');
			}

			// Listen to scene events
			Application.on(SceneEvents.sceneWillConnect, (args: SceneEventData) => {
				console.log('New scene connecting:', args.scene);
				console.log('Window:', args.window);
				console.log('Connection options:', args.connectionOptions);
			});

			Application.on(SceneEvents.sceneDidActivate, (args: SceneEventData) => {
				console.log('Scene became active:', args.scene);
			});

			Application.on(SceneEvents.sceneWillResignActive, (args: SceneEventData) => {
				console.log('Scene will resign active:', args.scene);
			});

			Application.on(SceneEvents.sceneDidEnterBackground, (args: SceneEventData) => {
				console.log('Scene entered background:', args.scene);
			});

			Application.on(SceneEvents.sceneWillEnterForeground, (args: SceneEventData) => {
				console.log('Scene will enter foreground:', args.scene);
			});

			Application.on(SceneEvents.sceneDidDisconnect, (args: SceneEventData) => {
				console.log('Scene disconnected:', args.scene);
			});
		} else {
			console.log('Traditional single-window app');
		}
	}
}
