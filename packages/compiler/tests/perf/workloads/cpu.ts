import { measure, measureAsync, Stat } from './stats';

let seed = 42;

/** Park-Miller: every product stays below 2^53, so both flavors draw the same sequence. */
function rand(): number {
  seed = (seed * 48271) % 2147483647;
  return seed / 2147483647;
}

interface Address {
  street: string;
  city: string;
  zip: string;
}

interface Person {
  id: number;
  name: string;
  email: string;
  active: boolean;
  score: number;
  tags: string[];
  address: Address;
  history: number[];
}

const CITIES = ['Lisbon', 'Osaka', 'Portland', 'Nairobi', 'Quito', 'Tallinn', 'Hobart', 'Recife'];

function makePeople(count: number): Person[] {
  const out: Person[] = [];
  for (let i = 0; i < count; i++) {
    const history: number[] = [];
    for (let h = 0; h < 8; h++) history.push(Math.floor(rand() * 100000) / 100);
    out.push({
      id: i,
      name: 'Person number ' + i,
      email: 'person' + i + '@example.com',
      active: rand() > 0.3,
      score: Math.floor(rand() * 1e6) / 1e3,
      tags: ['tag' + (i % 7), 'group' + (i % 13), 'level' + (i % 5)],
      address: { street: i + ' Long Street Name', city: CITIES[i % CITIES.length], zip: '' + (10000 + (i % 89999)) },
      history,
    });
  }
  return out;
}

interface Item {
  id: number;
  value: number;
  group: string;
}

class Vec {
  constructor(
    public x: number,
    public y: number,
  ) {}
  addInPlace(o: Vec): void {
    this.x += o.x;
    this.y += o.y;
  }
  dot(o: Vec): number {
    return this.x * o.x + this.y * o.y;
  }
  plus(o: Vec): Vec {
    return new Vec(this.x + o.x, this.y + o.y);
  }
}

abstract class Shape {
  abstract area(): number;
}
class Circle extends Shape {
  constructor(public r: number) {
    super();
  }
  area(): number {
    return 3.14159 * this.r * this.r;
  }
}
class Rect extends Shape {
  constructor(
    public w: number,
    public h: number,
  ) {
    super();
  }
  area(): number {
    return this.w * this.h;
  }
}
class Square extends Rect {
  constructor(s: number) {
    super(s, s);
  }
  area(): number {
    return this.w * this.w;
  }
}

class Body {
  constructor(
    public x: number,
    public y: number,
    public z: number,
    public vx: number,
    public vy: number,
    public vz: number,
    public mass: number,
  ) {}
}

const PI = Math.PI;
const SOLAR_MASS = 4 * PI * PI;
const DAYS_PER_YEAR = 365.24;

function solarSystem(): Body[] {
  const bodies = [
    new Body(0, 0, 0, 0, 0, 0, SOLAR_MASS),
    new Body(4.84143144246472090e00, -1.16032004402742839e00, -1.03622044471123109e-01, 1.66007664274403694e-03 * DAYS_PER_YEAR, 7.69901118419740425e-03 * DAYS_PER_YEAR, -6.90460016972063023e-05 * DAYS_PER_YEAR, 9.54791938424326609e-04 * SOLAR_MASS),
    new Body(8.34336671824457987e00, 4.12479856412430479e00, -4.03523417114321381e-01, -2.76742510726862411e-03 * DAYS_PER_YEAR, 4.99852801234917238e-03 * DAYS_PER_YEAR, 2.30417297573763929e-05 * DAYS_PER_YEAR, 2.85885980666130812e-04 * SOLAR_MASS),
    new Body(1.28943695621391310e01, -1.51111514016986312e01, -2.23307578892655734e-01, 2.96460137564761618e-03 * DAYS_PER_YEAR, 2.37847173959480950e-03 * DAYS_PER_YEAR, -2.96589568540237556e-05 * DAYS_PER_YEAR, 4.36624404335156298e-05 * SOLAR_MASS),
    new Body(1.53796971148509165e01, -2.59193146099879641e01, 1.79258772950371181e-01, 2.68067772490389322e-03 * DAYS_PER_YEAR, 1.62824170038242295e-03 * DAYS_PER_YEAR, -9.51592254519715870e-05 * DAYS_PER_YEAR, 5.15138902046611451e-05 * SOLAR_MASS),
  ];
  let px = 0;
  let py = 0;
  let pz = 0;
  for (const b of bodies) {
    px += b.vx * b.mass;
    py += b.vy * b.mass;
    pz += b.vz * b.mass;
  }
  bodies[0].vx = -px / SOLAR_MASS;
  bodies[0].vy = -py / SOLAR_MASS;
  bodies[0].vz = -pz / SOLAR_MASS;
  return bodies;
}

