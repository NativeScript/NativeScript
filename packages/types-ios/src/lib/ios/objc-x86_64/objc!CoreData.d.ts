
/**
 * @since 3.0
 */
declare var NSAddedPersistentStoresKey: string;

/**
 * @since 3.0
 */
declare var NSAffectedObjectsErrorKey: string;

/**
 * @since 3.0
 */
declare var NSAffectedStoresErrorKey: string;

/**
 * @since 8.0
 */
declare class NSAsynchronousFetchRequest<ResultType> extends NSPersistentStoreRequest {

	static alloc<ResultType>(): NSAsynchronousFetchRequest<ResultType>; // inherited from NSObject

	static new<ResultType>(): NSAsynchronousFetchRequest<ResultType>; // inherited from NSObject

	readonly completionBlock: (p1: NSAsynchronousFetchResult<any>) => void | null;

	estimatedResultCount: number;

	readonly fetchRequest: NSFetchRequest<NSFetchRequestResult>;

	constructor(o: { fetchRequest: NSFetchRequest<NSFetchRequestResult>; completionBlock: (p1: NSAsynchronousFetchResult<NSFetchRequestResult>) => void | null; });

	initWithFetchRequestCompletionBlock(request: NSFetchRequest<NSFetchRequestResult>, blk: (p1: NSAsynchronousFetchResult<NSFetchRequestResult>) => void | null): this;
}

/**
 * @since 8.0
 */
declare class NSAsynchronousFetchResult<ResultType> extends NSPersistentStoreAsynchronousResult {

	static alloc<ResultType>(): NSAsynchronousFetchResult<ResultType>; // inherited from NSObject

	static new<ResultType>(): NSAsynchronousFetchResult<ResultType>; // inherited from NSObject

	readonly fetchRequest: NSAsynchronousFetchRequest<NSFetchRequestResult>;

	readonly finalResult: NSArray<NSFetchRequestResult> | null;
}

/**
 * @since 3.0
 */
declare class NSAtomicStore extends NSPersistentStore {

	static alloc(): NSAtomicStore; // inherited from NSObject

	static new(): NSAtomicStore; // inherited from NSObject

	addCacheNodes(cacheNodes: NSSet<NSAtomicStoreCacheNode>): void;

	cacheNodeForObjectID(objectID: NSManagedObjectID): NSAtomicStoreCacheNode | null;

	cacheNodes(): NSSet<NSAtomicStoreCacheNode>;

	load(error?: interop.Reference<NSError>): boolean;

	newCacheNodeForManagedObject(managedObject: NSManagedObject): NSAtomicStoreCacheNode;

	newReferenceObjectForManagedObject(managedObject: NSManagedObject): any;

	objectIDForEntityReferenceObject(entity: NSEntityDescription, data: any): NSManagedObjectID;

	referenceObjectForObjectID(objectID: NSManagedObjectID): any;

	save(error?: interop.Reference<NSError>): boolean;

	updateCacheNodeFromManagedObject(node: NSAtomicStoreCacheNode, managedObject: NSManagedObject): void;

	willRemoveCacheNodes(cacheNodes: NSSet<NSAtomicStoreCacheNode>): void;
}

/**
 * @since 3.0
 */
declare class NSAtomicStoreCacheNode extends NSObject {

	static alloc(): NSAtomicStoreCacheNode; // inherited from NSObject

	static new(): NSAtomicStoreCacheNode; // inherited from NSObject

	readonly objectID: NSManagedObjectID;

	propertyCache: NSMutableDictionary<string, any> | null;

	constructor(o: { objectID: NSManagedObjectID; });

	initWithObjectID(moid: NSManagedObjectID): this;
}

/**
 * @since 3.0
 */
declare class NSAttributeDescription extends NSPropertyDescription {

	static alloc(): NSAttributeDescription; // inherited from NSObject

	static new(): NSAttributeDescription; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	allowsCloudEncryption: boolean;

	/**
	 * @since 5.0
	 */
	allowsExternalBinaryDataStorage: boolean;

	attributeType: NSAttributeType;

	attributeValueClassName: string | null;

	defaultValue: any | null;

	/**
	 * @since 13.0
	 */
	preservesValueInHistoryOnDeletion: boolean;

	/**
	 * @since 3.0
	 */
	valueTransformerName: string | null;
}

declare const enum NSAttributeType {

	UndefinedAttributeType = 0,

	Integer16AttributeType = 100,

	Integer32AttributeType = 200,

	Integer64AttributeType = 300,

	DecimalAttributeType = 400,

	DoubleAttributeType = 500,

	FloatAttributeType = 600,

	StringAttributeType = 700,

	BooleanAttributeType = 800,

	DateAttributeType = 900,

	BinaryDataAttributeType = 1000,

	UUIDAttributeType = 1100,

	URIAttributeType = 1200,

	TransformableAttributeType = 1800,

	ObjectIDAttributeType = 2000,

	CompositeAttributeType = 2100
}

/**
 * @since 9.0
 */
declare class NSBatchDeleteRequest extends NSPersistentStoreRequest {

	static alloc(): NSBatchDeleteRequest; // inherited from NSObject

	static new(): NSBatchDeleteRequest; // inherited from NSObject

	readonly fetchRequest: NSFetchRequest<any>;

	resultType: NSBatchDeleteRequestResultType;

	constructor(o: { fetchRequest: NSFetchRequest<any>; });

	constructor(o: { objectIDs: NSArray<NSManagedObjectID> | NSManagedObjectID[]; });

	initWithFetchRequest(fetch: NSFetchRequest<any>): this;

	initWithObjectIDs(objects: NSArray<NSManagedObjectID> | NSManagedObjectID[]): this;
}

/**
 * @since 9.0
 */
declare const enum NSBatchDeleteRequestResultType {

	ResultTypeStatusOnly = 0,

	ResultTypeObjectIDs = 1,

	ResultTypeCount = 2
}

/**
 * @since 9.0
 */
declare class NSBatchDeleteResult extends NSPersistentStoreResult {

	static alloc(): NSBatchDeleteResult; // inherited from NSObject

	static new(): NSBatchDeleteResult; // inherited from NSObject

	readonly result: any | null;

	readonly resultType: NSBatchDeleteRequestResultType;
}

/**
 * @since 13.0
 */
declare class NSBatchInsertRequest extends NSPersistentStoreRequest {

	static alloc(): NSBatchInsertRequest; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	static batchInsertRequestWithEntityNameDictionaryHandler(entityName: string, handler: (p1: NSMutableDictionary<string, any>) => boolean): NSBatchInsertRequest;

	/**
	 * @since 14.0
	 */
	static batchInsertRequestWithEntityNameManagedObjectHandler(entityName: string, handler: (p1: NSManagedObject) => boolean): NSBatchInsertRequest;

	static batchInsertRequestWithEntityNameObjects(entityName: string, dictionaries: NSArray<NSDictionary<string, any>> | NSDictionary<string, any>[]): NSBatchInsertRequest;

	static new(): NSBatchInsertRequest; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	dictionaryHandler: (p1: NSMutableDictionary<string, any>) => boolean | null;

	readonly entity: NSEntityDescription | null;

	readonly entityName: string;

	/**
	 * @since 14.0
	 */
	managedObjectHandler: (p1: NSManagedObject) => boolean | null;

	objectsToInsert: NSArray<NSDictionary<string, any>> | null;

	resultType: NSBatchInsertRequestResultType;

	/**
	 * @since 14.0
	 */
	constructor(o: { entity: NSEntityDescription; dictionaryHandler: (p1: NSMutableDictionary<string, any>) => boolean; });

	/**
	 * @since 14.0
	 */
	constructor(o: { entity: NSEntityDescription; managedObjectHandler: (p1: NSManagedObject) => boolean; });

	/**
	 * @since 14.0
	 */
	constructor(o: { entityName: string; dictionaryHandler: (p1: NSMutableDictionary<string, any>) => boolean; });

	/**
	 * @since 14.0
	 */
	constructor(o: { entityName: string; managedObjectHandler: (p1: NSManagedObject) => boolean; });

	constructor(o: { entityName: string; objects: NSArray<NSDictionary<string, any>> | NSDictionary<string, any>[]; });

	constructor(o: { entity: NSEntityDescription; objects: NSArray<NSDictionary<string, any>> | NSDictionary<string, any>[]; });

	/**
	 * @since 14.0
	 */
	initWithEntityDictionaryHandler(entity: NSEntityDescription, handler: (p1: NSMutableDictionary<string, any>) => boolean): this;

	/**
	 * @since 14.0
	 */
	initWithEntityManagedObjectHandler(entity: NSEntityDescription, handler: (p1: NSManagedObject) => boolean): this;

	/**
	 * @since 14.0
	 */
	initWithEntityNameDictionaryHandler(entityName: string, handler: (p1: NSMutableDictionary<string, any>) => boolean): this;

	/**
	 * @since 14.0
	 */
	initWithEntityNameManagedObjectHandler(entityName: string, handler: (p1: NSManagedObject) => boolean): this;

	initWithEntityNameObjects(entityName: string, dictionaries: NSArray<NSDictionary<string, any>> | NSDictionary<string, any>[]): this;

	initWithEntityObjects(entity: NSEntityDescription, dictionaries: NSArray<NSDictionary<string, any>> | NSDictionary<string, any>[]): this;
}

/**
 * @since 13.0
 */
declare const enum NSBatchInsertRequestResultType {

	StatusOnly = 0,

	ObjectIDs = 1,

	Count = 2
}

/**
 * @since 13.0
 */
declare class NSBatchInsertResult extends NSPersistentStoreResult {

	static alloc(): NSBatchInsertResult; // inherited from NSObject

	static new(): NSBatchInsertResult; // inherited from NSObject

	readonly result: any | null;

	readonly resultType: NSBatchInsertRequestResultType;
}

/**
 * @since 8.0
 */
declare class NSBatchUpdateRequest extends NSPersistentStoreRequest {

	static alloc(): NSBatchUpdateRequest; // inherited from NSObject

	static batchUpdateRequestWithEntityName(entityName: string): NSBatchUpdateRequest;

	static new(): NSBatchUpdateRequest; // inherited from NSObject

	readonly entity: NSEntityDescription;

	readonly entityName: string;

	includesSubentities: boolean;

	predicate: NSPredicate | null;

	propertiesToUpdate: NSDictionary<any, any> | null;

	resultType: NSBatchUpdateRequestResultType;

	constructor(o: { entity: NSEntityDescription; });

	constructor(o: { entityName: string; });

	initWithEntity(entity: NSEntityDescription): this;

	initWithEntityName(entityName: string): this;
}

/**
 * @since 8.0
 */
declare const enum NSBatchUpdateRequestResultType {

	StatusOnlyResultType = 0,

	UpdatedObjectIDsResultType = 1,

	UpdatedObjectsCountResultType = 2
}

/**
 * @since 8.0
 */
declare class NSBatchUpdateResult extends NSPersistentStoreResult {

