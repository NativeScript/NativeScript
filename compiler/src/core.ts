import ts from 'typescript';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { kitExtends, kitIndex, kitMember, type KitMember, type KitType } from './kit-index.ts';
import type { Translator } from './swift.ts';

export const KIT = fileURLToPath(new URL('../../kit/Sources/NativeScriptKit', import.meta.url));

/** The native view a core class drives on iOS: what `view.ios` and `view.nativeView` are. */
export const NATIVE_VIEWS: Record<string, string> = {
  Label: 'UILabel', Button: 'UIButton', TextField: 'UITextField', TextView: 'UITextView', Image: 'UIImageView', Switch: 'UISwitch',
  Slider: 'UISlider', SegmentedBar: 'UISegmentedControl', ActivityIndicator: 'UIActivityIndicatorView', ScrollView: 'UIScrollView',
  ListView: 'UITableView', Progress: 'UIProgressView', DatePicker: 'UIDatePicker', TimePicker: 'UIDatePicker', WebView: 'WKWebView', View: 'UIView',
};
const NATIVE_MEMBERS = new Set(['ios', 'nativeView', 'nativeViewProtected']);
/** View methods whose arguments core reads as plain script objects. */
const SCRIPT_OBJECTS = new Set(['animate', 'createAnimation', 'open', 'close', 'openShadeCover', 'closeShadeCover', 'showModal', 'closeModal']);

const barrels = new Map<string, Map<string, string>>();
/** `export * as Utils from './utils'` in core's index: folder → public name. */
function coreBarrels(root: string): Map<string, string> {
  let names = barrels.get(root);
  if (names) return names;
  names = new Map();
  const index = join(root, 'index.d.ts');
  if (existsSync(index)) for (const m of readFileSync(index, 'utf8').matchAll(/^export \* as (\w+) from '\.\/([^'/]+)[^']*';/gm)) names.set(m[2], m[1]);
  barrels.set(root, names);
  return names;
}

/** A declaration of core's TypeScript API; the typings of its own native code (`objc!NativeScriptUtils.d.ts`) are native declarations. */
export function isCoreDeclaration(decl: ts.Declaration | undefined): boolean {
  const file = decl?.getSourceFile().fileName;
  return !!file && KIT_PACKAGES.test(file) && !/[\\/]objc![^\\/]+\.d\.ts$/.test(file);
}

/** A member core's declarations mark as a view property (`@nsProperty`). */
export function isCoreProperty(decl: ts.Declaration): boolean {
  return /[\\/]@nativescript[\\/]core[\\/]/.test(decl.getSourceFile().fileName) && ts.getJSDocTags(decl).some((t) => t.tagName.text === 'nsProperty');
}

/**
 * With `--allow-unimplemented-properties`, a core property the kit does not apply is
 * stored by name and does nothing, as in a template; otherwise it stops the build.
 */
export function unappliedProperty(t: { resolve(n: ts.Node): ts.Symbol | undefined; allowUnapplied: boolean; error(n: ts.Node, what: string): Error }, name: ts.MemberName, what: string, kit: string): void {
  const declared = (t.resolve(name)?.declarations ?? []).some(isCoreProperty);
  if (!declared || !t.allowUnapplied) throw t.error(name.parent, `${what} (${declared ? `core declares it, ${kit} does not apply it` : `not a property ${kit} applies`})`);
  const sf = name.getSourceFile();
  console.warn(`warning: ${sf.fileName}:${sf.getLineAndCharacterOfPosition(name.getStart()).line + 1}: ${what}: core declares it, ${kit} does not apply it`);
}

/**
 * Packages the kit implements, typed by their own declarations: core, and plugins whose
 * native release is a kit module (`kit/Sources/NativeScriptKit/Plugins/`) rather than their
 * compiled source: @nstudio/nativescript-ui-pager's Pager. @nativescript/canvas is compiled
 * from its source over its native library, WebGPU included.
 */
export const KIT_PLUGINS = ['@nstudio/nativescript-ui-pager'];
const KIT_PACKAGES = new RegExp(`[\\\\/](${['@nativescript/core', ...KIT_PLUGINS].map((p) => p.replace(/\//g, '[\\\\/]')).join('|')})[\\\\/]`);

