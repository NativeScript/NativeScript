
declare var NSAddedPersistentStoresKey: string;

declare var NSAffectedObjectsErrorKey: string;

declare var NSAffectedStoresErrorKey: string;

declare class NSAsynchronousFetchRequest<ResultType> extends NSPersistentStoreRequest {

	static alloc<ResultType>(): NSAsynchronousFetchRequest<ResultType>; // inherited from NSObject

	static new<ResultType>(): NSAsynchronousFetchRequest<ResultType>; // inherited from NSObject

	readonly completionBlock: (p1: NSAsynchronousFetchResult<any>) => void;

	estimatedResultCount: number;

	readonly fetchRequest: NSFetchRequest<ResultType>;

	constructor(o: { fetchRequest: NSFetchRequest<ResultType>; completionBlock: (p1: NSAsynchronousFetchResult<ResultType>) => void; });

	initWithFetchRequestCompletionBlock(request: NSFetchRequest<ResultType>, blk: (p1: NSAsynchronousFetchResult<ResultType>) => void): this;
}

declare class NSAsynchronousFetchResult<ResultType> extends NSPersistentStoreAsynchronousResult {

	static alloc<ResultType>(): NSAsynchronousFetchResult<ResultType>; // inherited from NSObject

	static new<ResultType>(): NSAsynchronousFetchResult<ResultType>; // inherited from NSObject

	readonly fetchRequest: NSAsynchronousFetchRequest<ResultType>;

	readonly finalResult: NSArray<ResultType>;
}

declare class NSAtomicStore extends NSPersistentStore {

	static alloc(): NSAtomicStore; // inherited from NSObject

	static new(): NSAtomicStore; // inherited from NSObject

	addCacheNodes(cacheNodes: NSSet<NSAtomicStoreCacheNode>): void;

	cacheNodeForObjectID(objectID: NSManagedObjectID): NSAtomicStoreCacheNode;

	cacheNodes(): NSSet<NSAtomicStoreCacheNode>;

	load(): boolean;

	newCacheNodeForManagedObject(managedObject: NSManagedObject): NSAtomicStoreCacheNode;

	newReferenceObjectForManagedObject(managedObject: NSManagedObject): any;

	objectIDForEntityReferenceObject(entity: NSEntityDescription, data: any): NSManagedObjectID;

	referenceObjectForObjectID(objectID: NSManagedObjectID): any;

	save(): boolean;

	updateCacheNodeFromManagedObject(node: NSAtomicStoreCacheNode, managedObject: NSManagedObject): void;

	willRemoveCacheNodes(cacheNodes: NSSet<NSAtomicStoreCacheNode>): void;
}

declare class NSAtomicStoreCacheNode extends NSObject {

	static alloc(): NSAtomicStoreCacheNode; // inherited from NSObject

	static new(): NSAtomicStoreCacheNode; // inherited from NSObject

	readonly objectID: NSManagedObjectID;

	propertyCache: NSMutableDictionary<string, any>;

	constructor(o: { objectID: NSManagedObjectID; });

	initWithObjectID(moid: NSManagedObjectID): this;
}

declare class NSAttributeDescription extends NSPropertyDescription {

	static alloc(): NSAttributeDescription; // inherited from NSObject

	static new(): NSAttributeDescription; // inherited from NSObject

	allowsExternalBinaryDataStorage: boolean;

	attributeType: NSAttributeType;

	attributeValueClassName: string;

	defaultValue: any;

	valueTransformerName: string;
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

	TransformableAttributeType = 1800,

	ObjectIDAttributeType = 2000
}

declare class NSBatchDeleteRequest extends NSPersistentStoreRequest {

	static alloc(): NSBatchDeleteRequest; // inherited from NSObject

	static new(): NSBatchDeleteRequest; // inherited from NSObject

	readonly fetchRequest: NSFetchRequest<any>;

	resultType: NSBatchDeleteRequestResultType;

	constructor(o: { fetchRequest: NSFetchRequest<any>; });

	constructor(o: { objectIDs: NSArray<NSManagedObjectID>; });

	initWithFetchRequest(fetch: NSFetchRequest<any>): this;

	initWithObjectIDs(objects: NSArray<NSManagedObjectID>): this;
}

declare const enum NSBatchDeleteRequestResultType {

	ResultTypeStatusOnly = 0,

	ResultTypeObjectIDs = 1,

	ResultTypeCount = 2
}

declare class NSBatchDeleteResult extends NSPersistentStoreResult {

	static alloc(): NSBatchDeleteResult; // inherited from NSObject

	static new(): NSBatchDeleteResult; // inherited from NSObject

	readonly result: any;

	readonly resultType: NSBatchDeleteRequestResultType;
}

declare class NSBatchUpdateRequest extends NSPersistentStoreRequest {

	static alloc(): NSBatchUpdateRequest; // inherited from NSObject

	static batchUpdateRequestWithEntityName(entityName: string): NSBatchUpdateRequest;

	static new(): NSBatchUpdateRequest; // inherited from NSObject

	readonly entity: NSEntityDescription;

	readonly entityName: string;

	includesSubentities: boolean;

	predicate: NSPredicate;

	propertiesToUpdate: NSDictionary<any, any>;

	resultType: NSBatchUpdateRequestResultType;

	constructor(o: { entity: NSEntityDescription; });

	constructor(o: { entityName: string; });

	initWithEntity(entity: NSEntityDescription): this;

	initWithEntityName(entityName: string): this;
}

declare const enum NSBatchUpdateRequestResultType {

	StatusOnlyResultType = 0,

	UpdatedObjectIDsResultType = 1,

	UpdatedObjectsCountResultType = 2
}

declare class NSBatchUpdateResult extends NSPersistentStoreResult {

	static alloc(): NSBatchUpdateResult; // inherited from NSObject

	static new(): NSBatchUpdateResult; // inherited from NSObject

