import ts from 'typescript';
import type { Translator } from './swift.ts';
import {
  lookupClass, lookupConstant, lookupConstructor, lookupEnum, lookupFunction, lookupInit, lookupMember, lookupStruct, moduleOfDeclaration, nativeTable,
  type NativeMethod, type NativeProperty, type SwiftType,
} from './natives/symbols.ts';

const NUMBERS = new Set(['CGFloat', 'Double', 'Float', 'Float32', 'Float64', 'Int', 'UInt', 'Int8', 'Int16', 'Int32', 'Int64', 'UInt8', 'UInt16', 'UInt32', 'UInt64', 'TimeInterval', 'NSInteger', 'NSUInteger']);
const base = (t: SwiftType) => t.replace(/[?!]$/, '').replace(/^\((.*)\)$/, '$1');
const optional = (t: SwiftType) => /[?!]$/.test(t);
/** The iOS version the app targets: newer APIs need `if #available` the translation cannot add. */
const DEPLOYMENT = 17;

/**
 * Direct calls to iOS APIs, as NativeScript apps write them in TypeScript
 * (`UIImage.systemImageNamed('star')`, `view.layer.cornerRadius = 8`), in
 * their Swift spelling from the module's symbol table (natives/symbols.ts):
 * selectors become Swift names and labels, factories become initializers,
 * enum members become cases, and numbers convert to the CGFloat, Int or
 * enum the Swift API takes.
 */
export class NativeAPI {
  private t: Translator;

  constructor(t: Translator) {
    this.t = t;
  }

  /** The module a native declaration comes from ('UIKit'), or null for anything else. */
  module(decl: ts.Declaration | undefined): string | null {
    return decl ? moduleOfDeclaration(decl.getSourceFile().fileName) : null;
  }

  private symbolModule(sym: ts.Symbol | undefined): { module: string; name: string } | null {
    const decl = sym?.declarations?.[0];
    const module = this.module(decl);
    if (module) this.modules.add(module);
    return module && sym ? { module, name: sym.name } : null;
  }

  /** Modules the program's native declarations come from: where enum types are looked up by their Swift name. */
  private modules = new Set<string>();

  /** The Swift type for a native TypeScript type (a class, protocol, struct or enum), or null. */
  type(t: ts.Type): string | null {
    const sym = t.aliasSymbol ?? t.getSymbol();
    const native = this.symbolModule(sym);
    if (!native) return null;
    const enumOfLiteral = sym!.flags & ts.SymbolFlags.EnumMember ? this.symbolModule((sym as any).parent) : null;
    if (enumOfLiteral) return lookupEnum(enumOfLiteral.module, enumOfLiteral.name)?.swift ?? null;
    if (t.flags & ts.TypeFlags.EnumLike || sym!.flags & ts.SymbolFlags.Enum) return lookupEnum(native.module, native.name)?.swift ?? null;
    if (native.name === 'NSArray' || native.name === 'NSMutableArray') return '[Any]';
    if (native.name === 'NSDictionary' || native.name === 'NSMutableDictionary') return '[AnyHashable: Any]';
    const cls = lookupClass(native.module, native.name);
    if (cls) return cls.kind === 'protocol' ? `any ${cls.swift}` : cls.swift;
    const struct = lookupStruct(native.module, native.name);
    if (struct) return struct.swift;
    return null;
  }

  /** The class or struct a native-typed expression is: its module and JS name. */
  private receiver(e: ts.Expression): { module: string; name: string; isStatic: boolean } | null {
    const c = this.t.checker;
    const sym = this.t.resolve(e);
    if (sym && sym.flags & ts.SymbolFlags.Class) {
      const native = this.symbolModule(sym);
      if (native) return { ...native, isStatic: true };
    }
    const type = c.getNonNullableType(c.getTypeAtLocation(e));
    const native = this.symbolModule(type.getSymbol());
    return native ? { ...native, isStatic: false } : null;
  }

  private checkAvailable(m: { introduced?: string; selector?: string }, e: ts.Node, what: string) {
    if (m.introduced && parseFloat(m.introduced) > DEPLOYMENT) throw this.t.error(e, `${what} (iOS ${m.introduced}; the app targets iOS ${DEPLOYMENT})`);
  }

  // ---- Reads, writes, calls ----------------------------------------------------------------

