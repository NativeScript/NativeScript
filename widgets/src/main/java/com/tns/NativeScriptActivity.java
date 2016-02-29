package com.tns;

@JavaScriptImplementation(javaScriptFile = "app/tns_modules/ui/frme/frame.js")
public class NativeScriptActivity extends android.app.Activity implements com.tns.NativeScriptHashCodeProvider {

    public NativeScriptActivity()
    {
        com.tns.Platform.initInstance(this);
    }

    protected void onCreate(android.os.Bundle savedInstanceState) {
        java.lang.Object[] params = new Object[1];
        params[0] = savedInstanceState;
        com.tns.Platform.callJSMethod(this, "onCreate", void.class, params);
    }

    protected void onSaveInstanceState(android.os.Bundle outState) {
        java.lang.Object[] params = new Object[1];
        params[0] = outState;
        com.tns.Platform.callJSMethod(this, "onSaveInstanceState", void.class, params);
    }

    protected void onStart() {
        java.lang.Object[] params = null;
        com.tns.Platform.callJSMethod(this, "onStart", void.class, params);
    }

    protected void onStop() {
        java.lang.Object[] params = null;
        com.tns.Platform.callJSMethod(this, "onStop", void.class, params);
    }

    protected void onDestroy() {
        java.lang.Object[] params = null;
        com.tns.Platform.callJSMethod(this, "onDestroy", void.class, params);

    }

    public void onBackPressed() {
        java.lang.Object[] params = null;
        com.tns.Platform.callJSMethod(this, "onBackPressed", void.class, params);
    }

    protected void onActivityResult(int requestCode, int resultCode, android.content.Intent data) {
        java.lang.Object[] params = new Object[3];
        params[0] = requestCode;
        params[1] = resultCode;
        params[2] = data;
        com.tns.Platform.callJSMethod(this, "onActivityResult", void.class, params);
    }

    public boolean equals__super(java.lang.Object other) {
        return super.equals(other);
    }
    public int hashCode__super() {
        return super.hashCode();
    }

}
