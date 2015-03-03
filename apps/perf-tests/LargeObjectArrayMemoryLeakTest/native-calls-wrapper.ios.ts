export function forceGarbageCollection(): void {
    __collect();
}

export function createNativeDate(): any {
    return NSDate.date();
} 