  /** `x.prop` and `X.classProp` on native types; also enum members (`UIViewContentMode.Center`). */
  property(e: ts.PropertyAccessExpression): string | null {
    const enumCase = this.enumMember(e);
    if (enumCase) return enumCase;
    const r = this.receiver(e.expression);
    if (!r) return null;
    const struct = !r.isStatic && lookupStruct(r.module, r.name);
    if (struct) {
      const field = struct.fields[e.name.text];
      if (!field) throw this.t.error(e, `${r.name}.${e.name.text} (not a field of ${struct.swift})`);
      return this.fromSwift(`${this.t.expr(e.expression)}.${e.name.text}`, field, e);
    }
    const m = lookupMember(r.module, r.name, e.name.text, r.isStatic);
    if (!m) throw this.t.error(e, `${r.name}.${e.name.text} (no Swift counterpart in ${r.module})`);
    this.checkAvailable(m, e, `${r.name}.${e.name.text}`);
    const target = r.isStatic ? lookupClass(r.module, r.name)!.swift : this.t.expr(e.expression);
    if (m.kind === 'property') return this.fromSwift(`${target}.${m.swift}`, m.type, e);
    // A no-argument method read as a property in the d.ts (`UIColor.redColor` is a class property there).
    if (m.kind === 'method' && !m.params.length) return this.fromSwift(`${target}.${m.swift}()`, m.returns, e);
    if (m.kind === 'init' && !m.params.length) return this.fromSwift(`${target}()`, m.returns, e);
    throw this.t.error(e, `${r.name}.${e.name.text} read as a value`);
  }

  private enumMember(e: ts.PropertyAccessExpression): string | null {
    const sym = this.t.resolve(e.expression);
    if (!sym || !(sym.flags & ts.SymbolFlags.Enum)) return null;
    const native = this.symbolModule(sym);
    if (!native) return null;
    const en = lookupEnum(native.module, native.name);
    const c = en?.cases[e.name.text];
    // An option set's zero member has no Swift case: it is the empty set.
    if (en && !c && en.kind === 'options' && this.t.checker.getConstantValue(e) === 0) return `${en.swift}([])`;
    if (!en || !c) throw this.t.error(e, `${native.name}.${e.name.text} (no Swift counterpart)`);
    if (!en.swift) return c.swift;
    return `${en.swift}.${c.swift}`;
  }

  /** `x.prop = value` on a native type. */
  assign(left: ts.PropertyAccessExpression, value: ts.Expression): string | null {
    const r = this.receiver(left.expression);
    if (!r) return null;
    const struct = !r.isStatic && lookupStruct(r.module, r.name);
    if (struct) {
      const field = struct.fields[left.name.text];
      if (!field) throw this.t.error(left, `${r.name}.${left.name.text} (not a field of ${struct.swift})`);
      return `${this.t.expr(left.expression)}.${left.name.text} = ${this.toSwift(value, field)}`;
    }
    const m = lookupMember(r.module, r.name, left.name.text, r.isStatic);
    if (!m || m.kind !== 'property') throw this.t.error(left, `${r.name}.${left.name.text} (no settable Swift property)`);
    if (m.readonly) throw this.t.error(left, `${r.name}.${left.name.text} (read-only)`);
    this.checkAvailable(m, left, `${r.name}.${left.name.text}`);
    const target = r.isStatic ? lookupClass(r.module, r.name)!.swift : this.t.expr(left.expression);
    return `${target}.${m.swift} = ${this.toSwift(value, m.type)}`;
  }

