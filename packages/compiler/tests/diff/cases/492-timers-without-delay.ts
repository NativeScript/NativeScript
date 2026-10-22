// Timers set without a delay, as JavaScript defaults it to 0, and their ids typed as Node's typings name them.
let ticks = 0;
let interval: NodeJS.Timeout | undefined;
const order: string[] = [];

const first: NodeJS.Timeout = setTimeout(() => order.push('timeout'));
interval = setInterval(() => {
  ticks++;
  order.push(`tick ${ticks}`);
  if (ticks === 2) {
    if (interval !== undefined) clearInterval(interval);
    setTimeout(() => console.log(order.join(', '), first !== undefined));
  }
});
Promise.resolve().then(() => order.push('microtask'));
order.push('sync');
