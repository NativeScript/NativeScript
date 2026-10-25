// A spread of an untyped object keeps its keys that hold undefined, in order, into typed and untyped literals.
interface Opts { label?: string; size?: number; tint?: string | null }
const raw: any = { label: undefined, size: 2, tint: null, extra: undefined };
const show = (tag: string, o: object) => console.log(tag, Object.keys(o).join(','), JSON.stringify(o), 'label' in o, Object.entries(o).length);
const a = { ...raw };
show('untyped', a);
const b: Opts = { ...raw };
show('typed', b);
const c: Opts = { size: 1, ...raw, tint: 'red' };
show('mixed', c);
const d = { first: 1, ...raw, last: undefined };
show('around', d);
const partial: any = JSON.parse('{"size": 3}');
partial.label = undefined;
const e: Opts = { ...partial };
show('parsed', e);
const f: Opts = { label: 'kept', ...partial };
show('overwritten', f);
const merged: any = Object.assign({}, raw, { size: undefined });
show('assign', merged);
