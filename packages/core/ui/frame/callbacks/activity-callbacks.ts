import { AndroidActivityCallbacks, Frame } from '..';

import { AndroidActivityBackPressedEventData, AndroidActivityNewIntentEventData, AndroidActivityRequestPermissionsEventData, AndroidActivityResultEventData, Application } from '../../../application';

import { Trace } from '../../../trace';
import { View } from '../../core/view';

import { _clearEntry, _clearFragment, _getAnimatedEntries, _reverseTransitions, _setAndroidFragmentTransitions, _updateTransitions } from '../fragment.transitions';

import { profile } from '../../../profiling';
import { isEmbedded, setEmbeddedView } from '../../embedding';
import { ContentView } from '../../content-view';

const activityRootViewsMap = new Map<number, WeakRef<ContentView>>();
const INTENT_EXTRA = 'com.tns.activity';
const ROOT_VIEW_ID_EXTRA = 'com.tns.activity.rootViewId';

export let moduleLoaded: boolean;

export class ActivityCallbacksImplementation implements AndroidActivityCallbacks {
	private _rootView: ContentView;
	private _subRootView: View;

	public getRootView(): View {
		return this._subRootView || this._rootView;
	}

	@profile
	public onCreate(activity: androidx.appcompat.app.AppCompatActivity, savedInstanceState: android.os.Bundle, intentOrSuperFunc: android.content.Intent | Function, superFunc?: Function): void {
		if (Trace.isEnabled()) {
			Trace.write(`Activity.onCreate(${savedInstanceState})`, Trace.categories.NativeLifecycle);
		}

		const intent: android.content.Intent = superFunc ? <android.content.Intent>intentOrSuperFunc : undefined;

		if (!superFunc) {
			console.log('AndroidActivityCallbacks.onCreate(activity: any, savedInstanceState: any, superFunc: Function) ' + 'is deprecated. Use AndroidActivityCallbacks.onCreate(activity: any, savedInstanceState: any, intent: any, superFunc: Function) instead.');
			superFunc = <Function>intentOrSuperFunc;
		}

		// If there is savedInstanceState this call will recreate all fragments that were previously in the navigation.
		// We take care of associating them with a Page from our backstack in the onAttachFragment callback.
		// If there is savedInstanceState and moduleLoaded is false we are restarted but process was killed.
		// For now we treat it like first run (e.g. we are not passing savedInstanceState so no fragments are being restored).
		// When we add support for application save/load state - revise this logic.
		const isRestart = !!savedInstanceState && moduleLoaded;
		superFunc.call(activity, isRestart ? savedInstanceState : null);

		// Try to get the rootViewId form the saved state in case the activity
		// was destroyed and we are now recreating it.
		if (savedInstanceState) {
			const rootViewId = savedInstanceState.getInt(ROOT_VIEW_ID_EXTRA, -1);
			if (rootViewId !== -1 && activityRootViewsMap.has(rootViewId)) {
				this._rootView = activityRootViewsMap.get(rootViewId)?.get();
				this._subRootView = this._rootView.content;
			}
		}

		if (intent && intent.getAction()) {
			Application.android.notify(<AndroidActivityNewIntentEventData>{
				eventName: Application.AndroidApplication.activityNewIntentEvent,
				object: Application.android,
				activity,
				intent,
			});
		}

		Application.android.notify({
			eventName: Application.AndroidApplication.activityCreateEvent,
			object: Application.android,
			activity,
		});

		this.setActivityContent(activity, savedInstanceState, true);
		moduleLoaded = true;
	}

	@profile
	public onSaveInstanceState(activity: androidx.appcompat.app.AppCompatActivity, outState: android.os.Bundle, superFunc: Function): void {
		superFunc.call(activity, outState);
		const rootView = this._rootView;
		if (rootView instanceof Frame) {
			outState.putInt(INTENT_EXTRA, rootView.android.frameId);
			rootView._saveFragmentsState();
		}

		if (rootView) {
			outState.putInt(ROOT_VIEW_ID_EXTRA, rootView._domId);
		}
	}

