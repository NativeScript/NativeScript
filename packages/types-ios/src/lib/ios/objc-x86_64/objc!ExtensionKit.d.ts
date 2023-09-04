
declare class EXHostViewController extends UIViewController {

	static alloc(): EXHostViewController; // inherited from NSObject

	static new(): EXHostViewController; // inherited from NSObject

	delegate: EXHostViewControllerDelegate;

	placeholderView: UIView;

	makeXPCConnectionWithError(): NSXPCConnection;
}

interface EXHostViewControllerDelegate extends NSObjectProtocol {

	hostViewControllerDidActivate?(viewController: EXHostViewController): void;

	hostViewControllerWillDeactivateError?(viewController: EXHostViewController, error: NSError): void;
}
declare var EXHostViewControllerDelegate: {

	prototype: EXHostViewControllerDelegate;
};
