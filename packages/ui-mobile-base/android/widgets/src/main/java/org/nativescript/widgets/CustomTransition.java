package org.nativescript.widgets;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.animation.AnimatorSet;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.Interpolator;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.view.ViewCompat;
import androidx.transition.Transition;
import androidx.transition.TransitionListenerAdapter;
import androidx.transition.TransitionValues;
import androidx.transition.Visibility;

import java.util.ArrayList;

public class CustomTransition extends Visibility {
    private boolean resetOnTransitionEnd;
    private AnimatorSet animatorSet;
    private AnimatorSet immediateAnimatorSet;
    private String transitionName;

    public CustomTransition(AnimatorSet animatorSet, String transitionName) {
        this.animatorSet = animatorSet;
        this.transitionName = transitionName;
    }

    @Nullable
    @Override
    public Animator onAppear(@NonNull ViewGroup sceneRoot, @NonNull final View view, @Nullable TransitionValues startValues,
                             @Nullable TransitionValues endValues) {
        if (endValues == null || view == null || this.animatorSet == null) {
            return null;
        }

        return this.setAnimatorsTarget(this.animatorSet, view);
    }

    @Override
    public Animator onDisappear(@NonNull ViewGroup sceneRoot, @NonNull final View view, @Nullable TransitionValues startValues,
                                @Nullable TransitionValues endValues) {
        if (startValues == null || view == null || this.animatorSet == null) {
            return null;
        }

        return this.setAnimatorsTarget(this.animatorSet, view);
    }

    public void setResetOnTransitionEnd(boolean resetOnTransitionEnd) {
            this.resetOnTransitionEnd = resetOnTransitionEnd;
    }

    public String getTransitionName(){
        return this.transitionName;
    }

    private Animator setAnimatorsTarget(AnimatorSet animatorSet, final View view) {
        ArrayList<Animator> animatorsList = animatorSet.getChildAnimations();
        boolean resetOnTransitionEnd = this.resetOnTransitionEnd;
        
        for (int i = 0; i < animatorsList.size(); i++) {
            animatorsList.get(i).setTarget(view);
        }

        // Reset animation to its initial state to prevent mirrorered effect
        if (this.resetOnTransitionEnd) {
            this.immediateAnimatorSet = this.animatorSet.clone();
        }

        // Switching to hardware layer during transition to improve animation performance
        CustomAnimatorListener listener = new CustomAnimatorListener(view);
        animatorSet.addListener(listener);
        this.addListener(new CustomTransitionListenerAdapter(this));

        return this.animatorSet;
    }

    private class ReverseInterpolator implements Interpolator {
        @Override
        public float getInterpolation(float paramFloat) {
            return Math.abs(paramFloat - 1f);
        }
    }

    private class CustomTransitionListenerAdapter extends TransitionListenerAdapter {
        private CustomTransition customTransition;

        CustomTransitionListenerAdapter(CustomTransition transition) {
            this.customTransition = transition;
        }

        @Override
        public void onTransitionEnd(@NonNull Transition transition) {
            if (this.customTransition.resetOnTransitionEnd) {
                this.customTransition.immediateAnimatorSet.setDuration(0);
                this.customTransition.immediateAnimatorSet.setInterpolator(new ReverseInterpolator());
                this.customTransition.immediateAnimatorSet.start();
                this.customTransition.setResetOnTransitionEnd(false);
            }

            this.customTransition.immediateAnimatorSet = null;
            this.customTransition = null;
            transition.removeListener(this);
        }
    }

    private static class CustomAnimatorListener extends AnimatorListenerAdapter {

        private final View mView;
        private boolean mLayerTypeChanged = false;

        CustomAnimatorListener(View view) {
            mView = view;
        }

        @Override
        public void onAnimationStart(Animator animation) {
            if (ViewCompat.hasOverlappingRendering(mView)
                    && mView.getLayerType() == View.LAYER_TYPE_NONE) {
                mLayerTypeChanged = true;
                mView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
            }
        }

        @Override
        public void onAnimationEnd(Animator animation) {
            if (mLayerTypeChanged) {
                mView.setLayerType(View.LAYER_TYPE_NONE, null);
            }
        }
    }
}