	@profile
	public onNewIntent(activity: androidx.appcompat.app.AppCompatActivity, intent: android.content.Intent, superSetIntentFunc: Function, superFunc: Function): void {
		superFunc.call(activity, intent);
		superSetIntentFunc.call(activity, intent);

		Application.android.notify(<AndroidActivityNewIntentEventData>{
			eventName: Application.AndroidApplication.activityNewIntentEvent,
			object: Application.android,
			activity,
			intent,
		});
	}

	@profile
	public onStart(activity: any, superFunc: Function): void {
		superFunc.call(activity);

		if (Trace.isEnabled()) {
			Trace.write('NativeScriptActivity.onStart();', Trace.categories.NativeLifecycle);
		}

		const rootView = this._rootView;
		if (rootView && !rootView.isLoaded && !isEmbedded()) {
			rootView.callLoaded();
		}
	}

	@profile
	public onStop(activity: any, superFunc: Function): void {
		superFunc.call(activity);

		if (Trace.isEnabled()) {
			Trace.write('NativeScriptActivity.onStop();', Trace.categories.NativeLifecycle);
		}

		const rootView = this._rootView;
		if (rootView && rootView.isLoaded && !isEmbedded()) {
			rootView.callUnloaded();
		}
	}

	@profile
	public onPostResume(activity: any, superFunc: Function): void {
		superFunc.call(activity);

		if (Trace.isEnabled()) {
			Trace.write('NativeScriptActivity.onPostResume();', Trace.categories.NativeLifecycle);
		}

		// NOTE: activity.onPostResume() is called when activity resume is complete and we can
		// safely raise the application resume event;
		// onActivityResumed(...) lifecycle callback registered in application is called too early
		// and raising the application resume event there causes issues like
		// https://github.com/NativeScript/NativeScript/issues/6708
		if ((<any>activity).isNativeScriptActivity) {
			Application.setSuspended(false, {
				// todo: deprecate in favor of using event.activity instead.
				android: activity,
				activity,
			});
		}
	}

	@profile
	public onDestroy(activity: any, superFunc: Function): void {
		try {
			if (Trace.isEnabled()) {
				Trace.write('NativeScriptActivity.onDestroy();', Trace.categories.NativeLifecycle);
			}

			const rootView = this._rootView;
			if (rootView) {
				rootView._tearDownUI(true);
			}
			this._rootView = null;

			// this may happen when the user changes the system theme
			// In such case, isFinishing() is false (and isChangingConfigurations is true), and the app will start again (onCreate) with a savedInstanceState
			// as a result, launchEvent will never be called
			// possible alternative: always fire launchEvent and exitEvent, but pass extra flags to make it clear what kind of launch/destroy is happening
			if (activity.isFinishing()) {
				// only clear _subRootView is finishing
				// other we might reuse it
				this._subRootView = null;
				const exitArgs = {
					eventName: Application.exitEvent,
					object: Application.android,
					android: activity,
				};
				Application.notify(exitArgs);
			}
		} finally {
			superFunc.call(activity);
		}
	}

	@profile
	public onBackPressed(activity: any, superFunc: Function): void {
		if (Trace.isEnabled()) {
			Trace.write('NativeScriptActivity.onBackPressed;', Trace.categories.NativeLifecycle);
		}

		const args = <AndroidActivityBackPressedEventData>{
			eventName: 'activityBackPressed',
			object: Application,
			android: Application.android,
			activity: activity,
			cancel: false,
		};
		Application.android.notify(args);
		if (args.cancel) {
			return;
		}

		const view = this._rootView;
		let callSuper = false;

		const viewArgs = <AndroidActivityBackPressedEventData>{
			eventName: 'activityBackPressed',
			object: view,
			activity: activity,
			cancel: false,
		};
		view.notify(viewArgs);

		// In the case of Frame, use this callback only if it was overridden, since the original will cause navigation issues
		if (!viewArgs.cancel && (view.onBackPressed === Frame.prototype.onBackPressed || !view.onBackPressed())) {
			callSuper = view instanceof Frame ? !Frame.goBack() : true;
		}

		if (callSuper) {
			superFunc.call(activity);
		}
	}

