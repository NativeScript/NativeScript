import image_module = require("Image/image");
import app_module = require("Application/application");

export module tk {
    export module web {
        /**
          * Android specific WebClient implementation.
          */
        export class Client {
            /**
              * Downloads string from url.
              */
            public getString(url: string, successCallback: (result: string) => void, errorCallback?: (e: Error) => void) {
                try {
                    if (successCallback) {
                        var context = app_module.tk.ui.Application.current.android.context;
                        com.koushikdutta.ion.Ion.with(context, url).asString().setCallback(new com.koushikdutta.async.future.FutureCallback({
                            onCompleted: function (e, result) {
                                if (e && errorCallback) {
                                    errorCallback(e.toString());
                                    return;
                                }
                                successCallback(result);
                            }
                        })).get();
                    }
                } catch (ex) {

                    if (errorCallback) {
                        errorCallback(ex);
                    }

                }
            }

            public getJSON(url: string, successCallback: (result: Object) => void, errorCallback?: (e: Error) => void) {
                this.getString(url, function (data) {
                    if (successCallback) {
                        successCallback(JSON.parse(data));
                    }
                }, errorCallback);
            }

            public getImage(url: string, successCallback: (result: image_module.tk.ui.Image) => void, errorCallback?: (e: Error) => void) {
                try {
                    if (successCallback) {
                        var context = app_module.tk.ui.Application.current.android.context;
                        com.koushikdutta.ion.Ion.with(context, url).asBitmap().setCallback(new com.koushikdutta.async.future.FutureCallback({
                            onCompleted: function (e, result) {
                                if (e && errorCallback) {
                                    errorCallback(e.toString());
                                    return;
                                }

                                var image = new image_module.tk.ui.Image();
                                image.loadFromBitmap(result);

                                successCallback(image);
                            }
                        })).get();
                    }
                } catch (ex) {

                    if (errorCallback) {
                        errorCallback(ex);
                    }

                }
            }

            public static get(url: string, successCallback: (result: any) => void, errorCallback?: (e: Error) => void) {
                try {

                } catch (ex) {
                    if (errorCallback) {
                        errorCallback(ex);
                    }
                }
            }
        }
    }
}