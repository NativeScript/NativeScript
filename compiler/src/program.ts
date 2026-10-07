import ts from 'typescript';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { foldPlatform, type Platform } from './platform.ts';
import { KIT_PLUGINS, nativeViewOf } from './core.ts';
import type { PluginSources } from './plugins/source.ts';
import { packageOf, runtimeFile } from './plugins/resolve.ts';
import { NATIVE_VIEWS_ANDROID } from './core-kotlin.ts';

/**
 * The release build's view of the framework APIs an app imports. Only their
 * types matter here: the translator recognizes the calls (`ref`, `signal`,
 * `createSignal`, `$state`, `$navigateTo`) and emits Swift for them.
 */
const SHIMS: Record<string, string> = {
  '@nativescript/release': `
    export interface Sig<T> { value: T }
    export declare function $signal<T>(value: T): Sig<T>;
    /** Vue's ref: deeply reactive, so arrays and objects it holds notify on mutation. */
    export interface VueRef<T> { value: T }
    export declare function $ref<T>(value: T): VueRef<T>;
    import type { ItemEventData, PanGestureEventData, PinchGestureEventData, RotationGestureEventData, SwipeGestureEventData, TouchGestureEventData, Pointer as CorePointer } from '@nativescript/core';
    /** A template handler's \$event: whichever of core's event types the handler declares. */
    export type EventData = ItemEventData & PanGestureEventData & PinchGestureEventData & RotationGestureEventData & SwipeGestureEventData & TouchGestureEventData & { value: any; item: any };
    export type Pointer = CorePointer;
    export declare function $navigate(page: () => any): void;
    export interface WritableSignal<T> { (): T; set(value: T): void; update(fn: (value: T) => T): void; $write(value: T | ((previous: T) => T)): void }
    export declare function $writable<T>(value: T): WritableSignal<T>;
    /** Component state its handlers read as of the last commit: React's and Octane's \`useState\`, Solid's signals. */
    export declare function $state<T>(signal: WritableSignal<T>): WritableSignal<T>;
    export declare function $navigateTo(component: any, options?: { props?: Record<string, any> }): void;
    import type { Observable } from 'rxjs';
    /** Angular's async pipe at one binding site. */
    export declare class AsyncPipe { transform<T>(observable: Observable<T> | null | undefined): T | null }
  `,
  rxjs: `
    export declare class Subscription { readonly closed: boolean; unsubscribe(): void }
    export interface OperatorFunction<T, R> { readonly __operator: [T, R] }
    export declare class Observable<T> {
      subscribe(next: (value: T) => void): Subscription;
      pipe<A>(a: OperatorFunction<T, A>): Observable<A>;
      pipe<A, B>(a: OperatorFunction<T, A>, b: OperatorFunction<A, B>): Observable<B>;
      pipe<A, B, C>(a: OperatorFunction<T, A>, b: OperatorFunction<A, B>, c: OperatorFunction<B, C>): Observable<C>;
    }
    export declare class Subject<T> extends Observable<T> { next(value: T): void; asObservable(): Observable<T> }
    export declare class BehaviorSubject<T> extends Subject<T> { constructor(value: T); readonly value: T; getValue(): T }
    export declare class ReplaySubject<T> extends Subject<T> { constructor(bufferSize?: number) }
    export declare function map<T, R>(project: (value: T, index: number) => R): OperatorFunction<T, R>;
    export declare function filter<T, S extends T>(predicate: (value: T, index: number) => value is S): OperatorFunction<T, S>;
    export declare function filter<T>(predicate: (value: T, index: number) => boolean): OperatorFunction<T, T>;
    export declare function take<T>(count: number): OperatorFunction<T, T>;
    export declare function firstValueFrom<T>(source: Observable<T>): Promise<T>;
  `,
  '@angular/common/http': `
    import type { Observable } from 'rxjs';
    export declare class HttpHeaders { constructor(headers?: Record<string, string>) }
    export declare class HttpClient {
      get<T = any>(url: string, options?: { headers?: Record<string, string> | HttpHeaders; responseType?: 'json' }): Observable<T>;
      get(url: string, options: { headers?: Record<string, string> | HttpHeaders; responseType: 'text' }): Observable<string>;
    }
    export declare function withInterceptorsFromDi(): any;
  `,
  '@angular/core': `
    export interface WritableSignal<T> { (): T; set(value: T): void; update(fn: (value: T) => T): void }
    export interface Signal<T> { (): T }
    export interface InputSignal<T> { (): T }
    export interface OutputEmitterRef<T> { emit(value: T): void }
    export declare function signal<T>(value: T): WritableSignal<T>;
    export declare function computed<T>(fn: () => T): Signal<T>;
    export declare const input: { <T>(value: T): InputSignal<T>; required<T>(): InputSignal<T> };
    export declare function output<T = void>(): OutputEmitterRef<T>;
    export declare function inject<T>(token: (abstract new (...args: any[]) => T) | InjectionToken<T>, options?: { optional?: boolean }): T;
    export declare class InjectionToken<T> { constructor(description: string) }
    export declare function Component(meta: any): <C>(c: C) => C;
    export declare function Injectable(meta?: any): <C>(c: C) => C;
    export declare const NO_ERRORS_SCHEMA: any;
    export declare function NgModule(meta: any): <C>(c: C) => C;
    export declare function Input(options?: any): any;
    export declare function Output(options?: any): any;
    export declare class EventEmitter<T = void> { emit(value: T): void }
    export declare enum ChangeDetectionStrategy { OnPush = 0, Eager = 1, Default = 1 }
    export declare function provideZoneChangeDetection(options?: any): any;
    export declare function provideZonelessChangeDetection(): any;
    export interface WritableSignal<T> { asReadonly(): Signal<T> }
    export interface EffectRef { destroy(): void }
    export declare function effect(fn: (onCleanup: (cleanup: () => void) => void) => void, options?: any): EffectRef;
    export declare function untracked<T>(fn: () => T): T;
    export declare class Injector { get<T>(token: abstract new (...args: any[]) => T): T }
    export declare function ViewChild(selector: string, options?: any): any;
    export declare class ElementRef<T = any> { readonly nativeElement: T }
    export declare class DestroyRef { onDestroy(callback: () => void): () => void }
    export declare class NgZone { run<T>(fn: () => T): T; runOutsideAngular<T>(fn: () => T): T }
    export interface OnDestroy { ngOnDestroy(): void }
    export interface OnInit { ngOnInit(): void }
    export interface AfterViewInit { ngAfterViewInit(): void }
  `,
  '@angular/core/rxjs-interop': `
    import type { Observable, OperatorFunction } from 'rxjs';
    import type { Signal, DestroyRef } from '@angular/core';
    export declare function toSignal<T>(source: Observable<T>, options: { initialValue: T; injector?: any; requireSync?: boolean }): Signal<T>;
    export declare function toSignal<T>(source: Observable<T>, options?: { injector?: any; requireSync?: boolean }): Signal<T | undefined>;
    export declare function toObservable<T>(source: Signal<T>, options?: { injector?: any }): Observable<T>;
    export declare function takeUntilDestroyed<T>(destroyRef?: DestroyRef): OperatorFunction<T, T>;
  `,
  '@angular/router': `
    import type { Observable } from 'rxjs';
    export declare class ActivatedRoute { snapshot: { params: Record<string, string> }; params: Observable<Record<string, string>> }
    export declare class NavigationEnd { readonly id: number; readonly url: string; readonly urlAfterRedirects: string }
    export type Event = NavigationEnd;
    export declare class Router { readonly url: string; readonly events: Observable<Event>; navigate(commands: any[], extras?: any): Promise<boolean>; navigateByUrl(url: string, extras?: any): Promise<boolean> }
    export type Routes = { path: string; component?: any; redirectTo?: string; pathMatch?: string; outlet?: string; children?: Routes; loadChildren?: () => Promise<any>; loadComponent?: () => Promise<any> }[];
  `,
  '@nativescript/angular': `
    import type { Observable } from 'rxjs';
    export type NavigationExtras = any;
    export declare class RouterExtensions { readonly router: { readonly url: string }; navigate(commands: any[], extras?: NavigationExtras): Promise<boolean>; back(options?: { relativeTo?: any; outlets?: string[] }): void; canGoBack(): boolean }
    export declare const NativeDialogModule: any;
    export declare const NATIVE_DIALOG_DATA: import('@angular/core').InjectionToken<any>;
    export declare function registerElement(name: string, resolver: () => any, meta?: any): void;
    export declare const ActionBarComponent: any;
    export declare const ActionItemDirective: any;
    export declare const NavigationButtonDirective: any;
    export declare const TabViewDirective: any;
    export declare const TabViewItemDirective: any;
    export declare const NSEmptyOutletComponent: any;
    export declare function provideNativeScriptHttpClient(...features: any[]): any;
    export declare function provideNativeScriptRouter(routes: any): any;
    export declare function bootstrapApplication(component: any, options?: any): Promise<any>;
    export type NativeDialogConfig = any;
    export declare class NativeDialogRef<T = any, R = any> { close(result?: R): void; afterClosed(): Observable<R | undefined> }
    export declare class NativeDialogService { open<T = any, R = any>(component: any, config?: NativeDialogConfig): NativeDialogRef<T, R> }
    export { NativeDialogService as NativeDialog };
    export declare const NativeScriptCommonModule: any;
    export declare const NativeScriptModule: any;
    export declare const NativeScriptRouterModule: { forRoot(routes: any): any };
    export declare function platformNativeScript(): { bootstrapModule(module: any, options?: any): Promise<any> };
    export declare function runNativeScriptAngularApp(options: any): void;
    export declare const PageRouterOutlet: any;
  `,
  'svelte': `
    export declare function tick(): Promise<void>;
  `,
  'svelte/store': `
    import type { Sig } from '@nativescript/release';
    export interface Writable<T> extends Sig<T> { set(value: T): void; update(fn: (value: T) => T): void }
    export declare function writable<T>(value: T): Writable<T>;
    export declare function get<T>(store: Writable<T>): T;
  `,
  '@nativescript-community/svelte-native': `
    export declare function navigate(options: { page: any; props?: Record<string, any> }): void;
    export declare function svelteNativeNoFrame(component: any, props: any): void;
  `,
  'nativescript-vue': `
    import type { VueRef } from '@nativescript/release';
    export type Ref<T> = VueRef<T>;
    export declare function ref<T>(value: T): VueRef<T>;
    export declare function computed<T>(fn: () => T): { readonly value: T };
    export declare function nextTick(): Promise<void>;
    export declare function $navigateTo(component: any, options?: { props?: Record<string, any> }): void;
    export interface ModalOptions { props?: Record<string, any>; fullscreen?: boolean; animated?: boolean; cancelable?: boolean; closeCallback?: (result?: any) => void }
    export declare function $showModal(component: any, options?: ModalOptions): { then(fn: (result?: any) => void): void };
    export declare function $closeModal(result?: any): void;
    export declare function createApp(component: any): { start(): void };
    export interface ListItem<T = any> { item: T; index: number; even: boolean; odd: boolean }
    import type { ItemEventData } from '@nativescript/core';
    export interface ListViewItemTapEvent<T = any> extends ItemEventData { item: T; value: any }
  `,
};

