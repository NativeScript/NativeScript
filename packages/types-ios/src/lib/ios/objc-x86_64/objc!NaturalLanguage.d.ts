
/**
 * @since 17.0
 */
declare class NLContextualEmbedding extends NSObject {

	static alloc(): NLContextualEmbedding; // inherited from NSObject

	static contextualEmbeddingWithLanguage(language: string): NLContextualEmbedding;

	static contextualEmbeddingWithModelIdentifier(modelIdentifier: string): NLContextualEmbedding;

	static contextualEmbeddingWithScript(script: string): NLContextualEmbedding;

	static contextualEmbeddingsForValues(valuesDictionary: NSDictionary<string, any>): NSArray<NLContextualEmbedding>;

	static new(): NLContextualEmbedding; // inherited from NSObject

	readonly dimension: number;

	readonly hasAvailableAssets: boolean;

	readonly languages: NSArray<string>;

	readonly maximumSequenceLength: number;

	readonly modelIdentifier: string;

	readonly revision: number;

	readonly scripts: NSArray<string>;

	embeddingResultForStringLanguageError(string: string, language: string): NLContextualEmbeddingResult;

	loadWithError(): boolean;

	requestEmbeddingAssetsWithCompletionHandler(completionHandler: (p1: NLContextualEmbeddingAssetsResult, p2: NSError) => void): void;

	unload(): void;
}

declare const enum NLContextualEmbeddingAssetsResult {

	Available = 0,

	NotAvailable = 1,

	Error = 2
}

declare var NLContextualEmbeddingKeyLanguages: string;

declare var NLContextualEmbeddingKeyRevision: string;

declare var NLContextualEmbeddingKeyScripts: string;

/**
 * @since 17.0
 */
declare class NLContextualEmbeddingResult extends NSObject {

	static alloc(): NLContextualEmbeddingResult; // inherited from NSObject

	static new(): NLContextualEmbeddingResult; // inherited from NSObject

	readonly language: string;

	readonly sequenceLength: number;

	readonly string: string;

