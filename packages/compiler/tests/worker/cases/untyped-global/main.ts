//> total 10 from 4 values
//> closing
//> worker closed itself
const worker = new Worker(new URL('./sum.worker', import.meta.url));
worker.onmessage = (message) => {
  console.log(message.data);
  if (message.data.startsWith('total')) worker.postMessage({ values: [] });
  else console.log('worker closed itself');
};
worker.postMessage({ values: [1, 2, 3, 4] });
