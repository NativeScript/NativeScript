import {
    SwitchBase, layout, Color, colorProperty, backgroundColorProperty, backgroundInternalProperty, checkedProperty
} from "./switch-common";

export * from "./switch-common";

class SwitchChangeHandlerImpl extends NSObject {

    private _owner: WeakRef<Switch>;

    public static initWithOwner(owner: WeakRef<Switch>): SwitchChangeHandlerImpl {
        let handler = <SwitchChangeHandlerImpl>SwitchChangeHandlerImpl.new();
        handler._owner = owner;
        return handler;
    }

    public valueChanged(sender: UISwitch) {
        let owner = this._owner.get();
        if (owner) {
            checkedProperty.nativeValueChange(owner, sender.on);
        }
    }

    public static ObjCExposedMethods = {
        'valueChanged': { returns: interop.types.void, params: [UISwitch] }
    };
}

const zeroSize = { width: 0, height: 0 };
export class Switch extends SwitchBase {
    private _ios: UISwitch;
    private _handler: NSObject;

    constructor() {
        super();
        this._ios = UISwitch.new();

        this._handler = SwitchChangeHandlerImpl.initWithOwner(new WeakRef(this));
        this._ios.addTargetActionForControlEvents(this._handler, "valueChanged", UIControlEvents.ValueChanged);
    }

    get ios(): UISwitch {
        return this._ios;
    }

    get _nativeView(): UISwitch {
        return this._ios;
    }

    get nativeView(): UISwitch {
        return this._ios;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        // It can't be anything different from 51x31
        let nativeSize = this._nativeView.sizeThatFits(zeroSize);
        this.width = nativeSize.width;
        this.height = nativeSize.height;

        const widthAndState = Switch.resolveSizeAndState(layout.toDevicePixels(nativeSize.width), layout.toDevicePixels(51), layout.EXACTLY, 0);
        const heightAndState = Switch.resolveSizeAndState(layout.toDevicePixels(nativeSize.height), layout.toDevicePixels(31), layout.EXACTLY, 0);
        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    get [checkedProperty.native](): boolean {
        return false;
    }
    set [checkedProperty.native](value: boolean) {
        this._ios.on = value;
    }

    get [colorProperty.native](): UIColor {
        return this._ios.thumbTintColor;
    }
    set [colorProperty.native](value: UIColor | Color) {
        this._ios.thumbTintColor = value instanceof Color ? value.ios : value;
    }

    get [backgroundColorProperty.native](): UIColor {
        return this._ios.onTintColor;
    }
    set [backgroundColorProperty.native](value: UIColor | Color) {
        this._ios.onTintColor = value instanceof Color ? value.ios : value;
    }

    get [backgroundInternalProperty.native](): any {
        return null;
    }
    set [backgroundInternalProperty.native](value: any) {
        //
    }
}