	enumerateTokenVectorsInRangeUsingBlock(range: NSRange, block: (p1: NSArray<number>, p2: NSRange, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	tokenVectorAtIndexTokenRange(characterIndex: number, tokenRange: interop.Pointer | interop.Reference<NSRange>): NSArray<number>;
}

declare const enum NLDistanceType {

	Cosine = 0
}

/**
 * @since 13.0
 */
declare class NLEmbedding extends NSObject {

	static alloc(): NLEmbedding; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static currentRevisionForLanguage(language: string): number;

	/**
	 * @since 14.0
	 */
	static currentSentenceEmbeddingRevisionForLanguage(language: string): number;

	/**
	 * @since 13.0
	 */
	static embeddingWithContentsOfURLError(url: NSURL): NLEmbedding;

	static new(): NLEmbedding; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	static sentenceEmbeddingForLanguage(language: string): NLEmbedding;

	/**
	 * @since 14.0
	 */
	static sentenceEmbeddingForLanguageRevision(language: string, revision: number): NLEmbedding;

	/**
	 * @since 13.0
	 */
	static supportedRevisionsForLanguage(language: string): NSIndexSet;

	/**
	 * @since 14.0
	 */
	static supportedSentenceEmbeddingRevisionsForLanguage(language: string): NSIndexSet;

	/**
	 * @since 13.0
	 */
	static wordEmbeddingForLanguage(language: string): NLEmbedding;

	/**
	 * @since 13.0
	 */
	static wordEmbeddingForLanguageRevision(language: string, revision: number): NLEmbedding;

	/**
	 * @since 13.0
	 */
	static writeEmbeddingForDictionaryLanguageRevisionToURLError(dictionary: NSDictionary<string, NSArray<number>>, language: string, revision: number, url: NSURL): boolean;

	/**
	 * @since 13.0
	 */
	readonly dimension: number;

	/**
	 * @since 13.0
	 */
	readonly language: string;

	/**
	 * @since 13.0
	 */
	readonly revision: number;

	/**
	 * @since 13.0
	 */
	readonly vocabularySize: number;

	/**
	 * @since 13.0
	 */
	containsString(string: string): boolean;

	/**
	 * @since 13.0
	 */
	distanceBetweenStringAndStringDistanceType(firstString: string, secondString: string, distanceType: NLDistanceType): number;

	/**
	 * @since 13.0
	 */
	enumerateNeighborsForStringMaximumCountDistanceTypeUsingBlock(string: string, maxCount: number, distanceType: NLDistanceType, block: (p1: string, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 13.0
	 */
	enumerateNeighborsForStringMaximumCountMaximumDistanceDistanceTypeUsingBlock(string: string, maxCount: number, maxDistance: number, distanceType: NLDistanceType, block: (p1: string, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 13.0
	 */
	enumerateNeighborsForVectorMaximumCountDistanceTypeUsingBlock(vector: NSArray<number> | number[], maxCount: number, distanceType: NLDistanceType, block: (p1: string, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 13.0
	 */
	enumerateNeighborsForVectorMaximumCountMaximumDistanceDistanceTypeUsingBlock(vector: NSArray<number> | number[], maxCount: number, maxDistance: number, distanceType: NLDistanceType, block: (p1: string, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 13.0
	 */
	getVectorForString(vector: interop.Pointer | interop.Reference<number>, string: string): boolean;

	/**
	 * @since 13.0
	 */
	neighborsForStringMaximumCountDistanceType(string: string, maxCount: number, distanceType: NLDistanceType): NSArray<string>;

	/**
	 * @since 13.0
	 */
	neighborsForStringMaximumCountMaximumDistanceDistanceType(string: string, maxCount: number, maxDistance: number, distanceType: NLDistanceType): NSArray<string>;

	/**
	 * @since 13.0
	 */
	neighborsForVectorMaximumCountDistanceType(vector: NSArray<number> | number[], maxCount: number, distanceType: NLDistanceType): NSArray<string>;

	/**
	 * @since 13.0
	 */
	neighborsForVectorMaximumCountMaximumDistanceDistanceType(vector: NSArray<number> | number[], maxCount: number, maxDistance: number, distanceType: NLDistanceType): NSArray<string>;

	/**
	 * @since 13.0
	 */
	vectorForString(string: string): NSArray<number>;
}

/**
 * @since 13.0
 */
declare class NLGazetteer extends NSObject {

	static alloc(): NLGazetteer; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static gazetteerWithContentsOfURLError(url: NSURL): NLGazetteer;

	static new(): NLGazetteer; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static writeGazetteerForDictionaryLanguageToURLError(dictionary: NSDictionary<string, NSArray<string>>, language: string, url: NSURL): boolean;

	/**
	 * @since 13.0
	 */
	readonly data: NSData;

	/**
	 * @since 13.0
	 */
	readonly language: string;

	/**
	 * @since 13.0
	 */
	constructor(o: { contentsOfURL: NSURL; });

	/**
	 * @since 13.0
	 */
	constructor(o: { data: NSData; });

	/**
	 * @since 13.0
	 */
	constructor(o: { dictionary: NSDictionary<string, NSArray<string>>; language: string; });

	/**
	 * @since 13.0
	 */
	initWithContentsOfURLError(url: NSURL): this;

	/**
	 * @since 13.0
	 */
	initWithDataError(data: NSData): this;

	/**
	 * @since 13.0
	 */
	initWithDictionaryLanguageError(dictionary: NSDictionary<string, NSArray<string>>, language: string): this;

	/**
	 * @since 13.0
	 */
	labelForString(string: string): string;
}

/**
 * @since 12.0
 */
declare var NLLanguageAmharic: string;

/**
 * @since 12.0
 */
declare var NLLanguageArabic: string;

/**
 * @since 12.0
 */
declare var NLLanguageArmenian: string;

/**
 * @since 12.0
 */
declare var NLLanguageBengali: string;

/**
 * @since 12.0
 */
declare var NLLanguageBulgarian: string;

/**
 * @since 12.0
 */
declare var NLLanguageBurmese: string;

/**
 * @since 12.0
 */
declare var NLLanguageCatalan: string;

/**
 * @since 12.0
 */
declare var NLLanguageCherokee: string;

/**
 * @since 12.0
 */
declare var NLLanguageCroatian: string;

/**
 * @since 12.0
 */
declare var NLLanguageCzech: string;

/**
 * @since 12.0
 */
declare var NLLanguageDanish: string;

/**
 * @since 12.0
 */
declare var NLLanguageDutch: string;

/**
 * @since 12.0
 */
declare var NLLanguageEnglish: string;

/**
 * @since 12.0
 */
declare var NLLanguageFinnish: string;

/**
 * @since 12.0
 */
declare var NLLanguageFrench: string;

/**
 * @since 12.0
 */
declare var NLLanguageGeorgian: string;

/**
 * @since 12.0
 */
declare var NLLanguageGerman: string;

/**
 * @since 12.0
 */
declare var NLLanguageGreek: string;

/**
 * @since 12.0
 */
declare var NLLanguageGujarati: string;

/**
 * @since 12.0
 */
declare var NLLanguageHebrew: string;

/**
 * @since 12.0
 */
declare var NLLanguageHindi: string;

/**
 * @since 12.0
 */
declare var NLLanguageHungarian: string;

/**
 * @since 12.0
 */
declare var NLLanguageIcelandic: string;

/**
 * @since 12.0
 */
declare var NLLanguageIndonesian: string;

/**
 * @since 12.0
 */
declare var NLLanguageItalian: string;

/**
 * @since 12.0
 */
declare var NLLanguageJapanese: string;

/**
 * @since 12.0
 */
declare var NLLanguageKannada: string;

/**
 * @since 16.0
 */
declare var NLLanguageKazakh: string;

/**
 * @since 12.0
 */
declare var NLLanguageKhmer: string;

/**
 * @since 12.0
 */
declare var NLLanguageKorean: string;

/**
 * @since 12.0
 */
declare var NLLanguageLao: string;

/**
 * @since 12.0
 */
declare var NLLanguageMalay: string;

/**
 * @since 12.0
 */
declare var NLLanguageMalayalam: string;

/**
 * @since 12.0
 */
declare var NLLanguageMarathi: string;

/**
 * @since 12.0
 */
declare var NLLanguageMongolian: string;

/**
 * @since 12.0
 */
declare var NLLanguageNorwegian: string;

/**
 * @since 12.0
 */
declare var NLLanguageOriya: string;

/**
 * @since 12.0
 */
declare var NLLanguagePersian: string;

/**
 * @since 12.0
 */
declare var NLLanguagePolish: string;

/**
 * @since 12.0
 */
declare var NLLanguagePortuguese: string;

/**
 * @since 12.0
 */
declare var NLLanguagePunjabi: string;

/**
 * @since 12.0
 */
declare class NLLanguageRecognizer extends NSObject {

	static alloc(): NLLanguageRecognizer; // inherited from NSObject

	/**
	 * @since 12.0
	 */
	static dominantLanguageForString(string: string): string;

	static new(): NLLanguageRecognizer; // inherited from NSObject

	/**
	 * @since 12.0
	 */
	readonly dominantLanguage: string;

	/**
	 * @since 12.0
	 */
	languageConstraints: NSArray<string>;

	/**
	 * @since 12.0
	 */
	languageHints: NSDictionary<string, number>;

	/**
	 * @since 12.0
	 */
	languageHypothesesWithMaximum(maxHypotheses: number): NSDictionary<string, number>;

	/**
	 * @since 12.0
	 */
	processString(string: string): void;

	/**
	 * @since 12.0
	 */
	reset(): void;
}

/**
 * @since 12.0
 */
declare var NLLanguageRomanian: string;

/**
 * @since 12.0
 */
declare var NLLanguageRussian: string;

/**
 * @since 12.0
 */
declare var NLLanguageSimplifiedChinese: string;

/**
 * @since 12.0
 */
declare var NLLanguageSinhalese: string;

/**
 * @since 12.0
 */
declare var NLLanguageSlovak: string;

/**
 * @since 12.0
 */
declare var NLLanguageSpanish: string;

/**
 * @since 12.0
 */
declare var NLLanguageSwedish: string;

/**
 * @since 12.0
 */
declare var NLLanguageTamil: string;

/**
 * @since 12.0
 */
declare var NLLanguageTelugu: string;

/**
 * @since 12.0
 */
declare var NLLanguageThai: string;

/**
 * @since 12.0
 */
declare var NLLanguageTibetan: string;

/**
 * @since 12.0
 */
declare var NLLanguageTraditionalChinese: string;

/**
 * @since 12.0
 */
declare var NLLanguageTurkish: string;

/**
 * @since 12.0
 */
declare var NLLanguageUkrainian: string;

/**
 * @since 12.0
 */
declare var NLLanguageUndetermined: string;

/**
 * @since 12.0
 */
declare var NLLanguageUrdu: string;

/**
 * @since 12.0
 */
declare var NLLanguageVietnamese: string;

/**
 * @since 12.0
 */
declare class NLModel extends NSObject {

	static alloc(): NLModel; // inherited from NSObject

	/**
	 * @since 12.0
	 */
	static modelWithContentsOfURLError(url: NSURL): NLModel;

	/**
	 * @since 12.0
	 */
	static modelWithMLModelError(mlModel: MLModel): NLModel;

	static new(): NLModel; // inherited from NSObject

	/**
	 * @since 12.0
	 */
	readonly configuration: NLModelConfiguration;

	/**
	 * @since 12.0
	 */
	predictedLabelForString(string: string): string;

	/**
	 * @since 14.0
	 */
	predictedLabelHypothesesForStringMaximumCount(string: string, maximumCount: number): NSDictionary<string, number>;

	/**
	 * @since 14.0
	 */
	predictedLabelHypothesesForTokensMaximumCount(tokens: NSArray<string> | string[], maximumCount: number): NSArray<NSDictionary<string, number>>;

	/**
	 * @since 12.0
	 */
	predictedLabelsForTokens(tokens: NSArray<string> | string[]): NSArray<string>;
}

/**
 * @since 12.0
 */
declare class NLModelConfiguration extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NLModelConfiguration; // inherited from NSObject

	/**
	 * @since 12.0
	 */
	static currentRevisionForType(type: NLModelType): number;

	static new(): NLModelConfiguration; // inherited from NSObject

	/**
	 * @since 12.0
	 */
	static supportedRevisionsForType(type: NLModelType): NSIndexSet;

	/**
	 * @since 12.0
	 */
	readonly language: string;

	/**
	 * @since 12.0
	 */
	readonly revision: number;

	/**
	 * @since 12.0
	 */
	readonly type: NLModelType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum NLModelType {

	Classifier = 0,

	Sequence = 1
}

/**
 * @since 17.0
 */
declare var NLScriptArabic: string;

/**
 * @since 17.0
 */
declare var NLScriptArmenian: string;

/**
 * @since 17.0
 */
declare var NLScriptBengali: string;

/**
 * @since 17.0
 */
declare var NLScriptCanadianAboriginalSyllabics: string;

/**
 * @since 17.0
 */
declare var NLScriptCherokee: string;

/**
 * @since 17.0
 */
declare var NLScriptCyrillic: string;

/**
 * @since 17.0
 */
declare var NLScriptDevanagari: string;

/**
 * @since 17.0
 */
declare var NLScriptEthiopic: string;

/**
 * @since 17.0
 */
declare var NLScriptGeorgian: string;

/**
 * @since 17.0
 */
declare var NLScriptGreek: string;

/**
 * @since 17.0
 */
declare var NLScriptGujarati: string;

/**
 * @since 17.0
 */
declare var NLScriptGurmukhi: string;

/**
 * @since 17.0
 */
declare var NLScriptHebrew: string;

/**
 * @since 17.0
 */
declare var NLScriptJapanese: string;

/**
 * @since 17.0
 */
declare var NLScriptKannada: string;

/**
 * @since 17.0
 */
declare var NLScriptKhmer: string;

/**
 * @since 17.0
 */
declare var NLScriptKorean: string;

/**
 * @since 17.0
 */
declare var NLScriptLao: string;

/**
 * @since 17.0
 */
declare var NLScriptLatin: string;

/**
 * @since 17.0
 */
declare var NLScriptMalayalam: string;

/**
 * @since 17.0
 */
declare var NLScriptMongolian: string;

/**
 * @since 17.0
 */
declare var NLScriptMyanmar: string;

/**
 * @since 17.0
 */
declare var NLScriptOriya: string;

/**
 * @since 17.0
 */
declare var NLScriptSimplifiedChinese: string;

/**
 * @since 17.0
 */
declare var NLScriptSinhala: string;

/**
 * @since 17.0
 */
declare var NLScriptTamil: string;

/**
 * @since 17.0
 */
declare var NLScriptTelugu: string;

/**
 * @since 17.0
 */
declare var NLScriptThai: string;

/**
 * @since 17.0
 */
declare var NLScriptTibetan: string;

/**
 * @since 17.0
 */
declare var NLScriptTraditionalChinese: string;

/**
 * @since 17.0
 */
declare var NLScriptUndetermined: string;

/**
 * @since 12.0
 */
declare var NLTagAdjective: string;

/**
 * @since 12.0
 */
declare var NLTagAdverb: string;

/**
 * @since 12.0
 */
declare var NLTagClassifier: string;

/**
 * @since 12.0
 */
declare var NLTagCloseParenthesis: string;

/**
 * @since 12.0
 */
declare var NLTagCloseQuote: string;

/**
 * @since 12.0
 */
declare var NLTagConjunction: string;

/**
 * @since 12.0
 */
declare var NLTagDash: string;

/**
 * @since 12.0
 */
declare var NLTagDeterminer: string;

/**
 * @since 12.0
 */
declare var NLTagIdiom: string;

/**
 * @since 12.0
 */
declare var NLTagInterjection: string;

/**
 * @since 12.0
 */
declare var NLTagNoun: string;

/**
 * @since 12.0
 */
declare var NLTagNumber: string;

/**
 * @since 12.0
 */
declare var NLTagOpenParenthesis: string;

/**
 * @since 12.0
 */
declare var NLTagOpenQuote: string;

/**
 * @since 12.0
 */
declare var NLTagOrganizationName: string;

/**
 * @since 12.0
 */
declare var NLTagOther: string;

/**
 * @since 12.0
 */
declare var NLTagOtherPunctuation: string;

/**
 * @since 12.0
 */
declare var NLTagOtherWhitespace: string;

/**
 * @since 12.0
 */
declare var NLTagOtherWord: string;

/**
 * @since 12.0
 */
declare var NLTagParagraphBreak: string;

/**
 * @since 12.0
 */
declare var NLTagParticle: string;

/**
 * @since 12.0
 */
declare var NLTagPersonalName: string;

/**
 * @since 12.0
 */
declare var NLTagPlaceName: string;

/**
 * @since 12.0
 */
declare var NLTagPreposition: string;

/**
 * @since 12.0
 */
declare var NLTagPronoun: string;

/**
 * @since 12.0
 */
declare var NLTagPunctuation: string;

/**
 * @since 12.0
 */
declare var NLTagSchemeLanguage: string;

/**
 * @since 12.0
 */
declare var NLTagSchemeLemma: string;

/**
 * @since 12.0
 */
declare var NLTagSchemeLexicalClass: string;

/**
 * @since 12.0
 */
declare var NLTagSchemeNameType: string;

/**
 * @since 12.0
 */
declare var NLTagSchemeNameTypeOrLexicalClass: string;

/**
 * @since 12.0
 */
declare var NLTagSchemeScript: string;

/**
 * @since 13.0
 */
declare var NLTagSchemeSentimentScore: string;

/**
 * @since 12.0
 */
declare var NLTagSchemeTokenType: string;

/**
 * @since 12.0
 */
declare var NLTagSentenceTerminator: string;

/**
 * @since 12.0
 */
declare var NLTagVerb: string;

/**
 * @since 12.0
 */
declare var NLTagWhitespace: string;

/**
 * @since 12.0
 */
declare var NLTagWord: string;

/**
 * @since 12.0
 */
declare var NLTagWordJoiner: string;

/**
 * @since 12.0
 */
declare class NLTagger extends NSObject {

	static alloc(): NLTagger; // inherited from NSObject

	/**
	 * @since 12.0
	 */
	static availableTagSchemesForUnitLanguage(unit: NLTokenUnit, language: string): NSArray<string>;

	static new(): NLTagger; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static requestAssetsForLanguageTagSchemeCompletionHandler(language: string, tagScheme: string, completionHandler: (p1: NLTaggerAssetsResult, p2: NSError) => void): void;

	/**
	 * @since 12.0
	 */
	readonly dominantLanguage: string;

	/**
	 * @since 12.0
	 */
	string: string;

	/**
	 * @since 12.0
	 */
	readonly tagSchemes: NSArray<string>;

	/**
	 * @since 12.0
	 */
	constructor(o: { tagSchemes: NSArray<string> | string[]; });

	/**
	 * @since 12.0
	 */
	enumerateTagsInRangeUnitSchemeOptionsUsingBlock(range: NSRange, unit: NLTokenUnit, scheme: string, options: NLTaggerOptions, block: (p1: string, p2: NSRange, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 13.0
	 */
	gazetteersForTagScheme(tagScheme: string): NSArray<NLGazetteer>;

	/**
	 * @since 12.0
	 */
	initWithTagSchemes(tagSchemes: NSArray<string> | string[]): this;

	/**
	 * @since 12.0
	 */
	modelsForTagScheme(tagScheme: string): NSArray<NLModel>;

	/**
	 * @since 13.0
	 */
	setGazetteersForTagScheme(gazetteers: NSArray<NLGazetteer> | NLGazetteer[], tagScheme: string): void;

	/**
	 * @since 12.0
	 */
	setLanguageRange(language: string, range: NSRange): void;

	/**
	 * @since 12.0
	 */
	setModelsForTagScheme(models: NSArray<NLModel> | NLModel[], tagScheme: string): void;

	/**
	 * @since 12.0
	 */
	setOrthographyRange(orthography: NSOrthography, range: NSRange): void;

	/**
	 * @since 12.0
	 */
	tagAtIndexUnitSchemeTokenRange(characterIndex: number, unit: NLTokenUnit, scheme: string, tokenRange: interop.Pointer | interop.Reference<NSRange>): string;

	/**
	 * @since 14.0
	 */
	tagHypothesesAtIndexUnitSchemeMaximumCountTokenRange(characterIndex: number, unit: NLTokenUnit, scheme: string, maximumCount: number, tokenRange: interop.Pointer | interop.Reference<NSRange>): NSDictionary<string, number>;

	/**
	 * @since 12.0
	 */
	tagsInRangeUnitSchemeOptionsTokenRanges(range: NSRange, unit: NLTokenUnit, scheme: string, options: NLTaggerOptions, tokenRanges: interop.Pointer | interop.Reference<NSArray<NSValue>>): NSArray<string>;

	/**
	 * @since 12.0
	 */
	tokenRangeAtIndexUnit(characterIndex: number, unit: NLTokenUnit): NSRange;

	/**
	 * @since 14.0
	 */
	tokenRangeForRangeUnit(range: NSRange, unit: NLTokenUnit): NSRange;
}

declare const enum NLTaggerAssetsResult {

	Available = 0,

	NotAvailable = 1,

	Error = 2
}

declare const enum NLTaggerOptions {

	OmitWords = 1,

	OmitPunctuation = 2,

	OmitWhitespace = 4,

	OmitOther = 8,

	JoinNames = 16,

	JoinContractions = 32
}

declare const enum NLTokenUnit {

	Word = 0,

	Sentence = 1,

	Paragraph = 2,

	Document = 3
}

/**
 * @since 12.0
 */
declare class NLTokenizer extends NSObject {

	static alloc(): NLTokenizer; // inherited from NSObject

	static new(): NLTokenizer; // inherited from NSObject

	/**
	 * @since 12.0
	 */
	string: string;

	/**
	 * @since 12.0
	 */
	readonly unit: NLTokenUnit;

	/**
	 * @since 12.0
	 */
	constructor(o: { unit: NLTokenUnit; });

	/**
	 * @since 12.0
	 */
	enumerateTokensInRangeUsingBlock(range: NSRange, block: (p1: NSRange, p2: NLTokenizerAttributes, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 12.0
	 */
	initWithUnit(unit: NLTokenUnit): this;

	/**
	 * @since 12.0
	 */
	setLanguage(language: string): void;

	/**
	 * @since 12.0
	 */
	tokenRangeAtIndex(characterIndex: number): NSRange;

	/**
	 * @since 14.0
	 */
	tokenRangeForRange(range: NSRange): NSRange;

	/**
	 * @since 12.0
	 */
	tokensForRange(range: NSRange): NSArray<NSValue>;
}

declare const enum NLTokenizerAttributes {

	Numeric = 1,

	Symbolic = 2,

	Emoji = 4
}
