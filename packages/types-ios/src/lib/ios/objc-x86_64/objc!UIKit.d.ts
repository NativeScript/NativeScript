
declare function CGAffineTransformFromString(string: string): CGAffineTransform;

declare function CGPointFromString(string: string): CGPoint;

declare function CGRectFromString(string: string): CGRect;

declare function CGSizeFromString(string: string): CGSize;

declare function CGVectorFromString(string: string): CGVector;

/**
 * @since 18.0
 */
declare class NSAdaptiveImageGlyph extends NSObject implements CTAdaptiveImageProviding, NSCopying, NSSecureCoding {

	static alloc(): NSAdaptiveImageGlyph; // inherited from NSObject

	static new(): NSAdaptiveImageGlyph; // inherited from NSObject

	readonly contentDescription: string;

	readonly contentIdentifier: string;

	readonly imageContent: NSData;

	static readonly contentType: UTType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { imageContent: NSData; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	imageForProposedSizeScaleFactorImageOffsetImageSize(proposedSize: CGSize, scaleFactor: number, outImageOffset: interop.Pointer | interop.Reference<CGPoint>, outImageSize: interop.Pointer | interop.Reference<CGSize>): any;

	initWithCoder(coder: NSCoder): this;

	initWithImageContent(imageContent: NSData): this;
}

/**
 * @since 18.0
 */
declare var NSAdaptiveImageGlyphAttributeName: string;

/**
 * @since 7.0
 */
declare var NSAttachmentAttributeName: string;

declare const NSAttachmentCharacter: number;

/**
 * @since 6.0
 */
declare var NSBackgroundColorAttributeName: string;

/**
 * @since 7.0
 */
declare var NSBackgroundColorDocumentAttribute: string;

/**
 * @since 7.0
 */
declare var NSBaselineOffsetAttributeName: string;

/**
 * @since 7.0
 */
declare var NSCharacterEncodingDocumentAttribute: string;

/**
 * @since 6.0
 */
declare var NSCharacterEncodingDocumentOption: string;

/**
 * @since 13.0
 */
declare var NSCocoaVersionDocumentAttribute: string;

/**
 * @since 13.0
 */
declare class NSCollectionLayoutAnchor extends NSObject implements NSCopying {

	static alloc(): NSCollectionLayoutAnchor; // inherited from NSObject

	static layoutAnchorWithEdges(edges: NSDirectionalRectEdge): NSCollectionLayoutAnchor;

	static layoutAnchorWithEdgesAbsoluteOffset(edges: NSDirectionalRectEdge, absoluteOffset: CGPoint): NSCollectionLayoutAnchor;

	static layoutAnchorWithEdgesFractionalOffset(edges: NSDirectionalRectEdge, fractionalOffset: CGPoint): NSCollectionLayoutAnchor;

	static new(): NSCollectionLayoutAnchor; // inherited from NSObject

	readonly edges: NSDirectionalRectEdge;

	readonly isAbsoluteOffset: boolean;

	readonly isFractionalOffset: boolean;

	readonly offset: CGPoint;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 13.0
 */
declare class NSCollectionLayoutBoundarySupplementaryItem extends NSCollectionLayoutSupplementaryItem implements NSCopying {

	static alloc(): NSCollectionLayoutBoundarySupplementaryItem; // inherited from NSObject

	static boundarySupplementaryItemWithLayoutSizeElementKindAlignment(layoutSize: NSCollectionLayoutSize, elementKind: string, alignment: NSRectAlignment): NSCollectionLayoutBoundarySupplementaryItem;

	static boundarySupplementaryItemWithLayoutSizeElementKindAlignmentAbsoluteOffset(layoutSize: NSCollectionLayoutSize, elementKind: string, alignment: NSRectAlignment, absoluteOffset: CGPoint): NSCollectionLayoutBoundarySupplementaryItem;

	static itemWithLayoutSize(layoutSize: NSCollectionLayoutSize): NSCollectionLayoutBoundarySupplementaryItem; // inherited from NSCollectionLayoutItem

	static itemWithLayoutSizeSupplementaryItems(layoutSize: NSCollectionLayoutSize, supplementaryItems: NSArray<NSCollectionLayoutSupplementaryItem> | NSCollectionLayoutSupplementaryItem[]): NSCollectionLayoutBoundarySupplementaryItem; // inherited from NSCollectionLayoutItem

	static new(): NSCollectionLayoutBoundarySupplementaryItem; // inherited from NSObject

	static supplementaryItemWithLayoutSizeElementKindContainerAnchor(layoutSize: NSCollectionLayoutSize, elementKind: string, containerAnchor: NSCollectionLayoutAnchor): NSCollectionLayoutBoundarySupplementaryItem; // inherited from NSCollectionLayoutSupplementaryItem

	static supplementaryItemWithLayoutSizeElementKindContainerAnchorItemAnchor(layoutSize: NSCollectionLayoutSize, elementKind: string, containerAnchor: NSCollectionLayoutAnchor, itemAnchor: NSCollectionLayoutAnchor): NSCollectionLayoutBoundarySupplementaryItem; // inherited from NSCollectionLayoutSupplementaryItem

	readonly alignment: NSRectAlignment;

	extendsBoundary: boolean;

	readonly offset: CGPoint;

	pinToVisibleBounds: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 13.0
 */
interface NSCollectionLayoutContainer extends NSObjectProtocol {

	contentInsets: NSDirectionalEdgeInsets;

	contentSize: CGSize;

	effectiveContentInsets: NSDirectionalEdgeInsets;

	effectiveContentSize: CGSize;
}
declare var NSCollectionLayoutContainer: {

	prototype: NSCollectionLayoutContainer;
};

/**
 * @since 13.0
 */
declare class NSCollectionLayoutDecorationItem extends NSCollectionLayoutItem implements NSCopying {

	static alloc(): NSCollectionLayoutDecorationItem; // inherited from NSObject

	static backgroundDecorationItemWithElementKind(elementKind: string): NSCollectionLayoutDecorationItem;

	static itemWithLayoutSize(layoutSize: NSCollectionLayoutSize): NSCollectionLayoutDecorationItem; // inherited from NSCollectionLayoutItem

	static itemWithLayoutSizeSupplementaryItems(layoutSize: NSCollectionLayoutSize, supplementaryItems: NSArray<NSCollectionLayoutSupplementaryItem> | NSCollectionLayoutSupplementaryItem[]): NSCollectionLayoutDecorationItem; // inherited from NSCollectionLayoutItem

	static new(): NSCollectionLayoutDecorationItem; // inherited from NSObject

	readonly elementKind: string;

	zIndex: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 13.0
 */
declare class NSCollectionLayoutDimension extends NSObject implements NSCopying {

	static absoluteDimension(absoluteDimension: number): NSCollectionLayoutDimension;

	static alloc(): NSCollectionLayoutDimension; // inherited from NSObject

	static estimatedDimension(estimatedDimension: number): NSCollectionLayoutDimension;

	static fractionalHeightDimension(fractionalHeight: number): NSCollectionLayoutDimension;

	static fractionalWidthDimension(fractionalWidth: number): NSCollectionLayoutDimension;

	static new(): NSCollectionLayoutDimension; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	static uniformAcrossSiblingsWithEstimate(estimatedDimension: number): NSCollectionLayoutDimension;

	readonly dimension: number;

	readonly isAbsolute: boolean;

	readonly isEstimated: boolean;

	readonly isFractionalHeight: boolean;

	readonly isFractionalWidth: boolean;

	/**
	 * @since 17.0
	 */
	readonly isUniformAcrossSiblings: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 13.0
 */
declare class NSCollectionLayoutEdgeSpacing extends NSObject implements NSCopying {

	static alloc(): NSCollectionLayoutEdgeSpacing; // inherited from NSObject

	static new(): NSCollectionLayoutEdgeSpacing; // inherited from NSObject

	static spacingForLeadingTopTrailingBottom(leading: NSCollectionLayoutSpacing, top: NSCollectionLayoutSpacing, trailing: NSCollectionLayoutSpacing, bottom: NSCollectionLayoutSpacing): NSCollectionLayoutEdgeSpacing;

	readonly bottom: NSCollectionLayoutSpacing;

	readonly leading: NSCollectionLayoutSpacing;

	readonly top: NSCollectionLayoutSpacing;

	readonly trailing: NSCollectionLayoutSpacing;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 13.0
 */
interface NSCollectionLayoutEnvironment extends NSObjectProtocol {

	container: NSCollectionLayoutContainer;

	traitCollection: UITraitCollection;
}
declare var NSCollectionLayoutEnvironment: {

	prototype: NSCollectionLayoutEnvironment;
};

/**
 * @since 13.0
 */
declare class NSCollectionLayoutGroup extends NSCollectionLayoutItem implements NSCopying {

	static alloc(): NSCollectionLayoutGroup; // inherited from NSObject

	static customGroupWithLayoutSizeItemProvider(layoutSize: NSCollectionLayoutSize, itemProvider: (p1: NSCollectionLayoutEnvironment) => NSArray<NSCollectionLayoutGroupCustomItem>): NSCollectionLayoutGroup;

	/**
	 * @since 16.0
	 */
	static horizontalGroupWithLayoutSizeRepeatingSubitemCount(layoutSize: NSCollectionLayoutSize, subitem: NSCollectionLayoutItem, count: number): NSCollectionLayoutGroup;

	/**
	 * @since 13.0
	 * @deprecated 16.0
	 */
	static horizontalGroupWithLayoutSizeSubitemCount(layoutSize: NSCollectionLayoutSize, subitem: NSCollectionLayoutItem, count: number): NSCollectionLayoutGroup;

	static horizontalGroupWithLayoutSizeSubitems(layoutSize: NSCollectionLayoutSize, subitems: NSArray<NSCollectionLayoutItem> | NSCollectionLayoutItem[]): NSCollectionLayoutGroup;

	static itemWithLayoutSize(layoutSize: NSCollectionLayoutSize): NSCollectionLayoutGroup; // inherited from NSCollectionLayoutItem

	static itemWithLayoutSizeSupplementaryItems(layoutSize: NSCollectionLayoutSize, supplementaryItems: NSArray<NSCollectionLayoutSupplementaryItem> | NSCollectionLayoutSupplementaryItem[]): NSCollectionLayoutGroup; // inherited from NSCollectionLayoutItem

	static new(): NSCollectionLayoutGroup; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	static verticalGroupWithLayoutSizeRepeatingSubitemCount(layoutSize: NSCollectionLayoutSize, subitem: NSCollectionLayoutItem, count: number): NSCollectionLayoutGroup;

	/**
	 * @since 13.0
	 * @deprecated 16.0
	 */
	static verticalGroupWithLayoutSizeSubitemCount(layoutSize: NSCollectionLayoutSize, subitem: NSCollectionLayoutItem, count: number): NSCollectionLayoutGroup;

	static verticalGroupWithLayoutSizeSubitems(layoutSize: NSCollectionLayoutSize, subitems: NSArray<NSCollectionLayoutItem> | NSCollectionLayoutItem[]): NSCollectionLayoutGroup;

	interItemSpacing: NSCollectionLayoutSpacing;

	readonly subitems: NSArray<NSCollectionLayoutItem>;

	supplementaryItems: NSArray<NSCollectionLayoutSupplementaryItem>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	visualDescription(): string;
}

/**
 * @since 13.0
 */
declare class NSCollectionLayoutGroupCustomItem extends NSObject implements NSCopying {

	static alloc(): NSCollectionLayoutGroupCustomItem; // inherited from NSObject

	static customItemWithFrame(frame: CGRect): NSCollectionLayoutGroupCustomItem;

	static customItemWithFrameZIndex(frame: CGRect, zIndex: number): NSCollectionLayoutGroupCustomItem;

	static new(): NSCollectionLayoutGroupCustomItem; // inherited from NSObject

	readonly frame: CGRect;

	readonly zIndex: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 13.0
 */
declare class NSCollectionLayoutItem extends NSObject implements NSCopying {

	static alloc(): NSCollectionLayoutItem; // inherited from NSObject

	static itemWithLayoutSize(layoutSize: NSCollectionLayoutSize): NSCollectionLayoutItem;

	static itemWithLayoutSizeSupplementaryItems(layoutSize: NSCollectionLayoutSize, supplementaryItems: NSArray<NSCollectionLayoutSupplementaryItem> | NSCollectionLayoutSupplementaryItem[]): NSCollectionLayoutItem;

	static new(): NSCollectionLayoutItem; // inherited from NSObject

	contentInsets: NSDirectionalEdgeInsets;

	edgeSpacing: NSCollectionLayoutEdgeSpacing;

	readonly layoutSize: NSCollectionLayoutSize;

	readonly supplementaryItems: NSArray<NSCollectionLayoutSupplementaryItem>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 13.0
 */
declare class NSCollectionLayoutSection extends NSObject implements NSCopying {

	static alloc(): NSCollectionLayoutSection; // inherited from NSObject

	static new(): NSCollectionLayoutSection; // inherited from NSObject

	static sectionWithGroup(group: NSCollectionLayoutGroup): NSCollectionLayoutSection;

	/**
	 * @since 14.0
	 */
	static sectionWithListConfigurationLayoutEnvironment(configuration: UICollectionLayoutListConfiguration, layoutEnvironment: NSCollectionLayoutEnvironment): NSCollectionLayoutSection;

	boundarySupplementaryItems: NSArray<NSCollectionLayoutBoundarySupplementaryItem>;

	contentInsets: NSDirectionalEdgeInsets;

	/**
	 * @since 14.0
	 */
	contentInsetsReference: UIContentInsetsReference;

	decorationItems: NSArray<NSCollectionLayoutDecorationItem>;

	interGroupSpacing: number;

	orthogonalScrollingBehavior: UICollectionLayoutSectionOrthogonalScrollingBehavior;

	/**
	 * @since 17.0
	 */
	readonly orthogonalScrollingProperties: UICollectionLayoutSectionOrthogonalScrollingProperties;

	/**
	 * @since 13.0
	 * @deprecated 16.0
	 */
	supplementariesFollowContentInsets: boolean;

	/**
	 * @since 16.0
	 */
	supplementaryContentInsetsReference: UIContentInsetsReference;

	visibleItemsInvalidationHandler: (p1: NSArray<NSCollectionLayoutVisibleItem>, p2: CGPoint, p3: NSCollectionLayoutEnvironment) => void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 13.0
 */
declare class NSCollectionLayoutSize extends NSObject implements NSCopying {

	static alloc(): NSCollectionLayoutSize; // inherited from NSObject

	static new(): NSCollectionLayoutSize; // inherited from NSObject

	static sizeWithWidthDimensionHeightDimension(width: NSCollectionLayoutDimension, height: NSCollectionLayoutDimension): NSCollectionLayoutSize;

	readonly heightDimension: NSCollectionLayoutDimension;

	readonly widthDimension: NSCollectionLayoutDimension;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 13.0
 */
declare class NSCollectionLayoutSpacing extends NSObject implements NSCopying {

	static alloc(): NSCollectionLayoutSpacing; // inherited from NSObject

	static fixedSpacing(fixedSpacing: number): NSCollectionLayoutSpacing;

	static flexibleSpacing(flexibleSpacing: number): NSCollectionLayoutSpacing;

	static new(): NSCollectionLayoutSpacing; // inherited from NSObject

	readonly isFixedSpacing: boolean;

	readonly isFlexibleSpacing: boolean;

	readonly spacing: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 13.0
 */
declare class NSCollectionLayoutSupplementaryItem extends NSCollectionLayoutItem implements NSCopying {

	static alloc(): NSCollectionLayoutSupplementaryItem; // inherited from NSObject

	static itemWithLayoutSize(layoutSize: NSCollectionLayoutSize): NSCollectionLayoutSupplementaryItem; // inherited from NSCollectionLayoutItem

	static itemWithLayoutSizeSupplementaryItems(layoutSize: NSCollectionLayoutSize, supplementaryItems: NSArray<NSCollectionLayoutSupplementaryItem> | NSCollectionLayoutSupplementaryItem[]): NSCollectionLayoutSupplementaryItem; // inherited from NSCollectionLayoutItem

	static new(): NSCollectionLayoutSupplementaryItem; // inherited from NSObject

	static supplementaryItemWithLayoutSizeElementKindContainerAnchor(layoutSize: NSCollectionLayoutSize, elementKind: string, containerAnchor: NSCollectionLayoutAnchor): NSCollectionLayoutSupplementaryItem;

	static supplementaryItemWithLayoutSizeElementKindContainerAnchorItemAnchor(layoutSize: NSCollectionLayoutSize, elementKind: string, containerAnchor: NSCollectionLayoutAnchor, itemAnchor: NSCollectionLayoutAnchor): NSCollectionLayoutSupplementaryItem;

	readonly containerAnchor: NSCollectionLayoutAnchor;

	readonly elementKind: string;

	readonly itemAnchor: NSCollectionLayoutAnchor;

	zIndex: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 13.0
 */
interface NSCollectionLayoutVisibleItem extends NSObjectProtocol, UIDynamicItem {

	alpha: number;

	frame: CGRect;

	hidden: boolean;

	indexPath: NSIndexPath;

	name: string;

	representedElementCategory: UICollectionElementCategory;

	representedElementKind: string;

	transform3D: CATransform3D;

	zIndex: number;
}
declare var NSCollectionLayoutVisibleItem: {

	prototype: NSCollectionLayoutVisibleItem;
};

/**
 * @since 7.0
 */
declare const enum NSControlCharacterAction {

	ZeroAdvancement = 1,

	Whitespace = 2,

	HorizontalTab = 4,

	LineBreak = 8,

	ParagraphBreak = 16,

	ContainerBreak = 32
}

declare const NSControlCharacterContainerBreakAction: number;

declare const NSControlCharacterHorizontalTabAction: number;

declare const NSControlCharacterLineBreakAction: number;

declare const NSControlCharacterParagraphBreakAction: number;

declare const NSControlCharacterWhitespaceAction: number;

declare const NSControlCharacterZeroAdvancementAction: number;

/**
 * @since 9.0
 */
declare class NSDataAsset extends NSObject implements NSCopying {

	static alloc(): NSDataAsset; // inherited from NSObject

	static new(): NSDataAsset; // inherited from NSObject

	readonly data: NSData;

	readonly name: string;

	readonly typeIdentifier: string;

	constructor(o: { name: string; });

	constructor(o: { name: string; bundle: NSBundle; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithName(name: string): this;

	initWithNameBundle(name: string, bundle: NSBundle): this;
}

/**
 * @since 6.0
 */
declare var NSDefaultAttributesDocumentAttribute: string;

/**
 * @since 6.0
 */
declare var NSDefaultAttributesDocumentOption: string;

/**
 * @since 17.0
 */
declare var NSDefaultFontExcludedDocumentAttribute: string;

/**
 * @since 7.0
 */
declare var NSDefaultTabIntervalDocumentAttribute: string;

/**
 * @since 14.0
 */
declare class NSDiffableDataSourceSectionSnapshot<ItemIdentifierType> extends NSObject implements NSCopying {

	static alloc<ItemIdentifierType>(): NSDiffableDataSourceSectionSnapshot<ItemIdentifierType>; // inherited from NSObject

	static new<ItemIdentifierType>(): NSDiffableDataSourceSectionSnapshot<ItemIdentifierType>; // inherited from NSObject

	readonly items: NSArray<any>;

	readonly rootItems: NSArray<any>;

	readonly visibleItems: NSArray<any>;

	appendItems(items: NSArray<any> | any[]): void;

	appendItemsIntoParentItem(items: NSArray<any> | any[], parentItem: any): void;

	collapseItems(items: NSArray<any> | any[]): void;

	containsItem(item: any): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	deleteAllItems(): void;

	deleteItems(items: NSArray<any> | any[]): void;

	expandItems(items: NSArray<any> | any[]): void;

	expandedItems(): NSArray<any>;

	indexOfItem(item: any): number;

	insertItemsAfterItem(items: NSArray<any> | any[], afterIdentifier: any): void;

	insertItemsBeforeItem(items: NSArray<any> | any[], beforeIdentifier: any): void;

	insertSnapshotAfterItem(snapshot: NSDiffableDataSourceSectionSnapshot<any>, item: any): any;

	insertSnapshotBeforeItem(snapshot: NSDiffableDataSourceSectionSnapshot<any>, item: any): void;

	isExpanded(item: any): boolean;

	isVisible(item: any): boolean;

	levelOfItem(item: any): number;

	parentOfChildItem(childItem: any): any;

	replaceChildrenOfParentItemWithSnapshot(parentItem: any, snapshot: NSDiffableDataSourceSectionSnapshot<any>): void;

	snapshotOfParentItem(parentItem: any): NSDiffableDataSourceSectionSnapshot<any>;

	snapshotOfParentItemIncludingParentItem(parentItem: any, includingParentItem: boolean): NSDiffableDataSourceSectionSnapshot<any>;

	visualDescription(): string;
}

/**
 * @since 14.0
 */
declare class NSDiffableDataSourceSectionTransaction<SectionIdentifierType, ItemIdentifierType> extends NSObject {

	static alloc<SectionIdentifierType, ItemIdentifierType>(): NSDiffableDataSourceSectionTransaction<SectionIdentifierType, ItemIdentifierType>; // inherited from NSObject

	static new<SectionIdentifierType, ItemIdentifierType>(): NSDiffableDataSourceSectionTransaction<SectionIdentifierType, ItemIdentifierType>; // inherited from NSObject

	readonly difference: NSOrderedCollectionDifference<any>;

	readonly finalSnapshot: NSDiffableDataSourceSectionSnapshot<any>;

	readonly initialSnapshot: NSDiffableDataSourceSectionSnapshot<any>;

	readonly sectionIdentifier: any;
}

/**
 * @since 13.0
 */
declare class NSDiffableDataSourceSnapshot<SectionIdentifierType, ItemIdentifierType> extends NSObject implements NSCopying {

	static alloc<SectionIdentifierType, ItemIdentifierType>(): NSDiffableDataSourceSnapshot<SectionIdentifierType, ItemIdentifierType>; // inherited from NSObject

	static new<SectionIdentifierType, ItemIdentifierType>(): NSDiffableDataSourceSnapshot<SectionIdentifierType, ItemIdentifierType>; // inherited from NSObject

	readonly itemIdentifiers: NSArray<any>;

	readonly numberOfItems: number;

	readonly numberOfSections: number;

	/**
	 * @since 15.0
	 */
	readonly reconfiguredItemIdentifiers: NSArray<any>;

	/**
	 * @since 15.0
	 */
	readonly reloadedItemIdentifiers: NSArray<any>;

	/**
	 * @since 15.0
	 */
	readonly reloadedSectionIdentifiers: NSArray<any>;

	readonly sectionIdentifiers: NSArray<any>;

	appendItemsWithIdentifiers(identifiers: NSArray<any> | any[]): void;

	appendItemsWithIdentifiersIntoSectionWithIdentifier(identifiers: NSArray<any> | any[], sectionIdentifier: any): void;

	appendSectionsWithIdentifiers(sectionIdentifiers: NSArray<any> | any[]): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	deleteAllItems(): void;

	deleteItemsWithIdentifiers(identifiers: NSArray<any> | any[]): void;

	deleteSectionsWithIdentifiers(sectionIdentifiers: NSArray<any> | any[]): void;

	indexOfItemIdentifier(itemIdentifier: any): number;

	indexOfSectionIdentifier(sectionIdentifier: any): number;

	insertItemsWithIdentifiersAfterItemWithIdentifier(identifiers: NSArray<any> | any[], itemIdentifier: any): void;

	insertItemsWithIdentifiersBeforeItemWithIdentifier(identifiers: NSArray<any> | any[], itemIdentifier: any): void;

	insertSectionsWithIdentifiersAfterSectionWithIdentifier(sectionIdentifiers: NSArray<any> | any[], toSectionIdentifier: any): void;

	insertSectionsWithIdentifiersBeforeSectionWithIdentifier(sectionIdentifiers: NSArray<any> | any[], toSectionIdentifier: any): void;

	itemIdentifiersInSectionWithIdentifier(sectionIdentifier: any): NSArray<any>;

	moveItemWithIdentifierAfterItemWithIdentifier(fromIdentifier: any, toIdentifier: any): void;

	moveItemWithIdentifierBeforeItemWithIdentifier(fromIdentifier: any, toIdentifier: any): void;

	moveSectionWithIdentifierAfterSectionWithIdentifier(fromSectionIdentifier: any, toSectionIdentifier: any): void;

	moveSectionWithIdentifierBeforeSectionWithIdentifier(fromSectionIdentifier: any, toSectionIdentifier: any): void;

	numberOfItemsInSection(sectionIdentifier: any): number;

	/**
	 * @since 15.0
	 */
	reconfigureItemsWithIdentifiers(identifiers: NSArray<any> | any[]): void;

	reloadItemsWithIdentifiers(identifiers: NSArray<any> | any[]): void;

	reloadSectionsWithIdentifiers(sectionIdentifiers: NSArray<any> | any[]): void;

	sectionIdentifierForSectionContainingItemIdentifier(itemIdentifier: any): any;
}

/**
 * @since 14.0
 */
declare class NSDiffableDataSourceTransaction<SectionIdentifierType, ItemIdentifierType> extends NSObject {

	static alloc<SectionIdentifierType, ItemIdentifierType>(): NSDiffableDataSourceTransaction<SectionIdentifierType, ItemIdentifierType>; // inherited from NSObject

	static new<SectionIdentifierType, ItemIdentifierType>(): NSDiffableDataSourceTransaction<SectionIdentifierType, ItemIdentifierType>; // inherited from NSObject

	readonly difference: NSOrderedCollectionDifference<any>;

	readonly finalSnapshot: NSDiffableDataSourceSnapshot<any, any>;

	readonly initialSnapshot: NSDiffableDataSourceSnapshot<any, any>;

	readonly sectionTransactions: NSArray<NSDiffableDataSourceSectionTransaction<any, any>>;
}

interface NSDirectionalEdgeInsets {
	top: number;
	leading: number;
	bottom: number;
	trailing: number;
}
declare var NSDirectionalEdgeInsets: interop.StructType<NSDirectionalEdgeInsets>;

/**
 * @since 11.0
 */
declare function NSDirectionalEdgeInsetsFromString(string: string): NSDirectionalEdgeInsets;

/**
 * @since 11.0
 */
declare var NSDirectionalEdgeInsetsZero: NSDirectionalEdgeInsets;

/**
 * @since 13.0
 */
declare const enum NSDirectionalRectEdge {

	None = 0,

	Top = 1,

	Leading = 2,

	Bottom = 4,

	Trailing = 8,

	All = 15
}

/**
 * @since 7.0
 */
declare var NSDocumentTypeDocumentAttribute: string;

/**
 * @since 6.0
 */
declare var NSDocumentTypeDocumentOption: string;

/**
 * @since 7.0
 * @deprecated 100000
 */
declare var NSExpansionAttributeName: string;

/**
 * @since 6.0
 */
declare var NSFontAttributeName: string;

/**
 * @since 6.0
 */
declare var NSForegroundColorAttributeName: string;

/**
 * @since 7.0
 */
declare const enum NSGlyphProperty {

	Null = 1,

	ControlCharacter = 2,

	Elastic = 4,

	NonBaseCharacter = 8
}

/**
 * @since 7.0
 */
declare var NSHTMLTextDocumentType: string;

/**
 * @since 7.0
 */
declare var NSHyphenationFactorDocumentAttribute: string;

/**
 * @since 6.0
 */
declare var NSKernAttributeName: string;

/**
 * @since 9.0
 */
declare class NSLayoutAnchor<AnchorType> extends NSObject implements NSCoding, NSCopying {

	static alloc<AnchorType>(): NSLayoutAnchor<AnchorType>; // inherited from NSObject

	static new<AnchorType>(): NSLayoutAnchor<AnchorType>; // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constraintEqualToAnchor(anchor: NSLayoutAnchor<any>): NSLayoutConstraint;

	constraintEqualToAnchorConstant(anchor: NSLayoutAnchor<any>, c: number): NSLayoutConstraint;

	constraintGreaterThanOrEqualToAnchor(anchor: NSLayoutAnchor<any>): NSLayoutConstraint;

	constraintGreaterThanOrEqualToAnchorConstant(anchor: NSLayoutAnchor<any>, c: number): NSLayoutConstraint;

	constraintLessThanOrEqualToAnchor(anchor: NSLayoutAnchor<any>): NSLayoutConstraint;

	constraintLessThanOrEqualToAnchorConstant(anchor: NSLayoutAnchor<any>, c: number): NSLayoutConstraint;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum NSLayoutAttribute {

	Left = 1,

	Right = 2,

	Top = 3,

	Bottom = 4,

	Leading = 5,

	Trailing = 6,

	Width = 7,

	Height = 8,

	CenterX = 9,

	CenterY = 10,

	LastBaseline = 11,

	Baseline = 11,

	FirstBaseline = 12,

	LeftMargin = 13,

	RightMargin = 14,

	TopMargin = 15,

	BottomMargin = 16,

	LeadingMargin = 17,

	TrailingMargin = 18,

	CenterXWithinMargins = 19,

	CenterYWithinMargins = 20,

	NotAnAttribute = 0
}

/**
 * @since 6.0
 */
declare class NSLayoutConstraint extends NSObject {

	/**
	 * @since 8.0
	 */
	static activateConstraints(constraints: NSArray<NSLayoutConstraint> | NSLayoutConstraint[]): void;

	static alloc(): NSLayoutConstraint; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	static constraintWithItemAttributeRelatedByToItemAttributeMultiplierConstant(view1: any, attr1: NSLayoutAttribute, relation: NSLayoutRelation, view2: any, attr2: NSLayoutAttribute, multiplier: number, c: number): NSLayoutConstraint;

	/**
	 * @since 6.0
	 */
	static constraintsWithVisualFormatOptionsMetricsViews(format: string, opts: NSLayoutFormatOptions, metrics: NSDictionary<string, any>, views: NSDictionary<string, any>): NSArray<NSLayoutConstraint>;

	/**
	 * @since 8.0
	 */
	static deactivateConstraints(constraints: NSArray<NSLayoutConstraint> | NSLayoutConstraint[]): void;

	static new(): NSLayoutConstraint; // inherited from NSObject

	/**
	 * @since 8.0
	 */
	active: boolean;

	constant: number;

	/**
	 * @since 10.0
	 */
	readonly firstAnchor: NSLayoutAnchor<any>;

	readonly firstAttribute: NSLayoutAttribute;

	readonly firstItem: any;

	/**
	 * @since 7.0
	 */
	identifier: string;

	readonly multiplier: number;

	priority: number;

	readonly relation: NSLayoutRelation;

	/**
	 * @since 10.0
	 */
	readonly secondAnchor: NSLayoutAnchor<any>;

	readonly secondAttribute: NSLayoutAttribute;

	readonly secondItem: any;

	shouldBeArchived: boolean;
}

/**
 * @since 9.0
 */
declare class NSLayoutDimension extends NSLayoutAnchor<NSLayoutDimension> {

	static alloc(): NSLayoutDimension; // inherited from NSObject

	static new(): NSLayoutDimension; // inherited from NSObject

	constraintEqualToAnchorMultiplier(anchor: NSLayoutDimension, m: number): NSLayoutConstraint;

	constraintEqualToAnchorMultiplierConstant(anchor: NSLayoutDimension, m: number, c: number): NSLayoutConstraint;

	constraintEqualToConstant(c: number): NSLayoutConstraint;

	constraintGreaterThanOrEqualToAnchorMultiplier(anchor: NSLayoutDimension, m: number): NSLayoutConstraint;

	constraintGreaterThanOrEqualToAnchorMultiplierConstant(anchor: NSLayoutDimension, m: number, c: number): NSLayoutConstraint;

	constraintGreaterThanOrEqualToConstant(c: number): NSLayoutConstraint;

	constraintLessThanOrEqualToAnchorMultiplier(anchor: NSLayoutDimension, m: number): NSLayoutConstraint;

	constraintLessThanOrEqualToAnchorMultiplierConstant(anchor: NSLayoutDimension, m: number, c: number): NSLayoutConstraint;

	constraintLessThanOrEqualToConstant(c: number): NSLayoutConstraint;
}

declare const enum NSLayoutFormatOptions {

	AlignAllLeft = 2,

	AlignAllRight = 4,

	AlignAllTop = 8,

	AlignAllBottom = 16,

	AlignAllLeading = 32,

	AlignAllTrailing = 64,

	AlignAllCenterX = 512,

	AlignAllCenterY = 1024,

	AlignAllLastBaseline = 2048,

	AlignAllFirstBaseline = 4096,

	AlignAllBaseline = 2048,

	AlignmentMask = 65535,

	DirectionLeadingToTrailing = 0,

	DirectionLeftToRight = 65536,

	DirectionRightToLeft = 131072,

	DirectionMask = 196608,

	SpacingEdgeToEdge = 0,

	SpacingBaselineToBaseline = 524288,

	SpacingMask = 524288
}

/**
 * @since 7.0
 */
declare class NSLayoutManager extends NSObject implements NSSecureCoding {

	static alloc(): NSLayoutManager; // inherited from NSObject

	static new(): NSLayoutManager; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	allowsNonContiguousLayout: boolean;

	delegate: NSLayoutManagerDelegate;

	readonly extraLineFragmentRect: CGRect;

	readonly extraLineFragmentTextContainer: NSTextContainer;

	readonly extraLineFragmentUsedRect: CGRect;

	/**
	 * @since 7.0
	 */
	readonly hasNonContiguousLayout: boolean;

	/**
	 * @since 7.0
	 * @deprecated 13.0
	 */
	hyphenationFactor: number;

	/**
	 * @since 12.0
	 */
	limitsLayoutForSuspiciousContents: boolean;

	readonly numberOfGlyphs: number;

	showsControlCharacters: boolean;

	showsInvisibleCharacters: boolean;

	readonly textContainers: NSArray<NSTextContainer>;

	textStorage: NSTextStorage;

	/**
	 * @since 13.0
	 */
	usesDefaultHyphenation: boolean;

	usesFontLeading: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 7.0
	 */
	CGGlyphAtIndex(glyphIndex: number): number;

	/**
	 * @since 7.0
	 */
	CGGlyphAtIndexIsValidIndex(glyphIndex: number, isValidIndex: interop.Pointer | interop.Reference<boolean>): number;

	addTextContainer(container: NSTextContainer): void;

	attachmentSizeForGlyphAtIndex(glyphIndex: number): CGSize;

	boundingRectForGlyphRangeInTextContainer(glyphRange: NSRange, container: NSTextContainer): CGRect;

	characterIndexForGlyphAtIndex(glyphIndex: number): number;

	characterIndexForPointInTextContainerFractionOfDistanceBetweenInsertionPoints(point: CGPoint, container: NSTextContainer, partialFraction: interop.Pointer | interop.Reference<number>): number;

	characterRangeForGlyphRangeActualGlyphRange(glyphRange: NSRange, actualGlyphRange: interop.Pointer | interop.Reference<NSRange>): NSRange;

	drawBackgroundForGlyphRangeAtPoint(glyphsToShow: NSRange, origin: CGPoint): void;

	drawGlyphsForGlyphRangeAtPoint(glyphsToShow: NSRange, origin: CGPoint): void;

	drawStrikethroughForGlyphRangeStrikethroughTypeBaselineOffsetLineFragmentRectLineFragmentGlyphRangeContainerOrigin(glyphRange: NSRange, strikethroughVal: NSUnderlineStyle, baselineOffset: number, lineRect: CGRect, lineGlyphRange: NSRange, containerOrigin: CGPoint): void;

	drawUnderlineForGlyphRangeUnderlineTypeBaselineOffsetLineFragmentRectLineFragmentGlyphRangeContainerOrigin(glyphRange: NSRange, underlineVal: NSUnderlineStyle, baselineOffset: number, lineRect: CGRect, lineGlyphRange: NSRange, containerOrigin: CGPoint): void;

	drawsOutsideLineFragmentForGlyphAtIndex(glyphIndex: number): boolean;

	encodeWithCoder(coder: NSCoder): void;

	ensureGlyphsForCharacterRange(charRange: NSRange): void;

	ensureGlyphsForGlyphRange(glyphRange: NSRange): void;

	ensureLayoutForBoundingRectInTextContainer(bounds: CGRect, container: NSTextContainer): void;

	ensureLayoutForCharacterRange(charRange: NSRange): void;

	ensureLayoutForGlyphRange(glyphRange: NSRange): void;

	ensureLayoutForTextContainer(container: NSTextContainer): void;

	/**
	 * @since 7.0
	 */
	enumerateEnclosingRectsForGlyphRangeWithinSelectedGlyphRangeInTextContainerUsingBlock(glyphRange: NSRange, selectedRange: NSRange, textContainer: NSTextContainer, block: (p1: CGRect, p2: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 7.0
	 */
	enumerateLineFragmentsForGlyphRangeUsingBlock(glyphRange: NSRange, block: (p1: CGRect, p2: CGRect, p3: NSTextContainer, p4: NSRange, p5: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 7.0
	 */
	fillBackgroundRectArrayCountForCharacterRangeColor(rectArray: interop.Pointer | interop.Reference<CGRect>, rectCount: number, charRange: NSRange, color: UIColor): void;

	firstUnlaidCharacterIndex(): number;

	firstUnlaidGlyphIndex(): number;

	fractionOfDistanceThroughGlyphForPointInTextContainer(point: CGPoint, container: NSTextContainer): number;

	getFirstUnlaidCharacterIndexGlyphIndex(charIndex: interop.Pointer | interop.Reference<number>, glyphIndex: interop.Pointer | interop.Reference<number>): void;

	/**
	 * @since 7.0
	 */
	getGlyphsInRangeGlyphsPropertiesCharacterIndexesBidiLevels(glyphRange: NSRange, glyphBuffer: interop.Pointer | interop.Reference<number>, props: interop.Pointer | interop.Reference<NSGlyphProperty>, charIndexBuffer: interop.Pointer | interop.Reference<number>, bidiLevelBuffer: string | interop.Pointer | interop.Reference<any>): number;

	getLineFragmentInsertionPointsForCharacterAtIndexAlternatePositionsInDisplayOrderPositionsCharacterIndexes(charIndex: number, aFlag: boolean, dFlag: boolean, positions: interop.Pointer | interop.Reference<number>, charIndexes: interop.Pointer | interop.Reference<number>): number;

	glyphAtIndex(glyphIndex: number): number;

	glyphAtIndexIsValidIndex(glyphIndex: number, isValidIndex: interop.Pointer | interop.Reference<boolean>): number;

	glyphIndexForCharacterAtIndex(charIndex: number): number;

	glyphIndexForPointInTextContainer(point: CGPoint, container: NSTextContainer): number;

	glyphIndexForPointInTextContainerFractionOfDistanceThroughGlyph(point: CGPoint, container: NSTextContainer, partialFraction: interop.Pointer | interop.Reference<number>): number;

	glyphRangeForBoundingRectInTextContainer(bounds: CGRect, container: NSTextContainer): NSRange;

	glyphRangeForBoundingRectWithoutAdditionalLayoutInTextContainer(bounds: CGRect, container: NSTextContainer): NSRange;

	glyphRangeForCharacterRangeActualCharacterRange(charRange: NSRange, actualCharRange: interop.Pointer | interop.Reference<NSRange>): NSRange;

	glyphRangeForTextContainer(container: NSTextContainer): NSRange;

	initWithCoder(coder: NSCoder): this;

	insertTextContainerAtIndex(container: NSTextContainer, index: number): void;

	invalidateDisplayForCharacterRange(charRange: NSRange): void;

	invalidateDisplayForGlyphRange(glyphRange: NSRange): void;

	invalidateGlyphsForCharacterRangeChangeInLengthActualCharacterRange(charRange: NSRange, delta: number, actualCharRange: interop.Pointer | interop.Reference<NSRange>): void;

	/**
	 * @since 7.0
	 */
	invalidateLayoutForCharacterRangeActualCharacterRange(charRange: NSRange, actualCharRange: interop.Pointer | interop.Reference<NSRange>): void;

	/**
	 * @since 7.0
	 */
	isValidGlyphIndex(glyphIndex: number): boolean;

	lineFragmentRectForGlyphAtIndexEffectiveRange(glyphIndex: number, effectiveGlyphRange: interop.Pointer | interop.Reference<NSRange>): CGRect;

	/**
	 * @since 9.0
	 */
	lineFragmentRectForGlyphAtIndexEffectiveRangeWithoutAdditionalLayout(glyphIndex: number, effectiveGlyphRange: interop.Pointer | interop.Reference<NSRange>, flag: boolean): CGRect;

	lineFragmentUsedRectForGlyphAtIndexEffectiveRange(glyphIndex: number, effectiveGlyphRange: interop.Pointer | interop.Reference<NSRange>): CGRect;

	/**
	 * @since 9.0
	 */
	lineFragmentUsedRectForGlyphAtIndexEffectiveRangeWithoutAdditionalLayout(glyphIndex: number, effectiveGlyphRange: interop.Pointer | interop.Reference<NSRange>, flag: boolean): CGRect;

	locationForGlyphAtIndex(glyphIndex: number): CGPoint;

	notShownAttributeForGlyphAtIndex(glyphIndex: number): boolean;

	/**
	 * @since 7.0
	 */
	processEditingForTextStorageEditedRangeChangeInLengthInvalidatedRange(textStorage: NSTextStorage, editMask: NSTextStorageEditActions, newCharRange: NSRange, delta: number, invalidatedCharRange: NSRange): void;

	/**
	 * @since 7.0
	 */
	propertyForGlyphAtIndex(glyphIndex: number): NSGlyphProperty;

	rangeOfNominallySpacedGlyphsContainingIndex(glyphIndex: number): NSRange;

	removeTextContainerAtIndex(index: number): void;

	setAttachmentSizeForGlyphRange(attachmentSize: CGSize, glyphRange: NSRange): void;

	setDrawsOutsideLineFragmentForGlyphAtIndex(flag: boolean, glyphIndex: number): void;

	setExtraLineFragmentRectUsedRectTextContainer(fragmentRect: CGRect, usedRect: CGRect, container: NSTextContainer): void;

	/**
	 * @since 7.0
	 */
	setGlyphsPropertiesCharacterIndexesFontForGlyphRange(glyphs: interop.Pointer | interop.Reference<number>, props: interop.Pointer | interop.Reference<NSGlyphProperty>, charIndexes: interop.Pointer | interop.Reference<number>, aFont: UIFont, glyphRange: NSRange): void;

	setLineFragmentRectForGlyphRangeUsedRect(fragmentRect: CGRect, glyphRange: NSRange, usedRect: CGRect): void;

	setLocationForStartOfGlyphRange(location: CGPoint, glyphRange: NSRange): void;

	setNotShownAttributeForGlyphAtIndex(flag: boolean, glyphIndex: number): void;

	setTextContainerForGlyphRange(container: NSTextContainer, glyphRange: NSRange): void;

	/**
	 * @since 7.0
	 * @deprecated 13.0
	 */
	showCGGlyphsPositionsCountFontMatrixAttributesInContext(glyphs: interop.Pointer | interop.Reference<number>, positions: interop.Pointer | interop.Reference<CGPoint>, glyphCount: number, font: UIFont, textMatrix: CGAffineTransform, attributes: NSDictionary<string, any>, graphicsContext: any): void;

	/**
	 * @since 13.0
	 */
	showCGGlyphsPositionsCountFontTextMatrixAttributesInContext(glyphs: interop.Pointer | interop.Reference<number>, positions: interop.Pointer | interop.Reference<CGPoint>, glyphCount: number, font: UIFont, textMatrix: CGAffineTransform, attributes: NSDictionary<string, any>, CGContext: any): void;

	strikethroughGlyphRangeStrikethroughTypeLineFragmentRectLineFragmentGlyphRangeContainerOrigin(glyphRange: NSRange, strikethroughVal: NSUnderlineStyle, lineRect: CGRect, lineGlyphRange: NSRange, containerOrigin: CGPoint): void;

	textContainerChangedGeometry(container: NSTextContainer): void;

	textContainerForGlyphAtIndexEffectiveRange(glyphIndex: number, effectiveGlyphRange: interop.Pointer | interop.Reference<NSRange>): NSTextContainer;

	/**
	 * @since 9.0
	 */
	textContainerForGlyphAtIndexEffectiveRangeWithoutAdditionalLayout(glyphIndex: number, effectiveGlyphRange: interop.Pointer | interop.Reference<NSRange>, flag: boolean): NSTextContainer;

	/**
	 * @since 7.0
	 */
	truncatedGlyphRangeInLineFragmentForGlyphAtIndex(glyphIndex: number): NSRange;

	underlineGlyphRangeUnderlineTypeLineFragmentRectLineFragmentGlyphRangeContainerOrigin(glyphRange: NSRange, underlineVal: NSUnderlineStyle, lineRect: CGRect, lineGlyphRange: NSRange, containerOrigin: CGPoint): void;

	usedRectForTextContainer(container: NSTextContainer): CGRect;
}

interface NSLayoutManagerDelegate extends NSObjectProtocol {

	/**
	 * @since 7.0
	 */
	layoutManagerBoundingBoxForControlGlyphAtIndexForTextContainerProposedLineFragmentGlyphPositionCharacterIndex?(layoutManager: NSLayoutManager, glyphIndex: number, textContainer: NSTextContainer, proposedRect: CGRect, glyphPosition: CGPoint, charIndex: number): CGRect;

	/**
	 * @since 7.0
	 */
	layoutManagerDidCompleteLayoutForTextContainerAtEnd?(layoutManager: NSLayoutManager, textContainer: NSTextContainer, layoutFinishedFlag: boolean): void;

	/**
	 * @since 7.0
	 */
	layoutManagerDidInvalidateLayout?(sender: NSLayoutManager): void;

	/**
	 * @since 7.0
	 */
	layoutManagerLineSpacingAfterGlyphAtIndexWithProposedLineFragmentRect?(layoutManager: NSLayoutManager, glyphIndex: number, rect: CGRect): number;

	/**
	 * @since 7.0
	 */
	layoutManagerParagraphSpacingAfterGlyphAtIndexWithProposedLineFragmentRect?(layoutManager: NSLayoutManager, glyphIndex: number, rect: CGRect): number;

	/**
	 * @since 7.0
	 */
	layoutManagerParagraphSpacingBeforeGlyphAtIndexWithProposedLineFragmentRect?(layoutManager: NSLayoutManager, glyphIndex: number, rect: CGRect): number;

	/**
	 * @since 7.0
	 */
	layoutManagerShouldBreakLineByHyphenatingBeforeCharacterAtIndex?(layoutManager: NSLayoutManager, charIndex: number): boolean;

	/**
	 * @since 7.0
	 */
	layoutManagerShouldBreakLineByWordBeforeCharacterAtIndex?(layoutManager: NSLayoutManager, charIndex: number): boolean;

	/**
	 * @since 7.0
	 */
	layoutManagerShouldGenerateGlyphsPropertiesCharacterIndexesFontForGlyphRange?(layoutManager: NSLayoutManager, glyphs: interop.Pointer | interop.Reference<number>, props: interop.Pointer | interop.Reference<NSGlyphProperty>, charIndexes: interop.Pointer | interop.Reference<number>, aFont: UIFont, glyphRange: NSRange): number;

	/**
	 * @since 9.0
	 */
	layoutManagerShouldSetLineFragmentRectLineFragmentUsedRectBaselineOffsetInTextContainerForGlyphRange?(layoutManager: NSLayoutManager, lineFragmentRect: interop.Pointer | interop.Reference<CGRect>, lineFragmentUsedRect: interop.Pointer | interop.Reference<CGRect>, baselineOffset: interop.Pointer | interop.Reference<number>, textContainer: NSTextContainer, glyphRange: NSRange): boolean;

	/**
	 * @since 7.0
	 */
	layoutManagerShouldUseActionForControlCharacterAtIndex?(layoutManager: NSLayoutManager, action: NSControlCharacterAction, charIndex: number): NSControlCharacterAction;

	/**
	 * @since 7.0
	 */
	layoutManagerTextContainerDidChangeGeometryFromSize?(layoutManager: NSLayoutManager, textContainer: NSTextContainer, oldSize: CGSize): void;
}
declare var NSLayoutManagerDelegate: {

	prototype: NSLayoutManagerDelegate;
};

declare const enum NSLayoutRelation {

	LessThanOrEqual = -1,

	Equal = 0,

	GreaterThanOrEqual = 1
}

/**
 * @since 9.0
 */
declare class NSLayoutXAxisAnchor extends NSLayoutAnchor<NSLayoutXAxisAnchor> {

	static alloc(): NSLayoutXAxisAnchor; // inherited from NSObject

	static new(): NSLayoutXAxisAnchor; // inherited from NSObject

	/**
	 * @since 10.0
	 */
	anchorWithOffsetToAnchor(otherAnchor: NSLayoutXAxisAnchor): NSLayoutDimension;

	/**
	 * @since 11.0
	 */
	constraintEqualToSystemSpacingAfterAnchorMultiplier(anchor: NSLayoutXAxisAnchor, multiplier: number): NSLayoutConstraint;

	/**
	 * @since 11.0
	 */
	constraintGreaterThanOrEqualToSystemSpacingAfterAnchorMultiplier(anchor: NSLayoutXAxisAnchor, multiplier: number): NSLayoutConstraint;

	/**
	 * @since 11.0
	 */
	constraintLessThanOrEqualToSystemSpacingAfterAnchorMultiplier(anchor: NSLayoutXAxisAnchor, multiplier: number): NSLayoutConstraint;
}

/**
 * @since 9.0
 */
declare class NSLayoutYAxisAnchor extends NSLayoutAnchor<NSLayoutYAxisAnchor> {

	static alloc(): NSLayoutYAxisAnchor; // inherited from NSObject

	static new(): NSLayoutYAxisAnchor; // inherited from NSObject

	/**
	 * @since 10.0
	 */
	anchorWithOffsetToAnchor(otherAnchor: NSLayoutYAxisAnchor): NSLayoutDimension;

	/**
	 * @since 11.0
	 */
	constraintEqualToSystemSpacingBelowAnchorMultiplier(anchor: NSLayoutYAxisAnchor, multiplier: number): NSLayoutConstraint;

	/**
	 * @since 11.0
	 */
	constraintGreaterThanOrEqualToSystemSpacingBelowAnchorMultiplier(anchor: NSLayoutYAxisAnchor, multiplier: number): NSLayoutConstraint;

	/**
	 * @since 11.0
	 */
	constraintLessThanOrEqualToSystemSpacingBelowAnchorMultiplier(anchor: NSLayoutYAxisAnchor, multiplier: number): NSLayoutConstraint;
}

/**
 * @since 6.0
 */
declare var NSLigatureAttributeName: string;

/**
 * @since 6.0
 */
declare const enum NSLineBreakMode {

	ByWordWrapping = 0,

	ByCharWrapping = 1,

	ByClipping = 2,

	ByTruncatingHead = 3,

	ByTruncatingTail = 4,

	ByTruncatingMiddle = 5
}

/**
 * @since 9.0
 */
declare const enum NSLineBreakStrategy {

	None = 0,

	PushOut = 1,

	HangulWordPriority = 2,

	Standard = 65535
}

/**
 * @since 7.0
 */
declare var NSLinkAttributeName: string;

/**
 * @since 6.0
 */
declare class NSMutableParagraphStyle extends NSParagraphStyle {

	static alloc(): NSMutableParagraphStyle; // inherited from NSObject

	static new(): NSMutableParagraphStyle; // inherited from NSObject

	alignment: NSTextAlignment;

	/**
	 * @since 9.0
	 */
	allowsDefaultTighteningForTruncation: boolean;

	baseWritingDirection: NSWritingDirection;

	/**
	 * @since 7.0
	 */
	defaultTabInterval: number;

	firstLineHeadIndent: number;

	headIndent: number;

	hyphenationFactor: number;

	lineBreakMode: NSLineBreakMode;

	/**
	 * @since 9.0
	 */
	lineBreakStrategy: NSLineBreakStrategy;

	lineHeightMultiple: number;

	lineSpacing: number;

	maximumLineHeight: number;

	minimumLineHeight: number;

	paragraphSpacing: number;

	paragraphSpacingBefore: number;

	/**
	 * @since 7.0
	 */
	tabStops: NSArray<NSTextTab>;

	tailIndent: number;

	/**
	 * @since 7.0
	 */
	textLists: NSArray<NSTextList>;

	/**
	 * @since 15.0
	 */
	usesDefaultHyphenation: boolean;

	/**
	 * @since 9.0
	 */
	addTabStop(anObject: NSTextTab): void;

	/**
	 * @since 9.0
	 */
	removeTabStop(anObject: NSTextTab): void;

	/**
	 * @since 9.0
	 */
	setParagraphStyle(obj: NSParagraphStyle): void;
}

/**
 * @since 7.0
 * @deprecated 100000
 */
declare var NSObliquenessAttributeName: string;

/**
 * @since 6.0
 */
declare var NSPaperMarginDocumentAttribute: string;

/**
 * @since 7.0
 */
declare var NSPaperSizeDocumentAttribute: string;

/**
 * @since 6.0
 */
declare class NSParagraphStyle extends NSObject implements NSCopying, NSMutableCopying, NSSecureCoding {

	static alloc(): NSParagraphStyle; // inherited from NSObject

	static defaultWritingDirectionForLanguage(languageName: string): NSWritingDirection;

	static new(): NSParagraphStyle; // inherited from NSObject

	readonly alignment: NSTextAlignment;

	/**
	 * @since 9.0
	 */
	readonly allowsDefaultTighteningForTruncation: boolean;

	readonly baseWritingDirection: NSWritingDirection;

	/**
	 * @since 7.0
	 */
	readonly defaultTabInterval: number;

	readonly firstLineHeadIndent: number;

	readonly headIndent: number;

	readonly hyphenationFactor: number;

	readonly lineBreakMode: NSLineBreakMode;

	/**
	 * @since 9.0
	 */
	readonly lineBreakStrategy: NSLineBreakStrategy;

	readonly lineHeightMultiple: number;

	readonly lineSpacing: number;

	readonly maximumLineHeight: number;

	readonly minimumLineHeight: number;

	readonly paragraphSpacing: number;

	readonly paragraphSpacingBefore: number;

	/**
	 * @since 7.0
	 */
	readonly tabStops: NSArray<NSTextTab>;

	readonly tailIndent: number;

	/**
	 * @since 7.0
	 */
	readonly textLists: NSArray<NSTextList>;

	/**
	 * @since 15.0
	 */
	readonly usesDefaultHyphenation: boolean;

	static readonly defaultParagraphStyle: NSParagraphStyle;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 6.0
 */
declare var NSParagraphStyleAttributeName: string;

/**
 * @since 7.0
 */
declare var NSPlainTextDocumentType: string;

/**
 * @since 7.0
 */
declare var NSRTFDTextDocumentType: string;

/**
 * @since 7.0
 */
declare var NSRTFTextDocumentType: string;

/**
 * @since 7.0
 */
declare var NSReadOnlyDocumentAttribute: string;

/**
 * @since 13.0
 */
declare const enum NSRectAlignment {

	None = 0,

	Top = 1,

	TopLeading = 2,

	Leading = 3,

	BottomLeading = 4,

	Bottom = 5,

	BottomTrailing = 6,

	Trailing = 7,

	TopTrailing = 8
}

/**
 * @since 6.0
 */
declare class NSShadow extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSShadow; // inherited from NSObject

	static new(): NSShadow; // inherited from NSObject

	shadowBlurRadius: number;

	shadowColor: any;

	shadowOffset: CGSize;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 6.0
 */
declare var NSShadowAttributeName: string;

/**
 * @since 13.0
 */
declare var NSSourceTextScalingDocumentAttribute: string;

/**
 * @since 13.0
 */
declare var NSSourceTextScalingDocumentOption: string;

/**
 * @since 7.0
 */
declare var NSStrikethroughColorAttributeName: string;

/**
 * @since 6.0
 */
declare var NSStrikethroughStyleAttributeName: string;

/**
 * @since 6.0
 */
declare class NSStringDrawingContext extends NSObject {

	static alloc(): NSStringDrawingContext; // inherited from NSObject

	static new(): NSStringDrawingContext; // inherited from NSObject

	readonly actualScaleFactor: number;

	/**
	 * @since 6.0
	 * @deprecated 7.0
	 */
	readonly actualTrackingAdjustment: number;

	minimumScaleFactor: number;

	/**
	 * @since 6.0
	 * @deprecated 7.0
	 */
	minimumTrackingAdjustment: number;

	readonly totalBounds: CGRect;
}

/**
 * @since 6.0
 */
declare const enum NSStringDrawingOptions {

	UsesLineFragmentOrigin = 1,

	UsesFontLeading = 2,

	UsesDeviceMetrics = 8,

	TruncatesLastVisibleLine = 32
}

declare function NSStringFromCGAffineTransform(transform: CGAffineTransform): string;

declare function NSStringFromCGPoint(point: CGPoint): string;

declare function NSStringFromCGRect(rect: CGRect): string;

declare function NSStringFromCGSize(size: CGSize): string;

declare function NSStringFromCGVector(vector: CGVector): string;

/**
 * @since 11.0
 */
declare function NSStringFromDirectionalEdgeInsets(insets: NSDirectionalEdgeInsets): string;

declare function NSStringFromUIEdgeInsets(insets: UIEdgeInsets): string;

declare function NSStringFromUIOffset(offset: UIOffset): string;

/**
 * @since 6.0
 */
declare var NSStrokeColorAttributeName: string;

/**
 * @since 6.0
 */
declare var NSStrokeWidthAttributeName: string;

/**
 * @since 7.0
 */
declare var NSTabColumnTerminatorsAttributeName: string;

/**
 * @since 13.0
 */
declare var NSTargetTextScalingDocumentOption: string;

/**
 * @since 6.0
 */
declare const enum NSTextAlignment {

	Left = 0,

	Center = 1,

	Right = 2,

	Justified = 3,

	Natural = 4
}

/**
 * @since 6.0
 */
declare function NSTextAlignmentFromCTTextAlignment(ctTextAlignment: CTTextAlignment): NSTextAlignment;

/**
 * @since 6.0
 */
declare function NSTextAlignmentToCTTextAlignment(nsTextAlignment: NSTextAlignment): CTTextAlignment;

/**
 * @since 7.0
 */
declare class NSTextAttachment extends NSObject implements NSSecureCoding, NSTextAttachmentContainer, NSTextAttachmentLayout, UIAccessibilityContentSizeCategoryImageAdjusting {

	static alloc(): NSTextAttachment; // inherited from NSObject

	static new(): NSTextAttachment; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	static registerTextAttachmentViewProviderClassForFileType(textAttachmentViewProviderClass: typeof NSObject, fileType: string): void;

	/**
	 * @since 15.0
	 */
	static textAttachmentViewProviderClassForFileType(fileType: string): typeof NSObject;

	/**
	 * @since 13.0
	 */
	static textAttachmentWithImage(image: UIImage): NSTextAttachment;

	/**
	 * @since 15.0
	 */
	allowsTextAttachmentView: boolean;

	/**
	 * @since 7.0
	 */
	bounds: CGRect;

	/**
	 * @since 7.0
	 */
	contents: NSData;

	/**
	 * @since 7.0
	 */
	fileType: string;

	fileWrapper: NSFileWrapper;

	/**
	 * @since 7.0
	 */
	image: UIImage;

	/**
	 * @since 15.0
	 */
	lineLayoutPadding: number;

	/**
	 * @since 15.0
	 */
	readonly usesTextAttachmentView: boolean;

	adjustsImageSizeForAccessibilityContentSizeCategory: boolean; // inherited from UIAccessibilityContentSizeCategoryImageAdjusting

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 7.0
	 */
	constructor(o: { data: NSData; ofType: string; });

	/**
	 * @since 15.0
	 */
	attachmentBoundsForAttributesLocationTextContainerProposedLineFragmentPosition(attributes: NSDictionary<string, any>, location: NSTextLocation, textContainer: NSTextContainer, proposedLineFragment: CGRect, position: CGPoint): CGRect;

	/**
	 * @since 7.0
	 */
	attachmentBoundsForTextContainerProposedLineFragmentGlyphPositionCharacterIndex(textContainer: NSTextContainer, lineFrag: CGRect, position: CGPoint, charIndex: number): CGRect;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 15.0
	 */
	imageForBoundsAttributesLocationTextContainer(bounds: CGRect, attributes: NSDictionary<string, any>, location: NSTextLocation, textContainer: NSTextContainer): UIImage;

	/**
	 * @since 7.0
	 */
	imageForBoundsTextContainerCharacterIndex(imageBounds: CGRect, textContainer: NSTextContainer, charIndex: number): UIImage;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 7.0
	 */
	initWithDataOfType(contentData: NSData, uti: string): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 15.0
	 */
	viewProviderForParentViewLocationTextContainer(parentView: UIView, location: NSTextLocation, textContainer: NSTextContainer): NSTextAttachmentViewProvider;
}

/**
 * @since 7.0
 */
interface NSTextAttachmentContainer extends NSObjectProtocol {

	/**
	 * @since 7.0
	 */
	attachmentBoundsForTextContainerProposedLineFragmentGlyphPositionCharacterIndex(textContainer: NSTextContainer, lineFrag: CGRect, position: CGPoint, charIndex: number): CGRect;

	/**
	 * @since 7.0
	 */
	imageForBoundsTextContainerCharacterIndex(imageBounds: CGRect, textContainer: NSTextContainer, charIndex: number): UIImage;
}
declare var NSTextAttachmentContainer: {

	prototype: NSTextAttachmentContainer;
};

/**
 * @since 15.0
 */
interface NSTextAttachmentLayout extends NSObjectProtocol {

	/**
	 * @since 15.0
	 */
	attachmentBoundsForAttributesLocationTextContainerProposedLineFragmentPosition(attributes: NSDictionary<string, any>, location: NSTextLocation, textContainer: NSTextContainer, proposedLineFragment: CGRect, position: CGPoint): CGRect;

	/**
	 * @since 15.0
	 */
	imageForBoundsAttributesLocationTextContainer(bounds: CGRect, attributes: NSDictionary<string, any>, location: NSTextLocation, textContainer: NSTextContainer): UIImage;

	/**
	 * @since 15.0
	 */
	viewProviderForParentViewLocationTextContainer(parentView: UIView, location: NSTextLocation, textContainer: NSTextContainer): NSTextAttachmentViewProvider;
}
declare var NSTextAttachmentLayout: {

	prototype: NSTextAttachmentLayout;
};

/**
 * @since 15.0
 */
declare class NSTextAttachmentViewProvider extends NSObject {

	static alloc(): NSTextAttachmentViewProvider; // inherited from NSObject

	static new(): NSTextAttachmentViewProvider; // inherited from NSObject

	readonly location: NSTextLocation;

	readonly textAttachment: NSTextAttachment;

	readonly textLayoutManager: NSTextLayoutManager;

	tracksTextAttachmentViewBounds: boolean;

	view: UIView;

	constructor(o: { textAttachment: NSTextAttachment; parentView: UIView; textLayoutManager: NSTextLayoutManager; location: NSTextLocation; });

	attachmentBoundsForAttributesLocationTextContainerProposedLineFragmentPosition(attributes: NSDictionary<string, any>, location: NSTextLocation, textContainer: NSTextContainer, proposedLineFragment: CGRect, position: CGPoint): CGRect;

	initWithTextAttachmentParentViewTextLayoutManagerLocation(textAttachment: NSTextAttachment, parentView: UIView, textLayoutManager: NSTextLayoutManager, location: NSTextLocation): this;

	loadView(): void;
}

/**
 * @since 7.0
 */
declare class NSTextContainer extends NSObject implements NSSecureCoding, NSTextLayoutOrientationProvider {

	static alloc(): NSTextContainer; // inherited from NSObject

	static new(): NSTextContainer; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	exclusionPaths: NSArray<UIBezierPath>;

	heightTracksTextView: boolean;

	/**
	 * @since 9.0
	 */
	layoutManager: NSLayoutManager;

	/**
	 * @since 7.0
	 */
	lineBreakMode: NSLineBreakMode;

	lineFragmentPadding: number;

	/**
	 * @since 7.0
	 */
	maximumNumberOfLines: number;

	/**
	 * @since 9.0
	 */
	readonly simpleRectangularTextContainer: boolean;

	/**
	 * @since 7.0
	 */
	size: CGSize;

	/**
	 * @since 15.0
	 */
	readonly textLayoutManager: NSTextLayoutManager;

	widthTracksTextView: boolean;

	/**
	 * @since 7.0
	 */
	readonly layoutOrientation: NSTextLayoutOrientation; // inherited from NSTextLayoutOrientationProvider

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 7.0
	 */
	constructor(o: { size: CGSize; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 7.0
	 */
	initWithSize(size: CGSize): this;

	/**
	 * @since 7.0
	 */
	lineFragmentRectForProposedRectAtIndexWritingDirectionRemainingRect(proposedRect: CGRect, characterIndex: number, baseWritingDirection: NSWritingDirection, remainingRect: interop.Pointer | interop.Reference<CGRect>): CGRect;

	/**
	 * @since 9.0
	 */
	replaceLayoutManager(newLayoutManager: NSLayoutManager): void;
}

/**
 * @since 15.0
 */
declare class NSTextContentManager extends NSObject implements NSSecureCoding, NSTextElementProvider {

	static alloc(): NSTextContentManager; // inherited from NSObject

	static new(): NSTextContentManager; // inherited from NSObject

	automaticallySynchronizesTextLayoutManagers: boolean;

	automaticallySynchronizesToBackingStore: boolean;

	delegate: NSTextContentManagerDelegate;

	readonly hasEditingTransaction: boolean;

	primaryTextLayoutManager: NSTextLayoutManager;

	readonly textLayoutManagers: NSArray<NSTextLayoutManager>;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly documentRange: NSTextRange; // inherited from NSTextElementProvider

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addTextLayoutManager(textLayoutManager: NSTextLayoutManager): void;

	adjustedRangeFromRangeForEditingTextSelection(textRange: NSTextRange, forEditingTextSelection: boolean): NSTextRange;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	encodeWithCoder(coder: NSCoder): void;

	enumerateTextElementsFromLocationOptionsUsingBlock(textLocation: NSTextLocation, options: NSTextContentManagerEnumerationOptions, block: (p1: NSTextElement) => boolean): NSTextLocation;

	initWithCoder(coder: NSCoder): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	locationFromLocationWithOffset(location: NSTextLocation, offset: number): NSTextLocation;

	offsetFromLocationToLocation(from: NSTextLocation, to: NSTextLocation): number;

	performEditingTransactionUsingBlock(transaction: () => void): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	recordEditActionInRangeNewTextRange(originalTextRange: NSTextRange, newTextRange: NSTextRange): void;

	removeTextLayoutManager(textLayoutManager: NSTextLayoutManager): void;

	replaceContentsInRangeWithTextElements(range: NSTextRange, textElements: NSArray<NSTextElement> | NSTextElement[]): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	synchronizeTextLayoutManagers(completionHandler: (p1: NSError) => void): void;

	synchronizeToBackingStore(completionHandler: (p1: NSError) => void): void;

	textElementsForRange(range: NSTextRange): NSArray<NSTextElement>;
}

/**
 * @since 15.0
 */
interface NSTextContentManagerDelegate extends NSObjectProtocol {

	textContentManagerShouldEnumerateTextElementOptions?(textContentManager: NSTextContentManager, textElement: NSTextElement, options: NSTextContentManagerEnumerationOptions): boolean;

	textContentManagerTextElementAtLocation?(textContentManager: NSTextContentManager, location: NSTextLocation): NSTextElement;
}
declare var NSTextContentManagerDelegate: {

	prototype: NSTextContentManagerDelegate;
};

/**
 * @since 15.0
 */
declare const enum NSTextContentManagerEnumerationOptions {

	None = 0,

	Reverse = 1
}

/**
 * @since 15.0
 */
declare class NSTextContentStorage extends NSTextContentManager implements NSTextStorageObserving {

	static alloc(): NSTextContentStorage; // inherited from NSObject

	static new(): NSTextContentStorage; // inherited from NSObject

	attributedString: NSAttributedString;

	delegate: NSTextContentStorageDelegate;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	textStorage: NSTextStorage; // inherited from NSTextStorageObserving

	readonly  // inherited from NSObjectProtocol

	attributedStringForTextElement(textElement: NSTextElement): NSAttributedString;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performEditingTransactionForTextStorageUsingBlock(textStorage: NSTextStorage, transaction: () => void): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	processEditingForTextStorageEditedRangeChangeInLengthInvalidatedRange(textStorage: NSTextStorage, editMask: NSTextStorageEditActions, newCharRange: NSRange, delta: number, invalidatedCharRange: NSRange): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	textElementForAttributedString(attributedString: NSAttributedString): NSTextElement;
}

/**
 * @since 15.0
 */
interface NSTextContentStorageDelegate extends NSTextContentManagerDelegate {

	textContentStorageTextParagraphWithRange?(textContentStorage: NSTextContentStorage, range: NSRange): NSTextParagraph;
}
declare var NSTextContentStorageDelegate: {

	prototype: NSTextContentStorageDelegate;
};

/**
 * @since 15.0
 */
declare var NSTextContentStorageUnsupportedAttributeAddedNotification: string;

/**
 * @since 6.0
 */
declare var NSTextEffectAttributeName: string;

/**
 * @since 7.0
 */
declare var NSTextEffectLetterpressStyle: string;

/**
 * @since 15.0
 */
declare class NSTextElement extends NSObject {

	static alloc(): NSTextElement; // inherited from NSObject

	static new(): NSTextElement; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	readonly childElements: NSArray<NSTextElement>;

	elementRange: NSTextRange;

	/**
	 * @since 16.0
	 */
	readonly isRepresentedElement: boolean;

	/**
	 * @since 16.0
	 */
	readonly parentElement: NSTextElement;

	textContentManager: NSTextContentManager;

	constructor(o: { textContentManager: NSTextContentManager; });

	initWithTextContentManager(textContentManager: NSTextContentManager): this;
}

/**
 * @since 15.0
 */
interface NSTextElementProvider extends NSObjectProtocol {

	documentRange: NSTextRange;

	adjustedRangeFromRangeForEditingTextSelection?(textRange: NSTextRange, forEditingTextSelection: boolean): NSTextRange;

	enumerateTextElementsFromLocationOptionsUsingBlock(textLocation: NSTextLocation, options: NSTextContentManagerEnumerationOptions, block: (p1: NSTextElement) => boolean): NSTextLocation;

	locationFromLocationWithOffset?(location: NSTextLocation, offset: number): NSTextLocation;

	offsetFromLocationToLocation?(from: NSTextLocation, to: NSTextLocation): number;

	replaceContentsInRangeWithTextElements(range: NSTextRange, textElements: NSArray<NSTextElement> | NSTextElement[]): void;

	synchronizeToBackingStore(completionHandler: (p1: NSError) => void): void;
}
declare var NSTextElementProvider: {

	prototype: NSTextElementProvider;
};

/**
 * @since 18.0
 */
declare var NSTextHighlightColorSchemeAttributeName: string;

/**
 * @since 18.0
 */
declare var NSTextHighlightColorSchemeBlue: string;

/**
 * @since 18.0
 */
declare var NSTextHighlightColorSchemeDefault: string;

/**
 * @since 18.0
 */
declare var NSTextHighlightColorSchemeMint: string;

/**
 * @since 18.0
 */
declare var NSTextHighlightColorSchemeOrange: string;

/**
 * @since 18.0
 */
declare var NSTextHighlightColorSchemePink: string;

/**
 * @since 18.0
 */
declare var NSTextHighlightColorSchemePurple: string;

/**
 * @since 18.0
 */
declare var NSTextHighlightStyleAttributeName: string;

/**
 * @since 18.0
 */
declare var NSTextHighlightStyleDefault: string;

/**
 * @since 18.0
 */
declare var NSTextKit1ListMarkerFormatDocumentOption: string;

/**
 * @since 15.0
 */
declare class NSTextLayoutFragment extends NSObject implements NSSecureCoding {

	static alloc(): NSTextLayoutFragment; // inherited from NSObject

	static new(): NSTextLayoutFragment; // inherited from NSObject

	readonly bottomMargin: number;

	readonly layoutFragmentFrame: CGRect;

	layoutQueue: NSOperationQueue;

	readonly leadingPadding: number;

	readonly rangeInElement: NSTextRange;

	readonly renderingSurfaceBounds: CGRect;

	readonly state: NSTextLayoutFragmentState;

	readonly textAttachmentViewProviders: NSArray<NSTextAttachmentViewProvider>;

	readonly textElement: NSTextElement;

	readonly textLayoutManager: NSTextLayoutManager;

	readonly textLineFragments: NSArray<NSTextLineFragment>;

	readonly topMargin: number;

	readonly trailingPadding: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { textElement: NSTextElement; range: NSTextRange; });

	drawAtPointInContext(point: CGPoint, context: any): void;

	encodeWithCoder(coder: NSCoder): void;

	frameForTextAttachmentAtLocation(location: NSTextLocation): CGRect;

	initWithCoder(coder: NSCoder): this;

	initWithTextElementRange(textElement: NSTextElement, rangeInElement: NSTextRange): this;

	invalidateLayout(): void;

	/**
	 * @since 17.0
	 */
	textLineFragmentForTextLocationIsUpstreamAffinity(textLocation: NSTextLocation, isUpstreamAffinity: boolean): NSTextLineFragment;

	/**
	 * @since 17.0
	 */
	textLineFragmentForVerticalOffsetRequiresExactMatch(verticalOffset: number, requiresExactMatch: boolean): NSTextLineFragment;
}

/**
 * @since 15.0
 */
declare const enum NSTextLayoutFragmentEnumerationOptions {

	None = 0,

	Reverse = 1,

	EstimatesSize = 2,

	EnsuresLayout = 4,

	EnsuresExtraLineFragment = 8
}

/**
 * @since 15.0
 */
declare const enum NSTextLayoutFragmentState {

	None = 0,

	EstimatedUsageBounds = 1,

	CalculatedUsageBounds = 2,

	LayoutAvailable = 3
}

/**
 * @since 15.0
 */
declare class NSTextLayoutManager extends NSObject implements NSSecureCoding, NSTextSelectionDataSource {

	static alloc(): NSTextLayoutManager; // inherited from NSObject

	static new(): NSTextLayoutManager; // inherited from NSObject

	delegate: NSTextLayoutManagerDelegate;

	layoutQueue: NSOperationQueue;

	limitsLayoutForSuspiciousContents: boolean;

	renderingAttributesValidator: (p1: NSTextLayoutManager, p2: NSTextLayoutFragment) => void;

	textContainer: NSTextContainer;

	readonly textContentManager: NSTextContentManager;

	textSelectionNavigation: NSTextSelectionNavigation;

	textSelections: NSArray<NSTextSelection>;

	readonly textViewportLayoutController: NSTextViewportLayoutController;

	readonly usageBoundsForTextContainer: CGRect;

	usesFontLeading: boolean;

	usesHyphenation: boolean;

	static readonly linkRenderingAttributes: NSDictionary<string, any>;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly documentRange: NSTextRange; // inherited from NSTextSelectionDataSource

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addRenderingAttributeValueForTextRange(renderingAttribute: string, value: any, textRange: NSTextRange): void;

	baseWritingDirectionAtLocation(location: NSTextLocation): NSTextSelectionNavigationWritingDirection;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	encodeWithCoder(coder: NSCoder): void;

	ensureLayoutForBounds(bounds: CGRect): void;

	ensureLayoutForRange(range: NSTextRange): void;

	enumerateCaretOffsetsInLineFragmentAtLocationUsingBlock(location: NSTextLocation, block: (p1: number, p2: NSTextLocation, p3: boolean, p4: interop.Pointer | interop.Reference<boolean>) => void): void;

	enumerateContainerBoundariesFromLocationReverseUsingBlock(location: NSTextLocation, reverse: boolean, block: (p1: NSTextLocation, p2: interop.Pointer | interop.Reference<boolean>) => void): void;

	enumerateRenderingAttributesFromLocationReverseUsingBlock(location: NSTextLocation, reverse: boolean, block: (p1: NSTextLayoutManager, p2: NSDictionary<string, any>, p3: NSTextRange) => boolean): void;

	enumerateSubstringsFromLocationOptionsUsingBlock(location: NSTextLocation, options: NSStringEnumerationOptions, block: (p1: string, p2: NSTextRange, p3: NSTextRange, p4: interop.Pointer | interop.Reference<boolean>) => void): void;

	enumerateTextLayoutFragmentsFromLocationOptionsUsingBlock(location: NSTextLocation, options: NSTextLayoutFragmentEnumerationOptions, block: (p1: NSTextLayoutFragment) => boolean): NSTextLocation;

	enumerateTextSegmentsInRangeTypeOptionsUsingBlock(textRange: NSTextRange, type: NSTextLayoutManagerSegmentType, options: NSTextLayoutManagerSegmentOptions, block: (p1: NSTextRange, p2: CGRect, p3: number, p4: NSTextContainer) => boolean): void;

	initWithCoder(coder: NSCoder): this;

	invalidateLayoutForRange(range: NSTextRange): void;

	invalidateRenderingAttributesForTextRange(textRange: NSTextRange): void;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	lineFragmentRangeForPointInContainerAtLocation(point: CGPoint, location: NSTextLocation): NSTextRange;

	locationFromLocationWithOffset(location: NSTextLocation, offset: number): NSTextLocation;

	offsetFromLocationToLocation(from: NSTextLocation, to: NSTextLocation): number;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	removeRenderingAttributeForTextRange(renderingAttribute: string, textRange: NSTextRange): void;

	renderingAttributesForLinkAtLocation(link: any, location: NSTextLocation): NSDictionary<string, any>;

	replaceContentsInRangeWithAttributedString(range: NSTextRange, attributedString: NSAttributedString): void;

	replaceContentsInRangeWithTextElements(range: NSTextRange, textElements: NSArray<NSTextElement> | NSTextElement[]): void;

	replaceTextContentManager(textContentManager: NSTextContentManager): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	setRenderingAttributesForTextRange(renderingAttributes: NSDictionary<string, any>, textRange: NSTextRange): void;

	textLayoutFragmentForLocation(location: NSTextLocation): NSTextLayoutFragment;

	textLayoutFragmentForPosition(position: CGPoint): NSTextLayoutFragment;

	textLayoutOrientationAtLocation(location: NSTextLocation): NSTextSelectionNavigationLayoutOrientation;

	textRangeForSelectionGranularityEnclosingLocation(selectionGranularity: NSTextSelectionGranularity, location: NSTextLocation): NSTextRange;
}

/**
 * @since 15.0
 */
interface NSTextLayoutManagerDelegate extends NSObjectProtocol {

	textLayoutManagerRenderingAttributesForLinkAtLocationDefaultAttributes?(textLayoutManager: NSTextLayoutManager, link: any, location: NSTextLocation, renderingAttributes: NSDictionary<string, any>): NSDictionary<string, any>;

	textLayoutManagerShouldBreakLineBeforeLocationHyphenating?(textLayoutManager: NSTextLayoutManager, location: NSTextLocation, hyphenating: boolean): boolean;

	textLayoutManagerTextLayoutFragmentForLocationInTextElement?(textLayoutManager: NSTextLayoutManager, location: NSTextLocation, textElement: NSTextElement): NSTextLayoutFragment;
}
declare var NSTextLayoutManagerDelegate: {

	prototype: NSTextLayoutManagerDelegate;
};

/**
 * @since 15.0
 */
declare const enum NSTextLayoutManagerSegmentOptions {

	None = 0,

	RangeNotRequired = 1,

	MiddleFragmentsExcluded = 2,

	HeadSegmentExtended = 4,

	TailSegmentExtended = 8,

	UpstreamAffinity = 16
}

/**
 * @since 15.0
 */
declare const enum NSTextLayoutManagerSegmentType {

	Standard = 0,

	Selection = 1,

	Highlight = 2
}

/**
 * @since 7.0
 */
declare const enum NSTextLayoutOrientation {

	Horizontal = 0,

	Vertical = 1
}

interface NSTextLayoutOrientationProvider {

	/**
	 * @since 7.0
	 */
	layoutOrientation: NSTextLayoutOrientation;
}
declare var NSTextLayoutOrientationProvider: {

	prototype: NSTextLayoutOrientationProvider;
};

/**
 * @since 6.0
 */
declare var NSTextLayoutSectionOrientation: string;

/**
 * @since 6.0
 */
declare var NSTextLayoutSectionRange: string;

/**
 * @since 6.0
 */
declare var NSTextLayoutSectionsAttribute: string;

/**
 * @since 15.0
 */
declare class NSTextLineFragment extends NSObject implements NSSecureCoding {

	static alloc(): NSTextLineFragment; // inherited from NSObject

	static new(): NSTextLineFragment; // inherited from NSObject

	readonly attributedString: NSAttributedString;

	readonly characterRange: NSRange;

	readonly glyphOrigin: CGPoint;

	readonly typographicBounds: CGRect;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { attributedString: NSAttributedString; range: NSRange; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { string: string; attributes: NSDictionary<string, any>; range: NSRange; });

	characterIndexForPoint(point: CGPoint): number;

	drawAtPointInContext(point: CGPoint, context: any): void;

	encodeWithCoder(coder: NSCoder): void;

	fractionOfDistanceThroughGlyphForPoint(point: CGPoint): number;

	initWithAttributedStringRange(attributedString: NSAttributedString, range: NSRange): this;

	initWithCoder(coder: NSCoder): this;

	initWithStringAttributesRange(string: string, attributes: NSDictionary<string, any>, range: NSRange): this;

	locationForCharacterAtIndex(index: number): CGPoint;
}

/**
 * @since 7.0
 */
declare class NSTextList extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSTextList; // inherited from NSObject

	static new(): NSTextList; // inherited from NSObject

	readonly listOptions: NSTextListOptions;

	readonly markerFormat: string;

	/**
	 * @since 16.0
	 */
	readonly ordered: boolean;

	startingItemNumber: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { markerFormat: string; options: number; });

	/**
	 * @since 16.0
	 */
	constructor(o: { markerFormat: string; options: NSTextListOptions; startingItemNumber: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithMarkerFormatOptions(markerFormat: string, options: number): this;

	/**
	 * @since 16.0
	 */
	initWithMarkerFormatOptionsStartingItemNumber(markerFormat: string, options: NSTextListOptions, startingItemNumber: number): this;

	markerForItemNumber(itemNumber: number): string;
}

/**
 * @since 16.0
 */
declare class NSTextListElement extends NSTextParagraph {

	static alloc(): NSTextListElement; // inherited from NSObject

	static new(): NSTextListElement; // inherited from NSObject

	static textListElementWithChildElementsTextListNestingLevel(children: NSArray<NSTextListElement> | NSTextListElement[], textList: NSTextList, nestingLevel: number): NSTextListElement;

	static textListElementWithContentsMarkerAttributesTextListChildElements(contents: NSAttributedString, markerAttributes: NSDictionary<string, any>, textList: NSTextList, children: NSArray<NSTextListElement> | NSTextListElement[]): NSTextListElement;

	readonly contents: NSAttributedString;

	readonly markerAttributes: NSDictionary<string, any>;

	readonly parentElement: NSTextListElement;

	readonly textList: NSTextList;

	constructor(o: { parentElement: NSTextListElement; textList: NSTextList; contents: NSAttributedString; markerAttributes: NSDictionary<string, any>; childElements: NSArray<NSTextListElement> | NSTextListElement[]; });

	initWithParentElementTextListContentsMarkerAttributesChildElements(parent: NSTextListElement, textList: NSTextList, contents: NSAttributedString, markerAttributes: NSDictionary<string, any>, children: NSArray<NSTextListElement> | NSTextListElement[]): this;
}

/**
 * @since 7.0
 */
declare var NSTextListMarkerBox: string;

/**
 * @since 7.0
 */
declare var NSTextListMarkerCheck: string;

/**
 * @since 7.0
 */
declare var NSTextListMarkerCircle: string;

/**
 * @since 7.0
 */
declare var NSTextListMarkerDecimal: string;

/**
 * @since 7.0
 */
declare var NSTextListMarkerDiamond: string;

/**
 * @since 7.0
 */
declare var NSTextListMarkerDisc: string;

/**
 * @since 7.0
 */
declare var NSTextListMarkerHyphen: string;

/**
 * @since 7.0
 */
declare var NSTextListMarkerLowercaseAlpha: string;

/**
 * @since 7.0
 */
declare var NSTextListMarkerLowercaseHexadecimal: string;

/**
 * @since 7.0
 */
declare var NSTextListMarkerLowercaseLatin: string;

/**
 * @since 7.0
 */
declare var NSTextListMarkerLowercaseRoman: string;

/**
 * @since 7.0
 */
declare var NSTextListMarkerOctal: string;

/**
 * @since 7.0
 */
declare var NSTextListMarkerSquare: string;

/**
 * @since 7.0
 */
declare var NSTextListMarkerUppercaseAlpha: string;

/**
 * @since 7.0
 */
declare var NSTextListMarkerUppercaseHexadecimal: string;

/**
 * @since 7.0
 */
declare var NSTextListMarkerUppercaseLatin: string;

/**
 * @since 7.0
 */
declare var NSTextListMarkerUppercaseRoman: string;

/**
 * @since 7.0
 */
declare const enum NSTextListOptions {

	PrependEnclosingMarker = 1
}

/**
 * @since 15.0
 */
interface NSTextLocation extends NSObjectProtocol {

	/**
	 * @since 15.0
	 */
	compare(location: NSTextLocation): NSComparisonResult;
}
declare var NSTextLocation: {

	prototype: NSTextLocation;
};

/**
 * @since 15.0
 */
declare class NSTextParagraph extends NSTextElement {

	static alloc(): NSTextParagraph; // inherited from NSObject

	static new(): NSTextParagraph; // inherited from NSObject

	readonly attributedString: NSAttributedString;

	readonly paragraphContentRange: NSTextRange;

	readonly paragraphSeparatorRange: NSTextRange;

	constructor(o: { attributedString: NSAttributedString; });

	initWithAttributedString(attributedString: NSAttributedString): this;
}

/**
 * @since 15.0
 */
declare class NSTextRange extends NSObject {

	static alloc(): NSTextRange; // inherited from NSObject

	static new(): NSTextRange; // inherited from NSObject

	readonly empty: boolean;

	readonly endLocation: NSTextLocation;

	readonly location: NSTextLocation;

	constructor(o: { location: NSTextLocation; });

	constructor(o: { location: NSTextLocation; endLocation: NSTextLocation; });

	containsLocation(location: NSTextLocation): boolean;

	containsRange(textRange: NSTextRange): boolean;

	initWithLocation(location: NSTextLocation): this;

	initWithLocationEndLocation(location: NSTextLocation, endLocation: NSTextLocation): this;

	intersectsWithTextRange(textRange: NSTextRange): boolean;

	isEqualToTextRange(textRange: NSTextRange): boolean;

	textRangeByFormingUnionWithTextRange(textRange: NSTextRange): this;

	textRangeByIntersectingWithTextRange(textRange: NSTextRange): this;
}

/**
 * @since 13.0
 */
declare var NSTextScalingDocumentAttribute: string;

/**
 * @since 13.0
 */
declare const enum NSTextScalingType {

	Standard = 0,

	iOS = 1
}

/**
 * @since 15.0
 */
declare class NSTextSelection extends NSObject implements NSSecureCoding {

	static alloc(): NSTextSelection; // inherited from NSObject

	static new(): NSTextSelection; // inherited from NSObject

	readonly affinity: NSTextSelectionAffinity;

	anchorPositionOffset: number;

	readonly granularity: NSTextSelectionGranularity;

	logical: boolean;

	secondarySelectionLocation: NSTextLocation;

	readonly textRanges: NSArray<NSTextRange>;

	readonly transient: boolean;

	typingAttributes: NSDictionary<string, any>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { location: NSTextLocation; affinity: NSTextSelectionAffinity; });

	constructor(o: { range: NSTextRange; affinity: NSTextSelectionAffinity; granularity: NSTextSelectionGranularity; });

	constructor(o: { ranges: NSArray<NSTextRange> | NSTextRange[]; affinity: NSTextSelectionAffinity; granularity: NSTextSelectionGranularity; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithLocationAffinity(location: NSTextLocation, affinity: NSTextSelectionAffinity): this;

	initWithRangeAffinityGranularity(range: NSTextRange, affinity: NSTextSelectionAffinity, granularity: NSTextSelectionGranularity): this;

	initWithRangesAffinityGranularity(textRanges: NSArray<NSTextRange> | NSTextRange[], affinity: NSTextSelectionAffinity, granularity: NSTextSelectionGranularity): this;

	textSelectionWithTextRanges(textRanges: NSArray<NSTextRange> | NSTextRange[]): NSTextSelection;
}

/**
 * @since 15.0
 */
declare const enum NSTextSelectionAffinity {

	Upstream = 0,

	Downstream = 1
}

/**
 * @since 15.0
 */
interface NSTextSelectionDataSource extends NSObjectProtocol {

	documentRange: NSTextRange;

	baseWritingDirectionAtLocation(location: NSTextLocation): NSTextSelectionNavigationWritingDirection;

	enumerateCaretOffsetsInLineFragmentAtLocationUsingBlock(location: NSTextLocation, block: (p1: number, p2: NSTextLocation, p3: boolean, p4: interop.Pointer | interop.Reference<boolean>) => void): void;

	enumerateContainerBoundariesFromLocationReverseUsingBlock?(location: NSTextLocation, reverse: boolean, block: (p1: NSTextLocation, p2: interop.Pointer | interop.Reference<boolean>) => void): void;

	enumerateSubstringsFromLocationOptionsUsingBlock(location: NSTextLocation, options: NSStringEnumerationOptions, block: (p1: string, p2: NSTextRange, p3: NSTextRange, p4: interop.Pointer | interop.Reference<boolean>) => void): void;

	lineFragmentRangeForPointInContainerAtLocation(point: CGPoint, location: NSTextLocation): NSTextRange;

	locationFromLocationWithOffset(location: NSTextLocation, offset: number): NSTextLocation;

	offsetFromLocationToLocation(from: NSTextLocation, to: NSTextLocation): number;

	textLayoutOrientationAtLocation?(location: NSTextLocation): NSTextSelectionNavigationLayoutOrientation;

	textRangeForSelectionGranularityEnclosingLocation(selectionGranularity: NSTextSelectionGranularity, location: NSTextLocation): NSTextRange;
}
declare var NSTextSelectionDataSource: {

	prototype: NSTextSelectionDataSource;
};

/**
 * @since 15.0
 */
declare const enum NSTextSelectionGranularity {

	Character = 0,

	Word = 1,

	Paragraph = 2,

	Line = 3,

	Sentence = 4
}

/**
 * @since 15.0
 */
declare class NSTextSelectionNavigation extends NSObject {

	static alloc(): NSTextSelectionNavigation; // inherited from NSObject

	static new(): NSTextSelectionNavigation; // inherited from NSObject

	allowsNonContiguousRanges: boolean;

	rotatesCoordinateSystemForLayoutOrientation: boolean;

	readonly textSelectionDataSource: NSTextSelectionDataSource;

	constructor(o: { dataSource: NSTextSelectionDataSource; });

	deletionRangesForTextSelectionDirectionDestinationAllowsDecomposition(textSelection: NSTextSelection, direction: NSTextSelectionNavigationDirection, destination: NSTextSelectionNavigationDestination, allowsDecomposition: boolean): NSArray<NSTextRange>;

	destinationSelectionForTextSelectionDirectionDestinationExtendingConfined(textSelection: NSTextSelection, direction: NSTextSelectionNavigationDirection, destination: NSTextSelectionNavigationDestination, extending: boolean, confined: boolean): NSTextSelection;

	flushLayoutCache(): void;

	initWithDataSource(dataSource: NSTextSelectionDataSource): this;

	resolvedInsertionLocationForTextSelectionWritingDirection(textSelection: NSTextSelection, writingDirection: NSTextSelectionNavigationWritingDirection): NSTextLocation;

	textSelectionForSelectionGranularityEnclosingPointInContainerAtLocation(selectionGranularity: NSTextSelectionGranularity, point: CGPoint, location: NSTextLocation): NSTextSelection;

	textSelectionForSelectionGranularityEnclosingTextSelection(selectionGranularity: NSTextSelectionGranularity, textSelection: NSTextSelection): NSTextSelection;

	textSelectionsInteractingAtPointInContainerAtLocationAnchorsModifiersSelectingBounds(point: CGPoint, containerLocation: NSTextLocation, anchors: NSArray<NSTextSelection> | NSTextSelection[], modifiers: NSTextSelectionNavigationModifier, selecting: boolean, bounds: CGRect): NSArray<NSTextSelection>;
}

/**
 * @since 15.0
 */
declare const enum NSTextSelectionNavigationDestination {

	Character = 0,

	Word = 1,

	Line = 2,

	Sentence = 3,

	Paragraph = 4,

	Container = 5,

	Document = 6
}

/**
 * @since 15.0
 */
declare const enum NSTextSelectionNavigationDirection {

	Forward = 0,

	Backward = 1,

	Right = 2,

	Left = 3,

	Up = 4,

	Down = 5
}

/**
 * @since 15.0
 */
declare const enum NSTextSelectionNavigationLayoutOrientation {

	Horizontal = 0,

	Vertical = 1
}

/**
 * @since 15.0
 */
declare const enum NSTextSelectionNavigationModifier {

	Extend = 1,

	Visual = 2,

	Multiple = 4
}

/**
 * @since 15.0
 */
declare const enum NSTextSelectionNavigationWritingDirection {

	LeftToRight = 0,

	RightToLeft = 1
}

/**
 * @since 7.0
 */
declare class NSTextStorage extends NSMutableAttributedString implements NSSecureCoding {

	static alloc(): NSTextStorage; // inherited from NSObject

	/**
	 * @since 18.0
	 */
	static attributedStringWithAdaptiveImageGlyphAttributes(adaptiveImageGlyph: NSAdaptiveImageGlyph, attributes: NSDictionary<string, any>): NSTextStorage; // inherited from NSAttributedString

	/**
	 * @since 18.0
	 */
	static attributedStringWithAttachmentAttributes(attachment: NSTextAttachment, attributes: NSDictionary<string, any>): NSTextStorage; // inherited from NSAttributedString

	static new(): NSTextStorage; // inherited from NSObject

	static objectWithItemProviderDataTypeIdentifierError(data: NSData, typeIdentifier: string): NSTextStorage; // inherited from NSItemProviderReading

	readonly changeInLength: number;

	delegate: NSTextStorageDelegate;

	readonly editedMask: NSTextStorageEditActions;

	readonly editedRange: NSRange;

	readonly fixesAttributesLazily: boolean;

	readonly layoutManagers: NSArray<NSLayoutManager>;

	/**
	 * @since 15.0
	 */
	textStorageObserver: NSTextStorageObserving;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addLayoutManager(aLayoutManager: NSLayoutManager): void;

	editedRangeChangeInLength(editedMask: NSTextStorageEditActions, editedRange: NSRange, delta: number): void;

	encodeWithCoder(coder: NSCoder): void;

	ensureAttributesAreFixedInRange(range: NSRange): void;

	initWithCoder(coder: NSCoder): this;

	invalidateAttributesInRange(range: NSRange): void;

	processEditing(): void;

	removeLayoutManager(aLayoutManager: NSLayoutManager): void;
}

interface NSTextStorageDelegate extends NSObjectProtocol {

	/**
	 * @since 7.0
	 */
	textStorageDidProcessEditingRangeChangeInLength?(textStorage: NSTextStorage, editedMask: NSTextStorageEditActions, editedRange: NSRange, delta: number): void;

	/**
	 * @since 7.0
	 */
	textStorageWillProcessEditingRangeChangeInLength?(textStorage: NSTextStorage, editedMask: NSTextStorageEditActions, editedRange: NSRange, delta: number): void;
}
declare var NSTextStorageDelegate: {

	prototype: NSTextStorageDelegate;
};

/**
 * @since 7.0
 */
declare var NSTextStorageDidProcessEditingNotification: string;

/**
 * @since 7.0
 */
declare const enum NSTextStorageEditActions {

	EditedAttributes = 1,

	EditedCharacters = 2
}

/**
 * @since 15.0
 */
interface NSTextStorageObserving extends NSObjectProtocol {

	textStorage: NSTextStorage;

	performEditingTransactionForTextStorageUsingBlock(textStorage: NSTextStorage, transaction: () => void): void;

	processEditingForTextStorageEditedRangeChangeInLengthInvalidatedRange(textStorage: NSTextStorage, editMask: NSTextStorageEditActions, newCharRange: NSRange, delta: number, invalidatedCharRange: NSRange): void;
}
declare var NSTextStorageObserving: {

	prototype: NSTextStorageObserving;
};

/**
 * @since 7.0
 */
declare var NSTextStorageWillProcessEditingNotification: string;

/**
 * @since 7.0
 */
declare class NSTextTab extends NSObject implements NSCoding, NSCopying, NSSecureCoding {

	static alloc(): NSTextTab; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	static columnTerminatorsForLocale(aLocale: NSLocale): NSCharacterSet;

	static new(): NSTextTab; // inherited from NSObject

	readonly alignment: NSTextAlignment;

	readonly location: number;

	readonly options: NSDictionary<string, any>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { textAlignment: NSTextAlignment; location: number; options: NSDictionary<string, any>; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTextAlignmentLocationOptions(alignment: NSTextAlignment, loc: number, options: NSDictionary<string, any>): this;
}

/**
 * @since 15.0
 */
declare class NSTextViewportLayoutController extends NSObject {

	static alloc(): NSTextViewportLayoutController; // inherited from NSObject

	static new(): NSTextViewportLayoutController; // inherited from NSObject

	delegate: NSTextViewportLayoutControllerDelegate;

	readonly textLayoutManager: NSTextLayoutManager;

	readonly viewportBounds: CGRect;

	readonly viewportRange: NSTextRange;

	constructor(o: { textLayoutManager: NSTextLayoutManager; });

	adjustViewportByVerticalOffset(verticalOffset: number): void;

	initWithTextLayoutManager(textLayoutManager: NSTextLayoutManager): this;

	layoutViewport(): void;

	relocateViewportToTextLocation(textLocation: NSTextLocation): number;
}

/**
 * @since 15.0
 */
interface NSTextViewportLayoutControllerDelegate extends NSObjectProtocol {

	textViewportLayoutControllerConfigureRenderingSurfaceForTextLayoutFragment(textViewportLayoutController: NSTextViewportLayoutController, textLayoutFragment: NSTextLayoutFragment): void;

	textViewportLayoutControllerDidLayout?(textViewportLayoutController: NSTextViewportLayoutController): void;

	textViewportLayoutControllerWillLayout?(textViewportLayoutController: NSTextViewportLayoutController): void;

	viewportBoundsForTextViewportLayoutController(textViewportLayoutController: NSTextViewportLayoutController): CGRect;
}
declare var NSTextViewportLayoutControllerDelegate: {

	prototype: NSTextViewportLayoutControllerDelegate;
};

/**
 * @since 7.0
 * @deprecated 9.0
 */
declare const enum NSTextWritingDirection {

	Embedding = 0,

	Override = 2
}

/**
 * @since 14.0
 */
declare var NSTrackingAttributeName: string;

/**
 * @since 7.0
 * @deprecated 100000
 */
declare var NSUnderlineByWord: NSUnderlineStyle;

/**
 * @since 7.0
 */
declare var NSUnderlineColorAttributeName: string;

/**
 * @since 7.0
 * @deprecated 100000
 */
declare var NSUnderlinePatternDash: NSUnderlineStyle;

/**
 * @since 7.0
 * @deprecated 100000
 */
declare var NSUnderlinePatternDashDot: NSUnderlineStyle;

/**
 * @since 7.0
 * @deprecated 100000
 */
declare var NSUnderlinePatternDashDotDot: NSUnderlineStyle;

/**
 * @since 7.0
 * @deprecated 100000
 */
declare var NSUnderlinePatternDot: NSUnderlineStyle;

/**
 * @since 7.0
 * @deprecated 100000
 */
declare var NSUnderlinePatternSolid: NSUnderlineStyle;

/**
 * @since 6.0
 */
declare const enum NSUnderlineStyle {

	None = 0,

	Single = 1,

	Thick = 2,

	Double = 9,

	PatternSolid = 0,

	PatternDot = 256,

	PatternDash = 512,

	PatternDashDot = 768,

	PatternDashDotDot = 1024,

	ByWord = 32768
}

/**
 * @since 6.0
 */
declare var NSUnderlineStyleAttributeName: string;

/**
 * @since 8.0
 */
declare var NSUserActivityDocumentURLKey: string;

/**
 * @since 7.0
 * @deprecated 100000
 */
declare var NSVerticalGlyphFormAttributeName: string;

/**
 * @since 7.0
 */
declare var NSViewModeDocumentAttribute: string;

/**
 * @since 7.0
 */
declare var NSViewSizeDocumentAttribute: string;

/**
 * @since 7.0
 */
declare var NSViewZoomDocumentAttribute: string;

/**
 * @since 6.0
 */
declare const enum NSWritingDirection {

	Natural = -1,

	LeftToRight = 0,

	RightToLeft = 1
}

/**
 * @since 6.0
 */
declare var NSWritingDirectionAttributeName: string;

/**
 * @since 9.0
 */
declare const enum NSWritingDirectionFormatType {

	Embedding = 0,

	Override = 2
}

/**
 * @since 2.0
 * @deprecated 5.0
 */
declare class UIAcceleration extends NSObject {

	static alloc(): UIAcceleration; // inherited from NSObject

	static new(): UIAcceleration; // inherited from NSObject

	readonly timestamp: number;

	readonly x: number;

	readonly y: number;

	readonly z: number;
}

/**
 * @since 2.0
 * @deprecated 5.0
 */
declare class UIAccelerometer extends NSObject {

	static alloc(): UIAccelerometer; // inherited from NSObject

	static new(): UIAccelerometer; // inherited from NSObject

	static sharedAccelerometer(): UIAccelerometer;

	delegate: UIAccelerometerDelegate;

	updateInterval: number;
}

/**
 * @since 2.0
 * @deprecated 13.0
 */
interface UIAccelerometerDelegate extends NSObjectProtocol {

	/**
	 * @since 2.0
	 * @deprecated 5.0
	 */
	accelerometerDidAccelerate?(accelerometer: UIAccelerometer, acceleration: UIAcceleration): void;
}
declare var UIAccelerometerDelegate: {

	prototype: UIAccelerometerDelegate;
};

/**
 * @since 6.0
 */
declare var UIAccessibilityAnnouncementDidFinishNotification: string;

/**
 * @since 6.0
 */
declare var UIAccessibilityAnnouncementKeyStringValue: string;

/**
 * @since 6.0
 */
declare var UIAccessibilityAnnouncementKeyWasSuccessful: string;

/**
 * @since 4.0
 */
declare var UIAccessibilityAnnouncementNotification: number;

/**
 * @since 9.0
 */
declare var UIAccessibilityAssistiveTechnologyKey: string;

/**
 * @since 10.0
 */
declare var UIAccessibilityAssistiveTouchStatusDidChangeNotification: string;

/**
 * @since 8.0
 */
declare var UIAccessibilityBoldTextStatusDidChangeNotification: string;

/**
 * @since 14.0
 */
declare function UIAccessibilityButtonShapesEnabled(): boolean;

/**
 * @since 14.0
 */
declare var UIAccessibilityButtonShapesEnabledStatusDidChangeNotification: string;

/**
 * @since 5.0
 */
declare var UIAccessibilityClosedCaptioningStatusDidChangeNotification: string;

/**
 * @since 11.0
 */
interface UIAccessibilityContainerDataTable extends NSObjectProtocol {

	accessibilityColumnCount(): number;

	accessibilityDataTableCellElementForRowColumn(row: number, column: number): UIAccessibilityContainerDataTableCell;

	accessibilityHeaderElementsForColumn?(column: number): NSArray<UIAccessibilityContainerDataTableCell>;

	accessibilityHeaderElementsForRow?(row: number): NSArray<UIAccessibilityContainerDataTableCell>;

	accessibilityRowCount(): number;
}
declare var UIAccessibilityContainerDataTable: {

	prototype: UIAccessibilityContainerDataTable;
};

/**
 * @since 11.0
 */
interface UIAccessibilityContainerDataTableCell extends NSObjectProtocol {

	accessibilityColumnRange(): NSRange;

	accessibilityRowRange(): NSRange;
}
declare var UIAccessibilityContainerDataTableCell: {

	prototype: UIAccessibilityContainerDataTableCell;
};

/**
 * @since 11.0
 */
declare const enum UIAccessibilityContainerType {

	None = 0,

	DataTable = 1,

	List = 2,

	Landmark = 3,

	SemanticGroup = 4
}

/**
 * @since 11.0
 */
interface UIAccessibilityContentSizeCategoryImageAdjusting extends NSObjectProtocol {

	adjustsImageSizeForAccessibilityContentSizeCategory: boolean;
}
declare var UIAccessibilityContentSizeCategoryImageAdjusting: {

	prototype: UIAccessibilityContentSizeCategoryImageAdjusting;
};

/**
 * @since 13.0
 */
declare const enum UIAccessibilityContrast {

	Unspecified = -1,

	Normal = 0,

	High = 1
}

/**
 * @since 7.0
 */
declare function UIAccessibilityConvertFrameToScreenCoordinates(rect: CGRect, view: UIView): CGRect;

/**
 * @since 7.0
 */
declare function UIAccessibilityConvertPathToScreenCoordinates(path: UIBezierPath, view: UIView): UIBezierPath;

/**
 * @since 8.0
 */
declare class UIAccessibilityCustomAction extends NSObject {

	static alloc(): UIAccessibilityCustomAction; // inherited from NSObject

	static new(): UIAccessibilityCustomAction; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	actionHandler: (p1: UIAccessibilityCustomAction) => boolean;

	/**
	 * @since 11.0
	 */
	attributedName: NSAttributedString;

	/**
	 * @since 18.0
	 */
	category: string;

	image: UIImage;

	name: string;

	selector: string;

	target: any;

	/**
	 * @since 13.0
	 */
	constructor(o: { attributedName: NSAttributedString; actionHandler: (p1: UIAccessibilityCustomAction) => boolean; });

	/**
	 * @since 14.0
	 */
	constructor(o: { attributedName: NSAttributedString; image: UIImage; actionHandler: (p1: UIAccessibilityCustomAction) => boolean; });

	/**
	 * @since 14.0
	 */
	constructor(o: { attributedName: NSAttributedString; image: UIImage; target: any; selector: string; });

	/**
	 * @since 11.0
	 */
	constructor(o: { attributedName: NSAttributedString; target: any; selector: string; });

	/**
	 * @since 13.0
	 */
	constructor(o: { name: string; actionHandler: (p1: UIAccessibilityCustomAction) => boolean; });

	/**
	 * @since 14.0
	 */
	constructor(o: { name: string; image: UIImage; actionHandler: (p1: UIAccessibilityCustomAction) => boolean; });

	/**
	 * @since 14.0
	 */
	constructor(o: { name: string; image: UIImage; target: any; selector: string; });

	constructor(o: { name: string; target: any; selector: string; });

	/**
	 * @since 13.0
	 */
	initWithAttributedNameActionHandler(attributedName: NSAttributedString, actionHandler: (p1: UIAccessibilityCustomAction) => boolean): this;

	/**
	 * @since 14.0
	 */
	initWithAttributedNameImageActionHandler(attributedName: NSAttributedString, image: UIImage, actionHandler: (p1: UIAccessibilityCustomAction) => boolean): this;

	/**
	 * @since 14.0
	 */
	initWithAttributedNameImageTargetSelector(attributedName: NSAttributedString, image: UIImage, target: any, selector: string): this;

	/**
	 * @since 11.0
	 */
	initWithAttributedNameTargetSelector(attributedName: NSAttributedString, target: any, selector: string): this;

	/**
	 * @since 13.0
	 */
	initWithNameActionHandler(name: string, actionHandler: (p1: UIAccessibilityCustomAction) => boolean): this;

	/**
	 * @since 14.0
	 */
	initWithNameImageActionHandler(name: string, image: UIImage, actionHandler: (p1: UIAccessibilityCustomAction) => boolean): this;

	/**
	 * @since 14.0
	 */
	initWithNameImageTargetSelector(name: string, image: UIImage, target: any, selector: string): this;

	initWithNameTargetSelector(name: string, target: any, selector: string): this;
}

/**
 * @since 18.0
 */
declare var UIAccessibilityCustomActionCategoryEdit: string;

/**
 * @since 10.0
 */
declare class UIAccessibilityCustomRotor extends NSObject {

	static alloc(): UIAccessibilityCustomRotor; // inherited from NSObject

	static new(): UIAccessibilityCustomRotor; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	attributedName: NSAttributedString;

	itemSearchBlock: (p1: UIAccessibilityCustomRotorSearchPredicate) => UIAccessibilityCustomRotorItemResult;

	name: string;

	/**
	 * @since 11.0
	 */
	readonly systemRotorType: UIAccessibilityCustomSystemRotorType;

	/**
	 * @since 11.0
	 */
	constructor(o: { attributedName: NSAttributedString; itemSearchBlock: (p1: UIAccessibilityCustomRotorSearchPredicate) => UIAccessibilityCustomRotorItemResult; });

	constructor(o: { name: string; itemSearchBlock: (p1: UIAccessibilityCustomRotorSearchPredicate) => UIAccessibilityCustomRotorItemResult; });

	/**
	 * @since 11.0
	 */
	constructor(o: { systemType: UIAccessibilityCustomSystemRotorType; itemSearchBlock: (p1: UIAccessibilityCustomRotorSearchPredicate) => UIAccessibilityCustomRotorItemResult; });

	/**
	 * @since 11.0
	 */
	initWithAttributedNameItemSearchBlock(attributedName: NSAttributedString, itemSearchBlock: (p1: UIAccessibilityCustomRotorSearchPredicate) => UIAccessibilityCustomRotorItemResult): this;

	initWithNameItemSearchBlock(name: string, itemSearchBlock: (p1: UIAccessibilityCustomRotorSearchPredicate) => UIAccessibilityCustomRotorItemResult): this;

	/**
	 * @since 11.0
	 */
	initWithSystemTypeItemSearchBlock(type: UIAccessibilityCustomSystemRotorType, itemSearchBlock: (p1: UIAccessibilityCustomRotorSearchPredicate) => UIAccessibilityCustomRotorItemResult): this;
}

declare const enum UIAccessibilityCustomRotorDirection {

	Previous = 0,

	Next = 1
}

/**
 * @since 10.0
 */
declare class UIAccessibilityCustomRotorItemResult extends NSObject {

	static alloc(): UIAccessibilityCustomRotorItemResult; // inherited from NSObject

	static new(): UIAccessibilityCustomRotorItemResult; // inherited from NSObject

	targetElement: NSObjectProtocol;

	targetRange: UITextRange;

	constructor(o: { targetElement: NSObjectProtocol; targetRange: UITextRange; });

	initWithTargetElementTargetRange(targetElement: NSObjectProtocol, targetRange: UITextRange): this;
}

/**
 * @since 10.0
 */
declare class UIAccessibilityCustomRotorSearchPredicate extends NSObject {

	static alloc(): UIAccessibilityCustomRotorSearchPredicate; // inherited from NSObject

	static new(): UIAccessibilityCustomRotorSearchPredicate; // inherited from NSObject

	currentItem: UIAccessibilityCustomRotorItemResult;

	searchDirection: UIAccessibilityCustomRotorDirection;
}

/**
 * @since 11.0
 */
declare const enum UIAccessibilityCustomSystemRotorType {

	None = 0,

	Link = 1,

	VisitedLink = 2,

	Heading = 3,

	HeadingLevel1 = 4,

	HeadingLevel2 = 5,

	HeadingLevel3 = 6,

	HeadingLevel4 = 7,

	HeadingLevel5 = 8,

	HeadingLevel6 = 9,

	BoldText = 10,

	ItalicText = 11,

	UnderlineText = 12,

	MisspelledWord = 13,

	Image = 14,

	TextField = 15,

	Table = 16,

	List = 17,

	Landmark = 18
}

/**
 * @since 8.0
 */
declare function UIAccessibilityDarkerSystemColorsEnabled(): boolean;

/**
 * @since 8.0
 */
declare var UIAccessibilityDarkerSystemColorsStatusDidChangeNotification: string;

/**
 * @since 17.0
 */
declare const enum UIAccessibilityDirectTouchOptions {

	None = 0,

	SilentOnTouch = 1,

	RequiresActivation = 2
}

/**
 * @since 3.0
 */
declare class UIAccessibilityElement extends UIResponder implements UIAccessibilityIdentification {

	static alloc(): UIAccessibilityElement; // inherited from NSObject

	static new(): UIAccessibilityElement; // inherited from NSObject

	accessibilityContainer: any;

	/**
	 * @since 10.0
	 */
	accessibilityFrameInContainerSpace: CGRect;

	/**
	 * @since 5.0
	 */
	accessibilityIdentifier: string; // inherited from UIAccessibilityIdentification

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { accessibilityContainer: any; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithAccessibilityContainer(container: any): this;

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
 * @since 9.0
 */
declare var UIAccessibilityElementFocusedNotification: string;

/**
 * @since 18.0
 */
declare const enum UIAccessibilityExpandedStatus {

	Unsupported = 0,

	Expanded = 1,

	Collapsed = 2
}

/**
 * @since 9.0
 */
declare function UIAccessibilityFocusedElement(assistiveTechnologyIdentifier: string): any;

/**
 * @since 9.0
 */
declare var UIAccessibilityFocusedElementKey: string;

/**
 * @since 8.0
 */
declare var UIAccessibilityGrayscaleStatusDidChangeNotification: string;

/**
 * @since 6.0
 */
declare var UIAccessibilityGuidedAccessStatusDidChangeNotification: string;

/**
 * @since 10.0
 */
declare const enum UIAccessibilityHearingDeviceEar {

	None = 0,

	Left = 2,

	Right = 4,

	Both = 6
}

/**
 * @since 10.0
 */
declare function UIAccessibilityHearingDevicePairedEar(): UIAccessibilityHearingDeviceEar;

/**
 * @since 10.0
 */
declare var UIAccessibilityHearingDevicePairedEarDidChangeNotification: string;

interface UIAccessibilityIdentification extends NSObjectProtocol {

	/**
	 * @since 5.0
	 */
	accessibilityIdentifier: string;
}
declare var UIAccessibilityIdentification: {

	prototype: UIAccessibilityIdentification;
};

/**
 * @since 6.0
 */
declare var UIAccessibilityInvertColorsStatusDidChangeNotification: string;

/**
 * @since 10.0
 */
declare function UIAccessibilityIsAssistiveTouchRunning(): boolean;

/**
 * @since 8.0
 */
declare function UIAccessibilityIsBoldTextEnabled(): boolean;

/**
 * @since 5.0
 */
declare function UIAccessibilityIsClosedCaptioningEnabled(): boolean;

/**
 * @since 8.0
 */
declare function UIAccessibilityIsGrayscaleEnabled(): boolean;

/**
 * @since 6.0
 */
declare function UIAccessibilityIsGuidedAccessEnabled(): boolean;

/**
 * @since 6.0
 */
declare function UIAccessibilityIsInvertColorsEnabled(): boolean;

/**
 * @since 5.0
 */
declare function UIAccessibilityIsMonoAudioEnabled(): boolean;

/**
 * @since 13.0
 */
declare function UIAccessibilityIsOnOffSwitchLabelsEnabled(): boolean;

/**
 * @since 8.0
 */
declare function UIAccessibilityIsReduceMotionEnabled(): boolean;

/**
 * @since 8.0
 */
declare function UIAccessibilityIsReduceTransparencyEnabled(): boolean;

/**
 * @since 9.0
 */
declare function UIAccessibilityIsShakeToUndoEnabled(): boolean;

/**
 * @since 8.0
 */
declare function UIAccessibilityIsSpeakScreenEnabled(): boolean;

/**
 * @since 8.0
 */
declare function UIAccessibilityIsSpeakSelectionEnabled(): boolean;

/**
 * @since 8.0
 */
declare function UIAccessibilityIsSwitchControlRunning(): boolean;

/**
 * @since 13.0
 */
declare function UIAccessibilityIsVideoAutoplayEnabled(): boolean;

/**
 * @since 4.0
 */
declare function UIAccessibilityIsVoiceOverRunning(): boolean;

declare var UIAccessibilityLayoutChangedNotification: number;

/**
 * @since 11.0
 */
declare class UIAccessibilityLocationDescriptor extends NSObject {

	static alloc(): UIAccessibilityLocationDescriptor; // inherited from NSObject

	static new(): UIAccessibilityLocationDescriptor; // inherited from NSObject

	readonly attributedName: NSAttributedString;

	readonly name: string;

	readonly point: CGPoint;

	readonly view: UIView;

	constructor(o: { attributedName: NSAttributedString; point: CGPoint; inView: UIView; });

	constructor(o: { name: string; point: CGPoint; inView: UIView; });

	constructor(o: { name: string; view: UIView; });

	initWithAttributedNamePointInView(attributedName: NSAttributedString, point: CGPoint, view: UIView): this;

	initWithNamePointInView(name: string, point: CGPoint, view: UIView): this;

	initWithNameView(name: string, view: UIView): this;
}

/**
 * @since 5.0
 */
declare var UIAccessibilityMonoAudioStatusDidChangeNotification: string;

/**
 * @since 8.0
 */
declare const enum UIAccessibilityNavigationStyle {

	Automatic = 0,

	Separate = 1,

	Combined = 2
}

/**
 * @since 8.0
 */
declare var UIAccessibilityNotificationSwitchControlIdentifier: string;

/**
 * @since 9.0
 */
declare var UIAccessibilityNotificationVoiceOverIdentifier: string;

/**
 * @since 13.0
 */
declare var UIAccessibilityOnOffSwitchLabelsDidChangeNotification: string;

/**
 * @since 4.2
 */
declare var UIAccessibilityPageScrolledNotification: number;

/**
 * @since 8.0
 */
declare var UIAccessibilityPauseAssistiveTechnologyNotification: number;

declare function UIAccessibilityPostNotification(notification: number, argument: any): void;

/**
 * @since 14.0
 */
declare function UIAccessibilityPrefersCrossFadeTransitions(): boolean;

/**
 * @since 14.0
 */
declare var UIAccessibilityPrefersCrossFadeTransitionsStatusDidChangeNotification: string;

/**
 * @since 17.0
 */
declare var UIAccessibilityPriorityDefault: string;

/**
 * @since 17.0
 */
declare var UIAccessibilityPriorityHigh: string;

/**
 * @since 17.0
 */
declare var UIAccessibilityPriorityLow: string;

/**
 * @since 5.0
 */
interface UIAccessibilityReadingContent {

	/**
	 * @since 11.0
	 */
	accessibilityAttributedContentForLineNumber?(lineNumber: number): NSAttributedString;

	/**
	 * @since 11.0
	 */
	accessibilityAttributedPageContent?(): NSAttributedString;

	accessibilityContentForLineNumber(lineNumber: number): string;

	accessibilityFrameForLineNumber(lineNumber: number): CGRect;

	accessibilityLineNumberForPoint(point: CGPoint): number;

	accessibilityPageContent(): string;
}
declare var UIAccessibilityReadingContent: {

	prototype: UIAccessibilityReadingContent;
};

/**
 * @since 8.0
 */
declare var UIAccessibilityReduceMotionStatusDidChangeNotification: string;

/**
 * @since 8.0
 */
declare var UIAccessibilityReduceTransparencyStatusDidChangeNotification: string;

/**
 * @since 5.0
 */
declare function UIAccessibilityRegisterGestureConflictWithZoom(): void;

/**
 * @since 7.0
 */
declare function UIAccessibilityRequestGuidedAccessSession(enable: boolean, completionHandler: (p1: boolean) => void): void;

/**
 * @since 8.0
 */
declare var UIAccessibilityResumeAssistiveTechnologyNotification: number;

declare var UIAccessibilityScreenChangedNotification: number;

declare const enum UIAccessibilityScrollDirection {

	Right = 1,

	Left = 2,

	Up = 3,

	Down = 4,

	Next = 5,

	Previous = 6
}

/**
 * @since 9.0
 */
declare var UIAccessibilityShakeToUndoDidChangeNotification: string;

/**
 * @since 13.0
 */
declare function UIAccessibilityShouldDifferentiateWithoutColor(): boolean;

/**
 * @since 13.0
 */
declare var UIAccessibilityShouldDifferentiateWithoutColorDidChangeNotification: string;

/**
 * @since 8.0
 */
declare var UIAccessibilitySpeakScreenStatusDidChangeNotification: string;

/**
 * @since 8.0
 */
declare var UIAccessibilitySpeakSelectionStatusDidChangeNotification: string;

/**
 * @since 17.0
 */
declare var UIAccessibilitySpeechAttributeAnnouncementPriority: string;

/**
 * @since 11.0
 */
declare var UIAccessibilitySpeechAttributeIPANotation: string;

/**
 * @since 7.0
 */
declare var UIAccessibilitySpeechAttributeLanguage: string;

/**
 * @since 7.0
 */
declare var UIAccessibilitySpeechAttributePitch: string;

/**
 * @since 7.0
 */
declare var UIAccessibilitySpeechAttributePunctuation: string;

/**
 * @since 11.0
 */
declare var UIAccessibilitySpeechAttributeQueueAnnouncement: string;

/**
 * @since 13.0
 */
declare var UIAccessibilitySpeechAttributeSpellOut: string;

/**
 * @since 8.0
 */
declare var UIAccessibilitySwitchControlStatusDidChangeNotification: string;

/**
 * @since 13.0
 */
declare var UIAccessibilityTextAttributeContext: string;

/**
 * @since 11.0
 */
declare var UIAccessibilityTextAttributeCustom: string;

/**
 * @since 11.0
 */
declare var UIAccessibilityTextAttributeHeadingLevel: string;

/**
 * @since 13.0
 */
declare var UIAccessibilityTextualContextConsole: string;

/**
 * @since 13.0
 */
declare var UIAccessibilityTextualContextFileSystem: string;

/**
 * @since 13.0
 */
declare var UIAccessibilityTextualContextMessaging: string;

/**
 * @since 13.0
 */
declare var UIAccessibilityTextualContextNarrative: string;

/**
 * @since 13.0
 */
declare var UIAccessibilityTextualContextSourceCode: string;

/**
 * @since 13.0
 */
declare var UIAccessibilityTextualContextSpreadsheet: string;

/**
 * @since 13.0
 */
declare var UIAccessibilityTextualContextWordProcessing: string;

/**
 * @since 4.0
 */
declare var UIAccessibilityTraitAdjustable: number;

/**
 * @since 5.0
 */
declare var UIAccessibilityTraitAllowsDirectInteraction: number;

declare var UIAccessibilityTraitButton: number;

/**
 * @since 5.0
 */
declare var UIAccessibilityTraitCausesPageTurn: number;

/**
 * @since 6.0
 */
declare var UIAccessibilityTraitHeader: number;

declare var UIAccessibilityTraitImage: number;

declare var UIAccessibilityTraitKeyboardKey: number;

declare var UIAccessibilityTraitLink: number;

declare var UIAccessibilityTraitNone: number;

declare var UIAccessibilityTraitNotEnabled: number;

declare var UIAccessibilityTraitPlaysSound: number;

declare var UIAccessibilityTraitSearchField: number;

declare var UIAccessibilityTraitSelected: number;

/**
 * @since 4.0
 */
declare var UIAccessibilityTraitStartsMediaSession: number;

declare var UIAccessibilityTraitStaticText: number;

declare var UIAccessibilityTraitSummaryElement: number;

/**
 * @since 17.0
 */
declare var UIAccessibilityTraitSupportsZoom: number;

/**
 * @since 10.0
 */
declare var UIAccessibilityTraitTabBar: number;

/**
 * @since 17.0
 */
declare var UIAccessibilityTraitToggleButton: number;

declare var UIAccessibilityTraitUpdatesFrequently: number;

/**
 * @since 9.0
 */
declare var UIAccessibilityUnfocusedElementKey: string;

/**
 * @since 13.0
 */
declare var UIAccessibilityVideoAutoplayStatusDidChangeNotification: string;

/**
 * @since 4.0
 * @deprecated 11.0
 */
declare var UIAccessibilityVoiceOverStatusChanged: string;

/**
 * @since 11.0
 */
declare var UIAccessibilityVoiceOverStatusDidChangeNotification: string;

/**
 * @since 5.0
 */
declare function UIAccessibilityZoomFocusChanged(type: UIAccessibilityZoomType, frame: CGRect, view: UIView): void;

/**
 * @since 5.0
 */
declare const enum UIAccessibilityZoomType {

	InsertionPoint = 0
}

/**
 * @since 13.0
 */
declare class UIAction extends UIMenuElement implements UIMenuLeaf {

	/**
	 * @since 14.0
	 */
	static actionWithHandler(handler: (p1: UIAction) => void): UIAction;

	static actionWithTitleImageIdentifierHandler(title: string, image: UIImage, identifier: string, handler: (p1: UIAction) => void): UIAction;

	static alloc(): UIAction; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	static captureTextFromCameraActionForResponderIdentifier(responder: UIResponder & UIKeyInput, identifier: string): UIAction;

	static new(): UIAction; // inherited from NSObject

	readonly identifier: string;

	attributes: UIMenuElementAttributes; // inherited from UIMenuLeaf

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	discoverabilityTitle: string; // inherited from UIMenuLeaf

	readonly hash: number; // inherited from NSObjectProtocol

	image: UIImage; // inherited from UIMenuLeaf

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	/**
	 * @since 16.0
	 */
	readonly presentationSourceItem: UIPopoverPresentationControllerSourceItem; // inherited from UIMenuLeaf

	/**
	 * @since 17.0
	 */
	selectedImage: UIImage; // inherited from UIMenuLeaf

	readonly sender: any; // inherited from UIMenuLeaf

	state: UIMenuElementState; // inherited from UIMenuLeaf

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	title: string; // inherited from UIMenuLeaf

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	performWithSenderTarget(sender: any, target: any): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 15.0
 */
declare var UIActionPaste: string;

/**
 * @since 15.0
 */
declare var UIActionPasteAndGo: string;

/**
 * @since 15.0
 */
declare var UIActionPasteAndMatchStyle: string;

/**
 * @since 15.0
 */
declare var UIActionPasteAndSearch: string;

/**
 * @since 2.0
 * @deprecated 8.3
 */
declare class UIActionSheet extends UIView {

	static alloc(): UIActionSheet; // inherited from NSObject

	static appearance(): UIActionSheet; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIActionSheet; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIActionSheet; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIActionSheet; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIActionSheet; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIActionSheet; // inherited from UIAppearance

	static new(): UIActionSheet; // inherited from NSObject

	actionSheetStyle: UIActionSheetStyle;

	cancelButtonIndex: number;

	delegate: UIActionSheetDelegate;

	destructiveButtonIndex: number;

	readonly firstOtherButtonIndex: number;

	readonly numberOfButtons: number;

	title: string;

	readonly visible: boolean;

	constructor(o: { title: string; delegate: UIActionSheetDelegate; cancelButtonTitle: string; destructiveButtonTitle: string; otherButtonTitles: string; });

	addButtonWithTitle(title: string): number;

	buttonTitleAtIndex(buttonIndex: number): string;

	dismissWithClickedButtonIndexAnimated(buttonIndex: number, animated: boolean): void;

	initWithTitleDelegateCancelButtonTitleDestructiveButtonTitleOtherButtonTitles(title: string, delegate: UIActionSheetDelegate, cancelButtonTitle: string, destructiveButtonTitle: string, otherButtonTitles: string): this;

	/**
	 * @since 3.2
	 */
	showFromBarButtonItemAnimated(item: UIBarButtonItem, animated: boolean): void;

	/**
	 * @since 3.2
	 */
	showFromRectInViewAnimated(rect: CGRect, view: UIView, animated: boolean): void;

	showFromTabBar(view: UITabBar): void;

	showFromToolbar(view: UIToolbar): void;

	showInView(view: UIView): void;
}

interface UIActionSheetDelegate extends NSObjectProtocol {

	/**
	 * @since 2.0
	 * @deprecated 8.3
	 */
	actionSheetCancel?(actionSheet: UIActionSheet): void;

	/**
	 * @since 2.0
	 * @deprecated 8.3
	 */
	actionSheetClickedButtonAtIndex?(actionSheet: UIActionSheet, buttonIndex: number): void;

	/**
	 * @since 2.0
	 * @deprecated 8.3
	 */
	actionSheetDidDismissWithButtonIndex?(actionSheet: UIActionSheet, buttonIndex: number): void;

	/**
	 * @since 2.0
	 * @deprecated 8.3
	 */
	actionSheetWillDismissWithButtonIndex?(actionSheet: UIActionSheet, buttonIndex: number): void;

	/**
	 * @since 2.0
	 * @deprecated 8.3
	 */
	didPresentActionSheet?(actionSheet: UIActionSheet): void;

	/**
	 * @since 2.0
	 * @deprecated 8.3
	 */
	willPresentActionSheet?(actionSheet: UIActionSheet): void;
}
declare var UIActionSheetDelegate: {

	prototype: UIActionSheetDelegate;
};

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare const enum UIActionSheetStyle {

	Automatic = -1,

	Default = 0,

	BlackTranslucent = 2,

	BlackOpaque = 1
}

/**
 * @since 6.0
 */
declare class UIActivity extends NSObject {

	static alloc(): UIActivity; // inherited from NSObject

	static new(): UIActivity; // inherited from NSObject

	readonly activityImage: UIImage;

	readonly activityTitle: string;

	readonly activityType: string;

	readonly activityViewController: UIViewController;

	/**
	 * @since 7.0
	 */
	static readonly activityCategory: UIActivityCategory;

	activityDidFinish(completed: boolean): void;

	canPerformWithActivityItems(activityItems: NSArray<any> | any[]): boolean;

	performActivity(): void;

	prepareWithActivityItems(activityItems: NSArray<any> | any[]): void;
}

/**
 * @since 7.0
 */
declare const enum UIActivityCategory {

	Action = 0,

	Share = 1
}

/**
 * @since 18.0
 */
declare const enum UIActivityCollaborationMode {

	SendCopy = 0,

	Collaborate = 1
}

/**
 * @since 18.0
 */
declare class UIActivityCollaborationModeRestriction extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UIActivityCollaborationModeRestriction; // inherited from NSObject

	static new(): UIActivityCollaborationModeRestriction; // inherited from NSObject

	readonly alertDismissButtonTitle: string;

	readonly alertMessage: string;

	readonly alertRecoverySuggestionButtonLaunchURL: NSURL;

	readonly alertRecoverySuggestionButtonTitle: string;

	readonly alertTitle: string;

	readonly disabledMode: UIActivityCollaborationMode;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { disabledMode: UIActivityCollaborationMode; });

	constructor(o: { disabledMode: UIActivityCollaborationMode; alertTitle: string; alertMessage: string; });

	constructor(o: { disabledMode: UIActivityCollaborationMode; alertTitle: string; alertMessage: string; alertDismissButtonTitle: string; });

	constructor(o: { disabledMode: UIActivityCollaborationMode; alertTitle: string; alertMessage: string; alertDismissButtonTitle: string; alertRecoverySuggestionButtonTitle: string; alertRecoverySuggestionButtonLaunchURL: NSURL; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	description(): string;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithDisabledMode(disabledMode: UIActivityCollaborationMode): this;

	initWithDisabledModeAlertTitleAlertMessage(disabledMode: UIActivityCollaborationMode, alertTitle: string, alertMessage: string): this;

	initWithDisabledModeAlertTitleAlertMessageAlertDismissButtonTitle(disabledMode: UIActivityCollaborationMode, alertTitle: string, alertMessage: string, alertDismissButtonTitle: string): this;

	initWithDisabledModeAlertTitleAlertMessageAlertDismissButtonTitleAlertRecoverySuggestionButtonTitleAlertRecoverySuggestionButtonLaunchURL(disabledMode: UIActivityCollaborationMode, alertTitle: string, alertMessage: string, alertDismissButtonTitle: string, alertRecoverySuggestionButtonTitle: string, alertRecoverySuggestionButtonLaunchURL: NSURL): this;
}

/**
 * @since 2.0
 */
declare class UIActivityIndicatorView extends UIView implements NSCoding {

	static alloc(): UIActivityIndicatorView; // inherited from NSObject

	static appearance(): UIActivityIndicatorView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIActivityIndicatorView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIActivityIndicatorView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIActivityIndicatorView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIActivityIndicatorView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIActivityIndicatorView; // inherited from UIAppearance

	static new(): UIActivityIndicatorView; // inherited from NSObject

	activityIndicatorViewStyle: UIActivityIndicatorViewStyle;

	readonly animating: boolean;

	/**
	 * @since 5.0
	 */
	color: UIColor;

	hidesWhenStopped: boolean;

	constructor(o: { activityIndicatorStyle: UIActivityIndicatorViewStyle; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithActivityIndicatorStyle(style: UIActivityIndicatorViewStyle): this;

	initWithCoder(coder: NSCoder): this;

	startAnimating(): void;

	stopAnimating(): void;
}

declare const enum UIActivityIndicatorViewStyle {

	Medium = 100,

	Large = 101,

	WhiteLarge = 0,

	White = 1,

	Gray = 2
}

/**
 * @since 6.0
 */
declare class UIActivityItemProvider extends NSOperation implements UIActivityItemSource {

	static alloc(): UIActivityItemProvider; // inherited from NSObject

	static new(): UIActivityItemProvider; // inherited from NSObject

	readonly activityType: string;

	readonly item: any;

	readonly placeholderItem: any;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { placeholderItem: any; });

	/**
	 * @since 7.0
	 */
	activityViewControllerDataTypeIdentifierForActivityType(activityViewController: UIActivityViewController, activityType: string): string;

	activityViewControllerItemForActivityType(activityViewController: UIActivityViewController, activityType: string): any;

	/**
	 * @since 13.0
	 */
	activityViewControllerLinkMetadata(activityViewController: UIActivityViewController): LPLinkMetadata;

	activityViewControllerPlaceholderItem(activityViewController: UIActivityViewController): any;

	/**
	 * @since 18.0
	 */
	activityViewControllerShareRecipients(activityViewController: UIActivityViewController): NSArray<INPerson>;

	/**
	 * @since 7.0
	 */
	activityViewControllerSubjectForActivityType(activityViewController: UIActivityViewController, activityType: string): string;

	/**
	 * @since 7.0
	 */
	activityViewControllerThumbnailImageForActivityTypeSuggestedSize(activityViewController: UIActivityViewController, activityType: string, size: CGSize): UIImage;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithPlaceholderItem(placeholderItem: any): this;

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
 * @since 6.0
 */
interface UIActivityItemSource extends NSObjectProtocol {

	/**
	 * @since 7.0
	 */
	activityViewControllerDataTypeIdentifierForActivityType?(activityViewController: UIActivityViewController, activityType: string): string;

	activityViewControllerItemForActivityType(activityViewController: UIActivityViewController, activityType: string): any;

	/**
	 * @since 13.0
	 */
	activityViewControllerLinkMetadata?(activityViewController: UIActivityViewController): LPLinkMetadata;

	activityViewControllerPlaceholderItem(activityViewController: UIActivityViewController): any;

	/**
	 * @since 18.0
	 */
	activityViewControllerShareRecipients?(activityViewController: UIActivityViewController): NSArray<INPerson>;

	/**
	 * @since 7.0
	 */
	activityViewControllerSubjectForActivityType?(activityViewController: UIActivityViewController, activityType: string): string;

	/**
	 * @since 7.0
	 */
	activityViewControllerThumbnailImageForActivityTypeSuggestedSize?(activityViewController: UIActivityViewController, activityType: string, size: CGSize): UIImage;
}
declare var UIActivityItemSource: {

	prototype: UIActivityItemSource;
};

/**
 * @since 13.0
 */
declare class UIActivityItemsConfiguration extends NSObject implements UIActivityItemsConfigurationReading {

	static activityItemsConfigurationWithItemProviders(itemProviders: NSArray<NSItemProvider> | NSItemProvider[]): UIActivityItemsConfiguration;

	static activityItemsConfigurationWithObjects(objects: NSArray<NSItemProviderWriting> | NSItemProviderWriting[]): UIActivityItemsConfiguration;

	static alloc(): UIActivityItemsConfiguration; // inherited from NSObject

	static new(): UIActivityItemsConfiguration; // inherited from NSObject

	applicationActivitiesProvider: () => NSArray<UIActivity>;

	localObject: any;

	metadataProvider: (p1: string) => any;

	perItemMetadataProvider: (p1: number, p2: string) => any;

	previewProvider: (p1: number, p2: string, p3: CGSize) => NSItemProvider;

	supportedInteractions: NSArray<string>;

	readonly applicationActivitiesForActivityItemsConfiguration: NSArray<UIActivity>; // inherited from UIActivityItemsConfigurationReading

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly itemProvidersForActivityItemsConfiguration: NSArray<NSItemProvider>; // inherited from UIActivityItemsConfigurationReading

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { itemProviders: NSArray<NSItemProvider> | NSItemProvider[]; });

	constructor(o: { objects: NSArray<NSItemProviderWriting> | NSItemProviderWriting[]; });

	activityItemsConfigurationMetadataForItemAtIndexKey(index: number, key: string): any;

	activityItemsConfigurationMetadataForKey(key: string): any;

	activityItemsConfigurationPreviewForItemAtIndexIntentSuggestedSize(index: number, intent: string, suggestedSize: CGSize): NSItemProvider;

	activityItemsConfigurationSupportsInteraction(interaction: string): boolean;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithItemProviders(itemProviders: NSArray<NSItemProvider> | NSItemProvider[]): this;

	initWithObjects(objects: NSArray<NSItemProviderWriting> | NSItemProviderWriting[]): this;

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
 * @since 16.4
 */
declare var UIActivityItemsConfigurationInteractionCopy: string;

/**
 * @since 13.0
 */
declare var UIActivityItemsConfigurationInteractionShare: string;

/**
 * @since 18.0
 */
declare var UIActivityItemsConfigurationMetadataKeyCollaborationModeRestrictions: string;

/**
 * @since 15.0
 */
declare var UIActivityItemsConfigurationMetadataKeyLinkPresentationMetadata: string;

/**
 * @since 13.0
 */
declare var UIActivityItemsConfigurationMetadataKeyMessageBody: string;

/**
 * @since 18.0
 */
declare var UIActivityItemsConfigurationMetadataKeyShareRecipients: string;

/**
 * @since 13.0
 */
declare var UIActivityItemsConfigurationMetadataKeyTitle: string;

/**
 * @since 13.0
 */
declare var UIActivityItemsConfigurationPreviewIntentFullSize: string;

/**
 * @since 13.0
 */
declare var UIActivityItemsConfigurationPreviewIntentThumbnail: string;

/**
 * @since 15.0
 */
interface UIActivityItemsConfigurationProviding extends NSObjectProtocol {

	/**
	 * @since 15.0
	 */
	activityItemsConfiguration: UIActivityItemsConfigurationReading;
}
declare var UIActivityItemsConfigurationProviding: {

	prototype: UIActivityItemsConfigurationProviding;
};

/**
 * @since 13.0
 */
interface UIActivityItemsConfigurationReading extends NSObjectProtocol {

	applicationActivitiesForActivityItemsConfiguration?: NSArray<UIActivity>;

	itemProvidersForActivityItemsConfiguration: NSArray<NSItemProvider>;

	activityItemsConfigurationMetadataForItemAtIndexKey?(index: number, key: string): any;

	activityItemsConfigurationMetadataForKey?(key: string): any;

	activityItemsConfigurationPreviewForItemAtIndexIntentSuggestedSize?(index: number, intent: string, suggestedSize: CGSize): NSItemProvider;

	activityItemsConfigurationSupportsInteraction?(interaction: string): boolean;
}
declare var UIActivityItemsConfigurationReading: {

	prototype: UIActivityItemsConfigurationReading;
};

/**
 * @since 18.0
 */
declare const enum UIActivitySectionTypes {

	None = 0,

	PeopleSuggestions = 1
}

/**
 * @since 16.4
 */
declare var UIActivityTypeAddToHomeScreen: string;

/**
 * @since 7.0
 */
declare var UIActivityTypeAddToReadingList: string;

/**
 * @since 7.0
 */
declare var UIActivityTypeAirDrop: string;

/**
 * @since 6.0
 */
declare var UIActivityTypeAssignToContact: string;

/**
 * @since 16.0
 */
declare var UIActivityTypeCollaborationCopyLink: string;

/**
 * @since 16.0
 */
declare var UIActivityTypeCollaborationInviteWithLink: string;

/**
 * @since 6.0
 */
declare var UIActivityTypeCopyToPasteboard: string;

/**
 * @since 6.0
 */
declare var UIActivityTypeMail: string;

/**
 * @since 11.0
 */
declare var UIActivityTypeMarkupAsPDF: string;

/**
 * @since 6.0
 */
declare var UIActivityTypeMessage: string;

/**
 * @since 9.0
 */
declare var UIActivityTypeOpenInIBooks: string;

/**
 * @since 6.0
 */
declare var UIActivityTypePostToFacebook: string;

/**
 * @since 7.0
 */
declare var UIActivityTypePostToFlickr: string;

/**
 * @since 7.0
 */
declare var UIActivityTypePostToTencentWeibo: string;

/**
 * @since 6.0
 */
declare var UIActivityTypePostToTwitter: string;

/**
 * @since 7.0
 */
declare var UIActivityTypePostToVimeo: string;

/**
 * @since 6.0
 */
declare var UIActivityTypePostToWeibo: string;

/**
 * @since 6.0
 */
declare var UIActivityTypePrint: string;

/**
 * @since 6.0
 */
declare var UIActivityTypeSaveToCameraRoll: string;

/**
 * @since 15.4
 */
declare var UIActivityTypeSharePlay: string;

/**
 * @since 6.0
 */
declare class UIActivityViewController extends UIViewController {

	static alloc(): UIActivityViewController; // inherited from NSObject

	static new(): UIActivityViewController; // inherited from NSObject

	/**
	 * @since 15.4
	 */
	allowsProminentActivity: boolean;

	/**
	 * @since 6.0
	 * @deprecated 8.0
	 */
	completionHandler: (p1: string, p2: boolean) => void;

	/**
	 * @since 8.0
	 */
	completionWithItemsHandler: (p1: string, p2: boolean, p3: NSArray<any>, p4: NSError) => void;

	/**
	 * @since 18.0
	 */
	excludedActivitySectionTypes: UIActivitySectionTypes;

	excludedActivityTypes: NSArray<string>;

	constructor(o: { activityItems: NSArray<any> | any[]; applicationActivities: NSArray<UIActivity> | UIActivity[]; });

	/**
	 * @since 14.0
	 */
	constructor(o: { activityItemsConfiguration: UIActivityItemsConfigurationReading; });

	initWithActivityItemsApplicationActivities(activityItems: NSArray<any> | any[], applicationActivities: NSArray<UIActivity> | UIActivity[]): this;

	/**
	 * @since 14.0
	 */
	initWithActivityItemsConfiguration(activityItemsConfiguration: UIActivityItemsConfigurationReading): this;
}

interface UIAdaptivePresentationControllerDelegate extends NSObjectProtocol {

	adaptivePresentationStyleForPresentationController?(controller: UIPresentationController): UIModalPresentationStyle;

	/**
	 * @since 8.3
	 */
	adaptivePresentationStyleForPresentationControllerTraitCollection?(controller: UIPresentationController, traitCollection: UITraitCollection): UIModalPresentationStyle;

	/**
	 * @since 13.0
	 */
	presentationControllerDidAttemptToDismiss?(presentationController: UIPresentationController): void;

	/**
	 * @since 13.0
	 */
	presentationControllerDidDismiss?(presentationController: UIPresentationController): void;

	/**
	 * @since 15.0
	 */
	presentationControllerPrepareAdaptivePresentationController?(presentationController: UIPresentationController, adaptivePresentationController: UIPresentationController): void;

	/**
	 * @since 13.0
	 */
	presentationControllerShouldDismiss?(presentationController: UIPresentationController): boolean;

	presentationControllerViewControllerForAdaptivePresentationStyle?(controller: UIPresentationController, style: UIModalPresentationStyle): UIViewController;

	/**
	 * @since 13.0
	 */
	presentationControllerWillDismiss?(presentationController: UIPresentationController): void;

	/**
	 * @since 8.3
	 */
	presentationControllerWillPresentWithAdaptiveStyleTransitionCoordinator?(presentationController: UIPresentationController, style: UIModalPresentationStyle, transitionCoordinator: UIViewControllerTransitionCoordinator): void;
}
declare var UIAdaptivePresentationControllerDelegate: {

	prototype: UIAdaptivePresentationControllerDelegate;
};

/**
 * @since 8.0
 */
declare class UIAlertAction extends NSObject implements NSCopying, UIAccessibilityIdentification {

	static actionWithTitleStyleHandler(title: string, style: UIAlertActionStyle, handler: (p1: UIAlertAction) => void): UIAlertAction;

	static alloc(): UIAlertAction; // inherited from NSObject

	static new(): UIAlertAction; // inherited from NSObject

	enabled: boolean;

	readonly style: UIAlertActionStyle;

	readonly title: string;

	/**
	 * @since 5.0
	 */
	accessibilityIdentifier: string; // inherited from UIAccessibilityIdentification

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

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
 * @since 8.0
 */
declare const enum UIAlertActionStyle {

	Default = 0,

	Cancel = 1,

	Destructive = 2
}

/**
 * @since 8.0
 */
declare class UIAlertController extends UIViewController implements UISpringLoadedInteractionSupporting {

	static alertControllerWithTitleMessagePreferredStyle(title: string, message: string, preferredStyle: UIAlertControllerStyle): UIAlertController;

	static alloc(): UIAlertController; // inherited from NSObject

	static new(): UIAlertController; // inherited from NSObject

	readonly actions: NSArray<UIAlertAction>;

	message: string;

	/**
	 * @since 9.0
	 */
	preferredAction: UIAlertAction;

	readonly preferredStyle: UIAlertControllerStyle;

	/**
	 * @since 16.0
	 */
	severity: UIAlertControllerSeverity;

	readonly textFields: NSArray<UITextField>;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	springLoaded: boolean; // inherited from UISpringLoadedInteractionSupporting

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	addAction(action: UIAlertAction): void;

	addTextFieldWithConfigurationHandler(configurationHandler: (p1: UITextField) => void): void;

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

/**
 * @since 16.0
 */
declare const enum UIAlertControllerSeverity {

	Default = 0,

	Critical = 1
}

/**
 * @since 8.0
 */
declare const enum UIAlertControllerStyle {

	ActionSheet = 0,

	Alert = 1
}

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare class UIAlertView extends UIView {

	static alloc(): UIAlertView; // inherited from NSObject

	static appearance(): UIAlertView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIAlertView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIAlertView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIAlertView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIAlertView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIAlertView; // inherited from UIAppearance

	static new(): UIAlertView; // inherited from NSObject

	/**
	 * @since 5.0
	 */
	alertViewStyle: UIAlertViewStyle;

	cancelButtonIndex: number;

	delegate: any;

	readonly firstOtherButtonIndex: number;

	message: string;

	readonly numberOfButtons: number;

	title: string;

	readonly visible: boolean;

	constructor(o: { title: string; message: string; delegate: any; cancelButtonTitle: string; otherButtonTitles: string; });

	addButtonWithTitle(title: string): number;

	buttonTitleAtIndex(buttonIndex: number): string;

	dismissWithClickedButtonIndexAnimated(buttonIndex: number, animated: boolean): void;

	initWithTitleMessageDelegateCancelButtonTitleOtherButtonTitles(title: string, message: string, delegate: any, cancelButtonTitle: string, otherButtonTitles: string): this;

	show(): void;

	/**
	 * @since 5.0
	 */
	textFieldAtIndex(textFieldIndex: number): UITextField;
}

interface UIAlertViewDelegate extends NSObjectProtocol {

	/**
	 * @since 2.0
	 * @deprecated 9.0
	 */
	alertViewCancel?(alertView: UIAlertView): void;

	/**
	 * @since 2.0
	 * @deprecated 9.0
	 */
	alertViewClickedButtonAtIndex?(alertView: UIAlertView, buttonIndex: number): void;

	/**
	 * @since 2.0
	 * @deprecated 9.0
	 */
	alertViewDidDismissWithButtonIndex?(alertView: UIAlertView, buttonIndex: number): void;

	/**
	 * @since 2.0
	 * @deprecated 9.0
	 */
	alertViewShouldEnableFirstOtherButton?(alertView: UIAlertView): boolean;

	/**
	 * @since 2.0
	 * @deprecated 9.0
	 */
	alertViewWillDismissWithButtonIndex?(alertView: UIAlertView, buttonIndex: number): void;

	/**
	 * @since 2.0
	 * @deprecated 9.0
	 */
	didPresentAlertView?(alertView: UIAlertView): void;

	/**
	 * @since 2.0
	 * @deprecated 9.0
	 */
	willPresentAlertView?(alertView: UIAlertView): void;
}
declare var UIAlertViewDelegate: {

	prototype: UIAlertViewDelegate;
};

declare const enum UIAlertViewStyle {

	Default = 0,

	SecureTextInput = 1,

	PlainTextInput = 2,

	LoginAndPasswordInput = 3
}

interface UIAppearance extends NSObjectProtocol {
}
declare var UIAppearance: {

	prototype: UIAppearance;

	appearance(): UIAppearance;

	/**
	 * @since 8.0
	 */
	appearanceForTraitCollection(trait: UITraitCollection): UIAppearance;

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIAppearance;

	/**
	 * @since 9.0
	 */
	appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIAppearance;

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIAppearance;

	/**
	 * @since 9.0
	 */
	appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIAppearance;
};

interface UIAppearanceContainer extends NSObjectProtocol {
}
declare var UIAppearanceContainer: {

	prototype: UIAppearanceContainer;
};

/**
 * @since 2.0
 */
declare class UIApplication extends UIResponder {

	static alloc(): UIApplication; // inherited from NSObject

	static new(): UIApplication; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	static registerObjectForStateRestorationRestorationIdentifier(object: UIStateRestoring, restorationIdentifier: string): void;

	/**
	 * @since 10.3
	 */
	readonly alternateIconName: string;

	/**
	 * @since 2.0
	 * @deprecated 17.0
	 */
	applicationIconBadgeNumber: number;

	/**
	 * @since 4.0
	 */
	readonly applicationState: UIApplicationState;

	/**
	 * @since 3.0
	 */
	applicationSupportsShakeToEdit: boolean;

	/**
	 * @since 7.0
	 */
	readonly backgroundRefreshStatus: UIBackgroundRefreshStatus;

	/**
	 * @since 4.0
	 */
	readonly backgroundTimeRemaining: number;

	/**
	 * @since 13.0
	 */
	readonly connectedScenes: NSSet<UIScene>;

	/**
	 * @since 8.0
	 * @deprecated 10.0
	 */
	readonly currentUserNotificationSettings: UIUserNotificationSettings;

	delegate: UIApplicationDelegate;

	idleTimerDisabled: boolean;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	readonly ignoringInteractionEvents: boolean;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	readonly keyWindow: UIWindow;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	networkActivityIndicatorVisible: boolean;

	/**
	 * @since 13.0
	 */
	readonly openSessions: NSSet<UISceneSession>;

	/**
	 * @since 7.0
	 */
	readonly preferredContentSizeCategory: string;

	/**
	 * @since 4.0
	 */
	readonly protectedDataAvailable: boolean;

	/**
	 * @since 2.0
	 * @deprecated 3.0
	 */
	proximitySensingEnabled: boolean;

	/**
	 * @since 8.0
	 */
	readonly registeredForRemoteNotifications: boolean;

	/**
	 * @since 4.0
	 * @deprecated 10.0
	 */
	scheduledLocalNotifications: NSArray<UILocalNotification>;

	/**
	 * @since 9.0
	 */
	shortcutItems: NSArray<UIApplicationShortcutItem>;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	readonly statusBarFrame: CGRect;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	readonly statusBarHidden: boolean;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	readonly statusBarOrientation: UIInterfaceOrientation;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	readonly statusBarOrientationAnimationDuration: number;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	readonly statusBarStyle: UIStatusBarStyle;

	/**
	 * @since 10.3
	 */
	readonly supportsAlternateIcons: boolean;

	/**
	 * @since 13.0
	 */
	readonly supportsMultipleScenes: boolean;

	/**
	 * @since 5.0
	 */
	readonly userInterfaceLayoutDirection: UIUserInterfaceLayoutDirection;

	/**
	 * @since 2.0
	 * @deprecated 15.0
	 */
	readonly windows: NSArray<UIWindow>;

	static readonly sharedApplication: UIApplication;

	/**
	 * @since 17.0
	 */
	activateSceneSessionForRequestErrorHandler(request: UISceneSessionActivationRequest, errorHandler: (p1: NSError) => void): void;

	/**
	 * @since 4.0
	 */
	beginBackgroundTaskWithExpirationHandler(handler: () => void): number;

	/**
	 * @since 7.0
	 */
	beginBackgroundTaskWithNameExpirationHandler(taskName: string, handler: () => void): number;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	beginIgnoringInteractionEvents(): void;

	/**
	 * @since 4.0
	 */
	beginReceivingRemoteControlEvents(): void;

	/**
	 * @since 3.0
	 */
	canOpenURL(url: NSURL): boolean;

	/**
	 * @since 4.0
	 * @deprecated 10.0
	 */
	cancelAllLocalNotifications(): void;

	/**
	 * @since 4.0
	 * @deprecated 10.0
	 */
	cancelLocalNotification(notification: UILocalNotification): void;

	/**
	 * @since 4.0
	 * @deprecated 9.0
	 */
	clearKeepAliveTimeout(): void;

	/**
	 * @since 6.0
	 */
	completeStateRestoration(): void;

	/**
	 * @since 3.0
	 * @deprecated 8.0
	 */
	enabledRemoteNotificationTypes(): UIRemoteNotificationType;

	/**
	 * @since 4.0
	 */
	endBackgroundTask(identifier: number): void;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	endIgnoringInteractionEvents(): void;

	/**
	 * @since 4.0
	 */
	endReceivingRemoteControlEvents(): void;

	/**
	 * @since 6.0
	 */
	extendStateRestoration(): void;

	/**
	 * @since 7.0
	 */
	ignoreSnapshotOnNextApplicationLaunch(): void;

	/**
	 * @since 2.0
	 * @deprecated 10.0
	 */
	openURL(url: NSURL): boolean;

	/**
	 * @since 10.0
	 */
	openURLOptionsCompletionHandler(url: NSURL, options: NSDictionary<string, any>, completion: (p1: boolean) => void): void;

	/**
	 * @since 4.0
	 * @deprecated 10.0
	 */
	presentLocalNotificationNow(notification: UILocalNotification): void;

	/**
	 * @since 3.0
	 * @deprecated 8.0
	 */
	registerForRemoteNotificationTypes(types: UIRemoteNotificationType): void;

	/**
	 * @since 8.0
	 */
	registerForRemoteNotifications(): void;

	/**
	 * @since 8.0
	 * @deprecated 10.0
	 */
	registerUserNotificationSettings(notificationSettings: UIUserNotificationSettings): void;

	/**
	 * @since 13.0
	 * @deprecated 100000
	 */
	requestSceneSessionActivationUserActivityOptionsErrorHandler(sceneSession: UISceneSession, userActivity: NSUserActivity, options: UISceneActivationRequestOptions, errorHandler: (p1: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	requestSceneSessionDestructionOptionsErrorHandler(sceneSession: UISceneSession, options: UISceneDestructionRequestOptions, errorHandler: (p1: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	requestSceneSessionRefresh(sceneSession: UISceneSession): void;

	/**
	 * @since 4.0
	 * @deprecated 10.0
	 */
	scheduleLocalNotification(notification: UILocalNotification): void;

	sendActionToFromForEvent(action: string, target: any, sender: any, event: _UIEvent): boolean;

	sendEvent(event: _UIEvent): void;

	/**
	 * @since 10.3
	 */
	setAlternateIconNameCompletionHandler(alternateIconName: string, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 4.0
	 * @deprecated 9.0
	 */
	setKeepAliveTimeoutHandler(timeout: number, keepAliveHandler: () => void): boolean;

	/**
	 * @since 7.0
	 * @deprecated 13.0
	 */
	setMinimumBackgroundFetchInterval(minimumBackgroundFetchInterval: number): void;

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	setNewsstandIconImage(image: UIImage): void;

	/**
	 * @since 2.0
	 * @deprecated 3.2
	 */
	setStatusBarHiddenAnimated(hidden: boolean, animated: boolean): void;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	setStatusBarHiddenWithAnimation(hidden: boolean, animation: UIStatusBarAnimation): void;

	/**
	 * @since 2.0
	 * @deprecated 9.0
	 */
	setStatusBarOrientationAnimated(interfaceOrientation: UIInterfaceOrientation, animated: boolean): void;

	/**
	 * @since 2.0
	 * @deprecated 9.0
	 */
	setStatusBarStyleAnimated(statusBarStyle: UIStatusBarStyle, animated: boolean): void;

	/**
	 * @since 6.0
	 */
	supportedInterfaceOrientationsForWindow(window: UIWindow): UIInterfaceOrientationMask;

	/**
	 * @since 3.0
	 */
	unregisterForRemoteNotifications(): void;
}

/**
 * @since 7.0
 */
declare var UIApplicationBackgroundFetchIntervalMinimum: number;

/**
 * @since 7.0
 */
declare var UIApplicationBackgroundFetchIntervalNever: number;

/**
 * @since 7.0
 */
declare var UIApplicationBackgroundRefreshStatusDidChangeNotification: string;

interface UIApplicationDelegate extends NSObjectProtocol {

	/**
	 * @since 5.0
	 */
	window?: UIWindow;

	/**
	 * @since 13.0
	 */
	applicationConfigurationForConnectingSceneSessionOptions?(application: UIApplication, connectingSceneSession: UISceneSession, options: UISceneConnectionOptions): UISceneConfiguration;

	/**
	 * @since 8.0
	 */
	applicationContinueUserActivityRestorationHandler?(application: UIApplication, userActivity: NSUserActivity, restorationHandler: (p1: NSArray<UIUserActivityRestoring>) => void): boolean;

	applicationDidBecomeActive?(application: UIApplication): void;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	applicationDidChangeStatusBarFrame?(application: UIApplication, oldStatusBarFrame: CGRect): void;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	applicationDidChangeStatusBarOrientation?(application: UIApplication, oldStatusBarOrientation: UIInterfaceOrientation): void;

	/**
	 * @since 6.0
	 */
	applicationDidDecodeRestorableStateWithCoder?(application: UIApplication, coder: NSCoder): void;

	/**
	 * @since 13.0
	 */
	applicationDidDiscardSceneSessions?(application: UIApplication, sceneSessions: NSSet<UISceneSession>): void;

	/**
	 * @since 4.0
	 */
	applicationDidEnterBackground?(application: UIApplication): void;

	/**
	 * @since 8.0
	 */
	applicationDidFailToContinueUserActivityWithTypeError?(application: UIApplication, userActivityType: string, error: NSError): void;

	/**
	 * @since 3.0
	 */
	applicationDidFailToRegisterForRemoteNotificationsWithError?(application: UIApplication, error: NSError): void;

	applicationDidFinishLaunching?(application: UIApplication): void;

	/**
	 * @since 3.0
	 */
	applicationDidFinishLaunchingWithOptions?(application: UIApplication, launchOptions: NSDictionary<string, any>): boolean;

	/**
	 * @since 4.0
	 * @deprecated 10.0
	 */
	applicationDidReceiveLocalNotification?(application: UIApplication, notification: UILocalNotification): void;

	applicationDidReceiveMemoryWarning?(application: UIApplication): void;

	/**
	 * @since 3.0
	 * @deprecated 10.0
	 */
	applicationDidReceiveRemoteNotification?(application: UIApplication, userInfo: NSDictionary<any, any>): void;

	/**
	 * @since 7.0
	 */
	applicationDidReceiveRemoteNotificationFetchCompletionHandler?(application: UIApplication, userInfo: NSDictionary<any, any>, completionHandler: (p1: UIBackgroundFetchResult) => void): void;

	/**
	 * @since 3.0
	 */
	applicationDidRegisterForRemoteNotificationsWithDeviceToken?(application: UIApplication, deviceToken: NSData): void;

	/**
	 * @since 8.0
	 * @deprecated 10.0
	 */
	applicationDidRegisterUserNotificationSettings?(application: UIApplication, notificationSettings: UIUserNotificationSettings): void;

	/**
	 * @since 8.0
	 */
	applicationDidUpdateUserActivity?(application: UIApplication, userActivity: NSUserActivity): void;

	/**
	 * @since 8.0
	 * @deprecated 10.0
	 */
	applicationHandleActionWithIdentifierForLocalNotificationCompletionHandler?(application: UIApplication, identifier: string, notification: UILocalNotification, completionHandler: () => void): void;

	/**
	 * @since 9.0
	 * @deprecated 10.0
	 */
	applicationHandleActionWithIdentifierForLocalNotificationWithResponseInfoCompletionHandler?(application: UIApplication, identifier: string, notification: UILocalNotification, responseInfo: NSDictionary<any, any>, completionHandler: () => void): void;

	/**
	 * @since 8.0
	 * @deprecated 10.0
	 */
	applicationHandleActionWithIdentifierForRemoteNotificationCompletionHandler?(application: UIApplication, identifier: string, userInfo: NSDictionary<any, any>, completionHandler: () => void): void;

	/**
	 * @since 9.0
	 * @deprecated 10.0
	 */
	applicationHandleActionWithIdentifierForRemoteNotificationWithResponseInfoCompletionHandler?(application: UIApplication, identifier: string, userInfo: NSDictionary<any, any>, responseInfo: NSDictionary<any, any>, completionHandler: () => void): void;

	/**
	 * @since 7.0
	 */
	applicationHandleEventsForBackgroundURLSessionCompletionHandler?(application: UIApplication, identifier: string, completionHandler: () => void): void;

	/**
	 * @since 11.0
	 * @deprecated 14.0
	 */
	applicationHandleIntentCompletionHandler?(application: UIApplication, intent: INIntent, completionHandler: (p1: INIntentResponse) => void): void;

	/**
	 * @since 2.0
	 * @deprecated 9.0
	 */
	applicationHandleOpenURL?(application: UIApplication, url: NSURL): boolean;

	/**
	 * @since 8.2
	 */
	applicationHandleWatchKitExtensionRequestReply?(application: UIApplication, userInfo: NSDictionary<any, any>, reply: (p1: NSDictionary<any, any>) => void): void;

	/**
	 * @since 14.0
	 */
	applicationHandlerForIntent?(application: UIApplication, intent: INIntent): any;

	/**
	 * @since 9.0
	 */
	applicationOpenURLOptions?(app: UIApplication, url: NSURL, options: NSDictionary<string, any>): boolean;

	/**
	 * @since 4.2
	 * @deprecated 9.0
	 */
	applicationOpenURLSourceApplicationAnnotation?(application: UIApplication, url: NSURL, sourceApplication: string, annotation: any): boolean;

	/**
	 * @since 9.0
	 */
	applicationPerformActionForShortcutItemCompletionHandler?(application: UIApplication, shortcutItem: UIApplicationShortcutItem, completionHandler: (p1: boolean) => void): void;

	/**
	 * @since 7.0
	 * @deprecated 13.0
	 */
	applicationPerformFetchWithCompletionHandler?(application: UIApplication, completionHandler: (p1: UIBackgroundFetchResult) => void): void;

	/**
	 * @since 4.0
	 */
	applicationProtectedDataDidBecomeAvailable?(application: UIApplication): void;

	/**
	 * @since 4.0
	 */
	applicationProtectedDataWillBecomeUnavailable?(application: UIApplication): void;

	/**
	 * @since 8.0
	 */
	applicationShouldAllowExtensionPointIdentifier?(application: UIApplication, extensionPointIdentifier: string): boolean;

	/**
	 * @since 15.0
	 */
	applicationShouldAutomaticallyLocalizeKeyCommands?(application: UIApplication): boolean;

	/**
	 * @since 9.0
	 */
	applicationShouldRequestHealthAuthorization?(application: UIApplication): void;

	/**
	 * @since 6.0
	 * @deprecated 13.2
	 */
	applicationShouldRestoreApplicationState?(application: UIApplication, coder: NSCoder): boolean;

	/**
	 * @since 13.2
	 */
	applicationShouldRestoreSecureApplicationState?(application: UIApplication, coder: NSCoder): boolean;

	/**
	 * @since 6.0
	 * @deprecated 13.2
	 */
	applicationShouldSaveApplicationState?(application: UIApplication, coder: NSCoder): boolean;

	/**
	 * @since 13.2
	 */
	applicationShouldSaveSecureApplicationState?(application: UIApplication, coder: NSCoder): boolean;

	applicationSignificantTimeChange?(application: UIApplication): void;

	/**
	 * @since 6.0
	 */
	applicationSupportedInterfaceOrientationsForWindow?(application: UIApplication, window: UIWindow): UIInterfaceOrientationMask;

	/**
	 * @since 10.0
	 */
	applicationUserDidAcceptCloudKitShareWithMetadata?(application: UIApplication, cloudKitShareMetadata: CKShareMetadata): void;

	/**
	 * @since 6.0
	 */
	applicationViewControllerWithRestorationIdentifierPathCoder?(application: UIApplication, identifierComponents: NSArray<string> | string[], coder: NSCoder): UIViewController;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	applicationWillChangeStatusBarFrame?(application: UIApplication, newStatusBarFrame: CGRect): void;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	applicationWillChangeStatusBarOrientationDuration?(application: UIApplication, newStatusBarOrientation: UIInterfaceOrientation, duration: number): void;

	/**
	 * @since 8.0
	 */
	applicationWillContinueUserActivityWithType?(application: UIApplication, userActivityType: string): boolean;

	/**
	 * @since 6.0
	 */
	applicationWillEncodeRestorableStateWithCoder?(application: UIApplication, coder: NSCoder): void;

	/**
	 * @since 4.0
	 */
	applicationWillEnterForeground?(application: UIApplication): void;

	/**
	 * @since 6.0
	 */
	applicationWillFinishLaunchingWithOptions?(application: UIApplication, launchOptions: NSDictionary<string, any>): boolean;

	applicationWillResignActive?(application: UIApplication): void;

	applicationWillTerminate?(application: UIApplication): void;
}
declare var UIApplicationDelegate: {

	prototype: UIApplicationDelegate;
};

declare var UIApplicationDidBecomeActiveNotification: string;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare var UIApplicationDidChangeStatusBarFrameNotification: string;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare var UIApplicationDidChangeStatusBarOrientationNotification: string;

/**
 * @since 4.0
 */
declare var UIApplicationDidEnterBackgroundNotification: string;

declare var UIApplicationDidFinishLaunchingNotification: string;

declare var UIApplicationDidReceiveMemoryWarningNotification: string;

/**
 * @since 6.0
 */
declare var UIApplicationInvalidInterfaceOrientationException: string;

/**
 * @since 8.0
 */
declare var UIApplicationKeyboardExtensionPointIdentifier: string;

/**
 * @since 3.2
 * @deprecated 16.0
 */
declare var UIApplicationLaunchOptionsAnnotationKey: string;

/**
 * @since 7.0
 */
declare var UIApplicationLaunchOptionsBluetoothCentralsKey: string;

/**
 * @since 7.0
 */
declare var UIApplicationLaunchOptionsBluetoothPeripheralsKey: string;

/**
 * @since 10.0
 */
declare var UIApplicationLaunchOptionsCloudKitShareMetadataKey: string;

/**
 * @since 14.5
 */
declare var UIApplicationLaunchOptionsEventAttributionKey: string;

/**
 * @since 4.0
 * @deprecated 10.0
 */
declare var UIApplicationLaunchOptionsLocalNotificationKey: string;

/**
 * @since 4.0
 */
declare var UIApplicationLaunchOptionsLocationKey: string;

/**
 * @since 5.0
 */
declare var UIApplicationLaunchOptionsNewsstandDownloadsKey: string;

/**
 * @since 3.0
 */
declare var UIApplicationLaunchOptionsRemoteNotificationKey: string;

/**
 * @since 9.0
 */
declare var UIApplicationLaunchOptionsShortcutItemKey: string;

/**
 * @since 3.0
 */
declare var UIApplicationLaunchOptionsSourceApplicationKey: string;

/**
 * @since 3.0
 */
declare var UIApplicationLaunchOptionsURLKey: string;

/**
 * @since 8.0
 */
declare var UIApplicationLaunchOptionsUserActivityDictionaryKey: string;

/**
 * @since 8.0
 */
declare var UIApplicationLaunchOptionsUserActivityTypeKey: string;

declare function UIApplicationMain(argc: number, argv: interop.Reference<interop.Pointer | interop.Reference<any>>, principalClassName: string, delegateClassName: string): never;

/**
 * @since 14.5
 */
declare var UIApplicationOpenExternalURLOptionsEventAttributionKey: string;

/**
 * @since 15.4
 */
declare var UIApplicationOpenNotificationSettingsURLString: string;

/**
 * @since 8.0
 */
declare var UIApplicationOpenSettingsURLString: string;

/**
 * @since 10.0
 */
declare var UIApplicationOpenURLOptionUniversalLinksOnly: string;

/**
 * @since 9.0
 */
declare var UIApplicationOpenURLOptionsAnnotationKey: string;

/**
 * @since 14.5
 */
declare var UIApplicationOpenURLOptionsEventAttributionKey: string;

/**
 * @since 9.0
 */
declare var UIApplicationOpenURLOptionsOpenInPlaceKey: string;

/**
 * @since 9.0
 */
declare var UIApplicationOpenURLOptionsSourceApplicationKey: string;

/**
 * @since 4.0
 */
declare var UIApplicationProtectedDataDidBecomeAvailable: string;

/**
 * @since 4.0
 */
declare var UIApplicationProtectedDataWillBecomeUnavailable: string;

/**
 * @since 9.0
 */
declare class UIApplicationShortcutIcon extends NSObject implements NSCopying {

	static alloc(): UIApplicationShortcutIcon; // inherited from NSObject

	static iconWithContact(contact: CNContact): UIApplicationShortcutIcon;

	static iconWithSystemImageName(systemImageName: string): UIApplicationShortcutIcon;

	static iconWithTemplateImageName(templateImageName: string): UIApplicationShortcutIcon;

	static iconWithType(type: UIApplicationShortcutIconType): UIApplicationShortcutIcon;

	static new(): UIApplicationShortcutIcon; // inherited from NSObject

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 9.0
 */
declare const enum UIApplicationShortcutIconType {

	Compose = 0,

	Play = 1,

	Pause = 2,

	Add = 3,

	Location = 4,

	Search = 5,

	Share = 6,

	Prohibit = 7,

	Contact = 8,

	Home = 9,

	MarkLocation = 10,

	Favorite = 11,

	Love = 12,

	Cloud = 13,

	Invitation = 14,

	Confirmation = 15,

	Mail = 16,

	Message = 17,

	Date = 18,

	Time = 19,

	CapturePhoto = 20,

	CaptureVideo = 21,

	Task = 22,

	TaskCompleted = 23,

	Alarm = 24,

	Bookmark = 25,

	Shuffle = 26,

	Audio = 27,

	Update = 28
}

/**
 * @since 9.0
 */
declare class UIApplicationShortcutItem extends NSObject implements NSCopying, NSMutableCopying {

	static alloc(): UIApplicationShortcutItem; // inherited from NSObject

	static new(): UIApplicationShortcutItem; // inherited from NSObject

	readonly icon: UIApplicationShortcutIcon;

	readonly localizedSubtitle: string;

	readonly localizedTitle: string;

	readonly targetContentIdentifier: any;

	readonly type: string;

	readonly userInfo: NSDictionary<string, NSSecureCoding>;

	constructor(o: { type: string; localizedTitle: string; });

	constructor(o: { type: string; localizedTitle: string; localizedSubtitle: string; icon: UIApplicationShortcutIcon; userInfo: NSDictionary<string, NSSecureCoding>; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithTypeLocalizedTitle(type: string, localizedTitle: string): this;

	initWithTypeLocalizedTitleLocalizedSubtitleIconUserInfo(type: string, localizedTitle: string, localizedSubtitle: string, icon: UIApplicationShortcutIcon, userInfo: NSDictionary<string, NSSecureCoding>): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare var UIApplicationSignificantTimeChangeNotification: string;

/**
 * @since 4.0
 */
declare const enum UIApplicationState {

	Active = 0,

	Inactive = 1,

	Background = 2
}

/**
 * @since 6.0
 */
declare var UIApplicationStateRestorationBundleVersionKey: string;

/**
 * @since 7.0
 */
declare var UIApplicationStateRestorationSystemVersionKey: string;

/**
 * @since 7.0
 */
declare var UIApplicationStateRestorationTimestampKey: string;

/**
 * @since 6.0
 */
declare var UIApplicationStateRestorationUserInterfaceIdiomKey: string;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare var UIApplicationStatusBarFrameUserInfoKey: string;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare var UIApplicationStatusBarOrientationUserInfoKey: string;

/**
 * @since 7.0
 */
declare var UIApplicationUserDidTakeScreenshotNotification: string;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare var UIApplicationWillChangeStatusBarFrameNotification: string;

/**
 * @since 2.0
 * @deprecated 13.0
 */
declare var UIApplicationWillChangeStatusBarOrientationNotification: string;

/**
 * @since 4.0
 */
declare var UIApplicationWillEnterForegroundNotification: string;

declare var UIApplicationWillResignActiveNotification: string;

declare var UIApplicationWillTerminateNotification: string;

/**
 * @since 7.0
 */
declare class UIAttachmentBehavior extends UIDynamicBehavior {

	static alloc(): UIAttachmentBehavior; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	static fixedAttachmentWithItemAttachedToItemAttachmentAnchor(item1: UIDynamicItem, item2: UIDynamicItem, point: CGPoint): UIAttachmentBehavior;

	/**
	 * @since 9.0
	 */
	static limitAttachmentWithItemOffsetFromCenterAttachedToItemOffsetFromCenter(item1: UIDynamicItem, offset1: UIOffset, item2: UIDynamicItem, offset2: UIOffset): UIAttachmentBehavior;

	static new(): UIAttachmentBehavior; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	static pinAttachmentWithItemAttachedToItemAttachmentAnchor(item1: UIDynamicItem, item2: UIDynamicItem, point: CGPoint): UIAttachmentBehavior;

	/**
	 * @since 9.0
	 */
	static slidingAttachmentWithItemAttachedToItemAttachmentAnchorAxisOfTranslation(item1: UIDynamicItem, item2: UIDynamicItem, point: CGPoint, axis: CGVector): UIAttachmentBehavior;

	/**
	 * @since 9.0
	 */
	static slidingAttachmentWithItemAttachmentAnchorAxisOfTranslation(item: UIDynamicItem, point: CGPoint, axis: CGVector): UIAttachmentBehavior;

	anchorPoint: CGPoint;

	readonly attachedBehaviorType: UIAttachmentBehaviorType;

	/**
	 * @since 9.0
	 */
	attachmentRange: UIFloatRange;

	damping: number;

	frequency: number;

	/**
	 * @since 9.0
	 */
	frictionTorque: number;

	readonly items: NSArray<UIDynamicItem>;

	length: number;

	constructor(o: { item: UIDynamicItem; attachedToAnchor: CGPoint; });

	constructor(o: { item: UIDynamicItem; attachedToItem: UIDynamicItem; });

	constructor(o: { item: UIDynamicItem; offsetFromCenter: UIOffset; attachedToAnchor: CGPoint; });

	constructor(o: { item: UIDynamicItem; offsetFromCenter: UIOffset; attachedToItem: UIDynamicItem; offsetFromCenter2: UIOffset; });

	initWithItemAttachedToAnchor(item: UIDynamicItem, point: CGPoint): this;

	initWithItemAttachedToItem(item1: UIDynamicItem, item2: UIDynamicItem): this;

	initWithItemOffsetFromCenterAttachedToAnchor(item: UIDynamicItem, offset: UIOffset, point: CGPoint): this;

	initWithItemOffsetFromCenterAttachedToItemOffsetFromCenter(item1: UIDynamicItem, offset1: UIOffset, item2: UIDynamicItem, offset2: UIOffset): this;
}

/**
 * @since 7.0
 */
declare const enum UIAttachmentBehaviorType {

	Items = 0,

	Anchor = 1
}

/**
 * @since 13.4
 */
declare const enum UIAxis {

	Neither = 0,

	Horizontal = 1,

	Vertical = 2,

	Both = 3
}

/**
 * @since 14.0
 */
declare class UIBackgroundConfiguration extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UIBackgroundConfiguration; // inherited from NSObject

	static clearConfiguration(): UIBackgroundConfiguration;

	static listAccompaniedSidebarCellConfiguration(): UIBackgroundConfiguration;

	/**
	 * @since 18.0
	 */
	static listCellConfiguration(): UIBackgroundConfiguration;

	/**
	 * @since 18.0
	 */
	static listFooterConfiguration(): UIBackgroundConfiguration;

	/**
	 * @since 14.0
	 * @deprecated 18.0
	 */
	static listGroupedCellConfiguration(): UIBackgroundConfiguration;

	/**
	 * @since 14.0
	 * @deprecated 18.0
	 */
	static listGroupedHeaderFooterConfiguration(): UIBackgroundConfiguration;

	/**
	 * @since 18.0
	 */
	static listHeaderConfiguration(): UIBackgroundConfiguration;

	/**
	 * @since 14.0
	 * @deprecated 18.0
	 */
	static listPlainCellConfiguration(): UIBackgroundConfiguration;

	/**
	 * @since 14.0
	 * @deprecated 18.0
	 */
	static listPlainHeaderFooterConfiguration(): UIBackgroundConfiguration;

	/**
	 * @since 14.0
	 * @deprecated 18.0
	 */
	static listSidebarCellConfiguration(): UIBackgroundConfiguration;

	/**
	 * @since 14.0
	 * @deprecated 18.0
	 */
	static listSidebarHeaderConfiguration(): UIBackgroundConfiguration;

	static new(): UIBackgroundConfiguration; // inherited from NSObject

	backgroundColor: UIColor;

	backgroundColorTransformer: (p1: UIColor) => UIColor;

	backgroundInsets: NSDirectionalEdgeInsets;

	cornerRadius: number;

	customView: UIView;

	edgesAddingLayoutMarginsToBackgroundInsets: NSDirectionalRectEdge;

	/**
	 * @since 15.0
	 */
	image: UIImage;

	/**
	 * @since 15.0
	 */
	imageContentMode: UIViewContentMode;

	/**
	 * @since 18.0
	 */
	readonly shadowProperties: UIShadowProperties;

	strokeColor: UIColor;

	strokeColorTransformer: (p1: UIColor) => UIColor;

	strokeOutset: number;

	strokeWidth: number;

	visualEffect: UIVisualEffect;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	resolvedBackgroundColorForTintColor(tintColor: UIColor): UIColor;

	resolvedStrokeColorForTintColor(tintColor: UIColor): UIColor;

	updatedConfigurationForState(state: UIConfigurationState): this;
}

/**
 * @since 7.0
 */
declare const enum UIBackgroundFetchResult {

	NewData = 0,

	NoData = 1,

	Failed = 2
}

/**
 * @since 7.0
 */
declare const enum UIBackgroundRefreshStatus {

	Restricted = 0,

	Denied = 1,

	Available = 2
}

/**
 * @since 4.0
 */
declare var UIBackgroundTaskInvalid: number;

/**
 * @since 15.0
 */
declare class UIBandSelectionInteraction extends NSObject implements UIInteraction {

	static alloc(): UIBandSelectionInteraction; // inherited from NSObject

	static new(): UIBandSelectionInteraction; // inherited from NSObject

	enabled: boolean;

	readonly initialModifierFlags: UIKeyModifierFlags;

	readonly selectionRect: CGRect;

	shouldBeginHandler: (p1: UIBandSelectionInteraction, p2: CGPoint) => boolean;

	readonly state: UIBandSelectionInteractionState;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly view: UIView; // inherited from UIInteraction

	readonly  // inherited from NSObjectProtocol

	constructor(o: { selectionHandler: (p1: UIBandSelectionInteraction) => void; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	didMoveToView(view: UIView): void;

	initWithSelectionHandler(selectionHandler: (p1: UIBandSelectionInteraction) => void): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	willMoveToView(view: UIView): void;
}

/**
 * @since 15.0
 */
declare const enum UIBandSelectionInteractionState {

	Possible = 0,

	Began = 1,

	Selecting = 2,

	Ended = 3
}

/**
 * @since 13.0
 */
declare class UIBarAppearance extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UIBarAppearance; // inherited from NSObject

	static new(): UIBarAppearance; // inherited from NSObject

	backgroundColor: UIColor;

	backgroundEffect: UIBlurEffect;

	backgroundImage: UIImage;

	backgroundImageContentMode: UIViewContentMode;

	readonly idiom: UIUserInterfaceIdiom;

	shadowColor: UIColor;

	shadowImage: UIImage;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { barAppearance: UIBarAppearance; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { idiom: UIUserInterfaceIdiom; });

	configureWithDefaultBackground(): void;

	configureWithOpaqueBackground(): void;

	configureWithTransparentBackground(): void;

	copy(): this;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithBarAppearance(barAppearance: UIBarAppearance): this;

	initWithCoder(coder: NSCoder): this;

	initWithIdiom(idiom: UIUserInterfaceIdiom): this;
}

/**
 * @since 2.0
 */
declare class UIBarButtonItem extends UIBarItem implements NSCoding, UIPopoverPresentationControllerSourceItem, UISpringLoadedInteractionSupporting {

	static alloc(): UIBarButtonItem; // inherited from NSObject

	static appearance(): UIBarButtonItem; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIBarButtonItem; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIBarButtonItem; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIBarButtonItem; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIBarButtonItem; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIBarButtonItem; // inherited from UIAppearance

	/**
	 * @since 14.0
	 */
	static fixedSpaceItemOfWidth(width: number): UIBarButtonItem;

	/**
	 * @since 14.0
	 */
	static flexibleSpaceItem(): UIBarButtonItem;

	static new(): UIBarButtonItem; // inherited from NSObject

	action: string;

	/**
	 * @since 9.0
	 */
	readonly buttonGroup: UIBarButtonItemGroup;

	/**
	 * @since 15.0
	 */
	changesSelectionAsPrimaryAction: boolean;

	customView: UIView;

	/**
	 * @since 16.0
	 */
	hidden: boolean;

	/**
	 * @since 14.0
	 */
	menu: UIMenu;

	/**
	 * @since 16.0
	 */
	menuRepresentation: UIMenuElement;

	possibleTitles: NSSet<string>;

	/**
	 * @since 16.0
	 */
	preferredMenuElementOrder: UIContextMenuConfigurationElementOrder;

	/**
	 * @since 14.0
	 */
	primaryAction: UIAction;

	/**
	 * @since 15.0
	 */
	selected: boolean;

	style: UIBarButtonItemStyle;

	/**
	 * @since 17.0
	 */
	symbolAnimationEnabled: boolean;

	target: any;

	/**
	 * @since 5.0
	 */
	tintColor: UIColor;

	width: number;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	springLoaded: boolean; // inherited from UISpringLoadedInteractionSupporting

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	/**
	 * @since 14.0
	 */
	constructor(o: { barButtonSystemItem: UIBarButtonSystemItem; menu: UIMenu; });

	/**
	 * @since 14.0
	 */
	constructor(o: { barButtonSystemItem: UIBarButtonSystemItem; primaryAction: UIAction; });

	/**
	 * @since 16.0
	 */
	constructor(o: { barButtonSystemItem: UIBarButtonSystemItem; primaryAction: UIAction; menu: UIMenu; });

	constructor(o: { barButtonSystemItem: UIBarButtonSystemItem; target: any; action: string; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { customView: UIView; });

	/**
	 * @since 5.0
	 */
	constructor(o: { image: UIImage; landscapeImagePhone: UIImage; style: UIBarButtonItemStyle; target: any; action: string; });

	/**
	 * @since 14.0
	 */
	constructor(o: { image: UIImage; menu: UIMenu; });

	constructor(o: { image: UIImage; style: UIBarButtonItemStyle; target: any; action: string; });

	/**
	 * @since 14.0
	 */
	constructor(o: { primaryAction: UIAction; });

	/**
	 * @since 16.0
	 */
	constructor(o: { primaryAction: UIAction; menu: UIMenu; });

	/**
	 * @since 16.0
	 */
	constructor(o: { title: string; image: UIImage; target: any; action: string; menu: UIMenu; });

	/**
	 * @since 14.0
	 */
	constructor(o: { title: string; menu: UIMenu; });

	constructor(o: { title: string; style: UIBarButtonItemStyle; target: any; action: string; });

	/**
	 * @since 17.0
	 */
	addSymbolEffect(symbolEffect: NSSymbolEffect): void;

	/**
	 * @since 17.0
	 */
	addSymbolEffectOptions(symbolEffect: NSSymbolEffect, options: NSSymbolEffectOptions): void;

	/**
	 * @since 17.0
	 */
	addSymbolEffectOptionsAnimated(symbolEffect: NSSymbolEffect, options: NSSymbolEffectOptions, animated: boolean): void;

	/**
	 * @since 5.0
	 */
	backButtonBackgroundImageForStateBarMetrics(state: UIControlState, barMetrics: UIBarMetrics): UIImage;

	/**
	 * @since 5.0
	 */
	backButtonBackgroundVerticalPositionAdjustmentForBarMetrics(barMetrics: UIBarMetrics): number;

	/**
	 * @since 5.0
	 */
	backButtonTitlePositionAdjustmentForBarMetrics(barMetrics: UIBarMetrics): UIOffset;

	/**
	 * @since 5.0
	 */
	backgroundImageForStateBarMetrics(state: UIControlState, barMetrics: UIBarMetrics): UIImage;

	/**
	 * @since 6.0
	 */
	backgroundImageForStateStyleBarMetrics(state: UIControlState, style: UIBarButtonItemStyle, barMetrics: UIBarMetrics): UIImage;

	/**
	 * @since 5.0
	 */
	backgroundVerticalPositionAdjustmentForBarMetrics(barMetrics: UIBarMetrics): number;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 16.0
	 */
	creatingFixedGroup(): UIBarButtonItemGroup;

	/**
	 * @since 16.0
	 */
	creatingMovableGroupWithCustomizationIdentifier(customizationIdentifier: string): UIBarButtonItemGroup;

	/**
	 * @since 16.0
	 */
	creatingOptionalGroupWithCustomizationIdentifierInDefaultCustomization(customizationIdentifier: string, inDefaultCustomization: boolean): UIBarButtonItemGroup;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 17.0
	 */
	frameInView(referenceView: UIView): CGRect;

	/**
	 * @since 14.0
	 */
	initWithBarButtonSystemItemMenu(systemItem: UIBarButtonSystemItem, menu: UIMenu): this;

	/**
	 * @since 14.0
	 */
	initWithBarButtonSystemItemPrimaryAction(systemItem: UIBarButtonSystemItem, primaryAction: UIAction): this;

	/**
	 * @since 16.0
	 */
	initWithBarButtonSystemItemPrimaryActionMenu(systemItem: UIBarButtonSystemItem, primaryAction: UIAction, menu: UIMenu): this;

	initWithBarButtonSystemItemTargetAction(systemItem: UIBarButtonSystemItem, target: any, action: string): this;

	initWithCoder(coder: NSCoder): this;

	initWithCustomView(customView: UIView): this;

	/**
	 * @since 5.0
	 */
	initWithImageLandscapeImagePhoneStyleTargetAction(image: UIImage, landscapeImagePhone: UIImage, style: UIBarButtonItemStyle, target: any, action: string): this;

	/**
	 * @since 14.0
	 */
	initWithImageMenu(image: UIImage, menu: UIMenu): this;

	initWithImageStyleTargetAction(image: UIImage, style: UIBarButtonItemStyle, target: any, action: string): this;

	/**
	 * @since 14.0
	 */
	initWithPrimaryAction(primaryAction: UIAction): this;

	/**
	 * @since 16.0
	 */
	initWithPrimaryActionMenu(primaryAction: UIAction, menu: UIMenu): this;

	/**
	 * @since 16.0
	 */
	initWithTitleImageTargetActionMenu(title: string, image: UIImage, target: any, action: string, menu: UIMenu): this;

	/**
	 * @since 14.0
	 */
	initWithTitleMenu(title: string, menu: UIMenu): this;

	initWithTitleStyleTargetAction(title: string, style: UIBarButtonItemStyle, target: any, action: string): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	/**
	 * @since 17.0
	 */
	removeAllSymbolEffects(): void;

	/**
	 * @since 17.0
	 */
	removeAllSymbolEffectsWithOptions(options: NSSymbolEffectOptions): void;

	/**
	 * @since 17.0
	 */
	removeAllSymbolEffectsWithOptionsAnimated(options: NSSymbolEffectOptions, animated: boolean): void;

	/**
	 * @since 17.0
	 */
	removeSymbolEffectOfType(symbolEffect: NSSymbolEffect): void;

	/**
	 * @since 17.0
	 */
	removeSymbolEffectOfTypeOptions(symbolEffect: NSSymbolEffect, options: NSSymbolEffectOptions): void;

	/**
	 * @since 17.0
	 */
	removeSymbolEffectOfTypeOptionsAnimated(symbolEffect: NSSymbolEffect, options: NSSymbolEffectOptions, animated: boolean): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 5.0
	 */
	setBackButtonBackgroundImageForStateBarMetrics(backgroundImage: UIImage, state: UIControlState, barMetrics: UIBarMetrics): void;

	/**
	 * @since 5.0
	 */
	setBackButtonBackgroundVerticalPositionAdjustmentForBarMetrics(adjustment: number, barMetrics: UIBarMetrics): void;

	/**
	 * @since 5.0
	 */
	setBackButtonTitlePositionAdjustmentForBarMetrics(adjustment: UIOffset, barMetrics: UIBarMetrics): void;

	/**
	 * @since 5.0
	 */
	setBackgroundImageForStateBarMetrics(backgroundImage: UIImage, state: UIControlState, barMetrics: UIBarMetrics): void;

	/**
	 * @since 6.0
	 */
	setBackgroundImageForStateStyleBarMetrics(backgroundImage: UIImage, state: UIControlState, style: UIBarButtonItemStyle, barMetrics: UIBarMetrics): void;

	/**
	 * @since 5.0
	 */
	setBackgroundVerticalPositionAdjustmentForBarMetrics(adjustment: number, barMetrics: UIBarMetrics): void;

	/**
	 * @since 17.0
	 */
	setSymbolImageWithContentTransition(symbolImage: UIImage, transition: NSSymbolContentTransition): void;

	/**
	 * @since 17.0
	 */
	setSymbolImageWithContentTransitionOptions(symbolImage: UIImage, transition: NSSymbolContentTransition, options: NSSymbolEffectOptions): void;

	/**
	 * @since 5.0
	 */
	setTitlePositionAdjustmentForBarMetrics(adjustment: UIOffset, barMetrics: UIBarMetrics): void;

	/**
	 * @since 5.0
	 */
	titlePositionAdjustmentForBarMetrics(barMetrics: UIBarMetrics): UIOffset;
}

/**
 * @since 13.0
 */
declare class UIBarButtonItemAppearance extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UIBarButtonItemAppearance; // inherited from NSObject

	static new(): UIBarButtonItemAppearance; // inherited from NSObject

	readonly disabled: UIBarButtonItemStateAppearance;

	readonly focused: UIBarButtonItemStateAppearance;

	readonly highlighted: UIBarButtonItemStateAppearance;

	readonly normal: UIBarButtonItemStateAppearance;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { style: UIBarButtonItemStyle; });

	configureWithDefaultForStyle(style: UIBarButtonItemStyle): void;

	copy(): this;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithStyle(style: UIBarButtonItemStyle): this;
}

/**
 * @since 9.0
 */
declare class UIBarButtonItemGroup extends NSObject implements NSCoding {

	static alloc(): UIBarButtonItemGroup; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	static fixedGroupWithRepresentativeItemItems(representativeItem: UIBarButtonItem, items: NSArray<UIBarButtonItem> | UIBarButtonItem[]): UIBarButtonItemGroup;

	/**
	 * @since 16.0
	 */
	static movableGroupWithCustomizationIdentifierRepresentativeItemItems(customizationIdentifier: string, representativeItem: UIBarButtonItem, items: NSArray<UIBarButtonItem> | UIBarButtonItem[]): UIBarButtonItemGroup;

	static new(): UIBarButtonItemGroup; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	static optionalGroupWithCustomizationIdentifierInDefaultCustomizationRepresentativeItemItems(customizationIdentifier: string, inDefaultCustomization: boolean, representativeItem: UIBarButtonItem, items: NSArray<UIBarButtonItem> | UIBarButtonItem[]): UIBarButtonItemGroup;

	/**
	 * @since 16.0
	 */
	alwaysAvailable: boolean;

	barButtonItems: NSArray<UIBarButtonItem>;

	readonly displayingRepresentativeItem: boolean;

	/**
	 * @since 16.0
	 */
	hidden: boolean;

	/**
	 * @since 16.0
	 */
	menuRepresentation: UIMenuElement;

	representativeItem: UIBarButtonItem;

	constructor(o: { barButtonItems: NSArray<UIBarButtonItem> | UIBarButtonItem[]; representativeItem: UIBarButtonItem; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithBarButtonItemsRepresentativeItem(barButtonItems: NSArray<UIBarButtonItem> | UIBarButtonItem[], representativeItem: UIBarButtonItem): this;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.0
 */
declare class UIBarButtonItemStateAppearance extends NSObject {

	static alloc(): UIBarButtonItemStateAppearance; // inherited from NSObject

	static new(): UIBarButtonItemStateAppearance; // inherited from NSObject

	backgroundImage: UIImage;

	backgroundImagePositionAdjustment: UIOffset;

	titlePositionAdjustment: UIOffset;

	titleTextAttributes: NSDictionary<string, any>;
}

declare const enum UIBarButtonItemStyle {

	Plain = 0,

	Bordered = 1,

	Done = 2
}

declare const enum UIBarButtonSystemItem {

	Done = 0,

	Cancel = 1,

	Edit = 2,

	Save = 3,

	Add = 4,

	FlexibleSpace = 5,

	FixedSpace = 6,

	Compose = 7,

	Reply = 8,

	Action = 9,

	Organize = 10,

	Bookmarks = 11,

	Search = 12,

	Refresh = 13,

	Stop = 14,

	Camera = 15,

	Trash = 16,

	Play = 17,

	Pause = 18,

	Rewind = 19,

	FastForward = 20,

	Undo = 21,

	Redo = 22,

	PageCurl = 23,

	Close = 24
}

/**
 * @since 2.0
 */
declare class UIBarItem extends NSObject implements NSCoding, UIAccessibilityIdentification, UIAppearance {

	static alloc(): UIBarItem; // inherited from NSObject

	static appearance(): UIBarItem;

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIBarItem;

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIBarItem;

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIBarItem;

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIBarItem;

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIBarItem;

	static new(): UIBarItem; // inherited from NSObject

	enabled: boolean;

	image: UIImage;

	imageInsets: UIEdgeInsets;

	/**
	 * @since 5.0
	 */
	landscapeImagePhone: UIImage;

	/**
	 * @since 5.0
	 */
	landscapeImagePhoneInsets: UIEdgeInsets;

	/**
	 * @since 11.0
	 */
	largeContentSizeImage: UIImage;

	/**
	 * @since 11.0
	 */
	largeContentSizeImageInsets: UIEdgeInsets;

	tag: number;

	title: string;

	/**
	 * @since 5.0
	 */
	accessibilityIdentifier: string; // inherited from UIAccessibilityIdentification

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 5.0
	 */
	setTitleTextAttributesForState(attributes: NSDictionary<string, any>, state: UIControlState): void;

	/**
	 * @since 5.0
	 */
	titleTextAttributesForState(state: UIControlState): NSDictionary<string, any>;
}

declare const enum UIBarMetrics {

	Default = 0,

	Compact = 1,

	DefaultPrompt = 101,

	CompactPrompt = 102,

	LandscapePhone = 1,

	LandscapePhonePrompt = 102
}

/**
 * @since 7.0
 */
declare const enum UIBarPosition {

	Any = 0,

	Bottom = 1,

	Top = 2,

	TopAttached = 3
}

interface UIBarPositioning extends NSObjectProtocol {

	barPosition: UIBarPosition;
}
declare var UIBarPositioning: {

	prototype: UIBarPositioning;
};

interface UIBarPositioningDelegate extends NSObjectProtocol {

	positionForBar?(bar: UIBarPositioning): UIBarPosition;
}
declare var UIBarPositioningDelegate: {

	prototype: UIBarPositioningDelegate;
};

declare const enum UIBarStyle {

	Default = 0,

	Black = 1,

	BlackOpaque = 1,

	BlackTranslucent = 2
}

declare const enum UIBaselineAdjustment {

	AlignBaselines = 0,

	AlignCenters = 1,

	None = 2
}

declare const enum UIBehavioralStyle {

	Automatic = 0,

	Pad = 1,

	Mac = 2
}

/**
 * @since 3.2
 */
declare class UIBezierPath extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UIBezierPath; // inherited from NSObject

	static bezierPath(): UIBezierPath;

	static bezierPathWithArcCenterRadiusStartAngleEndAngleClockwise(center: CGPoint, radius: number, startAngle: number, endAngle: number, clockwise: boolean): UIBezierPath;

	static bezierPathWithCGPath(CGPath: any): UIBezierPath;

	static bezierPathWithOvalInRect(rect: CGRect): UIBezierPath;

	static bezierPathWithRect(rect: CGRect): UIBezierPath;

	static bezierPathWithRoundedRectByRoundingCornersCornerRadii(rect: CGRect, corners: UIRectCorner, cornerRadii: CGSize): UIBezierPath;

	static bezierPathWithRoundedRectCornerRadius(rect: CGRect, cornerRadius: number): UIBezierPath;

	static new(): UIBezierPath; // inherited from NSObject

	CGPath: any;

	readonly bounds: CGRect;

	readonly currentPoint: CGPoint;

	readonly empty: boolean;

	flatness: number;

	lineCapStyle: CGLineCap;

	lineJoinStyle: CGLineJoin;

	lineWidth: number;

	miterLimit: number;

	usesEvenOddFillRule: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 4.0
	 */
	addArcWithCenterRadiusStartAngleEndAngleClockwise(center: CGPoint, radius: number, startAngle: number, endAngle: number, clockwise: boolean): void;

	addClip(): void;

	addCurveToPointControlPoint1ControlPoint2(endPoint: CGPoint, controlPoint1: CGPoint, controlPoint2: CGPoint): void;

	addLineToPoint(point: CGPoint): void;

	addQuadCurveToPointControlPoint(endPoint: CGPoint, controlPoint: CGPoint): void;

	appendPath(bezierPath: UIBezierPath): void;

	applyTransform(transform: CGAffineTransform): void;

	/**
	 * @since 6.0
	 */
	bezierPathByReversingPath(): UIBezierPath;

	closePath(): void;

	containsPoint(point: CGPoint): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	fill(): void;

	fillWithBlendModeAlpha(blendMode: CGBlendMode, alpha: number): void;

	getLineDashCountPhase(pattern: interop.Pointer | interop.Reference<number>, count: interop.Pointer | interop.Reference<number>, phase: interop.Pointer | interop.Reference<number>): void;

	initWithCoder(coder: NSCoder): this;

	moveToPoint(point: CGPoint): void;

	removeAllPoints(): void;

	setLineDashCountPhase(pattern: interop.Pointer | interop.Reference<number>, count: number, phase: number): void;

	stroke(): void;

	strokeWithBlendModeAlpha(blendMode: CGBlendMode, alpha: number): void;
}

/**
 * @since 8.0
 */
declare class UIBlurEffect extends UIVisualEffect {

	static alloc(): UIBlurEffect; // inherited from NSObject

	static effectWithStyle(style: UIBlurEffectStyle): UIBlurEffect;

	static new(): UIBlurEffect; // inherited from NSObject
}

/**
 * @since 8.0
 */
declare const enum UIBlurEffectStyle {

	ExtraLight = 0,

	Light = 1,

	Dark = 2,

	ExtraDark = 3,

	Regular = 4,

	Prominent = 5,

	SystemUltraThinMaterial = 6,

	SystemThinMaterial = 7,

	SystemMaterial = 8,

	SystemThickMaterial = 9,

	SystemChromeMaterial = 10,

	SystemUltraThinMaterialLight = 11,

	SystemThinMaterialLight = 12,

	SystemMaterialLight = 13,

	SystemThickMaterialLight = 14,

	SystemChromeMaterialLight = 15,

	SystemUltraThinMaterialDark = 16,

	SystemThinMaterialDark = 17,

	SystemMaterialDark = 18,

	SystemThickMaterialDark = 19,

	SystemChromeMaterialDark = 20
}

/**
 * @since 2.0
 */
declare class UIButton extends UIControl implements NSCoding, UIAccessibilityContentSizeCategoryImageAdjusting, UISpringLoadedInteractionSupporting {

	static alloc(): UIButton; // inherited from NSObject

	static appearance(): UIButton; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIButton; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIButton; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIButton; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIButton; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIButton; // inherited from UIAppearance

	/**
	 * @since 15.0
	 */
	static buttonWithConfigurationPrimaryAction(configuration: UIButtonConfiguration, primaryAction: UIAction): UIButton;

	static buttonWithType(buttonType: UIButtonType): UIButton;

	/**
	 * @since 14.0
	 */
	static buttonWithTypePrimaryAction(buttonType: UIButtonType, primaryAction: UIAction): UIButton;

	static new(): UIButton; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static systemButtonWithImageTargetAction(image: UIImage, target: any, action: string): UIButton;

	/**
	 * @since 14.0
	 */
	static systemButtonWithPrimaryAction(primaryAction: UIAction): UIButton;

	/**
	 * @since 2.0
	 * @deprecated 15.0
	 */
	adjustsImageWhenDisabled: boolean;

	/**
	 * @since 2.0
	 * @deprecated 15.0
	 */
	adjustsImageWhenHighlighted: boolean;

	/**
	 * @since 15.0
	 */
	automaticallyUpdatesConfiguration: boolean;

	/**
	 * @since 15.0
	 */
	readonly behavioralStyle: UIBehavioralStyle;

	readonly buttonType: UIButtonType;

	/**
	 * @since 15.0
	 */
	changesSelectionAsPrimaryAction: boolean;

	/**
	 * @since 15.0
	 */
	configuration: UIButtonConfiguration;

	/**
	 * @since 15.0
	 */
	configurationUpdateHandler: (p1: UIButton) => void;

	/**
	 * @since 2.0
	 * @deprecated 15.0
	 */
	contentEdgeInsets: UIEdgeInsets;

	/**
	 * @since 6.0
	 */
	readonly currentAttributedTitle: NSAttributedString;

	readonly currentBackgroundImage: UIImage;

	readonly currentImage: UIImage;

	/**
	 * @since 13.0
	 */
	readonly currentPreferredSymbolConfiguration: UIImageSymbolConfiguration;

	readonly currentTitle: string;

	readonly currentTitleColor: UIColor;

	readonly currentTitleShadowColor: UIColor;

	/**
	 * @since 2.0
	 * @deprecated 3.0
	 */
	font: UIFont;

	/**
	 * @since 15.0
	 */
	readonly held: boolean;

	/**
	 * @since 15.0
	 */
	readonly hovered: boolean;

	/**
	 * @since 2.0
	 * @deprecated 15.0
	 */
	imageEdgeInsets: UIEdgeInsets;

	/**
	 * @since 3.0
	 */
	readonly imageView: UIImageView;

	/**
	 * @since 2.0
	 * @deprecated 3.0
	 */
	lineBreakMode: NSLineBreakMode;

	/**
	 * @since 14.0
	 */
	menu: UIMenu;

	/**
	 * @since 13.4
	 */
	pointerInteractionEnabled: boolean;

	/**
	 * @since 13.4
	 */
	pointerStyleProvider: (p1: UIButton, p2: UIPointerEffect, p3: UIPointerShape) => UIPointerStyle;

	/**
	 * @since 15.0
	 */
	preferredBehavioralStyle: UIBehavioralStyle;

	/**
	 * @since 16.0
	 */
	preferredMenuElementOrder: UIContextMenuConfigurationElementOrder;

	/**
	 * @since 2.0
	 * @deprecated 15.0
	 */
	reversesTitleShadowWhenHighlighted: boolean;

	/**
	 * @since 14.0
	 */
	role: UIButtonRole;

	/**
	 * @since 2.0
	 * @deprecated 15.0
	 */
	showsTouchWhenHighlighted: boolean;

	/**
	 * @since 15.0
	 */
	readonly subtitleLabel: UILabel;

	/**
	 * @since 2.0
	 * @deprecated 15.0
	 */
	titleEdgeInsets: UIEdgeInsets;

	/**
	 * @since 3.0
	 */
	readonly titleLabel: UILabel;

	/**
	 * @since 2.0
	 * @deprecated 3.0
	 */
	titleShadowOffset: CGSize;

	adjustsImageSizeForAccessibilityContentSizeCategory: boolean; // inherited from UIAccessibilityContentSizeCategoryImageAdjusting

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	springLoaded: boolean; // inherited from UISpringLoadedInteractionSupporting

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 6.0
	 */
	attributedTitleForState(state: UIControlState): NSAttributedString;

	backgroundImageForState(state: UIControlState): UIImage;

	/**
	 * @since 2.0
	 * @deprecated 15.0
	 */
	backgroundRectForBounds(bounds: CGRect): CGRect;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 2.0
	 * @deprecated 15.0
	 */
	contentRectForBounds(bounds: CGRect): CGRect;

	encodeWithCoder(coder: NSCoder): void;

	imageForState(state: UIControlState): UIImage;

	/**
	 * @since 2.0
	 * @deprecated 15.0
	 */
	imageRectForContentRect(contentRect: CGRect): CGRect;

	initWithCoder(coder: NSCoder): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	/**
	 * @since 13.0
	 */
	preferredSymbolConfigurationForImageInState(state: UIControlState): UIImageSymbolConfiguration;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 6.0
	 */
	setAttributedTitleForState(title: NSAttributedString, state: UIControlState): void;

	setBackgroundImageForState(image: UIImage, state: UIControlState): void;

	setImageForState(image: UIImage, state: UIControlState): void;

	/**
	 * @since 15.0
	 */
	setNeedsUpdateConfiguration(): void;

	/**
	 * @since 13.0
	 */
	setPreferredSymbolConfigurationForImageInState(configuration: UIImageSymbolConfiguration, state: UIControlState): void;

	setTitleColorForState(color: UIColor, state: UIControlState): void;

	setTitleForState(title: string, state: UIControlState): void;

	setTitleShadowColorForState(color: UIColor, state: UIControlState): void;

	titleColorForState(state: UIControlState): UIColor;

	titleForState(state: UIControlState): string;

	/**
	 * @since 2.0
	 * @deprecated 15.0
	 */
	titleRectForContentRect(contentRect: CGRect): CGRect;

	titleShadowColorForState(state: UIControlState): UIColor;

	/**
	 * @since 15.0
	 */
	updateConfiguration(): void;
}

/**
 * @since 15.0
 */
declare class UIButtonConfiguration extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UIButtonConfiguration; // inherited from NSObject

	static borderedButtonConfiguration(): UIButtonConfiguration;

	static borderedProminentButtonConfiguration(): UIButtonConfiguration;

	static borderedTintedButtonConfiguration(): UIButtonConfiguration;

	static borderlessButtonConfiguration(): UIButtonConfiguration;

	static filledButtonConfiguration(): UIButtonConfiguration;

	static grayButtonConfiguration(): UIButtonConfiguration;

	static new(): UIButtonConfiguration; // inherited from NSObject

	static plainButtonConfiguration(): UIButtonConfiguration;

	static tintedButtonConfiguration(): UIButtonConfiguration;

	activityIndicatorColorTransformer: (p1: UIColor) => UIColor;

	attributedSubtitle: NSAttributedString;

	attributedTitle: NSAttributedString;

	automaticallyUpdateForSelection: boolean;

	background: UIBackgroundConfiguration;

	baseBackgroundColor: UIColor;

	baseForegroundColor: UIColor;

	buttonSize: UIButtonConfigurationSize;

	contentInsets: NSDirectionalEdgeInsets;

	cornerStyle: UIButtonConfigurationCornerStyle;

	image: UIImage;

	imageColorTransformer: (p1: UIColor) => UIColor;

	imagePadding: number;

	imagePlacement: NSDirectionalRectEdge;

	/**
	 * @since 16.0
	 */
	indicator: UIButtonConfigurationIndicator;

	/**
	 * @since 16.0
	 */
	indicatorColorTransformer: (p1: UIColor) => UIColor;

	macIdiomStyle: UIButtonConfigurationMacIdiomStyle;

	preferredSymbolConfigurationForImage: UIImageSymbolConfiguration;

	showsActivityIndicator: boolean;

	subtitle: string;

	subtitleLineBreakMode: NSLineBreakMode;

	subtitleTextAttributesTransformer: (p1: NSDictionary<string, any>) => NSDictionary<string, any>;

	title: string;

	titleAlignment: UIButtonConfigurationTitleAlignment;

	titleLineBreakMode: NSLineBreakMode;

	titlePadding: number;

	titleTextAttributesTransformer: (p1: NSDictionary<string, any>) => NSDictionary<string, any>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	setDefaultContentInsets(): void;

	updatedConfigurationForButton(button: UIButton): this;
}

/**
 * @since 15.0
 */
declare const enum UIButtonConfigurationCornerStyle {

	Fixed = -1,

	Dynamic = 0,

	Small = 1,

	Medium = 2,

	Large = 3,

	Capsule = 4
}

/**
 * @since 16.0
 */
declare const enum UIButtonConfigurationIndicator {

	Automatic = 0,

	None = 1,

	Popup = 2
}

/**
 * @since 15.0
 */
declare const enum UIButtonConfigurationMacIdiomStyle {

	Automatic = 0,

	Bordered = 1,

	Borderless = 2,

	BorderlessTinted = 3
}

/**
 * @since 15.0
 */
declare const enum UIButtonConfigurationSize {

	Medium = 0,

	Small = 1,

	Mini = 2,

	Large = 3
}

/**
 * @since 15.0
 */
declare const enum UIButtonConfigurationTitleAlignment {

	Automatic = 0,

	Leading = 1,

	Center = 2,

	Trailing = 3
}

/**
 * @since 14.0
 */
declare const enum UIButtonRole {

	Normal = 0,

	Primary = 1,

	Cancel = 2,

	Destructive = 3
}

declare const enum UIButtonType {

	Custom = 0,

	System = 1,

	DetailDisclosure = 2,

	InfoLight = 3,

	InfoDark = 4,

	ContactAdd = 5,

	Plain = 6,

	Close = 7,

	RoundedRect = 1
}

/**
 * @since 17.0
 */
interface UICGFloatTraitDefinition extends UITraitDefinition {
}
declare var UICGFloatTraitDefinition: {

	prototype: UICGFloatTraitDefinition;
};

/**
 * @since 16.0
 */
declare class UICalendarSelection extends NSObject {

	static alloc(): UICalendarSelection; // inherited from NSObject

	static new(): UICalendarSelection; // inherited from NSObject

	updateSelectableDates(): void;
}

/**
 * @since 16.0
 */
declare class UICalendarSelectionMultiDate extends UICalendarSelection {

	static alloc(): UICalendarSelectionMultiDate; // inherited from NSObject

	static new(): UICalendarSelectionMultiDate; // inherited from NSObject

	readonly delegate: UICalendarSelectionMultiDateDelegate;

	selectedDates: NSArray<NSDateComponents>;

	constructor(o: { delegate: UICalendarSelectionMultiDateDelegate; });

	initWithDelegate(delegate: UICalendarSelectionMultiDateDelegate): this;

	setSelectedDatesAnimated(selectedDates: NSArray<NSDateComponents> | NSDateComponents[], animated: boolean): void;
}

/**
 * @since 16.0
 */
interface UICalendarSelectionMultiDateDelegate extends NSObjectProtocol {

	multiDateSelectionCanDeselectDate?(selection: UICalendarSelectionMultiDate, dateComponents: NSDateComponents): boolean;

	multiDateSelectionCanSelectDate?(selection: UICalendarSelectionMultiDate, dateComponents: NSDateComponents): boolean;

	multiDateSelectionDidDeselectDate(selection: UICalendarSelectionMultiDate, dateComponents: NSDateComponents): void;

	multiDateSelectionDidSelectDate(selection: UICalendarSelectionMultiDate, dateComponents: NSDateComponents): void;
}
declare var UICalendarSelectionMultiDateDelegate: {

	prototype: UICalendarSelectionMultiDateDelegate;
};

/**
 * @since 16.0
 */
declare class UICalendarSelectionSingleDate extends UICalendarSelection {

	static alloc(): UICalendarSelectionSingleDate; // inherited from NSObject

	static new(): UICalendarSelectionSingleDate; // inherited from NSObject

	readonly delegate: UICalendarSelectionSingleDateDelegate;

	selectedDate: NSDateComponents;

	constructor(o: { delegate: UICalendarSelectionSingleDateDelegate; });

	initWithDelegate(delegate: UICalendarSelectionSingleDateDelegate): this;

	setSelectedDateAnimated(selectedDate: NSDateComponents, animated: boolean): void;
}

/**
 * @since 16.0
 */
interface UICalendarSelectionSingleDateDelegate extends NSObjectProtocol {

	dateSelectionCanSelectDate?(selection: UICalendarSelectionSingleDate, dateComponents: NSDateComponents): boolean;

	dateSelectionDidSelectDate(selection: UICalendarSelectionSingleDate, dateComponents: NSDateComponents): void;
}
declare var UICalendarSelectionSingleDateDelegate: {

	prototype: UICalendarSelectionSingleDateDelegate;
};

/**
 * @since 18.0
 */
declare class UICalendarSelectionWeekOfYear extends UICalendarSelection {

	static alloc(): UICalendarSelectionWeekOfYear; // inherited from NSObject

	static new(): UICalendarSelectionWeekOfYear; // inherited from NSObject

	readonly delegate: UICalendarSelectionWeekOfYearDelegate;

	selectedWeekOfYear: NSDateComponents;

	constructor(o: { delegate: UICalendarSelectionWeekOfYearDelegate; });

	initWithDelegate(delegate: UICalendarSelectionWeekOfYearDelegate): this;

	setSelectedWeekOfYearAnimated(selectedWeekOfYear: NSDateComponents, animated: boolean): void;
}

/**
 * @since 18.0
 */
interface UICalendarSelectionWeekOfYearDelegate extends NSObjectProtocol {

	weekOfYearSelectionCanSelectWeekOfYear?(selection: UICalendarSelectionWeekOfYear, weekOfYearComponents: NSDateComponents): boolean;

	weekOfYearSelectionDidSelectWeekOfYear(selection: UICalendarSelectionWeekOfYear, weekOfYearComponents: NSDateComponents): void;
}
declare var UICalendarSelectionWeekOfYearDelegate: {

	prototype: UICalendarSelectionWeekOfYearDelegate;
};

/**
 * @since 16.0
 */
declare class UICalendarView extends UIView {

	static alloc(): UICalendarView; // inherited from NSObject

	static appearance(): UICalendarView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UICalendarView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UICalendarView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UICalendarView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UICalendarView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UICalendarView; // inherited from UIAppearance

	static new(): UICalendarView; // inherited from NSObject

	availableDateRange: NSDateInterval;

	calendar: NSCalendar;

	delegate: UICalendarViewDelegate;

	fontDesign: string;

	locale: NSLocale;

	selectionBehavior: UICalendarSelection;

	timeZone: NSTimeZone;

	visibleDateComponents: NSDateComponents;

	wantsDateDecorations: boolean;

	reloadDecorationsForDateComponentsAnimated(dates: NSArray<NSDateComponents> | NSDateComponents[], animated: boolean): void;

	setVisibleDateComponentsAnimated(dateComponents: NSDateComponents, animated: boolean): void;
}

/**
 * @since 16.0
 */
declare class UICalendarViewDecoration extends NSObject {

	static alloc(): UICalendarViewDecoration; // inherited from NSObject

	static decorationWithColorSize(color: UIColor, size: UICalendarViewDecorationSize): UICalendarViewDecoration;

	static decorationWithCustomViewProvider(customViewProvider: () => UIView): UICalendarViewDecoration;

	static decorationWithImage(image: UIImage): UICalendarViewDecoration;

	static decorationWithImageColorSize(image: UIImage, color: UIColor, size: UICalendarViewDecorationSize): UICalendarViewDecoration;

	static new(): UICalendarViewDecoration; // inherited from NSObject

	constructor(o: { customViewProvider: () => UIView; });

	constructor(o: { image: UIImage; color: UIColor; size: UICalendarViewDecorationSize; });

	initWithCustomViewProvider(customViewProvider: () => UIView): this;

	initWithImageColorSize(image: UIImage, color: UIColor, size: UICalendarViewDecorationSize): this;
}

/**
 * @since 16.0
 */
declare const enum UICalendarViewDecorationSize {

	Small = 0,

	Medium = 1,

	Large = 2
}

/**
 * @since 16.0
 */
interface UICalendarViewDelegate extends NSObjectProtocol {

	calendarViewDecorationForDateComponents?(calendarView: UICalendarView, dateComponents: NSDateComponents): UICalendarViewDecoration;

	/**
	 * @since 16.2
	 */
	calendarViewDidChangeVisibleDateComponentsFrom?(calendarView: UICalendarView, previousDateComponents: NSDateComponents): void;
}
declare var UICalendarViewDelegate: {

	prototype: UICalendarViewDelegate;
};

/**
 * @since 17.5
 */
declare class UICanvasFeedbackGenerator extends UIFeedbackGenerator {

	static alloc(): UICanvasFeedbackGenerator; // inherited from NSObject

	/**
	 * @since 17.5
	 */
	static feedbackGeneratorForView(view: UIView): UICanvasFeedbackGenerator; // inherited from UIFeedbackGenerator

	static new(): UICanvasFeedbackGenerator; // inherited from NSObject

	alignmentOccurredAtLocation(location: CGPoint): void;

	pathCompletedAtLocation(location: CGPoint): void;
}

/**
 * @since 14.0
 */
declare class UICellAccessory extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UICellAccessory; // inherited from NSObject

	static new(): UICellAccessory; // inherited from NSObject

	displayedState: UICellAccessoryDisplayedState;

	hidden: boolean;

	reservedLayoutWidth: number;

	tintColor: UIColor;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 14.0
 */
declare class UICellAccessoryCheckmark extends UICellAccessory {

	static alloc(): UICellAccessoryCheckmark; // inherited from NSObject

	static new(): UICellAccessoryCheckmark; // inherited from NSObject
}

/**
 * @since 14.0
 */
declare class UICellAccessoryCustomView extends UICellAccessory {

	static alloc(): UICellAccessoryCustomView; // inherited from NSObject

	static new(): UICellAccessoryCustomView; // inherited from NSObject

	readonly customView: UIView;

	maintainsFixedSize: boolean;

	readonly placement: UICellAccessoryPlacement;

	position: (p1: NSArray<UICellAccessory>) => number;

	constructor(o: { customView: UIView; placement: UICellAccessoryPlacement; });

	initWithCustomViewPlacement(customView: UIView, placement: UICellAccessoryPlacement): this;
}

/**
 * @since 14.0
 */
declare class UICellAccessoryDelete extends UICellAccessory {

	static alloc(): UICellAccessoryDelete; // inherited from NSObject

	static new(): UICellAccessoryDelete; // inherited from NSObject

	actionHandler: () => void;

	backgroundColor: UIColor;
}

/**
 * @since 15.4
 */
declare class UICellAccessoryDetail extends UICellAccessory {

	static alloc(): UICellAccessoryDetail; // inherited from NSObject

	static new(): UICellAccessoryDetail; // inherited from NSObject

	actionHandler: () => void;
}

/**
 * @since 14.0
 */
declare class UICellAccessoryDisclosureIndicator extends UICellAccessory {

	static alloc(): UICellAccessoryDisclosureIndicator; // inherited from NSObject

	static new(): UICellAccessoryDisclosureIndicator; // inherited from NSObject
}

/**
 * @since 14.0
 */
declare const enum UICellAccessoryDisplayedState {

	Always = 0,

	WhenEditing = 1,

	WhenNotEditing = 2
}

/**
 * @since 14.0
 */
declare class UICellAccessoryInsert extends UICellAccessory {

	static alloc(): UICellAccessoryInsert; // inherited from NSObject

	static new(): UICellAccessoryInsert; // inherited from NSObject

	actionHandler: () => void;

	backgroundColor: UIColor;
}

/**
 * @since 14.0
 */
declare class UICellAccessoryLabel extends UICellAccessory {

	static alloc(): UICellAccessoryLabel; // inherited from NSObject

	static new(): UICellAccessoryLabel; // inherited from NSObject

	adjustsFontForContentSizeCategory: boolean;

	font: UIFont;

	readonly text: string;

	constructor(o: { text: string; });

	initWithText(text: string): this;
}

/**
 * @since 14.0
 */
declare class UICellAccessoryMultiselect extends UICellAccessory {

	static alloc(): UICellAccessoryMultiselect; // inherited from NSObject

	static new(): UICellAccessoryMultiselect; // inherited from NSObject

	backgroundColor: UIColor;
}

/**
 * @since 14.0
 */
declare class UICellAccessoryOutlineDisclosure extends UICellAccessory {

	static alloc(): UICellAccessoryOutlineDisclosure; // inherited from NSObject

	static new(): UICellAccessoryOutlineDisclosure; // inherited from NSObject

	actionHandler: () => void;

	style: UICellAccessoryOutlineDisclosureStyle;
}

/**
 * @since 14.0
 */
declare const enum UICellAccessoryOutlineDisclosureStyle {

	Automatic = 0,

	Header = 1,

	Cell = 2
}

/**
 * @since 14.0
 */
declare const enum UICellAccessoryPlacement {

	Leading = 0,

	Trailing = 1
}

/**
 * @since 16.0
 */
declare class UICellAccessoryPopUpMenu extends UICellAccessory {

	static alloc(): UICellAccessoryPopUpMenu; // inherited from NSObject

	static new(): UICellAccessoryPopUpMenu; // inherited from NSObject

	readonly menu: UIMenu;

	selectedElementDidChangeHandler: (p1: UIMenu) => void;

	constructor(o: { menu: UIMenu; });

	initWithMenu(menu: UIMenu): this;
}

/**
 * @since 14.0
 */
declare function UICellAccessoryPositionAfterAccessoryOfClass(accessoryClass: typeof NSObject): (p1: NSArray<UICellAccessory>) => number;

/**
 * @since 14.0
 */
declare function UICellAccessoryPositionBeforeAccessoryOfClass(accessoryClass: typeof NSObject): (p1: NSArray<UICellAccessory>) => number;

/**
 * @since 14.0
 */
declare class UICellAccessoryReorder extends UICellAccessory {

	static alloc(): UICellAccessoryReorder; // inherited from NSObject

	static new(): UICellAccessoryReorder; // inherited from NSObject

	showsVerticalSeparator: boolean;
}

/**
 * @since 14.0
 */
declare var UICellAccessoryStandardDimension: number;

/**
 * @since 14.0
 */
declare const enum UICellConfigurationDragState {

	None = 0,

	Lifting = 1,

	Dragging = 2
}

/**
 * @since 14.0
 */
declare const enum UICellConfigurationDropState {

	None = 0,

	NotTargeted = 1,

	Targeted = 2
}

/**
 * @since 14.0
 */
declare class UICellConfigurationState extends UIViewConfigurationState {

	static alloc(): UICellConfigurationState; // inherited from NSObject

	static new(): UICellConfigurationState; // inherited from NSObject

	cellDragState: UICellConfigurationDragState;

	cellDropState: UICellConfigurationDropState;

	editing: boolean;

	expanded: boolean;

	reordering: boolean;

	swiped: boolean;
}

/**
 * @since 10.0
 */
declare class UICloudSharingController extends UIViewController {

	static alloc(): UICloudSharingController; // inherited from NSObject

	static new(): UICloudSharingController; // inherited from NSObject

	availablePermissions: UICloudSharingPermissionOptions;

	delegate: UICloudSharingControllerDelegate;

	readonly share: CKShare;

	/**
	 * @since 10.0
	 * @deprecated 17.0
	 */
	constructor(o: { preparationHandler: (p1: UICloudSharingController, p2: (p1: CKShare, p2: CKContainer, p3: NSError) => void) => void; });

	constructor(o: { share: CKShare; container: CKContainer; });

	activityItemSource(): UIActivityItemSource;

	/**
	 * @since 10.0
	 * @deprecated 17.0
	 */
	initWithPreparationHandler(preparationHandler: (p1: UICloudSharingController, p2: (p1: CKShare, p2: CKContainer, p3: NSError) => void) => void): this;

	initWithShareContainer(share: CKShare, container: CKContainer): this;
}

interface UICloudSharingControllerDelegate extends NSObjectProtocol {

	cloudSharingControllerDidSaveShare?(csc: UICloudSharingController): void;

	cloudSharingControllerDidStopSharing?(csc: UICloudSharingController): void;

	cloudSharingControllerFailedToSaveShareWithError(csc: UICloudSharingController, error: NSError): void;

	itemThumbnailDataForCloudSharingController?(csc: UICloudSharingController): NSData;

	itemTitleForCloudSharingController(csc: UICloudSharingController): string;

	itemTypeForCloudSharingController?(csc: UICloudSharingController): string;
}
declare var UICloudSharingControllerDelegate: {

	prototype: UICloudSharingControllerDelegate;
};

/**
 * @since 10.0
 */
declare const enum UICloudSharingPermissionOptions {

	Standard = 0,

	AllowPublic = 1,

	AllowPrivate = 2,

	AllowReadOnly = 4,

	AllowReadWrite = 8
}

declare const enum UICollectionElementCategory {

	Cell = 0,

	SupplementaryView = 1,

	DecorationView = 2
}

/**
 * @since 6.0
 */
declare var UICollectionElementKindSectionFooter: string;

/**
 * @since 6.0
 */
declare var UICollectionElementKindSectionHeader: string;

/**
 * @since 14.0
 */
declare const enum UICollectionLayoutListAppearance {

	Plain = 0,

	Grouped = 1,

	InsetGrouped = 2,

	Sidebar = 3,

	SidebarPlain = 4
}

/**
 * @since 14.0
 */
declare class UICollectionLayoutListConfiguration extends NSObject implements NSCopying {

	static alloc(): UICollectionLayoutListConfiguration; // inherited from NSObject

	static new(): UICollectionLayoutListConfiguration; // inherited from NSObject

	readonly appearance: UICollectionLayoutListAppearance;

	backgroundColor: UIColor;

	/**
	 * @since 18.0
	 */
	contentHuggingElements: UICollectionLayoutListContentHuggingElements;

	footerMode: UICollectionLayoutListFooterMode;

	headerMode: UICollectionLayoutListHeaderMode;

	/**
	 * @since 15.0
	 */
	headerTopPadding: number;

	/**
	 * @since 14.5
	 */
	itemSeparatorHandler: (p1: NSIndexPath, p2: UIListSeparatorConfiguration) => UIListSeparatorConfiguration;

	leadingSwipeActionsConfigurationProvider: (p1: NSIndexPath) => UISwipeActionsConfiguration;

	/**
	 * @since 14.5
	 */
	separatorConfiguration: UIListSeparatorConfiguration;

	showsSeparators: boolean;

	trailingSwipeActionsConfigurationProvider: (p1: NSIndexPath) => UISwipeActionsConfiguration;

	constructor(o: { appearance: UICollectionLayoutListAppearance; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithAppearance(appearance: UICollectionLayoutListAppearance): this;
}

/**
 * @since 18.0
 */
declare const enum UICollectionLayoutListContentHuggingElements {

	None = 0,

	SupplementaryHeader = 1
}

/**
 * @since 14.0
 */
declare const enum UICollectionLayoutListFooterMode {

	None = 0,

	Supplementary = 1
}

/**
 * @since 14.0
 */
declare const enum UICollectionLayoutListHeaderMode {

	None = 0,

	Supplementary = 1,

	FirstItemInSection = 2
}

/**
 * @since 13.0
 */
declare const enum UICollectionLayoutSectionOrthogonalScrollingBehavior {

	None = 0,

	Continuous = 1,

	ContinuousGroupLeadingBoundary = 2,

	Paging = 3,

	GroupPaging = 4,

	GroupPagingCentered = 5
}

/**
 * @since 17.0
 */
declare const enum UICollectionLayoutSectionOrthogonalScrollingBounce {

	Automatic = 0,

	Always = 1,

	Never = 2
}

/**
 * @since 17.0
 */
declare var UICollectionLayoutSectionOrthogonalScrollingDecelerationRateAutomatic: number;

/**
 * @since 17.0
 */
declare var UICollectionLayoutSectionOrthogonalScrollingDecelerationRateFast: number;

/**
 * @since 17.0
 */
declare var UICollectionLayoutSectionOrthogonalScrollingDecelerationRateNormal: number;

/**
 * @since 17.0
 */
declare class UICollectionLayoutSectionOrthogonalScrollingProperties extends NSObject implements NSCopying {

	static alloc(): UICollectionLayoutSectionOrthogonalScrollingProperties; // inherited from NSObject

	static new(): UICollectionLayoutSectionOrthogonalScrollingProperties; // inherited from NSObject

	bounce: UICollectionLayoutSectionOrthogonalScrollingBounce;

	decelerationRate: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 6.0
 */
declare class UICollectionReusableView extends UIView {

	static alloc(): UICollectionReusableView; // inherited from NSObject

	static appearance(): UICollectionReusableView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UICollectionReusableView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UICollectionReusableView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UICollectionReusableView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UICollectionReusableView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UICollectionReusableView; // inherited from UIAppearance

	static new(): UICollectionReusableView; // inherited from NSObject

	readonly reuseIdentifier: string;

	applyLayoutAttributes(layoutAttributes: UICollectionViewLayoutAttributes): void;

	didTransitionFromLayoutToLayout(oldLayout: UICollectionViewLayout, newLayout: UICollectionViewLayout): void;

	/**
	 * @since 8.0
	 */
	preferredLayoutAttributesFittingAttributes(layoutAttributes: UICollectionViewLayoutAttributes): UICollectionViewLayoutAttributes;

	prepareForReuse(): void;

	willTransitionFromLayoutToLayout(oldLayout: UICollectionViewLayout, newLayout: UICollectionViewLayout): void;
}

declare const enum UICollectionUpdateAction {

	Insert = 0,

	Delete = 1,

	Reload = 2,

	Move = 3,

	None = 4
}

/**
 * @since 6.0
 */
declare class UICollectionView extends UIScrollView implements UIDataSourceTranslating, UISpringLoadedInteractionSupporting {

	static alloc(): UICollectionView; // inherited from NSObject

	static appearance(): UICollectionView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UICollectionView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UICollectionView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UICollectionView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UICollectionView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UICollectionView; // inherited from UIAppearance

	static new(): UICollectionView; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	allowsFocus: boolean;

	/**
	 * @since 15.0
	 */
	allowsFocusDuringEditing: boolean;

	allowsMultipleSelection: boolean;

	/**
	 * @since 14.0
	 */
	allowsMultipleSelectionDuringEditing: boolean;

	allowsSelection: boolean;

	/**
	 * @since 14.0
	 */
	allowsSelectionDuringEditing: boolean;

	backgroundView: UIView;

	collectionViewLayout: UICollectionViewLayout;

	/**
	 * @since 13.2
	 */
	readonly contextMenuInteraction: UIContextMenuInteraction;

	dataSource: UICollectionViewDataSource;

	delegate: UICollectionViewDelegate;

	/**
	 * @since 11.0
	 */
	dragDelegate: UICollectionViewDragDelegate;

	/**
	 * @since 11.0
	 */
	dragInteractionEnabled: boolean;

	/**
	 * @since 11.0
	 */
	dropDelegate: UICollectionViewDropDelegate;

	/**
	 * @since 14.0
	 */
	editing: boolean;

	/**
	 * @since 11.0
	 */
	readonly hasActiveDrag: boolean;

	/**
	 * @since 11.0
	 */
	readonly hasActiveDrop: boolean;

	/**
	 * @since 11.0
	 */
	readonly hasUncommittedUpdates: boolean;

	readonly indexPathsForSelectedItems: NSArray<NSIndexPath>;

	readonly indexPathsForVisibleItems: NSArray<NSIndexPath>;

	readonly numberOfSections: number;

	/**
	 * @since 10.0
	 */
	prefetchDataSource: UICollectionViewDataSourcePrefetching;

	/**
	 * @since 10.0
	 */
	prefetchingEnabled: boolean;

	/**
	 * @since 9.0
	 */
	remembersLastFocusedIndexPath: boolean;

	/**
	 * @since 11.0
	 */
	reorderingCadence: UICollectionViewReorderingCadence;

	/**
	 * @since 14.0
	 */
	selectionFollowsFocus: boolean;

	/**
	 * @since 16.0
	 */
	selfSizingInvalidation: UICollectionViewSelfSizingInvalidation;

	readonly visibleCells: NSArray<UICollectionViewCell>;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	springLoaded: boolean; // inherited from UISpringLoadedInteractionSupporting

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { frame: CGRect; collectionViewLayout: UICollectionViewLayout; });

	/**
	 * @since 9.0
	 */
	beginInteractiveMovementForItemAtIndexPath(indexPath: NSIndexPath): boolean;

	/**
	 * @since 9.0
	 */
	cancelInteractiveMovement(): void;

	/**
	 * @since 7.0
	 */
	cancelInteractiveTransition(): void;

	cellForItemAtIndexPath(indexPath: NSIndexPath): UICollectionViewCell;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	dataSourceIndexPathForPresentationIndexPath(presentationIndexPath: NSIndexPath): NSIndexPath;

	dataSourceSectionIndexForPresentationSectionIndex(presentationSectionIndex: number): number;

	deleteItemsAtIndexPaths(indexPaths: NSArray<NSIndexPath> | NSIndexPath[]): void;

	deleteSections(sections: NSIndexSet): void;

	/**
	 * @since 14.0
	 */
	dequeueConfiguredReusableCellWithRegistrationForIndexPathItem(registration: UICollectionViewCellRegistration, indexPath: NSIndexPath, item: any): UICollectionViewCell;

	/**
	 * @since 14.0
	 */
	dequeueConfiguredReusableSupplementaryViewWithRegistrationForIndexPath(registration: UICollectionViewSupplementaryRegistration, indexPath: NSIndexPath): UICollectionReusableView;

	dequeueReusableCellWithReuseIdentifierForIndexPath(identifier: string, indexPath: NSIndexPath): UICollectionViewCell;

	dequeueReusableSupplementaryViewOfKindWithReuseIdentifierForIndexPath(elementKind: string, identifier: string, indexPath: NSIndexPath): UICollectionReusableView;

	deselectItemAtIndexPathAnimated(indexPath: NSIndexPath, animated: boolean): void;

	/**
	 * @since 9.0
	 */
	endInteractiveMovement(): void;

	/**
	 * @since 7.0
	 */
	finishInteractiveTransition(): void;

	indexPathForCell(cell: UICollectionViewCell): NSIndexPath;

	indexPathForItemAtPoint(point: CGPoint): NSIndexPath;

	indexPathForSupplementaryView(supplementaryView: UICollectionReusableView): NSIndexPath;

	/**
	 * @since 9.0
	 */
	indexPathsForVisibleSupplementaryElementsOfKind(elementKind: string): NSArray<NSIndexPath>;

	initWithFrameCollectionViewLayout(frame: CGRect, layout: UICollectionViewLayout): this;

	insertItemsAtIndexPaths(indexPaths: NSArray<NSIndexPath> | NSIndexPath[]): void;

	insertSections(sections: NSIndexSet): void;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	layoutAttributesForItemAtIndexPath(indexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	layoutAttributesForSupplementaryElementOfKindAtIndexPath(kind: string, indexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	moveItemAtIndexPathToIndexPath(indexPath: NSIndexPath, newIndexPath: NSIndexPath): void;

	moveSectionToSection(section: number, newSection: number): void;

	numberOfItemsInSection(section: number): number;

	performBatchUpdatesCompletion(updates: () => void, completion: (p1: boolean) => void): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	performUsingPresentationValues(actionsToTranslate: () => void): void;

	presentationIndexPathForDataSourceIndexPath(dataSourceIndexPath: NSIndexPath): NSIndexPath;

	presentationSectionIndexForDataSourceSectionIndex(dataSourceSectionIndex: number): number;

	/**
	 * @since 15.0
	 */
	reconfigureItemsAtIndexPaths(indexPaths: NSArray<NSIndexPath> | NSIndexPath[]): void;

	registerClassForCellWithReuseIdentifier(cellClass: typeof NSObject, identifier: string): void;

	registerClassForSupplementaryViewOfKindWithReuseIdentifier(viewClass: typeof NSObject, elementKind: string, identifier: string): void;

	registerNibForCellWithReuseIdentifier(nib: UINib, identifier: string): void;

	registerNibForSupplementaryViewOfKindWithReuseIdentifier(nib: UINib, kind: string, identifier: string): void;

	reloadData(): void;

	reloadItemsAtIndexPaths(indexPaths: NSArray<NSIndexPath> | NSIndexPath[]): void;

	reloadSections(sections: NSIndexSet): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	scrollToItemAtIndexPathAtScrollPositionAnimated(indexPath: NSIndexPath, scrollPosition: UICollectionViewScrollPosition, animated: boolean): void;

	selectItemAtIndexPathAnimatedScrollPosition(indexPath: NSIndexPath, animated: boolean, scrollPosition: UICollectionViewScrollPosition): void;

	self(): this;

	setCollectionViewLayoutAnimated(layout: UICollectionViewLayout, animated: boolean): void;

	/**
	 * @since 7.0
	 */
	setCollectionViewLayoutAnimatedCompletion(layout: UICollectionViewLayout, animated: boolean, completion: (p1: boolean) => void): void;

	/**
	 * @since 7.0
	 */
	startInteractiveTransitionToCollectionViewLayoutCompletion(layout: UICollectionViewLayout, completion: (p1: boolean, p2: boolean) => void): UICollectionViewTransitionLayout;

	/**
	 * @since 9.0
	 */
	supplementaryViewForElementKindAtIndexPath(elementKind: string, indexPath: NSIndexPath): UICollectionReusableView;

	/**
	 * @since 9.0
	 */
	updateInteractiveMovementTargetPosition(targetPosition: CGPoint): void;

	/**
	 * @since 9.0
	 */
	visibleSupplementaryViewsOfKind(elementKind: string): NSArray<UICollectionReusableView>;
}

/**
 * @since 6.0
 */
declare class UICollectionViewCell extends UICollectionReusableView {

	static alloc(): UICollectionViewCell; // inherited from NSObject

	static appearance(): UICollectionViewCell; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UICollectionViewCell; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UICollectionViewCell; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UICollectionViewCell; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UICollectionViewCell; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UICollectionViewCell; // inherited from UIAppearance

	static new(): UICollectionViewCell; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	automaticallyUpdatesBackgroundConfiguration: boolean;

	/**
	 * @since 14.0
	 */
	automaticallyUpdatesContentConfiguration: boolean;

	/**
	 * @since 14.0
	 */
	backgroundConfiguration: UIBackgroundConfiguration;

	backgroundView: UIView;

	/**
	 * @since 14.0
	 */
	readonly configurationState: UICellConfigurationState;

	/**
	 * @since 15.0
	 */
	configurationUpdateHandler: (p1: UICollectionViewCell, p2: UICellConfigurationState) => void;

	/**
	 * @since 14.0
	 */
	contentConfiguration: UIContentConfiguration;

	readonly contentView: UIView;

	highlighted: boolean;

	selected: boolean;

	selectedBackgroundView: UIView;

	/**
	 * @since 16.0
	 */
	defaultBackgroundConfiguration(): UIBackgroundConfiguration;

	/**
	 * @since 11.0
	 */
	dragStateDidChange(dragState: UICollectionViewCellDragState): void;

	/**
	 * @since 14.0
	 */
	setNeedsUpdateConfiguration(): void;

	/**
	 * @since 14.0
	 */
	updateConfigurationUsingState(state: UICellConfigurationState): void;
}

/**
 * @since 11.0
 */
declare const enum UICollectionViewCellDragState {

	None = 0,

	Lifting = 1,

	Dragging = 2
}

/**
 * @since 14.0
 */
declare class UICollectionViewCellRegistration extends NSObject {

	static alloc(): UICollectionViewCellRegistration; // inherited from NSObject

	static new(): UICollectionViewCellRegistration; // inherited from NSObject

	static registrationWithCellClassConfigurationHandler(cellClass: typeof NSObject, configurationHandler: (p1: UICollectionViewCell, p2: NSIndexPath, p3: any) => void): UICollectionViewCellRegistration;

	static registrationWithCellNibConfigurationHandler(cellNib: UINib, configurationHandler: (p1: UICollectionViewCell, p2: NSIndexPath, p3: any) => void): UICollectionViewCellRegistration;

	readonly cellClass: typeof NSObject;

	readonly cellNib: UINib;

	readonly configurationHandler: (p1: UICollectionViewCell, p2: NSIndexPath, p3: any) => void;
}

/**
 * @since 13.0
 */
declare class UICollectionViewCompositionalLayout extends UICollectionViewLayout {

	static alloc(): UICollectionViewCompositionalLayout; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	static layoutWithListConfiguration(configuration: UICollectionLayoutListConfiguration): UICollectionViewCompositionalLayout;

	static new(): UICollectionViewCompositionalLayout; // inherited from NSObject

	configuration: UICollectionViewCompositionalLayoutConfiguration;

	constructor(o: { section: NSCollectionLayoutSection; });

	constructor(o: { section: NSCollectionLayoutSection; configuration: UICollectionViewCompositionalLayoutConfiguration; });

	constructor(o: { sectionProvider: (p1: number, p2: NSCollectionLayoutEnvironment) => NSCollectionLayoutSection; });

	constructor(o: { sectionProvider: (p1: number, p2: NSCollectionLayoutEnvironment) => NSCollectionLayoutSection; configuration: UICollectionViewCompositionalLayoutConfiguration; });

	initWithSection(section: NSCollectionLayoutSection): this;

	initWithSectionConfiguration(section: NSCollectionLayoutSection, configuration: UICollectionViewCompositionalLayoutConfiguration): this;

	initWithSectionProvider(sectionProvider: (p1: number, p2: NSCollectionLayoutEnvironment) => NSCollectionLayoutSection): this;

	initWithSectionProviderConfiguration(sectionProvider: (p1: number, p2: NSCollectionLayoutEnvironment) => NSCollectionLayoutSection, configuration: UICollectionViewCompositionalLayoutConfiguration): this;
}

/**
 * @since 13.0
 */
declare class UICollectionViewCompositionalLayoutConfiguration extends NSObject implements NSCopying {

	static alloc(): UICollectionViewCompositionalLayoutConfiguration; // inherited from NSObject

	static new(): UICollectionViewCompositionalLayoutConfiguration; // inherited from NSObject

	boundarySupplementaryItems: NSArray<NSCollectionLayoutBoundarySupplementaryItem>;

	/**
	 * @since 14.0
	 */
	contentInsetsReference: UIContentInsetsReference;

	interSectionSpacing: number;

	scrollDirection: UICollectionViewScrollDirection;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 6.0
 */
declare class UICollectionViewController extends UIViewController implements UICollectionViewDataSource, UICollectionViewDelegate {

	static alloc(): UICollectionViewController; // inherited from NSObject

	static new(): UICollectionViewController; // inherited from NSObject

	clearsSelectionOnViewWillAppear: boolean;

	collectionView: UICollectionView;

	/**
	 * @since 7.0
	 */
	readonly collectionViewLayout: UICollectionViewLayout;

	/**
	 * @since 9.0
	 */
	installsStandardGestureForInteractiveMovement: boolean;

	/**
	 * @since 7.0
	 */
	useLayoutToLayoutNavigationTransitions: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { collectionViewLayout: UICollectionViewLayout; });

	class(): typeof NSObject;

	/**
	 * @since 14.0
	 */
	collectionViewCanEditItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	/**
	 * @since 9.0
	 */
	collectionViewCanFocusItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	/**
	 * @since 9.0
	 */
	collectionViewCanMoveItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	/**
	 * @since 6.0
	 * @deprecated 13.0
	 */
	collectionViewCanPerformActionForItemAtIndexPathWithSender(collectionView: UICollectionView, action: string, indexPath: NSIndexPath, sender: any): boolean;

	/**
	 * @since 16.0
	 */
	collectionViewCanPerformPrimaryActionForItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewCellForItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): UICollectionViewCell;

	/**
	 * @since 16.0
	 */
	collectionViewContextMenuConfigurationDismissalPreviewForItemAtIndexPath(collectionView: UICollectionView, configuration: UIContextMenuConfiguration, indexPath: NSIndexPath): UITargetedPreview;

	/**
	 * @since 13.0
	 * @deprecated 16.0
	 */
	collectionViewContextMenuConfigurationForItemAtIndexPathPoint(collectionView: UICollectionView, indexPath: NSIndexPath, point: CGPoint): UIContextMenuConfiguration;

	/**
	 * @since 16.0
	 */
	collectionViewContextMenuConfigurationForItemsAtIndexPathsPoint(collectionView: UICollectionView, indexPaths: NSArray<NSIndexPath> | NSIndexPath[], point: CGPoint): UIContextMenuConfiguration;

	/**
	 * @since 16.0
	 */
	collectionViewContextMenuConfigurationHighlightPreviewForItemAtIndexPath(collectionView: UICollectionView, configuration: UIContextMenuConfiguration, indexPath: NSIndexPath): UITargetedPreview;

	/**
	 * @since 13.0
	 */
	collectionViewDidBeginMultipleSelectionInteractionAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): void;

	collectionViewDidDeselectItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): void;

	collectionViewDidEndDisplayingCellForItemAtIndexPath(collectionView: UICollectionView, cell: UICollectionViewCell, indexPath: NSIndexPath): void;

	collectionViewDidEndDisplayingSupplementaryViewForElementOfKindAtIndexPath(collectionView: UICollectionView, view: UICollectionReusableView, elementKind: string, indexPath: NSIndexPath): void;

	/**
	 * @since 13.0
	 */
	collectionViewDidEndMultipleSelectionInteraction(collectionView: UICollectionView): void;

	collectionViewDidHighlightItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): void;

	collectionViewDidSelectItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): void;

	collectionViewDidUnhighlightItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): void;

	/**
	 * @since 9.0
	 */
	collectionViewDidUpdateFocusInContextWithAnimationCoordinator(collectionView: UICollectionView, context: UICollectionViewFocusUpdateContext, coordinator: UIFocusAnimationCoordinator): void;

	/**
	 * @since 14.0
	 */
	collectionViewIndexPathForIndexTitleAtIndex(collectionView: UICollectionView, title: string, index: number): NSIndexPath;

	/**
	 * @since 9.0
	 */
	collectionViewMoveItemAtIndexPathToIndexPath(collectionView: UICollectionView, sourceIndexPath: NSIndexPath, destinationIndexPath: NSIndexPath): void;

	collectionViewNumberOfItemsInSection(collectionView: UICollectionView, section: number): number;

	/**
	 * @since 6.0
	 * @deprecated 13.0
	 */
	collectionViewPerformActionForItemAtIndexPathWithSender(collectionView: UICollectionView, action: string, indexPath: NSIndexPath, sender: any): void;

	/**
	 * @since 16.0
	 */
	collectionViewPerformPrimaryActionForItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): void;

	/**
	 * @since 13.0
	 * @deprecated 16.0
	 */
	collectionViewPreviewForDismissingContextMenuWithConfiguration(collectionView: UICollectionView, configuration: UIContextMenuConfiguration): UITargetedPreview;

	/**
	 * @since 13.0
	 * @deprecated 16.0
	 */
	collectionViewPreviewForHighlightingContextMenuWithConfiguration(collectionView: UICollectionView, configuration: UIContextMenuConfiguration): UITargetedPreview;

	/**
	 * @since 15.0
	 */
	collectionViewSceneActivationConfigurationForItemAtIndexPathPoint(collectionView: UICollectionView, indexPath: NSIndexPath, point: CGPoint): UIWindowSceneActivationConfiguration;

	/**
	 * @since 15.0
	 */
	collectionViewSelectionFollowsFocusForItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	/**
	 * @since 13.0
	 */
	collectionViewShouldBeginMultipleSelectionInteractionAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewShouldDeselectItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewShouldHighlightItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewShouldSelectItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	/**
	 * @since 6.0
	 * @deprecated 13.0
	 */
	collectionViewShouldShowMenuForItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	/**
	 * @since 11.0
	 */
	collectionViewShouldSpringLoadItemAtIndexPathWithContext(collectionView: UICollectionView, indexPath: NSIndexPath, context: UISpringLoadedInteractionContext): boolean;

	/**
	 * @since 9.0
	 */
	collectionViewShouldUpdateFocusInContext(collectionView: UICollectionView, context: UICollectionViewFocusUpdateContext): boolean;

	/**
	 * @since 9.0
	 */
	collectionViewTargetContentOffsetForProposedContentOffset(collectionView: UICollectionView, proposedContentOffset: CGPoint): CGPoint;

	/**
	 * @since 9.0
	 * @deprecated 15.0
	 */
	collectionViewTargetIndexPathForMoveFromItemAtIndexPathToProposedIndexPath(collectionView: UICollectionView, currentIndexPath: NSIndexPath, proposedIndexPath: NSIndexPath): NSIndexPath;

	/**
	 * @since 15.0
	 */
	collectionViewTargetIndexPathForMoveOfItemFromOriginalIndexPathAtCurrentIndexPathToProposedIndexPath(collectionView: UICollectionView, originalIndexPath: NSIndexPath, currentIndexPath: NSIndexPath, proposedIndexPath: NSIndexPath): NSIndexPath;

	collectionViewTransitionLayoutForOldLayoutNewLayout(collectionView: UICollectionView, fromLayout: UICollectionViewLayout, toLayout: UICollectionViewLayout): UICollectionViewTransitionLayout;

	collectionViewViewForSupplementaryElementOfKindAtIndexPath(collectionView: UICollectionView, kind: string, indexPath: NSIndexPath): UICollectionReusableView;

	/**
	 * @since 8.0
	 */
	collectionViewWillDisplayCellForItemAtIndexPath(collectionView: UICollectionView, cell: UICollectionViewCell, indexPath: NSIndexPath): void;

	/**
	 * @since 13.2
	 */
	collectionViewWillDisplayContextMenuWithConfigurationAnimator(collectionView: UICollectionView, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionAnimating): void;

	/**
	 * @since 8.0
	 */
	collectionViewWillDisplaySupplementaryViewForElementKindAtIndexPath(collectionView: UICollectionView, view: UICollectionReusableView, elementKind: string, indexPath: NSIndexPath): void;

	/**
	 * @since 13.2
	 */
	collectionViewWillEndContextMenuInteractionWithConfigurationAnimator(collectionView: UICollectionView, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionAnimating): void;

	/**
	 * @since 13.0
	 */
	collectionViewWillPerformPreviewActionForMenuWithConfigurationAnimator(collectionView: UICollectionView, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionCommitAnimating): void;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 9.0
	 */
	indexPathForPreferredFocusedViewInCollectionView(collectionView: UICollectionView): NSIndexPath;

	/**
	 * @since 14.0
	 */
	indexTitlesForCollectionView(collectionView: UICollectionView): NSArray<string>;

	initWithCollectionViewLayout(layout: UICollectionViewLayout): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	numberOfSectionsInCollectionView(collectionView: UICollectionView): number;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	/**
	 * @since 11.0
	 */
	scrollViewDidChangeAdjustedContentInset(scrollView: UIScrollView): void;

	scrollViewDidEndDecelerating(scrollView: UIScrollView): void;

	scrollViewDidEndDraggingWillDecelerate(scrollView: UIScrollView, decelerate: boolean): void;

	scrollViewDidEndScrollingAnimation(scrollView: UIScrollView): void;

	scrollViewDidEndZoomingWithViewAtScale(scrollView: UIScrollView, view: UIView, scale: number): void;

	scrollViewDidScroll(scrollView: UIScrollView): void;

	scrollViewDidScrollToTop(scrollView: UIScrollView): void;

	/**
	 * @since 3.2
	 */
	scrollViewDidZoom(scrollView: UIScrollView): void;

	scrollViewShouldScrollToTop(scrollView: UIScrollView): boolean;

	scrollViewWillBeginDecelerating(scrollView: UIScrollView): void;

	scrollViewWillBeginDragging(scrollView: UIScrollView): void;

	/**
	 * @since 3.2
	 */
	scrollViewWillBeginZoomingWithView(scrollView: UIScrollView, view: UIView): void;

	/**
	 * @since 5.0
	 */
	scrollViewWillEndDraggingWithVelocityTargetContentOffset(scrollView: UIScrollView, velocity: CGPoint, targetContentOffset: interop.Pointer | interop.Reference<CGPoint>): void;

	self(): this;

	viewForZoomingInScrollView(scrollView: UIScrollView): UIView;
}

interface UICollectionViewDataSource extends NSObjectProtocol {

	/**
	 * @since 9.0
	 */
	collectionViewCanMoveItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewCellForItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): UICollectionViewCell;

	/**
	 * @since 14.0
	 */
	collectionViewIndexPathForIndexTitleAtIndex?(collectionView: UICollectionView, title: string, index: number): NSIndexPath;

	/**
	 * @since 9.0
	 */
	collectionViewMoveItemAtIndexPathToIndexPath?(collectionView: UICollectionView, sourceIndexPath: NSIndexPath, destinationIndexPath: NSIndexPath): void;

	collectionViewNumberOfItemsInSection(collectionView: UICollectionView, section: number): number;

	collectionViewViewForSupplementaryElementOfKindAtIndexPath?(collectionView: UICollectionView, kind: string, indexPath: NSIndexPath): UICollectionReusableView;

	/**
	 * @since 14.0
	 */
	indexTitlesForCollectionView?(collectionView: UICollectionView): NSArray<string>;

	numberOfSectionsInCollectionView?(collectionView: UICollectionView): number;
}
declare var UICollectionViewDataSource: {

	prototype: UICollectionViewDataSource;
};

interface UICollectionViewDataSourcePrefetching extends NSObjectProtocol {

	/**
	 * @since 10.0
	 */
	collectionViewCancelPrefetchingForItemsAtIndexPaths?(collectionView: UICollectionView, indexPaths: NSArray<NSIndexPath> | NSIndexPath[]): void;

	/**
	 * @since 10.0
	 */
	collectionViewPrefetchItemsAtIndexPaths(collectionView: UICollectionView, indexPaths: NSArray<NSIndexPath> | NSIndexPath[]): void;
}
declare var UICollectionViewDataSourcePrefetching: {

	prototype: UICollectionViewDataSourcePrefetching;
};

interface UICollectionViewDelegate extends UIScrollViewDelegate {

	/**
	 * @since 14.0
	 */
	collectionViewCanEditItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	/**
	 * @since 9.0
	 */
	collectionViewCanFocusItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	/**
	 * @since 6.0
	 * @deprecated 13.0
	 */
	collectionViewCanPerformActionForItemAtIndexPathWithSender?(collectionView: UICollectionView, action: string, indexPath: NSIndexPath, sender: any): boolean;

	/**
	 * @since 16.0
	 */
	collectionViewCanPerformPrimaryActionForItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	/**
	 * @since 16.0
	 */
	collectionViewContextMenuConfigurationDismissalPreviewForItemAtIndexPath?(collectionView: UICollectionView, configuration: UIContextMenuConfiguration, indexPath: NSIndexPath): UITargetedPreview;

	/**
	 * @since 13.0
	 * @deprecated 16.0
	 */
	collectionViewContextMenuConfigurationForItemAtIndexPathPoint?(collectionView: UICollectionView, indexPath: NSIndexPath, point: CGPoint): UIContextMenuConfiguration;

	/**
	 * @since 16.0
	 */
	collectionViewContextMenuConfigurationForItemsAtIndexPathsPoint?(collectionView: UICollectionView, indexPaths: NSArray<NSIndexPath> | NSIndexPath[], point: CGPoint): UIContextMenuConfiguration;

	/**
	 * @since 16.0
	 */
	collectionViewContextMenuConfigurationHighlightPreviewForItemAtIndexPath?(collectionView: UICollectionView, configuration: UIContextMenuConfiguration, indexPath: NSIndexPath): UITargetedPreview;

	/**
	 * @since 13.0
	 */
	collectionViewDidBeginMultipleSelectionInteractionAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): void;

	collectionViewDidDeselectItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): void;

	collectionViewDidEndDisplayingCellForItemAtIndexPath?(collectionView: UICollectionView, cell: UICollectionViewCell, indexPath: NSIndexPath): void;

	collectionViewDidEndDisplayingSupplementaryViewForElementOfKindAtIndexPath?(collectionView: UICollectionView, view: UICollectionReusableView, elementKind: string, indexPath: NSIndexPath): void;

	/**
	 * @since 13.0
	 */
	collectionViewDidEndMultipleSelectionInteraction?(collectionView: UICollectionView): void;

	collectionViewDidHighlightItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): void;

	collectionViewDidSelectItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): void;

	collectionViewDidUnhighlightItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): void;

	/**
	 * @since 9.0
	 */
	collectionViewDidUpdateFocusInContextWithAnimationCoordinator?(collectionView: UICollectionView, context: UICollectionViewFocusUpdateContext, coordinator: UIFocusAnimationCoordinator): void;

	/**
	 * @since 6.0
	 * @deprecated 13.0
	 */
	collectionViewPerformActionForItemAtIndexPathWithSender?(collectionView: UICollectionView, action: string, indexPath: NSIndexPath, sender: any): void;

	/**
	 * @since 16.0
	 */
	collectionViewPerformPrimaryActionForItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): void;

	/**
	 * @since 13.0
	 * @deprecated 16.0
	 */
	collectionViewPreviewForDismissingContextMenuWithConfiguration?(collectionView: UICollectionView, configuration: UIContextMenuConfiguration): UITargetedPreview;

	/**
	 * @since 13.0
	 * @deprecated 16.0
	 */
	collectionViewPreviewForHighlightingContextMenuWithConfiguration?(collectionView: UICollectionView, configuration: UIContextMenuConfiguration): UITargetedPreview;

	/**
	 * @since 15.0
	 */
	collectionViewSceneActivationConfigurationForItemAtIndexPathPoint?(collectionView: UICollectionView, indexPath: NSIndexPath, point: CGPoint): UIWindowSceneActivationConfiguration;

	/**
	 * @since 15.0
	 */
	collectionViewSelectionFollowsFocusForItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	/**
	 * @since 13.0
	 */
	collectionViewShouldBeginMultipleSelectionInteractionAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewShouldDeselectItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewShouldHighlightItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewShouldSelectItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	/**
	 * @since 6.0
	 * @deprecated 13.0
	 */
	collectionViewShouldShowMenuForItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	/**
	 * @since 11.0
	 */
	collectionViewShouldSpringLoadItemAtIndexPathWithContext?(collectionView: UICollectionView, indexPath: NSIndexPath, context: UISpringLoadedInteractionContext): boolean;

	/**
	 * @since 9.0
	 */
	collectionViewShouldUpdateFocusInContext?(collectionView: UICollectionView, context: UICollectionViewFocusUpdateContext): boolean;

	/**
	 * @since 9.0
	 */
	collectionViewTargetContentOffsetForProposedContentOffset?(collectionView: UICollectionView, proposedContentOffset: CGPoint): CGPoint;

	/**
	 * @since 9.0
	 * @deprecated 15.0
	 */
	collectionViewTargetIndexPathForMoveFromItemAtIndexPathToProposedIndexPath?(collectionView: UICollectionView, currentIndexPath: NSIndexPath, proposedIndexPath: NSIndexPath): NSIndexPath;

	/**
	 * @since 15.0
	 */
	collectionViewTargetIndexPathForMoveOfItemFromOriginalIndexPathAtCurrentIndexPathToProposedIndexPath?(collectionView: UICollectionView, originalIndexPath: NSIndexPath, currentIndexPath: NSIndexPath, proposedIndexPath: NSIndexPath): NSIndexPath;

	collectionViewTransitionLayoutForOldLayoutNewLayout?(collectionView: UICollectionView, fromLayout: UICollectionViewLayout, toLayout: UICollectionViewLayout): UICollectionViewTransitionLayout;

	/**
	 * @since 8.0
	 */
	collectionViewWillDisplayCellForItemAtIndexPath?(collectionView: UICollectionView, cell: UICollectionViewCell, indexPath: NSIndexPath): void;

	/**
	 * @since 13.2
	 */
	collectionViewWillDisplayContextMenuWithConfigurationAnimator?(collectionView: UICollectionView, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionAnimating): void;

	/**
	 * @since 8.0
	 */
	collectionViewWillDisplaySupplementaryViewForElementKindAtIndexPath?(collectionView: UICollectionView, view: UICollectionReusableView, elementKind: string, indexPath: NSIndexPath): void;

	/**
	 * @since 13.2
	 */
	collectionViewWillEndContextMenuInteractionWithConfigurationAnimator?(collectionView: UICollectionView, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionAnimating): void;

	/**
	 * @since 13.0
	 */
	collectionViewWillPerformPreviewActionForMenuWithConfigurationAnimator?(collectionView: UICollectionView, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionCommitAnimating): void;

	/**
	 * @since 9.0
	 */
	indexPathForPreferredFocusedViewInCollectionView?(collectionView: UICollectionView): NSIndexPath;
}
declare var UICollectionViewDelegate: {

	prototype: UICollectionViewDelegate;
};

interface UICollectionViewDelegateFlowLayout extends UICollectionViewDelegate {

	collectionViewLayoutInsetForSectionAtIndex?(collectionView: UICollectionView, collectionViewLayout: UICollectionViewLayout, section: number): UIEdgeInsets;

	collectionViewLayoutMinimumInteritemSpacingForSectionAtIndex?(collectionView: UICollectionView, collectionViewLayout: UICollectionViewLayout, section: number): number;

	collectionViewLayoutMinimumLineSpacingForSectionAtIndex?(collectionView: UICollectionView, collectionViewLayout: UICollectionViewLayout, section: number): number;

	collectionViewLayoutReferenceSizeForFooterInSection?(collectionView: UICollectionView, collectionViewLayout: UICollectionViewLayout, section: number): CGSize;

	collectionViewLayoutReferenceSizeForHeaderInSection?(collectionView: UICollectionView, collectionViewLayout: UICollectionViewLayout, section: number): CGSize;

	collectionViewLayoutSizeForItemAtIndexPath?(collectionView: UICollectionView, collectionViewLayout: UICollectionViewLayout, indexPath: NSIndexPath): CGSize;
}
declare var UICollectionViewDelegateFlowLayout: {

	prototype: UICollectionViewDelegateFlowLayout;
};

/**
 * @since 13.0
 */
declare class UICollectionViewDiffableDataSource<SectionIdentifierType, ItemIdentifierType> extends NSObject implements UICollectionViewDataSource {

	static alloc<SectionIdentifierType, ItemIdentifierType>(): UICollectionViewDiffableDataSource<SectionIdentifierType, ItemIdentifierType>; // inherited from NSObject

	static new<SectionIdentifierType, ItemIdentifierType>(): UICollectionViewDiffableDataSource<SectionIdentifierType, ItemIdentifierType>; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	reorderingHandlers: UICollectionViewDiffableDataSourceReorderingHandlers<any, any>;

	/**
	 * @since 14.0
	 */
	sectionSnapshotHandlers: UICollectionViewDiffableDataSourceSectionSnapshotHandlers<any>;

	supplementaryViewProvider: (p1: UICollectionView, p2: string, p3: NSIndexPath) => UICollectionReusableView;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { collectionView: UICollectionView; cellProvider: (p1: UICollectionView, p2: NSIndexPath, p3: any) => UICollectionViewCell; });

	applySnapshotAnimatingDifferences(snapshot: NSDiffableDataSourceSnapshot<any, any>, animatingDifferences: boolean): void;

	applySnapshotAnimatingDifferencesCompletion(snapshot: NSDiffableDataSourceSnapshot<any, any>, animatingDifferences: boolean, completion: () => void): void;

	/**
	 * @since 14.0
	 */
	applySnapshotToSectionAnimatingDifferences(snapshot: NSDiffableDataSourceSectionSnapshot<any>, sectionIdentifier: any, animatingDifferences: boolean): void;

	/**
	 * @since 14.0
	 */
	applySnapshotToSectionAnimatingDifferencesCompletion(snapshot: NSDiffableDataSourceSectionSnapshot<any>, sectionIdentifier: any, animatingDifferences: boolean, completion: () => void): void;

	/**
	 * @since 15.0
	 */
	applySnapshotUsingReloadData(snapshot: NSDiffableDataSourceSnapshot<any, any>): void;

	/**
	 * @since 15.0
	 */
	applySnapshotUsingReloadDataCompletion(snapshot: NSDiffableDataSourceSnapshot<any, any>, completion: () => void): void;

	class(): typeof NSObject;

	/**
	 * @since 9.0
	 */
	collectionViewCanMoveItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewCellForItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): UICollectionViewCell;

	/**
	 * @since 14.0
	 */
	collectionViewIndexPathForIndexTitleAtIndex(collectionView: UICollectionView, title: string, index: number): NSIndexPath;

	/**
	 * @since 9.0
	 */
	collectionViewMoveItemAtIndexPathToIndexPath(collectionView: UICollectionView, sourceIndexPath: NSIndexPath, destinationIndexPath: NSIndexPath): void;

	collectionViewNumberOfItemsInSection(collectionView: UICollectionView, section: number): number;

	collectionViewViewForSupplementaryElementOfKindAtIndexPath(collectionView: UICollectionView, kind: string, indexPath: NSIndexPath): UICollectionReusableView;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 15.0
	 */
	indexForSectionIdentifier(identifier: any): number;

	indexPathForItemIdentifier(identifier: any): NSIndexPath;

	/**
	 * @since 14.0
	 */
	indexTitlesForCollectionView(collectionView: UICollectionView): NSArray<string>;

	initWithCollectionViewCellProvider(collectionView: UICollectionView, cellProvider: (p1: UICollectionView, p2: NSIndexPath, p3: any) => UICollectionViewCell): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	itemIdentifierForIndexPath(indexPath: NSIndexPath): any;

	numberOfSectionsInCollectionView(collectionView: UICollectionView): number;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	/**
	 * @since 15.0
	 */
	sectionIdentifierForIndex(index: number): any;

	self(): this;

	snapshot(): NSDiffableDataSourceSnapshot<any, any>;

	/**
	 * @since 14.0
	 */
	snapshotForSection(section: any): NSDiffableDataSourceSectionSnapshot<any>;
}

/**
 * @since 14.0
 */
declare class UICollectionViewDiffableDataSourceReorderingHandlers<SectionType, ItemType> extends NSObject implements NSCopying {

	static alloc<SectionType, ItemType>(): UICollectionViewDiffableDataSourceReorderingHandlers<SectionType, ItemType>; // inherited from NSObject

	static new<SectionType, ItemType>(): UICollectionViewDiffableDataSourceReorderingHandlers<SectionType, ItemType>; // inherited from NSObject

	canReorderItemHandler: (p1: any) => boolean;

	didReorderHandler: (p1: NSDiffableDataSourceTransaction<any, any>) => void;

	willReorderHandler: (p1: NSDiffableDataSourceTransaction<any, any>) => void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 14.0
 */
declare class UICollectionViewDiffableDataSourceSectionSnapshotHandlers<ItemType> extends NSObject implements NSCopying {

	static alloc<ItemType>(): UICollectionViewDiffableDataSourceSectionSnapshotHandlers<ItemType>; // inherited from NSObject

	static new<ItemType>(): UICollectionViewDiffableDataSourceSectionSnapshotHandlers<ItemType>; // inherited from NSObject

	shouldCollapseItemHandler: (p1: any) => boolean;

	shouldExpandItemHandler: (p1: any) => boolean;

	snapshotForExpandingParentItemHandler: (p1: any, p2: NSDiffableDataSourceSectionSnapshot<any>) => NSDiffableDataSourceSectionSnapshot<any>;

	willCollapseItemHandler: (p1: any) => void;

	willExpandItemHandler: (p1: any) => void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 11.0
 */
interface UICollectionViewDragDelegate extends NSObjectProtocol {

	collectionViewDragPreviewParametersForItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): UIDragPreviewParameters;

	collectionViewDragSessionAllowsMoveOperation?(collectionView: UICollectionView, session: UIDragSession): boolean;

	collectionViewDragSessionDidEnd?(collectionView: UICollectionView, session: UIDragSession): void;

	collectionViewDragSessionIsRestrictedToDraggingApplication?(collectionView: UICollectionView, session: UIDragSession): boolean;

	collectionViewDragSessionWillBegin?(collectionView: UICollectionView, session: UIDragSession): void;

	collectionViewItemsForAddingToDragSessionAtIndexPathPoint?(collectionView: UICollectionView, session: UIDragSession, indexPath: NSIndexPath, point: CGPoint): NSArray<UIDragItem>;

	collectionViewItemsForBeginningDragSessionAtIndexPath(collectionView: UICollectionView, session: UIDragSession, indexPath: NSIndexPath): NSArray<UIDragItem>;
}
declare var UICollectionViewDragDelegate: {

	prototype: UICollectionViewDragDelegate;
};

/**
 * @since 11.0
 */
interface UICollectionViewDropCoordinator extends NSObjectProtocol {

	destinationIndexPath: NSIndexPath;

	items: NSArray<UICollectionViewDropItem>;

	proposal: UICollectionViewDropProposal;

	session: UIDropSession;

	dropItemIntoItemAtIndexPathRect(dragItem: UIDragItem, indexPath: NSIndexPath, rect: CGRect): UIDragAnimating;

	dropItemToItemAtIndexPath(dragItem: UIDragItem, indexPath: NSIndexPath): UIDragAnimating;

	dropItemToPlaceholder(dragItem: UIDragItem, placeholder: UICollectionViewDropPlaceholder): UICollectionViewDropPlaceholderContext;

	dropItemToTarget(dragItem: UIDragItem, target: UIDragPreviewTarget): UIDragAnimating;
}
declare var UICollectionViewDropCoordinator: {

	prototype: UICollectionViewDropCoordinator;
};

/**
 * @since 11.0
 */
interface UICollectionViewDropDelegate extends NSObjectProtocol {

	collectionViewCanHandleDropSession?(collectionView: UICollectionView, session: UIDropSession): boolean;

	collectionViewDropPreviewParametersForItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): UIDragPreviewParameters;

	collectionViewDropSessionDidEnd?(collectionView: UICollectionView, session: UIDropSession): void;

	collectionViewDropSessionDidEnter?(collectionView: UICollectionView, session: UIDropSession): void;

	collectionViewDropSessionDidExit?(collectionView: UICollectionView, session: UIDropSession): void;

	collectionViewDropSessionDidUpdateWithDestinationIndexPath?(collectionView: UICollectionView, session: UIDropSession, destinationIndexPath: NSIndexPath): UICollectionViewDropProposal;

	collectionViewPerformDropWithCoordinator(collectionView: UICollectionView, coordinator: UICollectionViewDropCoordinator): void;
}
declare var UICollectionViewDropDelegate: {

	prototype: UICollectionViewDropDelegate;
};

/**
 * @since 11.0
 */
declare const enum UICollectionViewDropIntent {

	Unspecified = 0,

	InsertAtDestinationIndexPath = 1,

	InsertIntoDestinationIndexPath = 2
}

/**
 * @since 11.0
 */
interface UICollectionViewDropItem extends NSObjectProtocol {

	dragItem: UIDragItem;

	previewSize: CGSize;

	sourceIndexPath: NSIndexPath;
}
declare var UICollectionViewDropItem: {

	prototype: UICollectionViewDropItem;
};

/**
 * @since 11.0
 */
declare class UICollectionViewDropPlaceholder extends UICollectionViewPlaceholder {

	static alloc(): UICollectionViewDropPlaceholder; // inherited from NSObject

	static new(): UICollectionViewDropPlaceholder; // inherited from NSObject

	previewParametersProvider: (p1: UICollectionViewCell) => UIDragPreviewParameters;
}

/**
 * @since 11.0
 */
interface UICollectionViewDropPlaceholderContext extends UIDragAnimating {

	dragItem: UIDragItem;

	commitInsertionWithDataSourceUpdates(dataSourceUpdates: (p1: NSIndexPath) => void): boolean;

	deletePlaceholder(): boolean;

	setNeedsCellUpdate(): void;
}
declare var UICollectionViewDropPlaceholderContext: {

	prototype: UICollectionViewDropPlaceholderContext;
};

/**
 * @since 11.0
 */
declare class UICollectionViewDropProposal extends UIDropProposal {

	static alloc(): UICollectionViewDropProposal; // inherited from NSObject

	static new(): UICollectionViewDropProposal; // inherited from NSObject

	readonly intent: UICollectionViewDropIntent;

	constructor(o: { dropOperation: UIDropOperation; intent: UICollectionViewDropIntent; });

	initWithDropOperationIntent(operation: UIDropOperation, intent: UICollectionViewDropIntent): this;
}

/**
 * @since 6.0
 */
declare class UICollectionViewFlowLayout extends UICollectionViewLayout {

	static alloc(): UICollectionViewFlowLayout; // inherited from NSObject

	static new(): UICollectionViewFlowLayout; // inherited from NSObject

	/**
	 * @since 8.0
	 */
	estimatedItemSize: CGSize;

	footerReferenceSize: CGSize;

	headerReferenceSize: CGSize;

	itemSize: CGSize;

	minimumInteritemSpacing: number;

	minimumLineSpacing: number;

	scrollDirection: UICollectionViewScrollDirection;

	/**
	 * @since 9.0
	 */
	sectionFootersPinToVisibleBounds: boolean;

	/**
	 * @since 9.0
	 */
	sectionHeadersPinToVisibleBounds: boolean;

	sectionInset: UIEdgeInsets;

	/**
	 * @since 11.0
	 */
	sectionInsetReference: UICollectionViewFlowLayoutSectionInsetReference;
}

/**
 * @since 10.0
 */
declare var UICollectionViewFlowLayoutAutomaticSize: CGSize;

/**
 * @since 7.0
 */
declare class UICollectionViewFlowLayoutInvalidationContext extends UICollectionViewLayoutInvalidationContext {

	static alloc(): UICollectionViewFlowLayoutInvalidationContext; // inherited from NSObject

	static new(): UICollectionViewFlowLayoutInvalidationContext; // inherited from NSObject

	invalidateFlowLayoutAttributes: boolean;

	invalidateFlowLayoutDelegateMetrics: boolean;
}

/**
 * @since 11.0
 */
declare const enum UICollectionViewFlowLayoutSectionInsetReference {

	FromContentInset = 0,

	FromSafeArea = 1,

	FromLayoutMargins = 2
}

/**
 * @since 9.0
 */
declare class UICollectionViewFocusUpdateContext extends UIFocusUpdateContext {

	static alloc(): UICollectionViewFocusUpdateContext; // inherited from NSObject

	static new(): UICollectionViewFocusUpdateContext; // inherited from NSObject

	readonly nextFocusedIndexPath: NSIndexPath;

	readonly previouslyFocusedIndexPath: NSIndexPath;
}

/**
 * @since 6.0
 */
declare class UICollectionViewLayout extends NSObject implements NSCoding {

	static alloc(): UICollectionViewLayout; // inherited from NSObject

	static new(): UICollectionViewLayout; // inherited from NSObject

	readonly collectionView: UICollectionView;

	readonly collectionViewContentSize: CGSize;

	readonly developmentLayoutDirection: UIUserInterfaceLayoutDirection;

	readonly flipsHorizontallyInOppositeLayoutDirection: boolean;

	/**
	 * @since 7.0
	 */
	static readonly invalidationContextClass: typeof NSObject;

	static readonly layoutAttributesClass: typeof NSObject;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	finalLayoutAttributesForDisappearingDecorationElementOfKindAtIndexPath(elementKind: string, decorationIndexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	finalLayoutAttributesForDisappearingItemAtIndexPath(itemIndexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	finalLayoutAttributesForDisappearingSupplementaryElementOfKindAtIndexPath(elementKind: string, elementIndexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	finalizeAnimatedBoundsChange(): void;

	finalizeCollectionViewUpdates(): void;

	/**
	 * @since 7.0
	 */
	finalizeLayoutTransition(): void;

	/**
	 * @since 7.0
	 */
	indexPathsToDeleteForDecorationViewOfKind(elementKind: string): NSArray<NSIndexPath>;

	/**
	 * @since 7.0
	 */
	indexPathsToDeleteForSupplementaryViewOfKind(elementKind: string): NSArray<NSIndexPath>;

	/**
	 * @since 7.0
	 */
	indexPathsToInsertForDecorationViewOfKind(elementKind: string): NSArray<NSIndexPath>;

	/**
	 * @since 7.0
	 */
	indexPathsToInsertForSupplementaryViewOfKind(elementKind: string): NSArray<NSIndexPath>;

	initWithCoder(coder: NSCoder): this;

	initialLayoutAttributesForAppearingDecorationElementOfKindAtIndexPath(elementKind: string, decorationIndexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	initialLayoutAttributesForAppearingItemAtIndexPath(itemIndexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	initialLayoutAttributesForAppearingSupplementaryElementOfKindAtIndexPath(elementKind: string, elementIndexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	invalidateLayout(): void;

	/**
	 * @since 7.0
	 */
	invalidateLayoutWithContext(context: UICollectionViewLayoutInvalidationContext): void;

	/**
	 * @since 7.0
	 */
	invalidationContextForBoundsChange(newBounds: CGRect): UICollectionViewLayoutInvalidationContext;

	/**
	 * @since 9.0
	 */
	invalidationContextForEndingInteractiveMovementOfItemsToFinalIndexPathsPreviousIndexPathsMovementCancelled(indexPaths: NSArray<NSIndexPath> | NSIndexPath[], previousIndexPaths: NSArray<NSIndexPath> | NSIndexPath[], movementCancelled: boolean): UICollectionViewLayoutInvalidationContext;

	/**
	 * @since 9.0
	 */
	invalidationContextForInteractivelyMovingItemsWithTargetPositionPreviousIndexPathsPreviousPosition(targetIndexPaths: NSArray<NSIndexPath> | NSIndexPath[], targetPosition: CGPoint, previousIndexPaths: NSArray<NSIndexPath> | NSIndexPath[], previousPosition: CGPoint): UICollectionViewLayoutInvalidationContext;

	/**
	 * @since 8.0
	 */
	invalidationContextForPreferredLayoutAttributesWithOriginalAttributes(preferredAttributes: UICollectionViewLayoutAttributes, originalAttributes: UICollectionViewLayoutAttributes): UICollectionViewLayoutInvalidationContext;

	layoutAttributesForDecorationViewOfKindAtIndexPath(elementKind: string, indexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	layoutAttributesForElementsInRect(rect: CGRect): NSArray<UICollectionViewLayoutAttributes>;

	/**
	 * @since 9.0
	 */
	layoutAttributesForInteractivelyMovingItemAtIndexPathWithTargetPosition(indexPath: NSIndexPath, position: CGPoint): UICollectionViewLayoutAttributes;

	layoutAttributesForItemAtIndexPath(indexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	layoutAttributesForSupplementaryViewOfKindAtIndexPath(elementKind: string, indexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	prepareForAnimatedBoundsChange(oldBounds: CGRect): void;

	prepareForCollectionViewUpdates(updateItems: NSArray<UICollectionViewUpdateItem> | UICollectionViewUpdateItem[]): void;

	/**
	 * @since 7.0
	 */
	prepareForTransitionFromLayout(oldLayout: UICollectionViewLayout): void;

	/**
	 * @since 7.0
	 */
	prepareForTransitionToLayout(newLayout: UICollectionViewLayout): void;

	prepareLayout(): void;

	registerClassForDecorationViewOfKind(viewClass: typeof NSObject, elementKind: string): void;

	registerNibForDecorationViewOfKind(nib: UINib, elementKind: string): void;

	shouldInvalidateLayoutForBoundsChange(newBounds: CGRect): boolean;

	/**
	 * @since 8.0
	 */
	shouldInvalidateLayoutForPreferredLayoutAttributesWithOriginalAttributes(preferredAttributes: UICollectionViewLayoutAttributes, originalAttributes: UICollectionViewLayoutAttributes): boolean;

	/**
	 * @since 7.0
	 */
	targetContentOffsetForProposedContentOffset(proposedContentOffset: CGPoint): CGPoint;

	targetContentOffsetForProposedContentOffsetWithScrollingVelocity(proposedContentOffset: CGPoint, velocity: CGPoint): CGPoint;

	/**
	 * @since 9.0
	 */
	targetIndexPathForInteractivelyMovingItemWithPosition(previousIndexPath: NSIndexPath, position: CGPoint): NSIndexPath;
}

/**
 * @since 6.0
 */
declare class UICollectionViewLayoutAttributes extends NSObject implements NSCopying, UIDynamicItem {

	static alloc(): UICollectionViewLayoutAttributes; // inherited from NSObject

	static layoutAttributesForCellWithIndexPath(indexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	static layoutAttributesForDecorationViewOfKindWithIndexPath(decorationViewKind: string, indexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	static layoutAttributesForSupplementaryViewOfKindWithIndexPath(elementKind: string, indexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	static new(): UICollectionViewLayoutAttributes; // inherited from NSObject

	alpha: number;

	/**
	 * @since 7.0
	 */
	bounds: CGRect;

	frame: CGRect;

	hidden: boolean;

	indexPath: NSIndexPath;

	readonly representedElementCategory: UICollectionElementCategory;

	readonly representedElementKind: string;

	size: CGSize;

	transform3D: CATransform3D;

	zIndex: number;

	center: CGPoint; // inherited from UIDynamicItem

	/**
	 * @since 9.0
	 */
	readonly collisionBoundingPath: UIBezierPath; // inherited from UIDynamicItem

	/**
	 * @since 9.0
	 */
	readonly collisionBoundsType: UIDynamicItemCollisionBoundsType; // inherited from UIDynamicItem

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	transform: CGAffineTransform; // inherited from UIDynamicItem

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

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
 * @since 15.0
 */
declare var UICollectionViewLayoutAutomaticDimension: number;

/**
 * @since 7.0
 */
declare class UICollectionViewLayoutInvalidationContext extends NSObject {

	static alloc(): UICollectionViewLayoutInvalidationContext; // inherited from NSObject

	static new(): UICollectionViewLayoutInvalidationContext; // inherited from NSObject

	/**
	 * @since 8.0
	 */
	contentOffsetAdjustment: CGPoint;

	/**
	 * @since 8.0
	 */
	contentSizeAdjustment: CGSize;

	/**
	 * @since 9.0
	 */
	readonly interactiveMovementTarget: CGPoint;

	readonly invalidateDataSourceCounts: boolean;

	readonly invalidateEverything: boolean;

	/**
	 * @since 8.0
	 */
	readonly invalidatedDecorationIndexPaths: NSDictionary<string, NSArray<NSIndexPath>>;

	/**
	 * @since 8.0
	 */
	readonly invalidatedItemIndexPaths: NSArray<NSIndexPath>;

	/**
	 * @since 8.0
	 */
	readonly invalidatedSupplementaryIndexPaths: NSDictionary<string, NSArray<NSIndexPath>>;

	/**
	 * @since 9.0
	 */
	readonly previousIndexPathsForInteractivelyMovingItems: NSArray<NSIndexPath>;

	/**
	 * @since 9.0
	 */
	readonly targetIndexPathsForInteractivelyMovingItems: NSArray<NSIndexPath>;

	/**
	 * @since 8.0
	 */
	invalidateDecorationElementsOfKindAtIndexPaths(elementKind: string, indexPaths: NSArray<NSIndexPath> | NSIndexPath[]): void;

	/**
	 * @since 8.0
	 */
	invalidateItemsAtIndexPaths(indexPaths: NSArray<NSIndexPath> | NSIndexPath[]): void;

	/**
	 * @since 8.0
	 */
	invalidateSupplementaryElementsOfKindAtIndexPaths(elementKind: string, indexPaths: NSArray<NSIndexPath> | NSIndexPath[]): void;
}

/**
 * @since 14.0
 */
declare class UICollectionViewListCell extends UICollectionViewCell {

	static alloc(): UICollectionViewListCell; // inherited from NSObject

	static appearance(): UICollectionViewListCell; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UICollectionViewListCell; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UICollectionViewListCell; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UICollectionViewListCell; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UICollectionViewListCell; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UICollectionViewListCell; // inherited from UIAppearance

	static new(): UICollectionViewListCell; // inherited from NSObject

	accessories: NSArray<UICellAccessory>;

	indentationLevel: number;

	indentationWidth: number;

	indentsAccessories: boolean;

	readonly separatorLayoutGuide: UILayoutGuide;

	defaultContentConfiguration(): UIListContentConfiguration;
}

/**
 * @since 11.0
 */
declare class UICollectionViewPlaceholder extends NSObject {

	static alloc(): UICollectionViewPlaceholder; // inherited from NSObject

	static new(): UICollectionViewPlaceholder; // inherited from NSObject

	cellUpdateHandler: (p1: UICollectionViewCell) => void;

	constructor(o: { insertionIndexPath: NSIndexPath; reuseIdentifier: string; });

	initWithInsertionIndexPathReuseIdentifier(insertionIndexPath: NSIndexPath, reuseIdentifier: string): this;
}

/**
 * @since 11.0
 */
declare const enum UICollectionViewReorderingCadence {

	Immediate = 0,

	Fast = 1,

	Slow = 2
}

declare const enum UICollectionViewScrollDirection {

	Vertical = 0,

	Horizontal = 1
}

declare const enum UICollectionViewScrollPosition {

	None = 0,

	Top = 1,

	CenteredVertically = 2,

	Bottom = 4,

	Left = 8,

	CenteredHorizontally = 16,

	Right = 32
}

/**
 * @since 16.0
 */
declare const enum UICollectionViewSelfSizingInvalidation {

	Disabled = 0,

	Enabled = 1,

	EnabledIncludingConstraints = 2
}

/**
 * @since 14.0
 */
declare class UICollectionViewSupplementaryRegistration extends NSObject {

	static alloc(): UICollectionViewSupplementaryRegistration; // inherited from NSObject

	static new(): UICollectionViewSupplementaryRegistration; // inherited from NSObject

	static registrationWithSupplementaryClassElementKindConfigurationHandler(supplementaryClass: typeof NSObject, elementKind: string, configurationHandler: (p1: UICollectionReusableView, p2: string, p3: NSIndexPath) => void): UICollectionViewSupplementaryRegistration;

	static registrationWithSupplementaryNibElementKindConfigurationHandler(supplementaryNib: UINib, elementKind: string, configurationHandler: (p1: UICollectionReusableView, p2: string, p3: NSIndexPath) => void): UICollectionViewSupplementaryRegistration;

	readonly configurationHandler: (p1: UICollectionReusableView, p2: string, p3: NSIndexPath) => void;

	readonly elementKind: string;

	readonly supplementaryClass: typeof NSObject;

	readonly supplementaryNib: UINib;
}

/**
 * @since 7.0
 */
declare class UICollectionViewTransitionLayout extends UICollectionViewLayout {

	static alloc(): UICollectionViewTransitionLayout; // inherited from NSObject

	static new(): UICollectionViewTransitionLayout; // inherited from NSObject

	readonly currentLayout: UICollectionViewLayout;

	readonly nextLayout: UICollectionViewLayout;

	transitionProgress: number;

	constructor(o: { currentLayout: UICollectionViewLayout; nextLayout: UICollectionViewLayout; });

	initWithCurrentLayoutNextLayout(currentLayout: UICollectionViewLayout, newLayout: UICollectionViewLayout): this;

	updateValueForAnimatedKey(value: number, key: string): void;

	valueForAnimatedKey(key: string): number;
}

/**
 * @since 6.0
 */
declare class UICollectionViewUpdateItem extends NSObject {

	static alloc(): UICollectionViewUpdateItem; // inherited from NSObject

	static new(): UICollectionViewUpdateItem; // inherited from NSObject

	readonly indexPathAfterUpdate: NSIndexPath;

	readonly indexPathBeforeUpdate: NSIndexPath;

	readonly updateAction: UICollectionUpdateAction;
}

/**
 * @since 7.0
 */
declare class UICollisionBehavior extends UIDynamicBehavior {

	static alloc(): UICollisionBehavior; // inherited from NSObject

	static new(): UICollisionBehavior; // inherited from NSObject

	readonly boundaryIdentifiers: NSArray<any>;

	collisionDelegate: UICollisionBehaviorDelegate;

	collisionMode: UICollisionBehaviorMode;

	readonly items: NSArray<UIDynamicItem>;

	translatesReferenceBoundsIntoBoundary: boolean;

	constructor(o: { items: NSArray<UIDynamicItem> | UIDynamicItem[]; });

	addBoundaryWithIdentifierForPath(identifier: any, bezierPath: UIBezierPath): void;

	addBoundaryWithIdentifierFromPointToPoint(identifier: any, p1: CGPoint, p2: CGPoint): void;

	addItem(item: UIDynamicItem): void;

	boundaryWithIdentifier(identifier: any): UIBezierPath;

	initWithItems(items: NSArray<UIDynamicItem> | UIDynamicItem[]): this;

	removeAllBoundaries(): void;

	removeBoundaryWithIdentifier(identifier: any): void;

	removeItem(item: UIDynamicItem): void;

	setTranslatesReferenceBoundsIntoBoundaryWithInsets(insets: UIEdgeInsets): void;
}

interface UICollisionBehaviorDelegate extends NSObjectProtocol {

	collisionBehaviorBeganContactForItemWithBoundaryIdentifierAtPoint?(behavior: UICollisionBehavior, item: UIDynamicItem, identifier: any, p: CGPoint): void;

	collisionBehaviorBeganContactForItemWithItemAtPoint?(behavior: UICollisionBehavior, item1: UIDynamicItem, item2: UIDynamicItem, p: CGPoint): void;

	collisionBehaviorEndedContactForItemWithBoundaryIdentifier?(behavior: UICollisionBehavior, item: UIDynamicItem, identifier: any): void;

	collisionBehaviorEndedContactForItemWithItem?(behavior: UICollisionBehavior, item1: UIDynamicItem, item2: UIDynamicItem): void;
}
declare var UICollisionBehaviorDelegate: {

	prototype: UICollisionBehaviorDelegate;
};

/**
 * @since 7.0
 */
declare const enum UICollisionBehaviorMode {

	Items = 1,

	Boundaries = 2,

	Everything = -1
}

/**
 * @since 2.0
 */
declare class UIColor extends NSObject implements NSCopying, NSItemProviderReading, NSItemProviderWriting, NSSecureCoding {

	static alloc(): UIColor; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	static colorNamed(name: string): UIColor;

	/**
	 * @since 11.0
	 */
	static colorNamedInBundleCompatibleWithTraitCollection(name: string, bundle: NSBundle, traitCollection: UITraitCollection): UIColor;

	static colorWithCGColor(cgColor: any): UIColor;

	/**
	 * @since 5.0
	 */
	static colorWithCIColor(ciColor: CIColor): UIColor;

	/**
	 * @since 10.0
	 */
	static colorWithDisplayP3RedGreenBlueAlpha(displayP3Red: number, green: number, blue: number, alpha: number): UIColor;

	/**
	 * @since 13.0
	 */
	static colorWithDynamicProvider(dynamicProvider: (p1: UITraitCollection) => UIColor): UIColor;

	static colorWithHueSaturationBrightnessAlpha(hue: number, saturation: number, brightness: number, alpha: number): UIColor;

	static colorWithPatternImage(image: UIImage): UIColor;

	static colorWithRedGreenBlueAlpha(red: number, green: number, blue: number, alpha: number): UIColor;

	static colorWithWhiteAlpha(white: number, alpha: number): UIColor;

	static itemProviderVisibilityForRepresentationWithTypeIdentifier(typeIdentifier: string): NSItemProviderRepresentationVisibility;

	static new(): UIColor; // inherited from NSObject

	static objectWithItemProviderDataTypeIdentifierError(data: NSData, typeIdentifier: string): UIColor;

	readonly CGColor: any;

	/**
	 * @since 5.0
	 */
	readonly CIColor: CIColor;

	/**
	 * @since 14.0
	 */
	readonly accessibilityName: string;

	/**
	 * @since 18.0
	 */
	readonly prominence: UIColorProminence;

	static readonly blackColor: UIColor;

	static readonly blueColor: UIColor;

	static readonly brownColor: UIColor;

	static readonly clearColor: UIColor;

	static readonly cyanColor: UIColor;

	static readonly darkGrayColor: UIColor;

	static readonly darkTextColor: UIColor;

	static readonly grayColor: UIColor;

	static readonly greenColor: UIColor;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	static readonly groupTableViewBackgroundColor: UIColor;

	/**
	 * @since 13.0
	 */
	static readonly labelColor: UIColor;

	static readonly lightGrayColor: UIColor;

	static readonly lightTextColor: UIColor;

	/**
	 * @since 13.0
	 */
	static readonly linkColor: UIColor;

	static readonly magentaColor: UIColor;

	/**
	 * @since 13.0
	 */
	static readonly opaqueSeparatorColor: UIColor;

	static readonly orangeColor: UIColor;

	/**
	 * @since 13.0
	 */
	static readonly placeholderTextColor: UIColor;

	static readonly purpleColor: UIColor;

	/**
	 * @since 13.0
	 */
	static readonly quaternaryLabelColor: UIColor;

	/**
	 * @since 13.0
	 */
	static readonly quaternarySystemFillColor: UIColor;

	static readonly redColor: UIColor;

	/**
	 * @since 3.2
	 * @deprecated 7.0
	 */
	static readonly scrollViewTexturedBackgroundColor: UIColor;

	/**
	 * @since 13.0
	 */
	static readonly secondaryLabelColor: UIColor;

	/**
	 * @since 13.0
	 */
	static readonly secondarySystemBackgroundColor: UIColor;

	/**
	 * @since 13.0
	 */
	static readonly secondarySystemFillColor: UIColor;

	/**
	 * @since 13.0
	 */
	static readonly secondarySystemGroupedBackgroundColor: UIColor;

	/**
	 * @since 13.0
	 */
	static readonly separatorColor: UIColor;

	/**
	 * @since 13.0
	 */
	static readonly systemBackgroundColor: UIColor;

	/**
	 * @since 7.0
	 */
	static readonly systemBlueColor: UIColor;

	/**
	 * @since 13.0
	 */
	static readonly systemBrownColor: UIColor;

	/**
	 * @since 15.0
	 */
	static readonly systemCyanColor: UIColor;

	/**
	 * @since 13.0
	 */
	static readonly systemFillColor: UIColor;

	/**
	 * @since 13.0
	 */
	static readonly systemGray2Color: UIColor;

	/**
	 * @since 13.0
	 */
	static readonly systemGray3Color: UIColor;

	/**
	 * @since 13.0
	 */
	static readonly systemGray4Color: UIColor;

	/**
	 * @since 13.0
	 */
	static readonly systemGray5Color: UIColor;

	/**
	 * @since 13.0
	 */
	static readonly systemGray6Color: UIColor;

	/**
	 * @since 7.0
	 */
	static readonly systemGrayColor: UIColor;

	/**
	 * @since 7.0
	 */
	static readonly systemGreenColor: UIColor;

	/**
	 * @since 13.0
	 */
	static readonly systemGroupedBackgroundColor: UIColor;

	/**
	 * @since 13.0
	 */
	static readonly systemIndigoColor: UIColor;

	/**
	 * @since 15.0
	 */
	static readonly systemMintColor: UIColor;

	/**
	 * @since 7.0
	 */
	static readonly systemOrangeColor: UIColor;

	/**
	 * @since 7.0
	 */
	static readonly systemPinkColor: UIColor;

	/**
	 * @since 9.0
	 */
	static readonly systemPurpleColor: UIColor;

	/**
	 * @since 7.0
	 */
	static readonly systemRedColor: UIColor;

	/**
	 * @since 7.0
	 */
	static readonly systemTealColor: UIColor;

	/**
	 * @since 7.0
	 */
	static readonly systemYellowColor: UIColor;

	/**
	 * @since 13.0
	 */
	static readonly tertiaryLabelColor: UIColor;

	/**
	 * @since 13.0
	 */
	static readonly tertiarySystemBackgroundColor: UIColor;

	/**
	 * @since 13.0
	 */
	static readonly tertiarySystemFillColor: UIColor;

	/**
	 * @since 13.0
	 */
	static readonly tertiarySystemGroupedBackgroundColor: UIColor;

	/**
	 * @since 15.0
	 */
	static readonly tintColor: UIColor;

	/**
	 * @since 5.0
	 * @deprecated 7.0
	 */
	static readonly underPageBackgroundColor: UIColor;

	/**
	 * @since 2.0
	 * @deprecated 7.0
	 */
	static readonly viewFlipsideBackgroundColor: UIColor;

	static readonly whiteColor: UIColor;

	static readonly yellowColor: UIColor;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly writableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderWriting

	readonly  // inherited from NSObjectProtocol

	static readonly readableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderReading

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	static readonly writableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderWriting

	constructor(o: { CGColor: any; });

	/**
	 * @since 5.0
	 */
	constructor(o: { CIColor: CIColor; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 10.0
	 */
	constructor(o: { displayP3Red: number; green: number; blue: number; alpha: number; });

	/**
	 * @since 13.0
	 */
	constructor(o: { dynamicProvider: (p1: UITraitCollection) => UIColor; });

	constructor(o: { hue: number; saturation: number; brightness: number; alpha: number; });

	constructor(o: { patternImage: UIImage; });

	constructor(o: { red: number; green: number; blue: number; alpha: number; });

	constructor(o: { white: number; alpha: number; });

	class(): typeof NSObject;

	colorWithAlphaComponent(alpha: number): UIColor;

	/**
	 * @since 18.0
	 */
	colorWithProminence(prominence: UIColorProminence): UIColor;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 5.0
	 */
	getHueSaturationBrightnessAlpha(hue: interop.Pointer | interop.Reference<number>, saturation: interop.Pointer | interop.Reference<number>, brightness: interop.Pointer | interop.Reference<number>, alpha: interop.Pointer | interop.Reference<number>): boolean;

	/**
	 * @since 5.0
	 */
	getRedGreenBlueAlpha(red: interop.Pointer | interop.Reference<number>, green: interop.Pointer | interop.Reference<number>, blue: interop.Pointer | interop.Reference<number>, alpha: interop.Pointer | interop.Reference<number>): boolean;

	/**
	 * @since 5.0
	 */
	getWhiteAlpha(white: interop.Pointer | interop.Reference<number>, alpha: interop.Pointer | interop.Reference<number>): boolean;

	initWithCGColor(cgColor: any): this;

	/**
	 * @since 5.0
	 */
	initWithCIColor(ciColor: CIColor): this;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 10.0
	 */
	initWithDisplayP3RedGreenBlueAlpha(displayP3Red: number, green: number, blue: number, alpha: number): this;

	/**
	 * @since 13.0
	 */
	initWithDynamicProvider(dynamicProvider: (p1: UITraitCollection) => UIColor): this;

	initWithHueSaturationBrightnessAlpha(hue: number, saturation: number, brightness: number, alpha: number): this;

	initWithPatternImage(image: UIImage): this;

	initWithRedGreenBlueAlpha(red: number, green: number, blue: number, alpha: number): this;

	initWithWhiteAlpha(white: number, alpha: number): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	itemProviderVisibilityForRepresentationWithTypeIdentifier(typeIdentifier: string): NSItemProviderRepresentationVisibility;

	loadDataWithTypeIdentifierForItemProviderCompletionHandler(typeIdentifier: string, completionHandler: (p1: NSData, p2: NSError) => void): NSProgress;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	/**
	 * @since 13.0
	 */
	resolvedColorWithTraitCollection(traitCollection: UITraitCollection): UIColor;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	set(): void;

	setFill(): void;

	setStroke(): void;
}

/**
 * @since 14.0
 */
declare class UIColorPickerViewController extends UIViewController {

	static alloc(): UIColorPickerViewController; // inherited from NSObject

	static new(): UIColorPickerViewController; // inherited from NSObject

	delegate: UIColorPickerViewControllerDelegate;

	selectedColor: UIColor;

	supportsAlpha: boolean;
}

/**
 * @since 14.0
 */
interface UIColorPickerViewControllerDelegate extends NSObjectProtocol {

	colorPickerViewControllerDidFinish?(viewController: UIColorPickerViewController): void;

	/**
	 * @since 14.0
	 * @deprecated 15.0
	 */
	colorPickerViewControllerDidSelectColor?(viewController: UIColorPickerViewController): void;

	/**
	 * @since 15.0
	 */
	colorPickerViewControllerDidSelectColorContinuously?(viewController: UIColorPickerViewController, color: UIColor, continuously: boolean): void;
}
declare var UIColorPickerViewControllerDelegate: {

	prototype: UIColorPickerViewControllerDelegate;
};

/**
 * @since 18.0
 */
declare const enum UIColorProminence {

	Primary = 0,

	Secondary = 1,

	Tertiary = 2,

	Quaternary = 3
}

/**
 * @since 14.0
 */
declare class UIColorWell extends UIControl {

	static alloc(): UIColorWell; // inherited from NSObject

	static appearance(): UIColorWell; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIColorWell; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIColorWell; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIColorWell; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIColorWell; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIColorWell; // inherited from UIAppearance

	static new(): UIColorWell; // inherited from NSObject

	selectedColor: UIColor;

	supportsAlpha: boolean;

	title: string;
}

/**
 * @since 13.0
 */
declare class UICommand extends UIMenuElement implements UIMenuLeaf {

	static alloc(): UICommand; // inherited from NSObject

	static commandWithTitleImageActionPropertyList(title: string, image: UIImage, action: string, propertyList: any): UICommand;

	static commandWithTitleImageActionPropertyListAlternates(title: string, image: UIImage, action: string, propertyList: any, alternates: NSArray<UICommandAlternate> | UICommandAlternate[]): UICommand;

	static new(): UICommand; // inherited from NSObject

	readonly action: string;

	readonly alternates: NSArray<UICommandAlternate>;

	readonly propertyList: any;

	attributes: UIMenuElementAttributes; // inherited from UIMenuLeaf

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	discoverabilityTitle: string; // inherited from UIMenuLeaf

	readonly hash: number; // inherited from NSObjectProtocol

	image: UIImage; // inherited from UIMenuLeaf

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	/**
	 * @since 16.0
	 */
	readonly presentationSourceItem: UIPopoverPresentationControllerSourceItem; // inherited from UIMenuLeaf

	/**
	 * @since 17.0
	 */
	selectedImage: UIImage; // inherited from UIMenuLeaf

	readonly sender: any; // inherited from UIMenuLeaf

	state: UIMenuElementState; // inherited from UIMenuLeaf

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	title: string; // inherited from UIMenuLeaf

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	performWithSenderTarget(sender: any, target: any): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 13.0
 */
declare class UICommandAlternate extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UICommandAlternate; // inherited from NSObject

	static alternateWithTitleActionModifierFlags(title: string, action: string, modifierFlags: UIKeyModifierFlags): UICommandAlternate;

	static new(): UICommandAlternate; // inherited from NSObject

	readonly action: string;

	readonly modifierFlags: UIKeyModifierFlags;

	readonly title: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.0
 */
declare var UICommandTagShare: string;

/**
 * @since 14.0
 */
declare var UIConfigurationColorTransformerGrayscale: (p1: UIColor) => UIColor;

/**
 * @since 14.0
 */
declare var UIConfigurationColorTransformerMonochromeTint: (p1: UIColor) => UIColor;

/**
 * @since 14.0
 */
declare var UIConfigurationColorTransformerPreferredTint: (p1: UIColor) => UIColor;

/**
 * @since 14.0
 */
interface UIConfigurationState extends NSCopying, NSObjectProtocol, NSSecureCoding {

	traitCollection: UITraitCollection;

	customStateForKey(key: string): any;

	initWithTraitCollection?(traitCollection: UITraitCollection): UIConfigurationState;

	objectForKeyedSubscript(key: string): any;

	setCustomStateForKey(customState: any, key: string): void;

	setObjectForKeyedSubscript(obj: any, key: string): void;
}
declare var UIConfigurationState: {

	prototype: UIConfigurationState;
};

/**
 * @since 14.0
 */
interface UIContentConfiguration extends NSCopying, NSObjectProtocol {

	makeContentView(): UIView & UIContentView;

	updatedConfigurationForState(state: UIConfigurationState): UIContentConfiguration;
}
declare var UIContentConfiguration: {

	prototype: UIContentConfiguration;
};

interface UIContentContainer extends NSObjectProtocol {

	/**
	 * @since 8.0
	 */
	preferredContentSize: CGSize;

	/**
	 * @since 8.0
	 */
	preferredContentSizeDidChangeForChildContentContainer(container: UIContentContainer): void;

	/**
	 * @since 8.0
	 */
	sizeForChildContentContainerWithParentContainerSize(container: UIContentContainer, parentSize: CGSize): CGSize;

	/**
	 * @since 8.0
	 */
	systemLayoutFittingSizeDidChangeForChildContentContainer(container: UIContentContainer): void;

	/**
	 * @since 8.0
	 */
	viewWillTransitionToSizeWithTransitionCoordinator(size: CGSize, coordinator: UIViewControllerTransitionCoordinator): void;

	/**
	 * @since 8.0
	 */
	willTransitionToTraitCollectionWithTransitionCoordinator(newCollection: UITraitCollection, coordinator: UIViewControllerTransitionCoordinator): void;
}
declare var UIContentContainer: {

	prototype: UIContentContainer;
};

/**
 * @since 14.0
 */
declare const enum UIContentInsetsReference {

	Automatic = 0,

	None = 1,

	SafeArea = 2,

	LayoutMargins = 3,

	ReadableContent = 4
}

/**
 * @since 7.0
 */
declare var UIContentSizeCategoryAccessibilityExtraExtraExtraLarge: string;

/**
 * @since 7.0
 */
declare var UIContentSizeCategoryAccessibilityExtraExtraLarge: string;

/**
 * @since 7.0
 */
declare var UIContentSizeCategoryAccessibilityExtraLarge: string;

/**
 * @since 7.0
 */
declare var UIContentSizeCategoryAccessibilityLarge: string;

/**
 * @since 7.0
 */
declare var UIContentSizeCategoryAccessibilityMedium: string;

/**
 * @since 10.0
 */
interface UIContentSizeCategoryAdjusting extends NSObjectProtocol {

	adjustsFontForContentSizeCategory: boolean;
}
declare var UIContentSizeCategoryAdjusting: {

	prototype: UIContentSizeCategoryAdjusting;
};

/**
 * @since 11.0
 */
declare function UIContentSizeCategoryCompareToCategory(lhs: string, rhs: string): NSComparisonResult;

/**
 * @since 7.0
 */
declare var UIContentSizeCategoryDidChangeNotification: string;

/**
 * @since 7.0
 */
declare var UIContentSizeCategoryExtraExtraExtraLarge: string;

/**
 * @since 7.0
 */
declare var UIContentSizeCategoryExtraExtraLarge: string;

/**
 * @since 7.0
 */
declare var UIContentSizeCategoryExtraLarge: string;

/**
 * @since 7.0
 */
declare var UIContentSizeCategoryExtraSmall: string;

/**
 * @since 11.0
 */
declare function UIContentSizeCategoryIsAccessibilityCategory(category: string): boolean;

/**
 * @since 7.0
 */
declare var UIContentSizeCategoryLarge: string;

/**
 * @since 7.0
 */
declare var UIContentSizeCategoryMedium: string;

/**
 * @since 7.0
 */
declare var UIContentSizeCategoryNewValueKey: string;

/**
 * @since 7.0
 */
declare var UIContentSizeCategorySmall: string;

/**
 * @since 10.0
 */
declare var UIContentSizeCategoryUnspecified: string;

/**
 * @since 17.0
 */
declare const enum UIContentUnavailableAlignment {

	Center = 0,

	Natural = 1
}

/**
 * @since 17.0
 */
declare class UIContentUnavailableButtonProperties extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UIContentUnavailableButtonProperties; // inherited from NSObject

	static new(): UIContentUnavailableButtonProperties; // inherited from NSObject

	enabled: boolean;

	menu: UIMenu;

	primaryAction: UIAction;

	role: UIButtonRole;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 17.0
 */
declare class UIContentUnavailableConfiguration extends NSObject implements NSSecureCoding, UIContentConfiguration {

	static alloc(): UIContentUnavailableConfiguration; // inherited from NSObject

	static emptyConfiguration(): UIContentUnavailableConfiguration;

	static loadingConfiguration(): UIContentUnavailableConfiguration;

	static new(): UIContentUnavailableConfiguration; // inherited from NSObject

	static searchConfiguration(): UIContentUnavailableConfiguration;

	alignment: UIContentUnavailableAlignment;

	attributedText: NSAttributedString;

	axesPreservingSuperviewLayoutMargins: UIAxis;

	background: UIBackgroundConfiguration;

	button: UIButtonConfiguration;

	readonly buttonProperties: UIContentUnavailableButtonProperties;

	buttonToSecondaryButtonPadding: number;

	directionalLayoutMargins: NSDirectionalEdgeInsets;

	image: UIImage;

	readonly imageProperties: UIContentUnavailableImageProperties;

	imageToTextPadding: number;

	secondaryAttributedText: NSAttributedString;

	secondaryButton: UIButtonConfiguration;

	readonly secondaryButtonProperties: UIContentUnavailableButtonProperties;

	secondaryText: string;

	readonly secondaryTextProperties: UIContentUnavailableTextProperties;

	text: string;

	readonly textProperties: UIContentUnavailableTextProperties;

	textToButtonPadding: number;

	textToSecondaryTextPadding: number;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	makeContentView(): UIView & UIContentView;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	updatedConfigurationForState(state: UIConfigurationState): this;
}

/**
 * @since 17.0
 */
declare class UIContentUnavailableConfigurationState extends NSObject implements UIConfigurationState {

	static alloc(): UIContentUnavailableConfigurationState; // inherited from NSObject

	static new(): UIContentUnavailableConfigurationState; // inherited from NSObject

	searchText: string;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	traitCollection: UITraitCollection; // inherited from UIConfigurationState

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { traitCollection: UITraitCollection; }); // inherited from UIConfigurationState

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	customStateForKey(key: string): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTraitCollection(traitCollection: UITraitCollection): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	objectForKeyedSubscript(key: string): any;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	setCustomStateForKey(customState: any, key: string): void;

	setObjectForKeyedSubscript(obj: any, key: string): void;
}

/**
 * @since 17.0
 */
declare class UIContentUnavailableImageProperties extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UIContentUnavailableImageProperties; // inherited from NSObject

	static new(): UIContentUnavailableImageProperties; // inherited from NSObject

	accessibilityIgnoresInvertColors: boolean;

	cornerRadius: number;

	maximumSize: CGSize;

	preferredSymbolConfiguration: UIImageSymbolConfiguration;

	tintColor: UIColor;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 17.0
 */
declare class UIContentUnavailableTextProperties extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UIContentUnavailableTextProperties; // inherited from NSObject

	static new(): UIContentUnavailableTextProperties; // inherited from NSObject

	adjustsFontSizeToFitWidth: boolean;

	allowsDefaultTighteningForTruncation: boolean;

	color: UIColor;

	font: UIFont;

	lineBreakMode: NSLineBreakMode;

	minimumScaleFactor: number;

	numberOfLines: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 17.0
 */
declare class UIContentUnavailableView extends UIView implements UIContentView {

	static alloc(): UIContentUnavailableView; // inherited from NSObject

	static appearance(): UIContentUnavailableView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIContentUnavailableView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIContentUnavailableView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIContentUnavailableView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIContentUnavailableView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIContentUnavailableView; // inherited from UIAppearance

	static new(): UIContentUnavailableView; // inherited from NSObject

	configuration: UIContentUnavailableConfiguration;

	scrollEnabled: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { configuration: UIContentUnavailableConfiguration; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithConfiguration(configuration: UIContentUnavailableConfiguration): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 16.0
	 */
	supportsConfiguration(configuration: UIContentConfiguration): boolean;
}

/**
 * @since 14.0
 */
interface UIContentView extends NSObjectProtocol {

	configuration: UIContentConfiguration;

	/**
	 * @since 16.0
	 */
	supportsConfiguration?(configuration: UIContentConfiguration): boolean;
}
declare var UIContentView: {

	prototype: UIContentView;
};

/**
 * @since 13.0
 */
declare class UIContextMenuConfiguration extends NSObject {

	static alloc(): UIContextMenuConfiguration; // inherited from NSObject

	static configurationWithIdentifierPreviewProviderActionProvider(identifier: any, previewProvider: () => UIViewController, actionProvider: (p1: NSArray<UIMenuElement>) => UIMenu): UIContextMenuConfiguration;

	static new(): UIContextMenuConfiguration; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	badgeCount: number;

	readonly identifier: any;

	/**
	 * @since 16.0
	 */
	preferredMenuElementOrder: UIContextMenuConfigurationElementOrder;

	/**
	 * @since 16.0
	 */
	secondaryItemIdentifiers: NSSet<any>;
}

/**
 * @since 16.0
 */
declare const enum UIContextMenuConfigurationElementOrder {

	Automatic = 0,

	Priority = 1,

	Fixed = 2
}

/**
 * @since 13.0
 */
declare class UIContextMenuInteraction extends NSObject implements UIInteraction {

	static alloc(): UIContextMenuInteraction; // inherited from NSObject

	static new(): UIContextMenuInteraction; // inherited from NSObject

	readonly delegate: UIContextMenuInteractionDelegate;

	/**
	 * @since 14.0
	 */
	readonly menuAppearance: UIContextMenuInteractionAppearance;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly view: UIView; // inherited from UIInteraction

	readonly  // inherited from NSObjectProtocol

	constructor(o: { delegate: UIContextMenuInteractionDelegate; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	didMoveToView(view: UIView): void;

	dismissMenu(): void;

	initWithDelegate(delegate: UIContextMenuInteractionDelegate): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	locationInView(view: UIView): CGPoint;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 14.0
	 */
	updateVisibleMenuWithBlock(block: (p1: UIMenu) => UIMenu): void;

	willMoveToView(view: UIView): void;
}

/**
 * @since 13.0
 */
interface UIContextMenuInteractionAnimating extends NSObjectProtocol {

	previewViewController: UIViewController;

	addAnimations(animations: () => void): void;

	addCompletion(completion: () => void): void;
}
declare var UIContextMenuInteractionAnimating: {

	prototype: UIContextMenuInteractionAnimating;
};

/**
 * @since 14.0
 */
declare const enum UIContextMenuInteractionAppearance {

	Unknown = 0,

	Rich = 1,

	Compact = 2
}

/**
 * @since 13.0
 */
interface UIContextMenuInteractionCommitAnimating extends UIContextMenuInteractionAnimating {

	preferredCommitStyle: UIContextMenuInteractionCommitStyle;
}
declare var UIContextMenuInteractionCommitAnimating: {

	prototype: UIContextMenuInteractionCommitAnimating;
};

/**
 * @since 13.0
 */
declare const enum UIContextMenuInteractionCommitStyle {

	Dismiss = 0,

	Pop = 1
}

/**
 * @since 13.0
 */
interface UIContextMenuInteractionDelegate extends NSObjectProtocol {

	/**
	 * @since 16.0
	 */
	contextMenuInteractionConfigurationDismissalPreviewForItemWithIdentifier?(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration, identifier: any): UITargetedPreview;

	contextMenuInteractionConfigurationForMenuAtLocation(interaction: UIContextMenuInteraction, location: CGPoint): UIContextMenuConfiguration;

	/**
	 * @since 16.0
	 */
	contextMenuInteractionConfigurationHighlightPreviewForItemWithIdentifier?(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration, identifier: any): UITargetedPreview;

	/**
	 * @since 13.0
	 * @deprecated 16.0
	 */
	contextMenuInteractionPreviewForDismissingMenuWithConfiguration?(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration): UITargetedPreview;

	/**
	 * @since 13.0
	 * @deprecated 16.0
	 */
	contextMenuInteractionPreviewForHighlightingMenuWithConfiguration?(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration): UITargetedPreview;

	contextMenuInteractionWillDisplayMenuForConfigurationAnimator?(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionAnimating): void;

	contextMenuInteractionWillEndForConfigurationAnimator?(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionAnimating): void;

	contextMenuInteractionWillPerformPreviewActionForMenuWithConfigurationAnimator?(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionCommitAnimating): void;
}
declare var UIContextMenuInteractionDelegate: {

	prototype: UIContextMenuInteractionDelegate;
};

/**
 * @since 11.0
 */
declare class UIContextualAction extends NSObject {

	static alloc(): UIContextualAction; // inherited from NSObject

	static contextualActionWithStyleTitleHandler(style: UIContextualActionStyle, title: string, handler: (p1: UIContextualAction, p2: UIView, p3: (p1: boolean) => void) => void): UIContextualAction;

	static new(): UIContextualAction; // inherited from NSObject

	backgroundColor: UIColor;

	readonly handler: (p1: UIContextualAction, p2: UIView, p3: (p1: boolean) => void) => void;

	image: UIImage;

	readonly style: UIContextualActionStyle;

	title: string;
}

/**
 * @since 11.0
 */
declare const enum UIContextualActionStyle {

	Normal = 0,

	Destructive = 1
}

/**
 * @since 2.0
 */
declare class UIControl extends UIView implements UIContextMenuInteractionDelegate {

	static alloc(): UIControl; // inherited from NSObject

	static appearance(): UIControl; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIControl; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIControl; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIControl; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIControl; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIControl; // inherited from UIAppearance

	static new(): UIControl; // inherited from NSObject

	readonly allControlEvents: UIControlEvents;

	readonly allTargets: NSSet<any>;

	contentHorizontalAlignment: UIControlContentHorizontalAlignment;

	contentVerticalAlignment: UIControlContentVerticalAlignment;

	/**
	 * @since 14.0
	 */
	readonly contextMenuInteraction: UIContextMenuInteraction;

	/**
	 * @since 14.0
	 */
	contextMenuInteractionEnabled: boolean;

	readonly effectiveContentHorizontalAlignment: UIControlContentHorizontalAlignment;

	enabled: boolean;

	highlighted: boolean;

	selected: boolean;

	/**
	 * @since 14.0
	 */
	showsMenuAsPrimaryAction: boolean;

	readonly state: UIControlState;

	/**
	 * @since 17.0
	 */
	symbolAnimationEnabled: boolean;

	/**
	 * @since 15.0
	 */
	toolTip: string;

	/**
	 * @since 15.0
	 */
	readonly toolTipInteraction: UIToolTipInteraction;

	readonly touchInside: boolean;

	readonly tracking: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	/**
	 * @since 14.0
	 */
	constructor(o: { frame: CGRect; primaryAction: UIAction; });

	actionsForTargetForControlEvent(target: any, controlEvent: UIControlEvents): NSArray<string>;

	/**
	 * @since 14.0
	 */
	addActionForControlEvents(action: UIAction, controlEvents: UIControlEvents): void;

	addTargetActionForControlEvents(target: any, action: string, controlEvents: UIControlEvents): void;

	beginTrackingWithTouchWithEvent(touch: UITouch, event: _UIEvent): boolean;

	cancelTrackingWithEvent(event: _UIEvent): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 16.0
	 */
	contextMenuInteractionConfigurationDismissalPreviewForItemWithIdentifier(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration, identifier: any): UITargetedPreview;

	contextMenuInteractionConfigurationForMenuAtLocation(interaction: UIContextMenuInteraction, location: CGPoint): UIContextMenuConfiguration;

	/**
	 * @since 16.0
	 */
	contextMenuInteractionConfigurationHighlightPreviewForItemWithIdentifier(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration, identifier: any): UITargetedPreview;

	/**
	 * @since 13.0
	 * @deprecated 16.0
	 */
	contextMenuInteractionPreviewForDismissingMenuWithConfiguration(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration): UITargetedPreview;

	/**
	 * @since 13.0
	 * @deprecated 16.0
	 */
	contextMenuInteractionPreviewForHighlightingMenuWithConfiguration(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration): UITargetedPreview;

	contextMenuInteractionWillDisplayMenuForConfigurationAnimator(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionAnimating): void;

	contextMenuInteractionWillEndForConfigurationAnimator(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionAnimating): void;

	contextMenuInteractionWillPerformPreviewActionForMenuWithConfigurationAnimator(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionCommitAnimating): void;

	continueTrackingWithTouchWithEvent(touch: UITouch, event: _UIEvent): boolean;

	endTrackingWithTouchWithEvent(touch: UITouch, event: _UIEvent): void;

	/**
	 * @since 14.0
	 */
	enumerateEventHandlers(iterator: (p1: UIAction, p2: any, p3: string, p4: UIControlEvents, p5: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 14.0
	 */
	initWithFramePrimaryAction(frame: CGRect, primaryAction: UIAction): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	/**
	 * @since 14.0
	 */
	menuAttachmentPointForConfiguration(configuration: UIContextMenuConfiguration): CGPoint;

	/**
	 * @since 17.4
	 */
	performPrimaryAction(): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	/**
	 * @since 14.0
	 */
	removeActionForControlEvents(action: UIAction, controlEvents: UIControlEvents): void;

	/**
	 * @since 14.0
	 */
	removeActionForIdentifierForControlEvents(actionIdentifier: string, controlEvents: UIControlEvents): void;

	removeTargetActionForControlEvents(target: any, action: string, controlEvents: UIControlEvents): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 14.0
	 */
	sendAction(action: UIAction): void;

	sendActionToForEvent(action: string, target: any, event: _UIEvent): void;

	sendActionsForControlEvents(controlEvents: UIControlEvents): void;
}

declare const enum UIControlContentHorizontalAlignment {

	Center = 0,

	Left = 1,

	Right = 2,

	Fill = 3,

	Leading = 4,

	Trailing = 5
}

declare const enum UIControlContentVerticalAlignment {

	Center = 0,

	Top = 1,

	Bottom = 2,

	Fill = 3
}

declare const enum UIControlEvents {

	TouchDown = 1,

	TouchDownRepeat = 2,

	TouchDragInside = 4,

	TouchDragOutside = 8,

	TouchDragEnter = 16,

	TouchDragExit = 32,

	TouchUpInside = 64,

	TouchUpOutside = 128,

	TouchCancel = 256,

	ValueChanged = 4096,

	PrimaryActionTriggered = 8192,

	MenuActionTriggered = 16384,

	EditingDidBegin = 65536,

	EditingChanged = 131072,

	EditingDidEnd = 262144,

	EditingDidEndOnExit = 524288,

	AllTouchEvents = 4095,

	AllEditingEvents = 983040,

	ApplicationReserved = 251658240,

	SystemReserved = 4026531840,

	AllEvents = 4294967295
}

declare const enum UIControlState {

	Normal = 0,

	Highlighted = 1,

	Disabled = 2,

	Selected = 4,

	Focused = 8,

	Application = 16711680,

	Reserved = 4278190080
}

interface UICoordinateSpace extends NSObjectProtocol {

	/**
	 * @since 8.0
	 */
	bounds: CGRect;

	/**
	 * @since 8.0
	 */
	convertPointFromCoordinateSpace(point: CGPoint, coordinateSpace: UICoordinateSpace): CGPoint;

	/**
	 * @since 8.0
	 */
	convertPointToCoordinateSpace(point: CGPoint, coordinateSpace: UICoordinateSpace): CGPoint;

	/**
	 * @since 8.0
	 */
	convertRectFromCoordinateSpace(rect: CGRect, coordinateSpace: UICoordinateSpace): CGRect;

	/**
	 * @since 8.0
	 */
	convertRectToCoordinateSpace(rect: CGRect, coordinateSpace: UICoordinateSpace): CGRect;
}
declare var UICoordinateSpace: {

	prototype: UICoordinateSpace;
};

declare const enum UICornerCurve {

	Automatic = 0,

	Circular = 1,

	Continuous = 2
}

/**
 * @since 10.0
 */
declare class UICubicTimingParameters extends NSObject implements UITimingCurveProvider {

	static alloc(): UICubicTimingParameters; // inherited from NSObject

	static new(): UICubicTimingParameters; // inherited from NSObject

	readonly animationCurve: UIViewAnimationCurve;

	readonly controlPoint1: CGPoint;

	readonly controlPoint2: CGPoint;

	readonly cubicTimingParameters: UICubicTimingParameters; // inherited from UITimingCurveProvider

	readonly springTimingParameters: UISpringTimingParameters; // inherited from UITimingCurveProvider

	readonly timingCurveType: UITimingCurveType; // inherited from UITimingCurveProvider

	constructor(o: { animationCurve: UIViewAnimationCurve; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { controlPoint1: CGPoint; controlPoint2: CGPoint; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithAnimationCurve(curve: UIViewAnimationCurve): this;

	initWithCoder(coder: NSCoder): this;

	initWithControlPoint1ControlPoint2(point1: CGPoint, point2: CGPoint): this;
}

declare const enum UIDataDetectorTypes {

	PhoneNumber = 1,

	Link = 2,

	Address = 4,

	CalendarEvent = 8,

	ShipmentTrackingNumber = 16,

	FlightNumber = 32,

	LookupSuggestion = 64,

	Money = 128,

	PhysicalValue = 256,

	None = 0,

	All = -1
}

interface UIDataSourceModelAssociation {

	indexPathForElementWithModelIdentifierInView(identifier: string, view: UIView): NSIndexPath;

	modelIdentifierForElementAtIndexPathInView(idx: NSIndexPath, view: UIView): string;
}
declare var UIDataSourceModelAssociation: {

	prototype: UIDataSourceModelAssociation;
};

/**
 * @since 11.0
 */
interface UIDataSourceTranslating extends NSObjectProtocol {

	dataSourceIndexPathForPresentationIndexPath(presentationIndexPath: NSIndexPath): NSIndexPath;

	dataSourceSectionIndexForPresentationSectionIndex(presentationSectionIndex: number): number;

	performUsingPresentationValues(actionsToTranslate: () => void): void;

	presentationIndexPathForDataSourceIndexPath(dataSourceIndexPath: NSIndexPath): NSIndexPath;

	presentationSectionIndexForDataSourceSectionIndex(dataSourceSectionIndex: number): number;
}
declare var UIDataSourceTranslating: {

	prototype: UIDataSourceTranslating;
};

/**
 * @since 2.0
 */
declare class UIDatePicker extends UIControl implements NSCoding {

	static alloc(): UIDatePicker; // inherited from NSObject

	static appearance(): UIDatePicker; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIDatePicker; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIDatePicker; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIDatePicker; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIDatePicker; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIDatePicker; // inherited from UIAppearance

	static new(): UIDatePicker; // inherited from NSObject

	calendar: NSCalendar;

	countDownDuration: number;

	date: Date;

	datePickerMode: UIDatePickerMode;

	/**
	 * @since 13.4
	 */
	readonly datePickerStyle: UIDatePickerStyle;

	locale: NSLocale;

	maximumDate: Date;

	minimumDate: Date;

	minuteInterval: number;

	/**
	 * @since 13.4
	 */
	preferredDatePickerStyle: UIDatePickerStyle;

	/**
	 * @since 15.0
	 */
	roundsToMinuteInterval: boolean;

	timeZone: NSTimeZone;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	setDateAnimated(date: Date, animated: boolean): void;
}

declare const enum UIDatePickerMode {

	Time = 0,

	Date = 1,

	DateAndTime = 2,

	CountDownTimer = 3,

	YearAndMonth = 4
}

/**
 * @since 13.4
 */
declare const enum UIDatePickerStyle {

	Automatic = 0,

	Wheels = 1,

	Compact = 2,

	Inline = 3
}

/**
 * @since 14.0
 */
declare class UIDeferredMenuElement extends UIMenuElement {

	static alloc(): UIDeferredMenuElement; // inherited from NSObject

	static elementWithProvider(elementProvider: (p1: (p1: NSArray<UIMenuElement>) => void) => void): UIDeferredMenuElement;

	/**
	 * @since 15.0
	 */
	static elementWithUncachedProvider(elementProvider: (p1: (p1: NSArray<UIMenuElement>) => void) => void): UIDeferredMenuElement;

	static new(): UIDeferredMenuElement; // inherited from NSObject
}

/**
 * @since 2.0
 */
declare class UIDevice extends NSObject {

	static alloc(): UIDevice; // inherited from NSObject

	static new(): UIDevice; // inherited from NSObject

	/**
	 * @since 3.0
	 */
	readonly batteryLevel: number;

	/**
	 * @since 3.0
	 */
	batteryMonitoringEnabled: boolean;

	/**
	 * @since 3.0
	 */
	readonly batteryState: UIDeviceBatteryState;

	readonly generatesDeviceOrientationNotifications: boolean;

	/**
	 * @since 6.0
	 */
	readonly identifierForVendor: NSUUID;

	readonly localizedModel: string;

	readonly model: string;

	/**
	 * @since 4.0
	 */
	readonly multitaskingSupported: boolean;

	readonly name: string;

	readonly orientation: UIDeviceOrientation;

	/**
	 * @since 3.0
	 */
	proximityMonitoringEnabled: boolean;

	/**
	 * @since 3.0
	 */
	readonly proximityState: boolean;

	readonly systemName: string;

	readonly systemVersion: string;

	/**
	 * @since 3.2
	 */
	readonly userInterfaceIdiom: UIUserInterfaceIdiom;

	static readonly currentDevice: UIDevice;

	beginGeneratingDeviceOrientationNotifications(): void;

	endGeneratingDeviceOrientationNotifications(): void;

	/**
	 * @since 4.2
	 */
	playInputClick(): void;
}

/**
 * @since 3.0
 */
declare var UIDeviceBatteryLevelDidChangeNotification: string;

declare const enum UIDeviceBatteryState {

	Unknown = 0,

	Unplugged = 1,

	Charging = 2,

	Full = 3
}

/**
 * @since 3.0
 */
declare var UIDeviceBatteryStateDidChangeNotification: string;

declare const enum UIDeviceOrientation {

	Unknown = 0,

	Portrait = 1,

	PortraitUpsideDown = 2,

	LandscapeLeft = 3,

	LandscapeRight = 4,

	FaceUp = 5,

	FaceDown = 6
}

declare var UIDeviceOrientationDidChangeNotification: string;

/**
 * @since 3.0
 */
declare var UIDeviceProximityStateDidChangeNotification: string;

/**
 * @since 5.1
 */
declare class UIDictationPhrase extends NSObject {

	static alloc(): UIDictationPhrase; // inherited from NSObject

	static new(): UIDictationPhrase; // inherited from NSObject

	readonly alternativeInterpretations: NSArray<string>;

	readonly text: string;
}

/**
 * @since 13.0
 * @deprecated 13.0
 */
declare const enum UIDirectionalRectEdge {

	None = 0,

	Top = 1,

	Leading = 2,

	Bottom = 4,

	Trailing = 8,

	All = 15
}

/**
 * @since 10.0
 */
declare const enum UIDisplayGamut {

	Unspecified = -1,

	SRGB = 0,

	P3 = 1
}

/**
 * @since 5.0
 */
declare class UIDocument extends NSObject implements NSFilePresenter, NSProgressReporting, UINavigationItemRenameDelegate, UIUserActivityRestoring {

	static alloc(): UIDocument; // inherited from NSObject

	static new(): UIDocument; // inherited from NSObject

	readonly documentState: UIDocumentState;

	fileModificationDate: Date;

	readonly fileType: string;

	readonly fileURL: NSURL;

	readonly hasUnsavedChanges: boolean;

	readonly localizedName: string;

	readonly savingFileType: string;

	undoManager: NSUndoManager;

	/**
	 * @since 8.0
	 */
	userActivity: NSUserActivity;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	/**
	 * @since 11.0
	 */
	readonly observedPresentedItemUbiquityAttributes: NSSet<string>; // inherited from NSFilePresenter

	readonly presentedItemOperationQueue: NSOperationQueue; // inherited from NSFilePresenter

	readonly presentedItemURL: NSURL; // inherited from NSFilePresenter

	readonly progress: NSProgress; // inherited from NSProgressReporting

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { fileURL: NSURL; });

	accommodatePresentedItemDeletionWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 17.4
	 */
	accommodatePresentedItemEvictionWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	accommodatePresentedSubitemDeletionAtURLCompletionHandler(url: NSURL, completionHandler: (p1: NSError) => void): void;

	autosaveWithCompletionHandler(completionHandler: (p1: boolean) => void): void;

	changeCountTokenForSaveOperation(saveOperation: UIDocumentSaveOperation): any;

	class(): typeof NSObject;

	closeWithCompletionHandler(completionHandler: (p1: boolean) => void): void;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	contentsForTypeError(typeName: string): any;

	disableEditing(): void;

	enableEditing(): void;

	fileAttributesToWriteToURLForSaveOperationError(url: NSURL, saveOperation: UIDocumentSaveOperation): NSDictionary<any, any>;

	fileNameExtensionForTypeSaveOperation(typeName: string, saveOperation: UIDocumentSaveOperation): string;

	finishedHandlingErrorRecovered(error: NSError, recovered: boolean): void;

	handleErrorUserInteractionPermitted(error: NSError, userInteractionPermitted: boolean): void;

	initWithFileURL(url: NSURL): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	loadFromContentsOfTypeError(contents: any, typeName: string): boolean;

	navigationItemDidEndRenamingWithTitle(navigationItem: UINavigationItem, title: string): void;

	navigationItemShouldBeginRenaming(navigationItem: UINavigationItem): boolean;

	navigationItemShouldEndRenamingWithTitle(navigationItem: UINavigationItem, title: string): boolean;

	navigationItemWillBeginRenamingWithSuggestedTitleSelectedRange(navigationItem: UINavigationItem, title: string, selectedRange: interop.Pointer | interop.Reference<NSRange>): string;

	openWithCompletionHandler(completionHandler: (p1: boolean) => void): void;

	performAsynchronousFileAccessUsingBlock(block: () => void): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	presentedItemDidChange(): void;

	/**
	 * @since 11.0
	 */
	presentedItemDidChangeUbiquityAttributes(attributes: NSSet<string>): void;

	presentedItemDidGainVersion(version: NSFileVersion): void;

	presentedItemDidLoseVersion(version: NSFileVersion): void;

	presentedItemDidMoveToURL(newURL: NSURL): void;

	presentedItemDidResolveConflictVersion(version: NSFileVersion): void;

	presentedSubitemAtURLDidGainVersion(url: NSURL, version: NSFileVersion): void;

	presentedSubitemAtURLDidLoseVersion(url: NSURL, version: NSFileVersion): void;

	presentedSubitemAtURLDidMoveToURL(oldURL: NSURL, newURL: NSURL): void;

	presentedSubitemAtURLDidResolveConflictVersion(url: NSURL, version: NSFileVersion): void;

	presentedSubitemDidAppearAtURL(url: NSURL): void;

	presentedSubitemDidChangeAtURL(url: NSURL): void;

	readFromURLError(url: NSURL): boolean;

	relinquishPresentedItemToReader(reader: (p1: () => void) => void): void;

	relinquishPresentedItemToWriter(writer: (p1: () => void) => void): void;

	respondsToSelector(aSelector: string): boolean;

	restoreUserActivityState(userActivity: NSUserActivity): void;

	retainCount(): number;

	revertToContentsOfURLCompletionHandler(url: NSURL, completionHandler: (p1: boolean) => void): void;

	savePresentedItemChangesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	saveToURLForSaveOperationCompletionHandler(url: NSURL, saveOperation: UIDocumentSaveOperation, completionHandler: (p1: boolean) => void): void;

	self(): this;

	updateChangeCount(change: UIDocumentChangeKind): void;

	updateChangeCountWithTokenForSaveOperation(changeCountToken: any, saveOperation: UIDocumentSaveOperation): void;

	/**
	 * @since 8.0
	 */
	updateUserActivityState(userActivity: NSUserActivity): void;

	userInteractionNoLongerPermittedForError(error: NSError): void;

	writeContentsAndAttributesSafelyToURLForSaveOperationError(contents: any, additionalFileAttributes: NSDictionary<any, any>, url: NSURL, saveOperation: UIDocumentSaveOperation): boolean;

	writeContentsToURLForSaveOperationOriginalContentsURLError(contents: any, url: NSURL, saveOperation: UIDocumentSaveOperation, originalContentsURL: NSURL): boolean;
}

/**
 * @since 11.0
 */
declare class UIDocumentBrowserAction extends NSObject {

	static alloc(): UIDocumentBrowserAction; // inherited from NSObject

	static new(): UIDocumentBrowserAction; // inherited from NSObject

	readonly availability: UIDocumentBrowserActionAvailability;

	readonly identifier: string;

	image: UIImage;

	readonly localizedTitle: string;

	supportedContentTypes: NSArray<string>;

	supportsMultipleItems: boolean;

	constructor(o: { identifier: string; localizedTitle: string; availability: UIDocumentBrowserActionAvailability; handler: (p1: NSArray<NSURL>) => void; });

	initWithIdentifierLocalizedTitleAvailabilityHandler(identifier: string, localizedTitle: string, availability: UIDocumentBrowserActionAvailability, handler: (p1: NSArray<NSURL>) => void): this;
}

/**
 * @since 11.0
 */
declare const enum UIDocumentBrowserActionAvailability {

	Menu = 1,

	NavigationBar = 2
}

/**
 * @since 11.0
 */
declare const enum UIDocumentBrowserErrorCode {

	Generic = 1,

	NoLocationAvailable = 2
}

/**
 * @since 11.0
 */
declare var UIDocumentBrowserErrorDomain: string;

/**
 * @since 11.0
 */
declare const enum UIDocumentBrowserImportMode {

	None = 0,

	Copy = 1,

	Move = 2
}

/**
 * @since 11.0
 */
declare class UIDocumentBrowserTransitionController extends NSObject implements UIViewControllerAnimatedTransitioning {

	static alloc(): UIDocumentBrowserTransitionController; // inherited from NSObject

	static new(): UIDocumentBrowserTransitionController; // inherited from NSObject

	loadingProgress: NSProgress;

	targetView: UIView;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	animateTransition(transitionContext: UIViewControllerContextTransitioning): void;

	animationEnded(transitionCompleted: boolean): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 10.0
	 */
	interruptibleAnimatorForTransition(transitionContext: UIViewControllerContextTransitioning): UIViewImplicitlyAnimating;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	transitionDuration(transitionContext: UIViewControllerContextTransitioning): number;
}

/**
 * @since 11.0
 */
declare const enum UIDocumentBrowserUserInterfaceStyle {

	White = 0,

	Light = 1,

	Dark = 2
}

/**
 * @since 11.0
 */
declare class UIDocumentBrowserViewController extends UIViewController implements NSCoding {

	static alloc(): UIDocumentBrowserViewController; // inherited from NSObject

	static new(): UIDocumentBrowserViewController; // inherited from NSObject

	/**
	 * @since 18.0
	 */
	readonly activeDocumentCreationIntent: string;

	additionalLeadingNavigationBarButtonItems: NSArray<UIBarButtonItem>;

	additionalTrailingNavigationBarButtonItems: NSArray<UIBarButtonItem>;

	/**
	 * @since 11.0
	 * @deprecated 14.0
	 */
	readonly allowedContentTypes: NSArray<string>;

	allowsDocumentCreation: boolean;

	allowsPickingMultipleItems: boolean;

	browserUserInterfaceStyle: UIDocumentBrowserUserInterfaceStyle;

	/**
	 * @since 14.0
	 */
	readonly contentTypesForRecentDocuments: NSArray<UTType>;

	customActions: NSArray<UIDocumentBrowserAction>;

	/**
	 * @since 13.0
	 */
	defaultDocumentAspectRatio: number;

	delegate: UIDocumentBrowserViewControllerDelegate;

	/**
	 * @since 13.0
	 */
	localizedCreateDocumentActionTitle: string;

	/**
	 * @since 11.0
	 * @deprecated 14.0
	 */
	readonly recentDocumentsContentTypes: NSArray<string>;

	/**
	 * @since 13.0
	 */
	shouldShowFileExtensions: boolean;

	/**
	 * @since 14.0
	 */
	constructor(o: { forOpeningContentTypes: NSArray<UTType> | UTType[]; });

	/**
	 * @since 11.0
	 * @deprecated 14.0
	 */
	constructor(o: { forOpeningFilesWithContentTypes: NSArray<string> | string[]; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	importDocumentAtURLNextToDocumentAtURLModeCompletionHandler(documentURL: NSURL, neighbourURL: NSURL, importMode: UIDocumentBrowserImportMode, completion: (p1: NSURL, p2: NSError) => void): void;

	/**
	 * @since 14.0
	 */
	initForOpeningContentTypes(contentTypes: NSArray<UTType> | UTType[]): this;

	/**
	 * @since 11.0
	 * @deprecated 14.0
	 */
	initForOpeningFilesWithContentTypes(allowedContentTypes: NSArray<string> | string[]): this;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 16.0
	 */
	renameDocumentAtURLProposedNameCompletionHandler(documentURL: NSURL, proposedName: string, completionHandler: (p1: NSURL, p2: NSError) => void): void;

	revealDocumentAtURLImportIfNeededCompletion(url: NSURL, importIfNeeded: boolean, completion: (p1: NSURL, p2: NSError) => void): void;

	/**
	 * @since 12.0
	 */
	transitionControllerForDocumentAtURL(documentURL: NSURL): UIDocumentBrowserTransitionController;

	/**
	 * @since 11.0
	 * @deprecated 12.0
	 */
	transitionControllerForDocumentURL(documentURL: NSURL): UIDocumentBrowserTransitionController;
}

/**
 * @since 11.0
 */
interface UIDocumentBrowserViewControllerDelegate extends NSObjectProtocol {

	documentBrowserApplicationActivitiesForDocumentURLs?(controller: UIDocumentBrowserViewController, documentURLs: NSArray<NSURL> | NSURL[]): NSArray<UIActivity>;

	documentBrowserDidImportDocumentAtURLToDestinationURL?(controller: UIDocumentBrowserViewController, sourceURL: NSURL, destinationURL: NSURL): void;

	/**
	 * @since 11.0
	 * @deprecated 12.0
	 */
	documentBrowserDidPickDocumentURLs?(controller: UIDocumentBrowserViewController, documentURLs: NSArray<NSURL> | NSURL[]): void;

	/**
	 * @since 12.0
	 */
	documentBrowserDidPickDocumentsAtURLs?(controller: UIDocumentBrowserViewController, documentURLs: NSArray<NSURL> | NSURL[]): void;

	documentBrowserDidRequestDocumentCreationWithHandler?(controller: UIDocumentBrowserViewController, importHandler: (p1: NSURL, p2: UIDocumentBrowserImportMode) => void): void;

	documentBrowserFailedToImportDocumentAtURLError?(controller: UIDocumentBrowserViewController, documentURL: NSURL, error: NSError): void;

	documentBrowserWillPresentActivityViewController?(controller: UIDocumentBrowserViewController, activityViewController: UIActivityViewController): void;
}
declare var UIDocumentBrowserViewControllerDelegate: {

	prototype: UIDocumentBrowserViewControllerDelegate;
};

declare const enum UIDocumentChangeKind {

	Done = 0,

	Undone = 1,

	Redone = 2,

	Cleared = 3
}

/**
 * @since 18.0
 */
declare var UIDocumentCreationIntentDefault: string;

/**
 * @since 3.2
 */
declare class UIDocumentInteractionController extends NSObject implements UIActionSheetDelegate {

	static alloc(): UIDocumentInteractionController; // inherited from NSObject

	static interactionControllerWithURL(url: NSURL): UIDocumentInteractionController;

	static new(): UIDocumentInteractionController; // inherited from NSObject

	URL: NSURL;

	UTI: string;

	annotation: any;

	delegate: UIDocumentInteractionControllerDelegate;

	readonly gestureRecognizers: NSArray<UIGestureRecognizer>;

	readonly icons: NSArray<UIImage>;

	name: string;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	/**
	 * @since 2.0
	 * @deprecated 8.3
	 */
	actionSheetCancel(actionSheet: UIActionSheet): void;

	/**
	 * @since 2.0
	 * @deprecated 8.3
	 */
	actionSheetClickedButtonAtIndex(actionSheet: UIActionSheet, buttonIndex: number): void;

	/**
	 * @since 2.0
	 * @deprecated 8.3
	 */
	actionSheetDidDismissWithButtonIndex(actionSheet: UIActionSheet, buttonIndex: number): void;

	/**
	 * @since 2.0
	 * @deprecated 8.3
	 */
	actionSheetWillDismissWithButtonIndex(actionSheet: UIActionSheet, buttonIndex: number): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 2.0
	 * @deprecated 8.3
	 */
	didPresentActionSheet(actionSheet: UIActionSheet): void;

	dismissMenuAnimated(animated: boolean): void;

	dismissPreviewAnimated(animated: boolean): void;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	presentOpenInMenuFromBarButtonItemAnimated(item: UIBarButtonItem, animated: boolean): boolean;

	presentOpenInMenuFromRectInViewAnimated(rect: CGRect, view: UIView, animated: boolean): boolean;

	presentOptionsMenuFromBarButtonItemAnimated(item: UIBarButtonItem, animated: boolean): boolean;

	presentOptionsMenuFromRectInViewAnimated(rect: CGRect, view: UIView, animated: boolean): boolean;

	presentPreviewAnimated(animated: boolean): boolean;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 2.0
	 * @deprecated 8.3
	 */
	willPresentActionSheet(actionSheet: UIActionSheet): void;
}

/**
 * @since 3.2
 */
interface UIDocumentInteractionControllerDelegate extends NSObjectProtocol {

	/**
	 * @since 3.2
	 * @deprecated 6.0
	 */
	documentInteractionControllerCanPerformAction?(controller: UIDocumentInteractionController, action: string): boolean;

	documentInteractionControllerDidDismissOpenInMenu?(controller: UIDocumentInteractionController): void;

	documentInteractionControllerDidDismissOptionsMenu?(controller: UIDocumentInteractionController): void;

	documentInteractionControllerDidEndPreview?(controller: UIDocumentInteractionController): void;

	documentInteractionControllerDidEndSendingToApplication?(controller: UIDocumentInteractionController, application: string): void;

	/**
	 * @since 3.2
	 * @deprecated 6.0
	 */
	documentInteractionControllerPerformAction?(controller: UIDocumentInteractionController, action: string): boolean;

	documentInteractionControllerRectForPreview?(controller: UIDocumentInteractionController): CGRect;

	documentInteractionControllerViewControllerForPreview?(controller: UIDocumentInteractionController): UIViewController;

	documentInteractionControllerViewForPreview?(controller: UIDocumentInteractionController): UIView;

	documentInteractionControllerWillBeginPreview?(controller: UIDocumentInteractionController): void;

	documentInteractionControllerWillBeginSendingToApplication?(controller: UIDocumentInteractionController, application: string): void;

	documentInteractionControllerWillPresentOpenInMenu?(controller: UIDocumentInteractionController): void;

	documentInteractionControllerWillPresentOptionsMenu?(controller: UIDocumentInteractionController): void;
}
declare var UIDocumentInteractionControllerDelegate: {

	prototype: UIDocumentInteractionControllerDelegate;
};

/**
 * @since 8.0
 * @deprecated 13.0
 */
interface UIDocumentMenuDelegate extends NSObjectProtocol {

	documentMenuDidPickDocumentPicker(documentMenu: UIDocumentMenuViewController, documentPicker: UIDocumentPickerViewController): void;

	documentMenuWasCancelled?(documentMenu: UIDocumentMenuViewController): void;
}
declare var UIDocumentMenuDelegate: {

	prototype: UIDocumentMenuDelegate;
};

/**
 * @since 8.0
 * @deprecated 11.0
 */
declare const enum UIDocumentMenuOrder {

	First = 0,

	Last = 1
}

/**
 * @since 8.0
 * @deprecated 11.0
 */
declare class UIDocumentMenuViewController extends UIViewController {

	static alloc(): UIDocumentMenuViewController; // inherited from NSObject

	static new(): UIDocumentMenuViewController; // inherited from NSObject

	delegate: UIDocumentMenuDelegate;

	constructor(o: { documentTypes: NSArray<string> | string[]; inMode: UIDocumentPickerMode; });

	constructor(o: { URL: NSURL; inMode: UIDocumentPickerMode; });

	addOptionWithTitleImageOrderHandler(title: string, image: UIImage, order: UIDocumentMenuOrder, handler: () => void): void;

	initWithDocumentTypesInMode(allowedUTIs: NSArray<string> | string[], mode: UIDocumentPickerMode): this;

	initWithURLInMode(url: NSURL, mode: UIDocumentPickerMode): this;
}

interface UIDocumentPickerDelegate extends NSObjectProtocol {

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	documentPickerDidPickDocumentAtURL?(controller: UIDocumentPickerViewController, url: NSURL): void;

	/**
	 * @since 11.0
	 */
	documentPickerDidPickDocumentsAtURLs?(controller: UIDocumentPickerViewController, urls: NSArray<NSURL> | NSURL[]): void;

	documentPickerWasCancelled?(controller: UIDocumentPickerViewController): void;
}
declare var UIDocumentPickerDelegate: {

	prototype: UIDocumentPickerDelegate;
};

/**
 * @since 8.0
 * @deprecated 14.0
 */
declare class UIDocumentPickerExtensionViewController extends UIViewController {

	static alloc(): UIDocumentPickerExtensionViewController; // inherited from NSObject

	static new(): UIDocumentPickerExtensionViewController; // inherited from NSObject

	readonly documentPickerMode: UIDocumentPickerMode;

	readonly documentStorageURL: NSURL;

	readonly originalURL: NSURL;

	readonly providerIdentifier: string;

	readonly validTypes: NSArray<string>;

	dismissGrantingAccessToURL(url: NSURL): void;

	prepareForPresentationInMode(mode: UIDocumentPickerMode): void;
}

/**
 * @since 8.0
 * @deprecated 14.0
 */
declare const enum UIDocumentPickerMode {

	Import = 0,

	Open = 1,

	ExportToService = 2,

	MoveToService = 3
}

/**
 * @since 8.0
 */
declare class UIDocumentPickerViewController extends UIViewController {

	static alloc(): UIDocumentPickerViewController; // inherited from NSObject

	static new(): UIDocumentPickerViewController; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	allowsMultipleSelection: boolean;

	delegate: UIDocumentPickerDelegate;

	/**
	 * @since 13.0
	 */
	directoryURL: NSURL;

	/**
	 * @since 8.0
	 * @deprecated 14.0
	 */
	readonly documentPickerMode: UIDocumentPickerMode;

	/**
	 * @since 13.0
	 */
	shouldShowFileExtensions: boolean;

	/**
	 * @since 14.0
	 */
	constructor(o: { forExportingURLs: NSArray<NSURL> | NSURL[]; });

	/**
	 * @since 14.0
	 */
	constructor(o: { forExportingURLs: NSArray<NSURL> | NSURL[]; asCopy: boolean; });

	/**
	 * @since 14.0
	 */
	constructor(o: { forOpeningContentTypes: NSArray<UTType> | UTType[]; });

	/**
	 * @since 14.0
	 */
	constructor(o: { forOpeningContentTypes: NSArray<UTType> | UTType[]; asCopy: boolean; });

	/**
	 * @since 8.0
	 * @deprecated 14.0
	 */
	constructor(o: { documentTypes: NSArray<string> | string[]; inMode: UIDocumentPickerMode; });

	/**
	 * @since 8.0
	 * @deprecated 14.0
	 */
	constructor(o: { URL: NSURL; inMode: UIDocumentPickerMode; });

	/**
	 * @since 11.0
	 * @deprecated 14.0
	 */
	constructor(o: { URLs: NSArray<NSURL> | NSURL[]; inMode: UIDocumentPickerMode; });

	/**
	 * @since 14.0
	 */
	initForExportingURLs(urls: NSArray<NSURL> | NSURL[]): this;

	/**
	 * @since 14.0
	 */
	initForExportingURLsAsCopy(urls: NSArray<NSURL> | NSURL[], asCopy: boolean): this;

	/**
	 * @since 14.0
	 */
	initForOpeningContentTypes(contentTypes: NSArray<UTType> | UTType[]): this;

	/**
	 * @since 14.0
	 */
	initForOpeningContentTypesAsCopy(contentTypes: NSArray<UTType> | UTType[], asCopy: boolean): this;

	/**
	 * @since 8.0
	 * @deprecated 14.0
	 */
	initWithDocumentTypesInMode(allowedUTIs: NSArray<string> | string[], mode: UIDocumentPickerMode): this;

	/**
	 * @since 8.0
	 * @deprecated 14.0
	 */
	initWithURLInMode(url: NSURL, mode: UIDocumentPickerMode): this;

	/**
	 * @since 11.0
	 * @deprecated 14.0
	 */
	initWithURLsInMode(urls: NSArray<NSURL> | NSURL[], mode: UIDocumentPickerMode): this;
}

/**
 * @since 16.0
 */
declare class UIDocumentProperties extends NSObject {

	static alloc(): UIDocumentProperties; // inherited from NSObject

	static new(): UIDocumentProperties; // inherited from NSObject

	activityViewControllerProvider: () => UIActivityViewController;

	dragItemsProvider: (p1: UIDragSession) => NSArray<UIDragItem>;

	metadata: LPLinkMetadata;

	wantsIconRepresentation: boolean;

	constructor(o: { metadata: LPLinkMetadata; });

	constructor(o: { URL: NSURL; });

	initWithMetadata(metadata: LPLinkMetadata): this;

	initWithURL(url: NSURL): this;
}

declare const enum UIDocumentSaveOperation {

	ForCreating = 0,

	ForOverwriting = 1
}

declare const enum UIDocumentState {

	Normal = 0,

	Closed = 1,

	InConflict = 2,

	SavingError = 4,

	EditingDisabled = 8,

	ProgressAvailable = 16
}

/**
 * @since 5.0
 */
declare var UIDocumentStateChangedNotification: string;

/**
 * @since 17.0
 */
declare class UIDocumentViewController extends UIViewController {

	static alloc(): UIDocumentViewController; // inherited from NSObject

	static new(): UIDocumentViewController; // inherited from NSObject

	document: UIDocument;

	/**
	 * @since 18.0
	 */
	launchOptions: UIDocumentViewControllerLaunchOptions;

	readonly undoRedoItemGroup: UIBarButtonItemGroup;

	constructor(o: { document: UIDocument; });

	documentDidOpen(): void;

	initWithDocument(document: UIDocument): this;

	navigationItemDidUpdate(): void;

	openDocumentWithCompletionHandler(completionHandler: (p1: boolean) => void): void;
}

/**
 * @since 18.0
 */
declare class UIDocumentViewControllerLaunchOptions extends NSObject {

	static alloc(): UIDocumentViewControllerLaunchOptions; // inherited from NSObject

	static createDocumentActionWithIntent(intent: string): UIAction;

	static new(): UIDocumentViewControllerLaunchOptions; // inherited from NSObject

	background: UIBackgroundConfiguration;

	backgroundAccessoryView: UIView;

	browserViewController: UIDocumentBrowserViewController;

	documentTargetView: UIView;

	foregroundAccessoryView: UIView;

	primaryAction: UIAction;

	secondaryAction: UIAction;

	title: string;
}

/**
 * @since 11.0
 */
interface UIDragAnimating extends NSObjectProtocol {

	addAnimations(animations: () => void): void;

	addCompletion(completion: (p1: UIViewAnimatingPosition) => void): void;
}
declare var UIDragAnimating: {

	prototype: UIDragAnimating;
};

/**
 * @since 11.0
 */
interface UIDragDropSession extends NSObjectProtocol {

	allowsMoveOperation: boolean;

	items: NSArray<UIDragItem>;

	restrictedToDraggingApplication: boolean;

	canLoadObjectsOfClass(aClass: typeof NSObject): boolean;

	hasItemsConformingToTypeIdentifiers(typeIdentifiers: NSArray<string> | string[]): boolean;

	locationInView(view: UIView): CGPoint;
}
declare var UIDragDropSession: {

	prototype: UIDragDropSession;
};

/**
 * @since 11.0
 */
declare class UIDragInteraction extends NSObject implements UIInteraction {

	static alloc(): UIDragInteraction; // inherited from NSObject

	static new(): UIDragInteraction; // inherited from NSObject

	allowsSimultaneousRecognitionDuringLift: boolean;

	readonly delegate: UIDragInteractionDelegate;

	enabled: boolean;

	static readonly enabledByDefault: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly view: UIView; // inherited from UIInteraction

	readonly  // inherited from NSObjectProtocol

	constructor(o: { delegate: UIDragInteractionDelegate; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	didMoveToView(view: UIView): void;

	initWithDelegate(delegate: UIDragInteractionDelegate): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	willMoveToView(view: UIView): void;
}

/**
 * @since 11.0
 */
interface UIDragInteractionDelegate extends NSObjectProtocol {

	dragInteractionItemWillAnimateCancelWithAnimator?(interaction: UIDragInteraction, item: UIDragItem, animator: UIDragAnimating): void;

	dragInteractionItemsForAddingToSessionWithTouchAtPoint?(interaction: UIDragInteraction, session: UIDragSession, point: CGPoint): NSArray<UIDragItem>;

	dragInteractionItemsForBeginningSession(interaction: UIDragInteraction, session: UIDragSession): NSArray<UIDragItem>;

	dragInteractionPrefersFullSizePreviewsForSession?(interaction: UIDragInteraction, session: UIDragSession): boolean;

	dragInteractionPreviewForCancellingItemWithDefault?(interaction: UIDragInteraction, item: UIDragItem, defaultPreview: UITargetedDragPreview): UITargetedDragPreview;

	dragInteractionPreviewForLiftingItemSession?(interaction: UIDragInteraction, item: UIDragItem, session: UIDragSession): UITargetedDragPreview;

	dragInteractionSessionAllowsMoveOperation?(interaction: UIDragInteraction, session: UIDragSession): boolean;

	dragInteractionSessionDidEndWithOperation?(interaction: UIDragInteraction, session: UIDragSession, operation: UIDropOperation): void;

	dragInteractionSessionDidMove?(interaction: UIDragInteraction, session: UIDragSession): void;

	dragInteractionSessionDidTransferItems?(interaction: UIDragInteraction, session: UIDragSession): void;

	dragInteractionSessionForAddingItemsWithTouchAtPoint?(interaction: UIDragInteraction, sessions: NSArray<UIDragSession> | UIDragSession[], point: CGPoint): UIDragSession;

	dragInteractionSessionIsRestrictedToDraggingApplication?(interaction: UIDragInteraction, session: UIDragSession): boolean;

	dragInteractionSessionWillAddItemsForInteraction?(interaction: UIDragInteraction, session: UIDragSession, items: NSArray<UIDragItem> | UIDragItem[], addingInteraction: UIDragInteraction): void;

	dragInteractionSessionWillBegin?(interaction: UIDragInteraction, session: UIDragSession): void;

	dragInteractionSessionWillEndWithOperation?(interaction: UIDragInteraction, session: UIDragSession, operation: UIDropOperation): void;

	dragInteractionWillAnimateLiftWithAnimatorSession?(interaction: UIDragInteraction, animator: UIDragAnimating, session: UIDragSession): void;
}
declare var UIDragInteractionDelegate: {

	prototype: UIDragInteractionDelegate;
};

/**
 * @since 11.0
 */
declare class UIDragItem extends NSObject {

	static alloc(): UIDragItem; // inherited from NSObject

	static new(): UIDragItem; // inherited from NSObject

	readonly itemProvider: NSItemProvider;

	localObject: any;

	previewProvider: () => UIDragPreview;

	constructor(o: { itemProvider: NSItemProvider; });

	initWithItemProvider(itemProvider: NSItemProvider): this;

	/**
	 * @since 17.4
	 */
	setNeedsDropPreviewUpdate(): void;
}

/**
 * @since 11.0
 */
declare class UIDragPreview extends NSObject implements NSCopying {

	static alloc(): UIDragPreview; // inherited from NSObject

	static new(): UIDragPreview; // inherited from NSObject

	static previewForURL(url: NSURL): UIDragPreview;

	static previewForURLTitle(url: NSURL, title: string): UIDragPreview;

	readonly parameters: UIDragPreviewParameters;

	readonly view: UIView;

	constructor(o: { view: UIView; });

	constructor(o: { view: UIView; parameters: UIDragPreviewParameters; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithView(view: UIView): this;

	initWithViewParameters(view: UIView, parameters: UIDragPreviewParameters): this;
}

/**
 * @since 11.0
 */
declare class UIDragPreviewParameters extends UIPreviewParameters {

	static alloc(): UIDragPreviewParameters; // inherited from NSObject

	static new(): UIDragPreviewParameters; // inherited from NSObject
}

/**
 * @since 11.0
 */
declare class UIDragPreviewTarget extends UIPreviewTarget {

	static alloc(): UIDragPreviewTarget; // inherited from NSObject

	static new(): UIDragPreviewTarget; // inherited from NSObject
}

/**
 * @since 11.0
 */
interface UIDragSession extends UIDragDropSession {

	localContext: any;
}
declare var UIDragSession: {

	prototype: UIDragSession;
};

/**
 * @since 11.0
 */
declare class UIDropInteraction extends NSObject implements UIInteraction {

	static alloc(): UIDropInteraction; // inherited from NSObject

	static new(): UIDropInteraction; // inherited from NSObject

	allowsSimultaneousDropSessions: boolean;

	readonly delegate: UIDropInteractionDelegate;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly view: UIView; // inherited from UIInteraction

	readonly  // inherited from NSObjectProtocol

	constructor(o: { delegate: UIDropInteractionDelegate; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	didMoveToView(view: UIView): void;

	initWithDelegate(delegate: UIDropInteractionDelegate): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	willMoveToView(view: UIView): void;
}

/**
 * @since 11.0
 */
interface UIDropInteractionDelegate extends NSObjectProtocol {

	dropInteractionCanHandleSession?(interaction: UIDropInteraction, session: UIDropSession): boolean;

	dropInteractionConcludeDrop?(interaction: UIDropInteraction, session: UIDropSession): void;

	dropInteractionItemWillAnimateDropWithAnimator?(interaction: UIDropInteraction, item: UIDragItem, animator: UIDragAnimating): void;

	dropInteractionPerformDrop?(interaction: UIDropInteraction, session: UIDropSession): void;

	dropInteractionPreviewForDroppingItemWithDefault?(interaction: UIDropInteraction, item: UIDragItem, defaultPreview: UITargetedDragPreview): UITargetedDragPreview;

	dropInteractionSessionDidEnd?(interaction: UIDropInteraction, session: UIDropSession): void;

	dropInteractionSessionDidEnter?(interaction: UIDropInteraction, session: UIDropSession): void;

	dropInteractionSessionDidExit?(interaction: UIDropInteraction, session: UIDropSession): void;

	dropInteractionSessionDidUpdate?(interaction: UIDropInteraction, session: UIDropSession): UIDropProposal;
}
declare var UIDropInteractionDelegate: {

	prototype: UIDropInteractionDelegate;
};

/**
 * @since 11.0
 */
declare const enum UIDropOperation {

	Cancel = 0,

	Forbidden = 1,

	Copy = 2,

	Move = 3
}

/**
 * @since 11.0
 */
declare class UIDropProposal extends NSObject implements NSCopying {

	static alloc(): UIDropProposal; // inherited from NSObject

	static new(): UIDropProposal; // inherited from NSObject

	readonly operation: UIDropOperation;

	precise: boolean;

	prefersFullSizePreview: boolean;

	constructor(o: { dropOperation: UIDropOperation; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithDropOperation(operation: UIDropOperation): this;
}

/**
 * @since 11.0
 */
interface UIDropSession extends NSProgressReporting, UIDragDropSession {

	localDragSession: UIDragSession;

	progressIndicatorStyle: UIDropSessionProgressIndicatorStyle;

	loadObjectsOfClassCompletion(aClass: typeof NSObject, completion: (p1: NSArray<NSItemProviderReading>) => void): NSProgress;
}
declare var UIDropSession: {

	prototype: UIDropSession;
};

/**
 * @since 11.0
 */
declare const enum UIDropSessionProgressIndicatorStyle {

	None = 0,

	Default = 1
}

/**
 * @since 7.0
 */
declare class UIDynamicAnimator extends NSObject {

	static alloc(): UIDynamicAnimator; // inherited from NSObject

	static new(): UIDynamicAnimator; // inherited from NSObject

	readonly behaviors: NSArray<UIDynamicBehavior>;

	delegate: UIDynamicAnimatorDelegate;

	readonly elapsedTime: number;

	readonly referenceView: UIView;

	readonly running: boolean;

	constructor(o: { collectionViewLayout: UICollectionViewLayout; });

	constructor(o: { referenceView: UIView; });

	addBehavior(behavior: UIDynamicBehavior): void;

	initWithCollectionViewLayout(layout: UICollectionViewLayout): this;

	initWithReferenceView(view: UIView): this;

	itemsInRect(rect: CGRect): NSArray<UIDynamicItem>;

	layoutAttributesForCellAtIndexPath(indexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	layoutAttributesForDecorationViewOfKindAtIndexPath(decorationViewKind: string, indexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	layoutAttributesForSupplementaryViewOfKindAtIndexPath(kind: string, indexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	removeAllBehaviors(): void;

	removeBehavior(behavior: UIDynamicBehavior): void;

	updateItemUsingCurrentState(item: UIDynamicItem): void;
}

interface UIDynamicAnimatorDelegate extends NSObjectProtocol {

	dynamicAnimatorDidPause?(animator: UIDynamicAnimator): void;

	dynamicAnimatorWillResume?(animator: UIDynamicAnimator): void;
}
declare var UIDynamicAnimatorDelegate: {

	prototype: UIDynamicAnimatorDelegate;
};

/**
 * @since 7.0
 */
declare class UIDynamicBehavior extends NSObject {

	static alloc(): UIDynamicBehavior; // inherited from NSObject

	static new(): UIDynamicBehavior; // inherited from NSObject

	action: () => void;

	readonly childBehaviors: NSArray<UIDynamicBehavior>;

	readonly dynamicAnimator: UIDynamicAnimator;

	addChildBehavior(behavior: UIDynamicBehavior): void;

	removeChildBehavior(behavior: UIDynamicBehavior): void;

	willMoveToAnimator(dynamicAnimator: UIDynamicAnimator): void;
}

interface UIDynamicItem extends NSObjectProtocol {

	bounds: CGRect;

	center: CGPoint;

	/**
	 * @since 9.0
	 */
	collisionBoundingPath?: UIBezierPath;

	/**
	 * @since 9.0
	 */
	collisionBoundsType?: UIDynamicItemCollisionBoundsType;

	transform: CGAffineTransform;
}
declare var UIDynamicItem: {

	prototype: UIDynamicItem;
};

/**
 * @since 7.0
 */
declare class UIDynamicItemBehavior extends UIDynamicBehavior {

	static alloc(): UIDynamicItemBehavior; // inherited from NSObject

	static new(): UIDynamicItemBehavior; // inherited from NSObject

	allowsRotation: boolean;

	/**
	 * @since 9.0
	 */
	anchored: boolean;

	angularResistance: number;

	/**
	 * @since 9.0
	 */
	charge: number;

	density: number;

	elasticity: number;

	friction: number;

	readonly items: NSArray<UIDynamicItem>;

	resistance: number;

	constructor(o: { items: NSArray<UIDynamicItem> | UIDynamicItem[]; });

	addAngularVelocityForItem(velocity: number, item: UIDynamicItem): void;

	addItem(item: UIDynamicItem): void;

	addLinearVelocityForItem(velocity: CGPoint, item: UIDynamicItem): void;

	angularVelocityForItem(item: UIDynamicItem): number;

	initWithItems(items: NSArray<UIDynamicItem> | UIDynamicItem[]): this;

	linearVelocityForItem(item: UIDynamicItem): CGPoint;

	removeItem(item: UIDynamicItem): void;
}

/**
 * @since 9.0
 */
declare const enum UIDynamicItemCollisionBoundsType {

	Rectangle = 0,

	Ellipse = 1,

	Path = 2
}

/**
 * @since 9.0
 */
declare class UIDynamicItemGroup extends NSObject implements UIDynamicItem {

	static alloc(): UIDynamicItemGroup; // inherited from NSObject

	static new(): UIDynamicItemGroup; // inherited from NSObject

	readonly items: NSArray<UIDynamicItem>;

	readonly bounds: CGRect; // inherited from UIDynamicItem

	center: CGPoint; // inherited from UIDynamicItem

	/**
	 * @since 9.0
	 */
	readonly collisionBoundingPath: UIBezierPath; // inherited from UIDynamicItem

	/**
	 * @since 9.0
	 */
	readonly collisionBoundsType: UIDynamicItemCollisionBoundsType; // inherited from UIDynamicItem

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	transform: CGAffineTransform; // inherited from UIDynamicItem

	readonly  // inherited from NSObjectProtocol

	constructor(o: { items: NSArray<UIDynamicItem> | UIDynamicItem[]; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithItems(items: NSArray<UIDynamicItem> | UIDynamicItem[]): this;

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

interface UIEdgeInsets {
	top: number;
	left: number;
	bottom: number;
	right: number;
}
declare var UIEdgeInsets: interop.StructType<UIEdgeInsets>;

declare function UIEdgeInsetsFromString(string: string): UIEdgeInsets;

declare var UIEdgeInsetsZero: UIEdgeInsets;

/**
 * @since 16.0
 */
declare const enum UIEditMenuArrowDirection {

	Automatic = 0,

	Up = 1,

	Down = 2,

	Left = 3,

	Right = 4
}

/**
 * @since 16.0
 */
declare class UIEditMenuConfiguration extends NSObject {

	static alloc(): UIEditMenuConfiguration; // inherited from NSObject

	static configurationWithIdentifierSourcePoint(identifier: any, sourcePoint: CGPoint): UIEditMenuConfiguration;

	static new(): UIEditMenuConfiguration; // inherited from NSObject

	readonly identifier: any;

	preferredArrowDirection: UIEditMenuArrowDirection;

	readonly sourcePoint: CGPoint;
}

/**
 * @since 16.0
 */
declare class UIEditMenuInteraction extends NSObject implements UIInteraction {

	static alloc(): UIEditMenuInteraction; // inherited from NSObject

	static new(): UIEditMenuInteraction; // inherited from NSObject

	readonly delegate: UIEditMenuInteractionDelegate;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly view: UIView; // inherited from UIInteraction

	readonly  // inherited from NSObjectProtocol

	constructor(o: { delegate: UIEditMenuInteractionDelegate; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	didMoveToView(view: UIView): void;

	dismissMenu(): void;

	initWithDelegate(delegate: UIEditMenuInteractionDelegate): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	locationInView(view: UIView): CGPoint;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	presentEditMenuWithConfiguration(configuration: UIEditMenuConfiguration): void;

	reloadVisibleMenu(): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	updateVisibleMenuPositionAnimated(animated: boolean): void;

	willMoveToView(view: UIView): void;
}

/**
 * @since 16.0
 */
interface UIEditMenuInteractionAnimating extends NSObjectProtocol {

	addAnimations(animations: () => void): void;

	addCompletion(completion: () => void): void;
}
declare var UIEditMenuInteractionAnimating: {

	prototype: UIEditMenuInteractionAnimating;
};

/**
 * @since 16.0
 */
interface UIEditMenuInteractionDelegate extends NSObjectProtocol {

	editMenuInteractionMenuForConfigurationSuggestedActions?(interaction: UIEditMenuInteraction, configuration: UIEditMenuConfiguration, suggestedActions: NSArray<UIMenuElement> | UIMenuElement[]): UIMenu;

	editMenuInteractionTargetRectForConfiguration?(interaction: UIEditMenuInteraction, configuration: UIEditMenuConfiguration): CGRect;

	editMenuInteractionWillDismissMenuForConfigurationAnimator?(interaction: UIEditMenuInteraction, configuration: UIEditMenuConfiguration, animator: UIEditMenuInteractionAnimating): void;

	editMenuInteractionWillPresentMenuForConfigurationAnimator?(interaction: UIEditMenuInteraction, configuration: UIEditMenuConfiguration, animator: UIEditMenuInteractionAnimating): void;
}
declare var UIEditMenuInteractionDelegate: {

	prototype: UIEditMenuInteractionDelegate;
};

/**
 * @since 13.0
 */
declare const enum UIEditingInteractionConfiguration {

	None = 0,

	Default = 1
}

/**
 * @since 2.0
 */
declare class _UIEvent extends NSObject {

	static alloc(): _UIEvent; // inherited from NSObject

	static new(): _UIEvent; // inherited from NSObject

	readonly allTouches: NSSet<UITouch>;

	/**
	 * @since 13.4
	 */
	readonly buttonMask: UIEventButtonMask;

	/**
	 * @since 13.4
	 */
	readonly modifierFlags: UIKeyModifierFlags;

	/**
	 * @since 3.0
	 */
	readonly subtype: UIEventSubtype;

	readonly timestamp: number;

	/**
	 * @since 3.0
	 */
	readonly type: UIEventType;

	/**
	 * @since 9.0
	 */
	coalescedTouchesForTouch(touch: UITouch): NSArray<UITouch>;

	/**
	 * @since 9.0
	 */
	predictedTouchesForTouch(touch: UITouch): NSArray<UITouch>;

	/**
	 * @since 3.2
	 */
	touchesForGestureRecognizer(gesture: UIGestureRecognizer): NSSet<UITouch>;

	touchesForView(view: UIView): NSSet<UITouch>;

	touchesForWindow(window: UIWindow): NSSet<UITouch>;
}

/**
 * @since 14.5
 */
declare class UIEventAttribution extends NSObject implements NSCopying {

	static alloc(): UIEventAttribution; // inherited from NSObject

	static new(): UIEventAttribution; // inherited from NSObject

	readonly destinationURL: NSURL;

	readonly purchaser: string;

	readonly reportEndpoint: NSURL;

	readonly sourceDescription: string;

	readonly sourceIdentifier: number;

	constructor(o: { sourceIdentifier: number; destinationURL: NSURL; sourceDescription: string; purchaser: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithSourceIdentifierDestinationURLSourceDescriptionPurchaser(sourceIdentifier: number, destinationURL: NSURL, sourceDescription: string, purchaser: string): this;
}

/**
 * @since 14.5
 */
declare class UIEventAttributionView extends UIView {

	static alloc(): UIEventAttributionView; // inherited from NSObject

	static appearance(): UIEventAttributionView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIEventAttributionView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIEventAttributionView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIEventAttributionView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIEventAttributionView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIEventAttributionView; // inherited from UIAppearance

	static new(): UIEventAttributionView; // inherited from NSObject
}

/**
 * @since 13.4
 */
declare const enum UIEventButtonMask {

	Primary = 1,

	Secondary = 2
}

/**
 * @since 13.4
 */
declare function UIEventButtonMaskForButtonNumber(buttonNumber: number): UIEventButtonMask;

declare const enum UIEventSubtype {

	None = 0,

	MotionShake = 1,

	RemoteControlPlay = 100,

	RemoteControlPause = 101,

	RemoteControlStop = 102,

	RemoteControlTogglePlayPause = 103,

	RemoteControlNextTrack = 104,

	RemoteControlPreviousTrack = 105,

	RemoteControlBeginSeekingBackward = 106,

	RemoteControlEndSeekingBackward = 107,

	RemoteControlBeginSeekingForward = 108,

	RemoteControlEndSeekingForward = 109
}

declare const enum UIEventType {

	Touches = 0,

	Motion = 1,

	RemoteControl = 2,

	Presses = 3,

	Scroll = 10,

	Hover = 11,

	Transform = 14
}

/**
 * @since 10.0
 */
declare class UIFeedbackGenerator extends NSObject implements UIInteraction {

	static alloc(): UIFeedbackGenerator; // inherited from NSObject

	/**
	 * @since 17.5
	 */
	static feedbackGeneratorForView(view: UIView): UIFeedbackGenerator;

	static new(): UIFeedbackGenerator; // inherited from NSObject

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly view: UIView; // inherited from UIInteraction

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	didMoveToView(view: UIView): void;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	prepare(): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	willMoveToView(view: UIView): void;
}

/**
 * @since 9.0
 */
declare class UIFieldBehavior extends UIDynamicBehavior {

	static alloc(): UIFieldBehavior; // inherited from NSObject

	static dragField(): UIFieldBehavior;

	static electricField(): UIFieldBehavior;

	static fieldWithEvaluationBlock(block: (p1: UIFieldBehavior, p2: CGPoint, p3: CGVector, p4: number, p5: number, p6: number) => CGVector): UIFieldBehavior;

	static linearGravityFieldWithVector(direction: CGVector): UIFieldBehavior;

	static magneticField(): UIFieldBehavior;

	static new(): UIFieldBehavior; // inherited from NSObject

	static noiseFieldWithSmoothnessAnimationSpeed(smoothness: number, speed: number): UIFieldBehavior;

	static radialGravityFieldWithPosition(position: CGPoint): UIFieldBehavior;

	static springField(): UIFieldBehavior;

	static turbulenceFieldWithSmoothnessAnimationSpeed(smoothness: number, speed: number): UIFieldBehavior;

	static velocityFieldWithVector(direction: CGVector): UIFieldBehavior;

	static vortexField(): UIFieldBehavior;

	animationSpeed: number;

	direction: CGVector;

	falloff: number;

	readonly items: NSArray<UIDynamicItem>;

	minimumRadius: number;

	position: CGPoint;

	region: UIRegion;

	smoothness: number;

	strength: number;

	addItem(item: UIDynamicItem): void;

	removeItem(item: UIDynamicItem): void;
}

/**
 * @since 16.0
 */
declare class UIFindInteraction extends NSObject implements UIInteraction {

	static alloc(): UIFindInteraction; // inherited from NSObject

	static new(): UIFindInteraction; // inherited from NSObject

	readonly activeFindSession: UIFindSession;

	readonly delegate: UIFindInteractionDelegate;

	readonly findNavigatorVisible: boolean;

	optionsMenuProvider: (p1: NSArray<UIMenuElement>) => UIMenu;

	replacementText: string;

	searchText: string;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly view: UIView; // inherited from UIInteraction

	readonly  // inherited from NSObjectProtocol

	constructor(o: { sessionDelegate: UIFindInteractionDelegate; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	didMoveToView(view: UIView): void;

	dismissFindNavigator(): void;

	findNext(): void;

	findPrevious(): void;

	initWithSessionDelegate(sessionDelegate: UIFindInteractionDelegate): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	presentFindNavigatorShowingReplace(showingReplace: boolean): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	updateResultCount(): void;

	willMoveToView(view: UIView): void;
}

/**
 * @since 16.0
 */
interface UIFindInteractionDelegate extends NSObjectProtocol {

	findInteractionDidBeginFindSession?(interaction: UIFindInteraction, session: UIFindSession): void;

	findInteractionDidEndFindSession?(interaction: UIFindInteraction, session: UIFindSession): void;

	findInteractionSessionForView(interaction: UIFindInteraction, view: UIView): UIFindSession;
}
declare var UIFindInteractionDelegate: {

	prototype: UIFindInteractionDelegate;
};

/**
 * @since 16.0
 */
declare class UIFindSession extends NSObject {

	static alloc(): UIFindSession; // inherited from NSObject

	static new(): UIFindSession; // inherited from NSObject

	/**
	 * @since 16.0
	 * @deprecated 16.0
	 */
	readonly allowsReplacement: boolean;

	readonly allowsReplacementForCurrentlyHighlightedResult: boolean;

	readonly highlightedResultIndex: number;

	readonly resultCount: number;

	searchResultDisplayStyle: UIFindSessionSearchResultDisplayStyle;

	readonly supportsReplacement: boolean;

	highlightNextResultInDirection(direction: UITextStorageDirection): void;

	invalidateFoundResults(): void;

	performSearchWithQueryOptions(query: string, options: UITextSearchOptions): void;

	performSingleReplacementWithSearchQueryReplacementStringOptions(searchQuery: string, replacementString: string, options: UITextSearchOptions): void;

	replaceAllInstancesOfSearchQueryWithReplacementStringOptions(searchQuery: string, replacementString: string, options: UITextSearchOptions): void;
}

declare const enum UIFindSessionSearchResultDisplayStyle {

	CurrentAndTotal = 0,

	Total = 1,

	None = 2
}

interface UIFloatRange {
	minimum: number;
	maximum: number;
}
declare var UIFloatRange: interop.StructType<UIFloatRange>;

/**
 * @since 9.0
 */
declare var UIFloatRangeInfinite: UIFloatRange;

/**
 * @since 9.0
 */
declare function UIFloatRangeIsInfinite(range: UIFloatRange): boolean;

/**
 * @since 9.0
 */
declare var UIFloatRangeZero: UIFloatRange;

/**
 * @since 11.0
 */
interface UIFocusAnimationContext extends NSObjectProtocol {

	duration: number;
}
declare var UIFocusAnimationContext: {

	prototype: UIFocusAnimationContext;
};

/**
 * @since 9.0
 */
declare class UIFocusAnimationCoordinator extends NSObject {

	static alloc(): UIFocusAnimationCoordinator; // inherited from NSObject

	static new(): UIFocusAnimationCoordinator; // inherited from NSObject

	addCoordinatedAnimationsCompletion(animations: () => void, completion: () => void): void;

	/**
	 * @since 11.0
	 */
	addCoordinatedFocusingAnimationsCompletion(animations: (p1: UIFocusAnimationContext) => void, completion: () => void): void;

	/**
	 * @since 11.0
	 */
	addCoordinatedUnfocusingAnimationsCompletion(animations: (p1: UIFocusAnimationContext) => void, completion: () => void): void;
}

/**
 * @since 11.0
 */
declare class UIFocusDebugger extends NSObject {

	static alloc(): UIFocusDebugger; // inherited from NSObject

	static checkFocusabilityForItem(item: UIFocusItem): UIFocusDebuggerOutput;

	static focusGroupsForEnvironment(environment: UIFocusEnvironment): UIFocusDebuggerOutput;

	static help(): UIFocusDebuggerOutput;

	static new(): UIFocusDebugger; // inherited from NSObject

	static preferredFocusEnvironmentsForEnvironment(environment: UIFocusEnvironment): UIFocusDebuggerOutput;

	static simulateFocusUpdateRequestFromEnvironment(environment: UIFocusEnvironment): UIFocusDebuggerOutput;

	static status(): UIFocusDebuggerOutput;
}

/**
 * @since 11.0
 */
interface UIFocusDebuggerOutput extends NSObjectProtocol {
}
declare var UIFocusDebuggerOutput: {

	prototype: UIFocusDebuggerOutput;
};

/**
 * @since 11.0
 */
declare var UIFocusDidUpdateNotification: string;

/**
 * @since 15.0
 */
declare class UIFocusEffect extends NSObject implements NSCopying {

	static alloc(): UIFocusEffect; // inherited from NSObject

	static effect(): UIFocusEffect;

	static new(): UIFocusEffect; // inherited from NSObject

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 9.0
 */
interface UIFocusEnvironment extends NSObjectProtocol {

	/**
	 * @since 14.0
	 */
	focusGroupIdentifier?: string;

	/**
	 * @since 12.0
	 */
	focusItemContainer: UIFocusItemContainer;

	/**
	 * @since 12.0
	 */
	parentFocusEnvironment: UIFocusEnvironment;

	preferredFocusEnvironments: NSArray<UIFocusEnvironment>;

	/**
	 * @since 9.0
	 * @deprecated 10.0
	 */
	preferredFocusedView?: UIView;

	didUpdateFocusInContextWithAnimationCoordinator(context: UIFocusUpdateContext, coordinator: UIFocusAnimationCoordinator): void;

	setNeedsFocusUpdate(): void;

	shouldUpdateFocusInContext(context: UIFocusUpdateContext): boolean;

	updateFocusIfNeeded(): void;
}
declare var UIFocusEnvironment: {

	prototype: UIFocusEnvironment;
};

/**
 * @since 15.0
 */
declare var UIFocusGroupPriorityCurrentlyFocused: number;

/**
 * @since 15.0
 */
declare var UIFocusGroupPriorityIgnored: number;

/**
 * @since 15.0
 */
declare var UIFocusGroupPriorityPreviouslyFocused: number;

/**
 * @since 15.0
 */
declare var UIFocusGroupPriorityPrioritized: number;

/**
 * @since 9.0
 */
declare class UIFocusGuide extends UILayoutGuide {

	static alloc(): UIFocusGuide; // inherited from NSObject

	static new(): UIFocusGuide; // inherited from NSObject

	enabled: boolean;

	/**
	 * @since 10.0
	 */
	preferredFocusEnvironments: NSArray<UIFocusEnvironment>;

	/**
	 * @since 9.0
	 * @deprecated 10.0
	 */
	preferredFocusedView: UIView;
}

/**
 * @since 15.0
 */
declare class UIFocusHaloEffect extends UIFocusEffect {

	static alloc(): UIFocusHaloEffect; // inherited from NSObject

	static effect(): UIFocusHaloEffect; // inherited from UIFocusEffect

	static effectWithPath(bezierPath: UIBezierPath): UIFocusHaloEffect;

	static effectWithRect(rect: CGRect): UIFocusHaloEffect;

	static effectWithRoundedRectCornerRadiusCurve(rect: CGRect, cornerRadius: number, curve: string): UIFocusHaloEffect;

	static new(): UIFocusHaloEffect; // inherited from NSObject

	containerView: UIView;

	position: UIFocusHaloEffectPosition;

	referenceView: UIView;
}

/**
 * @since 15.0
 */
declare const enum UIFocusHaloEffectPosition {

	Automatic = 0,

	Outside = 1,

	Inside = 2
}

/**
 * @since 9.0
 */
declare const enum UIFocusHeading {

	None = 0,

	Up = 1,

	Down = 2,

	Left = 4,

	Right = 8,

	Next = 16,

	Previous = 32,

	First = 256,

	Last = 512
}

/**
 * @since 10.0
 */
interface UIFocusItem extends UIFocusEnvironment {

	canBecomeFocused: boolean;

	/**
	 * @since 15.0
	 */
	focusEffect?: UIFocusEffect;

	/**
	 * @since 15.0
	 */
	focusGroupPriority?: number;

	/**
	 * @since 12.0
	 */
	frame: CGRect;

	/**
	 * @since 15.0
	 */
	isTransparentFocusItem?: boolean;

	/**
	 * @since 12.0
	 */
	didHintFocusMovement?(hint: UIFocusMovementHint): void;
}
declare var UIFocusItem: {

	prototype: UIFocusItem;
};

/**
 * @since 12.0
 */
interface UIFocusItemContainer extends NSObjectProtocol {

	coordinateSpace: UICoordinateSpace;

	focusItemsInRect(rect: CGRect): NSArray<UIFocusItem>;
}
declare var UIFocusItemContainer: {

	prototype: UIFocusItemContainer;
};

/**
 * @since 12.0
 */
interface UIFocusItemScrollableContainer extends UIFocusItemContainer {

	contentOffset: CGPoint;

	contentSize: CGSize;

	visibleSize: CGSize;
}
declare var UIFocusItemScrollableContainer: {

	prototype: UIFocusItemScrollableContainer;
};

/**
 * @since 11.0
 */
declare var UIFocusMovementDidFailNotification: string;

/**
 * @since 12.0
 */
declare class UIFocusMovementHint extends NSObject implements NSCopying {

	static alloc(): UIFocusMovementHint; // inherited from NSObject

	static new(): UIFocusMovementHint; // inherited from NSObject

	readonly interactionTransform: CATransform3D;

	readonly movementDirection: CGVector;

	readonly perspectiveTransform: CATransform3D;

	readonly rotation: CGVector;

	readonly translation: CGVector;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 11.0
 */
declare class UIFocusSystem extends NSObject {

	static alloc(): UIFocusSystem; // inherited from NSObject

	static environmentContainsEnvironment(environment: UIFocusEnvironment, otherEnvironment: UIFocusEnvironment): boolean;

	/**
	 * @since 12.0
	 */
	static focusSystemForEnvironment(environment: UIFocusEnvironment): UIFocusSystem;

	static new(): UIFocusSystem; // inherited from NSObject

	/**
	 * @since 12.0
	 */
	readonly focusedItem: UIFocusItem;

	/**
	 * @since 12.0
	 */
	requestFocusUpdateToEnvironment(environment: UIFocusEnvironment): void;

	/**
	 * @since 12.0
	 */
	updateFocusIfNeeded(): void;
}

/**
 * @since 11.0
 */
declare var UIFocusUpdateAnimationCoordinatorKey: string;

/**
 * @since 9.0
 */
declare class UIFocusUpdateContext extends NSObject {

	static alloc(): UIFocusUpdateContext; // inherited from NSObject

	static new(): UIFocusUpdateContext; // inherited from NSObject

	readonly focusHeading: UIFocusHeading;

	/**
	 * @since 10.0
	 */
	readonly nextFocusedItem: UIFocusItem;

	readonly nextFocusedView: UIView;

	/**
	 * @since 10.0
	 */
	readonly previouslyFocusedItem: UIFocusItem;

	readonly previouslyFocusedView: UIView;
}

/**
 * @since 11.0
 */
declare var UIFocusUpdateContextKey: string;

/**
 * @since 2.0
 */
declare class UIFont extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UIFont; // inherited from NSObject

	static boldSystemFontOfSize(fontSize: number): UIFont;

	static fontNamesForFamilyName(familyName: string): NSArray<string>;

	/**
	 * @since 7.0
	 */
	static fontWithDescriptorSize(descriptor: UIFontDescriptor, pointSize: number): UIFont;

	static fontWithNameSize(fontName: string, fontSize: number): UIFont;

	static italicSystemFontOfSize(fontSize: number): UIFont;

	/**
	 * @since 9.0
	 */
	static monospacedDigitSystemFontOfSizeWeight(fontSize: number, weight: number): UIFont;

	/**
	 * @since 13.0
	 */
	static monospacedSystemFontOfSizeWeight(fontSize: number, weight: number): UIFont;

	static new(): UIFont; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	static preferredFontForTextStyle(style: string): UIFont;

	/**
	 * @since 10.0
	 */
	static preferredFontForTextStyleCompatibleWithTraitCollection(style: string, traitCollection: UITraitCollection): UIFont;

	static systemFontOfSize(fontSize: number): UIFont;

	/**
	 * @since 8.2
	 */
	static systemFontOfSizeWeight(fontSize: number, weight: number): UIFont;

	/**
	 * @since 16.0
	 */
	static systemFontOfSizeWeightWidth(fontSize: number, weight: number, width: number): UIFont;

	readonly ascender: number;

	readonly capHeight: number;

	readonly descender: number;

	readonly familyName: string;

	/**
	 * @since 7.0
	 */
	readonly fontDescriptor: UIFontDescriptor;

	readonly fontName: string;

	readonly leading: number;

	/**
	 * @since 4.0
	 */
	readonly lineHeight: number;

	readonly pointSize: number;

	readonly xHeight: number;

	static readonly buttonFontSize: number;

	static readonly familyNames: NSArray<string>;

	static readonly labelFontSize: number;

	static readonly smallSystemFontSize: number;

	static readonly systemFontSize: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	fontWithSize(fontSize: number): UIFont;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 7.0
 */
declare class UIFontDescriptor extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UIFontDescriptor; // inherited from NSObject

	static fontDescriptorWithFontAttributes(attributes: NSDictionary<string, any>): UIFontDescriptor;

	static fontDescriptorWithNameMatrix(fontName: string, matrix: CGAffineTransform): UIFontDescriptor;

	static fontDescriptorWithNameSize(fontName: string, size: number): UIFontDescriptor;

	static new(): UIFontDescriptor; // inherited from NSObject

	static preferredFontDescriptorWithTextStyle(style: string): UIFontDescriptor;

	/**
	 * @since 10.0
	 */
	static preferredFontDescriptorWithTextStyleCompatibleWithTraitCollection(style: string, traitCollection: UITraitCollection): UIFontDescriptor;

	readonly fontAttributes: NSDictionary<string, any>;

	readonly matrix: CGAffineTransform;

	readonly pointSize: number;

	readonly postscriptName: string;

	readonly symbolicTraits: UIFontDescriptorSymbolicTraits;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { fontAttributes: NSDictionary<string, any>; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	fontDescriptorByAddingAttributes(attributes: NSDictionary<string, any>): UIFontDescriptor;

	/**
	 * @since 13.0
	 */
	fontDescriptorWithDesign(design: string): UIFontDescriptor;

	fontDescriptorWithFace(newFace: string): UIFontDescriptor;

	fontDescriptorWithFamily(newFamily: string): UIFontDescriptor;

	fontDescriptorWithMatrix(matrix: CGAffineTransform): UIFontDescriptor;

	fontDescriptorWithSize(newPointSize: number): UIFontDescriptor;

	fontDescriptorWithSymbolicTraits(symbolicTraits: UIFontDescriptorSymbolicTraits): UIFontDescriptor;

	initWithCoder(coder: NSCoder): this;

	initWithFontAttributes(attributes: NSDictionary<string, any>): this;

	matchingFontDescriptorsWithMandatoryKeys(mandatoryKeys: NSSet<string>): NSArray<UIFontDescriptor>;

	objectForKey(anAttribute: string): any;
}

/**
 * @since 7.0
 */
declare var UIFontDescriptorCascadeListAttribute: string;

/**
 * @since 7.0
 */
declare var UIFontDescriptorCharacterSetAttribute: string;

/**
 * @since 7.0
 */
declare var UIFontDescriptorFaceAttribute: string;

/**
 * @since 7.0
 */
declare var UIFontDescriptorFamilyAttribute: string;

/**
 * @since 7.0
 */
declare var UIFontDescriptorFeatureSettingsAttribute: string;

/**
 * @since 7.0
 */
declare var UIFontDescriptorFixedAdvanceAttribute: string;

/**
 * @since 7.0
 */
declare var UIFontDescriptorMatrixAttribute: string;

/**
 * @since 7.0
 */
declare var UIFontDescriptorNameAttribute: string;

/**
 * @since 7.0
 */
declare var UIFontDescriptorSizeAttribute: string;

/**
 * @since 7.0
 */
declare const enum UIFontDescriptorSymbolicTraits {

	TraitItalic = 1,

	TraitBold = 2,

	TraitExpanded = 32,

	TraitCondensed = 64,

	TraitMonoSpace = 1024,

	TraitVertical = 2048,

	TraitUIOptimized = 4096,

	TraitTightLeading = 32768,

	TraitLooseLeading = 65536,

	ClassMask = 4026531840,

	ClassUnknown = 0,

	ClassOldStyleSerifs = 268435456,

	ClassTransitionalSerifs = 536870912,

	ClassModernSerifs = 805306368,

	ClassClarendonSerifs = 1073741824,

	ClassSlabSerifs = 1342177280,

	ClassFreeformSerifs = 1879048192,

	ClassSansSerif = 2147483648,

	ClassOrnamentals = 2415919104,

	ClassScripts = 2684354560,

	ClassSymbolic = 3221225472
}

/**
 * @since 13.0
 */
declare var UIFontDescriptorSystemDesignDefault: string;

/**
 * @since 13.0
 */
declare var UIFontDescriptorSystemDesignMonospaced: string;

/**
 * @since 13.0
 */
declare var UIFontDescriptorSystemDesignRounded: string;

/**
 * @since 13.0
 */
declare var UIFontDescriptorSystemDesignSerif: string;

/**
 * @since 7.0
 */
declare var UIFontDescriptorTextStyleAttribute: string;

/**
 * @since 7.0
 */
declare var UIFontDescriptorTraitsAttribute: string;

/**
 * @since 7.0
 */
declare var UIFontDescriptorVisibleNameAttribute: string;

/**
 * @since 7.0
 */
declare var UIFontFeatureSelectorIdentifierKey: string;

/**
 * @since 7.0
 */
declare var UIFontFeatureTypeIdentifierKey: string;

/**
 * @since 11.0
 */
declare class UIFontMetrics extends NSObject {

	static alloc(): UIFontMetrics; // inherited from NSObject

	static metricsForTextStyle(textStyle: string): UIFontMetrics;

	static new(): UIFontMetrics; // inherited from NSObject

	static readonly defaultMetrics: UIFontMetrics;

	constructor(o: { forTextStyle: string; });

	initForTextStyle(textStyle: string): this;

	scaledFontForFont(font: UIFont): UIFont;

	scaledFontForFontCompatibleWithTraitCollection(font: UIFont, traitCollection: UITraitCollection): UIFont;

	scaledFontForFontMaximumPointSize(font: UIFont, maximumPointSize: number): UIFont;

	scaledFontForFontMaximumPointSizeCompatibleWithTraitCollection(font: UIFont, maximumPointSize: number, traitCollection: UITraitCollection): UIFont;

	scaledValueForValue(value: number): number;

	scaledValueForValueCompatibleWithTraitCollection(value: number, traitCollection: UITraitCollection): number;
}

/**
 * @since 13.0
 */
declare class UIFontPickerViewController extends UIViewController {

	static alloc(): UIFontPickerViewController; // inherited from NSObject

	static new(): UIFontPickerViewController; // inherited from NSObject

	readonly configuration: UIFontPickerViewControllerConfiguration;

	delegate: UIFontPickerViewControllerDelegate;

	selectedFontDescriptor: UIFontDescriptor;

	constructor(o: { configuration: UIFontPickerViewControllerConfiguration; });

	initWithConfiguration(configuration: UIFontPickerViewControllerConfiguration): this;
}

/**
 * @since 13.0
 */
declare class UIFontPickerViewControllerConfiguration extends NSObject implements NSCopying {

	static alloc(): UIFontPickerViewControllerConfiguration; // inherited from NSObject

	/**
	 * @since 13.0
	 * @deprecated 18.0
	 */
	static filterPredicateForFilteredLanguages(filteredLanguages: NSArray<string> | string[]): NSPredicate;

	static new(): UIFontPickerViewControllerConfiguration; // inherited from NSObject

	displayUsingSystemFont: boolean;

	/**
	 * @since 13.0
	 * @deprecated 18.0
	 */
	filteredLanguagesPredicate: NSPredicate;

	filteredTraits: UIFontDescriptorSymbolicTraits;

	includeFaces: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 13.0
 */
interface UIFontPickerViewControllerDelegate extends NSObjectProtocol {

	fontPickerViewControllerDidCancel?(viewController: UIFontPickerViewController): void;

	fontPickerViewControllerDidPickFont?(viewController: UIFontPickerViewController): void;
}
declare var UIFontPickerViewControllerDelegate: {

	prototype: UIFontPickerViewControllerDelegate;
};

/**
 * @since 7.0
 */
declare var UIFontSlantTrait: string;

/**
 * @since 7.0
 */
declare var UIFontSymbolicTrait: string;

/**
 * @since 7.0
 */
declare var UIFontTextStyleBody: string;

/**
 * @since 9.0
 */
declare var UIFontTextStyleCallout: string;

/**
 * @since 7.0
 */
declare var UIFontTextStyleCaption1: string;

/**
 * @since 7.0
 */
declare var UIFontTextStyleCaption2: string;

/**
 * @since 17.0
 */
declare var UIFontTextStyleExtraLargeTitle: string;

/**
 * @since 17.0
 */
declare var UIFontTextStyleExtraLargeTitle2: string;

/**
 * @since 7.0
 */
declare var UIFontTextStyleFootnote: string;

/**
 * @since 7.0
 */
declare var UIFontTextStyleHeadline: string;

/**
 * @since 11.0
 */
declare var UIFontTextStyleLargeTitle: string;

/**
 * @since 7.0
 */
declare var UIFontTextStyleSubheadline: string;

/**
 * @since 9.0
 */
declare var UIFontTextStyleTitle1: string;

/**
 * @since 9.0
 */
declare var UIFontTextStyleTitle2: string;

/**
 * @since 9.0
 */
declare var UIFontTextStyleTitle3: string;

/**
 * @since 8.2
 */
declare var UIFontWeightBlack: number;

/**
 * @since 8.2
 */
declare var UIFontWeightBold: number;

/**
 * @since 13.0
 */
declare function UIFontWeightForImageSymbolWeight(symbolWeight: UIImageSymbolWeight): number;

/**
 * @since 8.2
 */
declare var UIFontWeightHeavy: number;

/**
 * @since 8.2
 */
declare var UIFontWeightLight: number;

/**
 * @since 8.2
 */
declare var UIFontWeightMedium: number;

/**
 * @since 8.2
 */
declare var UIFontWeightRegular: number;

/**
 * @since 8.2
 */
declare var UIFontWeightSemibold: number;

/**
 * @since 8.2
 */
declare var UIFontWeightThin: number;

/**
 * @since 7.0
 */
declare var UIFontWeightTrait: string;

/**
 * @since 8.2
 */
declare var UIFontWeightUltraLight: number;

/**
 * @since 16.0
 */
declare var UIFontWidthCompressed: number;

/**
 * @since 16.0
 */
declare var UIFontWidthCondensed: number;

/**
 * @since 16.0
 */
declare var UIFontWidthExpanded: number;

/**
 * @since 16.0
 */
declare var UIFontWidthStandard: number;

/**
 * @since 7.0
 */
declare var UIFontWidthTrait: string;

declare const enum UIForceTouchCapability {

	Unknown = 0,

	Unavailable = 1,

	Available = 2
}

/**
 * @since 3.2
 */
declare class UIGestureRecognizer extends NSObject {

	static alloc(): UIGestureRecognizer; // inherited from NSObject

	static new(): UIGestureRecognizer; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	allowedPressTypes: NSArray<number>;

	/**
	 * @since 9.0
	 */
	allowedTouchTypes: NSArray<number>;

	/**
	 * @since 13.4
	 */
	readonly buttonMask: UIEventButtonMask;

	cancelsTouchesInView: boolean;

	delaysTouchesBegan: boolean;

	delaysTouchesEnded: boolean;

	delegate: UIGestureRecognizerDelegate;

	enabled: boolean;

	/**
	 * @since 13.4
	 */
	readonly modifierFlags: UIKeyModifierFlags;

	/**
	 * @since 11.0
	 */
	name: string;

	readonly numberOfTouches: number;

	/**
	 * @since 9.2
	 */
	requiresExclusiveTouchType: boolean;

	state: UIGestureRecognizerState;

	readonly view: UIView;

	constructor(o: { coder: NSCoder; });

	constructor(o: { target: any; action: string; });

	addTargetAction(target: any, action: string): void;

	canBePreventedByGestureRecognizer(preventingGestureRecognizer: UIGestureRecognizer): boolean;

	canPreventGestureRecognizer(preventedGestureRecognizer: UIGestureRecognizer): boolean;

	/**
	 * @since 9.0
	 */
	ignorePressForEvent(button: UIPress, event: UIPressesEvent): void;

	ignoreTouchForEvent(touch: UITouch, event: _UIEvent): void;

	initWithCoder(coder: NSCoder): this;

	initWithTargetAction(target: any, action: string): this;

	locationInView(view: UIView): CGPoint;

	locationOfTouchInView(touchIndex: number, view: UIView): CGPoint;

	/**
	 * @since 9.0
	 */
	pressesBeganWithEvent(presses: NSSet<UIPress>, event: UIPressesEvent): void;

	/**
	 * @since 9.0
	 */
	pressesCancelledWithEvent(presses: NSSet<UIPress>, event: UIPressesEvent): void;

	/**
	 * @since 9.0
	 */
	pressesChangedWithEvent(presses: NSSet<UIPress>, event: UIPressesEvent): void;

	/**
	 * @since 9.0
	 */
	pressesEndedWithEvent(presses: NSSet<UIPress>, event: UIPressesEvent): void;

	removeTargetAction(target: any, action: string): void;

	requireGestureRecognizerToFail(otherGestureRecognizer: UIGestureRecognizer): void;

	reset(): void;

	/**
	 * @since 7.0
	 */
	shouldBeRequiredToFailByGestureRecognizer(otherGestureRecognizer: UIGestureRecognizer): boolean;

	/**
	 * @since 13.4
	 */
	shouldReceiveEvent(event: _UIEvent): boolean;

	/**
	 * @since 7.0
	 */
	shouldRequireFailureOfGestureRecognizer(otherGestureRecognizer: UIGestureRecognizer): boolean;

	touchesBeganWithEvent(touches: NSSet<UITouch>, event: _UIEvent): void;

	touchesCancelledWithEvent(touches: NSSet<UITouch>, event: _UIEvent): void;

	touchesEndedWithEvent(touches: NSSet<UITouch>, event: _UIEvent): void;

	/**
	 * @since 9.1
	 */
	touchesEstimatedPropertiesUpdated(touches: NSSet<UITouch>): void;

	touchesMovedWithEvent(touches: NSSet<UITouch>, event: _UIEvent): void;
}

interface UIGestureRecognizerDelegate extends NSObjectProtocol {

	/**
	 * @since 7.0
	 */
	gestureRecognizerShouldBeRequiredToFailByGestureRecognizer?(gestureRecognizer: UIGestureRecognizer, otherGestureRecognizer: UIGestureRecognizer): boolean;

	gestureRecognizerShouldBegin?(gestureRecognizer: UIGestureRecognizer): boolean;

	/**
	 * @since 13.4
	 */
	gestureRecognizerShouldReceiveEvent?(gestureRecognizer: UIGestureRecognizer, event: _UIEvent): boolean;

	gestureRecognizerShouldReceivePress?(gestureRecognizer: UIGestureRecognizer, press: UIPress): boolean;

	gestureRecognizerShouldReceiveTouch?(gestureRecognizer: UIGestureRecognizer, touch: UITouch): boolean;

	gestureRecognizerShouldRecognizeSimultaneouslyWithGestureRecognizer?(gestureRecognizer: UIGestureRecognizer, otherGestureRecognizer: UIGestureRecognizer): boolean;

	/**
	 * @since 7.0
	 */
	gestureRecognizerShouldRequireFailureOfGestureRecognizer?(gestureRecognizer: UIGestureRecognizer, otherGestureRecognizer: UIGestureRecognizer): boolean;
}
declare var UIGestureRecognizerDelegate: {

	prototype: UIGestureRecognizerDelegate;
};

declare const enum UIGestureRecognizerState {

	Possible = 0,

	Began = 1,

	Changed = 2,

	Ended = 3,

	Cancelled = 4,

	Failed = 5,

	Recognized = 3
}

/**
 * @since 3.2
 */
declare function UIGraphicsAddPDFContextDestinationAtPoint(name: string, point: CGPoint): void;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function UIGraphicsBeginImageContext(size: CGSize): void;

/**
 * @since 4.0
 * @deprecated 100000
 */
declare function UIGraphicsBeginImageContextWithOptions(size: CGSize, opaque: boolean, scale: number): void;

/**
 * @since 3.2
 */
declare function UIGraphicsBeginPDFContextToData(data: NSMutableData, bounds: CGRect, documentInfo: NSDictionary<any, any>): void;

/**
 * @since 3.2
 */
declare function UIGraphicsBeginPDFContextToFile(path: string, bounds: CGRect, documentInfo: NSDictionary<any, any>): boolean;

/**
 * @since 3.2
 */
declare function UIGraphicsBeginPDFPage(): void;

/**
 * @since 3.2
 */
declare function UIGraphicsBeginPDFPageWithInfo(bounds: CGRect, pageInfo: NSDictionary<any, any>): void;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function UIGraphicsEndImageContext(): void;

/**
 * @since 3.2
 */
declare function UIGraphicsEndPDFContext(): void;

declare function UIGraphicsGetCurrentContext(): any;

/**
 * @since 2.0
 * @deprecated 100000
 */
declare function UIGraphicsGetImageFromCurrentImageContext(): UIImage;

/**
 * @since 3.2
 */
declare function UIGraphicsGetPDFContextBounds(): CGRect;

/**
 * @since 10.0
 */
declare class UIGraphicsImageRenderer extends UIGraphicsRenderer {

	static alloc(): UIGraphicsImageRenderer; // inherited from NSObject

	static new(): UIGraphicsImageRenderer; // inherited from NSObject

	constructor(o: { bounds: CGRect; format: UIGraphicsImageRendererFormat; });

	constructor(o: { size: CGSize; });

	constructor(o: { size: CGSize; format: UIGraphicsImageRendererFormat; });

	JPEGDataWithCompressionQualityActions(compressionQuality: number, actions: (p1: UIGraphicsImageRendererContext) => void): NSData;

	PNGDataWithActions(actions: (p1: UIGraphicsImageRendererContext) => void): NSData;

	imageWithActions(actions: (p1: UIGraphicsImageRendererContext) => void): UIImage;

	initWithBoundsFormat(bounds: CGRect, format: UIGraphicsImageRendererFormat): this;

	initWithSize(size: CGSize): this;

	initWithSizeFormat(size: CGSize, format: UIGraphicsImageRendererFormat): this;
}

/**
 * @since 10.0
 */
declare class UIGraphicsImageRendererContext extends UIGraphicsRendererContext {

	static alloc(): UIGraphicsImageRendererContext; // inherited from NSObject

	static new(): UIGraphicsImageRendererContext; // inherited from NSObject

	readonly currentImage: UIImage;
}

/**
 * @since 10.0
 */
declare class UIGraphicsImageRendererFormat extends UIGraphicsRendererFormat {

	static alloc(): UIGraphicsImageRendererFormat; // inherited from NSObject

	/**
	 * @since 10.0
	 */
	static defaultFormat(): UIGraphicsImageRendererFormat; // inherited from UIGraphicsRendererFormat

	/**
	 * @since 11.0
	 */
	static formatForTraitCollection(traitCollection: UITraitCollection): UIGraphicsImageRendererFormat;

	static new(): UIGraphicsImageRendererFormat; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	static preferredFormat(): UIGraphicsImageRendererFormat; // inherited from UIGraphicsRendererFormat

	opaque: boolean;

	/**
	 * @since 12.0
	 */
	preferredRange: UIGraphicsImageRendererFormatRange;

	/**
	 * @since 10.0
	 * @deprecated 12.0
	 */
	prefersExtendedRange: boolean;

	scale: number;

	/**
	 * @since 17.0
	 */
	readonly supportsHighDynamicRange: boolean;
}

/**
 * @since 12.0
 */
declare const enum UIGraphicsImageRendererFormatRange {

	Unspecified = -1,

	Automatic = 0,

	Extended = 1,

	Standard = 2
}

/**
 * @since 10.0
 */
declare class UIGraphicsPDFRenderer extends UIGraphicsRenderer {

	static alloc(): UIGraphicsPDFRenderer; // inherited from NSObject

	static new(): UIGraphicsPDFRenderer; // inherited from NSObject

	constructor(o: { bounds: CGRect; format: UIGraphicsPDFRendererFormat; });

	PDFDataWithActions(actions: (p1: UIGraphicsPDFRendererContext) => void): NSData;

	initWithBoundsFormat(bounds: CGRect, format: UIGraphicsPDFRendererFormat): this;

	writePDFToURLWithActionsError(url: NSURL, actions: (p1: UIGraphicsPDFRendererContext) => void): boolean;
}

/**
 * @since 10.0
 */
declare class UIGraphicsPDFRendererContext extends UIGraphicsRendererContext {

	static alloc(): UIGraphicsPDFRendererContext; // inherited from NSObject

	static new(): UIGraphicsPDFRendererContext; // inherited from NSObject

	readonly pdfContextBounds: CGRect;

	addDestinationWithNameAtPoint(name: string, point: CGPoint): void;

	beginPage(): void;

	beginPageWithBoundsPageInfo(bounds: CGRect, pageInfo: NSDictionary<string, any>): void;

	setDestinationWithNameForRect(name: string, rect: CGRect): void;

	setURLForRect(url: NSURL, rect: CGRect): void;
}

/**
 * @since 10.0
 */
declare class UIGraphicsPDFRendererFormat extends UIGraphicsRendererFormat {

	static alloc(): UIGraphicsPDFRendererFormat; // inherited from NSObject

	/**
	 * @since 10.0
	 */
	static defaultFormat(): UIGraphicsPDFRendererFormat; // inherited from UIGraphicsRendererFormat

	static new(): UIGraphicsPDFRendererFormat; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	static preferredFormat(): UIGraphicsPDFRendererFormat; // inherited from UIGraphicsRendererFormat

	documentInfo: NSDictionary<string, any>;
}

declare function UIGraphicsPopContext(): void;

declare function UIGraphicsPushContext(context: any): void;

/**
 * @since 10.0
 */
declare class UIGraphicsRenderer extends NSObject {

	static alloc(): UIGraphicsRenderer; // inherited from NSObject

	/**
	 * @since 10.0
	 */
	static contextWithFormat(format: UIGraphicsRendererFormat): any;

	static new(): UIGraphicsRenderer; // inherited from NSObject

	/**
	 * @since 10.0
	 */
	static prepareCGContextWithRendererContext(context: any, rendererContext: UIGraphicsRendererContext): void;

	/**
	 * @since 10.0
	 */
	static rendererContextClass(): typeof NSObject;

	readonly allowsImageOutput: boolean;

	readonly format: UIGraphicsRendererFormat;

	constructor(o: { bounds: CGRect; });

	constructor(o: { bounds: CGRect; format: UIGraphicsRendererFormat; });

	initWithBounds(bounds: CGRect): this;

	initWithBoundsFormat(bounds: CGRect, format: UIGraphicsRendererFormat): this;

	/**
	 * @since 10.0
	 */
	runDrawingActionsCompletionActionsError(drawingActions: (p1: UIGraphicsRendererContext) => void, completionActions: (p1: UIGraphicsRendererContext) => void): boolean;
}

/**
 * @since 10.0
 */
declare class UIGraphicsRendererContext extends NSObject {

	static alloc(): UIGraphicsRendererContext; // inherited from NSObject

	static new(): UIGraphicsRendererContext; // inherited from NSObject

	readonly CGContext: any;

	readonly format: UIGraphicsRendererFormat;

	clipToRect(rect: CGRect): void;

	fillRect(rect: CGRect): void;

	fillRectBlendMode(rect: CGRect, blendMode: CGBlendMode): void;

	strokeRect(rect: CGRect): void;

	strokeRectBlendMode(rect: CGRect, blendMode: CGBlendMode): void;
}

/**
 * @since 10.0
 */
declare class UIGraphicsRendererFormat extends NSObject implements NSCopying {

	static alloc(): UIGraphicsRendererFormat; // inherited from NSObject

	/**
	 * @since 10.0
	 */
	static defaultFormat(): UIGraphicsRendererFormat;

	static new(): UIGraphicsRendererFormat; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	static preferredFormat(): UIGraphicsRendererFormat;

	readonly bounds: CGRect;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 3.2
 */
declare function UIGraphicsSetPDFContextDestinationForRect(name: string, rect: CGRect): void;

/**
 * @since 3.2
 */
declare function UIGraphicsSetPDFContextURLForRect(url: NSURL, rect: CGRect): void;

/**
 * @since 7.0
 */
declare class UIGravityBehavior extends UIDynamicBehavior {

	static alloc(): UIGravityBehavior; // inherited from NSObject

	static new(): UIGravityBehavior; // inherited from NSObject

	angle: number;

	gravityDirection: CGVector;

	readonly items: NSArray<UIDynamicItem>;

	magnitude: number;

	constructor(o: { items: NSArray<UIDynamicItem> | UIDynamicItem[]; });

	addItem(item: UIDynamicItem): void;

	initWithItems(items: NSArray<UIDynamicItem> | UIDynamicItem[]): this;

	removeItem(item: UIDynamicItem): void;

	setAngleMagnitude(angle: number, magnitude: number): void;
}

/**
 * @since 12.2
 */
declare const enum UIGuidedAccessAccessibilityFeature {

	VoiceOver = 1,

	Zoom = 2,

	AssistiveTouch = 4,

	InvertColors = 8,

	GrayscaleDisplay = 16
}

/**
 * @since 12.2
 */
declare function UIGuidedAccessConfigureAccessibilityFeatures(features: UIGuidedAccessAccessibilityFeature, enabled: boolean, completion: (p1: boolean, p2: NSError) => void): void;

/**
 * @since 12.2
 */
declare const enum UIGuidedAccessErrorCode {

	PermissionDenied = 0,

	Failed = 9223372036854775807
}

/**
 * @since 12.2
 */
declare var UIGuidedAccessErrorDomain: string;

/**
 * @since 7.0
 */
interface UIGuidedAccessRestrictionDelegate extends NSObjectProtocol {

	guidedAccessRestrictionIdentifiers: NSArray<string>;

	detailTextForGuidedAccessRestrictionWithIdentifier?(restrictionIdentifier: string): string;

	guidedAccessRestrictionWithIdentifierDidChangeState(restrictionIdentifier: string, newRestrictionState: UIGuidedAccessRestrictionState): void;

	textForGuidedAccessRestrictionWithIdentifier(restrictionIdentifier: string): string;
}
declare var UIGuidedAccessRestrictionDelegate: {

	prototype: UIGuidedAccessRestrictionDelegate;
};

declare const enum UIGuidedAccessRestrictionState {

	Allow = 0,

	Deny = 1
}

/**
 * @since 7.0
 */
declare function UIGuidedAccessRestrictionStateForIdentifier(restrictionIdentifier: string): UIGuidedAccessRestrictionState;

/**
 * @since 17.0
 */
declare class UIHoverAutomaticEffect extends NSObject implements UIHoverEffect {

	static alloc(): UIHoverAutomaticEffect; // inherited from NSObject

	static effect(): UIHoverAutomaticEffect;

	static new(): UIHoverAutomaticEffect; // inherited from NSObject

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

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
 * @since 17.0
 */
interface UIHoverEffect extends NSCopying, NSObjectProtocol {
}
declare var UIHoverEffect: {

	prototype: UIHoverEffect;
};

/**
 * @since 13.0
 */
declare class UIHoverGestureRecognizer extends UIGestureRecognizer {

	static alloc(): UIHoverGestureRecognizer; // inherited from NSObject

	static new(): UIHoverGestureRecognizer; // inherited from NSObject

	/**
	 * @since 16.4
	 */
	readonly altitudeAngle: number;

	/**
	 * @since 17.5
	 */
	readonly rollAngle: number;

	/**
	 * @since 16.1
	 */
	readonly zOffset: number;

	/**
	 * @since 16.4
	 */
	azimuthAngleInView(view: UIView): number;

	/**
	 * @since 16.4
	 */
	azimuthUnitVectorInView(view: UIView): CGVector;
}

/**
 * @since 17.0
 */
declare class UIHoverHighlightEffect extends NSObject implements UIHoverEffect {

	static alloc(): UIHoverHighlightEffect; // inherited from NSObject

	static effect(): UIHoverHighlightEffect;

	static new(): UIHoverHighlightEffect; // inherited from NSObject

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

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
 * @since 17.0
 */
declare class UIHoverLiftEffect extends NSObject implements UIHoverEffect {

	static alloc(): UIHoverLiftEffect; // inherited from NSObject

	static effect(): UIHoverLiftEffect;

	static new(): UIHoverLiftEffect; // inherited from NSObject

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

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
 * @since 17.0
 */
declare class UIHoverStyle extends NSObject implements NSCopying {

	static alloc(): UIHoverStyle; // inherited from NSObject

	static automaticStyle(): UIHoverStyle;

	static new(): UIHoverStyle; // inherited from NSObject

	static styleWithEffectShape(effect: UIHoverEffect, shape: UIShape): UIHoverStyle;

	static styleWithShape(shape: UIShape): UIHoverStyle;

	effect: UIHoverEffect;

	enabled: boolean;

	shape: UIShape;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 2.0
 */
declare class UIImage extends NSObject implements NSItemProviderReading, NSItemProviderWriting, NSSecureCoding, UIAccessibilityIdentification, UIItemProviderPresentationSizeProviding {

	static alloc(): UIImage; // inherited from NSObject

	/**
	 * @since 5.0
	 */
	static animatedImageNamedDuration(name: string, duration: number): UIImage;

	/**
	 * @since 5.0
	 */
	static animatedImageWithImagesDuration(images: NSArray<UIImage> | UIImage[], duration: number): UIImage;

	/**
	 * @since 5.0
	 */
	static animatedResizableImageNamedCapInsetsDuration(name: string, capInsets: UIEdgeInsets, duration: number): UIImage;

	/**
	 * @since 6.0
	 */
	static animatedResizableImageNamedCapInsetsResizingModeDuration(name: string, capInsets: UIEdgeInsets, resizingMode: UIImageResizingMode, duration: number): UIImage;

	static imageNamed(name: string): UIImage;

	/**
	 * @since 8.0
	 */
	static imageNamedInBundleCompatibleWithTraitCollection(name: string, bundle: NSBundle, traitCollection: UITraitCollection): UIImage;

	/**
	 * @since 16.0
	 */
	static imageNamedInBundleVariableValueWithConfiguration(name: string, bundle: NSBundle, value: number, configuration: UIImageConfiguration): UIImage;

	/**
	 * @since 13.0
	 */
	static imageNamedInBundleWithConfiguration(name: string, bundle: NSBundle, configuration: UIImageConfiguration): UIImage;

	static imageWithCGImage(cgImage: any): UIImage;

	/**
	 * @since 4.0
	 */
	static imageWithCGImageScaleOrientation(cgImage: any, scale: number, orientation: UIImageOrientation): UIImage;

	/**
	 * @since 5.0
	 */
	static imageWithCIImage(ciImage: CIImage): UIImage;

	/**
	 * @since 6.0
	 */
	static imageWithCIImageScaleOrientation(ciImage: CIImage, scale: number, orientation: UIImageOrientation): UIImage;

	static imageWithContentsOfFile(path: string): UIImage;

	static imageWithData(data: NSData): UIImage;

	/**
	 * @since 6.0
	 */
	static imageWithDataScale(data: NSData, scale: number): UIImage;

	static itemProviderVisibilityForRepresentationWithTypeIdentifier(typeIdentifier: string): NSItemProviderRepresentationVisibility;

	static new(): UIImage; // inherited from NSObject

	static objectWithItemProviderDataTypeIdentifierError(data: NSData, typeIdentifier: string): UIImage;

	/**
	 * @since 13.0
	 */
	static systemImageNamed(name: string): UIImage;

	/**
	 * @since 13.0
	 */
	static systemImageNamedCompatibleWithTraitCollection(name: string, traitCollection: UITraitCollection): UIImage;

	/**
	 * @since 16.0
	 */
	static systemImageNamedVariableValueWithConfiguration(name: string, value: number, configuration: UIImageConfiguration): UIImage;

	/**
	 * @since 13.0
	 */
	static systemImageNamedWithConfiguration(name: string, configuration: UIImageConfiguration): UIImage;

	static tns_decodeImageWidthContentsOfFileCompletion(file: string, callback: (p1: UIImage) => void): void;

	static tns_decodeImageWithDataCompletion(data: NSData, callback: (p1: UIImage) => void): void;

	static tns_safeDecodeImageNamedCompletion(name: string, callback: (p1: UIImage) => void): void;

	static tns_safeImageNamed(name: string): UIImage;

	readonly CGImage: any;

	/**
	 * @since 5.0
	 */
	readonly CIImage: CIImage;

	/**
	 * @since 6.0
	 */
	readonly alignmentRectInsets: UIEdgeInsets;

	/**
	 * @since 13.0
	 */
	readonly baselineOffsetFromBottom: number;

	/**
	 * @since 5.0
	 */
	readonly capInsets: UIEdgeInsets;

	/**
	 * @since 13.0
	 */
	readonly configuration: UIImageConfiguration;

	/**
	 * @since 5.0
	 */
	readonly duration: number;

	/**
	 * @since 9.0
	 */
	readonly flipsForRightToLeftLayoutDirection: boolean;

	/**
	 * @since 13.0
	 */
	readonly hasBaseline: boolean;

	/**
	 * @since 8.0
	 */
	readonly imageAsset: UIImageAsset;

	readonly imageOrientation: UIImageOrientation;

	/**
	 * @since 10.0
	 */
	readonly imageRendererFormat: UIGraphicsImageRendererFormat;

	/**
	 * @since 5.0
	 */
	readonly images: NSArray<UIImage>;

	/**
	 * @since 17.0
	 */
	readonly isHighDynamicRange: boolean;

	readonly leftCapWidth: number;

	/**
	 * @since 7.0
	 */
	readonly renderingMode: UIImageRenderingMode;

	/**
	 * @since 6.0
	 */
	readonly resizingMode: UIImageResizingMode;

	/**
	 * @since 4.0
	 */
	readonly scale: number;

	readonly size: CGSize;

	/**
	 * @since 13.0
	 */
	readonly symbolConfiguration: UIImageSymbolConfiguration;

	/**
	 * @since 13.0
	 */
	readonly symbolImage: boolean;

	readonly topCapHeight: number;

	/**
	 * @since 8.0
	 */
	readonly traitCollection: UITraitCollection;

	/**
	 * @since 13.0
	 */
	static readonly actionsImage: UIImage;

	/**
	 * @since 13.0
	 */
	static readonly addImage: UIImage;

	/**
	 * @since 13.0
	 */
	static readonly checkmarkImage: UIImage;

	/**
	 * @since 13.0
	 */
	static readonly removeImage: UIImage;

	/**
	 * @since 13.0
	 */
	static readonly strokedCheckmarkImage: UIImage;

	/**
	 * @since 5.0
	 */
	accessibilityIdentifier: string; // inherited from UIAccessibilityIdentification

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly preferredPresentationSizeForItemProvider: CGSize; // inherited from UIItemProviderPresentationSizeProviding

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly writableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderWriting

	readonly  // inherited from NSObjectProtocol

	static readonly readableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderReading

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	static readonly writableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderWriting

	constructor(o: { CGImage: any; });

	/**
	 * @since 4.0
	 */
	constructor(o: { CGImage: any; scale: number; orientation: UIImageOrientation; });

	/**
	 * @since 5.0
	 */
	constructor(o: { CIImage: CIImage; });

	/**
	 * @since 6.0
	 */
	constructor(o: { CIImage: CIImage; scale: number; orientation: UIImageOrientation; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { contentsOfFile: string; });

	constructor(o: { data: NSData; });

	/**
	 * @since 6.0
	 */
	constructor(o: { data: NSData; scale: number; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	drawAsPatternInRect(rect: CGRect): void;

	drawAtPoint(point: CGPoint): void;

	drawAtPointBlendModeAlpha(point: CGPoint, blendMode: CGBlendMode, alpha: number): void;

	drawInRect(rect: CGRect): void;

	drawInRectBlendModeAlpha(rect: CGRect, blendMode: CGBlendMode, alpha: number): void;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 13.0
	 */
	imageByApplyingSymbolConfiguration(configuration: UIImageSymbolConfiguration): UIImage;

	/**
	 * @since 15.0
	 */
	imageByPreparingForDisplay(): UIImage;

	/**
	 * @since 15.0
	 */
	imageByPreparingThumbnailOfSize(size: CGSize): UIImage;

	/**
	 * @since 9.0
	 */
	imageFlippedForRightToLeftLayoutDirection(): UIImage;

	/**
	 * @since 17.0
	 */
	imageRestrictedToStandardDynamicRange(): UIImage;

	/**
	 * @since 6.0
	 */
	imageWithAlignmentRectInsets(alignmentInsets: UIEdgeInsets): UIImage;

	/**
	 * @since 13.0
	 */
	imageWithBaselineOffsetFromBottom(baselineOffset: number): UIImage;

	/**
	 * @since 13.0
	 */
	imageWithConfiguration(configuration: UIImageConfiguration): UIImage;

	/**
	 * @since 10.0
	 */
	imageWithHorizontallyFlippedOrientation(): UIImage;

	/**
	 * @since 7.0
	 */
	imageWithRenderingMode(renderingMode: UIImageRenderingMode): UIImage;

	/**
	 * @since 13.0
	 */
	imageWithTintColor(color: UIColor): UIImage;

	/**
	 * @since 13.0
	 */
	imageWithTintColorRenderingMode(color: UIColor, renderingMode: UIImageRenderingMode): UIImage;

	/**
	 * @since 13.0
	 */
	imageWithoutBaseline(): UIImage;

	initWithCGImage(cgImage: any): this;

	/**
	 * @since 4.0
	 */
	initWithCGImageScaleOrientation(cgImage: any, scale: number, orientation: UIImageOrientation): this;

	/**
	 * @since 5.0
	 */
	initWithCIImage(ciImage: CIImage): this;

	/**
	 * @since 6.0
	 */
	initWithCIImageScaleOrientation(ciImage: CIImage, scale: number, orientation: UIImageOrientation): this;

	initWithCoder(coder: NSCoder): this;

	initWithContentsOfFile(path: string): this;

	initWithData(data: NSData): this;

	/**
	 * @since 6.0
	 */
	initWithDataScale(data: NSData, scale: number): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	itemProviderVisibilityForRepresentationWithTypeIdentifier(typeIdentifier: string): NSItemProviderRepresentationVisibility;

	loadDataWithTypeIdentifierForItemProviderCompletionHandler(typeIdentifier: string, completionHandler: (p1: NSData, p2: NSError) => void): NSProgress;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	/**
	 * @since 15.0
	 */
	prepareForDisplayWithCompletionHandler(completionHandler: (p1: UIImage) => void): void;

	/**
	 * @since 15.0
	 */
	prepareThumbnailOfSizeCompletionHandler(size: CGSize, completionHandler: (p1: UIImage) => void): void;

	/**
	 * @since 5.0
	 */
	resizableImageWithCapInsets(capInsets: UIEdgeInsets): UIImage;

	/**
	 * @since 6.0
	 */
	resizableImageWithCapInsetsResizingMode(capInsets: UIEdgeInsets, resizingMode: UIImageResizingMode): UIImage;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	stretchableImageWithLeftCapWidthTopCapHeight(leftCapWidth: number, topCapHeight: number): UIImage;
}

/**
 * @since 8.0
 */
declare class UIImageAsset extends NSObject implements NSSecureCoding {

	static alloc(): UIImageAsset; // inherited from NSObject

	static new(): UIImageAsset; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	imageWithConfiguration(configuration: UIImageConfiguration): UIImage;

	imageWithTraitCollection(traitCollection: UITraitCollection): UIImage;

	initWithCoder(coder: NSCoder): this;

	registerImageWithConfiguration(image: UIImage, configuration: UIImageConfiguration): void;

	registerImageWithTraitCollection(image: UIImage, traitCollection: UITraitCollection): void;

	unregisterImageWithConfiguration(configuration: UIImageConfiguration): void;

	unregisterImageWithTraitCollection(traitCollection: UITraitCollection): void;
}

/**
 * @since 13.0
 */
declare class UIImageConfiguration extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UIImageConfiguration; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	static configurationWithLocale(locale: NSLocale): UIImageConfiguration;

	/**
	 * @since 17.0
	 */
	static configurationWithTraitCollection(traitCollection: UITraitCollection): UIImageConfiguration;

	static new(): UIImageConfiguration; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	readonly locale: NSLocale;

	readonly traitCollection: UITraitCollection;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	configurationByApplyingConfiguration(otherConfiguration: UIImageConfiguration): this;

	/**
	 * @since 17.0
	 */
	configurationWithLocale(locale: NSLocale): this;

	configurationWithTraitCollection(traitCollection: UITraitCollection): this;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 17.0
 */
declare const enum UIImageDynamicRange {

	Unspecified = -1,

	Standard = 0,

	ConstrainedHigh = 1,

	High = 2
}

/**
 * @since 17.0
 */
declare function UIImageHEICRepresentation(image: UIImage): NSData;

declare function UIImageJPEGRepresentation(image: UIImage, compressionQuality: number): NSData;

declare const enum UIImageOrientation {

	Up = 0,

	Down = 1,

	Left = 2,

	Right = 3,

	UpMirrored = 4,

	DownMirrored = 5,

	LeftMirrored = 6,

	RightMirrored = 7
}

declare function UIImagePNGRepresentation(image: UIImage): NSData;

/**
 * @since 2.0
 */
declare class UIImagePickerController extends UINavigationController implements NSCoding {

	static alloc(): UIImagePickerController; // inherited from NSObject

	/**
	 * @since 4.0
	 */
	static availableCaptureModesForCameraDevice(cameraDevice: UIImagePickerControllerCameraDevice): NSArray<number>;

	static availableMediaTypesForSourceType(sourceType: UIImagePickerControllerSourceType): NSArray<string>;

	/**
	 * @since 4.0
	 */
	static isCameraDeviceAvailable(cameraDevice: UIImagePickerControllerCameraDevice): boolean;

	/**
	 * @since 4.0
	 */
	static isFlashAvailableForCameraDevice(cameraDevice: UIImagePickerControllerCameraDevice): boolean;

	static isSourceTypeAvailable(sourceType: UIImagePickerControllerSourceType): boolean;

	static new(): UIImagePickerController; // inherited from NSObject

	/**
	 * @since 3.1
	 */
	allowsEditing: boolean;

	/**
	 * @since 2.0
	 * @deprecated 3.1
	 */
	allowsImageEditing: boolean;

	/**
	 * @since 4.0
	 */
	cameraCaptureMode: UIImagePickerControllerCameraCaptureMode;

	/**
	 * @since 4.0
	 */
	cameraDevice: UIImagePickerControllerCameraDevice;

	/**
	 * @since 4.0
	 */
	cameraFlashMode: UIImagePickerControllerCameraFlashMode;

	/**
	 * @since 3.1
	 */
	cameraOverlayView: UIView;

	/**
	 * @since 3.1
	 */
	cameraViewTransform: CGAffineTransform;

	delegate: any;

	/**
	 * @since 11.0
	 * @deprecated 100000
	 */
	imageExportPreset: UIImagePickerControllerImageURLExportPreset;

	mediaTypes: NSArray<string>;

	/**
	 * @since 3.1
	 */
	showsCameraControls: boolean;

	sourceType: UIImagePickerControllerSourceType;

	/**
	 * @since 11.0
	 * @deprecated 100000
	 */
	videoExportPreset: string;

	/**
	 * @since 3.1
	 */
	videoMaximumDuration: number;

	/**
	 * @since 3.1
	 */
	videoQuality: UIImagePickerControllerQualityType;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 4.0
	 */
	startVideoCapture(): boolean;

	/**
	 * @since 4.0
	 */
	stopVideoCapture(): void;

	/**
	 * @since 3.1
	 */
	takePicture(): void;
}

declare const enum UIImagePickerControllerCameraCaptureMode {

	Photo = 0,

	Video = 1
}

declare const enum UIImagePickerControllerCameraDevice {

	Rear = 0,

	Front = 1
}

declare const enum UIImagePickerControllerCameraFlashMode {

	Off = -1,

	Auto = 0,

	On = 1
}

declare var UIImagePickerControllerCropRect: string;

interface UIImagePickerControllerDelegate extends NSObjectProtocol {

	imagePickerControllerDidCancel?(picker: UIImagePickerController): void;

	/**
	 * @since 2.0
	 * @deprecated 3.0
	 */
	imagePickerControllerDidFinishPickingImageEditingInfo?(picker: UIImagePickerController, image: UIImage, editingInfo: NSDictionary<string, any>): void;

	imagePickerControllerDidFinishPickingMediaWithInfo?(picker: UIImagePickerController, info: NSDictionary<string, any>): void;
}
declare var UIImagePickerControllerDelegate: {

	prototype: UIImagePickerControllerDelegate;
};

declare var UIImagePickerControllerEditedImage: string;

/**
 * @since 11.0
 */
declare var UIImagePickerControllerImageURL: string;

/**
 * @since 11
 * @deprecated 100000
 */
declare const enum UIImagePickerControllerImageURLExportPreset {

	Compatible = 0,

	Current = 1
}

/**
 * @since 9.1
 */
declare var UIImagePickerControllerLivePhoto: string;

/**
 * @since 4.1
 */
declare var UIImagePickerControllerMediaMetadata: string;

declare var UIImagePickerControllerMediaType: string;

declare var UIImagePickerControllerMediaURL: string;

declare var UIImagePickerControllerOriginalImage: string;

/**
 * @since 11.0
 * @deprecated 100000
 */
declare var UIImagePickerControllerPHAsset: string;

declare const enum UIImagePickerControllerQualityType {

	TypeHigh = 0,

	TypeMedium = 1,

	TypeLow = 2,

	Type640x480 = 3,

	TypeIFrame1280x720 = 4,

	TypeIFrame960x540 = 5
}

/**
 * @since 4.1
 * @deprecated 11.0
 */
declare var UIImagePickerControllerReferenceURL: string;

declare const enum UIImagePickerControllerSourceType {

	PhotoLibrary = 0,

	Camera = 1,

	SavedPhotosAlbum = 2
}

/**
 * @since 17.0
 */
declare class UIImageReader extends NSObject {

	static alloc(): UIImageReader; // inherited from NSObject

	static new(): UIImageReader; // inherited from NSObject

	static readerWithConfiguration(configuration: UIImageReaderConfiguration): UIImageReader;

	readonly configuration: UIImageReaderConfiguration;

	static readonly defaultReader: UIImageReader;

	imageWithContentsOfFileURL(url: NSURL): UIImage;

	imageWithContentsOfFileURLCompletion(url: NSURL, completion: (p1: UIImage) => void): void;

	imageWithData(data: NSData): UIImage;

	imageWithDataCompletion(data: NSData, completion: (p1: UIImage) => void): void;
}

/**
 * @since 17.0
 */
declare class UIImageReaderConfiguration extends NSObject implements NSCopying {

	static alloc(): UIImageReaderConfiguration; // inherited from NSObject

	static new(): UIImageReaderConfiguration; // inherited from NSObject

	pixelsPerInch: number;

	preferredThumbnailSize: CGSize;

	prefersHighDynamicRange: boolean;

	preparesImagesForDisplay: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 7.0
 */
declare const enum UIImageRenderingMode {

	Automatic = 0,

	AlwaysOriginal = 1,

	AlwaysTemplate = 2
}

declare const enum UIImageResizingMode {

	Tile = 0,

	Stretch = 1
}

/**
 * @since 13.0
 */
declare class UIImageSymbolConfiguration extends UIImageConfiguration {

	static alloc(): UIImageSymbolConfiguration; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	static configurationPreferringMonochrome(): UIImageSymbolConfiguration;

	/**
	 * @since 15.0
	 */
	static configurationPreferringMulticolor(): UIImageSymbolConfiguration;

	static configurationWithFont(font: UIFont): UIImageSymbolConfiguration;

	static configurationWithFontScale(font: UIFont, scale: UIImageSymbolScale): UIImageSymbolConfiguration;

	/**
	 * @since 15.0
	 */
	static configurationWithHierarchicalColor(hierarchicalColor: UIColor): UIImageSymbolConfiguration;

	/**
	 * @since 17.0
	 */
	static configurationWithLocale(locale: NSLocale): UIImageSymbolConfiguration; // inherited from UIImageConfiguration

	/**
	 * @since 15.0
	 */
	static configurationWithPaletteColors(paletteColors: NSArray<UIColor> | UIColor[]): UIImageSymbolConfiguration;

	static configurationWithPointSize(pointSize: number): UIImageSymbolConfiguration;

	static configurationWithPointSizeWeight(pointSize: number, weight: UIImageSymbolWeight): UIImageSymbolConfiguration;

	static configurationWithPointSizeWeightScale(pointSize: number, weight: UIImageSymbolWeight, scale: UIImageSymbolScale): UIImageSymbolConfiguration;

	static configurationWithScale(scale: UIImageSymbolScale): UIImageSymbolConfiguration;

	static configurationWithTextStyle(textStyle: string): UIImageSymbolConfiguration;

	static configurationWithTextStyleScale(textStyle: string, scale: UIImageSymbolScale): UIImageSymbolConfiguration;

	/**
	 * @since 17.0
	 */
	static configurationWithTraitCollection(traitCollection: UITraitCollection): UIImageSymbolConfiguration; // inherited from UIImageConfiguration

	static configurationWithWeight(weight: UIImageSymbolWeight): UIImageSymbolConfiguration;

	static new(): UIImageSymbolConfiguration; // inherited from NSObject

	static readonly unspecifiedConfiguration: UIImageSymbolConfiguration;

	configurationWithoutPointSizeAndWeight(): this;

	configurationWithoutScale(): this;

	configurationWithoutTextStyle(): this;

	configurationWithoutWeight(): this;

	isEqualToConfiguration(otherConfiguration: UIImageSymbolConfiguration): boolean;
}

/**
 * @since 13.0
 */
declare const enum UIImageSymbolScale {

	Default = -1,

	Unspecified = 0,

	Small = 1,

	Medium = 2,

	Large = 3
}

/**
 * @since 13.0
 */
declare const enum UIImageSymbolWeight {

	Unspecified = 0,

	UltraLight = 1,

	Thin = 2,

	Light = 3,

	Regular = 4,

	Medium = 5,

	Semibold = 6,

	Bold = 7,

	Heavy = 8,

	Black = 9
}

/**
 * @since 13.0
 */
declare function UIImageSymbolWeightForFontWeight(fontWeight: number): UIImageSymbolWeight;

/**
 * @since 2.0
 */
declare class UIImageView extends UIView implements UIAccessibilityContentSizeCategoryImageAdjusting {

	static alloc(): UIImageView; // inherited from NSObject

	static appearance(): UIImageView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIImageView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIImageView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIImageView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIImageView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIImageView; // inherited from UIAppearance

	static new(): UIImageView; // inherited from NSObject

	readonly animating: boolean;

	animationDuration: number;

	animationImages: NSArray<UIImage>;

	animationRepeatCount: number;

	/**
	 * @since 3.0
	 */
	highlighted: boolean;

	/**
	 * @since 3.0
	 */
	highlightedAnimationImages: NSArray<UIImage>;

	/**
	 * @since 3.0
	 */
	highlightedImage: UIImage;

	image: UIImage;

	readonly imageDynamicRange: UIImageDynamicRange;

	preferredImageDynamicRange: UIImageDynamicRange;

	/**
	 * @since 13.0
	 */
	preferredSymbolConfiguration: UIImageSymbolConfiguration;

	adjustsImageSizeForAccessibilityContentSizeCategory: boolean; // inherited from UIAccessibilityContentSizeCategoryImageAdjusting

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { image: UIImage; });

	/**
	 * @since 3.0
	 */
	constructor(o: { image: UIImage; highlightedImage: UIImage; });

	/**
	 * @since 17.0
	 */
	addSymbolEffect(symbolEffect: NSSymbolEffect): void;

	/**
	 * @since 17.0
	 */
	addSymbolEffectOptions(symbolEffect: NSSymbolEffect, options: NSSymbolEffectOptions): void;

	/**
	 * @since 17.0
	 */
	addSymbolEffectOptionsAnimated(symbolEffect: NSSymbolEffect, options: NSSymbolEffectOptions, animated: boolean): void;

	/**
	 * @since 17.0
	 */
	addSymbolEffectOptionsAnimatedCompletion(symbolEffect: NSSymbolEffect, options: NSSymbolEffectOptions, animated: boolean, completionHandler: (p1: UISymbolEffectCompletionContext) => void): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithImage(image: UIImage): this;

	/**
	 * @since 3.0
	 */
	initWithImageHighlightedImage(image: UIImage, highlightedImage: UIImage): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	/**
	 * @since 17.0
	 */
	removeAllSymbolEffects(): void;

	/**
	 * @since 17.0
	 */
	removeAllSymbolEffectsWithOptions(options: NSSymbolEffectOptions): void;

	/**
	 * @since 17.0
	 */
	removeAllSymbolEffectsWithOptionsAnimated(options: NSSymbolEffectOptions, animated: boolean): void;

	/**
	 * @since 17.0
	 */
	removeSymbolEffectOfType(symbolEffect: NSSymbolEffect): void;

	/**
	 * @since 17.0
	 */
	removeSymbolEffectOfTypeOptions(symbolEffect: NSSymbolEffect, options: NSSymbolEffectOptions): void;

	/**
	 * @since 17.0
	 */
	removeSymbolEffectOfTypeOptionsAnimated(symbolEffect: NSSymbolEffect, options: NSSymbolEffectOptions, animated: boolean): void;

	/**
	 * @since 17.0
	 */
	removeSymbolEffectOfTypeOptionsAnimatedCompletion(symbolEffect: NSSymbolEffect, options: NSSymbolEffectOptions, animated: boolean, completionHandler: (p1: UISymbolEffectCompletionContext) => void): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 17.0
	 */
	setSymbolImageWithContentTransition(symbolImage: UIImage, transition: NSSymbolContentTransition): void;

	/**
	 * @since 17.0
	 */
	setSymbolImageWithContentTransitionOptions(symbolImage: UIImage, transition: NSSymbolContentTransition, options: NSSymbolEffectOptions): void;

	/**
	 * @since 17.0
	 */
	setSymbolImageWithContentTransitionOptionsCompletion(symbolImage: UIImage, transition: NSSymbolContentTransition, options: NSSymbolEffectOptions, completionHandler: (p1: UISymbolEffectCompletionContext) => void): void;

	startAnimating(): void;

	stopAnimating(): void;
}

declare function UIImageWriteToSavedPhotosAlbum(image: UIImage, completionTarget: any, completionSelector: string, contextInfo: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 10.0
 */
declare class UIImpactFeedbackGenerator extends UIFeedbackGenerator {

	static alloc(): UIImpactFeedbackGenerator; // inherited from NSObject

	/**
	 * @since 17.5
	 */
	static feedbackGeneratorForView(view: UIView): UIImpactFeedbackGenerator; // inherited from UIFeedbackGenerator

	/**
	 * @since 17.5
	 */
	static feedbackGeneratorWithStyleForView(style: UIImpactFeedbackStyle, view: UIView): UIImpactFeedbackGenerator;

	static new(): UIImpactFeedbackGenerator; // inherited from NSObject

	/**
	 * @since 10.0
	 * @deprecated 100000
	 */
	constructor(o: { style: UIImpactFeedbackStyle; });

	impactOccurred(): void;

	/**
	 * @since 17.5
	 */
	impactOccurredAtLocation(location: CGPoint): void;

	/**
	 * @since 13.0
	 */
	impactOccurredWithIntensity(intensity: number): void;

	/**
	 * @since 17.5
	 */
	impactOccurredWithIntensityAtLocation(intensity: number, location: CGPoint): void;

	/**
	 * @since 10.0
	 * @deprecated 100000
	 */
	initWithStyle(style: UIImpactFeedbackStyle): this;
}

/**
 * @since 10.0
 */
declare const enum UIImpactFeedbackStyle {

	Light = 0,

	Medium = 1,

	Heavy = 2,

	Soft = 3,

	Rigid = 4
}

/**
 * @since 14.0
 */
declare class UIIndirectScribbleInteraction extends NSObject implements UIInteraction {

	static alloc(): UIIndirectScribbleInteraction; // inherited from NSObject

	static new(): UIIndirectScribbleInteraction; // inherited from NSObject

	readonly delegate: UIIndirectScribbleInteractionDelegate;

	readonly handlingWriting: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly view: UIView; // inherited from UIInteraction

	readonly  // inherited from NSObjectProtocol

	constructor(o: { delegate: UIIndirectScribbleInteractionDelegate; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	didMoveToView(view: UIView): void;

	initWithDelegate(delegate: UIIndirectScribbleInteractionDelegate): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	willMoveToView(view: UIView): void;
}

/**
 * @since 14.0
 */
interface UIIndirectScribbleInteractionDelegate extends NSObjectProtocol {

	indirectScribbleInteractionDidFinishWritingInElement?(interaction: UIIndirectScribbleInteraction, elementIdentifier: any): void;

	indirectScribbleInteractionFocusElementIfNeededReferencePointCompletion(interaction: UIIndirectScribbleInteraction, elementIdentifier: any, focusReferencePoint: CGPoint, completion: (p1: UIResponder & UITextInput) => void): void;

	indirectScribbleInteractionFrameForElement(interaction: UIIndirectScribbleInteraction, elementIdentifier: any): CGRect;

	indirectScribbleInteractionIsElementFocused(interaction: UIIndirectScribbleInteraction, elementIdentifier: any): boolean;

	indirectScribbleInteractionRequestElementsInRectCompletion(interaction: UIIndirectScribbleInteraction, rect: CGRect, completion: (p1: NSArray<any>) => void): void;

	indirectScribbleInteractionShouldDelayFocusForElement?(interaction: UIIndirectScribbleInteraction, elementIdentifier: any): boolean;

	indirectScribbleInteractionWillBeginWritingInElement?(interaction: UIIndirectScribbleInteraction, elementIdentifier: any): void;
}
declare var UIIndirectScribbleInteractionDelegate: {

	prototype: UIIndirectScribbleInteractionDelegate;
};

/**
 * @since 7.0
 */
declare class UIInputView extends UIView {

	static alloc(): UIInputView; // inherited from NSObject

	static appearance(): UIInputView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIInputView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIInputView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIInputView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIInputView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIInputView; // inherited from UIAppearance

	static new(): UIInputView; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	allowsSelfSizing: boolean;

	readonly inputViewStyle: UIInputViewStyle;

	constructor(o: { frame: CGRect; inputViewStyle: UIInputViewStyle; });

	initWithFrameInputViewStyle(frame: CGRect, inputViewStyle: UIInputViewStyle): this;
}

interface UIInputViewAudioFeedback extends NSObjectProtocol {

	enableInputClicksWhenVisible?: boolean;
}
declare var UIInputViewAudioFeedback: {

	prototype: UIInputViewAudioFeedback;
};

/**
 * @since 8.0
 */
declare class UIInputViewController extends UIViewController implements UITextInputDelegate {

	static alloc(): UIInputViewController; // inherited from NSObject

	static new(): UIInputViewController; // inherited from NSObject

	hasDictationKey: boolean;

	/**
	 * @since 11.0
	 */
	readonly hasFullAccess: boolean;

	inputView: UIInputView;

	/**
	 * @since 11.0
	 */
	readonly needsInputModeSwitchKey: boolean;

	primaryLanguage: string;

	readonly textDocumentProxy: UITextDocumentProxy;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	advanceToNextInputMode(): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	dismissKeyboard(): void;

	/**
	 * @since 10.0
	 */
	handleInputModeListFromViewWithEvent(view: UIView, event: _UIEvent): void;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	requestSupplementaryLexiconWithCompletion(completionHandler: (p1: UILexicon) => void): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	selectionDidChange(textInput: UITextInput): void;

	selectionWillChange(textInput: UITextInput): void;

	self(): this;

	textDidChange(textInput: UITextInput): void;

	textWillChange(textInput: UITextInput): void;
}

/**
 * @since 7.0
 */
declare const enum UIInputViewStyle {

	Default = 0,

	Keyboard = 1
}

/**
 * @since 11.0
 */
interface UIInteraction extends NSObjectProtocol {

	view: UIView;

	didMoveToView(view: UIView): void;

	willMoveToView(view: UIView): void;
}
declare var UIInteraction: {

	prototype: UIInteraction;
};

declare const enum UIInterfaceOrientation {

	Unknown = 0,

	Portrait = 1,

	PortraitUpsideDown = 2,

	LandscapeLeft = 4,

	LandscapeRight = 3
}

declare const enum UIInterfaceOrientationMask {

	Portrait = 2,

	LandscapeLeft = 16,

	LandscapeRight = 8,

	PortraitUpsideDown = 4,

	Landscape = 24,

	All = 30,

	AllButUpsideDown = 26
}

/**
 * @since 7.0
 */
declare class UIInterpolatingMotionEffect extends UIMotionEffect {

	static alloc(): UIInterpolatingMotionEffect; // inherited from NSObject

	static new(): UIInterpolatingMotionEffect; // inherited from NSObject

	readonly keyPath: string;

	maximumRelativeValue: any;

	minimumRelativeValue: any;

	readonly type: UIInterpolatingMotionEffectType;

	constructor(o: { keyPath: string; type: UIInterpolatingMotionEffectType; });

	initWithKeyPathType(keyPath: string, type: UIInterpolatingMotionEffectType): this;
}

declare const enum UIInterpolatingMotionEffectType {

	TiltAlongHorizontalAxis = 0,

	TiltAlongVerticalAxis = 1
}

/**
 * @since 11.0
 */
interface UIItemProviderPresentationSizeProviding extends NSObjectProtocol {

	preferredPresentationSizeForItemProvider: CGSize;
}
declare var UIItemProviderPresentationSizeProviding: {

	prototype: UIItemProviderPresentationSizeProviding;
};

interface UIItemProviderReadingAugmentationDesignating extends NSItemProviderReading {
}
declare var UIItemProviderReadingAugmentationDesignating: {

	prototype: UIItemProviderReadingAugmentationDesignating;

	_ui_augmentingNSItemProviderReadingClass(): typeof NSObject;

	objectWithItemProviderDataTypeIdentifierError(data: NSData, typeIdentifier: string): UIItemProviderReadingAugmentationDesignating;
};

interface UIItemProviderReadingAugmentationProviding {
}
declare var UIItemProviderReadingAugmentationProviding: {

	prototype: UIItemProviderReadingAugmentationProviding;

	objectWithItemProviderDataTypeIdentifierRequestedClassError(data: NSData, typeIdentifier: string, requestedClass: typeof NSObject): any;
};

/**
 * @since 13.4
 */
declare class UIKey extends NSObject implements NSCoding, NSCopying {

	static alloc(): UIKey; // inherited from NSObject

	static new(): UIKey; // inherited from NSObject

	readonly characters: string;

	readonly charactersIgnoringModifiers: string;

	readonly keyCode: UIKeyboardHIDUsage;

	readonly modifierFlags: UIKeyModifierFlags;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 7.0
 */
declare class UIKeyCommand extends UICommand {

	static alloc(): UIKeyCommand; // inherited from NSObject

	static commandWithTitleImageActionInputModifierFlagsPropertyList(title: string, image: UIImage, action: string, input: string, modifierFlags: UIKeyModifierFlags, propertyList: any): UIKeyCommand;

	static commandWithTitleImageActionInputModifierFlagsPropertyListAlternates(title: string, image: UIImage, action: string, input: string, modifierFlags: UIKeyModifierFlags, propertyList: any, alternates: NSArray<UICommandAlternate> | UICommandAlternate[]): UIKeyCommand;

	static commandWithTitleImageActionPropertyList(title: string, image: UIImage, action: string, propertyList: any): UIKeyCommand; // inherited from UICommand

	static commandWithTitleImageActionPropertyListAlternates(title: string, image: UIImage, action: string, propertyList: any, alternates: NSArray<UICommandAlternate> | UICommandAlternate[]): UIKeyCommand; // inherited from UICommand

	static keyCommandWithInputModifierFlagsAction(input: string, modifierFlags: UIKeyModifierFlags, action: string): UIKeyCommand;

	/**
	 * @since 9.0
	 * @deprecated 13.0
	 */
	static keyCommandWithInputModifierFlagsActionDiscoverabilityTitle(input: string, modifierFlags: UIKeyModifierFlags, action: string, discoverabilityTitle: string): UIKeyCommand;

	static new(): UIKeyCommand; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	allowsAutomaticLocalization: boolean;

	/**
	 * @since 15.0
	 */
	allowsAutomaticMirroring: boolean;

	readonly input: string;

	readonly modifierFlags: UIKeyModifierFlags;

	/**
	 * @since 15.0
	 */
	wantsPriorityOverSystemBehavior: boolean;
}

interface UIKeyInput extends UITextInputTraits {

	hasText: boolean;

	deleteBackward(): void;

	insertText(text: string): void;
}
declare var UIKeyInput: {

	prototype: UIKeyInput;
};

/**
 * @since 15.0
 */
declare var UIKeyInputDelete: string;

/**
 * @since 7.0
 */
declare var UIKeyInputDownArrow: string;

/**
 * @since 13.4
 */
declare var UIKeyInputEnd: string;

/**
 * @since 7.0
 */
declare var UIKeyInputEscape: string;

/**
 * @since 13.4
 */
declare var UIKeyInputF1: string;

/**
 * @since 13.4
 */
declare var UIKeyInputF10: string;

/**
 * @since 13.4
 */
declare var UIKeyInputF11: string;

/**
 * @since 13.4
 */
declare var UIKeyInputF12: string;

/**
 * @since 13.4
 */
declare var UIKeyInputF1Var: string;

/**
 * @since 13.4
 */
declare var UIKeyInputF2: string;

/**
 * @since 13.4
 */
declare var UIKeyInputF3: string;

/**
 * @since 13.4
 */
declare var UIKeyInputF4: string;

/**
 * @since 13.4
 */
declare var UIKeyInputF5: string;

/**
 * @since 13.4
 */
declare var UIKeyInputF6: string;

/**
 * @since 13.4
 */
declare var UIKeyInputF7: string;

/**
 * @since 13.4
 */
declare var UIKeyInputF8: string;

/**
 * @since 13.4
 */
declare var UIKeyInputF9: string;

/**
 * @since 13.4
 */
declare var UIKeyInputHome: string;

/**
 * @since 7.0
 */
declare var UIKeyInputLeftArrow: string;

/**
 * @since 8.0
 */
declare var UIKeyInputPageDown: string;

/**
 * @since 8.0
 */
declare var UIKeyInputPageUp: string;

/**
 * @since 7.0
 */
declare var UIKeyInputRightArrow: string;

/**
 * @since 7.0
 */
declare var UIKeyInputUpArrow: string;

/**
 * @since 7.0
 */
declare const enum UIKeyModifierFlags {

	AlphaShift = 65536,

	Shift = 131072,

	Control = 262144,

	Alternate = 524288,

	Command = 1048576,

	NumericPad = 2097152
}

/**
 * @since 3.0
 */
declare var UIKeyboardAnimationCurveUserInfoKey: string;

/**
 * @since 3.0
 */
declare var UIKeyboardAnimationDurationUserInfoKey: string;

declare const enum UIKeyboardAppearance {

	Default = 0,

	Dark = 1,

	Light = 2,

	Alert = 1
}

/**
 * @since 2.0
 * @deprecated 3.2
 */
declare var UIKeyboardBoundsUserInfoKey: string;

/**
 * @since 2.0
 * @deprecated 3.2
 */
declare var UIKeyboardCenterBeginUserInfoKey: string;

/**
 * @since 2.0
 * @deprecated 3.2
 */
declare var UIKeyboardCenterEndUserInfoKey: string;

/**
 * @since 5.0
 */
declare var UIKeyboardDidChangeFrameNotification: string;

declare var UIKeyboardDidHideNotification: string;

declare var UIKeyboardDidShowNotification: string;

/**
 * @since 3.2
 */
declare var UIKeyboardFrameBeginUserInfoKey: string;

/**
 * @since 3.2
 */
declare var UIKeyboardFrameEndUserInfoKey: string;

declare const enum UIKeyboardHIDUsage {

	KeyboardErrorRollOver = 1,

	KeyboardPOSTFail = 2,

	KeyboardErrorUndefined = 3,

	KeyboardA = 4,

	KeyboardB = 5,

	KeyboardC = 6,

	KeyboardD = 7,

	KeyboardE = 8,

	KeyboardF = 9,

	KeyboardG = 10,

	KeyboardH = 11,

	KeyboardI = 12,

	KeyboardJ = 13,

	KeyboardK = 14,

	KeyboardL = 15,

	KeyboardM = 16,

	KeyboardN = 17,

	KeyboardO = 18,

	KeyboardP = 19,

	KeyboardQ = 20,

	KeyboardR = 21,

	KeyboardS = 22,

	KeyboardT = 23,

	KeyboardU = 24,

	KeyboardV = 25,

	KeyboardW = 26,

	KeyboardX = 27,

	KeyboardY = 28,

	KeyboardZ = 29,

	Keyboard1 = 30,

	Keyboard2 = 31,

	Keyboard3 = 32,

	Keyboard4 = 33,

	Keyboard5 = 34,

	Keyboard6 = 35,

	Keyboard7 = 36,

	Keyboard8 = 37,

	Keyboard9 = 38,

	Keyboard0 = 39,

	KeyboardReturnOrEnter = 40,

	KeyboardEscape = 41,

	KeyboardDeleteOrBackspace = 42,

	KeyboardTab = 43,

	KeyboardSpacebar = 44,

	KeyboardHyphen = 45,

	KeyboardEqualSign = 46,

	KeyboardOpenBracket = 47,

	KeyboardCloseBracket = 48,

	KeyboardBackslash = 49,

	KeyboardNonUSPound = 50,

	KeyboardSemicolon = 51,

	KeyboardQuote = 52,

	KeyboardGraveAccentAndTilde = 53,

	KeyboardComma = 54,

	KeyboardPeriod = 55,

	KeyboardSlash = 56,

	KeyboardCapsLock = 57,

	KeyboardF1 = 58,

	KeyboardF2 = 59,

	KeyboardF3 = 60,

	KeyboardF4 = 61,

	KeyboardF5 = 62,

	KeyboardF6 = 63,

	KeyboardF7 = 64,

	KeyboardF8 = 65,

	KeyboardF9 = 66,

	KeyboardF10 = 67,

	KeyboardF11 = 68,

	KeyboardF12 = 69,

	KeyboardPrintScreen = 70,

	KeyboardScrollLock = 71,

	KeyboardPause = 72,

	KeyboardInsert = 73,

	KeyboardHome = 74,

	KeyboardPageUp = 75,

	KeyboardDeleteForward = 76,

	KeyboardEnd = 77,

	KeyboardPageDown = 78,

	KeyboardRightArrow = 79,

	KeyboardLeftArrow = 80,

	KeyboardDownArrow = 81,

	KeyboardUpArrow = 82,

	KeypadNumLock = 83,

	KeypadSlash = 84,

	KeypadAsterisk = 85,

	KeypadHyphen = 86,

	KeypadPlus = 87,

	KeypadEnter = 88,

	Keypad1 = 89,

	Keypad2 = 90,

	Keypad3 = 91,

	Keypad4 = 92,

	Keypad5 = 93,

	Keypad6 = 94,

	Keypad7 = 95,

	Keypad8 = 96,

	Keypad9 = 97,

	Keypad0 = 98,

	KeypadPeriod = 99,

	KeyboardNonUSBackslash = 100,

	KeyboardApplication = 101,

	KeyboardPower = 102,

	KeypadEqualSign = 103,

	KeyboardF13 = 104,

	KeyboardF14 = 105,

	KeyboardF15 = 106,

	KeyboardF16 = 107,

	KeyboardF17 = 108,

	KeyboardF18 = 109,

	KeyboardF19 = 110,

	KeyboardF20 = 111,

	KeyboardF21 = 112,

	KeyboardF22 = 113,

	KeyboardF23 = 114,

	KeyboardF24 = 115,

	KeyboardExecute = 116,

	KeyboardHelp = 117,

	KeyboardMenu = 118,

	KeyboardSelect = 119,

	KeyboardStop = 120,

	KeyboardAgain = 121,

	KeyboardUndo = 122,

	KeyboardCut = 123,

	KeyboardCopy = 124,

	KeyboardPaste = 125,

	KeyboardFind = 126,

	KeyboardMute = 127,

	KeyboardVolumeUp = 128,

	KeyboardVolumeDown = 129,

	KeyboardLockingCapsLock = 130,

	KeyboardLockingNumLock = 131,

	KeyboardLockingScrollLock = 132,

	KeypadComma = 133,

	KeypadEqualSignAS400 = 134,

	KeyboardInternational1 = 135,

	KeyboardInternational2 = 136,

	KeyboardInternational3 = 137,

	KeyboardInternational4 = 138,

	KeyboardInternational5 = 139,

	KeyboardInternational6 = 140,

	KeyboardInternational7 = 141,

	KeyboardInternational8 = 142,

	KeyboardInternational9 = 143,

	KeyboardLANG1 = 144,

	KeyboardLANG2 = 145,

	KeyboardLANG3 = 146,

	KeyboardLANG4 = 147,

	KeyboardLANG5 = 148,

	KeyboardLANG6 = 149,

	KeyboardLANG7 = 150,

	KeyboardLANG8 = 151,

	KeyboardLANG9 = 152,

	KeyboardAlternateErase = 153,

	KeyboardSysReqOrAttention = 154,

	KeyboardCancel = 155,

	KeyboardClear = 156,

	KeyboardPrior = 157,

	KeyboardReturn = 158,

	KeyboardSeparator = 159,

	KeyboardOut = 160,

	KeyboardOper = 161,

	KeyboardClearOrAgain = 162,

	KeyboardCrSelOrProps = 163,

	KeyboardExSel = 164,

	KeyboardLeftControl = 224,

	KeyboardLeftShift = 225,

	KeyboardLeftAlt = 226,

	KeyboardLeftGUI = 227,

	KeyboardRightControl = 228,

	KeyboardRightShift = 229,

	KeyboardRightAlt = 230,

	KeyboardRightGUI = 231,

	Keyboard_Reserved = 65535,

	KeyboardHangul = 144,

	KeyboardHanja = 145,

	KeyboardKanaSwitch = 144,

	KeyboardAlphanumericSwitch = 145,

	KeyboardKatakana = 146,

	KeyboardHiragana = 147,

	KeyboardZenkakuHankakuKanji = 148
}

/**
 * @since 9.0
 */
declare var UIKeyboardIsLocalUserInfoKey: string;

/**
 * @since 15.0
 */
declare class UIKeyboardLayoutGuide extends UITrackingLayoutGuide {

	static alloc(): UIKeyboardLayoutGuide; // inherited from NSObject

	static new(): UIKeyboardLayoutGuide; // inherited from NSObject

	followsUndockedKeyboard: boolean;

	/**
	 * @since 17.0
	 */
	keyboardDismissPadding: number;

	/**
	 * @since 17.0
	 */
	usesBottomSafeArea: boolean;
}

declare const enum UIKeyboardType {

	Default = 0,

	ASCIICapable = 1,

	NumbersAndPunctuation = 2,

	URL = 3,

	NumberPad = 4,

	PhonePad = 5,

	NamePhonePad = 6,

	EmailAddress = 7,

	DecimalPad = 8,

	Twitter = 9,

	WebSearch = 10,

	ASCIICapableNumberPad = 11,

	Alphabet = 1
}

/**
 * @since 5.0
 */
declare var UIKeyboardWillChangeFrameNotification: string;

declare var UIKeyboardWillHideNotification: string;

declare var UIKeyboardWillShowNotification: string;

/**
 * @since 2.0
 */
declare class UILabel extends UIView implements NSCoding, UIContentSizeCategoryAdjusting, UILetterformAwareAdjusting {

	static alloc(): UILabel; // inherited from NSObject

	static appearance(): UILabel; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UILabel; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UILabel; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UILabel; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UILabel; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UILabel; // inherited from UIAppearance

	static new(): UILabel; // inherited from NSObject

	adjustsFontSizeToFitWidth: boolean;

	/**
	 * @since 6.0
	 * @deprecated 7.0
	 */
	adjustsLetterSpacingToFitWidth: boolean;

	/**
	 * @since 9.0
	 */
	allowsDefaultTighteningForTruncation: boolean;

	/**
	 * @since 6.0
	 */
	attributedText: NSAttributedString;

	baselineAdjustment: UIBaselineAdjustment;

	enabled: boolean;

	font: UIFont;

	highlighted: boolean;

	highlightedTextColor: UIColor;

	lineBreakMode: NSLineBreakMode;

	/**
	 * @since 14.0
	 */
	lineBreakStrategy: NSLineBreakStrategy;

	/**
	 * @since 2.0
	 * @deprecated 6.0
	 */
	minimumFontSize: number;

	/**
	 * @since 6.0
	 */
	minimumScaleFactor: number;

	numberOfLines: number;

	/**
	 * @since 6.0
	 */
	preferredMaxLayoutWidth: number;

	/**
	 * @since 17.0
	 */
	preferredVibrancy: UILabelVibrancy;

	shadowColor: UIColor;

	shadowOffset: CGSize;

	showsExpansionTextWhenTruncated: boolean;

	text: string;

	textAlignment: NSTextAlignment;

	textColor: UIColor;

	adjustsFontForContentSizeCategory: boolean; // inherited from UIContentSizeCategoryAdjusting

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	sizingRule: UILetterformAwareSizingRule; // inherited from UILetterformAwareAdjusting

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	drawTextInRect(rect: CGRect): void;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	textRectForBoundsLimitedToNumberOfLines(bounds: CGRect, numberOfLines: number): CGRect;
}

/**
 * @since 17.0
 */
declare const enum UILabelVibrancy {

	None = 0,

	Automatic = 1
}

/**
 * @since 13.0
 */
declare class UILargeContentViewerInteraction extends NSObject implements UIInteraction {

	static alloc(): UILargeContentViewerInteraction; // inherited from NSObject

	static new(): UILargeContentViewerInteraction; // inherited from NSObject

	readonly delegate: UILargeContentViewerInteractionDelegate;

	readonly gestureRecognizerForExclusionRelationship: UIGestureRecognizer;

	static readonly enabled: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly view: UIView; // inherited from UIInteraction

	readonly  // inherited from NSObjectProtocol

	constructor(o: { delegate: UILargeContentViewerInteractionDelegate; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	didMoveToView(view: UIView): void;

	initWithDelegate(delegate: UILargeContentViewerInteractionDelegate): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	willMoveToView(view: UIView): void;
}

/**
 * @since 13.0
 */
interface UILargeContentViewerInteractionDelegate extends NSObjectProtocol {

	largeContentViewerInteractionDidEndOnItemAtPoint?(interaction: UILargeContentViewerInteraction, item: UILargeContentViewerItem, point: CGPoint): void;

	largeContentViewerInteractionItemAtPoint?(interaction: UILargeContentViewerInteraction, point: CGPoint): UILargeContentViewerItem;

	viewControllerForLargeContentViewerInteraction?(interaction: UILargeContentViewerInteraction): UIViewController;
}
declare var UILargeContentViewerInteractionDelegate: {

	prototype: UILargeContentViewerInteractionDelegate;
};

/**
 * @since 13.0
 */
declare var UILargeContentViewerInteractionEnabledStatusDidChangeNotification: string;

/**
 * @since 13.0
 */
interface UILargeContentViewerItem extends NSObjectProtocol {

	largeContentImage: UIImage;

	largeContentImageInsets: UIEdgeInsets;

	largeContentTitle: string;

	scalesLargeContentImage: boolean;

	showsLargeContentViewer: boolean;
}
declare var UILargeContentViewerItem: {

	prototype: UILargeContentViewerItem;
};

declare const enum UILayoutConstraintAxis {

	Horizontal = 0,

	Vertical = 1
}

/**
 * @since 6.0
 */
declare var UILayoutFittingCompressedSize: CGSize;

/**
 * @since 6.0
 */
declare var UILayoutFittingExpandedSize: CGSize;

/**
 * @since 9.0
 */
declare class UILayoutGuide extends NSObject implements NSCoding, UIPopoverPresentationControllerSourceItem {

	static alloc(): UILayoutGuide; // inherited from NSObject

	static new(): UILayoutGuide; // inherited from NSObject

	readonly bottomAnchor: NSLayoutYAxisAnchor;

	readonly centerXAnchor: NSLayoutXAxisAnchor;

	readonly centerYAnchor: NSLayoutYAxisAnchor;

	/**
	 * @since 10.0
	 */
	readonly hasAmbiguousLayout: boolean;

	readonly heightAnchor: NSLayoutDimension;

	identifier: string;

	readonly layoutFrame: CGRect;

	readonly leadingAnchor: NSLayoutXAxisAnchor;

	readonly leftAnchor: NSLayoutXAxisAnchor;

	owningView: UIView;

	readonly rightAnchor: NSLayoutXAxisAnchor;

	readonly topAnchor: NSLayoutYAxisAnchor;

	readonly trailingAnchor: NSLayoutXAxisAnchor;

	readonly widthAnchor: NSLayoutDimension;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 10.0
	 */
	constraintsAffectingLayoutForAxis(axis: UILayoutConstraintAxis): NSArray<NSLayoutConstraint>;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 17.0
	 */
	frameInView(referenceView: UIView): CGRect;

	initWithCoder(coder: NSCoder): this;

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

interface UILayoutGuideAspectFitting extends NSObjectProtocol {

	aspectRatio: number;
}
declare var UILayoutGuideAspectFitting: {

	prototype: UILayoutGuideAspectFitting;
};

/**
 * @since 6.0
 */
declare var UILayoutPriorityDefaultHigh: number;

/**
 * @since 6.0
 */
declare var UILayoutPriorityDefaultLow: number;

declare var UILayoutPriorityDragThatCanResizeScene: number;

declare var UILayoutPriorityDragThatCannotResizeScene: number;

/**
 * @since 6.0
 */
declare var UILayoutPriorityFittingSizeLevel: number;

/**
 * @since 6.0
 */
declare var UILayoutPriorityRequired: number;

declare var UILayoutPrioritySceneSizeStayPut: number;

interface UILayoutSupport extends NSObjectProtocol {

	/**
	 * @since 9.0
	 */
	bottomAnchor: NSLayoutYAxisAnchor;

	/**
	 * @since 9.0
	 */
	heightAnchor: NSLayoutDimension;

	length: number;

	/**
	 * @since 9.0
	 */
	topAnchor: NSLayoutYAxisAnchor;
}
declare var UILayoutSupport: {

	prototype: UILayoutSupport;
};

/**
 * @since 13.0
 */
declare const enum UILegibilityWeight {

	Unspecified = -1,

	Regular = 0,

	Bold = 1
}

/**
 * @since 17.0
 */
interface UILetterformAwareAdjusting extends NSObjectProtocol {

	sizingRule: UILetterformAwareSizingRule;
}
declare var UILetterformAwareAdjusting: {

	prototype: UILetterformAwareAdjusting;
};

/**
 * @since 17.0
 */
declare const enum UILetterformAwareSizingRule {

	Typographic = 0,

	Oversize = 1
}

/**
 * @since 8.0
 */
declare class UILexicon extends NSObject implements NSCopying {

	static alloc(): UILexicon; // inherited from NSObject

	static new(): UILexicon; // inherited from NSObject

	readonly entries: NSArray<UILexiconEntry>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 8.0
 */
declare class UILexiconEntry extends NSObject implements NSCopying {

	static alloc(): UILexiconEntry; // inherited from NSObject

	static new(): UILexiconEntry; // inherited from NSObject

	readonly documentText: string;

	readonly userInput: string;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 2.0
 * @deprecated 6.0
 */
declare const enum UILineBreakMode {

	WordWrap = 0,

	CharacterWrap = 1,

	Clip = 2,

	HeadTruncation = 3,

	TailTruncation = 4,

	MiddleTruncation = 5
}

/**
 * @since 14.0
 */
declare class UIListContentConfiguration extends NSObject implements NSSecureCoding, UIContentConfiguration {

	static accompaniedSidebarCellConfiguration(): UIListContentConfiguration;

	static accompaniedSidebarSubtitleCellConfiguration(): UIListContentConfiguration;

	static alloc(): UIListContentConfiguration; // inherited from NSObject

	static cellConfiguration(): UIListContentConfiguration;

	/**
	 * @since 15.0
	 */
	static extraProminentInsetGroupedHeaderConfiguration(): UIListContentConfiguration;

	/**
	 * @since 18.0
	 */
	static footerConfiguration(): UIListContentConfiguration;

	/**
	 * @since 14.0
	 * @deprecated 18.0
	 */
	static groupedFooterConfiguration(): UIListContentConfiguration;

	/**
	 * @since 14.0
	 * @deprecated 18.0
	 */
	static groupedHeaderConfiguration(): UIListContentConfiguration;

	/**
	 * @since 18.0
	 */
	static headerConfiguration(): UIListContentConfiguration;

	static new(): UIListContentConfiguration; // inherited from NSObject

	/**
	 * @since 14.0
	 * @deprecated 18.0
	 */
	static plainFooterConfiguration(): UIListContentConfiguration;

	/**
	 * @since 14.0
	 * @deprecated 18.0
	 */
	static plainHeaderConfiguration(): UIListContentConfiguration;

	/**
	 * @since 15.0
	 */
	static prominentInsetGroupedHeaderConfiguration(): UIListContentConfiguration;

	/**
	 * @since 14.0
	 * @deprecated 18.0
	 */
	static sidebarCellConfiguration(): UIListContentConfiguration;

	/**
	 * @since 14.0
	 * @deprecated 18.0
	 */
	static sidebarHeaderConfiguration(): UIListContentConfiguration;

	/**
	 * @since 14.0
	 * @deprecated 18.0
	 */
	static sidebarSubtitleCellConfiguration(): UIListContentConfiguration;

	static subtitleCellConfiguration(): UIListContentConfiguration;

	static valueCellConfiguration(): UIListContentConfiguration;

	/**
	 * @since 18.0
	 */
	alpha: number;

	attributedText: NSAttributedString;

	axesPreservingSuperviewLayoutMargins: UIAxis;

	directionalLayoutMargins: NSDirectionalEdgeInsets;

	image: UIImage;

	readonly imageProperties: UIListContentImageProperties;

	imageToTextPadding: number;

	prefersSideBySideTextAndSecondaryText: boolean;

	secondaryAttributedText: NSAttributedString;

	secondaryText: string;

	readonly secondaryTextProperties: UIListContentTextProperties;

	text: string;

	readonly textProperties: UIListContentTextProperties;

	textToSecondaryTextHorizontalPadding: number;

	textToSecondaryTextVerticalPadding: number;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	makeContentView(): UIView & UIContentView;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	updatedConfigurationForState(state: UIConfigurationState): this;
}

/**
 * @since 14.0
 */
declare class UIListContentImageProperties extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UIListContentImageProperties; // inherited from NSObject

	static new(): UIListContentImageProperties; // inherited from NSObject

	accessibilityIgnoresInvertColors: boolean;

	cornerRadius: number;

	maximumSize: CGSize;

	preferredSymbolConfiguration: UIImageSymbolConfiguration;

	reservedLayoutSize: CGSize;

	/**
	 * @since 18.0
	 */
	strokeColor: UIColor;

	/**
	 * @since 18.0
	 */
	strokeColorTransformer: (p1: UIColor) => UIColor;

	/**
	 * @since 18.0
	 */
	strokeWidth: number;

	tintColor: UIColor;

	tintColorTransformer: (p1: UIColor) => UIColor;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 18.0
	 */
	resolvedStrokeColorForTintColor(tintColor: UIColor): UIColor;

	resolvedTintColorForTintColor(tintColor: UIColor): UIColor;
}

/**
 * @since 14.0
 */
declare var UIListContentImageStandardDimension: number;

/**
 * @since 14.0
 */
declare const enum UIListContentTextAlignment {

	Natural = 0,

	Center = 1,

	Justified = 2
}

/**
 * @since 14.0
 */
declare class UIListContentTextProperties extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UIListContentTextProperties; // inherited from NSObject

	static new(): UIListContentTextProperties; // inherited from NSObject

	adjustsFontForContentSizeCategory: boolean;

	adjustsFontSizeToFitWidth: boolean;

	alignment: UIListContentTextAlignment;

	allowsDefaultTighteningForTruncation: boolean;

	color: UIColor;

	colorTransformer: (p1: UIColor) => UIColor;

	font: UIFont;

	lineBreakMode: NSLineBreakMode;

	minimumScaleFactor: number;

	numberOfLines: number;

	showsExpansionTextWhenTruncated: boolean;

	transform: UIListContentTextTransform;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	resolvedColor(): UIColor;
}

/**
 * @since 14.0
 */
declare const enum UIListContentTextTransform {

	None = 0,

	Uppercase = 1,

	Lowercase = 2,

	Capitalized = 3
}

/**
 * @since 14.0
 */
declare class UIListContentView extends UIView implements UIContentView {

	static alloc(): UIListContentView; // inherited from NSObject

	static appearance(): UIListContentView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIListContentView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIListContentView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIListContentView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIListContentView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIListContentView; // inherited from UIAppearance

	static new(): UIListContentView; // inherited from NSObject

	configuration: UIListContentConfiguration;

	readonly imageLayoutGuide: UILayoutGuide;

	readonly secondaryTextLayoutGuide: UILayoutGuide;

	readonly textLayoutGuide: UILayoutGuide;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { configuration: UIListContentConfiguration; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithConfiguration(configuration: UIListContentConfiguration): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 16.0
	 */
	supportsConfiguration(configuration: UIContentConfiguration): boolean;
}

/**
 * @since 18.0
 */
declare const enum UIListEnvironment {

	Unspecified = 0,

	None = 1,

	Plain = 2,

	Grouped = 3,

	InsetGrouped = 4,

	Sidebar = 5,

	SidebarPlain = 6
}

/**
 * @since 14.5
 */
declare var UIListSeparatorAutomaticInsets: NSDirectionalEdgeInsets;

/**
 * @since 14.5
 */
declare class UIListSeparatorConfiguration extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UIListSeparatorConfiguration; // inherited from NSObject

	static new(): UIListSeparatorConfiguration; // inherited from NSObject

	bottomSeparatorInsets: NSDirectionalEdgeInsets;

	bottomSeparatorVisibility: UIListSeparatorVisibility;

	color: UIColor;

	multipleSelectionColor: UIColor;

	topSeparatorInsets: NSDirectionalEdgeInsets;

	topSeparatorVisibility: UIListSeparatorVisibility;

	/**
	 * @since 15.0
	 */
	visualEffect: UIVisualEffect;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { listAppearance: UICollectionLayoutListAppearance; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithListAppearance(listAppearance: UICollectionLayoutListAppearance): this;
}

declare const enum UIListSeparatorVisibility {

	Automatic = 0,

	Visible = 1,

	Hidden = 2
}

/**
 * @since 4.0
 * @deprecated 10.0
 */
declare class UILocalNotification extends NSObject implements NSCoding, NSCopying {

	static alloc(): UILocalNotification; // inherited from NSObject

	static new(): UILocalNotification; // inherited from NSObject

	alertAction: string;

	alertBody: string;

	alertLaunchImage: string;

	/**
	 * @since 8.2
	 */
	alertTitle: string;

	applicationIconBadgeNumber: number;

	/**
	 * @since 8.0
	 */
	category: string;

	fireDate: Date;

	hasAction: boolean;

	/**
	 * @since 8.0
	 */
	region: CLRegion;

	/**
	 * @since 8.0
	 */
	regionTriggersOnce: boolean;

	repeatCalendar: NSCalendar;

	repeatInterval: NSCalendarUnit;

	soundName: string;

	timeZone: NSTimeZone;

	userInfo: NSDictionary<any, any>;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 4.0
 * @deprecated 10.0
 */
declare var UILocalNotificationDefaultSoundName: string;

/**
 * @since 3.0
 */
declare class UILocalizedIndexedCollation extends NSObject {

	static alloc(): UILocalizedIndexedCollation; // inherited from NSObject

	static currentCollation(): UILocalizedIndexedCollation;

	static new(): UILocalizedIndexedCollation; // inherited from NSObject

	readonly sectionIndexTitles: NSArray<string>;

	readonly sectionTitles: NSArray<string>;

	sectionForObjectCollationStringSelector(object: any, selector: string): number;

	sectionForSectionIndexTitleAtIndex(indexTitleIndex: number): number;

	sortedArrayFromArrayCollationStringSelector(array: NSArray<any> | any[], selector: string): NSArray<any>;
}

/**
 * @since 3.2
 */
declare class UILongPressGestureRecognizer extends UIGestureRecognizer {

	static alloc(): UILongPressGestureRecognizer; // inherited from NSObject

	static new(): UILongPressGestureRecognizer; // inherited from NSObject

	allowableMovement: number;

	minimumPressDuration: number;

	numberOfTapsRequired: number;

	numberOfTouchesRequired: number;
}

interface UILookToDictateCapable extends NSObjectProtocol {

	/**
	 * @since 17.0
	 */
	lookToDictateEnabled: boolean;
}
declare var UILookToDictateCapable: {

	prototype: UILookToDictateCapable;
};

/**
 * @since 5.0
 */
declare class UIManagedDocument extends UIDocument {

	static alloc(): UIManagedDocument; // inherited from NSObject

	static new(): UIManagedDocument; // inherited from NSObject

	readonly managedObjectContext: NSManagedObjectContext;

	readonly managedObjectModel: NSManagedObjectModel;

	modelConfiguration: string;

	persistentStoreOptions: NSDictionary<any, any>;

	static readonly persistentStoreName: string;

	additionalContentForURLError(absoluteURL: NSURL): any;

	configurePersistentStoreCoordinatorForURLOfTypeModelConfigurationStoreOptionsError(storeURL: NSURL, fileType: string, configuration: string, storeOptions: NSDictionary<any, any>): boolean;

	persistentStoreTypeForFileType(fileType: string): string;

	readAdditionalContentFromURLError(absoluteURL: NSURL): boolean;

	writeAdditionalContentToURLOriginalContentsURLError(content: any, absoluteURL: NSURL, absoluteOriginalContentsURL: NSURL): boolean;
}

/**
 * @since 4.2
 */
declare class UIMarkupTextPrintFormatter extends UIPrintFormatter {

	static alloc(): UIMarkupTextPrintFormatter; // inherited from NSObject

	static new(): UIMarkupTextPrintFormatter; // inherited from NSObject

	markupText: string;

	constructor(o: { markupText: string; });

	initWithMarkupText(markupText: string): this;
}

/**
 * @since 13.0
 */
declare class UIMenu extends UIMenuElement {

	static alloc(): UIMenu; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	static menuWithChildren(children: NSArray<UIMenuElement> | UIMenuElement[]): UIMenu;

	static menuWithTitleChildren(title: string, children: NSArray<UIMenuElement> | UIMenuElement[]): UIMenu;

	static menuWithTitleImageIdentifierOptionsChildren(title: string, image: UIImage, identifier: string, options: UIMenuOptions, children: NSArray<UIMenuElement> | UIMenuElement[]): UIMenu;

	static new(): UIMenu; // inherited from NSObject

	readonly children: NSArray<UIMenuElement>;

	/**
	 * @since 17.4
	 */
	displayPreferences: UIMenuDisplayPreferences;

	readonly identifier: string;

	readonly options: UIMenuOptions;

	/**
	 * @since 16.0
	 */
	preferredElementSize: UIMenuElementSize;

	/**
	 * @since 15.0
	 */
	readonly selectedElements: NSArray<UIMenuElement>;

	menuByReplacingChildren(newChildren: NSArray<UIMenuElement> | UIMenuElement[]): UIMenu;
}

/**
 * @since 13.0
 */
declare var UIMenuAbout: string;

/**
 * @since 13.0
 */
declare var UIMenuAlignment: string;

/**
 * @since 13.0
 */
declare var UIMenuApplication: string;

/**
 * @since 17.0
 */
declare var UIMenuAutoFill: string;

/**
 * @since 13.0
 */
declare var UIMenuBringAllToFront: string;

/**
 * @since 13.0
 */
interface UIMenuBuilder {

	system: UIMenuSystem;

	actionForIdentifier(identifier: string): UIAction;

	commandForActionPropertyList(action: string, propertyList: any): UICommand;

	insertChildMenuAtEndOfMenuForIdentifier(childMenu: UIMenu, parentIdentifier: string): void;

	insertChildMenuAtStartOfMenuForIdentifier(childMenu: UIMenu, parentIdentifier: string): void;

	insertSiblingMenuAfterMenuForIdentifier(siblingMenu: UIMenu, siblingIdentifier: string): void;

	insertSiblingMenuBeforeMenuForIdentifier(siblingMenu: UIMenu, siblingIdentifier: string): void;

	menuForIdentifier(identifier: string): UIMenu;

	removeMenuForIdentifier(removedIdentifier: string): void;

	replaceChildrenOfMenuForIdentifierFromChildrenBlock(parentIdentifier: string, childrenBlock: (p1: NSArray<UIMenuElement>) => NSArray<UIMenuElement>): void;

	replaceMenuForIdentifierWithMenu(replacedIdentifier: string, replacementMenu: UIMenu): void;
}
declare var UIMenuBuilder: {

	prototype: UIMenuBuilder;
};

/**
 * @since 13.0
 */
declare var UIMenuClose: string;

/**
 * @since 3.0
 * @deprecated 16.0
 */
declare class UIMenuController extends NSObject {

	static alloc(): UIMenuController; // inherited from NSObject

	static new(): UIMenuController; // inherited from NSObject

	/**
	 * @since 3.2
	 */
	arrowDirection: UIMenuControllerArrowDirection;

	readonly menuFrame: CGRect;

	/**
	 * @since 3.2
	 */
	menuItems: NSArray<UIMenuItem>;

	menuVisible: boolean;

	static readonly sharedMenuController: UIMenuController;

	/**
	 * @since 13.0
	 */
	hideMenu(): void;

	/**
	 * @since 13.0
	 */
	hideMenuFromView(targetView: UIView): void;

	/**
	 * @since 3.0
	 * @deprecated 13.0
	 */
	setMenuVisible(menuVisible: boolean): void;

	/**
	 * @since 3.0
	 * @deprecated 13.0
	 */
	setMenuVisibleAnimated(menuVisible: boolean, animated: boolean): void;

	/**
	 * @since 3.0
	 * @deprecated 13.0
	 */
	setTargetRectInView(targetRect: CGRect, targetView: UIView): void;

	/**
	 * @since 13.0
	 */
	showMenuFromViewRect(targetView: UIView, targetRect: CGRect): void;

	update(): void;
}

/**
 * @since 3.2
 * @deprecated 16.0
 */
declare const enum UIMenuControllerArrowDirection {

	Default = 0,

	Up = 1,

	Down = 2,

	Left = 3,

	Right = 4
}

/**
 * @since 3.0
 * @deprecated 16.0
 */
declare var UIMenuControllerDidHideMenuNotification: string;

/**
 * @since 3.0
 * @deprecated 16.0
 */
declare var UIMenuControllerDidShowMenuNotification: string;

/**
 * @since 3.0
 * @deprecated 16.0
 */
declare var UIMenuControllerMenuFrameDidChangeNotification: string;

/**
 * @since 3.0
 * @deprecated 16.0
 */
declare var UIMenuControllerWillHideMenuNotification: string;

/**
 * @since 3.0
 * @deprecated 16.0
 */
declare var UIMenuControllerWillShowMenuNotification: string;

/**
 * @since 17.4
 */
declare class UIMenuDisplayPreferences extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UIMenuDisplayPreferences; // inherited from NSObject

	static new(): UIMenuDisplayPreferences; // inherited from NSObject

	maximumNumberOfTitleLines: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 16.0
 */
declare var UIMenuDocument: string;

/**
 * @since 13.0
 */
declare var UIMenuEdit: string;

/**
 * @since 13.0
 */
declare class UIMenuElement extends NSObject implements NSCopying, NSSecureCoding, UIAccessibilityIdentification {

	static alloc(): UIMenuElement; // inherited from NSObject

	static new(): UIMenuElement; // inherited from NSObject

	readonly image: UIImage;

	/**
	 * @since 15.0
	 */
	subtitle: string;

	readonly title: string;

	/**
	 * @since 5.0
	 */
	accessibilityIdentifier: string; // inherited from UIAccessibilityIdentification

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

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
 * @since 13.0
 */
declare const enum UIMenuElementAttributes {

	Disabled = 1,

	Destructive = 2,

	Hidden = 4,

	KeepsMenuPresented = 8
}

/**
 * @since 16.0
 */
declare const enum UIMenuElementSize {

	Small = 0,

	Medium = 1,

	Large = 2,

	Automatic = -1
}

/**
 * @since 13.0
 */
declare const enum UIMenuElementState {

	Off = 0,

	On = 1,

	Mixed = 2
}

/**
 * @since 13.0
 */
declare var UIMenuFile: string;

/**
 * @since 13.0
 */
declare var UIMenuFind: string;

/**
 * @since 13.0
 */
declare var UIMenuFont: string;

/**
 * @since 13.0
 */
declare var UIMenuFormat: string;

/**
 * @since 13.0
 */
declare var UIMenuFullscreen: string;

/**
 * @since 13.0
 */
declare var UIMenuHelp: string;

/**
 * @since 13.0
 */
declare var UIMenuHide: string;

/**
 * @since 3.2
 * @deprecated 16.0
 */
declare class UIMenuItem extends NSObject {

	static alloc(): UIMenuItem; // inherited from NSObject

	static new(): UIMenuItem; // inherited from NSObject

	action: string;

	title: string;

	constructor(o: { title: string; action: string; });

	initWithTitleAction(title: string, action: string): this;
}

/**
 * @since 16.0
 */
interface UIMenuLeaf extends NSObjectProtocol {

	attributes: UIMenuElementAttributes;

	discoverabilityTitle: string;

	image: UIImage;

	/**
	 * @since 16.0
	 */
	presentationSourceItem: UIPopoverPresentationControllerSourceItem;

	/**
	 * @since 17.0
	 */
	selectedImage: UIImage;

	sender: any;

	state: UIMenuElementState;

	title: string;

	performWithSenderTarget(sender: any, target: any): void;
}
declare var UIMenuLeaf: {

	prototype: UIMenuLeaf;
};

/**
 * @since 13.0
 */
declare var UIMenuLearn: string;

/**
 * @since 13.0
 */
declare var UIMenuLookup: string;

/**
 * @since 13.0
 */
declare var UIMenuMinimizeAndZoom: string;

/**
 * @since 13.0
 */
declare var UIMenuNewScene: string;

/**
 * @since 14.0
 */
declare var UIMenuOpenRecent: string;

/**
 * @since 13.0
 */
declare const enum UIMenuOptions {

	DisplayInline = 1,

	Destructive = 2,

	SingleSelection = 32,

	DisplayAsPalette = 128
}

/**
 * @since 13.0
 */
declare var UIMenuPreferences: string;

/**
 * @since 13.0
 */
declare var UIMenuPrint: string;

/**
 * @since 13.0
 */
declare var UIMenuQuit: string;

/**
 * @since 13.0
 */
declare var UIMenuReplace: string;

/**
 * @since 13.0
 */
declare var UIMenuRoot: string;

/**
 * @since 13.0
 */
declare var UIMenuServices: string;

/**
 * @since 13.0
 */
declare var UIMenuShare: string;

/**
 * @since 15.0
 */
declare var UIMenuSidebar: string;

/**
 * @since 13.0
 */
declare var UIMenuSpeech: string;

/**
 * @since 13.0
 */
declare var UIMenuSpelling: string;

/**
 * @since 13.0
 */
declare var UIMenuSpellingOptions: string;

/**
 * @since 13.0
 */
declare var UIMenuSpellingPanel: string;

/**
 * @since 13.0
 */
declare var UIMenuStandardEdit: string;

/**
 * @since 13.0
 */
declare var UIMenuSubstitutionOptions: string;

/**
 * @since 13.0
 */
declare var UIMenuSubstitutions: string;

/**
 * @since 13.0
 */
declare var UIMenuSubstitutionsPanel: string;

/**
 * @since 13.0
 */
declare class UIMenuSystem extends NSObject {

	static alloc(): UIMenuSystem; // inherited from NSObject

	static new(): UIMenuSystem; // inherited from NSObject

	static readonly contextSystem: UIMenuSystem;

	static readonly mainSystem: UIMenuSystem;

	setNeedsRebuild(): void;

	setNeedsRevalidate(): void;
}

/**
 * @since 13.0
 */
declare var UIMenuText: string;

/**
 * @since 13.0
 */
declare var UIMenuTextColor: string;

/**
 * @since 13.0
 */
declare var UIMenuTextSize: string;

/**
 * @since 13.0
 */
declare var UIMenuTextStyle: string;

/**
 * @since 13.0
 */
declare var UIMenuTextStylePasteboard: string;

/**
 * @since 13.0
 */
declare var UIMenuToolbar: string;

/**
 * @since 13.0
 */
declare var UIMenuTransformations: string;

/**
 * @since 13.0
 */
declare var UIMenuUndoRedo: string;

/**
 * @since 13.0
 */
declare var UIMenuView: string;

/**
 * @since 13.0
 */
declare var UIMenuWindow: string;

/**
 * @since 13.0
 */
declare var UIMenuWritingDirection: string;

/**
 * @since 4.0
 * @deprecated 13.0
 */
declare var UIMinimumKeepAliveTimeout: number;

declare const enum UIModalPresentationStyle {

	FullScreen = 0,

	PageSheet = 1,

	FormSheet = 2,

	CurrentContext = 3,

	Custom = 4,

	OverFullScreen = 5,

	OverCurrentContext = 6,

	Popover = 7,

	BlurOverFullScreen = 8,

	None = -1,

	Automatic = -2
}

declare const enum UIModalTransitionStyle {

	CoverVertical = 0,

	FlipHorizontal = 1,

	CrossDissolve = 2,

	PartialCurl = 3
}

/**
 * @since 7.0
 */
declare class UIMotionEffect extends NSObject implements NSCoding, NSCopying {

	static alloc(): UIMotionEffect; // inherited from NSObject

	static new(): UIMotionEffect; // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	keyPathsAndRelativeValuesForViewerOffset(viewerOffset: UIOffset): NSDictionary<string, any>;
}

/**
 * @since 7.0
 */
declare class UIMotionEffectGroup extends UIMotionEffect {

	static alloc(): UIMotionEffectGroup; // inherited from NSObject

	static new(): UIMotionEffectGroup; // inherited from NSObject

	motionEffects: NSArray<UIMotionEffect>;
}

/**
 * @since 9.0
 */
declare class UIMutableApplicationShortcutItem extends UIApplicationShortcutItem {

	static alloc(): UIMutableApplicationShortcutItem; // inherited from NSObject

	static new(): UIMutableApplicationShortcutItem; // inherited from NSObject

	icon: UIApplicationShortcutIcon;

	localizedSubtitle: string;

	localizedTitle: string;

	targetContentIdentifier: any;

	type: string;

	userInfo: NSDictionary<string, NSSecureCoding>;
}

/**
 * @since 17.0
 */
interface UIMutableTraits extends NSObjectProtocol {

	accessibilityContrast: UIAccessibilityContrast;

	activeAppearance: UIUserInterfaceActiveAppearance;

	displayGamut: UIDisplayGamut;

	displayScale: number;

	forceTouchCapability: UIForceTouchCapability;

	horizontalSizeClass: UIUserInterfaceSizeClass;

	imageDynamicRange: UIImageDynamicRange;

	layoutDirection: UITraitEnvironmentLayoutDirection;

	legibilityWeight: UILegibilityWeight;

	/**
	 * @since 18.0
	 */
	listEnvironment: UIListEnvironment;

	preferredContentSizeCategory: string;

	/**
	 * @since 17.0
	 */
	sceneCaptureState: UISceneCaptureState;

	toolbarItemPresentationSize: UINSToolbarItemPresentationSize;

	typesettingLanguage: string;

	userInterfaceIdiom: UIUserInterfaceIdiom;

	userInterfaceLevel: UIUserInterfaceLevel;

	userInterfaceStyle: UIUserInterfaceStyle;

	verticalSizeClass: UIUserInterfaceSizeClass;

	objectForTrait(trait: typeof NSObject): NSObjectProtocol;

	setCGFloatValueForTrait(value: number, trait: typeof NSObject): void;

	setNSIntegerValueForTrait(value: number, trait: typeof NSObject): void;

	setObjectForTrait(object: NSObjectProtocol, trait: typeof NSObject): void;

	valueForCGFloatTrait(trait: typeof NSObject): number;

	valueForNSIntegerTrait(trait: typeof NSObject): number;
}
declare var UIMutableTraits: {

	prototype: UIMutableTraits;
};

/**
 * @since 8.0
 * @deprecated 10.0
 */
declare class UIMutableUserNotificationAction extends UIUserNotificationAction {

	static alloc(): UIMutableUserNotificationAction; // inherited from NSObject

	static new(): UIMutableUserNotificationAction; // inherited from NSObject

	activationMode: UIUserNotificationActivationMode;

	authenticationRequired: boolean;

	/**
	 * @since 9.0
	 */
	behavior: UIUserNotificationActionBehavior;

	destructive: boolean;

	identifier: string;

	/**
	 * @since 9.0
	 */
	parameters: NSDictionary<any, any>;

	title: string;
}

/**
 * @since 8.0
 * @deprecated 10.0
 */
declare class UIMutableUserNotificationCategory extends UIUserNotificationCategory {

	static alloc(): UIMutableUserNotificationCategory; // inherited from NSObject

	static new(): UIMutableUserNotificationCategory; // inherited from NSObject

	identifier: string;

	setActionsForContext(actions: NSArray<UIUserNotificationAction> | UIUserNotificationAction[], context: UIUserNotificationActionContext): void;
}

/**
 * @since 17.0
 */
interface UINSIntegerTraitDefinition extends UITraitDefinition {
}
declare var UINSIntegerTraitDefinition: {

	prototype: UINSIntegerTraitDefinition;
};

declare const enum UINSToolbarItemPresentationSize {

	Unspecified = -1,

	Regular = 0,

	Small = 1,

	Large = 3
}

/**
 * @since 2.0
 */
declare class UINavigationBar extends UIView implements NSCoding, UIBarPositioning {

	static alloc(): UINavigationBar; // inherited from NSObject

	static appearance(): UINavigationBar; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UINavigationBar; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UINavigationBar; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UINavigationBar; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UINavigationBar; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UINavigationBar; // inherited from UIAppearance

	static new(): UINavigationBar; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	backIndicatorImage: UIImage;

	/**
	 * @since 7.0
	 */
	backIndicatorTransitionMaskImage: UIImage;

	readonly backItem: UINavigationItem;

	barStyle: UIBarStyle;

	/**
	 * @since 7.0
	 */
	barTintColor: UIColor;

	/**
	 * @since 16.0
	 */
	readonly behavioralStyle: UIBehavioralStyle;

	/**
	 * @since 13.0
	 */
	compactAppearance: UINavigationBarAppearance;

	/**
	 * @since 15.0
	 */
	compactScrollEdgeAppearance: UINavigationBarAppearance;

	/**
	 * @since 16.0
	 */
	readonly currentNSToolbarSection: UINavigationBarNSToolbarSection;

	delegate: UINavigationBarDelegate;

	items: NSArray<UINavigationItem>;

	/**
	 * @since 11.0
	 */
	largeTitleTextAttributes: NSDictionary<string, any>;

	/**
	 * @since 16.0
	 */
	preferredBehavioralStyle: UIBehavioralStyle;

	/**
	 * @since 11.0
	 */
	prefersLargeTitles: boolean;

	/**
	 * @since 13.0
	 */
	scrollEdgeAppearance: UINavigationBarAppearance;

	/**
	 * @since 6.0
	 */
	shadowImage: UIImage;

	/**
	 * @since 13.0
	 */
	standardAppearance: UINavigationBarAppearance;

	/**
	 * @since 5.0
	 */
	titleTextAttributes: NSDictionary<string, any>;

	readonly topItem: UINavigationItem;

	/**
	 * @since 3.0
	 */
	translucent: boolean;

	readonly barPosition: UIBarPosition; // inherited from UIBarPositioning

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 5.0
	 */
	backgroundImageForBarMetrics(barMetrics: UIBarMetrics): UIImage;

	/**
	 * @since 7.0
	 */
	backgroundImageForBarPositionBarMetrics(barPosition: UIBarPosition, barMetrics: UIBarMetrics): UIImage;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	popNavigationItemAnimated(animated: boolean): UINavigationItem;

	pushNavigationItemAnimated(item: UINavigationItem, animated: boolean): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 5.0
	 */
	setBackgroundImageForBarMetrics(backgroundImage: UIImage, barMetrics: UIBarMetrics): void;

	/**
	 * @since 7.0
	 */
	setBackgroundImageForBarPositionBarMetrics(backgroundImage: UIImage, barPosition: UIBarPosition, barMetrics: UIBarMetrics): void;

	setItemsAnimated(items: NSArray<UINavigationItem> | UINavigationItem[], animated: boolean): void;

	/**
	 * @since 5.0
	 */
	setTitleVerticalPositionAdjustmentForBarMetrics(adjustment: number, barMetrics: UIBarMetrics): void;

	/**
	 * @since 5.0
	 */
	titleVerticalPositionAdjustmentForBarMetrics(barMetrics: UIBarMetrics): number;
}

/**
 * @since 13.0
 */
declare class UINavigationBarAppearance extends UIBarAppearance {

	static alloc(): UINavigationBarAppearance; // inherited from NSObject

	static new(): UINavigationBarAppearance; // inherited from NSObject

	backButtonAppearance: UIBarButtonItemAppearance;

	readonly backIndicatorImage: UIImage;

	readonly backIndicatorTransitionMaskImage: UIImage;

	buttonAppearance: UIBarButtonItemAppearance;

	doneButtonAppearance: UIBarButtonItemAppearance;

	largeTitleTextAttributes: NSDictionary<string, any>;

	titlePositionAdjustment: UIOffset;

	titleTextAttributes: NSDictionary<string, any>;

	setBackIndicatorImageTransitionMaskImage(backIndicatorImage: UIImage, backIndicatorTransitionMaskImage: UIImage): void;
}

interface UINavigationBarDelegate extends UIBarPositioningDelegate {

	navigationBarDidPopItem?(navigationBar: UINavigationBar, item: UINavigationItem): void;

	navigationBarDidPushItem?(navigationBar: UINavigationBar, item: UINavigationItem): void;

	navigationBarNSToolbarSection?(navigationBar: UINavigationBar): UINavigationBarNSToolbarSection;

	navigationBarShouldPopItem?(navigationBar: UINavigationBar, item: UINavigationItem): boolean;

	navigationBarShouldPushItem?(navigationBar: UINavigationBar, item: UINavigationItem): boolean;
}
declare var UINavigationBarDelegate: {

	prototype: UINavigationBarDelegate;
};

/**
 * @since 16.0
 */
declare const enum UINavigationBarNSToolbarSection {

	None = 0,

	Sidebar = 1,

	Supplementary = 2,

	Content = 3
}

/**
 * @since 2.0
 */
declare class UINavigationController extends UIViewController {

	static alloc(): UINavigationController; // inherited from NSObject

	static new(): UINavigationController; // inherited from NSObject

	/**
	 * @since 8.0
	 */
	readonly barHideOnSwipeGestureRecognizer: UIPanGestureRecognizer;

	/**
	 * @since 8.0
	 */
	readonly barHideOnTapGestureRecognizer: UITapGestureRecognizer;

	delegate: UINavigationControllerDelegate;

	/**
	 * @since 8.0
	 */
	hidesBarsOnSwipe: boolean;

	/**
	 * @since 8.0
	 */
	hidesBarsOnTap: boolean;

	/**
	 * @since 8.0
	 */
	hidesBarsWhenKeyboardAppears: boolean;

	/**
	 * @since 8.0
	 */
	hidesBarsWhenVerticallyCompact: boolean;

	/**
	 * @since 7.0
	 */
	readonly interactivePopGestureRecognizer: UIGestureRecognizer;

	readonly navigationBar: UINavigationBar;

	navigationBarHidden: boolean;

	/**
	 * @since 3.0
	 */
	readonly toolbar: UIToolbar;

	/**
	 * @since 3.0
	 */
	toolbarHidden: boolean;

	readonly topViewController: UIViewController;

	viewControllers: NSArray<UIViewController>;

	readonly visibleViewController: UIViewController;

	/**
	 * @since 5.0
	 */
	constructor(o: { navigationBarClass: typeof NSObject; toolbarClass: typeof NSObject; });

	constructor(o: { rootViewController: UIViewController; });

	/**
	 * @since 5.0
	 */
	initWithNavigationBarClassToolbarClass(navigationBarClass: typeof NSObject, toolbarClass: typeof NSObject): this;

	initWithRootViewController(rootViewController: UIViewController): this;

	popToRootViewControllerAnimated(animated: boolean): NSArray<UIViewController>;

	popToViewControllerAnimated(viewController: UIViewController, animated: boolean): NSArray<UIViewController>;

	popViewControllerAnimated(animated: boolean): UIViewController;

	pushViewControllerAnimated(viewController: UIViewController, animated: boolean): void;

	setNavigationBarHiddenAnimated(hidden: boolean, animated: boolean): void;

	/**
	 * @since 3.0
	 */
	setToolbarHiddenAnimated(hidden: boolean, animated: boolean): void;

	/**
	 * @since 3.0
	 */
	setViewControllersAnimated(viewControllers: NSArray<UIViewController> | UIViewController[], animated: boolean): void;
}

interface UINavigationControllerDelegate extends NSObjectProtocol {

	/**
	 * @since 7.0
	 */
	navigationControllerAnimationControllerForOperationFromViewControllerToViewController?(navigationController: UINavigationController, operation: UINavigationControllerOperation, fromVC: UIViewController, toVC: UIViewController): UIViewControllerAnimatedTransitioning;

	navigationControllerDidShowViewControllerAnimated?(navigationController: UINavigationController, viewController: UIViewController, animated: boolean): void;

	/**
	 * @since 7.0
	 */
	navigationControllerInteractionControllerForAnimationController?(navigationController: UINavigationController, animationController: UIViewControllerAnimatedTransitioning): UIViewControllerInteractiveTransitioning;

	/**
	 * @since 7.0
	 */
	navigationControllerPreferredInterfaceOrientationForPresentation?(navigationController: UINavigationController): UIInterfaceOrientation;

	/**
	 * @since 7.0
	 */
	navigationControllerSupportedInterfaceOrientations?(navigationController: UINavigationController): UIInterfaceOrientationMask;

	navigationControllerWillShowViewControllerAnimated?(navigationController: UINavigationController, viewController: UIViewController, animated: boolean): void;
}
declare var UINavigationControllerDelegate: {

	prototype: UINavigationControllerDelegate;
};

declare var UINavigationControllerHideShowBarDuration: number;

declare const enum UINavigationControllerOperation {

	None = 0,

	Push = 1,

	Pop = 2
}

/**
 * @since 2.0
 */
declare class UINavigationItem extends NSObject implements NSCoding {

	static alloc(): UINavigationItem; // inherited from NSObject

	static new(): UINavigationItem; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	additionalOverflowItems: UIDeferredMenuElement;

	/**
	 * @since 16.0
	 */
	backAction: UIAction;

	backBarButtonItem: UIBarButtonItem;

	/**
	 * @since 14.0
	 */
	backButtonDisplayMode: UINavigationItemBackButtonDisplayMode;

	/**
	 * @since 11.0
	 */
	backButtonTitle: string;

	/**
	 * @since 16.0
	 */
	centerItemGroups: NSArray<UIBarButtonItemGroup>;

	/**
	 * @since 13.0
	 */
	compactAppearance: UINavigationBarAppearance;

	/**
	 * @since 15.0
	 */
	compactScrollEdgeAppearance: UINavigationBarAppearance;

	/**
	 * @since 16.0
	 */
	customizationIdentifier: string;

	/**
	 * @since 16.0
	 */
	documentProperties: UIDocumentProperties;

	hidesBackButton: boolean;

	/**
	 * @since 11.0
	 */
	hidesSearchBarWhenScrolling: boolean;

	/**
	 * @since 11.0
	 */
	largeTitleDisplayMode: UINavigationItemLargeTitleDisplayMode;

	/**
	 * @since 16.0
	 */
	leadingItemGroups: NSArray<UIBarButtonItemGroup>;

	leftBarButtonItem: UIBarButtonItem;

	/**
	 * @since 5.0
	 */
	leftBarButtonItems: NSArray<UIBarButtonItem>;

	/**
	 * @since 5.0
	 */
	leftItemsSupplementBackButton: boolean;

	/**
	 * @since 16.0
	 */
	readonly overflowPresentationSource: UIPopoverPresentationControllerSourceItem;

	/**
	 * @since 16.0
	 */
	pinnedTrailingGroup: UIBarButtonItemGroup;

	/**
	 * @since 16.0
	 */
	preferredSearchBarPlacement: UINavigationItemSearchBarPlacement;

	prompt: string;

	/**
	 * @since 16.0
	 */
	renameDelegate: UINavigationItemRenameDelegate;

	rightBarButtonItem: UIBarButtonItem;

	/**
	 * @since 5.0
	 */
	rightBarButtonItems: NSArray<UIBarButtonItem>;

	/**
	 * @since 13.0
	 */
	scrollEdgeAppearance: UINavigationBarAppearance;

	/**
	 * @since 16.0
	 */
	readonly searchBarPlacement: UINavigationItemSearchBarPlacement;

	/**
	 * @since 11.0
	 */
	searchController: UISearchController;

	/**
	 * @since 13.0
	 */
	standardAppearance: UINavigationBarAppearance;

	/**
	 * @since 16.0
	 */
	style: UINavigationItemStyle;

	title: string;

	/**
	 * @since 16.0
	 */
	titleMenuProvider: (p1: NSArray<UIMenuElement>) => UIMenu;

	titleView: UIView;

	/**
	 * @since 16.0
	 */
	trailingItemGroups: NSArray<UIBarButtonItemGroup>;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { title: string; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTitle(title: string): this;

	setHidesBackButtonAnimated(hidesBackButton: boolean, animated: boolean): void;

	setLeftBarButtonItemAnimated(item: UIBarButtonItem, animated: boolean): void;

	/**
	 * @since 5.0
	 */
	setLeftBarButtonItemsAnimated(items: NSArray<UIBarButtonItem> | UIBarButtonItem[], animated: boolean): void;

	setRightBarButtonItemAnimated(item: UIBarButtonItem, animated: boolean): void;

	/**
	 * @since 5.0
	 */
	setRightBarButtonItemsAnimated(items: NSArray<UIBarButtonItem> | UIBarButtonItem[], animated: boolean): void;
}

declare const enum UINavigationItemBackButtonDisplayMode {

	Default = 0,

	Generic = 1,

	Minimal = 2
}

declare const enum UINavigationItemLargeTitleDisplayMode {

	Automatic = 0,

	Always = 1,

	Never = 2,

	Inline = 3
}

/**
 * @since 16.0
 */
interface UINavigationItemRenameDelegate extends NSObjectProtocol {

	navigationItemDidEndRenamingWithTitle(navigationItem: UINavigationItem, title: string): void;

	navigationItemShouldBeginRenaming?(navigationItem: UINavigationItem): boolean;

	navigationItemShouldEndRenamingWithTitle?(navigationItem: UINavigationItem, title: string): boolean;

	navigationItemWillBeginRenamingWithSuggestedTitleSelectedRange?(navigationItem: UINavigationItem, title: string, selectedRange: interop.Pointer | interop.Reference<NSRange>): string;
}
declare var UINavigationItemRenameDelegate: {

	prototype: UINavigationItemRenameDelegate;
};

/**
 * @since 16.0
 */
declare const enum UINavigationItemSearchBarPlacement {

	Automatic = 0,

	Inline = 1,

	Stacked = 2
}

/**
 * @since 16.0
 */
declare const enum UINavigationItemStyle {

	Navigator = 0,

	Browser = 1,

	Editor = 2
}

/**
 * @since 4.0
 */
declare class UINib extends NSObject {

	static alloc(): UINib; // inherited from NSObject

	static new(): UINib; // inherited from NSObject

	static nibWithDataBundle(data: NSData, bundleOrNil: NSBundle): UINib;

	static nibWithNibNameBundle(name: string, bundleOrNil: NSBundle): UINib;

	instantiateWithOwnerOptions(ownerOrNil: any, optionsOrNil: NSDictionary<string, any>): NSArray<any>;
}

/**
 * @since 3.0
 */
declare var UINibExternalObjects: string;

/**
 * @since 2.0
 * @deprecated 3.0
 */
declare var UINibProxiedObjectsKey: string;

/**
 * @since 10.0
 */
declare class UINotificationFeedbackGenerator extends UIFeedbackGenerator {

	static alloc(): UINotificationFeedbackGenerator; // inherited from NSObject

	/**
	 * @since 17.5
	 */
	static feedbackGeneratorForView(view: UIView): UINotificationFeedbackGenerator; // inherited from UIFeedbackGenerator

	static new(): UINotificationFeedbackGenerator; // inherited from NSObject

	notificationOccurred(notificationType: UINotificationFeedbackType): void;

	/**
	 * @since 17.5
	 */
	notificationOccurredAtLocation(notificationType: UINotificationFeedbackType, location: CGPoint): void;
}

/**
 * @since 10.0
 */
declare const enum UINotificationFeedbackType {

	Success = 0,

	Warning = 1,

	Error = 2
}

interface UIObjectRestoration {
}
declare var UIObjectRestoration: {

	prototype: UIObjectRestoration;

	objectWithRestorationIdentifierPathCoder(identifierComponents: NSArray<string> | string[], coder: NSCoder): UIStateRestoring;
};

/**
 * @since 17.0
 */
interface UIObjectTraitDefinition extends UITraitDefinition {
}
declare var UIObjectTraitDefinition: {

	prototype: UIObjectTraitDefinition;
};

interface UIOffset {
	horizontal: number;
	vertical: number;
}
declare var UIOffset: interop.StructType<UIOffset>;

declare function UIOffsetFromString(string: string): UIOffset;

declare var UIOffsetZero: UIOffset;

/**
 * @since 13.0
 */
declare class UIOpenURLContext extends NSObject {

	static alloc(): UIOpenURLContext; // inherited from NSObject

	static new(): UIOpenURLContext; // inherited from NSObject

	readonly URL: NSURL;

	readonly options: UISceneOpenURLOptions;
}

/**
 * @since 2.0
 */
declare class UIPageControl extends UIControl {

	static alloc(): UIPageControl; // inherited from NSObject

	static appearance(): UIPageControl; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIPageControl; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIPageControl; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIPageControl; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIPageControl; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIPageControl; // inherited from UIAppearance

	static new(): UIPageControl; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	allowsContinuousInteraction: boolean;

	/**
	 * @since 14.0
	 */
	backgroundStyle: UIPageControlBackgroundStyle;

	currentPage: number;

	/**
	 * @since 6.0
	 */
	currentPageIndicatorTintColor: UIColor;

	/**
	 * @since 2.0
	 * @deprecated 14.0
	 */
	defersCurrentPageDisplay: boolean;

	/**
	 * @since 16.0
	 */
	direction: UIPageControlDirection;

	hidesForSinglePage: boolean;

	/**
	 * @since 14.0
	 */
	readonly interactionState: UIPageControlInteractionState;

	numberOfPages: number;

	/**
	 * @since 6.0
	 */
	pageIndicatorTintColor: UIColor;

	/**
	 * @since 16.0
	 */
	preferredCurrentPageIndicatorImage: UIImage;

	/**
	 * @since 14.0
	 */
	preferredIndicatorImage: UIImage;

	/**
	 * @since 17.0
	 */
	progress: UIPageControlProgress;

	/**
	 * @since 16.0
	 */
	currentPageIndicatorImageForPage(page: number): UIImage;

	/**
	 * @since 14.0
	 */
	indicatorImageForPage(page: number): UIImage;

	/**
	 * @since 16.0
	 */
	setCurrentPageIndicatorImageForPage(image: UIImage, page: number): void;

	/**
	 * @since 14.0
	 */
	setIndicatorImageForPage(image: UIImage, page: number): void;

	sizeForNumberOfPages(pageCount: number): CGSize;

	/**
	 * @since 2.0
	 * @deprecated 14.0
	 */
	updateCurrentPageDisplay(): void;
}

/**
 * @since 14.0
 */
declare const enum UIPageControlBackgroundStyle {

	Automatic = 0,

	Prominent = 1,

	Minimal = 2
}

/**
 * @since 16.0
 */
declare const enum UIPageControlDirection {

	Natural = 0,

	LeftToRight = 1,

	RightToLeft = 2,

	TopToBottom = 3,

	BottomToTop = 4
}

/**
 * @since 14.0
 */
declare const enum UIPageControlInteractionState {

	None = 0,

	Discrete = 1,

	Continuous = 2
}

/**
 * @since 17.0
 */
declare class UIPageControlProgress extends NSObject {

	static alloc(): UIPageControlProgress; // inherited from NSObject

	static new(): UIPageControlProgress; // inherited from NSObject

	currentProgress: number;

	delegate: UIPageControlProgressDelegate;

	readonly progressVisible: boolean;
}

/**
 * @since 17.0
 */
interface UIPageControlProgressDelegate extends NSObjectProtocol {

	pageControlProgressInitialProgressForPage?(progress: UIPageControlProgress, page: number): number;

	pageControlProgressVisibilityDidChange?(progress: UIPageControlProgress): void;
}
declare var UIPageControlProgressDelegate: {

	prototype: UIPageControlProgressDelegate;
};

/**
 * @since 17.0
 */
declare class UIPageControlTimerProgress extends UIPageControlProgress {

	static alloc(): UIPageControlTimerProgress; // inherited from NSObject

	static new(): UIPageControlTimerProgress; // inherited from NSObject

	delegate: UIPageControlTimerProgressDelegate;

	preferredDuration: number;

	resetsToInitialPageAfterEnd: boolean;

	readonly running: boolean;

	constructor(o: { preferredDuration: number; });

	durationForPage(page: number): number;

	initWithPreferredDuration(preferredDuration: number): this;

	pauseTimer(): void;

	resumeTimer(): void;

	setDurationForPage(duration: number, page: number): void;
}

/**
 * @since 17.0
 */
interface UIPageControlTimerProgressDelegate extends UIPageControlProgressDelegate {

	pageControlTimerProgressDidChange?(progress: UIPageControlTimerProgress): void;

	pageControlTimerProgressShouldAdvanceToPage?(progress: UIPageControlTimerProgress, page: number): boolean;
}
declare var UIPageControlTimerProgressDelegate: {

	prototype: UIPageControlTimerProgressDelegate;
};

/**
 * @since 5.0
 */
declare class UIPageViewController extends UIViewController {

	static alloc(): UIPageViewController; // inherited from NSObject

	static new(): UIPageViewController; // inherited from NSObject

	dataSource: UIPageViewControllerDataSource;

	delegate: UIPageViewControllerDelegate;

	doubleSided: boolean;

	readonly gestureRecognizers: NSArray<UIGestureRecognizer>;

	readonly navigationOrientation: UIPageViewControllerNavigationOrientation;

	readonly spineLocation: UIPageViewControllerSpineLocation;

	readonly transitionStyle: UIPageViewControllerTransitionStyle;

	readonly viewControllers: NSArray<UIViewController>;

	constructor(o: { transitionStyle: UIPageViewControllerTransitionStyle; navigationOrientation: UIPageViewControllerNavigationOrientation; options: NSDictionary<string, any>; });

	initWithTransitionStyleNavigationOrientationOptions(style: UIPageViewControllerTransitionStyle, navigationOrientation: UIPageViewControllerNavigationOrientation, options: NSDictionary<string, any>): this;

	setViewControllersDirectionAnimatedCompletion(viewControllers: NSArray<UIViewController> | UIViewController[], direction: UIPageViewControllerNavigationDirection, animated: boolean, completion: (p1: boolean) => void): void;
}

interface UIPageViewControllerDataSource extends NSObjectProtocol {

	pageViewControllerViewControllerAfterViewController(pageViewController: UIPageViewController, viewController: UIViewController): UIViewController;

	pageViewControllerViewControllerBeforeViewController(pageViewController: UIPageViewController, viewController: UIViewController): UIViewController;

	/**
	 * @since 6.0
	 */
	presentationCountForPageViewController?(pageViewController: UIPageViewController): number;

	/**
	 * @since 6.0
	 */
	presentationIndexForPageViewController?(pageViewController: UIPageViewController): number;
}
declare var UIPageViewControllerDataSource: {

	prototype: UIPageViewControllerDataSource;
};

interface UIPageViewControllerDelegate extends NSObjectProtocol {

	pageViewControllerDidFinishAnimatingPreviousViewControllersTransitionCompleted?(pageViewController: UIPageViewController, finished: boolean, previousViewControllers: NSArray<UIViewController> | UIViewController[], completed: boolean): void;

	/**
	 * @since 7.0
	 */
	pageViewControllerPreferredInterfaceOrientationForPresentation?(pageViewController: UIPageViewController): UIInterfaceOrientation;

	pageViewControllerSpineLocationForInterfaceOrientation?(pageViewController: UIPageViewController, orientation: UIInterfaceOrientation): UIPageViewControllerSpineLocation;

	/**
	 * @since 7.0
	 */
	pageViewControllerSupportedInterfaceOrientations?(pageViewController: UIPageViewController): UIInterfaceOrientationMask;

	/**
	 * @since 6.0
	 */
	pageViewControllerWillTransitionToViewControllers?(pageViewController: UIPageViewController, pendingViewControllers: NSArray<UIViewController> | UIViewController[]): void;
}
declare var UIPageViewControllerDelegate: {

	prototype: UIPageViewControllerDelegate;
};

declare const enum UIPageViewControllerNavigationDirection {

	Forward = 0,

	Reverse = 1
}

declare const enum UIPageViewControllerNavigationOrientation {

	Horizontal = 0,

	Vertical = 1
}

/**
 * @since 6.0
 */
declare var UIPageViewControllerOptionInterPageSpacingKey: string;

declare var UIPageViewControllerOptionSpineLocationKey: string;

declare const enum UIPageViewControllerSpineLocation {

	None = 0,

	Min = 1,

	Mid = 2,

	Max = 3
}

declare const enum UIPageViewControllerTransitionStyle {

	PageCurl = 0,

	Scroll = 1
}

/**
 * @since 3.2
 */
declare class UIPanGestureRecognizer extends UIGestureRecognizer {

	static alloc(): UIPanGestureRecognizer; // inherited from NSObject

	static new(): UIPanGestureRecognizer; // inherited from NSObject

	/**
	 * @since 13.4
	 */
	allowedScrollTypesMask: UIScrollTypeMask;

	maximumNumberOfTouches: number;

	minimumNumberOfTouches: number;

	setTranslationInView(translation: CGPoint, view: UIView): void;

	translationInView(view: UIView): CGPoint;

	velocityInView(view: UIView): CGPoint;
}

/**
 * @since 11.0
 */
declare class UIPasteConfiguration extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UIPasteConfiguration; // inherited from NSObject

	static new(): UIPasteConfiguration; // inherited from NSObject

	acceptableTypeIdentifiers: NSArray<string>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { acceptableTypeIdentifiers: NSArray<string> | string[]; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { typeIdentifiersForAcceptingClass: typeof NSObject; });

	addAcceptableTypeIdentifiers(acceptableTypeIdentifiers: NSArray<string> | string[]): void;

	addTypeIdentifiersForAcceptingClass(aClass: typeof NSObject): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithAcceptableTypeIdentifiers(acceptableTypeIdentifiers: NSArray<string> | string[]): this;

	initWithCoder(coder: NSCoder): this;

	initWithTypeIdentifiersForAcceptingClass(aClass: typeof NSObject): this;
}

/**
 * @since 11.0
 */
interface UIPasteConfigurationSupporting extends NSObjectProtocol {

	pasteConfiguration: UIPasteConfiguration;

	canPasteItemProviders?(itemProviders: NSArray<NSItemProvider> | NSItemProvider[]): boolean;

	pasteItemProviders?(itemProviders: NSArray<NSItemProvider> | NSItemProvider[]): void;
}
declare var UIPasteConfigurationSupporting: {

	prototype: UIPasteConfigurationSupporting;
};

/**
 * @since 16.0
 */
declare class UIPasteControl extends UIControl {

	static alloc(): UIPasteControl; // inherited from NSObject

	static appearance(): UIPasteControl; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIPasteControl; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIPasteControl; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIPasteControl; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIPasteControl; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIPasteControl; // inherited from UIAppearance

	static new(): UIPasteControl; // inherited from NSObject

	readonly configuration: UIPasteControlConfiguration;

	target: UIPasteConfigurationSupporting;

	constructor(o: { configuration: UIPasteControlConfiguration; });

	initWithConfiguration(configuration: UIPasteControlConfiguration): this;
}

/**
 * @since 16.0
 */
declare class UIPasteControlConfiguration extends NSObject implements NSSecureCoding {

	static alloc(): UIPasteControlConfiguration; // inherited from NSObject

	static new(): UIPasteControlConfiguration; // inherited from NSObject

	baseBackgroundColor: UIColor;

	baseForegroundColor: UIColor;

	cornerRadius: number;

	cornerStyle: UIButtonConfigurationCornerStyle;

	displayMode: UIPasteControlDisplayMode;

	imagePlacement: NSDirectionalRectEdge;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 16.0
 */
declare const enum UIPasteControlDisplayMode {

	IconAndLabel = 0,

	IconOnly = 1,

	LabelOnly = 2,

	ArrowAndLabel = 3
}

/**
 * @since 3.0
 */
declare class UIPasteboard extends NSObject {

	static alloc(): UIPasteboard; // inherited from NSObject

	static new(): UIPasteboard; // inherited from NSObject

	static pasteboardWithNameCreate(pasteboardName: string, create: boolean): UIPasteboard;

	static pasteboardWithUniqueName(): UIPasteboard;

	static removePasteboardWithName(pasteboardName: string): void;

	URL: NSURL;

	URLs: NSArray<NSURL>;

	readonly changeCount: number;

	color: UIColor;

	colors: NSArray<UIColor>;

	/**
	 * @since 10.0
	 */
	readonly hasColors: boolean;

	/**
	 * @since 10.0
	 */
	readonly hasImages: boolean;

	/**
	 * @since 10.0
	 */
	readonly hasStrings: boolean;

	/**
	 * @since 10.0
	 */
	readonly hasURLs: boolean;

	image: UIImage;

	images: NSArray<UIImage>;

	/**
	 * @since 11.0
	 */
	itemProviders: NSArray<NSItemProvider>;

	items: NSArray<NSDictionary<string, any>>;

	readonly name: string;

	readonly numberOfItems: number;

	readonly pasteboardTypes: NSArray<string>;

	readonly persistent: boolean;

	string: string;

	strings: NSArray<string>;

	static readonly generalPasteboard: UIPasteboard;

	addItems(items: NSArray<NSDictionary<string, any>> | NSDictionary<string, any>[]): void;

	containsPasteboardTypes(pasteboardTypes: NSArray<string> | string[]): boolean;

	containsPasteboardTypesInItemSet(pasteboardTypes: NSArray<string> | string[], itemSet: NSIndexSet): boolean;

	dataForPasteboardType(pasteboardType: string): NSData;

	dataForPasteboardTypeInItemSet(pasteboardType: string, itemSet: NSIndexSet): NSArray<NSData>;

	/**
	 * @since 14.0
	 */
	detectPatternsForPatternsCompletionHandler(patterns: NSSet<string>, completionHandler: (p1: NSSet<string>, p2: NSError) => void): void;

	/**
	 * @since 14.0
	 */
	detectPatternsForPatternsInItemSetCompletionHandler(patterns: NSSet<string>, itemSet: NSIndexSet, completionHandler: (p1: NSArray<NSSet<string>>, p2: NSError) => void): void;

	/**
	 * @since 14.0
	 */
	detectValuesForPatternsCompletionHandler(patterns: NSSet<string>, completionHandler: (p1: NSDictionary<string, any>, p2: NSError) => void): void;

	/**
	 * @since 14.0
	 */
	detectValuesForPatternsInItemSetCompletionHandler(patterns: NSSet<string>, itemSet: NSIndexSet, completionHandler: (p1: NSArray<NSDictionary<string, any>>, p2: NSError) => void): void;

	itemSetWithPasteboardTypes(pasteboardTypes: NSArray<string> | string[]): NSIndexSet;

	pasteboardTypesForItemSet(itemSet: NSIndexSet): NSArray<NSArray<string>>;

	setDataForPasteboardType(data: NSData, pasteboardType: string): void;

	/**
	 * @since 11.0
	 */
	setItemProvidersLocalOnlyExpirationDate(itemProviders: NSArray<NSItemProvider> | NSItemProvider[], localOnly: boolean, expirationDate: Date): void;

	/**
	 * @since 10.0
	 */
	setItemsOptions(items: NSArray<NSDictionary<string, any>> | NSDictionary<string, any>[], options: NSDictionary<string, any>): void;

	/**
	 * @since 11.0
	 */
	setObjects(objects: NSArray<NSItemProviderWriting> | NSItemProviderWriting[]): void;

	/**
	 * @since 11.0
	 */
	setObjectsLocalOnlyExpirationDate(objects: NSArray<NSItemProviderWriting> | NSItemProviderWriting[], localOnly: boolean, expirationDate: Date): void;

	/**
	 * @since 3.0
	 * @deprecated 10.0
	 */
	setPersistent(persistent: boolean): void;

	setValueForPasteboardType(value: any, pasteboardType: string): void;

	valueForPasteboardType(pasteboardType: string): any;

	valuesForPasteboardTypeInItemSet(pasteboardType: string, itemSet: NSIndexSet): NSArray<any>;
}

declare var UIPasteboardChangedNotification: string;

declare var UIPasteboardChangedTypesAddedKey: string;

declare var UIPasteboardChangedTypesRemovedKey: string;

/**
 * @since 15.0
 */
declare var UIPasteboardDetectionPatternCalendarEvent: string;

/**
 * @since 15.0
 */
declare var UIPasteboardDetectionPatternEmailAddress: string;

/**
 * @since 15.0
 */
declare var UIPasteboardDetectionPatternFlightNumber: string;

/**
 * @since 15.0
 */
declare var UIPasteboardDetectionPatternLink: string;

/**
 * @since 15.0
 */
declare var UIPasteboardDetectionPatternMoneyAmount: string;

/**
 * @since 14.0
 */
declare var UIPasteboardDetectionPatternNumber: string;

/**
 * @since 15.0
 */
declare var UIPasteboardDetectionPatternPhoneNumber: string;

/**
 * @since 15.0
 */
declare var UIPasteboardDetectionPatternPostalAddress: string;

/**
 * @since 14.0
 */
declare var UIPasteboardDetectionPatternProbableWebSearch: string;

/**
 * @since 14.0
 */
declare var UIPasteboardDetectionPatternProbableWebURL: string;

/**
 * @since 15.0
 */
declare var UIPasteboardDetectionPatternShipmentTrackingNumber: string;

/**
 * @since 3.0
 * @deprecated 10.0
 */
declare var UIPasteboardNameFind: string;

declare var UIPasteboardNameGeneral: string;

/**
 * @since 10.0
 */
declare var UIPasteboardOptionExpirationDate: string;

/**
 * @since 10.0
 */
declare var UIPasteboardOptionLocalOnly: string;

declare var UIPasteboardRemovedNotification: string;

/**
 * @since 10.0
 */
declare var UIPasteboardTypeAutomatic: string;

declare var UIPasteboardTypeListColor: NSArray<string>;

declare var UIPasteboardTypeListImage: NSArray<string>;

declare var UIPasteboardTypeListString: NSArray<string>;

declare var UIPasteboardTypeListURL: NSArray<string>;

/**
 * @since 17.5
 */
declare class UIPencilHoverPose extends NSObject {

	static alloc(): UIPencilHoverPose; // inherited from NSObject

	static new(): UIPencilHoverPose; // inherited from NSObject

	readonly altitudeAngle: number;

	readonly azimuthAngle: number;

	readonly azimuthUnitVector: CGVector;

	readonly location: CGPoint;

	readonly rollAngle: number;

	readonly zOffset: number;
}

/**
 * @since 12.1
 */
declare class UIPencilInteraction extends NSObject implements UIInteraction {

	static alloc(): UIPencilInteraction; // inherited from NSObject

	static new(): UIPencilInteraction; // inherited from NSObject

	delegate: UIPencilInteractionDelegate;

	enabled: boolean;

	/**
	 * @since 17.5
	 */
	static readonly preferredSqueezeAction: UIPencilPreferredAction;

	static readonly preferredTapAction: UIPencilPreferredAction;

	/**
	 * @since 17.5
	 */
	static readonly prefersHoverToolPreview: boolean;

	static readonly prefersPencilOnlyDrawing: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly view: UIView; // inherited from UIInteraction

	readonly  // inherited from NSObjectProtocol

	/**
	 * @since 17.5
	 */
	constructor(o: { delegate: UIPencilInteractionDelegate; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	didMoveToView(view: UIView): void;

	/**
	 * @since 17.5
	 */
	initWithDelegate(delegate: UIPencilInteractionDelegate): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	willMoveToView(view: UIView): void;
}

/**
 * @since 12.1
 */
interface UIPencilInteractionDelegate extends NSObjectProtocol {

	/**
	 * @since 17.5
	 */
	pencilInteractionDidReceiveSqueeze?(interaction: UIPencilInteraction, squeeze: UIPencilInteractionSqueeze): void;

	/**
	 * @since 17.5
	 */
	pencilInteractionDidReceiveTap?(interaction: UIPencilInteraction, tap: UIPencilInteractionTap): void;

	/**
	 * @since 12.1
	 * @deprecated 17.5
	 */
	pencilInteractionDidTap?(interaction: UIPencilInteraction): void;
}
declare var UIPencilInteractionDelegate: {

	prototype: UIPencilInteractionDelegate;
};

/**
 * @since 17.5
 */
declare const enum UIPencilInteractionPhase {

	Began = 0,

	Changed = 1,

	Ended = 2,

	Cancelled = 3
}

/**
 * @since 17.5
 */
declare class UIPencilInteractionSqueeze extends NSObject {

	static alloc(): UIPencilInteractionSqueeze; // inherited from NSObject

	static new(): UIPencilInteractionSqueeze; // inherited from NSObject

	readonly hoverPose: UIPencilHoverPose;

	readonly phase: UIPencilInteractionPhase;

	readonly timestamp: number;
}

/**
 * @since 17.5
 */
declare class UIPencilInteractionTap extends NSObject {

	static alloc(): UIPencilInteractionTap; // inherited from NSObject

	static new(): UIPencilInteractionTap; // inherited from NSObject

	readonly hoverPose: UIPencilHoverPose;

	readonly timestamp: number;
}

/**
 * @since 12.1
 */
declare const enum UIPencilPreferredAction {

	Ignore = 0,

	SwitchEraser = 1,

	SwitchPrevious = 2,

	ShowColorPalette = 3,

	ShowInkAttributes = 4,

	ShowContextualPalette = 5,

	RunSystemShortcut = 6
}

/**
 * @since 7.0
 */
declare class UIPercentDrivenInteractiveTransition extends NSObject implements UIViewControllerInteractiveTransitioning {

	static alloc(): UIPercentDrivenInteractiveTransition; // inherited from NSObject

	static new(): UIPercentDrivenInteractiveTransition; // inherited from NSObject

	completionCurve: UIViewAnimationCurve;

	completionSpeed: number;

	readonly duration: number;

	readonly percentComplete: number;

	/**
	 * @since 10.0
	 */
	timingCurve: UITimingCurveProvider;

	/**
	 * @since 10.0
	 */
	wantsInteractiveStart: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	cancelInteractiveTransition(): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	finishInteractiveTransition(): void;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	/**
	 * @since 10.0
	 */
	pauseInteractiveTransition(): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	startInteractiveTransition(transitionContext: UIViewControllerContextTransitioning): void;

	updateInteractiveTransition(percentComplete: number): void;
}

/**
 * @since 2.0
 */
declare class UIPickerView extends UIView implements NSCoding {

	static alloc(): UIPickerView; // inherited from NSObject

	static appearance(): UIPickerView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIPickerView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIPickerView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIPickerView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIPickerView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIPickerView; // inherited from UIAppearance

	static new(): UIPickerView; // inherited from NSObject

	dataSource: UIPickerViewDataSource;

	delegate: UIPickerViewDelegate;

	readonly numberOfComponents: number;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	showsSelectionIndicator: boolean;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	numberOfRowsInComponent(component: number): number;

	reloadAllComponents(): void;

	reloadComponent(component: number): void;

	rowSizeForComponent(component: number): CGSize;

	selectRowInComponentAnimated(row: number, component: number, animated: boolean): void;

	selectedRowInComponent(component: number): number;

	viewForRowForComponent(row: number, component: number): UIView;
}

interface UIPickerViewAccessibilityDelegate extends UIPickerViewDelegate {

	/**
	 * @since 11.0
	 */
	pickerViewAccessibilityAttributedHintForComponent?(pickerView: UIPickerView, component: number): NSAttributedString;

	/**
	 * @since 11.0
	 */
	pickerViewAccessibilityAttributedLabelForComponent?(pickerView: UIPickerView, component: number): NSAttributedString;

	/**
	 * @since 13.0
	 */
	pickerViewAccessibilityAttributedUserInputLabelsForComponent?(pickerView: UIPickerView, component: number): NSArray<NSAttributedString>;

	pickerViewAccessibilityHintForComponent?(pickerView: UIPickerView, component: number): string;

	pickerViewAccessibilityLabelForComponent?(pickerView: UIPickerView, component: number): string;

	/**
	 * @since 13.0
	 */
	pickerViewAccessibilityUserInputLabelsForComponent?(pickerView: UIPickerView, component: number): NSArray<string>;
}
declare var UIPickerViewAccessibilityDelegate: {

	prototype: UIPickerViewAccessibilityDelegate;
};

interface UIPickerViewDataSource extends NSObjectProtocol {

	numberOfComponentsInPickerView(pickerView: UIPickerView): number;

	pickerViewNumberOfRowsInComponent(pickerView: UIPickerView, component: number): number;
}
declare var UIPickerViewDataSource: {

	prototype: UIPickerViewDataSource;
};

interface UIPickerViewDelegate extends NSObjectProtocol {

	/**
	 * @since 6.0
	 */
	pickerViewAttributedTitleForRowForComponent?(pickerView: UIPickerView, row: number, component: number): NSAttributedString;

	pickerViewDidSelectRowInComponent?(pickerView: UIPickerView, row: number, component: number): void;

	pickerViewRowHeightForComponent?(pickerView: UIPickerView, component: number): number;

	pickerViewTitleForRowForComponent?(pickerView: UIPickerView, row: number, component: number): string;

	pickerViewViewForRowForComponentReusingView?(pickerView: UIPickerView, row: number, component: number, view: UIView): UIView;

	pickerViewWidthForComponent?(pickerView: UIPickerView, component: number): number;
}
declare var UIPickerViewDelegate: {

	prototype: UIPickerViewDelegate;
};

/**
 * @since 3.2
 */
declare class UIPinchGestureRecognizer extends UIGestureRecognizer {

	static alloc(): UIPinchGestureRecognizer; // inherited from NSObject

	static new(): UIPinchGestureRecognizer; // inherited from NSObject

	scale: number;

	readonly velocity: number;
}

/**
 * @since 15.0
 */
declare class UIPointerAccessory extends NSObject implements NSCopying {

	static accessoryWithShapePosition(shape: UIPointerShape, position: UIPointerAccessoryPosition): UIPointerAccessory;

	static alloc(): UIPointerAccessory; // inherited from NSObject

	static arrowAccessoryWithPosition(position: UIPointerAccessoryPosition): UIPointerAccessory;

	static new(): UIPointerAccessory; // inherited from NSObject

	orientationMatchesAngle: boolean;

	readonly position: UIPointerAccessoryPosition;

	readonly shape: UIPointerShape;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

interface UIPointerAccessoryPosition {
	offset: number;
	angle: number;
}
declare var UIPointerAccessoryPosition: interop.StructType<UIPointerAccessoryPosition>;

/**
 * @since 15.0
 */
declare var UIPointerAccessoryPositionBottom: UIPointerAccessoryPosition;

/**
 * @since 15.0
 */
declare var UIPointerAccessoryPositionBottomLeft: UIPointerAccessoryPosition;

/**
 * @since 15.0
 */
declare var UIPointerAccessoryPositionBottomRight: UIPointerAccessoryPosition;

/**
 * @since 15.0
 */
declare var UIPointerAccessoryPositionLeft: UIPointerAccessoryPosition;

/**
 * @since 15.0
 */
declare var UIPointerAccessoryPositionRight: UIPointerAccessoryPosition;

/**
 * @since 15.0
 */
declare var UIPointerAccessoryPositionTop: UIPointerAccessoryPosition;

/**
 * @since 15.0
 */
declare var UIPointerAccessoryPositionTopLeft: UIPointerAccessoryPosition;

/**
 * @since 15.0
 */
declare var UIPointerAccessoryPositionTopRight: UIPointerAccessoryPosition;

/**
 * @since 13.4
 */
declare class UIPointerEffect extends NSObject implements NSCopying, UIHoverEffect {

	static alloc(): UIPointerEffect; // inherited from NSObject

	static effectWithPreview(preview: UITargetedPreview): UIPointerEffect;

	static new(): UIPointerEffect; // inherited from NSObject

	readonly preview: UITargetedPreview;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

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
 * @since 13.4
 */
declare const enum UIPointerEffectTintMode {

	None = 0,

	Overlay = 1,

	Underlay = 2
}

/**
 * @since 13.4
 */
declare class UIPointerHighlightEffect extends UIPointerEffect {

	static alloc(): UIPointerHighlightEffect; // inherited from NSObject

	static effectWithPreview(preview: UITargetedPreview): UIPointerHighlightEffect; // inherited from UIPointerEffect

	static new(): UIPointerHighlightEffect; // inherited from NSObject
}

/**
 * @since 13.4
 */
declare class UIPointerHoverEffect extends UIPointerEffect {

	static alloc(): UIPointerHoverEffect; // inherited from NSObject

	static effectWithPreview(preview: UITargetedPreview): UIPointerHoverEffect; // inherited from UIPointerEffect

	static new(): UIPointerHoverEffect; // inherited from NSObject

	preferredTintMode: UIPointerEffectTintMode;

	prefersScaledContent: boolean;

	prefersShadow: boolean;
}

/**
 * @since 13.4
 */
declare class UIPointerInteraction extends NSObject implements UIInteraction {

	static alloc(): UIPointerInteraction; // inherited from NSObject

	static new(): UIPointerInteraction; // inherited from NSObject

	readonly delegate: UIPointerInteractionDelegate;

	enabled: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly view: UIView; // inherited from UIInteraction

	readonly  // inherited from NSObjectProtocol

	constructor(o: { delegate: UIPointerInteractionDelegate; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	didMoveToView(view: UIView): void;

	initWithDelegate(delegate: UIPointerInteractionDelegate): this;

	invalidate(): void;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	willMoveToView(view: UIView): void;
}

/**
 * @since 13.4
 */
interface UIPointerInteractionAnimating extends NSObjectProtocol {

	addAnimations(animations: () => void): void;

	addCompletion(completion: (p1: boolean) => void): void;
}
declare var UIPointerInteractionAnimating: {

	prototype: UIPointerInteractionAnimating;
};

/**
 * @since 13.4
 */
interface UIPointerInteractionDelegate extends NSObjectProtocol {

	pointerInteractionRegionForRequestDefaultRegion?(interaction: UIPointerInteraction, request: UIPointerRegionRequest, defaultRegion: UIPointerRegion): UIPointerRegion;

	pointerInteractionStyleForRegion?(interaction: UIPointerInteraction, region: UIPointerRegion): UIPointerStyle;

	pointerInteractionWillEnterRegionAnimator?(interaction: UIPointerInteraction, region: UIPointerRegion, animator: UIPointerInteractionAnimating): void;

	pointerInteractionWillExitRegionAnimator?(interaction: UIPointerInteraction, region: UIPointerRegion, animator: UIPointerInteractionAnimating): void;
}
declare var UIPointerInteractionDelegate: {

	prototype: UIPointerInteractionDelegate;
};

/**
 * @since 13.4
 */
declare class UIPointerLiftEffect extends UIPointerEffect {

	static alloc(): UIPointerLiftEffect; // inherited from NSObject

	static effectWithPreview(preview: UITargetedPreview): UIPointerLiftEffect; // inherited from UIPointerEffect

	static new(): UIPointerLiftEffect; // inherited from NSObject
}

/**
 * @since 14.0
 */
declare class UIPointerLockState extends NSObject {

	static alloc(): UIPointerLockState; // inherited from NSObject

	static new(): UIPointerLockState; // inherited from NSObject

	readonly locked: boolean;
}

/**
 * @since 14.0
 */
declare var UIPointerLockStateDidChangeNotification: string;

/**
 * @since 14.0
 */
declare var UIPointerLockStateSceneUserInfoKey: string;

/**
 * @since 13.4
 */
declare class UIPointerRegion extends NSObject implements NSCopying {

	static alloc(): UIPointerRegion; // inherited from NSObject

	static new(): UIPointerRegion; // inherited from NSObject

	static regionWithRectIdentifier(rect: CGRect, identifier: NSObjectProtocol): UIPointerRegion;

	readonly identifier: NSObjectProtocol;

	latchingAxes: UIAxis;

	readonly rect: CGRect;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 13.4
 */
declare class UIPointerRegionRequest extends NSObject {

	static alloc(): UIPointerRegionRequest; // inherited from NSObject

	static new(): UIPointerRegionRequest; // inherited from NSObject

	readonly location: CGPoint;

	readonly modifiers: UIKeyModifierFlags;
}

/**
 * @since 13.4
 */
declare class UIPointerShape extends NSObject implements NSCopying {

	static alloc(): UIPointerShape; // inherited from NSObject

	static beamWithPreferredLengthAxis(length: number, axis: UIAxis): UIPointerShape;

	static new(): UIPointerShape; // inherited from NSObject

	static shapeWithPath(path: UIBezierPath): UIPointerShape;

	static shapeWithRoundedRect(rect: CGRect): UIPointerShape;

	static shapeWithRoundedRectCornerRadius(rect: CGRect, cornerRadius: number): UIPointerShape;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 13.4
 */
declare class UIPointerStyle extends UIHoverStyle implements NSCopying {

	static alloc(): UIPointerStyle; // inherited from NSObject

	static automaticStyle(): UIPointerStyle; // inherited from UIHoverStyle

	static hiddenPointerStyle(): UIPointerStyle;

	static new(): UIPointerStyle; // inherited from NSObject

	static styleWithEffectShape(effect: UIHoverEffect, shape: UIShape): UIPointerStyle; // inherited from UIHoverStyle

	static styleWithShape(shape: UIShape): UIPointerStyle; // inherited from UIHoverStyle

	static styleWithShapeConstrainedAxes(shape: UIPointerShape, axes: UIAxis): UIPointerStyle;

	/**
	 * @since 15.0
	 */
	static systemPointerStyle(): UIPointerStyle;

	/**
	 * @since 15.0
	 */
	accessories: NSArray<UIPointerAccessory>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare const enum UIPopoverArrowDirection {

	Up = 1,

	Down = 2,

	Left = 4,

	Right = 8,

	Any = 15,

	Unknown = -1
}

/**
 * @since 5.0
 */
declare class UIPopoverBackgroundView extends UIView implements UIPopoverBackgroundViewMethods {

	static alloc(): UIPopoverBackgroundView; // inherited from NSObject

	static appearance(): UIPopoverBackgroundView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIPopoverBackgroundView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIPopoverBackgroundView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIPopoverBackgroundView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIPopoverBackgroundView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIPopoverBackgroundView; // inherited from UIAppearance

	static arrowBase(): number;

	static arrowHeight(): number;

	static contentViewInsets(): UIEdgeInsets;

	static new(): UIPopoverBackgroundView; // inherited from NSObject

	arrowDirection: UIPopoverArrowDirection;

	arrowOffset: number;

	/**
	 * @since 6.0
	 * @deprecated 13.0
	 */
	static readonly wantsDefaultContentAppearance: boolean;
}

interface UIPopoverBackgroundViewMethods {
}
declare var UIPopoverBackgroundViewMethods: {

	prototype: UIPopoverBackgroundViewMethods;

	arrowBase(): number;

	arrowHeight(): number;

	contentViewInsets(): UIEdgeInsets;
};

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare class UIPopoverController extends NSObject implements UIAppearanceContainer {

	static alloc(): UIPopoverController; // inherited from NSObject

	static new(): UIPopoverController; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	backgroundColor: UIColor;

	contentViewController: UIViewController;

	delegate: UIPopoverControllerDelegate;

	passthroughViews: NSArray<UIView>;

	readonly popoverArrowDirection: UIPopoverArrowDirection;

	/**
	 * @since 5.0
	 */
	popoverBackgroundViewClass: typeof NSObject;

	popoverContentSize: CGSize;

	/**
	 * @since 5.0
	 */
	popoverLayoutMargins: UIEdgeInsets;

	readonly popoverVisible: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { contentViewController: UIViewController; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	dismissPopoverAnimated(animated: boolean): void;

	initWithContentViewController(viewController: UIViewController): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	presentPopoverFromBarButtonItemPermittedArrowDirectionsAnimated(item: UIBarButtonItem, arrowDirections: UIPopoverArrowDirection, animated: boolean): void;

	presentPopoverFromRectInViewPermittedArrowDirectionsAnimated(rect: CGRect, view: UIView, arrowDirections: UIPopoverArrowDirection, animated: boolean): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	setContentViewControllerAnimated(viewController: UIViewController, animated: boolean): void;

	setPopoverContentSizeAnimated(size: CGSize, animated: boolean): void;
}

interface UIPopoverControllerDelegate extends NSObjectProtocol {

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	popoverControllerDidDismissPopover?(popoverController: UIPopoverController): void;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	popoverControllerShouldDismissPopover?(popoverController: UIPopoverController): boolean;

	/**
	 * @since 7.0
	 * @deprecated 9.0
	 */
	popoverControllerWillRepositionPopoverToRectInView?(popoverController: UIPopoverController, rect: interop.Pointer | interop.Reference<CGRect>, view: interop.Pointer | interop.Reference<UIView>): void;
}
declare var UIPopoverControllerDelegate: {

	prototype: UIPopoverControllerDelegate;
};

/**
 * @since 8.0
 */
declare class UIPopoverPresentationController extends UIPresentationController {

	static alloc(): UIPopoverPresentationController; // inherited from NSObject

	static new(): UIPopoverPresentationController; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	readonly adaptiveSheetPresentationController: UISheetPresentationController;

	readonly arrowDirection: UIPopoverArrowDirection;

	backgroundColor: UIColor;

	/**
	 * @since 8.0
	 * @deprecated 100000
	 */
	barButtonItem: UIBarButtonItem;

	/**
	 * @since 9.0
	 */
	canOverlapSourceViewRect: boolean;

	delegate: UIPopoverPresentationControllerDelegate;

	passthroughViews: NSArray<UIView>;

	permittedArrowDirections: UIPopoverArrowDirection;

	popoverBackgroundViewClass: typeof NSObject;

	popoverLayoutMargins: UIEdgeInsets;

	/**
	 * @since 16.0
	 */
	sourceItem: UIPopoverPresentationControllerSourceItem;

	sourceRect: CGRect;

	sourceView: UIView;
}

interface UIPopoverPresentationControllerDelegate extends UIAdaptivePresentationControllerDelegate {

	/**
	 * @since 8.0
	 * @deprecated 13.0
	 */
	popoverPresentationControllerDidDismissPopover?(popoverPresentationController: UIPopoverPresentationController): void;

	/**
	 * @since 8.0
	 * @deprecated 13.0
	 */
	popoverPresentationControllerShouldDismissPopover?(popoverPresentationController: UIPopoverPresentationController): boolean;

	popoverPresentationControllerWillRepositionPopoverToRectInView?(popoverPresentationController: UIPopoverPresentationController, rect: interop.Pointer | interop.Reference<CGRect>, view: interop.Pointer | interop.Reference<UIView>): void;

	prepareForPopoverPresentation?(popoverPresentationController: UIPopoverPresentationController): void;
}
declare var UIPopoverPresentationControllerDelegate: {

	prototype: UIPopoverPresentationControllerDelegate;
};

/**
 * @since 16.0
 */
interface UIPopoverPresentationControllerSourceItem extends NSObjectProtocol {

	/**
	 * @since 17.0
	 */
	frameInView(referenceView: UIView): CGRect;
}
declare var UIPopoverPresentationControllerSourceItem: {

	prototype: UIPopoverPresentationControllerSourceItem;
};

declare const enum UIPreferredPresentationStyle {

	Unspecified = 0,

	Inline = 1,

	Attachment = 2
}

/**
 * @since 8.0
 */
declare class UIPresentationController extends NSObject implements UIAppearanceContainer, UIContentContainer, UIFocusEnvironment, UITraitChangeObservable, UITraitEnvironment {

	static alloc(): UIPresentationController; // inherited from NSObject

	static new(): UIPresentationController; // inherited from NSObject

	readonly adaptivePresentationStyle: UIModalPresentationStyle;

	readonly containerView: UIView;

	delegate: UIAdaptivePresentationControllerDelegate;

	readonly frameOfPresentedViewInContainerView: CGRect;

	/**
	 * @since 8.0
	 * @deprecated 17.0
	 */
	overrideTraitCollection: UITraitCollection;

	readonly presentationStyle: UIModalPresentationStyle;

	readonly presentedView: UIView;

	readonly presentedViewController: UIViewController;

	readonly presentingViewController: UIViewController;

	readonly shouldPresentInFullscreen: boolean;

	readonly shouldRemovePresentersView: boolean;

	readonly traitOverrides: UITraitOverrides;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	/**
	 * @since 14.0
	 */
	readonly focusGroupIdentifier: string; // inherited from UIFocusEnvironment

	/**
	 * @since 12.0
	 */
	readonly focusItemContainer: UIFocusItemContainer; // inherited from UIFocusEnvironment

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	/**
	 * @since 12.0
	 */
	readonly parentFocusEnvironment: UIFocusEnvironment; // inherited from UIFocusEnvironment

	/**
	 * @since 8.0
	 */
	readonly preferredContentSize: CGSize; // inherited from UIContentContainer

	readonly preferredFocusEnvironments: NSArray<UIFocusEnvironment>; // inherited from UIFocusEnvironment

	/**
	 * @since 9.0
	 * @deprecated 10.0
	 */
	readonly preferredFocusedView: UIView; // inherited from UIFocusEnvironment

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	/**
	 * @since 8.0
	 */
	readonly traitCollection: UITraitCollection; // inherited from UITraitEnvironment

	readonly  // inherited from NSObjectProtocol

	constructor(o: { presentedViewController: UIViewController; presentingViewController: UIViewController; });

	/**
	 * @since 8.3
	 */
	adaptivePresentationStyleForTraitCollection(traitCollection: UITraitCollection): UIModalPresentationStyle;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	containerViewDidLayoutSubviews(): void;

	containerViewWillLayoutSubviews(): void;

	didUpdateFocusInContextWithAnimationCoordinator(context: UIFocusUpdateContext, coordinator: UIFocusAnimationCoordinator): void;

	dismissalTransitionDidEnd(completed: boolean): void;

	dismissalTransitionWillBegin(): void;

	initWithPresentedViewControllerPresentingViewController(presentedViewController: UIViewController, presentingViewController: UIViewController): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	/**
	 * @since 8.0
	 */
	preferredContentSizeDidChangeForChildContentContainer(container: UIContentContainer): void;

	presentationTransitionDidEnd(completed: boolean): void;

	presentationTransitionWillBegin(): void;

	registerForTraitChangesWithAction(traits: NSArray<typeof NSObject> | typeof NSObject[], action: string): UITraitChangeRegistration;

	registerForTraitChangesWithHandler(traits: NSArray<typeof NSObject> | typeof NSObject[], handler: (p1: UITraitEnvironment, p2: UITraitCollection) => void): UITraitChangeRegistration;

	registerForTraitChangesWithTargetAction(traits: NSArray<typeof NSObject> | typeof NSObject[], target: any, action: string): UITraitChangeRegistration;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	setNeedsFocusUpdate(): void;

	shouldUpdateFocusInContext(context: UIFocusUpdateContext): boolean;

	/**
	 * @since 8.0
	 */
	sizeForChildContentContainerWithParentContainerSize(container: UIContentContainer, parentSize: CGSize): CGSize;

	/**
	 * @since 8.0
	 */
	systemLayoutFittingSizeDidChangeForChildContentContainer(container: UIContentContainer): void;

	/**
	 * @since 8.0
	 * @deprecated 17.0
	 */
	traitCollectionDidChange(previousTraitCollection: UITraitCollection): void;

	unregisterForTraitChanges(registration: UITraitChangeRegistration): void;

	updateFocusIfNeeded(): void;

	/**
	 * @since 8.0
	 */
	viewWillTransitionToSizeWithTransitionCoordinator(size: CGSize, coordinator: UIViewControllerTransitionCoordinator): void;

	/**
	 * @since 8.0
	 */
	willTransitionToTraitCollectionWithTransitionCoordinator(newCollection: UITraitCollection, coordinator: UIViewControllerTransitionCoordinator): void;
}

/**
 * @since 9.0
 */
declare class UIPress extends NSObject {

	static alloc(): UIPress; // inherited from NSObject

	static new(): UIPress; // inherited from NSObject

	readonly force: number;

	readonly gestureRecognizers: NSArray<UIGestureRecognizer>;

	readonly key: UIKey;

	readonly phase: UIPressPhase;

	readonly responder: UIResponder;

	readonly timestamp: number;

	readonly type: UIPressType;

	readonly window: UIWindow;
}

/**
 * @since 9.0
 */
declare const enum UIPressPhase {

	Began = 0,

	Changed = 1,

	Stationary = 2,

	Ended = 3,

	Cancelled = 4
}

/**
 * @since 9.0
 */
declare const enum UIPressType {

	UpArrow = 0,

	DownArrow = 1,

	LeftArrow = 2,

	RightArrow = 3,

	Select = 4,

	Menu = 5,

	PlayPause = 6,

	PageUp = 30,

	PageDown = 31
}

/**
 * @since 9.0
 */
declare class UIPressesEvent extends _UIEvent {

	static alloc(): UIPressesEvent; // inherited from NSObject

	static new(): UIPressesEvent; // inherited from NSObject

	readonly allPresses: NSSet<UIPress>;

	pressesForGestureRecognizer(gesture: UIGestureRecognizer): NSSet<UIPress>;
}

/**
 * @since 9.0
 * @deprecated 13.0
 */
declare class UIPreviewAction extends NSObject implements NSCopying, UIPreviewActionItem {

	static actionWithTitleStyleHandler(title: string, style: UIPreviewActionStyle, handler: (p1: UIPreviewAction, p2: UIViewController) => void): UIPreviewAction;

	static alloc(): UIPreviewAction; // inherited from NSObject

	static new(): UIPreviewAction; // inherited from NSObject

	readonly handler: (p1: UIPreviewActionItem, p2: UIViewController) => void;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly title: string; // inherited from UIPreviewActionItem

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

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
 * @since 9.0
 * @deprecated 13.0
 */
declare class UIPreviewActionGroup extends NSObject implements NSCopying, UIPreviewActionItem {

	static actionGroupWithTitleStyleActions(title: string, style: UIPreviewActionStyle, actions: NSArray<UIPreviewAction> | UIPreviewAction[]): UIPreviewActionGroup;

	static alloc(): UIPreviewActionGroup; // inherited from NSObject

	static new(): UIPreviewActionGroup; // inherited from NSObject

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly title: string; // inherited from UIPreviewActionItem

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

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
 * @since 9.0
 */
interface UIPreviewActionItem extends NSObjectProtocol {

	title: string;
}
declare var UIPreviewActionItem: {

	prototype: UIPreviewActionItem;
};

/**
 * @since 9.0
 * @deprecated 17.1
 */
declare const enum UIPreviewActionStyle {

	Default = 0,

	Selected = 1,

	Destructive = 2
}

/**
 * @since 10.0
 */
declare class UIPreviewInteraction extends NSObject {

	static alloc(): UIPreviewInteraction; // inherited from NSObject

	static new(): UIPreviewInteraction; // inherited from NSObject

	delegate: UIPreviewInteractionDelegate;

	readonly view: UIView;

	constructor(o: { view: UIView; });

	cancelInteraction(): void;

	initWithView(view: UIView): this;

	locationInCoordinateSpace(coordinateSpace: UICoordinateSpace): CGPoint;
}

interface UIPreviewInteractionDelegate extends NSObjectProtocol {

	/**
	 * @since 10.0
	 */
	previewInteractionDidCancel(previewInteraction: UIPreviewInteraction): void;

	/**
	 * @since 10.0
	 */
	previewInteractionDidUpdateCommitTransitionEnded?(previewInteraction: UIPreviewInteraction, transitionProgress: number, ended: boolean): void;

	/**
	 * @since 10.0
	 */
	previewInteractionDidUpdatePreviewTransitionEnded(previewInteraction: UIPreviewInteraction, transitionProgress: number, ended: boolean): void;

	/**
	 * @since 10.0
	 */
	previewInteractionShouldBegin?(previewInteraction: UIPreviewInteraction): boolean;
}
declare var UIPreviewInteractionDelegate: {

	prototype: UIPreviewInteractionDelegate;
};

/**
 * @since 13.0
 */
declare class UIPreviewParameters extends NSObject implements NSCopying {

	static alloc(): UIPreviewParameters; // inherited from NSObject

	static new(): UIPreviewParameters; // inherited from NSObject

	backgroundColor: UIColor;

	/**
	 * @since 14.0
	 */
	shadowPath: UIBezierPath;

	visiblePath: UIBezierPath;

	constructor(o: { textLineRects: NSArray<NSValue> | NSValue[]; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithTextLineRects(textLineRects: NSArray<NSValue> | NSValue[]): this;
}

/**
 * @since 13.0
 */
declare class UIPreviewTarget extends NSObject implements NSCopying {

	static alloc(): UIPreviewTarget; // inherited from NSObject

	static new(): UIPreviewTarget; // inherited from NSObject

	readonly center: CGPoint;

	readonly container: UIView;

	readonly transform: CGAffineTransform;

	constructor(o: { container: UIView; center: CGPoint; });

	constructor(o: { container: UIView; center: CGPoint; transform: CGAffineTransform; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithContainerCenter(container: UIView, center: CGPoint): this;

	initWithContainerCenterTransform(container: UIView, center: CGPoint, transform: CGAffineTransform): this;
}

/**
 * @since 4.2
 */
declare const enum UIPrintErrorCode {

	PrintingNotAvailableError = 1,

	PrintNoContentError = 2,

	PrintUnknownImageFormatError = 3,

	PrintJobFailedError = 4
}

/**
 * @since 4.2
 */
declare var UIPrintErrorDomain: string;

/**
 * @since 4.2
 */
declare class UIPrintFormatter extends NSObject implements NSCopying {

	static alloc(): UIPrintFormatter; // inherited from NSObject

	static new(): UIPrintFormatter; // inherited from NSObject

	/**
	 * @since 4.2
	 * @deprecated 10.0
	 */
	contentInsets: UIEdgeInsets;

	maximumContentHeight: number;

	maximumContentWidth: number;

	readonly pageCount: number;

	perPageContentInsets: UIEdgeInsets;

	readonly printPageRenderer: UIPrintPageRenderer;

	/**
	 * @since 16
	 */
	readonly requiresMainThread: boolean;

	startPage: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	drawInRectForPageAtIndex(rect: CGRect, pageIndex: number): void;

	rectForPageAtIndex(pageIndex: number): CGRect;

	removeFromPrintPageRenderer(): void;
}

/**
 * @since 4.2
 */
declare class UIPrintInfo extends NSObject implements NSCoding, NSCopying {

	static alloc(): UIPrintInfo; // inherited from NSObject

	static new(): UIPrintInfo; // inherited from NSObject

	static printInfo(): UIPrintInfo;

	static printInfoWithDictionary(dictionary: NSDictionary<any, any>): UIPrintInfo;

	readonly dictionaryRepresentation: NSDictionary<any, any>;

	duplex: UIPrintInfoDuplex;

	jobName: string;

	orientation: UIPrintInfoOrientation;

	outputType: UIPrintInfoOutputType;

	printerID: string;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 4.2
 */
declare const enum UIPrintInfoDuplex {

	None = 0,

	LongEdge = 1,

	ShortEdge = 2
}

/**
 * @since 4.2
 */
declare const enum UIPrintInfoOrientation {

	Portrait = 0,

	Landscape = 1
}

/**
 * @since 4.2
 */
declare const enum UIPrintInfoOutputType {

	General = 0,

	Photo = 1,

	Grayscale = 2,

	PhotoGrayscale = 3
}

/**
 * @since 4.2
 */
declare class UIPrintInteractionController extends NSObject {

	static alloc(): UIPrintInteractionController; // inherited from NSObject

	static canPrintData(data: NSData): boolean;

	static canPrintURL(url: NSURL): boolean;

	static new(): UIPrintInteractionController; // inherited from NSObject

	delegate: UIPrintInteractionControllerDelegate;

	printFormatter: UIPrintFormatter;

	printInfo: UIPrintInfo;

	printPageRenderer: UIPrintPageRenderer;

	readonly printPaper: UIPrintPaper;

	printingItem: any;

	printingItems: NSArray<any>;

	/**
	 * @since 7.0
	 */
	showsNumberOfCopies: boolean;

	/**
	 * @since 4.2
	 * @deprecated 10.0
	 */
	showsPageRange: boolean;

	/**
	 * @since 15.0
	 */
	showsPaperOrientation: boolean;

	/**
	 * @since 8.0
	 */
	showsPaperSelectionForLoadedPapers: boolean;

	static readonly printableUTIs: NSSet<string>;

	static readonly printingAvailable: boolean;

	static readonly sharedPrintController: UIPrintInteractionController;

	dismissAnimated(animated: boolean): void;

	presentAnimatedCompletionHandler(animated: boolean, completion: (p1: UIPrintInteractionController, p2: boolean, p3: NSError) => void): boolean;

	presentFromBarButtonItemAnimatedCompletionHandler(item: UIBarButtonItem, animated: boolean, completion: (p1: UIPrintInteractionController, p2: boolean, p3: NSError) => void): boolean;

	presentFromRectInViewAnimatedCompletionHandler(rect: CGRect, view: UIView, animated: boolean, completion: (p1: UIPrintInteractionController, p2: boolean, p3: NSError) => void): boolean;

	printToPrinterCompletionHandler(printer: UIPrinter, completion: (p1: UIPrintInteractionController, p2: boolean, p3: NSError) => void): boolean;
}

/**
 * @since 4.2
 */
interface UIPrintInteractionControllerDelegate extends NSObjectProtocol {

	/**
	 * @since 9.0
	 */
	printInteractionControllerChooseCutterBehavior?(printInteractionController: UIPrintInteractionController, availableBehaviors: NSArray<any> | any[]): UIPrinterCutterBehavior;

	printInteractionControllerChoosePaper?(printInteractionController: UIPrintInteractionController, paperList: NSArray<UIPrintPaper> | UIPrintPaper[]): UIPrintPaper;

	/**
	 * @since 7.0
	 */
	printInteractionControllerCutLengthForPaper?(printInteractionController: UIPrintInteractionController, paper: UIPrintPaper): number;

	printInteractionControllerDidDismissPrinterOptions?(printInteractionController: UIPrintInteractionController): void;

	printInteractionControllerDidFinishJob?(printInteractionController: UIPrintInteractionController): void;

	printInteractionControllerDidPresentPrinterOptions?(printInteractionController: UIPrintInteractionController): void;

	printInteractionControllerParentViewController?(printInteractionController: UIPrintInteractionController): UIViewController;

	printInteractionControllerWillDismissPrinterOptions?(printInteractionController: UIPrintInteractionController): void;

	printInteractionControllerWillPresentPrinterOptions?(printInteractionController: UIPrintInteractionController): void;

	printInteractionControllerWillStartJob?(printInteractionController: UIPrintInteractionController): void;
}
declare var UIPrintInteractionControllerDelegate: {

	prototype: UIPrintInteractionControllerDelegate;
};

/**
 * @since 4.2
 */
declare class UIPrintPageRenderer extends NSObject {

	static alloc(): UIPrintPageRenderer; // inherited from NSObject

	static new(): UIPrintPageRenderer; // inherited from NSObject

	footerHeight: number;

	headerHeight: number;

	readonly numberOfPages: number;

	readonly paperRect: CGRect;

	printFormatters: NSArray<UIPrintFormatter>;

	readonly printableRect: CGRect;

	addPrintFormatterStartingAtPageAtIndex(formatter: UIPrintFormatter, pageIndex: number): void;

	/**
	 * @since 14.5
	 */
	currentRenderingQualityForRequestedRenderingQuality(requestedRenderingQuality: UIPrintRenderingQuality): UIPrintRenderingQuality;

	drawContentForPageAtIndexInRect(pageIndex: number, contentRect: CGRect): void;

	drawFooterForPageAtIndexInRect(pageIndex: number, footerRect: CGRect): void;

	drawHeaderForPageAtIndexInRect(pageIndex: number, headerRect: CGRect): void;

	drawPageAtIndexInRect(pageIndex: number, printableRect: CGRect): void;

	drawPrintFormatterForPageAtIndex(printFormatter: UIPrintFormatter, pageIndex: number): void;

	prepareForDrawingPages(range: NSRange): void;

	printFormattersForPageAtIndex(pageIndex: number): NSArray<UIPrintFormatter>;
}

/**
 * @since 4.2
 */
declare class UIPrintPaper extends NSObject {

	static alloc(): UIPrintPaper; // inherited from NSObject

	static bestPaperForPageSizeWithPapersFromArray(contentSize: CGSize, paperList: NSArray<UIPrintPaper> | UIPrintPaper[]): UIPrintPaper;

	static new(): UIPrintPaper; // inherited from NSObject

	readonly paperSize: CGSize;

	readonly printableRect: CGRect;

	printRect(): CGRect;
}

/**
 * @since 14.5
 */
declare const enum UIPrintRenderingQuality {

	Best = 0,

	Responsive = 1
}

/**
 * @since 14.5
 */
declare class UIPrintServiceExtension extends NSObject {

	static alloc(): UIPrintServiceExtension; // inherited from NSObject

	static new(): UIPrintServiceExtension; // inherited from NSObject

	printerDestinationsForPrintInfo(printInfo: UIPrintInfo): NSArray<UIPrinterDestination>;
}

/**
 * @since 8.0
 */
declare class UIPrinter extends NSObject {

	static alloc(): UIPrinter; // inherited from NSObject

	static new(): UIPrinter; // inherited from NSObject

	static printerWithURL(url: NSURL): UIPrinter;

	readonly URL: NSURL;

	readonly displayLocation: string;

	readonly displayName: string;

	readonly makeAndModel: string;

	readonly supportedJobTypes: UIPrinterJobTypes;

	readonly supportsColor: boolean;

	readonly supportsDuplex: boolean;

	contactPrinter(completionHandler: (p1: boolean) => void): void;
}

/**
 * @since 9.0
 */
declare const enum UIPrinterCutterBehavior {

	NoCut = 0,

	PrinterDefault = 1,

	CutAfterEachPage = 2,

	CutAfterEachCopy = 3,

	CutAfterEachJob = 4
}

/**
 * @since 14.5
 */
declare class UIPrinterDestination extends NSObject implements NSSecureCoding {

	static alloc(): UIPrinterDestination; // inherited from NSObject

	static new(): UIPrinterDestination; // inherited from NSObject

	URL: NSURL;

	displayName: string;

	txtRecord: NSData;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { URL: NSURL; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithURL(url: NSURL): this;
}

/**
 * @since 8.0
 */
declare const enum UIPrinterJobTypes {

	Unknown = 0,

	Document = 1,

	Envelope = 2,

	Label = 4,

	Photo = 8,

	Receipt = 16,

	Roll = 32,

	LargeFormat = 64,

	Postcard = 128
}

/**
 * @since 8.0
 */
declare class UIPrinterPickerController extends NSObject {

	static alloc(): UIPrinterPickerController; // inherited from NSObject

	static new(): UIPrinterPickerController; // inherited from NSObject

	static printerPickerControllerWithInitiallySelectedPrinter(printer: UIPrinter): UIPrinterPickerController;

	delegate: UIPrinterPickerControllerDelegate;

	readonly selectedPrinter: UIPrinter;

	dismissAnimated(animated: boolean): void;

	presentAnimatedCompletionHandler(animated: boolean, completion: (p1: UIPrinterPickerController, p2: boolean, p3: NSError) => void): boolean;

	presentFromBarButtonItemAnimatedCompletionHandler(item: UIBarButtonItem, animated: boolean, completion: (p1: UIPrinterPickerController, p2: boolean, p3: NSError) => void): boolean;

	presentFromRectInViewAnimatedCompletionHandler(rect: CGRect, view: UIView, animated: boolean, completion: (p1: UIPrinterPickerController, p2: boolean, p3: NSError) => void): boolean;
}

/**
 * @since 8.0
 */
interface UIPrinterPickerControllerDelegate extends NSObjectProtocol {

	printerPickerControllerDidDismiss?(printerPickerController: UIPrinterPickerController): void;

	printerPickerControllerDidPresent?(printerPickerController: UIPrinterPickerController): void;

	printerPickerControllerDidSelectPrinter?(printerPickerController: UIPrinterPickerController): void;

	printerPickerControllerParentViewController?(printerPickerController: UIPrinterPickerController): UIViewController;

	printerPickerControllerShouldShowPrinter?(printerPickerController: UIPrinterPickerController, printer: UIPrinter): boolean;

	printerPickerControllerWillDismiss?(printerPickerController: UIPrinterPickerController): void;

	printerPickerControllerWillPresent?(printerPickerController: UIPrinterPickerController): void;
}
declare var UIPrinterPickerControllerDelegate: {

	prototype: UIPrinterPickerControllerDelegate;
};

/**
 * @since 2.0
 */
declare class UIProgressView extends UIView implements NSCoding {

	static alloc(): UIProgressView; // inherited from NSObject

	static appearance(): UIProgressView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIProgressView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIProgressView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIProgressView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIProgressView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIProgressView; // inherited from UIAppearance

	static new(): UIProgressView; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	observedProgress: NSProgress;

	progress: number;

	/**
	 * @since 5.0
	 */
	progressImage: UIImage;

	/**
	 * @since 5.0
	 */
	progressTintColor: UIColor;

	progressViewStyle: UIProgressViewStyle;

	/**
	 * @since 5.0
	 */
	trackImage: UIImage;

	/**
	 * @since 5.0
	 */
	trackTintColor: UIColor;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { progressViewStyle: UIProgressViewStyle; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithProgressViewStyle(style: UIProgressViewStyle): this;

	/**
	 * @since 5.0
	 */
	setProgressAnimated(progress: number, animated: boolean): void;
}

declare const enum UIProgressViewStyle {

	Default = 0,

	Bar = 1
}

/**
 * @since 7.0
 */
declare class UIPushBehavior extends UIDynamicBehavior {

	static alloc(): UIPushBehavior; // inherited from NSObject

	static new(): UIPushBehavior; // inherited from NSObject

	active: boolean;

	angle: number;

	readonly items: NSArray<UIDynamicItem>;

	magnitude: number;

	readonly mode: UIPushBehaviorMode;

	pushDirection: CGVector;

	constructor(o: { items: NSArray<UIDynamicItem> | UIDynamicItem[]; mode: UIPushBehaviorMode; });

	addItem(item: UIDynamicItem): void;

	initWithItemsMode(items: NSArray<UIDynamicItem> | UIDynamicItem[], mode: UIPushBehaviorMode): this;

	removeItem(item: UIDynamicItem): void;

	setAngleMagnitude(angle: number, magnitude: number): void;

	setTargetOffsetFromCenterForItem(o: UIOffset, item: UIDynamicItem): void;

	targetOffsetFromCenterForItem(item: UIDynamicItem): UIOffset;
}

/**
 * @since 7.0
 */
declare const enum UIPushBehaviorMode {

	Continuous = 0,

	Instantaneous = 1
}

declare function UIRectClip(rect: CGRect): void;

declare const enum UIRectCorner {

	TopLeft = 1,

	TopRight = 2,

	BottomLeft = 4,

	BottomRight = 8,

	AllCorners = -1
}

/**
 * @since 7.0
 */
declare const enum UIRectEdge {

	None = 0,

	Top = 1,

	Left = 2,

	Bottom = 4,

	Right = 8,

	All = 15
}

declare function UIRectFill(rect: CGRect): void;

declare function UIRectFillUsingBlendMode(rect: CGRect, blendMode: CGBlendMode): void;

declare function UIRectFrame(rect: CGRect): void;

declare function UIRectFrameUsingBlendMode(rect: CGRect, blendMode: CGBlendMode): void;

/**
 * @since 5.0
 */
declare class UIReferenceLibraryViewController extends UIViewController {

	static alloc(): UIReferenceLibraryViewController; // inherited from NSObject

	static dictionaryHasDefinitionForTerm(term: string): boolean;

	static new(): UIReferenceLibraryViewController; // inherited from NSObject

	constructor(o: { term: string; });

	initWithTerm(term: string): this;
}

/**
 * @since 6.0
 */
declare class UIRefreshControl extends UIControl {

	static alloc(): UIRefreshControl; // inherited from NSObject

	static appearance(): UIRefreshControl; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIRefreshControl; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIRefreshControl; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIRefreshControl; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIRefreshControl; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIRefreshControl; // inherited from UIAppearance

	static new(): UIRefreshControl; // inherited from NSObject

	attributedTitle: NSAttributedString;

	readonly refreshing: boolean;

	/**
	 * @since 6.0
	 */
	beginRefreshing(): void;

	/**
	 * @since 6.0
	 */
	endRefreshing(): void;
}

/**
 * @since 9.0
 */
declare class UIRegion extends NSObject implements NSCoding, NSCopying {

	static alloc(): UIRegion; // inherited from NSObject

	static new(): UIRegion; // inherited from NSObject

	static readonly infiniteRegion: UIRegion;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { radius: number; });

	constructor(o: { size: CGSize; });

	containsPoint(point: CGPoint): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithRadius(radius: number): this;

	initWithSize(size: CGSize): this;

	inverseRegion(): this;

	regionByDifferenceFromRegion(region: UIRegion): this;

	regionByIntersectionWithRegion(region: UIRegion): this;

	regionByUnionWithRegion(region: UIRegion): this;
}

/**
 * @since 3.0
 * @deprecated 8.0
 */
declare const enum UIRemoteNotificationType {

	None = 0,

	Badge = 1,

	Sound = 2,

	Alert = 4,

	NewsstandContentAvailability = 8
}

/**
 * @since 17.0
 */
declare class UIResolvedShape extends NSObject implements NSCopying {

	static alloc(): UIResolvedShape; // inherited from NSObject

	static new(): UIResolvedShape; // inherited from NSObject

	readonly boundingRect: CGRect;

	readonly path: UIBezierPath;

	readonly shape: UIShape;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	shapeByApplyingInset(inset: number): UIResolvedShape;

	shapeByApplyingInsets(insets: UIEdgeInsets): UIResolvedShape;
}

/**
 * @since 2.0
 */
declare class UIResponder extends NSObject implements UIActivityItemsConfigurationProviding, UIPasteConfigurationSupporting, UIResponderStandardEditActions, UIUserActivityRestoring {

	static alloc(): UIResponder; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	static clearTextInputContextIdentifier(identifier: string): void;

	static new(): UIResponder; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	activityItemsConfiguration: UIActivityItemsConfigurationReading;

	readonly canBecomeFirstResponder: boolean;

	readonly canResignFirstResponder: boolean;

	/**
	 * @since 13.0
	 */
	readonly editingInteractionConfiguration: UIEditingInteractionConfiguration;

	/**
	 * @since 3.2
	 */
	readonly inputAccessoryView: UIView;

	/**
	 * @since 8.0
	 */
	readonly inputAccessoryViewController: UIInputViewController;

	/**
	 * @since 9.0
	 */
	readonly inputAssistantItem: UITextInputAssistantItem;

	/**
	 * @since 3.2
	 */
	readonly inputView: UIView;

	/**
	 * @since 8.0
	 */
	readonly inputViewController: UIInputViewController;

	readonly isFirstResponder: boolean;

	/**
	 * @since 7.0
	 */
	readonly keyCommands: NSArray<UIKeyCommand>;

	readonly nextResponder: UIResponder;

	/**
	 * @since 7.0
	 */
	readonly textInputContextIdentifier: string;

	/**
	 * @since 7.0
	 */
	readonly textInputMode: UITextInputMode;

	/**
	 * @since 3.0
	 */
	readonly undoManager: NSUndoManager;

	/**
	 * @since 8.0
	 */
	userActivity: NSUserActivity;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	pasteConfiguration: UIPasteConfiguration; // inherited from UIPasteConfigurationSupporting

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	becomeFirstResponder(): boolean;

	/**
	 * @since 13.0
	 */
	buildMenuWithBuilder(builder: UIMenuBuilder): void;

	canPasteItemProviders(itemProviders: NSArray<NSItemProvider> | NSItemProvider[]): boolean;

	/**
	 * @since 3.0
	 */
	canPerformActionWithSender(action: string, sender: any): boolean;

	/**
	 * @since 15.0
	 */
	captureTextFromCamera(sender: any): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 3.0
	 */
	cut(sender: any): void;

	/**
	 * @since 7.0
	 */
	decreaseSize(sender: any): void;

	/**
	 * @since 3.2
	 */
	delete(sender: any): void;

	/**
	 * @since 16.0
	 */
	duplicate(sender: any): void;

	/**
	 * @since 16.0
	 */
	export(sender: any): void;

	/**
	 * @since 16.0
	 */
	find(sender: any): void;

	/**
	 * @since 16.0
	 */
	findAndReplace(sender: any): void;

	/**
	 * @since 16.0
	 */
	findNext(sender: any): void;

	/**
	 * @since 16.0
	 */
	findPrevious(sender: any): void;

	/**
	 * @since 7.0
	 */
	increaseSize(sender: any): void;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	/**
	 * @since 5.0
	 */
	makeTextWritingDirectionLeftToRight(sender: any): void;

	/**
	 * @since 5.0
	 */
	makeTextWritingDirectionRightToLeft(sender: any): void;

	/**
	 * @since 3.0
	 */
	motionBeganWithEvent(motion: UIEventSubtype, event: _UIEvent): void;

	/**
	 * @since 3.0
	 */
	motionCancelledWithEvent(motion: UIEventSubtype, event: _UIEvent): void;

	/**
	 * @since 3.0
	 */
	motionEndedWithEvent(motion: UIEventSubtype, event: _UIEvent): void;

	/**
	 * @since 16.0
	 */
	move(sender: any): void;

	/**
	 * @since 3.0
	 */
	paste(sender: any): void;

	/**
	 * @since 15.0
	 */
	pasteAndGo(sender: any): void;

	/**
	 * @since 15.0
	 */
	pasteAndMatchStyle(sender: any): void;

	/**
	 * @since 15.0
	 */
	pasteAndSearch(sender: any): void;

	pasteItemProviders(itemProviders: NSArray<NSItemProvider> | NSItemProvider[]): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	/**
	 * @since 9.0
	 */
	pressesBeganWithEvent(presses: NSSet<UIPress>, event: UIPressesEvent): void;

	/**
	 * @since 9.0
	 */
	pressesCancelledWithEvent(presses: NSSet<UIPress>, event: UIPressesEvent): void;

	/**
	 * @since 9.0
	 */
	pressesChangedWithEvent(presses: NSSet<UIPress>, event: UIPressesEvent): void;

	/**
	 * @since 9.0
	 */
	pressesEndedWithEvent(presses: NSSet<UIPress>, event: UIPressesEvent): void;

	/**
	 * @since 15.0
	 */
	print(sender: any): void;

	/**
	 * @since 3.2
	 */
	reloadInputViews(): void;

	/**
	 * @since 4.0
	 */
	remoteControlReceivedWithEvent(event: _UIEvent): void;

	/**
	 * @since 16.0
	 */
	rename(sender: any): void;

	resignFirstResponder(): boolean;

	respondsToSelector(aSelector: string): boolean;

	restoreUserActivityState(userActivity: NSUserActivity): void;

	retainCount(): number;

	/**
	 * @since 3.0
	 */
	select(sender: any): void;

	/**
	 * @since 3.0
	 */
	selectAll(sender: any): void;

	self(): this;

	/**
	 * @since 7.0
	 */
	targetForActionWithSender(action: string, sender: any): any;

	/**
	 * @since 6.0
	 */
	toggleBoldface(sender: any): void;

	/**
	 * @since 6.0
	 */
	toggleItalics(sender: any): void;

	/**
	 * @since 6.0
	 */
	toggleUnderline(sender: any): void;

	touchesBeganWithEvent(touches: NSSet<UITouch>, event: _UIEvent): void;

	touchesCancelledWithEvent(touches: NSSet<UITouch>, event: _UIEvent): void;

	touchesEndedWithEvent(touches: NSSet<UITouch>, event: _UIEvent): void;

	/**
	 * @since 9.1
	 */
	touchesEstimatedPropertiesUpdated(touches: NSSet<UITouch>): void;

	touchesMovedWithEvent(touches: NSSet<UITouch>, event: _UIEvent): void;

	/**
	 * @since 13.0
	 */
	updateTextAttributesWithConversionHandler(conversionHandler: (p1: NSDictionary<string, any>) => NSDictionary<string, any>): void;

	/**
	 * @since 8.0
	 */
	updateUserActivityState(activity: NSUserActivity): void;

	/**
	 * @since 16.0
	 */
	useSelectionForFind(sender: any): void;

	/**
	 * @since 13.0
	 */
	validateCommand(command: UICommand): void;
}

interface UIResponderStandardEditActions extends NSObjectProtocol {

	/**
	 * @since 3.0
	 */
	cut?(sender: any): void;

	/**
	 * @since 7.0
	 */
	decreaseSize?(sender: any): void;

	/**
	 * @since 3.2
	 */
	delete?(sender: any): void;

	/**
	 * @since 16.0
	 */
	duplicate?(sender: any): void;

	/**
	 * @since 16.0
	 */
	export?(sender: any): void;

	/**
	 * @since 16.0
	 */
	find?(sender: any): void;

	/**
	 * @since 16.0
	 */
	findAndReplace?(sender: any): void;

	/**
	 * @since 16.0
	 */
	findNext?(sender: any): void;

	/**
	 * @since 16.0
	 */
	findPrevious?(sender: any): void;

	/**
	 * @since 7.0
	 */
	increaseSize?(sender: any): void;

	/**
	 * @since 5.0
	 */
	makeTextWritingDirectionLeftToRight?(sender: any): void;

	/**
	 * @since 5.0
	 */
	makeTextWritingDirectionRightToLeft?(sender: any): void;

	/**
	 * @since 16.0
	 */
	move?(sender: any): void;

	/**
	 * @since 3.0
	 */
	paste?(sender: any): void;

	/**
	 * @since 15.0
	 */
	pasteAndGo?(sender: any): void;

	/**
	 * @since 15.0
	 */
	pasteAndMatchStyle?(sender: any): void;

	/**
	 * @since 15.0
	 */
	pasteAndSearch?(sender: any): void;

	/**
	 * @since 15.0
	 */
	print?(sender: any): void;

	/**
	 * @since 16.0
	 */
	rename?(sender: any): void;

	/**
	 * @since 3.0
	 */
	select?(sender: any): void;

	/**
	 * @since 3.0
	 */
	selectAll?(sender: any): void;

	/**
	 * @since 6.0
	 */
	toggleBoldface?(sender: any): void;

	/**
	 * @since 6.0
	 */
	toggleItalics?(sender: any): void;

	/**
	 * @since 6.0
	 */
	toggleUnderline?(sender: any): void;

	/**
	 * @since 13.0
	 */
	updateTextAttributesWithConversionHandler?(conversionHandler: (p1: NSDictionary<string, any>) => NSDictionary<string, any>): void;

	/**
	 * @since 16.0
	 */
	useSelectionForFind?(sender: any): void;
}
declare var UIResponderStandardEditActions: {

	prototype: UIResponderStandardEditActions;
};

declare const enum UIReturnKeyType {

	Default = 0,

	Go = 1,

	Google = 2,

	Join = 3,

	Next = 4,

	Route = 5,

	Search = 6,

	Send = 7,

	Yahoo = 8,

	Done = 9,

	EmergencyCall = 10,

	Continue = 11
}

/**
 * @since 3.2
 */
declare class UIRotationGestureRecognizer extends UIGestureRecognizer {

	static alloc(): UIRotationGestureRecognizer; // inherited from NSObject

	static new(): UIRotationGestureRecognizer; // inherited from NSObject

	rotation: number;

	readonly velocity: number;
}

/**
 * @since 3.1
 */
declare function UISaveVideoAtPathToSavedPhotosAlbum(videoPath: string, completionTarget: any, completionSelector: string, contextInfo: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 13.0
 */
declare class UIScene extends UIResponder {

	static alloc(): UIScene; // inherited from NSObject

	static new(): UIScene; // inherited from NSObject

	activationConditions: UISceneActivationConditions;

	readonly activationState: UISceneActivationState;

	delegate: UISceneDelegate;

	/**
	 * @since 14.0
	 */
	readonly pointerLockState: UIPointerLockState;

	readonly session: UISceneSession;

	/**
	 * @since 15.0
	 */
	subtitle: string;

	title: string;

	constructor(o: { session: UISceneSession; connectionOptions: UISceneConnectionOptions; });

	completeStateRestoration(): void;

	extendStateRestoration(): void;

	initWithSessionConnectionOptions(session: UISceneSession, connectionOptions: UISceneConnectionOptions): this;

	openURLOptionsCompletionHandler(url: NSURL, options: UISceneOpenExternalURLOptions, completion: (p1: boolean) => void): void;
}

/**
 * @since 13.0
 */
declare class UISceneActivationConditions extends NSObject implements NSSecureCoding {

	static alloc(): UISceneActivationConditions; // inherited from NSObject

	static new(): UISceneActivationConditions; // inherited from NSObject

	canActivateForTargetContentIdentifierPredicate: NSPredicate;

	prefersToActivateForTargetContentIdentifierPredicate: NSPredicate;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.0
 */
declare class UISceneActivationRequestOptions extends NSObject {

	static alloc(): UISceneActivationRequestOptions; // inherited from NSObject

	static new(): UISceneActivationRequestOptions; // inherited from NSObject

	requestingScene: UIScene;
}

/**
 * @since 13.0
 */
declare const enum UISceneActivationState {

	Unattached = -1,

	ForegroundActive = 0,

	ForegroundInactive = 1,

	Background = 2
}

/**
 * @since 17.0
 */
declare const enum UISceneCaptureState {

	Unspecified = -1,

	Inactive = 0,

	Active = 1
}

/**
 * @since 13.0
 */
declare class UISceneConfiguration extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UISceneConfiguration; // inherited from NSObject

	static configurationWithNameSessionRole(name: string, sessionRole: string): UISceneConfiguration;

	static new(): UISceneConfiguration; // inherited from NSObject

	delegateClass: typeof NSObject;

	readonly name: string;

	readonly role: string;

	sceneClass: typeof NSObject;

	storyboard: UIStoryboard;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { name: string; sessionRole: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithNameSessionRole(name: string, sessionRole: string): this;
}

/**
 * @since 13.0
 */
declare class UISceneConnectionOptions extends NSObject {

	static alloc(): UISceneConnectionOptions; // inherited from NSObject

	static new(): UISceneConnectionOptions; // inherited from NSObject

	readonly URLContexts: NSSet<UIOpenURLContext>;

	readonly cloudKitShareMetadata: CKShareMetadata;

	readonly gameControllerActivationContext: GCGameControllerActivationContext;

	readonly handoffUserActivityType: string;

	readonly notificationResponse: UNNotificationResponse;

	readonly shortcutItem: UIApplicationShortcutItem;

	readonly sourceApplication: string;

	readonly userActivities: NSSet<NSUserActivity>;
}

/**
 * @since 13.0
 */
interface UISceneDelegate extends NSObjectProtocol {

	sceneContinueUserActivity?(scene: UIScene, userActivity: NSUserActivity): void;

	sceneDidBecomeActive?(scene: UIScene): void;

	sceneDidDisconnect?(scene: UIScene): void;

	sceneDidEnterBackground?(scene: UIScene): void;

	sceneDidFailToContinueUserActivityWithTypeError?(scene: UIScene, userActivityType: string, error: NSError): void;

	sceneDidUpdateUserActivity?(scene: UIScene, userActivity: NSUserActivity): void;

	sceneOpenURLContexts?(scene: UIScene, URLContexts: NSSet<UIOpenURLContext>): void;

	sceneRestoreInteractionStateWithUserActivity?(scene: UIScene, stateRestorationActivity: NSUserActivity): void;

	sceneWillConnectToSessionOptions?(scene: UIScene, session: UISceneSession, connectionOptions: UISceneConnectionOptions): void;

	sceneWillContinueUserActivityWithType?(scene: UIScene, userActivityType: string): void;

	sceneWillEnterForeground?(scene: UIScene): void;

	sceneWillResignActive?(scene: UIScene): void;

	stateRestorationActivityForScene?(scene: UIScene): NSUserActivity;
}
declare var UISceneDelegate: {

	prototype: UISceneDelegate;
};

/**
 * @since 13.0
 */
declare class UISceneDestructionRequestOptions extends NSObject {

	static alloc(): UISceneDestructionRequestOptions; // inherited from NSObject

	static new(): UISceneDestructionRequestOptions; // inherited from NSObject
}

/**
 * @since 13.0
 */
declare var UISceneDidActivateNotification: string;

/**
 * @since 13.0
 */
declare var UISceneDidDisconnectNotification: string;

/**
 * @since 13.0
 */
declare var UISceneDidEnterBackgroundNotification: string;

/**
 * @since 13.0
 */
declare const enum UISceneErrorCode {

	MultipleScenesNotSupported = 0,

	RequestDenied = 1,

	GeometryRequestUnsupported = 100,

	GeometryRequestDenied = 101
}

/**
 * @since 15.0
 */
declare var UISceneErrorDomain: string;

/**
 * @since 13.0
 */
declare class UISceneOpenExternalURLOptions extends NSObject {

	static alloc(): UISceneOpenExternalURLOptions; // inherited from NSObject

	static new(): UISceneOpenExternalURLOptions; // inherited from NSObject

	/**
	 * @since 14.5
	 */
	eventAttribution: UIEventAttribution;

	universalLinksOnly: boolean;
}

/**
 * @since 13.0
 */
declare class UISceneOpenURLOptions extends NSObject {

	static alloc(): UISceneOpenURLOptions; // inherited from NSObject

	static new(): UISceneOpenURLOptions; // inherited from NSObject

	readonly annotation: any;

	/**
	 * @since 14.5
	 */
	readonly eventAttribution: UIEventAttribution;

	readonly openInPlace: boolean;

	readonly sourceApplication: string;
}

/**
 * @since 13.0
 */
declare class UISceneSession extends NSObject implements NSSecureCoding {

	static alloc(): UISceneSession; // inherited from NSObject

	static new(): UISceneSession; // inherited from NSObject

	readonly configuration: UISceneConfiguration;

	readonly persistentIdentifier: string;

	readonly role: string;

	readonly scene: UIScene;

	stateRestorationActivity: NSUserActivity;

	userInfo: NSDictionary<string, any>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 17.0
 */
declare class UISceneSessionActivationRequest extends NSObject implements NSCopying {

	static alloc(): UISceneSessionActivationRequest; // inherited from NSObject

	static new(): UISceneSessionActivationRequest; // inherited from NSObject

	static request(): UISceneSessionActivationRequest;

	static requestWithRole(role: string): UISceneSessionActivationRequest;

	static requestWithSession(session: UISceneSession): UISceneSessionActivationRequest;

	options: UISceneActivationRequestOptions;

	readonly role: string;

	readonly session: UISceneSession;

	userActivity: NSUserActivity;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 13.0
 */
declare class UISceneSizeRestrictions extends NSObject {

	static alloc(): UISceneSizeRestrictions; // inherited from NSObject

	static new(): UISceneSizeRestrictions; // inherited from NSObject

	allowsFullScreen: boolean;

	maximumSize: CGSize;

	minimumSize: CGSize;
}

/**
 * @since 13.0
 */
declare var UISceneWillConnectNotification: string;

/**
 * @since 13.0
 */
declare var UISceneWillDeactivateNotification: string;

/**
 * @since 13.0
 */
declare var UISceneWillEnterForegroundNotification: string;

/**
 * @since 16.0
 */
declare class UISceneWindowingBehaviors extends NSObject {

	static alloc(): UISceneWindowingBehaviors; // inherited from NSObject

	static new(): UISceneWindowingBehaviors; // inherited from NSObject

	closable: boolean;

	miniaturizable: boolean;
}

/**
 * @since 2.0
 */
declare class UIScreen extends NSObject implements UITraitEnvironment {

	static alloc(): UIScreen; // inherited from NSObject

	static new(): UIScreen; // inherited from NSObject

	/**
	 * @since 2.0
	 * @deprecated 9.0
	 */
	readonly applicationFrame: CGRect;

	/**
	 * @since 3.2
	 */
	readonly availableModes: NSArray<UIScreenMode>;

	readonly bounds: CGRect;

	/**
	 * @since 5.0
	 */
	brightness: number;

	/**
	 * @since 13.0
	 */
	readonly calibratedLatency: number;

	/**
	 * @since 11.0
	 * @deprecated 100000
	 */
	readonly captured: boolean;

	/**
	 * @since 8.0
	 */
	readonly coordinateSpace: UICoordinateSpace;

	/**
	 * @since 16.0
	 */
	readonly currentEDRHeadroom: number;

	/**
	 * @since 3.2
	 */
	currentMode: UIScreenMode;

	/**
	 * @since 8.0
	 */
	readonly fixedCoordinateSpace: UICoordinateSpace;

	/**
	 * @since 10.0
	 * @deprecated 15.0
	 */
	readonly focusedItem: UIFocusItem;

	/**
	 * @since 9.0
	 * @deprecated 15.0
	 */
	readonly focusedView: UIView;

	/**
	 * @since 10.3
	 */
	readonly maximumFramesPerSecond: number;

	/**
	 * @since 4.3
	 */
	readonly mirroredScreen: UIScreen;

	/**
	 * @since 8.0
	 */
	readonly nativeBounds: CGRect;

	/**
	 * @since 8.0
	 */
	readonly nativeScale: number;

	/**
	 * @since 5.0
	 */
	overscanCompensation: UIScreenOverscanCompensation;

	/**
	 * @since 9.0
	 */
	readonly overscanCompensationInsets: UIEdgeInsets;

	/**
	 * @since 16.0
	 */
	readonly potentialEDRHeadroom: number;

	/**
	 * @since 4.3
	 */
	readonly preferredMode: UIScreenMode;

	/**
	 * @since 16.0
	 */
	readonly referenceDisplayModeStatus: UIScreenReferenceDisplayModeStatus;

	/**
	 * @since 4.0
	 */
	readonly scale: number;

	/**
	 * @since 9.0
	 * @deprecated 15.0
	 */
	readonly supportsFocus: boolean;

	/**
	 * @since 5.0
	 */
	wantsSoftwareDimming: boolean;

	/**
	 * @since 2.0
	 * @deprecated 100000
	 */
	static readonly mainScreen: UIScreen;

	/**
	 * @since 3.2
	 * @deprecated 16.0
	 */
	static readonly screens: NSArray<UIScreen>;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	/**
	 * @since 8.0
	 */
	readonly traitCollection: UITraitCollection; // inherited from UITraitEnvironment

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 4.0
	 */
	displayLinkWithTargetSelector(target: any, sel: string): CADisplayLink;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 7.0
	 */
	snapshotViewAfterScreenUpdates(afterUpdates: boolean): UIView;

	/**
	 * @since 8.0
	 * @deprecated 17.0
	 */
	traitCollectionDidChange(previousTraitCollection: UITraitCollection): void;
}

/**
 * @since 5.0
 */
declare var UIScreenBrightnessDidChangeNotification: string;

/**
 * @since 11.0
 */
declare var UIScreenCapturedDidChangeNotification: string;

/**
 * @since 3.2
 * @deprecated 16.0
 */
declare var UIScreenDidConnectNotification: string;

/**
 * @since 3.2
 * @deprecated 16.0
 */
declare var UIScreenDidDisconnectNotification: string;

/**
 * @since 7.0
 */
declare class UIScreenEdgePanGestureRecognizer extends UIPanGestureRecognizer {

	static alloc(): UIScreenEdgePanGestureRecognizer; // inherited from NSObject

	static new(): UIScreenEdgePanGestureRecognizer; // inherited from NSObject

	edges: UIRectEdge;
}

/**
 * @since 3.2
 */
declare class UIScreenMode extends NSObject {

	static alloc(): UIScreenMode; // inherited from NSObject

	static new(): UIScreenMode; // inherited from NSObject

	readonly pixelAspectRatio: number;

	readonly size: CGSize;
}

/**
 * @since 3.2
 */
declare var UIScreenModeDidChangeNotification: string;

declare const enum UIScreenOverscanCompensation {

	Scale = 0,

	InsetBounds = 1,

	None = 2,

	InsetApplicationFrame = 2
}

/**
 * @since 16.0
 */
declare const enum UIScreenReferenceDisplayModeStatus {

	NotSupported = 0,

	NotEnabled = 1,

	Limited = 2,

	Enabled = 3
}

/**
 * @since 16.0
 */
declare var UIScreenReferenceDisplayModeStatusDidChangeNotification: string;

/**
 * @since 13.0
 */
declare class UIScreenshotService extends NSObject {

	static alloc(): UIScreenshotService; // inherited from NSObject

	static new(): UIScreenshotService; // inherited from NSObject

	delegate: UIScreenshotServiceDelegate;

	readonly windowScene: UIWindowScene;
}

interface UIScreenshotServiceDelegate extends NSObjectProtocol {

	screenshotServiceGeneratePDFRepresentationWithCompletion?(screenshotService: UIScreenshotService, completionHandler: (p1: NSData, p2: number, p3: CGRect) => void): void;
}
declare var UIScreenshotServiceDelegate: {

	prototype: UIScreenshotServiceDelegate;
};

/**
 * @since 14.0
 */
declare class UIScribbleInteraction extends NSObject implements UIInteraction {

	static alloc(): UIScribbleInteraction; // inherited from NSObject

	static new(): UIScribbleInteraction; // inherited from NSObject

	readonly delegate: UIScribbleInteractionDelegate;

	readonly handlingWriting: boolean;

	static readonly pencilInputExpected: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly view: UIView; // inherited from UIInteraction

	readonly  // inherited from NSObjectProtocol

	constructor(o: { delegate: UIScribbleInteractionDelegate; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	didMoveToView(view: UIView): void;

	initWithDelegate(delegate: UIScribbleInteractionDelegate): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	willMoveToView(view: UIView): void;
}

/**
 * @since 14.0
 */
interface UIScribbleInteractionDelegate extends NSObjectProtocol {

	scribbleInteractionDidFinishWriting?(interaction: UIScribbleInteraction): void;

	scribbleInteractionShouldBeginAtLocation?(interaction: UIScribbleInteraction, location: CGPoint): boolean;

	scribbleInteractionShouldDelayFocus?(interaction: UIScribbleInteraction): boolean;

	scribbleInteractionWillBeginWriting?(interaction: UIScribbleInteraction): void;
}
declare var UIScribbleInteractionDelegate: {

	prototype: UIScribbleInteractionDelegate;
};

/**
 * @since 13.4
 */
declare const enum UIScrollType {

	Discrete = 0,

	Continuous = 1
}

/**
 * @since 13.4
 */
declare const enum UIScrollTypeMask {

	Discrete = 1,

	Continuous = 2,

	All = 3
}

/**
 * @since 2.0
 */
declare class UIScrollView extends UIView implements NSCoding, UIFocusItemScrollableContainer {

	static alloc(): UIScrollView; // inherited from NSObject

	static appearance(): UIScrollView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIScrollView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIScrollView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIScrollView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIScrollView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIScrollView; // inherited from UIAppearance

	static new(): UIScrollView; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	readonly adjustedContentInset: UIEdgeInsets;

	/**
	 * @since 17.0
	 */
	allowsKeyboardScrolling: boolean;

	alwaysBounceHorizontal: boolean;

	alwaysBounceVertical: boolean;

	/**
	 * @since 13.0
	 */
	automaticallyAdjustsScrollIndicatorInsets: boolean;

	bounces: boolean;

	/**
	 * @since 17.4
	 */
	bouncesHorizontally: boolean;

	/**
	 * @since 17.4
	 */
	bouncesVertically: boolean;

	bouncesZoom: boolean;

	canCancelContentTouches: boolean;

	/**
	 * @since 17.4
	 */
	contentAlignmentPoint: CGPoint;

	contentInset: UIEdgeInsets;

	/**
	 * @since 11.0
	 */
	contentInsetAdjustmentBehavior: UIScrollViewContentInsetAdjustmentBehavior;

	/**
	 * @since 11.0
	 */
	readonly contentLayoutGuide: UILayoutGuide;

	contentSize: CGSize;

	readonly decelerating: boolean;

	/**
	 * @since 3.0
	 */
	decelerationRate: number;

	delaysContentTouches: boolean;

	delegate: UIScrollViewDelegate;

	directionalLockEnabled: boolean;

	readonly directionalPressGestureRecognizer: UIGestureRecognizer;

	readonly dragging: boolean;

	/**
	 * @since 11.0
	 */
	readonly frameLayoutGuide: UILayoutGuide;

	/**
	 * @since 11.1
	 */
	horizontalScrollIndicatorInsets: UIEdgeInsets;

	indexDisplayMode: UIScrollViewIndexDisplayMode;

	indicatorStyle: UIScrollViewIndicatorStyle;

	/**
	 * @since 7.0
	 */
	keyboardDismissMode: UIScrollViewKeyboardDismissMode;

	maximumZoomScale: number;

	minimumZoomScale: number;

	pagingEnabled: boolean;

	/**
	 * @since 5.0
	 */
	readonly panGestureRecognizer: UIPanGestureRecognizer;

	/**
	 * @since 5.0
	 */
	readonly pinchGestureRecognizer: UIPinchGestureRecognizer;

	/**
	 * @since 10.0
	 */
	refreshControl: UIRefreshControl;

	/**
	 * @since 17.4
	 */
	readonly scrollAnimating: boolean;

	scrollEnabled: boolean;

	scrollIndicatorInsets: UIEdgeInsets;

	scrollsToTop: boolean;

	showsHorizontalScrollIndicator: boolean;

	showsVerticalScrollIndicator: boolean;

	readonly tracking: boolean;

	/**
	 * @since 17.4
	 */
	transfersHorizontalScrollingToParent: boolean;

	/**
	 * @since 17.4
	 */
	transfersVerticalScrollingToParent: boolean;

	/**
	 * @since 11.1
	 */
	verticalScrollIndicatorInsets: UIEdgeInsets;

	/**
	 * @since 17.4
	 */
	readonly zoomAnimating: boolean;

	readonly zoomBouncing: boolean;

	/**
	 * @since 3.0
	 */
	zoomScale: number;

	readonly zooming: boolean;

	contentOffset: CGPoint; // inherited from UIFocusItemScrollableContainer

	readonly coordinateSpace: UICoordinateSpace; // inherited from UIFocusItemContainer

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly visibleSize: CGSize; // inherited from UIFocusItemScrollableContainer

	readonly  // inherited from NSObjectProtocol

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 11.0
	 */
	adjustedContentInsetDidChange(): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	encodeWithCoder(coder: NSCoder): void;

	flashScrollIndicators(): void;

	focusItemsInRect(rect: CGRect): NSArray<UIFocusItem>;

	initWithCoder(coder: NSCoder): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	scrollRectToVisibleAnimated(rect: CGRect, animated: boolean): void;

	self(): this;

	setContentOffsetAnimated(contentOffset: CGPoint, animated: boolean): void;

	/**
	 * @since 3.0
	 */
	setZoomScaleAnimated(scale: number, animated: boolean): void;

	/**
	 * @since 17.4
	 */
	stopScrollingAndZooming(): void;

	touchesShouldBeginWithEventInContentView(touches: NSSet<UITouch>, event: _UIEvent, view: UIView): boolean;

	touchesShouldCancelInContentView(view: UIView): boolean;

	/**
	 * @since 17.4
	 */
	withScrollIndicatorsShownForContentOffsetChanges(changes: () => void): void;

	/**
	 * @since 3.0
	 */
	zoomToRectAnimated(rect: CGRect, animated: boolean): void;
}

interface UIScrollViewAccessibilityDelegate extends UIScrollViewDelegate {

	/**
	 * @since 11.0
	 */
	accessibilityAttributedScrollStatusForScrollView?(scrollView: UIScrollView): NSAttributedString;

	accessibilityScrollStatusForScrollView?(scrollView: UIScrollView): string;
}
declare var UIScrollViewAccessibilityDelegate: {

	prototype: UIScrollViewAccessibilityDelegate;
};

/**
 * @since 11.0
 */
declare const enum UIScrollViewContentInsetAdjustmentBehavior {

	Automatic = 0,

	ScrollableAxes = 1,

	Never = 2,

	Always = 3
}

/**
 * @since 3.0
 */
declare var UIScrollViewDecelerationRateFast: number;

/**
 * @since 3.0
 */
declare var UIScrollViewDecelerationRateNormal: number;

interface UIScrollViewDelegate extends NSObjectProtocol {

	/**
	 * @since 11.0
	 */
	scrollViewDidChangeAdjustedContentInset?(scrollView: UIScrollView): void;

	scrollViewDidEndDecelerating?(scrollView: UIScrollView): void;

	scrollViewDidEndDraggingWillDecelerate?(scrollView: UIScrollView, decelerate: boolean): void;

	scrollViewDidEndScrollingAnimation?(scrollView: UIScrollView): void;

	scrollViewDidEndZoomingWithViewAtScale?(scrollView: UIScrollView, view: UIView, scale: number): void;

	scrollViewDidScroll?(scrollView: UIScrollView): void;

	scrollViewDidScrollToTop?(scrollView: UIScrollView): void;

	/**
	 * @since 3.2
	 */
	scrollViewDidZoom?(scrollView: UIScrollView): void;

	scrollViewShouldScrollToTop?(scrollView: UIScrollView): boolean;

	scrollViewWillBeginDecelerating?(scrollView: UIScrollView): void;

	scrollViewWillBeginDragging?(scrollView: UIScrollView): void;

	/**
	 * @since 3.2
	 */
	scrollViewWillBeginZoomingWithView?(scrollView: UIScrollView, view: UIView): void;

	/**
	 * @since 5.0
	 */
	scrollViewWillEndDraggingWithVelocityTargetContentOffset?(scrollView: UIScrollView, velocity: CGPoint, targetContentOffset: interop.Pointer | interop.Reference<CGPoint>): void;

	viewForZoomingInScrollView?(scrollView: UIScrollView): UIView;
}
declare var UIScrollViewDelegate: {

	prototype: UIScrollViewDelegate;
};

declare const enum UIScrollViewIndexDisplayMode {

	Automatic = 0,

	AlwaysHidden = 1
}

declare const enum UIScrollViewIndicatorStyle {

	Default = 0,

	Black = 1,

	White = 2
}

/**
 * @since 7.0
 */
declare const enum UIScrollViewKeyboardDismissMode {

	None = 0,

	OnDrag = 1,

	Interactive = 2,

	OnDragWithAccessory = 3,

	InteractiveWithAccessory = 4
}

/**
 * @since 2.0
 */
declare class UISearchBar extends UIView implements UIBarPositioning, UILookToDictateCapable, UITextInputTraits {

	static alloc(): UISearchBar; // inherited from NSObject

	static appearance(): UISearchBar; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UISearchBar; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UISearchBar; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UISearchBar; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UISearchBar; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UISearchBar; // inherited from UIAppearance

	static new(): UISearchBar; // inherited from NSObject

	/**
	 * @since 5.0
	 */
	backgroundImage: UIImage;

	barStyle: UIBarStyle;

	/**
	 * @since 7.0
	 */
	barTintColor: UIColor;

	delegate: UISearchBarDelegate;

	/**
	 * @since 16.4
	 */
	enabled: boolean;

	inputAccessoryView: UIView;

	placeholder: string;

	prompt: string;

	/**
	 * @since 5.0
	 */
	scopeBarBackgroundImage: UIImage;

	/**
	 * @since 3.0
	 */
	scopeButtonTitles: NSArray<string>;

	/**
	 * @since 7.0
	 */
	searchBarStyle: UISearchBarStyle;

	/**
	 * @since 5.0
	 */
	searchFieldBackgroundPositionAdjustment: UIOffset;

	/**
	 * @since 3.2
	 */
	searchResultsButtonSelected: boolean;

	/**
	 * @since 13.0
	 */
	readonly searchTextField: UISearchTextField;

	/**
	 * @since 5.0
	 */
	searchTextPositionAdjustment: UIOffset;

	/**
	 * @since 3.0
	 */
	selectedScopeButtonIndex: number;

	showsBookmarkButton: boolean;

	showsCancelButton: boolean;

	/**
	 * @since 3.0
	 */
	showsScopeBar: boolean;

	/**
	 * @since 3.2
	 */
	showsSearchResultsButton: boolean;

	text: string;

	/**
	 * @since 3.0
	 */
	translucent: boolean;

	autocapitalizationType: UITextAutocapitalizationType; // inherited from UITextInputTraits

	autocorrectionType: UITextAutocorrectionType; // inherited from UITextInputTraits

	readonly barPosition: UIBarPosition; // inherited from UIBarPositioning

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	enablesReturnKeyAutomatically: boolean; // inherited from UITextInputTraits

	readonly hash: number; // inherited from NSObjectProtocol

	/**
	 * @since 17.0
	 */
	inlinePredictionType: UITextInlinePredictionType; // inherited from UITextInputTraits

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	keyboardAppearance: UIKeyboardAppearance; // inherited from UITextInputTraits

	keyboardType: UIKeyboardType; // inherited from UITextInputTraits

	/**
	 * @since 17.0
	 */
	lookToDictateEnabled: boolean; // inherited from UILookToDictateCapable

	/**
	 * @since 18.0
	 */
	mathExpressionCompletionType: UITextMathExpressionCompletionType; // inherited from UITextInputTraits

	/**
	 * @since 12.0
	 */
	passwordRules: UITextInputPasswordRules; // inherited from UITextInputTraits

	returnKeyType: UIReturnKeyType; // inherited from UITextInputTraits

	secureTextEntry: boolean; // inherited from UITextInputTraits

	/**
	 * @since 11.0
	 */
	smartDashesType: UITextSmartDashesType; // inherited from UITextInputTraits

	/**
	 * @since 11.0
	 */
	smartInsertDeleteType: UITextSmartInsertDeleteType; // inherited from UITextInputTraits

	/**
	 * @since 11.0
	 */
	smartQuotesType: UITextSmartQuotesType; // inherited from UITextInputTraits

	/**
	 * @since 5.0
	 */
	spellCheckingType: UITextSpellCheckingType; // inherited from UITextInputTraits

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	/**
	 * @since 10.0
	 */
	textContentType: string; // inherited from UITextInputTraits

	/**
	 * @since 18.0
	 */
	writingToolsAllowedInputOptions: UIWritingToolsAllowedInputOptions; // inherited from UITextInputTraits

	/**
	 * @since 18.0
	 */
	writingToolsBehavior: UIWritingToolsBehavior; // inherited from UITextInputTraits

	readonly  // inherited from NSObjectProtocol

	/**
	 * @since 7.0
	 */
	backgroundImageForBarPositionBarMetrics(barPosition: UIBarPosition, barMetrics: UIBarMetrics): UIImage;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 5.0
	 */
	imageForSearchBarIconState(icon: UISearchBarIcon, state: UIControlState): UIImage;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	/**
	 * @since 5.0
	 */
	positionAdjustmentForSearchBarIcon(icon: UISearchBarIcon): UIOffset;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	/**
	 * @since 5.0
	 */
	scopeBarButtonBackgroundImageForState(state: UIControlState): UIImage;

	/**
	 * @since 5.0
	 */
	scopeBarButtonDividerImageForLeftSegmentStateRightSegmentState(leftState: UIControlState, rightState: UIControlState): UIImage;

	/**
	 * @since 5.0
	 */
	scopeBarButtonTitleTextAttributesForState(state: UIControlState): NSDictionary<string, any>;

	/**
	 * @since 5.0
	 */
	searchFieldBackgroundImageForState(state: UIControlState): UIImage;

	self(): this;

	/**
	 * @since 7.0
	 */
	setBackgroundImageForBarPositionBarMetrics(backgroundImage: UIImage, barPosition: UIBarPosition, barMetrics: UIBarMetrics): void;

	/**
	 * @since 5.0
	 */
	setImageForSearchBarIconState(iconImage: UIImage, icon: UISearchBarIcon, state: UIControlState): void;

	/**
	 * @since 5.0
	 */
	setPositionAdjustmentForSearchBarIcon(adjustment: UIOffset, icon: UISearchBarIcon): void;

	/**
	 * @since 5.0
	 */
	setScopeBarButtonBackgroundImageForState(backgroundImage: UIImage, state: UIControlState): void;

	/**
	 * @since 5.0
	 */
	setScopeBarButtonDividerImageForLeftSegmentStateRightSegmentState(dividerImage: UIImage, leftState: UIControlState, rightState: UIControlState): void;

	/**
	 * @since 5.0
	 */
	setScopeBarButtonTitleTextAttributesForState(attributes: NSDictionary<string, any>, state: UIControlState): void;

	/**
	 * @since 5.0
	 */
	setSearchFieldBackgroundImageForState(backgroundImage: UIImage, state: UIControlState): void;

	/**
	 * @since 3.0
	 */
	setShowsCancelButtonAnimated(showsCancelButton: boolean, animated: boolean): void;

	/**
	 * @since 13.0
	 */
	setShowsScopeBarAnimated(show: boolean, animate: boolean): void;
}

interface UISearchBarDelegate extends UIBarPositioningDelegate {

	searchBarBookmarkButtonClicked?(searchBar: UISearchBar): void;

	searchBarCancelButtonClicked?(searchBar: UISearchBar): void;

	/**
	 * @since 3.2
	 */
	searchBarResultsListButtonClicked?(searchBar: UISearchBar): void;

	searchBarSearchButtonClicked?(searchBar: UISearchBar): void;

	/**
	 * @since 3.0
	 */
	searchBarSelectedScopeButtonIndexDidChange?(searchBar: UISearchBar, selectedScope: number): void;

	searchBarShouldBeginEditing?(searchBar: UISearchBar): boolean;

	/**
	 * @since 3.0
	 */
	searchBarShouldChangeTextInRangeReplacementText?(searchBar: UISearchBar, range: NSRange, text: string): boolean;

	searchBarShouldEndEditing?(searchBar: UISearchBar): boolean;

	searchBarTextDidBeginEditing?(searchBar: UISearchBar): void;

	searchBarTextDidChange?(searchBar: UISearchBar, searchText: string): void;

	searchBarTextDidEndEditing?(searchBar: UISearchBar): void;
}
declare var UISearchBarDelegate: {

	prototype: UISearchBarDelegate;
};

declare const enum UISearchBarIcon {

	Search = 0,

	Clear = 1,

	Bookmark = 2,

	ResultsList = 3
}

/**
 * @since 7.0
 */
declare const enum UISearchBarStyle {

	Default = 0,

	Prominent = 1,

	Minimal = 2
}

/**
 * @since 9.1
 */
declare class UISearchContainerViewController extends UIViewController {

	static alloc(): UISearchContainerViewController; // inherited from NSObject

	static new(): UISearchContainerViewController; // inherited from NSObject

	readonly searchController: UISearchController;

	constructor(o: { searchController: UISearchController; });

	initWithSearchController(searchController: UISearchController): this;
}

/**
 * @since 8.0
 */
declare class UISearchController extends UIViewController implements UIViewControllerAnimatedTransitioning, UIViewControllerTransitioningDelegate {

	static alloc(): UISearchController; // inherited from NSObject

	static new(): UISearchController; // inherited from NSObject

	active: boolean;

	/**
	 * @since 13.0
	 */
	automaticallyShowsCancelButton: boolean;

	/**
	 * @since 13.0
	 * @deprecated 100000
	 */
	automaticallyShowsScopeBar: boolean;

	/**
	 * @since 13.0
	 */
	automaticallyShowsSearchResultsController: boolean;

	delegate: UISearchControllerDelegate;

	/**
	 * @since 8.0
	 * @deprecated 12.0
	 */
	dimsBackgroundDuringPresentation: boolean;

	hidesNavigationBarDuringPresentation: boolean;

	/**
	 * @since 16.0
	 */
	ignoresSearchSuggestionsForSearchBarPlacementStacked: boolean;

	/**
	 * @since 9.1
	 */
	obscuresBackgroundDuringPresentation: boolean;

	/**
	 * @since 16.0
	 */
	scopeBarActivation: UISearchControllerScopeBarActivation;

	readonly searchBar: UISearchBar;

	/**
	 * @since 16.0
	 */
	readonly searchBarPlacement: UINavigationItemSearchBarPlacement;

	readonly searchResultsController: UIViewController;

	searchResultsUpdater: UISearchResultsUpdating;

	/**
	 * @since 16.0
	 */
	searchSuggestions: NSArray<UISearchSuggestion>;

	/**
	 * @since 13.0
	 */
	showsSearchResultsController: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { searchResultsController: UIViewController; });

	animateTransition(transitionContext: UIViewControllerContextTransitioning): void;

	animationControllerForDismissedController(dismissed: UIViewController): UIViewControllerAnimatedTransitioning;

	animationControllerForPresentedControllerPresentingControllerSourceController(presented: UIViewController, presenting: UIViewController, source: UIViewController): UIViewControllerAnimatedTransitioning;

	animationEnded(transitionCompleted: boolean): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithSearchResultsController(searchResultsController: UIViewController): this;

	interactionControllerForDismissal(animator: UIViewControllerAnimatedTransitioning): UIViewControllerInteractiveTransitioning;

	interactionControllerForPresentation(animator: UIViewControllerAnimatedTransitioning): UIViewControllerInteractiveTransitioning;

	/**
	 * @since 10.0
	 */
	interruptibleAnimatorForTransition(transitionContext: UIViewControllerContextTransitioning): UIViewImplicitlyAnimating;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	/**
	 * @since 8.0
	 */
	presentationControllerForPresentedViewControllerPresentingViewControllerSourceViewController(presented: UIViewController, presenting: UIViewController, source: UIViewController): UIPresentationController;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	transitionDuration(transitionContext: UIViewControllerContextTransitioning): number;
}

interface UISearchControllerDelegate extends NSObjectProtocol {

	didDismissSearchController?(searchController: UISearchController): void;

	didPresentSearchController?(searchController: UISearchController): void;

	presentSearchController?(searchController: UISearchController): void;

	/**
	 * @since 16.0
	 */
	searchControllerDidChangeFromSearchBarPlacement?(searchController: UISearchController, previousPlacement: UINavigationItemSearchBarPlacement): void;

	/**
	 * @since 16.0
	 */
	searchControllerWillChangeToSearchBarPlacement?(searchController: UISearchController, newPlacement: UINavigationItemSearchBarPlacement): void;

	willDismissSearchController?(searchController: UISearchController): void;

	willPresentSearchController?(searchController: UISearchController): void;
}
declare var UISearchControllerDelegate: {

	prototype: UISearchControllerDelegate;
};

/**
 * @since 16.0
 */
declare const enum UISearchControllerScopeBarActivation {

	Automatic = 0,

	Manual = 1,

	OnTextEntry = 2,

	OnSearchActivation = 3
}

/**
 * @since 3.0
 * @deprecated 8.0
 */
declare class UISearchDisplayController extends NSObject {

	static alloc(): UISearchDisplayController; // inherited from NSObject

	static new(): UISearchDisplayController; // inherited from NSObject

	active: boolean;

	delegate: UISearchDisplayDelegate;

	/**
	 * @since 7.0
	 */
	displaysSearchBarInNavigationBar: boolean;

	/**
	 * @since 7.0
	 */
	readonly navigationItem: UINavigationItem;

	readonly searchBar: UISearchBar;

	readonly searchContentsController: UIViewController;

	searchResultsDataSource: UITableViewDataSource;

	searchResultsDelegate: UITableViewDelegate;

	readonly searchResultsTableView: UITableView;

	/**
	 * @since 5.0
	 */
	searchResultsTitle: string;

	constructor(o: { searchBar: UISearchBar; contentsController: UIViewController; });

	initWithSearchBarContentsController(searchBar: UISearchBar, viewController: UIViewController): this;

	setActiveAnimated(visible: boolean, animated: boolean): void;
}

interface UISearchDisplayDelegate extends NSObjectProtocol {

	/**
	 * @since 3.0
	 * @deprecated 8.0
	 */
	searchDisplayControllerDidBeginSearch?(controller: UISearchDisplayController): void;

	/**
	 * @since 3.0
	 * @deprecated 8.0
	 */
	searchDisplayControllerDidEndSearch?(controller: UISearchDisplayController): void;

	/**
	 * @since 3.0
	 * @deprecated 8.0
	 */
	searchDisplayControllerDidHideSearchResultsTableView?(controller: UISearchDisplayController, tableView: UITableView): void;

	/**
	 * @since 3.0
	 * @deprecated 8.0
	 */
	searchDisplayControllerDidLoadSearchResultsTableView?(controller: UISearchDisplayController, tableView: UITableView): void;

	/**
	 * @since 3.0
	 * @deprecated 8.0
	 */
	searchDisplayControllerDidShowSearchResultsTableView?(controller: UISearchDisplayController, tableView: UITableView): void;

	/**
	 * @since 3.0
	 * @deprecated 8.0
	 */
	searchDisplayControllerShouldReloadTableForSearchScope?(controller: UISearchDisplayController, searchOption: number): boolean;

	/**
	 * @since 3.0
	 * @deprecated 8.0
	 */
	searchDisplayControllerShouldReloadTableForSearchString?(controller: UISearchDisplayController, searchString: string): boolean;

	/**
	 * @since 3.0
	 * @deprecated 8.0
	 */
	searchDisplayControllerWillBeginSearch?(controller: UISearchDisplayController): void;

	/**
	 * @since 3.0
	 * @deprecated 8.0
	 */
	searchDisplayControllerWillEndSearch?(controller: UISearchDisplayController): void;

	/**
	 * @since 3.0
	 * @deprecated 8.0
	 */
	searchDisplayControllerWillHideSearchResultsTableView?(controller: UISearchDisplayController, tableView: UITableView): void;

	/**
	 * @since 3.0
	 * @deprecated 8.0
	 */
	searchDisplayControllerWillShowSearchResultsTableView?(controller: UISearchDisplayController, tableView: UITableView): void;

	/**
	 * @since 3.0
	 * @deprecated 8.0
	 */
	searchDisplayControllerWillUnloadSearchResultsTableView?(controller: UISearchDisplayController, tableView: UITableView): void;
}
declare var UISearchDisplayDelegate: {

	prototype: UISearchDisplayDelegate;
};

interface UISearchResultsUpdating extends NSObjectProtocol {

	updateSearchResultsForSearchController(searchController: UISearchController): void;

	/**
	 * @since 16.0
	 */
	updateSearchResultsForSearchControllerSelectingSearchSuggestion?(searchController: UISearchController, searchSuggestion: UISearchSuggestion): void;
}
declare var UISearchResultsUpdating: {

	prototype: UISearchResultsUpdating;
};

/**
 * @since 16.0
 */
interface UISearchSuggestion extends NSObjectProtocol {

	iconImage?: UIImage;

	/**
	 * @since 16.0
	 */
	localizedAttributedSuggestion: NSAttributedString;

	localizedDescription?: string;

	localizedSuggestion: string;

	/**
	 * @since 16.0
	 */
	representedObject: any;
}
declare var UISearchSuggestion: {

	prototype: UISearchSuggestion;
};

/**
 * @since 16.0
 */
declare class UISearchSuggestionItem extends NSObject implements UISearchSuggestion {

	static alloc(): UISearchSuggestionItem; // inherited from NSObject

	static new(): UISearchSuggestionItem; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	static suggestionWithLocalizedAttributedSuggestion(suggestion: NSAttributedString): UISearchSuggestionItem;

	/**
	 * @since 16.0
	 */
	static suggestionWithLocalizedAttributedSuggestionDescriptionString(suggestion: NSAttributedString, description: string): UISearchSuggestionItem;

	/**
	 * @since 16.0
	 */
	static suggestionWithLocalizedAttributedSuggestionDescriptionStringIconImage(suggestion: NSAttributedString, description: string, iconImage: UIImage): UISearchSuggestionItem;

	static suggestionWithLocalizedSuggestion(suggestion: string): UISearchSuggestionItem;

	static suggestionWithLocalizedSuggestionDescriptionString(suggestion: string, description: string): UISearchSuggestionItem;

	static suggestionWithLocalizedSuggestionDescriptionStringIconImage(suggestion: string, description: string, iconImage: UIImage): UISearchSuggestionItem;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly iconImage: UIImage; // inherited from UISearchSuggestion

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	/**
	 * @since 16.0
	 */
	readonly localizedAttributedSuggestion: NSAttributedString; // inherited from UISearchSuggestion

	readonly localizedDescription: string; // inherited from UISearchSuggestion

	readonly localizedSuggestion: string; // inherited from UISearchSuggestion

	/**
	 * @since 16.0
	 */
	representedObject: any; // inherited from UISearchSuggestion

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	/**
	 * @since 16.0
	 */
	constructor(o: { localizedAttributedSuggestion: NSAttributedString; });

	/**
	 * @since 16.0
	 */
	constructor(o: { localizedAttributedSuggestion: NSAttributedString; localizedDescription: string; });

	/**
	 * @since 16.0
	 */
	constructor(o: { localizedAttributedSuggestion: NSAttributedString; localizedDescription: string; iconImage: UIImage; });

	constructor(o: { localizedSuggestion: string; });

	constructor(o: { localizedSuggestion: string; localizedDescription: string; });

	constructor(o: { localizedSuggestion: string; localizedDescription: string; iconImage: UIImage; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 16.0
	 */
	initWithLocalizedAttributedSuggestion(suggestion: NSAttributedString): this;

	/**
	 * @since 16.0
	 */
	initWithLocalizedAttributedSuggestionLocalizedDescription(suggestion: NSAttributedString, description: string): this;

	/**
	 * @since 16.0
	 */
	initWithLocalizedAttributedSuggestionLocalizedDescriptionIconImage(suggestion: NSAttributedString, description: string, iconImage: UIImage): this;

	initWithLocalizedSuggestion(suggestion: string): this;

	initWithLocalizedSuggestionLocalizedDescription(suggestion: string, description: string): this;

	initWithLocalizedSuggestionLocalizedDescriptionIconImage(suggestion: string, description: string, iconImage: UIImage): this;

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
 * @since 18.0
 */
declare class UISearchTab extends UITab {

	static alloc(): UISearchTab; // inherited from NSObject

	static new(): UISearchTab; // inherited from NSObject

	constructor(o: { viewControllerProvider: (p1: UITab) => UIViewController; });

	initWithViewControllerProvider(viewControllerProvider: (p1: UITab) => UIViewController): this;
}

/**
 * @since 13.0
 */
declare class UISearchTextField extends UITextField {

	static alloc(): UISearchTextField; // inherited from NSObject

	static appearance(): UISearchTextField; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UISearchTextField; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UISearchTextField; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UISearchTextField; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UISearchTextField; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UISearchTextField; // inherited from UIAppearance

	static new(): UISearchTextField; // inherited from NSObject

	allowsCopyingTokens: boolean;

	allowsDeletingTokens: boolean;

	/**
	 * @since 16.0
	 */
	searchSuggestions: NSArray<UISearchSuggestion>;

	readonly textualRange: UITextRange;

	tokenBackgroundColor: UIColor;

	tokens: NSArray<UISearchToken>;

	insertTokenAtIndex(token: UISearchToken, tokenIndex: number): void;

	positionOfTokenAtIndex(tokenIndex: number): UITextPosition;

	removeTokenAtIndex(tokenIndex: number): void;

	replaceTextualPortionOfRangeWithTokenAtIndex(textRange: UITextRange, token: UISearchToken, tokenIndex: number): void;

	tokensInRange(textRange: UITextRange): NSArray<UISearchToken>;
}

interface UISearchTextFieldDelegate extends UITextFieldDelegate {

	/**
	 * @since 16.0
	 */
	searchTextFieldDidSelectSuggestion?(searchTextField: UISearchTextField, suggestion: UISearchSuggestion): void;

	searchTextFieldItemProviderForCopyingToken?(searchTextField: UISearchTextField, token: UISearchToken): NSItemProvider;
}
declare var UISearchTextFieldDelegate: {

	prototype: UISearchTextFieldDelegate;
};

interface UISearchTextFieldPasteItem extends UITextPasteItem {

	setSearchTokenResult(token: UISearchToken): void;
}
declare var UISearchTextFieldPasteItem: {

	prototype: UISearchTextFieldPasteItem;
};

/**
 * @since 13.0
 */
declare class UISearchToken extends NSObject {

	static alloc(): UISearchToken; // inherited from NSObject

	static new(): UISearchToken; // inherited from NSObject

	static tokenWithIconText(icon: UIImage, text: string): UISearchToken;

	representedObject: any;
}

/**
 * @since 2.0
 */
declare class UISegmentedControl extends UIControl implements NSCoding, UISpringLoadedInteractionSupporting {

	static alloc(): UISegmentedControl; // inherited from NSObject

	static appearance(): UISegmentedControl; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UISegmentedControl; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UISegmentedControl; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UISegmentedControl; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UISegmentedControl; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UISegmentedControl; // inherited from UIAppearance

	static new(): UISegmentedControl; // inherited from NSObject

	/**
	 * @since 5.0
	 */
	apportionsSegmentWidthsByContent: boolean;

	momentary: boolean;

	readonly numberOfSegments: number;

	/**
	 * @since 2.0
	 * @deprecated 7.0
	 */
	segmentedControlStyle: UISegmentedControlStyle;

	selectedSegmentIndex: number;

	/**
	 * @since 13.0
	 */
	selectedSegmentTintColor: UIColor;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	springLoaded: boolean; // inherited from UISpringLoadedInteractionSupporting

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 14.0
	 */
	constructor(o: { frame: CGRect; actions: NSArray<UIAction> | UIAction[]; });

	constructor(o: { items: NSArray<any> | any[]; });

	/**
	 * @since 14.0
	 */
	actionForSegmentAtIndex(segment: number): UIAction;

	/**
	 * @since 5.0
	 */
	backgroundImageForStateBarMetrics(state: UIControlState, barMetrics: UIBarMetrics): UIImage;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	contentOffsetForSegmentAtIndex(segment: number): CGSize;

	/**
	 * @since 5.0
	 */
	contentPositionAdjustmentForSegmentTypeBarMetrics(leftCenterRightOrAlone: UISegmentedControlSegment, barMetrics: UIBarMetrics): UIOffset;

	/**
	 * @since 5.0
	 */
	dividerImageForLeftSegmentStateRightSegmentStateBarMetrics(leftState: UIControlState, rightState: UIControlState, barMetrics: UIBarMetrics): UIImage;

	encodeWithCoder(coder: NSCoder): void;

	imageForSegmentAtIndex(segment: number): UIImage;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 14.0
	 */
	initWithFrameActions(frame: CGRect, actions: NSArray<UIAction> | UIAction[]): this;

	initWithItems(items: NSArray<any> | any[]): this;

	/**
	 * @since 14.0
	 */
	insertSegmentWithActionAtIndexAnimated(action: UIAction, segment: number, animated: boolean): void;

	insertSegmentWithImageAtIndexAnimated(image: UIImage, segment: number, animated: boolean): void;

	insertSegmentWithTitleAtIndexAnimated(title: string, segment: number, animated: boolean): void;

	isEnabledForSegmentAtIndex(segment: number): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	removeAllSegments(): void;

	removeSegmentAtIndexAnimated(segment: number, animated: boolean): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	/**
	 * @since 14.0
	 */
	segmentIndexForActionIdentifier(actionIdentifier: string): number;

	self(): this;

	/**
	 * @since 14.0
	 */
	setActionForSegmentAtIndex(action: UIAction, segment: number): void;

	/**
	 * @since 5.0
	 */
	setBackgroundImageForStateBarMetrics(backgroundImage: UIImage, state: UIControlState, barMetrics: UIBarMetrics): void;

	setContentOffsetForSegmentAtIndex(offset: CGSize, segment: number): void;

	/**
	 * @since 5.0
	 */
	setContentPositionAdjustmentForSegmentTypeBarMetrics(adjustment: UIOffset, leftCenterRightOrAlone: UISegmentedControlSegment, barMetrics: UIBarMetrics): void;

	/**
	 * @since 5.0
	 */
	setDividerImageForLeftSegmentStateRightSegmentStateBarMetrics(dividerImage: UIImage, leftState: UIControlState, rightState: UIControlState, barMetrics: UIBarMetrics): void;

	setEnabledForSegmentAtIndex(enabled: boolean, segment: number): void;

	setImageForSegmentAtIndex(image: UIImage, segment: number): void;

	setTitleForSegmentAtIndex(title: string, segment: number): void;

	/**
	 * @since 5.0
	 */
	setTitleTextAttributesForState(attributes: NSDictionary<string, any>, state: UIControlState): void;

	setWidthForSegmentAtIndex(width: number, segment: number): void;

	titleForSegmentAtIndex(segment: number): string;

	/**
	 * @since 5.0
	 */
	titleTextAttributesForState(state: UIControlState): NSDictionary<string, any>;

	widthForSegmentAtIndex(segment: number): number;
}

declare const UISegmentedControlNoSegment: number;

declare const enum UISegmentedControlSegment {

	Any = 0,

	Left = 1,

	Center = 2,

	Right = 3,

	Alone = 4
}

/**
 * @since 2.0
 * @deprecated 7.0
 */
declare const enum UISegmentedControlStyle {

	Plain = 0,

	Bordered = 1,

	Bar = 2,

	Bezeled = 3
}

/**
 * @since 10.0
 */
declare class UISelectionFeedbackGenerator extends UIFeedbackGenerator {

	static alloc(): UISelectionFeedbackGenerator; // inherited from NSObject

	/**
	 * @since 17.5
	 */
	static feedbackGeneratorForView(view: UIView): UISelectionFeedbackGenerator; // inherited from UIFeedbackGenerator

	static new(): UISelectionFeedbackGenerator; // inherited from NSObject

	selectionChanged(): void;

	/**
	 * @since 17.5
	 */
	selectionChangedAtLocation(location: CGPoint): void;
}

/**
 * @since 9.0
 */
declare const enum UISemanticContentAttribute {

	Unspecified = 0,

	Playback = 1,

	Spatial = 2,

	ForceLeftToRight = 3,

	ForceRightToLeft = 4
}

/**
 * @since 18.0
 */
declare class UIShadowProperties extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UIShadowProperties; // inherited from NSObject

	static new(): UIShadowProperties; // inherited from NSObject

	color: UIColor;

	offset: CGSize;

	opacity: number;

	path: UIBezierPath;

	radius: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 17.0
 */
declare class UIShape extends NSObject implements NSCopying, UIShapeProvider {

	static alloc(): UIShape; // inherited from NSObject

	static fixedRectShapeWithRect(rect: CGRect): UIShape;

	static fixedRectShapeWithRectCornerRadius(rect: CGRect, cornerRadius: number): UIShape;

	static fixedRectShapeWithRectCornerRadiusCornerCurveMaskedCorners(rect: CGRect, cornerRadius: number, cornerCurve: UICornerCurve, maskedCorners: UIRectCorner): UIShape;

	static new(): UIShape; // inherited from NSObject

	static rectShapeWithCornerRadius(cornerRadius: number): UIShape;

	static rectShapeWithCornerRadiusCornerCurve(cornerRadius: number, cornerCurve: UICornerCurve): UIShape;

	static rectShapeWithCornerRadiusCornerCurveMaskedCorners(cornerRadius: number, cornerCurve: UICornerCurve, maskedCorners: UIRectCorner): UIShape;

	static shapeWithBezierPath(path: UIBezierPath): UIShape;

	static shapeWithProvider(provider: UIShapeProvider): UIShape;

	static readonly capsuleShape: UIShape;

	static readonly circleShape: UIShape;

	static readonly rectShape: UIShape;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	resolvedShapeInContext(context: UIShapeResolutionContext): UIResolvedShape;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	shapeByApplyingInset(inset: number): UIShape;

	shapeByApplyingInsets(insets: UIEdgeInsets): UIShape;
}

/**
 * @since 17.0
 */
interface UIShapeProvider extends NSObjectProtocol {

	resolvedShapeInContext(context: UIShapeResolutionContext): UIResolvedShape;
}
declare var UIShapeProvider: {

	prototype: UIShapeProvider;
};

/**
 * @since 17.0
 */
declare class UIShapeResolutionContext extends NSObject {

	static alloc(): UIShapeResolutionContext; // inherited from NSObject

	static new(): UIShapeResolutionContext; // inherited from NSObject

	readonly contentShape: UIResolvedShape;
}

/**
 * @since 15.0
 */
declare class UISheetPresentationController extends UIPresentationController {

	static alloc(): UISheetPresentationController; // inherited from NSObject

	static new(): UISheetPresentationController; // inherited from NSObject

	delegate: UISheetPresentationControllerDelegate;

	detents: NSArray<UISheetPresentationControllerDetent>;

	largestUndimmedDetentIdentifier: string;

	preferredCornerRadius: number;

	prefersEdgeAttachedInCompactHeight: boolean;

	prefersGrabberVisible: boolean;

	/**
	 * @since 17.0
	 */
	prefersPageSizing: boolean;

	prefersScrollingExpandsWhenScrolledToEdge: boolean;

	selectedDetentIdentifier: string;

	sourceView: UIView;

	widthFollowsPreferredContentSizeWhenEdgeAttached: boolean;

	animateChanges(changes: () => void): void;

	/**
	 * @since 16.0
	 */
	invalidateDetents(): void;
}

/**
 * @since 15.0
 */
declare var UISheetPresentationControllerAutomaticDimension: number;

/**
 * @since 15.0
 */
interface UISheetPresentationControllerDelegate extends UIAdaptivePresentationControllerDelegate {

	sheetPresentationControllerDidChangeSelectedDetentIdentifier?(sheetPresentationController: UISheetPresentationController): void;
}
declare var UISheetPresentationControllerDelegate: {

	prototype: UISheetPresentationControllerDelegate;
};

/**
 * @since 15.0
 */
declare class UISheetPresentationControllerDetent extends NSObject {

	static alloc(): UISheetPresentationControllerDetent; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	static customDetentWithIdentifierResolver(identifier: string, resolver: (p1: UISheetPresentationControllerDetentResolutionContext) => number): UISheetPresentationControllerDetent;

	static largeDetent(): UISheetPresentationControllerDetent;

	static mediumDetent(): UISheetPresentationControllerDetent;

	static new(): UISheetPresentationControllerDetent; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	readonly identifier: string;

	/**
	 * @since 16.0
	 */
	resolvedValueInContext(context: UISheetPresentationControllerDetentResolutionContext): number;
}

/**
 * @since 15.0
 */
declare var UISheetPresentationControllerDetentIdentifierLarge: string;

/**
 * @since 15.0
 */
declare var UISheetPresentationControllerDetentIdentifierMedium: string;

/**
 * @since 16.0
 */
declare var UISheetPresentationControllerDetentInactive: number;

/**
 * @since 16.0
 */
interface UISheetPresentationControllerDetentResolutionContext extends NSObjectProtocol {

	containerTraitCollection: UITraitCollection;

	maximumDetentValue: number;
}
declare var UISheetPresentationControllerDetentResolutionContext: {

	prototype: UISheetPresentationControllerDetentResolutionContext;
};

/**
 * @since 4.2
 */
declare class UISimpleTextPrintFormatter extends UIPrintFormatter {

	static alloc(): UISimpleTextPrintFormatter; // inherited from NSObject

	static new(): UISimpleTextPrintFormatter; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	attributedText: NSAttributedString;

	color: UIColor;

	font: UIFont;

	text: string;

	textAlignment: NSTextAlignment;

	/**
	 * @since 7.0
	 */
	constructor(o: { attributedText: NSAttributedString; });

	constructor(o: { text: string; });

	/**
	 * @since 7.0
	 */
	initWithAttributedText(attributedText: NSAttributedString): this;

	initWithText(text: string): this;
}

/**
 * @since 2.0
 */
declare class UISlider extends UIControl implements NSCoding {

	static alloc(): UISlider; // inherited from NSObject

	static appearance(): UISlider; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UISlider; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UISlider; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UISlider; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UISlider; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UISlider; // inherited from UIAppearance

	static new(): UISlider; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	readonly behavioralStyle: UIBehavioralStyle;

	continuous: boolean;

	readonly currentMaximumTrackImage: UIImage;

	readonly currentMinimumTrackImage: UIImage;

	readonly currentThumbImage: UIImage;

	/**
	 * @since 5.0
	 */
	maximumTrackTintColor: UIColor;

	maximumValue: number;

	maximumValueImage: UIImage;

	/**
	 * @since 5.0
	 */
	minimumTrackTintColor: UIColor;

	minimumValue: number;

	minimumValueImage: UIImage;

	/**
	 * @since 15.0
	 */
	preferredBehavioralStyle: UIBehavioralStyle;

	/**
	 * @since 5.0
	 */
	thumbTintColor: UIColor;

	value: number;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	maximumTrackImageForState(state: UIControlState): UIImage;

	maximumValueImageRectForBounds(bounds: CGRect): CGRect;

	minimumTrackImageForState(state: UIControlState): UIImage;

	minimumValueImageRectForBounds(bounds: CGRect): CGRect;

	setMaximumTrackImageForState(image: UIImage, state: UIControlState): void;

	setMinimumTrackImageForState(image: UIImage, state: UIControlState): void;

	setThumbImageForState(image: UIImage, state: UIControlState): void;

	setValueAnimated(value: number, animated: boolean): void;

	thumbImageForState(state: UIControlState): UIImage;

	thumbRectForBoundsTrackRectValue(bounds: CGRect, rect: CGRect, value: number): CGRect;

	trackRectForBounds(bounds: CGRect): CGRect;
}

/**
 * @since 7.0
 */
declare class UISnapBehavior extends UIDynamicBehavior {

	static alloc(): UISnapBehavior; // inherited from NSObject

	static new(): UISnapBehavior; // inherited from NSObject

	damping: number;

	/**
	 * @since 9.0
	 */
	snapPoint: CGPoint;

	constructor(o: { item: UIDynamicItem; snapToPoint: CGPoint; });

	initWithItemSnapToPoint(item: UIDynamicItem, point: CGPoint): this;
}

/**
 * @since 3.2
 */
declare class UISplitViewController extends UIViewController {

	static alloc(): UISplitViewController; // inherited from NSObject

	static new(): UISplitViewController; // inherited from NSObject

	/**
	 * @since 8.0
	 */
	readonly collapsed: boolean;

	delegate: UISplitViewControllerDelegate;

	/**
	 * @since 8.0
	 */
	readonly displayMode: UISplitViewControllerDisplayMode;

	/**
	 * @since 8.0
	 */
	readonly displayModeButtonItem: UIBarButtonItem;

	/**
	 * @since 14.5
	 */
	displayModeButtonVisibility: UISplitViewControllerDisplayModeButtonVisibility;

	/**
	 * @since 8.0
	 */
	maximumPrimaryColumnWidth: number;

	/**
	 * @since 14.0
	 */
	maximumSupplementaryColumnWidth: number;

	/**
	 * @since 8.0
	 */
	minimumPrimaryColumnWidth: number;

	/**
	 * @since 14.0
	 */
	minimumSupplementaryColumnWidth: number;

	/**
	 * @since 8.0
	 */
	preferredDisplayMode: UISplitViewControllerDisplayMode;

	/**
	 * @since 14.0
	 */
	preferredPrimaryColumnWidth: number;

	/**
	 * @since 8.0
	 */
	preferredPrimaryColumnWidthFraction: number;

	/**
	 * @since 14.0
	 */
	preferredSplitBehavior: UISplitViewControllerSplitBehavior;

	/**
	 * @since 14.0
	 */
	preferredSupplementaryColumnWidth: number;

	/**
	 * @since 14.0
	 */
	preferredSupplementaryColumnWidthFraction: number;

	/**
	 * @since 5.1
	 */
	presentsWithGesture: boolean;

	/**
	 * @since 13.0
	 */
	primaryBackgroundStyle: UISplitViewControllerBackgroundStyle;

	/**
	 * @since 8.0
	 */
	readonly primaryColumnWidth: number;

	/**
	 * @since 11.0
	 */
	primaryEdge: UISplitViewControllerPrimaryEdge;

	/**
	 * @since 14.0
	 */
	showsSecondaryOnlyButton: boolean;

	/**
	 * @since 14.0
	 */
	readonly splitBehavior: UISplitViewControllerSplitBehavior;

	/**
	 * @since 14.0
	 */
	readonly style: UISplitViewControllerStyle;

	/**
	 * @since 14.0
	 */
	readonly supplementaryColumnWidth: number;

	viewControllers: NSArray<UIViewController>;

	/**
	 * @since 14.0
	 */
	constructor(o: { style: UISplitViewControllerStyle; });

	/**
	 * @since 14.0
	 */
	hideColumn(column: UISplitViewControllerColumn): void;

	/**
	 * @since 14.0
	 */
	initWithStyle(style: UISplitViewControllerStyle): this;

	/**
	 * @since 14.0
	 */
	setViewControllerForColumn(vc: UIViewController, column: UISplitViewControllerColumn): void;

	/**
	 * @since 14.0
	 */
	showColumn(column: UISplitViewControllerColumn): void;

	/**
	 * @since 14.0
	 */
	viewControllerForColumn(column: UISplitViewControllerColumn): UIViewController;
}

/**
 * @since 8.0
 */
declare var UISplitViewControllerAutomaticDimension: number;

/**
 * @since 13.0
 */
declare const enum UISplitViewControllerBackgroundStyle {

	None = 0,

	Sidebar = 1
}

/**
 * @since 14.0
 */
declare const enum UISplitViewControllerColumn {

	Primary = 0,

	Supplementary = 1,

	Secondary = 2,

	Compact = 3
}

interface UISplitViewControllerDelegate {

	/**
	 * @since 8.0
	 */
	primaryViewControllerForCollapsingSplitViewController?(splitViewController: UISplitViewController): UIViewController;

	/**
	 * @since 8.0
	 */
	primaryViewControllerForExpandingSplitViewController?(splitViewController: UISplitViewController): UIViewController;

	/**
	 * @since 8.0
	 */
	splitViewControllerCollapseSecondaryViewControllerOntoPrimaryViewController?(splitViewController: UISplitViewController, secondaryViewController: UIViewController, primaryViewController: UIViewController): boolean;

	/**
	 * @since 14.0
	 */
	splitViewControllerDidCollapse?(svc: UISplitViewController): void;

	/**
	 * @since 14.0
	 */
	splitViewControllerDidExpand?(svc: UISplitViewController): void;

	/**
	 * @since 14.0
	 */
	splitViewControllerDisplayModeForExpandingToProposedDisplayMode?(svc: UISplitViewController, proposedDisplayMode: UISplitViewControllerDisplayMode): UISplitViewControllerDisplayMode;

	/**
	 * @since 14.0
	 */
	splitViewControllerInteractivePresentationGestureDidEnd?(svc: UISplitViewController): void;

	/**
	 * @since 14.0
	 */
	splitViewControllerInteractivePresentationGestureWillBegin?(svc: UISplitViewController): void;

	/**
	 * @since 2.0
	 * @deprecated 8.0
	 */
	splitViewControllerPopoverControllerWillPresentViewController?(svc: UISplitViewController, pc: UIPopoverController, aViewController: UIViewController): void;

	/**
	 * @since 7.0
	 */
	splitViewControllerPreferredInterfaceOrientationForPresentation?(splitViewController: UISplitViewController): UIInterfaceOrientation;

	/**
	 * @since 8.0
	 */
	splitViewControllerSeparateSecondaryViewControllerFromPrimaryViewController?(splitViewController: UISplitViewController, primaryViewController: UIViewController): UIViewController;

	/**
	 * @since 5.0
	 * @deprecated 8.0
	 */
	splitViewControllerShouldHideViewControllerInOrientation?(svc: UISplitViewController, vc: UIViewController, orientation: UIInterfaceOrientation): boolean;

	/**
	 * @since 8.0
	 */
	splitViewControllerShowDetailViewControllerSender?(splitViewController: UISplitViewController, vc: UIViewController, sender: any): boolean;

	/**
	 * @since 8.0
	 */
	splitViewControllerShowViewControllerSender?(splitViewController: UISplitViewController, vc: UIViewController, sender: any): boolean;

	/**
	 * @since 7.0
	 */
	splitViewControllerSupportedInterfaceOrientations?(splitViewController: UISplitViewController): UIInterfaceOrientationMask;

	/**
	 * @since 14.0
	 */
	splitViewControllerTopColumnForCollapsingToProposedTopColumn?(svc: UISplitViewController, proposedTopColumn: UISplitViewControllerColumn): UISplitViewControllerColumn;

	/**
	 * @since 8.0
	 */
	splitViewControllerWillChangeToDisplayMode?(svc: UISplitViewController, displayMode: UISplitViewControllerDisplayMode): void;

	/**
	 * @since 14.0
	 */
	splitViewControllerWillHideColumn?(svc: UISplitViewController, column: UISplitViewControllerColumn): void;

	/**
	 * @since 2.0
	 * @deprecated 8.0
	 */
	splitViewControllerWillHideViewControllerWithBarButtonItemForPopoverController?(svc: UISplitViewController, aViewController: UIViewController, barButtonItem: UIBarButtonItem, pc: UIPopoverController): void;

	/**
	 * @since 14.0
	 */
	splitViewControllerWillShowColumn?(svc: UISplitViewController, column: UISplitViewControllerColumn): void;

	/**
	 * @since 2.0
	 * @deprecated 8.0
	 */
	splitViewControllerWillShowViewControllerInvalidatingBarButtonItem?(svc: UISplitViewController, aViewController: UIViewController, barButtonItem: UIBarButtonItem): void;

	/**
	 * @since 8.0
	 */
	targetDisplayModeForActionInSplitViewController?(svc: UISplitViewController): UISplitViewControllerDisplayMode;
}
declare var UISplitViewControllerDelegate: {

	prototype: UISplitViewControllerDelegate;
};

/**
 * @since 8.0
 */
declare const enum UISplitViewControllerDisplayMode {

	Automatic = 0,

	SecondaryOnly = 1,

	OneBesideSecondary = 2,

	OneOverSecondary = 3,

	TwoBesideSecondary = 4,

	TwoOverSecondary = 5,

	TwoDisplaceSecondary = 6,

	PrimaryHidden = 1,

	AllVisible = 2,

	PrimaryOverlay = 3
}

/**
 * @since 14.5
 */
declare const enum UISplitViewControllerDisplayModeButtonVisibility {

	Automatic = 0,

	Never = 1,

	Always = 2
}

/**
 * @since 11.0
 */
declare const enum UISplitViewControllerPrimaryEdge {

	Leading = 0,

	Trailing = 1
}

/**
 * @since 14.0
 */
declare const enum UISplitViewControllerSplitBehavior {

	Automatic = 0,

	Tile = 1,

	Overlay = 2,

	Displace = 3
}

/**
 * @since 14.0
 */
declare const enum UISplitViewControllerStyle {

	Unspecified = 0,

	DoubleColumn = 1,

	TripleColumn = 2
}

/**
 * @since 11.0
 */
declare class UISpringLoadedInteraction extends NSObject implements UIInteraction {

	static alloc(): UISpringLoadedInteraction; // inherited from NSObject

	static new(): UISpringLoadedInteraction; // inherited from NSObject

	readonly interactionBehavior: UISpringLoadedInteractionBehavior;

	readonly interactionEffect: UISpringLoadedInteractionEffect;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly view: UIView; // inherited from UIInteraction

	readonly  // inherited from NSObjectProtocol

	constructor(o: { activationHandler: (p1: UISpringLoadedInteraction, p2: UISpringLoadedInteractionContext) => void; });

	constructor(o: { interactionBehavior: UISpringLoadedInteractionBehavior; interactionEffect: UISpringLoadedInteractionEffect; activationHandler: (p1: UISpringLoadedInteraction, p2: UISpringLoadedInteractionContext) => void; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	didMoveToView(view: UIView): void;

	initWithActivationHandler(handler: (p1: UISpringLoadedInteraction, p2: UISpringLoadedInteractionContext) => void): this;

	initWithInteractionBehaviorInteractionEffectActivationHandler(interactionBehavior: UISpringLoadedInteractionBehavior, interactionEffect: UISpringLoadedInteractionEffect, handler: (p1: UISpringLoadedInteraction, p2: UISpringLoadedInteractionContext) => void): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	willMoveToView(view: UIView): void;
}

/**
 * @since 11.0
 */
interface UISpringLoadedInteractionBehavior extends NSObjectProtocol {

	interactionDidFinish?(interaction: UISpringLoadedInteraction): void;

	shouldAllowInteractionWithContext(interaction: UISpringLoadedInteraction, context: UISpringLoadedInteractionContext): boolean;
}
declare var UISpringLoadedInteractionBehavior: {

	prototype: UISpringLoadedInteractionBehavior;
};

/**
 * @since 11.0
 */
interface UISpringLoadedInteractionContext extends NSObjectProtocol {

	state: UISpringLoadedInteractionEffectState;

	targetItem: any;

	targetView: UIView;

	locationInView(view: UIView): CGPoint;
}
declare var UISpringLoadedInteractionContext: {

	prototype: UISpringLoadedInteractionContext;
};

/**
 * @since 11.0
 */
interface UISpringLoadedInteractionEffect extends NSObjectProtocol {

	interactionDidChangeWithContext(interaction: UISpringLoadedInteraction, context: UISpringLoadedInteractionContext): void;
}
declare var UISpringLoadedInteractionEffect: {

	prototype: UISpringLoadedInteractionEffect;
};

/**
 * @since 11.0
 */
declare const enum UISpringLoadedInteractionEffectState {

	Inactive = 0,

	Possible = 1,

	Activating = 2,

	Activated = 3
}

/**
 * @since 11.0
 */
interface UISpringLoadedInteractionSupporting extends NSObjectProtocol {

	springLoaded: boolean;
}
declare var UISpringLoadedInteractionSupporting: {

	prototype: UISpringLoadedInteractionSupporting;
};

/**
 * @since 10.0
 */
declare class UISpringTimingParameters extends NSObject implements UITimingCurveProvider {

	static alloc(): UISpringTimingParameters; // inherited from NSObject

	static new(): UISpringTimingParameters; // inherited from NSObject

	readonly initialVelocity: CGVector;

	readonly cubicTimingParameters: UICubicTimingParameters; // inherited from UITimingCurveProvider

	readonly springTimingParameters: UISpringTimingParameters; // inherited from UITimingCurveProvider

	readonly timingCurveType: UITimingCurveType; // inherited from UITimingCurveProvider

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { dampingRatio: number; });

	constructor(o: { dampingRatio: number; initialVelocity: CGVector; });

	/**
	 * @since 17.0
	 */
	constructor(o: { duration: number; bounce: number; });

	/**
	 * @since 17.0
	 */
	constructor(o: { duration: number; bounce: number; initialVelocity: CGVector; });

	constructor(o: { mass: number; stiffness: number; damping: number; initialVelocity: CGVector; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithDampingRatio(ratio: number): this;

	initWithDampingRatioInitialVelocity(ratio: number, velocity: CGVector): this;

	/**
	 * @since 17.0
	 */
	initWithDurationBounce(duration: number, bounce: number): this;

	/**
	 * @since 17.0
	 */
	initWithDurationBounceInitialVelocity(duration: number, bounce: number, velocity: CGVector): this;

	initWithMassStiffnessDampingInitialVelocity(mass: number, stiffness: number, damping: number, velocity: CGVector): this;
}

/**
 * @since 9.0
 */
declare class UIStackView extends UIView {

	static alloc(): UIStackView; // inherited from NSObject

	static appearance(): UIStackView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIStackView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIStackView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIStackView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIStackView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIStackView; // inherited from UIAppearance

	static new(): UIStackView; // inherited from NSObject

	alignment: UIStackViewAlignment;

	readonly arrangedSubviews: NSArray<UIView>;

	axis: UILayoutConstraintAxis;

	baselineRelativeArrangement: boolean;

	distribution: UIStackViewDistribution;

	layoutMarginsRelativeArrangement: boolean;

	spacing: number;

	constructor(o: { arrangedSubviews: NSArray<UIView> | UIView[]; });

	addArrangedSubview(view: UIView): void;

	/**
	 * @since 11.0
	 */
	customSpacingAfterView(arrangedSubview: UIView): number;

	initWithArrangedSubviews(views: NSArray<UIView> | UIView[]): this;

	insertArrangedSubviewAtIndex(view: UIView, stackIndex: number): void;

	removeArrangedSubview(view: UIView): void;

	/**
	 * @since 11.0
	 */
	setCustomSpacingAfterView(spacing: number, arrangedSubview: UIView): void;
}

/**
 * @since 9.0
 */
declare const enum UIStackViewAlignment {

	Fill = 0,

	Leading = 1,

	Top = 1,

	FirstBaseline = 2,

	Center = 3,

	Trailing = 4,

	Bottom = 4,

	LastBaseline = 5
}

/**
 * @since 9.0
 */
declare const enum UIStackViewDistribution {

	Fill = 0,

	FillEqually = 1,

	FillProportionally = 2,

	EqualSpacing = 3,

	EqualCentering = 4
}

/**
 * @since 11.0
 */
declare var UIStackViewSpacingUseDefault: number;

/**
 * @since 11.0
 */
declare var UIStackViewSpacingUseSystem: number;

/**
 * @since 17.4
 */
declare class UIStandardTextCursorView extends UIView implements UITextCursorView {

	static alloc(): UIStandardTextCursorView; // inherited from NSObject

	static appearance(): UIStandardTextCursorView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIStandardTextCursorView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIStandardTextCursorView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIStandardTextCursorView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIStandardTextCursorView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIStandardTextCursorView; // inherited from UIAppearance

	static new(): UIStandardTextCursorView; // inherited from NSObject

	blinking: boolean; // inherited from UITextCursorView

	/**
	 * @since 8.0
	 */
	readonly bounds: CGRect; // inherited from UICoordinateSpace

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 8.0
	 */
	convertPointFromCoordinateSpace(point: CGPoint, coordinateSpace: UICoordinateSpace): CGPoint;

	/**
	 * @since 8.0
	 */
	convertPointToCoordinateSpace(point: CGPoint, coordinateSpace: UICoordinateSpace): CGPoint;

	/**
	 * @since 8.0
	 */
	convertRectFromCoordinateSpace(rect: CGRect, coordinateSpace: UICoordinateSpace): CGRect;

	/**
	 * @since 8.0
	 */
	convertRectToCoordinateSpace(rect: CGRect, coordinateSpace: UICoordinateSpace): CGRect;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	resetBlinkAnimation(): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 6.0
 */
declare var UIStateRestorationViewControllerStoryboardKey: string;

interface UIStateRestoring extends NSObjectProtocol {

	objectRestorationClass?: typeof NSObject;

	restorationParent?: UIStateRestoring;

	applicationFinishedRestoringState?(): void;

	decodeRestorableStateWithCoder?(coder: NSCoder): void;

	encodeRestorableStateWithCoder?(coder: NSCoder): void;
}
declare var UIStateRestoring: {

	prototype: UIStateRestoring;
};

declare const enum UIStatusBarAnimation {

	None = 0,

	Fade = 1,

	Slide = 2
}

/**
 * @since 13.0
 */
declare class UIStatusBarManager extends NSObject {

	static alloc(): UIStatusBarManager; // inherited from NSObject

	static new(): UIStatusBarManager; // inherited from NSObject

	readonly statusBarFrame: CGRect;

	readonly statusBarHidden: boolean;

	readonly statusBarStyle: UIStatusBarStyle;
}

declare const enum UIStatusBarStyle {

	Default = 0,

	LightContent = 1,

	DarkContent = 3,

	BlackTranslucent = 1,

	BlackOpaque = 2
}

/**
 * @since 5.0
 */
declare class UIStepper extends UIControl {

	static alloc(): UIStepper; // inherited from NSObject

	static appearance(): UIStepper; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIStepper; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIStepper; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIStepper; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIStepper; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIStepper; // inherited from UIAppearance

	static new(): UIStepper; // inherited from NSObject

	autorepeat: boolean;

	continuous: boolean;

	maximumValue: number;

	minimumValue: number;

	stepValue: number;

	value: number;

	wraps: boolean;

	/**
	 * @since 6.0
	 */
	backgroundImageForState(state: UIControlState): UIImage;

	/**
	 * @since 6.0
	 */
	decrementImageForState(state: UIControlState): UIImage;

	/**
	 * @since 6.0
	 */
	dividerImageForLeftSegmentStateRightSegmentState(state: UIControlState, state1: UIControlState): UIImage;

	/**
	 * @since 6.0
	 */
	incrementImageForState(state: UIControlState): UIImage;

	/**
	 * @since 6.0
	 */
	setBackgroundImageForState(image: UIImage, state: UIControlState): void;

	/**
	 * @since 6.0
	 */
	setDecrementImageForState(image: UIImage, state: UIControlState): void;

	/**
	 * @since 6.0
	 */
	setDividerImageForLeftSegmentStateRightSegmentState(image: UIImage, leftState: UIControlState, rightState: UIControlState): void;

	/**
	 * @since 6.0
	 */
	setIncrementImageForState(image: UIImage, state: UIControlState): void;
}

/**
 * @since 5.0
 */
declare class UIStoryboard extends NSObject {

	static alloc(): UIStoryboard; // inherited from NSObject

	static new(): UIStoryboard; // inherited from NSObject

	static storyboardWithNameBundle(name: string, storyboardBundleOrNil: NSBundle): UIStoryboard;

	instantiateInitialViewController(): UIViewController;

	/**
	 * @since 13.0
	 */
	instantiateInitialViewControllerWithCreator(block: (p1: NSCoder) => UIViewController): UIViewController;

	instantiateViewControllerWithIdentifier(identifier: string): UIViewController;

	/**
	 * @since 13.0
	 */
	instantiateViewControllerWithIdentifierCreator(identifier: string, block: (p1: NSCoder) => UIViewController): UIViewController;
}

/**
 * @since 5.0
 * @deprecated 9.0
 */
declare class UIStoryboardPopoverSegue extends UIStoryboardSegue {

	static alloc(): UIStoryboardPopoverSegue; // inherited from NSObject

	static new(): UIStoryboardPopoverSegue; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	static segueWithIdentifierSourceDestinationPerformHandler(identifier: string, source: UIViewController, destination: UIViewController, performHandler: () => void): UIStoryboardPopoverSegue; // inherited from UIStoryboardSegue

	readonly popoverController: UIPopoverController;
}

/**
 * @since 5.0
 */
declare class UIStoryboardSegue extends NSObject {

	static alloc(): UIStoryboardSegue; // inherited from NSObject

	static new(): UIStoryboardSegue; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	static segueWithIdentifierSourceDestinationPerformHandler(identifier: string, source: UIViewController, destination: UIViewController, performHandler: () => void): UIStoryboardSegue;

	readonly destinationViewController: UIViewController;

	readonly identifier: string;

	readonly sourceViewController: UIViewController;

	constructor(o: { identifier: string; source: UIViewController; destination: UIViewController; });

	initWithIdentifierSourceDestination(identifier: string, source: UIViewController, destination: UIViewController): this;

	perform(): void;
}

/**
 * @since 9.0
 */
declare class UIStoryboardUnwindSegueSource extends NSObject {

	static alloc(): UIStoryboardUnwindSegueSource; // inherited from NSObject

	static new(): UIStoryboardUnwindSegueSource; // inherited from NSObject

	readonly sender: any;

	readonly sourceViewController: UIViewController;

	readonly unwindAction: string;
}

/**
 * @since 11.0
 */
declare class UISwipeActionsConfiguration extends NSObject {

	static alloc(): UISwipeActionsConfiguration; // inherited from NSObject

	static configurationWithActions(actions: NSArray<UIContextualAction> | UIContextualAction[]): UISwipeActionsConfiguration;

	static new(): UISwipeActionsConfiguration; // inherited from NSObject

	readonly actions: NSArray<UIContextualAction>;

	performsFirstActionWithFullSwipe: boolean;
}

/**
 * @since 3.2
 */
declare class UISwipeGestureRecognizer extends UIGestureRecognizer {

	static alloc(): UISwipeGestureRecognizer; // inherited from NSObject

	static new(): UISwipeGestureRecognizer; // inherited from NSObject

	direction: UISwipeGestureRecognizerDirection;

	numberOfTouchesRequired: number;
}

declare const enum UISwipeGestureRecognizerDirection {

	Right = 1,

	Left = 2,

	Up = 4,

	Down = 8
}

/**
 * @since 2.0
 */
declare class UISwitch extends UIControl implements NSCoding {

	static alloc(): UISwitch; // inherited from NSObject

	static appearance(): UISwitch; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UISwitch; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UISwitch; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UISwitch; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UISwitch; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UISwitch; // inherited from UIAppearance

	static new(): UISwitch; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	offImage: UIImage;

	on: boolean;

	/**
	 * @since 6.0
	 */
	onImage: UIImage;

	/**
	 * @since 5.0
	 */
	onTintColor: UIColor;

	/**
	 * @since 14.0
	 */
	preferredStyle: UISwitchStyle;

	/**
	 * @since 14.0
	 */
	readonly style: UISwitchStyle;

	/**
	 * @since 6.0
	 */
	thumbTintColor: UIColor;

	/**
	 * @since 14.0
	 */
	title: string;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	setOnAnimated(on: boolean, animated: boolean): void;
}

/**
 * @since 14.0
 */
declare const enum UISwitchStyle {

	Automatic = 0,

	Checkbox = 1,

	Sliding = 2
}

/**
 * @since 17.0
 */
declare class UISymbolEffectCompletionContext extends NSObject {

	static alloc(): UISymbolEffectCompletionContext; // inherited from NSObject

	static new(): UISymbolEffectCompletionContext; // inherited from NSObject

	readonly contentTransition: NSSymbolContentTransition;

	readonly effect: NSSymbolEffect;

	readonly finished: boolean;

	readonly sender: any;
}

/**
 * @since 7.0
 */
declare const enum UISystemAnimation {

	Delete = 0
}

/**
 * @since 18.0
 */
declare class UITab extends NSObject implements UIAccessibilityIdentification, UIPopoverPresentationControllerSourceItem, UISpringLoadedInteractionSupporting {

	static alloc(): UITab; // inherited from NSObject

	static new(): UITab; // inherited from NSObject

	allowsHiding: boolean;

	badgeValue: string;

	hidden: boolean;

	hiddenByDefault: boolean;

	readonly identifier: string;

	image: UIImage;

	readonly parent: UITabGroup;

	preferredPlacement: UITabPlacement;

	subtitle: string;

	readonly tabBarController: UITabBarController;

	title: string;

	userInfo: any;

	readonly viewController: UIViewController;

	/**
	 * @since 5.0
	 */
	accessibilityIdentifier: string; // inherited from UIAccessibilityIdentification

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	springLoaded: boolean; // inherited from UISpringLoadedInteractionSupporting

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { title: string; image: UIImage; identifier: string; viewControllerProvider: (p1: UITab) => UIViewController; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 17.0
	 */
	frameInView(referenceView: UIView): CGRect;

	initWithTitleImageIdentifierViewControllerProvider(title: string, image: UIImage, identifier: string, viewControllerProvider: (p1: UITab) => UIViewController): this;

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
 * @since 2.0
 */
declare class UITabBar extends UIView implements UISpringLoadedInteractionSupporting {

	static alloc(): UITabBar; // inherited from NSObject

	static appearance(): UITabBar; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UITabBar; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UITabBar; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UITabBar; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UITabBar; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UITabBar; // inherited from UIAppearance

	static new(): UITabBar; // inherited from NSObject

	/**
	 * @since 5.0
	 */
	backgroundImage: UIImage;

	/**
	 * @since 7.0
	 */
	barStyle: UIBarStyle;

	/**
	 * @since 7.0
	 */
	barTintColor: UIColor;

	readonly customizing: boolean;

	delegate: UITabBarDelegate;

	/**
	 * @since 7.0
	 */
	itemPositioning: UITabBarItemPositioning;

	/**
	 * @since 7.0
	 */
	itemSpacing: number;

	/**
	 * @since 7.0
	 */
	itemWidth: number;

	items: NSArray<UITabBarItem>;

	/**
	 * @since 15.0
	 */
	scrollEdgeAppearance: UITabBarAppearance;

	/**
	 * @since 5.0
	 * @deprecated 8.0
	 */
	selectedImageTintColor: UIColor;

	selectedItem: UITabBarItem;

	/**
	 * @since 5.0
	 */
	selectionIndicatorImage: UIImage;

	/**
	 * @since 6.0
	 */
	shadowImage: UIImage;

	/**
	 * @since 13.0
	 */
	standardAppearance: UITabBarAppearance;

	/**
	 * @since 7.0
	 */
	translucent: boolean;

	/**
	 * @since 10.0
	 */
	unselectedItemTintColor: UIColor;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	springLoaded: boolean; // inherited from UISpringLoadedInteractionSupporting

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	beginCustomizingItems(items: NSArray<UITabBarItem> | UITabBarItem[]): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	endCustomizingAnimated(animated: boolean): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	setItemsAnimated(items: NSArray<UITabBarItem> | UITabBarItem[], animated: boolean): void;
}

/**
 * @since 13.0
 */
declare class UITabBarAppearance extends UIBarAppearance {

	static alloc(): UITabBarAppearance; // inherited from NSObject

	static new(): UITabBarAppearance; // inherited from NSObject

	compactInlineLayoutAppearance: UITabBarItemAppearance;

	inlineLayoutAppearance: UITabBarItemAppearance;

	selectionIndicatorImage: UIImage;

	selectionIndicatorTintColor: UIColor;

	stackedItemPositioning: UITabBarItemPositioning;

	stackedItemSpacing: number;

	stackedItemWidth: number;

	stackedLayoutAppearance: UITabBarItemAppearance;
}

/**
 * @since 2.0
 */
declare class UITabBarController extends UIViewController implements NSCoding, UITabBarDelegate {

	static alloc(): UITabBarController; // inherited from NSObject

	static new(): UITabBarController; // inherited from NSObject

	/**
	 * @since 18.0
	 */
	compactTabIdentifiers: NSArray<string>;

	customizableViewControllers: NSArray<UIViewController>;

	/**
	 * @since 18.0
	 */
	customizationIdentifier: string;

	delegate: UITabBarControllerDelegate;

	/**
	 * @since 18.0
	 */
	mode: UITabBarControllerMode;

	readonly moreNavigationController: UINavigationController;

	selectedIndex: number;

	/**
	 * @since 18.0
	 */
	selectedTab: UITab;

	selectedViewController: UIViewController;

	/**
	 * @since 18.0
	 */
	readonly sidebar: UITabBarControllerSidebar;

	/**
	 * @since 3.0
	 */
	readonly tabBar: UITabBar;

	/**
	 * @since 18.0
	 */
	tabBarHidden: boolean;

	/**
	 * @since 18.0
	 */
	tabs: NSArray<UITab>;

	viewControllers: NSArray<UIViewController>;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 18.0
	 */
	constructor(o: { tabs: NSArray<UITab> | UITab[]; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 18.0
	 */
	initWithTabs(tabs: NSArray<UITab> | UITab[]): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 18.0
	 */
	setTabBarHiddenAnimated(hidden: boolean, animated: boolean): void;

	/**
	 * @since 18.0
	 */
	setTabsAnimated(tabs: NSArray<UITab> | UITab[], animated: boolean): void;

	setViewControllersAnimated(viewControllers: NSArray<UIViewController> | UIViewController[], animated: boolean): void;

	tabBarDidBeginCustomizingItems(tabBar: UITabBar, items: NSArray<UITabBarItem> | UITabBarItem[]): void;

	tabBarDidEndCustomizingItemsChanged(tabBar: UITabBar, items: NSArray<UITabBarItem> | UITabBarItem[], changed: boolean): void;

	tabBarDidSelectItem(tabBar: UITabBar, item: UITabBarItem): void;

	tabBarWillBeginCustomizingItems(tabBar: UITabBar, items: NSArray<UITabBarItem> | UITabBarItem[]): void;

	tabBarWillEndCustomizingItemsChanged(tabBar: UITabBar, items: NSArray<UITabBarItem> | UITabBarItem[], changed: boolean): void;

	/**
	 * @since 18.0
	 */
	tabForIdentifier(identifier: string): UITab;
}

interface UITabBarControllerDelegate extends NSObjectProtocol {

	/**
	 * @since 7.0
	 */
	tabBarControllerAnimationControllerForTransitionFromViewControllerToViewController?(tabBarController: UITabBarController, fromVC: UIViewController, toVC: UIViewController): UIViewControllerAnimatedTransitioning;

	tabBarControllerDidEndCustomizingViewControllersChanged?(tabBarController: UITabBarController, viewControllers: NSArray<UIViewController> | UIViewController[], changed: boolean): void;

	/**
	 * @since 18.0
	 */
	tabBarControllerDidEndEditing?(tabBarController: UITabBarController): void;

	/**
	 * @since 18.0
	 */
	tabBarControllerDidSelectTabPreviousTab?(tabBarController: UITabBarController, tab: UITab, tab2: UITab): void;

	tabBarControllerDidSelectViewController?(tabBarController: UITabBarController, viewController: UIViewController): void;

	/**
	 * @since 18.0
	 */
	tabBarControllerDisplayOrderDidChangeForGroup?(tabBarController: UITabBarController, group: UITabGroup): void;

	/**
	 * @since 7.0
	 */
	tabBarControllerInteractionControllerForAnimationController?(tabBarController: UITabBarController, animationController: UIViewControllerAnimatedTransitioning): UIViewControllerInteractiveTransitioning;

	/**
	 * @since 7.0
	 */
	tabBarControllerPreferredInterfaceOrientationForPresentation?(tabBarController: UITabBarController): UIInterfaceOrientation;

	/**
	 * @since 18.0
	 */
	tabBarControllerShouldSelectTab?(tabBarController: UITabBarController, tab: UITab): boolean;

	/**
	 * @since 3.0
	 */
	tabBarControllerShouldSelectViewController?(tabBarController: UITabBarController, viewController: UIViewController): boolean;

	/**
	 * @since 7.0
	 */
	tabBarControllerSupportedInterfaceOrientations?(tabBarController: UITabBarController): UIInterfaceOrientationMask;

	/**
	 * @since 18.0
	 */
	tabBarControllerTabAcceptItemsFromDropSession?(tabBarController: UITabBarController, tab: UITab, session: UIDropSession): void;

	/**
	 * @since 18.0
	 */
	tabBarControllerTabOperationForAcceptingItemsFromDropSession?(tabBarController: UITabBarController, tab: UITab, session: UIDropSession): UIDropOperation;

	/**
	 * @since 18.0
	 */
	tabBarControllerVisibilityDidChangeForTabs?(tabBarController: UITabBarController, tabs: NSArray<UITab> | UITab[]): void;

	/**
	 * @since 3.0
	 */
	tabBarControllerWillBeginCustomizingViewControllers?(tabBarController: UITabBarController, viewControllers: NSArray<UIViewController> | UIViewController[]): void;

	/**
	 * @since 18.0
	 */
	tabBarControllerWillBeginEditing?(tabBarController: UITabBarController): void;

	/**
	 * @since 3.0
	 */
	tabBarControllerWillEndCustomizingViewControllersChanged?(tabBarController: UITabBarController, viewControllers: NSArray<UIViewController> | UIViewController[], changed: boolean): void;
}
declare var UITabBarControllerDelegate: {

	prototype: UITabBarControllerDelegate;
};

/**
 * @since 18.0
 */
declare const enum UITabBarControllerMode {

	Automatic = 0,

	TabBar = 1,

	TabSidebar = 2
}

/**
 * @since 18.0
 */
declare class UITabBarControllerSidebar extends NSObject {

	static alloc(): UITabBarControllerSidebar; // inherited from NSObject

	static new(): UITabBarControllerSidebar; // inherited from NSObject

	bottomBarView: UIView;

	delegate: UITabBarControllerSidebarDelegate;

	footerContentConfiguration: UIContentConfiguration;

	headerContentConfiguration: UIContentConfiguration;

	hidden: boolean;

	preferredLayout: UITabBarControllerSidebarLayout;

	reconfigureItemForTab(tab: UITab): void;

	scrollToTargetAnimated(target: UITabSidebarScrollTarget, animated: boolean): void;
}

/**
 * @since 18.0
 */
interface UITabBarControllerSidebarDelegate extends NSObjectProtocol {

	tabBarControllerSidebarContextMenuConfigurationForTab?(tabBarController: UITabBarController, sidebar: UITabBarControllerSidebar, tab: UITab): UIContextMenuConfiguration;

	tabBarControllerSidebarDidEndDisplayingTab?(tabBarController: UITabBarController, sidebar: UITabBarControllerSidebar, tab: UITab): void;

	tabBarControllerSidebarItemForRequest?(tabBarController: UITabBarController, sidebar: UITabBarControllerSidebar, request: UITabSidebarItemRequest): UITabSidebarItem;

	tabBarControllerSidebarLeadingSwipeActionsConfigurationForTab?(tabBarController: UITabBarController, sidebar: UITabBarControllerSidebar, tab: UITab): UISwipeActionsConfiguration;

	tabBarControllerSidebarTrailingSwipeActionsConfigurationForTab?(tabBarController: UITabBarController, sidebar: UITabBarControllerSidebar, tab: UITab): UISwipeActionsConfiguration;

	tabBarControllerSidebarUpdateItem?(tabBarController: UITabBarController, sidebar: UITabBarControllerSidebar, item: UITabSidebarItem): void;

	tabBarControllerSidebarVisibilityDidChange?(tabBarController: UITabBarController, sidebar: UITabBarControllerSidebar): void;

	tabBarControllerSidebarWillBeginDisplayingTab?(tabBarController: UITabBarController, sidebar: UITabBarControllerSidebar, tab: UITab): void;
}
declare var UITabBarControllerSidebarDelegate: {

	prototype: UITabBarControllerSidebarDelegate;
};

/**
 * @since 18.0
 */
declare const enum UITabBarControllerSidebarLayout {

	Automatic = 0,

	Overlap = 1,

	Tile = 2
}

interface UITabBarDelegate extends NSObjectProtocol {

	tabBarDidBeginCustomizingItems?(tabBar: UITabBar, items: NSArray<UITabBarItem> | UITabBarItem[]): void;

	tabBarDidEndCustomizingItemsChanged?(tabBar: UITabBar, items: NSArray<UITabBarItem> | UITabBarItem[], changed: boolean): void;

	tabBarDidSelectItem?(tabBar: UITabBar, item: UITabBarItem): void;

	tabBarWillBeginCustomizingItems?(tabBar: UITabBar, items: NSArray<UITabBarItem> | UITabBarItem[]): void;

	tabBarWillEndCustomizingItemsChanged?(tabBar: UITabBar, items: NSArray<UITabBarItem> | UITabBarItem[], changed: boolean): void;
}
declare var UITabBarDelegate: {

	prototype: UITabBarDelegate;
};

/**
 * @since 2.0
 */
declare class UITabBarItem extends UIBarItem implements UIPopoverPresentationControllerSourceItem, UISpringLoadedInteractionSupporting {

	static alloc(): UITabBarItem; // inherited from NSObject

	static appearance(): UITabBarItem; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UITabBarItem; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UITabBarItem; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UITabBarItem; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UITabBarItem; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UITabBarItem; // inherited from UIAppearance

	static new(): UITabBarItem; // inherited from NSObject

	/**
	 * @since 10.0
	 */
	badgeColor: UIColor;

	badgeValue: string;

	/**
	 * @since 15.0
	 */
	scrollEdgeAppearance: UITabBarAppearance;

	/**
	 * @since 7.0
	 */
	selectedImage: UIImage;

	/**
	 * @since 13.0
	 */
	standardAppearance: UITabBarAppearance;

	/**
	 * @since 5.0
	 */
	titlePositionAdjustment: UIOffset;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	springLoaded: boolean; // inherited from UISpringLoadedInteractionSupporting

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { tabBarSystemItem: UITabBarSystemItem; tag: number; });

	/**
	 * @since 7.0
	 */
	constructor(o: { title: string; image: UIImage; selectedImage: UIImage; });

	constructor(o: { title: string; image: UIImage; tag: number; });

	/**
	 * @since 10.0
	 */
	badgeTextAttributesForState(state: UIControlState): NSDictionary<string, any>;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 5.0
	 * @deprecated 7.0
	 */
	finishedSelectedImage(): UIImage;

	/**
	 * @since 5.0
	 * @deprecated 7.0
	 */
	finishedUnselectedImage(): UIImage;

	/**
	 * @since 17.0
	 */
	frameInView(referenceView: UIView): CGRect;

	initWithTabBarSystemItemTag(systemItem: UITabBarSystemItem, tag: number): this;

	/**
	 * @since 7.0
	 */
	initWithTitleImageSelectedImage(title: string, image: UIImage, selectedImage: UIImage): this;

	initWithTitleImageTag(title: string, image: UIImage, tag: number): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 10.0
	 */
	setBadgeTextAttributesForState(textAttributes: NSDictionary<string, any>, state: UIControlState): void;

	/**
	 * @since 5.0
	 * @deprecated 7.0
	 */
	setFinishedSelectedImageWithFinishedUnselectedImage(selectedImage: UIImage, unselectedImage: UIImage): void;
}

/**
 * @since 13.0
 */
declare class UITabBarItemAppearance extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UITabBarItemAppearance; // inherited from NSObject

	static new(): UITabBarItemAppearance; // inherited from NSObject

	readonly disabled: UITabBarItemStateAppearance;

	readonly focused: UITabBarItemStateAppearance;

	readonly normal: UITabBarItemStateAppearance;

	readonly selected: UITabBarItemStateAppearance;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { style: UITabBarItemAppearanceStyle; });

	configureWithDefaultForStyle(style: UITabBarItemAppearanceStyle): void;

	copy(): this;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithStyle(style: UITabBarItemAppearanceStyle): this;
}

declare const enum UITabBarItemAppearanceStyle {

	Stacked = 0,

	Inline = 1,

	CompactInline = 2
}

/**
 * @since 7.0
 */
declare const enum UITabBarItemPositioning {

	Automatic = 0,

	Fill = 1,

	Centered = 2
}

/**
 * @since 13.0
 */
declare class UITabBarItemStateAppearance extends NSObject {

	static alloc(): UITabBarItemStateAppearance; // inherited from NSObject

	static new(): UITabBarItemStateAppearance; // inherited from NSObject

	badgeBackgroundColor: UIColor;

	badgePositionAdjustment: UIOffset;

	badgeTextAttributes: NSDictionary<string, any>;

	badgeTitlePositionAdjustment: UIOffset;

	iconColor: UIColor;

	titlePositionAdjustment: UIOffset;

	titleTextAttributes: NSDictionary<string, any>;
}

declare const enum UITabBarSystemItem {

	More = 0,

	Favorites = 1,

	Featured = 2,

	TopRated = 3,

	Recents = 4,

	Contacts = 5,

	History = 6,

	Bookmarks = 7,

	Search = 8,

	Downloads = 9,

	MostRecent = 10,

	MostViewed = 11
}

/**
 * @since 18.0
 */
declare class UITabGroup extends UITab {

	static alloc(): UITabGroup; // inherited from NSObject

	static new(): UITabGroup; // inherited from NSObject

	allowsReordering: boolean;

	children: NSArray<UITab>;

	defaultChildIdentifier: string;

	readonly displayOrder: NSArray<UITab>;

	displayOrderIdentifiers: NSArray<string>;

	managingNavigationController: UINavigationController;

	selectedChild: UITab;

	sidebarActions: NSArray<UIAction>;

	sidebarAppearance: UITabGroupSidebarAppearance;

	constructor(o: { title: string; image: UIImage; identifier: string; children: NSArray<UITab> | UITab[]; viewControllerProvider: (p1: UITab) => UIViewController; });

	initWithTitleImageIdentifierChildrenViewControllerProvider(title: string, image: UIImage, identifier: string, children: NSArray<UITab> | UITab[], viewControllerProvider: (p1: UITab) => UIViewController): this;

	tabForIdentifier(identifier: string): UITab;
}

/**
 * @since 18.0
 */
declare const enum UITabGroupSidebarAppearance {

	Automatic = 0,

	Inline = 1,

	RootSection = 2
}

/**
 * @since 18.0
 */
declare const enum UITabPlacement {

	Automatic = 0,

	Default = 1,

	Optional = 2,

	Movable = 3,

	Pinned = 4,

	Fixed = 5,

	SidebarOnly = 6
}

/**
 * @since 18.0
 */
declare class UITabSidebarItem extends NSObject implements NSCopying {

	static alloc(): UITabSidebarItem; // inherited from NSObject

	static itemFromRequest(request: UITabSidebarItemRequest): UITabSidebarItem;

	static new(): UITabSidebarItem; // inherited from NSObject

	accessories: NSArray<UICellAccessory>;

	readonly action: UIAction;

	backgroundConfiguration: UIBackgroundConfiguration;

	readonly configurationState: UICellConfigurationState;

	contentConfiguration: UIContentConfiguration;

	readonly tab: UITab;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	defaultBackgroundConfiguration(): UIBackgroundConfiguration;

	defaultContentConfiguration(): UIListContentConfiguration;
}

/**
 * @since 18.0
 */
declare class UITabSidebarItemRequest extends NSObject {

	static alloc(): UITabSidebarItemRequest; // inherited from NSObject

	static new(): UITabSidebarItemRequest; // inherited from NSObject

	readonly action: UIAction;

	readonly tab: UITab;
}

/**
 * @since 18.0
 */
declare class UITabSidebarScrollTarget extends NSObject {

	static alloc(): UITabSidebarScrollTarget; // inherited from NSObject

	static new(): UITabSidebarScrollTarget; // inherited from NSObject

	static targetForFooter(): UITabSidebarScrollTarget;

	static targetForHeader(): UITabSidebarScrollTarget;

	static targetForTab(tab: UITab): UITabSidebarScrollTarget;
}

/**
 * @since 2.0
 */
declare class UITableView extends UIScrollView implements NSCoding, UIDataSourceTranslating, UISpringLoadedInteractionSupporting {

	static alloc(): UITableView; // inherited from NSObject

	static appearance(): UITableView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UITableView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UITableView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UITableView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UITableView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UITableView; // inherited from UIAppearance

	static new(): UITableView; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	allowsFocus: boolean;

	/**
	 * @since 15.0
	 */
	allowsFocusDuringEditing: boolean;

	/**
	 * @since 5.0
	 */
	allowsMultipleSelection: boolean;

	/**
	 * @since 5.0
	 */
	allowsMultipleSelectionDuringEditing: boolean;

	/**
	 * @since 3.0
	 */
	allowsSelection: boolean;

	allowsSelectionDuringEditing: boolean;

	/**
	 * @since 3.2
	 */
	backgroundView: UIView;

	/**
	 * @since 9.0
	 */
	cellLayoutMarginsFollowReadableWidth: boolean;

	/**
	 * @since 18.0
	 */
	contentHuggingElements: UITableViewContentHuggingElements;

	/**
	 * @since 14.0
	 */
	readonly contextMenuInteraction: UIContextMenuInteraction;

	dataSource: UITableViewDataSource;

	delegate: UITableViewDelegate;

	/**
	 * @since 11.0
	 */
	dragDelegate: UITableViewDragDelegate;

	/**
	 * @since 11.0
	 */
	dragInteractionEnabled: boolean;

	/**
	 * @since 11.0
	 */
	dropDelegate: UITableViewDropDelegate;

	editing: boolean;

	/**
	 * @since 7.0
	 */
	estimatedRowHeight: number;

	/**
	 * @since 7.0
	 */
	estimatedSectionFooterHeight: number;

	/**
	 * @since 7.0
	 */
	estimatedSectionHeaderHeight: number;

	/**
	 * @since 15.0
	 */
	fillerRowHeight: number;

	/**
	 * @since 11.0
	 */
	readonly hasActiveDrag: boolean;

	/**
	 * @since 11.0
	 */
	readonly hasActiveDrop: boolean;

	/**
	 * @since 11.0
	 */
	readonly hasUncommittedUpdates: boolean;

	readonly indexPathForSelectedRow: NSIndexPath;

	/**
	 * @since 5.0
	 */
	readonly indexPathsForSelectedRows: NSArray<NSIndexPath>;

	readonly indexPathsForVisibleRows: NSArray<NSIndexPath>;

	/**
	 * @since 11.0
	 */
	insetsContentViewsToSafeArea: boolean;

	readonly numberOfSections: number;

	/**
	 * @since 10.0
	 */
	prefetchDataSource: UITableViewDataSourcePrefetching;

	/**
	 * @since 15.0
	 */
	prefetchingEnabled: boolean;

	/**
	 * @since 9.0
	 */
	remembersLastFocusedIndexPath: boolean;

	rowHeight: number;

	sectionFooterHeight: number;

	sectionHeaderHeight: number;

	/**
	 * @since 15.0
	 */
	sectionHeaderTopPadding: number;

	/**
	 * @since 7.0
	 */
	sectionIndexBackgroundColor: UIColor;

	/**
	 * @since 6.0
	 */
	sectionIndexColor: UIColor;

	sectionIndexMinimumDisplayRowCount: number;

	/**
	 * @since 6.0
	 */
	sectionIndexTrackingBackgroundColor: UIColor;

	/**
	 * @since 14.0
	 */
	selectionFollowsFocus: boolean;

	/**
	 * @since 16.0
	 */
	selfSizingInvalidation: UITableViewSelfSizingInvalidation;

	separatorColor: UIColor;

	/**
	 * @since 8.0
	 */
	separatorEffect: UIVisualEffect;

	/**
	 * @since 7.0
	 */
	separatorInset: UIEdgeInsets;

	/**
	 * @since 11.0
	 */
	separatorInsetReference: UITableViewSeparatorInsetReference;

	separatorStyle: UITableViewCellSeparatorStyle;

	readonly style: UITableViewStyle;

	tableFooterView: UIView;

	tableHeaderView: UIView;

	readonly visibleCells: NSArray<UITableViewCell>;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	springLoaded: boolean; // inherited from UISpringLoadedInteractionSupporting

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { frame: CGRect; style: UITableViewStyle; });

	beginUpdates(): void;

	cellForRowAtIndexPath(indexPath: NSIndexPath): UITableViewCell;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	dataSourceIndexPathForPresentationIndexPath(presentationIndexPath: NSIndexPath): NSIndexPath;

	dataSourceSectionIndexForPresentationSectionIndex(presentationSectionIndex: number): number;

	deleteRowsAtIndexPathsWithRowAnimation(indexPaths: NSArray<NSIndexPath> | NSIndexPath[], animation: UITableViewRowAnimation): void;

	deleteSectionsWithRowAnimation(sections: NSIndexSet, animation: UITableViewRowAnimation): void;

	dequeueReusableCellWithIdentifier(identifier: string): UITableViewCell;

	/**
	 * @since 6.0
	 */
	dequeueReusableCellWithIdentifierForIndexPath(identifier: string, indexPath: NSIndexPath): UITableViewCell;

	/**
	 * @since 6.0
	 */
	dequeueReusableHeaderFooterViewWithIdentifier(identifier: string): UITableViewHeaderFooterView;

	deselectRowAtIndexPathAnimated(indexPath: NSIndexPath, animated: boolean): void;

	encodeWithCoder(coder: NSCoder): void;

	endUpdates(): void;

	/**
	 * @since 6.0
	 */
	footerViewForSection(section: number): UITableViewHeaderFooterView;

	/**
	 * @since 6.0
	 */
	headerViewForSection(section: number): UITableViewHeaderFooterView;

	indexPathForCell(cell: UITableViewCell): NSIndexPath;

	indexPathForRowAtPoint(point: CGPoint): NSIndexPath;

	indexPathsForRowsInRect(rect: CGRect): NSArray<NSIndexPath>;

	initWithCoder(coder: NSCoder): this;

	initWithFrameStyle(frame: CGRect, style: UITableViewStyle): this;

	insertRowsAtIndexPathsWithRowAnimation(indexPaths: NSArray<NSIndexPath> | NSIndexPath[], animation: UITableViewRowAnimation): void;

	insertSectionsWithRowAnimation(sections: NSIndexSet, animation: UITableViewRowAnimation): void;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	/**
	 * @since 5.0
	 */
	moveRowAtIndexPathToIndexPath(indexPath: NSIndexPath, newIndexPath: NSIndexPath): void;

	/**
	 * @since 5.0
	 */
	moveSectionToSection(section: number, newSection: number): void;

	numberOfRowsInSection(section: number): number;

	/**
	 * @since 11.0
	 */
	performBatchUpdatesCompletion(updates: () => void, completion: (p1: boolean) => void): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	performUsingPresentationValues(actionsToTranslate: () => void): void;

	presentationIndexPathForDataSourceIndexPath(dataSourceIndexPath: NSIndexPath): NSIndexPath;

	presentationSectionIndexForDataSourceSectionIndex(dataSourceSectionIndex: number): number;

	/**
	 * @since 15.0
	 */
	reconfigureRowsAtIndexPaths(indexPaths: NSArray<NSIndexPath> | NSIndexPath[]): void;

	rectForFooterInSection(section: number): CGRect;

	rectForHeaderInSection(section: number): CGRect;

	rectForRowAtIndexPath(indexPath: NSIndexPath): CGRect;

	rectForSection(section: number): CGRect;

	/**
	 * @since 6.0
	 */
	registerClassForCellReuseIdentifier(cellClass: typeof NSObject, identifier: string): void;

	/**
	 * @since 6.0
	 */
	registerClassForHeaderFooterViewReuseIdentifier(aClass: typeof NSObject, identifier: string): void;

	/**
	 * @since 5.0
	 */
	registerNibForCellReuseIdentifier(nib: UINib, identifier: string): void;

	/**
	 * @since 6.0
	 */
	registerNibForHeaderFooterViewReuseIdentifier(nib: UINib, identifier: string): void;

	reloadData(): void;

	/**
	 * @since 3.0
	 */
	reloadRowsAtIndexPathsWithRowAnimation(indexPaths: NSArray<NSIndexPath> | NSIndexPath[], animation: UITableViewRowAnimation): void;

	/**
	 * @since 3.0
	 */
	reloadSectionIndexTitles(): void;

	/**
	 * @since 3.0
	 */
	reloadSectionsWithRowAnimation(sections: NSIndexSet, animation: UITableViewRowAnimation): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	scrollToNearestSelectedRowAtScrollPositionAnimated(scrollPosition: UITableViewScrollPosition, animated: boolean): void;

	scrollToRowAtIndexPathAtScrollPositionAnimated(indexPath: NSIndexPath, scrollPosition: UITableViewScrollPosition, animated: boolean): void;

	selectRowAtIndexPathAnimatedScrollPosition(indexPath: NSIndexPath, animated: boolean, scrollPosition: UITableViewScrollPosition): void;

	self(): this;

	setEditingAnimated(editing: boolean, animated: boolean): void;
}

/**
 * @since 5.0
 */
declare var UITableViewAutomaticDimension: number;

/**
 * @since 2.0
 */
declare class UITableViewCell extends UIView implements NSCoding, UIGestureRecognizerDelegate {

	static alloc(): UITableViewCell; // inherited from NSObject

	static appearance(): UITableViewCell; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UITableViewCell; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UITableViewCell; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UITableViewCell; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UITableViewCell; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UITableViewCell; // inherited from UIAppearance

	static new(): UITableViewCell; // inherited from NSObject

	/**
	 * @since 2.0
	 * @deprecated 3.0
	 */
	accessoryAction: string;

	accessoryType: UITableViewCellAccessoryType;

	accessoryView: UIView;

	/**
	 * @since 14.0
	 */
	automaticallyUpdatesBackgroundConfiguration: boolean;

	/**
	 * @since 14.0
	 */
	automaticallyUpdatesContentConfiguration: boolean;

	/**
	 * @since 14.0
	 */
	backgroundConfiguration: UIBackgroundConfiguration;

	backgroundView: UIView;

	/**
	 * @since 14.0
	 */
	readonly configurationState: UICellConfigurationState;

	/**
	 * @since 15.0
	 */
	configurationUpdateHandler: (p1: UITableViewCell, p2: UICellConfigurationState) => void;

	/**
	 * @since 14.0
	 */
	contentConfiguration: UIContentConfiguration;

	readonly contentView: UIView;

	/**
	 * @since 3.0
	 * @deprecated 100000
	 */
	readonly detailTextLabel: UILabel;

	/**
	 * @since 2.0
	 * @deprecated 3.0
	 */
	editAction: string;

	editing: boolean;

	editingAccessoryType: UITableViewCellAccessoryType;

	editingAccessoryView: UIView;

	readonly editingStyle: UITableViewCellEditingStyle;

	/**
	 * @since 9.0
	 */
	focusStyle: UITableViewCellFocusStyle;

	/**
	 * @since 2.0
	 * @deprecated 3.0
	 */
	font: UIFont;

	/**
	 * @since 2.0
	 * @deprecated 3.0
	 */
	hidesAccessoryWhenEditing: boolean;

	highlighted: boolean;

	/**
	 * @since 2.0
	 * @deprecated 3.0
	 */
	image: UIImage;

	/**
	 * @since 3.0
	 * @deprecated 100000
	 */
	readonly imageView: UIImageView;

	indentationLevel: number;

	indentationWidth: number;

	/**
	 * @since 2.0
	 * @deprecated 3.0
	 */
	lineBreakMode: NSLineBreakMode;

	/**
	 * @since 5.0
	 */
	multipleSelectionBackgroundView: UIView;

	readonly reuseIdentifier: string;

	selected: boolean;

	selectedBackgroundView: UIView;

	/**
	 * @since 2.0
	 * @deprecated 3.0
	 */
	selectedImage: UIImage;

	/**
	 * @since 2.0
	 * @deprecated 3.0
	 */
	selectedTextColor: UIColor;

	selectionStyle: UITableViewCellSelectionStyle;

	/**
	 * @since 7.0
	 */
	separatorInset: UIEdgeInsets;

	shouldIndentWhileEditing: boolean;

	readonly showingDeleteConfirmation: boolean;

	showsReorderControl: boolean;

	/**
	 * @since 2.0
	 * @deprecated 3.0
	 */
	target: any;

	/**
	 * @since 2.0
	 * @deprecated 3.0
	 */
	text: string;

	/**
	 * @since 2.0
	 * @deprecated 3.0
	 */
	textAlignment: NSTextAlignment;

	/**
	 * @since 2.0
	 * @deprecated 3.0
	 */
	textColor: UIColor;

	/**
	 * @since 3.0
	 * @deprecated 100000
	 */
	readonly textLabel: UILabel;

	/**
	 * @since 11.0
	 */
	userInteractionEnabledWhileDragging: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 2.0
	 * @deprecated 3.0
	 */
	constructor(o: { frame: CGRect; reuseIdentifier: string; });

	/**
	 * @since 3.0
	 */
	constructor(o: { style: UITableViewCellStyle; reuseIdentifier: string; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 16.0
	 */
	defaultBackgroundConfiguration(): UIBackgroundConfiguration;

	/**
	 * @since 14.0
	 */
	defaultContentConfiguration(): UIListContentConfiguration;

	/**
	 * @since 3.0
	 */
	didTransitionToState(state: UITableViewCellStateMask): void;

	/**
	 * @since 11.0
	 */
	dragStateDidChange(dragState: UITableViewCellDragState): void;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 7.0
	 */
	gestureRecognizerShouldBeRequiredToFailByGestureRecognizer(gestureRecognizer: UIGestureRecognizer, otherGestureRecognizer: UIGestureRecognizer): boolean;

	gestureRecognizerShouldBegin(gestureRecognizer: UIGestureRecognizer): boolean;

	/**
	 * @since 13.4
	 */
	gestureRecognizerShouldReceiveEvent(gestureRecognizer: UIGestureRecognizer, event: _UIEvent): boolean;

	gestureRecognizerShouldReceivePress(gestureRecognizer: UIGestureRecognizer, press: UIPress): boolean;

	gestureRecognizerShouldReceiveTouch(gestureRecognizer: UIGestureRecognizer, touch: UITouch): boolean;

	gestureRecognizerShouldRecognizeSimultaneouslyWithGestureRecognizer(gestureRecognizer: UIGestureRecognizer, otherGestureRecognizer: UIGestureRecognizer): boolean;

	/**
	 * @since 7.0
	 */
	gestureRecognizerShouldRequireFailureOfGestureRecognizer(gestureRecognizer: UIGestureRecognizer, otherGestureRecognizer: UIGestureRecognizer): boolean;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 2.0
	 * @deprecated 3.0
	 */
	initWithFrameReuseIdentifier(frame: CGRect, reuseIdentifier: string): this;

	/**
	 * @since 3.0
	 */
	initWithStyleReuseIdentifier(style: UITableViewCellStyle, reuseIdentifier: string): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	prepareForReuse(): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	setEditingAnimated(editing: boolean, animated: boolean): void;

	setHighlightedAnimated(highlighted: boolean, animated: boolean): void;

	/**
	 * @since 14.0
	 */
	setNeedsUpdateConfiguration(): void;

	setSelectedAnimated(selected: boolean, animated: boolean): void;

	/**
	 * @since 14.0
	 */
	updateConfigurationUsingState(state: UICellConfigurationState): void;

	/**
	 * @since 3.0
	 */
	willTransitionToState(state: UITableViewCellStateMask): void;
}

declare const enum UITableViewCellAccessoryType {

	None = 0,

	DisclosureIndicator = 1,

	DetailDisclosureButton = 2,

	Checkmark = 3,

	DetailButton = 4
}

/**
 * @since 11.0
 */
declare const enum UITableViewCellDragState {

	None = 0,

	Lifting = 1,

	Dragging = 2
}

declare const enum UITableViewCellEditingStyle {

	None = 0,

	Delete = 1,

	Insert = 2
}

/**
 * @since 9.0
 */
declare const enum UITableViewCellFocusStyle {

	Default = 0,

	Custom = 1
}

declare const enum UITableViewCellSelectionStyle {

	None = 0,

	Blue = 1,

	Gray = 2,

	Default = 3
}

declare const enum UITableViewCellSeparatorStyle {

	None = 0,

	SingleLine = 1,

	SingleLineEtched = 2
}

declare const enum UITableViewCellStateMask {

	DefaultMask = 0,

	ShowingEditControlMask = 1,

	ShowingDeleteConfirmationMask = 2
}

declare const enum UITableViewCellStyle {

	Default = 0,

	Value1 = 1,

	Value2 = 2,

	Subtitle = 3
}

/**
 * @since 18.0
 */
declare const enum UITableViewContentHuggingElements {

	None = 0,

	SectionHeaders = 1
}

/**
 * @since 2.0
 */
declare class UITableViewController extends UIViewController implements UITableViewDataSource, UITableViewDelegate {

	static alloc(): UITableViewController; // inherited from NSObject

	static new(): UITableViewController; // inherited from NSObject

	/**
	 * @since 3.2
	 */
	clearsSelectionOnViewWillAppear: boolean;

	/**
	 * @since 6.0
	 */
	refreshControl: UIRefreshControl;

	tableView: UITableView;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { style: UITableViewStyle; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 9.0
	 */
	indexPathForPreferredFocusedViewInTableView(tableView: UITableView): NSIndexPath;

	initWithStyle(style: UITableViewStyle): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	numberOfSectionsInTableView(tableView: UITableView): number;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	/**
	 * @since 11.0
	 */
	scrollViewDidChangeAdjustedContentInset(scrollView: UIScrollView): void;

	scrollViewDidEndDecelerating(scrollView: UIScrollView): void;

	scrollViewDidEndDraggingWillDecelerate(scrollView: UIScrollView, decelerate: boolean): void;

	scrollViewDidEndScrollingAnimation(scrollView: UIScrollView): void;

	scrollViewDidEndZoomingWithViewAtScale(scrollView: UIScrollView, view: UIView, scale: number): void;

	scrollViewDidScroll(scrollView: UIScrollView): void;

	scrollViewDidScrollToTop(scrollView: UIScrollView): void;

	/**
	 * @since 3.2
	 */
	scrollViewDidZoom(scrollView: UIScrollView): void;

	scrollViewShouldScrollToTop(scrollView: UIScrollView): boolean;

	scrollViewWillBeginDecelerating(scrollView: UIScrollView): void;

	scrollViewWillBeginDragging(scrollView: UIScrollView): void;

	/**
	 * @since 3.2
	 */
	scrollViewWillBeginZoomingWithView(scrollView: UIScrollView, view: UIView): void;

	/**
	 * @since 5.0
	 */
	scrollViewWillEndDraggingWithVelocityTargetContentOffset(scrollView: UIScrollView, velocity: CGPoint, targetContentOffset: interop.Pointer | interop.Reference<CGPoint>): void;

	sectionIndexTitlesForTableView(tableView: UITableView): NSArray<string>;

	self(): this;

	tableViewAccessoryButtonTappedForRowWithIndexPath(tableView: UITableView, indexPath: NSIndexPath): void;

	/**
	 * @since 2.0
	 * @deprecated 3.0
	 */
	tableViewAccessoryTypeForRowWithIndexPath(tableView: UITableView, indexPath: NSIndexPath): UITableViewCellAccessoryType;

	tableViewCanEditRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): boolean;

	/**
	 * @since 9.0
	 */
	tableViewCanFocusRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): boolean;

	tableViewCanMoveRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): boolean;

	/**
	 * @since 5.0
	 * @deprecated 13.0
	 */
	tableViewCanPerformActionForRowAtIndexPathWithSender(tableView: UITableView, action: string, indexPath: NSIndexPath, sender: any): boolean;

	/**
	 * @since 16.0
	 */
	tableViewCanPerformPrimaryActionForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): boolean;

	tableViewCellForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): UITableViewCell;

	tableViewCommitEditingStyleForRowAtIndexPath(tableView: UITableView, editingStyle: UITableViewCellEditingStyle, indexPath: NSIndexPath): void;

	/**
	 * @since 13.0
	 */
	tableViewContextMenuConfigurationForRowAtIndexPathPoint(tableView: UITableView, indexPath: NSIndexPath, point: CGPoint): UIContextMenuConfiguration;

	/**
	 * @since 13.0
	 */
	tableViewDidBeginMultipleSelectionInteractionAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): void;

	/**
	 * @since 3.0
	 */
	tableViewDidDeselectRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): void;

	/**
	 * @since 6.0
	 */
	tableViewDidEndDisplayingCellForRowAtIndexPath(tableView: UITableView, cell: UITableViewCell, indexPath: NSIndexPath): void;

	/**
	 * @since 6.0
	 */
	tableViewDidEndDisplayingFooterViewForSection(tableView: UITableView, view: UIView, section: number): void;

	/**
	 * @since 6.0
	 */
	tableViewDidEndDisplayingHeaderViewForSection(tableView: UITableView, view: UIView, section: number): void;

	tableViewDidEndEditingRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): void;

	/**
	 * @since 13.0
	 */
	tableViewDidEndMultipleSelectionInteraction(tableView: UITableView): void;

	/**
	 * @since 6.0
	 */
	tableViewDidHighlightRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): void;

	tableViewDidSelectRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): void;

	/**
	 * @since 6.0
	 */
	tableViewDidUnhighlightRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): void;

	/**
	 * @since 9.0
	 */
	tableViewDidUpdateFocusInContextWithAnimationCoordinator(tableView: UITableView, context: UITableViewFocusUpdateContext, coordinator: UIFocusAnimationCoordinator): void;

	/**
	 * @since 8.0
	 * @deprecated 13.0
	 */
	tableViewEditActionsForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): NSArray<UITableViewRowAction>;

	tableViewEditingStyleForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): UITableViewCellEditingStyle;

	/**
	 * @since 7.0
	 */
	tableViewEstimatedHeightForFooterInSection(tableView: UITableView, section: number): number;

	/**
	 * @since 7.0
	 */
	tableViewEstimatedHeightForHeaderInSection(tableView: UITableView, section: number): number;

	/**
	 * @since 7.0
	 */
	tableViewEstimatedHeightForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): number;

	tableViewHeightForFooterInSection(tableView: UITableView, section: number): number;

	tableViewHeightForHeaderInSection(tableView: UITableView, section: number): number;

	tableViewHeightForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): number;

	tableViewIndentationLevelForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): number;

	/**
	 * @since 11.0
	 */
	tableViewLeadingSwipeActionsConfigurationForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): UISwipeActionsConfiguration;

	tableViewMoveRowAtIndexPathToIndexPath(tableView: UITableView, sourceIndexPath: NSIndexPath, destinationIndexPath: NSIndexPath): void;

	tableViewNumberOfRowsInSection(tableView: UITableView, section: number): number;

	/**
	 * @since 5.0
	 * @deprecated 13.0
	 */
	tableViewPerformActionForRowAtIndexPathWithSender(tableView: UITableView, action: string, indexPath: NSIndexPath, sender: any): void;

	/**
	 * @since 16.0
	 */
	tableViewPerformPrimaryActionForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): void;

	/**
	 * @since 13.0
	 */
	tableViewPreviewForDismissingContextMenuWithConfiguration(tableView: UITableView, configuration: UIContextMenuConfiguration): UITargetedPreview;

	/**
	 * @since 13.0
	 */
	tableViewPreviewForHighlightingContextMenuWithConfiguration(tableView: UITableView, configuration: UIContextMenuConfiguration): UITargetedPreview;

	tableViewSectionForSectionIndexTitleAtIndex(tableView: UITableView, title: string, index: number): number;

	/**
	 * @since 15.0
	 */
	tableViewSelectionFollowsFocusForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): boolean;

	/**
	 * @since 13.0
	 */
	tableViewShouldBeginMultipleSelectionInteractionAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): boolean;

	/**
	 * @since 6.0
	 */
	tableViewShouldHighlightRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): boolean;

	tableViewShouldIndentWhileEditingRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): boolean;

	/**
	 * @since 5.0
	 * @deprecated 13.0
	 */
	tableViewShouldShowMenuForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): boolean;

	/**
	 * @since 11.0
	 */
	tableViewShouldSpringLoadRowAtIndexPathWithContext(tableView: UITableView, indexPath: NSIndexPath, context: UISpringLoadedInteractionContext): boolean;

	/**
	 * @since 9.0
	 */
	tableViewShouldUpdateFocusInContext(tableView: UITableView, context: UITableViewFocusUpdateContext): boolean;

	tableViewTargetIndexPathForMoveFromRowAtIndexPathToProposedIndexPath(tableView: UITableView, sourceIndexPath: NSIndexPath, proposedDestinationIndexPath: NSIndexPath): NSIndexPath;

	/**
	 * @since 3.0
	 */
	tableViewTitleForDeleteConfirmationButtonForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): string;

	tableViewTitleForFooterInSection(tableView: UITableView, section: number): string;

	tableViewTitleForHeaderInSection(tableView: UITableView, section: number): string;

	/**
	 * @since 11.0
	 */
	tableViewTrailingSwipeActionsConfigurationForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): UISwipeActionsConfiguration;

	tableViewViewForFooterInSection(tableView: UITableView, section: number): UIView;

	tableViewViewForHeaderInSection(tableView: UITableView, section: number): UIView;

	tableViewWillBeginEditingRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): void;

	/**
	 * @since 3.0
	 */
	tableViewWillDeselectRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): NSIndexPath;

	tableViewWillDisplayCellForRowAtIndexPath(tableView: UITableView, cell: UITableViewCell, indexPath: NSIndexPath): void;

	/**
	 * @since 14.0
	 */
	tableViewWillDisplayContextMenuWithConfigurationAnimator(tableView: UITableView, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionAnimating): void;

	/**
	 * @since 6.0
	 */
	tableViewWillDisplayFooterViewForSection(tableView: UITableView, view: UIView, section: number): void;

	/**
	 * @since 6.0
	 */
	tableViewWillDisplayHeaderViewForSection(tableView: UITableView, view: UIView, section: number): void;

	/**
	 * @since 14.0
	 */
	tableViewWillEndContextMenuInteractionWithConfigurationAnimator(tableView: UITableView, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionAnimating): void;

	/**
	 * @since 13.0
	 */
	tableViewWillPerformPreviewActionForMenuWithConfigurationAnimator(tableView: UITableView, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionCommitAnimating): void;

	tableViewWillSelectRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): NSIndexPath;

	viewForZoomingInScrollView(scrollView: UIScrollView): UIView;
}

interface UITableViewDataSource extends NSObjectProtocol {

	numberOfSectionsInTableView?(tableView: UITableView): number;

	sectionIndexTitlesForTableView?(tableView: UITableView): NSArray<string>;

	tableViewCanEditRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): boolean;

	tableViewCanMoveRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): boolean;

	tableViewCellForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): UITableViewCell;

	tableViewCommitEditingStyleForRowAtIndexPath?(tableView: UITableView, editingStyle: UITableViewCellEditingStyle, indexPath: NSIndexPath): void;

	tableViewMoveRowAtIndexPathToIndexPath?(tableView: UITableView, sourceIndexPath: NSIndexPath, destinationIndexPath: NSIndexPath): void;

	tableViewNumberOfRowsInSection(tableView: UITableView, section: number): number;

	tableViewSectionForSectionIndexTitleAtIndex?(tableView: UITableView, title: string, index: number): number;

	tableViewTitleForFooterInSection?(tableView: UITableView, section: number): string;

	tableViewTitleForHeaderInSection?(tableView: UITableView, section: number): string;
}
declare var UITableViewDataSource: {

	prototype: UITableViewDataSource;
};

interface UITableViewDataSourcePrefetching extends NSObjectProtocol {

	tableViewCancelPrefetchingForRowsAtIndexPaths?(tableView: UITableView, indexPaths: NSArray<NSIndexPath> | NSIndexPath[]): void;

	tableViewPrefetchRowsAtIndexPaths(tableView: UITableView, indexPaths: NSArray<NSIndexPath> | NSIndexPath[]): void;
}
declare var UITableViewDataSourcePrefetching: {

	prototype: UITableViewDataSourcePrefetching;
};

interface UITableViewDelegate extends NSObjectProtocol, UIScrollViewDelegate {

	/**
	 * @since 9.0
	 */
	indexPathForPreferredFocusedViewInTableView?(tableView: UITableView): NSIndexPath;

	tableViewAccessoryButtonTappedForRowWithIndexPath?(tableView: UITableView, indexPath: NSIndexPath): void;

	/**
	 * @since 2.0
	 * @deprecated 3.0
	 */
	tableViewAccessoryTypeForRowWithIndexPath?(tableView: UITableView, indexPath: NSIndexPath): UITableViewCellAccessoryType;

	/**
	 * @since 9.0
	 */
	tableViewCanFocusRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): boolean;

	/**
	 * @since 5.0
	 * @deprecated 13.0
	 */
	tableViewCanPerformActionForRowAtIndexPathWithSender?(tableView: UITableView, action: string, indexPath: NSIndexPath, sender: any): boolean;

	/**
	 * @since 16.0
	 */
	tableViewCanPerformPrimaryActionForRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): boolean;

	/**
	 * @since 13.0
	 */
	tableViewContextMenuConfigurationForRowAtIndexPathPoint?(tableView: UITableView, indexPath: NSIndexPath, point: CGPoint): UIContextMenuConfiguration;

	/**
	 * @since 13.0
	 */
	tableViewDidBeginMultipleSelectionInteractionAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): void;

	/**
	 * @since 3.0
	 */
	tableViewDidDeselectRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): void;

	/**
	 * @since 6.0
	 */
	tableViewDidEndDisplayingCellForRowAtIndexPath?(tableView: UITableView, cell: UITableViewCell, indexPath: NSIndexPath): void;

	/**
	 * @since 6.0
	 */
	tableViewDidEndDisplayingFooterViewForSection?(tableView: UITableView, view: UIView, section: number): void;

	/**
	 * @since 6.0
	 */
	tableViewDidEndDisplayingHeaderViewForSection?(tableView: UITableView, view: UIView, section: number): void;

	tableViewDidEndEditingRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): void;

	/**
	 * @since 13.0
	 */
	tableViewDidEndMultipleSelectionInteraction?(tableView: UITableView): void;

	/**
	 * @since 6.0
	 */
	tableViewDidHighlightRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): void;

	tableViewDidSelectRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): void;

	/**
	 * @since 6.0
	 */
	tableViewDidUnhighlightRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): void;

	/**
	 * @since 9.0
	 */
	tableViewDidUpdateFocusInContextWithAnimationCoordinator?(tableView: UITableView, context: UITableViewFocusUpdateContext, coordinator: UIFocusAnimationCoordinator): void;

	/**
	 * @since 8.0
	 * @deprecated 13.0
	 */
	tableViewEditActionsForRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): NSArray<UITableViewRowAction>;

	tableViewEditingStyleForRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): UITableViewCellEditingStyle;

	/**
	 * @since 7.0
	 */
	tableViewEstimatedHeightForFooterInSection?(tableView: UITableView, section: number): number;

	/**
	 * @since 7.0
	 */
	tableViewEstimatedHeightForHeaderInSection?(tableView: UITableView, section: number): number;

	/**
	 * @since 7.0
	 */
	tableViewEstimatedHeightForRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): number;

	tableViewHeightForFooterInSection?(tableView: UITableView, section: number): number;

	tableViewHeightForHeaderInSection?(tableView: UITableView, section: number): number;

	tableViewHeightForRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): number;

	tableViewIndentationLevelForRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): number;

	/**
	 * @since 11.0
	 */
	tableViewLeadingSwipeActionsConfigurationForRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): UISwipeActionsConfiguration;

	/**
	 * @since 5.0
	 * @deprecated 13.0
	 */
	tableViewPerformActionForRowAtIndexPathWithSender?(tableView: UITableView, action: string, indexPath: NSIndexPath, sender: any): void;

	/**
	 * @since 16.0
	 */
	tableViewPerformPrimaryActionForRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): void;

	/**
	 * @since 13.0
	 */
	tableViewPreviewForDismissingContextMenuWithConfiguration?(tableView: UITableView, configuration: UIContextMenuConfiguration): UITargetedPreview;

	/**
	 * @since 13.0
	 */
	tableViewPreviewForHighlightingContextMenuWithConfiguration?(tableView: UITableView, configuration: UIContextMenuConfiguration): UITargetedPreview;

	/**
	 * @since 15.0
	 */
	tableViewSelectionFollowsFocusForRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): boolean;

	/**
	 * @since 13.0
	 */
	tableViewShouldBeginMultipleSelectionInteractionAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): boolean;

	/**
	 * @since 6.0
	 */
	tableViewShouldHighlightRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): boolean;

	tableViewShouldIndentWhileEditingRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): boolean;

	/**
	 * @since 5.0
	 * @deprecated 13.0
	 */
	tableViewShouldShowMenuForRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): boolean;

	/**
	 * @since 11.0
	 */
	tableViewShouldSpringLoadRowAtIndexPathWithContext?(tableView: UITableView, indexPath: NSIndexPath, context: UISpringLoadedInteractionContext): boolean;

	/**
	 * @since 9.0
	 */
	tableViewShouldUpdateFocusInContext?(tableView: UITableView, context: UITableViewFocusUpdateContext): boolean;

	tableViewTargetIndexPathForMoveFromRowAtIndexPathToProposedIndexPath?(tableView: UITableView, sourceIndexPath: NSIndexPath, proposedDestinationIndexPath: NSIndexPath): NSIndexPath;

	/**
	 * @since 3.0
	 */
	tableViewTitleForDeleteConfirmationButtonForRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): string;

	/**
	 * @since 11.0
	 */
	tableViewTrailingSwipeActionsConfigurationForRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): UISwipeActionsConfiguration;

	tableViewViewForFooterInSection?(tableView: UITableView, section: number): UIView;

	tableViewViewForHeaderInSection?(tableView: UITableView, section: number): UIView;

	tableViewWillBeginEditingRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): void;

	/**
	 * @since 3.0
	 */
	tableViewWillDeselectRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): NSIndexPath;

	tableViewWillDisplayCellForRowAtIndexPath?(tableView: UITableView, cell: UITableViewCell, indexPath: NSIndexPath): void;

	/**
	 * @since 14.0
	 */
	tableViewWillDisplayContextMenuWithConfigurationAnimator?(tableView: UITableView, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionAnimating): void;

	/**
	 * @since 6.0
	 */
	tableViewWillDisplayFooterViewForSection?(tableView: UITableView, view: UIView, section: number): void;

	/**
	 * @since 6.0
	 */
	tableViewWillDisplayHeaderViewForSection?(tableView: UITableView, view: UIView, section: number): void;

	/**
	 * @since 14.0
	 */
	tableViewWillEndContextMenuInteractionWithConfigurationAnimator?(tableView: UITableView, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionAnimating): void;

	/**
	 * @since 13.0
	 */
	tableViewWillPerformPreviewActionForMenuWithConfigurationAnimator?(tableView: UITableView, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionCommitAnimating): void;

	tableViewWillSelectRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): NSIndexPath;
}
declare var UITableViewDelegate: {

	prototype: UITableViewDelegate;
};

/**
 * @since 13.0
 */
declare class UITableViewDiffableDataSource<SectionIdentifierType, ItemIdentifierType> extends NSObject implements UITableViewDataSource {

	static alloc<SectionIdentifierType, ItemIdentifierType>(): UITableViewDiffableDataSource<SectionIdentifierType, ItemIdentifierType>; // inherited from NSObject

	static new<SectionIdentifierType, ItemIdentifierType>(): UITableViewDiffableDataSource<SectionIdentifierType, ItemIdentifierType>; // inherited from NSObject

	defaultRowAnimation: UITableViewRowAnimation;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { tableView: UITableView; cellProvider: (p1: UITableView, p2: NSIndexPath, p3: any) => UITableViewCell; });

	applySnapshotAnimatingDifferences(snapshot: NSDiffableDataSourceSnapshot<any, any>, animatingDifferences: boolean): void;

	applySnapshotAnimatingDifferencesCompletion(snapshot: NSDiffableDataSourceSnapshot<any, any>, animatingDifferences: boolean, completion: () => void): void;

	/**
	 * @since 15.0
	 */
	applySnapshotUsingReloadData(snapshot: NSDiffableDataSourceSnapshot<any, any>): void;

	/**
	 * @since 15.0
	 */
	applySnapshotUsingReloadDataCompletion(snapshot: NSDiffableDataSourceSnapshot<any, any>, completion: () => void): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 15.0
	 */
	indexForSectionIdentifier(identifier: any): number;

	indexPathForItemIdentifier(identifier: any): NSIndexPath;

	initWithTableViewCellProvider(tableView: UITableView, cellProvider: (p1: UITableView, p2: NSIndexPath, p3: any) => UITableViewCell): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	itemIdentifierForIndexPath(indexPath: NSIndexPath): any;

	numberOfSectionsInTableView(tableView: UITableView): number;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	/**
	 * @since 15.0
	 */
	sectionIdentifierForIndex(index: number): any;

	sectionIndexTitlesForTableView(tableView: UITableView): NSArray<string>;

	self(): this;

	snapshot(): NSDiffableDataSourceSnapshot<any, any>;

	tableViewCanEditRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): boolean;

	tableViewCanMoveRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): boolean;

	tableViewCellForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): UITableViewCell;

	tableViewCommitEditingStyleForRowAtIndexPath(tableView: UITableView, editingStyle: UITableViewCellEditingStyle, indexPath: NSIndexPath): void;

	tableViewMoveRowAtIndexPathToIndexPath(tableView: UITableView, sourceIndexPath: NSIndexPath, destinationIndexPath: NSIndexPath): void;

	tableViewNumberOfRowsInSection(tableView: UITableView, section: number): number;

	tableViewSectionForSectionIndexTitleAtIndex(tableView: UITableView, title: string, index: number): number;

	tableViewTitleForFooterInSection(tableView: UITableView, section: number): string;

	tableViewTitleForHeaderInSection(tableView: UITableView, section: number): string;
}

/**
 * @since 11.0
 */
interface UITableViewDragDelegate extends NSObjectProtocol {

	tableViewDragPreviewParametersForRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): UIDragPreviewParameters;

	tableViewDragSessionAllowsMoveOperation?(tableView: UITableView, session: UIDragSession): boolean;

	tableViewDragSessionDidEnd?(tableView: UITableView, session: UIDragSession): void;

	tableViewDragSessionIsRestrictedToDraggingApplication?(tableView: UITableView, session: UIDragSession): boolean;

	tableViewDragSessionWillBegin?(tableView: UITableView, session: UIDragSession): void;

	tableViewItemsForAddingToDragSessionAtIndexPathPoint?(tableView: UITableView, session: UIDragSession, indexPath: NSIndexPath, point: CGPoint): NSArray<UIDragItem>;

	tableViewItemsForBeginningDragSessionAtIndexPath(tableView: UITableView, session: UIDragSession, indexPath: NSIndexPath): NSArray<UIDragItem>;
}
declare var UITableViewDragDelegate: {

	prototype: UITableViewDragDelegate;
};

/**
 * @since 11.0
 */
interface UITableViewDropCoordinator extends NSObjectProtocol {

	destinationIndexPath: NSIndexPath;

	items: NSArray<UITableViewDropItem>;

	proposal: UITableViewDropProposal;

	session: UIDropSession;

	dropItemIntoRowAtIndexPathRect(dragItem: UIDragItem, indexPath: NSIndexPath, rect: CGRect): UIDragAnimating;

	dropItemToPlaceholder(dragItem: UIDragItem, placeholder: UITableViewDropPlaceholder): UITableViewDropPlaceholderContext;

	dropItemToRowAtIndexPath(dragItem: UIDragItem, indexPath: NSIndexPath): UIDragAnimating;

	dropItemToTarget(dragItem: UIDragItem, target: UIDragPreviewTarget): UIDragAnimating;
}
declare var UITableViewDropCoordinator: {

	prototype: UITableViewDropCoordinator;
};

/**
 * @since 11.0
 */
interface UITableViewDropDelegate extends NSObjectProtocol {

	tableViewCanHandleDropSession?(tableView: UITableView, session: UIDropSession): boolean;

	tableViewDropPreviewParametersForRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): UIDragPreviewParameters;

	tableViewDropSessionDidEnd?(tableView: UITableView, session: UIDropSession): void;

	tableViewDropSessionDidEnter?(tableView: UITableView, session: UIDropSession): void;

	tableViewDropSessionDidExit?(tableView: UITableView, session: UIDropSession): void;

	tableViewDropSessionDidUpdateWithDestinationIndexPath?(tableView: UITableView, session: UIDropSession, destinationIndexPath: NSIndexPath): UITableViewDropProposal;

	tableViewPerformDropWithCoordinator(tableView: UITableView, coordinator: UITableViewDropCoordinator): void;
}
declare var UITableViewDropDelegate: {

	prototype: UITableViewDropDelegate;
};

/**
 * @since 11.0
 */
declare const enum UITableViewDropIntent {

	Unspecified = 0,

	InsertAtDestinationIndexPath = 1,

	InsertIntoDestinationIndexPath = 2,

	Automatic = 3
}

/**
 * @since 11.0
 */
interface UITableViewDropItem extends NSObjectProtocol {

	dragItem: UIDragItem;

	previewSize: CGSize;

	sourceIndexPath: NSIndexPath;
}
declare var UITableViewDropItem: {

	prototype: UITableViewDropItem;
};

/**
 * @since 11.0
 */
declare class UITableViewDropPlaceholder extends UITableViewPlaceholder {

	static alloc(): UITableViewDropPlaceholder; // inherited from NSObject

	static new(): UITableViewDropPlaceholder; // inherited from NSObject

	previewParametersProvider: (p1: UITableViewCell) => UIDragPreviewParameters;
}

/**
 * @since 11.0
 */
interface UITableViewDropPlaceholderContext extends UIDragAnimating {

	dragItem: UIDragItem;

	commitInsertionWithDataSourceUpdates(dataSourceUpdates: (p1: NSIndexPath) => void): boolean;

	deletePlaceholder(): boolean;
}
declare var UITableViewDropPlaceholderContext: {

	prototype: UITableViewDropPlaceholderContext;
};

/**
 * @since 11.0
 */
declare class UITableViewDropProposal extends UIDropProposal {

	static alloc(): UITableViewDropProposal; // inherited from NSObject

	static new(): UITableViewDropProposal; // inherited from NSObject

	readonly intent: UITableViewDropIntent;

	constructor(o: { dropOperation: UIDropOperation; intent: UITableViewDropIntent; });

	initWithDropOperationIntent(operation: UIDropOperation, intent: UITableViewDropIntent): this;
}

/**
 * @since 9.0
 */
declare class UITableViewFocusUpdateContext extends UIFocusUpdateContext {

	static alloc(): UITableViewFocusUpdateContext; // inherited from NSObject

	static new(): UITableViewFocusUpdateContext; // inherited from NSObject

	readonly nextFocusedIndexPath: NSIndexPath;

	readonly previouslyFocusedIndexPath: NSIndexPath;
}

/**
 * @since 6.0
 */
declare class UITableViewHeaderFooterView extends UIView {

	static alloc(): UITableViewHeaderFooterView; // inherited from NSObject

	static appearance(): UITableViewHeaderFooterView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UITableViewHeaderFooterView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UITableViewHeaderFooterView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UITableViewHeaderFooterView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UITableViewHeaderFooterView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UITableViewHeaderFooterView; // inherited from UIAppearance

	static new(): UITableViewHeaderFooterView; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	automaticallyUpdatesBackgroundConfiguration: boolean;

	/**
	 * @since 14.0
	 */
	automaticallyUpdatesContentConfiguration: boolean;

	/**
	 * @since 14.0
	 */
	backgroundConfiguration: UIBackgroundConfiguration;

	backgroundView: UIView;

	/**
	 * @since 14.0
	 */
	readonly configurationState: UIViewConfigurationState;

	/**
	 * @since 15.0
	 */
	configurationUpdateHandler: (p1: UITableViewHeaderFooterView, p2: UIViewConfigurationState) => void;

	/**
	 * @since 14.0
	 */
	contentConfiguration: UIContentConfiguration;

	readonly contentView: UIView;

	/**
	 * @since 6.0
	 * @deprecated 100000
	 */
	readonly detailTextLabel: UILabel;

	readonly reuseIdentifier: string;

	/**
	 * @since 6.0
	 * @deprecated 100000
	 */
	readonly textLabel: UILabel;

	constructor(o: { reuseIdentifier: string; });

	/**
	 * @since 16.0
	 */
	defaultBackgroundConfiguration(): UIBackgroundConfiguration;

	/**
	 * @since 14.0
	 */
	defaultContentConfiguration(): UIListContentConfiguration;

	initWithReuseIdentifier(reuseIdentifier: string): this;

	prepareForReuse(): void;

	/**
	 * @since 14.0
	 */
	setNeedsUpdateConfiguration(): void;

	/**
	 * @since 14.0
	 */
	updateConfigurationUsingState(state: UIViewConfigurationState): void;
}

/**
 * @since 3.0
 */
declare var UITableViewIndexSearch: string;

/**
 * @since 11.0
 */
declare class UITableViewPlaceholder extends NSObject {

	static alloc(): UITableViewPlaceholder; // inherited from NSObject

	static new(): UITableViewPlaceholder; // inherited from NSObject

	cellUpdateHandler: (p1: UITableViewCell) => void;

	constructor(o: { insertionIndexPath: NSIndexPath; reuseIdentifier: string; rowHeight: number; });

	initWithInsertionIndexPathReuseIdentifierRowHeight(insertionIndexPath: NSIndexPath, reuseIdentifier: string, rowHeight: number): this;
}

/**
 * @since 8.0
 * @deprecated 13.0
 */
declare class UITableViewRowAction extends NSObject implements NSCopying {

	static alloc(): UITableViewRowAction; // inherited from NSObject

	static new(): UITableViewRowAction; // inherited from NSObject

	static rowActionWithStyleTitleHandler(style: UITableViewRowActionStyle, title: string, handler: (p1: UITableViewRowAction, p2: NSIndexPath) => void): UITableViewRowAction;

	backgroundColor: UIColor;

	backgroundEffect: UIVisualEffect;

	readonly style: UITableViewRowActionStyle;

	title: string;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 8.0
 * @deprecated 13.0
 */
declare const enum UITableViewRowActionStyle {

	Default = 0,

	Destructive = 0,

	Normal = 1
}

declare const enum UITableViewRowAnimation {

	Fade = 0,

	Right = 1,

	Left = 2,

	Top = 3,

	Bottom = 4,

	None = 5,

	Middle = 6,

	Automatic = 100
}

declare const enum UITableViewScrollPosition {

	None = 0,

	Top = 1,

	Middle = 2,

	Bottom = 3
}

declare var UITableViewSelectionDidChangeNotification: string;

/**
 * @since 16.0
 */
declare const enum UITableViewSelfSizingInvalidation {

	Disabled = 0,

	Enabled = 1,

	EnabledIncludingConstraints = 2
}

/**
 * @since 11.0
 */
declare const enum UITableViewSeparatorInsetReference {

	FromCellEdges = 0,

	FromAutomaticInsets = 1
}

declare const enum UITableViewStyle {

	Plain = 0,

	Grouped = 1,

	InsetGrouped = 2
}

/**
 * @since 3.2
 */
declare class UITapGestureRecognizer extends UIGestureRecognizer {

	static alloc(): UITapGestureRecognizer; // inherited from NSObject

	static new(): UITapGestureRecognizer; // inherited from NSObject

	/**
	 * @since 13.4
	 */
	buttonMaskRequired: UIEventButtonMask;

	numberOfTapsRequired: number;

	numberOfTouchesRequired: number;
}

/**
 * @since 11.0
 */
declare class UITargetedDragPreview extends UITargetedPreview {

	static alloc(): UITargetedDragPreview; // inherited from NSObject

	static new(): UITargetedDragPreview; // inherited from NSObject

	static previewForURLTarget(url: NSURL, target: UIDragPreviewTarget): UITargetedDragPreview;

	static previewForURLTitleTarget(url: NSURL, title: string, target: UIDragPreviewTarget): UITargetedDragPreview;

	retargetedPreviewWithTarget(newTarget: UIDragPreviewTarget): UITargetedDragPreview;
}

/**
 * @since 13.0
 */
declare class UITargetedPreview extends NSObject implements NSCopying {

	static alloc(): UITargetedPreview; // inherited from NSObject

	static new(): UITargetedPreview; // inherited from NSObject

	readonly parameters: UIPreviewParameters;

	readonly size: CGSize;

	readonly target: UIPreviewTarget;

	readonly view: UIView;

	constructor(o: { view: UIView; });

	constructor(o: { view: UIView; parameters: UIPreviewParameters; });

	constructor(o: { view: UIView; parameters: UIPreviewParameters; target: UIPreviewTarget; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithView(view: UIView): this;

	initWithViewParameters(view: UIView, parameters: UIPreviewParameters): this;

	initWithViewParametersTarget(view: UIView, parameters: UIPreviewParameters, target: UIPreviewTarget): this;

	retargetedPreviewWithTarget(newTarget: UIPreviewTarget): UITargetedPreview;
}

/**
 * @since 2.0
 * @deprecated 6.0
 */
declare const enum UITextAlignment {

	Left = 0,

	Center = 1,

	Right = 2
}

declare const enum UITextAlternativeStyle {

	None = 0,

	LowConfidence = 1
}

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var UITextAttributeFont: string;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var UITextAttributeTextColor: string;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var UITextAttributeTextShadowColor: string;

/**
 * @since 5.0
 * @deprecated 7.0
 */
declare var UITextAttributeTextShadowOffset: string;

declare const enum UITextAutocapitalizationType {

	None = 0,

	Words = 1,

	Sentences = 2,

	AllCharacters = 3
}

declare const enum UITextAutocorrectionType {

	Default = 0,

	No = 1,

	Yes = 2
}

declare const enum UITextBorderStyle {

	None = 0,

	Line = 1,

	Bezel = 2,

	RoundedRect = 3
}

/**
 * @since 3.2
 */
declare class UITextChecker extends NSObject {

	static alloc(): UITextChecker; // inherited from NSObject

	static hasLearnedWord(word: string): boolean;

	static learnWord(word: string): void;

	static new(): UITextChecker; // inherited from NSObject

	static unlearnWord(word: string): void;

	ignoredWords: NSArray<string>;

	static readonly availableLanguages: NSArray<string>;

	completionsForPartialWordRangeInStringLanguage(range: NSRange, string: string, language: string): NSArray<string>;

	guessesForWordRangeInStringLanguage(range: NSRange, string: string, language: string): NSArray<string>;

	ignoreWord(wordToIgnore: string): void;

	rangeOfMisspelledWordInStringRangeStartingAtWrapLanguage(stringToCheck: string, range: NSRange, startingOffset: number, wrapFlag: boolean, language: string): NSRange;
}

/**
 * @since 10.0
 */
declare var UITextContentTypeAddressCity: string;

/**
 * @since 10.0
 */
declare var UITextContentTypeAddressCityAndState: string;

/**
 * @since 10.0
 */
declare var UITextContentTypeAddressState: string;

/**
 * @since 17.0
 */
declare var UITextContentTypeBirthdate: string;

/**
 * @since 17.0
 */
declare var UITextContentTypeBirthdateDay: string;

/**
 * @since 17.0
 */
declare var UITextContentTypeBirthdateMonth: string;

/**
 * @since 17.0
 */
declare var UITextContentTypeBirthdateYear: string;

/**
 * @since 17.4
 */
declare var UITextContentTypeCellularEID: string;

/**
 * @since 17.4
 */
declare var UITextContentTypeCellularIMEI: string;

/**
 * @since 10.0
 */
declare var UITextContentTypeCountryName: string;

/**
 * @since 17.0
 */
declare var UITextContentTypeCreditCardExpiration: string;

/**
 * @since 17.0
 */
declare var UITextContentTypeCreditCardExpirationMonth: string;

/**
 * @since 17.0
 */
declare var UITextContentTypeCreditCardExpirationYear: string;

/**
 * @since 17.0
 */
declare var UITextContentTypeCreditCardFamilyName: string;

/**
 * @since 17.0
 */
declare var UITextContentTypeCreditCardGivenName: string;

/**
 * @since 17.0
 */
declare var UITextContentTypeCreditCardMiddleName: string;

/**
 * @since 17.0
 */
declare var UITextContentTypeCreditCardName: string;

/**
 * @since 10.0
 */
declare var UITextContentTypeCreditCardNumber: string;

/**
 * @since 17.0
 */
declare var UITextContentTypeCreditCardSecurityCode: string;

/**
 * @since 17.0
 */
declare var UITextContentTypeCreditCardType: string;

/**
 * @since 15.0
 */
declare var UITextContentTypeDateTime: string;

/**
 * @since 10.0
 */
declare var UITextContentTypeEmailAddress: string;

/**
 * @since 10.0
 */
declare var UITextContentTypeFamilyName: string;

/**
 * @since 15.0
 */
declare var UITextContentTypeFlightNumber: string;

/**
 * @since 10.0
 */
declare var UITextContentTypeFullStreetAddress: string;

/**
 * @since 10.0
 */
declare var UITextContentTypeGivenName: string;

/**
 * @since 10.0
 */
declare var UITextContentTypeJobTitle: string;

/**
 * @since 10.0
 */
declare var UITextContentTypeLocation: string;

/**
 * @since 10.0
 */
declare var UITextContentTypeMiddleName: string;

/**
 * @since 10.0
 */
declare var UITextContentTypeName: string;

/**
 * @since 10.0
 */
declare var UITextContentTypeNamePrefix: string;

/**
 * @since 10.0
 */
declare var UITextContentTypeNameSuffix: string;

/**
 * @since 12.0
 */
declare var UITextContentTypeNewPassword: string;

/**
 * @since 10.0
 */
declare var UITextContentTypeNickname: string;

/**
 * @since 12.0
 */
declare var UITextContentTypeOneTimeCode: string;

/**
 * @since 10.0
 */
declare var UITextContentTypeOrganizationName: string;

/**
 * @since 11.0
 */
declare var UITextContentTypePassword: string;

/**
 * @since 10.0
 */
declare var UITextContentTypePostalCode: string;

/**
 * @since 15.0
 */
declare var UITextContentTypeShipmentTrackingNumber: string;

/**
 * @since 10.0
 */
declare var UITextContentTypeStreetAddressLine1: string;

/**
 * @since 10.0
 */
declare var UITextContentTypeStreetAddressLine2: string;

/**
 * @since 10.0
 */
declare var UITextContentTypeSublocality: string;

/**
 * @since 10.0
 */
declare var UITextContentTypeTelephoneNumber: string;

/**
 * @since 10.0
 */
declare var UITextContentTypeURL: string;

/**
 * @since 11.0
 */
declare var UITextContentTypeUsername: string;

/**
 * @since 17.4
 */
declare class UITextCursorDropPositionAnimator extends NSObject {

	static alloc(): UITextCursorDropPositionAnimator; // inherited from NSObject

	static new(): UITextCursorDropPositionAnimator; // inherited from NSObject

	readonly cursorView: UIView & UITextCursorView;

	readonly textInput: UIView & UITextInput;

	constructor(o: { textCursorView: UIView & UITextCursorView; textInput: UIView & UITextInput; });

	animateAlongsideChangesCompletion(animation: () => void, completion: () => void): void;

	initWithTextCursorViewTextInput(cursorView: UIView & UITextCursorView, textInput: UIView & UITextInput): this;

	placeCursorAtPositionAnimated(position: UITextPosition, animated: boolean): void;

	setCursorVisibleAnimated(visible: boolean, animated: boolean): void;
}

/**
 * @since 17.0
 */
interface UITextCursorView extends UICoordinateSpace {

	blinking: boolean;

	resetBlinkAnimation(): void;
}
declare var UITextCursorView: {

	prototype: UITextCursorView;
};

interface UITextDocumentProxy extends UIKeyInput {

	documentContextAfterInput: string;

	documentContextBeforeInput: string;

	/**
	 * @since 11.0
	 */
	documentIdentifier: NSUUID;

	/**
	 * @since 10.0
	 */
	documentInputMode: UITextInputMode;

	/**
	 * @since 11.0
	 */
	selectedText: string;

	adjustTextPositionByCharacterOffset(offset: number): void;

	/**
	 * @since 13.0
	 */
	setMarkedTextSelectedRange(markedText: string, selectedRange: NSRange): void;

	/**
	 * @since 13.0
	 */
	unmarkText(): void;
}
declare var UITextDocumentProxy: {

	prototype: UITextDocumentProxy;
};

/**
 * @since 11.0
 */
interface UITextDragDelegate extends NSObjectProtocol {

	textDraggableViewDragPreviewForLiftingItemSession?(textDraggableView: UIView & UITextDraggable, item: UIDragItem, session: UIDragSession): UITargetedDragPreview;

	textDraggableViewDragSessionDidEndWithOperation?(textDraggableView: UIView & UITextDraggable, session: UIDragSession, operation: UIDropOperation): void;

	textDraggableViewDragSessionWillBegin?(textDraggableView: UIView & UITextDraggable, session: UIDragSession): void;

	textDraggableViewItemsForDrag?(textDraggableView: UIView & UITextDraggable, dragRequest: UITextDragRequest): NSArray<UIDragItem>;

	textDraggableViewWillAnimateLiftWithAnimatorSession?(textDraggableView: UIView & UITextDraggable, animator: UIDragAnimating, session: UIDragSession): void;
}
declare var UITextDragDelegate: {

	prototype: UITextDragDelegate;
};

/**
 * @since 11.0
 */
declare const enum UITextDragOptions {

	sNone = 0,

	StripTextColorFromPreviews = 1
}

/**
 * @since 11.0
 */
declare class UITextDragPreviewRenderer extends NSObject {

	static alloc(): UITextDragPreviewRenderer; // inherited from NSObject

	static new(): UITextDragPreviewRenderer; // inherited from NSObject

	readonly bodyRect: CGRect;

	readonly firstLineRect: CGRect;

	readonly image: UIImage;

	readonly lastLineRect: CGRect;

	readonly layoutManager: NSLayoutManager;

	constructor(o: { layoutManager: NSLayoutManager; range: NSRange; });

	constructor(o: { layoutManager: NSLayoutManager; range: NSRange; unifyRects: boolean; });

	adjustFirstLineRectBodyRectLastLineRectTextOrigin(firstLineRect: interop.Pointer | interop.Reference<CGRect>, bodyRect: interop.Pointer | interop.Reference<CGRect>, lastLineRect: interop.Pointer | interop.Reference<CGRect>, origin: CGPoint): void;

	initWithLayoutManagerRange(layoutManager: NSLayoutManager, range: NSRange): this;

	initWithLayoutManagerRangeUnifyRects(layoutManager: NSLayoutManager, range: NSRange, unifyRects: boolean): this;
}

/**
 * @since 11.0
 */
interface UITextDragRequest extends NSObjectProtocol {

	dragRange: UITextRange;

	dragSession: UIDragSession;

	existingItems: NSArray<UIDragItem>;

	selected: boolean;

	suggestedItems: NSArray<UIDragItem>;
}
declare var UITextDragRequest: {

	prototype: UITextDragRequest;
};

/**
 * @since 11.0
 */
interface UITextDraggable extends UITextInput {

	textDragActive: boolean;

	textDragDelegate: UITextDragDelegate;

	textDragInteraction: UIDragInteraction;

	textDragOptions: UITextDragOptions;
}
declare var UITextDraggable: {

	prototype: UITextDraggable;
};

/**
 * @since 11.0
 */
declare const enum UITextDropAction {

	Insert = 0,

	ReplaceSelection = 1,

	ReplaceAll = 2
}

/**
 * @since 11.0
 */
interface UITextDropDelegate extends NSObjectProtocol {

	textDroppableViewDropSessionDidEnd?(textDroppableView: UIView & UITextDroppable, session: UIDropSession): void;

	textDroppableViewDropSessionDidEnter?(textDroppableView: UIView & UITextDroppable, session: UIDropSession): void;

	textDroppableViewDropSessionDidExit?(textDroppableView: UIView & UITextDroppable, session: UIDropSession): void;

	textDroppableViewDropSessionDidUpdate?(textDroppableView: UIView & UITextDroppable, session: UIDropSession): void;

	textDroppableViewPreviewForDroppingAllItemsWithDefault?(textDroppableView: UIView & UITextDroppable, defaultPreview: UITargetedDragPreview): UITargetedDragPreview;

	textDroppableViewProposalForDrop?(textDroppableView: UIView & UITextDroppable, drop: UITextDropRequest): UITextDropProposal;

	textDroppableViewWillBecomeEditableForDrop?(textDroppableView: UIView & UITextDroppable, drop: UITextDropRequest): UITextDropEditability;

	textDroppableViewWillPerformDrop?(textDroppableView: UIView & UITextDroppable, drop: UITextDropRequest): void;
}
declare var UITextDropDelegate: {

	prototype: UITextDropDelegate;
};

/**
 * @since 11.0
 */
declare const enum UITextDropEditability {

	No = 0,

	Temporary = 1,

	Yes = 2
}

/**
 * @since 11.0
 */
declare const enum UITextDropPerformer {

	View = 0,

	Delegate = 1
}

/**
 * @since 11.0
 */
declare const enum UITextDropProgressMode {

	System = 0,

	Custom = 1
}

/**
 * @since 11.0
 */
declare class UITextDropProposal extends UIDropProposal implements NSCopying {

	static alloc(): UITextDropProposal; // inherited from NSObject

	static new(): UITextDropProposal; // inherited from NSObject

	dropAction: UITextDropAction;

	dropPerformer: UITextDropPerformer;

	dropProgressMode: UITextDropProgressMode;

	useFastSameViewOperations: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 11.0
 */
interface UITextDropRequest extends NSObjectProtocol {

	dropPosition: UITextPosition;

	dropSession: UIDropSession;

	sameView: boolean;

	suggestedProposal: UITextDropProposal;
}
declare var UITextDropRequest: {

	prototype: UITextDropRequest;
};

/**
 * @since 11.0
 */
interface UITextDroppable extends UITextInput, UITextPasteConfigurationSupporting {

	textDropActive: boolean;

	textDropDelegate: UITextDropDelegate;

	textDropInteraction: UIDropInteraction;
}
declare var UITextDroppable: {

	prototype: UITextDroppable;
};

/**
 * @since 2.0
 */
declare class UITextField extends UIControl implements NSCoding, UIContentSizeCategoryAdjusting, UILetterformAwareAdjusting, UITextDraggable, UITextDroppable, UITextInput, UITextPasteConfigurationSupporting {

	static alloc(): UITextField; // inherited from NSObject

	static appearance(): UITextField; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UITextField; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UITextField; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UITextField; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UITextField; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UITextField; // inherited from UIAppearance

	static new(): UITextField; // inherited from NSObject

	adjustsFontSizeToFitWidth: boolean;

	/**
	 * @since 6.0
	 */
	allowsEditingTextAttributes: boolean;

	/**
	 * @since 6.0
	 */
	attributedPlaceholder: NSAttributedString;

	/**
	 * @since 6.0
	 */
	attributedText: NSAttributedString;

	background: UIImage;

	borderStyle: UITextBorderStyle;

	clearButtonMode: UITextFieldViewMode;

	clearsOnBeginEditing: boolean;

	/**
	 * @since 6.0
	 */
	clearsOnInsertion: boolean;

	/**
	 * @since 7.0
	 */
	defaultTextAttributes: NSDictionary<string, any>;

	delegate: UITextFieldDelegate;

	disabledBackground: UIImage;

	readonly editing: boolean;

	font: UIFont;

	inputAccessoryView: UIView;

	inputView: UIView;

	/**
	 * @since 15.0
	 */
	interactionState: any;

	leftView: UIView;

	leftViewMode: UITextFieldViewMode;

	minimumFontSize: number;

	placeholder: string;

	rightView: UIView;

	rightViewMode: UITextFieldViewMode;

	text: string;

	textAlignment: NSTextAlignment;

	textColor: UIColor;

	/**
	 * @since 6.0
	 */
	typingAttributes: NSDictionary<string, any>;

	adjustsFontForContentSizeCategory: boolean; // inherited from UIContentSizeCategoryAdjusting

	autocapitalizationType: UITextAutocapitalizationType; // inherited from UITextInputTraits

	autocorrectionType: UITextAutocorrectionType; // inherited from UITextInputTraits

	readonly beginningOfDocument: UITextPosition; // inherited from UITextInput

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	/**
	 * @since 18.0
	 */
	readonly editable: boolean; // inherited from UITextInput

	enablesReturnKeyAutomatically: boolean; // inherited from UITextInputTraits

	readonly endOfDocument: UITextPosition; // inherited from UITextInput

	readonly hasText: boolean; // inherited from UIKeyInput

	readonly hash: number; // inherited from NSObjectProtocol

	/**
	 * @since 17.0
	 */
	inlinePredictionType: UITextInlinePredictionType; // inherited from UITextInputTraits

	inputDelegate: UITextInputDelegate; // inherited from UITextInput

	readonly insertDictationResultPlaceholder: any; // inherited from UITextInput

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	keyboardAppearance: UIKeyboardAppearance; // inherited from UITextInputTraits

	keyboardType: UIKeyboardType; // inherited from UITextInputTraits

	readonly markedTextRange: UITextRange; // inherited from UITextInput

	markedTextStyle: NSDictionary<string, any>; // inherited from UITextInput

	/**
	 * @since 18.0
	 */
	mathExpressionCompletionType: UITextMathExpressionCompletionType; // inherited from UITextInputTraits

	/**
	 * @since 12.0
	 */
	passwordRules: UITextInputPasswordRules; // inherited from UITextInputTraits

	pasteConfiguration: UIPasteConfiguration; // inherited from UIPasteConfigurationSupporting

	pasteDelegate: UITextPasteDelegate; // inherited from UITextPasteConfigurationSupporting

	returnKeyType: UIReturnKeyType; // inherited from UITextInputTraits

	secureTextEntry: boolean; // inherited from UITextInputTraits

	selectedTextRange: UITextRange; // inherited from UITextInput

	selectionAffinity: UITextStorageDirection; // inherited from UITextInput

	sizingRule: UILetterformAwareSizingRule; // inherited from UILetterformAwareAdjusting

	/**
	 * @since 11.0
	 */
	smartDashesType: UITextSmartDashesType; // inherited from UITextInputTraits

	/**
	 * @since 11.0
	 */
	smartInsertDeleteType: UITextSmartInsertDeleteType; // inherited from UITextInputTraits

	/**
	 * @since 11.0
	 */
	smartQuotesType: UITextSmartQuotesType; // inherited from UITextInputTraits

	/**
	 * @since 5.0
	 */
	spellCheckingType: UITextSpellCheckingType; // inherited from UITextInputTraits

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	/**
	 * @since 18.0
	 */
	supportsAdaptiveImageGlyph: boolean; // inherited from UITextInput

	/**
	 * @since 10.0
	 */
	textContentType: string; // inherited from UITextInputTraits

	readonly textDragActive: boolean; // inherited from UITextDraggable

	textDragDelegate: UITextDragDelegate; // inherited from UITextDraggable

	readonly textDragInteraction: UIDragInteraction; // inherited from UITextDraggable

	textDragOptions: UITextDragOptions; // inherited from UITextDraggable

	readonly textDropActive: boolean; // inherited from UITextDroppable

	textDropDelegate: UITextDropDelegate; // inherited from UITextDroppable

	readonly textDropInteraction: UIDropInteraction; // inherited from UITextDroppable

	readonly textInputView: UIView; // inherited from UITextInput

	readonly tokenizer: UITextInputTokenizer; // inherited from UITextInput

	/**
	 * @since 18.0
	 */
	writingToolsAllowedInputOptions: UIWritingToolsAllowedInputOptions; // inherited from UITextInputTraits

	/**
	 * @since 18.0
	 */
	writingToolsBehavior: UIWritingToolsBehavior; // inherited from UITextInputTraits

	readonly  // inherited from NSObjectProtocol

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	baseWritingDirectionForPositionInDirection(position: UITextPosition, direction: UITextStorageDirection): NSWritingDirection;

	/**
	 * @since 9.0
	 */
	beginFloatingCursorAtPoint(point: CGPoint): void;

	borderRectForBounds(bounds: CGRect): CGRect;

	canPasteItemProviders(itemProviders: NSArray<NSItemProvider> | NSItemProvider[]): boolean;

	caretRectForPosition(position: UITextPosition): CGRect;

	/**
	 * @since 17.4
	 */
	caretTransformForPosition(position: UITextPosition): CGAffineTransform;

	characterOffsetOfPositionWithinRange(position: UITextPosition, range: UITextRange): number;

	characterRangeAtPoint(point: CGPoint): UITextRange;

	characterRangeByExtendingPositionInDirection(position: UITextPosition, direction: UITextLayoutDirection): UITextRange;

	class(): typeof NSObject;

	clearButtonRectForBounds(bounds: CGRect): CGRect;

	closestPositionToPoint(point: CGPoint): UITextPosition;

	closestPositionToPointWithinRange(point: CGPoint, range: UITextRange): UITextPosition;

	comparePositionToPosition(position: UITextPosition, other: UITextPosition): NSComparisonResult;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	deleteBackward(): void;

	dictationRecognitionFailed(): void;

	dictationRecordingDidEnd(): void;

	drawPlaceholderInRect(rect: CGRect): void;

	/**
	 * @since 2.0
	 * @deprecated 15.0
	 */
	drawTextInRect(rect: CGRect): void;

	/**
	 * @since 16.0
	 */
	editMenuForTextRangeSuggestedActions(textRange: UITextRange, suggestedActions: NSArray<UIMenuElement> | UIMenuElement[]): UIMenu;

	editingRectForBounds(bounds: CGRect): CGRect;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 9.0
	 */
	endFloatingCursor(): void;

	firstRectForRange(range: UITextRange): CGRect;

	frameForDictationResultPlaceholder(placeholder: any): CGRect;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 18.0
	 */
	insertAdaptiveImageGlyphReplacementRange(adaptiveImageGlyph: NSAdaptiveImageGlyph, replacementRange: UITextRange): void;

	/**
	 * @since 12.0
	 */
	insertAttributedText(string: NSAttributedString): void;

	insertDictationResult(dictationResult: NSArray<UIDictationPhrase> | UIDictationPhrase[]): void;

	insertText(text: string): void;

	insertTextAlternativesStyle(text: string, alternatives: NSArray<string> | string[], style: UITextAlternativeStyle): void;

	insertTextPlaceholderWithSize(size: CGSize): UITextPlaceholder;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	leftViewRectForBounds(bounds: CGRect): CGRect;

	offsetFromPositionToPosition(from: UITextPosition, toPosition: UITextPosition): number;

	pasteItemProviders(itemProviders: NSArray<NSItemProvider> | NSItemProvider[]): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	placeholderRectForBounds(bounds: CGRect): CGRect;

	positionFromPositionInDirectionOffset(position: UITextPosition, direction: UITextLayoutDirection, offset: number): UITextPosition;

	positionFromPositionOffset(position: UITextPosition, offset: number): UITextPosition;

	positionWithinRangeAtCharacterOffset(range: UITextRange, offset: number): UITextPosition;

	positionWithinRangeFarthestInDirection(range: UITextRange, direction: UITextLayoutDirection): UITextPosition;

	removeDictationResultPlaceholderWillInsertResult(placeholder: any, willInsertResult: boolean): void;

	removeTextPlaceholder(textPlaceholder: UITextPlaceholder): void;

	/**
	 * @since 13.0
	 */
	replaceRangeWithAttributedText(range: UITextRange, attributedText: NSAttributedString): void;

	replaceRangeWithText(range: UITextRange, text: string): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	rightViewRectForBounds(bounds: CGRect): CGRect;

	/**
	 * @since 6.0
	 */
	selectionRectsForRange(range: UITextRange): NSArray<UITextSelectionRect>;

	self(): this;

	setAttributedMarkedTextSelectedRange(markedText: NSAttributedString, selectedRange: NSRange): void;

	setBaseWritingDirectionForRange(writingDirection: NSWritingDirection, range: UITextRange): void;

	setMarkedTextSelectedRange(markedText: string, selectedRange: NSRange): void;

	/**
	 * @since 6.0
	 */
	shouldChangeTextInRangeReplacementText(range: UITextRange, text: string): boolean;

	textInRange(range: UITextRange): string;

	textRangeFromPositionToPosition(fromPosition: UITextPosition, toPosition: UITextPosition): UITextRange;

	textRectForBounds(bounds: CGRect): CGRect;

	textStylingAtPositionInDirection(position: UITextPosition, direction: UITextStorageDirection): NSDictionary<string, any>;

	unmarkText(): void;

	/**
	 * @since 9.0
	 */
	updateFloatingCursorAtPoint(point: CGPoint): void;

	/**
	 * @since 16.0
	 */
	willDismissEditMenuWithAnimator(animator: UIEditMenuInteractionAnimating): void;

	/**
	 * @since 16.0
	 */
	willPresentEditMenuWithAnimator(animator: UIEditMenuInteractionAnimating): void;
}

interface UITextFieldDelegate extends NSObjectProtocol {

	textFieldDidBeginEditing?(textField: UITextField): void;

	/**
	 * @since 13.0
	 */
	textFieldDidChangeSelection?(textField: UITextField): void;

	textFieldDidEndEditing?(textField: UITextField): void;

	/**
	 * @since 10.0
	 */
	textFieldDidEndEditingReason?(textField: UITextField, reason: UITextFieldDidEndEditingReason): void;

	/**
	 * @since 16.0
	 */
	textFieldEditMenuForCharactersInRangeSuggestedActions?(textField: UITextField, range: NSRange, suggestedActions: NSArray<UIMenuElement> | UIMenuElement[]): UIMenu;

	textFieldShouldBeginEditing?(textField: UITextField): boolean;

	textFieldShouldChangeCharactersInRangeReplacementString?(textField: UITextField, range: NSRange, string: string): boolean;

	textFieldShouldClear?(textField: UITextField): boolean;

	textFieldShouldEndEditing?(textField: UITextField): boolean;

	textFieldShouldReturn?(textField: UITextField): boolean;

	/**
	 * @since 16.0
	 */
	textFieldWillDismissEditMenuWithAnimator?(textField: UITextField, animator: UIEditMenuInteractionAnimating): void;

	/**
	 * @since 16.0
	 */
	textFieldWillPresentEditMenuWithAnimator?(textField: UITextField, animator: UIEditMenuInteractionAnimating): void;
}
declare var UITextFieldDelegate: {

	prototype: UITextFieldDelegate;
};

/**
 * @since 10.0
 */
declare const enum UITextFieldDidEndEditingReason {

	Committed = 0,

	Cancelled = 1
}

/**
 * @since 10.0
 */
declare var UITextFieldDidEndEditingReasonKey: string;

declare var UITextFieldTextDidBeginEditingNotification: string;

declare var UITextFieldTextDidChangeNotification: string;

declare var UITextFieldTextDidEndEditingNotification: string;

declare const enum UITextFieldViewMode {

	Never = 0,

	WhileEditing = 1,

	UnlessEditing = 2,

	Always = 3
}

/**
 * @since 13.0
 */
declare class UITextFormattingCoordinator extends NSObject implements UIFontPickerViewControllerDelegate {

	static alloc(): UITextFormattingCoordinator; // inherited from NSObject

	static new(): UITextFormattingCoordinator; // inherited from NSObject

	static textFormattingCoordinatorForWindowScene(windowScene: UIWindowScene): UITextFormattingCoordinator;

	static toggleFontPanel(sender: any): void;

	delegate: UITextFormattingCoordinatorDelegate;

	static readonly fontPanelVisible: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { windowScene: UIWindowScene; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	fontPickerViewControllerDidCancel(viewController: UIFontPickerViewController): void;

	fontPickerViewControllerDidPickFont(viewController: UIFontPickerViewController): void;

	initWithWindowScene(windowScene: UIWindowScene): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	setSelectedAttributesIsMultiple(attributes: NSDictionary<string, any>, flag: boolean): void;
}

/**
 * @since 13.0
 */
interface UITextFormattingCoordinatorDelegate extends NSObjectProtocol {

	/**
	 * @since 13.0
	 */
	updateTextAttributesWithConversionHandler(conversionHandler: (p1: NSDictionary<string, any>) => NSDictionary<string, any>): void;
}
declare var UITextFormattingCoordinatorDelegate: {

	prototype: UITextFormattingCoordinatorDelegate;
};

/**
 * @since 18.0
 */
declare class UITextFormattingViewController extends UIViewController {

	static alloc(): UITextFormattingViewController; // inherited from NSObject

	static new(): UITextFormattingViewController; // inherited from NSObject

	readonly configuration: UITextFormattingViewControllerConfiguration;

	delegate: UITextFormattingViewControllerDelegate;

	formattingDescriptor: UITextFormattingViewControllerFormattingDescriptor;

	constructor(o: { configuration: UITextFormattingViewControllerConfiguration; });

	initWithConfiguration(configuration: UITextFormattingViewControllerConfiguration): this;
}

/**
 * @since 18.0
 */
declare class UITextFormattingViewControllerChangeValue extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UITextFormattingViewControllerChangeValue; // inherited from NSObject

	static new(): UITextFormattingViewControllerChangeValue; // inherited from NSObject

	readonly changeType: string;

	readonly color: UIColor;

	readonly font: UIFont;

	readonly formattingStyleKey: string;

	readonly highlight: string;

	readonly numberValue: number;

	readonly textAlignment: NSTextAlignment;

	readonly textList: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 18.0
 */
declare class UITextFormattingViewControllerComponent extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UITextFormattingViewControllerComponent; // inherited from NSObject

	static new(): UITextFormattingViewControllerComponent; // inherited from NSObject

	readonly componentKey: string;

	readonly preferredSize: UITextFormattingViewControllerComponentSize;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { componentKey: string; preferredSize: UITextFormattingViewControllerComponentSize; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithComponentKeyPreferredSize(componentKey: string, preferredSize: UITextFormattingViewControllerComponentSize): this;
}

/**
 * @since 18.0
 */
declare class UITextFormattingViewControllerComponentGroup extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UITextFormattingViewControllerComponentGroup; // inherited from NSObject

	static new(): UITextFormattingViewControllerComponentGroup; // inherited from NSObject

	readonly components: NSArray<UITextFormattingViewControllerComponent>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { components: NSArray<UITextFormattingViewControllerComponent> | UITextFormattingViewControllerComponent[]; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithComponents(components: NSArray<UITextFormattingViewControllerComponent> | UITextFormattingViewControllerComponent[]): this;
}

/**
 * @since 18.0
 */
declare const enum UITextFormattingViewControllerComponentSize {

	Automatic = 0,

	Mini = 1,

	Small = 2,

	Regular = 3,

	Large = 4,

	ExtraLarge = 5
}

/**
 * @since 18.0
 */
declare class UITextFormattingViewControllerConfiguration extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UITextFormattingViewControllerConfiguration; // inherited from NSObject

	static new(): UITextFormattingViewControllerConfiguration; // inherited from NSObject

	fontPickerConfiguration: UIFontPickerViewControllerConfiguration;

	formattingStyles: NSArray<UITextFormattingViewControllerFormattingStyle>;

	readonly groups: NSArray<UITextFormattingViewControllerComponentGroup>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { groups: NSArray<UITextFormattingViewControllerComponentGroup> | UITextFormattingViewControllerComponentGroup[]; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithGroups(groups: NSArray<UITextFormattingViewControllerComponentGroup> | UITextFormattingViewControllerComponentGroup[]): this;
}

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerDecreaseFontSizeChangeType: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerDecreaseIndentationChangeType: string;

/**
 * @since 18.0
 */
interface UITextFormattingViewControllerDelegate extends NSObjectProtocol {

	textFormattingDidFinish?(viewController: UITextFormattingViewController): void;

	textFormattingViewControllerDidChangeValue(viewController: UITextFormattingViewController, changeValue: UITextFormattingViewControllerChangeValue): void;

	textFormattingViewControllerShouldPresentColorPicker?(viewController: UITextFormattingViewController, colorPicker: UIColorPickerViewController): boolean;

	textFormattingViewControllerShouldPresentFontPicker?(viewController: UITextFormattingViewController, fontPicker: UIFontPickerViewController): boolean;
}
declare var UITextFormattingViewControllerDelegate: {

	prototype: UITextFormattingViewControllerDelegate;
};

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerFontAttributesComponentKey: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerFontChangeType: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerFontPickerComponentKey: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerFontPointSizeComponentKey: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerFontSizeChangeType: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerFontSizeComponentKey: string;

/**
 * @since 18.0
 */
declare class UITextFormattingViewControllerFormattingDescriptor extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UITextFormattingViewControllerFormattingDescriptor; // inherited from NSObject

	static new(): UITextFormattingViewControllerFormattingDescriptor; // inherited from NSObject

	fonts: NSArray<UIFont>;

	formattingStyleKey: string;

	highlights: NSSet<string>;

	lineHeight: number;

	strikethroughPresent: boolean;

	textAlignments: NSSet<string>;

	textColors: NSArray<UIColor>;

	textLists: NSSet<string>;

	underlinePresent: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { attributes: NSDictionary<string, any>; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { string: NSAttributedString; range: NSRange; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithAttributes(attributes: NSDictionary<string, any>): this;

	initWithCoder(coder: NSCoder): this;

	initWithStringRange(string: NSAttributedString, range: NSRange): this;
}

/**
 * @since 18.0
 */
declare class UITextFormattingViewControllerFormattingStyle extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UITextFormattingViewControllerFormattingStyle; // inherited from NSObject

	static new(): UITextFormattingViewControllerFormattingStyle; // inherited from NSObject

	readonly attributes: NSDictionary<string, any>;

	readonly styleKey: string;

	readonly title: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { styleKey: string; title: string; attributes: NSDictionary<string, any>; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithStyleKeyTitleAttributes(styleKey: string, string: string, attributes: NSDictionary<string, any>): this;
}

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerFormattingStyleChangeType: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerFormattingStylesComponentKey: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerHighlightBlue: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerHighlightChangeType: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerHighlightComponentKey: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerHighlightDefault: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerHighlightMint: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerHighlightOrange: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerHighlightPickerComponentKey: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerHighlightPink: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerHighlightPurple: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerIncreaseFontSizeChangeType: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerIncreaseIndentationChangeType: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerLineHeightComponentKey: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerLineHeightPointSizeChangeType: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerListStylesComponentKey: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerRemoveBoldChangeType: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerRemoveItalicChangeType: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerRemoveStrikethroughChangeType: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerRemoveUnderlineChangeType: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerSetBoldChangeType: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerSetItalicChangeType: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerSetStrikethroughChangeType: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerSetUnderlineChangeType: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerTextAlignmentAndJustificationComponentKey: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerTextAlignmentCenter: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerTextAlignmentChangeType: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerTextAlignmentComponentKey: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerTextAlignmentJustified: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerTextAlignmentLeft: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerTextAlignmentNatural: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerTextAlignmentRight: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerTextColorChangeType: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerTextColorComponentKey: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerTextIndentationComponentKey: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerTextListChangeType: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerTextListDecimal: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerTextListDisc: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerTextListHyphen: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerTextListOther: string;

/**
 * @since 18.0
 */
declare var UITextFormattingViewControllerUndefinedChangeType: string;

declare const enum UITextGranularity {

	Character = 0,

	Word = 1,

	Sentence = 2,

	Paragraph = 3,

	Line = 4,

	Document = 5
}

/**
 * @since 17.0
 */
declare const enum UITextInlinePredictionType {

	Default = 0,

	No = 1,

	Yes = 2
}

interface UITextInput extends UIKeyInput {

	beginningOfDocument: UITextPosition;

	/**
	 * @since 18.0
	 */
	editable?: boolean;

	endOfDocument: UITextPosition;

	inputDelegate: UITextInputDelegate;

	insertDictationResultPlaceholder?: any;

	markedTextRange: UITextRange;

	markedTextStyle: NSDictionary<string, any>;

	selectedTextRange: UITextRange;

	selectionAffinity?: UITextStorageDirection;

	/**
	 * @since 18.0
	 */
	supportsAdaptiveImageGlyph?: boolean;

	textInputView?: UIView;

	tokenizer: UITextInputTokenizer;

	baseWritingDirectionForPositionInDirection(position: UITextPosition, direction: UITextStorageDirection): NSWritingDirection;

	/**
	 * @since 9.0
	 */
	beginFloatingCursorAtPoint?(point: CGPoint): void;

	caretRectForPosition(position: UITextPosition): CGRect;

	/**
	 * @since 17.4
	 */
	caretTransformForPosition?(position: UITextPosition): CGAffineTransform;

	characterOffsetOfPositionWithinRange?(position: UITextPosition, range: UITextRange): number;

	characterRangeAtPoint(point: CGPoint): UITextRange;

	characterRangeByExtendingPositionInDirection(position: UITextPosition, direction: UITextLayoutDirection): UITextRange;

	closestPositionToPoint(point: CGPoint): UITextPosition;

	closestPositionToPointWithinRange(point: CGPoint, range: UITextRange): UITextPosition;

	comparePositionToPosition(position: UITextPosition, other: UITextPosition): NSComparisonResult;

	dictationRecognitionFailed?(): void;

	dictationRecordingDidEnd?(): void;

	/**
	 * @since 16.0
	 */
	editMenuForTextRangeSuggestedActions?(textRange: UITextRange, suggestedActions: NSArray<UIMenuElement> | UIMenuElement[]): UIMenu;

	/**
	 * @since 9.0
	 */
	endFloatingCursor?(): void;

	firstRectForRange(range: UITextRange): CGRect;

	frameForDictationResultPlaceholder?(placeholder: any): CGRect;

	/**
	 * @since 18.0
	 */
	insertAdaptiveImageGlyphReplacementRange?(adaptiveImageGlyph: NSAdaptiveImageGlyph, replacementRange: UITextRange): void;

	/**
	 * @since 12.0
	 */
	insertAttributedText?(string: NSAttributedString): void;

	insertDictationResult?(dictationResult: NSArray<UIDictationPhrase> | UIDictationPhrase[]): void;

	insertTextAlternativesStyle?(text: string, alternatives: NSArray<string> | string[], style: UITextAlternativeStyle): void;

	insertTextPlaceholderWithSize?(size: CGSize): UITextPlaceholder;

	offsetFromPositionToPosition(from: UITextPosition, toPosition: UITextPosition): number;

	positionFromPositionInDirectionOffset(position: UITextPosition, direction: UITextLayoutDirection, offset: number): UITextPosition;

	positionFromPositionOffset(position: UITextPosition, offset: number): UITextPosition;

	positionWithinRangeAtCharacterOffset?(range: UITextRange, offset: number): UITextPosition;

	positionWithinRangeFarthestInDirection(range: UITextRange, direction: UITextLayoutDirection): UITextPosition;

	removeDictationResultPlaceholderWillInsertResult?(placeholder: any, willInsertResult: boolean): void;

	removeTextPlaceholder?(textPlaceholder: UITextPlaceholder): void;

	/**
	 * @since 13.0
	 */
	replaceRangeWithAttributedText?(range: UITextRange, attributedText: NSAttributedString): void;

	replaceRangeWithText(range: UITextRange, text: string): void;

	/**
	 * @since 6.0
	 */
	selectionRectsForRange(range: UITextRange): NSArray<UITextSelectionRect>;

	setAttributedMarkedTextSelectedRange?(markedText: NSAttributedString, selectedRange: NSRange): void;

	setBaseWritingDirectionForRange(writingDirection: NSWritingDirection, range: UITextRange): void;

	setMarkedTextSelectedRange(markedText: string, selectedRange: NSRange): void;

	/**
	 * @since 6.0
	 */
	shouldChangeTextInRangeReplacementText?(range: UITextRange, text: string): boolean;

	textInRange(range: UITextRange): string;

	textRangeFromPositionToPosition(fromPosition: UITextPosition, toPosition: UITextPosition): UITextRange;

	textStylingAtPositionInDirection?(position: UITextPosition, direction: UITextStorageDirection): NSDictionary<string, any>;

	unmarkText(): void;

	/**
	 * @since 9.0
	 */
	updateFloatingCursorAtPoint?(point: CGPoint): void;

	/**
	 * @since 16.0
	 */
	willDismissEditMenuWithAnimator?(animator: UIEditMenuInteractionAnimating): void;

	/**
	 * @since 16.0
	 */
	willPresentEditMenuWithAnimator?(animator: UIEditMenuInteractionAnimating): void;
}
declare var UITextInput: {

	prototype: UITextInput;
};

/**
 * @since 9.0
 */
declare class UITextInputAssistantItem extends NSObject {

	static alloc(): UITextInputAssistantItem; // inherited from NSObject

	static new(): UITextInputAssistantItem; // inherited from NSObject

	allowsHidingShortcuts: boolean;

	leadingBarButtonGroups: NSArray<UIBarButtonItemGroup>;

	trailingBarButtonGroups: NSArray<UIBarButtonItemGroup>;
}

/**
 * @since 16.4
 */
declare class UITextInputContext extends NSObject {

	static alloc(): UITextInputContext; // inherited from NSObject

	static current(): UITextInputContext;

	static new(): UITextInputContext; // inherited from NSObject

	dictationInputExpected: boolean;

	hardwareKeyboardInputExpected: boolean;

	pencilInputExpected: boolean;
}

/**
 * @since 4.2
 */
declare var UITextInputCurrentInputModeDidChangeNotification: string;

interface UITextInputDelegate extends NSObjectProtocol {

	selectionDidChange(textInput: UITextInput): void;

	selectionWillChange(textInput: UITextInput): void;

	textDidChange(textInput: UITextInput): void;

	textWillChange(textInput: UITextInput): void;
}
declare var UITextInputDelegate: {

	prototype: UITextInputDelegate;
};

/**
 * @since 4.2
 */
declare class UITextInputMode extends NSObject implements NSSecureCoding {

	static alloc(): UITextInputMode; // inherited from NSObject

	/**
	 * @since 4.2
	 * @deprecated 7.0
	 */
	static currentInputMode(): UITextInputMode;

	static new(): UITextInputMode; // inherited from NSObject

	readonly primaryLanguage: string;

	static readonly activeInputModes: NSArray<UITextInputMode>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 12.0
 */
declare class UITextInputPasswordRules extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UITextInputPasswordRules; // inherited from NSObject

	static new(): UITextInputPasswordRules; // inherited from NSObject

	static passwordRulesWithDescriptor(passwordRulesDescriptor: string): UITextInputPasswordRules;

	readonly passwordRulesDescriptor: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 3.2
 */
declare class UITextInputStringTokenizer extends NSObject implements UITextInputTokenizer {

	static alloc(): UITextInputStringTokenizer; // inherited from NSObject

	static new(): UITextInputStringTokenizer; // inherited from NSObject

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { textInput: UIResponder & UITextInput; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithTextInput(textInput: UIResponder & UITextInput): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	isPositionAtBoundaryInDirection(position: UITextPosition, granularity: UITextGranularity, direction: number): boolean;

	isPositionWithinTextUnitInDirection(position: UITextPosition, granularity: UITextGranularity, direction: number): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	positionFromPositionToBoundaryInDirection(position: UITextPosition, granularity: UITextGranularity, direction: number): UITextPosition;

	rangeEnclosingPositionWithGranularityInDirection(position: UITextPosition, granularity: UITextGranularity, direction: number): UITextRange;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 3.2
 * @deprecated 8.0
 */
declare var UITextInputTextBackgroundColorKey: string;

/**
 * @since 3.2
 * @deprecated 8.0
 */
declare var UITextInputTextColorKey: string;

/**
 * @since 3.2
 * @deprecated 8.0
 */
declare var UITextInputTextFontKey: string;

interface UITextInputTokenizer extends NSObjectProtocol {

	isPositionAtBoundaryInDirection(position: UITextPosition, granularity: UITextGranularity, direction: number): boolean;

	isPositionWithinTextUnitInDirection(position: UITextPosition, granularity: UITextGranularity, direction: number): boolean;

	positionFromPositionToBoundaryInDirection(position: UITextPosition, granularity: UITextGranularity, direction: number): UITextPosition;

	rangeEnclosingPositionWithGranularityInDirection(position: UITextPosition, granularity: UITextGranularity, direction: number): UITextRange;
}
declare var UITextInputTokenizer: {

	prototype: UITextInputTokenizer;
};

interface UITextInputTraits extends NSObjectProtocol {

	autocapitalizationType?: UITextAutocapitalizationType;

	autocorrectionType?: UITextAutocorrectionType;

	enablesReturnKeyAutomatically?: boolean;

	/**
	 * @since 17.0
	 */
	inlinePredictionType?: UITextInlinePredictionType;

	keyboardAppearance?: UIKeyboardAppearance;

	keyboardType?: UIKeyboardType;

	/**
	 * @since 18.0
	 */
	mathExpressionCompletionType?: UITextMathExpressionCompletionType;

	/**
	 * @since 12.0
	 */
	passwordRules?: UITextInputPasswordRules;

	returnKeyType?: UIReturnKeyType;

	secureTextEntry?: boolean;

	/**
	 * @since 11.0
	 */
	smartDashesType?: UITextSmartDashesType;

	/**
	 * @since 11.0
	 */
	smartInsertDeleteType?: UITextSmartInsertDeleteType;

	/**
	 * @since 11.0
	 */
	smartQuotesType?: UITextSmartQuotesType;

	/**
	 * @since 5.0
	 */
	spellCheckingType?: UITextSpellCheckingType;

	/**
	 * @since 10.0
	 */
	textContentType?: string;

	/**
	 * @since 18.0
	 */
	writingToolsAllowedInputOptions?: UIWritingToolsAllowedInputOptions;

	/**
	 * @since 18.0
	 */
	writingToolsBehavior?: UIWritingToolsBehavior;
}
declare var UITextInputTraits: {

	prototype: UITextInputTraits;
};

/**
 * @since 13.0
 */
declare class UITextInteraction extends NSObject implements UIInteraction {

	static alloc(): UITextInteraction; // inherited from NSObject

	static new(): UITextInteraction; // inherited from NSObject

	static textInteractionForMode(mode: UITextInteractionMode): UITextInteraction;

	delegate: UITextInteractionDelegate;

	readonly gesturesForFailureRequirements: NSArray<UIGestureRecognizer>;

	textInput: UIResponder & UITextInput;

	readonly textInteractionMode: UITextInteractionMode;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly view: UIView; // inherited from UIInteraction

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	didMoveToView(view: UIView): void;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	willMoveToView(view: UIView): void;
}

/**
 * @since 13.0
 */
interface UITextInteractionDelegate extends NSObjectProtocol {

	interactionDidEnd?(interaction: UITextInteraction): void;

	interactionShouldBeginAtPoint?(interaction: UITextInteraction, point: CGPoint): boolean;

	interactionWillBegin?(interaction: UITextInteraction): void;
}
declare var UITextInteractionDelegate: {

	prototype: UITextInteractionDelegate;
};

declare const enum UITextInteractionMode {

	Editable = 0,

	NonEditable = 1
}

/**
 * @since 17.0
 */
declare class UITextItem extends NSObject {

	static alloc(): UITextItem; // inherited from NSObject

	static new(): UITextItem; // inherited from NSObject

	readonly contentType: UITextItemContentType;

	readonly link: NSURL;

	readonly range: NSRange;

	readonly tagIdentifier: string;

	readonly textAttachment: NSTextAttachment;
}

/**
 * @since 17.0
 */
declare const enum UITextItemContentType {

	Link = 0,

	TextAttachment = 1,

	Tag = 2
}

/**
 * @since 10.0
 * @deprecated 17.0
 */
declare const enum UITextItemInteraction {

	InvokeDefaultAction = 0,

	PresentActions = 1,

	Preview = 2
}

/**
 * @since 17.0
 */
declare class UITextItemMenuConfiguration extends NSObject {

	static alloc(): UITextItemMenuConfiguration; // inherited from NSObject

	static configurationWithMenu(menu: UIMenu): UITextItemMenuConfiguration;

	static configurationWithPreviewMenu(preview: UITextItemMenuPreview, menu: UIMenu): UITextItemMenuConfiguration;

	static new(): UITextItemMenuConfiguration; // inherited from NSObject
}

/**
 * @since 17.0
 */
declare class UITextItemMenuPreview extends NSObject {

	static alloc(): UITextItemMenuPreview; // inherited from NSObject

	static defaultPreview(): UITextItemMenuPreview;

	static new(): UITextItemMenuPreview; // inherited from NSObject

	constructor(o: { view: UIView; });

	initWithView(view: UIView): this;
}

/**
 * @since 17.0
 */
declare var UITextItemTagAttributeName: string;

declare const enum UITextLayoutDirection {

	Right = 2,

	Left = 3,

	Up = 4,

	Down = 5
}

/**
 * @since 17.0
 */
declare class UITextLoupeSession extends NSObject {

	static alloc(): UITextLoupeSession; // inherited from NSObject

	static beginLoupeSessionAtPointFromSelectionWidgetViewInView(point: CGPoint, selectionWidget: UIView, interactionView: UIView): UITextLoupeSession;

	static new(): UITextLoupeSession; // inherited from NSObject

	invalidate(): void;

	moveToPointWithCaretRectTrackingCaret(point: CGPoint, caretRect: CGRect, tracksCaret: boolean): void;
}

/**
 * @since 18.0
 */
declare const enum UITextMathExpressionCompletionType {

	Default = 0,

	No = 1,

	Yes = 2
}

/**
 * @since 11.0
 */
interface UITextPasteConfigurationSupporting extends UIPasteConfigurationSupporting {

	pasteDelegate: UITextPasteDelegate;
}
declare var UITextPasteConfigurationSupporting: {

	prototype: UITextPasteConfigurationSupporting;
};

/**
 * @since 11.0
 */
interface UITextPasteDelegate extends NSObjectProtocol {

	textPasteConfigurationSupportingCombineItemAttributedStringsForRange?(textPasteConfigurationSupporting: UITextPasteConfigurationSupporting, itemStrings: NSArray<NSAttributedString> | NSAttributedString[], textRange: UITextRange): NSAttributedString;

	textPasteConfigurationSupportingPerformPasteOfAttributedStringToRange?(textPasteConfigurationSupporting: UITextPasteConfigurationSupporting, attributedString: NSAttributedString, textRange: UITextRange): UITextRange;

	textPasteConfigurationSupportingShouldAnimatePasteOfAttributedStringToRange?(textPasteConfigurationSupporting: UITextPasteConfigurationSupporting, attributedString: NSAttributedString, textRange: UITextRange): boolean;

	textPasteConfigurationSupportingTransformPasteItem?(textPasteConfigurationSupporting: UITextPasteConfigurationSupporting, item: UITextPasteItem): void;
}
declare var UITextPasteDelegate: {

	prototype: UITextPasteDelegate;
};

/**
 * @since 11.0
 */
interface UITextPasteItem extends NSObjectProtocol {

	defaultAttributes: NSDictionary<string, any>;

	itemProvider: NSItemProvider;

	localObject: any;

	setAttachmentResult(textAttachment: NSTextAttachment): void;

	setAttributedStringResult(string: NSAttributedString): void;

	setDefaultResult(): void;

	setNoResult(): void;

	setStringResult(string: string): void;
}
declare var UITextPasteItem: {

	prototype: UITextPasteItem;
};

/**
 * @since 13.0
 */
declare class UITextPlaceholder extends NSObject {

	static alloc(): UITextPlaceholder; // inherited from NSObject

	static new(): UITextPlaceholder; // inherited from NSObject

	readonly rects: NSArray<UITextSelectionRect>;
}

/**
 * @since 3.2
 */
declare class UITextPosition extends NSObject {

	static alloc(): UITextPosition; // inherited from NSObject

	static new(): UITextPosition; // inherited from NSObject
}

/**
 * @since 3.2
 */
declare class UITextRange extends NSObject {

	static alloc(): UITextRange; // inherited from NSObject

	static new(): UITextRange; // inherited from NSObject

	readonly empty: boolean;

	readonly end: UITextPosition;

	readonly start: UITextPosition;
}

/**
 * @since 16.0
 */
interface UITextSearchAggregator extends NSObjectProtocol {

	allFoundRanges: NSOrderedSet<UITextRange>;

	finishedSearching(): void;

	foundRangeForSearchStringInDocument(range: UITextRange, string: string, document: any): void;

	invalidate(): void;

	invalidateFoundRangeInDocument(range: UITextRange, document: any): void;
}
declare var UITextSearchAggregator: {

	prototype: UITextSearchAggregator;
};

/**
 * @since 16.0
 */
declare const enum UITextSearchFoundTextStyle {

	Normal = 0,

	Found = 1,

	Highlighted = 2
}

declare const enum UITextSearchMatchMethod {

	Contains = 0,

	StartsWith = 1,

	FullWord = 2
}

/**
 * @since 16.0
 */
declare class UITextSearchOptions extends NSObject {

	static alloc(): UITextSearchOptions; // inherited from NSObject

	static new(): UITextSearchOptions; // inherited from NSObject

	readonly stringCompareOptions: NSStringCompareOptions;

	readonly wordMatchMethod: UITextSearchMatchMethod;
}

/**
 * @since 16.0
 */
interface UITextSearching extends NSObjectProtocol {

	selectedTextRange: UITextRange;

	selectedTextSearchDocument?: any;

	supportsTextReplacement?: boolean;

	clearAllDecoratedFoundText(): void;

	compareFoundRangeToRangeInDocument(foundRange: UITextRange, toRange: UITextRange, document: any): NSComparisonResult;

	compareOrderFromDocumentToDocument?(fromDocument: any, toDocument: any): NSComparisonResult;

	decorateFoundTextRangeInDocumentUsingStyle(range: UITextRange, document: any, style: UITextSearchFoundTextStyle): void;

	performTextSearchWithQueryStringUsingOptionsResultAggregator(string: string, options: UITextSearchOptions, aggregator: UITextSearchAggregator): void;

	replaceAllOccurrencesOfQueryStringUsingOptionsWithText?(queryString: string, options: UITextSearchOptions, replacementText: string): void;

	replaceFoundTextInRangeInDocumentWithText?(range: UITextRange, document: any, replacementText: string): void;

	scrollRangeToVisibleInDocument?(range: UITextRange, document: any): void;

	shouldReplaceFoundTextInRangeInDocumentWithText?(range: UITextRange, document: any, replacementText: string): boolean;

	willHighlightFoundTextRangeInDocument?(range: UITextRange, document: any): void;
}
declare var UITextSearching: {

	prototype: UITextSearching;
};

/**
 * @since 16.0
 */
declare class UITextSearchingFindSession extends UIFindSession {

	static alloc(): UITextSearchingFindSession; // inherited from NSObject

	static new(): UITextSearchingFindSession; // inherited from NSObject

	readonly searchableObject: UITextSearching;

	constructor(o: { searchableObject: UITextSearching; });

	initWithSearchableObject(searchableObject: UITextSearching): this;
}

/**
 * @since 17.0
 */
declare class UITextSelectionDisplayInteraction extends NSObject implements UIInteraction {

	static alloc(): UITextSelectionDisplayInteraction; // inherited from NSObject

	static new(): UITextSelectionDisplayInteraction; // inherited from NSObject

	activated: boolean;

	cursorView: UIView & UITextCursorView;

	readonly delegate: UITextSelectionDisplayInteractionDelegate;

	handleViews: NSArray<UIView & UITextSelectionHandleView>;

	highlightView: UIView & UITextSelectionHighlightView;

	readonly textInput: UITextInput;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly view: UIView; // inherited from UIInteraction

	readonly  // inherited from NSObjectProtocol

	constructor(o: { textInput: UITextInput; delegate: UITextSelectionDisplayInteractionDelegate; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	didMoveToView(view: UIView): void;

	initWithTextInputDelegate(textInput: UITextInput, delegate: UITextSelectionDisplayInteractionDelegate): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	layoutManagedSubviews(): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	setNeedsSelectionUpdate(): void;

	willMoveToView(view: UIView): void;
}

/**
 * @since 17.0
 */
interface UITextSelectionDisplayInteractionDelegate extends NSObjectProtocol {

	selectionContainerViewBelowTextForSelectionDisplayInteraction?(interaction: UITextSelectionDisplayInteraction): UIView;
}
declare var UITextSelectionDisplayInteractionDelegate: {

	prototype: UITextSelectionDisplayInteractionDelegate;
};

/**
 * @since 17.0
 */
interface UITextSelectionHandleView extends UICoordinateSpace {

	customShape: UIBezierPath;

	direction: NSDirectionalRectEdge;

	vertical: boolean;

	preferredFrameForRect(rect: CGRect): CGRect;
}
declare var UITextSelectionHandleView: {

	prototype: UITextSelectionHandleView;
};

/**
 * @since 17.0
 */
interface UITextSelectionHighlightView extends UICoordinateSpace {

	selectionRects: NSArray<UITextSelectionRect>;
}
declare var UITextSelectionHighlightView: {

	prototype: UITextSelectionHighlightView;
};

/**
 * @since 6.0
 */
declare class UITextSelectionRect extends NSObject {

	static alloc(): UITextSelectionRect; // inherited from NSObject

	static new(): UITextSelectionRect; // inherited from NSObject

	readonly containsEnd: boolean;

	readonly containsStart: boolean;

	readonly isVertical: boolean;

	readonly rect: CGRect;

	/**
	 * @since 17.4
	 */
	readonly transform: CGAffineTransform;

	readonly writingDirection: NSWritingDirection;
}

/**
 * @since 11.0
 */
declare const enum UITextSmartDashesType {

	Default = 0,

	No = 1,

	Yes = 2
}

/**
 * @since 11.0
 */
declare const enum UITextSmartInsertDeleteType {

	Default = 0,

	No = 1,

	Yes = 2
}

/**
 * @since 11.0
 */
declare const enum UITextSmartQuotesType {

	Default = 0,

	No = 1,

	Yes = 2
}

/**
 * @since 5.0
 */
declare const enum UITextSpellCheckingType {

	Default = 0,

	No = 1,

	Yes = 2
}

declare const enum UITextStorageDirection {

	Forward = 0,

	Backward = 1
}

/**
 * @since 2.0
 */
declare class UITextView extends UIScrollView implements UIContentSizeCategoryAdjusting, UIFindInteractionDelegate, UILetterformAwareAdjusting, UITextDraggable, UITextDroppable, UITextInput, UITextPasteConfigurationSupporting, UITextSearching {

	static alloc(): UITextView; // inherited from NSObject

	static appearance(): UITextView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UITextView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UITextView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UITextView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UITextView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UITextView; // inherited from UIAppearance

	static new(): UITextView; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	static textViewUsingTextLayoutManager(usingTextLayoutManager: boolean): UITextView;

	/**
	 * @since 6.0
	 */
	allowsEditingTextAttributes: boolean;

	/**
	 * @since 6.0
	 */
	attributedText: NSAttributedString;

	/**
	 * @since 17.0
	 */
	borderStyle: UITextViewBorderStyle;

	/**
	 * @since 6.0
	 */
	clearsOnInsertion: boolean;

	/**
	 * @since 3.0
	 */
	dataDetectorTypes: UIDataDetectorTypes;

	delegate: UITextViewDelegate;

	editable: boolean;

	/**
	 * @since 16.0
	 */
	readonly findInteraction: UIFindInteraction;

	/**
	 * @since 16.0
	 */
	findInteractionEnabled: boolean;

	font: UIFont;

	inputAccessoryView: UIView;

	inputView: UIView;

	/**
	 * @since 15.0
	 */
	interactionState: any;

	/**
	 * @since 7.0
	 */
	readonly layoutManager: NSLayoutManager;

	/**
	 * @since 7.0
	 */
	linkTextAttributes: NSDictionary<string, any>;

	/**
	 * @since 7.0
	 */
	selectable: boolean;

	selectedRange: NSRange;

	text: string;

	textAlignment: NSTextAlignment;

	textColor: UIColor;

	/**
	 * @since 7.0
	 */
	readonly textContainer: NSTextContainer;

	/**
	 * @since 7.0
	 */
	textContainerInset: UIEdgeInsets;

	/**
	 * @since 18.0
	 */
	textFormattingConfiguration: UITextFormattingViewControllerConfiguration;

	/**
	 * @since 18.0
	 */
	textHighlightAttributes: NSDictionary<string, any>;

	/**
	 * @since 16.0
	 */
	readonly textLayoutManager: NSTextLayoutManager;

	/**
	 * @since 7.0
	 */
	readonly textStorage: NSTextStorage;

	/**
	 * @since 6.0
	 */
	typingAttributes: NSDictionary<string, any>;

	/**
	 * @since 13.0
	 */
	usesStandardTextScaling: boolean;

	/**
	 * @since 18.0
	 */
	readonly writingToolsActive: boolean;

	adjustsFontForContentSizeCategory: boolean; // inherited from UIContentSizeCategoryAdjusting

	autocapitalizationType: UITextAutocapitalizationType; // inherited from UITextInputTraits

	autocorrectionType: UITextAutocorrectionType; // inherited from UITextInputTraits

	readonly beginningOfDocument: UITextPosition; // inherited from UITextInput

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	enablesReturnKeyAutomatically: boolean; // inherited from UITextInputTraits

	readonly endOfDocument: UITextPosition; // inherited from UITextInput

	readonly hasText: boolean; // inherited from UIKeyInput

	readonly hash: number; // inherited from NSObjectProtocol

	/**
	 * @since 17.0
	 */
	inlinePredictionType: UITextInlinePredictionType; // inherited from UITextInputTraits

	inputDelegate: UITextInputDelegate; // inherited from UITextInput

	readonly insertDictationResultPlaceholder: any; // inherited from UITextInput

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	keyboardAppearance: UIKeyboardAppearance; // inherited from UITextInputTraits

	keyboardType: UIKeyboardType; // inherited from UITextInputTraits

	readonly markedTextRange: UITextRange; // inherited from UITextInput

	markedTextStyle: NSDictionary<string, any>; // inherited from UITextInput

	/**
	 * @since 18.0
	 */
	mathExpressionCompletionType: UITextMathExpressionCompletionType; // inherited from UITextInputTraits

	/**
	 * @since 12.0
	 */
	passwordRules: UITextInputPasswordRules; // inherited from UITextInputTraits

	pasteConfiguration: UIPasteConfiguration; // inherited from UIPasteConfigurationSupporting

	pasteDelegate: UITextPasteDelegate; // inherited from UITextPasteConfigurationSupporting

	returnKeyType: UIReturnKeyType; // inherited from UITextInputTraits

	secureTextEntry: boolean; // inherited from UITextInputTraits

	selectedTextRange: UITextRange; // inherited from UITextInput

	readonly selectedTextSearchDocument: any; // inherited from UITextSearching

	selectionAffinity: UITextStorageDirection; // inherited from UITextInput

	sizingRule: UILetterformAwareSizingRule; // inherited from UILetterformAwareAdjusting

	/**
	 * @since 11.0
	 */
	smartDashesType: UITextSmartDashesType; // inherited from UITextInputTraits

	/**
	 * @since 11.0
	 */
	smartInsertDeleteType: UITextSmartInsertDeleteType; // inherited from UITextInputTraits

	/**
	 * @since 11.0
	 */
	smartQuotesType: UITextSmartQuotesType; // inherited from UITextInputTraits

	/**
	 * @since 5.0
	 */
	spellCheckingType: UITextSpellCheckingType; // inherited from UITextInputTraits

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	/**
	 * @since 18.0
	 */
	supportsAdaptiveImageGlyph: boolean; // inherited from UITextInput

	readonly supportsTextReplacement: boolean; // inherited from UITextSearching

	/**
	 * @since 10.0
	 */
	textContentType: string; // inherited from UITextInputTraits

	readonly textDragActive: boolean; // inherited from UITextDraggable

	textDragDelegate: UITextDragDelegate; // inherited from UITextDraggable

	readonly textDragInteraction: UIDragInteraction; // inherited from UITextDraggable

	textDragOptions: UITextDragOptions; // inherited from UITextDraggable

	readonly textDropActive: boolean; // inherited from UITextDroppable

	textDropDelegate: UITextDropDelegate; // inherited from UITextDroppable

	readonly textDropInteraction: UIDropInteraction; // inherited from UITextDroppable

	readonly textInputView: UIView; // inherited from UITextInput

	readonly tokenizer: UITextInputTokenizer; // inherited from UITextInput

	/**
	 * @since 18.0
	 */
	writingToolsAllowedInputOptions: UIWritingToolsAllowedInputOptions; // inherited from UITextInputTraits

	/**
	 * @since 18.0
	 */
	writingToolsBehavior: UIWritingToolsBehavior; // inherited from UITextInputTraits

	readonly  // inherited from NSObjectProtocol

	/**
	 * @since 7.0
	 */
	constructor(o: { frame: CGRect; textContainer: NSTextContainer; });

	baseWritingDirectionForPositionInDirection(position: UITextPosition, direction: UITextStorageDirection): NSWritingDirection;

	/**
	 * @since 9.0
	 */
	beginFloatingCursorAtPoint(point: CGPoint): void;

	canPasteItemProviders(itemProviders: NSArray<NSItemProvider> | NSItemProvider[]): boolean;

	caretRectForPosition(position: UITextPosition): CGRect;

	/**
	 * @since 17.4
	 */
	caretTransformForPosition(position: UITextPosition): CGAffineTransform;

	characterOffsetOfPositionWithinRange(position: UITextPosition, range: UITextRange): number;

	characterRangeAtPoint(point: CGPoint): UITextRange;

	characterRangeByExtendingPositionInDirection(position: UITextPosition, direction: UITextLayoutDirection): UITextRange;

	class(): typeof NSObject;

	clearAllDecoratedFoundText(): void;

	closestPositionToPoint(point: CGPoint): UITextPosition;

	closestPositionToPointWithinRange(point: CGPoint, range: UITextRange): UITextPosition;

	compareFoundRangeToRangeInDocument(foundRange: UITextRange, toRange: UITextRange, document: any): NSComparisonResult;

	compareOrderFromDocumentToDocument(fromDocument: any, toDocument: any): NSComparisonResult;

	comparePositionToPosition(position: UITextPosition, other: UITextPosition): NSComparisonResult;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	decorateFoundTextRangeInDocumentUsingStyle(range: UITextRange, document: any, style: UITextSearchFoundTextStyle): void;

	deleteBackward(): void;

	dictationRecognitionFailed(): void;

	dictationRecordingDidEnd(): void;

	/**
	 * @since 18.0
	 */
	drawTextHighlightBackgroundForTextRangeOrigin(textRange: NSTextRange, origin: CGPoint): void;

	/**
	 * @since 16.0
	 */
	editMenuForTextRangeSuggestedActions(textRange: UITextRange, suggestedActions: NSArray<UIMenuElement> | UIMenuElement[]): UIMenu;

	/**
	 * @since 9.0
	 */
	endFloatingCursor(): void;

	findInteractionDidBeginFindSession(interaction: UIFindInteraction, session: UIFindSession): void;

	findInteractionDidEndFindSession(interaction: UIFindInteraction, session: UIFindSession): void;

	findInteractionSessionForView(interaction: UIFindInteraction, view: UIView): UIFindSession;

	firstRectForRange(range: UITextRange): CGRect;

	frameForDictationResultPlaceholder(placeholder: any): CGRect;

	/**
	 * @since 7.0
	 */
	initWithFrameTextContainer(frame: CGRect, textContainer: NSTextContainer): this;

	/**
	 * @since 18.0
	 */
	insertAdaptiveImageGlyphReplacementRange(adaptiveImageGlyph: NSAdaptiveImageGlyph, replacementRange: UITextRange): void;

	/**
	 * @since 12.0
	 */
	insertAttributedText(string: NSAttributedString): void;

	insertDictationResult(dictationResult: NSArray<UIDictationPhrase> | UIDictationPhrase[]): void;

	insertText(text: string): void;

	insertTextAlternativesStyle(text: string, alternatives: NSArray<string> | string[], style: UITextAlternativeStyle): void;

	insertTextPlaceholderWithSize(size: CGSize): UITextPlaceholder;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	offsetFromPositionToPosition(from: UITextPosition, toPosition: UITextPosition): number;

	pasteItemProviders(itemProviders: NSArray<NSItemProvider> | NSItemProvider[]): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	performTextSearchWithQueryStringUsingOptionsResultAggregator(string: string, options: UITextSearchOptions, aggregator: UITextSearchAggregator): void;

	positionFromPositionInDirectionOffset(position: UITextPosition, direction: UITextLayoutDirection, offset: number): UITextPosition;

	positionFromPositionOffset(position: UITextPosition, offset: number): UITextPosition;

	positionWithinRangeAtCharacterOffset(range: UITextRange, offset: number): UITextPosition;

	positionWithinRangeFarthestInDirection(range: UITextRange, direction: UITextLayoutDirection): UITextPosition;

	removeDictationResultPlaceholderWillInsertResult(placeholder: any, willInsertResult: boolean): void;

	removeTextPlaceholder(textPlaceholder: UITextPlaceholder): void;

	replaceAllOccurrencesOfQueryStringUsingOptionsWithText(queryString: string, options: UITextSearchOptions, replacementText: string): void;

	replaceFoundTextInRangeInDocumentWithText(range: UITextRange, document: any, replacementText: string): void;

	/**
	 * @since 13.0
	 */
	replaceRangeWithAttributedText(range: UITextRange, attributedText: NSAttributedString): void;

	replaceRangeWithText(range: UITextRange, text: string): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	scrollRangeToVisible(range: NSRange): void;

	scrollRangeToVisibleInDocument(range: UITextRange, document: any): void;

	/**
	 * @since 6.0
	 */
	selectionRectsForRange(range: UITextRange): NSArray<UITextSelectionRect>;

	self(): this;

	setAttributedMarkedTextSelectedRange(markedText: NSAttributedString, selectedRange: NSRange): void;

	setBaseWritingDirectionForRange(writingDirection: NSWritingDirection, range: UITextRange): void;

	setMarkedTextSelectedRange(markedText: string, selectedRange: NSRange): void;

	/**
	 * @since 6.0
	 */
	shouldChangeTextInRangeReplacementText(range: UITextRange, text: string): boolean;

	shouldReplaceFoundTextInRangeInDocumentWithText(range: UITextRange, document: any, replacementText: string): boolean;

	textInRange(range: UITextRange): string;

	textRangeFromPositionToPosition(fromPosition: UITextPosition, toPosition: UITextPosition): UITextRange;

	textStylingAtPositionInDirection(position: UITextPosition, direction: UITextStorageDirection): NSDictionary<string, any>;

	unmarkText(): void;

	/**
	 * @since 9.0
	 */
	updateFloatingCursorAtPoint(point: CGPoint): void;

	/**
	 * @since 16.0
	 */
	willDismissEditMenuWithAnimator(animator: UIEditMenuInteractionAnimating): void;

	willHighlightFoundTextRangeInDocument(range: UITextRange, document: any): void;

	/**
	 * @since 16.0
	 */
	willPresentEditMenuWithAnimator(animator: UIEditMenuInteractionAnimating): void;
}

/**
 * @since 17.0
 */
declare const enum UITextViewBorderStyle {

	None = 0,

	RoundedRect = 1
}

interface UITextViewDelegate extends NSObjectProtocol, UIScrollViewDelegate {

	textViewDidBeginEditing?(textView: UITextView): void;

	/**
	 * @since 18.0
	 */
	textViewDidBeginFormattingWithViewController?(textView: UITextView, viewController: UITextFormattingViewController): void;

	textViewDidChange?(textView: UITextView): void;

	textViewDidChangeSelection?(textView: UITextView): void;

	textViewDidEndEditing?(textView: UITextView): void;

	/**
	 * @since 18.0
	 */
	textViewDidEndFormattingWithViewController?(textView: UITextView, viewController: UITextFormattingViewController): void;

	/**
	 * @since 16.0
	 */
	textViewEditMenuForTextInRangeSuggestedActions?(textView: UITextView, range: NSRange, suggestedActions: NSArray<UIMenuElement> | UIMenuElement[]): UIMenu;

	/**
	 * @since 17.0
	 */
	textViewMenuConfigurationForTextItemDefaultMenu?(textView: UITextView, textItem: UITextItem, defaultMenu: UIMenu): UITextItemMenuConfiguration;

	/**
	 * @since 17.0
	 */
	textViewPrimaryActionForTextItemDefaultAction?(textView: UITextView, textItem: UITextItem, defaultAction: UIAction): UIAction;

	textViewShouldBeginEditing?(textView: UITextView): boolean;

	textViewShouldChangeTextInRangeReplacementText?(textView: UITextView, range: NSRange, text: string): boolean;

	textViewShouldEndEditing?(textView: UITextView): boolean;

	/**
	 * @since 7.0
	 * @deprecated 10.0
	 */
	textViewShouldInteractWithTextAttachmentInRange?(textView: UITextView, textAttachment: NSTextAttachment, characterRange: NSRange): boolean;

	/**
	 * @since 10.0
	 * @deprecated 17.0
	 */
	textViewShouldInteractWithTextAttachmentInRangeInteraction?(textView: UITextView, textAttachment: NSTextAttachment, characterRange: NSRange, interaction: UITextItemInteraction): boolean;

	/**
	 * @since 7.0
	 * @deprecated 10.0
	 */
	textViewShouldInteractWithURLInRange?(textView: UITextView, URL: NSURL, characterRange: NSRange): boolean;

	/**
	 * @since 10.0
	 * @deprecated 17.0
	 */
	textViewShouldInteractWithURLInRangeInteraction?(textView: UITextView, URL: NSURL, characterRange: NSRange, interaction: UITextItemInteraction): boolean;

	/**
	 * @since 17.0
	 */
	textViewTextItemMenuWillDisplayForTextItemAnimator?(textView: UITextView, textItem: UITextItem, animator: UIContextMenuInteractionAnimating): void;

	/**
	 * @since 17.0
	 */
	textViewTextItemMenuWillEndForTextItemAnimator?(textView: UITextView, textItem: UITextItem, animator: UIContextMenuInteractionAnimating): void;

	/**
	 * @since 18.0
	 */
	textViewWillBeginFormattingWithViewController?(textView: UITextView, viewController: UITextFormattingViewController): void;

	/**
	 * @since 16.0
	 */
	textViewWillDismissEditMenuWithAnimator?(textView: UITextView, animator: UIEditMenuInteractionAnimating): void;

	/**
	 * @since 18.0
	 */
	textViewWillEndFormattingWithViewController?(textView: UITextView, viewController: UITextFormattingViewController): void;

	/**
	 * @since 16.0
	 */
	textViewWillPresentEditMenuWithAnimator?(textView: UITextView, animator: UIEditMenuInteractionAnimating): void;

	/**
	 * @since 18.0
	 */
	textViewWritingToolsDidEnd?(textView: UITextView): void;

	/**
	 * @since 18.0
	 */
	textViewWritingToolsIgnoredRangesInEnclosingRange?(textView: UITextView, enclosingRange: NSRange): NSArray<NSValue>;

	/**
	 * @since 18.0
	 */
	textViewWritingToolsWillBegin?(textView: UITextView): void;
}
declare var UITextViewDelegate: {

	prototype: UITextViewDelegate;
};

declare var UITextViewTextDidBeginEditingNotification: string;

declare var UITextViewTextDidChangeNotification: string;

declare var UITextViewTextDidEndEditingNotification: string;

/**
 * @since 3.2
 * @deprecated 13.0
 */
declare var UITextWritingDirectionLeftToRight: NSWritingDirection;

/**
 * @since 3.2
 * @deprecated 13.0
 */
declare var UITextWritingDirectionNatural: NSWritingDirection;

/**
 * @since 3.2
 * @deprecated 13.0
 */
declare var UITextWritingDirectionRightToLeft: NSWritingDirection;

interface UITimingCurveProvider extends NSCoding, NSCopying {

	cubicTimingParameters: UICubicTimingParameters;

	springTimingParameters: UISpringTimingParameters;

	timingCurveType: UITimingCurveType;
}
declare var UITimingCurveProvider: {

	prototype: UITimingCurveProvider;
};

/**
 * @since 10.0
 */
declare const enum UITimingCurveType {

	Builtin = 0,

	Cubic = 1,

	Spring = 2,

	Composed = 3
}

/**
 * @since 15.0
 */
declare class UIToolTipConfiguration extends NSObject {

	static alloc(): UIToolTipConfiguration; // inherited from NSObject

	static configurationWithToolTip(toolTip: string): UIToolTipConfiguration;

	static configurationWithToolTipInRect(toolTip: string, sourceRect: CGRect): UIToolTipConfiguration;

	static new(): UIToolTipConfiguration; // inherited from NSObject

	readonly sourceRect: CGRect;

	readonly toolTip: string;
}

/**
 * @since 15.0
 */
declare class UIToolTipInteraction extends NSObject implements UIInteraction {

	static alloc(): UIToolTipInteraction; // inherited from NSObject

	static new(): UIToolTipInteraction; // inherited from NSObject

	defaultToolTip: string;

	delegate: UIToolTipInteractionDelegate;

	enabled: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly view: UIView; // inherited from UIInteraction

	readonly  // inherited from NSObjectProtocol

	constructor(o: { defaultToolTip: string; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	didMoveToView(view: UIView): void;

	initWithDefaultToolTip(defaultToolTip: string): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	willMoveToView(view: UIView): void;
}

/**
 * @since 15.0
 */
interface UIToolTipInteractionDelegate extends NSObjectProtocol {

	toolTipInteractionConfigurationAtPoint?(interaction: UIToolTipInteraction, point: CGPoint): UIToolTipConfiguration;
}
declare var UIToolTipInteractionDelegate: {

	prototype: UIToolTipInteractionDelegate;
};

/**
 * @since 2.0
 */
declare class UIToolbar extends UIView implements UIBarPositioning {

	static alloc(): UIToolbar; // inherited from NSObject

	static appearance(): UIToolbar; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIToolbar; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIToolbar; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIToolbar; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIToolbar; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIToolbar; // inherited from UIAppearance

	static new(): UIToolbar; // inherited from NSObject

	barStyle: UIBarStyle;

	/**
	 * @since 7.0
	 */
	barTintColor: UIColor;

	/**
	 * @since 13.0
	 */
	compactAppearance: UIToolbarAppearance;

	/**
	 * @since 15.0
	 */
	compactScrollEdgeAppearance: UIToolbarAppearance;

	/**
	 * @since 7.0
	 */
	delegate: UIToolbarDelegate;

	items: NSArray<UIBarButtonItem>;

	/**
	 * @since 15.0
	 */
	scrollEdgeAppearance: UIToolbarAppearance;

	/**
	 * @since 13.0
	 */
	standardAppearance: UIToolbarAppearance;

	/**
	 * @since 3.0
	 */
	translucent: boolean;

	readonly barPosition: UIBarPosition; // inherited from UIBarPositioning

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	/**
	 * @since 5.0
	 */
	backgroundImageForToolbarPositionBarMetrics(topOrBottom: UIBarPosition, barMetrics: UIBarMetrics): UIImage;

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

	/**
	 * @since 5.0
	 */
	setBackgroundImageForToolbarPositionBarMetrics(backgroundImage: UIImage, topOrBottom: UIBarPosition, barMetrics: UIBarMetrics): void;

	setItemsAnimated(items: NSArray<UIBarButtonItem> | UIBarButtonItem[], animated: boolean): void;

	/**
	 * @since 6.0
	 */
	setShadowImageForToolbarPosition(shadowImage: UIImage, topOrBottom: UIBarPosition): void;

	/**
	 * @since 6.0
	 */
	shadowImageForToolbarPosition(topOrBottom: UIBarPosition): UIImage;
}

/**
 * @since 13.0
 */
declare class UIToolbarAppearance extends UIBarAppearance {

	static alloc(): UIToolbarAppearance; // inherited from NSObject

	static new(): UIToolbarAppearance; // inherited from NSObject

	buttonAppearance: UIBarButtonItemAppearance;

	doneButtonAppearance: UIBarButtonItemAppearance;
}

interface UIToolbarDelegate extends UIBarPositioningDelegate {
}
declare var UIToolbarDelegate: {

	prototype: UIToolbarDelegate;
};

/**
 * @since 2.0
 */
declare class UITouch extends NSObject {

	static alloc(): UITouch; // inherited from NSObject

	static new(): UITouch; // inherited from NSObject

	/**
	 * @since 9.1
	 */
	readonly altitudeAngle: number;

	/**
	 * @since 9.1
	 */
	readonly estimatedProperties: UITouchProperties;

	/**
	 * @since 9.1
	 */
	readonly estimatedPropertiesExpectingUpdates: UITouchProperties;

	/**
	 * @since 9.1
	 */
	readonly estimationUpdateIndex: number;

	/**
	 * @since 9.0
	 */
	readonly force: number;

	/**
	 * @since 3.2
	 */
	readonly gestureRecognizers: NSArray<UIGestureRecognizer>;

	/**
	 * @since 8.0
	 */
	readonly majorRadius: number;

	/**
	 * @since 8.0
	 */
	readonly majorRadiusTolerance: number;

	/**
	 * @since 9.0
	 */
	readonly maximumPossibleForce: number;

	readonly phase: UITouchPhase;

	/**
	 * @since 17.5
	 */
	readonly rollAngle: number;

	readonly tapCount: number;

	readonly timestamp: number;

	/**
	 * @since 9.0
	 */
	readonly type: UITouchType;

	readonly view: UIView;

	readonly window: UIWindow;

	/**
	 * @since 9.1
	 */
	azimuthAngleInView(view: UIView): number;

	/**
	 * @since 9.1
	 */
	azimuthUnitVectorInView(view: UIView): CGVector;

	locationInNode(node: SKNode): CGPoint;

	locationInView(view: UIView): CGPoint;

	/**
	 * @since 9.1
	 */
	preciseLocationInView(view: UIView): CGPoint;

	/**
	 * @since 9.1
	 */
	precisePreviousLocationInView(view: UIView): CGPoint;

	previousLocationInNode(node: SKNode): CGPoint;

	previousLocationInView(view: UIView): CGPoint;
}

declare const enum UITouchPhase {

	Began = 0,

	Moved = 1,

	Stationary = 2,

	Ended = 3,

	Cancelled = 4,

	RegionEntered = 5,

	RegionMoved = 6,

	RegionExited = 7
}

/**
 * @since 9.1
 */
declare const enum UITouchProperties {

	PropertyForce = 1,

	PropertyAzimuth = 2,

	PropertyAltitude = 4,

	PropertyLocation = 8,

	PropertyRoll = 16
}

/**
 * @since 9.0
 */
declare const enum UITouchType {

	Direct = 0,

	Indirect = 1,

	Pencil = 2,

	Stylus = 2,

	IndirectPointer = 3
}

/**
 * @since 15.0
 */
declare class UITrackingLayoutGuide extends UILayoutGuide {

	static alloc(): UITrackingLayoutGuide; // inherited from NSObject

	static new(): UITrackingLayoutGuide; // inherited from NSObject

	constraintsActiveWhenAwayFromEdge(edge: NSDirectionalRectEdge): NSArray<NSLayoutConstraint>;

	constraintsActiveWhenNearEdge(edge: NSDirectionalRectEdge): NSArray<NSLayoutConstraint>;

	removeAllTrackedConstraints(): void;

	setConstraintsActiveWhenAwayFromEdge(trackingConstraints: NSArray<NSLayoutConstraint> | NSLayoutConstraint[], edge: NSDirectionalRectEdge): void;

	setConstraintsActiveWhenNearEdge(trackingConstraints: NSArray<NSLayoutConstraint> | NSLayoutConstraint[], edge: NSDirectionalRectEdge): void;
}

declare var UITrackingRunLoopMode: string;

/**
 * @since 17.0
 */
declare class UITraitAccessibilityContrast extends NSObject implements UINSIntegerTraitDefinition {

	static alloc(): UITraitAccessibilityContrast; // inherited from NSObject

	static new(): UITraitAccessibilityContrast; // inherited from NSObject

	static readonly affectsColorAppearance: boolean; // inherited from UITraitDefinition

	static readonly defaultValue: number; // inherited from UINSIntegerTraitDefinition

	static readonly identifier: string; // inherited from UITraitDefinition

	static readonly name: string; // inherited from UITraitDefinition
}

/**
 * @since 17.0
 */
declare class UITraitActiveAppearance extends NSObject implements UINSIntegerTraitDefinition {

	static alloc(): UITraitActiveAppearance; // inherited from NSObject

	static new(): UITraitActiveAppearance; // inherited from NSObject

	static readonly affectsColorAppearance: boolean; // inherited from UITraitDefinition

	static readonly defaultValue: number; // inherited from UINSIntegerTraitDefinition

	static readonly identifier: string; // inherited from UITraitDefinition

	static readonly name: string; // inherited from UITraitDefinition
}

/**
 * @since 17.0
 */
interface UITraitChangeObservable {

	registerForTraitChangesWithAction(traits: NSArray<typeof NSObject> | typeof NSObject[], action: string): UITraitChangeRegistration;

	registerForTraitChangesWithHandler(traits: NSArray<typeof NSObject> | typeof NSObject[], handler: (p1: UITraitEnvironment, p2: UITraitCollection) => void): UITraitChangeRegistration;

	registerForTraitChangesWithTargetAction(traits: NSArray<typeof NSObject> | typeof NSObject[], target: any, action: string): UITraitChangeRegistration;

	unregisterForTraitChanges(registration: UITraitChangeRegistration): void;
}
declare var UITraitChangeObservable: {

	prototype: UITraitChangeObservable;
};

/**
 * @since 17.0
 */
interface UITraitChangeRegistration extends NSCopying, NSObjectProtocol {
}
declare var UITraitChangeRegistration: {

	prototype: UITraitChangeRegistration;
};

/**
 * @since 8.0
 */
declare class UITraitCollection extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UITraitCollection; // inherited from NSObject

	static new(): UITraitCollection; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static traitCollectionWithAccessibilityContrast(accessibilityContrast: UIAccessibilityContrast): UITraitCollection;

	/**
	 * @since 14.0
	 */
	static traitCollectionWithActiveAppearance(userInterfaceActiveAppearance: UIUserInterfaceActiveAppearance): UITraitCollection;

	static traitCollectionWithCGFloatValueForTrait(value: number, trait: typeof NSObject): UITraitCollection;

	/**
	 * @since 10.0
	 */
	static traitCollectionWithDisplayGamut(displayGamut: UIDisplayGamut): UITraitCollection;

	static traitCollectionWithDisplayScale(scale: number): UITraitCollection;

	/**
	 * @since 9.0
	 */
	static traitCollectionWithForceTouchCapability(capability: UIForceTouchCapability): UITraitCollection;

	static traitCollectionWithHorizontalSizeClass(horizontalSizeClass: UIUserInterfaceSizeClass): UITraitCollection;

	/**
	 * @since 17.0
	 */
	static traitCollectionWithImageDynamicRange(imageDynamicRange: UIImageDynamicRange): UITraitCollection;

	/**
	 * @since 10.0
	 */
	static traitCollectionWithLayoutDirection(layoutDirection: UITraitEnvironmentLayoutDirection): UITraitCollection;

	/**
	 * @since 13.0
	 */
	static traitCollectionWithLegibilityWeight(legibilityWeight: UILegibilityWeight): UITraitCollection;

	/**
	 * @since 18.0
	 */
	static traitCollectionWithListEnvironment(listEnvironment: UIListEnvironment): UITraitCollection;

	static traitCollectionWithNSIntegerValueForTrait(value: number, trait: typeof NSObject): UITraitCollection;

	static traitCollectionWithObjectForTrait(object: NSObjectProtocol, trait: typeof NSObject): UITraitCollection;

	/**
	 * @since 10.0
	 */
	static traitCollectionWithPreferredContentSizeCategory(preferredContentSizeCategory: string): UITraitCollection;

	/**
	 * @since 17.0
	 */
	static traitCollectionWithSceneCaptureState(sceneCaptureState: UISceneCaptureState): UITraitCollection;

	static traitCollectionWithToolbarItemPresentationSize(toolbarItemPresentationSize: UINSToolbarItemPresentationSize): UITraitCollection;

	static traitCollectionWithTraits(mutations: (p1: UIMutableTraits) => void): UITraitCollection;

	/**
	 * @since 8.0
	 * @deprecated 17.0
	 */
	static traitCollectionWithTraitsFromCollections(traitCollections: NSArray<UITraitCollection> | UITraitCollection[]): UITraitCollection;

	/**
	 * @since 17.0
	 */
	static traitCollectionWithTypesettingLanguage(language: string): UITraitCollection;

	static traitCollectionWithUserInterfaceIdiom(idiom: UIUserInterfaceIdiom): UITraitCollection;

	/**
	 * @since 13.0
	 */
	static traitCollectionWithUserInterfaceLevel(userInterfaceLevel: UIUserInterfaceLevel): UITraitCollection;

	/**
	 * @since 12.0
	 */
	static traitCollectionWithUserInterfaceStyle(userInterfaceStyle: UIUserInterfaceStyle): UITraitCollection;

	static traitCollectionWithVerticalSizeClass(verticalSizeClass: UIUserInterfaceSizeClass): UITraitCollection;

	/**
	 * @since 13.0
	 */
	readonly accessibilityContrast: UIAccessibilityContrast;

	/**
	 * @since 14.0
	 */
	readonly activeAppearance: UIUserInterfaceActiveAppearance;

	/**
	 * @since 10.0
	 */
	readonly displayGamut: UIDisplayGamut;

	readonly displayScale: number;

	/**
	 * @since 9.0
	 */
	readonly forceTouchCapability: UIForceTouchCapability;

	readonly horizontalSizeClass: UIUserInterfaceSizeClass;

	/**
	 * @since 13.0
	 */
	readonly imageConfiguration: UIImageConfiguration;

	/**
	 * @since 17.0
	 */
	readonly imageDynamicRange: UIImageDynamicRange;

	/**
	 * @since 10.0
	 */
	readonly layoutDirection: UITraitEnvironmentLayoutDirection;

	/**
	 * @since 13.0
	 */
	readonly legibilityWeight: UILegibilityWeight;

	/**
	 * @since 18.0
	 */
	readonly listEnvironment: UIListEnvironment;

	/**
	 * @since 10.0
	 */
	readonly preferredContentSizeCategory: string;

	/**
	 * @since 17.0
	 */
	readonly sceneCaptureState: UISceneCaptureState;

	readonly toolbarItemPresentationSize: UINSToolbarItemPresentationSize;

	/**
	 * @since 17.0
	 */
	readonly typesettingLanguage: string;

	readonly userInterfaceIdiom: UIUserInterfaceIdiom;

	/**
	 * @since 13.0
	 */
	readonly userInterfaceLevel: UIUserInterfaceLevel;

	/**
	 * @since 12.0
	 */
	readonly userInterfaceStyle: UIUserInterfaceStyle;

	readonly verticalSizeClass: UIUserInterfaceSizeClass;

	/**
	 * @since 13.0
	 */
	static currentTraitCollection: UITraitCollection;

	static readonly systemTraitsAffectingColorAppearance: NSArray<typeof NSObject>;

	static readonly systemTraitsAffectingImageLookup: NSArray<typeof NSObject>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	changedTraitsFromTraitCollection(traitCollection: UITraitCollection): NSSet<typeof NSObject>;

	/**
	 * @since 8.0
	 * @deprecated 17.0
	 */
	containsTraitsInCollection(trait: UITraitCollection): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 13.0
	 */
	hasDifferentColorAppearanceComparedToTraitCollection(traitCollection: UITraitCollection): boolean;

	initWithCoder(coder: NSCoder): this;

	objectForTrait(trait: typeof NSObject): NSObjectProtocol;

	/**
	 * @since 13.0
	 */
	performAsCurrentTraitCollection(actions: () => void): void;

	traitCollectionByModifyingTraits(mutations: (p1: UIMutableTraits) => void): UITraitCollection;

	traitCollectionByReplacingCGFloatValueForTrait(value: number, trait: typeof NSObject): UITraitCollection;

	traitCollectionByReplacingNSIntegerValueForTrait(value: number, trait: typeof NSObject): UITraitCollection;

	traitCollectionByReplacingObjectForTrait(object: NSObjectProtocol, trait: typeof NSObject): UITraitCollection;

	valueForCGFloatTrait(trait: typeof NSObject): number;

	valueForNSIntegerTrait(trait: typeof NSObject): number;
}

/**
 * @since 17.0
 */
interface UITraitDefinition {
}
declare var UITraitDefinition: {

	prototype: UITraitDefinition;
};

/**
 * @since 17.0
 */
declare class UITraitDisplayGamut extends NSObject implements UINSIntegerTraitDefinition {

	static alloc(): UITraitDisplayGamut; // inherited from NSObject

	static new(): UITraitDisplayGamut; // inherited from NSObject

	static readonly affectsColorAppearance: boolean; // inherited from UITraitDefinition

	static readonly defaultValue: number; // inherited from UINSIntegerTraitDefinition

	static readonly identifier: string; // inherited from UITraitDefinition

	static readonly name: string; // inherited from UITraitDefinition
}

/**
 * @since 17.0
 */
declare class UITraitDisplayScale extends NSObject implements UICGFloatTraitDefinition {

	static alloc(): UITraitDisplayScale; // inherited from NSObject

	static new(): UITraitDisplayScale; // inherited from NSObject

	static readonly affectsColorAppearance: boolean; // inherited from UITraitDefinition

	static readonly defaultValue: number; // inherited from UICGFloatTraitDefinition

	static readonly identifier: string; // inherited from UITraitDefinition

	static readonly name: string; // inherited from UITraitDefinition
}

interface UITraitEnvironment extends NSObjectProtocol {

	/**
	 * @since 8.0
	 */
	traitCollection: UITraitCollection;

	/**
	 * @since 8.0
	 * @deprecated 17.0
	 */
	traitCollectionDidChange(previousTraitCollection: UITraitCollection): void;
}
declare var UITraitEnvironment: {

	prototype: UITraitEnvironment;
};

/**
 * @since 10.0
 */
declare const enum UITraitEnvironmentLayoutDirection {

	Unspecified = -1,

	LeftToRight = 0,

	RightToLeft = 1
}

/**
 * @since 17.0
 */
declare class UITraitForceTouchCapability extends NSObject implements UINSIntegerTraitDefinition {

	static alloc(): UITraitForceTouchCapability; // inherited from NSObject

	static new(): UITraitForceTouchCapability; // inherited from NSObject

	static readonly affectsColorAppearance: boolean; // inherited from UITraitDefinition

	static readonly defaultValue: number; // inherited from UINSIntegerTraitDefinition

	static readonly identifier: string; // inherited from UITraitDefinition

	static readonly name: string; // inherited from UITraitDefinition
}

/**
 * @since 17.0
 */
declare class UITraitHorizontalSizeClass extends NSObject implements UINSIntegerTraitDefinition {

	static alloc(): UITraitHorizontalSizeClass; // inherited from NSObject

	static new(): UITraitHorizontalSizeClass; // inherited from NSObject

	static readonly affectsColorAppearance: boolean; // inherited from UITraitDefinition

	static readonly defaultValue: number; // inherited from UINSIntegerTraitDefinition

	static readonly identifier: string; // inherited from UITraitDefinition

	static readonly name: string; // inherited from UITraitDefinition
}

/**
 * @since 17.0
 */
declare class UITraitImageDynamicRange extends NSObject implements UINSIntegerTraitDefinition {

	static alloc(): UITraitImageDynamicRange; // inherited from NSObject

	static new(): UITraitImageDynamicRange; // inherited from NSObject

	static readonly affectsColorAppearance: boolean; // inherited from UITraitDefinition

	static readonly defaultValue: number; // inherited from UINSIntegerTraitDefinition

	static readonly identifier: string; // inherited from UITraitDefinition

	static readonly name: string; // inherited from UITraitDefinition
}

/**
 * @since 17.0
 */
declare class UITraitLayoutDirection extends NSObject implements UINSIntegerTraitDefinition {

	static alloc(): UITraitLayoutDirection; // inherited from NSObject

	static new(): UITraitLayoutDirection; // inherited from NSObject

	static readonly affectsColorAppearance: boolean; // inherited from UITraitDefinition

	static readonly defaultValue: number; // inherited from UINSIntegerTraitDefinition

	static readonly identifier: string; // inherited from UITraitDefinition

	static readonly name: string; // inherited from UITraitDefinition
}

/**
 * @since 17.0
 */
declare class UITraitLegibilityWeight extends NSObject implements UINSIntegerTraitDefinition {

	static alloc(): UITraitLegibilityWeight; // inherited from NSObject

	static new(): UITraitLegibilityWeight; // inherited from NSObject

	static readonly affectsColorAppearance: boolean; // inherited from UITraitDefinition

	static readonly defaultValue: number; // inherited from UINSIntegerTraitDefinition

	static readonly identifier: string; // inherited from UITraitDefinition

	static readonly name: string; // inherited from UITraitDefinition
}

/**
 * @since 18.0
 */
declare class UITraitListEnvironment extends NSObject implements UINSIntegerTraitDefinition {

	static alloc(): UITraitListEnvironment; // inherited from NSObject

	static new(): UITraitListEnvironment; // inherited from NSObject

	static readonly affectsColorAppearance: boolean; // inherited from UITraitDefinition

	static readonly defaultValue: number; // inherited from UINSIntegerTraitDefinition

	static readonly identifier: string; // inherited from UITraitDefinition

	static readonly name: string; // inherited from UITraitDefinition
}

/**
 * @since 17.0
 */
interface UITraitOverrides extends UIMutableTraits {

	containsTrait(trait: typeof NSObject): boolean;

	removeTrait(trait: typeof NSObject): void;
}
declare var UITraitOverrides: {

	prototype: UITraitOverrides;
};

/**
 * @since 17.0
 */
declare class UITraitPreferredContentSizeCategory extends NSObject implements UIObjectTraitDefinition {

	static alloc(): UITraitPreferredContentSizeCategory; // inherited from NSObject

	static new(): UITraitPreferredContentSizeCategory; // inherited from NSObject

	static readonly affectsColorAppearance: boolean; // inherited from UITraitDefinition

	static readonly defaultValue: NSObjectProtocol; // inherited from UIObjectTraitDefinition

	static readonly identifier: string; // inherited from UITraitDefinition

	static readonly name: string; // inherited from UITraitDefinition
}

/**
 * @since 17.0
 */
declare class UITraitSceneCaptureState extends NSObject implements UINSIntegerTraitDefinition {

	static alloc(): UITraitSceneCaptureState; // inherited from NSObject

	static new(): UITraitSceneCaptureState; // inherited from NSObject

	static readonly affectsColorAppearance: boolean; // inherited from UITraitDefinition

	static readonly defaultValue: number; // inherited from UINSIntegerTraitDefinition

	static readonly identifier: string; // inherited from UITraitDefinition

	static readonly name: string; // inherited from UITraitDefinition
}

/**
 * @since 17.0
 */
declare class UITraitToolbarItemPresentationSize extends NSObject implements UINSIntegerTraitDefinition {

	static alloc(): UITraitToolbarItemPresentationSize; // inherited from NSObject

	static new(): UITraitToolbarItemPresentationSize; // inherited from NSObject

	static readonly affectsColorAppearance: boolean; // inherited from UITraitDefinition

	static readonly defaultValue: number; // inherited from UINSIntegerTraitDefinition

	static readonly identifier: string; // inherited from UITraitDefinition

	static readonly name: string; // inherited from UITraitDefinition
}

/**
 * @since 17.0
 */
declare class UITraitTypesettingLanguage extends NSObject implements UIObjectTraitDefinition {

	static alloc(): UITraitTypesettingLanguage; // inherited from NSObject

	static new(): UITraitTypesettingLanguage; // inherited from NSObject

	static readonly affectsColorAppearance: boolean; // inherited from UITraitDefinition

	static readonly defaultValue: NSObjectProtocol; // inherited from UIObjectTraitDefinition

	static readonly identifier: string; // inherited from UITraitDefinition

	static readonly name: string; // inherited from UITraitDefinition
}

/**
 * @since 17.0
 */
declare class UITraitUserInterfaceIdiom extends NSObject implements UINSIntegerTraitDefinition {

	static alloc(): UITraitUserInterfaceIdiom; // inherited from NSObject

	static new(): UITraitUserInterfaceIdiom; // inherited from NSObject

	static readonly affectsColorAppearance: boolean; // inherited from UITraitDefinition

	static readonly defaultValue: number; // inherited from UINSIntegerTraitDefinition

	static readonly identifier: string; // inherited from UITraitDefinition

	static readonly name: string; // inherited from UITraitDefinition
}

/**
 * @since 17.0
 */
declare class UITraitUserInterfaceLevel extends NSObject implements UINSIntegerTraitDefinition {

	static alloc(): UITraitUserInterfaceLevel; // inherited from NSObject

	static new(): UITraitUserInterfaceLevel; // inherited from NSObject

	static readonly affectsColorAppearance: boolean; // inherited from UITraitDefinition

	static readonly defaultValue: number; // inherited from UINSIntegerTraitDefinition

	static readonly identifier: string; // inherited from UITraitDefinition

	static readonly name: string; // inherited from UITraitDefinition
}

/**
 * @since 17.0
 */
declare class UITraitUserInterfaceStyle extends NSObject implements UINSIntegerTraitDefinition {

	static alloc(): UITraitUserInterfaceStyle; // inherited from NSObject

	static new(): UITraitUserInterfaceStyle; // inherited from NSObject

	static readonly affectsColorAppearance: boolean; // inherited from UITraitDefinition

	static readonly defaultValue: number; // inherited from UINSIntegerTraitDefinition

	static readonly identifier: string; // inherited from UITraitDefinition

	static readonly name: string; // inherited from UITraitDefinition
}

/**
 * @since 17.0
 */
declare class UITraitVerticalSizeClass extends NSObject implements UINSIntegerTraitDefinition {

	static alloc(): UITraitVerticalSizeClass; // inherited from NSObject

	static new(): UITraitVerticalSizeClass; // inherited from NSObject

	static readonly affectsColorAppearance: boolean; // inherited from UITraitDefinition

	static readonly defaultValue: number; // inherited from UINSIntegerTraitDefinition

	static readonly identifier: string; // inherited from UITraitDefinition

	static readonly name: string; // inherited from UITraitDefinition
}

/**
 * @since 7.0
 */
declare var UITransitionContextFromViewControllerKey: string;

/**
 * @since 8.0
 */
declare var UITransitionContextFromViewKey: string;

/**
 * @since 7.0
 */
declare var UITransitionContextToViewControllerKey: string;

/**
 * @since 8.0
 */
declare var UITransitionContextToViewKey: string;

/**
 * @since 18.0
 */
declare class UIUpdateActionPhase extends NSObject {

	static alloc(): UIUpdateActionPhase; // inherited from NSObject

	static new(): UIUpdateActionPhase; // inherited from NSObject

	static readonly afterCADisplayLinkDispatch: UIUpdateActionPhase;

	static readonly afterCATransactionCommit: UIUpdateActionPhase;

	static readonly afterEventDispatch: UIUpdateActionPhase;

	static readonly afterLowLatencyCATransactionCommit: UIUpdateActionPhase;

	static readonly afterLowLatencyEventDispatch: UIUpdateActionPhase;

	static readonly afterUpdateComplete: UIUpdateActionPhase;

	static readonly afterUpdateScheduled: UIUpdateActionPhase;

	static readonly beforeCADisplayLinkDispatch: UIUpdateActionPhase;

	static readonly beforeCATransactionCommit: UIUpdateActionPhase;

	static readonly beforeEventDispatch: UIUpdateActionPhase;

	static readonly beforeLowLatencyCATransactionCommit: UIUpdateActionPhase;

	static readonly beforeLowLatencyEventDispatch: UIUpdateActionPhase;
}

/**
 * @since 18.0
 */
declare class UIUpdateInfo extends NSObject {

	static alloc(): UIUpdateInfo; // inherited from NSObject

	static currentUpdateInfoForView(view: UIView): UIUpdateInfo;

	static currentUpdateInfoForWindowScene(windowScene: UIWindowScene): UIUpdateInfo;

	static new(): UIUpdateInfo; // inherited from NSObject

	readonly completionDeadlineTime: number;

	readonly estimatedPresentationTime: number;

	readonly immediatePresentationExpected: boolean;

	readonly lowLatencyEventDispatchConfirmed: boolean;

	readonly modelTime: number;

	readonly performingLowLatencyPhases: boolean;
}

/**
 * @since 18.0
 */
declare class UIUpdateLink extends NSObject {

	static alloc(): UIUpdateLink; // inherited from NSObject

	static new(): UIUpdateLink; // inherited from NSObject

	static updateLinkForView(view: UIView): UIUpdateLink;

	static updateLinkForViewActionHandler(view: UIView, handler: (p1: UIUpdateLink, p2: UIUpdateInfo) => void): UIUpdateLink;

	static updateLinkForViewActionTargetSelector(view: UIView, target: any, selector: string): UIUpdateLink;

	static updateLinkForWindowScene(windowScene: UIWindowScene): UIUpdateLink;

	static updateLinkForWindowSceneActionHandler(windowScene: UIWindowScene, handler: (p1: UIUpdateLink, p2: UIUpdateInfo) => void): UIUpdateLink;

	static updateLinkForWindowSceneActionTargetSelector(windowScene: UIWindowScene, target: any, selector: string): UIUpdateLink;

	enabled: boolean;

	preferredFrameRateRange: CAFrameRateRange;

	requiresContinuousUpdates: boolean;

	wantsImmediatePresentation: boolean;

	wantsLowLatencyEventDispatch: boolean;

	addActionToPhaseHandler(phase: UIUpdateActionPhase, handler: (p1: UIUpdateLink, p2: UIUpdateInfo) => void): void;

	addActionToPhaseTargetSelector(phase: UIUpdateActionPhase, target: any, selector: string): void;

	addActionWithHandler(handler: (p1: UIUpdateLink, p2: UIUpdateInfo) => void): void;

	addActionWithTargetSelector(target: any, selector: string): void;

	currentUpdateInfo(): UIUpdateInfo;
}

/**
 * @since 8.0
 */
interface UIUserActivityRestoring extends NSObjectProtocol {

	restoreUserActivityState(userActivity: NSUserActivity): void;
}
declare var UIUserActivityRestoring: {

	prototype: UIUserActivityRestoring;
};

/**
 * @since 14.0
 */
declare const enum UIUserInterfaceActiveAppearance {

	Unspecified = -1,

	Inactive = 0,

	Active = 1
}

declare const enum UIUserInterfaceIdiom {

	Unspecified = -1,

	Phone = 0,

	Pad = 1,

	TV = 2,

	CarPlay = 3,

	Mac = 5,

	Vision = 6
}

/**
 * @since 5.0
 */
declare const enum UIUserInterfaceLayoutDirection {

	LeftToRight = 0,

	RightToLeft = 1
}

/**
 * @since 13.0
 */
declare const enum UIUserInterfaceLevel {

	Unspecified = -1,

	Base = 0,

	Elevated = 1
}

/**
 * @since 8.0
 */
declare const enum UIUserInterfaceSizeClass {

	Unspecified = 0,

	Compact = 1,

	Regular = 2
}

/**
 * @since 12.0
 */
declare const enum UIUserInterfaceStyle {

	Unspecified = 0,

	Light = 1,

	Dark = 2
}

/**
 * @since 8.0
 * @deprecated 10.0
 */
declare class UIUserNotificationAction extends NSObject implements NSCopying, NSMutableCopying, NSSecureCoding {

	static alloc(): UIUserNotificationAction; // inherited from NSObject

	static new(): UIUserNotificationAction; // inherited from NSObject

	readonly activationMode: UIUserNotificationActivationMode;

	readonly authenticationRequired: boolean;

	/**
	 * @since 9.0
	 */
	readonly behavior: UIUserNotificationActionBehavior;

	readonly destructive: boolean;

	readonly identifier: string;

	/**
	 * @since 9.0
	 */
	readonly parameters: NSDictionary<any, any>;

	readonly title: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 9.0
 * @deprecated 10.0
 */
declare const enum UIUserNotificationActionBehavior {

	Default = 0,

	TextInput = 1
}

/**
 * @since 8.0
 * @deprecated 10.0
 */
declare const enum UIUserNotificationActionContext {

	Default = 0,

	Minimal = 1
}

/**
 * @since 9.0
 * @deprecated 10.0
 */
declare var UIUserNotificationActionResponseTypedTextKey: string;

/**
 * @since 8.0
 * @deprecated 10.0
 */
declare const enum UIUserNotificationActivationMode {

	Foreground = 0,

	Background = 1
}

/**
 * @since 8.0
 * @deprecated 10.0
 */
declare class UIUserNotificationCategory extends NSObject implements NSCopying, NSMutableCopying, NSSecureCoding {

	static alloc(): UIUserNotificationCategory; // inherited from NSObject

	static new(): UIUserNotificationCategory; // inherited from NSObject

	readonly identifier: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	actionsForContext(context: UIUserNotificationActionContext): NSArray<UIUserNotificationAction>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 8.0
 * @deprecated 10.0
 */
declare class UIUserNotificationSettings extends NSObject {

	static alloc(): UIUserNotificationSettings; // inherited from NSObject

	static new(): UIUserNotificationSettings; // inherited from NSObject

	static settingsForTypesCategories(types: UIUserNotificationType, categories: NSSet<UIUserNotificationCategory>): UIUserNotificationSettings;

	readonly categories: NSSet<UIUserNotificationCategory>;

	readonly types: UIUserNotificationType;
}

/**
 * @since 9.0
 * @deprecated 10.0
 */
declare var UIUserNotificationTextInputActionButtonTitleKey: string;

/**
 * @since 8.0
 * @deprecated 10.0
 */
declare const enum UIUserNotificationType {

	None = 0,

	Badge = 1,

	Sound = 2,

	Alert = 4
}

/**
 * @since 8.0
 */
declare class UIVibrancyEffect extends UIVisualEffect {

	static alloc(): UIVibrancyEffect; // inherited from NSObject

	static effectForBlurEffect(blurEffect: UIBlurEffect): UIVibrancyEffect;

	/**
	 * @since 13.0
	 */
	static effectForBlurEffectStyle(blurEffect: UIBlurEffect, style: UIVibrancyEffectStyle): UIVibrancyEffect;

	static new(): UIVibrancyEffect; // inherited from NSObject

	/**
	 * @since 8.0
	 * @deprecated 10.0
	 */
	static notificationCenterVibrancyEffect(): UIVibrancyEffect;

	/**
	 * @since 13.0
	 * @deprecated 14.0
	 */
	static widgetEffectForVibrancyStyle(vibrancyStyle: UIVibrancyEffectStyle): UIVibrancyEffect;

	/**
	 * @since 10.0
	 * @deprecated 13.0
	 */
	static widgetPrimaryVibrancyEffect(): UIVibrancyEffect;

	/**
	 * @since 10.0
	 * @deprecated 13.0
	 */
	static widgetSecondaryVibrancyEffect(): UIVibrancyEffect;
}

/**
 * @since 13.0
 */
declare const enum UIVibrancyEffectStyle {

	Label = 0,

	SecondaryLabel = 1,

	TertiaryLabel = 2,

	QuaternaryLabel = 3,

	Fill = 4,

	SecondaryFill = 5,

	TertiaryFill = 6,

	Separator = 7
}

/**
 * @since 3.1
 */
declare function UIVideoAtPathIsCompatibleWithSavedPhotosAlbum(videoPath: string): boolean;

/**
 * @since 3.1
 */
declare class UIVideoEditorController extends UINavigationController {

	static alloc(): UIVideoEditorController; // inherited from NSObject

	/**
	 * @since 3.1
	 */
	static canEditVideoAtPath(videoPath: string): boolean;

	static new(): UIVideoEditorController; // inherited from NSObject

	delegate: any;

	videoMaximumDuration: number;

	videoPath: string;

	videoQuality: UIImagePickerControllerQualityType;
}

interface UIVideoEditorControllerDelegate extends NSObjectProtocol {

	videoEditorControllerDidCancel?(editor: UIVideoEditorController): void;

	videoEditorControllerDidFailWithError?(editor: UIVideoEditorController, error: NSError): void;

	videoEditorControllerDidSaveEditedVideoToPath?(editor: UIVideoEditorController, editedVideoPath: string): void;
}
declare var UIVideoEditorControllerDelegate: {

	prototype: UIVideoEditorControllerDelegate;
};

/**
 * @since 2.0
 */
declare class UIView extends UIResponder implements CALayerDelegate, NSCoding, UIAccessibilityIdentification, UIAppearance, UIAppearanceContainer, UICoordinateSpace, UIDynamicItem, UIFocusItem, UIFocusItemContainer, UILargeContentViewerItem, UIPopoverPresentationControllerSourceItem, UITraitChangeObservable, UITraitEnvironment {

	/**
	 * @since 7.0
	 */
	static addKeyframeWithRelativeStartTimeRelativeDurationAnimations(frameStartTime: number, frameDuration: number, animations: () => void): void;

	static alloc(): UIView; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	static animateKeyframesWithDurationDelayOptionsAnimationsCompletion(duration: number, delay: number, options: UIViewKeyframeAnimationOptions, animations: () => void, completion: (p1: boolean) => void): void;

	/**
	 * @since 4.0
	 */
	static animateWithDurationAnimations(duration: number, animations: () => void): void;

	/**
	 * @since 4.0
	 */
	static animateWithDurationAnimationsCompletion(duration: number, animations: () => void, completion: (p1: boolean) => void): void;

	/**
	 * @since 4.0
	 */
	static animateWithDurationDelayOptionsAnimationsCompletion(duration: number, delay: number, options: UIViewAnimationOptions, animations: () => void, completion: (p1: boolean) => void): void;

	/**
	 * @since 7.0
	 */
	static animateWithDurationDelayUsingSpringWithDampingInitialSpringVelocityOptionsAnimationsCompletion(duration: number, delay: number, dampingRatio: number, velocity: number, options: UIViewAnimationOptions, animations: () => void, completion: (p1: boolean) => void): void;

	/**
	 * @since 17.0
	 */
	static animateWithSpringDurationBounceInitialSpringVelocityDelayOptionsAnimationsCompletion(duration: number, bounce: number, velocity: number, delay: number, options: UIViewAnimationOptions, animations: () => void, completion: (p1: boolean) => void): void;

	static appearance(): UIView;

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIView;

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIView;

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIView;

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIView;

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIView;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	static beginAnimationsContext(animationID: string, context: interop.Pointer | interop.Reference<any>): void;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	static commitAnimations(): void;

	/**
	 * @since 13.0
	 */
	static modifyAnimationsWithRepeatCountAutoreversesAnimations(count: number, autoreverses: boolean, animations: () => void): void;

	static new(): UIView; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	static performSystemAnimationOnViewsOptionsAnimationsCompletion(animation: UISystemAnimation, views: NSArray<UIView> | UIView[], options: UIViewAnimationOptions, parallelAnimations: () => void, completion: (p1: boolean) => void): void;

	/**
	 * @since 7.0
	 */
	static performWithoutAnimation(actionsWithoutAnimation: () => void): void;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	static setAnimationBeginsFromCurrentState(fromCurrentState: boolean): void;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	static setAnimationCurve(curve: UIViewAnimationCurve): void;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	static setAnimationDelay(delay: number): void;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	static setAnimationDelegate(delegate: any): void;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	static setAnimationDidStopSelector(selector: string): void;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	static setAnimationDuration(duration: number): void;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	static setAnimationRepeatAutoreverses(repeatAutoreverses: boolean): void;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	static setAnimationRepeatCount(repeatCount: number): void;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	static setAnimationStartDate(startDate: Date): void;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	static setAnimationTransitionForViewCache(transition: UIViewAnimationTransition, view: UIView, cache: boolean): void;

	/**
	 * @since 2.0
	 * @deprecated 13.0
	 */
	static setAnimationWillStartSelector(selector: string): void;

	static setAnimationsEnabled(enabled: boolean): void;

	/**
	 * @since 4.0
	 */
	static transitionFromViewToViewDurationOptionsCompletion(fromView: UIView, toView: UIView, duration: number, options: UIViewAnimationOptions, completion: (p1: boolean) => void): void;

	/**
	 * @since 4.0
	 */
	static transitionWithViewDurationOptionsAnimationsCompletion(view: UIView, duration: number, options: UIViewAnimationOptions, animations: () => void, completion: (p1: boolean) => void): void;

	/**
	 * @since 9.0
	 */
	static userInterfaceLayoutDirectionForSemanticContentAttribute(attribute: UISemanticContentAttribute): UIUserInterfaceLayoutDirection;

	/**
	 * @since 10.0
	 */
	static userInterfaceLayoutDirectionForSemanticContentAttributeRelativeToLayoutDirection(semanticContentAttribute: UISemanticContentAttribute, layoutDirection: UIUserInterfaceLayoutDirection): UIUserInterfaceLayoutDirection;

	/**
	 * @since 11.0
	 */
	accessibilityIgnoresInvertColors: boolean;

	/**
	 * @since 6.0
	 */
	readonly alignmentRectInsets: UIEdgeInsets;

	alpha: number;

	/**
	 * @since 16.0
	 */
	anchorPoint: CGPoint;

	/**
	 * @since 15.0
	 */
	readonly appliedContentSizeCategoryLimitsDescription: string;

	autoresizesSubviews: boolean;

	autoresizingMask: UIViewAutoresizing;

	backgroundColor: UIColor;

	/**
	 * @since 9.0
	 */
	readonly bottomAnchor: NSLayoutYAxisAnchor;

	bounds: CGRect;

	/**
	 * @since 9.0
	 */
	readonly centerXAnchor: NSLayoutXAxisAnchor;

	/**
	 * @since 9.0
	 */
	readonly centerYAnchor: NSLayoutYAxisAnchor;

	clearsContextBeforeDrawing: boolean;

	clipsToBounds: boolean;

	/**
	 * @since 6.0
	 */
	readonly constraints: NSArray<NSLayoutConstraint>;

	contentMode: UIViewContentMode;

	/**
	 * @since 4.0
	 */
	contentScaleFactor: number;

	/**
	 * @since 3.0
	 * @deprecated 6.0
	 */
	contentStretch: CGRect;

	/**
	 * @since 11.0
	 */
	directionalLayoutMargins: NSDirectionalEdgeInsets;

	/**
	 * @since 10.0
	 */
	readonly effectiveUserInterfaceLayoutDirection: UIUserInterfaceLayoutDirection;

	exclusiveTouch: boolean;

	/**
	 * @since 9.0
	 */
	readonly firstBaselineAnchor: NSLayoutYAxisAnchor;

	/**
	 * @since 15.0
	 */
	focusEffect: UIFocusEffect;

	/**
	 * @since 14.0
	 */
	focusGroupIdentifier: string;

	/**
	 * @since 15.0
	 */
	focusGroupPriority: number;

	/**
	 * @since 9.0
	 */
	readonly focused: boolean;

	frame: CGRect;

	/**
	 * @since 3.2
	 */
	gestureRecognizers: NSArray<UIGestureRecognizer>;

	/**
	 * @since 6.0
	 */
	readonly hasAmbiguousLayout: boolean;

	/**
	 * @since 9.0
	 */
	readonly heightAnchor: NSLayoutDimension;

	hidden: boolean;

	hoverStyle: UIHoverStyle;

	/**
	 * @since 11.0
	 */
	insetsLayoutMarginsFromSafeArea: boolean;

	/**
	 * @since 11.0
	 */
	interactions: NSArray<UIInteraction>;

	/**
	 * @since 6.0
	 */
	readonly intrinsicContentSize: CGSize;

	/**
	 * @since 15.0
	 */
	readonly keyboardLayoutGuide: UIKeyboardLayoutGuide;

	/**
	 * @since 13.0
	 */
	largeContentImage: UIImage;

	/**
	 * @since 13.0
	 */
	largeContentImageInsets: UIEdgeInsets;

	/**
	 * @since 13.0
	 */
	largeContentTitle: string;

	/**
	 * @since 9.0
	 */
	readonly lastBaselineAnchor: NSLayoutYAxisAnchor;

	readonly layer: CALayer;

	/**
	 * @since 9.0
	 */
	readonly layoutGuides: NSArray<UILayoutGuide>;

	/**
	 * @since 8.0
	 */
	layoutMargins: UIEdgeInsets;

	/**
	 * @since 9.0
	 */
	readonly layoutMarginsGuide: UILayoutGuide;

	/**
	 * @since 9.0
	 */
	readonly leadingAnchor: NSLayoutXAxisAnchor;

	/**
	 * @since 9.0
	 */
	readonly leftAnchor: NSLayoutXAxisAnchor;

	/**
	 * @since 8.0
	 */
	maskView: UIView;

	/**
	 * @since 15.0
	 */
	maximumContentSizeCategory: string;

	/**
	 * @since 15.0
	 */
	minimumContentSizeCategory: string;

	/**
	 * @since 7.0
	 */
	motionEffects: NSArray<UIMotionEffect>;

	multipleTouchEnabled: boolean;

	opaque: boolean;

	/**
	 * @since 13.0
	 */
	overrideUserInterfaceStyle: UIUserInterfaceStyle;

	/**
	 * @since 8.0
	 */
	preservesSuperviewLayoutMargins: boolean;

	/**
	 * @since 9.0
	 */
	readonly readableContentGuide: UILayoutGuide;

	/**
	 * @since 6.0
	 */
	restorationIdentifier: string;

	/**
	 * @since 9.0
	 */
	readonly rightAnchor: NSLayoutXAxisAnchor;

	/**
	 * @since 11.0
	 */
	readonly safeAreaInsets: UIEdgeInsets;

	/**
	 * @since 11.0
	 */
	readonly safeAreaLayoutGuide: UILayoutGuide;

	/**
	 * @since 13.0
	 */
	scalesLargeContentImage: boolean;

	/**
	 * @since 9.0
	 */
	semanticContentAttribute: UISemanticContentAttribute;

	/**
	 * @since 13.0
	 */
	showsLargeContentViewer: boolean;

	readonly subviews: NSArray<UIView>;

	readonly superview: UIView;

	tag: number;

	/**
	 * @since 7.0
	 */
	tintAdjustmentMode: UIViewTintAdjustmentMode;

	/**
	 * @since 7.0
	 */
	tintColor: UIColor;

	/**
	 * @since 9.0
	 */
	readonly topAnchor: NSLayoutYAxisAnchor;

	/**
	 * @since 9.0
	 */
	readonly trailingAnchor: NSLayoutXAxisAnchor;

	readonly traitOverrides: UITraitOverrides;

	/**
	 * @since 13.0
	 */
	transform3D: CATransform3D;

	/**
	 * @since 6.0
	 */
	translatesAutoresizingMaskIntoConstraints: boolean;

	userInteractionEnabled: boolean;

	/**
	 * @since 9.0
	 */
	readonly viewForFirstBaselineLayout: UIView;

	/**
	 * @since 9.0
	 */
	readonly viewForLastBaselineLayout: UIView;

	/**
	 * @since 9.0
	 */
	readonly widthAnchor: NSLayoutDimension;

	readonly window: UIWindow;

	static readonly areAnimationsEnabled: boolean;

	/**
	 * @since 9.0
	 */
	static readonly inheritedAnimationDuration: number;

	static readonly layerClass: typeof NSObject;

	/**
	 * @since 6.0
	 */
	static readonly requiresConstraintBasedLayout: boolean;

	/**
	 * @since 5.0
	 */
	accessibilityIdentifier: string; // inherited from UIAccessibilityIdentification

	readonly canBecomeFocused: boolean; // inherited from UIFocusItem

	center: CGPoint; // inherited from UIDynamicItem

	/**
	 * @since 9.0
	 */
	readonly collisionBoundingPath: UIBezierPath; // inherited from UIDynamicItem

	/**
	 * @since 9.0
	 */
	readonly collisionBoundsType: UIDynamicItemCollisionBoundsType; // inherited from UIDynamicItem

	readonly coordinateSpace: UICoordinateSpace; // inherited from UIFocusItemContainer

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	/**
	 * @since 12.0
	 */
	readonly focusItemContainer: UIFocusItemContainer; // inherited from UIFocusEnvironment

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	/**
	 * @since 15.0
	 */
	readonly isTransparentFocusItem: boolean; // inherited from UIFocusItem

	/**
	 * @since 12.0
	 */
	readonly parentFocusEnvironment: UIFocusEnvironment; // inherited from UIFocusEnvironment

	readonly preferredFocusEnvironments: NSArray<UIFocusEnvironment>; // inherited from UIFocusEnvironment

	/**
	 * @since 9.0
	 * @deprecated 10.0
	 */
	readonly preferredFocusedView: UIView; // inherited from UIFocusEnvironment

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	/**
	 * @since 8.0
	 */
	readonly traitCollection: UITraitCollection; // inherited from UITraitEnvironment

	transform: CGAffineTransform; // inherited from UIDynamicItem

	readonly  // inherited from NSObjectProtocol

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { frame: CGRect; });

	actionForLayerForKey(layer: CALayer, event: string): CAAction;

	/**
	 * @since 6.0
	 */
	addConstraint(constraint: NSLayoutConstraint): void;

	/**
	 * @since 6.0
	 */
	addConstraints(constraints: NSArray<NSLayoutConstraint> | NSLayoutConstraint[]): void;

	/**
	 * @since 3.2
	 */
	addGestureRecognizer(gestureRecognizer: UIGestureRecognizer): void;

	/**
	 * @since 11.0
	 */
	addInteraction(interaction: UIInteraction): void;

	/**
	 * @since 9.0
	 */
	addLayoutGuide(layoutGuide: UILayoutGuide): void;

	/**
	 * @since 7.0
	 */
	addMotionEffect(effect: UIMotionEffect): void;

	addSubview(view: UIView): void;

	/**
	 * @since 6.0
	 */
	alignmentRectForFrame(frame: CGRect): CGRect;

	bringSubviewToFront(view: UIView): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 6.0
	 */
	constraintsAffectingLayoutForAxis(axis: UILayoutConstraintAxis): NSArray<NSLayoutConstraint>;

	/**
	 * @since 6.0
	 */
	contentCompressionResistancePriorityForAxis(axis: UILayoutConstraintAxis): number;

	/**
	 * @since 6.0
	 */
	contentHuggingPriorityForAxis(axis: UILayoutConstraintAxis): number;

	/**
	 * @since 8.0
	 */
	convertPointFromCoordinateSpace(point: CGPoint, coordinateSpace: UICoordinateSpace): CGPoint;

	convertPointFromView(point: CGPoint, view: UIView): CGPoint;

	/**
	 * @since 8.0
	 */
	convertPointToCoordinateSpace(point: CGPoint, coordinateSpace: UICoordinateSpace): CGPoint;

	convertPointToView(point: CGPoint, view: UIView): CGPoint;

	/**
	 * @since 8.0
	 */
	convertRectFromCoordinateSpace(rect: CGRect, coordinateSpace: UICoordinateSpace): CGRect;

	convertRectFromView(rect: CGRect, view: UIView): CGRect;

	/**
	 * @since 8.0
	 */
	convertRectToCoordinateSpace(rect: CGRect, coordinateSpace: UICoordinateSpace): CGRect;

	convertRectToView(rect: CGRect, view: UIView): CGRect;

	/**
	 * @since 6.0
	 */
	decodeRestorableStateWithCoder(coder: NSCoder): void;

	didAddSubview(subview: UIView): void;

	/**
	 * @since 12.0
	 */
	didHintFocusMovement(hint: UIFocusMovementHint): void;

	didMoveToSuperview(): void;

	didMoveToWindow(): void;

	didUpdateFocusInContextWithAnimationCoordinator(context: UIFocusUpdateContext, coordinator: UIFocusAnimationCoordinator): void;

	displayLayer(layer: CALayer): void;

	drawLayerInContext(layer: CALayer, ctx: any): void;

	drawRect(rect: CGRect): void;

	drawRectForViewPrintFormatter(rect: CGRect, formatter: UIViewPrintFormatter): void;

	/**
	 * @since 7.0
	 */
	drawViewHierarchyInRectAfterScreenUpdates(rect: CGRect, afterUpdates: boolean): boolean;

	/**
	 * @since 6.0
	 */
	encodeRestorableStateWithCoder(coder: NSCoder): void;

	encodeWithCoder(coder: NSCoder): void;

	endEditing(force: boolean): boolean;

	exchangeSubviewAtIndexWithSubviewAtIndex(index1: number, index2: number): void;

	/**
	 * @since 6.0
	 */
	exerciseAmbiguityInLayout(): void;

	focusItemsInRect(rect: CGRect): NSArray<UIFocusItem>;

	/**
	 * @since 6.0
	 */
	frameForAlignmentRect(alignmentRect: CGRect): CGRect;

	/**
	 * @since 17.0
	 */
	frameInView(referenceView: UIView): CGRect;

	/**
	 * @since 6.0
	 */
	gestureRecognizerShouldBegin(gestureRecognizer: UIGestureRecognizer): boolean;

	hitTestWithEvent(point: CGPoint, event: _UIEvent): UIView;

	initWithCoder(coder: NSCoder): this;

	initWithFrame(frame: CGRect): this;

	insertSubviewAboveSubview(view: UIView, siblingSubview: UIView): void;

	insertSubviewAtIndex(view: UIView, index: number): void;

	insertSubviewBelowSubview(view: UIView, siblingSubview: UIView): void;

	/**
	 * @since 6.0
	 */
	invalidateIntrinsicContentSize(): void;

	isDescendantOfView(view: UIView): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	/**
	 * @since 10.0
	 */
	layerWillDraw(layer: CALayer): void;

	layoutIfNeeded(): void;

	/**
	 * @since 8.0
	 */
	layoutMarginsDidChange(): void;

	layoutSublayersOfLayer(layer: CALayer): void;

	layoutSubviews(): void;

	nativeScriptSetFormattedTextDecorationAndTransformLetterSpacingLineHeight(details: NSDictionary<any, any>, letterSpacing: number, lineHeight: number): void;

	nativeScriptSetFormattedTextStrokeColor(width: number, color: UIColor): void;

	nativeScriptSetTextDecorationAndTransformTextDecorationLetterSpacingLineHeight(text: string, textDecoration: string, letterSpacing: number, lineHeight: number): void;

	/**
	 * @since 6.0
	 */
	needsUpdateConstraints(): boolean;

	passThroughParent(): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	pointInsideWithEvent(point: CGPoint, event: _UIEvent): boolean;

	registerForTraitChangesWithAction(traits: NSArray<typeof NSObject> | typeof NSObject[], action: string): UITraitChangeRegistration;

	registerForTraitChangesWithHandler(traits: NSArray<typeof NSObject> | typeof NSObject[], handler: (p1: UITraitEnvironment, p2: UITraitCollection) => void): UITraitChangeRegistration;

	registerForTraitChangesWithTargetAction(traits: NSArray<typeof NSObject> | typeof NSObject[], target: any, action: string): UITraitChangeRegistration;

	/**
	 * @since 6.0
	 */
	removeConstraint(constraint: NSLayoutConstraint): void;

	/**
	 * @since 6.0
	 */
	removeConstraints(constraints: NSArray<NSLayoutConstraint> | NSLayoutConstraint[]): void;

	removeFromSuperview(): void;

	/**
	 * @since 3.2
	 */
	removeGestureRecognizer(gestureRecognizer: UIGestureRecognizer): void;

	/**
	 * @since 11.0
	 */
	removeInteraction(interaction: UIInteraction): void;

	/**
	 * @since 9.0
	 */
	removeLayoutGuide(layoutGuide: UILayoutGuide): void;

	/**
	 * @since 7.0
	 */
	removeMotionEffect(effect: UIMotionEffect): void;

	/**
	 * @since 7.0
	 */
	resizableSnapshotViewFromRectAfterScreenUpdatesWithCapInsets(rect: CGRect, afterUpdates: boolean, capInsets: UIEdgeInsets): UIView;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	/**
	 * @since 11.0
	 */
	safeAreaInsetsDidChange(): void;

	self(): this;

	sendSubviewToBack(view: UIView): void;

	/**
	 * @since 6.0
	 */
	setContentCompressionResistancePriorityForAxis(priority: number, axis: UILayoutConstraintAxis): void;

	/**
	 * @since 6.0
	 */
	setContentHuggingPriorityForAxis(priority: number, axis: UILayoutConstraintAxis): void;

	setNeedsDisplay(): void;

	setNeedsDisplayInRect(rect: CGRect): void;

	setNeedsFocusUpdate(): void;

	setNeedsLayout(): void;

	/**
	 * @since 6.0
	 */
	setNeedsUpdateConstraints(): void;

	setPassThroughParent(passThroughParent: boolean): void;

	shouldUpdateFocusInContext(context: UIFocusUpdateContext): boolean;

	sizeThatFits(size: CGSize): CGSize;

	sizeToFit(): void;

	/**
	 * @since 7.0
	 */
	snapshotViewAfterScreenUpdates(afterUpdates: boolean): UIView;

	/**
	 * @since 6.0
	 */
	systemLayoutSizeFittingSize(targetSize: CGSize): CGSize;

	/**
	 * @since 8.0
	 */
	systemLayoutSizeFittingSizeWithHorizontalFittingPriorityVerticalFittingPriority(targetSize: CGSize, horizontalFittingPriority: number, verticalFittingPriority: number): CGSize;

	/**
	 * @since 7.0
	 */
	tintColorDidChange(): void;

	/**
	 * @since 8.0
	 * @deprecated 17.0
	 */
	traitCollectionDidChange(previousTraitCollection: UITraitCollection): void;

	unregisterForTraitChanges(registration: UITraitChangeRegistration): void;

	/**
	 * @since 6.0
	 */
	updateConstraints(): void;

	/**
	 * @since 6.0
	 */
	updateConstraintsIfNeeded(): void;

	updateFocusIfNeeded(): void;

	updateTraitsIfNeeded(): void;

	/**
	 * @since 6.0
	 * @deprecated 9.0
	 */
	viewForBaselineLayout(): UIView;

	viewPrintFormatter(): UIViewPrintFormatter;

	viewWithTag(tag: number): UIView;

	willMoveToSuperview(newSuperview: UIView): void;

	willMoveToWindow(newWindow: UIWindow): void;

	willRemoveSubview(subview: UIView): void;
}

interface UIViewAnimating extends NSObjectProtocol {

	fractionComplete: number;

	reversed: boolean;

	running: boolean;

	state: UIViewAnimatingState;

	finishAnimationAtPosition(finalPosition: UIViewAnimatingPosition): void;

	pauseAnimation(): void;

	startAnimation(): void;

	startAnimationAfterDelay(delay: number): void;

	stopAnimation(withoutFinishing: boolean): void;
}
declare var UIViewAnimating: {

	prototype: UIViewAnimating;
};

/**
 * @since 10.0
 */
declare const enum UIViewAnimatingPosition {

	End = 0,

	Start = 1,

	Current = 2
}

/**
 * @since 10.0
 */
declare const enum UIViewAnimatingState {

	Inactive = 0,

	Active = 1,

	Stopped = 2
}

declare const enum UIViewAnimationCurve {

	EaseInOut = 0,

	EaseIn = 1,

	EaseOut = 2,

	Linear = 3
}

/**
 * @since 4.0
 */
declare const enum UIViewAnimationOptions {

	LayoutSubviews = 1,

	AllowUserInteraction = 2,

	BeginFromCurrentState = 4,

	Repeat = 8,

	Autoreverse = 16,

	OverrideInheritedDuration = 32,

	OverrideInheritedCurve = 64,

	AllowAnimatedContent = 128,

	ShowHideTransitionViews = 256,

	OverrideInheritedOptions = 512,

	CurveEaseInOut = 0,

	CurveEaseIn = 65536,

	CurveEaseOut = 131072,

	CurveLinear = 196608,

	TransitionNone = 0,

	TransitionFlipFromLeft = 1048576,

	TransitionFlipFromRight = 2097152,

	TransitionCurlUp = 3145728,

	TransitionCurlDown = 4194304,

	TransitionCrossDissolve = 5242880,

	TransitionFlipFromTop = 6291456,

	TransitionFlipFromBottom = 7340032,

	PreferredFramesPerSecondDefault = 0,

	PreferredFramesPerSecond60 = 50331648,

	PreferredFramesPerSecond30 = 117440512
}

declare const enum UIViewAnimationTransition {

	None = 0,

	FlipFromLeft = 1,

	FlipFromRight = 2,

	CurlUp = 3,

	CurlDown = 4
}

declare const enum UIViewAutoresizing {

	None = 0,

	FlexibleLeftMargin = 1,

	FlexibleWidth = 2,

	FlexibleRightMargin = 4,

	FlexibleTopMargin = 8,

	FlexibleHeight = 16,

	FlexibleBottomMargin = 32
}

/**
 * @since 14.0
 */
declare class UIViewConfigurationState extends NSObject implements UIConfigurationState {

	static alloc(): UIViewConfigurationState; // inherited from NSObject

	static new(): UIViewConfigurationState; // inherited from NSObject

	disabled: boolean;

	focused: boolean;

	highlighted: boolean;

	/**
	 * @since 15.0
	 */
	pinned: boolean;

	selected: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	traitCollection: UITraitCollection; // inherited from UIConfigurationState

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { traitCollection: UITraitCollection; }); // inherited from UIConfigurationState

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	customStateForKey(key: string): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTraitCollection(traitCollection: UITraitCollection): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	objectForKeyedSubscript(key: string): any;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	setCustomStateForKey(customState: any, key: string): void;

	setObjectForKeyedSubscript(obj: any, key: string): void;
}

declare const enum UIViewContentMode {

	ScaleToFill = 0,

	ScaleAspectFit = 1,

	ScaleAspectFill = 2,

	Redraw = 3,

	Center = 4,

	Top = 5,

	Bottom = 6,

	Left = 7,

	Right = 8,

	TopLeft = 9,

	TopRight = 10,

	BottomLeft = 11,

	BottomRight = 12
}

/**
 * @since 2.0
 */
declare class UIViewController extends UIResponder implements NSCoding, NSExtensionRequestHandling, UIAppearanceContainer, UIContentContainer, UIFocusEnvironment, UIStateRestoring, UITraitChangeObservable, UITraitEnvironment {

	static alloc(): UIViewController; // inherited from NSObject

	/**
	 * @since 5.0
	 * @deprecated 16.0
	 */
	static attemptRotationToDeviceOrientation(): void;

	static new(): UIViewController; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	readonly activePresentationController: UIPresentationController;

	/**
	 * @since 11.0
	 */
	additionalSafeAreaInsets: UIEdgeInsets;

	/**
	 * @since 7.0
	 * @deprecated 11.0
	 */
	automaticallyAdjustsScrollViewInsets: boolean;

	/**
	 * @since 5.0
	 */
	readonly beingDismissed: boolean;

	/**
	 * @since 5.0
	 */
	readonly beingPresented: boolean;

	/**
	 * @since 7.0
	 * @deprecated 11.0
	 */
	readonly bottomLayoutGuide: UILayoutSupport;

	/**
	 * @since 11.0
	 */
	readonly childViewControllerForHomeIndicatorAutoHidden: UIViewController;

	/**
	 * @since 14.0
	 */
	readonly childViewControllerForPointerLock: UIViewController;

	/**
	 * @since 11.0
	 */
	readonly childViewControllerForScreenEdgesDeferringSystemGestures: UIViewController;

	/**
	 * @since 7.0
	 */
	readonly childViewControllerForStatusBarHidden: UIViewController;

	/**
	 * @since 7.0
	 */
	readonly childViewControllerForStatusBarStyle: UIViewController;

	/**
	 * @since 5.0
	 */
	readonly childViewControllers: NSArray<UIViewController>;

	/**
	 * @since 3.2
	 * @deprecated 7.0
	 */
	contentSizeForViewInPopover: CGSize;

	/**
	 * @since 17.0
	 */
	contentUnavailableConfiguration: UIContentConfiguration;

	/**
	 * @since 17.0
	 */
	readonly contentUnavailableConfigurationState: UIContentUnavailableConfigurationState;

	/**
	 * @since 5.0
	 */
	definesPresentationContext: boolean;

	/**
	 * @since 4.3
	 */
	readonly disablesAutomaticKeyboardDismissal: boolean;

	/**
	 * @since 7.0
	 */
	edgesForExtendedLayout: UIRectEdge;

	readonly editButtonItem: UIBarButtonItem;

	editing: boolean;

	/**
	 * @since 7.0
	 */
	extendedLayoutIncludesOpaqueBars: boolean;

	/**
	 * @since 8.0
	 */
	readonly extensionContext: NSExtensionContext;

	/**
	 * @since 15.0
	 */
	focusGroupIdentifier: string;

	hidesBottomBarWhenPushed: boolean;

	/**
	 * @since 16.0
	 */
	interactionActivityTrackingBaseName: string;

	/**
	 * @since 2.0
	 * @deprecated 8.0
	 */
	readonly interfaceOrientation: UIInterfaceOrientation;

	/**
	 * @since 3.2
	 * @deprecated 13.0
	 */
	modalInPopover: boolean;

	/**
	 * @since 13.0
	 */
	modalInPresentation: boolean;

	/**
	 * @since 7.0
	 */
	modalPresentationCapturesStatusBarAppearance: boolean;

	/**
	 * @since 3.2
	 */
	modalPresentationStyle: UIModalPresentationStyle;

	/**
	 * @since 3.0
	 */
	modalTransitionStyle: UIModalTransitionStyle;

	/**
	 * @since 2.0
	 * @deprecated 6.0
	 */
	readonly modalViewController: UIViewController;

	/**
	 * @since 5.0
	 */
	readonly movingFromParentViewController: boolean;

	/**
	 * @since 5.0
	 */
	readonly movingToParentViewController: boolean;

	readonly navigationController: UINavigationController;

	readonly navigationItem: UINavigationItem;

	readonly nibBundle: NSBundle;

	readonly nibName: string;

	/**
	 * @since 13.0
	 */
	overrideUserInterfaceStyle: UIUserInterfaceStyle;

	readonly parentViewController: UIViewController;

	/**
	 * @since 13.0
	 */
	readonly performsActionsWhilePresentingModally: boolean;

	/**
	 * @since 8.0
	 */
	readonly popoverPresentationController: UIPopoverPresentationController;

	/**
	 * @since 7.0
	 */
	preferredContentSize: CGSize;

	/**
	 * @since 6.0
	 */
	readonly preferredInterfaceOrientationForPresentation: UIInterfaceOrientation;

	/**
	 * @since 11.0
	 */
	readonly preferredScreenEdgesDeferringSystemGestures: UIRectEdge;

	/**
	 * @since 7.0
	 */
	readonly preferredStatusBarStyle: UIStatusBarStyle;

	/**
	 * @since 7.0
	 */
	readonly preferredStatusBarUpdateAnimation: UIStatusBarAnimation;

	/**
	 * @since 18.0
	 */
	preferredTransition: UIViewControllerTransition;

	/**
	 * @since 11.0
	 */
	readonly prefersHomeIndicatorAutoHidden: boolean;

	/**
	 * @since 14.0
	 */
	readonly prefersPointerLocked: boolean;

	/**
	 * @since 7.0
	 */
	readonly prefersStatusBarHidden: boolean;

	/**
	 * @since 8.0
	 */
	readonly presentationController: UIPresentationController;

	/**
	 * @since 5.0
	 */
	readonly presentedViewController: UIViewController;

	/**
	 * @since 5.0
	 */
	readonly presentingViewController: UIViewController;

	/**
	 * @since 9.0
	 * @deprecated 13.0
	 */
	readonly previewActionItems: NSArray<UIPreviewActionItem>;

	/**
	 * @since 5.0
	 */
	providesPresentationContextTransitionStyle: boolean;

	/**
	 * @since 6.0
	 */
	restorationClass: typeof NSObject;

	/**
	 * @since 6.0
	 */
	restorationIdentifier: string;

	/**
	 * @since 10.0
	 */
	restoresFocusAfterTransition: boolean;

	/**
	 * @since 3.0
	 * @deprecated 8.0
	 */
	readonly searchDisplayController: UISearchDisplayController;

	/**
	 * @since 15.0
	 */
	readonly sheetPresentationController: UISheetPresentationController;

	/**
	 * @since 6.0
	 */
	readonly shouldAutomaticallyForwardAppearanceMethods: boolean;

	/**
	 * @since 6.0
	 * @deprecated 16.0
	 */
	readonly shouldAutorotate: boolean;

	readonly splitViewController: UISplitViewController;

	/**
	 * @since 5.0
	 */
	readonly storyboard: UIStoryboard;

	/**
	 * @since 6.0
	 */
	readonly supportedInterfaceOrientations: UIInterfaceOrientationMask;

	/**
	 * @since 11.0
	 */
	readonly systemMinimumLayoutMargins: NSDirectionalEdgeInsets;

	readonly tab: UITab;

	readonly tabBarController: UITabBarController;

	tabBarItem: UITabBarItem;

	title: string;

	/**
	 * @since 3.0
	 */
	toolbarItems: NSArray<UIBarButtonItem>;

	/**
	 * @since 7.0
	 * @deprecated 11.0
	 */
	readonly topLayoutGuide: UILayoutSupport;

	readonly traitOverrides: UITraitOverrides;

	/**
	 * @since 7.0
	 */
	readonly transitionCoordinator: UIViewControllerTransitionCoordinator;

	/**
	 * @since 7.0
	 */
	transitioningDelegate: UIViewControllerTransitioningDelegate;

	view: UIView;

	/**
	 * @since 9.0
	 */
	readonly viewIfLoaded: UIView;

	/**
	 * @since 3.0
	 */
	readonly viewLoaded: boolean;

	/**
	 * @since 11.0
	 */
	viewRespectsSystemMinimumLayoutMargins: boolean;

	/**
	 * @since 3.0
	 * @deprecated 7.0
	 */
	wantsFullScreenLayout: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	/**
	 * @since 12.0
	 */
	readonly focusItemContainer: UIFocusItemContainer; // inherited from UIFocusEnvironment

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly objectRestorationClass: typeof NSObject; // inherited from UIStateRestoring

	/**
	 * @since 12.0
	 */
	readonly parentFocusEnvironment: UIFocusEnvironment; // inherited from UIFocusEnvironment

	readonly preferredFocusEnvironments: NSArray<UIFocusEnvironment>; // inherited from UIFocusEnvironment

	/**
	 * @since 9.0
	 * @deprecated 10.0
	 */
	readonly preferredFocusedView: UIView; // inherited from UIFocusEnvironment

	readonly restorationParent: UIStateRestoring; // inherited from UIStateRestoring

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	/**
	 * @since 8.0
	 */
	readonly traitCollection: UITraitCollection; // inherited from UITraitEnvironment

	readonly  // inherited from NSObjectProtocol

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { nibName: string; bundle: NSBundle; });

	/**
	 * @since 5.0
	 */
	addChildViewController(childController: UIViewController): void;

	/**
	 * @since 9.0
	 */
	addKeyCommand(keyCommand: UIKeyCommand): void;

	/**
	 * @since 9.0
	 */
	allowedChildViewControllersForUnwindingFromSource(source: UIStoryboardUnwindSegueSource): NSArray<UIViewController>;

	applicationFinishedRestoringState(): void;

	/**
	 * @since 5.0
	 * @deprecated 6.0
	 */
	automaticallyForwardAppearanceAndRotationMethodsToChildViewControllers(): boolean;

	/**
	 * @since 5.0
	 */
	beginAppearanceTransitionAnimated(isAppearing: boolean, animated: boolean): void;

	beginRequestWithExtensionContext(context: NSExtensionContext): void;

	/**
	 * @since 13.0
	 */
	canPerformUnwindSegueActionFromViewControllerSender(action: string, fromViewController: UIViewController, sender: any): boolean;

	/**
	 * @since 6.0
	 * @deprecated 13.0
	 */
	canPerformUnwindSegueActionFromViewControllerWithSender(action: string, fromViewController: UIViewController, sender: any): boolean;

	/**
	 * @since 9.0
	 */
	childViewControllerContainingSegueSource(source: UIStoryboardUnwindSegueSource): UIViewController;

	class(): typeof NSObject;

	/**
	 * @since 8.0
	 */
	collapseSecondaryViewControllerForSplitViewController(secondaryViewController: UIViewController, splitViewController: UISplitViewController): void;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 15.0
	 */
	contentScrollViewForEdge(edge: NSDirectionalRectEdge): UIScrollView;

	decodeRestorableStateWithCoder(coder: NSCoder): void;

	/**
	 * @since 2.0
	 * @deprecated 5.0
	 */
	didAnimateFirstHalfOfRotationToInterfaceOrientation(toInterfaceOrientation: UIInterfaceOrientation): void;

	/**
	 * @since 5.0
	 */
	didMoveToParentViewController(parent: UIViewController): void;

	didReceiveMemoryWarning(): void;

	/**
	 * @since 2.0
	 * @deprecated 8.0
	 */
	didRotateFromInterfaceOrientation(fromInterfaceOrientation: UIInterfaceOrientation): void;

	didUpdateFocusInContextWithAnimationCoordinator(context: UIFocusUpdateContext, coordinator: UIFocusAnimationCoordinator): void;

	/**
	 * @since 2.0
	 * @deprecated 6.0
	 */
	dismissModalViewControllerAnimated(animated: boolean): void;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	dismissMoviePlayerViewControllerAnimated(): void;

	/**
	 * @since 5.0
	 */
	dismissViewControllerAnimatedCompletion(flag: boolean, completion: () => void): void;

	encodeRestorableStateWithCoder(coder: NSCoder): void;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 5.0
	 */
	endAppearanceTransition(): void;

	initWithCoder(coder: NSCoder): this;

	initWithNibNameBundle(nibNameOrNil: string, nibBundleOrNil: NSBundle): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	loadView(): void;

	/**
	 * @since 9.0
	 */
	loadViewIfNeeded(): void;

	/**
	 * @since 8.0
	 * @deprecated 17.0
	 */
	overrideTraitCollectionForChildViewController(childViewController: UIViewController): UITraitCollection;

	/**
	 * @since 5.0
	 */
	performSegueWithIdentifierSender(identifier: string, sender: any): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	/**
	 * @since 8.0
	 */
	preferredContentSizeDidChangeForChildContentContainer(container: UIContentContainer): void;

	/**
	 * @since 5.0
	 */
	prepareForSegueSender(segue: UIStoryboardSegue, sender: any): void;

	/**
	 * @since 2.0
	 * @deprecated 6.0
	 */
	presentModalViewControllerAnimated(modalViewController: UIViewController, animated: boolean): void;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	presentMoviePlayerViewControllerAnimated(moviePlayerViewController: MPMoviePlayerViewController): void;

	/**
	 * @since 5.0
	 */
	presentViewControllerAnimatedCompletion(viewControllerToPresent: UIViewController, flag: boolean, completion: () => void): void;

	/**
	 * @since 9.0
	 * @deprecated 13.0
	 */
	registerForPreviewingWithDelegateSourceView(delegate: UIViewControllerPreviewingDelegate, sourceView: UIView): UIViewControllerPreviewing;

	registerForTraitChangesWithAction(traits: NSArray<typeof NSObject> | typeof NSObject[], action: string): UITraitChangeRegistration;

	registerForTraitChangesWithHandler(traits: NSArray<typeof NSObject> | typeof NSObject[], handler: (p1: UITraitEnvironment, p2: UITraitCollection) => void): UITraitChangeRegistration;

	registerForTraitChangesWithTargetAction(traits: NSArray<typeof NSObject> | typeof NSObject[], target: any, action: string): UITraitChangeRegistration;

	/**
	 * @since 5.0
	 */
	removeFromParentViewController(): void;

	/**
	 * @since 9.0
	 */
	removeKeyCommand(keyCommand: UIKeyCommand): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	/**
	 * @since 2.0
	 * @deprecated 8.0
	 */
	rotatingFooterView(): UIView;

	/**
	 * @since 2.0
	 * @deprecated 8.0
	 */
	rotatingHeaderView(): UIView;

	/**
	 * @since 6.0
	 * @deprecated 9.0
	 */
	segueForUnwindingToViewControllerFromViewControllerIdentifier(toViewController: UIViewController, fromViewController: UIViewController, identifier: string): UIStoryboardSegue;

	self(): this;

	/**
	 * @since 8.0
	 */
	separateSecondaryViewControllerForSplitViewController(splitViewController: UISplitViewController): UIViewController;

	/**
	 * @since 15.0
	 */
	setContentScrollViewForEdge(scrollView: UIScrollView, edge: NSDirectionalRectEdge): void;

	setEditingAnimated(editing: boolean, animated: boolean): void;

	setNeedsFocusUpdate(): void;

	/**
	 * @since 7.0
	 */
	setNeedsStatusBarAppearanceUpdate(): void;

	/**
	 * @since 17.0
	 */
	setNeedsUpdateContentUnavailableConfiguration(): void;

	/**
	 * @since 11.0
	 */
	setNeedsUpdateOfHomeIndicatorAutoHidden(): void;

	/**
	 * @since 14.0
	 */
	setNeedsUpdateOfPrefersPointerLocked(): void;

	/**
	 * @since 11.0
	 */
	setNeedsUpdateOfScreenEdgesDeferringSystemGestures(): void;

	/**
	 * @since 16.0
	 */
	setNeedsUpdateOfSupportedInterfaceOrientations(): void;

	/**
	 * @since 8.0
	 * @deprecated 17.0
	 */
	setOverrideTraitCollectionForChildViewController(collection: UITraitCollection, childViewController: UIViewController): void;

	/**
	 * @since 3.0
	 */
	setToolbarItemsAnimated(toolbarItems: NSArray<UIBarButtonItem> | UIBarButtonItem[], animated: boolean): void;

	/**
	 * @since 6.0
	 * @deprecated 8.0
	 */
	shouldAutomaticallyForwardRotationMethods(): boolean;

	/**
	 * @since 2.0
	 * @deprecated 6.0
	 */
	shouldAutorotateToInterfaceOrientation(toInterfaceOrientation: UIInterfaceOrientation): boolean;

	/**
	 * @since 6.0
	 */
	shouldPerformSegueWithIdentifierSender(identifier: string, sender: any): boolean;

	shouldUpdateFocusInContext(context: UIFocusUpdateContext): boolean;

	/**
	 * @since 8.0
	 */
	showDetailViewControllerSender(vc: UIViewController, sender: any): void;

	/**
	 * @since 8.0
	 */
	showViewControllerSender(vc: UIViewController, sender: any): void;

	/**
	 * @since 8.0
	 */
	sizeForChildContentContainerWithParentContainerSize(container: UIContentContainer, parentSize: CGSize): CGSize;

	/**
	 * @since 8.0
	 */
	systemLayoutFittingSizeDidChangeForChildContentContainer(container: UIContentContainer): void;

	/**
	 * @since 8.0
	 */
	targetViewControllerForActionSender(action: string, sender: any): UIViewController;

	/**
	 * @since 8.0
	 * @deprecated 17.0
	 */
	traitCollectionDidChange(previousTraitCollection: UITraitCollection): void;

	/**
	 * @since 5.0
	 */
	transitionFromViewControllerToViewControllerDurationOptionsAnimationsCompletion(fromViewController: UIViewController, toViewController: UIViewController, duration: number, options: UIViewAnimationOptions, animations: () => void, completion: (p1: boolean) => void): void;

	/**
	 * @since 9.0
	 * @deprecated 13.0
	 */
	unregisterForPreviewingWithContext(previewing: UIViewControllerPreviewing): void;

	unregisterForTraitChanges(registration: UITraitChangeRegistration): void;

	/**
	 * @since 9.0
	 */
	unwindForSegueTowardsViewController(unwindSegue: UIStoryboardSegue, subsequentVC: UIViewController): void;

	/**
	 * @since 17.0
	 */
	updateContentUnavailableConfigurationUsingState(state: UIContentUnavailableConfigurationState): void;

	updateFocusIfNeeded(): void;

	updateTraitsIfNeeded(): void;

	/**
	 * @since 6.0
	 */
	updateViewConstraints(): void;

	/**
	 * @since 6.0
	 * @deprecated 9.0
	 */
	viewControllerForUnwindSegueActionFromViewControllerWithSender(action: string, fromViewController: UIViewController, sender: any): UIViewController;

	viewDidAppear(animated: boolean): void;

	viewDidDisappear(animated: boolean): void;

	/**
	 * @since 5.0
	 */
	viewDidLayoutSubviews(): void;

	viewDidLoad(): void;

	/**
	 * @since 3.0
	 * @deprecated 6.0
	 */
	viewDidUnload(): void;

	/**
	 * @since 13.0
	 */
	viewIsAppearing(animated: boolean): void;

	/**
	 * @since 11.0
	 */
	viewLayoutMarginsDidChange(): void;

	/**
	 * @since 11.0
	 */
	viewSafeAreaInsetsDidChange(): void;

	viewWillAppear(animated: boolean): void;

	viewWillDisappear(animated: boolean): void;

	/**
	 * @since 5.0
	 */
	viewWillLayoutSubviews(): void;

	/**
	 * @since 8.0
	 */
	viewWillTransitionToSizeWithTransitionCoordinator(size: CGSize, coordinator: UIViewControllerTransitionCoordinator): void;

	/**
	 * @since 5.0
	 * @deprecated 6.0
	 */
	viewWillUnload(): void;

	/**
	 * @since 2.0
	 * @deprecated 5.0
	 */
	willAnimateFirstHalfOfRotationToInterfaceOrientationDuration(toInterfaceOrientation: UIInterfaceOrientation, duration: number): void;

	/**
	 * @since 3.0
	 * @deprecated 8.0
	 */
	willAnimateRotationToInterfaceOrientationDuration(toInterfaceOrientation: UIInterfaceOrientation, duration: number): void;

	/**
	 * @since 2.0
	 * @deprecated 5.0
	 */
	willAnimateSecondHalfOfRotationFromInterfaceOrientationDuration(fromInterfaceOrientation: UIInterfaceOrientation, duration: number): void;

	/**
	 * @since 5.0
	 */
	willMoveToParentViewController(parent: UIViewController): void;

	/**
	 * @since 2.0
	 * @deprecated 8.0
	 */
	willRotateToInterfaceOrientationDuration(toInterfaceOrientation: UIInterfaceOrientation, duration: number): void;

	/**
	 * @since 8.0
	 */
	willTransitionToTraitCollectionWithTransitionCoordinator(newCollection: UITraitCollection, coordinator: UIViewControllerTransitionCoordinator): void;
}

interface UIViewControllerAnimatedTransitioning extends NSObjectProtocol {

	animateTransition(transitionContext: UIViewControllerContextTransitioning): void;

	animationEnded?(transitionCompleted: boolean): void;

	/**
	 * @since 10.0
	 */
	interruptibleAnimatorForTransition?(transitionContext: UIViewControllerContextTransitioning): UIViewImplicitlyAnimating;

	transitionDuration(transitionContext: UIViewControllerContextTransitioning): number;
}
declare var UIViewControllerAnimatedTransitioning: {

	prototype: UIViewControllerAnimatedTransitioning;
};

interface UIViewControllerContextTransitioning extends NSObjectProtocol {

	animated: boolean;

	containerView: UIView;

	interactive: boolean;

	presentationStyle: UIModalPresentationStyle;

	/**
	 * @since 8.0
	 */
	targetTransform: CGAffineTransform;

	transitionWasCancelled: boolean;

	cancelInteractiveTransition(): void;

	completeTransition(didComplete: boolean): void;

	finalFrameForViewController(vc: UIViewController): CGRect;

	finishInteractiveTransition(): void;

	initialFrameForViewController(vc: UIViewController): CGRect;

	/**
	 * @since 10.0
	 */
	pauseInteractiveTransition(): void;

	updateInteractiveTransition(percentComplete: number): void;

	viewControllerForKey(key: string): UIViewController;

	/**
	 * @since 8.0
	 */
	viewForKey(key: string): UIView;
}
declare var UIViewControllerContextTransitioning: {

	prototype: UIViewControllerContextTransitioning;
};

/**
 * @since 5.0
 */
declare var UIViewControllerHierarchyInconsistencyException: string;

interface UIViewControllerInteractiveTransitioning extends NSObjectProtocol {

	completionCurve?: UIViewAnimationCurve;

	completionSpeed?: number;

	/**
	 * @since 10.0
	 */
	wantsInteractiveStart?: boolean;

	startInteractiveTransition(transitionContext: UIViewControllerContextTransitioning): void;
}
declare var UIViewControllerInteractiveTransitioning: {

	prototype: UIViewControllerInteractiveTransitioning;
};

interface UIViewControllerPreviewing extends NSObjectProtocol {

	/**
	 * @since 9.0
	 * @deprecated 13.0
	 */
	delegate: UIViewControllerPreviewingDelegate;

	/**
	 * @since 9.0
	 * @deprecated 13.0
	 */
	previewingGestureRecognizerForFailureRelationship: UIGestureRecognizer;

	/**
	 * @since 9.0
	 * @deprecated 13.0
	 */
	sourceRect: CGRect;

	/**
	 * @since 9.0
	 * @deprecated 13.0
	 */
	sourceView: UIView;
}
declare var UIViewControllerPreviewing: {

	prototype: UIViewControllerPreviewing;
};

/**
 * @since 9.0
 */
interface UIViewControllerPreviewingDelegate extends NSObjectProtocol {

	/**
	 * @since 9.0
	 * @deprecated 13.0
	 */
	previewingContextCommitViewController(previewingContext: UIViewControllerPreviewing, viewControllerToCommit: UIViewController): void;

	/**
	 * @since 9.0
	 * @deprecated 13.0
	 */
	previewingContextViewControllerForLocation(previewingContext: UIViewControllerPreviewing, location: CGPoint): UIViewController;
}
declare var UIViewControllerPreviewingDelegate: {

	prototype: UIViewControllerPreviewingDelegate;
};

interface UIViewControllerRestoration {
}
declare var UIViewControllerRestoration: {

	prototype: UIViewControllerRestoration;

	viewControllerWithRestorationIdentifierPathCoder(identifierComponents: NSArray<string> | string[], coder: NSCoder): UIViewController;
};

/**
 * @since 8.0
 */
declare var UIViewControllerShowDetailTargetDidChangeNotification: string;

/**
 * @since 18.0
 */
declare class UIViewControllerTransition extends NSObject {

	static alloc(): UIViewControllerTransition; // inherited from NSObject

	static coverVerticalTransition(): UIViewControllerTransition;

	static crossDissolveTransition(): UIViewControllerTransition;

	static flipHorizontalTransition(): UIViewControllerTransition;

	static new(): UIViewControllerTransition; // inherited from NSObject

	static partialCurlTransition(): UIViewControllerTransition;

	static zoomWithOptionsSourceViewProvider(options: UIZoomTransitionOptions, sourceViewProvider: (p1: UIZoomTransitionSourceViewProviderContext) => UIView): UIViewControllerTransition;
}

interface UIViewControllerTransitionCoordinator extends UIViewControllerTransitionCoordinatorContext {

	animateAlongsideTransitionCompletion(animation: (p1: UIViewControllerTransitionCoordinatorContext) => void, completion: (p1: UIViewControllerTransitionCoordinatorContext) => void): boolean;

	animateAlongsideTransitionInViewAnimationCompletion(view: UIView, animation: (p1: UIViewControllerTransitionCoordinatorContext) => void, completion: (p1: UIViewControllerTransitionCoordinatorContext) => void): boolean;

	/**
	 * @since 10.0
	 */
	notifyWhenInteractionChangesUsingBlock(handler: (p1: UIViewControllerTransitionCoordinatorContext) => void): void;

	/**
	 * @since 7.0
	 * @deprecated 10.0
	 */
	notifyWhenInteractionEndsUsingBlock(handler: (p1: UIViewControllerTransitionCoordinatorContext) => void): void;
}
declare var UIViewControllerTransitionCoordinator: {

	prototype: UIViewControllerTransitionCoordinator;
};

interface UIViewControllerTransitionCoordinatorContext extends NSObjectProtocol {

	animated: boolean;

	cancelled: boolean;

	completionCurve: UIViewAnimationCurve;

	completionVelocity: number;

	containerView: UIView;

	initiallyInteractive: boolean;

	interactive: boolean;

	/**
	 * @since 10.0
	 */
	isInterruptible: boolean;

	percentComplete: number;

	presentationStyle: UIModalPresentationStyle;

	/**
	 * @since 8.0
	 */
	targetTransform: CGAffineTransform;

	transitionDuration: number;

	viewControllerForKey(key: string): UIViewController;

	/**
	 * @since 8.0
	 */
	viewForKey(key: string): UIView;
}
declare var UIViewControllerTransitionCoordinatorContext: {

	prototype: UIViewControllerTransitionCoordinatorContext;
};

interface UIViewControllerTransitioningDelegate extends NSObjectProtocol {

	animationControllerForDismissedController?(dismissed: UIViewController): UIViewControllerAnimatedTransitioning;

	animationControllerForPresentedControllerPresentingControllerSourceController?(presented: UIViewController, presenting: UIViewController, source: UIViewController): UIViewControllerAnimatedTransitioning;

	interactionControllerForDismissal?(animator: UIViewControllerAnimatedTransitioning): UIViewControllerInteractiveTransitioning;

	interactionControllerForPresentation?(animator: UIViewControllerAnimatedTransitioning): UIViewControllerInteractiveTransitioning;

	/**
	 * @since 8.0
	 */
	presentationControllerForPresentedViewControllerPresentingViewControllerSourceViewController?(presented: UIViewController, presenting: UIViewController, source: UIViewController): UIPresentationController;
}
declare var UIViewControllerTransitioningDelegate: {

	prototype: UIViewControllerTransitioningDelegate;
};

interface UIViewImplicitlyAnimating extends UIViewAnimating {

	addAnimations?(animation: () => void): void;

	addAnimationsDelayFactor?(animation: () => void, delayFactor: number): void;

	addCompletion?(completion: (p1: UIViewAnimatingPosition) => void): void;

	continueAnimationWithTimingParametersDurationFactor?(parameters: UITimingCurveProvider, durationFactor: number): void;
}
declare var UIViewImplicitlyAnimating: {

	prototype: UIViewImplicitlyAnimating;
};

/**
 * @since 7.0
 */
declare const enum UIViewKeyframeAnimationOptions {

	LayoutSubviews = 1,

	AllowUserInteraction = 2,

	BeginFromCurrentState = 4,

	Repeat = 8,

	Autoreverse = 16,

	OverrideInheritedDuration = 32,

	OverrideInheritedOptions = 512,

	CalculationModeLinear = 0,

	CalculationModeDiscrete = 1024,

	CalculationModePaced = 2048,

	CalculationModeCubic = 3072,

	CalculationModeCubicPaced = 4096
}

/**
 * @since 6.0
 */
declare var UIViewNoIntrinsicMetric: number;

/**
 * @since 4.2
 */
declare class UIViewPrintFormatter extends UIPrintFormatter {

	static alloc(): UIViewPrintFormatter; // inherited from NSObject

	static new(): UIViewPrintFormatter; // inherited from NSObject

	readonly view: UIView;
}

/**
 * @since 10.0
 */
declare class UIViewPropertyAnimator extends NSObject implements NSCopying, UIViewImplicitlyAnimating {

	static alloc(): UIViewPropertyAnimator; // inherited from NSObject

	static new(): UIViewPropertyAnimator; // inherited from NSObject

	static runningPropertyAnimatorWithDurationDelayOptionsAnimationsCompletion(duration: number, delay: number, options: UIViewAnimationOptions, animations: () => void, completion: (p1: UIViewAnimatingPosition) => void): UIViewPropertyAnimator;

	readonly delay: number;

	readonly duration: number;

	interruptible: boolean;

	manualHitTestingEnabled: boolean;

	/**
	 * @since 11.0
	 */
	pausesOnCompletion: boolean;

	/**
	 * @since 11.0
	 */
	scrubsLinearly: boolean;

	readonly timingParameters: UITimingCurveProvider;

	userInteractionEnabled: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	fractionComplete: number; // inherited from UIViewAnimating

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	reversed: boolean; // inherited from UIViewAnimating

	readonly running: boolean; // inherited from UIViewAnimating

	readonly state: UIViewAnimatingState; // inherited from UIViewAnimating

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { duration: number; controlPoint1: CGPoint; controlPoint2: CGPoint; animations: () => void; });

	constructor(o: { duration: number; curve: UIViewAnimationCurve; animations: () => void; });

	constructor(o: { duration: number; dampingRatio: number; animations: () => void; });

	constructor(o: { duration: number; timingParameters: UITimingCurveProvider; });

	addAnimations(animation: () => void): void;

	addAnimationsDelayFactor(animation: () => void, delayFactor: number): void;

	addCompletion(completion: (p1: UIViewAnimatingPosition) => void): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	continueAnimationWithTimingParametersDurationFactor(parameters: UITimingCurveProvider, durationFactor: number): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	finishAnimationAtPosition(finalPosition: UIViewAnimatingPosition): void;

	initWithDurationControlPoint1ControlPoint2Animations(duration: number, point1: CGPoint, point2: CGPoint, animations: () => void): this;

	initWithDurationCurveAnimations(duration: number, curve: UIViewAnimationCurve, animations: () => void): this;

	initWithDurationDampingRatioAnimations(duration: number, ratio: number, animations: () => void): this;

	initWithDurationTimingParameters(duration: number, parameters: UITimingCurveProvider): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	pauseAnimation(): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	startAnimation(): void;

	startAnimationAfterDelay(delay: number): void;

	stopAnimation(withoutFinishing: boolean): void;
}

/**
 * @since 7.0
 */
declare const enum UIViewTintAdjustmentMode {

	Automatic = 0,

	Normal = 1,

	Dimmed = 2
}

/**
 * @since 8.0
 */
declare class UIVisualEffect extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UIVisualEffect; // inherited from NSObject

	static new(): UIVisualEffect; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 8.0
 */
declare class UIVisualEffectView extends UIView implements NSSecureCoding {

	static alloc(): UIVisualEffectView; // inherited from NSObject

	static appearance(): UIVisualEffectView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIVisualEffectView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIVisualEffectView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIVisualEffectView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIVisualEffectView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIVisualEffectView; // inherited from UIAppearance

	static new(): UIVisualEffectView; // inherited from NSObject

	readonly contentView: UIView;

	effect: UIVisualEffect;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { effect: UIVisualEffect; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithEffect(effect: UIVisualEffect): this;
}

declare const enum UIWebPaginationBreakingMode {

	Page = 0,

	Column = 1
}

declare const enum UIWebPaginationMode {

	Unpaginated = 0,

	LeftToRight = 1,

	TopToBottom = 2,

	BottomToTop = 3,

	RightToLeft = 4
}

/**
 * @since 2.0
 * @deprecated 12.0
 */
declare class UIWebView extends UIView implements NSCoding, UIScrollViewDelegate {

	static alloc(): UIWebView; // inherited from NSObject

	static appearance(): UIWebView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIWebView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIWebView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIWebView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIWebView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIWebView; // inherited from UIAppearance

	static new(): UIWebView; // inherited from NSObject

	/**
	 * @since 4.0
	 */
	allowsInlineMediaPlayback: boolean;

	/**
	 * @since 9.0
	 */
	allowsLinkPreview: boolean;

	/**
	 * @since 9.0
	 */
	allowsPictureInPictureMediaPlayback: boolean;

	readonly canGoBack: boolean;

	readonly canGoForward: boolean;

	/**
	 * @since 3.0
	 */
	dataDetectorTypes: UIDataDetectorTypes;

	delegate: UIWebViewDelegate;

	/**
	 * @since 2.0
	 * @deprecated 3.0
	 */
	detectsPhoneNumbers: boolean;

	/**
	 * @since 7.0
	 */
	gapBetweenPages: number;

	/**
	 * @since 6.0
	 */
	keyboardDisplayRequiresUserAction: boolean;

	readonly loading: boolean;

	/**
	 * @since 5.0
	 */
	mediaPlaybackAllowsAirPlay: boolean;

	/**
	 * @since 4.0
	 */
	mediaPlaybackRequiresUserAction: boolean;

	/**
	 * @since 7.0
	 */
	readonly pageCount: number;

	/**
	 * @since 7.0
	 */
	pageLength: number;

	/**
	 * @since 7.0
	 */
	paginationBreakingMode: UIWebPaginationBreakingMode;

	/**
	 * @since 7.0
	 */
	paginationMode: UIWebPaginationMode;

	readonly request: NSURLRequest;

	scalesPageToFit: boolean;

	/**
	 * @since 5.0
	 */
	readonly scrollView: UIScrollView;

	/**
	 * @since 6.0
	 */
	suppressesIncrementalRendering: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	encodeWithCoder(coder: NSCoder): void;

	goBack(): void;

	goForward(): void;

	initWithCoder(coder: NSCoder): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	loadDataMIMETypeTextEncodingNameBaseURL(data: NSData, MIMEType: string, textEncodingName: string, baseURL: NSURL): void;

	loadHTMLStringBaseURL(string: string, baseURL: NSURL): void;

	loadRequest(request: NSURLRequest): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	reload(): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	/**
	 * @since 11.0
	 */
	scrollViewDidChangeAdjustedContentInset(scrollView: UIScrollView): void;

	scrollViewDidEndDecelerating(scrollView: UIScrollView): void;

	scrollViewDidEndDraggingWillDecelerate(scrollView: UIScrollView, decelerate: boolean): void;

	scrollViewDidEndScrollingAnimation(scrollView: UIScrollView): void;

	scrollViewDidEndZoomingWithViewAtScale(scrollView: UIScrollView, view: UIView, scale: number): void;

	scrollViewDidScroll(scrollView: UIScrollView): void;

	scrollViewDidScrollToTop(scrollView: UIScrollView): void;

	/**
	 * @since 3.2
	 */
	scrollViewDidZoom(scrollView: UIScrollView): void;

	scrollViewShouldScrollToTop(scrollView: UIScrollView): boolean;

	scrollViewWillBeginDecelerating(scrollView: UIScrollView): void;

	scrollViewWillBeginDragging(scrollView: UIScrollView): void;

	/**
	 * @since 3.2
	 */
	scrollViewWillBeginZoomingWithView(scrollView: UIScrollView, view: UIView): void;

	/**
	 * @since 5.0
	 */
	scrollViewWillEndDraggingWithVelocityTargetContentOffset(scrollView: UIScrollView, velocity: CGPoint, targetContentOffset: interop.Pointer | interop.Reference<CGPoint>): void;

	self(): this;

	stopLoading(): void;

	stringByEvaluatingJavaScriptFromString(script: string): string;

	viewForZoomingInScrollView(scrollView: UIScrollView): UIView;
}

interface UIWebViewDelegate extends NSObjectProtocol {

	/**
	 * @since 2.0
	 * @deprecated 12.0
	 */
	webViewDidFailLoadWithError?(webView: UIWebView, error: NSError): void;

	/**
	 * @since 2.0
	 * @deprecated 12.0
	 */
	webViewDidFinishLoad?(webView: UIWebView): void;

	/**
	 * @since 2.0
	 * @deprecated 12.0
	 */
	webViewDidStartLoad?(webView: UIWebView): void;

	/**
	 * @since 2.0
	 * @deprecated 12.0
	 */
	webViewShouldStartLoadWithRequestNavigationType?(webView: UIWebView, request: NSURLRequest, navigationType: UIWebViewNavigationType): boolean;
}
declare var UIWebViewDelegate: {

	prototype: UIWebViewDelegate;
};

declare const enum UIWebViewNavigationType {

	LinkClicked = 0,

	FormSubmitted = 1,

	BackForward = 2,

	Reload = 3,

	FormResubmitted = 4,

	Other = 5
}

/**
 * @since 2.0
 */
declare class UIWindow extends UIView {

	static alloc(): UIWindow; // inherited from NSObject

	static appearance(): UIWindow; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): UIWindow; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIWindow; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIWindow; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIWindow; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIWindow; // inherited from UIAppearance

	static new(): UIWindow; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	readonly canBecomeKeyWindow: boolean;

	canResizeToFitContent: boolean;

	readonly keyWindow: boolean;

	/**
	 * @since 4.0
	 */
	rootViewController: UIViewController;

	/**
	 * @since 16.0
	 */
	readonly safeAreaAspectFitLayoutGuide: UILayoutGuide & UILayoutGuideAspectFitting;

	/**
	 * @since 3.2
	 */
	screen: UIScreen;

	windowLevel: number;

	/**
	 * @since 13.0
	 */
	windowScene: UIWindowScene;

	/**
	 * @since 13.0
	 */
	constructor(o: { windowScene: UIWindowScene; });

	becomeKeyWindow(): void;

	convertPointFromWindow(point: CGPoint, window: UIWindow): CGPoint;

	convertPointToWindow(point: CGPoint, window: UIWindow): CGPoint;

	convertRectFromWindow(rect: CGRect, window: UIWindow): CGRect;

	convertRectToWindow(rect: CGRect, window: UIWindow): CGRect;

	/**
	 * @since 13.0
	 */
	initWithWindowScene(windowScene: UIWindowScene): this;

	makeKeyAndVisible(): void;

	makeKeyWindow(): void;

	resignKeyWindow(): void;

	sendEvent(event: _UIEvent): void;

	/**
	 * @since 3.2
	 * @deprecated 13.0
	 */
	setScreen(screen: UIScreen): void;
}

declare var UIWindowDidBecomeHiddenNotification: string;

declare var UIWindowDidBecomeKeyNotification: string;

declare var UIWindowDidBecomeVisibleNotification: string;

declare var UIWindowDidResignKeyNotification: string;

declare var UIWindowLevelAlert: number;

declare var UIWindowLevelNormal: number;

declare var UIWindowLevelStatusBar: number;

/**
 * @since 13.0
 */
declare class UIWindowScene extends UIScene implements UITraitChangeObservable, UITraitEnvironment {

	static alloc(): UIWindowScene; // inherited from NSObject

	static new(): UIWindowScene; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	activityItemsConfigurationSource: UIActivityItemsConfigurationProviding;

	readonly coordinateSpace: UICoordinateSpace;

	/**
	 * @since 16.0
	 */
	readonly effectiveGeometry: UIWindowSceneGeometry;

	/**
	 * @since 15.0
	 */
	readonly focusSystem: UIFocusSystem;

	readonly fullScreen: boolean;

	readonly interfaceOrientation: UIInterfaceOrientation;

	/**
	 * @since 15.0
	 */
	readonly keyWindow: UIWindow;

	readonly screen: UIScreen;

	readonly screenshotService: UIScreenshotService;

	/**
	 * @since 13.0
	 */
	readonly sizeRestrictions: UISceneSizeRestrictions;

	/**
	 * @since 13.0
	 */
	readonly statusBarManager: UIStatusBarManager;

	readonly traitOverrides: UITraitOverrides;

	/**
	 * @since 16.0
	 */
	readonly windowingBehaviors: UISceneWindowingBehaviors;

	readonly windows: NSArray<UIWindow>;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	/**
	 * @since 8.0
	 */
	readonly traitCollection: UITraitCollection; // inherited from UITraitEnvironment

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	registerForTraitChangesWithAction(traits: NSArray<typeof NSObject> | typeof NSObject[], action: string): UITraitChangeRegistration;

	registerForTraitChangesWithHandler(traits: NSArray<typeof NSObject> | typeof NSObject[], handler: (p1: UITraitEnvironment, p2: UITraitCollection) => void): UITraitChangeRegistration;

	registerForTraitChangesWithTargetAction(traits: NSArray<typeof NSObject> | typeof NSObject[], target: any, action: string): UITraitChangeRegistration;

	/**
	 * @since 16.0
	 */
	requestGeometryUpdateWithPreferencesErrorHandler(geometryPreferences: UIWindowSceneGeometryPreferences, errorHandler: (p1: NSError) => void): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 8.0
	 * @deprecated 17.0
	 */
	traitCollectionDidChange(previousTraitCollection: UITraitCollection): void;

	unregisterForTraitChanges(registration: UITraitChangeRegistration): void;
}

/**
 * @since 15.0
 */
declare class UIWindowSceneActivationAction extends UIAction {

	/**
	 * @since 14.0
	 */
	static actionWithHandler(handler: (p1: UIAction) => void): UIWindowSceneActivationAction; // inherited from UIAction

	static actionWithIdentifierAlternateActionConfigurationProvider(identifier: string, alternateAction: UIAction, configurationProvider: (p1: UIWindowSceneActivationAction) => UIWindowSceneActivationConfiguration): UIWindowSceneActivationAction;

	static actionWithTitleImageIdentifierHandler(title: string, image: UIImage, identifier: string, handler: (p1: UIAction) => void): UIWindowSceneActivationAction; // inherited from UIAction

	static alloc(): UIWindowSceneActivationAction; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	static captureTextFromCameraActionForResponderIdentifier(responder: UIResponder & UIKeyInput, identifier: string): UIWindowSceneActivationAction; // inherited from UIAction

	static new(): UIWindowSceneActivationAction; // inherited from NSObject
}

/**
 * @since 15.0
 */
declare class UIWindowSceneActivationConfiguration extends NSObject {

	static alloc(): UIWindowSceneActivationConfiguration; // inherited from NSObject

	static new(): UIWindowSceneActivationConfiguration; // inherited from NSObject

	options: UIWindowSceneActivationRequestOptions;

	preview: UITargetedPreview;

	readonly userActivity: NSUserActivity;

	constructor(o: { userActivity: NSUserActivity; });

	initWithUserActivity(userActivity: NSUserActivity): this;
}

/**
 * @since 15.0
 */
declare class UIWindowSceneActivationInteraction extends NSObject implements UIInteraction {

	static alloc(): UIWindowSceneActivationInteraction; // inherited from NSObject

	static new(): UIWindowSceneActivationInteraction; // inherited from NSObject

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly view: UIView; // inherited from UIInteraction

	readonly  // inherited from NSObjectProtocol

	constructor(o: { configurationProvider: (p1: UIWindowSceneActivationInteraction, p2: CGPoint) => UIWindowSceneActivationConfiguration; errorHandler: (p1: NSError) => void; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	didMoveToView(view: UIView): void;

	initWithConfigurationProviderErrorHandler(configurationProvider: (p1: UIWindowSceneActivationInteraction, p2: CGPoint) => UIWindowSceneActivationConfiguration, errorHandler: (p1: NSError) => void): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	willMoveToView(view: UIView): void;
}

/**
 * @since 15.0
 */
declare class UIWindowSceneActivationRequestOptions extends UISceneActivationRequestOptions {

	static alloc(): UIWindowSceneActivationRequestOptions; // inherited from NSObject

	static new(): UIWindowSceneActivationRequestOptions; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	placement: UIWindowScenePlacement;

	/**
	 * @since 15.0
	 * @deprecated 17.0
	 */
	preferredPresentationStyle: UIWindowScenePresentationStyle;
}

/**
 * @since 13.0
 */
interface UIWindowSceneDelegate extends UISceneDelegate {

	window?: UIWindow;

	windowSceneDidUpdateCoordinateSpaceInterfaceOrientationTraitCollection?(windowScene: UIWindowScene, previousCoordinateSpace: UICoordinateSpace, previousInterfaceOrientation: UIInterfaceOrientation, previousTraitCollection: UITraitCollection): void;

	windowScenePerformActionForShortcutItemCompletionHandler?(windowScene: UIWindowScene, shortcutItem: UIApplicationShortcutItem, completionHandler: (p1: boolean) => void): void;

	windowSceneUserDidAcceptCloudKitShareWithMetadata?(windowScene: UIWindowScene, cloudKitShareMetadata: CKShareMetadata): void;
}
declare var UIWindowSceneDelegate: {

	prototype: UIWindowSceneDelegate;
};

/**
 * @since 13.0
 */
declare class UIWindowSceneDestructionRequestOptions extends UISceneDestructionRequestOptions {

	static alloc(): UIWindowSceneDestructionRequestOptions; // inherited from NSObject

	static new(): UIWindowSceneDestructionRequestOptions; // inherited from NSObject

	windowDismissalAnimation: UIWindowSceneDismissalAnimation;
}

/**
 * @since 13.0
 */
declare const enum UIWindowSceneDismissalAnimation {

	Standard = 1,

	Commit = 2,

	Decline = 3
}

/**
 * @since 17.0
 */
declare class UIWindowSceneDragInteraction extends NSObject implements UIInteraction {

	static alloc(): UIWindowSceneDragInteraction; // inherited from NSObject

	static new(): UIWindowSceneDragInteraction; // inherited from NSObject

	readonly gestureForFailureRelationships: UIGestureRecognizer;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly view: UIView; // inherited from UIInteraction

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	didMoveToView(view: UIView): void;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	willMoveToView(view: UIView): void;
}

/**
 * @since 16.0
 */
declare class UIWindowSceneGeometry extends NSObject implements NSCopying {

	static alloc(): UIWindowSceneGeometry; // inherited from NSObject

	static new(): UIWindowSceneGeometry; // inherited from NSObject

	readonly interfaceOrientation: UIInterfaceOrientation;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 16.0
 */
declare class UIWindowSceneGeometryPreferences extends NSObject {

	static alloc(): UIWindowSceneGeometryPreferences; // inherited from NSObject

	static new(): UIWindowSceneGeometryPreferences; // inherited from NSObject
}

/**
 * @since 16.0
 */
declare class UIWindowSceneGeometryPreferencesIOS extends UIWindowSceneGeometryPreferences {

	static alloc(): UIWindowSceneGeometryPreferencesIOS; // inherited from NSObject

	static new(): UIWindowSceneGeometryPreferencesIOS; // inherited from NSObject

	interfaceOrientations: UIInterfaceOrientationMask;

	constructor(o: { interfaceOrientations: UIInterfaceOrientationMask; });

	initWithInterfaceOrientations(interfaceOrientations: UIInterfaceOrientationMask): this;
}

declare class UIWindowSceneGeometryPreferencesMac extends UIWindowSceneGeometryPreferences {

	static alloc(): UIWindowSceneGeometryPreferencesMac; // inherited from NSObject

	static new(): UIWindowSceneGeometryPreferencesMac; // inherited from NSObject

	systemFrame: CGRect;

	constructor(o: { systemFrame: CGRect; });

	initWithSystemFrame(systemFrame: CGRect): this;
}

/**
 * @since 17.0
 */
declare class UIWindowScenePlacement extends NSObject implements NSCopying {

	static alloc(): UIWindowScenePlacement; // inherited from NSObject

	static new(): UIWindowScenePlacement; // inherited from NSObject

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare const enum UIWindowScenePresentationStyle {

	Automatic = 0,

	Standard = 1,

	Prominent = 2
}

/**
 * @since 17.0
 */
declare class UIWindowSceneProminentPlacement extends UIWindowScenePlacement {

	static alloc(): UIWindowSceneProminentPlacement; // inherited from NSObject

	static new(): UIWindowSceneProminentPlacement; // inherited from NSObject

	static prominentPlacement(): UIWindowSceneProminentPlacement;
}

/**
 * @since 13.0
 */
declare var UIWindowSceneSessionRoleApplication: string;

/**
 * @since 13.0
 * @deprecated 16.0
 */
declare var UIWindowSceneSessionRoleExternalDisplay: string;

/**
 * @since 16.0
 */
declare var UIWindowSceneSessionRoleExternalDisplayNonInteractive: string;

/**
 * @since 17.0
 */
declare class UIWindowSceneStandardPlacement extends UIWindowScenePlacement {

	static alloc(): UIWindowSceneStandardPlacement; // inherited from NSObject

	static new(): UIWindowSceneStandardPlacement; // inherited from NSObject

	static standardPlacement(): UIWindowSceneStandardPlacement;
}

/**
 * @since 18.0
 */
declare const enum UIWritingToolsAllowedInputOptions {

	Default = 0,

	PlainText = 1,

	RichText = 2,

	List = 4,

	Table = 8
}

/**
 * @since 18.0
 */
declare const enum UIWritingToolsBehavior {

	None = -1,

	Default = 0,

	Complete = 1,

	Limited = 2
}

/**
 * @since 18.0
 */
declare class UIZoomTransitionAlignmentRectContext extends NSObject {

	static alloc(): UIZoomTransitionAlignmentRectContext; // inherited from NSObject

	static new(): UIZoomTransitionAlignmentRectContext; // inherited from NSObject

	readonly sourceView: UIView;

	readonly zoomedViewController: UIViewController;
}

/**
 * @since 18.0
 */
declare class UIZoomTransitionInteractionContext extends NSObject {

	static alloc(): UIZoomTransitionInteractionContext; // inherited from NSObject

	static new(): UIZoomTransitionInteractionContext; // inherited from NSObject

	readonly location: CGPoint;

	readonly velocity: CGVector;

	readonly willBegin: boolean;
}

/**
 * @since 18.0
 */
declare class UIZoomTransitionOptions extends NSObject implements NSCopying {

	static alloc(): UIZoomTransitionOptions; // inherited from NSObject

	static new(): UIZoomTransitionOptions; // inherited from NSObject

	alignmentRectProvider: (p1: UIZoomTransitionAlignmentRectContext) => CGRect;

	dimmingColor: UIColor;

	dimmingVisualEffect: UIBlurEffect;

	interactiveDismissShouldBegin: (p1: UIZoomTransitionInteractionContext) => boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 18.0
 */
declare class UIZoomTransitionSourceViewProviderContext extends NSObject {

	static alloc(): UIZoomTransitionSourceViewProviderContext; // inherited from NSObject

	static new(): UIZoomTransitionSourceViewProviderContext; // inherited from NSObject

	readonly sourceViewController: UIViewController;

	readonly zoomedViewController: UIViewController;
}
