declare module org {
    module nativescript {
        module widgets {
						export class BoxShadowDrawable {
								public constructor(drawable: android.graphics.drawable.Drawable, value: string);
								public getWrappedDrawable(): android.graphics.drawable.Drawable;
								public toString(): string;
						}

            export class CustomTransition extends androidx.transition.Visibility {
                constructor(animatorSet: android.animation.AnimatorSet, transitionName: string);
                public setResetOnTransitionEnd(resetOnTransitionEnd: boolean): void;
                public getTransitionName(): string;
            }
            export module Async {
                export class CompleteCallback {
                    constructor(implementation: ICompleteCallback);
                    onComplete(result: Object, context: Object): void;
                    onError(error: string, context: Object): void;
                }

                export interface ICompleteCallback {
                    onComplete(result: Object, context: Object): void;
                    onError(error: string, context: Object): void;
                }

                export module Image {
                    export function download(url: string, callback: CompleteCallback, context: any);
                }

                export module File {
                    export function readText(path: string, encoding: string, callback: CompleteCallback, context: any);
                    export function read(path: string, callback: CompleteCallback, context: any);
                    export function writeText(path: string, content: string, encoding: string, callback: CompleteCallback, context: any);
                    export function write(path: string, content: androidNative.Array<number>, callback: CompleteCallback, context: any);
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
                        public content: java.nio.ByteBuffer;
                        public timeout: number;
                        public screenWidth: number;
                        public screenHeight: number;
                        public dontFollowRedirects: boolean;
                    }

                    export class RequestResult {
                        public raw: java.io.ByteArrayOutputStream;
                        public headers: java.util.ArrayList<KeyValuePair>;
                        public statusCode: number;
                        public statusText: string;
                        public url: string;
                        public responseAsString: string;
                        public responseAsImage: android.graphics.Bitmap;
                        public error: java.lang.Exception;
                    }

                    export function MakeRequest(options: RequestOptions, callback: CompleteCallback, context: any);
                }
            }

            export class FragmentBase extends androidx.fragment.app.Fragment {
                constructor();

                public getRemovingParentFragment(): androidx.fragment.app.Fragment;
            }

            export class BorderDrawable extends android.graphics.drawable.ColorDrawable {
                constructor(density: number);
                constructor(density: number, id: string);

                public refresh(
                    borderTopColor: number,
                    borderRightColor: number,
                    borderBottomColor: number,
                    borderLeftColor: number,

                    borderTopWidth: number,
                    borderRightWidth: number,
                    borderBottomWidth: number,
                    borderLeftWidth: number,

                    borderTopLeftRadius: number,
                    borderTopRightRadius: number,
                    borderBottomRightRadius: number,
                    borderBottomLeftRadius: number,

                    clipPath: string,

                    backgroundColor: number,
                    backgroundImage: string,
                    backgroundBitmap: android.graphics.Bitmap,
                    backgroundGradient: LinearGradientDefinition,
                    context: android.content.Context,
                    backgroundRepeat: string,
                    backgroundPosition: string,
                    backgroundPositionParsedCSSValues: androidNative.Array<CSSValue>,
                    backgroundSize: string,
                    backgroundSizeParsedCSSValues: androidNative.Array<CSSValue>
                );

                public getBorderTopColor(): number;
                public getBorderRightColor(): number;
                public getBorderBottomColor(): number;
                public getBorderLeftColor(): number;
                public getUniformBorderColor(): number;

                public getBorderTopWidth(): number;
                public getBorderRightWidth(): number;
                public getBorderBottomWidth(): number;
                public getBorderLeftWidth(): number;
                public getUniformBorderWidth(): number;

                public getBorderTopLeftRadius(): number;
                public getBorderTopRightRadius(): number;
                public getBorderBottomRightRadius(): number;
                public getBorderBottomLeftRadius(): number;
                public getUniformBorderRadius(): number;

                public getClipPath(): string;

                public getBackgroundColor(): number;
                public getBackgroundImage(): string;
                public getBackgroundBitmap(): android.graphics.Bitmap;

                public getBackgroundRepeat(): string;
                public getBackgroundPosition(): string;
                public getBackgroundSize(): string;

                public hasUniformBorderColor(): boolean;
                public hasUniformBorderWidth(): boolean;
                public hasUniformBorderRadius(): boolean;
                public hasUniformBorder(): boolean;

