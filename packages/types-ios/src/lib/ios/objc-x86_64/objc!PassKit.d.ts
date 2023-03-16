
declare class PKAddCarKeyPassConfiguration extends PKAddSecureElementPassConfiguration {

	static alloc(): PKAddCarKeyPassConfiguration; // inherited from NSObject

	static new(): PKAddCarKeyPassConfiguration; // inherited from NSObject

	manufacturerIdentifier: string;

	password: string;

	provisioningTemplateIdentifier: string;

	supportedRadioTechnologies: PKRadioTechnology;
}

declare class PKAddPassButton extends UIButton {

	static addPassButtonWithStyle(addPassButtonStyle: PKAddPassButtonStyle): PKAddPassButton;

	static alloc(): PKAddPassButton; // inherited from NSObject

	static appearance(): PKAddPassButton; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): PKAddPassButton; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): PKAddPassButton; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): PKAddPassButton; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): PKAddPassButton; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): PKAddPassButton; // inherited from UIAppearance

	static buttonWithConfigurationPrimaryAction(configuration: UIButtonConfiguration, primaryAction: UIAction): PKAddPassButton; // inherited from UIButton

	static buttonWithType(buttonType: UIButtonType): PKAddPassButton; // inherited from UIButton

	static buttonWithTypePrimaryAction(buttonType: UIButtonType, primaryAction: UIAction): PKAddPassButton; // inherited from UIButton

	static new(): PKAddPassButton; // inherited from NSObject

	static systemButtonWithImageTargetAction(image: UIImage, target: any, action: string): PKAddPassButton; // inherited from UIButton

	static systemButtonWithPrimaryAction(primaryAction: UIAction): PKAddPassButton; // inherited from UIButton

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

	constructor(o: { passes: NSArray<PKPass> | PKPass[]; });

	initWithPass(pass: PKPass): this;

	initWithPasses(passes: NSArray<PKPass> | PKPass[]): this;
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

	cardDetails: NSArray<PKLabeledValue>;

	cardholderName: string;

	readonly encryptionScheme: string;

	localizedDescription: string;

	paymentNetwork: string;

	primaryAccountIdentifier: string;

	primaryAccountSuffix: string;

	productIdentifiers: NSSet<string>;

	requiresFelicaSecureElement: boolean;

	style: PKAddPaymentPassStyle;

	constructor(o: { encryptionScheme: string; });

	initWithEncryptionScheme(encryptionScheme: string): this;
}

declare const enum PKAddPaymentPassStyle {

	Payment = 0,

	Access = 1
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

	addPaymentPassViewControllerGenerateRequestWithCertificateChainNonceNonceSignatureCompletionHandler(controller: PKAddPaymentPassViewController, certificates: NSArray<NSData> | NSData[], nonce: NSData, nonceSignature: NSData, handler: (p1: PKAddPaymentPassRequest) => void): void;
}
declare var PKAddPaymentPassViewControllerDelegate: {

	prototype: PKAddPaymentPassViewControllerDelegate;
};

declare class PKAddSecureElementPassConfiguration extends NSObject {

	static alloc(): PKAddSecureElementPassConfiguration; // inherited from NSObject

	static new(): PKAddSecureElementPassConfiguration; // inherited from NSObject

	issuerIdentifier: string;

	localizedDescription: string;
}

declare const enum PKAddSecureElementPassErrorCode {

	UnknownError = 0,

	UserCanceledError = 1,

	UnavailableError = 2,

	InvalidConfigurationError = 3,

	DeviceNotSupportedError = 4,

	DeviceNotReadyError = 5,

	OSVersionNotSupportedError = 6
}

declare var PKAddSecureElementPassErrorDomain: string;

declare class PKAddSecureElementPassViewController extends UIViewController {

	static alloc(): PKAddSecureElementPassViewController; // inherited from NSObject

	static canAddSecureElementPassWithConfiguration(configuration: PKAddSecureElementPassConfiguration): boolean;

	static new(): PKAddSecureElementPassViewController; // inherited from NSObject

	delegate: PKAddSecureElementPassViewControllerDelegate;

	constructor(o: { configuration: PKAddSecureElementPassConfiguration; delegate: PKAddSecureElementPassViewControllerDelegate; });

	initWithConfigurationDelegate(configuration: PKAddSecureElementPassConfiguration, delegate: PKAddSecureElementPassViewControllerDelegate): this;
}

interface PKAddSecureElementPassViewControllerDelegate extends NSObjectProtocol {

	addSecureElementPassViewControllerDidFinishAddingSecureElementPassError?(controller: PKAddSecureElementPassViewController, pass: PKSecureElementPass, error: NSError): void;

	addSecureElementPassViewControllerDidFinishAddingSecureElementPassesError(controller: PKAddSecureElementPassViewController, passes: NSArray<PKSecureElementPass> | PKSecureElementPass[], error: NSError): void;
}
declare var PKAddSecureElementPassViewControllerDelegate: {

	prototype: PKAddSecureElementPassViewControllerDelegate;
};

declare class PKAddShareablePassConfiguration extends PKAddSecureElementPassConfiguration {

	static alloc(): PKAddShareablePassConfiguration; // inherited from NSObject

	static configurationForPassMetadataPrimaryActionCompletion(passMetadata: NSArray<PKShareablePassMetadata> | PKShareablePassMetadata[], action: PKAddShareablePassConfigurationPrimaryAction, completion: (p1: PKAddShareablePassConfiguration, p2: NSError) => void): void;

	static configurationForPassMetadataProvisioningPolicyIdentifierPrimaryActionCompletion(passMetadata: NSArray<PKShareablePassMetadata> | PKShareablePassMetadata[], provisioningPolicyIdentifier: string, action: PKAddShareablePassConfigurationPrimaryAction, completion: (p1: PKAddShareablePassConfiguration, p2: NSError) => void): void;

	static new(): PKAddShareablePassConfiguration; // inherited from NSObject

	readonly credentialsMetadata: NSArray<PKShareablePassMetadata>;

	readonly primaryAction: PKAddShareablePassConfigurationPrimaryAction;

	readonly provisioningPolicyIdentifier: string;
}

declare const enum PKAddShareablePassConfigurationPrimaryAction {

	Add = 0,

	Share = 1
}

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

declare class PKAutomaticReloadPaymentRequest extends NSObject {

	static alloc(): PKAutomaticReloadPaymentRequest; // inherited from NSObject

	static new(): PKAutomaticReloadPaymentRequest; // inherited from NSObject

	automaticReloadBilling: PKAutomaticReloadPaymentSummaryItem;

	billingAgreement: string;

	managementURL: NSURL;

	paymentDescription: string;

	tokenNotificationURL: NSURL;

	constructor(o: { paymentDescription: string; automaticReloadBilling: PKAutomaticReloadPaymentSummaryItem; managementURL: NSURL; });

	initWithPaymentDescriptionAutomaticReloadBillingManagementURL(paymentDescription: string, automaticReloadBilling: PKAutomaticReloadPaymentSummaryItem, managementURL: NSURL): this;
}

declare class PKAutomaticReloadPaymentSummaryItem extends PKPaymentSummaryItem {

	static alloc(): PKAutomaticReloadPaymentSummaryItem; // inherited from NSObject

	static new(): PKAutomaticReloadPaymentSummaryItem; // inherited from NSObject

