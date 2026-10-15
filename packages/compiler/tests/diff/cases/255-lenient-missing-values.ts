// @lenient
// What core's code throws where a value its types call present is missing, translated as the kit is: a member read,
// written or called on undefined, a function value called, a missing collection iterated, each caught as the
// TypeError V8 words it as, and undefined passed on where JavaScript lets it through.
function attempt(label: string, f: () => unknown) {
  try {
    console.log(label, f());
  } catch (e) {
    console.log(label, (e as Error).name, (e as Error).message);
  }
}
class Style {
  color = 'red';
}
class Node {
  name = 'node';
  style: Style;
  parent: Node;
  children: Node[];
  onTap: (name: string) => string;
  constructor(name?: string) {
    if (name) this.name = name;
  }
  describe(): string {
    return this.name + ':' + this.style.color;
  }
  rename(to: string): void {
    this.parent.name = to;
  }
  tap(): string {
    return this.onTap(this.name);
  }
  siblings(): Node[] {
    return this.parent ? this.parent.children : undefined;
  }
  count(): number {
    let n = 0;
    for (const child of this.siblings()) n += child.name.length;
    return n;
  }
}
function parentName(node: Node): string {
  return node.parent ? node.parent.name : 'none';
}
function load(): Promise<string> {
  return Promise.resolve('loaded');
}
const node = new Node();
attempt('read', () => node.describe());
attempt('write', () => node.rename('x'));
attempt('call', () => node.tap());
attempt('iterate', () => node.count());
attempt('pass undefined', () => parentName(undefined));
attempt('parent missing', () => parentName(node));
node.style = new Style();
node.parent = new Node('root');
node.onTap = (n) => 'tapped ' + n;
node.parent.children = [new Node('a'), new Node('bc')];
attempt('read', () => node.describe());
attempt('write', () => { node.rename('top'); return node.parent.name; });
attempt('call', () => node.tap());
attempt('iterate', () => node.count());
attempt('parent', () => parentName(node));
load().then((v) => console.log('then', v));
