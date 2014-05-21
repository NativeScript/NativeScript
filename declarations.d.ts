// Global functions
declare function Log(data: any): void;
declare function log(data: any): void;
declare function float(num: number): any;
declare function long(num: number): any;
declare function fail(data: any): void;

// TODO: Declaration for the missing asynchronous API
declare function runAsync(operation: () => any, onComplete?: () => any); 

// those are interfaces for cases when user needs to have TS definitions for global variables
declare module i {
    interface IConsole {
        time(reportName: string): void;
        timeEnd(reportName: string): void;
        assert(test: boolean, message: string, ...optionalParams: any[]): void;
        info(message: any, ...optionalParams: any[]): void;
        warn(message: any, ...optionalParams: any[]): void;
        error(message: any, ...optionalParams: any[]): void;
        log(message: any, ...optionalParams: any[]): void;
        trace(): void;
        dump(obj: any): void;
        dir(obj: any): void;
    }
}

declare var console: i.IConsole;