
/**
 * @since 14.0
 */
declare var UTTagClassFilenameExtension: string;

/**
 * @since 14.0
 */
declare var UTTagClassMIMEType: string;

/**
 * @since 14.0
 */
declare class UTType extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UTType; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	static exportedTypeWithIdentifier(identifier: string): UTType;

	/**
	 * @since 14.0
	 */
	static exportedTypeWithIdentifierConformingToType(identifier: string, parentType: UTType): UTType;

	/**
	 * @since 14.0
	 */
	static importedTypeWithIdentifier(identifier: string): UTType;

	/**
	 * @since 14.0
	 */
	static importedTypeWithIdentifierConformingToType(identifier: string, parentType: UTType): UTType;

	static new(): UTType; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	static typeWithFilenameExtension(filenameExtension: string): UTType;

	/**
	 * @since 14.0
	 */
	static typeWithFilenameExtensionConformingToType(filenameExtension: string, supertype: UTType): UTType;

	/**
	 * @since 14.0
	 */
	static typeWithIdentifier(identifier: string): UTType;

	/**
	 * @since 14.0
	 */
	static typeWithMIMEType(mimeType: string): UTType;

	/**
	 * @since 14.0
	 */
	static typeWithMIMETypeConformingToType(mimeType: string, supertype: UTType): UTType;

	/**
	 * @since 14.0
	 */
	static typeWithTagTagClassConformingToType(tag: string, tagClass: string, supertype: UTType): UTType;

	/**
	 * @since 14.0
	 */
	static typesWithTagTagClassConformingToType(tag: string, tagClass: string, supertype: UTType): NSArray<UTType>;

	/**
	 * @since 14.0
	 */
	readonly declared: boolean;

	/**
	 * @since 14.0
	 */
	readonly dynamic: boolean;

	/**
	 * @since 14.0
	 */
	readonly identifier: string;

	/**
	 * @since 14.0
	 */
	readonly localizedDescription: string;

	/**
	 * @since 14.0
	 */
	readonly preferredFilenameExtension: string;

	/**
	 * @since 14.0
	 */
	readonly preferredMIMEType: string;

	/**
	 * @since 14.0
	 */
	readonly publicType: boolean;

	/**
	 * @since 14.0
	 */
	readonly referenceURL: NSURL;

	/**
	 * @since 14.0
	 */
	readonly supertypes: NSSet<UTType>;

	/**
	 * @since 14.0
	 */
	readonly tags: NSDictionary<string, NSArray<string>>;

	/**
	 * @since 14.0
	 */
	readonly version: number;

	static readonly SHCustomCatalogContentType: UTType;

	static readonly SHSignatureContentType: UTType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 14.0
	 */
	conformsToType(type: UTType): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 14.0
	 */
	isSubtypeOfType(type: UTType): boolean;

	/**
	 * @since 14.0
	 */
	isSupertypeOfType(type: UTType): boolean;
}

/**
 * @since 14.0
 */
declare var UTType3DContent: UTType;

/**
 * @since 17.0
 */
declare var UTTypeAHAP: UTType;

/**
 * @since 14.0
 */
declare var UTTypeAIFF: UTType;

/**
 * @since 14.0
 */
declare var UTTypeARReferenceObject: UTType;

/**
 * @since 14.0
 */
declare var UTTypeAVI: UTType;

/**
 * @since 14.0
 */
declare var UTTypeAliasFile: UTType;

/**
 * @since 14.0
 */
declare var UTTypeAppleArchive: UTType;

/**
 * @since 14.0
 */
declare var UTTypeAppleProtectedMPEG4Audio: UTType;

/**
 * @since 14.0
 */
declare var UTTypeAppleProtectedMPEG4Video: UTType;

/**
 * @since 14.0
 */
declare var UTTypeAppleScript: UTType;

/**
 * @since 14.0
 */
declare var UTTypeApplication: UTType;

/**
 * @since 14.0
 */
declare var UTTypeApplicationBundle: UTType;

/**
 * @since 14.0
 */
declare var UTTypeApplicationExtension: UTType;

/**
 * @since 14.0
 */
declare var UTTypeArchive: UTType;

/**
 * @since 14.0
 */
declare var UTTypeAssemblyLanguageSource: UTType;

/**
 * @since 14.0
 */
declare var UTTypeAudio: UTType;

/**
 * @since 14.0
 */
declare var UTTypeAudiovisualContent: UTType;

/**
 * @since 14.0
 */
declare var UTTypeBMP: UTType;

/**
 * @since 14.0
 */
declare var UTTypeBZ2: UTType;

/**
 * @since 14.0
 */
declare var UTTypeBinaryPropertyList: UTType;

/**
 * @since 14.0
 */
declare var UTTypeBookmark: UTType;

/**
 * @since 14.0
 */
declare var UTTypeBundle: UTType;

/**
 * @since 14.0
 */
declare var UTTypeCHeader: UTType;

/**
 * @since 14.0
 */