  /** A call of a native method, class method, `alloc().initWith…()`, `new()`, or global function. */
  call(e: ts.CallExpression): string | null {
    const callee = e.expression;
    if (ts.isIdentifier(callee)) {
      const native = this.symbolModule(this.t.resolve(callee));
      if (!native) return null;
      // Swift manages Core Foundation memory: retain and release calls go away.
      if (/^CF(Retain|Release|Autorelease)$|^CG\w+(Retain|Release)$/.test(native.name)) return e.arguments[0] ? this.t.expr(e.arguments[0]) : '()';
      const f = lookupFunction(native.module, native.name);
      if (!f) throw this.t.error(e, `${native.name}() (no Swift counterpart in ${native.module})`);
      this.checkAvailable(f, e, `${native.name}()`);
      const args = [...e.arguments];
      if (f.kind === 'property') return this.fromSwift(`${this.t.expr(args[f.self!])}.${f.swift}`, f.returns, e);
      if (f.kind === 'staticProperty') return this.fromSwift(`${f.owner}.${f.swift}`, f.returns, e);
      const self = f.self !== undefined ? args.splice(f.self, 1)[0] : undefined;
      const list = this.argList(args, f.labels, f.params);
      const code = f.kind === 'init' ? `${f.owner}(${list})`
        : f.kind === 'method' ? `${this.t.expr(self!)}.${f.swift}(${list})`
        : f.kind === 'staticMethod' ? `${f.owner}.${f.swift}(${list})`
        : `${f.swift}(${list})`;
      return this.fromSwift(code, f.returns, e);
    }
    if (!ts.isPropertyAccessExpression(callee)) return null;
    const name = callee.name.text;
    // `X.alloc().initWithFrame(r)`, `X.alloc().init()`
    if (ts.isCallExpression(callee.expression) && ts.isPropertyAccessExpression(callee.expression.expression) && callee.expression.expression.name.text === 'alloc') {
      const r = this.receiver(callee.expression.expression.expression);
      if (!r) return null;
      const cls = lookupClass(r.module, r.name)!;
      if (name === 'init') return `${cls.swift}()`;
      const init = lookupInit(r.module, r.name, name);
      if (!init) throw this.t.error(e, `${r.name}.alloc().${name}() (no Swift initializer)`);
      return this.fromSwift(`${cls.swift}(${this.argList([...e.arguments], init.labels, init.params)})`, init.returns, e);
    }
    const r = this.receiver(callee.expression);
    if (!r) return null;
    const cls = lookupClass(r.module, r.name);
    if (r.isStatic && name === 'new' && cls) return `${cls.swift}()`;
    if (r.isStatic && name === 'alloc') throw this.t.error(e, `${r.name}.alloc() without an init`);
    if (!r.isStatic && name === 'objectForKeyedSubscript') return this.fromSwift(`${this.t.expr(callee.expression)}[${this.t.expr(e.arguments[0])}]`, 'Any?', e);
    if (!r.isStatic && name === 'setObjectForKeyedSubscript') return `${this.t.expr(callee.expression)}[${this.t.expr(e.arguments[1])}] = ${this.t.expr(e.arguments[0])}`;
    const m = lookupMember(r.module, r.name, name, r.isStatic);
    if (!m) {
      // `o.setX(v)` for a property `x` the d.ts also lists as a method.
      const setter = /^set([A-Z]\w*)$/.exec(name);
      const prop = setter && e.arguments.length === 1 ? lookupMember(r.module, r.name, setter[1][0].toLowerCase() + setter[1].slice(1), r.isStatic) : null;
      if (prop && prop.kind === 'property') return `${r.isStatic ? lookupClass(r.module, r.name)!.swift : this.t.expr(callee.expression)}.${prop.swift} = ${this.toSwift(e.arguments[0], prop.type)}`;
      throw this.t.error(e, `${r.name}.${name}() (no Swift counterpart in ${r.module})`);
    }
    this.checkAvailable(m, e, `${r.name}.${name}()`);
    // An Objective-C method Swift imports as a property.
    if (m.kind === 'property') return this.fromSwift(`${r.isStatic ? lookupClass(r.module, r.name)!.swift : this.t.expr(callee.expression)}.${m.swift}`, m.type, e);
    const args = [...e.arguments];
    if (m.errorParam !== undefined) args.splice(m.errorParam, 1);
    const list = this.argList(args, m.labels, m.params);
    const target = r.isStatic ? cls!.swift : this.t.expr(callee.expression);
    const code = m.kind === 'init' ? `${target}(${list})` : `${target}.${m.swift}(${list})`;
    return this.fromSwift(code, m.returns, e);
  }