	static summaryItemWithLabelAmount(label: string, amount: NSDecimalNumber): PKAutomaticReloadPaymentSummaryItem; // inherited from PKPaymentSummaryItem

	static summaryItemWithLabelAmountType(label: string, amount: NSDecimalNumber, type: PKPaymentSummaryItemType): PKAutomaticReloadPaymentSummaryItem; // inherited from PKPaymentSummaryItem

	thresholdAmount: NSDecimalNumber;
}

declare const enum PKBarcodeEventConfigurationDataType {

	Unknown = 0,

	SigningKeyMaterial = 1,

	SigningCertificate = 2
}

declare class PKBarcodeEventConfigurationRequest extends NSObject {

	static alloc(): PKBarcodeEventConfigurationRequest; // inherited from NSObject

	static new(): PKBarcodeEventConfigurationRequest; // inherited from NSObject

	readonly configurationData: NSData;

	readonly configurationDataType: PKBarcodeEventConfigurationDataType;

	readonly deviceAccountIdentifier: string;
}

declare class PKBarcodeEventMetadataRequest extends NSObject {

	static alloc(): PKBarcodeEventMetadataRequest; // inherited from NSObject

	static new(): PKBarcodeEventMetadataRequest; // inherited from NSObject

	readonly deviceAccountIdentifier: string;

	readonly lastUsedBarcodeIdentifier: string;
}

declare class PKBarcodeEventMetadataResponse extends NSObject {

	static alloc(): PKBarcodeEventMetadataResponse; // inherited from NSObject

	static new(): PKBarcodeEventMetadataResponse; // inherited from NSObject

	paymentInformation: NSData;

	constructor(o: { paymentInformation: NSData; });

	initWithPaymentInformation(paymentInformation: NSData): this;
}

declare class PKBarcodeEventSignatureRequest extends NSObject {

	static alloc(): PKBarcodeEventSignatureRequest; // inherited from NSObject

	static new(): PKBarcodeEventSignatureRequest; // inherited from NSObject

	readonly amount: number;

	readonly barcodeIdentifier: string;

	readonly currencyCode: string;

	readonly deviceAccountIdentifier: string;

	readonly merchantName: string;

	readonly partialSignature: NSData;

	readonly rawMerchantName: string;

	readonly transactionDate: Date;

	readonly transactionIdentifier: string;

	readonly transactionStatus: string;
}

declare class PKBarcodeEventSignatureResponse extends NSObject {

	static alloc(): PKBarcodeEventSignatureResponse; // inherited from NSObject

	static new(): PKBarcodeEventSignatureResponse; // inherited from NSObject

	signedData: NSData;

	constructor(o: { signedData: NSData; });

	initWithSignedData(signedData: NSData): this;
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

declare var PKContactFieldEmailAddress: string;

declare var PKContactFieldName: string;

declare var PKContactFieldPhoneNumber: string;

declare var PKContactFieldPhoneticName: string;

declare var PKContactFieldPostalAddress: string;

declare class PKDateComponentsRange extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): PKDateComponentsRange; // inherited from NSObject

	static new(): PKDateComponentsRange; // inherited from NSObject

	readonly endDateComponents: NSDateComponents;

	readonly startDateComponents: NSDateComponents;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { startDateComponents: NSDateComponents; endDateComponents: NSDateComponents; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithStartDateComponentsEndDateComponents(startDateComponents: NSDateComponents, endDateComponents: NSDateComponents): this;
}

declare class PKDeferredPaymentSummaryItem extends PKPaymentSummaryItem {

	static alloc(): PKDeferredPaymentSummaryItem; // inherited from NSObject

	static new(): PKDeferredPaymentSummaryItem; // inherited from NSObject

	static summaryItemWithLabelAmount(label: string, amount: NSDecimalNumber): PKDeferredPaymentSummaryItem; // inherited from PKPaymentSummaryItem

	static summaryItemWithLabelAmountType(label: string, amount: NSDecimalNumber, type: PKPaymentSummaryItemType): PKDeferredPaymentSummaryItem; // inherited from PKPaymentSummaryItem

	deferredDate: Date;
}

declare class PKDisbursementAuthorizationController extends NSObject {

	static alloc(): PKDisbursementAuthorizationController; // inherited from NSObject

	static new(): PKDisbursementAuthorizationController; // inherited from NSObject

	static supportsDisbursements(): boolean;

	readonly delegate: PKDisbursementAuthorizationControllerDelegate;

	constructor(o: { disbursementRequest: PKDisbursementRequest; delegate: PKDisbursementAuthorizationControllerDelegate; });

	authorizeDisbursementWithCompletion(completion: (p1: boolean, p2: NSError) => void): void;

	initWithDisbursementRequestDelegate(disbursementRequest: PKDisbursementRequest, delegate: PKDisbursementAuthorizationControllerDelegate): this;
}

interface PKDisbursementAuthorizationControllerDelegate extends NSObjectProtocol {

	disbursementAuthorizationControllerDidAuthorizeWithDisbursementVoucher(controller: PKDisbursementAuthorizationController, disbursementVoucher: PKDisbursementVoucher): void;

	disbursementAuthorizationControllerDidFinish(controller: PKDisbursementAuthorizationController): void;
}
declare var PKDisbursementAuthorizationControllerDelegate: {

	prototype: PKDisbursementAuthorizationControllerDelegate;
};

declare class PKDisbursementRequest extends NSObject {

	static alloc(): PKDisbursementRequest; // inherited from NSObject

	static new(): PKDisbursementRequest; // inherited from NSObject

	amount: NSDecimalNumber;

	countryCode: string;

	currencyCode: string;

	requestSchedule: PKDisbursementRequestSchedule;

	summaryItems: NSArray<PKPaymentSummaryItem>;
}

declare const enum PKDisbursementRequestSchedule {

	OneTime = 0,

	Future = 1
}

declare class PKDisbursementVoucher extends NSObject {

	static alloc(): PKDisbursementVoucher; // inherited from NSObject

	static new(): PKDisbursementVoucher; // inherited from NSObject

	readonly data: NSData;

	readonly redemptionURL: NSURL;
}

declare var PKEncryptionSchemeECC_V2: string;

declare var PKEncryptionSchemeRSA_V2: string;

declare class PKIdentityAuthorizationController extends NSObject {

	static alloc(): PKIdentityAuthorizationController; // inherited from NSObject

	static new(): PKIdentityAuthorizationController; // inherited from NSObject

	cancelRequest(): void;

	checkCanRequestDocumentCompletion(descriptor: PKIdentityDocumentDescriptor, completion: (p1: boolean) => void): void;

	requestDocumentCompletion(request: PKIdentityRequest, completion: (p1: PKIdentityDocument, p2: NSError) => void): void;
}

declare class PKIdentityButton extends UIControl {

	static alloc(): PKIdentityButton; // inherited from NSObject

	static appearance(): PKIdentityButton; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): PKIdentityButton; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): PKIdentityButton; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): PKIdentityButton; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): PKIdentityButton; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): PKIdentityButton; // inherited from UIAppearance

	static buttonWithLabelStyle(label: PKIdentityButtonLabel, style: PKIdentityButtonStyle): PKIdentityButton;

	static new(): PKIdentityButton; // inherited from NSObject

	cornerRadius: number;

	constructor(o: { label: PKIdentityButtonLabel; style: PKIdentityButtonStyle; });

	initWithLabelStyle(label: PKIdentityButtonLabel, style: PKIdentityButtonStyle): this;
}

