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

  /** The kit type a core-typed expression is, and whether it is the type itself (`Device.model`, `Color.isValid`). */
  owner(e: ts.Expression): { name: string; isStatic: boolean } | null {
    const c = this.t.checker;
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
    const type = c.getNonNullableType(c.getTypeAtLocation(e));
    const sym = type.getSymbol();
    if (!sym || !isCoreDeclaration(sym.declarations?.[0])) return null;
    return { name: sym.name, isStatic: false };
  }

  private member(owner: string, name: string, e: ts.Node): KitMember {
    const m = kitMember(this.index, owner, name);
    if (!m) throw this.t.error(e, `${owner}.${name} (NativeScriptKit has no such member)`);
    return m;
  }

  private isView(owner: string): boolean {
    return kitExtends(this.index, owner, 'View');
  }

  /** Whether the kit applies `name` by name on this view class (a property in its setProperty). */
  private isViewProperty(owner: string, name: string): boolean {
    for (let t = this.index.get(owner); t; t = t.base ? this.index.get(t.base) : undefined) if (t.props.has(name)) return true;
    return false;
  }

  /** A read of `target.name` where target is core-typed, or null when it is not. */
  property(e: ts.PropertyAccessExpression): string | null {
    const owner = this.owner(e.expression);
    if (!owner) return null;
    const t = this.t;
    const name = e.name.text;
    const recv = owner.isStatic ? owner.name : t.expr(e.expression);
    if (!owner.isStatic && NATIVE_MEMBERS.has(name) && this.isView(owner.name)) return `${recv}.nativeView`;
    if (!owner.isStatic && this.isView(owner.name) && !kitMember(this.index, owner.name, name)) {
      if (!this.isViewProperty(owner.name, name)) throw t.error(e, `${owner.name}.${name} (not a property NativeScriptKit applies)`);
      return t.fromAnyCode(`${recv}.get(${JSON.stringify(name)})`, t.typeOf(e), true);
    }
    const m = this.member(owner.name, name, e);
    return this.fromKit(`${recv}.${name}`, m.type, t.typeOf(e));
  }

  /** `target.name = value` where target is core-typed. */
  assign(left: ts.PropertyAccessExpression, value: ts.Expression): string | null {
    const owner = this.owner(left.expression);
    if (!owner) return null;
    const t = this.t;
    const name = left.name.text;
    const recv = owner.isStatic ? owner.name : t.expr(left.expression);
    if (!owner.isStatic && this.isView(owner.name) && !kitMember(this.index, owner.name, name)) {
      if (!this.isViewProperty(owner.name, name)) throw t.error(left, `${owner.name}.${name} (not a property NativeScriptKit applies)`);
      return `${recv}.set(${JSON.stringify(name)}, ${t.coerce(value, 'Any?')})`;
    }
    const m = this.member(owner.name, name, left);
    return `${recv}.${name} = ${this.toKit(t.coerce(value, t.typeOf(left)), m.type)}`;
  }

  /** `target.method(args)` where target is core-typed, or `new CoreClass(args)`. */
  call(e: ts.CallExpression): string | null {
    if (!ts.isPropertyAccessExpression(e.expression)) return null;
    const owner = this.owner(e.expression.expression);
    if (!owner) return null;
    const t = this.t;
    const name = e.expression.name.text;
    const m = this.member(owner.name, name, e.expression);
    const recv = owner.isStatic ? owner.name : t.expr(e.expression.expression);
    return this.fromKit(`${recv}.${name}(${t.args(e).join(', ')})`, m.type, t.typeOf(e));
  }

  construct(e: ts.NewExpression): string | null {
    const sym = this.t.resolve(e.expression);
    if (!sym || !isCoreDeclaration(sym.declarations?.[0])) return null;
    const t = this.t;
    const args = e.arguments ?? ts.factory.createNodeArray();
    if (!this.index.has(sym.name)) throw t.error(e, `new ${sym.name} (NativeScriptKit has no such class)`);
    if (sym.name === 'Color') {
      if (args.length === 1 && t.typeOf(args[0]) === 'String') return `Color(js: ${t.expr(args[0])})`;
      if (args.length === 1) return `Color(argb: UInt32(truncatingIfNeeded: Int64(${t.expr(args[0])})))`;
      return `Color(${args.slice(0, 4).map((a) => t.expr(a)).join(', ')})`;
    }
    return `${sym.name}(${t.args(e).join(', ')})`;
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
