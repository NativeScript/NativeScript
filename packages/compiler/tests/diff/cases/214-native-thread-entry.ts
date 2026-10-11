// @swift
// Script that native threads enter (a URLSession delegate queue, an audio tap) runs as a job on the main thread.
let fired = 0;
let settled = 0;
let elsewhere = 0;
const native = typeof dispatch_async === 'function';
function work(): void {
  if (native && !NSThread.isMainThread) elsewhere++;
  for (let i = 0; i < 2000; i++) {
    setTimeout(() => fired++, 1);
    Promise.resolve(i).then(() => settled++);
  }
}
if (native) {
  const queue = dispatch_get_global_queue(21, 0);
  for (let t = 0; t < 4; t++) dispatch_async(queue, work);
  for (let t = 0; t < 4; t++) dispatch_async(queue, () => work());
} else {
  for (let t = 0; t < 8; t++) work();
}
setTimeout(() => console.log(`timers ${fired} of 16000, promise reactions ${settled} of 16000, every callback on the main thread: ${elsewhere === 0}`), 300);
