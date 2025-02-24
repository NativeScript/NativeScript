
/**
 * @since 13.4
 */
declare class PKAddCarKeyPassConfiguration extends PKAddSecureElementPassConfiguration {

	static alloc(): PKAddCarKeyPassConfiguration; // inherited from NSObject

	static new(): PKAddCarKeyPassConfiguration; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	manufacturerIdentifier: string;

	password: string;

	/**
	 * @since 16.0
	 */
	provisioningTemplateIdentifier: string;

	/**
	 * @since 14.5
	 */
	supportedRadioTechnologies: PKRadioTechnology;
}

/**
 * @since 18.0
 */
declare class PKAddIdentityDocumentConfiguration extends PKAddSecureElementPassConfiguration {

	static alloc(): PKAddIdentityDocumentConfiguration; // inherited from NSObject

	static configurationForMetadataCompletion(metadata: PKIdentityDocumentMetadata, completion: (p1: PKAddIdentityDocumentConfiguration, p2: NSError) => void): void;

	static new(): PKAddIdentityDocumentConfiguration; // inherited from NSObject

	readonly metadata: PKIdentityDocumentMetadata;
}

/**
 * @since 9.0
 */
declare class PKAddPassButton extends UIButton {

	static addPassButtonWithStyle(addPassButtonStyle: PKAddPassButtonStyle): PKAddPassButton;

	static alloc(): PKAddPassButton; // inherited from NSObject

	static appearance(): PKAddPassButton; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): PKAddPassButton; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): PKAddPassButton; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): PKAddPassButton; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): PKAddPassButton; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): PKAddPassButton; // inherited from UIAppearance

	/**
	 * @since 15.0
	 */
	static buttonWithConfigurationPrimaryAction(configuration: UIButtonConfiguration, primaryAction: UIAction): PKAddPassButton; // inherited from UIButton

	static buttonWithType(buttonType: UIButtonType): PKAddPassButton; // inherited from UIButton

	/**
	 * @since 14.0
	 */
	static buttonWithTypePrimaryAction(buttonType: UIButtonType, primaryAction: UIAction): PKAddPassButton; // inherited from UIButton

	static new(): PKAddPassButton; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static systemButtonWithImageTargetAction(image: UIImage, target: any, action: string): PKAddPassButton; // inherited from UIButton

	/**
	 * @since 14.0
	 */
	static systemButtonWithPrimaryAction(primaryAction: UIAction): PKAddPassButton; // inherited from UIButton

	addPassButtonStyle: PKAddPassButtonStyle;

	constructor(o: { addPassButtonStyle: PKAddPassButtonStyle; });

	initWithAddPassButtonStyle(style: PKAddPassButtonStyle): this;
}

/**
 * @since 9.0
 */
declare const enum PKAddPassButtonStyle {

	Black = 0,

	BlackOutline = 1
}

/**
 * @since 18.0
 */
declare class PKAddPassMetadataPreview extends NSObject {

	static alloc(): PKAddPassMetadataPreview; // inherited from NSObject

	static new(): PKAddPassMetadataPreview; // inherited from NSObject

	static previewWithPassThumbnailLocalizedDescription(passThumbnail: any, description: string): PKAddPassMetadataPreview;

	readonly localizedDescription: string;

	readonly passThumbnailImage: any;

	constructor(o: { passThumbnail: any; localizedDescription: string; });

	initWithPassThumbnailLocalizedDescription(passThumbnail: any, description: string): this;
}

/**
 * @since 6.0
 */
declare class PKAddPassesViewController extends UIViewController {

	static alloc(): PKAddPassesViewController; // inherited from NSObject

	/**
	 * @since 8.0
	 */
	static canAddPasses(): boolean;

	static new(): PKAddPassesViewController; // inherited from NSObject

	delegate: PKAddPassesViewControllerDelegate;

	/**
	 * @since 16.4
	 */
	constructor(o: { issuerData: NSData; signature: NSData; });

	constructor(o: { pass: PKPass; });

	/**
	 * @since 7.0
	 */
	constructor(o: { passes: NSArray<PKPass> | PKPass[]; });

	/**
	 * @since 16.4
	 */
	initWithIssuerDataSignatureError(issuerData: NSData, signature: NSData): this;

	initWithPass(pass: PKPass): this;

	/**
	 * @since 7.0
	 */
	initWithPasses(passes: NSArray<PKPass> | PKPass[]): this;
}

interface PKAddPassesViewControllerDelegate extends NSObjectProtocol {

	addPassesViewControllerDidFinish?(controller: PKAddPassesViewController): void;
}
declare var PKAddPassesViewControllerDelegate: {

	prototype: PKAddPassesViewControllerDelegate;
};

/**
 * @since 9.0
 */
declare const enum PKAddPaymentPassError {

	Unsupported = 0,

	UserCancelled = 1,

	SystemCancelled = 2
}

/**
 * @since 9.0
 */
declare class PKAddPaymentPassRequest extends NSObject {

	static alloc(): PKAddPaymentPassRequest; // inherited from NSObject

	static new(): PKAddPaymentPassRequest; // inherited from NSObject

	activationData: NSData;

	encryptedPassData: NSData;

	ephemeralPublicKey: NSData;

	wrappedKey: NSData;
}

/**
 * @since 9.0
 */
declare class PKAddPaymentPassRequestConfiguration extends NSObject {

	static alloc(): PKAddPaymentPassRequestConfiguration; // inherited from NSObject

	static new(): PKAddPaymentPassRequestConfiguration; // inherited from NSObject

	/**
	 * @since 10.1
	 */
	cardDetails: NSArray<PKLabeledValue>;

	cardholderName: string;

	readonly encryptionScheme: string;

	localizedDescription: string;

	paymentNetwork: string;

	primaryAccountIdentifier: string;

	primaryAccountSuffix: string;

	/**
	 * @since 12.3
	 */
	productIdentifiers: NSSet<string>;

	/**
	 * @since 10.1
	 */
	requiresFelicaSecureElement: boolean;

	/**
	 * @since 12.0
	 */
	style: PKAddPaymentPassStyle;

	constructor(o: { encryptionScheme: string; });

	initWithEncryptionScheme(encryptionScheme: string): this;
}

/**
 * @since 12.0
 */
declare const enum PKAddPaymentPassStyle {

	Payment = 0,

	Access = 1
}

/**
 * @since 9.0
 */
declare class PKAddPaymentPassViewController extends UIViewController {

	static alloc(): PKAddPaymentPassViewController; // inherited from NSObject

	static canAddPaymentPass(): boolean;

	static new(): PKAddPaymentPassViewController; // inherited from NSObject

	delegate: PKAddPaymentPassViewControllerDelegate;

	constructor(o: { requestConfiguration: PKAddPaymentPassRequestConfiguration; delegate: PKAddPaymentPassViewControllerDelegate; });

	initWithRequestConfigurationDelegate(configuration: PKAddPaymentPassRequestConfiguration, delegate: PKAddPaymentPassViewControllerDelegate): this;
}

/**
 * @since 9.0
 */
interface PKAddPaymentPassViewControllerDelegate extends NSObjectProtocol {

	addPaymentPassViewControllerDidFinishAddingPaymentPassError(controller: PKAddPaymentPassViewController, pass: PKPaymentPass, error: NSError): void;

	addPaymentPassViewControllerGenerateRequestWithCertificateChainNonceNonceSignatureCompletionHandler(controller: PKAddPaymentPassViewController, certificates: NSArray<NSData> | NSData[], nonce: NSData, nonceSignature: NSData, handler: (p1: PKAddPaymentPassRequest) => void): void;
}
declare var PKAddPaymentPassViewControllerDelegate: {

	prototype: PKAddPaymentPassViewControllerDelegate;
};

/**
 * @since 13.4
 */
declare class PKAddSecureElementPassConfiguration extends NSObject {

	static alloc(): PKAddSecureElementPassConfiguration; // inherited from NSObject

	static new(): PKAddSecureElementPassConfiguration; // inherited from NSObject

	issuerIdentifier: string;

	localizedDescription: string;
}

/**
 * @since 13.4
 */
declare const enum PKAddSecureElementPassErrorCode {

	GenericError = 0,

	UnknownError = 0,

	UserCanceledError = 1,

	UnavailableError = 2,

	InvalidConfigurationError = 3,

	DeviceNotSupportedError = 4,

	DeviceNotReadyError = 5,

	OSVersionNotSupportedError = 6
}

/**
 * @since 13.4
 */
declare var PKAddSecureElementPassErrorDomain: string;

/**
 * @since 13.4
 */
declare class PKAddSecureElementPassViewController extends UIViewController {

	static alloc(): PKAddSecureElementPassViewController; // inherited from NSObject

	static canAddSecureElementPassWithConfiguration(configuration: PKAddSecureElementPassConfiguration): boolean;

	static new(): PKAddSecureElementPassViewController; // inherited from NSObject

	delegate: PKAddSecureElementPassViewControllerDelegate;

	constructor(o: { configuration: PKAddSecureElementPassConfiguration; delegate: PKAddSecureElementPassViewControllerDelegate; });

	initWithConfigurationDelegate(configuration: PKAddSecureElementPassConfiguration, delegate: PKAddSecureElementPassViewControllerDelegate): this;
}

/**
 * @since 13.4
 */
interface PKAddSecureElementPassViewControllerDelegate extends NSObjectProtocol {

	/**
	 * @since 13.4
	 * @deprecated 14.0
	 */
	addSecureElementPassViewControllerDidFinishAddingSecureElementPassError?(controller: PKAddSecureElementPassViewController, pass: PKSecureElementPass, error: NSError): void;

	addSecureElementPassViewControllerDidFinishAddingSecureElementPassesError(controller: PKAddSecureElementPassViewController, passes: NSArray<PKSecureElementPass> | PKSecureElementPass[], error: NSError): void;
}
declare var PKAddSecureElementPassViewControllerDelegate: {

	prototype: PKAddSecureElementPassViewControllerDelegate;
};

