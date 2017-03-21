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
        return this._android;
    }

    [checkedProperty.getDefault](): boolean {
        return false;
    }
    [checkedProperty.setNative](value: boolean) {
        this._android.setChecked(value);
    }

    [colorProperty.getDefault](): number {
        return -1;
    }
    [colorProperty.setNative](value: number | Color) {
        if (value instanceof Color) {
            this._android.getThumbDrawable().setColorFilter(value.android, android.graphics.PorterDuff.Mode.SRC_IN);
        } else {
            this._android.getThumbDrawable().clearColorFilter();
        }
    }

    [backgroundColorProperty.getDefault](): number {
        return -1;
    }
    [backgroundColorProperty.setNative](value: number | Color) {
        if (value instanceof Color) {
            this._android.getTrackDrawable().setColorFilter(value.android, android.graphics.PorterDuff.Mode.SRC_IN);
        } else {
            this._android.getTrackDrawable().clearColorFilter();
        }
    }

    [backgroundInternalProperty.getDefault](): any {
        return null;
    }
    [backgroundInternalProperty.setNative](value: any) {
        //
    }
}