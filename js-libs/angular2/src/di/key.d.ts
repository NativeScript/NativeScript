export declare class Key {
    token: any;
    id: int;
    metadata: any;
    constructor(token: any, id: int);
    static setMetadata(key: Key, metadata: any): Key;
    static get(token: any): Key;
    static numberOfKeys: int;
}
export declare class KeyRegistry {
    _allKeys: Map<any, any>;
    constructor();
    get(token: any): Key;
    numberOfKeys: int;
}
