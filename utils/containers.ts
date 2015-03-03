import definition = require("utils/containers");

export class ArraySortHelper implements definition.ArraySortHelper {

    public static sort<T>(keys: Array<T>, index: number, length: number, compareFn: (a: T, b: T) => number) {

        if (length < 2) {
            return;
        }

        if (keys.length === length) {
            keys.sort(compareFn);
            return;
        }

        var sorted = keys.splice(index, length);
        sorted.sort(compareFn);

        var args: Array<Object> = [0, index];
        keys.splice.apply(keys, args.concat(sorted));
    }
}

export class StringComparer implements definition.IEqualityComparer<string> {
    public equals(x: string, y: string): boolean {
        return x === y;
    }

    public getHashCode(str: string): number {
        var res = 0, len = str.length;
        for (var i = 0; i < len; i++) {
            res = res * 31 + str.charCodeAt(i);
        }
        return res;
    }
}

interface Entry<TKey, TValue> {
    hashCode: number;
    next: Entry<TKey, TValue>;
    key: TKey;
    value: TValue;
}

export class Dictionary<TKey, TValue> implements definition.Dictionary<TKey, TValue> {

    private _comparer: definition.IEqualityComparer<TKey>;
    private _count: number = 0;
    private _entries: Array<Entry<TKey, TValue>>;
    private _version: number = 0;

    constructor(comparer: definition.IEqualityComparer<TKey>) {
        this._comparer = comparer;
        this._entries = new Array<Entry<TKey, TValue>>();
    }

    get count(): number {
        return this._count;
    }

    public forEach(callbackfn: (key: TKey, value: TValue) => void) {
        var currentVersion = this._version;
        for (var index in this._entries) {
            var entry = this._entries[index];
            callbackfn(entry.key, entry.value);
            if (currentVersion !== this._version) {
                throw new Error("Cannot modify Dictionary while enumerating.");
            }
        }
    }

    public clear(): void {
        if (this.count > 0) {
            this._entries = new Array<Entry<TKey, TValue>>();
            this._count = 0;
            this._version++;
        }
    }

    public remove(key: TKey): boolean {
        if (!key) {
            throw new Error("key cannot be null/undefined.");
        }

        var hash = this._comparer.getHashCode(key);
        var previousEntry: Entry<TKey, TValue> = null;
        for (var entry = this._entries[hash]; entry; entry = entry.next) {
            if (entry.hashCode === hash && this._comparer.equals(entry.key, key)) {
                if (previousEntry) {
                    previousEntry.next = entry.next;
                }
                else {
                    this._entries[hash] = entry.next;
                }
                return true;
            }

            this._count--;
            this._version++;

            previousEntry = entry;
        }

        return false;
    }

    public get(key: TKey): TValue {
        var entry = this.findEntry(key);
        if (entry) {
            return entry.value;
        }

        return undefined;
    }

    public has(key: TKey): boolean {
        return (this.findEntry(key) ? true : false);
    }

    public set(key: TKey, value: TValue): void {
        if (!key) {
            throw new Error("key cannot be null or undefined.");
        }

        var hash = this._comparer.getHashCode(key);
        var lastEntryForHash: Entry<TKey, TValue> = null;
        for (var entry = this._entries[hash]; entry; entry = entry.next) {
            lastEntryForHash = entry;
            if (entry.hashCode === hash && this._comparer.equals(entry.key, key)) {
                entry.value = value;
                this._version++;
                return;
            }
        }

        this._count++;

        var newEntry = <Entry<TKey, TValue>>{};
        newEntry.hashCode = hash;
        newEntry.key = key;
        newEntry.value = value;
        if (lastEntryForHash) {
            lastEntryForHash.next = newEntry;
        }
        else {
            this._entries[hash] = newEntry;
        }

        this._version++;
    }

    private findEntry(key: TKey): Entry<TKey, TValue> {
        if (!key) {
            throw new Error("key cannot be null or undefined.");
        }

        var hash = this._comparer.getHashCode(key);
        for (var entry = this._entries[hash]; entry; entry = entry.next) {
            if (entry.hashCode === hash && this._comparer.equals(entry.key, key)) {
                return entry;
            }
        }

        return null;
    }
}