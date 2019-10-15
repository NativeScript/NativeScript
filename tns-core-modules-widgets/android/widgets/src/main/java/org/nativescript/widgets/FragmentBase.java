package org.nativescript.widgets;

import android.animation.Animator;
import androidx.fragment.app.Fragment; 

public abstract class FragmentBase extends Fragment {
    public Fragment getRemovingParentFragment() {
        Fragment parentFragment = this.getParentFragment();
        while (parentFragment != null && !parentFragment.isRemoving()) {
            parentFragment = parentFragment.getParentFragment();
        }

        return parentFragment;
    }
}