/** The native class a core class's `ios` is, walking up to the nearest one the table names. */
export function nativeViewOf(checker: ts.TypeChecker, type: ts.Type, table: Record<string, string> = NATIVE_VIEWS): string | null {
  const visit = (t: ts.Type): string | null => {
    const sym = t.getSymbol();
    if (!sym || !isCoreDeclaration(sym.declarations?.[0])) return null;
    if (table[sym.name]) return table[sym.name];
    for (const b of (t.isClassOrInterface() ? checker.getBaseTypes(t) : [])) {
      const found = visit(b);
      if (found) return found;
    }
    return null;
  };
  return visit(checker.getNonNullableType(type));
}

/**
 * @nativescript/core's API as NativeScriptKit offers it. A core class is the
 * kit class of the same name; a member the kit declares is used as it is
 * (numbers converted to Double), a view property the kit applies by name
 * (`text`, `color`) is set and read through `set`/`get`, and anything else
 * stops the build with the file and line.
 */
export class CoreAPI {
  private index: Map<string, KitType>;
  private t: Translator;

  constructor(t: Translator) {
    this.t = t;
    this.index = kitIndex(KIT);
  }

  /** Whether NativeScriptKit declares a type of this name itself, not only extends one. */
  declares(name: string): boolean {
    return !!this.index.get(name)?.declared;
  }

  typeNames(): string[] {
    return [...this.index.values()].filter((t) => t.declared && !t.name.includes('.')).map((t) => t.name);
  }

  /** Whether NativeScriptKit declares a type of this name. */
  has(name: string): boolean {
    return this.index.has(name);
  }

  /** Whether a kit class's initializer taking no arguments throws. */
  initThrows(name: string): boolean {
    for (let t = this.index.get(name); t; t = t.base ? this.index.get(t.base) : undefined) {
      const plain = (t.members.get('init') ?? []).find((m) => !(m.params ?? '').trim());
      if (plain) return !!plain.throws;
    }
    return false;
  }

  /** Whether a kit type extends another (`View` extends `ViewBase`). */
  extendsKit(sub: string, base: string): boolean {
    return sub !== base && kitExtends(this.index, sub, base);
  }

  /** Whether a kit type is a view (extends View). */
  isKitView(name: string): boolean {
    return kitExtends(this.index, name, 'View');
  }

  /** A member of a kit type or a type it extends, as the kit declares it. */
  kitMember(owner: string, name: string): KitMember | null {
    return kitMember(this.index, owner, name);
  }

