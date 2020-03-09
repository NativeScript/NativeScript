
declare class VNDocumentCameraScan extends NSObject {

	static alloc(): VNDocumentCameraScan; // inherited from NSObject

	static new(): VNDocumentCameraScan; // inherited from NSObject

	readonly pageCount: number;

	readonly title: string;

	imageOfPageAtIndex(index: number): UIImage;
}

declare class VNDocumentCameraViewController extends UIViewController {

	static alloc(): VNDocumentCameraViewController; // inherited from NSObject

	static new(): VNDocumentCameraViewController; // inherited from NSObject

	delegate: VNDocumentCameraViewControllerDelegate;

	static readonly supported: boolean;
}

interface VNDocumentCameraViewControllerDelegate extends NSObjectProtocol {

	documentCameraViewControllerDidCancel?(controller: VNDocumentCameraViewController): void;

	documentCameraViewControllerDidFailWithError?(controller: VNDocumentCameraViewController, error: NSError): void;

	documentCameraViewControllerDidFinishWithScan?(controller: VNDocumentCameraViewController, scan: VNDocumentCameraScan): void;
}
declare var VNDocumentCameraViewControllerDelegate: {

	prototype: VNDocumentCameraViewControllerDelegate;
};
