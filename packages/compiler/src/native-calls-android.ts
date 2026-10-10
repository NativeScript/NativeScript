import ts from 'typescript';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { functionTypeParts, ident, kotlinString, numberLiteral, optionalType, type KotlinNative, type Translator } from './kotlin.ts';
import {
  ACC_ABSTRACT, ACC_BRIDGE, ACC_ENUM, ACC_FINAL, ACC_INTERFACE, ACC_PRIVATE, ACC_PROTECTED, ACC_PUBLIC, ACC_STATIC, ACC_SYNTHETIC, ACC_VARARGS,
  ClassPath, androidJar, javaTypeName, methodTypes, newer, signatureTypes, type JavaClass, type JavaMember,
} from './natives/classfiles.ts';
import { KIT_ANDROID } from './paths.ts';

/** The SDK the generated Gradle project compiles against (android.ts). */
const COMPILE_SDK = 36;
const KIT_GRADLE = join(KIT_ANDROID, 'build.gradle.kts');

/**
 * The classpath translated code is checked against: android.jar, core's widgets AAR, the plugins'
 * archives, and androidx at the versions Gradle resolves: the highest the kit or a plugin asks for.
 */
export function androidClassPath(widgetsAar: string | null, plugins?: { archives: string[]; dependencies: { coords: string }[] }): ClassPath {
  const pinned = new Map<string, string>();
  const pin = (artifact: string, version: string) => { if (!pinned.has(artifact) || newer(version, pinned.get(artifact)!)) pinned.set(artifact, version); };
  if (existsSync(KIT_GRADLE)) for (const m of readFileSync(KIT_GRADLE, 'utf8').matchAll(/"(androidx\.[\w.]+):([\w.-]+):([\w.-]+)"/g)) pin(`${m[1]}:${m[2]}`, m[3]);
  for (const d of plugins?.dependencies ?? []) { const [group, artifact, version] = d.coords.split(':'); if (version) pin(`${group}:${artifact}`, version); }
  return new ClassPath([androidJar(COMPILE_SDK), ...(widgetsAar ? [widgetsAar] : []), ...(plugins?.archives ?? [])], pinned);
}

const NUMERIC = new Set(['B', 'S', 'I', 'J', 'F', 'D']);
const KOTLIN_PRIMITIVE: Record<string, string> = { Z: 'Boolean', B: 'Byte', C: 'Char', S: 'Short', I: 'Int', J: 'Long', F: 'Float', D: 'Double', V: 'Unit' };
const CONVERT: Record<string, string> = { B: '.toInt().toByte()', S: '.toInt().toShort()', I: '.toInt()', J: '.toLong()', F: '.toFloat()', D: '' };
const ARRAY_OF: Record<string, string> = { Z: 'boolean', B: 'byte', C: 'char', S: 'short', I: 'int', J: 'long', F: 'float', D: 'double' };
/** A JavaScript number's preference among numeric parameter types, as NativeScript's runtime ranks them for a whole number. */
const NUMBER_RANK: Record<string, number> = { I: 0, J: 1, F: 2, D: 3, S: 4, B: 5 };
const BOXED_NUMBERS = new Set(['java/lang/Integer', 'java/lang/Long', 'java/lang/Float', 'java/lang/Double', 'java/lang/Short', 'java/lang/Byte', 'java/lang/Number']);
/** Java methods Kotlin reads as its own members (`CharSequence.length()` is `length`): interface, name and descriptor → Kotlin. */
const KOTLIN_MAPPED: Record<string, string> = {
  'java/lang/CharSequence.length()I': '.length', 'java/lang/CharSequence.charAt(I)C': '.get',
  'java/util/Collection.size()I': '.size', 'java/util/Map.size()I': '.size', 'java/util/Collection.toArray()[Ljava/lang/Object;': '.toTypedArray',
  'java/util/Map.keySet()Ljava/util/Set;': '.keys', 'java/util/Map.values()Ljava/util/Collection;': '.values', 'java/util/Map.entrySet()Ljava/util/Set;': '.entries',
  'java/util/Map$Entry.getKey()Ljava/lang/Object;': '.key', 'java/util/Map$Entry.getValue()Ljava/lang/Object;': '.value',
  'java/lang/Number.intValue()I': '.toInt', 'java/lang/Number.longValue()J': '.toLong', 'java/lang/Number.floatValue()F': '.toFloat',
  'java/lang/Number.doubleValue()D': '.toDouble', 'java/lang/Number.shortValue()S': '.toShort', 'java/lang/Number.byteValue()B': '.toByte',
  'java/lang/Enum.ordinal()I': '.ordinal', 'java/lang/Enum.name()Ljava/lang/String;': '.name',
  'java/lang/Throwable.getMessage()Ljava/lang/String;': '.message', 'java/lang/Throwable.getCause()Ljava/lang/Throwable;': '.cause',
  'java/lang/Object.getClass()Ljava/lang/Class;': '.javaClass',
};
/** Java collection interfaces Kotlin reads as its own: a value Java returns is not assignable to the Java name. */
const KOTLIN_COLLECTIONS: Record<string, string> = {
  'java/util/List': 'MutableList', 'java/util/Collection': 'MutableCollection', 'java/util/Set': 'MutableSet', 'java/util/Map': 'MutableMap',
  'java/util/Map$Entry': 'MutableMap.MutableEntry', 'java/util/Iterator': 'MutableIterator', 'java/lang/Iterable': 'MutableIterable',
};
const ANDROID_TYPINGS = /[\\/]@nativescript[\\/]types-android[\\/]|[\\/]node_modules[\\/](?:@[^\\/]+[\\/])?[^\\/]*android[^\\/]*[\\/].*\.d\.ts$/i;

type Kind =
  | { kind: 'number'; literal?: number; forced?: string }
  | { kind: 'string'; literal?: string }
  | { kind: 'boolean' | 'null' | 'any' | 'other' }
  | { kind: 'array'; elem: Kind }
  | { kind: 'object'; classes: string[] };

/** A Java method or constructor; `fixed` when a varargs call passes its last parameter's elements one by one after that many arguments. */
interface Callable { m: JavaMember; params: string[]; ret: string; fixed?: number }
/** A Java class NativeScript's `Base.extend({ … })` makes, as the Kotlin class `name` declared where `owner` is. */
interface Extension { call: ts.CallExpression; literal: ts.ObjectLiteralExpression; base: JavaClass; interfaces: JavaClass[]; owner: ts.VariableDeclaration | null; name: string; javaName?: string }
/** Java code and its Java type; `nullable` when it is annotated `@Nullable` and so typed `T?` in Kotlin. */
interface Raw { code: string; desc: string; optional?: boolean; nullable?: boolean; script?: boolean }

/**
 * Direct calls to Android APIs, as NativeScript apps write them in TypeScript
 * (`new android.content.Intent(android.content.Intent.ACTION_SEND)`,
 * `canvas.drawLine(0, 0, w, h, paint)`), as Kotlin calling Java: the name is
 * the class's dotted name, the overload is chosen from the class files by the
 * arguments' TypeScript types, and numbers convert to the Java primitive the
 * parameter takes and back to Double. Interfaces implemented from object
 * literals become object expressions, and `@NativeClass()` classes extending
 * a Java class become Kotlin subclasses overriding with Java's signatures.
 */
export class AndroidNativeAPI implements KotlinNative {
  private t: Translator;
  readonly classpath: ClassPath;
  private symbols = new Map<ts.Symbol, JavaClass | null>();

  constructor(t: Translator, classpath: ClassPath) {
    this.t = t;
    this.classpath = classpath;
  }

  /** Typings files plugins keep beside their source (`typings/android.d.ts`), declaring their Java classes. */
  readonly pluginTypings = new Set<string>();

  isNativeDeclaration(d: ts.Node): boolean {
    const file = d.getSourceFile().fileName;
    return ANDROID_TYPINGS.test(file) || this.pluginTypings.has(file);
  }

  isValueType(_t: string): boolean {
    return false;
  }

  // ---- Classes and types -----------------------------------------------------------------------

  private isNativeSymbol(sym: ts.Symbol | undefined): boolean {
    const d = sym?.declarations?.[0];
    return !!d && this.isNativeDeclaration(d);
  }

  /** The Java class a native TypeScript class symbol declares (`android.view.View.OnClickListener` → `android/view/View$OnClickListener`). */
  private classOf(sym: ts.Symbol | undefined, where?: ts.Node): JavaClass | null {
    // A member of an enum the typings declare (`GridUnitType.auto`) is a constant of that Java enum.
    if (sym && sym.flags & ts.SymbolFlags.EnumMember) sym = (sym as ts.Symbol & { parent?: ts.Symbol }).parent;
    if (!sym || !(sym.flags & (ts.SymbolFlags.Class | ts.SymbolFlags.Enum)) || !this.isNativeSymbol(sym)) return null;
    if (!this.symbols.has(sym)) {
      const segs = this.t.checker.getFullyQualifiedName(sym).split('.');
      let found: JavaClass | null = null;
      for (let k = segs.length - 1; k >= 1 && !found; k--) found = this.classpath.get(`${segs.slice(0, k).join('/')}/${segs.slice(k).join('$')}`);
      this.symbols.set(sym, found);
      // Library mode: a type core's code names that no Android version has (`View.androidviewViewAccessibilityDelegate`), untyped.
      if (!found && this.t.library) return null;
      if (!found) throw this.t.error(where, `${segs.join('.')} (no class file on the classpath: android.jar, the widgets AAR, androidx in the Gradle cache)`);
    }
    return this.symbols.get(sym)!;
  }

  private kotlinName(internal: string): string {
    if (internal === 'java/lang/Object') return 'Any';
    if (internal === 'java/lang/String') return 'String';
    if (internal === 'java/lang/CharSequence') return 'CharSequence';
    return internal.replace(/[/$]/g, '.');
  }

  /** A class as Kotlin names its type (static members keep the Java name: `java.util.List.of`). */
  private kotlinTypeName(internal: string): string {
    return KOTLIN_COLLECTIONS[internal] ?? this.kotlinName(internal);
  }

  private typeParamCount(c: JavaClass | null): number {
    const sig = c?.signature;
    if (!sig?.startsWith('<')) return 0;
    let depth = 0, count = 0;
    for (let i = 0; i < sig.length; i++) {
      const ch = sig[i];
      if (ch === '<') depth++;
      else if (ch === '>') { if (--depth === 0) break; }
      else if (depth === 1 && ch === ':' && sig[i - 1] !== ':' && /[\w$]/.test(sig[i - 1])) count++;
    }
    return count;
  }

  /** A class as a Kotlin type: its dotted name, with type arguments from TypeScript's (or `star`) when it is generic. */
  private classRef(c: JavaClass, args: readonly ts.Type[] | undefined, star: string, where?: ts.Node, asType = false): string {
    const n = this.typeParamCount(c);
    const name = asType ? this.kotlinTypeName(c.name) : this.kotlinName(c.name);
    if (!n) return name;
    const bounds = this.typeParamBounds(c);
    // An untyped argument (a plugin's own type parameter) is the parameter's bound, which any argument satisfies.
    const given = (args ?? []).slice(0, n).map((a, k) => {
      const t = this.t.type(a, where);
      // `java.lang.Class<any>`: what `forName`, `getClass` give, of no class Kotlin knows.
      if (asType && t === 'Any?' && c.name === 'java/lang/Class') return '*';
      return t === 'Any?' && bounds[k] ? bounds[k]! : t;
    });
    while (given.length < n) given.push(star === 'Any?' && bounds[given.length] ? bounds[given.length]! : star);
    return `${name}<${given.join(', ')}>`;
  }

  /** The names of a generic class's type parameters, in order. */
  private typeParamNames(c: JavaClass): string[] {
    const sig = c.signature;
    if (!sig?.startsWith('<')) return [];
    const names: string[] = [];
    let depth = 0;
    let start = 1;
    for (let i = 1; i < sig.length; i++) {
      const ch = sig[i];
      if (ch === '<') depth++;
      else if (ch === '>') { if (depth === 0) break; depth--; }
      else if (ch === ':' && depth === 0 && start >= 0) { names.push(sig.slice(start, i)); start = -1; }
      else if (ch === ';' && depth === 0 && sig[i + 1] !== ':') start = i + 1;
    }
    return names;
  }

  /** Each type parameter's bound as a Kotlin type with star arguments (`<T:Lcom/…/GestureHandler;>` → `GestureHandler<*>`), or null for Object. */
  private typeParamBounds(c: JavaClass): (string | null)[] {
    const sig = c.signature;
    if (!sig?.startsWith('<')) return [];
    const out: (string | null)[] = [];
    let i = 1;
    while (sig[i] !== '>') {
      while (sig[i] !== ':') i++;
      i++;
      if (sig[i] === ':') i++;
      let depth = 0;
      const start = i;
      while (depth > 0 || sig[i] !== ';') { if (sig[i] === '<') depth++; else if (sig[i] === '>') depth--; i++; }
      const bound = sig.slice(start, i + 1);
      i++;
      while (sig[i] === ':') {
        i++;
        let d = 0;
        while (d > 0 || sig[i] !== ';') { if (sig[i] === '<') d++; else if (sig[i] === '>') d--; i++; }
        i++;
      }
      const internal = bound.replace(/<.*>/, '').slice(1, -1);
      if (internal === 'java/lang/Object') { out.push(null); continue; }
      const cls = this.classpath.get(internal);
      const params = cls ? this.typeParamCount(cls) : 0;
      out.push(`${this.kotlinTypeName(internal)}${params ? `<${Array(params).fill('*').join(', ')}>` : ''}`);
    }
    return out;
  }

