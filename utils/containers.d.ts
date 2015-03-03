declare module "utils/containers" {
    /**
     * An interface used to compare two instances of a same class.
     */
    interface IEqualityComparer<T> {
        /**
         * Compares two instances of a same class.
         * @param x - First object to compare.
         * @param y - Second object to compare.
         * Returns true if objects are equal, otherwise false.
         */
        equals(x: T, y: T): boolean;

        /**
         * Generates an unique hash code for an object instance.
         */
        getHashCode(obj: T): number;
    }

    /**
     * Helper class used to sort arrays.
     */
    class ArraySortHelper {
        /**
         * Sorts an array using a comparer function to order elements.
         * @param keys - The array which will be sorted.
         * @param index - Starting index for sorting
         * @param length - How many items to sort.
         * @param compareFn - A function that compares two array members.
         */
        public static sort<T>(keys: Array<T>, index: number, length: number, compareFn: (a: T, b: T) => number);
    }

    /**
     * Represents a collection of keys and values.
     */
    class Dictionary<TKey, TValue> {
        /**
         * The size of the dictionary.
         */
        count: number;
        /**
         * Creates an instance of a Dictionary.
         */
        constructor(comparer: IEqualityComparer<TKey>);

        /**
         * Iterates through all items and executes a callback function.
         * @param callbackfn - A function that will be executed for each item.
         */
        public forEach(callbackfn: (key: TKey, value: TValue) => void);

        /**
         * Clears the entire Dictionary.
         */
        public clear(): void;

        /**
         * Removes the item associated with a given key.
         * @param key - A key to remove.
         */
        public remove(key: TKey): boolean;

        /**
         * Returns the item associated with a given key.
         * @param key - A lookup key.
         */
        public get(key: TKey): TValue;

        /**
         * Returns if an item associated with a given key exist in the Dictionary.
         * @param key - A lookup key.
         */
        public has(key: TKey): boolean;

        /**
         * Associates a value with a key.
         * @param key - A key for the value.
         * @param value - The real value.
         */
        public set(key: TKey, value: TValue): void;
    }

    /**
     * An implementation of IEqualityComparer that works with strings.
     */
    class StringComparer implements IEqualityComparer<string> {
        /**
         * Compares two strings.
         * @param x - First string to compare.
         * @param y - Second string to compare.
         * Returns true if strings are equal, otherwise false.
         */
        equals(x: string, y: string): boolean;

        /**
         * Generates an unique hash code for a string.
         */
        getHashCode(str: string): number;
    }
}