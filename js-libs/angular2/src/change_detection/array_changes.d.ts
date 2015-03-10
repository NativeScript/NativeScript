export declare class ArrayChanges {
    _collection: any;
    _length: int;
    _linkedRecords: _DuplicateMap;
    _unlinkedRecords: _DuplicateMap;
    _previousItHead: CollectionChangeRecord;
    _itHead: CollectionChangeRecord;
    _itTail: CollectionChangeRecord;
    _additionsHead: CollectionChangeRecord;
    _additionsTail: CollectionChangeRecord;
    _movesHead: CollectionChangeRecord;
    _movesTail: CollectionChangeRecord;
    _removalsHead: CollectionChangeRecord;
    _removalsTail: CollectionChangeRecord;
    constructor();
    static supports(obj: any): boolean;
    supportsObj(obj: any): boolean;
    collection: any;
    length: int;
    forEachItem(fn: Function): void;
    forEachPreviousItem(fn: Function): void;
    forEachAddedItem(fn: Function): void;
    forEachMovedItem(fn: Function): void;
    forEachRemovedItem(fn: Function): void;
    check(collection: any): boolean;
    isDirty: boolean;
    /**
     * Reset the state of the change objects to show no changes. This means set previousKey to
     * currentKey, and clear all of the queues (additions, moves, removals).
     * Set the previousIndexes of moved and added items to their currentIndexes
     * Reset the list of additions, moves and removals
     */
    _reset(): void;
    /**
     * This is the core function which handles differences between collections.
     *
     * - [record] is the record which we saw at this position last time. If null then it is a new
     *   item.
     * - [item] is the current item in the collection
     * - [index] is the position of the item in the collection
     */
    _mismatch(record: CollectionChangeRecord, item: any, index: int): CollectionChangeRecord;
    /**
     * This check is only needed if an array contains duplicates. (Short circuit of nothing dirty)
     *
     * Use case: `[a, a]` => `[b, a, a]`
     *
     * If we did not have this check then the insertion of `b` would:
     *   1) evict first `a`
     *   2) insert `b` at `0` index.
     *   3) leave `a` at index `1` as is. <-- this is wrong!
     *   3) reinsert `a` at index 2. <-- this is wrong!
     *
     * The correct behavior is:
     *   1) evict first `a`
     *   2) insert `b` at `0` index.
     *   3) reinsert `a` at index 1.
     *   3) move `a` at from `1` to `2`.
     *
     *
     * Double check that we have not evicted a duplicate item. We need to check if the item type may
     * have already been removed:
     * The insertion of b will evict the first 'a'. If we don't reinsert it now it will be reinserted
     * at the end. Which will show up as the two 'a's switching position. This is incorrect, since a
     * better way to think of it is as insert of 'b' rather then switch 'a' with 'b' and then add 'a'
     * at the end.
     */
    _verifyReinsertion(record: CollectionChangeRecord, item: any, index: int): CollectionChangeRecord;
    /**
     * Get rid of any excess [CollectionChangeRecord]s from the previous collection
     *
     * - [record] The first excess [CollectionChangeRecord].
     */
    _truncate(record: CollectionChangeRecord): void;
    _reinsertAfter(record: CollectionChangeRecord, prevRecord: CollectionChangeRecord, index: int): CollectionChangeRecord;
    _moveAfter(record: CollectionChangeRecord, prevRecord: CollectionChangeRecord, index: int): CollectionChangeRecord;
    _addAfter(record: CollectionChangeRecord, prevRecord: CollectionChangeRecord, index: int): CollectionChangeRecord;
    _insertAfter(record: CollectionChangeRecord, prevRecord: CollectionChangeRecord, index: int): CollectionChangeRecord;
    _remove(record: CollectionChangeRecord): CollectionChangeRecord;
    _unlink(record: CollectionChangeRecord): CollectionChangeRecord;
    _addToMoves(record: CollectionChangeRecord, toIndex: int): CollectionChangeRecord;
    _addToRemovals(record: CollectionChangeRecord): CollectionChangeRecord;
    toString(): string;
}
export declare class CollectionChangeRecord {
    currentIndex: int;
    previousIndex: int;
    item: any;
    _nextPrevious: CollectionChangeRecord;
    _prev: CollectionChangeRecord;
    _next: CollectionChangeRecord;
    _prevDup: CollectionChangeRecord;
    _nextDup: CollectionChangeRecord;
    _prevRemoved: CollectionChangeRecord;
    _nextRemoved: CollectionChangeRecord;
    _nextAdded: CollectionChangeRecord;
    _nextMoved: CollectionChangeRecord;
    constructor(item: any);
    toString(): string;
}
export declare class _DuplicateMap {
    map: Map<any, any>;
    constructor();
    put(record: CollectionChangeRecord): void;
    /**
     * Retrieve the `value` using key. Because the CollectionChangeRecord value maybe one which we
     * have already iterated over, we use the afterIndex to pretend it is not there.
     *
     * Use case: `[a, b, c, a, a]` if we are at index `3` which is the second `a` then asking if we
     * have any more `a`s needs to return the last `a` not the first or second.
     */
    get(value: any, afterIndex?: any): CollectionChangeRecord;
    /**
     * Removes an [CollectionChangeRecord] from the list of duplicates.
     *
     * The list of duplicates also is removed from the map if it gets empty.
     */
    remove(record: CollectionChangeRecord): CollectionChangeRecord;
    isEmpty: boolean;
    clear(): void;
    toString(): string;
}
