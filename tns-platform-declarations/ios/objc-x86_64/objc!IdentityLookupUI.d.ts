
declare class ILClassificationUIExtensionContext extends NSExtensionContext {

	static alloc(): ILClassificationUIExtensionContext; // inherited from NSObject

	static new(): ILClassificationUIExtensionContext; // inherited from NSObject

	readyForClassificationResponse: boolean;
}

declare class ILClassificationUIExtensionViewController extends UIViewController {

	static alloc(): ILClassificationUIExtensionViewController; // inherited from NSObject

	static new(): ILClassificationUIExtensionViewController; // inherited from NSObject

	readonly extensionContext: ILClassificationUIExtensionContext;

	classificationResponseForRequest(request: ILClassificationRequest): ILClassificationResponse;

	prepareForClassificationRequest(request: ILClassificationRequest): void;
}