                public toDebugString(): string;
            }

            export class LinearGradientDefinition {
                constructor(startX: number, endX: number, startY: number,
                    endY: number, colors: number[], stops?: number[]);

                public getStartX(): number;
                public getStartY(): number;
                public getEndX(): number;
                public getEndY(): number;
                public getColors(): number[];
                public getStops(): number[];
            }

            export class CSSValue {
                constructor(type: string, str: string, unit: string, value: number);
                public getType(): string;
                public getString(): string;
                public getUnit(): string;
                public getValue(): number;
            }

            export class CommonLayoutParams extends android.widget.FrameLayout.LayoutParams {
                constructor();

                public widthPercent: number;
                public heightPercent: number;

                public topMarginPercent: number;
                public leftMarginPercent: number;
                public bottomMarginPercent: number;
                public rightMarginPercent: number;

                public left: number;
                public top: number;

                public dock: Dock;

                public row: number;
                public column: number;

                public rowSpan: number;
                public columnSpan: number;

                public horizontalAlignment: HorizontalAlignment;
                public verticalAlignment: VerticalAlignment;
            }

            export enum Stretch {
                none,
                aspectFill,
                aspectFit,
                fill
            }

            export enum HorizontalAlignment {
                left,
                center,
                right,
                stretch
            }

            export enum VerticalAlignment {
                top,
                center,
                bottom,
                stretch
            }

            export enum Dock {
                left,
                top,
                right,
                bottom
            }

            export enum GridUnitType {
                auto,
                pixel,
                star
            }

            export enum Orientation {
                horizontal,
                vertical
            }

            export class OriginPoint {
                public static setX(view: android.view.View, value: number);
                public static setY(view: android.view.View, value: number);
            }

            export class LayoutBase extends android.view.ViewGroup {
                constructor(context: android.content.Context);
            }

            export class AbsoluteLayout extends LayoutBase {
                constructor(context: android.content.Context);
            }

            export class DockLayout extends LayoutBase {
                constructor(context: android.content.Context);

                public getStretchLastChild(): boolean;
                public setStretchLastChild(value: boolean): void;
            }

            export class StackLayout extends LayoutBase {
                constructor(context: android.content.Context);

                public getOrientation(): Orientation;
                public setOrientation(value: Orientation): void;
            }

            export class WrapLayout extends LayoutBase {
                constructor(context: android.content.Context);

                public getOrientation(): Orientation;
                public setOrientation(value: Orientation): void;

                public getItemWidth(): number;
                public setItemWidth(value: number): void;

                public getItemHeight(): number;
                public setItemHeight(value: number): void;
            }

            export class ItemSpec {
                constructor();
                constructor(value: number, unitType: GridUnitType);
                public getGridUnitType(): GridUnitType;
                public getIsAbsolute(): boolean;
                public getIsAuto(): boolean;
                public getIsStar(): boolean;
                public getValue(): number;
                public getActualLength(): number;
            }

            export class GridLayout extends LayoutBase {
                constructor(context: android.content.Context);

                public addRow(itemSpec: ItemSpec): void;
                public addColumn(itemSpec: ItemSpec): void;

                public removeRow(itemSpec: ItemSpec): void;
                public removeColumn(itemSpec: ItemSpec): void;

                public removeRowAt(index: number): void;
                public removeColumnAt(index: number): void;

                public getColumns(): Array<ItemSpec>;
                public getRows(): Array<ItemSpec>;
            }

            export class FlexboxLayout extends LayoutBase {
                constructor(context: android.content.Context);

                public getFlexDirection(): number;
                public setFlexDirection(value: number);

                public getFlexWrap(): number;
                public setFlexWrap(value: number);

                public getJustifyContent(): number;
                public setJustifyContent(value: number);

                public getAlignItems(): number;
                public setAlignItems(value: number);

                public getAlignContent(): number;
                public setAlignContent(value: number);

                public static FLEX_DIRECTION_ROW: number;
                public static FLEX_DIRECTION_ROW_REVERSE: number;
                public static FLEX_DIRECTION_COLUMN: number;
                public static FLEX_DIRECTION_COLUMN_REVERSE: number;

