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