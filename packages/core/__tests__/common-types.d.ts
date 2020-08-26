declare var UIColor, PHAsset, NSSearchPathDirectory;
declare type UIColor = any;
declare type PHAsset = any;

declare namespace android {
	export namespace content {
		export type Context = any;
		export var Context: any;
	}
	export namespace view {
		export type MotionEvent = any;
		export var MotionEvent: any;
	}
	export namespace util {
		export var Base64: any;
		export var Log: any;
	}
	export namespace graphics.Bitmap.CompressFormat {
		export var PNG: any;
		export var android: any;
	}
}

declare namespace org.nativescript.widgets {
	export var ViewHelper: any;
}
declare namespace org.nativescript.widgets.Async.Http {
	export type RequestResult = any;
	export var RequestResult: any;
}

declare type java = any;
declare var java: any;
