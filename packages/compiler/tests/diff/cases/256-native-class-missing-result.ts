// @lenient
// A native class's own getters whose value may be missing, as core's ListViewCell.view
// (`this.owner ? this.owner.deref() : null`): they give undefined and null as such, not a TypeError.
@NativeClass
class Cell extends NSObject {
  public owner: WeakRef<Item>;
  public last: Item;

  public get item(): Item {
    return this.owner ? this.owner.deref() : null;
  }

  public get previous(): Item {
    return this.last;
  }
}
class Item {
  constructor(public name: string) {}
}
const kept = new Item('kept');
const cell = <Cell>Cell.new();
try {
  console.log('empty', cell.item == null, cell.previous, cell.item ? 'some' : 'none');
  cell.owner = new WeakRef(kept);
  cell.last = cell.item;
  console.log('owned', cell.item.name, cell.previous.name);
} catch (e) {
  console.log('threw', (e as Error).name, (e as Error).message);
}
