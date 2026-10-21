# How the compiled build gets each package

A compiled build has no JavaScript runtime: it compiles the app and every npm package the app reaches from
TypeScript. Each package is one of these, and `release` in `nativescript.config.ts` holds the options for the ones
that need help.

| The package ships | The build | Option |
| --- | --- | --- |
| Its TypeScript (rxjs's `src/`) | compiles it as installed | — |
| JavaScript built from TypeScript in its repository | fetches the source at the published revision (its `gitHead`, a release tag, or the commit that set the version, in the repository `package.json` names or its scope's monorepos), checks that it compiles to the installed files, and compiles it | `pluginSources` |
| JavaScript only, or code that only means something in a JavaScript VM (`moment`, `stacktrace-js`) | stops, naming the package | `pluginReplacements` |
| A closed binary with no TypeScript anywhere (`nativescript-ui-*`) | stops, naming the package and both remedies | `pluginReplacements` or `stubPlugins` |

## `pluginSources`

`{ 'package': 'path' }`: a checkout of the package's TypeScript, used as it is instead of fetching the published
revision. Use it for a fork or a local tarball whose source is not public. It is not checked against the installed
files.

## Patches

The installed files are what `patch-package` patches; the compiled build never sees them. A source patch goes in
`native-release/patches/<package>+<version>.patch` (scoped names with `+` for `/`), with paths relative to the
package's directory or to its repository's root. When the installed files do not match their source and
`patches/<package>+<version>.patch` exists, the error says so.

## `pluginReplacements`

`{ 'package': './src/stand-in.ts' }`: every import of the package resolves to a TypeScript module of the app. The
module exports what the app uses of the package, typed. The package's native code is not linked.

## `stubPlugins`

`['nativescript-ui-listview', ...]`: a binary-only plugin builds as a no-op stand-in. Its views are empty
`ContentView`s that keep their place in the layout (row, column, size, margins, classes); their content, items and
events are dropped, and every method does nothing. The build prints a warning naming each stubbed package. Stand-ins
exist for `nativescript-ui-listview`, `-gauge`, `-sidedrawer`, `-calendar`, `-dataform`, `-autocomplete` and `-chart`;
naming another package is an error.
