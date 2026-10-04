import ts from 'typescript';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isCoreDeclaration } from './core.ts';
import { kitExtends, kitMember, type KitMember, type KitType } from './kit-index.ts';
import type { KotlinCore, Translator } from './kotlin.ts';

const KIT = fileURLToPath(new URL('../../kit-android/src/main/kotlin/org/nativescript/kit', import.meta.url));
const NATIVE_MEMBERS = new Set(['android', 'nativeView', 'nativeViewProtected']);

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
          if (!type && isPublic) {
            type = { name, base: decl![2] === 'class' && decl![4] ? decl![4] : null, members: new Map(), props: new Set() };
            types.set(name, type);
          }
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
        const owner = stack.at(-1);
        const enclosing = [...stack].reverse().find((x) => x.type)?.type;
        if (enclosing && /^\s*"\w+"(\s*,\s*"\w+")*\s*->/.test(line)) for (const m of line.matchAll(/"(\w+)"/g)) enclosing.props.add(m[1]);
        if (owner?.type && depth === owner.depth + 1 && !/\b(private|internal|protected)\b/.test(line)) {
          const isStatic = owner.companion || !!(owner.type as KitType & { object?: boolean }).object;
          let m: RegExpExecArray | null;
          if ((m = /^\s*(?:(?:override|open|final|lateinit|const|abstract)\s+)*(?:val|var)\s+`?(\w+)`?\s*:\s*([^={]+)/.exec(line))) add(owner.type, m[1], { kind: 'var', static: isStatic, type: m[2].trim().replace(/\s+get\(\).*$/, '') });
          else if ((m = /^\s*(?:(?:override|open|final|abstract|inline|operator)\s+)*fun\s+(?:<[^>]*>\s*)?`?(\w+)`?\s*\(([^)]*)\)\s*(?::\s*([^={]+))?/.exec(line))) add(owner.type, m[1], { kind: 'func', static: isStatic, type: (m[3] ?? 'Unit').trim(), params: m[2] });
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
  return types;
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
    const type = c.getNonNullableType(c.getTypeAtLocation(e));
    const sym = type.getSymbol();
    if (!sym || !isCoreDeclaration(sym.declarations?.[0])) return null;
    if (this.t.type(type, e) === 'EventData') return null;
    return { name: sym.name, isStatic: false };
  }

  private member(owner: string, name: string, e: ts.Node): KitMember {
    const m = kitMember(this.index, owner, name);
    if (!m) throw this.t.error(e, `${owner}.${name} (kit-android has no such member)`);
    return m;
  }

  private isView(owner: string): boolean {
    return kitExtends(this.index, owner, 'View');
  }

  private isViewProperty(owner: string, name: string): boolean {
    for (let t = this.index.get(owner); t; t = t.base ? this.index.get(t.base.replace(/\(.*$/, '')) : undefined) if (t.props.has(name)) return true;
    return false;
  }

  property(e: ts.PropertyAccessExpression): string | null {
    const owner = this.owner(e.expression);
    if (!owner) return null;
    const t = this.t;
    const name = e.name.text;
    const recv = owner.isStatic ? owner.name : t.expr(e.expression);
    if (!owner.isStatic && NATIVE_MEMBERS.has(name) && this.isView(owner.name)) {
      const native = t.typeOf(e);
      return native === 'Any?' ? `${recv}.nativeView` : `(${recv}.nativeView as ${native})`;
    }
    if (!owner.isStatic && this.isView(owner.name) && !kitMember(this.index, owner.name, name)) {
      if (!this.isViewProperty(owner.name, name)) throw t.error(e, `${owner.name}.${name} (not a property kit-android applies)`);
      return t.fromAnyCode(`${recv}.get(${JSON.stringify(name)})`, t.typeOf(e), true);
    }
    const m = this.member(owner.name, name, e);
    return this.fromKit(`${recv}.${name}`, m.type, t.typeOf(e));
  }

  lvalue(e: ts.PropertyAccessExpression): string | null {
    const owner = this.owner(e.expression);
    if (!owner) return null;
    const m = kitMember(this.index, owner.name, e.name.text);
    return m ? `${owner.isStatic ? owner.name : this.t.expr(e.expression)}.${e.name.text}` : null;
  }

  assign(left: ts.PropertyAccessExpression, value: ts.Expression): string | null {
    const owner = this.owner(left.expression);
    if (!owner) return null;
    const t = this.t;
    const name = left.name.text;
    const recv = owner.isStatic ? owner.name : t.expr(left.expression);
    if (!owner.isStatic && this.isView(owner.name) && !kitMember(this.index, owner.name, name)) {
      if (!this.isViewProperty(owner.name, name)) throw t.error(left, `${owner.name}.${name} (not a property kit-android applies)`);
      return `${recv}.set(${JSON.stringify(name)}, ${t.coerce(value, 'Any?')})`;
    }
    const m = this.member(owner.name, name, left);
    return `${recv}.${name} = ${this.toKit(t.coerce(value, t.typeOf(left)), m.type)}`;
  }

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
    if (!this.index.has(sym.name)) throw t.error(e, `new ${sym.name} (kit-android has no such class)`);
    if (sym.name === 'Color') {
      if (args.length === 1 && t.typeOf(args[0]) === 'String') return `Color.js(${t.expr(args[0])})`;
      if (args.length === 1) return `Color(${t.toNumber(args[0])}.toLong().toInt())`;
      return `Color.argb(${args.slice(0, 4).map((a) => t.toNumber(a)).join(', ')})`;
    }
    return `${sym.name}(${t.args(e).join(', ')})`;
  }

  /** A kit value as the TypeScript type reads it: kit Ints and Floats are Doubles. */
  private fromKit(code: string, kitType: string, tsType: string): string {
    const k = kitType.trim();
    const numeric = /^(Int|Long|Float|Short|Byte)\??$/.exec(k);
    if (numeric && tsType.startsWith('Double')) return k.endsWith('?') ? `${code}?.toDouble()` : `${code}.toDouble()`;
    if (k.endsWith('?') && !tsType.endsWith('?') && tsType !== 'Any?') {
      const zero = tsType === 'String' ? '""' : tsType === 'Double' ? '0.0' : tsType === 'Boolean' ? 'false' : null;
      return zero ? `(${code} ?: ${zero})` : `${code}!!`;
    }
    return code;
  }

  private toKit(code: string, kitType: string): string {
    const k = kitType.replace(/\?$/, '');
    const conversions: Record<string, string> = { Int: 'toInt', Long: 'toLong', Float: 'toFloat', Short: 'toShort', Byte: 'toByte' };
    return conversions[k] ? `(${code}).${conversions[k]}()` : code;
  }
}