/**
 * @since 14.0
 */
declare class PKAddShareablePassConfiguration extends PKAddSecureElementPassConfiguration {

	static alloc(): PKAddShareablePassConfiguration; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	static configurationForPassMetadataPrimaryActionCompletion(passMetadata: NSArray<PKShareablePassMetadata> | PKShareablePassMetadata[], action: PKAddShareablePassConfigurationPrimaryAction, completion: (p1: PKAddShareablePassConfiguration, p2: NSError) => void): void;

	/**
	 * @since 14.0
	 * @deprecated 16.0
	 */
	static configurationForPassMetadataProvisioningPolicyIdentifierPrimaryActionCompletion(passMetadata: NSArray<PKShareablePassMetadata> | PKShareablePassMetadata[], provisioningPolicyIdentifier: string, action: PKAddShareablePassConfigurationPrimaryAction, completion: (p1: PKAddShareablePassConfiguration, p2: NSError) => void): void;

	static new(): PKAddShareablePassConfiguration; // inherited from NSObject

	readonly credentialsMetadata: NSArray<PKShareablePassMetadata>;

	readonly primaryAction: PKAddShareablePassConfigurationPrimaryAction;

	/**
	 * @since 14.0
	 * @deprecated 16.0
	 */
	readonly provisioningPolicyIdentifier: string;
}

/**
 * @since 14.0
 */
declare const enum PKAddShareablePassConfigurationPrimaryAction {

	Add = 0,

	Share = 1
}

/**
 * @since 8.0
 * @deprecated 11.0
 */
declare const enum PKAddressField {

	None = 0,

	PostalAddress = 1,

	Phone = 2,

	Email = 4,

	Name = 8,

	All = 15
}

/**
 * @since 17.0
 */
declare const enum PKApplePayLaterAvailability {

	Available = 0,

	UnavailableItemIneligible = 1,

	UnavailableRecurringTransaction = 2
}

/**
 * @since 9.0
 */
declare const enum PKAutomaticPassPresentationSuppressionResult {

	NotSupported = 0,

	AlreadyPresenting = 1,

	Denied = 2,

	Cancelled = 3,

	Success = 4
}

/**
 * @since 16.0
 */
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

/**
 * @since 16.0
 */
declare class PKAutomaticReloadPaymentSummaryItem extends PKPaymentSummaryItem {

	static alloc(): PKAutomaticReloadPaymentSummaryItem; // inherited from NSObject

	static new(): PKAutomaticReloadPaymentSummaryItem; // inherited from NSObject

	static summaryItemWithLabelAmount(label: string, amount: NSDecimalNumber): PKAutomaticReloadPaymentSummaryItem; // inherited from PKPaymentSummaryItem

	/**
	 * @since 9.0
	 */
	static summaryItemWithLabelAmountType(label: string, amount: NSDecimalNumber, type: PKPaymentSummaryItemType): PKAutomaticReloadPaymentSummaryItem; // inherited from PKPaymentSummaryItem

	thresholdAmount: NSDecimalNumber;
}

/**
 * @since 14.0
 */
declare const enum PKBarcodeEventConfigurationDataType {

	Unknown = 0,

	SigningKeyMaterial = 1,

	SigningCertificate = 2
}

/**
 * @since 14.0
 */
declare class PKBarcodeEventConfigurationRequest extends NSObject {

	static alloc(): PKBarcodeEventConfigurationRequest; // inherited from NSObject

	static new(): PKBarcodeEventConfigurationRequest; // inherited from NSObject

	readonly configurationData: NSData;

	readonly configurationDataType: PKBarcodeEventConfigurationDataType;

	readonly deviceAccountIdentifier: string;
}

/**
 * @since 14.0
 */
declare class PKBarcodeEventMetadataRequest extends NSObject {

	static alloc(): PKBarcodeEventMetadataRequest; // inherited from NSObject

	static new(): PKBarcodeEventMetadataRequest; // inherited from NSObject

	readonly deviceAccountIdentifier: string;

	readonly lastUsedBarcodeIdentifier: string;
}

/**
 * @since 14.0
 */
declare class PKBarcodeEventMetadataResponse extends NSObject {

	static alloc(): PKBarcodeEventMetadataResponse; // inherited from NSObject

	static new(): PKBarcodeEventMetadataResponse; // inherited from NSObject

	paymentInformation: NSData;

	constructor(o: { paymentInformation: NSData; });

	initWithPaymentInformation(paymentInformation: NSData): this;
}

/**
 * @since 14.0
 */
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

/**
 * @since 14.0
 */
declare class PKBarcodeEventSignatureResponse extends NSObject {

	static alloc(): PKBarcodeEventSignatureResponse; // inherited from NSObject

	static new(): PKBarcodeEventSignatureResponse; // inherited from NSObject

	signedData: NSData;

	constructor(o: { signedData: NSData; });

	initWithSignedData(signedData: NSData): this;
}

/**
 * @since 9.0
 */
declare class PKContact extends NSObject {

	static alloc(): PKContact; // inherited from NSObject

	static new(): PKContact; // inherited from NSObject

	emailAddress: string;

	name: NSPersonNameComponents;

	phoneNumber: CNPhoneNumber;

	postalAddress: CNPostalAddress;

	/**
	 * @since 9.2
	 * @deprecated 10.3
	 */
	supplementarySubLocality: string;
}

/**
 * @since 11.0
 */
declare var PKContactFieldEmailAddress: string;

/**
 * @since 11.0
 */
declare var PKContactFieldName: string;

/**
 * @since 11.0
 */
declare var PKContactFieldPhoneNumber: string;

/**
 * @since 11.0
 */
declare var PKContactFieldPhoneticName: string;

/**
 * @since 11.0
 */
declare var PKContactFieldPostalAddress: string;

/**
 * @since 15.0
 */
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

/**
 * @since 16.4
 */
declare class PKDeferredPaymentRequest extends NSObject {

	static alloc(): PKDeferredPaymentRequest; // inherited from NSObject

	static new(): PKDeferredPaymentRequest; // inherited from NSObject

	billingAgreement: string;

	deferredBilling: PKDeferredPaymentSummaryItem;

	freeCancellationDate: Date;

	freeCancellationDateTimeZone: NSTimeZone;

	managementURL: NSURL;

	paymentDescription: string;

	tokenNotificationURL: NSURL;

	constructor(o: { paymentDescription: string; deferredBilling: PKDeferredPaymentSummaryItem; managementURL: NSURL; });

	initWithPaymentDescriptionDeferredBillingManagementURL(paymentDescription: string, deferredBilling: PKDeferredPaymentSummaryItem, managementURL: NSURL): this;
}

/**
 * @since 15.0
 */
declare class PKDeferredPaymentSummaryItem extends PKPaymentSummaryItem {

	static alloc(): PKDeferredPaymentSummaryItem; // inherited from NSObject

	static new(): PKDeferredPaymentSummaryItem; // inherited from NSObject

	static summaryItemWithLabelAmount(label: string, amount: NSDecimalNumber): PKDeferredPaymentSummaryItem; // inherited from PKPaymentSummaryItem

	/**
	 * @since 9.0
	 */
	static summaryItemWithLabelAmountType(label: string, amount: NSDecimalNumber, type: PKPaymentSummaryItemType): PKDeferredPaymentSummaryItem; // inherited from PKPaymentSummaryItem

	deferredDate: Date;
}

/**
 * @since 17.0
 */
declare const enum PKDisbursementErrorCode {

	UnknownError = -1,

	UnsupportedCardError = 1,

	RecipientContactInvalidError = 2
}

/**
 * @since 17.0
 */
declare var PKDisbursementErrorContactFieldUserInfoKey: string;

/**
 * @since 17.0
 */
declare var PKDisbursementErrorDomain: string;

/**
 * @since 17.0
 */
declare class PKDisbursementRequest extends NSObject {

	static alloc(): PKDisbursementRequest; // inherited from NSObject

	static disbursementCardUnsupportedError(): NSError;

	static disbursementContactInvalidErrorWithContactFieldLocalizedDescription(field: string, localizedDescription: string): NSError;

	static new(): PKDisbursementRequest; // inherited from NSObject

	applicationData: NSData;

	currencyCode: string;

	merchantCapabilities: PKMerchantCapability;

	merchantIdentifier: string;

	recipientContact: PKContact;

	regionCode: string;

	requiredRecipientContactFields: NSArray<string>;

	summaryItems: NSArray<PKPaymentSummaryItem>;

	supportedNetworks: NSArray<string>;

	supportedRegions: NSArray<string>;

	constructor(o: { merchantIdentifier: string; currencyCode: string; regionCode: string; supportedNetworks: NSArray<string> | string[]; merchantCapabilities: PKMerchantCapability; summaryItems: NSArray<PKPaymentSummaryItem> | PKPaymentSummaryItem[]; });

	initWithMerchantIdentifierCurrencyCodeRegionCodeSupportedNetworksMerchantCapabilitiesSummaryItems(merchantIdentifier: string, currencyCode: string, regionCode: string, supportedNetworks: NSArray<string> | string[], merchantCapabilities: PKMerchantCapability, summaryItems: NSArray<PKPaymentSummaryItem> | PKPaymentSummaryItem[]): this;
}

/**
 * @since 17.0
 */
declare class PKDisbursementSummaryItem extends PKPaymentSummaryItem {

	static alloc(): PKDisbursementSummaryItem; // inherited from NSObject

	static new(): PKDisbursementSummaryItem; // inherited from NSObject

	static summaryItemWithLabelAmount(label: string, amount: NSDecimalNumber): PKDisbursementSummaryItem; // inherited from PKPaymentSummaryItem

	/**
	 * @since 9.0
	 */
	static summaryItemWithLabelAmountType(label: string, amount: NSDecimalNumber, type: PKPaymentSummaryItemType): PKDisbursementSummaryItem; // inherited from PKPaymentSummaryItem
}

