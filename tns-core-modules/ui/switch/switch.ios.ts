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
    nativeView: UISwitch;
    private _handler: NSObject;

    constructor() {
        super();
        const nativeView = UISwitch.new();
        this._handler = SwitchChangeHandlerImpl.initWithOwner(new WeakRef(this));
        nativeView.addTargetActionForControlEvents(this._handler, "valueChanged", UIControlEvents.ValueChanged);
        this.nativeView = nativeView;
        this.width = 51;
        this.height = 31;
    }

    get ios(): UISwitch {
        return this.nativeView;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        // It can't be anything different from 51x31
        let nativeSize = this.nativeView.sizeThatFits(zeroSize);
        this.width = nativeSize.width;
        this.height = nativeSize.height;

        const widthAndState = Switch.resolveSizeAndState(layout.toDevicePixels(nativeSize.width), layout.toDevicePixels(51), layout.EXACTLY, 0);
        const heightAndState = Switch.resolveSizeAndState(layout.toDevicePixels(nativeSize.height), layout.toDevicePixels(31), layout.EXACTLY, 0);
        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    [checkedProperty.getDefault](): boolean {
        return false;
    }
    [checkedProperty.setNative](value: boolean) {
        this.nativeView.on = value;
    }

    [colorProperty.getDefault](): UIColor {
        return this.nativeView.thumbTintColor;
    }
    [colorProperty.setNative](value: UIColor | Color) {
        this.nativeView.thumbTintColor = value instanceof Color ? value.ios : value;
    }

    [backgroundColorProperty.getDefault](): UIColor {
        return this.nativeView.onTintColor;
    }
    [backgroundColorProperty.setNative](value: UIColor | Color) {
        this.nativeView.onTintColor = value instanceof Color ? value.ios : value;
    }

    [backgroundInternalProperty.getDefault](): any {
        return null;
    }
    [backgroundInternalProperty.setNative](value: any) {
        //
    }
}