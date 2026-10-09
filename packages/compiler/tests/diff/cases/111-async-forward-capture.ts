// An async function's local function reading a constant declared after it, and an async Promise executor.
async function settle(): Promise<string> {
  await Promise.resolve();
  function stop(): string {
    return `stop ${handle}`;
  }
  const handle = 7;
  return stop();
}
function opened(): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    if (!(await Promise.resolve(true))) reject(new Error('no'));
    let timer = 0;
    function onActive(): void {
      resolve(true);
      console.log('active', observer, timer);
    }
    const observer = 'observer';
    timer = 3;
    onActive();
  });
}
settle().then((s) => console.log(s));
opened().then((v) => console.log('opened', v));
