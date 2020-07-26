package org.nativescript.widgets;

import android.animation.Animator;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public class Fragment extends FragmentBase {
    public interface Interface {
        void onHiddenChanged(boolean hidden);
        public Animator onCreateAnimator(int transit, boolean enter, int nextAnim);
        public void onPause();
        public void onStop();
        public void onCreate(@Nullable Bundle savedInstanceState);
        public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState);
        public void onSaveInstanceState(@NonNull Bundle outState);
        public void onDestroyView();
        public void onDestroy();
        public String toString();
    }

    public Interface inter;

    public Fragment() {
        super();
    }

    public Fragment(Interface inter) {
        super();
        this.setInterface(inter);
    }


    public void setInterface(Interface inter) {
        this.inter = inter;
    }

    @Override
    public void onHiddenChanged(boolean hidden) {
        if (this.inter != null) {
            this.inter.onHiddenChanged(hidden);
        }
        super.onHiddenChanged(hidden);
    }

    @Override
    public Animator onCreateAnimator(int transit, boolean enter, int nextAnim) {
        Animator animator = null;
        if (this.inter != null) {
            animator = this.inter.onCreateAnimator(transit, enter, nextAnim);
        }
        if (animator == null) {
            animator = super.onCreateAnimator(transit, enter, nextAnim);
        }
        return animator;
    }

    @Override
    public void onPause() {
        if (this.inter != null) {
            this.inter.onPause();
        }
        super.onPause();
    }

    @Override
    public void onStop() {
        if (this.inter != null) {
            this.inter.onStop();
        }
        super.onStop();
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (this.inter != null) {
            this.inter.onCreate(savedInstanceState);
        }
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        if (this.inter != null) {
            return this.inter.onCreateView(inflater, container, savedInstanceState);
        }
        return super.onCreateView(inflater, container, savedInstanceState);
    }

    @Override
    public void onSaveInstanceState(@NonNull Bundle outState) {
        if (this.inter != null) {
            this.inter.onSaveInstanceState(outState);
        }
        super.onSaveInstanceState(outState);
    }

    @Override
    public void onDestroyView() {
        if (this.inter != null) {
            this.inter.onDestroyView();
        }
        super.onDestroyView();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (this.inter != null) {
            this.inter.onDestroy();
        }
    }
    @Override
    public String toString() {
        String result = null;
        if (this.inter != null) {
            result = this.inter.toString();
        }
        if (result == null) {
            result = super.toString();
        }
        return result;
    }
}