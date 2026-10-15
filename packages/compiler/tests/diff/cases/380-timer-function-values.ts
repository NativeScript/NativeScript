// Timers cleared by passing clearTimeout and clearInterval themselves to an array's forEach.
const timeouts: number[] = [];
const intervals: number[] = [];
let fired = 0;
timeouts.push(setTimeout(() => fired++, 5));
timeouts.push(setTimeout(() => fired++, 10));
intervals.push(setInterval(() => fired++, 5));
timeouts.forEach(clearTimeout);
intervals.forEach(clearInterval);
setTimeout(() => console.log('fired', fired), 30);
