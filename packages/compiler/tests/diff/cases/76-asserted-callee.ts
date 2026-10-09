// A handler field called through a non-null assertion: called when set, a TypeError when not.
class Parser {
  onComment: ((text: string, at: number) => void) | null = null;
  emit(text: string): string {
    try {
      this.onComment!(text, text.length);
      return 'called';
    } catch (e) {
      return (e as Error).name;
    }
  }
}
const p = new Parser();
const seen: string[] = [];
console.log(p.emit('before'));
p.onComment = (text, at) => { seen.push(`${text}@${at}`); };
console.log(p.emit('after'), seen.join(','));

function hex(x: string | undefined): number {
  return parseInt(x as string, 16);
}
let elem = '';
let x = '';
function chained(opened: string | null): string {
  x = elem = opened as string;
  return `${x}|${elem}`;
}
console.log(hex('1f'), hex(undefined), chained('a'));
