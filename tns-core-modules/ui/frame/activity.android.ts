import { setActivityCallbacks, AndroidActivityCallbacks } from "./frame";
import * as globals from "../../globals";
import * as appModule from "../../application";

if ((<any>global).__snapshot || (<any>global).__snapshotEnabled) {
    globals.install();
}

//@ts-ignore
@JavaProxy("com.tns.NativeScriptActivity")
class NativeScriptActivity extends androidx.appcompat.app.AppCompatActivity {
    private _callbacks: AndroidActivityCallbacks;
    public isNativeScriptActivity;
    constructor() {
        super();

        return global.__native(this);
    }

    public onCreate(savedInstanceState: android.os.Bundle): void {
        appModule.android.init(this.getApplication());

        // Set isNativeScriptActivity in onCreate.
        // The JS constructor might not be called because the activity is created from Android.
        this.isNativeScriptActivity = true;
        if (!this._callbacks) {
            setActivityCallbacks(this);
        }

        this._callbacks.onCreate(this, savedInstanceState, this.getIntent(), super.onCreate);
    }

    public onNewIntent(intent: android.content.Intent): void {
        this._callbacks.onNewIntent(this, intent, super.setIntent, super.onNewIntent);
    }

    public onSaveInstanceState(outState: android.os.Bundle): void {
        this._callbacks.onSaveInstanceState(this, outState, super.onSaveInstanceState);
    }

    public onStart(): void {
        this._callbacks.onStart(this, super.onStart);
    }

    public onStop(): void {
        this._callbacks.onStop(this, super.onStop);
    }

    public onDestroy(): void {
        this._callbacks.onDestroy(this, super.onDestroy);
    }

    public onPostResume(): void {
        this._callbacks.onPostResume(this, super.onPostResume);
    }

    public onBackPressed(): void {
        this._callbacks.onBackPressed(this, super.onBackPressed);
    }

    public onRequestPermissionsResult(requestCode: number, permissions: Array<string>, grantResults: Array<number>): void {
        this._callbacks.onRequestPermissionsResult(this, requestCode, permissions, grantResults, undefined /*TODO: Enable if needed*/);
    }

    public onActivityResult(requestCode: number, resultCode: number, data: android.content.Intent): void {
        this._callbacks.onActivityResult(this, requestCode, resultCode, data, super.onActivityResult);
    }
}
