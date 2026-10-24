// `Base.prototype.m.call(this, …)` from a subclass whose superclasses between override m: Base's own m runs, not the
// nearest override, as a plugin does to skip a framework class's handling of some events.
class Emitter {
  protected handlers: string[] = [];
  on(event: string, tag?: string): number {
    this.handlers.push(`${event}:${tag ?? 'plain'}`);
    return this.handlers.length;
  }
  off(event: string): void {
    this.handlers = this.handlers.filter((h) => !h.startsWith(event + ':'));
  }
  list(): string {
    return this.handlers.join(',');
  }
}

class Widget extends Emitter {
  gestures: string[] = [];
  on(event: string, tag?: string): number {
    if (event === 'tap' || event === 'pan') {
      this.gestures.push(event);
      return -1;
    }
    return super.on(event, tag ?? 'widget');
  }
  off(event: string): void {
    this.gestures = this.gestures.filter((g) => g !== event);
    super.off(event);
  }
}

class Panel extends Widget {}

class Chart extends Panel {
  on(event: string, tag?: string): number {
    if (event === 'tap') return Emitter.prototype.on.call(this, event, tag ?? 'chart');
    return super.on(event, tag);
  }
  off(event: string): void {
    Emitter.prototype.off.apply(this, [event]);
  }
}

class Pie extends Chart {
  on(event: string, tag?: string): number {
    return super.on(event, tag ? tag + '!' : tag);
  }
}

for (const c of [new Chart(), new Pie()]) {
  console.log(c.on('tap'), c.on('pan'), c.on('loaded'), c.on('tap', 'x'));
  console.log(c.list(), '|', c.gestures.join(','));
  c.off('tap');
  console.log(c.list(), '|', c.gestures.join(','));
}

const w = new Widget();
console.log(Emitter.prototype.on.call(w, 'tap'), w.on('tap'), w.list(), w.gestures.join(','));
