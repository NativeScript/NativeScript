let worker: Worker | undefined;

export function pingSpikeWorker(n: number): Promise<unknown> {
	worker ??= new Worker(new URL('./spike.worker', import.meta.url));
	const current = worker;
	return new Promise((resolve, reject) => {
		current.onmessage = (event) => resolve(event.data);
		current.onerror = (event) => reject(event);
		current.postMessage(n);
	});
}
