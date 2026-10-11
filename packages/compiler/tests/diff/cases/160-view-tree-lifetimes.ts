// @lenient
// @weak-fields Node.parent Observer._target
// @weak-captures State._onChange Observer._onLoaded
// A view tree as core builds one, with the references the kit holds weakly (tools/native-kit/modules.mts): parent
// links up the tree, a per-view state whose handler over itself is registered on its view, and a gesture-style
// observer the view owns that listens to its target. Dropped from its frame, the whole tree is freed. Checked a task
// later, after a full collection where the runtime has one (Node runs with --expose-gc).
const gc = (globalThis as any).gc as (() => void) | undefined;
interface Entry {
  callback: () => void;
  thisArg?: any;
}
class Node {
  parent: Node;
  children: Node[] = [];
  observers: Observer[] = [];
  state: State;
  private listeners: { [name: string]: Entry[] } = {};
  constructor(public name: string) {
    this.state = new State(new WeakRef(this));
  }
  add(child: Node) {
    child.parent = this;
    this.children.push(child);
  }
  on(event: string, callback: () => void, thisArg?: any) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push({ callback, thisArg });
  }
  off(event: string, callback: () => void) {
    const list = this.listeners[event];
    if (list) this.listeners[event] = list.filter((e) => e.callback !== callback);
  }
  count(event: string): number {
    return (this.listeners[event] || []).length;
  }
  depth(): number {
    return this.parent ? this.parent.depth() + 1 : 0;
  }
}
class State {
  _onChange: () => void;
  changes = 0;
  constructor(private viewRef: WeakRef<Node>) {
    this._onChange = () => this.update();
  }
  update() {
    this.changes++;
  }
  subscribe() {
    this.viewRef.deref().on('change', this._onChange);
  }
  unsubscribe() {
    this.viewRef.deref().off('change', this._onChange);
  }
}
class Observer {
  _target: Node;
  _onLoaded: () => void;
  attached = 0;
  constructor(target: Node) {
    this._target = target;
  }
  observe() {
    this._onLoaded = () => {
      this.attached++;
    };
    this._target.on('loaded', this._onLoaded);
  }
}
class Frame {
  content: Node;
}
const frame = new Frame();
const refs: WeakRef<object>[] = [];
function build(name: string, levels: number): Node {
  const node = new Node(name);
  refs.push(new WeakRef(node), new WeakRef(node.state));
  node.state.subscribe();
  const observer = new Observer(node);
  observer.observe();
  node.observers.push(observer);
  refs.push(new WeakRef(observer));
  if (levels > 0) for (let i = 0; i < 2; i++) node.add(build(`${name}.${i}`, levels - 1));
  return node;
}
frame.content = build('page', 3);
function describe() {
  const leaf = frame.content.children[1].children[0].children[1];
  console.log('tree:', refs.length / 3, 'views, leaf depth', leaf.depth(), 'listeners', leaf.count('change'), leaf.count('loaded'));
}
describe();
frame.content.state.unsubscribe();
console.log('after unsubscribe:', frame.content.count('change'));
setTimeout(() => {
  gc?.();
  console.log('attached, alive:', refs.filter((r) => r.deref() !== undefined).length);
  frame.content = null;
  setTimeout(() => {
    gc?.();
    console.log('dropped, alive:', refs.filter((r) => r.deref() !== undefined).length);
  }, 0);
}, 0);
