/// <reference path="android-declarations.d.ts"/>

declare module androidx {
	export module activity {
		export class Api26Impl {
			public static class: java.lang.Class<androidx.activity.Api26Impl>;
			public static INSTANCE: androidx.activity.Api26Impl;
			public setPipParamsSourceRectHint(activity: globalAndroid.app.Activity, hint: globalAndroid.graphics.Rect): void;
		}
	}
}

declare module androidx {
	export module activity {
		export class Api34Impl {
			public static class: java.lang.Class<androidx.activity.Api34Impl>;
			public static INSTANCE: androidx.activity.Api34Impl;
			public touchX(backEvent: globalAndroid.window.BackEvent): number;
			public swipeEdge(backEvent: globalAndroid.window.BackEvent): number;
			public createOnBackEvent(touchX: number, touchY: number, progress: number, swipeEdge: number): globalAndroid.window.BackEvent;
			public touchY(backEvent: globalAndroid.window.BackEvent): number;
			public progress(backEvent: globalAndroid.window.BackEvent): number;
		}
	}
}

declare module androidx {
	export module activity {
		export class BackEventCompat {
			public static class: java.lang.Class<androidx.activity.BackEventCompat>;
			public static EDGE_LEFT: number = 0;
			public static EDGE_RIGHT: number = 1;
			public getProgress(): number;
			public toString(): string;
			public constructor(touchX: number, touchY: number, progress: number, swipeEdge: number);
			public toBackEvent(): globalAndroid.window.BackEvent;
			public constructor(backEvent: globalAndroid.window.BackEvent);
			public getTouchX(): number;
			public getSwipeEdge(): number;
			public getTouchY(): number;
		}
		export module BackEventCompat {
			export class Companion {
				public static class: java.lang.Class<androidx.activity.BackEventCompat.Companion>;
			}
			export class SwipeEdge {
				public static class: java.lang.Class<androidx.activity.BackEventCompat.SwipeEdge>;
				/**
				 * Constructs a new instance of the androidx.activity.BackEventCompat$SwipeEdge interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
				 */
				public constructor(implementation: {
				});
				public constructor();
			}
		}
	}
}

declare module androidx {
	export module activity {
		export class Cancellable {
			public static class: java.lang.Class<androidx.activity.Cancellable>;
			/**
			 * Constructs a new instance of the androidx.activity.Cancellable interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
			 */
			public constructor(implementation: {
				cancel(): void;
			});
			public constructor();
			public cancel(): void;
		}
	}
}

declare module androidx {
	export module activity {
		export class ComponentActivity implements androidx.activity.contextaware.ContextAware, androidx.activity.OnBackPressedDispatcherOwner, androidx.activity.result.ActivityResultRegistryOwner, androidx.activity.result.ActivityResultCaller, androidx.activity.FullyDrawnReporterOwner {
			public static class: java.lang.Class<androidx.activity.ComponentActivity>;
			public getSavedStateRegistry(): androidx.savedstate.SavedStateRegistry;
			public removeOnTrimMemoryListener(listener: androidx.core.util.Consumer<java.lang.Integer>): void;
			public initializeViewTreeOwners(): void;
			public getFullyDrawnReporter(): androidx.activity.FullyDrawnReporter;
			public addOnConfigurationChangedListener(listener: androidx.core.util.Consumer<globalAndroid.content.res.Configuration>): void;
			/** @deprecated */
			public onRetainCustomNonConfigurationInstance(): any;
			public onTrimMemory(this_: number): void;
			public onMultiWindowModeChanged(this_: boolean, isInMultiWindowMode: globalAndroid.content.res.Configuration): void;
			public removeOnPictureInPictureModeChangedListener(listener: androidx.core.util.Consumer<androidx.core.app.PictureInPictureModeChangedInfo>): void;
			public onCreatePanelMenu(featureId: number, menu: globalAndroid.view.Menu): boolean;
			public onCreate(savedInstanceState: globalAndroid.os.Bundle): void;
			public getDefaultViewModelProviderFactory(): androidx.lifecycle.ViewModelProvider.Factory;
			public peekAvailableContext(): globalAndroid.content.Context;
			/** @deprecated */
			public onBackPressed(): void;
			public addOnMultiWindowModeChangedListener(listener: androidx.core.util.Consumer<androidx.core.app.MultiWindowModeChangedInfo>): void;
			public onPanelClosed(featureId: number, menu: globalAndroid.view.Menu): void;
			public removeOnNewIntentListener(listener: androidx.core.util.Consumer<globalAndroid.content.Intent>): void;
			/** @deprecated */
			public getLastCustomNonConfigurationInstance(): any;
			public onConfigurationChanged(this_: globalAndroid.content.res.Configuration): void;
			public removeOnUserLeaveHintListener(listener: java.lang.Runnable): void;
			public invalidateMenu(): void;
			public constructor();
			/** @deprecated */
			public onPictureInPictureModeChanged(this_: boolean): void;
			public addMenuProvider(provider: androidx.core.view.MenuProvider, owner: androidx.lifecycle.LifecycleOwner, state: androidx.lifecycle.Lifecycle.State): void;
			public getViewModelStore(): androidx.lifecycle.ViewModelStore;
			public addOnContextAvailableListener(param0: androidx.activity.contextaware.OnContextAvailableListener): void;
			public onPreparePanel(featureId: number, view: globalAndroid.view.View, menu: globalAndroid.view.Menu): boolean;
			public onNewIntent(this_: globalAndroid.content.Intent): void;
			/** @deprecated */
			public startActivityForResult(intent: globalAndroid.content.Intent, requestCode: number): void;
			public registerForActivityResult(param0: androidx.activity.result.contract.ActivityResultContract<any,any>, param1: androidx.activity.result.ActivityResultCallback<any>): androidx.activity.result.ActivityResultLauncher<any>;
			public constructor(contentLayoutId: number);
			public removeOnContextAvailableListener(param0: androidx.activity.contextaware.OnContextAvailableListener): void;
			public removeOnContextAvailableListener(listener: androidx.activity.contextaware.OnContextAvailableListener): void;
			public registerForActivityResult(contract: androidx.activity.result.contract.ActivityResultContract<any,any>, registry: androidx.activity.result.ActivityResultRegistry, callback: androidx.activity.result.ActivityResultCallback<any>): androidx.activity.result.ActivityResultLauncher<any>;
			public addOnUserLeaveHintListener(listener: java.lang.Runnable): void;
			public onRetainNonConfigurationInstance(): any;
			public reportFullyDrawn(): void;
			public addOnContextAvailableListener(listener: androidx.activity.contextaware.OnContextAvailableListener): void;
			/** @deprecated */
			public startActivityForResult(intent: globalAndroid.content.Intent, requestCode: number, options: globalAndroid.os.Bundle): void;
			public setContentView(view: globalAndroid.view.View, params: globalAndroid.view.ViewGroup.LayoutParams): void;
			public getOnBackPressedDispatcher(): androidx.activity.OnBackPressedDispatcher;
			public onSaveInstanceState(outState: globalAndroid.os.Bundle): void;
			public onMenuItemSelected(featureId: number, item: globalAndroid.view.MenuItem): boolean;
			public getDefaultViewModelCreationExtras(): androidx.lifecycle.viewmodel.CreationExtras;
			/** @deprecated */
			public onMultiWindowModeChanged(this_: boolean): void;
			public removeOnConfigurationChangedListener(listener: androidx.core.util.Consumer<globalAndroid.content.res.Configuration>): void;
			public addOnTrimMemoryListener(listener: androidx.core.util.Consumer<java.lang.Integer>): void;
			public registerForActivityResult(contract: androidx.activity.result.contract.ActivityResultContract<any,any>, callback: androidx.activity.result.ActivityResultCallback<any>): androidx.activity.result.ActivityResultLauncher<any>;
			public removeOnMultiWindowModeChangedListener(listener: androidx.core.util.Consumer<androidx.core.app.MultiWindowModeChangedInfo>): void;
			public setContentView(view: globalAndroid.view.View): void;
			public addOnNewIntentListener(listener: androidx.core.util.Consumer<globalAndroid.content.Intent>): void;
			public onPictureInPictureModeChanged(this_: boolean, isInPictureInPictureMode: globalAndroid.content.res.Configuration): void;
			public setContentView(layoutResID: number): void;
			public getLifecycle(): androidx.lifecycle.Lifecycle;
			public registerForActivityResult(param0: androidx.activity.result.contract.ActivityResultContract<any,any>, param1: androidx.activity.result.ActivityResultRegistry, param2: androidx.activity.result.ActivityResultCallback<any>): androidx.activity.result.ActivityResultLauncher<any>;
			/** @deprecated */
			public startIntentSenderForResult(intent: globalAndroid.content.IntentSender, requestCode: number, fillInIntent: globalAndroid.content.Intent, flagsMask: number, flagsValues: number, extraFlags: number, options: globalAndroid.os.Bundle): void;
			public addMenuProvider(provider: androidx.core.view.MenuProvider): void;
			public onUserLeaveHint(): void;
			public addContentView(view: globalAndroid.view.View, params: globalAndroid.view.ViewGroup.LayoutParams): void;
			/** @deprecated */
			public startIntentSenderForResult(intent: globalAndroid.content.IntentSender, requestCode: number, fillInIntent: globalAndroid.content.Intent, flagsMask: number, flagsValues: number, extraFlags: number): void;
			public getActivityResultRegistry(): androidx.activity.result.ActivityResultRegistry;
			public removeMenuProvider(provider: androidx.core.view.MenuProvider): void;
			/** @deprecated */
			public onRequestPermissionsResult(requestCode: number, permissions: androidNative.Array<string>, grantResults: androidNative.Array<number>): void;
			/** @deprecated */
			public onActivityResult(requestCode: number, resultCode: number, data: globalAndroid.content.Intent): void;
			public addOnPictureInPictureModeChangedListener(listener: androidx.core.util.Consumer<androidx.core.app.PictureInPictureModeChangedInfo>): void;
			public addMenuProvider(provider: androidx.core.view.MenuProvider, owner: androidx.lifecycle.LifecycleOwner): void;
		}
		export module ComponentActivity {
			export class Api33Impl {
				public static class: java.lang.Class<androidx.activity.ComponentActivity.Api33Impl>;
				public static INSTANCE: androidx.activity.ComponentActivity.Api33Impl;
				public getOnBackInvokedDispatcher(activity: globalAndroid.app.Activity): globalAndroid.window.OnBackInvokedDispatcher;
			}
			export class Companion {
				public static class: java.lang.Class<androidx.activity.ComponentActivity.Companion>;
			}
			export class NonConfigurationInstances {
				public static class: java.lang.Class<androidx.activity.ComponentActivity.NonConfigurationInstances>;
				public getViewModelStore(): androidx.lifecycle.ViewModelStore;
				public setViewModelStore(value: androidx.lifecycle.ViewModelStore): void;
				public getCustom(): any;
				public setCustom(value: any): void;
				public constructor();
			}
			export class ReportFullyDrawnExecutor {
				public static class: java.lang.Class<androidx.activity.ComponentActivity.ReportFullyDrawnExecutor>;
				/**
				 * Constructs a new instance of the androidx.activity.ComponentActivity$ReportFullyDrawnExecutor interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
				 */
				public constructor(implementation: {
					viewCreated(param0: globalAndroid.view.View): void;
					activityDestroyed(): void;
				});
				public constructor();
				public viewCreated(param0: globalAndroid.view.View): void;
				public activityDestroyed(): void;
			}
			export class ReportFullyDrawnExecutorImpl extends androidx.activity.ComponentActivity.ReportFullyDrawnExecutor {
				public static class: java.lang.Class<androidx.activity.ComponentActivity.ReportFullyDrawnExecutorImpl>;
				public viewCreated(view: globalAndroid.view.View): void;
				public constructor(this$0: androidx.activity.ComponentActivity);
				public run(): void;
				public getOnDrawScheduled(): boolean;
				public setOnDrawScheduled(value: boolean): void;
				public onDraw(): void;
				public viewCreated(param0: globalAndroid.view.View): void;
				public activityDestroyed(): void;
				public getCurrentRunnable(): java.lang.Runnable;
				public getEndWatchTimeMillis(): number;
				public setCurrentRunnable(value: java.lang.Runnable): void;
				public execute(this_: java.lang.Runnable): void;
			}
		}
	}
}

