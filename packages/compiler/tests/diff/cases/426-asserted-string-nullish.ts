// `x as string ?? ''` and `x as number ?? n` of untyped values: the assertion is erased, so a missing value takes the fallback.
const settings: Record<string, unknown> = { name: 'cpc', count: 0, empty: '' };
const raw: any = JSON.parse('{"title":"Agenda","size":12,"none":null}');

function label(key: string): string {
  return (settings[key] as string) ?? '(none)';
}
function size(key: string): number {
  return (raw[key] as number) ?? -1;
}
console.log(label('name'), JSON.stringify(label('empty')), label('missing'));
console.log(size('size'), size('none'), size('missing'), (settings['count'] as number) ?? 7);
const title = (raw.title as string) ?? 'untitled';
const subtitle = (raw.subtitle as string) ?? 'untitled';
console.log(title, subtitle, ((raw.none as string) ?? 'was null').toUpperCase());