	static alloc(): NSBatchUpdateResult; // inherited from NSObject

	static new(): NSBatchUpdateResult; // inherited from NSObject

	readonly result: any | null;

	readonly resultType: NSBatchUpdateRequestResultType;
}

/**
 * @since 11.0
 */
declare var NSBinaryStoreInsecureDecodingCompatibilityOption: string;

/**
 * @since 11.0
 */
declare var NSBinaryStoreSecureDecodingClasses: string;

/**
 * @since 3.0
 */
declare var NSBinaryStoreType: string;

/**
 * @since 17.0
 */
declare class NSCompositeAttributeDescription extends NSAttributeDescription {

	static alloc(): NSCompositeAttributeDescription; // inherited from NSObject

	static new(): NSCompositeAttributeDescription; // inherited from NSObject

	elements: NSArray<NSAttributeDescription>;
}

/**
 * @since 9.0
 */
declare class NSConstraintConflict extends NSObject {

	static alloc(): NSConstraintConflict; // inherited from NSObject

	static new(): NSConstraintConflict; // inherited from NSObject

	readonly conflictingObjects: NSArray<NSManagedObject>;

	readonly conflictingSnapshots: NSArray<NSDictionary<any, any>>;

	readonly constraint: NSArray<string>;

	readonly constraintValues: NSDictionary<string, any>;

	readonly databaseObject: NSManagedObject | null;

	readonly databaseSnapshot: NSDictionary<string, any> | null;

	constructor(o: { constraint: NSArray<string> | string[]; databaseObject: NSManagedObject | null; databaseSnapshot: NSDictionary<any, any> | null; conflictingObjects: NSArray<NSManagedObject> | NSManagedObject[]; conflictingSnapshots: NSArray<any> | any[]; });

	initWithConstraintDatabaseObjectDatabaseSnapshotConflictingObjectsConflictingSnapshots(contraint: NSArray<string> | string[], databaseObject: NSManagedObject | null, databaseSnapshot: NSDictionary<any, any> | null, conflictingObjects: NSArray<NSManagedObject> | NSManagedObject[], conflictingSnapshots: NSArray<any> | any[]): this;
}

/**
 * @since 11.0
 */
declare class NSCoreDataCoreSpotlightDelegate extends NSObject {

	static alloc(): NSCoreDataCoreSpotlightDelegate; // inherited from NSObject

	static new(): NSCoreDataCoreSpotlightDelegate; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	readonly indexingEnabled: boolean;

	/**
	 * @since 13.0
	 */
	constructor(o: { forStoreWithDescription: NSPersistentStoreDescription; coordinator: NSPersistentStoreCoordinator; });

	/**
	 * @since 11.0
	 * @deprecated 15.0
	 */
	constructor(o: { forStoreWithDescription: NSPersistentStoreDescription; model: NSManagedObjectModel; });

	attributeSetForObject(object: NSManagedObject): CSSearchableItemAttributeSet | null;

	/**
	 * @since 14.0
	 */
	deleteSpotlightIndexWithCompletionHandler(completionHandler: (p1: NSError | null) => void): void;

	domainIdentifier(): string;

	indexName(): string | null;

	/**
	 * @since 13.0
	 */
	initForStoreWithDescriptionCoordinator(description: NSPersistentStoreDescription, psc: NSPersistentStoreCoordinator): this;

	/**
	 * @since 11.0
	 * @deprecated 15.0
	 */
	initForStoreWithDescriptionModel(description: NSPersistentStoreDescription, model: NSManagedObjectModel): this;

	searchableIndexReindexAllSearchableItemsWithAcknowledgementHandler(searchableIndex: CSSearchableIndex, acknowledgementHandler: () => void): void;

	searchableIndexReindexSearchableItemsWithIdentifiersAcknowledgementHandler(searchableIndex: CSSearchableIndex, identifiers: NSArray<string> | string[], acknowledgementHandler: () => void): void;

	/**
	 * @since 13.0
	 */
	startSpotlightIndexing(): void;

	/**
	 * @since 13.0
	 */
	stopSpotlightIndexing(): void;
}

/**
 * @since 14.0
 */
declare var NSCoreDataCoreSpotlightDelegateIndexDidUpdateNotification: string;

/**
 * @since 11.0
 */
declare var NSCoreDataCoreSpotlightExporter: string;

declare const NSCoreDataError: number;

declare var NSCoreDataVersionNumber: number;

/**
 * @since 17.0
 */
declare class NSCustomMigrationStage extends NSMigrationStage {

	static alloc(): NSCustomMigrationStage; // inherited from NSObject

	static new(): NSCustomMigrationStage; // inherited from NSObject

	readonly currentModel: NSManagedObjectModelReference;

	didMigrateHandler: (p1: NSStagedMigrationManager, p2: NSCustomMigrationStage, p3: interop.Pointer | interop.Reference<NSError | null> | null) => boolean | null;

	readonly nextModel: NSManagedObjectModelReference;

	willMigrateHandler: (p1: NSStagedMigrationManager, p2: NSCustomMigrationStage, p3: interop.Pointer | interop.Reference<NSError | null> | null) => boolean | null;

	constructor(o: { currentModelReference: NSManagedObjectModelReference; nextModelReference: NSManagedObjectModelReference; });

	initWithCurrentModelReferenceNextModelReference(currentModel: NSManagedObjectModelReference, nextModel: NSManagedObjectModelReference): this;
}

declare const enum NSDeleteRule {

	NoActionDeleteRule = 0,

	NullifyDeleteRule = 1,

	CascadeDeleteRule = 2,

	DenyDeleteRule = 3
}

/**
 * @since 10.3
 */
declare var NSDeletedObjectIDsKey: string;

/**
 * @since 3.0
 */
declare var NSDeletedObjectsKey: string;

/**
 * @since 13.0
 */
declare class NSDerivedAttributeDescription extends NSAttributeDescription {

	static alloc(): NSDerivedAttributeDescription; // inherited from NSObject

	static new(): NSDerivedAttributeDescription; // inherited from NSObject

	derivationExpression: NSExpression | null;
}

/**
 * @since 3.0
 */
declare var NSDetailedErrorsKey: string;

/**
 * @since 3.0
 */
declare class NSEntityDescription extends NSObject implements NSCoding, NSCopying, NSFastEnumeration {

	static alloc(): NSEntityDescription; // inherited from NSObject

	static entityForNameInManagedObjectContext(entityName: string, context: NSManagedObjectContext): NSEntityDescription | null;

	static insertNewObjectForEntityForNameInManagedObjectContext(entityName: string, context: NSManagedObjectContext): NSManagedObject;

	static new(): NSEntityDescription; // inherited from NSObject

	abstract: boolean;

	readonly attributesByName: NSDictionary<string, NSAttributeDescription>;

	/**
	 * @since 3.0
	 * @deprecated 11.0
	 */
	compoundIndexes: NSArray<NSArray<any>>;

	/**
	 * @since 11.0
	 */
	coreSpotlightDisplayNameExpression: NSExpression;

	/**
	 * @since 11.0
	 */
	indexes: NSArray<NSFetchIndexDescription>;

	managedObjectClassName: string;

	readonly managedObjectModel: NSManagedObjectModel;

	name: string | null;

	properties: NSArray<NSPropertyDescription>;

	readonly propertiesByName: NSDictionary<string, NSPropertyDescription>;

	readonly relationshipsByName: NSDictionary<string, NSRelationshipDescription>;

	/**
	 * @since 3.0
	 */
	renamingIdentifier: string | null;

	subentities: NSArray<NSEntityDescription>;

	readonly subentitiesByName: NSDictionary<string, NSEntityDescription>;

	readonly superentity: NSEntityDescription | null;

	/**
	 * @since 9.0
	 */
	uniquenessConstraints: NSArray<NSArray<any>>;

	userInfo: NSDictionary<any, any> | null;

	/**
	 * @since 3.0
	 */
	readonly versionHash: NSData;

	/**
	 * @since 3.0
	 */
	versionHashModifier: string | null;
	[Symbol.iterator](): Iterator<any>;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 3.0
	 */
	isKindOfEntity(entity: NSEntityDescription): boolean;

	relationshipsWithDestinationEntity(entity: NSEntityDescription): NSArray<NSRelationshipDescription>;
}

/**
 * @since 3.0
 */
declare class NSEntityMapping extends NSObject {

	static alloc(): NSEntityMapping; // inherited from NSObject

	static new(): NSEntityMapping; // inherited from NSObject

	attributeMappings: NSArray<NSPropertyMapping> | null;

	destinationEntityName: string | null;

	destinationEntityVersionHash: NSData | null;

	entityMigrationPolicyClassName: string | null;

	mappingType: NSEntityMappingType;

	name: string;

	relationshipMappings: NSArray<NSPropertyMapping> | null;

	sourceEntityName: string | null;

	sourceEntityVersionHash: NSData | null;

	sourceExpression: NSExpression | null;

	userInfo: NSDictionary<any, any> | null;
}

declare const enum NSEntityMappingType {

	UndefinedEntityMappingType = 0,

	CustomEntityMappingType = 1,

	AddEntityMappingType = 2,

	RemoveEntityMappingType = 3,

	CopyEntityMappingType = 4,

	TransformEntityMappingType = 5
}

/**
 * @since 3.0
 */
declare class NSEntityMigrationPolicy extends NSObject {

	static alloc(): NSEntityMigrationPolicy; // inherited from NSObject

	static new(): NSEntityMigrationPolicy; // inherited from NSObject

	beginEntityMappingManagerError(mapping: NSEntityMapping, manager: NSMigrationManager, error?: interop.Reference<NSError>): boolean;

	createDestinationInstancesForSourceInstanceEntityMappingManagerError(sInstance: NSManagedObject, mapping: NSEntityMapping, manager: NSMigrationManager, error?: interop.Reference<NSError>): boolean;

	createRelationshipsForDestinationInstanceEntityMappingManagerError(dInstance: NSManagedObject, mapping: NSEntityMapping, manager: NSMigrationManager, error?: interop.Reference<NSError>): boolean;

	endEntityMappingManagerError(mapping: NSEntityMapping, manager: NSMigrationManager, error?: interop.Reference<NSError>): boolean;

	endInstanceCreationForEntityMappingManagerError(mapping: NSEntityMapping, manager: NSMigrationManager, error?: interop.Reference<NSError>): boolean;

	endRelationshipCreationForEntityMappingManagerError(mapping: NSEntityMapping, manager: NSMigrationManager, error?: interop.Reference<NSError>): boolean;

	performCustomValidationForEntityMappingManagerError(mapping: NSEntityMapping, manager: NSMigrationManager, error?: interop.Reference<NSError>): boolean;
}

declare const NSEntityMigrationPolicyError: number;

/**
 * @since 3.0
 */
declare var NSErrorMergePolicy: any;

/**
 * @since 3.0
 */
declare var NSErrorMergePolicyVar: any;

/**
 * @since 3.0
 */
declare class NSExpressionDescription extends NSPropertyDescription {

