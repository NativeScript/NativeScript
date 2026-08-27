
declare class NativeScriptContainerCtrl extends UIViewController {

	static alloc(): NativeScriptContainerCtrl; // inherited from NSObject

	static new(): NativeScriptContainerCtrl; // inherited from NSObject

	updateData: (p1: NSMutableDictionary<any, any>) => void | null;
}

/**
 * @since 13.0
 */
declare class NativeScriptViewFactory extends NSObject implements NativeScriptEmbedderDelegate {

	static alloc(): NativeScriptViewFactory; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	static getKeyWindow(): UIWindow | null;

	static initShared(): void;

	static new(): NativeScriptViewFactory; // inherited from NSObject

	static setApp(value: NativeScriptContainerCtrl | null): void;

	static setShared(value: NativeScriptViewFactory | null): void;

	viewCreator: (p1: string) => void | null;

	viewDestroyer: (p1: string) => void | null;

	views: NSMutableDictionary<any, any> | null;

	static app: NativeScriptContainerCtrl | null;

	static shared: NativeScriptViewFactory | null;

	getViewById(id: string): UIView;

	presentNativeScriptApp(vc: UIViewController): any;
}