declare module androidx {
	export module activity {
		export class ComponentDialog implements androidx.activity.OnBackPressedDispatcherOwner {
			public static class: java.lang.Class<androidx.activity.ComponentDialog>;
			public onStart(): void;
			public constructor(context: globalAndroid.content.Context);
			public getSavedStateRegistry(): androidx.savedstate.SavedStateRegistry;
			public setContentView(view: globalAndroid.view.View): void;
			public constructor(context: globalAndroid.content.Context, themeResId: number);
			public initializeViewTreeOwners(): void;
			public getLifecycle(): androidx.lifecycle.Lifecycle;
			public setContentView(layoutResID: number): void;
			public getOnBackPressedDispatcher(): androidx.activity.OnBackPressedDispatcher;
			public setContentView(view: globalAndroid.view.View, params: globalAndroid.view.ViewGroup.LayoutParams): void;
			public onBackPressed(): void;
			public addContentView(view: globalAndroid.view.View, params: globalAndroid.view.ViewGroup.LayoutParams): void;
			public onSaveInstanceState(): globalAndroid.os.Bundle;
			public onCreate(savedInstanceState: globalAndroid.os.Bundle): void;
			public onStop(): void;
		}
	}
}

declare module androidx {
	export module activity {
		export class EdgeToEdge {
			public static class: java.lang.Class<androidx.activity.EdgeToEdge>;
			public static enable($this$enableEdgeToEdge: androidx.activity.ComponentActivity): void;
			public static enable($this$enableEdgeToEdge: androidx.activity.ComponentActivity, statusBarStyle: androidx.activity.SystemBarStyle): void;
			public static getDefaultDarkScrim(): number;
			public static getDefaultLightScrim(): number;
			public static enable(activity: androidx.activity.ComponentActivity, it: androidx.activity.SystemBarStyle, view: androidx.activity.SystemBarStyle): void;
		}
	}
}

declare module androidx {
	export module activity {
		export class EdgeToEdgeApi21 extends androidx.activity.EdgeToEdgeBase {
			public static class: java.lang.Class<androidx.activity.EdgeToEdgeApi21>;
			public setUp(param0: androidx.activity.SystemBarStyle, param1: androidx.activity.SystemBarStyle, param2: globalAndroid.view.Window, param3: globalAndroid.view.View, param4: boolean, param5: boolean): void;
			public constructor();
			public adjustLayoutInDisplayCutoutMode(param0: globalAndroid.view.Window): void;
			public setUp(statusBarStyle: androidx.activity.SystemBarStyle, navigationBarStyle: androidx.activity.SystemBarStyle, window: globalAndroid.view.Window, view: globalAndroid.view.View, statusBarIsDark: boolean, navigationBarIsDark: boolean): void;
		}
	}
}

declare module androidx {
	export module activity {
		export class EdgeToEdgeApi23 extends androidx.activity.EdgeToEdgeBase {
			public static class: java.lang.Class<androidx.activity.EdgeToEdgeApi23>;
			public setUp(param0: androidx.activity.SystemBarStyle, param1: androidx.activity.SystemBarStyle, param2: globalAndroid.view.Window, param3: globalAndroid.view.View, param4: boolean, param5: boolean): void;
			public constructor();
			public adjustLayoutInDisplayCutoutMode(param0: globalAndroid.view.Window): void;
			public setUp(statusBarStyle: androidx.activity.SystemBarStyle, navigationBarStyle: androidx.activity.SystemBarStyle, window: globalAndroid.view.Window, view: globalAndroid.view.View, statusBarIsDark: boolean, navigationBarIsDark: boolean): void;
		}
	}
}