  /** The kit type a core-typed expression is, and whether it is the type itself (`Device.model`, `Color.isValid`). */
  owner(e: ts.Expression): { name: string; isStatic: boolean } | null {
    const c = this.t.checker;
    // A namespace inside a core namespace (`Utils.layout`): the kit's nested type of that path.
    if (ts.isPropertyAccessExpression(e)) {
      const sym = this.t.resolve(e);
      if (sym && isCoreDeclaration(sym.declarations?.[0])) {
        const outer = this.owner(e.expression);
        const name = outer?.isStatic ? `${outer.name}.${e.name.text}` : null;
        if (name && this.index.has(name)) return { name, isStatic: true };
      }
    }
    if (ts.isIdentifier(e)) {
      const module = this.moduleOwner(e);
      if (module) return { name: module, isStatic: true };
      const sym = this.t.resolve(e);
      const decl = sym?.declarations?.[0];
      if (sym && isCoreDeclaration(decl) && (sym.flags & (ts.SymbolFlags.Class | ts.SymbolFlags.ValueModule | ts.SymbolFlags.Variable)) && !this.t.compiledCounterpart(sym)) {
        if (sym.flags & ts.SymbolFlags.ValueModule) return { name: e.text, isStatic: true };
        if (sym.flags & ts.SymbolFlags.Class) return { name: sym.name, isStatic: true };
        // A constant core exports (`Device`): the kit has a type of that name with static members.
        if (this.index.has(sym.name)) return { name: sym.name, isStatic: true };
      }
      if (sym && sym.flags & ts.SymbolFlags.Alias) return null;
    }
    // Library mode: core's own interfaces (`ModuleContext`, `NavigationTransition`) are shapes the generated code reads, not kit types.
    if (this.t.library) {
      const decl = c.getNonNullableType(c.getTypeAtLocation(e)).getSymbol()?.declarations?.[0];
      if (decl && (ts.isInterfaceDeclaration(decl) || ts.isTypeLiteralNode(decl)) && isCoreDeclaration(decl)) return null;
    }
    let type = c.getNonNullableType(c.getTypeAtLocation(e));
    // `View & { extra?: … }`: the core class.
    if (type.isIntersection()) type = type.types.find((u) => (u.getSymbol()?.flags ?? 0) & ts.SymbolFlags.Class && isCoreDeclaration(u.getSymbol()?.declarations?.[0])) ?? type;
    const sym = type.getSymbol();
    // `global`, typed as `typeof globalThis`: the program's global object, which core's typings only augment.
    if (sym?.name === 'globalThis' && sym.flags & ts.SymbolFlags.ValueModule) return null;
    const mixin = this.t.mixinOf(sym);
    if (mixin) return { name: mixin, isStatic: false };
    // An interface extending a core class (`interface MenuView extends View`): that class.
    if (sym && sym.flags & ts.SymbolFlags.Interface && !isCoreDeclaration(sym.declarations?.[0]) && type.isClassOrInterface()) {
      const base = c.getBaseTypes(type as ts.InterfaceType).map((b) => b.getSymbol()).find((b) => b && b.flags & ts.SymbolFlags.Class && isCoreDeclaration(b.declarations?.[0]));
      if (base) return { name: base.name, isStatic: false };
    }
    if (!sym || !isCoreDeclaration(sym.declarations?.[0]) || this.t.compiledCounterpart(sym)) return null;
    // Core's event data types are the kit's one EventData, whose members the translator reads directly.
    if (this.t.type(type, e) === 'EventData') return null;
    const name = sym.name;
    // An interface core's typings declare (`Screen.mainScreen: ScreenMetrics`) where the kit's member holds its class (`MainScreen`).
    if (!this.index.has(name) && sym.flags & ts.SymbolFlags.Interface && ts.isPropertyAccessExpression(e)) {
      const outer = this.owner(e.expression);
      const held = outer && kitMember(this.index, outer.name, e.name.text)?.type.replace(/[?!]$/, '');
      if (held && this.index.has(held)) return { name: held, isStatic: false };
    }
    // A shape core's typings declare (`{ unit: 'dip'; value: number }`) that the kit has no type for: read as any object is.
    if (!this.index.has(name) && (sym.flags & ts.SymbolFlags.TypeLiteral || sym.flags & ts.SymbolFlags.Interface)) return null;
    return { name, isStatic: false };
  }

  /**
   * A core module or namespace imported under any name (`import * as utils from
   * '../utils'`, `import { ios as iosUtils } from './native-helper'`): the kit
   * type of its public path, `Utils` or `Utils.ios`, as core's index exports it.
   */
  private moduleOwner(e: ts.Identifier): string | null {
    const local = this.t.checker.getSymbolAtLocation(e);
    const target = local && local.flags & ts.SymbolFlags.Alias ? this.t.checker.getAliasedSymbol(local) : local;
    const decl = target?.valueDeclaration ?? target?.declarations?.[0];
    // A module or namespace, or a module's constant object of functions (`export const ios = { … }`).
    const constant = !!target && !!(target.flags & ts.SymbolFlags.Variable) && !!decl && ts.isVariableDeclaration(decl) && ts.isSourceFile(decl.parent.parent.parent);
    if (!target || !(target.flags & ts.SymbolFlags.ValueModule || constant) || !decl || !isCoreDeclaration(decl)) return null;
    const file = decl.getSourceFile().fileName;
    const root = /^(.*[\\/]@nativescript[\\/]core)[\\/]/.exec(file)?.[1];
    const barrel = root ? coreBarrels(root).get(file.slice(root.length + 1).split(/[\\/]/)[0]) : undefined;
    const candidates = ts.isSourceFile(decl) ? [barrel] : [barrel && `${barrel}.${target.name}`, constant ? undefined : target.name];
    return candidates.find((c): c is string => !!c && this.index.has(c)) ?? null;
  }

