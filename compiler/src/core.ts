import ts from 'typescript';
import { fileURLToPath } from 'node:url';
import { kitExtends, kitIndex, kitMember, type KitMember, type KitType } from './kit-index.ts';
import type { Translator } from './swift.ts';

const KIT = fileURLToPath(new URL('../../kit/Sources/NativeScriptKit', import.meta.url));

/** The native view a core class drives on iOS: what `view.ios` and `view.nativeView` are. */
export const NATIVE_VIEWS: Record<string, string> = {
  Label: 'UILabel', Button: 'UIButton', TextField: 'UITextField', TextView: 'UITextView', Image: 'UIImageView', Switch: 'UISwitch',
  Slider: 'UISlider', SegmentedBar: 'UISegmentedControl', ActivityIndicator: 'UIActivityIndicatorView', ScrollView: 'UIScrollView',
  ListView: 'UITableView', Progress: 'UIProgressView', DatePicker: 'UIDatePicker', TimePicker: 'UIDatePicker', View: 'UIView',
};
const NATIVE_MEMBERS = new Set(['ios', 'nativeView', 'nativeViewProtected']);
export const KIT_NAMES: Record<string, string> = { Font: 'CoreFont', ViewBase: 'View', ViewCommon: 'View', EditableTextBase: 'TextBase', LayoutBaseCommon: 'LayoutBase' };

export function isCoreDeclaration(decl: ts.Declaration | undefined): boolean {
  return !!decl && /[\\/]@nativescript[\\/]core[\\/]/.test(decl.getSourceFile().fileName);
}

