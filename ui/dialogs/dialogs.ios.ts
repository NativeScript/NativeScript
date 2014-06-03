/**
  * iOS specific dialogs functions implementation.
  */
import promises = require("promises");

export function alert(arg: any): promises.Promise<any> {
    var d = promises.defer<any>();
    try {
        var options = typeof arg === "string" ? { message: arg, title: "Alert", buttonName: "OK" } : arg
        var alert = new UIKit.UIAlertView();
        alert.title = options.title;
        alert.message = options.message;
        alert.addButtonWithTitle(options.buttonName);

        var delegateType = Foundation.NSObject.extends({}, {}).implements({
            protocol: "UIAlertViewDelegate",
            implementation: {
                alertViewClickedButtonAtIndex: function (view, index) {
                    d.resolve();
                    // Remove the local variable for the delegate.
                    delegate = undefined;
                }
            }
        });
        // Assign first to local variable, otherwise it will be garbage collected since delegate is weak reference.
        var delegate = new delegateType();
        alert.delegate = delegate;

        alert.show();
    } catch (ex) {
        d.reject(ex);
    }

    return d.promise();
}

export function confirm(message: string): void {

}

export function prompt(text: string, defaultText?: string): void {

}