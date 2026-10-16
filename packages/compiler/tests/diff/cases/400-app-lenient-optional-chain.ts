// @app-lenient
// A non-strict app's object typed present that holds null (`signal<Person>(null)`), read through optional chains
// as an Angular template's bindings read it: undefined where the chain stops, as JavaScript converts it.
interface Person {
  id: number;
  name: string;
  tags: string[];
}

class Detail {
  person: Person = null;

  heading(): string {
    return (this.person?.id + '. ' + this.person?.name);
  }
  name(): string {
    return (this.person?.name);
  }
  value(): any {
    return (this.person?.name);
  }
  id(): any {
    return this.person?.id;
  }
  count(): any {
    return (this.person?.tags?.length);
  }
  text(): string {
    return `${this.person?.name ?? ''}|${this.person?.id}|${this.person?.tags?.length}`;
  }
}

const d = new Detail();
const show = () => console.log(JSON.stringify([d.heading(), '' + d.name(), d.value() === undefined, d.id() === undefined, d.count() === undefined, d.text()]));
show();
d.person = { id: 1, name: 'Alan Turing', tags: ['a', 'b'] };
show();
console.log(String(d.value()), String(d.id()), String(d.count()));