  /** `new UIView()`, `new UIView({ frame })`. */
  construct(e: ts.NewExpression): string | null {
    const r = this.receiver(e.expression);
    if (!r || !r.isStatic) return null;
    const cls = lookupClass(r.module, r.name);
    if (!cls) throw this.t.error(e, `new ${r.name} (no Swift class)`);
    const args = e.arguments ?? ts.factory.createNodeArray();
    if (!args.length) return `${cls.swift}()`;
    const o = args[0];
    if (args.length !== 1 || !ts.isObjectLiteralExpression(o)) throw this.t.error(e, `new ${r.name} with arguments other than one object literal`);
    const keys = o.properties.map((p) => p.name!.getText());
    const init = lookupConstructor(r.module, r.name, keys);
    if (!init) throw this.t.error(e, `new ${r.name}({ ${keys.join(', ')} }) (no Swift initializer)`);
    const values = keys.map((k) => {
      const p = o.properties.find((x) => x.name!.getText() === k)!;
      return ts.isPropertyAssignment(p) ? p.initializer : (p as ts.ShorthandPropertyAssignment).name;
    });
    return this.fromSwift(`${cls.swift}(${this.argList(values, init.labels, init.params)})`, init.returns, e);
  }

  /** A native constant or enum-like global (`UIFontWeightBold`), or null. */
  identifier(e: ts.Identifier): string | null {
    const sym = this.t.resolve(e);
    const native = this.symbolModule(sym);
    if (!native || !(sym!.flags & ts.SymbolFlags.Variable)) return null;
    const k = lookupConstant(native.module, native.name);
    if (!k) throw this.t.error(e, `${native.name} (no Swift counterpart in ${native.module})`);
    return this.fromSwift(k.swift, k.type, e);
  }

  /** An object literal for a native struct (`{ origin: { x: 0, y: 0 }, size }` as a CGRect). */
  structLiteral(e: ts.ObjectLiteralExpression, type: ts.Type): string | null {
    const native = this.symbolModule(type.getSymbol());
    const struct = native && lookupStruct(native.module, native.name);
    if (!struct) return null;
    const args = Object.entries(struct.fields).map(([name, ft]) => {
      const p = e.properties.find((x) => x.name?.getText() === name);
      if (!p) throw this.t.error(e, `${native!.name} literal without ${name}`);
      const v = ts.isPropertyAssignment(p) ? p.initializer : (p as ts.ShorthandPropertyAssignment).name;
      return `${name}: ${this.toSwift(v, ft)}`;
    });
    return `${struct.swift}(${args.join(', ')})`;
  }

  // ---- Conversions --------------------------------------------------------------------------

  private argList(args: readonly ts.Expression[], labels: (string | null)[], params: SwiftType[]): string {
    const out: string[] = [];
    let next = 0;
    params.forEach((type, k) => {
      const label = labels[k];
      // A `()` parameter (`init(toMemory: ())`) takes no JavaScript argument.
      const value = type === '()' ? '()' : next < args.length ? this.toSwift(args[next++], type) : null;
      if (value !== null) out.push(label ? `${label}: ${value}` : value);
    });
    for (; next < args.length; next++) out.push(this.t.expr(args[next]));
    return out.join(', ');
  }

