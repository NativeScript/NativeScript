
declare class PKAddPassButton extends UIButton {

	static addPassButtonWithStyle(addPassButtonStyle: PKAddPassButtonStyle): PKAddPassButton;

	static alloc(): PKAddPassButton; // inherited from NSObject

	static appearance(): PKAddPassButton; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): PKAddPassButton; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): PKAddPassButton; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject>): PKAddPassButton; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): PKAddPassButton; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject>): PKAddPassButton; // inherited from UIAppearance

	static buttonWithType(buttonType: UIButtonType): PKAddPassButton; // inherited from UIButton

	static new(): PKAddPassButton; // inherited from NSObject

	addPassButtonStyle: PKAddPassButtonStyle;

	constructor(o: { addPassButtonStyle: PKAddPassButtonStyle; });

	initWithAddPassButtonStyle(style: PKAddPassButtonStyle): this;
}

declare const enum PKAddPassButtonStyle {

	Black = 0,

	BlackOutline = 1
}

declare class PKAddPassesViewController extends UIViewController {

	static alloc(): PKAddPassesViewController; // inherited from NSObject

	static canAddPasses(): boolean;

	static new(): PKAddPassesViewController; // inherited from NSObject

	delegate: PKAddPassesViewControllerDelegate;

	constructor(o: { pass: PKPass; });

	constructor(o: { passes: NSArray<PKPass>; });

	initWithPass(pass: PKPass): this;

	initWithPasses(passes: NSArray<PKPass>): this;
}

interface PKAddPassesViewControllerDelegate extends NSObjectProtocol {

	addPassesViewControllerDidFinish?(controller: PKAddPassesViewController): void;
}
declare var PKAddPassesViewControllerDelegate: {

	prototype: PKAddPassesViewControllerDelegate;
};

declare const enum PKAddPaymentPassError {

	Unsupported = 0,

	UserCancelled = 1,

	SystemCancelled = 2
}

declare class PKAddPaymentPassRequest extends NSObject {

	static alloc(): PKAddPaymentPassRequest; // inherited from NSObject

	static new(): PKAddPaymentPassRequest; // inherited from NSObject

	activationData: NSData;

	encryptedPassData: NSData;

	ephemeralPublicKey: NSData;

	wrappedKey: NSData;
}

declare class PKAddPaymentPassRequestConfiguration extends NSObject {

	static alloc(): PKAddPaymentPassRequestConfiguration; // inherited from NSObject

	static new(): PKAddPaymentPassRequestConfiguration; // inherited from NSObject

	cardholderName: string;

	/* readonly */ encryptionScheme: string;

	localizedDescription: string;

	paymentNetwork: string;

	primaryAccountIdentifier: string;

	primaryAccountSuffix: string;

	constructor(o: { encryptionScheme: string; });

	initWithEncryptionScheme(encryptionScheme: string): this;
}

declare class PKAddPaymentPassViewController extends UIViewController {

	static alloc(): PKAddPaymentPassViewController; // inherited from NSObject

	static canAddPaymentPass(): boolean;

	static new(): PKAddPaymentPassViewController; // inherited from NSObject

	delegate: PKAddPaymentPassViewControllerDelegate;

	constructor(o: { requestConfiguration: PKAddPaymentPassRequestConfiguration; delegate: PKAddPaymentPassViewControllerDelegate; });

	initWithRequestConfigurationDelegate(configuration: PKAddPaymentPassRequestConfiguration, delegate: PKAddPaymentPassViewControllerDelegate): this;
}

interface PKAddPaymentPassViewControllerDelegate extends NSObjectProtocol {

	addPaymentPassViewControllerDidFinishAddingPaymentPassError(controller: PKAddPaymentPassViewController, pass: PKPaymentPass, error: NSError): void;

	addPaymentPassViewControllerGenerateRequestWithCertificateChainNonceNonceSignatureCompletionHandler(controller: PKAddPaymentPassViewController, certificates: NSArray<NSData>, nonce: NSData, nonceSignature: NSData, handler: (p1: PKAddPaymentPassRequest) => void): void;
}
declare var PKAddPaymentPassViewControllerDelegate: {

	prototype: PKAddPaymentPassViewControllerDelegate;
};

