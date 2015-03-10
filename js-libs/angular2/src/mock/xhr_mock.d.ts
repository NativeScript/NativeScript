import { XHR } from 'angular2/src/core/compiler/xhr/xhr';
export declare class XHRMock extends XHR {
    _expectations: List<_Expectation>;
    _definitions: Map<any, any>;
    _requests: List<Promise<any>>;
    constructor();
    get(url: string): Promise<string>;
    expect(url: string, response: string): void;
    when(url: string, response: string): void;
    flush(): void;
    verifyNoOustandingExpectations(): void;
    _processRequest(request: _PendingRequest): void;
}
export declare class _PendingRequest {
    url: string;
    completer: any;
    constructor(url: any);
    complete(response: string): void;
    getPromise(): Promise<string>;
}
export declare class _Expectation {
    url: string;
    response: string;
    constructor(url: string, response: string);
}