  /** A TypeScript value where a Swift API takes `target`. */
  toSwift(e: ts.Expression, target: SwiftType): string {
    const t = this.t;
    if (e.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(e) && e.text === 'undefined')) return 'nil';
    const b = base(target);
    if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) return this.block(e, target);
    const source = t.typeOf(e);
    if (NUMBERS.has(b)) {
      if (source === 'Double' && b !== 'Double' && b !== 'TimeInterval') return ts.isNumericLiteral(e) ? t.expr(e) : `${b}(${t.expr(e)})`;
      return t.expr(e);
    }
    if (source === 'Double' && this.isEnumType(b)) {
      // A number where Swift takes an enum or option set: its raw value.
      const raw = this.rawTypeOf(b);
      return `${b}(rawValue: ${raw}(${t.expr(e)}))${this.isOptionSet(b) ? '' : '!'}`;
    }
    if (source.startsWith('JSArray<') && b.startsWith('[')) return `${t.expr(e)}.storage`;
    return t.expr(e);
  }

  /** A Swift API's value as TypeScript reads it: numbers are Double, an implicitly unwrapped or optional object is the object. */
  fromSwift(code: string, swiftType: SwiftType, e: ts.Expression): string {
    const tsType = this.t.typeOf(e);
    const b = base(swiftType);
    if (NUMBERS.has(b) && tsType.replace(/\?$/, '') === 'Double') {
      if (b === 'Double' || b === 'TimeInterval') return optional(swiftType) && !tsType.endsWith('?') ? `${code}!` : code;
      return optional(swiftType) ? `${code}.map { Double($0) }${tsType.endsWith('?') ? '' : '!'}` : `Double(${code})`;
    }
    if (this.isEnumType(b) && tsType === 'Double') return `Double(${code}.rawValue)`;
    if (b.startsWith('[') && tsType.startsWith('JSArray<')) return `JSArray(${code}${optional(swiftType) ? ' ?? []' : ''})`;
    if (swiftType.endsWith('?') && !tsType.endsWith('?') && tsType !== 'Any?') return `${code}!`;
    return code;
  }

  /** A TypeScript closure passed as an Objective-C block: Swift parameter types in, TypeScript's inside. */
  private block(fn: ts.ArrowFunction | ts.FunctionExpression, target: SwiftType): string {
    const t = this.t;
    const sig = /^\(?\(?(?:@escaping\s*)?\((.*)\)\s*(?:throws\s*)?->\s*(.+?)\)?\??$/.exec(target.trim());
    if (!sig) return t.expr(fn);
    const params = sig[1].trim() ? splitTypes(sig[1]) : [];
    const names = fn.parameters.map((p, k) => (ts.isIdentifier(p.name) ? p.name.text : `__p${k}`));
    const swiftParams = params.map((p, k) => `__b${k}: ${p}`);
    const binds = params.map((p, k) => (names[k] ? `let ${names[k]}: ${t.typeOf(fn.parameters[k].name)} = ${this.blockParam(`__b${k}`, p, t.typeOf(fn.parameters[k].name))}` : '')).filter(Boolean);
    const body = t.closure(fn);
    const throws = t.throwsInfo.fn(fn);
    const call = `(${body})(${names.map((n) => n).join(', ')})`;
    const ret = sig[2].trim();
    const inner = ret === 'Void' ? (throws ? `jsReport { try ${call} }` : `${call}`) : `${throws ? 'try! ' : ''}${call}`;
    return `{ (${swiftParams.join(', ')}) -> ${ret} in ${binds.join('; ')}${binds.length ? '; ' : ''}${ret === 'Void' ? inner : `return ${inner}`} }`;
  }

  private blockParam(code: string, swiftType: SwiftType, tsType: string): string {
    const b = base(swiftType);
    if (NUMBERS.has(b) && tsType === 'Double') return b === 'Double' ? code : `Double(${code})`;
    if (optional(swiftType) && !tsType.endsWith('?') && tsType !== 'Any?') return `${code}!`;
    return code;
  }

  private enumTypes = new Map<string, { raw: string; options: boolean } | null>();

  isEnumType(swift: string): boolean {
    return !!this.enumInfo(swift);
  }

  private isOptionSet(swift: string): boolean {
    return this.enumInfo(swift)?.options ?? false;
  }

  private rawTypeOf(swift: string): string {
    return this.enumInfo(swift)?.raw ?? 'Int';
  }

  /** A native enum or option set by its Swift name, from the modules the program uses. */
  private enumInfo(swift: string): { raw: string; options: boolean } | null {
    if (!this.modules.size || !/^[A-Z][\w.]*$/.test(swift) || /^(Double|String|Bool|Void|Never|Signal|Emitter|EventData|Router)$|^JS/.test(swift)) return null;
    if (!this.enumTypes.has(swift)) {
      let found: { raw: string; options: boolean } | null = null;
      for (const m of this.modules) {
        const e = Object.values(nativeTable(m).enums).find((x) => x.swift === swift && x.kind !== 'typedConstants');
        if (e) { found = { raw: e.raw, options: e.kind === 'options' }; break; }
      }
      this.enumTypes.set(swift, found);
    }
    return this.enumTypes.get(swift) ?? null;
  }
}

function splitTypes(text: string): string[] {
  const out: string[] = [];
  let depth = 0, start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if ('([<'.includes(ch)) depth++;
    else if (')]>'.includes(ch) && text[i - 1] !== '-') depth--;
    else if (ch === ',' && depth === 0) { out.push(text.slice(start, i).trim()); start = i + 1; }
  }
  out.push(text.slice(start).trim());
  return out.filter(Boolean);
}

export type { NativeMethod, NativeProperty };