	readonly result: any;

	readonly resultType: NSBatchUpdateRequestResultType;
}

declare var NSBinaryStoreType: string;

declare class NSConstraintConflict extends NSObject {

	static alloc(): NSConstraintConflict; // inherited from NSObject

	static new(): NSConstraintConflict; // inherited from NSObject

	readonly conflictingObjects: NSArray<NSManagedObject>;

	readonly conflictingSnapshots: NSArray<NSDictionary<any, any>>;

	readonly constraint: NSArray<string>;

	readonly constraintValues: NSDictionary<string, any>;

	readonly databaseObject: NSManagedObject;

	readonly databaseSnapshot: NSDictionary<string, any>;

	constructor(o: { constraint: NSArray<string>; databaseObject: NSManagedObject; databaseSnapshot: NSDictionary<any, any>; conflictingObjects: NSArray<NSManagedObject>; conflictingSnapshots: NSArray<any>; });

	initWithConstraintDatabaseObjectDatabaseSnapshotConflictingObjectsConflictingSnapshots(contraint: NSArray<string>, databaseObject: NSManagedObject, databaseSnapshot: NSDictionary<any, any>, conflictingObjects: NSArray<NSManagedObject>, conflictingSnapshots: NSArray<any>): this;
}

declare const NSCoreDataError: number;

declare var NSCoreDataVersionNumber: number;

declare const enum NSDeleteRule {

	NoActionDeleteRule = 0,

	NullifyDeleteRule = 1,

	CascadeDeleteRule = 2,

	DenyDeleteRule = 3
}

declare var NSDeletedObjectsKey: string;

declare var NSDetailedErrorsKey: string;

declare class NSEntityDescription extends NSObject implements NSCoding, NSCopying, NSFastEnumeration {

	static alloc(): NSEntityDescription; // inherited from NSObject

	static entityForNameInManagedObjectContext(entityName: string, context: NSManagedObjectContext): NSEntityDescription;

	static insertNewObjectForEntityForNameInManagedObjectContext(entityName: string, context: NSManagedObjectContext): NSManagedObject;

	static new(): NSEntityDescription; // inherited from NSObject

	abstract: boolean;

	readonly attributesByName: NSDictionary<string, NSAttributeDescription>;

	compoundIndexes: NSArray<NSArray<any>>;

	managedObjectClassName: string;

	readonly managedObjectModel: NSManagedObjectModel;

	name: string;

	properties: NSArray<NSPropertyDescription>;

	readonly propertiesByName: NSDictionary<string, NSPropertyDescription>;

	readonly relationshipsByName: NSDictionary<string, NSRelationshipDescription>;

	renamingIdentifier: string;

	subentities: NSArray<NSEntityDescription>;

	readonly subentitiesByName: NSDictionary<string, NSEntityDescription>;

	readonly superentity: NSEntityDescription;

	uniquenessConstraints: NSArray<NSArray<any>>;

	userInfo: NSDictionary<any, any>;

	readonly versionHash: NSData;

	versionHashModifier: string;
	[Symbol.iterator](): Iterator<any>;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	isKindOfEntity(entity: NSEntityDescription): boolean;

	relationshipsWithDestinationEntity(entity: NSEntityDescription): NSArray<NSRelationshipDescription>;
}

declare class NSEntityMapping extends NSObject {

	static alloc(): NSEntityMapping; // inherited from NSObject

	static new(): NSEntityMapping; // inherited from NSObject

	attributeMappings: NSArray<NSPropertyMapping>;

	destinationEntityName: string;

	destinationEntityVersionHash: NSData;

	entityMigrationPolicyClassName: string;

	mappingType: NSEntityMappingType;

	name: string;

	relationshipMappings: NSArray<NSPropertyMapping>;

	sourceEntityName: string;

	sourceEntityVersionHash: NSData;

	sourceExpression: NSExpression;

	userInfo: NSDictionary<any, any>;
}

declare const enum NSEntityMappingType {

	UndefinedEntityMappingType = 0,

	CustomEntityMappingType = 1,

	AddEntityMappingType = 2,

	RemoveEntityMappingType = 3,

	CopyEntityMappingType = 4,

	TransformEntityMappingType = 5
}

declare class NSEntityMigrationPolicy extends NSObject {

	static alloc(): NSEntityMigrationPolicy; // inherited from NSObject

	static new(): NSEntityMigrationPolicy; // inherited from NSObject

	beginEntityMappingManagerError(mapping: NSEntityMapping, manager: NSMigrationManager): boolean;

	createDestinationInstancesForSourceInstanceEntityMappingManagerError(sInstance: NSManagedObject, mapping: NSEntityMapping, manager: NSMigrationManager): boolean;

	createRelationshipsForDestinationInstanceEntityMappingManagerError(dInstance: NSManagedObject, mapping: NSEntityMapping, manager: NSMigrationManager): boolean;

	endEntityMappingManagerError(mapping: NSEntityMapping, manager: NSMigrationManager): boolean;

	endInstanceCreationForEntityMappingManagerError(mapping: NSEntityMapping, manager: NSMigrationManager): boolean;

	endRelationshipCreationForEntityMappingManagerError(mapping: NSEntityMapping, manager: NSMigrationManager): boolean;

	performCustomValidationForEntityMappingManagerError(mapping: NSEntityMapping, manager: NSMigrationManager): boolean;
}

declare const NSEntityMigrationPolicyError: number;

declare var NSErrorMergePolicy: any;

declare var NSErrorMergePolicyVar: any;

declare class NSExpressionDescription extends NSPropertyDescription {

	static alloc(): NSExpressionDescription; // inherited from NSObject

	static new(): NSExpressionDescription; // inherited from NSObject

	expression: NSExpression;

	expressionResultType: NSAttributeType;
}

declare const NSExternalRecordImportError: number;

declare class NSFetchRequest<ResultType> extends NSPersistentStoreRequest implements NSCoding {