declare const enum PKIdentityButtonLabel {

	VerifyIdentity = 0,

	Verify = 1,

	VerifyAge = 2,

	Continue = 3
}

declare const enum PKIdentityButtonStyle {

	Black = 0,

	BlackOutline = 1
}

declare class PKIdentityDocument extends NSObject {

	static alloc(): PKIdentityDocument; // inherited from NSObject

	static new(): PKIdentityDocument; // inherited from NSObject

	readonly encryptedData: NSData;
}

interface PKIdentityDocumentDescriptor extends NSObjectProtocol {

	elements: NSArray<PKIdentityElement>;

	addElementsWithIntentToStore(elements: NSArray<PKIdentityElement> | PKIdentityElement[], intentToStore: PKIdentityIntentToStore): void;

	intentToStoreForElement(element: PKIdentityElement): PKIdentityIntentToStore;
}
declare var PKIdentityDocumentDescriptor: {

	prototype: PKIdentityDocumentDescriptor;
};

declare class PKIdentityDriversLicenseDescriptor extends NSObject implements PKIdentityDocumentDescriptor {

	static alloc(): PKIdentityDriversLicenseDescriptor; // inherited from NSObject

	static new(): PKIdentityDriversLicenseDescriptor; // inherited from NSObject

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly elements: NSArray<PKIdentityElement>; // inherited from PKIdentityDocumentDescriptor

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	addElementsWithIntentToStore(elements: NSArray<PKIdentityElement> | PKIdentityElement[], intentToStore: PKIdentityIntentToStore): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	intentToStoreForElement(element: PKIdentityElement): PKIdentityIntentToStore;

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

declare class PKIdentityElement extends NSObject implements NSCopying {

	static ageThresholdElementWithAge(age: number): PKIdentityElement;

	static alloc(): PKIdentityElement; // inherited from NSObject

	static new(): PKIdentityElement; // inherited from NSObject

	static readonly addressElement: PKIdentityElement;

	static readonly ageElement: PKIdentityElement;

	static readonly dateOfBirthElement: PKIdentityElement;

	static readonly documentExpirationDateElement: PKIdentityElement;

	static readonly documentIssueDateElement: PKIdentityElement;

	static readonly documentNumberElement: PKIdentityElement;

	static readonly drivingPrivilegesElement: PKIdentityElement;

	static readonly familyNameElement: PKIdentityElement;

	static readonly givenNameElement: PKIdentityElement;

	static readonly issuingAuthorityElement: PKIdentityElement;

	static readonly portraitElement: PKIdentityElement;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare const enum PKIdentityError {

	Unknown = 0,

	NotSupported = 1,

	Cancelled = 2,

	NetworkUnavailable = 3,

	NoElementsRequested = 4,

	RequestAlreadyInProgress = 5,

	InvalidNonce = 6,

	InvalidElement = 7
}

declare var PKIdentityErrorDomain: string;

declare class PKIdentityIntentToStore extends NSObject implements NSCopying {

	static alloc(): PKIdentityIntentToStore; // inherited from NSObject

	static mayStoreIntentForDays(days: number): PKIdentityIntentToStore;

	static new(): PKIdentityIntentToStore; // inherited from NSObject

	static readonly mayStoreIntent: PKIdentityIntentToStore;

	static readonly willNotStoreIntent: PKIdentityIntentToStore;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class PKIdentityRequest extends NSObject {

	static alloc(): PKIdentityRequest; // inherited from NSObject

	static new(): PKIdentityRequest; // inherited from NSObject

	descriptor: PKIdentityDocumentDescriptor;

	merchantIdentifier: string;

	nonce: NSData;
}

interface PKIssuerProvisioningExtensionAuthorizationProviding extends NSObjectProtocol {

	completionHandler: (p1: PKIssuerProvisioningExtensionAuthorizationResult) => void;
}
declare var PKIssuerProvisioningExtensionAuthorizationProviding: {

	prototype: PKIssuerProvisioningExtensionAuthorizationProviding;
};

declare const enum PKIssuerProvisioningExtensionAuthorizationResult {

	Canceled = 0,

	Authorized = 1
}

declare class PKIssuerProvisioningExtensionHandler extends NSObject {

	static alloc(): PKIssuerProvisioningExtensionHandler; // inherited from NSObject

	static new(): PKIssuerProvisioningExtensionHandler; // inherited from NSObject

	generateAddPaymentPassRequestForPassEntryWithIdentifierConfigurationCertificateChainNonceNonceSignatureCompletionHandler(identifier: string, configuration: PKAddPaymentPassRequestConfiguration, certificates: NSArray<NSData> | NSData[], nonce: NSData, nonceSignature: NSData, completion: (p1: PKAddPaymentPassRequest) => void): void;

	passEntriesWithCompletion(completion: (p1: NSArray<PKIssuerProvisioningExtensionPassEntry>) => void): void;

	remotePassEntriesWithCompletion(completion: (p1: NSArray<PKIssuerProvisioningExtensionPassEntry>) => void): void;

	statusWithCompletion(completion: (p1: PKIssuerProvisioningExtensionStatus) => void): void;
}

declare class PKIssuerProvisioningExtensionPassEntry extends NSObject {

	static alloc(): PKIssuerProvisioningExtensionPassEntry; // inherited from NSObject

	static new(): PKIssuerProvisioningExtensionPassEntry; // inherited from NSObject

	readonly art: any;

	readonly identifier: string;

	readonly title: string;
}

declare class PKIssuerProvisioningExtensionPaymentPassEntry extends PKIssuerProvisioningExtensionPassEntry {

	static alloc(): PKIssuerProvisioningExtensionPaymentPassEntry; // inherited from NSObject

	static new(): PKIssuerProvisioningExtensionPaymentPassEntry; // inherited from NSObject

	readonly addRequestConfiguration: PKAddPaymentPassRequestConfiguration;

	constructor(o: { identifier: string; title: string; art: any; addRequestConfiguration: PKAddPaymentPassRequestConfiguration; });

	initWithIdentifierTitleArtAddRequestConfiguration(identifier: string, title: string, art: any, configuration: PKAddPaymentPassRequestConfiguration): this;
}

declare class PKIssuerProvisioningExtensionStatus extends NSObject {

	static alloc(): PKIssuerProvisioningExtensionStatus; // inherited from NSObject

	static new(): PKIssuerProvisioningExtensionStatus; // inherited from NSObject

	passEntriesAvailable: boolean;

	remotePassEntriesAvailable: boolean;

	requiresAuthentication: boolean;
}

declare class PKLabeledValue extends NSObject {

	static alloc(): PKLabeledValue; // inherited from NSObject

	static new(): PKLabeledValue; // inherited from NSObject

	readonly label: string;

	readonly value: string;

	constructor(o: { label: string; value: string; });

	initWithLabelValue(label: string, value: string): this;
}

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

	readonly authenticationToken: string;

	readonly deviceName: string;

	readonly icon: UIImage;

	readonly localizedDescription: string;

	readonly localizedName: string;

	readonly organizationName: string;

	readonly passType: PKPassType;

	readonly passTypeIdentifier: string;

	readonly passURL: NSURL;

	readonly paymentPass: PKPaymentPass;

	readonly relevantDate: Date;

	readonly remotePass: boolean;

	readonly secureElementPass: PKSecureElementPass;

	readonly serialNumber: string;

	readonly userInfo: NSDictionary<any, any>;