/** Globals NativeScript provides that neither the ES library nor core's declarations type. */
const GLOBALS = `
  declare var console: { log(...data: any[]): void; info(...data: any[]): void; warn(...data: any[]): void; error(...data: any[]): void; debug(...data: any[]): void };
  declare function queueMicrotask(callback: () => void): void;
  declare var global: typeof globalThis;
  declare function requestAnimationFrame(callback: (frameTime: number) => void): number;
  declare function cancelAnimationFrame(id: number): void;
`;

/** The platform's native API typings, as an app's `references.d.ts` includes them. */
const PLATFORM_TYPES: Record<Platform, string> = { ios: '@nativescript/types-ios/index.d.ts', android: '@nativescript/types-android/index.d.ts' };

/** The nearest `node_modules` above `from` that has @nativescript/core. */
export function nodeModules(from: string): string {
  for (let dir = from; ; dir = dirname(dir)) {
    if (existsSync(resolve(dir, 'node_modules/@nativescript/core/package.json'))) return resolve(dir, 'node_modules');
    if (dirname(dir) === dir) throw new Error(`${from}: no node_modules with @nativescript/core above it`);
  }
}

export interface Program {
  program: ts.Program;
  checker: ts.TypeChecker;
  /** The app's files and the components' virtual files, in translation order. */
  files: ts.SourceFile[];
  /** The plugins' source files the program reached, beside the app's. */
  pluginFiles: string[];
  /** The file a module specifier resolved to from a file, as the program resolved it. */
  resolved: (containing: string, specifier: string) => string | undefined;
}