/** The native class a core class's `ios` is, walking up to the nearest one the table names. */
export function nativeViewOf(checker: ts.TypeChecker, type: ts.Type): string | null {
  const visit = (t: ts.Type): string | null => {
    const sym = t.getSymbol();
    if (!sym || !isCoreDeclaration(sym.declarations?.[0])) return null;
    if (NATIVE_VIEWS[sym.name]) return NATIVE_VIEWS[sym.name];
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

  /** Whether NativeScriptKit declares a type of this name. */
  has(name: string): boolean {
    return this.index.has(name);
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
      const sym = this.t.resolve(e);
      const decl = sym?.declarations?.[0];
      if (sym && isCoreDeclaration(decl) && (sym.flags & (ts.SymbolFlags.Class | ts.SymbolFlags.ValueModule | ts.SymbolFlags.Variable))) {
        if (sym.flags & ts.SymbolFlags.ValueModule) return { name: e.text, isStatic: true };
        if (sym.flags & ts.SymbolFlags.Class) return { name: sym.name, isStatic: true };
        // A constant core exports (`Device`): the kit has a type of that name with static members.
        if (this.index.has(sym.name)) return { name: sym.name, isStatic: true };
      }
      if (sym && sym.flags & ts.SymbolFlags.Alias) return null;
    }
    let type = c.getNonNullableType(c.getTypeAtLocation(e));
    // `View & { extra?: … }`: the core class.
    if (type.isIntersection()) type = type.types.find((u) => isCoreDeclaration(u.getSymbol()?.declarations?.[0])) ?? type;
    const sym = type.getSymbol();
    const mixin = this.t.mixinOf(sym);
    if (mixin) return { name: mixin, isStatic: false };
    // An interface extending a core class (`interface MenuView extends View`): that class.
    if (sym && sym.flags & ts.SymbolFlags.Interface && !isCoreDeclaration(sym.declarations?.[0]) && type.isClassOrInterface()) {
      const base = c.getBaseTypes(type as ts.InterfaceType).map((b) => b.getSymbol()).find((b) => b && b.flags & ts.SymbolFlags.Class && isCoreDeclaration(b.declarations?.[0]));
      if (base) return { name: Object.hasOwn(KIT_NAMES, base.name) ? KIT_NAMES[base.name] : base.name, isStatic: false };
    }
    if (!sym || !isCoreDeclaration(sym.declarations?.[0])) return null;
    // Core's event data types are the kit's one EventData, whose members the translator reads directly.
    if (this.t.type(type, e) === 'EventData') return null;
    return { name: Object.hasOwn(KIT_NAMES, sym.name) ? KIT_NAMES[sym.name] : sym.name, isStatic: false };
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
    if (process.env.NS_NATIVE_PENDING_PROPS?.split(',').includes(name)) return true;
    // A style property applies to any view; the kit's classes each apply their own.
    if (owner === 'Style') return [...this.index.values()].some((t) => kitExtends(this.index, t.name, 'View') && t.props.has(name));
    for (let t = this.index.get(owner); t; t = t.base ? this.index.get(t.base) : undefined) if (t.props.has(name)) return true;
    return false;
  }

  /** A read of `target.name` where target is core-typed, or null when it is not. */
  property(e: ts.PropertyAccessExpression): string | null {
    const owner = this.mixinOwn(e.name) ? null : this.owner(e.expression) ?? this.inheritedOwner(e.expression, e.name);
    if (!owner) return null;
    const t = this.t;
    const name = e.name.text;
    const chained = !owner.isStatic && !!e.questionDotToken && t.typeOf(e.expression).endsWith('?');
    const recv = owner.isStatic ? owner.name : t.expr(e.expression) + (chained ? '?' : '');
    if (!owner.isStatic && NATIVE_MEMBERS.has(name) && this.isView(owner.name)) return `${recv}.nativeView`;
    if (!owner.isStatic && this.isView(owner.name) && !kitMember(this.index, owner.name, name)) {
      if (!this.isViewProperty(owner.name, name)) throw t.error(e, `${owner.name}.${name} (not a property NativeScriptKit applies)`);
      return t.fromAnyCode(`${recv}.get(${JSON.stringify(name)})`, t.typeOf(e), true);
    }
    const m = this.member(owner.name, name, e);
    return this.fromKit(`${recv}.${name}`, chained ? m.type.replace(/\??$/, '?') : m.type, t.typeOf(e));
  }

  /** `target.name = value` where target is core-typed. */
  assign(left: ts.PropertyAccessExpression, value: ts.Expression): string | null {
    const owner = this.mixinOwn(left.name) ? null : this.owner(left.expression) ?? this.inheritedOwner(left.expression, left.name);
    if (!owner) return null;
    const t = this.t;
    const name = left.name.text;
    const recv = owner.isStatic ? owner.name : t.expr(left.expression);
    if (!owner.isStatic && this.isView(owner.name) && (!kitMember(this.index, owner.name, name) || this.isViewProperty(owner.name, name))) {
      if (!this.isViewProperty(owner.name, name)) throw t.error(left, `${owner.name}.${name} (not a property NativeScriptKit applies)`);
      return `${recv}.set(${JSON.stringify(name)}, ${t.coerce(value, 'Any?')})`;
    }
    const m = this.member(owner.name, name, left);
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

  /** Whether `target.method` is a method the kit declares on target's class (an optional call of it is a plain call). */
  isKitMethod(callee: ts.Expression): boolean {
    if (!ts.isPropertyAccessExpression(callee)) return false;
    const owner = this.owner(callee.expression);
    return !!owner && !owner.isStatic && kitMember(this.index, owner.name, callee.name.text)?.kind === 'func';
  }

  /** `target.method(args)` where target is core-typed, or `new CoreClass(args)`. */
  call(e: ts.CallExpression): string | null {
    if (!ts.isPropertyAccessExpression(e.expression)) return null;
    const owner = this.mixinOwn(e.expression.name) ? null : this.owner(e.expression.expression);
    if (!owner) return null;
    const t = this.t;
    const name = e.expression.name.text;
    const m = this.member(owner.name, name, e.expression);
    const recv = owner.isStatic ? owner.name : t.expr(e.expression.expression);
    const listener = this.listenerArgs(e, m);
    // A kit method takes the arguments given; its own defaults stand for the rest.
    return this.fromKit(`${recv}.${name}(${(listener ?? t.args(e, e.arguments.length)).join(', ')})`, m.type, t.typeOf(e));
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
    if (!sym || !isCoreDeclaration(sym.declarations?.[0])) return null;
    const t = this.t;
    const args = e.arguments ?? ts.factory.createNodeArray();
    const kitName = Object.hasOwn(KIT_NAMES, sym.name) ? KIT_NAMES[sym.name] : sym.name;
    if (!this.index.has(kitName)) throw t.error(e, `new ${sym.name} (NativeScriptKit has no such class)`);
    if (sym.name === 'Color') {
      if (args.length === 1 && t.typeOf(args[0]) === 'String') return `Color(js: ${t.expr(args[0])})`;
      if (args.length === 1) return `Color(argb: UInt32(truncatingIfNeeded: Int64(${t.expr(args[0])})))`;
      return `Color(${args.slice(0, 4).map((a) => t.expr(a)).join(', ')})`;
    }
    return `${kitName}(${t.args(e).join(', ')})`;
  }

  /** A kit value as the TypeScript type reads it: kit integers and CGFloats are Doubles. */
  private fromKit(code: string, kitType: string, tsType: string): string {
    const k = kitType.trim();
    const numeric = /^(Int|UInt|Int32|UInt32|Int64|UInt64|CGFloat|Float)\??$/.exec(k);
    if (numeric && tsType.startsWith('Double')) return k.endsWith('?') ? `${code}.map { Double($0) }` : `Double(${code})`;
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
