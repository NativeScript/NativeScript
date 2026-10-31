// A typed function value held untyped and read back, or added and removed as a listener through untyped slots, is
// one function to `===` and to the listener list.
class Box {
  constructor(public v: number) {}
}

function show(b: Box): string {
  return b == null ? 'none' : `box ${b.v}`;
}
const arrow = (b: Box, tag: string): string => (b == null ? `none ${tag}` : `box ${b.v} ${tag}`);

const heldShow: any = show;
const heldArrow: any = arrow;
const backShow = heldShow as (b: Box) => string;
const backArrow = heldArrow as (b: Box, tag: string) => string;
console.log(heldShow === show, backShow === show, heldArrow === arrow, backArrow === arrow);
console.log(heldShow === heldShow, ([show] as any[]).indexOf(heldShow), ([heldArrow] as any[]).includes(arrow));

class Emitter {
  private listeners: any[] = [];
  on(fn: any): void {
    this.listeners.push(fn);
  }
  off(fn: any): void {
    const k = this.listeners.indexOf(fn);
    if (k >= 0) this.listeners.splice(k, 1);
  }
  emit(b: Box | null): string[] {
    return this.listeners.map((l) => l(b, 'e'));
  }
  get count(): number {
    return this.listeners.length;
  }
}

const em = new Emitter();
em.on(show);
em.on(arrow);
console.log(em.count, em.emit(new Box(1)).join(','), em.emit(null).join(','));
em.off(show);
em.off(arrow);
console.log(em.count);

const set = new Set<any>();
set.add(show);
set.add(heldShow);
set.add(arrow);
set.delete(backArrow);
console.log(set.size, set.has(show), set.has(arrow));

const map = new Map<any, string>();
map.set(arrow, 'a');
console.log(map.get(heldArrow), map.has(backArrow));
