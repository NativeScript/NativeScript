// Strings, numbers and booleans from untyped values placed in typed slots (a variable, a field, a literal field, a
// return): JavaScript stores undefined, null or another kind as given, so nothing throws where it is placed. A parameter
// takes undefined and null so too, and another kind is a TypeError where it is passed.
interface Settings {
  title: string;
  size: number;
  shown: boolean;
}
class Label {
  text: string = 'initial';
  width: number = 0;
  visible = true;
}
const raw: any = JSON.parse('{"title": 7, "size": "12", "shown": 1, "nothing": null}');

const title: string = raw.title;
const size: number = raw.size;
const shown: boolean = raw.shown;
console.log(`${title}`, size * 2, shown ? 'shown' : 'hidden');

const missing: string = raw.missing;
const empty: number = raw.nothing;
console.log(missing === undefined, typeof missing, `${missing}`, empty === null, empty ?? 'none');

const label = new Label();
label.text = raw.missing;
label.width = raw.size;
label.visible = raw.nothing;
console.log(`[${label.text}]`, label.text === undefined, label.width * 3, label.visible ? 'visible' : 'invisible');

function describe(text: string, count: number, on: boolean): string {
  return `${text}/${count}/${on}`;
}
console.log(describe(String(raw.title), raw.size * 1, raw.shown === 1), describe(raw.missing, raw.missing, raw.missing));

function titleOf(o: any): string {
  return o.title;
}
const t = titleOf({});
console.log(t === undefined, `${titleOf(raw)}`);

// A typed optional holds null as undefined (a documented difference), so only the test for either is printed.
const settings: Settings = { title: raw.missing, size: raw.nothing, shown: raw.missing };
console.log(settings.title === undefined, settings.size == null, settings.shown ? 'yes' : 'no', JSON.stringify({ title: settings.title, shown: settings.shown }));
