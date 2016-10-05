/* tslint:disable:no-unused-variable */
// Android specific TypeScript declarations
declare function float(num: number): any;
declare function long(num: number): any;

declare var app;
declare var telerik;
declare var gc: () => void;

declare function float(num: number): any;
declare function long(num: number): any;

interface ArrayConstructor {
    create(type: any, count: number): any;
}

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