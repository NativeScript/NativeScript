import '../../globals';
import { setActivityCallbacks } from '.';
import { Application } from '../../application';

const EMPTY_FN = () => {};
declare const com: any;

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
