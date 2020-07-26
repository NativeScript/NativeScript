import { setActivityCallbacks, AndroidActivityCallbacks } from '.';
import { initGlobal } from '../../globals';
import * as appModule from '../../application';

if (global.__snapshot) {
	initGlobal();
}

const superProto = androidx.appcompat.app.AppCompatActivity.prototype;
// @JavaProxy('com.tns.NativeScriptActivity')
const NativeScriptActivity = (<any>androidx.appcompat.app.AppCompatActivity).extend('com.tns.NativeScriptActivity', {
	init() {
		// superProto();
		// return global.__native(this);
	},
	onCreate(savedInstanceState: android.os.Bundle): void {
		console.log('onCreate this.getApplication():', this.getApplication());
		appModule.android.init(this.getApplication());

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

// class NativeScriptActivity extends androidx.appcompat.app.AppCompatActivity {
// 	private _callbacks: AndroidActivityCallbacks;
// 	public isNativeScriptActivity;
// 	constructor() {
// 		super();

// 		return global.__native(this);
// 	}

// 	public onCreate(savedInstanceState: android.os.Bundle): void {
// 		appModule.android.init(this.getApplication());

// 		// Set isNativeScriptActivity in onCreate.
// 		// The JS constructor might not be called because the activity is created from Android.
// 		this.isNativeScriptActivity = true;
// 		if (!this._callbacks) {
// 			setActivityCallbacks(this);
// 		}

// 		this._callbacks.onCreate(this, savedInstanceState, this.getIntent(), super.onCreate);
// 	}

// 	public onNewIntent(intent: android.content.Intent): void {
// 		this._callbacks.onNewIntent(this, intent, super.setIntent, super.onNewIntent);
// 	}

// 	public onSaveInstanceState(outState: android.os.Bundle): void {
// 		this._callbacks.onSaveInstanceState(this, outState, super.onSaveInstanceState);
// 	}

// 	public onStart(): void {
// 		this._callbacks.onStart(this, super.onStart);
// 	}

// 	public onStop(): void {
// 		this._callbacks.onStop(this, super.onStop);
// 	}

// 	public onDestroy(): void {
// 		this._callbacks.onDestroy(this, super.onDestroy);
// 	}

// 	public onPostResume(): void {
// 		this._callbacks.onPostResume(this, super.onPostResume);
// 	}

// 	public onBackPressed(): void {
// 		this._callbacks.onBackPressed(this, super.onBackPressed);
// 	}

// 	public onRequestPermissionsResult(requestCode: number, permissions: Array<string>, grantResults: Array<number>): void {
// 		this._callbacks.onRequestPermissionsResult(this, requestCode, permissions, grantResults, undefined /*TODO: Enable if needed*/);
// 	}

// 	public onActivityResult(requestCode: number, resultCode: number, data: android.content.Intent): void {
// 		this._callbacks.onActivityResult(this, requestCode, resultCode, data, super.onActivityResult);
// 	}
// }