  type(t: ts.Type): string | null {
    if (t.isUnion()) {
      const parts = t.types.filter((u) => !(u.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null | ts.TypeFlags.Void)));
      const common = this.commonClass(parts);
      return common ? this.kotlinTypeName(common) : null;
    }
    const sym = t.aliasSymbol ?? t.getSymbol();
    if (!sym || !this.isNativeSymbol(sym)) return null;
    if (this.isJavaArray(t)) return `JSArray<${this.t.type(this.t.checker.getTypeArguments(t as ts.TypeReference)[0])}>`;
    const c = this.classOf(sym);
    if (!c) return null;
    return this.classRef(c, (t as ts.TypeReference).typeArguments, '*', undefined, true);
  }

  /** `androidNative.Array<T>`, NativeScript's type for a Java array, which translated code holds as a JSArray. */
  private isJavaArray(t: ts.Type): boolean {
    const sym = t.getSymbol();
    return !!sym && sym.name === 'Array' && this.isNativeSymbol(sym) && this.t.checker.getFullyQualifiedName(sym) === 'androidNative.Array';
  }

  /** The nearest class the Java classes of these types all extend (`StyleableTextView` and `EditText`: a `TextView`), as Kotlin names it. */
  sharedClassType(parts: ts.Type[]): string | null {
    const names = parts.map((p) => this.classesOf(p)?.[0]);
    if (!names.length || names.some((n) => !n)) return null;
    const shared = this.classpath.supertypes(names[0]!).find((c) => !(c.access & ACC_INTERFACE) && names.every((n) => this.classpath.distance(n!, c.name) !== null));
    return shared ? this.kotlinTypeName(shared.name) : null;
  }

  /** The one class among several every other one extends (`AppCompatActivity | Activity` is an Activity). */
  private commonClass(parts: ts.Type[]): string | null {
    const names = parts.map((p) => this.classesOf(p)?.[0]);
    if (!names.length || names.some((n) => !n)) return null;
    return names.find((c) => names.every((o) => this.classpath.distance(o!, c!) !== null)) ?? null;
  }

  /** The Java classes a TypeScript type's values are: a native class, or an app class's native base and the Java interfaces it implements. */
  private classesOf(type: ts.Type): string[] | null {
    const c = this.t.checker;
    type = c.getNonNullableType(type);
    if (type.isUnion()) {
      const common = this.commonClass(type.types);
      return common ? [common] : null;
    }
    const sym = type.getSymbol();
    if (!sym) return null;
    if (this.isNativeSymbol(sym)) {
      if (!(sym.flags & (ts.SymbolFlags.Class | ts.SymbolFlags.Enum | ts.SymbolFlags.EnumMember)) || this.isJavaArray(type)) return null;
      const cls = this.classOf(sym);
      return cls ? [cls.name] : null;
    }
    const decl = sym.valueDeclaration;
    if (decl && ts.isClassDeclaration(decl) && !decl.getSourceFile().isDeclarationFile) {
      const native = this.nativeHeritage(decl);
      if (native) return [native.base.name, ...native.interfaces.map((i) => i.name)];
    }
    // An interface of the program's adding fields to Java classes (`interface OwnerSeekBar extends android.widget.SeekBar`): those classes.
    const own = sym.declarations?.find((d): d is ts.InterfaceDeclaration => ts.isInterfaceDeclaration(d) && !d.getSourceFile().isDeclarationFile);
    if (own && sym.flags & ts.SymbolFlags.Interface && !(sym.flags & ts.SymbolFlags.Class)) {
      const bases = (own.heritageClauses ?? []).flatMap((h) => h.types.map((x) => this.classesOf(c.getTypeAtLocation(x)) ?? []).flat());
      if (bases.length) return bases;
    }
    return null;
  }

  /** The Java class an app class extends, directly, and the Java interfaces it implements (`implements`, `static interfaces = [...]`). */
  private nativeHeritage(cls: ts.ClassDeclaration): { base: JavaClass; interfaces: JavaClass[]; listed?: ts.PropertyDeclaration } | null {
    const heritage = cls.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
    if (!heritage) return null;
    // Through a local alias of the class (`const AccessibilityDelegate = android.view.View.AccessibilityDelegate`).
    const base = this.classOf(this.t.resolve(heritage.expression), heritage) ?? (this.t.library ? this.classOf(this.classSymbol(heritage.expression), heritage) ?? this.nestedAlias(heritage.expression) : null);
    if (!base) return null;
    const interfaces: JavaClass[] = [];
    const add = (e: ts.Expression) => {
      const i = this.classOf(this.t.resolve(e), e);
      if (!i || !(i.access & ACC_INTERFACE)) throw this.t.error(e, `${e.getText()} (not a Java interface)`);
      if (!interfaces.includes(i)) interfaces.push(i);
    };
    for (const i of cls.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ImplementsKeyword)?.types ?? []) add(i.expression);
    const listed = cls.members.find((m): m is ts.PropertyDeclaration => ts.isPropertyDeclaration(m) && m.name.getText() === 'interfaces' && hasStatic(m));
    if (listed?.initializer && ts.isArrayLiteralExpression(listed.initializer)) for (const e of listed.initializer.elements) add(e);
    return { base, interfaces, listed };
  }

  // ---- Members -------------------------------------------------------------------------------

  /** A member the app's own class declares (on a subclass of a Java class): an ordinary Kotlin member. */
  private appMember(name: ts.Node): boolean {
    const decl = this.t.checker.getSymbolAtLocation(name)?.declarations?.[0];
    return !!decl && !decl.getSourceFile().isDeclarationFile;
  }

  sharedClass(from: string, to: string): string | null {
    const internal = (n: string) => n.replace(/\./g, '/');
    if (!this.classpath.get(internal(to)) || this.classpath.distance(internal(from), internal(to)) !== null) return null;
    for (let c = this.classpath.get(internal(from)); c?.superName; c = this.classpath.get(c.superName)) {
      if (this.classpath.distance(internal(to), c.superName) !== null) return javaTypeName(`L${c.superName};`);
    }
    return null;
  }

  isClassAlias(d: ts.VariableDeclaration): boolean {
    return this.nativeAlias(d) || !!this.extensionOf(d) || !!this.prototypeOf(d);
  }

  /** `const superProto = androidx.fragment.app.Fragment.prototype`: the Java class whose methods it holds. */
  private prototypeOf(d: ts.VariableDeclaration): JavaClass | null {
    const init = d.initializer && skipCasts(d.initializer);
    if (!init || !ts.isPropertyAccessExpression(init) || init.name.text !== 'prototype') return null;
    return this.untypedClass(init.expression) ?? this.classOf(this.classSymbol(init.expression), init.expression);
  }

  /**
   * `superProto.onCreate` in a method of a Java subclass: a function calling the superclass's method (the overload of
   * the enclosing method's arity when it is that one), taking `this` and script's arguments as `fn.call(this, …)` gives them.
   */
  private superMethodValue(e: ts.PropertyAccessExpression, base: JavaClass): string {
    const name = e.name.text;
    const candidates = this.methods([base.name], name, false).filter((c) => !(c.m.access & ACC_ABSTRACT));
    const fn = ts.findAncestor(e.parent, (n) => ts.isFunctionLike(n) && !ts.isArrowFunction(n)) as ts.FunctionLikeDeclaration | undefined;
    const own = fn && (ts.isMethodDeclaration(fn) || ts.isFunctionExpression(fn)) ? (ts.isMethodDeclaration(fn) ? fn.name.getText() : ts.isPropertyAssignment(fn.parent) ? fn.parent.name.getText() : '') : '';
    const chosen = (own === name ? candidates.find((c) => c.params.length === fn!.parameters.length) : undefined) ?? (candidates.length === 1 ? candidates[0] : candidates.find((c) => c.params.length === (fn?.parameters.length ?? 0)) ?? candidates[0]);
    if (!chosen) throw this.t.error(e, `${javaTypeName(`L${base.name};`)}.${name} (no Java method of that name to call as super)`);
    const args = chosen.params.map((desc, k) => {
      const a = `__a.getOrNull(${k})`;
      if (NUMERIC.has(desc)) return `jsToNumber(${a})${CONVERT[desc]}`;
      if (desc === 'Z') return `jsTruthy(${a})`;
      if (desc === 'C') return `jsToString(${a})[0]`;
      return `(jsJavaArgument(${a}) as ${this.kotlinType(desc, 'Any?')}${chosen.m.nonNullParams?.[k] ? '' : '?'})`;
    });
    const zuper = this.t.thisAlias ? `super@${ts.findAncestor(e, ts.isClassLike)?.name?.text ?? ''}` : 'super';
    const call = `${zuper}.${ident(name)}(${args.join(', ')})`;
    return `JSMethod { _, __a -> ${chosen.ret === 'V' ? `${call}; null` : call} }`;
  }

  private nativeAlias(d: ts.VariableDeclaration): boolean {
    if (!ts.isIdentifier(d.name)) return false;
    // `let PageLayout: typeof com.nativescript.gesturehandler.PageLayout`, assigned the class before use.
    if (d.type && ts.isTypeQueryNode(d.type)) {
      const sym = this.t.resolve(d.type.exprName);
      return !!sym && !!(sym.flags & ts.SymbolFlags.Class) && this.isNativeSymbol(sym);
    }
    if (!(d.parent.flags & ts.NodeFlags.Const) || !d.initializer) return false;
    let init: ts.Expression = d.initializer;
    while (ts.isParenthesizedExpression(init)) init = init.expression;
    if (!ts.isPropertyAccessExpression(init) && !ts.isIdentifier(init)) return false;
    const sym = this.t.resolve(init);
    return !!sym && !!(sym.flags & ts.SymbolFlags.Class) && this.isNativeSymbol(sym);
  }

  /** The class symbol a class alias names. */
  aliasedClass(d: ts.VariableDeclaration): ts.Symbol | undefined {
    return d.type && ts.isTypeQueryNode(d.type) ? this.t.resolve(d.type.exprName) : this.t.resolve(d.initializer!);
  }

  /**
   * A Java class named through a package root code declares untyped
   * (`declare const org: any; new org.nativescript.menu.GlassAnchoredMenuController(ctx)`):
   * the class the dotted name is on the classpath, as the runtime resolves it.
   */
  private untypedClass(e: ts.Expression): JavaClass | null {
    const segs: string[] = [];
    let x: ts.Expression = e;
    while (ts.isPropertyAccessExpression(x)) { segs.unshift(x.name.text); x = x.expression; }
    if (!ts.isIdentifier(x) || !segs.length) return null;
    const root = this.t.resolve(x);
    const decl = root?.valueDeclaration;
    const ambient = decl && ts.isVariableDeclaration(decl) && !decl.initializer && !!(ts.getCombinedModifierFlags(decl) & ts.ModifierFlags.Ambient);
    // Library mode: a Java class the typings lack under a package they have (`org.nativescript.widgets.Async.File`), found on the classpath.
    const missing = this.t.library && !!root && !!(root.flags & ts.SymbolFlags.Namespace) && !!root.declarations?.every((d) => this.isNativeDeclaration(d)) && !this.t.resolve(e) && !(ts.isPropertyAccessExpression(e) && this.t.resolve(e.name));
    if (!missing && (!ambient || !(this.t.checker.getTypeAtLocation(x).flags & ts.TypeFlags.Any))) return null;
    segs.unshift(x.text);
    for (let k = segs.length - 1; k >= 1; k--) {
      const found = this.classpath.get(`${segs.slice(0, k).join('/')}/${segs.slice(k).join('$')}`);
      if (found) return found;
    }
    return null;
  }

  /** The class symbol an expression names, through a class alias. */
  private classSymbol(e: ts.Expression): ts.Symbol | undefined {
    const sym = this.t.resolve(e);
    const decl = sym?.valueDeclaration;
    return decl && ts.isVariableDeclaration(decl) && this.nativeAlias(decl) ? this.aliasedClass(decl) : sym;
  }

  /** What an expression is a Java member of: a class itself (static), or an instance of these classes. */
  private receiver(e: ts.Expression): { cls: JavaClass; isStatic: true } | { classes: string[]; isStatic: false } | null {
    const self = this.extensionOfThis(e);
    if (self) return { classes: extensionClasses(self), isStatic: false };
    const own = this.ownMember(e);
    if (own) {
      const classes = own.fn ? null : this.classesOf(this.t.checker.getTypeAtLocation(own.p.name!));
      return classes ? { classes, isStatic: false } : null;
    }
    const untyped = this.untypedClass(e);
    if (untyped) return { cls: untyped, isStatic: true };
    const sym = this.classSymbol(e);
    if (sym && sym.flags & (ts.SymbolFlags.Class | ts.SymbolFlags.Enum) && this.isNativeSymbol(sym) && (ts.isIdentifier(e) || ts.isPropertyAccessExpression(e))) {
      const cls = this.classOf(sym, e);
      if (cls) return { cls, isStatic: true };
    }
    // A namespace of functions the typings give a Java class's statics as (`org.nativescript.widgets.Async.File`): that class.
    if (sym && sym.flags & ts.SymbolFlags.Namespace && !(sym.flags & ts.SymbolFlags.Class) && this.isNativeSymbol(sym)) {
      const segs = this.t.checker.getFullyQualifiedName(sym).split('.');
      for (let k = segs.length - 1; k >= 1; k--) {
        const found = this.classpath.get(`${segs.slice(0, k).join('/')}/${segs.slice(k).join('$')}`);
        if (found) return { cls: found, isStatic: true };
      }
    }
    if (sym && sym.flags & (ts.SymbolFlags.Class | ts.SymbolFlags.Namespace | ts.SymbolFlags.Module) && !(sym.flags & (ts.SymbolFlags.Variable | ts.SymbolFlags.Property)) && e.kind !== ts.SyntaxKind.ThisKeyword && e.kind !== ts.SyntaxKind.SuperKeyword) return null;
    const classes = this.classesOf(this.t.checker.getTypeAtLocation(e));
    return classes ? { classes, isStatic: false } : null;
  }

  private field(classes: string[], name: string, isStatic: boolean): JavaMember | null {
    for (const root of classes) {
      for (const c of this.classpath.supertypes(root)) {
        const f = c.fields.find((x) => x.name === name && !!(x.access & ACC_STATIC) === isStatic && !(x.access & ACC_PRIVATE));
        if (f) return f;
      }
    }
    return null;
  }

  private methods(classes: string[], name: string, isStatic: boolean): Callable[] {
    const out: Callable[] = [];
    const seen = new Set<string>();
    for (const root of classes) {
      for (const c of this.classpath.supertypes(root)) {
        for (const m of c.methods) {
          if (m.name !== name || !!(m.access & ACC_STATIC) !== isStatic || m.access & (ACC_PRIVATE | ACC_BRIDGE | ACC_SYNTHETIC)) continue;
          if (!(m.access & (ACC_PUBLIC | ACC_PROTECTED))) continue;
          const key = m.descriptor.replace(/\).*$/, ')');
          if (seen.has(key)) continue;
          seen.add(key);
          out.push({ m, ...methodTypes(m.descriptor) });
        }
      }
    }
    return out;
  }

  private constructors(c: JavaClass): Callable[] {
    return c.methods.filter((m) => m.name === '<init>' && m.access & (ACC_PUBLIC | ACC_PROTECTED) && !(m.access & ACC_SYNTHETIC)).map((m) => ({ m, ...methodTypes(m.descriptor) }));
  }

  private display(owner: string, name: string, c: Callable): string {
    return `${name === '<init>' ? this.kotlinName(owner) : name}(${c.params.map(javaTypeName).join(', ')})`;
  }

  // ---- Reads, writes, calls ------------------------------------------------------------------

  property(e: ts.PropertyAccessExpression): string | null {
    const own = this.ownMember(e);
    if (own) return `${this.t.expr(e.expression)}${own.fn ? '::' : '.'}${ident(e.name.text)}`;
    if (e.name.text === 'super' && this.extensionOfThis(e.expression)) throw this.t.error(e, 'this.super other than to call a superclass method (`this.super.onDraw(canvas)`)');
    if (this.appMember(e.name)) return null;
    const held = ts.isIdentifier(e.expression) ? this.t.resolve(e.expression)?.valueDeclaration : undefined;
    const proto = this.t.library && held && ts.isVariableDeclaration(held) ? this.prototypeOf(held) : null;
    if (proto) return this.superMethodValue(e, proto);
    const raw = this.read(e);
    if (raw?.script) return raw.code;
    return raw ? this.fromJava(this.unwrap(raw, e), raw.desc, raw.optional) : null;
  }

  /** Library mode: a static Java method used as a function value of the type the code gives it (`setPixels: ViewHelper.setMarginTop`). */
  private staticMethodValue(e: ts.PropertyAccessExpression, cls: string): Raw | null {
    const parts = this.t.library ? functionTypeParts(this.t.typeOf(e).replace(/^\((.*)\)\?$/, '$1')) : null;
    const m = parts && this.methods([cls], e.name.text, true).find((c) => c.params.length === parts.params.length);
    if (!parts || !m) return null;
    const args = m.params.map((desc, k) => {
      const p = parts.params[k];
      if (NUMERIC.has(desc)) return `__a${k}${p === 'Double' ? '' : '!!'}${CONVERT[desc]}`;
      return p.endsWith('?') && !m.m.nullableParams?.[k] ? `__a${k}!!` : `__a${k}`;
    });
    const call = `${this.kotlinName(m.m.owner)}.${ident(e.name.text)}(${args.join(', ')})`;
    return { code: `{ ${parts.params.map((p, k) => `__a${k}: ${p}`).join(', ')} -> ${parts.ret === 'Unit' ? `${call}; Unit` : this.fromJava(call, m.ret)} }`, desc: '', script: true };
  }

  /** `X.FIELD`, `obj.field`, `X.class`: the Kotlin code and the Java type it has. */
  private read(e: ts.PropertyAccessExpression): Raw | null {
    const r = this.receiver(e.expression);
    if (!r) return null;
    const name = e.name.text;
    if (r.isStatic) {
      if (name === 'class') return { code: `${this.kotlinName(r.cls.name)}::class.java`, desc: 'Ljava/lang/Class;' };
      const f = this.field([r.cls.name], name, true);
      if (!f) {
        const fn = this.staticMethodValue(e, r.cls.name);
        if (fn) return fn;
        if (this.classOf(this.t.resolve(e))) throw this.t.error(e, `${javaTypeName(`L${r.cls.name};`)}.${name} (a Java class used as a value)`);
        throw this.t.error(e, `${javaTypeName(`L${r.cls.name};`)}.${name} (no static Java field of that name)`);
      }
      return { code: `${this.kotlinName(f.owner)}.${ident(name)}`, desc: f.descriptor, nullable: f.nullable };
    }
    const f = this.field(r.classes, name, false);
    if (!f) {
      // A method read as a value (`if (layout.addRowsFromJSON)`, probing for it): the method found at run time, as the runtime finds it.
      if (this.methods(r.classes, name, false).length) return { code: `jsJavaGet(${this.t.expr(e.expression).replace(/(?<!!!)$/, '!!')}, ${JSON.stringify(name)})`, desc: 'Ljava/lang/Object;' };
      // A property script sets on an extend class's instance: kept beside the object, as NativeScript keeps it on the JavaScript side.
      if (this.extensionOfThis(e.expression)) return null;
      throw this.t.error(e, `${javaTypeName(`L${r.classes[0]};`)}.${name} (no Java field of that name)`);
    }
    const target = this.target(e.expression, e);
    return { code: `${target}.${ident(name)}`, desc: f.descriptor, optional: target.endsWith('?'), nullable: f.nullable };
  }

  /** A `@Nullable` result where TypeScript's type says it is there. */
  private unwrap(raw: Raw, e: ts.Expression): string {
    const tsType = this.t.typeOf(e);
    if (tsType.endsWith('?') || tsType === 'Any?') return raw.code;
    // An optional chain (`?.`) TypeScript types as present: the value, as the code reads it.
    if (raw.optional && !ts.isPropertyAccessExpression(e.parent) && !ts.isCallExpression(e.parent) && !ts.isElementAccessExpression(e.parent)) return `${raw.code}!!`;
    // Tested or passed on as it is (`intent.getAction() && …`): null is the test's to see.
    if (raw.nullable && this.t.library && raw.desc.startsWith('L') && raw.desc !== 'Ljava/lang/CharSequence;' && this.t.nullTolerant(e)) return raw.code;
    return raw.nullable && !raw.optional ? `${raw.code}!!` : raw.code;
  }

  /** The receiver's code, unwrapped when TypeScript has narrowed a nullable one, with the dot that follows it. */
  private target(e: ts.Expression, access: ts.PropertyAccessExpression): string {
    if (this.extensionOfThis(e)) return this.t.expr(e);
    const code = this.t.expr(e);
    const own = this.ownMember(e);
    const nullable = (own ? this.t.typeOf(own.p.name!) : this.t.typeOf(e)).endsWith('?');
    if (access.questionDotToken || (access.flags & ts.NodeFlags.OptionalChain && nullable)) return `${code}?`;
    return nullable ? `${code}!!` : code;
  }

  assign(left: ts.PropertyAccessExpression, value: ts.Expression): string | null {
    const own = this.ownMember(left);
    if (own) {
      if (own.fn) throw this.t.error(left, `${left.name.text} (a method of the extend class, assigned)`);
      return `${this.t.expr(left.expression)}.${ident(left.name.text)} = ${this.t.coerce(value, this.t.typeOf(own.p.name!))}`;
    }
    if (this.appMember(left.name)) return null;
    const r = this.receiver(left.expression);
    if (!r) return null;
    const name = left.name.text;
    const f = this.field(r.isStatic ? [r.cls.name] : r.classes, name, r.isStatic);
    if (!f && this.extensionOfThis(left.expression)) return null;
    // Library mode: a property script sets that Java has only a setter for (`params.diskCacheSize = …`): the setter, as NativeScript's runtime calls it.
    const setter = !f && this.t.library ? this.methods(r.isStatic ? [r.cls.name] : r.classes, `set${name[0].toUpperCase()}${name.slice(1)}`, r.isStatic).find((c) => c.params.length === 1) : undefined;
    if (setter) return `${r.isStatic ? this.kotlinName(setter.m.owner) : this.target(left.expression, left)}.${ident(setter.m.name)}(${this.toJava(value, setter.params[0], !!setter.m.nullableParams?.[0], !!setter.m.nonNullParams?.[0])})`;
    // Library mode: one Java has neither (a widgets version without it): kept beside the object, as NativeScript's runtime keeps it.
    if (!f && this.t.library && !r.isStatic) return `jsSet(${this.t.coerce(left.expression, 'Any?')}, ${kotlinString(name)}, ${this.t.coerce(value, 'Any?')})`;
    if (!f) throw this.t.error(left, `${name} (no Java field of that name; call its setter)`);
    if (f.access & ACC_FINAL) throw this.t.error(left, `${name} (a final Java field)`);
    const target = r.isStatic ? this.kotlinName(f.owner) : this.target(left.expression, left);
    return `${target}.${ident(name)} = ${this.toJava(value, f.descriptor)}`;
  }

  call(e: ts.CallExpression): string | null {
    // Library mode: `Base.extend('com.tns.NativeScriptActivity', { … })` as a statement declares that class.
    const named = this.t.library && ts.isExpressionStatement(e.parent) ? this.extension(e) : null;
    if (named?.javaName && !named.owner) {
      this.extensionCode(named);
      return 'Unit';
    }
    const made = this.arrayCreate(e);
    if (made) {
      // Held as the Java array itself (Java methods fill it in place), unless the code declares a JavaScript array.
      const ctx = this.t.checker.getContextualType(e);
      return ctx && (this.isJavaArray(ctx) || this.t.checker.isArrayType(ctx)) ? this.fromJava(made.code, made.desc) : made.code;
    }
    const raw = this.invoke(e);
    if (raw?.script) return this.t.fromAnyCode(raw.code, this.t.typeOf(e), true);
    // Library mode: a Java object where core's code reads a string (`input.getText()`, an Editable): its text.
    if (raw && this.t.library && this.t.typeOf(e) === 'String' && raw.desc.startsWith('L') && raw.desc !== 'Ljava/lang/String;') return `jsToString(${this.unwrap(raw, e)})`;
    return raw ? this.fromJava(this.unwrap(raw, e), raw.desc, raw.optional) : null;
  }

  private invoke(e: ts.CallExpression): Raw | null {
    const callee = e.expression;
    if (ts.isIdentifier(callee)) {
      // NativeScript's `float(n)`, `long(n)`: the number itself, outside a Java argument.
      const sym = this.t.resolve(callee);
      if ((callee.text === 'float' || callee.text === 'long') && this.isNativeSymbol(sym)) return { code: this.t.toNumber(e.arguments[0]), desc: 'D' };
      return null;
    }
    if (!ts.isPropertyAccessExpression(callee)) return null;
    if (this.extension(e)) throw this.t.error(e, `${skipCasts(callee.expression).getText()}.extend(…) other than as a variable's value (\`const Name = ….extend({ … })\`)`);
    const own = this.ownMember(callee);
    if (own) return own.fn ? { code: this.ownCall(own.fn, callee.name.text, e), desc: 'Ljava/lang/Object;' } : null;
    const zuper = ts.isPropertyAccessExpression(callee.expression) && callee.expression.name.text === 'super' ? this.extensionOfThis(callee.expression.expression) : null;
    if (zuper) return this.superCall(zuper, callee.name.text, e);
    // A method of the program's overriding a Java method (`this.getCount()` of an adapter): Kotlin's override has Java's signature.
    const appMethod = this.t.library ? this.t.checker.getSymbolAtLocation(callee.name)?.valueDeclaration : undefined;
    const appClass = appMethod && ts.isMethodDeclaration(appMethod) && appMethod.body && ts.isClassDeclaration(appMethod.parent) ? appMethod.parent : undefined;
    const heritage = appClass ? this.nativeHeritage(appClass) : null;
    if (heritage && appMethod && ts.isMethodDeclaration(appMethod)) {
      const target = this.overrideTargets(appMethod, [heritage.base.name, ...heritage.interfaces.map((i) => i.name)], callee.name.text)[0];
      if (target && target.params.length === e.arguments.length) return { code: `${this.t.expr(callee.expression)}.${ident(callee.name.text)}(${this.argList(e.arguments, target, [target])})`, desc: target.ret, nullable: target.m.nullable };
    }
    // Library mode: `super.m(…)` where the Java base is reached through an alias script types loosely (`View['AccessibilityDelegate']`).
    const zuperClass = this.t.library && callee.expression.kind === ts.SyntaxKind.SuperKeyword ? ts.findAncestor(callee, ts.isClassDeclaration) : undefined;
    const zuperBase = zuperClass ? this.nativeHeritage(zuperClass)?.base : undefined;
    if (zuperBase) {
      const candidates = this.methods([zuperBase.name], callee.name.text, false);
      const chosen = candidates.length ? this.overloadOrNull(candidates, [...e.arguments], e, zuperBase.name, callee.name.text) : null;
      if (chosen) return { code: `super.${ident(callee.name.text)}(${this.argList(e.arguments, chosen, candidates)})`, desc: chosen.ret, nullable: chosen.m.nullable };
    }
    // Library mode: `superProto.toString()` in a method of a Java subclass, the superclass's method.
    const held = this.t.library && ts.isIdentifier(callee.expression) ? this.t.resolve(callee.expression)?.valueDeclaration : undefined;
    const proto = held && ts.isVariableDeclaration(held) ? this.prototypeOf(held) : null;
    if (proto) {
      const candidates = this.methods([proto.name], callee.name.text, false);
      const chosen = this.resolveOverload(candidates, [...e.arguments], e, proto.name, callee.name.text);
      return { code: `super.${ident(callee.name.text)}(${this.argList(e.arguments, chosen, candidates)})`, desc: chosen.ret, nullable: chosen.m.nullable };
    }
    if (this.appMember(callee.name)) return null;
    const r = this.receiver(callee.expression);
    if (!r) return null;
    const name = callee.name.text;
    const classes = r.isStatic ? [r.cls.name] : r.classes;
    const owner = classes[0];
    const candidates = this.methods(classes, name, r.isStatic);
    if (!candidates.length && this.extensionOfThis(callee.expression)) return null;
    if (!candidates.length) {
      const other = this.methods(classes, name, !r.isStatic).length;
      throw this.t.error(e, `${javaTypeName(`L${owner};`)}.${name}() (${other ? (r.isStatic ? 'an instance method called on the class' : 'a static method called on an instance') : 'no Java method of that name'})`);
    }
    const chosen = this.overloadOrNull(candidates, [...e.arguments], e, owner, name);
    if (!chosen) {
      const recv = r.isStatic ? `${this.kotlinName(owner)}::class.java` : this.t.coerce(callee.expression, 'Any?');
      return { code: `jsCallMethod(${[recv, kotlinString(name), ...e.arguments.map((a) => this.t.coerce(a, 'Any?'))].join(', ')})`, desc: '', script: true };
    }
    // Library mode: a protected method core calls from outside a subclass (`ViewGroup.addViewInLayout`), as NativeScript's runtime may: through reflection.
    if (this.t.library && chosen.m.access & ACC_PROTECTED && !r.isStatic && !this.insideSubclassOf(callee, chosen.m.owner)) {
      return { code: `jsCallDeclared(${[this.t.coerce(callee.expression, 'Any?'), kotlinString(name), ...e.arguments.map((a) => this.t.coerce(a, 'Any?'))].join(', ')})`, desc: '', script: true };
    }
    // The receiver's type arguments (`LruCache<string, Bitmap>`), for parameters its class's type variables type.
    const given = !r.isStatic && chosen.m.owner === owner ? (this.t.checker.getNonNullableType(this.t.checker.getTypeAtLocation(callee.expression)) as ts.TypeReference).typeArguments : undefined;
    const ownerClass = given?.length ? this.classpath.get(owner) : undefined;
    const typeVar = ownerClass ? (n: string) => { const k = this.typeParamNames(ownerClass).indexOf(n); return k >= 0 && given![k] ? this.t.type(given![k], e) : 'Any?'; } : undefined;
    const args = this.argList(e.arguments, chosen, candidates, typeVar);
    let target = r.isStatic ? this.kotlinName(chosen.m.owner) : this.target(callee.expression, callee);
    // Library mode: a receiver held as a wider class than script types it (`nativeTextViewProtected`, a TextView): the method's class, as script trusts it.
    // The class Kotlin holds it as: its type, or the class a cast in its code names (an unchecked script cast, widened).
    const cast = /\bas ([a-z][\w.]*\.[A-Z][\w.]*)\??\)(!!)?$/.exec(target)?.[1];
    const holder = this.t.library && !r.isStatic ? cast ?? this.t.typeOf(callee.expression).replace(/\?$/, '') : '';
    const heldClass = holder && /^[a-z][\w.]*\.[A-Z]/.test(holder) ? this.classpath.get(holder.replace(/\./g, '/')) : undefined;
    if (heldClass && this.classpath.distance(heldClass.name, chosen.m.owner) === null) target = `(${target.replace(/(\?|!!)$/, '')} as ${this.kotlinTypeName(chosen.m.owner)})`;
    // `java.lang.String` methods Kotlin's String does not have (`getBytes`): on the Java class it is.
    if (!r.isStatic && chosen.m.owner === 'java/lang/String' && ['getBytes', 'getChars', 'intern', 'codePointAt'].includes(name)) {
      return { code: `(${this.t.expr(callee.expression)} as java.lang.String).${ident(name)}(${args})`, desc: chosen.ret, nullable: chosen.m.nullable };
    }
    const property = r.isStatic ? null : this.kotlinProperty(chosen);
    if (property) return { code: e.arguments.length ? `run { ${target}.${ident(property)} = ${args} }` : `${target}.${ident(property)}`, desc: e.arguments.length ? 'V' : chosen.ret, optional: target.endsWith('?'), nullable: chosen.m.nullable };
    const mapped = r.isStatic ? null : this.mapped(classes, name, chosen.m.descriptor);
    // Kotlin's own member keeps a function's call parentheses (`toInt()`, `get(i)`) and drops a property's.
    const call = mapped ? (/^\.(get|to\w+)$/.test(mapped) ? `${mapped}(${args})` : mapped) : `.${ident(name)}(${args})`;
    return { code: `${target}${call}`, desc: chosen.ret, optional: target.endsWith('?'), nullable: chosen.m.nullable };
  }

  /** `const AccessibilityDelegate = android.view.View['AccessibilityDelegate']`: the nested Java class the alias names. */
  private nestedAlias(e: ts.Expression): JavaClass | null {
    const d = ts.isIdentifier(e) ? this.t.resolve(e)?.valueDeclaration : undefined;
    const init = d && ts.isVariableDeclaration(d) && d.initializer ? skipCasts(d.initializer) : undefined;
    if (!init || !ts.isElementAccessExpression(init) || !ts.isStringLiteralLike(init.argumentExpression)) return null;
    const outer = this.classOf(this.classSymbol(init.expression), init.expression);
    return outer ? this.classpath.get(`${outer.name}$${init.argumentExpression.text}`) ?? null : null;
  }

  /** Whether code is in a method of a class extending a Java class (or of an extend class of it), where its protected members are reachable. */
  private insideSubclassOf(at: ts.Node, owner: string): boolean {
    for (let n: ts.Node | undefined = at.parent; n; n = n.parent) {
      if (ts.isClassDeclaration(n)) {
        const native = this.nativeHeritage(n);
        if (native && this.classpath.distance(native.base.name, owner) !== null) return true;
      }
      if (ts.isObjectLiteralExpression(n) && ts.isCallExpression(n.parent)) {
        const x = this.extension(n.parent);
        if (x && this.classpath.distance(x.base.name, owner) !== null) return true;
      }
    }
    return false;
  }

  /**
   * A getter or setter of a class compiled from Kotlin (`OnBackPressedCallback.setEnabled`), which Kotlin calls only as its
   * property (`isEnabled`): the property's name, known by the field or delegate holding it, or by its accessor pair.
   */
  private kotlinProperty(c: Callable): string | null {
    const m = /^(get|set|is)([A-Z]\w*)$/.exec(c.m.name);
    if (!m || (m[1] === 'set' ? c.params.length !== 1 : c.params.length)) return null;
    // A Java class's getter of a property a Kotlin interface it implements declares (`ComponentActivity.getOnBackPressedDispatcher`).
    const kotlinInterface = m[1] !== 'set' && this.classpath.supertypes(c.m.owner).some((x) => x.kotlin && x.access & ACC_INTERFACE && x.methods.some((y) => y.name === c.m.name && y.descriptor === c.m.descriptor));
    if (kotlinInterface) return m[1] === 'is' ? c.m.name : m[2][0].toLowerCase() + m[2].slice(1);
    const owner = this.classpath.get(c.m.owner);
    if (!owner?.kotlin) return null;
    const base = m[2][0].toLowerCase() + m[2].slice(1);
    const names = m[1] === 'is' ? [c.m.name] : m[1] === 'set' ? [`is${m[2]}`, base] : [base];
    const has = (n: string) => owner.fields.some((f) => f.name === n || f.name === `${n}$delegate`) || (n.startsWith('is') ? owner.methods.some((x) => x.name === n) && owner.methods.some((x) => x.name === `set${m[2]}`) : owner.methods.some((x) => x.name === `set${m[2]}`) && owner.methods.some((x) => x.name === `get${m[2]}`));
    // An abstract getter of a Kotlin class (`Lifecycle.getCurrentState`) is an abstract property's, which has no field.
    if (m[1] === 'get' && c.m.access & ACC_ABSTRACT) return base;
    return names.find(has) ?? null;
  }

  private mapped(classes: string[], name: string, descriptor: string): string | null {
    for (const c of this.classpath.supertypes(classes[0])) {
      const k = KOTLIN_MAPPED[`${c.name}.${name}${descriptor}`];
      if (k) return k;
    }
    return null;
  }

  construct(e: ts.NewExpression): string | null {
    const args = [...(e.arguments ?? [])];
    const made = this.extensionNamed(e.expression);
    if (made) {
      if (made.base.name === 'java/lang/Object') {
        if (args.length) throw this.t.error(e, `new ${e.expression.getText()} with arguments (it extends java.lang.Object, whose constructor takes none)`);
        return `${made.name}()`;
      }
      const ctors = this.constructors(made.base);
      const chosen = this.resolveOverload(ctors, args, e, made.base.name, '<init>');
      return `${made.name}(${this.argList(args, chosen, ctors)})`;
    }
    const sym = this.classSymbol(e.expression);
    const decl = sym?.valueDeclaration;
    if (decl && ts.isClassDeclaration(decl) && !decl.getSourceFile().isDeclarationFile) {
      const native = this.nativeHeritage(decl);
      if (!native || decl.members.some((m) => ts.isConstructorDeclaration(m) && m.body)) return null;
      const chosen = this.resolveOverload(this.constructors(native.base), args, e, native.base.name, '<init>');
      return `${ident(decl.name!.text)}(${this.argList(args, chosen, this.constructors(native.base))})`;
    }
    const cls = this.untypedClass(e.expression) ?? this.classOf(sym, e);
    if (!cls) return null;
    const literal = args.length === 1 && ts.isObjectLiteralExpression(args[0]) ? args[0] : null;
    if (cls.access & (ACC_INTERFACE | ACC_ABSTRACT)) {
      if (!literal) throw this.t.error(e, `new ${javaTypeName(`L${cls.name};`)} (an ${cls.access & ACC_INTERFACE ? 'interface' : 'abstract class'} takes one object literal implementing it)`);
      return this.implementation(cls, literal, e);
    }
    // `new java.lang.Integer(n)` and the other boxes: Kotlin's number, boxed where a Java parameter takes the box.
    const box = ({ 'java/lang/Integer': 'I', 'java/lang/Long': 'J', 'java/lang/Float': 'F', 'java/lang/Double': 'D', 'java/lang/Short': 'S', 'java/lang/Byte': 'B', 'java/lang/Boolean': 'Z' } as Record<string, string>)[cls.name];
    if (box && args.length === 1 && this.t.library) return this.toJava(args[0], box);
    // `new java.lang.String(text)`: Kotlin holds Java's strings as its own.
    if (cls.name === 'java/lang/String' && args.length === 1 && this.t.typeOf(args[0]).replace(/\?$/, '') === 'String') return this.t.str(args[0]);
    const ctors = this.constructors(cls);
    const chosen = this.overloadOrNull(ctors, args, e, cls.name, '<init>');
    if (!chosen) return this.t.fromAnyCode(`jsNew(${[`${this.kotlinName(cls.name)}::class.java`, ...args.map((a) => this.t.coerce(a, 'Any?'))].join(', ')})`, this.t.typeOf(e));
    // Library mode: a generic class made without type arguments (`new java.util.ArrayList()`), of any values.
    const generic = this.t.library && !(e.typeArguments?.length) && this.typeParamCount(cls) ? this.classRef(cls, undefined, 'Any?', e) : this.kotlinName(cls.name);
    return `${generic}(${this.argList(args, chosen, ctors)})`;
  }

  /**
   * Library mode: an overload the argument types cannot pick (untyped arguments, or none fits their declared types)
   * is null, the call then made through reflection, chosen by the values it is given as NativeScript's runtime chooses.
   */
  private overloadOrNull(candidates: Callable[], args: ts.Expression[], node: ts.Node, owner: string, name: string): Callable | null {
    try { return this.resolveOverload(candidates, args, node, owner, name); } catch (e) {
      if (this.t.library && candidates.length && !args.some(ts.isSpreadElement) && e instanceof Error && /\((ambiguous between|no Java overload takes)/.test(e.message)) return null;
      throw e;
    }
  }

  identifier(e: ts.Identifier): string | null {
    // A class alias read as a value (`if (!PageLayout)`): the class.
    const decl = this.t.resolve(e)?.valueDeclaration;
    if (!decl || !ts.isVariableDeclaration(decl)) return null;
    const made = this.extensionOf(decl);
    if (made) return `${made.name}::class.java`;
    if (!this.nativeAlias(decl)) return null;
    const cls = this.classOf(this.aliasedClass(decl), e);
    return cls ? `${this.kotlinName(cls.name)}::class.java` : null;
  }

  structLiteral(_e: ts.ObjectLiteralExpression, _t: ts.Type): string | null {
    return null;
  }

  toNumber(e: ts.Expression, _t: string): string | null {
    const classes = this.classesOf(this.t.checker.getTypeAtLocation(e));
    return classes && BOXED_NUMBERS.has(classes[0]) ? `(${this.t.expr(e)} as Number).toDouble()` : null;
  }

  // ---- Overloads -----------------------------------------------------------------------------

  private kind(e: ts.Expression): Kind {
    while (ts.isParenthesizedExpression(e)) e = e.expression;
    const self = this.extensionOfThis(e);
    if (self) return { kind: 'object', classes: extensionClasses(self) };
    const own = this.ownMember(e);
    if (own && !own.fn) return this.kindOfType(this.t.checker.getTypeAtLocation(own.p.name!), e);
    const made = ts.isNewExpression(e) ? this.extensionNamed(e.expression) : null;
    if (made) return { kind: 'object', classes: extensionClasses(made) };
    if (e.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(e) && e.text === 'undefined')) return { kind: 'null' };
    // `x as never` passes x as it is: the Java classes its type includes pick the overload.
    if (ts.isAsExpression(e) && this.t.checker.getTypeAtLocation(e).flags & ts.TypeFlags.Never) {
      const inner = this.t.checker.getNonNullableType(this.t.checker.getTypeAtLocation(e.expression));
      const classes = (inner.isUnion() ? inner.types : [inner]).flatMap((p) => this.classesOf(p) ?? []);
      if (classes.length) return { kind: 'object', classes };
    }
    const forced = this.forced(e);
    if (forced) return { kind: 'number', forced: forced.desc };
    const literal = numericLiteral(e);
    if (literal !== null) return { kind: 'number', literal };
    if (ts.isStringLiteralLike(e)) return { kind: 'string', literal: e.text };
    const type = this.t.checker.getTypeAtLocation(e);
    // A Java member read through an untyped package root: the type Java gives it.
    if (type.flags & ts.TypeFlags.Any) {
      const raw = this.raw(e) ?? this.createdArray(e);
      if (raw) return this.kindOfDescriptor(raw.desc);
    }
    return this.kindOfType(type, e);
  }

  private kindOfDescriptor(desc: string): Kind {
    if (NUMERIC.has(desc)) return { kind: 'number' };
    if (desc === 'Z') return { kind: 'boolean' };
    if (desc === 'Ljava/lang/String;' || desc === 'Ljava/lang/CharSequence;' || desc === 'C') return { kind: 'string' };
    if (desc.startsWith('[')) return { kind: 'array', elem: this.kindOfDescriptor(desc.slice(1)) };
    if (desc.startsWith('L')) return desc === 'Ljava/lang/Object;' ? { kind: 'any' } : { kind: 'object', classes: [desc.slice(1, -1)] };
    return { kind: 'other' };
  }

  private kindOfType(type: ts.Type, where?: ts.Node): Kind {
    const c = this.t.checker;
    const nn = c.getNonNullableType(type);
    if (nn.flags & ts.TypeFlags.Never) return { kind: 'null' };
    let kt: string;
    try { kt = this.t.type(nn, where); } catch { return { kind: 'other' }; }
    if (kt === 'Double') return { kind: 'number' };
    if (kt === 'String') return { kind: 'string' };
    if (kt === 'Boolean') return { kind: 'boolean' };
    if (kt === 'Any?' || kt === 'Any') return { kind: 'any' };
    if (kt.startsWith('JSArray<')) {
      const el = c.isArrayType(nn) || this.isJavaArray(nn) ? c.getTypeArguments(nn as ts.TypeReference)[0] : undefined;
      return { kind: 'array', elem: el ? this.kindOfType(el, where) : { kind: 'any' } };
    }
    const classes = this.classesOf(nn);
    return classes ? { kind: 'object', classes } : { kind: 'other' };
  }

  /** How well a value of `k` fits a parameter of Java type `desc`: lower is closer, null is not at all. */
  private score(k: Kind, desc: string): number | null {
    const ref = desc.startsWith('L') || desc.startsWith('[');
    const cls = desc.startsWith('L') ? desc.slice(1, -1) : '';
    switch (k.kind) {
      case 'null': return ref ? 1 : null;
      case 'any': return 20;
      case 'number':
        if (k.forced) return desc === k.forced ? 0 : null;
        if (NUMERIC.has(desc)) return k.literal !== undefined && !Number.isInteger(k.literal) ? (desc === 'D' ? 0 : desc === 'F' ? 1 : null) : NUMBER_RANK[desc];
        if (desc === 'C') return 8;
        if (BOXED_NUMBERS.has(cls)) return 9;
        return cls === 'java/lang/Object' ? 30 : null;
      case 'string':
        if (cls === 'java/lang/String') return 0;
        if (cls === 'java/lang/CharSequence') return 1;
        if (desc === 'C' && k.literal?.length === 1) return 3;
        return cls && this.classpath.distance('java/lang/String', cls) !== null ? 2 + this.classpath.distance('java/lang/String', cls)! : null;
      case 'boolean':
        if (desc === 'Z') return 0;
        if (cls === 'java/lang/Boolean') return 1;
        return cls === 'java/lang/Object' ? 30 : null;
      case 'array': {
        if (cls === 'java/lang/Object') return 40;
        if (!desc.startsWith('[')) return null;
        const inner = k.elem.kind === 'any' ? 5 : this.score(k.elem, desc.slice(1));
        return inner === null ? null : inner;
      }
      case 'object': {
        if (!ref || desc.startsWith('[')) return null;
        let best: number | null = null;
        for (const from of k.classes) {
          const d = this.classpath.distance(from, cls);
          if (d !== null && (best === null || d < best)) best = d;
        }
        return best;
      }
    }
    return null;
  }

  private resolveOverload(candidates: Callable[], args: ts.Expression[], node: ts.Node, owner: string, name: string): Callable {
    const what = name === '<init>' ? `new ${javaTypeName(`L${owner};`)}` : `${javaTypeName(`L${owner};`)}.${name}()`;
    if (args.some(ts.isSpreadElement)) throw this.t.error(node, `${what} with a spread argument`);
    if (!candidates.length) throw this.t.error(node, `${what} (no accessible Java constructor)`);
    const kinds = args.map((a) => this.kind(a));
    // A varargs method also takes its last parameter's elements one by one, ranked after every fixed-arity match as Java ranks it.
    const spread = candidates.flatMap((c): Callable[] => {
      const fixed = c.params.length - 1;
      if (!(c.m.access & ACC_VARARGS) || !c.params[fixed]?.startsWith('[') || args.length < fixed) return [];
      return [{ ...c, params: [...c.params.slice(0, fixed), ...Array(args.length - fixed).fill(c.params[fixed].slice(1))], fixed }];
    });
    const scored = [...candidates, ...spread].filter((c) => c.params.length === args.length).map((c) => {
      let total = c.fixed === undefined ? 0 : 100;
      for (let k = 0; k < args.length; k++) {
        const s = this.score(kinds[k], c.params[k]);
        if (s === null) return null;
        total += s;
      }
      return { c, total };
    }).filter((x): x is { c: Callable; total: number } => !!x);
    const list = () => candidates.map((c) => this.display(owner, name, c)).join('; ');
    if (!scored.length) throw this.t.error(node, `${what} (no Java overload takes these ${args.length} arguments; there are ${list()})`);
    const best = Math.min(...scored.map((x) => x.total));
    const top = scored.filter((x) => x.total === best).map((x) => x.c);
    if (top.length === 1) return top[0];
    const specific = top.filter((a) => top.every((b) => a === b || this.moreSpecific(a, b)));
    if (specific.length === 1) return specific[0];
    throw this.t.error(node, `${what} (ambiguous between ${top.map((c) => this.display(owner, name, c)).join(' and ')}; cast the argument to pick one)`);
  }

  private moreSpecific(a: Callable, b: Callable): boolean {
    return a.params.every((p, k) => {
      const q = b.params[k];
      if (p === q) return true;
      if (NUMERIC.has(p) && NUMERIC.has(q)) return 'BSIJFD'.indexOf(p) < 'BSIJFD'.indexOf(q);
      if (p.startsWith('L') && q.startsWith('L')) return this.classpath.distance(p.slice(1, -1), q.slice(1, -1)) !== null;
      return false;
    });
  }

  private argList(args: readonly ts.Expression[], chosen: Callable, candidates: Callable[], typeVar?: (name: string) => string): string {
    const overloaded = candidates.filter((c) => c.params.length === chosen.params.length).length > 1;
    const last = chosen.fixed === undefined && chosen.m.access & ACC_VARARGS ? chosen.params.length - 1 : -1;
    return args.map((a, k) => {
      const desc = chosen.params[k];
      const nonNull = !!chosen.m.nonNullParams?.[k];
      const generic = chosen.m.signature ? signatureTypes(chosen.m.signature) : null;
      let code = this.toJava(a, desc, !!chosen.m.nullableParams?.[k], nonNull, generic && generic.params.length === chosen.params.length ? generic.params[k] : undefined, typeVar);
      // Kotlin resolves the overload again: a null or untyped argument names the parameter type it means.
      const loose = this.kind(a).kind;
      if (overloaded && (desc.startsWith('L') || desc.startsWith('[')) && (loose === 'null' || loose === 'any')) code = `(${code} as ${this.kotlinType(desc, 'Any?')}${nonNull && loose === 'any' ? '' : '?'})`;
      // An array where Kotlin declares `vararg`: spread, or Kotlin passes it as one element.
      if (k === last && code !== 'null') return `*${code.endsWith('?)') ? `${code}!!` : /\?\.to\w*Array\(\)$/.test(code) ? `(${code} ?: arrayOf())` : atom(code)}`;
      // `getMethod(name, null)`: Java's null array is no arguments there.
      if (k === last && code === 'null' && args.length === chosen.params.length) return '*arrayOf()';
      return code;
    }).join(', ');
  }

  // ---- Conversions ---------------------------------------------------------------------------

  /** `float(n)`, `long(n)`: the number, and the Java type it asks for. */
  private forced(e: ts.Expression): { inner: ts.Expression; desc: string } | null {
    if (!ts.isCallExpression(e) || !ts.isIdentifier(e.expression) || e.arguments.length !== 1) return null;
    const name = e.expression.text;
    if ((name !== 'float' && name !== 'long') || !this.isNativeSymbol(this.t.resolve(e.expression))) return null;
    return { inner: e.arguments[0], desc: name === 'float' ? 'F' : 'J' };
  }

  /** A native read or call as Java returns it, before the conversion TypeScript's types ask for. */
  private raw(e: ts.Expression): Raw | null {
    while (ts.isParenthesizedExpression(e)) e = e.expression;
    if (this.t.subst.has(e)) return null;
    if (ts.isCallExpression(e)) {
      const made = this.arrayCreate(e);
      if (made) return made;
    }
    if (ts.isPropertyAccessExpression(e) && !this.appMember(e.name) && !e.questionDotToken && this.receiver(e.expression)) {
      const r = this.read(e);
      return r?.script ? null : r;
    }
    if (ts.isCallExpression(e) && !e.questionDotToken && ts.isPropertyAccessExpression(e.expression) && !this.appMember(e.expression.name) && this.receiver(e.expression.expression)) {
      const r = this.invoke(e);
      return r?.script ? null : r;
    }
    return null;
  }

  /** A TypeScript value where a Java parameter or field of type `desc` takes it. */
  toJava(e: ts.Expression, desc: string, nullableParam = false, nonNullParam = false, signature?: string, typeVar?: (name: string) => string): string {
    const t = this.t;
    let inner = e;
    while (ts.isParenthesizedExpression(inner)) inner = inner.expression;
    if (inner.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(inner) && inner.text === 'undefined')) return 'null';
    const forced = this.forced(inner);
    if (forced) return this.toJava(forced.inner, desc, nullableParam, nonNullParam);
    const literal = numericLiteral(inner);
    if (literal !== null && (NUMERIC.has(desc) || desc === 'C')) return primitiveLiteral(literal, desc);
    const found = this.raw(inner);
    // Library mode: a Java parameter of an object nobody declares non-null takes null, as Java code does.
    const takesNull = this.t.library && desc.startsWith('L') && !nonNullParam;
    const raw = found && { ...found, code: found.nullable && !nullableParam && !takesNull ? `${found.code}!!` : found.code };
    if (raw) {
      if (raw.desc === desc) return raw.code;
      if (NUMERIC.has(raw.desc) && NUMERIC.has(desc)) return desc === 'D' ? `${atom(raw.code)}.toDouble()` : `${atom(raw.code)}${CONVERT[desc].replace('.toInt().', raw.desc === 'I' ? '.' : '.toInt().')}`;
      if (raw.desc === 'Ljava/lang/String;' && desc === 'Ljava/lang/CharSequence;') return raw.code;
      if (raw.desc.startsWith('L') && desc.startsWith('L') && this.classpath.distance(raw.desc.slice(1, -1), desc.slice(1, -1)) !== null) {
        // A generic collection script fills untyped (`new java.util.HashSet<any>()`) where Java's parameter names its element type.
        if (this.t.library && signature?.includes('<') && !/\bT[A-Z]?;|<[A-Z];|[+\-*]/.test(signature)) return `(${raw.code} as ${this.kotlinType(signature, 'Any?')}${nonNullParam ? '' : '?'})`;
        return raw.code;
      }
    }
    // A Java array the code made and holds as one (its declaration names no JavaScript array): itself.
    const created = /^JSArray</.test(t.typeOf(inner)) ? null : this.createdArray(inner);
    if (created && (created.desc === desc || desc === 'Ljava/lang/Object;')) return `(${t.expr(inner)} as ${this.kotlinType(created.desc, 'Any?')})`;
    if (NUMERIC.has(desc)) return `${atom(t.toNumber(inner))}${CONVERT[desc]}`;
    if (desc === 'Z') return t.coerce(inner, 'Boolean');
    if (desc === 'C') {
      if (ts.isStringLiteralLike(inner) && inner.text.length === 1) return charLiteral(inner.text);
      return t.typeOf(inner) === 'String' ? `${atom(t.expr(inner))}[0]` : `${atom(t.toNumber(inner))}.toInt().toChar()`;
    }
    if (desc.startsWith('[')) return this.toJavaArray(inner, desc);
    const k = this.kind(inner);
    // Library mode: a read the translator holds untyped (checks narrowed it to nothing) where Java takes a class.
    if (t.library && k.kind !== 'any' && t.typeOf(inner) === 'Any?' && desc.startsWith('L') && desc !== 'Ljava/lang/Object;') return `(${t.expr(inner)} as ${this.kotlinType(desc, 'Any?')}${nonNullParam ? '' : '?'})`;
    const typeVarName = signature && typeVar ? /^T(\w+);$/.exec(signature)?.[1] : undefined;
    if (k.kind === 'any' && typeVarName && typeVar!(typeVarName) !== 'Any?') return `(${t.expr(inner)} as ${typeVar!(typeVarName).replace(/\?$/, '')}${nonNullParam ? '' : '?'})`;
    if (k.kind === 'any') return `(${t.expr(inner)} as ${this.kotlinType(signature && !/\bT[A-Z]?;|<[A-Z];/.test(signature) ? signature : desc, 'Any?')}${nonNullParam ? '' : '?'})`;
    // Library mode: a number where Java takes one of its enums (core's typings declare them numbers): the constant of that ordinal.
    const enumClass = t.library && k.kind === 'number' && desc.startsWith('L') ? this.classpath.get(desc.slice(1, -1)) : undefined;
    if (enumClass && enumClass.access & ACC_ENUM) return `${this.kotlinName(enumClass.name)}.values()[${atom(t.toNumber(inner))}.toInt()]`;
    if (k.kind === 'string' && takesNull) {
      if (ts.isConditionalExpression(inner)) return `(if (${t.cond(inner.condition)}) ${this.toJava(inner.whenTrue, desc, nullableParam, nonNullParam)} else ${this.toJava(inner.whenFalse, desc, nullableParam, nonNullParam)})`;
      return t.coerce(inner, 'String?');
    }
    if (k.kind === 'number' || k.kind === 'string' || k.kind === 'boolean') return t.coerce(inner, k.kind === 'number' ? 'Double' : k.kind === 'string' ? 'String' : 'Boolean');
    // Library mode: a generic collection script fills untyped (`new java.util.HashSet<any>()`) where Java's parameter names its element type.
    if (t.library && signature?.includes('<') && !/\bT[A-Z]?;|<[A-Z];|[+\-*]/.test(signature) && this.classesOf(t.checker.getTypeAtLocation(inner))?.some((c) => this.classpath.distance(c, desc.slice(1, -1)) !== null)) {
      return `(${t.expr(inner)} as ${this.kotlinType(signature, 'Any?')}${nonNullParam ? '' : '?'})`;
    }
    if (takesNull && (ts.isIdentifier(inner) || ts.isPropertyAccessExpression(inner))) {
      t.nullOk.add(inner);
      try { return t.expr(inner); } finally { t.nullOk.delete(inner); }
    }
    return t.expr(inner);
  }


  private toJavaArray(e: ts.Expression, desc: string): string {
    const t = this.t;
    const el = desc.slice(1);
    const prim = ARRAY_OF[el];
    if (ts.isArrayLiteralExpression(e) && !e.elements.some(ts.isSpreadElement)) {
      const items = e.elements.map((x) => this.toJava(x, el)).join(', ');
      return prim ? `${prim}ArrayOf(${items})` : `arrayOf<${this.kotlinType(el, 'Any?')}>(${items})`;
    }
    const k = this.kind(e);
    // An untyped array where Java takes an array: converted element by element at run time, as the runtime marshals it.
    if (k.kind === 'any') return `(toJavaValue(${t.expr(e)}, ${this.kotlinType(desc, 'Any?')}::class.java) as ${this.kotlinType(desc, 'Any?')}?)`;
    // Library mode: a missing array is null to Java, as the runtime marshals undefined.
    const q = t.library ? '?' : '';
    if (q && (ts.isIdentifier(e) || ts.isPropertyAccessExpression(e))) t.nullOk.add(e);
    let code: string;
    try { code = atom(t.expr(e)); } finally { t.nullOk.delete(e); }
    const list = q ? `${code}?.elements` : `${code}${t.typeOf(e).endsWith('?') ? '!!' : ''}.elements`;
    if (!prim) return `${list}${q}.map { it as ${this.kotlinType(el, 'Any?')} }${q}.toTypedArray()`;
    const kotlin = KOTLIN_PRIMITIVE[el];
    if (el === 'D' || el === 'Z') return `${list}${q}.to${kotlin}Array()`;
    if (el === 'C') return `${list}${q}.map { it[0] }${q}.toCharArray()`;
    return `${list}${q}.map { it${CONVERT[el]} }${q}.to${kotlin}Array()`;
  }

  /** A Java value as TypeScript reads it: numbers are Double, a char is a string, an array is a JSArray. */
  fromJava(code: string, desc: string, optional = false): string {
    const q = optional ? '?' : '';
    if (NUMERIC.has(desc)) return desc === 'D' ? code : `${atom(code)}${q}.toDouble()`;
    if (desc === 'C') return `${atom(code)}${q}.toString()`;
    if (desc === 'Ljava/lang/CharSequence;') return `${atom(code)}${q}.toString()`;
    if (desc.startsWith('[')) {
      const el = desc.slice(1);
      const items = (x: string) => (NUMERIC.has(el) && el !== 'D' ? `${x}.map { it.toDouble() }` : el === 'C' ? `${x}.map { it.toString() }` : `${x}.toList()`);
      return optional ? `${atom(code)}?.let { __array -> JSArray(${items('__array')}) }` : `JSArray(${items(atom(code))})`;
    }
    return code;
  }

  /** A Java type in Kotlin: a descriptor or a generic signature's type, type variables as `typeVar`. */
  kotlinType(sig: string, typeVar: string | ((name: string) => string)): string {
    let i = 0;
    const one = (): string => {
      const ch = sig[i];
      if (ch === '[') {
        i++;
        const elStart = i;
        const inner = one();
        const el = sig.slice(elStart, i);
        return ARRAY_OF[el] ? `${KOTLIN_PRIMITIVE[el]}Array` : `Array<${inner}>`;
      }
      if (KOTLIN_PRIMITIVE[ch]) { i++; return KOTLIN_PRIMITIVE[ch]; }
      if (ch === 'T') {
        const end = sig.indexOf(';', i);
        const name = sig.slice(i + 1, end);
        i = end + 1;
        return typeof typeVar === 'string' ? typeVar : typeVar(name);
      }
      if (ch === '*') { i++; return '*'; }
      if (ch === '+') { i++; return `out ${one()}`; }
      if (ch === '-') { i++; return `in ${one()}`; }
      // `Lpkg/Outer<args>.Inner<args>;`: an inner class's outer type arguments are dropped.
      i++;
      let internal = '';
      let segment = '';
      let args: string[] = [];
      for (;;) {
        const c = sig[i];
        if (c === '<') {
          i++;
          args = [];
          while (sig[i] !== '>') args.push(one());
          i++;
        } else if (c === '.' || c === ';') {
          internal = internal ? `${internal}$${segment}` : segment;
          segment = '';
          i++;
          if (c === ';') break;
          args = [];
        } else { segment += c; i++; }
      }
      if (!args.length) args = Array(this.typeParamCount(this.classpath.get(internal))).fill('*');
      return args.length ? `${this.kotlinTypeName(internal)}<${args.join(', ')}>` : this.kotlinTypeName(internal);
    };
    return one();
  }

  // ---- Implementations of Java interfaces and subclasses ---------------------------------------

  /** The overridable instance methods of these classes named `name`. */
  private overridable(classes: string[], name: string): Callable[] {
    return this.methods(classes, name, false).filter((c) => !(c.m.access & ACC_FINAL));
  }

  /** The Java method a TypeScript method implements: by name, then by its parameter count and types. */
  private overrideTarget(fn: ts.SignatureDeclaration, classes: string[], name: string): Callable | null {
    return this.overrideTargets(fn, classes, name, false)[0] ?? null;
  }

  /**
   * The Java methods a TypeScript method overrides. Library mode: each overload its parameters fit, as NativeScript's runtime
   * routes every overload of the name to the one function (`onReceivedError` of WebViewClient's two signatures).
   */
  private overrideTargets(fn: ts.SignatureDeclaration, classes: string[], name: string, every = !!this.t.library): Callable[] {
    const all = this.overridable(classes, name);
    if (!all.length) {
      const final = this.methods(classes, name, false).find((c) => c.m.access & ACC_FINAL);
      if (final) throw this.t.error(fn, `${name} (overrides the final Java method ${this.display(final.m.owner, name, final)})`);
      return [];
    }
    // A rest parameter takes every overload's arguments.
    if (every && fn.parameters.length === 1 && fn.parameters[0].dotDotDotToken) return all;
    const arity = fn.parameters.length;
    const exact = all.filter((c) => c.params.length === arity);
    const pool = exact.length ? exact : all.filter((c) => c.params.length > arity);
    if (pool.length === 1) return [pool[0]];
    const kinds = fn.parameters.map((p) => this.kindOfType(this.t.checker.getTypeAtLocation(p.name), p));
    const fits = pool.filter((c) => kinds.every((k, i) => k.kind === 'any' || this.score(k, c.params[i]) !== null));
    if (fits.length === 1 || (every && fits.length)) return fits;
    throw this.t.error(fn, `${name} (matches ${pool.map((c) => this.display(c.m.owner, name, c)).join(' and ')}; declare its parameter types)`);
  }

  /**
   * A TypeScript function as a Kotlin override of a Java method: Java's
   * parameter types, bound to the TypeScript names as TypeScript types them,
   * and the result converted back to Java's return type.
   */
  private overrideMethod(fn: ts.FunctionLikeDeclaration, name: string, target: Callable, indent: string, typeVar: string | ((name: string) => string) = 'Any?'): string {
    const t = this.t;
    const sig = target.m.signature ? signatureTypes(target.m.signature) : null;
    const types = (sig && sig.params.length === target.params.length ? sig.params : target.params).map((s) => this.kotlinType(s, typeVar));
    const declaredRet = t.returnTypeOf(fn);
    // Library mode: an object result may be null whatever the declaration says (`instantiateItem(…): java.lang.Object` returning null).
    const tsRet = t.library && declaredRet === 'Any' && (target.ret.startsWith('L') || target.ret.startsWith('[')) ? 'Any?' : declaredRet;
    const nullableRet = tsRet.endsWith('?') || tsRet === 'Any?';
    const params = target.params.map((desc, k) => {
      const p = fn.parameters[k];
      const tsType = p ? t.typeOf(p.name) : 'Any?';
      const ref = desc.startsWith('L') || desc.startsWith('[');
      return `__a${k}: ${types[k]}${ref && !types[k].endsWith('?') && !target.m.nonNullParams?.[k] && (tsType.endsWith('?') || !p || target.m.nullableParams?.[k]) ? '?' : ''}`;
    });
    // `onReceivedError(...args)`, reading `arguments`: what Java passes, as one list.
    const rest = t.library && fn.parameters.length === 1 && !!fn.parameters[0].dotDotDotToken;
    const packed = rest ? `jsArrayOf<Any?>(${target.params.map((d, k) => this.fromJava(`__a${k}`, d)).join(', ')})` : '';
    const binds = rest ? [t.readsArguments(fn) ? `${indent}    val __arguments: JSArray<Any?> = ${packed}` : `${indent}    val ${ident((fn.parameters[0].name as ts.Identifier).text)}: JSArray<Any?> = ${packed}`] : fn.parameters.map((p, k) => {
      if (!target.params[k] || !ts.isIdentifier(p.name)) return '';
      const tsType = t.typeOf(p.name);
      const unwrapped = target.m.nullableParams?.[k] && !tsType.endsWith('?') && tsType !== 'Any?' ? `__a${k}!!` : `__a${k}`;
      const desc = target.params[k];
      // Script types a parameter more narrowly than Java (`activity: AppCompatActivity` for an Activity, `result: string` for an Object): cast, as script trusts it.
      const narrowed = t.library && desc.startsWith('L') && tsType !== 'Any?' && types[k].replace(/\?$/, '') !== tsType.replace(/\?$/, '');
      // A Java class narrower than Java's (`host: ViewGroup` for any View): held as Java's, its methods cast to as script trusts.
      if (narrowed && desc !== 'Ljava/lang/Object;' && /^[a-z]\w*[._]/.test(tsType)) {
        t.widenedAccessors.set(p, types[k]);
        return `${indent}    val ${ident(p.name.text)}: ${types[k]} = __a${k}`;
      }
      // A CharSequence script reads as a string (an EditText's Editable): its text.
      const text = narrowed && desc === 'Ljava/lang/CharSequence;' && tsType.replace(/\?$/, '') === 'String' ? `${unwrapped}${tsType.endsWith('?') ? '?' : ''}.toString()` : null;
      const value = text ?? (narrowed ? (desc === 'Ljava/lang/Object;' ? t.fromAnyCode(unwrapped, tsType, true) : `(${unwrapped} as ${tsType})`) : this.fromJava(unwrapped, desc));
      return `${indent}    val ${ident(p.name.text)}: ${tsType} = ${value}`;
    }).filter(Boolean);
    const head = `${indent}override fun ${ident(name)}(${params.join(', ')})`;
    if (target.ret === 'V') {
      const body = t.functionBody(fn, 'Unit', indent);
      // A parameter the body assigns is a variable of its own there, in a scope apart from its binding.
      if (binds.length && t.paramPrelude(fn).length) return `${head} {\n${binds.join('\n')}\n${indent}    kotlin.run ${body.replace(/\n/g, '\n    ')}\n${indent}}`;
      return binds.length ? `${head} {\n${binds.join('\n')}\n${body.slice(2)}` : `${head} ${body}`;
    }
    const retType = sig ? this.kotlinType(sig.ret, typeVar) : this.kotlinType(target.ret, typeVar);
    const ref = target.ret.startsWith('L') || target.ret.startsWith('[');
    const body = t.functionBody(fn, tsRet, indent + '    ');
    const result = NUMERIC.has(target.ret) ? `${tsRet === 'Double' ? '__result' : 'jsToNumber(__result)'}${CONVERT[target.ret]}` : target.ret === 'C' ? '__result[0]' : target.ret.startsWith('[') ? this.arrayValue('__result', target.ret) : tsRet === 'Any?' && ref && retType !== 'Any' ? `(__result as ${retType}${target.m.nonNull ? '' : '?'})` : ref && nullableRet && target.m.nonNull ? '__result!!' : '__result';
    return [
      `${head}: ${retType}${ref && nullableRet && !target.m.nonNull ? '?' : ''} {`,
      ...binds,
      `${indent}    val __result: ${tsRet} = (fun(): ${tsRet} ${body})()`,
      `${indent}    return ${result}`,
      `${indent}}`,
    ].join('\n');
  }

  /** An override that calls a function value with the Java arguments as its declaration types them. */
  private overrideWithValue(value: ts.Expression, decl: ts.SignatureDeclaration, name: string, target: Callable, indent: string, typeVar: string | ((name: string) => string) = 'Any?'): string {
    const t = this.t;
    const sig = target.m.signature ? signatureTypes(target.m.signature) : null;
    const types = (sig && sig.params.length === target.params.length ? sig.params : target.params).map((s) => this.kotlinType(s, typeVar));
    const params = target.params.map((desc, k) => `__a${k}: ${desc.startsWith('L') || desc.startsWith('[') ? optionalType(types[k]) : types[k]}`);
    const args = decl.parameters.map((p, k) => {
      if (!target.params[k]) return 'null';
      const tsType = t.typeOf(p.name);
      const read = this.fromJava(`__a${k}`, target.params[k]);
      return tsType === 'Any?' ? read : target.params[k].startsWith('L') && !tsType.endsWith('?') ? `${read}!!` : read;
    });
    const call = `(${t.expr(value)})(${args.join(', ')})`;
    const head = `${indent}override fun ${ident(name)}(${params.join(', ')})`;
    if (target.ret === 'V') return `${head} {
${indent}    ${call}
${indent}}`;
    const retType = sig ? this.kotlinType(sig.ret, typeVar) : this.kotlinType(target.ret, typeVar);
    const result = NUMERIC.has(target.ret) ? `${tsRet === 'Double' ? '__result' : 'jsToNumber(__result)'}${CONVERT[target.ret]}` : target.ret === 'C' ? '__result[0]' : '__result';
    const ref = target.ret.startsWith('L') || target.ret.startsWith('[');
    return `${head}: ${retType}${ref ? '?' : ''} {
${indent}    val __result = ${call}
${indent}    return ${result}
${indent}}`;
  }

  private arrayValue(code: string, desc: string): string {
    const el = desc.slice(1);
    if (!ARRAY_OF[el]) return `${code}.elements.toTypedArray()`;
    if (el === 'D' || el === 'Z') return `${code}.elements.to${KOTLIN_PRIMITIVE[el]}Array()`;
    return `${code}.elements.map { it${CONVERT[el] ?? ''} }.to${KOTLIN_PRIMITIVE[el]}Array()`;
  }

  /** `new android.view.View.OnClickListener({ onClick(v) { … } })`: a Kotlin object expression. */
  private implementation(cls: JavaClass, literal: ts.ObjectLiteralExpression, e: ts.NewExpression): string {
    // Arrow functions and function values in the literal see the enclosing `this`, not the object Kotlin makes.
    const lexicalThis = literal.properties.some((p) => ts.isPropertyAssignment(p) && !ts.isFunctionExpression(p.initializer) && refersToThis(p.initializer));
    if (lexicalThis && !this.t.thisAlias) {
      const self = this.t.fresh('__self');
      this.t.thisAlias = self;
      try {
        return `run { val ${self} = this; ${this.implementation(cls, literal, e)} }`;
      } finally {
        this.t.thisAlias = null;
      }
    }
    const t = this.t;
    // The variable the object initializes, read in its own methods (`v.removeOnLayoutChangeListener(layoutListener)`): the object.
    const own = ts.isVariableDeclaration(e.parent) && e.parent.initializer === e && ts.isIdentifier(e.parent.name) ? t.checker.getSymbolAtLocation(e.parent.name) : undefined;
    const selfRefs: ts.Node[] = [];
    if (own) {
      const visit = (n: ts.Node): void => {
        if (ts.isIdentifier(n) && t.checker.getSymbolAtLocation(n) === own && ts.findAncestor(n, (a) => ts.isFunctionLike(a) && a.parent === literal || (ts.isPropertyAssignment(a) && a.parent === literal))) selfRefs.push(n);
        ts.forEachChild(n, visit);
      };
      visit(literal);
    }
    for (const n of selfRefs) t.subst.set(n, 'this');
    try {
      return this.implementationBody(cls, literal, e);
    } finally {
      for (const n of selfRefs) t.subst.delete(n);
    }
  }

  private implementationBody(cls: JavaClass, literal: ts.ObjectLiteralExpression, e: ts.NewExpression): string {
    const t = this.t;
    const base = t.indent;
    const isInterface = !!(cls.access & ACC_INTERFACE);
    const typeArgs = (t.checker.getTypeAtLocation(e) as ts.TypeReference).typeArguments;
    let supertype = this.classRef(cls, typeArgs, 'Any?', e);
    // The interface's type variables in its methods are the arguments the implementation gives them.
    const argsGiven = /<(.*)>$/.exec(supertype)?.[1];
    const typeNames = this.typeParamNames(cls);
    const chosen = argsGiven ? splitArgs(argsGiven) : [];
    const typeVar = (n: string) => chosen[typeNames.indexOf(n)] ?? 'Any?';
    if (!isInterface) {
      if (!this.constructors(cls).some((c) => !c.params.length)) throw t.error(e, `new ${javaTypeName(`L${cls.name};`)} with an implementation (its constructors all take arguments)`);
      supertype += '()';
    }
    const members: string[] = [];
    const provided = new Set<string>();
    for (const p of literal.properties) {
      const name = p.name?.getText().replace(/^['"]|['"]$/g, '') ?? '';
      const fn = ts.isMethodDeclaration(p) ? p : ts.isPropertyAssignment(p) && (ts.isArrowFunction(p.initializer) || ts.isFunctionExpression(p.initializer)) ? p.initializer : null;
      // A function value (`this.onTouch.bind(this)`): the override calls it.
      const value = !fn && ts.isPropertyAssignment(p) ? t.checker.getTypeAtLocation(p.initializer).getCallSignatures()[0] : undefined;
      const declared = value?.getDeclaration();
      if (!fn && !(declared && !ts.isJSDocSignature(declared))) throw t.error(p, `${name} in an implementation of ${javaTypeName(`L${cls.name};`)} (only methods and functions)`);
      const target = this.overrideTarget(fn ?? (declared as ts.SignatureDeclaration), [cls.name], name);
      if (!target) throw t.error(p, `${name} (${javaTypeName(`L${cls.name};`)} has no method of that name to implement)`);
      provided.add(name);
      members.push(fn ? this.overrideMethod(fn, name, target, base + '    ', typeVar) : this.overrideWithValue((p as ts.PropertyAssignment).initializer, declared as ts.SignatureDeclaration, name, target, base + '    ', typeVar));
    }
    if (isInterface) {
      const objectMethods = new Set((this.classpath.get('java/lang/Object')?.methods ?? []).map((m) => m.name + m.descriptor));
      const missing = this.classpath.supertypes(cls.name).flatMap((c) => c.methods.filter((m) => m.access & ACC_ABSTRACT && !(m.access & ACC_STATIC) && !provided.has(m.name) && !objectMethods.has(m.name + m.descriptor)).map((m) => m.name));
      if (missing.length) throw t.error(literal, `an implementation of ${javaTypeName(`L${cls.name};`)} without ${[...new Set(missing)].join(', ')}`);
    }
    return `object : ${supertype} {\n${members.join('\n')}\n${base}}`;
  }

  /**
   * A TypeScript class extending a Java class (`@NativeClass() class
   * Sparkline extends android.view.View`): a Kotlin subclass whose methods
   * that override the base class or implement a listed interface take Java's
   * signatures, whose constructor calls the Java constructor its `super(…)`
   * arguments pick, and whose own members translate as any class's do.
   * Without a constructor, it has each of the base class's.
   */
  classDecl(cls: ts.ClassDeclaration): string | null {
    const t = this.t;
    const native = this.nativeHeritage(cls);
    if (!native) {
      const heritage = cls.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
      const baseDecl = heritage && t.resolve(heritage.expression)?.valueDeclaration;
      if (baseDecl && ts.isClassDeclaration(baseDecl) && !baseDecl.getSourceFile().isDeclarationFile && this.nativeHeritage(baseDecl)) throw t.error(heritage, `extending ${heritage.getText()}, an app class that extends a Java class`);
      return null;
    }
    let { base, interfaces, listed } = native;
    // Library mode: `class Impl extends android.app.Application.ActivityLifecycleCallbacks`, as NativeScript's runtime takes it: implementing the interface.
    if (base.access & ACC_INTERFACE && t.library) {
      interfaces = [base, ...interfaces.filter((i) => i !== base)];
      base = this.classpath.get('java/lang/Object')!;
    }
    if (base.access & ACC_INTERFACE) throw t.error(cls, `extending the Java interface ${javaTypeName(`L${base.name};`)} (implement it: \`static interfaces = [...]\` or \`new ${javaTypeName(`L${base.name};`)}({ … })\`)`);
    if (base.access & ACC_FINAL) throw t.error(cls, `extending the final Java class ${javaTypeName(`L${base.name};`)}`);
    const name = t.topName(cls, cls.name!.text);
    const heritage = cls.heritageClauses!.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword)!.types[0];
    const baseType = this.classRef(base, heritage.typeArguments?.map((a) => t.checker.getTypeFromTypeNode(a)), 'Any?', heritage);
    // The base's type variables in its methods are the arguments the subclass gives them (`LruCache<string, Bitmap>`).
    const baseArgs = /<(.*)>$/.exec(baseType)?.[1];
    const baseChosen = baseArgs ? splitArgs(baseArgs) : [];
    const baseNames = this.typeParamNames(base);
    const baseTypeVar = (n: string) => baseChosen[baseNames.indexOf(n)] ?? 'Any?';
    const plain = base.name === 'java/lang/Object';
    const supers = [...(plain ? [] : [baseType]), ...interfaces.map((i) => this.classRef(i, undefined, 'Any?', cls))];
    const classes = [base.name, ...interfaces.map((i) => i.name)];
    const lines: string[] = [];
    const statics: string[] = [];
    t.indent = '    ';
    try {
      for (const m of cls.members) {
        if (!ts.isPropertyDeclaration(m) || m === listed) continue;
        const n = m.name.getText();
        const type = t.typeOf(m.name);
        if (hasStatic(m)) {
          t.indent = '        ';
          statics.push(`        var ${ident(n)}: ${type} = ${m.initializer ? t.coerce(m.initializer, type) : t.zero(type) ?? 'null'}`);
          t.indent = '    ';
          continue;
        }
        // A field, not a property: its accessors would be JVM methods that could clash with the Java class's (`getTag()`).
        if (m.initializer) lines.push(`    @JvmField var ${ident(n)}: ${type} = ${t.coerce(m.initializer, type)}`);
        else {
          const d = t.deferredDeclaration(ident(n), type);
          lines.push(`    ${d.startsWith('lateinit') ? '' : '@JvmField '}${d}`);
        }
      }
      const ctor = cls.members.find((m): m is ts.ConstructorDeclaration => ts.isConstructorDeclaration(m) && !!m.body);
      const ctors = this.constructors(base);
      // `constructor(public owner: ListView)`: a field the constructor sets.
      const paramProps = (ctor?.parameters ?? []).filter((p) => ts.isIdentifier(p.name) && ts.getModifiers(p)?.some((x) => [ts.SyntaxKind.PublicKeyword, ts.SyntaxKind.PrivateKeyword, ts.SyntaxKind.ProtectedKeyword, ts.SyntaxKind.ReadonlyKeyword].includes(x.kind)));
      for (const p of paramProps) {
        const d = t.deferredDeclaration(ident((p.name as ts.Identifier).text), t.typeOf(p.name));
        lines.push(`    ${d.startsWith('lateinit') ? '' : '@JvmField '}${d}`);
      }
      if (ctor) {
        const stmts = [...ctor.body!.statements];
        const superAt = stmts.findIndex((s) => ts.isExpressionStatement(s) && ts.isCallExpression(s.expression) && s.expression.expression.kind === ts.SyntaxKind.SuperKeyword);
        if (superAt !== 0) throw t.error(ctor, `a constructor of a class extending ${javaTypeName(`L${base.name};`)} that does not start with super(…)`);
        const superCall = (stmts[0] as ts.ExpressionStatement).expression as ts.CallExpression;
        const chosen = this.resolveOverload(ctors, [...superCall.arguments], superCall, base.name, '<init>');
        const rest = stmts.slice(1).filter((s) => !isNativeReturn(s));
        const params = ctor.parameters.map((p, k) => {
          const pn = ts.isIdentifier(p.name) ? ident(p.name.text) : `__p${k}`;
          const pt = t.typeOf(p.name);
          return `${pn}: ${p.questionToken || p.initializer ? (pt.endsWith('?') ? pt : pt + '?') : pt}`;
        });
        t.indent = '        ';
        const body = [...t.paramPrelude(ctor), ...paramProps.map((p) => `        this.${ident((p.name as ts.Identifier).text)} = ${ident((p.name as ts.Identifier).text)}`), ...t.statements(rest)];
        t.indent = '    ';
        const head = `    constructor(${params.join(', ')}) : super(${this.argList(superCall.arguments, chosen, ctors)})`;
        lines.push(body.length ? `${head} {\n${body.join('\n')}\n    }` : head);
      } else if (!plain) {
        for (const c of ctors) {
          const ps = c.params.map((d, k) => `p${k}: ${this.kotlinType(d, 'Any?')}${c.m.nullableParams?.[k] ? '?' : ''}`);
          lines.push(`    constructor(${ps.join(', ')}) : super(${c.params.map((_, k) => `p${k}`).join(', ')})`);
        }
      }
      for (const m of cls.members) {
        if (ts.isGetAccessorDeclaration(m) || ts.isSetAccessorDeclaration(m)) throw t.error(m, `an accessor in a class extending ${javaTypeName(`L${base.name};`)}`);
        if (!ts.isMethodDeclaration(m) || !m.body) continue;
        const n = m.name.getText();
        if (hasStatic(m)) {
          t.indent = '        ';
          statics.push('        ' + t.func(m, ident(n)));
          t.indent = '    ';
          continue;
        }
        const targets = this.overrideTargets(m, classes, n);
        lines.push(targets.length ? targets.map((target) => this.overrideMethod(m, n, target, '    ', target.m.owner === base.name ? baseTypeVar : 'Any?')).join('\n') : '    ' + t.func(m, ident(n)));
      }
    } finally {
      t.indent = '';
    }
    if (statics.length) lines.push('    companion object {', ...statics, '    }');
    return this.declared(name, (simple) => [`class ${ident(simple)}${supers.length ? ` : ${supers.join(', ')}` : ''} {`, ...lines, '}'].join('\n'));
  }

  // ---- `Base.extend({ … })` and `Array.create(type, length)` -----------------------------------

  private extensions = new Map<ts.CallExpression, Extension | null>();
  private extensionOwners = new Map<ts.VariableDeclaration, Extension>();
  private scanned = new Set<ts.SourceFile>();

  /**
   * `Base.extend({ … })`, `Base.extend('Name', { … })`, `(Base as any).extend(…)`:
   * NativeScript's Java subclass of Base (of java.lang.Object implementing
   * `interfaces`), whose methods are the literal's, its value the class.
   */
  private extension(call: ts.CallExpression): Extension | null {
    if (!this.extensions.has(call)) this.extensions.set(call, this.makeExtension(call));
    return this.extensions.get(call)!;
  }

  private makeExtension(call: ts.CallExpression): Extension | null {
    const callee = call.expression;
    if (!ts.isPropertyAccessExpression(callee) || callee.name.text !== 'extend') return null;
    const args = call.arguments;
    const literal = args.length === 1 ? args[0] : args.length === 2 && ts.isStringLiteralLike(args[0]) ? args[1] : undefined;
    if (!literal || !ts.isObjectLiteralExpression(literal)) return null;
    const recv = skipCasts(callee.expression);
    if (!ts.isIdentifier(recv) && !ts.isPropertyAccessExpression(recv)) return null;
    const sym = this.classSymbol(recv);
    let base = this.untypedClass(recv) ?? (sym && sym.flags & ts.SymbolFlags.Class && this.isNativeSymbol(sym) ? this.classOf(sym, recv) : null);
    if (!base) {
      const decl = sym?.valueDeclaration;
      if (decl && ts.isVariableDeclaration(decl) && this.extensionOf(decl)) throw this.t.error(call, `extending ${recv.getText()}, a class made by extend`);
      return null;
    }
    if (this.methods([base.name], 'extend', true).length) return null;
    const interfaces: JavaClass[] = [];
    if (base.access & ACC_INTERFACE) {
      interfaces.push(base);
      base = this.classpath.get('java/lang/Object')!;
    }
    const listed = literal.properties.find((p) => propertyName(p) === 'interfaces');
    if (listed) {
      if (!ts.isPropertyAssignment(listed) || !ts.isArrayLiteralExpression(listed.initializer)) throw this.t.error(listed, 'interfaces other than an array literal of Java interfaces');
      for (const el of listed.initializer.elements) {
        const i = this.untypedClass(el) ?? this.classOf(this.classSymbol(el), el);
        if (!i || !(i.access & ACC_INTERFACE)) throw this.t.error(el, `${el.getText()} (not a Java interface)`);
        if (!interfaces.includes(i)) interfaces.push(i);
      }
    }
    // The class is declared where the variable holding it is: `const X = Base.extend(…)`, or `let X` assigned it later.
    let at: ts.Node = call;
    while (ts.isParenthesizedExpression(at.parent) || ts.isAsExpression(at.parent) || ts.isTypeAssertionExpression(at.parent) || ts.isNonNullExpression(at.parent)) at = at.parent;
    const p = at.parent;
    let owner: ts.VariableDeclaration | null = null;
    if (ts.isVariableDeclaration(p) && p.initializer === at && ts.isIdentifier(p.name)) owner = p;
    else if (ts.isBinaryExpression(p) && p.operatorToken.kind === ts.SyntaxKind.EqualsToken && p.right === at && ts.isIdentifier(p.left) && ts.isExpressionStatement(p.parent)) {
      const d = this.t.resolve(p.left)?.valueDeclaration;
      if (d && ts.isVariableDeclaration(d) && ts.isIdentifier(d.name)) owner = d;
    }
    // Library mode: `extend('com.tns.NativeScriptActivity', { … })` is that Java class, as an app's manifest names it.
    const javaName = this.t.library && args.length === 2 && ts.isStringLiteralLike(args[0]) && args[0].text.includes('.') ? args[0].text : undefined;
    const name = javaName ?? (!owner ? '' : ts.isSourceFile(owner.parent.parent.parent) ? ident(this.t.topName(owner, owner.name.getText())) : ident(owner.name.getText()));
    return { call, literal, base, interfaces, owner, name, javaName };
  }

  /** The extend class a variable holds. */
  private extensionOf(d: ts.VariableDeclaration): Extension | null {
    const sf = d.getSourceFile();
    if (!this.scanned.has(sf) && !sf.isDeclarationFile) {
      this.scanned.add(sf);
      const visit = (n: ts.Node) => {
        if (ts.isCallExpression(n)) {
          let x: Extension | null = null;
          // A class Kotlin cannot make is reported where code uses it, not where a module is scanned.
          try { x = this.extension(n); } catch { this.extensions.delete(n); }
          if (x?.owner) {
            if (this.extensionOwners.has(x.owner)) throw this.t.error(n, `${x.owner.name.getText()} assigned a second class made by extend`);
            this.extensionOwners.set(x.owner, x);
          }
        }
        ts.forEachChild(n, visit);
      };
      visit(sf);
    }
    return this.extensionOwners.get(d) ?? null;
  }

  private extensionNamed(e: ts.Expression): Extension | null {
    if (!ts.isIdentifier(e)) return null;
    const d = this.t.resolve(e)?.valueDeclaration;
    return d && ts.isVariableDeclaration(d) ? this.extensionOf(d) : null;
  }

  /** The extend class whose instance `this` is: in a method of the literal, or an arrow function inside one. */
  private extensionOfThis(e: ts.Node): Extension | null {
    if (e.kind !== ts.SyntaxKind.ThisKeyword) return null;
    let f: ts.Node | undefined = e.parent;
    while (f && !(ts.isFunctionLike(f) && !ts.isArrowFunction(f)) && !ts.isClassLike(f)) f = f.parent;
    if (!f || !ts.isFunctionLike(f)) return null;
    const member = ts.isMethodDeclaration(f) ? f : ts.isFunctionExpression(f) && ts.isPropertyAssignment(f.parent) ? f.parent : null;
    if (!member || !ts.isObjectLiteralExpression(member.parent) || !ts.isCallExpression(member.parent.parent)) return null;
    const x = this.extension(member.parent.parent);
    return x?.literal === member.parent ? x : null;
  }

  /** `this.name` where the literal declares `name`: a member of the Kotlin class. */
  private ownMember(e: ts.Expression): { x: Extension; p: ts.ObjectLiteralElementLike; fn: ts.FunctionLikeDeclaration | null } | null {
    if (!ts.isPropertyAccessExpression(e)) return null;
    const x = this.extensionOfThis(e.expression);
    const name = e.name.text;
    const p = name === 'interfaces' ? undefined : x?.literal.properties.find((q) => propertyName(q) === name);
    return p ? { x: x!, p, fn: functionOf(p) } : null;
  }

  private ownCall(fn: ts.FunctionLikeDeclaration, name: string, e: ts.CallExpression): string {
    if (fn.parameters.some((p) => p.dotDotDotToken)) throw this.t.error(e, `${name}() (a rest parameter in an extend class)`);
    // As the method declares its parameters in Kotlin: a lenient one nullable.
    const args = e.arguments.slice(0, fn.parameters.length).map((a, k) => this.t.coerce(a, this.t.library ? this.t.paramType(fn.parameters[k]) : this.t.typeOf(fn.parameters[k].name)));
    return `${this.t.expr((e.expression as ts.PropertyAccessExpression).expression)}.${ident(name)}(${args.join(', ')})`;
  }

  /** `this.super.name(…)`: the superclass's method. */
  private superCall(x: Extension, name: string, e: ts.CallExpression): Raw {
    const what = `this.super.${name}()`;
    const candidates = this.methods([x.base.name], name, false);
    if (!candidates.length) throw this.t.error(e, `${what} (${javaTypeName(`L${x.base.name};`)} has no method of that name)`);
    const chosen = this.resolveOverload(candidates, [...e.arguments], e, x.base.name, name);
    if (chosen.m.access & ACC_ABSTRACT) throw this.t.error(e, `${what} (abstract in ${javaTypeName(`L${chosen.m.owner};`)})`);
    // Inside an object expression the method makes, plain `super` would be that object's.
    const zuper = this.t.thisAlias ? `super@${x.name}` : 'super';
    return { code: `${zuper}.${ident(name)}(${this.argList(e.arguments, chosen, candidates)})`, desc: chosen.ret, nullable: chosen.m.nullable };
  }

  /** A local of a function between the variable's scope and the extend call, which a class declared with the variable cannot see. */
  private capturedLocal(x: Extension): ts.Identifier | null {
    const ownerScope = scopeOf(x.owner!);
    let found: ts.Identifier | null = null;
    const visit = (n: ts.Node) => {
      if (found) return;
      if (ts.isIdentifier(n)) {
        const d = this.t.resolve(n)?.valueDeclaration;
        const s = d && d.getSourceFile() === x.call.getSourceFile() ? scopeOf(d) : null;
        if (s && s !== ownerScope && !ts.isSourceFile(s) && contains(s, x.call) && contains(ownerScope, s) && !contains(x.literal, d!)) found = n;
      }
      ts.forEachChild(n, visit);
    };
    visit(x.literal);
    return found;
  }

  /**
   * The Kotlin class an extend call makes, declared where the variable
   * holding it is: Base's constructors, the literal's other properties as
   * fields, its methods overriding Base's or the interfaces' with Java's
   * signatures (else plain members), and `init()` run once constructed.
   */
  extensionClass(d: ts.VariableDeclaration): string | null {
    const x = this.extensionOf(d);
    return x ? this.extensionCode(x) : null;
  }

  /** A Java class's name a class takes: its own package's, declared in a file of that package; '' where the class is declared so. */
  private declared(name: string, code: (simple: string) => string): string {
    if (!name.includes('.')) return code(name);
    this.t.foreign.push({ name, code: code(name.slice(name.lastIndexOf('.') + 1)) });
    return '';
  }

  private extensionCode(x: Extension): string {
    const t = this.t;
    const d = x.owner;
    const { base, interfaces, literal } = x;
    if (base.access & ACC_FINAL) throw t.error(x.call, `extending the final Java class ${javaTypeName(`L${base.name};`)}`);
    const captured = d ? this.capturedLocal(x) : null;
    if (captured) throw t.error(captured, `${captured.text} in an extend class assigned to ${d!.name.getText()} (a local the class, declared with ${d!.name.getText()}, cannot see)`);
    const plain = base.name === 'java/lang/Object';
    const supers = [...(plain ? [] : [this.classRef(base, undefined, 'Any?', x.call)]), ...interfaces.map((i) => this.classRef(i, undefined, 'Any?', x.call))];
    const classes = extensionClasses(x);
    const outer = x.javaName ? '' : t.indent;
    const inner = outer + '    ';
    const fields: string[] = [];
    const ctors: string[] = [];
    const methods: string[] = [];
    const provided = new Set<string>();
    let init = false;
    const savedAlias = t.thisAlias;
    t.thisAlias = null;
    t.indent = inner;
    try {
      if (!plain) {
        const all = this.constructors(base);
        if (!all.length) throw t.error(x.call, `extending ${javaTypeName(`L${base.name};`)} (no accessible Java constructor)`);
        for (const c of all) {
          const ps = c.params.map((desc, k) => `p${k}: ${this.kotlinType(desc, 'Any?')}${c.m.nullableParams?.[k] ? '?' : ''}`);
          ctors.push(`${inner}constructor(${ps.join(', ')}) : super(${c.params.map((_, k) => `p${k}`).join(', ')})`);
        }
      }
      for (const p of literal.properties) {
        const name = propertyName(p);
        if (name === 'interfaces') continue;
        if (name === undefined || !(ts.isPropertyAssignment(p) || ts.isShorthandPropertyAssignment(p) || ts.isMethodDeclaration(p))) throw t.error(p, 'a member of an extend class other than a method or a named value');
        const fn = functionOf(p);
        if (!fn) {
          const type = t.typeOf(p.name);
          const value = ts.isPropertyAssignment(p) ? p.initializer : (p as ts.ShorthandPropertyAssignment).name;
          fields.push(`${inner}@JvmField var ${ident(name)}: ${type} = ${t.coerce(value, type)}`);
          continue;
        }
        if (ts.isArrowFunction(fn) && refersToThis(fn.body)) throw t.error(p, `${name} (an arrow function using this; write it as a method)`);
        provided.add(name);
        if (name === 'init') {
          if (fn.parameters.length) throw t.error(p, 'init with parameters in an extend class');
          init = true;
        }
        const targets = name === 'init' ? [] : this.overrideTargets(fn, classes, name);
        methods.push(targets.length ? targets.map((target) => this.overrideMethod(fn, name, target, inner)).join('\n') : inner + t.func(fn as ts.MethodDeclaration, ident(name)));
      }
    } finally {
      t.indent = outer;
      t.thisAlias = savedAlias;
    }
    if (plain) {
      const objectMethods = new Set((this.classpath.get('java/lang/Object')?.methods ?? []).map((m) => m.name + m.descriptor));
      const missing = interfaces.flatMap((i) => this.classpath.supertypes(i.name)).flatMap((c) => c.methods.filter((m) => m.access & ACC_ABSTRACT && !(m.access & ACC_STATIC) && !provided.has(m.name) && !objectMethods.has(m.name + m.descriptor)).map((m) => m.name));
      if (missing.length) throw t.error(literal, `an extend class implementing ${interfaces.map((i) => javaTypeName(`L${i.name};`)).join(', ')} without ${[...new Set(missing)].join(', ')}`);
    }
    const body = [...fields, ...ctors, ...(init ? [`${inner}init { init() }`] : []), ...methods];
    return this.declared(x.name, (simple) => [`${x.javaName ? '' : outer}class ${simple}${supers.length ? ` : ${supers.join(', ')}` : ''} {`, ...body, `${x.javaName ? '' : outer}}`].join('\n'));
  }

  /** `Array.create(java.lang.String, n)`, `Array.create('int', n)`: a Java array of n default elements. */
  private arrayCreate(e: ts.CallExpression): Raw | null {
    const callee = e.expression;
    if (!ts.isPropertyAccessExpression(callee) || callee.name.text !== 'create' || !ts.isIdentifier(callee.expression) || callee.expression.text !== 'Array' || e.arguments.length !== 2) return null;
    if (!(this.t.resolve(callee) ?? this.t.resolve(callee.name))?.declarations?.some((d) => this.isNativeDeclaration(d))) return null;
    const [type, length] = e.arguments;
    let el: string;
    if (ts.isStringLiteralLike(type)) {
      const prim = Object.keys(ARRAY_OF).find((k) => ARRAY_OF[k] === type.text);
      const cls = prim ? null : this.classpath.get(type.text.replace(/\./g, '/'));
      if (!prim && !cls) throw this.t.error(type, `Array.create of ${type.text} (no class file of that name on the classpath)`);
      el = prim ?? `L${cls!.name};`;
    } else {
      const cls = this.untypedClass(type) ?? this.classOf(this.classSymbol(type), type);
      if (!cls) throw this.t.error(type, `Array.create of ${type.getText()} (not a Java class)`);
      el = `L${cls.name};`;
    }
    const n = `${atom(this.t.toNumber(length))}.toInt()`;
    return { code: ARRAY_OF[el] ? `${KOTLIN_PRIMITIVE[el]}Array(${n})` : `arrayOfNulls<${this.kotlinType(el, 'Any?')}>(${n})`, desc: `[${el}` };
  }

  /** A `const` holding an `Array.create(…)`: the Java array's type, for choosing an overload. */
  private createdArray(e: ts.Expression): Raw | null {
    const d = ts.isIdentifier(e) ? this.t.resolve(e)?.valueDeclaration : undefined;
    if (!d || !ts.isVariableDeclaration(d) || !(d.parent.flags & ts.NodeFlags.Const) || !d.initializer || !ts.isCallExpression(d.initializer)) return null;
    return this.arrayCreate(d.initializer);
  }
}

