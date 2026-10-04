import ts from 'typescript';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { foldPlatform, type Platform } from './platform.ts';

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
    export interface EventData { eventName: string; object: any; value: any }
    export declare function $navigate(page: () => any): void;
    export interface WritableSignal<T> { (): T; set(value: T): void; update(fn: (value: T) => T): void; $write(value: T | ((previous: T) => T)): void }
    export declare function $writable<T>(value: T): WritableSignal<T>;
    export declare function $navigateTo(component: any, options?: { props?: Record<string, any> }): void;
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
    export declare function inject<T>(token: abstract new (...args: any[]) => T): T;
    export declare function Component(meta: any): <C>(c: C) => C;
    export declare function Injectable(meta?: any): <C>(c: C) => C;
    export declare const NO_ERRORS_SCHEMA: any;
  `,
  '@angular/router': `
    export declare class ActivatedRoute { snapshot: { params: Record<string, string> } }
    export type Routes = { path: string; component?: any; redirectTo?: string; pathMatch?: string }[];
  `,
  '@nativescript/angular': `
    export declare class RouterExtensions { navigate(commands: any[], extras?: any): void; back(): void }
    export declare const NativeScriptCommonModule: any;
    export declare const PageRouterOutlet: any;
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
    export declare function $navigateTo(component: any, options?: { props?: Record<string, any> }): void;
    export declare function createApp(component: any): { start(): void };
  `,
};

/** Globals NativeScript provides that neither the ES library nor core's declarations type. */
const GLOBALS = `
  declare var console: { log(...data: any[]): void; info(...data: any[]): void; warn(...data: any[]): void; error(...data: any[]): void; debug(...data: any[]): void };
  declare function queueMicrotask(callback: () => void): void;
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
}

/**
 * A program over the app's modules and the components' virtual classes,
 * typed by the real ES2022 library, @nativescript/core's own declarations
 * and the platform's native API typings.
 */
export function createProgram(roots: string[], virtual: Map<string, string>, platform: Platform = 'ios'): Program {
  const shimPath = (m: string) => `/__shims__/${m.replace(/[@/]/g, '_')}.d.ts`;
  const files = new Map<string, string>(virtual);
  for (const [m, text] of Object.entries(SHIMS)) files.set(shimPath(m), text);
  files.set('/__shims__/globals.d.ts', GLOBALS);
  const modules = nodeModules(dirname([...roots, ...virtual.keys()][0]));
  const platformTypes = resolve(modules, PLATFORM_TYPES[platform]);
  if (!existsSync(platformTypes)) throw new Error(`${platformTypes} is missing: install ${PLATFORM_TYPES[platform].split('/index')[0]}`);

  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true, lib: ['lib.es2022.d.ts'], types: [], skipLibCheck: true, experimentalDecorators: true, noEmit: true,
  };
  const host = ts.createCompilerHost(options);
  const readLib = host.getSourceFile.bind(host);
  const isApp = (name: string) => !name.startsWith('/__shims__/') && !name.endsWith('.d.ts') && !name.includes('/node_modules/');
  host.getSourceFile = (name, version, onError) => {
    const text = files.get(name) ?? (isApp(name) && existsSync(name) ? readFileSync(name, 'utf8') : undefined);
    if (text === undefined) return readLib(name, version, onError);
    return ts.createSourceFile(name, isApp(name) ? foldPlatform(text, name, platform) : text, version, true);
  };
  const fileExists = host.fileExists.bind(host);
  host.fileExists = (name) => files.has(name) || fileExists(name);
  const readFile = host.readFile.bind(host);
  host.readFile = (name) => files.get(name) ?? readFile(name);
  host.resolveModuleNameLiterals = (literals, containing) =>
    literals.map((lit) => {
      const m = lit.text;
      if (SHIMS[m]) return { resolvedModule: { resolvedFileName: shimPath(m), extension: ts.Extension.Dts } };
      if (m.startsWith('.')) {
        const base = resolve(dirname(containing), m);
        for (const candidate of [base + '.ts', base + '/index.ts', base.endsWith('.vue') ? base + '.ts' : '']) {
          if (candidate && (files.has(candidate) || existsSync(candidate))) return { resolvedModule: { resolvedFileName: candidate, extension: ts.Extension.Ts } };
        }
      }
      return ts.resolveModuleName(m, containing, options, host);
    });

  const program = ts.createProgram([...roots, ...virtual.keys(), '/__shims__/globals.d.ts', platformTypes, resolve(modules, '@nativescript/core/global-types.d.ts')], options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program).filter((d) => d.category === ts.DiagnosticCategory.Error && (!d.file || isApp(d.file.fileName)));
  if (diagnostics.length) {
    const text = ts.formatDiagnostics(diagnostics.slice(0, 12), { getCanonicalFileName: (f) => f, getCurrentDirectory: () => '/', getNewLine: () => '\n' });
    throw new Error(`the app does not type-check as the release build sees it:\n${text}`);
  }
  const ordered = [...roots, ...virtual.keys()].map((f) => program.getSourceFile(f)!).filter(Boolean);
  return { program, checker: program.getTypeChecker(), files: ordered };
}
