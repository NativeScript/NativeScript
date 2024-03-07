
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

declare class NativeScriptViewFactory extends NSObject {
	static getKeyWindow(): UIWindow;
	static shared: NativeScriptViewFactory;
	views: NSMutableDictionary<string, any>;
	viewCreator: (id: string, ctrl: UIViewController) => void;
	viewDestroyer: (id: string) => void;
}