declare const enum PKAddressField {

	None = 0,

	PostalAddress = 1,

	Phone = 2,

	Email = 4,

	Name = 8,

	All = 15
}

declare const enum PKAutomaticPassPresentationSuppressionResult {

	NotSupported = 0,

	AlreadyPresenting = 1,

	Denied = 2,

	Cancelled = 3,

	Success = 4
}

declare class PKContact extends NSObject {

	static alloc(): PKContact; // inherited from NSObject

	static new(): PKContact; // inherited from NSObject

	emailAddress: string;

	name: NSPersonNameComponents;

	phoneNumber: CNPhoneNumber;

	postalAddress: CNPostalAddress;

	supplementarySubLocality: string;
}

declare var PKEncryptionSchemeECC_V2: string;

declare var PKEncryptionSchemeRSA_V2: string;

declare const enum PKMerchantCapability {

	Capability3DS = 1,

	CapabilityEMV = 2,

	CapabilityCredit = 4,

	CapabilityDebit = 8
}

declare class PKObject extends NSObject {

	static alloc(): PKObject; // inherited from NSObject

	static new(): PKObject; // inherited from NSObject
}

declare class PKPass extends PKObject {

	static alloc(): PKPass; // inherited from NSObject

	static new(): PKPass; // inherited from NSObject

	/* readonly */ authenticationToken: string;

	/* readonly */ deviceName: string;

	/* readonly */ icon: UIImage;

	/* readonly */ localizedDescription: string;

	/* readonly */ localizedName: string;

	/* readonly */ organizationName: string;

	/* readonly */ passType: PKPassType;

	/* readonly */ passTypeIdentifier: string;

	/* readonly */ passURL: NSURL;

	/* readonly */ paymentPass: PKPaymentPass;

	/* readonly */ relevantDate: Date;

	/* readonly */ remotePass: boolean;

	/* readonly */ serialNumber: string;

	/* readonly */ userInfo: NSDictionary<any, any>;

	/* readonly */ webServiceURL: NSURL;

	constructor(o: { data: NSData; });

	initWithDataError(data: NSData): this;

	localizedValueForFieldKey(key: string): any;
}

declare const enum PKPassKitErrorCode {

	UnknownError = -1,

	InvalidDataError = 1,

	UnsupportedVersionError = 2,

	InvalidSignature = 3,

	NotEntitledError = 4
}

declare var PKPassKitErrorDomain: string;

declare class PKPassLibrary extends NSObject {

	static alloc(): PKPassLibrary; // inherited from NSObject

	static endAutomaticPassPresentationSuppressionWithRequestToken(requestToken: number): void;

	static isPassLibraryAvailable(): boolean;

	static isPaymentPassActivationAvailable(): boolean;

	static isSuppressingAutomaticPassPresentation(): boolean;

	static new(): PKPassLibrary; // inherited from NSObject

	static requestAutomaticPassPresentationSuppressionWithResponseHandler(responseHandler: (p1: PKAutomaticPassPresentationSuppressionResult) => void): number;

	activatePaymentPassWithActivationCodeCompletion(paymentPass: PKPaymentPass, activationCode: string, completion: (p1: boolean, p2: NSError) => void): void;

	activatePaymentPassWithActivationDataCompletion(paymentPass: PKPaymentPass, activationData: NSData, completion: (p1: boolean, p2: NSError) => void): void;

	addPassesWithCompletionHandler(passes: NSArray<PKPass>, completion: (p1: PKPassLibraryAddPassesStatus) => void): void;

	canAddPaymentPassWithPrimaryAccountIdentifier(primaryAccountIdentifier: string): boolean;

	containsPass(pass: PKPass): boolean;

	isPaymentPassActivationAvailable(): boolean;

	openPaymentSetup(): void;

	passWithPassTypeIdentifierSerialNumber(identifier: string, serialNumber: string): PKPass;

	passes(): NSArray<PKPass>;