/**
 * @since 9.0
 */
declare var PKEncryptionSchemeECC_V2: string;

/**
 * @since 10.0
 */
declare var PKEncryptionSchemeRSA_V2: string;

/**
 * @since 16.0
 */
declare class PKIdentityAuthorizationController extends NSObject {

	static alloc(): PKIdentityAuthorizationController; // inherited from NSObject

	static new(): PKIdentityAuthorizationController; // inherited from NSObject

	cancelRequest(): void;

	checkCanRequestDocumentCompletion(descriptor: PKIdentityDocumentDescriptor, completion: (p1: boolean) => void): void;

	requestDocumentCompletion(request: PKIdentityRequest, completion: (p1: PKIdentityDocument, p2: NSError) => void): void;
}

/**
 * @since 16.0
 */
declare class PKIdentityButton extends UIControl {

	static alloc(): PKIdentityButton; // inherited from NSObject

	static appearance(): PKIdentityButton; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): PKIdentityButton; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): PKIdentityButton; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): PKIdentityButton; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): PKIdentityButton; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): PKIdentityButton; // inherited from UIAppearance

	static buttonWithLabelStyle(label: PKIdentityButtonLabel, style: PKIdentityButtonStyle): PKIdentityButton;

	static new(): PKIdentityButton; // inherited from NSObject

	cornerRadius: number;

	constructor(o: { label: PKIdentityButtonLabel; style: PKIdentityButtonStyle; });

	initWithLabelStyle(label: PKIdentityButtonLabel, style: PKIdentityButtonStyle): this;
}

/**
 * @since 16.0
 */
declare const enum PKIdentityButtonLabel {

	VerifyIdentity = 0,

	Verify = 1,

	VerifyAge = 2,

	Continue = 3
}

/**
 * @since 16.0
 */
declare const enum PKIdentityButtonStyle {

	Black = 0,

	BlackOutline = 1
}

/**
 * @since 16.0
 */
declare class PKIdentityDocument extends NSObject {

	static alloc(): PKIdentityDocument; // inherited from NSObject

	static new(): PKIdentityDocument; // inherited from NSObject

	readonly encryptedData: NSData;
}

/**
 * @since 16.0
 */
interface PKIdentityDocumentDescriptor extends NSObjectProtocol {

	elements: NSArray<PKIdentityElement>;

	addElementsWithIntentToStore(elements: NSArray<PKIdentityElement> | PKIdentityElement[], intentToStore: PKIdentityIntentToStore): void;

	intentToStoreForElement(element: PKIdentityElement): PKIdentityIntentToStore;
}
declare var PKIdentityDocumentDescriptor: {

	prototype: PKIdentityDocumentDescriptor;
};

/**
 * @since 18.0
 */
declare class PKIdentityDocumentMetadata extends NSObject {

	static alloc(): PKIdentityDocumentMetadata; // inherited from NSObject

	static new(): PKIdentityDocumentMetadata; // inherited from NSObject

	readonly cardConfigurationIdentifier: string;

	readonly cardTemplateIdentifier: string;

	readonly credentialIdentifier: string;

	serverEnvironmentIdentifier: string;

	readonly sharingInstanceIdentifier: string;
}

/**
 * @since 16.0
 */
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

/**
 * @since 16.0
 */
declare class PKIdentityElement extends NSObject implements NSCopying {

	static ageThresholdElementWithAge(age: number): PKIdentityElement;

	static alloc(): PKIdentityElement; // inherited from NSObject

	static new(): PKIdentityElement; // inherited from NSObject

	static readonly addressElement: PKIdentityElement;

	static readonly ageElement: PKIdentityElement;

	static readonly dateOfBirthElement: PKIdentityElement;

	/**
	 * @since 17.2
	 */
	static readonly documentDHSComplianceStatusElement: PKIdentityElement;

	static readonly documentExpirationDateElement: PKIdentityElement;

	static readonly documentIssueDateElement: PKIdentityElement;

	static readonly documentNumberElement: PKIdentityElement;

	static readonly drivingPrivilegesElement: PKIdentityElement;

	static readonly familyNameElement: PKIdentityElement;

	static readonly givenNameElement: PKIdentityElement;

	static readonly issuingAuthorityElement: PKIdentityElement;

	static readonly portraitElement: PKIdentityElement;

	/**
	 * @since 17.2
	 */
	static readonly sexElement: PKIdentityElement;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 16.0
 */
declare const enum PKIdentityError {

	Unknown = 0,

	NotSupported = 1,

	Cancelled = 2,

	NetworkUnavailable = 3,

	NoElementsRequested = 4,

	RequestAlreadyInProgress = 5,

	InvalidNonce = 6,

	InvalidElement = 7,

	RegionNotSupported = 8
}

/**
 * @since 16.0
 */
declare var PKIdentityErrorDomain: string;

/**
 * @since 16.0
 */
declare class PKIdentityIntentToStore extends NSObject implements NSCopying {

	static alloc(): PKIdentityIntentToStore; // inherited from NSObject

	static mayStoreIntentForDays(days: number): PKIdentityIntentToStore;

	static new(): PKIdentityIntentToStore; // inherited from NSObject

	static readonly mayStoreIntent: PKIdentityIntentToStore;

	static readonly willNotStoreIntent: PKIdentityIntentToStore;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 18.0
 */
declare class PKIdentityNationalIDCardDescriptor extends NSObject implements PKIdentityDocumentDescriptor {

	static alloc(): PKIdentityNationalIDCardDescriptor; // inherited from NSObject

	static new(): PKIdentityNationalIDCardDescriptor; // inherited from NSObject

	regionCode: string;

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

/**
 * @since 16.0
 */
declare class PKIdentityRequest extends NSObject {

	static alloc(): PKIdentityRequest; // inherited from NSObject

	static new(): PKIdentityRequest; // inherited from NSObject

	descriptor: PKIdentityDocumentDescriptor;

	merchantIdentifier: string;

	nonce: NSData;
}

/**
 * @since 17.0
 */
declare class PKInstantFundsOutFeeSummaryItem extends PKPaymentSummaryItem {

	static alloc(): PKInstantFundsOutFeeSummaryItem; // inherited from NSObject

	static new(): PKInstantFundsOutFeeSummaryItem; // inherited from NSObject

	static summaryItemWithLabelAmount(label: string, amount: NSDecimalNumber): PKInstantFundsOutFeeSummaryItem; // inherited from PKPaymentSummaryItem

	/**
	 * @since 9.0
	 */
	static summaryItemWithLabelAmountType(label: string, amount: NSDecimalNumber, type: PKPaymentSummaryItemType): PKInstantFundsOutFeeSummaryItem; // inherited from PKPaymentSummaryItem
}

/**
 * @since 14.0
 */
interface PKIssuerProvisioningExtensionAuthorizationProviding extends NSObjectProtocol {

	completionHandler: (p1: PKIssuerProvisioningExtensionAuthorizationResult) => void;
}
declare var PKIssuerProvisioningExtensionAuthorizationProviding: {

	prototype: PKIssuerProvisioningExtensionAuthorizationProviding;
};

/**
 * @since 14.0
 */
declare const enum PKIssuerProvisioningExtensionAuthorizationResult {

	Canceled = 0,

	Authorized = 1
}

/**
 * @since 14.0
 */
declare class PKIssuerProvisioningExtensionHandler extends NSObject {

	static alloc(): PKIssuerProvisioningExtensionHandler; // inherited from NSObject

	static new(): PKIssuerProvisioningExtensionHandler; // inherited from NSObject

	generateAddPaymentPassRequestForPassEntryWithIdentifierConfigurationCertificateChainNonceNonceSignatureCompletionHandler(identifier: string, configuration: PKAddPaymentPassRequestConfiguration, certificates: NSArray<NSData> | NSData[], nonce: NSData, nonceSignature: NSData, completion: (p1: PKAddPaymentPassRequest) => void): void;

	passEntriesWithCompletion(completion: (p1: NSArray<PKIssuerProvisioningExtensionPassEntry>) => void): void;

	remotePassEntriesWithCompletion(completion: (p1: NSArray<PKIssuerProvisioningExtensionPassEntry>) => void): void;

	statusWithCompletion(completion: (p1: PKIssuerProvisioningExtensionStatus) => void): void;
}

/**
 * @since 14.0
 */
declare class PKIssuerProvisioningExtensionPassEntry extends NSObject {

	static alloc(): PKIssuerProvisioningExtensionPassEntry; // inherited from NSObject

	static new(): PKIssuerProvisioningExtensionPassEntry; // inherited from NSObject

	readonly art: any;

	readonly identifier: string;

	readonly title: string;
}

/**
 * @since 14.0
 */
declare class PKIssuerProvisioningExtensionPaymentPassEntry extends PKIssuerProvisioningExtensionPassEntry {

	static alloc(): PKIssuerProvisioningExtensionPaymentPassEntry; // inherited from NSObject

	static new(): PKIssuerProvisioningExtensionPaymentPassEntry; // inherited from NSObject

	readonly addRequestConfiguration: PKAddPaymentPassRequestConfiguration;

	constructor(o: { identifier: string; title: string; art: any; addRequestConfiguration: PKAddPaymentPassRequestConfiguration; });

	initWithIdentifierTitleArtAddRequestConfiguration(identifier: string, title: string, art: any, configuration: PKAddPaymentPassRequestConfiguration): this;
}

/**
 * @since 14.0
 */
declare class PKIssuerProvisioningExtensionStatus extends NSObject {

	static alloc(): PKIssuerProvisioningExtensionStatus; // inherited from NSObject

	static new(): PKIssuerProvisioningExtensionStatus; // inherited from NSObject

	passEntriesAvailable: boolean;

	remotePassEntriesAvailable: boolean;

	requiresAuthentication: boolean;
}

/**
 * @since 18.0
 */
declare class PKJapanIndividualNumberCardMetadata extends PKIdentityDocumentMetadata {

