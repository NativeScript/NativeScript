
declare function UTTypeConformsTo(inUTI: string, inConformsToUTI: string): boolean;

declare function UTTypeCopyAllTagsWithClass(inUTI: string, inTagClass: string): interop.Unmanaged<NSArray<any>>;

declare function UTTypeCopyDeclaration(inUTI: string): interop.Unmanaged<NSDictionary<any, any>>;

declare function UTTypeCopyDeclaringBundleURL(inUTI: string): interop.Unmanaged<NSURL>;

declare function UTTypeCopyDescription(inUTI: string): interop.Unmanaged<string>;

declare function UTTypeCopyPreferredTagWithClass(inUTI: string, inTagClass: string): interop.Unmanaged<string>;

declare function UTTypeCreateAllIdentifiersForTag(inTagClass: string, inTag: string, inConformingToUTI: string): interop.Unmanaged<NSArray<any>>;

declare function UTTypeCreatePreferredIdentifierForTag(inTagClass: string, inTag: string, inConformingToUTI: string): interop.Unmanaged<string>;

declare function UTTypeEqual(inUTI1: string, inUTI2: string): boolean;

declare function UTTypeIsDeclared(inUTI: string): boolean;

declare function UTTypeIsDynamic(inUTI: string): boolean;

declare var kUTExportedTypeDeclarationsKey: string;

declare var kUTImportedTypeDeclarationsKey: string;

declare var kUTTagClassFilenameExtension: string;

declare var kUTTagClassMIMEType: string;

declare var kUTType3DContent: string;

declare var kUTTypeAVIMovie: string;

declare var kUTTypeAliasFile: string;

declare var kUTTypeAliasRecord: string;

declare var kUTTypeAppleICNS: string;

declare var kUTTypeAppleProtectedMPEG4Audio: string;

declare var kUTTypeAppleProtectedMPEG4Video: string;

declare var kUTTypeAppleScript: string;

declare var kUTTypeApplication: string;

declare var kUTTypeApplicationBundle: string;

declare var kUTTypeApplicationFile: string;

declare var kUTTypeArchive: string;

declare var kUTTypeAssemblyLanguageSource: string;

declare var kUTTypeAudio: string;

declare var kUTTypeAudioInterchangeFileFormat: string;

declare var kUTTypeAudiovisualContent: string;

declare var kUTTypeBMP: string;

declare var kUTTypeBinaryPropertyList: string;

declare var kUTTypeBookmark: string;

declare var kUTTypeBundle: string;

declare var kUTTypeBzip2Archive: string;

declare var kUTTypeCHeader: string;

declare var kUTTypeCPlusPlusHeader: string;

declare var kUTTypeCPlusPlusSource: string;

declare var kUTTypeCSource: string;

declare var kUTTypeCalendarEvent: string;

declare var kUTTypeCommaSeparatedText: string;

declare var kUTTypeCompositeContent: string;

declare var kUTTypeConformsToKey: string;

declare var kUTTypeContact: string;

declare var kUTTypeContent: string;

declare var kUTTypeData: string;

declare var kUTTypeDatabase: string;

declare var kUTTypeDelimitedText: string;

declare var kUTTypeDescriptionKey: string;

declare var kUTTypeDirectory: string;

declare var kUTTypeDiskImage: string;

declare var kUTTypeElectronicPublication: string;

declare var kUTTypeEmailMessage: string;

declare var kUTTypeExecutable: string;

declare var kUTTypeFileURL: string;

declare var kUTTypeFlatRTFD: string;

declare var kUTTypeFolder: string;

declare var kUTTypeFont: string;

declare var kUTTypeFramework: string;

declare var kUTTypeGIF: string;

declare var kUTTypeGNUZipArchive: string;

declare var kUTTypeHTML: string;

declare var kUTTypeICO: string;

declare var kUTTypeIconFileKey: string;

declare var kUTTypeIdentifierKey: string;

