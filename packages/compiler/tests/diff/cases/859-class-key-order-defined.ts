// @swift
// Class fields defined (ES2022): every declared field is a key from construction, in declaration order; a field deleted and
// written again moves to the end, as does any other key it is written after.
class Panel {
  title?: string;
  width = 10;
  note?: string;
  constructor(public id: number) {}
}
const show = (tag: string, o: object) => {
  const forIn: string[] = [];
  for (const k in o) forIn.push(k);
  console.log(tag, Object.keys(o).join(','), forIn.join(','), JSON.stringify(o), Object.keys({ ...o }).join(','));
};
const p = new Panel(1);
p.note = 'n';
p.title = 't';
show('new', p);
delete p.title;
show('deleted', p);
p.title = 'back';
show('back', p);
const q = new Panel(2);
delete q.note;
delete q.title;
q.note = 'n2';
q.title = undefined;
show('both', q);
