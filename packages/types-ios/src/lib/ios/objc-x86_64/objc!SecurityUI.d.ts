
/**
 * @since 18.4
 */
declare class SFCertificatePresentation extends NSObject {

	static alloc(): SFCertificatePresentation; // inherited from NSObject

	static new(): SFCertificatePresentation; // inherited from NSObject

	helpURL: NSURL;

	message: string;

	title: string;

	readonly trust: any;

	constructor(o: { trust: any; });

	dismissSheet(): void;

	initWithTrust(trust: any): this;

	presentSheetInViewControllerDismissHandler(viewController: UIViewController, dismissHandler: () => void): void;
}