	static alloc<ResultType>(): NSFetchRequest<ResultType>; // inherited from NSObject

	static fetchRequestWithEntityName<ResultType>(entityName: string): NSFetchRequest<ResultType>;

	static new<ResultType>(): NSFetchRequest<ResultType>; // inherited from NSObject

	entity: NSEntityDescription;

	readonly entityName: string;

	fetchBatchSize: number;

	fetchLimit: number;

	fetchOffset: number;

	havingPredicate: NSPredicate;

	includesPendingChanges: boolean;

	includesPropertyValues: boolean;

	includesSubentities: boolean;

	predicate: NSPredicate;

	propertiesToFetch: NSArray<any>;

	propertiesToGroupBy: NSArray<any>;

	relationshipKeyPathsForPrefetching: NSArray<string>;

	resultType: NSFetchRequestResultType;

	returnsDistinctResults: boolean;

	returnsObjectsAsFaults: boolean;

	shouldRefreshRefetchedObjects: boolean;

	sortDescriptors: NSArray<NSSortDescriptor>;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { entityName: string; });

	encodeWithCoder(aCoder: NSCoder): void;

	execute(): NSArray<ResultType>;

	initWithCoder(aDecoder: NSCoder): this;

	initWithEntityName(entityName: string): this;
}

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

declare class NSFetchedPropertyDescription extends NSPropertyDescription {

	static alloc(): NSFetchedPropertyDescription; // inherited from NSObject

	static new(): NSFetchedPropertyDescription; // inherited from NSObject

	fetchRequest: NSFetchRequest<any>;
}

declare const enum NSFetchedResultsChangeType {

	Insert = 1,

	Delete = 2,

	Move = 3,

	Update = 4
}

declare class NSFetchedResultsController<ResultType> extends NSObject {

	static alloc<ResultType>(): NSFetchedResultsController<ResultType>; // inherited from NSObject

	static deleteCacheWithName(name: string): void;

	static new<ResultType>(): NSFetchedResultsController<ResultType>; // inherited from NSObject

	readonly cacheName: string;

	delegate: NSFetchedResultsControllerDelegate;

	readonly fetchRequest: NSFetchRequest<ResultType>;

	readonly fetchedObjects: NSArray<ResultType>;

	readonly managedObjectContext: NSManagedObjectContext;

	readonly sectionIndexTitles: NSArray<string>;

	readonly sectionNameKeyPath: string;

	readonly sections: NSArray<NSFetchedResultsSectionInfo>;

	constructor(o: { fetchRequest: NSFetchRequest<ResultType>; managedObjectContext: NSManagedObjectContext; sectionNameKeyPath: string; cacheName: string; });

	indexPathForObject(object: ResultType): NSIndexPath;

	initWithFetchRequestManagedObjectContextSectionNameKeyPathCacheName(fetchRequest: NSFetchRequest<ResultType>, context: NSManagedObjectContext, sectionNameKeyPath: string, name: string): this;

	objectAtIndexPath(indexPath: NSIndexPath): ResultType;

	performFetch(): boolean;

	sectionForSectionIndexTitleAtIndex(title: string, sectionIndex: number): number;

	sectionIndexTitleForSectionName(sectionName: string): string;
}

interface NSFetchedResultsControllerDelegate extends NSObjectProtocol {

	controllerDidChangeContent?(controller: NSFetchedResultsController<any>): void;

	controllerDidChangeObjectAtIndexPathForChangeTypeNewIndexPath?(controller: NSFetchedResultsController<any>, anObject: any, indexPath: NSIndexPath, type: NSFetchedResultsChangeType, newIndexPath: NSIndexPath): void;

	controllerDidChangeSectionAtIndexForChangeType?(controller: NSFetchedResultsController<any>, sectionInfo: NSFetchedResultsSectionInfo, sectionIndex: number, type: NSFetchedResultsChangeType): void;

	controllerSectionIndexTitleForSectionName?(controller: NSFetchedResultsController<any>, sectionName: string): string;

	controllerWillChangeContent?(controller: NSFetchedResultsController<any>): void;
}
declare var NSFetchedResultsControllerDelegate: {

	prototype: NSFetchedResultsControllerDelegate;
};

interface NSFetchedResultsSectionInfo {

	indexTitle: string;

	name: string;

	numberOfObjects: number;

	objects: NSArray<any>;
}
declare var NSFetchedResultsSectionInfo: {

	prototype: NSFetchedResultsSectionInfo;
};

declare var NSIgnorePersistentStoreVersioningOption: string;

declare var NSInMemoryStoreType: string;

declare class NSIncrementalStore extends NSPersistentStore {

	static alloc(): NSIncrementalStore; // inherited from NSObject

	static identifierForNewStoreAtURL(storeURL: NSURL): any;

	static new(): NSIncrementalStore; // inherited from NSObject

	executeRequestWithContextError(request: NSPersistentStoreRequest, context: NSManagedObjectContext): any;

	managedObjectContextDidRegisterObjectsWithIDs(objectIDs: NSArray<NSManagedObjectID>): void;

	managedObjectContextDidUnregisterObjectsWithIDs(objectIDs: NSArray<NSManagedObjectID>): void;

	newObjectIDForEntityReferenceObject(entity: NSEntityDescription, data: any): NSManagedObjectID;

	newValueForRelationshipForObjectWithIDWithContextError(relationship: NSRelationshipDescription, objectID: NSManagedObjectID, context: NSManagedObjectContext): any;

	newValuesForObjectWithIDWithContextError(objectID: NSManagedObjectID, context: NSManagedObjectContext): NSIncrementalStoreNode;

	obtainPermanentIDsForObjectsError(array: NSArray<NSManagedObject>): NSArray<NSManagedObjectID>;

	referenceObjectForObjectID(objectID: NSManagedObjectID): any;
}