	static alloc(): PKJapanIndividualNumberCardMetadata; // inherited from NSObject

	static new(): PKJapanIndividualNumberCardMetadata; // inherited from NSObject

	authenticationPassword: string;

	preview: PKAddPassMetadataPreview;

	signingPassword: string;

	constructor(o: { provisioningCredentialIdentifier: string; sharingInstanceIdentifier: string; cardConfigurationIdentifier: string; preview: PKAddPassMetadataPreview; });

	constructor(o: { provisioningCredentialIdentifier: string; sharingInstanceIdentifier: string; cardTemplateIdentifier: string; preview: PKAddPassMetadataPreview; });

	initWithProvisioningCredentialIdentifierSharingInstanceIdentifierCardConfigurationIdentifierPreview(credentialIdentifier: string, sharingInstanceIdentifier: string, templateIdentifier: string, preview: PKAddPassMetadataPreview): this;

	initWithProvisioningCredentialIdentifierSharingInstanceIdentifierCardTemplateIdentifierPreview(credentialIdentifier: string, sharingInstanceIdentifier: string, templateIdentifier: string, preview: PKAddPassMetadataPreview): this;
}

/**
 * @since 10.1
 */
declare class PKLabeledValue extends NSObject {

	static alloc(): PKLabeledValue; // inherited from NSObject

	static new(): PKLabeledValue; // inherited from NSObject

	readonly label: string;

	readonly value: string;

	constructor(o: { label: string; value: string; });

	initWithLabelValue(label: string, value: string): this;
}

/**
 * @since 8.0
 */
declare const enum PKMerchantCapability {

	Capability3DS = 1,

	CapabilityEMV = 2,

	CapabilityCredit = 4,

	CapabilityDebit = 8,

	CapabilityInstantFundsOut = 128
}

/**
 * @since 18.0
 */
declare var PKMerchantCategoryCodeNone: number;

declare class PKObject extends NSObject {

	static alloc(): PKObject; // inherited from NSObject

	static new(): PKObject; // inherited from NSObject
}

declare class PKPass extends PKObject {

	static alloc(): PKPass; // inherited from NSObject

	static new(): PKPass; // inherited from NSObject

	readonly authenticationToken: string;

	/**
	 * @since 9.0
	 */
	readonly deviceName: string;

	readonly icon: UIImage;

	readonly localizedDescription: string;

	readonly localizedName: string;

	readonly organizationName: string;

	/**
	 * @since 8.0
	 */
	readonly passType: PKPassType;

	readonly passTypeIdentifier: string;

	readonly passURL: NSURL;

	/**
	 * @since 8.0
	 * @deprecated 100000
	 */
	readonly paymentPass: PKPaymentPass;

	/**
	 * @since 6.0
	 * @deprecated 18.0
	 */
	readonly relevantDate: Date;

	/**
	 * @since 9.0
	 */
	readonly remotePass: boolean;

	/**
	 * @since 13.4
	 */
	readonly secureElementPass: PKSecureElementPass;

	readonly serialNumber: string;

	/**
	 * @since 7.0
	 */
	readonly userInfo: NSDictionary<any, any>;

	readonly webServiceURL: NSURL;

	constructor(o: { data: NSData; });

	initWithDataError(data: NSData): this;

	localizedValueForFieldKey(key: string): any;
}

/**
 * @since 6.0
 */
declare const enum PKPassKitErrorCode {

	UnknownError = -1,

	InvalidDataError = 1,

	UnsupportedVersionError = 2,

	InvalidSignature = 3,

	NotEntitledError = 4
}

/**
 * @since 6.0
 */
declare var PKPassKitErrorDomain: string;

/**
 * @since 6.0
 */
declare class PKPassLibrary extends NSObject {

	static alloc(): PKPassLibrary; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	static endAutomaticPassPresentationSuppressionWithRequestToken(requestToken: number): void;

	/**
	 * @since 6.0
	 */
	static isPassLibraryAvailable(): boolean;

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static isPaymentPassActivationAvailable(): boolean;

	/**
	 * @since 9.0
	 */
	static isSuppressingAutomaticPassPresentation(): boolean;

	static new(): PKPassLibrary; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	static requestAutomaticPassPresentationSuppressionWithResponseHandler(responseHandler: (p1: PKAutomaticPassPresentationSuppressionResult) => void): number;

	/**
	 * @since 13.4
	 */
	readonly remoteSecureElementPasses: NSArray<PKSecureElementPass>;

	/**
	 * @since 13.4
	 */
	readonly secureElementPassActivationAvailable: boolean;

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	activatePaymentPassWithActivationCodeCompletion(paymentPass: PKPaymentPass, activationCode: string, completion: (p1: boolean, p2: NSError) => void): void;

	/**
	 * @since 8.0
	 * @deprecated 100000
	 */
	activatePaymentPassWithActivationDataCompletion(paymentPass: PKPaymentPass, activationData: NSData, completion: (p1: boolean, p2: NSError) => void): void;

	/**
	 * @since 13.4
	 */
	activateSecureElementPassWithActivationDataCompletion(secureElementPass: PKSecureElementPass, activationData: NSData, completion: (p1: boolean, p2: NSError) => void): void;

	/**
	 * @since 7.0
	 */
	addPassesWithCompletionHandler(passes: NSArray<PKPass> | PKPass[], completion: (p1: PKPassLibraryAddPassesStatus) => void): void;

	/**
	 * @since 10.1
	 */
	canAddFelicaPass(): boolean;

	/**
	 * @since 9.0
	 * @deprecated 100000
	 */
	canAddPaymentPassWithPrimaryAccountIdentifier(primaryAccountIdentifier: string): boolean;

	/**
	 * @since 13.4
	 */
	canAddSecureElementPassWithPrimaryAccountIdentifier(primaryAccountIdentifier: string): boolean;

	containsPass(pass: PKPass): boolean;

	/**
	 * @since 16.0
	 */
	encryptedServiceProviderDataForSecureElementPassCompletion(secureElementPass: PKSecureElementPass, completion: (p1: NSDictionary<any, any>, p2: NSError) => void): void;

	/**
	 * @since 9.0
	 * @deprecated 100000
	 */
	isPaymentPassActivationAvailable(): boolean;

	/**
	 * @since 8.3
	 */
	openPaymentSetup(): void;

	passWithPassTypeIdentifierSerialNumber(identifier: string, serialNumber: string): PKPass;

	passes(): NSArray<PKPass>;

	/**
	 * @since 8.0
	 */
	passesOfType(passType: PKPassType): NSArray<PKPass>;

	passesWithReaderIdentifier(readerIdentifier: string): NSSet<PKSecureElementPass>;

	/**
	 * @since 10.0
	 * @deprecated 100000
	 */
	presentPaymentPass(pass: PKPaymentPass): void;

	/**
	 * @since 13.4
	 */
	presentSecureElementPass(pass: PKSecureElementPass): void;

	/**
	 * @since 9.0
	 * @deprecated 100000
	 */
	remotePaymentPasses(): NSArray<PKPaymentPass>;

	removePass(pass: PKPass): void;

	replacePassWithPass(pass: PKPass): boolean;

	/**
	 * @since 15.0
	 */
	serviceProviderDataForSecureElementPassCompletion(secureElementPass: PKSecureElementPass, completion: (p1: NSData, p2: NSError) => void): void;

	/**
	 * @since 13.4
	 */
	signDataWithSecureElementPassCompletion(signData: NSData, secureElementPass: PKSecureElementPass, completion: (p1: NSData, p2: NSData, p3: NSError) => void): void;
}

/**
 * @since 7.0
 */
declare const enum PKPassLibraryAddPassesStatus {

	DidAddPasses = 0,

	ShouldReviewPasses = 1,

	DidCancelAddPasses = 2
}

/**
 * @since 6.0
 */
declare var PKPassLibraryAddedPassesUserInfoKey: string;

/**
 * @since 6.0
 */
declare var PKPassLibraryDidChangeNotification: string;

/**
 * @since 6.0
 */
declare var PKPassLibraryPassTypeIdentifierUserInfoKey: string;

/**
 * @since 15.0
 */
declare var PKPassLibraryRecoveredPassesUserInfoKey: string;

/**
 * @since 9.0
 */
declare var PKPassLibraryRemotePaymentPassesDidChangeNotification: string;

/**
 * @since 6.0
 */
declare var PKPassLibraryRemovedPassInfosUserInfoKey: string;

/**
 * @since 6.0
 */
declare var PKPassLibraryReplacementPassesUserInfoKey: string;

/**
 * @since 6.0
 */
declare var PKPassLibrarySerialNumberUserInfoKey: string;

/**
 * @since 8.0
 */
declare const enum PKPassType {

	Barcode = 0,

	SecureElement = 1,

	Payment = 1,

	Any = -1
}

/**
 * @since 17.0
 */
declare const enum PKPayLaterAction {

	LearnMore = 0,

	Calculator = 1
}

/**
 * @since 17.0
 */
declare const enum PKPayLaterDisplayStyle {

	Standard = 0,

	Badge = 1,

	Checkout = 2,

	Price = 3
}

/**
 * @since 17.0
 */
declare function PKPayLaterValidateAmount(amount: NSDecimalNumber, currencyCode: string, completion: (p1: boolean) => void): void;

/**
 * @since 17.0
 */
declare class PKPayLaterView extends UIView {

	static alloc(): PKPayLaterView; // inherited from NSObject

	static appearance(): PKPayLaterView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): PKPayLaterView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): PKPayLaterView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): PKPayLaterView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): PKPayLaterView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): PKPayLaterView; // inherited from UIAppearance

	static new(): PKPayLaterView; // inherited from NSObject

	action: PKPayLaterAction;

	amount: NSDecimalNumber;

	currencyCode: string;

	delegate: PKPayLaterViewDelegate;

	displayStyle: PKPayLaterDisplayStyle;

	constructor(o: { amount: NSDecimalNumber; currencyCode: string; });

	initWithAmountCurrencyCode(amount: NSDecimalNumber, currencyCode: string): this;
}

