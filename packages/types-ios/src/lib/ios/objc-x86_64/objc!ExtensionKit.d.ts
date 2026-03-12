
/**
 * @since 18
 */
declare class EXAppExtensionBrowserViewController extends UIViewController {

	static alloc(): EXAppExtensionBrowserViewController; // inherited from NSObject

	static new(): EXAppExtensionBrowserViewController; // inherited from NSObject
}

/**
 * @since 26.0
 */
declare class EXHostViewController extends UIViewController {

	static alloc(): EXHostViewController; // inherited from NSObject

	static new(): EXHostViewController; // inherited from NSObject

	delegate: EXHostViewControllerDelegate;

	placeholderView: UIView;

	makeXPCConnectionWithError(error?: interop.Reference<NSError>): NSXPCConnection;
}

/**
 * @since 26.0
 */
interface EXHostViewControllerDelegate extends NSObjectProtocol {

	hostViewControllerDidActivate?(viewController: EXHostViewController): void;

	hostViewControllerWillDeactivateError?(viewController: EXHostViewController, error: NSError): void;
}
declare var EXHostViewControllerDelegate: {

	prototype: EXHostViewControllerDelegate;
};
