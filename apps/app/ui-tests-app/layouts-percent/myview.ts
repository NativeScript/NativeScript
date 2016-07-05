import observable = require("data/observable");
import enums = require("ui/enums");
import view = require("ui/core/view");
import layouts = require("ui/layouts/layout-base");

export class ViewModel extends observable.Observable {

    // View properties
    public onWidthHeight(args: { eventName: string, object: any }): void {
        var view: view.View = <view.View>args.object;
        if ((<any>view).width !== "50%") {
            (<any>view).width = "50%";
            (<any>view).height = "50%";
        } else {
            (<any>view).width = "75%";
            (<any>view).height = "75%";
        }
    }

    public onMinWidthMinHeight(args: { eventName: string, object: any }): void {
        var view: view.View = <view.View>args.object;
        if (view.minWidth !== 105) {
            view.minWidth = 105;
            view.minHeight = 55;
        } else {
            view.minWidth = 0;
            view.minHeight = 0;
        }
    }

    public onMargins(args: { eventName: string, object: any }): void {
        var view: view.View = <view.View>args.object;
        if ((<any>view).marginLeft !== "10%") {
            (<any>view).marginLeft = "10%";
            (<any>view).marginTop = "10%";
            (<any>view).marginRight = "10%";
            (<any>view).marginBottom = "10%";
        } else {
            view.marginLeft = 0;
            view.marginTop = 0;
            view.marginRight = 0;
            view.marginBottom = 0;
        }
    }

    public onAlignments(args: { eventName: string, object: any }): void {
        var view: view.View = <view.View>args.object;
        if (view.horizontalAlignment === enums.HorizontalAlignment.stretch) {
            view.horizontalAlignment = enums.HorizontalAlignment.left;
            view.verticalAlignment = enums.VerticalAlignment.top;
        } else if (view.horizontalAlignment === enums.HorizontalAlignment.left) {
            view.horizontalAlignment = enums.HorizontalAlignment.center;
            view.verticalAlignment = enums.VerticalAlignment.center;
        } else if (view.horizontalAlignment === enums.HorizontalAlignment.center) {
            view.horizontalAlignment = enums.HorizontalAlignment.right;
            view.verticalAlignment = enums.VerticalAlignment.bottom;
        } else {
            view.horizontalAlignment = enums.HorizontalAlignment.stretch;
            view.verticalAlignment = enums.VerticalAlignment.stretch;
        }
    }

    public onCollapse(args: { eventName: string, object: any }): void {
        var view: view.View = <view.View>args.object;
        view.visibility = enums.Visibility.collapse;
    }

    public onVisibile(args: { eventName: string, object: any }): void {
        var view: view.View = <view.View>args.object;
        var layout = <layouts.LayoutBase>view.parent;

        var child = layout.getViewById("collapse");
        child.visibility = enums.Visibility.visible;
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
        if ((<any>child).width !== "50%") {
            (<any>child).width = "50%";
            (<any>child).height = "50%";
        } else {
            (<any>child).width = "75%";
            (<any>child).height = "75%";
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
        if ((<any>child).marginLeft !== "10%") {
            (<any>child).marginLeft = "10%";
            (<any>child).marginTop = "10%";
            (<any>child).marginRight = "10%";
            (<any>child).marginBottom = "10%";
        } else {
            child.marginLeft = 0;
            child.marginTop = 0;
            child.marginRight = 0;
            child.marginBottom = 0;
        }

        // Alignments
        child = layout.getViewById("alignments");
        if (child.horizontalAlignment === enums.HorizontalAlignment.stretch) {
            child.horizontalAlignment = enums.HorizontalAlignment.left;
            child.verticalAlignment = enums.VerticalAlignment.top;
        } else if (child.horizontalAlignment === enums.HorizontalAlignment.left) {
            child.horizontalAlignment = enums.HorizontalAlignment.center;
            child.verticalAlignment = enums.VerticalAlignment.center;
        } else if (child.horizontalAlignment === enums.HorizontalAlignment.center) {
            child.horizontalAlignment = enums.HorizontalAlignment.right;
            child.verticalAlignment = enums.VerticalAlignment.bottom;
        } else {
            child.horizontalAlignment = enums.HorizontalAlignment.stretch;
            child.verticalAlignment = enums.VerticalAlignment.stretch;
        }

        // Collapse
        child = layout.getViewById("collapse");
        if (child.visibility === enums.Visibility.visible) {
            child.visibility = enums.Visibility.collapse;
        } else {
            child.visibility = enums.Visibility.visible;
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