declare var kUTTypeImage: string;

declare var kUTTypeInkText: string;

declare var kUTTypeInternetLocation: string;

declare var kUTTypeItem: string;

declare var kUTTypeJPEG: string;

declare var kUTTypeJPEG2000: string;

declare var kUTTypeJSON: string;

declare var kUTTypeJavaArchive: string;

declare var kUTTypeJavaClass: string;

declare var kUTTypeJavaScript: string;

declare var kUTTypeJavaSource: string;

declare var kUTTypeLivePhoto: string;

declare var kUTTypeLog: string;

declare var kUTTypeM3UPlaylist: string;

declare var kUTTypeMIDIAudio: string;

declare var kUTTypeMP3: string;

declare var kUTTypeMPEG: string;

declare var kUTTypeMPEG2TransportStream: string;

declare var kUTTypeMPEG2Video: string;

declare var kUTTypeMPEG4: string;

declare var kUTTypeMPEG4Audio: string;

declare var kUTTypeMessage: string;

declare var kUTTypeMountPoint: string;

declare var kUTTypeMovie: string;

declare var kUTTypeOSAScript: string;

declare var kUTTypeOSAScriptBundle: string;

declare var kUTTypeObjectiveCPlusPlusSource: string;

declare var kUTTypeObjectiveCSource: string;

declare var kUTTypePDF: string;

declare var kUTTypePHPScript: string;

declare var kUTTypePICT: string;

declare var kUTTypePKCS12: string;

declare var kUTTypePNG: string;

declare var kUTTypePackage: string;

declare var kUTTypePerlScript: string;

declare var kUTTypePlainText: string;

declare var kUTTypePlaylist: string;

declare var kUTTypePluginBundle: string;

declare var kUTTypePresentation: string;

declare var kUTTypePropertyList: string;

declare var kUTTypePythonScript: string;

declare var kUTTypeQuickLookGenerator: string;

declare var kUTTypeQuickTimeImage: string;

declare var kUTTypeQuickTimeMovie: string;

declare var kUTTypeRTF: string;

declare var kUTTypeRTFD: string;

declare var kUTTypeRawImage: string;

declare var kUTTypeReferenceURLKey: string;

declare var kUTTypeResolvable: string;

declare var kUTTypeRubyScript: string;

declare var kUTTypeScalableVectorGraphics: string;

declare var kUTTypeScript: string;

declare var kUTTypeShellScript: string;

declare var kUTTypeSourceCode: string;

declare var kUTTypeSpotlightImporter: string;

declare var kUTTypeSpreadsheet: string;

declare var kUTTypeSwiftSource: string;

declare var kUTTypeSymLink: string;

declare var kUTTypeSystemPreferencesPane: string;

declare var kUTTypeTIFF: string;

declare var kUTTypeTXNTextAndMultimediaData: string;

declare var kUTTypeTabSeparatedText: string;

declare var kUTTypeTagSpecificationKey: string;

declare var kUTTypeText: string;

declare var kUTTypeToDoItem: string;

declare var kUTTypeURL: string;

declare var kUTTypeURLBookmarkData: string;

declare var kUTTypeUTF16ExternalPlainText: string;

declare var kUTTypeUTF16PlainText: string;

declare var kUTTypeUTF8PlainText: string;

declare var kUTTypeUTF8TabSeparatedText: string;

declare var kUTTypeUnixExecutable: string;

declare var kUTTypeVCard: string;

declare var kUTTypeVersionKey: string;

declare var kUTTypeVideo: string;

declare var kUTTypeVolume: string;

declare var kUTTypeWaveformAudio: string;

declare var kUTTypeWebArchive: string;

declare var kUTTypeWindowsExecutable: string;

declare var kUTTypeX509Certificate: string;

declare var kUTTypeXML: string;

declare var kUTTypeXMLPropertyList: string;

declare var kUTTypeXPCService: string;

declare var kUTTypeZipArchive: string;