  private member(owner: string, name: string, e: ts.Node): KitMember {
    const m = kitMember(this.index, owner, name);
    if (!m) throw this.t.error(e, `${owner}.${name} (NativeScriptKit has no such member)`);
    return m;
  }

  /** A view, or a view's `style`: properties by name. */
  private isView(owner: string): boolean {
    return owner === 'Style' || kitExtends(this.index, owner, 'View');
  }

  /** Whether the kit applies `name` by name on this view class (a property in its setProperty). */
  private isViewProperty(owner: string, name: string): boolean {
    // A style property applies to any view; the kit's classes each apply their own.
    if (owner === 'Style') return [...this.index.values()].some((t) => kitExtends(this.index, t.name, 'View') && t.props.has(name));
    for (let t = this.index.get(owner); t; t = t.base ? this.index.get(t.base) : undefined) if (t.props.has(name)) return true;
    return false;
  }

  /** A read of `target.name` where target is core-typed, or null when it is not. */
  property(e: ts.PropertyAccessExpression): string | null {
    const constant = this.constant(e);
    if (constant !== null) return constant;
    const owner = this.mixinOwn(e.name) ? null : this.owner(e.expression) ?? this.inheritedOwner(e.expression, e.name);
    if (!owner) return null;
    const t = this.t;
    const name = e.name.text;
    const chained = !owner.isStatic && !!e.questionDotToken && t.typeOf(e.expression).endsWith('?');
    const recv = owner.isStatic ? owner.name : t.expr(e.expression) + (chained ? '?' : '');
    if (!owner.isStatic && NATIVE_MEMBERS.has(name) && this.isView(owner.name)) return `${recv}.nativeView`;
    if (!owner.isStatic && this.isView(owner.name) && !kitMember(this.index, owner.name, name)) {
      if (!this.isViewProperty(owner.name, name)) unappliedProperty(t, e.name, `${owner.name}.${name}`, 'NativeScriptKit');
      return t.fromAnyCode(`${recv}.get(${JSON.stringify(name)})`, t.typeOf(e), true);
    }
    const m = this.member(owner.name, name, e);
    return this.fromKit(`${recv}.${name}`, chained ? m.type.replace(/\??$/, '?') : m.type, t.typeOf(e));
  }

  /** A constant core declares with a literal type (`CoreTypes.AnimationCurve.easeIn` is "easeIn"), as that literal. */
  private constant(e: ts.PropertyAccessExpression): string | null {
    const decl = this.t.resolve(e.name)?.declarations?.[0];
    if (!decl || !isCoreDeclaration(decl) || !ts.isVariableDeclaration(decl) || !(ts.getCombinedNodeFlags(decl) & ts.NodeFlags.Const)) return null;
    const type = this.t.checker.getTypeAtLocation(decl);
    if (type.isStringLiteral()) return JSON.stringify(type.value);
    if (type.isNumberLiteral()) return String(type.value);
    return null;
  }

  /** `target.name = value` where target is core-typed. */
  assign(left: ts.PropertyAccessExpression, value: ts.Expression): string | null {
    const owner = this.mixinOwn(left.name) ? null : this.owner(left.expression) ?? this.inheritedOwner(left.expression, left.name);
    if (!owner) return null;
    const t = this.t;
    const name = left.name.text;
    const recv = owner.isStatic ? owner.name : t.expr(left.expression);
    // A member a kit-implemented plugin declares itself (a Canvas's `width`, its surface in pixels) is not the view property of that name.
    const pluginOwn = (t.resolve(left.name)?.declarations ?? []).some((d) => KIT_PLUGINS.some((p) => d.getSourceFile().fileName.includes(`/node_modules/${p}/`)));
    if (!owner.isStatic && this.isView(owner.name) && (!kitMember(this.index, owner.name, name) || (this.isViewProperty(owner.name, name) && !pluginOwn))) {
      if (!this.isViewProperty(owner.name, name)) unappliedProperty(t, left.name, `${owner.name}.${name}`, 'NativeScriptKit');
      return `${recv}.set(${JSON.stringify(name)}, ${t.coerce(value, 'Any?')})`;
    }
    const m = this.member(owner.name, name, left);
    // A kit member typed `Any?` holds what core reads as a plain script object (`TouchManager.animations`).
    if (m.type.trim() === 'Any?') return `${recv}.${name} = ${this.scriptValue(value)}`;
    return `${recv}.${name} = ${this.toKit(t.coerce(value, t.typeOf(left)), m.type)}`;
  }

