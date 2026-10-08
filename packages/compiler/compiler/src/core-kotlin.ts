import ts from 'typescript';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isCoreDeclaration, unappliedProperty } from './core.ts';
import { kitExtends, kitMember, readNames, type KitMember, type KitType } from './kit-index.ts';
import { KIT_NAMES_ANDROID, kotlinString, numberLiteral, splitTopLevel, type KotlinCore, type Translator } from './kotlin.ts';

/** The pseudo-type whose members are kit-android's public top-level functions (`getRootLayout`). */
const TOP_LEVEL = '';
export const KIT = fileURLToPath(new URL('../../kit-android/src/main/kotlin/org/nativescript/kit', import.meta.url));
const NATIVE_MEMBERS = new Set(['android', 'nativeView', 'nativeViewProtected']);
/** View methods whose arguments core reads as plain script objects. */
const SCRIPT_OBJECTS = new Set(['animate', 'createAnimation', 'open', 'close', 'openShadeCover', 'closeShadeCover', 'showModal', 'closeModal']);

/**
 * What kit-android offers translated code, read from its Kotlin sources: each
 * public class, object and interface, the class it extends, its public
 * members (a companion's or an object's are static), and the NativeScript
 * property names its `setProperty` handles (`"text" ->`).
 */
export function kotlinKitIndex(sources: string): Map<string, KitType> {
  const types = new Map<string, KitType>();
  const files = (readdirSync(sources, { recursive: true }) as string[]).filter((f) => f.endsWith('.kt'));
  for (const f of files) {
    const text = readFileSync(join(sources, f), 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    const imports = new Map([...text.matchAll(/^import\s+([\w.]+)\.(\w+)(?:\s+as\s+(\w+))?\s*$/gm)].map((m) => [m[3] ?? m[2], `${m[1]}.${m[2]}`]));
    const stack: { type: KitType | null; depth: number; companion: boolean }[] = [];
    let depth = 0;
    for (const line of text.split('\n')) {
      const decl = /^\s*((?:(?:open|abstract|final|data|sealed|enum|inner|private|internal|protected|public)\s+)*)(class|object|interface)\s+(\w+)(?:<[^>]*>)?(?:\s*(?:internal\s+|private\s+)?(?:constructor\s*)?\([^)]*\))?(?:\s*:\s*([\w.]+))?/.exec(line);
      const companion = /^\s*companion\s+object\b/.test(line);
      if ((decl || companion) && line.includes('{')) {
        if (companion) {
          stack.push({ type: [...stack].reverse().find((x) => x.type)?.type ?? null, depth, companion: true });
        } else {
          const isPublic = !/\b(private|internal|protected)\b/.test(decl![1]);
          const name = decl![3];
          let type = types.get(name) ?? null;
          const base = decl![2] === 'class' && decl![4] ? decl![4] : null;
          if (!type && isPublic) {
            type = { name, base, members: new Map(), props: new Set() };
            types.set(name, type);
          }
          // Extension members in a file read earlier made the entry: the class declaration names the base.
          if (type && base) type.base = base;
          if (type && decl![2] === 'object') (type as KitType & { object?: boolean }).object = true;
          stack.push({ type: isPublic ? type : null, depth, companion: false });
        }
      } else {
        // Extension members (`val Color.hex`, `fun Color.Companion.js(`) belong to their receiver.
        const ext = depth === 0 ? /^(?:inline\s+)?(val|var|fun)\s+(?:<[^>]*>\s*)?(\w+)(\.Companion)?\.(\w+)\s*(\(([^)]*)\))?\s*:?\s*([^={]*)/.exec(line) : null;
        if (ext) {
          const receiver = types.get(ext[2]) ?? { name: ext[2], base: null, members: new Map(), props: new Set() };
          types.set(ext[2], receiver);
          add(receiver, ext[4], { kind: ext[1] === 'fun' ? 'func' : 'var', static: !!ext[3], type: ext[7].trim().replace(/\s+get\(\).*$/, '') || 'Unit', params: ext[6] });
        }
        const fn = depth === 0 && !ext ? /^(?:inline\s+)?fun\s+(?:<[^>]*>\s*)?(\w+)\s*\(([^)]*)\)\s*(?::\s*([^={]+))?/.exec(line) : null;
        if (fn) {
          const global = types.get(TOP_LEVEL) ?? { name: TOP_LEVEL, base: null, members: new Map(), props: new Set() };
          types.set(TOP_LEVEL, global);
          add(global, fn[1], { kind: 'func', static: true, type: (fn[3] ?? 'Unit').trim(), params: fn[2] });
        }
        const owner = stack.at(-1);
        const enclosing = [...stack].reverse().find((x) => x.type)?.type;
        if (enclosing && /^\s*"\w+"(\s*,\s*"\w+")*\s*->/.test(line)) for (const m of line.matchAll(/"(\w+)"/g)) enclosing.props.add(m[1]);
        if (enclosing) for (const n of readNames(line)) enclosing.props.add(n);
        if (owner?.type && depth === owner.depth + 1 && !/\b(private|internal)\b/.test(line) && (!/\bprotected\b/.test(line) || /\b(open|override|abstract)\b/.test(line))) {
          const isStatic = owner.companion || !!(owner.type as KitType & { object?: boolean }).object;
          let m: RegExpExecArray | null;
          const made = /^\s*override\s+fun\s+createNativeView\(\)\s*:\s*NativeView\s*=\s*([\w.]+)\(/.exec(line);
          if (made) owner.type.native = imports.get(made[1]) ?? made[1];
          if ((m = /^\s*(?:(?:override|open|final|lateinit|const|abstract|protected|public)\s+)*(?:val|var)\s+`?(\w+)`?\s*:\s*([^={]+)/.exec(line))) add(owner.type, m[1], { kind: 'var', static: isStatic, type: m[2].trim().replace(/\s+get\(\).*$/, '') });
          else if ((m = /^\s*(?:(?:override|open|final|abstract|inline|operator|protected|public)\s+)*fun\s+(?:<[^>]*>\s*)?`?(\w+)`?\s*\(/.exec(line))) {
            const [params, rest] = parenthesized(line, m.index + m[0].length);
            add(owner.type, m[1], { kind: 'func', static: isStatic, type: (/^\s*:\s*([^={]+)/.exec(rest)?.[1] ?? 'Unit').trim(), params });
          }
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
  // Shorthands (`borderRadius`, `margin`) any view takes, expanded by a top-level function.
  for (const f of files) {
    const text = readFileSync(join(sources, f), 'utf8');
    const at = text.indexOf('\nfun expandShorthand(');
    if (at < 0) continue;
    const body = text.slice(at, text.indexOf('\n}\n', at));
    for (const m of body.matchAll(/^\s*((?:"\w+"(?:,\s*)?)+)\s*->/gm)) for (const n of m[1].matchAll(/"(\w+)"/g)) types.get('View')?.props.add(n[1]);
  }
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

/** The native class a core view's `android` is. */
export const NATIVE_VIEWS_ANDROID: Record<string, string> = {
  Label: 'android.widget.TextView', Button: 'android.widget.Button', TextField: 'android.widget.EditText', TextView: 'android.widget.EditText',
  Image: 'org.nativescript.widgets.ImageView', Switch: 'android.widget.Switch', Slider: 'android.widget.SeekBar', ActivityIndicator: 'android.widget.ProgressBar',
  Progress: 'android.widget.ProgressBar', ScrollView: 'android.widget.FrameLayout', ListView: 'android.widget.ListView', DatePicker: 'android.widget.DatePicker',
  TimePicker: 'android.widget.TimePicker', StackLayout: 'org.nativescript.widgets.StackLayout', GridLayout: 'org.nativescript.widgets.GridLayout',
  AbsoluteLayout: 'org.nativescript.widgets.AbsoluteLayout', DockLayout: 'org.nativescript.widgets.DockLayout', WrapLayout: 'org.nativescript.widgets.WrapLayout',
  FlexboxLayout: 'org.nativescript.widgets.FlexboxLayout', ContentView: 'org.nativescript.widgets.ContentLayout', WebView: 'android.webkit.WebView',
  View: 'android.view.View',
};

/**
 * @nativescript/core's API as kit-android offers it. A core class is the kit
 * class of the same name; a member the kit declares is used as it is, a view
 * property the kit applies by name (`text`, `color`) is set and read through
 * `set`/`get`, and anything else stops the build with the file and line.
 */
export class CoreKotlin implements KotlinCore {
  private index: Map<string, KitType>;
  private t: Translator;

  constructor(t: Translator) {
    this.t = t;
    this.index = kotlinKitIndex(KIT);
  }

  type(_t: ts.Type): string | null { return null; }

  has(name: string): boolean {
    return this.index.has(name);
  }

  isKitView(name: string): boolean {
    return kitExtends(this.index, name, 'View');
  }

  kitMember(owner: string, name: string): KitMember | null {
    return kitMember(this.index, owner, name);
  }

  /** The class of the native view `view.android` (`nativeView`) holds, when the kit view's class says. */
  nativeClassOf(e: ts.Expression): string | null {
    if (!ts.isPropertyAccessExpression(e) || !NATIVE_MEMBERS.has(e.name.text)) return null;
    let name: string | null | undefined = this.owner(e.expression)?.name;
    while (name) {
      const type = this.index.get(name);
      if (type?.native) return type.native;
      name = type?.base;
    }
    return null;
  }

  /** Whether `target.method` is a method the kit declares on target's class (an optional call of it is a plain call). */
  isKitMethod(callee: ts.Expression): boolean {
    if (!ts.isPropertyAccessExpression(callee)) return false;
    const owner = this.owner(callee.expression);
    return !!owner && !owner.isStatic && kitMember(this.index, owner.name, callee.name.text)?.kind === 'func';
  }

  owner(e: ts.Expression): { name: string; isStatic: boolean } | null {
    const c = this.t.checker;
    // A namespace core nests in a static owner (`Utils.layout`, `Application.android`) is the kit object `UtilsLayout`.
    if (ts.isPropertyAccessExpression(e) && (ts.isIdentifier(e.expression) || ts.isPropertyAccessExpression(e.expression))) {
      const outer = this.owner(e.expression);
      const nested = outer?.isStatic ? outer.name + e.name.text[0].toUpperCase() + e.name.text.slice(1) : '';
      if (nested && this.index.has(nested)) return { name: nested, isStatic: true };
    }
    if (ts.isIdentifier(e)) {
      const sym = this.t.resolve(e);
      const decl = sym?.declarations?.[0];
      if (sym && isCoreDeclaration(decl) && (sym.flags & (ts.SymbolFlags.Class | ts.SymbolFlags.ValueModule | ts.SymbolFlags.Variable))) {
        if (sym.flags & ts.SymbolFlags.ValueModule) return { name: e.text, isStatic: true };
        if (sym.flags & ts.SymbolFlags.Class) return { name: sym.name, isStatic: true };
        if (this.index.has(sym.name)) return { name: sym.name, isStatic: true };
      }
      if (sym && sym.flags & ts.SymbolFlags.Alias) return null;
    }
    let type = c.getNonNullableType(c.getTypeAtLocation(e));
    // `View & { extra?: … }`: the core class.
    if (type.isIntersection()) type = type.types.find((u) => (u.getSymbol()?.flags ?? 0) & ts.SymbolFlags.Class && isCoreDeclaration(u.getSymbol()?.declarations?.[0])) ?? type;
    const sym = type.getSymbol();
    const mixin = this.t.mixinOf(sym);
    if (mixin) return { name: mixin, isStatic: false };
    // An interface extending a core class (`interface MenuView extends View`): that class.
    if (sym && sym.flags & ts.SymbolFlags.Interface && !isCoreDeclaration(sym.declarations?.[0]) && type.isClassOrInterface()) {
      const base = c.getBaseTypes(type as ts.InterfaceType).map((b) => b.getSymbol()).find((b) => b && b.flags & ts.SymbolFlags.Class && isCoreDeclaration(b.declarations?.[0]));
      if (base) return { name: KIT_NAMES_ANDROID[base.name] ?? base.name, isStatic: false };
    }
    if (!sym || !isCoreDeclaration(sym.declarations?.[0])) return null;
    if (this.t.type(type, e) === 'EventData') return null;
    return { name: KIT_NAMES_ANDROID[sym.name] ?? sym.name, isStatic: false };
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
   * `on`/`off`/`once` with a named function: a function value made once per
   * evaluation has no identity across them, so the kit matches a listener by
   * key, here the declaration the function comes from.
   */
  private listenerArgs(e: ts.CallExpression, m: KitMember): string[] | null {
    const name = (e.expression as ts.PropertyAccessExpression).name.text;
    if (!['on', 'once', 'off', 'addEventListener', 'removeEventListener'].includes(name) || !/\bkey: Any\?/.test(m.params ?? '')) return null;
    const [event, callback, thisArg] = e.arguments;
    if (!event || !callback) return null;
    const t = this.t;
    const sym = ts.isIdentifier(callback) || ts.isPropertyAccessExpression(callback) ? t.resolve(ts.isIdentifier(callback) ? callback : callback.name) : undefined;
    const decl = sym?.valueDeclaration;
    const named = decl && (ts.isFunctionDeclaration(decl) || ts.isMethodDeclaration(decl) || (ts.isPropertyDeclaration(decl) && !!decl.initializer && ts.isArrowFunction(decl.initializer))
      || (ts.isVariableDeclaration(decl) && !!(decl.parent.flags & ts.NodeFlags.Const) && !!decl.initializer && (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))));
    const key = named ? kotlinString(`${decl!.getSourceFile().fileName.split('/').pop()}:${decl!.getStart()}`) : 'null';
    // The key goes in the `key` parameter; any between (`once` of addEventListener) take their defaults.
    const params = splitTopLevel(m.params ?? '');
    const at = params.findIndex((p) => /^key\s*:/.test(p));
    const between = params.slice(3, at).map((p) => /=\s*(.+)$/.exec(p)?.[1].trim() ?? 'null');
    return [t.str(event), t.coerce(callback, '(EventData) -> Unit'), thisArg ? t.coerce(thisArg, 'Any?') : 'null', ...between, key];
  }

  private member(owner: string, name: string, e: ts.Node): KitMember {
    const m = kitMember(this.index, owner, name);
    if (!m) throw this.t.error(e, `${owner}.${name} (kit-android has no such member)`);
    return m;
  }

  /** A view, or a view's `style`: properties by name. */
  private isView(owner: string): boolean {
    return owner === 'Style' || kitExtends(this.index, owner, 'View');
  }

  private isViewProperty(owner: string, name: string): boolean {
    // A style property applies to any view; the kit's classes each apply their own.
    if (owner === 'Style') return [...this.index.values()].some((t) => kitExtends(this.index, t.name, 'View') && t.props.has(name));
    for (let t = this.index.get(owner); t; t = t.base ? this.index.get(t.base.replace(/\(.*$/, '')) : undefined) if (t.props.has(name)) return true;
    return false;
  }

  property(e: ts.PropertyAccessExpression): string | null {
    const constant = this.constant(e);
    if (constant !== null) return constant;
    const owner = this.mixinOwn(e.name) ? null : this.owner(e.expression) ?? this.inheritedOwner(e.expression, e.name);
    if (!owner) return null;
    const t = this.t;
    const name = e.name.text;
    const recv = owner.isStatic ? owner.name : this.receiver(e.expression, e);
    // The other platform's native view: undefined, as on Android.
    if (!owner.isStatic && name === 'ios' && this.isView(owner.name)) return 'null';
    if (!owner.isStatic && NATIVE_MEMBERS.has(name) && this.isView(owner.name)) {
      const native = t.typeOf(e);
      return native === 'Any?' ? `${recv}.nativeView` : `(${recv}.nativeView as ${native})`;
    }
    if (!owner.isStatic && this.isView(owner.name) && !kitMember(this.index, owner.name, name)) {
      if (!this.isViewProperty(owner.name, name)) unappliedProperty(t, e.name, `${owner.name}.${name}`, 'kit-android');
      return t.fromAnyCode(`${recv}.get(${JSON.stringify(name)})`, t.typeOf(e), true);
    }
    const m = this.member(owner.name, name, e);
    // A method read as a value (`typeof view.getSafeAreaInsets === 'function'`): bound to its object.
    if (m.kind === 'func' && !(ts.isCallExpression(e.parent) && e.parent.expression === e)) return `${recv}::${name}`;
    return this.fromKit(`${recv}.${name}`, m.type, t.typeOf(e), t.nullTolerant(e));
  }

  /** A core-typed receiver's code: unwrapped where it is nullable and the access is not an optional one (code checked without strictNullChecks). */
  private receiver(target: ts.Expression, access: ts.PropertyAccessExpression): string {
    const code = this.t.expr(target);
    if (code === 'super' || code === 'this' || code.endsWith('!!')) return code;
    const nullable = this.t.typeOf(target).endsWith('?');
    if (access.questionDotToken || (access.flags & ts.NodeFlags.OptionalChain && nullable)) return `${code}?`;
    return nullable ? `${code}!!` : code;
  }

  /** A constant core declares with a literal type (`CoreTypes.AnimationCurve.easeIn` is "easeIn"), as that literal. */
  private constant(e: ts.PropertyAccessExpression): string | null {
    const decl = this.t.resolve(e.name)?.declarations?.[0];
    if (!decl || !isCoreDeclaration(decl) || !ts.isVariableDeclaration(decl) || !(ts.getCombinedNodeFlags(decl) & ts.NodeFlags.Const)) return null;
    const type = this.t.checker.getTypeAtLocation(decl);
    if (type.isStringLiteral()) return kotlinString(type.value);
    if (type.isNumberLiteral()) return numberLiteral(String(type.value));
    return null;
  }

  lvalue(e: ts.PropertyAccessExpression): string | null {
    const owner = this.mixinOwn(e.name) ? null : this.owner(e.expression) ?? this.inheritedOwner(e.expression, e.name);
    if (!owner) return null;
    const m = kitMember(this.index, owner.name, e.name.text);
    return m ? `${owner.isStatic ? owner.name : this.t.expr(e.expression)}.${e.name.text}` : null;
  }

  assign(left: ts.PropertyAccessExpression, value: ts.Expression): string | null {
    const owner = this.mixinOwn(left.name) ? null : this.owner(left.expression) ?? this.inheritedOwner(left.expression, left.name);
    if (!owner) return null;
    const t = this.t;
    const name = left.name.text;
    const recv = owner.isStatic ? owner.name : this.receiver(left.expression, left);
    if (!owner.isStatic && this.isView(owner.name) && !kitMember(this.index, owner.name, name)) {
      if (!this.isViewProperty(owner.name, name)) unappliedProperty(t, left.name, `${owner.name}.${name}`, 'kit-android');
      return `${recv}.set(${JSON.stringify(name)}, ${t.coerce(value, 'Any?')})`;
    }
    const m = this.member(owner.name, name, left);
    // A kit member typed `Any?` holds what core reads as a plain script object (`TouchManager.animations`).
    if (m.type.trim() === 'Any?') return `${recv}.${name} = ${this.scriptValue(value)}`;
    return `${recv}.${name} = ${this.toKit(t.coerce(value, t.typeOf(left)), m.type)}`;
  }

  call(e: ts.CallExpression): string | null {
    if (ts.isIdentifier(e.expression)) return this.topLevelCall(e, e.expression);
    if (!ts.isPropertyAccessExpression(e.expression)) return null;
    // A factory in a core namespace is the kit class it builds.
    if (e.expression.getText() === 'CoreTypes.AnimationCurve.cubicBezier' && isCoreDeclaration(this.t.resolve(e.expression.name)?.declarations?.[0])) {
      return `CubicBezierAnimationCurve(${e.arguments.map((a) => this.t.coerce(a, 'Double')).join(', ')})`;
    }
    const owner = this.mixinOwn(e.expression.name) ? null : this.owner(e.expression.expression) ?? this.inheritedOwner(e.expression.expression, e.expression.name);
    if (!owner) return null;
    const t = this.t;
    const name = e.expression.name.text;
    const m = this.member(owner.name, name, e.expression);
    const recv = owner.isStatic ? owner.name : this.receiver(e.expression.expression, e.expression);
    if (name === 'navigate' && kitExtends(this.index, owner.name, 'Frame')) return this.navigate(recv, e);
    const listener = this.listenerArgs(e, m);
    const args = listener ?? (SCRIPT_OBJECTS.has(name) && this.isView(owner.name) ? e.arguments.map((a) => this.scriptValue(a)) : t.args(e));
    // A super call names every argument: Kotlin does not fill in defaults there.
    if (recv === 'super') {
      const params = (m.params ?? '').trim() ? splitTopLevel(m.params!) : [];
      for (let k = args.length; k < params.length; k++) args.push(/=\s*(.+)$/.exec(params[k])?.[1].trim() ?? 'null');
    }
    return this.fromKit(`${recv}.${name}(${args.join(', ')})`, m.type, t.typeOf(e), keepsNullable(e));
  }

  construct(e: ts.NewExpression): string | null {
    const sym = this.t.resolve(e.expression);
    if (!sym || !isCoreDeclaration(sym.declarations?.[0])) return null;
    const t = this.t;
    const args = e.arguments ?? ts.factory.createNodeArray();
    if (!this.index.has(sym.name)) throw t.error(e, `new ${sym.name} (kit-android has no such class)`);
    if (sym.name === 'Color') {
      if (args.length === 1 && t.typeOf(args[0]) === 'String') return `Color.js(${t.expr(args[0])})`;
      if (args.length === 1) return `Color(${t.toNumber(args[0])}.toLong().toInt())`;
      return `Color.argb(${args.slice(0, 4).map((a) => t.toNumber(a)).join(', ')})`;
    }
    if (sym.name === 'Animation') return `Animation(${args.map((a) => this.scriptValue(a)).join(', ')})`;
    return `${sym.name}(${t.args(e).join(', ')})`;
  }

  /** A function core exports (`getRootLayout()`) that the kit declares at top level. */
  private topLevelCall(e: ts.CallExpression, callee: ts.Identifier): string | null {
    if (!isCoreDeclaration(this.t.resolve(callee)?.declarations?.[0])) return null;
    const m = kitMember(this.index, TOP_LEVEL, callee.text);
    if (!m) return null;
    return this.fromKit(`${callee.text}(${this.t.args(e).join(', ')})`, m.type, this.t.typeOf(e), keepsNullable(e));
  }

  /** `frame.navigate({ create: () => page })`: the kit builds what `create` returns. */
  private navigate(recv: string, e: ts.CallExpression): string {
    const entry = e.arguments[0];
    if (!entry || !ts.isObjectLiteralExpression(entry)) throw this.t.error(e, 'frame.navigate with anything but a { create } entry');
    for (const p of entry.properties) if (p.name?.getText() !== 'create') throw this.t.error(p, `the navigation entry's ${p.name?.getText()}`);
    const create = entry.properties[0];
    if (!create || !ts.isPropertyAssignment(create)) throw this.t.error(entry, 'a navigation entry without create');
    return `${recv}.navigate { (${this.t.expr(create.initializer)})() }`;
  }

  /**
   * An argument core reads as a plain script object (an animation definition):
   * literals become JavaScript objects and arrays, whatever their declared type.
   */
  private scriptValue(e: ts.Expression): string {
    if (ts.isObjectLiteralExpression(e)) {
      const entries = e.properties.map((p) => {
        if (ts.isPropertyAssignment(p)) return `${kotlinString(p.name.getText().replace(/^['"]|['"]$/g, ''))} to ${this.scriptValue(p.initializer)}`;
        if (ts.isShorthandPropertyAssignment(p)) return `${kotlinString(p.name.text)} to ${this.t.coerce(p.name, 'Any?')}`;
        throw this.t.error(p, 'this member in an animation definition');
      });
      return `JSObject(${entries.join(', ')})`;
    }
    if (ts.isArrayLiteralExpression(e)) return `JSArray<Any?>(listOf(${e.elements.map((x) => this.scriptValue(x)).join(', ')}))`;
    if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) {
      // A function core calls back (`closeCallback`) takes script values.
      const names = e.parameters.map((_, i) => `__a${i}`);
      const args = e.parameters.map((p, i) => this.t.fromAnyCode(names[i], this.t.typeOf(p)));
      return `{ ${names.map((n) => `${n}: Any?`).join(', ')} -> (${this.t.expr(e)})(${args.join(', ')}); null }`;
    }
    return this.t.coerce(e, 'Any?');
  }

  /**
   * A kit value as the TypeScript type reads it: kit Ints and Floats are Doubles.
   * An object only tested or dropped stays nullable: core declares some results non-null that are not.
   */
  private fromKit(code: string, kitType: string, tsType: string, keepNull = false): string {
    const k = kitType.trim();
    const numeric = /^(Int|Long|Float|Short|Byte)\??$/.exec(k);
    if (numeric && tsType.startsWith('Double')) return k.endsWith('?') ? `${code}?.toDouble()` : `${code}.toDouble()`;
    if (k.endsWith('?') && !tsType.endsWith('?') && tsType !== 'Any?') {
      const zero = tsType === 'String' ? '""' : tsType === 'Double' ? '0.0' : tsType === 'Boolean' ? 'false' : null;
      return zero ? `(${code} ?: ${zero})` : keepNull ? code : `${code}!!`;
    }
    return code;
  }

  private toKit(code: string, kitType: string): string {
    const k = kitType.replace(/\?$/, '');
    const conversions: Record<string, string> = { Int: 'toInt', Long: 'toLong', Float: 'toFloat', Short: 'toShort', Byte: 'toByte' };
    return conversions[k] ? `(${code}).${conversions[k]}()` : code;
  }
}

/** Whether `e`'s value is only tested (a condition, the operand of `!`) or dropped. */
function keepsNullable(e: ts.Expression): boolean {
  let n: ts.Node = e;
  while (ts.isParenthesizedExpression(n.parent)) n = n.parent;
  const p = n.parent;
  return ts.isExpressionStatement(p) || (ts.isConditionalExpression(p) && p.condition === n) || (ts.isIfStatement(p) && p.expression === n)
    || (ts.isPrefixUnaryExpression(p) && p.operator === ts.SyntaxKind.ExclamationToken);
}