	static alloc(): NSExpressionDescription; // inherited from NSObject

	static new(): NSExpressionDescription; // inherited from NSObject

	expression: NSExpression | null;

	expressionResultType: NSAttributeType;
}

declare const NSExternalRecordImportError: number;

/**
 * @since 11.0
 */
declare class NSFetchIndexDescription extends NSObject implements NSCoding, NSCopying {

	static alloc(): NSFetchIndexDescription; // inherited from NSObject

	static new(): NSFetchIndexDescription; // inherited from NSObject

	elements: NSArray<NSFetchIndexElementDescription>;

	readonly entity: NSEntityDescription | null;

	name: string;

	partialIndexPredicate: NSPredicate | null;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { name: string; elements: NSArray<NSFetchIndexElementDescription> | NSFetchIndexElementDescription[] | null; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithNameElements(name: string, elements: NSArray<NSFetchIndexElementDescription> | NSFetchIndexElementDescription[] | null): this;
}

/**
 * @since 11.0
 */
declare class NSFetchIndexElementDescription extends NSObject implements NSCoding, NSCopying {

	static alloc(): NSFetchIndexElementDescription; // inherited from NSObject

	static new(): NSFetchIndexElementDescription; // inherited from NSObject

	ascending: boolean;

	collationType: NSFetchIndexElementType;

	readonly indexDescription: NSFetchIndexDescription | null;

	readonly property: NSPropertyDescription | null;

	readonly propertyName: string | null;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { property: NSPropertyDescription; collationType: NSFetchIndexElementType; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithPropertyCollationType(property: NSPropertyDescription, collationType: NSFetchIndexElementType): this;
}

/**
 * @since 11.0
 */
declare const enum NSFetchIndexElementType {

	Binary = 0,

	RTree = 1
}

/**
 * @since 3.0
 */
declare class NSFetchRequest<ResultType> extends NSPersistentStoreRequest implements NSCoding, NSCopying {

	static alloc<ResultType>(): NSFetchRequest<ResultType>; // inherited from NSObject

	/**
	 * @since 4.0
	 */
	static fetchRequestWithEntityName<ResultType>(entityName: string): NSFetchRequest<ResultType>;

	static new<ResultType>(): NSFetchRequest<ResultType>; // inherited from NSObject

	entity: NSEntityDescription | null;

	/**
	 * @since 4.0
	 */
	readonly entityName: string | null;

	/**
	 * @since 3.0
	 */
	fetchBatchSize: number;

	fetchLimit: number;

	/**
	 * @since 3.0
	 */
	fetchOffset: number;

	/**
	 * @since 5.0
	 */
	havingPredicate: NSPredicate | null;

	/**
	 * @since 3.0
	 */
	includesPendingChanges: boolean;

	/**
	 * @since 3.0
	 */
	includesPropertyValues: boolean;

	/**
	 * @since 3.0
	 */
	includesSubentities: boolean;

	predicate: NSPredicate | null;

	/**
	 * @since 3.0
	 */
	propertiesToFetch: NSArray<any> | null;

	/**
	 * @since 5.0
	 */
	propertiesToGroupBy: NSArray<any> | null;

	/**
	 * @since 3.0
	 */
	relationshipKeyPathsForPrefetching: NSArray<string> | null;

	/**
	 * @since 3.0
	 */
	resultType: NSFetchRequestResultType;

	/**
	 * @since 3.0
	 */
	returnsDistinctResults: boolean;

	/**
	 * @since 3.0
	 */
	returnsObjectsAsFaults: boolean;

	/**
	 * @since 5.0
	 */
	shouldRefreshRefetchedObjects: boolean;

