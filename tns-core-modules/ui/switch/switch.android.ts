import { Switch as SwitchDefinition } from "ui/switch";
import { View, layout, colorProperty, backgroundColorProperty, backgroundInternalProperty } from "ui/core/view";
import { Property } from "ui/core/properties";
import { Color } from "color";

export * from "ui/core/view";

@Interfaces([android.widget.CompoundButton.OnCheckedChangeListener])
class CheckedChangeListener implements android.widget.CompoundButton.OnCheckedChangeListener {
    constructor(private owner: WeakRef<Switch>) {
        return global.__native(this);
    }

    onCheckedChanged(buttonView: android.widget.CompoundButton, isChecked: boolean): void {
        let owner = this.owner.get();
        if (owner) {
            owner.nativePropertyChanged(checkedProperty, isChecked);
        }
    }
}

export class Switch extends View implements SwitchDefinition {
    private _android: android.widget.Switch;
    private listener: android.widget.CompoundButton.OnCheckedChangeListener;
    public checked: boolean;

    get android(): android.widget.Switch {
        return this._android;
    }

    public _createUI() {
        this._android = new android.widget.Switch(this._context);
        this.listener = this.listener || new CheckedChangeListener(new WeakRef(this));
        this._android.setOnCheckedChangeListener(this.listener);
    }

    get [checkedProperty.native](): boolean {
        return false;
    }
    set [checkedProperty.native](value: boolean) {
        this._android.setChecked(value);
    }

    get [colorProperty.native](): number {
        return -1;
    }
    set [colorProperty.native](value: number | Color) {
        if (value instanceof Color) {
            this._android.getThumbDrawable().setColorFilter(value.android, android.graphics.PorterDuff.Mode.SRC_IN);
        } else {
            this._android.getThumbDrawable().clearColorFilter();
        }
    }

    get [backgroundColorProperty.native](): number {
        return -1;
    }
    set [backgroundColorProperty.native](value: number | Color) {
        if (value instanceof Color) {
            this._android.getTrackDrawable().setColorFilter(value.android, android.graphics.PorterDuff.Mode.SRC_IN);
        } else {
            this._android.getTrackDrawable().clearColorFilter();
        }
    }

    get [backgroundInternalProperty.native](): any {
        return null;
    }
    set [backgroundInternalProperty.native](value: any) {
        //
    }
}

export const checkedProperty = new Property<Switch, boolean>({ name: "checked", defaultValue: false, valueConverter: (v) => !!v });
checkedProperty.register(Switch);