/**
 * @since 17.0
 */
interface PKPayLaterViewDelegate extends NSObjectProtocol {

	payLaterViewDidUpdateHeight(view: PKPayLaterView): void;
}
declare var PKPayLaterViewDelegate: {

	prototype: PKPayLaterViewDelegate;
};

/**
 * @since 8.0
 */
declare class PKPayment extends NSObject {

	static alloc(): PKPayment; // inherited from NSObject

	static new(): PKPayment; // inherited from NSObject

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	readonly billingAddress: any;

	/**
	 * @since 9.0
	 */
	readonly billingContact: PKContact;

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	readonly shippingAddress: any;

	/**
	 * @since 9.0
	 */
	readonly shippingContact: PKContact;

	readonly shippingMethod: PKShippingMethod;

	readonly token: PKPaymentToken;
}

/**
 * @since 10.0
 */
declare class PKPaymentAuthorizationController extends NSObject {

	static alloc(): PKPaymentAuthorizationController; // inherited from NSObject

	static canMakePayments(): boolean;

	static canMakePaymentsUsingNetworks(supportedNetworks: NSArray<string> | string[]): boolean;

	static canMakePaymentsUsingNetworksCapabilities(supportedNetworks: NSArray<string> | string[], capabilties: PKMerchantCapability): boolean;

	static new(): PKPaymentAuthorizationController; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	static supportsDisbursements(): boolean;

	/**
	 * @since 17.0
	 */
	static supportsDisbursementsUsingNetworks(supportedNetworks: NSArray<string> | string[]): boolean;

	/**
	 * @since 17.0
	 */
	static supportsDisbursementsUsingNetworksCapabilities(supportedNetworks: NSArray<string> | string[], capabilties: PKMerchantCapability): boolean;

	delegate: PKPaymentAuthorizationControllerDelegate;

	/**
	 * @since 17.0
	 */
	constructor(o: { disbursementRequest: PKDisbursementRequest; });

	constructor(o: { paymentRequest: PKPaymentRequest; });

	dismissWithCompletion(completion: () => void): void;

	/**
	 * @since 17.0
	 */
	initWithDisbursementRequest(request: PKDisbursementRequest): this;

	initWithPaymentRequest(request: PKPaymentRequest): this;

	presentWithCompletion(completion: (p1: boolean) => void): void;
}

interface PKPaymentAuthorizationControllerDelegate extends NSObjectProtocol {

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	paymentAuthorizationControllerDidAuthorizePaymentCompletion?(controller: PKPaymentAuthorizationController, payment: PKPayment, completion: (p1: PKPaymentAuthorizationStatus) => void): void;

	/**
	 * @since 11.0
	 */
	paymentAuthorizationControllerDidAuthorizePaymentHandler?(controller: PKPaymentAuthorizationController, payment: PKPayment, completion: (p1: PKPaymentAuthorizationResult) => void): void;

	/**
	 * @since 15.0
	 */
	paymentAuthorizationControllerDidChangeCouponCodeHandler?(controller: PKPaymentAuthorizationController, couponCode: string, completion: (p1: PKPaymentRequestCouponCodeUpdate) => void): void;

	paymentAuthorizationControllerDidFinish(controller: PKPaymentAuthorizationController): void;

	/**
	 * @since 14.0
	 */
	paymentAuthorizationControllerDidRequestMerchantSessionUpdate?(controller: PKPaymentAuthorizationController, handler: (p1: PKPaymentRequestMerchantSessionUpdate) => void): void;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	paymentAuthorizationControllerDidSelectPaymentMethodCompletion?(controller: PKPaymentAuthorizationController, paymentMethod: PKPaymentMethod, completion: (p1: NSArray<PKPaymentSummaryItem>) => void): void;

	/**
	 * @since 11.0
	 */
	paymentAuthorizationControllerDidSelectPaymentMethodHandler?(controller: PKPaymentAuthorizationController, paymentMethod: PKPaymentMethod, completion: (p1: PKPaymentRequestPaymentMethodUpdate) => void): void;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	paymentAuthorizationControllerDidSelectShippingContactCompletion?(controller: PKPaymentAuthorizationController, contact: PKContact, completion: (p1: PKPaymentAuthorizationStatus, p2: NSArray<PKShippingMethod>, p3: NSArray<PKPaymentSummaryItem>) => void): void;

	/**
	 * @since 11.0
	 */
	paymentAuthorizationControllerDidSelectShippingContactHandler?(controller: PKPaymentAuthorizationController, contact: PKContact, completion: (p1: PKPaymentRequestShippingContactUpdate) => void): void;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	paymentAuthorizationControllerDidSelectShippingMethodCompletion?(controller: PKPaymentAuthorizationController, shippingMethod: PKShippingMethod, completion: (p1: PKPaymentAuthorizationStatus, p2: NSArray<PKPaymentSummaryItem>) => void): void;

	/**
	 * @since 11.0
	 */
	paymentAuthorizationControllerDidSelectShippingMethodHandler?(controller: PKPaymentAuthorizationController, shippingMethod: PKShippingMethod, completion: (p1: PKPaymentRequestShippingMethodUpdate) => void): void;

	paymentAuthorizationControllerWillAuthorizePayment?(controller: PKPaymentAuthorizationController): void;

	/**
	 * @since 14.0
	 */
	presentationWindowForPaymentAuthorizationController?(controller: PKPaymentAuthorizationController): UIWindow;
}
declare var PKPaymentAuthorizationControllerDelegate: {

	prototype: PKPaymentAuthorizationControllerDelegate;
};

/**
 * @since 11.0
 */
declare class PKPaymentAuthorizationResult extends NSObject {

	static alloc(): PKPaymentAuthorizationResult; // inherited from NSObject

	static new(): PKPaymentAuthorizationResult; // inherited from NSObject

	errors: NSArray<NSError>;

	/**
	 * @since 16.0
	 */
	orderDetails: PKPaymentOrderDetails;

	status: PKPaymentAuthorizationStatus;

	constructor(o: { status: PKPaymentAuthorizationStatus; errors: NSArray<NSError> | NSError[]; });

	initWithStatusErrors(status: PKPaymentAuthorizationStatus, errors: NSArray<NSError> | NSError[]): this;
}

/**
 * @since 8.0
 */
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

/**
 * @since 8.0
 */
declare class PKPaymentAuthorizationViewController extends UIViewController {

	static alloc(): PKPaymentAuthorizationViewController; // inherited from NSObject

	static canMakePayments(): boolean;

	static canMakePaymentsUsingNetworks(supportedNetworks: NSArray<string> | string[]): boolean;

	/**
	 * @since 9.0
	 */
	static canMakePaymentsUsingNetworksCapabilities(supportedNetworks: NSArray<string> | string[], capabilties: PKMerchantCapability): boolean;

	static new(): PKPaymentAuthorizationViewController; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	static supportsDisbursements(): boolean;

	/**
	 * @since 17.0
	 */
	static supportsDisbursementsUsingNetworks(supportedNetworks: NSArray<string> | string[]): boolean;

	/**
	 * @since 17.0
	 */
	static supportsDisbursementsUsingNetworksCapabilities(supportedNetworks: NSArray<string> | string[], capabilities: PKMerchantCapability): boolean;

	delegate: PKPaymentAuthorizationViewControllerDelegate;

	/**
	 * @since 17.0
	 */
	constructor(o: { disbursementRequest: PKDisbursementRequest; });

	constructor(o: { paymentRequest: PKPaymentRequest; });

	/**
	 * @since 17.0
	 */
	initWithDisbursementRequest(request: PKDisbursementRequest): this;

	initWithPaymentRequest(request: PKPaymentRequest): this;
}

interface PKPaymentAuthorizationViewControllerDelegate extends NSObjectProtocol {

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	paymentAuthorizationViewControllerDidAuthorizePaymentCompletion?(controller: PKPaymentAuthorizationViewController, payment: PKPayment, completion: (p1: PKPaymentAuthorizationStatus) => void): void;

	/**
	 * @since 11.0
	 */
	paymentAuthorizationViewControllerDidAuthorizePaymentHandler?(controller: PKPaymentAuthorizationViewController, payment: PKPayment, completion: (p1: PKPaymentAuthorizationResult) => void): void;

	/**
	 * @since 15.0
	 */
	paymentAuthorizationViewControllerDidChangeCouponCodeHandler?(controller: PKPaymentAuthorizationViewController, couponCode: string, completion: (p1: PKPaymentRequestCouponCodeUpdate) => void): void;

	paymentAuthorizationViewControllerDidFinish(controller: PKPaymentAuthorizationViewController): void;

	/**
	 * @since 14.0
	 */
	paymentAuthorizationViewControllerDidRequestMerchantSessionUpdate?(controller: PKPaymentAuthorizationViewController, handler: (p1: PKPaymentRequestMerchantSessionUpdate) => void): void;

	/**
	 * @since 9.0
	 * @deprecated 11.0
	 */
	paymentAuthorizationViewControllerDidSelectPaymentMethodCompletion?(controller: PKPaymentAuthorizationViewController, paymentMethod: PKPaymentMethod, completion: (p1: NSArray<PKPaymentSummaryItem>) => void): void;

	/**
	 * @since 11.0
	 */
	paymentAuthorizationViewControllerDidSelectPaymentMethodHandler?(controller: PKPaymentAuthorizationViewController, paymentMethod: PKPaymentMethod, completion: (p1: PKPaymentRequestPaymentMethodUpdate) => void): void;

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	paymentAuthorizationViewControllerDidSelectShippingAddressCompletion?(controller: PKPaymentAuthorizationViewController, address: any, completion: (p1: PKPaymentAuthorizationStatus, p2: NSArray<PKShippingMethod>, p3: NSArray<PKPaymentSummaryItem>) => void): void;

