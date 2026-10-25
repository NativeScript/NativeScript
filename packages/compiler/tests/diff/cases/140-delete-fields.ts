// @swift
// `delete this.field` on a class's optional fields: the key is gone from Object.keys, `in` and JSON,
// the field reads undefined, and assigning it again brings the key back.
class Contact {
  id = '';
  photo?: string = 'p';
  phones?: string[] = [];
  notes?: string = 'n';

  clear(withPhoto: boolean) {
    if (!withPhoto) {
      const removed = delete this.photo;
      console.log('removed', removed);
    }
    delete this.phones;
    delete this.notes;
  }
}

const c = new Contact();
console.log(Object.keys(c).join(), JSON.stringify(c), 'photo' in c);
c.clear(false);
console.log(Object.keys(c).join(), JSON.stringify(c), 'photo' in c, 'phones' in c, c.photo === undefined, c.phones?.length);
c.phones = ['1'];
console.log(Object.keys(c).join(), JSON.stringify(c));
const d = new Contact();
d.photo = 'x';
d.clear(true);
console.log(Object.keys(d).join(), d.photo);

// A field the class defines (or initializes) is a key until deleted; written again, undefined too, it is one again.
class Deletable {
  a?: string;
  b?: number = 1;
  drop() {
    delete this.a;
    delete this.b;
  }
}
const del = new Deletable();
console.log('deletable', Object.keys(del).join(','), 'a' in del);
del.drop();
console.log('dropped', Object.keys(del).join(','), 'a' in del, 'b' in del, JSON.stringify(del));
del.a = undefined;
console.log('again', Object.keys(del).join(','), 'a' in del);
