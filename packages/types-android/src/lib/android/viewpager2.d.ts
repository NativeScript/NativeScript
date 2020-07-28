declare module androidx {
	export module viewpager2 {
		export module adapter {
			export abstract class FragmentStateAdapter extends androidx.recyclerview.widget.RecyclerView.Adapter<androidx.viewpager2.adapter.FragmentViewHolder> implements androidx.viewpager2.adapter.StatefulAdapter  {
				public static class: java.lang.Class<androidx.viewpager2.adapter.FragmentStateAdapter>;
				public saveState(): globalAndroid.os.Parcelable;
				public onViewRecycled(param0: androidx.viewpager2.adapter.FragmentViewHolder): void;
				public setHasStableIds(param0: boolean): void;
				public onDetachedFromRecyclerView(param0: androidx.recyclerview.widget.RecyclerView): void;
				public constructor(param0: androidx.fragment.app.Fragment);
				public createFragment(param0: number): androidx.fragment.app.Fragment;
				public onViewAttachedToWindow(param0: androidx.viewpager2.adapter.FragmentViewHolder): void;
				public containsItem(param0: number): boolean;
				public onFailedToRecycleView(param0: androidx.viewpager2.adapter.FragmentViewHolder): boolean;
				public restoreState(param0: globalAndroid.os.Parcelable): void;
				public constructor(param0: androidx.fragment.app.FragmentManager, param1: androidx.lifecycle.Lifecycle);
				public onCreateViewHolder(param0: globalAndroid.view.ViewGroup, param1: number): androidx.viewpager2.adapter.FragmentViewHolder;
				public constructor(param0: androidx.fragment.app.FragmentActivity);
				public onBindViewHolder(param0: androidx.viewpager2.adapter.FragmentViewHolder, param1: number): void;
				public getItemId(param0: number): number;
				public onAttachedToRecyclerView(param0: androidx.recyclerview.widget.RecyclerView): void;
			}
			export module FragmentStateAdapter {
				export abstract class DataSetChangeObserver {
					public static class: java.lang.Class<androidx.viewpager2.adapter.FragmentStateAdapter.DataSetChangeObserver>;
					public onChanged(): void;
					public onItemRangeMoved(param0: number, param1: number, param2: number): void;
					public onItemRangeChanged(param0: number, param1: number, param2: any): void;
					public onItemRangeChanged(param0: number, param1: number): void;
					public onItemRangeRemoved(param0: number, param1: number): void;
					public onItemRangeInserted(param0: number, param1: number): void;
				}
				export class FragmentMaxLifecycleEnforcer {
					public static class: java.lang.Class<androidx.viewpager2.adapter.FragmentStateAdapter.FragmentMaxLifecycleEnforcer>;
				}
			}
		}
	}
}

declare module androidx {
	export module viewpager2 {
		export module adapter {
			export class FragmentViewHolder {
				public static class: java.lang.Class<androidx.viewpager2.adapter.FragmentViewHolder>;
			}
		}
	}
}

declare module androidx {
	export module viewpager2 {
		export module adapter {
			export class StatefulAdapter {
				public static class: java.lang.Class<androidx.viewpager2.adapter.StatefulAdapter>;
				/**
				 * Constructs a new instance of the androidx.viewpager2.adapter.StatefulAdapter interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
				 */
				public constructor(implementation: {
					saveState(): globalAndroid.os.Parcelable;
					restoreState(param0: globalAndroid.os.Parcelable): void;
				});
				public constructor();
				public saveState(): globalAndroid.os.Parcelable;
				public restoreState(param0: globalAndroid.os.Parcelable): void;
			}
		}
	}
}

declare module androidx {
	export module viewpager2 {
		export module widget {
			export class AnimateLayoutChangeDetector {
				public static class: java.lang.Class<androidx.viewpager2.widget.AnimateLayoutChangeDetector>;
			}
		}
	}
}

declare module androidx {
	export module viewpager2 {
		export module widget {
			export class CompositeOnPageChangeCallback extends androidx.viewpager2.widget.ViewPager2.OnPageChangeCallback {
				public static class: java.lang.Class<androidx.viewpager2.widget.CompositeOnPageChangeCallback>;
				public onPageSelected(param0: number): void;
				public onPageScrolled(param0: number, param1: number, param2: number): void;
				public onPageScrollStateChanged(param0: number): void;
			}
		}
	}
}

