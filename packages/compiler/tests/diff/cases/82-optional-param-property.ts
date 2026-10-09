// @lenient
// An optional parameter property of a string, number or boolean, omitted (core's ComponentParser moduleName).
class Parser {
  constructor(
    public context: string,
    private moduleName?: string,
    private depth?: number,
    private strict?: boolean,
  ) {}
  describe(): string {
    return `${this.context}:${this.moduleName ? this.moduleName : 'none'}:${this.depth > 0 ? this.depth : 'top'}:${this.strict ? 'strict' : 'loose'}`;
  }
}
console.log(new Parser('a').describe(), new Parser('b', 'main', 2, true).describe());