  /** A core member read through a class of the app or a plugin that extends a core class (`this.isPassThroughParentEnabled` in a GridLayout subclass). */
  private inheritedOwner(target: ts.Expression, name: ts.MemberName): { name: string; isStatic: boolean } | null {
    const c = this.t.checker;
    const decl = c.getSymbolAtLocation(name)?.valueDeclaration;
    if (!decl || !isCoreDeclaration(decl)) return null;
    const cls = c.getNonNullableType(c.getTypeAtLocation(target)).getSymbol()?.valueDeclaration;
    const root = cls && ts.isClassLike(cls) && !cls.getSourceFile().isDeclarationFile ? this.t.kitRootOf(cls) : null;
    return root ? { name: root, isStatic: false } : null;
  }

  /** A member a mixin class declares: the extension it becomes has it by name. */
  private mixinOwn(name: ts.MemberName): boolean {
    const decl = this.t.checker.getSymbolAtLocation(name)?.valueDeclaration;
    return !!decl && ts.isClassDeclaration(decl.parent) && !!this.t.mixinOf(this.t.checker.getSymbolAtLocation(decl.parent.name!));
  }

  /**
   * A member of an event data type (core's, or a framework's such as `ListViewItemTapEvent`)
   * that the kit's EventData does not declare (`args.state`, `args.getX()`, `args.item`): the
   * event's own object has it, read by name.
   */
  eventMember(e: ts.PropertyAccessExpression): boolean {
    const c = this.t.checker;
    const type = c.getNonNullableType(c.getTypeAtLocation(e.expression));
    if (this.t.type(type, e.expression) !== 'EventData') return false;
    return !kitMember(this.index, 'EventData', e.name.text);
  }

  /** A call of a kit method, or a `new` of a kit class, that the kit declares `throws` (the kit generated from core throws as script does). */
  throwingCall(e: ts.CallExpression | ts.NewExpression): boolean {
    if (ts.isNewExpression(e)) {
      const sym = ts.isIdentifier(e.expression) ? this.t.resolve(e.expression) : undefined;
      const decl = sym?.declarations?.[0];
      if (!sym || !(sym.flags & ts.SymbolFlags.Class) || !isCoreDeclaration(decl) || this.t.compiledCounterpart(sym)) return false;
      const name = sym.name;
      return (this.index.get(name)?.members.get('init') ?? []).some((m) => m.throws);
    }
    if (!ts.isPropertyAccessExpression(e.expression) || this.mixinOwn(e.expression.name)) return false;
    // `super.initNativeView()`, `this.requestLayout()` in a program's class of a core one: the core class declaring the method.
    const member = this.t.resolve(e.expression.name)?.declarations?.[0];
    const declaring = member && isCoreDeclaration(member) && ts.isClassLike(member.parent) && member.parent.name ? member.parent.name.text : null;
    const owner = this.owner(e.expression.expression)?.name ?? declaring;
    return !!owner && !!kitMember(this.index, owner, e.expression.name.text)?.throws;
  }

  /** Whether `target.method` is a method the kit declares on target's class (an optional call of it is a plain call). */
  isKitMethod(callee: ts.Expression): boolean {
    if (!ts.isPropertyAccessExpression(callee)) return false;
    const owner = this.owner(callee.expression);
    return !!owner && !owner.isStatic && kitMember(this.index, owner.name, callee.name.text)?.kind === 'func';
  }

