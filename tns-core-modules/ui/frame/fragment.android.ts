import { AndroidFragmentCallbacks, setFragmentCallbacks, setFragmentClass } from "./frame";
import { AnimationType } from "./fragment.transitions";

function createDummyAnimator(duration: number): android.animation.Animator {
    const alphaValues = Array.create("float", 2);
    alphaValues[0] = 1;
    alphaValues[1] = 1;
    
    const animator = android.animation.ObjectAnimator.ofFloat(null, "alpha", alphaValues);
    animator.setDuration(duration);

    return animator;
}

@JavaProxy("com.tns.FragmentClass")
class FragmentClass extends android.support.v4.app.Fragment {
    // This field is updated in the frame module upon `new` (although hacky this eases the Fragment->callbacks association a lot)
    private _callbacks: AndroidFragmentCallbacks;
    
    constructor() {
        super();
        return global.__native(this);
    }

    public onHiddenChanged(hidden: boolean): void {
        this._callbacks.onHiddenChanged(this, hidden, super.onHiddenChanged);
    }

    public onCreateAnimator(transit: number, enter: boolean, nextAnim: number): android.animation.Animator {
        // [nested frames / fragments] apply dummy animator to the nested fragment with
        // the same duration as the exit animator of the removing parent fragment to work around
        // https://code.google.com/p/android/issues/detail?id=55228 (child fragments disappear
        // when parent fragment is removed as all children are first removed from parent)
        if (!enter) {
            const removingParentFragment = this.getRemovingParentFragment();
            if (removingParentFragment) {
                const parentAnimator = removingParentFragment.onCreateAnimator(transit, enter, AnimationType.exitFakeResourceId);
                if (parentAnimator) {
                    const duration = parentAnimator.getDuration();
                    return createDummyAnimator(duration);
                }
            }
        }

        return this._callbacks.onCreateAnimator(this, transit, enter, nextAnim, super.onCreateAnimator);
    }

    public onStop(): void {
        this._callbacks.onStop(this, super.onStop);
    }

    public onCreate(savedInstanceState: android.os.Bundle) {
        if (!this._callbacks) {
            setFragmentCallbacks(this);
        }

        this.setHasOptionsMenu(true);
        this._callbacks.onCreate(this, savedInstanceState, super.onCreate);
    }

    public onCreateView(inflater: android.view.LayoutInflater, container: android.view.ViewGroup, savedInstanceState: android.os.Bundle) {
        let result = this._callbacks.onCreateView(this, inflater, container, savedInstanceState, super.onCreateView);
        return result;
    }

    public onSaveInstanceState(outState: android.os.Bundle) {
        this._callbacks.onSaveInstanceState(this, outState, super.onSaveInstanceState);
    }

    public onDestroyView() {
        this._callbacks.onDestroyView(this, super.onDestroyView);
    }

    public onDestroy() {
        this._callbacks.onDestroy(this, super.onDestroy);
    }

    public toString(): string {
        const callbacks = this._callbacks;
        if (callbacks) {
            return callbacks.toStringOverride(this, super.toString);
        } else {
            super.toString();
        }
    }

    private getRemovingParentFragment(): android.support.v4.app.Fragment {
        let parentFragment = this.getParentFragment();
        while (parentFragment && !parentFragment.isRemoving()) {
            parentFragment = parentFragment.getParentFragment();
        }
    
        return parentFragment;
    }
}

setFragmentClass(FragmentClass);