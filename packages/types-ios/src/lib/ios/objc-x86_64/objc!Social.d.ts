
declare class SLComposeServiceViewController extends UIViewController implements UITextViewDelegate {

	static alloc(): SLComposeServiceViewController; // inherited from NSObject

	static new(): SLComposeServiceViewController; // inherited from NSObject

	autoCompletionViewController: UIViewController;

	charactersRemaining: number;

	readonly contentText: string;

	placeholder: string;

	readonly textView: UITextView;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	cancel(): void;

	class(): typeof NSObject;

	configurationItems(): NSArray<any>;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	didSelectCancel(): void;

	didSelectPost(): void;

	isContentValid(): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	loadPreviewView(): UIView;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	popConfigurationViewController(): void;

	presentationAnimationDidFinish(): void;

	pushConfigurationViewController(viewController: UIViewController): void;

	reloadConfigurationItems(): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	scrollViewDidChangeAdjustedContentInset(scrollView: UIScrollView): void;

	scrollViewDidEndDecelerating(scrollView: UIScrollView): void;

	scrollViewDidEndDraggingWillDecelerate(scrollView: UIScrollView, decelerate: boolean): void;

	scrollViewDidEndScrollingAnimation(scrollView: UIScrollView): void;

	scrollViewDidEndZoomingWithViewAtScale(scrollView: UIScrollView, view: UIView, scale: number): void;

	scrollViewDidScroll(scrollView: UIScrollView): void;

	scrollViewDidScrollToTop(scrollView: UIScrollView): void;

	scrollViewDidZoom(scrollView: UIScrollView): void;

	scrollViewShouldScrollToTop(scrollView: UIScrollView): boolean;

	scrollViewWillBeginDecelerating(scrollView: UIScrollView): void;

	scrollViewWillBeginDragging(scrollView: UIScrollView): void;

	scrollViewWillBeginZoomingWithView(scrollView: UIScrollView, view: UIView): void;

	scrollViewWillEndDraggingWithVelocityTargetContentOffset(scrollView: UIScrollView, velocity: CGPoint, targetContentOffset: interop.Pointer | interop.Reference<CGPoint>): void;

	self(): this;

	textViewDidBeginEditing(textView: UITextView): void;

	textViewDidChange(textView: UITextView): void;

	textViewDidChangeSelection(textView: UITextView): void;

	textViewDidEndEditing(textView: UITextView): void;

	textViewShouldBeginEditing(textView: UITextView): boolean;

	textViewShouldChangeTextInRangeReplacementText(textView: UITextView, range: NSRange, text: string): boolean;

	textViewShouldEndEditing(textView: UITextView): boolean;

	textViewShouldInteractWithTextAttachmentInRange(textView: UITextView, textAttachment: NSTextAttachment, characterRange: NSRange): boolean;

	textViewShouldInteractWithTextAttachmentInRangeInteraction(textView: UITextView, textAttachment: NSTextAttachment, characterRange: NSRange, interaction: UITextItemInteraction): boolean;

	textViewShouldInteractWithURLInRange(textView: UITextView, URL: NSURL, characterRange: NSRange): boolean;

	textViewShouldInteractWithURLInRangeInteraction(textView: UITextView, URL: NSURL, characterRange: NSRange, interaction: UITextItemInteraction): boolean;

	validateContent(): void;

	viewForZoomingInScrollView(scrollView: UIScrollView): UIView;
}

declare class SLComposeSheetConfigurationItem extends NSObject {

	static alloc(): SLComposeSheetConfigurationItem; // inherited from NSObject

	static new(): SLComposeSheetConfigurationItem; // inherited from NSObject

	tapHandler: () => void;

	title: string;

	value: string;

	valuePending: boolean;
}

declare class SLComposeViewController extends UIViewController {

	static alloc(): SLComposeViewController; // inherited from NSObject

	static composeViewControllerForServiceType(serviceType: string): SLComposeViewController;

	static isAvailableForServiceType(serviceType: string): boolean;

	static new(): SLComposeViewController; // inherited from NSObject

	completionHandler: (p1: SLComposeViewControllerResult) => void;

	readonly serviceType: string;

	addImage(image: UIImage): boolean;

	addURL(url: NSURL): boolean;

	removeAllImages(): boolean;

	removeAllURLs(): boolean;

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

	readonly URL: NSURL;

	account: ACAccount;

	readonly parameters: NSDictionary<any, any>;

	readonly requestMethod: SLRequestMethod;

	addMultipartDataWithNameTypeFilename(data: NSData, name: string, type: string, filename: string): void;

	performRequestWithHandler(handler: (p1: NSData, p2: NSHTTPURLResponse, p3: NSError) => void): void;

	preparedURLRequest(): NSURLRequest;
}

declare const enum SLRequestMethod {

	GET = 0,

	POST = 1,

	DELETE = 2,

	PUT = 3
}

declare var SLServiceTypeFacebook: string;

declare var SLServiceTypeLinkedIn: string;

declare var SLServiceTypeSinaWeibo: string;

declare var SLServiceTypeTencentWeibo: string;

declare var SLServiceTypeTwitter: string;
