declare module org {
    module nativescript {
        module widgets {
            export class CommonLayoutParams extends android.widget.FrameLayout.LayoutParams {
                constructor();

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
                horzontal,
                vertical
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
        }
    }
}