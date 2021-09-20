
declare var UTTagClassFilenameExtension: string;

declare var UTTagClassMIMEType: string;

declare class UTType extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UTType; // inherited from NSObject

	static exportedTypeWithIdentifier(identifier: string): UTType;

	static exportedTypeWithIdentifierConformingToType(identifier: string, parentType: UTType): UTType;

	static importedTypeWithIdentifier(identifier: string): UTType;

	static importedTypeWithIdentifierConformingToType(identifier: string, parentType: UTType): UTType;

	static new(): UTType; // inherited from NSObject

	static typeWithFilenameExtension(filenameExtension: string): UTType;

	static typeWithFilenameExtensionConformingToType(filenameExtension: string, supertype: UTType): UTType;

	static typeWithIdentifier(identifier: string): UTType;

	static typeWithMIMEType(mimeType: string): UTType;

	static typeWithMIMETypeConformingToType(mimeType: string, supertype: UTType): UTType;

	static typeWithTagTagClassConformingToType(tag: string, tagClass: string, supertype: UTType): UTType;

	static typesWithTagTagClassConformingToType(tag: string, tagClass: string, supertype: UTType): NSArray<UTType>;

	readonly declared: boolean;

	readonly dynamic: boolean;

	readonly identifier: string;

	readonly localizedDescription: string;

	readonly preferredFilenameExtension: string;

	readonly preferredMIMEType: string;

	readonly publicType: boolean;

	readonly referenceURL: NSURL;

	readonly supertypes: NSSet<UTType>;

	readonly tags: NSDictionary<string, NSArray<string>>;

	readonly version: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	conformsToType(type: UTType): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	isSubtypeOfType(type: UTType): boolean;

	isSupertypeOfType(type: UTType): boolean;
}

declare var UTType3DContent: UTType;

declare var UTTypeAIFF: UTType;

declare var UTTypeARReferenceObject: UTType;

declare var UTTypeAVI: UTType;

declare var UTTypeAliasFile: UTType;

declare var UTTypeAppleArchive: UTType;

declare var UTTypeAppleProtectedMPEG4Audio: UTType;

declare var UTTypeAppleProtectedMPEG4Video: UTType;

declare var UTTypeAppleScript: UTType;

declare var UTTypeApplication: UTType;

declare var UTTypeApplicationBundle: UTType;

declare var UTTypeApplicationExtension: UTType;

declare var UTTypeArchive: UTType;

declare var UTTypeAssemblyLanguageSource: UTType;

declare var UTTypeAudio: UTType;

declare var UTTypeAudiovisualContent: UTType;

declare var UTTypeBMP: UTType;

declare var UTTypeBZ2: UTType;

declare var UTTypeBinaryPropertyList: UTType;

declare var UTTypeBookmark: UTType;

declare var UTTypeBundle: UTType;

declare var UTTypeCHeader: UTType;

declare var UTTypeCPlusPlusHeader: UTType;

declare var UTTypeCPlusPlusSource: UTType;

declare var UTTypeCSource: UTType;

declare var UTTypeCalendarEvent: UTType;

declare var UTTypeCommaSeparatedText: UTType;

declare var UTTypeCompositeContent: UTType;

declare var UTTypeContact: UTType;

declare var UTTypeContent: UTType;

declare var UTTypeData: UTType;

declare var UTTypeDatabase: UTType;

declare var UTTypeDelimitedText: UTType;

declare var UTTypeDirectory: UTType;

declare var UTTypeDiskImage: UTType;

declare var UTTypeEPUB: UTType;

declare var UTTypeEXE: UTType;

declare var UTTypeEmailMessage: UTType;

declare var UTTypeExecutable: UTType;

declare var UTTypeFileURL: UTType;

declare var UTTypeFlatRTFD: UTType;

declare var UTTypeFolder: UTType;

declare var UTTypeFont: UTType;

declare var UTTypeFramework: UTType;

declare var UTTypeGIF: UTType;

declare var UTTypeGZIP: UTType;

declare var UTTypeHEIC: UTType;

