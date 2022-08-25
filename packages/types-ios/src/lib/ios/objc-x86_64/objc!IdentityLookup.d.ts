
declare class ILCallClassificationRequest extends ILClassificationRequest implements NSSecureCoding {

	static alloc(): ILCallClassificationRequest; // inherited from NSObject

	static new(): ILCallClassificationRequest; // inherited from NSObject

	readonly callCommunications: NSArray<ILCallCommunication>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class ILCallCommunication extends ILCommunication {

	static alloc(): ILCallCommunication; // inherited from NSObject

	static new(): ILCallCommunication; // inherited from NSObject

	isEqualToCallCommunication(communication: ILCallCommunication): boolean;
}

declare const enum ILClassificationAction {

	None = 0,

	ReportNotJunk = 1,

	ReportJunk = 2,

	ReportJunkAndBlockSender = 3
}

declare class ILClassificationRequest extends NSObject implements NSSecureCoding {

	static alloc(): ILClassificationRequest; // inherited from NSObject

	static new(): ILClassificationRequest; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class ILClassificationResponse extends NSObject implements NSSecureCoding {

	static alloc(): ILClassificationResponse; // inherited from NSObject

	static new(): ILClassificationResponse; // inherited from NSObject

	readonly action: ILClassificationAction;

	userInfo: NSDictionary<string, any>;

	userString: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { classificationAction: ILClassificationAction; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithClassificationAction(action: ILClassificationAction): this;

	initWithCoder(coder: NSCoder): this;
}

declare class ILCommunication extends NSObject implements NSSecureCoding {

	static alloc(): ILCommunication; // inherited from NSObject

	static new(): ILCommunication; // inherited from NSObject

	readonly dateReceived: Date;

	readonly sender: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	isEqualToCommunication(communication: ILCommunication): boolean;
}

declare class ILMessageClassificationRequest extends ILClassificationRequest implements NSSecureCoding {

	static alloc(): ILMessageClassificationRequest; // inherited from NSObject

	static new(): ILMessageClassificationRequest; // inherited from NSObject

	readonly messageCommunications: NSArray<ILMessageCommunication>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class ILMessageCommunication extends ILCommunication {

	static alloc(): ILMessageCommunication; // inherited from NSObject

	static new(): ILMessageCommunication; // inherited from NSObject

	readonly messageBody: string;

	isEqualToMessageCommunication(communication: ILMessageCommunication): boolean;
}

declare const enum ILMessageFilterAction {

	None = 0,

	Allow = 1,

	Junk = 2,

	Filter = 2,

	Promotion = 3,

	Transaction = 4
}

interface ILMessageFilterCapabilitiesQueryHandling extends NSObjectProtocol {

	handleCapabilitiesQueryRequestContextCompletion(capabilitiesQueryRequest: ILMessageFilterCapabilitiesQueryRequest, context: ILMessageFilterExtensionContext, completion: (p1: ILMessageFilterCapabilitiesQueryResponse) => void): void;
}
declare var ILMessageFilterCapabilitiesQueryHandling: {

	prototype: ILMessageFilterCapabilitiesQueryHandling;
};

declare class ILMessageFilterCapabilitiesQueryRequest extends NSObject implements NSSecureCoding {

	static alloc(): ILMessageFilterCapabilitiesQueryRequest; // inherited from NSObject

	static new(): ILMessageFilterCapabilitiesQueryRequest; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class ILMessageFilterCapabilitiesQueryResponse extends NSObject implements NSSecureCoding {

	static alloc(): ILMessageFilterCapabilitiesQueryResponse; // inherited from NSObject

	static new(): ILMessageFilterCapabilitiesQueryResponse; // inherited from NSObject

	promotionalSubActions: NSArray<number>;

	transactionalSubActions: NSArray<number>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
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

	readonly receiverISOCountryCode: string;

	readonly sender: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class ILMessageFilterQueryResponse extends NSObject implements NSSecureCoding {

	static alloc(): ILMessageFilterQueryResponse; // inherited from NSObject

	static new(): ILMessageFilterQueryResponse; // inherited from NSObject

	action: ILMessageFilterAction;

	subAction: ILMessageFilterSubAction;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum ILMessageFilterSubAction {

	None = 0,

	TransactionalOthers = 10000,

	TransactionalFinance = 10001,

	TransactionalOrders = 10002,

	TransactionalReminders = 10003,

	TransactionalHealth = 10004,

	TransactionalWeather = 10005,

	TransactionalCarrier = 10006,

	TransactionalRewards = 10007,

	TransactionalPublicServices = 10008,

	PromotionalOthers = 20000,

	PromotionalOffers = 20001,

	PromotionalCoupons = 20002
}

declare class ILNetworkResponse extends NSObject implements NSSecureCoding {

	static alloc(): ILNetworkResponse; // inherited from NSObject

	static new(): ILNetworkResponse; // inherited from NSObject

	readonly data: NSData;

	readonly urlResponse: NSHTTPURLResponse;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}
