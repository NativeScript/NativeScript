// Interfaces declared in namespaces, which Swift and Kotlin hold at the module's top level, named as a class of the
// module and as each other.
class Entry {
  constructor(public key: string) {}
}

namespace Remote {
  export interface Entry {
    value: number;
  }
  export function total(entries: Entry[]): number {
    return entries.reduce((n, e) => n + e.value, 0);
  }
}

namespace Local {
  export interface Entry {
    name: string;
    size: number;
  }
  export function names(entries: Entry[]): string {
    return entries.map((e) => `${e.name}:${e.size}`).join();
  }
}

const remote: Remote.Entry[] = [{ value: 2 }, { value: 3 }];
const local: Local.Entry[] = [{ name: 'a', size: 1 }];
console.log(new Entry('k').key, Remote.total(remote), Local.names(local), remote.length + local.length);
