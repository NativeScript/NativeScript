export declare class Log {
    _result: List<any>;
    constructor();
    add(value: any): void;
    fn(value: any): () => void;
    result(): any;
}
export declare function queryView(view: any, selector: any): Node;
export declare function dispatchEvent(element: any, eventType: any): void;
export declare function el(html: any): HTMLElement;