/**
 * Packages whose imports stay on their declarations: core and the plugins in
 * KIT_PLUGINS are NativeScriptKit, the frameworks are the front ends, and the
 * rest are typings or tooling.
 */
const NOT_PLUGINS = /^(@nativescript\/(core|types|types-ios|types-android|types-minimal|webpack|vite|tailwind|angular|android|ios)|octane|@nativescript-community\/(octane|solid-js|svelte-native|vite-octane)|nativescript-vue|react|react-nativescript|solid-js|svelte|@angular\/.*|rxjs|tslib|typescript|vite)$/;
const notPlugin = (pkg: string) => NOT_PLUGINS.test(pkg) || KIT_PLUGINS.includes(pkg);

/**
 * A program over the app's modules and the components' virtual classes,
 * typed by the real ES2022 library, @nativescript/core's own declarations
 * and the platform's native API typings.
 */
export function createProgram(roots: string[], virtual: Map<string, string>, platform: Platform = 'ios', modulesDir?: string, plugins?: PluginSources, declarations: string[] = [], replacements: Record<string, string> = {}, overrides: ts.CompilerOptions = {}): Program {
  const shimPath = (m: string) => `/__shims__/${m.replace(/[@/]/g, '_')}.d.ts`;
  const files = new Map<string, string>(virtual);
  for (const [m, text] of Object.entries(SHIMS)) files.set(shimPath(m), text);
  files.set('/__shims__/globals.d.ts', GLOBALS);
  const modules = modulesDir ?? nodeModules(dirname([...roots, ...virtual.keys()][0]));
  const platformTypes = resolve(modules, PLATFORM_TYPES[platform]);
  if (!existsSync(platformTypes)) throw new Error(`${platformTypes} is missing: install ${PLATFORM_TYPES[platform].split('/index')[0]}`);

  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true, lib: ['lib.es2022.d.ts'], types: [], skipLibCheck: true, experimentalDecorators: true, noEmit: true, allowImportingTsExtensions: true, jsx: ts.JsxEmit.Preserve,
    // A lenient app's caught values are `any`, as its own build types them.
    ...(appStrictness(roots[0] ?? [...virtual.keys()][0]) ? { useUnknownInCatchVariables: false } : {}),
    ...overrides,
  };
  const host = ts.createCompilerHost(options);
  const readLib = host.getSourceFile.bind(host);
  // The app's declarations may reach `@nativescript/types`, which declares both platforms, as the app's own build reads them:
  // the other platform's types name what code for that platform holds (`signal<android.view.View | null>`).
  const pluginFiles = new Set<string>();
  const extraRoots = new Set<string>();
  const isSource = (name: string) => !name.startsWith('/__shims__/') && !name.endsWith('.d.ts') && !name.includes('/node_modules/');
  const isApp = (name: string) => isSource(name) && !pluginFiles.has(name);
  // The app's declarations are read for the native APIs they declare: the frameworks' own typings they reference would replace the shims.
  const appTypings = new Set(declarations);
  const nativeReferences = (text: string, file: string) => text.replace(/^\/\/\/\s*<reference\s+(path|types)="([^"]*)"\s*\/>.*$/gm, (line, kind: string, ref: string) => {
    const target = resolve(dirname(file), ref);
    const pkg = /[\\/]node_modules[\\/]((?:@[^\\/]+[\\/])?[^\\/]+)/.exec(target)?.[1].replace(/\\/g, '/');
    return kind === 'path' && (!pkg || pkg.startsWith('@nativescript/types') || !notPlugin(pkg)) ? line : '';
  });
  host.getSourceFile = (name, version, onError) => {
    const text = files.get(name) ?? (isSource(name) && existsSync(name) ? readFileSync(name, 'utf8') : appTypings.has(name) ? nativeReferences(readFileSync(name, 'utf8'), name) : undefined);
    if (text === undefined) return readLib(name, version, onError);
    return ts.createSourceFile(name, isSource(name) ? foldPlatform(text, name, platform) : text, version, true);
  };
  const fileExists = host.fileExists.bind(host);
  host.fileExists = (name) => files.has(name) || fileExists(name);
  const readFile = host.readFile.bind(host);
  host.readFile = (name) => files.get(name) ?? readFile(name);
  const resolutions = new Map<string, string>();
  host.resolveModuleNameLiterals = (literals, containing) =>
    literals.map((lit) => {
      const r = resolveLiteral(lit, containing);
      if (r.resolvedModule) resolutions.set(`${containing}\0${lit.text}`, r.resolvedModule.resolvedFileName);
      return r;
    });
  const resolveLiteral = (lit: ts.StringLiteralLike, containing: string): ts.ResolvedModuleWithFailedLookupLocations => {
    {
      const m = lit.text;
      if (SHIMS[m]) return { resolvedModule: { resolvedFileName: shimPath(m), extension: ts.Extension.Dts } };
      if (m.startsWith('.')) {
        const base = resolve(dirname(containing), m);
        // A platform's own file first, as NativeScript's bundler resolves `./x` to `x.ios.ts`.
        // A platform file importing its own module's name (`import type { HingeListener } from './hinge-tracker'` in
        // hinge-tracker.ios.ts) means the module's declarations: `x.d.ts`, else the platforms' shared `x.ts`.
        const typeOnly = (ts.isImportDeclaration(lit.parent) && !!lit.parent.importClause?.isTypeOnly) || (ts.isExportDeclaration(lit.parent) && lit.parent.isTypeOnly);
        // A type-only import is TypeScript's, which reads `x.d.ts` beside the platforms' files; only the bundler picks `x.ios.ts`.
        const own = containing === `${base}.${platform}.ts` || (typeOnly && existsSync(base + '.d.ts'));
        for (const candidate of own ? [base + '.d.ts', base + '.ts'] : [`${base}.${platform}.ts`, base + '.ts', base + '.tsx', `${base}/index.${platform}.ts`, base + '/index.ts', base.endsWith('.vue') ? base + '.ts' : '']) {
          if (candidate && (files.has(candidate) || existsSync(candidate))) {
            if (candidate.endsWith('.d.ts')) return { resolvedModule: { resolvedFileName: candidate, extension: ts.Extension.Dts } };
            // A plugin's own modules are compiled with it.
            if (pluginFiles.has(containing)) pluginFiles.add(candidate);
            return { resolvedModule: { resolvedFileName: candidate, extension: candidate.endsWith('.tsx') ? ts.Extension.Tsx : ts.Extension.Ts } };
          }
        }
      }
      // A package the app replaces for the native build is the app's module.
      const replacement = !m.startsWith('.') && !m.startsWith('/') ? replacements[packageOf(m)] : undefined;
      if (replacement) return { resolvedModule: { resolvedFileName: replacement, extension: ts.Extension.Ts } };
      // A plugin is compiled from its source: an import that reaches its code resolves to the file it was built from.
      // A type-only import still resolves to the source where the file also imports values from the package: TypeScript resolves a specifier once per file.
      const valueImport = (st: ts.Statement) => ts.isImportDeclaration(st) && !st.importClause?.isTypeOnly && ts.isStringLiteral(st.moduleSpecifier) && st.moduleSpecifier.text === m;
      const typeOnly = ts.isImportDeclaration(lit.parent) && !!lit.parent.importClause?.isTypeOnly && !(lit.parent.parent && ts.isSourceFile(lit.parent.parent) && lit.parent.parent.statements.some(valueImport));
      if (plugins && isSource(containing) && !m.startsWith('.') && !m.startsWith('/') && !notPlugin(packageOf(m)) && !typeOnly) {
        const js = runtimeFile(m, modules, platform);
        if (js) {
          plugins.get(js.packageDir);
          const source = plugins.sourceOf(js.file);
          if (source) {
            pluginFiles.add(source);
            for (const t of plugins.get(js.packageDir).typings) extraRoots.add(t);
            return { resolvedModule: { resolvedFileName: source, extension: source.endsWith('.tsx') ? ts.Extension.Tsx : ts.Extension.Ts } };
          }
        }
      }
      // The shims import core's types from the app's node_modules; a plugin's source is typed against the app's packages.
      // Shims, plugins' sources and plugin components compiled with the app (outside its folder) import the app's packages.
      const from = containing.startsWith('/__shims__/') || pluginFiles.has(containing) || (!m.startsWith('.') && !containing.startsWith(dirname(modules) + '/')) ? resolve(modules, '..', 'index.ts') : containing;
      if (pluginFiles.has(containing) && m.startsWith('.')) return ts.resolveModuleName(m, containing, options, host);
      return ts.resolveModuleName(m, from, options, host);
    }
  };

  // An Android build types iOS API too, as an app's references to `@nativescript/types` do: code reaching it is code NativeScript runs only on iOS.
  const iosTypes = platform === 'android' ? resolve(modules, PLATFORM_TYPES.ios) : null;
  const rootNames = [...roots, ...virtual.keys(), '/__shims__/globals.d.ts', platformTypes, ...(iosTypes && existsSync(iosTypes) ? [iosTypes] : []), resolve(modules, '@nativescript/core/global-types.d.ts'), ...declarations];
  // A copy: a program keeps the array it is given, and a later program with equal root names reuses its files.
  let program = ts.createProgram([...rootNames], options, host);
  // A plugin's native API declarations (`typings/ios.d.ts`) are found as its sources are.
  if (extraRoots.size) {
    rootNames.push(...extraRoots);
    program = ts.createProgram(rootNames, options, host, program);
  }
  // `view.ios` is `any` in core's declarations: typed as the view's native class, everything read from it is typed too.
  const casts = nativeViewCasts(program, isSource, platform);
  if (casts.size) {
    for (const [name, text] of casts) files.set(name, text);
    program = ts.createProgram(rootNames, options, host, program);
  }
  // The build types the app strictly; an app whose own configuration is not strict is held only to what that configuration checks.
  const lenient = appStrictness(roots[0] ?? [...virtual.keys()][0]);
  const strictOnly = new Set([2322, 2345, 2531, 2532, 2533, 2454, 2564, 2722, 7005, 7006, 7008, 7015, 7031, 7034, 7053, 18047, 18048, 18049,
    // What JavaScript defines that a lenient app's own build does not check: a key a spread overwrites, a `??` that never applies.
    2783, 2869]);
  // Strict narrowing leaves a lenient program's value `never` where its own build reads it as declared.
  const neverRead = (d: ts.Diagnostic) => d.code === 2339 && /on type 'never'/.test(ts.flattenDiagnosticMessageText(d.messageText, '\n'));
  const diagnostics = ts.getPreEmitDiagnostics(program).filter((d) => d.category === ts.DiagnosticCategory.Error && (!d.file || isApp(d.file.fileName)) && !(lenient && (strictOnly.has(d.code) || neverRead(d))));
  if (diagnostics.length) {
    const text = ts.formatDiagnostics(diagnostics.slice(0, Number(process.env.NS_NATIVE_DIAGNOSTICS ?? 12)), { getCanonicalFileName: (f) => f, getCurrentDirectory: () => '/', getNewLine: () => '\n' });
    throw new Error(`the app does not type-check as the release build sees it:\n${text}`);
  }
  const ordered = [...roots, ...virtual.keys(), ...pluginFiles].map((f) => program.getSourceFile(f)!).filter(Boolean);
  return { program, checker: program.getTypeChecker(), files: ordered, pluginFiles: [...pluginFiles], resolved: (containing, specifier) => resolutions.get(`${containing}\0${specifier}`) };
}