declare module androidx {
	export module activity {
		export class EdgeToEdgeApi26 extends androidx.activity.EdgeToEdgeBase {
			public static class: java.lang.Class<androidx.activity.EdgeToEdgeApi26>;
			public setUp(param0: androidx.activity.SystemBarStyle, param1: androidx.activity.SystemBarStyle, param2: globalAndroid.view.Window, param3: globalAndroid.view.View, param4: boolean, param5: boolean): void;
			public constructor();
			public setUp($this$setUp_u24lambda_u240: androidx.activity.SystemBarStyle, this_: androidx.activity.SystemBarStyle, statusBarStyle: globalAndroid.view.Window, navigationBarStyle: globalAndroid.view.View, window: boolean, view: boolean): void;
			public adjustLayoutInDisplayCutoutMode(param0: globalAndroid.view.Window): void;
		}
	}
}

declare module androidx {
	export module activity {
		export class EdgeToEdgeApi28 extends androidx.activity.EdgeToEdgeApi26 {
			public static class: java.lang.Class<androidx.activity.EdgeToEdgeApi28>;
			public setUp(param0: androidx.activity.SystemBarStyle, param1: androidx.activity.SystemBarStyle, param2: globalAndroid.view.Window, param3: globalAndroid.view.View, param4: boolean, param5: boolean): void;
			public constructor();
			public adjustLayoutInDisplayCutoutMode(window: globalAndroid.view.Window): void;
			public adjustLayoutInDisplayCutoutMode(param0: globalAndroid.view.Window): void;
		}
	}
}

declare module androidx {
	export module activity {
		export class EdgeToEdgeApi29 extends androidx.activity.EdgeToEdgeApi28 {
			public static class: java.lang.Class<androidx.activity.EdgeToEdgeApi29>;
			public setUp(param0: androidx.activity.SystemBarStyle, param1: androidx.activity.SystemBarStyle, param2: globalAndroid.view.Window, param3: globalAndroid.view.View, param4: boolean, param5: boolean): void;
			public constructor();
			public setUp($this$setUp_u24lambda_u240: androidx.activity.SystemBarStyle, this_: androidx.activity.SystemBarStyle, statusBarStyle: globalAndroid.view.Window, navigationBarStyle: globalAndroid.view.View, window: boolean, view: boolean): void;
			public adjustLayoutInDisplayCutoutMode(param0: globalAndroid.view.Window): void;
		}
	}
}

declare module androidx {
	export module activity {
		export class EdgeToEdgeApi30 extends androidx.activity.EdgeToEdgeApi29 {
			public static class: java.lang.Class<androidx.activity.EdgeToEdgeApi30>;
			public setUp(param0: androidx.activity.SystemBarStyle, param1: androidx.activity.SystemBarStyle, param2: globalAndroid.view.Window, param3: globalAndroid.view.View, param4: boolean, param5: boolean): void;
			public constructor();
			public adjustLayoutInDisplayCutoutMode(window: globalAndroid.view.Window): void;
			public adjustLayoutInDisplayCutoutMode(param0: globalAndroid.view.Window): void;
		}
	}
}

declare module androidx {
	export module activity {
		export class EdgeToEdgeBase extends androidx.activity.EdgeToEdgeImpl {
			public static class: java.lang.Class<androidx.activity.EdgeToEdgeBase>;
			public setUp(param0: androidx.activity.SystemBarStyle, param1: androidx.activity.SystemBarStyle, param2: globalAndroid.view.Window, param3: globalAndroid.view.View, param4: boolean, param5: boolean): void;
			public constructor();
			public adjustLayoutInDisplayCutoutMode(window: globalAndroid.view.Window): void;
			public adjustLayoutInDisplayCutoutMode(param0: globalAndroid.view.Window): void;
			public setUp(statusBarStyle: androidx.activity.SystemBarStyle, navigationBarStyle: androidx.activity.SystemBarStyle, window: globalAndroid.view.Window, view: globalAndroid.view.View, statusBarIsDark: boolean, navigationBarIsDark: boolean): void;
		}
	}
}

declare module androidx {
	export module activity {
		export class EdgeToEdgeImpl {
			public static class: java.lang.Class<androidx.activity.EdgeToEdgeImpl>;
			/**
			 * Constructs a new instance of the androidx.activity.EdgeToEdgeImpl interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
			 */
			public constructor(implementation: {
				setUp(param0: androidx.activity.SystemBarStyle, param1: androidx.activity.SystemBarStyle, param2: globalAndroid.view.Window, param3: globalAndroid.view.View, param4: boolean, param5: boolean): void;
				adjustLayoutInDisplayCutoutMode(param0: globalAndroid.view.Window): void;
			});
			public constructor();
			public setUp(param0: androidx.activity.SystemBarStyle, param1: androidx.activity.SystemBarStyle, param2: globalAndroid.view.Window, param3: globalAndroid.view.View, param4: boolean, param5: boolean): void;
			public adjustLayoutInDisplayCutoutMode(param0: globalAndroid.view.Window): void;
		}
	}
}

declare module androidx {
	export module activity {
		export class FullyDrawnReporter {
			public static class: java.lang.Class<androidx.activity.FullyDrawnReporter>;
			public removeOnReportDrawnListener(this_: any): void;
			public fullyDrawnReported(): void;
			public isFullyDrawnReported(): boolean;
			public removeReporter(): void;
			public constructor(executor: java.util.concurrent.Executor, reportFullyDrawn: any);
			public addOnReportDrawnListener(callImmediately: any): void;
			public addReporter(): void;
		}
	}
}

declare module androidx {
	export module activity {
		export class FullyDrawnReporterOwner {
			public static class: java.lang.Class<androidx.activity.FullyDrawnReporterOwner>;
			/**
			 * Constructs a new instance of the androidx.activity.FullyDrawnReporterOwner interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
			 */
			public constructor(implementation: {
				getFullyDrawnReporter(): androidx.activity.FullyDrawnReporter;
			});
			public constructor();
			public getFullyDrawnReporter(): androidx.activity.FullyDrawnReporter;
		}
	}
}

declare module androidx {
	export module activity {
		export class ImmLeaksCleaner {
			public static class: java.lang.Class<androidx.activity.ImmLeaksCleaner>;
			public onStateChanged(servedView: androidx.lifecycle.LifecycleOwner, event: androidx.lifecycle.Lifecycle.Event): void;
			public constructor(activity: globalAndroid.app.Activity);
		}
		export module ImmLeaksCleaner {
			export abstract class Cleaner {
				public static class: java.lang.Class<androidx.activity.ImmLeaksCleaner.Cleaner>;
				public getServedView(param0: globalAndroid.view.inputmethod.InputMethodManager): globalAndroid.view.View;
				public getLock(param0: globalAndroid.view.inputmethod.InputMethodManager): any;
				public clearNextServedView(param0: globalAndroid.view.inputmethod.InputMethodManager): boolean;
			}
			export class Companion {
				public static class: java.lang.Class<androidx.activity.ImmLeaksCleaner.Companion>;
				public getCleaner(): androidx.activity.ImmLeaksCleaner.Cleaner;
			}
			export class FailedInitialization extends androidx.activity.ImmLeaksCleaner.Cleaner {
				public static class: java.lang.Class<androidx.activity.ImmLeaksCleaner.FailedInitialization>;
				public static INSTANCE: androidx.activity.ImmLeaksCleaner.FailedInitialization;
				public getLock($this$lock: globalAndroid.view.inputmethod.InputMethodManager): any;
				public getServedView($this$servedView: globalAndroid.view.inputmethod.InputMethodManager): globalAndroid.view.View;
				public clearNextServedView($this$clearNextServedView: globalAndroid.view.inputmethod.InputMethodManager): boolean;
			}
			export class ValidCleaner extends androidx.activity.ImmLeaksCleaner.Cleaner {
				public static class: java.lang.Class<androidx.activity.ImmLeaksCleaner.ValidCleaner>;
				public constructor(hField: java.lang.reflect.Field, servedViewField: java.lang.reflect.Field, nextServedViewField: java.lang.reflect.Field);
				public getServedView(e: globalAndroid.view.inputmethod.InputMethodManager): globalAndroid.view.View;
				public clearNextServedView(this_: globalAndroid.view.inputmethod.InputMethodManager): boolean;
				public getLock(this_: globalAndroid.view.inputmethod.InputMethodManager): any;
			}
		}
	}
}