declare class NSIncrementalStoreNode extends NSObject {

	static alloc(): NSIncrementalStoreNode; // inherited from NSObject

	static new(): NSIncrementalStoreNode; // inherited from NSObject

	readonly objectID: NSManagedObjectID;

	readonly version: number;

	constructor(o: { objectID: NSManagedObjectID; withValues: NSDictionary<string, any>; version: number; });

	initWithObjectIDWithValuesVersion(objectID: NSManagedObjectID, values: NSDictionary<string, any>, version: number): this;

	updateWithValuesVersion(values: NSDictionary<string, any>, version: number): void;

	valueForPropertyDescription(prop: NSPropertyDescription): any;
}

declare var NSInferMappingModelAutomaticallyOption: string;

declare const NSInferredMappingModelError: number;

declare var NSInsertedObjectsKey: string;

declare var NSInvalidatedAllObjectsKey: string;

declare var NSInvalidatedObjectsKey: string;

declare class NSManagedObject extends NSObject implements NSFetchRequestResult {

	static alloc(): NSManagedObject; // inherited from NSObject

	static entity(): NSEntityDescription;

	static fetchRequest(): NSFetchRequest<any>;

	static new(): NSManagedObject; // inherited from NSObject

	readonly deleted: boolean;

	readonly entity: NSEntityDescription;

	readonly fault: boolean;

	readonly faultingState: number;

	readonly hasChanges: boolean;

	readonly hasPersistentChangedValues: boolean;

	readonly inserted: boolean;

	readonly managedObjectContext: NSManagedObjectContext;

	readonly objectID: NSManagedObjectID;

	readonly updated: boolean;

	static readonly contextShouldIgnoreUnmodeledPropertyChanges: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { context: NSManagedObjectContext; });

	constructor(o: { entity: NSEntityDescription; insertIntoManagedObjectContext: NSManagedObjectContext; });

	awakeFromFetch(): void;

	awakeFromInsert(): void;

	awakeFromSnapshotEvents(flags: NSSnapshotEventType): void;

	changedValues(): NSDictionary<string, any>;

	changedValuesForCurrentEvent(): NSDictionary<string, any>;

	class(): typeof NSObject;

	committedValuesForKeys(keys: NSArray<string>): NSDictionary<string, any>;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	didAccessValueForKey(key: string): void;

	didSave(): void;

	didTurnIntoFault(): void;

	hasFaultForRelationshipNamed(key: string): boolean;

	initWithContext(moc: NSManagedObjectContext): this;

	initWithEntityInsertIntoManagedObjectContext(entity: NSEntityDescription, context: NSManagedObjectContext): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	objectIDsForRelationshipNamed(key: string): NSArray<NSManagedObjectID>;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	prepareForDeletion(): void;

	primitiveValueForKey(key: string): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	setPrimitiveValueForKey(value: any, key: string): void;

	validateForDelete(): boolean;

	validateForInsert(): boolean;

	validateForUpdate(): boolean;

	willAccessValueForKey(key: string): void;

	willSave(): void;

	willTurnIntoFault(): void;
}

declare const NSManagedObjectConstraintMergeError: number;

declare const NSManagedObjectConstraintValidationError: number;

declare class NSManagedObjectContext extends NSObject implements NSCoding, NSLocking {

	static alloc(): NSManagedObjectContext; // inherited from NSObject

	static mergeChangesFromRemoteContextSaveIntoContexts(changeNotificationData: NSDictionary<any, any>, contexts: NSArray<NSManagedObjectContext>): void;

	static new(): NSManagedObjectContext; // inherited from NSObject

	automaticallyMergesChangesFromParent: boolean;

	readonly concurrencyType: NSManagedObjectContextConcurrencyType;

	readonly deletedObjects: NSSet<NSManagedObject>;

	readonly hasChanges: boolean;

	readonly insertedObjects: NSSet<NSManagedObject>;

	mergePolicy: any;

	name: string;

	parentContext: NSManagedObjectContext;

	persistentStoreCoordinator: NSPersistentStoreCoordinator;

	propagatesDeletesAtEndOfEvent: boolean;

	readonly queryGenerationToken: NSQueryGenerationToken;

	readonly registeredObjects: NSSet<NSManagedObject>;

	retainsRegisteredObjects: boolean;

	shouldDeleteInaccessibleFaults: boolean;

	stalenessInterval: number;

	undoManager: NSUndoManager;

	readonly updatedObjects: NSSet<NSManagedObject>;

	readonly userInfo: NSMutableDictionary<any, any>;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { concurrencyType: NSManagedObjectContextConcurrencyType; });

	assignObjectToPersistentStore(object: any, store: NSPersistentStore): void;

	countForFetchRequestError(request: NSFetchRequest<any>): number;

	deleteObject(object: NSManagedObject): void;

	detectConflictsForObject(object: NSManagedObject): void;

	encodeWithCoder(aCoder: NSCoder): void;

	executeFetchRequestError(request: NSFetchRequest<any>): NSArray<any>;

	executeRequestError(request: NSPersistentStoreRequest): NSPersistentStoreResult;

	existingObjectWithIDError(objectID: NSManagedObjectID): NSManagedObject;

	initWithCoder(aDecoder: NSCoder): this;

	initWithConcurrencyType(ct: NSManagedObjectContextConcurrencyType): this;

	insertObject(object: NSManagedObject): void;

	lock(): void;

	mergeChangesFromContextDidSaveNotification(notification: NSNotification): void;

	objectRegisteredForID(objectID: NSManagedObjectID): NSManagedObject;

	objectWithID(objectID: NSManagedObjectID): NSManagedObject;

	obtainPermanentIDsForObjectsError(objects: NSArray<NSManagedObject>): boolean;

	performBlock(block: () => void): void;

	performBlockAndWait(block: () => void): void;

	processPendingChanges(): void;

	redo(): void;

	refreshAllObjects(): void;

	refreshObjectMergeChanges(object: NSManagedObject, flag: boolean): void;

	reset(): void;

	rollback(): void;

	save(): boolean;

	setQueryGenerationFromTokenError(generation: NSQueryGenerationToken): boolean;

	shouldHandleInaccessibleFaultForObjectIDTriggeredByProperty(fault: NSManagedObject, oid: NSManagedObjectID, property: NSPropertyDescription): boolean;

	tryLock(): boolean;

	undo(): void;

	unlock(): void;
}

