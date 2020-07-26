package com.tns;

import android.content.Intent;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

public class NativeScriptActivity extends AppCompatActivity {
    public final boolean isNativeScriptActivity = true;
    public interface Interface {

        boolean beforeOnCreate(@NonNull  AppCompatActivity activity, @Nullable Bundle savedInstanceState);
        void afterOnCreate(@NonNull  AppCompatActivity activity, @Nullable Bundle savedInstanceState);

        void onNewIntent(@NonNull  AppCompatActivity activity, Intent intent);

        void onSaveInstanceState(@NonNull  AppCompatActivity activity, @NonNull Bundle outState);

        void onStart(@NonNull  AppCompatActivity activity);

        void onStop(@NonNull  AppCompatActivity activity);

        void onDestroy(@NonNull  AppCompatActivity activity);

        void onPostResume(@NonNull  AppCompatActivity activity);

        boolean onBackPressed(@NonNull  AppCompatActivity activity);

        void onRequestPermissionsResult(@NonNull  AppCompatActivity activity, int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults);

        void onActivityResult(@NonNull  AppCompatActivity activity, int requestCode, int resultCode, @Nullable Intent data);
    }

    public static Interface inter;

    public NativeScriptActivity() {
        super();
    }

    public NativeScriptActivity(NativeScriptActivity.Interface inter) {
        super();
        this.setInterface(inter);
    }

    public static void setInterface(NativeScriptActivity.Interface inter) {
        NativeScriptActivity.inter = inter;
    }

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        boolean isRestart = false;
        if (inter != null) {
            isRestart = inter.beforeOnCreate(this, savedInstanceState);
        }
        super.onCreate(isRestart ? savedInstanceState : null);
        if (inter != null) {
            inter.afterOnCreate(this, savedInstanceState);
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        if (inter != null) {
            inter.onNewIntent(this, intent);
        }
    }

    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        if (inter != null) {
            inter.onSaveInstanceState(this, outState);
        }
    }

    @Override
    protected void onStart() {
        super.onStart();
        if (inter != null) {
            inter.onStart(this);
        }
    }

    @Override
    protected void onStop() {
        super.onStop();
        if (inter != null) {
            inter.onStop(this);
        }
    }

    @Override
    protected void onDestroy() {
        if (inter != null) {
            inter.onDestroy(this);
        }
        super.onDestroy();
    }

    @Override
    protected void onPostResume() {
        super.onPostResume();
        if (inter != null) {
            inter.onPostResume(this);
        }
    }

    @Override
    public void onBackPressed() {
        boolean shouldCallSuper = true;
        if (inter != null) {
            shouldCallSuper = inter.onBackPressed(this);
        }
        if (shouldCallSuper) {
            super.onBackPressed();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        if (inter != null) {
            inter.onRequestPermissionsResult(this, requestCode, permissions, grantResults);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (inter != null) {
            inter.onActivityResult(this, requestCode, resultCode, data);
        }
    }
}