	readonly webServiceURL: NSURL;

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

	readonly remoteSecureElementPasses: NSArray<PKSecureElementPass>;

	readonly secureElementPassActivationAvailable: boolean;

	activatePaymentPassWithActivationCodeCompletion(paymentPass: PKPaymentPass, activationCode: string, completion: (p1: boolean, p2: NSError) => void): void;

	activatePaymentPassWithActivationDataCompletion(paymentPass: PKPaymentPass, activationData: NSData, completion: (p1: boolean, p2: NSError) => void): void;

	activateSecureElementPassWithActivationDataCompletion(secureElementPass: PKSecureElementPass, activationData: NSData, completion: (p1: boolean, p2: NSError) => void): void;

	addPassesWithCompletionHandler(passes: NSArray<PKPass> | PKPass[], completion: (p1: PKPassLibraryAddPassesStatus) => void): void;

	canAddFelicaPass(): boolean;

	canAddPaymentPassWithPrimaryAccountIdentifier(primaryAccountIdentifier: string): boolean;

	canAddSecureElementPassWithPrimaryAccountIdentifier(primaryAccountIdentifier: string): boolean;

	containsPass(pass: PKPass): boolean;

	encryptedServiceProviderDataForSecureElementPassCompletion(secureElementPass: PKSecureElementPass, completion: (p1: NSDictionary<any, any>, p2: NSError) => void): void;

	isPaymentPassActivationAvailable(): boolean;

	openPaymentSetup(): void;

	passWithPassTypeIdentifierSerialNumber(identifier: string, serialNumber: string): PKPass;

	passes(): NSArray<PKPass>;

	passesOfType(passType: PKPassType): NSArray<PKPass>;

	presentPaymentPass(pass: PKPaymentPass): void;

	presentSecureElementPass(pass: PKSecureElementPass): void;

	remotePaymentPasses(): NSArray<PKPaymentPass>;

	removePass(pass: PKPass): void;

	replacePassWithPass(pass: PKPass): boolean;

	serviceProviderDataForSecureElementPassCompletion(secureElementPass: PKSecureElementPass, completion: (p1: NSData, p2: NSError) => void): void;

	signDataWithSecureElementPassCompletion(signData: NSData, secureElementPass: PKSecureElementPass, completion: (p1: NSData, p2: NSData, p3: NSError) => void): void;
}

declare const enum PKPassLibraryAddPassesStatus {

	DidAddPasses = 0,

	ShouldReviewPasses = 1,

	DidCancelAddPasses = 2
}

declare var PKPassLibraryAddedPassesUserInfoKey: string;

declare var PKPassLibraryDidChangeNotification: string;

declare var PKPassLibraryPassTypeIdentifierUserInfoKey: string;

declare var PKPassLibraryRecoveredPassesUserInfoKey: string;

declare var PKPassLibraryRemotePaymentPassesDidChangeNotification: string;

declare var PKPassLibraryRemovedPassInfosUserInfoKey: string;

declare var PKPassLibraryReplacementPassesUserInfoKey: string;

declare var PKPassLibrarySerialNumberUserInfoKey: string;

declare const enum PKPassType {

	Barcode = 0,

	SecureElement = 1,

	Payment = 1,

	Any = -1
}

declare class PKPayment extends NSObject {

	static alloc(): PKPayment; // inherited from NSObject

	static new(): PKPayment; // inherited from NSObject

	readonly billingAddress: any;

	readonly billingContact: PKContact;

	readonly shippingAddress: any;

	readonly shippingContact: PKContact;

	readonly shippingMethod: PKShippingMethod;

	readonly token: PKPaymentToken;
}

declare class PKPaymentAuthorizationController extends NSObject {

	static alloc(): PKPaymentAuthorizationController; // inherited from NSObject

	static canMakePayments(): boolean;

	static canMakePaymentsUsingNetworks(supportedNetworks: NSArray<string> | string[]): boolean;

	static canMakePaymentsUsingNetworksCapabilities(supportedNetworks: NSArray<string> | string[], capabilties: PKMerchantCapability): boolean;

	static new(): PKPaymentAuthorizationController; // inherited from NSObject

	delegate: PKPaymentAuthorizationControllerDelegate;

	constructor(o: { paymentRequest: PKPaymentRequest; });

	dismissWithCompletion(completion: () => void): void;

	initWithPaymentRequest(request: PKPaymentRequest): this;

	presentWithCompletion(completion: (p1: boolean) => void): void;
}

interface PKPaymentAuthorizationControllerDelegate extends NSObjectProtocol {

	paymentAuthorizationControllerDidAuthorizePaymentCompletion?(controller: PKPaymentAuthorizationController, payment: PKPayment, completion: (p1: PKPaymentAuthorizationStatus) => void): void;

	paymentAuthorizationControllerDidAuthorizePaymentHandler?(controller: PKPaymentAuthorizationController, payment: PKPayment, completion: (p1: PKPaymentAuthorizationResult) => void): void;

	paymentAuthorizationControllerDidChangeCouponCodeHandler?(controller: PKPaymentAuthorizationController, couponCode: string, completion: (p1: PKPaymentRequestCouponCodeUpdate) => void): void;

	paymentAuthorizationControllerDidFinish(controller: PKPaymentAuthorizationController): void;

	paymentAuthorizationControllerDidRequestMerchantSessionUpdate?(controller: PKPaymentAuthorizationController, handler: (p1: PKPaymentRequestMerchantSessionUpdate) => void): void;

	paymentAuthorizationControllerDidSelectPaymentMethodCompletion?(controller: PKPaymentAuthorizationController, paymentMethod: PKPaymentMethod, completion: (p1: NSArray<PKPaymentSummaryItem>) => void): void;

	paymentAuthorizationControllerDidSelectPaymentMethodHandler?(controller: PKPaymentAuthorizationController, paymentMethod: PKPaymentMethod, completion: (p1: PKPaymentRequestPaymentMethodUpdate) => void): void;

	paymentAuthorizationControllerDidSelectShippingContactCompletion?(controller: PKPaymentAuthorizationController, contact: PKContact, completion: (p1: PKPaymentAuthorizationStatus, p2: NSArray<PKShippingMethod>, p3: NSArray<PKPaymentSummaryItem>) => void): void;

	paymentAuthorizationControllerDidSelectShippingContactHandler?(controller: PKPaymentAuthorizationController, contact: PKContact, completion: (p1: PKPaymentRequestShippingContactUpdate) => void): void;

	paymentAuthorizationControllerDidSelectShippingMethodCompletion?(controller: PKPaymentAuthorizationController, shippingMethod: PKShippingMethod, completion: (p1: PKPaymentAuthorizationStatus, p2: NSArray<PKPaymentSummaryItem>) => void): void;

	paymentAuthorizationControllerDidSelectShippingMethodHandler?(controller: PKPaymentAuthorizationController, shippingMethod: PKShippingMethod, completion: (p1: PKPaymentRequestShippingMethodUpdate) => void): void;

	paymentAuthorizationControllerWillAuthorizePayment?(controller: PKPaymentAuthorizationController): void;

	presentationWindowForPaymentAuthorizationController?(controller: PKPaymentAuthorizationController): UIWindow;
}
declare var PKPaymentAuthorizationControllerDelegate: {

	prototype: PKPaymentAuthorizationControllerDelegate;
};

declare class PKPaymentAuthorizationResult extends NSObject {

