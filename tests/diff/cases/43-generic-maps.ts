// @lenient
// A map held under a generic alias, as core's selector matching keeps the nodes it saw.
interface Changes {
  attributes?: Set<string>;
  pseudoClasses?: Set<string>;
}
type ChangeMap<T extends object> = Map<T, Changes>;
const emptyChangeMap: ChangeMap<any> = new Map();
class Matches<T extends object> {
  public changeMap: ChangeMap<T> = emptyChangeMap;
  public addPseudoClass(node: T, pseudoClass: string): void {
    const deps: Changes = this.properties(node);
    if (!deps.pseudoClasses) {
      deps.pseudoClasses = new Set();
    }
    deps.pseudoClasses.add(pseudoClass);
  }
  public properties(node: T): Changes {
    let changeMap = this.changeMap;
    if (changeMap === emptyChangeMap) {
      this.changeMap = changeMap = new Map<T, Changes>();
    }
    let set = changeMap.get(node);
    if (!set) {
      changeMap.set(node, (set = {}));
    }
    return set;
  }
}
const node = { name: 'button' };
const matches = new Matches<typeof node>();
matches.addPseudoClass(node, 'highlighted');
matches.addPseudoClass(node, 'disabled');
console.log(matches.changeMap.size, [...matches.changeMap.get(node).pseudoClasses].join(), emptyChangeMap.size);
const loose: any = new Map<string, number>();
loose.set('a', 1).set('b', 2);
const looseSet: any = new Set<string>();
looseSet.add('x').add('y').add('x');
console.log(loose.get('b'), loose.delete('a'), loose.delete('a'), loose.size, looseSet.size, looseSet.delete('x'), looseSet.has('y'));
loose.clear();
looseSet.clear();
console.log(loose.size, looseSet.size);
