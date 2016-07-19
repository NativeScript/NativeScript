
declare class TWRequest extends NSObject {

	static alloc(): TWRequest; // inherited from NSObject

	static new(): TWRequest; // inherited from NSObject

	/* readonly */ URL: NSURL;

	account: ACAccount;

	/* readonly */ parameters: NSDictionary<any, any>;

	/* readonly */ requestMethod: SLRequestMethod;

	constructor(); // inherited from NSObject

	constructor(o: { URL: NSURL; parameters: NSDictionary<any, any>; requestMethod: SLRequestMethod; });

	addMultiPartDataWithNameType(data: NSData, name: string, type: string): void;

	performRequestWithHandler(handler: (p1: NSData, p2: NSHTTPURLResponse, p3: NSError) => void): void;

	self(): TWRequest; // inherited from NSObjectProtocol

	signedURLRequest(): NSURLRequest;
}

declare class TWTweetComposeViewController extends UIViewController {

	static canSendTweet(): boolean;

	completionHandler: (p1: SLComposeViewControllerResult) => void;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { nibName: string; bundle: NSBundle; }); // inherited from UIViewController

	addImage(image: UIImage): boolean;

	addURL(url: NSURL): boolean;

	removeAllImages(): boolean;

	removeAllURLs(): boolean;

	self(): TWTweetComposeViewController; // inherited from NSObjectProtocol

	setInitialText(text: string): boolean;
}
