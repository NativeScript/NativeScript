package com.tns;

import android.app.Application;

@JavaScriptImplementation(javaScriptFile = "app/tns_modules/application/application.js")
public class NativeScriptApplication extends android.app.Application implements com.tns.NativeScriptHashCodeProvider {

    private static NativeScriptApplication thiz;

    public NativeScriptApplication()
    {
        thiz = this;
    }

    protected void attachBaseContext(android.content.Context param_0) {
        super.attachBaseContext(param_0);

        new RuntimeHelper(this).initRuntime();

        Platform.initInstance(this);
    }


    public void onCreate() {
        java.lang.Object[] params = null;
        com.tns.Platform.callJSMethod(this, "onCreate", void.class, params);
    }

    public void onLowMemory() {
        java.lang.Object[] params = null;
        com.tns.Platform.callJSMethod(this, "onLowMemory", void.class, params);
    }

    public void onTrimMemory(int level) {
        java.lang.Object[] params = new Object[1];
        params[0] = level;
        com.tns.Platform.callJSMethod(this, "onTrimMemory", void.class, params);
    }


    public boolean equals__super(java.lang.Object other) {
        return super.equals(other);
    }
    public int hashCode__super() {
        return super.hashCode();
    }

    public static Application getInstance() {
        return thiz;
    }

}