	/**
	 * @since 9.0
	 * @deprecated 11.0
	 */
	paymentAuthorizationViewControllerDidSelectShippingContactCompletion?(controller: PKPaymentAuthorizationViewController, contact: PKContact, completion: (p1: PKPaymentAuthorizationStatus, p2: NSArray<PKShippingMethod>, p3: NSArray<PKPaymentSummaryItem>) => void): void;

	/**
	 * @since 11.0
	 */
	paymentAuthorizationViewControllerDidSelectShippingContactHandler?(controller: PKPaymentAuthorizationViewController, contact: PKContact, completion: (p1: PKPaymentRequestShippingContactUpdate) => void): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	paymentAuthorizationViewControllerDidSelectShippingMethodCompletion?(controller: PKPaymentAuthorizationViewController, shippingMethod: PKShippingMethod, completion: (p1: PKPaymentAuthorizationStatus, p2: NSArray<PKPaymentSummaryItem>) => void): void;

	/**
	 * @since 11.0
	 */
	paymentAuthorizationViewControllerDidSelectShippingMethodHandler?(controller: PKPaymentAuthorizationViewController, shippingMethod: PKShippingMethod, completion: (p1: PKPaymentRequestShippingMethodUpdate) => void): void;

	/**
	 * @since 8.3
	 */
	paymentAuthorizationViewControllerWillAuthorizePayment?(controller: PKPaymentAuthorizationViewController): void;
}
declare var PKPaymentAuthorizationViewControllerDelegate: {

	prototype: PKPaymentAuthorizationViewControllerDelegate;
};

/**
 * @since 8.3
 */
declare class PKPaymentButton extends UIButton {

	static alloc(): PKPaymentButton; // inherited from NSObject

	static appearance(): PKPaymentButton; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): PKPaymentButton; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): PKPaymentButton; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): PKPaymentButton; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): PKPaymentButton; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): PKPaymentButton; // inherited from UIAppearance

	/**
	 * @since 15.0
	 */
	static buttonWithConfigurationPrimaryAction(configuration: UIButtonConfiguration, primaryAction: UIAction): PKPaymentButton; // inherited from UIButton

	static buttonWithType(buttonType: UIButtonType): PKPaymentButton; // inherited from UIButton

	/**
	 * @since 14.0
	 */
	static buttonWithTypePrimaryAction(buttonType: UIButtonType, primaryAction: UIAction): PKPaymentButton; // inherited from UIButton

	static buttonWithTypeStyle(buttonType: PKPaymentButtonType, buttonStyle: PKPaymentButtonStyle): PKPaymentButton;

	static new(): PKPaymentButton; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static systemButtonWithImageTargetAction(image: UIImage, target: any, action: string): PKPaymentButton; // inherited from UIButton

	/**
	 * @since 14.0
	 */
	static systemButtonWithPrimaryAction(primaryAction: UIAction): PKPaymentButton; // inherited from UIButton

	/**
	 * @since 12.0
	 */
	cornerRadius: number;

	/**
	 * @since 9.0
	 */
	constructor(o: { paymentButtonType: PKPaymentButtonType; paymentButtonStyle: PKPaymentButtonStyle; });

	/**
	 * @since 9.0
	 */
	initWithPaymentButtonTypePaymentButtonStyle(type: PKPaymentButtonType, style: PKPaymentButtonStyle): this;
}

/**
 * @since 8.3
 */
declare const enum PKPaymentButtonStyle {

	White = 0,

	WhiteOutline = 1,

	Black = 2,

	Automatic = 3
}

/**
 * @since 8.3
 */
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

/**
 * @since 11.0
 */
declare const enum PKPaymentErrorCode {

	UnknownError = -1,

	ShippingContactInvalidError = 1,

	BillingContactInvalidError = 2,

	ShippingAddressUnserviceableError = 3,

	CouponCodeInvalidError = 4,

	CouponCodeExpiredError = 5
}

/**
 * @since 11.0
 */
declare var PKPaymentErrorContactFieldUserInfoKey: string;

/**
 * @since 11.0
 */
declare var PKPaymentErrorDomain: string;

/**
 * @since 11.0
 */
declare var PKPaymentErrorPostalAddressUserInfoKey: string;

/**
 * @since 14.0
 */
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

/**
 * @since 14.0
 */
declare class PKPaymentMerchantSession extends NSObject {

	static alloc(): PKPaymentMerchantSession; // inherited from NSObject

	static new(): PKPaymentMerchantSession; // inherited from NSObject

	constructor(o: { dictionary: NSDictionary<any, any>; });

	initWithDictionary(dictionary: NSDictionary<any, any>): this;
}

/**
 * @since 9.0
 */
declare class PKPaymentMethod extends NSObject {

	static alloc(): PKPaymentMethod; // inherited from NSObject

	static new(): PKPaymentMethod; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	readonly billingAddress: CNContact;

	readonly displayName: string;

	readonly network: string;

	/**
	 * @since 8.0
	 * @deprecated 100000
	 */
	readonly paymentPass: PKPaymentPass;

	/**
	 * @since 13.4
	 */
	readonly secureElementPass: PKSecureElementPass;

	readonly type: PKPaymentMethodType;
}

/**
 * @since 9.0
 */
declare const enum PKPaymentMethodType {

	Unknown = 0,

	Debit = 1,

	Credit = 2,

	Prepaid = 3,

	Store = 4,

	EMoney = 5
}

/**
 * @since 8.0
 */
declare var PKPaymentNetworkAmex: string;

/**
 * @since 16.0
 * @deprecated 17.0
 */
declare var PKPaymentNetworkBancomat: string;

/**
 * @since 16.0
 */
declare var PKPaymentNetworkBancontact: string;

/**
 * @since 17.5
 */
declare var PKPaymentNetworkBankAxept: string;

/**
 * @since 14.0
 */
declare var PKPaymentNetworkBarcode: string;

/**
 * @since 10.3
 * @deprecated 11.0
 */
declare var PKPaymentNetworkCarteBancaire: string;

/**
 * @since 11.0
 * @deprecated 11.2
 */
declare var PKPaymentNetworkCarteBancaires: string;

/**
 * @since 11.2
 */
declare var PKPaymentNetworkCartesBancaires: string;

/**
 * @since 9.2
 */
declare var PKPaymentNetworkChinaUnionPay: string;

/**
 * @since 15.1
 */
declare var PKPaymentNetworkDankort: string;

/**
 * @since 9.0
 */
declare var PKPaymentNetworkDiscover: string;

/**
 * @since 12.0
 */
declare var PKPaymentNetworkEftpos: string;

/**
 * @since 12.0
 */
declare var PKPaymentNetworkElectron: string;

/**
 * @since 12.1.1
 */
declare var PKPaymentNetworkElo: string;

/**
 * @since 14.0
 */
declare var PKPaymentNetworkGirocard: string;

/**
 * @since 10.3
 */
declare var PKPaymentNetworkIDCredit: string;

/**
 * @since 9.2
 */
declare var PKPaymentNetworkInterac: string;

/**
 * @since 10.1
 */
declare var PKPaymentNetworkJCB: string;

/**
 * @since 12.1.1
 */
declare var PKPaymentNetworkMada: string;

/**
 * @since 12.0
 */
declare var PKPaymentNetworkMaestro: string;

/**
 * @since 8.0
 */
declare var PKPaymentNetworkMasterCard: string;

/**
 * @since 17.4
 */
declare var PKPaymentNetworkMeeza: string;

/**
 * @since 14.5
 */
declare var PKPaymentNetworkMir: string;

/**
 * @since 17.5
 */
declare var PKPaymentNetworkNAPAS: string;

/**
 * @since 15.0
 */
declare var PKPaymentNetworkNanaco: string;

/**
 * @since 17.0
 */
declare var PKPaymentNetworkPagoBancomat: string;

/**
 * @since 16.4
 */
declare var PKPaymentNetworkPostFinance: string;

/**
 * @since 9.0
 */
declare var PKPaymentNetworkPrivateLabel: string;

/**
 * @since 10.3
 */
declare var PKPaymentNetworkQuicPay: string;

/**
 * @since 10.1
 */
declare var PKPaymentNetworkSuica: string;

/**
 * @since 17.0
 */
declare var PKPaymentNetworkTmoney: string;

/**
 * @since 12.0
 */
declare var PKPaymentNetworkVPay: string;

/**
 * @since 8.0
 */
declare var PKPaymentNetworkVisa: string;

/**
 * @since 15.0
 */
declare var PKPaymentNetworkWaon: string;

/**
 * @since 16.0
 */
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

/**
 * @since 8.0
 */
declare class PKPaymentPass extends PKSecureElementPass {

	static alloc(): PKPaymentPass; // inherited from NSObject

	static new(): PKPaymentPass; // inherited from NSObject

	/**
	 * @since 8.0
	 * @deprecated 100000
	 */
	readonly activationState: PKPaymentPassActivationState;
}

/**
 * @since 8.0
 * @deprecated 100000
 */
declare const enum PKPaymentPassActivationState {

	Activated = 0,

	RequiresActivation = 1,

	Activating = 2,

	Suspended = 3,

	Deactivated = 4
}

/**
 * @since 8.0
 */
declare class PKPaymentRequest extends NSObject {

	static alloc(): PKPaymentRequest; // inherited from NSObject

	/**
	 * @since 10.0
	 */
	static availableNetworks(): NSArray<string>;

	static new(): PKPaymentRequest; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	static paymentBillingAddressInvalidErrorWithKeyLocalizedDescription(postalAddressKey: string, localizedDescription: string): NSError;

	/**
	 * @since 11.0
	 */
	static paymentContactInvalidErrorWithContactFieldLocalizedDescription(field: string, localizedDescription: string): NSError;

	/**
	 * @since 15.0
	 */
	static paymentCouponCodeExpiredErrorWithLocalizedDescription(localizedDescription: string): NSError;

	/**
	 * @since 15.0
	 */
	static paymentCouponCodeInvalidErrorWithLocalizedDescription(localizedDescription: string): NSError;

