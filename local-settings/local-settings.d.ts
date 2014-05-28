
declare module "local-settings" {
    /**
    * Checks whether such a key exists.
    * @param key The key to check for.
    */
    function hasKey(key: string): boolean;

    /**
    * Gets a value (if existing) for a key as a Boolean Object. A default value can be provided in case there is no existing value.
    * @param key The key to check for.
    * @param defaultValue An optional value to be returned in case there is no existing value.
    */
    function getBoolean(key: string, defaultValue?: boolean): boolean;

    /**
    * Gets a value (if existing) for a key as a String Object. A default value can be provided in case there is no existing value.
    * @param key The key to check for.
    * @param defaultValue An optional value to be returned in case there is no existing value.
    */
    function getString(key: string, defaultValue?: string): string;

    /**
    * Gets a value (if existing) for a key as a Number Object. A default value can be provided in case there is no existing value.
    * @param key The key to check for.
    * @param defaultValue An optional value to be returned in case there is no existing value.
    */
    function getNumber(key: string, defaultValue?: number): number;

    /**
    * Sets a Boolean Object for a key.
    * @param key The key.
    * @param value The value.
    */
    function setBoolean(key: string, value: boolean): void;

    /**
    * Sets a String Object for a key.
    * @param key The key.
    * @param value The value.
    */
    function setString(key: string, value: string): void;

    /**
    * Sets a Number Object for a key.
    * @param key The key.
    * @param value The value.
    */
    function setNumber(key: string, value: number): void;

    /**
    * Removes a value (if existing) for a key.
    * @param key The key to check for.
    */
    function remove(key: string): void;
}