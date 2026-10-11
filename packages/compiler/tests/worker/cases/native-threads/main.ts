//> timers 16000 of 16000, promise reactions 16000 of 16000, every callback on the script thread: true
//> a native thread awaited 42 from script, which ran on the script thread: true
//> a native thread's callback in a worker ran on the worker's thread: true
// Script that native threads enter (a NetworkCallback's thread, an executor's) runs on its realm's thread.
const scriptThread = java.lang.Thread.currentThread();
let fired = 0;
let settled = 0;
let elsewhere = 0;
const threads: java.lang.Thread[] = [];
for (let t = 0; t < 8; t++) {
  const thread = new java.lang.Thread(
    new java.lang.Runnable({
      run() {
        if (java.lang.Thread.currentThread() !== scriptThread) elsewhere++;
        for (let i = 0; i < 2000; i++) {
          setTimeout(() => fired++, 1);
          Promise.resolve(i).then(() => settled++);
        }
      },
    }),
  );
  threads.push(thread);
  thread.start();
}
for (const thread of threads) thread.join();

function awaited() {
  let ranOn: java.lang.Thread | null = null;
  const task = new java.util.concurrent.FutureTask<any>(
    new java.util.concurrent.Callable<any>({
      call() {
        ranOn = java.lang.Thread.currentThread();
        return '42';
      },
    }),
  );
  new java.lang.Thread(task).start();
  const poll = () => {
    if (!task.isDone()) {
      setTimeout(poll, 5);
      return;
    }
    console.log(`a native thread awaited ${task.get()} from script, which ran on the script thread: ${ranOn === scriptThread}`);
    inWorker();
  };
  poll();
}

function inWorker() {
  const worker = new Worker(new URL('./probe.worker', import.meta.url));
  worker.onmessage = (message) => {
    console.log(message.data);
    worker.terminate();
  };
}

setTimeout(() => {
  console.log(`timers ${fired} of 16000, promise reactions ${settled} of 16000, every callback on the script thread: ${elsewhere === 0}`);
  awaited();
}, 200);
