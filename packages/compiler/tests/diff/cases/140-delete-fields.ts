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
