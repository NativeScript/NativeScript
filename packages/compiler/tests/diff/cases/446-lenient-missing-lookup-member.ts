// @lenient-both
// A member read or call on what a Map lookup or a weak reference gives, where it gives nothing: JavaScript's TypeError,
// which the program catches.
class Binding {
  constructor(public name: string) {}
  bind(source: string) {
    return `${this.name} bound to ${source}`;
  }
}

class Owner {
  bindings = new Map<string, Binding>();
  ref: WeakRef<Binding>;
  bindAll(key: string) {
    try {
      console.log(this.bindings.get(key).bind('model'));
    } catch (e) {
      console.log(key, e instanceof TypeError ? 'TypeError' : 'other');
    }
    try {
      console.log(this.ref.deref().name);
    } catch (e) {
      console.log('ref', e instanceof TypeError ? 'TypeError' : 'other');
    }
  }
}

const owner = new Owner();
const text = new Binding('text');
owner.bindings.set('text', text);
owner.ref = new WeakRef(text);
owner.bindAll('text');
owner.bindAll('color');
