export function forceGarbageCollection(): void {
    gc();
} 

var javaDate = java.util.Date;

export function createNativeDate(): any {
    return new javaDate();
}