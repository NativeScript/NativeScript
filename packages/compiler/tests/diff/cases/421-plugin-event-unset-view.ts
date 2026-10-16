// @plugin
// An event literal a plugin builds before the view exists (ui-pager's itemLoading): the unset view is undefined in it, as in JavaScript.
import { Cell, Item, Pager } from './helpers/plugin/pager-event.ts';

const pager = new Pager();
console.log(pager.prepare(new Cell(), 0).label, pager.last.view === undefined, pager.last.index);
const cell = new Cell();
cell.view = new Item();
cell.view.label = 'made';
console.log(pager.prepare(cell, 1).label, pager.last.view !== undefined, pager.last.index);
