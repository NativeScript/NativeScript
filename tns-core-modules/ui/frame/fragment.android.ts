import { AndroidFragmentCallbacks, setFragmentCallbacks, setFragmentClass } from "./frame";

@JavaProxy("com.tns.FragmentClass")
class FragmentClass extends android.app.Fragment {
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
        let result = this._callbacks.onCreateAnimator(this, transit, enter, nextAnim, super.onCreateAnimator);
        return result;
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
}

setFragmentClass(FragmentClass);