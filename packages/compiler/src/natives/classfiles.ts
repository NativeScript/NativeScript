import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { inflateRawSync } from 'node:zlib';

/**
 * Java signatures for Android APIs, read from the class files themselves: the
 * SDK's android.jar, NativeScript's widgets AAR and, for androidx types, the
 * AARs in the Gradle cache. Archives are listed when first needed and a class
 * is parsed when first looked up, so a build reads only the classes its app
 * touches and their supertypes.
 */

export const ACC_PUBLIC = 0x1, ACC_PRIVATE = 0x2, ACC_PROTECTED = 0x4, ACC_STATIC = 0x8, ACC_FINAL = 0x10;
export const ACC_BRIDGE = 0x40, ACC_VARARGS = 0x80, ACC_INTERFACE = 0x200, ACC_ABSTRACT = 0x400, ACC_SYNTHETIC = 0x1000, ACC_ENUM = 0x4000;

export interface JavaMember {
  name: string;
  /** `(IF)V`, `Landroid/view/View;` */
  descriptor: string;
  /** The generic signature, when the member has one. */
  signature?: string;
  access: number;
  /** The internal name of the declaring class. */
  owner: string;
  /** Annotated `@Nullable`: the field's value or the method's result, which Kotlin then types `T?`. */
  nullable?: boolean;
  /** The method's parameters annotated `@Nullable`. */
  nullableParams?: boolean[];
  /** The method's parameters annotated `@NonNull`, which Kotlin types `T`: an override must take them so. */
  nonNullParams?: boolean[];
}

export interface JavaClass {
  /** Internal name: `android/view/View$OnClickListener`. */
  name: string;
  access: number;
  superName: string | null;
  interfaces: string[];
  signature?: string;
  fields: JavaMember[];
  methods: JavaMember[];
}

// ---- Zip archives ------------------------------------------------------------------------------

interface ZipEntry { name: string; method: number; compressed: number; offset: number }

