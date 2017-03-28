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
    nativeView: android.widget.Switch;
    public checked: boolean;

    public _createNativeView() {
        initializeCheckedChangeListener();
        const nativeView = new android.widget.Switch(this._context);
        const listener = new CheckedChangeListener(this);
        nativeView.setOnCheckedChangeListener(listener);
        (<any>nativeView).listener = listener;
        return nativeView;
    }

    public _initNativeView(): void {
        const nativeView: any = this.nativeView;
        nativeView.listener.owner = this;
    }

    public _disposeNativeView() {
        const nativeView: any = this.nativeView;
        nativeView.listener.owner = null;
    }

    [checkedProperty.getDefault](): boolean {
        return false;
    }
    [checkedProperty.setNative](value: boolean) {
        this.nativeView.setChecked(value);
    }

    [colorProperty.getDefault](): number {
        return -1;
    }
    [colorProperty.setNative](value: number | Color) {
        if (value instanceof Color) {
            this.nativeView.getThumbDrawable().setColorFilter(value.android, android.graphics.PorterDuff.Mode.SRC_IN);
        } else {
            this.nativeView.getThumbDrawable().clearColorFilter();
        }
    }

    [backgroundColorProperty.getDefault](): number {
        return -1;
    }
    [backgroundColorProperty.setNative](value: number | Color) {
        if (value instanceof Color) {
            this.nativeView.getTrackDrawable().setColorFilter(value.android, android.graphics.PorterDuff.Mode.SRC_IN);
        } else {
            this.nativeView.getTrackDrawable().clearColorFilter();
        }
    }

    [backgroundInternalProperty.getDefault](): any {
        return null;
    }
    [backgroundInternalProperty.setNative](value: any) {
        //
    }
}
