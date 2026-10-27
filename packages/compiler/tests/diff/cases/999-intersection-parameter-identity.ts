// @lenient-both
// As the kit is generated: a parameter typed as an intersection of interfaces (core's `BackstackEntry & ExpandedEntry`)
// is the object the caller passed, so what the body writes on it and stores of it is the caller's.
interface Entry {
  tag: string;
  depth: number;
  fragment?: any;
}

interface Expanded extends Entry {
  listener?: any;
}

class Frame2 {
  current: Entry;
  backstack: Entry[] = [];

  goBackCore(entry: Entry) {
    this.backstack.pop();
  }

  setCurrent(entry: Entry) {
    this.current = entry;
  }

  isCurrent(entry: Entry): boolean {
    return this.current === entry;
  }
}

class AndroidFrame2 extends Frame2 {
  goBackCore(entry: Entry & Expanded) {
    super.goBackCore(entry);
    if (!entry.fragment) {
      entry.fragment = { of: entry.tag };
    }
    reverse(entry, this.current);
    this.setCurrent(entry);
  }
}

function reverse(previous: Expanded, current: Expanded) {
  current.fragment.exit = null;
  previous.listener = 'reenter';
}

function recreate(entry: Entry & Expanded): Entry & Expanded {
  entry.depth++;
  return entry;
}

const frame = new AndroidFrame2();
const home: Entry = { tag: 'home', depth: 0 };
const list: Entry = { tag: 'list', depth: 1, fragment: { of: 'list' } };
frame.backstack.push(home);
frame.setCurrent(list);
frame.goBackCore(home);
console.log(home.fragment?.of, (home as Expanded).listener, frame.isCurrent(home), frame.current === home, list.fragment.exit);
const again = recreate(home);
console.log(again === home, home.depth, frame.backstack.length);
