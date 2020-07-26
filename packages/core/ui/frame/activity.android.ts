import { setActivityCallbacks, AndroidActivityCallbacks } from '.';
// use requires to ensure import order
const globals = require('../../globals');
const appModule = require('../../application');

if (global.__snapshot) {
	globals.initGlobal();
}
/**
 * Option 1: the exact es5 compiled version of what this normally looks like
 */
var NativeScriptActivity = (function (_super) {
	__extends(NativeScriptActivity, _super);
	function NativeScriptActivity() {
		console.log('construct NativeScriptActivity');
		var _this = _super.call(this) || this;
		return global.__native(_this);
	}
	NativeScriptActivity.prototype.init = function () {
		// return new NativeScriptActivity();
	};
	NativeScriptActivity.prototype.onCreate = function (savedInstanceState) {
		appModule.android.init(this.getApplication());
		this.isNativeScriptActivity = true;
		if (!this._callbacks) {
			setActivityCallbacks(this);
		}
		this._callbacks.onCreate(this, savedInstanceState, this.getIntent(), _super.prototype.onCreate);
	};
	NativeScriptActivity.prototype.onNewIntent = function (intent) {
		this._callbacks.onNewIntent(this, intent, _super.prototype.setIntent, _super.prototype.onNewIntent);
	};
	NativeScriptActivity.prototype.onSaveInstanceState = function (outState) {
		this._callbacks.onSaveInstanceState(this, outState, _super.prototype.onSaveInstanceState);
	};
	NativeScriptActivity.prototype.onStart = function () {
		this._callbacks.onStart(this, _super.prototype.onStart);
	};
	NativeScriptActivity.prototype.onStop = function () {
		this._callbacks.onStop(this, _super.prototype.onStop);
	};
	NativeScriptActivity.prototype.onDestroy = function () {
		this._callbacks.onDestroy(this, _super.prototype.onDestroy);
	};
	NativeScriptActivity.prototype.onPostResume = function () {
		this._callbacks.onPostResume(this, _super.prototype.onPostResume);
	};
	NativeScriptActivity.prototype.onBackPressed = function () {
		this._callbacks.onBackPressed(this, _super.prototype.onBackPressed);
	};
	NativeScriptActivity.prototype.onRequestPermissionsResult = function (requestCode, permissions, grantResults) {
		this._callbacks.onRequestPermissionsResult(this, requestCode, permissions, grantResults, undefined);
	};
	NativeScriptActivity.prototype.onActivityResult = function (requestCode, resultCode, data) {
		this._callbacks.onActivityResult(this, requestCode, resultCode, data, _super.prototype.onActivityResult);
	};
	NativeScriptActivity = __decorate([JavaProxy('com.tns.NativeScriptActivity')], NativeScriptActivity);
	return NativeScriptActivity;
})(androidx.appcompat.app.AppCompatActivity);

// Option 2: the manual es5 way - results in same as above
// const superProto = androidx.appcompat.app.AppCompatActivity.prototype;
// const NativeScriptActivity = (<any>androidx.appcompat.app.AppCompatActivity).extend('com.tns.NativeScriptActivity', {
// 	init() {
//     // superProto();
// 		// return global.__native(this);
// 	},
// 	onCreate(savedInstanceState: android.os.Bundle): void {
//     appModule.android.init(this.getApplication());

// 		// Set isNativeScriptActivity in onCreate.
// 		// The JS constructor might not be called because the activity is created from Android.
// 		this.isNativeScriptActivity = true;
// 		if (!this._callbacks) {
// 			setActivityCallbacks(this);
// 		}

// 		this._callbacks.onCreate(this, savedInstanceState, this.getIntent(), superProto.onCreate);
// 	},

// 	onNewIntent(intent: android.content.Intent): void {
// 		this._callbacks.onNewIntent(this, intent, superProto.setIntent, superProto.onNewIntent);
// 	},

// 	onSaveInstanceState(outState: android.os.Bundle): void {
// 		this._callbacks.onSaveInstanceState(this, outState, superProto.onSaveInstanceState);
// 	},

// 	onStart(): void {
// 		this._callbacks.onStart(this, superProto.onStart);
// 	},

// 	onStop(): void {
// 		this._callbacks.onStop(this, superProto.onStop);
// 	},

// 	onDestroy(): void {
// 		this._callbacks.onDestroy(this, superProto.onDestroy);
// 	},

// 	onPostResume(): void {
// 		this._callbacks.onPostResume(this, superProto.onPostResume);
// 	},

// 	onBackPressed(): void {
// 		this._callbacks.onBackPressed(this, superProto.onBackPressed);
// 	},

// 	onRequestPermissionsResult(requestCode: number, permissions: Array<string>, grantResults: Array<number>): void {
// 		this._callbacks.onRequestPermissionsResult(this, requestCode, permissions, grantResults, undefined /*TODO: Enable if needed*/);
// 	},

// 	onActivityResult(requestCode: number, resultCode: number, data: android.content.Intent): void {
// 		this._callbacks.onActivityResult(this, requestCode, resultCode, data, superProto.onActivityResult);
// 	},
// });

/**
 * Option 3: The way which worked when using es5 compile target however when targeting es2017, this source code won't work due to the extends from native class so trying options 1 and 2 to achieve same
 */
// @JavaProxy('com.tns.NativeScriptActivity')
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
