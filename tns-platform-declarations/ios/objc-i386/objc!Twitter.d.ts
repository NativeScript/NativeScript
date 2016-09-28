
declare class TWRequest extends NSObject {

	static alloc(): TWRequest; // inherited from NSObject

	static new(): TWRequest; // inherited from NSObject

	readonly URL: NSURL;

	account: ACAccount;

	readonly parameters: NSDictionary<any, any>;

	readonly requestMethod: SLRequestMethod;

	constructor(o: { URL: NSURL; parameters: NSDictionary<any, any>; requestMethod: SLRequestMethod; });

	addMultiPartDataWithNameType(data: NSData, name: string, type: string): void;

	initWithURLParametersRequestMethod(url: NSURL, parameters: NSDictionary<any, any>, requestMethod: SLRequestMethod): this;

	performRequestWithHandler(handler: (p1: NSData, p2: NSHTTPURLResponse, p3: NSError) => void): void;

	signedURLRequest(): NSURLRequest;
}

declare const TWRequestMethodDELETE: number;

declare const TWRequestMethodGET: number;

declare const TWRequestMethodPOST: number;

declare class TWTweetComposeViewController extends UIViewController {

	static alloc(): TWTweetComposeViewController; // inherited from NSObject

	static canSendTweet(): boolean;

	static new(): TWTweetComposeViewController; // inherited from NSObject

	completionHandler: (p1: SLComposeViewControllerResult) => void;

	addImage(image: UIImage): boolean;

	addURL(url: NSURL): boolean;

	removeAllImages(): boolean;

	removeAllURLs(): boolean;

	setInitialText(text: string): boolean;
}

declare const TWTweetComposeViewControllerResultCancelled: number;

declare const TWTweetComposeViewControllerResultDone: number;
