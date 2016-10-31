declare module org {
    module nativescript {
        module widgets {
            export class BorderDrawable extends android.graphics.drawable.ColorDrawable {
                constructor(density: number);
                public refresh(
                    borderWidth: number,
                    borderColor: number,
                    borderRadius: number,
                    clipPath: string,
                    backgroundColor: number,
                    backgroundImage: android.graphics.Bitmap,
                    backgroundRepeat: string,
                    backgroundPosition: string,
                    backgroundPositionParsedCSSValues: native.Array<CSSValue>,
                    backgroundSize: string,
                    backgroundSizeParsedCSSValues: native.Array<CSSValue>
                );
                public getBorderWidth(): number;
                public getBorderColor(): number;
                public getBorderRadius(): number;
                public getClipPath(): string;
                public getBackgroundColor(): number;
                public getBackgroundImage(): android.graphics.Bitmap;
                public getBackgroundRepeat(): string;
                public getBackgroundPosition(): string;
                public getBackgroundSize(): string;
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
            }

            export enum Stretch {
                none,
                aspectFill,
                aspectFit,
                fill
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

            export class ViewHelper {
                public static getMinWidth(view: android.view.View): number;
                public static setMinWidth(view: android.view.View, value: number): void;

                public static getMinHeight(view: android.view.View): number;
                public static setMinHeight(view: android.view.View, value: number): void;

                public static getWidth(view: android.view.View): number;
                public static setWidth(view: android.view.View, value: number): void;

                public static getHeight(view: android.view.View): number;
                public static setHeight(view: android.view.View, value: number): void;

                public static getMargin(view: android.view.View): { left: number, top: number, right: number, bottom: number };
                public static setMargin(view: android.view.View, left: number, top: number, right: number, bottom: number): void;

                public static getMarginLeft(view: android.view.View): number;
                public static setMarginLeft(view: android.view.View, value: number): void;

                public static getMarginTop(view: android.view.View): number;
                public static setMarginTop(view: android.view.View, value: number): void;

                public static getMarginRight(view: android.view.View): number;
                public static setMarginRight(view: android.view.View, value: number): void;

                public static getMarginBottom(view: android.view.View): number;
                public static setMarginBottom(view: android.view.View, value: number): void;

                public static getHorizontalAlighment(view: android.view.View): string;
                public static setHorizontalAlighment(view: android.view.View, value: string): void;

                public static getVerticalAlignment(view: android.view.View): string;
                public static setVerticalAlignment(view: android.view.View, value: string): void;

                public static getPadding(view: android.view.View): { left: number, top: number, right: number, bottom: number };
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
                
            }
        }
    }
}

declare class TNSLabel extends UILabel {
    borderThickness: UIEdgeInsets;
    padding: UIEdgeInsets;
}