import frameCommon = require("ui/frame/frame-common");
import frame = require("ui/frame");
import pages = require("ui/pages");
import application = require("application");

export class Frame extends frameCommon.Frame {
    public navigateCore(context: any) {
        if (this.backStack.length === 0) {
            // When navigating for the very first time we do not want to start an activity
            // TODO: Revisit/polish this behavior
            return;
        }

        var activity = this.currentPage.android.activity;
        if (!activity) {
            throw new Error("Current page does have an activity created.");
        }

        var intent = new android.content.Intent(activity, (<any>com).tns.NativeScriptActivity.class);
        activity.startActivity(intent);
    }

    public goBackCore() {
        var activity = this.currentPage.android.activity;
        if (!activity) {
            throw new Error("Current page does have an activity created.");
        }

        // TODO: This is not true in all cases, update once added support for parent activity in Android manifest
        activity.finish();
    }

    public goForwardCore() {
    }
} 