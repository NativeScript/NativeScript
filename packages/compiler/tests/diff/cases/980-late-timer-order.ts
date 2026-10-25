// Timer order when callbacks run late. Each part starts from the last callback of the one before, so their timings don't overlap.
function spin(ms: number) {
  const end = Date.now() + ms;
  while (Date.now() < end) { /* busy */ }
}

// A timer already due runs before one a late callback schedules with no delay, and a microtask runs between them.
function lateCallback(next: () => void) {
  setTimeout(() => {
    console.log('timeout 10');
    Promise.resolve().then(() => console.log('microtask from timeout 10'));
    spin(30);
    setTimeout(() => {
      console.log('nested timeout');
      next();
    }, 0);
  }, 10);
  setTimeout(() => console.log('timeout 10 second'), 10);
  setTimeout(() => console.log('timeout 20'), 20);
  const cancelled = setTimeout(() => console.log('cancelled'), 15);
  clearTimeout(cancelled);
}

// An interval longer to run than its period is rescheduled from when its callback started.
function lateInterval(next: () => void) {
  let ticks = 0;
  const interval = setInterval(() => {
    ticks++;
    console.log('tick', ticks);
    if (ticks === 3) {
      clearInterval(interval);
      next();
      return;
    }
    spin(12);
  }, 5);
  setTimeout(() => console.log('timeout 20 between ticks'), 20);
}

// A late loop runs each due list whole, in expiry order: the second 20 ms timer runs before the 10 ms one due earlier.
function lateLoop() {
  setTimeout(() => console.log('20 first'), 20);
  spin(10);
  setTimeout(() => console.log('20 second'), 20);
  spin(5);
  setTimeout(() => console.log('10'), 10);
  spin(60);
  console.log('loop free');
}

lateCallback(() => lateInterval(lateLoop));