declare const enum NSManagedObjectContextConcurrencyType {

	ConfinementConcurrencyType = 0,

	PrivateQueueConcurrencyType = 1,

	MainQueueConcurrencyType = 2
}

declare var NSManagedObjectContextDidSaveNotification: string;

declare const NSManagedObjectContextLockingError: number;

declare var NSManagedObjectContextObjectsDidChangeNotification: string;

declare var NSManagedObjectContextQueryGenerationKey: string;

declare var NSManagedObjectContextWillSaveNotification: string;

declare const NSManagedObjectExternalRelationshipError: number;

declare class NSManagedObjectID extends NSObject implements NSCopying, NSFetchRequestResult {

	static alloc(): NSManagedObjectID; // inherited from NSObject

	static new(): NSManagedObjectID; // inherited from NSObject

	readonly entity: NSEntityDescription;

	readonly persistentStore: NSPersistentStore;

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

declare const NSManagedObjectMergeError: number;

declare class NSManagedObjectModel extends NSObject implements NSCoding, NSCopying, NSFastEnumeration {

	static alloc(): NSManagedObjectModel; // inherited from NSObject

	static mergedModelFromBundles(bundles: NSArray<NSBundle>): NSManagedObjectModel;

	static mergedModelFromBundlesForStoreMetadata(bundles: NSArray<NSBundle>, metadata: NSDictionary<string, any>): NSManagedObjectModel;

	static modelByMergingModels(models: NSArray<NSManagedObjectModel>): NSManagedObjectModel;

	static modelByMergingModelsForStoreMetadata(models: NSArray<NSManagedObjectModel>, metadata: NSDictionary<string, any>): NSManagedObjectModel;

	static new(): NSManagedObjectModel; // inherited from NSObject

	readonly configurations: NSArray<string>;

	entities: NSArray<NSEntityDescription>;

	readonly entitiesByName: NSDictionary<string, NSEntityDescription>;

	readonly entityVersionHashesByName: NSDictionary<string, NSData>;

	readonly fetchRequestTemplatesByName: NSDictionary<string, NSFetchRequest<any>>;

	localizationDictionary: NSDictionary<string, string>;

	versionIdentifiers: NSSet<any>;
	[Symbol.iterator](): Iterator<any>;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { contentsOfURL: NSURL; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	entitiesForConfiguration(configuration: string): NSArray<NSEntityDescription>;

	fetchRequestFromTemplateWithNameSubstitutionVariables(name: string, variables: NSDictionary<string, any>): NSFetchRequest<any>;

	fetchRequestTemplateForName(name: string): NSFetchRequest<any>;

	initWithCoder(aDecoder: NSCoder): this;

	initWithContentsOfURL(url: NSURL): this;

	isConfigurationCompatibleWithStoreMetadata(configuration: string, metadata: NSDictionary<string, any>): boolean;

	setEntitiesForConfiguration(entities: NSArray<NSEntityDescription>, configuration: string): void;

	setFetchRequestTemplateForName(fetchRequestTemplate: NSFetchRequest<any>, name: string): void;
}

declare const NSManagedObjectReferentialIntegrityError: number;

declare const NSManagedObjectValidationError: number;

declare class NSMappingModel extends NSObject {

	static alloc(): NSMappingModel; // inherited from NSObject

	static inferredMappingModelForSourceModelDestinationModelError(sourceModel: NSManagedObjectModel, destinationModel: NSManagedObjectModel): NSMappingModel;

	static mappingModelFromBundlesForSourceModelDestinationModel(bundles: NSArray<NSBundle>, sourceModel: NSManagedObjectModel, destinationModel: NSManagedObjectModel): NSMappingModel;

	static new(): NSMappingModel; // inherited from NSObject

	entityMappings: NSArray<NSEntityMapping>;

	readonly entityMappingsByName: NSDictionary<string, NSEntityMapping>;

	constructor(o: { contentsOfURL: NSURL; });

	initWithContentsOfURL(url: NSURL): this;
}

declare var NSMergeByPropertyObjectTrumpMergePolicy: any;

declare var NSMergeByPropertyObjectTrumpMergePolicyVar: any;

declare var NSMergeByPropertyStoreTrumpMergePolicy: any;

declare var NSMergeByPropertyStoreTrumpMergePolicyVar: any;

declare class NSMergeConflict extends NSObject {

	static alloc(): NSMergeConflict; // inherited from NSObject

	static new(): NSMergeConflict; // inherited from NSObject

	readonly cachedSnapshot: NSDictionary<string, any>;

	readonly newVersionNumber: number;

	readonly objectSnapshot: NSDictionary<string, any>;

	readonly oldVersionNumber: number;

	readonly persistedSnapshot: NSDictionary<string, any>;

	readonly sourceObject: NSManagedObject;

	constructor(o: { source: NSManagedObject; newVersion: number; oldVersion: number; cachedSnapshot: NSDictionary<string, any>; persistedSnapshot: NSDictionary<string, any>; });

	initWithSourceNewVersionOldVersionCachedSnapshotPersistedSnapshot(srcObject: NSManagedObject, newvers: number, oldvers: number, cachesnap: NSDictionary<string, any>, persnap: NSDictionary<string, any>): this;
}

declare class NSMergePolicy extends NSObject {

	static alloc(): NSMergePolicy; // inherited from NSObject

	static new(): NSMergePolicy; // inherited from NSObject