	@profile
	public onRequestPermissionsResult(activity: any, requestCode: number, permissions: Array<string>, grantResults: Array<number>, superFunc: Function): void {
		if (Trace.isEnabled()) {
			Trace.write('NativeScriptActivity.onRequestPermissionsResult;', Trace.categories.NativeLifecycle);
		}

		Application.android.notify(<AndroidActivityRequestPermissionsEventData>{
			eventName: 'activityRequestPermissions',
			object: Application,
			android: Application.android,
			activity: activity,
			requestCode: requestCode,
			permissions: permissions,
			grantResults: grantResults,
		});
	}

	@profile
	public onActivityResult(activity: any, requestCode: number, resultCode: number, data: android.content.Intent, superFunc: Function): void {
		superFunc.call(activity, requestCode, resultCode, data);
		if (Trace.isEnabled()) {
			Trace.write(`NativeScriptActivity.onActivityResult(${requestCode}, ${resultCode}, ${data})`, Trace.categories.NativeLifecycle);
		}

		Application.android.notify(<AndroidActivityResultEventData>{
			eventName: 'activityResult',
			object: Application,
			android: Application.android,
			activity: activity,
			requestCode: requestCode,
			resultCode: resultCode,
			intent: data,
		});
	}

	public resetActivityContent(activity: androidx.appcompat.app.AppCompatActivity): void {
		if (this._rootView) {
			const manager = this._rootView._getFragmentManager();
			manager.executePendingTransactions();

			this._rootView._onRootViewReset();
		}
		// Delete previously cached root view in order to recreate it.
		this._rootView = null;
		this._subRootView = null;
		this.setActivityContent(activity, null, false);
		this._rootView.callLoaded();
	}

	// Paths that go trough this method:
	// 1. Application initial start - there is no rootView in callbacks.
	// 2. Application revived after Activity is destroyed. this._rootView should have been restored by id in onCreate.
	// 3. Livesync if rootView has no custom _onLivesync. this._rootView should have been cleared upfront. Launch event should not fired
	// 4. resetRootView method. this._rootView should have been cleared upfront. Launch event should not fired
	private setActivityContent(activity: androidx.appcompat.app.AppCompatActivity, savedInstanceState: android.os.Bundle, fireLaunchEvent: boolean): void {
		const rootView = new ContentView();
		activityRootViewsMap.set(rootView._domId, new WeakRef(rootView));
		// setup view as styleScopeHost
		rootView._setupAsRootView(activity);
		this._rootView = rootView;
		// sets root classes once rootView is ready...
		let subRootView = this._subRootView;
		// in case we recreate the activity, subRootView is already created.
		// we just want to set it as content
		if (subRootView) {
			if (subRootView.parent && subRootView.parent !== rootView) {
				try {
					// we might catch errors if the nativeView is already disposed
					subRootView.parent._removeView(subRootView);
				} catch (err) {}
			}
			rootView.content = subRootView;
		}
		Application.initRootView(rootView);
		if (isEmbedded()) {
			setEmbeddedView(rootView);
		} else {
			activity.setContentView(rootView.nativeViewProtected, new org.nativescript.widgets.CommonLayoutParams());
		}

		if (Trace.isEnabled()) {
			Trace.write(`Frame.setActivityContent rootView: ${rootView} subRootView: ${subRootView} shouldCreateRootFrame: false fireLaunchEvent: ${fireLaunchEvent}`, Trace.categories.NativeLifecycle);
		}

		const intent = activity.getIntent();
		subRootView = Application.createRootView(subRootView, fireLaunchEvent, {
			// todo: deprecate in favor of args.intent?
			android: intent,
			intent,
			savedInstanceState,
		});

		if (!subRootView) {
			// no root view created
			return;
		}
		this._subRootView = subRootView;
		if (subRootView.parent && subRootView.parent !== rootView) {
			subRootView.parent._removeView(subRootView);
		}
		rootView.content = subRootView;
	}
}