function extensionClasses(x: Extension): string[] {
  return [x.base.name, ...x.interfaces.map((i) => i.name)];
}

function skipCasts(e: ts.Expression): ts.Expression {
  while (ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isTypeAssertionExpression(e) || ts.isNonNullExpression(e)) e = e.expression;
  return e;
}

function propertyName(p: ts.ObjectLiteralElementLike): string | undefined {
  if (!p.name || ts.isComputedPropertyName(p.name) || ts.isPrivateIdentifier(p.name)) return undefined;
  return p.name.text;
}

function functionOf(p: ts.ObjectLiteralElementLike): ts.FunctionLikeDeclaration | null {
  if (ts.isMethodDeclaration(p)) return p;
  return ts.isPropertyAssignment(p) && (ts.isArrowFunction(p.initializer) || ts.isFunctionExpression(p.initializer)) ? p.initializer : null;
}

/** The function or module a declaration's name is visible throughout. */
function scopeOf(d: ts.Node): ts.Node {
  let n = d.parent;
  while (!ts.isSourceFile(n) && !(ts.isFunctionLike(n) && 'body' in n)) n = n.parent;
  return n;
}

function contains(outer: ts.Node, n: ts.Node): boolean {
  for (let p: ts.Node | undefined = n; p; p = p.parent) if (p === outer) return true;
  return false;
}

