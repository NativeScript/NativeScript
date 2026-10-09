import ts from 'typescript';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { kitExtends, kitIndex, kitMember, type KitMember, type KitType } from './kit-index.ts';
import { splitTopLevel, type Translator } from './swift.ts';
import { KIT_APPLE_SOURCES } from './paths.ts';

export const KIT = KIT_APPLE_SOURCES;

/** The native view a core class drives on iOS: what `view.ios` and `view.nativeView` are. */
export const NATIVE_VIEWS: Record<string, string> = {
  Label: 'UILabel', Button: 'UIButton', TextField: 'UITextField', TextView: 'UITextView', Image: 'UIImageView', Switch: 'UISwitch',
  Slider: 'UISlider', SegmentedBar: 'UISegmentedControl', ActivityIndicator: 'UIActivityIndicatorView', ScrollView: 'UIScrollView',
  ListView: 'UITableView', Progress: 'UIProgressView', DatePicker: 'UIDatePicker', TimePicker: 'UIDatePicker', WebView: 'WKWebView', View: 'UIView',
  HtmlView: 'UITextView', SearchBar: 'UISearchBar', ListPicker: 'UIPickerView',
};
/** What `ios` is where it is a view controller, whose `nativeView` is the controller's view. */
export const NATIVE_CONTROLLERS: Record<string, string> = { TabView: 'UITabBarController', Page: 'UIViewController' };
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
  return !!file && (KIT_PACKAGES.test(file) || kitPackageDeclaration(file)) && !/[\\/]objc![^\\/]+\.d\.ts$/.test(file);
}

/**
 * A declaration file of core or a kit plugin by the package it is in, as Node finds the nearest package.json:
 * where the package is not under `node_modules/<name>` (core's own repository: `packages/core`, `dist/packages/core`).
 */
function kitPackageDeclaration(file: string): boolean {
  if (!file.endsWith('.d.ts')) return false;
  const name = packageOf(file)?.name;
  return name === '@nativescript/core' || (!!name && KIT_PLUGINS.includes(name));
}

const packages = new Map<string, { name: string; root: string } | null>();
/** The package a file is in: the nearest package.json naming one. */
export function packageOf(file: string): { name: string; root: string } | null {
  const seen: string[] = [];
  let found: { name: string; root: string } | null = null;
  for (let dir = dirname(file); ; dir = dirname(dir)) {
    if (packages.has(dir)) { found = packages.get(dir)!; break; }
    seen.push(dir);
    const manifest = join(dir, 'package.json');
    const name = existsSync(manifest) ? (JSON.parse(readFileSync(manifest, 'utf8')) as { name?: string }).name : undefined;
    if (name) { found = { name, root: dir }; break; }
    if (dirname(dir) === dir) break;
  }
  for (const d of seen) packages.set(d, found);
  return found;
}

/** A core symbol's name as the kit names it: a class exported as its module's default (`abortcontroller`) by the class's own name. */
export function coreSymbolName(sym: ts.Symbol): string {
  const decl = sym.declarations?.[0];
  return sym.name === 'default' && decl && ts.isClassDeclaration(decl) && decl.name ? decl.name.text : sym.name;
}

