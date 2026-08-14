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
	private final AnimatorSet animatorSet;
	private AnimatorSet immediateAnimatorSet;
	private final String transitionName;

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

	public String getTransitionName() {
		return this.transitionName;
	}

	private Animator setAnimatorsTarget(AnimatorSet animatorSet, final View view) {
		// IMPORTANT: run on a per-invocation clone instead of the shared this.animatorSet.
		// androidx clones the transition for every run but shares this animatorSet field,
		// and the framework adds its own end listeners (Visibility$OverlayListener, etc.) to
		// the AnimatorSet we return. On a zero-duration ("none") transition those listeners
		// are not always removed, so reusing a single shared AnimatorSet across navigations
		// accumulates stale listeners - each one retaining the previous fragment and page,
		// which leaks the whole navigation history. Cloning keeps the shared template clean
		// and lets the throwaway run set (and its listeners) be collected after the transition.
		AnimatorSet runSet = animatorSet.clone();

		ArrayList<Animator> animatorsList = runSet.getChildAnimations();
		for (int i = 0; i < animatorsList.size(); i++) {
			animatorsList.get(i).setTarget(view);
		}

		// Reset animation to its initial state to prevent mirrorered effect
		if (this.resetOnTransitionEnd) {
			this.immediateAnimatorSet = runSet.clone();
		}

		// Switching to hardware layer during transition to improve animation performance
		CustomAnimatorListener listener = new CustomAnimatorListener(view);
		runSet.addListener(listener);
		this.addListener(new CustomTransitionListenerAdapter(this));

		return runSet;
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

		private View mView;
		private boolean mLayerTypeChanged = false;

		CustomAnimatorListener(View view) {
			mView = view;
		}

		@Override
		public void onAnimationStart(Animator animation) {
			if (mView != null
				&& ViewCompat.hasOverlappingRendering(mView)
				&& mView.getLayerType() == View.LAYER_TYPE_NONE) {
				mLayerTypeChanged = true;
				mView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
			}
		}

		@Override
		public void onAnimationEnd(Animator animation) {
			if (mLayerTypeChanged && mView != null) {
				mView.setLayerType(View.LAYER_TYPE_NONE, null);
			}

			// Release the strong reference to the animated view so the page/fragment
			// can be garbage collected once navigation is done. The AnimatorSet (and in
			// turn this listener) may be retained by the platform animation handler after
			// the transition completes; without clearing mView that keeps the page's
			// native view - and its linked JS object - alive forever.
			animation.removeListener(this);
			mView = null;
		}
	}
}
