// @plugin
// A non-strict app's function values: a module constant whose arrow passes a declared function to map, timers
// cleared by passing clearTimeout itself, and an array made from a length whose type is a union of numbers.
interface Chord {
  id: string;
  frets: number;
}
const CHORDS: readonly Chord[] = [
  { id: 'G', frets: 3 },
  { id: 'C', frets: 1 },
];
function chordById(id: string): Chord {
  for (const chord of CHORDS) {
    if (chord.id === id) return chord;
  }
  throw new Error(`Unknown chord "${id}"`);
}
const set = (name: string, ids: string[]) => ({ name, chords: ids.map(chordById) });
const SETS = [set('open', ['G', 'C'])];
console.log(SETS[0].name, SETS[0].chords.map((c) => c.frets).join(','));
try {
  set('bad', ['X']);
} catch (e) {
  console.log((e as Error).message);
}

class Store {
  private pending: number[] = [];
  fired = 0;
  later(delay: number) {
    this.pending.push(setTimeout(() => this.fired++, delay));
  }
  cancel() {
    this.pending.forEach(clearTimeout);
    this.pending = [];
  }
}
const store = new Store();
store.later(5);
store.later(10);
store.cancel();
setTimeout(() => console.log('fired', store.fired), 30);

const columns = (count: number) => (count <= 4 ? 2 : 3);
class Pad {
  count = 6;
  get keyColumns() {
    return Array(columns(this.count)).fill('*').join(', ');
  }
}
console.log(new Pad().keyColumns);
