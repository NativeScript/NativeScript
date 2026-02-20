declare module org {
    module nativescript {
        module widgets {
            export class BoxShadowDrawable {
                public constructor(drawable: android.graphics.drawable.Drawable, values: number[]);
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
                    export function copySync(src: string, dest: string, context: android.content.Context): boolean;
                    export function copy(src: java.io.InputStream, dest: java.io.OutputStream, callback: org.nativescript.widgets.Async.CompleteCallback, context: any): void;
					export function copySync(src: java.io.InputStream, dest: java.io.OutputStream, context: any): boolean;
					export function copy(src: string, dest: string, callback: org.nativescript.widgets.Async.CompleteCallback, context: android.content.Context): void;
                    export function readText(path: string, encoding: string, callback: CompleteCallback, context: any);
                    export function read(path: string, callback: CompleteCallback, context: any);
                    export function readBuffer(param0: string, param1: org.nativescript.widgets.Async.CompleteCallback, param2: any): void;
                    export function writeText(path: string, content: string, encoding: string, callback: CompleteCallback, context: any);
                    export function write(path: string, content: androidNative.Array<number>, callback: CompleteCallback, context: any);
                    export function writeBuffer(param0: string, param1: java.nio.ByteBuffer, param2: org.nativescript.widgets.Async.CompleteCallback, param3: any): void;
                    export function append(path: string, content: androidNative.Array<number>, callback: CompleteCallback, context: any);
                    export function appendBuffer(param0: string, param1: java.nio.ByteBuffer, param2: org.nativescript.widgets.Async.CompleteCallback, param3: any): void;
                    export function appendText(path: string, content: string, encoding: string, callback: CompleteCallback, context: any);
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

                    export function setCookieManager(cookieManager: java.net.CookieManager): void;
                    export function initializeCookieManager(): java.net.CookieManager;
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
                public static OverflowEdgeNone: number;
                public static OverflowEdgeLeft: number;
                public static OverflowEdgeTop: number;
                public static OverflowEdgeRight: number;
                public static OverflowEdgeBottom: number;
                public static OverflowEdgeDontApply: number;
                public static OverflowEdgeLeftDontConsume: number;
                public static OverflowEdgeTopDontConsume: number;
                public static OverflowEdgeRightDontConsume: number;
                public static OverflowEdgeBottomDontConsume: number;
                public static OverflowEdgeAllButLeft: number;
                public static OverflowEdgeAllButTop: number;
                public static OverflowEdgeAllButRight: number;
                public static OverflowEdgeAllButBottom: number;
                constructor(context: android.content.Context);
                public getOverflowEdge(): number;
                public setOverflowEdge(value: number): void;
            }

            export module LayoutBase {
                	export class WindowInsetListener {
					public constructor(implementation: {
						onApplyWindowInsets(param0: java.nio.ByteBuffer): void;
					});
					public constructor();
					public onApplyWindowInsets(param0: java.nio.ByteBuffer): void;
				}
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
                public addRow(value: number, type: org.nativescript.widgets.GridUnitType): void;
                public addColumn(value: number, type: org.nativescript.widgets.GridUnitType): void;

                public removeRowAt(index: number): void;
                public removeColumnAt(index: number): void;

                public getColumns(): Array<ItemSpec>;
                public getRows(): Array<ItemSpec>;

                public clearRows();
		        public clearColumns();
                public reset();

                public addRowsFromJSON(value: string);
                public addColumnsFromJSON(value: string);
                public addRowsAndColumnsFromJSON(rows: string, columns: string);
                public getRowActualLength(index: number): number; // for testing purpose
                public getColumnActualLength(index: number): number; // for testing purpose
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

            export class VerticalScrollView extends androidx.core.widget.NestedScrollView {
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

            export class StyleableTextView extends android.widget.TextView {
                public static class: java.lang.Class<org.nativescript.widgets.StyleableTextView>;
                public onDraw(param0: globalAndroid.graphics.Canvas): void;
                public setTextStroke(param0: number, param1: number, param2: number): void;
                public constructor(param0: globalAndroid.content.Context);
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
                constructor(typeface: android.graphics.Typeface);
            }
        }
    }
}

declare module org {
	export module nativescript {
		export module widgets {
			export class FileHelper {
                public static class: java.lang.Class<org.nativescript.widgets.FileHelper>;
				public appendSync(param0: globalAndroid.content.Context, param1: androidNative.Array<number>, param2: org.nativescript.widgets.FileHelper.Callback): void;
				public readText(param0: globalAndroid.content.Context, param1: string, param2: org.nativescript.widgets.FileHelper.Callback): void;
				public writeBufferSync(param0: globalAndroid.content.Context, param1: java.nio.ByteBuffer, param2: org.nativescript.widgets.FileHelper.Callback): void;
				public writeTextSync(param0: globalAndroid.content.Context, param1: string, param2: string, param3: org.nativescript.widgets.FileHelper.Callback): void;
				public copyToFileSync(param0: globalAndroid.content.Context, param1: java.io.File, param2: org.nativescript.widgets.FileHelper.Callback): boolean;
				public appendTextSync(param0: globalAndroid.content.Context, param1: string, param2: string, param3: org.nativescript.widgets.FileHelper.Callback): void;
				public read(param0: globalAndroid.content.Context, param1: org.nativescript.widgets.FileHelper.Callback): void;
				public renameSync(param0: globalAndroid.content.Context, param1: string, param2: org.nativescript.widgets.FileHelper.Callback): void;
				public appendBufferSync(param0: globalAndroid.content.Context, param1: java.nio.ByteBuffer, param2: org.nativescript.widgets.FileHelper.Callback): void;
				public readSync(param0: globalAndroid.content.Context, param1: org.nativescript.widgets.FileHelper.Callback): androidNative.Array<number>;
				public static fromString(param0: globalAndroid.content.Context, param1: string): org.nativescript.widgets.FileHelper;
				public getSize(): number;
				public getMime(): string;
				public static exists(param0: globalAndroid.content.Context, param1: globalAndroid.net.Uri): boolean;
				public append(param0: globalAndroid.content.Context, param1: androidNative.Array<number>, param2: org.nativescript.widgets.FileHelper.Callback): void;
				public appendBuffer(param0: globalAndroid.content.Context, param1: java.nio.ByteBuffer, param2: org.nativescript.widgets.FileHelper.Callback): void;
				public delete(param0: globalAndroid.content.Context): boolean;
				public writeSync(param0: globalAndroid.content.Context, param1: androidNative.Array<number>, param2: org.nativescript.widgets.FileHelper.Callback): void;
				public writeText(param0: globalAndroid.content.Context, param1: string, param2: string, param3: org.nativescript.widgets.FileHelper.Callback): void;
				public readBuffer(param0: globalAndroid.content.Context, param1: org.nativescript.widgets.FileHelper.Callback): void;
				public getName(): string;
				public rename(param0: globalAndroid.content.Context, param1: string, param2: org.nativescript.widgets.FileHelper.Callback): void;
				public writeBuffer(param0: globalAndroid.content.Context, param1: java.nio.ByteBuffer, param2: org.nativescript.widgets.FileHelper.Callback): void;
				public copyToFile(param0: globalAndroid.content.Context, param1: java.io.File, param2: org.nativescript.widgets.FileHelper.Callback): void;
				public readBufferSync(param0: globalAndroid.content.Context, param1: org.nativescript.widgets.FileHelper.Callback): java.nio.ByteBuffer;
				public write(param0: globalAndroid.content.Context, param1: androidNative.Array<number>, param2: org.nativescript.widgets.FileHelper.Callback): void;
				public getExtension(): string;
				public readTextSync(param0: globalAndroid.content.Context, param1: string, param2: org.nativescript.widgets.FileHelper.Callback): string;
				public static fromUri(param0: globalAndroid.content.Context, param1: globalAndroid.net.Uri): org.nativescript.widgets.FileHelper;
				public static exists(param0: globalAndroid.content.Context, param1: string): boolean;
				public appendText(param0: globalAndroid.content.Context, param1: string, param2: string, param3: org.nativescript.widgets.FileHelper.Callback): void;
				public getLastModified(): number;
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
                public static getBitmapFromDrawable(param0: globalAndroid.graphics.drawable.Drawable): globalAndroid.graphics.Bitmap;
                public static getBitmapFromView(param0: globalAndroid.view.View): globalAndroid.graphics.Bitmap;
				public static loadImageAsync(param0: globalAndroid.content.Context, param1: string, param2: string, param3: number, param4: number, param5: org.nativescript.widgets.Utils.AsyncImageCallback): void;
                public static clipCanvasOutPath(param0: globalAndroid.graphics.Canvas, param1: globalAndroid.graphics.Path): void;
				public static drawBoxShadow(param0: globalAndroid.view.View, param1: number[]): void;
                public static saveToFileAsync(param0: globalAndroid.graphics.Bitmap, param1: string, param2: string, param3: number, param4: org.nativescript.widgets.Utils.AsyncImageCallback): void;
                public static toBase64StringAsync(param0: globalAndroid.graphics.Bitmap, param1: string, param2: number, param3: org.nativescript.widgets.Utils.AsyncImageCallback): void;
                public static resizeAsync(param0: globalAndroid.graphics.Bitmap, param1: number, param2: string, param3: org.nativescript.widgets.Utils.AsyncImageCallback): void;
                public static enableEdgeToEdge(activity: androidx.activity.ComponentActivity): void;
                public static enableEdgeToEdge(activity: androidx.activity.ComponentActivity, handleDarkMode: org.nativescript.widgets.Utils.HandleDarkMode): void;
                public static enableEdgeToEdge(activity: androidx.activity.ComponentActivity, statusBarLight: java.lang.Integer, statusBarDark: java.lang.Integer, navigationBarLight: java.lang.Integer, navigationBarDark: java.lang.Integer): void;
				public static enableEdgeToEdge(activity: androidx.activity.ComponentActivity, statusBarLight: java.lang.Integer, statusBarDark: java.lang.Integer, navigationBarLight: java.lang.Integer, navigationBarDark: java.lang.Integer, handleDarkMode: org.nativescript.widgets.Utils.HandleDarkMode): void;
                public static enableEdgeToEdge(activity: androidx.activity.ComponentActivity, window: android.view.Window, handleDarkMode: org.nativescript.widgets.Utils.HandleDarkMode): void;
                public static enableEdgeToEdge(activity: androidx.activity.ComponentActivity, window: android.view.Window): void;
                public static ignoreEdgeToEdgeOnOlderDevices: boolean;
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
                export class HandleDarkMode {
                    public static class: java.lang.Class<org.nativescript.widgets.Utils.HandleDarkMode>;
                    /**
                     * Constructs a new instance of the org.nativescript.widgets.Utils$HandleDarkMode interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
                     */
                    public constructor(implementation: {
                        onHandle(param0: number, param1: globalAndroid.content.res.Resources): boolean;
                    });
                    public constructor();
                    public onHandle(param0: number, param1: globalAndroid.content.res.Resources): boolean;
                }
                export class HandleDarkModeBar {
					public static class: java.lang.Class<org.nativescript.widgets.Utils.HandleDarkModeBar>;
					public static status: org.nativescript.widgets.Utils.HandleDarkModeBar;
					public static navigation: org.nativescript.widgets.Utils.HandleDarkModeBar;
					public static valueOf(name: string): org.nativescript.widgets.Utils.HandleDarkModeBar;
					public static values(): androidNative.Array<org.nativescript.widgets.Utils.HandleDarkModeBar>;
					public getValue(): number;
				}
				export class ImageAssetOptions {
					public static class: java.lang.Class<org.nativescript.widgets.Utils.ImageAssetOptions>;
				}
			}
		}
	}
}


declare module org {
    export module nativescript {
        export module widgets {
            export class AppWidgetManager {
                public static class: java.lang.Class<org.nativescript.widgets.AppWidgetManager>;
                public static INSTANCE: org.nativescript.widgets.AppWidgetManager;
                public notifyEnabled$widgets_release(provider: string): void;
                public notifyDeleted$widgets_release(provider: string, appWidgetIds: androidNative.Array<number>): void;
                public notifyOptionsChanged$widgets_release(context: globalAndroid.content.Context, provider: string, appWidgetId: number, newOptions: globalAndroid.os.Bundle, manager: org.nativescript.widgets.RemoteViewsManager, widgetManager: globalAndroid.appwidget.AppWidgetManager): void;
                public notifyUpdateAsync$widgets_release(context: globalAndroid.content.Context, provider: string, appWidgetIds: androidNative.Array<number>, manager: org.nativescript.widgets.RemoteViewsManager, widgetManager: globalAndroid.appwidget.AppWidgetManager): void;
                public getManager(provider: string): org.nativescript.widgets.RemoteViewsManager;
                public register(providerClass: string, listener: org.nativescript.widgets.AppWidgetManager.WidgetListener): void;
                public unregister(providerClass: string): void;
                public notifyUpdate$widgets_release(context: globalAndroid.content.Context, provider: string, appWidgetIds: androidNative.Array<number>, manager: org.nativescript.widgets.RemoteViewsManager, widgetManager: globalAndroid.appwidget.AppWidgetManager): void;
                public notifyDisabled$widgets_release(provider: string): void;
            }
            export module AppWidgetManager {
                export class WidgetListener {
                    public static class: java.lang.Class<org.nativescript.widgets.AppWidgetManager.WidgetListener>;
                    /**
                     * Constructs a new instance of the org.nativescript.widgets.AppWidgetManager$WidgetListener interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
                     */
                    public constructor(implementation: {
                        onEnabled?(provider: string): void;
                        onUpdate?(context: globalAndroid.content.Context, provider: string, appWidgetIds: androidNative.Array<number>, manager: org.nativescript.widgets.RemoteViewsManager, widgetManager: globalAndroid.appwidget.AppWidgetManager): void;
                        onUpdateAsync?(context: globalAndroid.content.Context, provider: string, appWidgetIds: androidNative.Array<number>, manager: org.nativescript.widgets.RemoteViewsManager, widgetManager: globalAndroid.appwidget.AppWidgetManager): void;
                        onDisabled?(provider: string): void;
                        onDeleted?(provider: string, appWidgetIds: androidNative.Array<number>): void;
                        onOptionsChanged?(context: globalAndroid.content.Context, provider: string, appWidgetId: number, newOptions: globalAndroid.os.Bundle, manager: org.nativescript.widgets.RemoteViewsManager, widgetManager: globalAndroid.appwidget.AppWidgetManager): void;
                    });
                    public constructor();
                    public onEnabled(provider: string): void;
                    public onUpdate(context: globalAndroid.content.Context, provider: string, appWidgetIds: androidNative.Array<number>, manager: org.nativescript.widgets.RemoteViewsManager, widgetManager: globalAndroid.appwidget.AppWidgetManager): void;
                    public onDisabled(provider: string): void;
                    public onDeleted(provider: string, appWidgetIds: androidNative.Array<number>): void;
                    public onUpdateAsync(context: globalAndroid.content.Context, provider: string, appWidgetIds: androidNative.Array<number>, manager: org.nativescript.widgets.RemoteViewsManager, widgetManager: globalAndroid.appwidget.AppWidgetManager): void;
                    public onOptionsChanged(context: globalAndroid.content.Context, provider: string, appWidgetId: number, newOptions: globalAndroid.os.Bundle, manager: org.nativescript.widgets.RemoteViewsManager, widgetManager: globalAndroid.appwidget.AppWidgetManager): void;
                }
                export module WidgetListener {
                    export class DefaultImpls {
                        public static class: java.lang.Class<org.nativescript.widgets.AppWidgetManager.WidgetListener.DefaultImpls>;
                        /** @deprecated */
                        public static onOptionsChanged($this: org.nativescript.widgets.AppWidgetManager.WidgetListener, context: globalAndroid.content.Context, provider: string, appWidgetId: number, newOptions: globalAndroid.os.Bundle, manager: org.nativescript.widgets.RemoteViewsManager, widgetManager: globalAndroid.appwidget.AppWidgetManager): void;
                        /** @deprecated */
                        public static onUpdateAsync($this: org.nativescript.widgets.AppWidgetManager.WidgetListener, context: globalAndroid.content.Context, provider: string, appWidgetIds: androidNative.Array<number>, manager: org.nativescript.widgets.RemoteViewsManager, widgetManager: globalAndroid.appwidget.AppWidgetManager): void;
                        /** @deprecated */
                        public static onEnabled($this: org.nativescript.widgets.AppWidgetManager.WidgetListener, provider: string): void;
                        /** @deprecated */
                        public static onDisabled($this: org.nativescript.widgets.AppWidgetManager.WidgetListener, provider: string): void;
                        /** @deprecated */
                        public static onUpdate($this: org.nativescript.widgets.AppWidgetManager.WidgetListener, context: globalAndroid.content.Context, provider: string, appWidgetIds: androidNative.Array<number>, manager: org.nativescript.widgets.RemoteViewsManager, widgetManager: globalAndroid.appwidget.AppWidgetManager): void;
                        /** @deprecated */
                        public static onDeleted($this: org.nativescript.widgets.AppWidgetManager.WidgetListener, provider: string, appWidgetIds: androidNative.Array<number>): void;
                    }
                }
            }
        }
    }
}

declare module org {
    export module nativescript {
        export module widgets {
            export class AppWidgetProvider {
                public static class: java.lang.Class<org.nativescript.widgets.AppWidgetProvider>;
                public onDisabled(context: globalAndroid.content.Context): void;
                public onEnabled($this$iv: globalAndroid.content.Context): void;
                public onUpdate(request$iv: globalAndroid.content.Context, this_$iv: globalAndroid.appwidget.AppWidgetManager, context$iv: androidNative.Array<number>): void;
                public onDeleted(it: globalAndroid.content.Context, this_: androidNative.Array<number>): void;
                public onAppWidgetOptionsChanged(manager: globalAndroid.content.Context, it: globalAndroid.appwidget.AppWidgetManager, ctx: number, this_: globalAndroid.os.Bundle): void;
                public constructor();
            }
            export module AppWidgetProvider {
                export class WidgetWorker extends org.nativescript.widgets.AppWidgetWorker {
                    public static class: java.lang.Class<org.nativescript.widgets.AppWidgetProvider.WidgetWorker>;
                    public constructor(context: globalAndroid.content.Context, params: androidx.work.WorkerParameters);
                    public doWork(): androidx.work.ListenableWorker.Result;
                }
            }
        }
    }
}

declare module org {
    export module nativescript {
        export module widgets {
            export abstract class AppWidgetWorker {
                public static class: java.lang.Class<org.nativescript.widgets.AppWidgetWorker>;
                public static KEY_WIDGET_IDS: string = "widget_ids";
                public static KEY_PROVIDER: string = "provider";
                public getWidgetIds(): androidNative.Array<number>;
                public static enqueue(context: globalAndroid.content.Context, workerClass: java.lang.Class<any>, provider: string, widgetIds: androidNative.Array<number>): void;
                public updateWidget(this_: number, widgetId: globalAndroid.widget.RemoteViews): void;
                public static enqueuePeriodic(context: globalAndroid.content.Context, workerClass: java.lang.Class<any>, provider: string, widgetIds: androidNative.Array<number>, repeatIntervalMinutes: number): void;
                public updateWidgets(mgr: globalAndroid.widget.RemoteViews): void;
                public getProvider(): string;
                public static cancelPeriodic(context: globalAndroid.content.Context, provider: string): void;
                public static buildData(provider: string, widgetIds: androidNative.Array<number>): androidx.work.Data;
                public static enqueuePeriodic(context: globalAndroid.content.Context, workerClass: java.lang.Class<any>, provider: string, widgetIds: androidNative.Array<number>): void;
                public static cancelPeriodic(context: globalAndroid.content.Context, provider: string, uniqueWorkName: string): void;
                public constructor(context: globalAndroid.content.Context, params: androidx.work.WorkerParameters);
                public static enqueuePeriodic(context: globalAndroid.content.Context, workerClass: java.lang.Class<any>, provider: string, widgetIds: androidNative.Array<number>, repeatIntervalMinutes: number, uniqueWorkName: string): void;
                public static isScheduled(context: globalAndroid.content.Context, provider: string): boolean;
            }
            export module AppWidgetWorker {
                export class Companion {
                    public static class: java.lang.Class<org.nativescript.widgets.AppWidgetWorker.Companion>;
                    public enqueuePeriodic(this_: globalAndroid.content.Context, context: java.lang.Class<any>, workerClass: string, provider: androidNative.Array<number>, widgetIds: number, repeatIntervalMinutes: string): void;
                    public buildData(provider: string, widgetIds: androidNative.Array<number>): androidx.work.Data;
                    public isScheduled(it: globalAndroid.content.Context, element$iv: string): boolean;
                    public enqueuePeriodic(context: globalAndroid.content.Context, workerClass: java.lang.Class<any>, provider: string, widgetIds: androidNative.Array<number>, repeatIntervalMinutes: number): void;
                    public cancelPeriodic(context: globalAndroid.content.Context, provider: string): void;
                    public cancelPeriodic(context: globalAndroid.content.Context, provider: string, uniqueWorkName: string): void;
                    public enqueue(now: globalAndroid.content.Context, last: java.lang.Class<any>, request: string, this_: androidNative.Array<number>): void;
                    public enqueuePeriodic(context: globalAndroid.content.Context, workerClass: java.lang.Class<any>, provider: string, widgetIds: androidNative.Array<number>): void;
                }
            }
        }
    }
}

declare module org {
    export module nativescript {
        export module widgets {
            export class RemoteViews {
                public static class: java.lang.Class<org.nativescript.widgets.RemoteViews>;
                public getId(): string;
                public setShort(method: string, value: number): org.nativescript.widgets.RemoteViews;
                public setBoolean(method: string, value: boolean): org.nativescript.widgets.RemoteViews;
                public setLong(method: string, value: number): org.nativescript.widgets.RemoteViews;
                public setInt(method: string, value: number): org.nativescript.widgets.RemoteViews;
                public setOnClickPendingIntent(intent: globalAndroid.app.PendingIntent): org.nativescript.widgets.RemoteViews;
                public constructor(layout: org.nativescript.widgets.RemoteViews.Layout, id: string);
                public getCommands(): java.util.Map<string,org.nativescript.widgets.RemoteViews.Command>;
                public setBackgroundColor(value: number): org.nativescript.widgets.RemoteViews;
                public setString(method: string, value: string): org.nativescript.widgets.RemoteViews;
                public setFloat(method: string, value: number): org.nativescript.widgets.RemoteViews;
                public setByte(method: string, value: number): org.nativescript.widgets.RemoteViews;
                public setSize(width: number, widthUnit: number, height: number, heightUnit: number): org.nativescript.widgets.RemoteViews;
                public findViewById(id: string): org.nativescript.widgets.RemoteViews;
                public build(packageName: string): globalAndroid.widget.RemoteViews;
                public getLayout(): org.nativescript.widgets.RemoteViews.Layout;
                public setHeight(value: number, unit: number): org.nativescript.widgets.RemoteViews;
                public resolveRemoteResources(): void;
                public toLayoutId(): number;
                public setVisibility(visibility: number): org.nativescript.widgets.RemoteViews;
                public setWidth(value: number, unit: number): org.nativescript.widgets.RemoteViews;
            }
            export module RemoteViews {
                export class AdapterViewFlipper extends org.nativescript.widgets.RemoteViews {
                    public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.AdapterViewFlipper>;
                    public constructor();
                    public constructor(layout: org.nativescript.widgets.RemoteViews.Layout, id: string);
                    public constructor(id: string);
                }
                export class Button extends org.nativescript.widgets.RemoteViews implements org.nativescript.widgets.RemoteViews.TextLike {
                    public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.Button>;
                    public getCommands(): java.util.Map<string,org.nativescript.widgets.RemoteViews.Command>;
                    public constructor();
                    public setText(value: string): org.nativescript.widgets.RemoteViews.TextLike;
                    public constructor(layout: org.nativescript.widgets.RemoteViews.Layout, id: string);
                    public constructor(id: string);
                    public setTextColor(value: number): org.nativescript.widgets.RemoteViews.TextLike;
                }
                export class Chronometer extends org.nativescript.widgets.RemoteViews {
                    public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.Chronometer>;
                    public constructor();
                    public constructor(layout: org.nativescript.widgets.RemoteViews.Layout, id: string);
                    public constructor(id: string);
                }
                export abstract class Command {
                    public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.Command>;
                    public applyToWithContext(rv: globalAndroid.widget.RemoteViews, targetId: number, context: globalAndroid.content.Context): void;
                    public applyTo(param0: globalAndroid.widget.RemoteViews, param1: number): void;
                }
                export module Command {
                    export class SetBackgroundColor extends org.nativescript.widgets.RemoteViews.Command {
                        public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.Command.SetBackgroundColor>;
                        public equals(other: any): boolean;
                        public applyTo(rv: globalAndroid.widget.RemoteViews, targetId: number): void;
                        public hashCode(): number;
                        public constructor(value: number);
                        public component1(): number;
                        public copy(value: number): org.nativescript.widgets.RemoteViews.Command.SetBackgroundColor;
                        public toString(): string;
                        public getValue(): number;
                    }
                    export class SetBoolean extends org.nativescript.widgets.RemoteViews.Command {
                        public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.Command.SetBoolean>;
                        public equals(other: any): boolean;
                        public copy(method: string, value: boolean): org.nativescript.widgets.RemoteViews.Command.SetBoolean;
                        public component2(): boolean;
                        public constructor(method: string, value: boolean);
                        public getValue(): boolean;
                        public applyTo(rv: globalAndroid.widget.RemoteViews, targetId: number): void;
                        public component1(): string;
                        public hashCode(): number;
                        public getMethod(): string;
                        public toString(): string;
                    }
                    export class SetByte extends org.nativescript.widgets.RemoteViews.Command {
                        public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.Command.SetByte>;
                        public component2(): number;
                        public equals(other: any): boolean;
                        public copy(method: string, value: number): org.nativescript.widgets.RemoteViews.Command.SetByte;
                        public applyTo(rv: globalAndroid.widget.RemoteViews, targetId: number): void;
                        public component1(): string;
                        public hashCode(): number;
                        public getMethod(): string;
                        public constructor(method: string, value: number);
                        public toString(): string;
                        public getValue(): number;
                    }
                    export class SetFloat extends org.nativescript.widgets.RemoteViews.Command {
                        public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.Command.SetFloat>;
                        public component2(): number;
                        public copy(method: string, value: number): org.nativescript.widgets.RemoteViews.Command.SetFloat;
                        public equals(other: any): boolean;
                        public applyTo(rv: globalAndroid.widget.RemoteViews, targetId: number): void;
                        public component1(): string;
                        public hashCode(): number;
                        public getMethod(): string;
                        public constructor(method: string, value: number);
                        public toString(): string;
                        public getValue(): number;
                    }
                    export class SetHeight extends org.nativescript.widgets.RemoteViews.Command {
                        public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.Command.SetHeight>;
                        public constructor(value: number, unit: number);
                        public component2(): number;
                        public equals(other: any): boolean;
                        public copy(value: number, unit: number): org.nativescript.widgets.RemoteViews.Command.SetHeight;
                        public applyTo(rv: globalAndroid.widget.RemoteViews, targetId: number): void;
                        public getUnit(): number;
                        public hashCode(): number;
                        public component1(): number;
                        public toString(): string;
                        public getValue(): number;
                    }
                    export class SetHeightDimen extends org.nativescript.widgets.RemoteViews.Command {
                        public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.Command.SetHeightDimen>;
                        public component3(): string;
                        public equals(other: any): boolean;
                        public applyTo(rv: globalAndroid.widget.RemoteViews, targetId: number): void;
                        public hashCode(): number;
                        public toString(): string;
                        public constructor(value: number, resource: string, packageName: string);
                        public getPackageName(): string;
                        public component2(): string;
                        public copy(value: number, resource: string, packageName: string): org.nativescript.widgets.RemoteViews.Command.SetHeightDimen;
                        public applyToWithContext(this_: globalAndroid.widget.RemoteViews, rv: number, targetId: globalAndroid.content.Context): void;
                        public component1(): number;
                        public getResource(): string;
                        public getValue(): number;
                    }
                    export class SetImageBitmap extends org.nativescript.widgets.RemoteViews.Command {
                        public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.Command.SetImageBitmap>;
                        public constructor(value: globalAndroid.graphics.Bitmap);
                        public equals(other: any): boolean;
                        public getValue(): globalAndroid.graphics.Bitmap;
                        public applyTo(rv: globalAndroid.widget.RemoteViews, targetId: number): void;
                        public copy(value: globalAndroid.graphics.Bitmap): org.nativescript.widgets.RemoteViews.Command.SetImageBitmap;
                        public hashCode(): number;
                        public component1(): globalAndroid.graphics.Bitmap;
                        public toString(): string;
                    }
                    export class SetImageResource extends org.nativescript.widgets.RemoteViews.Command {
                        public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.Command.SetImageResource>;
                        public equals(other: any): boolean;
                        public constructor(resId: number);
                        public applyTo(rv: globalAndroid.widget.RemoteViews, targetId: number): void;
                        public hashCode(): number;
                        public getResId(): number;
                        public component1(): number;
                        public copy(resId: number): org.nativescript.widgets.RemoteViews.Command.SetImageResource;
                        public toString(): string;
                    }
                    export class SetImageURI extends org.nativescript.widgets.RemoteViews.Command {
                        public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.Command.SetImageURI>;
                        public copy(value: globalAndroid.net.Uri): org.nativescript.widgets.RemoteViews.Command.SetImageURI;
                        public equals(other: any): boolean;
                        public constructor(value: globalAndroid.net.Uri);
                        public applyTo(rv: globalAndroid.widget.RemoteViews, targetId: number): void;
                        public hashCode(): number;
                        public getValue(): globalAndroid.net.Uri;
                        public component1(): globalAndroid.net.Uri;
                        public toString(): string;
                    }
                    export class SetImageUrl extends org.nativescript.widgets.RemoteViews.Command {
                        public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.Command.SetImageUrl>;
                        public equals(other: any): boolean;
                        public copy(url: string): org.nativescript.widgets.RemoteViews.Command.SetImageUrl;
                        public applyTo(rv: globalAndroid.widget.RemoteViews, targetId: number): void;
                        public resolve(): org.nativescript.widgets.RemoteViews.Command.SetImageBitmap;
                        public component1(): string;
                        public hashCode(): number;
                        public constructor(url: string);
                        public getUrl(): string;
                        public toString(): string;
                    }
                    export class SetInt extends org.nativescript.widgets.RemoteViews.Command {
                        public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.Command.SetInt>;
                        public component2(): number;
                        public copy(method: string, value: number): org.nativescript.widgets.RemoteViews.Command.SetInt;
                        public equals(other: any): boolean;
                        public applyTo(rv: globalAndroid.widget.RemoteViews, targetId: number): void;
                        public component1(): string;
                        public hashCode(): number;
                        public getMethod(): string;
                        public constructor(method: string, value: number);
                        public toString(): string;
                        public getValue(): number;
                    }
                    export class SetLong extends org.nativescript.widgets.RemoteViews.Command {
                        public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.Command.SetLong>;
                        public component2(): number;
                        public equals(other: any): boolean;
                        public applyTo(rv: globalAndroid.widget.RemoteViews, targetId: number): void;
                        public component1(): string;
                        public hashCode(): number;
                        public getMethod(): string;
                        public copy(method: string, value: number): org.nativescript.widgets.RemoteViews.Command.SetLong;
                        public constructor(method: string, value: number);
                        public toString(): string;
                        public getValue(): number;
                    }
                    export class SetOnClickPendingIntent extends org.nativescript.widgets.RemoteViews.Command {
                        public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.Command.SetOnClickPendingIntent>;
                        public equals(other: any): boolean;
                        public applyToWithContext(rv: globalAndroid.widget.RemoteViews, targetId: number, context: globalAndroid.content.Context): void;
                        public constructor(intent: globalAndroid.app.PendingIntent);
                        public applyTo(rv: globalAndroid.widget.RemoteViews, targetId: number): void;
                        public hashCode(): number;
                        public getIntent(): globalAndroid.app.PendingIntent;
                        public copy(intent: globalAndroid.app.PendingIntent): org.nativescript.widgets.RemoteViews.Command.SetOnClickPendingIntent;
                        public toString(): string;
                        public component1(): globalAndroid.app.PendingIntent;
                    }
                    export class SetShort extends org.nativescript.widgets.RemoteViews.Command {
                        public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.Command.SetShort>;
                        public component2(): number;
                        public equals(other: any): boolean;
                        public applyTo(rv: globalAndroid.widget.RemoteViews, targetId: number): void;
                        public component1(): string;
                        public copy(method: string, value: number): org.nativescript.widgets.RemoteViews.Command.SetShort;
                        public hashCode(): number;
                        public getMethod(): string;
                        public constructor(method: string, value: number);
                        public toString(): string;
                        public getValue(): number;
                    }
                    export class SetSize extends org.nativescript.widgets.RemoteViews.Command {
                        public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.Command.SetSize>;
                        public getWidthUnit(): number;
                        public equals(other: any): boolean;
                        public getHeightUnit(): number;
                        public applyTo(rv: globalAndroid.widget.RemoteViews, targetId: number): void;
                        public hashCode(): number;
                        public copy(width: number, widthUnit: number, height: number, heightUnit: number): org.nativescript.widgets.RemoteViews.Command.SetSize;
                        public getHeight(): number;
                        public component4(): number;
                        public toString(): string;
                        public component2(): number;
                        public constructor(width: number, widthUnit: number, height: number, heightUnit: number);
                        public getWidth(): number;
                        public component1(): number;
                        public component3(): number;
                    }
                    export class SetSizeDimen extends org.nativescript.widgets.RemoteViews.Command {
                        public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.Command.SetSizeDimen>;
                        public component3(): string;
                        public equals(other: any): boolean;
                        public component5(): string;
                        public applyTo(rv: globalAndroid.widget.RemoteViews, targetId: number): void;
                        public hashCode(): number;
                        public copy(width: number, widthResource: string, widthPackageName: string, height: number, heightResource: string, heightPackageName: string): org.nativescript.widgets.RemoteViews.Command.SetSizeDimen;
                        public getHeight(): number;
                        public applyToWithContext(heightRes: globalAndroid.widget.RemoteViews, this_: number, rv: globalAndroid.content.Context): void;
                        public getWidthResource(): string;
                        public component4(): number;
                        public toString(): string;
                        public getHeightResource(): string;
                        public constructor(width: number, widthResource: string, widthPackageName: string, height: number, heightResource: string, heightPackageName: string);
                        public getWidth(): number;
                        public component2(): string;
                        public getWidthPackageName(): string;
                        public component6(): string;
                        public getHeightPackageName(): string;
                        public component1(): number;
                    }
                    export class SetString extends org.nativescript.widgets.RemoteViews.Command {
                        public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.Command.SetString>;
                        public equals(other: any): boolean;
                        public constructor(method: string, value: string);
                        public component2(): string;
                        public applyTo(rv: globalAndroid.widget.RemoteViews, targetId: number): void;
                        public component1(): string;
                        public hashCode(): number;
                        public getMethod(): string;
                        public copy(method: string, value: string): org.nativescript.widgets.RemoteViews.Command.SetString;
                        public getValue(): string;
                        public toString(): string;
                    }
                    export class SetText extends org.nativescript.widgets.RemoteViews.Command {
                        public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.Command.SetText>;
                        public equals(other: any): boolean;
                        public copy(value: string): org.nativescript.widgets.RemoteViews.Command.SetText;
                        public applyTo(rv: globalAndroid.widget.RemoteViews, targetId: number): void;
                        public component1(): string;
                        public hashCode(): number;
                        public constructor(value: string);
                        public getValue(): string;
                        public toString(): string;
                    }
                    export class SetTextColor extends org.nativescript.widgets.RemoteViews.Command {
                        public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.Command.SetTextColor>;
                        public copy(value: number): org.nativescript.widgets.RemoteViews.Command.SetTextColor;
                        public equals(other: any): boolean;
                        public applyTo(rv: globalAndroid.widget.RemoteViews, targetId: number): void;
                        public hashCode(): number;
                        public constructor(value: number);
                        public component1(): number;
                        public toString(): string;
                        public getValue(): number;
                    }
                    export class SetVisibility extends org.nativescript.widgets.RemoteViews.Command {
                        public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.Command.SetVisibility>;
                        public equals(other: any): boolean;
                        public getVisibility(): number;
                        public applyTo(rv: globalAndroid.widget.RemoteViews, targetId: number): void;
                        public hashCode(): number;
                        public constructor(visibility: number);
                        public component1(): number;
                        public copy(visibility: number): org.nativescript.widgets.RemoteViews.Command.SetVisibility;
                        public toString(): string;
                    }
                    export class SetWidth extends org.nativescript.widgets.RemoteViews.Command {
                        public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.Command.SetWidth>;
                        public constructor(value: number, unit: number);
                        public component2(): number;
                        public equals(other: any): boolean;
                        public applyTo(rv: globalAndroid.widget.RemoteViews, targetId: number): void;
                        public getUnit(): number;
                        public copy(value: number, unit: number): org.nativescript.widgets.RemoteViews.Command.SetWidth;
                        public hashCode(): number;
                        public component1(): number;
                        public toString(): string;
                        public getValue(): number;
                    }
                    export class SetWidthDimen extends org.nativescript.widgets.RemoteViews.Command {
                        public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.Command.SetWidthDimen>;
                        public component3(): string;
                        public equals(other: any): boolean;
                        public applyTo(rv: globalAndroid.widget.RemoteViews, targetId: number): void;
                        public hashCode(): number;
                        public copy(value: number, resource: string, packageName: string): org.nativescript.widgets.RemoteViews.Command.SetWidthDimen;
                        public toString(): string;
                        public constructor(value: number, resource: string, packageName: string);
                        public getPackageName(): string;
                        public component2(): string;
                        public applyToWithContext(this_: globalAndroid.widget.RemoteViews, rv: number, targetId: globalAndroid.content.Context): void;
                        public component1(): number;
                        public getResource(): string;
                        public getValue(): number;
                    }
                }
                export class Companion {
                    public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.Companion>;
                    public generateId(): string;
                }
                export class FrameLayout extends org.nativescript.widgets.RemoteViews implements org.nativescript.widgets.RemoteViews.ViewGroupLike {
                    public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.FrameLayout>;
                    public addView(this_: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public addView(child: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public removeView(child: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public constructor();
                    public constructor(layout: org.nativescript.widgets.RemoteViews.Layout, id: string);
                    public removeView(it: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public constructor(id: string);
                }
                export class GridLayout extends org.nativescript.widgets.RemoteViews implements org.nativescript.widgets.RemoteViews.ViewGroupLike {
                    public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.GridLayout>;
                    public addView(this_: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public addView(child: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public removeView(child: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public constructor();
                    public constructor(layout: org.nativescript.widgets.RemoteViews.Layout, id: string);
                    public removeView(it: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public constructor(id: string);
                }
                export class GridView extends org.nativescript.widgets.RemoteViews implements org.nativescript.widgets.RemoteViews.ViewGroupLike {
                    public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.GridView>;
                    public addView(this_: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public addView(child: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public removeView(child: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public constructor();
                    public constructor(layout: org.nativescript.widgets.RemoteViews.Layout, id: string);
                    public removeView(it: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public constructor(id: string);
                }
                export class ImageButton extends org.nativescript.widgets.RemoteViews implements org.nativescript.widgets.RemoteViews.ImageLike {
                    public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.ImageButton>;
                    public getCommands(): java.util.Map<string,org.nativescript.widgets.RemoteViews.Command>;
                    public constructor();
                    public constructor(layout: org.nativescript.widgets.RemoteViews.Layout, id: string);
                    public setImageUrl(url: string): org.nativescript.widgets.RemoteViews.ImageLike;
                    public setImageResource(value: number): org.nativescript.widgets.RemoteViews.ImageLike;
                    public constructor(id: string);
                    public setImageURI(value: globalAndroid.net.Uri): org.nativescript.widgets.RemoteViews.ImageLike;
                    public setImageBitmap(value: globalAndroid.graphics.Bitmap): org.nativescript.widgets.RemoteViews.ImageLike;
                }
                export class ImageLike {
                    public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.ImageLike>;
                    /**
                     * Constructs a new instance of the org.nativescript.widgets.RemoteViews$ImageLike interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
                     */
                    public constructor(implementation: {
                        getCommands(): java.util.Map<string,org.nativescript.widgets.RemoteViews.Command>;
                        setImageResource(value: number): org.nativescript.widgets.RemoteViews.ImageLike;
                        setImageURI(value: globalAndroid.net.Uri): org.nativescript.widgets.RemoteViews.ImageLike;
                        setImageBitmap(value: globalAndroid.graphics.Bitmap): org.nativescript.widgets.RemoteViews.ImageLike;
                        setImageUrl(url: string): org.nativescript.widgets.RemoteViews.ImageLike;
                        access$setImageResource$jd($this: org.nativescript.widgets.RemoteViews.ImageLike, value: number): org.nativescript.widgets.RemoteViews.ImageLike;
                        access$setImageURI$jd($this: org.nativescript.widgets.RemoteViews.ImageLike, value: globalAndroid.net.Uri): org.nativescript.widgets.RemoteViews.ImageLike;
                        access$setImageBitmap$jd($this: org.nativescript.widgets.RemoteViews.ImageLike, value: globalAndroid.graphics.Bitmap): org.nativescript.widgets.RemoteViews.ImageLike;
                        access$setImageUrl$jd($this: org.nativescript.widgets.RemoteViews.ImageLike, url: string): org.nativescript.widgets.RemoteViews.ImageLike;
                    });
                    public constructor();
                    public getCommands(): java.util.Map<string,org.nativescript.widgets.RemoteViews.Command>;
                    public setImageUrl(url: string): org.nativescript.widgets.RemoteViews.ImageLike;
                    public setImageResource(value: number): org.nativescript.widgets.RemoteViews.ImageLike;
                    public setImageURI(value: globalAndroid.net.Uri): org.nativescript.widgets.RemoteViews.ImageLike;
                    public setImageBitmap(value: globalAndroid.graphics.Bitmap): org.nativescript.widgets.RemoteViews.ImageLike;
                }
                export module ImageLike {
                    export class DefaultImpls {
                        public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.ImageLike.DefaultImpls>;
                        /** @deprecated */
                        public static setImageBitmap($this: org.nativescript.widgets.RemoteViews.ImageLike, value: globalAndroid.graphics.Bitmap): org.nativescript.widgets.RemoteViews.ImageLike;
                        /** @deprecated */
                        public static setImageUrl($this: org.nativescript.widgets.RemoteViews.ImageLike, url: string): org.nativescript.widgets.RemoteViews.ImageLike;
                        /** @deprecated */
                        public static setImageResource($this: org.nativescript.widgets.RemoteViews.ImageLike, value: number): org.nativescript.widgets.RemoteViews.ImageLike;
                        /** @deprecated */
                        public static setImageURI($this: org.nativescript.widgets.RemoteViews.ImageLike, value: globalAndroid.net.Uri): org.nativescript.widgets.RemoteViews.ImageLike;
                    }
                }
                export class ImageView extends org.nativescript.widgets.RemoteViews implements org.nativescript.widgets.RemoteViews.ImageLike {
                    public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.ImageView>;
                    public getCommands(): java.util.Map<string,org.nativescript.widgets.RemoteViews.Command>;
                    public constructor();
                    public constructor(layout: org.nativescript.widgets.RemoteViews.Layout, id: string);
                    public setImageUrl(url: string): org.nativescript.widgets.RemoteViews.ImageLike;
                    public setImageResource(value: number): org.nativescript.widgets.RemoteViews.ImageLike;
                    public constructor(id: string);
                    public setImageURI(value: globalAndroid.net.Uri): org.nativescript.widgets.RemoteViews.ImageLike;
                    public setImageBitmap(value: globalAndroid.graphics.Bitmap): org.nativescript.widgets.RemoteViews.ImageLike;
                }
                export class Layout {
                    public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.Layout>;
                    public static AdapterViewFlipper: org.nativescript.widgets.RemoteViews.Layout;
                    public static Button: org.nativescript.widgets.RemoteViews.Layout;
                    public static Chronometer: org.nativescript.widgets.RemoteViews.Layout;
                    public static FrameLayout: org.nativescript.widgets.RemoteViews.Layout;
                    public static GridLayout: org.nativescript.widgets.RemoteViews.Layout;
                    public static GridView: org.nativescript.widgets.RemoteViews.Layout;
                    public static ImageButton: org.nativescript.widgets.RemoteViews.Layout;
                    public static ImageView: org.nativescript.widgets.RemoteViews.Layout;
                    public static LinearLayout: org.nativescript.widgets.RemoteViews.Layout;
                    public static ListView: org.nativescript.widgets.RemoteViews.Layout;
                    public static ProgressBar: org.nativescript.widgets.RemoteViews.Layout;
                    public static RelativeLayout: org.nativescript.widgets.RemoteViews.Layout;
                    public static StackView: org.nativescript.widgets.RemoteViews.Layout;
                    public static TextView: org.nativescript.widgets.RemoteViews.Layout;
                    public static ViewFlipper: org.nativescript.widgets.RemoteViews.Layout;
                    public static TextClock: org.nativescript.widgets.RemoteViews.Layout;
                    public static getEntries(): any;
                    public static valueOf(value: string): org.nativescript.widgets.RemoteViews.Layout;
                    public static values(): androidNative.Array<org.nativescript.widgets.RemoteViews.Layout>;
                }
                export class LinearLayout extends org.nativescript.widgets.RemoteViews implements org.nativescript.widgets.RemoteViews.ViewGroupLike {
                    public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.LinearLayout>;
                    public addView(this_: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public addView(child: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public removeView(child: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public constructor();
                    public constructor(layout: org.nativescript.widgets.RemoteViews.Layout, id: string);
                    public removeView(it: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public constructor(id: string);
                }
                export class ListView extends org.nativescript.widgets.RemoteViews {
                    public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.ListView>;
                    public constructor();
                    public constructor(layout: org.nativescript.widgets.RemoteViews.Layout, id: string);
                    public constructor(id: string);
                }
                export class ProgressBar extends org.nativescript.widgets.RemoteViews {
                    public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.ProgressBar>;
                    public constructor();
                    public constructor(layout: org.nativescript.widgets.RemoteViews.Layout, id: string);
                    public constructor(id: string);
                }
                export class RelativeLayout extends org.nativescript.widgets.RemoteViews implements org.nativescript.widgets.RemoteViews.ViewGroupLike {
                    public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.RelativeLayout>;
                    public addView(this_: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public addView(child: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public removeView(child: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public constructor();
                    public constructor(layout: org.nativescript.widgets.RemoteViews.Layout, id: string);
                    public removeView(it: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public constructor(id: string);
                }
                export class StackView extends org.nativescript.widgets.RemoteViews implements org.nativescript.widgets.RemoteViews.ViewGroupLike {
                    public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.StackView>;
                    public addView(this_: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public addView(child: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public removeView(child: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public constructor();
                    public constructor(layout: org.nativescript.widgets.RemoteViews.Layout, id: string);
                    public removeView(it: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public constructor(id: string);
                }
                export class TextClock extends org.nativescript.widgets.RemoteViews implements org.nativescript.widgets.RemoteViews.TextLike {
                    public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.TextClock>;
                    public getCommands(): java.util.Map<string,org.nativescript.widgets.RemoteViews.Command>;
                    public constructor();
                    public setText(value: string): org.nativescript.widgets.RemoteViews.TextLike;
                    public constructor(layout: org.nativescript.widgets.RemoteViews.Layout, id: string);
                    public constructor(id: string);
                    public setTextColor(value: number): org.nativescript.widgets.RemoteViews.TextLike;
                }
                export class TextLike {
                    public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.TextLike>;
                    /**
                     * Constructs a new instance of the org.nativescript.widgets.RemoteViews$TextLike interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
                     */
                    public constructor(implementation: {
                        getCommands(): java.util.Map<string,org.nativescript.widgets.RemoteViews.Command>;
                        setText(value: string): org.nativescript.widgets.RemoteViews.TextLike;
                        setTextColor(value: number): org.nativescript.widgets.RemoteViews.TextLike;
                        access$setText$jd($this: org.nativescript.widgets.RemoteViews.TextLike, value: string): org.nativescript.widgets.RemoteViews.TextLike;
                        access$setTextColor$jd($this: org.nativescript.widgets.RemoteViews.TextLike, value: number): org.nativescript.widgets.RemoteViews.TextLike;
                    });
                    public constructor();
                    public getCommands(): java.util.Map<string,org.nativescript.widgets.RemoteViews.Command>;
                    public setText(value: string): org.nativescript.widgets.RemoteViews.TextLike;
                    public setTextColor(value: number): org.nativescript.widgets.RemoteViews.TextLike;
                }
                export module TextLike {
                    export class DefaultImpls {
                        public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.TextLike.DefaultImpls>;
                        /** @deprecated */
                        public static setText($this: org.nativescript.widgets.RemoteViews.TextLike, value: string): org.nativescript.widgets.RemoteViews.TextLike;
                        /** @deprecated */
                        public static setTextColor($this: org.nativescript.widgets.RemoteViews.TextLike, value: number): org.nativescript.widgets.RemoteViews.TextLike;
                    }
                }
                export class TextView extends org.nativescript.widgets.RemoteViews implements org.nativescript.widgets.RemoteViews.TextLike {
                    public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.TextView>;
                    public getCommands(): java.util.Map<string,org.nativescript.widgets.RemoteViews.Command>;
                    public constructor();
                    public setText(value: string): org.nativescript.widgets.RemoteViews.TextLike;
                    public constructor(layout: org.nativescript.widgets.RemoteViews.Layout, id: string);
                    public constructor(id: string);
                    public setTextColor(value: number): org.nativescript.widgets.RemoteViews.TextLike;
                }
                export class ViewFlipper extends org.nativescript.widgets.RemoteViews implements org.nativescript.widgets.RemoteViews.ViewGroupLike {
                    public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.ViewFlipper>;
                    public addView(this_: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public addView(child: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public removeView(child: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public constructor();
                    public constructor(layout: org.nativescript.widgets.RemoteViews.Layout, id: string);
                    public removeView(it: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public constructor(id: string);
                }
                export class ViewGroupLike {
                    public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.ViewGroupLike>;
                    /**
                     * Constructs a new instance of the org.nativescript.widgets.RemoteViews$ViewGroupLike interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
                     */
                    public constructor(implementation: {
                        addView(this_: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                        removeView(it: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                        access$addView$jd($this: org.nativescript.widgets.RemoteViews.ViewGroupLike, child: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                        access$removeView$jd($this: org.nativescript.widgets.RemoteViews.ViewGroupLike, child: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    });
                    public constructor();
                    public addView(this_: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    public removeView(it: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                }
                export module ViewGroupLike {
                    export class DefaultImpls {
                        public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.ViewGroupLike.DefaultImpls>;
                        /** @deprecated */
                        public static addView($this: org.nativescript.widgets.RemoteViews.ViewGroupLike, child: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                        /** @deprecated */
                        public static removeView($this: org.nativescript.widgets.RemoteViews.ViewGroupLike, child: org.nativescript.widgets.RemoteViews): org.nativescript.widgets.RemoteViews.ViewGroupLike;
                    }
                }
                export class WhenMappings {
                    public static class: java.lang.Class<org.nativescript.widgets.RemoteViews.WhenMappings>;
                }
            }
        }
    }
}

declare module org {
    export module nativescript {
        export module widgets {
            export class RemoteViewsManager {
                public static class: java.lang.Class<org.nativescript.widgets.RemoteViewsManager>;
                public reparent(oldParentId: string, newParentId: string): void;
                public build(it: string): globalAndroid.widget.RemoteViews;
                public build(this_: string, rootId: string): globalAndroid.widget.RemoteViews;
                public findViewById(found: string, childId: string): org.nativescript.widgets.RemoteViews;
                public resolveRemoteResources(): void;
                public remove(parentId: string): void;
                public add(it: org.nativescript.widgets.RemoteViews, id: string): void;
                public getById(id: string): org.nativescript.widgets.RemoteViews;
                public getChildren(it: string): java.util.List<org.nativescript.widgets.RemoteViews>;
                public constructor();
                public getParent(it: string): org.nativescript.widgets.RemoteViews;
            }
        }
    }
}