// The declarations of hand-written Swift (the kit's runtime), read with a tokenizer that knows strings, comments and
// brackets, so a declaration reads the same however a formatter lays it out. Generated code is not read here: the
// translator records what it emits (kit-manifest.ts).

export interface SwiftParam { label: string; name: string; type: string; default?: string }

export interface SwiftMember {
  kind: 'var' | 'func' | 'init' | 'subscript' | 'case';
  static: boolean;
  /** A property's type, a function's or subscript's result, an initializer's own type (`T?` when failable). */
  type: string;
  params?: SwiftParam[];
  /** A function or initializer that throws, or a property whose getter does. */
  throws?: boolean;
  /** The iOS version `@available` requires. */
  available?: string;
}

export interface SwiftType {
  /** Qualified by the types it is nested in (`ActivatedRoute.Snapshot`). */
  name: string;
  kind: 'class' | 'struct' | 'enum' | 'protocol' | 'extension' | 'actor';
  /** Public or open; an extension is public unless private. */
  public: boolean;
  /** The access the declaration states (`internal` where it states none). */
  access: 'public' | 'internal' | 'private';
  /** Declared at file scope. */
  topLevel: boolean;
  /** The inheritance list as written, generic arguments included. */
  inherits: string[];
  /** `typealias Name = Target` inside the type: name → target. */
  aliases: [string, string][];
  members: [string, SwiftMember][];
  /** String literals the type's code switches on or reads by name (`case "text":`, `applied["src"]`). */
  names: Set<string>;
  /** Free functions the type's code calls (`applyTextInputTrait(…)`). */
  calls: Set<string>;
  available?: string;
}

export interface SwiftFile {
  types: SwiftType[];
  /** Type aliases at file scope. */
  typealiases: { name: string; access: SwiftType['access'] }[];
  /** Top-level functions and variables, public or not, with `public` telling which. */
  globals: (SwiftMember & { name: string; public: boolean; names: Set<string> })[];
}

interface Tok {
  t: string;
  /** A line break comes before the token. */
  nl: boolean;
  at: number;
  end: number;
  str?: string;
}

const OPERATOR = '/=-+!*%<>&|^~?.';

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0, nl = true;
  const n = src.length;
  /** The end of a string literal starting at `i` (its quotes, `#`s and interpolations included). */
  const skipString = (i: number): number => {
    let hashes = 0;
    while (src[i] === '#') { hashes++; i++; }
    const multi = src.startsWith('"""', i);
    i += multi ? 3 : 1;
    const close = (multi ? '"""' : '"') + '#'.repeat(hashes);
    const escape = '\\' + '#'.repeat(hashes);
    while (i < n) {
      if (src.startsWith(close, i)) return i + close.length;
      if (src.startsWith(escape, i)) {
        i += escape.length;
        if (src[i] === '(') {
          let depth = 0;
          for (; i < n; i++) {
            if (src[i] === '"' || (src[i] === '#' && /^#+"/.test(src.slice(i, i + 8)))) { i = skipString(i) - 1; continue; }
            if (src[i] === '(') depth++;
            else if (src[i] === ')' && --depth === 0) break;
          }
        }
        i++;
        continue;
      }
      if (!multi && src[i] === '\n') return i;
      i++;
    }
    return i;
  };
  while (i < n) {
    const c = src[i];
    if (c === '\n') { nl = true; i++; continue; }
    if (c === ' ' || c === '\t' || c === '\r') { i++; continue; }
    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') {
      let depth = 0;
      for (; i < n; i++) {
        if (src[i] === '/' && src[i + 1] === '*') { depth++; i++; }
        else if (src[i] === '*' && src[i + 1] === '/') { i++; if (--depth === 0) { i++; break; } }
        else if (src[i] === '\n') nl = true;
      }
      continue;
    }
    const start = i;
    if (c === '"' || (c === '#' && /^#+"/.test(src.slice(i, i + 8)))) {
      i = skipString(i);
      const text = src.slice(start, i);
      out.push({ t: '"', nl, at: start, end: i, str: /^"((?:[^"\\\n]|\\.)*)"$/.exec(text)?.[1] });
    } else if (c === '`') {
      const end = src.indexOf('`', i + 1);
      i = end < 0 ? n : end + 1;
      out.push({ t: src.slice(start + 1, i - 1), nl, at: start, end: i });
    } else if (/[A-Za-z_$]/.test(c) || (c === '#' && /[A-Za-z]/.test(src[i + 1] ?? '')) || (c === '@' && /[A-Za-z_]/.test(src[i + 1] ?? ''))) {
      i++;
      while (i < n && /[\w$]/.test(src[i])) i++;
      out.push({ t: src.slice(start, i), nl, at: start, end: i });
    } else if (/[0-9]/.test(c)) {
      while (i < n && /[\w.]/.test(src[i]) && !(src[i] === '.' && !/[0-9]/.test(src[i + 1] ?? ''))) i++;
      out.push({ t: src.slice(start, i), nl, at: start, end: i });
    } else if ('([{}]),;:'.includes(c)) {
      i++;
      out.push({ t: c, nl, at: start, end: i });
    } else if (c === '-' && src[i + 1] === '>') {
      i += 2;
      out.push({ t: '->', nl, at: start, end: i });
    } else if (OPERATOR.includes(c)) {
      // `<` and `>` stand alone: generic brackets, which `Array<Array<Int>>` closes twice.
      if (c === '<' || c === '>') i++;
      else while (i < n && OPERATOR.includes(src[i]) && src[i] !== '<' && src[i] !== '>' && !(src[i] === '-' && src[i + 1] === '>')) i++;
      out.push({ t: src.slice(start, i), nl, at: start, end: i });
    } else {
      i++;
      out.push({ t: c, nl, at: start, end: i });
    }
    nl = false;
  }
  return out;
}