function hasStatic(m: ts.Node): boolean {
  return ts.canHaveModifiers(m) && !!ts.getModifiers(m)?.some((x) => x.kind === ts.SyntaxKind.StaticKeyword);
}

/** `return global.__native(this)`: NativeScript's runtime hook a TypeScript constructor of a Java subclass ends with. */
function isNativeReturn(s: ts.Statement): boolean {
  if (!ts.isReturnStatement(s) || !s.expression || !ts.isCallExpression(s.expression)) return false;
  const callee = s.expression.expression;
  return (ts.isIdentifier(callee) && callee.text === '__native') || (ts.isPropertyAccessExpression(callee) && callee.name.text === '__native');
}

function numericLiteral(e: ts.Expression): number | null {
  while (ts.isParenthesizedExpression(e)) e = e.expression;
  if (ts.isNumericLiteral(e)) return Number(e.text.replace(/_/g, ''));
  if (ts.isPrefixUnaryExpression(e) && e.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(e.operand)) return -Number(e.operand.text.replace(/_/g, ''));
  return null;
}

/** A number literal as Kotlin writes a literal of the Java primitive `desc`. */
function primitiveLiteral(v: number, desc: string): string {
  const whole = Number.isInteger(v);
  switch (desc) {
    case 'D': return numberLiteral(String(v));
    case 'F': return Number.isFinite(v) ? `${String(v).replace(/e\+?/, 'e')}f` : `${numberLiteral(String(v))}.toFloat()`;
    case 'I': return whole && Math.abs(v) <= 0x7fffffff ? String(v) : `(${numberLiteral(String(v))}).toInt()`;
    case 'J': return whole && Number.isSafeInteger(v) ? `${v}L` : `(${numberLiteral(String(v))}).toLong()`;
    case 'C': return `${Math.trunc(v)}.toChar()`;
    default: return `(${whole ? v : numberLiteral(String(v))})${CONVERT[desc].replace('.toInt().', whole ? '.' : '.toInt().')}`;
  }
}

