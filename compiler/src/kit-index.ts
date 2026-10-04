import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** A public member of a kit type, as its Swift source declares it. */
export interface KitMember {
  kind: 'var' | 'func' | 'init';
  static: boolean;
  /** The declared Swift type of a property, or the result of a function. */
  type: string;
  /** A function's parameter list as written (labels and types). */
  params?: string;
}

export interface KitType {
  name: string;
  base: string | null;
  members: Map<string, KitMember[]>;
  /** NativeScript property names the type applies by name (the `case` labels of its setProperty and shorthands). */
  props: Set<string>;
  /** The class of the native view a kit view creates (Android: `createNativeView(): NativeView = VerticalScrollView(…)`), fully qualified. */
  native?: string;
}

/**
 * What NativeScriptKit offers translated code, read from its Swift sources:
 * each public type, the type it extends, and its public members. The
 * translator checks @nativescript/core members against it, so an app using
 * something the kit lacks stops with the file and line instead of failing
 * in the Swift compiler.
 */
export function kitIndex(kitSources: string): Map<string, KitType> {
  const types = new Map<string, KitType>();
  const files = (readdirSync(kitSources, { recursive: true }) as string[]).filter((f) => f.endsWith('.swift'));
  // Shorthands (`borderRadius`, `margin`) any view takes, expanded by a top-level function.
  const shorthands = new Set<string>();
  for (const f of files) {
    const text = readFileSync(join(kitSources, f), 'utf8');
    const at = text.indexOf('\nfunc expandShorthand(');
    if (at < 0) continue;
    const body = text.slice(at, text.indexOf('\n}\n', at));
    for (const m of body.matchAll(/^\s*case\s+((?:"\w+"(?:,\s*)?)+):/gm)) for (const n of m[1].matchAll(/"(\w+)"/g)) shorthands.add(n[1]);
  }
  for (const f of files) {
    const text = readFileSync(join(kitSources, f), 'utf8').replace(/\/\/.*$/gm, '');
    const stack: { type: KitType | null; depth: number }[] = [];
    let depth = 0;
    for (const line of text.split('\n')) {
      const decl = /^\s*(?:@\w+\s+)*(?:(?:public|open|final|internal)\s+)*(class|struct|enum|extension|protocol)\s+(\w+)(?:<[^>]*>)?(?:\s*:\s*([\w.]+))?/.exec(line);
      const isPublic = /\b(public|open)\b/.test(line) || decl?.[1] === 'extension';
      if (decl && line.includes('{')) {
        // A nested type is known by its qualified name (`Utils.layout`).
        const outer = decl[1] === 'extension' ? undefined : [...stack].reverse().find((x) => x.type)?.type;
        const name = outer ? `${outer.name}.${decl[2]}` : decl[2];
        let type = types.get(name) ?? null;
        const base = decl[1] === 'class' && decl[3] && !/Protocol$|Convertible$|Equatable|Hashable/.test(decl[3]) ? decl[3] : null;
        if (!type && isPublic) {
          type = { name, base, members: new Map(), props: new Set() };
          types.set(name, type);
        }
        // An extension can come before its class in file order: the class declaration names the base.
        if (type && base) type.base = base;
        stack.push({ type: isPublic ? type : null, depth });
      } else {
        const owner = stack.at(-1);
        const enclosing = [...stack].reverse().find((x) => x.type)?.type;
        if (enclosing && /^\s*case\s+"/.test(line)) for (const m of line.matchAll(/"(\w+)"/g)) enclosing.props.add(m[1]);
        if (owner?.type && depth === owner.depth + 1 && /\b(public|open)\b/.test(line)) {
          const isStatic = /\b(static|class)\s+(func|var|let)\b/.test(line);
          let m: RegExpExecArray | null;
          if ((m = /\b(?:var|let)\s+(\w+)\s*:\s*([^={]+)/.exec(line))) add(owner.type, m[1], { kind: 'var', static: isStatic, type: m[2].trim() });
          // An untyped stored property takes its literal's type.
          else if ((m = /\b(?:var|let)\s+(\w+)\s*=\s*(true|false|"[^"]*"|-?\d+(\.\d+)?)\s*$/.exec(line))) add(owner.type, m[1], { kind: 'var', static: isStatic, type: /^(true|false)$/.test(m[2]) ? 'Bool' : m[2].startsWith('"') ? 'String' : m[3] ? 'Double' : 'Int' });
          else if ((m = /\bfunc\s+`?(\w+)`?\s*(?:<[^>]*>)?\(/.exec(line))) {
            const [params, rest] = parenthesized(line, m.index + m[0].length);
            const ret = /^\s*(?:throws\s*)?(?:->\s*([^{]+))?/.exec(rest)![1];
            add(owner.type, m[1], { kind: 'func', static: isStatic, type: (ret ?? 'Void').trim(), params });
          } else if ((m = /\binit(\??)\s*\(/.exec(line))) add(owner.type, 'init', { kind: 'init', static: true, type: m[1] ? `${owner.type.name}?` : owner.type.name, params: parenthesized(line, m.index + m[0].length)[0] });
        }
      }
      for (const ch of line) {
        if (ch === '{') depth++;
        else if (ch === '}') {
          depth--;
          if (stack.length && stack.at(-1)!.depth === depth) stack.pop();
        }
      }
    }
  }
  for (const n of shorthands) types.get('View')?.props.add(n);
  return types;
}

/** The text up to the parenthesis closing the one before `start`, and the text after it. */
function parenthesized(line: string, start: number): [string, string] {
  let depth = 1;
  for (let i = start; i < line.length; i++) {
    if (line[i] === '(') depth++;
    else if (line[i] === ')' && --depth === 0) return [line.slice(start, i), line.slice(i + 1)];
  }
  return [line.slice(start), ''];
}

function add(type: KitType, name: string, member: KitMember) {
  const list = type.members.get(name) ?? [];
  list.push(member);
  type.members.set(name, list);
}

/** A member of `type` or of a type it extends. */
export function kitMember(index: Map<string, KitType>, type: string, name: string): KitMember | null {
  for (let t = index.get(type); t; t = t.base ? index.get(t.base) : undefined) {
    const found = t.members.get(name);
    if (found) return found[0];
  }
  return null;
}

/** Whether `type` is `base` or extends it. */
export function kitExtends(index: Map<string, KitType>, type: string, base: string): boolean {
  for (let t = index.get(type); t; t = t.base ? index.get(t.base) : undefined) if (t.name === base) return true;
  return false;
}
