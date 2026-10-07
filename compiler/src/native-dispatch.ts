import ts from 'typescript';
import { lookupClass, lookupInit, nativeTable, type NativeClass, type NativeMethod, type NativeProperty, type SwiftType } from './natives/symbols.ts';

/**
 * Native objects script holds untyped (`declare var NSCCanvas: any`,
 * `this._canvas.create2DContext(…)`): NativeScript's runtime finds the
 * member by name in its metadata when the call runs. A compiled app has the
 * same metadata at build time: for each member name script uses on an untyped
 * value, the Swift that calls that member on each plugin class having it,
 * chosen by the object's class when the call runs. A name no class has is
 * left to the runtime's dynamic lookup.
 */

/** How script uses a member name on untyped values. */
export interface UntypedUse { get: boolean; set: boolean; arities: Set<number> }

/** The member names script reads, writes and calls on `any` values in these files. */
export function untypedMembers(checker: ts.TypeChecker, files: readonly ts.SourceFile[]): Map<string, UntypedUse> {
  const uses = new Map<string, UntypedUse>();
  const use = (name: string) => uses.get(name) ?? uses.set(name, { get: false, set: false, arities: new Set() }).get(name)!;
  const untyped = (e: ts.Expression) => !!(checker.getTypeAtLocation(e).flags & ts.TypeFlags.Any);
  const visit = (n: ts.Node): void => {
    if (ts.isPropertyAccessExpression(n) && untyped(n.expression)) {
      const u = use(n.name.text);
      const parent = n.parent;
      if (ts.isCallExpression(parent) && parent.expression === n) u.arities.add(parent.arguments.length);
      else if (ts.isBinaryExpression(parent) && parent.left === n && parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) u.set = true;
      else u.get = true;
    }
    ts.forEachChild(n, visit);
  };
  for (const f of files) if (!f.isDeclarationFile) visit(f);
  return uses;
}

interface Candidate { js: string; cls: NativeClass; depth: number }

/** The Swift source of `__NativeDispatch`, or null when no plugin class has a member script uses untyped. */
export function nativeDispatch(modules: string[], uses: Map<string, UntypedUse>, deploymentTarget: string): string | null {
  const candidates: Candidate[] = [];
  for (const module of modules) {
    for (const [js, cls] of Object.entries(nativeTable(module).classes)) {
      if (cls.kind !== 'class' || cls.extension || cls.module !== module) continue;
      let depth = 0;
      for (let b = cls.base; b; b = lookupClass(module, b)?.base) depth++;
      candidates.push({ js, cls, depth });
    }
  }
  // A subclass's member before the one it inherits.
  candidates.sort((a, b) => b.depth - a.depth || a.js.localeCompare(b.js));
  const gets: string[] = [], sets: string[] = [], calls: string[] = [];
  const guarded = (introduced: string | undefined, code: string) => introduced && newer(introduced, deploymentTarget) ? `if #available(iOS ${introduced}, *) { ${code} }` : code;
  for (const [name, u] of [...uses].sort(([a], [b]) => a.localeCompare(b))) {
    const get: string[] = [], set: string[] = [], call: string[] = [];
    for (const { js, cls } of candidates) {
      for (const isStatic of [false, true]) {
        // The class's own members: what it inherits from the SDK's classes the runtime's lookup by name answers.
        const own = isStatic ? cls.static : cls.instance;
        const m = Object.hasOwn(own, name) ? own[name] : null;
        if (!m) continue;
        const self = isStatic ? `let o = object as? ${cls.swift}.Type` : `let o = object as? ${cls.swift}`;
        if (m.kind === 'property') {
          const p = m as NativeProperty;
          if (u.get) get.push(guarded(p.introduced, `if ${self} { return .some(${fromNative(`o.${p.swift}`, p.type)}) }`));
          const value = !p.readonly && u.set ? toNative('value', p.type) : null;
          if (value) set.push(guarded(p.introduced, `if ${self} { o.${p.swift} = ${value}; return true }`));
          continue;
        }
        const method = m as NativeMethod;
        if (method.kind !== 'method') continue;
        const given = method.params.length - (method.errorParam === undefined ? 0 : 1);
        if (!u.arities.has(given)) continue;
        const args = argumentList(method);
        if (args === null) continue;
        const invoke = `${method.throws ? 'try ' : ''}o.${method.swift}(${args})`;
        call.push(guarded(method.introduced, `if ${self}, arguments.count == ${given} { ${method.returns === 'Void' ? `${invoke}; return .some(nil)` : `return .some(${fromNative(invoke, method.returns)})`} }`));
      }
      // `Cls.alloc().initWithFrame(rect)`: the class's initializer, on what `alloc` gave.
      if (/^init([A-Z]|$)/.test(name)) {
        const init = name === 'init' ? null : lookupInit(cls.module, js, name);
        const given = init ? init.params.length - (init.errorParam === undefined ? 0 : 1) : 0;
        if (init && u.arities.has(given)) {
          const args = argumentList(init);
          if (args !== null) call.push(guarded(init.introduced, `if let a = object as? JSNativeAllocation, a.cls == ${cls.swift}.self { return .some(${init.throws ? 'try ' : ''}${cls.swift}(${args})) }`));
        }
      }
    }
    const lit = JSON.stringify(name);
    if (get.length) gets.push(`        case ${lit}:\n${get.map((g) => `            ${g}\n`).join('')}`);
    if (set.length) sets.push(`        case ${lit}:\n${set.map((g) => `            ${g}\n`).join('')}`);
    if (call.length) calls.push(`        case ${lit}:\n${call.map((g) => `            ${g}\n`).join('')}`);
  }
  if (!gets.length && !sets.length && !calls.length) return null;
  const fn = (signature: string, cases: string[], miss: string) => `    static func ${signature} {
        switch key {
${cases.join('')}        default: break
        }
        return ${miss}
    }
`;
  return `enum __NativeDispatch {
    static func install() {
        JSNativeDispatch.get = get
        JSNativeDispatch.set = set
        JSNativeDispatch.call = call
    }

${fn('get(_ object: AnyObject, _ key: String) -> Any??', gets, 'nil')}
${fn('set(_ object: AnyObject, _ key: String, _ value: Any?) -> Bool', sets, 'false')}
${fn('call(_ object: AnyObject, _ key: String, _ arguments: [Any?]) throws -> Any??', calls, 'nil')}}
`;
}