	passesOfType(passType: PKPassType): NSArray<PKPass>;

	presentPaymentPass(pass: PKPaymentPass): void;

	remotePaymentPasses(): NSArray<PKPaymentPass>;

	removePass(pass: PKPass): void;

	replacePassWithPass(pass: PKPass): boolean;
}

declare const enum PKPassLibraryAddPassesStatus {

	DidAddPasses = 0,

	ShouldReviewPasses = 1,

	DidCancelAddPasses = 2
}

declare var PKPassLibraryAddedPassesUserInfoKey: string;

declare var PKPassLibraryDidChangeNotification: string;

declare var PKPassLibraryPassTypeIdentifierUserInfoKey: string;

declare var PKPassLibraryRemotePaymentPassesDidChangeNotification: string;

declare var PKPassLibraryRemovedPassInfosUserInfoKey: string;

declare var PKPassLibraryReplacementPassesUserInfoKey: string;

declare var PKPassLibrarySerialNumberUserInfoKey: string;

declare const enum PKPassType {

	Barcode = 0,

	Payment = 1,

	Any = 4294967295
}

declare class PKPayment extends NSObject {

	static alloc(): PKPayment; // inherited from NSObject

	static new(): PKPayment; // inherited from NSObject

	/* readonly */ billingAddress: any;

	/* readonly */ billingContact: PKContact;

	/* readonly */ shippingAddress: any;

	/* readonly */ shippingContact: PKContact;

	/* readonly */ shippingMethod: PKShippingMethod;

	/* readonly */ token: PKPaymentToken;
}

declare class PKPaymentAuthorizationController extends NSObject {

	static alloc(): PKPaymentAuthorizationController; // inherited from NSObject

	static canMakePayments(): boolean;

	static canMakePaymentsUsingNetworks(supportedNetworks: NSArray<string>): boolean;

	static canMakePaymentsUsingNetworksCapabilities(supportedNetworks: NSArray<string>, capabilties: PKMerchantCapability): boolean;

	static new(): PKPaymentAuthorizationController; // inherited from NSObject

	delegate: PKPaymentAuthorizationControllerDelegate;

	constructor(o: { paymentRequest: PKPaymentRequest; });

	dismissWithCompletion(completion: () => void): void;

	initWithPaymentRequest(request: PKPaymentRequest): this;

	presentWithCompletion(completion: (p1: boolean) => void): void;
}

interface PKPaymentAuthorizationControllerDelegate extends NSObjectProtocol {

	paymentAuthorizationControllerDidAuthorizePaymentCompletion(controller: PKPaymentAuthorizationController, payment: PKPayment, completion: (p1: PKPaymentAuthorizationStatus) => void): void;

	paymentAuthorizationControllerDidFinish(controller: PKPaymentAuthorizationController): void;

	paymentAuthorizationControllerDidSelectPaymentMethodCompletion?(controller: PKPaymentAuthorizationController, paymentMethod: PKPaymentMethod, completion: (p1: NSArray<PKPaymentSummaryItem>) => void): void;

	paymentAuthorizationControllerDidSelectShippingContactCompletion?(controller: PKPaymentAuthorizationController, contact: PKContact, completion: (p1: PKPaymentAuthorizationStatus, p2: NSArray<PKShippingMethod>, p3: NSArray<PKPaymentSummaryItem>) => void): void;

	paymentAuthorizationControllerDidSelectShippingMethodCompletion?(controller: PKPaymentAuthorizationController, shippingMethod: PKShippingMethod, completion: (p1: PKPaymentAuthorizationStatus, p2: NSArray<PKPaymentSummaryItem>) => void): void;

	paymentAuthorizationControllerWillAuthorizePayment?(controller: PKPaymentAuthorizationController): void;
}
declare var PKPaymentAuthorizationControllerDelegate: {

	prototype: PKPaymentAuthorizationControllerDelegate;
};

declare const enum PKPaymentAuthorizationStatus {

	Success = 0,

	Failure = 1,

	InvalidBillingPostalAddress = 2,

	InvalidShippingPostalAddress = 3,

	InvalidShippingContact = 4,

	PINRequired = 5,

	PINIncorrect = 6,

	PINLockout = 7
}

