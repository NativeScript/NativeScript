import { isEmbedded, getEmbeddedView } from '../embedding';
import { setFragmentCallbacks } from './frame-helper-for-android';

declare const com: any;

const superProto = org.nativescript.widgets.FragmentBase.prototype;
const FragmentClass = (<any>org.nativescript.widgets.FragmentBase).extend('com.tns.FragmentClass', {
	init() {},
	onHiddenChanged(hidden: boolean): void {
		this._callbacks.onHiddenChanged(this, hidden, superProto.onHiddenChanged);
	},

	onCreateAnimator(transit: number, enter: boolean, nextAnim: number): android.animation.Animator {
		return this._callbacks.onCreateAnimator(this, transit, enter, nextAnim, superProto.onCreateAnimator);
	},

	onCreateAnimation(transit: number, enter: boolean, nextAnim: number): android.view.animation.Animation {
		return this._callbacks.onCreateAnimation(this, transit, enter, nextAnim, superProto.onCreateAnimation);
	},

	onStop(): void {
		this._callbacks.onStop(this, superProto.onStop);
	},

	onPause(): void {
		this._callbacks.onPause(this, superProto.onPause);
	},

	onResume(): void {
		this._callbacks.onResume(this, superProto.onResume);
	},

	onCreate(savedInstanceState: android.os.Bundle) {
		if (!this._callbacks) {
			setFragmentCallbacks(this);
		}

		this.setHasOptionsMenu(true);
		this._callbacks.onCreate(this, savedInstanceState, superProto.onCreate);
	},

	onCreateView(inflater: android.view.LayoutInflater, container: android.view.ViewGroup, savedInstanceState: android.os.Bundle) {
		return this._callbacks.onCreateView(this, inflater, container, savedInstanceState, superProto.onCreateView);
	},

	onSaveInstanceState(outState: android.os.Bundle) {
		this._callbacks.onSaveInstanceState(this, outState, superProto.onSaveInstanceState);
	},

	onDestroyView() {
		this._callbacks.onDestroyView(this, superProto.onDestroyView);
	},

	onDestroy() {
		this._callbacks.onDestroy(this, superProto.onDestroy);
		this._callbacks = null;
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

export let fragmentClass: any;

export function ensureFragmentClass() {
	if (fragmentClass) {
		return;
	}

	// this require will apply the FragmentClass implementation
	// TODO: circular dependency issue with fragment require - check back on this when testing
	// require('./fragment');

	if (!fragmentClass) {
		throw new Error('Failed to initialize the extended androidx.fragment.app.Fragment class');
	}
}

export function setFragmentClass(clazz: any) {
	if (fragmentClass) {
		throw new Error('Fragment class already initialized');
	}

	if (isEmbedded()) {
		attachEmbeddableFragmentCallbacks();
	}

	fragmentClass = clazz;
}

function attachEmbeddableFragmentCallbacks() {
	const Callbacks = com.tns.embedding.EmbeddableFragmentCallbacks.extend({
		init() {
			// init must at least be defined
		},
		onCreateView() {
			return getEmbeddedView().nativeViewProtected;
		},
		onResume() {
			getEmbeddedView().callLoaded();
		},
		onPause() {
			getEmbeddedView().callUnloaded();
		},
	});
	com.tns.embedding.CallbacksStore.setFragmentCallbacks(new Callbacks());
}

setFragmentClass(FragmentClass);
