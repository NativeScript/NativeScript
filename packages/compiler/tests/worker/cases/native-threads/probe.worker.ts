const workerThread = java.lang.Thread.currentThread();
new java.lang.Thread(
  new java.lang.Runnable({
    run() {
      postMessage(`a native thread's callback in a worker ran on the worker's thread: ${java.lang.Thread.currentThread() === workerThread}`);
    },
  }),
).start();