const DECL_KEYWORDS = new Set(['class', 'struct', 'enum', 'protocol', 'extension', 'actor', 'func', 'init', 'deinit', 'subscript', 'var', 'let', 'typealias', 'associatedtype', 'case', 'import', 'operator', 'precedencegroup', 'macro']);
const MODIFIERS = new Set(['public', 'open', 'private', 'fileprivate', 'internal', 'package', 'final', 'static', 'override', 'convenience', 'required', 'lazy', 'weak', 'unowned', 'nonisolated', 'mutating', 'nonmutating', 'dynamic', 'optional', 'indirect', 'prefix', 'postfix', 'infix', 'isolated', 'consuming', 'borrowing', 'distributed', 'nonsending']);
const TYPE_KINDS = new Set(['class', 'struct', 'enum', 'protocol', 'extension', 'actor']);

/** Whether the token starts a declaration (or a compiler directive between them) on a new line. */
function startsDeclaration(tok: Tok, next?: Tok): boolean {
  if (tok.t.startsWith('@') || tok.t.startsWith('#')) return true;
  if (DECL_KEYWORDS.has(tok.t)) return true;
  // `open` and the like only as modifiers: followed by another word, not an operator or a call.
  return MODIFIERS.has(tok.t) && !!next && /^[A-Za-z_@]/.test(next.t);
}

