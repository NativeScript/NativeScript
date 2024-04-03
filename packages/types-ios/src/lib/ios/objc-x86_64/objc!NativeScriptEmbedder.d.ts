
declare class NativeScriptEmbedder extends NSObject {

	static alloc(): NativeScriptEmbedder; // inherited from NSObject

	static new(): NativeScriptEmbedder; // inherited from NSObject

	static sharedInstance(): NativeScriptEmbedder;

	readonly delegate: NativeScriptEmbedderDelegate;

	setDelegate(aDelegate: NativeScriptEmbedderDelegate): void;
}

interface NativeScriptEmbedderDelegate {

	presentNativeScriptApp(vc: UIViewController): any;
}
declare var NativeScriptEmbedderDelegate: {

	prototype: NativeScriptEmbedderDelegate;
};
