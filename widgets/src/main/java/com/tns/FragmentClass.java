package com.tns;

import android.animation.Animator;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

@JavaScriptImplementation(javaScriptFile = "app/tns_modules/ui/frme/frame.js")
public class FragmentClass extends android.app.Fragment implements com.tns.NativeScriptHashCodeProvider {

    public FragmentClass()
    {
        com.tns.Platform.initInstance(this);
    }

    public void onHiddenChanged(boolean hidden) {
        java.lang.Object[] params = new Object[1];
        params[0] = hidden;
        com.tns.Platform.callJSMethod(this, "onHiddenChanged", void.class, params);
    }

    public Animator onCreateAnimator(int transit, boolean enter, int nextAnim) {
        java.lang.Object[] params = new Object[3];
        params[0] = transit;
        params[1] = enter;
        params[2] = nextAnim;
        return (Animator)com.tns.Platform.callJSMethod(this, "onCreateAnimator", Animator.class, params);

    }

    public void onCreate(Bundle savedInstanceState) {
        java.lang.Object[] params = new Object[1];
        params[0] = savedInstanceState;
        com.tns.Platform.callJSMethod(this, "onCreate", void.class, params);
    }

    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        java.lang.Object[] params = new Object[3];
        params[0] = inflater;
        params[1] = container;
        params[2] = savedInstanceState;
        return (View)com.tns.Platform.callJSMethod(this, "onCreateView", View.class, params);

    }

    public void onSaveInstanceState(Bundle outState) {
        java.lang.Object[] params = new Object[1];
        params[0] = outState;
        com.tns.Platform.callJSMethod(this, "onSaveInstanceState", void.class, params);
    }

    public void onDestroyView() {
        java.lang.Object[] params = null;
        com.tns.Platform.callJSMethod(this, "onDestroyView", void.class, params);

    }

    public void onDestroy() {
        java.lang.Object[] params = null;
        com.tns.Platform.callJSMethod(this, "onDestroy", void.class, params);

    }
    public boolean equals__super(java.lang.Object other) {
        return super.equals(other);
    }
    public int hashCode__super() {
        return super.hashCode();
    }

}
