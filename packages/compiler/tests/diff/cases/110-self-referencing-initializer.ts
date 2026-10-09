// A local whose initializer's functions read the local itself (a listener removing itself), called later.
function run() {
  const listeners: Array<{ fire: () => void }> = [];
  const once = {
    fire: () => {
      listeners.splice(listeners.indexOf(once), 1);
      console.log('fired once', listeners.length);
    },
  };
  listeners.push(once);
  const tick = () => {
    console.log('tick', typeof tick);
  };
  listeners.push({ fire: tick });
  [...listeners].forEach((l) => l.fire());
  console.log(listeners.length);
}
run();
