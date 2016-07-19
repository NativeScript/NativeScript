
declare var NSAddedPersistentStoresKey: string;

declare var NSAffectedObjectsErrorKey: string;

declare var NSAffectedStoresErrorKey: string;

declare class NSAsynchronousFetchRequest extends NSPersistentStoreRequest {

	/* readonly */ completionBlock: (p1: NSAsynchronousFetchResult) => void;

	estimatedResultCount: number;

	/* readonly */ fetchRequest: NSFetchRequest;

	constructor(o: { fetchRequest: NSFetchRequest; completionBlock: (p1: NSAsynchronousFetchResult) => void; });
}

declare class NSAsynchronousFetchResult extends NSPersistentStoreAsynchronousResult {

	/* readonly */ fetchRequest: NSAsynchronousFetchRequest;

	/* readonly */ finalResult: NSArray<any>;
}

declare class NSAtomicStore extends NSPersistentStore {

	constructor(o: { persistentStoreCoordinator: NSPersistentStoreCoordinator; configurationName: string; URL: NSURL; options: NSDictionary<any, any>; }); // inherited from NSPersistentStore

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

	/* readonly */ objectID: NSManagedObjectID;

	propertyCache: NSMutableDictionary<string, any>;

	constructor(); // inherited from NSObject

	constructor(o: { objectID: NSManagedObjectID; });

	self(): NSAtomicStoreCacheNode; // inherited from NSObjectProtocol
}

declare class NSAttributeDescription extends NSPropertyDescription {

	allowsExternalBinaryDataStorage: boolean;

	attributeType: NSAttributeType;

	attributeValueClassName: string;

	defaultValue: any;

	valueTransformerName: string;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding
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

	/* readonly */ fetchRequest: NSFetchRequest;

	resultType: NSBatchDeleteRequestResultType;

	constructor(o: { fetchRequest: NSFetchRequest; });

	constructor(o: { objectIDs: NSArray<NSManagedObjectID>; });
}

declare const enum NSBatchDeleteRequestResultType {

	ResultTypeStatusOnly = 0,

	ResultTypeObjectIDs = 1,

	ResultTypeCount = 2
}

declare class NSBatchDeleteResult extends NSPersistentStoreResult {

	/* readonly */ result: any;

	/* readonly */ resultType: NSBatchDeleteRequestResultType;
}

declare class NSBatchUpdateRequest extends NSPersistentStoreRequest {

	static batchUpdateRequestWithEntityName(entityName: string): NSBatchUpdateRequest;

	/* readonly */ entity: NSEntityDescription;

	/* readonly */ entityName: string;

	includesSubentities: boolean;

	predicate: NSPredicate;

	propertiesToUpdate: NSDictionary<any, any>;

	resultType: NSBatchUpdateRequestResultType;

	constructor(o: { entity: NSEntityDescription; });

	constructor(o: { entityName: string; });
}

declare const enum NSBatchUpdateRequestResultType {

	StatusOnlyResultType = 0,

	UpdatedObjectIDsResultType = 1,

	UpdatedObjectsCountResultType = 2
}

declare class NSBatchUpdateResult extends NSPersistentStoreResult {

	/* readonly */ result: any;

	/* readonly */ resultType: NSBatchUpdateRequestResultType;
}

declare var NSBinaryStoreType: string;

declare class NSConstraintConflict extends NSObject {

	static alloc(): NSConstraintConflict; // inherited from NSObject

	static new(): NSConstraintConflict; // inherited from NSObject

	/* readonly */ conflictingObjects: NSArray<NSManagedObject>;

	/* readonly */ conflictingSnapshots: NSArray<NSDictionary<any, any>>;

	/* readonly */ constraint: NSArray<string>;

	/* readonly */ constraintValues: NSDictionary<string, any>;

	/* readonly */ databaseObject: NSManagedObject;

	/* readonly */ databaseSnapshot: NSDictionary<string, any>;

	constructor(); // inherited from NSObject

	constructor(o: { constraint: NSArray<string>; databaseObject: NSManagedObject; databaseSnapshot: NSDictionary<any, any>; conflictingObjects: NSArray<NSManagedObject>; conflictingSnapshots: NSArray<any>; });

