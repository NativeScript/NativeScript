# Package Type Requirements & Resolution Guide (`@nativescript/compiler`)

`@nativescript/compiler` compiles a NativeScript application and the npm packages it reaches into native Swift (iOS) and Kotlin (Android) with no JavaScript runtime.

Because static native code generation requires static types for classes, function signatures, parameters, and return values, **`@nativescript/compiler` enforces a strict "Types Required" rule for all compiled npm packages**:

> **Types Required Rule:** Every npm package reached by a compiled build must provide either:
> 1. **TypeScript source** (`.ts` / `.tsx`) — shipped in the npm tarball, fetched from the package's git repository at its published revision, or pointed to via `release.pluginSources`, **or**
> 2. **TypeScript declarations** (`.d.ts`) — shipped with the package (`"types"` / `"typings"` or `index.d.ts`), installed via `@types/<pkg>`, or supplied in `nativescript.config.ts` via `release.pluginTypes`.
>
> Packages that depend on a JavaScript VM at runtime (such as `stacktrace-js`) or ship only dynamic ES5/UMD prototype-mutation bundles (such as `moment`) must be replaced with a typed TypeScript module via `release.pluginReplacements`.

The compiler **never** embeds package-specific stand-ins inside `@nativescript/compiler` itself. Every package is handled deterministically through one of the four categories below.

---

## Overview of the Four Package Categories

| Category | Package Characteristics | Example Packages | Action Required in App |
| :--- | :--- | :--- | :--- |
| **1. TypeScript-Authored** | Written in `.ts`/`.tsx` (shipped in npm or in git repo at published tag/commit) | `@nativescript/*`, `rxjs`, `@ngrx/*`, `downsample` | **None** (compiled automatically from `.ts` source) |
| **2. Typed JavaScript** | Written in modular `.js` and ships `.d.ts` (or has `@types/<pkg>`) | `number-format.js` | **None** (compiler pairs `.d.ts` + `.js` automatically) |
| **3. Untyped JavaScript** | Written in modular `.js` with **no** `.d.ts` declarations | Legacy JS utilities | Upgrade package, install `@types/<pkg>`, or configure **`release.pluginTypes`** |
| **4. JS-VM-Specific or Dynamic ES5/UMD** | Parses JS VM state (`Error.stack`), `eval`, or mutates `.prototype` dynamically | `stacktrace-js`, `moment`, `moment-timezone` | Configure **`release.pluginReplacements`** |

---

## Category 1: TypeScript-Authored Packages (Zero Config)

Most NativeScript plugins and modern npm libraries are written in TypeScript. For each package the build reaches:

1. If the npm package ships its `.ts` source alongside its `.js` and `.js.map` files (such as `rxjs`), the compiler uses the shipped `.ts` directly.
2. Otherwise, `PluginSources` resolves the package's `repository` in `package.json`, fetches the exact commit or tag matching the installed version into `~/.cache/ns-native/plugins/<pkg>@<version>/repo`, verifies that the TypeScript source matches the published JavaScript in `node_modules`, and compiles the `.ts` files directly.

### Real-World Example: `downsample` (HeyKiddo)
- **What it is:** Time-series downsampling library (`LTTB`, `LTD`, `ASAP`) written in TypeScript (`src/methods/LTTB.ts`, `src/utils.ts`).
- **How the compiler handles it:**
  - Fetches `https://github.com/janjakubnanista/downsample.git` at tag `v1.4.0`.
  - Verifies the published Rollup CJS bundle (`methods/LTTB.js`) against `src/methods/LTTB.ts`.
  - Lowers `ts-type-checked`'s `isA<T>(x)` compile-time type-guard macro into standard TypeScript type-predicate functions (`function __isA_0(v: unknown): v is NormalizedDataPoint { ... }`).
  - Lowers species array construction (`new (data.constructor as any)(length)`) into typed array allocation.
- **Config needed in `nativescript.config.ts`:** None.

---

## Category 2: JavaScript-Authored Packages With Types (Zero Config)

Some small, pure utility packages are authored in plain JavaScript (`.js`) in their upstream repository, but ship hand-written TypeScript declarations (`index.d.ts`) or have `@types/<pkg>` installed in `node_modules/@types/`.

When `PluginSources` inspects a package whose repository contains `.js` source instead of `.ts` source:
1. It looks for `.d.ts` declarations in the following order:
   - `release.pluginTypes['<pkg>']` in `nativescript.config.ts`
   - The `types` or `typings` field in the package's `package.json`
   - `index.d.ts` in the installed package or repository root
   - `node_modules/@types/<pkg>/index.d.ts`
2. When a `.d.ts` file is found and the `.js` source is a clean module (not a UMD wrapper or ES5 `.prototype` mutation bundle), the compiler pairs the `.d.ts` export signature with the `.js` source to synthesize a typed `.ts` module in `<cache>/typed/` and compiles it to Swift/Kotlin.

