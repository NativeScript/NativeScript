import '../../globals';
import { setActivityCallbacks } from '.';
import { Application } from '../../application';
import { isEmbedded } from '../embedding';
const EMPTY_FN = () => {};
declare const com: any;

if (!isEmbedded()) {
	/**
	 * NOTE: We cannot use NativeClass here because this is used in appComponents in webpack.config
	 * Whereby it bypasses the decorator transformation, hence pure es5 style written here
	 */
	const superProto = androidx.appcompat.app.AppCompatActivity.prototype;
	(<any>androidx.appcompat.app.AppCompatActivity).extend('com.tns.NativeScriptActivity', {
		init() {
			// init must at least be defined
		},
		onCreate(savedInstanceState: android.os.Bundle): void {
			Application.android.init(this.getApplication());

			// Set isNativeScriptActivity in onCreate.
			// The JS constructor might not be called because the activity is created from Android.
			this.isNativeScriptActivity = true;

			if (!this._callbacks) {
				setActivityCallbacks(this);
			}

			this._callbacks.onCreate(this, savedInstanceState, this.getIntent(), superProto.onCreate);
		},

		onNewIntent(intent: android.content.Intent): void {
			this._callbacks.onNewIntent(this, intent, superProto.setIntent, superProto.onNewIntent);
		},

		onSaveInstanceState(outState: android.os.Bundle): void {
			this._callbacks.onSaveInstanceState(this, outState, superProto.onSaveInstanceState);
		},

		onStart(): void {
			this._callbacks.onStart(this, superProto.onStart);
		},

		onStop(): void {
			this._callbacks.onStop(this, superProto.onStop);
		},

		onDestroy(): void {
			this._callbacks.onDestroy(this, superProto.onDestroy);
		},

		onPostResume(): void {
			this._callbacks.onPostResume(this, superProto.onPostResume);
		},

		onBackPressed(): void {
			this._callbacks.onBackPressed(this, superProto.onBackPressed);
		},

		onRequestPermissionsResult(requestCode: number, permissions: Array<string>, grantResults: Array<number>): void {
			this._callbacks.onRequestPermissionsResult(this, requestCode, permissions, grantResults, undefined /*TODO: Enable if needed*/);
		},

		onActivityResult(requestCode: number, resultCode: number, data: android.content.Intent): void {
			this._callbacks.onActivityResult(this, requestCode, resultCode, data, superProto.onActivityResult);
		},
	});
} else {
	const Callbacks = com.tns.embedding.EmbeddableActivityCallbacks.extend({
		init() {
			// init must at least be defined
		},
		onCreate(savedInstanceState: android.os.Bundle): void {
			const activity = this.getActivity();

			Application.android.init(activity.getApplication());

			// Set isNativeScriptActivity in onCreate.
			// The JS constructor might not be called because the activity is created from Android.
			activity.isNativeScriptActivity = true;

			if (!activity._callbacks) {
				setActivityCallbacks(activity);
			}

			activity._callbacks.onCreate(activity, savedInstanceState, activity.getIntent(), EMPTY_FN);
		},

		onNewIntent(intent: android.content.Intent): void {
			const activity = this.getActivity();
			activity._callbacks.onNewIntent(activity, intent, EMPTY_FN, EMPTY_FN);
		},

		onSaveInstanceState(outState: android.os.Bundle): void {
			const activity = this.getActivity();
			activity._callbacks.onSaveInstanceState(activity, outState, EMPTY_FN);
		},

		onStart(): void {
			const activity = this.getActivity();
			activity._callbacks.onStart(activity, EMPTY_FN);
		},

		onStop(): void {
			const activity = this.getActivity();
			activity._callbacks.onStop(activity, EMPTY_FN);
		},

		onDestroy(): void {
			const activity = this.getActivity();
			activity._callbacks.onDestroy(activity, EMPTY_FN);
		},

		onPostResume(): void {
			const activity = this.getActivity();
			activity._callbacks.onPostResume(activity, EMPTY_FN);
		},

		onBackPressed(): void {
			const activity = this.getActivity();
			activity._callbacks.onBackPressed(activity, EMPTY_FN);
		},

		onRequestPermissionsResult(requestCode: number, permissions: Array<string>, grantResults: Array<number>): void {
			const activity = this.getActivity();
			activity._callbacks.onRequestPermissionsResult(activity, requestCode, permissions, grantResults, undefined /*TODO: Enable if needed*/);
		},

		onActivityResult(requestCode: number, resultCode: number, data: android.content.Intent): void {
			const activity = this.getActivity();
			activity._callbacks.onActivityResult(activity, requestCode, resultCode, data, EMPTY_FN);
		},
	});

	com.tns.embedding.CallbacksStore.setActivityCallbacks(new Callbacks());
}
