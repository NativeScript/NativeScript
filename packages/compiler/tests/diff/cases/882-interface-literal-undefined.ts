// A literal typed as an interface that a class implements as well: its optional fields given undefined are keys.
interface Shape { kind: string; label?: string; size?: number; onPick?: () => void }
class Square implements Shape {
  kind = 'square';
  label?: string;
  size?: number;
  onPick?: () => void;
}
const show = (tag: string, o: Shape) => console.log(tag, Object.keys(o).join(','), JSON.stringify(o), 'label' in o, 'size' in o, Object.entries(o).length);
const a: Shape = { kind: 'lit', label: undefined };
show('literal', a);
const maybe = (n: number): number | undefined => (n > 0 ? n : undefined);
const b: Shape = { kind: 'b', size: maybe(0), label: 'b' };
show('maybe', b);
const raw: any = { label: undefined };
const c: Shape = { kind: 'c', label: raw.label, size: raw.nothing };
show('untyped', c);
const d: Shape = { kind: 'd' };
d.size = undefined;
show('written', d);
const e: Shape = { kind: 'e', onPick: undefined };
show('callback', e);
const shapes: Shape[] = [new Square(), { kind: 'f', size: undefined }];
shapes[0].label = undefined;
shapes[1].label = undefined;
console.log(shapes.map((s) => Object.keys(s).join('/')).join(' '), JSON.stringify(shapes));