declare class PKPaymentAuthorizationViewController extends UIViewController {

	static alloc(): PKPaymentAuthorizationViewController; // inherited from NSObject

	static canMakePayments(): boolean;

	static canMakePaymentsUsingNetworks(supportedNetworks: NSArray<string>): boolean;

	static canMakePaymentsUsingNetworksCapabilities(supportedNetworks: NSArray<string>, capabilties: PKMerchantCapability): boolean;

	static new(): PKPaymentAuthorizationViewController; // inherited from NSObject

	delegate: PKPaymentAuthorizationViewControllerDelegate;

	constructor(o: { paymentRequest: PKPaymentRequest; });

	initWithPaymentRequest(request: PKPaymentRequest): this;
}

interface PKPaymentAuthorizationViewControllerDelegate extends NSObjectProtocol {

	paymentAuthorizationViewControllerDidAuthorizePaymentCompletion(controller: PKPaymentAuthorizationViewController, payment: PKPayment, completion: (p1: PKPaymentAuthorizationStatus) => void): void;

	paymentAuthorizationViewControllerDidFinish(controller: PKPaymentAuthorizationViewController): void;

	paymentAuthorizationViewControllerDidSelectPaymentMethodCompletion?(controller: PKPaymentAuthorizationViewController, paymentMethod: PKPaymentMethod, completion: (p1: NSArray<PKPaymentSummaryItem>) => void): void;

	paymentAuthorizationViewControllerDidSelectShippingAddressCompletion?(controller: PKPaymentAuthorizationViewController, address: any, completion: (p1: PKPaymentAuthorizationStatus, p2: NSArray<PKShippingMethod>, p3: NSArray<PKPaymentSummaryItem>) => void): void;

	paymentAuthorizationViewControllerDidSelectShippingContactCompletion?(controller: PKPaymentAuthorizationViewController, contact: PKContact, completion: (p1: PKPaymentAuthorizationStatus, p2: NSArray<PKShippingMethod>, p3: NSArray<PKPaymentSummaryItem>) => void): void;

	paymentAuthorizationViewControllerDidSelectShippingMethodCompletion?(controller: PKPaymentAuthorizationViewController, shippingMethod: PKShippingMethod, completion: (p1: PKPaymentAuthorizationStatus, p2: NSArray<PKPaymentSummaryItem>) => void): void;

	paymentAuthorizationViewControllerWillAuthorizePayment?(controller: PKPaymentAuthorizationViewController): void;
}
declare var PKPaymentAuthorizationViewControllerDelegate: {

	prototype: PKPaymentAuthorizationViewControllerDelegate;
};

declare class PKPaymentButton extends UIButton {

	static alloc(): PKPaymentButton; // inherited from NSObject

	static appearance(): PKPaymentButton; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): PKPaymentButton; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): PKPaymentButton; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject>): PKPaymentButton; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): PKPaymentButton; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject>): PKPaymentButton; // inherited from UIAppearance

	static buttonWithType(buttonType: UIButtonType): PKPaymentButton; // inherited from UIButton

	static buttonWithTypeStyle(buttonType: PKPaymentButtonType, buttonStyle: PKPaymentButtonStyle): PKPaymentButton;

	static new(): PKPaymentButton; // inherited from NSObject

	constructor(o: { paymentButtonType: PKPaymentButtonType; paymentButtonStyle: PKPaymentButtonStyle; });

	initWithPaymentButtonTypePaymentButtonStyle(type: PKPaymentButtonType, style: PKPaymentButtonStyle): this;
}

declare const enum PKPaymentButtonStyle {

	White = 0,

	WhiteOutline = 1,

	Black = 2
}

declare const enum PKPaymentButtonType {

	Plain = 0,

	Buy = 1,

	SetUp = 2,

	InStore = 3
}

declare class PKPaymentMethod extends NSObject {

	static alloc(): PKPaymentMethod; // inherited from NSObject

	static new(): PKPaymentMethod; // inherited from NSObject

