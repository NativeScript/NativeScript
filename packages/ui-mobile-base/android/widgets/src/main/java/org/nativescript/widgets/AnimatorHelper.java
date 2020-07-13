package org.nativescript.widgets;

import android.animation.Animator;
import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;

class AnimatorHelper {
    static final int version = android.os.Build.VERSION.SDK_INT;
    static final int exitFakeResourceId = -20;

    static Animator createDummyAnimator(long duration) {
        float[] alphaValues = new float[2];
        alphaValues[0] = 1;
        alphaValues[1] = 1;

        Animator animator = ObjectAnimator.ofFloat(null, "alpha", alphaValues);
        if (duration > 0) {
            animator.setDuration(duration);
        }

        return animator;
    }

    static long getTotalDuration(Animator animator) {
        if (animator instanceof AnimatorSet) {
            return getAnimatorSetTotalDuration((AnimatorSet)animator);
        } else {
            return getAnimatorTotalDuration(animator);
        }
    }

    static long getAnimatorTotalDuration(Animator animator) {
        long totalDuration;
        if (version >= 24) {
            totalDuration = animator.getTotalDuration();
        } else {
            long duration = animator.getDuration();
            if (duration == Animator.DURATION_INFINITE) {
                totalDuration = Animator.DURATION_INFINITE;
            } else {
                totalDuration = animator.getStartDelay() + duration;
            }
        }

        return totalDuration;
    }

    static long getAnimatorSetTotalDuration(AnimatorSet animatorSet) {
        long totalDuration = 0;
        if (version >= 24) {
            totalDuration = animatorSet.getTotalDuration();
        } else {
            // TODO: this is only meaningful for "playTogether" animators
            for (Animator animator: animatorSet.getChildAnimations()) {
                totalDuration = Math.max(totalDuration, getTotalDuration(animator));
            }
        }

        return totalDuration;
    }
}
