import * as observable from '@nativescript/core/data/observable';

declare function __stopCPUProfiler(name: string);

export function pageLoaded(args: observable.EventData) {
	__stopCPUProfiler('xml-performance-test-small');
}
