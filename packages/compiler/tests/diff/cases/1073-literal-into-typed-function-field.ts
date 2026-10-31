// A function literal assigned to a nullable function field a class or interface declares, typed by that field.
class Failure {
  constructor(public message: string) {}
}

interface Channel {
  onfail: ((this: Channel, f: Failure) => any) | null;
  ondone: ((f: Failure | null) => boolean) | null;
}

class Pipe implements Channel {
  onfail: ((this: Channel, f: Failure) => any) | null = null;
  ondone: ((f: Failure | null) => boolean) | null = null;
  fail(message: string): any {
    return this.onfail ? this.onfail(new Failure(message)) : 'none';
  }
  done(f: Failure | null): boolean {
    return this.ondone ? this.ondone(f) : false;
  }
}

class Owner {
  private pipe: Pipe | null = null;
  private channel: Channel | null = null;
  log: string[] = [];

  open(): void {
    this.pipe = new Pipe();
    this.pipe.onfail = (f) => {
      this.log.push(`fail ${f?.message ?? f}`);
      return true;
    };
    this.pipe.ondone = (f) => {
      this.log.push(`done ${f === null ? 'null' : f.message}`);
      return f !== null;
    };
    this.channel = this.pipe;
    this.channel.onfail = function (f) {
      return `channel ${f.message}`;
    };
  }

  run(): void {
    const p = this.pipe!;
    this.log.push(String(p.fail('a')));
    this.log.push(String(p.done(new Failure('b'))), String(p.done(null)));
  }
}

const o = new Owner();
o.open();
o.run();
console.log(o.log.join(' | '));

const bare: Channel = { onfail: null, ondone: null };
bare.onfail = (f) => f.message.length;
bare.ondone = (f) => f === null;
if (bare.onfail && bare.ondone) console.log(bare.onfail(new Failure('xyz')), bare.ondone(null), bare.ondone(new Failure('q')));
