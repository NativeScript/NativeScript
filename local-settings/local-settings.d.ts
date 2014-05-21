
declare module "local-settings" {
    /**
    * report does such key exist
    */
    var hasKey: (key: string) => boolean;

    /**
    * gets value of the key as boolean, user can provide default value in case there is no value for the key
    */
    var getBoolean: (key: string, defaultValue?: boolean) => boolean;

    /**
    * gets value of the key as string, user can provide default value in case there is no value for the key
    */
    var getString: (key: string, defaultValue?: string) => string;

    /**
    * gets value of the key as string array, user can provide default value in case there is no value for the key
    */
    var getStringArray: (key: string, defaultValue?: string[]) => string[];

    /**
    * gets value of the key as number (double), user can provide default value in case there is no value for the key
    */
    var getNumber: (key: string, defaultValue?: number) => number;

    /**
    * gets value of the key as integer, user can provide default value in case there is no value for the key
    */
    var getInt: (key: string, defaultValue?: number) => number;

    /**
    * gets value of the key as long integer (not fully supported by JS), user can provide default value in case there is no value for the key
    */
    var getLong: (key: string, defaultValue?: number) => number;

    /**
    * sets value for a key as boolean
    */
    var setBoolean: (key: string, value: boolean) => void;

    /**
    * sets value for a key as string
    */
    var setString: (key: string, value: string) => void;

    /**
    * sets value for a key as string array
    */
    var setStringArray: (key: string, value: string[]) => void;

    /**
    * sets value for a key as JS number (double)
    */
    var setNumber: (key: string, value: number) => void;

    /**
    * sets value for a key as integer
    */
    var setInt: (key: string, value: number) => void;

    /**
    * sets value for a key as long integer
    */
    var setLong: (key: string, value: number) => void;

    /**
    * removes a value for key
    */
    var remove: (key: string) => void;
}