### Real-World Example: `number-format.js` (HeyKiddo)
- **What it is:** Mask-based number formatter (`format('#,##0.00', 1234.5)`), authored in `src/format.js` (143 lines) with a shipped `index.d.ts` (`declare var format: (mask?: string, value?: number, options?: Object) => string; export default format;`).
- **How the compiler handles it:**
  - Fetches `number-format.js@2.0.9` from git.
  - Pairs `index.d.ts` with `src/format.js` to synthesize `typed/format.ts` (`export default function format(mask?: any, value?: any, options: any = {}): string`).
  - Compiles `typed/format.ts` directly to native Swift/Kotlin.
- **Config needed in `nativescript.config.ts`:** None.

---

## Category 3: JavaScript-Authored Packages Missing Types (`release.pluginTypes`)

If your project imports a JavaScript-authored package that has **no** `.d.ts` declarations anywhere, `@nativescript/compiler` stops immediately with a clear error:

```text
Error: <pkg>: index.js is authored in JavaScript and has no TypeScript declarations (.d.ts);
install @types/<pkg>, upgrade <pkg> to a version that ships types,
point release.pluginTypes['<pkg>'] at a .d.ts file,
or replace it in release.pluginReplacements['<pkg>']
```

### How to Resolve Missing Types (In Order of Preference)

#### Option A: Upgrade the package or install `@types/<pkg>`
Check whether a newer version of the package ships `.d.ts` files, or whether DefinitelyTyped provides types:
```bash
npm install --save-dev @types/<pkg>
```
If `@types/<pkg>` exists in `node_modules/@types/<pkg>/index.d.ts`, the compiler discovers it automatically with zero configuration in `nativescript.config.ts`.

#### Option B: Supply `.d.ts` declarations via `release.pluginTypes`
If neither the package nor `@types` provides declarations, you can generate or write a `.d.ts` file in your project and register it under `release.pluginTypes` in `nativescript.config.ts`:

1. **Generate a starter `.d.ts` from the package's `.js` using TypeScript:**
   ```bash
   npx tsc node_modules/<pkg>/index.js \
     --declaration --allowJs --emitDeclarationOnly \
     --outDir ./native-release/types/<pkg>
   ```
2. **Tighten the exported function/class types in `./native-release/types/<pkg>/index.d.ts`:**
   ```ts
   declare function myFormat(pattern?: string, value?: number): string;
   export default myFormat;
   ```
3. **Register the `.d.ts` path in `nativescript.config.ts`:**
   ```ts
   import { NativeScriptConfig } from '@nativescript/core';

   export default {
     id: 'org.nativescript.app',
     appPath: 'src',
     release: {
       pluginTypes: {
         '<pkg>': './native-release/types/<pkg>/index.d.ts',
       },
     },
   } as NativeScriptConfig;
   ```

---

## Category 4: Handling `stacktrace-js` and Dynamic ES5/UMD Packages (`release.pluginReplacements`)

Some packages cannot (or should not) be lowered from their JavaScript files even when `.d.ts` files exist:

1. **JavaScript-VM-specific packages (`stacktrace-js`):**
   Many NativeScript projects install `stacktrace-js` for error logging or crash reporting (e.g., `StackTrace.fromError(error)`).
   - **Why `stacktrace-js` cannot compile from `.js`:**
     - `stacktrace-js` parses V8 / JavaScriptCore `Error.stack` text strings and fetches `.js.map` source maps over HTTP to symbolicate minified JavaScript bundles.
     - In a `--compiler` native build, there is no JavaScript VM, no minified JS bundle, and native stack traces are symbolicated via Xcode / dSYM / Crashlytics / Android ProGuard mapping.
     - In addition, `stacktrace-js` publishes a browserify/UMD bundle (`dist/stacktrace.js`) that uses dynamic ES5 prototype mutations and `arguments`.
2. **Legacy ES5 / UMD prototype-mutation libraries (`moment`, `moment-timezone`):**
   - `moment` is a 4,500-line ES5 UMD bundle that mutates `Moment.prototype` dynamically and relies on `arguments` inspection across dozens of overloaded signatures.
   - When the compiler detects a UMD wrapper (`typeof define === 'function'`), dynamic `.prototype` assignments, or `arguments` usage in a JS-only package, it rejects automatic JS synthesis:
     ```text
     Error: <pkg>: <file>.js is a dynamic ES5/UMD JavaScript bundle that cannot be statically lowered;
     provide a typed replacement in nativescript.config.ts via release.pluginReplacements['<pkg>']
     ```

### How to Handle `stacktrace-js` in Any NativeScript Project

To handle `stacktrace-js` in a compiled NativeScript build:

#### Step 1: Create `native-release/stacktrace-stand-in.ts`
Create a small, typed TypeScript module in your project that satisfies the `stacktrace-js` API (`StackTrace.fromError`, `StackTrace.get`, `StackFrame`) using the `Error` object's properties:

