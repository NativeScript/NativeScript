// A function expression as an object member reading `this`: the object it is called on.
interface Item {
  text: string;
  loadedCount: number;
  onLoaded: (args: any) => void;
}
class Owner {
  label = 'owner';
  make(): Item[] {
    const items: Item[] = [];
    for (let i = 0; i < 2; i++) {
      items.push({
        text: 'Item ' + i,
        loadedCount: 0,
        onLoaded: function (args) {
          this.loadedCount++;
        },
      });
    }
    return items;
  }
}
const items = new Owner().make();
items[0].onLoaded(null);
items[0].onLoaded(null);
items[1].onLoaded(null);
console.log(items.map((i) => `${i.text}:${i.loadedCount}`).join(' '));