  /** `target.method(args)` where target is core-typed, or `new CoreClass(args)`. */
  call(e: ts.CallExpression): string | null {
    if (!ts.isPropertyAccessExpression(e.expression)) return null;
    // A factory in a core namespace is the kit class it builds.
    if (e.expression.getText() === 'CoreTypes.AnimationCurve.cubicBezier' && isCoreDeclaration(this.t.resolve(e.expression.name)?.declarations?.[0])) {
      return `CubicBezierAnimationCurve(${e.arguments.map((a) => this.t.coerce(a, 'Double')).join(', ')})`;
    }
    const owner = this.mixinOwn(e.expression.name) ? null : this.owner(e.expression.expression);
    if (!owner) return null;
    const t = this.t;
    const name = e.expression.name.text;
    const m = this.member(owner.name, name, e.expression);
    const recv = owner.isStatic ? owner.name : t.expr(e.expression.expression);
    if (name === 'navigate' && kitExtends(this.index, owner.name, 'Frame')) return this.navigate(recv, e);
    const listener = this.listenerArgs(e, m);
    // A kit method takes the arguments given; its own defaults stand for the rest.
    const args = listener ?? (SCRIPT_OBJECTS.has(name) && this.isView(owner.name) ? e.arguments.map((a) => this.scriptValue(a)) : t.args(e, e.arguments.length));
    // A closure for a kit parameter that cannot throw (`dispatchToMainThread`) reports what it throws, as a handler does.
    const kitParams = (m.params ?? '').trim() ? splitParams(m.params!) : [];
    e.arguments.forEach((a, k) => {
      const p = kitParams[k];
      if (!listener && p && (ts.isArrowFunction(a) || ts.isFunctionExpression(a)) && !a.parameters.length && (t.checker.getContextualType(a)?.getCallSignatures()[0]?.getParameters().length ?? 0) === 0 && /->/.test(p) && !/\bthrows\b/.test(p) && /\(\s*\)\s*->/.test(p)) args[k] = t.callback(a);
    });
    if (!listener) this.matchKitParams(e, kitParams, args);
    return this.fromKit(`${recv}.${name}(${args.join(', ')})`, m.type, t.typeOf(e));
  }

  /**
   * Arguments as the kit's own parameters take them, where its Swift types differ from the
   * declarations' (the kit generated from core): a function as the kit's function type
   * (`on(event, (data) => …)` for `(EventData?) throws -> Void`), and the arguments from a
   * rest parameter on (`closeModal('done')`) as the array the kit's rest parameter is.
   */
  private matchKitParams(e: ts.CallExpression, kitParams: string[], args: string[]): void {
    const t = this.t;
    const decl = t.checker.getResolvedSignature(e)?.getDeclaration();
    const declared = decl && !ts.isJSDocSignature(decl) ? decl.parameters : undefined;
    kitParams.forEach((p, k) => {
      const type = kitParamType(p);
      if (declared?.[k]?.dotDotDotToken && /^JSArray<Any\?>$/.test(type)) {
        args.splice(k, args.length - k, `JSArray<Any?>([${e.arguments.slice(k).map((a) => t.coerce(a, 'Any?')).join(', ')}])`);
        return;
      }
      const a = e.arguments[k];
      if (a && /->/.test(type) && (ts.isArrowFunction(a) || ts.isFunctionExpression(a) || ts.isIdentifier(a) || ts.isPropertyAccessExpression(a))) {
        const fn = t.functionTypeParts(type);
        if ((ts.isArrowFunction(a) || ts.isFunctionExpression(a)) && fn) {
          t.closureSlots.set(a, fn.params);
          try { args[k] = t.coerce(a, type); } finally { t.closureSlots.delete(a); }
        } else {
          const own = t.typeOf(a);
          args[k] = /->/.test(own) && own.replace(/^\((.*)\)$/, '$1') !== type ? t.convert(t.expr(a), own, type) : t.coerce(a, type);
        }
      }
    });
  }