	static alloc(): PKPaymentAuthorizationResult; // inherited from NSObject

	static new(): PKPaymentAuthorizationResult; // inherited from NSObject

	errors: NSArray<NSError>;

	orderDetails: PKPaymentOrderDetails;

	status: PKPaymentAuthorizationStatus;

	constructor(o: { status: PKPaymentAuthorizationStatus; errors: NSArray<NSError> | NSError[]; });

	initWithStatusErrors(status: PKPaymentAuthorizationStatus, errors: NSArray<NSError> | NSError[]): this;
}

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

	static canMakePaymentsUsingNetworks(supportedNetworks: NSArray<string> | string[]): boolean;

	static canMakePaymentsUsingNetworksCapabilities(supportedNetworks: NSArray<string> | string[], capabilties: PKMerchantCapability): boolean;

	static new(): PKPaymentAuthorizationViewController; // inherited from NSObject

	delegate: PKPaymentAuthorizationViewControllerDelegate;

	constructor(o: { paymentRequest: PKPaymentRequest; });

	initWithPaymentRequest(request: PKPaymentRequest): this;
}

interface PKPaymentAuthorizationViewControllerDelegate extends NSObjectProtocol {

	paymentAuthorizationViewControllerDidAuthorizePaymentCompletion?(controller: PKPaymentAuthorizationViewController, payment: PKPayment, completion: (p1: PKPaymentAuthorizationStatus) => void): void;

	paymentAuthorizationViewControllerDidAuthorizePaymentHandler?(controller: PKPaymentAuthorizationViewController, payment: PKPayment, completion: (p1: PKPaymentAuthorizationResult) => void): void;

	paymentAuthorizationViewControllerDidChangeCouponCodeHandler?(controller: PKPaymentAuthorizationViewController, couponCode: string, completion: (p1: PKPaymentRequestCouponCodeUpdate) => void): void;

	paymentAuthorizationViewControllerDidFinish(controller: PKPaymentAuthorizationViewController): void;

	paymentAuthorizationViewControllerDidRequestMerchantSessionUpdate?(controller: PKPaymentAuthorizationViewController, handler: (p1: PKPaymentRequestMerchantSessionUpdate) => void): void;

	paymentAuthorizationViewControllerDidSelectPaymentMethodCompletion?(controller: PKPaymentAuthorizationViewController, paymentMethod: PKPaymentMethod, completion: (p1: NSArray<PKPaymentSummaryItem>) => void): void;

	paymentAuthorizationViewControllerDidSelectPaymentMethodHandler?(controller: PKPaymentAuthorizationViewController, paymentMethod: PKPaymentMethod, completion: (p1: PKPaymentRequestPaymentMethodUpdate) => void): void;

	paymentAuthorizationViewControllerDidSelectShippingAddressCompletion?(controller: PKPaymentAuthorizationViewController, address: any, completion: (p1: PKPaymentAuthorizationStatus, p2: NSArray<PKShippingMethod>, p3: NSArray<PKPaymentSummaryItem>) => void): void;

	paymentAuthorizationViewControllerDidSelectShippingContactCompletion?(controller: PKPaymentAuthorizationViewController, contact: PKContact, completion: (p1: PKPaymentAuthorizationStatus, p2: NSArray<PKShippingMethod>, p3: NSArray<PKPaymentSummaryItem>) => void): void;

	paymentAuthorizationViewControllerDidSelectShippingContactHandler?(controller: PKPaymentAuthorizationViewController, contact: PKContact, completion: (p1: PKPaymentRequestShippingContactUpdate) => void): void;

	paymentAuthorizationViewControllerDidSelectShippingMethodCompletion?(controller: PKPaymentAuthorizationViewController, shippingMethod: PKShippingMethod, completion: (p1: PKPaymentAuthorizationStatus, p2: NSArray<PKPaymentSummaryItem>) => void): void;

	paymentAuthorizationViewControllerDidSelectShippingMethodHandler?(controller: PKPaymentAuthorizationViewController, shippingMethod: PKShippingMethod, completion: (p1: PKPaymentRequestShippingMethodUpdate) => void): void;

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

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): PKPaymentButton; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): PKPaymentButton; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): PKPaymentButton; // inherited from UIAppearance

	static buttonWithConfigurationPrimaryAction(configuration: UIButtonConfiguration, primaryAction: UIAction): PKPaymentButton; // inherited from UIButton

	static buttonWithType(buttonType: UIButtonType): PKPaymentButton; // inherited from UIButton

	static buttonWithTypePrimaryAction(buttonType: UIButtonType, primaryAction: UIAction): PKPaymentButton; // inherited from UIButton

	static buttonWithTypeStyle(buttonType: PKPaymentButtonType, buttonStyle: PKPaymentButtonStyle): PKPaymentButton;

	static new(): PKPaymentButton; // inherited from NSObject

	static systemButtonWithImageTargetAction(image: UIImage, target: any, action: string): PKPaymentButton; // inherited from UIButton

	static systemButtonWithPrimaryAction(primaryAction: UIAction): PKPaymentButton; // inherited from UIButton

	cornerRadius: number;

	constructor(o: { paymentButtonType: PKPaymentButtonType; paymentButtonStyle: PKPaymentButtonStyle; });

	initWithPaymentButtonTypePaymentButtonStyle(type: PKPaymentButtonType, style: PKPaymentButtonStyle): this;
}

declare const enum PKPaymentButtonStyle {

	White = 0,

	WhiteOutline = 1,

	Black = 2,

	Automatic = 3
}

declare const enum PKPaymentButtonType {

	Plain = 0,

	Buy = 1,

	SetUp = 2,

	InStore = 3,

	Donate = 4,

	Checkout = 5,

	Book = 6,

	Subscribe = 7,

	Reload = 8,

	AddMoney = 9,

	TopUp = 10,

	Order = 11,

	Rent = 12,

	Support = 13,

	Contribute = 14,

	Tip = 15,

	Continue = 16
}

declare const enum PKPaymentErrorCode {

	UnknownError = -1,

	ShippingContactInvalidError = 1,

	BillingContactInvalidError = 2,

	ShippingAddressUnserviceableError = 3,

	CouponCodeInvalidError = 4,

	CouponCodeExpiredError = 5
}

declare var PKPaymentErrorContactFieldUserInfoKey: string;

declare var PKPaymentErrorDomain: string;

declare var PKPaymentErrorPostalAddressUserInfoKey: string;

declare class PKPaymentInformationEventExtension extends NSObject {

	static alloc(): PKPaymentInformationEventExtension; // inherited from NSObject

	static new(): PKPaymentInformationEventExtension; // inherited from NSObject
}

interface PKPaymentInformationRequestHandling {

	handleConfigurationRequestCompletion(configurationRequest: PKBarcodeEventConfigurationRequest, completion: () => void): void;

	handleInformationRequestCompletion(infoRequest: PKBarcodeEventMetadataRequest, completion: (p1: PKBarcodeEventMetadataResponse) => void): void;

	handleSignatureRequestCompletion(signatureRequest: PKBarcodeEventSignatureRequest, completion: (p1: PKBarcodeEventSignatureResponse) => void): void;
}
declare var PKPaymentInformationRequestHandling: {

	prototype: PKPaymentInformationRequestHandling;
};

declare class PKPaymentMerchantSession extends NSObject {

	static alloc(): PKPaymentMerchantSession; // inherited from NSObject

