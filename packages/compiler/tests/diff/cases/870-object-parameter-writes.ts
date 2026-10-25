// A function typed with the app's own interface writes through an untyped object it is given (an event's data):
// the object's owner reads the writes afterwards.
interface Inset { left: number; consumed: boolean; note?: string }
class Insets { left = 24; consumed = false; }
class InsetEvent { inset = new Insets(); count = 0; }
function onInset(args: { inset: Inset; count: number }): void {
  const inset = args.inset;
  inset.left = 0;
  inset.consumed = true;
  inset.note = undefined;
  args.count++;
}
const ev = new InsetEvent();
onInset(ev as any);
console.log(ev.inset.left, ev.inset.consumed, ev.count);
const raw: any = { inset: { left: 8, consumed: false }, count: 1 };
onInset(raw);
console.log(raw.inset.left, raw.inset.consumed, 'note' in raw.inset, raw.inset.note, raw.count, Object.keys(raw.inset).join());
function rename(o: { name: string | null }) { o.name = null; }
const named: any = { name: 'a' };
rename(named);
console.log(named.name);
