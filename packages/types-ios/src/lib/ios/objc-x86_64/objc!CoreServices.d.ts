
/**
 * @since 3.0
 * @deprecated 15.0
 */
declare function UTTypeConformsTo(inUTI: string, inConformsToUTI: string): boolean;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare function UTTypeCopyAllTagsWithClass(inUTI: string, inTagClass: string): interop.Unmanaged<NSArray<any>>;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare function UTTypeCopyDeclaration(inUTI: string): interop.Unmanaged<NSDictionary<any, any>>;

/**
 * @since 3.0
 * @deprecated 14.0
 */
declare function UTTypeCopyDeclaringBundleURL(inUTI: string): interop.Unmanaged<NSURL>;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare function UTTypeCopyDescription(inUTI: string): interop.Unmanaged<string>;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare function UTTypeCopyPreferredTagWithClass(inUTI: string, inTagClass: string): interop.Unmanaged<string>;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare function UTTypeCreateAllIdentifiersForTag(inTagClass: string, inTag: string, inConformingToUTI: string): interop.Unmanaged<NSArray<any>>;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare function UTTypeCreatePreferredIdentifierForTag(inTagClass: string, inTag: string, inConformingToUTI: string): interop.Unmanaged<string>;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare function UTTypeEqual(inUTI1: string, inUTI2: string): boolean;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare function UTTypeIsDeclared(inUTI: string): boolean;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare function UTTypeIsDynamic(inUTI: string): boolean;

/**
 * @since 3.0
 */
declare var kUTExportedTypeDeclarationsKey: string;

/**
 * @since 3.0
 */
declare var kUTImportedTypeDeclarationsKey: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTagClassFilenameExtension: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTagClassMIMEType: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTType3DContent: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeAVIMovie: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeAliasFile: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeAliasRecord: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeAppleICNS: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeAppleProtectedMPEG4Audio: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeAppleProtectedMPEG4Video: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeAppleScript: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeApplication: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeApplicationBundle: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeApplicationFile: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeArchive: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeAssemblyLanguageSource: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeAudio: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeAudioInterchangeFileFormat: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeAudiovisualContent: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeBMP: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeBinaryPropertyList: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeBookmark: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeBundle: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeBzip2Archive: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeCHeader: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeCPlusPlusHeader: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeCPlusPlusSource: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeCSource: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeCalendarEvent: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeCommaSeparatedText: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeCompositeContent: string;

/**
 * @since 3.0
 */
declare var kUTTypeConformsToKey: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeContact: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeContent: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeData: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeDatabase: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeDelimitedText: string;

/**
 * @since 3.0
 */
declare var kUTTypeDescriptionKey: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeDirectory: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeDiskImage: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeElectronicPublication: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeEmailMessage: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeExecutable: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeFileURL: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeFlatRTFD: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeFolder: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeFont: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeFramework: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeGIF: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeGNUZipArchive: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeHTML: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeICO: string;

/**
 * @since 3.0
 */
declare var kUTTypeIconFileKey: string;

/**
 * @since 3.0
 */
declare var kUTTypeIdentifierKey: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeImage: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeInkText: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeInternetLocation: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeItem: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeJPEG: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeJPEG2000: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeJSON: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeJavaArchive: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeJavaClass: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeJavaScript: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeJavaSource: string;

/**
 * @since 9.1
 * @deprecated 15.0
 */
declare var kUTTypeLivePhoto: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeLog: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeM3UPlaylist: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeMIDIAudio: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeMP3: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeMPEG: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeMPEG2TransportStream: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeMPEG2Video: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeMPEG4: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeMPEG4Audio: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeMessage: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeMountPoint: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeMovie: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeOSAScript: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeOSAScriptBundle: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeObjectiveCPlusPlusSource: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeObjectiveCSource: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypePDF: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypePHPScript: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypePICT: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypePKCS12: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypePNG: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypePackage: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypePerlScript: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypePlainText: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypePlaylist: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypePluginBundle: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypePresentation: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypePropertyList: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypePythonScript: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeQuickLookGenerator: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeQuickTimeImage: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeQuickTimeMovie: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeRTF: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeRTFD: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeRawImage: string;

/**
 * @since 3.0
 */
declare var kUTTypeReferenceURLKey: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeResolvable: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeRubyScript: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeScalableVectorGraphics: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeScript: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeShellScript: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeSourceCode: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeSpotlightImporter: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeSpreadsheet: string;

/**
 * @since 9.0
 * @deprecated 15.0
 */
declare var kUTTypeSwiftSource: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeSymLink: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeSystemPreferencesPane: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeTIFF: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeTXNTextAndMultimediaData: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeTabSeparatedText: string;

/**
 * @since 3.0
 */
declare var kUTTypeTagSpecificationKey: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeText: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeToDoItem: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeURL: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeURLBookmarkData: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeUTF16ExternalPlainText: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeUTF16PlainText: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeUTF8PlainText: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeUTF8TabSeparatedText: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeUnixExecutable: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeVCard: string;

/**
 * @since 3.0
 */
declare var kUTTypeVersionKey: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeVideo: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeVolume: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeWaveformAudio: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeWebArchive: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeWindowsExecutable: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeX509Certificate: string;

/**
 * @since 3.0
 * @deprecated 15.0
 */
declare var kUTTypeXML: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeXMLPropertyList: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeXPCService: string;

/**
 * @since 8.0
 * @deprecated 15.0
 */
declare var kUTTypeZipArchive: string;