function advance(bodies: Body[], dt: number): void {
  const n = bodies.length;
  for (let i = 0; i < n; i++) {
    const bi = bodies[i];
    for (let j = i + 1; j < n; j++) {
      const bj = bodies[j];
      const dx = bi.x - bj.x;
      const dy = bi.y - bj.y;
      const dz = bi.z - bj.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      const mag = dt / (d2 * Math.sqrt(d2));
      bi.vx -= dx * bj.mass * mag;
      bi.vy -= dy * bj.mass * mag;
      bi.vz -= dz * bj.mass * mag;
      bj.vx += dx * bi.mass * mag;
      bj.vy += dy * bi.mass * mag;
      bj.vz += dz * bi.mass * mag;
    }
  }
  for (let i = 0; i < n; i++) {
    const b = bodies[i];
    b.x += dt * b.vx;
    b.y += dt * b.vy;
    b.z += dt * b.vz;
  }
}

function energy(bodies: Body[]): number {
  let e = 0;
  const n = bodies.length;
  for (let i = 0; i < n; i++) {
    const bi = bodies[i];
    e += 0.5 * bi.mass * (bi.vx * bi.vx + bi.vy * bi.vy + bi.vz * bi.vz);
    for (let j = i + 1; j < n; j++) {
      const bj = bodies[j];
      const dx = bi.x - bj.x;
      const dy = bi.y - bj.y;
      const dz = bi.z - bj.z;
      e -= (bi.mass * bj.mass) / Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
  }
  return e;
}

function makeMatrix(n: number): number[][] {
  const m: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) row.push(rand());
    m.push(row);
  }
  return m;
}

function matmul(a: number[][], b: number[][]): number[][] {
  const n = a.length;
  const c: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row: number[] = new Array<number>(n).fill(0);
    const ai = a[i];
    for (let k = 0; k < n; k++) {
      const aik = ai[k];
      const bk = b[k];
      for (let j = 0; j < n; j++) row[j] += aik * bk[j];
    }
    c.push(row);
  }
  return c;
}

function makeAdder(n: number): (x: number) => number {
  return (x: number) => x + n;
}

function compose(f: (x: number) => number, g: (x: number) => number): (x: number) => number {
  return (x: number) => g(f(x));
}

async function step(i: number): Promise<number> {
  return i;
}

async function chain(n: number): Promise<number> {
  let s = 0;
  for (let i = 0; i < n; i++) s += await step(i);
  return s;
}

function makeText(lines: number): string {
  const words = ['alpha', 'beta', 'gamma', 'delta', 'omega', 'kappa'];
  const parts: string[] = [];
  for (let i = 0; i < lines; i++) {
    const w = words[i % words.length];
    parts.push(w + i + '@' + words[(i * 7) % words.length] + '.com visited /path/' + i * 3 + ' at 2024-0' + ((i % 9) + 1) + '-1' + (i % 10) + 'T12:34:56Z, status ' + (200 + (i % 5)));
  }
  return parts.join('\n');
}

export type Results = { [name: string]: Stat };

