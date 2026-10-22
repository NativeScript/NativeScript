// A plugin's item event, built as core's ItemEventData is: a literal asserted to the interface, its view not made yet.
export class Item {
  label = 'item';
}
export class Cell {
  view: Item;
}
export interface LoadingEvent {
  eventName: string;
  object: Pager;
  index: number;
  android: any;
  ios: Cell;
  view: Item;
  bindingContext: any;
}
export class Pager {
  last: LoadingEvent;
  notify(args: LoadingEvent) {
    this.last = args;
  }
  prepare(cell: Cell, index: number) {
    let view = cell.view;
    const context = undefined;
    const args = { eventName: 'itemLoading', object: this, index, android: undefined, ios: cell, view, bindingContext: context } as LoadingEvent;
    this.notify(args);
    view = args.view || new Item();
    return view;
  }
}
