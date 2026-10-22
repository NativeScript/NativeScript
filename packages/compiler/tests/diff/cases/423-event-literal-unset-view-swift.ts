// An item event a pager builds before its view exists (ui-pager's itemLoading on Android): the literal asserted to the
// interface keeps the unset view as undefined, and the handler's view replaces it.
class Item {
  label = 'item';
}
class Cell {
  view!: Item;
}
interface LoadingEvent {
  eventName: string;
  object: any;
  index: number;
  view: Item;
  android?: any;
}
class Pager {
  last!: LoadingEvent;
  handler?: (args: LoadingEvent) => void;
  notify(args: LoadingEvent) {
    this.last = args;
    this.handler?.(args);
  }
  prepareTyped(cell: Cell, index: number) {
    let view = cell.view;
    const args = { eventName: 'itemLoading', object: this, index, android: undefined, view } as LoadingEvent;
    this.notify(args);
    view = args.view || new Item();
    return view;
  }
  prepareHolder(holder: any, index: number) {
    let view = holder.view;
    view = holder.placeholder ? view.content : view;
    const args = { eventName: 'itemLoading', object: this, android: holder, index, view } as LoadingEvent;
    this.notify(args);
    if (holder.placeholder && args.view !== view) view = args.view;
    return view;
  }
  dispose(holder: any) {
    const view = holder.view;
    this.notify({ eventName: 'itemDisposing', index: 2, android: holder, view } as LoadingEvent);
  }
}

const pager = new Pager();
const cell = new Cell();
cell.view = new Item();
cell.view.label = 'made';
console.log(pager.prepareTyped(cell, 1).label, pager.last.view !== undefined);

pager.handler = (args) => {
  if (!args.view) {
    const made = new Item();
    made.label = 'from handler ' + args.index;
    args.view = made;
  }
};
console.log(pager.prepareHolder({ placeholder: true, view: {} }, 3).label);
const existing = new Item();
console.log(pager.prepareHolder({ placeholder: false, view: existing }, 4) === existing);
pager.handler = undefined;
pager.dispose({});
console.log(pager.last.eventName, pager.last.view === undefined);
