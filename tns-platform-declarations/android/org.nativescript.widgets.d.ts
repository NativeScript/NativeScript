declare module org {
    module nativescript {
        module widgets {
            export module Async {
                export class CompleteCallback {
                    constructor(implementation: ICompleteCallback);
                    onComplete(result: Object, context: Object): void;
                }

                export interface ICompleteCallback {
                    onComplete(result: Object, context: Object): void;
                }

                export module Image {
                    export function download(url: string, callback: CompleteCallback, context: any);
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

            export class BorderDrawable extends android.graphics.drawable.ColorDrawable {
                constructor(density: number);
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
                    backgroundImage: android.graphics.Bitmap,
                    backgroundRepeat: string,
                    backgroundPosition: string,
                    backgroundPositionParsedCSSValues: native.Array<CSSValue>,
                    backgroundSize: string,
                    backgroundSizeParsedCSSValues: native.Array<CSSValue>
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
                public getBackgroundImage(): android.graphics.Bitmap;
                public getBackgroundRepeat(): string;
                public getBackgroundPosition(): string;
                public getBackgroundSize(): string;

                public hasUniformBorderColor(): boolean;
                public hasUniformBorderWidth(): boolean;
                public hasUniformBorderRadius(): boolean;
                public hasUniformBorder(): boolean;
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
            }

            export class HorizontalScrollView extends android.widget.HorizontalScrollView {
                constructor(context: android.content.Context);
                public getScrollableLength(): number;
            }

            export class ImageView extends android.widget.ImageView {
                constructor(context: android.content.Context);
                getCornerRadius(): number;
                setCornerRadius(radius: number): void;

                getBorderWidth(): number;
                setBorderWidth(width: number): void;

                getRotationAngle(): number;
                setRotationAngle(angle: number): void;
            }

            export class TabLayout extends android.widget.HorizontalScrollView {
                constructor(context: android.content.Context);
                constructor(context: android.content.Context, attrs: android.util.IAttributeSet);
                constructor(context: android.content.Context, attrs: android.util.IAttributeSet, defStyle: number);

                setSelectedIndicatorColors(color: Array<number>): void;

                setItems(items: Array<TabItemSpec>, viewPager: android.support.v4.view.ViewPager): void;
                updateItemAt(position: number, itemSpec: TabItemSpec): void;

                getTextViewForItemAt(index: number): android.widget.TextView;
                getViewForItemAt(index: number): android.widget.LinearLayout;
            }

            export class TabItemSpec {
                title: string;
                iconId: number;
                iconDrawable: android.graphics.drawable.Drawable;
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
                    constructor(context: android.content.Context);
                    public addImageCache(cache: Cache): void;
                    public initCache(): void;
                    public clearCache(): void;
                    public loadImage(data: Object, imageView: ImageView, 
                        decodeWidth: number, decodeHeight: number, useCache: boolean, async: boolean,
                        listener: Worker.IOnImageLoadedListener): void;
                }

                export namespace Cache {
                    export class CacheParams {
                        constructor(context: android.content.Context, diskCacheDirectoryName: string);
                        public setMemCacheSizePercent(percent: number): void;
                        public diskCacheEnabled: boolean;
                        public diskCacheSize: number;
                    }
                }
            }
        }
    }
}