	/**
	 * @since 11.0
	 */
	static paymentShippingAddressInvalidErrorWithKeyLocalizedDescription(postalAddressKey: string, localizedDescription: string): NSError;

	/**
	 * @since 11.0
	 */
	static paymentShippingAddressUnserviceableErrorWithLocalizedDescription(localizedDescription: string): NSError;

	/**
	 * @since 17.0
	 */
	applePayLaterAvailability: PKApplePayLaterAvailability;

	applicationData: NSData;

	/**
	 * @since 16.0
	 */
	automaticReloadPaymentRequest: PKAutomaticReloadPaymentRequest;

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	billingAddress: any;

	/**
	 * @since 9.0
	 */
	billingContact: PKContact;

	countryCode: string;

	/**
	 * @since 15.0
	 */
	couponCode: string;

	currencyCode: string;

	/**
	 * @since 16.4
	 */
	deferredPaymentRequest: PKDeferredPaymentRequest;

	merchantCapabilities: PKMerchantCapability;

	/**
	 * @since 18.0
	 */
	merchantCategoryCode: number;

	merchantIdentifier: string;

	/**
	 * @since 16.0
	 */
	multiTokenContexts: NSArray<PKPaymentTokenContext>;

	paymentSummaryItems: NSArray<PKPaymentSummaryItem>;

	/**
	 * @since 16.0
	 */
	recurringPaymentRequest: PKRecurringPaymentRequest;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	requiredBillingAddressFields: PKAddressField;

	/**
	 * @since 11.0
	 */
	requiredBillingContactFields: NSSet<string>;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	requiredShippingAddressFields: PKAddressField;

	/**
	 * @since 11.0
	 */
	requiredShippingContactFields: NSSet<string>;

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	shippingAddress: any;

	/**
	 * @since 9.0
	 */
	shippingContact: PKContact;

	/**
	 * @since 15.0
	 */
	shippingContactEditingMode: PKShippingContactEditingMode;

	shippingMethods: NSArray<PKShippingMethod>;

	/**
	 * @since 8.3
	 */
	shippingType: PKShippingType;

	/**
	 * @since 11.0
	 */
	supportedCountries: NSSet<string>;

	supportedNetworks: NSArray<string>;

	/**
	 * @since 15.0
	 */
	supportsCouponCode: boolean;
}

/**
 * @since 15.0
 */
declare class PKPaymentRequestCouponCodeUpdate extends PKPaymentRequestUpdate {

	static alloc(): PKPaymentRequestCouponCodeUpdate; // inherited from NSObject

	static new(): PKPaymentRequestCouponCodeUpdate; // inherited from NSObject

	errors: NSArray<NSError>;

	constructor(o: { errors: NSArray<NSError> | NSError[]; paymentSummaryItems: NSArray<PKPaymentSummaryItem> | PKPaymentSummaryItem[]; shippingMethods: NSArray<PKShippingMethod> | PKShippingMethod[]; });

	initWithErrorsPaymentSummaryItemsShippingMethods(errors: NSArray<NSError> | NSError[], paymentSummaryItems: NSArray<PKPaymentSummaryItem> | PKPaymentSummaryItem[], shippingMethods: NSArray<PKShippingMethod> | PKShippingMethod[]): this;
}

/**
 * @since 14.0
 */
declare class PKPaymentRequestMerchantSessionUpdate extends NSObject {

	static alloc(): PKPaymentRequestMerchantSessionUpdate; // inherited from NSObject

	static new(): PKPaymentRequestMerchantSessionUpdate; // inherited from NSObject

	session: PKPaymentMerchantSession;

	status: PKPaymentAuthorizationStatus;

	constructor(o: { status: PKPaymentAuthorizationStatus; merchantSession: PKPaymentMerchantSession; });

	initWithStatusMerchantSession(status: PKPaymentAuthorizationStatus, session: PKPaymentMerchantSession): this;
}

/**
 * @since 11.0
 */
declare class PKPaymentRequestPaymentMethodUpdate extends PKPaymentRequestUpdate {

	static alloc(): PKPaymentRequestPaymentMethodUpdate; // inherited from NSObject

	static new(): PKPaymentRequestPaymentMethodUpdate; // inherited from NSObject

	errors: NSArray<NSError>;

	constructor(o: { errors: NSArray<NSError> | NSError[]; paymentSummaryItems: NSArray<PKPaymentSummaryItem> | PKPaymentSummaryItem[]; });

	initWithErrorsPaymentSummaryItems(errors: NSArray<NSError> | NSError[], paymentSummaryItems: NSArray<PKPaymentSummaryItem> | PKPaymentSummaryItem[]): this;
}

/**
 * @since 11.0
 */
declare class PKPaymentRequestShippingContactUpdate extends PKPaymentRequestUpdate {

	static alloc(): PKPaymentRequestShippingContactUpdate; // inherited from NSObject

	static new(): PKPaymentRequestShippingContactUpdate; // inherited from NSObject

	errors: NSArray<NSError>;

	constructor(o: { errors: NSArray<NSError> | NSError[]; paymentSummaryItems: NSArray<PKPaymentSummaryItem> | PKPaymentSummaryItem[]; shippingMethods: NSArray<PKShippingMethod> | PKShippingMethod[]; });

	initWithErrorsPaymentSummaryItemsShippingMethods(errors: NSArray<NSError> | NSError[], paymentSummaryItems: NSArray<PKPaymentSummaryItem> | PKPaymentSummaryItem[], shippingMethods: NSArray<PKShippingMethod> | PKShippingMethod[]): this;
}

/**
 * @since 11.0
 */
declare class PKPaymentRequestShippingMethodUpdate extends PKPaymentRequestUpdate {

	static alloc(): PKPaymentRequestShippingMethodUpdate; // inherited from NSObject

	static new(): PKPaymentRequestShippingMethodUpdate; // inherited from NSObject
}

/**
 * @since 11.0
 */
declare class PKPaymentRequestUpdate extends NSObject {

	static alloc(): PKPaymentRequestUpdate; // inherited from NSObject

	static new(): PKPaymentRequestUpdate; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	automaticReloadPaymentRequest: PKAutomaticReloadPaymentRequest;

	/**
	 * @since 16.4
	 */
	deferredPaymentRequest: PKDeferredPaymentRequest;

	/**
	 * @since 16.0
	 */
	multiTokenContexts: NSArray<PKPaymentTokenContext>;

	paymentSummaryItems: NSArray<PKPaymentSummaryItem>;

	/**
	 * @since 16.0
	 */
	recurringPaymentRequest: PKRecurringPaymentRequest;

	/**
	 * @since 15.0
	 */
	shippingMethods: NSArray<PKShippingMethod>;

	status: PKPaymentAuthorizationStatus;

	constructor(o: { paymentSummaryItems: NSArray<PKPaymentSummaryItem> | PKPaymentSummaryItem[]; });

	initWithPaymentSummaryItems(paymentSummaryItems: NSArray<PKPaymentSummaryItem> | PKPaymentSummaryItem[]): this;
}

/**
 * @since 8.0
 */
declare class PKPaymentSummaryItem extends NSObject {

	static alloc(): PKPaymentSummaryItem; // inherited from NSObject

	static new(): PKPaymentSummaryItem; // inherited from NSObject

	static summaryItemWithLabelAmount(label: string, amount: NSDecimalNumber): PKPaymentSummaryItem;

	/**
	 * @since 9.0
	 */
	static summaryItemWithLabelAmountType(label: string, amount: NSDecimalNumber, type: PKPaymentSummaryItemType): PKPaymentSummaryItem;

	amount: NSDecimalNumber;

	label: string;

	/**
	 * @since 9.0
	 */
	type: PKPaymentSummaryItemType;
}

/**
 * @since 9.0
 */
declare const enum PKPaymentSummaryItemType {

	Final = 0,

	Pending = 1
}

/**
 * @since 8.0
 */
declare class PKPaymentToken extends NSObject {

	static alloc(): PKPaymentToken; // inherited from NSObject

	static new(): PKPaymentToken; // inherited from NSObject

	readonly paymentData: NSData;

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	readonly paymentInstrumentName: string;

	/**
	 * @since 9.0
	 */
	readonly paymentMethod: PKPaymentMethod;

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	readonly paymentNetwork: string;

	readonly transactionIdentifier: string;
}

/**
 * @since 16.0
 */
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

/**
 * @since 14.5
 */
declare const enum PKRadioTechnology {

	None = 0,

	NFC = 1,

	Bluetooth = 2
}

/**
 * @since 16.0
 */
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

/**
 * @since 15.0
 */
declare class PKRecurringPaymentSummaryItem extends PKPaymentSummaryItem {

	static alloc(): PKRecurringPaymentSummaryItem; // inherited from NSObject

	static new(): PKRecurringPaymentSummaryItem; // inherited from NSObject

	static summaryItemWithLabelAmount(label: string, amount: NSDecimalNumber): PKRecurringPaymentSummaryItem; // inherited from PKPaymentSummaryItem

	/**
	 * @since 9.0
	 */
	static summaryItemWithLabelAmountType(label: string, amount: NSDecimalNumber, type: PKPaymentSummaryItemType): PKRecurringPaymentSummaryItem; // inherited from PKPaymentSummaryItem

	endDate: Date;

	intervalCount: number;

	intervalUnit: NSCalendarUnit;

	startDate: Date;
}

/**
 * @since 13.4
 */
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

/**
 * @since 13.4
 */
declare const enum PKSecureElementPassActivationState {

	Activated = 0,

	RequiresActivation = 1,

	Activating = 2,

	Suspended = 3,

	Deactivated = 4
}

/**
 * @since 16.0
 */
declare const enum PKShareSecureElementPassErrorCode {

	UnknownError = 0,

	SetupError = 1
}

/**
 * @since 16.0
 */
declare var PKShareSecureElementPassErrorDomain: string;

/**
 * @since 16.0
 */
