
declare class SLComposeServiceViewController extends UIViewController implements UITextViewDelegate {

	autoCompletionViewController: UIViewController;

	charactersRemaining: number;

	/* readonly */ contentText: string;

	placeholder: string;

	/* readonly */ textView: UITextView;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { nibName: string; bundle: NSBundle; }); // inherited from UIViewController

	cancel(): void;

	configurationItems(): NSArray<any>;

	didSelectCancel(): void;

	didSelectPost(): void;

	isContentValid(): boolean;

	loadPreviewView(): UIView;

	popConfigurationViewController(): void;

	presentationAnimationDidFinish(): void;

	pushConfigurationViewController(viewController: UIViewController): void;

	reloadConfigurationItems(): void;

	scrollViewDidEndDecelerating(scrollView: UIScrollView): void; // inherited from UIScrollViewDelegate

	scrollViewDidEndDraggingWillDecelerate(scrollView: UIScrollView, decelerate: boolean): void; // inherited from UIScrollViewDelegate

	scrollViewDidEndScrollingAnimation(scrollView: UIScrollView): void; // inherited from UIScrollViewDelegate

	scrollViewDidEndZoomingWithViewAtScale(scrollView: UIScrollView, view: UIView, scale: number): void; // inherited from UIScrollViewDelegate

	scrollViewDidScroll(scrollView: UIScrollView): void; // inherited from UIScrollViewDelegate

	scrollViewDidScrollToTop(scrollView: UIScrollView): void; // inherited from UIScrollViewDelegate

	scrollViewDidZoom(scrollView: UIScrollView): void; // inherited from UIScrollViewDelegate

	scrollViewShouldScrollToTop(scrollView: UIScrollView): boolean; // inherited from UIScrollViewDelegate

	scrollViewWillBeginDecelerating(scrollView: UIScrollView): void; // inherited from UIScrollViewDelegate

	scrollViewWillBeginDragging(scrollView: UIScrollView): void; // inherited from UIScrollViewDelegate

	scrollViewWillBeginZoomingWithView(scrollView: UIScrollView, view: UIView): void; // inherited from UIScrollViewDelegate

	scrollViewWillEndDraggingWithVelocityTargetContentOffset(scrollView: UIScrollView, velocity: CGPoint, targetContentOffset: interop.Reference<CGPoint>): void; // inherited from UIScrollViewDelegate

	self(): SLComposeServiceViewController; // inherited from NSObjectProtocol

	textViewDidBeginEditing(textView: UITextView): void; // inherited from UITextViewDelegate

	textViewDidChange(textView: UITextView): void; // inherited from UITextViewDelegate

	textViewDidChangeSelection(textView: UITextView): void; // inherited from UITextViewDelegate

	textViewDidEndEditing(textView: UITextView): void; // inherited from UITextViewDelegate

	textViewShouldBeginEditing(textView: UITextView): boolean; // inherited from UITextViewDelegate

	textViewShouldChangeTextInRangeReplacementText(textView: UITextView, range: NSRange, text: string): boolean; // inherited from UITextViewDelegate

	textViewShouldEndEditing(textView: UITextView): boolean; // inherited from UITextViewDelegate

	textViewShouldInteractWithTextAttachmentInRange(textView: UITextView, textAttachment: NSTextAttachment, characterRange: NSRange): boolean; // inherited from UITextViewDelegate

	textViewShouldInteractWithURLInRange(textView: UITextView, URL: NSURL, characterRange: NSRange): boolean; // inherited from UITextViewDelegate

	validateContent(): void;

	viewForZoomingInScrollView(scrollView: UIScrollView): UIView; // inherited from UIScrollViewDelegate
}

declare class SLComposeSheetConfigurationItem extends NSObject {

	static alloc(): SLComposeSheetConfigurationItem; // inherited from NSObject

	static new(): SLComposeSheetConfigurationItem; // inherited from NSObject

	tapHandler: () => void;

	title: string;

	value: string;

	valuePending: boolean;

	constructor(); // inherited from NSObject

	self(): SLComposeSheetConfigurationItem; // inherited from NSObjectProtocol
}

declare class SLComposeViewController extends UIViewController {

	static composeViewControllerForServiceType(serviceType: string): SLComposeViewController;

	static isAvailableForServiceType(serviceType: string): boolean;

	completionHandler: (p1: SLComposeViewControllerResult) => void;

	/* readonly */ serviceType: string;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { nibName: string; bundle: NSBundle; }); // inherited from UIViewController

	addImage(image: UIImage): boolean;

	addURL(url: NSURL): boolean;

	removeAllImages(): boolean;

	removeAllURLs(): boolean;

	self(): SLComposeViewController; // inherited from NSObjectProtocol

	setInitialText(text: string): boolean;
}

declare const enum SLComposeViewControllerResult {

	Cancelled = 0,

	Done = 1
}

declare class SLRequest extends NSObject {

	static alloc(): SLRequest; // inherited from NSObject

	static new(): SLRequest; // inherited from NSObject

	static requestForServiceTypeRequestMethodURLParameters(serviceType: string, requestMethod: SLRequestMethod, url: NSURL, parameters: NSDictionary<any, any>): SLRequest;

	/* readonly */ URL: NSURL;

	account: ACAccount;

	/* readonly */ parameters: NSDictionary<any, any>;

	/* readonly */ requestMethod: SLRequestMethod;

	constructor(); // inherited from NSObject

	addMultipartDataWithNameTypeFilename(data: NSData, name: string, type: string, filename: string): void;

	performRequestWithHandler(handler: (p1: NSData, p2: NSHTTPURLResponse, p3: NSError) => void): void;

	preparedURLRequest(): NSURLRequest;

	self(): SLRequest; // inherited from NSObjectProtocol
}

declare const enum SLRequestMethod {

	GET = 0,

	POST = 1,

	DELETE = 2,

	PUT = 3
}

declare var SLServiceTypeFacebook: string;

declare var SLServiceTypeSinaWeibo: string;

declare var SLServiceTypeTencentWeibo: string;

declare var SLServiceTypeTwitter: string;