                public static FLEX_WRAP_NOWRAP: number;
                public static FLEX_WRAP_WRAP: number;
                public static FLEX_WRAP_WRAP_REVERSE: number;

                public static JUSTIFY_CONTENT_FLEX_START: number;
                public static JUSTIFY_CONTENT_FLEX_END: number;
                public static JUSTIFY_CONTENT_CENTER: number;
                public static JUSTIFY_CONTENT_SPACE_BETWEEN: number;
                public static JUSTIFY_CONTENT_SPACE_AROUND: number;

                public static ALIGN_ITEMS_FLEX_START: number;
                public static ALIGN_ITEMS_FLEX_END: number;
                public static ALIGN_ITEMS_CENTER: number;
                public static ALIGN_ITEMS_BASELINE: number;
                public static ALIGN_ITEMS_STRETCH: number;

                public static ALIGN_CONTENT_FLEX_START: number;
                public static ALIGN_CONTENT_FLEX_END: number;
                public static ALIGN_CONTENT_CENTER: number;
                public static ALIGN_CONTENT_SPACE_BETWEEN: number;
                public static ALIGN_CONTENT_SPACE_AROUND: number;
                public static ALIGN_CONTENT_STRETCH: number;
            }
            export namespace FlexboxLayout {
                export class LayoutParams extends org.nativescript.widgets.CommonLayoutParams {
                    public static ALIGN_SELF_AUTO: number;
                    public static ALIGN_SELF_FLEX_START: number;
                    public static ALIGN_SELF_FLEX_END: number;
                    public static ALIGN_SELF_CENTER: number;
                    public static ALIGN_SELF_BASELINE: number;
                    public static ALIGN_SELF_STRETCH: number;

                    public order: number;
                    public flexGrow: number;
                    public flexShrink: number;
                    public alignSelf: number;
                    public wrapBefore: boolean;
                    public minWidth: number;
                    public minHeight: number;
                }
            }

            export class ContentLayout extends LayoutBase {
                constructor(context: android.content.Context);
            }

            export class VerticalScrollView extends android.widget.ScrollView {
                constructor(context: android.content.Context);
                public getScrollableLength(): number;
                public getScrollEnabled(): boolean;
                public setScrollEnabled(value: boolean): void;
            }

            export class HorizontalScrollView extends android.widget.HorizontalScrollView {
                constructor(context: android.content.Context);
                public getScrollableLength(): number;
                public getScrollEnabled(): boolean;
                public setScrollEnabled(value: boolean): void;
            }

            export class ImageView extends android.widget.ImageView {
                constructor(context: android.content.Context);
                getCornerRadius(): number;
                setCornerRadius(radius: number): void;

                getBorderWidth(): number;
                setBorderWidth(width: number): void;

                getRotationAngle(): number;
                setRotationAngle(angle: number): void;

                setUri(uri: string, decodeWidth: number, decodeHeight: number, keepAspectRatio: boolean, useCache: boolean, async: boolean): void;
                setImageLoadedListener(listener: image.Worker.OnImageLoadedListener): void;
            }

            export enum TabIconRenderingMode {
                original,
                template
            }

            export class TabLayout extends android.widget.HorizontalScrollView {
                constructor(context: android.content.Context);
                constructor(context: android.content.Context, attrs: android.util.AttributeSet);
                constructor(context: android.content.Context, attrs: android.util.AttributeSet, defStyle: number);

                setSelectedIndicatorColors(color: Array<number>): void;
                getSelectedIndicatorColors(): Array<number>;
                setIconRenderingMode(mode: TabIconRenderingMode): void;
                getIconRenderingMode(): TabIconRenderingMode;
                setTabTextColor(color: number): void;
                getTabTextColor(): number;
                setSelectedTabTextColor(color: number): void;
                getSelectedTabTextColor(): number;
                setTabTextFontSize(fontSize: number): void;
                getTabTextFontSize(): number;

                setItems(items: Array<TabItemSpec>, viewPager: androidx.viewpager.widget.ViewPager): void;
                updateItemAt(position: number, itemSpec: TabItemSpec): void;

                getTextViewForItemAt(index: number): android.widget.TextView;
                getViewForItemAt(index: number): android.widget.LinearLayout;
                getItemCount(): number;
            }

