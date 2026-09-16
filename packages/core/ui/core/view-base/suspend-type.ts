/**
 * What is holding a node's native updates back: three latched reasons plus a count of the
 * incremental holds, all in one bitfield (`ViewBase._suspendNativeUpdatesCount`).
 */
export enum SuspendType {
	Incremental = 0,
	Loaded = 1 << 20,
	NativeView = 1 << 21,
	UISetup = 1 << 22,
	IncrementalCountMask = ~((1 << 20) + (1 << 21) + (1 << 22)),
}

export namespace SuspendType {
	export function toString(type: SuspendType): string {
		return (type ? 'suspended' : 'resumed') + '(' + 'Incremental: ' + (type & SuspendType.IncrementalCountMask) + ', ' + 'Loaded: ' + !(type & SuspendType.Loaded) + ', ' + 'NativeView: ' + !(type & SuspendType.NativeView) + ', ' + 'UISetup: ' + !(type & SuspendType.UISetup) + ')';
	}
}