	readonly mergeType: NSMergePolicyType;

	static readonly errorMergePolicy: NSMergePolicy;

	static readonly mergeByPropertyObjectTrumpMergePolicy: NSMergePolicy;

	static readonly mergeByPropertyStoreTrumpMergePolicy: NSMergePolicy;

	static readonly overwriteMergePolicy: NSMergePolicy;

	static readonly rollbackMergePolicy: NSMergePolicy;

	constructor(o: { mergeType: NSMergePolicyType; });

	initWithMergeType(ty: NSMergePolicyType): this;

	resolveConflictsError(list: NSArray<any>): boolean;

	resolveConstraintConflictsError(list: NSArray<NSConstraintConflict>): boolean;

	resolveOptimisticLockingVersionConflictsError(list: NSArray<NSMergeConflict>): boolean;
}

declare const enum NSMergePolicyType {

	ErrorMergePolicyType = 0,

	MergeByPropertyStoreTrumpMergePolicyType = 1,

	MergeByPropertyObjectTrumpMergePolicyType = 2,

	OverwriteMergePolicyType = 3,

	RollbackMergePolicyType = 4
}

declare var NSMigratePersistentStoresAutomaticallyOption: string;

declare const NSMigrationCancelledError: number;

declare const NSMigrationConstraintViolationError: number;

declare var NSMigrationDestinationObjectKey: string;

declare var NSMigrationEntityMappingKey: string;

declare var NSMigrationEntityPolicyKey: string;

declare const NSMigrationError: number;

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

	userInfo: NSDictionary<any, any>;

	usesStoreSpecificMigrationManager: boolean;

	constructor(o: { sourceModel: NSManagedObjectModel; destinationModel: NSManagedObjectModel; });

	associateSourceInstanceWithDestinationInstanceForEntityMapping(sourceInstance: NSManagedObject, destinationInstance: NSManagedObject, entityMapping: NSEntityMapping): void;

	cancelMigrationWithError(error: NSError): void;

	destinationEntityForEntityMapping(mEntity: NSEntityMapping): NSEntityDescription;

	destinationInstancesForEntityMappingNamedSourceInstances(mappingName: string, sourceInstances: NSArray<NSManagedObject>): NSArray<NSManagedObject>;

	initWithSourceModelDestinationModel(sourceModel: NSManagedObjectModel, destinationModel: NSManagedObjectModel): this;

	migrateStoreFromURLTypeOptionsWithMappingModelToDestinationURLDestinationTypeDestinationOptionsError(sourceURL: NSURL, sStoreType: string, sOptions: NSDictionary<any, any>, mappings: NSMappingModel, dURL: NSURL, dStoreType: string, dOptions: NSDictionary<any, any>): boolean;

	reset(): void;

	sourceEntityForEntityMapping(mEntity: NSEntityMapping): NSEntityDescription;

	sourceInstancesForEntityMappingNamedDestinationInstances(mappingName: string, destinationInstances: NSArray<NSManagedObject>): NSArray<NSManagedObject>;
}

declare const NSMigrationManagerDestinationStoreError: number;

declare var NSMigrationManagerKey: string;

declare const NSMigrationManagerSourceStoreError: number;

declare const NSMigrationMissingMappingModelError: number;

declare const NSMigrationMissingSourceModelError: number;

declare var NSMigrationPropertyMappingKey: string;

declare var NSMigrationSourceObjectKey: string;

declare var NSOverwriteMergePolicy: any;

declare var NSOverwriteMergePolicyVar: any;

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

	loadPersistentStoresWithCompletionHandler(block: (p1: NSPersistentStoreDescription, p2: NSError) => void): void;

	newBackgroundContext(): NSManagedObjectContext;

	performBackgroundTask(block: (p1: NSManagedObjectContext) => void): void;
}

declare class NSPersistentStore extends NSObject {

	static alloc(): NSPersistentStore; // inherited from NSObject

	static metadataForPersistentStoreWithURLError(url: NSURL): NSDictionary<string, any>;

	static migrationManagerClass(): typeof NSObject;

	static new(): NSPersistentStore; // inherited from NSObject

	static setMetadataForPersistentStoreWithURLError(metadata: NSDictionary<string, any>, url: NSURL): boolean;

	URL: NSURL;

	readonly configurationName: string;

	identifier: string;

	metadata: NSDictionary<string, any>;

	readonly options: NSDictionary<any, any>;

	readonly persistentStoreCoordinator: NSPersistentStoreCoordinator;

	readOnly: boolean;

	readonly type: string;

	constructor(o: { persistentStoreCoordinator: NSPersistentStoreCoordinator; configurationName: string; URL: NSURL; options: NSDictionary<any, any>; });

	didAddToPersistentStoreCoordinator(coordinator: NSPersistentStoreCoordinator): void;

	initWithPersistentStoreCoordinatorConfigurationNameURLOptions(root: NSPersistentStoreCoordinator, name: string, url: NSURL, options: NSDictionary<any, any>): this;

	loadMetadata(): boolean;

	willRemoveFromPersistentStoreCoordinator(coordinator: NSPersistentStoreCoordinator): void;
}

declare class NSPersistentStoreAsynchronousResult extends NSPersistentStoreResult {

	static alloc(): NSPersistentStoreAsynchronousResult; // inherited from NSObject

	static new(): NSPersistentStoreAsynchronousResult; // inherited from NSObject

	readonly managedObjectContext: NSManagedObjectContext;

	readonly operationError: NSError;

	readonly progress: NSProgress;

	cancel(): void;
}

declare var NSPersistentStoreConnectionPoolMaxSizeKey: string;

declare class NSPersistentStoreCoordinator extends NSObject implements NSLocking {

	static alloc(): NSPersistentStoreCoordinator; // inherited from NSObject

	static metadataForPersistentStoreOfTypeURLError(storeType: string, url: NSURL): NSDictionary<string, any>;