	/* readonly */ displayName: string;

	/* readonly */ network: string;

	/* readonly */ paymentPass: PKPaymentPass;

	/* readonly */ type: PKPaymentMethodType;
}

declare const enum PKPaymentMethodType {

	Unknown = 0,

	Debit = 1,

	Credit = 2,

	Prepaid = 3,

	Store = 4
}

declare var PKPaymentNetworkAmex: string;

declare var PKPaymentNetworkChinaUnionPay: string;

declare var PKPaymentNetworkDiscover: string;

declare var PKPaymentNetworkInterac: string;

declare var PKPaymentNetworkMasterCard: string;

declare var PKPaymentNetworkPrivateLabel: string;

declare var PKPaymentNetworkVisa: string;

declare class PKPaymentPass extends PKPass {

	static alloc(): PKPaymentPass; // inherited from NSObject

	static new(): PKPaymentPass; // inherited from NSObject

	/* readonly */ activationState: PKPaymentPassActivationState;

	/* readonly */ deviceAccountIdentifier: string;

	/* readonly */ deviceAccountNumberSuffix: string;

	/* readonly */ primaryAccountIdentifier: string;

	/* readonly */ primaryAccountNumberSuffix: string;
}

declare const enum PKPaymentPassActivationState {

	Activated = 0,

	RequiresActivation = 1,

	Activating = 2,

	Suspended = 3,

	Deactivated = 4
}

declare class PKPaymentRequest extends NSObject {

	static alloc(): PKPaymentRequest; // inherited from NSObject

	static availableNetworks(): NSArray<string>;

	static new(): PKPaymentRequest; // inherited from NSObject

	applicationData: NSData;

	billingAddress: any;

	billingContact: PKContact;

	countryCode: string;

	currencyCode: string;

	merchantCapabilities: PKMerchantCapability;

	merchantIdentifier: string;

	paymentSummaryItems: NSArray<PKPaymentSummaryItem>;

	requiredBillingAddressFields: PKAddressField;

	requiredShippingAddressFields: PKAddressField;

	shippingAddress: any;

	shippingContact: PKContact;

	shippingMethods: NSArray<PKShippingMethod>;

	shippingType: PKShippingType;

	supportedNetworks: NSArray<string>;
}

declare class PKPaymentSummaryItem extends NSObject {

	static alloc(): PKPaymentSummaryItem; // inherited from NSObject

	static new(): PKPaymentSummaryItem; // inherited from NSObject

	static summaryItemWithLabelAmount(label: string, amount: NSDecimalNumber): PKPaymentSummaryItem;

	static summaryItemWithLabelAmountType(label: string, amount: NSDecimalNumber, type: PKPaymentSummaryItemType): PKPaymentSummaryItem;

	amount: NSDecimalNumber;

	label: string;

	type: PKPaymentSummaryItemType;
}

declare const enum PKPaymentSummaryItemType {

	Final = 0,

	Pending = 1
}

declare class PKPaymentToken extends NSObject {

	static alloc(): PKPaymentToken; // inherited from NSObject

	static new(): PKPaymentToken; // inherited from NSObject

	/* readonly */ paymentData: NSData;

	/* readonly */ paymentInstrumentName: string;

	/* readonly */ paymentMethod: PKPaymentMethod;

	/* readonly */ paymentNetwork: string;

	/* readonly */ transactionIdentifier: string;
}

declare class PKShippingMethod extends PKPaymentSummaryItem {

	static alloc(): PKShippingMethod; // inherited from NSObject

	static new(): PKShippingMethod; // inherited from NSObject

	static summaryItemWithLabelAmount(label: string, amount: NSDecimalNumber): PKShippingMethod; // inherited from PKPaymentSummaryItem

	static summaryItemWithLabelAmountType(label: string, amount: NSDecimalNumber, type: PKPaymentSummaryItemType): PKShippingMethod; // inherited from PKPaymentSummaryItem

	detail: string;

	identifier: string;
}

declare const enum PKShippingType {

	Shipping = 0,

	Delivery = 1,

	StorePickup = 2,

	ServicePickup = 3
}
