
declare class QLPreviewController extends UIViewController {

	static canPreviewItem(item: QLPreviewItem): boolean;

	/* readonly */ currentPreviewItem: QLPreviewItem;

	currentPreviewItemIndex: number;

	dataSource: QLPreviewControllerDataSource;

	delegate: QLPreviewControllerDelegate;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { nibName: string; bundle: NSBundle; }); // inherited from UIViewController

	refreshCurrentPreviewItem(): void;

	reloadData(): void;

	self(): QLPreviewController; // inherited from NSObjectProtocol
}

interface QLPreviewControllerDataSource {

	numberOfPreviewItemsInPreviewController(controller: QLPreviewController): number;

	previewControllerPreviewItemAtIndex(controller: QLPreviewController, index: number): QLPreviewItem;
}
declare var QLPreviewControllerDataSource: {

	prototype: QLPreviewControllerDataSource;
};

interface QLPreviewControllerDelegate extends NSObjectProtocol {

	previewControllerDidDismiss?(controller: QLPreviewController): void;

	previewControllerFrameForPreviewItemInSourceView?(controller: QLPreviewController, item: QLPreviewItem, view: interop.Reference<UIView>): CGRect;

	previewControllerShouldOpenURLForPreviewItem?(controller: QLPreviewController, url: NSURL, item: QLPreviewItem): boolean;

	previewControllerTransitionImageForPreviewItemContentRect?(controller: QLPreviewController, item: QLPreviewItem, contentRect: interop.Reference<CGRect>): UIImage;

	previewControllerWillDismiss?(controller: QLPreviewController): void;
}
declare var QLPreviewControllerDelegate: {

	prototype: QLPreviewControllerDelegate;
};

interface QLPreviewItem extends NSObjectProtocol {

	previewItemTitle?: string;

	previewItemURL: NSURL;
}
declare var QLPreviewItem: {

	prototype: QLPreviewItem;
};
