## 5.0.31 (2026-01-06)

- LICENSE and README.md are now included in the package assets.

## 5.0.30 (2026-01-06)

### 🩹 Fixes

- **webpack:** ts-patch transform ([#11041](https://github.com/NativeScript/NativeScript/pull/11041))

### ❤️ Thank You

- Eduardo Speroni @edusperoni

## 5.0.29 (2025-12-19)

### 🩹 Fixes

- **webpack:** sourceMap path when using CommonJS ([#11013](https://github.com/NativeScript/NativeScript/pull/11013))

### ❤️ Thank You

- Jason Cassidy @jcassidyav

## 5.0.28 (2025-12-05)

### 🩹 Fixes

- **webpack:** hmr handling ([#11002](https://github.com/NativeScript/NativeScript/pull/11002))

### ❤️ Thank You

- Nathan Walker

## 5.0.27 (2025-11-28)

### 🩹 Fixes

- **webpack:** fallback to commonjs when no runtimes detected ([d22797e1e](https://github.com/NativeScript/NativeScript/commit/d22797e1e))
- **webpack:** backwards compat with older core versions ([c907e31ae](https://github.com/NativeScript/NativeScript/commit/c907e31ae))

### ❤️ Thank You

- Nathan Walker

## 5.0.25 (2025-11-17)

### 🚀 Features

- NativeClass transformer now supports ts-patch and ts-loader ([#10952](https://github.com/NativeScript/NativeScript/pull/10952))
- **webpack:** support es module bundling ([#10788](https://github.com/NativeScript/NativeScript/pull/10788))

### 🩹 Fixes

- **webpack:** es module source mapping improvements ([bbeca526f](https://github.com/NativeScript/NativeScript/commit/bbeca526f))
- **webpack:** es module source map resolution ([#10860](https://github.com/NativeScript/NativeScript/pull/10860))

### ❤️ Thank You

- farfromrefuge
- Nathan Walker

## 5.0.24 (2025-03-23)

### 🚀 Features

- **webpack:** support @nativescript-community/svelte-native ([41ac6d970](https://github.com/NativeScript/NativeScript/commit/41ac6d970))

## 5.0.23 (2025-02-26)

### 🚀 Features

- Node-API engine support ([#10710](https://github.com/NativeScript/NativeScript/pull/10710))
- apple view filtering ([#10681](https://github.com/NativeScript/NativeScript/pull/10681))
- allow the passing of a bundle suffix ([#10614](https://github.com/NativeScript/NativeScript/pull/10614))
- **core:** ability to embed into platform host projects ([#10465](https://github.com/NativeScript/NativeScript/pull/10465))
- **webpack:** allow custom 'projectName' on Xcode project name from config ([#10550](https://github.com/NativeScript/NativeScript/pull/10550))
- **wepback:** custom `buildPath`support ([#10477](https://github.com/NativeScript/NativeScript/pull/10477))
- **webpack:** place hidden sourceMaps in platforms folder ([#10352](https://github.com/NativeScript/NativeScript/pull/10352))
- **webpack:** angular 16.1 support ([#10317](https://github.com/NativeScript/NativeScript/pull/10317))
- **webpack:** support tsconfig.app.json when present ([#10221](https://github.com/NativeScript/NativeScript/pull/10221))
- TypeScript 4.8+ support and NativeClass decorator improvements ([#10081](https://github.com/NativeScript/NativeScript/pull/10081))
- **webpack:** add --env.stats to disable printing stats ([e80ec0787](https://github.com/NativeScript/NativeScript/commit/e80ec0787))
- **webpack:** allow disabling nativescriptLibPath warning with a boolean ([fefac9f55](https://github.com/NativeScript/NativeScript/commit/fefac9f55))
- **webpack:** emit hrm boot status ([91d2c57ea](https://github.com/NativeScript/NativeScript/commit/91d2c57ea))
- testID property for use with e2e testing without interfering with a11y ([#9793](https://github.com/NativeScript/NativeScript/pull/9793))
- support webpack profiling ([#9804](https://github.com/NativeScript/NativeScript/pull/9804))
- **webpack:** add support for .mjs files ([#9747](https://github.com/NativeScript/NativeScript/pull/9747))
- **webpack:** allow watching node_modules ([#9781](https://github.com/NativeScript/NativeScript/pull/9781))
- **webpack:** read nativescript.config.ts main if set before fallback to package.json ([#9769](https://github.com/NativeScript/NativeScript/pull/9769))
- **webpack:** disable aot flag, optional angular dep and tsconfig utils ([#9711](https://github.com/NativeScript/NativeScript/pull/9711))
- **webpack:** support NG 13 and zone async/await ([#9676](https://github.com/NativeScript/NativeScript/pull/9676))
- **webpack:** -v and --version flags ([f00f82caa](https://github.com/NativeScript/NativeScript/commit/f00f82caa))
- **webpack:** export merge helper ([4c393cd83](https://github.com/NativeScript/NativeScript/commit/4c393cd83))
- **webpack:** try resolving compiler, but don't fail if not found ([97dda9502](https://github.com/NativeScript/NativeScript/commit/97dda9502))
- **webpack:** use svelte-loader and fallback to svelte-loader-hot ([9f807ef7e](https://github.com/NativeScript/NativeScript/commit/9f807ef7e))
- **webpack:** improved svelte HMR ([#9497](https://github.com/NativeScript/NativeScript/pull/9497))
- handle config name ([3bf55b7a0](https://github.com/NativeScript/NativeScript/commit/3bf55b7a0))
- **webpack:** angular12 support & looser dependencies ([#9441](https://github.com/NativeScript/NativeScript/pull/9441))
- **webpack:** support for angular polyfills.ts ([7322ead72](https://github.com/NativeScript/NativeScript/commit/7322ead72))
- add xml support to all flavors ([20a8beaeb](https://github.com/NativeScript/NativeScript/commit/20a8beaeb))
- sourceMap improvements ([cfd98d367](https://github.com/NativeScript/NativeScript/commit/cfd98d367))
- warnOnce & graceful error handling ([1627f5204](https://github.com/NativeScript/NativeScript/commit/1627f5204))
- look for loaders in project node_modules first ([fb2c29106](https://github.com/NativeScript/NativeScript/commit/fb2c29106))
- app-css-loader & suppress env warning in ng projects ([0999d6fe3](https://github.com/NativeScript/NativeScript/commit/0999d6fe3))
- drop webpack-filter-warnings-plugin in favor of built-in ignoreWarnings ([7d5f4a48a](https://github.com/NativeScript/NativeScript/commit/7d5f4a48a))
- env based replacements ([#9286](https://github.com/NativeScript/NativeScript/pull/9286))
- core-hmr handling & watch ignore ([6cc0ce3d5](https://github.com/NativeScript/NativeScript/commit/6cc0ce3d5))
- support workspace configs ([437c3b41f](https://github.com/NativeScript/NativeScript/commit/437c3b41f))
- add worker support ([d2abd5817](https://github.com/NativeScript/NativeScript/commit/d2abd5817))
- ips helper, ts config, cleanups ([aa0daba6a](https://github.com/NativeScript/NativeScript/commit/aa0daba6a))
- parse --env.<flags> [WIP] ([b794b9969](https://github.com/NativeScript/NativeScript/commit/b794b9969))
- add DotEnv support ([84fdc11a8](https://github.com/NativeScript/NativeScript/commit/84fdc11a8))
- **webpack:** filter common undesirable warnings by default ([#9253](https://github.com/NativeScript/NativeScript/pull/9253))
- extract platforms ([54dd20e90](https://github.com/NativeScript/NativeScript/commit/54dd20e90))
- add postcss-loader by default ([0f14fc9d4](https://github.com/NativeScript/NativeScript/commit/0f14fc9d4))
- addCopyRule removeCopyRule helpers ([1086c6f9b](https://github.com/NativeScript/NativeScript/commit/1086c6f9b))
- platform suffix resolution [wip] ([518176932](https://github.com/NativeScript/NativeScript/commit/518176932))
- add entryDir helper + update aliases ([d537fa0e6](https://github.com/NativeScript/NativeScript/commit/d537fa0e6))
- ported xml-namespace-loader ([696389d03](https://github.com/NativeScript/NativeScript/commit/696389d03))
- webpackChain options ([e1abbd9d6](https://github.com/NativeScript/NativeScript/commit/e1abbd9d6))
- add ForkTsChecker ([e8888719b](https://github.com/NativeScript/NativeScript/commit/e8888719b))
- svelte config ([#9061](https://github.com/NativeScript/NativeScript/pull/9061))
- add micro cli for initializing the config ([19e38f8c2](https://github.com/NativeScript/NativeScript/commit/19e38f8c2))
- apply-css-loader hmr code ([9e091c4bf](https://github.com/NativeScript/NativeScript/commit/9e091c4bf))
- make react config functional ([bb80853db](https://github.com/NativeScript/NativeScript/commit/bb80853db))
- export Utils ([a1abd07c7](https://github.com/NativeScript/NativeScript/commit/a1abd07c7))
- add merging logic ([d46d59abe](https://github.com/NativeScript/NativeScript/commit/d46d59abe))
- external config loading ([575130c71](https://github.com/NativeScript/NativeScript/commit/575130c71))
- css loading ([2bd7c4403](https://github.com/NativeScript/NativeScript/commit/2bd7c4403))
- implement basic public api ([cb7108d33](https://github.com/NativeScript/NativeScript/commit/cb7108d33))
- basic react config ([4e9750398](https://github.com/NativeScript/NativeScript/commit/4e9750398))
- additional base setup ([362ff6a46](https://github.com/NativeScript/NativeScript/commit/362ff6a46))
- basic webpack-chain setup ([aaae0d4f2](https://github.com/NativeScript/NativeScript/commit/aaae0d4f2))
- **webpack5:** initial project files ([9f436695a](https://github.com/NativeScript/NativeScript/commit/9f436695a))
- parse --env.<flags> [WIP] ([0a1ba1643](https://github.com/NativeScript/NativeScript/commit/0a1ba1643))
- add DotEnv support ([3c44a553c](https://github.com/NativeScript/NativeScript/commit/3c44a553c))
- **webpack:** filter common undesirable warnings by default ([#9253](https://github.com/NativeScript/NativeScript/pull/9253))
- extract platforms ([2f39cf5ed](https://github.com/NativeScript/NativeScript/commit/2f39cf5ed))
- add postcss-loader by default ([7df2f09cf](https://github.com/NativeScript/NativeScript/commit/7df2f09cf))
- addCopyRule removeCopyRule helpers ([fa70654bf](https://github.com/NativeScript/NativeScript/commit/fa70654bf))
- platform suffix resolution [wip] ([65b214b84](https://github.com/NativeScript/NativeScript/commit/65b214b84))
- add entryDir helper + update aliases ([ca78bc5ae](https://github.com/NativeScript/NativeScript/commit/ca78bc5ae))
- ported xml-namespace-loader ([5b182c0d5](https://github.com/NativeScript/NativeScript/commit/5b182c0d5))
- webpackChain options ([803958266](https://github.com/NativeScript/NativeScript/commit/803958266))
- initial angular support + clean up tests ([d9a93040f](https://github.com/NativeScript/NativeScript/commit/d9a93040f))
- add ForkTsChecker ([015d337e2](https://github.com/NativeScript/NativeScript/commit/015d337e2))
- svelte config ([#9061](https://github.com/NativeScript/NativeScript/pull/9061))
- add micro cli for initializing the config ([e544b4506](https://github.com/NativeScript/NativeScript/commit/e544b4506))
- apply-css-loader hmr code ([2f5cd2bb8](https://github.com/NativeScript/NativeScript/commit/2f5cd2bb8))
- make react config functional ([241c4102f](https://github.com/NativeScript/NativeScript/commit/241c4102f))
- export Utils ([741d4b242](https://github.com/NativeScript/NativeScript/commit/741d4b242))
- add merging logic ([39949182e](https://github.com/NativeScript/NativeScript/commit/39949182e))
- external config loading ([46853d2c8](https://github.com/NativeScript/NativeScript/commit/46853d2c8))
- css loading ([288444c05](https://github.com/NativeScript/NativeScript/commit/288444c05))
- implement basic public api ([c1d240d66](https://github.com/NativeScript/NativeScript/commit/c1d240d66))
- basic ract config ([b2ce0402c](https://github.com/NativeScript/NativeScript/commit/b2ce0402c))
- additional base setup ([b22e1c236](https://github.com/NativeScript/NativeScript/commit/b22e1c236))
- basic webpack-chain setup ([9250bf222](https://github.com/NativeScript/NativeScript/commit/9250bf222))
- **webpack5:** initial project files ([49a47fef2](https://github.com/NativeScript/NativeScript/commit/49a47fef2))

### 🩹 Fixes

- **webpack:** union type ([#10575](https://github.com/NativeScript/NativeScript/pull/10575))
- **webpack:** set exitCode if the configuration failed ([#10327](https://github.com/NativeScript/NativeScript/pull/10327))
- **webpack:** handle single appComponents env flag ([#10401](https://github.com/NativeScript/NativeScript/pull/10401))
- **testing:** e2e flag no longer needed, testID is now applicable in dev or prod builds ([#10396](https://github.com/NativeScript/NativeScript/pull/10396))
- **webpack:** set keep_quoted_props: true in TerserOptions ([#10382](https://github.com/NativeScript/NativeScript/pull/10382))
- **webpack:** force experimentalDecorators on NativeClass ([#10356](https://github.com/NativeScript/NativeScript/pull/10356))
- **webpack:** angular 16 build with terser ([#10302](https://github.com/NativeScript/NativeScript/pull/10302))
- **webpack:** notify CLI even if there are compilation errors ([#10141](https://github.com/NativeScript/NativeScript/pull/10141))
- **webpack:** fix regex for PlatformSuffixPlugin ([#10169](https://github.com/NativeScript/NativeScript/pull/10169))
- **webpack:** support angular 15.x ([#10106](https://github.com/NativeScript/NativeScript/pull/10106))
- **webpack:** prevent hmr from patching __onLiveSync multiple times ([#10103](https://github.com/NativeScript/NativeScript/pull/10103))
- **webpack:** make NativeClass transformer backwards compatible ([59624a4eb](https://github.com/NativeScript/NativeScript/commit/59624a4eb))
- **webpack:** close compiler after run ([#10080](https://github.com/NativeScript/NativeScript/pull/10080))
- revert copy rule glob filter ([a96445f53](https://github.com/NativeScript/NativeScript/commit/a96445f53))
- **webpack:** remove copy rules that don't match any files to avoid false watch triggers ([eedc9c9eb](https://github.com/NativeScript/NativeScript/commit/eedc9c9eb))
- **hmr:** emit boot log at boot instead of the 1st livesync ([5a0043832](https://github.com/NativeScript/NativeScript/commit/5a0043832))
- **webpack:** NativeClass decorator should run after angular transformers in AOT mode ([#9908](https://github.com/NativeScript/NativeScript/pull/9908))
- **webpack:** unit test runner with node 18+ ([#9952](https://github.com/NativeScript/NativeScript/pull/9952))
- **webpack:** pin vue-loader version to the latest working version ([c2d554bf0](https://github.com/NativeScript/NativeScript/commit/c2d554bf0))
- **webpack:** xml-namespace-loader incorrect dependency mapping ([#9780](https://github.com/NativeScript/NativeScript/pull/9780))
- **webpack:** exclude other platforms from require.context ([#9686](https://github.com/NativeScript/NativeScript/pull/9686))
- **webpack:** typescript imports in non-ts projects ([#9714](https://github.com/NativeScript/NativeScript/pull/9714))
- **webpack:** prepend NativeClass transformer in angular config ([#9698](https://github.com/NativeScript/NativeScript/pull/9698))
- **webpack:** prepend NativeClass transformer in angular config ([#9698](https://github.com/NativeScript/NativeScript/pull/9698))
- **webpack5:** include hmr handling only when enabled ([#9685](https://github.com/NativeScript/NativeScript/pull/9685))
- **webpack:** map 'svelte' to 'svelte/internal' to avoid forced ssr ([#9627](https://github.com/NativeScript/NativeScript/pull/9627))
- **webpack:** exclude files starting with _ from require.context ([#9596](https://github.com/NativeScript/NativeScript/pull/9596))
- **webpack:** using multiple workers in a single file ([1ceea571e](https://github.com/NativeScript/NativeScript/commit/1ceea571e))
- include bundle-entry-points by default ([5ff85bfae](https://github.com/NativeScript/NativeScript/commit/5ff85bfae))
- **webpack5:** angular scss rule not ignoring regular scss ([#9502](https://github.com/NativeScript/NativeScript/pull/9502))
- **webpack:** use async type-checking in watch mode ([5309f2d0a](https://github.com/NativeScript/NativeScript/commit/5309f2d0a))
- **webpack:** add virtualEntry before main entry ([5a3a35d37](https://github.com/NativeScript/NativeScript/commit/5a3a35d37))
- **webpack:** angular component css handling ([#9434](https://github.com/NativeScript/NativeScript/pull/9434))
- **webpack:** don't ignore compilation errors ([#9369](https://github.com/NativeScript/NativeScript/pull/9369))
- **webpack5:** change .d.ts filter regex ([#9470](https://github.com/NativeScript/NativeScript/pull/9470))
- vue scoped css ([14edc7033](https://github.com/NativeScript/NativeScript/commit/14edc7033))
- don't exclude node_modules from worker processing ([2d47cf327](https://github.com/NativeScript/NativeScript/commit/2d47cf327))
- **webpack5:** allow platform specific template files ([#9459](https://github.com/NativeScript/NativeScript/pull/9459))
- hmr with runtimeChunk single ([dea18978d](https://github.com/NativeScript/NativeScript/commit/dea18978d))
- **webpack5:** add AngularWebpackPlugin transformers ([#9435](https://github.com/NativeScript/NativeScript/pull/9435))
- **webpack:** avoid module reevaluation ([e26e202af](https://github.com/NativeScript/NativeScript/commit/e26e202af))
- **webpack|angular:** platform suffixed files printing error when changed ([a9eed7e4c](https://github.com/NativeScript/NativeScript/commit/a9eed7e4c))
- **webpack|angular:** styleUrls with platform suffixes ([759f05a53](https://github.com/NativeScript/NativeScript/commit/759f05a53))
- watchIgnore should be a full path ([0601ca763](https://github.com/NativeScript/NativeScript/commit/0601ca763))
- don't externalize node built-ins ([f053403d8](https://github.com/NativeScript/NativeScript/commit/f053403d8))
- prevent App_Resources from being copied ([#9325](https://github.com/NativeScript/NativeScript/pull/9325))
- use acorn and drop babel-loader by default ([#9320](https://github.com/NativeScript/NativeScript/pull/9320))
- terser options ([279b0b1d2](https://github.com/NativeScript/NativeScript/commit/279b0b1d2))
- **angular:** styleURLs ([6afd5a65c](https://github.com/NativeScript/NativeScript/commit/6afd5a65c))
- context regext to match the dot, exclude .d.ts ([458c4eba8](https://github.com/NativeScript/NativeScript/commit/458c4eba8))
- exclude App_Resources from context ([13b3364e6](https://github.com/NativeScript/NativeScript/commit/13b3364e6))
- resolving loaders from non-hoisted deps ([d8067a553](https://github.com/NativeScript/NativeScript/commit/d8067a553))
- copy stubs step ([7edb1e90b](https://github.com/NativeScript/NativeScript/commit/7edb1e90b))
- node_module resolution when using relative packages ([1025270fa](https://github.com/NativeScript/NativeScript/commit/1025270fa))
- read __CSS_PARSER__ from config ([#9290](https://github.com/NativeScript/NativeScript/pull/9290))
- app-css-loader to look for platform specific app s?css files too ([f7530fe4e](https://github.com/NativeScript/NativeScript/commit/f7530fe4e))
- fileReplacements should be relative to app root ([687bc641a](https://github.com/NativeScript/NativeScript/commit/687bc641a))
- print errorDetails with env.verbose ([c2297464b](https://github.com/NativeScript/NativeScript/commit/c2297464b))
- make nsv template compiler optional ([44c8ef999](https://github.com/NativeScript/NativeScript/commit/44c8ef999))
- hmr runtime for core/ts ([0b32d5a88](https://github.com/NativeScript/NativeScript/commit/0b32d5a88))
- look for tsconfig.app.json in ng projects ([f8cc505a9](https://github.com/NativeScript/NativeScript/commit/f8cc505a9))
- patch vue-loader for hmr ([3a28f9eef](https://github.com/NativeScript/NativeScript/commit/3a28f9eef))
- handle appComponents ([#9126](https://github.com/NativeScript/NativeScript/pull/9126))
- handle empty env for app resources ([d3e51bbd3](https://github.com/NativeScript/NativeScript/commit/d3e51bbd3))
- ngcc default format to use module field ([bf34966ce](https://github.com/NativeScript/NativeScript/commit/bf34966ce))
- bash prefix ([ed4848770](https://github.com/NativeScript/NativeScript/commit/ed4848770))
- correctly sanitize project name ([#9193](https://github.com/NativeScript/NativeScript/pull/9193))
- xml namespace loader test ([c9455e67a](https://github.com/NativeScript/NativeScript/commit/c9455e67a))
- supress A11y warnings for svelte ([f967606b3](https://github.com/NativeScript/NativeScript/commit/f967606b3))
- svelte and css2json-loader ([34987d666](https://github.com/NativeScript/NativeScript/commit/34987d666))
- sass + add copy plugin ([93db85a59](https://github.com/NativeScript/NativeScript/commit/93db85a59))
- sass handling ([cabf62624](https://github.com/NativeScript/NativeScript/commit/cabf62624))
- load globals first ([110ec9233](https://github.com/NativeScript/NativeScript/commit/110ec9233))
- NativeClass transformer import ([877c513a1](https://github.com/NativeScript/NativeScript/commit/877c513a1))
- use compiler object ([96799ac17](https://github.com/NativeScript/NativeScript/commit/96799ac17))
- clean path should be absolute ([caae91325](https://github.com/NativeScript/NativeScript/commit/caae91325))
- handle appComponents ([#9126](https://github.com/NativeScript/NativeScript/pull/9126))
- handle empty env for app resources ([60293bb81](https://github.com/NativeScript/NativeScript/commit/60293bb81))
- ngcc default format to use module field ([d6d6e0014](https://github.com/NativeScript/NativeScript/commit/d6d6e0014))
- bash prefix ([de2297c7a](https://github.com/NativeScript/NativeScript/commit/de2297c7a))
- correctly sanitize project name ([#9193](https://github.com/NativeScript/NativeScript/pull/9193))
- xml namespace loader test ([6e0407e5e](https://github.com/NativeScript/NativeScript/commit/6e0407e5e))
- supress A11y warnings for svelte ([1ede4dbf5](https://github.com/NativeScript/NativeScript/commit/1ede4dbf5))
- svelte and css2json-loader ([86a46b46c](https://github.com/NativeScript/NativeScript/commit/86a46b46c))
- sass + add copy plugin ([30c31a252](https://github.com/NativeScript/NativeScript/commit/30c31a252))
- sass handling ([f09d746cc](https://github.com/NativeScript/NativeScript/commit/f09d746cc))
- load globals first ([403fa6b30](https://github.com/NativeScript/NativeScript/commit/403fa6b30))
- NativeClass transformer import ([b29918f5a](https://github.com/NativeScript/NativeScript/commit/b29918f5a))
- use compiler object ([fe0d6403a](https://github.com/NativeScript/NativeScript/commit/fe0d6403a))
- clean path should be absolute ([fa879ba49](https://github.com/NativeScript/NativeScript/commit/fa879ba49))

### ❤️ Thank You

- Adam Bird @Archez
- apburgess @apburgess
- Canmert
- Dimitris-Rafail Katsampas @CatchABus
- Eduardo Speroni @edusperoni
- farfromrefuge
- François KLINGLER
- halfnelson
- Ian MacDonald
- Igor Randjelovic
- insytes
- Janos Hrubos @janoshrubos
- Jason Cassidy @jcassidyav
- Manuel Roat
- Martin Guillon
- Michael DeGiovanni
- Nathan Walker
- Osei Fortune @triniwiz
- Pier Fumagalli @pfumagalli
- rigor789
- Ruslan Lekhman @lekhmanrus
- Samuel Schultze
- Vladimir Mutafov @vmutafov