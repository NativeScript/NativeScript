
declare class NativeScriptEmbedder extends NSObject {

	static alloc(): NativeScriptEmbedder; // inherited from NSObject

	static boot(): void;

	static new(): NativeScriptEmbedder; // inherited from NSObject

	static setup(): void;

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