	static metadataForPersistentStoreOfTypeURLOptionsError(storeType: string, url: NSURL, options: NSDictionary<any, any>): NSDictionary<string, any>;

	static new(): NSPersistentStoreCoordinator; // inherited from NSObject

	static registerStoreClassForStoreType(storeClass: typeof NSObject, storeType: string): void;

	static removeUbiquitousContentAndPersistentStoreAtURLOptionsError(storeURL: NSURL, options: NSDictionary<any, any>): boolean;

	static setMetadataForPersistentStoreOfTypeURLError(metadata: NSDictionary<string, any>, storeType: string, url: NSURL): boolean;

	static setMetadataForPersistentStoreOfTypeURLOptionsError(metadata: NSDictionary<string, any>, storeType: string, url: NSURL, options: NSDictionary<any, any>): boolean;

	readonly managedObjectModel: NSManagedObjectModel;

	name: string;

	readonly persistentStores: NSArray<NSPersistentStore>;

	static readonly registeredStoreTypes: NSDictionary<string, NSValue>;

	constructor(o: { managedObjectModel: NSManagedObjectModel; });

	URLForPersistentStore(store: NSPersistentStore): NSURL;

	addPersistentStoreWithDescriptionCompletionHandler(storeDescription: NSPersistentStoreDescription, block: (p1: NSPersistentStoreDescription, p2: NSError) => void): void;

	addPersistentStoreWithTypeConfigurationURLOptionsError(storeType: string, configuration: string, storeURL: NSURL, options: NSDictionary<any, any>): NSPersistentStore;

	destroyPersistentStoreAtURLWithTypeOptionsError(url: NSURL, storeType: string, options: NSDictionary<any, any>): boolean;

	executeRequestWithContextError(request: NSPersistentStoreRequest, context: NSManagedObjectContext): any;

	initWithManagedObjectModel(model: NSManagedObjectModel): this;

	lock(): void;

	managedObjectIDForURIRepresentation(url: NSURL): NSManagedObjectID;

	metadataForPersistentStore(store: NSPersistentStore): NSDictionary<string, any>;

	migratePersistentStoreToURLOptionsWithTypeError(store: NSPersistentStore, URL: NSURL, options: NSDictionary<any, any>, storeType: string): NSPersistentStore;

	performBlock(block: () => void): void;

	performBlockAndWait(block: () => void): void;

	persistentStoreForURL(URL: NSURL): NSPersistentStore;

	removePersistentStoreError(store: NSPersistentStore): boolean;

	replacePersistentStoreAtURLDestinationOptionsWithPersistentStoreFromURLSourceOptionsStoreTypeError(destinationURL: NSURL, destinationOptions: NSDictionary<any, any>, sourceURL: NSURL, sourceOptions: NSDictionary<any, any>, storeType: string): boolean;

	setMetadataForPersistentStore(metadata: NSDictionary<string, any>, store: NSPersistentStore): void;

	setURLForPersistentStore(url: NSURL, store: NSPersistentStore): boolean;

	tryLock(): boolean;

	unlock(): void;
}

declare const NSPersistentStoreCoordinatorLockingError: number;

declare var NSPersistentStoreCoordinatorStoresDidChangeNotification: string;

declare var NSPersistentStoreCoordinatorStoresWillChangeNotification: string;

declare var NSPersistentStoreCoordinatorWillRemoveStoreNotification: string;

declare class NSPersistentStoreDescription extends NSObject implements NSCopying {

	static alloc(): NSPersistentStoreDescription; // inherited from NSObject

	static new(): NSPersistentStoreDescription; // inherited from NSObject

	static persistentStoreDescriptionWithURL(URL: NSURL): NSPersistentStoreDescription;

	URL: NSURL;

	configuration: string;

	readonly options: NSDictionary<string, NSObject>;

	readOnly: boolean;

	shouldAddStoreAsynchronously: boolean;

	shouldInferMappingModelAutomatically: boolean;

	shouldMigrateStoreAutomatically: boolean;

	readonly sqlitePragmas: NSDictionary<string, NSObject>;

	timeout: number;

	type: string;