declare module androidx {
	export module viewpager2 {
		export module widget {
			export class CompositePageTransformer extends androidx.viewpager2.widget.ViewPager2.PageTransformer {
				public static class: java.lang.Class<androidx.viewpager2.widget.CompositePageTransformer>;
				public transformPage(param0: globalAndroid.view.View, param1: number): void;
				public removeTransformer(param0: androidx.viewpager2.widget.ViewPager2.PageTransformer): void;
				public addTransformer(param0: androidx.viewpager2.widget.ViewPager2.PageTransformer): void;
				public constructor();
			}
		}
	}
}

declare module androidx {
	export module viewpager2 {
		export module widget {
			export class FakeDrag {
				public static class: java.lang.Class<androidx.viewpager2.widget.FakeDrag>;
			}
		}
	}
}

declare module androidx {
	export module viewpager2 {
		export module widget {
			export class MarginPageTransformer extends androidx.viewpager2.widget.ViewPager2.PageTransformer {
				public static class: java.lang.Class<androidx.viewpager2.widget.MarginPageTransformer>;
				public transformPage(param0: globalAndroid.view.View, param1: number): void;
				public constructor(param0: number);
			}
		}
	}
}

declare module androidx {
	export module viewpager2 {
		export module widget {
			export class PageTransformerAdapter extends androidx.viewpager2.widget.ViewPager2.OnPageChangeCallback {
				public static class: java.lang.Class<androidx.viewpager2.widget.PageTransformerAdapter>;
				public onPageSelected(param0: number): void;
				public onPageScrolled(param0: number, param1: number, param2: number): void;
				public onPageScrollStateChanged(param0: number): void;
			}
		}
	}
}

declare module androidx {
	export module viewpager2 {
		export module widget {
			export class ScrollEventAdapter {
				public static class: java.lang.Class<androidx.viewpager2.widget.ScrollEventAdapter>;
				public onScrollStateChanged(param0: androidx.recyclerview.widget.RecyclerView, param1: number): void;
				public onScrolled(param0: androidx.recyclerview.widget.RecyclerView, param1: number, param2: number): void;
			}
			export module ScrollEventAdapter {
				export class ScrollEventValues {
					public static class: java.lang.Class<androidx.viewpager2.widget.ScrollEventAdapter.ScrollEventValues>;
				}
			}
		}
	}
}