function charLiteral(c: string): string {
  const escapes: Record<string, string> = { '\\': '\\\\', "'": "\\'", '\n': '\\n', '\r': '\\r', '\t': '\\t', '$': '$' };
  return `'${escapes[c] ?? (c.charCodeAt(0) < 0x20 ? `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}` : c)}'`;
}

/** Kotlin code that a member access or conversion can follow as is: a name chain, a call chain, or one parenthesized group. */
function atom(code: string): string {
  let depth = 0;
  for (let i = 0; i < code.length; i++) {
    const c = code[i];
    if (c === '"') {
      for (i++; i < code.length && code[i] !== '"'; i++) if (code[i] === '\\') i++;
      continue;
    }
    if ('([{'.includes(c)) depth++;
    else if (')]}'.includes(c)) depth--;
    else if (depth === 0 && !/[\w.!?:$]/.test(c)) return `(${code})`;
    else if (depth === 0 && c === '?' && code[i + 1] !== '.') return `(${code})`;
    else if (depth === 0 && c === ':' && code[i + 1] !== ':') return `(${code})`;
  }
  return code;
}

/** Whether `this` appears in `e` outside nested functions that bind their own. */
function refersToThis(e: ts.Node): boolean {
  let found = false;
  const visit = (n: ts.Node) => {
    if (found) return;
    if (n.kind === ts.SyntaxKind.ThisKeyword) { found = true; return; }
    if (ts.isFunctionDeclaration(n) || ts.isFunctionExpression(n) || ts.isMethodDeclaration(n) || ts.isClassLike(n)) return;
    ts.forEachChild(n, visit);
  };
  visit(e);
  return found;
}

/** Kotlin type arguments split at their top-level commas. */
function splitArgs(text: string): string[] {
  const out: string[] = [];
  let depth = 0, start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '<' || ch === '(') depth++;
    else if ((ch === '>' && text[i - 1] !== '-') || ch === ')') depth--;
    else if (ch === ',' && depth === 0) { out.push(text.slice(start, i).trim()); start = i + 1; }
  }
  out.push(text.slice(start).trim());
  return out;
}