            export class TabsBar extends android.widget.HorizontalScrollView {
                constructor(context: android.content.Context);
                constructor(context: android.content.Context, attrs: android.util.AttributeSet);
                constructor(context: android.content.Context, attrs: android.util.AttributeSet, defStyle: number);

                setSelectedIndicatorColors(color: Array<number>): void;
                getSelectedIndicatorColors(): Array<number>;
                setTabTextColor(color: number): void;
                getTabTextColor(): number;
                setSelectedTabTextColor(color: number): void;
                getSelectedTabTextColor(): number;
                setTabTextFontSize(fontSize: number): void;
                getTabTextFontSize(): number;

                setItems(items: Array<TabItemSpec>, viewPager: androidx.viewpager.widget.ViewPager): void;
                updateItemAt(position: number, itemSpec: TabItemSpec): void;

                getTextViewForItemAt(index: number): android.widget.TextView;
                getViewForItemAt(index: number): android.widget.LinearLayout;
                getItemCount(): number;
            }

            export class BottomNavigationBar extends android.widget.LinearLayout {
                constructor(context: android.content.Context);
                constructor(context: android.content.Context, attrs: android.util.AttributeSet);
                constructor(context: android.content.Context, attrs: android.util.AttributeSet, defStyle: number);

                setTabTextColor(color: number): void;
                getTabTextColor(): number;
                setSelectedTabTextColor(color: number): void;
                getSelectedTabTextColor(): number;
                setTabTextFontSize(fontSize: number): void;
                getTabTextFontSize(): number;

                onTap(position: number): boolean;
                onSelectedPositionChange(position: number, prevPosition: number): void;
                setSelectedPosition(position: number): void;
                setItems(items: Array<TabItemSpec>): void;
                updateItemAt(position: number, itemSpec: TabItemSpec): void;

                getTextViewForItemAt(index: number): android.widget.TextView;
                getViewForItemAt(index: number): android.widget.LinearLayout;
                getItemCount(): number;
            }

            export class TabViewPager extends androidx.viewpager.widget.ViewPager {
                constructor(context: android.content.Context);
                constructor(context: android.content.Context, attrs: android.util.AttributeSet);

                setSwipePageEnabled(enabled: boolean): void;
							  setAnimationEnabled(enabled: boolean): void;
            }

            export class TabItemSpec {
                title: string;
                fontSize: number;
                typeFace: android.graphics.Typeface;
                iconId: number;
                iconDrawable: android.graphics.drawable.Drawable;
                imageHeight: number;
                backgroundColor: number;
                color: number;
            }

            export namespace image {

                export class Cache {
                    private constructor();
                    public static getInstance(cacheParams: Cache.CacheParams): Cache;
                }

                export class Worker {

                }

                export namespace Worker {
                    interface IOnImageLoadedListener {
                        onImageLoaded(success: boolean): void;
                    }

                    export class OnImageLoadedListener implements IOnImageLoadedListener {
                        constructor(implementation: IOnImageLoadedListener);
                        public onImageLoaded(success: boolean): void;
                    }
                }

                export class Fetcher extends Worker {
                    private constructor();
                    public static getInstance(context: android.content.Context): Fetcher;
                    public static calculateInSampleSize(imageWidth: number, imageHeight: number,
                        reqWidth: number, reqHeight: number): number;
                    public addImageCache(cache: Cache): void;
                    public initCache(): void;
                    public clearCache(): void;
                    public closeCache(): void;
                    public loadImage(data: Object, imageView: ImageView,
                        decodeWidth: number, decodeHeight: number, useCache: boolean, async: boolean,
                        listener: Worker.IOnImageLoadedListener): void;
                }

                export namespace Cache {
                    export class CacheParams {
                        public diskCacheSize: number;
                        public diskCacheEnabled: boolean;
                        public memoryCacheEnabled: boolean;
                        public setMemCacheSizePercent(percent: number): void;
                    }
                }
            }

            export class ViewHelper {
                public static getMinWidth(view: android.view.View): number;
                public static setMinWidth(view: android.view.View, value: number): void;

                public static getMinHeight(view: android.view.View): number;
                public static setMinHeight(view: android.view.View, value: number): void;

                public static getWidth(view: android.view.View): number;
                public static setWidth(view: android.view.View, value: number): void;
                public static setWidthPercent(view: android.view.View, value: number): void;

