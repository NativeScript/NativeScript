// Note: these functions are provided by the NativeScript runtimes (@nativescript/ios and @nativescript/android).
declare function __registerDomainDispatcher(domain: string, dispatcher: any): void;
declare function __inspectorSendEvent(data: string): void;
declare function __inspectorTimestamp(): number;

type MaybePromise<T> = T | Promise<T>;
