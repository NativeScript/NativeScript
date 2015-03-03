/* tslint:disable:no-unused-variable */
// Android specific TypeScript declarations
declare var app;
declare var telerik;
declare var gc: () => void;

declare module android {
    module support {
        module v4 {
            module widget {
                class DrawerLayout {
                    constructor(context: android.content.Context);
                }

                module DrawerLayout {
                    class DrawerListener implements IDrawerListener {
                        constructor(implementation: IDrawerListener);

                        onDrawerClosed(drawerView: android.view.View): void;
                        onDrawerOpened(drawerView: android.view.View): void;
                        onDrawerSlide(drawerView: android.view.View, offset: number): void;
                        onDrawerStateChanged(newState: number): void;
                    }

                    class LayoutParams extends android.view.ViewGroup.MarginLayoutParams {
                        constructor(width: number, height: number, gravity?: number);
                        gravity: number;
                    }

                    interface IDrawerListener {
                        onDrawerClosed(drawerView: android.view.View): void;
                        onDrawerOpened(drawerView: android.view.View): void;
                        onDrawerSlide(drawerView: android.view.View, offset: number): void;
                        onDrawerStateChanged(newState: number): void;
                    }
                }
            }

            module app {
                class ActionBarDrawerToggle {
                    constructor(activity: android.app.Activity, layout: widget.DrawerLayout, imageResId: number, openResId: number, closeResId: number);
                }
            }
        }
    }
}

declare module com {
    export module tns {
        export module Async {
            export class CompleteCallback {
                constructor(implementation: ICompleteCallback);
                onComplete(result: Object, context: Object): void;
            }

            export interface ICompleteCallback {
                onComplete(result: Object, context: Object): void;
            }

            export module Http {
                export class KeyValuePair {
                    public key: string;
                    public value: string;
                    constructor(key: string, value: string);
                }

                export class RequestOptions {
                    public url: string;
                    public method: string;
                    public headers: java.util.ArrayList<KeyValuePair>;
                    public content: string;
                    public timeout: number;
                    public screenWidth: number;
                    public screenHeight: number;
                }

                export class RequestResult {
                    public raw: java.io.ByteArrayOutputStream;
                    public headers: java.util.ArrayList<KeyValuePair>;
                    public statusCode: number;
                    public responseAsString: string;
                    public responseAsImage: android.graphics.Bitmap;
                    public error: java.lang.Exception;
                }

                export function MakeRequest(options: RequestOptions, callback: CompleteCallback, context: any);
            }
        }
    }
}