declare const enum PKShareSecureElementPassResult {

	Canceled = 0,

	Shared = 1,

	Failed = 2
}

/**
 * @since 16.0
 */
declare class PKShareSecureElementPassViewController extends UIViewController {

	static alloc(): PKShareSecureElementPassViewController; // inherited from NSObject

	static new(): PKShareSecureElementPassViewController; // inherited from NSObject

	delegate: PKShareSecureElementPassViewControllerDelegate;

	promptToShareURL: boolean;

	constructor(o: { secureElementPass: PKSecureElementPass; delegate: PKShareSecureElementPassViewControllerDelegate; });

	initWithSecureElementPassDelegate(pass: PKSecureElementPass, delegate: PKShareSecureElementPassViewControllerDelegate): this;
}

/**
 * @since 16.0
 */
interface PKShareSecureElementPassViewControllerDelegate extends NSObjectProtocol {

	shareSecureElementPassViewControllerDidCreateShareURLActivationCode?(controller: PKShareSecureElementPassViewController, universalShareURL: NSURL, activationCode: string): void;

	shareSecureElementPassViewControllerDidFinishWithResult(controller: PKShareSecureElementPassViewController, result: PKShareSecureElementPassResult): void;
}
declare var PKShareSecureElementPassViewControllerDelegate: {

	prototype: PKShareSecureElementPassViewControllerDelegate;
};

/**
 * @since 14.0
 */
declare class PKShareablePassMetadata extends NSObject {

	static alloc(): PKShareablePassMetadata; // inherited from NSObject

	static new(): PKShareablePassMetadata; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	accountHash: string;

	readonly cardConfigurationIdentifier: string;

	/**
	 * @since 16.0
	 */
	readonly cardTemplateIdentifier: string;

	readonly credentialIdentifier: string;

	/**
	 * @since 14.0
	 * @deprecated 16.0
	 */
	readonly localizedDescription: string;

	/**
	 * @since 14.0
	 * @deprecated 16.0
	 */
	readonly ownerDisplayName: string;

	/**
	 * @since 14.0
	 * @deprecated 16.0
	 */
	readonly passThumbnailImage: any;

	/**
	 * @since 16.0
	 */
	readonly preview: PKShareablePassMetadataPreview;

	/**
	 * @since 15.0
	 */
	relyingPartyIdentifier: string;

	/**
	 * @since 15.0
	 */
	requiresUnifiedAccessCapableDevice: boolean;

	/**
	 * @since 16.0
	 */
	serverEnvironmentIdentifier: string;

	readonly sharingInstanceIdentifier: string;

	/**
	 * @since 15.0
	 * @deprecated 16.0
	 */
	readonly templateIdentifier: string;

	/**
	 * @since 14.0
	 * @deprecated 16.0
	 */
	constructor(o: { provisioningCredentialIdentifier: string; cardConfigurationIdentifier: string; sharingInstanceIdentifier: string; passThumbnailImage: any; ownerDisplayName: string; localizedDescription: string; });

	/**
	 * @since 16.0
	 */
	constructor(o: { provisioningCredentialIdentifier: string; sharingInstanceIdentifier: string; cardConfigurationIdentifier: string; preview: PKShareablePassMetadataPreview; });

	/**
	 * @since 16.0
	 */
	constructor(o: { provisioningCredentialIdentifier: string; sharingInstanceIdentifier: string; cardTemplateIdentifier: string; preview: PKShareablePassMetadataPreview; });

	/**
	 * @since 15.0
	 * @deprecated 16.0
	 */
	constructor(o: { provisioningCredentialIdentifier: string; sharingInstanceIdentifier: string; passThumbnailImage: any; ownerDisplayName: string; localizedDescription: string; accountHash: string; templateIdentifier: string; relyingPartyIdentifier: string; requiresUnifiedAccessCapableDevice: boolean; });

	/**
	 * @since 14.0
	 * @deprecated 16.0
	 */
	initWithProvisioningCredentialIdentifierCardConfigurationIdentifierSharingInstanceIdentifierPassThumbnailImageOwnerDisplayNameLocalizedDescription(credentialIdentifier: string, cardConfigurationIdentifier: string, sharingInstanceIdentifier: string, passThumbnailImage: any, ownerDisplayName: string, localizedDescription: string): this;

	/**
	 * @since 16.0
	 */
	initWithProvisioningCredentialIdentifierSharingInstanceIdentifierCardConfigurationIdentifierPreview(credentialIdentifier: string, sharingInstanceIdentifier: string, templateIdentifier: string, preview: PKShareablePassMetadataPreview): this;

	/**
	 * @since 16.0
	 */
	initWithProvisioningCredentialIdentifierSharingInstanceIdentifierCardTemplateIdentifierPreview(credentialIdentifier: string, sharingInstanceIdentifier: string, templateIdentifier: string, preview: PKShareablePassMetadataPreview): this;

	/**
	 * @since 15.0
	 * @deprecated 16.0
	 */
	initWithProvisioningCredentialIdentifierSharingInstanceIdentifierPassThumbnailImageOwnerDisplayNameLocalizedDescriptionAccountHashTemplateIdentifierRelyingPartyIdentifierRequiresUnifiedAccessCapableDevice(credentialIdentifier: string, sharingInstanceIdentifier: string, passThumbnailImage: any, ownerDisplayName: string, localizedDescription: string, accountHash: string, templateIdentifier: string, relyingPartyIdentifier: string, requiresUnifiedAccessCapableDevice: boolean): this;
}

/**
 * @since 16.0
 */
declare class PKShareablePassMetadataPreview extends PKAddPassMetadataPreview {

	static alloc(): PKShareablePassMetadataPreview; // inherited from NSObject

	static new(): PKShareablePassMetadataPreview; // inherited from NSObject

	static previewWithPassThumbnailLocalizedDescription(passThumbnail: any, description: string): PKShareablePassMetadataPreview; // inherited from PKAddPassMetadataPreview

	static previewWithTemplateIdentifier(templateIdentifier: string): PKShareablePassMetadataPreview;

	ownerDisplayName: string;

	readonly provisioningTemplateIdentifier: string;

	constructor(o: { templateIdentifier: string; });

	initWithTemplateIdentifier(templateIdentifier: string): this;
}

/**
 * @since 15.0
 */
declare const enum PKShippingContactEditingMode {

	Available = 1,

	StorePickup = 2,

	Enabled = 1
}

/**
 * @since 8.0
 */
declare class PKShippingMethod extends PKPaymentSummaryItem {

	static alloc(): PKShippingMethod; // inherited from NSObject

	static new(): PKShippingMethod; // inherited from NSObject

	static summaryItemWithLabelAmount(label: string, amount: NSDecimalNumber): PKShippingMethod; // inherited from PKPaymentSummaryItem

	/**
	 * @since 9.0
	 */
	static summaryItemWithLabelAmountType(label: string, amount: NSDecimalNumber, type: PKPaymentSummaryItemType): PKShippingMethod; // inherited from PKPaymentSummaryItem

	/**
	 * @since 15.0
	 */
	dateComponentsRange: PKDateComponentsRange;

	detail: string;

	identifier: string;
}

/**
 * @since 8.3
 */
declare const enum PKShippingType {

	Shipping = 0,

	Delivery = 1,

	StorePickup = 2,

	ServicePickup = 3
}

/**
 * @since 15.0
 */
declare class PKStoredValuePassBalance extends NSObject {

	static alloc(): PKStoredValuePassBalance; // inherited from NSObject

	static new(): PKStoredValuePassBalance; // inherited from NSObject

	readonly amount: NSDecimalNumber;

	readonly balanceType: string;

	readonly currencyCode: string;

	readonly expiryDate: Date;

	isEqualToBalance(balance: PKStoredValuePassBalance): boolean;
}

/**
 * @since 15.0
 */
declare var PKStoredValuePassBalanceTypeCash: string;

/**
 * @since 15.0
 */
declare var PKStoredValuePassBalanceTypeLoyaltyPoints: string;

/**
 * @since 15.0
 */
declare class PKStoredValuePassProperties extends NSObject {

	static alloc(): PKStoredValuePassProperties; // inherited from NSObject

	static new(): PKStoredValuePassProperties; // inherited from NSObject

	static passPropertiesForPass(pass: PKPass): PKStoredValuePassProperties;

	readonly balances: NSArray<PKStoredValuePassBalance>;

	/**
	 * @since 15.0
	 * @deprecated 15.0
	 */
	readonly blacklisted: boolean;

	/**
	 * @since 15.0
	 */
	readonly blocked: boolean;

	readonly expirationDate: Date;
}

/**
 * @since 10.1
 */
declare class PKSuicaPassProperties extends PKTransitPassProperties {

	static alloc(): PKSuicaPassProperties; // inherited from NSObject

	static new(): PKSuicaPassProperties; // inherited from NSObject

	static passPropertiesForPass(pass: PKPass): PKSuicaPassProperties; // inherited from PKStoredValuePassProperties

	/**
	 * @since 11.3
	 */
	readonly balanceAllowedForCommute: boolean;

	readonly greenCarTicketUsed: boolean;

	readonly inShinkansenStation: boolean;

	/**
	 * @since 11.3
	 */
	readonly lowBalanceGateNotificationEnabled: boolean;
}

/**
 * @since 11.3
 */
declare class PKTransitPassProperties extends PKStoredValuePassProperties {

	static alloc(): PKTransitPassProperties; // inherited from NSObject

	static new(): PKTransitPassProperties; // inherited from NSObject

	static passPropertiesForPass(pass: PKPass): PKTransitPassProperties; // inherited from PKStoredValuePassProperties

	readonly inStation: boolean;

	/**
	 * @since 11.3
	 * @deprecated 15.0
	 */
	readonly transitBalance: NSDecimalNumber;

	/**
	 * @since 11.3
	 * @deprecated 15.0
	 */
	readonly transitBalanceCurrencyCode: string;
}

/**
 * @since 15.4
 */
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

/**
 * @since 15.4
 */
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
