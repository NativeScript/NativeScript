
export declare module tk {

    export class TKConsole implements i.IConsole {
        public time(reportName: string): void;
        public timeEnd(reportName: string): void;
        public assert(test: boolean, message: string, ...optionalParams: any[]): void;
        public info(message: any, ...optionalParams: any[]): void;
        public warn(message: any, ...optionalParams: any[]): void;
        public error(message: any, ...optionalParams: any[]): void;
        public log(message: any, ...optionalParams: any[]): void;
        public trace(): void;
        public dump(obj: any): void;
    }

    export class ConsoleHelper {
        static log(message: string): void;
        static info(message: string): void;
        static error(message: string): void;
        static warn(message: string): void;
        static timeMillis(): number;
    }
} 