declare module androidx {
	export module activity {
		export abstract class OnBackPressedCallback {
			public static class: java.lang.Class<androidx.activity.OnBackPressedCallback>;
			public isEnabled(): boolean;
			public addCancellable(cancellable: androidx.activity.Cancellable): void;
			public handleOnBackStarted(backEvent: androidx.activity.BackEventCompat): void;
			public setEnabledChangedCallback$activity_release(value: any): void;
			public getEnabledChangedCallback$activity_release(): any;
			public handleOnBackProgressed(backEvent: androidx.activity.BackEventCompat): void;
			public constructor(enabled: boolean);
			public handleOnBackPressed(): void;
			public removeCancellable(cancellable: androidx.activity.Cancellable): void;
			public handleOnBackCancelled(): void;
			public remove(): void;
			public setEnabled(value: boolean): void;
		}
	}
}

declare module androidx {
	export module activity {
		export class OnBackPressedDispatcher {
			public static class: java.lang.Class<androidx.activity.OnBackPressedDispatcher>;
			public constructor(fallbackOnBackPressed: java.lang.Runnable, onHasEnabledCallbacksChanged: androidx.core.util.Consumer<java.lang.Boolean>);
			public dispatchOnBackProgressed(backEvent: androidx.activity.BackEventCompat): void;
			public constructor(fallbackOnBackPressed: java.lang.Runnable);
			public addCancellableCallback$activity_release(this_: androidx.activity.OnBackPressedCallback): androidx.activity.Cancellable;
			public addCallback(this_: androidx.lifecycle.LifecycleOwner, owner: androidx.activity.OnBackPressedCallback): void;
			public onBackPressed(): void;
			public dispatchOnBackCancelled(): void;
			public setOnBackInvokedDispatcher(invoker: globalAndroid.window.OnBackInvokedDispatcher): void;
			public addCallback(onBackPressedCallback: androidx.activity.OnBackPressedCallback): void;
			public dispatchOnBackStarted(backEvent: androidx.activity.BackEventCompat): void;
			public constructor();
			public hasEnabledCallbacks(): boolean;
		}
		export module OnBackPressedDispatcher {
			export class Api33Impl {
				public static class: java.lang.Class<androidx.activity.OnBackPressedDispatcher.Api33Impl>;
				public static INSTANCE: androidx.activity.OnBackPressedDispatcher.Api33Impl;
				public createOnBackInvokedCallback(onBackInvoked: any): globalAndroid.window.OnBackInvokedCallback;
				public registerOnBackInvokedCallback(onBackInvokedCallback: any, this_: number, dispatcher: any): void;
				public unregisterOnBackInvokedCallback(onBackInvokedCallback: any, this_: any): void;
			}
			export class Api34Impl {
				public static class: java.lang.Class<androidx.activity.OnBackPressedDispatcher.Api34Impl>;
				public static INSTANCE: androidx.activity.OnBackPressedDispatcher.Api34Impl;
				public createOnBackAnimationCallback(onBackStarted: any, onBackProgressed: any, onBackInvoked: any, onBackCancelled: any): globalAndroid.window.OnBackInvokedCallback;
			}
			export class LifecycleOnBackPressedCancellable extends androidx.activity.Cancellable {
				public static class: java.lang.Class<androidx.activity.OnBackPressedDispatcher.LifecycleOnBackPressedCancellable>;
				public onStateChanged(source: androidx.lifecycle.LifecycleOwner, event: androidx.lifecycle.Lifecycle.Event): void;
				public cancel(): void;
				public constructor(this$0: androidx.lifecycle.Lifecycle, lifecycle: androidx.activity.OnBackPressedCallback);
			}
			export class OnBackPressedCancellable extends androidx.activity.Cancellable {
				public static class: java.lang.Class<androidx.activity.OnBackPressedDispatcher.OnBackPressedCancellable>;
				public constructor(this$0: androidx.activity.OnBackPressedCallback);
				public cancel(): void;
			}
		}
	}
}

declare module androidx {
	export module activity {
		export class OnBackPressedDispatcherOwner {
			public static class: java.lang.Class<androidx.activity.OnBackPressedDispatcherOwner>;
			/**
			 * Constructs a new instance of the androidx.activity.OnBackPressedDispatcherOwner interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
			 */
			public constructor(implementation: {
				getOnBackPressedDispatcher(): androidx.activity.OnBackPressedDispatcher;
			});
			public constructor();
			public getOnBackPressedDispatcher(): androidx.activity.OnBackPressedDispatcher;
		}
	}
}

declare module androidx {
	export module activity {
		export class SystemBarStyle {
			public static class: java.lang.Class<androidx.activity.SystemBarStyle>;
			public getDarkScrim$activity_release(): number;
			public getNightMode$activity_release(): number;
			public getScrim$activity_release(isDark: boolean): number;
			public static light(scrim: number, darkScrim: number): androidx.activity.SystemBarStyle;
			public getDetectDarkMode$activity_release(): any;
			public getScrimWithEnforcedContrast$activity_release(isDark: boolean): number;
			public static dark(scrim: number): androidx.activity.SystemBarStyle;
			public static auto(lightScrim: number, darkScrim: number, detectDarkMode: boolean): androidx.activity.SystemBarStyle;
			public static auto(lightScrim: number, darkScrim: number): androidx.activity.SystemBarStyle;
		}
		export module SystemBarStyle {
			export class Companion {
				public static class: java.lang.Class<androidx.activity.SystemBarStyle.Companion>;
				public dark(scrim: number): androidx.activity.SystemBarStyle;
				public auto(lightScrim: number, darkScrim: number): androidx.activity.SystemBarStyle;
				public auto(lightScrim: number, darkScrim: number, detectDarkMode: boolean): androidx.activity.SystemBarStyle;
				public light(scrim: number, darkScrim: number): androidx.activity.SystemBarStyle;
			}
		}
	}
}

declare module androidx {
	export module activity {
		export class ViewTreeFullyDrawnReporterOwner {
			public static class: java.lang.Class<androidx.activity.ViewTreeFullyDrawnReporterOwner>;
			public static get($this$findViewTreeFullyDrawnReporterOwner: globalAndroid.view.View): androidx.activity.FullyDrawnReporterOwner;
			public static set($this$setViewTreeFullyDrawnReporterOwner: globalAndroid.view.View, fullyDrawnReporterOwner: androidx.activity.FullyDrawnReporterOwner): void;
		}
	}
}

declare module androidx {
	export module activity {
		export class ViewTreeOnBackPressedDispatcherOwner {
			public static class: java.lang.Class<androidx.activity.ViewTreeOnBackPressedDispatcherOwner>;
			public static set($this$setViewTreeOnBackPressedDispatcherOwner: globalAndroid.view.View, onBackPressedDispatcherOwner: androidx.activity.OnBackPressedDispatcherOwner): void;
			public static get($this$findViewTreeOnBackPressedDispatcherOwner: globalAndroid.view.View): androidx.activity.OnBackPressedDispatcherOwner;
		}
	}
}

declare module androidx {
	export module activity {
		export module contextaware {
			export class ContextAware {
				public static class: java.lang.Class<androidx.activity.contextaware.ContextAware>;
				/**
				 * Constructs a new instance of the androidx.activity.contextaware.ContextAware interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
				 */
				public constructor(implementation: {
					peekAvailableContext(): globalAndroid.content.Context;
					addOnContextAvailableListener(param0: androidx.activity.contextaware.OnContextAvailableListener): void;
					removeOnContextAvailableListener(param0: androidx.activity.contextaware.OnContextAvailableListener): void;
				});
				public constructor();
				public addOnContextAvailableListener(param0: androidx.activity.contextaware.OnContextAvailableListener): void;
				public peekAvailableContext(): globalAndroid.content.Context;
				public removeOnContextAvailableListener(param0: androidx.activity.contextaware.OnContextAvailableListener): void;
			}
		}
	}
}