declare var UTTypeCPlusPlusHeader: UTType;

/**
 * @since 14.0
 */
declare var UTTypeCPlusPlusSource: UTType;

/**
 * @since 18.0
 */
declare var UTTypeCSS: UTType;

/**
 * @since 14.0
 */
declare var UTTypeCSource: UTType;

/**
 * @since 14.0
 */
declare var UTTypeCalendarEvent: UTType;

/**
 * @since 14.0
 */
declare var UTTypeCommaSeparatedText: UTType;

/**
 * @since 14.0
 */
declare var UTTypeCompositeContent: UTType;

/**
 * @since 14.0
 */
declare var UTTypeContact: UTType;

/**
 * @since 14.0
 */
declare var UTTypeContent: UTType;

/**
 * @since 18.0
 */
declare var UTTypeDNG: UTType;

/**
 * @since 14.0
 */
declare var UTTypeData: UTType;

/**
 * @since 14.0
 */
declare var UTTypeDatabase: UTType;

/**
 * @since 14.0
 */
declare var UTTypeDelimitedText: UTType;

/**
 * @since 14.0
 */
declare var UTTypeDirectory: UTType;

/**
 * @since 14.0
 */
declare var UTTypeDiskImage: UTType;

/**
 * @since 14.0
 */
declare var UTTypeEPUB: UTType;

/**
 * @since 14.0
 */
declare var UTTypeEXE: UTType;

/**
 * @since 18.0
 */
declare var UTTypeEXR: UTType;

/**
 * @since 14.0
 */
declare var UTTypeEmailMessage: UTType;

/**
 * @since 14.0
 */
declare var UTTypeExecutable: UTType;

/**
 * @since 14.0
 */
declare var UTTypeFileURL: UTType;

/**
 * @since 14.0
 */
declare var UTTypeFlatRTFD: UTType;

/**
 * @since 14.0
 */
declare var UTTypeFolder: UTType;

/**
 * @since 14.0
 */
declare var UTTypeFont: UTType;

/**
 * @since 14.0
 */
declare var UTTypeFramework: UTType;

/**
 * @since 14.0
 */
declare var UTTypeGIF: UTType;

/**
 * @since 14.0
 */
declare var UTTypeGZIP: UTType;

/**
 * @since 18.0
 */
declare var UTTypeGeoJSON: UTType;

/**
 * @since 14.0
 */
declare var UTTypeHEIC: UTType;

/**
 * @since 18.0
 */
declare var UTTypeHEICS: UTType;

/**
 * @since 14.0
 */
declare var UTTypeHEIF: UTType;

/**
 * @since 14.0
 */
declare var UTTypeHTML: UTType;

/**
 * @since 14.0
 */
declare var UTTypeICNS: UTType;

/**
 * @since 14.0
 */
declare var UTTypeICO: UTType;

/**
 * @since 14.0
 */
declare var UTTypeImage: UTType;

/**
 * @since 14.0
 */
declare var UTTypeInternetLocation: UTType;

/**
 * @since 14.0
 */
declare var UTTypeInternetShortcut: UTType;

/**
 * @since 14.0
 */
declare var UTTypeItem: UTType;

/**
 * @since 14.0
 */
declare var UTTypeJPEG: UTType;

/**
 * @since 18.2
 */
declare var UTTypeJPEGXL: UTType;

/**
 * @since 14.0
 */
declare var UTTypeJSON: UTType;

/**
 * @since 14.0
 */
declare var UTTypeJavaScript: UTType;

/**
 * @since 18.0
 */
declare var UTTypeLinkPresentationMetadata: UTType;

/**
 * @since 14.0
 */
declare var UTTypeLivePhoto: UTType;

/**
 * @since 14.0
 */
declare var UTTypeLog: UTType;

/**
 * @since 14.0
 */
declare var UTTypeM3UPlaylist: UTType;

/**
 * @since 14.0
 */
declare var UTTypeMIDI: UTType;

/**
 * @since 14.0
 */
declare var UTTypeMP3: UTType;

/**
 * @since 14.0
 */
declare var UTTypeMPEG: UTType;

/**
 * @since 14.0
 */
declare var UTTypeMPEG2TransportStream: UTType;

/**
 * @since 14.0
 */
declare var UTTypeMPEG2Video: UTType;

/**
 * @since 14.0
 */
declare var UTTypeMPEG4Audio: UTType;

/**
 * @since 14.0
 */
declare var UTTypeMPEG4Movie: UTType;

/**
 * @since 15.0
 */
declare var UTTypeMakefile: UTType;

/**
 * @since 14.0
 */
declare var UTTypeMessage: UTType;

/**
 * @since 14.0
 */
declare var UTTypeMountPoint: UTType;

/**
 * @since 14.0
 */
declare var UTTypeMovie: UTType;

/**
 * @since 14.0
 */
declare var UTTypeOSAScript: UTType;

/**
 * @since 14.0
 */
declare var UTTypeOSAScriptBundle: UTType;