/** Every workload returns a checksum: equal checksums mean both flavors did the same work. */
export async function runCpu(out: Results, progress: (name: string) => void): Promise<void> {
  seed = 42;
  const people = makePeople(3600);
  const text = JSON.stringify(people);
  out['json-bytes'] = { m: text.length, p90: text.length, n: 1, c: text.length };

  progress('json-parse');
  out['json-parse'] = measure(
    () => {
      const parsed = JSON.parse(text);
      // An \`any\` returned where the closure is typed \`() => number\` fails to compile in Swift.
      const check: number = parsed.length + parsed[1234].history[3];
      return check;
    },
    2,
    7,
  );
  progress('json-stringify');
  out['json-stringify'] = measure(() => JSON.stringify(people).length, 2, 7);

  const nums: number[] = [];
  for (let i = 0; i < 1e6; i++) nums.push(Math.floor(rand() * 1e6));
  progress('num-map-filter-reduce');
  out['num-map-filter-reduce'] = measure(
    () =>
      nums
        .map((x) => x * 2)
        .filter((x) => x % 3 === 0)
        .reduce((a, b) => a + b, 0),
    2,
    7,
  );
  progress('num-sort');
  out['num-sort'] = measure(
    () => {
      const sorted = nums.slice().sort((a, b) => a - b);
      return sorted[1000] + sorted[500000];
    },
    1,
    5,
  );

  const items: Item[] = [];
  for (let i = 0; i < 1e5; i++) items.push({ id: i, value: Math.floor(rand() * 1e4), group: 'g' + Math.floor(rand() * 500) });
  progress('obj-map-filter-reduce');
  out['obj-map-filter-reduce'] = measure(
    () =>
      items
        .map((o) => ({ id: o.id, v: o.value * 2, g: o.group }))
        .filter((o) => o.v > 5000)
        .reduce((a, o) => a + o.v + o.g.length, 0),
    2,
    7,
  );
  progress('obj-sort');
  out['obj-sort'] = measure(
    () => {
      const byValue = items.slice().sort((a, b) => a.value - b.value || a.id - b.id);
      const byGroup = items.slice().sort((a, b) => (a.group < b.group ? -1 : a.group > b.group ? 1 : a.id - b.id));
      return byValue[0].id + byValue[50000].id + byGroup[0].id + byGroup[99999].id;
    },
    1,
    5,
  );

  progress('string-concat');
  out['string-concat'] = measure(
    () => {
      // 2e4, not more: a Kotlin String append copies the whole string, and at 1e5 a run can take minutes.
      let s = '';
      for (let i = 0; i < 2e4; i++) s += 'item' + i + ';';
      return s.length;
    },
    2,
    7,
  );
  progress('string-ops');
  out['string-ops'] = measure(
    () => {
      const parts: string[] = [];
      for (let i = 0; i < 2e4; i++) parts.push(`row ${i}: ${i * 2} of ${'x'.repeat(i % 8)}`);
      const joined = parts.join('\n');
      const lines = joined.split('\n');
      let n = 0;
      for (const line of lines) {
        if (line.indexOf('xx') >= 0) n++;
        n += line.toUpperCase().charCodeAt(0) + line.slice(4, 8).length + line.trim().length;
      }
      return n + joined.length;
    },
    2,
    7,
  );

  const corpus = makeText(5000);
  progress('regex');
  out['regex'] = measure(
    () => {
      const email = /(\w+)@(\w+)\.com/g;
      let count = 0;
      let m = email.exec(corpus);
      while (m !== null) {
        count += m[1].length + m[2].length;
        m = email.exec(corpus);
      }
      const dates = corpus.match(/\d{4}-\d{2}-\d{2}/g);
      const replaced = corpus.replace(/\d+/g, '#');
      let ok = 0;
      for (const line of corpus.split('\n')) if (/status 20[0-2]$/.test(line)) ok++;
      return count + (dates === null ? 0 : dates.length) + replaced.length + ok;
    },
    2,
    7,
  );

  progress('class-methods');
  out['class-methods'] = measure(
    () => {
      const a = new Vec(1, 2);
      const b = new Vec(0.5, -0.25);
      let s = 0;
      for (let i = 0; i < 1e6; i++) {
        a.addInPlace(b);
        s += a.dot(b);
        if (a.x > 1000) {
          a.x = 1;
          a.y = 2;
        }
      }
      return s;
    },
    2,
    7,
  );
  progress('class-alloc');
  out['class-alloc'] = measure(
    () => {
      let v = new Vec(0, 0);
      const d = new Vec(1, 0.5);
      for (let i = 0; i < 5e5; i++) v = v.plus(d);
      return v.x + v.y;
    },
    2,
    7,
  );
  const shapes: Shape[] = [];
  for (let i = 0; i < 1000; i++) shapes.push(i % 3 === 0 ? new Circle(i % 10) : i % 3 === 1 ? new Rect(i % 7, i % 5) : new Square(i % 9));
  progress('virtual-calls');
  out['virtual-calls'] = measure(
    () => {
      let s = 0;
      for (let k = 0; k < 500; k++) for (let i = 0; i < shapes.length; i++) s += shapes[i].area();
      return s;
    },
    2,
    7,
  );
  progress('object-literal');
  out['object-literal'] = measure(
    () => {
      const o = { a: 1, b: 2, c: 3, d: 'x' };
      let s = 0;
      for (let i = 0; i < 1e6; i++) {
        o.a = o.b + i;
        o.b = o.c - o.a;
        o.c = (o.a + o.b) % 1000;
        s += o.c + o.d.length;
      }
      return s;
    },
    2,
    7,
  );

  progress('nbody');
  out['nbody'] = measure(
    () => {
      const bodies = solarSystem();
      for (let i = 0; i < 50000; i++) advance(bodies, 0.01);
      return Math.round(energy(bodies) * 1e9);
    },
    1,
    5,
  );
  const ma = makeMatrix(120);
  const mb = makeMatrix(120);
  progress('matmul');
  out['matmul'] = measure(
    () => {
      const c = matmul(ma, mb);
      return Math.round(c[7][11] * 1e6 + c[119][0] * 1e6);
    },
    1,
    5,
  );

  progress('map-number');
  out['map-number'] = measure(
    () => {
      const m = new Map<number, number>();
      for (let i = 0; i < 1e5; i++) m.set(i * 7, i);
      let s = 0;
      for (let i = 0; i < 2e5; i++) s += m.get(i * 7) ?? -1;
      m.forEach((v) => (s += v));
      return s + m.size;
    },
    2,
    7,
  );
  const keys: string[] = [];
  for (let i = 0; i < 5e4; i++) keys.push('key-' + i);
  progress('map-string');
  out['map-string'] = measure(
    () => {
      const m = new Map<string, number>();
      for (let i = 0; i < keys.length; i++) m.set(keys[i], i);
      let s = 0;
      for (let r = 0; r < 2; r++) for (let i = 0; i < keys.length; i++) s += m.get(keys[i]) ?? 0;
      for (let i = 0; i < keys.length; i += 2) m.delete(keys[i]);
      return s + m.size;
    },
    2,
    7,
  );
  progress('set-number');
  out['set-number'] = measure(
    () => {
      const set = new Set<number>();
      for (let i = 0; i < 1e5; i++) set.add((i * 13) % 70001);
      let hits = 0;
      for (let i = 0; i < 1e5; i++) if (set.has(i)) hits++;
      return hits + set.size;
    },
    2,
    7,
  );

  progress('closures');
  out['closures'] = measure(
    () => {
      const adders: ((x: number) => number)[] = [];
      for (let i = 0; i < 1e5; i++) adders.push(makeAdder(i % 100));
      let s = 0;
      for (const f of adders) s = f(s) % 1000003;
      let h: (x: number) => number = (x: number) => x;
      for (let j = 0; j < 10; j++) h = compose(h, makeAdder(j));
      for (let i = 0; i < 1e5; i++) s = (s + h(i)) % 1000003;
      let count = 0;
      items.forEach((o) => {
        if (o.value > 5000) count++;
      });
      return s + count;
    },
    2,
    7,
  );

  progress('async-await');
  out['async-await'] = await measureAsync(() => chain(1e4), 2, 7);
}