  /**
   * `on`/`off`/`once` with a named function: Swift closures have no identity,
   * so the kit matches a listener by key, here the declaration the function
   * comes from. Two closures from one declaration (one per instance) share it.
   */
  private listenerArgs(e: ts.CallExpression, m: KitMember): string[] | null {
    const name = (e.expression as ts.PropertyAccessExpression).name.text;
    if (!['on', 'once', 'off', 'addEventListener', 'removeEventListener'].includes(name) || !/\bkey: String\?/.test(m.params ?? '')) return null;
    const [event, callback, thisArg] = e.arguments;
    if (!event || !callback) return null;
    const t = this.t;
    const sym = ts.isIdentifier(callback) || ts.isPropertyAccessExpression(callback) ? t.resolve(ts.isIdentifier(callback) ? callback : callback.name) : undefined;
    const decl = sym?.valueDeclaration;
    // Only a function with one identity per declaration: a parameter or a reassigned variable holds any function.
    const named = decl && (ts.isFunctionDeclaration(decl) || ts.isMethodDeclaration(decl) || (ts.isPropertyDeclaration(decl) && !!decl.initializer && ts.isArrowFunction(decl.initializer))
      || (ts.isVariableDeclaration(decl) && !!(decl.parent.flags & ts.NodeFlags.Const) && !!decl.initializer && (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))));
    if (!decl || !named) return null;
    const key = `${decl.getSourceFile().fileName.split('/').pop()}:${decl.getStart()}`;
    return [t.str(event), t.coerce(callback, '(EventData) throws -> Void'), thisArg ? t.coerce(thisArg, 'Any?') : 'nil', `key: ${JSON.stringify(key)}`];
  }

  construct(e: ts.NewExpression): string | null {
    const sym = this.t.resolve(e.expression);
    if (!sym || !isCoreDeclaration(sym.declarations?.[0]) || this.t.compiledCounterpart(sym)) return null;
    const t = this.t;
    const args = e.arguments ?? ts.factory.createNodeArray();
    const kitName = sym.name;
    if (!this.index.has(kitName)) throw t.error(e, `new ${sym.name} (NativeScriptKit has no such class)`);
    // Core's constructor takes its arguments as a rest parameter; numbers never make it throw.
    if (sym.name === 'Color') {
      const list = `JSArray<Any?>([${args.map((a) => t.coerce(a, 'Any?')).join(', ')}])`;
      // A string may not be a color, which throws as script's constructor does.
      return args.some((a) => t.typeOf(a) !== 'Double') ? `Color(${list})` : `(try! Color(${list}))`;
    }
    if (sym.name === 'Animation') return `Animation(${args.map((a) => this.scriptValue(a)).join(', ')})`;
    return `${kitName}(${t.args(e).join(', ')})`;
  }

  /** `frame.navigate({ create: () => page })`: the kit builds what `create` returns. */
  private navigate(recv: string, e: ts.CallExpression): string {
    const entry = e.arguments[0];
    if (!entry || !ts.isObjectLiteralExpression(entry)) throw this.t.error(e, 'frame.navigate with anything but a navigation entry object');
    // Core reads the entry as script gives it: `create` a function it calls for the page, the rest plain values.
    const fields = entry.properties.map((p) => {
      if (!ts.isPropertyAssignment(p)) throw this.t.error(p, `the navigation entry's ${p.name?.getText()}`);
      const name = p.name.getText().replace(/^['"]|['"]$/g, '');
      if (name !== 'create') return `(${JSON.stringify(name)}, ${this.scriptValue(p.initializer)})`;
      return `("create", { (_: [Any?]) throws -> Any? in try (${this.t.expr(p.initializer)})() } as JSFunction)`;
    });
    return `${recv}.navigate(JSObject([${fields.join(', ')}]))`;
  }

  /**
   * An argument core reads as a plain script object (an animation definition):
   * literals become JavaScript objects and arrays, whatever their declared type.
   */
  private scriptValue(e: ts.Expression): string {
    if (ts.isObjectLiteralExpression(e)) {
      const entries = e.properties.map((p) => {
        if (ts.isPropertyAssignment(p)) return `(${JSON.stringify(p.name.getText().replace(/^['"]|['"]$/g, ''))}, ${this.scriptValue(p.initializer)})`;
        if (ts.isShorthandPropertyAssignment(p)) return `(${JSON.stringify(p.name.text)}, ${this.t.coerce(p.name, 'Any?')})`;
        throw this.t.error(p, 'this member in an animation definition');
      });
      return `JSObject([${entries.join(', ')}])`;
    }
    if (ts.isArrayLiteralExpression(e)) return `JSArray<Any?>([${e.elements.map((x) => this.scriptValue(x)).join(', ')}])`;
    if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) {
      // A function core calls back (`closeCallback`) takes script values.
      const args = e.parameters.map((p, i) => this.t.fromAnyCode(`(${i} < __args.count ? __args[${i}] : nil)`, this.t.typeOf(p)));
      return `({ (__args: [Any?]) throws -> Any? in _ = try (${this.t.expr(e)})(${args.join(', ')}); return nil } as JSFunction)`;
    }
    return this.t.coerce(e, 'Any?');
  }

  /** A kit value as the TypeScript type reads it: kit integers and CGFloats are Doubles. */
  private fromKit(code: string, kitType: string, tsType: string): string {
    const k = kitType.trim();
    // What the kit generated from core gives untyped (`animate()`'s promise), read as the type the declarations give it.
    if (k === 'Any?' && tsType !== 'Any?' && tsType !== 'Void') return this.t.fromAnyCode(code, tsType, true);
    if (k === 'JSArray<Any?>' && /^JSArray<.+>$/.test(tsType) && tsType !== k) return `jsArrayOf(${code}) { ${this.t.fromAny('$0', tsType.slice(8, -1))} }`;
    const numeric = /^(Int|UInt|Int32|UInt32|Int64|UInt64|CGFloat|Float)\??$/.exec(k);
    if (numeric && tsType.startsWith('Double')) return k.endsWith('?') ? `${code}.map { Double($0) }` : `Double(${code})`;
    // A member the kit types as a base class (`EventData.object` is an Observable) that TypeScript types as a subclass.
    const kb = k.replace(/[?!]$/, ''), tb = tsType.replace(/[?!]$/, '');
    if (kb !== tb && /^[A-Z]\w*$/.test(kb) && /^[A-Z]\w*$/.test(tb) && !['Double', 'String', 'Bool', 'Any'].includes(tb) && kb !== 'Any') {
      return tsType.endsWith('?') ? `(${code} as? ${tb})` : `(${code} as! ${tb})`;
    }
    if (k.endsWith('?') && !tsType.endsWith('?') && tsType !== 'Any?') {
      const zero = tsType === 'String' ? '""' : tsType === 'Double' ? '0' : tsType === 'Bool' ? 'false' : null;
      return zero ? `(${code} ?? ${zero})` : `${code}!`;
    }
    return code;
  }

  private toKit(code: string, kitType: string): string {
    const k = kitType.replace(/\?$/, '');
    return /^(Int|UInt|Int32|UInt32|Int64|UInt64|CGFloat|Float)$/.test(k) ? `${k}(${code})` : code;
  }
}

/** A Swift parameter's type (`_ callback: @escaping (EventData?) throws -> Void = …` gives `(EventData?) throws -> Void`). */
function kitParamType(param: string): string {
  let depth = 0, colon = -1, end = param.length;
  for (let i = 0; i < param.length; i++) {
    const ch = param[i];
    if ('([<'.includes(ch)) depth++;
    else if (')]>'.includes(ch) && !(ch === '>' && param[i - 1] === '-')) depth--;
    else if (depth === 0 && ch === ':' && colon < 0) colon = i;
    else if (depth === 0 && ch === '=' && param[i + 1] !== '=' && colon >= 0) { end = i; break; }
  }
  return param.slice(colon + 1, end).replace(/@escaping\s+/, '').trim();
}

/** A parameter list's parameters, split at top-level commas. */
function splitParams(text: string): string[] {
  const out: string[] = [];
  let depth = 0, start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if ('([<'.includes(ch)) depth++;
    else if (')]>'.includes(ch) && text[i - 1] !== '-') depth--;
    else if (ch === ',' && depth === 0) { out.push(text.slice(start, i).trim()); start = i + 1; }
  }
  out.push(text.slice(start).trim());
  return out;
}
