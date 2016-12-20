import { LayoutBase, View, Observable, HorizontalAlignment, VerticalAlignment, Visibility} from "ui/layouts/layout-base";

export class ViewModel extends Observable {

    // View properties
    public onWidthHeight(args: { eventName: string, object: any }): void {
        var view: View = <View>args.object;
        if (view.width !== 30) {
            view.width = 30;
            view.height = 50;
        } else {
            view.width = Number.NaN;
            view.height = Number.NaN;
        }
    }

    public onMinWidthMinHeight(args: { eventName: string, object: any }): void {
        var view: View = <View>args.object;
        if (view.minWidth !== 105) {
            view.minWidth = 105;
            view.minHeight = 55;
        } else {
            view.minWidth = 0;
            view.minHeight = 0;
        }
    }

    public onMargins(args: { eventName: string, object: any }): void {
        var view: View = <View>args.object;
        if (view.marginLeft !== 5) {
            view.marginLeft = 5;
            view.marginTop = 5;
            view.marginRight = 5;
            view.marginBottom = 5;
        } else {
            view.marginLeft = 0;
            view.marginTop = 0;
            view.marginRight = 0;
            view.marginBottom = 0;
        }
    }

    public onAlignments(args: { eventName: string, object: any }): void {
        var view: View = <View>args.object;
        if (view.horizontalAlignment === HorizontalAlignment.STRETCH) {
            view.horizontalAlignment = HorizontalAlignment.LEFT;
            view.verticalAlignment = VerticalAlignment.TOP;
        } else if (view.horizontalAlignment === HorizontalAlignment.LEFT) {
            view.horizontalAlignment = HorizontalAlignment.CENTER;
            view.verticalAlignment = VerticalAlignment.MIDDLE;
        } else if (view.horizontalAlignment === HorizontalAlignment.CENTER) {
            view.horizontalAlignment = HorizontalAlignment.RIGHT;
            view.verticalAlignment = VerticalAlignment.BOTTOM;
        } else {
            view.horizontalAlignment = HorizontalAlignment.STRETCH;
            view.verticalAlignment = VerticalAlignment.STRETCH;
        }
    }

    public onCollapse(args: { eventName: string, object: any }): void {
        var view: View = <View>args.object;
        view.visibility = Visibility.COLLAPSE;
    }

    public onVisibile(args: { eventName: string, object: any }): void {
        var view: View = <View>args.object;
        var layout = <LayoutBase>view.parent;

        var child = <View>layout.getViewById("collapse");
        child.visibility = Visibility.VISIBLE;
    }

    // Layout properties
    public onPaddings(args: { eventName: string, object: any }): void {
        var layout = args.object.parent;
        if (layout.paddingLeft !== 5) {
            layout.paddingLeft = 5;
            layout.paddingTop = 5;
            layout.paddingRight = 5;
            layout.paddingBottom = 5;
        } else {
            layout.paddingLeft = 0;
            layout.paddingTop = 0;
            layout.paddingRight = 0;
            layout.paddingBottom = 0;
        }
    }

    public onAllProperties(args: { eventName: string, object: any }): void {
        var child;
        var layout = args.object.parent;

        // WidthHeight
        child = layout.getViewById("widthHeight");
        if (child.width !== 30) {
            child.width = 30;
            child.height = 50;
        } else {
            child.width = Number.NaN;
            child.height = Number.NaN;
        }

        // MinWidthMinHeight
        child = layout.getViewById("minWidthMinHeight");
        if (child.minWidth !== 105) {
            child.minWidth = 105;
            child.minHeight = 55;
        } else {
            child.minWidth = 0;
            child.minHeight = 0;
        }

        // Margins
        child = layout.getViewById("margins");
        if (child.marginLeft !== 5) {
            child.marginLeft = 5;
            child.marginTop = 5;
            child.marginRight = 5;
            child.marginBottom = 5;
        } else {
            child.marginLeft = 0;
            child.marginTop = 0;
            child.marginRight = 0;
            child.marginBottom = 0;
        }

        // Alignments
        child = layout.getViewById("alignments");
        if (child.horizontalAlignment === HorizontalAlignment.STRETCH) {
            child.horizontalAlignment = HorizontalAlignment.LEFT;
            child.verticalAlignment = VerticalAlignment.TOP;
        } else if (child.horizontalAlignment === HorizontalAlignment.LEFT) {
            child.horizontalAlignment = HorizontalAlignment.CENTER;
            child.verticalAlignment = VerticalAlignment.MIDDLE;
        } else if (child.horizontalAlignment === HorizontalAlignment.CENTER) {
            child.horizontalAlignment = HorizontalAlignment.RIGHT;
            child.verticalAlignment = VerticalAlignment.BOTTOM;
        } else {
            child.horizontalAlignment = HorizontalAlignment.STRETCH;
            child.verticalAlignment = VerticalAlignment.MIDDLE;
        }

        // Collapse
        child = layout.getViewById("collapse");
        if (child.visibility === Visibility.VISIBLE) {
            child.visibility = Visibility.COLLAPSE;
        } else {
            child.visibility = Visibility.VISIBLE;
        }

        // Paddings
        if (layout.paddingLeft !== 5) {
            layout.paddingLeft = 5;
            layout.paddingTop = 5;
            layout.paddingRight = 5;
            layout.paddingBottom = 5;
        } else {
            layout.paddingLeft = 0;
            layout.paddingTop = 0;
            layout.paddingRight = 0;
            layout.paddingBottom = 0;
        }
    }
}