                public static getHeight(view: android.view.View): number;
                public static setHeight(view: android.view.View, value: number): void;
                public static setHeightPercent(view: android.view.View, value: number): void;

                public static getMargin(view: android.view.View): { left: number, top: number, right: number, bottom: number };
                public static setMargin(view: android.view.View, left: number, top: number, right: number, bottom: number): void;

                public static getMarginLeft(view: android.view.View): number;
                public static setMarginLeft(view: android.view.View, value: number): void;
                public static setMarginLeftPercent(view: android.view.View, value: number): void;

                public static getMarginTop(view: android.view.View): number;
                public static setMarginTop(view: android.view.View, value: number): void;
                public static setMarginTopPercent(view: android.view.View, value: number): void;

                public static getMarginRight(view: android.view.View): number;
                public static setMarginRight(view: android.view.View, value: number): void;
                public static setMarginRightPercent(view: android.view.View, value: number): void;

                public static getMarginBottom(view: android.view.View): number;
                public static setMarginBottom(view: android.view.View, value: number): void;
                public static setMarginBottomPercent(view: android.view.View, value: number): void;

                public static getHorizontalAlignment(view: android.view.View): string;
                public static setHorizontalAlignment(view: android.view.View, value: string): void;

                public static getVerticalAlignment(view: android.view.View): string;
                public static setVerticalAlignment(view: android.view.View, value: string): void;

                public static getPadding(view: android.view.View): android.graphics.Rect;
                public static setPadding(view: android.view.View, left: number, top: number, right: number, bottom: number): void;

                public static getPaddingLeft(view: android.view.View): number;
                public static setPaddingLeft(view: android.view.View, value: number): void;

                public static getPaddingTop(view: android.view.View): number;
                public static setPaddingTop(view: android.view.View, value: number): void;

                public static getPaddingRight(view: android.view.View): number;
                public static setPaddingRight(view: android.view.View, value: number): void;

                public static getPaddingBottom(view: android.view.View): number;
                public static setPaddingBottom(view: android.view.View, value: number): void;

                public static getRotate(view: android.view.View): number;
                public static setRotate(view: android.view.View, value: number): void;

                public static getRotateX(view: android.view.View): number;
                public static setRotateX(view: android.view.View, value: number): void;

                public static getRotateY(view: android.view.View): number;
                public static setRotateY(view: android.view.View, value: number): void;

                public static setPerspective(view: android.view.View, value: number): void;

                public static getScaleX(view: android.view.View): number;
                public static setScaleX(view: android.view.View, value: number): void;

                public static getScaleY(view: android.view.View): number;
                public static setScaleY(view: android.view.View, value: number): void;

                public static getTranslateX(view: android.view.View): number;
                public static setTranslateX(view: android.view.View, value: number): void;

                public static getTranslateY(view: android.view.View): number;
                public static setTranslateY(view: android.view.View, value: number): void;

                public static getZIndex(view: android.view.View): number;
                public static setZIndex(view: android.view.View, value: number): void;

                public static getLetterspacing(view: android.view.View): number;
                public static setLetterspacing(view: android.view.View, value: number): void;

                public static setBackground(view: android.view.View, background: android.graphics.drawable.Drawable): void;
            }

            export class DisableUserInteractionListener extends java.lang.Object implements android.view.View.OnTouchListener {
                public onTouch(view: android.view.View, motionEvent: android.view.MotionEvent): boolean;
            }

            export class SegmentedBarColorDrawable extends android.graphics.drawable.ColorDrawable {
                constructor(color: number, thickness: number);
            }

            export class CustomTypefaceSpan extends android.text.style.TypefaceSpan {
                constructor(family: string, typeface: android.graphics.Typeface);
            }
        }
    }
}