declare module androidx {
	export module activity {
		export module contextaware {
			export class ContextAwareHelper {
				public static class: java.lang.Class<androidx.activity.contextaware.ContextAwareHelper>;
				public addOnContextAvailableListener(it: androidx.activity.contextaware.OnContextAvailableListener): void;
				public removeOnContextAvailableListener(listener: androidx.activity.contextaware.OnContextAvailableListener): void;
				public clearAvailableContext(): void;
				public peekAvailableContext(): globalAndroid.content.Context;
				public dispatchOnContextAvailable(this_: globalAndroid.content.Context): void;
				public constructor();
			}
		}
	}
}

declare module androidx {
	export module activity {
		export module contextaware {
			export class OnContextAvailableListener {
				public static class: java.lang.Class<androidx.activity.contextaware.OnContextAvailableListener>;
				/**
				 * Constructs a new instance of the androidx.activity.contextaware.OnContextAvailableListener interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
				 */
				public constructor(implementation: {
					onContextAvailable(param0: globalAndroid.content.Context): void;
				});
				public constructor();
				public onContextAvailable(param0: globalAndroid.content.Context): void;
			}
		}
	}
}

declare module androidx {
	export module activity {
		export module result {
			export class ActivityResult {
				public static class: java.lang.Class<androidx.activity.result.ActivityResult>;
				public static CREATOR: globalAndroid.os.Parcelable.Creator<androidx.activity.result.ActivityResult>;
				public getData(): globalAndroid.content.Intent;
				public describeContents(): number;
				public constructor(resultCode: number, data: globalAndroid.content.Intent);
				public writeToParcel(dest: globalAndroid.os.Parcel, flags: number): void;
				public constructor(parcel: globalAndroid.os.Parcel);
				public toString(): string;
				public static resultCodeToString(resultCode: number): string;
				public getResultCode(): number;
			}
			export module ActivityResult {
				export class Companion {
					public static class: java.lang.Class<androidx.activity.result.ActivityResult.Companion>;
					public resultCodeToString(resultCode: number): string;
				}
			}
		}
	}
}

declare module androidx {
	export module activity {
		export module result {
			export class ActivityResultCallback<O>  extends java.lang.Object {
				public static class: java.lang.Class<androidx.activity.result.ActivityResultCallback<any>>;
				/**
				 * Constructs a new instance of the androidx.activity.result.ActivityResultCallback<any> interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
				 */
				public constructor(implementation: {
					onActivityResult(param0: O): void;
				});
				public constructor();
				public onActivityResult(param0: O): void;
			}
		}
	}
}

declare module androidx {
	export module activity {
		export module result {
			export class ActivityResultCaller {
				public static class: java.lang.Class<androidx.activity.result.ActivityResultCaller>;
				/**
				 * Constructs a new instance of the androidx.activity.result.ActivityResultCaller interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
				 */
				public constructor(implementation: {
					registerForActivityResult(param0: androidx.activity.result.contract.ActivityResultContract<any,any>, param1: androidx.activity.result.ActivityResultCallback<any>): androidx.activity.result.ActivityResultLauncher<any>;
					registerForActivityResult(param0: androidx.activity.result.contract.ActivityResultContract<any,any>, param1: androidx.activity.result.ActivityResultRegistry, param2: androidx.activity.result.ActivityResultCallback<any>): androidx.activity.result.ActivityResultLauncher<any>;
				});
				public constructor();
				public registerForActivityResult(param0: androidx.activity.result.contract.ActivityResultContract<any,any>, param1: androidx.activity.result.ActivityResultRegistry, param2: androidx.activity.result.ActivityResultCallback<any>): androidx.activity.result.ActivityResultLauncher<any>;
				public registerForActivityResult(param0: androidx.activity.result.contract.ActivityResultContract<any,any>, param1: androidx.activity.result.ActivityResultCallback<any>): androidx.activity.result.ActivityResultLauncher<any>;
			}
		}
	}
}

declare module androidx {
	export module activity {
		export module result {
			export class ActivityResultCallerLauncher<I, O>  extends androidx.activity.result.ActivityResultLauncher<any> {
				public static class: java.lang.Class<androidx.activity.result.ActivityResultCallerLauncher<any,any>>;
				public unregister(): void;
				public getCallerInput(): any;
				public constructor(launcher: androidx.activity.result.ActivityResultLauncher<any>, callerContract: androidx.activity.result.contract.ActivityResultContract<any,any>, callerInput: any);
				public getContract(): androidx.activity.result.contract.ActivityResultContract<any,any>;
				public launch(input: any, options: androidx.core.app.ActivityOptionsCompat): void;
				public launch(param0: any, param1: androidx.core.app.ActivityOptionsCompat): void;
				public getCallerContract(): androidx.activity.result.contract.ActivityResultContract<any,any>;
				public launch(input: any): void;
				public constructor();
			}
		}
	}
}

declare module androidx {
	export module activity {
		export module result {
			export abstract class ActivityResultLauncher<I>  extends java.lang.Object {
				public static class: java.lang.Class<androidx.activity.result.ActivityResultLauncher<any>>;
				public unregister(): void;
				public launch(param0: I, param1: androidx.core.app.ActivityOptionsCompat): void;
				public getContract(): androidx.activity.result.contract.ActivityResultContract<I,any>;
				public launch(input: I): void;
				public constructor();
			}
		}
	}
}

declare module androidx {
	export module activity {
		export module result {
			export abstract class ActivityResultRegistry {
				public static class: java.lang.Class<androidx.activity.result.ActivityResultRegistry>;
				public register(pendingResult: string, this_: androidx.activity.result.contract.ActivityResultContract<any,any>, key: androidx.activity.result.ActivityResultCallback<any>): androidx.activity.result.ActivityResultLauncher<any>;
				public unregister$activity_release(pendingResult: string): void;
				public register(lifecycle: string, lifecycleContainer: androidx.lifecycle.LifecycleOwner, observer: androidx.activity.result.contract.ActivityResultContract<any,any>, this_: androidx.activity.result.ActivityResultCallback<any>): androidx.activity.result.ActivityResultLauncher<any>;
				public dispatchResult(this_: number, requestCode: number, resultCode: globalAndroid.content.Intent): boolean;
				public onLaunch(param0: number, param1: androidx.activity.result.contract.ActivityResultContract<any,any>, param2: any, param3: androidx.core.app.ActivityOptionsCompat): void;
				public onSaveInstanceState(outState: globalAndroid.os.Bundle): void;
				public dispatchResult(key: number, callbackAndContract: any): boolean;
				public onRestoreInstanceState(key: globalAndroid.os.Bundle): void;
				public constructor();
			}
			export module ActivityResultRegistry {
				export class CallbackAndContract<O>  extends java.lang.Object {
					public static class: java.lang.Class<androidx.activity.result.ActivityResultRegistry.CallbackAndContract<any>>;
					public constructor(callback: androidx.activity.result.ActivityResultCallback<O>, contract: androidx.activity.result.contract.ActivityResultContract<any,O>);
					public getCallback(): androidx.activity.result.ActivityResultCallback<O>;
					public getContract(): androidx.activity.result.contract.ActivityResultContract<any,O>;
				}
				export class Companion {
					public static class: java.lang.Class<androidx.activity.result.ActivityResultRegistry.Companion>;
				}
				export class LifecycleContainer {
					public static class: java.lang.Class<androidx.activity.result.ActivityResultRegistry.LifecycleContainer>;
					public clearObservers(): void;
					public constructor(lifecycle: androidx.lifecycle.Lifecycle);
					public getLifecycle(): androidx.lifecycle.Lifecycle;
					public addObserver(observer: androidx.lifecycle.LifecycleEventObserver): void;
				}
			}
		}
	}
}

declare module androidx {
	export module activity {
		export module result {
			export class ActivityResultRegistryOwner {
				public static class: java.lang.Class<androidx.activity.result.ActivityResultRegistryOwner>;
				/**
				 * Constructs a new instance of the androidx.activity.result.ActivityResultRegistryOwner interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
				 */
				public constructor(implementation: {
					getActivityResultRegistry(): androidx.activity.result.ActivityResultRegistry;
				});
				public constructor();
				public getActivityResultRegistry(): androidx.activity.result.ActivityResultRegistry;
			}
		}
	}
}

