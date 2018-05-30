// version 27.0.0
declare module android {
	export module support {
		export module design {
			export class BuildConfig {
				public static DEBUG: boolean;
				public static APPLICATION_ID: string;
				public static BUILD_TYPE: string;
				public static FLAVOR: string;
				public static VERSION_CODE: number;
				public static VERSION_NAME: string;
				public constructor();
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module internal {
				export class BaselineLayout {
					public onMeasure(param0: number, param1: number): void;
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet, param2: number);
					public constructor(param0: android.content.Context);
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
					public onLayout(param0: boolean, param1: number, param2: number, param3: number, param4: number): void;
					public getBaseline(): number;
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module internal {
				export class BottomNavigationItemView {
					public static INVALID_ITEM_POSITION: number;
					public setEnabled(param0: boolean): void;
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet, param2: number);
					public setShiftingMode(param0: boolean): void;
					public setTitle(param0: string): void;
					public setIconTintList(param0: android.content.res.ColorStateList): void;
					public setShortcut(param0: boolean, param1: string): void;
					public setTextColor(param0: android.content.res.ColorStateList): void;
					public getItemData(): android.support.v7.view.menu.MenuItemImpl;
					public showsIcon(): boolean;
					public initialize(param0: android.support.v7.view.menu.MenuItemImpl, param1: number): void;
					public getItemPosition(): number;
					public prefersCondensedTitle(): boolean;
					public constructor(param0: android.content.Context);
					public setCheckable(param0: boolean): void;
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
					public onCreateDrawableState(param0: number): native.Array<number>;
					public setIcon(param0: android.graphics.drawable.Drawable): void;
					public setItemPosition(param0: number): void;
					public setChecked(param0: boolean): void;
					public setItemBackground(param0: number): void;
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module internal {
				export class BottomNavigationMenu {
					public static MAX_ITEM_COUNT: number;
					public constructor(param0: android.content.Context);
					public addInternal(param0: number, param1: number, param2: number, param3: string): android.view.MenuItem;
					public addSubMenu(param0: number, param1: number, param2: number, param3: string): android.view.SubMenu;
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module internal {
				export class BottomNavigationMenuView {
					public onMeasure(param0: number, param1: number): void;
					public initialize(param0: android.support.v7.view.menu.MenuBuilder): void;
					public setItemTextColor(param0: android.content.res.ColorStateList): void;
					public setIconTintList(param0: android.content.res.ColorStateList): void;
					public buildMenuView(): void;
					public getItemBackgroundRes(): number;
					public getWindowAnimations(): number;
					public getSelectedItemId(): number;
					public getItemTextColor(): android.content.res.ColorStateList;
					public setItemBackgroundRes(param0: number): void;
					public constructor(param0: android.content.Context);
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
					public getIconTintList(): android.content.res.ColorStateList;
					public onLayout(param0: boolean, param1: number, param2: number, param3: number, param4: number): void;
					public updateMenuView(): void;
					public setPresenter(param0: android.support.design.internal.BottomNavigationPresenter): void;
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module internal {
				export class BottomNavigationPresenter {
					public setId(param0: number): void;
					public setUpdateSuspended(param0: boolean): void;
					public getId(): number;
					public collapseItemActionView(param0: android.support.v7.view.menu.MenuBuilder, param1: android.support.v7.view.menu.MenuItemImpl): boolean;
					public onRestoreInstanceState(param0: android.os.Parcelable): void;
					public updateMenuView(param0: boolean): void;
					public expandItemActionView(param0: android.support.v7.view.menu.MenuBuilder, param1: android.support.v7.view.menu.MenuItemImpl): boolean;
					public setCallback(param0: android.support.v7.view.menu.MenuPresenter.Callback): void;
					public initForMenu(param0: android.content.Context, param1: android.support.v7.view.menu.MenuBuilder): void;
					public constructor();
					public onCloseMenu(param0: android.support.v7.view.menu.MenuBuilder, param1: boolean): void;
					public setBottomNavigationMenuView(param0: android.support.design.internal.BottomNavigationMenuView): void;
					public onSubMenuSelected(param0: android.support.v7.view.menu.SubMenuBuilder): boolean;
					public getMenuView(param0: android.view.ViewGroup): android.support.v7.view.menu.MenuView;
					public flagActionItems(): boolean;
					public onSaveInstanceState(): android.os.Parcelable;
				}
				export module BottomNavigationPresenter {
					export class SavedState {
						public static CREATOR: android.os.Parcelable.Creator;
						public describeContents(): number;
						public writeToParcel(param0: android.os.Parcel, param1: number): void;
					}
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module internal {
				export class ForegroundLinearLayout {
					public mForegroundInPadding: boolean;
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet, param2: number);
					public verifyDrawable(param0: android.graphics.drawable.Drawable): boolean;
					public getForeground(): android.graphics.drawable.Drawable;
					public jumpDrawablesToCurrentState(): void;
					public onSizeChanged(param0: number, param1: number, param2: number, param3: number): void;
					public drawableHotspotChanged(param0: number, param1: number): void;
					public getForegroundGravity(): number;
					public constructor(param0: android.content.Context);
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
					public onLayout(param0: boolean, param1: number, param2: number, param3: number, param4: number): void;
					public setForegroundGravity(param0: number): void;
					public setForeground(param0: android.graphics.drawable.Drawable): void;
					public drawableStateChanged(): void;
					public draw(param0: android.graphics.Canvas): void;
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module internal {
				export class NavigationMenu {
					public constructor(param0: android.content.Context);
					public addSubMenu(param0: number, param1: number, param2: number, param3: string): android.view.SubMenu;
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module internal {
				export class NavigationMenuItemView extends android.support.design.internal.ForegroundLinearLayout {
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet, param2: number);
					public recycle(): void;
					public setTitle(param0: string): void;
					public setShortcut(param0: boolean, param1: string): void;
					public setTextColor(param0: android.content.res.ColorStateList): void;
					public setTextAppearance(param0: number): void;
					public getItemData(): android.support.v7.view.menu.MenuItemImpl;
					public showsIcon(): boolean;
					public initialize(param0: android.support.v7.view.menu.MenuItemImpl, param1: number): void;
					public prefersCondensedTitle(): boolean;
					public setNeedsEmptyIcon(param0: boolean): void;
					public constructor(param0: android.content.Context);
					public setCheckable(param0: boolean): void;
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
					public onCreateDrawableState(param0: number): native.Array<number>;
					public setIcon(param0: android.graphics.drawable.Drawable): void;
					public setChecked(param0: boolean): void;
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module internal {
				export class NavigationMenuPresenter {
					public setId(param0: number): void;
					public addHeaderView(param0: android.view.View): void;
					public setItemTextColor(param0: android.content.res.ColorStateList): void;
					public expandItemActionView(param0: android.support.v7.view.menu.MenuBuilder, param1: android.support.v7.view.menu.MenuItemImpl): boolean;
					public setCheckedItem(param0: android.support.v7.view.menu.MenuItemImpl): void;
					public setItemBackground(param0: android.graphics.drawable.Drawable): void;
					public constructor();
					public onCloseMenu(param0: android.support.v7.view.menu.MenuBuilder, param1: boolean): void;
					public setItemIconTintList(param0: android.content.res.ColorStateList): void;
					public onSubMenuSelected(param0: android.support.v7.view.menu.SubMenuBuilder): boolean;
					public flagActionItems(): boolean;
					public getItemTintList(): android.content.res.ColorStateList;
					public setUpdateSuspended(param0: boolean): void;
					public getId(): number;
					public removeHeaderView(param0: android.view.View): void;
					public getItemBackground(): android.graphics.drawable.Drawable;
					public collapseItemActionView(param0: android.support.v7.view.menu.MenuBuilder, param1: android.support.v7.view.menu.MenuItemImpl): boolean;
					public onRestoreInstanceState(param0: android.os.Parcelable): void;
					public updateMenuView(param0: boolean): void;
					public getHeaderView(param0: number): android.view.View;
					public setCallback(param0: android.support.v7.view.menu.MenuPresenter.Callback): void;
					public initForMenu(param0: android.content.Context, param1: android.support.v7.view.menu.MenuBuilder): void;
					public dispatchApplyWindowInsets(param0: android.support.v4.view.WindowInsetsCompat): void;
					public inflateHeaderView(param0: number): android.view.View;
					public getItemTextColor(): android.content.res.ColorStateList;
					public setItemTextAppearance(param0: number): void;
					public getMenuView(param0: android.view.ViewGroup): android.support.v7.view.menu.MenuView;
					public getHeaderCount(): number;
					public onSaveInstanceState(): android.os.Parcelable;
				}
				export module NavigationMenuPresenter {
					export class HeaderViewHolder extends android.support.design.internal.NavigationMenuPresenter.ViewHolder {
						public constructor(param0: android.view.View);
					}
					export class NavigationMenuAdapter {
						public onCreateViewHolder(param0: android.view.ViewGroup, param1: number): android.support.design.internal.NavigationMenuPresenter.ViewHolder;
						public onViewRecycled(param0: android.support.design.internal.NavigationMenuPresenter.ViewHolder): void;
						public setCheckedItem(param0: android.support.v7.view.menu.MenuItemImpl): void;
						public getItemViewType(param0: number): number;
						public setUpdateSuspended(param0: boolean): void;
						public getItemId(param0: number): number;
						public getItemCount(): number;
						public onBindViewHolder(param0: android.support.design.internal.NavigationMenuPresenter.ViewHolder, param1: number): void;
						public update(): void;
						public createInstanceState(): android.os.Bundle;
						public restoreInstanceState(param0: android.os.Bundle): void;
					}
					export class NavigationMenuHeaderItem {
					}
					export class NavigationMenuItem {
						/**
						 * Constructs a new instance of the android.support.design.internal.NavigationMenuPresenter$NavigationMenuItem interface with the provided implementation.
						 */
						public constructor(implementation: {
						});
					}
					export class NavigationMenuSeparatorItem {
						public getPaddingTop(): number;
						public getPaddingBottom(): number;
						public constructor(param0: number, param1: number);
					}
					export class NavigationMenuTextItem {
						public getMenuItem(): android.support.v7.view.menu.MenuItemImpl;
					}
					export class NormalViewHolder extends android.support.design.internal.NavigationMenuPresenter.ViewHolder {
						public constructor(param0: android.view.View);
						public constructor(param0: android.view.LayoutInflater, param1: android.view.ViewGroup, param2: android.view.View.OnClickListener);
					}
					export class SeparatorViewHolder extends android.support.design.internal.NavigationMenuPresenter.ViewHolder {
						public constructor(param0: android.view.LayoutInflater, param1: android.view.ViewGroup);
						public constructor(param0: android.view.View);
					}
					export class SubheaderViewHolder extends android.support.design.internal.NavigationMenuPresenter.ViewHolder {
						public constructor(param0: android.view.LayoutInflater, param1: android.view.ViewGroup);
						public constructor(param0: android.view.View);
					}
					export abstract class ViewHolder {
						public constructor(param0: android.view.View);
					}
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module internal {
				export class NavigationMenuView {
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet, param2: number);
					public initialize(param0: android.support.v7.view.menu.MenuBuilder): void;
					public constructor(param0: android.content.Context);
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
					public getWindowAnimations(): number;
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module internal {
				export class NavigationSubMenu {
					public constructor(param0: android.content.Context, param1: android.support.design.internal.NavigationMenu, param2: android.support.v7.view.menu.MenuItemImpl);
					public onItemsChanged(param0: boolean): void;
				}
			}
		}
	}
}

import javalangClassLoader = java.lang.ClassLoader;
declare module android {
	export module support {
		export module design {
			export module internal {
				export class ParcelableSparseArray {
					public static CREATOR: android.os.Parcelable.Creator;
					public constructor();
					public describeContents(): number;
					public constructor(param0: android.os.Parcel, param1: javalangClassLoader);
					public writeToParcel(param0: android.os.Parcel, param1: number): void;
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module internal {
				export class ScrimInsetsFrameLayout {
					public onDetachedFromWindow(): void;
					public onInsetsChanged(param0: android.support.v4.view.WindowInsetsCompat): void;
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet, param2: number);
					public constructor(param0: android.content.Context);
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
					public onAttachedToWindow(): void;
					public draw(param0: android.graphics.Canvas): void;
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module internal {
				export class SnackbarContentLayout {
					public onMeasure(param0: number, param1: number): void;
					public constructor(param0: android.content.Context);
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
					public getMessageView(): android.widget.TextView;
					public getActionView(): android.widget.Button;
					public onFinishInflate(): void;
					public animateContentIn(param0: number, param1: number): void;
					public animateContentOut(param0: number, param1: number): void;
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module internal {
				export class TextScale {
					public constructor();
					public createAnimator(param0: android.view.ViewGroup, param1: android.support.transition.TransitionValues, param2: android.support.transition.TransitionValues): android.animation.Animator;
					public captureEndValues(param0: android.support.transition.TransitionValues): void;
					public captureStartValues(param0: android.support.transition.TransitionValues): void;
				}
			}
		}
	}
}


declare module android {
	export module support {
		export module design {
			export module widget {
				export class AnimationUtils {
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class AppBarLayout {
					public onMeasure(param0: number, param1: number): void;
					public getTotalScrollRange(): number;
					public generateLayoutParams(param0: android.view.ViewGroup.LayoutParams): android.support.design.widget.AppBarLayout.LayoutParams;
					public setTargetElevation(param0: number): void;
					public generateDefaultLayoutParams(): android.support.design.widget.AppBarLayout.LayoutParams;
					public setOrientation(param0: number): void;
					public getTargetElevation(): number;
					public removeOnOffsetChangedListener(param0: android.support.design.widget.AppBarLayout.OnOffsetChangedListener): void;
					public generateLayoutParams(param0: android.util.AttributeSet): android.support.design.widget.AppBarLayout.LayoutParams;
					public setExpanded(param0: boolean): void;
					public constructor(param0: android.content.Context);
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
					public checkLayoutParams(param0: android.view.ViewGroup.LayoutParams): boolean;
					public onCreateDrawableState(param0: number): native.Array<number>;
					public onLayout(param0: boolean, param1: number, param2: number, param3: number, param4: number): void;
					public setExpanded(param0: boolean, param1: boolean): void;
					public addOnOffsetChangedListener(param0: android.support.design.widget.AppBarLayout.OnOffsetChangedListener): void;
				}
				export module AppBarLayout {
					export class Behavior extends android.support.design.widget.HeaderBehavior {
						public constructor();
						public onNestedScroll(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View, param3: number, param4: number, param5: number, param6: number, param7: number): void;
						public onStopNestedScroll(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View, param3: number): void;
						public onNestedPreScroll(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View, param3: number, param4: number, param5: native.Array<number>, param6: number): void;
						public onMeasureChild(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: number, param3: number, param4: number, param5: number): boolean;
						public onSaveInstanceState(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View): android.os.Parcelable;
						public onRestoreInstanceState(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.os.Parcelable): void;
						public onNestedPreScroll(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View, param3: number, param4: number, param5: native.Array<number>): void;
						public onLayoutChild(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: number): boolean;
						public onNestedScroll(param0: android.support.design.widget.CoordinatorLayout, param1: android.support.design.widget.AppBarLayout, param2: android.view.View, param3: number, param4: number, param5: number, param6: number, param7: number): void;
						public onSaveInstanceState(param0: android.support.design.widget.CoordinatorLayout, param1: android.support.design.widget.AppBarLayout): android.os.Parcelable;
						public onMeasureChild(param0: android.support.design.widget.CoordinatorLayout, param1: android.support.design.widget.AppBarLayout, param2: number, param3: number, param4: number, param5: number): boolean;
						public onStartNestedScroll(param0: android.support.design.widget.CoordinatorLayout, param1: android.support.design.widget.AppBarLayout, param2: android.view.View, param3: android.view.View, param4: number, param5: number): boolean;
						public onLayoutChild(param0: android.support.design.widget.CoordinatorLayout, param1: android.support.design.widget.AppBarLayout, param2: number): boolean;
						public onNestedScroll(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View, param3: number, param4: number, param5: number, param6: number): void;
						public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
						public onStartNestedScroll(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View, param3: android.view.View, param4: number, param5: number): boolean;
						public onNestedPreScroll(param0: android.support.design.widget.CoordinatorLayout, param1: android.support.design.widget.AppBarLayout, param2: android.view.View, param3: number, param4: number, param5: native.Array<number>, param6: number): void;
						public setDragCallback(param0: android.support.design.widget.AppBarLayout.Behavior.DragCallback): void;
						public onStopNestedScroll(param0: android.support.design.widget.CoordinatorLayout, param1: android.support.design.widget.AppBarLayout, param2: android.view.View, param3: number): void;
						public onStopNestedScroll(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View): void;
						public onStartNestedScroll(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View, param3: android.view.View, param4: number): boolean;
						public onRestoreInstanceState(param0: android.support.design.widget.CoordinatorLayout, param1: android.support.design.widget.AppBarLayout, param2: android.os.Parcelable): void;
					}
					export module Behavior {
						export abstract class DragCallback {
							public constructor();
							public canDrag(param0: android.support.design.widget.AppBarLayout): boolean;
						}
						export class SavedState {
							public static CREATOR: android.os.Parcelable.Creator;
							public constructor(param0: android.os.Parcelable);
							public constructor(param0: android.os.Parcel, param1: javalangClassLoader);
							public writeToParcel(param0: android.os.Parcel, param1: number): void;
						}
					}
					export class LayoutParams {
						public static SCROLL_FLAG_SCROLL: number;
						public static SCROLL_FLAG_EXIT_UNTIL_COLLAPSED: number;
						public static SCROLL_FLAG_ENTER_ALWAYS: number;
						public static SCROLL_FLAG_ENTER_ALWAYS_COLLAPSED: number;
						public static SCROLL_FLAG_SNAP: number;
						public constructor(param0: android.view.ViewGroup.MarginLayoutParams);
						public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
						public constructor(param0: android.view.ViewGroup.LayoutParams);
						public setScrollInterpolator(param0: android.view.animation.Interpolator): void;
						public constructor(param0: android.widget.LinearLayout.LayoutParams);
						public constructor(param0: android.support.design.widget.AppBarLayout.LayoutParams);
						public setScrollFlags(param0: number): void;
						public constructor(param0: number, param1: number, param2: number);
						public getScrollInterpolator(): android.view.animation.Interpolator;
						public constructor(param0: number, param1: number);
						public getScrollFlags(): number;
					}
					export module LayoutParams {
						export class ScrollFlags {
							/**
							 * Constructs a new instance of the android.support.design.widget.AppBarLayout$LayoutParams$ScrollFlags interface with the provided implementation.
							 */
							public constructor(implementation: {
							});
						}
					}
					export class OnOffsetChangedListener {
						/**
						 * Constructs a new instance of the android.support.design.widget.AppBarLayout$OnOffsetChangedListener interface with the provided implementation.
						 */
						public constructor(implementation: {
							onOffsetChanged(param0: android.support.design.widget.AppBarLayout, param1: number): void;
						});
						public onOffsetChanged(param0: android.support.design.widget.AppBarLayout, param1: number): void;
					}
					export class ScrollingViewBehavior extends android.support.design.widget.HeaderScrollingViewBehavior {
						public layoutDependsOn(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View): boolean;
						public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
						public constructor();
						public onDependentViewChanged(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View): boolean;
						public onRequestChildRectangleOnScreen(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.graphics.Rect, param3: boolean): boolean;
					}
				}
			}
		}
	}
}

import javalangObject = java.lang.Object;
declare module android {
	export module support {
		export module design {
			export module widget {
				export abstract class BaseTransientBottomBar {
					public static LENGTH_INDEFINITE: number;
					public static LENGTH_SHORT: number;
					public static LENGTH_LONG: number;
					public getDuration(): number;
					public show(): void;
					public setDuration(param0: number): android.support.design.widget.BaseTransientBottomBar;
					public removeCallback(param0: android.support.design.widget.BaseTransientBottomBar.BaseCallback): android.support.design.widget.BaseTransientBottomBar;
					public isShown(): boolean;
					public getView(): android.view.View;
					public dismiss(): void;
					public addCallback(param0: android.support.design.widget.BaseTransientBottomBar.BaseCallback): android.support.design.widget.BaseTransientBottomBar;
					public constructor(param0: android.view.ViewGroup, param1: android.view.View, param2: android.support.design.widget.BaseTransientBottomBar.ContentViewCallback);
					public isShownOrQueued(): boolean;
					public getContext(): android.content.Context;
				}
				export module BaseTransientBottomBar {
					export abstract class BaseCallback {
						public static DISMISS_EVENT_SWIPE: number;
						public static DISMISS_EVENT_ACTION: number;
						public static DISMISS_EVENT_TIMEOUT: number;
						public static DISMISS_EVENT_MANUAL: number;
						public static DISMISS_EVENT_CONSECUTIVE: number;
						public constructor();
						public onDismissed(param0: javalangObject, param1: number): void;
						public onShown(param0: javalangObject): void;
					}
					export module BaseCallback {
						export class DismissEvent {
							/**
							 * Constructs a new instance of the android.support.design.widget.BaseTransientBottomBar$BaseCallback$DismissEvent interface with the provided implementation.
							 */
							public constructor(implementation: {
							});
						}
					}
					export class Behavior extends android.support.design.widget.SwipeDismissBehavior {
						public onInterceptTouchEvent(param0: android.support.design.widget.CoordinatorLayout, param1: android.support.design.widget.BaseTransientBottomBar.SnackbarBaseLayout, param2: android.view.MotionEvent): boolean;
						public canSwipeDismissView(param0: android.view.View): boolean;
						public onInterceptTouchEvent(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.MotionEvent): boolean;
					}
					export class ContentViewCallback {
						/**
						 * Constructs a new instance of the android.support.design.widget.BaseTransientBottomBar$ContentViewCallback interface with the provided implementation.
						 */
						public constructor(implementation: {
							animateContentIn(param0: number, param1: number): void;
							animateContentOut(param0: number, param1: number): void;
						});
						public animateContentIn(param0: number, param1: number): void;
						public animateContentOut(param0: number, param1: number): void;
					}
					export class Duration {
						/**
						 * Constructs a new instance of the android.support.design.widget.BaseTransientBottomBar$Duration interface with the provided implementation.
						 */
						public constructor(implementation: {
						});
					}
					export class OnAttachStateChangeListener {
						/**
						 * Constructs a new instance of the android.support.design.widget.BaseTransientBottomBar$OnAttachStateChangeListener interface with the provided implementation.
						 */
						public constructor(implementation: {
							onViewAttachedToWindow(param0: android.view.View): void;
							onViewDetachedFromWindow(param0: android.view.View): void;
						});
						public onViewAttachedToWindow(param0: android.view.View): void;
						public onViewDetachedFromWindow(param0: android.view.View): void;
					}
					export class OnLayoutChangeListener {
						/**
						 * Constructs a new instance of the android.support.design.widget.BaseTransientBottomBar$OnLayoutChangeListener interface with the provided implementation.
						 */
						public constructor(implementation: {
							onLayoutChange(param0: android.view.View, param1: number, param2: number, param3: number, param4: number): void;
						});
						public onLayoutChange(param0: android.view.View, param1: number, param2: number, param3: number, param4: number): void;
					}
					export class SnackbarBaseLayout {
						public onAttachedToWindow(): void;
						public onDetachedFromWindow(): void;
						public onLayout(param0: boolean, param1: number, param2: number, param3: number, param4: number): void;
					}
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class BottomNavigationView {
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet, param2: number);
					public inflateMenu(param0: number): void;
					public setOnNavigationItemReselectedListener(param0: android.support.design.widget.BottomNavigationView.OnNavigationItemReselectedListener): void;
					public setItemTextColor(param0: android.content.res.ColorStateList): void;
					public getItemIconTintList(): android.content.res.ColorStateList;
					public onRestoreInstanceState(param0: android.os.Parcelable): void;
					public setItemBackgroundResource(param0: number): void;
					public setSelectedItemId(param0: number): void;
					public getItemBackgroundResource(): number;
					public getSelectedItemId(): number;
					public getMenu(): android.view.Menu;
					public getItemTextColor(): android.content.res.ColorStateList;
					public constructor(param0: android.content.Context);
					public getMaxItemCount(): number;
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
					public setItemIconTintList(param0: android.content.res.ColorStateList): void;
					public setOnNavigationItemSelectedListener(param0: android.support.design.widget.BottomNavigationView.OnNavigationItemSelectedListener): void;
					public onSaveInstanceState(): android.os.Parcelable;
				}
				export module BottomNavigationView {
					export class OnNavigationItemReselectedListener {
						/**
						 * Constructs a new instance of the android.support.design.widget.BottomNavigationView$OnNavigationItemReselectedListener interface with the provided implementation.
						 */
						public constructor(implementation: {
							onNavigationItemReselected(param0: android.view.MenuItem): void;
						});
						public onNavigationItemReselected(param0: android.view.MenuItem): void;
					}
					export class OnNavigationItemSelectedListener {
						/**
						 * Constructs a new instance of the android.support.design.widget.BottomNavigationView$OnNavigationItemSelectedListener interface with the provided implementation.
						 */
						public constructor(implementation: {
							onNavigationItemSelected(param0: android.view.MenuItem): boolean;
						});
						public onNavigationItemSelected(param0: android.view.MenuItem): boolean;
					}
					export class SavedState {
						public static CREATOR: android.os.Parcelable.Creator;
						public constructor(param0: android.os.Parcelable);
						public constructor(param0: android.os.Parcel, param1: javalangClassLoader);
						public writeToParcel(param0: android.os.Parcel, param1: number): void;
					}
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class BottomSheetBehavior extends android.support.design.widget.CoordinatorLayout.Behavior {
					public static STATE_DRAGGING: number;
					public static STATE_SETTLING: number;
					public static STATE_EXPANDED: number;
					public static STATE_COLLAPSED: number;
					public static STATE_HIDDEN: number;
					public static PEEK_HEIGHT_AUTO: number;
					public onStopNestedScroll(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View): void;
					public setSkipCollapsed(param0: boolean): void;
					public onRestoreInstanceState(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.os.Parcelable): void;
					public onSaveInstanceState(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View): android.os.Parcelable;
					public onNestedPreFling(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View, param3: number, param4: number): boolean;
					public onStartNestedScroll(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View, param3: android.view.View, param4: number, param5: number): boolean;
					public setPeekHeight(param0: number): void;
					public getPeekHeight(): number;
					public onTouchEvent(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.MotionEvent): boolean;
					public onStopNestedScroll(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View, param3: number): void;
					public onNestedPreScroll(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View, param3: number, param4: number, param5: native.Array<number>, param6: number): void;
					public static from(param0: android.view.View): android.support.design.widget.BottomSheetBehavior;
					public onStartNestedScroll(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View, param3: android.view.View, param4: number): boolean;
					public constructor();
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
					public isHideable(): boolean;
					public onInterceptTouchEvent(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.MotionEvent): boolean;
					public onNestedPreScroll(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View, param3: number, param4: number, param5: native.Array<number>): void;
					public onLayoutChild(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: number): boolean;
					public setState(param0: number): void;
					public getSkipCollapsed(): boolean;
					public setHideable(param0: boolean): void;
					public setBottomSheetCallback(param0: android.support.design.widget.BottomSheetBehavior.BottomSheetCallback): void;
					public getState(): number;
				}
				export module BottomSheetBehavior {
					export abstract class BottomSheetCallback {
						public constructor();
						public onStateChanged(param0: android.view.View, param1: number): void;
						public onSlide(param0: android.view.View, param1: number): void;
					}
					export class SavedState {
						public static CREATOR: android.os.Parcelable.Creator;
						public constructor(param0: android.os.Parcel, param1: javalangClassLoader);
						public constructor(param0: android.os.Parcel);
						public writeToParcel(param0: android.os.Parcel, param1: number): void;
						public constructor(param0: android.os.Parcelable, param1: number);
					}
					export class SettleRunnable {
						public run(): void;
					}
					export class State {
						/**
						 * Constructs a new instance of the android.support.design.widget.BottomSheetBehavior$State interface with the provided implementation.
						 */
						public constructor(implementation: {
						});
					}
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class BottomSheetDialog {
					public onStart(): void;
					public constructor(param0: android.content.Context, param1: number);
					public setContentView(param0: android.view.View): void;
					public constructor(param0: android.content.Context);
					public setContentView(param0: number): void;
					public onCreate(param0: android.os.Bundle): void;
					public setCanceledOnTouchOutside(param0: boolean): void;
					public constructor(param0: android.content.Context, param1: boolean, param2: android.content.DialogInterface.OnCancelListener);
					public setContentView(param0: android.view.View, param1: android.view.ViewGroup.LayoutParams): void;
					public setCancelable(param0: boolean): void;
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class BottomSheetDialogFragment {
					public constructor();
					public onCreateDialog(param0: android.os.Bundle): android.app.Dialog;
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class CheckableImageButton {
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet, param2: number);
					public constructor(param0: android.content.Context);
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
					public onCreateDrawableState(param0: number): native.Array<number>;
					public setChecked(param0: boolean): void;
					public toggle(): void;
					public isChecked(): boolean;
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class CircularBorderDrawable {
					public onBoundsChange(param0: android.graphics.Rect): void;
					public constructor();
					public getPadding(param0: android.graphics.Rect): boolean;
					public onStateChange(param0: native.Array<number>): boolean;
					public isStateful(): boolean;
					public setAlpha(param0: number): void;
					public setColorFilter(param0: android.graphics.ColorFilter): void;
					public draw(param0: android.graphics.Canvas): void;
					public getOpacity(): number;
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class CircularBorderDrawableLollipop extends android.support.design.widget.CircularBorderDrawable {
					public getOutline(param0: android.graphics.Outline): void;
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class CollapsingTextHelper {
					public constructor(param0: android.view.View);
					public recalculate(): void;
					public draw(param0: android.graphics.Canvas): void;
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class CollapsingToolbarLayout {
					public getTitle(): string;
					public generateLayoutParams(param0: android.util.AttributeSet): android.widget.FrameLayout.LayoutParams;
					public setTitle(param0: string): void;
					public generateDefaultLayoutParams(): android.support.design.widget.CollapsingToolbarLayout.LayoutParams;
					public onAttachedToWindow(): void;
					public getContentScrim(): android.graphics.drawable.Drawable;
					public setCollapsedTitleTextAppearance(param0: number): void;
					public getExpandedTitleMarginStart(): number;
					public getExpandedTitleMarginTop(): number;
					public setCollapsedTitleTextColor(param0: android.content.res.ColorStateList): void;
					public setCollapsedTitleGravity(param0: number): void;
					public setExpandedTitleMarginEnd(param0: number): void;
					public getExpandedTitleMarginBottom(): number;
					public setStatusBarScrimColor(param0: number): void;
					public getCollapsedTitleGravity(): number;
					public setScrimsShown(param0: boolean): void;
					public getExpandedTitleTypeface(): android.graphics.Typeface;
					public setVisibility(param0: number): void;
					public setStatusBarScrimResource(param0: number): void;
					public setTitleEnabled(param0: boolean): void;
					public setContentScrim(param0: android.graphics.drawable.Drawable): void;
					public drawableStateChanged(): void;
					public setExpandedTitleTextAppearance(param0: number): void;
					public isTitleEnabled(): boolean;
					public setExpandedTitleColor(param0: number): void;
					public setExpandedTitleGravity(param0: number): void;
					public getStatusBarScrim(): android.graphics.drawable.Drawable;
					public setStatusBarScrim(param0: android.graphics.drawable.Drawable): void;
					public setExpandedTitleMarginBottom(param0: number): void;
					public getScrimVisibleHeightTrigger(): number;
					public verifyDrawable(param0: android.graphics.drawable.Drawable): boolean;
					public setScrimAnimationDuration(param0: number): void;
					public generateLayoutParams(param0: android.view.ViewGroup.LayoutParams): android.widget.FrameLayout.LayoutParams;
					public setExpandedTitleTextColor(param0: android.content.res.ColorStateList): void;
					public setContentScrimResource(param0: number): void;
					public setContentScrimColor(param0: number): void;
					public setExpandedTitleTypeface(param0: android.graphics.Typeface): void;
					public draw(param0: android.graphics.Canvas): void;
					public onDetachedFromWindow(): void;
					public onMeasure(param0: number, param1: number): void;
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet, param2: number);
					public setCollapsedTitleTextColor(param0: number): void;
					public getCollapsedTitleTypeface(): android.graphics.Typeface;
					public setScrimVisibleHeightTrigger(param0: number): void;
					public setExpandedTitleMarginTop(param0: number): void;
					public getScrimAnimationDuration(): number;
					public getExpandedTitleMarginEnd(): number;
					public onSizeChanged(param0: number, param1: number, param2: number, param3: number): void;
					public getExpandedTitleGravity(): number;
					public setScrimsShown(param0: boolean, param1: boolean): void;
					public constructor(param0: android.content.Context);
					public setExpandedTitleMargin(param0: number, param1: number, param2: number, param3: number): void;
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
					public drawChild(param0: android.graphics.Canvas, param1: android.view.View, param2: number): boolean;
					public checkLayoutParams(param0: android.view.ViewGroup.LayoutParams): boolean;
					public onLayout(param0: boolean, param1: number, param2: number, param3: number, param4: number): void;
					public setCollapsedTitleTypeface(param0: android.graphics.Typeface): void;
					public setExpandedTitleMarginStart(param0: number): void;
				}
				export module CollapsingToolbarLayout {
					export class LayoutParams {
						public static COLLAPSE_MODE_OFF: number;
						public static COLLAPSE_MODE_PIN: number;
						public static COLLAPSE_MODE_PARALLAX: number;
						public constructor(param0: android.view.ViewGroup.MarginLayoutParams);
						public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
						public constructor(param0: android.view.ViewGroup.LayoutParams);
						public getCollapseMode(): number;
						public setCollapseMode(param0: number): void;
						public setParallaxMultiplier(param0: number): void;
						public getParallaxMultiplier(): number;
						public constructor(param0: number, param1: number, param2: number);
						public constructor(param0: number, param1: number);
						public constructor(param0: android.widget.FrameLayout.LayoutParams);
					}
					export module LayoutParams {
						export class CollapseMode {
							/**
							 * Constructs a new instance of the android.support.design.widget.CollapsingToolbarLayout$LayoutParams$CollapseMode interface with the provided implementation.
							 */
							public constructor(implementation: {
							});
						}
					}
					export class OffsetUpdateListener {
						public onOffsetChanged(param0: android.support.design.widget.AppBarLayout, param1: number): void;
					}
				}
			}
		}
	}
}

import javautilList = java.util.List;
import javalangClass = java.lang.Class;
declare module android {
	export module support {
		export module design {
			export module widget {
				export class CoordinatorLayout {
					public onNestedFling(param0: android.view.View, param1: number, param2: number, param3: boolean): boolean;
					public setStatusBarBackgroundResource(param0: number): void;
					public onDraw(param0: android.graphics.Canvas): void;
					public dispatchDependentViewsChanged(param0: android.view.View): void;
					public onAttachedToWindow(): void;
					public getSuggestedMinimumWidth(): number;
					public onNestedPreFling(param0: android.view.View, param1: number, param2: number): boolean;
					public onTouchEvent(param0: android.view.MotionEvent): boolean;
					public onStopNestedScroll(param0: android.view.View, param1: number): void;
					public doViewsOverlap(param0: android.view.View, param1: android.view.View): boolean;
					public getDependents(param0: android.view.View): javautilList;
					public setVisibility(param0: number): void;
					public onNestedScrollAccepted(param0: android.view.View, param1: android.view.View, param2: number, param3: number): void;
					public drawableStateChanged(): void;
					public onNestedScrollAccepted(param0: android.view.View, param1: android.view.View, param2: number): void;
					public onInterceptTouchEvent(param0: android.view.MotionEvent): boolean;
					public onSaveInstanceState(): android.os.Parcelable;
					public onNestedPreScroll(param0: android.view.View, param1: number, param2: number, param3: native.Array<number>): void;
					public onMeasureChild(param0: android.view.View, param1: number, param2: number, param3: number, param4: number): void;
					public onStartNestedScroll(param0: android.view.View, param1: android.view.View, param2: number): boolean;
					public setStatusBarBackground(param0: android.graphics.drawable.Drawable): void;
					public onStartNestedScroll(param0: android.view.View, param1: android.view.View, param2: number, param3: number): boolean;
					public getDependencies(param0: android.view.View): javautilList;
					public verifyDrawable(param0: android.graphics.drawable.Drawable): boolean;
					public onNestedScroll(param0: android.view.View, param1: number, param2: number, param3: number, param4: number): void;
					public requestDisallowInterceptTouchEvent(param0: boolean): void;
					public requestChildRectangleOnScreen(param0: android.view.View, param1: android.graphics.Rect, param2: boolean): boolean;
					public generateLayoutParams(param0: android.view.ViewGroup.LayoutParams): android.support.design.widget.CoordinatorLayout.LayoutParams;
					public setOnHierarchyChangeListener(param0: android.view.ViewGroup.OnHierarchyChangeListener): void;
					public generateDefaultLayoutParams(): android.support.design.widget.CoordinatorLayout.LayoutParams;
					public onStopNestedScroll(param0: android.view.View): void;
					public setFitsSystemWindows(param0: boolean): void;
					public getSuggestedMinimumHeight(): number;
					public onNestedScroll(param0: android.view.View, param1: number, param2: number, param3: number, param4: number, param5: number): void;
					public onDetachedFromWindow(): void;
					public onMeasure(param0: number, param1: number): void;
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet, param2: number);
					public onRestoreInstanceState(param0: android.os.Parcelable): void;
					public setStatusBarBackgroundColor(param0: number): void;
					public getStatusBarBackground(): android.graphics.drawable.Drawable;
					public onLayoutChild(param0: android.view.View, param1: number): void;
					public constructor(param0: android.content.Context);
					public onNestedPreScroll(param0: android.view.View, param1: number, param2: number, param3: native.Array<number>, param4: number): void;
					public getNestedScrollAxes(): number;
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
					public drawChild(param0: android.graphics.Canvas, param1: android.view.View, param2: number): boolean;
					public checkLayoutParams(param0: android.view.ViewGroup.LayoutParams): boolean;
					public onLayout(param0: boolean, param1: number, param2: number, param3: number, param4: number): void;
					public generateLayoutParams(param0: android.util.AttributeSet): android.support.design.widget.CoordinatorLayout.LayoutParams;
					public isPointInChildBounds(param0: android.view.View, param1: number, param2: number): boolean;
				}
				export module CoordinatorLayout {
					export abstract class Behavior {
						public static getTag(param0: android.view.View): javalangObject;
						public onNestedScrollAccepted(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View, param3: android.view.View, param4: number): void;
						public onDependentViewRemoved(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View): void;
						public onApplyWindowInsets(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.support.v4.view.WindowInsetsCompat): android.support.v4.view.WindowInsetsCompat;
						public onNestedScrollAccepted(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View, param3: android.view.View, param4: number, param5: number): void;
						public blocksInteractionBelow(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View): boolean;
						public onAttachedToLayoutParams(param0: android.support.design.widget.CoordinatorLayout.LayoutParams): void;
						public onNestedPreScroll(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View, param3: number, param4: number, param5: native.Array<number>): void;
						public onTouchEvent(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.MotionEvent): boolean;
						public onNestedScroll(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View, param3: number, param4: number, param5: number, param6: number): void;
						public onNestedFling(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View, param3: number, param4: number, param5: boolean): boolean;
						public onDetachedFromLayoutParams(): void;
						public getScrimColor(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View): number;
						public onStartNestedScroll(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View, param3: android.view.View, param4: number, param5: number): boolean;
						public onRequestChildRectangleOnScreen(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.graphics.Rect, param3: boolean): boolean;
						public constructor();
						public static setTag(param0: android.view.View, param1: javalangObject): void;
						public onStopNestedScroll(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View, param3: number): void;
						public onNestedScroll(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View, param3: number, param4: number, param5: number, param6: number, param7: number): void;
						public onNestedPreScroll(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View, param3: number, param4: number, param5: native.Array<number>, param6: number): void;
						public onInterceptTouchEvent(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.MotionEvent): boolean;
						public onMeasureChild(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: number, param3: number, param4: number, param5: number): boolean;
						public onRestoreInstanceState(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.os.Parcelable): void;
						public onSaveInstanceState(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View): android.os.Parcelable;
						public onLayoutChild(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: number): boolean;
						public getScrimOpacity(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View): number;
						public layoutDependsOn(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View): boolean;
						public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
						public getInsetDodgeRect(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.graphics.Rect): boolean;
						public onDependentViewChanged(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View): boolean;
						public onNestedPreFling(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View, param3: number, param4: number): boolean;
						public onStopNestedScroll(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View): void;
						public onStartNestedScroll(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View, param3: android.view.View, param4: number): boolean;
					}
					export class DefaultBehavior {
						/**
						 * Constructs a new instance of the android.support.design.widget.CoordinatorLayout$DefaultBehavior interface with the provided implementation.
						 */
						public constructor(implementation: {
							value(): javalangClass;
						});
						public value(): javalangClass;
					}
					export class DispatchChangeEvent {
						/**
						 * Constructs a new instance of the android.support.design.widget.CoordinatorLayout$DispatchChangeEvent interface with the provided implementation.
						 */
						public constructor(implementation: {
						});
					}
					export class HierarchyChangeListener {
						public onChildViewAdded(param0: android.view.View, param1: android.view.View): void;
						public onChildViewRemoved(param0: android.view.View, param1: android.view.View): void;
					}
					export class LayoutParams {
						public gravity: number;
						public anchorGravity: number;
						public keyline: number;
						public insetEdge: number;
						public dodgeInsetEdges: number;
						public constructor(param0: android.view.ViewGroup.MarginLayoutParams);
						public constructor(param0: android.view.ViewGroup.LayoutParams);
						public constructor(param0: android.support.design.widget.CoordinatorLayout.LayoutParams);
						public getAnchorId(): number;
						public getBehavior(): android.support.design.widget.CoordinatorLayout.Behavior;
						public setBehavior(param0: android.support.design.widget.CoordinatorLayout.Behavior): void;
						public constructor(param0: number, param1: number);
						public setAnchorId(param0: number): void;
					}
					export class OnPreDrawListener {
						public onPreDraw(): boolean;
					}
					export class SavedState {
						public static CREATOR: android.os.Parcelable.Creator;
						public constructor(param0: android.os.Parcel, param1: javalangClassLoader);
						public constructor(param0: android.os.Parcelable);
						public writeToParcel(param0: android.os.Parcel, param1: number): void;
					}
					export class ViewElevationComparator {
						public compare(param0: android.view.View, param1: android.view.View): number;
					}
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class DirectedAcyclicGraph {
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class DrawableUtils {
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class FloatingActionButton extends android.support.design.widget.VisibilityAwareImageButton {
					public static SIZE_MINI: number;
					public static SIZE_NORMAL: number;
					public static SIZE_AUTO: number;
					public setSize(param0: number): void;
					public hide(param0: android.support.design.widget.FloatingActionButton.OnVisibilityChangedListener): void;
					public setUseCompatPadding(param0: boolean): void;
					public onAttachedToWindow(): void;
					public jumpDrawablesToCurrentState(): void;
					public getSize(): number;
					public getRippleColor(): number;
					public setImageResource(param0: number): void;
					public getCompatElevation(): number;
					public getContentBackground(): android.graphics.drawable.Drawable;
					public setBackgroundTintMode(param0: android.graphics.PorterDuff.Mode): void;
					public onDetachedFromWindow(): void;
					public onTouchEvent(param0: android.view.MotionEvent): boolean;
					public onMeasure(param0: number, param1: number): void;
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet, param2: number);
					public setRippleColor(param0: number): void;
					public show(): void;
					public setBackgroundDrawable(param0: android.graphics.drawable.Drawable): void;
					public setBackgroundColor(param0: number): void;
					public show(param0: android.support.design.widget.FloatingActionButton.OnVisibilityChangedListener): void;
					public constructor(param0: android.content.Context);
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
					public setBackgroundResource(param0: number): void;
					public hide(): void;
					public getBackgroundTintList(): android.content.res.ColorStateList;
					public drawableStateChanged(): void;
					public getContentRect(param0: android.graphics.Rect): boolean;
					public setBackgroundTintList(param0: android.content.res.ColorStateList): void;
					public getBackgroundTintMode(): android.graphics.PorterDuff.Mode;
					public getUseCompatPadding(): boolean;
					public setCompatElevation(param0: number): void;
				}
				export module FloatingActionButton {
					export class Behavior extends android.support.design.widget.CoordinatorLayout.Behavior {
						public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
						public getInsetDodgeRect(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.graphics.Rect): boolean;
						public constructor();
						public isAutoHideEnabled(): boolean;
						public onDependentViewChanged(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.View): boolean;
						public onLayoutChild(param0: android.support.design.widget.CoordinatorLayout, param1: android.support.design.widget.FloatingActionButton, param2: number): boolean;
						public onAttachedToLayoutParams(param0: android.support.design.widget.CoordinatorLayout.LayoutParams): void;
						public getInsetDodgeRect(param0: android.support.design.widget.CoordinatorLayout, param1: android.support.design.widget.FloatingActionButton, param2: android.graphics.Rect): boolean;
						public onLayoutChild(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: number): boolean;
						public setAutoHideEnabled(param0: boolean): void;
						public onDependentViewChanged(param0: android.support.design.widget.CoordinatorLayout, param1: android.support.design.widget.FloatingActionButton, param2: android.view.View): boolean;
					}
					export abstract class OnVisibilityChangedListener {
						public constructor();
						public onHidden(param0: android.support.design.widget.FloatingActionButton): void;
						public onShown(param0: android.support.design.widget.FloatingActionButton): void;
					}
					export class ShadowDelegateImpl {
						public isCompatPaddingEnabled(): boolean;
						public getRadius(): number;
						public setBackgroundDrawable(param0: android.graphics.drawable.Drawable): void;
						public setShadowPadding(param0: number, param1: number, param2: number, param3: number): void;
					}
					export class Size {
						/**
						 * Constructs a new instance of the android.support.design.widget.FloatingActionButton$Size interface with the provided implementation.
						 */
						public constructor(implementation: {
						});
					}
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class FloatingActionButtonImpl {
				}
				export module FloatingActionButtonImpl {
					export class DisabledElevationAnimation extends android.support.design.widget.FloatingActionButtonImpl.ShadowAnimatorImpl {
						public getTargetShadowSize(): number;
					}
					export class ElevateToTranslationZAnimation extends android.support.design.widget.FloatingActionButtonImpl.ShadowAnimatorImpl {
						public getTargetShadowSize(): number;
					}
					export class InternalVisibilityChangedListener {
						/**
						 * Constructs a new instance of the android.support.design.widget.FloatingActionButtonImpl$InternalVisibilityChangedListener interface with the provided implementation.
						 */
						public constructor(implementation: {
							onShown(): void;
							onHidden(): void;
						});
						public onHidden(): void;
						public onShown(): void;
					}
					export class ResetElevationAnimation extends android.support.design.widget.FloatingActionButtonImpl.ShadowAnimatorImpl {
						public getTargetShadowSize(): number;
					}
					export abstract class ShadowAnimatorImpl {
						public onAnimationEnd(param0: android.animation.Animator): void;
						public getTargetShadowSize(): number;
						public onAnimationUpdate(param0: android.animation.ValueAnimator): void;
					}
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class FloatingActionButtonLollipop extends android.support.design.widget.FloatingActionButtonImpl {
					public getElevation(): number;
				}
				export module FloatingActionButtonLollipop {
					export class AlwaysStatefulGradientDrawable {
						public isStateful(): boolean;
					}
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export abstract class HeaderBehavior extends android.support.design.widget.ViewOffsetBehavior {
					public constructor();
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
					public onInterceptTouchEvent(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.MotionEvent): boolean;
					public onTouchEvent(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.MotionEvent): boolean;
				}
				export module HeaderBehavior {
					export class FlingRunnable {
						public run(): void;
					}
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export abstract class HeaderScrollingViewBehavior extends android.support.design.widget.ViewOffsetBehavior {
					public constructor();
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
					public setOverlayTop(param0: number): void;
					public getOverlayTop(): number;
					public onMeasureChild(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: number, param3: number, param4: number, param5: number): boolean;
					public layoutChild(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: number): void;
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class NavigationView extends android.support.design.internal.ScrimInsetsFrameLayout {
					public onMeasure(param0: number, param1: number): void;
					public onInsetsChanged(param0: android.support.v4.view.WindowInsetsCompat): void;
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet, param2: number);
					public inflateMenu(param0: number): void;
					public addHeaderView(param0: android.view.View): void;
					public setItemTextColor(param0: android.content.res.ColorStateList): void;
					public removeHeaderView(param0: android.view.View): void;
					public getItemIconTintList(): android.content.res.ColorStateList;
					public getItemBackground(): android.graphics.drawable.Drawable;
					public onRestoreInstanceState(param0: android.os.Parcelable): void;
					public getHeaderView(param0: number): android.view.View;
					public setItemBackgroundResource(param0: number): void;
					public getMenu(): android.view.Menu;
					public inflateHeaderView(param0: number): android.view.View;
					public getItemTextColor(): android.content.res.ColorStateList;
					public setItemTextAppearance(param0: number): void;
					public setItemBackground(param0: android.graphics.drawable.Drawable): void;
					public constructor(param0: android.content.Context);
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
					public setItemIconTintList(param0: android.content.res.ColorStateList): void;
					public setCheckedItem(param0: number): void;
					public getHeaderCount(): number;
					public onSaveInstanceState(): android.os.Parcelable;
					public setNavigationItemSelectedListener(param0: android.support.design.widget.NavigationView.OnNavigationItemSelectedListener): void;
				}
				export module NavigationView {
					export class OnNavigationItemSelectedListener {
						/**
						 * Constructs a new instance of the android.support.design.widget.NavigationView$OnNavigationItemSelectedListener interface with the provided implementation.
						 */
						public constructor(implementation: {
							onNavigationItemSelected(param0: android.view.MenuItem): boolean;
						});
						public onNavigationItemSelected(param0: android.view.MenuItem): boolean;
					}
					export class SavedState {
						public menuState: android.os.Bundle;
						public static CREATOR: android.os.Parcelable.Creator;
						public constructor(param0: android.os.Parcel, param1: javalangClassLoader);
						public constructor(param0: android.os.Parcelable);
						public writeToParcel(param0: android.os.Parcel, param1: number): void;
					}
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class ShadowDrawableWrapper {
					public onBoundsChange(param0: android.graphics.Rect): void;
					public getMinWidth(): number;
					public getCornerRadius(): number;
					public setCornerRadius(param0: number): void;
					public setShadowSize(param0: number): void;
					public getShadowSize(): number;
					public setAlpha(param0: number): void;
					public getMaxShadowSize(): number;
					public getMinHeight(): number;
					public static calculateHorizontalPadding(param0: number, param1: number, param2: boolean): number;
					public static calculateVerticalPadding(param0: number, param1: number, param2: boolean): number;
					public getPadding(param0: android.graphics.Rect): boolean;
					public setMaxShadowSize(param0: number): void;
					public setAddPaddingForCorners(param0: boolean): void;
					public constructor(param0: android.content.Context, param1: android.graphics.drawable.Drawable, param2: number, param3: number, param4: number);
					public getOpacity(): number;
					public draw(param0: android.graphics.Canvas): void;
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class ShadowViewDelegate {
					/**
					 * Constructs a new instance of the android.support.design.widget.ShadowViewDelegate interface with the provided implementation.
					 */
					public constructor(implementation: {
						getRadius(): number;
						setShadowPadding(param0: number, param1: number, param2: number, param3: number): void;
						setBackgroundDrawable(param0: android.graphics.drawable.Drawable): void;
						isCompatPaddingEnabled(): boolean;
					});
					public setBackgroundDrawable(param0: android.graphics.drawable.Drawable): void;
					public isCompatPaddingEnabled(): boolean;
					public setShadowPadding(param0: number, param1: number, param2: number, param3: number): void;
					public getRadius(): number;
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class Snackbar extends android.support.design.widget.BaseTransientBottomBar {
					public static LENGTH_INDEFINITE: number;
					public static LENGTH_SHORT: number;
					public static LENGTH_LONG: number;
					public setText(param0: string): android.support.design.widget.Snackbar;
					public static make(param0: android.view.View, param1: string, param2: number): android.support.design.widget.Snackbar;
					public static make(param0: android.view.View, param1: number, param2: number): android.support.design.widget.Snackbar;
					public setText(param0: number): android.support.design.widget.Snackbar;
					public setCallback(param0: android.support.design.widget.Snackbar.Callback): android.support.design.widget.Snackbar;
					public setAction(param0: string, param1: android.view.View.OnClickListener): android.support.design.widget.Snackbar;
					public setAction(param0: number, param1: android.view.View.OnClickListener): android.support.design.widget.Snackbar;
					public setActionTextColor(param0: android.content.res.ColorStateList): android.support.design.widget.Snackbar;
					public setActionTextColor(param0: number): android.support.design.widget.Snackbar;
				}
				export module Snackbar {
					export class Callback extends android.support.design.widget.BaseTransientBottomBar.BaseCallback {
						public static DISMISS_EVENT_SWIPE: number;
						public static DISMISS_EVENT_ACTION: number;
						public static DISMISS_EVENT_TIMEOUT: number;
						public static DISMISS_EVENT_MANUAL: number;
						public static DISMISS_EVENT_CONSECUTIVE: number;
						public constructor();
						public onDismissed(param0: javalangObject, param1: number): void;
						public onShown(param0: javalangObject): void;
						public onDismissed(param0: android.support.design.widget.Snackbar, param1: number): void;
						public onShown(param0: android.support.design.widget.Snackbar): void;
					}
					export class SnackbarLayout extends android.support.design.widget.BaseTransientBottomBar.SnackbarBaseLayout {
						public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
						public constructor(param0: android.content.Context);
						public onMeasure(param0: number, param1: number): void;
					}
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class SnackbarManager {
					public restoreTimeoutIfPaused(param0: android.support.design.widget.SnackbarManager.Callback): void;
					public show(param0: number, param1: android.support.design.widget.SnackbarManager.Callback): void;
					public isCurrent(param0: android.support.design.widget.SnackbarManager.Callback): boolean;
					public dismiss(param0: android.support.design.widget.SnackbarManager.Callback, param1: number): void;
					public onShown(param0: android.support.design.widget.SnackbarManager.Callback): void;
					public isCurrentOrNext(param0: android.support.design.widget.SnackbarManager.Callback): boolean;
					public pauseTimeout(param0: android.support.design.widget.SnackbarManager.Callback): void;
					public onDismissed(param0: android.support.design.widget.SnackbarManager.Callback): void;
				}
				export module SnackbarManager {
					export class Callback {
						/**
						 * Constructs a new instance of the android.support.design.widget.SnackbarManager$Callback interface with the provided implementation.
						 */
						public constructor(implementation: {
							show(): void;
							dismiss(param0: number): void;
						});
						public show(): void;
						public dismiss(param0: number): void;
					}
					export class SnackbarRecord {
					}
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class StateListAnimator {
					public addState(param0: native.Array<number>, param1: android.animation.ValueAnimator): void;
					public jumpToCurrentState(): void;
				}
				export module StateListAnimator {
					export class Tuple {
					}
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class SwipeDismissBehavior extends android.support.design.widget.CoordinatorLayout.Behavior {
					public static STATE_IDLE: number;
					public static STATE_DRAGGING: number;
					public static STATE_SETTLING: number;
					public static SWIPE_DIRECTION_START_TO_END: number;
					public static SWIPE_DIRECTION_END_TO_START: number;
					public static SWIPE_DIRECTION_ANY: number;
					public setSwipeDirection(param0: number): void;
					public setSensitivity(param0: number): void;
					public constructor();
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
					public setEndAlphaSwipeDistance(param0: number): void;
					public setDragDismissDistance(param0: number): void;
					public onInterceptTouchEvent(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.MotionEvent): boolean;
					public setListener(param0: android.support.design.widget.SwipeDismissBehavior.OnDismissListener): void;
					public getDragState(): number;
					public setStartAlphaSwipeDistance(param0: number): void;
					public onTouchEvent(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: android.view.MotionEvent): boolean;
					public canSwipeDismissView(param0: android.view.View): boolean;
				}
				export module SwipeDismissBehavior {
					export class OnDismissListener {
						/**
						 * Constructs a new instance of the android.support.design.widget.SwipeDismissBehavior$OnDismissListener interface with the provided implementation.
						 */
						public constructor(implementation: {
							onDismiss(param0: android.view.View): void;
							onDragStateChanged(param0: number): void;
						});
						public onDismiss(param0: android.view.View): void;
						public onDragStateChanged(param0: number): void;
					}
					export class SettleRunnable {
						public run(): void;
					}
					export class SwipeDirection {
						/**
						 * Constructs a new instance of the android.support.design.widget.SwipeDismissBehavior$SwipeDirection interface with the provided implementation.
						 */
						public constructor(implementation: {
						});
					}
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class TabItem {
					public constructor(param0: android.content.Context);
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class TabLayout {
					public static MODE_SCROLLABLE: number;
					public static MODE_FIXED: number;
					public static GRAVITY_FILL: number;
					public static GRAVITY_CENTER: number;
					public setTabGravity(param0: number): void;
					public generateLayoutParams(param0: android.util.AttributeSet): android.widget.FrameLayout.LayoutParams;
					public setSelectedTabIndicatorHeight(param0: number): void;
					public getTabCount(): number;
					public setTabsFromPagerAdapter(param0: android.support.v4.view.PagerAdapter): void;
					public onAttachedToWindow(): void;
					public setOnTabSelectedListener(param0: android.support.design.widget.TabLayout.OnTabSelectedListener): void;
					public addView(param0: android.view.View, param1: number, param2: android.view.ViewGroup.LayoutParams): void;
					public getTabMode(): number;
					public setupWithViewPager(param0: android.support.v4.view.ViewPager): void;
					public addTab(param0: android.support.design.widget.TabLayout.Tab): void;
					public addOnTabSelectedListener(param0: android.support.design.widget.TabLayout.OnTabSelectedListener): void;
					public addView(param0: android.view.View, param1: number): void;
					public setScrollPosition(param0: number, param1: number, param2: boolean): void;
					public setupWithViewPager(param0: android.support.v4.view.ViewPager, param1: boolean): void;
					public removeOnTabSelectedListener(param0: android.support.design.widget.TabLayout.OnTabSelectedListener): void;
					public getSelectedTabPosition(): number;
					public setTabTextColors(param0: number, param1: number): void;
					public clearOnTabSelectedListeners(): void;
					public addTab(param0: android.support.design.widget.TabLayout.Tab, param1: number): void;
					public setTabTextColors(param0: android.content.res.ColorStateList): void;
					public getTabAt(param0: number): android.support.design.widget.TabLayout.Tab;
					public removeTab(param0: android.support.design.widget.TabLayout.Tab): void;
					public onDetachedFromWindow(): void;
					public onMeasure(param0: number, param1: number): void;
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet, param2: number);
					public newTab(): android.support.design.widget.TabLayout.Tab;
					public getTabTextColors(): android.content.res.ColorStateList;
					public addTab(param0: android.support.design.widget.TabLayout.Tab, param1: number, param2: boolean): void;
					public removeTabAt(param0: number): void;
					public addView(param0: android.view.View, param1: android.view.ViewGroup.LayoutParams): void;
					public getTabGravity(): number;
					public setTabMode(param0: number): void;
					public shouldDelayChildPressedState(): boolean;
					public constructor(param0: android.content.Context);
					public addView(param0: android.view.View): void;
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
					public removeAllTabs(): void;
					public addTab(param0: android.support.design.widget.TabLayout.Tab, param1: boolean): void;
					public setSelectedTabIndicatorColor(param0: number): void;
				}
				export module TabLayout {
					export class AdapterChangeListener {
						public onAdapterChanged(param0: android.support.v4.view.ViewPager, param1: android.support.v4.view.PagerAdapter, param2: android.support.v4.view.PagerAdapter): void;
					}
					export class Mode {
						/**
						 * Constructs a new instance of the android.support.design.widget.TabLayout$Mode interface with the provided implementation.
						 */
						public constructor(implementation: {
						});
					}
					export class OnTabSelectedListener {
						/**
						 * Constructs a new instance of the android.support.design.widget.TabLayout$OnTabSelectedListener interface with the provided implementation.
						 */
						public constructor(implementation: {
							onTabSelected(param0: android.support.design.widget.TabLayout.Tab): void;
							onTabUnselected(param0: android.support.design.widget.TabLayout.Tab): void;
							onTabReselected(param0: android.support.design.widget.TabLayout.Tab): void;
						});
						public onTabUnselected(param0: android.support.design.widget.TabLayout.Tab): void;
						public onTabSelected(param0: android.support.design.widget.TabLayout.Tab): void;
						public onTabReselected(param0: android.support.design.widget.TabLayout.Tab): void;
					}
					export class PagerAdapterObserver {
						public onChanged(): void;
						public onInvalidated(): void;
					}
					export class SlidingTabStrip {
						public onRtlPropertiesChanged(param0: number): void;
						public draw(param0: android.graphics.Canvas): void;
						public onMeasure(param0: number, param1: number): void;
						public onLayout(param0: boolean, param1: number, param2: number, param3: number, param4: number): void;
					}
					export class Tab {
						public static INVALID_POSITION: number;
						public setIcon(param0: android.graphics.drawable.Drawable): android.support.design.widget.TabLayout.Tab;
						public getTag(): javalangObject;
						public setCustomView(param0: android.view.View): android.support.design.widget.TabLayout.Tab;
						public setTag(param0: javalangObject): android.support.design.widget.TabLayout.Tab;
						public setContentDescription(param0: string): android.support.design.widget.TabLayout.Tab;
						public getPosition(): number;
						public isSelected(): boolean;
						public setCustomView(param0: number): android.support.design.widget.TabLayout.Tab;
						public setText(param0: string): android.support.design.widget.TabLayout.Tab;
						public getText(): string;
						public setContentDescription(param0: number): android.support.design.widget.TabLayout.Tab;
						public setText(param0: number): android.support.design.widget.TabLayout.Tab;
						public getCustomView(): android.view.View;
						public setIcon(param0: number): android.support.design.widget.TabLayout.Tab;
						public getIcon(): android.graphics.drawable.Drawable;
						public select(): void;
						public getContentDescription(): string;
					}
					export class TabGravity {
						/**
						 * Constructs a new instance of the android.support.design.widget.TabLayout$TabGravity interface with the provided implementation.
						 */
						public constructor(implementation: {
						});
					}
					export class TabLayoutOnPageChangeListener {
						public constructor(param0: android.support.design.widget.TabLayout);
						public onPageSelected(param0: number): void;
						public onPageScrolled(param0: number, param1: number, param2: number): void;
						public onPageScrollStateChanged(param0: number): void;
					}
					export class TabView {
						public constructor(param0: android.support.design.widget.TabLayout, param1: android.content.Context);
						public setSelected(param0: boolean): void;
						public getTab(): android.support.design.widget.TabLayout.Tab;
						public performClick(): boolean;
						public onInitializeAccessibilityNodeInfo(param0: android.view.accessibility.AccessibilityNodeInfo): void;
						public onInitializeAccessibilityEvent(param0: android.view.accessibility.AccessibilityEvent): void;
						public onMeasure(param0: number, param1: number): void;
					}
					export class ViewPagerOnTabSelectedListener {
						public onTabUnselected(param0: android.support.design.widget.TabLayout.Tab): void;
						public constructor(param0: android.support.v4.view.ViewPager);
						public onTabSelected(param0: android.support.design.widget.TabLayout.Tab): void;
						public onTabReselected(param0: android.support.design.widget.TabLayout.Tab): void;
					}
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class TextInputEditText {
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet, param2: number);
					public constructor(param0: android.content.Context);
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
					public onCreateInputConnection(param0: android.view.inputmethod.EditorInfo): android.view.inputmethod.InputConnection;
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class TextInputLayout {
					public setErrorEnabled(param0: boolean): void;
					public isPasswordVisibilityToggleEnabled(): boolean;
					public setHintEnabled(param0: boolean): void;
					public setPasswordVisibilityToggleEnabled(param0: boolean): void;
					public isCounterEnabled(): boolean;
					public addView(param0: android.view.View, param1: number, param2: android.view.ViewGroup.LayoutParams): void;
					public getHint(): string;
					public setPasswordVisibilityToggleTintMode(param0: android.graphics.PorterDuff.Mode): void;
					public getTypeface(): android.graphics.Typeface;
					public getCounterMaxLength(): number;
					public setHintAnimationEnabled(param0: boolean): void;
					public draw(param0: android.graphics.Canvas): void;
					public setTypeface(param0: android.graphics.Typeface): void;
					public setEnabled(param0: boolean): void;
					public onMeasure(param0: number, param1: number): void;
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet, param2: number);
					public dispatchProvideAutofillStructure(param0: android.view.ViewStructure, param1: number): void;
					public isErrorEnabled(): boolean;
					public onRestoreInstanceState(param0: android.os.Parcelable): void;
					public setPasswordVisibilityToggleTintList(param0: android.content.res.ColorStateList): void;
					public setHintTextAppearance(param0: number): void;
					public setErrorTextAppearance(param0: number): void;
					public isHintAnimationEnabled(): boolean;
					public isHintEnabled(): boolean;
					public setPasswordVisibilityToggleContentDescription(param0: string): void;
					public getError(): string;
					public getPasswordVisibilityToggleDrawable(): android.graphics.drawable.Drawable;
					public constructor(param0: android.content.Context);
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
					public getEditText(): android.widget.EditText;
					public dispatchRestoreInstanceState(param0: android.util.SparseArray): void;
					public setPasswordVisibilityToggleDrawable(param0: android.graphics.drawable.Drawable): void;
					public onLayout(param0: boolean, param1: number, param2: number, param3: number, param4: number): void;
					public setCounterMaxLength(param0: number): void;
					public setPasswordVisibilityToggleContentDescription(param0: number): void;
					public setError(param0: string): void;
					public setPasswordVisibilityToggleDrawable(param0: number): void;
					public getPasswordVisibilityToggleContentDescription(): string;
					public drawableStateChanged(): void;
					public setCounterEnabled(param0: boolean): void;
					public setHint(param0: string): void;
					public onSaveInstanceState(): android.os.Parcelable;
				}
				export module TextInputLayout {
					export class SavedState {
						public static CREATOR: android.os.Parcelable.Creator;
						public writeToParcel(param0: android.os.Parcel, param1: number): void;
						public toString(): string;
					}
					export class TextInputAccessibilityDelegate {
						public onPopulateAccessibilityEvent(param0: android.view.View, param1: android.view.accessibility.AccessibilityEvent): void;
						public onInitializeAccessibilityNodeInfo(param0: android.view.View, param1: android.support.v4.view.accessibility.AccessibilityNodeInfoCompat): void;
						public onInitializeAccessibilityEvent(param0: android.view.View, param1: android.view.accessibility.AccessibilityEvent): void;
					}
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class ThemeUtils {
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class ViewGroupUtils {
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class ViewOffsetBehavior extends android.support.design.widget.CoordinatorLayout.Behavior {
					public constructor();
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
					public setTopAndBottomOffset(param0: number): boolean;
					public onLayoutChild(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: number): boolean;
					public getLeftAndRightOffset(): number;
					public layoutChild(param0: android.support.design.widget.CoordinatorLayout, param1: android.view.View, param2: number): void;
					public setLeftAndRightOffset(param0: number): boolean;
					public getTopAndBottomOffset(): number;
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class ViewOffsetHelper {
					public getLayoutLeft(): number;
					public setTopAndBottomOffset(param0: number): boolean;
					public constructor(param0: android.view.View);
					public onViewLayout(): void;
					public getLeftAndRightOffset(): number;
					public setLeftAndRightOffset(param0: number): boolean;
					public getLayoutTop(): number;
					public getTopAndBottomOffset(): number;
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class ViewUtils {
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class ViewUtilsLollipop {
				}
			}
		}
	}
}

declare module android {
	export module support {
		export module design {
			export module widget {
				export class VisibilityAwareImageButton {
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet, param2: number);
					public constructor(param0: android.content.Context);
					public constructor(param0: android.content.Context, param1: android.util.AttributeSet);
					public setVisibility(param0: number): void;
				}
			}
		}
	}
}