	sortDescriptors: NSArray<NSSortDescriptor> | null;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 4.0
	 */
	constructor(o: { entityName: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 10.0
	 */
	execute(error?: interop.Reference<NSError>): NSArray<NSFetchRequestResult> | null;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 4.0
	 */
	initWithEntityName(entityName: string): this;
}

/**
 * @since 3.0
 */
declare class NSFetchRequestExpression extends NSExpression {

	static alloc(): NSFetchRequestExpression; // inherited from NSObject

	static expressionForFetchContextCountOnly(fetch: NSExpression, context: NSExpression, countFlag: boolean): NSExpression;

	static new(): NSFetchRequestExpression; // inherited from NSObject

	readonly contextExpression: NSExpression;

	readonly countOnlyRequest: boolean;

	readonly requestExpression: NSExpression;
}

declare var NSFetchRequestExpressionType: NSExpressionType;

interface NSFetchRequestResult extends NSObjectProtocol {
}
declare var NSFetchRequestResult: {

	prototype: NSFetchRequestResult;
};

declare const enum NSFetchRequestResultType {

	ManagedObjectResultType = 0,

	ManagedObjectIDResultType = 1,

	DictionaryResultType = 2,

	CountResultType = 4
}

/**
 * @since 3.0
 */
declare class NSFetchedPropertyDescription extends NSPropertyDescription {

	static alloc(): NSFetchedPropertyDescription; // inherited from NSObject

	static new(): NSFetchedPropertyDescription; // inherited from NSObject

	fetchRequest: NSFetchRequest<any> | null;
}

/**
 * @since 3.0
 */
declare const enum NSFetchedResultsChangeType {

	Insert = 1,

	Delete = 2,

	Move = 3,

	Update = 4
}

/**
 * @since 3.0
 */
declare class NSFetchedResultsController<ResultType> extends NSObject {

	static alloc<ResultType>(): NSFetchedResultsController<ResultType>; // inherited from NSObject

	static deleteCacheWithName(name: string | null): void;

	static new<ResultType>(): NSFetchedResultsController<ResultType>; // inherited from NSObject

	readonly cacheName: string | null;

	delegate: NSFetchedResultsControllerDelegate | null;

	readonly fetchRequest: NSFetchRequest<NSFetchRequestResult>;

	readonly fetchedObjects: NSArray<NSFetchRequestResult> | null;

	readonly managedObjectContext: NSManagedObjectContext;

	readonly sectionIndexTitles: NSArray<string>;

	readonly sectionNameKeyPath: string | null;

	readonly sections: NSArray<NSFetchedResultsSectionInfo> | null;

	constructor(o: { fetchRequest: NSFetchRequest<NSFetchRequestResult>; managedObjectContext: NSManagedObjectContext; sectionNameKeyPath: string | null; cacheName: string | null; });

	indexPathForObject(object: NSFetchRequestResult): NSIndexPath | null;

	initWithFetchRequestManagedObjectContextSectionNameKeyPathCacheName(fetchRequest: NSFetchRequest<NSFetchRequestResult>, context: NSManagedObjectContext, sectionNameKeyPath: string | null, name: string | null): this;

	objectAtIndexPath(indexPath: NSIndexPath): NSFetchRequestResult;

	performFetch(error?: interop.Reference<NSError>): boolean;

	sectionForSectionIndexTitleAtIndex(title: string, sectionIndex: number): number;

	sectionIndexTitleForSectionName(sectionName: string): string | null;
}

interface NSFetchedResultsControllerDelegate extends NSObjectProtocol {

	controllerDidChangeContent?(controller: NSFetchedResultsController<any>): void;

	/**
	 * @since 13.0
	 */
	controllerDidChangeContentWithDifference?(controller: NSFetchedResultsController<any>, diff: NSOrderedCollectionDifference<NSManagedObjectID>): void;

	/**
	 * @since 13.0
	 */
	controllerDidChangeContentWithSnapshot?(controller: NSFetchedResultsController<any>, snapshot: NSDiffableDataSourceSnapshot<string, NSManagedObjectID>): void;

	controllerDidChangeObjectAtIndexPathForChangeTypeNewIndexPath?(controller: NSFetchedResultsController<any>, anObject: any, indexPath: NSIndexPath | null, type: NSFetchedResultsChangeType, newIndexPath: NSIndexPath | null): void;

	controllerDidChangeSectionAtIndexForChangeType?(controller: NSFetchedResultsController<any>, sectionInfo: NSFetchedResultsSectionInfo, sectionIndex: number, type: NSFetchedResultsChangeType): void;

	/**
	 * @since 4.0
	 */
	controllerSectionIndexTitleForSectionName?(controller: NSFetchedResultsController<any>, sectionName: string): string | null;

	controllerWillChangeContent?(controller: NSFetchedResultsController<any>): void;
}
declare var NSFetchedResultsControllerDelegate: {

	prototype: NSFetchedResultsControllerDelegate;
};

interface NSFetchedResultsSectionInfo {

	indexTitle: string | null;

	name: string;

	numberOfObjects: number;

	objects: NSArray<any> | null;
}
declare var NSFetchedResultsSectionInfo: {

	prototype: NSFetchedResultsSectionInfo;
};

/**
 * @since 3.0
 */
declare var NSIgnorePersistentStoreVersioningOption: string;

/**
 * @since 3.0
 */
declare var NSInMemoryStoreType: string;

/**
 * @since 5.0
 */
declare class NSIncrementalStore extends NSPersistentStore {

	static alloc(): NSIncrementalStore; // inherited from NSObject

	static identifierForNewStoreAtURL(storeURL: NSURL): any;

	static new(): NSIncrementalStore; // inherited from NSObject

	executeRequestWithContextError(request: NSPersistentStoreRequest, context: NSManagedObjectContext | null, error?: interop.Reference<NSError>): any | null;

	managedObjectContextDidRegisterObjectsWithIDs(objectIDs: NSArray<NSManagedObjectID> | NSManagedObjectID[]): void;

	managedObjectContextDidUnregisterObjectsWithIDs(objectIDs: NSArray<NSManagedObjectID> | NSManagedObjectID[]): void;

	newObjectIDForEntityReferenceObject(entity: NSEntityDescription, data: any): NSManagedObjectID;

	newValueForRelationshipForObjectWithIDWithContextError(relationship: NSRelationshipDescription, objectID: NSManagedObjectID, context: NSManagedObjectContext | null, error?: interop.Reference<NSError>): any | null;

	newValuesForObjectWithIDWithContextError(objectID: NSManagedObjectID, context: NSManagedObjectContext, error?: interop.Reference<NSError>): NSIncrementalStoreNode | null;

	obtainPermanentIDsForObjectsError(array: NSArray<NSManagedObject> | NSManagedObject[], error?: interop.Reference<NSError>): NSArray<NSManagedObjectID> | null;

	referenceObjectForObjectID(objectID: NSManagedObjectID): any;
}

/**
 * @since 5.0
 */
declare class NSIncrementalStoreNode extends NSObject {

	static alloc(): NSIncrementalStoreNode; // inherited from NSObject

	static new(): NSIncrementalStoreNode; // inherited from NSObject

	readonly objectID: NSManagedObjectID;

	readonly version: number;

	constructor(o: { objectID: NSManagedObjectID; withValues: NSDictionary<string, any>; version: number; });

	initWithObjectIDWithValuesVersion(objectID: NSManagedObjectID, values: NSDictionary<string, any>, version: number): this;

	updateWithValuesVersion(values: NSDictionary<string, any>, version: number): void;

	valueForPropertyDescription(prop: NSPropertyDescription): any | null;
}

/**
 * @since 3.0
 */
declare var NSInferMappingModelAutomaticallyOption: string;

declare const NSInferredMappingModelError: number;

/**
 * @since 10.3
 */
declare var NSInsertedObjectIDsKey: string;

/**
 * @since 3.0
 */
declare var NSInsertedObjectsKey: string;

/**
 * @since 3.0
 */
declare var NSInvalidatedAllObjectsKey: string;

/**
 * @since 10.3
 */
declare var NSInvalidatedObjectIDsKey: string;

/**
 * @since 3.0
 */
declare var NSInvalidatedObjectsKey: string;

/**
 * @since 17.0
 */
declare class NSLightweightMigrationStage extends NSMigrationStage {

	static alloc(): NSLightweightMigrationStage; // inherited from NSObject

	static new(): NSLightweightMigrationStage; // inherited from NSObject

	readonly versionChecksums: NSArray<string>;

	constructor(o: { versionChecksums: NSArray<string> | string[]; });

	initWithVersionChecksums(versionChecksums: NSArray<string> | string[]): this;
}

/**
 * @since 3.0
 */
declare class NSManagedObject extends NSObject implements NSFetchRequestResult {

	static alloc(): NSManagedObject; // inherited from NSObject

	/**
	 * @since 10.0
	 */
	static entity(): NSEntityDescription;

	/**
	 * @since 10.0
	 */
	static fetchRequest(): NSFetchRequest<any>;

	static new(): NSManagedObject; // inherited from NSObject

	readonly deleted: boolean;

	readonly entity: NSEntityDescription;

	readonly fault: boolean;

	/**
	 * @since 3.0
	 */
	readonly faultingState: number;

	/**
	 * @since 5.0
	 */
	readonly hasChanges: boolean;

	/**
	 * @since 7.0
	 */
	readonly hasPersistentChangedValues: boolean;

	readonly inserted: boolean;

	readonly managedObjectContext: NSManagedObjectContext | null;

	readonly objectID: NSManagedObjectID;

	readonly updated: boolean;

	/**
	 * @since 3.0
	 */
	static readonly contextShouldIgnoreUnmodeledPropertyChanges: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	/**
	 * @since 10.0
	 */
	constructor(o: { context: NSManagedObjectContext; });

	constructor(o: { entity: NSEntityDescription; insertIntoManagedObjectContext: NSManagedObjectContext | null; });

	awakeFromFetch(): void;

	awakeFromInsert(): void;

	/**
	 * @since 3.0
	 */
	awakeFromSnapshotEvents(flags: NSSnapshotEventType): void;

	changedValues(): NSDictionary<string, any>;

	/**
	 * @since 5.0
	 */
	changedValuesForCurrentEvent(): NSDictionary<string, any>;

	class(): typeof NSObject;

	committedValuesForKeys(keys: NSArray<string> | string[] | null): NSDictionary<string, any>;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	didAccessValueForKey(key: string | null): void;

	didSave(): void;

	didTurnIntoFault(): void;

	/**
	 * @since 3.0
	 */
	hasFaultForRelationshipNamed(key: string): boolean;

	/**
	 * @since 10.0
	 */
	initWithContext(moc: NSManagedObjectContext): this;

	initWithEntityInsertIntoManagedObjectContext(entity: NSEntityDescription, context: NSManagedObjectContext | null): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	/**
	 * @since 8.3
	 */
	objectIDsForRelationshipNamed(key: string): NSArray<NSManagedObjectID>;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	/**
	 * @since 3.0
	 */
	prepareForDeletion(): void;

	primitiveValueForKey(key: string): any | null;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	setPrimitiveValueForKey(value: any | null, key: string): void;

	validateForDelete(error?: interop.Reference<NSError>): boolean;

	validateForInsert(error?: interop.Reference<NSError>): boolean;

	validateForUpdate(error?: interop.Reference<NSError>): boolean;

	willAccessValueForKey(key: string | null): void;

	willSave(): void;

	/**
	 * @since 3.0
	 */
	willTurnIntoFault(): void;
}

declare const NSManagedObjectConstraintMergeError: number;

declare const NSManagedObjectConstraintValidationError: number;

/**
 * @since 3.0
 */
declare class NSManagedObjectContext extends NSObject implements NSCoding, NSLocking {

	static alloc(): NSManagedObjectContext; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	static mergeChangesFromRemoteContextSaveIntoContexts(changeNotificationData: NSDictionary<any, any>, contexts: NSArray<NSManagedObjectContext> | NSManagedObjectContext[]): void;

	static new(): NSManagedObjectContext; // inherited from NSObject

	/**
	 * @since 10.0
	 */
	automaticallyMergesChangesFromParent: boolean;

	/**
	 * @since 5.0
	 */
	readonly concurrencyType: NSManagedObjectContextConcurrencyType;

	readonly deletedObjects: NSSet<NSManagedObject>;

	readonly hasChanges: boolean;

	readonly insertedObjects: NSSet<NSManagedObject>;

	mergePolicy: any;

	/**
	 * @since 8.0
	 */
	name: string | null;

	/**
	 * @since 5.0
	 */
	parentContext: NSManagedObjectContext | null;

	persistentStoreCoordinator: NSPersistentStoreCoordinator | null;

	propagatesDeletesAtEndOfEvent: boolean;

	/**
	 * @since 10.0
	 */
	readonly queryGenerationToken: NSQueryGenerationToken | null;

	readonly registeredObjects: NSSet<NSManagedObject>;

	retainsRegisteredObjects: boolean;

	/**
	 * @since 9.0
	 */
	shouldDeleteInaccessibleFaults: boolean;

	stalenessInterval: number;

	/**
	 * @since 11.0
	 */
	transactionAuthor: string | null;

	undoManager: NSUndoManager | null;

	readonly updatedObjects: NSSet<NSManagedObject>;

	/**
	 * @since 5.0
	 */
	readonly userInfo: NSMutableDictionary<any, any>;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 5.0
	 */
	constructor(o: { concurrencyType: NSManagedObjectContextConcurrencyType; });

	assignObjectToPersistentStore(object: any, store: NSPersistentStore): void;

	/**
	 * @since 3.0
	 */
	countForFetchRequestError(request: NSFetchRequest<any>, error?: interop.Reference<NSError>): number;

	deleteObject(object: NSManagedObject): void;

	detectConflictsForObject(object: NSManagedObject): void;

	encodeWithCoder(coder: NSCoder): void;

	executeFetchRequestError(request: NSFetchRequest<any>, error?: interop.Reference<NSError>): NSArray<any> | null;

	/**
	 * @since 8.0
	 */
	executeRequestError(request: NSPersistentStoreRequest, error?: interop.Reference<NSError>): NSPersistentStoreResult | null;

	/**
	 * @since 3.0
	 */
	existingObjectWithIDError(objectID: NSManagedObjectID, error?: interop.Reference<NSError>): NSManagedObject | null;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 5.0
	 */
	initWithConcurrencyType(ct: NSManagedObjectContextConcurrencyType): this;

	insertObject(object: NSManagedObject): void;

	lock(): void;

	/**
	 * @since 3.0
	 */
	mergeChangesFromContextDidSaveNotification(notification: NSNotification): void;

	objectRegisteredForID(objectID: NSManagedObjectID): NSManagedObject | null;

	objectWithID(objectID: NSManagedObjectID): NSManagedObject;

	/**
	 * @since 3.0
	 */
	obtainPermanentIDsForObjectsError(objects: NSArray<NSManagedObject> | NSManagedObject[], error?: interop.Reference<NSError>): boolean;

	/**
	 * @since 5.0
	 */
	performBlock(block: () => void): void;

	/**
	 * @since 5.0
	 */
	performBlockAndWait(block: () => void): void;

	processPendingChanges(): void;

	redo(): void;

	/**
	 * @since 8.3
	 */
	refreshAllObjects(): void;

	refreshObjectMergeChanges(object: NSManagedObject, flag: boolean): void;

	reset(): void;

	rollback(): void;

	save(error?: interop.Reference<NSError>): boolean;

	/**
	 * @since 10.0
	 */
	setQueryGenerationFromTokenError(generation: NSQueryGenerationToken | null, error?: interop.Reference<NSError>): boolean;

	/**
	 * @since 9.0
	 */
	shouldHandleInaccessibleFaultForObjectIDTriggeredByProperty(fault: NSManagedObject, oid: NSManagedObjectID, property: NSPropertyDescription | null): boolean;

	/**
	 * @since 3.0
	 * @deprecated 8.0
	 */
	tryLock(): boolean;

	undo(): void;

	unlock(): void;
}

/**
 * @since 5.0
 */
declare const enum NSManagedObjectContextConcurrencyType {

	ConfinementConcurrencyType = 0,

	PrivateQueueConcurrencyType = 1,

	MainQueueConcurrencyType = 2
}

/**
 * @since 10.3
 */
declare var NSManagedObjectContextDidMergeChangesObjectIDsNotification: string;

/**
 * @since 3.0
 */
declare var NSManagedObjectContextDidSaveNotification: string;

/**
 * @since 10.3
 */
declare var NSManagedObjectContextDidSaveObjectIDsNotification: string;

declare const NSManagedObjectContextLockingError: number;

/**
 * @since 3.0
 */
declare var NSManagedObjectContextObjectsDidChangeNotification: string;

/**
 * @since 10.0
 */
declare var NSManagedObjectContextQueryGenerationKey: string;

/**
 * @since 3.0
 */
declare var NSManagedObjectContextWillSaveNotification: string;

declare const NSManagedObjectExternalRelationshipError: number;

/**
 * @since 3.0
 */
declare class NSManagedObjectID extends NSObject implements NSCopying, NSFetchRequestResult {

	static alloc(): NSManagedObjectID; // inherited from NSObject

	static new(): NSManagedObjectID; // inherited from NSObject

	readonly entity: NSEntityDescription;

	readonly persistentStore: NSPersistentStore | null;

	readonly temporaryID: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	URIRepresentation(): NSURL;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

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

declare const NSManagedObjectMergeError: number;

/**
 * @since 3.0
 */
declare class NSManagedObjectModel extends NSObject implements NSCoding, NSCopying, NSFastEnumeration {

	static alloc(): NSManagedObjectModel; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	static checksumsForVersionedModelAtURLError(modelURL: NSURL, error?: interop.Reference<NSError>): NSDictionary<string, string> | null;

	static mergedModelFromBundles(bundles: NSArray<NSBundle> | NSBundle[] | null): NSManagedObjectModel | null;

	/**
	 * @since 3.0
	 */
	static mergedModelFromBundlesForStoreMetadata(bundles: NSArray<NSBundle> | NSBundle[] | null, metadata: NSDictionary<string, any>): NSManagedObjectModel | null;

	static modelByMergingModels(models: NSArray<NSManagedObjectModel> | NSManagedObjectModel[] | null): NSManagedObjectModel | null;

	/**
	 * @since 3.0
	 */
	static modelByMergingModelsForStoreMetadata(models: NSArray<NSManagedObjectModel> | NSManagedObjectModel[], metadata: NSDictionary<string, any>): NSManagedObjectModel | null;

	static new(): NSManagedObjectModel; // inherited from NSObject

	readonly configurations: NSArray<string>;

	entities: NSArray<NSEntityDescription>;

	readonly entitiesByName: NSDictionary<string, NSEntityDescription>;

	/**
	 * @since 3.0
	 */
	readonly entityVersionHashesByName: NSDictionary<string, NSData>;

	/**
	 * @since 3.0
	 */
	readonly fetchRequestTemplatesByName: NSDictionary<string, NSFetchRequest<any>>;

	localizationDictionary: NSDictionary<string, string> | null;

	/**
	 * @since 17.0
	 */
	readonly versionChecksum: string;

	/**
	 * @since 3.0
	 */
	versionIdentifiers: NSSet<any>;
	[Symbol.iterator](): Iterator<any>;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { contentsOfURL: NSURL; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	entitiesForConfiguration(configuration: string | null): NSArray<NSEntityDescription> | null;

	fetchRequestFromTemplateWithNameSubstitutionVariables(name: string, variables: NSDictionary<string, any>): NSFetchRequest<any> | null;

	fetchRequestTemplateForName(name: string): NSFetchRequest<any> | null;

	initWithCoder(coder: NSCoder): this;

	initWithContentsOfURL(url: NSURL): this;

	/**
	 * @since 3.0
	 */
	isConfigurationCompatibleWithStoreMetadata(configuration: string | null, metadata: NSDictionary<string, any>): boolean;

	setEntitiesForConfiguration(entities: NSArray<NSEntityDescription> | NSEntityDescription[], configuration: string): void;

	setFetchRequestTemplateForName(fetchRequestTemplate: NSFetchRequest<any> | null, name: string): void;
}

/**
 * @since 17.0
 */
declare class NSManagedObjectModelReference extends NSObject {

	static alloc(): NSManagedObjectModelReference; // inherited from NSObject

	static new(): NSManagedObjectModelReference; // inherited from NSObject

	readonly resolvedModel: NSManagedObjectModel;

	readonly versionChecksum: string;

	constructor(o: { entityVersionHashes: NSDictionary<any, any>; inBundle: NSBundle | null; versionChecksum: string; });

	constructor(o: { fileURL: NSURL; versionChecksum: string; });

	constructor(o: { model: NSManagedObjectModel; versionChecksum: string; });

	constructor(o: { name: string; inBundle: NSBundle | null; versionChecksum: string; });

	initWithEntityVersionHashesInBundleVersionChecksum(versionHash: NSDictionary<any, any>, bundle: NSBundle | null, versionChecksum: string): this;

	initWithFileURLVersionChecksum(fileURL: NSURL, versionChecksum: string): this;

	initWithModelVersionChecksum(model: NSManagedObjectModel, versionChecksum: string): this;

	initWithNameInBundleVersionChecksum(modelName: string, bundle: NSBundle | null, versionChecksum: string): this;
}

declare const NSManagedObjectModelReferenceNotFoundError: number;

declare const NSManagedObjectReferentialIntegrityError: number;

declare const NSManagedObjectValidationError: number;

/**
 * @since 3.0
 */
declare class NSMappingModel extends NSObject {

	static alloc(): NSMappingModel; // inherited from NSObject

	/**
	 * @since 3.0
	 */
	static inferredMappingModelForSourceModelDestinationModelError(sourceModel: NSManagedObjectModel, destinationModel: NSManagedObjectModel, error?: interop.Reference<NSError>): NSMappingModel | null;

	static mappingModelFromBundlesForSourceModelDestinationModel(bundles: NSArray<NSBundle> | NSBundle[] | null, sourceModel: NSManagedObjectModel | null, destinationModel: NSManagedObjectModel | null): NSMappingModel | null;

	static new(): NSMappingModel; // inherited from NSObject

	entityMappings: NSArray<NSEntityMapping>;

	readonly entityMappingsByName: NSDictionary<string, NSEntityMapping>;

	constructor(o: { contentsOfURL: NSURL | null; });

	initWithContentsOfURL(url: NSURL | null): this;
}

/**
 * @since 3.0
 */
declare var NSMergeByPropertyObjectTrumpMergePolicy: any;

/**
 * @since 3.0
 */
declare var NSMergeByPropertyObjectTrumpMergePolicyVar: any;

/**
 * @since 3.0
 */
declare var NSMergeByPropertyStoreTrumpMergePolicy: any;

/**
 * @since 3.0
 */
declare var NSMergeByPropertyStoreTrumpMergePolicyVar: any;

/**
 * @since 5.0
 */
declare class NSMergeConflict extends NSObject {

	static alloc(): NSMergeConflict; // inherited from NSObject

	static new(): NSMergeConflict; // inherited from NSObject

	readonly cachedSnapshot: NSDictionary<string, any> | null;

	readonly newVersionNumber: number;

	readonly objectSnapshot: NSDictionary<string, any> | null;

	readonly oldVersionNumber: number;

	readonly persistedSnapshot: NSDictionary<string, any> | null;

	readonly sourceObject: NSManagedObject;

	constructor(o: { source: NSManagedObject; newVersion: number; oldVersion: number; cachedSnapshot: NSDictionary<string, any> | null; persistedSnapshot: NSDictionary<string, any> | null; });

	initWithSourceNewVersionOldVersionCachedSnapshotPersistedSnapshot(srcObject: NSManagedObject, newvers: number, oldvers: number, cachesnap: NSDictionary<string, any> | null, persnap: NSDictionary<string, any> | null): this;
}

/**
 * @since 5.0
 */
declare class NSMergePolicy extends NSObject {

	static alloc(): NSMergePolicy; // inherited from NSObject

	static new(): NSMergePolicy; // inherited from NSObject

	readonly mergeType: NSMergePolicyType;

	/**
	 * @since 10.0
	 */
	static readonly errorMergePolicy: NSMergePolicy;

	/**
	 * @since 10.0
	 */
	static readonly mergeByPropertyObjectTrumpMergePolicy: NSMergePolicy;

	/**
	 * @since 10.0
	 */
	static readonly mergeByPropertyStoreTrumpMergePolicy: NSMergePolicy;

	/**
	 * @since 10.0
	 */
	static readonly overwriteMergePolicy: NSMergePolicy;

	/**
	 * @since 10.0
	 */
	static readonly rollbackMergePolicy: NSMergePolicy;

	constructor(o: { mergeType: NSMergePolicyType; });

	initWithMergeType(ty: NSMergePolicyType): this;

	resolveConflictsError(list: NSArray<any> | any[], error?: interop.Reference<NSError>): boolean;

	/**
	 * @since 9.0
	 */
	resolveConstraintConflictsError(list: NSArray<NSConstraintConflict> | NSConstraintConflict[], error?: interop.Reference<NSError>): boolean;

	/**
	 * @since 9.0
	 */
	resolveOptimisticLockingVersionConflictsError(list: NSArray<NSMergeConflict> | NSMergeConflict[], error?: interop.Reference<NSError>): boolean;
}

declare const enum NSMergePolicyType {

	ErrorMergePolicyType = 0,

	MergeByPropertyStoreTrumpMergePolicyType = 1,

	MergeByPropertyObjectTrumpMergePolicyType = 2,

	OverwriteMergePolicyType = 3,

	RollbackMergePolicyType = 4
}

/**
 * @since 3.0
 */
declare var NSMigratePersistentStoresAutomaticallyOption: string;

declare const NSMigrationCancelledError: number;

declare const NSMigrationConstraintViolationError: number;

/**
 * @since 3.0
 */
declare var NSMigrationDestinationObjectKey: string;

/**
 * @since 3.0
 */
declare var NSMigrationEntityMappingKey: string;

/**
 * @since 3.0
 */
declare var NSMigrationEntityPolicyKey: string;

declare const NSMigrationError: number;

/**
 * @since 3.0
 */
declare class NSMigrationManager extends NSObject {

	static alloc(): NSMigrationManager; // inherited from NSObject

	static new(): NSMigrationManager; // inherited from NSObject

	readonly currentEntityMapping: NSEntityMapping;

	readonly destinationContext: NSManagedObjectContext;

	readonly destinationModel: NSManagedObjectModel;

	readonly mappingModel: NSMappingModel;

	readonly migrationProgress: number;

	readonly sourceContext: NSManagedObjectContext;

	readonly sourceModel: NSManagedObjectModel;

	userInfo: NSDictionary<any, any> | null;

	/**
	 * @since 5.0
	 */
	usesStoreSpecificMigrationManager: boolean;

	constructor(o: { sourceModel: NSManagedObjectModel; destinationModel: NSManagedObjectModel; });

	associateSourceInstanceWithDestinationInstanceForEntityMapping(sourceInstance: NSManagedObject, destinationInstance: NSManagedObject, entityMapping: NSEntityMapping): void;

	cancelMigrationWithError(error: NSError): void;

	destinationEntityForEntityMapping(mEntity: NSEntityMapping): NSEntityDescription | null;

	destinationInstancesForEntityMappingNamedSourceInstances(mappingName: string, sourceInstances: NSArray<NSManagedObject> | NSManagedObject[] | null): NSArray<NSManagedObject>;

	initWithSourceModelDestinationModel(sourceModel: NSManagedObjectModel, destinationModel: NSManagedObjectModel): this;

	migrateStoreFromURLTypeOptionsWithMappingModelToDestinationURLDestinationTypeDestinationOptionsError(sourceURL: NSURL, sStoreType: string, sOptions: NSDictionary<any, any> | null, mappings: NSMappingModel | null, dURL: NSURL, dStoreType: string, dOptions: NSDictionary<any, any> | null, error?: interop.Reference<NSError>): boolean;

	reset(): void;

	sourceEntityForEntityMapping(mEntity: NSEntityMapping): NSEntityDescription | null;

	sourceInstancesForEntityMappingNamedDestinationInstances(mappingName: string, destinationInstances: NSArray<NSManagedObject> | NSManagedObject[] | null): NSArray<NSManagedObject>;
}

declare const NSMigrationManagerDestinationStoreError: number;

/**
 * @since 3.0
 */
declare var NSMigrationManagerKey: string;

declare const NSMigrationManagerSourceStoreError: number;

declare const NSMigrationMissingMappingModelError: number;

declare const NSMigrationMissingSourceModelError: number;

/**
 * @since 3.0
 */
declare var NSMigrationPropertyMappingKey: string;

/**
 * @since 3.0
 */
declare var NSMigrationSourceObjectKey: string;

/**
 * @since 17.0
 */
declare class NSMigrationStage extends NSObject {

	static alloc(): NSMigrationStage; // inherited from NSObject

	static new(): NSMigrationStage; // inherited from NSObject

	label: string;
}

/**
 * @since 3.0
 */
declare var NSOverwriteMergePolicy: any;

/**
 * @since 3.0
 */
declare var NSOverwriteMergePolicyVar: any;

/**
 * @since 13.0
 */
declare class NSPersistentCloudKitContainer extends NSPersistentContainer {

	static alloc(): NSPersistentCloudKitContainer; // inherited from NSObject

	static new(): NSPersistentCloudKitContainer; // inherited from NSObject

	static persistentContainerWithName(name: string): NSPersistentCloudKitContainer; // inherited from NSPersistentContainer

	static persistentContainerWithNameManagedObjectModel(name: string, model: NSManagedObjectModel): NSPersistentCloudKitContainer; // inherited from NSPersistentContainer

	/**
	 * @since 15.0
	 */
	acceptShareInvitationsFromMetadataIntoPersistentStoreCompletion(metadata: NSArray<CKShareMetadata> | CKShareMetadata[], persistentStore: NSPersistentStore, completion: (p1: NSArray<CKShareMetadata> | null, p2: NSError | null) => void | null): void;

	/**
	 * @since 14.0
	 */
	canDeleteRecordForManagedObjectWithID(objectID: NSManagedObjectID): boolean;

	/**
	 * @since 14.0
	 */
	canModifyManagedObjectsInStore(store: NSPersistentStore): boolean;

	/**
	 * @since 14.0
	 */
	canUpdateRecordForManagedObjectWithID(objectID: NSManagedObjectID): boolean;

	/**
	 * @since 15.0
	 */
	fetchParticipantsMatchingLookupInfosIntoPersistentStoreCompletion(lookupInfos: NSArray<CKUserIdentityLookupInfo> | CKUserIdentityLookupInfo[], persistentStore: NSPersistentStore, completion: (p1: NSArray<CKShareParticipant> | null, p2: NSError | null) => void): void;

	/**
	 * @since 15.0
	 */
	fetchSharesInPersistentStoreError(persistentStore: NSPersistentStore | null, error?: interop.Reference<NSError>): NSArray<CKShare> | null;

	/**
	 * @since 15.0
	 */
	fetchSharesMatchingObjectIDsError(objectIDs: NSArray<NSManagedObjectID> | NSManagedObjectID[], error?: interop.Reference<NSError>): NSDictionary<NSManagedObjectID, CKShare> | null;

	initializeCloudKitSchemaWithOptionsError(options: NSPersistentCloudKitContainerSchemaInitializationOptions, error?: interop.Reference<NSError>): boolean;

	/**
	 * @since 15.0
	 */
	persistUpdatedShareInPersistentStoreCompletion(share: CKShare, persistentStore: NSPersistentStore, completion: (p1: CKShare | null, p2: NSError | null) => void | null): void;

	/**
	 * @since 15.0
	 */
	purgeObjectsAndRecordsInZoneWithIDInPersistentStoreCompletion(zoneID: CKRecordZoneID, persistentStore: NSPersistentStore | null, completion: (p1: CKRecordZoneID | null, p2: NSError | null) => void | null): void;

	recordForManagedObjectID(managedObjectID: NSManagedObjectID): CKRecord | null;

	recordIDForManagedObjectID(managedObjectID: NSManagedObjectID): CKRecordID | null;

	recordIDsForManagedObjectIDs(managedObjectIDs: NSArray<NSManagedObjectID> | NSManagedObjectID[]): NSDictionary<NSManagedObjectID, CKRecordID>;

	recordsForManagedObjectIDs(managedObjectIDs: NSArray<NSManagedObjectID> | NSManagedObjectID[]): NSDictionary<NSManagedObjectID, CKRecord>;

	/**
	 * @since 15.0
	 */
	shareManagedObjectsToShareCompletion(managedObjects: NSArray<NSManagedObject> | NSManagedObject[], share: CKShare | null, completion: (p1: NSSet<NSManagedObjectID> | null, p2: CKShare | null, p3: CKContainer | null, p4: NSError | null) => void): void;
}

/**
 * @since 14.0
 */
declare class NSPersistentCloudKitContainerEvent extends NSObject implements NSCopying {

	static alloc(): NSPersistentCloudKitContainerEvent; // inherited from NSObject

	static new(): NSPersistentCloudKitContainerEvent; // inherited from NSObject

	readonly endDate: Date | null;

	readonly error: NSError | null;

	readonly identifier: NSUUID;

	readonly startDate: Date;

	readonly storeIdentifier: string;

	readonly succeeded: boolean;

	readonly type: NSPersistentCloudKitContainerEventType;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;
}

/**
 * @since 14.0
 */
declare var NSPersistentCloudKitContainerEventChangedNotification: string;

/**
 * @since 14.0
 */
declare class NSPersistentCloudKitContainerEventRequest extends NSPersistentStoreRequest {

	static alloc(): NSPersistentCloudKitContainerEventRequest; // inherited from NSObject

	static fetchEventsAfterDate(date: Date): NSPersistentCloudKitContainerEventRequest;

	static fetchEventsAfterEvent(event: NSPersistentCloudKitContainerEvent | null): NSPersistentCloudKitContainerEventRequest;

	static fetchEventsMatchingFetchRequest(fetchRequest: NSFetchRequest<any>): NSPersistentCloudKitContainerEventRequest;

	static fetchRequestForEvents(): NSFetchRequest<any>;

	static new(): NSPersistentCloudKitContainerEventRequest; // inherited from NSObject

	resultType: NSPersistentCloudKitContainerEventResultType;
}

/**
 * @since 14.0
 */
declare class NSPersistentCloudKitContainerEventResult extends NSPersistentStoreResult {

	static alloc(): NSPersistentCloudKitContainerEventResult; // inherited from NSObject

	static new(): NSPersistentCloudKitContainerEventResult; // inherited from NSObject

	readonly result: any | null;

	readonly resultType: NSPersistentCloudKitContainerEventResultType;
}

/**
 * @since 14.0
 */
declare const enum NSPersistentCloudKitContainerEventResultType {

	Events = 0,

	CountEvents = 1
}

/**
 * @since 14.0
 */
declare const enum NSPersistentCloudKitContainerEventType {

	Setup = 0,

	Import = 1,

	Export = 2
}

/**
 * @since 14.0
 */
declare var NSPersistentCloudKitContainerEventUserInfoKey: string;

/**
 * @since 13.0
 */
declare class NSPersistentCloudKitContainerOptions extends NSObject {

	static alloc(): NSPersistentCloudKitContainerOptions; // inherited from NSObject

	static new(): NSPersistentCloudKitContainerOptions; // inherited from NSObject

	readonly containerIdentifier: string;

	/**
	 * @since 14.0
	 */
	databaseScope: CKDatabaseScope;

	constructor(o: { containerIdentifier: string; });

	initWithContainerIdentifier(containerIdentifier: string): this;
}

declare const enum NSPersistentCloudKitContainerSchemaInitializationOptions {

	None = 0,

	DryRun = 2,

	PrintSchema = 4
}

/**
 * @since 10.0
 */
declare class NSPersistentContainer extends NSObject {

	static alloc(): NSPersistentContainer; // inherited from NSObject

	static defaultDirectoryURL(): NSURL;

	static new(): NSPersistentContainer; // inherited from NSObject

	static persistentContainerWithName(name: string): NSPersistentContainer;

	static persistentContainerWithNameManagedObjectModel(name: string, model: NSManagedObjectModel): NSPersistentContainer;

	readonly managedObjectModel: NSManagedObjectModel;

	readonly name: string;

	readonly persistentStoreCoordinator: NSPersistentStoreCoordinator;

	persistentStoreDescriptions: NSArray<NSPersistentStoreDescription>;

	readonly viewContext: NSManagedObjectContext;

	constructor(o: { name: string; });

	constructor(o: { name: string; managedObjectModel: NSManagedObjectModel; });

	initWithName(name: string): this;

	initWithNameManagedObjectModel(name: string, model: NSManagedObjectModel): this;

	loadPersistentStoresWithCompletionHandler(block: (p1: NSPersistentStoreDescription, p2: NSError | null) => void): void;

	newBackgroundContext(): NSManagedObjectContext;

	performBackgroundTask(block: (p1: NSManagedObjectContext) => void): void;
}

/**
 * @since 11.0
 */
declare class NSPersistentHistoryChange extends NSObject implements NSCopying {

	static alloc(): NSPersistentHistoryChange; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static entityDescriptionWithContext(context: NSManagedObjectContext): NSEntityDescription | null;

	static new(): NSPersistentHistoryChange; // inherited from NSObject

	readonly changeID: number;

	readonly changeType: NSPersistentHistoryChangeType;

	readonly changedObjectID: NSManagedObjectID;

	readonly tombstone: NSDictionary<any, any> | null;

	readonly transaction: NSPersistentHistoryTransaction | null;

	readonly updatedProperties: NSSet<NSPropertyDescription> | null;

	/**
	 * @since 13.0
	 */
	static readonly entityDescription: NSEntityDescription | null;

	/**
	 * @since 13.0
	 */
	static readonly fetchRequest: NSFetchRequest<any> | null;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;
}

/**
 * @since 11.0
 */
declare class NSPersistentHistoryChangeRequest extends NSPersistentStoreRequest {

	static alloc(): NSPersistentHistoryChangeRequest; // inherited from NSObject

	static deleteHistoryBeforeDate(date: Date): NSPersistentHistoryChangeRequest;

	static deleteHistoryBeforeToken(token: NSPersistentHistoryToken | null): NSPersistentHistoryChangeRequest;

	static deleteHistoryBeforeTransaction(transaction: NSPersistentHistoryTransaction | null): NSPersistentHistoryChangeRequest;

	static fetchHistoryAfterDate(date: Date): NSPersistentHistoryChangeRequest;

	static fetchHistoryAfterToken(token: NSPersistentHistoryToken | null): NSPersistentHistoryChangeRequest;

	static fetchHistoryAfterTransaction(transaction: NSPersistentHistoryTransaction | null): NSPersistentHistoryChangeRequest;

	/**
	 * @since 13.0
	 */
	static fetchHistoryWithFetchRequest(fetchRequest: NSFetchRequest<any>): NSPersistentHistoryChangeRequest;

	static new(): NSPersistentHistoryChangeRequest; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	fetchRequest: NSFetchRequest<any> | null;

	resultType: NSPersistentHistoryResultType;

	readonly token: NSPersistentHistoryToken | null;
}

/**
 * @since 11.0
 */
declare const enum NSPersistentHistoryChangeType {

	Insert = 0,

	Update = 1,

	Delete = 2
}

/**
 * @since 11.0
 */
declare class NSPersistentHistoryResult extends NSPersistentStoreResult {

	static alloc(): NSPersistentHistoryResult; // inherited from NSObject

	static new(): NSPersistentHistoryResult; // inherited from NSObject

	readonly result: any | null;

	readonly resultType: NSPersistentHistoryResultType;
}

/**
 * @since 11.0
 */
declare const enum NSPersistentHistoryResultType {

	StatusOnly = 0,

	ObjectIDs = 1,

	Count = 2,

	TransactionsOnly = 3,

	ChangesOnly = 4,

	TransactionsAndChanges = 5
}

/**
 * @since 11.0
 */
declare class NSPersistentHistoryToken extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSPersistentHistoryToken; // inherited from NSObject

	static new(): NSPersistentHistoryToken; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const NSPersistentHistoryTokenExpiredError: number;

/**
 * @since 12.0
 */
declare var NSPersistentHistoryTokenKey: string;

/**
 * @since 11.0
 */
declare var NSPersistentHistoryTrackingKey: string;

/**
 * @since 11.0
 */
declare class NSPersistentHistoryTransaction extends NSObject implements NSCopying {

	static alloc(): NSPersistentHistoryTransaction; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static entityDescriptionWithContext(context: NSManagedObjectContext): NSEntityDescription | null;

	static new(): NSPersistentHistoryTransaction; // inherited from NSObject

	readonly author: string | null;

	readonly bundleID: string;

	readonly changes: NSArray<NSPersistentHistoryChange> | null;

	readonly contextName: string | null;

	readonly processID: string;

	readonly storeID: string;

	readonly timestamp: Date;

	readonly token: NSPersistentHistoryToken;

	readonly transactionNumber: number;

	/**
	 * @since 13.0
	 */
	static readonly entityDescription: NSEntityDescription | null;

	/**
	 * @since 13.0
	 */
	static readonly fetchRequest: NSFetchRequest<any> | null;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	objectIDNotification(): NSNotification;
}

/**
 * @since 3.0
 */
declare class NSPersistentStore extends NSObject {

	static alloc(): NSPersistentStore; // inherited from NSObject

	static metadataForPersistentStoreWithURLError(url: NSURL, error?: interop.Reference<NSError>): NSDictionary<string, any> | null;

	/**
	 * @since 3.0
	 */
	static migrationManagerClass(): typeof NSObject;

	static new(): NSPersistentStore; // inherited from NSObject

	static setMetadataForPersistentStoreWithURLError(metadata: NSDictionary<string, any> | null, url: NSURL, error?: interop.Reference<NSError>): boolean;

	URL: NSURL | null;

	readonly configurationName: string;

	/**
	 * @since 11.0
	 */
	readonly coreSpotlightExporter: NSCoreDataCoreSpotlightDelegate;

	identifier: string;

	metadata: NSDictionary<string, any>;

	readonly options: NSDictionary<any, any> | null;

	readonly persistentStoreCoordinator: NSPersistentStoreCoordinator | null;

	readOnly: boolean;

	readonly type: string;

	constructor(o: { persistentStoreCoordinator: NSPersistentStoreCoordinator | null; configurationName: string | null; URL: NSURL; options: NSDictionary<any, any> | null; });

	didAddToPersistentStoreCoordinator(coordinator: NSPersistentStoreCoordinator): void;

	initWithPersistentStoreCoordinatorConfigurationNameURLOptions(root: NSPersistentStoreCoordinator | null, name: string | null, url: NSURL, options: NSDictionary<any, any> | null): this;

	loadMetadata(error?: interop.Reference<NSError>): boolean;

	willRemoveFromPersistentStoreCoordinator(coordinator: NSPersistentStoreCoordinator | null): void;
}

/**
 * @since 8.0
 */
declare class NSPersistentStoreAsynchronousResult extends NSPersistentStoreResult {

	static alloc(): NSPersistentStoreAsynchronousResult; // inherited from NSObject

	static new(): NSPersistentStoreAsynchronousResult; // inherited from NSObject

	readonly managedObjectContext: NSManagedObjectContext;

	readonly operationError: NSError | null;

	readonly progress: NSProgress | null;

	cancel(): void;
}

/**
 * @since 10.0
 */
declare var NSPersistentStoreConnectionPoolMaxSizeKey: string;

/**
 * @since 3.0
 */
declare class NSPersistentStoreCoordinator extends NSObject implements NSLocking {

	static alloc(): NSPersistentStoreCoordinator; // inherited from NSObject

	/**
	 * @since 26.4
	 */
	static cachedModelForPersistentStoreAtURLOptionsError(url: NSURL, options: NSDictionary<any, any> | null, error?: interop.Reference<NSError>): NSManagedObjectModel | null;

	/**
	 * @since 3.0
	 * @deprecated 9.0
	 */
	static metadataForPersistentStoreOfTypeURLError(storeType: string | null, url: NSURL, error?: interop.Reference<NSError>): NSDictionary<string, any> | null;

	/**
	 * @since 7.0
	 */
	static metadataForPersistentStoreOfTypeURLOptionsError(storeType: string, url: NSURL, options: NSDictionary<any, any> | null, error?: interop.Reference<NSError>): NSDictionary<string, any> | null;

	static new(): NSPersistentStoreCoordinator; // inherited from NSObject

	/**
	 * @since 3.0
	 */
	static registerStoreClassForStoreType(storeClass: typeof NSObject | null, storeType: string): void;

	/**
	 * @since 5.0
	 * @deprecated 10.0
	 */
	static removeUbiquitousContentAndPersistentStoreAtURLOptionsError(storeURL: NSURL, options: NSDictionary<any, any> | null, error?: interop.Reference<NSError>): boolean;

	/**
	 * @since 3.0
	 * @deprecated 9.0
	 */
	static setMetadataForPersistentStoreOfTypeURLError(metadata: NSDictionary<string, any> | null, storeType: string | null, url: NSURL, error?: interop.Reference<NSError>): boolean;

	/**
	 * @since 7.0
	 */
	static setMetadataForPersistentStoreOfTypeURLOptionsError(metadata: NSDictionary<string, any> | null, storeType: string, url: NSURL, options: NSDictionary<any, any> | null, error?: interop.Reference<NSError>): boolean;

	readonly managedObjectModel: NSManagedObjectModel;

	/**
	 * @since 8.0
	 */
	name: string | null;

	readonly persistentStores: NSArray<NSPersistentStore>;

	/**
	 * @since 3.0
	 */
	static readonly registeredStoreTypes: NSDictionary<string, NSValue>;

	constructor(o: { managedObjectModel: NSManagedObjectModel; });

	URLForPersistentStore(store: NSPersistentStore): NSURL;

	/**
	 * @since 10.0
	 */
	addPersistentStoreWithDescriptionCompletionHandler(storeDescription: NSPersistentStoreDescription, block: (p1: NSPersistentStoreDescription, p2: NSError | null) => void): void;

	addPersistentStoreWithTypeConfigurationURLOptionsError(storeType: string, configuration: string | null, storeURL: NSURL | null, options: NSDictionary<any, any> | null, error?: interop.Reference<NSError>): NSPersistentStore | null;

	/**
	 * @since 12.0
	 */
	currentPersistentHistoryTokenFromStores(stores: NSArray<any> | any[] | null): NSPersistentHistoryToken | null;

	/**
	 * @since 9.0
	 */
	destroyPersistentStoreAtURLWithTypeOptionsError(url: NSURL, storeType: string, options: NSDictionary<any, any> | null, error?: interop.Reference<NSError>): boolean;

	/**
	 * @since 5.0
	 */
	executeRequestWithContextError(request: NSPersistentStoreRequest, context: NSManagedObjectContext, error?: interop.Reference<NSError>): any | null;

	/**
	 * @since 14.0
	 */
	finishDeferredLightweightMigration(error?: interop.Reference<NSError>): boolean;

	/**
	 * @since 14.0
	 */
	finishDeferredLightweightMigrationTask(error?: interop.Reference<NSError>): boolean;

	initWithManagedObjectModel(model: NSManagedObjectModel): this;

	lock(): void;

	managedObjectIDForURIRepresentation(url: NSURL): NSManagedObjectID | null;

	/**
	 * @since 5.0
	 */
	managedObjectIDFromUTF8StringLength(utf8string: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, len: number): NSManagedObjectID;

	metadataForPersistentStore(store: NSPersistentStore): NSDictionary<string, any>;

	migratePersistentStoreToURLOptionsWithTypeError(store: NSPersistentStore, URL: NSURL, options: NSDictionary<any, any> | null, storeType: string, error?: interop.Reference<NSError>): NSPersistentStore | null;

	/**
	 * @since 8.0
	 */
	performBlock(block: () => void): void;

	/**
	 * @since 8.0
	 */
	performBlockAndWait(block: () => void): void;

	persistentStoreForURL(URL: NSURL): NSPersistentStore | null;

	removePersistentStoreError(store: NSPersistentStore, error?: interop.Reference<NSError>): boolean;

	/**
	 * @since 9.0
	 */
	replacePersistentStoreAtURLDestinationOptionsWithPersistentStoreFromURLSourceOptionsStoreTypeError(destinationURL: NSURL, destinationOptions: NSDictionary<any, any> | null, sourceURL: NSURL, sourceOptions: NSDictionary<any, any> | null, storeType: string, error?: interop.Reference<NSError>): boolean;

	setMetadataForPersistentStore(metadata: NSDictionary<string, any> | null, store: NSPersistentStore): void;

	/**
	 * @since 3.0
	 */
	setURLForPersistentStore(url: NSURL, store: NSPersistentStore): boolean;

	/**
	 * @since 3.0
	 * @deprecated 8.0
	 */
	tryLock(): boolean;

	unlock(): void;
}

declare const NSPersistentStoreCoordinatorLockingError: number;

/**
 * @since 3.0
 */
declare var NSPersistentStoreCoordinatorStoresDidChangeNotification: string;

/**
 * @since 7.0
 */
declare var NSPersistentStoreCoordinatorStoresWillChangeNotification: string;

/**
 * @since 3.0
 */
declare var NSPersistentStoreCoordinatorWillRemoveStoreNotification: string;

/**
 * @since 14.0
 */
declare var NSPersistentStoreDeferredLightweightMigrationOptionKey: string;

/**
 * @since 10.0
 */
declare class NSPersistentStoreDescription extends NSObject implements NSCopying {

	static alloc(): NSPersistentStoreDescription; // inherited from NSObject

	static new(): NSPersistentStoreDescription; // inherited from NSObject

	static persistentStoreDescriptionWithURL(URL: NSURL): NSPersistentStoreDescription;

	URL: NSURL | null;

	/**
	 * @since 13.0
	 */
	cloudKitContainerOptions: NSPersistentCloudKitContainerOptions | null;

	configuration: string | null;

	readonly options: NSDictionary<string, NSObject>;

	readOnly: boolean;

	shouldAddStoreAsynchronously: boolean;

	shouldInferMappingModelAutomatically: boolean;

	shouldMigrateStoreAutomatically: boolean;

	readonly sqlitePragmas: NSDictionary<string, NSObject>;

	timeout: number;

	type: string;

	constructor(o: { URL: NSURL; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	initWithURL(url: NSURL): this;

	setOptionForKey(option: NSObject | null, key: string): void;

	setValueForPragmaNamed(value: NSObject | null, name: string): void;
}

/**
 * @since 5.0
 * @deprecated 10.0
 */
declare var NSPersistentStoreDidImportUbiquitousContentChangesNotification: string;

/**
 * @since 5.0
 */
declare var NSPersistentStoreFileProtectionKey: string;

/**
 * @since 6.0
 */
declare var NSPersistentStoreForceDestroyOption: string;

declare const NSPersistentStoreIncompatibleSchemaError: number;

declare const NSPersistentStoreIncompatibleVersionHashError: number;

declare const NSPersistentStoreIncompleteSaveError: number;

declare const NSPersistentStoreInvalidTypeError: number;

/**
 * @since 18.0
 */
declare var NSPersistentStoreModelVersionChecksumKey: string;

/**
 * @since 3.0
 */
declare var NSPersistentStoreOSCompatibility: string;

declare const NSPersistentStoreOpenError: number;

declare const NSPersistentStoreOperationError: number;

/**
 * @since 7.0
 * @deprecated 10.0
 */
declare var NSPersistentStoreRebuildFromUbiquitousContentOption: string;

/**
 * @since 12.0
 */
declare var NSPersistentStoreRemoteChangeNotification: string;

/**
 * @since 13.0
 */
declare var NSPersistentStoreRemoteChangeNotificationPostOptionKey: string;

/**
 * @since 7.0
 * @deprecated 10.0
 */
declare var NSPersistentStoreRemoveUbiquitousMetadataOption: string;

/**
 * @since 5.0
 */
declare class NSPersistentStoreRequest extends NSObject implements NSCopying {

	static alloc(): NSPersistentStoreRequest; // inherited from NSObject

	static new(): NSPersistentStoreRequest; // inherited from NSObject

	affectedStores: NSArray<NSPersistentStore> | null;

	readonly requestType: NSPersistentStoreRequestType;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;
}

declare const enum NSPersistentStoreRequestType {

	FetchRequestType = 1,

	SaveRequestType = 2,

	BatchInsertRequestType = 5,

	BatchUpdateRequestType = 6,

	BatchDeleteRequestType = 7
}

/**
 * @since 8.0
 */
declare class NSPersistentStoreResult extends NSObject {

	static alloc(): NSPersistentStoreResult; // inherited from NSObject

	static new(): NSPersistentStoreResult; // inherited from NSObject
}

declare const NSPersistentStoreSaveConflictsError: number;

/**
 * @since 5.0
 */
declare var NSPersistentStoreSaveConflictsErrorKey: string;

declare const NSPersistentStoreSaveError: number;

/**
 * @since 17.0
 */
declare var NSPersistentStoreStagedMigrationManagerOptionKey: string;

declare const NSPersistentStoreTimeoutError: number;

/**
 * @since 3.0
 */
declare var NSPersistentStoreTimeoutOption: string;

declare const NSPersistentStoreTypeMismatchError: number;

/**
 * @since 12.0
 */
declare var NSPersistentStoreURLKey: string;

/**
 * @since 7.0
 * @deprecated 10.0
 */
declare var NSPersistentStoreUbiquitousContainerIdentifierKey: string;

/**
 * @since 5.0
 * @deprecated 10.0
 */
declare var NSPersistentStoreUbiquitousContentNameKey: string;

/**
 * @since 5.0
 * @deprecated 10.0
 */
declare var NSPersistentStoreUbiquitousContentURLKey: string;

/**
 * @since 7.0
 * @deprecated 10.0
 */
declare var NSPersistentStoreUbiquitousPeerTokenOption: string;

/**
 * @since 7.0
 * @deprecated 10.0
 */
declare const enum NSPersistentStoreUbiquitousTransitionType {

	AccountAdded = 1,

	AccountRemoved = 2,

	ContentRemoved = 3,

	InitialImportCompleted = 4
}

/**
 * @since 7.0
 * @deprecated 10.0
 */
declare var NSPersistentStoreUbiquitousTransitionTypeKey: string;

declare const NSPersistentStoreUnsupportedRequestTypeError: number;

/**
 * @since 3.0
 */
declare class NSPropertyDescription extends NSObject implements NSCoding, NSCopying {

	static alloc(): NSPropertyDescription; // inherited from NSObject

	static new(): NSPropertyDescription; // inherited from NSObject

	readonly entity: NSEntityDescription;

	/**
	 * @since 3.0
	 * @deprecated 11.0
	 */
	indexed: boolean;

	/**
	 * @since 3.0
	 */
	indexedBySpotlight: boolean;

	name: string;

	optional: boolean;

	/**
	 * @since 3.0
	 */
	renamingIdentifier: string | null;

	/**
	 * @since 3.0
	 * @deprecated 11.0
	 */
	storedInExternalRecord: boolean;

	transient: boolean;

	userInfo: NSDictionary<any, any> | null;

	readonly validationPredicates: NSArray<NSPredicate>;

	readonly validationWarnings: NSArray<any>;

	/**
	 * @since 3.0
	 */
	readonly versionHash: NSData;

	/**
	 * @since 3.0
	 */
	versionHashModifier: string | null;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	setValidationPredicatesWithValidationWarnings(validationPredicates: NSArray<NSPredicate> | NSPredicate[] | null, validationWarnings: NSArray<string> | string[] | null): void;
}

/**
 * @since 3.0
 */
declare class NSPropertyMapping extends NSObject {

	static alloc(): NSPropertyMapping; // inherited from NSObject

	static new(): NSPropertyMapping; // inherited from NSObject

	name: string | null;

	userInfo: NSDictionary<any, any> | null;

	valueExpression: NSExpression | null;
}

/**
 * @since 10.0
 */
declare class NSQueryGenerationToken extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NSQueryGenerationToken; // inherited from NSObject

	static new(): NSQueryGenerationToken; // inherited from NSObject

	static readonly currentQueryGenerationToken: NSQueryGenerationToken;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 3.0
 */
declare var NSReadOnlyPersistentStoreOption: string;

/**
 * @since 10.3
 */
declare var NSRefreshedObjectIDsKey: string;

/**
 * @since 3.0
 */
declare var NSRefreshedObjectsKey: string;

/**
 * @since 3.0
 */
declare class NSRelationshipDescription extends NSPropertyDescription {

	static alloc(): NSRelationshipDescription; // inherited from NSObject

	static new(): NSRelationshipDescription; // inherited from NSObject

	deleteRule: NSDeleteRule;

	destinationEntity: NSEntityDescription | null;

	inverseRelationship: NSRelationshipDescription | null;

	maxCount: number;

	minCount: number;

	/**
	 * @since 5.0
	 */
	ordered: boolean;

	readonly toMany: boolean;
}

/**
 * @since 3.0
 */
declare var NSRemovedPersistentStoresKey: string;

/**
 * @since 3.0
 */
declare var NSRollbackMergePolicy: any;

/**
 * @since 3.0
 */
declare var NSRollbackMergePolicyVar: any;

/**
 * @since 3.0
 */
declare var NSSQLiteAnalyzeOption: string;

declare const NSSQLiteError: number;

/**
 * @since 3.0
 */
declare var NSSQLiteErrorDomain: string;

/**
 * @since 3.0
 */
declare var NSSQLiteManualVacuumOption: string;

/**
 * @since 3.0
 */
declare var NSSQLitePragmasOption: string;

/**
 * @since 3.0
 */
declare var NSSQLiteStoreType: string;

/**
 * @since 5.0
 */
declare class NSSaveChangesRequest extends NSPersistentStoreRequest {

	static alloc(): NSSaveChangesRequest; // inherited from NSObject

	static new(): NSSaveChangesRequest; // inherited from NSObject

	readonly deletedObjects: NSSet<NSManagedObject> | null;

	readonly insertedObjects: NSSet<NSManagedObject> | null;

	readonly lockedObjects: NSSet<NSManagedObject> | null;

	readonly updatedObjects: NSSet<NSManagedObject> | null;

	constructor(o: { insertedObjects: NSSet<NSManagedObject> | null; updatedObjects: NSSet<NSManagedObject> | null; deletedObjects: NSSet<NSManagedObject> | null; lockedObjects: NSSet<NSManagedObject> | null; });

	initWithInsertedObjectsUpdatedObjectsDeletedObjectsLockedObjects(insertedObjects: NSSet<NSManagedObject> | null, updatedObjects: NSSet<NSManagedObject> | null, deletedObjects: NSSet<NSManagedObject> | null, lockedObjects: NSSet<NSManagedObject> | null): this;
}

declare const enum NSSnapshotEventType {

	UndoInsertion = 2,

	UndoDeletion = 4,

	UndoUpdate = 8,

	Rollback = 16,

	Refresh = 32,

	MergePolicy = 64
}

declare const NSStagedMigrationBackwardMigrationError: number;

declare const NSStagedMigrationFrameworkVersionMismatchError: number;

/**
 * @since 17.0
 */
declare class NSStagedMigrationManager extends NSObject {

	static alloc(): NSStagedMigrationManager; // inherited from NSObject

	static new(): NSStagedMigrationManager; // inherited from NSObject

	readonly container: NSPersistentContainer | null;

	readonly stages: NSArray<NSMigrationStage>;

	constructor(o: { migrationStages: NSArray<NSMigrationStage> | NSMigrationStage[]; });

	initWithMigrationStages(stages: NSArray<NSMigrationStage> | NSMigrationStage[]): this;
}

/**
 * @since 3.0
 */
declare var NSStoreModelVersionHashesKey: string;

/**
 * @since 3.0
 */
declare var NSStoreModelVersionIdentifiersKey: string;

/**
 * @since 3.0
 */
declare var NSStoreTypeKey: string;

/**
 * @since 3.0
 */
declare var NSStoreUUIDKey: string;

/**
 * @since 3.0
 */
declare var NSUUIDChangedPersistentStoresKey: string;

/**
 * @since 10.3
 */
declare var NSUpdatedObjectIDsKey: string;

/**
 * @since 3.0
 */
declare var NSUpdatedObjectsKey: string;

declare const NSValidationDateTooLateError: number;

declare const NSValidationDateTooSoonError: number;

declare const NSValidationInvalidDateError: number;

declare const NSValidationInvalidURIError: number;

/**
 * @since 3.0
 */
declare var NSValidationKeyErrorKey: string;

declare const NSValidationMissingMandatoryPropertyError: number;

declare const NSValidationMultipleErrorsError: number;

declare const NSValidationNumberTooLargeError: number;

declare const NSValidationNumberTooSmallError: number;

/**
 * @since 3.0
 */
declare var NSValidationObjectErrorKey: string;

/**
 * @since 3.0
 */
declare var NSValidationPredicateErrorKey: string;

declare const NSValidationRelationshipDeniedDeleteError: number;

declare const NSValidationRelationshipExceedsMaximumCountError: number;

declare const NSValidationRelationshipLacksMinimumCountError: number;

declare const NSValidationStringPatternMatchingError: number;

declare const NSValidationStringTooLongError: number;

declare const NSValidationStringTooShortError: number;

/**
 * @since 3.0
 */
declare var NSValidationValueErrorKey: string;
