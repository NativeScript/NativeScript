declare module "SpeedTests/tests" {
    export function compareNativeDates(count: number): string;
    export function compareJavaScriptDates(count: number): string;
    export function decodeAndEncodeBitmap(count: number, finishedCallback: (message) => void): string;
}

