import { dispatchToMainThread } from './mainthread-helper';

let scheduled = false;
let macroTaskQueue: Array<() => void> = [];

function drainMacrotaskQueue() {
	const currentQueue = macroTaskQueue;
	macroTaskQueue = [];
	scheduled = false;
	// TODO: error handling?
	currentQueue.forEach((v) => v());
}

export function queueMacrotask(task: () => void): void {
	macroTaskQueue.push(task);
	if (!scheduled) {
		scheduled = true;
		dispatchToMainThread(drainMacrotaskQueue);
	}
}
