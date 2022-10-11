
declare function CGAffineTransformFromString(string: string): CGAffineTransform;

declare function CGPointFromString(string: string): CGPoint;

declare function CGRectFromString(string: string): CGRect;

declare function CGSizeFromString(string: string): CGSize;

declare function CGVectorFromString(string: string): CGVector;

declare var NSAttachmentAttributeName: string;

declare const NSAttachmentCharacter: number;

declare var NSBackgroundColorAttributeName: string;

declare var NSBackgroundColorDocumentAttribute: string;

declare var NSBaselineOffsetAttributeName: string;

declare var NSCharacterEncodingDocumentAttribute: string;

declare var NSCharacterEncodingDocumentOption: string;

declare var NSCocoaVersionDocumentAttribute: string;

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

interface NSCollectionLayoutContainer extends NSObjectProtocol {

	contentInsets: NSDirectionalEdgeInsets;

	contentSize: CGSize;

	effectiveContentInsets: NSDirectionalEdgeInsets;

	effectiveContentSize: CGSize;
}
declare var NSCollectionLayoutContainer: {

	prototype: NSCollectionLayoutContainer;
};

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

declare class NSCollectionLayoutDimension extends NSObject implements NSCopying {

	static absoluteDimension(absoluteDimension: number): NSCollectionLayoutDimension;

	static alloc(): NSCollectionLayoutDimension; // inherited from NSObject

	static estimatedDimension(estimatedDimension: number): NSCollectionLayoutDimension;

	static fractionalHeightDimension(fractionalHeight: number): NSCollectionLayoutDimension;

	static fractionalWidthDimension(fractionalWidth: number): NSCollectionLayoutDimension;

	static new(): NSCollectionLayoutDimension; // inherited from NSObject

	readonly dimension: number;

	readonly isAbsolute: boolean;

	readonly isEstimated: boolean;

	readonly isFractionalHeight: boolean;

	readonly isFractionalWidth: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

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

interface NSCollectionLayoutEnvironment extends NSObjectProtocol {

	container: NSCollectionLayoutContainer;

	traitCollection: UITraitCollection;
}
declare var NSCollectionLayoutEnvironment: {

	prototype: NSCollectionLayoutEnvironment;
};

declare class NSCollectionLayoutGroup extends NSCollectionLayoutItem implements NSCopying {

	static alloc(): NSCollectionLayoutGroup; // inherited from NSObject

	static customGroupWithLayoutSizeItemProvider(layoutSize: NSCollectionLayoutSize, itemProvider: (p1: NSCollectionLayoutEnvironment) => NSArray<NSCollectionLayoutGroupCustomItem>): NSCollectionLayoutGroup;

	static horizontalGroupWithLayoutSizeRepeatingSubitemCount(layoutSize: NSCollectionLayoutSize, subitem: NSCollectionLayoutItem, count: number): NSCollectionLayoutGroup;

	static horizontalGroupWithLayoutSizeSubitemCount(layoutSize: NSCollectionLayoutSize, subitem: NSCollectionLayoutItem, count: number): NSCollectionLayoutGroup;

	static horizontalGroupWithLayoutSizeSubitems(layoutSize: NSCollectionLayoutSize, subitems: NSArray<NSCollectionLayoutItem> | NSCollectionLayoutItem[]): NSCollectionLayoutGroup;

	static itemWithLayoutSize(layoutSize: NSCollectionLayoutSize): NSCollectionLayoutGroup; // inherited from NSCollectionLayoutItem

	static itemWithLayoutSizeSupplementaryItems(layoutSize: NSCollectionLayoutSize, supplementaryItems: NSArray<NSCollectionLayoutSupplementaryItem> | NSCollectionLayoutSupplementaryItem[]): NSCollectionLayoutGroup; // inherited from NSCollectionLayoutItem

	static new(): NSCollectionLayoutGroup; // inherited from NSObject

	static verticalGroupWithLayoutSizeRepeatingSubitemCount(layoutSize: NSCollectionLayoutSize, subitem: NSCollectionLayoutItem, count: number): NSCollectionLayoutGroup;

	static verticalGroupWithLayoutSizeSubitemCount(layoutSize: NSCollectionLayoutSize, subitem: NSCollectionLayoutItem, count: number): NSCollectionLayoutGroup;

	static verticalGroupWithLayoutSizeSubitems(layoutSize: NSCollectionLayoutSize, subitems: NSArray<NSCollectionLayoutItem> | NSCollectionLayoutItem[]): NSCollectionLayoutGroup;

	interItemSpacing: NSCollectionLayoutSpacing;

	readonly subitems: NSArray<NSCollectionLayoutItem>;

	supplementaryItems: NSArray<NSCollectionLayoutSupplementaryItem>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	visualDescription(): string;
}

declare class NSCollectionLayoutGroupCustomItem extends NSObject implements NSCopying {

	static alloc(): NSCollectionLayoutGroupCustomItem; // inherited from NSObject

	static customItemWithFrame(frame: CGRect): NSCollectionLayoutGroupCustomItem;

	static customItemWithFrameZIndex(frame: CGRect, zIndex: number): NSCollectionLayoutGroupCustomItem;

	static new(): NSCollectionLayoutGroupCustomItem; // inherited from NSObject

	readonly frame: CGRect;

	readonly zIndex: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

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

declare class NSCollectionLayoutSection extends NSObject implements NSCopying {

	static alloc(): NSCollectionLayoutSection; // inherited from NSObject

	static new(): NSCollectionLayoutSection; // inherited from NSObject

	static sectionWithGroup(group: NSCollectionLayoutGroup): NSCollectionLayoutSection;

	static sectionWithListConfigurationLayoutEnvironment(configuration: UICollectionLayoutListConfiguration, layoutEnvironment: NSCollectionLayoutEnvironment): NSCollectionLayoutSection;

	boundarySupplementaryItems: NSArray<NSCollectionLayoutBoundarySupplementaryItem>;

	contentInsets: NSDirectionalEdgeInsets;

	contentInsetsReference: UIContentInsetsReference;

	decorationItems: NSArray<NSCollectionLayoutDecorationItem>;

	interGroupSpacing: number;

	orthogonalScrollingBehavior: UICollectionLayoutSectionOrthogonalScrollingBehavior;

	supplementariesFollowContentInsets: boolean;

	supplementaryContentInsetsReference: UIContentInsetsReference;

	visibleItemsInvalidationHandler: (p1: NSArray<NSCollectionLayoutVisibleItem>, p2: CGPoint, p3: NSCollectionLayoutEnvironment) => void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class NSCollectionLayoutSize extends NSObject implements NSCopying {

	static alloc(): NSCollectionLayoutSize; // inherited from NSObject

	static new(): NSCollectionLayoutSize; // inherited from NSObject

	static sizeWithWidthDimensionHeightDimension(width: NSCollectionLayoutDimension, height: NSCollectionLayoutDimension): NSCollectionLayoutSize;

	readonly heightDimension: NSCollectionLayoutDimension;

	readonly widthDimension: NSCollectionLayoutDimension;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

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

declare var NSDefaultAttributesDocumentAttribute: string;

declare var NSDefaultAttributesDocumentOption: string;

declare var NSDefaultTabIntervalDocumentAttribute: string;

declare class NSDiffableDataSourceSectionSnapshot<ItemIdentifierType> extends NSObject implements NSCopying {

	static alloc<ItemIdentifierType>(): NSDiffableDataSourceSectionSnapshot<ItemIdentifierType>; // inherited from NSObject

	static new<ItemIdentifierType>(): NSDiffableDataSourceSectionSnapshot<ItemIdentifierType>; // inherited from NSObject

	readonly items: NSArray<ItemIdentifierType>;

	readonly rootItems: NSArray<ItemIdentifierType>;

	readonly visibleItems: NSArray<ItemIdentifierType>;

	appendItems(items: NSArray<ItemIdentifierType> | ItemIdentifierType[]): void;

	appendItemsIntoParentItem(items: NSArray<ItemIdentifierType> | ItemIdentifierType[], parentItem: ItemIdentifierType): void;

	collapseItems(items: NSArray<ItemIdentifierType> | ItemIdentifierType[]): void;

	containsItem(item: ItemIdentifierType): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	deleteAllItems(): void;

	deleteItems(items: NSArray<ItemIdentifierType> | ItemIdentifierType[]): void;

	expandItems(items: NSArray<ItemIdentifierType> | ItemIdentifierType[]): void;

	expandedItems(): NSArray<ItemIdentifierType>;

	indexOfItem(item: ItemIdentifierType): number;

	insertItemsAfterItem(items: NSArray<ItemIdentifierType> | ItemIdentifierType[], afterIdentifier: ItemIdentifierType): void;

	insertItemsBeforeItem(items: NSArray<ItemIdentifierType> | ItemIdentifierType[], beforeIdentifier: ItemIdentifierType): void;

	insertSnapshotAfterItem(snapshot: NSDiffableDataSourceSectionSnapshot<ItemIdentifierType>, item: ItemIdentifierType): ItemIdentifierType;

	insertSnapshotBeforeItem(snapshot: NSDiffableDataSourceSectionSnapshot<ItemIdentifierType>, item: ItemIdentifierType): void;

	isExpanded(item: ItemIdentifierType): boolean;

	isVisible(item: ItemIdentifierType): boolean;

	levelOfItem(item: ItemIdentifierType): number;

	parentOfChildItem(childItem: ItemIdentifierType): ItemIdentifierType;

	replaceChildrenOfParentItemWithSnapshot(parentItem: ItemIdentifierType, snapshot: NSDiffableDataSourceSectionSnapshot<ItemIdentifierType>): void;

	snapshotOfParentItem(parentItem: ItemIdentifierType): NSDiffableDataSourceSectionSnapshot<ItemIdentifierType>;

	snapshotOfParentItemIncludingParentItem(parentItem: ItemIdentifierType, includingParentItem: boolean): NSDiffableDataSourceSectionSnapshot<ItemIdentifierType>;

	visualDescription(): string;
}

declare class NSDiffableDataSourceSectionTransaction<SectionIdentifierType, ItemIdentifierType> extends NSObject {

	static alloc<SectionIdentifierType, ItemIdentifierType>(): NSDiffableDataSourceSectionTransaction<SectionIdentifierType, ItemIdentifierType>; // inherited from NSObject

	static new<SectionIdentifierType, ItemIdentifierType>(): NSDiffableDataSourceSectionTransaction<SectionIdentifierType, ItemIdentifierType>; // inherited from NSObject

	readonly difference: NSOrderedCollectionDifference<ItemIdentifierType>;

	readonly finalSnapshot: NSDiffableDataSourceSectionSnapshot<ItemIdentifierType>;

	readonly initialSnapshot: NSDiffableDataSourceSectionSnapshot<ItemIdentifierType>;

	readonly sectionIdentifier: SectionIdentifierType;
}

declare class NSDiffableDataSourceSnapshot<SectionIdentifierType, ItemIdentifierType> extends NSObject implements NSCopying {

	static alloc<SectionIdentifierType, ItemIdentifierType>(): NSDiffableDataSourceSnapshot<SectionIdentifierType, ItemIdentifierType>; // inherited from NSObject

	static new<SectionIdentifierType, ItemIdentifierType>(): NSDiffableDataSourceSnapshot<SectionIdentifierType, ItemIdentifierType>; // inherited from NSObject

	readonly itemIdentifiers: NSArray<ItemIdentifierType>;

	readonly numberOfItems: number;

	readonly numberOfSections: number;

	readonly reconfiguredItemIdentifiers: NSArray<ItemIdentifierType>;

	readonly reloadedItemIdentifiers: NSArray<ItemIdentifierType>;

	readonly reloadedSectionIdentifiers: NSArray<SectionIdentifierType>;

	readonly sectionIdentifiers: NSArray<SectionIdentifierType>;

	appendItemsWithIdentifiers(identifiers: NSArray<ItemIdentifierType> | ItemIdentifierType[]): void;

	appendItemsWithIdentifiersIntoSectionWithIdentifier(identifiers: NSArray<ItemIdentifierType> | ItemIdentifierType[], sectionIdentifier: SectionIdentifierType): void;

	appendSectionsWithIdentifiers(sectionIdentifiers: NSArray<SectionIdentifierType> | SectionIdentifierType[]): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	deleteAllItems(): void;

	deleteItemsWithIdentifiers(identifiers: NSArray<ItemIdentifierType> | ItemIdentifierType[]): void;

	deleteSectionsWithIdentifiers(sectionIdentifiers: NSArray<SectionIdentifierType> | SectionIdentifierType[]): void;

	indexOfItemIdentifier(itemIdentifier: ItemIdentifierType): number;

	indexOfSectionIdentifier(sectionIdentifier: SectionIdentifierType): number;

	insertItemsWithIdentifiersAfterItemWithIdentifier(identifiers: NSArray<ItemIdentifierType> | ItemIdentifierType[], itemIdentifier: ItemIdentifierType): void;

	insertItemsWithIdentifiersBeforeItemWithIdentifier(identifiers: NSArray<ItemIdentifierType> | ItemIdentifierType[], itemIdentifier: ItemIdentifierType): void;

	insertSectionsWithIdentifiersAfterSectionWithIdentifier(sectionIdentifiers: NSArray<SectionIdentifierType> | SectionIdentifierType[], toSectionIdentifier: SectionIdentifierType): void;

	insertSectionsWithIdentifiersBeforeSectionWithIdentifier(sectionIdentifiers: NSArray<SectionIdentifierType> | SectionIdentifierType[], toSectionIdentifier: SectionIdentifierType): void;

	itemIdentifiersInSectionWithIdentifier(sectionIdentifier: SectionIdentifierType): NSArray<ItemIdentifierType>;

	moveItemWithIdentifierAfterItemWithIdentifier(fromIdentifier: ItemIdentifierType, toIdentifier: ItemIdentifierType): void;

	moveItemWithIdentifierBeforeItemWithIdentifier(fromIdentifier: ItemIdentifierType, toIdentifier: ItemIdentifierType): void;

	moveSectionWithIdentifierAfterSectionWithIdentifier(fromSectionIdentifier: SectionIdentifierType, toSectionIdentifier: SectionIdentifierType): void;

	moveSectionWithIdentifierBeforeSectionWithIdentifier(fromSectionIdentifier: SectionIdentifierType, toSectionIdentifier: SectionIdentifierType): void;

	numberOfItemsInSection(sectionIdentifier: SectionIdentifierType): number;

	reconfigureItemsWithIdentifiers(identifiers: NSArray<ItemIdentifierType> | ItemIdentifierType[]): void;

	reloadItemsWithIdentifiers(identifiers: NSArray<ItemIdentifierType> | ItemIdentifierType[]): void;

	reloadSectionsWithIdentifiers(sectionIdentifiers: NSArray<SectionIdentifierType> | SectionIdentifierType[]): void;

	sectionIdentifierForSectionContainingItemIdentifier(itemIdentifier: ItemIdentifierType): SectionIdentifierType;
}

declare class NSDiffableDataSourceTransaction<SectionIdentifierType, ItemIdentifierType> extends NSObject {

	static alloc<SectionIdentifierType, ItemIdentifierType>(): NSDiffableDataSourceTransaction<SectionIdentifierType, ItemIdentifierType>; // inherited from NSObject

	static new<SectionIdentifierType, ItemIdentifierType>(): NSDiffableDataSourceTransaction<SectionIdentifierType, ItemIdentifierType>; // inherited from NSObject

	readonly difference: NSOrderedCollectionDifference<ItemIdentifierType>;

	readonly finalSnapshot: NSDiffableDataSourceSnapshot<SectionIdentifierType, ItemIdentifierType>;

	readonly initialSnapshot: NSDiffableDataSourceSnapshot<SectionIdentifierType, ItemIdentifierType>;

	readonly sectionTransactions: NSArray<NSDiffableDataSourceSectionTransaction<SectionIdentifierType, ItemIdentifierType>>;
}

interface NSDirectionalEdgeInsets {
	top: number;
	leading: number;
	bottom: number;
	trailing: number;
}
declare var NSDirectionalEdgeInsets: interop.StructType<NSDirectionalEdgeInsets>;

declare function NSDirectionalEdgeInsetsFromString(string: string): NSDirectionalEdgeInsets;

declare var NSDirectionalEdgeInsetsZero: NSDirectionalEdgeInsets;

declare const enum NSDirectionalRectEdge {

	None = 0,

	Top = 1,

	Leading = 2,

	Bottom = 4,

	Trailing = 8,

	All = 15
}

declare var NSDocumentTypeDocumentAttribute: string;

declare var NSDocumentTypeDocumentOption: string;

declare var NSExpansionAttributeName: string;

declare var NSFontAttributeName: string;

declare var NSForegroundColorAttributeName: string;

declare const enum NSGlyphProperty {

	Null = 1,

	ControlCharacter = 2,

	Elastic = 4,

	NonBaseCharacter = 8
}

declare var NSHTMLTextDocumentType: string;

declare var NSHyphenationFactorDocumentAttribute: string;

declare var NSKernAttributeName: string;

declare class NSLayoutAnchor<AnchorType> extends NSObject implements NSCoding, NSCopying {

	static alloc<AnchorType>(): NSLayoutAnchor<AnchorType>; // inherited from NSObject

	static new<AnchorType>(): NSLayoutAnchor<AnchorType>; // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constraintEqualToAnchor(anchor: NSLayoutAnchor<AnchorType>): NSLayoutConstraint;

	constraintEqualToAnchorConstant(anchor: NSLayoutAnchor<AnchorType>, c: number): NSLayoutConstraint;

	constraintGreaterThanOrEqualToAnchor(anchor: NSLayoutAnchor<AnchorType>): NSLayoutConstraint;

	constraintGreaterThanOrEqualToAnchorConstant(anchor: NSLayoutAnchor<AnchorType>, c: number): NSLayoutConstraint;

	constraintLessThanOrEqualToAnchor(anchor: NSLayoutAnchor<AnchorType>): NSLayoutConstraint;

	constraintLessThanOrEqualToAnchorConstant(anchor: NSLayoutAnchor<AnchorType>, c: number): NSLayoutConstraint;

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

declare class NSLayoutConstraint extends NSObject {

	static activateConstraints(constraints: NSArray<NSLayoutConstraint> | NSLayoutConstraint[]): void;

	static alloc(): NSLayoutConstraint; // inherited from NSObject

	static constraintWithItemAttributeRelatedByToItemAttributeMultiplierConstant(view1: any, attr1: NSLayoutAttribute, relation: NSLayoutRelation, view2: any, attr2: NSLayoutAttribute, multiplier: number, c: number): NSLayoutConstraint;

	static constraintsWithVisualFormatOptionsMetricsViews(format: string, opts: NSLayoutFormatOptions, metrics: NSDictionary<string, any>, views: NSDictionary<string, any>): NSArray<NSLayoutConstraint>;

	static deactivateConstraints(constraints: NSArray<NSLayoutConstraint> | NSLayoutConstraint[]): void;

	static new(): NSLayoutConstraint; // inherited from NSObject

	active: boolean;

	constant: number;

	readonly firstAnchor: NSLayoutAnchor<any>;

	readonly firstAttribute: NSLayoutAttribute;

	readonly firstItem: any;

	identifier: string;

	readonly multiplier: number;

	priority: number;

	readonly relation: NSLayoutRelation;

	readonly secondAnchor: NSLayoutAnchor<any>;

	readonly secondAttribute: NSLayoutAttribute;

	readonly secondItem: any;

	shouldBeArchived: boolean;
}

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

declare class NSLayoutManager extends NSObject implements NSSecureCoding {

	static alloc(): NSLayoutManager; // inherited from NSObject

	static new(): NSLayoutManager; // inherited from NSObject

	allowsNonContiguousLayout: boolean;

	delegate: NSLayoutManagerDelegate;

	readonly extraLineFragmentRect: CGRect;

	readonly extraLineFragmentTextContainer: NSTextContainer;

	readonly extraLineFragmentUsedRect: CGRect;

	readonly hasNonContiguousLayout: boolean;

	hyphenationFactor: number;

	limitsLayoutForSuspiciousContents: boolean;

	readonly numberOfGlyphs: number;

	showsControlCharacters: boolean;

	showsInvisibleCharacters: boolean;

	readonly textContainers: NSArray<NSTextContainer>;

	textStorage: NSTextStorage;

	usesDefaultHyphenation: boolean;

	usesFontLeading: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	CGGlyphAtIndex(glyphIndex: number): number;

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

	enumerateEnclosingRectsForGlyphRangeWithinSelectedGlyphRangeInTextContainerUsingBlock(glyphRange: NSRange, selectedRange: NSRange, textContainer: NSTextContainer, block: (p1: CGRect, p2: interop.Pointer | interop.Reference<boolean>) => void): void;

	enumerateLineFragmentsForGlyphRangeUsingBlock(glyphRange: NSRange, block: (p1: CGRect, p2: CGRect, p3: NSTextContainer, p4: NSRange, p5: interop.Pointer | interop.Reference<boolean>) => void): void;

	fillBackgroundRectArrayCountForCharacterRangeColor(rectArray: interop.Pointer | interop.Reference<CGRect>, rectCount: number, charRange: NSRange, color: UIColor): void;

	firstUnlaidCharacterIndex(): number;

	firstUnlaidGlyphIndex(): number;

	fractionOfDistanceThroughGlyphForPointInTextContainer(point: CGPoint, container: NSTextContainer): number;

	getFirstUnlaidCharacterIndexGlyphIndex(charIndex: interop.Pointer | interop.Reference<number>, glyphIndex: interop.Pointer | interop.Reference<number>): void;

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

	invalidateLayoutForCharacterRangeActualCharacterRange(charRange: NSRange, actualCharRange: interop.Pointer | interop.Reference<NSRange>): void;

	isValidGlyphIndex(glyphIndex: number): boolean;

	lineFragmentRectForGlyphAtIndexEffectiveRange(glyphIndex: number, effectiveGlyphRange: interop.Pointer | interop.Reference<NSRange>): CGRect;

	lineFragmentRectForGlyphAtIndexEffectiveRangeWithoutAdditionalLayout(glyphIndex: number, effectiveGlyphRange: interop.Pointer | interop.Reference<NSRange>, flag: boolean): CGRect;

	lineFragmentUsedRectForGlyphAtIndexEffectiveRange(glyphIndex: number, effectiveGlyphRange: interop.Pointer | interop.Reference<NSRange>): CGRect;

	lineFragmentUsedRectForGlyphAtIndexEffectiveRangeWithoutAdditionalLayout(glyphIndex: number, effectiveGlyphRange: interop.Pointer | interop.Reference<NSRange>, flag: boolean): CGRect;

	locationForGlyphAtIndex(glyphIndex: number): CGPoint;

	notShownAttributeForGlyphAtIndex(glyphIndex: number): boolean;

	processEditingForTextStorageEditedRangeChangeInLengthInvalidatedRange(textStorage: NSTextStorage, editMask: NSTextStorageEditActions, newCharRange: NSRange, delta: number, invalidatedCharRange: NSRange): void;

	propertyForGlyphAtIndex(glyphIndex: number): NSGlyphProperty;

	rangeOfNominallySpacedGlyphsContainingIndex(glyphIndex: number): NSRange;

	removeTextContainerAtIndex(index: number): void;

	setAttachmentSizeForGlyphRange(attachmentSize: CGSize, glyphRange: NSRange): void;

	setDrawsOutsideLineFragmentForGlyphAtIndex(flag: boolean, glyphIndex: number): void;

	setExtraLineFragmentRectUsedRectTextContainer(fragmentRect: CGRect, usedRect: CGRect, container: NSTextContainer): void;

	setGlyphsPropertiesCharacterIndexesFontForGlyphRange(glyphs: interop.Pointer | interop.Reference<number>, props: interop.Pointer | interop.Reference<NSGlyphProperty>, charIndexes: interop.Pointer | interop.Reference<number>, aFont: UIFont, glyphRange: NSRange): void;

	setLineFragmentRectForGlyphRangeUsedRect(fragmentRect: CGRect, glyphRange: NSRange, usedRect: CGRect): void;

	setLocationForStartOfGlyphRange(location: CGPoint, glyphRange: NSRange): void;

	setNotShownAttributeForGlyphAtIndex(flag: boolean, glyphIndex: number): void;

	setTextContainerForGlyphRange(container: NSTextContainer, glyphRange: NSRange): void;

	showCGGlyphsPositionsCountFontMatrixAttributesInContext(glyphs: interop.Pointer | interop.Reference<number>, positions: interop.Pointer | interop.Reference<CGPoint>, glyphCount: number, font: UIFont, textMatrix: CGAffineTransform, attributes: NSDictionary<string, any>, graphicsContext: any): void;

	showCGGlyphsPositionsCountFontTextMatrixAttributesInContext(glyphs: interop.Pointer | interop.Reference<number>, positions: interop.Pointer | interop.Reference<CGPoint>, glyphCount: number, font: UIFont, textMatrix: CGAffineTransform, attributes: NSDictionary<string, any>, CGContext: any): void;

	strikethroughGlyphRangeStrikethroughTypeLineFragmentRectLineFragmentGlyphRangeContainerOrigin(glyphRange: NSRange, strikethroughVal: NSUnderlineStyle, lineRect: CGRect, lineGlyphRange: NSRange, containerOrigin: CGPoint): void;

	textContainerChangedGeometry(container: NSTextContainer): void;

	textContainerForGlyphAtIndexEffectiveRange(glyphIndex: number, effectiveGlyphRange: interop.Pointer | interop.Reference<NSRange>): NSTextContainer;

	textContainerForGlyphAtIndexEffectiveRangeWithoutAdditionalLayout(glyphIndex: number, effectiveGlyphRange: interop.Pointer | interop.Reference<NSRange>, flag: boolean): NSTextContainer;

	truncatedGlyphRangeInLineFragmentForGlyphAtIndex(glyphIndex: number): NSRange;

	underlineGlyphRangeUnderlineTypeLineFragmentRectLineFragmentGlyphRangeContainerOrigin(glyphRange: NSRange, underlineVal: NSUnderlineStyle, lineRect: CGRect, lineGlyphRange: NSRange, containerOrigin: CGPoint): void;

	usedRectForTextContainer(container: NSTextContainer): CGRect;
}

interface NSLayoutManagerDelegate extends NSObjectProtocol {

	layoutManagerBoundingBoxForControlGlyphAtIndexForTextContainerProposedLineFragmentGlyphPositionCharacterIndex?(layoutManager: NSLayoutManager, glyphIndex: number, textContainer: NSTextContainer, proposedRect: CGRect, glyphPosition: CGPoint, charIndex: number): CGRect;

	layoutManagerDidCompleteLayoutForTextContainerAtEnd?(layoutManager: NSLayoutManager, textContainer: NSTextContainer, layoutFinishedFlag: boolean): void;

	layoutManagerDidInvalidateLayout?(sender: NSLayoutManager): void;

	layoutManagerLineSpacingAfterGlyphAtIndexWithProposedLineFragmentRect?(layoutManager: NSLayoutManager, glyphIndex: number, rect: CGRect): number;

	layoutManagerParagraphSpacingAfterGlyphAtIndexWithProposedLineFragmentRect?(layoutManager: NSLayoutManager, glyphIndex: number, rect: CGRect): number;

	layoutManagerParagraphSpacingBeforeGlyphAtIndexWithProposedLineFragmentRect?(layoutManager: NSLayoutManager, glyphIndex: number, rect: CGRect): number;

	layoutManagerShouldBreakLineByHyphenatingBeforeCharacterAtIndex?(layoutManager: NSLayoutManager, charIndex: number): boolean;

	layoutManagerShouldBreakLineByWordBeforeCharacterAtIndex?(layoutManager: NSLayoutManager, charIndex: number): boolean;

	layoutManagerShouldGenerateGlyphsPropertiesCharacterIndexesFontForGlyphRange?(layoutManager: NSLayoutManager, glyphs: interop.Pointer | interop.Reference<number>, props: interop.Pointer | interop.Reference<NSGlyphProperty>, charIndexes: interop.Pointer | interop.Reference<number>, aFont: UIFont, glyphRange: NSRange): number;

	layoutManagerShouldSetLineFragmentRectLineFragmentUsedRectBaselineOffsetInTextContainerForGlyphRange?(layoutManager: NSLayoutManager, lineFragmentRect: interop.Pointer | interop.Reference<CGRect>, lineFragmentUsedRect: interop.Pointer | interop.Reference<CGRect>, baselineOffset: interop.Pointer | interop.Reference<number>, textContainer: NSTextContainer, glyphRange: NSRange): boolean;

	layoutManagerShouldUseActionForControlCharacterAtIndex?(layoutManager: NSLayoutManager, action: NSControlCharacterAction, charIndex: number): NSControlCharacterAction;

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

declare class NSLayoutXAxisAnchor extends NSLayoutAnchor<NSLayoutXAxisAnchor> {

	static alloc(): NSLayoutXAxisAnchor; // inherited from NSObject

	static new(): NSLayoutXAxisAnchor; // inherited from NSObject

	anchorWithOffsetToAnchor(otherAnchor: NSLayoutXAxisAnchor): NSLayoutDimension;

	constraintEqualToSystemSpacingAfterAnchorMultiplier(anchor: NSLayoutXAxisAnchor, multiplier: number): NSLayoutConstraint;

	constraintGreaterThanOrEqualToSystemSpacingAfterAnchorMultiplier(anchor: NSLayoutXAxisAnchor, multiplier: number): NSLayoutConstraint;

	constraintLessThanOrEqualToSystemSpacingAfterAnchorMultiplier(anchor: NSLayoutXAxisAnchor, multiplier: number): NSLayoutConstraint;
}

declare class NSLayoutYAxisAnchor extends NSLayoutAnchor<NSLayoutYAxisAnchor> {

	static alloc(): NSLayoutYAxisAnchor; // inherited from NSObject

	static new(): NSLayoutYAxisAnchor; // inherited from NSObject

	anchorWithOffsetToAnchor(otherAnchor: NSLayoutYAxisAnchor): NSLayoutDimension;

	constraintEqualToSystemSpacingBelowAnchorMultiplier(anchor: NSLayoutYAxisAnchor, multiplier: number): NSLayoutConstraint;

	constraintGreaterThanOrEqualToSystemSpacingBelowAnchorMultiplier(anchor: NSLayoutYAxisAnchor, multiplier: number): NSLayoutConstraint;

	constraintLessThanOrEqualToSystemSpacingBelowAnchorMultiplier(anchor: NSLayoutYAxisAnchor, multiplier: number): NSLayoutConstraint;
}

declare var NSLigatureAttributeName: string;

declare const enum NSLineBreakMode {

	ByWordWrapping = 0,

	ByCharWrapping = 1,

	ByClipping = 2,

	ByTruncatingHead = 3,

	ByTruncatingTail = 4,

	ByTruncatingMiddle = 5
}

declare const enum NSLineBreakStrategy {

	None = 0,

	PushOut = 1,

	HangulWordPriority = 2,

	Standard = 65535
}

declare var NSLinkAttributeName: string;

declare class NSMutableParagraphStyle extends NSParagraphStyle {

	static alloc(): NSMutableParagraphStyle; // inherited from NSObject

	static new(): NSMutableParagraphStyle; // inherited from NSObject

	alignment: NSTextAlignment;

	allowsDefaultTighteningForTruncation: boolean;

	baseWritingDirection: NSWritingDirection;

	defaultTabInterval: number;

	firstLineHeadIndent: number;

	headIndent: number;

	hyphenationFactor: number;

	lineBreakMode: NSLineBreakMode;

	lineBreakStrategy: NSLineBreakStrategy;

	lineHeightMultiple: number;

	lineSpacing: number;

	maximumLineHeight: number;

	minimumLineHeight: number;

	paragraphSpacing: number;

	paragraphSpacingBefore: number;

	tabStops: NSArray<NSTextTab>;

	tailIndent: number;

	textLists: NSArray<NSTextList>;

	usesDefaultHyphenation: boolean;

	addTabStop(anObject: NSTextTab): void;

	removeTabStop(anObject: NSTextTab): void;

	setParagraphStyle(obj: NSParagraphStyle): void;
}

declare var NSObliquenessAttributeName: string;

declare var NSPaperMarginDocumentAttribute: string;

declare var NSPaperSizeDocumentAttribute: string;

declare class NSParagraphStyle extends NSObject implements NSCopying, NSMutableCopying, NSSecureCoding {

	static alloc(): NSParagraphStyle; // inherited from NSObject

	static defaultWritingDirectionForLanguage(languageName: string): NSWritingDirection;

	static new(): NSParagraphStyle; // inherited from NSObject

	readonly alignment: NSTextAlignment;

	readonly allowsDefaultTighteningForTruncation: boolean;

	readonly baseWritingDirection: NSWritingDirection;

	readonly defaultTabInterval: number;

	readonly firstLineHeadIndent: number;

	readonly headIndent: number;

	readonly hyphenationFactor: number;

	readonly lineBreakMode: NSLineBreakMode;

	readonly lineBreakStrategy: NSLineBreakStrategy;

	readonly lineHeightMultiple: number;

	readonly lineSpacing: number;

	readonly maximumLineHeight: number;

	readonly minimumLineHeight: number;

	readonly paragraphSpacing: number;

	readonly paragraphSpacingBefore: number;

	readonly tabStops: NSArray<NSTextTab>;

	readonly tailIndent: number;

	readonly textLists: NSArray<NSTextList>;

	readonly usesDefaultHyphenation: boolean;

	static readonly defaultParagraphStyle: NSParagraphStyle;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare var NSParagraphStyleAttributeName: string;

declare var NSPlainTextDocumentType: string;

declare var NSRTFDTextDocumentType: string;

declare var NSRTFTextDocumentType: string;

declare var NSReadOnlyDocumentAttribute: string;

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

declare var NSShadowAttributeName: string;

declare var NSSourceTextScalingDocumentAttribute: string;

declare var NSSourceTextScalingDocumentOption: string;

declare var NSStrikethroughColorAttributeName: string;

declare var NSStrikethroughStyleAttributeName: string;

declare class NSStringDrawingContext extends NSObject {

	static alloc(): NSStringDrawingContext; // inherited from NSObject

	static new(): NSStringDrawingContext; // inherited from NSObject

	readonly actualScaleFactor: number;

	readonly actualTrackingAdjustment: number;

	minimumScaleFactor: number;

	minimumTrackingAdjustment: number;

	readonly totalBounds: CGRect;
}

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

declare function NSStringFromDirectionalEdgeInsets(insets: NSDirectionalEdgeInsets): string;

declare function NSStringFromUIEdgeInsets(insets: UIEdgeInsets): string;

declare function NSStringFromUIOffset(offset: UIOffset): string;

declare var NSStrokeColorAttributeName: string;

declare var NSStrokeWidthAttributeName: string;

declare var NSTabColumnTerminatorsAttributeName: string;

declare var NSTargetTextScalingDocumentOption: string;

declare const enum NSTextAlignment {

	Left = 0,

	Center = 1,

	Right = 2,

	Justified = 3,

	Natural = 4
}

declare function NSTextAlignmentFromCTTextAlignment(ctTextAlignment: CTTextAlignment): NSTextAlignment;

declare function NSTextAlignmentToCTTextAlignment(nsTextAlignment: NSTextAlignment): CTTextAlignment;

declare class NSTextAttachment extends NSObject implements NSSecureCoding, NSTextAttachmentContainer, NSTextAttachmentLayout, UIAccessibilityContentSizeCategoryImageAdjusting {

	static alloc(): NSTextAttachment; // inherited from NSObject

	static new(): NSTextAttachment; // inherited from NSObject

	static registerTextAttachmentViewProviderClassForFileType(textAttachmentViewProviderClass: typeof NSObject, fileType: string): void;

	static textAttachmentViewProviderClassForFileType(fileType: string): typeof NSObject;

	static textAttachmentWithImage(image: UIImage): NSTextAttachment;

	allowsTextAttachmentView: boolean;

	bounds: CGRect;

	contents: NSData;

	fileType: string;

	fileWrapper: NSFileWrapper;

	image: UIImage;

	lineLayoutPadding: number;

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

	constructor(o: { data: NSData; ofType: string; });

	attachmentBoundsForAttributesLocationTextContainerProposedLineFragmentPosition(attributes: NSDictionary<string, any>, location: NSTextLocation, textContainer: NSTextContainer, proposedLineFragment: CGRect, position: CGPoint): CGRect;

	attachmentBoundsForTextContainerProposedLineFragmentGlyphPositionCharacterIndex(textContainer: NSTextContainer, lineFrag: CGRect, position: CGPoint, charIndex: number): CGRect;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	encodeWithCoder(coder: NSCoder): void;

	imageForBoundsAttributesLocationTextContainer(bounds: CGRect, attributes: NSDictionary<string, any>, location: NSTextLocation, textContainer: NSTextContainer): UIImage;

	imageForBoundsTextContainerCharacterIndex(imageBounds: CGRect, textContainer: NSTextContainer, charIndex: number): UIImage;

	initWithCoder(coder: NSCoder): this;

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

	viewProviderForParentViewLocationTextContainer(parentView: UIView, location: NSTextLocation, textContainer: NSTextContainer): NSTextAttachmentViewProvider;
}

interface NSTextAttachmentContainer extends NSObjectProtocol {

	attachmentBoundsForTextContainerProposedLineFragmentGlyphPositionCharacterIndex(textContainer: NSTextContainer, lineFrag: CGRect, position: CGPoint, charIndex: number): CGRect;

	imageForBoundsTextContainerCharacterIndex(imageBounds: CGRect, textContainer: NSTextContainer, charIndex: number): UIImage;
}
declare var NSTextAttachmentContainer: {

	prototype: NSTextAttachmentContainer;
};

interface NSTextAttachmentLayout extends NSObjectProtocol {

	attachmentBoundsForAttributesLocationTextContainerProposedLineFragmentPosition(attributes: NSDictionary<string, any>, location: NSTextLocation, textContainer: NSTextContainer, proposedLineFragment: CGRect, position: CGPoint): CGRect;

	imageForBoundsAttributesLocationTextContainer(bounds: CGRect, attributes: NSDictionary<string, any>, location: NSTextLocation, textContainer: NSTextContainer): UIImage;

	viewProviderForParentViewLocationTextContainer(parentView: UIView, location: NSTextLocation, textContainer: NSTextContainer): NSTextAttachmentViewProvider;
}
declare var NSTextAttachmentLayout: {

	prototype: NSTextAttachmentLayout;
};

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

declare class NSTextContainer extends NSObject implements NSSecureCoding, NSTextLayoutOrientationProvider {

	static alloc(): NSTextContainer; // inherited from NSObject

	static new(): NSTextContainer; // inherited from NSObject

	exclusionPaths: NSArray<UIBezierPath>;

	heightTracksTextView: boolean;

	layoutManager: NSLayoutManager;

	lineBreakMode: NSLineBreakMode;

	lineFragmentPadding: number;

	maximumNumberOfLines: number;

	readonly simpleRectangularTextContainer: boolean;

	size: CGSize;

	readonly textLayoutManager: NSTextLayoutManager;

	widthTracksTextView: boolean;

	readonly layoutOrientation: NSTextLayoutOrientation; // inherited from NSTextLayoutOrientationProvider

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { size: CGSize; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithSize(size: CGSize): this;

	lineFragmentRectForProposedRectAtIndexWritingDirectionRemainingRect(proposedRect: CGRect, characterIndex: number, baseWritingDirection: NSWritingDirection, remainingRect: interop.Pointer | interop.Reference<CGRect>): CGRect;

	replaceLayoutManager(newLayoutManager: NSLayoutManager): void;
}

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

interface NSTextContentManagerDelegate extends NSObjectProtocol {

	textContentManagerShouldEnumerateTextElementOptions?(textContentManager: NSTextContentManager, textElement: NSTextElement, options: NSTextContentManagerEnumerationOptions): boolean;

	textContentManagerTextElementAtLocation?(textContentManager: NSTextContentManager, location: NSTextLocation): NSTextElement;
}
declare var NSTextContentManagerDelegate: {

	prototype: NSTextContentManagerDelegate;
};

declare const enum NSTextContentManagerEnumerationOptions {

	None = 0,

	Reverse = 1
}

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

interface NSTextContentStorageDelegate extends NSTextContentManagerDelegate {

	textContentStorageTextParagraphWithRange?(textContentStorage: NSTextContentStorage, range: NSRange): NSTextParagraph;
}
declare var NSTextContentStorageDelegate: {

	prototype: NSTextContentStorageDelegate;
};

declare var NSTextContentStorageUnsupportedAttributeAddedNotification: string;

declare var NSTextEffectAttributeName: string;

declare var NSTextEffectLetterpressStyle: string;

declare class NSTextElement extends NSObject {

	static alloc(): NSTextElement; // inherited from NSObject

	static new(): NSTextElement; // inherited from NSObject

	readonly childElements: NSArray<NSTextElement>;

	elementRange: NSTextRange;

	readonly isRepresentedElement: boolean;

	readonly parentElement: NSTextElement;

	textContentManager: NSTextContentManager;

	constructor(o: { textContentManager: NSTextContentManager; });

	initWithTextContentManager(textContentManager: NSTextContentManager): this;
}

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
}

declare const enum NSTextLayoutFragmentEnumerationOptions {

	None = 0,

	Reverse = 1,

	EstimatesSize = 2,

	EnsuresLayout = 4,

	EnsuresExtraLineFragment = 8
}

declare const enum NSTextLayoutFragmentState {

	None = 0,

	EstimatedUsageBounds = 1,

	CalculatedUsageBounds = 2,

	LayoutAvailable = 3
}

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

interface NSTextLayoutManagerDelegate extends NSObjectProtocol {

	textLayoutManagerRenderingAttributesForLinkAtLocationDefaultAttributes?(textLayoutManager: NSTextLayoutManager, link: any, location: NSTextLocation, renderingAttributes: NSDictionary<string, any>): NSDictionary<string, any>;

	textLayoutManagerShouldBreakLineBeforeLocationHyphenating?(textLayoutManager: NSTextLayoutManager, location: NSTextLocation, hyphenating: boolean): boolean;

	textLayoutManagerTextLayoutFragmentForLocationInTextElement?(textLayoutManager: NSTextLayoutManager, location: NSTextLocation, textElement: NSTextElement): NSTextLayoutFragment;
}
declare var NSTextLayoutManagerDelegate: {

	prototype: NSTextLayoutManagerDelegate;
};

declare const enum NSTextLayoutManagerSegmentOptions {

	None = 0,

	RangeNotRequired = 1,

	MiddleFragmentsExcluded = 2,

	HeadSegmentExtended = 4,

	TailSegmentExtended = 8,

	UpstreamAffinity = 16
}

declare const enum NSTextLayoutManagerSegmentType {

	Standard = 0,

	Selection = 1,

	Highlight = 2
}

declare const enum NSTextLayoutOrientation {

	Horizontal = 0,

	Vertical = 1
}

interface NSTextLayoutOrientationProvider {

	layoutOrientation: NSTextLayoutOrientation;
}
declare var NSTextLayoutOrientationProvider: {

	prototype: NSTextLayoutOrientationProvider;
};

declare var NSTextLayoutSectionOrientation: string;

declare var NSTextLayoutSectionRange: string;

declare var NSTextLayoutSectionsAttribute: string;

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

declare class NSTextList extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSTextList; // inherited from NSObject

	static new(): NSTextList; // inherited from NSObject

	readonly listOptions: NSTextListOptions;

	readonly markerFormat: string;

	readonly ordered: boolean;

	startingItemNumber: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { markerFormat: string; options: number; });

	constructor(o: { markerFormat: string; options: NSTextListOptions; startingItemNumber: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithMarkerFormatOptions(markerFormat: string, options: number): this;

	initWithMarkerFormatOptionsStartingItemNumber(markerFormat: string, options: NSTextListOptions, startingItemNumber: number): this;

	markerForItemNumber(itemNumber: number): string;
}

declare class NSTextListElement extends NSTextParagraph {

	static alloc(): NSTextListElement; // inherited from NSObject

	static new(): NSTextListElement; // inherited from NSObject

	static textListElementWithChildElementsTextListNestingLevel(childElements: NSArray<NSTextListElement> | NSTextListElement[], textList: NSTextList, nestingLevel: number): NSTextListElement;

	static textListElementWithContentsMarkerAttributesTextListChildElements(contents: NSAttributedString, markerAttributes: NSDictionary<string, any>, textList: NSTextList, childElements: NSArray<NSTextListElement> | NSTextListElement[]): NSTextListElement;

	readonly contents: NSAttributedString;

	readonly markerAttributes: NSDictionary<string, any>;

	readonly parentElement: NSTextListElement;

	readonly textList: NSTextList;

	constructor(o: { parentElement: NSTextListElement; textList: NSTextList; contents: NSAttributedString; markerAttributes: NSDictionary<string, any>; childElements: NSArray<NSTextListElement> | NSTextListElement[]; });

	initWithParentElementTextListContentsMarkerAttributesChildElements(parentElement: NSTextListElement, textList: NSTextList, contents: NSAttributedString, markerAttributes: NSDictionary<string, any>, childElements: NSArray<NSTextListElement> | NSTextListElement[]): this;
}

declare var NSTextListMarkerBox: string;

declare var NSTextListMarkerCheck: string;

declare var NSTextListMarkerCircle: string;

declare var NSTextListMarkerDecimal: string;

declare var NSTextListMarkerDiamond: string;

declare var NSTextListMarkerDisc: string;

declare var NSTextListMarkerHyphen: string;

declare var NSTextListMarkerLowercaseAlpha: string;

declare var NSTextListMarkerLowercaseHexadecimal: string;

declare var NSTextListMarkerLowercaseLatin: string;

declare var NSTextListMarkerLowercaseRoman: string;

declare var NSTextListMarkerOctal: string;

declare var NSTextListMarkerSquare: string;

declare var NSTextListMarkerUppercaseAlpha: string;

declare var NSTextListMarkerUppercaseHexadecimal: string;

declare var NSTextListMarkerUppercaseLatin: string;

declare var NSTextListMarkerUppercaseRoman: string;

declare const enum NSTextListOptions {

	PrependEnclosingMarker = 1
}

interface NSTextLocation extends NSObjectProtocol {

	compare(location: NSTextLocation): NSComparisonResult;
}
declare var NSTextLocation: {

	prototype: NSTextLocation;
};

declare class NSTextParagraph extends NSTextElement {

	static alloc(): NSTextParagraph; // inherited from NSObject

	static new(): NSTextParagraph; // inherited from NSObject

	readonly attributedString: NSAttributedString;

	readonly paragraphContentRange: NSTextRange;

	readonly paragraphSeparatorRange: NSTextRange;

	constructor(o: { attributedString: NSAttributedString; });

	initWithAttributedString(attributedString: NSAttributedString): this;
}

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

declare var NSTextScalingDocumentAttribute: string;

declare const enum NSTextScalingType {

	Standard = 0,

	iOS = 1
}

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

declare const enum NSTextSelectionAffinity {

	Upstream = 0,

	Downstream = 1
}

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

declare const enum NSTextSelectionGranularity {

	Character = 0,

	Word = 1,

	Paragraph = 2,

	Line = 3,

	Sentence = 4
}

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

declare const enum NSTextSelectionNavigationDestination {

	Character = 0,

	Word = 1,

	Line = 2,

	Sentence = 3,

	Paragraph = 4,

	Container = 5,

	Document = 6
}

declare const enum NSTextSelectionNavigationDirection {

	Forward = 0,

	Backward = 1,

	Right = 2,

	Left = 3,

	Up = 4,

	Down = 5
}

declare const enum NSTextSelectionNavigationLayoutOrientation {

	Horizontal = 0,

	Vertical = 1
}

declare const enum NSTextSelectionNavigationModifier {

	Extend = 1,

	Visual = 2,

	Multiple = 4
}

declare const enum NSTextSelectionNavigationWritingDirection {

	LeftToRight = 0,

	RightToLeft = 1
}

declare class NSTextStorage extends NSMutableAttributedString implements NSSecureCoding {

	static alloc(): NSTextStorage; // inherited from NSObject

	static new(): NSTextStorage; // inherited from NSObject

	static objectWithItemProviderDataTypeIdentifierError(data: NSData, typeIdentifier: string): NSTextStorage; // inherited from NSItemProviderReading

	readonly changeInLength: number;

	delegate: NSTextStorageDelegate;

	readonly editedMask: NSTextStorageEditActions;

	readonly editedRange: NSRange;

	readonly fixesAttributesLazily: boolean;

	readonly layoutManagers: NSArray<NSLayoutManager>;

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

	textStorageDidProcessEditingRangeChangeInLength?(textStorage: NSTextStorage, editedMask: NSTextStorageEditActions, editedRange: NSRange, delta: number): void;

	textStorageWillProcessEditingRangeChangeInLength?(textStorage: NSTextStorage, editedMask: NSTextStorageEditActions, editedRange: NSRange, delta: number): void;
}
declare var NSTextStorageDelegate: {

	prototype: NSTextStorageDelegate;
};

declare var NSTextStorageDidProcessEditingNotification: string;

declare const enum NSTextStorageEditActions {

	EditedAttributes = 1,

	EditedCharacters = 2
}

interface NSTextStorageObserving extends NSObjectProtocol {

	textStorage: NSTextStorage;

	performEditingTransactionForTextStorageUsingBlock(textStorage: NSTextStorage, transaction: () => void): void;

	processEditingForTextStorageEditedRangeChangeInLengthInvalidatedRange(textStorage: NSTextStorage, editMask: NSTextStorageEditActions, newCharRange: NSRange, delta: number, invalidatedCharRange: NSRange): void;
}
declare var NSTextStorageObserving: {

	prototype: NSTextStorageObserving;
};

declare var NSTextStorageWillProcessEditingNotification: string;

declare class NSTextTab extends NSObject implements NSCoding, NSCopying, NSSecureCoding {

	static alloc(): NSTextTab; // inherited from NSObject

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

interface NSTextViewportLayoutControllerDelegate extends NSObjectProtocol {

	textViewportLayoutControllerConfigureRenderingSurfaceForTextLayoutFragment(textViewportLayoutController: NSTextViewportLayoutController, textLayoutFragment: NSTextLayoutFragment): void;

	textViewportLayoutControllerDidLayout?(textViewportLayoutController: NSTextViewportLayoutController): void;

	textViewportLayoutControllerWillLayout?(textViewportLayoutController: NSTextViewportLayoutController): void;

	viewportBoundsForTextViewportLayoutController(textViewportLayoutController: NSTextViewportLayoutController): CGRect;
}
declare var NSTextViewportLayoutControllerDelegate: {

	prototype: NSTextViewportLayoutControllerDelegate;
};

declare const enum NSTextWritingDirection {

	Embedding = 0,

	Override = 2
}

declare var NSTrackingAttributeName: string;

declare var NSUnderlineByWord: NSUnderlineStyle;

declare var NSUnderlineColorAttributeName: string;

declare var NSUnderlinePatternDash: NSUnderlineStyle;

declare var NSUnderlinePatternDashDot: NSUnderlineStyle;

declare var NSUnderlinePatternDashDotDot: NSUnderlineStyle;

declare var NSUnderlinePatternDot: NSUnderlineStyle;

declare var NSUnderlinePatternSolid: NSUnderlineStyle;

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

declare var NSUnderlineStyleAttributeName: string;

declare var NSUserActivityDocumentURLKey: string;

declare var NSVerticalGlyphFormAttributeName: string;

declare var NSViewModeDocumentAttribute: string;

declare var NSViewSizeDocumentAttribute: string;

declare var NSViewZoomDocumentAttribute: string;

declare const enum NSWritingDirection {

	Natural = -1,

	LeftToRight = 0,

	RightToLeft = 1
}

declare var NSWritingDirectionAttributeName: string;

declare const enum NSWritingDirectionFormatType {

	Embedding = 0,

	Override = 2
}

declare class UIAcceleration extends NSObject {

	static alloc(): UIAcceleration; // inherited from NSObject

	static new(): UIAcceleration; // inherited from NSObject

	readonly timestamp: number;

	readonly x: number;

	readonly y: number;

	readonly z: number;
}

declare class UIAccelerometer extends NSObject {

	static alloc(): UIAccelerometer; // inherited from NSObject

	static new(): UIAccelerometer; // inherited from NSObject

	static sharedAccelerometer(): UIAccelerometer;

	delegate: UIAccelerometerDelegate;

	updateInterval: number;
}

interface UIAccelerometerDelegate extends NSObjectProtocol {

	accelerometerDidAccelerate?(accelerometer: UIAccelerometer, acceleration: UIAcceleration): void;
}
declare var UIAccelerometerDelegate: {

	prototype: UIAccelerometerDelegate;
};

declare var UIAccessibilityAnnouncementDidFinishNotification: string;

declare var UIAccessibilityAnnouncementKeyStringValue: string;

declare var UIAccessibilityAnnouncementKeyWasSuccessful: string;

declare var UIAccessibilityAnnouncementNotification: number;

declare var UIAccessibilityAssistiveTechnologyKey: string;

declare var UIAccessibilityAssistiveTouchStatusDidChangeNotification: string;

declare var UIAccessibilityBoldTextStatusDidChangeNotification: string;

declare function UIAccessibilityButtonShapesEnabled(): boolean;

declare var UIAccessibilityButtonShapesEnabledStatusDidChangeNotification: string;

declare var UIAccessibilityClosedCaptioningStatusDidChangeNotification: string;

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

interface UIAccessibilityContainerDataTableCell extends NSObjectProtocol {

	accessibilityColumnRange(): NSRange;

	accessibilityRowRange(): NSRange;
}
declare var UIAccessibilityContainerDataTableCell: {

	prototype: UIAccessibilityContainerDataTableCell;
};

declare const enum UIAccessibilityContainerType {

	None = 0,

	DataTable = 1,

	List = 2,

	Landmark = 3,

	SemanticGroup = 4
}

interface UIAccessibilityContentSizeCategoryImageAdjusting extends NSObjectProtocol {

	adjustsImageSizeForAccessibilityContentSizeCategory: boolean;
}
declare var UIAccessibilityContentSizeCategoryImageAdjusting: {

	prototype: UIAccessibilityContentSizeCategoryImageAdjusting;
};

declare const enum UIAccessibilityContrast {

	Unspecified = -1,

	Normal = 0,

	High = 1
}

declare function UIAccessibilityConvertFrameToScreenCoordinates(rect: CGRect, view: UIView): CGRect;

declare function UIAccessibilityConvertPathToScreenCoordinates(path: UIBezierPath, view: UIView): UIBezierPath;

declare class UIAccessibilityCustomAction extends NSObject {

	static alloc(): UIAccessibilityCustomAction; // inherited from NSObject

	static new(): UIAccessibilityCustomAction; // inherited from NSObject

	actionHandler: (p1: UIAccessibilityCustomAction) => boolean;

	attributedName: NSAttributedString;

	image: UIImage;

	name: string;

	selector: string;

	target: any;

	constructor(o: { attributedName: NSAttributedString; actionHandler: (p1: UIAccessibilityCustomAction) => boolean; });

	constructor(o: { attributedName: NSAttributedString; image: UIImage; actionHandler: (p1: UIAccessibilityCustomAction) => boolean; });

	constructor(o: { attributedName: NSAttributedString; image: UIImage; target: any; selector: string; });

	constructor(o: { attributedName: NSAttributedString; target: any; selector: string; });

	constructor(o: { name: string; actionHandler: (p1: UIAccessibilityCustomAction) => boolean; });

	constructor(o: { name: string; image: UIImage; actionHandler: (p1: UIAccessibilityCustomAction) => boolean; });

	constructor(o: { name: string; image: UIImage; target: any; selector: string; });

	constructor(o: { name: string; target: any; selector: string; });

	initWithAttributedNameActionHandler(attributedName: NSAttributedString, actionHandler: (p1: UIAccessibilityCustomAction) => boolean): this;

	initWithAttributedNameImageActionHandler(attributedName: NSAttributedString, image: UIImage, actionHandler: (p1: UIAccessibilityCustomAction) => boolean): this;

	initWithAttributedNameImageTargetSelector(attributedName: NSAttributedString, image: UIImage, target: any, selector: string): this;

	initWithAttributedNameTargetSelector(attributedName: NSAttributedString, target: any, selector: string): this;

	initWithNameActionHandler(name: string, actionHandler: (p1: UIAccessibilityCustomAction) => boolean): this;

	initWithNameImageActionHandler(name: string, image: UIImage, actionHandler: (p1: UIAccessibilityCustomAction) => boolean): this;

	initWithNameImageTargetSelector(name: string, image: UIImage, target: any, selector: string): this;

	initWithNameTargetSelector(name: string, target: any, selector: string): this;
}

declare class UIAccessibilityCustomRotor extends NSObject {

	static alloc(): UIAccessibilityCustomRotor; // inherited from NSObject

	static new(): UIAccessibilityCustomRotor; // inherited from NSObject

	attributedName: NSAttributedString;

	itemSearchBlock: (p1: UIAccessibilityCustomRotorSearchPredicate) => UIAccessibilityCustomRotorItemResult;

	name: string;

	readonly systemRotorType: UIAccessibilityCustomSystemRotorType;

	constructor(o: { attributedName: NSAttributedString; itemSearchBlock: (p1: UIAccessibilityCustomRotorSearchPredicate) => UIAccessibilityCustomRotorItemResult; });

	constructor(o: { name: string; itemSearchBlock: (p1: UIAccessibilityCustomRotorSearchPredicate) => UIAccessibilityCustomRotorItemResult; });

	constructor(o: { systemType: UIAccessibilityCustomSystemRotorType; itemSearchBlock: (p1: UIAccessibilityCustomRotorSearchPredicate) => UIAccessibilityCustomRotorItemResult; });

	initWithAttributedNameItemSearchBlock(attributedName: NSAttributedString, itemSearchBlock: (p1: UIAccessibilityCustomRotorSearchPredicate) => UIAccessibilityCustomRotorItemResult): this;

	initWithNameItemSearchBlock(name: string, itemSearchBlock: (p1: UIAccessibilityCustomRotorSearchPredicate) => UIAccessibilityCustomRotorItemResult): this;

	initWithSystemTypeItemSearchBlock(type: UIAccessibilityCustomSystemRotorType, itemSearchBlock: (p1: UIAccessibilityCustomRotorSearchPredicate) => UIAccessibilityCustomRotorItemResult): this;
}

declare const enum UIAccessibilityCustomRotorDirection {

	Previous = 0,

	Next = 1
}

declare class UIAccessibilityCustomRotorItemResult extends NSObject {

	static alloc(): UIAccessibilityCustomRotorItemResult; // inherited from NSObject

	static new(): UIAccessibilityCustomRotorItemResult; // inherited from NSObject

	targetElement: NSObjectProtocol;

	targetRange: UITextRange;

	constructor(o: { targetElement: NSObjectProtocol; targetRange: UITextRange; });

	initWithTargetElementTargetRange(targetElement: NSObjectProtocol, targetRange: UITextRange): this;
}

declare class UIAccessibilityCustomRotorSearchPredicate extends NSObject {

	static alloc(): UIAccessibilityCustomRotorSearchPredicate; // inherited from NSObject

	static new(): UIAccessibilityCustomRotorSearchPredicate; // inherited from NSObject

	currentItem: UIAccessibilityCustomRotorItemResult;

	searchDirection: UIAccessibilityCustomRotorDirection;
}

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

declare function UIAccessibilityDarkerSystemColorsEnabled(): boolean;

declare var UIAccessibilityDarkerSystemColorsStatusDidChangeNotification: string;

declare class UIAccessibilityElement extends UIResponder implements UIAccessibilityIdentification {

	static alloc(): UIAccessibilityElement; // inherited from NSObject

	static new(): UIAccessibilityElement; // inherited from NSObject

	accessibilityContainer: any;

	accessibilityFrameInContainerSpace: CGRect;

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

declare var UIAccessibilityElementFocusedNotification: string;

declare function UIAccessibilityFocusedElement(assistiveTechnologyIdentifier: string): any;

declare var UIAccessibilityFocusedElementKey: string;

declare var UIAccessibilityGrayscaleStatusDidChangeNotification: string;

declare var UIAccessibilityGuidedAccessStatusDidChangeNotification: string;

declare const enum UIAccessibilityHearingDeviceEar {

	None = 0,

	Left = 2,

	Right = 4,

	Both = 6
}

declare function UIAccessibilityHearingDevicePairedEar(): UIAccessibilityHearingDeviceEar;

declare var UIAccessibilityHearingDevicePairedEarDidChangeNotification: string;

interface UIAccessibilityIdentification extends NSObjectProtocol {

	accessibilityIdentifier: string;
}
declare var UIAccessibilityIdentification: {

	prototype: UIAccessibilityIdentification;
};

declare var UIAccessibilityInvertColorsStatusDidChangeNotification: string;

declare function UIAccessibilityIsAssistiveTouchRunning(): boolean;

declare function UIAccessibilityIsBoldTextEnabled(): boolean;

declare function UIAccessibilityIsClosedCaptioningEnabled(): boolean;

declare function UIAccessibilityIsGrayscaleEnabled(): boolean;

declare function UIAccessibilityIsGuidedAccessEnabled(): boolean;

declare function UIAccessibilityIsInvertColorsEnabled(): boolean;

declare function UIAccessibilityIsMonoAudioEnabled(): boolean;

declare function UIAccessibilityIsOnOffSwitchLabelsEnabled(): boolean;

declare function UIAccessibilityIsReduceMotionEnabled(): boolean;

declare function UIAccessibilityIsReduceTransparencyEnabled(): boolean;

declare function UIAccessibilityIsShakeToUndoEnabled(): boolean;

declare function UIAccessibilityIsSpeakScreenEnabled(): boolean;

declare function UIAccessibilityIsSpeakSelectionEnabled(): boolean;

declare function UIAccessibilityIsSwitchControlRunning(): boolean;

declare function UIAccessibilityIsVideoAutoplayEnabled(): boolean;

declare function UIAccessibilityIsVoiceOverRunning(): boolean;

declare var UIAccessibilityLayoutChangedNotification: number;

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

declare var UIAccessibilityMonoAudioStatusDidChangeNotification: string;

declare const enum UIAccessibilityNavigationStyle {

	Automatic = 0,

	Separate = 1,

	Combined = 2
}

declare var UIAccessibilityNotificationSwitchControlIdentifier: string;

declare var UIAccessibilityNotificationVoiceOverIdentifier: string;

declare var UIAccessibilityOnOffSwitchLabelsDidChangeNotification: string;

declare var UIAccessibilityPageScrolledNotification: number;

declare var UIAccessibilityPauseAssistiveTechnologyNotification: number;

declare function UIAccessibilityPostNotification(notification: number, argument: any): void;

declare function UIAccessibilityPrefersCrossFadeTransitions(): boolean;

declare var UIAccessibilityPrefersCrossFadeTransitionsStatusDidChangeNotification: string;

interface UIAccessibilityReadingContent {

	accessibilityAttributedContentForLineNumber?(lineNumber: number): NSAttributedString;

	accessibilityAttributedPageContent?(): NSAttributedString;

	accessibilityContentForLineNumber(lineNumber: number): string;

	accessibilityFrameForLineNumber(lineNumber: number): CGRect;

	accessibilityLineNumberForPoint(point: CGPoint): number;

	accessibilityPageContent(): string;
}
declare var UIAccessibilityReadingContent: {

	prototype: UIAccessibilityReadingContent;
};

declare var UIAccessibilityReduceMotionStatusDidChangeNotification: string;

declare var UIAccessibilityReduceTransparencyStatusDidChangeNotification: string;

declare function UIAccessibilityRegisterGestureConflictWithZoom(): void;

declare function UIAccessibilityRequestGuidedAccessSession(enable: boolean, completionHandler: (p1: boolean) => void): void;

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

declare var UIAccessibilityShakeToUndoDidChangeNotification: string;

declare function UIAccessibilityShouldDifferentiateWithoutColor(): boolean;

declare var UIAccessibilityShouldDifferentiateWithoutColorDidChangeNotification: string;

declare var UIAccessibilitySpeakScreenStatusDidChangeNotification: string;

declare var UIAccessibilitySpeakSelectionStatusDidChangeNotification: string;

declare var UIAccessibilitySpeechAttributeIPANotation: string;

declare var UIAccessibilitySpeechAttributeLanguage: string;

declare var UIAccessibilitySpeechAttributePitch: string;

declare var UIAccessibilitySpeechAttributePunctuation: string;

declare var UIAccessibilitySpeechAttributeQueueAnnouncement: string;

declare var UIAccessibilitySpeechAttributeSpellOut: string;

declare var UIAccessibilitySwitchControlStatusDidChangeNotification: string;

declare var UIAccessibilityTextAttributeContext: string;

declare var UIAccessibilityTextAttributeCustom: string;

declare var UIAccessibilityTextAttributeHeadingLevel: string;

declare var UIAccessibilityTextualContextConsole: string;

declare var UIAccessibilityTextualContextFileSystem: string;

declare var UIAccessibilityTextualContextMessaging: string;

declare var UIAccessibilityTextualContextNarrative: string;

declare var UIAccessibilityTextualContextSourceCode: string;

declare var UIAccessibilityTextualContextSpreadsheet: string;

declare var UIAccessibilityTextualContextWordProcessing: string;

declare var UIAccessibilityTraitAdjustable: number;

declare var UIAccessibilityTraitAllowsDirectInteraction: number;

declare var UIAccessibilityTraitButton: number;

declare var UIAccessibilityTraitCausesPageTurn: number;

declare var UIAccessibilityTraitHeader: number;

declare var UIAccessibilityTraitImage: number;

declare var UIAccessibilityTraitKeyboardKey: number;

declare var UIAccessibilityTraitLink: number;

declare var UIAccessibilityTraitNone: number;

declare var UIAccessibilityTraitNotEnabled: number;

declare var UIAccessibilityTraitPlaysSound: number;

declare var UIAccessibilityTraitSearchField: number;

declare var UIAccessibilityTraitSelected: number;

declare var UIAccessibilityTraitStartsMediaSession: number;

declare var UIAccessibilityTraitStaticText: number;

declare var UIAccessibilityTraitSummaryElement: number;

declare var UIAccessibilityTraitTabBar: number;

declare var UIAccessibilityTraitUpdatesFrequently: number;

declare var UIAccessibilityUnfocusedElementKey: string;

declare var UIAccessibilityVideoAutoplayStatusDidChangeNotification: string;

declare var UIAccessibilityVoiceOverStatusChanged: string;

declare var UIAccessibilityVoiceOverStatusDidChangeNotification: string;

declare function UIAccessibilityZoomFocusChanged(type: UIAccessibilityZoomType, frame: CGRect, view: UIView): void;

declare const enum UIAccessibilityZoomType {

	InsertionPoint = 0
}

declare class UIAction extends UIMenuElement implements UIMenuLeaf {

	static actionWithHandler(handler: (p1: UIAction) => void): UIAction;

	static actionWithTitleImageIdentifierHandler(title: string, image: UIImage, identifier: string, handler: (p1: UIAction) => void): UIAction;

	static alloc(): UIAction; // inherited from NSObject

	static captureTextFromCameraActionForResponderIdentifier(responder: UIResponder, identifier: string): UIAction;

	static new(): UIAction; // inherited from NSObject

	readonly identifier: string;

	attributes: UIMenuElementAttributes; // inherited from UIMenuLeaf

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	discoverabilityTitle: string; // inherited from UIMenuLeaf

	readonly hash: number; // inherited from NSObjectProtocol

	image: UIImage; // inherited from UIMenuLeaf

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly presentationSourceItem: UIPopoverPresentationControllerSourceItem; // inherited from UIMenuLeaf

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

declare var UIActionPaste: string;

declare var UIActionPasteAndGo: string;

declare var UIActionPasteAndMatchStyle: string;

declare var UIActionPasteAndSearch: string;

declare class UIActionSheet extends UIView {

	static alloc(): UIActionSheet; // inherited from NSObject

	static appearance(): UIActionSheet; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UIActionSheet; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIActionSheet; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIActionSheet; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIActionSheet; // inherited from UIAppearance

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

	showFromBarButtonItemAnimated(item: UIBarButtonItem, animated: boolean): void;

	showFromRectInViewAnimated(rect: CGRect, view: UIView, animated: boolean): void;

	showFromTabBar(view: UITabBar): void;

	showFromToolbar(view: UIToolbar): void;

	showInView(view: UIView): void;
}

interface UIActionSheetDelegate extends NSObjectProtocol {

	actionSheetCancel?(actionSheet: UIActionSheet): void;

	actionSheetClickedButtonAtIndex?(actionSheet: UIActionSheet, buttonIndex: number): void;

	actionSheetDidDismissWithButtonIndex?(actionSheet: UIActionSheet, buttonIndex: number): void;

	actionSheetWillDismissWithButtonIndex?(actionSheet: UIActionSheet, buttonIndex: number): void;

	didPresentActionSheet?(actionSheet: UIActionSheet): void;

	willPresentActionSheet?(actionSheet: UIActionSheet): void;
}
declare var UIActionSheetDelegate: {

	prototype: UIActionSheetDelegate;
};

declare const enum UIActionSheetStyle {

	Automatic = -1,

	Default = 0,

	BlackTranslucent = 2,

	BlackOpaque = 1
}

declare class UIActivity extends NSObject {

	static alloc(): UIActivity; // inherited from NSObject

	static new(): UIActivity; // inherited from NSObject

	readonly activityImage: UIImage;

	readonly activityTitle: string;

	readonly activityType: string;

	readonly activityViewController: UIViewController;

	static readonly activityCategory: UIActivityCategory;

	activityDidFinish(completed: boolean): void;

	canPerformWithActivityItems(activityItems: NSArray<any> | any[]): boolean;

	performActivity(): void;

	prepareWithActivityItems(activityItems: NSArray<any> | any[]): void;
}

declare const enum UIActivityCategory {

	Action = 0,

	Share = 1
}

declare class UIActivityIndicatorView extends UIView implements NSCoding {

	static alloc(): UIActivityIndicatorView; // inherited from NSObject

	static appearance(): UIActivityIndicatorView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UIActivityIndicatorView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIActivityIndicatorView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIActivityIndicatorView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIActivityIndicatorView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIActivityIndicatorView; // inherited from UIAppearance

	static new(): UIActivityIndicatorView; // inherited from NSObject

	activityIndicatorViewStyle: UIActivityIndicatorViewStyle;

	readonly animating: boolean;

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

	activityViewControllerDataTypeIdentifierForActivityType(activityViewController: UIActivityViewController, activityType: string): string;

	activityViewControllerItemForActivityType(activityViewController: UIActivityViewController, activityType: string): any;

	activityViewControllerLinkMetadata(activityViewController: UIActivityViewController): LPLinkMetadata;

	activityViewControllerPlaceholderItem(activityViewController: UIActivityViewController): any;

	activityViewControllerSubjectForActivityType(activityViewController: UIActivityViewController, activityType: string): string;

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

interface UIActivityItemSource extends NSObjectProtocol {

	activityViewControllerDataTypeIdentifierForActivityType?(activityViewController: UIActivityViewController, activityType: string): string;

	activityViewControllerItemForActivityType(activityViewController: UIActivityViewController, activityType: string): any;

	activityViewControllerLinkMetadata?(activityViewController: UIActivityViewController): LPLinkMetadata;

	activityViewControllerPlaceholderItem(activityViewController: UIActivityViewController): any;

	activityViewControllerSubjectForActivityType?(activityViewController: UIActivityViewController, activityType: string): string;

	activityViewControllerThumbnailImageForActivityTypeSuggestedSize?(activityViewController: UIActivityViewController, activityType: string, size: CGSize): UIImage;
}
declare var UIActivityItemSource: {

	prototype: UIActivityItemSource;
};

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

declare var UIActivityItemsConfigurationInteractionShare: string;

declare var UIActivityItemsConfigurationMetadataKeyLinkPresentationMetadata: string;

declare var UIActivityItemsConfigurationMetadataKeyMessageBody: string;

declare var UIActivityItemsConfigurationMetadataKeyTitle: string;

declare var UIActivityItemsConfigurationPreviewIntentFullSize: string;

declare var UIActivityItemsConfigurationPreviewIntentThumbnail: string;

interface UIActivityItemsConfigurationProviding extends NSObjectProtocol {

	activityItemsConfiguration: UIActivityItemsConfigurationReading;
}
declare var UIActivityItemsConfigurationProviding: {

	prototype: UIActivityItemsConfigurationProviding;
};

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

declare var UIActivityTypeAddToReadingList: string;

declare var UIActivityTypeAirDrop: string;

declare var UIActivityTypeAssignToContact: string;

declare var UIActivityTypeCollaborationCopyLink: string;

declare var UIActivityTypeCollaborationInviteWithLink: string;

declare var UIActivityTypeCopyToPasteboard: string;

declare var UIActivityTypeMail: string;

declare var UIActivityTypeMarkupAsPDF: string;

declare var UIActivityTypeMessage: string;

declare var UIActivityTypeOpenInIBooks: string;

declare var UIActivityTypePostToFacebook: string;

declare var UIActivityTypePostToFlickr: string;

declare var UIActivityTypePostToTencentWeibo: string;

declare var UIActivityTypePostToTwitter: string;

declare var UIActivityTypePostToVimeo: string;

declare var UIActivityTypePostToWeibo: string;

declare var UIActivityTypePrint: string;

declare var UIActivityTypeSaveToCameraRoll: string;

declare var UIActivityTypeSharePlay: string;

declare class UIActivityViewController extends UIViewController {

	static alloc(): UIActivityViewController; // inherited from NSObject

	static new(): UIActivityViewController; // inherited from NSObject

	allowsProminentActivity: boolean;

	completionHandler: (p1: string, p2: boolean) => void;

	completionWithItemsHandler: (p1: string, p2: boolean, p3: NSArray<any>, p4: NSError) => void;

	excludedActivityTypes: NSArray<string>;

	constructor(o: { activityItems: NSArray<any> | any[]; applicationActivities: NSArray<UIActivity> | UIActivity[]; });

	constructor(o: { activityItemsConfiguration: UIActivityItemsConfigurationReading; });

	initWithActivityItemsApplicationActivities(activityItems: NSArray<any> | any[], applicationActivities: NSArray<UIActivity> | UIActivity[]): this;

	initWithActivityItemsConfiguration(activityItemsConfiguration: UIActivityItemsConfigurationReading): this;
}

interface UIAdaptivePresentationControllerDelegate extends NSObjectProtocol {

	adaptivePresentationStyleForPresentationController?(controller: UIPresentationController): UIModalPresentationStyle;

	adaptivePresentationStyleForPresentationControllerTraitCollection?(controller: UIPresentationController, traitCollection: UITraitCollection): UIModalPresentationStyle;

	presentationControllerDidAttemptToDismiss?(presentationController: UIPresentationController): void;

	presentationControllerDidDismiss?(presentationController: UIPresentationController): void;

	presentationControllerPrepareAdaptivePresentationController?(presentationController: UIPresentationController, adaptivePresentationController: UIPresentationController): void;

	presentationControllerShouldDismiss?(presentationController: UIPresentationController): boolean;

	presentationControllerViewControllerForAdaptivePresentationStyle?(controller: UIPresentationController, style: UIModalPresentationStyle): UIViewController;

	presentationControllerWillDismiss?(presentationController: UIPresentationController): void;

	presentationControllerWillPresentWithAdaptiveStyleTransitionCoordinator?(presentationController: UIPresentationController, style: UIModalPresentationStyle, transitionCoordinator: UIViewControllerTransitionCoordinator): void;
}
declare var UIAdaptivePresentationControllerDelegate: {

	prototype: UIAdaptivePresentationControllerDelegate;
};

declare class UIAlertAction extends NSObject implements NSCopying, UIAccessibilityIdentification {

	static actionWithTitleStyleHandler(title: string, style: UIAlertActionStyle, handler: (p1: UIAlertAction) => void): UIAlertAction;

	static alloc(): UIAlertAction; // inherited from NSObject

	static new(): UIAlertAction; // inherited from NSObject

	enabled: boolean;

	readonly style: UIAlertActionStyle;

	readonly title: string;

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

declare const enum UIAlertActionStyle {

	Default = 0,

	Cancel = 1,

	Destructive = 2
}

declare class UIAlertController extends UIViewController implements UISpringLoadedInteractionSupporting {

	static alertControllerWithTitleMessagePreferredStyle(title: string, message: string, preferredStyle: UIAlertControllerStyle): UIAlertController;

	static alloc(): UIAlertController; // inherited from NSObject

	static new(): UIAlertController; // inherited from NSObject

	readonly actions: NSArray<UIAlertAction>;

	message: string;

	preferredAction: UIAlertAction;

	readonly preferredStyle: UIAlertControllerStyle;

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

declare const enum UIAlertControllerSeverity {

	Default = 0,

	Critical = 1
}

declare const enum UIAlertControllerStyle {

	ActionSheet = 0,

	Alert = 1
}

declare class UIAlertView extends UIView {

	static alloc(): UIAlertView; // inherited from NSObject

	static appearance(): UIAlertView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UIAlertView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIAlertView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIAlertView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIAlertView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIAlertView; // inherited from UIAppearance

	static new(): UIAlertView; // inherited from NSObject

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

	textFieldAtIndex(textFieldIndex: number): UITextField;
}

interface UIAlertViewDelegate extends NSObjectProtocol {

	alertViewCancel?(alertView: UIAlertView): void;

	alertViewClickedButtonAtIndex?(alertView: UIAlertView, buttonIndex: number): void;

	alertViewDidDismissWithButtonIndex?(alertView: UIAlertView, buttonIndex: number): void;

	alertViewShouldEnableFirstOtherButton?(alertView: UIAlertView): boolean;

	alertViewWillDismissWithButtonIndex?(alertView: UIAlertView, buttonIndex: number): void;

	didPresentAlertView?(alertView: UIAlertView): void;

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

	appearanceForTraitCollection(trait: UITraitCollection): UIAppearance;

	appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIAppearance;

	appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIAppearance;

	appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIAppearance;

	appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIAppearance;
};

interface UIAppearanceContainer extends NSObjectProtocol {
}
declare var UIAppearanceContainer: {

	prototype: UIAppearanceContainer;
};

declare class UIApplication extends UIResponder {

	static alloc(): UIApplication; // inherited from NSObject

	static new(): UIApplication; // inherited from NSObject

	static registerObjectForStateRestorationRestorationIdentifier(object: UIStateRestoring, restorationIdentifier: string): void;

	readonly alternateIconName: string;

	applicationIconBadgeNumber: number;

	readonly applicationState: UIApplicationState;

	applicationSupportsShakeToEdit: boolean;

	readonly backgroundRefreshStatus: UIBackgroundRefreshStatus;

	readonly backgroundTimeRemaining: number;

	readonly connectedScenes: NSSet<UIScene>;

	readonly currentUserNotificationSettings: UIUserNotificationSettings;

	delegate: UIApplicationDelegate;

	idleTimerDisabled: boolean;

	readonly ignoringInteractionEvents: boolean;

	readonly keyWindow: UIWindow;

	networkActivityIndicatorVisible: boolean;

	readonly openSessions: NSSet<UISceneSession>;

	readonly preferredContentSizeCategory: string;

	readonly protectedDataAvailable: boolean;

	proximitySensingEnabled: boolean;

	readonly registeredForRemoteNotifications: boolean;

	scheduledLocalNotifications: NSArray<UILocalNotification>;

	shortcutItems: NSArray<UIApplicationShortcutItem>;

	readonly statusBarFrame: CGRect;

	readonly statusBarHidden: boolean;

	readonly statusBarOrientation: UIInterfaceOrientation;

	readonly statusBarOrientationAnimationDuration: number;

	readonly statusBarStyle: UIStatusBarStyle;

	readonly supportsAlternateIcons: boolean;

	readonly supportsMultipleScenes: boolean;

	readonly userInterfaceLayoutDirection: UIUserInterfaceLayoutDirection;

	readonly windows: NSArray<UIWindow>;

	static readonly sharedApplication: UIApplication;

	beginBackgroundTaskWithExpirationHandler(handler: () => void): number;

	beginBackgroundTaskWithNameExpirationHandler(taskName: string, handler: () => void): number;

	beginIgnoringInteractionEvents(): void;

	beginReceivingRemoteControlEvents(): void;

	canOpenURL(url: NSURL): boolean;

	cancelAllLocalNotifications(): void;

	cancelLocalNotification(notification: UILocalNotification): void;

	clearKeepAliveTimeout(): void;

	completeStateRestoration(): void;

	enabledRemoteNotificationTypes(): UIRemoteNotificationType;

	endBackgroundTask(identifier: number): void;

	endIgnoringInteractionEvents(): void;

	endReceivingRemoteControlEvents(): void;

	extendStateRestoration(): void;

	ignoreSnapshotOnNextApplicationLaunch(): void;

	openURL(url: NSURL): boolean;

	openURLOptionsCompletionHandler(url: NSURL, options: NSDictionary<string, any>, completion: (p1: boolean) => void): void;

	presentLocalNotificationNow(notification: UILocalNotification): void;

	registerForRemoteNotificationTypes(types: UIRemoteNotificationType): void;

	registerForRemoteNotifications(): void;

	registerUserNotificationSettings(notificationSettings: UIUserNotificationSettings): void;

	requestSceneSessionActivationUserActivityOptionsErrorHandler(sceneSession: UISceneSession, userActivity: NSUserActivity, options: UISceneActivationRequestOptions, errorHandler: (p1: NSError) => void): void;

	requestSceneSessionDestructionOptionsErrorHandler(sceneSession: UISceneSession, options: UISceneDestructionRequestOptions, errorHandler: (p1: NSError) => void): void;

	requestSceneSessionRefresh(sceneSession: UISceneSession): void;

	scheduleLocalNotification(notification: UILocalNotification): void;

	sendActionToFromForEvent(action: string, target: any, sender: any, event: _UIEvent): boolean;

	sendEvent(event: _UIEvent): void;

	setAlternateIconNameCompletionHandler(alternateIconName: string, completionHandler: (p1: NSError) => void): void;

	setKeepAliveTimeoutHandler(timeout: number, keepAliveHandler: () => void): boolean;

	setMinimumBackgroundFetchInterval(minimumBackgroundFetchInterval: number): void;

	setNewsstandIconImage(image: UIImage): void;

	setStatusBarHiddenAnimated(hidden: boolean, animated: boolean): void;

	setStatusBarHiddenWithAnimation(hidden: boolean, animation: UIStatusBarAnimation): void;

	setStatusBarOrientationAnimated(interfaceOrientation: UIInterfaceOrientation, animated: boolean): void;

	setStatusBarStyleAnimated(statusBarStyle: UIStatusBarStyle, animated: boolean): void;

	supportedInterfaceOrientationsForWindow(window: UIWindow): UIInterfaceOrientationMask;

	unregisterForRemoteNotifications(): void;
}

declare var UIApplicationBackgroundFetchIntervalMinimum: number;

declare var UIApplicationBackgroundFetchIntervalNever: number;

declare var UIApplicationBackgroundRefreshStatusDidChangeNotification: string;

interface UIApplicationDelegate extends NSObjectProtocol {

	window?: UIWindow;

	applicationConfigurationForConnectingSceneSessionOptions?(application: UIApplication, connectingSceneSession: UISceneSession, options: UISceneConnectionOptions): UISceneConfiguration;

	applicationContinueUserActivityRestorationHandler?(application: UIApplication, userActivity: NSUserActivity, restorationHandler: (p1: NSArray<UIUserActivityRestoring>) => void): boolean;

	applicationDidBecomeActive?(application: UIApplication): void;

	applicationDidChangeStatusBarFrame?(application: UIApplication, oldStatusBarFrame: CGRect): void;

	applicationDidChangeStatusBarOrientation?(application: UIApplication, oldStatusBarOrientation: UIInterfaceOrientation): void;

	applicationDidDecodeRestorableStateWithCoder?(application: UIApplication, coder: NSCoder): void;

	applicationDidDiscardSceneSessions?(application: UIApplication, sceneSessions: NSSet<UISceneSession>): void;

	applicationDidEnterBackground?(application: UIApplication): void;

	applicationDidFailToContinueUserActivityWithTypeError?(application: UIApplication, userActivityType: string, error: NSError): void;

	applicationDidFailToRegisterForRemoteNotificationsWithError?(application: UIApplication, error: NSError): void;

	applicationDidFinishLaunching?(application: UIApplication): void;

	applicationDidFinishLaunchingWithOptions?(application: UIApplication, launchOptions: NSDictionary<string, any>): boolean;

	applicationDidReceiveLocalNotification?(application: UIApplication, notification: UILocalNotification): void;

	applicationDidReceiveMemoryWarning?(application: UIApplication): void;

	applicationDidReceiveRemoteNotification?(application: UIApplication, userInfo: NSDictionary<any, any>): void;

	applicationDidReceiveRemoteNotificationFetchCompletionHandler?(application: UIApplication, userInfo: NSDictionary<any, any>, completionHandler: (p1: UIBackgroundFetchResult) => void): void;

	applicationDidRegisterForRemoteNotificationsWithDeviceToken?(application: UIApplication, deviceToken: NSData): void;

	applicationDidRegisterUserNotificationSettings?(application: UIApplication, notificationSettings: UIUserNotificationSettings): void;

	applicationDidUpdateUserActivity?(application: UIApplication, userActivity: NSUserActivity): void;

	applicationHandleActionWithIdentifierForLocalNotificationCompletionHandler?(application: UIApplication, identifier: string, notification: UILocalNotification, completionHandler: () => void): void;

	applicationHandleActionWithIdentifierForLocalNotificationWithResponseInfoCompletionHandler?(application: UIApplication, identifier: string, notification: UILocalNotification, responseInfo: NSDictionary<any, any>, completionHandler: () => void): void;

	applicationHandleActionWithIdentifierForRemoteNotificationCompletionHandler?(application: UIApplication, identifier: string, userInfo: NSDictionary<any, any>, completionHandler: () => void): void;

	applicationHandleActionWithIdentifierForRemoteNotificationWithResponseInfoCompletionHandler?(application: UIApplication, identifier: string, userInfo: NSDictionary<any, any>, responseInfo: NSDictionary<any, any>, completionHandler: () => void): void;

	applicationHandleEventsForBackgroundURLSessionCompletionHandler?(application: UIApplication, identifier: string, completionHandler: () => void): void;

	applicationHandleIntentCompletionHandler?(application: UIApplication, intent: INIntent, completionHandler: (p1: INIntentResponse) => void): void;

	applicationHandleOpenURL?(application: UIApplication, url: NSURL): boolean;

	applicationHandleWatchKitExtensionRequestReply?(application: UIApplication, userInfo: NSDictionary<any, any>, reply: (p1: NSDictionary<any, any>) => void): void;

	applicationHandlerForIntent?(application: UIApplication, intent: INIntent): any;

	applicationOpenURLOptions?(app: UIApplication, url: NSURL, options: NSDictionary<string, any>): boolean;

	applicationOpenURLSourceApplicationAnnotation?(application: UIApplication, url: NSURL, sourceApplication: string, annotation: any): boolean;

	applicationPerformActionForShortcutItemCompletionHandler?(application: UIApplication, shortcutItem: UIApplicationShortcutItem, completionHandler: (p1: boolean) => void): void;

	applicationPerformFetchWithCompletionHandler?(application: UIApplication, completionHandler: (p1: UIBackgroundFetchResult) => void): void;

	applicationProtectedDataDidBecomeAvailable?(application: UIApplication): void;

	applicationProtectedDataWillBecomeUnavailable?(application: UIApplication): void;

	applicationShouldAllowExtensionPointIdentifier?(application: UIApplication, extensionPointIdentifier: string): boolean;

	applicationShouldAutomaticallyLocalizeKeyCommands?(application: UIApplication): boolean;

	applicationShouldRequestHealthAuthorization?(application: UIApplication): void;

	applicationShouldRestoreApplicationState?(application: UIApplication, coder: NSCoder): boolean;

	applicationShouldRestoreSecureApplicationState?(application: UIApplication, coder: NSCoder): boolean;

	applicationShouldSaveApplicationState?(application: UIApplication, coder: NSCoder): boolean;

	applicationShouldSaveSecureApplicationState?(application: UIApplication, coder: NSCoder): boolean;

	applicationSignificantTimeChange?(application: UIApplication): void;

	applicationSupportedInterfaceOrientationsForWindow?(application: UIApplication, window: UIWindow): UIInterfaceOrientationMask;

	applicationUserDidAcceptCloudKitShareWithMetadata?(application: UIApplication, cloudKitShareMetadata: CKShareMetadata): void;

	applicationViewControllerWithRestorationIdentifierPathCoder?(application: UIApplication, identifierComponents: NSArray<string> | string[], coder: NSCoder): UIViewController;

	applicationWillChangeStatusBarFrame?(application: UIApplication, newStatusBarFrame: CGRect): void;

	applicationWillChangeStatusBarOrientationDuration?(application: UIApplication, newStatusBarOrientation: UIInterfaceOrientation, duration: number): void;

	applicationWillContinueUserActivityWithType?(application: UIApplication, userActivityType: string): boolean;

	applicationWillEncodeRestorableStateWithCoder?(application: UIApplication, coder: NSCoder): void;

	applicationWillEnterForeground?(application: UIApplication): void;

	applicationWillFinishLaunchingWithOptions?(application: UIApplication, launchOptions: NSDictionary<string, any>): boolean;

	applicationWillResignActive?(application: UIApplication): void;

	applicationWillTerminate?(application: UIApplication): void;
}
declare var UIApplicationDelegate: {

	prototype: UIApplicationDelegate;
};

declare var UIApplicationDidBecomeActiveNotification: string;

declare var UIApplicationDidChangeStatusBarFrameNotification: string;

declare var UIApplicationDidChangeStatusBarOrientationNotification: string;

declare var UIApplicationDidEnterBackgroundNotification: string;

declare var UIApplicationDidFinishLaunchingNotification: string;

declare var UIApplicationDidReceiveMemoryWarningNotification: string;

declare var UIApplicationInvalidInterfaceOrientationException: string;

declare var UIApplicationKeyboardExtensionPointIdentifier: string;

declare var UIApplicationLaunchOptionsAnnotationKey: string;

declare var UIApplicationLaunchOptionsBluetoothCentralsKey: string;

declare var UIApplicationLaunchOptionsBluetoothPeripheralsKey: string;

declare var UIApplicationLaunchOptionsCloudKitShareMetadataKey: string;

declare var UIApplicationLaunchOptionsEventAttributionKey: string;

declare var UIApplicationLaunchOptionsLocalNotificationKey: string;

declare var UIApplicationLaunchOptionsLocationKey: string;

declare var UIApplicationLaunchOptionsNewsstandDownloadsKey: string;

declare var UIApplicationLaunchOptionsRemoteNotificationKey: string;

declare var UIApplicationLaunchOptionsShortcutItemKey: string;

declare var UIApplicationLaunchOptionsSourceApplicationKey: string;

declare var UIApplicationLaunchOptionsURLKey: string;

declare var UIApplicationLaunchOptionsUserActivityDictionaryKey: string;

declare var UIApplicationLaunchOptionsUserActivityTypeKey: string;

declare function UIApplicationMain(argc: number, argv: interop.Reference<string>, principalClassName: string, delegateClassName: string): never;

declare var UIApplicationOpenExternalURLOptionsEventAttributionKey: string;

declare var UIApplicationOpenNotificationSettingsURLString: string;

declare var UIApplicationOpenSettingsURLString: string;

declare var UIApplicationOpenURLOptionUniversalLinksOnly: string;

declare var UIApplicationOpenURLOptionsAnnotationKey: string;

declare var UIApplicationOpenURLOptionsEventAttributionKey: string;

declare var UIApplicationOpenURLOptionsOpenInPlaceKey: string;

declare var UIApplicationOpenURLOptionsSourceApplicationKey: string;

declare var UIApplicationProtectedDataDidBecomeAvailable: string;

declare var UIApplicationProtectedDataWillBecomeUnavailable: string;

declare class UIApplicationShortcutIcon extends NSObject implements NSCopying {

	static alloc(): UIApplicationShortcutIcon; // inherited from NSObject

	static iconWithContact(contact: CNContact): UIApplicationShortcutIcon;

	static iconWithSystemImageName(systemImageName: string): UIApplicationShortcutIcon;

	static iconWithTemplateImageName(templateImageName: string): UIApplicationShortcutIcon;

	static iconWithType(type: UIApplicationShortcutIconType): UIApplicationShortcutIcon;

	static new(): UIApplicationShortcutIcon; // inherited from NSObject

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

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

declare const enum UIApplicationState {

	Active = 0,

	Inactive = 1,

	Background = 2
}

declare var UIApplicationStateRestorationBundleVersionKey: string;

declare var UIApplicationStateRestorationSystemVersionKey: string;

declare var UIApplicationStateRestorationTimestampKey: string;

declare var UIApplicationStateRestorationUserInterfaceIdiomKey: string;

declare var UIApplicationStatusBarFrameUserInfoKey: string;

declare var UIApplicationStatusBarOrientationUserInfoKey: string;

declare var UIApplicationUserDidTakeScreenshotNotification: string;

declare var UIApplicationWillChangeStatusBarFrameNotification: string;

declare var UIApplicationWillChangeStatusBarOrientationNotification: string;

declare var UIApplicationWillEnterForegroundNotification: string;

declare var UIApplicationWillResignActiveNotification: string;

declare var UIApplicationWillTerminateNotification: string;

declare class UIAttachmentBehavior extends UIDynamicBehavior {

	static alloc(): UIAttachmentBehavior; // inherited from NSObject

	static fixedAttachmentWithItemAttachedToItemAttachmentAnchor(item1: UIDynamicItem, item2: UIDynamicItem, point: CGPoint): UIAttachmentBehavior;

	static limitAttachmentWithItemOffsetFromCenterAttachedToItemOffsetFromCenter(item1: UIDynamicItem, offset1: UIOffset, item2: UIDynamicItem, offset2: UIOffset): UIAttachmentBehavior;

	static new(): UIAttachmentBehavior; // inherited from NSObject

	static pinAttachmentWithItemAttachedToItemAttachmentAnchor(item1: UIDynamicItem, item2: UIDynamicItem, point: CGPoint): UIAttachmentBehavior;

	static slidingAttachmentWithItemAttachedToItemAttachmentAnchorAxisOfTranslation(item1: UIDynamicItem, item2: UIDynamicItem, point: CGPoint, axis: CGVector): UIAttachmentBehavior;

	static slidingAttachmentWithItemAttachmentAnchorAxisOfTranslation(item: UIDynamicItem, point: CGPoint, axis: CGVector): UIAttachmentBehavior;

	anchorPoint: CGPoint;

	readonly attachedBehaviorType: UIAttachmentBehaviorType;

	attachmentRange: UIFloatRange;

	damping: number;

	frequency: number;

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

declare const enum UIAttachmentBehaviorType {

	Items = 0,

	Anchor = 1
}

declare const enum UIAxis {

	Neither = 0,

	Horizontal = 1,

	Vertical = 2,

	Both = 3
}

declare class UIBackgroundConfiguration extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UIBackgroundConfiguration; // inherited from NSObject

	static clearConfiguration(): UIBackgroundConfiguration;

	static listAccompaniedSidebarCellConfiguration(): UIBackgroundConfiguration;

	static listGroupedCellConfiguration(): UIBackgroundConfiguration;

	static listGroupedHeaderFooterConfiguration(): UIBackgroundConfiguration;

	static listPlainCellConfiguration(): UIBackgroundConfiguration;

	static listPlainHeaderFooterConfiguration(): UIBackgroundConfiguration;

	static listSidebarCellConfiguration(): UIBackgroundConfiguration;

	static listSidebarHeaderConfiguration(): UIBackgroundConfiguration;

	static new(): UIBackgroundConfiguration; // inherited from NSObject

	backgroundColor: UIColor;

	backgroundColorTransformer: (p1: UIColor) => UIColor;

	backgroundInsets: NSDirectionalEdgeInsets;

	cornerRadius: number;

	customView: UIView;

	edgesAddingLayoutMarginsToBackgroundInsets: NSDirectionalRectEdge;

	image: UIImage;

	imageContentMode: UIViewContentMode;

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

declare const enum UIBackgroundFetchResult {

	NewData = 0,

	NoData = 1,

	Failed = 2
}

declare const enum UIBackgroundRefreshStatus {

	Restricted = 0,

	Denied = 1,

	Available = 2
}

declare var UIBackgroundTaskInvalid: number;

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

declare const enum UIBandSelectionInteractionState {

	Possible = 0,

	Began = 1,

	Selecting = 2,

	Ended = 3
}

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

declare class UIBarButtonItem extends UIBarItem implements NSCoding, UIPopoverPresentationControllerSourceItem, UISpringLoadedInteractionSupporting {

	static alloc(): UIBarButtonItem; // inherited from NSObject

	static appearance(): UIBarButtonItem; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UIBarButtonItem; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIBarButtonItem; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIBarButtonItem; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIBarButtonItem; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIBarButtonItem; // inherited from UIAppearance

	static fixedSpaceItemOfWidth(width: number): UIBarButtonItem;

	static flexibleSpaceItem(): UIBarButtonItem;

	static new(): UIBarButtonItem; // inherited from NSObject

	action: string;

	readonly buttonGroup: UIBarButtonItemGroup;

	changesSelectionAsPrimaryAction: boolean;

	customView: UIView;

	hidden: boolean;

	menu: UIMenu;

	menuRepresentation: UIMenuElement;

	possibleTitles: NSSet<string>;

	preferredMenuElementOrder: UIContextMenuConfigurationElementOrder;

	primaryAction: UIAction;

	selected: boolean;

	style: UIBarButtonItemStyle;

	target: any;

	tintColor: UIColor;

	width: number;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	springLoaded: boolean; // inherited from UISpringLoadedInteractionSupporting

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { barButtonSystemItem: UIBarButtonSystemItem; menu: UIMenu; });

	constructor(o: { barButtonSystemItem: UIBarButtonSystemItem; primaryAction: UIAction; });

	constructor(o: { barButtonSystemItem: UIBarButtonSystemItem; target: any; action: string; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { customView: UIView; });

	constructor(o: { image: UIImage; landscapeImagePhone: UIImage; style: UIBarButtonItemStyle; target: any; action: string; });

	constructor(o: { image: UIImage; menu: UIMenu; });

	constructor(o: { image: UIImage; style: UIBarButtonItemStyle; target: any; action: string; });

	constructor(o: { primaryAction: UIAction; });

	constructor(o: { title: string; menu: UIMenu; });

	constructor(o: { title: string; style: UIBarButtonItemStyle; target: any; action: string; });

	backButtonBackgroundImageForStateBarMetrics(state: UIControlState, barMetrics: UIBarMetrics): UIImage;

	backButtonBackgroundVerticalPositionAdjustmentForBarMetrics(barMetrics: UIBarMetrics): number;

	backButtonTitlePositionAdjustmentForBarMetrics(barMetrics: UIBarMetrics): UIOffset;

	backgroundImageForStateBarMetrics(state: UIControlState, barMetrics: UIBarMetrics): UIImage;

	backgroundImageForStateStyleBarMetrics(state: UIControlState, style: UIBarButtonItemStyle, barMetrics: UIBarMetrics): UIImage;

	backgroundVerticalPositionAdjustmentForBarMetrics(barMetrics: UIBarMetrics): number;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	creatingFixedGroup(): UIBarButtonItemGroup;

	creatingMovableGroupWithCustomizationIdentifier(customizationIdentifier: string): UIBarButtonItemGroup;

	creatingOptionalGroupWithCustomizationIdentifierInDefaultCustomization(customizationIdentifier: string, inDefaultCustomization: boolean): UIBarButtonItemGroup;

	encodeWithCoder(coder: NSCoder): void;

	initWithBarButtonSystemItemMenu(systemItem: UIBarButtonSystemItem, menu: UIMenu): this;

	initWithBarButtonSystemItemPrimaryAction(systemItem: UIBarButtonSystemItem, primaryAction: UIAction): this;

	initWithBarButtonSystemItemTargetAction(systemItem: UIBarButtonSystemItem, target: any, action: string): this;

	initWithCoder(coder: NSCoder): this;

	initWithCustomView(customView: UIView): this;

	initWithImageLandscapeImagePhoneStyleTargetAction(image: UIImage, landscapeImagePhone: UIImage, style: UIBarButtonItemStyle, target: any, action: string): this;

	initWithImageMenu(image: UIImage, menu: UIMenu): this;

	initWithImageStyleTargetAction(image: UIImage, style: UIBarButtonItemStyle, target: any, action: string): this;

	initWithPrimaryAction(primaryAction: UIAction): this;

	initWithTitleMenu(title: string, menu: UIMenu): this;

	initWithTitleStyleTargetAction(title: string, style: UIBarButtonItemStyle, target: any, action: string): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	setBackButtonBackgroundImageForStateBarMetrics(backgroundImage: UIImage, state: UIControlState, barMetrics: UIBarMetrics): void;

	setBackButtonBackgroundVerticalPositionAdjustmentForBarMetrics(adjustment: number, barMetrics: UIBarMetrics): void;

	setBackButtonTitlePositionAdjustmentForBarMetrics(adjustment: UIOffset, barMetrics: UIBarMetrics): void;

	setBackgroundImageForStateBarMetrics(backgroundImage: UIImage, state: UIControlState, barMetrics: UIBarMetrics): void;

	setBackgroundImageForStateStyleBarMetrics(backgroundImage: UIImage, state: UIControlState, style: UIBarButtonItemStyle, barMetrics: UIBarMetrics): void;

	setBackgroundVerticalPositionAdjustmentForBarMetrics(adjustment: number, barMetrics: UIBarMetrics): void;

	setTitlePositionAdjustmentForBarMetrics(adjustment: UIOffset, barMetrics: UIBarMetrics): void;

	titlePositionAdjustmentForBarMetrics(barMetrics: UIBarMetrics): UIOffset;
}

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

declare class UIBarButtonItemGroup extends NSObject implements NSCoding {

	static alloc(): UIBarButtonItemGroup; // inherited from NSObject

	static fixedGroupWithRepresentativeItemItems(representativeItem: UIBarButtonItem, items: NSArray<UIBarButtonItem> | UIBarButtonItem[]): UIBarButtonItemGroup;

	static movableGroupWithCustomizationIdentifierRepresentativeItemItems(customizationIdentifier: string, representativeItem: UIBarButtonItem, items: NSArray<UIBarButtonItem> | UIBarButtonItem[]): UIBarButtonItemGroup;

	static new(): UIBarButtonItemGroup; // inherited from NSObject

	static optionalGroupWithCustomizationIdentifierInDefaultCustomizationRepresentativeItemItems(customizationIdentifier: string, inDefaultCustomization: boolean, representativeItem: UIBarButtonItem, items: NSArray<UIBarButtonItem> | UIBarButtonItem[]): UIBarButtonItemGroup;

	barButtonItems: NSArray<UIBarButtonItem>;

	readonly displayingRepresentativeItem: boolean;

	hidden: boolean;

	menuRepresentation: UIMenuElement;

	representativeItem: UIBarButtonItem;

	constructor(o: { barButtonItems: NSArray<UIBarButtonItem> | UIBarButtonItem[]; representativeItem: UIBarButtonItem; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithBarButtonItemsRepresentativeItem(barButtonItems: NSArray<UIBarButtonItem> | UIBarButtonItem[], representativeItem: UIBarButtonItem): this;

	initWithCoder(coder: NSCoder): this;
}

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

declare class UIBarItem extends NSObject implements NSCoding, UIAccessibilityIdentification, UIAppearance {

	static alloc(): UIBarItem; // inherited from NSObject

	static appearance(): UIBarItem;

	static appearanceForTraitCollection(trait: UITraitCollection): UIBarItem;

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIBarItem;

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIBarItem;

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIBarItem;

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIBarItem;

	static new(): UIBarItem; // inherited from NSObject

	enabled: boolean;

	image: UIImage;

	imageInsets: UIEdgeInsets;

	landscapeImagePhone: UIImage;

	landscapeImagePhoneInsets: UIEdgeInsets;

	largeContentSizeImage: UIImage;

	largeContentSizeImageInsets: UIEdgeInsets;

	tag: number;

	title: string;

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

	setTitleTextAttributesForState(attributes: NSDictionary<string, any>, state: UIControlState): void;

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

	addArcWithCenterRadiusStartAngleEndAngleClockwise(center: CGPoint, radius: number, startAngle: number, endAngle: number, clockwise: boolean): void;

	addClip(): void;

	addCurveToPointControlPoint1ControlPoint2(endPoint: CGPoint, controlPoint1: CGPoint, controlPoint2: CGPoint): void;

	addLineToPoint(point: CGPoint): void;

	addQuadCurveToPointControlPoint(endPoint: CGPoint, controlPoint: CGPoint): void;

	appendPath(bezierPath: UIBezierPath): void;

	applyTransform(transform: CGAffineTransform): void;

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

declare class UIBlurEffect extends UIVisualEffect {

	static alloc(): UIBlurEffect; // inherited from NSObject

	static effectWithStyle(style: UIBlurEffectStyle): UIBlurEffect;

	static new(): UIBlurEffect; // inherited from NSObject
}

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

declare class UIButton extends UIControl implements NSCoding, UIAccessibilityContentSizeCategoryImageAdjusting, UISpringLoadedInteractionSupporting {

	static alloc(): UIButton; // inherited from NSObject

	static appearance(): UIButton; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UIButton; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIButton; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIButton; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIButton; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIButton; // inherited from UIAppearance

	static buttonWithConfigurationPrimaryAction(configuration: UIButtonConfiguration, primaryAction: UIAction): UIButton;

	static buttonWithType(buttonType: UIButtonType): UIButton;

	static buttonWithTypePrimaryAction(buttonType: UIButtonType, primaryAction: UIAction): UIButton;

	static new(): UIButton; // inherited from NSObject

	static systemButtonWithImageTargetAction(image: UIImage, target: any, action: string): UIButton;

	static systemButtonWithPrimaryAction(primaryAction: UIAction): UIButton;

	adjustsImageWhenDisabled: boolean;

	adjustsImageWhenHighlighted: boolean;

	automaticallyUpdatesConfiguration: boolean;

	readonly behavioralStyle: UIBehavioralStyle;

	readonly buttonType: UIButtonType;

	changesSelectionAsPrimaryAction: boolean;

	configuration: UIButtonConfiguration;

	configurationUpdateHandler: (p1: UIButton) => void;

	contentEdgeInsets: UIEdgeInsets;

	readonly currentAttributedTitle: NSAttributedString;

	readonly currentBackgroundImage: UIImage;

	readonly currentImage: UIImage;

	readonly currentPreferredSymbolConfiguration: UIImageSymbolConfiguration;

	readonly currentTitle: string;

	readonly currentTitleColor: UIColor;

	readonly currentTitleShadowColor: UIColor;

	font: UIFont;

	readonly held: boolean;

	readonly hovered: boolean;

	imageEdgeInsets: UIEdgeInsets;

	readonly imageView: UIImageView;

	lineBreakMode: NSLineBreakMode;

	menu: UIMenu;

	pointerInteractionEnabled: boolean;

	pointerStyleProvider: (p1: UIButton, p2: UIPointerEffect, p3: UIPointerShape) => UIPointerStyle;

	preferredBehavioralStyle: UIBehavioralStyle;

	preferredMenuElementOrder: UIContextMenuConfigurationElementOrder;

	reversesTitleShadowWhenHighlighted: boolean;

	role: UIButtonRole;

	showsTouchWhenHighlighted: boolean;

	readonly subtitleLabel: UILabel;

	titleEdgeInsets: UIEdgeInsets;

	readonly titleLabel: UILabel;

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

	attributedTitleForState(state: UIControlState): NSAttributedString;

	backgroundImageForState(state: UIControlState): UIImage;

	backgroundRectForBounds(bounds: CGRect): CGRect;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	contentRectForBounds(bounds: CGRect): CGRect;

	encodeWithCoder(coder: NSCoder): void;

	imageForState(state: UIControlState): UIImage;

	imageRectForContentRect(contentRect: CGRect): CGRect;

	initWithCoder(coder: NSCoder): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	preferredSymbolConfigurationForImageInState(state: UIControlState): UIImageSymbolConfiguration;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	setAttributedTitleForState(title: NSAttributedString, state: UIControlState): void;

	setBackgroundImageForState(image: UIImage, state: UIControlState): void;

	setImageForState(image: UIImage, state: UIControlState): void;

	setNeedsUpdateConfiguration(): void;

	setPreferredSymbolConfigurationForImageInState(configuration: UIImageSymbolConfiguration, state: UIControlState): void;

	setTitleColorForState(color: UIColor, state: UIControlState): void;

	setTitleForState(title: string, state: UIControlState): void;

	setTitleShadowColorForState(color: UIColor, state: UIControlState): void;

	titleColorForState(state: UIControlState): UIColor;

	titleForState(state: UIControlState): string;

	titleRectForContentRect(contentRect: CGRect): CGRect;

	titleShadowColorForState(state: UIControlState): UIColor;

	updateConfiguration(): void;
}

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

	indicator: UIButtonConfigurationIndicator;

	indicatorColorTransformer: (p1: UIColor) => UIColor;

	macIdiomStyle: UIButtonConfigurationMacIdiomStyle;

	preferredSymbolConfigurationForImage: UIImageSymbolConfiguration;

	showsActivityIndicator: boolean;

	subtitle: string;

	subtitleTextAttributesTransformer: (p1: NSDictionary<string, any>) => NSDictionary<string, any>;

	title: string;

	titleAlignment: UIButtonConfigurationTitleAlignment;

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

declare const enum UIButtonConfigurationCornerStyle {

	Fixed = -1,

	Dynamic = 0,

	Small = 1,

	Medium = 2,

	Large = 3,

	Capsule = 4
}

declare const enum UIButtonConfigurationIndicator {

	Automatic = 0,

	None = 1,

	Popup = 2
}

declare const enum UIButtonConfigurationMacIdiomStyle {

	Automatic = 0,

	Bordered = 1,

	Borderless = 2,

	BorderlessTinted = 3
}

declare const enum UIButtonConfigurationSize {

	Medium = 0,

	Small = 1,

	Mini = 2,

	Large = 3
}

declare const enum UIButtonConfigurationTitleAlignment {

	Automatic = 0,

	Leading = 1,

	Center = 2,

	Trailing = 3
}

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

declare class UICalendarSelection extends NSObject {

	static alloc(): UICalendarSelection; // inherited from NSObject

	static new(): UICalendarSelection; // inherited from NSObject

	updateSelectableDates(): void;
}

declare class UICalendarSelectionMultiDate extends UICalendarSelection {

	static alloc(): UICalendarSelectionMultiDate; // inherited from NSObject

	static new(): UICalendarSelectionMultiDate; // inherited from NSObject

	readonly delegate: UICalendarSelectionMultiDateDelegate;

	selectedDates: NSArray<NSDateComponents>;

	constructor(o: { delegate: UICalendarSelectionMultiDateDelegate; });

	initWithDelegate(delegate: UICalendarSelectionMultiDateDelegate): this;

	setSelectedDatesAnimated(selectedDates: NSArray<NSDateComponents> | NSDateComponents[], animated: boolean): void;
}

interface UICalendarSelectionMultiDateDelegate extends NSObjectProtocol {

	multiDateSelectionCanDeselectDate?(selection: UICalendarSelectionMultiDate, dateComponents: NSDateComponents): boolean;

	multiDateSelectionCanSelectDate?(selection: UICalendarSelectionMultiDate, dateComponents: NSDateComponents): boolean;

	multiDateSelectionDidDeselectDate(selection: UICalendarSelectionMultiDate, dateComponents: NSDateComponents): void;

	multiDateSelectionDidSelectDate(selection: UICalendarSelectionMultiDate, dateComponents: NSDateComponents): void;
}
declare var UICalendarSelectionMultiDateDelegate: {

	prototype: UICalendarSelectionMultiDateDelegate;
};

declare class UICalendarSelectionSingleDate extends UICalendarSelection {

	static alloc(): UICalendarSelectionSingleDate; // inherited from NSObject

	static new(): UICalendarSelectionSingleDate; // inherited from NSObject

	readonly delegate: UICalendarSelectionSingleDateDelegate;

	selectedDate: NSDateComponents;

	constructor(o: { delegate: UICalendarSelectionSingleDateDelegate; });

	initWithDelegate(delegate: UICalendarSelectionSingleDateDelegate): this;

	setSelectedDateAnimated(selectedDate: NSDateComponents, animated: boolean): void;
}

interface UICalendarSelectionSingleDateDelegate extends NSObjectProtocol {

	dateSelectionCanSelectDate?(selection: UICalendarSelectionSingleDate, dateComponents: NSDateComponents): boolean;

	dateSelectionDidSelectDate(selection: UICalendarSelectionSingleDate, dateComponents: NSDateComponents): void;
}
declare var UICalendarSelectionSingleDateDelegate: {

	prototype: UICalendarSelectionSingleDateDelegate;
};

declare class UICalendarView extends UIView {

	static alloc(): UICalendarView; // inherited from NSObject

	static appearance(): UICalendarView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UICalendarView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UICalendarView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UICalendarView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UICalendarView; // inherited from UIAppearance

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

declare const enum UICalendarViewDecorationSize {

	Small = 0,

	Medium = 1,

	Large = 2
}

interface UICalendarViewDelegate extends NSObjectProtocol {

	calendarViewDecorationForDateComponents(calendarView: UICalendarView, dateComponents: NSDateComponents): UICalendarViewDecoration;
}
declare var UICalendarViewDelegate: {

	prototype: UICalendarViewDelegate;
};

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

declare class UICellAccessoryCheckmark extends UICellAccessory {

	static alloc(): UICellAccessoryCheckmark; // inherited from NSObject

	static new(): UICellAccessoryCheckmark; // inherited from NSObject
}

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

declare class UICellAccessoryDelete extends UICellAccessory {

	static alloc(): UICellAccessoryDelete; // inherited from NSObject

	static new(): UICellAccessoryDelete; // inherited from NSObject

	actionHandler: () => void;

	backgroundColor: UIColor;
}

declare class UICellAccessoryDetail extends UICellAccessory {

	static alloc(): UICellAccessoryDetail; // inherited from NSObject

	static new(): UICellAccessoryDetail; // inherited from NSObject

	actionHandler: () => void;
}

declare class UICellAccessoryDisclosureIndicator extends UICellAccessory {

	static alloc(): UICellAccessoryDisclosureIndicator; // inherited from NSObject

	static new(): UICellAccessoryDisclosureIndicator; // inherited from NSObject
}

declare const enum UICellAccessoryDisplayedState {

	Always = 0,

	WhenEditing = 1,

	WhenNotEditing = 2
}

declare class UICellAccessoryInsert extends UICellAccessory {

	static alloc(): UICellAccessoryInsert; // inherited from NSObject

	static new(): UICellAccessoryInsert; // inherited from NSObject

	actionHandler: () => void;

	backgroundColor: UIColor;
}

declare class UICellAccessoryLabel extends UICellAccessory {

	static alloc(): UICellAccessoryLabel; // inherited from NSObject

	static new(): UICellAccessoryLabel; // inherited from NSObject

	adjustsFontForContentSizeCategory: boolean;

	font: UIFont;

	readonly text: string;

	constructor(o: { text: string; });

	initWithText(text: string): this;
}

declare class UICellAccessoryMultiselect extends UICellAccessory {

	static alloc(): UICellAccessoryMultiselect; // inherited from NSObject

	static new(): UICellAccessoryMultiselect; // inherited from NSObject

	backgroundColor: UIColor;
}

declare class UICellAccessoryOutlineDisclosure extends UICellAccessory {

	static alloc(): UICellAccessoryOutlineDisclosure; // inherited from NSObject

	static new(): UICellAccessoryOutlineDisclosure; // inherited from NSObject

	actionHandler: () => void;

	style: UICellAccessoryOutlineDisclosureStyle;
}

declare const enum UICellAccessoryOutlineDisclosureStyle {

	Automatic = 0,

	Header = 1,

	Cell = 2
}

declare const enum UICellAccessoryPlacement {

	Leading = 0,

	Trailing = 1
}

declare class UICellAccessoryPopUpMenu extends UICellAccessory {

	static alloc(): UICellAccessoryPopUpMenu; // inherited from NSObject

	static new(): UICellAccessoryPopUpMenu; // inherited from NSObject

	readonly menu: UIMenu;

	selectedElementDidChangeHandler: (p1: UIMenu) => void;

	constructor(o: { menu: UIMenu; });

	initWithMenu(menu: UIMenu): this;
}

declare function UICellAccessoryPositionAfterAccessoryOfClass(accessoryClass: typeof NSObject): (p1: NSArray<UICellAccessory>) => number;

declare function UICellAccessoryPositionBeforeAccessoryOfClass(accessoryClass: typeof NSObject): (p1: NSArray<UICellAccessory>) => number;

declare class UICellAccessoryReorder extends UICellAccessory {

	static alloc(): UICellAccessoryReorder; // inherited from NSObject

	static new(): UICellAccessoryReorder; // inherited from NSObject

	showsVerticalSeparator: boolean;
}

declare var UICellAccessoryStandardDimension: number;

declare const enum UICellConfigurationDragState {

	None = 0,

	Lifting = 1,

	Dragging = 2
}

declare const enum UICellConfigurationDropState {

	None = 0,

	NotTargeted = 1,

	Targeted = 2
}

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

declare class UICloudSharingController extends UIViewController {

	static alloc(): UICloudSharingController; // inherited from NSObject

	static new(): UICloudSharingController; // inherited from NSObject

	availablePermissions: UICloudSharingPermissionOptions;

	delegate: UICloudSharingControllerDelegate;

	readonly share: CKShare;

	constructor(o: { preparationHandler: (p1: UICloudSharingController, p2: (p1: CKShare, p2: CKContainer, p3: NSError) => void) => void; });

	constructor(o: { share: CKShare; container: CKContainer; });

	activityItemSource(): UIActivityItemSource;

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

declare var UICollectionElementKindSectionFooter: string;

declare var UICollectionElementKindSectionHeader: string;

declare const enum UICollectionLayoutListAppearance {

	Plain = 0,

	Grouped = 1,

	InsetGrouped = 2,

	Sidebar = 3,

	SidebarPlain = 4
}

declare class UICollectionLayoutListConfiguration extends NSObject implements NSCopying {

	static alloc(): UICollectionLayoutListConfiguration; // inherited from NSObject

	static new(): UICollectionLayoutListConfiguration; // inherited from NSObject

	readonly appearance: UICollectionLayoutListAppearance;

	backgroundColor: UIColor;

	footerMode: UICollectionLayoutListFooterMode;

	headerMode: UICollectionLayoutListHeaderMode;

	headerTopPadding: number;

	itemSeparatorHandler: (p1: NSIndexPath, p2: UIListSeparatorConfiguration) => UIListSeparatorConfiguration;

	leadingSwipeActionsConfigurationProvider: (p1: NSIndexPath) => UISwipeActionsConfiguration;

	separatorConfiguration: UIListSeparatorConfiguration;

	showsSeparators: boolean;

	trailingSwipeActionsConfigurationProvider: (p1: NSIndexPath) => UISwipeActionsConfiguration;

	constructor(o: { appearance: UICollectionLayoutListAppearance; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithAppearance(appearance: UICollectionLayoutListAppearance): this;
}

declare const enum UICollectionLayoutListFooterMode {

	None = 0,

	Supplementary = 1
}

declare const enum UICollectionLayoutListHeaderMode {

	None = 0,

	Supplementary = 1,

	FirstItemInSection = 2
}

declare const enum UICollectionLayoutSectionOrthogonalScrollingBehavior {

	None = 0,

	Continuous = 1,

	ContinuousGroupLeadingBoundary = 2,

	Paging = 3,

	GroupPaging = 4,

	GroupPagingCentered = 5
}

declare class UICollectionReusableView extends UIView {

	static alloc(): UICollectionReusableView; // inherited from NSObject

	static appearance(): UICollectionReusableView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UICollectionReusableView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UICollectionReusableView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UICollectionReusableView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UICollectionReusableView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UICollectionReusableView; // inherited from UIAppearance

	static new(): UICollectionReusableView; // inherited from NSObject

	readonly reuseIdentifier: string;

	applyLayoutAttributes(layoutAttributes: UICollectionViewLayoutAttributes): void;

	didTransitionFromLayoutToLayout(oldLayout: UICollectionViewLayout, newLayout: UICollectionViewLayout): void;

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

declare class UICollectionView extends UIScrollView implements UIDataSourceTranslating, UISpringLoadedInteractionSupporting {

	static alloc(): UICollectionView; // inherited from NSObject

	static appearance(): UICollectionView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UICollectionView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UICollectionView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UICollectionView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UICollectionView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UICollectionView; // inherited from UIAppearance

	static new(): UICollectionView; // inherited from NSObject

	allowsFocus: boolean;

	allowsFocusDuringEditing: boolean;

	allowsMultipleSelection: boolean;

	allowsMultipleSelectionDuringEditing: boolean;

	allowsSelection: boolean;

	allowsSelectionDuringEditing: boolean;

	backgroundView: UIView;

	collectionViewLayout: UICollectionViewLayout;

	readonly contextMenuInteraction: UIContextMenuInteraction;

	dataSource: UICollectionViewDataSource;

	delegate: UICollectionViewDelegate;

	dragDelegate: UICollectionViewDragDelegate;

	dragInteractionEnabled: boolean;

	dropDelegate: UICollectionViewDropDelegate;

	editing: boolean;

	readonly hasActiveDrag: boolean;

	readonly hasActiveDrop: boolean;

	readonly hasUncommittedUpdates: boolean;

	readonly indexPathsForSelectedItems: NSArray<NSIndexPath>;

	readonly indexPathsForVisibleItems: NSArray<NSIndexPath>;

	readonly numberOfSections: number;

	prefetchDataSource: UICollectionViewDataSourcePrefetching;

	prefetchingEnabled: boolean;

	remembersLastFocusedIndexPath: boolean;

	reorderingCadence: UICollectionViewReorderingCadence;

	selectionFollowsFocus: boolean;

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

	beginInteractiveMovementForItemAtIndexPath(indexPath: NSIndexPath): boolean;

	cancelInteractiveMovement(): void;

	cancelInteractiveTransition(): void;

	cellForItemAtIndexPath(indexPath: NSIndexPath): UICollectionViewCell;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	dataSourceIndexPathForPresentationIndexPath(presentationIndexPath: NSIndexPath): NSIndexPath;

	dataSourceSectionIndexForPresentationSectionIndex(presentationSectionIndex: number): number;

	deleteItemsAtIndexPaths(indexPaths: NSArray<NSIndexPath> | NSIndexPath[]): void;

	deleteSections(sections: NSIndexSet): void;

	dequeueConfiguredReusableCellWithRegistrationForIndexPathItem(registration: UICollectionViewCellRegistration, indexPath: NSIndexPath, item: any): UICollectionViewCell;

	dequeueConfiguredReusableSupplementaryViewWithRegistrationForIndexPath(registration: UICollectionViewSupplementaryRegistration, indexPath: NSIndexPath): UICollectionReusableView;

	dequeueReusableCellWithReuseIdentifierForIndexPath(identifier: string, indexPath: NSIndexPath): UICollectionViewCell;

	dequeueReusableSupplementaryViewOfKindWithReuseIdentifierForIndexPath(elementKind: string, identifier: string, indexPath: NSIndexPath): UICollectionReusableView;

	deselectItemAtIndexPathAnimated(indexPath: NSIndexPath, animated: boolean): void;

	endInteractiveMovement(): void;

	finishInteractiveTransition(): void;

	indexPathForCell(cell: UICollectionViewCell): NSIndexPath;

	indexPathForItemAtPoint(point: CGPoint): NSIndexPath;

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

	setCollectionViewLayoutAnimatedCompletion(layout: UICollectionViewLayout, animated: boolean, completion: (p1: boolean) => void): void;

	startInteractiveTransitionToCollectionViewLayoutCompletion(layout: UICollectionViewLayout, completion: (p1: boolean, p2: boolean) => void): UICollectionViewTransitionLayout;

	supplementaryViewForElementKindAtIndexPath(elementKind: string, indexPath: NSIndexPath): UICollectionReusableView;

	updateInteractiveMovementTargetPosition(targetPosition: CGPoint): void;

	visibleSupplementaryViewsOfKind(elementKind: string): NSArray<UICollectionReusableView>;
}

declare class UICollectionViewCell extends UICollectionReusableView {

	static alloc(): UICollectionViewCell; // inherited from NSObject

	static appearance(): UICollectionViewCell; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UICollectionViewCell; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UICollectionViewCell; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UICollectionViewCell; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UICollectionViewCell; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UICollectionViewCell; // inherited from UIAppearance

	static new(): UICollectionViewCell; // inherited from NSObject

	automaticallyUpdatesBackgroundConfiguration: boolean;

	automaticallyUpdatesContentConfiguration: boolean;

	backgroundConfiguration: UIBackgroundConfiguration;

	backgroundView: UIView;

	readonly configurationState: UICellConfigurationState;

	configurationUpdateHandler: (p1: UICollectionViewCell, p2: UICellConfigurationState) => void;

	contentConfiguration: UIContentConfiguration;

	readonly contentView: UIView;

	highlighted: boolean;

	selected: boolean;

	selectedBackgroundView: UIView;

	defaultBackgroundConfiguration(): UIBackgroundConfiguration;

	dragStateDidChange(dragState: UICollectionViewCellDragState): void;

	setNeedsUpdateConfiguration(): void;

	updateConfigurationUsingState(state: UICellConfigurationState): void;
}

declare const enum UICollectionViewCellDragState {

	None = 0,

	Lifting = 1,

	Dragging = 2
}

declare class UICollectionViewCellRegistration extends NSObject {

	static alloc(): UICollectionViewCellRegistration; // inherited from NSObject

	static new(): UICollectionViewCellRegistration; // inherited from NSObject

	static registrationWithCellClassConfigurationHandler(cellClass: typeof NSObject, configurationHandler: (p1: UICollectionViewCell, p2: NSIndexPath, p3: any) => void): UICollectionViewCellRegistration;

	static registrationWithCellNibConfigurationHandler(cellNib: UINib, configurationHandler: (p1: UICollectionViewCell, p2: NSIndexPath, p3: any) => void): UICollectionViewCellRegistration;

	readonly cellClass: typeof NSObject;

	readonly cellNib: UINib;

	readonly configurationHandler: (p1: UICollectionViewCell, p2: NSIndexPath, p3: any) => void;
}

declare class UICollectionViewCompositionalLayout extends UICollectionViewLayout {

	static alloc(): UICollectionViewCompositionalLayout; // inherited from NSObject

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

declare class UICollectionViewCompositionalLayoutConfiguration extends NSObject implements NSCopying {

	static alloc(): UICollectionViewCompositionalLayoutConfiguration; // inherited from NSObject

	static new(): UICollectionViewCompositionalLayoutConfiguration; // inherited from NSObject

	boundarySupplementaryItems: NSArray<NSCollectionLayoutBoundarySupplementaryItem>;

	contentInsetsReference: UIContentInsetsReference;

	interSectionSpacing: number;

	scrollDirection: UICollectionViewScrollDirection;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class UICollectionViewController extends UIViewController implements UICollectionViewDataSource, UICollectionViewDelegate {

	static alloc(): UICollectionViewController; // inherited from NSObject

	static new(): UICollectionViewController; // inherited from NSObject

	clearsSelectionOnViewWillAppear: boolean;

	collectionView: UICollectionView;

	readonly collectionViewLayout: UICollectionViewLayout;

	installsStandardGestureForInteractiveMovement: boolean;

	useLayoutToLayoutNavigationTransitions: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { collectionViewLayout: UICollectionViewLayout; });

	class(): typeof NSObject;

	collectionViewCanEditItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewCanFocusItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewCanMoveItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewCanPerformActionForItemAtIndexPathWithSender(collectionView: UICollectionView, action: string, indexPath: NSIndexPath, sender: any): boolean;

	collectionViewCanPerformPrimaryActionForItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewCellForItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): UICollectionViewCell;

	collectionViewContextMenuConfigurationDismissalPreviewForItemAtIndexPath(collectionView: UICollectionView, configuration: UIContextMenuConfiguration, indexPath: NSIndexPath): UITargetedPreview;

	collectionViewContextMenuConfigurationForItemAtIndexPathPoint(collectionView: UICollectionView, indexPath: NSIndexPath, point: CGPoint): UIContextMenuConfiguration;

	collectionViewContextMenuConfigurationForItemsAtIndexPathsPoint(collectionView: UICollectionView, indexPaths: NSArray<NSIndexPath> | NSIndexPath[], point: CGPoint): UIContextMenuConfiguration;

	collectionViewContextMenuConfigurationHighlightPreviewForItemAtIndexPath(collectionView: UICollectionView, configuration: UIContextMenuConfiguration, indexPath: NSIndexPath): UITargetedPreview;

	collectionViewDidBeginMultipleSelectionInteractionAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): void;

	collectionViewDidDeselectItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): void;

	collectionViewDidEndDisplayingCellForItemAtIndexPath(collectionView: UICollectionView, cell: UICollectionViewCell, indexPath: NSIndexPath): void;

	collectionViewDidEndDisplayingSupplementaryViewForElementOfKindAtIndexPath(collectionView: UICollectionView, view: UICollectionReusableView, elementKind: string, indexPath: NSIndexPath): void;

	collectionViewDidEndMultipleSelectionInteraction(collectionView: UICollectionView): void;

	collectionViewDidHighlightItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): void;

	collectionViewDidSelectItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): void;

	collectionViewDidUnhighlightItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): void;

	collectionViewDidUpdateFocusInContextWithAnimationCoordinator(collectionView: UICollectionView, context: UICollectionViewFocusUpdateContext, coordinator: UIFocusAnimationCoordinator): void;

	collectionViewIndexPathForIndexTitleAtIndex(collectionView: UICollectionView, title: string, index: number): NSIndexPath;

	collectionViewMoveItemAtIndexPathToIndexPath(collectionView: UICollectionView, sourceIndexPath: NSIndexPath, destinationIndexPath: NSIndexPath): void;

	collectionViewNumberOfItemsInSection(collectionView: UICollectionView, section: number): number;

	collectionViewPerformActionForItemAtIndexPathWithSender(collectionView: UICollectionView, action: string, indexPath: NSIndexPath, sender: any): void;

	collectionViewPerformPrimaryActionForItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): void;

	collectionViewPreviewForDismissingContextMenuWithConfiguration(collectionView: UICollectionView, configuration: UIContextMenuConfiguration): UITargetedPreview;

	collectionViewPreviewForHighlightingContextMenuWithConfiguration(collectionView: UICollectionView, configuration: UIContextMenuConfiguration): UITargetedPreview;

	collectionViewSceneActivationConfigurationForItemAtIndexPathPoint(collectionView: UICollectionView, indexPath: NSIndexPath, point: CGPoint): UIWindowSceneActivationConfiguration;

	collectionViewSelectionFollowsFocusForItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewShouldBeginMultipleSelectionInteractionAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewShouldDeselectItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewShouldHighlightItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewShouldSelectItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewShouldShowMenuForItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewShouldSpringLoadItemAtIndexPathWithContext(collectionView: UICollectionView, indexPath: NSIndexPath, context: UISpringLoadedInteractionContext): boolean;

	collectionViewShouldUpdateFocusInContext(collectionView: UICollectionView, context: UICollectionViewFocusUpdateContext): boolean;

	collectionViewTargetContentOffsetForProposedContentOffset(collectionView: UICollectionView, proposedContentOffset: CGPoint): CGPoint;

	collectionViewTargetIndexPathForMoveFromItemAtIndexPathToProposedIndexPath(collectionView: UICollectionView, currentIndexPath: NSIndexPath, proposedIndexPath: NSIndexPath): NSIndexPath;

	collectionViewTargetIndexPathForMoveOfItemFromOriginalIndexPathAtCurrentIndexPathToProposedIndexPath(collectionView: UICollectionView, originalIndexPath: NSIndexPath, currentIndexPath: NSIndexPath, proposedIndexPath: NSIndexPath): NSIndexPath;

	collectionViewTransitionLayoutForOldLayoutNewLayout(collectionView: UICollectionView, fromLayout: UICollectionViewLayout, toLayout: UICollectionViewLayout): UICollectionViewTransitionLayout;

	collectionViewViewForSupplementaryElementOfKindAtIndexPath(collectionView: UICollectionView, kind: string, indexPath: NSIndexPath): UICollectionReusableView;

	collectionViewWillDisplayCellForItemAtIndexPath(collectionView: UICollectionView, cell: UICollectionViewCell, indexPath: NSIndexPath): void;

	collectionViewWillDisplayContextMenuWithConfigurationAnimator(collectionView: UICollectionView, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionAnimating): void;

	collectionViewWillDisplaySupplementaryViewForElementKindAtIndexPath(collectionView: UICollectionView, view: UICollectionReusableView, elementKind: string, indexPath: NSIndexPath): void;

	collectionViewWillEndContextMenuInteractionWithConfigurationAnimator(collectionView: UICollectionView, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionAnimating): void;

	collectionViewWillPerformPreviewActionForMenuWithConfigurationAnimator(collectionView: UICollectionView, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionCommitAnimating): void;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	indexPathForPreferredFocusedViewInCollectionView(collectionView: UICollectionView): NSIndexPath;

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

	scrollViewDidChangeAdjustedContentInset(scrollView: UIScrollView): void;

	scrollViewDidEndDecelerating(scrollView: UIScrollView): void;

	scrollViewDidEndDraggingWillDecelerate(scrollView: UIScrollView, decelerate: boolean): void;

	scrollViewDidEndScrollingAnimation(scrollView: UIScrollView): void;

	scrollViewDidEndZoomingWithViewAtScale(scrollView: UIScrollView, view: UIView, scale: number): void;

	scrollViewDidScroll(scrollView: UIScrollView): void;

	scrollViewDidScrollToTop(scrollView: UIScrollView): void;

	scrollViewDidZoom(scrollView: UIScrollView): void;

	scrollViewShouldScrollToTop(scrollView: UIScrollView): boolean;

	scrollViewWillBeginDecelerating(scrollView: UIScrollView): void;

	scrollViewWillBeginDragging(scrollView: UIScrollView): void;

	scrollViewWillBeginZoomingWithView(scrollView: UIScrollView, view: UIView): void;

	scrollViewWillEndDraggingWithVelocityTargetContentOffset(scrollView: UIScrollView, velocity: CGPoint, targetContentOffset: interop.Pointer | interop.Reference<CGPoint>): void;

	self(): this;

	viewForZoomingInScrollView(scrollView: UIScrollView): UIView;
}

interface UICollectionViewDataSource extends NSObjectProtocol {

	collectionViewCanMoveItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewCellForItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): UICollectionViewCell;

	collectionViewIndexPathForIndexTitleAtIndex?(collectionView: UICollectionView, title: string, index: number): NSIndexPath;

	collectionViewMoveItemAtIndexPathToIndexPath?(collectionView: UICollectionView, sourceIndexPath: NSIndexPath, destinationIndexPath: NSIndexPath): void;

	collectionViewNumberOfItemsInSection(collectionView: UICollectionView, section: number): number;

	collectionViewViewForSupplementaryElementOfKindAtIndexPath?(collectionView: UICollectionView, kind: string, indexPath: NSIndexPath): UICollectionReusableView;

	indexTitlesForCollectionView?(collectionView: UICollectionView): NSArray<string>;

	numberOfSectionsInCollectionView?(collectionView: UICollectionView): number;
}
declare var UICollectionViewDataSource: {

	prototype: UICollectionViewDataSource;
};

interface UICollectionViewDataSourcePrefetching extends NSObjectProtocol {

	collectionViewCancelPrefetchingForItemsAtIndexPaths?(collectionView: UICollectionView, indexPaths: NSArray<NSIndexPath> | NSIndexPath[]): void;

	collectionViewPrefetchItemsAtIndexPaths(collectionView: UICollectionView, indexPaths: NSArray<NSIndexPath> | NSIndexPath[]): void;
}
declare var UICollectionViewDataSourcePrefetching: {

	prototype: UICollectionViewDataSourcePrefetching;
};

interface UICollectionViewDelegate extends UIScrollViewDelegate {

	collectionViewCanEditItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewCanFocusItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewCanPerformActionForItemAtIndexPathWithSender?(collectionView: UICollectionView, action: string, indexPath: NSIndexPath, sender: any): boolean;

	collectionViewCanPerformPrimaryActionForItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewContextMenuConfigurationDismissalPreviewForItemAtIndexPath?(collectionView: UICollectionView, configuration: UIContextMenuConfiguration, indexPath: NSIndexPath): UITargetedPreview;

	collectionViewContextMenuConfigurationForItemAtIndexPathPoint?(collectionView: UICollectionView, indexPath: NSIndexPath, point: CGPoint): UIContextMenuConfiguration;

	collectionViewContextMenuConfigurationForItemsAtIndexPathsPoint?(collectionView: UICollectionView, indexPaths: NSArray<NSIndexPath> | NSIndexPath[], point: CGPoint): UIContextMenuConfiguration;

	collectionViewContextMenuConfigurationHighlightPreviewForItemAtIndexPath?(collectionView: UICollectionView, configuration: UIContextMenuConfiguration, indexPath: NSIndexPath): UITargetedPreview;

	collectionViewDidBeginMultipleSelectionInteractionAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): void;

	collectionViewDidDeselectItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): void;

	collectionViewDidEndDisplayingCellForItemAtIndexPath?(collectionView: UICollectionView, cell: UICollectionViewCell, indexPath: NSIndexPath): void;

	collectionViewDidEndDisplayingSupplementaryViewForElementOfKindAtIndexPath?(collectionView: UICollectionView, view: UICollectionReusableView, elementKind: string, indexPath: NSIndexPath): void;

	collectionViewDidEndMultipleSelectionInteraction?(collectionView: UICollectionView): void;

	collectionViewDidHighlightItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): void;

	collectionViewDidSelectItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): void;

	collectionViewDidUnhighlightItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): void;

	collectionViewDidUpdateFocusInContextWithAnimationCoordinator?(collectionView: UICollectionView, context: UICollectionViewFocusUpdateContext, coordinator: UIFocusAnimationCoordinator): void;

	collectionViewPerformActionForItemAtIndexPathWithSender?(collectionView: UICollectionView, action: string, indexPath: NSIndexPath, sender: any): void;

	collectionViewPerformPrimaryActionForItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): void;

	collectionViewPreviewForDismissingContextMenuWithConfiguration?(collectionView: UICollectionView, configuration: UIContextMenuConfiguration): UITargetedPreview;

	collectionViewPreviewForHighlightingContextMenuWithConfiguration?(collectionView: UICollectionView, configuration: UIContextMenuConfiguration): UITargetedPreview;

	collectionViewSceneActivationConfigurationForItemAtIndexPathPoint?(collectionView: UICollectionView, indexPath: NSIndexPath, point: CGPoint): UIWindowSceneActivationConfiguration;

	collectionViewSelectionFollowsFocusForItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewShouldBeginMultipleSelectionInteractionAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewShouldDeselectItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewShouldHighlightItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewShouldSelectItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewShouldShowMenuForItemAtIndexPath?(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewShouldSpringLoadItemAtIndexPathWithContext?(collectionView: UICollectionView, indexPath: NSIndexPath, context: UISpringLoadedInteractionContext): boolean;

	collectionViewShouldUpdateFocusInContext?(collectionView: UICollectionView, context: UICollectionViewFocusUpdateContext): boolean;

	collectionViewTargetContentOffsetForProposedContentOffset?(collectionView: UICollectionView, proposedContentOffset: CGPoint): CGPoint;

	collectionViewTargetIndexPathForMoveFromItemAtIndexPathToProposedIndexPath?(collectionView: UICollectionView, currentIndexPath: NSIndexPath, proposedIndexPath: NSIndexPath): NSIndexPath;

	collectionViewTargetIndexPathForMoveOfItemFromOriginalIndexPathAtCurrentIndexPathToProposedIndexPath?(collectionView: UICollectionView, originalIndexPath: NSIndexPath, currentIndexPath: NSIndexPath, proposedIndexPath: NSIndexPath): NSIndexPath;

	collectionViewTransitionLayoutForOldLayoutNewLayout?(collectionView: UICollectionView, fromLayout: UICollectionViewLayout, toLayout: UICollectionViewLayout): UICollectionViewTransitionLayout;

	collectionViewWillDisplayCellForItemAtIndexPath?(collectionView: UICollectionView, cell: UICollectionViewCell, indexPath: NSIndexPath): void;

	collectionViewWillDisplayContextMenuWithConfigurationAnimator?(collectionView: UICollectionView, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionAnimating): void;

	collectionViewWillDisplaySupplementaryViewForElementKindAtIndexPath?(collectionView: UICollectionView, view: UICollectionReusableView, elementKind: string, indexPath: NSIndexPath): void;

	collectionViewWillEndContextMenuInteractionWithConfigurationAnimator?(collectionView: UICollectionView, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionAnimating): void;

	collectionViewWillPerformPreviewActionForMenuWithConfigurationAnimator?(collectionView: UICollectionView, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionCommitAnimating): void;

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

declare class UICollectionViewDiffableDataSource<SectionIdentifierType, ItemIdentifierType> extends NSObject implements UICollectionViewDataSource {

	static alloc<SectionIdentifierType, ItemIdentifierType>(): UICollectionViewDiffableDataSource<SectionIdentifierType, ItemIdentifierType>; // inherited from NSObject

	static new<SectionIdentifierType, ItemIdentifierType>(): UICollectionViewDiffableDataSource<SectionIdentifierType, ItemIdentifierType>; // inherited from NSObject

	reorderingHandlers: UICollectionViewDiffableDataSourceReorderingHandlers<SectionIdentifierType, ItemIdentifierType>;

	sectionSnapshotHandlers: UICollectionViewDiffableDataSourceSectionSnapshotHandlers<ItemIdentifierType>;

	supplementaryViewProvider: (p1: UICollectionView, p2: string, p3: NSIndexPath) => UICollectionReusableView;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { collectionView: UICollectionView; cellProvider: (p1: UICollectionView, p2: NSIndexPath, p3: any) => UICollectionViewCell; });

	applySnapshotAnimatingDifferences(snapshot: NSDiffableDataSourceSnapshot<SectionIdentifierType, ItemIdentifierType>, animatingDifferences: boolean): void;

	applySnapshotAnimatingDifferencesCompletion(snapshot: NSDiffableDataSourceSnapshot<SectionIdentifierType, ItemIdentifierType>, animatingDifferences: boolean, completion: () => void): void;

	applySnapshotToSectionAnimatingDifferences(snapshot: NSDiffableDataSourceSectionSnapshot<ItemIdentifierType>, sectionIdentifier: SectionIdentifierType, animatingDifferences: boolean): void;

	applySnapshotToSectionAnimatingDifferencesCompletion(snapshot: NSDiffableDataSourceSectionSnapshot<ItemIdentifierType>, sectionIdentifier: SectionIdentifierType, animatingDifferences: boolean, completion: () => void): void;

	applySnapshotUsingReloadData(snapshot: NSDiffableDataSourceSnapshot<SectionIdentifierType, ItemIdentifierType>): void;

	applySnapshotUsingReloadDataCompletion(snapshot: NSDiffableDataSourceSnapshot<SectionIdentifierType, ItemIdentifierType>, completion: () => void): void;

	class(): typeof NSObject;

	collectionViewCanMoveItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): boolean;

	collectionViewCellForItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): UICollectionViewCell;

	collectionViewIndexPathForIndexTitleAtIndex(collectionView: UICollectionView, title: string, index: number): NSIndexPath;

	collectionViewMoveItemAtIndexPathToIndexPath(collectionView: UICollectionView, sourceIndexPath: NSIndexPath, destinationIndexPath: NSIndexPath): void;

	collectionViewNumberOfItemsInSection(collectionView: UICollectionView, section: number): number;

	collectionViewViewForSupplementaryElementOfKindAtIndexPath(collectionView: UICollectionView, kind: string, indexPath: NSIndexPath): UICollectionReusableView;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	indexForSectionIdentifier(identifier: SectionIdentifierType): number;

	indexPathForItemIdentifier(identifier: ItemIdentifierType): NSIndexPath;

	indexTitlesForCollectionView(collectionView: UICollectionView): NSArray<string>;

	initWithCollectionViewCellProvider(collectionView: UICollectionView, cellProvider: (p1: UICollectionView, p2: NSIndexPath, p3: any) => UICollectionViewCell): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	itemIdentifierForIndexPath(indexPath: NSIndexPath): ItemIdentifierType;

	numberOfSectionsInCollectionView(collectionView: UICollectionView): number;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	sectionIdentifierForIndex(index: number): SectionIdentifierType;

	self(): this;

	snapshot(): NSDiffableDataSourceSnapshot<SectionIdentifierType, ItemIdentifierType>;

	snapshotForSection(section: SectionIdentifierType): NSDiffableDataSourceSectionSnapshot<ItemIdentifierType>;
}

declare class UICollectionViewDiffableDataSourceReorderingHandlers<SectionType, ItemType> extends NSObject implements NSCopying {

	static alloc<SectionType, ItemType>(): UICollectionViewDiffableDataSourceReorderingHandlers<SectionType, ItemType>; // inherited from NSObject

	static new<SectionType, ItemType>(): UICollectionViewDiffableDataSourceReorderingHandlers<SectionType, ItemType>; // inherited from NSObject

	canReorderItemHandler: (p1: ItemType) => boolean;

	didReorderHandler: (p1: NSDiffableDataSourceTransaction<SectionType, ItemType>) => void;

	willReorderHandler: (p1: NSDiffableDataSourceTransaction<SectionType, ItemType>) => void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class UICollectionViewDiffableDataSourceSectionSnapshotHandlers<ItemType> extends NSObject implements NSCopying {

	static alloc<ItemType>(): UICollectionViewDiffableDataSourceSectionSnapshotHandlers<ItemType>; // inherited from NSObject

	static new<ItemType>(): UICollectionViewDiffableDataSourceSectionSnapshotHandlers<ItemType>; // inherited from NSObject

	shouldCollapseItemHandler: (p1: ItemType) => boolean;

	shouldExpandItemHandler: (p1: ItemType) => boolean;

	snapshotForExpandingParentItemHandler: (p1: ItemType, p2: NSDiffableDataSourceSectionSnapshot<ItemType>) => NSDiffableDataSourceSectionSnapshot<ItemType>;

	willCollapseItemHandler: (p1: ItemType) => void;

	willExpandItemHandler: (p1: ItemType) => void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

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

declare const enum UICollectionViewDropIntent {

	Unspecified = 0,

	InsertAtDestinationIndexPath = 1,

	InsertIntoDestinationIndexPath = 2
}

interface UICollectionViewDropItem extends NSObjectProtocol {

	dragItem: UIDragItem;

	previewSize: CGSize;

	sourceIndexPath: NSIndexPath;
}
declare var UICollectionViewDropItem: {

	prototype: UICollectionViewDropItem;
};

declare class UICollectionViewDropPlaceholder extends UICollectionViewPlaceholder {

	static alloc(): UICollectionViewDropPlaceholder; // inherited from NSObject

	static new(): UICollectionViewDropPlaceholder; // inherited from NSObject

	previewParametersProvider: (p1: UICollectionViewCell) => UIDragPreviewParameters;
}

interface UICollectionViewDropPlaceholderContext extends UIDragAnimating {

	dragItem: UIDragItem;

	commitInsertionWithDataSourceUpdates(dataSourceUpdates: (p1: NSIndexPath) => void): boolean;

	deletePlaceholder(): boolean;

	setNeedsCellUpdate(): void;
}
declare var UICollectionViewDropPlaceholderContext: {

	prototype: UICollectionViewDropPlaceholderContext;
};

declare class UICollectionViewDropProposal extends UIDropProposal {

	static alloc(): UICollectionViewDropProposal; // inherited from NSObject

	static new(): UICollectionViewDropProposal; // inherited from NSObject

	readonly intent: UICollectionViewDropIntent;

	constructor(o: { dropOperation: UIDropOperation; intent: UICollectionViewDropIntent; });

	initWithDropOperationIntent(operation: UIDropOperation, intent: UICollectionViewDropIntent): this;
}

declare class UICollectionViewFlowLayout extends UICollectionViewLayout {

	static alloc(): UICollectionViewFlowLayout; // inherited from NSObject

	static new(): UICollectionViewFlowLayout; // inherited from NSObject

	estimatedItemSize: CGSize;

	footerReferenceSize: CGSize;

	headerReferenceSize: CGSize;

	itemSize: CGSize;

	minimumInteritemSpacing: number;

	minimumLineSpacing: number;

	scrollDirection: UICollectionViewScrollDirection;

	sectionFootersPinToVisibleBounds: boolean;

	sectionHeadersPinToVisibleBounds: boolean;

	sectionInset: UIEdgeInsets;

	sectionInsetReference: UICollectionViewFlowLayoutSectionInsetReference;
}

declare var UICollectionViewFlowLayoutAutomaticSize: CGSize;

declare class UICollectionViewFlowLayoutInvalidationContext extends UICollectionViewLayoutInvalidationContext {

	static alloc(): UICollectionViewFlowLayoutInvalidationContext; // inherited from NSObject

	static new(): UICollectionViewFlowLayoutInvalidationContext; // inherited from NSObject

	invalidateFlowLayoutAttributes: boolean;

	invalidateFlowLayoutDelegateMetrics: boolean;
}

declare const enum UICollectionViewFlowLayoutSectionInsetReference {

	FromContentInset = 0,

	FromSafeArea = 1,

	FromLayoutMargins = 2
}

declare class UICollectionViewFocusUpdateContext extends UIFocusUpdateContext {

	static alloc(): UICollectionViewFocusUpdateContext; // inherited from NSObject

	static new(): UICollectionViewFocusUpdateContext; // inherited from NSObject

	readonly nextFocusedIndexPath: NSIndexPath;

	readonly previouslyFocusedIndexPath: NSIndexPath;
}

declare class UICollectionViewLayout extends NSObject implements NSCoding {

	static alloc(): UICollectionViewLayout; // inherited from NSObject

	static new(): UICollectionViewLayout; // inherited from NSObject

	readonly collectionView: UICollectionView;

	readonly collectionViewContentSize: CGSize;

	readonly developmentLayoutDirection: UIUserInterfaceLayoutDirection;

	readonly flipsHorizontallyInOppositeLayoutDirection: boolean;

	static readonly invalidationContextClass: typeof NSObject;

	static readonly layoutAttributesClass: typeof NSObject;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	finalLayoutAttributesForDisappearingDecorationElementOfKindAtIndexPath(elementKind: string, decorationIndexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	finalLayoutAttributesForDisappearingItemAtIndexPath(itemIndexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	finalLayoutAttributesForDisappearingSupplementaryElementOfKindAtIndexPath(elementKind: string, elementIndexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	finalizeAnimatedBoundsChange(): void;

	finalizeCollectionViewUpdates(): void;

	finalizeLayoutTransition(): void;

	indexPathsToDeleteForDecorationViewOfKind(elementKind: string): NSArray<NSIndexPath>;

	indexPathsToDeleteForSupplementaryViewOfKind(elementKind: string): NSArray<NSIndexPath>;

	indexPathsToInsertForDecorationViewOfKind(elementKind: string): NSArray<NSIndexPath>;

	indexPathsToInsertForSupplementaryViewOfKind(elementKind: string): NSArray<NSIndexPath>;

	initWithCoder(coder: NSCoder): this;

	initialLayoutAttributesForAppearingDecorationElementOfKindAtIndexPath(elementKind: string, decorationIndexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	initialLayoutAttributesForAppearingItemAtIndexPath(itemIndexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	initialLayoutAttributesForAppearingSupplementaryElementOfKindAtIndexPath(elementKind: string, elementIndexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	invalidateLayout(): void;

	invalidateLayoutWithContext(context: UICollectionViewLayoutInvalidationContext): void;

	invalidationContextForBoundsChange(newBounds: CGRect): UICollectionViewLayoutInvalidationContext;

	invalidationContextForEndingInteractiveMovementOfItemsToFinalIndexPathsPreviousIndexPathsMovementCancelled(indexPaths: NSArray<NSIndexPath> | NSIndexPath[], previousIndexPaths: NSArray<NSIndexPath> | NSIndexPath[], movementCancelled: boolean): UICollectionViewLayoutInvalidationContext;

	invalidationContextForInteractivelyMovingItemsWithTargetPositionPreviousIndexPathsPreviousPosition(targetIndexPaths: NSArray<NSIndexPath> | NSIndexPath[], targetPosition: CGPoint, previousIndexPaths: NSArray<NSIndexPath> | NSIndexPath[], previousPosition: CGPoint): UICollectionViewLayoutInvalidationContext;

	invalidationContextForPreferredLayoutAttributesWithOriginalAttributes(preferredAttributes: UICollectionViewLayoutAttributes, originalAttributes: UICollectionViewLayoutAttributes): UICollectionViewLayoutInvalidationContext;

	layoutAttributesForDecorationViewOfKindAtIndexPath(elementKind: string, indexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	layoutAttributesForElementsInRect(rect: CGRect): NSArray<UICollectionViewLayoutAttributes>;

	layoutAttributesForInteractivelyMovingItemAtIndexPathWithTargetPosition(indexPath: NSIndexPath, position: CGPoint): UICollectionViewLayoutAttributes;

	layoutAttributesForItemAtIndexPath(indexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	layoutAttributesForSupplementaryViewOfKindAtIndexPath(elementKind: string, indexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	prepareForAnimatedBoundsChange(oldBounds: CGRect): void;

	prepareForCollectionViewUpdates(updateItems: NSArray<UICollectionViewUpdateItem> | UICollectionViewUpdateItem[]): void;

	prepareForTransitionFromLayout(oldLayout: UICollectionViewLayout): void;

	prepareForTransitionToLayout(newLayout: UICollectionViewLayout): void;

	prepareLayout(): void;

	registerClassForDecorationViewOfKind(viewClass: typeof NSObject, elementKind: string): void;

	registerNibForDecorationViewOfKind(nib: UINib, elementKind: string): void;

	shouldInvalidateLayoutForBoundsChange(newBounds: CGRect): boolean;

	shouldInvalidateLayoutForPreferredLayoutAttributesWithOriginalAttributes(preferredAttributes: UICollectionViewLayoutAttributes, originalAttributes: UICollectionViewLayoutAttributes): boolean;

	targetContentOffsetForProposedContentOffset(proposedContentOffset: CGPoint): CGPoint;

	targetContentOffsetForProposedContentOffsetWithScrollingVelocity(proposedContentOffset: CGPoint, velocity: CGPoint): CGPoint;

	targetIndexPathForInteractivelyMovingItemWithPosition(previousIndexPath: NSIndexPath, position: CGPoint): NSIndexPath;
}

declare class UICollectionViewLayoutAttributes extends NSObject implements NSCopying, UIDynamicItem {

	static alloc(): UICollectionViewLayoutAttributes; // inherited from NSObject

	static layoutAttributesForCellWithIndexPath(indexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	static layoutAttributesForDecorationViewOfKindWithIndexPath(decorationViewKind: string, indexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	static layoutAttributesForSupplementaryViewOfKindWithIndexPath(elementKind: string, indexPath: NSIndexPath): UICollectionViewLayoutAttributes;

	static new(): UICollectionViewLayoutAttributes; // inherited from NSObject

	alpha: number;

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

	readonly collisionBoundingPath: UIBezierPath; // inherited from UIDynamicItem

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

declare var UICollectionViewLayoutAutomaticDimension: number;

declare class UICollectionViewLayoutInvalidationContext extends NSObject {

	static alloc(): UICollectionViewLayoutInvalidationContext; // inherited from NSObject

	static new(): UICollectionViewLayoutInvalidationContext; // inherited from NSObject

	contentOffsetAdjustment: CGPoint;

	contentSizeAdjustment: CGSize;

	readonly interactiveMovementTarget: CGPoint;

	readonly invalidateDataSourceCounts: boolean;

	readonly invalidateEverything: boolean;

	readonly invalidatedDecorationIndexPaths: NSDictionary<string, NSArray<NSIndexPath>>;

	readonly invalidatedItemIndexPaths: NSArray<NSIndexPath>;

	readonly invalidatedSupplementaryIndexPaths: NSDictionary<string, NSArray<NSIndexPath>>;

	readonly previousIndexPathsForInteractivelyMovingItems: NSArray<NSIndexPath>;

	readonly targetIndexPathsForInteractivelyMovingItems: NSArray<NSIndexPath>;

	invalidateDecorationElementsOfKindAtIndexPaths(elementKind: string, indexPaths: NSArray<NSIndexPath> | NSIndexPath[]): void;

	invalidateItemsAtIndexPaths(indexPaths: NSArray<NSIndexPath> | NSIndexPath[]): void;

	invalidateSupplementaryElementsOfKindAtIndexPaths(elementKind: string, indexPaths: NSArray<NSIndexPath> | NSIndexPath[]): void;
}

declare class UICollectionViewListCell extends UICollectionViewCell {

	static alloc(): UICollectionViewListCell; // inherited from NSObject

	static appearance(): UICollectionViewListCell; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UICollectionViewListCell; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UICollectionViewListCell; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UICollectionViewListCell; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UICollectionViewListCell; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UICollectionViewListCell; // inherited from UIAppearance

	static new(): UICollectionViewListCell; // inherited from NSObject

	accessories: NSArray<UICellAccessory>;

	indentationLevel: number;

	indentationWidth: number;

	indentsAccessories: boolean;

	readonly separatorLayoutGuide: UILayoutGuide;

	defaultContentConfiguration(): UIListContentConfiguration;
}

declare class UICollectionViewPlaceholder extends NSObject {

	static alloc(): UICollectionViewPlaceholder; // inherited from NSObject

	static new(): UICollectionViewPlaceholder; // inherited from NSObject

	cellUpdateHandler: (p1: UICollectionViewCell) => void;

	constructor(o: { insertionIndexPath: NSIndexPath; reuseIdentifier: string; });

	initWithInsertionIndexPathReuseIdentifier(insertionIndexPath: NSIndexPath, reuseIdentifier: string): this;
}

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

declare const enum UICollectionViewSelfSizingInvalidation {

	Disabled = 0,

	Enabled = 1,

	EnabledIncludingConstraints = 2
}

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

declare class UICollectionViewUpdateItem extends NSObject {

	static alloc(): UICollectionViewUpdateItem; // inherited from NSObject

	static new(): UICollectionViewUpdateItem; // inherited from NSObject

	readonly indexPathAfterUpdate: NSIndexPath;

	readonly indexPathBeforeUpdate: NSIndexPath;

	readonly updateAction: UICollectionUpdateAction;
}

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

declare const enum UICollisionBehaviorMode {

	Items = 1,

	Boundaries = 2,

	Everything = -1
}

declare class UIColor extends NSObject implements NSCopying, NSItemProviderReading, NSItemProviderWriting, NSSecureCoding {

	static alloc(): UIColor; // inherited from NSObject

	static colorNamed(name: string): UIColor;

	static colorNamedInBundleCompatibleWithTraitCollection(name: string, bundle: NSBundle, traitCollection: UITraitCollection): UIColor;

	static colorWithCGColor(cgColor: any): UIColor;

	static colorWithCIColor(ciColor: CIColor): UIColor;

	static colorWithDisplayP3RedGreenBlueAlpha(displayP3Red: number, green: number, blue: number, alpha: number): UIColor;

	static colorWithDynamicProvider(dynamicProvider: (p1: UITraitCollection) => UIColor): UIColor;

	static colorWithHueSaturationBrightnessAlpha(hue: number, saturation: number, brightness: number, alpha: number): UIColor;

	static colorWithPatternImage(image: UIImage): UIColor;

	static colorWithRedGreenBlueAlpha(red: number, green: number, blue: number, alpha: number): UIColor;

	static colorWithWhiteAlpha(white: number, alpha: number): UIColor;

	static itemProviderVisibilityForRepresentationWithTypeIdentifier(typeIdentifier: string): NSItemProviderRepresentationVisibility;

	static new(): UIColor; // inherited from NSObject

	static objectWithItemProviderDataTypeIdentifierError(data: NSData, typeIdentifier: string): UIColor;

	readonly CGColor: any;

	readonly CIColor: CIColor;

	readonly accessibilityName: string;

	static readonly blackColor: UIColor;

	static readonly blueColor: UIColor;

	static readonly brownColor: UIColor;

	static readonly clearColor: UIColor;

	static readonly cyanColor: UIColor;

	static readonly darkGrayColor: UIColor;

	static readonly darkTextColor: UIColor;

	static readonly grayColor: UIColor;

	static readonly greenColor: UIColor;

	static readonly groupTableViewBackgroundColor: UIColor;

	static readonly labelColor: UIColor;

	static readonly lightGrayColor: UIColor;

	static readonly lightTextColor: UIColor;

	static readonly linkColor: UIColor;

	static readonly magentaColor: UIColor;

	static readonly opaqueSeparatorColor: UIColor;

	static readonly orangeColor: UIColor;

	static readonly placeholderTextColor: UIColor;

	static readonly purpleColor: UIColor;

	static readonly quaternaryLabelColor: UIColor;

	static readonly quaternarySystemFillColor: UIColor;

	static readonly redColor: UIColor;

	static readonly scrollViewTexturedBackgroundColor: UIColor;

	static readonly secondaryLabelColor: UIColor;

	static readonly secondarySystemBackgroundColor: UIColor;

	static readonly secondarySystemFillColor: UIColor;

	static readonly secondarySystemGroupedBackgroundColor: UIColor;

	static readonly separatorColor: UIColor;

	static readonly systemBackgroundColor: UIColor;

	static readonly systemBlueColor: UIColor;

	static readonly systemBrownColor: UIColor;

	static readonly systemCyanColor: UIColor;

	static readonly systemFillColor: UIColor;

	static readonly systemGray2Color: UIColor;

	static readonly systemGray3Color: UIColor;

	static readonly systemGray4Color: UIColor;

	static readonly systemGray5Color: UIColor;

	static readonly systemGray6Color: UIColor;

	static readonly systemGrayColor: UIColor;

	static readonly systemGreenColor: UIColor;

	static readonly systemGroupedBackgroundColor: UIColor;

	static readonly systemIndigoColor: UIColor;

	static readonly systemMintColor: UIColor;

	static readonly systemOrangeColor: UIColor;

	static readonly systemPinkColor: UIColor;

	static readonly systemPurpleColor: UIColor;

	static readonly systemRedColor: UIColor;

	static readonly systemTealColor: UIColor;

	static readonly systemYellowColor: UIColor;

	static readonly tertiaryLabelColor: UIColor;

	static readonly tertiarySystemBackgroundColor: UIColor;

	static readonly tertiarySystemFillColor: UIColor;

	static readonly tertiarySystemGroupedBackgroundColor: UIColor;

	static readonly tintColor: UIColor;

	static readonly underPageBackgroundColor: UIColor;

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

	constructor(o: { CIColor: CIColor; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { displayP3Red: number; green: number; blue: number; alpha: number; });

	constructor(o: { dynamicProvider: (p1: UITraitCollection) => UIColor; });

	constructor(o: { hue: number; saturation: number; brightness: number; alpha: number; });

	constructor(o: { patternImage: UIImage; });

	constructor(o: { red: number; green: number; blue: number; alpha: number; });

	constructor(o: { white: number; alpha: number; });

	class(): typeof NSObject;

	colorWithAlphaComponent(alpha: number): UIColor;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	getHueSaturationBrightnessAlpha(hue: interop.Pointer | interop.Reference<number>, saturation: interop.Pointer | interop.Reference<number>, brightness: interop.Pointer | interop.Reference<number>, alpha: interop.Pointer | interop.Reference<number>): boolean;

	getRedGreenBlueAlpha(red: interop.Pointer | interop.Reference<number>, green: interop.Pointer | interop.Reference<number>, blue: interop.Pointer | interop.Reference<number>, alpha: interop.Pointer | interop.Reference<number>): boolean;

	getWhiteAlpha(white: interop.Pointer | interop.Reference<number>, alpha: interop.Pointer | interop.Reference<number>): boolean;

	initWithCGColor(cgColor: any): this;

	initWithCIColor(ciColor: CIColor): this;

	initWithCoder(coder: NSCoder): this;

	initWithDisplayP3RedGreenBlueAlpha(displayP3Red: number, green: number, blue: number, alpha: number): this;

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

	resolvedColorWithTraitCollection(traitCollection: UITraitCollection): UIColor;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	set(): void;

	setFill(): void;

	setStroke(): void;
}

declare class UIColorPickerViewController extends UIViewController {

	static alloc(): UIColorPickerViewController; // inherited from NSObject

	static new(): UIColorPickerViewController; // inherited from NSObject

	delegate: UIColorPickerViewControllerDelegate;

	selectedColor: UIColor;

	supportsAlpha: boolean;
}

interface UIColorPickerViewControllerDelegate extends NSObjectProtocol {

	colorPickerViewControllerDidFinish?(viewController: UIColorPickerViewController): void;

	colorPickerViewControllerDidSelectColor?(viewController: UIColorPickerViewController): void;

	colorPickerViewControllerDidSelectColorContinuously?(viewController: UIColorPickerViewController, color: UIColor, continuously: boolean): void;
}
declare var UIColorPickerViewControllerDelegate: {

	prototype: UIColorPickerViewControllerDelegate;
};

declare class UIColorWell extends UIControl {

	static alloc(): UIColorWell; // inherited from NSObject

	static appearance(): UIColorWell; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UIColorWell; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIColorWell; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIColorWell; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIColorWell; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIColorWell; // inherited from UIAppearance

	static new(): UIColorWell; // inherited from NSObject

	selectedColor: UIColor;

	supportsAlpha: boolean;

	title: string;
}

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

	readonly presentationSourceItem: UIPopoverPresentationControllerSourceItem; // inherited from UIMenuLeaf

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

declare var UICommandTagShare: string;

declare var UIConfigurationColorTransformerGrayscale: (p1: UIColor) => UIColor;

declare var UIConfigurationColorTransformerMonochromeTint: (p1: UIColor) => UIColor;

declare var UIConfigurationColorTransformerPreferredTint: (p1: UIColor) => UIColor;

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

interface UIContentConfiguration extends NSCopying, NSObjectProtocol {

	makeContentView(): UIView;

	updatedConfigurationForState(state: UIConfigurationState): UIContentConfiguration;
}
declare var UIContentConfiguration: {

	prototype: UIContentConfiguration;
};

interface UIContentContainer extends NSObjectProtocol {

	preferredContentSize: CGSize;

	preferredContentSizeDidChangeForChildContentContainer(container: UIContentContainer): void;

	sizeForChildContentContainerWithParentContainerSize(container: UIContentContainer, parentSize: CGSize): CGSize;

	systemLayoutFittingSizeDidChangeForChildContentContainer(container: UIContentContainer): void;

	viewWillTransitionToSizeWithTransitionCoordinator(size: CGSize, coordinator: UIViewControllerTransitionCoordinator): void;

	willTransitionToTraitCollectionWithTransitionCoordinator(newCollection: UITraitCollection, coordinator: UIViewControllerTransitionCoordinator): void;
}
declare var UIContentContainer: {

	prototype: UIContentContainer;
};

declare const enum UIContentInsetsReference {

	Automatic = 0,

	None = 1,

	SafeArea = 2,

	LayoutMargins = 3,

	ReadableContent = 4
}

declare var UIContentSizeCategoryAccessibilityExtraExtraExtraLarge: string;

declare var UIContentSizeCategoryAccessibilityExtraExtraLarge: string;

declare var UIContentSizeCategoryAccessibilityExtraLarge: string;

declare var UIContentSizeCategoryAccessibilityLarge: string;

declare var UIContentSizeCategoryAccessibilityMedium: string;

interface UIContentSizeCategoryAdjusting extends NSObjectProtocol {

	adjustsFontForContentSizeCategory: boolean;
}
declare var UIContentSizeCategoryAdjusting: {

	prototype: UIContentSizeCategoryAdjusting;
};

declare function UIContentSizeCategoryCompareToCategory(lhs: string, rhs: string): NSComparisonResult;

declare var UIContentSizeCategoryDidChangeNotification: string;

declare var UIContentSizeCategoryExtraExtraExtraLarge: string;

declare var UIContentSizeCategoryExtraExtraLarge: string;

declare var UIContentSizeCategoryExtraLarge: string;

declare var UIContentSizeCategoryExtraSmall: string;

declare function UIContentSizeCategoryIsAccessibilityCategory(category: string): boolean;

declare var UIContentSizeCategoryLarge: string;

declare var UIContentSizeCategoryMedium: string;

declare var UIContentSizeCategoryNewValueKey: string;

declare var UIContentSizeCategorySmall: string;

declare var UIContentSizeCategoryUnspecified: string;

interface UIContentView extends NSObjectProtocol {

	configuration: UIContentConfiguration;

	supportsConfiguration?(configuration: UIContentConfiguration): boolean;
}
declare var UIContentView: {

	prototype: UIContentView;
};

declare class UIContextMenuConfiguration extends NSObject {

	static alloc(): UIContextMenuConfiguration; // inherited from NSObject

	static configurationWithIdentifierPreviewProviderActionProvider(identifier: any, previewProvider: () => UIViewController, actionProvider: (p1: NSArray<UIMenuElement>) => UIMenu): UIContextMenuConfiguration;

	static new(): UIContextMenuConfiguration; // inherited from NSObject

	badgeCount: number;

	readonly identifier: any;

	preferredMenuElementOrder: UIContextMenuConfigurationElementOrder;

	secondaryItemIdentifiers: NSSet<any>;
}

declare const enum UIContextMenuConfigurationElementOrder {

	Automatic = 0,

	Priority = 1,

	Fixed = 2
}

declare class UIContextMenuInteraction extends NSObject implements UIInteraction {

	static alloc(): UIContextMenuInteraction; // inherited from NSObject

	static new(): UIContextMenuInteraction; // inherited from NSObject

	readonly delegate: UIContextMenuInteractionDelegate;

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

	updateVisibleMenuWithBlock(block: (p1: UIMenu) => UIMenu): void;

	willMoveToView(view: UIView): void;
}

interface UIContextMenuInteractionAnimating extends NSObjectProtocol {

	previewViewController: UIViewController;

	addAnimations(animations: () => void): void;

	addCompletion(completion: () => void): void;
}
declare var UIContextMenuInteractionAnimating: {

	prototype: UIContextMenuInteractionAnimating;
};

declare const enum UIContextMenuInteractionAppearance {

	Unknown = 0,

	Rich = 1,

	Compact = 2
}

interface UIContextMenuInteractionCommitAnimating extends UIContextMenuInteractionAnimating {

	preferredCommitStyle: UIContextMenuInteractionCommitStyle;
}
declare var UIContextMenuInteractionCommitAnimating: {

	prototype: UIContextMenuInteractionCommitAnimating;
};

declare const enum UIContextMenuInteractionCommitStyle {

	Dismiss = 0,

	Pop = 1
}

interface UIContextMenuInteractionDelegate extends NSObjectProtocol {

	contextMenuInteractionConfigurationDismissalPreviewForItemWithIdentifier?(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration, identifier: any): UITargetedPreview;

	contextMenuInteractionConfigurationForMenuAtLocation(interaction: UIContextMenuInteraction, location: CGPoint): UIContextMenuConfiguration;

	contextMenuInteractionConfigurationHighlightPreviewForItemWithIdentifier?(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration, identifier: any): UITargetedPreview;

	contextMenuInteractionPreviewForDismissingMenuWithConfiguration?(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration): UITargetedPreview;

	contextMenuInteractionPreviewForHighlightingMenuWithConfiguration?(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration): UITargetedPreview;

	contextMenuInteractionWillDisplayMenuForConfigurationAnimator?(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionAnimating): void;

	contextMenuInteractionWillEndForConfigurationAnimator?(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionAnimating): void;

	contextMenuInteractionWillPerformPreviewActionForMenuWithConfigurationAnimator?(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionCommitAnimating): void;
}
declare var UIContextMenuInteractionDelegate: {

	prototype: UIContextMenuInteractionDelegate;
};

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

declare const enum UIContextualActionStyle {

	Normal = 0,

	Destructive = 1
}

declare class UIControl extends UIView implements UIContextMenuInteractionDelegate {

	static alloc(): UIControl; // inherited from NSObject

	static appearance(): UIControl; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UIControl; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIControl; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIControl; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIControl; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIControl; // inherited from UIAppearance

	static new(): UIControl; // inherited from NSObject

	readonly allControlEvents: UIControlEvents;

	readonly allTargets: NSSet<any>;

	contentHorizontalAlignment: UIControlContentHorizontalAlignment;

	contentVerticalAlignment: UIControlContentVerticalAlignment;

	readonly contextMenuInteraction: UIContextMenuInteraction;

	contextMenuInteractionEnabled: boolean;

	readonly effectiveContentHorizontalAlignment: UIControlContentHorizontalAlignment;

	enabled: boolean;

	highlighted: boolean;

	selected: boolean;

	showsMenuAsPrimaryAction: boolean;

	readonly state: UIControlState;

	toolTip: string;

	readonly toolTipInteraction: UIToolTipInteraction;

	readonly touchInside: boolean;

	readonly tracking: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { frame: CGRect; primaryAction: UIAction; });

	actionsForTargetForControlEvent(target: any, controlEvent: UIControlEvents): NSArray<string>;

	addActionForControlEvents(action: UIAction, controlEvents: UIControlEvents): void;

	addTargetActionForControlEvents(target: any, action: string, controlEvents: UIControlEvents): void;

	beginTrackingWithTouchWithEvent(touch: UITouch, event: _UIEvent): boolean;

	cancelTrackingWithEvent(event: _UIEvent): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	contextMenuInteractionConfigurationDismissalPreviewForItemWithIdentifier(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration, identifier: any): UITargetedPreview;

	contextMenuInteractionConfigurationForMenuAtLocation(interaction: UIContextMenuInteraction, location: CGPoint): UIContextMenuConfiguration;

	contextMenuInteractionConfigurationHighlightPreviewForItemWithIdentifier(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration, identifier: any): UITargetedPreview;

	contextMenuInteractionPreviewForDismissingMenuWithConfiguration(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration): UITargetedPreview;

	contextMenuInteractionPreviewForHighlightingMenuWithConfiguration(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration): UITargetedPreview;

	contextMenuInteractionWillDisplayMenuForConfigurationAnimator(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionAnimating): void;

	contextMenuInteractionWillEndForConfigurationAnimator(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionAnimating): void;

	contextMenuInteractionWillPerformPreviewActionForMenuWithConfigurationAnimator(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionCommitAnimating): void;

	continueTrackingWithTouchWithEvent(touch: UITouch, event: _UIEvent): boolean;

	endTrackingWithTouchWithEvent(touch: UITouch, event: _UIEvent): void;

	enumerateEventHandlers(iterator: (p1: UIAction, p2: any, p3: string, p4: UIControlEvents, p5: interop.Pointer | interop.Reference<boolean>) => void): void;

	initWithFramePrimaryAction(frame: CGRect, primaryAction: UIAction): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	menuAttachmentPointForConfiguration(configuration: UIContextMenuConfiguration): CGPoint;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	removeActionForControlEvents(action: UIAction, controlEvents: UIControlEvents): void;

	removeActionForIdentifierForControlEvents(actionIdentifier: string, controlEvents: UIControlEvents): void;

	removeTargetActionForControlEvents(target: any, action: string, controlEvents: UIControlEvents): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

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

	bounds: CGRect;

	convertPointFromCoordinateSpace(point: CGPoint, coordinateSpace: UICoordinateSpace): CGPoint;

	convertPointToCoordinateSpace(point: CGPoint, coordinateSpace: UICoordinateSpace): CGPoint;

	convertRectFromCoordinateSpace(rect: CGRect, coordinateSpace: UICoordinateSpace): CGRect;

	convertRectToCoordinateSpace(rect: CGRect, coordinateSpace: UICoordinateSpace): CGRect;
}
declare var UICoordinateSpace: {

	prototype: UICoordinateSpace;
};

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

declare class UIDatePicker extends UIControl implements NSCoding {

	static alloc(): UIDatePicker; // inherited from NSObject

	static appearance(): UIDatePicker; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UIDatePicker; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIDatePicker; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIDatePicker; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIDatePicker; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIDatePicker; // inherited from UIAppearance

	static new(): UIDatePicker; // inherited from NSObject

	calendar: NSCalendar;

	countDownDuration: number;

	date: Date;

	datePickerMode: UIDatePickerMode;

	readonly datePickerStyle: UIDatePickerStyle;

	locale: NSLocale;

	maximumDate: Date;

	minimumDate: Date;

	minuteInterval: number;

	preferredDatePickerStyle: UIDatePickerStyle;

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

	CountDownTimer = 3
}

declare const enum UIDatePickerStyle {

	Automatic = 0,

	Wheels = 1,

	Compact = 2,

	Inline = 3
}

declare class UIDeferredMenuElement extends UIMenuElement {

	static alloc(): UIDeferredMenuElement; // inherited from NSObject

	static elementWithProvider(elementProvider: (p1: (p1: NSArray<UIMenuElement>) => void) => void): UIDeferredMenuElement;

	static elementWithUncachedProvider(elementProvider: (p1: (p1: NSArray<UIMenuElement>) => void) => void): UIDeferredMenuElement;

	static new(): UIDeferredMenuElement; // inherited from NSObject
}

declare class UIDevice extends NSObject {

	static alloc(): UIDevice; // inherited from NSObject

	static new(): UIDevice; // inherited from NSObject

	readonly batteryLevel: number;

	batteryMonitoringEnabled: boolean;

	readonly batteryState: UIDeviceBatteryState;

	readonly generatesDeviceOrientationNotifications: boolean;

	readonly identifierForVendor: NSUUID;

	readonly localizedModel: string;

	readonly model: string;

	readonly multitaskingSupported: boolean;

	readonly name: string;

	readonly orientation: UIDeviceOrientation;

	proximityMonitoringEnabled: boolean;

	readonly proximityState: boolean;

	readonly systemName: string;

	readonly systemVersion: string;

	readonly userInterfaceIdiom: UIUserInterfaceIdiom;

	static readonly currentDevice: UIDevice;

	beginGeneratingDeviceOrientationNotifications(): void;

	endGeneratingDeviceOrientationNotifications(): void;

	playInputClick(): void;
}

declare var UIDeviceBatteryLevelDidChangeNotification: string;

declare const enum UIDeviceBatteryState {

	Unknown = 0,

	Unplugged = 1,

	Charging = 2,

	Full = 3
}

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

declare var UIDeviceProximityStateDidChangeNotification: string;

declare class UIDictationPhrase extends NSObject {

	static alloc(): UIDictationPhrase; // inherited from NSObject

	static new(): UIDictationPhrase; // inherited from NSObject

	readonly alternativeInterpretations: NSArray<string>;

	readonly text: string;
}

declare const enum UIDirectionalRectEdge {

	None = 0,

	Top = 1,

	Leading = 2,

	Bottom = 4,

	Trailing = 8,

	All = 15
}

declare const enum UIDisplayGamut {

	Unspecified = -1,

	SRGB = 0,

	P3 = 1
}

declare class UIDocument extends NSObject implements NSFilePresenter, NSProgressReporting, UIUserActivityRestoring {

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

	userActivity: NSUserActivity;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly observedPresentedItemUbiquityAttributes: NSSet<string>; // inherited from NSFilePresenter

	readonly presentedItemOperationQueue: NSOperationQueue; // inherited from NSFilePresenter

	readonly presentedItemURL: NSURL; // inherited from NSFilePresenter

	readonly progress: NSProgress; // inherited from NSProgressReporting

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { fileURL: NSURL; });

	accommodatePresentedItemDeletionWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

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

	openWithCompletionHandler(completionHandler: (p1: boolean) => void): void;

	performAsynchronousFileAccessUsingBlock(block: () => void): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	presentedItemDidChange(): void;

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

	updateUserActivityState(userActivity: NSUserActivity): void;

	userInteractionNoLongerPermittedForError(error: NSError): void;

	writeContentsAndAttributesSafelyToURLForSaveOperationError(contents: any, additionalFileAttributes: NSDictionary<any, any>, url: NSURL, saveOperation: UIDocumentSaveOperation): boolean;

	writeContentsToURLForSaveOperationOriginalContentsURLError(contents: any, url: NSURL, saveOperation: UIDocumentSaveOperation, originalContentsURL: NSURL): boolean;
}

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

declare const enum UIDocumentBrowserActionAvailability {

	Menu = 1,

	NavigationBar = 2
}

declare const enum UIDocumentBrowserErrorCode {

	Generic = 1,

	NoLocationAvailable = 2
}

declare var UIDocumentBrowserErrorDomain: string;

declare const enum UIDocumentBrowserImportMode {

	None = 0,

	Copy = 1,

	Move = 2
}

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

declare const enum UIDocumentBrowserUserInterfaceStyle {

	White = 0,

	Light = 1,

	Dark = 2
}

declare class UIDocumentBrowserViewController extends UIViewController implements NSCoding {

	static alloc(): UIDocumentBrowserViewController; // inherited from NSObject

	static new(): UIDocumentBrowserViewController; // inherited from NSObject

	additionalLeadingNavigationBarButtonItems: NSArray<UIBarButtonItem>;

	additionalTrailingNavigationBarButtonItems: NSArray<UIBarButtonItem>;

	readonly allowedContentTypes: NSArray<string>;

	allowsDocumentCreation: boolean;

	allowsPickingMultipleItems: boolean;

	browserUserInterfaceStyle: UIDocumentBrowserUserInterfaceStyle;

	readonly contentTypesForRecentDocuments: NSArray<UTType>;

	customActions: NSArray<UIDocumentBrowserAction>;

	defaultDocumentAspectRatio: number;

	delegate: UIDocumentBrowserViewControllerDelegate;

	localizedCreateDocumentActionTitle: string;

	readonly recentDocumentsContentTypes: NSArray<string>;

	shouldShowFileExtensions: boolean;

	constructor(o: { forOpeningContentTypes: NSArray<UTType> | UTType[]; });

	constructor(o: { forOpeningFilesWithContentTypes: NSArray<string> | string[]; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	importDocumentAtURLNextToDocumentAtURLModeCompletionHandler(documentURL: NSURL, neighbourURL: NSURL, importMode: UIDocumentBrowserImportMode, completion: (p1: NSURL, p2: NSError) => void): void;

	initForOpeningContentTypes(contentTypes: NSArray<UTType> | UTType[]): this;

	initForOpeningFilesWithContentTypes(allowedContentTypes: NSArray<string> | string[]): this;

	initWithCoder(coder: NSCoder): this;

	renameDocumentAtURLProposedNameCompletionHandler(documentURL: NSURL, proposedName: string, completionHandler: (p1: NSURL, p2: NSError) => void): void;

	revealDocumentAtURLImportIfNeededCompletion(url: NSURL, importIfNeeded: boolean, completion: (p1: NSURL, p2: NSError) => void): void;

	transitionControllerForDocumentAtURL(documentURL: NSURL): UIDocumentBrowserTransitionController;

	transitionControllerForDocumentURL(documentURL: NSURL): UIDocumentBrowserTransitionController;
}

interface UIDocumentBrowserViewControllerDelegate extends NSObjectProtocol {

	documentBrowserApplicationActivitiesForDocumentURLs?(controller: UIDocumentBrowserViewController, documentURLs: NSArray<NSURL> | NSURL[]): NSArray<UIActivity>;

	documentBrowserDidImportDocumentAtURLToDestinationURL?(controller: UIDocumentBrowserViewController, sourceURL: NSURL, destinationURL: NSURL): void;

	documentBrowserDidPickDocumentURLs?(controller: UIDocumentBrowserViewController, documentURLs: NSArray<NSURL> | NSURL[]): void;

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

	actionSheetCancel(actionSheet: UIActionSheet): void;

	actionSheetClickedButtonAtIndex(actionSheet: UIActionSheet, buttonIndex: number): void;

	actionSheetDidDismissWithButtonIndex(actionSheet: UIActionSheet, buttonIndex: number): void;

	actionSheetWillDismissWithButtonIndex(actionSheet: UIActionSheet, buttonIndex: number): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

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

	willPresentActionSheet(actionSheet: UIActionSheet): void;
}

interface UIDocumentInteractionControllerDelegate extends NSObjectProtocol {

	documentInteractionControllerCanPerformAction?(controller: UIDocumentInteractionController, action: string): boolean;

	documentInteractionControllerDidDismissOpenInMenu?(controller: UIDocumentInteractionController): void;

	documentInteractionControllerDidDismissOptionsMenu?(controller: UIDocumentInteractionController): void;

	documentInteractionControllerDidEndPreview?(controller: UIDocumentInteractionController): void;

	documentInteractionControllerDidEndSendingToApplication?(controller: UIDocumentInteractionController, application: string): void;

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

interface UIDocumentMenuDelegate extends NSObjectProtocol {

	documentMenuDidPickDocumentPicker(documentMenu: UIDocumentMenuViewController, documentPicker: UIDocumentPickerViewController): void;

	documentMenuWasCancelled?(documentMenu: UIDocumentMenuViewController): void;
}
declare var UIDocumentMenuDelegate: {

	prototype: UIDocumentMenuDelegate;
};

declare const enum UIDocumentMenuOrder {

	First = 0,

	Last = 1
}

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

	documentPickerDidPickDocumentAtURL?(controller: UIDocumentPickerViewController, url: NSURL): void;

	documentPickerDidPickDocumentsAtURLs?(controller: UIDocumentPickerViewController, urls: NSArray<NSURL> | NSURL[]): void;

	documentPickerWasCancelled?(controller: UIDocumentPickerViewController): void;
}
declare var UIDocumentPickerDelegate: {

	prototype: UIDocumentPickerDelegate;
};

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

declare const enum UIDocumentPickerMode {

	Import = 0,

	Open = 1,

	ExportToService = 2,

	MoveToService = 3
}

declare class UIDocumentPickerViewController extends UIViewController {

	static alloc(): UIDocumentPickerViewController; // inherited from NSObject

	static new(): UIDocumentPickerViewController; // inherited from NSObject

	allowsMultipleSelection: boolean;

	delegate: UIDocumentPickerDelegate;

	directoryURL: NSURL;

	readonly documentPickerMode: UIDocumentPickerMode;

	shouldShowFileExtensions: boolean;

	constructor(o: { forExportingURLs: NSArray<NSURL> | NSURL[]; });

	constructor(o: { forExportingURLs: NSArray<NSURL> | NSURL[]; asCopy: boolean; });

	constructor(o: { forOpeningContentTypes: NSArray<UTType> | UTType[]; });

	constructor(o: { forOpeningContentTypes: NSArray<UTType> | UTType[]; asCopy: boolean; });

	constructor(o: { documentTypes: NSArray<string> | string[]; inMode: UIDocumentPickerMode; });

	constructor(o: { URL: NSURL; inMode: UIDocumentPickerMode; });

	constructor(o: { URLs: NSArray<NSURL> | NSURL[]; inMode: UIDocumentPickerMode; });

	initForExportingURLs(urls: NSArray<NSURL> | NSURL[]): this;

	initForExportingURLsAsCopy(urls: NSArray<NSURL> | NSURL[], asCopy: boolean): this;

	initForOpeningContentTypes(contentTypes: NSArray<UTType> | UTType[]): this;

	initForOpeningContentTypesAsCopy(contentTypes: NSArray<UTType> | UTType[], asCopy: boolean): this;

	initWithDocumentTypesInMode(allowedUTIs: NSArray<string> | string[], mode: UIDocumentPickerMode): this;

	initWithURLInMode(url: NSURL, mode: UIDocumentPickerMode): this;

	initWithURLsInMode(urls: NSArray<NSURL> | NSURL[], mode: UIDocumentPickerMode): this;
}

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

declare var UIDocumentStateChangedNotification: string;

interface UIDragAnimating extends NSObjectProtocol {

	addAnimations(animations: () => void): void;

	addCompletion(completion: (p1: UIViewAnimatingPosition) => void): void;
}
declare var UIDragAnimating: {

	prototype: UIDragAnimating;
};

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

declare class UIDragItem extends NSObject {

	static alloc(): UIDragItem; // inherited from NSObject

	static new(): UIDragItem; // inherited from NSObject

	readonly itemProvider: NSItemProvider;

	localObject: any;

	previewProvider: () => UIDragPreview;

	constructor(o: { itemProvider: NSItemProvider; });

	initWithItemProvider(itemProvider: NSItemProvider): this;
}

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

declare class UIDragPreviewParameters extends UIPreviewParameters {

	static alloc(): UIDragPreviewParameters; // inherited from NSObject

	static new(): UIDragPreviewParameters; // inherited from NSObject
}

declare class UIDragPreviewTarget extends UIPreviewTarget {

	static alloc(): UIDragPreviewTarget; // inherited from NSObject

	static new(): UIDragPreviewTarget; // inherited from NSObject
}

interface UIDragSession extends UIDragDropSession {

	localContext: any;
}
declare var UIDragSession: {

	prototype: UIDragSession;
};

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

declare const enum UIDropOperation {

	Cancel = 0,

	Forbidden = 1,

	Copy = 2,

	Move = 3
}

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

interface UIDropSession extends NSProgressReporting, UIDragDropSession {

	localDragSession: UIDragSession;

	progressIndicatorStyle: UIDropSessionProgressIndicatorStyle;

	loadObjectsOfClassCompletion(aClass: typeof NSObject, completion: (p1: NSArray<NSItemProviderReading>) => void): NSProgress;
}
declare var UIDropSession: {

	prototype: UIDropSession;
};

declare const enum UIDropSessionProgressIndicatorStyle {

	None = 0,

	Default = 1
}

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

	collisionBoundingPath?: UIBezierPath;

	collisionBoundsType?: UIDynamicItemCollisionBoundsType;

	transform: CGAffineTransform;
}
declare var UIDynamicItem: {

	prototype: UIDynamicItem;
};

declare class UIDynamicItemBehavior extends UIDynamicBehavior {

	static alloc(): UIDynamicItemBehavior; // inherited from NSObject

	static new(): UIDynamicItemBehavior; // inherited from NSObject

	allowsRotation: boolean;

	anchored: boolean;

	angularResistance: number;

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

declare const enum UIDynamicItemCollisionBoundsType {

	Rectangle = 0,

	Ellipse = 1,

	Path = 2
}

declare class UIDynamicItemGroup extends NSObject implements UIDynamicItem {

	static alloc(): UIDynamicItemGroup; // inherited from NSObject

	static new(): UIDynamicItemGroup; // inherited from NSObject

	readonly items: NSArray<UIDynamicItem>;

	readonly bounds: CGRect; // inherited from UIDynamicItem

	center: CGPoint; // inherited from UIDynamicItem

	readonly collisionBoundingPath: UIBezierPath; // inherited from UIDynamicItem

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

declare const enum UIEditMenuArrowDirection {

	Automatic = 0,

	Up = 1,

	Down = 2,

	Left = 3,

	Right = 4
}

declare class UIEditMenuConfiguration extends NSObject {

	static alloc(): UIEditMenuConfiguration; // inherited from NSObject

	static configurationWithIdentifierSourcePoint(identifier: any, sourcePoint: CGPoint): UIEditMenuConfiguration;

	static new(): UIEditMenuConfiguration; // inherited from NSObject

	readonly identifier: any;

	preferredArrowDirection: UIEditMenuArrowDirection;

	readonly sourcePoint: CGPoint;
}

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

interface UIEditMenuInteractionAnimating extends NSObjectProtocol {

	addAnimations(animations: () => void): void;

	addCompletion(completion: () => void): void;
}
declare var UIEditMenuInteractionAnimating: {

	prototype: UIEditMenuInteractionAnimating;
};

interface UIEditMenuInteractionDelegate extends NSObjectProtocol {

	editMenuInteractionMenuForConfigurationSuggestedActions?(interaction: UIEditMenuInteraction, configuration: UIEditMenuConfiguration, suggestedActions: NSArray<UIMenuElement> | UIMenuElement[]): UIMenu;

	editMenuInteractionTargetRectForConfiguration?(interaction: UIEditMenuInteraction, configuration: UIEditMenuConfiguration): CGRect;

	editMenuInteractionWillDismissMenuForConfigurationAnimator?(interaction: UIEditMenuInteraction, configuration: UIEditMenuConfiguration, animator: UIEditMenuInteractionAnimating): void;

	editMenuInteractionWillPresentMenuForConfigurationAnimator?(interaction: UIEditMenuInteraction, configuration: UIEditMenuConfiguration, animator: UIEditMenuInteractionAnimating): void;
}
declare var UIEditMenuInteractionDelegate: {

	prototype: UIEditMenuInteractionDelegate;
};

declare const enum UIEditingInteractionConfiguration {

	None = 0,

	Default = 1
}

declare class _UIEvent extends NSObject {

	static alloc(): _UIEvent; // inherited from NSObject

	static new(): _UIEvent; // inherited from NSObject

	readonly allTouches: NSSet<UITouch>;

	readonly buttonMask: UIEventButtonMask;

	readonly modifierFlags: UIKeyModifierFlags;

	readonly subtype: UIEventSubtype;

	readonly timestamp: number;

	readonly type: UIEventType;

	coalescedTouchesForTouch(touch: UITouch): NSArray<UITouch>;

	predictedTouchesForTouch(touch: UITouch): NSArray<UITouch>;

	touchesForGestureRecognizer(gesture: UIGestureRecognizer): NSSet<UITouch>;

	touchesForView(view: UIView): NSSet<UITouch>;

	touchesForWindow(window: UIWindow): NSSet<UITouch>;
}

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

declare class UIEventAttributionView extends UIView {

	static alloc(): UIEventAttributionView; // inherited from NSObject

	static appearance(): UIEventAttributionView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UIEventAttributionView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIEventAttributionView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIEventAttributionView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIEventAttributionView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIEventAttributionView; // inherited from UIAppearance

	static new(): UIEventAttributionView; // inherited from NSObject
}

declare const enum UIEventButtonMask {

	Primary = 1,

	Secondary = 2
}

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

declare class UIFeedbackGenerator extends NSObject {

	static alloc(): UIFeedbackGenerator; // inherited from NSObject

	static new(): UIFeedbackGenerator; // inherited from NSObject

	prepare(): void;
}

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

interface UIFindInteractionDelegate extends NSObjectProtocol {

	findInteractionDidBeginFindSession?(interaction: UIFindInteraction, session: UIFindSession): void;

	findInteractionDidEndFindSession?(interaction: UIFindInteraction, session: UIFindSession): void;

	findInteractionSessionForView(interaction: UIFindInteraction, view: UIView): UIFindSession;
}
declare var UIFindInteractionDelegate: {

	prototype: UIFindInteractionDelegate;
};

declare class UIFindSession extends NSObject {

	static alloc(): UIFindSession; // inherited from NSObject

	static new(): UIFindSession; // inherited from NSObject

	readonly allowsReplacement: boolean;

	readonly highlightedResultIndex: number;

	readonly resultCount: number;

	searchResultDisplayStyle: UIFindSessionSearchResultDisplayStyle;

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

declare var UIFloatRangeInfinite: UIFloatRange;

declare function UIFloatRangeIsInfinite(range: UIFloatRange): boolean;

declare var UIFloatRangeZero: UIFloatRange;

interface UIFocusAnimationContext extends NSObjectProtocol {

	duration: number;
}
declare var UIFocusAnimationContext: {

	prototype: UIFocusAnimationContext;
};

declare class UIFocusAnimationCoordinator extends NSObject {

	static alloc(): UIFocusAnimationCoordinator; // inherited from NSObject

	static new(): UIFocusAnimationCoordinator; // inherited from NSObject

	addCoordinatedAnimationsCompletion(animations: () => void, completion: () => void): void;

	addCoordinatedFocusingAnimationsCompletion(animations: (p1: UIFocusAnimationContext) => void, completion: () => void): void;

	addCoordinatedUnfocusingAnimationsCompletion(animations: (p1: UIFocusAnimationContext) => void, completion: () => void): void;
}

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

interface UIFocusDebuggerOutput extends NSObjectProtocol {
}
declare var UIFocusDebuggerOutput: {

	prototype: UIFocusDebuggerOutput;
};

declare var UIFocusDidUpdateNotification: string;

declare class UIFocusEffect extends NSObject implements NSCopying {

	static alloc(): UIFocusEffect; // inherited from NSObject

	static effect(): UIFocusEffect;

	static new(): UIFocusEffect; // inherited from NSObject

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

interface UIFocusEnvironment extends NSObjectProtocol {

	focusGroupIdentifier?: string;

	focusItemContainer: UIFocusItemContainer;

	parentFocusEnvironment: UIFocusEnvironment;

	preferredFocusEnvironments: NSArray<UIFocusEnvironment>;

	preferredFocusedView?: UIView;

	didUpdateFocusInContextWithAnimationCoordinator(context: UIFocusUpdateContext, coordinator: UIFocusAnimationCoordinator): void;

	setNeedsFocusUpdate(): void;

	shouldUpdateFocusInContext(context: UIFocusUpdateContext): boolean;

	updateFocusIfNeeded(): void;
}
declare var UIFocusEnvironment: {

	prototype: UIFocusEnvironment;
};

declare var UIFocusGroupPriorityCurrentlyFocused: number;

declare var UIFocusGroupPriorityIgnored: number;

declare var UIFocusGroupPriorityPreviouslyFocused: number;

declare var UIFocusGroupPriorityPrioritized: number;

declare class UIFocusGuide extends UILayoutGuide {

	static alloc(): UIFocusGuide; // inherited from NSObject

	static new(): UIFocusGuide; // inherited from NSObject

	enabled: boolean;

	preferredFocusEnvironments: NSArray<UIFocusEnvironment>;

	preferredFocusedView: UIView;
}

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

declare const enum UIFocusHaloEffectPosition {

	Automatic = 0,

	Outside = 1,

	Inside = 2
}

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

interface UIFocusItem extends UIFocusEnvironment {

	canBecomeFocused: boolean;

	focusEffect?: UIFocusEffect;

	focusGroupPriority?: number;

	frame: CGRect;

	isTransparentFocusItem?: boolean;

	didHintFocusMovement?(hint: UIFocusMovementHint): void;
}
declare var UIFocusItem: {

	prototype: UIFocusItem;
};

interface UIFocusItemContainer extends NSObjectProtocol {

	coordinateSpace: UICoordinateSpace;

	focusItemsInRect(rect: CGRect): NSArray<UIFocusItem>;
}
declare var UIFocusItemContainer: {

	prototype: UIFocusItemContainer;
};

interface UIFocusItemScrollableContainer extends UIFocusItemContainer {

	contentOffset: CGPoint;

	contentSize: CGSize;

	visibleSize: CGSize;
}
declare var UIFocusItemScrollableContainer: {

	prototype: UIFocusItemScrollableContainer;
};

declare var UIFocusMovementDidFailNotification: string;

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

declare class UIFocusSystem extends NSObject {

	static alloc(): UIFocusSystem; // inherited from NSObject

	static environmentContainsEnvironment(environment: UIFocusEnvironment, otherEnvironment: UIFocusEnvironment): boolean;

	static focusSystemForEnvironment(environment: UIFocusEnvironment): UIFocusSystem;

	static new(): UIFocusSystem; // inherited from NSObject

	readonly focusedItem: UIFocusItem;

	requestFocusUpdateToEnvironment(environment: UIFocusEnvironment): void;

	updateFocusIfNeeded(): void;
}

declare var UIFocusUpdateAnimationCoordinatorKey: string;

declare class UIFocusUpdateContext extends NSObject {

	static alloc(): UIFocusUpdateContext; // inherited from NSObject

	static new(): UIFocusUpdateContext; // inherited from NSObject

	readonly focusHeading: UIFocusHeading;

	readonly nextFocusedItem: UIFocusItem;

	readonly nextFocusedView: UIView;

	readonly previouslyFocusedItem: UIFocusItem;

	readonly previouslyFocusedView: UIView;
}

declare var UIFocusUpdateContextKey: string;

declare class UIFont extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UIFont; // inherited from NSObject

	static boldSystemFontOfSize(fontSize: number): UIFont;

	static fontNamesForFamilyName(familyName: string): NSArray<string>;

	static fontWithDescriptorSize(descriptor: UIFontDescriptor, pointSize: number): UIFont;

	static fontWithNameSize(fontName: string, fontSize: number): UIFont;

	static italicSystemFontOfSize(fontSize: number): UIFont;

	static monospacedDigitSystemFontOfSizeWeight(fontSize: number, weight: number): UIFont;

	static monospacedSystemFontOfSizeWeight(fontSize: number, weight: number): UIFont;

	static new(): UIFont; // inherited from NSObject

	static preferredFontForTextStyle(style: string): UIFont;

	static preferredFontForTextStyleCompatibleWithTraitCollection(style: string, traitCollection: UITraitCollection): UIFont;

	static systemFontOfSize(fontSize: number): UIFont;

	static systemFontOfSizeWeight(fontSize: number, weight: number): UIFont;

	readonly ascender: number;

	readonly capHeight: number;

	readonly descender: number;

	readonly familyName: string;

	readonly fontDescriptor: UIFontDescriptor;

	readonly fontName: string;

	readonly leading: number;

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

declare class UIFontDescriptor extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UIFontDescriptor; // inherited from NSObject

	static fontDescriptorWithFontAttributes(attributes: NSDictionary<string, any>): UIFontDescriptor;

	static fontDescriptorWithNameMatrix(fontName: string, matrix: CGAffineTransform): UIFontDescriptor;

	static fontDescriptorWithNameSize(fontName: string, size: number): UIFontDescriptor;

	static new(): UIFontDescriptor; // inherited from NSObject

	static preferredFontDescriptorWithTextStyle(style: string): UIFontDescriptor;

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

declare var UIFontDescriptorCascadeListAttribute: string;

declare var UIFontDescriptorCharacterSetAttribute: string;

declare var UIFontDescriptorFaceAttribute: string;

declare var UIFontDescriptorFamilyAttribute: string;

declare var UIFontDescriptorFeatureSettingsAttribute: string;

declare var UIFontDescriptorFixedAdvanceAttribute: string;

declare var UIFontDescriptorMatrixAttribute: string;

declare var UIFontDescriptorNameAttribute: string;

declare var UIFontDescriptorSizeAttribute: string;

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

declare var UIFontDescriptorSystemDesignDefault: string;

declare var UIFontDescriptorSystemDesignMonospaced: string;

declare var UIFontDescriptorSystemDesignRounded: string;

declare var UIFontDescriptorSystemDesignSerif: string;

declare var UIFontDescriptorTextStyleAttribute: string;

declare var UIFontDescriptorTraitsAttribute: string;

declare var UIFontDescriptorVisibleNameAttribute: string;

declare var UIFontFeatureSelectorIdentifierKey: string;

declare var UIFontFeatureTypeIdentifierKey: string;

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

declare class UIFontPickerViewController extends UIViewController {

	static alloc(): UIFontPickerViewController; // inherited from NSObject

	static new(): UIFontPickerViewController; // inherited from NSObject

	readonly configuration: UIFontPickerViewControllerConfiguration;

	delegate: UIFontPickerViewControllerDelegate;

	selectedFontDescriptor: UIFontDescriptor;

	constructor(o: { configuration: UIFontPickerViewControllerConfiguration; });

	initWithConfiguration(configuration: UIFontPickerViewControllerConfiguration): this;
}

declare class UIFontPickerViewControllerConfiguration extends NSObject implements NSCopying {

	static alloc(): UIFontPickerViewControllerConfiguration; // inherited from NSObject

	static filterPredicateForFilteredLanguages(filteredLanguages: NSArray<string> | string[]): NSPredicate;

	static new(): UIFontPickerViewControllerConfiguration; // inherited from NSObject

	displayUsingSystemFont: boolean;

	filteredLanguagesPredicate: NSPredicate;

	filteredTraits: UIFontDescriptorSymbolicTraits;

	includeFaces: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

interface UIFontPickerViewControllerDelegate extends NSObjectProtocol {

	fontPickerViewControllerDidCancel?(viewController: UIFontPickerViewController): void;

	fontPickerViewControllerDidPickFont?(viewController: UIFontPickerViewController): void;
}
declare var UIFontPickerViewControllerDelegate: {

	prototype: UIFontPickerViewControllerDelegate;
};

declare var UIFontSlantTrait: string;

declare var UIFontSymbolicTrait: string;

declare var UIFontTextStyleBody: string;

declare var UIFontTextStyleCallout: string;

declare var UIFontTextStyleCaption1: string;

declare var UIFontTextStyleCaption2: string;

declare var UIFontTextStyleFootnote: string;

declare var UIFontTextStyleHeadline: string;

declare var UIFontTextStyleLargeTitle: string;

declare var UIFontTextStyleSubheadline: string;

declare var UIFontTextStyleTitle1: string;

declare var UIFontTextStyleTitle2: string;

declare var UIFontTextStyleTitle3: string;

declare var UIFontWeightBlack: number;

declare var UIFontWeightBold: number;

declare function UIFontWeightForImageSymbolWeight(symbolWeight: UIImageSymbolWeight): number;

declare var UIFontWeightHeavy: number;

declare var UIFontWeightLight: number;

declare var UIFontWeightMedium: number;

declare var UIFontWeightRegular: number;

declare var UIFontWeightSemibold: number;

declare var UIFontWeightThin: number;

declare var UIFontWeightTrait: string;

declare var UIFontWeightUltraLight: number;

declare var UIFontWidthTrait: string;

declare const enum UIForceTouchCapability {

	Unknown = 0,

	Unavailable = 1,

	Available = 2
}

declare class UIGestureRecognizer extends NSObject {

	static alloc(): UIGestureRecognizer; // inherited from NSObject

	static new(): UIGestureRecognizer; // inherited from NSObject

	allowedPressTypes: NSArray<number>;

	allowedTouchTypes: NSArray<number>;

	readonly buttonMask: UIEventButtonMask;

	cancelsTouchesInView: boolean;

	delaysTouchesBegan: boolean;

	delaysTouchesEnded: boolean;

	delegate: UIGestureRecognizerDelegate;

	enabled: boolean;

	readonly modifierFlags: UIKeyModifierFlags;

	name: string;

	readonly numberOfTouches: number;

	requiresExclusiveTouchType: boolean;

	state: UIGestureRecognizerState;

	readonly view: UIView;

	constructor(o: { coder: NSCoder; });

	constructor(o: { target: any; action: string; });

	addTargetAction(target: any, action: string): void;

	canBePreventedByGestureRecognizer(preventingGestureRecognizer: UIGestureRecognizer): boolean;

	canPreventGestureRecognizer(preventedGestureRecognizer: UIGestureRecognizer): boolean;

	ignorePressForEvent(button: UIPress, event: UIPressesEvent): void;

	ignoreTouchForEvent(touch: UITouch, event: _UIEvent): void;

	initWithCoder(coder: NSCoder): this;

	initWithTargetAction(target: any, action: string): this;

	locationInView(view: UIView): CGPoint;

	locationOfTouchInView(touchIndex: number, view: UIView): CGPoint;

	pressesBeganWithEvent(presses: NSSet<UIPress>, event: UIPressesEvent): void;

	pressesCancelledWithEvent(presses: NSSet<UIPress>, event: UIPressesEvent): void;

	pressesChangedWithEvent(presses: NSSet<UIPress>, event: UIPressesEvent): void;

	pressesEndedWithEvent(presses: NSSet<UIPress>, event: UIPressesEvent): void;

	removeTargetAction(target: any, action: string): void;

	requireGestureRecognizerToFail(otherGestureRecognizer: UIGestureRecognizer): void;

	reset(): void;

	shouldBeRequiredToFailByGestureRecognizer(otherGestureRecognizer: UIGestureRecognizer): boolean;

	shouldReceiveEvent(event: _UIEvent): boolean;

	shouldRequireFailureOfGestureRecognizer(otherGestureRecognizer: UIGestureRecognizer): boolean;

	touchesBeganWithEvent(touches: NSSet<UITouch>, event: _UIEvent): void;

	touchesCancelledWithEvent(touches: NSSet<UITouch>, event: _UIEvent): void;

	touchesEndedWithEvent(touches: NSSet<UITouch>, event: _UIEvent): void;

	touchesEstimatedPropertiesUpdated(touches: NSSet<UITouch>): void;

	touchesMovedWithEvent(touches: NSSet<UITouch>, event: _UIEvent): void;
}

interface UIGestureRecognizerDelegate extends NSObjectProtocol {

	gestureRecognizerShouldBeRequiredToFailByGestureRecognizer?(gestureRecognizer: UIGestureRecognizer, otherGestureRecognizer: UIGestureRecognizer): boolean;

	gestureRecognizerShouldBegin?(gestureRecognizer: UIGestureRecognizer): boolean;

	gestureRecognizerShouldReceiveEvent?(gestureRecognizer: UIGestureRecognizer, event: _UIEvent): boolean;

	gestureRecognizerShouldReceivePress?(gestureRecognizer: UIGestureRecognizer, press: UIPress): boolean;

	gestureRecognizerShouldReceiveTouch?(gestureRecognizer: UIGestureRecognizer, touch: UITouch): boolean;

	gestureRecognizerShouldRecognizeSimultaneouslyWithGestureRecognizer?(gestureRecognizer: UIGestureRecognizer, otherGestureRecognizer: UIGestureRecognizer): boolean;

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

declare function UIGraphicsAddPDFContextDestinationAtPoint(name: string, point: CGPoint): void;

declare function UIGraphicsBeginImageContext(size: CGSize): void;

declare function UIGraphicsBeginImageContextWithOptions(size: CGSize, opaque: boolean, scale: number): void;

declare function UIGraphicsBeginPDFContextToData(data: NSMutableData, bounds: CGRect, documentInfo: NSDictionary<any, any>): void;

declare function UIGraphicsBeginPDFContextToFile(path: string, bounds: CGRect, documentInfo: NSDictionary<any, any>): boolean;

declare function UIGraphicsBeginPDFPage(): void;

declare function UIGraphicsBeginPDFPageWithInfo(bounds: CGRect, pageInfo: NSDictionary<any, any>): void;

declare function UIGraphicsEndImageContext(): void;

declare function UIGraphicsEndPDFContext(): void;

declare function UIGraphicsGetCurrentContext(): any;

declare function UIGraphicsGetImageFromCurrentImageContext(): UIImage;

declare function UIGraphicsGetPDFContextBounds(): CGRect;

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

declare class UIGraphicsImageRendererContext extends UIGraphicsRendererContext {

	static alloc(): UIGraphicsImageRendererContext; // inherited from NSObject

	static new(): UIGraphicsImageRendererContext; // inherited from NSObject

	readonly currentImage: UIImage;
}

declare class UIGraphicsImageRendererFormat extends UIGraphicsRendererFormat {

	static alloc(): UIGraphicsImageRendererFormat; // inherited from NSObject

	static defaultFormat(): UIGraphicsImageRendererFormat; // inherited from UIGraphicsRendererFormat

	static formatForTraitCollection(traitCollection: UITraitCollection): UIGraphicsImageRendererFormat;

	static new(): UIGraphicsImageRendererFormat; // inherited from NSObject

	static preferredFormat(): UIGraphicsImageRendererFormat; // inherited from UIGraphicsRendererFormat

	opaque: boolean;

	preferredRange: UIGraphicsImageRendererFormatRange;

	prefersExtendedRange: boolean;

	scale: number;
}

declare const enum UIGraphicsImageRendererFormatRange {

	Unspecified = -1,

	Automatic = 0,

	Extended = 1,

	Standard = 2
}

declare class UIGraphicsPDFRenderer extends UIGraphicsRenderer {

	static alloc(): UIGraphicsPDFRenderer; // inherited from NSObject

	static new(): UIGraphicsPDFRenderer; // inherited from NSObject

	constructor(o: { bounds: CGRect; format: UIGraphicsPDFRendererFormat; });

	PDFDataWithActions(actions: (p1: UIGraphicsPDFRendererContext) => void): NSData;

	initWithBoundsFormat(bounds: CGRect, format: UIGraphicsPDFRendererFormat): this;

	writePDFToURLWithActionsError(url: NSURL, actions: (p1: UIGraphicsPDFRendererContext) => void): boolean;
}

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

declare class UIGraphicsPDFRendererFormat extends UIGraphicsRendererFormat {

	static alloc(): UIGraphicsPDFRendererFormat; // inherited from NSObject

	static defaultFormat(): UIGraphicsPDFRendererFormat; // inherited from UIGraphicsRendererFormat

	static new(): UIGraphicsPDFRendererFormat; // inherited from NSObject

	static preferredFormat(): UIGraphicsPDFRendererFormat; // inherited from UIGraphicsRendererFormat

	documentInfo: NSDictionary<string, any>;
}

declare function UIGraphicsPopContext(): void;

declare function UIGraphicsPushContext(context: any): void;

declare class UIGraphicsRenderer extends NSObject {

	static alloc(): UIGraphicsRenderer; // inherited from NSObject

	static contextWithFormat(format: UIGraphicsRendererFormat): any;

	static new(): UIGraphicsRenderer; // inherited from NSObject

	static prepareCGContextWithRendererContext(context: any, rendererContext: UIGraphicsRendererContext): void;

	static rendererContextClass(): typeof NSObject;

	readonly allowsImageOutput: boolean;

	readonly format: UIGraphicsRendererFormat;

	constructor(o: { bounds: CGRect; });

	constructor(o: { bounds: CGRect; format: UIGraphicsRendererFormat; });

	initWithBounds(bounds: CGRect): this;

	initWithBoundsFormat(bounds: CGRect, format: UIGraphicsRendererFormat): this;

	runDrawingActionsCompletionActionsError(drawingActions: (p1: UIGraphicsRendererContext) => void, completionActions: (p1: UIGraphicsRendererContext) => void): boolean;
}

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

declare class UIGraphicsRendererFormat extends NSObject implements NSCopying {

	static alloc(): UIGraphicsRendererFormat; // inherited from NSObject

	static defaultFormat(): UIGraphicsRendererFormat;

	static new(): UIGraphicsRendererFormat; // inherited from NSObject

	static preferredFormat(): UIGraphicsRendererFormat;

	readonly bounds: CGRect;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare function UIGraphicsSetPDFContextDestinationForRect(name: string, rect: CGRect): void;

declare function UIGraphicsSetPDFContextURLForRect(url: NSURL, rect: CGRect): void;

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

declare const enum UIGuidedAccessAccessibilityFeature {

	VoiceOver = 1,

	Zoom = 2,

	AssistiveTouch = 4,

	InvertColors = 8,

	GrayscaleDisplay = 16
}

declare function UIGuidedAccessConfigureAccessibilityFeatures(features: UIGuidedAccessAccessibilityFeature, enabled: boolean, completion: (p1: boolean, p2: NSError) => void): void;

declare const enum UIGuidedAccessErrorCode {

	PermissionDenied = 0,

	Failed = 9223372036854775807
}

declare var UIGuidedAccessErrorDomain: string;

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

declare function UIGuidedAccessRestrictionStateForIdentifier(restrictionIdentifier: string): UIGuidedAccessRestrictionState;

declare class UIHoverGestureRecognizer extends UIGestureRecognizer {

	static alloc(): UIHoverGestureRecognizer; // inherited from NSObject

	static new(): UIHoverGestureRecognizer; // inherited from NSObject
}

declare class UIImage extends NSObject implements NSItemProviderReading, NSItemProviderWriting, NSSecureCoding, UIAccessibilityIdentification, UIItemProviderPresentationSizeProviding {

	static alloc(): UIImage; // inherited from NSObject

	static animatedImageNamedDuration(name: string, duration: number): UIImage;

	static animatedImageWithImagesDuration(images: NSArray<UIImage> | UIImage[], duration: number): UIImage;

	static animatedResizableImageNamedCapInsetsDuration(name: string, capInsets: UIEdgeInsets, duration: number): UIImage;

	static animatedResizableImageNamedCapInsetsResizingModeDuration(name: string, capInsets: UIEdgeInsets, resizingMode: UIImageResizingMode, duration: number): UIImage;

	static imageNamed(name: string): UIImage;

	static imageNamedInBundleCompatibleWithTraitCollection(name: string, bundle: NSBundle, traitCollection: UITraitCollection): UIImage;

	static imageNamedInBundleVariableValueWithConfiguration(name: string, bundle: NSBundle, value: number, configuration: UIImageConfiguration): UIImage;

	static imageNamedInBundleWithConfiguration(name: string, bundle: NSBundle, configuration: UIImageConfiguration): UIImage;

	static imageWithCGImage(cgImage: any): UIImage;

	static imageWithCGImageScaleOrientation(cgImage: any, scale: number, orientation: UIImageOrientation): UIImage;

	static imageWithCIImage(ciImage: CIImage): UIImage;

	static imageWithCIImageScaleOrientation(ciImage: CIImage, scale: number, orientation: UIImageOrientation): UIImage;

	static imageWithContentsOfFile(path: string): UIImage;

	static imageWithData(data: NSData): UIImage;

	static imageWithDataScale(data: NSData, scale: number): UIImage;

	static itemProviderVisibilityForRepresentationWithTypeIdentifier(typeIdentifier: string): NSItemProviderRepresentationVisibility;

	static new(): UIImage; // inherited from NSObject

	static objectWithItemProviderDataTypeIdentifierError(data: NSData, typeIdentifier: string): UIImage;

	static systemImageNamed(name: string): UIImage;

	static systemImageNamedCompatibleWithTraitCollection(name: string, traitCollection: UITraitCollection): UIImage;

	static systemImageNamedVariableValueWithConfiguration(name: string, value: number, configuration: UIImageConfiguration): UIImage;

	static systemImageNamedWithConfiguration(name: string, configuration: UIImageConfiguration): UIImage;

	static tns_decodeImageWidthContentsOfFileCompletion(file: string, callback: (p1: UIImage) => void): void;

	static tns_decodeImageWithDataCompletion(data: NSData, callback: (p1: UIImage) => void): void;

	static tns_safeDecodeImageNamedCompletion(name: string, callback: (p1: UIImage) => void): void;

	static tns_safeImageNamed(name: string): UIImage;

	readonly CGImage: any;

	readonly CIImage: CIImage;

	readonly alignmentRectInsets: UIEdgeInsets;

	readonly baselineOffsetFromBottom: number;

	readonly capInsets: UIEdgeInsets;

	readonly configuration: UIImageConfiguration;

	readonly duration: number;

	readonly flipsForRightToLeftLayoutDirection: boolean;

	readonly hasBaseline: boolean;

	readonly imageAsset: UIImageAsset;

	readonly imageOrientation: UIImageOrientation;

	readonly imageRendererFormat: UIGraphicsImageRendererFormat;

	readonly images: NSArray<UIImage>;

	readonly leftCapWidth: number;

	readonly renderingMode: UIImageRenderingMode;

	readonly resizingMode: UIImageResizingMode;

	readonly scale: number;

	readonly size: CGSize;

	readonly symbolConfiguration: UIImageSymbolConfiguration;

	readonly symbolImage: boolean;

	readonly topCapHeight: number;

	readonly traitCollection: UITraitCollection;

	static readonly actionsImage: UIImage;

	static readonly addImage: UIImage;

	static readonly checkmarkImage: UIImage;

	static readonly removeImage: UIImage;

	static readonly strokedCheckmarkImage: UIImage;

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

	constructor(o: { CGImage: any; scale: number; orientation: UIImageOrientation; });

	constructor(o: { CIImage: CIImage; });

	constructor(o: { CIImage: CIImage; scale: number; orientation: UIImageOrientation; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { contentsOfFile: string; });

	constructor(o: { data: NSData; });

	constructor(o: { data: NSData; scale: number; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	drawAsPatternInRect(rect: CGRect): void;

	drawAtPoint(point: CGPoint): void;

	drawAtPointBlendModeAlpha(point: CGPoint, blendMode: CGBlendMode, alpha: number): void;

	drawInRect(rect: CGRect): void;

	drawInRectBlendModeAlpha(rect: CGRect, blendMode: CGBlendMode, alpha: number): void;

	encodeWithCoder(coder: NSCoder): void;

	imageByApplyingSymbolConfiguration(configuration: UIImageSymbolConfiguration): UIImage;

	imageByPreparingForDisplay(): UIImage;

	imageByPreparingThumbnailOfSize(size: CGSize): UIImage;

	imageFlippedForRightToLeftLayoutDirection(): UIImage;

	imageWithAlignmentRectInsets(alignmentInsets: UIEdgeInsets): UIImage;

	imageWithBaselineOffsetFromBottom(baselineOffset: number): UIImage;

	imageWithConfiguration(configuration: UIImageConfiguration): UIImage;

	imageWithHorizontallyFlippedOrientation(): UIImage;

	imageWithRenderingMode(renderingMode: UIImageRenderingMode): UIImage;

	imageWithTintColor(color: UIColor): UIImage;

	imageWithTintColorRenderingMode(color: UIColor, renderingMode: UIImageRenderingMode): UIImage;

	imageWithoutBaseline(): UIImage;

	initWithCGImage(cgImage: any): this;

	initWithCGImageScaleOrientation(cgImage: any, scale: number, orientation: UIImageOrientation): this;

	initWithCIImage(ciImage: CIImage): this;

	initWithCIImageScaleOrientation(ciImage: CIImage, scale: number, orientation: UIImageOrientation): this;

	initWithCoder(coder: NSCoder): this;

	initWithContentsOfFile(path: string): this;

	initWithData(data: NSData): this;

	initWithDataScale(data: NSData, scale: number): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	itemProviderVisibilityForRepresentationWithTypeIdentifier(typeIdentifier: string): NSItemProviderRepresentationVisibility;

	loadDataWithTypeIdentifierForItemProviderCompletionHandler(typeIdentifier: string, completionHandler: (p1: NSData, p2: NSError) => void): NSProgress;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	prepareForDisplayWithCompletionHandler(completionHandler: (p1: UIImage) => void): void;

	prepareThumbnailOfSizeCompletionHandler(size: CGSize, completionHandler: (p1: UIImage) => void): void;

	resizableImageWithCapInsets(capInsets: UIEdgeInsets): UIImage;

	resizableImageWithCapInsetsResizingMode(capInsets: UIEdgeInsets, resizingMode: UIImageResizingMode): UIImage;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	stretchableImageWithLeftCapWidthTopCapHeight(leftCapWidth: number, topCapHeight: number): UIImage;
}

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

declare class UIImageConfiguration extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UIImageConfiguration; // inherited from NSObject

	static new(): UIImageConfiguration; // inherited from NSObject

	readonly traitCollection: UITraitCollection;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	configurationByApplyingConfiguration(otherConfiguration: UIImageConfiguration): this;

	configurationWithTraitCollection(traitCollection: UITraitCollection): this;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

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

declare class UIImagePickerController extends UINavigationController implements NSCoding {

	static alloc(): UIImagePickerController; // inherited from NSObject

	static availableCaptureModesForCameraDevice(cameraDevice: UIImagePickerControllerCameraDevice): NSArray<number>;

	static availableMediaTypesForSourceType(sourceType: UIImagePickerControllerSourceType): NSArray<string>;

	static isCameraDeviceAvailable(cameraDevice: UIImagePickerControllerCameraDevice): boolean;

	static isFlashAvailableForCameraDevice(cameraDevice: UIImagePickerControllerCameraDevice): boolean;

	static isSourceTypeAvailable(sourceType: UIImagePickerControllerSourceType): boolean;

	static new(): UIImagePickerController; // inherited from NSObject

	allowsEditing: boolean;

	allowsImageEditing: boolean;

	cameraCaptureMode: UIImagePickerControllerCameraCaptureMode;

	cameraDevice: UIImagePickerControllerCameraDevice;

	cameraFlashMode: UIImagePickerControllerCameraFlashMode;

	cameraOverlayView: UIView;

	cameraViewTransform: CGAffineTransform;

	delegate: any;

	imageExportPreset: UIImagePickerControllerImageURLExportPreset;

	mediaTypes: NSArray<string>;

	showsCameraControls: boolean;

	sourceType: UIImagePickerControllerSourceType;

	videoExportPreset: string;

	videoMaximumDuration: number;

	videoQuality: UIImagePickerControllerQualityType;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	startVideoCapture(): boolean;

	stopVideoCapture(): void;

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

	imagePickerControllerDidFinishPickingImageEditingInfo?(picker: UIImagePickerController, image: UIImage, editingInfo: NSDictionary<string, any>): void;

	imagePickerControllerDidFinishPickingMediaWithInfo?(picker: UIImagePickerController, info: NSDictionary<string, any>): void;
}
declare var UIImagePickerControllerDelegate: {

	prototype: UIImagePickerControllerDelegate;
};

declare var UIImagePickerControllerEditedImage: string;

declare var UIImagePickerControllerImageURL: string;

declare const enum UIImagePickerControllerImageURLExportPreset {

	Compatible = 0,

	Current = 1
}

declare var UIImagePickerControllerLivePhoto: string;

declare var UIImagePickerControllerMediaMetadata: string;

declare var UIImagePickerControllerMediaType: string;

declare var UIImagePickerControllerMediaURL: string;

declare var UIImagePickerControllerOriginalImage: string;

declare var UIImagePickerControllerPHAsset: string;

declare const enum UIImagePickerControllerQualityType {

	TypeHigh = 0,

	TypeMedium = 1,

	TypeLow = 2,

	Type640x480 = 3,

	TypeIFrame1280x720 = 4,

	TypeIFrame960x540 = 5
}

declare var UIImagePickerControllerReferenceURL: string;

declare const enum UIImagePickerControllerSourceType {

	PhotoLibrary = 0,

	Camera = 1,

	SavedPhotosAlbum = 2
}

declare const enum UIImageRenderingMode {

	Automatic = 0,

	AlwaysOriginal = 1,

	AlwaysTemplate = 2
}

declare const enum UIImageResizingMode {

	Tile = 0,

	Stretch = 1
}

declare class UIImageSymbolConfiguration extends UIImageConfiguration {

	static alloc(): UIImageSymbolConfiguration; // inherited from NSObject

	static configurationPreferringMonochrome(): UIImageSymbolConfiguration;

	static configurationPreferringMulticolor(): UIImageSymbolConfiguration;

	static configurationWithFont(font: UIFont): UIImageSymbolConfiguration;

	static configurationWithFontScale(font: UIFont, scale: UIImageSymbolScale): UIImageSymbolConfiguration;

	static configurationWithHierarchicalColor(hierarchicalColor: UIColor): UIImageSymbolConfiguration;

	static configurationWithPaletteColors(paletteColors: NSArray<UIColor> | UIColor[]): UIImageSymbolConfiguration;

	static configurationWithPointSize(pointSize: number): UIImageSymbolConfiguration;

	static configurationWithPointSizeWeight(pointSize: number, weight: UIImageSymbolWeight): UIImageSymbolConfiguration;

	static configurationWithPointSizeWeightScale(pointSize: number, weight: UIImageSymbolWeight, scale: UIImageSymbolScale): UIImageSymbolConfiguration;

	static configurationWithScale(scale: UIImageSymbolScale): UIImageSymbolConfiguration;

	static configurationWithTextStyle(textStyle: string): UIImageSymbolConfiguration;

	static configurationWithTextStyleScale(textStyle: string, scale: UIImageSymbolScale): UIImageSymbolConfiguration;

	static configurationWithWeight(weight: UIImageSymbolWeight): UIImageSymbolConfiguration;

	static new(): UIImageSymbolConfiguration; // inherited from NSObject

	static readonly unspecifiedConfiguration: UIImageSymbolConfiguration;

	configurationWithoutPointSizeAndWeight(): this;

	configurationWithoutScale(): this;

	configurationWithoutTextStyle(): this;

	configurationWithoutWeight(): this;

	isEqualToConfiguration(otherConfiguration: UIImageSymbolConfiguration): boolean;
}

declare const enum UIImageSymbolScale {

	Default = -1,

	Unspecified = 0,

	Small = 1,

	Medium = 2,

	Large = 3
}

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

declare function UIImageSymbolWeightForFontWeight(fontWeight: number): UIImageSymbolWeight;

declare class UIImageView extends UIView implements UIAccessibilityContentSizeCategoryImageAdjusting {

	static alloc(): UIImageView; // inherited from NSObject

	static appearance(): UIImageView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UIImageView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIImageView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIImageView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIImageView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIImageView; // inherited from UIAppearance

	static new(): UIImageView; // inherited from NSObject

	readonly animating: boolean;

	animationDuration: number;

	animationImages: NSArray<UIImage>;

	animationRepeatCount: number;

	highlighted: boolean;

	highlightedAnimationImages: NSArray<UIImage>;

	highlightedImage: UIImage;

	image: UIImage;

	preferredSymbolConfiguration: UIImageSymbolConfiguration;

	adjustsImageSizeForAccessibilityContentSizeCategory: boolean; // inherited from UIAccessibilityContentSizeCategoryImageAdjusting

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { image: UIImage; });

	constructor(o: { image: UIImage; highlightedImage: UIImage; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithImage(image: UIImage): this;

	initWithImageHighlightedImage(image: UIImage, highlightedImage: UIImage): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	startAnimating(): void;

	stopAnimating(): void;
}

declare function UIImageWriteToSavedPhotosAlbum(image: UIImage, completionTarget: any, completionSelector: string, contextInfo: interop.Pointer | interop.Reference<any>): void;

declare class UIImpactFeedbackGenerator extends UIFeedbackGenerator {

	static alloc(): UIImpactFeedbackGenerator; // inherited from NSObject

	static new(): UIImpactFeedbackGenerator; // inherited from NSObject

	constructor(o: { style: UIImpactFeedbackStyle; });

	impactOccurred(): void;

	impactOccurredWithIntensity(intensity: number): void;

	initWithStyle(style: UIImpactFeedbackStyle): this;
}

declare const enum UIImpactFeedbackStyle {

	Light = 0,

	Medium = 1,

	Heavy = 2,

	Soft = 3,

	Rigid = 4
}

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

interface UIIndirectScribbleInteractionDelegate extends NSObjectProtocol {

	indirectScribbleInteractionDidFinishWritingInElement?(interaction: UIIndirectScribbleInteraction, elementIdentifier: any): void;

	indirectScribbleInteractionFocusElementIfNeededReferencePointCompletion(interaction: UIIndirectScribbleInteraction, elementIdentifier: any, focusReferencePoint: CGPoint, completion: (p1: UIResponder) => void): void;

	indirectScribbleInteractionFrameForElement(interaction: UIIndirectScribbleInteraction, elementIdentifier: any): CGRect;

	indirectScribbleInteractionIsElementFocused(interaction: UIIndirectScribbleInteraction, elementIdentifier: any): boolean;

	indirectScribbleInteractionRequestElementsInRectCompletion(interaction: UIIndirectScribbleInteraction, rect: CGRect, completion: (p1: NSArray<any>) => void): void;

	indirectScribbleInteractionShouldDelayFocusForElement?(interaction: UIIndirectScribbleInteraction, elementIdentifier: any): boolean;

	indirectScribbleInteractionWillBeginWritingInElement?(interaction: UIIndirectScribbleInteraction, elementIdentifier: any): void;
}
declare var UIIndirectScribbleInteractionDelegate: {

	prototype: UIIndirectScribbleInteractionDelegate;
};

declare class UIInputView extends UIView {

	static alloc(): UIInputView; // inherited from NSObject

	static appearance(): UIInputView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UIInputView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIInputView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIInputView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIInputView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIInputView; // inherited from UIAppearance

	static new(): UIInputView; // inherited from NSObject

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

declare class UIInputViewController extends UIViewController implements UITextInputDelegate {

	static alloc(): UIInputViewController; // inherited from NSObject

	static new(): UIInputViewController; // inherited from NSObject

	hasDictationKey: boolean;

	readonly hasFullAccess: boolean;

	inputView: UIInputView;

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

declare const enum UIInputViewStyle {

	Default = 0,

	Keyboard = 1
}

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

interface UIItemProviderPresentationSizeProviding extends NSObjectProtocol {

	preferredPresentationSizeForItemProvider: CGSize;
}
declare var UIItemProviderPresentationSizeProviding: {

	prototype: UIItemProviderPresentationSizeProviding;
};

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

declare class UIKeyCommand extends UICommand {

	static alloc(): UIKeyCommand; // inherited from NSObject

	static commandWithTitleImageActionInputModifierFlagsPropertyList(title: string, image: UIImage, action: string, input: string, modifierFlags: UIKeyModifierFlags, propertyList: any): UIKeyCommand;

	static commandWithTitleImageActionInputModifierFlagsPropertyListAlternates(title: string, image: UIImage, action: string, input: string, modifierFlags: UIKeyModifierFlags, propertyList: any, alternates: NSArray<UICommandAlternate> | UICommandAlternate[]): UIKeyCommand;

	static commandWithTitleImageActionPropertyList(title: string, image: UIImage, action: string, propertyList: any): UIKeyCommand; // inherited from UICommand

	static commandWithTitleImageActionPropertyListAlternates(title: string, image: UIImage, action: string, propertyList: any, alternates: NSArray<UICommandAlternate> | UICommandAlternate[]): UIKeyCommand; // inherited from UICommand

	static keyCommandWithInputModifierFlagsAction(input: string, modifierFlags: UIKeyModifierFlags, action: string): UIKeyCommand;

	static keyCommandWithInputModifierFlagsActionDiscoverabilityTitle(input: string, modifierFlags: UIKeyModifierFlags, action: string, discoverabilityTitle: string): UIKeyCommand;

	static new(): UIKeyCommand; // inherited from NSObject

	allowsAutomaticLocalization: boolean;

	allowsAutomaticMirroring: boolean;

	readonly input: string;

	readonly modifierFlags: UIKeyModifierFlags;

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

declare var UIKeyInputDelete: string;

declare var UIKeyInputDownArrow: string;

declare var UIKeyInputEnd: string;

declare var UIKeyInputEscape: string;

declare var UIKeyInputF1: string;

declare var UIKeyInputF10: string;

declare var UIKeyInputF11: string;

declare var UIKeyInputF12: string;

declare var UIKeyInputF1Var: string;

declare var UIKeyInputF2: string;

declare var UIKeyInputF3: string;

declare var UIKeyInputF4: string;

declare var UIKeyInputF5: string;

declare var UIKeyInputF6: string;

declare var UIKeyInputF7: string;

declare var UIKeyInputF8: string;

declare var UIKeyInputF9: string;

declare var UIKeyInputHome: string;

declare var UIKeyInputLeftArrow: string;

declare var UIKeyInputPageDown: string;

declare var UIKeyInputPageUp: string;

declare var UIKeyInputRightArrow: string;

declare var UIKeyInputUpArrow: string;

declare const enum UIKeyModifierFlags {

	AlphaShift = 65536,

	Shift = 131072,

	Control = 262144,

	Alternate = 524288,

	Command = 1048576,

	NumericPad = 2097152
}

declare var UIKeyboardAnimationCurveUserInfoKey: string;

declare var UIKeyboardAnimationDurationUserInfoKey: string;

declare const enum UIKeyboardAppearance {

	Default = 0,

	Dark = 1,

	Light = 2,

	Alert = 1
}

declare var UIKeyboardBoundsUserInfoKey: string;

declare var UIKeyboardCenterBeginUserInfoKey: string;

declare var UIKeyboardCenterEndUserInfoKey: string;

declare var UIKeyboardDidChangeFrameNotification: string;

declare var UIKeyboardDidHideNotification: string;

declare var UIKeyboardDidShowNotification: string;

declare var UIKeyboardFrameBeginUserInfoKey: string;

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

declare var UIKeyboardIsLocalUserInfoKey: string;

declare class UIKeyboardLayoutGuide extends UITrackingLayoutGuide {

	static alloc(): UIKeyboardLayoutGuide; // inherited from NSObject

	static new(): UIKeyboardLayoutGuide; // inherited from NSObject

	followsUndockedKeyboard: boolean;
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

declare var UIKeyboardWillChangeFrameNotification: string;

declare var UIKeyboardWillHideNotification: string;

declare var UIKeyboardWillShowNotification: string;

declare class UILabel extends UIView implements NSCoding, UIContentSizeCategoryAdjusting {

	static alloc(): UILabel; // inherited from NSObject

	static appearance(): UILabel; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UILabel; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UILabel; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UILabel; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UILabel; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UILabel; // inherited from UIAppearance

	static new(): UILabel; // inherited from NSObject

	adjustsFontSizeToFitWidth: boolean;

	adjustsLetterSpacingToFitWidth: boolean;

	allowsDefaultTighteningForTruncation: boolean;

	attributedText: NSAttributedString;

	baselineAdjustment: UIBaselineAdjustment;

	enabled: boolean;

	font: UIFont;

	highlighted: boolean;

	highlightedTextColor: UIColor;

	lineBreakMode: NSLineBreakMode;

	lineBreakStrategy: NSLineBreakStrategy;

	minimumFontSize: number;

	minimumScaleFactor: number;

	numberOfLines: number;

	preferredMaxLayoutWidth: number;

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

interface UILargeContentViewerInteractionDelegate extends NSObjectProtocol {

	largeContentViewerInteractionDidEndOnItemAtPoint?(interaction: UILargeContentViewerInteraction, item: UILargeContentViewerItem, point: CGPoint): void;

	largeContentViewerInteractionItemAtPoint?(interaction: UILargeContentViewerInteraction, point: CGPoint): UILargeContentViewerItem;

	viewControllerForLargeContentViewerInteraction?(interaction: UILargeContentViewerInteraction): UIViewController;
}
declare var UILargeContentViewerInteractionDelegate: {

	prototype: UILargeContentViewerInteractionDelegate;
};

declare var UILargeContentViewerInteractionEnabledStatusDidChangeNotification: string;

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

declare var UILayoutFittingCompressedSize: CGSize;

declare var UILayoutFittingExpandedSize: CGSize;

declare class UILayoutGuide extends NSObject implements NSCoding, UIPopoverPresentationControllerSourceItem {

	static alloc(): UILayoutGuide; // inherited from NSObject

	static new(): UILayoutGuide; // inherited from NSObject

	readonly bottomAnchor: NSLayoutYAxisAnchor;

	readonly centerXAnchor: NSLayoutXAxisAnchor;

	readonly centerYAnchor: NSLayoutYAxisAnchor;

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

	constraintsAffectingLayoutForAxis(axis: UILayoutConstraintAxis): NSArray<NSLayoutConstraint>;

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

interface UILayoutGuideAspectFitting extends NSObjectProtocol {

	aspectRatio: number;
}
declare var UILayoutGuideAspectFitting: {

	prototype: UILayoutGuideAspectFitting;
};

declare var UILayoutPriorityDefaultHigh: number;

declare var UILayoutPriorityDefaultLow: number;

declare var UILayoutPriorityDragThatCanResizeScene: number;

declare var UILayoutPriorityDragThatCannotResizeScene: number;

declare var UILayoutPriorityFittingSizeLevel: number;

declare var UILayoutPriorityRequired: number;

declare var UILayoutPrioritySceneSizeStayPut: number;

interface UILayoutSupport extends NSObjectProtocol {

	bottomAnchor: NSLayoutYAxisAnchor;

	heightAnchor: NSLayoutDimension;

	length: number;

	topAnchor: NSLayoutYAxisAnchor;
}
declare var UILayoutSupport: {

	prototype: UILayoutSupport;
};

declare const enum UILegibilityWeight {

	Unspecified = -1,

	Regular = 0,

	Bold = 1
}

declare class UILexicon extends NSObject implements NSCopying {

	static alloc(): UILexicon; // inherited from NSObject

	static new(): UILexicon; // inherited from NSObject

	readonly entries: NSArray<UILexiconEntry>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class UILexiconEntry extends NSObject implements NSCopying {

	static alloc(): UILexiconEntry; // inherited from NSObject

	static new(): UILexiconEntry; // inherited from NSObject

	readonly documentText: string;

	readonly userInput: string;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare const enum UILineBreakMode {

	WordWrap = 0,

	CharacterWrap = 1,

	Clip = 2,

	HeadTruncation = 3,

	TailTruncation = 4,

	MiddleTruncation = 5
}

declare class UIListContentConfiguration extends NSObject implements NSSecureCoding, UIContentConfiguration {

	static accompaniedSidebarCellConfiguration(): UIListContentConfiguration;

	static accompaniedSidebarSubtitleCellConfiguration(): UIListContentConfiguration;

	static alloc(): UIListContentConfiguration; // inherited from NSObject

	static cellConfiguration(): UIListContentConfiguration;

	static extraProminentInsetGroupedHeaderConfiguration(): UIListContentConfiguration;

	static groupedFooterConfiguration(): UIListContentConfiguration;

	static groupedHeaderConfiguration(): UIListContentConfiguration;

	static new(): UIListContentConfiguration; // inherited from NSObject

	static plainFooterConfiguration(): UIListContentConfiguration;

	static plainHeaderConfiguration(): UIListContentConfiguration;

	static prominentInsetGroupedHeaderConfiguration(): UIListContentConfiguration;

	static sidebarCellConfiguration(): UIListContentConfiguration;

	static sidebarHeaderConfiguration(): UIListContentConfiguration;

	static sidebarSubtitleCellConfiguration(): UIListContentConfiguration;

	static subtitleCellConfiguration(): UIListContentConfiguration;

	static valueCellConfiguration(): UIListContentConfiguration;

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

	makeContentView(): UIView;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	updatedConfigurationForState(state: UIConfigurationState): this;
}

declare class UIListContentImageProperties extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UIListContentImageProperties; // inherited from NSObject

	static new(): UIListContentImageProperties; // inherited from NSObject

	accessibilityIgnoresInvertColors: boolean;

	cornerRadius: number;

	maximumSize: CGSize;

	preferredSymbolConfiguration: UIImageSymbolConfiguration;

	reservedLayoutSize: CGSize;

	tintColor: UIColor;

	tintColorTransformer: (p1: UIColor) => UIColor;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	resolvedTintColorForTintColor(tintColor: UIColor): UIColor;
}

declare var UIListContentImageStandardDimension: number;

declare const enum UIListContentTextAlignment {

	Natural = 0,

	Center = 1,

	Justified = 2
}

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

declare const enum UIListContentTextTransform {

	None = 0,

	Uppercase = 1,

	Lowercase = 2,

	Capitalized = 3
}

declare class UIListContentView extends UIView implements UIContentView {

	static alloc(): UIListContentView; // inherited from NSObject

	static appearance(): UIListContentView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UIListContentView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIListContentView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIListContentView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIListContentView; // inherited from UIAppearance

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

	supportsConfiguration(configuration: UIContentConfiguration): boolean;
}

declare var UIListSeparatorAutomaticInsets: NSDirectionalEdgeInsets;

declare class UIListSeparatorConfiguration extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UIListSeparatorConfiguration; // inherited from NSObject

	static new(): UIListSeparatorConfiguration; // inherited from NSObject

	bottomSeparatorInsets: NSDirectionalEdgeInsets;

	bottomSeparatorVisibility: UIListSeparatorVisibility;

	color: UIColor;

	multipleSelectionColor: UIColor;

	topSeparatorInsets: NSDirectionalEdgeInsets;

	topSeparatorVisibility: UIListSeparatorVisibility;

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

declare class UILocalNotification extends NSObject implements NSCoding, NSCopying {

	static alloc(): UILocalNotification; // inherited from NSObject

	static new(): UILocalNotification; // inherited from NSObject

	alertAction: string;

	alertBody: string;

	alertLaunchImage: string;

	alertTitle: string;

	applicationIconBadgeNumber: number;

	category: string;

	fireDate: Date;

	hasAction: boolean;

	region: CLRegion;

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

declare var UILocalNotificationDefaultSoundName: string;

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

declare class UILongPressGestureRecognizer extends UIGestureRecognizer {

	static alloc(): UILongPressGestureRecognizer; // inherited from NSObject

	static new(): UILongPressGestureRecognizer; // inherited from NSObject

	allowableMovement: number;

	minimumPressDuration: number;

	numberOfTapsRequired: number;

	numberOfTouchesRequired: number;
}

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

declare class UIMarkupTextPrintFormatter extends UIPrintFormatter {

	static alloc(): UIMarkupTextPrintFormatter; // inherited from NSObject

	static new(): UIMarkupTextPrintFormatter; // inherited from NSObject

	markupText: string;

	constructor(o: { markupText: string; });

	initWithMarkupText(markupText: string): this;
}

declare class UIMenu extends UIMenuElement {

	static alloc(): UIMenu; // inherited from NSObject

	static menuWithChildren(children: NSArray<UIMenuElement> | UIMenuElement[]): UIMenu;

	static menuWithTitleChildren(title: string, children: NSArray<UIMenuElement> | UIMenuElement[]): UIMenu;

	static menuWithTitleImageIdentifierOptionsChildren(title: string, image: UIImage, identifier: string, options: UIMenuOptions, children: NSArray<UIMenuElement> | UIMenuElement[]): UIMenu;

	static new(): UIMenu; // inherited from NSObject

	readonly children: NSArray<UIMenuElement>;

	readonly identifier: string;

	readonly options: UIMenuOptions;

	preferredElementSize: UIMenuElementSize;

	readonly selectedElements: NSArray<UIMenuElement>;

	menuByReplacingChildren(newChildren: NSArray<UIMenuElement> | UIMenuElement[]): UIMenu;
}

declare var UIMenuAbout: string;

declare var UIMenuAlignment: string;

declare var UIMenuApplication: string;

declare var UIMenuBringAllToFront: string;

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

declare var UIMenuClose: string;

declare class UIMenuController extends NSObject {

	static alloc(): UIMenuController; // inherited from NSObject

	static new(): UIMenuController; // inherited from NSObject

	arrowDirection: UIMenuControllerArrowDirection;

	readonly menuFrame: CGRect;

	menuItems: NSArray<UIMenuItem>;

	menuVisible: boolean;

	static readonly sharedMenuController: UIMenuController;

	hideMenu(): void;

	hideMenuFromView(targetView: UIView): void;

	setMenuVisible(menuVisible: boolean): void;

	setMenuVisibleAnimated(menuVisible: boolean, animated: boolean): void;

	setTargetRectInView(targetRect: CGRect, targetView: UIView): void;

	showMenuFromViewRect(targetView: UIView, targetRect: CGRect): void;

	update(): void;
}

declare const enum UIMenuControllerArrowDirection {

	Default = 0,

	Up = 1,

	Down = 2,

	Left = 3,

	Right = 4
}

declare var UIMenuControllerDidHideMenuNotification: string;

declare var UIMenuControllerDidShowMenuNotification: string;

declare var UIMenuControllerMenuFrameDidChangeNotification: string;

declare var UIMenuControllerWillHideMenuNotification: string;

declare var UIMenuControllerWillShowMenuNotification: string;

declare var UIMenuDocument: string;

declare var UIMenuEdit: string;

declare class UIMenuElement extends NSObject implements NSCopying, NSSecureCoding, UIAccessibilityIdentification {

	static alloc(): UIMenuElement; // inherited from NSObject

	static new(): UIMenuElement; // inherited from NSObject

	readonly image: UIImage;

	subtitle: string;

	readonly title: string;

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

declare const enum UIMenuElementAttributes {

	Disabled = 1,

	Destructive = 2,

	Hidden = 4,

	KeepsMenuPresented = 8
}

declare const enum UIMenuElementSize {

	Small = 0,

	Medium = 1,

	Large = 2
}

declare const enum UIMenuElementState {

	Off = 0,

	On = 1,

	Mixed = 2
}

declare var UIMenuFile: string;

declare var UIMenuFind: string;

declare var UIMenuFont: string;

declare var UIMenuFormat: string;

declare var UIMenuFullscreen: string;

declare var UIMenuHelp: string;

declare var UIMenuHide: string;

declare class UIMenuItem extends NSObject {

	static alloc(): UIMenuItem; // inherited from NSObject

	static new(): UIMenuItem; // inherited from NSObject

	action: string;

	title: string;

	constructor(o: { title: string; action: string; });

	initWithTitleAction(title: string, action: string): this;
}

interface UIMenuLeaf extends NSObjectProtocol {

	attributes: UIMenuElementAttributes;

	discoverabilityTitle: string;

	image: UIImage;

	presentationSourceItem: UIPopoverPresentationControllerSourceItem;

	sender: any;

	state: UIMenuElementState;

	title: string;

	performWithSenderTarget(sender: any, target: any): void;
}
declare var UIMenuLeaf: {

	prototype: UIMenuLeaf;
};

declare var UIMenuLearn: string;

declare var UIMenuLookup: string;

declare var UIMenuMinimizeAndZoom: string;

declare var UIMenuNewScene: string;

declare var UIMenuOpenRecent: string;

declare const enum UIMenuOptions {

	DisplayInline = 1,

	Destructive = 2,

	SingleSelection = 32
}

declare var UIMenuPreferences: string;

declare var UIMenuPrint: string;

declare var UIMenuQuit: string;

declare var UIMenuReplace: string;

declare var UIMenuRoot: string;

declare var UIMenuServices: string;

declare var UIMenuShare: string;

declare var UIMenuSidebar: string;

declare var UIMenuSpeech: string;

declare var UIMenuSpelling: string;

declare var UIMenuSpellingOptions: string;

declare var UIMenuSpellingPanel: string;

declare var UIMenuStandardEdit: string;

declare var UIMenuSubstitutionOptions: string;

declare var UIMenuSubstitutions: string;

declare var UIMenuSubstitutionsPanel: string;

declare class UIMenuSystem extends NSObject {

	static alloc(): UIMenuSystem; // inherited from NSObject

	static new(): UIMenuSystem; // inherited from NSObject

	static readonly contextSystem: UIMenuSystem;

	static readonly mainSystem: UIMenuSystem;

	setNeedsRebuild(): void;

	setNeedsRevalidate(): void;
}

declare var UIMenuText: string;

declare var UIMenuTextColor: string;

declare var UIMenuTextSize: string;

declare var UIMenuTextStyle: string;

declare var UIMenuTextStylePasteboard: string;

declare var UIMenuToolbar: string;

declare var UIMenuTransformations: string;

declare var UIMenuUndoRedo: string;

declare var UIMenuView: string;

declare var UIMenuWindow: string;

declare var UIMenuWritingDirection: string;

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

declare class UIMotionEffect extends NSObject implements NSCoding, NSCopying {

	static alloc(): UIMotionEffect; // inherited from NSObject

	static new(): UIMotionEffect; // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	keyPathsAndRelativeValuesForViewerOffset(viewerOffset: UIOffset): NSDictionary<string, any>;
}

declare class UIMotionEffectGroup extends UIMotionEffect {

	static alloc(): UIMotionEffectGroup; // inherited from NSObject

	static new(): UIMotionEffectGroup; // inherited from NSObject

	motionEffects: NSArray<UIMotionEffect>;
}

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

declare class UIMutableUserNotificationAction extends UIUserNotificationAction {

	static alloc(): UIMutableUserNotificationAction; // inherited from NSObject

	static new(): UIMutableUserNotificationAction; // inherited from NSObject

	activationMode: UIUserNotificationActivationMode;

	authenticationRequired: boolean;

	behavior: UIUserNotificationActionBehavior;

	destructive: boolean;

	identifier: string;

	parameters: NSDictionary<any, any>;

	title: string;
}

declare class UIMutableUserNotificationCategory extends UIUserNotificationCategory {

	static alloc(): UIMutableUserNotificationCategory; // inherited from NSObject

	static new(): UIMutableUserNotificationCategory; // inherited from NSObject

	identifier: string;

	setActionsForContext(actions: NSArray<UIUserNotificationAction> | UIUserNotificationAction[], context: UIUserNotificationActionContext): void;
}

declare const enum UINSToolbarItemPresentationSize {

	Unspecified = -1,

	Regular = 0,

	Small = 1,

	Large = 3
}

declare class UINavigationBar extends UIView implements NSCoding, UIBarPositioning {

	static alloc(): UINavigationBar; // inherited from NSObject

	static appearance(): UINavigationBar; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UINavigationBar; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UINavigationBar; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UINavigationBar; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UINavigationBar; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UINavigationBar; // inherited from UIAppearance

	static new(): UINavigationBar; // inherited from NSObject

	backIndicatorImage: UIImage;

	backIndicatorTransitionMaskImage: UIImage;

	readonly backItem: UINavigationItem;

	barStyle: UIBarStyle;

	barTintColor: UIColor;

	readonly behavioralStyle: UIBehavioralStyle;

	compactAppearance: UINavigationBarAppearance;

	compactScrollEdgeAppearance: UINavigationBarAppearance;

	readonly currentNSToolbarSection: UINavigationBarNSToolbarSection;

	delegate: UINavigationBarDelegate;

	items: NSArray<UINavigationItem>;

	largeTitleTextAttributes: NSDictionary<string, any>;

	preferredBehavioralStyle: UIBehavioralStyle;

	prefersLargeTitles: boolean;

	scrollEdgeAppearance: UINavigationBarAppearance;

	shadowImage: UIImage;

	standardAppearance: UINavigationBarAppearance;

	titleTextAttributes: NSDictionary<string, any>;

	readonly topItem: UINavigationItem;

	translucent: boolean;

	readonly barPosition: UIBarPosition; // inherited from UIBarPositioning

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	backgroundImageForBarMetrics(barMetrics: UIBarMetrics): UIImage;

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

	setBackgroundImageForBarMetrics(backgroundImage: UIImage, barMetrics: UIBarMetrics): void;

	setBackgroundImageForBarPositionBarMetrics(backgroundImage: UIImage, barPosition: UIBarPosition, barMetrics: UIBarMetrics): void;

	setItemsAnimated(items: NSArray<UINavigationItem> | UINavigationItem[], animated: boolean): void;

	setTitleVerticalPositionAdjustmentForBarMetrics(adjustment: number, barMetrics: UIBarMetrics): void;

	titleVerticalPositionAdjustmentForBarMetrics(barMetrics: UIBarMetrics): number;
}

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

declare const enum UINavigationBarNSToolbarSection {

	None = 0,

	Sidebar = 1,

	Supplementary = 2,

	Content = 3
}

declare class UINavigationController extends UIViewController {

	static alloc(): UINavigationController; // inherited from NSObject

	static new(): UINavigationController; // inherited from NSObject

	readonly barHideOnSwipeGestureRecognizer: UIPanGestureRecognizer;

	readonly barHideOnTapGestureRecognizer: UITapGestureRecognizer;

	delegate: UINavigationControllerDelegate;

	hidesBarsOnSwipe: boolean;

	hidesBarsOnTap: boolean;

	hidesBarsWhenKeyboardAppears: boolean;

	hidesBarsWhenVerticallyCompact: boolean;

	readonly interactivePopGestureRecognizer: UIGestureRecognizer;

	readonly navigationBar: UINavigationBar;

	navigationBarHidden: boolean;

	readonly toolbar: UIToolbar;

	toolbarHidden: boolean;

	readonly topViewController: UIViewController;

	viewControllers: NSArray<UIViewController>;

	readonly visibleViewController: UIViewController;

	constructor(o: { navigationBarClass: typeof NSObject; toolbarClass: typeof NSObject; });

	constructor(o: { rootViewController: UIViewController; });

	initWithNavigationBarClassToolbarClass(navigationBarClass: typeof NSObject, toolbarClass: typeof NSObject): this;

	initWithRootViewController(rootViewController: UIViewController): this;

	popToRootViewControllerAnimated(animated: boolean): NSArray<UIViewController>;

	popToViewControllerAnimated(viewController: UIViewController, animated: boolean): NSArray<UIViewController>;

	popViewControllerAnimated(animated: boolean): UIViewController;

	pushViewControllerAnimated(viewController: UIViewController, animated: boolean): void;

	setNavigationBarHiddenAnimated(hidden: boolean, animated: boolean): void;

	setToolbarHiddenAnimated(hidden: boolean, animated: boolean): void;

	setViewControllersAnimated(viewControllers: NSArray<UIViewController> | UIViewController[], animated: boolean): void;
}

interface UINavigationControllerDelegate extends NSObjectProtocol {

	navigationControllerAnimationControllerForOperationFromViewControllerToViewController?(navigationController: UINavigationController, operation: UINavigationControllerOperation, fromVC: UIViewController, toVC: UIViewController): UIViewControllerAnimatedTransitioning;

	navigationControllerDidShowViewControllerAnimated?(navigationController: UINavigationController, viewController: UIViewController, animated: boolean): void;

	navigationControllerInteractionControllerForAnimationController?(navigationController: UINavigationController, animationController: UIViewControllerAnimatedTransitioning): UIViewControllerInteractiveTransitioning;

	navigationControllerPreferredInterfaceOrientationForPresentation?(navigationController: UINavigationController): UIInterfaceOrientation;

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

declare class UINavigationItem extends NSObject implements NSCoding {

	static alloc(): UINavigationItem; // inherited from NSObject

	static new(): UINavigationItem; // inherited from NSObject

	additionalOverflowItems: UIDeferredMenuElement;

	backAction: UIAction;

	backBarButtonItem: UIBarButtonItem;

	backButtonDisplayMode: UINavigationItemBackButtonDisplayMode;

	backButtonTitle: string;

	centerItemGroups: NSArray<UIBarButtonItemGroup>;

	compactAppearance: UINavigationBarAppearance;

	compactScrollEdgeAppearance: UINavigationBarAppearance;

	customizationIdentifier: string;

	documentProperties: UIDocumentProperties;

	hidesBackButton: boolean;

	hidesSearchBarWhenScrolling: boolean;

	largeTitleDisplayMode: UINavigationItemLargeTitleDisplayMode;

	leadingItemGroups: NSArray<UIBarButtonItemGroup>;

	leftBarButtonItem: UIBarButtonItem;

	leftBarButtonItems: NSArray<UIBarButtonItem>;

	leftItemsSupplementBackButton: boolean;

	preferredSearchBarPlacement: UINavigationItemSearchBarPlacement;

	prompt: string;

	renameDelegate: UINavigationItemRenameDelegate;

	rightBarButtonItem: UIBarButtonItem;

	rightBarButtonItems: NSArray<UIBarButtonItem>;

	scrollEdgeAppearance: UINavigationBarAppearance;

	readonly searchBarPlacement: UINavigationItemSearchBarPlacement;

	searchController: UISearchController;

	standardAppearance: UINavigationBarAppearance;

	style: UINavigationItemStyle;

	title: string;

	titleMenuProvider: (p1: NSArray<UIMenuElement>) => UIMenu;

	titleView: UIView;

	trailingItemGroups: NSArray<UIBarButtonItemGroup>;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { title: string; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTitle(title: string): this;

	setHidesBackButtonAnimated(hidesBackButton: boolean, animated: boolean): void;

	setLeftBarButtonItemAnimated(item: UIBarButtonItem, animated: boolean): void;

	setLeftBarButtonItemsAnimated(items: NSArray<UIBarButtonItem> | UIBarButtonItem[], animated: boolean): void;

	setRightBarButtonItemAnimated(item: UIBarButtonItem, animated: boolean): void;

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

	Never = 2
}

interface UINavigationItemRenameDelegate extends NSObjectProtocol {

	navigationItemDidEndRenamingWithTitle(navigationItem: UINavigationItem, title: string): void;

	navigationItemShouldBeginRenaming?(navigationItem: UINavigationItem): boolean;

	navigationItemShouldEndRenamingWithTitle?(navigationItem: UINavigationItem, title: string): boolean;

	navigationItemWillBeginRenamingWithSuggestedTitleSelectedRange?(navigationItem: UINavigationItem, title: string, selectedRange: interop.Pointer | interop.Reference<NSRange>): string;
}
declare var UINavigationItemRenameDelegate: {

	prototype: UINavigationItemRenameDelegate;
};

declare const enum UINavigationItemSearchBarPlacement {

	Automatic = 0,

	Inline = 1,

	Stacked = 2
}

declare const enum UINavigationItemStyle {

	Navigator = 0,

	Browser = 1,

	Editor = 2
}

declare class UINib extends NSObject {

	static alloc(): UINib; // inherited from NSObject

	static new(): UINib; // inherited from NSObject

	static nibWithDataBundle(data: NSData, bundleOrNil: NSBundle): UINib;

	static nibWithNibNameBundle(name: string, bundleOrNil: NSBundle): UINib;

	instantiateWithOwnerOptions(ownerOrNil: any, optionsOrNil: NSDictionary<string, any>): NSArray<any>;
}

declare var UINibExternalObjects: string;

declare var UINibProxiedObjectsKey: string;

declare class UINotificationFeedbackGenerator extends UIFeedbackGenerator {

	static alloc(): UINotificationFeedbackGenerator; // inherited from NSObject

	static new(): UINotificationFeedbackGenerator; // inherited from NSObject

	notificationOccurred(notificationType: UINotificationFeedbackType): void;
}

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

interface UIOffset {
	horizontal: number;
	vertical: number;
}
declare var UIOffset: interop.StructType<UIOffset>;

declare function UIOffsetFromString(string: string): UIOffset;

declare var UIOffsetZero: UIOffset;

declare class UIOpenURLContext extends NSObject {

	static alloc(): UIOpenURLContext; // inherited from NSObject

	static new(): UIOpenURLContext; // inherited from NSObject

	readonly URL: NSURL;

	readonly options: UISceneOpenURLOptions;
}

declare class UIPageControl extends UIControl {

	static alloc(): UIPageControl; // inherited from NSObject

	static appearance(): UIPageControl; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UIPageControl; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIPageControl; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIPageControl; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIPageControl; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIPageControl; // inherited from UIAppearance

	static new(): UIPageControl; // inherited from NSObject

	allowsContinuousInteraction: boolean;

	backgroundStyle: UIPageControlBackgroundStyle;

	currentPage: number;

	currentPageIndicatorTintColor: UIColor;

	defersCurrentPageDisplay: boolean;

	direction: UIPageControlDirection;

	hidesForSinglePage: boolean;

	readonly interactionState: UIPageControlInteractionState;

	numberOfPages: number;

	pageIndicatorTintColor: UIColor;

	preferredCurrentPageIndicatorImage: UIImage;

	preferredIndicatorImage: UIImage;

	currentPageIndicatorImageForPage(page: number): UIImage;

	indicatorImageForPage(page: number): UIImage;

	setCurrentPageIndicatorImageForPage(image: UIImage, page: number): void;

	setIndicatorImageForPage(image: UIImage, page: number): void;

	sizeForNumberOfPages(pageCount: number): CGSize;

	updateCurrentPageDisplay(): void;
}

declare const enum UIPageControlBackgroundStyle {

	Automatic = 0,

	Prominent = 1,

	Minimal = 2
}

declare const enum UIPageControlDirection {

	Natural = 0,

	LeftToRight = 1,

	RightToLeft = 2,

	TopToBottom = 3,

	BottomToTop = 4
}

declare const enum UIPageControlInteractionState {

	None = 0,

	Discrete = 1,

	Continuous = 2
}

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

	presentationCountForPageViewController?(pageViewController: UIPageViewController): number;

	presentationIndexForPageViewController?(pageViewController: UIPageViewController): number;
}
declare var UIPageViewControllerDataSource: {

	prototype: UIPageViewControllerDataSource;
};

interface UIPageViewControllerDelegate extends NSObjectProtocol {

	pageViewControllerDidFinishAnimatingPreviousViewControllersTransitionCompleted?(pageViewController: UIPageViewController, finished: boolean, previousViewControllers: NSArray<UIViewController> | UIViewController[], completed: boolean): void;

	pageViewControllerPreferredInterfaceOrientationForPresentation?(pageViewController: UIPageViewController): UIInterfaceOrientation;

	pageViewControllerSpineLocationForInterfaceOrientation?(pageViewController: UIPageViewController, orientation: UIInterfaceOrientation): UIPageViewControllerSpineLocation;

	pageViewControllerSupportedInterfaceOrientations?(pageViewController: UIPageViewController): UIInterfaceOrientationMask;

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

declare class UIPanGestureRecognizer extends UIGestureRecognizer {

	static alloc(): UIPanGestureRecognizer; // inherited from NSObject

	static new(): UIPanGestureRecognizer; // inherited from NSObject

	allowedScrollTypesMask: UIScrollTypeMask;

	maximumNumberOfTouches: number;

	minimumNumberOfTouches: number;

	setTranslationInView(translation: CGPoint, view: UIView): void;

	translationInView(view: UIView): CGPoint;

	velocityInView(view: UIView): CGPoint;
}

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

interface UIPasteConfigurationSupporting extends NSObjectProtocol {

	pasteConfiguration: UIPasteConfiguration;

	canPasteItemProviders?(itemProviders: NSArray<NSItemProvider> | NSItemProvider[]): boolean;

	pasteItemProviders?(itemProviders: NSArray<NSItemProvider> | NSItemProvider[]): void;
}
declare var UIPasteConfigurationSupporting: {

	prototype: UIPasteConfigurationSupporting;
};

declare class UIPasteControl extends UIControl {

	static alloc(): UIPasteControl; // inherited from NSObject

	static appearance(): UIPasteControl; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UIPasteControl; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIPasteControl; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIPasteControl; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIPasteControl; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIPasteControl; // inherited from UIAppearance

	static new(): UIPasteControl; // inherited from NSObject

	readonly configuration: UIPasteControlConfiguration;

	target: UIPasteConfigurationSupporting;

	constructor(o: { configuration: UIPasteControlConfiguration; });

	initWithConfiguration(configuration: UIPasteControlConfiguration): this;
}

declare class UIPasteControlConfiguration extends NSObject implements NSSecureCoding {

	static alloc(): UIPasteControlConfiguration; // inherited from NSObject

	static new(): UIPasteControlConfiguration; // inherited from NSObject

	baseBackgroundColor: UIColor;

	baseForegroundColor: UIColor;

	cornerRadius: number;

	cornerStyle: UIButtonConfigurationCornerStyle;

	displayMode: UIPasteControlDisplayMode;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum UIPasteControlDisplayMode {

	IconAndLabel = 0,

	IconOnly = 1,

	LabelOnly = 2
}

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

	readonly hasColors: boolean;

	readonly hasImages: boolean;

	readonly hasStrings: boolean;

	readonly hasURLs: boolean;

	image: UIImage;

	images: NSArray<UIImage>;

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

	detectPatternsForPatternsCompletionHandler(patterns: NSSet<string>, completionHandler: (p1: NSSet<string>, p2: NSError) => void): void;

	detectPatternsForPatternsInItemSetCompletionHandler(patterns: NSSet<string>, itemSet: NSIndexSet, completionHandler: (p1: NSArray<NSSet<string>>, p2: NSError) => void): void;

	detectValuesForPatternsCompletionHandler(patterns: NSSet<string>, completionHandler: (p1: NSDictionary<string, any>, p2: NSError) => void): void;

	detectValuesForPatternsInItemSetCompletionHandler(patterns: NSSet<string>, itemSet: NSIndexSet, completionHandler: (p1: NSArray<NSDictionary<string, any>>, p2: NSError) => void): void;

	itemSetWithPasteboardTypes(pasteboardTypes: NSArray<string> | string[]): NSIndexSet;

	pasteboardTypesForItemSet(itemSet: NSIndexSet): NSArray<NSArray<string>>;

	setDataForPasteboardType(data: NSData, pasteboardType: string): void;

	setItemProvidersLocalOnlyExpirationDate(itemProviders: NSArray<NSItemProvider> | NSItemProvider[], localOnly: boolean, expirationDate: Date): void;

	setItemsOptions(items: NSArray<NSDictionary<string, any>> | NSDictionary<string, any>[], options: NSDictionary<string, any>): void;

	setObjects(objects: NSArray<NSItemProviderWriting> | NSItemProviderWriting[]): void;

	setObjectsLocalOnlyExpirationDate(objects: NSArray<NSItemProviderWriting> | NSItemProviderWriting[], localOnly: boolean, expirationDate: Date): void;

	setPersistent(persistent: boolean): void;

	setValueForPasteboardType(value: any, pasteboardType: string): void;

	valueForPasteboardType(pasteboardType: string): any;

	valuesForPasteboardTypeInItemSet(pasteboardType: string, itemSet: NSIndexSet): NSArray<any>;
}

declare var UIPasteboardChangedNotification: string;

declare var UIPasteboardChangedTypesAddedKey: string;

declare var UIPasteboardChangedTypesRemovedKey: string;

declare var UIPasteboardDetectionPatternCalendarEvent: string;

declare var UIPasteboardDetectionPatternEmailAddress: string;

declare var UIPasteboardDetectionPatternFlightNumber: string;

declare var UIPasteboardDetectionPatternLink: string;

declare var UIPasteboardDetectionPatternMoneyAmount: string;

declare var UIPasteboardDetectionPatternNumber: string;

declare var UIPasteboardDetectionPatternPhoneNumber: string;

declare var UIPasteboardDetectionPatternPostalAddress: string;

declare var UIPasteboardDetectionPatternProbableWebSearch: string;

declare var UIPasteboardDetectionPatternProbableWebURL: string;

declare var UIPasteboardDetectionPatternShipmentTrackingNumber: string;

declare var UIPasteboardNameFind: string;

declare var UIPasteboardNameGeneral: string;

declare var UIPasteboardOptionExpirationDate: string;

declare var UIPasteboardOptionLocalOnly: string;

declare var UIPasteboardRemovedNotification: string;

declare var UIPasteboardTypeAutomatic: string;

declare var UIPasteboardTypeListColor: NSArray<string>;

declare var UIPasteboardTypeListImage: NSArray<string>;

declare var UIPasteboardTypeListString: NSArray<string>;

declare var UIPasteboardTypeListURL: NSArray<string>;

declare class UIPencilInteraction extends NSObject implements UIInteraction {

	static alloc(): UIPencilInteraction; // inherited from NSObject

	static new(): UIPencilInteraction; // inherited from NSObject

	delegate: UIPencilInteractionDelegate;

	enabled: boolean;

	static readonly preferredTapAction: UIPencilPreferredAction;

	static readonly prefersPencilOnlyDrawing: boolean;

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

interface UIPencilInteractionDelegate extends NSObjectProtocol {

	pencilInteractionDidTap?(interaction: UIPencilInteraction): void;
}
declare var UIPencilInteractionDelegate: {

	prototype: UIPencilInteractionDelegate;
};

declare const enum UIPencilPreferredAction {

	Ignore = 0,

	SwitchEraser = 1,

	SwitchPrevious = 2,

	ShowColorPalette = 3,

	ShowInkAttributes = 4
}

declare class UIPercentDrivenInteractiveTransition extends NSObject implements UIViewControllerInteractiveTransitioning {

	static alloc(): UIPercentDrivenInteractiveTransition; // inherited from NSObject

	static new(): UIPercentDrivenInteractiveTransition; // inherited from NSObject

	completionCurve: UIViewAnimationCurve;

	completionSpeed: number;

	readonly duration: number;

	readonly percentComplete: number;

	timingCurve: UITimingCurveProvider;

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

declare class UIPickerView extends UIView implements NSCoding {

	static alloc(): UIPickerView; // inherited from NSObject

	static appearance(): UIPickerView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UIPickerView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIPickerView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIPickerView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIPickerView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIPickerView; // inherited from UIAppearance

	static new(): UIPickerView; // inherited from NSObject

	dataSource: UIPickerViewDataSource;

	delegate: UIPickerViewDelegate;

	readonly numberOfComponents: number;

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

	pickerViewAccessibilityAttributedHintForComponent?(pickerView: UIPickerView, component: number): NSAttributedString;

	pickerViewAccessibilityAttributedLabelForComponent?(pickerView: UIPickerView, component: number): NSAttributedString;

	pickerViewAccessibilityAttributedUserInputLabelsForComponent?(pickerView: UIPickerView, component: number): NSArray<NSAttributedString>;

	pickerViewAccessibilityHintForComponent?(pickerView: UIPickerView, component: number): string;

	pickerViewAccessibilityLabelForComponent?(pickerView: UIPickerView, component: number): string;

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

declare class UIPinchGestureRecognizer extends UIGestureRecognizer {

	static alloc(): UIPinchGestureRecognizer; // inherited from NSObject

	static new(): UIPinchGestureRecognizer; // inherited from NSObject

	scale: number;

	readonly velocity: number;
}

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

declare var UIPointerAccessoryPositionBottom: UIPointerAccessoryPosition;

declare var UIPointerAccessoryPositionBottomLeft: UIPointerAccessoryPosition;

declare var UIPointerAccessoryPositionBottomRight: UIPointerAccessoryPosition;

declare var UIPointerAccessoryPositionLeft: UIPointerAccessoryPosition;

declare var UIPointerAccessoryPositionRight: UIPointerAccessoryPosition;

declare var UIPointerAccessoryPositionTop: UIPointerAccessoryPosition;

declare var UIPointerAccessoryPositionTopLeft: UIPointerAccessoryPosition;

declare var UIPointerAccessoryPositionTopRight: UIPointerAccessoryPosition;

declare class UIPointerEffect extends NSObject implements NSCopying {

	static alloc(): UIPointerEffect; // inherited from NSObject

	static effectWithPreview(preview: UITargetedPreview): UIPointerEffect;

	static new(): UIPointerEffect; // inherited from NSObject

	readonly preview: UITargetedPreview;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare const enum UIPointerEffectTintMode {

	None = 0,

	Overlay = 1,

	Underlay = 2
}

declare class UIPointerHighlightEffect extends UIPointerEffect {

	static alloc(): UIPointerHighlightEffect; // inherited from NSObject

	static effectWithPreview(preview: UITargetedPreview): UIPointerHighlightEffect; // inherited from UIPointerEffect

	static new(): UIPointerHighlightEffect; // inherited from NSObject
}

declare class UIPointerHoverEffect extends UIPointerEffect {

	static alloc(): UIPointerHoverEffect; // inherited from NSObject

	static effectWithPreview(preview: UITargetedPreview): UIPointerHoverEffect; // inherited from UIPointerEffect

	static new(): UIPointerHoverEffect; // inherited from NSObject

	preferredTintMode: UIPointerEffectTintMode;

	prefersScaledContent: boolean;

	prefersShadow: boolean;
}

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

interface UIPointerInteractionAnimating extends NSObjectProtocol {

	addAnimations(animations: () => void): void;

	addCompletion(completion: (p1: boolean) => void): void;
}
declare var UIPointerInteractionAnimating: {

	prototype: UIPointerInteractionAnimating;
};

interface UIPointerInteractionDelegate extends NSObjectProtocol {

	pointerInteractionRegionForRequestDefaultRegion?(interaction: UIPointerInteraction, request: UIPointerRegionRequest, defaultRegion: UIPointerRegion): UIPointerRegion;

	pointerInteractionStyleForRegion?(interaction: UIPointerInteraction, region: UIPointerRegion): UIPointerStyle;

	pointerInteractionWillEnterRegionAnimator?(interaction: UIPointerInteraction, region: UIPointerRegion, animator: UIPointerInteractionAnimating): void;

	pointerInteractionWillExitRegionAnimator?(interaction: UIPointerInteraction, region: UIPointerRegion, animator: UIPointerInteractionAnimating): void;
}
declare var UIPointerInteractionDelegate: {

	prototype: UIPointerInteractionDelegate;
};

declare class UIPointerLiftEffect extends UIPointerEffect {

	static alloc(): UIPointerLiftEffect; // inherited from NSObject

	static effectWithPreview(preview: UITargetedPreview): UIPointerLiftEffect; // inherited from UIPointerEffect

	static new(): UIPointerLiftEffect; // inherited from NSObject
}

declare class UIPointerLockState extends NSObject {

	static alloc(): UIPointerLockState; // inherited from NSObject

	static new(): UIPointerLockState; // inherited from NSObject

	readonly locked: boolean;
}

declare var UIPointerLockStateDidChangeNotification: string;

declare var UIPointerLockStateSceneUserInfoKey: string;

declare class UIPointerRegion extends NSObject implements NSCopying {

	static alloc(): UIPointerRegion; // inherited from NSObject

	static new(): UIPointerRegion; // inherited from NSObject

	static regionWithRectIdentifier(rect: CGRect, identifier: NSObjectProtocol): UIPointerRegion;

	readonly identifier: NSObjectProtocol;

	latchingAxes: UIAxis;

	readonly rect: CGRect;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class UIPointerRegionRequest extends NSObject {

	static alloc(): UIPointerRegionRequest; // inherited from NSObject

	static new(): UIPointerRegionRequest; // inherited from NSObject

	readonly location: CGPoint;

	readonly modifiers: UIKeyModifierFlags;
}

declare class UIPointerShape extends NSObject implements NSCopying {

	static alloc(): UIPointerShape; // inherited from NSObject

	static beamWithPreferredLengthAxis(length: number, axis: UIAxis): UIPointerShape;

	static new(): UIPointerShape; // inherited from NSObject

	static shapeWithPath(path: UIBezierPath): UIPointerShape;

	static shapeWithRoundedRect(rect: CGRect): UIPointerShape;

	static shapeWithRoundedRectCornerRadius(rect: CGRect, cornerRadius: number): UIPointerShape;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class UIPointerStyle extends NSObject implements NSCopying {

	static alloc(): UIPointerStyle; // inherited from NSObject

	static hiddenPointerStyle(): UIPointerStyle;

	static new(): UIPointerStyle; // inherited from NSObject

	static styleWithEffectShape(effect: UIPointerEffect, shape: UIPointerShape): UIPointerStyle;

	static styleWithShapeConstrainedAxes(shape: UIPointerShape, axes: UIAxis): UIPointerStyle;

	static systemPointerStyle(): UIPointerStyle;

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

declare class UIPopoverBackgroundView extends UIView implements UIPopoverBackgroundViewMethods {

	static alloc(): UIPopoverBackgroundView; // inherited from NSObject

	static appearance(): UIPopoverBackgroundView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UIPopoverBackgroundView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIPopoverBackgroundView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIPopoverBackgroundView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIPopoverBackgroundView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIPopoverBackgroundView; // inherited from UIAppearance

	static arrowBase(): number;

	static arrowHeight(): number;

	static contentViewInsets(): UIEdgeInsets;

	static new(): UIPopoverBackgroundView; // inherited from NSObject

	arrowDirection: UIPopoverArrowDirection;

	arrowOffset: number;

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

declare class UIPopoverController extends NSObject implements UIAppearanceContainer {

	static alloc(): UIPopoverController; // inherited from NSObject

	static new(): UIPopoverController; // inherited from NSObject

	backgroundColor: UIColor;

	contentViewController: UIViewController;

	delegate: UIPopoverControllerDelegate;

	passthroughViews: NSArray<UIView>;

	readonly popoverArrowDirection: UIPopoverArrowDirection;

	popoverBackgroundViewClass: typeof NSObject;

	popoverContentSize: CGSize;

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

	popoverControllerDidDismissPopover?(popoverController: UIPopoverController): void;

	popoverControllerShouldDismissPopover?(popoverController: UIPopoverController): boolean;

	popoverControllerWillRepositionPopoverToRectInView?(popoverController: UIPopoverController, rect: interop.Pointer | interop.Reference<CGRect>, view: interop.Pointer | interop.Reference<UIView>): void;
}
declare var UIPopoverControllerDelegate: {

	prototype: UIPopoverControllerDelegate;
};

declare class UIPopoverPresentationController extends UIPresentationController {

	static alloc(): UIPopoverPresentationController; // inherited from NSObject

	static new(): UIPopoverPresentationController; // inherited from NSObject

	readonly adaptiveSheetPresentationController: UISheetPresentationController;

	readonly arrowDirection: UIPopoverArrowDirection;

	backgroundColor: UIColor;

	barButtonItem: UIBarButtonItem;

	canOverlapSourceViewRect: boolean;

	delegate: UIPopoverPresentationControllerDelegate;

	passthroughViews: NSArray<UIView>;

	permittedArrowDirections: UIPopoverArrowDirection;

	popoverBackgroundViewClass: typeof NSObject;

	popoverLayoutMargins: UIEdgeInsets;

	sourceItem: UIPopoverPresentationControllerSourceItem;

	sourceRect: CGRect;

	sourceView: UIView;
}

interface UIPopoverPresentationControllerDelegate extends UIAdaptivePresentationControllerDelegate {

	popoverPresentationControllerDidDismissPopover?(popoverPresentationController: UIPopoverPresentationController): void;

	popoverPresentationControllerShouldDismissPopover?(popoverPresentationController: UIPopoverPresentationController): boolean;

	popoverPresentationControllerWillRepositionPopoverToRectInView?(popoverPresentationController: UIPopoverPresentationController, rect: interop.Pointer | interop.Reference<CGRect>, view: interop.Pointer | interop.Reference<UIView>): void;

	prepareForPopoverPresentation?(popoverPresentationController: UIPopoverPresentationController): void;
}
declare var UIPopoverPresentationControllerDelegate: {

	prototype: UIPopoverPresentationControllerDelegate;
};

interface UIPopoverPresentationControllerSourceItem extends NSObjectProtocol {
}
declare var UIPopoverPresentationControllerSourceItem: {

	prototype: UIPopoverPresentationControllerSourceItem;
};

declare const enum UIPreferredPresentationStyle {

	Unspecified = 0,

	Inline = 1,

	Attachment = 2
}

declare class UIPresentationController extends NSObject implements UIAppearanceContainer, UIContentContainer, UIFocusEnvironment, UITraitEnvironment {

	static alloc(): UIPresentationController; // inherited from NSObject

	static new(): UIPresentationController; // inherited from NSObject

	readonly adaptivePresentationStyle: UIModalPresentationStyle;

	readonly containerView: UIView;

	delegate: UIAdaptivePresentationControllerDelegate;

	readonly frameOfPresentedViewInContainerView: CGRect;

	overrideTraitCollection: UITraitCollection;

	readonly presentationStyle: UIModalPresentationStyle;

	readonly presentedView: UIView;

	readonly presentedViewController: UIViewController;

	readonly presentingViewController: UIViewController;

	readonly shouldPresentInFullscreen: boolean;

	readonly shouldRemovePresentersView: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly focusGroupIdentifier: string; // inherited from UIFocusEnvironment

	readonly focusItemContainer: UIFocusItemContainer; // inherited from UIFocusEnvironment

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly parentFocusEnvironment: UIFocusEnvironment; // inherited from UIFocusEnvironment

	readonly preferredContentSize: CGSize; // inherited from UIContentContainer

	readonly preferredFocusEnvironments: NSArray<UIFocusEnvironment>; // inherited from UIFocusEnvironment

	readonly preferredFocusedView: UIView; // inherited from UIFocusEnvironment

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly traitCollection: UITraitCollection; // inherited from UITraitEnvironment

	readonly  // inherited from NSObjectProtocol

	constructor(o: { presentedViewController: UIViewController; presentingViewController: UIViewController; });

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

	preferredContentSizeDidChangeForChildContentContainer(container: UIContentContainer): void;

	presentationTransitionDidEnd(completed: boolean): void;

	presentationTransitionWillBegin(): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	setNeedsFocusUpdate(): void;

	shouldUpdateFocusInContext(context: UIFocusUpdateContext): boolean;

	sizeForChildContentContainerWithParentContainerSize(container: UIContentContainer, parentSize: CGSize): CGSize;

	systemLayoutFittingSizeDidChangeForChildContentContainer(container: UIContentContainer): void;

	traitCollectionDidChange(previousTraitCollection: UITraitCollection): void;

	updateFocusIfNeeded(): void;

	viewWillTransitionToSizeWithTransitionCoordinator(size: CGSize, coordinator: UIViewControllerTransitionCoordinator): void;

	willTransitionToTraitCollectionWithTransitionCoordinator(newCollection: UITraitCollection, coordinator: UIViewControllerTransitionCoordinator): void;
}

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

declare const enum UIPressPhase {

	Began = 0,

	Changed = 1,

	Stationary = 2,

	Ended = 3,

	Cancelled = 4
}

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

declare class UIPressesEvent extends _UIEvent {

	static alloc(): UIPressesEvent; // inherited from NSObject

	static new(): UIPressesEvent; // inherited from NSObject

	readonly allPresses: NSSet<UIPress>;

	pressesForGestureRecognizer(gesture: UIGestureRecognizer): NSSet<UIPress>;
}

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

interface UIPreviewActionItem extends NSObjectProtocol {

	title: string;
}
declare var UIPreviewActionItem: {

	prototype: UIPreviewActionItem;
};

declare const enum UIPreviewActionStyle {

	Default = 0,

	Selected = 1,

	Destructive = 2
}

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

	previewInteractionDidCancel(previewInteraction: UIPreviewInteraction): void;

	previewInteractionDidUpdateCommitTransitionEnded?(previewInteraction: UIPreviewInteraction, transitionProgress: number, ended: boolean): void;

	previewInteractionDidUpdatePreviewTransitionEnded(previewInteraction: UIPreviewInteraction, transitionProgress: number, ended: boolean): void;

	previewInteractionShouldBegin?(previewInteraction: UIPreviewInteraction): boolean;
}
declare var UIPreviewInteractionDelegate: {

	prototype: UIPreviewInteractionDelegate;
};

declare class UIPreviewParameters extends NSObject implements NSCopying {

	static alloc(): UIPreviewParameters; // inherited from NSObject

	static new(): UIPreviewParameters; // inherited from NSObject

	backgroundColor: UIColor;

	shadowPath: UIBezierPath;

	visiblePath: UIBezierPath;

	constructor(o: { textLineRects: NSArray<NSValue> | NSValue[]; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithTextLineRects(textLineRects: NSArray<NSValue> | NSValue[]): this;
}

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

declare const enum UIPrintErrorCode {

	PrintingNotAvailableError = 1,

	PrintNoContentError = 2,

	PrintUnknownImageFormatError = 3,

	PrintJobFailedError = 4
}

declare var UIPrintErrorDomain: string;

declare class UIPrintFormatter extends NSObject implements NSCopying {

	static alloc(): UIPrintFormatter; // inherited from NSObject

	static new(): UIPrintFormatter; // inherited from NSObject

	contentInsets: UIEdgeInsets;

	maximumContentHeight: number;

	maximumContentWidth: number;

	readonly pageCount: number;

	perPageContentInsets: UIEdgeInsets;

	readonly printPageRenderer: UIPrintPageRenderer;

	readonly requiresMainThread: boolean;

	startPage: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	drawInRectForPageAtIndex(rect: CGRect, pageIndex: number): void;

	rectForPageAtIndex(pageIndex: number): CGRect;

	removeFromPrintPageRenderer(): void;
}

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

declare const enum UIPrintInfoDuplex {

	None = 0,

	LongEdge = 1,

	ShortEdge = 2
}

declare const enum UIPrintInfoOrientation {

	Portrait = 0,

	Landscape = 1
}

declare const enum UIPrintInfoOutputType {

	General = 0,

	Photo = 1,

	Grayscale = 2,

	PhotoGrayscale = 3
}

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

	showsNumberOfCopies: boolean;

	showsPageRange: boolean;

	showsPaperOrientation: boolean;

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

interface UIPrintInteractionControllerDelegate extends NSObjectProtocol {

	printInteractionControllerChooseCutterBehavior?(printInteractionController: UIPrintInteractionController, availableBehaviors: NSArray<any> | any[]): UIPrinterCutterBehavior;

	printInteractionControllerChoosePaper?(printInteractionController: UIPrintInteractionController, paperList: NSArray<UIPrintPaper> | UIPrintPaper[]): UIPrintPaper;

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

	currentRenderingQualityForRequestedRenderingQuality(requestedRenderingQuality: UIPrintRenderingQuality): UIPrintRenderingQuality;

	drawContentForPageAtIndexInRect(pageIndex: number, contentRect: CGRect): void;

	drawFooterForPageAtIndexInRect(pageIndex: number, footerRect: CGRect): void;

	drawHeaderForPageAtIndexInRect(pageIndex: number, headerRect: CGRect): void;

	drawPageAtIndexInRect(pageIndex: number, printableRect: CGRect): void;

	drawPrintFormatterForPageAtIndex(printFormatter: UIPrintFormatter, pageIndex: number): void;

	prepareForDrawingPages(range: NSRange): void;

	printFormattersForPageAtIndex(pageIndex: number): NSArray<UIPrintFormatter>;
}

declare class UIPrintPaper extends NSObject {

	static alloc(): UIPrintPaper; // inherited from NSObject

	static bestPaperForPageSizeWithPapersFromArray(contentSize: CGSize, paperList: NSArray<UIPrintPaper> | UIPrintPaper[]): UIPrintPaper;

	static new(): UIPrintPaper; // inherited from NSObject

	readonly paperSize: CGSize;

	readonly printableRect: CGRect;

	printRect(): CGRect;
}

declare const enum UIPrintRenderingQuality {

	Best = 0,

	Responsive = 1
}

declare class UIPrintServiceExtension extends NSObject {

	static alloc(): UIPrintServiceExtension; // inherited from NSObject

	static new(): UIPrintServiceExtension; // inherited from NSObject

	printerDestinationsForPrintInfo(printInfo: UIPrintInfo): NSArray<UIPrinterDestination>;
}

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

declare const enum UIPrinterCutterBehavior {

	NoCut = 0,

	PrinterDefault = 1,

	CutAfterEachPage = 2,

	CutAfterEachCopy = 3,

	CutAfterEachJob = 4
}

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

declare class UIProgressView extends UIView implements NSCoding {

	static alloc(): UIProgressView; // inherited from NSObject

	static appearance(): UIProgressView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UIProgressView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIProgressView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIProgressView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIProgressView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIProgressView; // inherited from UIAppearance

	static new(): UIProgressView; // inherited from NSObject

	observedProgress: NSProgress;

	progress: number;

	progressImage: UIImage;

	progressTintColor: UIColor;

	progressViewStyle: UIProgressViewStyle;

	trackImage: UIImage;

	trackTintColor: UIColor;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { progressViewStyle: UIProgressViewStyle; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithProgressViewStyle(style: UIProgressViewStyle): this;

	setProgressAnimated(progress: number, animated: boolean): void;
}

declare const enum UIProgressViewStyle {

	Default = 0,

	Bar = 1
}

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

declare class UIReferenceLibraryViewController extends UIViewController {

	static alloc(): UIReferenceLibraryViewController; // inherited from NSObject

	static dictionaryHasDefinitionForTerm(term: string): boolean;

	static new(): UIReferenceLibraryViewController; // inherited from NSObject

	constructor(o: { term: string; });

	initWithTerm(term: string): this;
}

declare class UIRefreshControl extends UIControl {

	static alloc(): UIRefreshControl; // inherited from NSObject

	static appearance(): UIRefreshControl; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UIRefreshControl; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIRefreshControl; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIRefreshControl; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIRefreshControl; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIRefreshControl; // inherited from UIAppearance

	static new(): UIRefreshControl; // inherited from NSObject

	attributedTitle: NSAttributedString;

	readonly refreshing: boolean;

	beginRefreshing(): void;

	endRefreshing(): void;
}

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

declare const enum UIRemoteNotificationType {

	None = 0,

	Badge = 1,

	Sound = 2,

	Alert = 4,

	NewsstandContentAvailability = 8
}

declare class UIResponder extends NSObject implements UIActivityItemsConfigurationProviding, UIPasteConfigurationSupporting, UIResponderStandardEditActions, UIUserActivityRestoring {

	static alloc(): UIResponder; // inherited from NSObject

	static clearTextInputContextIdentifier(identifier: string): void;

	static new(): UIResponder; // inherited from NSObject

	activityItemsConfiguration: UIActivityItemsConfigurationReading;

	readonly canBecomeFirstResponder: boolean;

	readonly canResignFirstResponder: boolean;

	readonly editingInteractionConfiguration: UIEditingInteractionConfiguration;

	readonly inputAccessoryView: UIView;

	readonly inputAccessoryViewController: UIInputViewController;

	readonly inputAssistantItem: UITextInputAssistantItem;

	readonly inputView: UIView;

	readonly inputViewController: UIInputViewController;

	readonly isFirstResponder: boolean;

	readonly keyCommands: NSArray<UIKeyCommand>;

	readonly nextResponder: UIResponder;

	readonly textInputContextIdentifier: string;

	readonly textInputMode: UITextInputMode;

	readonly undoManager: NSUndoManager;

	userActivity: NSUserActivity;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	pasteConfiguration: UIPasteConfiguration; // inherited from UIPasteConfigurationSupporting

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	becomeFirstResponder(): boolean;

	buildMenuWithBuilder(builder: UIMenuBuilder): void;

	canPasteItemProviders(itemProviders: NSArray<NSItemProvider> | NSItemProvider[]): boolean;

	canPerformActionWithSender(action: string, sender: any): boolean;

	captureTextFromCamera(sender: any): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	cut(sender: any): void;

	decreaseSize(sender: any): void;

	delete(sender: any): void;

	duplicate(sender: any): void;

	export(sender: any): void;

	find(sender: any): void;

	findAndReplace(sender: any): void;

	findNext(sender: any): void;

	findPrevious(sender: any): void;

	increaseSize(sender: any): void;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	makeTextWritingDirectionLeftToRight(sender: any): void;

	makeTextWritingDirectionRightToLeft(sender: any): void;

	motionBeganWithEvent(motion: UIEventSubtype, event: _UIEvent): void;

	motionCancelledWithEvent(motion: UIEventSubtype, event: _UIEvent): void;

	motionEndedWithEvent(motion: UIEventSubtype, event: _UIEvent): void;

	move(sender: any): void;

	paste(sender: any): void;

	pasteAndGo(sender: any): void;

	pasteAndMatchStyle(sender: any): void;

	pasteAndSearch(sender: any): void;

	pasteItemProviders(itemProviders: NSArray<NSItemProvider> | NSItemProvider[]): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	pressesBeganWithEvent(presses: NSSet<UIPress>, event: UIPressesEvent): void;

	pressesCancelledWithEvent(presses: NSSet<UIPress>, event: UIPressesEvent): void;

	pressesChangedWithEvent(presses: NSSet<UIPress>, event: UIPressesEvent): void;

	pressesEndedWithEvent(presses: NSSet<UIPress>, event: UIPressesEvent): void;

	print(sender: any): void;

	reloadInputViews(): void;

	remoteControlReceivedWithEvent(event: _UIEvent): void;

	rename(sender: any): void;

	resignFirstResponder(): boolean;

	respondsToSelector(aSelector: string): boolean;

	restoreUserActivityState(userActivity: NSUserActivity): void;

	retainCount(): number;

	select(sender: any): void;

	selectAll(sender: any): void;

	self(): this;

	targetForActionWithSender(action: string, sender: any): any;

	toggleBoldface(sender: any): void;

	toggleItalics(sender: any): void;

	toggleUnderline(sender: any): void;

	touchesBeganWithEvent(touches: NSSet<UITouch>, event: _UIEvent): void;

	touchesCancelledWithEvent(touches: NSSet<UITouch>, event: _UIEvent): void;

	touchesEndedWithEvent(touches: NSSet<UITouch>, event: _UIEvent): void;

	touchesEstimatedPropertiesUpdated(touches: NSSet<UITouch>): void;

	touchesMovedWithEvent(touches: NSSet<UITouch>, event: _UIEvent): void;

	updateTextAttributesWithConversionHandler(conversionHandler: (p1: NSDictionary<string, any>) => NSDictionary<string, any>): void;

	updateUserActivityState(activity: NSUserActivity): void;

	useSelectionForFind(sender: any): void;

	validateCommand(command: UICommand): void;
}

interface UIResponderStandardEditActions extends NSObjectProtocol {

	cut?(sender: any): void;

	decreaseSize?(sender: any): void;

	delete?(sender: any): void;

	duplicate?(sender: any): void;

	export?(sender: any): void;

	find?(sender: any): void;

	findAndReplace?(sender: any): void;

	findNext?(sender: any): void;

	findPrevious?(sender: any): void;

	increaseSize?(sender: any): void;

	makeTextWritingDirectionLeftToRight?(sender: any): void;

	makeTextWritingDirectionRightToLeft?(sender: any): void;

	move?(sender: any): void;

	paste?(sender: any): void;

	pasteAndGo?(sender: any): void;

	pasteAndMatchStyle?(sender: any): void;

	pasteAndSearch?(sender: any): void;

	print?(sender: any): void;

	rename?(sender: any): void;

	select?(sender: any): void;

	selectAll?(sender: any): void;

	toggleBoldface?(sender: any): void;

	toggleItalics?(sender: any): void;

	toggleUnderline?(sender: any): void;

	updateTextAttributesWithConversionHandler?(conversionHandler: (p1: NSDictionary<string, any>) => NSDictionary<string, any>): void;

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

declare class UIRotationGestureRecognizer extends UIGestureRecognizer {

	static alloc(): UIRotationGestureRecognizer; // inherited from NSObject

	static new(): UIRotationGestureRecognizer; // inherited from NSObject

	rotation: number;

	readonly velocity: number;
}

declare function UISaveVideoAtPathToSavedPhotosAlbum(videoPath: string, completionTarget: any, completionSelector: string, contextInfo: interop.Pointer | interop.Reference<any>): void;

declare class UIScene extends UIResponder {

	static alloc(): UIScene; // inherited from NSObject

	static new(): UIScene; // inherited from NSObject

	activationConditions: UISceneActivationConditions;

	readonly activationState: UISceneActivationState;

	delegate: UISceneDelegate;

	readonly pointerLockState: UIPointerLockState;

	readonly session: UISceneSession;

	subtitle: string;

	title: string;

	constructor(o: { session: UISceneSession; connectionOptions: UISceneConnectionOptions; });

	completeStateRestoration(): void;

	extendStateRestoration(): void;

	initWithSessionConnectionOptions(session: UISceneSession, connectionOptions: UISceneConnectionOptions): this;

	openURLOptionsCompletionHandler(url: NSURL, options: UISceneOpenExternalURLOptions, completion: (p1: boolean) => void): void;
}

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

declare class UISceneActivationRequestOptions extends NSObject {

	static alloc(): UISceneActivationRequestOptions; // inherited from NSObject

	static new(): UISceneActivationRequestOptions; // inherited from NSObject

	requestingScene: UIScene;
}

declare const enum UISceneActivationState {

	Unattached = -1,

	ForegroundActive = 0,

	ForegroundInactive = 1,

	Background = 2
}

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

declare class UISceneConnectionOptions extends NSObject {

	static alloc(): UISceneConnectionOptions; // inherited from NSObject

	static new(): UISceneConnectionOptions; // inherited from NSObject

	readonly URLContexts: NSSet<UIOpenURLContext>;

	readonly cloudKitShareMetadata: CKShareMetadata;

	readonly handoffUserActivityType: string;

	readonly notificationResponse: UNNotificationResponse;

	readonly shortcutItem: UIApplicationShortcutItem;

	readonly sourceApplication: string;

	readonly userActivities: NSSet<NSUserActivity>;
}

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

declare class UISceneDestructionRequestOptions extends NSObject {

	static alloc(): UISceneDestructionRequestOptions; // inherited from NSObject

	static new(): UISceneDestructionRequestOptions; // inherited from NSObject
}

declare var UISceneDidActivateNotification: string;

declare var UISceneDidDisconnectNotification: string;

declare var UISceneDidEnterBackgroundNotification: string;

declare const enum UISceneErrorCode {

	MultipleScenesNotSupported = 0,

	RequestDenied = 1,

	GeometryRequestUnsupported = 100,

	GeometryRequestDenied = 101
}

declare var UISceneErrorDomain: string;

declare class UISceneOpenExternalURLOptions extends NSObject {

	static alloc(): UISceneOpenExternalURLOptions; // inherited from NSObject

	static new(): UISceneOpenExternalURLOptions; // inherited from NSObject

	eventAttribution: UIEventAttribution;

	universalLinksOnly: boolean;
}

declare class UISceneOpenURLOptions extends NSObject {

	static alloc(): UISceneOpenURLOptions; // inherited from NSObject

	static new(): UISceneOpenURLOptions; // inherited from NSObject

	readonly annotation: any;

	readonly eventAttribution: UIEventAttribution;

	readonly openInPlace: boolean;

	readonly sourceApplication: string;
}

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

declare class UISceneSizeRestrictions extends NSObject {

	static alloc(): UISceneSizeRestrictions; // inherited from NSObject

	static new(): UISceneSizeRestrictions; // inherited from NSObject

	allowsFullScreen: boolean;

	maximumSize: CGSize;

	minimumSize: CGSize;
}

declare var UISceneWillConnectNotification: string;

declare var UISceneWillDeactivateNotification: string;

declare var UISceneWillEnterForegroundNotification: string;

declare class UISceneWindowingBehaviors extends NSObject {

	static alloc(): UISceneWindowingBehaviors; // inherited from NSObject

	static new(): UISceneWindowingBehaviors; // inherited from NSObject

	closable: boolean;

	miniaturizable: boolean;
}

declare class UIScreen extends NSObject implements UITraitEnvironment {

	static alloc(): UIScreen; // inherited from NSObject

	static new(): UIScreen; // inherited from NSObject

	readonly applicationFrame: CGRect;

	readonly availableModes: NSArray<UIScreenMode>;

	readonly bounds: CGRect;

	brightness: number;

	readonly calibratedLatency: number;

	readonly captured: boolean;

	readonly coordinateSpace: UICoordinateSpace;

	readonly currentEDRHeadroom: number;

	currentMode: UIScreenMode;

	readonly fixedCoordinateSpace: UICoordinateSpace;

	readonly focusedItem: UIFocusItem;

	readonly focusedView: UIView;

	readonly maximumFramesPerSecond: number;

	readonly mirroredScreen: UIScreen;

	readonly nativeBounds: CGRect;

	readonly nativeScale: number;

	overscanCompensation: UIScreenOverscanCompensation;

	readonly overscanCompensationInsets: UIEdgeInsets;

	readonly potentialEDRHeadroom: number;

	readonly preferredMode: UIScreenMode;

	readonly referenceDisplayModeStatus: UIScreenReferenceDisplayModeStatus;

	readonly scale: number;

	readonly supportsFocus: boolean;

	wantsSoftwareDimming: boolean;

	static readonly mainScreen: UIScreen;

	static readonly screens: NSArray<UIScreen>;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly traitCollection: UITraitCollection; // inherited from UITraitEnvironment

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

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

	snapshotViewAfterScreenUpdates(afterUpdates: boolean): UIView;

	traitCollectionDidChange(previousTraitCollection: UITraitCollection): void;
}

declare var UIScreenBrightnessDidChangeNotification: string;

declare var UIScreenCapturedDidChangeNotification: string;

declare var UIScreenDidConnectNotification: string;

declare var UIScreenDidDisconnectNotification: string;

declare class UIScreenEdgePanGestureRecognizer extends UIPanGestureRecognizer {

	static alloc(): UIScreenEdgePanGestureRecognizer; // inherited from NSObject

	static new(): UIScreenEdgePanGestureRecognizer; // inherited from NSObject

	edges: UIRectEdge;
}

declare class UIScreenMode extends NSObject {

	static alloc(): UIScreenMode; // inherited from NSObject

	static new(): UIScreenMode; // inherited from NSObject

	readonly pixelAspectRatio: number;

	readonly size: CGSize;
}

declare var UIScreenModeDidChangeNotification: string;

declare const enum UIScreenOverscanCompensation {

	Scale = 0,

	InsetBounds = 1,

	None = 2,

	InsetApplicationFrame = 2
}

declare const enum UIScreenReferenceDisplayModeStatus {

	NotSupported = 0,

	NotEnabled = 1,

	Limited = 2,

	Enabled = 3
}

declare var UIScreenReferenceDisplayModeStatusDidChangeNotification: string;

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

interface UIScribbleInteractionDelegate extends NSObjectProtocol {

	scribbleInteractionDidFinishWriting?(interaction: UIScribbleInteraction): void;

	scribbleInteractionShouldBeginAtLocation?(interaction: UIScribbleInteraction, location: CGPoint): boolean;

	scribbleInteractionShouldDelayFocus?(interaction: UIScribbleInteraction): boolean;

	scribbleInteractionWillBeginWriting?(interaction: UIScribbleInteraction): void;
}
declare var UIScribbleInteractionDelegate: {

	prototype: UIScribbleInteractionDelegate;
};

declare const enum UIScrollType {

	Discrete = 0,

	Continuous = 1
}

declare const enum UIScrollTypeMask {

	Discrete = 1,

	Continuous = 2,

	All = 3
}

declare class UIScrollView extends UIView implements NSCoding, UIFocusItemScrollableContainer {

	static alloc(): UIScrollView; // inherited from NSObject

	static appearance(): UIScrollView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UIScrollView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIScrollView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIScrollView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIScrollView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIScrollView; // inherited from UIAppearance

	static new(): UIScrollView; // inherited from NSObject

	readonly adjustedContentInset: UIEdgeInsets;

	alwaysBounceHorizontal: boolean;

	alwaysBounceVertical: boolean;

	automaticallyAdjustsScrollIndicatorInsets: boolean;

	bounces: boolean;

	bouncesZoom: boolean;

	canCancelContentTouches: boolean;

	contentInset: UIEdgeInsets;

	contentInsetAdjustmentBehavior: UIScrollViewContentInsetAdjustmentBehavior;

	readonly contentLayoutGuide: UILayoutGuide;

	contentSize: CGSize;

	readonly decelerating: boolean;

	decelerationRate: number;

	delaysContentTouches: boolean;

	delegate: UIScrollViewDelegate;

	directionalLockEnabled: boolean;

	readonly directionalPressGestureRecognizer: UIGestureRecognizer;

	readonly dragging: boolean;

	readonly frameLayoutGuide: UILayoutGuide;

	horizontalScrollIndicatorInsets: UIEdgeInsets;

	indexDisplayMode: UIScrollViewIndexDisplayMode;

	indicatorStyle: UIScrollViewIndicatorStyle;

	keyboardDismissMode: UIScrollViewKeyboardDismissMode;

	maximumZoomScale: number;

	minimumZoomScale: number;

	pagingEnabled: boolean;

	readonly panGestureRecognizer: UIPanGestureRecognizer;

	readonly pinchGestureRecognizer: UIPinchGestureRecognizer;

	refreshControl: UIRefreshControl;

	scrollEnabled: boolean;

	scrollIndicatorInsets: UIEdgeInsets;

	scrollsToTop: boolean;

	showsHorizontalScrollIndicator: boolean;

	showsVerticalScrollIndicator: boolean;

	readonly tracking: boolean;

	verticalScrollIndicatorInsets: UIEdgeInsets;

	readonly zoomBouncing: boolean;

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

	setZoomScaleAnimated(scale: number, animated: boolean): void;

	touchesShouldBeginWithEventInContentView(touches: NSSet<UITouch>, event: _UIEvent, view: UIView): boolean;

	touchesShouldCancelInContentView(view: UIView): boolean;

	zoomToRectAnimated(rect: CGRect, animated: boolean): void;
}

interface UIScrollViewAccessibilityDelegate extends UIScrollViewDelegate {

	accessibilityAttributedScrollStatusForScrollView?(scrollView: UIScrollView): NSAttributedString;

	accessibilityScrollStatusForScrollView?(scrollView: UIScrollView): string;
}
declare var UIScrollViewAccessibilityDelegate: {

	prototype: UIScrollViewAccessibilityDelegate;
};

declare const enum UIScrollViewContentInsetAdjustmentBehavior {

	Automatic = 0,

	ScrollableAxes = 1,

	Never = 2,

	Always = 3
}

declare var UIScrollViewDecelerationRateFast: number;

declare var UIScrollViewDecelerationRateNormal: number;

interface UIScrollViewDelegate extends NSObjectProtocol {

	scrollViewDidChangeAdjustedContentInset?(scrollView: UIScrollView): void;

	scrollViewDidEndDecelerating?(scrollView: UIScrollView): void;

	scrollViewDidEndDraggingWillDecelerate?(scrollView: UIScrollView, decelerate: boolean): void;

	scrollViewDidEndScrollingAnimation?(scrollView: UIScrollView): void;

	scrollViewDidEndZoomingWithViewAtScale?(scrollView: UIScrollView, view: UIView, scale: number): void;

	scrollViewDidScroll?(scrollView: UIScrollView): void;

	scrollViewDidScrollToTop?(scrollView: UIScrollView): void;

	scrollViewDidZoom?(scrollView: UIScrollView): void;

	scrollViewShouldScrollToTop?(scrollView: UIScrollView): boolean;

	scrollViewWillBeginDecelerating?(scrollView: UIScrollView): void;

	scrollViewWillBeginDragging?(scrollView: UIScrollView): void;

	scrollViewWillBeginZoomingWithView?(scrollView: UIScrollView, view: UIView): void;

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

declare const enum UIScrollViewKeyboardDismissMode {

	None = 0,

	OnDrag = 1,

	Interactive = 2,

	OnDragWithAccessory = 3,

	InteractiveWithAccessory = 4
}

declare class UISearchBar extends UIView implements UIBarPositioning, UITextInputTraits {

	static alloc(): UISearchBar; // inherited from NSObject

	static appearance(): UISearchBar; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UISearchBar; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UISearchBar; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UISearchBar; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UISearchBar; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UISearchBar; // inherited from UIAppearance

	static new(): UISearchBar; // inherited from NSObject

	backgroundImage: UIImage;

	barStyle: UIBarStyle;

	barTintColor: UIColor;

	delegate: UISearchBarDelegate;

	inputAccessoryView: UIView;

	placeholder: string;

	prompt: string;

	scopeBarBackgroundImage: UIImage;

	scopeButtonTitles: NSArray<string>;

	searchBarStyle: UISearchBarStyle;

	searchFieldBackgroundPositionAdjustment: UIOffset;

	searchResultsButtonSelected: boolean;

	readonly searchTextField: UISearchTextField;

	searchTextPositionAdjustment: UIOffset;

	selectedScopeButtonIndex: number;

	showsBookmarkButton: boolean;

	showsCancelButton: boolean;

	showsScopeBar: boolean;

	showsSearchResultsButton: boolean;

	text: string;

	translucent: boolean;

	autocapitalizationType: UITextAutocapitalizationType; // inherited from UITextInputTraits

	autocorrectionType: UITextAutocorrectionType; // inherited from UITextInputTraits

	readonly barPosition: UIBarPosition; // inherited from UIBarPositioning

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	enablesReturnKeyAutomatically: boolean; // inherited from UITextInputTraits

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	keyboardAppearance: UIKeyboardAppearance; // inherited from UITextInputTraits

	keyboardType: UIKeyboardType; // inherited from UITextInputTraits

	passwordRules: UITextInputPasswordRules; // inherited from UITextInputTraits

	returnKeyType: UIReturnKeyType; // inherited from UITextInputTraits

	secureTextEntry: boolean; // inherited from UITextInputTraits

	smartDashesType: UITextSmartDashesType; // inherited from UITextInputTraits

	smartInsertDeleteType: UITextSmartInsertDeleteType; // inherited from UITextInputTraits

	smartQuotesType: UITextSmartQuotesType; // inherited from UITextInputTraits

	spellCheckingType: UITextSpellCheckingType; // inherited from UITextInputTraits

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	textContentType: string; // inherited from UITextInputTraits

	readonly  // inherited from NSObjectProtocol

	backgroundImageForBarPositionBarMetrics(barPosition: UIBarPosition, barMetrics: UIBarMetrics): UIImage;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	imageForSearchBarIconState(icon: UISearchBarIcon, state: UIControlState): UIImage;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	positionAdjustmentForSearchBarIcon(icon: UISearchBarIcon): UIOffset;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	scopeBarButtonBackgroundImageForState(state: UIControlState): UIImage;

	scopeBarButtonDividerImageForLeftSegmentStateRightSegmentState(leftState: UIControlState, rightState: UIControlState): UIImage;

	scopeBarButtonTitleTextAttributesForState(state: UIControlState): NSDictionary<string, any>;

	searchFieldBackgroundImageForState(state: UIControlState): UIImage;

	self(): this;

	setBackgroundImageForBarPositionBarMetrics(backgroundImage: UIImage, barPosition: UIBarPosition, barMetrics: UIBarMetrics): void;

	setImageForSearchBarIconState(iconImage: UIImage, icon: UISearchBarIcon, state: UIControlState): void;

	setPositionAdjustmentForSearchBarIcon(adjustment: UIOffset, icon: UISearchBarIcon): void;

	setScopeBarButtonBackgroundImageForState(backgroundImage: UIImage, state: UIControlState): void;

	setScopeBarButtonDividerImageForLeftSegmentStateRightSegmentState(dividerImage: UIImage, leftState: UIControlState, rightState: UIControlState): void;

	setScopeBarButtonTitleTextAttributesForState(attributes: NSDictionary<string, any>, state: UIControlState): void;

	setSearchFieldBackgroundImageForState(backgroundImage: UIImage, state: UIControlState): void;

	setShowsCancelButtonAnimated(showsCancelButton: boolean, animated: boolean): void;

	setShowsScopeBarAnimated(show: boolean, animate: boolean): void;
}

interface UISearchBarDelegate extends UIBarPositioningDelegate {

	searchBarBookmarkButtonClicked?(searchBar: UISearchBar): void;

	searchBarCancelButtonClicked?(searchBar: UISearchBar): void;

	searchBarResultsListButtonClicked?(searchBar: UISearchBar): void;

	searchBarSearchButtonClicked?(searchBar: UISearchBar): void;

	searchBarSelectedScopeButtonIndexDidChange?(searchBar: UISearchBar, selectedScope: number): void;

	searchBarShouldBeginEditing?(searchBar: UISearchBar): boolean;

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

declare const enum UISearchBarStyle {

	Default = 0,

	Prominent = 1,

	Minimal = 2
}

declare class UISearchContainerViewController extends UIViewController {

	static alloc(): UISearchContainerViewController; // inherited from NSObject

	static new(): UISearchContainerViewController; // inherited from NSObject

	readonly searchController: UISearchController;

	constructor(o: { searchController: UISearchController; });

	initWithSearchController(searchController: UISearchController): this;
}

declare class UISearchController extends UIViewController implements UIViewControllerAnimatedTransitioning, UIViewControllerTransitioningDelegate {

	static alloc(): UISearchController; // inherited from NSObject

	static new(): UISearchController; // inherited from NSObject

	active: boolean;

	automaticallyShowsCancelButton: boolean;

	automaticallyShowsScopeBar: boolean;

	automaticallyShowsSearchResultsController: boolean;

	delegate: UISearchControllerDelegate;

	dimsBackgroundDuringPresentation: boolean;

	hidesNavigationBarDuringPresentation: boolean;

	ignoresSearchSuggestionsForSearchBarPlacementStacked: boolean;

	obscuresBackgroundDuringPresentation: boolean;

	readonly searchBar: UISearchBar;

	readonly searchBarPlacement: UINavigationItemSearchBarPlacement;

	readonly searchResultsController: UIViewController;

	searchResultsUpdater: UISearchResultsUpdating;

	searchSuggestions: NSArray<UISearchSuggestion>;

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

	interruptibleAnimatorForTransition(transitionContext: UIViewControllerContextTransitioning): UIViewImplicitlyAnimating;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

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

	searchControllerDidChangeFromSearchBarPlacement?(searchController: UISearchController, previousPlacement: UINavigationItemSearchBarPlacement): void;

	searchControllerWillChangeToSearchBarPlacement?(searchController: UISearchController, newPlacement: UINavigationItemSearchBarPlacement): void;

	willDismissSearchController?(searchController: UISearchController): void;

	willPresentSearchController?(searchController: UISearchController): void;
}
declare var UISearchControllerDelegate: {

	prototype: UISearchControllerDelegate;
};

declare class UISearchDisplayController extends NSObject {

	static alloc(): UISearchDisplayController; // inherited from NSObject

	static new(): UISearchDisplayController; // inherited from NSObject

	active: boolean;

	delegate: UISearchDisplayDelegate;

	displaysSearchBarInNavigationBar: boolean;

	readonly navigationItem: UINavigationItem;

	readonly searchBar: UISearchBar;

	readonly searchContentsController: UIViewController;

	searchResultsDataSource: UITableViewDataSource;

	searchResultsDelegate: UITableViewDelegate;

	readonly searchResultsTableView: UITableView;

	searchResultsTitle: string;

	constructor(o: { searchBar: UISearchBar; contentsController: UIViewController; });

	initWithSearchBarContentsController(searchBar: UISearchBar, viewController: UIViewController): this;

	setActiveAnimated(visible: boolean, animated: boolean): void;
}

interface UISearchDisplayDelegate extends NSObjectProtocol {

	searchDisplayControllerDidBeginSearch?(controller: UISearchDisplayController): void;

	searchDisplayControllerDidEndSearch?(controller: UISearchDisplayController): void;

	searchDisplayControllerDidHideSearchResultsTableView?(controller: UISearchDisplayController, tableView: UITableView): void;

	searchDisplayControllerDidLoadSearchResultsTableView?(controller: UISearchDisplayController, tableView: UITableView): void;

	searchDisplayControllerDidShowSearchResultsTableView?(controller: UISearchDisplayController, tableView: UITableView): void;

	searchDisplayControllerShouldReloadTableForSearchScope?(controller: UISearchDisplayController, searchOption: number): boolean;

	searchDisplayControllerShouldReloadTableForSearchString?(controller: UISearchDisplayController, searchString: string): boolean;

	searchDisplayControllerWillBeginSearch?(controller: UISearchDisplayController): void;

	searchDisplayControllerWillEndSearch?(controller: UISearchDisplayController): void;

	searchDisplayControllerWillHideSearchResultsTableView?(controller: UISearchDisplayController, tableView: UITableView): void;

	searchDisplayControllerWillShowSearchResultsTableView?(controller: UISearchDisplayController, tableView: UITableView): void;

	searchDisplayControllerWillUnloadSearchResultsTableView?(controller: UISearchDisplayController, tableView: UITableView): void;
}
declare var UISearchDisplayDelegate: {

	prototype: UISearchDisplayDelegate;
};

interface UISearchResultsUpdating extends NSObjectProtocol {

	updateSearchResultsForSearchController(searchController: UISearchController): void;

	updateSearchResultsForSearchControllerSelectingSearchSuggestion?(searchController: UISearchController, searchSuggestion: UISearchSuggestion): void;
}
declare var UISearchResultsUpdating: {

	prototype: UISearchResultsUpdating;
};

interface UISearchSuggestion extends NSObjectProtocol {

	iconImage?: UIImage;

	localizedAttributedSuggestion: NSAttributedString;

	localizedDescription?: string;

	localizedSuggestion: string;

	representedObject: any;
}
declare var UISearchSuggestion: {

	prototype: UISearchSuggestion;
};

declare class UISearchSuggestionItem extends NSObject implements UISearchSuggestion {

	static alloc(): UISearchSuggestionItem; // inherited from NSObject

	static new(): UISearchSuggestionItem; // inherited from NSObject

	static suggestionWithLocalizedAttributedSuggestion(suggestion: NSAttributedString): UISearchSuggestionItem;

	static suggestionWithLocalizedAttributedSuggestionDescriptionString(suggestion: NSAttributedString, description: string): UISearchSuggestionItem;

	static suggestionWithLocalizedAttributedSuggestionDescriptionStringIconImage(suggestion: NSAttributedString, description: string, iconImage: UIImage): UISearchSuggestionItem;

	static suggestionWithLocalizedSuggestion(suggestion: string): UISearchSuggestionItem;

	static suggestionWithLocalizedSuggestionDescriptionString(suggestion: string, description: string): UISearchSuggestionItem;

	static suggestionWithLocalizedSuggestionDescriptionStringIconImage(suggestion: string, description: string, iconImage: UIImage): UISearchSuggestionItem;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly iconImage: UIImage; // inherited from UISearchSuggestion

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly localizedAttributedSuggestion: NSAttributedString; // inherited from UISearchSuggestion

	readonly localizedDescription: string; // inherited from UISearchSuggestion

	readonly localizedSuggestion: string; // inherited from UISearchSuggestion

	representedObject: any; // inherited from UISearchSuggestion

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { localizedAttributedSuggestion: NSAttributedString; });

	constructor(o: { localizedAttributedSuggestion: NSAttributedString; localizedDescription: string; });

	constructor(o: { localizedAttributedSuggestion: NSAttributedString; localizedDescription: string; iconImage: UIImage; });

	constructor(o: { localizedSuggestion: string; });

	constructor(o: { localizedSuggestion: string; localizedDescription: string; });

	constructor(o: { localizedSuggestion: string; localizedDescription: string; iconImage: UIImage; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithLocalizedAttributedSuggestion(suggestion: NSAttributedString): this;

	initWithLocalizedAttributedSuggestionLocalizedDescription(suggestion: NSAttributedString, description: string): this;

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

declare class UISearchTextField extends UITextField {

	static alloc(): UISearchTextField; // inherited from NSObject

	static appearance(): UISearchTextField; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UISearchTextField; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UISearchTextField; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UISearchTextField; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UISearchTextField; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UISearchTextField; // inherited from UIAppearance

	static new(): UISearchTextField; // inherited from NSObject

	allowsCopyingTokens: boolean;

	allowsDeletingTokens: boolean;

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

declare class UISearchToken extends NSObject {

	static alloc(): UISearchToken; // inherited from NSObject

	static new(): UISearchToken; // inherited from NSObject

	static tokenWithIconText(icon: UIImage, text: string): UISearchToken;

	representedObject: any;
}

declare class UISegmentedControl extends UIControl implements NSCoding, UISpringLoadedInteractionSupporting {

	static alloc(): UISegmentedControl; // inherited from NSObject

	static appearance(): UISegmentedControl; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UISegmentedControl; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UISegmentedControl; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UISegmentedControl; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UISegmentedControl; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UISegmentedControl; // inherited from UIAppearance

	static new(): UISegmentedControl; // inherited from NSObject

	apportionsSegmentWidthsByContent: boolean;

	momentary: boolean;

	readonly numberOfSegments: number;

	segmentedControlStyle: UISegmentedControlStyle;

	selectedSegmentIndex: number;

	selectedSegmentTintColor: UIColor;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	springLoaded: boolean; // inherited from UISpringLoadedInteractionSupporting

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { frame: CGRect; actions: NSArray<UIAction> | UIAction[]; });

	constructor(o: { items: NSArray<any> | any[]; });

	actionForSegmentAtIndex(segment: number): UIAction;

	backgroundImageForStateBarMetrics(state: UIControlState, barMetrics: UIBarMetrics): UIImage;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	contentOffsetForSegmentAtIndex(segment: number): CGSize;

	contentPositionAdjustmentForSegmentTypeBarMetrics(leftCenterRightOrAlone: UISegmentedControlSegment, barMetrics: UIBarMetrics): UIOffset;

	dividerImageForLeftSegmentStateRightSegmentStateBarMetrics(leftState: UIControlState, rightState: UIControlState, barMetrics: UIBarMetrics): UIImage;

	encodeWithCoder(coder: NSCoder): void;

	imageForSegmentAtIndex(segment: number): UIImage;

	initWithCoder(coder: NSCoder): this;

	initWithFrameActions(frame: CGRect, actions: NSArray<UIAction> | UIAction[]): this;

	initWithItems(items: NSArray<any> | any[]): this;

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

	segmentIndexForActionIdentifier(actionIdentifier: string): number;

	self(): this;

	setActionForSegmentAtIndex(action: UIAction, segment: number): void;

	setBackgroundImageForStateBarMetrics(backgroundImage: UIImage, state: UIControlState, barMetrics: UIBarMetrics): void;

	setContentOffsetForSegmentAtIndex(offset: CGSize, segment: number): void;

	setContentPositionAdjustmentForSegmentTypeBarMetrics(adjustment: UIOffset, leftCenterRightOrAlone: UISegmentedControlSegment, barMetrics: UIBarMetrics): void;

	setDividerImageForLeftSegmentStateRightSegmentStateBarMetrics(dividerImage: UIImage, leftState: UIControlState, rightState: UIControlState, barMetrics: UIBarMetrics): void;

	setEnabledForSegmentAtIndex(enabled: boolean, segment: number): void;

	setImageForSegmentAtIndex(image: UIImage, segment: number): void;

	setTitleForSegmentAtIndex(title: string, segment: number): void;

	setTitleTextAttributesForState(attributes: NSDictionary<string, any>, state: UIControlState): void;

	setWidthForSegmentAtIndex(width: number, segment: number): void;

	titleForSegmentAtIndex(segment: number): string;

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

declare const enum UISegmentedControlStyle {

	Plain = 0,

	Bordered = 1,

	Bar = 2,

	Bezeled = 3
}

declare class UISelectionFeedbackGenerator extends UIFeedbackGenerator {

	static alloc(): UISelectionFeedbackGenerator; // inherited from NSObject

	static new(): UISelectionFeedbackGenerator; // inherited from NSObject

	selectionChanged(): void;
}

declare const enum UISemanticContentAttribute {

	Unspecified = 0,

	Playback = 1,

	Spatial = 2,

	ForceLeftToRight = 3,

	ForceRightToLeft = 4
}

declare class UISheetPresentationController extends UIPresentationController {

	static alloc(): UISheetPresentationController; // inherited from NSObject

	static new(): UISheetPresentationController; // inherited from NSObject

	delegate: UISheetPresentationControllerDelegate;

	detents: NSArray<UISheetPresentationControllerDetent>;

	largestUndimmedDetentIdentifier: string;

	preferredCornerRadius: number;

	prefersEdgeAttachedInCompactHeight: boolean;

	prefersGrabberVisible: boolean;

	prefersScrollingExpandsWhenScrolledToEdge: boolean;

	selectedDetentIdentifier: string;

	sourceView: UIView;

	widthFollowsPreferredContentSizeWhenEdgeAttached: boolean;

	animateChanges(changes: () => void): void;

	invalidateDetents(): void;
}

declare var UISheetPresentationControllerAutomaticDimension: number;

interface UISheetPresentationControllerDelegate extends UIAdaptivePresentationControllerDelegate {

	sheetPresentationControllerDidChangeSelectedDetentIdentifier?(sheetPresentationController: UISheetPresentationController): void;
}
declare var UISheetPresentationControllerDelegate: {

	prototype: UISheetPresentationControllerDelegate;
};

declare class UISheetPresentationControllerDetent extends NSObject {

	static alloc(): UISheetPresentationControllerDetent; // inherited from NSObject

	static customDetentWithIdentifierResolver(identifier: string, resolver: (p1: UISheetPresentationControllerDetentResolutionContext) => number): UISheetPresentationControllerDetent;

	static largeDetent(): UISheetPresentationControllerDetent;

	static mediumDetent(): UISheetPresentationControllerDetent;

	static new(): UISheetPresentationControllerDetent; // inherited from NSObject

	readonly identifier: string;

	resolvedValueInContext(context: UISheetPresentationControllerDetentResolutionContext): number;
}

declare var UISheetPresentationControllerDetentIdentifierLarge: string;

declare var UISheetPresentationControllerDetentIdentifierMedium: string;

declare var UISheetPresentationControllerDetentInactive: number;

interface UISheetPresentationControllerDetentResolutionContext extends NSObjectProtocol {

	containerTraitCollection: UITraitCollection;

	maximumDetentValue: number;
}
declare var UISheetPresentationControllerDetentResolutionContext: {

	prototype: UISheetPresentationControllerDetentResolutionContext;
};

declare class UISimpleTextPrintFormatter extends UIPrintFormatter {

	static alloc(): UISimpleTextPrintFormatter; // inherited from NSObject

	static new(): UISimpleTextPrintFormatter; // inherited from NSObject

	attributedText: NSAttributedString;

	color: UIColor;

	font: UIFont;

	text: string;

	textAlignment: NSTextAlignment;

	constructor(o: { attributedText: NSAttributedString; });

	constructor(o: { text: string; });

	initWithAttributedText(attributedText: NSAttributedString): this;

	initWithText(text: string): this;
}

declare class UISlider extends UIControl implements NSCoding {

	static alloc(): UISlider; // inherited from NSObject

	static appearance(): UISlider; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UISlider; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UISlider; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UISlider; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UISlider; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UISlider; // inherited from UIAppearance

	static new(): UISlider; // inherited from NSObject

	readonly behavioralStyle: UIBehavioralStyle;

	continuous: boolean;

	readonly currentMaximumTrackImage: UIImage;

	readonly currentMinimumTrackImage: UIImage;

	readonly currentThumbImage: UIImage;

	maximumTrackTintColor: UIColor;

	maximumValue: number;

	maximumValueImage: UIImage;

	minimumTrackTintColor: UIColor;

	minimumValue: number;

	minimumValueImage: UIImage;

	preferredBehavioralStyle: UIBehavioralStyle;

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

declare class UISnapBehavior extends UIDynamicBehavior {

	static alloc(): UISnapBehavior; // inherited from NSObject

	static new(): UISnapBehavior; // inherited from NSObject

	damping: number;

	snapPoint: CGPoint;

	constructor(o: { item: UIDynamicItem; snapToPoint: CGPoint; });

	initWithItemSnapToPoint(item: UIDynamicItem, point: CGPoint): this;
}

declare class UISplitViewController extends UIViewController {

	static alloc(): UISplitViewController; // inherited from NSObject

	static new(): UISplitViewController; // inherited from NSObject

	readonly collapsed: boolean;

	delegate: UISplitViewControllerDelegate;

	readonly displayMode: UISplitViewControllerDisplayMode;

	readonly displayModeButtonItem: UIBarButtonItem;

	displayModeButtonVisibility: UISplitViewControllerDisplayModeButtonVisibility;

	maximumPrimaryColumnWidth: number;

	maximumSupplementaryColumnWidth: number;

	minimumPrimaryColumnWidth: number;

	minimumSupplementaryColumnWidth: number;

	preferredDisplayMode: UISplitViewControllerDisplayMode;

	preferredPrimaryColumnWidth: number;

	preferredPrimaryColumnWidthFraction: number;

	preferredSplitBehavior: UISplitViewControllerSplitBehavior;

	preferredSupplementaryColumnWidth: number;

	preferredSupplementaryColumnWidthFraction: number;

	presentsWithGesture: boolean;

	primaryBackgroundStyle: UISplitViewControllerBackgroundStyle;

	readonly primaryColumnWidth: number;

	primaryEdge: UISplitViewControllerPrimaryEdge;

	showsSecondaryOnlyButton: boolean;

	readonly splitBehavior: UISplitViewControllerSplitBehavior;

	readonly style: UISplitViewControllerStyle;

	readonly supplementaryColumnWidth: number;

	viewControllers: NSArray<UIViewController>;

	constructor(o: { style: UISplitViewControllerStyle; });

	hideColumn(column: UISplitViewControllerColumn): void;

	initWithStyle(style: UISplitViewControllerStyle): this;

	setViewControllerForColumn(vc: UIViewController, column: UISplitViewControllerColumn): void;

	showColumn(column: UISplitViewControllerColumn): void;

	viewControllerForColumn(column: UISplitViewControllerColumn): UIViewController;
}

declare var UISplitViewControllerAutomaticDimension: number;

declare const enum UISplitViewControllerBackgroundStyle {

	None = 0,

	Sidebar = 1
}

declare const enum UISplitViewControllerColumn {

	Primary = 0,

	Supplementary = 1,

	Secondary = 2,

	Compact = 3
}

interface UISplitViewControllerDelegate {

	primaryViewControllerForCollapsingSplitViewController?(splitViewController: UISplitViewController): UIViewController;

	primaryViewControllerForExpandingSplitViewController?(splitViewController: UISplitViewController): UIViewController;

	splitViewControllerCollapseSecondaryViewControllerOntoPrimaryViewController?(splitViewController: UISplitViewController, secondaryViewController: UIViewController, primaryViewController: UIViewController): boolean;

	splitViewControllerDidCollapse?(svc: UISplitViewController): void;

	splitViewControllerDidExpand?(svc: UISplitViewController): void;

	splitViewControllerDisplayModeForExpandingToProposedDisplayMode?(svc: UISplitViewController, proposedDisplayMode: UISplitViewControllerDisplayMode): UISplitViewControllerDisplayMode;

	splitViewControllerInteractivePresentationGestureDidEnd?(svc: UISplitViewController): void;

	splitViewControllerInteractivePresentationGestureWillBegin?(svc: UISplitViewController): void;

	splitViewControllerPopoverControllerWillPresentViewController?(svc: UISplitViewController, pc: UIPopoverController, aViewController: UIViewController): void;

	splitViewControllerPreferredInterfaceOrientationForPresentation?(splitViewController: UISplitViewController): UIInterfaceOrientation;

	splitViewControllerSeparateSecondaryViewControllerFromPrimaryViewController?(splitViewController: UISplitViewController, primaryViewController: UIViewController): UIViewController;

	splitViewControllerShouldHideViewControllerInOrientation?(svc: UISplitViewController, vc: UIViewController, orientation: UIInterfaceOrientation): boolean;

	splitViewControllerShowDetailViewControllerSender?(splitViewController: UISplitViewController, vc: UIViewController, sender: any): boolean;

	splitViewControllerShowViewControllerSender?(splitViewController: UISplitViewController, vc: UIViewController, sender: any): boolean;

	splitViewControllerSupportedInterfaceOrientations?(splitViewController: UISplitViewController): UIInterfaceOrientationMask;

	splitViewControllerTopColumnForCollapsingToProposedTopColumn?(svc: UISplitViewController, proposedTopColumn: UISplitViewControllerColumn): UISplitViewControllerColumn;

	splitViewControllerWillChangeToDisplayMode?(svc: UISplitViewController, displayMode: UISplitViewControllerDisplayMode): void;

	splitViewControllerWillHideColumn?(svc: UISplitViewController, column: UISplitViewControllerColumn): void;

	splitViewControllerWillHideViewControllerWithBarButtonItemForPopoverController?(svc: UISplitViewController, aViewController: UIViewController, barButtonItem: UIBarButtonItem, pc: UIPopoverController): void;

	splitViewControllerWillShowColumn?(svc: UISplitViewController, column: UISplitViewControllerColumn): void;

	splitViewControllerWillShowViewControllerInvalidatingBarButtonItem?(svc: UISplitViewController, aViewController: UIViewController, barButtonItem: UIBarButtonItem): void;

	targetDisplayModeForActionInSplitViewController?(svc: UISplitViewController): UISplitViewControllerDisplayMode;
}
declare var UISplitViewControllerDelegate: {

	prototype: UISplitViewControllerDelegate;
};

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

declare const enum UISplitViewControllerDisplayModeButtonVisibility {

	Automatic = 0,

	Never = 1,

	Always = 2
}

declare const enum UISplitViewControllerPrimaryEdge {

	Leading = 0,

	Trailing = 1
}

declare const enum UISplitViewControllerSplitBehavior {

	Automatic = 0,

	Tile = 1,

	Overlay = 2,

	Displace = 3
}

declare const enum UISplitViewControllerStyle {

	Unspecified = 0,

	DoubleColumn = 1,

	TripleColumn = 2
}

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

interface UISpringLoadedInteractionBehavior extends NSObjectProtocol {

	interactionDidFinish?(interaction: UISpringLoadedInteraction): void;

	shouldAllowInteractionWithContext(interaction: UISpringLoadedInteraction, context: UISpringLoadedInteractionContext): boolean;
}
declare var UISpringLoadedInteractionBehavior: {

	prototype: UISpringLoadedInteractionBehavior;
};

interface UISpringLoadedInteractionContext extends NSObjectProtocol {

	state: UISpringLoadedInteractionEffectState;

	targetItem: any;

	targetView: UIView;

	locationInView(view: UIView): CGPoint;
}
declare var UISpringLoadedInteractionContext: {

	prototype: UISpringLoadedInteractionContext;
};

interface UISpringLoadedInteractionEffect extends NSObjectProtocol {

	interactionDidChangeWithContext(interaction: UISpringLoadedInteraction, context: UISpringLoadedInteractionContext): void;
}
declare var UISpringLoadedInteractionEffect: {

	prototype: UISpringLoadedInteractionEffect;
};

declare const enum UISpringLoadedInteractionEffectState {

	Inactive = 0,

	Possible = 1,

	Activating = 2,

	Activated = 3
}

interface UISpringLoadedInteractionSupporting extends NSObjectProtocol {

	springLoaded: boolean;
}
declare var UISpringLoadedInteractionSupporting: {

	prototype: UISpringLoadedInteractionSupporting;
};

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

	constructor(o: { mass: number; stiffness: number; damping: number; initialVelocity: CGVector; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithDampingRatio(ratio: number): this;

	initWithDampingRatioInitialVelocity(ratio: number, velocity: CGVector): this;

	initWithMassStiffnessDampingInitialVelocity(mass: number, stiffness: number, damping: number, velocity: CGVector): this;
}

declare class UIStackView extends UIView {

	static alloc(): UIStackView; // inherited from NSObject

	static appearance(): UIStackView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UIStackView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIStackView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIStackView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIStackView; // inherited from UIAppearance

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

	customSpacingAfterView(arrangedSubview: UIView): number;

	initWithArrangedSubviews(views: NSArray<UIView> | UIView[]): this;

	insertArrangedSubviewAtIndex(view: UIView, stackIndex: number): void;

	removeArrangedSubview(view: UIView): void;

	setCustomSpacingAfterView(spacing: number, arrangedSubview: UIView): void;
}

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

declare const enum UIStackViewDistribution {

	Fill = 0,

	FillEqually = 1,

	FillProportionally = 2,

	EqualSpacing = 3,

	EqualCentering = 4
}

declare var UIStackViewSpacingUseDefault: number;

declare var UIStackViewSpacingUseSystem: number;

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

declare class UIStepper extends UIControl {

	static alloc(): UIStepper; // inherited from NSObject

	static appearance(): UIStepper; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UIStepper; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIStepper; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIStepper; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIStepper; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIStepper; // inherited from UIAppearance

	static new(): UIStepper; // inherited from NSObject

	autorepeat: boolean;

	continuous: boolean;

	maximumValue: number;

	minimumValue: number;

	stepValue: number;

	value: number;

	wraps: boolean;

	backgroundImageForState(state: UIControlState): UIImage;

	decrementImageForState(state: UIControlState): UIImage;

	dividerImageForLeftSegmentStateRightSegmentState(state: UIControlState, state1: UIControlState): UIImage;

	incrementImageForState(state: UIControlState): UIImage;

	setBackgroundImageForState(image: UIImage, state: UIControlState): void;

	setDecrementImageForState(image: UIImage, state: UIControlState): void;

	setDividerImageForLeftSegmentStateRightSegmentState(image: UIImage, leftState: UIControlState, rightState: UIControlState): void;

	setIncrementImageForState(image: UIImage, state: UIControlState): void;
}

declare class UIStoryboard extends NSObject {

	static alloc(): UIStoryboard; // inherited from NSObject

	static new(): UIStoryboard; // inherited from NSObject

	static storyboardWithNameBundle(name: string, storyboardBundleOrNil: NSBundle): UIStoryboard;

	instantiateInitialViewController(): UIViewController;

	instantiateInitialViewControllerWithCreator(block: (p1: NSCoder) => UIViewController): UIViewController;

	instantiateViewControllerWithIdentifier(identifier: string): UIViewController;

	instantiateViewControllerWithIdentifierCreator(identifier: string, block: (p1: NSCoder) => UIViewController): UIViewController;
}

declare class UIStoryboardPopoverSegue extends UIStoryboardSegue {

	static alloc(): UIStoryboardPopoverSegue; // inherited from NSObject

	static new(): UIStoryboardPopoverSegue; // inherited from NSObject

	static segueWithIdentifierSourceDestinationPerformHandler(identifier: string, source: UIViewController, destination: UIViewController, performHandler: () => void): UIStoryboardPopoverSegue; // inherited from UIStoryboardSegue

	readonly popoverController: UIPopoverController;
}

declare class UIStoryboardSegue extends NSObject {

	static alloc(): UIStoryboardSegue; // inherited from NSObject

	static new(): UIStoryboardSegue; // inherited from NSObject

	static segueWithIdentifierSourceDestinationPerformHandler(identifier: string, source: UIViewController, destination: UIViewController, performHandler: () => void): UIStoryboardSegue;

	readonly destinationViewController: UIViewController;

	readonly identifier: string;

	readonly sourceViewController: UIViewController;

	constructor(o: { identifier: string; source: UIViewController; destination: UIViewController; });

	initWithIdentifierSourceDestination(identifier: string, source: UIViewController, destination: UIViewController): this;

	perform(): void;
}

declare class UIStoryboardUnwindSegueSource extends NSObject {

	static alloc(): UIStoryboardUnwindSegueSource; // inherited from NSObject

	static new(): UIStoryboardUnwindSegueSource; // inherited from NSObject

	readonly sender: any;

	readonly sourceViewController: UIViewController;

	readonly unwindAction: string;
}

declare class UISwipeActionsConfiguration extends NSObject {

	static alloc(): UISwipeActionsConfiguration; // inherited from NSObject

	static configurationWithActions(actions: NSArray<UIContextualAction> | UIContextualAction[]): UISwipeActionsConfiguration;

	static new(): UISwipeActionsConfiguration; // inherited from NSObject

	readonly actions: NSArray<UIContextualAction>;

	performsFirstActionWithFullSwipe: boolean;
}

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

declare class UISwitch extends UIControl implements NSCoding {

	static alloc(): UISwitch; // inherited from NSObject

	static appearance(): UISwitch; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UISwitch; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UISwitch; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UISwitch; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UISwitch; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UISwitch; // inherited from UIAppearance

	static new(): UISwitch; // inherited from NSObject

	offImage: UIImage;

	on: boolean;

	onImage: UIImage;

	onTintColor: UIColor;

	preferredStyle: UISwitchStyle;

	readonly style: UISwitchStyle;

	thumbTintColor: UIColor;

	title: string;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	setOnAnimated(on: boolean, animated: boolean): void;
}

declare const enum UISwitchStyle {

	Automatic = 0,

	Checkbox = 1,

	Sliding = 2
}

declare const enum UISystemAnimation {

	Delete = 0
}

declare class UITabBar extends UIView implements UISpringLoadedInteractionSupporting {

	static alloc(): UITabBar; // inherited from NSObject

	static appearance(): UITabBar; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UITabBar; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UITabBar; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UITabBar; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UITabBar; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UITabBar; // inherited from UIAppearance

	static new(): UITabBar; // inherited from NSObject

	backgroundImage: UIImage;

	barStyle: UIBarStyle;

	barTintColor: UIColor;

	readonly customizing: boolean;

	delegate: UITabBarDelegate;

	itemPositioning: UITabBarItemPositioning;

	itemSpacing: number;

	itemWidth: number;

	items: NSArray<UITabBarItem>;

	scrollEdgeAppearance: UITabBarAppearance;

	selectedImageTintColor: UIColor;

	selectedItem: UITabBarItem;

	selectionIndicatorImage: UIImage;

	shadowImage: UIImage;

	standardAppearance: UITabBarAppearance;

	translucent: boolean;

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

declare class UITabBarController extends UIViewController implements NSCoding, UITabBarDelegate {

	static alloc(): UITabBarController; // inherited from NSObject

	static new(): UITabBarController; // inherited from NSObject

	customizableViewControllers: NSArray<UIViewController>;

	delegate: UITabBarControllerDelegate;

	readonly moreNavigationController: UINavigationController;

	selectedIndex: number;

	selectedViewController: UIViewController;

	readonly tabBar: UITabBar;

	viewControllers: NSArray<UIViewController>;

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

	setViewControllersAnimated(viewControllers: NSArray<UIViewController> | UIViewController[], animated: boolean): void;

	tabBarDidBeginCustomizingItems(tabBar: UITabBar, items: NSArray<UITabBarItem> | UITabBarItem[]): void;

	tabBarDidEndCustomizingItemsChanged(tabBar: UITabBar, items: NSArray<UITabBarItem> | UITabBarItem[], changed: boolean): void;

	tabBarDidSelectItem(tabBar: UITabBar, item: UITabBarItem): void;

	tabBarWillBeginCustomizingItems(tabBar: UITabBar, items: NSArray<UITabBarItem> | UITabBarItem[]): void;

	tabBarWillEndCustomizingItemsChanged(tabBar: UITabBar, items: NSArray<UITabBarItem> | UITabBarItem[], changed: boolean): void;
}

interface UITabBarControllerDelegate extends NSObjectProtocol {

	tabBarControllerAnimationControllerForTransitionFromViewControllerToViewController?(tabBarController: UITabBarController, fromVC: UIViewController, toVC: UIViewController): UIViewControllerAnimatedTransitioning;

	tabBarControllerDidEndCustomizingViewControllersChanged?(tabBarController: UITabBarController, viewControllers: NSArray<UIViewController> | UIViewController[], changed: boolean): void;

	tabBarControllerDidSelectViewController?(tabBarController: UITabBarController, viewController: UIViewController): void;

	tabBarControllerInteractionControllerForAnimationController?(tabBarController: UITabBarController, animationController: UIViewControllerAnimatedTransitioning): UIViewControllerInteractiveTransitioning;

	tabBarControllerPreferredInterfaceOrientationForPresentation?(tabBarController: UITabBarController): UIInterfaceOrientation;

	tabBarControllerShouldSelectViewController?(tabBarController: UITabBarController, viewController: UIViewController): boolean;

	tabBarControllerSupportedInterfaceOrientations?(tabBarController: UITabBarController): UIInterfaceOrientationMask;

	tabBarControllerWillBeginCustomizingViewControllers?(tabBarController: UITabBarController, viewControllers: NSArray<UIViewController> | UIViewController[]): void;

	tabBarControllerWillEndCustomizingViewControllersChanged?(tabBarController: UITabBarController, viewControllers: NSArray<UIViewController> | UIViewController[], changed: boolean): void;
}
declare var UITabBarControllerDelegate: {

	prototype: UITabBarControllerDelegate;
};

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

declare class UITabBarItem extends UIBarItem implements UIPopoverPresentationControllerSourceItem, UISpringLoadedInteractionSupporting {

	static alloc(): UITabBarItem; // inherited from NSObject

	static appearance(): UITabBarItem; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UITabBarItem; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UITabBarItem; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UITabBarItem; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UITabBarItem; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UITabBarItem; // inherited from UIAppearance

	static new(): UITabBarItem; // inherited from NSObject

	badgeColor: UIColor;

	badgeValue: string;

	scrollEdgeAppearance: UITabBarAppearance;

	selectedImage: UIImage;

	standardAppearance: UITabBarAppearance;

	titlePositionAdjustment: UIOffset;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	springLoaded: boolean; // inherited from UISpringLoadedInteractionSupporting

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { tabBarSystemItem: UITabBarSystemItem; tag: number; });

	constructor(o: { title: string; image: UIImage; selectedImage: UIImage; });

	constructor(o: { title: string; image: UIImage; tag: number; });

	badgeTextAttributesForState(state: UIControlState): NSDictionary<string, any>;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	finishedSelectedImage(): UIImage;

	finishedUnselectedImage(): UIImage;

	initWithTabBarSystemItemTag(systemItem: UITabBarSystemItem, tag: number): this;

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

	setBadgeTextAttributesForState(textAttributes: NSDictionary<string, any>, state: UIControlState): void;

	setFinishedSelectedImageWithFinishedUnselectedImage(selectedImage: UIImage, unselectedImage: UIImage): void;
}

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

declare const enum UITabBarItemPositioning {

	Automatic = 0,

	Fill = 1,

	Centered = 2
}

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

declare class UITableView extends UIScrollView implements NSCoding, UIDataSourceTranslating, UISpringLoadedInteractionSupporting {

	static alloc(): UITableView; // inherited from NSObject

	static appearance(): UITableView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UITableView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UITableView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UITableView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UITableView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UITableView; // inherited from UIAppearance

	static new(): UITableView; // inherited from NSObject

	allowsFocus: boolean;

	allowsFocusDuringEditing: boolean;

	allowsMultipleSelection: boolean;

	allowsMultipleSelectionDuringEditing: boolean;

	allowsSelection: boolean;

	allowsSelectionDuringEditing: boolean;

	backgroundView: UIView;

	cellLayoutMarginsFollowReadableWidth: boolean;

	readonly contextMenuInteraction: UIContextMenuInteraction;

	dataSource: UITableViewDataSource;

	delegate: UITableViewDelegate;

	dragDelegate: UITableViewDragDelegate;

	dragInteractionEnabled: boolean;

	dropDelegate: UITableViewDropDelegate;

	editing: boolean;

	estimatedRowHeight: number;

	estimatedSectionFooterHeight: number;

	estimatedSectionHeaderHeight: number;

	fillerRowHeight: number;

	readonly hasActiveDrag: boolean;

	readonly hasActiveDrop: boolean;

	readonly hasUncommittedUpdates: boolean;

	readonly indexPathForSelectedRow: NSIndexPath;

	readonly indexPathsForSelectedRows: NSArray<NSIndexPath>;

	readonly indexPathsForVisibleRows: NSArray<NSIndexPath>;

	insetsContentViewsToSafeArea: boolean;

	readonly numberOfSections: number;

	prefetchDataSource: UITableViewDataSourcePrefetching;

	prefetchingEnabled: boolean;

	remembersLastFocusedIndexPath: boolean;

	rowHeight: number;

	sectionFooterHeight: number;

	sectionHeaderHeight: number;

	sectionHeaderTopPadding: number;

	sectionIndexBackgroundColor: UIColor;

	sectionIndexColor: UIColor;

	sectionIndexMinimumDisplayRowCount: number;

	sectionIndexTrackingBackgroundColor: UIColor;

	selectionFollowsFocus: boolean;

	selfSizingInvalidation: UITableViewSelfSizingInvalidation;

	separatorColor: UIColor;

	separatorEffect: UIVisualEffect;

	separatorInset: UIEdgeInsets;

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

	dequeueReusableCellWithIdentifierForIndexPath(identifier: string, indexPath: NSIndexPath): UITableViewCell;

	dequeueReusableHeaderFooterViewWithIdentifier(identifier: string): UITableViewHeaderFooterView;

	deselectRowAtIndexPathAnimated(indexPath: NSIndexPath, animated: boolean): void;

	encodeWithCoder(coder: NSCoder): void;

	endUpdates(): void;

	footerViewForSection(section: number): UITableViewHeaderFooterView;

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

	moveRowAtIndexPathToIndexPath(indexPath: NSIndexPath, newIndexPath: NSIndexPath): void;

	moveSectionToSection(section: number, newSection: number): void;

	numberOfRowsInSection(section: number): number;

	performBatchUpdatesCompletion(updates: () => void, completion: (p1: boolean) => void): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	performUsingPresentationValues(actionsToTranslate: () => void): void;

	presentationIndexPathForDataSourceIndexPath(dataSourceIndexPath: NSIndexPath): NSIndexPath;

	presentationSectionIndexForDataSourceSectionIndex(dataSourceSectionIndex: number): number;

	reconfigureRowsAtIndexPaths(indexPaths: NSArray<NSIndexPath> | NSIndexPath[]): void;

	rectForFooterInSection(section: number): CGRect;

	rectForHeaderInSection(section: number): CGRect;

	rectForRowAtIndexPath(indexPath: NSIndexPath): CGRect;

	rectForSection(section: number): CGRect;

	registerClassForCellReuseIdentifier(cellClass: typeof NSObject, identifier: string): void;

	registerClassForHeaderFooterViewReuseIdentifier(aClass: typeof NSObject, identifier: string): void;

	registerNibForCellReuseIdentifier(nib: UINib, identifier: string): void;

	registerNibForHeaderFooterViewReuseIdentifier(nib: UINib, identifier: string): void;

	reloadData(): void;

	reloadRowsAtIndexPathsWithRowAnimation(indexPaths: NSArray<NSIndexPath> | NSIndexPath[], animation: UITableViewRowAnimation): void;

	reloadSectionIndexTitles(): void;

	reloadSectionsWithRowAnimation(sections: NSIndexSet, animation: UITableViewRowAnimation): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	scrollToNearestSelectedRowAtScrollPositionAnimated(scrollPosition: UITableViewScrollPosition, animated: boolean): void;

	scrollToRowAtIndexPathAtScrollPositionAnimated(indexPath: NSIndexPath, scrollPosition: UITableViewScrollPosition, animated: boolean): void;

	selectRowAtIndexPathAnimatedScrollPosition(indexPath: NSIndexPath, animated: boolean, scrollPosition: UITableViewScrollPosition): void;

	self(): this;

	setEditingAnimated(editing: boolean, animated: boolean): void;
}

declare var UITableViewAutomaticDimension: number;

declare class UITableViewCell extends UIView implements NSCoding, UIGestureRecognizerDelegate {

	static alloc(): UITableViewCell; // inherited from NSObject

	static appearance(): UITableViewCell; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UITableViewCell; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UITableViewCell; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UITableViewCell; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UITableViewCell; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UITableViewCell; // inherited from UIAppearance

	static new(): UITableViewCell; // inherited from NSObject

	accessoryAction: string;

	accessoryType: UITableViewCellAccessoryType;

	accessoryView: UIView;

	automaticallyUpdatesBackgroundConfiguration: boolean;

	automaticallyUpdatesContentConfiguration: boolean;

	backgroundConfiguration: UIBackgroundConfiguration;

	backgroundView: UIView;

	readonly configurationState: UICellConfigurationState;

	configurationUpdateHandler: (p1: UITableViewCell, p2: UICellConfigurationState) => void;

	contentConfiguration: UIContentConfiguration;

	readonly contentView: UIView;

	readonly detailTextLabel: UILabel;

	editAction: string;

	editing: boolean;

	editingAccessoryType: UITableViewCellAccessoryType;

	editingAccessoryView: UIView;

	readonly editingStyle: UITableViewCellEditingStyle;

	focusStyle: UITableViewCellFocusStyle;

	font: UIFont;

	hidesAccessoryWhenEditing: boolean;

	highlighted: boolean;

	image: UIImage;

	readonly imageView: UIImageView;

	indentationLevel: number;

	indentationWidth: number;

	lineBreakMode: NSLineBreakMode;

	multipleSelectionBackgroundView: UIView;

	readonly reuseIdentifier: string;

	selected: boolean;

	selectedBackgroundView: UIView;

	selectedImage: UIImage;

	selectedTextColor: UIColor;

	selectionStyle: UITableViewCellSelectionStyle;

	separatorInset: UIEdgeInsets;

	shouldIndentWhileEditing: boolean;

	readonly showingDeleteConfirmation: boolean;

	showsReorderControl: boolean;

	target: any;

	text: string;

	textAlignment: NSTextAlignment;

	textColor: UIColor;

	readonly textLabel: UILabel;

	userInteractionEnabledWhileDragging: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { frame: CGRect; reuseIdentifier: string; });

	constructor(o: { style: UITableViewCellStyle; reuseIdentifier: string; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	defaultBackgroundConfiguration(): UIBackgroundConfiguration;

	defaultContentConfiguration(): UIListContentConfiguration;

	didTransitionToState(state: UITableViewCellStateMask): void;

	dragStateDidChange(dragState: UITableViewCellDragState): void;

	encodeWithCoder(coder: NSCoder): void;

	gestureRecognizerShouldBeRequiredToFailByGestureRecognizer(gestureRecognizer: UIGestureRecognizer, otherGestureRecognizer: UIGestureRecognizer): boolean;

	gestureRecognizerShouldBegin(gestureRecognizer: UIGestureRecognizer): boolean;

	gestureRecognizerShouldReceiveEvent(gestureRecognizer: UIGestureRecognizer, event: _UIEvent): boolean;

	gestureRecognizerShouldReceivePress(gestureRecognizer: UIGestureRecognizer, press: UIPress): boolean;

	gestureRecognizerShouldReceiveTouch(gestureRecognizer: UIGestureRecognizer, touch: UITouch): boolean;

	gestureRecognizerShouldRecognizeSimultaneouslyWithGestureRecognizer(gestureRecognizer: UIGestureRecognizer, otherGestureRecognizer: UIGestureRecognizer): boolean;

	gestureRecognizerShouldRequireFailureOfGestureRecognizer(gestureRecognizer: UIGestureRecognizer, otherGestureRecognizer: UIGestureRecognizer): boolean;

	initWithCoder(coder: NSCoder): this;

	initWithFrameReuseIdentifier(frame: CGRect, reuseIdentifier: string): this;

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

	setNeedsUpdateConfiguration(): void;

	setSelectedAnimated(selected: boolean, animated: boolean): void;

	updateConfigurationUsingState(state: UICellConfigurationState): void;

	willTransitionToState(state: UITableViewCellStateMask): void;
}

declare const enum UITableViewCellAccessoryType {

	None = 0,

	DisclosureIndicator = 1,

	DetailDisclosureButton = 2,

	Checkmark = 3,

	DetailButton = 4
}

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

declare class UITableViewController extends UIViewController implements UITableViewDataSource, UITableViewDelegate {

	static alloc(): UITableViewController; // inherited from NSObject

	static new(): UITableViewController; // inherited from NSObject

	clearsSelectionOnViewWillAppear: boolean;

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

	scrollViewDidChangeAdjustedContentInset(scrollView: UIScrollView): void;

	scrollViewDidEndDecelerating(scrollView: UIScrollView): void;

	scrollViewDidEndDraggingWillDecelerate(scrollView: UIScrollView, decelerate: boolean): void;

	scrollViewDidEndScrollingAnimation(scrollView: UIScrollView): void;

	scrollViewDidEndZoomingWithViewAtScale(scrollView: UIScrollView, view: UIView, scale: number): void;

	scrollViewDidScroll(scrollView: UIScrollView): void;

	scrollViewDidScrollToTop(scrollView: UIScrollView): void;

	scrollViewDidZoom(scrollView: UIScrollView): void;

	scrollViewShouldScrollToTop(scrollView: UIScrollView): boolean;

	scrollViewWillBeginDecelerating(scrollView: UIScrollView): void;

	scrollViewWillBeginDragging(scrollView: UIScrollView): void;

	scrollViewWillBeginZoomingWithView(scrollView: UIScrollView, view: UIView): void;

	scrollViewWillEndDraggingWithVelocityTargetContentOffset(scrollView: UIScrollView, velocity: CGPoint, targetContentOffset: interop.Pointer | interop.Reference<CGPoint>): void;

	sectionIndexTitlesForTableView(tableView: UITableView): NSArray<string>;

	self(): this;

	tableViewAccessoryButtonTappedForRowWithIndexPath(tableView: UITableView, indexPath: NSIndexPath): void;

	tableViewAccessoryTypeForRowWithIndexPath(tableView: UITableView, indexPath: NSIndexPath): UITableViewCellAccessoryType;

	tableViewCanEditRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): boolean;

	tableViewCanFocusRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): boolean;

	tableViewCanMoveRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): boolean;

	tableViewCanPerformActionForRowAtIndexPathWithSender(tableView: UITableView, action: string, indexPath: NSIndexPath, sender: any): boolean;

	tableViewCanPerformPrimaryActionForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): boolean;

	tableViewCellForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): UITableViewCell;

	tableViewCommitEditingStyleForRowAtIndexPath(tableView: UITableView, editingStyle: UITableViewCellEditingStyle, indexPath: NSIndexPath): void;

	tableViewContextMenuConfigurationForRowAtIndexPathPoint(tableView: UITableView, indexPath: NSIndexPath, point: CGPoint): UIContextMenuConfiguration;

	tableViewDidBeginMultipleSelectionInteractionAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): void;

	tableViewDidDeselectRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): void;

	tableViewDidEndDisplayingCellForRowAtIndexPath(tableView: UITableView, cell: UITableViewCell, indexPath: NSIndexPath): void;

	tableViewDidEndDisplayingFooterViewForSection(tableView: UITableView, view: UIView, section: number): void;

	tableViewDidEndDisplayingHeaderViewForSection(tableView: UITableView, view: UIView, section: number): void;

	tableViewDidEndEditingRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): void;

	tableViewDidEndMultipleSelectionInteraction(tableView: UITableView): void;

	tableViewDidHighlightRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): void;

	tableViewDidSelectRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): void;

	tableViewDidUnhighlightRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): void;

	tableViewDidUpdateFocusInContextWithAnimationCoordinator(tableView: UITableView, context: UITableViewFocusUpdateContext, coordinator: UIFocusAnimationCoordinator): void;

	tableViewEditActionsForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): NSArray<UITableViewRowAction>;

	tableViewEditingStyleForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): UITableViewCellEditingStyle;

	tableViewEstimatedHeightForFooterInSection(tableView: UITableView, section: number): number;

	tableViewEstimatedHeightForHeaderInSection(tableView: UITableView, section: number): number;

	tableViewEstimatedHeightForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): number;

	tableViewHeightForFooterInSection(tableView: UITableView, section: number): number;

	tableViewHeightForHeaderInSection(tableView: UITableView, section: number): number;

	tableViewHeightForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): number;

	tableViewIndentationLevelForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): number;

	tableViewLeadingSwipeActionsConfigurationForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): UISwipeActionsConfiguration;

	tableViewMoveRowAtIndexPathToIndexPath(tableView: UITableView, sourceIndexPath: NSIndexPath, destinationIndexPath: NSIndexPath): void;

	tableViewNumberOfRowsInSection(tableView: UITableView, section: number): number;

	tableViewPerformActionForRowAtIndexPathWithSender(tableView: UITableView, action: string, indexPath: NSIndexPath, sender: any): void;

	tableViewPerformPrimaryActionForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): void;

	tableViewPreviewForDismissingContextMenuWithConfiguration(tableView: UITableView, configuration: UIContextMenuConfiguration): UITargetedPreview;

	tableViewPreviewForHighlightingContextMenuWithConfiguration(tableView: UITableView, configuration: UIContextMenuConfiguration): UITargetedPreview;

	tableViewSectionForSectionIndexTitleAtIndex(tableView: UITableView, title: string, index: number): number;

	tableViewSelectionFollowsFocusForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): boolean;

	tableViewShouldBeginMultipleSelectionInteractionAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): boolean;

	tableViewShouldHighlightRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): boolean;

	tableViewShouldIndentWhileEditingRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): boolean;

	tableViewShouldShowMenuForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): boolean;

	tableViewShouldSpringLoadRowAtIndexPathWithContext(tableView: UITableView, indexPath: NSIndexPath, context: UISpringLoadedInteractionContext): boolean;

	tableViewShouldUpdateFocusInContext(tableView: UITableView, context: UITableViewFocusUpdateContext): boolean;

	tableViewTargetIndexPathForMoveFromRowAtIndexPathToProposedIndexPath(tableView: UITableView, sourceIndexPath: NSIndexPath, proposedDestinationIndexPath: NSIndexPath): NSIndexPath;

	tableViewTitleForDeleteConfirmationButtonForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): string;

	tableViewTitleForFooterInSection(tableView: UITableView, section: number): string;

	tableViewTitleForHeaderInSection(tableView: UITableView, section: number): string;

	tableViewTrailingSwipeActionsConfigurationForRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): UISwipeActionsConfiguration;

	tableViewViewForFooterInSection(tableView: UITableView, section: number): UIView;

	tableViewViewForHeaderInSection(tableView: UITableView, section: number): UIView;

	tableViewWillBeginEditingRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): void;

	tableViewWillDeselectRowAtIndexPath(tableView: UITableView, indexPath: NSIndexPath): NSIndexPath;

	tableViewWillDisplayCellForRowAtIndexPath(tableView: UITableView, cell: UITableViewCell, indexPath: NSIndexPath): void;

	tableViewWillDisplayContextMenuWithConfigurationAnimator(tableView: UITableView, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionAnimating): void;

	tableViewWillDisplayFooterViewForSection(tableView: UITableView, view: UIView, section: number): void;

	tableViewWillDisplayHeaderViewForSection(tableView: UITableView, view: UIView, section: number): void;

	tableViewWillEndContextMenuInteractionWithConfigurationAnimator(tableView: UITableView, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionAnimating): void;

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

	indexPathForPreferredFocusedViewInTableView?(tableView: UITableView): NSIndexPath;

	tableViewAccessoryButtonTappedForRowWithIndexPath?(tableView: UITableView, indexPath: NSIndexPath): void;

	tableViewAccessoryTypeForRowWithIndexPath?(tableView: UITableView, indexPath: NSIndexPath): UITableViewCellAccessoryType;

	tableViewCanFocusRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): boolean;

	tableViewCanPerformActionForRowAtIndexPathWithSender?(tableView: UITableView, action: string, indexPath: NSIndexPath, sender: any): boolean;

	tableViewCanPerformPrimaryActionForRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): boolean;

	tableViewContextMenuConfigurationForRowAtIndexPathPoint?(tableView: UITableView, indexPath: NSIndexPath, point: CGPoint): UIContextMenuConfiguration;

	tableViewDidBeginMultipleSelectionInteractionAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): void;

	tableViewDidDeselectRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): void;

	tableViewDidEndDisplayingCellForRowAtIndexPath?(tableView: UITableView, cell: UITableViewCell, indexPath: NSIndexPath): void;

	tableViewDidEndDisplayingFooterViewForSection?(tableView: UITableView, view: UIView, section: number): void;

	tableViewDidEndDisplayingHeaderViewForSection?(tableView: UITableView, view: UIView, section: number): void;

	tableViewDidEndEditingRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): void;

	tableViewDidEndMultipleSelectionInteraction?(tableView: UITableView): void;

	tableViewDidHighlightRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): void;

	tableViewDidSelectRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): void;

	tableViewDidUnhighlightRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): void;

	tableViewDidUpdateFocusInContextWithAnimationCoordinator?(tableView: UITableView, context: UITableViewFocusUpdateContext, coordinator: UIFocusAnimationCoordinator): void;

	tableViewEditActionsForRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): NSArray<UITableViewRowAction>;

	tableViewEditingStyleForRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): UITableViewCellEditingStyle;

	tableViewEstimatedHeightForFooterInSection?(tableView: UITableView, section: number): number;

	tableViewEstimatedHeightForHeaderInSection?(tableView: UITableView, section: number): number;

	tableViewEstimatedHeightForRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): number;

	tableViewHeightForFooterInSection?(tableView: UITableView, section: number): number;

	tableViewHeightForHeaderInSection?(tableView: UITableView, section: number): number;

	tableViewHeightForRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): number;

	tableViewIndentationLevelForRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): number;

	tableViewLeadingSwipeActionsConfigurationForRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): UISwipeActionsConfiguration;

	tableViewPerformActionForRowAtIndexPathWithSender?(tableView: UITableView, action: string, indexPath: NSIndexPath, sender: any): void;

	tableViewPerformPrimaryActionForRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): void;

	tableViewPreviewForDismissingContextMenuWithConfiguration?(tableView: UITableView, configuration: UIContextMenuConfiguration): UITargetedPreview;

	tableViewPreviewForHighlightingContextMenuWithConfiguration?(tableView: UITableView, configuration: UIContextMenuConfiguration): UITargetedPreview;

	tableViewSelectionFollowsFocusForRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): boolean;

	tableViewShouldBeginMultipleSelectionInteractionAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): boolean;

	tableViewShouldHighlightRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): boolean;

	tableViewShouldIndentWhileEditingRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): boolean;

	tableViewShouldShowMenuForRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): boolean;

	tableViewShouldSpringLoadRowAtIndexPathWithContext?(tableView: UITableView, indexPath: NSIndexPath, context: UISpringLoadedInteractionContext): boolean;

	tableViewShouldUpdateFocusInContext?(tableView: UITableView, context: UITableViewFocusUpdateContext): boolean;

	tableViewTargetIndexPathForMoveFromRowAtIndexPathToProposedIndexPath?(tableView: UITableView, sourceIndexPath: NSIndexPath, proposedDestinationIndexPath: NSIndexPath): NSIndexPath;

	tableViewTitleForDeleteConfirmationButtonForRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): string;

	tableViewTrailingSwipeActionsConfigurationForRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): UISwipeActionsConfiguration;

	tableViewViewForFooterInSection?(tableView: UITableView, section: number): UIView;

	tableViewViewForHeaderInSection?(tableView: UITableView, section: number): UIView;

	tableViewWillBeginEditingRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): void;

	tableViewWillDeselectRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): NSIndexPath;

	tableViewWillDisplayCellForRowAtIndexPath?(tableView: UITableView, cell: UITableViewCell, indexPath: NSIndexPath): void;

	tableViewWillDisplayContextMenuWithConfigurationAnimator?(tableView: UITableView, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionAnimating): void;

	tableViewWillDisplayFooterViewForSection?(tableView: UITableView, view: UIView, section: number): void;

	tableViewWillDisplayHeaderViewForSection?(tableView: UITableView, view: UIView, section: number): void;

	tableViewWillEndContextMenuInteractionWithConfigurationAnimator?(tableView: UITableView, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionAnimating): void;

	tableViewWillPerformPreviewActionForMenuWithConfigurationAnimator?(tableView: UITableView, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionCommitAnimating): void;

	tableViewWillSelectRowAtIndexPath?(tableView: UITableView, indexPath: NSIndexPath): NSIndexPath;
}
declare var UITableViewDelegate: {

	prototype: UITableViewDelegate;
};

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

	applySnapshotAnimatingDifferences(snapshot: NSDiffableDataSourceSnapshot<SectionIdentifierType, ItemIdentifierType>, animatingDifferences: boolean): void;

	applySnapshotAnimatingDifferencesCompletion(snapshot: NSDiffableDataSourceSnapshot<SectionIdentifierType, ItemIdentifierType>, animatingDifferences: boolean, completion: () => void): void;

	applySnapshotUsingReloadData(snapshot: NSDiffableDataSourceSnapshot<SectionIdentifierType, ItemIdentifierType>): void;

	applySnapshotUsingReloadDataCompletion(snapshot: NSDiffableDataSourceSnapshot<SectionIdentifierType, ItemIdentifierType>, completion: () => void): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	indexForSectionIdentifier(identifier: SectionIdentifierType): number;

	indexPathForItemIdentifier(identifier: ItemIdentifierType): NSIndexPath;

	initWithTableViewCellProvider(tableView: UITableView, cellProvider: (p1: UITableView, p2: NSIndexPath, p3: any) => UITableViewCell): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	itemIdentifierForIndexPath(indexPath: NSIndexPath): ItemIdentifierType;

	numberOfSectionsInTableView(tableView: UITableView): number;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	sectionIdentifierForIndex(index: number): SectionIdentifierType;

	sectionIndexTitlesForTableView(tableView: UITableView): NSArray<string>;

	self(): this;

	snapshot(): NSDiffableDataSourceSnapshot<SectionIdentifierType, ItemIdentifierType>;

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

declare const enum UITableViewDropIntent {

	Unspecified = 0,

	InsertAtDestinationIndexPath = 1,

	InsertIntoDestinationIndexPath = 2,

	Automatic = 3
}

interface UITableViewDropItem extends NSObjectProtocol {

	dragItem: UIDragItem;

	previewSize: CGSize;

	sourceIndexPath: NSIndexPath;
}
declare var UITableViewDropItem: {

	prototype: UITableViewDropItem;
};

declare class UITableViewDropPlaceholder extends UITableViewPlaceholder {

	static alloc(): UITableViewDropPlaceholder; // inherited from NSObject

	static new(): UITableViewDropPlaceholder; // inherited from NSObject

	previewParametersProvider: (p1: UITableViewCell) => UIDragPreviewParameters;
}

interface UITableViewDropPlaceholderContext extends UIDragAnimating {

	dragItem: UIDragItem;

	commitInsertionWithDataSourceUpdates(dataSourceUpdates: (p1: NSIndexPath) => void): boolean;

	deletePlaceholder(): boolean;
}
declare var UITableViewDropPlaceholderContext: {

	prototype: UITableViewDropPlaceholderContext;
};

declare class UITableViewDropProposal extends UIDropProposal {

	static alloc(): UITableViewDropProposal; // inherited from NSObject

	static new(): UITableViewDropProposal; // inherited from NSObject

	readonly intent: UITableViewDropIntent;

	constructor(o: { dropOperation: UIDropOperation; intent: UITableViewDropIntent; });

	initWithDropOperationIntent(operation: UIDropOperation, intent: UITableViewDropIntent): this;
}

declare class UITableViewFocusUpdateContext extends UIFocusUpdateContext {

	static alloc(): UITableViewFocusUpdateContext; // inherited from NSObject

	static new(): UITableViewFocusUpdateContext; // inherited from NSObject

	readonly nextFocusedIndexPath: NSIndexPath;

	readonly previouslyFocusedIndexPath: NSIndexPath;
}

declare class UITableViewHeaderFooterView extends UIView {

	static alloc(): UITableViewHeaderFooterView; // inherited from NSObject

	static appearance(): UITableViewHeaderFooterView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UITableViewHeaderFooterView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UITableViewHeaderFooterView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UITableViewHeaderFooterView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UITableViewHeaderFooterView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UITableViewHeaderFooterView; // inherited from UIAppearance

	static new(): UITableViewHeaderFooterView; // inherited from NSObject

	automaticallyUpdatesBackgroundConfiguration: boolean;

	automaticallyUpdatesContentConfiguration: boolean;

	backgroundConfiguration: UIBackgroundConfiguration;

	backgroundView: UIView;

	readonly configurationState: UIViewConfigurationState;

	configurationUpdateHandler: (p1: UITableViewHeaderFooterView, p2: UIViewConfigurationState) => void;

	contentConfiguration: UIContentConfiguration;

	readonly contentView: UIView;

	readonly detailTextLabel: UILabel;

	readonly reuseIdentifier: string;

	readonly textLabel: UILabel;

	constructor(o: { reuseIdentifier: string; });

	defaultBackgroundConfiguration(): UIBackgroundConfiguration;

	defaultContentConfiguration(): UIListContentConfiguration;

	initWithReuseIdentifier(reuseIdentifier: string): this;

	prepareForReuse(): void;

	setNeedsUpdateConfiguration(): void;

	updateConfigurationUsingState(state: UIViewConfigurationState): void;
}

declare var UITableViewIndexSearch: string;

declare class UITableViewPlaceholder extends NSObject {

	static alloc(): UITableViewPlaceholder; // inherited from NSObject

	static new(): UITableViewPlaceholder; // inherited from NSObject

	cellUpdateHandler: (p1: UITableViewCell) => void;

	constructor(o: { insertionIndexPath: NSIndexPath; reuseIdentifier: string; rowHeight: number; });

	initWithInsertionIndexPathReuseIdentifierRowHeight(insertionIndexPath: NSIndexPath, reuseIdentifier: string, rowHeight: number): this;
}

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

declare const enum UITableViewSelfSizingInvalidation {

	Disabled = 0,

	Enabled = 1,

	EnabledIncludingConstraints = 2
}

declare const enum UITableViewSeparatorInsetReference {

	FromCellEdges = 0,

	FromAutomaticInsets = 1
}

declare const enum UITableViewStyle {

	Plain = 0,

	Grouped = 1,

	InsetGrouped = 2
}

declare class UITapGestureRecognizer extends UIGestureRecognizer {

	static alloc(): UITapGestureRecognizer; // inherited from NSObject

	static new(): UITapGestureRecognizer; // inherited from NSObject

	buttonMaskRequired: UIEventButtonMask;

	numberOfTapsRequired: number;

	numberOfTouchesRequired: number;
}

declare class UITargetedDragPreview extends UITargetedPreview {

	static alloc(): UITargetedDragPreview; // inherited from NSObject

	static new(): UITargetedDragPreview; // inherited from NSObject

	static previewForURLTarget(url: NSURL, target: UIDragPreviewTarget): UITargetedDragPreview;

	static previewForURLTitleTarget(url: NSURL, title: string, target: UIDragPreviewTarget): UITargetedDragPreview;

	retargetedPreviewWithTarget(newTarget: UIDragPreviewTarget): UITargetedDragPreview;
}

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

declare const enum UITextAlignment {

	Left = 0,

	Center = 1,

	Right = 2
}

declare const enum UITextAlternativeStyle {

	None = 0,

	LowConfidence = 1
}

declare var UITextAttributeFont: string;

declare var UITextAttributeTextColor: string;

declare var UITextAttributeTextShadowColor: string;

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

declare var UITextContentTypeAddressCity: string;

declare var UITextContentTypeAddressCityAndState: string;

declare var UITextContentTypeAddressState: string;

declare var UITextContentTypeCountryName: string;

declare var UITextContentTypeCreditCardNumber: string;

declare var UITextContentTypeDateTime: string;

declare var UITextContentTypeEmailAddress: string;

declare var UITextContentTypeFamilyName: string;

declare var UITextContentTypeFlightNumber: string;

declare var UITextContentTypeFullStreetAddress: string;

declare var UITextContentTypeGivenName: string;

declare var UITextContentTypeJobTitle: string;

declare var UITextContentTypeLocation: string;

declare var UITextContentTypeMiddleName: string;

declare var UITextContentTypeName: string;

declare var UITextContentTypeNamePrefix: string;

declare var UITextContentTypeNameSuffix: string;

declare var UITextContentTypeNewPassword: string;

declare var UITextContentTypeNickname: string;

declare var UITextContentTypeOneTimeCode: string;

declare var UITextContentTypeOrganizationName: string;

declare var UITextContentTypePassword: string;

declare var UITextContentTypePostalCode: string;

declare var UITextContentTypeShipmentTrackingNumber: string;

declare var UITextContentTypeStreetAddressLine1: string;

declare var UITextContentTypeStreetAddressLine2: string;

declare var UITextContentTypeSublocality: string;

declare var UITextContentTypeTelephoneNumber: string;

declare var UITextContentTypeURL: string;

declare var UITextContentTypeUsername: string;

interface UITextDocumentProxy extends UIKeyInput {

	documentContextAfterInput: string;

	documentContextBeforeInput: string;

	documentIdentifier: NSUUID;

	documentInputMode: UITextInputMode;

	selectedText: string;

	adjustTextPositionByCharacterOffset(offset: number): void;

	setMarkedTextSelectedRange(markedText: string, selectedRange: NSRange): void;

	unmarkText(): void;
}
declare var UITextDocumentProxy: {

	prototype: UITextDocumentProxy;
};

interface UITextDragDelegate extends NSObjectProtocol {

	textDraggableViewDragPreviewForLiftingItemSession?(textDraggableView: UIView, item: UIDragItem, session: UIDragSession): UITargetedDragPreview;

	textDraggableViewDragSessionDidEndWithOperation?(textDraggableView: UIView, session: UIDragSession, operation: UIDropOperation): void;

	textDraggableViewDragSessionWillBegin?(textDraggableView: UIView, session: UIDragSession): void;

	textDraggableViewItemsForDrag?(textDraggableView: UIView, dragRequest: UITextDragRequest): NSArray<UIDragItem>;

	textDraggableViewWillAnimateLiftWithAnimatorSession?(textDraggableView: UIView, animator: UIDragAnimating, session: UIDragSession): void;
}
declare var UITextDragDelegate: {

	prototype: UITextDragDelegate;
};

declare const enum UITextDragOptions {

	sNone = 0,

	StripTextColorFromPreviews = 1
}

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

interface UITextDraggable extends UITextInput {

	textDragActive: boolean;

	textDragDelegate: UITextDragDelegate;

	textDragInteraction: UIDragInteraction;

	textDragOptions: UITextDragOptions;
}
declare var UITextDraggable: {

	prototype: UITextDraggable;
};

declare const enum UITextDropAction {

	Insert = 0,

	ReplaceSelection = 1,

	ReplaceAll = 2
}

interface UITextDropDelegate extends NSObjectProtocol {

	textDroppableViewDropSessionDidEnd?(textDroppableView: UIView, session: UIDropSession): void;

	textDroppableViewDropSessionDidEnter?(textDroppableView: UIView, session: UIDropSession): void;

	textDroppableViewDropSessionDidExit?(textDroppableView: UIView, session: UIDropSession): void;

	textDroppableViewDropSessionDidUpdate?(textDroppableView: UIView, session: UIDropSession): void;

	textDroppableViewPreviewForDroppingAllItemsWithDefault?(textDroppableView: UIView, defaultPreview: UITargetedDragPreview): UITargetedDragPreview;

	textDroppableViewProposalForDrop?(textDroppableView: UIView, drop: UITextDropRequest): UITextDropProposal;

	textDroppableViewWillBecomeEditableForDrop?(textDroppableView: UIView, drop: UITextDropRequest): UITextDropEditability;

	textDroppableViewWillPerformDrop?(textDroppableView: UIView, drop: UITextDropRequest): void;
}
declare var UITextDropDelegate: {

	prototype: UITextDropDelegate;
};

declare const enum UITextDropEditability {

	No = 0,

	Temporary = 1,

	Yes = 2
}

declare const enum UITextDropPerformer {

	View = 0,

	Delegate = 1
}

declare const enum UITextDropProgressMode {

	System = 0,

	Custom = 1
}

declare class UITextDropProposal extends UIDropProposal implements NSCopying {

	static alloc(): UITextDropProposal; // inherited from NSObject

	static new(): UITextDropProposal; // inherited from NSObject

	dropAction: UITextDropAction;

	dropPerformer: UITextDropPerformer;

	dropProgressMode: UITextDropProgressMode;

	useFastSameViewOperations: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

interface UITextDropRequest extends NSObjectProtocol {

	dropPosition: UITextPosition;

	dropSession: UIDropSession;

	sameView: boolean;

	suggestedProposal: UITextDropProposal;
}
declare var UITextDropRequest: {

	prototype: UITextDropRequest;
};

interface UITextDroppable extends UITextInput, UITextPasteConfigurationSupporting {

	textDropActive: boolean;

	textDropDelegate: UITextDropDelegate;

	textDropInteraction: UIDropInteraction;
}
declare var UITextDroppable: {

	prototype: UITextDroppable;
};

declare class UITextField extends UIControl implements NSCoding, UIContentSizeCategoryAdjusting, UITextDraggable, UITextDroppable, UITextInput, UITextPasteConfigurationSupporting {

	static alloc(): UITextField; // inherited from NSObject

	static appearance(): UITextField; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UITextField; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UITextField; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UITextField; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UITextField; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UITextField; // inherited from UIAppearance

	static new(): UITextField; // inherited from NSObject

	adjustsFontSizeToFitWidth: boolean;

	allowsEditingTextAttributes: boolean;

	attributedPlaceholder: NSAttributedString;

	attributedText: NSAttributedString;

	background: UIImage;

	borderStyle: UITextBorderStyle;

	clearButtonMode: UITextFieldViewMode;

	clearsOnBeginEditing: boolean;

	clearsOnInsertion: boolean;

	defaultTextAttributes: NSDictionary<string, any>;

	delegate: UITextFieldDelegate;

	disabledBackground: UIImage;

	readonly editing: boolean;

	font: UIFont;

	inputAccessoryView: UIView;

	inputView: UIView;

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

	typingAttributes: NSDictionary<string, any>;

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

	inputDelegate: UITextInputDelegate; // inherited from UITextInput

	readonly insertDictationResultPlaceholder: any; // inherited from UITextInput

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	keyboardAppearance: UIKeyboardAppearance; // inherited from UITextInputTraits

	keyboardType: UIKeyboardType; // inherited from UITextInputTraits

	readonly markedTextRange: UITextRange; // inherited from UITextInput

	markedTextStyle: NSDictionary<string, any>; // inherited from UITextInput

	passwordRules: UITextInputPasswordRules; // inherited from UITextInputTraits

	pasteConfiguration: UIPasteConfiguration; // inherited from UIPasteConfigurationSupporting

	pasteDelegate: UITextPasteDelegate; // inherited from UITextPasteConfigurationSupporting

	returnKeyType: UIReturnKeyType; // inherited from UITextInputTraits

	secureTextEntry: boolean; // inherited from UITextInputTraits

	selectedTextRange: UITextRange; // inherited from UITextInput

	selectionAffinity: UITextStorageDirection; // inherited from UITextInput

	smartDashesType: UITextSmartDashesType; // inherited from UITextInputTraits

	smartInsertDeleteType: UITextSmartInsertDeleteType; // inherited from UITextInputTraits

	smartQuotesType: UITextSmartQuotesType; // inherited from UITextInputTraits

	spellCheckingType: UITextSpellCheckingType; // inherited from UITextInputTraits

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

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

	readonly  // inherited from NSObjectProtocol

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	baseWritingDirectionForPositionInDirection(position: UITextPosition, direction: UITextStorageDirection): NSWritingDirection;

	beginFloatingCursorAtPoint(point: CGPoint): void;

	borderRectForBounds(bounds: CGRect): CGRect;

	canPasteItemProviders(itemProviders: NSArray<NSItemProvider> | NSItemProvider[]): boolean;

	caretRectForPosition(position: UITextPosition): CGRect;

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

	drawTextInRect(rect: CGRect): void;

	editMenuForTextRangeSuggestedActions(textRange: UITextRange, suggestedActions: NSArray<UIMenuElement> | UIMenuElement[]): UIMenu;

	editingRectForBounds(bounds: CGRect): CGRect;

	encodeWithCoder(coder: NSCoder): void;

	endFloatingCursor(): void;

	firstRectForRange(range: UITextRange): CGRect;

	frameForDictationResultPlaceholder(placeholder: any): CGRect;

	initWithCoder(coder: NSCoder): this;

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

	replaceRangeWithText(range: UITextRange, text: string): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	rightViewRectForBounds(bounds: CGRect): CGRect;

	selectionRectsForRange(range: UITextRange): NSArray<UITextSelectionRect>;

	self(): this;

	setAttributedMarkedTextSelectedRange(markedText: NSAttributedString, selectedRange: NSRange): void;

	setBaseWritingDirectionForRange(writingDirection: NSWritingDirection, range: UITextRange): void;

	setMarkedTextSelectedRange(markedText: string, selectedRange: NSRange): void;

	shouldChangeTextInRangeReplacementText(range: UITextRange, text: string): boolean;

	textInRange(range: UITextRange): string;

	textRangeFromPositionToPosition(fromPosition: UITextPosition, toPosition: UITextPosition): UITextRange;

	textRectForBounds(bounds: CGRect): CGRect;

	textStylingAtPositionInDirection(position: UITextPosition, direction: UITextStorageDirection): NSDictionary<string, any>;

	unmarkText(): void;

	updateFloatingCursorAtPoint(point: CGPoint): void;
}

interface UITextFieldDelegate extends NSObjectProtocol {

	textFieldDidBeginEditing?(textField: UITextField): void;

	textFieldDidChangeSelection?(textField: UITextField): void;

	textFieldDidEndEditing?(textField: UITextField): void;

	textFieldDidEndEditingReason?(textField: UITextField, reason: UITextFieldDidEndEditingReason): void;

	textFieldEditMenuForCharactersInRangeSuggestedActions?(textField: UITextField, range: NSRange, suggestedActions: NSArray<UIMenuElement> | UIMenuElement[]): UIMenu;

	textFieldShouldBeginEditing?(textField: UITextField): boolean;

	textFieldShouldChangeCharactersInRangeReplacementString?(textField: UITextField, range: NSRange, string: string): boolean;

	textFieldShouldClear?(textField: UITextField): boolean;

	textFieldShouldEndEditing?(textField: UITextField): boolean;

	textFieldShouldReturn?(textField: UITextField): boolean;
}
declare var UITextFieldDelegate: {

	prototype: UITextFieldDelegate;
};

declare const enum UITextFieldDidEndEditingReason {

	Committed = 0,

	Cancelled = 1
}

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

interface UITextFormattingCoordinatorDelegate extends NSObjectProtocol {

	updateTextAttributesWithConversionHandler(conversionHandler: (p1: NSDictionary<string, any>) => NSDictionary<string, any>): void;
}
declare var UITextFormattingCoordinatorDelegate: {

	prototype: UITextFormattingCoordinatorDelegate;
};

declare const enum UITextGranularity {

	Character = 0,

	Word = 1,

	Sentence = 2,

	Paragraph = 3,

	Line = 4,

	Document = 5
}

interface UITextInput extends UIKeyInput {

	beginningOfDocument: UITextPosition;

	endOfDocument: UITextPosition;

	inputDelegate: UITextInputDelegate;

	insertDictationResultPlaceholder?: any;

	markedTextRange: UITextRange;

	markedTextStyle: NSDictionary<string, any>;

	selectedTextRange: UITextRange;

	selectionAffinity?: UITextStorageDirection;

	textInputView?: UIView;

	tokenizer: UITextInputTokenizer;

	baseWritingDirectionForPositionInDirection(position: UITextPosition, direction: UITextStorageDirection): NSWritingDirection;

	beginFloatingCursorAtPoint?(point: CGPoint): void;

	caretRectForPosition(position: UITextPosition): CGRect;

	characterOffsetOfPositionWithinRange?(position: UITextPosition, range: UITextRange): number;

	characterRangeAtPoint(point: CGPoint): UITextRange;

	characterRangeByExtendingPositionInDirection(position: UITextPosition, direction: UITextLayoutDirection): UITextRange;

	closestPositionToPoint(point: CGPoint): UITextPosition;

	closestPositionToPointWithinRange(point: CGPoint, range: UITextRange): UITextPosition;

	comparePositionToPosition(position: UITextPosition, other: UITextPosition): NSComparisonResult;

	dictationRecognitionFailed?(): void;

	dictationRecordingDidEnd?(): void;

	editMenuForTextRangeSuggestedActions?(textRange: UITextRange, suggestedActions: NSArray<UIMenuElement> | UIMenuElement[]): UIMenu;

	endFloatingCursor?(): void;

	firstRectForRange(range: UITextRange): CGRect;

	frameForDictationResultPlaceholder?(placeholder: any): CGRect;

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

	replaceRangeWithText(range: UITextRange, text: string): void;

	selectionRectsForRange(range: UITextRange): NSArray<UITextSelectionRect>;

	setAttributedMarkedTextSelectedRange?(markedText: NSAttributedString, selectedRange: NSRange): void;

	setBaseWritingDirectionForRange(writingDirection: NSWritingDirection, range: UITextRange): void;

	setMarkedTextSelectedRange(markedText: string, selectedRange: NSRange): void;

	shouldChangeTextInRangeReplacementText?(range: UITextRange, text: string): boolean;

	textInRange(range: UITextRange): string;

	textRangeFromPositionToPosition(fromPosition: UITextPosition, toPosition: UITextPosition): UITextRange;

	textStylingAtPositionInDirection?(position: UITextPosition, direction: UITextStorageDirection): NSDictionary<string, any>;

	unmarkText(): void;

	updateFloatingCursorAtPoint?(point: CGPoint): void;
}
declare var UITextInput: {

	prototype: UITextInput;
};

declare class UITextInputAssistantItem extends NSObject {

	static alloc(): UITextInputAssistantItem; // inherited from NSObject

	static new(): UITextInputAssistantItem; // inherited from NSObject

	allowsHidingShortcuts: boolean;

	leadingBarButtonGroups: NSArray<UIBarButtonItemGroup>;

	trailingBarButtonGroups: NSArray<UIBarButtonItemGroup>;
}

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

declare class UITextInputMode extends NSObject implements NSSecureCoding {

	static alloc(): UITextInputMode; // inherited from NSObject

	static currentInputMode(): UITextInputMode;

	static new(): UITextInputMode; // inherited from NSObject

	readonly primaryLanguage: string;

	static readonly activeInputModes: NSArray<UITextInputMode>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

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

declare class UITextInputStringTokenizer extends NSObject implements UITextInputTokenizer {

	static alloc(): UITextInputStringTokenizer; // inherited from NSObject

	static new(): UITextInputStringTokenizer; // inherited from NSObject

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { textInput: UIResponder; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithTextInput(textInput: UIResponder): this;

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

declare var UITextInputTextBackgroundColorKey: string;

declare var UITextInputTextColorKey: string;

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

	keyboardAppearance?: UIKeyboardAppearance;

	keyboardType?: UIKeyboardType;

	passwordRules?: UITextInputPasswordRules;

	returnKeyType?: UIReturnKeyType;

	secureTextEntry?: boolean;

	smartDashesType?: UITextSmartDashesType;

	smartInsertDeleteType?: UITextSmartInsertDeleteType;

	smartQuotesType?: UITextSmartQuotesType;

	spellCheckingType?: UITextSpellCheckingType;

	textContentType?: string;
}
declare var UITextInputTraits: {

	prototype: UITextInputTraits;
};

declare class UITextInteraction extends NSObject implements UIInteraction {

	static alloc(): UITextInteraction; // inherited from NSObject

	static new(): UITextInteraction; // inherited from NSObject

	static textInteractionForMode(mode: UITextInteractionMode): UITextInteraction;

	delegate: UITextInteractionDelegate;

	readonly gesturesForFailureRequirements: NSArray<UIGestureRecognizer>;

	textInput: UIResponder;

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

declare const enum UITextItemInteraction {

	InvokeDefaultAction = 0,

	PresentActions = 1,

	Preview = 2
}

declare const enum UITextLayoutDirection {

	Right = 2,

	Left = 3,

	Up = 4,

	Down = 5
}

interface UITextPasteConfigurationSupporting extends UIPasteConfigurationSupporting {

	pasteDelegate: UITextPasteDelegate;
}
declare var UITextPasteConfigurationSupporting: {

	prototype: UITextPasteConfigurationSupporting;
};

interface UITextPasteDelegate extends NSObjectProtocol {

	textPasteConfigurationSupportingCombineItemAttributedStringsForRange?(textPasteConfigurationSupporting: UITextPasteConfigurationSupporting, itemStrings: NSArray<NSAttributedString> | NSAttributedString[], textRange: UITextRange): NSAttributedString;

	textPasteConfigurationSupportingPerformPasteOfAttributedStringToRange?(textPasteConfigurationSupporting: UITextPasteConfigurationSupporting, attributedString: NSAttributedString, textRange: UITextRange): UITextRange;

	textPasteConfigurationSupportingShouldAnimatePasteOfAttributedStringToRange?(textPasteConfigurationSupporting: UITextPasteConfigurationSupporting, attributedString: NSAttributedString, textRange: UITextRange): boolean;

	textPasteConfigurationSupportingTransformPasteItem?(textPasteConfigurationSupporting: UITextPasteConfigurationSupporting, item: UITextPasteItem): void;
}
declare var UITextPasteDelegate: {

	prototype: UITextPasteDelegate;
};

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

declare class UITextPlaceholder extends NSObject {

	static alloc(): UITextPlaceholder; // inherited from NSObject

	static new(): UITextPlaceholder; // inherited from NSObject

	readonly rects: NSArray<UITextSelectionRect>;
}

declare class UITextPosition extends NSObject {

	static alloc(): UITextPosition; // inherited from NSObject

	static new(): UITextPosition; // inherited from NSObject
}

declare class UITextRange extends NSObject {

	static alloc(): UITextRange; // inherited from NSObject

	static new(): UITextRange; // inherited from NSObject

	readonly empty: boolean;

	readonly end: UITextPosition;

	readonly start: UITextPosition;
}

interface UITextSearchAggregator extends NSObjectProtocol {

	allFoundRanges: NSOrderedSet<UITextRange>;

	finishedSearching(): void;

	foundRangeForSearchStringInDocument(range: UITextRange, string: string, document: any): void;

	invalidateFoundRangeInDocument(range: UITextRange, document: any): void;
}
declare var UITextSearchAggregator: {

	prototype: UITextSearchAggregator;
};

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

declare class UITextSearchOptions extends NSObject {

	static alloc(): UITextSearchOptions; // inherited from NSObject

	static new(): UITextSearchOptions; // inherited from NSObject

	readonly stringCompareOptions: NSStringCompareOptions;

	readonly wordMatchMethod: UITextSearchMatchMethod;
}

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

declare class UITextSearchingFindSession extends UIFindSession {

	static alloc(): UITextSearchingFindSession; // inherited from NSObject

	static new(): UITextSearchingFindSession; // inherited from NSObject

	readonly searchableObject: UITextSearching;

	constructor(o: { searchableObject: UITextSearching; });

	initWithSearchableObject(searchableObject: UITextSearching): this;
}

declare class UITextSelectionRect extends NSObject {

	static alloc(): UITextSelectionRect; // inherited from NSObject

	static new(): UITextSelectionRect; // inherited from NSObject

	readonly containsEnd: boolean;

	readonly containsStart: boolean;

	readonly isVertical: boolean;

	readonly rect: CGRect;

	readonly writingDirection: NSWritingDirection;
}

declare const enum UITextSmartDashesType {

	Default = 0,

	No = 1,

	Yes = 2
}

declare const enum UITextSmartInsertDeleteType {

	Default = 0,

	No = 1,

	Yes = 2
}

declare const enum UITextSmartQuotesType {

	Default = 0,

	No = 1,

	Yes = 2
}

declare const enum UITextSpellCheckingType {

	Default = 0,

	No = 1,

	Yes = 2
}

declare const enum UITextStorageDirection {

	Forward = 0,

	Backward = 1
}

declare class UITextView extends UIScrollView implements UIContentSizeCategoryAdjusting, UIFindInteractionDelegate, UITextDraggable, UITextDroppable, UITextInput, UITextPasteConfigurationSupporting, UITextSearching {

	static alloc(): UITextView; // inherited from NSObject

	static appearance(): UITextView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UITextView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UITextView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UITextView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UITextView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UITextView; // inherited from UIAppearance

	static new(): UITextView; // inherited from NSObject

	static textViewUsingTextLayoutManager(usingTextLayoutManager: boolean): UITextView;

	allowsEditingTextAttributes: boolean;

	attributedText: NSAttributedString;

	clearsOnInsertion: boolean;

	dataDetectorTypes: UIDataDetectorTypes;

	delegate: UITextViewDelegate;

	editable: boolean;

	readonly findInteraction: UIFindInteraction;

	findInteractionEnabled: boolean;

	font: UIFont;

	inputAccessoryView: UIView;

	inputView: UIView;

	interactionState: any;

	readonly layoutManager: NSLayoutManager;

	linkTextAttributes: NSDictionary<string, any>;

	selectable: boolean;

	selectedRange: NSRange;

	text: string;

	textAlignment: NSTextAlignment;

	textColor: UIColor;

	readonly textContainer: NSTextContainer;

	textContainerInset: UIEdgeInsets;

	readonly textLayoutManager: NSTextLayoutManager;

	readonly textStorage: NSTextStorage;

	typingAttributes: NSDictionary<string, any>;

	usesStandardTextScaling: boolean;

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

	inputDelegate: UITextInputDelegate; // inherited from UITextInput

	readonly insertDictationResultPlaceholder: any; // inherited from UITextInput

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	keyboardAppearance: UIKeyboardAppearance; // inherited from UITextInputTraits

	keyboardType: UIKeyboardType; // inherited from UITextInputTraits

	readonly markedTextRange: UITextRange; // inherited from UITextInput

	markedTextStyle: NSDictionary<string, any>; // inherited from UITextInput

	passwordRules: UITextInputPasswordRules; // inherited from UITextInputTraits

	pasteConfiguration: UIPasteConfiguration; // inherited from UIPasteConfigurationSupporting

	pasteDelegate: UITextPasteDelegate; // inherited from UITextPasteConfigurationSupporting

	returnKeyType: UIReturnKeyType; // inherited from UITextInputTraits

	secureTextEntry: boolean; // inherited from UITextInputTraits

	selectedTextRange: UITextRange; // inherited from UITextInput

	readonly selectedTextSearchDocument: any; // inherited from UITextSearching

	selectionAffinity: UITextStorageDirection; // inherited from UITextInput

	smartDashesType: UITextSmartDashesType; // inherited from UITextInputTraits

	smartInsertDeleteType: UITextSmartInsertDeleteType; // inherited from UITextInputTraits

	smartQuotesType: UITextSmartQuotesType; // inherited from UITextInputTraits

	spellCheckingType: UITextSpellCheckingType; // inherited from UITextInputTraits

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly supportsTextReplacement: boolean; // inherited from UITextSearching

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

	readonly  // inherited from NSObjectProtocol

	constructor(o: { frame: CGRect; textContainer: NSTextContainer; });

	baseWritingDirectionForPositionInDirection(position: UITextPosition, direction: UITextStorageDirection): NSWritingDirection;

	beginFloatingCursorAtPoint(point: CGPoint): void;

	canPasteItemProviders(itemProviders: NSArray<NSItemProvider> | NSItemProvider[]): boolean;

	caretRectForPosition(position: UITextPosition): CGRect;

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

	editMenuForTextRangeSuggestedActions(textRange: UITextRange, suggestedActions: NSArray<UIMenuElement> | UIMenuElement[]): UIMenu;

	endFloatingCursor(): void;

	findInteractionDidBeginFindSession(interaction: UIFindInteraction, session: UIFindSession): void;

	findInteractionDidEndFindSession(interaction: UIFindInteraction, session: UIFindSession): void;

	findInteractionSessionForView(interaction: UIFindInteraction, view: UIView): UIFindSession;

	firstRectForRange(range: UITextRange): CGRect;

	frameForDictationResultPlaceholder(placeholder: any): CGRect;

	initWithFrameTextContainer(frame: CGRect, textContainer: NSTextContainer): this;

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

	replaceRangeWithText(range: UITextRange, text: string): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	scrollRangeToVisible(range: NSRange): void;

	scrollRangeToVisibleInDocument(range: UITextRange, document: any): void;

	selectionRectsForRange(range: UITextRange): NSArray<UITextSelectionRect>;

	self(): this;

	setAttributedMarkedTextSelectedRange(markedText: NSAttributedString, selectedRange: NSRange): void;

	setBaseWritingDirectionForRange(writingDirection: NSWritingDirection, range: UITextRange): void;

	setMarkedTextSelectedRange(markedText: string, selectedRange: NSRange): void;

	shouldChangeTextInRangeReplacementText(range: UITextRange, text: string): boolean;

	shouldReplaceFoundTextInRangeInDocumentWithText(range: UITextRange, document: any, replacementText: string): boolean;

	textInRange(range: UITextRange): string;

	textRangeFromPositionToPosition(fromPosition: UITextPosition, toPosition: UITextPosition): UITextRange;

	textStylingAtPositionInDirection(position: UITextPosition, direction: UITextStorageDirection): NSDictionary<string, any>;

	unmarkText(): void;

	updateFloatingCursorAtPoint(point: CGPoint): void;

	willHighlightFoundTextRangeInDocument(range: UITextRange, document: any): void;
}

interface UITextViewDelegate extends NSObjectProtocol, UIScrollViewDelegate {

	textViewDidBeginEditing?(textView: UITextView): void;

	textViewDidChange?(textView: UITextView): void;

	textViewDidChangeSelection?(textView: UITextView): void;

	textViewDidEndEditing?(textView: UITextView): void;

	textViewEditMenuForTextInRangeSuggestedActions?(textView: UITextView, range: NSRange, suggestedActions: NSArray<UIMenuElement> | UIMenuElement[]): UIMenu;

	textViewShouldBeginEditing?(textView: UITextView): boolean;

	textViewShouldChangeTextInRangeReplacementText?(textView: UITextView, range: NSRange, text: string): boolean;

	textViewShouldEndEditing?(textView: UITextView): boolean;

	textViewShouldInteractWithTextAttachmentInRange?(textView: UITextView, textAttachment: NSTextAttachment, characterRange: NSRange): boolean;

	textViewShouldInteractWithTextAttachmentInRangeInteraction?(textView: UITextView, textAttachment: NSTextAttachment, characterRange: NSRange, interaction: UITextItemInteraction): boolean;

	textViewShouldInteractWithURLInRange?(textView: UITextView, URL: NSURL, characterRange: NSRange): boolean;

	textViewShouldInteractWithURLInRangeInteraction?(textView: UITextView, URL: NSURL, characterRange: NSRange, interaction: UITextItemInteraction): boolean;
}
declare var UITextViewDelegate: {

	prototype: UITextViewDelegate;
};

declare var UITextViewTextDidBeginEditingNotification: string;

declare var UITextViewTextDidChangeNotification: string;

declare var UITextViewTextDidEndEditingNotification: string;

declare var UITextWritingDirectionLeftToRight: NSWritingDirection;

declare var UITextWritingDirectionNatural: NSWritingDirection;

declare var UITextWritingDirectionRightToLeft: NSWritingDirection;

interface UITimingCurveProvider extends NSCoding, NSCopying {

	cubicTimingParameters: UICubicTimingParameters;

	springTimingParameters: UISpringTimingParameters;

	timingCurveType: UITimingCurveType;
}
declare var UITimingCurveProvider: {

	prototype: UITimingCurveProvider;
};

declare const enum UITimingCurveType {

	Builtin = 0,

	Cubic = 1,

	Spring = 2,

	Composed = 3
}

declare class UIToolTipConfiguration extends NSObject {

	static alloc(): UIToolTipConfiguration; // inherited from NSObject

	static configurationWithToolTip(toolTip: string): UIToolTipConfiguration;

	static configurationWithToolTipInRect(toolTip: string, sourceRect: CGRect): UIToolTipConfiguration;

	static new(): UIToolTipConfiguration; // inherited from NSObject

	readonly sourceRect: CGRect;

	readonly toolTip: string;
}

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

interface UIToolTipInteractionDelegate extends NSObjectProtocol {

	toolTipInteractionConfigurationAtPoint?(interaction: UIToolTipInteraction, point: CGPoint): UIToolTipConfiguration;
}
declare var UIToolTipInteractionDelegate: {

	prototype: UIToolTipInteractionDelegate;
};

declare class UIToolbar extends UIView implements UIBarPositioning {

	static alloc(): UIToolbar; // inherited from NSObject

	static appearance(): UIToolbar; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UIToolbar; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIToolbar; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIToolbar; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIToolbar; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIToolbar; // inherited from UIAppearance

	static new(): UIToolbar; // inherited from NSObject

	barStyle: UIBarStyle;

	barTintColor: UIColor;

	compactAppearance: UIToolbarAppearance;

	compactScrollEdgeAppearance: UIToolbarAppearance;

	delegate: UIToolbarDelegate;

	items: NSArray<UIBarButtonItem>;

	scrollEdgeAppearance: UIToolbarAppearance;

	standardAppearance: UIToolbarAppearance;

	translucent: boolean;

	readonly barPosition: UIBarPosition; // inherited from UIBarPositioning

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

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

	setBackgroundImageForToolbarPositionBarMetrics(backgroundImage: UIImage, topOrBottom: UIBarPosition, barMetrics: UIBarMetrics): void;

	setItemsAnimated(items: NSArray<UIBarButtonItem> | UIBarButtonItem[], animated: boolean): void;

	setShadowImageForToolbarPosition(shadowImage: UIImage, topOrBottom: UIBarPosition): void;

	shadowImageForToolbarPosition(topOrBottom: UIBarPosition): UIImage;
}

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

declare class UITouch extends NSObject {

	static alloc(): UITouch; // inherited from NSObject

	static new(): UITouch; // inherited from NSObject

	readonly altitudeAngle: number;

	readonly estimatedProperties: UITouchProperties;

	readonly estimatedPropertiesExpectingUpdates: UITouchProperties;

	readonly estimationUpdateIndex: number;

	readonly force: number;

	readonly gestureRecognizers: NSArray<UIGestureRecognizer>;

	readonly majorRadius: number;

	readonly majorRadiusTolerance: number;

	readonly maximumPossibleForce: number;

	readonly phase: UITouchPhase;

	readonly tapCount: number;

	readonly timestamp: number;

	readonly type: UITouchType;

	readonly view: UIView;

	readonly window: UIWindow;

	azimuthAngleInView(view: UIView): number;

	azimuthUnitVectorInView(view: UIView): CGVector;

	locationInNode(node: SKNode): CGPoint;

	locationInView(view: UIView): CGPoint;

	preciseLocationInView(view: UIView): CGPoint;

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

declare const enum UITouchProperties {

	PropertyForce = 1,

	PropertyAzimuth = 2,

	PropertyAltitude = 4,

	PropertyLocation = 8
}

declare const enum UITouchType {

	Direct = 0,

	Indirect = 1,

	Pencil = 2,

	Stylus = 2,

	IndirectPointer = 3
}

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

declare class UITraitCollection extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UITraitCollection; // inherited from NSObject

	static new(): UITraitCollection; // inherited from NSObject

	static traitCollectionWithAccessibilityContrast(accessibilityContrast: UIAccessibilityContrast): UITraitCollection;

	static traitCollectionWithActiveAppearance(userInterfaceActiveAppearance: UIUserInterfaceActiveAppearance): UITraitCollection;

	static traitCollectionWithDisplayGamut(displayGamut: UIDisplayGamut): UITraitCollection;

	static traitCollectionWithDisplayScale(scale: number): UITraitCollection;

	static traitCollectionWithForceTouchCapability(capability: UIForceTouchCapability): UITraitCollection;

	static traitCollectionWithHorizontalSizeClass(horizontalSizeClass: UIUserInterfaceSizeClass): UITraitCollection;

	static traitCollectionWithLayoutDirection(layoutDirection: UITraitEnvironmentLayoutDirection): UITraitCollection;

	static traitCollectionWithLegibilityWeight(legibilityWeight: UILegibilityWeight): UITraitCollection;

	static traitCollectionWithPreferredContentSizeCategory(preferredContentSizeCategory: string): UITraitCollection;

	static traitCollectionWithToolbarItemPresentationSize(toolbarItemPresentationSize: UINSToolbarItemPresentationSize): UITraitCollection;

	static traitCollectionWithTraitsFromCollections(traitCollections: NSArray<UITraitCollection> | UITraitCollection[]): UITraitCollection;

	static traitCollectionWithUserInterfaceIdiom(idiom: UIUserInterfaceIdiom): UITraitCollection;

	static traitCollectionWithUserInterfaceLevel(userInterfaceLevel: UIUserInterfaceLevel): UITraitCollection;

	static traitCollectionWithUserInterfaceStyle(userInterfaceStyle: UIUserInterfaceStyle): UITraitCollection;

	static traitCollectionWithVerticalSizeClass(verticalSizeClass: UIUserInterfaceSizeClass): UITraitCollection;

	readonly accessibilityContrast: UIAccessibilityContrast;

	readonly activeAppearance: UIUserInterfaceActiveAppearance;

	readonly displayGamut: UIDisplayGamut;

	readonly displayScale: number;

	readonly forceTouchCapability: UIForceTouchCapability;

	readonly horizontalSizeClass: UIUserInterfaceSizeClass;

	readonly imageConfiguration: UIImageConfiguration;

	readonly layoutDirection: UITraitEnvironmentLayoutDirection;

	readonly legibilityWeight: UILegibilityWeight;

	readonly preferredContentSizeCategory: string;

	readonly toolbarItemPresentationSize: UINSToolbarItemPresentationSize;

	readonly userInterfaceIdiom: UIUserInterfaceIdiom;

	readonly userInterfaceLevel: UIUserInterfaceLevel;

	readonly userInterfaceStyle: UIUserInterfaceStyle;

	readonly verticalSizeClass: UIUserInterfaceSizeClass;

	static currentTraitCollection: UITraitCollection;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	containsTraitsInCollection(trait: UITraitCollection): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	hasDifferentColorAppearanceComparedToTraitCollection(traitCollection: UITraitCollection): boolean;

	initWithCoder(coder: NSCoder): this;

	performAsCurrentTraitCollection(actions: () => void): void;
}

interface UITraitEnvironment extends NSObjectProtocol {

	traitCollection: UITraitCollection;

	traitCollectionDidChange(previousTraitCollection: UITraitCollection): void;
}
declare var UITraitEnvironment: {

	prototype: UITraitEnvironment;
};

declare const enum UITraitEnvironmentLayoutDirection {

	Unspecified = -1,

	LeftToRight = 0,

	RightToLeft = 1
}

declare var UITransitionContextFromViewControllerKey: string;

declare var UITransitionContextFromViewKey: string;

declare var UITransitionContextToViewControllerKey: string;

declare var UITransitionContextToViewKey: string;

interface UIUserActivityRestoring extends NSObjectProtocol {

	restoreUserActivityState(userActivity: NSUserActivity): void;
}
declare var UIUserActivityRestoring: {

	prototype: UIUserActivityRestoring;
};

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

	Mac = 5
}

declare const enum UIUserInterfaceLayoutDirection {

	LeftToRight = 0,

	RightToLeft = 1
}

declare const enum UIUserInterfaceLevel {

	Unspecified = -1,

	Base = 0,

	Elevated = 1
}

declare const enum UIUserInterfaceSizeClass {

	Unspecified = 0,

	Compact = 1,

	Regular = 2
}

declare const enum UIUserInterfaceStyle {

	Unspecified = 0,

	Light = 1,

	Dark = 2
}

declare class UIUserNotificationAction extends NSObject implements NSCopying, NSMutableCopying, NSSecureCoding {

	static alloc(): UIUserNotificationAction; // inherited from NSObject

	static new(): UIUserNotificationAction; // inherited from NSObject

	readonly activationMode: UIUserNotificationActivationMode;

	readonly authenticationRequired: boolean;

	readonly behavior: UIUserNotificationActionBehavior;

	readonly destructive: boolean;

	readonly identifier: string;

	readonly parameters: NSDictionary<any, any>;

	readonly title: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare const enum UIUserNotificationActionBehavior {

	Default = 0,

	TextInput = 1
}

declare const enum UIUserNotificationActionContext {

	Default = 0,

	Minimal = 1
}

declare var UIUserNotificationActionResponseTypedTextKey: string;

declare const enum UIUserNotificationActivationMode {

	Foreground = 0,

	Background = 1
}

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

declare class UIUserNotificationSettings extends NSObject {

	static alloc(): UIUserNotificationSettings; // inherited from NSObject

	static new(): UIUserNotificationSettings; // inherited from NSObject

	static settingsForTypesCategories(types: UIUserNotificationType, categories: NSSet<UIUserNotificationCategory>): UIUserNotificationSettings;

	readonly categories: NSSet<UIUserNotificationCategory>;

	readonly types: UIUserNotificationType;
}

declare var UIUserNotificationTextInputActionButtonTitleKey: string;

declare const enum UIUserNotificationType {

	None = 0,

	Badge = 1,

	Sound = 2,

	Alert = 4
}

declare class UIVibrancyEffect extends UIVisualEffect {

	static alloc(): UIVibrancyEffect; // inherited from NSObject

	static effectForBlurEffect(blurEffect: UIBlurEffect): UIVibrancyEffect;

	static effectForBlurEffectStyle(blurEffect: UIBlurEffect, style: UIVibrancyEffectStyle): UIVibrancyEffect;

	static new(): UIVibrancyEffect; // inherited from NSObject

	static notificationCenterVibrancyEffect(): UIVibrancyEffect;

	static widgetEffectForVibrancyStyle(vibrancyStyle: UIVibrancyEffectStyle): UIVibrancyEffect;

	static widgetPrimaryVibrancyEffect(): UIVibrancyEffect;

	static widgetSecondaryVibrancyEffect(): UIVibrancyEffect;
}

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

declare function UIVideoAtPathIsCompatibleWithSavedPhotosAlbum(videoPath: string): boolean;

declare class UIVideoEditorController extends UINavigationController {

	static alloc(): UIVideoEditorController; // inherited from NSObject

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

declare class UIView extends UIResponder implements CALayerDelegate, NSCoding, UIAccessibilityIdentification, UIAppearance, UIAppearanceContainer, UICoordinateSpace, UIDynamicItem, UIFocusItem, UIFocusItemContainer, UILargeContentViewerItem, UIPopoverPresentationControllerSourceItem, UITraitEnvironment {

	static addKeyframeWithRelativeStartTimeRelativeDurationAnimations(frameStartTime: number, frameDuration: number, animations: () => void): void;

	static alloc(): UIView; // inherited from NSObject

	static animateKeyframesWithDurationDelayOptionsAnimationsCompletion(duration: number, delay: number, options: UIViewKeyframeAnimationOptions, animations: () => void, completion: (p1: boolean) => void): void;

	static animateWithDurationAnimations(duration: number, animations: () => void): void;

	static animateWithDurationAnimationsCompletion(duration: number, animations: () => void, completion: (p1: boolean) => void): void;

	static animateWithDurationDelayOptionsAnimationsCompletion(duration: number, delay: number, options: UIViewAnimationOptions, animations: () => void, completion: (p1: boolean) => void): void;

	static animateWithDurationDelayUsingSpringWithDampingInitialSpringVelocityOptionsAnimationsCompletion(duration: number, delay: number, dampingRatio: number, velocity: number, options: UIViewAnimationOptions, animations: () => void, completion: (p1: boolean) => void): void;

	static appearance(): UIView;

	static appearanceForTraitCollection(trait: UITraitCollection): UIView;

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIView;

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIView;

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIView;

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIView;

	static beginAnimationsContext(animationID: string, context: interop.Pointer | interop.Reference<any>): void;

	static commitAnimations(): void;

	static modifyAnimationsWithRepeatCountAutoreversesAnimations(count: number, autoreverses: boolean, animations: () => void): void;

	static new(): UIView; // inherited from NSObject

	static performSystemAnimationOnViewsOptionsAnimationsCompletion(animation: UISystemAnimation, views: NSArray<UIView> | UIView[], options: UIViewAnimationOptions, parallelAnimations: () => void, completion: (p1: boolean) => void): void;

	static performWithoutAnimation(actionsWithoutAnimation: () => void): void;

	static setAnimationBeginsFromCurrentState(fromCurrentState: boolean): void;

	static setAnimationCurve(curve: UIViewAnimationCurve): void;

	static setAnimationDelay(delay: number): void;

	static setAnimationDelegate(delegate: any): void;

	static setAnimationDidStopSelector(selector: string): void;

	static setAnimationDuration(duration: number): void;

	static setAnimationRepeatAutoreverses(repeatAutoreverses: boolean): void;

	static setAnimationRepeatCount(repeatCount: number): void;

	static setAnimationStartDate(startDate: Date): void;

	static setAnimationTransitionForViewCache(transition: UIViewAnimationTransition, view: UIView, cache: boolean): void;

	static setAnimationWillStartSelector(selector: string): void;

	static setAnimationsEnabled(enabled: boolean): void;

	static transitionFromViewToViewDurationOptionsCompletion(fromView: UIView, toView: UIView, duration: number, options: UIViewAnimationOptions, completion: (p1: boolean) => void): void;

	static transitionWithViewDurationOptionsAnimationsCompletion(view: UIView, duration: number, options: UIViewAnimationOptions, animations: () => void, completion: (p1: boolean) => void): void;

	static userInterfaceLayoutDirectionForSemanticContentAttribute(attribute: UISemanticContentAttribute): UIUserInterfaceLayoutDirection;

	static userInterfaceLayoutDirectionForSemanticContentAttributeRelativeToLayoutDirection(semanticContentAttribute: UISemanticContentAttribute, layoutDirection: UIUserInterfaceLayoutDirection): UIUserInterfaceLayoutDirection;

	accessibilityIgnoresInvertColors: boolean;

	readonly alignmentRectInsets: UIEdgeInsets;

	alpha: number;

	anchorPoint: CGPoint;

	readonly appliedContentSizeCategoryLimitsDescription: string;

	autoresizesSubviews: boolean;

	autoresizingMask: UIViewAutoresizing;

	backgroundColor: UIColor;

	readonly bottomAnchor: NSLayoutYAxisAnchor;

	bounds: CGRect;

	readonly centerXAnchor: NSLayoutXAxisAnchor;

	readonly centerYAnchor: NSLayoutYAxisAnchor;

	clearsContextBeforeDrawing: boolean;

	clipsToBounds: boolean;

	readonly constraints: NSArray<NSLayoutConstraint>;

	contentMode: UIViewContentMode;

	contentScaleFactor: number;

	contentStretch: CGRect;

	directionalLayoutMargins: NSDirectionalEdgeInsets;

	readonly effectiveUserInterfaceLayoutDirection: UIUserInterfaceLayoutDirection;

	exclusiveTouch: boolean;

	readonly firstBaselineAnchor: NSLayoutYAxisAnchor;

	focusEffect: UIFocusEffect;

	focusGroupIdentifier: string;

	focusGroupPriority: number;

	readonly focused: boolean;

	frame: CGRect;

	gestureRecognizers: NSArray<UIGestureRecognizer>;

	readonly hasAmbiguousLayout: boolean;

	readonly heightAnchor: NSLayoutDimension;

	hidden: boolean;

	insetsLayoutMarginsFromSafeArea: boolean;

	interactions: NSArray<UIInteraction>;

	readonly intrinsicContentSize: CGSize;

	readonly keyboardLayoutGuide: UIKeyboardLayoutGuide;

	largeContentImage: UIImage;

	largeContentImageInsets: UIEdgeInsets;

	largeContentTitle: string;

	readonly lastBaselineAnchor: NSLayoutYAxisAnchor;

	readonly layer: CALayer;

	readonly layoutGuides: NSArray<UILayoutGuide>;

	layoutMargins: UIEdgeInsets;

	readonly layoutMarginsGuide: UILayoutGuide;

	readonly leadingAnchor: NSLayoutXAxisAnchor;

	readonly leftAnchor: NSLayoutXAxisAnchor;

	maskView: UIView;

	maximumContentSizeCategory: string;

	minimumContentSizeCategory: string;

	motionEffects: NSArray<UIMotionEffect>;

	multipleTouchEnabled: boolean;

	opaque: boolean;

	overrideUserInterfaceStyle: UIUserInterfaceStyle;

	preservesSuperviewLayoutMargins: boolean;

	readonly readableContentGuide: UILayoutGuide;

	restorationIdentifier: string;

	readonly rightAnchor: NSLayoutXAxisAnchor;

	readonly safeAreaInsets: UIEdgeInsets;

	readonly safeAreaLayoutGuide: UILayoutGuide;

	scalesLargeContentImage: boolean;

	semanticContentAttribute: UISemanticContentAttribute;

	showsLargeContentViewer: boolean;

	readonly subviews: NSArray<UIView>;

	readonly superview: UIView;

	tag: number;

	tintAdjustmentMode: UIViewTintAdjustmentMode;

	tintColor: UIColor;

	readonly topAnchor: NSLayoutYAxisAnchor;

	readonly trailingAnchor: NSLayoutXAxisAnchor;

	transform3D: CATransform3D;

	translatesAutoresizingMaskIntoConstraints: boolean;

	userInteractionEnabled: boolean;

	readonly viewForFirstBaselineLayout: UIView;

	readonly viewForLastBaselineLayout: UIView;

	readonly widthAnchor: NSLayoutDimension;

	readonly window: UIWindow;

	static readonly areAnimationsEnabled: boolean;

	static readonly inheritedAnimationDuration: number;

	static readonly layerClass: typeof NSObject;

	static readonly requiresConstraintBasedLayout: boolean;

	accessibilityIdentifier: string; // inherited from UIAccessibilityIdentification

	readonly canBecomeFocused: boolean; // inherited from UIFocusItem

	center: CGPoint; // inherited from UIDynamicItem

	readonly collisionBoundingPath: UIBezierPath; // inherited from UIDynamicItem

	readonly collisionBoundsType: UIDynamicItemCollisionBoundsType; // inherited from UIDynamicItem

	readonly coordinateSpace: UICoordinateSpace; // inherited from UIFocusItemContainer

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly focusItemContainer: UIFocusItemContainer; // inherited from UIFocusEnvironment

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly isTransparentFocusItem: boolean; // inherited from UIFocusItem

	readonly parentFocusEnvironment: UIFocusEnvironment; // inherited from UIFocusEnvironment

	readonly preferredFocusEnvironments: NSArray<UIFocusEnvironment>; // inherited from UIFocusEnvironment

	readonly preferredFocusedView: UIView; // inherited from UIFocusEnvironment

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly traitCollection: UITraitCollection; // inherited from UITraitEnvironment

	transform: CGAffineTransform; // inherited from UIDynamicItem

	readonly  // inherited from NSObjectProtocol

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { frame: CGRect; });

	actionForLayerForKey(layer: CALayer, event: string): CAAction;

	addConstraint(constraint: NSLayoutConstraint): void;

	addConstraints(constraints: NSArray<NSLayoutConstraint> | NSLayoutConstraint[]): void;

	addGestureRecognizer(gestureRecognizer: UIGestureRecognizer): void;

	addInteraction(interaction: UIInteraction): void;

	addLayoutGuide(layoutGuide: UILayoutGuide): void;

	addMotionEffect(effect: UIMotionEffect): void;

	addSubview(view: UIView): void;

	alignmentRectForFrame(frame: CGRect): CGRect;

	bringSubviewToFront(view: UIView): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	constraintsAffectingLayoutForAxis(axis: UILayoutConstraintAxis): NSArray<NSLayoutConstraint>;

	contentCompressionResistancePriorityForAxis(axis: UILayoutConstraintAxis): number;

	contentHuggingPriorityForAxis(axis: UILayoutConstraintAxis): number;

	convertPointFromCoordinateSpace(point: CGPoint, coordinateSpace: UICoordinateSpace): CGPoint;

	convertPointFromView(point: CGPoint, view: UIView): CGPoint;

	convertPointToCoordinateSpace(point: CGPoint, coordinateSpace: UICoordinateSpace): CGPoint;

	convertPointToView(point: CGPoint, view: UIView): CGPoint;

	convertRectFromCoordinateSpace(rect: CGRect, coordinateSpace: UICoordinateSpace): CGRect;

	convertRectFromView(rect: CGRect, view: UIView): CGRect;

	convertRectToCoordinateSpace(rect: CGRect, coordinateSpace: UICoordinateSpace): CGRect;

	convertRectToView(rect: CGRect, view: UIView): CGRect;

	decodeRestorableStateWithCoder(coder: NSCoder): void;

	didAddSubview(subview: UIView): void;

	didHintFocusMovement(hint: UIFocusMovementHint): void;

	didMoveToSuperview(): void;

	didMoveToWindow(): void;

	didUpdateFocusInContextWithAnimationCoordinator(context: UIFocusUpdateContext, coordinator: UIFocusAnimationCoordinator): void;

	displayLayer(layer: CALayer): void;

	drawLayerInContext(layer: CALayer, ctx: any): void;

	drawRect(rect: CGRect): void;

	drawRectForViewPrintFormatter(rect: CGRect, formatter: UIViewPrintFormatter): void;

	drawViewHierarchyInRectAfterScreenUpdates(rect: CGRect, afterUpdates: boolean): boolean;

	encodeRestorableStateWithCoder(coder: NSCoder): void;

	encodeWithCoder(coder: NSCoder): void;

	endEditing(force: boolean): boolean;

	exchangeSubviewAtIndexWithSubviewAtIndex(index1: number, index2: number): void;

	exerciseAmbiguityInLayout(): void;

	focusItemsInRect(rect: CGRect): NSArray<UIFocusItem>;

	frameForAlignmentRect(alignmentRect: CGRect): CGRect;

	gestureRecognizerShouldBegin(gestureRecognizer: UIGestureRecognizer): boolean;

	hitTestWithEvent(point: CGPoint, event: _UIEvent): UIView;

	initWithCoder(coder: NSCoder): this;

	initWithFrame(frame: CGRect): this;

	insertSubviewAboveSubview(view: UIView, siblingSubview: UIView): void;

	insertSubviewAtIndex(view: UIView, index: number): void;

	insertSubviewBelowSubview(view: UIView, siblingSubview: UIView): void;

	invalidateIntrinsicContentSize(): void;

	isDescendantOfView(view: UIView): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	layerWillDraw(layer: CALayer): void;

	layoutIfNeeded(): void;

	layoutMarginsDidChange(): void;

	layoutSublayersOfLayer(layer: CALayer): void;

	layoutSubviews(): void;

	nativeScriptSetFormattedTextDecorationAndTransformLetterSpacingLineHeight(details: NSDictionary<any, any>, letterSpacing: number, lineHeight: number): void;

	nativeScriptSetTextDecorationAndTransformTextDecorationLetterSpacingLineHeight(text: string, textDecoration: string, letterSpacing: number, lineHeight: number): void;

	needsUpdateConstraints(): boolean;

	passThroughParent(): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	pointInsideWithEvent(point: CGPoint, event: _UIEvent): boolean;

	removeConstraint(constraint: NSLayoutConstraint): void;

	removeConstraints(constraints: NSArray<NSLayoutConstraint> | NSLayoutConstraint[]): void;

	removeFromSuperview(): void;

	removeGestureRecognizer(gestureRecognizer: UIGestureRecognizer): void;

	removeInteraction(interaction: UIInteraction): void;

	removeLayoutGuide(layoutGuide: UILayoutGuide): void;

	removeMotionEffect(effect: UIMotionEffect): void;

	resizableSnapshotViewFromRectAfterScreenUpdatesWithCapInsets(rect: CGRect, afterUpdates: boolean, capInsets: UIEdgeInsets): UIView;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	safeAreaInsetsDidChange(): void;

	self(): this;

	sendSubviewToBack(view: UIView): void;

	setContentCompressionResistancePriorityForAxis(priority: number, axis: UILayoutConstraintAxis): void;

	setContentHuggingPriorityForAxis(priority: number, axis: UILayoutConstraintAxis): void;

	setNeedsDisplay(): void;

	setNeedsDisplayInRect(rect: CGRect): void;

	setNeedsFocusUpdate(): void;

	setNeedsLayout(): void;

	setNeedsUpdateConstraints(): void;

	setPassThroughParent(passThroughParent: boolean): void;

	shouldUpdateFocusInContext(context: UIFocusUpdateContext): boolean;

	sizeThatFits(size: CGSize): CGSize;

	sizeToFit(): void;

	snapshotViewAfterScreenUpdates(afterUpdates: boolean): UIView;

	systemLayoutSizeFittingSize(targetSize: CGSize): CGSize;

	systemLayoutSizeFittingSizeWithHorizontalFittingPriorityVerticalFittingPriority(targetSize: CGSize, horizontalFittingPriority: number, verticalFittingPriority: number): CGSize;

	tintColorDidChange(): void;

	traitCollectionDidChange(previousTraitCollection: UITraitCollection): void;

	updateConstraints(): void;

	updateConstraintsIfNeeded(): void;

	updateFocusIfNeeded(): void;

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

declare const enum UIViewAnimatingPosition {

	End = 0,

	Start = 1,

	Current = 2
}

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

declare class UIViewConfigurationState extends NSObject implements UIConfigurationState {

	static alloc(): UIViewConfigurationState; // inherited from NSObject

	static new(): UIViewConfigurationState; // inherited from NSObject

	disabled: boolean;

	focused: boolean;

	highlighted: boolean;

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

declare class UIViewController extends UIResponder implements NSCoding, NSExtensionRequestHandling, UIAppearanceContainer, UIContentContainer, UIFocusEnvironment, UIStateRestoring, UITraitEnvironment {

	static alloc(): UIViewController; // inherited from NSObject

	static attemptRotationToDeviceOrientation(): void;

	static new(): UIViewController; // inherited from NSObject

	readonly activePresentationController: UIPresentationController;

	additionalSafeAreaInsets: UIEdgeInsets;

	automaticallyAdjustsScrollViewInsets: boolean;

	readonly beingDismissed: boolean;

	readonly beingPresented: boolean;

	readonly bottomLayoutGuide: UILayoutSupport;

	readonly childViewControllerForHomeIndicatorAutoHidden: UIViewController;

	readonly childViewControllerForPointerLock: UIViewController;

	readonly childViewControllerForScreenEdgesDeferringSystemGestures: UIViewController;

	readonly childViewControllerForStatusBarHidden: UIViewController;

	readonly childViewControllerForStatusBarStyle: UIViewController;

	readonly childViewControllers: NSArray<UIViewController>;

	contentSizeForViewInPopover: CGSize;

	definesPresentationContext: boolean;

	readonly disablesAutomaticKeyboardDismissal: boolean;

	edgesForExtendedLayout: UIRectEdge;

	readonly editButtonItem: UIBarButtonItem;

	editing: boolean;

	extendedLayoutIncludesOpaqueBars: boolean;

	readonly extensionContext: NSExtensionContext;

	focusGroupIdentifier: string;

	hidesBottomBarWhenPushed: boolean;

	interactionActivityTrackingBaseName: string;

	readonly interfaceOrientation: UIInterfaceOrientation;

	modalInPopover: boolean;

	modalInPresentation: boolean;

	modalPresentationCapturesStatusBarAppearance: boolean;

	modalPresentationStyle: UIModalPresentationStyle;

	modalTransitionStyle: UIModalTransitionStyle;

	readonly modalViewController: UIViewController;

	readonly movingFromParentViewController: boolean;

	readonly movingToParentViewController: boolean;

	readonly navigationController: UINavigationController;

	readonly navigationItem: UINavigationItem;

	readonly nibBundle: NSBundle;

	readonly nibName: string;

	overrideUserInterfaceStyle: UIUserInterfaceStyle;

	readonly parentViewController: UIViewController;

	readonly performsActionsWhilePresentingModally: boolean;

	readonly popoverPresentationController: UIPopoverPresentationController;

	preferredContentSize: CGSize;

	readonly preferredInterfaceOrientationForPresentation: UIInterfaceOrientation;

	readonly preferredScreenEdgesDeferringSystemGestures: UIRectEdge;

	readonly preferredStatusBarStyle: UIStatusBarStyle;

	readonly preferredStatusBarUpdateAnimation: UIStatusBarAnimation;

	readonly prefersHomeIndicatorAutoHidden: boolean;

	readonly prefersPointerLocked: boolean;

	readonly prefersStatusBarHidden: boolean;

	readonly presentationController: UIPresentationController;

	readonly presentedViewController: UIViewController;

	readonly presentingViewController: UIViewController;

	readonly previewActionItems: NSArray<UIPreviewActionItem>;

	providesPresentationContextTransitionStyle: boolean;

	restorationClass: typeof NSObject;

	restorationIdentifier: string;

	restoresFocusAfterTransition: boolean;

	readonly searchDisplayController: UISearchDisplayController;

	readonly sheetPresentationController: UISheetPresentationController;

	readonly shouldAutomaticallyForwardAppearanceMethods: boolean;

	readonly shouldAutorotate: boolean;

	readonly splitViewController: UISplitViewController;

	readonly storyboard: UIStoryboard;

	readonly supportedInterfaceOrientations: UIInterfaceOrientationMask;

	readonly systemMinimumLayoutMargins: NSDirectionalEdgeInsets;

	readonly tabBarController: UITabBarController;

	tabBarItem: UITabBarItem;

	title: string;

	toolbarItems: NSArray<UIBarButtonItem>;

	readonly topLayoutGuide: UILayoutSupport;

	readonly transitionCoordinator: UIViewControllerTransitionCoordinator;

	transitioningDelegate: UIViewControllerTransitioningDelegate;

	view: UIView;

	readonly viewIfLoaded: UIView;

	readonly viewLoaded: boolean;

	viewRespectsSystemMinimumLayoutMargins: boolean;

	wantsFullScreenLayout: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly focusItemContainer: UIFocusItemContainer; // inherited from UIFocusEnvironment

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly objectRestorationClass: typeof NSObject; // inherited from UIStateRestoring

	readonly parentFocusEnvironment: UIFocusEnvironment; // inherited from UIFocusEnvironment

	readonly preferredFocusEnvironments: NSArray<UIFocusEnvironment>; // inherited from UIFocusEnvironment

	readonly preferredFocusedView: UIView; // inherited from UIFocusEnvironment

	readonly restorationParent: UIStateRestoring; // inherited from UIStateRestoring

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly traitCollection: UITraitCollection; // inherited from UITraitEnvironment

	readonly  // inherited from NSObjectProtocol

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { nibName: string; bundle: NSBundle; });

	addChildViewController(childController: UIViewController): void;

	addKeyCommand(keyCommand: UIKeyCommand): void;

	allowedChildViewControllersForUnwindingFromSource(source: UIStoryboardUnwindSegueSource): NSArray<UIViewController>;

	applicationFinishedRestoringState(): void;

	automaticallyForwardAppearanceAndRotationMethodsToChildViewControllers(): boolean;

	beginAppearanceTransitionAnimated(isAppearing: boolean, animated: boolean): void;

	beginRequestWithExtensionContext(context: NSExtensionContext): void;

	canPerformUnwindSegueActionFromViewControllerSender(action: string, fromViewController: UIViewController, sender: any): boolean;

	canPerformUnwindSegueActionFromViewControllerWithSender(action: string, fromViewController: UIViewController, sender: any): boolean;

	childViewControllerContainingSegueSource(source: UIStoryboardUnwindSegueSource): UIViewController;

	class(): typeof NSObject;

	collapseSecondaryViewControllerForSplitViewController(secondaryViewController: UIViewController, splitViewController: UISplitViewController): void;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	contentScrollViewForEdge(edge: NSDirectionalRectEdge): UIScrollView;

	decodeRestorableStateWithCoder(coder: NSCoder): void;

	didAnimateFirstHalfOfRotationToInterfaceOrientation(toInterfaceOrientation: UIInterfaceOrientation): void;

	didMoveToParentViewController(parent: UIViewController): void;

	didReceiveMemoryWarning(): void;

	didRotateFromInterfaceOrientation(fromInterfaceOrientation: UIInterfaceOrientation): void;

	didUpdateFocusInContextWithAnimationCoordinator(context: UIFocusUpdateContext, coordinator: UIFocusAnimationCoordinator): void;

	dismissModalViewControllerAnimated(animated: boolean): void;

	dismissMoviePlayerViewControllerAnimated(): void;

	dismissViewControllerAnimatedCompletion(flag: boolean, completion: () => void): void;

	encodeRestorableStateWithCoder(coder: NSCoder): void;

	encodeWithCoder(coder: NSCoder): void;

	endAppearanceTransition(): void;

	initWithCoder(coder: NSCoder): this;

	initWithNibNameBundle(nibNameOrNil: string, nibBundleOrNil: NSBundle): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	loadView(): void;

	loadViewIfNeeded(): void;

	overrideTraitCollectionForChildViewController(childViewController: UIViewController): UITraitCollection;

	performSegueWithIdentifierSender(identifier: string, sender: any): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	preferredContentSizeDidChangeForChildContentContainer(container: UIContentContainer): void;

	prepareForSegueSender(segue: UIStoryboardSegue, sender: any): void;

	presentModalViewControllerAnimated(modalViewController: UIViewController, animated: boolean): void;

	presentMoviePlayerViewControllerAnimated(moviePlayerViewController: MPMoviePlayerViewController): void;

	presentViewControllerAnimatedCompletion(viewControllerToPresent: UIViewController, flag: boolean, completion: () => void): void;

	registerForPreviewingWithDelegateSourceView(delegate: UIViewControllerPreviewingDelegate, sourceView: UIView): UIViewControllerPreviewing;

	removeFromParentViewController(): void;

	removeKeyCommand(keyCommand: UIKeyCommand): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	rotatingFooterView(): UIView;

	rotatingHeaderView(): UIView;

	segueForUnwindingToViewControllerFromViewControllerIdentifier(toViewController: UIViewController, fromViewController: UIViewController, identifier: string): UIStoryboardSegue;

	self(): this;

	separateSecondaryViewControllerForSplitViewController(splitViewController: UISplitViewController): UIViewController;

	setContentScrollViewForEdge(scrollView: UIScrollView, edge: NSDirectionalRectEdge): void;

	setEditingAnimated(editing: boolean, animated: boolean): void;

	setNeedsFocusUpdate(): void;

	setNeedsStatusBarAppearanceUpdate(): void;

	setNeedsUpdateOfHomeIndicatorAutoHidden(): void;

	setNeedsUpdateOfPrefersPointerLocked(): void;

	setNeedsUpdateOfScreenEdgesDeferringSystemGestures(): void;

	setNeedsUpdateOfSupportedInterfaceOrientations(): void;

	setOverrideTraitCollectionForChildViewController(collection: UITraitCollection, childViewController: UIViewController): void;

	setToolbarItemsAnimated(toolbarItems: NSArray<UIBarButtonItem> | UIBarButtonItem[], animated: boolean): void;

	shouldAutomaticallyForwardRotationMethods(): boolean;

	shouldAutorotateToInterfaceOrientation(toInterfaceOrientation: UIInterfaceOrientation): boolean;

	shouldPerformSegueWithIdentifierSender(identifier: string, sender: any): boolean;

	shouldUpdateFocusInContext(context: UIFocusUpdateContext): boolean;

	showDetailViewControllerSender(vc: UIViewController, sender: any): void;

	showViewControllerSender(vc: UIViewController, sender: any): void;

	sizeForChildContentContainerWithParentContainerSize(container: UIContentContainer, parentSize: CGSize): CGSize;

	systemLayoutFittingSizeDidChangeForChildContentContainer(container: UIContentContainer): void;

	targetViewControllerForActionSender(action: string, sender: any): UIViewController;

	traitCollectionDidChange(previousTraitCollection: UITraitCollection): void;

	transitionFromViewControllerToViewControllerDurationOptionsAnimationsCompletion(fromViewController: UIViewController, toViewController: UIViewController, duration: number, options: UIViewAnimationOptions, animations: () => void, completion: (p1: boolean) => void): void;

	unregisterForPreviewingWithContext(previewing: UIViewControllerPreviewing): void;

	unwindForSegueTowardsViewController(unwindSegue: UIStoryboardSegue, subsequentVC: UIViewController): void;

	updateFocusIfNeeded(): void;

	updateViewConstraints(): void;

	viewControllerForUnwindSegueActionFromViewControllerWithSender(action: string, fromViewController: UIViewController, sender: any): UIViewController;

	viewDidAppear(animated: boolean): void;

	viewDidDisappear(animated: boolean): void;

	viewDidLayoutSubviews(): void;

	viewDidLoad(): void;

	viewDidUnload(): void;

	viewLayoutMarginsDidChange(): void;

	viewSafeAreaInsetsDidChange(): void;

	viewWillAppear(animated: boolean): void;

	viewWillDisappear(animated: boolean): void;

	viewWillLayoutSubviews(): void;

	viewWillTransitionToSizeWithTransitionCoordinator(size: CGSize, coordinator: UIViewControllerTransitionCoordinator): void;

	viewWillUnload(): void;

	willAnimateFirstHalfOfRotationToInterfaceOrientationDuration(toInterfaceOrientation: UIInterfaceOrientation, duration: number): void;

	willAnimateRotationToInterfaceOrientationDuration(toInterfaceOrientation: UIInterfaceOrientation, duration: number): void;

	willAnimateSecondHalfOfRotationFromInterfaceOrientationDuration(fromInterfaceOrientation: UIInterfaceOrientation, duration: number): void;

	willMoveToParentViewController(parent: UIViewController): void;

	willRotateToInterfaceOrientationDuration(toInterfaceOrientation: UIInterfaceOrientation, duration: number): void;

	willTransitionToTraitCollectionWithTransitionCoordinator(newCollection: UITraitCollection, coordinator: UIViewControllerTransitionCoordinator): void;
}

interface UIViewControllerAnimatedTransitioning extends NSObjectProtocol {

	animateTransition(transitionContext: UIViewControllerContextTransitioning): void;

	animationEnded?(transitionCompleted: boolean): void;

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

	targetTransform: CGAffineTransform;

	transitionWasCancelled: boolean;

	cancelInteractiveTransition(): void;

	completeTransition(didComplete: boolean): void;

	finalFrameForViewController(vc: UIViewController): CGRect;

	finishInteractiveTransition(): void;

	initialFrameForViewController(vc: UIViewController): CGRect;

	pauseInteractiveTransition(): void;

	updateInteractiveTransition(percentComplete: number): void;

	viewControllerForKey(key: string): UIViewController;

	viewForKey(key: string): UIView;
}
declare var UIViewControllerContextTransitioning: {

	prototype: UIViewControllerContextTransitioning;
};

declare var UIViewControllerHierarchyInconsistencyException: string;

interface UIViewControllerInteractiveTransitioning extends NSObjectProtocol {

	completionCurve?: UIViewAnimationCurve;

	completionSpeed?: number;

	wantsInteractiveStart?: boolean;

	startInteractiveTransition(transitionContext: UIViewControllerContextTransitioning): void;
}
declare var UIViewControllerInteractiveTransitioning: {

	prototype: UIViewControllerInteractiveTransitioning;
};

interface UIViewControllerPreviewing extends NSObjectProtocol {

	delegate: UIViewControllerPreviewingDelegate;

	previewingGestureRecognizerForFailureRelationship: UIGestureRecognizer;

	sourceRect: CGRect;

	sourceView: UIView;
}
declare var UIViewControllerPreviewing: {

	prototype: UIViewControllerPreviewing;
};

interface UIViewControllerPreviewingDelegate extends NSObjectProtocol {

	previewingContextCommitViewController(previewingContext: UIViewControllerPreviewing, viewControllerToCommit: UIViewController): void;

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

declare var UIViewControllerShowDetailTargetDidChangeNotification: string;

interface UIViewControllerTransitionCoordinator extends UIViewControllerTransitionCoordinatorContext {

	animateAlongsideTransitionCompletion(animation: (p1: UIViewControllerTransitionCoordinatorContext) => void, completion: (p1: UIViewControllerTransitionCoordinatorContext) => void): boolean;

	animateAlongsideTransitionInViewAnimationCompletion(view: UIView, animation: (p1: UIViewControllerTransitionCoordinatorContext) => void, completion: (p1: UIViewControllerTransitionCoordinatorContext) => void): boolean;

	notifyWhenInteractionChangesUsingBlock(handler: (p1: UIViewControllerTransitionCoordinatorContext) => void): void;

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

	isInterruptible: boolean;

	percentComplete: number;

	presentationStyle: UIModalPresentationStyle;

	targetTransform: CGAffineTransform;

	transitionDuration: number;

	viewControllerForKey(key: string): UIViewController;

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

declare var UIViewNoIntrinsicMetric: number;

declare class UIViewPrintFormatter extends UIPrintFormatter {

	static alloc(): UIViewPrintFormatter; // inherited from NSObject

	static new(): UIViewPrintFormatter; // inherited from NSObject

	readonly view: UIView;
}

declare class UIViewPropertyAnimator extends NSObject implements NSCopying, UIViewImplicitlyAnimating {

	static alloc(): UIViewPropertyAnimator; // inherited from NSObject

	static new(): UIViewPropertyAnimator; // inherited from NSObject

	static runningPropertyAnimatorWithDurationDelayOptionsAnimationsCompletion(duration: number, delay: number, options: UIViewAnimationOptions, animations: () => void, completion: (p1: UIViewAnimatingPosition) => void): UIViewPropertyAnimator;

	readonly delay: number;

	readonly duration: number;

	interruptible: boolean;

	manualHitTestingEnabled: boolean;

	pausesOnCompletion: boolean;

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

declare const enum UIViewTintAdjustmentMode {

	Automatic = 0,

	Normal = 1,

	Dimmed = 2
}

declare class UIVisualEffect extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UIVisualEffect; // inherited from NSObject

	static new(): UIVisualEffect; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class UIVisualEffectView extends UIView implements NSSecureCoding {

	static alloc(): UIVisualEffectView; // inherited from NSObject

	static appearance(): UIVisualEffectView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UIVisualEffectView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIVisualEffectView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIVisualEffectView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIVisualEffectView; // inherited from UIAppearance

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

declare class UIWebView extends UIView implements NSCoding, UIScrollViewDelegate {

	static alloc(): UIWebView; // inherited from NSObject

	static appearance(): UIWebView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UIWebView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIWebView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIWebView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIWebView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIWebView; // inherited from UIAppearance

	static new(): UIWebView; // inherited from NSObject

	allowsInlineMediaPlayback: boolean;

	allowsLinkPreview: boolean;

	allowsPictureInPictureMediaPlayback: boolean;

	readonly canGoBack: boolean;

	readonly canGoForward: boolean;

	dataDetectorTypes: UIDataDetectorTypes;

	delegate: UIWebViewDelegate;

	detectsPhoneNumbers: boolean;

	gapBetweenPages: number;

	keyboardDisplayRequiresUserAction: boolean;

	readonly loading: boolean;

	mediaPlaybackAllowsAirPlay: boolean;

	mediaPlaybackRequiresUserAction: boolean;

	readonly pageCount: number;

	pageLength: number;

	paginationBreakingMode: UIWebPaginationBreakingMode;

	paginationMode: UIWebPaginationMode;

	readonly request: NSURLRequest;

	scalesPageToFit: boolean;

	readonly scrollView: UIScrollView;

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

	scrollViewDidChangeAdjustedContentInset(scrollView: UIScrollView): void;

	scrollViewDidEndDecelerating(scrollView: UIScrollView): void;

	scrollViewDidEndDraggingWillDecelerate(scrollView: UIScrollView, decelerate: boolean): void;

	scrollViewDidEndScrollingAnimation(scrollView: UIScrollView): void;

	scrollViewDidEndZoomingWithViewAtScale(scrollView: UIScrollView, view: UIView, scale: number): void;

	scrollViewDidScroll(scrollView: UIScrollView): void;

	scrollViewDidScrollToTop(scrollView: UIScrollView): void;

	scrollViewDidZoom(scrollView: UIScrollView): void;

	scrollViewShouldScrollToTop(scrollView: UIScrollView): boolean;

	scrollViewWillBeginDecelerating(scrollView: UIScrollView): void;

	scrollViewWillBeginDragging(scrollView: UIScrollView): void;

	scrollViewWillBeginZoomingWithView(scrollView: UIScrollView, view: UIView): void;

	scrollViewWillEndDraggingWithVelocityTargetContentOffset(scrollView: UIScrollView, velocity: CGPoint, targetContentOffset: interop.Pointer | interop.Reference<CGPoint>): void;

	self(): this;

	stopLoading(): void;

	stringByEvaluatingJavaScriptFromString(script: string): string;

	viewForZoomingInScrollView(scrollView: UIScrollView): UIView;
}

interface UIWebViewDelegate extends NSObjectProtocol {

	webViewDidFailLoadWithError?(webView: UIWebView, error: NSError): void;

	webViewDidFinishLoad?(webView: UIWebView): void;

	webViewDidStartLoad?(webView: UIWebView): void;

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

declare class UIWindow extends UIView {

	static alloc(): UIWindow; // inherited from NSObject

	static appearance(): UIWindow; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): UIWindow; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): UIWindow; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIWindow; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): UIWindow; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): UIWindow; // inherited from UIAppearance

	static new(): UIWindow; // inherited from NSObject

	readonly canBecomeKeyWindow: boolean;

	canResizeToFitContent: boolean;

	readonly keyWindow: boolean;

	rootViewController: UIViewController;

	readonly safeAreaAspectFitLayoutGuide: UILayoutGuide;

	screen: UIScreen;

	windowLevel: number;

	windowScene: UIWindowScene;

	constructor(o: { windowScene: UIWindowScene; });

	becomeKeyWindow(): void;

	convertPointFromWindow(point: CGPoint, window: UIWindow): CGPoint;

	convertPointToWindow(point: CGPoint, window: UIWindow): CGPoint;

	convertRectFromWindow(rect: CGRect, window: UIWindow): CGRect;

	convertRectToWindow(rect: CGRect, window: UIWindow): CGRect;

	initWithWindowScene(windowScene: UIWindowScene): this;

	makeKeyAndVisible(): void;

	makeKeyWindow(): void;

	resignKeyWindow(): void;

	sendEvent(event: _UIEvent): void;

	setScreen(screen: UIScreen): void;
}

declare var UIWindowDidBecomeHiddenNotification: string;

declare var UIWindowDidBecomeKeyNotification: string;

declare var UIWindowDidBecomeVisibleNotification: string;

declare var UIWindowDidResignKeyNotification: string;

declare var UIWindowLevelAlert: number;

declare var UIWindowLevelNormal: number;

declare var UIWindowLevelStatusBar: number;

declare class UIWindowScene extends UIScene {

	static alloc(): UIWindowScene; // inherited from NSObject

	static new(): UIWindowScene; // inherited from NSObject

	activityItemsConfigurationSource: UIActivityItemsConfigurationProviding;

	readonly coordinateSpace: UICoordinateSpace;

	readonly effectiveGeometry: UIWindowSceneGeometry;

	readonly focusSystem: UIFocusSystem;

	readonly fullScreen: boolean;

	readonly interfaceOrientation: UIInterfaceOrientation;

	readonly keyWindow: UIWindow;

	readonly screen: UIScreen;

	readonly screenshotService: UIScreenshotService;

	readonly sizeRestrictions: UISceneSizeRestrictions;

	readonly statusBarManager: UIStatusBarManager;

	readonly traitCollection: UITraitCollection;

	readonly windowingBehaviors: UISceneWindowingBehaviors;

	readonly windows: NSArray<UIWindow>;

	requestGeometryUpdateWithPreferencesErrorHandler(geometryPreferences: UIWindowSceneGeometryPreferences, errorHandler: (p1: NSError) => void): void;
}

declare class UIWindowSceneActivationAction extends UIAction {

	static actionWithHandler(handler: (p1: UIAction) => void): UIWindowSceneActivationAction; // inherited from UIAction

	static actionWithIdentifierAlternateActionConfigurationProvider(identifier: string, alternateAction: UIAction, configurationProvider: (p1: UIWindowSceneActivationAction) => UIWindowSceneActivationConfiguration): UIWindowSceneActivationAction;

	static actionWithTitleImageIdentifierHandler(title: string, image: UIImage, identifier: string, handler: (p1: UIAction) => void): UIWindowSceneActivationAction; // inherited from UIAction

	static alloc(): UIWindowSceneActivationAction; // inherited from NSObject

	static captureTextFromCameraActionForResponderIdentifier(responder: UIResponder, identifier: string): UIWindowSceneActivationAction; // inherited from UIAction

	static new(): UIWindowSceneActivationAction; // inherited from NSObject
}

declare class UIWindowSceneActivationConfiguration extends NSObject {

	static alloc(): UIWindowSceneActivationConfiguration; // inherited from NSObject

	static new(): UIWindowSceneActivationConfiguration; // inherited from NSObject

	options: UIWindowSceneActivationRequestOptions;

	preview: UITargetedPreview;

	readonly userActivity: NSUserActivity;

	constructor(o: { userActivity: NSUserActivity; });

	initWithUserActivity(userActivity: NSUserActivity): this;
}

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

declare class UIWindowSceneActivationRequestOptions extends UISceneActivationRequestOptions {

	static alloc(): UIWindowSceneActivationRequestOptions; // inherited from NSObject

	static new(): UIWindowSceneActivationRequestOptions; // inherited from NSObject

	preferredPresentationStyle: UIWindowScenePresentationStyle;
}

interface UIWindowSceneDelegate extends UISceneDelegate {

	window?: UIWindow;

	windowSceneDidUpdateCoordinateSpaceInterfaceOrientationTraitCollection?(windowScene: UIWindowScene, previousCoordinateSpace: UICoordinateSpace, previousInterfaceOrientation: UIInterfaceOrientation, previousTraitCollection: UITraitCollection): void;

	windowScenePerformActionForShortcutItemCompletionHandler?(windowScene: UIWindowScene, shortcutItem: UIApplicationShortcutItem, completionHandler: (p1: boolean) => void): void;

	windowSceneUserDidAcceptCloudKitShareWithMetadata?(windowScene: UIWindowScene, cloudKitShareMetadata: CKShareMetadata): void;
}
declare var UIWindowSceneDelegate: {

	prototype: UIWindowSceneDelegate;
};

declare class UIWindowSceneDestructionRequestOptions extends UISceneDestructionRequestOptions {

	static alloc(): UIWindowSceneDestructionRequestOptions; // inherited from NSObject

	static new(): UIWindowSceneDestructionRequestOptions; // inherited from NSObject

	windowDismissalAnimation: UIWindowSceneDismissalAnimation;
}

declare const enum UIWindowSceneDismissalAnimation {

	Standard = 1,

	Commit = 2,

	Decline = 3
}

declare class UIWindowSceneGeometry extends NSObject implements NSCopying {

	static alloc(): UIWindowSceneGeometry; // inherited from NSObject

	static new(): UIWindowSceneGeometry; // inherited from NSObject

	readonly interfaceOrientation: UIInterfaceOrientation;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class UIWindowSceneGeometryPreferences extends NSObject {

	static alloc(): UIWindowSceneGeometryPreferences; // inherited from NSObject

	static new(): UIWindowSceneGeometryPreferences; // inherited from NSObject
}

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

declare const enum UIWindowScenePresentationStyle {

	Automatic = 0,

	Standard = 1,

	Prominent = 2
}

declare var UIWindowSceneSessionRoleApplication: string;

declare var UIWindowSceneSessionRoleExternalDisplay: string;

declare var UIWindowSceneSessionRoleExternalDisplayNonInteractive: string;
