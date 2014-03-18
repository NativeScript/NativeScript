
export module tk {
    export class ConsoleHelper {
        // FIXME: we should use Foundation.NSLog() but it currently does not work
        static log(message: string): void {
            log('log: ' + message);
        }

        static info(message: string): void {
            log('info: ' + message);
        }

        static error(message: string): void {
            log('error: ' + message);
        }

        static warn(message: string): void {
            log('warning: ' + message);
        }

        static timeMillis(): number {
            return QuartzCore.CACurrentMediaTime() * 1000;
        }
    }
}
 