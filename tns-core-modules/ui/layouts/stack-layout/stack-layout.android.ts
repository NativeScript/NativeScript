import common = require("./stack-layout-common");
import {Orientation} from "ui/enums";
import {PropertyMetadata} from "ui/core/proxy";
import {PropertyChangeData} from "ui/core/dependency-observable";

global.moduleMerge(common, exports);

function setNativeOrientationProperty(data: PropertyChangeData): void {
    var stackLayout = <StackLayout>data.object;
    var nativeView = stackLayout._nativeView;
    nativeView.setOrientation(data.newValue === Orientation.vertical ? org.nativescript.widgets.Orientation.vertical : org.nativescript.widgets.Orientation.horizontal);
}

(<PropertyMetadata>common.StackLayout.orientationProperty.metadata).onSetNativeValue = setNativeOrientationProperty;

export class StackLayout extends common.StackLayout {
    private _layout: org.nativescript.widgets.StackLayout;

    get android(): org.nativescript.widgets.StackLayout {
        return this._layout;
    }

    get _nativeView(): org.nativescript.widgets.StackLayout {
        return this._layout;
    }

    public _createUI() {
        this._layout = new org.nativescript.widgets.StackLayout(this._context);
    }
}