declare module androidx {
	export module activity {
		export module result {
			export class IntentSenderRequest {
				public static class: java.lang.Class<androidx.activity.result.IntentSenderRequest>;
				public static CREATOR: globalAndroid.os.Parcelable.Creator<androidx.activity.result.IntentSenderRequest>;
				public describeContents(): number;
				public writeToParcel(dest: globalAndroid.os.Parcel, flags: number): void;
				public getFlagsValues(): number;
				public getIntentSender(): globalAndroid.content.IntentSender;
				public constructor(parcel: globalAndroid.os.Parcel);
				public constructor(intentSender: globalAndroid.content.IntentSender, fillInIntent: globalAndroid.content.Intent, flagsMask: number, flagsValues: number);
				public getFillInIntent(): globalAndroid.content.Intent;
				public getFlagsMask(): number;
			}
			export module IntentSenderRequest {
				export class Builder {
					public static class: java.lang.Class<androidx.activity.result.IntentSenderRequest.Builder>;
					public setFillInIntent(fillInIntent: globalAndroid.content.Intent): androidx.activity.result.IntentSenderRequest.Builder;
					public build(): androidx.activity.result.IntentSenderRequest;
					public constructor(intentSender: globalAndroid.content.IntentSender);
					public setFlags(values: number, mask: number): androidx.activity.result.IntentSenderRequest.Builder;
					public constructor(pendingIntent: globalAndroid.app.PendingIntent);
				}
				export module Builder {
					export class Flag {
						public static class: java.lang.Class<androidx.activity.result.IntentSenderRequest.Builder.Flag>;
						/**
						 * Constructs a new instance of the androidx.activity.result.IntentSenderRequest$Builder$Flag interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
						 */
						public constructor(implementation: {
						});
						public constructor();
					}
				}
				export class Companion {
					public static class: java.lang.Class<androidx.activity.result.IntentSenderRequest.Companion>;
				}
			}
		}
	}
}

declare module androidx {
	export module activity {
		export module result {
			export class PickVisualMediaRequest {
				public static class: java.lang.Class<androidx.activity.result.PickVisualMediaRequest>;
				public setMediaType$activity_release(value: androidx.activity.result.contract.ActivityResultContracts.PickVisualMedia.VisualMediaType): void;
				public getMediaType(): androidx.activity.result.contract.ActivityResultContracts.PickVisualMedia.VisualMediaType;
				public constructor();
			}
			export module PickVisualMediaRequest {
				export class Builder {
					public static class: java.lang.Class<androidx.activity.result.PickVisualMediaRequest.Builder>;
					public constructor();
					public setMediaType(mediaType: androidx.activity.result.contract.ActivityResultContracts.PickVisualMedia.VisualMediaType): androidx.activity.result.PickVisualMediaRequest.Builder;
					public build(): androidx.activity.result.PickVisualMediaRequest;
				}
			}
		}
	}
}

declare module androidx {
	export module activity {
		export module result {
			export module contract {
				export abstract class ActivityResultContract<I, O>  extends java.lang.Object {
					public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContract<any,any>>;
					public constructor();
					public createIntent(param0: globalAndroid.content.Context, param1: I): globalAndroid.content.Intent;
					public parseResult(param0: number, param1: globalAndroid.content.Intent): O;
					public getSynchronousResult(context: globalAndroid.content.Context, input: I): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<O>;
				}
				export module ActivityResultContract {
					export class SynchronousResult<T>  extends java.lang.Object {
						public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContract.SynchronousResult<any>>;
						public getValue(): T;
						public constructor(value: T);
					}
				}
			}
		}
	}
}

