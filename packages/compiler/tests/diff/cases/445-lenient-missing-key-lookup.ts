// @lenient-both
// A Map or Set keyed by objects, asked about a key that is missing: it finds nothing, as JavaScript looks undefined up
// as a key like any other.
class Cell {
  constructor(public id: number) {}
}

class Pager {
  cells = new Map<Cell, number>();
  seen = new Set<Cell>();
  current: Cell;
  track(cell: Cell) {
    this.cells.set(cell, cell.id);
    this.seen.add(cell);
  }
  report(label: string) {
    console.log(label, this.cells.has(this.current), this.cells.get(this.current) ?? 'none', this.seen.has(this.current));
    console.log(label, 'deleted', this.cells.delete(this.current), this.seen.delete(this.current), this.cells.size, this.seen.size);
  }
}

const pager = new Pager();
const first = new Cell(1);
pager.track(first);
pager.track(new Cell(2));
pager.report('no current');
pager.current = first;
pager.report('first');