	self(): NSConstraintConflict; // inherited from NSObjectProtocol
}

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

	/* readonly */ attributesByName: NSDictionary<string, NSAttributeDescription>;

	compoundIndexes: NSArray<NSArray<any>>;

	managedObjectClassName: string;

	/* readonly */ managedObjectModel: NSManagedObjectModel;

	name: string;

	properties: NSArray<NSPropertyDescription>;

	/* readonly */ propertiesByName: NSDictionary<string, NSPropertyDescription>;

	/* readonly */ relationshipsByName: NSDictionary<string, NSRelationshipDescription>;

	renamingIdentifier: string;

	subentities: NSArray<NSEntityDescription>;

	/* readonly */ subentitiesByName: NSDictionary<string, NSEntityDescription>;

	/* readonly */ superentity: NSEntityDescription;

	uniquenessConstraints: NSArray<NSArray<any>>;

	userInfo: NSDictionary<any, any>;

	/* readonly */ versionHash: NSData;

	versionHashModifier: string;
	[Symbol.iterator](): Iterator<any>;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	isKindOfEntity(entity: NSEntityDescription): boolean;

	relationshipsWithDestinationEntity(entity: NSEntityDescription): NSArray<NSRelationshipDescription>;

	self(): NSEntityDescription; // inherited from NSObjectProtocol
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

	constructor(); // inherited from NSObject

	self(): NSEntityMapping; // inherited from NSObjectProtocol
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

	constructor(); // inherited from NSObject

	beginEntityMappingManagerError(mapping: NSEntityMapping, manager: NSMigrationManager): boolean;

	createDestinationInstancesForSourceInstanceEntityMappingManagerError(sInstance: NSManagedObject, mapping: NSEntityMapping, manager: NSMigrationManager): boolean;

	createRelationshipsForDestinationInstanceEntityMappingManagerError(dInstance: NSManagedObject, mapping: NSEntityMapping, manager: NSMigrationManager): boolean;

	endEntityMappingManagerError(mapping: NSEntityMapping, manager: NSMigrationManager): boolean;

	endInstanceCreationForEntityMappingManagerError(mapping: NSEntityMapping, manager: NSMigrationManager): boolean;

	endRelationshipCreationForEntityMappingManagerError(mapping: NSEntityMapping, manager: NSMigrationManager): boolean;

	performCustomValidationForEntityMappingManagerError(mapping: NSEntityMapping, manager: NSMigrationManager): boolean;

	self(): NSEntityMigrationPolicy; // inherited from NSObjectProtocol
}

declare var NSErrorMergePolicy: any;

declare var NSErrorMergePolicyVar: any;

declare class NSExpressionDescription extends NSPropertyDescription {

	expression: NSExpression;

	expressionResultType: NSAttributeType;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding
}

declare class NSFetchRequest extends NSPersistentStoreRequest implements NSCoding {

	static fetchRequestWithEntityName(entityName: string): NSFetchRequest;

	entity: NSEntityDescription;

	/* readonly */ entityName: string;

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

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding
}

declare class NSFetchRequestExpression extends NSExpression {

	static expressionForFetchContextCountOnly(fetch: NSExpression, context: NSExpression, countFlag: boolean): NSExpression;

	/* readonly */ contextExpression: NSExpression;

	/* readonly */ countOnlyRequest: boolean;

	/* readonly */ requestExpression: NSExpression;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { expressionType: NSExpressionType; }); // inherited from NSExpression
}

declare var NSFetchRequestExpressionType: NSExpressionType;

declare const enum NSFetchRequestResultType {

	ManagedObjectResultType = 0,

	ManagedObjectIDResultType = 1,

	DictionaryResultType = 2,

	CountResultType = 4
}

declare class NSFetchedPropertyDescription extends NSPropertyDescription {

	fetchRequest: NSFetchRequest;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding
}

declare const enum NSFetchedResultsChangeType {

	Insert = 1,

	Delete = 2,

	Move = 3,

	Update = 4
}

declare class NSFetchedResultsController extends NSObject {

	static alloc(): NSFetchedResultsController; // inherited from NSObject

	static deleteCacheWithName(name: string): void;

	static new(): NSFetchedResultsController; // inherited from NSObject

	/* readonly */ cacheName: string;

	delegate: NSFetchedResultsControllerDelegate;

	/* readonly */ fetchRequest: NSFetchRequest;

	/* readonly */ fetchedObjects: NSArray<any>;

	/* readonly */ managedObjectContext: NSManagedObjectContext;

	/* readonly */ sectionIndexTitles: NSArray<string>;

	/* readonly */ sectionNameKeyPath: string;

	/* readonly */ sections: NSArray<NSFetchedResultsSectionInfo>;

	constructor(); // inherited from NSObject

	constructor(o: { fetchRequest: NSFetchRequest; managedObjectContext: NSManagedObjectContext; sectionNameKeyPath: string; cacheName: string; });

	indexPathForObject(object: any): NSIndexPath;

	objectAtIndexPath(indexPath: NSIndexPath): any;

	performFetch(): boolean;

	sectionForSectionIndexTitleAtIndex(title: string, sectionIndex: number): number;

	sectionIndexTitleForSectionName(sectionName: string): string;

	self(): NSFetchedResultsController; // inherited from NSObjectProtocol
}

interface NSFetchedResultsControllerDelegate extends NSObjectProtocol {

	controllerDidChangeContent?(controller: NSFetchedResultsController): void;

	controllerDidChangeObjectAtIndexPathForChangeTypeNewIndexPath?(controller: NSFetchedResultsController, anObject: any, indexPath: NSIndexPath, type: NSFetchedResultsChangeType, newIndexPath: NSIndexPath): void;

	controllerDidChangeSectionAtIndexForChangeType?(controller: NSFetchedResultsController, sectionInfo: NSFetchedResultsSectionInfo, sectionIndex: number, type: NSFetchedResultsChangeType): void;

	controllerSectionIndexTitleForSectionName?(controller: NSFetchedResultsController, sectionName: string): string;

	controllerWillChangeContent?(controller: NSFetchedResultsController): void;
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

	static identifierForNewStoreAtURL(storeURL: NSURL): any;

	constructor(o: { persistentStoreCoordinator: NSPersistentStoreCoordinator; configurationName: string; URL: NSURL; options: NSDictionary<any, any>; }); // inherited from NSPersistentStore

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

	/* readonly */ objectID: NSManagedObjectID;

	/* readonly */ version: number;

	constructor(); // inherited from NSObject

	constructor(o: { objectID: NSManagedObjectID; withValues: NSDictionary<string, any>; version: number; });

	self(): NSIncrementalStoreNode; // inherited from NSObjectProtocol

	updateWithValuesVersion(values: NSDictionary<string, any>, version: number): void;

	valueForPropertyDescription(prop: NSPropertyDescription): any;
}

declare var NSInferMappingModelAutomaticallyOption: string;

declare var NSInsertedObjectsKey: string;

declare var NSInvalidatedAllObjectsKey: string;

declare var NSInvalidatedObjectsKey: string;

declare class NSManagedObject extends NSObject {

	static alloc(): NSManagedObject; // inherited from NSObject

	static contextShouldIgnoreUnmodeledPropertyChanges(): boolean;

	static new(): NSManagedObject; // inherited from NSObject

	/* readonly */ deleted: boolean;

	/* readonly */ entity: NSEntityDescription;

	/* readonly */ fault: boolean;

	/* readonly */ faultingState: number;

	/* readonly */ hasChanges: boolean;

	/* readonly */ hasPersistentChangedValues: boolean;

	/* readonly */ inserted: boolean;

	/* readonly */ managedObjectContext: NSManagedObjectContext;

	/* readonly */ objectID: NSManagedObjectID;

	/* readonly */ updated: boolean;

	constructor(); // inherited from NSObject

	constructor(o: { entity: NSEntityDescription; insertIntoManagedObjectContext: NSManagedObjectContext; });

	awakeFromFetch(): void;

	awakeFromInsert(): void;

	awakeFromSnapshotEvents(flags: NSSnapshotEventType): void;

	changedValues(): NSDictionary<string, any>;

	changedValuesForCurrentEvent(): NSDictionary<string, any>;

	committedValuesForKeys(keys: NSArray<string>): NSDictionary<string, any>;

	didAccessValueForKey(key: string): void;

	didSave(): void;

	didTurnIntoFault(): void;

	hasFaultForRelationshipNamed(key: string): boolean;

	objectIDsForRelationshipNamed(key: string): NSArray<NSManagedObjectID>;

	prepareForDeletion(): void;

	primitiveValueForKey(key: string): any;

	self(): NSManagedObject; // inherited from NSObjectProtocol

	setPrimitiveValueForKey(value: any, key: string): void;

	validateForDelete(): boolean;

	validateForInsert(): boolean;

	validateForUpdate(): boolean;

	willAccessValueForKey(key: string): void;

	willSave(): void;

	willTurnIntoFault(): void;
}

declare class NSManagedObjectContext extends NSObject implements NSCoding, NSLocking {

	static alloc(): NSManagedObjectContext; // inherited from NSObject

	static mergeChangesFromRemoteContextSaveIntoContexts(changeNotificationData: NSDictionary<any, any>, contexts: NSArray<NSManagedObjectContext>): void;

	static new(): NSManagedObjectContext; // inherited from NSObject

	/* readonly */ concurrencyType: NSManagedObjectContextConcurrencyType;

	/* readonly */ deletedObjects: NSSet<NSManagedObject>;

	/* readonly */ hasChanges: boolean;

	/* readonly */ insertedObjects: NSSet<NSManagedObject>;

	mergePolicy: any;

	name: string;

	parentContext: NSManagedObjectContext;

	persistentStoreCoordinator: NSPersistentStoreCoordinator;

	propagatesDeletesAtEndOfEvent: boolean;

	/* readonly */ registeredObjects: NSSet<NSManagedObject>;

	retainsRegisteredObjects: boolean;

	shouldDeleteInaccessibleFaults: boolean;

	stalenessInterval: number;

	undoManager: NSUndoManager;

	/* readonly */ updatedObjects: NSSet<NSManagedObject>;

	/* readonly */ userInfo: NSMutableDictionary<any, any>;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { concurrencyType: NSManagedObjectContextConcurrencyType; });

	assignObjectToPersistentStore(object: any, store: NSPersistentStore): void;

	countForFetchRequestError(request: NSFetchRequest): number;

	deleteObject(object: NSManagedObject): void;

	detectConflictsForObject(object: NSManagedObject): void;

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	executeFetchRequestError(request: NSFetchRequest): NSArray<any>;

	executeRequestError(request: NSPersistentStoreRequest): NSPersistentStoreResult;

	existingObjectWithIDError(objectID: NSManagedObjectID): NSManagedObject;

	insertObject(object: NSManagedObject): void;

	lock(): void; // inherited from NSLocking

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

	self(): NSManagedObjectContext; // inherited from NSObjectProtocol

	shouldHandleInaccessibleFaultForObjectIDTriggeredByProperty(fault: NSManagedObject, oid: NSManagedObjectID, property: NSPropertyDescription): boolean;

	tryLock(): boolean;

	undo(): void;

	unlock(): void; // inherited from NSLocking
}

declare const enum NSManagedObjectContextConcurrencyType {

	ConfinementConcurrencyType = 0,

	PrivateQueueConcurrencyType = 1,

	MainQueueConcurrencyType = 2
}

declare var NSManagedObjectContextDidSaveNotification: string;

declare var NSManagedObjectContextObjectsDidChangeNotification: string;

declare var NSManagedObjectContextWillSaveNotification: string;

declare class NSManagedObjectID extends NSObject implements NSCopying {

	static alloc(): NSManagedObjectID; // inherited from NSObject

	static new(): NSManagedObjectID; // inherited from NSObject

	/* readonly */ entity: NSEntityDescription;

	/* readonly */ persistentStore: NSPersistentStore;

	/* readonly */ temporaryID: boolean;

	constructor(); // inherited from NSObject

	URIRepresentation(): NSURL;

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	self(): NSManagedObjectID; // inherited from NSObjectProtocol
}

declare class NSManagedObjectModel extends NSObject implements NSCoding, NSCopying, NSFastEnumeration {

	static alloc(): NSManagedObjectModel; // inherited from NSObject

	static mergedModelFromBundles(bundles: NSArray<NSBundle>): NSManagedObjectModel;

	static mergedModelFromBundlesForStoreMetadata(bundles: NSArray<NSBundle>, metadata: NSDictionary<string, any>): NSManagedObjectModel;

	static modelByMergingModels(models: NSArray<NSManagedObjectModel>): NSManagedObjectModel;

	static modelByMergingModelsForStoreMetadata(models: NSArray<NSManagedObjectModel>, metadata: NSDictionary<string, any>): NSManagedObjectModel;

	static new(): NSManagedObjectModel; // inherited from NSObject

	/* readonly */ configurations: NSArray<string>;

	entities: NSArray<NSEntityDescription>;

	/* readonly */ entitiesByName: NSDictionary<string, NSEntityDescription>;

	/* readonly */ entityVersionHashesByName: NSDictionary<string, NSData>;

	/* readonly */ fetchRequestTemplatesByName: NSDictionary<string, NSFetchRequest>;

	localizationDictionary: NSDictionary<string, string>;

	versionIdentifiers: NSSet<any>;
	[Symbol.iterator](): Iterator<any>;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { contentsOfURL: NSURL; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	entitiesForConfiguration(configuration: string): NSArray<NSEntityDescription>;

	fetchRequestFromTemplateWithNameSubstitutionVariables(name: string, variables: NSDictionary<string, any>): NSFetchRequest;

	fetchRequestTemplateForName(name: string): NSFetchRequest;

	isConfigurationCompatibleWithStoreMetadata(configuration: string, metadata: NSDictionary<string, any>): boolean;

	self(): NSManagedObjectModel; // inherited from NSObjectProtocol

	setEntitiesForConfiguration(entities: NSArray<NSEntityDescription>, configuration: string): void;

	setFetchRequestTemplateForName(fetchRequestTemplate: NSFetchRequest, name: string): void;
}

declare class NSMappingModel extends NSObject {

	static alloc(): NSMappingModel; // inherited from NSObject

	static inferredMappingModelForSourceModelDestinationModelError(sourceModel: NSManagedObjectModel, destinationModel: NSManagedObjectModel): NSMappingModel;

	static mappingModelFromBundlesForSourceModelDestinationModel(bundles: NSArray<NSBundle>, sourceModel: NSManagedObjectModel, destinationModel: NSManagedObjectModel): NSMappingModel;

	static new(): NSMappingModel; // inherited from NSObject

	entityMappings: NSArray<NSEntityMapping>;

	/* readonly */ entityMappingsByName: NSDictionary<string, NSEntityMapping>;

	constructor(); // inherited from NSObject

	constructor(o: { contentsOfURL: NSURL; });

	self(): NSMappingModel; // inherited from NSObjectProtocol
}

declare var NSMergeByPropertyObjectTrumpMergePolicy: any;

declare var NSMergeByPropertyObjectTrumpMergePolicyVar: any;

declare var NSMergeByPropertyStoreTrumpMergePolicy: any;

declare var NSMergeByPropertyStoreTrumpMergePolicyVar: any;

declare class NSMergeConflict extends NSObject {

	static alloc(): NSMergeConflict; // inherited from NSObject

	static new(): NSMergeConflict; // inherited from NSObject

	/* readonly */ cachedSnapshot: NSDictionary<string, any>;

	/* readonly */ newVersionNumber: number;

	/* readonly */ objectSnapshot: NSDictionary<string, any>;

	/* readonly */ oldVersionNumber: number;

	/* readonly */ persistedSnapshot: NSDictionary<string, any>;

	/* readonly */ sourceObject: NSManagedObject;

	constructor(); // inherited from NSObject

	constructor(o: { source: NSManagedObject; newVersion: number; oldVersion: number; cachedSnapshot: NSDictionary<string, any>; persistedSnapshot: NSDictionary<string, any>; });

	self(): NSMergeConflict; // inherited from NSObjectProtocol
}

declare class NSMergePolicy extends NSObject {

	static alloc(): NSMergePolicy; // inherited from NSObject

	static new(): NSMergePolicy; // inherited from NSObject

	/* readonly */ mergeType: NSMergePolicyType;

	constructor(); // inherited from NSObject

	constructor(o: { mergeType: NSMergePolicyType; });

	resolveConflictsError(list: NSArray<any>): boolean;

	resolveConstraintConflictsError(list: NSArray<NSConstraintConflict>): boolean;

	resolveOptimisticLockingVersionConflictsError(list: NSArray<NSMergeConflict>): boolean;

	self(): NSMergePolicy; // inherited from NSObjectProtocol
}

declare const enum NSMergePolicyType {

	ErrorMergePolicyType = 0,

	MergeByPropertyStoreTrumpMergePolicyType = 1,

	MergeByPropertyObjectTrumpMergePolicyType = 2,

	OverwriteMergePolicyType = 3,

	RollbackMergePolicyType = 4
}

declare var NSMigratePersistentStoresAutomaticallyOption: string;

declare var NSMigrationDestinationObjectKey: string;

declare var NSMigrationEntityMappingKey: string;

declare var NSMigrationEntityPolicyKey: string;

declare class NSMigrationManager extends NSObject {

	static alloc(): NSMigrationManager; // inherited from NSObject

	static new(): NSMigrationManager; // inherited from NSObject

	/* readonly */ currentEntityMapping: NSEntityMapping;

	/* readonly */ destinationContext: NSManagedObjectContext;

	/* readonly */ destinationModel: NSManagedObjectModel;

	/* readonly */ mappingModel: NSMappingModel;

	/* readonly */ migrationProgress: number;

	/* readonly */ sourceContext: NSManagedObjectContext;

	/* readonly */ sourceModel: NSManagedObjectModel;

	userInfo: NSDictionary<any, any>;

	usesStoreSpecificMigrationManager: boolean;

	constructor(); // inherited from NSObject

	constructor(o: { sourceModel: NSManagedObjectModel; destinationModel: NSManagedObjectModel; });

	associateSourceInstanceWithDestinationInstanceForEntityMapping(sourceInstance: NSManagedObject, destinationInstance: NSManagedObject, entityMapping: NSEntityMapping): void;

	cancelMigrationWithError(error: NSError): void;

	destinationEntityForEntityMapping(mEntity: NSEntityMapping): NSEntityDescription;

	destinationInstancesForEntityMappingNamedSourceInstances(mappingName: string, sourceInstances: NSArray<NSManagedObject>): NSArray<NSManagedObject>;

	migrateStoreFromURLTypeOptionsWithMappingModelToDestinationURLDestinationTypeDestinationOptionsError(sourceURL: NSURL, sStoreType: string, sOptions: NSDictionary<any, any>, mappings: NSMappingModel, dURL: NSURL, dStoreType: string, dOptions: NSDictionary<any, any>): boolean;

	reset(): void;

	self(): NSMigrationManager; // inherited from NSObjectProtocol

	sourceEntityForEntityMapping(mEntity: NSEntityMapping): NSEntityDescription;

	sourceInstancesForEntityMappingNamedDestinationInstances(mappingName: string, destinationInstances: NSArray<NSManagedObject>): NSArray<NSManagedObject>;
}

declare var NSMigrationManagerKey: string;

declare var NSMigrationPropertyMappingKey: string;

declare var NSMigrationSourceObjectKey: string;

declare var NSOverwriteMergePolicy: any;

declare var NSOverwriteMergePolicyVar: any;

declare class NSPersistentStore extends NSObject {

	static alloc(): NSPersistentStore; // inherited from NSObject

	static metadataForPersistentStoreWithURLError(url: NSURL): NSDictionary<string, any>;

	static migrationManagerClass(): typeof NSObject;

	static new(): NSPersistentStore; // inherited from NSObject

	static setMetadataForPersistentStoreWithURLError(metadata: NSDictionary<string, any>, url: NSURL): boolean;

	URL: NSURL;

	/* readonly */ configurationName: string;

	identifier: string;

	metadata: NSDictionary<string, any>;

	/* readonly */ options: NSDictionary<any, any>;

	/* readonly */ persistentStoreCoordinator: NSPersistentStoreCoordinator;

	readOnly: boolean;

	/* readonly */ type: string;

	constructor(); // inherited from NSObject

	constructor(o: { persistentStoreCoordinator: NSPersistentStoreCoordinator; configurationName: string; URL: NSURL; options: NSDictionary<any, any>; });

	didAddToPersistentStoreCoordinator(coordinator: NSPersistentStoreCoordinator): void;

	loadMetadata(): boolean;

	self(): NSPersistentStore; // inherited from NSObjectProtocol

	willRemoveFromPersistentStoreCoordinator(coordinator: NSPersistentStoreCoordinator): void;
}

declare class NSPersistentStoreAsynchronousResult extends NSPersistentStoreResult {

	/* readonly */ managedObjectContext: NSManagedObjectContext;

	/* readonly */ operationError: NSError;

	/* readonly */ progress: NSProgress;

	cancel(): void;
}

declare class NSPersistentStoreCoordinator extends NSObject implements NSLocking {

	static alloc(): NSPersistentStoreCoordinator; // inherited from NSObject

	static metadataForPersistentStoreOfTypeURLError(storeType: string, url: NSURL): NSDictionary<string, any>;

	static metadataForPersistentStoreOfTypeURLOptionsError(storeType: string, url: NSURL, options: NSDictionary<any, any>): NSDictionary<string, any>;

	static new(): NSPersistentStoreCoordinator; // inherited from NSObject

	static registerStoreClassForStoreType(storeClass: typeof NSObject, storeType: string): void;

	static registeredStoreTypes(): NSDictionary<string, NSValue>;

	static removeUbiquitousContentAndPersistentStoreAtURLOptionsError(storeURL: NSURL, options: NSDictionary<any, any>): boolean;

	static setMetadataForPersistentStoreOfTypeURLError(metadata: NSDictionary<string, any>, storeType: string, url: NSURL): boolean;

	static setMetadataForPersistentStoreOfTypeURLOptionsError(metadata: NSDictionary<string, any>, storeType: string, url: NSURL, options: NSDictionary<any, any>): boolean;

	/* readonly */ managedObjectModel: NSManagedObjectModel;

	name: string;

	/* readonly */ persistentStores: NSArray<NSPersistentStore>;

	constructor(); // inherited from NSObject

	constructor(o: { managedObjectModel: NSManagedObjectModel; });

	URLForPersistentStore(store: NSPersistentStore): NSURL;

	addPersistentStoreWithTypeConfigurationURLOptionsError(storeType: string, configuration: string, storeURL: NSURL, options: NSDictionary<any, any>): NSPersistentStore;

	destroyPersistentStoreAtURLWithTypeOptionsError(url: NSURL, storeType: string, options: NSDictionary<any, any>): boolean;

	executeRequestWithContextError(request: NSPersistentStoreRequest, context: NSManagedObjectContext): any;

	lock(): void; // inherited from NSLocking

	managedObjectIDForURIRepresentation(url: NSURL): NSManagedObjectID;

	metadataForPersistentStore(store: NSPersistentStore): NSDictionary<string, any>;

	migratePersistentStoreToURLOptionsWithTypeError(store: NSPersistentStore, URL: NSURL, options: NSDictionary<any, any>, storeType: string): NSPersistentStore;

	performBlock(block: () => void): void;

	performBlockAndWait(block: () => void): void;

	persistentStoreForURL(URL: NSURL): NSPersistentStore;

	removePersistentStoreError(store: NSPersistentStore): boolean;

	replacePersistentStoreAtURLDestinationOptionsWithPersistentStoreFromURLSourceOptionsStoreTypeError(destinationURL: NSURL, destinationOptions: NSDictionary<any, any>, sourceURL: NSURL, sourceOptions: NSDictionary<any, any>, storeType: string): boolean;

	self(): NSPersistentStoreCoordinator; // inherited from NSObjectProtocol

	setMetadataForPersistentStore(metadata: NSDictionary<string, any>, store: NSPersistentStore): void;

	setURLForPersistentStore(url: NSURL, store: NSPersistentStore): boolean;

	tryLock(): boolean;

	unlock(): void; // inherited from NSLocking
}

declare var NSPersistentStoreCoordinatorStoresDidChangeNotification: string;

declare var NSPersistentStoreCoordinatorStoresWillChangeNotification: string;

declare var NSPersistentStoreCoordinatorWillRemoveStoreNotification: string;

declare var NSPersistentStoreDidImportUbiquitousContentChangesNotification: string;

declare var NSPersistentStoreFileProtectionKey: string;

declare var NSPersistentStoreForceDestroyOption: string;

declare var NSPersistentStoreOSCompatibility: string;

declare var NSPersistentStoreRebuildFromUbiquitousContentOption: string;

declare var NSPersistentStoreRemoveUbiquitousMetadataOption: string;

declare class NSPersistentStoreRequest extends NSObject implements NSCopying {

	static alloc(): NSPersistentStoreRequest; // inherited from NSObject

	static new(): NSPersistentStoreRequest; // inherited from NSObject

	affectedStores: NSArray<NSPersistentStore>;

	/* readonly */ requestType: NSPersistentStoreRequestType;

	constructor(); // inherited from NSObject

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	self(): NSPersistentStoreRequest; // inherited from NSObjectProtocol
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

	constructor(); // inherited from NSObject

	self(): NSPersistentStoreResult; // inherited from NSObjectProtocol
}

declare var NSPersistentStoreSaveConflictsErrorKey: string;

declare var NSPersistentStoreTimeoutOption: string;

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

declare class NSPropertyDescription extends NSObject implements NSCoding, NSCopying {

	static alloc(): NSPropertyDescription; // inherited from NSObject

	static new(): NSPropertyDescription; // inherited from NSObject

	/* readonly */ entity: NSEntityDescription;

	indexed: boolean;

	indexedBySpotlight: boolean;

	name: string;

	optional: boolean;

	renamingIdentifier: string;

	storedInExternalRecord: boolean;

	transient: boolean;

	userInfo: NSDictionary<any, any>;

	/* readonly */ validationPredicates: NSArray<NSPredicate>;

	/* readonly */ validationWarnings: NSArray<any>;

	/* readonly */ versionHash: NSData;

	versionHashModifier: string;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): NSPropertyDescription; // inherited from NSObjectProtocol

	setValidationPredicatesWithValidationWarnings(validationPredicates: NSArray<NSPredicate>, validationWarnings: NSArray<string>): void;
}

declare class NSPropertyMapping extends NSObject {

	static alloc(): NSPropertyMapping; // inherited from NSObject

	static new(): NSPropertyMapping; // inherited from NSObject

	name: string;

	userInfo: NSDictionary<any, any>;

	valueExpression: NSExpression;

	constructor(); // inherited from NSObject

	self(): NSPropertyMapping; // inherited from NSObjectProtocol
}

declare var NSReadOnlyPersistentStoreOption: string;

declare var NSRefreshedObjectsKey: string;

declare class NSRelationshipDescription extends NSPropertyDescription {

	deleteRule: NSDeleteRule;

	destinationEntity: NSEntityDescription;

	inverseRelationship: NSRelationshipDescription;

	maxCount: number;

	minCount: number;

	ordered: boolean;

	/* readonly */ toMany: boolean;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding
}

declare var NSRemovedPersistentStoresKey: string;

declare var NSRollbackMergePolicy: any;

declare var NSRollbackMergePolicyVar: any;

declare var NSSQLiteAnalyzeOption: string;

declare var NSSQLiteErrorDomain: string;

declare var NSSQLiteManualVacuumOption: string;

declare var NSSQLitePragmasOption: string;

declare var NSSQLiteStoreType: string;

declare class NSSaveChangesRequest extends NSPersistentStoreRequest {

	/* readonly */ deletedObjects: NSSet<NSManagedObject>;

	/* readonly */ insertedObjects: NSSet<NSManagedObject>;

	/* readonly */ lockedObjects: NSSet<NSManagedObject>;

	/* readonly */ updatedObjects: NSSet<NSManagedObject>;

	constructor(o: { insertedObjects: NSSet<NSManagedObject>; updatedObjects: NSSet<NSManagedObject>; deletedObjects: NSSet<NSManagedObject>; lockedObjects: NSSet<NSManagedObject>; });
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

declare var NSValidationKeyErrorKey: string;

declare var NSValidationObjectErrorKey: string;

declare var NSValidationPredicateErrorKey: string;

declare var NSValidationValueErrorKey: string;

interface __attributeDescriptionFlags {
	_hasMaxValueInExtraIvars: number;
	_hasMinValueInExtraIvars: number;
	_storeBinaryDataExternally: number;
	_reservedAttributeDescription: number;
}
declare var __attributeDescriptionFlags: interop.StructType<__attributeDescriptionFlags>;

interface __entityDescriptionFlags {
	_isAbstract: number;
	_shouldValidateOnSave: number;
	_isImmutable: number;
	_isFlattened: number;
	_skipValidation: number;
	_hasPropertiesIndexedBySpotlight: number;
	_hasPropertiesStoredInTruthFile: number;
	_rangesAreInDataBlob: number;
	_hasAttributesWithExternalDataReferences: number;
	_hasNonstandardPrimitiveProperties: number;
	_hasUniqueProperties: number;
	_validationUniqueProperties: number;
	_reservedEntityDescription: number;
}
declare var __entityDescriptionFlags: interop.StructType<__entityDescriptionFlags>;

interface __entityMappingFlags {
	_isInUse: number;
	_reservedEntityMapping: number;
}
declare var __entityMappingFlags: interop.StructType<__entityMappingFlags>;

interface __managedObjectModelFlags {
	_isInUse: number;
	_isImmutable: number;
	_isOptimizedForEncoding: number;
	_hasEntityWithConstraints: number;
	_reservedEntityDescription: number;
}
declare var __managedObjectModelFlags: interop.StructType<__managedObjectModelFlags>;

interface __modelMappingFlags {
	_isInUse: number;
	_reservedModelMapping: number;
}
declare var __modelMappingFlags: interop.StructType<__modelMappingFlags>;

interface __propertyDescriptionFlags {
	_isReadOnly: number;
	_isTransient: number;
	_isOptional: number;
	_isIndexed: number;
	_skipValidation: number;
	_isIndexedBySpotlight: number;
	_isStoredInExternalRecord: number;
	_extraIvarsAreInDataBlob: number;
	_isOrdered: number;
	_reservedPropertyDescription: number;
}
declare var __propertyDescriptionFlags: interop.StructType<__propertyDescriptionFlags>;

interface __propertyMappingFlags {
	_isInUse: number;
	_reservedPropertyMapping: number;
}
declare var __propertyMappingFlags: interop.StructType<__propertyMappingFlags>;

interface _fetchExpressionFlags {
	isCountOnly: number;
	_RESERVED: number;
}
declare var _fetchExpressionFlags: interop.StructType<_fetchExpressionFlags>;

interface _fetchRequestFlags {
	distinctValuesOnly: number;
	includesSubentities: number;
	includesPropertyValues: number;
	resultType: number;
	returnsObjectsAsFaults: number;
	excludePendingChanges: number;
	isInUse: number;
	entityIsName: number;
	refreshesRefetched: number;
	propertiesValidated: number;
	disableCaching: number;
	_RESERVED: number;
}
declare var _fetchRequestFlags: interop.StructType<_fetchRequestFlags>;

interface _fetchResultsControllerFlags {
	_sendObjectChangeNotifications: number;
	_sendSectionChangeNotifications: number;
	_sendDidChangeContentNotifications: number;
	_sendWillChangeContentNotifications: number;
	_sendSectionIndexTitleForSectionName: number;
	_changedResultsSinceLastSave: number;
	_hasMutableFetchedResults: number;
	_hasBatchedArrayResults: number;
	_hasSections: number;
	_usesNonpersistedProperties: number;
	_includesSubentities: number;
	_reservedFlags: number;
}
declare var _fetchResultsControllerFlags: interop.StructType<_fetchResultsControllerFlags>;

interface _managedObjectContextFlags {
	_registeredForCallback: number;
	_propagatesDeletesAtEndOfEvent: number;
	_exhaustiveValidation: number;
	_processingChanges: number;
	_useCommittedSnapshot: number;
	_registeredUndoTransactionID: number;
	_retainsAllRegisteredObjects: number;
	_savingInProgress: number;
	_wasDisposed: number;
	_unprocessedChangesPending: number;
	_isDirty: number;
	_ignoreUndoCheckpoints: number;
	_propagatingDeletes: number;
	_isNSEditorEditing: number;
	_isMainThreadBlessed: number;
	_isImportContext: number;
	_preflightSaveInProgress: number;
	_disableDiscardEditing: number;
	_isParentStoreContext: number;
	_postSaveNotifications: number;
	_isMerging: number;
	_concurrencyType: number;
	_deleteInaccessible: number;
	_reservedFlags: number;
}
declare var _managedObjectContextFlags: interop.StructType<_managedObjectContextFlags>;

interface _migrationManagerFlags {
	_migrationWasCancelled: number;
	_usesStoreSpecificMigrationManager: number;
	_reservedMigrationManager: number;
}
declare var _migrationManagerFlags: interop.StructType<_migrationManagerFlags>;

interface _objectStoreFlags {
	isReadOnly: number;
	cleanOnRemove: number;
	isMDDirty: number;
	_RESERVED: number;
}
declare var _objectStoreFlags: interop.StructType<_objectStoreFlags>;

interface _persistentStoreCoordinatorFlags {
	_isRegistered: number;
	_reservedFlags: number;
}
declare var _persistentStoreCoordinatorFlags: interop.StructType<_persistentStoreCoordinatorFlags>;

interface _requestFlags {
	includesSubentities: number;
	resultType: number;
	entityIsName: number;
	_RESERVED: number;
}
declare var _requestFlags: interop.StructType<_requestFlags>;
