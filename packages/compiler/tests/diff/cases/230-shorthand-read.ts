// A variable declared without a value and set on only some paths, read through a shorthand property.
function rule(text: string) {
  let until: string | undefined;
  if (text.includes('UNTIL')) until = text.slice(6);
  return { text, until };
}
async function counted(ok: boolean) {
  let advisories = 0;
  try {
    if (!ok) throw new Error('no');
    advisories = 3;
  } catch {}
  return { advisories };
}
console.log(JSON.stringify(rule('UNTIL=x')), JSON.stringify(rule('none')));
counted(true).then((a) => console.log(a.advisories));
counted(false).then((a) => console.log(a.advisories));