declare module org {
	export module nativescript {
		export module widgets {
			export class FileHelper {
				public static class: java.lang.Class<org.nativescript.widgets.FileHelper>;
				public readText(param0: globalAndroid.content.Context, param1: string, param2: org.nativescript.widgets.FileHelper.Callback): void;
				public writeSync(param0: globalAndroid.content.Context, param1: androidNative.Array<number>, param2: org.nativescript.widgets.FileHelper.Callback): void;
				public static fromString(param1: globalAndroid.content.Context, param0: string): org.nativescript.widgets.FileHelper;
				public writeText(param0: globalAndroid.content.Context, param1: string, param2: string, param3: org.nativescript.widgets.FileHelper.Callback): void;
				public writeTextSync(param0: globalAndroid.content.Context, param1: string, param2: string, param3: org.nativescript.widgets.FileHelper.Callback): void;
				public copyToFileSync(param0: globalAndroid.content.Context, param1: java.io.File, param2: org.nativescript.widgets.FileHelper.Callback): boolean;
				public getName(): string;
				public read(param0: globalAndroid.content.Context, param1: org.nativescript.widgets.FileHelper.Callback): void;
				public copyToFile(param0: globalAndroid.content.Context, param1: java.io.File, param2: org.nativescript.widgets.FileHelper.Callback): void;
				public static fromUri(param0: globalAndroid.content.Context, param1: globalAndroid.net.Uri): org.nativescript.widgets.FileHelper;
				public readSync(param0: globalAndroid.content.Context, param1: org.nativescript.widgets.FileHelper.Callback): androidNative.Array<number>;
				public write(param0: globalAndroid.content.Context, param1: androidNative.Array<number>, param2: org.nativescript.widgets.FileHelper.Callback): void;
				public getSize(): number;
				public getMime(): string;
				public readTextSync(param0: globalAndroid.content.Context, param1: string, param2: org.nativescript.widgets.FileHelper.Callback): string;
				public delete(param0: globalAndroid.content.Context): boolean;
                public static exists(param0: globalAndroid.content.Context, param1: string): boolean;
                public static exists(param0: globalAndroid.content.Context, param1: globalAndroid.net.Uri): boolean;
                public getExtension(): string;
                public getLastModified(): number;
                public renameSync(param0: globalAndroid.content.Context, param1: string, param2: org.nativescript.widgets.FileHelper.Callback): string;
                public rename(param0: globalAndroid.content.Context, param1: string, param2: org.nativescript.widgets.FileHelper.Callback): string;
			}
			export module FileHelper {
				export class Callback {
					public static class: java.lang.Class<org.nativescript.widgets.FileHelper.Callback>;
					/**
					 * Constructs a new instance of the org.nativescript.widgets.FileHelper$Callback interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
					 */
					public constructor(implementation: {
						onError(param0: java.lang.Exception): void;
						onSuccess(param0: any): void;
					});
					public constructor();
					public onError(param0: java.lang.Exception): void;
					public onSuccess(param0: any): void;
				}
			}
		}
	}
}

declare module org {
	export module nativescript {
		export module widgets {
			export class Utils {
				public static class: java.lang.Class<org.nativescript.widgets.Utils>;
                public static getBitmapFromView(param0: globalAndroid.view.View): globalAndroid.graphics.Bitmap;
				public static loadImageAsync(param0: globalAndroid.content.Context, param1: string, param2: string, param3: number, param4: number, param5: org.nativescript.widgets.Utils.AsyncImageCallback): void;
				public static drawBoxShadow(param0: globalAndroid.view.View, param1: string): void;
                public static saveToFileAsync(param0: globalAndroid.graphics.Bitmap, param1: string, param2: string, param3: number, param4: org.nativescript.widgets.Utils.AsyncImageCallback): void;
                public static toBase64StringAsync(param0: globalAndroid.graphics.Bitmap, param1: string, param2: number, param3: org.nativescript.widgets.Utils.AsyncImageCallback): void;
                public static resizeAsync(param0: globalAndroid.graphics.Bitmap, param1: number, param2: string, param3: org.nativescript.widgets.Utils.AsyncImageCallback): void;
				public constructor();
			}
			export module Utils {
				export class AsyncImageCallback {
					public static class: java.lang.Class<org.nativescript.widgets.Utils.AsyncImageCallback>;
					/**
					 * Constructs a new instance of the org.nativescript.widgets.Utils$AsyncImageCallback interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
					 */
					public constructor(implementation: {
						onSuccess(param0: any): void;
						onError(param0: java.lang.Exception): void;
					});
					public constructor();
					public onSuccess(param0: any): void;
					public onError(param0: java.lang.Exception): void;
				}
				export class ImageAssetOptions {
					public static class: java.lang.Class<org.nativescript.widgets.Utils.ImageAssetOptions>;
				}
			}
		}
	}
}
