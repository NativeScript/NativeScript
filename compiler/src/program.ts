import ts from 'typescript';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

/**
 * The release build's view of the framework APIs an app imports. Only their
 * types matter here: the translator recognizes the calls (`ref`, `signal`,
 * `createSignal`, `$state`, `$navigateTo`) and emits Swift for them.
 */
const SHIMS: Record<string, string> = {
  '@nativescript/release': `
    export interface Sig<T> { value: T }
    export declare function $signal<T>(value: T): Sig<T>;
    export interface EventData { eventName: string; object: any; value: any; index: number; item: any; view: any }
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
    import type { Sig } from '@nativescript/release';
    export type Ref<T> = Sig<T>;
    export declare function ref<T>(value: T): Sig<T>;
    export declare function computed<T>(fn: () => T): { readonly value: T };
    export declare function $navigateTo(component: any, options?: { props?: Record<string, any> }): void;
    export declare function createApp(component: any): { start(): void };
    export interface ListItem<T = any> { item: T; index: number; even: boolean; odd: boolean }
    import type { EventData } from '@nativescript/release';
    export interface ListViewItemTapEvent<T = any> extends EventData { item: T }
  `,
};

const LIB = `
  interface Array<T> { length: number; [n: number]: T;
    filter(f: (v: T, i: number) => unknown): T[]; map<U>(f: (v: T, i: number) => U): U[];
    find(f: (v: T, i: number) => unknown): T | undefined; findIndex(f: (v: T, i: number) => unknown): number;
    some(f: (v: T, i: number) => unknown): boolean; every(f: (v: T, i: number) => unknown): boolean;
    includes(v: T): boolean; indexOf(v: T): number; join(sep?: string): string; slice(a?: number, b?: number): T[];
    concat(...items: (T | T[])[]): T[]; push(...items: T[]): number; pop(): T | undefined; reverse(): T[];
    reduce<U>(f: (acc: U, v: T, i: number) => U, init: U): U; forEach(f: (v: T, i: number) => void): void;
    sort(f?: (a: T, b: T) => number): T[]; }
  interface String { length: number; toLowerCase(): string; toUpperCase(): string; includes(s: string): boolean;
    startsWith(s: string): boolean; endsWith(s: string): boolean; trim(): string; split(sep: string): string[];
    indexOf(s: string): number; slice(a?: number, b?: number): string; substring(a: number, b?: number): string;
    replace(a: string, b: string): string; charAt(i: number): string; padStart(n: number, s?: string): string; repeat(n: number): string; }
  interface Number { toFixed(digits?: number): string; } interface Boolean {} interface Function {} interface Object {}
  interface RegExp {} interface IArguments {} interface CallableFunction {} interface NewableFunction {}
  interface ReadonlyArray<T> { length: number; [n: number]: T }
  interface TemplateStringsArray extends ReadonlyArray<string> {}
  interface Math { round(x: number): number; floor(x: number): number; ceil(x: number): number; abs(x: number): number;
    min(...v: number[]): number; max(...v: number[]): number; sqrt(x: number): number; pow(a: number, b: number): number; random(): number; PI: number; }
  declare var Math: Math;
  declare function String(v: any): string; declare function Number(v: any): number; declare function parseInt(s: string): number;
  declare var console: { log(...v: any[]): void };
  type Record<K extends keyof any, T> = { [P in K]: T };
  type Partial<T> = { [P in keyof T]?: T[P] };
`;

export interface Program {
  program: ts.Program;
  checker: ts.TypeChecker;
  /** The app's files and the components' virtual files, in translation order. */
  files: ts.SourceFile[];
}

/** A program over the app's modules and the components' virtual classes. */
export function createProgram(roots: string[], virtual: Map<string, string>): Program {
  const shimPath = (m: string) => `/__shims__/${m.replace(/[@/]/g, '_')}.d.ts`;
  const files = new Map<string, string>(virtual);
  for (const [m, text] of Object.entries(SHIMS)) files.set(shimPath(m), text);
  files.set('/__shims__/lib.d.ts', LIB);

  const options: ts.CompilerOptions = { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, strict: true, noLib: true, types: [], skipLibCheck: true, experimentalDecorators: true };
  const host = ts.createCompilerHost(options);
  host.getSourceFile = (name, version) => {
    const text = files.get(name) ?? (existsSync(name) ? readFileSync(name, 'utf8') : undefined);
    return text === undefined ? undefined : ts.createSourceFile(name, text, version, true);
  };
  host.fileExists = (name) => files.has(name) || existsSync(name);
  host.readFile = (name) => files.get(name) ?? (existsSync(name) ? readFileSync(name, 'utf8') : undefined);
  host.resolveModuleNameLiterals = (literals, containing) =>
    literals.map((lit) => {
      const m = lit.text;
      if (SHIMS[m]) return { resolvedModule: { resolvedFileName: shimPath(m), extension: ts.Extension.Dts } };
      const base = resolve(dirname(containing), m);
      for (const candidate of [base + '.ts', base + '.ts' + '', base + '/index.ts', base.endsWith('.vue') ? base + '.ts' : '']) {
        if (candidate && (files.has(candidate) || existsSync(candidate))) return { resolvedModule: { resolvedFileName: candidate, extension: ts.Extension.Ts } };
      }
      return { resolvedModule: undefined };
    });

  const program = ts.createProgram([...roots, ...virtual.keys(), '/__shims__/lib.d.ts'], options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program).filter((d) => d.category === ts.DiagnosticCategory.Error);
  if (diagnostics.length) {
    const text = ts.formatDiagnostics(diagnostics.slice(0, 12), { getCanonicalFileName: (f) => f, getCurrentDirectory: () => '/', getNewLine: () => '\n' });
    throw new Error(`the app does not type-check as the release build sees it:\n${text}`);
  }
  const ordered = [...roots, ...virtual.keys()].map((f) => program.getSourceFile(f)!).filter(Boolean);
  return { program, checker: program.getTypeChecker(), files: ordered };
}
