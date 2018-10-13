
declare const enum ILMessageFilterAction {

	None = 0,

	Allow = 1,

	Filter = 2
}

declare const enum ILMessageFilterError {

	System = 1,

	InvalidNetworkURL = 2,

	NetworkURLUnauthorized = 3,

	NetworkRequestFailed = 4,

	RedundantNetworkDeferral = 5
}

declare var ILMessageFilterErrorDomain: string;

declare class ILMessageFilterExtension extends NSObject {

	static alloc(): ILMessageFilterExtension; // inherited from NSObject

	static new(): ILMessageFilterExtension; // inherited from NSObject
}

declare class ILMessageFilterExtensionContext extends NSExtensionContext {

	static alloc(): ILMessageFilterExtensionContext; // inherited from NSObject

	static new(): ILMessageFilterExtensionContext; // inherited from NSObject

	deferQueryRequestToNetworkWithCompletion(completion: (p1: ILNetworkResponse, p2: NSError) => void): void;
}

interface ILMessageFilterQueryHandling extends NSObjectProtocol {

	handleQueryRequestContextCompletion(queryRequest: ILMessageFilterQueryRequest, context: ILMessageFilterExtensionContext, completion: (p1: ILMessageFilterQueryResponse) => void): void;
}
declare var ILMessageFilterQueryHandling: {

	prototype: ILMessageFilterQueryHandling;
};

declare class ILMessageFilterQueryRequest extends NSObject implements NSSecureCoding {

	static alloc(): ILMessageFilterQueryRequest; // inherited from NSObject

	static new(): ILMessageFilterQueryRequest; // inherited from NSObject

	readonly messageBody: string;

	readonly sender: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class ILMessageFilterQueryResponse extends NSObject implements NSSecureCoding {

	static alloc(): ILMessageFilterQueryResponse; // inherited from NSObject

	static new(): ILMessageFilterQueryResponse; // inherited from NSObject

	action: ILMessageFilterAction;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class ILNetworkResponse extends NSObject implements NSSecureCoding {

	static alloc(): ILNetworkResponse; // inherited from NSObject

	static new(): ILNetworkResponse; // inherited from NSObject

	readonly data: NSData;

	readonly urlResponse: NSHTTPURLResponse;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}