/** Each app file's text with `x.ios` (x a core view) written `(x.ios as UILabel)`, or `x.android` as its Android class. */
function nativeViewCasts(program: ts.Program, isApp: (name: string) => boolean, platform: Platform): Map<string, string> {
  const members = platform === 'android' ? ['android', 'nativeView', 'nativeViewProtected'] : ['ios', 'nativeView', 'nativeViewProtected'];
  const table = platform === 'android' ? NATIVE_VIEWS_ANDROID : undefined;
  const checker = program.getTypeChecker();
  const out = new Map<string, string>();
  for (const sf of program.getSourceFiles()) {
    if (!isApp(sf.fileName)) continue;
    const edits: { at: number; text: string }[] = [];
    const visit = (n: ts.Node) => {
      if (ts.isPropertyAccessExpression(n) && members.includes(n.name.text) && !ts.isAsExpression(n.parent)
        // An optional chain stays as written: a cast around it would stop TypeScript narrowing its root.
        && !n.questionDotToken
        && checker.getTypeAtLocation(n).flags & ts.TypeFlags.Any) {
        const native = nativeViewOf(checker, checker.getTypeAtLocation(n.expression), table);
        if (native) edits.push({ at: n.getStart(), text: '(' }, { at: n.getEnd(), text: ` as ${native})` });
      }
      ts.forEachChild(n, visit);
    };
    visit(sf);
    if (!edits.length) continue;
    let text = sf.text;
    for (const e of edits.sort((a, b) => b.at - a.at)) text = text.slice(0, e.at) + e.text + text.slice(e.at);
    out.set(sf.fileName, text);
  }
  return out;
}

/** The declaration files the app's tsconfig.json includes (its `references.d.ts`, its own typings), outside node_modules. */
export function appDeclarations(app: string): string[] {
  const file = resolve(app, 'tsconfig.json');
  if (!existsSync(file)) return [];
  const parsed = ts.parseJsonConfigFileContent(ts.readConfigFile(file, ts.sys.readFile).config ?? {}, ts.sys, app);
  return parsed.fileNames.filter((f) => f.endsWith('.d.ts') && !f.includes('/node_modules/'));
}

/** Whether the app's tsconfig.json leaves strict checking off. */
function appStrictness(from: string | undefined): boolean {
  if (!from) return false;
  for (let dir = dirname(from); dirname(dir) !== dir; dir = dirname(dir)) {
    const file = resolve(dir, 'tsconfig.json');
    if (!existsSync(file)) continue;
    const config = ts.readConfigFile(file, ts.sys.readFile).config ?? {};
    const o = config.compilerOptions ?? {};
    return !(o.strict || o.strictNullChecks);
  }
  return false;
}
