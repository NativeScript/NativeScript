import {
    SwitchBase, Color, colorProperty, backgroundColorProperty, backgroundInternalProperty, checkedProperty
} from "./switch-common";

export * from "./switch-common";

interface CheckedChangeListener {
    new (owner: Switch): android.widget.CompoundButton.OnCheckedChangeListener;
}

let CheckedChangeListener: CheckedChangeListener;

function initializeCheckedChangeListener(): void {
    if (CheckedChangeListener) {
        return;
    }

    @Interfaces([android.widget.CompoundButton.OnCheckedChangeListener])
    class CheckedChangeListenerImpl extends java.lang.Object implements android.widget.CompoundButton.OnCheckedChangeListener {
        constructor(private owner: Switch) {
            super();
            return global.__native(this);
        }

        onCheckedChanged(buttonView: android.widget.CompoundButton, isChecked: boolean): void {
            const owner = this.owner;
            checkedProperty.nativeValueChange(owner, isChecked);
        }
    }

    CheckedChangeListener = CheckedChangeListenerImpl;
}

export class Switch extends SwitchBase {
    private _android: android.widget.Switch;
    private listener: android.widget.CompoundButton.OnCheckedChangeListener;
    public checked: boolean;

    get android(): android.widget.Switch {
        return this._android;
    }

    public _createNativeView() {
        initializeCheckedChangeListener();
        this._android = new android.widget.Switch(this._context);
        this.listener = this.listener || new CheckedChangeListener(this);
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