	static new(): PKPaymentMerchantSession; // inherited from NSObject

	constructor(o: { dictionary: NSDictionary<any, any>; });

	initWithDictionary(dictionary: NSDictionary<any, any>): this;
}

declare class PKPaymentMethod extends NSObject {

	static alloc(): PKPaymentMethod; // inherited from NSObject

	static new(): PKPaymentMethod; // inherited from NSObject

	readonly billingAddress: CNContact;

	readonly displayName: string;

	readonly network: string;

	readonly paymentPass: PKPaymentPass;

	readonly secureElementPass: PKSecureElementPass;

	readonly type: PKPaymentMethodType;
}

declare const enum PKPaymentMethodType {

	Unknown = 0,

	Debit = 1,

	Credit = 2,

	Prepaid = 3,

	Store = 4,

	EMoney = 5
}

declare var PKPaymentNetworkAmex: string;

declare var PKPaymentNetworkBancomat: string;

declare var PKPaymentNetworkBancontact: string;

declare var PKPaymentNetworkBarcode: string;

declare var PKPaymentNetworkCarteBancaire: string;

declare var PKPaymentNetworkCarteBancaires: string;

declare var PKPaymentNetworkCartesBancaires: string;

declare var PKPaymentNetworkChinaUnionPay: string;

declare var PKPaymentNetworkDankort: string;

declare var PKPaymentNetworkDiscover: string;

declare var PKPaymentNetworkEftpos: string;

declare var PKPaymentNetworkElectron: string;

declare var PKPaymentNetworkElo: string;

declare var PKPaymentNetworkGirocard: string;

declare var PKPaymentNetworkIDCredit: string;

declare var PKPaymentNetworkInterac: string;

declare var PKPaymentNetworkJCB: string;

declare var PKPaymentNetworkMada: string;

declare var PKPaymentNetworkMaestro: string;

declare var PKPaymentNetworkMasterCard: string;

declare var PKPaymentNetworkMir: string;

declare var PKPaymentNetworkNanaco: string;

declare var PKPaymentNetworkPrivateLabel: string;

declare var PKPaymentNetworkQuicPay: string;

declare var PKPaymentNetworkSuica: string;

declare var PKPaymentNetworkVPay: string;

declare var PKPaymentNetworkVisa: string;

declare var PKPaymentNetworkWaon: string;

declare class PKPaymentOrderDetails extends NSObject {

	static alloc(): PKPaymentOrderDetails; // inherited from NSObject

	static new(): PKPaymentOrderDetails; // inherited from NSObject

	authenticationToken: string;

	orderIdentifier: string;

	orderTypeIdentifier: string;

	webServiceURL: NSURL;

	constructor(o: { orderTypeIdentifier: string; orderIdentifier: string; webServiceURL: NSURL; authenticationToken: string; });

	initWithOrderTypeIdentifierOrderIdentifierWebServiceURLAuthenticationToken(orderTypeIdentifier: string, orderIdentifier: string, webServiceURL: NSURL, authenticationToken: string): this;
}

declare class PKPaymentPass extends PKSecureElementPass {

	static alloc(): PKPaymentPass; // inherited from NSObject

	static new(): PKPaymentPass; // inherited from NSObject

	readonly activationState: PKPaymentPassActivationState;
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

	static paymentBillingAddressInvalidErrorWithKeyLocalizedDescription(postalAddressKey: string, localizedDescription: string): NSError;

	static paymentContactInvalidErrorWithContactFieldLocalizedDescription(field: string, localizedDescription: string): NSError;

	static paymentCouponCodeExpiredErrorWithLocalizedDescription(localizedDescription: string): NSError;

	static paymentCouponCodeInvalidErrorWithLocalizedDescription(localizedDescription: string): NSError;

	static paymentShippingAddressInvalidErrorWithKeyLocalizedDescription(postalAddressKey: string, localizedDescription: string): NSError;

	static paymentShippingAddressUnserviceableErrorWithLocalizedDescription(localizedDescription: string): NSError;

	applicationData: NSData;

	automaticReloadPaymentRequest: PKAutomaticReloadPaymentRequest;

	billingAddress: any;

	billingContact: PKContact;

	countryCode: string;

	couponCode: string;

	currencyCode: string;

	merchantCapabilities: PKMerchantCapability;

	merchantIdentifier: string;

	multiTokenContexts: NSArray<PKPaymentTokenContext>;

	paymentSummaryItems: NSArray<PKPaymentSummaryItem>;

	recurringPaymentRequest: PKRecurringPaymentRequest;

	requiredBillingAddressFields: PKAddressField;

	requiredBillingContactFields: NSSet<string>;

	requiredShippingAddressFields: PKAddressField;

	requiredShippingContactFields: NSSet<string>;

	shippingAddress: any;

	shippingContact: PKContact;

	shippingContactEditingMode: PKShippingContactEditingMode;

	shippingMethods: NSArray<PKShippingMethod>;

	shippingType: PKShippingType;

	supportedCountries: NSSet<string>;

	supportedNetworks: NSArray<string>;

	supportsCouponCode: boolean;
}

declare class PKPaymentRequestCouponCodeUpdate extends PKPaymentRequestUpdate {

	static alloc(): PKPaymentRequestCouponCodeUpdate; // inherited from NSObject

	static new(): PKPaymentRequestCouponCodeUpdate; // inherited from NSObject

	errors: NSArray<NSError>;

	constructor(o: { errors: NSArray<NSError> | NSError[]; paymentSummaryItems: NSArray<PKPaymentSummaryItem> | PKPaymentSummaryItem[]; shippingMethods: NSArray<PKShippingMethod> | PKShippingMethod[]; });

	initWithErrorsPaymentSummaryItemsShippingMethods(errors: NSArray<NSError> | NSError[], paymentSummaryItems: NSArray<PKPaymentSummaryItem> | PKPaymentSummaryItem[], shippingMethods: NSArray<PKShippingMethod> | PKShippingMethod[]): this;
}

declare class PKPaymentRequestMerchantSessionUpdate extends NSObject {

	static alloc(): PKPaymentRequestMerchantSessionUpdate; // inherited from NSObject

	static new(): PKPaymentRequestMerchantSessionUpdate; // inherited from NSObject

	session: PKPaymentMerchantSession;

	status: PKPaymentAuthorizationStatus;

	constructor(o: { status: PKPaymentAuthorizationStatus; merchantSession: PKPaymentMerchantSession; });

	initWithStatusMerchantSession(status: PKPaymentAuthorizationStatus, session: PKPaymentMerchantSession): this;
}

declare class PKPaymentRequestPaymentMethodUpdate extends PKPaymentRequestUpdate {

	static alloc(): PKPaymentRequestPaymentMethodUpdate; // inherited from NSObject

	static new(): PKPaymentRequestPaymentMethodUpdate; // inherited from NSObject

	errors: NSArray<NSError>;

	constructor(o: { errors: NSArray<NSError> | NSError[]; paymentSummaryItems: NSArray<PKPaymentSummaryItem> | PKPaymentSummaryItem[]; });

	initWithErrorsPaymentSummaryItems(errors: NSArray<NSError> | NSError[], paymentSummaryItems: NSArray<PKPaymentSummaryItem> | PKPaymentSummaryItem[]): this;
}

declare class PKPaymentRequestShippingContactUpdate extends PKPaymentRequestUpdate {

	static alloc(): PKPaymentRequestShippingContactUpdate; // inherited from NSObject

