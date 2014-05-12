export declare class UserPreferences {
    containsKey(key: string): boolean;
    getBoolean(key: string, defaultValue?: boolean): boolean;
    getDouble(key: string, defaultValue?: number): number;
    getInt(key: string, defaultValue?: number): number;
    getLong(key: string, defaultValue?: number): number;
    getString(key: string, defaultValue?: string): string;
    getStrings(key: string, defaultValue?: string[]): string[];
    setBoolean(key: string, value: boolean);
    setDouble(key: string, value: number);
    setInt(key: string, value: number);
    setLong(key: string, value: number);
    setString(key: string, value: string);
    setStrings(key: string, value: string[]);
}

/**
* report does such key exist
*/
export declare var hasKey: (key: string) => boolean;

// getters

/**
* gets value of the key as boolean, user can provide default value in case there is no value for the key
*/
export declare var getBoolean: (key: string, defaultValue?: boolean) => boolean;

/**
* gets value of the key as string, user can provide default value in case there is no value for the key
*/
export declare var getString: (key: string, defaultValue?: string) => string;

/**
* gets value of the key as string array, user can provide default value in case there is no value for the key
*/
export declare var getStringArray: (key: string, defaultValue?: string[]) => string[];

/**
* gets value of the key as number (double), user can provide default value in case there is no value for the key
*/
export declare var getNumber: (key: string, defaultValue?: number) => number;

/**
* gets value of the key as integer, user can provide default value in case there is no value for the key
*/
export declare var getInt: (key: string, defaultValue?: number) => number;

/**
* gets value of the key as long integer (not fully supported by JS), user can provide default value in case there is no value for the key
*/
export declare var getLong: (key: string, defaultValue?: number) => number;

// setters

/**
* sets value for a key as boolean
*/
export declare var setBoolean: (key: string, value: boolean) => void;

/**
* sets value for a key as string
*/
export declare var setString: (key: string, value: string) => void;

/**
* sets value for a key as string array
*/
export declare var setStringArray: (key: string, value: string[]) => void;

/**
* sets value for a key as JS number (double)
*/
export declare var setNumber: (key: string, value: number) => void;

/**
* sets value for a key as integer
*/
export declare var setInt: (key: string, value: number) => void;

/**
* sets value for a key as long integer
*/
export declare var setLong: (key: string, value: number) => void;
