// @lenient-both
// Core's CSS3Parser shape: the tokenizer returns undefined at the end of its text, which ends the loops reading tokens.
class Tokenizer {
  private next = 0;
  constructor(private text: string) {}

  token(): string | { type: number; text: string } {
    const char = this.text[this.next];
    switch (char) {
      case '{':
      case '}':
      case ':':
        this.next++;
        return char;
      case ' ':
        this.next++;
        return ' ';
      case undefined:
        return undefined;
      default:
        return { type: 2, text: this.text[this.next++] };
    }
  }

  tokens(): string[] {
    const out: string[] = [];
    let t;
    while ((t = this.token())) out.push(typeof t === 'object' ? t.text : t);
    return out;
  }
}
console.log(new Tokenizer('local { color: #3a3a3c }').tokens().join('|'));
console.log(new Tokenizer('').tokens().length);