	static new(): PKPaymentRequestShippingContactUpdate; // inherited from NSObject

	errors: NSArray<NSError>;

	constructor(o: { errors: NSArray<NSError> | NSError[]; paymentSummaryItems: NSArray<PKPaymentSummaryItem> | PKPaymentSummaryItem[]; shippingMethods: NSArray<PKShippingMethod> | PKShippingMethod[]; });

	initWithErrorsPaymentSummaryItemsShippingMethods(errors: NSArray<NSError> | NSError[], paymentSummaryItems: NSArray<PKPaymentSummaryItem> | PKPaymentSummaryItem[], shippingMethods: NSArray<PKShippingMethod> | PKShippingMethod[]): this;
}

declare class PKPaymentRequestShippingMethodUpdate extends PKPaymentRequestUpdate {

	static alloc(): PKPaymentRequestShippingMethodUpdate; // inherited from NSObject

	static new(): PKPaymentRequestShippingMethodUpdate; // inherited from NSObject
}

declare class PKPaymentRequestUpdate extends NSObject {

	static alloc(): PKPaymentRequestUpdate; // inherited from NSObject

	static new(): PKPaymentRequestUpdate; // inherited from NSObject

	automaticReloadPaymentRequest: PKAutomaticReloadPaymentRequest;

	multiTokenContexts: NSArray<PKPaymentTokenContext>;

	paymentSummaryItems: NSArray<PKPaymentSummaryItem>;

	recurringPaymentRequest: PKRecurringPaymentRequest;

	shippingMethods: NSArray<PKShippingMethod>;

	status: PKPaymentAuthorizationStatus;

	constructor(o: { paymentSummaryItems: NSArray<PKPaymentSummaryItem> | PKPaymentSummaryItem[]; });

	initWithPaymentSummaryItems(paymentSummaryItems: NSArray<PKPaymentSummaryItem> | PKPaymentSummaryItem[]): this;
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

	readonly paymentData: NSData;

	readonly paymentInstrumentName: string;

	readonly paymentMethod: PKPaymentMethod;

	readonly paymentNetwork: string;

	readonly transactionIdentifier: string;
}

declare class PKPaymentTokenContext extends NSObject {

	static alloc(): PKPaymentTokenContext; // inherited from NSObject

	static new(): PKPaymentTokenContext; // inherited from NSObject

	amount: NSDecimalNumber;

	externalIdentifier: string;

	merchantDomain: string;

	merchantIdentifier: string;

	merchantName: string;

	constructor(o: { merchantIdentifier: string; externalIdentifier: string; merchantName: string; merchantDomain: string; amount: NSDecimalNumber; });

	initWithMerchantIdentifierExternalIdentifierMerchantNameMerchantDomainAmount(merchantIdentifier: string, externalIdentifier: string, merchantName: string, merchantDomain: string, amount: NSDecimalNumber): this;
}

declare const enum PKRadioTechnology {

	None = 0,

	NFC = 1,

	Bluetooth = 2
}

declare class PKRecurringPaymentRequest extends NSObject {

	static alloc(): PKRecurringPaymentRequest; // inherited from NSObject

	static new(): PKRecurringPaymentRequest; // inherited from NSObject

	billingAgreement: string;

	managementURL: NSURL;

	paymentDescription: string;

	regularBilling: PKRecurringPaymentSummaryItem;

	tokenNotificationURL: NSURL;

	trialBilling: PKRecurringPaymentSummaryItem;

	constructor(o: { paymentDescription: string; regularBilling: PKRecurringPaymentSummaryItem; managementURL: NSURL; });

	initWithPaymentDescriptionRegularBillingManagementURL(paymentDescription: string, regularBilling: PKRecurringPaymentSummaryItem, managementURL: NSURL): this;
}

declare class PKRecurringPaymentSummaryItem extends PKPaymentSummaryItem {

	static alloc(): PKRecurringPaymentSummaryItem; // inherited from NSObject

	static new(): PKRecurringPaymentSummaryItem; // inherited from NSObject

	static summaryItemWithLabelAmount(label: string, amount: NSDecimalNumber): PKRecurringPaymentSummaryItem; // inherited from PKPaymentSummaryItem

	static summaryItemWithLabelAmountType(label: string, amount: NSDecimalNumber, type: PKPaymentSummaryItemType): PKRecurringPaymentSummaryItem; // inherited from PKPaymentSummaryItem

	endDate: Date;

	intervalCount: number;

	intervalUnit: NSCalendarUnit;

	startDate: Date;
}

declare class PKSecureElementPass extends PKPass {

	static alloc(): PKSecureElementPass; // inherited from NSObject

	static new(): PKSecureElementPass; // inherited from NSObject

	readonly deviceAccountIdentifier: string;

	readonly deviceAccountNumberSuffix: string;

	readonly devicePassIdentifier: string;

	readonly pairedTerminalIdentifier: string;

	readonly passActivationState: PKSecureElementPassActivationState;

	readonly primaryAccountIdentifier: string;

	readonly primaryAccountNumberSuffix: string;
}

declare const enum PKSecureElementPassActivationState {

	Activated = 0,

	RequiresActivation = 1,

	Activating = 2,

	Suspended = 3,

	Deactivated = 4
}

declare const enum PKShareSecureElementPassErrorCode {

	UnknownError = 0,

	SetupError = 1
}

declare var PKShareSecureElementPassErrorDomain: string;

declare const enum PKShareSecureElementPassResult {

	Canceled = 0,

	Shared = 1,

	Failed = 2
}

declare class PKShareSecureElementPassViewController extends UIViewController {

	static alloc(): PKShareSecureElementPassViewController; // inherited from NSObject

	static new(): PKShareSecureElementPassViewController; // inherited from NSObject

	delegate: PKShareSecureElementPassViewControllerDelegate;

	promptToShareURL: boolean;

	constructor(o: { secureElementPass: PKSecureElementPass; delegate: PKShareSecureElementPassViewControllerDelegate; });

	initWithSecureElementPassDelegate(pass: PKSecureElementPass, delegate: PKShareSecureElementPassViewControllerDelegate): this;
}

interface PKShareSecureElementPassViewControllerDelegate extends NSObjectProtocol {

	shareSecureElementPassViewControllerDidCreateShareURLActivationCode?(controller: PKShareSecureElementPassViewController, universalShareURL: NSURL, activationCode: string): void;

	shareSecureElementPassViewControllerDidFinishWithResult(controller: PKShareSecureElementPassViewController, result: PKShareSecureElementPassResult): void;
}
declare var PKShareSecureElementPassViewControllerDelegate: {

	prototype: PKShareSecureElementPassViewControllerDelegate;
};

declare class PKShareablePassMetadata extends NSObject {

	static alloc(): PKShareablePassMetadata; // inherited from NSObject

	static new(): PKShareablePassMetadata; // inherited from NSObject

	accountHash: string;

	readonly cardConfigurationIdentifier: string;

	readonly cardTemplateIdentifier: string;

	readonly credentialIdentifier: string;

	readonly localizedDescription: string;

	readonly ownerDisplayName: string;

	readonly passThumbnailImage: any;

	readonly preview: PKShareablePassMetadataPreview;

	relyingPartyIdentifier: string;

	requiresUnifiedAccessCapableDevice: boolean;

	serverEnvironmentIdentifier: string;

	readonly sharingInstanceIdentifier: string;

	readonly templateIdentifier: string;

