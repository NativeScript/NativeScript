// Matches that start or end inside a surrogate pair, and inputs holding a lone surrogate: their text is a lone surrogate.
function all(source: string, flags: string, input: string): string {
  const re = new RegExp(source, flags);
  const out: string[] = [];
  let guard = 0;
  while (guard++ < 10) {
    const m = re.exec(input);
    if (m === null) break;
    const parts: string[] = [];
    for (let i = 0; i < m.length; i++) parts.push(JSON.stringify(m[i]));
    out.push(m.index + ':' + parts.join(','));
    if (!re.global) break;
  }
  return `/${source}/${flags} => ${out.join(' ')}`;
}
console.log(all('[😀]', 'g', '😀'));
console.log(all('\\uD83D', '', '😀'));
console.log(all('\\uDE00', 'u', '😀' + String.fromCharCode(0xde00)));
console.log(all('[^x]+', 'u', '😀' + String.fromCharCode(0xd83d) + 'x'));
console.log(all('(?<=(.))b', '', '😀b'));
