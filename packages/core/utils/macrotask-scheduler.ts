import { Trace } from '../trace';
import { dispatchToMainThread } from './mainthread-helper';

let scheduled = false;
let macroTaskQueue: Array<() => void> = [];

function drainMacrotaskQueue() {
	const currentQueue = macroTaskQueue;
	macroTaskQueue = [];
	scheduled = false;
	currentQueue.forEach((task) => {
		try {
			task();
		} catch (err) {
			const msg = err ? err.stack || err : err;
			Trace.write(`Error in macroTask: ${msg}`, Trace.categories.Error, Trace.messageType.error);
		}
	});
}

export function queueMacrotask(task: () => void): void {
	macroTaskQueue.push(task);
	if (!scheduled) {
		scheduled = true;
		dispatchToMainThread(drainMacrotaskQueue);
	}
}