/**
 * @since 14.0
 */
declare var UTTypeObjectiveCPlusPlusSource: UTType;

/**
 * @since 14.0
 */
declare var UTTypeObjectiveCSource: UTType;

/**
 * @since 14.0
 */
declare var UTTypePDF: UTType;

/**
 * @since 14.0
 */
declare var UTTypePHPScript: UTType;

/**
 * @since 14.0
 */
declare var UTTypePKCS12: UTType;

/**
 * @since 14.0
 */
declare var UTTypePNG: UTType;

/**
 * @since 14.0
 */
declare var UTTypePackage: UTType;

/**
 * @since 14.0
 */
declare var UTTypePerlScript: UTType;

/**
 * @since 14.0
 */
declare var UTTypePlainText: UTType;

/**
 * @since 14.0
 */
declare var UTTypePlaylist: UTType;

/**
 * @since 14.0
 */
declare var UTTypePluginBundle: UTType;

/**
 * @since 14.0
 */
declare var UTTypePresentation: UTType;

/**
 * @since 14.0
 */
declare var UTTypePropertyList: UTType;

/**
 * @since 14.0
 */
declare var UTTypePythonScript: UTType;

/**
 * @since 14.0
 */
declare var UTTypeQuickLookGenerator: UTType;

/**
 * @since 14.0
 */
declare var UTTypeQuickTimeMovie: UTType;

/**
 * @since 14.0
 */
declare var UTTypeRAWImage: UTType;

/**
 * @since 14.0
 */
declare var UTTypeRTF: UTType;

/**
 * @since 14.0
 */
declare var UTTypeRTFD: UTType;

/**
 * @since 14.0
 */
declare var UTTypeRealityFile: UTType;

/**
 * @since 14.0
 */
declare var UTTypeResolvable: UTType;

/**
 * @since 14.0
 */
declare var UTTypeRubyScript: UTType;

/**
 * @since 14.0
 */
declare var UTTypeSVG: UTType;

/**
 * @since 14.0
 */
declare var UTTypeSceneKitScene: UTType;

/**
 * @since 14.0
 */
declare var UTTypeScript: UTType;

/**
 * @since 14.0
 */
declare var UTTypeShellScript: UTType;

/**
 * @since 14.0
 */
declare var UTTypeSourceCode: UTType;

/**
 * @since 14.0
 */
declare var UTTypeSpotlightImporter: UTType;

/**
 * @since 14.0
 */
declare var UTTypeSpreadsheet: UTType;

/**
 * @since 14.0
 */
declare var UTTypeSwiftSource: UTType;

/**
 * @since 14.0
 */
declare var UTTypeSymbolicLink: UTType;

/**
 * @since 14.0
 */
declare var UTTypeSystemPreferencesPane: UTType;

/**
 * @since 14.0
 */
declare var UTTypeTIFF: UTType;

/**
 * @since 14.0
 */
declare var UTTypeTabSeparatedText: UTType;

/**
 * @since 18.0
 */
declare var UTTypeTarArchive: UTType;

/**
 * @since 14.0
 */
declare var UTTypeText: UTType;

/**
 * @since 14.0
 */
declare var UTTypeToDoItem: UTType;

/**
 * @since 14.0
 */
declare var UTTypeURL: UTType;

/**
 * @since 14.0
 */
declare var UTTypeURLBookmarkData: UTType;

/**
 * @since 14.0
 */
declare var UTTypeUSD: UTType;

/**
 * @since 14.0
 */
declare var UTTypeUSDZ: UTType;

/**
 * @since 14.0
 */
declare var UTTypeUTF16ExternalPlainText: UTType;

/**
 * @since 14.0
 */
declare var UTTypeUTF16PlainText: UTType;

/**
 * @since 14.0
 */
declare var UTTypeUTF8PlainText: UTType;

/**
 * @since 14.0
 */
declare var UTTypeUTF8TabSeparatedText: UTType;

/**
 * @since 14.0
 */
declare var UTTypeUnixExecutable: UTType;

/**
 * @since 14.0
 */
declare var UTTypeVCard: UTType;

/**
 * @since 14.0
 */
declare var UTTypeVideo: UTType;

/**
 * @since 14.0
 */
declare var UTTypeVolume: UTType;

/**
 * @since 14.0
 */
declare var UTTypeWAV: UTType;

/**
 * @since 14.0
 */
declare var UTTypeWebArchive: UTType;

/**
 * @since 14.0
 */
declare var UTTypeWebP: UTType;

/**
 * @since 14.0
 */
declare var UTTypeX509Certificate: UTType;

/**
 * @since 14.0
 */
declare var UTTypeXML: UTType;

/**
 * @since 14.0
 */
declare var UTTypeXMLPropertyList: UTType;

/**
 * @since 14.0
 */
declare var UTTypeXPCService: UTType;

/**
 * @since 14.0
 */
declare var UTTypeYAML: UTType;

/**
 * @since 14.0
 */
declare var UTTypeZIP: UTType;
