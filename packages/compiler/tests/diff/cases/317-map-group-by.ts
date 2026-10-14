// `Map.groupBy`: grouped under keys of any type (booleans, objects), as a Map compares them.
interface Task { title: string; priority: number; done: boolean }
const tasks: Task[] = [
  { title: 'ship', priority: 1, done: false },
  { title: 'test', priority: 2, done: true },
  { title: 'docs', priority: 3, done: false },
];
const byDone = Map.groupBy(tasks, (t) => t.done);
console.log(byDone.size, (byDone.get(false) ?? []).map((t) => t.title).join(','), byDone.get(true)?.length);
console.log([...byDone.keys()].join(','));
const urgent = { label: 'urgent' };
const later = { label: 'later' };
const byBucket = Map.groupBy(tasks, (t, i) => (t.priority + i < 3 ? urgent : later));
console.log(byBucket.get(urgent)?.length, (byBucket.get(later) ?? []).map((t) => t.title).join(','), byBucket.get({ label: 'urgent' }));
