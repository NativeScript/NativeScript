
declare class SNAudioFileAnalyzer extends NSObject {

	static alloc(): SNAudioFileAnalyzer; // inherited from NSObject

	static new(): SNAudioFileAnalyzer; // inherited from NSObject

	constructor(o: { URL: NSURL; });

	addRequestWithObserverError(request: SNRequest, observer: SNResultsObserving): boolean;

	analyze(): void;

	analyzeWithCompletionHandler(completionHandler: (p1: boolean) => void): void;

	cancelAnalysis(): void;

	initWithURLError(url: NSURL): this;

	removeAllRequests(): void;

	removeRequest(request: SNRequest): void;
}

declare class SNAudioStreamAnalyzer extends NSObject {

	static alloc(): SNAudioStreamAnalyzer; // inherited from NSObject

	static new(): SNAudioStreamAnalyzer; // inherited from NSObject

	constructor(o: { format: AVAudioFormat; });

	addRequestWithObserverError(request: SNRequest, observer: SNResultsObserving): boolean;

	analyzeAudioBufferAtAudioFramePosition(audioBuffer: AVAudioBuffer, audioFramePosition: number): void;

	completeAnalysis(): void;

	initWithFormat(format: AVAudioFormat): this;

	removeAllRequests(): void;

	removeRequest(request: SNRequest): void;
}

declare class SNClassification extends NSObject {

	static alloc(): SNClassification; // inherited from NSObject

	static new(): SNClassification; // inherited from NSObject

	readonly confidence: number;

	readonly identifier: string;
}

declare class SNClassificationResult extends NSObject implements SNResult {

	static alloc(): SNClassificationResult; // inherited from NSObject

	static new(): SNClassificationResult; // inherited from NSObject

	readonly classifications: NSArray<SNClassification>;

	readonly timeRange: CMTimeRange;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare class SNClassifySoundRequest extends NSObject implements SNRequest {

	static alloc(): SNClassifySoundRequest; // inherited from NSObject

	static new(): SNClassifySoundRequest; // inherited from NSObject

	overlapFactor: number;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { MLModel: MLModel; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithMLModelError(mlModel: MLModel): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare const enum SNErrorCode {

	UnknownError = 1,

	OperationFailed = 2,

	InvalidFormat = 3,

	InvalidModel = 4,

	InvalidFile = 5
}

declare var SNErrorDomain: string;

interface SNRequest extends NSObjectProtocol {
}
declare var SNRequest: {

	prototype: SNRequest;
};

interface SNResult extends NSObjectProtocol {
}
declare var SNResult: {

	prototype: SNResult;
};

interface SNResultsObserving extends NSObjectProtocol {

	requestDidComplete?(request: SNRequest): void;

	requestDidFailWithError?(request: SNRequest, error: NSError): void;

	requestDidProduceResult(request: SNRequest, result: SNResult): void;
}
declare var SNResultsObserving: {

	prototype: SNResultsObserving;
};