declare module androidx {
	export module viewpager2 {
		export module widget {
			export class ViewPager2 {
				public static class: java.lang.Class<androidx.viewpager2.widget.ViewPager2>;
				public static ORIENTATION_HORIZONTAL: number;
				public static ORIENTATION_VERTICAL: number;
				public static SCROLL_STATE_IDLE: number;
				public static SCROLL_STATE_DRAGGING: number;
				public static SCROLL_STATE_SETTLING: number;
				public static OFFSCREEN_PAGE_LIMIT_DEFAULT: number;
				public setUserInputEnabled(param0: boolean): void;
				public canScrollHorizontally(param0: number): boolean;
				public fakeDragBy(param0: number): boolean;
				public isFakeDragging(): boolean;
				public constructor(param0: globalAndroid.content.Context, param1: globalAndroid.util.AttributeSet, param2: number);
				public getOrientation(): number;
				public constructor(param0: globalAndroid.content.Context, param1: globalAndroid.util.AttributeSet, param2: number, param3: number);
				public setAdapter(param0: androidx.recyclerview.widget.RecyclerView.Adapter): void;
				public beginFakeDrag(): boolean;
				public isUserInputEnabled(): boolean;
				public requestTransform(): void;
				public constructor(param0: globalAndroid.content.Context);
				public setOffscreenPageLimit(param0: number): void;
				public onRestoreInstanceState(param0: globalAndroid.os.Parcelable): void;
				public unregisterOnPageChangeCallback(param0: androidx.viewpager2.widget.ViewPager2.OnPageChangeCallback): void;
				public dispatchRestoreInstanceState(param0: globalAndroid.util.SparseArray<globalAndroid.os.Parcelable>): void;
				public getAccessibilityClassName(): string;
				public onLayout(param0: boolean, param1: number, param2: number, param3: number, param4: number): void;
				public performAccessibilityAction(param0: number, param1: globalAndroid.os.Bundle): boolean;
				public getScrollState(): number;
				public canScrollVertically(param0: number): boolean;
				public constructor(param0: globalAndroid.content.Context, param1: globalAndroid.util.AttributeSet);
				public onSaveInstanceState(): globalAndroid.os.Parcelable;
				public setOrientation(param0: number): void;
				public setCurrentItem(param0: number, param1: boolean): void;
				public getAdapter(): androidx.recyclerview.widget.RecyclerView.Adapter;
				public removeItemDecoration(param0: androidx.recyclerview.widget.RecyclerView.ItemDecoration): void;
				public addItemDecoration(param0: androidx.recyclerview.widget.RecyclerView.ItemDecoration, param1: number): void;
				public endFakeDrag(): boolean;
				public getItemDecorationCount(): number;
				public invalidateItemDecorations(): void;
				public setCurrentItem(param0: number): void;
				public setLayoutDirection(param0: number): void;
				public onViewAdded(param0: globalAndroid.view.View): void;
				public registerOnPageChangeCallback(param0: androidx.viewpager2.widget.ViewPager2.OnPageChangeCallback): void;
				public getItemDecorationAt(param0: number): androidx.recyclerview.widget.RecyclerView.ItemDecoration;
				public setPageTransformer(param0: androidx.viewpager2.widget.ViewPager2.PageTransformer): void;
				public onInitializeAccessibilityNodeInfo(param0: globalAndroid.view.accessibility.AccessibilityNodeInfo): void;
				public addItemDecoration(param0: androidx.recyclerview.widget.RecyclerView.ItemDecoration): void;
				public onMeasure(param0: number, param1: number): void;
				public getCurrentItem(): number;
				public getOffscreenPageLimit(): number;
				public removeItemDecorationAt(param0: number): void;
			}
			export module ViewPager2 {
				export abstract class AccessibilityProvider {
					public static class: java.lang.Class<androidx.viewpager2.widget.ViewPager2.AccessibilityProvider>;
				}
				export class BasicAccessibilityProvider extends androidx.viewpager2.widget.ViewPager2.AccessibilityProvider {
					public static class: java.lang.Class<androidx.viewpager2.widget.ViewPager2.BasicAccessibilityProvider>;
					public onLmInitializeAccessibilityNodeInfo(param0: androidx.core.view.accessibility.AccessibilityNodeInfoCompat): void;
					public onRvGetAccessibilityClassName(): string;
					public handlesRvGetAccessibilityClassName(): boolean;
					public onLmPerformAccessibilityAction(param0: number): boolean;
					public handlesLmPerformAccessibilityAction(param0: number): boolean;
				}
				export abstract class DataSetChangeObserver {
					public static class: java.lang.Class<androidx.viewpager2.widget.ViewPager2.DataSetChangeObserver>;
					public onChanged(): void;
					public onItemRangeMoved(param0: number, param1: number, param2: number): void;
					public onItemRangeChanged(param0: number, param1: number, param2: any): void;
					public onItemRangeChanged(param0: number, param1: number): void;
					public onItemRangeRemoved(param0: number, param1: number): void;
					public onItemRangeInserted(param0: number, param1: number): void;
				}
				export class LinearLayoutManagerImpl {
					public static class: java.lang.Class<androidx.viewpager2.widget.ViewPager2.LinearLayoutManagerImpl>;
					public calculateExtraLayoutSpace(param0: androidx.recyclerview.widget.RecyclerView.State, param1: native.Array<number>): void;
					public requestChildRectangleOnScreen(param0: androidx.recyclerview.widget.RecyclerView, param1: globalAndroid.view.View, param2: globalAndroid.graphics.Rect, param3: boolean, param4: boolean): boolean;
					public onInitializeAccessibilityNodeInfo(param0: androidx.recyclerview.widget.RecyclerView.Recycler, param1: androidx.recyclerview.widget.RecyclerView.State, param2: androidx.core.view.accessibility.AccessibilityNodeInfoCompat): void;
					public performAccessibilityAction(param0: androidx.recyclerview.widget.RecyclerView.Recycler, param1: androidx.recyclerview.widget.RecyclerView.State, param2: number, param3: globalAndroid.os.Bundle): boolean;
				}
				export class OffscreenPageLimit {
					public static class: java.lang.Class<androidx.viewpager2.widget.ViewPager2.OffscreenPageLimit>;
					/**
					 * Constructs a new instance of the androidx.viewpager2.widget.ViewPager2$OffscreenPageLimit interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
					 */
					public constructor(implementation: {
					});
					public constructor();
				}
				export abstract class OnPageChangeCallback {
					public static class: java.lang.Class<androidx.viewpager2.widget.ViewPager2.OnPageChangeCallback>;
					public onPageSelected(param0: number): void;
					public onPageScrolled(param0: number, param1: number, param2: number): void;
					public constructor();
					public onPageScrollStateChanged(param0: number): void;
				}
				export class Orientation {
					public static class: java.lang.Class<androidx.viewpager2.widget.ViewPager2.Orientation>;
					/**
					 * Constructs a new instance of the androidx.viewpager2.widget.ViewPager2$Orientation interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
					 */
					public constructor(implementation: {
					});
					public constructor();
				}
				export class PageAwareAccessibilityProvider extends androidx.viewpager2.widget.ViewPager2.AccessibilityProvider {
					public static class: java.lang.Class<androidx.viewpager2.widget.ViewPager2.PageAwareAccessibilityProvider>;
					public handlesPerformAccessibilityAction(param0: number, param1: globalAndroid.os.Bundle): boolean;
					public onPerformAccessibilityAction(param0: number, param1: globalAndroid.os.Bundle): boolean;
					public onAttachAdapter(param0: androidx.recyclerview.widget.RecyclerView.Adapter<any>): void;
					public onSetLayoutDirection(): void;
					public onRestorePendingState(): void;
					public onGetAccessibilityClassName(): string;
					public onDetachAdapter(param0: androidx.recyclerview.widget.RecyclerView.Adapter<any>): void;
					public onRvInitializeAccessibilityEvent(param0: globalAndroid.view.accessibility.AccessibilityEvent): void;
					public onSetUserInputEnabled(): void;
					public onSetNewCurrentItem(): void;
					public onSetOrientation(): void;
					public onInitialize(param0: androidx.viewpager2.widget.CompositeOnPageChangeCallback, param1: androidx.recyclerview.widget.RecyclerView): void;
					public handlesGetAccessibilityClassName(): boolean;
					public onInitializeAccessibilityNodeInfo(param0: globalAndroid.view.accessibility.AccessibilityNodeInfo): void;
				}
				export class PageTransformer {
					public static class: java.lang.Class<androidx.viewpager2.widget.ViewPager2.PageTransformer>;
					/**
					 * Constructs a new instance of the androidx.viewpager2.widget.ViewPager2$PageTransformer interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
					 */
					public constructor(implementation: {
						transformPage(param0: globalAndroid.view.View, param1: number): void;
					});
					public constructor();
					public transformPage(param0: globalAndroid.view.View, param1: number): void;
				}
				export class PagerSnapHelperImpl {
					public static class: java.lang.Class<androidx.viewpager2.widget.ViewPager2.PagerSnapHelperImpl>;
					public findSnapView(param0: androidx.recyclerview.widget.RecyclerView.LayoutManager): globalAndroid.view.View;
				}
				export class RecyclerViewImpl {
					public static class: java.lang.Class<androidx.viewpager2.widget.ViewPager2.RecyclerViewImpl>;
					public getAccessibilityClassName(): string;
					public onInitializeAccessibilityEvent(param0: globalAndroid.view.accessibility.AccessibilityEvent): void;
					public onTouchEvent(param0: globalAndroid.view.MotionEvent): boolean;
					public onInterceptTouchEvent(param0: globalAndroid.view.MotionEvent): boolean;
				}
				export class SavedState {
					public static class: java.lang.Class<androidx.viewpager2.widget.ViewPager2.SavedState>;
					public static CREATOR: globalAndroid.os.Parcelable.Creator<androidx.viewpager2.widget.ViewPager2.SavedState>;
					public writeToParcel(param0: globalAndroid.os.Parcel, param1: number): void;
				}
				export class ScrollState {
					public static class: java.lang.Class<androidx.viewpager2.widget.ViewPager2.ScrollState>;
					/**
					 * Constructs a new instance of the androidx.viewpager2.widget.ViewPager2$ScrollState interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
					 */
					public constructor(implementation: {
					});
					public constructor();
				}
				export class SmoothScrollToPosition {
					public static class: java.lang.Class<androidx.viewpager2.widget.ViewPager2.SmoothScrollToPosition>;
					public run(): void;
				}
			}
		}
	}
}

//Generics information:

