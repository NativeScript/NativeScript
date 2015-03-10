export declare class KeyValueChanges {
    _records: Map<any, any>;
    _mapHead: KVChangeRecord;
    _previousMapHead: KVChangeRecord;
    _changesHead: KVChangeRecord;
    _changesTail: KVChangeRecord;
    _additionsHead: KVChangeRecord;
    _additionsTail: KVChangeRecord;
    _removalsHead: KVChangeRecord;
    _removalsTail: KVChangeRecord;
    constructor();
    static supports(obj: any): boolean;
    supportsObj(obj: any): boolean;
    isDirty: boolean;
    forEachItem(fn: Function): void;
    forEachPreviousItem(fn: Function): void;
    forEachChangedItem(fn: Function): void;
    forEachAddedItem(fn: Function): void;
    forEachRemovedItem(fn: Function): void;
    check(map: any): boolean;
    _reset(): void;
    _truncate(lastRecord: KVChangeRecord, record: KVChangeRecord): void;
    _isInRemovals(record: KVChangeRecord): boolean;
    _addToRemovals(record: KVChangeRecord): void;
    _removeFromSeq(prev: KVChangeRecord, record: KVChangeRecord): void;
    _removeFromRemovals(record: KVChangeRecord): void;
    _addToAdditions(record: KVChangeRecord): void;
    _addToChanges(record: KVChangeRecord): void;
    toString(): string;
    _forEach(obj: any, fn: Function): void;
}
export declare class KVChangeRecord {
    key: any;
    _previousValue: any;
    _currentValue: any;
    _nextPrevious: KVChangeRecord;
    _next: KVChangeRecord;
    _nextAdded: KVChangeRecord;
    _nextRemoved: KVChangeRecord;
    _prevRemoved: KVChangeRecord;
    _nextChanged: KVChangeRecord;
    constructor(key: any);
    toString(): string;
}
