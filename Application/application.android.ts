import app_common_module = require("Application/application_common");
import console_module = require("Console/console_common");

var currentApp = app_common_module.tk.ui.Application.current;
declare var exports;
exports.tk = app_common_module.tk;

export module tk {
    // TODO: This is tricky, we have a module named android down in the hierarchy and we need to declare it here
    var callbacks = android.app.Application.ActivityLifecycleCallbacks;

    export module ui {
        export module android {
            var initEvents = function () {
                var androidApp = <Application>app_common_module.tk.ui.Application.current.android;

                var lifecycleCallbacks = new callbacks({
                    onActivityCreated: function (activity: any, bundle: any) {
                        if (!androidApp.startActivity) {
                            androidApp.startActivity = activity;

                            //if (UI.Application.current.onLaunch) {
                            //    UI.Application.current.onLaunch();
                            //}

                            if (androidApp.onActivityCreated) {
                                androidApp.onActivityCreated(activity, bundle);
                            }
                        }
                    },
                    onActivityDestroyed: function (activity: any) {
                        // Clear the current activity reference to prevent leak
                        if (activity === androidApp.currentActivity) {
                            androidApp.currentActivity = undefined;
                        }

                        //if (activity === UI.Application.android.startActivity) {
                        //    UI.Application.android.currentActivity = undefined;
                        //    if (UI.Application.current.onExit) {
                        //        UI.Application.current.onExit();
                        //    }
                        //}

                        if (androidApp.onActivityDestroyed) {
                            androidApp.onActivityDestroyed(activity);
                        }
                    },
                    onActivityPaused: function (activity: any) {
                        //if (UI.Application.android.currentActivity === activity) {
                        //    if (UI.Application.current.onSuspend) {
                        //        UI.Application.current.onSuspend();
                        //    }
                        //}

                        if (androidApp.onActivityPaused) {
                            androidApp.onActivityPaused(activity);
                        }
                    },
                    onActivityResumed: function (activity: any) {
                        //if (UI.Application.android.currentActivity === activity) {
                        //    if (UI.Application.current.onResume) {
                        //        UI.Application.current.onResume();
                        //    }
                        //}

                        if (androidApp.onActivityResumed) {
                            androidApp.onActivityResumed(activity);
                        }
                    },
                    onActivitySaveInstanceState: function (activity: any, bundle: any) {
                        if (androidApp.onSaveActivityState) {
                            androidApp.onSaveActivityState(activity, bundle);
                        }
                    },
                    onActivityStarted: function (activity: any) {
                        androidApp.currentActivity = activity;

                        //if (activity === UI.Application.android.startActivity) {
                        //    if (UI.Application.current.onStart) {
                        //        UI.Application.current.onStart();
                        //    }
                        //}

                        if (androidApp.onActivityStarted) {
                            androidApp.onActivityStarted(activity);
                        }
                    },
                    onActivityStopped: function (activity: any) {
                        if (androidApp.onActivityStopped) {
                            androidApp.onActivityStopped(activity);
                        }
                    }
                });

                return lifecycleCallbacks;
            }

            export var initApp = function (nativeApp: any) {
                var app = new Application(nativeApp);
                currentApp.os = app_common_module.tk.TargetOS.Android;
                currentApp.android = app;
                app.init();
                console = new console_module.tk.TKConsole();
            }

            class Application {
                public nativeApp: any;
                public context: any;
                public currentActivity: any;
                public startActivity: any;
                public packageName: string;

                // TODO: Provide type information once definitions are done - e.g. activity: android.widget.activity
                public onActivityCreated: (activity: any, bundle: any) => any;
                public onActivityDestroyed: (activity: any) => any;
                public onActivityStarted: (activity: any) => any;
                public onActivityPaused: (activity: any) => any;
                public onActivityResumed: (activity: any) => any;
                public onActivityStopped: (activity: any) => any;
                public onSaveActivityState: (activity: any, bundle: any) => any;

                private _eventsToken: any;

                constructor(nativeApp: any) {
                    this.nativeApp = nativeApp;
                    this.packageName = nativeApp.getPackageName();
                    this.context = nativeApp.getApplicationContext();
                }

                public init() {
                    this._eventsToken = initEvents();
                    this.nativeApp.registerActivityLifecycleCallbacks(this._eventsToken);
                }
            }
        }
    }
}