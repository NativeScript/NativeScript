// Object literals typed by an alias of an intersection (`type Shown = Message & { at: string }`): a variable's
// initializer, a function's argument and return value, an array element and a spread of a value of the base type.
interface Message {
  id: number;
  text: string;
  sender?: string;
}
type Shown = Message & { at: string; mine: boolean };
type Queued = { attempts: number } & Message;

function show(m: Shown): string {
  return `${m.id}:${m.text}:${m.sender ?? '-'}:${m.at}:${m.mine}`;
}
function shown(m: Message, at: string): Shown {
  return { ...m, at, mine: m.sender === undefined };
}

const first: Shown = { id: 1, text: 'hi', at: '09:00', mine: true };
console.log(show(first));
console.log(show({ id: 2, text: 'yo', sender: 'ann', at: '09:01', mine: false }));
const list: Shown[] = [first, shown({ id: 3, text: 'hey' }, '09:02')];
console.log(list.map(show).join(' | '));
const q: Queued = { attempts: 0, id: 4, text: 'later' };
q.attempts++;
console.log(q.attempts, q.id, q.text, q.sender);
const retried: Queued[] = [q, { ...q, attempts: q.attempts + 1 }];
console.log(retried.map((r) => `${r.id}x${r.attempts}`).join(','));
function brief(m: Message): string {
  return `${m.id} ${m.text}`;
}
console.log(brief(first), brief(q), JSON.stringify(first));