/** A method's arguments from the call's, or null when one of its parameters takes nothing script can give (a block). */
function argumentList(m: NativeMethod): string | null {
  const out: string[] = [];
  let k = 0;
  for (let i = 0; i < m.params.length; i++) {
    if (i === m.errorParam) continue;
    const value = toNative(`jsArg(arguments, ${k++})`, m.params[i]);
    if (value === null) return null;
    out.push(`${m.labels[i] ? `${m.labels[i]}: ` : ''}${value}`);
  }
  return out.join(', ');
}

const INTEGERS = new Set(['Int', 'Int8', 'Int16', 'Int32', 'Int64', 'UInt', 'UInt8', 'UInt16', 'UInt32', 'UInt64']);
const FLOATS = new Set(['Float', 'CGFloat', 'Double']);
const STRUCTS = new Set(['CGRect', 'CGSize', 'CGPoint', 'UIEdgeInsets']);

/** Script's value as a native parameter of this type, as the runtime marshals it; null for a type it cannot marshal here. */
function toNative(code: string, type: SwiftType): string | null {
  const optional = /[?!]$/.test(type);
  const t = type.replace(/[?!]$/, '');
  if (/->/.test(t)) return null;
  let value: string;
  if (t === 'String') value = `jsToString(${code})`;
  else if (t === 'Bool' || t === 'ObjCBool') value = `jsTruthy(${code})`;
  else if (INTEGERS.has(t)) value = `jsNativeIntegerArgument(${code}, ${t}.self)`;
  else if (FLOATS.has(t)) value = `${t}(jsNativeNumber(jsToNumber(${code})))`;
  else if (STRUCTS.has(t)) value = `(jsNativeStruct(${code}, ${t}.self) ?? ${t}())`;
  else if (t === 'UnsafeRawPointer') value = `jsNativeBytes(${code})!`;
  else if (t === 'UnsafeMutableRawPointer') value = `UnsafeMutableRawPointer(mutating: jsNativeBytes(${code})!)`;
  else if (/^Unsafe(Mutable)?Pointer<\w+>$/.test(t)) {
    const element = /<(\w+)>/.exec(t)![1];
    const raw = `jsNativeBytes(${code})!.assumingMemoryBound(to: ${element}.self)`;
    value = t.startsWith('UnsafeMutable') ? `UnsafeMutablePointer(mutating: ${raw})` : raw;
  } else if (/^Unsafe/.test(t) || /^\(/.test(t)) return null;
  else if (t === 'Any' || t === 'AnyObject') value = `jsToNative(${code}) as ${t}`;
  else value = `(jsToNative(${code}) as${optional ? '?' : '!'} ${t})`;
  if (!optional) return value;
  return /\bas\? /.test(value) ? value : `(jsIsNullish(${code}) ? nil : ${value})`;
}

/** A native result as script reads it. */
function fromNative(code: string, type: SwiftType): string {
  const t = type.replace(/[?!]$/, '');
  const optional = /[?!]$/.test(type);
  if (INTEGERS.has(t) || FLOATS.has(t)) return optional ? `(${code}).map { Double($0) } as Any?` : `Double(${code}) as Any?`;
  if (t === 'String' || t === 'Bool') return `${code} as Any?`;
  return `jsFromNative(${code})`;
}

function newer(version: string, than: string): boolean {
  const a = version.split('.').map(Number), b = than.split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) > (b[i] ?? 0);
  return false;
}