	constructor(o: { URL: NSURL; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithURL(url: NSURL): this;

	setOptionForKey(option: NSObject, key: string): void;

	setValueForPragmaNamed(value: NSObject, name: string): void;
}

declare var NSPersistentStoreDidImportUbiquitousContentChangesNotification: string;

declare var NSPersistentStoreFileProtectionKey: string;

declare var NSPersistentStoreForceDestroyOption: string;

declare const NSPersistentStoreIncompatibleSchemaError: number;

declare const NSPersistentStoreIncompatibleVersionHashError: number;

declare const NSPersistentStoreIncompleteSaveError: number;

declare const NSPersistentStoreInvalidTypeError: number;

declare var NSPersistentStoreOSCompatibility: string;

declare const NSPersistentStoreOpenError: number;

declare const NSPersistentStoreOperationError: number;

declare var NSPersistentStoreRebuildFromUbiquitousContentOption: string;

declare var NSPersistentStoreRemoveUbiquitousMetadataOption: string;

declare class NSPersistentStoreRequest extends NSObject implements NSCopying {

	static alloc(): NSPersistentStoreRequest; // inherited from NSObject

	static new(): NSPersistentStoreRequest; // inherited from NSObject

	affectedStores: NSArray<NSPersistentStore>;

	readonly requestType: NSPersistentStoreRequestType;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare const enum NSPersistentStoreRequestType {

	FetchRequestType = 1,

	SaveRequestType = 2,

	BatchUpdateRequestType = 6,

	BatchDeleteRequestType = 7
}

declare class NSPersistentStoreResult extends NSObject {

	static alloc(): NSPersistentStoreResult; // inherited from NSObject

	static new(): NSPersistentStoreResult; // inherited from NSObject
}

declare const NSPersistentStoreSaveConflictsError: number;

declare var NSPersistentStoreSaveConflictsErrorKey: string;

declare const NSPersistentStoreSaveError: number;

declare const NSPersistentStoreTimeoutError: number;

declare var NSPersistentStoreTimeoutOption: string;

declare const NSPersistentStoreTypeMismatchError: number;

declare var NSPersistentStoreUbiquitousContainerIdentifierKey: string;

declare var NSPersistentStoreUbiquitousContentNameKey: string;

declare var NSPersistentStoreUbiquitousContentURLKey: string;

declare var NSPersistentStoreUbiquitousPeerTokenOption: string;

declare const enum NSPersistentStoreUbiquitousTransitionType {

	AccountAdded = 1,

	AccountRemoved = 2,

	ContentRemoved = 3,

	InitialImportCompleted = 4
}

declare var NSPersistentStoreUbiquitousTransitionTypeKey: string;

declare const NSPersistentStoreUnsupportedRequestTypeError: number;

declare class NSPropertyDescription extends NSObject implements NSCoding, NSCopying {

	static alloc(): NSPropertyDescription; // inherited from NSObject

	static new(): NSPropertyDescription; // inherited from NSObject

	readonly entity: NSEntityDescription;

	indexed: boolean;

	indexedBySpotlight: boolean;

	name: string;

	optional: boolean;

	renamingIdentifier: string;

	storedInExternalRecord: boolean;

	transient: boolean;

	userInfo: NSDictionary<any, any>;

	readonly validationPredicates: NSArray<NSPredicate>;

	readonly validationWarnings: NSArray<any>;

	readonly versionHash: NSData;

	versionHashModifier: string;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	setValidationPredicatesWithValidationWarnings(validationPredicates: NSArray<NSPredicate>, validationWarnings: NSArray<string>): void;
}

declare class NSPropertyMapping extends NSObject {

	static alloc(): NSPropertyMapping; // inherited from NSObject

	static new(): NSPropertyMapping; // inherited from NSObject

	name: string;

	userInfo: NSDictionary<any, any>;

	valueExpression: NSExpression;
}

declare class NSQueryGenerationToken extends NSObject implements NSCopying {

	static alloc(): NSQueryGenerationToken; // inherited from NSObject

	static new(): NSQueryGenerationToken; // inherited from NSObject

	static readonly currentQueryGenerationToken: NSQueryGenerationToken;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare var NSReadOnlyPersistentStoreOption: string;

declare var NSRefreshedObjectsKey: string;

declare class NSRelationshipDescription extends NSPropertyDescription {

	static alloc(): NSRelationshipDescription; // inherited from NSObject

	static new(): NSRelationshipDescription; // inherited from NSObject

	deleteRule: NSDeleteRule;

	destinationEntity: NSEntityDescription;

	inverseRelationship: NSRelationshipDescription;

	maxCount: number;

	minCount: number;

	ordered: boolean;

	readonly toMany: boolean;
}

declare var NSRemovedPersistentStoresKey: string;

declare var NSRollbackMergePolicy: any;

declare var NSRollbackMergePolicyVar: any;

declare var NSSQLiteAnalyzeOption: string;

declare const NSSQLiteError: number;

declare var NSSQLiteErrorDomain: string;

declare var NSSQLiteManualVacuumOption: string;

declare var NSSQLitePragmasOption: string;

declare var NSSQLiteStoreType: string;

declare class NSSaveChangesRequest extends NSPersistentStoreRequest {

	static alloc(): NSSaveChangesRequest; // inherited from NSObject

	static new(): NSSaveChangesRequest; // inherited from NSObject

	readonly deletedObjects: NSSet<NSManagedObject>;

	readonly insertedObjects: NSSet<NSManagedObject>;

	readonly lockedObjects: NSSet<NSManagedObject>;

	readonly updatedObjects: NSSet<NSManagedObject>;

	constructor(o: { insertedObjects: NSSet<NSManagedObject>; updatedObjects: NSSet<NSManagedObject>; deletedObjects: NSSet<NSManagedObject>; lockedObjects: NSSet<NSManagedObject>; });

	initWithInsertedObjectsUpdatedObjectsDeletedObjectsLockedObjects(insertedObjects: NSSet<NSManagedObject>, updatedObjects: NSSet<NSManagedObject>, deletedObjects: NSSet<NSManagedObject>, lockedObjects: NSSet<NSManagedObject>): this;
}

declare const enum NSSnapshotEventType {

	UndoInsertion = 2,

	UndoDeletion = 4,

	UndoUpdate = 8,

	Rollback = 16,

	Refresh = 32,

	MergePolicy = 64
}

declare var NSStoreModelVersionHashesKey: string;

declare var NSStoreModelVersionIdentifiersKey: string;

declare var NSStoreTypeKey: string;

declare var NSStoreUUIDKey: string;

declare var NSUUIDChangedPersistentStoresKey: string;

declare var NSUpdatedObjectsKey: string;

declare const NSValidationDateTooLateError: number;

declare const NSValidationDateTooSoonError: number;

declare const NSValidationInvalidDateError: number;

declare var NSValidationKeyErrorKey: string;

declare const NSValidationMissingMandatoryPropertyError: number;

declare const NSValidationMultipleErrorsError: number;

declare const NSValidationNumberTooLargeError: number;

declare const NSValidationNumberTooSmallError: number;

declare var NSValidationObjectErrorKey: string;

declare var NSValidationPredicateErrorKey: string;

declare const NSValidationRelationshipDeniedDeleteError: number;

declare const NSValidationRelationshipExceedsMaximumCountError: number;

declare const NSValidationRelationshipLacksMinimumCountError: number;

declare const NSValidationStringPatternMatchingError: number;

declare const NSValidationStringTooLongError: number;

declare const NSValidationStringTooShortError: number;

declare var NSValidationValueErrorKey: string;
