// An app's field that a missing value reaches (an element past the end, a record's entry never set, a function's
// result that gives one) holds undefined as it is, whatever its declared type: reads that convert it convert undefined,
// a member read on it is JavaScript's TypeError, and JSON leaves it out. Every member of the field's group (the
// interface member, the literal's property) holds it alike.
function attempt(name: string, run: () => unknown) {
  try {
    console.log(name, run());
  } catch (e) {
    console.log(name, e instanceof TypeError ? 'TypeError' : 'other');
  }
}

interface Look {
  name: string;
  width: number;
}
const NAMES = ['low', 'high'];
const WIDTHS: Record<string, number> = { low: 1.5 };

function lookAt(i: number): Look {
  return { name: NAMES[i], width: WIDTHS[NAMES[i]] };
}

class Chord {
  constructor(readonly id: string, readonly frets: number[]) {}
}
const CHORDS = [new Chord('G', [3, 2, 0]), new Chord('C', [0, 1, 0])];
function chordAt(i: number): Chord {
  return CHORDS[i];
}

class Board {
  look: Look = lookAt(0);
  chord: Chord = chordAt(0);
  pick(i: number): void {
    this.look = lookAt(i);
    this.chord = chordAt(i);
  }
}

const board = new Board();
console.log(board.look.name, board.look.width, board.chord.id, JSON.stringify(board.look));
board.pick(5);
const look = board.look;
console.log(typeof look.name, typeof look.width, look.name === undefined, look.width === undefined);
console.log(String(look.name), `${look.name}/${look.width}`, look.width + 1, look.width > 0, JSON.stringify(look));
console.log(look.name ?? 'none', look.width || -1, board.chord === undefined, board.chord?.id ?? 'no chord');
attempt('name.length', () => look.name.length);
attempt('width.toFixed', () => look.width.toFixed(1));
attempt('chord.id', () => board.chord.id);
attempt('chord.frets', () => board.chord.frets.length);
board.pick(1);
console.log(board.look.name, board.look.width, board.chord.id, board.look.name.length, JSON.stringify(board.look));