```ts
// native-release/stacktrace-stand-in.ts
export class StackFrame {
  functionName?: string;
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
  source?: string;

  constructor(opts?: {
    functionName?: string;
    fileName?: string;
    lineNumber?: number;
    columnNumber?: number;
    source?: string;
  }) {
    if (opts) {
      this.functionName = opts.functionName;
      this.fileName = opts.fileName;
      this.lineNumber = opts.lineNumber;
      this.columnNumber = opts.columnNumber;
      this.source = opts.source;
    }
  }

  toString(): string {
    const fn = this.functionName || '{anonymous}';
    const loc = this.fileName ? ` (${this.fileName}:${this.lineNumber ?? 0}:${this.columnNumber ?? 0})` : '';
    return `${fn}${loc}`;
  }
}

export async function fromError(error: any, _opts?: any): Promise<StackFrame[]> {
  const raw = error && typeof error.stack === 'string' ? error.stack : '';
  if (!raw) {
    const msg = error && typeof error.message === 'string' ? error.message : String(error ?? '');
    return [new StackFrame({ functionName: msg, source: msg })];
  }
  return raw
    .split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0)
    .map((line: string) => new StackFrame({ functionName: line, source: line }));
}

export async function get(_opts?: any): Promise<StackFrame[]> {
  return [];
}

export function getSync(_opts?: any): StackFrame[] {
  return [];
}

const StackTrace = {
  fromError,
  get,
  getSync,
  StackFrame,
};

export default StackTrace;
```

#### Step 2: Register the replacement in `nativescript.config.ts`
Point `release.pluginReplacements['stacktrace-js']` to `./native-release/stacktrace-stand-in.ts`:

```ts
import { NativeScriptConfig } from '@nativescript/core';

export default {
  id: 'org.nativescript.app',
  appPath: 'src',
  release: {
    pluginReplacements: {
      'stacktrace-js': './native-release/stacktrace-stand-in.ts',
    },
  },
} as NativeScriptConfig;
```

---

## Case Study: HeyKiddo (`heykiddo-compiled-work`)

HeyKiddo is a production Angular + NativeScript application with 30+ npm dependencies. Here is how every non-standard package in HeyKiddo is resolved under the compiler's rules:

| Package | Category | How It Is Handled in HeyKiddo |
| :--- | :--- | :--- |
| **`downsample`** | 1. TypeScript-authored (`repo/src/*.ts`) | **Automatic.** Fetched from git at `v1.4.0`; `isA<T>()` macro and species constructor lowered by the compiler. |
| **`number-format.js`** | 2. JS-authored with shipped `index.d.ts` | **Automatic.** Fetched from git at `2.0.9`; compiler pairs `index.d.ts` + `src/format.js` into `typed/format.ts` and compiles to Swift. |
| **`stacktrace-js`** | 4. JS-VM-specific UMD bundle | **`release.pluginReplacements`** → `./native-release/stacktrace-stand-in.ts` |
| **`moment` / `moment-timezone`** | 4. Dynamic ES5 prototype bundle | **`release.pluginReplacements`** → `./native-release/moment-stand-in.ts` |
| **`@norrix/client-sdk`** | 4. Private/local SDK with no public git repo | **`release.pluginReplacements`** → `./native-release/norrix-stand-in.ts` |
| **Forked NativeScript plugins** (`@nstudio/nativescript-ui-pager`, `@nativescript/rive`, `@valor/nativescript-in-app-review`, `@mleleux/nativescript-revenuecat`) | 1. TypeScript-authored local forks | **`release.pluginSources`** → local git checkouts under `./native-release/plugin-sources/` |

### HeyKiddo's `nativescript.config.ts` `release` Section

```ts
  release: {
    // Local checkouts for forked plugins whose revisions are not published to public upstream tags
    pluginSources: {
      '@nstudio/nativescript-ui-pager': './native-release/plugin-sources/nativescript-ui-pager',
      '@nativescript/rive': './native-release/plugin-sources/NativeScript-ui-kit/packages/rive',
      '@valor/nativescript-in-app-review': './native-release/plugin-sources/valor-software-nativescript-plugins/packages/nativescript-in-app-review',
      '@mleleux/nativescript-revenuecat': './native-release/plugin-sources/mleleux-heykiddo-nativescript-plugins/packages/nativescript-revenuecat',
    },
    // Typed TypeScript replacements for JS-VM-specific or dynamic ES5/UMD packages
    pluginReplacements: {
      '@norrix/client-sdk': './native-release/norrix-stand-in.ts',
      'stacktrace-js': './native-release/stacktrace-stand-in.ts',
      'moment': './native-release/moment-stand-in.ts',
      'moment-timezone': './native-release/moment-stand-in.ts',
    },
  },
```

---

## Summary of `nativescript.config.ts` `release` Package Options

- **`release.pluginSources`**: `Record<string, string>`
  Maps an npm package name to a local directory containing its TypeScript source checkout. Use this when a plugin is installed from a private repo, a local tarball, or an unpublished commit.
- **`release.pluginTypes`**: `Record<string, string>`
  Maps a JavaScript-authored npm package name to a `.d.ts` declaration file path. Use this when a clean modular `.js` package does not ship its own `.d.ts` and has no `@types/<pkg>` package.
- **`release.pluginReplacements`**: `Record<string, string>`
  Maps an npm package name to a `.ts` module in your app that replaces the package at compile time. Use this for packages whose runtime behavior is specific to a JavaScript VM (`stacktrace-js`) or packages distributed only as dynamic ES5/UMD prototype bundles (`moment`).
