import {activityCallbacks as callbacks} from "ui/frame";

@JavaProxy("com.tns.NativeScriptActivity")
class NativeScriptActivity extends android.app.Activity {
    constructor() {
         super();
         return global.__native(this);
     }

    protected onCreate(savedInstanceState: android.os.Bundle): void {
        callbacks.onCreate(this, savedInstanceState, super.onCreate);
    }

    protected onSaveInstanceState(outState: android.os.Bundle): void {
        callbacks.onSaveInstanceState(this, outState, super.onSaveInstanceState);
    }

    protected onStart(): void {
        callbacks.onStart(this, super.onStart);
    }

    protected onStop(): void {
        callbacks.onStop(this, super.onStop);
    }

    protected onDestroy(): void {
        callbacks.onDestroy(this, super.onDestroy);
    }

    public onBackPressed(): void {
        callbacks.onBackPressed(this, super.onBackPressed);
    }

    public onRequestPermissionsResult (requestCode: number, permissions: Array<String>, grantResults: Array<number>): void {
        callbacks.onRequestPermissionsResult(this, requestCode, permissions, grantResults, undefined /*TODO: Enable if needed*/);
    }

    protected onActivityResult(requestCode: number, resultCode: number, data: android.content.Intent): void {
        callbacks.onActivityResult(this, requestCode, resultCode, data, super.onActivityResult);
    }
}