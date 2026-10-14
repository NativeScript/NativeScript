// `findLast`: the newest message matching, searching from the end; undefined when none does.
interface Message { id: number; from: string; read: boolean }
const inbox: Message[] = [
  { id: 1, from: 'ana', read: true },
  { id: 2, from: 'ben', read: false },
  { id: 3, from: 'ana', read: false },
  { id: 4, from: 'cy', read: true },
];
const lastUnread = inbox.findLast((m) => !m.read);
console.log(lastUnread?.id, lastUnread?.from);
console.log(inbox.findLast((m, i) => m.from === 'ana' && i < 2)?.id);
console.log(inbox.findLast((m) => m.from === 'dee') === undefined);
const sizes = [3, 8, 1, 9, 2];
console.log(sizes.findLast((n) => n > 5), sizes.findLast((n) => n > 50));
