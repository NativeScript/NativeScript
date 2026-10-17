// @lenient-both
// An optional chain goes on past a call (`items?.getItems().forEach(…)`): where the chain stops, nothing after it runs,
// and a member it reads is undefined, which compares as JavaScript compares it.
class Items {
  constructor(private names: string[]) {}
  getItems(): Array<string> {
    return this.names;
  }
}

class Bar {
  actionItems: Items;
  count = 0;
  run(label: string) {
    this.actionItems?.getItems().forEach((s) => console.log(label, 'item', s));
    if (this.actionItems?.getItems().length > 0) console.log(label, 'has items');
    else console.log(label, 'no items');
    this.count = this.actionItems?.getItems().length ?? -1;
    console.log(label, 'count', this.count);
  }
}

const empty = new Bar();
empty.run('empty');
const full = new Bar();
full.actionItems = new Items(['a', 'b']);
full.run('full');