declare module androidx {
	export module activity {
		export module result {
			export module contract {
				export class ActivityResultContracts {
					public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts>;
				}
				export module ActivityResultContracts {
					export class CaptureVideo extends androidx.activity.result.contract.ActivityResultContract<globalAndroid.net.Uri,java.lang.Boolean> {
						public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts.CaptureVideo>;
						public parseResult(param0: number, param1: globalAndroid.content.Intent): any;
						public constructor();
						public createIntent(context: globalAndroid.content.Context, input: globalAndroid.net.Uri): globalAndroid.content.Intent;
						public createIntent(param0: globalAndroid.content.Context, param1: any): globalAndroid.content.Intent;
						public parseResult(resultCode: number, intent: globalAndroid.content.Intent): java.lang.Boolean;
						public getSynchronousResult(context: globalAndroid.content.Context, input: any): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<any>;
						public getSynchronousResult(context: globalAndroid.content.Context, input: globalAndroid.net.Uri): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<java.lang.Boolean>;
					}
					export class CreateDocument extends androidx.activity.result.contract.ActivityResultContract<string,globalAndroid.net.Uri> {
						public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts.CreateDocument>;
						public createIntent(context: globalAndroid.content.Context, input: string): globalAndroid.content.Intent;
						public parseResult(param0: number, param1: globalAndroid.content.Intent): any;
						public constructor();
						public getSynchronousResult(context: globalAndroid.content.Context, input: string): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<globalAndroid.net.Uri>;
						public constructor(mimeType: string);
						/** @deprecated */
						public constructor();
						public createIntent(param0: globalAndroid.content.Context, param1: any): globalAndroid.content.Intent;
						public getSynchronousResult(context: globalAndroid.content.Context, input: any): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<any>;
						public parseResult(it: number, this_: globalAndroid.content.Intent): globalAndroid.net.Uri;
					}
					export class GetContent extends androidx.activity.result.contract.ActivityResultContract<string,globalAndroid.net.Uri> {
						public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts.GetContent>;
						public createIntent(context: globalAndroid.content.Context, input: string): globalAndroid.content.Intent;
						public parseResult(param0: number, param1: globalAndroid.content.Intent): any;
						public constructor();
						public getSynchronousResult(context: globalAndroid.content.Context, input: string): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<globalAndroid.net.Uri>;
						public createIntent(param0: globalAndroid.content.Context, param1: any): globalAndroid.content.Intent;
						public getSynchronousResult(context: globalAndroid.content.Context, input: any): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<any>;
						public parseResult(it: number, this_: globalAndroid.content.Intent): globalAndroid.net.Uri;
					}
					export class GetMultipleContents extends androidx.activity.result.contract.ActivityResultContract<string,java.util.List<globalAndroid.net.Uri>> {
						public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts.GetMultipleContents>;
						public createIntent(context: globalAndroid.content.Context, input: string): globalAndroid.content.Intent;
						public parseResult(param0: number, param1: globalAndroid.content.Intent): any;
						public constructor();
						public createIntent(param0: globalAndroid.content.Context, param1: any): globalAndroid.content.Intent;
						public parseResult(it: number, this_: globalAndroid.content.Intent): java.util.List<globalAndroid.net.Uri>;
						public getSynchronousResult(context: globalAndroid.content.Context, input: string): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<java.util.List<globalAndroid.net.Uri>>;
						public getSynchronousResult(context: globalAndroid.content.Context, input: any): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<any>;
					}
					export module GetMultipleContents {
						export class Companion {
							public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts.GetMultipleContents.Companion>;
							public getClipDataUris$activity_release(data: globalAndroid.content.Intent): java.util.List<globalAndroid.net.Uri>;
						}
					}
					export class OpenDocument extends androidx.activity.result.contract.ActivityResultContract<androidNative.Array<string>,globalAndroid.net.Uri> {
						public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts.OpenDocument>;
						public parseResult(param0: number, param1: globalAndroid.content.Intent): any;
						public constructor();
						public createIntent(param0: globalAndroid.content.Context, param1: any): globalAndroid.content.Intent;
						public getSynchronousResult(context: globalAndroid.content.Context, input: any): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<any>;
						public parseResult(it: number, this_: globalAndroid.content.Intent): globalAndroid.net.Uri;
						public getSynchronousResult(context: globalAndroid.content.Context, input: androidNative.Array<string>): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<globalAndroid.net.Uri>;
						public createIntent(context: globalAndroid.content.Context, input: androidNative.Array<string>): globalAndroid.content.Intent;
					}
					export class OpenDocumentTree extends androidx.activity.result.contract.ActivityResultContract<globalAndroid.net.Uri,globalAndroid.net.Uri> {
						public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts.OpenDocumentTree>;
						public parseResult(param0: number, param1: globalAndroid.content.Intent): any;
						public constructor();
						public getSynchronousResult(context: globalAndroid.content.Context, input: globalAndroid.net.Uri): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<globalAndroid.net.Uri>;
						public createIntent(param0: globalAndroid.content.Context, param1: any): globalAndroid.content.Intent;
						public getSynchronousResult(context: globalAndroid.content.Context, input: any): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<any>;
						public createIntent(this_: globalAndroid.content.Context, context: globalAndroid.net.Uri): globalAndroid.content.Intent;
						public parseResult(it: number, this_: globalAndroid.content.Intent): globalAndroid.net.Uri;
					}
					export class OpenMultipleDocuments extends androidx.activity.result.contract.ActivityResultContract<androidNative.Array<string>,java.util.List<globalAndroid.net.Uri>> {
						public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts.OpenMultipleDocuments>;
						public parseResult(param0: number, param1: globalAndroid.content.Intent): any;
						public constructor();
						public getSynchronousResult(context: globalAndroid.content.Context, input: androidNative.Array<string>): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<java.util.List<globalAndroid.net.Uri>>;
						public createIntent(param0: globalAndroid.content.Context, param1: any): globalAndroid.content.Intent;
						public parseResult(it: number, this_: globalAndroid.content.Intent): java.util.List<globalAndroid.net.Uri>;
						public getSynchronousResult(context: globalAndroid.content.Context, input: any): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<any>;
						public createIntent(context: globalAndroid.content.Context, input: androidNative.Array<string>): globalAndroid.content.Intent;
					}
					export class PickContact extends androidx.activity.result.contract.ActivityResultContract<java.lang.Void,globalAndroid.net.Uri> {
						public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts.PickContact>;
						public parseResult(param0: number, param1: globalAndroid.content.Intent): any;
						public constructor();
						public createIntent(context: globalAndroid.content.Context, input: java.lang.Void): globalAndroid.content.Intent;
						public createIntent(param0: globalAndroid.content.Context, param1: any): globalAndroid.content.Intent;
						public parseResult(it: number, this_: globalAndroid.content.Intent): globalAndroid.net.Uri;
					}
					export class PickMultipleVisualMedia extends androidx.activity.result.contract.ActivityResultContract<androidx.activity.result.PickVisualMediaRequest,java.util.List<globalAndroid.net.Uri>> {
						public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts.PickMultipleVisualMedia>;
						public parseResult(param0: number, param1: globalAndroid.content.Intent): any;
						public constructor();
						public createIntent(param0: globalAndroid.content.Context, param1: any): globalAndroid.content.Intent;
						public createIntent(context: globalAndroid.content.Context, $this$createIntent_u24lambda_u242: androidx.activity.result.PickVisualMediaRequest): globalAndroid.content.Intent;
						public parseResult(it: number, this_: globalAndroid.content.Intent): java.util.List<globalAndroid.net.Uri>;
						public getSynchronousResult(context: globalAndroid.content.Context, input: any): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<any>;
						public getSynchronousResult(context: globalAndroid.content.Context, input: androidx.activity.result.PickVisualMediaRequest): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<java.util.List<globalAndroid.net.Uri>>;
						public constructor(this_: number);
					}
					export module PickMultipleVisualMedia {
						export class Companion {
							public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts.PickMultipleVisualMedia.Companion>;
							public getMaxItems$activity_release(): number;
						}
					}
					export class PickVisualMedia extends androidx.activity.result.contract.ActivityResultContract<androidx.activity.result.PickVisualMediaRequest,globalAndroid.net.Uri> {
						public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts.PickVisualMedia>;
						public static ACTION_SYSTEM_FALLBACK_PICK_IMAGES: string = "androidx.activity.result.contract.action.PICK_IMAGES";
						public static EXTRA_SYSTEM_FALLBACK_PICK_IMAGES_MAX: string = "androidx.activity.result.contract.extra.PICK_IMAGES_MAX";
						public static GMS_ACTION_PICK_IMAGES: string = "com.google.android.gms.provider.action.PICK_IMAGES";
						public static GMS_EXTRA_PICK_IMAGES_MAX: string = "com.google.android.gms.provider.extra.PICK_IMAGES_MAX";
						public parseResult(param0: number, param1: globalAndroid.content.Intent): any;
						public constructor();
						public getSynchronousResult(context: globalAndroid.content.Context, input: androidx.activity.result.PickVisualMediaRequest): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<globalAndroid.net.Uri>;
						public static isPhotoPickerAvailable(context: globalAndroid.content.Context): boolean;
						public createIntent(param0: globalAndroid.content.Context, param1: any): globalAndroid.content.Intent;
						public static isSystemFallbackPickerAvailable$activity_release(context: globalAndroid.content.Context): boolean;
						/** @deprecated */
						public static isPhotoPickerAvailable(): boolean;
						public static isSystemPickerAvailable$activity_release(): boolean;
						public createIntent(context: globalAndroid.content.Context, request: androidx.activity.result.PickVisualMediaRequest): globalAndroid.content.Intent;
						public static getSystemFallbackPicker$activity_release(context: globalAndroid.content.Context): globalAndroid.content.pm.ResolveInfo;
						public static getGmsPicker$activity_release(context: globalAndroid.content.Context): globalAndroid.content.pm.ResolveInfo;
						public getSynchronousResult(context: globalAndroid.content.Context, input: any): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<any>;
						public parseResult(it: number, intent: globalAndroid.content.Intent): globalAndroid.net.Uri;
						public static isGmsPickerAvailable$activity_release(context: globalAndroid.content.Context): boolean;
					}
					export module PickVisualMedia {
						export class Companion {
							public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts.PickVisualMedia.Companion>;
							/** @deprecated */
							public isPhotoPickerAvailable(): boolean;
							public getGmsPicker$activity_release(context: globalAndroid.content.Context): globalAndroid.content.pm.ResolveInfo;
							public isGmsPickerAvailable$activity_release(context: globalAndroid.content.Context): boolean;
							public getVisualMimeType$activity_release(input: androidx.activity.result.contract.ActivityResultContracts.PickVisualMedia.VisualMediaType): string;
							public getSystemFallbackPicker$activity_release(context: globalAndroid.content.Context): globalAndroid.content.pm.ResolveInfo;
							public isPhotoPickerAvailable(context: globalAndroid.content.Context): boolean;
							public isSystemPickerAvailable$activity_release(): boolean;
							public isSystemFallbackPickerAvailable$activity_release(context: globalAndroid.content.Context): boolean;
						}
						export class ImageAndVideo extends androidx.activity.result.contract.ActivityResultContracts.PickVisualMedia.VisualMediaType {
							public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts.PickVisualMedia.ImageAndVideo>;
							public static INSTANCE: androidx.activity.result.contract.ActivityResultContracts.PickVisualMedia.ImageAndVideo;
						}
						export class ImageOnly extends androidx.activity.result.contract.ActivityResultContracts.PickVisualMedia.VisualMediaType {
							public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts.PickVisualMedia.ImageOnly>;
							public static INSTANCE: androidx.activity.result.contract.ActivityResultContracts.PickVisualMedia.ImageOnly;
						}
						export class SingleMimeType extends androidx.activity.result.contract.ActivityResultContracts.PickVisualMedia.VisualMediaType {
							public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts.PickVisualMedia.SingleMimeType>;
							public getMimeType(): string;
							public constructor(mimeType: string);
						}
						export class VideoOnly extends androidx.activity.result.contract.ActivityResultContracts.PickVisualMedia.VisualMediaType {
							public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts.PickVisualMedia.VideoOnly>;
							public static INSTANCE: androidx.activity.result.contract.ActivityResultContracts.PickVisualMedia.VideoOnly;
						}
						export class VisualMediaType {
							public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts.PickVisualMedia.VisualMediaType>;
							/**
							 * Constructs a new instance of the androidx.activity.result.contract.ActivityResultContracts$PickVisualMedia$VisualMediaType interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
							 */
							public constructor(implementation: {
							});
							public constructor();
						}
					}
					export class RequestMultiplePermissions extends androidx.activity.result.contract.ActivityResultContract<androidNative.Array<string>,java.util.Map<string,java.lang.Boolean>> {
						public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts.RequestMultiplePermissions>;
						public static ACTION_REQUEST_PERMISSIONS: string = "androidx.activity.result.contract.action.REQUEST_PERMISSIONS";
						public static EXTRA_PERMISSIONS: string = "androidx.activity.result.contract.extra.PERMISSIONS";
						public static EXTRA_PERMISSION_GRANT_RESULTS: string = "androidx.activity.result.contract.extra.PERMISSION_GRANT_RESULTS";
						public parseResult(param0: number, param1: globalAndroid.content.Intent): any;
						public constructor();
						public createIntent(param0: globalAndroid.content.Context, param1: any): globalAndroid.content.Intent;
						public getSynchronousResult(permission: globalAndroid.content.Context, element$iv: androidNative.Array<string>): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<java.util.Map<string,java.lang.Boolean>>;
						public parseResult(result: number, item$iv$iv: globalAndroid.content.Intent): java.util.Map<string,java.lang.Boolean>;
						public getSynchronousResult(context: globalAndroid.content.Context, input: any): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<any>;
						public createIntent(context: globalAndroid.content.Context, input: androidNative.Array<string>): globalAndroid.content.Intent;
					}
					export module RequestMultiplePermissions {
						export class Companion {
							public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts.RequestMultiplePermissions.Companion>;
							public createIntent$activity_release(input: androidNative.Array<string>): globalAndroid.content.Intent;
						}
					}
					export class RequestPermission extends androidx.activity.result.contract.ActivityResultContract<string,java.lang.Boolean> {
						public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts.RequestPermission>;
						public createIntent(context: globalAndroid.content.Context, input: string): globalAndroid.content.Intent;
						public parseResult(param0: number, param1: globalAndroid.content.Intent): any;
						public constructor();
						public createIntent(param0: globalAndroid.content.Context, param1: any): globalAndroid.content.Intent;
						public parseResult(result: number, element$iv: globalAndroid.content.Intent): java.lang.Boolean;
						public getSynchronousResult(context: globalAndroid.content.Context, input: any): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<any>;
						public getSynchronousResult(this_: globalAndroid.content.Context, context: string): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<java.lang.Boolean>;
					}
					export class StartActivityForResult extends androidx.activity.result.contract.ActivityResultContract<globalAndroid.content.Intent,androidx.activity.result.ActivityResult> {
						public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts.StartActivityForResult>;
						public static EXTRA_ACTIVITY_OPTIONS_BUNDLE: string = "androidx.activity.result.contract.extra.ACTIVITY_OPTIONS_BUNDLE";
						public parseResult(param0: number, param1: globalAndroid.content.Intent): any;
						public parseResult(resultCode: number, intent: globalAndroid.content.Intent): androidx.activity.result.ActivityResult;
						public constructor();
						public createIntent(context: globalAndroid.content.Context, input: globalAndroid.content.Intent): globalAndroid.content.Intent;
						public createIntent(param0: globalAndroid.content.Context, param1: any): globalAndroid.content.Intent;
					}
					export module StartActivityForResult {
						export class Companion {
							public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts.StartActivityForResult.Companion>;
						}
					}
					export class StartIntentSenderForResult extends androidx.activity.result.contract.ActivityResultContract<androidx.activity.result.IntentSenderRequest,androidx.activity.result.ActivityResult> {
						public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts.StartIntentSenderForResult>;
						public static ACTION_INTENT_SENDER_REQUEST: string = "androidx.activity.result.contract.action.INTENT_SENDER_REQUEST";
						public static EXTRA_INTENT_SENDER_REQUEST: string = "androidx.activity.result.contract.extra.INTENT_SENDER_REQUEST";
						public static EXTRA_SEND_INTENT_EXCEPTION: string = "androidx.activity.result.contract.extra.SEND_INTENT_EXCEPTION";
						public parseResult(param0: number, param1: globalAndroid.content.Intent): any;
						public parseResult(resultCode: number, intent: globalAndroid.content.Intent): androidx.activity.result.ActivityResult;
						public constructor();
						public createIntent(param0: globalAndroid.content.Context, param1: any): globalAndroid.content.Intent;
						public createIntent(context: globalAndroid.content.Context, input: androidx.activity.result.IntentSenderRequest): globalAndroid.content.Intent;
					}
					export module StartIntentSenderForResult {
						export class Companion {
							public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts.StartIntentSenderForResult.Companion>;
						}
					}
					export class TakePicture extends androidx.activity.result.contract.ActivityResultContract<globalAndroid.net.Uri,java.lang.Boolean> {
						public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts.TakePicture>;
						public parseResult(param0: number, param1: globalAndroid.content.Intent): any;
						public constructor();
						public createIntent(context: globalAndroid.content.Context, input: globalAndroid.net.Uri): globalAndroid.content.Intent;
						public createIntent(param0: globalAndroid.content.Context, param1: any): globalAndroid.content.Intent;
						public parseResult(resultCode: number, intent: globalAndroid.content.Intent): java.lang.Boolean;
						public getSynchronousResult(context: globalAndroid.content.Context, input: any): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<any>;
						public getSynchronousResult(context: globalAndroid.content.Context, input: globalAndroid.net.Uri): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<java.lang.Boolean>;
					}
					export class TakePicturePreview extends androidx.activity.result.contract.ActivityResultContract<java.lang.Void,globalAndroid.graphics.Bitmap> {
						public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts.TakePicturePreview>;
						public parseResult(param0: number, param1: globalAndroid.content.Intent): any;
						public constructor();
						public createIntent(context: globalAndroid.content.Context, input: java.lang.Void): globalAndroid.content.Intent;
						public parseResult(it: number, this_: globalAndroid.content.Intent): globalAndroid.graphics.Bitmap;
						public createIntent(param0: globalAndroid.content.Context, param1: any): globalAndroid.content.Intent;
						public getSynchronousResult(context: globalAndroid.content.Context, input: java.lang.Void): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<globalAndroid.graphics.Bitmap>;
						public getSynchronousResult(context: globalAndroid.content.Context, input: any): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<any>;
					}
					export class TakeVideo extends androidx.activity.result.contract.ActivityResultContract<globalAndroid.net.Uri,globalAndroid.graphics.Bitmap> {
						public static class: java.lang.Class<androidx.activity.result.contract.ActivityResultContracts.TakeVideo>;
						public parseResult(param0: number, param1: globalAndroid.content.Intent): any;
						public constructor();
						public createIntent(context: globalAndroid.content.Context, input: globalAndroid.net.Uri): globalAndroid.content.Intent;
						public parseResult(it: number, this_: globalAndroid.content.Intent): globalAndroid.graphics.Bitmap;
						public createIntent(param0: globalAndroid.content.Context, param1: any): globalAndroid.content.Intent;
						public getSynchronousResult(context: globalAndroid.content.Context, input: any): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<any>;
						public getSynchronousResult(context: globalAndroid.content.Context, input: globalAndroid.net.Uri): androidx.activity.result.contract.ActivityResultContract.SynchronousResult<globalAndroid.graphics.Bitmap>;
					}
				}
			}
		}
	}
}

//Generics information:
//androidx.activity.result.ActivityResultCallback:1
//androidx.activity.result.ActivityResultCallerLauncher:2
//androidx.activity.result.ActivityResultLauncher:1
//androidx.activity.result.ActivityResultRegistry.CallbackAndContract:1
//androidx.activity.result.contract.ActivityResultContract:2
//androidx.activity.result.contract.ActivityResultContract.SynchronousResult:1