	constructor(o: { provisioningCredentialIdentifier: string; cardConfigurationIdentifier: string; sharingInstanceIdentifier: string; passThumbnailImage: any; ownerDisplayName: string; localizedDescription: string; });

	constructor(o: { provisioningCredentialIdentifier: string; sharingInstanceIdentifier: string; cardConfigurationIdentifier: string; preview: PKShareablePassMetadataPreview; });

	constructor(o: { provisioningCredentialIdentifier: string; sharingInstanceIdentifier: string; cardTemplateIdentifier: string; preview: PKShareablePassMetadataPreview; });

	constructor(o: { provisioningCredentialIdentifier: string; sharingInstanceIdentifier: string; passThumbnailImage: any; ownerDisplayName: string; localizedDescription: string; accountHash: string; templateIdentifier: string; relyingPartyIdentifier: string; requiresUnifiedAccessCapableDevice: boolean; });

	initWithProvisioningCredentialIdentifierCardConfigurationIdentifierSharingInstanceIdentifierPassThumbnailImageOwnerDisplayNameLocalizedDescription(credentialIdentifier: string, cardConfigurationIdentifier: string, sharingInstanceIdentifier: string, passThumbnailImage: any, ownerDisplayName: string, localizedDescription: string): this;

	initWithProvisioningCredentialIdentifierSharingInstanceIdentifierCardConfigurationIdentifierPreview(credentialIdentifier: string, sharingInstanceIdentifier: string, templateIdentifier: string, preview: PKShareablePassMetadataPreview): this;

	initWithProvisioningCredentialIdentifierSharingInstanceIdentifierCardTemplateIdentifierPreview(credentialIdentifier: string, sharingInstanceIdentifier: string, templateIdentifier: string, preview: PKShareablePassMetadataPreview): this;

	initWithProvisioningCredentialIdentifierSharingInstanceIdentifierPassThumbnailImageOwnerDisplayNameLocalizedDescriptionAccountHashTemplateIdentifierRelyingPartyIdentifierRequiresUnifiedAccessCapableDevice(credentialIdentifier: string, sharingInstanceIdentifier: string, passThumbnailImage: any, ownerDisplayName: string, localizedDescription: string, accountHash: string, templateIdentifier: string, relyingPartyIdentifier: string, requiresUnifiedAccessCapableDevice: boolean): this;
}

declare class PKShareablePassMetadataPreview extends NSObject {

	static alloc(): PKShareablePassMetadataPreview; // inherited from NSObject

	static new(): PKShareablePassMetadataPreview; // inherited from NSObject

	static previewWithPassThumbnailLocalizedDescription(passThumbnail: any, description: string): PKShareablePassMetadataPreview;

	static previewWithTemplateIdentifier(templateIdentifier: string): PKShareablePassMetadataPreview;

	readonly localizedDescription: string;

	ownerDisplayName: string;

	readonly passThumbnailImage: any;

	readonly provisioningTemplateIdentifier: string;

	constructor(o: { passThumbnail: any; localizedDescription: string; });

	constructor(o: { templateIdentifier: string; });

	initWithPassThumbnailLocalizedDescription(passThumbnail: any, description: string): this;

	initWithTemplateIdentifier(templateIdentifier: string): this;
}

declare const enum PKShippingContactEditingMode {

	Enabled = 1,

	StorePickup = 2
}

declare class PKShippingMethod extends PKPaymentSummaryItem {

	static alloc(): PKShippingMethod; // inherited from NSObject

	static new(): PKShippingMethod; // inherited from NSObject

	static summaryItemWithLabelAmount(label: string, amount: NSDecimalNumber): PKShippingMethod; // inherited from PKPaymentSummaryItem

	static summaryItemWithLabelAmountType(label: string, amount: NSDecimalNumber, type: PKPaymentSummaryItemType): PKShippingMethod; // inherited from PKPaymentSummaryItem

	dateComponentsRange: PKDateComponentsRange;

	detail: string;

	identifier: string;
}

declare const enum PKShippingType {

	Shipping = 0,

	Delivery = 1,

	StorePickup = 2,

	ServicePickup = 3
}

declare class PKStoredValuePassBalance extends NSObject {

	static alloc(): PKStoredValuePassBalance; // inherited from NSObject

	static new(): PKStoredValuePassBalance; // inherited from NSObject

	readonly amount: NSDecimalNumber;

	readonly balanceType: string;

	readonly currencyCode: string;

	readonly expiryDate: Date;

	isEqualToBalance(balance: PKStoredValuePassBalance): boolean;
}

declare var PKStoredValuePassBalanceTypeCash: string;

declare var PKStoredValuePassBalanceTypeLoyaltyPoints: string;

declare class PKStoredValuePassProperties extends NSObject {

	static alloc(): PKStoredValuePassProperties; // inherited from NSObject

	static new(): PKStoredValuePassProperties; // inherited from NSObject

	static passPropertiesForPass(pass: PKPass): PKStoredValuePassProperties;

	readonly balances: NSArray<PKStoredValuePassBalance>;

	readonly blacklisted: boolean;

	readonly blocked: boolean;

	readonly expirationDate: Date;
}

declare class PKSuicaPassProperties extends PKTransitPassProperties {

	static alloc(): PKSuicaPassProperties; // inherited from NSObject

	static new(): PKSuicaPassProperties; // inherited from NSObject

	static passPropertiesForPass(pass: PKPass): PKSuicaPassProperties; // inherited from PKStoredValuePassProperties

	readonly balanceAllowedForCommute: boolean;

	readonly greenCarTicketUsed: boolean;

	readonly inShinkansenStation: boolean;

	readonly lowBalanceGateNotificationEnabled: boolean;
}

declare class PKTransitPassProperties extends PKStoredValuePassProperties {

	static alloc(): PKTransitPassProperties; // inherited from NSObject

	static new(): PKTransitPassProperties; // inherited from NSObject

	static passPropertiesForPass(pass: PKPass): PKTransitPassProperties; // inherited from PKStoredValuePassProperties

	readonly inStation: boolean;

	readonly transitBalance: NSDecimalNumber;

	readonly transitBalanceCurrencyCode: string;
}

interface PKVehicleConnectionDelegate extends NSObjectProtocol {

	sessionDidChangeConnectionState(newState: PKVehicleConnectionSessionConnectionState): void;

	sessionDidReceiveData(data: NSData): void;
}
declare var PKVehicleConnectionDelegate: {

	prototype: PKVehicleConnectionDelegate;
};

declare const enum PKVehicleConnectionErrorCode {

	Unknown = 0,

	SessionUnableToStart = 1,

	SessionNotActive = 2
}

declare class PKVehicleConnectionSession extends NSObject {

	static alloc(): PKVehicleConnectionSession; // inherited from NSObject

	static new(): PKVehicleConnectionSession; // inherited from NSObject

	static sessionForPassDelegateCompletion(pass: PKSecureElementPass, delegate: PKVehicleConnectionDelegate, completion: (p1: PKVehicleConnectionSession, p2: NSError) => void): void;

	readonly connectionStatus: PKVehicleConnectionSessionConnectionState;

	readonly delegate: PKVehicleConnectionDelegate;

	invalidate(): void;

	sendDataError(message: NSData): boolean;
}

declare const enum PKVehicleConnectionSessionConnectionState {

	Disconnected = 0,

	Connected = 1,

	Connecting = 2,

	FailedToConnect = 3
}
