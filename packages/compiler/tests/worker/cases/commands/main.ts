//> second worker: refused
//> worker said: started with 3 strings
//> sum 6
//> error: Uncaught Error: bad command
//> closed after 4 commands
//> other: pong from its own thread
const worker = new Worker(new URL('./engine.worker', import.meta.url));
const other = new Worker(new URL('./other.worker', import.meta.url));

worker.onmessage = (message) => {
  const data = message.data;
  if (data.type === 'started') {
    console.log(`worker said: ${data.text}`);
    worker.postMessage({ type: 'sum', values: new Float32Array([1, 2, 3]) }, []);
  } else if (data.type === 'sum') {
    console.log(`sum ${data.value}`);
    worker.postMessage({ type: 'bad' });
  } else if (data.type === 'stopping') {
    console.log(`closed after ${data.count} commands`);
    other.postMessage('ping');
  }
};
worker.onerror = (error) => {
  console.log(`error: ${error.message}`);
  worker.postMessage({ type: 'stop' });
  return true;
};
other.onmessage = (message) => {
  console.log(`other: ${message.data}`);
  other.terminate();
};

try {
  new Worker(new URL('./engine.worker', import.meta.url));
  console.log('second worker: started');
} catch (e) {
  console.log(`second worker: ${(e as Error).message.includes('already runs in a worker') ? 'refused' : (e as Error).message}`);
}
worker.postMessage({ type: 'start', values: [1, 2, 3] });
