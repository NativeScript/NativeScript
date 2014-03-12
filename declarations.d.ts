// Global functions
declare function Log(data: any): void;
declare function log(data: any): void;
declare function float(num: number): any;
declare function long(num: number): any;
declare function fail(data: any): void;

// TODO: Declaration for the missing asynchronous API
declare function runAsync(operation: () => any, onComplete?: () => any); 