declare var UTTypeHEIF: UTType;

declare var UTTypeHTML: UTType;

declare var UTTypeICNS: UTType;

declare var UTTypeICO: UTType;

declare var UTTypeImage: UTType;

declare var UTTypeInternetLocation: UTType;

declare var UTTypeInternetShortcut: UTType;

declare var UTTypeItem: UTType;

declare var UTTypeJPEG: UTType;

declare var UTTypeJSON: UTType;

declare var UTTypeJavaScript: UTType;

declare var UTTypeLivePhoto: UTType;

declare var UTTypeLog: UTType;

declare var UTTypeM3UPlaylist: UTType;

declare var UTTypeMIDI: UTType;

declare var UTTypeMP3: UTType;

declare var UTTypeMPEG: UTType;

declare var UTTypeMPEG2TransportStream: UTType;

declare var UTTypeMPEG2Video: UTType;

declare var UTTypeMPEG4Audio: UTType;

declare var UTTypeMPEG4Movie: UTType;

declare var UTTypeMakefile: UTType;

declare var UTTypeMessage: UTType;

declare var UTTypeMountPoint: UTType;

declare var UTTypeMovie: UTType;

declare var UTTypeOSAScript: UTType;

declare var UTTypeOSAScriptBundle: UTType;

declare var UTTypeObjectiveCPlusPlusSource: UTType;

declare var UTTypeObjectiveCSource: UTType;

declare var UTTypePDF: UTType;

declare var UTTypePHPScript: UTType;

declare var UTTypePKCS12: UTType;

declare var UTTypePNG: UTType;

declare var UTTypePackage: UTType;

declare var UTTypePerlScript: UTType;

declare var UTTypePlainText: UTType;

declare var UTTypePlaylist: UTType;

declare var UTTypePluginBundle: UTType;

declare var UTTypePresentation: UTType;

declare var UTTypePropertyList: UTType;

declare var UTTypePythonScript: UTType;

declare var UTTypeQuickLookGenerator: UTType;

declare var UTTypeQuickTimeMovie: UTType;

declare var UTTypeRAWImage: UTType;

declare var UTTypeRTF: UTType;

declare var UTTypeRTFD: UTType;

declare var UTTypeRealityFile: UTType;

declare var UTTypeResolvable: UTType;

declare var UTTypeRubyScript: UTType;

declare var UTTypeSVG: UTType;

declare var UTTypeSceneKitScene: UTType;

declare var UTTypeScript: UTType;

declare var UTTypeShellScript: UTType;

declare var UTTypeSourceCode: UTType;

declare var UTTypeSpotlightImporter: UTType;

declare var UTTypeSpreadsheet: UTType;

declare var UTTypeSwiftSource: UTType;

declare var UTTypeSymbolicLink: UTType;

declare var UTTypeSystemPreferencesPane: UTType;

declare var UTTypeTIFF: UTType;

declare var UTTypeTabSeparatedText: UTType;

declare var UTTypeText: UTType;

declare var UTTypeToDoItem: UTType;

declare var UTTypeURL: UTType;

declare var UTTypeURLBookmarkData: UTType;

declare var UTTypeUSD: UTType;

declare var UTTypeUSDZ: UTType;

declare var UTTypeUTF16ExternalPlainText: UTType;

declare var UTTypeUTF16PlainText: UTType;

declare var UTTypeUTF8PlainText: UTType;

declare var UTTypeUTF8TabSeparatedText: UTType;

declare var UTTypeUnixExecutable: UTType;

declare var UTTypeVCard: UTType;

declare var UTTypeVideo: UTType;

declare var UTTypeVolume: UTType;

declare var UTTypeWAV: UTType;

declare var UTTypeWebArchive: UTType;

declare var UTTypeWebP: UTType;

declare var UTTypeX509Certificate: UTType;

declare var UTTypeXML: UTType;

declare var UTTypeXMLPropertyList: UTType;

declare var UTTypeXPCService: UTType;

declare var UTTypeYAML: UTType;

declare var UTTypeZIP: UTType;
