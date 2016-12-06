import { Switch as SwitchDefinition } from "ui/switch";
import { View, layout, Color, Property, colorProperty, backgroundColorProperty, backgroundInternalProperty, booleanConverter } from "ui/core/view";

export * from "ui/core/view";

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
            owner.nativePropertyChanged(checkedProperty, sender.on);
        }
    }

    public static ObjCExposedMethods = {
        'valueChanged': { returns: interop.types.void, params: [UISwitch] }
    };
}

export class Switch extends View implements SwitchDefinition {
    private _ios: UISwitch;
    private _handler: NSObject;

    constructor() {
        super();
        this._ios = UISwitch.new();

        this._handler = SwitchChangeHandlerImpl.initWithOwner(new WeakRef(this));
        this._ios.addTargetActionForControlEvents(this._handler, "valueChanged", UIControlEvents.ValueChanged);
    }

    public checked: boolean;

    get ios(): UISwitch {
        return this._ios;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        // It can't be anything different from 51x31
        let nativeSize = this._nativeView.sizeThatFits(CGSizeMake(0, 0));
        this.width = nativeSize.width;
        this.height = nativeSize.height;

        let widthAndState = layout.makeMeasureSpec(nativeSize.width, layout.EXACTLY);
        let heightAndState = layout.makeMeasureSpec(nativeSize.height, layout.EXACTLY);
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

export const checkedProperty = new Property<Switch, boolean>({ name: "checked", defaultValue: false, valueConverter: booleanConverter });
checkedProperty.register(Switch);