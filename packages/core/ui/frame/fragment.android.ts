import { AndroidFragmentCallbacks, setFragmentCallbacks, setFragmentClass } from '.';

const superProto = org.nativescript.widgets.FragmentBase.prototype;
const FragmentClass = (<any>org.nativescript.widgets.FragmentBase).extend('com.tns.FragmentClass', {
	init() {},
	onHiddenChanged(hidden: boolean): void {
		this._callbacks.onHiddenChanged(this, hidden, superProto.onHiddenChanged);
	},

	onCreateAnimator(transit: number, enter: boolean, nextAnim: number): android.animation.Animator {
		return this._callbacks.onCreateAnimator(this, transit, enter, nextAnim, superProto.onCreateAnimator);
	},

	onStop(): void {
		this._callbacks.onStop(this, superProto.onStop);
	},

	onPause(): void {
		this._callbacks.onPause(this, superProto.onPause);
	},

	onCreate(savedInstanceState: android.os.Bundle) {
		if (!this._callbacks) {
			setFragmentCallbacks(this);
		}

		this.setHasOptionsMenu(true);
		this._callbacks.onCreate(this, savedInstanceState, superProto.onCreate);
	},

	onCreateView(inflater: android.view.LayoutInflater, container: android.view.ViewGroup, savedInstanceState: android.os.Bundle) {
		let result = this._callbacks.onCreateView(this, inflater, container, savedInstanceState, superProto.onCreateView);

		return result;
	},

	onSaveInstanceState(outState: android.os.Bundle) {
		this._callbacks.onSaveInstanceState(this, outState, superProto.onSaveInstanceState);
	},

	onDestroyView() {
		this._callbacks.onDestroyView(this, superProto.onDestroyView);
	},

	onDestroy() {
		this._callbacks.onDestroy(this, superProto.onDestroy);
	},

	toString(): string {
		const callbacks = this._callbacks;
		if (callbacks) {
			return callbacks.toStringOverride(this, superProto.toString);
		} else {
			superProto.toString();
		}
	},
});

setFragmentClass(FragmentClass);