/** Reads the declarations of one Swift file. */
export function readSwift(src: string): SwiftFile {
  const toks = tokenize(src);
  const file: SwiftFile = { types: [], typealiases: [], globals: [] };
  const accessOf = (mods: Set<string>): SwiftType['access'] => (mods.has('public') || mods.has('open') ? 'public' : mods.has('private') || mods.has('fileprivate') ? 'private' : 'internal');
  let k = 0;
  const slice = (from: number, to: number) => (from < to ? src.slice(toks[from].at, toks[to - 1].end).replace(/\s+/g, ' ').trim() : '');
  /** The index of the bracket closing the one at `open`. */
  const closing = (open: number): number => {
    let depth = 0;
    for (let j = open; j < toks.length; j++) {
      const t = toks[j].t;
      if (t === '(' || t === '[' || t === '{') depth++;
      else if ((t === ')' || t === ']' || t === '}') && --depth === 0) return j;
    }
    return toks.length - 1;
  };
  /** Past a generic parameter or argument list starting at `k` (`<T: Equatable>`). */
  const skipAngles = (j: number): number => {
    if (toks[j]?.t !== '<') return j;
    let depth = 0;
    for (; j < toks.length; j++) {
      const t = toks[j].t;
      if (t === '<') depth++;
      else if (t === '>' && --depth === 0) return j + 1;
      else if (t === '(' || t === '[') j = closing(j);
    }
    return j;
  };
  /**
   * The end of what a declaration has left (a type, an initial value) from `j`: a token at depth 0 that
   * ends the scope, `;`, any of `stops`, or a new line starting the next declaration.
   */
  const declarationEnd = (j: number, stops: string[], type = false): number => {
    let angles = 0;
    for (; j < toks.length; j++) {
      const t = toks[j];
      // In a type, `<…>` brackets generic arguments, whose commas end nothing.
      if (type && t.t === '<') { angles++; continue; }
      if (type && t.t === '>' && angles > 0) { angles--; continue; }
      if (t.t === '}' || t.t === ';' || (angles === 0 && stops.includes(t.t))) return j;
      if (j > 0 && t.nl && startsDeclaration(t, toks[j + 1])) return j;
      if (t.t === '(' || t.t === '[' || t.t === '{') j = closing(j);
    }
    return j;
  };
  /** Names a body reads by name and the free functions it calls. */
  const scanBody = (from: number, to: number, names: Set<string>, calls?: Set<string>) => {
    for (let j = from; j < to; j++) {
      const t = toks[j];
      if (t.t === 'case') {
        for (let x = j + 1; x < to && (toks[x].t === '"' || toks[x].t === ','); x++) if (toks[x].str !== undefined && /^\w+$/.test(toks[x].str!)) names.add(toks[x].str!);
      } else if ((t.t === 'applied' || t.t === 'locals') && toks[j + 1]?.t === '[' && toks[j + 2]?.t === '"' && toks[j + 3]?.t === ']' && !isMemberOf(j)) {
        if (/^\w+$/.test(toks[j + 2].str ?? '')) names.add(toks[j + 2].str!);
      } else if (t.t === 'get' && toks[j + 1]?.t === '(' && toks[j + 2]?.t === '"' && toks[j + 3]?.t === ')' && !isMemberOf(j)) {
        if (/^\w+$/.test(toks[j + 2].str ?? '')) names.add(toks[j + 2].str!);
      } else if (t.t === 'name' && toks[j + 1]?.t === '==' && toks[j + 2]?.t === '"' && !isMemberOf(j)) {
        if (/^\w+$/.test(toks[j + 2].str ?? '')) names.add(toks[j + 2].str!);
      } else if (calls && /^[a-z]\w*$/.test(t.t) && toks[j + 1]?.t === '(' && !isMemberOf(j)) calls.add(t.t);
    }
  };
  /** `x.name`, `?.name`: a member, not a free name. */
  const isMemberOf = (j: number) => j > 0 && /^\??\.$/.test(toks[j - 1].t) && toks[j - 1].end === toks[j].at;
  const params = (open: number): SwiftParam[] => {
    const close = closing(open);
    const out: SwiftParam[] = [];
    let start = open + 1;
    let depth = 0;
    const one = (from: number, to: number) => {
      if (from >= to) return;
      let colon = -1, eq = -1, d = 0;
      for (let j = from; j < to; j++) {
        const t = toks[j].t;
        if (t === '(' || t === '[' || t === '<') d++;
        else if (t === ')' || t === ']' || t === '>') d--;
        else if (t === ':' && d === 0 && colon < 0) colon = j;
        else if (t === '=' && d === 0 && colon >= 0 && eq < 0) eq = j;
      }
      const words = toks.slice(from, colon < 0 ? to : colon).map((x) => x.t).filter((w) => !w.startsWith('@'));
      const label = words[0] ?? '_';
      out.push({ label, name: words[1] ?? label, type: slice(colon + 1, eq < 0 ? to : eq), ...(eq >= 0 ? { default: slice(eq + 1, to) } : {}) });
    };
    for (let j = open + 1; j < close; j++) {
      const t = toks[j].t;
      if (t === '(' || t === '[' || t === '{') { j = closing(j); continue; }
      if (t === '<') depth++;
      else if (t === '>') depth--;
      else if (t === ',' && depth === 0) { one(start, j); start = j + 1; }
    }
    one(start, close);
    return out;
  };
  const effects = (j: number): [number, boolean] => {
    let throws = false;
    for (; ; j++) {
      const t = toks[j]?.t;
      if (t === 'async' || t === 'reasync') continue;
      // A rethrowing function throws only what its argument does, which a call of it passes as it chooses.
      if (t === 'throws' || t === 'rethrows') { if (t === 'throws') throws = true; if (toks[j + 1]?.t === '(' && toks[j + 1].at === toks[j].end) j = closing(j + 1); continue; }
      return [j, throws];
    }
  };

  /** Reads the declarations of a scope from `k` up to its closing brace; `owner` is null at file scope. */
  const scope = (owner: SwiftType | null, ownerPublic: boolean, inProtocol: boolean) => {
    while (k < toks.length) {
      const tok = toks[k];
      if (tok.t === '}') { k++; return; }
      if (tok.t === ';') { k++; continue; }
      if (tok.t === '#if' || tok.t === '#elseif' || tok.t === '#else' || tok.t === '#endif') {
        k++;
        while (k < toks.length && !toks[k].nl) k++;
        continue;
      }
      if (tok.t.startsWith('#')) { k++; if (toks[k]?.t === '(') k = closing(k) + 1; continue; }
      // Attributes and modifiers.
      let available: string | undefined;
      const mods = new Set<string>();
      for (;;) {
        const t = toks[k];
        if (!t) return;
        if (t.t.startsWith('@')) {
          if (toks[k + 1]?.t === '(' && toks[k + 1].at === t.end) {
            const close = closing(k + 1);
            if (t.t === '@available') {
              const args = slice(k + 2, close);
              const v = /\biOS\s+([\d.]+)/.exec(args)?.[1];
              if (v) available = v;
            }
            k = close + 1;
          } else k++;
          continue;
        }
        const isClassModifier = t.t === 'class' && /^(func|var|let|subscript|override|final|open|public|private|fileprivate|internal|nonisolated|dynamic|required|convenience)$/.test(toks[k + 1]?.t ?? '');
        if (MODIFIERS.has(t.t) && toks[k + 1] && /^[A-Za-z_@(]/.test(toks[k + 1].t) && !(toks[k + 1].t === '(' && !['private', 'fileprivate', 'internal', 'public', 'open', 'package', 'nonisolated', 'unowned'].includes(t.t))) {
          mods.add(t.t);
          k++;
          // `private(set)`, `nonisolated(unsafe)`.
          if (toks[k]?.t === '(' && toks[k].at === t.end) k = closing(k) + 1;
          continue;
        }
        if (isClassModifier) { mods.add('static'); k++; continue; }
        break;
      }
      const kw = toks[k]?.t;
      if (!kw) return;
      const isPublic = mods.has('public') || mods.has('open') || (!mods.has('private') && !mods.has('fileprivate') && !mods.has('internal') && (ownerPublic || inProtocol));
      const isStatic = mods.has('static');
      const add = (name: string, m: SwiftMember) => {
        if (available) m.available = available;
        if (owner) { if (isPublic) owner.members.push([name, m]); }
      };
      if (TYPE_KINDS.has(kw)) {
        k++;
        let name = toks[k]?.t ?? '';
        k++;
        // `extension A.B`: the dotted path.
        while (toks[k]?.t === '.' && toks[k + 1]) { name += '.' + toks[k + 1].t; k += 2; }
        if (kw === 'extension') name = name.replace(/^NativeScriptKit\./, '');
        k = skipAngles(k);
        const inherits: string[] = [];
        if (toks[k]?.t === ':') {
          k++;
          let start = k;
          for (; k < toks.length && toks[k].t !== '{' && toks[k].t !== 'where'; k++) {
            if (toks[k].t === '<') { k = skipAngles(k) - 1; continue; }
            if (toks[k].t === '(' || toks[k].t === '[') { k = closing(k); continue; }
            if (toks[k].t === ',') { inherits.push(slice(start, k)); start = k + 1; }
          }
          inherits.push(slice(start, k));
        }
        while (k < toks.length && toks[k].t !== '{') k++;
        const qualified = owner && kw !== 'extension' ? `${owner.name}.${name}` : name;
        const declaredPublic = owner ? isPublic : mods.has('public') || mods.has('open');
        const type: SwiftType = { name: qualified, kind: kw as SwiftType['kind'], public: declaredPublic, access: accessOf(mods), topLevel: !owner, inherits: inherits.filter(Boolean), aliases: [], members: [], names: new Set(), calls: new Set(), ...(available ? { available } : {}) };
        file.types.push(type);
        k++;
        // An extension's members are public where it says so, or each does.
        scope(type, kw === 'extension' ? declaredPublic : false, kw === 'protocol' && declaredPublic);
        // An extension is the kit's addition to its type whatever it adds.
        if (kw === 'extension') type.public = !mods.has('private') && !mods.has('fileprivate');
        continue;
      }
      if (kw === 'func') {
        k++;
        let name = toks[k].t;
        k++;
        // An operator's name is its symbols (`static func == (`).
        while (toks[k] && toks[k].t !== '(' && toks[k].t !== '<') { name += toks[k].t; k++; }
        if (toks[k]?.t === '<' && toks[k].at === toks[k - 1].end) k = skipAngles(k);
        const open = k;
        const ps = params(open);
        k = closing(open) + 1;
        const [after, throws] = effects(k);
        k = after;
        let type = 'Void';
        if (toks[k]?.t === '->') {
          const end = declarationEnd(k + 1, ['{', 'where'], true);
          type = slice(k + 1, end);
          k = end;
        }
        if (toks[k]?.t === 'where') k = declarationEnd(k, ['{']);
        let names: Set<string> | null = null;
        if (toks[k]?.t === '{') {
          const close = closing(k);
          names = owner ? owner.names : new Set();
          scanBody(k + 1, close, names, owner?.calls);
          k = close + 1;
        }
        if (owner) add(name, { kind: 'func', static: isStatic, type, params: ps, ...(throws ? { throws } : {}) });
        else file.globals.push({ name, kind: 'func', static: true, type, params: ps, ...(throws ? { throws } : {}), ...(available ? { available } : {}), public: mods.has('public') || mods.has('open'), names: names ?? new Set() });
        continue;
      }
      if (kw === 'init' || kw === 'deinit' || kw === 'subscript') {
        k++;
        let failable = '';
        if (kw === 'init' && (toks[k]?.t === '?' || toks[k]?.t === '!') && toks[k].at === toks[k - 1].end) { failable = toks[k].t; k++; }
        k = skipAngles(k);
        const ps = toks[k]?.t === '(' ? params(k) : [];
        if (toks[k]?.t === '(') k = closing(k) + 1;
        const [after, throws] = effects(k);
        k = after;
        let type = '';
        if (toks[k]?.t === '->') {
          const end = declarationEnd(k + 1, ['{', 'where'], true);
          type = slice(k + 1, end);
          k = end;
        }
        if (toks[k]?.t === 'where') k = declarationEnd(k, ['{']);
        let getterThrows = false;
        if (toks[k]?.t === '{') {
          const close = closing(k);
          if (kw === 'subscript') getterThrows = accessorThrows(k + 1, close);
          if (owner) scanBody(k + 1, close, owner.names, owner.calls);
          k = close + 1;
        }
        if (owner && kw === 'init') add('init', { kind: 'init', static: true, type: owner.name.replace(/<.*$/, '') + (failable === '?' ? '?' : ''), params: ps, ...(throws ? { throws } : {}) });
        if (owner && kw === 'subscript') add('subscript', { kind: 'subscript', static: isStatic, type, params: ps, ...(getterThrows ? { throws: true } : {}) });
        continue;
      }
      if (kw === 'var' || kw === 'let') {
        k++;
        const first = k;
        // A tuple pattern declares no name a type is read by.
        if (toks[k]?.t === '(') { k = declarationEnd(closing(k) + 1, []); continue; }
        for (;;) {
          const name = toks[k]?.t;
          k++;
          let type = '';
          if (toks[k]?.t === ':') {
            const end = declarationEnd(k + 1, ['=', '{', ','], true);
            type = slice(k + 1, end);
            k = end;
          }
          let literal: string | undefined;
          if (toks[k]?.t === '=') {
            const end = declarationEnd(k + 1, [',']);
            if (owner) scanBody(k + 1, end, owner.names, owner.calls);
            if (!type) literal = inferred(k + 1, end);
            k = end;
          }
          let throws = false;
          if (toks[k]?.t === '{') {
            const close = closing(k);
            throws = accessorThrows(k + 1, close);
            if (owner) scanBody(k + 1, close, owner.names, owner.calls);
            k = close + 1;
          }
          const declared = type || literal;
          if (declared && name && /^[A-Za-z_]/.test(name)) {
            if (owner) add(name, { kind: 'var', static: isStatic, type: declared, ...(throws ? { throws } : {}) });
            else file.globals.push({ name, kind: 'var', static: true, type: declared, ...(throws ? { throws } : {}), ...(available ? { available } : {}), public: mods.has('public') || mods.has('open'), names: new Set() });
          }
          if (toks[k]?.t === ',' && k > first) { k++; continue; }
          break;
        }
        continue;
      }
      if (kw === 'typealias') {
        k++;
        const name = toks[k].t;
        if (!owner) file.typealiases.push({ name, access: accessOf(mods) });
        k = skipAngles(k + 1);
        if (toks[k]?.t === '=') {
          const end = declarationEnd(k + 1, [], true);
          if (owner && isPublic) owner.aliases.push([name, slice(k + 1, end)]);
          k = end;
        }
        continue;
      }
      if (kw === 'case' && owner) {
        k++;
        for (;;) {
          const name = toks[k]?.t;
          k++;
          let ps: SwiftParam[] | undefined;
          if (toks[k]?.t === '(') { ps = params(k); k = closing(k) + 1; }
          if (toks[k]?.t === '=') k = declarationEnd(k + 1, [',']);
          // A case is as public as its enum.
          if (name && owner.public) owner.members.push([name, { kind: 'case', static: true, type: owner.name, ...(ps ? { params: ps } : {}), ...(available ? { available } : {}) }]);
          if (toks[k]?.t === ',') { k++; continue; }
          break;
        }
        continue;
      }
      if (kw === 'precedencegroup') { while (k < toks.length && toks[k].t !== '{') k++; k = closing(k) + 1; continue; }
      if (DECL_KEYWORDS.has(kw)) { k = declarationEnd(k + 1, []); continue; }
      // A statement or an expression at a declaration's place (a top-level `if` in a script): passed over.
      if (toks[k].t === '(' || toks[k].t === '[' || toks[k].t === '{') k = closing(k);
      k++;
    }
  };
  /**
   * The type of an untyped stored property's initial value, where the value states it: a literal (`= false`, observers
   * after it or not), a construction (`= Router()`, `= JSConstructor { … }`), or a type's member (`= Schedule.now`).
   */
  const inferred = (from: number, to: number): string | undefined => {
    const t = toks[from], next = toks[from + 1];
    if (!t) return undefined;
    const alone = (j: number) => j === to || toks[j]?.t === '{';
    const literal = t.t === '"' ? 'String' : /^(true|false)$/.test(t.t) ? 'Bool' : /^\d+$/.test(t.t) ? 'Int' : /^\d+\.\d+$/.test(t.t) ? 'Double' : undefined;
    if (literal && alone(from + 1)) return literal;
    if (t.t === '-' && /^\d/.test(next?.t ?? '') && alone(from + 2)) return next.t.includes('.') ? 'Double' : 'Int';
    if (!/^[A-Z]\w*$/.test(t.t)) return undefined;
    let j = from + 1, name = t.t;
    while (toks[j]?.t === '.' && /^[A-Z]/.test(toks[j + 1]?.t ?? '')) { name += '.' + toks[j + 1].t; j += 2; }
    if (toks[j]?.t === '<' && toks[j].at === toks[j - 1].end) { const e = skipAngles(j); name += slice(j, e).replace(/\s+/g, ''); j = e; }
    if (toks[j]?.t === '(' || toks[j]?.t === '{') return name;
    if (toks[j]?.t === '.' && /^[a-z]/.test(toks[j + 1]?.t ?? '') && j + 2 === to) return name;
    return undefined;
  };

  /** Whether an accessor block's getter throws (`get throws { … }`). */
  const accessorThrows = (from: number, to: number): boolean => {
    for (let j = from; j < to; j++) {
      const t = toks[j].t;
      if (t === '(' || t === '[' || t === '{') { j = closing(j); continue; }
      if (t === 'get') {
        for (let x = j + 1; x < to && toks[x].t !== '{'; x++) if (toks[x].t === 'throws') return true;
        return false;
      }
    }
    return false;
  };
  scope(null, false, false);
  return file;
}