class Zip {
  readonly entries = new Map<string, ZipEntry>();
  private data: Buffer;
  constructor(data: Buffer) {
    this.data = data;
    let eocd = -1;
    for (let i = data.length - 22; i >= Math.max(0, data.length - 22 - 0xffff); i--) {
      if (data.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error('not a zip archive');
    let count = data.readUInt16LE(eocd + 10);
    let at = data.readUInt32LE(eocd + 16);
    if (count === 0xffff || at === 0xffffffff) {
      const locator = eocd - 20;
      if (data.readUInt32LE(locator) === 0x07064b50) {
        const z64 = Number(data.readBigUInt64LE(locator + 8));
        count = Number(data.readBigUInt64LE(z64 + 32));
        at = Number(data.readBigUInt64LE(z64 + 48));
      }
    }
    for (let k = 0; k < count && data.readUInt32LE(at) === 0x02014b50; k++) {
      const method = data.readUInt16LE(at + 10);
      let compressed = data.readUInt32LE(at + 20);
      const nameLen = data.readUInt16LE(at + 28), extraLen = data.readUInt16LE(at + 30), commentLen = data.readUInt16LE(at + 32);
      let offset = data.readUInt32LE(at + 42);
      const name = data.toString('utf8', at + 46, at + 46 + nameLen);
      if (compressed === 0xffffffff || offset === 0xffffffff) {
        // Zip64 extra field: the 64-bit sizes and offset, in that order, for the fields that overflowed.
        for (let x = at + 46 + nameLen; x < at + 46 + nameLen + extraLen; ) {
          const id = data.readUInt16LE(x), size = data.readUInt16LE(x + 2);
          if (id === 1) {
            let p = x + 4;
            if (data.readUInt32LE(at + 24) === 0xffffffff) p += 8;
            if (compressed === 0xffffffff) { compressed = Number(data.readBigUInt64LE(p)); p += 8; }
            if (offset === 0xffffffff) offset = Number(data.readBigUInt64LE(p));
          }
          x += 4 + size;
        }
      }
      this.entries.set(name, { name, method, compressed, offset });
      at += 46 + nameLen + extraLen + commentLen;
    }
  }

  read(name: string): Buffer | null {
    const e = this.entries.get(name);
    if (!e) return null;
    const h = e.offset;
    const start = h + 30 + this.data.readUInt16LE(h + 26) + this.data.readUInt16LE(h + 28);
    const raw = this.data.subarray(start, start + e.compressed);
    if (e.method === 0) return raw;
    if (e.method === 8) return inflateRawSync(raw);
    throw new Error(`${name}: zip method ${e.method}`);
  }
}

/** A jar's classes, or an AAR's (classes.jar and libs/*.jar). */
function openArchive(path: string): Zip[] {
  const zip = new Zip(readFileSync(path));
  if (!path.endsWith('.aar')) return [zip];
  return [...zip.entries.keys()].filter((n) => n === 'classes.jar' || /^libs\/[^/]+\.jar$/.test(n)).map((n) => new Zip(zip.read(n)!));
}

/** The internal names of the classes in a jar or an AAR. */
export function archiveClasses(path: string): string[] {
  return openArchive(path).flatMap((z) => [...z.entries.keys()].filter((n) => n.endsWith('.class') && !n.startsWith('META-INF/') && !n.endsWith('module-info.class')).map((n) => n.slice(0, -6)));
}

// ---- Class files -------------------------------------------------------------------------------

export function parseClass(b: Buffer): JavaClass {
  if (b.readUInt32BE(0) !== 0xcafebabe) throw new Error('not a class file');
  let p = 8;
  const count = b.readUInt16BE(p); p += 2;
  const utf8: (string | undefined)[] = [];
  const classRef: number[] = [];
  for (let i = 1; i < count; i++) {
    const tag = b[p++];
    switch (tag) {
      case 1: { const len = b.readUInt16BE(p); utf8[i] = b.toString('utf8', p + 2, p + 2 + len); p += 2 + len; break; }
      case 7: classRef[i] = b.readUInt16BE(p); p += 2; break;
      case 8: case 16: case 19: case 20: p += 2; break;
      case 15: p += 3; break;
      case 3: case 4: case 9: case 10: case 11: case 12: case 17: case 18: p += 4; break;
      case 5: case 6: p += 8; i++; break;
      default: throw new Error(`constant pool tag ${tag}`);
    }
  }
  const cls = (i: number) => (i ? utf8[classRef[i]]! : null);
  const access = b.readUInt16BE(p);
  const name = cls(b.readUInt16BE(p + 2))!;
  const superName = cls(b.readUInt16BE(p + 4));
  p += 6;
  const interfaces: string[] = [];
  for (let n = b.readUInt16BE(p), k = 0; k < n; k++) interfaces.push(cls(b.readUInt16BE(p + 2 + 2 * k))!);
  p += 2 + 2 * interfaces.length;
  // Annotations are read only for their type names: Kotlin types a member `T?` when one is a `…/Nullable`.
  let q = 0;
  const skipValue = (): void => {
    const tag = String.fromCharCode(b[q++]);
    if (tag === 'e') q += 4;
    else if (tag === '@') annotation();
    else if (tag === '[') { const n = b.readUInt16BE(q); q += 2; for (let k = 0; k < n; k++) skipValue(); }
    else q += 2;
  };
  const annotation = (): string => {
    const type = utf8[b.readUInt16BE(q)]!;
    const pairs = b.readUInt16BE(q + 2);
    q += 4;
    for (let k = 0; k < pairs; k++) { q += 2; skipValue(); }
    return type;
  };
  /** Whether the annotations read are `@Nullable` (1), `@NonNull` (2) or neither (0). */
  const nullableIn = (): number => {
    let found = 0;
    const n = b.readUInt16BE(q); q += 2;
    for (let k = 0; k < n; k++) {
      const type = annotation();
      if (/\/Nullable;$/.test(type)) found = 1;
      else if (/\/(NonNull|NotNull|RecentlyNonNull);$/.test(type) && !found) found = 2;
    }
    return found;
  };
  const attributes = (owner: { signature?: string; nullable?: boolean; nullableParams?: boolean[]; nonNullParams?: boolean[] }) => {
    const n = b.readUInt16BE(p); p += 2;
    for (let k = 0; k < n; k++) {
      const attr = utf8[b.readUInt16BE(p)];
      const len = b.readUInt32BE(p + 2);
      q = p + 6;
      if (attr === 'Signature') owner.signature = utf8[b.readUInt16BE(p + 6)];
      else if (attr === 'RuntimeVisibleAnnotations' || attr === 'RuntimeInvisibleAnnotations') { if (nullableIn() === 1) owner.nullable = true; }
      else if (attr === 'RuntimeVisibleParameterAnnotations' || attr === 'RuntimeInvisibleParameterAnnotations') {
        const count = b[q++];
        const list = owner.nullableParams ?? [];
        const nonNull = owner.nonNullParams ?? [];
        for (let i = 0; i < count; i++) {
          const kind = nullableIn();
          if (kind === 1) list[i] = true;
          else if (kind === 2) nonNull[i] = true;
        }
        owner.nullableParams = list;
        owner.nonNullParams = nonNull;
      }
      p += 6 + len;
    }
  };
  const members = (): JavaMember[] => {
    const out: JavaMember[] = [];
    const n = b.readUInt16BE(p); p += 2;
    for (let k = 0; k < n; k++) {
      const m: JavaMember = { access: b.readUInt16BE(p), name: utf8[b.readUInt16BE(p + 2)]!, descriptor: utf8[b.readUInt16BE(p + 4)]!, owner: name };
      p += 6;
      attributes(m);
      out.push(m);
    }
    return out;
  };
  const fields = members();
  const methods = members();
  const result: JavaClass = { name, access, superName, interfaces, fields, methods };
  attributes(result);
  return result;
}

// ---- The classpath -----------------------------------------------------------------------------

function versionKey(v: string): number[] {
  return v.split(/[.-]/).map((x) => (/^\d+$/.test(x) ? Number(x) : -1));
}

export function newer(a: string, b: string): boolean {
  const stable = (v: string) => !/-/.test(v);
  if (stable(a) !== stable(b)) return stable(a);
  const ka = versionKey(a), kb = versionKey(b);
  for (let i = 0; i < Math.max(ka.length, kb.length); i++) if ((ka[i] ?? 0) !== (kb[i] ?? 0)) return (ka[i] ?? 0) > (kb[i] ?? 0);
  return false;
}

/** The SDK platform's android.jar: the compile SDK's when installed, else the newest. */
export function androidJar(compileSdk: number): string {
  const sdk = process.env.ANDROID_HOME ?? process.env.ANDROID_SDK_ROOT ?? join(homedir(), 'Library', 'Android', 'sdk');
  const platforms = join(sdk, 'platforms');
  const wanted = join(platforms, `android-${compileSdk}`, 'android.jar');
  if (existsSync(wanted)) return wanted;
  const installed = existsSync(platforms) ? readdirSync(platforms).filter((d) => existsSync(join(platforms, d, 'android.jar'))) : [];
  const best = installed.sort((a, b) => (newer(a.replace('android-', ''), b.replace('android-', '')) ? -1 : 1))[0];
  if (!best) throw new Error(`no Android SDK platform under ${platforms} (set ANDROID_HOME)`);
  return join(platforms, best, 'android.jar');
}

/**
 * Classes by internal name across android.jar, the widgets AAR and the
 * androidx artifacts in the Gradle cache. An androidx class is looked for in
 * its Maven group first (`androidx.appcompat.app.X` in `androidx.appcompat`),
 * at the version `pinned` names or else the newest the cache has.
 */
export class ClassPath {
  private archives: Zip[][] = [];
  private classes = new Map<string, JavaClass | null>();
  private gradleGroups = new Map<string, Zip[][] | null>();
  private allGroupsLoaded = false;
  private pinned: Map<string, string>;
  private gradleCache: string;

  constructor(archives: string[], pinned: Map<string, string> = new Map(), gradleCache = join(homedir(), '.gradle', 'caches', 'modules-2', 'files-2.1')) {
    this.pinned = pinned;
    this.gradleCache = gradleCache;
    for (const a of archives) this.archives.push(openArchive(a));
  }

  get(name: string): JavaClass | null {
    if (this.classes.has(name)) return this.classes.get(name)!;
    let found: JavaClass | null = null;
    const entry = name + '.class';
    const search = (sets: Zip[][]) => {
      for (const set of sets) for (const z of set) if (z.entries.has(entry)) return parseClass(z.read(entry)!);
      return null;
    };
    found = search(this.archives);
    if (!found && name.startsWith('androidx/')) {
      found = search(this.group('androidx.' + name.split('/')[1]));
      if (!found) found = search(this.allGroups());
    }
    this.classes.set(name, found);
    return found;
  }

  private group(group: string): Zip[][] {
    if (!this.gradleGroups.has(group)) {
      const dir = join(this.gradleCache, group);
      this.gradleGroups.set(group, existsSync(dir) ? readdirSync(dir).flatMap((artifact) => {
        const file = this.artifactFile(group, artifact);
        try { return file ? [openArchive(file)] : []; } catch { return []; }
      }) : null);
    }
    return this.gradleGroups.get(group) ?? [];
  }

  private allGroups(): Zip[][] {
    if (!this.allGroupsLoaded) {
      this.allGroupsLoaded = true;
      if (existsSync(this.gradleCache)) for (const g of readdirSync(this.gradleCache)) if (g.startsWith('androidx.')) this.group(g);
    }
    return [...this.gradleGroups.values()].flatMap((x) => x ?? []);
  }

  private artifactFile(group: string, artifact: string): string | null {
    const dir = join(this.gradleCache, group, artifact);
    const files = (v: string) => readdirSync(join(dir, v)).flatMap((h) => {
      const hd = join(dir, v, h);
      return existsSync(hd) ? readdirSync(hd).filter((f) => f === `${artifact}-${v}.aar` || f === `${artifact}-${v}.jar`).map((f) => join(hd, f)) : [];
    });
    const pinned = this.pinned.get(`${group}:${artifact}`);
    if (pinned && existsSync(join(dir, pinned))) {
      const f = files(pinned);
      if (f.length) return f[0];
    }
    const versions = readdirSync(dir).filter((v) => files(v).length).sort((a, b) => (newer(a, b) ? -1 : 1));
    return versions.length ? files(versions[0])[0] : null;
  }

  /** The class's superclass chain and every interface it implements, nearest first, itself included. */
  supertypes(name: string): JavaClass[] {
    const out: JavaClass[] = [];
    const seen = new Set<string>();
    const queue = [name];
    while (queue.length) {
      const n = queue.shift()!;
      if (seen.has(n)) continue;
      seen.add(n);
      const c = this.get(n);
      if (!c) continue;
      out.push(c);
      if (c.superName) queue.push(c.superName);
      queue.push(...c.interfaces);
    }
    return out;
  }

  /** How many inheritance steps from `from` to `to` (0 for the same class), or null when `from` is not a `to`. */
  distance(from: string, to: string): number | null {
    if (from === to) return 0;
    if (to === 'java/lang/Object') return 50;
    const seen = new Map<string, number>([[from, 0]]);
    const queue = [from];
    while (queue.length) {
      const n = queue.shift()!;
      const d = seen.get(n)!;
      const c = this.get(n);
      if (!c) continue;
      for (const s of [c.superName, ...c.interfaces]) {
        if (!s || seen.has(s)) continue;
        if (s === to) return d + 1;
        seen.set(s, d + 1);
        queue.push(s);
      }
    }
    return null;
  }
}

// ---- Descriptors -------------------------------------------------------------------------------

/** A method descriptor's parameter descriptors and return descriptor. */
export function methodTypes(descriptor: string): { params: string[]; ret: string } {
  const params: string[] = [];
  let i = 1;
  while (descriptor[i] !== ')') {
    const start = i;
    while (descriptor[i] === '[') i++;
    if (descriptor[i] === 'L') i = descriptor.indexOf(';', i);
    i++;
    params.push(descriptor.slice(start, i));
  }
  return { params, ret: descriptor.slice(i + 1) };
}

const PRIMITIVE_NAMES: Record<string, string> = { Z: 'boolean', B: 'byte', C: 'char', S: 'short', I: 'int', J: 'long', F: 'float', D: 'double', V: 'void' };

/** A descriptor as Java source spells it: `[I` → `int[]`. */
export function javaTypeName(desc: string): string {
  if (desc.startsWith('[')) return javaTypeName(desc.slice(1)) + '[]';
  if (desc.startsWith('L')) return desc.slice(1, -1).replace(/[/$]/g, '.');
  return PRIMITIVE_NAMES[desc] ?? desc;
}

/**
 * The type a generic signature gives each parameter (and the return), split
 * like `methodTypes` splits a descriptor; type parameters (`<T:…>`) and
 * `throws` clauses are dropped.
 */
export function signatureTypes(signature: string): { params: string[]; ret: string } {
  let i = 0;
  if (signature[0] === '<') {
    let depth = 0;
    for (; i < signature.length; i++) {
      if (signature[i] === '<') depth++;
      else if (signature[i] === '>' && --depth === 0) { i++; break; }
    }
  }
  const one = (): string => {
    const start = i;
    while (signature[i] === '[') i++;
    if (signature[i] === 'L' || signature[i] === 'T') {
      let depth = 0;
      for (; i < signature.length; i++) {
        if (signature[i] === '<') depth++;
        else if (signature[i] === '>') depth--;
        else if (signature[i] === ';' && depth === 0) break;
      }
    }
    i++;
    return signature.slice(start, i);
  };
  const params: string[] = [];
  i++;
  while (signature[i] !== ')') params.push(one());
  i++;
  const ret = one();
  return { params, ret };
}
