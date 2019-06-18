package org.nativescript.widgets;

import android.animation.Animator;
import androidx.fragment.app.Fragment; 

public abstract class FragmentBase extends Fragment {

    @Override
    public Animator onCreateAnimator(int transit, boolean enter, int nextAnim) {
        // [nested frames / fragments] apply dummy animator to the nested fragment with
        // the same duration as the exit animator of the removing parent fragment to work around
        // https://code.google.com/p/android/issues/detail?id=55228 (child fragments disappear
        // when parent fragment is removed as all children are first removed from parent)
        if (!enter) {
            Fragment removingParentFragment = this.getRemovingParentFragment();
            if (removingParentFragment != null) {
                Animator parentAnimator = removingParentFragment.onCreateAnimator(transit, enter, AnimatorHelper.exitFakeResourceId);
                if (parentAnimator != null) {
                    long duration = AnimatorHelper.getTotalDuration(parentAnimator);
                    return AnimatorHelper.createDummyAnimator(duration);
                }
            }
        }

        return super.onCreateAnimator(transit, enter, nextAnim);
    }

    public Fragment getRemovingParentFragment() {
        Fragment parentFragment = this.getParentFragment();
        while (parentFragment != null && !parentFragment.isRemoving()) {
            parentFragment = parentFragment.getParentFragment();
        }

        return parentFragment;
    }
}
