
declare class NativeScriptEmbedder extends NSObject {

	static alloc(): NativeScriptEmbedder; // inherited from NSObject

	static new(): NativeScriptEmbedder; // inherited from NSObject

	static sharedInstance(): NativeScriptEmbedder;

	readonly delegate: NativeScriptEmbedderDelegate;

	readonly windowScene: UIWindowScene;

	setDelegate(aDelegate: NativeScriptEmbedderDelegate): void;

	setWindowScene(windowScene: UIWindowScene): void;
}

interface NativeScriptEmbedderDelegate {

	presentNativeScriptApp(vc: UIViewController): any;
}
declare var NativeScriptEmbedderDelegate: {

	prototype: NativeScriptEmbedderDelegate;
};

declare class NativeScriptViewRegistry extends NSObject {
	static getKeyWindow(): UIWindow;
}