/** A member core's declarations mark as a view property (`@nsProperty`). */
export function isCoreProperty(decl: ts.Declaration): boolean {
  const file = decl.getSourceFile().fileName;
  return (/[\\/]@nativescript[\\/]core[\\/]/.test(file) || (file.endsWith('.d.ts') && packageOf(file)?.name === '@nativescript/core')) && ts.getJSDocTags(decl).some((t) => t.tagName.text === 'nsProperty');
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
 * native release is a kit module (`kit-apple/Sources/NativeScriptKit/Plugins/`) rather than their
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

  /** The kit's class of a core class name: the iOS file's where the kit names it apart (`Font__font_ios`), else the class of that name. */
  platformClass(name: string): string {
    const ios = `${name}__${name.replace(/[A-Z]/g, (c, k) => (k ? '_' : '') + c.toLowerCase())}_ios`;
    if (this.index.has(ios)) return ios;
    if (this.index.has(name)) return name;
    // A class the kit names by its file where another has its name (`Source__debug_source`): the one such class.
    const renamed = [...this.index.keys()].filter((k) => k.startsWith(`${name}__`) && !k.includes('.'));
    return renamed.length === 1 ? renamed[0] : name;
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
        // A class a core namespace exports (`Utils.Source`): the class itself, under the kit's name for it.
        const target = sym.flags & ts.SymbolFlags.Alias ? c.getAliasedSymbol(sym) : sym;
        if (outer?.isStatic && target.flags & ts.SymbolFlags.Class && this.index.has(this.platformClass(target.name))) return { name: this.platformClass(target.name), isStatic: true };
      }
    }
    if (ts.isIdentifier(e)) {
      const module = this.moduleOwner(e);
      if (module) return { name: module, isStatic: true };
      const sym = this.t.resolve(e);
      const decl = sym?.declarations?.[0];
      if (sym && isCoreDeclaration(decl) && (sym.flags & (ts.SymbolFlags.Class | ts.SymbolFlags.ValueModule | ts.SymbolFlags.Variable)) && !this.t.compiledCounterpart(sym)) {
        if (sym.flags & ts.SymbolFlags.ValueModule) return { name: e.text, isStatic: true };
        if (sym.flags & ts.SymbolFlags.Class) return { name: this.platformClass(sym.name), isStatic: true };
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
    const name = coreSymbolName(sym);
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
  /**
   * A function of a core module that core's index does not export (`resolveModuleName`, imported from
   * `@nativescript/core/module-name-resolver`): the kit's module enum it was compiled into, which has no top-level forwarder for it.
   */
  moduleFunction(decl: ts.Declaration): string | null {
    // Or a module's variable (`_rootModalViews` of view-common).
    const variable = ts.isVariableDeclaration(decl) && ts.isIdentifier(decl.name) && ts.isSourceFile(decl.parent.parent.parent);
    if (!(ts.isFunctionDeclaration(decl) || variable) || !(decl as ts.NamedDeclaration).name || !isCoreDeclaration(decl)) return null;
    const name = ((decl as ts.NamedDeclaration).name as ts.Identifier).text;
    if (existsSync(join(KIT, 'Core', `__Export.${name}.swift`))) return null;
    const file = decl.getSourceFile().fileName;
    const root = /^(.*[\\/]@nativescript[\\/]core)[\\/]/.exec(file)?.[1] ?? (packageOf(file)?.name === '@nativescript/core' ? packageOf(file)!.root : undefined);
    if (!root) return null;
    const rel = file.slice(root.length + 1).replace(/\\/g, '/').replace(/(\.(ios|android))?\.d\.ts$|(\.(ios|android))?\.ts$/, '');
    const kind = variable ? 'var' : 'func';
    const owner = `Core_${rel.replace(/[^A-Za-z0-9]+/g, '_')}`;
    if (kitMember(this.index, owner, name)?.kind === kind) return `${owner}.${name}`;
    // A module core's index exports as a namespace (`export * as Http from './http'`): the kit's type of that name.
    const barrel = rel.endsWith('/index') || !rel.includes('/') ? coreBarrels(root).get(rel.split('/')[0]) : undefined;
    return barrel && kitMember(this.index, barrel, name)?.kind === kind ? `${barrel}.${name}` : null;
  }

  private moduleOwner(e: ts.Identifier): string | null {
    const local = this.t.checker.getSymbolAtLocation(e);
    const target = local && local.flags & ts.SymbolFlags.Alias ? this.t.checker.getAliasedSymbol(local) : local;
    const decl = target?.valueDeclaration ?? target?.declarations?.[0];
    // A module or namespace, or a module's constant object of functions (`export const ios = { … }`).
    const constant = !!target && !!(target.flags & ts.SymbolFlags.Variable) && !!decl && ts.isVariableDeclaration(decl) && ts.isSourceFile(decl.parent.parent.parent);
    if (!target || !(target.flags & ts.SymbolFlags.ValueModule || constant) || !decl || !isCoreDeclaration(decl)) return null;
    const file = decl.getSourceFile().fileName;
    const root = /^(.*[\\/]@nativescript[\\/]core)[\\/]/.exec(file)?.[1] ?? (packageOf(file)?.name === '@nativescript/core' ? packageOf(file)!.root : undefined);
    const barrel = root ? coreBarrels(root).get(file.slice(root.length + 1).split(/[\\/]/)[0]) : undefined;
    const candidates = ts.isSourceFile(decl) ? [barrel] : [barrel && `${barrel}.${target.name}`, constant ? undefined : target.name];
    return candidates.find((c): c is string => !!c && this.index.has(c)) ?? null;
  }

  /** A member the kit's class lacks that the program's own declarations give a core type (an intersection's added members). */
  private addedMember(owner: string, e: ts.PropertyAccessExpression): boolean {
    if (kitMember(this.index, owner, e.name.text)) return false;
    const decls = this.t.resolve(e.name)?.declarations ?? [];
    return decls.length > 0 && decls.every((d) => !isCoreDeclaration(d) && !d.getSourceFile().isDeclarationFile);
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
    // `a?.b`: Swift chains only on an optional, and lenient code types none; as optional, valid for an implicitly unwrapped one too.
    const tt = t.typeOf(e.expression);
    const chained = !owner.isStatic && !!e.questionDotToken;
    const recv = owner.isStatic ? owner.name : chained ? (tt.endsWith('?') ? `${t.expr(e.expression)}?` : `(${t.expr(e.expression)} as ${tt.replace(/!$/, '')}?)?`) : t.expr(e.expression);
    // Swift's chain, as script's, goes on to what follows (`a?.b.c`), reading the optional.
    const continued = ts.isOptionalChain(e.parent) && (e.parent as ts.PropertyAccessExpression).expression === e;
    const inChain = chained || (ts.isOptionalChain(e) && !owner.isStatic);
    // A kit without the member (`ios` is a Page's controller where the kit has it from core).
    if (!owner.isStatic && NATIVE_MEMBERS.has(name) && this.isView(owner.name) && !kitMember(this.index, owner.name, name)) return `${recv}.nativeView`;
    if (!owner.isStatic && this.isView(owner.name) && !kitMember(this.index, owner.name, name)) {
      if (!this.isViewProperty(owner.name, name)) unappliedProperty(t, e.name, `${owner.name}.${name}`, 'NativeScriptKit');
      return t.fromAnyCode(`${recv}.get(${JSON.stringify(name)})`, t.typeOf(e), true);
    }
    // A namespace of core's held as a value (`knownFolders.ios[name]()`): an object of its functions that take nothing, as script reads it.
    if (owner.isStatic && !kitMember(this.index, owner.name, name) && this.index.has(`${owner.name}.${name}`)) {
      const ns = `${owner.name}.${name}`;
      const fns = [...(this.index.get(ns)?.members ?? [])].filter(([, ms]) => ms.some((m) => m.kind === 'func' && m.static && !(m.params ?? '').trim()));
      return `JSObject([${fns.map(([fn]) => `(${JSON.stringify(fn)}, { (_: [Any?]) throws -> Any? in ${kitMember(this.index, ns, fn)?.throws ? 'try ' : ''}${ns}.${fn}() } as JSFunction)`).join(', ')}])`;
    }
    const m = this.member(owner.name, name, e);
    if (inChain && continued) return `${recv}.${name}`;
    return this.fromKit(`${recv}.${name}`, inChain ? m.type.replace(/[?!]?$/, '?') : m.type, t.typeOf(e));
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
      // Core's `set` runs the property's change handlers, whose errors are reported as core reports them.
      return `jsReport { try ${recv}.set(${JSON.stringify(name)}, ${t.coerce(value, 'Any?')}) }`;
    }
    const m = this.member(owner.name, name, left);
    // `view._addViewToNativeVisualTree = () => false`: core's code calls its method directly, which a value on the object cannot replace.
    if (m.kind === 'func') throw t.error(left, `${owner.name}.${name} replaced on an object: core calls ${name} statically, and replacing it is not supported yet`);
    // A kit member typed `Any?` holds what core reads as a plain script object (`TouchManager.animations`).
    if (m.type.trim() === 'Any?') return `${recv}.${name} = ${this.scriptValue(value)}`;
    // Undefined where the kit holds a string, number or boolean: its zero, as core's own code assigning it was compiled.
    const zero = ({ String: '""', Double: '0', Bool: 'false' } as Record<string, string>)[m.type.trim()];
    if (zero && (value.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(value) && value.text === 'undefined'))) return `${recv}.${name} = ${zero}`;
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

  /**
   * A member a mixin class declares: the extension it becomes has it by name. So too a member a plugin's
   * typings add to the core class in a module augmentation (`declare module '@nativescript/core/ui/core/view'
   * { interface View { showBottomSheet(…) } }`) where a mixin applied to that class declares it.
   */
  private mixinOwn(name: ts.MemberName): boolean {
    const decl = this.t.checker.getSymbolAtLocation(name)?.valueDeclaration;
    if (!decl) return false;
    if (ts.isClassDeclaration(decl.parent)) return !!this.t.mixinOf(this.t.checker.getSymbolAtLocation(decl.parent.name!));
    const owner = decl.parent;
    const augmented = ts.isInterfaceDeclaration(owner) && ts.isModuleBlock(owner.parent) && ts.isModuleDeclaration(owner.parent.parent)
      && ts.isStringLiteral(owner.parent.parent.name) && owner.parent.parent.name.text.startsWith('@nativescript/core');
    return augmented && this.t.patterns.mixinsOf(owner.name.text).some((c) => c.members.some((m) => m.name?.getText() === name.getText()));
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
      const name = coreSymbolName(sym);
      // A color made of a string throws where the string is no color.
      if (name === 'Color') return (e.arguments ?? []).some((a) => this.t.typeOf(a) !== 'Double');
      return (this.index.get(this.platformClass(name))?.members.get('init') ?? []).some((m) => m.throws);
    }
    // A function core's index exports (`fromObject`), as the kit compiled it.
    if (ts.isIdentifier(e.expression)) {
      const decl = this.t.resolve(e.expression)?.declarations?.[0];
      if (!decl || !isCoreDeclaration(decl) || !ts.isFunctionDeclaration(decl)) return false;
      const owned = this.moduleFunction(decl);
      return owned ? !!kitMember(this.index, owned.split('.')[0], e.expression.text)?.throws : this.throwingExports().has(e.expression.text);
    }
    if (!ts.isPropertyAccessExpression(e.expression) || this.mixinOwn(e.expression.name)) return false;
    // `super.initNativeView()`, `this.requestLayout()` in a program's class of a core one: the core class declaring the method.
    const member = this.t.resolve(e.expression.name)?.declarations?.[0];
    const declaring = member && isCoreDeclaration(member) && ts.isClassLike(member.parent) && member.parent.name ? member.parent.name.text : null;
    const owner = this.owner(e.expression.expression)?.name ?? declaring;
    if (owner && this.addedMember(owner, e.expression)) return true;
    const m = owner ? kitMember(this.index, owner, e.expression.name.text) : null;
    // A property holding a function that throws (`on: ((String, …) throws -> Void)!`).
    return !!m && (!!m.throws || (m.kind === 'var' && /\)\s*throws\s*->[^>]*\)?[?!]?$/.test(m.type)));
  }

  /** `signal.aborted`: a property of core's whose getter the kit compiled as throwing. */
  throwingAccess(e: ts.PropertyAccessExpression): boolean {
    if (this.mixinOwn(e.name)) return false;
    const owner = this.owner(e.expression)?.name;
    const m = owner ? kitMember(this.index, owner, e.name.text) : null;
    return m?.kind === 'var' && !!m.throws;
  }

  private exportsThrowing: Set<string> | null = null;
  /** The functions the kit's index exports that throw. */
  private throwingExports(): Set<string> {
    if (!this.exportsThrowing) {
      this.exportsThrowing = new Set();
      const dir = join(KIT, 'Core');
      for (const f of existsSync(dir) ? readdirSync(dir) : []) {
        if (!f.startsWith('__Export.')) continue;
        for (const m of readFileSync(join(dir, f), 'utf8').matchAll(/^public func (\w+)(?:<[^>]*>)?(\(.*)$/gm)) {
          // `throws` right after the parameter list, not inside a function type it returns.
          let depth = 0, end = 0;
          for (; end < m[2].length; end++) { if (m[2][end] === '(') depth++; else if (m[2][end] === ')' && --depth === 0) break; }
          if (/^\s*throws\b/.test(m[2].slice(end + 1))) this.exportsThrowing.add(m[1]);
        }
      }
    }
    return this.exportsThrowing;
  }

  /** A call of a core module's function the kit compiled into its module enum, its result as the declarations type it. */
  moduleCall(decl: ts.Declaration, code: string, tsType: string): string {
    const owned = ts.isFunctionDeclaration(decl) && this.moduleFunction(decl);
    const m = owned && kitMember(this.index, owned.split('.')[0], (decl as ts.FunctionDeclaration).name!.text);
    return m ? this.fromKit(code, m.type, tsType) : code;
  }

  private exportParams = new Map<string, string[] | null>();
  /** The arguments of a call of a function core's index exports, as the kit's forwarder takes them (`addWeakEventListener(…, target.onEvent, …)`). */
  exportArgs(e: ts.CallExpression, decl: ts.Declaration, args: string[]): string[] {
    if (!ts.isFunctionDeclaration(decl) || !decl.name || !isCoreDeclaration(decl) || this.moduleFunction(decl)) return args;
    const name = decl.name.text;
    if (!this.exportParams.has(name)) {
      const file = join(KIT, 'Core', `__Export.${name}.swift`);
      const text = existsSync(file) ? readFileSync(file, 'utf8') : '';
      const at = text.indexOf(`\npublic func ${name}(`);
      let params: string[] | null = null;
      if (at >= 0) {
        const open = text.indexOf('(', at);
        let depth = 0, end = open;
        for (; end < text.length; end++) { if (text[end] === '(') depth++; else if (text[end] === ')' && --depth === 0) break; }
        params = splitParams(text.slice(open + 1, end));
      }
      this.exportParams.set(name, params);
    }
    const params = this.exportParams.get(name);
    if (!params || params.length < e.arguments.length) return args;
    const out = [...args];
    this.matchKitParams(e, params, out);
    return out;
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
    const owner = this.mixinOwn(e.expression.name) ? null : this.owner(e.expression.expression) ?? this.inheritedOwner(e.expression.expression, e.expression.name);
    if (!owner) return null;
    const t = this.t;
    const name = e.expression.name.text;
    // A method the app's own type adds to a core one (`View & { addChild(view: View): void }`): called by name, as script calls it.
    if (this.addedMember(owner.name, e.expression)) {
      const target = owner.isStatic ? owner.name : t.expr(e.expression.expression);
      return this.fromKit(`jsCallMethod(${target}, ${JSON.stringify(name)}${e.arguments.map((a) => `, ${t.coerce(a, 'Any?')}`).join('')})`, 'Any?', t.typeOf(e));
    }
    // `toString()` of a kit object without its own: as script converts it.
    if (name === 'toString' && !owner.isStatic && !e.arguments.length && !kitMember(this.index, owner.name, name)) return `jsToString(${t.expr(e.expression.expression)})`;
    const m = this.member(owner.name, name, e.expression);
    // `this.hud?.animate(…)`: nothing runs where the object is missing.
    const chained = !owner.isStatic && !!e.expression.questionDotToken && t.typeOf(e.expression.expression).endsWith('?');
    // A namespace of core's by its module (`path.join`), which a local of the name (`path: string`) would shadow.
    const recv = owner.isStatic ? (/^[a-z]/.test(owner.name) ? `NativeScriptKit.${owner.name}` : owner.name) : t.expr(e.expression.expression) + (chained ? '?' : '');
    if (name === 'navigate' && kitExtends(this.index, owner.name, 'Frame')) return this.navigate(recv, e);
    const listener = this.listenerArgs(e, m);
    // A kit method takes the arguments given; its own defaults stand for the rest.
    // A last argument spread into the kit's rest parameter is placed below, as the array it is.
    const spreadLast = e.arguments.length > 0 && ts.isSpreadElement(e.arguments[e.arguments.length - 1]);
    const args = listener ?? (SCRIPT_OBJECTS.has(name) && this.isView(owner.name) ? e.arguments.map((a) => this.scriptValue(a)) : spreadLast ? [...t.args(e, e.arguments.length - 1), ''] : t.args(e, e.arguments.length));
    // A property holding a function (`Application.on`, which core assigns in its constructor): its parameters are the function type's,
    // each of them passed, as a Swift function value has no defaults.
    const held = m.kind === 'var' && !m.params ? t.functionTypeParts(m.type.replace(/[?!]$/, '').replace(/^\((.*)\)$/, '$1')) : null;
    // A closure for a kit parameter that cannot throw (`dispatchToMainThread`) reports what it throws, as a handler does.
    const kitParams = (m.params ?? '').trim() ? splitParams(m.params!) : held ? held.params.map((p) => `_ p: ${p}`) : [];
    e.arguments.forEach((a, k) => {
      const p = kitParams[k];
      if (!listener && p && (ts.isArrowFunction(a) || ts.isFunctionExpression(a)) && !a.parameters.length && (t.checker.getContextualType(a)?.getCallSignatures()[0]?.getParameters().length ?? 0) === 0 && /->/.test(p) && !/\bthrows\b/.test(p) && /\(\s*\)\s*->/.test(p)) args[k] = t.callback(a);
    });
    const packed = !listener && this.matchKitParams(e, kitParams, args);
    // A rest parameter (`join(...paths)`), which the kit takes as one array.
    const restAt = (t.checker.getResolvedSignature(e)?.getDeclaration() as ts.SignatureDeclaration | undefined)?.parameters?.findIndex((p) => !!p.dotDotDotToken) ?? -1;
    const restType = restAt >= 0 ? /:\s*(JSArray<.*>)\s*$/.exec(kitParams[restAt] ?? '')?.[1] : undefined;
    if (restType && !listener && !packed && !e.arguments.some(ts.isSpreadElement) && args.length >= restAt) args.splice(restAt, args.length - restAt, `${restType}([${args.slice(restAt).join(', ')}])`);
    // One array spread into the rest (`path.join(...parts)`): the array the kit's rest parameter is.
    const spread = e.arguments[restAt];
    if (restType && !listener && !packed && e.arguments.length === restAt + 1 && spread && ts.isSpreadElement(spread)) args.splice(restAt, args.length - restAt, t.coerce(spread.expression, restType));
    if (held) {
      while (args.length < held.params.length && /[?!]$/.test(held.params[args.length])) args.push('nil');
      return this.fromKit(`${recv}.${name}(${args.join(', ')})`, held.result, t.typeOf(e));
    }
    return this.fromKit(`${recv}.${name}(${args.join(', ')})`, chained && m.type !== 'Void' ? m.type.replace(/\??$/, '?') : m.type, t.typeOf(e));
  }

  /**
   * Arguments as the kit's own parameters take them, where its Swift types differ from the
   * declarations' (the kit generated from core): a function as the kit's function type
   * (`on(event, (data) => …)` for `(EventData?) throws -> Void`), and the arguments from a
   * rest parameter on (`closeModal('done')`) as the array the kit's rest parameter is.
   */
  /** Whether it packed a rest parameter's arguments. */
  private matchKitParams(e: ts.CallExpression, kitParams: string[], args: string[]): boolean {
    const t = this.t;
    const decl = t.checker.getResolvedSignature(e)?.getDeclaration();
    const declared = decl && !ts.isJSDocSignature(decl) ? decl.parameters : undefined;
    let packed = false;
    kitParams.forEach((p, k) => {
      const type = kitParamType(p);
      // `...args: any` the kit compiled as one untyped parameter, which the function reads as the array script passes;
      // or a method reading `arguments`, which takes them all so.
      // Not where the kit spreads the rest over parameters of its own (`showModal(_ __b0: Any?, _ __b1: Any?)`).
      const wholeRest = type === 'JSArray<Any?>' || (type === 'Any?' && k === kitParams.length - 1 && !/^_\s+__b\d/.test(p.trim()));
      if ((declared?.[k]?.dotDotDotToken && wholeRest) || (k === 0 && kitParams.length === 1 && /^_ __arguments: JSArray<Any\?>$/.test(p.trim()))) {
        args.splice(k, args.length - k, `JSArray<Any?>([${e.arguments.slice(k).map((a) => t.coerce(a, 'Any?')).join(', ')}])`);
        packed = true;
        return;
      }
      const a = e.arguments[k];
      if (a && /->/.test(type) && (ts.isArrowFunction(a) || ts.isFunctionExpression(a) || ts.isIdentifier(a) || ts.isPropertyAccessExpression(a))) {
        // An optional function parameter (`callback: ((Any?) throws -> Void)?`) takes a closure as the function it wraps.
        const plain = type.replace(/^\((.*)\)[?!]$/, '$1');
        const fn = t.functionTypeParts(plain);
        if ((ts.isArrowFunction(a) || ts.isFunctionExpression(a)) && fn) {
          args[k] = this.closureArgument(a, plain);
        } else {
          const own = t.typeOf(a);
          args[k] = /->/.test(own) && own.replace(/^\((.*)\)$/, '$1') !== type ? t.convert(t.expr(a), own, type) : t.coerce(a, type);
        }
      }
    });
    return packed;
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
    const className = coreSymbolName(sym);
    let kitName = this.platformClass(className);
    // A class of a namespace (`Trace.DefaultErrorHandler`), nested in the kit as in core.
    if (!this.index.has(kitName)) {
      const path = [sym.name];
      let p = (sym as ts.Symbol & { parent?: ts.Symbol }).parent;
      for (; p && p.flags & ts.SymbolFlags.Module && !ts.isSourceFile(p.valueDeclaration ?? p.declarations![0]); p = (p as ts.Symbol & { parent?: ts.Symbol }).parent) path.unshift(p.name);
      // A module core's index exports as a namespace (`export * as Trace from './trace'`): its public name.
      const file = p?.valueDeclaration && ts.isSourceFile(p.valueDeclaration) ? p.valueDeclaration.fileName : undefined;
      const root = file && /^(.*[\\/]@nativescript[\\/]core)[\\/]/.exec(file)?.[1];
      const barrel = root ? coreBarrels(root).get(file!.slice(root.length + 1).split(/[\\/]/)[0]) : undefined;
      if (barrel) path.unshift(barrel);
      if (path.length > 1 && this.index.has(path.join('.'))) kitName = path.join('.');
    }
    if (!this.index.has(kitName)) throw t.error(e, `new ${className} (NativeScriptKit has no such class)`);
    // Core's constructor takes its arguments as a rest parameter; numbers never make it throw.
    if (sym.name === 'Color') {
      const list = `JSArray<Any?>([${args.map((a) => t.coerce(a, 'Any?')).join(', ')}])`;
      // A string may not be a color, which throws as script's constructor does.
      return args.some((a) => t.typeOf(a) !== 'Double') ? `Color(${list})` : `(try! Color(${list}))`;
    }
    if (sym.name === 'Animation') return `Animation(${args.map((a) => this.scriptValue(a)).join(', ')})`;
    const inits = (this.index.get(kitName)?.members.get('init') ?? []).map((m) => ((m.params ?? '').trim() ? splitTopLevel(m.params!) : []));
    // A constructor reading `arguments`, which the kit's takes as the one array script passes.
    if (inits.length === 1 && inits[0].length === 1 && /^_ __arguments: JSArray<Any\?>$/.test(inits[0][0].trim())) return `${kitName}(${t.packed(args, 'JSArray<Any?>')})`;
    // The arguments as the kit's initializer takes them (`ImageSource(_ nativeSource: UIImage!)` for core's `nativeSource?: any`).
    const params = (this.index.get(kitName)?.members.get('init') ?? []).map((m) => ((m.params ?? '').trim() ? splitTopLevel(m.params!) : [])).find((ps) => ps.length >= args.length && !args.some(ts.isSpreadElement));
    if (params && args.length && params.every((p) => p.includes(':'))) {
      return `${kitName}(${args.map((a, k) => {
        const p = params[k];
        const label = p.slice(0, p.indexOf(':')).trim().split(/\s+/)[0];
        const type = p.slice(p.indexOf(':') + 1).replace(/=.*$/, '').trim().replace(/^@escaping\s+/, '').replace(/!$/, '?');
        return `${label === '_' ? '' : `${label}: `}${(ts.isArrowFunction(a) || ts.isFunctionExpression(a)) && t.functionTypeParts(type) ? this.closureArgument(a, type) : t.coerce(a, type)}`;
      }).join(', ')})`;
    }
    return `${kitName}(${t.args(e).join(', ')})`;
  }

  /**
   * A closure passed where the kit takes a function of a known Swift type: the type's parameters past those the closure
   * declares, and, where core's lenient types differ from the app's (`(ParserEvent?) throws -> Void` for `(e: ParserEvent) => void`), adapted.
   */
  private closureArgument(a: ts.ArrowFunction | ts.FunctionExpression, type: string): string {
    const t = this.t;
    const want = t.functionTypeParts(type)!;
    t.closureSlots.set(a, want.params);
    try {
      const code = t.coerce(a, type);
      const own = t.typeOf(a);
      const have = t.functionTypeParts(own.replace(/^\((.*)\)[?!]$/, '$1'));
      return have && have.params.length === want.params.length && own.replace(/^\((.*)\)[?!]$/, '$1') !== type.replace(/^\((.*)\)[?!]$/, '$1') ? t.convert(code, own, type) : code;
    } finally { t.closureSlots.delete(a); }
  }

  /** `frame.navigate({ create: () => page })`: the kit builds what `create` returns. */
  private navigate(recv: string, e: ts.CallExpression): string {
    const entry = e.arguments[0];
    if (!entry) throw this.t.error(e, 'frame.navigate without an entry');
    // A function making the page, which core calls for it: its result is the page.
    const factory = (code: string) => `({ (_: [Any?]) throws -> Any? in try (${code})() } as JSFunction)`;
    if (ts.isArrowFunction(entry) || ts.isFunctionExpression(entry)) return `${recv}.navigate(${factory(this.t.expr(entry))})`;
    // A module name, or an entry held in a variable: as script gives it, its `create` boxed as script calls it.
    if (!ts.isObjectLiteralExpression(entry)) return `${recv}.navigate(${this.t.coerce(entry, 'Any?')})`;
    // Core reads the entry as script gives it: `create` a function it calls for the page, the rest plain values.
    const fields = entry.properties.map((p) => {
      if (ts.isShorthandPropertyAssignment(p)) return p.name.text === 'create' ? `("create", ${factory(this.t.expr(p.name))})` : `(${JSON.stringify(p.name.text)}, ${this.t.coerce(p.name, 'Any?')})`;
      if (!ts.isPropertyAssignment(p)) throw this.t.error(p, `the navigation entry's ${p.name?.getText()}`);
      const name = p.name.getText().replace(/^['"]|['"]$/g, '');
      if (name !== 'create') return `(${JSON.stringify(name)}, ${this.scriptValue(p.initializer)})`;
      return `("create", ${factory(this.t.expr(p.initializer))})`;
    });
    return `${recv}.navigate(JSObject([${fields.join(', ')}]))`;
  }

  /**
   * An argument core reads as a plain script object (an animation definition):
   * literals become JavaScript objects and arrays, whatever their declared type.
   */
  private scriptValue(e: ts.Expression): string {
    if (ts.isObjectLiteralExpression(e)) {
      const entry = (p: ts.ObjectLiteralElementLike): [string, string] => {
        if (ts.isPropertyAssignment(p)) return [JSON.stringify(p.name.getText().replace(/^['"]|['"]$/g, '')), this.scriptValue(p.initializer)];
        if (ts.isShorthandPropertyAssignment(p)) return [JSON.stringify(p.name.text), this.t.coerce(p.name, 'Any?')];
        throw this.t.error(p, 'this member in an animation definition');
      };
      if (!e.properties.some(ts.isSpreadAssignment)) return `JSObject([${e.properties.map((p) => `(${entry(p).join(', ')})`).join(', ')}])`;
      // `{ ...base, duration: 150 }`: each in order, a later key over an earlier one.
      const steps = e.properties.map((p) => (ts.isSpreadAssignment(p) ? `try jsObjectSpread(__o, ${this.t.coerce(p.expression, 'Any?').replace(/^try /, '')})` : `__o[${entry(p)[0]}] = try ${entry(p)[1].replace(/^try /, '')}`));
      const body = `let __o = JSObject([]); ${steps.join('; ')}; return __o`;
      return `(try { () throws -> JSObject in ${body} }())`;
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
    // An array of a base class (`Frame._stack()` of FrameBase) that TypeScript types as of a subclass.
    const ke = /^JSArray<([A-Z]\w*)>[?!]?$/.exec(k)?.[1], te = /^JSArray<([A-Z]\w*)>$/.exec(tsType)?.[1];
    if (ke && te && ke !== te && !['Any', 'Double', 'String', 'Bool'].includes(te)) return `JSArray<${te}>((${code})${/[?!]$/.test(k) ? '!' : ''}.storage.map { $0 as! ${te} })`;
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
