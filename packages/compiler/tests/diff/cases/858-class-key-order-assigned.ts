// @assign-fields
// Class fields assigned, not defined: a field is a key from its first write, so keys run in write order, not declaration order.
class Track {
  title?: string;
  artist: string;
  plays = 0;
  tags?: string[];
  rating?: number;
  constructor(artist: string, public id: number, title?: string) {
    if (title) this.title = title;
    this.artist = artist;
  }
}
const show = (tag: string, o: object) => {
  const forIn: string[] = [];
  for (const k in o) forIn.push(k);
  console.log(tag, Object.keys(o).join(','), forIn.join(','), JSON.stringify(o), Object.keys({ ...o }).join(','), Object.entries(o).map((e) => e[0]).join(','));
};
const a = new Track('ann', 1);
show('new', a);
a.rating = 4;
a.title = 'late';
a.tags = ['x'];
show('later', a);
const b = new Track('bo', 2, 'early');
b.rating = undefined;
show('early', b);
const c = new Track('cy', 3);
c.tags = undefined;
c.title = undefined;
c.rating = 1;
show('undefined first', c);

class Remix extends Track {
  mix?: string;
  year = 2026;
  constructor(artist: string) {
    super(artist, 9);
    this.mix = 'dub';
  }
}
const r = new Remix('dj');
r.title = 'base field later';
show('sub', r);
const r2 = new Remix('dj2');
r2.mix = undefined;
r2.rating = 3;
show('sub2', r2);

class Point {
  y!: number;
  x!: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
show('point', new Point(1, 2));
console.log(JSON.stringify([new Point(3, 4), a]));
