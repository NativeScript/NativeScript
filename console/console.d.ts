/**
 * Allows printing messages to the device's console. 
 */
declare module "console" {
    /**
     * Encapsulates methods used to print some information in the console.
     * Instance of this class is declared in the global JavaScript context and is accessible by directly calling console.[xxx] methods.
     */
    class Console {
        /**
         * Begins counting a time span for a given name (key).
         * @param reportName The key for the operation.
         */
        public time(reportName: string): void;

        /**
         * Ends a previously started time span through the time method.
         * @param reportName The key for the operation. Must have an already started time(reportName) operation with the same key.
         */
        public timeEnd(reportName: string): void;

        /**
         * Asserts a boolean condition and prints a message in case the assert fails.
         * @param test A value that should not be Falsy.
         * @param message The message to be displayed in case the asserted value is Falsy.
         * @param formatParams Optional formatting parameters to be applied to the printed message.
         */
        public assert(test: boolean, message: string, ...formatParams: any[]): void;

        /**
         * Reports some information.
         * @param message The information message to be printed to the console.
         * @param formatParams Optional formatting parameters to be applied to the printed message.
         */
        public info(message: any, ...formatParams: any[]): void;

        /**
         * Reports a warning.
         * @param message The warning message to be printed to the console.
         * @param formatParams Optional formatting parameters to be applied to the printed message.
         */
        public warn(message: any, ...formatParams: any[]): void;

        /**
         * Reports an error.
         * @param message The error message to be printed to the console.
         * @param formatParams Optional formatting parameters to be applied to the printed message.
         */
        public error(message: any, ...formatParams: any[]): void;

        /**
         * Verbously logs a message.
         * @param message The message to be printed to the console.
         * @param formatParams Optional formatting parameters to be applied to the printed message.
         */
        public log(message: any, ...formatParams: any[]): void;

        /**
         * Prints the current stack trace in the console.
         */
        public trace(): void;

        /**
         * Prints the state of the specified object to the console.
         * @param obj The object instance to be dumped.
         */
        public dump(obj: any): void;

        /**
         * Prints the state of the specified object to the console.
         */
        public dir(obj: any): void;
    }
}