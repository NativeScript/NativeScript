# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [8.9.10](https://github.com/Akylas/NativeScript/compare/@akylas/nativescript@8.9.6...@akylas/nativescript@8.9.10) (2025-10-04)


### Features

* **dialogs:** allow using keyboard enter/return to confirm on iOS ([#10799](https://github.com/Akylas/NativeScript/issues/10799)) ([326672e](https://github.com/Akylas/NativeScript/commit/326672efb4648b07910e2b641b46171f9e49ad5b))
* **TextField:** decimal keyboardType  ([#10789](https://github.com/Akylas/NativeScript/issues/10789)) ([55104ae](https://github.com/Akylas/NativeScript/commit/55104ae36af05a84f4f88d288a9807187a5863d3))


### Bug Fixes

* `orientationChange` event now also contains rotation in degrees ([fca16b1](https://github.com/Akylas/NativeScript/commit/fca16b17456f107e02208aca456ae967af077056))
* **android:** make button default text not all caps for improved consistency ([#10854](https://github.com/Akylas/NativeScript/issues/10854)) ([d6d3800](https://github.com/Akylas/NativeScript/commit/d6d38008840b90fac4d2098de124abab0c69416b))
* **android:** shared element with target name already added to transaction ([#10793](https://github.com/Akylas/NativeScript/issues/10793)) ([e0e8126](https://github.com/Akylas/NativeScript/commit/e0e81268d6c5f30047eaed70062017b5a803882b))
* **core:** iOS fix for navigation broken after showing modal over view already showing an alert dialog ([71bbb60](https://github.com/Akylas/NativeScript/commit/71bbb607d04faeaedb35cf80e46b8386c74760a3))

### [8.9.6](https://github.com/Akylas/NativeScript/compare/@akylas/nativescript@8.9.5...@akylas/nativescript@8.9.6) (2025-09-02)


### Bug Fixes

* **core:** bring back defaults for `Font.with...` and `Background.with...` which clone the object ([bb8a954](https://github.com/Akylas/NativeScript/commit/bb8a9540632cd6b0ed40ccdd5079699047399bc3))

### [8.9.5](https://github.com/Akylas/NativeScript/compare/@akylas/nativescript@8.9.4...@akylas/nativescript@8.9.5) (2025-09-02)


### Bug Fixes

* **core:** fix(core): use of css calc() and color-mix() now requires `__CSS_USE_CSS_TOOLS__` to be defined in webpack Define plugin. This prevents unecessary includes in vendor ([0862b7d](https://github.com/Akylas/NativeScript/commit/0862b7d1f37dd043685f97bad098603d4e0fcf5e))

## 8.9.7 (2025-07-26)

### 🩹 Fixes

- **core:** pin source-map due to minor bump using url ([44c3d3fe5](https://github.com/Akylas/NativeScript/commit/44c3d3fe5))

### ❤️ Thank You

- Nathan Walker

## 8.9.6 (2025-07-26)

### 🩹 Fixes

- Transient dependency fix on source-map

## 8.9.5 (2025-07-14)

### 🩹 Fixes

- package format for current hook handling
  
## 8.9.4 (2025-07-14)

### 🚀 Features

- **TextField:** support css white-space and text-overflow ([#10737](https://github.com/NativeScript/NativeScript/pull/10737))

### 🩹 Fixes

- **android:** allow CSS styling of neutral button in dialogs ([#10745](https://github.com/NativeScript/NativeScript/pull/10745))
- **ios:** listview measurement ([#10740](https://github.com/NativeScript/NativeScript/pull/10740))

### ❤️ Thank You

- Dimitris-Rafail Katsampas @CatchABus
- Eduardo Speroni @edusperoni
- Nathan Walker

## 8.9.3 (2025-06-20)

### Maintenance

- Dependency handling

## 8.9.2 (2025-04-18)

### 🩹 Fixes

- **ios:** 18.4 simulator networking case ([#10732](https://github.com/NativeScript/NativeScript/pull/10732))

## 8.9.1 (2025-03-16)

### 🚀 Features

- **css:** color-mix ([#10719](https://github.com/NativeScript/NativeScript/pull/10719))

### 🩹 Fixes

- **core:** missing parameter for once event listeners ([#10715](https://github.com/NativeScript/NativeScript/pull/10715))

### ❤️ Thank You

- Dimitris-Rafail Katsampas @CatchABus
- Nathan Walker

## 8.9.0 (2025-02-27)

### 🚀 Features

- **core:** CSS wide keywords ([#10709](https://github.com/NativeScript/NativeScript/pull/10709))
- Node-API engine support ([#10710](https://github.com/NativeScript/NativeScript/pull/10710))
- **ios:** added layoutChanged event support to Page ([#10707](https://github.com/NativeScript/NativeScript/pull/10707))
- **image:** ios system icons styling by font-size and font-weight ([#10706](https://github.com/NativeScript/NativeScript/pull/10706))
- **css:** allow infinity values within css calc expressions ([#10705](https://github.com/NativeScript/NativeScript/pull/10705))
- **config:** ability to include native source code from any path ([#10698](https://github.com/NativeScript/NativeScript/pull/10698))
- **action-bar:** iosLargeTitle and iosShadow attributes ([#10694](https://github.com/NativeScript/NativeScript/pull/10694))
- **ios:** added activity indicator iosIndicatorViewStyle property ([#10650](https://github.com/NativeScript/NativeScript/pull/10650))
- **ios:** apple intelligence writing tools ([#10643](https://github.com/NativeScript/NativeScript/pull/10643))
- **config:** multi target support for swift packages ([#10695](https://github.com/NativeScript/NativeScript/pull/10695))
- **core:** tailwind v4 support ([#10692](https://github.com/NativeScript/NativeScript/pull/10692))
- **core:** style properties module improvements and organization ([#10685](https://github.com/NativeScript/NativeScript/pull/10685))
- **core:** flexibility using multiple RootLayouts ([#10684](https://github.com/NativeScript/NativeScript/pull/10684))
- **core:** textbase span interaction and styling improvements ([#10682](https://github.com/NativeScript/NativeScript/pull/10682))
- apple view filtering ([#10681](https://github.com/NativeScript/NativeScript/pull/10681))
- winter-tc ([#10667](https://github.com/NativeScript/NativeScript/pull/10667))
- **core:** openUrlAsync utility ([#10637](https://github.com/NativeScript/NativeScript/pull/10637))
- **core:** support for simultaneous pseudo states ([#10656](https://github.com/NativeScript/NativeScript/pull/10656))
- **ios:** background-image support for action bar ([#10645](https://github.com/NativeScript/NativeScript/pull/10645))

### 🩹 Fixes

- **ios:** apply text color to HTMLView content ([#10708](https://github.com/NativeScript/NativeScript/pull/10708))
- **android:** formatted string NoSuchMethodError ([#10704](https://github.com/NativeScript/NativeScript/pull/10704))
- **core:** corrected background color between Label and nested spans ([#10701](https://github.com/NativeScript/NativeScript/pull/10701))
- **core:** added missing inheritance support for text css properties ([#10699](https://github.com/NativeScript/NativeScript/pull/10699))
- **core:** corrected Frame navigation event types ([#10697](https://github.com/NativeScript/NativeScript/pull/10697))
- **android:** display soft input on search bar focus ([#10696](https://github.com/NativeScript/NativeScript/pull/10696))
- **core:** ignore inserting child if < 0 ([#10690](https://github.com/NativeScript/NativeScript/pull/10690))
- **core:** added missing length property equality comparers ([#10689](https://github.com/NativeScript/NativeScript/pull/10689))
- **ios:** prevent animator from animating colors on shadow layer ([#10686](https://github.com/NativeScript/NativeScript/pull/10686))
- **core:** safety-checks to prevent potential navigation exceptions ([#10683](https://github.com/NativeScript/NativeScript/pull/10683))
- **core:** avoid splicing arrays using a negative start index ([#10679](https://github.com/NativeScript/NativeScript/pull/10679))
- **core:** pseudo-class handlers failing to unsubscribe listeners ([#10680](https://github.com/NativeScript/NativeScript/pull/10680))
- Corrected font-weight support for span ([045986de8](https://github.com/Akylas/NativeScript/commit/045986de8))
- Added asset path fallback null value inside an else clause ([8726d026f](https://github.com/Akylas/NativeScript/commit/8726d026f))
- **android:** Span should accept all font weight types ([a21d4f94a](https://github.com/Akylas/NativeScript/commit/a21d4f94a))
- **ios:** corrected rotate animation ([#10676](https://github.com/NativeScript/NativeScript/pull/10676))
- **ios:** invalid transform if set before any layout ([#10675](https://github.com/NativeScript/NativeScript/pull/10675))
- **ios:** safe area memory leak on iOS 10 and older versions ([#10673](https://github.com/NativeScript/NativeScript/pull/10673))
- **ios:** frame backstack disposal handling ([#10672](https://github.com/NativeScript/NativeScript/pull/10672))
- **crypto:** getRandomValues return value ([#10658](https://github.com/NativeScript/NativeScript/pull/10658))
- **core:** improved types for common utils ([#10628](https://github.com/NativeScript/NativeScript/pull/10628))
- **ios:** background styles after frame changed by safe area ([#10661](https://github.com/NativeScript/NativeScript/pull/10661))
- **core:** provided image source can be unintentionally disposed ([#10654](https://github.com/NativeScript/NativeScript/pull/10654))
- **android:** background image aspect ratio ([#10651](https://github.com/NativeScript/NativeScript/pull/10651))

### 🔥 Performance

- Avoid creating new typeface instances for system fonts ([4902e2781](https://github.com/Akylas/NativeScript/commit/4902e2781))

### ❤️ Thank You

- Dimitris-Rafail Katsampas @CatchABus
- Eduardo Speroni @edusperoni
- farfromrefuge
- Nathan Walker


### [8.8.11](https://github.com/NativeScript/NativeScript/compare/@akylas/nativescript@8.8.10...@akylas/nativescript@8.8.11) (2025-02-17)

### Features

* apple view filtering ([#10681](https://github.com/NativeScript/NativeScript/issues/10681)) ([20fc1cc](https://github.com/Akylas/NativeScript/commit/20fc1cc1d45e4ec4b2be2daf493bdac1008bbdbf))
* **config:** multi target support for swift packages ([#10695](https://github.com/NativeScript/NativeScript/issues/10695)) ([b649c35](https://github.com/Akylas/NativeScript/commit/b649c353fb355f6c15d9cc7cd9328d50790dd977))
* **core:** flexibility using multiple RootLayouts ([#10684](https://github.com/NativeScript/NativeScript/issues/10684)) ([4b87a35](https://github.com/Akylas/NativeScript/commit/4b87a35e51ecd08efdda69086b8295131c564577))
* **core:** openUrlAsync utility  ([#10637](https://github.com/NativeScript/NativeScript/issues/10637)) ([f6eab0d](https://github.com/Akylas/NativeScript/commit/f6eab0d62f00321470b4a6553089c51001d74142))
* **core:** style properties module improvements and organization ([#10685](https://github.com/NativeScript/NativeScript/issues/10685)) ([3a7206f](https://github.com/Akylas/NativeScript/commit/3a7206fc3b1d0582312030736e63c6e128a57dda))
* **core:** support for simultaneous pseudo states ([#10656](https://github.com/NativeScript/NativeScript/issues/10656)) ([f970455](https://github.com/Akylas/NativeScript/commit/f970455007b7505ade15b69745e7328203ba6bfa))
* **core:** tailwind v4 support ([#10692](https://github.com/NativeScript/NativeScript/issues/10692)) ([c7039dd](https://github.com/Akylas/NativeScript/commit/c7039ddec48b7a607151fe5789dce124001d5d86))
* **core:** textbase span interaction and styling improvements ([#10682](https://github.com/NativeScript/NativeScript/issues/10682)) ([966dccd](https://github.com/Akylas/NativeScript/commit/966dccd0f93c2e79e66169eb60edd3ff0b7c0784))
* **ios:** background-image support for action bar ([#10645](https://github.com/NativeScript/NativeScript/issues/10645)) ([5e85d88](https://github.com/Akylas/NativeScript/commit/5e85d8873c45c90e13f67fe62702b674a2ba22c9))
* winter-tc ([#10667](https://github.com/NativeScript/NativeScript/issues/10667)) ([845ceea](https://github.com/Akylas/NativeScript/commit/845ceea4bcff998ca3e931c1e6688dc141149432))


### Bug Fixes

* Added asset path fallback null value inside an else clause ([8726d02](https://github.com/Akylas/NativeScript/commit/8726d026fef9b93d12f34930f4dabaae6cfcb698))
* **android:** background image aspect ratio ([#10651](https://github.com/NativeScript/NativeScript/issues/10651)) ([eb21056](https://github.com/Akylas/NativeScript/commit/eb21056a64bc1be46bc51ecf380e11cb1f15d0b7))
* **android:** display soft input on search bar focus ([#10696](https://github.com/NativeScript/NativeScript/issues/10696)) ([317b098](https://github.com/Akylas/NativeScript/commit/317b098321ff40b88d6ee050ada1a88b15837319))
* **android:** Span should accept all font weight types ([a21d4f9](https://github.com/Akylas/NativeScript/commit/a21d4f94acd21fe87a76b4f58398fcee6655a903))
* boxShadow not working on android only backgroundColor ([79928af](https://github.com/Akylas/NativeScript/commit/79928af691e904a3b94314fde159358105e23b5e))
* circular imports ([#10670](https://github.com/NativeScript/NativeScript/issues/10670)) ([2afed08](https://github.com/Akylas/NativeScript/commit/2afed0827b0a41aa64de0870ef7264fc1a93cb73))
* **core:** added missing length property equality comparers ([#10689](https://github.com/NativeScript/NativeScript/issues/10689)) ([56af0b2](https://github.com/Akylas/NativeScript/commit/56af0b2f7e2421eb13502343b6e3f8c36df3a5c7))
* **core:** avoid splicing arrays using a negative start index ([#10679](https://github.com/NativeScript/NativeScript/issues/10679)) ([9bd147c](https://github.com/Akylas/NativeScript/commit/9bd147c9d0ced984da46985eb508c1aa1540a128))
* **core:** corrected Frame navigation event types ([#10697](https://github.com/NativeScript/NativeScript/issues/10697)) ([1b72912](https://github.com/Akylas/NativeScript/commit/1b72912f81ef20b4e5c14896a5c986acc7ff979d))
* **core:** ignore inserting child if < 0 ([#10690](https://github.com/NativeScript/NativeScript/issues/10690)) ([2305511](https://github.com/Akylas/NativeScript/commit/23055111872285c34ab79922a69116c8dc10d275))
* **core:** improved types for common utils ([#10628](https://github.com/NativeScript/NativeScript/issues/10628)) ([17a94a2](https://github.com/Akylas/NativeScript/commit/17a94a2b3234ff4e07cc4a08c73012405ad873d6))
* **core:** provided image source can be unintentionally disposed ([#10654](https://github.com/NativeScript/NativeScript/issues/10654)) ([a883a79](https://github.com/Akylas/NativeScript/commit/a883a79e3bdf9db145ed432af2b341bab009ef12))
* **core:** pseudo-class handlers failing to unsubscribe listeners ([#10680](https://github.com/NativeScript/NativeScript/issues/10680)) ([e6beb1d](https://github.com/Akylas/NativeScript/commit/e6beb1d8165f8c84b8a8f4632d10fed31c1ad68a))
* **core:** safety-checks to prevent potential navigation exceptions ([#10683](https://github.com/NativeScript/NativeScript/issues/10683)) ([03cca58](https://github.com/Akylas/NativeScript/commit/03cca58712778cdf61243ad62a10a560a675023e))
* Corrected font-weight support for span ([045986d](https://github.com/Akylas/NativeScript/commit/045986de8fe7ae75f5fdc7c58a8fff1747c0e450))
* **crypto:** getRandomValues return value ([#10658](https://github.com/NativeScript/NativeScript/issues/10658)) ([603b2dc](https://github.com/Akylas/NativeScript/commit/603b2dc5476d17b8c80f5ce831e73d8c72359b15))
* disableCss would break css for next parent children ([753187b](https://github.com/Akylas/NativeScript/commit/753187b47827f16f5ed5d328dd7838b73149753d))
* **ios:** background styles after frame changed by safe area ([#10661](https://github.com/NativeScript/NativeScript/issues/10661)) ([1e86ed9](https://github.com/Akylas/NativeScript/commit/1e86ed9da8b1a587a0376cc2fdab8ba4a9243f90))
* **ios:** corrected rotate animation ([#10676](https://github.com/NativeScript/NativeScript/issues/10676)) ([e545f58](https://github.com/Akylas/NativeScript/commit/e545f5869cd25e09bfd2ec167774e0fcb6665e4a))
* **ios:** frame backstack disposal handling ([#10672](https://github.com/NativeScript/NativeScript/issues/10672)) ([5f8fb2c](https://github.com/Akylas/NativeScript/commit/5f8fb2c36aaf59b64fc4abec175c7ed68f3ed5ca))
* **ios:** invalid transform if set before any layout ([#10675](https://github.com/NativeScript/NativeScript/issues/10675)) ([a531232](https://github.com/Akylas/NativeScript/commit/a531232fbb96042e4197ae4fc059955af32ae20d))
* **ios:** prevent animator from animating colors on shadow layer ([#10686](https://github.com/NativeScript/NativeScript/issues/10686)) ([79a0306](https://github.com/Akylas/NativeScript/commit/79a0306f325f2e0cc5e2c0d7a898c0cffca1e4ec))
* **ios:** safe area memory leak on iOS 10 and older versions ([#10673](https://github.com/NativeScript/NativeScript/issues/10673)) ([0eb2745](https://github.com/Akylas/NativeScript/commit/0eb274558906e03c8aaf250c459136611e301be7))

### [8.8.10](https://github.com/NativeScript/NativeScript/compare/@akylas/nativescript@8.8.9...@akylas/nativescript@8.8.10) (2024-12-19)

### Bug Fixes

* **android:** background color is not applied to certain views ([#10652](https://github.com/NativeScript/NativeScript/issues/10652)) ([4f36748](https://github.com/Akylas/NativeScript/commit/4f367483ef9f89e2d2a3b8f50f23a5cd8e56078f))
* **core:** frame ignored event listeners in xml markup ([#10646](https://github.com/NativeScript/NativeScript/issues/10646)) ([750d2ee](https://github.com/Akylas/NativeScript/commit/750d2ee455786bf06bde853039e5500a3b445568))
* **visionos:** multi-scene improvements ([#10653](https://github.com/NativeScript/NativeScript/issues/10653)) ([d6922b9](https://github.com/Akylas/NativeScript/commit/d6922b9896ff60d819c5439d6828c7907618b0a9))

### [8.8.9](https://github.com/NativeScript/NativeScript/compare/@akylas/nativescript@8.8.8...@akylas/nativescript@8.8.9) (2024-11-13)

### Bug Fixes

* **ios:** getAllJSON fix ([261bf86](https://github.com/Akylas/NativeScript/commit/261bf8600972d125ce831c5f6b99933827690732))
* **ios:** prevent `ApplicationSettings.getAllJSON` error ([ea85225](https://github.com/Akylas/NativeScript/commit/ea85225299634662ae45abd7fbef7adf92f8d348))

### [8.8.8](https://github.com/NativeScript/NativeScript/compare/@akylas/nativescript@8.8.7...@akylas/nativescript@8.8.8) (2024-11-07)


### Bug Fixes

* **core:** corrected references in file system access ([#10644](https://github.com/NativeScript/NativeScript/issues/10644)) ([e5caa2c](https://github.com/Akylas/NativeScript/commit/e5caa2cc539a5c78b6cb3c467d3204a8724fd5df))
* **core:** proper line-height calculation ([#10642](https://github.com/NativeScript/NativeScript/issues/10642)) ([ec7fa5d](https://github.com/Akylas/NativeScript/commit/ec7fa5d05e68f7ee2bc6025aa8f0af7309e5ff92))
* Frame onLoaded should not load pages in backstack ([8544e1b](https://github.com/Akylas/NativeScript/commit/8544e1bded308e5454124168482da2789cdf78e8))
* **ios:** anti-aliasing for accurate borders ([#10619](https://github.com/NativeScript/NativeScript/issues/10619)) ([4f46815](https://github.com/Akylas/NativeScript/commit/4f46815b27cc8a0840e81e802e54bcaec90cfe26))
* **ios:** replace deprecated UIApplication.shared.openUrl method call ([#10627](https://github.com/NativeScript/NativeScript/issues/10627)) ([1cee35d](https://github.com/Akylas/NativeScript/commit/1cee35d4fb2b7eaaa7fbd6aa08b28e3e00dcc7dc))

## [8.8.7](https://github.com/NativeScript/NativeScript/compare/@akylas/nativescript@8.8.6...@akylas/nativescript@8.8.7) (2024-10-14)

**Note:** Version bump only for package @akylas/nativescript

## 8.8.6 (2024-10-14)

### Bug Fixes

* **android:** `path.join` now supports SAF paths (to be tested among more paths) ([8d9a7ae](https://github.com/Akylas/NativeScript/commit/8d9a7aea8c6d997b5702089ecc5060c636da0f0e))

## 8.8.5-core (2024-10-10)

### Features

* **core:** added css class for styling dialog nested elements ([#10605](https://github.com/NativeScript/NativeScript/issues/10605)) ([6104b5b](https://github.com/Akylas/NativeScript/commit/6104b5bfa30d915bd6e4092c9451f6d87043dd60))

### Bug Fixes

* **android:** `onConfigurationChanged` now calls what needed only when needed ([633e9d6](https://github.com/Akylas/NativeScript/commit/633e9d6bba9f24d604c705467baad59e81f1bb8c))
* **android:** custom animation `android.style` for `showModal` ([aa15af8](https://github.com/Akylas/NativeScript/commit/aa15af8135386588e3f1e7e6a3ac1a887ec8a67a))
* **android:** layout change listeners are ignored when using addEventListener ([#10597](https://github.com/NativeScript/NativeScript/issues/10597)) ([89fa6ec](https://github.com/Akylas/NativeScript/commit/89fa6ec84db8c40546b2fcc2fd151c49f1cae8c0))
* **android:** multiple fixes for handling content:// operations in file-system ([b3f06a5](https://github.com/Akylas/NativeScript/commit/b3f06a566f31b3c9df2704c10a5d59803372897c))
* **android:** new `configurationChange` and refactored types ([3c8d22d](https://github.com/Akylas/NativeScript/commit/3c8d22d9c22f9428e34223a9757f5815a0040e3e))
* **android:** new `dialogOnCreateView` event on `Application.android` ([a1b9923](https://github.com/Akylas/NativeScript/commit/a1b992308170b46b4a4e509c674493fb7036e6be))
* **android:** prevent error while using SAF paths ([15a566d](https://github.com/Akylas/NativeScript/commit/15a566dc3e86c3f261eb2f09a1f4794a3c7d8df5))
* **android:** regression after merge ([0a44ce9](https://github.com/Akylas/NativeScript/commit/0a44ce92c9ce4c91ba9446e4008513c07c791504))
* **android:** RootLayout shade cover null color handling ([#10599](https://github.com/NativeScript/NativeScript/issues/10599)) ([f7b9d06](https://github.com/Akylas/NativeScript/commit/f7b9d06e9123f67377a29cf96d21f420fbabd520))
* **android:** targetSdk 34 registerBroadcastReceiver ([#10585](https://github.com/NativeScript/NativeScript/issues/10585)) ([4c70596](https://github.com/Akylas/NativeScript/commit/4c705967d20817c55bac73c21701a96e60874da7))
* **color:** four-digit hex color parse failure ([#10593](https://github.com/NativeScript/NativeScript/issues/10593)) ([8877bec](https://github.com/Akylas/NativeScript/commit/8877becdf9e18ad2edd2fb5888590f3f2645c53e))
* **core:** android fix if folder content cant be acquired ([7e2fba8](https://github.com/Akylas/NativeScript/commit/7e2fba82db931ea914d620a27d39f4b540914d7d))
* **core:** include everything but core.aar in android platforms ([#10592](https://github.com/NativeScript/NativeScript/issues/10592)) ([423a2d2](https://github.com/Akylas/NativeScript/commit/423a2d2dce16ce42d9489f04294d8a5c8d094ea7))
* **core:** iOS fix for showModal just after another modal still dismissing ([dce30ab](https://github.com/Akylas/NativeScript/commit/dce30abc89d127d20648bdcaf50ae24559a4cad6))
* fix for GridLayout and external UI frameworks which could not compare colums/rows to existing property ([a05201f](https://github.com/Akylas/NativeScript/commit/a05201f5d0303c8fe1f7b1548aa77485f15becb9))
* Folder and File now have a `isFolder` property ([a91cd15](https://github.com/Akylas/NativeScript/commit/a91cd1591d780b0cbd9948ddf104d031d5d8e0b8))
* import fixes ([feb958e](https://github.com/Akylas/NativeScript/commit/feb958e4e15a13693dc51118a3dc00625b43c8b2))
* **ios:** ApplicationSettings.getAllJSON now uses native method ([4cd08ed](https://github.com/Akylas/NativeScript/commit/4cd08edda3b43d73f4cc686459d3f26df69d887d))
* **ios:** correct error on `ImageSource.saveToFileAsync` when no native image is passed ([4ecf43e](https://github.com/Akylas/NativeScript/commit/4ecf43ef1778ed4b0604a20877fe8e8093233800))
* **ios:** popover delegate should ignore non-native views ([#10609](https://github.com/NativeScript/NativeScript/issues/10609)) ([ba3316e](https://github.com/Akylas/NativeScript/commit/ba3316e7494730e2a2e069ef1822f02300aa62de))
* **ios:** proper cleanup of reused listview cell content ([#10603](https://github.com/NativeScript/NativeScript/issues/10603)) ([dca7718](https://github.com/Akylas/NativeScript/commit/dca77183d1287309a564059402f3d12ca84e0a9a))
* **ios:** proper drawing bounds for colored borders ([#10600](https://github.com/NativeScript/NativeScript/issues/10600)) ([75c8e94](https://github.com/Akylas/NativeScript/commit/75c8e941a021511381a0c57b7e3535551471218b))
* **layout:** prevent negative width/height values ([#10616](https://github.com/NativeScript/NativeScript/issues/10616)) ([0506012](https://github.com/Akylas/NativeScript/commit/050601232ac4f424e9d3ba6b711f3ada4afe253b))
* new `sharedElementFrom` and `sharedElementTo` events to handle custom sharedElements. The events has a `views` array that you can fill ([ad0a35a](https://github.com/Akylas/NativeScript/commit/ad0a35a73ea8ab83e8294cd9b15642b27f4ed356))

### Reverts

* Revert "chore: trick to get Typings to work correctly. Application event object was using `ApplicationCommon | Observable` which is not compatible with `Observable`. Rendering `Observable` optional with `OptionalAll` did the trick" ([92e9d4d](https://github.com/Akylas/NativeScript/commit/92e9d4d70369b93ee34e94fc2b937c0553ac8d8f))

## 8.8.0-core (2024-07-11)

### Features

* `__ONLY_ALLOW_ROOT_VARIABLES__` to make `getCssVariables` 10x faster ([ccb1b08](https://github.com/Akylas/NativeScript/commit/ccb1b086a9ea3aa586fb34f7aebb022396b47701))
* `defaultVisualState` to override 'normal' default visualState (for example to fake disabled state while allowing touch) ([a3fefbd](https://github.com/Akylas/NativeScript/commit/a3fefbdbea3ea2d37fead389bb84ca3263d8d25a))
* `getAllJSON` and `getNative` for `ApplicationSettings` ([0b4f9f7](https://github.com/Akylas/NativeScript/commit/0b4f9f7e6a31921f047ad80829fca7d73b479f88))
* `initRootView` event. ([009592a](https://github.com/Akylas/NativeScript/commit/009592abd8132a9527b209c96b88d56b3880bcc6))
* allow native string (NSAttributedString / Spannable) to be set as text property for text base components ([699b420](https://github.com/Akylas/NativeScript/commit/699b4200ef9a91d5a7dd73a4fcc97d866492b102))
* **android:** allow shared element transitions to work with ListView/CollectionView/Pager ([#10411](https://github.com/NativeScript/NativeScript/issues/10411)) ([e8c093d](https://github.com/Akylas/NativeScript/commit/e8c093d7a2ca94edd2f5d35ca3725c7a27e74b74))
* **android:** allow to set `SET_THEME_ON_LAUNCH` in app settings to override app theme ([8a6b9d4](https://github.com/Akylas/NativeScript/commit/8a6b9d47fdeed28bc4da6f3354e51558db64514e))
* **android:** background color/image handling improvements ([#10451](https://github.com/NativeScript/NativeScript/issues/10451)) ([4abcb21](https://github.com/Akylas/NativeScript/commit/4abcb216dab4dd305dc7f68b4c8755868a80ac18))
* **android:** basic `sharedTransitionTags` for `SharedTransition` ([6780d8d](https://github.com/Akylas/NativeScript/commit/6780d8dbb8ed99aacf515be25262a8ec419f1ec5))
* **android:** devtools for elements & network requests ([#10506](https://github.com/NativeScript/NativeScript/issues/10506)) ([5324e50](https://github.com/Akylas/NativeScript/commit/5324e508ba8f7e24af99d959760f3b300bc1163a))
* **android:** new `activityCreate` and `fragmentCreate` events ([33a1eb8](https://github.com/Akylas/NativeScript/commit/33a1eb8fe34a4343b395444f5817ba9bc2c4f5f0))
* **config:** embed options for existing platform host projects ([#10568](https://github.com/NativeScript/NativeScript/issues/10568)) ([c736f72](https://github.com/Akylas/NativeScript/commit/c736f72fce64d53dbdd717fb89e3b4b943b6e5f6))
* **core:** ability to embed into platform host projects ([#10465](https://github.com/NativeScript/NativeScript/issues/10465)) ([779d792](https://github.com/Akylas/NativeScript/commit/779d79285d37919ebbf6f064dfa852e20b33f195))
* **core:** add `sys://` support for SF Symbol usage on images with effects ([#10555](https://github.com/NativeScript/NativeScript/issues/10555)) ([d678915](https://github.com/Akylas/NativeScript/commit/d67891523461e5a0543c040fd172e94bd1a65225))
* **core:** css media query support ([#10530](https://github.com/NativeScript/NativeScript/issues/10530)) ([9fd361c](https://github.com/Akylas/NativeScript/commit/9fd361c2e6a14d79e61c9565f7c1b532d5ba499b))
* **core:** css-what parser for CSS selectors + support for :not(), :is(), and :where() Level 4 and ~ ([#10514](https://github.com/NativeScript/NativeScript/issues/10514)) ([2fb4f23](https://github.com/Akylas/NativeScript/commit/2fb4f23670daf94be1dbc5f9f4711f9d22ced3af))
* **core:** ignoreRegexp argument for `ApplicationSettings.getAllJSON` ([475239a](https://github.com/Akylas/NativeScript/commit/475239a0da2ac6151350dda8e78af3b074b2177a))
* **core:** initRootView event ([#10442](https://github.com/NativeScript/NativeScript/issues/10442)) ([82e9c67](https://github.com/Akylas/NativeScript/commit/82e9c67d3398c376be1641c5f23bf82a492a48c3))
* **core:** new `defaultVisualState` property option to override 'normal' default visualState ([#10440](https://github.com/NativeScript/NativeScript/issues/10440)) ([31ed40c](https://github.com/Akylas/NativeScript/commit/31ed40c17ab6ff026dde65c786a3c8ad8e625b3b))
* **css:** support for text-overflow ([#10369](https://github.com/NativeScript/NativeScript/issues/10369)) ([8d25d25](https://github.com/Akylas/NativeScript/commit/8d25d251cd1c311d3f73e526bf2fd4ee0b2be0b8))
* **css:** text-stroke support ([#10399](https://github.com/NativeScript/NativeScript/issues/10399)) ([d647823](https://github.com/Akylas/NativeScript/commit/d6478237ec4f4d8fa4b457f39bddcc463e90643c))
* **ios:** addDelegateHandler to add App Delegate handlers ([#10371](https://github.com/NativeScript/NativeScript/issues/10371)) ([a959a79](https://github.com/Akylas/NativeScript/commit/a959a797df46d47ddf3bfa4514948a97f67758ef))
* **ios:** allow custom navigationBar and toolbar on frame ([#10495](https://github.com/NativeScript/NativeScript/issues/10495)) ([d67d297](https://github.com/Akylas/NativeScript/commit/d67d297e37beefdbb05acdec0c9bae07baa243ba))
* **ios:** allow disabling text animations ([#10505](https://github.com/NativeScript/NativeScript/issues/10505)) ([9ca4902](https://github.com/Akylas/NativeScript/commit/9ca490250eec3d03e0ca8632adf81c504c85939d))
* **ios:** improved shadow handling with background UI rework ([#10374](https://github.com/NativeScript/NativeScript/issues/10374)) ([39eed52](https://github.com/Akylas/NativeScript/commit/39eed526c1f63db75273f00811b9aae6d6c3912b))
* **ios:** SF Symbol scale support via iosSymbolScale ([#10569](https://github.com/NativeScript/NativeScript/issues/10569)) ([80f3ff2](https://github.com/Akylas/NativeScript/commit/80f3ff2042adf4ab8ee77e0e210c2dd4309a4b87))
* leading support for debounce ([#10388](https://github.com/NativeScript/NativeScript/issues/10388)) ([b6a5250](https://github.com/Akylas/NativeScript/commit/b6a52505115a1a22ead62ae96c98d8a16b83cedd))
* **SegmentedBar:** selectedTextColor added and selectedBackgroundColor improvements ([#10474](https://github.com/NativeScript/NativeScript/issues/10474)) ([3a0afdb](https://github.com/Akylas/NativeScript/commit/3a0afdb9cc43c11e748511855d22d03156e45815))
* selectable property for editable text base. This allow NOT editable textview to still be selectable ([e701af4](https://github.com/Akylas/NativeScript/commit/e701af489cb38aa49d406740bd33a9d142af7fcf))
* **shared-transition:** pageOut option for more dynamic page animations ([#10350](https://github.com/NativeScript/NativeScript/issues/10350)) ([9f715c0](https://github.com/Akylas/NativeScript/commit/9f715c0c5f8f01dcb3cd2e18d0e18b42349abad2))
* **visionos:** ui-mobile-base supporting xros plus improvements to window handling ([#10478](https://github.com/NativeScript/NativeScript/issues/10478)) ([01d537b](https://github.com/Akylas/NativeScript/commit/01d537bf155934d65e565afe0c5244ff4c9c50f5))
* **visionos:** Vision Pro support ([#10392](https://github.com/NativeScript/NativeScript/issues/10392)) ([bbede5d](https://github.com/Akylas/NativeScript/commit/bbede5d795ab642d29ed8798053b9c1fe76f5016))
* **webpack:** allow custom 'projectName' on Xcode project name from config ([#10550](https://github.com/NativeScript/NativeScript/issues/10550)) ([b8fff38](https://github.com/Akylas/NativeScript/commit/b8fff3833ee05854452997df898f6a51376c2674))
* **winter-cg:** crypto, atob, btoa ([#10577](https://github.com/NativeScript/NativeScript/issues/10577)) ([f7679d7](https://github.com/Akylas/NativeScript/commit/f7679d725a420a398ed0a4424cc2cdce6282fe36))

### Bug Fixes

*  always set the parent ([f7fe7e2](https://github.com/Akylas/NativeScript/commit/f7fe7e2f39456bc2eb48a1909b45f5e6178db66d))
* `getAllJSON` now correctly returns number (though a bit too slow to my taste) ([9269988](https://github.com/Akylas/NativeScript/commit/9269988037d6fe6b0897bd44a49ac65db2a57ff9))
* `getRequestedImageSize` fix ([58c8568](https://github.com/Akylas/NativeScript/commit/58c856819f874162c75b8633385a04eda42835ae))
* `setAlpha` and other `Color` method were returing a `BaseColor` instead of a `Color` ([9816db1](https://github.com/Akylas/NativeScript/commit/9816db1281428c5eabdf84fd5c6b30e2f6357647))
* accessibilityEnabled fix for for many views/plugins ([ae80498](https://github.com/Akylas/NativeScript/commit/ae8049827fe47140fd1e31fa1d5a2772ac8d8827))
* **action-bar:** provide correct page during navigation when title change occurs ([#10563](https://github.com/NativeScript/NativeScript/issues/10563)) ([12dd329](https://github.com/Akylas/NativeScript/commit/12dd329ed19adbd95d44fd29628e8423080f9dbe))
* allow `openUrl` to throw error ([9f44099](https://github.com/Akylas/NativeScript/commit/9f440999922dbccc02726f5ced31f94248d30ffb))
* allow `openUrl` to throw error ([c1e7988](https://github.com/Akylas/NativeScript/commit/c1e79885f14c5a31a74ae0409a793d82dc7f47f2))
* allow to cancel `systemAppearanceChanged` event. This can be usefull to override auto theme css update (like for true black mode) ([95b01ab](https://github.com/Akylas/NativeScript/commit/95b01ab4a2b5595d55ff3d7072a6b85aa7afe4c7))
* **android:** `clipToBounds` was not working ([aa8ea81](https://github.com/Akylas/NativeScript/commit/aa8ea81fb3a0afa36475141e64f7474dd3c43650))
* **android:** `openFile` correctly working with `content://` URLs ([625bbdf](https://github.com/Akylas/NativeScript/commit/625bbdfe5770dbd1ae489af0b1bc58cdaff08518))
* **android:** `Utils.dismissKeyboard()` not working with modal ([#10375](https://github.com/NativeScript/NativeScript/issues/10375)) ([6d44c2d](https://github.com/Akylas/NativeScript/commit/6d44c2d6e04664076308e74716a0589373357409))
* **android:** added construtor parameter to `PageTransition` to allow changing the timeout use on page load to trigger transition. This can allow some components to be fully loaded and be able to query `sharedTransitionTag` ([b8f064e](https://github.com/Akylas/NativeScript/commit/b8f064e4ea8b3b7d0c4f5927e0db2565dca9e174))
* **android:** allow custom transition on `goBack` ([e89d5cf](https://github.com/Akylas/NativeScript/commit/e89d5cf3860e45cab118e0e52e2c8ee8583faa9b))
* **android:** allow to hide keyboard from a textfield which was part of a `PopupWindow`. ([825863b](https://github.com/Akylas/NativeScript/commit/825863be9784da7af298a8758a475c9801ca7940))
* **android:** background/foreground events fix ([06f30b9](https://github.com/Akylas/NativeScript/commit/06f30b928917b89325a1f2df22f85162393a3c8e))
* **android:** borderRadius / outlineProvider fix for borderRadius is changed back to 0 ([8e9dc44](https://github.com/Akylas/NativeScript/commit/8e9dc44cce5f158ff7c5c4729ff67f2749d1ccfa))
* **android:** boxShadow vs clipToOutline fix ([2a059ca](https://github.com/Akylas/NativeScript/commit/2a059ca63d9cfb33f82c904626411ee5aad8db1d))
* **android:** catch and throw errors in ApplicationSettings ([06f29e1](https://github.com/Akylas/NativeScript/commit/06f29e11210639beb5a5a7f662501b2ec4e66897))
* **android:** complete native error wrapping for fileSystem ([cb192d3](https://github.com/Akylas/NativeScript/commit/cb192d3ba9f2403295d15a02826e509aee33fa91))
* **android:** default clipping is true ([5bd5a68](https://github.com/Akylas/NativeScript/commit/5bd5a685c068fc5094f619fd59cd451eb30ee3dc))
* **android:** dont add to parent from `_setupAsRootView` ([#10554](https://github.com/NativeScript/NativeScript/issues/10554)) ([88a0472](https://github.com/Akylas/NativeScript/commit/88a047254bb9542106f52a204930342a76dbdded))
* **android:** dont resize image in ImageAsset loading ([7753966](https://github.com/Akylas/NativeScript/commit/775396662c0f7d33d66851fea33d10837fed8d2b))
* **android:** dont set fontInternal after fontSize for text-base. Useless ([ab6f4f6](https://github.com/Akylas/NativeScript/commit/ab6f4f638f7de0e2ebb161219f004ae0774d17ee))
* **android:** faster visibility property ([ff39c63](https://github.com/Akylas/NativeScript/commit/ff39c632d0a9f7b3f61877aae45308f7fbb94327))
* **android:** file-system now support content:// all the way ([c32c556](https://github.com/Akylas/NativeScript/commit/c32c5563f8cc39c7ff74be30cf77e7a8ba3b538b))
* **android:** goBack fix after activity recreated ([3d446ea](https://github.com/Akylas/NativeScript/commit/3d446eae627a2d2f881490862883c2f2607ac5db))
* **android:** image tintColor setter ([#10516](https://github.com/NativeScript/NativeScript/issues/10516)) ([7e1cb19](https://github.com/Akylas/NativeScript/commit/7e1cb190843216978bb37cf2f1d59f1abc8df0a3))
* **android:** ListView tap handling after setting children as focusable ([#10522](https://github.com/NativeScript/NativeScript/issues/10522)) ([03268cc](https://github.com/Akylas/NativeScript/commit/03268cc60bbd0f0fc52711dd5187dd86044f0ba0))
* **android:** more transition fixes ([781a718](https://github.com/Akylas/NativeScript/commit/781a7187db116003a6fad7522125c4f7e722aa20))
* **android:** native api usage fix for shared element transitions ([74478e1](https://github.com/Akylas/NativeScript/commit/74478e132da75e75850f1001b1bc330033ff1e6a))
* **android:** prevent error if rootView not mounted (though not sure how it could be happening) ([acc0b20](https://github.com/Akylas/NativeScript/commit/acc0b204697d5c035bbc409f73b71d6140dc5eb4))
* **android:** prevent error on navigation back after using page transition ([#10439](https://github.com/NativeScript/NativeScript/issues/10439)) ([7036f12](https://github.com/Akylas/NativeScript/commit/7036f12b5c149a383ed33748090d850cb8ead759))
* **android:** prevent error while navigation back after using page transition ([a6c6fce](https://github.com/Akylas/NativeScript/commit/a6c6fcecfaa979bd28566344930bc2847ddba215))
* **android:** prevent error while opening modal from background ([#10570](https://github.com/NativeScript/NativeScript/issues/10570)) ([7e9be32](https://github.com/Akylas/NativeScript/commit/7e9be32e28ed96c2dd6f232c16f149222b7985d6))
* **android:** prevent error while opening modal from background. Also added `android.showImmediatelyFromBackground` to force commit from background (though it does not seem to have a UX difference) ([a15edd7](https://github.com/Akylas/NativeScript/commit/a15edd729b6fc138ba29d886cee24f0ee0313ce8))
* **android:** prevent infinite loops text-base change event ([42ee720](https://github.com/Akylas/NativeScript/commit/42ee7201a9a287fef51dbdb83df7d423733d7619))
* **android:** prevent rehydration on destroyed dialogs ([#10414](https://github.com/NativeScript/NativeScript/issues/10414)) ([7563549](https://github.com/Akylas/NativeScript/commit/756354952c88c00794e586cbb316928b7f9dbbff))
* **android:** proper change of input interaction mode programmatically ([#10434](https://github.com/NativeScript/NativeScript/issues/10434)) ([07d2129](https://github.com/Akylas/NativeScript/commit/07d2129f9c9b387c238c9a7c2da29b5690bac986))
* **android:** regression after refactoring of Font ([64bb23d](https://github.com/Akylas/NativeScript/commit/64bb23de54707ad9184aa1c9628f60aba31eddbe))
* **android:** regression where editing textfield would move the cursor to the end on every change ([61a724e](https://github.com/Akylas/NativeScript/commit/61a724ef92e91064f0cbb7f5d3991325e71172e4))
* **android:** return native error or we loose stack ([f28141d](https://github.com/Akylas/NativeScript/commit/f28141df956d921d2884534efc9e1b97152b8aa7))
* **android:** rewrite the GridLayout to make as less JNI calls as possible ([06df4fa](https://github.com/Akylas/NativeScript/commit/06df4fa0beaeba8544e858212cc7c2a7482af0eb))
* **android:** shared element transition not working ([2a3fd1d](https://github.com/Akylas/NativeScript/commit/2a3fd1d854bf46762020a4cad07fc9267d53a0ba))
* **android:** sustain native error stack ([#10467](https://github.com/NativeScript/NativeScript/issues/10467)) ([b226066](https://github.com/Akylas/NativeScript/commit/b22606681435010f36b6200b7664c63a0a268b6d))
* **android:** transition state handling ([#10528](https://github.com/NativeScript/NativeScript/issues/10528)) ([632a348](https://github.com/Akylas/NativeScript/commit/632a348e9ad8184468cf33a37aa17552d9092ca5))
* **android:** trick to get a stack on native exceptions ([9aa5e76](https://github.com/Akylas/NativeScript/commit/9aa5e76c13aed59cfc9f085e2bbb1f88d5131959))
* **android:** unload/load pages while navigating forward then back ([879dd2a](https://github.com/Akylas/NativeScript/commit/879dd2af3792ec701ceddc6b4452152c519326bc))
* **android:** use nativeTextViewProtected in TextField ([#10450](https://github.com/NativeScript/NativeScript/issues/10450)) ([c5561d6](https://github.com/Akylas/NativeScript/commit/c5561d60df0fb093c88a30e072ffdc10f31015b8))
* **android:** wrapNativeException fix for string errors ([4229f46](https://github.com/Akylas/NativeScript/commit/4229f463590f2bc70be0a8d5e7a387ae58aa4f7d))
* **android:** wrong parameters to force hiding keyboard ([9329ac1](https://github.com/Akylas/NativeScript/commit/9329ac1d612e610b62e5b0165e0a25849b85dd88))
* Application `once` method fix (was not removed after first event) ([1c3b5c8](https://github.com/Akylas/NativeScript/commit/1c3b5c8ed394f30201ef30fcf8fe69bc73f33cdb))
* better handle KeyFrameAnimation errors ([da206a1](https://github.com/Akylas/NativeScript/commit/da206a12cdeadff47841ac0ec27a39ae926e9656))
* better typings for `getEntities` method in filesystem ([5e2d909](https://github.com/Akylas/NativeScript/commit/5e2d9098e0c26a1c616384c22f0d1e60b269d4f6))
* bring back global event listeners (used for sentry) ([08f4896](https://github.com/Akylas/NativeScript/commit/08f48962fbf21d0df523054581525c11f79f2280))
* class name typo ([#10364](https://github.com/NativeScript/NativeScript/issues/10364)) ([f5f4666](https://github.com/Akylas/NativeScript/commit/f5f4666e0415c995c66c6615d10e82c56f7861ca))
* cleanup the modal parent once closed. ([82d473c](https://github.com/Akylas/NativeScript/commit/82d473c7adf55a31ee332c11e051807a839bd395))
* **color:** setAlpha and other methods return proper Color class ([#10441](https://github.com/NativeScript/NativeScript/issues/10441)) ([4f12fee](https://github.com/Akylas/NativeScript/commit/4f12fee2ef2258926be4507f1cd63aa4872c6bba))
* **core:** android support SAF from android 21 ([b3439c7](https://github.com/Akylas/NativeScript/commit/b3439c75f7559edcc62dc37cdac85b7ec844f1f2))
* **core:** box-shadow 'none' handling  ([#10405](https://github.com/NativeScript/NativeScript/issues/10405)) ([c23695c](https://github.com/Akylas/NativeScript/commit/c23695c477dc1363e4f30fb45d3666c5b8101e4f))
* **core:** clean up event handling in Observable ([#10531](https://github.com/NativeScript/NativeScript/issues/10531)) ([53e958e](https://github.com/Akylas/NativeScript/commit/53e958e6230d5a962bedbc7199f261c944e78521))
* **core:** clean up event handling in ViewCommon ([#10534](https://github.com/NativeScript/NativeScript/issues/10534)) ([4a7e40d](https://github.com/Akylas/NativeScript/commit/4a7e40d1291a575cf567783694536d17cf864653))
* **core:** drop support for plural event/gesture names ([#10539](https://github.com/NativeScript/NativeScript/issues/10539)) ([9be392f](https://github.com/Akylas/NativeScript/commit/9be392fbb0269b6468c5d710722af53653503609))
* **core:** font variation settings parser invalid axis ([#10427](https://github.com/NativeScript/NativeScript/issues/10427)) ([0847855](https://github.com/Akylas/NativeScript/commit/08478556a9e39af9b1524c12e9e330d0a8aae9c7))
* **core:** handle GestureObservers same as event listeners ([#10538](https://github.com/NativeScript/NativeScript/issues/10538)) ([d323672](https://github.com/Akylas/NativeScript/commit/d323672b292699aefb5fb692e841818366ff9dcc))
* **core:** inheritable property changes backstack propagation ([#10438](https://github.com/NativeScript/NativeScript/issues/10438)) ([48b1856](https://github.com/Akylas/NativeScript/commit/48b1856d6cb024ee2a42082e6cf0b8923b0cd8f4))
* **core:** ios ensure animation finish is always called ([0084c70](https://github.com/Akylas/NativeScript/commit/0084c7083ca31d025140700bf0e99fea5ac0f811))
* **core:** ios fix for `File.fromPath` with a path starting with `file://` ([2b35967](https://github.com/Akylas/NativeScript/commit/2b35967c31088127d5cbe0692d9d288960c2816e))
* **core:** ios fix for animating boxShadow ([cdee533](https://github.com/Akylas/NativeScript/commit/cdee5338f17dea8e98e61a9374e6cf76a6a6ab2c))
* **core:** ios fix for fontScale not applied ([1d955f9](https://github.com/Akylas/NativeScript/commit/1d955f9724f2a19b31d6edc27baa7a6fcb5cc6ac))
* **core:** iOS prevent _addViewToNativeVisualTree from _setupAsRootView ([21f1a0f](https://github.com/Akylas/NativeScript/commit/21f1a0fa8719bdfe4a13720107e9b733b07ae8c1))
* **core:** page frame reference not unset on native view disposal ([#10417](https://github.com/NativeScript/NativeScript/issues/10417)) ([22c21b7](https://github.com/Akylas/NativeScript/commit/22c21b7e062b851a635d96aede9c936fb8e9749a))
* **core:** profile decorator ([#10476](https://github.com/NativeScript/NativeScript/issues/10476)) ([135d37b](https://github.com/Akylas/NativeScript/commit/135d37b9ee2d53d9c276a39e3552e6f45574a032))
* **core:** safe important check ([#10455](https://github.com/NativeScript/NativeScript/issues/10455)) ([172d346](https://github.com/Akylas/NativeScript/commit/172d3463a30cf1ee3727aaa42d6a33505332c6bf))
* **core:** Scroll listener register failure after unregister ([#10368](https://github.com/NativeScript/NativeScript/issues/10368)) ([e4fe276](https://github.com/Akylas/NativeScript/commit/e4fe276bed1561192091b6ce7415643a48d65e87))
* **core:** stop accepting GestureTypes enum as an eventName ([#10537](https://github.com/NativeScript/NativeScript/issues/10537)) ([3b77fff](https://github.com/Akylas/NativeScript/commit/3b77fffad58db801490232e787377e58f5cd34ac))
* **crypto:** error expectation ([2bfe8b3](https://github.com/Akylas/NativeScript/commit/2bfe8b38e3ae0fdb0f9f98a88829bde25bc73898))
* **css:** box-shadow none handling ([#10445](https://github.com/NativeScript/NativeScript/issues/10445)) ([6744009](https://github.com/Akylas/NativeScript/commit/67440095f4fafd68da528e9a88e6a42a86136d9c))
* **css:** prevent duplicate system classes ([#10355](https://github.com/NativeScript/NativeScript/issues/10355)) ([74e6814](https://github.com/Akylas/NativeScript/commit/74e68145a2b8fe74cc07ed1c2bd1dbe9219b50f6))
* **css:** prevent shorthand parse error on 'unset' and 'inset' ([#10424](https://github.com/NativeScript/NativeScript/issues/10424)) ([d70b48b](https://github.com/Akylas/NativeScript/commit/d70b48bbe9c42044204e6887b18f95f628656d69))
* defer `_onCssStateChange` for unloaded views. It will be called once the view is loaded again ([c278eed](https://github.com/Akylas/NativeScript/commit/c278eedbd6b487b23ca3e19337460c8a6e11546c))
* disable accessibilty for layout views. Seems unecessary and can be enabled on a per view basis ([deed2ef](https://github.com/Akylas/NativeScript/commit/deed2ef1479ef040b390d89a624940c09b3b814f))
* **embed:** use factory only when it's available ([#10579](https://github.com/NativeScript/NativeScript/issues/10579)) ([9541b1b](https://github.com/Akylas/NativeScript/commit/9541b1b68ce9d6efc08c2ef5e58484d6b372e059))
* ensure _resolvedPage is always correct. Would make eachChild not work after navigation ([84308eb](https://github.com/Akylas/NativeScript/commit/84308ebc263d35fef7e2f188fc4c42dc6c0fdb60))
* ensure parent is a frame (it might not be) ([b1df9af](https://github.com/Akylas/NativeScript/commit/b1df9af43255512f83d9193384478ee501ed06f7))
* ensure subRootView dont have a parent ([459ee4f](https://github.com/Akylas/NativeScript/commit/459ee4f8f5413b9e4112b2af6515b1110af58c1e))
* fix for classes handling fontSize without setting fontInternal (faster) ([e42c32e](https://github.com/Akylas/NativeScript/commit/e42c32e3b0bcae01236eb1773dddd72f662f36d7))
* for now fix `requestAnimationFrame` to work with svelte ([bd75a56](https://github.com/Akylas/NativeScript/commit/bd75a56b18cdc32af48721ef17db627c54deb3df))
* **gestures:** lowercase gesture handling and add deprecation notice when using non-string events ([#10581](https://github.com/NativeScript/NativeScript/issues/10581)) ([6041b2d](https://github.com/Akylas/NativeScript/commit/6041b2d0831d6d2d461251939b28ef01f6a3a028))
* handle navigation error to not break future navigation calls ([dceea2e](https://github.com/Akylas/NativeScript/commit/dceea2e16bf65da58785e2ecdc8b9c5a9bab06b9))
* improved `wrapNativeException` method ([70a7052](https://github.com/Akylas/NativeScript/commit/70a70522caae890406c858c4d4a915417decb450))
* inspector_modules ([ae62725](https://github.com/Akylas/NativeScript/commit/ae6272551099cf1a851b64b0f4b64145a70adb54))
* **ios:** `ImageAsset` `getImageAsync` fix to return correct image size ([3ddbf66](https://github.com/Akylas/NativeScript/commit/3ddbf66229d8454575b92d917e6536ec877cbb81))
* **ios:** add/remove shadow for reusable views ([#10409](https://github.com/NativeScript/NativeScript/issues/10409)) ([ee87b52](https://github.com/Akylas/NativeScript/commit/ee87b52ac323e220b7b154d27a55cbf4cdbd59c4))
* **ios:** big animations fix ([961d355](https://github.com/Akylas/NativeScript/commit/961d35569a30a1da825d7f13ed83b985459904e3))
* **ios:** broken transform if set before any layout ([de39741](https://github.com/Akylas/NativeScript/commit/de397414854f4313608b29973df0eb4570835738))
* **ios:** can now show modal on top of each other ([32f7dce](https://github.com/Akylas/NativeScript/commit/32f7dceaa0cd19ed4fbc5cb50a9e27a96439c5c4))
* **ios:** clipToBounds default fix ([17757a0](https://github.com/Akylas/NativeScript/commit/17757a0aefbf1007cd2d2295389654ed2733ce5a))
* **ios:** correctly load Frame in modal ([4207b03](https://github.com/Akylas/NativeScript/commit/4207b034f0f8919cfb9f032ab92a776cd05b09b7))
* **ios:** dialogs allow to show over already presented controllers. ([9236f06](https://github.com/Akylas/NativeScript/commit/9236f06e6834637766fab569c698a1cd0556c7b6))
* **ios:** ensure children can request layout after suspension ended in `onLoaded` ([3e1350d](https://github.com/Akylas/NativeScript/commit/3e1350d2ad161fe92752eef2c3dba0436275da49))
* **ios:** fixed opacity not animating anymore ([27207e7](https://github.com/Akylas/NativeScript/commit/27207e7155a4f15fe663018e80919c4acc14a924))
* **ios:** font variation settings not applied to labels ([#10429](https://github.com/NativeScript/NativeScript/issues/10429)) ([2cf166d](https://github.com/Akylas/NativeScript/commit/2cf166da5974083d1f1431624a4ff06ad648913b))
* **ios:** live-sync handling for plain js/ts apps ([#10500](https://github.com/NativeScript/NativeScript/issues/10500)) ([7370912](https://github.com/Akylas/NativeScript/commit/73709125c4a8c9107cafac6e6cc411c0f7beccc1))
* **ios:** non-uniform border angle ([#10437](https://github.com/NativeScript/NativeScript/issues/10437)) ([aba3093](https://github.com/Akylas/NativeScript/commit/aba3093e69004e44aa4afa1f245e7cfa3f6e7b97))
* **ios:** now view animation are stacked into one animate block when possible ([a065bfe](https://github.com/Akylas/NativeScript/commit/a065bfeaf48d5f74aee5cd01f1ca750342620b11))
* **ios:** openFile working when called from a modal ([848a8b9](https://github.com/Akylas/NativeScript/commit/848a8b93079f56eda1192634205ce74f63f634c3))
* **ios:** persist animation after it ends ([afec0d7](https://github.com/Akylas/NativeScript/commit/afec0d78dc51c520ee0765b5f5be596ef989c772))
* **ios:** prevent animation while changing background effects ([43a32d4](https://github.com/Akylas/NativeScript/commit/43a32d4e8f20271ed8cd60f416b985d40866b7fe))
* **ios:** prevent not wanted changes to be animated ([c57548c](https://github.com/Akylas/NativeScript/commit/c57548cd5c058c51d22f6b71e622c4843ac6b56e))
* **ios:** property mask on 'undefined' during view disposal ([#10404](https://github.com/NativeScript/NativeScript/issues/10404)) ([212d086](https://github.com/Akylas/NativeScript/commit/212d086676a3246fd225f346af2ab920634a7643))
* **ios:** px properties parsing fix ([c8174a7](https://github.com/Akylas/NativeScript/commit/c8174a7ba2f1b726cf6e97278ab2cad40e451f0a))
* **ios:** regression from 8.7.0 ([9f7d741](https://github.com/Akylas/NativeScript/commit/9f7d7418c091423f56cea7576cb3c91b6738b5b2))
* **ios:** report error in animate if view is not init ([5053704](https://github.com/Akylas/NativeScript/commit/50537049586e3df00d2f253bd3b9d6100d37e533))
* **ios:** ScrollView with listeners removed scroll delegate ([#10432](https://github.com/NativeScript/NativeScript/issues/10432)) ([9fae9c4](https://github.com/Akylas/NativeScript/commit/9fae9c428185ed2f99b3710e3fe16cf060bc072b))
* **ios:** shadow does not consider z-index ([#10433](https://github.com/NativeScript/NativeScript/issues/10433)) ([5a4bb7c](https://github.com/Akylas/NativeScript/commit/5a4bb7c38cc694a312135e44022d5a4c8dc79d1c))
* **ios:** Shadow layer origin point update ([#10376](https://github.com/NativeScript/NativeScript/issues/10376)) ([f54ebbb](https://github.com/Akylas/NativeScript/commit/f54ebbb2bfc433afbf8479e9b044d18b4d6e1fbb))
* **ios:** shadow position after translate transform ([#10413](https://github.com/NativeScript/NativeScript/issues/10413)) ([c78ea79](https://github.com/Akylas/NativeScript/commit/c78ea79f0f63f49506120aeef3bc603426c155b2))
* **ios:** unset cached frame before updating origin point ([#10499](https://github.com/NativeScript/NativeScript/issues/10499)) ([3a486e5](https://github.com/Akylas/NativeScript/commit/3a486e540c3e1c74a80535e4bc480e375708c0f9))
* **ios:** use `requestlayoutIfNeeded` ([7630be5](https://github.com/Akylas/NativeScript/commit/7630be5de435d14e600e012e6bc69b003fffdf4e))
* **ios:** view not performing layout in some cases ([1ab2d99](https://github.com/Akylas/NativeScript/commit/1ab2d99eef80fa6cd9421a8db629a73439d03dde))
* **ios:** working `ApplicationSettings. getAllJSON` ([9779af4](https://github.com/Akylas/NativeScript/commit/9779af48be77da6fd19176f5f73ce276ddbc20b4))
* isLoaded default to false and not undefined ([4339484](https://github.com/Akylas/NativeScript/commit/43394847e910f4e1051d9ccbc0937ed91acd587f))
* leading support for debounce ([fac52be](https://github.com/Akylas/NativeScript/commit/fac52beac1983b43819c9a030556a07ee7bd0a85))
* maxWidth/maxHeight support for ImageAsset ([1582b05](https://github.com/Akylas/NativeScript/commit/1582b05579f277613ba54f37b72a86f57c8501fe))
* modal dialog root view now has the `rootView` as parent to be able to access the `ns-root` class which comply with css specs (for example to read root css variables) ([4730904](https://github.com/Akylas/NativeScript/commit/473090434fa916ba29c85f0c4ded86a8247b81c0))
* more debounce options ([12d2cd8](https://github.com/Akylas/NativeScript/commit/12d2cd8370df7de77282cfc6529d295a59e362fa))
* Observable only support one event name now ([b9d5ba1](https://github.com/Akylas/NativeScript/commit/b9d5ba1c53987a7bbc3a8430b327c96dac03eb8c))
* prevent breaking modal stack ([f90b043](https://github.com/Akylas/NativeScript/commit/f90b0432b75ca98efce3ba1d4d56da2fc2a6dc91))
* prevent crash if style property is malformed ([9140382](https://github.com/Akylas/NativeScript/commit/9140382e4712c6b4707c544c82e3eafd3a63ac57))
* prevent error with unneeded `_resumeNativeUpdates`. It can happens if a view is created while in batchUpdate ([9140b17](https://github.com/Akylas/NativeScript/commit/9140b1736947b247de4af67adc9717a2cf2c2250))
* prevent property change event while batch update or onLoaded ([05ac9ea](https://github.com/Akylas/NativeScript/commit/05ac9ea21a79ac3f843080d1d61926448fe9717d))
* print error stack when possible ([5d87404](https://github.com/Akylas/NativeScript/commit/5d874046bbd792a5b7f000be1e876f5bb8d7caa4))
* profile decorator fix ([e8a9a5b](https://github.com/Akylas/NativeScript/commit/e8a9a5bfee638e558e33539c5c10b124ff02c136))
* regression fix for [#10482](https://github.com/NativeScript/NativeScript/issues/10482) ([#10518](https://github.com/NativeScript/NativeScript/issues/10518)) ([92b2ff8](https://github.com/Akylas/NativeScript/commit/92b2ff83a038ece4ab4411cf983ee9e252bba141))
* regression fix on `PercentLength.toDevicePixels` ([f619c54](https://github.com/Akylas/NativeScript/commit/f619c54908f789772f1596d54fdae62ed84b23e2))
* remove maxSize thing from `ImageAsset.getImageAsync` as it is useless and impossible to "disable" ([8f809be](https://github.com/Akylas/NativeScript/commit/8f809beb3120944d6b5baf8002acec79686d57f7))
* rollback on some requestLayout optimisations ([d5aa194](https://github.com/Akylas/NativeScript/commit/d5aa1949758a895eab39b3b39d2b9a840ff940af))
* rootView is now a GridLayout and "user" rootView is added to it. That way when the "user" rootView is initiated it already has access to `.ns-root` and its variables ([5161bb3](https://github.com/Akylas/NativeScript/commit/5161bb38f9b312f49aabebf5fb25c632620d318a))
* rotate key frame animation fix ([f11ef85](https://github.com/Akylas/NativeScript/commit/f11ef851ff1c2023aafb0e37d0fcdf0e33e6cbe0))
* shared element transition now working with ListView/CollectionView/Pager ([a49e0db](https://github.com/Akylas/NativeScript/commit/a49e0dbf0ec17bfe555ab2af3d6242dda644edee))
* **testing:** e2e flag no longer needed, testID is now applicable in dev or prod builds ([#10396](https://github.com/NativeScript/NativeScript/issues/10396)) ([0a2b220](https://github.com/Akylas/NativeScript/commit/0a2b2202f311b6f9e67ef5ccd12feb02c6f4311a))
* **time-picker:** properly handle 0 on hour and minutes with valueChanged ([#10460](https://github.com/NativeScript/NativeScript/issues/10460)) ([4762699](https://github.com/Akylas/NativeScript/commit/4762699fa19fb81a766310724ad2cf0741b105c3))
* verticalAligment prop validated using its own type ([1cb6375](https://github.com/Akylas/NativeScript/commit/1cb637548034a7ca234a233040959b8dff921b24))
* **view:** modal stack tracking ([#10557](https://github.com/NativeScript/NativeScript/issues/10557)) ([84e1a67](https://github.com/Akylas/NativeScript/commit/84e1a67d6db89a0da6ce510356a30fa7a6e423c0))
* **winter-cg:** crypto ([#10580](https://github.com/NativeScript/NativeScript/issues/10580)) ([41f938c](https://github.com/Akylas/NativeScript/commit/41f938c5eec70395bc87262257b3e22bb1f8a949))
* working if FormData is not defined ([69084cb](https://github.com/Akylas/NativeScript/commit/69084cbd839afe976590760659c6ffce2394140e))
* wrong import fixes ([a287c95](https://github.com/Akylas/NativeScript/commit/a287c952e8c85a90ca8e56ba2685ad13d4661870))

### Performance Improvements

* **android:** batch setupAccessibleView calls to improve TTI ([#10391](https://github.com/NativeScript/NativeScript/issues/10391)) ([a4bfbda](https://github.com/Akylas/NativeScript/commit/a4bfbdaaa9f0438fd92e7bebcac63e839180f1b6))
* **android:** gridlayout with less JNI calls  ([#10402](https://github.com/NativeScript/NativeScript/issues/10402)) ([6dd441d](https://github.com/Akylas/NativeScript/commit/6dd441d6ba7d6c4b07596976451ebd1615fcd745))
* **core:** cache default view paddings on android ([#10390](https://github.com/NativeScript/NativeScript/issues/10390)) ([6f599fe](https://github.com/Akylas/NativeScript/commit/6f599fef1cae75103769993069f48c2a67a9095f))
* disable accessibility for layout views ([#10482](https://github.com/NativeScript/NativeScript/issues/10482)) ([3bd6d9b](https://github.com/Akylas/NativeScript/commit/3bd6d9b01e41dd0fa7379334dff925bf852cf8ef))
* improve attribute selectors by adding single listeners ([#10384](https://github.com/NativeScript/NativeScript/issues/10384)) ([bb83add](https://github.com/Akylas/NativeScript/commit/bb83addb5ce77906799fabb9a225b4814b109657))

### Reverts

* Revert "Auxiliary commit to revert individual files from a961a1c6a8ceb38802fdba9c9988c89286a3c50c" ([5f511e4](https://github.com/Akylas/NativeScript/commit/5f511e4c4b94778bd033b1ee57b02ea39505fbba))
* "fix(android): proper change of input interaction mode programmatically ([#10434](https://github.com/NativeScript/NativeScript/issues/10434)) ([#10512](https://github.com/NativeScript/NativeScript/issues/10512)) ([873f711](https://github.com/Akylas/NativeScript/commit/873f711a6b2c7b3ca50142f434cde49a2f2ebf49))
* "perf: improve attribute selectors by adding single listeners ([#10384](https://github.com/NativeScript/NativeScript/issues/10384))" ([7f2d51e](https://github.com/Akylas/NativeScript/commit/7f2d51e7d00884a1abd8a3995cef96f546661150))

## 8.5.9-core (2023-07-24)

### Features

* **file-system:** append, appendText & createFile ([#10285](https://github.com/NativeScript/NativeScript/issues/10285)) ([ab32aea](https://github.com/Akylas/NativeScript/commit/ab32aeaaa3715e5178f349646f14a632c771ce61))

### Bug Fixes

* **android:** improve content uri handling ([#10316](https://github.com/NativeScript/NativeScript/issues/10316)) ([77f252e](https://github.com/Akylas/NativeScript/commit/77f252e5516f48460f019998292f55ed19dc438c))
* **android:** native api usage fix after last changes ([5267a1f](https://github.com/Akylas/NativeScript/commit/5267a1f34cad045a0c0c81f15764ca40ba3e831e))
* **animation:** avoid uncaught reject on cancel ([#10309](https://github.com/NativeScript/NativeScript/issues/10309)) ([622f365](https://github.com/Akylas/NativeScript/commit/622f3659d8f531c35f790421a70cd927e4a52600))
* **animation:** css keyframes ([685d61c](https://github.com/Akylas/NativeScript/commit/685d61cf54c0fabb959edf5f5dcc01dec304005d))
* **application:** explicitly pass rootView to initRootView  ([#10345](https://github.com/NativeScript/NativeScript/issues/10345)) ([bd8e1b8](https://github.com/Akylas/NativeScript/commit/bd8e1b8e79f95335d4e813a6ab283b43e1a8d6e0))
* **Application:** getNativeApplication wrong ActivityThread ([#10326](https://github.com/NativeScript/NativeScript/issues/10326)) ([029ed4f](https://github.com/Akylas/NativeScript/commit/029ed4fe5d724e6a21dbb35d4683ad8290777c99)), closes [#10325](https://github.com/NativeScript/NativeScript/issues/10325)
* **Application:** inBackground handling & missing `once` ([#10307](https://github.com/NativeScript/NativeScript/issues/10307)) ([e430555](https://github.com/Akylas/NativeScript/commit/e430555cb24650ff1500867fefb86928d148d7f7))
* **Application:** orientation & systemAppearance root classes ([7f09b92](https://github.com/Akylas/NativeScript/commit/7f09b925bd093e7970e183f39dc73f3c32e9e466))
* **application:** restore AndroidApplication.on etc. ([#10336](https://github.com/NativeScript/NativeScript/issues/10336)) ([0804934](https://github.com/Akylas/NativeScript/commit/08049340b5ed18bdc8b9c3432e24106eddd17fe3))
* **application:** wrap native classes in initialisers ([#10335](https://github.com/NativeScript/NativeScript/issues/10335)) ([5359153](https://github.com/Akylas/NativeScript/commit/5359153a117e7efe93f433ac375b1495f7d29958)), closes [#10334](https://github.com/NativeScript/NativeScript/issues/10334)
* **Connectivity:** androidApp is not defined on SDK <28 ([#10324](https://github.com/NativeScript/NativeScript/issues/10324)) ([fce2e88](https://github.com/Akylas/NativeScript/commit/fce2e88cbabd4b55b3c7e4c62b109bdfe46c165c)), closes [#10323](https://github.com/NativeScript/NativeScript/issues/10323)
* **core:** android fix for EditableText cursor being placed correcly after text change ([525e65e](https://github.com/Akylas/NativeScript/commit/525e65e6cbf49756d9e5314131b318f16c1c4e6c))
* **core:** fix Page event overload resolution ([#10347](https://github.com/NativeScript/NativeScript/issues/10347)) ([2e732ae](https://github.com/Akylas/NativeScript/commit/2e732ae79fb5194f8a2b217699a996c1bd5449b8))
* **core:** unhandled error typings ([#10320](https://github.com/NativeScript/NativeScript/issues/10320)) ([c278430](https://github.com/Akylas/NativeScript/commit/c27843024050115c3ee058828ed6f404d513c07a))
* **datepicker:** max, min and date value binding handling ([#10343](https://github.com/NativeScript/NativeScript/issues/10343)) ([6effd55](https://github.com/Akylas/NativeScript/commit/6effd554f2295a557886a7cc2b9edaf2465043f9))
* early access to context and packageName ([#10321](https://github.com/NativeScript/NativeScript/issues/10321)) ([0873894](https://github.com/Akylas/NativeScript/commit/0873894a27cc2785c9b1db189d63e2cd2e2c60f7))
* ensure Application instance initialized early ([#10315](https://github.com/NativeScript/NativeScript/issues/10315)) ([0401b09](https://github.com/Akylas/NativeScript/commit/0401b09a43b3776e0a533e737b1aa49cafbe7961))
* **ios:** prevent usage of viewControllers that are being dismissed ([#10291](https://github.com/NativeScript/NativeScript/issues/10291)) ([963d024](https://github.com/Akylas/NativeScript/commit/963d0243de8b230a57da4ce0e0f7a742ac61901d))
* **root-layout:** check type for translate and scale values ([#10288](https://github.com/NativeScript/NativeScript/issues/10288)) ([874f6b6](https://github.com/Akylas/NativeScript/commit/874f6b6e65f79cd2723f5dcad405905381b122cb))
* **shared-transition:** race condition with interactive updates ([#10312](https://github.com/NativeScript/NativeScript/issues/10312)) ([25cc49d](https://github.com/Akylas/NativeScript/commit/25cc49d4f491dabd4aede8c1ca8a6f0e0b4955e8))
* **shared-transitions:** layer opacity set back to original on next tick ([#10310](https://github.com/NativeScript/NativeScript/issues/10310)) ([0956cb0](https://github.com/Akylas/NativeScript/commit/0956cb0f919bc385664559c269c56892f3cd1b4e))
* trigger css update when setting root classes ([#10328](https://github.com/NativeScript/NativeScript/issues/10328)) ([0903719](https://github.com/Akylas/NativeScript/commit/09037196d83ef610d8d8d4616a293545e2b4b24d))

## 8.5.3-core (2023-05-04)

### Bug Fixes

* **ios:** FormattedString and Span a11y font scale ([#10281](https://github.com/NativeScript/NativeScript/issues/10281)) ([a14becd](https://github.com/Akylas/NativeScript/commit/a14becdc6af723d6c1d30c35af3074f79ae2da0b))
* **shared-transition:** iOS snapshot opacity ([#10278](https://github.com/NativeScript/NativeScript/issues/10278)) ([b8a548f](https://github.com/Akylas/NativeScript/commit/b8a548f009354248a49236b2f7635c38f10b6247))

### Performance Improvements

* faster nativeView accessors ([#10279](https://github.com/NativeScript/NativeScript/issues/10279)) ([b7d02c9](https://github.com/Akylas/NativeScript/commit/b7d02c9c8616035674a0002754ce89408ba785a8))

## 8.5.2-core (2023-04-25)

### Features

* **file-system:** allow copy when opening a File ([#10274](https://github.com/NativeScript/NativeScript/issues/10274)) ([18bba2b](https://github.com/Akylas/NativeScript/commit/18bba2bc11743b8927109e6f01a9cc30e50e95a4))
* **file:** copy sync and async support ([#10273](https://github.com/NativeScript/NativeScript/issues/10273)) ([c63a50a](https://github.com/Akylas/NativeScript/commit/c63a50a19627159ca13c513fb8026f42f7c5918e))

### Bug Fixes

* ios animation fix for completion block being called too soon ([7faa62e](https://github.com/Akylas/NativeScript/commit/7faa62e3a9c7fa3248b6f534e779c92584697069))
* **ios:** resilience to nativeView access under edge cases ([#10276](https://github.com/NativeScript/NativeScript/issues/10276)) ([4551da0](https://github.com/Akylas/NativeScript/commit/4551da075b074f4c67da52f5279e2823169731ec))

## 8.5.1-core (2023-04-17)

### Features

* **ios:** new a11y properties for managing font scale ([#10260](https://github.com/NativeScript/NativeScript/issues/10260)) ([7aaa1d8](https://github.com/Akylas/NativeScript/commit/7aaa1d899dc786ccd6e9e73a4bd94674ddeba12e))
* **text:** valueFormatter for easy and flexible input auto-formatting ([#10264](https://github.com/NativeScript/NativeScript/issues/10264)) ([b3abc5f](https://github.com/Akylas/NativeScript/commit/b3abc5f5ae91d718995a366c13499dc98369d0ee))
* **transitions:** support zIndex on ios shared elements + support page props on android ([#10261](https://github.com/NativeScript/NativeScript/issues/10261)) ([f4b2722](https://github.com/Akylas/NativeScript/commit/f4b2722bf4259a6a7f0000b54c2d32712ab39117))

### Bug Fixes

* **core:** improve strong type src of Image ([#10265](https://github.com/NativeScript/NativeScript/issues/10265)) ([f549667](https://github.com/Akylas/NativeScript/commit/f54966707d97191e9658ac49c5d8570f87c1c1c5))
* **core:** RootLayout view and shade cover should animate in parallel ([#10256](https://github.com/NativeScript/NativeScript/issues/10256)) ([2b64e17](https://github.com/Akylas/NativeScript/commit/2b64e179a5ed54fb7d41d7b000be7d386c850c6b))
* **core:** sdkVersion and osVersion type adjustments ([#10269](https://github.com/NativeScript/NativeScript/issues/10269)) ([f8edee4](https://github.com/Akylas/NativeScript/commit/f8edee43a0b28f523d510c6dd7d54015a0bc7e10))
* **core:** unhandled error typings ([#10268](https://github.com/NativeScript/NativeScript/issues/10268)) ([0a2f002](https://github.com/Akylas/NativeScript/commit/0a2f002b57a9d1c0950534e8a90d0dc628dc3d31))

### Reverts

* "fix(core/platform): fixed types for sdkVersion and osVersion" ([#10270](https://github.com/NativeScript/NativeScript/issues/10270)) ([71c42f3](https://github.com/Akylas/NativeScript/commit/71c42f3a194ecda5130e74f19f9494afc66953d8)), closes [#10269](https://github.com/NativeScript/NativeScript/issues/10269)

## 8.5.0-core (2023-03-28)

### Features

* **core:** export foregroundEvent and backgroundEvent ([#10226](https://github.com/NativeScript/NativeScript/issues/10226)) ([6fd6943](https://github.com/Akylas/NativeScript/commit/6fd69436c8af2faaceb95ecb615179bc5b15ebcb))
* **core:** Shared Element Transitions ([#10022](https://github.com/NativeScript/NativeScript/issues/10022)) ([59369fb](https://github.com/Akylas/NativeScript/commit/59369fbc196a175570c5b731855707261b158e5c))
* **files:** read & write using js buffers ([#10093](https://github.com/NativeScript/NativeScript/issues/10093)) ([0173769](https://github.com/Akylas/NativeScript/commit/0173769badf704a61c7d8b2fe9902496e6e73785))
* **ios:** Swift Package Manager support in config ([#10252](https://github.com/NativeScript/NativeScript/issues/10252)) ([09832ad](https://github.com/Akylas/NativeScript/commit/09832ad7ab12c95f3b32184f1bb8e60183fb2342))

### Bug Fixes

* **android:** box shadow and border radius white border resolution ([#10125](https://github.com/NativeScript/NativeScript/issues/10125)) ([ea45758](https://github.com/Akylas/NativeScript/commit/ea457584639367763dd0227bb856976db8b99813))
* **android:** dialogs activity usage ([#10246](https://github.com/NativeScript/NativeScript/issues/10246)) ([7edd21a](https://github.com/Akylas/NativeScript/commit/7edd21a688f574fb0b008577bc6287faa6a4d2c6))
* **android:** improved native-api-usage after removing *. ([7fa6c9b](https://github.com/Akylas/NativeScript/commit/7fa6c9b13f27bb137103b57304cb495f326c10ef))
* **android:** knownFolders.externalDocuments improvement ([#10186](https://github.com/NativeScript/NativeScript/issues/10186)) ([a7f1305](https://github.com/Akylas/NativeScript/commit/a7f13057810ffd2181b3bc4575f98f6ae20be446))
* **android:** Label now defaults to vertical-align middle ([#10233](https://github.com/NativeScript/NativeScript/issues/10233)) ([a23c8bd](https://github.com/Akylas/NativeScript/commit/a23c8bda31eeeaa73ee04874ccd73fcf3eb2b2dd))
* **android:** missing native-api-usage ([7aa89fa](https://github.com/Akylas/NativeScript/commit/7aa89fa0ac1c0d5e807d6feab0b386288b7d3089))
* **android:** native-api-usage fix after last changes ([3713da0](https://github.com/Akylas/NativeScript/commit/3713da059fb4fbf9a3ddee07bab3d76921197e35))
* **android:** native-helper utils types are now correct ([#10231](https://github.com/NativeScript/NativeScript/issues/10231)) ([6779cdc](https://github.com/Akylas/NativeScript/commit/6779cdcb554f4374536a930563a7242d3364726a))
* **android:** path must be convex ([#10238](https://github.com/NativeScript/NativeScript/issues/10238)) ([89fc249](https://github.com/Akylas/NativeScript/commit/89fc2498800ea26f3896094847e8e14dca1f6db1)), closes [#10235](https://github.com/NativeScript/NativeScript/issues/10235)
* **android:** ScrollView BadParcelableException ([#10213](https://github.com/NativeScript/NativeScript/issues/10213)) ([a26a03e](https://github.com/Akylas/NativeScript/commit/a26a03eeb8883a85a0da44b5de2601547e987bcf))
* **core:** add equalityComparer to border-radius properties ([#10185](https://github.com/NativeScript/NativeScript/issues/10185)) ([571d515](https://github.com/Akylas/NativeScript/commit/571d5156ec9eb764afedde3944be3120d4d95208))
* **core:** added item template handling for external renderers ([#10196](https://github.com/NativeScript/NativeScript/issues/10196)) ([b993a83](https://github.com/Akylas/NativeScript/commit/b993a83f2371df8cb276474360d95e89d62e5ad5))
* **core:** allow CoreTypes declarations to be auto generated ([#10183](https://github.com/NativeScript/NativeScript/issues/10183)) ([9f76fea](https://github.com/Akylas/NativeScript/commit/9f76fea06e02a3f4de4fa69cbc73eb9aa0c8db47))
* **core:** android native-api-usage fix ([0b0cbe3](https://github.com/Akylas/NativeScript/commit/0b0cbe313f0ac6fde621e60ccd7396754f02a335))
* **core:** android native-api-usage fix ([db6dce1](https://github.com/Akylas/NativeScript/commit/db6dce13bfce060adbf0985acdef949a044892b3))
* **core:** android removed native TextTransform as it seems to be unused ([f3229e4](https://github.com/Akylas/NativeScript/commit/f3229e44abff1cb1895561ae35ab14a7f8f2afb0))
* **core:** android wrap init in trycatch to get possible error ([d863d61](https://github.com/Akylas/NativeScript/commit/d863d61228167eb1acd12311f83a829f124869e7))
* **core:** autofillTypes correction ([#10210](https://github.com/NativeScript/NativeScript/issues/10210)) ([fd35d6c](https://github.com/Akylas/NativeScript/commit/fd35d6c19cb853f2b2a0066f294b55950e9dc70f))
* **core:** classes .ns-light and .ns-dark apply to dialogs ([#10201](https://github.com/NativeScript/NativeScript/issues/10201)) ([48ef249](https://github.com/Akylas/NativeScript/commit/48ef2496849eb4e9b9d00057b35dc88e6dedfc64))
* **core:** CSS animation parsing ([#10245](https://github.com/NativeScript/NativeScript/issues/10245)) ([ab436db](https://github.com/Akylas/NativeScript/commit/ab436dbfe67f4750c77230527154858faaf9da6c))
* **core:** Frame to Page property propagation ([#10225](https://github.com/NativeScript/NativeScript/issues/10225)) ([4e62b00](https://github.com/Akylas/NativeScript/commit/4e62b00ddb84823654c864d32e298db286068733))
* **core:** improved handling for unsupported '!important' css rule ([#10243](https://github.com/NativeScript/NativeScript/issues/10243)) ([e560cb1](https://github.com/Akylas/NativeScript/commit/e560cb1374c0f3fa54a5b51b04b5073618603bcb))
* **core:** improved native-api-usage ([25febb8](https://github.com/Akylas/NativeScript/commit/25febb82954b71c4faf7f0326aaacb448a5f9898))
* **core:** native-api-usage fixes ([0007cc2](https://github.com/Akylas/NativeScript/commit/0007cc2a7de65380e018557efd3ba0c7a8bf67ae))
* **core:** Observable event types consistency ([#10181](https://github.com/NativeScript/NativeScript/issues/10181)) ([485fb61](https://github.com/Akylas/NativeScript/commit/485fb61947f6099756f3c1b51586f24ee95f0a43))
* **core:** remove unnecessary set of native text value change for formattedText ([5179f13](https://github.com/Akylas/NativeScript/commit/5179f13f1609f86ecfb000a724c2a3cead906336))
* **core:** RootLayout shade cover asynchronous execution ([#10228](https://github.com/NativeScript/NativeScript/issues/10228)) ([a19568c](https://github.com/Akylas/NativeScript/commit/a19568c0d08a142277f75cce2a3a30732d9bb032))
* **core:** unset css values of type Property ([#10199](https://github.com/NativeScript/NativeScript/issues/10199)) ([dcf6a36](https://github.com/Akylas/NativeScript/commit/dcf6a365cd574bd4dfa245ad6c38c22e551ef65c))
* ensure debugger code is removed in production ([9b82614](https://github.com/Akylas/NativeScript/commit/9b82614df2d225238a17459d7ea6e5ad79120a42))
* global declarations fix ([0859ce4](https://github.com/Akylas/NativeScript/commit/0859ce445042877af29f5b077b4be27b68ca2d84))
* global declarations fix ([#10247](https://github.com/NativeScript/NativeScript/issues/10247)) ([2f4c318](https://github.com/Akylas/NativeScript/commit/2f4c3182767a3b33af413be78314bceb8c7cce93))
* **ios:** embed systemAppearance handling ([#10219](https://github.com/NativeScript/NativeScript/issues/10219)) ([ee92512](https://github.com/Akylas/NativeScript/commit/ee925127465c223e1f64779372a0b449b1000155))
* **ios:** embedding sdk ([#10211](https://github.com/NativeScript/NativeScript/issues/10211)) ([9179ff8](https://github.com/Akylas/NativeScript/commit/9179ff861dcd72224ed79205406b328119784aa5))
* **ios:** guard against no nativeView in createBackgroundUIColor ([#10229](https://github.com/NativeScript/NativeScript/issues/10229)) ([9ed3c9b](https://github.com/Akylas/NativeScript/commit/9ed3c9b256e054b6ad482a16db9d6974e3b1435f))
* **ios:** race condition when setting preferredContentSize on view controller ([#10179](https://github.com/NativeScript/NativeScript/issues/10179)) ([ed14e24](https://github.com/Akylas/NativeScript/commit/ed14e242831dc28398bce62a78c7ee8d71f50bed))
* **ios:** race conditions with nativeView ([#10182](https://github.com/NativeScript/NativeScript/issues/10182)) ([c42c3c5](https://github.com/Akylas/NativeScript/commit/c42c3c5f2609afaa96bf874c427f0702f8cd5daa))
* **ios:** sdk embedding ([#10216](https://github.com/NativeScript/NativeScript/issues/10216)) ([0183f7e](https://github.com/Akylas/NativeScript/commit/0183f7e643ab7ac58d22e98707e13bf5f85f57c0))
* **ios:** support for a11y font scale ([#10207](https://github.com/NativeScript/NativeScript/issues/10207)) ([95f3772](https://github.com/Akylas/NativeScript/commit/95f3772e77bdfcc6c78ad7365a6c376bdbe01482))
* make span set text faster ([f90df18](https://github.com/Akylas/NativeScript/commit/f90df1821b29f4c1f37c97ac7a7b9686fab1f519))
* remove hacks from https://github.com/NativeScript/NativeScript/pull/10164 and https://github.com/NativeScript/NativeScript/pull/10044 ([c50b4df](https://github.com/Akylas/NativeScript/commit/c50b4df83e59a23c1106d4138e7c20155aa1901a))
* store old inlineStyle to allow reset of value if inlineStyle changes ([b76b08f](https://github.com/Akylas/NativeScript/commit/b76b08f22a5e07cc98aede183d50fc197ae0cbcf))

### Performance Improvements

* **android:** reduce java object creation ([#10129](https://github.com/NativeScript/NativeScript/issues/10129)) ([2da0064](https://github.com/Akylas/NativeScript/commit/2da0064f7c8de44d407c34d252070d793b50aaa8))

### Reverts

* "chore: ios relayout condition cleanup ([#10241](https://github.com/NativeScript/NativeScript/issues/10241))" ([8da1ca9](https://github.com/Akylas/NativeScript/commit/8da1ca910a4d7ab39d0af4b52c58fcd82b8393f6))

## 8.4.6-core (2023-01-19)

### Bug Fixes

* **core:** improve loaded/unloaded handling ([18b911e](https://github.com/Akylas/NativeScript/commit/18b911ed84173928d1d0cfc91be605e046a7e3d1))
* **core:** improve loaded/unloaded handling to be stable and consistent ([#10170](https://github.com/NativeScript/NativeScript/issues/10170)) ([c9e29aa](https://github.com/Akylas/NativeScript/commit/c9e29aa9af8b4b82cd259f8402fa11af4640f1b4))
* **core:** ScrollView event wiring sequencing improvement ([#10178](https://github.com/NativeScript/NativeScript/issues/10178)) ([75821ea](https://github.com/Akylas/NativeScript/commit/75821ead07dc69ffeb82c6bd6d6992095ee4fed1))
* **ios:** embedder usage of window ([#10167](https://github.com/NativeScript/NativeScript/issues/10167)) ([a69a9d6](https://github.com/Akylas/NativeScript/commit/a69a9d6921bd1df11b29c9b697bfb847a3885458))
* missing typings for intellisense ([fca4455](https://github.com/Akylas/NativeScript/commit/fca4455b2e684aa405cbd9a3a51b91238cb11215))

## 8.4.4-core (2023-01-09)

### Features

* **core:** new autoFillTypes ([33bae2f](https://github.com/Akylas/NativeScript/commit/33bae2f19267150b34091a9f7551255d95c620a2))
* **core:** new autoFillTypes for newUsername, newPassword and oneTimeCode ([#10159](https://github.com/NativeScript/NativeScript/issues/10159)) ([bff35e5](https://github.com/Akylas/NativeScript/commit/bff35e5163d126d44ae3b2828ed96dbdc6c2e6ef))

### Bug Fixes

* **android:** backwards compat Java cast Float to Long for ApplicationSettings.getNumber ([#10140](https://github.com/NativeScript/NativeScript/issues/10140)) ([7c1590a](https://github.com/Akylas/NativeScript/commit/7c1590abff0127fd1e5254648cdd1d8c7ab49869))
* **android:** openUrl ([#10161](https://github.com/NativeScript/NativeScript/issues/10161)) ([451c3cf](https://github.com/Akylas/NativeScript/commit/451c3cfe43a90be705bb6cc7abb220e674d1d906))
* **android:** WebView url and event handling ([#10147](https://github.com/NativeScript/NativeScript/issues/10147)) ([#10148](https://github.com/NativeScript/NativeScript/issues/10148)) ([8444087](https://github.com/Akylas/NativeScript/commit/84440876feb8a0b4bc5bc2309dc7a9315d1f91ef))
* **core:** update metadata filtering for IOS 16 ([#10133](https://github.com/NativeScript/NativeScript/issues/10133)) ([c461f1b](https://github.com/Akylas/NativeScript/commit/c461f1bb551a69e721548fa5ae6ca2c7601d0b87))
* **ios:** box shadow border radius ([#10142](https://github.com/NativeScript/NativeScript/issues/10142)) ([6948f7c](https://github.com/Akylas/NativeScript/commit/6948f7c03265ebf9b92a7d5f69bfbb4743ce449b))
* **ios:** navigatingTo event handling ([#10120](https://github.com/NativeScript/NativeScript/issues/10120)) ([a4f28b8](https://github.com/Akylas/NativeScript/commit/a4f28b831785c8cf6ba76c170fcd7a5628b12c35))
* **ios:** prevent layout in viewSafeAreaInsetsDidChange until first viewDidLayoutSubviews ([#10151](https://github.com/NativeScript/NativeScript/issues/10151)) ([760bbd0](https://github.com/Akylas/NativeScript/commit/760bbd06faf3acb7e0694acaf1ad3e029f1cd278))
* **ios:** prevent transitionCoordinator usage during modal presentation ([#10153](https://github.com/NativeScript/NativeScript/issues/10153)) ([d138ac0](https://github.com/Akylas/NativeScript/commit/d138ac000df2e2dfc890db992c39a4429e6ed8dc))
* **ios:** reset additional insets if they're zero ([#10134](https://github.com/NativeScript/NativeScript/issues/10134)) ([8b7d5ab](https://github.com/Akylas/NativeScript/commit/8b7d5ab5fc34fa7785b7801ca5de60e69bbf7392))
* **ios:** TextField keyboard handling with emoji, autofill, and shortcuts ([#10154](https://github.com/NativeScript/NativeScript/issues/10154)) ([00944bb](https://github.com/Akylas/NativeScript/commit/00944bb1b5b6f4cc8084cf7cde3db6448e28e0bd))
* **listview:** delegate handling removed from unloaded ([#10138](https://github.com/NativeScript/NativeScript/issues/10138)) ([04c3d9a](https://github.com/Akylas/NativeScript/commit/04c3d9a9795898386f26656018bc05cf697d09e2))
* **mac:** utils for mac catalyst ([#10157](https://github.com/NativeScript/NativeScript/issues/10157)) ([5b6e4d6](https://github.com/Akylas/NativeScript/commit/5b6e4d68986f22219c41f434f2bf51e714e485a5))
* **utils:** ios to filter out null values  ([#10117](https://github.com/NativeScript/NativeScript/issues/10117)) ([4723114](https://github.com/Akylas/NativeScript/commit/47231145acb851552d7990e5a75b66dd6d06fee8))

## 8.4.1-core (2022-11-30)

### ⚠ BREAKING CHANGES

* **core:** Method push will now handle arguments just like Array.prototype.push.
Certain existing methods will now return ObservableArray instance instead.
Callback arguments that contained an array argument themselves will now contain an ObservableArray argument.
* **android:** Exposes language and region values from android system configuration. If you were working around locale handling because this wasn't originally the case you can likely remove extra conditions as this should reflect more accurately now.
* **ios:** tapData.getX() and tapData.getY() will now return correctly in DIP, so any extra conversions (like calling toDevicePixels) twice must be changed.
* **core:** When using `navigatingToEvent` event.entry, the `backstackEntry` object is now returned which has an `entry` property on it if you still need it.

### Features

* **android:** runOnMain, postFrameCallback & removeFrameCallback ([#9943](https://github.com/NativeScript/NativeScript/issues/9943)) ([49343cb](https://github.com/Akylas/NativeScript/commit/49343cb9b4ad5be895dd25ef28361b3a100d9249))
* **android:** support drawable in ImageSource ([#10098](https://github.com/NativeScript/NativeScript/issues/10098)) ([75eefa6](https://github.com/Akylas/NativeScript/commit/75eefa669deaea09f79e4a15593f1af985a0fea1))
* **android:** use NestedScrollView for vertical ScrollView ([#9199](https://github.com/NativeScript/NativeScript/issues/9199)) ([cfaa813](https://github.com/Akylas/NativeScript/commit/cfaa8134b0a5e4163285b1253ac4094f1bdf5b3e))
* **application:** expose `inBackground` and `suspended` ([#9897](https://github.com/NativeScript/NativeScript/issues/9897)) ([8987bab](https://github.com/Akylas/NativeScript/commit/8987babb0801fbc3320bf50877bebefb9702a292))
* **core:** `knownFolders.externalDocuments()` ([1a019e1](https://github.com/Akylas/NativeScript/commit/1a019e1f288c74d41397cf69aa39e4ae39e10405))
* **core:** iterable ObservableArray ([#9824](https://github.com/NativeScript/NativeScript/issues/9824)) ([df74a8b](https://github.com/Akylas/NativeScript/commit/df74a8baa8d815207c4edfa3909f57f497a9e63a))
* **core:** make font style, weight, scale params optional ([#9993](https://github.com/NativeScript/NativeScript/issues/9993)) ([4b0c812](https://github.com/Akylas/NativeScript/commit/4b0c8127073d91d15b36a1428fd23b4cf702cae9))
* **core:** maxLines support for all text components ([#9884](https://github.com/NativeScript/NativeScript/issues/9884)) ([7ff7233](https://github.com/Akylas/NativeScript/commit/7ff7233737e2bc12849e922bc2335d3756ff353d))
* **core:** support css font-variation-settings ([#9995](https://github.com/NativeScript/NativeScript/issues/9995)) ([a5e3e22](https://github.com/Akylas/NativeScript/commit/a5e3e223dd037a4be8f2d5c9f2bdf3a1b5bc7d27))
* **core:** support for external XML UI compilers ([#10008](https://github.com/NativeScript/NativeScript/issues/10008)) ([75503ef](https://github.com/Akylas/NativeScript/commit/75503ef1107953737f05b8939d724fa29fac3fc4))
* **files:** knownFolders.externalDocuments for android ease of use ([#9966](https://github.com/NativeScript/NativeScript/issues/9966)) ([e51e945](https://github.com/Akylas/NativeScript/commit/e51e9454006f19d15495ec4946455f5b8f7c1acc))
* **HtmlView:** selectable property ([#10057](https://github.com/NativeScript/NativeScript/issues/10057)) ([ca9c092](https://github.com/Akylas/NativeScript/commit/ca9c0928d00c97a757c33060f9fde2f6294485b5))
* **ios:** Utils.getRootViewController ([29004d9](https://github.com/Akylas/NativeScript/commit/29004d9048ab84d774d6978e685ea7b0e47b625b))
* **mac:** support for Mac Catalyst with ui-mobile-base ([fc77c92](https://github.com/Akylas/NativeScript/commit/fc77c92e114c8a021a6608bb9ff3c8857263abbd))
* **mac:** support for Mac Catalyst with ui-mobile-base ([cd69379](https://github.com/Akylas/NativeScript/commit/cd69379b8967ba1ea39f0272b003ffda09b4b8e2))
* **RootLayout:** add opened and closed events ([#9893](https://github.com/NativeScript/NativeScript/issues/9893)) ([7b11b6a](https://github.com/Akylas/NativeScript/commit/7b11b6acfe1e71b803ef65f98b8ac5f271928d56))
* TypeScript 4.8+ support and NativeClass decorator improvements ([#10081](https://github.com/NativeScript/NativeScript/issues/10081)) ([7f069a7](https://github.com/Akylas/NativeScript/commit/7f069a7093087a060274e59f53f68db879846b3e))
* **Utils:** add dataSerialize and dataDeserialize for iOS ([2250c7f](https://github.com/Akylas/NativeScript/commit/2250c7fc6afb913762228441755f28c5dcab7fe6))
* **Utils:** dataSerialize, dataDeserialize, numberHasDecimals, numberIs64Bit ([cab5947](https://github.com/Akylas/NativeScript/commit/cab59473f39066abb667d2039d5333be93488035))
* **utils:** dismissKeyboard, copyToClipboard, setWindowBackgroundColor, getCurrentActivity and getResource ([#10089](https://github.com/NativeScript/NativeScript/issues/10089)) ([2e1d2c1](https://github.com/Akylas/NativeScript/commit/2e1d2c175b6bcd15b70c4fd119b3cc303c3799f6))
* **webview:** adds iosAllowInlineMediaPlayback property ([#10014](https://github.com/NativeScript/NativeScript/issues/10014)) ([4a0e1c9](https://github.com/Akylas/NativeScript/commit/4a0e1c9aa18ccb865ce5e3a3e5aa9b3d050562e2))

### Bug Fixes

* `externalDocuments` fix ([40ed258](https://github.com/Akylas/NativeScript/commit/40ed2588219c124d5b783d1c5676676f78ce761a))
* allow animation of any prop ([1f6d428](https://github.com/Akylas/NativeScript/commit/1f6d428bf86c1feeaf2afe245bef9653cf8d0ca7))
* **android:** application fallback for `startActivity` ([#10062](https://github.com/NativeScript/NativeScript/issues/10062)) ([f3a5c16](https://github.com/Akylas/NativeScript/commit/f3a5c16530f1b247f59960cc20280f65fdfc1715))
* **android:** ApplicationSettings return precise stored numbers ([#10094](https://github.com/NativeScript/NativeScript/issues/10094)) ([fd98690](https://github.com/Akylas/NativeScript/commit/fd9869094e9f36959df5d59399ffe684be8d8e5f))
* **android:** connectivity reporting none on resume ([#9915](https://github.com/NativeScript/NativeScript/issues/9915)) ([413fa2e](https://github.com/Akylas/NativeScript/commit/413fa2eb4b044163a701614a596a06512082ba8a))
* **android:** content uri handling improvements ([#9936](https://github.com/NativeScript/NativeScript/issues/9936)) ([9fcd440](https://github.com/Akylas/NativeScript/commit/9fcd440690e894c80ca88a528309f619fc8997f9))
* **android:** content uri handling improvements ([#9936](https://github.com/NativeScript/NativeScript/issues/9936)) ([99480c0](https://github.com/Akylas/NativeScript/commit/99480c06db1debb9eeb6cae21702eb83ef9e4dd5))
* **android:** content uri handling improvements ([#9936](https://github.com/NativeScript/NativeScript/issues/9936)) ([7bbb77a](https://github.com/Akylas/NativeScript/commit/7bbb77ad8641d2bb03a93d7df6b77ab305aa2eba))
* **android:** CSS style not working properly in modal pages ([#10070](https://github.com/NativeScript/NativeScript/issues/10070)) ([608d3b9](https://github.com/Akylas/NativeScript/commit/608d3b929608ab2c3b4c22a0f1ce7f2e861434c9))
* **android:** device language and region from system configuration. ([#9868](https://github.com/NativeScript/NativeScript/issues/9868)) ([ad01e6b](https://github.com/Akylas/NativeScript/commit/ad01e6b990e14f36e637886b2e0e0c9594daf246))
* **android:** file manipulation threw exception inside worker ([#10076](https://github.com/NativeScript/NativeScript/issues/10076)) ([25c862e](https://github.com/Akylas/NativeScript/commit/25c862e148668e2b6a4b7fb438615f9cc2e7ef56))
* **android:** file system normalizePath ([#10077](https://github.com/NativeScript/NativeScript/issues/10077)) ([497a9db](https://github.com/Akylas/NativeScript/commit/497a9dbaeaf953248fcb67d26196ddf7deabc8d8))
* **android:** font icons had incorrect fallback size ([#9914](https://github.com/NativeScript/NativeScript/issues/9914)) ([e8bed44](https://github.com/Akylas/NativeScript/commit/e8bed44f5b82fda088aa9f6033a9ec76825811ee))
* **android:** FragmentCallbacksImplementation memory leak ([#9977](https://github.com/NativeScript/NativeScript/issues/9977)) ([286d36b](https://github.com/Akylas/NativeScript/commit/286d36b03b2a6a740ed9a93d83ad36c7f649f6c9))
* **android:** FragmentClass memory leak ([#9973](https://github.com/NativeScript/NativeScript/issues/9973)) ([59f9235](https://github.com/Akylas/NativeScript/commit/59f923528d2560a1c1751ecb9048f9498fdd3798))
* **android:** FragmentClass memory leak ([#9983](https://github.com/NativeScript/NativeScript/issues/9983)) ([0548aaf](https://github.com/Akylas/NativeScript/commit/0548aaf8da68f104d87d3e36ecc53b31e73028aa))
* **android:** memory leak with EditableTextBase ([#10052](https://github.com/NativeScript/NativeScript/issues/10052)) ([501d310](https://github.com/Akylas/NativeScript/commit/501d310431b19e28f75e27b16a404324a960a79a))
* **android:** modal status bar props applied to wrong window ([#10049](https://github.com/NativeScript/NativeScript/issues/10049)) ([6934645](https://github.com/Akylas/NativeScript/commit/6934645423eba2494c0aa5aed76b0c4b3b768be8))
* **android:** normalize for API >= 26 ([#10083](https://github.com/NativeScript/NativeScript/issues/10083)) ([e687e9d](https://github.com/Akylas/NativeScript/commit/e687e9d75650a1fc875d31fa30e4f43455e7c197))
* **android:** potential navigation crash ([#9996](https://github.com/NativeScript/NativeScript/issues/9996)) ([ca3d9bd](https://github.com/Akylas/NativeScript/commit/ca3d9bdc13b86df2bbecb34e07141cea8fc9af7c))
* **android:** prevent flashing activity on app start ([#9190](https://github.com/NativeScript/NativeScript/issues/9190)) ([6a9484a](https://github.com/Akylas/NativeScript/commit/6a9484aaa8e77cf97426e102b2784988847fb521))
* **android:** race condition on offBackgroundColor view change detection ([#9922](https://github.com/NativeScript/NativeScript/issues/9922)) ([464ea18](https://github.com/Akylas/NativeScript/commit/464ea18737dc5976f66e0f5eee7dd0c66fe2a694))
* **android:** shared SDK_VERSION ([#10090](https://github.com/NativeScript/NativeScript/issues/10090)) ([0226f47](https://github.com/Akylas/NativeScript/commit/0226f47f8d3b36fc2cc48cd1895065214fc82acb))
* **android:** tappable spans aren't visible on single-line labels ([#10055](https://github.com/NativeScript/NativeScript/issues/10055)) ([5765707](https://github.com/Akylas/NativeScript/commit/57657075ca1a307556c64c13df5854ec3d378e5e))
* **android:** text transform capitalize is capitalizing after apostrophe ([#10029](https://github.com/NativeScript/NativeScript/issues/10029)) ([e3255c0](https://github.com/Akylas/NativeScript/commit/e3255c00d88d251174b109fbadaa5345e23393f3))
* **android:** Textfield focus fix ([#9885](https://github.com/NativeScript/NativeScript/issues/9885)) ([fbd1e23](https://github.com/Akylas/NativeScript/commit/fbd1e23c1c9b63ddcab9b25812c10e62ca9f6da6))
* **android:** WeakRef race condition on timers ([#10066](https://github.com/NativeScript/NativeScript/issues/10066)) ([1a5faec](https://github.com/Akylas/NativeScript/commit/1a5faecba0b0c9194cc0d3924edc5df5edcb21a7))
* **android:** webview href schemes threw 'net::ERR_UNKNOWN_URL_SCHEME' ([#10048](https://github.com/NativeScript/NativeScript/issues/10048)) ([655f3a4](https://github.com/Akylas/NativeScript/commit/655f3a45c1179088863c8304fd6d72df657ec013))
* **animations:** error handling ([36ad24c](https://github.com/Akylas/NativeScript/commit/36ad24c037ea06111beb4176bb3836a319307b81))
* **builder:** property parentsMatch is invalid or does not exist ([#10020](https://github.com/NativeScript/NativeScript/issues/10020)) ([405904c](https://github.com/Akylas/NativeScript/commit/405904c5428078290c771acdaa7d4b866ca1c8e7))
* **color:** floating point color values ([66e8e39](https://github.com/Akylas/NativeScript/commit/66e8e39f1e09c39a19372512ab90bd28d59691d1))
* **core:** (TESTING) ensure getRootView always return the correct view ([2d5848e](https://github.com/Akylas/NativeScript/commit/2d5848eaa8e5ef70cf321f490febd9b3e54d31b0))
* **core:** `systemAppearance` fix for when called early ([e245f81](https://github.com/Akylas/NativeScript/commit/e245f81a22b0f50793f8a39a2b02887470fb4e1f))
* **core:** Added ObservableArray constructor declarations to allow setting multiple arguments ([#9980](https://github.com/NativeScript/NativeScript/issues/9980)) ([d82f3d9](https://github.com/Akylas/NativeScript/commit/d82f3d990dcbf84c0e6e32d98f2fb19a6532615d))
* **core:** allow passing fontWeight as a number ([c8e3e54](https://github.com/Akylas/NativeScript/commit/c8e3e54f2dc06a1e0c5089224bc3a2e9bd78d5b0))
* **core:** allow View subclass to force onLayoutChangeListener ([#9886](https://github.com/NativeScript/NativeScript/issues/9886)) ([6ccf5a2](https://github.com/Akylas/NativeScript/commit/6ccf5a22e61b4950f549929f2e5c432bf3e03324))
* **core:** android fix for `knownFolders.externalDocuments()` in some cases (emulator) ([b872b8a](https://github.com/Akylas/NativeScript/commit/b872b8aadc56475095ef7b1305f8a07c11fb2a84))
* **core:** android fix for `path.normalize` ([835857c](https://github.com/Akylas/NativeScript/commit/835857c49b592e480f446e4d984871c698db4961))
* **core:** android native-api-usage ([e11be2e](https://github.com/Akylas/NativeScript/commit/e11be2eea9a83a0e46363e2023fb880647f4d534))
* **core:** android native-api-usage add missing for ImageSource ([6465aac](https://github.com/Akylas/NativeScript/commit/6465aac922aef7c3d93192ea371f2694cde1464a))
* **core:** android native-api-usage fix after merge ([42be033](https://github.com/Akylas/NativeScript/commit/42be03300a22ed6f0e0fb13d23f1049320ac61c9))
* **core:** android refactor EditableTextBase to allow sub classes to change/augment ([e306cbb](https://github.com/Akylas/NativeScript/commit/e306cbbe93654681107cde0ae0498777efadb426))
* **core:** android wrong background state + current value accessors ([#9883](https://github.com/NativeScript/NativeScript/issues/9883)) ([58a7206](https://github.com/Akylas/NativeScript/commit/58a720699fe012b382446533f29ef3382ddd862e))
* **core:** circular imports of SDK_VERSION ([82d60ae](https://github.com/Akylas/NativeScript/commit/82d60ae057f0f14718c1065f51bf3edbf36ad96a))
* **core:** Color.isValid returned true for null/undefined ([#10040](https://github.com/NativeScript/NativeScript/issues/10040)) ([9091e43](https://github.com/Akylas/NativeScript/commit/9091e43f036139a8f1ad2958eb0b385025204813))
* **core:** correct typings in ObservableArray ([#9961](https://github.com/NativeScript/NativeScript/issues/9961)) ([01643f5](https://github.com/Akylas/NativeScript/commit/01643f513ed3e71b98c3a0bdd9fa15f0b1b7970d))
* **core:** correctly normalize path on all android versions ([e4f8ce0](https://github.com/Akylas/NativeScript/commit/e4f8ce0ef8a1ff50c48d41ac9dcf5e3c5bff8e3c))
* **core:** correctly polyfill tslib ([#9894](https://github.com/NativeScript/NativeScript/issues/9894)) ([20efd36](https://github.com/Akylas/NativeScript/commit/20efd3605e5c8c654bba26f6d1f1423d7af51747))
* **core:** deprecation notes for WeakRef clear and get ([3019181](https://github.com/Akylas/NativeScript/commit/30191816f2fe1c9ec54bdbcbe9aa4eaac9ba11de))
* **core:** ellipsis at the end for Labels with maxLines ([#10005](https://github.com/NativeScript/NativeScript/issues/10005)) ([6c60eab](https://github.com/Akylas/NativeScript/commit/6c60eab870026e970a5fee1e064e2ee8ccde476a))
* **core:** ensure platforms/android/core.aar is not included in pack ([a1dff9a](https://github.com/Akylas/NativeScript/commit/a1dff9a1dbc5f8a32fffe28fa1d950ec12576061))
* **core:** ensure we clear the webview client on android ([dad92a4](https://github.com/Akylas/NativeScript/commit/dad92a4d7e713ab6a79229b4c7f65d1d9508f0a0))
* **core:** errors get swallowed if thrown inside async event functions ([#10030](https://github.com/NativeScript/NativeScript/issues/10030)) ([bdade0f](https://github.com/Akylas/NativeScript/commit/bdade0f0d5bbe2fdbce0b697741a748a16f6137c))
* **core:** font-weight allow passing number ([#10072](https://github.com/NativeScript/NativeScript/issues/10072)) ([5f3f1ac](https://github.com/Akylas/NativeScript/commit/5f3f1ace280d7da302977ccb10d2525a48b65cf1))
* **core:** FormattedString.spans is now restored ([#9960](https://github.com/NativeScript/NativeScript/issues/9960)) ([0477044](https://github.com/Akylas/NativeScript/commit/0477044d6f41003d679ef3dd655643b380dca188))
* **core:** Frame `navigatingToEvent` event fix ([265a575](https://github.com/Akylas/NativeScript/commit/265a575602a8cad7fec73fec65fc9f5a0680f51f))
* **core:** import fix ([45dcada](https://github.com/Akylas/NativeScript/commit/45dcada01ab6f44d7fdc9d28f3b40ce1015053bc))
* **core:** ios fix tap gesture not working ([0024bb7](https://github.com/Akylas/NativeScript/commit/0024bb79c356570d8f69454ed52c0c315a09aea8))
* **core:** iOS Frame `navigatingTo` event not fired ([8c54a8b](https://github.com/Akylas/NativeScript/commit/8c54a8b9f3b57f0a6a290927f7125f3b4128fa5d))
* **core:** metadata filtering ([#9946](https://github.com/NativeScript/NativeScript/issues/9946)) ([4a5e2e2](https://github.com/Akylas/NativeScript/commit/4a5e2e2ac0876a6697ebb468e2825f358c3a63e3))
* **core:** missing export for `maxLinesProperty` ([#9965](https://github.com/NativeScript/NativeScript/issues/9965)) ([c8bff74](https://github.com/Akylas/NativeScript/commit/c8bff74e6712a286a335716c49255af6023157fb))
* **core:** missing export for maxLinesProperty ([e7091c4](https://github.com/Akylas/NativeScript/commit/e7091c4d831e10f197f5532151099a86da211931))
* **core:** modal css apply fix ([90ba69b](https://github.com/Akylas/NativeScript/commit/90ba69b8ab4b2f51ad412a833ec0541c55c644ff))
* **core:** navigatingToEvent allows access to resolvedPage now ([#9954](https://github.com/NativeScript/NativeScript/issues/9954)) ([38142a6](https://github.com/Akylas/NativeScript/commit/38142a6aebee4c66ce0ae189dd68e93ee2be2db8))
* **core:** prevent a circular reference because of `SDK_VERSION ([318bc1a](https://github.com/Akylas/NativeScript/commit/318bc1adc3e771935286a473d04d0cfc72f7afed))
* **core:** prevent a circular reference because of `SDK_VERSION` ([#10097](https://github.com/NativeScript/NativeScript/issues/10097)) ([c957b48](https://github.com/Akylas/NativeScript/commit/c957b487a8d98e529df5432aed5b7126a83a6020))
* **core:** prevent actionBar being created if not used ([c634b3c](https://github.com/Akylas/NativeScript/commit/c634b3c5a3d2459f168744eee353ad0079eb5eb1))
* **core:** prevent actionBar being created if not used ([0f897d4](https://github.com/Akylas/NativeScript/commit/0f897d4d9953bd361b028349dbee482f74500a8d))
* **core:** trace log using a wrong parameter ([#9951](https://github.com/NativeScript/NativeScript/issues/9951)) ([cd5d2c2](https://github.com/Akylas/NativeScript/commit/cd5d2c2f4df79cc2b7026d86c386a60adda414f6))
* **core:** try to prevent unwanted requestLayout on views creations ([1f1987f](https://github.com/Akylas/NativeScript/commit/1f1987fe34ea682b38b975ad2b8fb254809b63f1))
* **core:** WeakRef deprecation notes ([b83ed39](https://github.com/Akylas/NativeScript/commit/b83ed3939b68c0e9ee06ee9135e970969d846616))
* **core:** WeakRef typings to include deref ([#10006](https://github.com/NativeScript/NativeScript/issues/10006)) ([3bf1640](https://github.com/Akylas/NativeScript/commit/3bf164073bc1dc941ea5d33df74059afc6107c93))
* **core:** windows build ([#10056](https://github.com/NativeScript/NativeScript/issues/10056)) ([7860d51](https://github.com/Akylas/NativeScript/commit/7860d515a8f29fd9dcf07c151b7c606cb3c54e69))
* dont apply system classes in `className`. It will be handled through css scopes ([908ef16](https://github.com/Akylas/NativeScript/commit/908ef1667b29d52bcf1fca8f3c7b3d778b3893b9))
* ensure reusable ProxyViewContainer re-adds native children ([#9882](https://github.com/NativeScript/NativeScript/issues/9882)) ([0a082b3](https://github.com/Akylas/NativeScript/commit/0a082b340305eac9b9b509225dcd1d5f58766be7))
* ensure we still remove views from native tree if they dont have an N parent ([2c8f6ad](https://github.com/Akylas/NativeScript/commit/2c8f6addb30bacfd1e4d2cebae1070467afdde45))
* export 'dataSerialize' from utils ([#9909](https://github.com/NativeScript/NativeScript/issues/9909)) ([a85a72d](https://github.com/Akylas/NativeScript/commit/a85a72d961185eb311df030b515decb4813d41c8))
* fix back accessibility while only activating it when necessary ([ff5c53b](https://github.com/Akylas/NativeScript/commit/ff5c53b5c85425236ddece2c1608c293302ae386))
* incorrect font icon size conversion to device pixels. ([#9910](https://github.com/NativeScript/NativeScript/issues/9910)) ([d3718e5](https://github.com/Akylas/NativeScript/commit/d3718e5e5f6e6b241b2dec392cf53e65e869d6f5))
* **ios:** additional safe area insets were miscalculated if already set ([#9991](https://github.com/NativeScript/NativeScript/issues/9991)) ([be6efc3](https://github.com/Akylas/NativeScript/commit/be6efc306708d65405e9cc89e4ef422feeb89df1))
* **ios:** animation layer resilience ([#10060](https://github.com/NativeScript/NativeScript/issues/10060)) ([6cabcab](https://github.com/Akylas/NativeScript/commit/6cabcab0d59c7eeec510fdb37de8eaf52bc8791c))
* **ios:** apply proper border radius to box shadow and view sublayers ([#9881](https://github.com/NativeScript/NativeScript/issues/9881)) ([b7e6128](https://github.com/Akylas/NativeScript/commit/b7e612857681f8d778c42b3df211494067f911fd))
* **ios:** Color.fromIosColor returns wrong value ([#10059](https://github.com/NativeScript/NativeScript/issues/10059)) ([b7d340f](https://github.com/Akylas/NativeScript/commit/b7d340f69b9a64f44d6cc4a2a405ecfbbed78899))
* **ios:** do not convert tap event data to device pixels twice ([#9935](https://github.com/NativeScript/NativeScript/issues/9935)) ([3681fd4](https://github.com/Akylas/NativeScript/commit/3681fd43840e67aaccf6e2b2d5c47d72a09b78b4))
* **ios:** ensure `PFLAG_FORCE_LAYOUT` before `performLayout` ([#10011](https://github.com/NativeScript/NativeScript/issues/10011)) ([e7e3bd2](https://github.com/Akylas/NativeScript/commit/e7e3bd2bb0bab02026508c0eb6722c5bda8081b4))
* **ios:** ensure autocorrect not applied silently on IOS16 ([#10032](https://github.com/NativeScript/NativeScript/issues/10032)) ([40b9e35](https://github.com/Akylas/NativeScript/commit/40b9e3578f895b202100242643a5a7319bf528f7))
* **ios:** ensure view layout when using large titles ([#10044](https://github.com/NativeScript/NativeScript/issues/10044)) ([d625141](https://github.com/Akylas/NativeScript/commit/d625141c4271293835e4d53c72d1f19a07388671))
* **ios:** frame navigatingTo event ([#10096](https://github.com/NativeScript/NativeScript/issues/10096)) ([6148955](https://github.com/Akylas/NativeScript/commit/6148955335f164aa160e719a98ad811b4d006560))
* **ios:** guard accessing actionbar ([#10033](https://github.com/NativeScript/NativeScript/issues/10033)) ([1c82d19](https://github.com/Akylas/NativeScript/commit/1c82d194557e3aa6f29cba34a10af540eda7e37d))
* **ios:** handle tap and longpress gesture conflict ([#10004](https://github.com/NativeScript/NativeScript/issues/10004)) ([64755cb](https://github.com/Akylas/NativeScript/commit/64755cb348b316fa80534275c4c72843ba1cc902))
* **ios:** label measure correct height when using custom numberOfLines ([#9945](https://github.com/NativeScript/NativeScript/issues/9945)) ([2ff0891](https://github.com/Akylas/NativeScript/commit/2ff0891f933dc0e717efce7e5daea8f8488d5fa9))
* **ios:** label measure correct height when using custom numberOfLines ([#9945](https://github.com/NativeScript/NativeScript/issues/9945)) ([441d1b4](https://github.com/Akylas/NativeScript/commit/441d1b4c0f48cf0d0b79c8599b4e1fe2a4ca1d9d))
* **ios:** ListView _prepareCell null safety ([#10001](https://github.com/NativeScript/NativeScript/issues/10001)) ([56f861d](https://github.com/Akylas/NativeScript/commit/56f861df20212f2107bf2c4e0989ab4debadf423))
* **ios:** memory leak after using 'showModal' passing any Page as parameter ([#9939](https://github.com/NativeScript/NativeScript/issues/9939)) ([4db4e4a](https://github.com/Akylas/NativeScript/commit/4db4e4af275048fb58ef0fab3a2ac7e3758ba783))
* **ios:** memory leak after using 'showModal' passing any Page as parameter ([#9939](https://github.com/NativeScript/NativeScript/issues/9939)) ([0631f49](https://github.com/Akylas/NativeScript/commit/0631f49f44f5b57f47afdc4e66e552788999f709))
* **ios:** memory leak after using the 'presentViewControllerNavigation' ([#9934](https://github.com/NativeScript/NativeScript/issues/9934)) ([957af32](https://github.com/Akylas/NativeScript/commit/957af328597c53a38a48c9c1133419a55cbbea25))
* **ios:** memory leak after using the 'presentViewControllerNavigation' ([#9934](https://github.com/NativeScript/NativeScript/issues/9934)) ([edc2e6a](https://github.com/Akylas/NativeScript/commit/edc2e6a5de3a02a6032d78efb4252ebd9202a6d0))
* **ios:** page isRunningLayout ([#10078](https://github.com/NativeScript/NativeScript/issues/10078)) ([614dafb](https://github.com/Akylas/NativeScript/commit/614dafb42bd94c79adfba4d96143ae8b4d862403))
* **ios:** prevent creating `ActionBar` when not needed ([#10017](https://github.com/NativeScript/NativeScript/issues/10017)) ([fc6f843](https://github.com/Akylas/NativeScript/commit/fc6f843fdaa19927286003516401167c237b1a54))
* **ios:** proper disposal and recreation of iOS native views ([#9879](https://github.com/NativeScript/NativeScript/issues/9879)) ([f548fdc](https://github.com/Akylas/NativeScript/commit/f548fdc73512bb74e7ec500550e2db0166e7237b))
* **ios:** properties lineHeight and letterSpacing did not apply to spans ([#10025](https://github.com/NativeScript/NativeScript/issues/10025)) ([e4b5cdf](https://github.com/Akylas/NativeScript/commit/e4b5cdf7df86be9d0ea2730438e134bdaf1c3a1a))
* **ios:** segmented bar nativeView check ([#10023](https://github.com/NativeScript/NativeScript/issues/10023)) ([1ad8099](https://github.com/Akylas/NativeScript/commit/1ad8099cd84dd1cd38d2b06d9996e9a438a41277))
* **ios:** stability around canceling an animation ([b8d5372](https://github.com/Akylas/NativeScript/commit/b8d537250f5fc7e0b2a1008d049b564e302b783a))
* **ios:** tab page navigation when showing dialog messages ([#10075](https://github.com/NativeScript/NativeScript/issues/10075)) ([0f7e4ed](https://github.com/Akylas/NativeScript/commit/0f7e4ed0f30e9dfbde129b5f3ae648a15946bcf5))
* **ios:** tapping on span does not emit linkTap event ([#10028](https://github.com/NativeScript/NativeScript/issues/10028)) ([ab3416d](https://github.com/Akylas/NativeScript/commit/ab3416d4d0175a42f4f28978b01f6ca581c7b82d))
* **live-sync:** navigation history is now maintained ([#9889](https://github.com/NativeScript/NativeScript/issues/9889)) ([665009b](https://github.com/Akylas/NativeScript/commit/665009b863c0589bf5921f512e3878471255ea82))
* revert "fix(ios): not responding after rotation ([#9931](https://github.com/NativeScript/NativeScript/issues/9931))" ([#9984](https://github.com/NativeScript/NativeScript/issues/9984)) ([54d3006](https://github.com/Akylas/NativeScript/commit/54d300666a891820a0cae8ec1b410f90c77f96a6))
* **RootLayout:** resilience around shadeCover options ([e5fffa1](https://github.com/Akylas/NativeScript/commit/e5fffa1dad2f7482387d396f8eaebabf96be5011))
* **RootLayout:** resilience around shadeCover options ([91df89e](https://github.com/Akylas/NativeScript/commit/91df89e2744ecb09af81ad3142702eafe4a11dbc))
* **TabView:** item styling improvements for iOS 15+ ([#9888](https://github.com/NativeScript/NativeScript/issues/9888)) ([7ccc949](https://github.com/Akylas/NativeScript/commit/7ccc9497124528d7e83a8217ab80545dec6f6691))
* wrong prop ([0b29254](https://github.com/Akylas/NativeScript/commit/0b2925405a5ae7a4a5cd884e0a60fd34c1cf105c))

### Performance Improvements

* cache UIFont construction based on FontDescriptor ([#9948](https://github.com/NativeScript/NativeScript/issues/9948)) ([8756df3](https://github.com/Akylas/NativeScript/commit/8756df30d4b3b30e139065583ad57a015006a341))
* cache UIFont construction based on FontDescriptor ([#9948](https://github.com/NativeScript/NativeScript/issues/9948)) ([c2cbfa5](https://github.com/Akylas/NativeScript/commit/c2cbfa544fb5843be92db59c1e28a2981508baa5))
* **core:** android sdk check ([#10084](https://github.com/NativeScript/NativeScript/issues/10084)) ([abd722c](https://github.com/Akylas/NativeScript/commit/abd722cd3dec73f4caa1bc15f5ae4864550a46f9))
* faster style-scope setPropertyValues ([#9083](https://github.com/NativeScript/NativeScript/issues/9083)) ([9ccc54b](https://github.com/Akylas/NativeScript/commit/9ccc54b6035c04e383d9256fb3ad9c0c7b00fa20))

### Reverts

* revert "fix(core): handle tap and longpress gesture conflict on iOS" (#10021) ([9972946](https://github.com/Akylas/NativeScript/commit/99729465517c06657fde604e8c1a5c9367323a9b)), closes [#10021](https://github.com/NativeScript/NativeScript/issues/10021) [#10004](https://github.com/NativeScript/NativeScript/issues/10004)
* "fix(ios): apply proper border radius to box shadow and view sublayers ([#9881](https://github.com/NativeScript/NativeScript/issues/9881))" ([#9917](https://github.com/NativeScript/NativeScript/issues/9917)) ([50fd3c0](https://github.com/Akylas/NativeScript/commit/50fd3c06f803dc717dd4ac849b39eb985f108e51))

## 8.2.5-core (2022-06-15)

### Features

* **core:** allow removal of specific CSS variables ([#9896](https://github.com/NativeScript/NativeScript/issues/9896)) ([32567ef](https://github.com/Akylas/NativeScript/commit/32567ef36165c688f34b39d515790d4ce0836b4d))

### Bug Fixes

* **color:** output from rgbToHsv and rgbToHsl is now correct ([#9933](https://github.com/NativeScript/NativeScript/issues/9933)) ([ef70956](https://github.com/Akylas/NativeScript/commit/ef70956623f8eab23e3c245e543b0a1b45e94bf7))
* **ios:** not responding after rotation ([#9931](https://github.com/NativeScript/NativeScript/issues/9931)) ([aee1d05](https://github.com/Akylas/NativeScript/commit/aee1d0565105158e84b6a752cc05ee0dc0577943))

## 8.2.4-core (2022-06-04)

### Features

* **application:** expose `inBackground` and `suspended` ([#9897](https://github.com/NativeScript/NativeScript/issues/9897)) ([f509b3f](https://github.com/Akylas/NativeScript/commit/f509b3ff1b54617eb314c88cedce8cb64badcb05))
* **core:** `maxLines` support for all text components ([2a4d2fa](https://github.com/Akylas/NativeScript/commit/2a4d2faf09eeabe74bb5fbfede145787b4f5724f))
* **core:** `maxLines` support for all text components ([89a0b86](https://github.com/Akylas/NativeScript/commit/89a0b866a8272637171469e10120bb9a33063f78))
* **core:** maxLines support for all text components ([#9884](https://github.com/NativeScript/NativeScript/issues/9884)) ([df10ceb](https://github.com/Akylas/NativeScript/commit/df10ceb4916502ad95057b6c846056eb0400c400))
* **ios:** Utils.getRootViewController ([600cb08](https://github.com/Akylas/NativeScript/commit/600cb087ef5d070497f94671d11f827559144149))
* **RootLayout:** add opened and closed events ([#9893](https://github.com/NativeScript/NativeScript/issues/9893)) ([8aee22b](https://github.com/Akylas/NativeScript/commit/8aee22bda379358f07b0d4b7574b6d8ed02a170d))
* **Utils:** add dataSerialize and dataDeserialize for iOS ([d2b366d](https://github.com/Akylas/NativeScript/commit/d2b366dc9c215a069d10a01dfd6fe3ff465fc8dc))
* **Utils:** dataSerialize, dataDeserialize, numberHasDecimals, numberIs64Bit ([0cdc1bf](https://github.com/Akylas/NativeScript/commit/0cdc1bf91815e9aef7d0985197c387477548fa14))

### Bug Fixes

* **android:** connectivity reporting none on resume ([#9915](https://github.com/NativeScript/NativeScript/issues/9915)) ([8dad6ed](https://github.com/Akylas/NativeScript/commit/8dad6edbbf642a0247941d871c75032806b970e7))
* **android:** font icons had incorrect fallback size ([#9914](https://github.com/NativeScript/NativeScript/issues/9914)) ([4f312a3](https://github.com/Akylas/NativeScript/commit/4f312a360ee019ff352637601c0b09b64043bbb1))
* **android:** race condition on offBackgroundColor view change detection ([#9922](https://github.com/NativeScript/NativeScript/issues/9922)) ([24c319e](https://github.com/Akylas/NativeScript/commit/24c319e3599cf9e0e269d9800827e49dd853f589))
* **android:** Textfield focus fix ([#9885](https://github.com/NativeScript/NativeScript/issues/9885)) ([17a87a4](https://github.com/Akylas/NativeScript/commit/17a87a4a866e683793d4db8a209cfc1785d9414d))
* **core:** allow View subclass to force onLayoutChangeListener ([#9886](https://github.com/NativeScript/NativeScript/issues/9886)) ([6f68b2f](https://github.com/Akylas/NativeScript/commit/6f68b2f78dc5994191a5f9a12402d7b2fe9f8041))
* **core:** android fix by hidding current fragment on nav and show on back ([fe8ac02](https://github.com/Akylas/NativeScript/commit/fe8ac02c82191aec18aff54336061a906212146a))
* **core:** android fix for recreated activity not creating fragments ([84fdbfc](https://github.com/Akylas/NativeScript/commit/84fdbfc6a6b1b43fd6b1c91826de96d85843fde6))
* **core:** android fix for webview not loading local content ([945d752](https://github.com/Akylas/NativeScript/commit/945d752dbadc108a98f09fa7e311a038f33b5ea4))
* **core:** android wrong background state + current value accessors ([3e320ca](https://github.com/Akylas/NativeScript/commit/3e320caa349c35f6f3bd81a953b5104542ea8fee))
* **core:** android wrong background state + current value accessors ([#9883](https://github.com/NativeScript/NativeScript/issues/9883)) ([36e821a](https://github.com/Akylas/NativeScript/commit/36e821a5b0b8f2717f9dd95aee01047af38d6d0d))
* **core:** animation discover css properties ([2cd8898](https://github.com/Akylas/NativeScript/commit/2cd889810071be184763746a823b0e7b7645e666))
* **core:** import fix ([04d5f07](https://github.com/Akylas/NativeScript/commit/04d5f07a56bcc8e0278d619b41d8ec1f04ad8ec3))
* **core:** ios fix where originX and originY would break layout ([ac7470c](https://github.com/Akylas/NativeScript/commit/ac7470c5fed2f6f4f5264bddf99b968c3fe01b4b))
* **core:** ios release the potential `viewController` ([ca496a5](https://github.com/Akylas/NativeScript/commit/ca496a57a5a6bf12345bdcc6abc9519046f726aa))
* ensure reusable ProxyViewContainer re-adds native children ([#9882](https://github.com/NativeScript/NativeScript/issues/9882)) ([6e3dd4d](https://github.com/Akylas/NativeScript/commit/6e3dd4da516988965fd77eb3477cd5556c97db20))
* export 'dataSerialize' from utils ([#9909](https://github.com/NativeScript/NativeScript/issues/9909)) ([710ddae](https://github.com/Akylas/NativeScript/commit/710ddaed1afe6eb30ad5cb46c6cfc96b914979f7))
* expose `inBackground` and `suspended in `Application` ([13b703a](https://github.com/Akylas/NativeScript/commit/13b703a3bbde2b77d7919bed19533d67d92cbd8e))
* expose `inBackground` and `suspended in `Application` ([90a0846](https://github.com/Akylas/NativeScript/commit/90a08462bc451aae3dd2f03d840e5f166abea9a7))
* incorrect font icon size conversion to device pixels. ([#9910](https://github.com/NativeScript/NativeScript/issues/9910)) ([df639ed](https://github.com/Akylas/NativeScript/commit/df639ed3b205cfef0bef39718493f00692ab45cf))
* **ios:** apply proper border radius to box shadow and view sublayers ([#9881](https://github.com/NativeScript/NativeScript/issues/9881)) ([3d882b0](https://github.com/Akylas/NativeScript/commit/3d882b0999ca25cbab104700eb483bc5d5d9a1ab))
* **ios:** proper disposal and recreation of iOS native views ([#9879](https://github.com/NativeScript/NativeScript/issues/9879)) ([96a575d](https://github.com/Akylas/NativeScript/commit/96a575da8cdbbf86995c92704026a3aa910f6191))
* **live-sync:** navigation history is now maintained ([#9889](https://github.com/NativeScript/NativeScript/issues/9889)) ([ae46753](https://github.com/Akylas/NativeScript/commit/ae467532655ebb6f918d3ac09e9578cd92513989))
* **TabView:** item styling improvements for iOS 15+ ([#9888](https://github.com/NativeScript/NativeScript/issues/9888)) ([b3c5b33](https://github.com/Akylas/NativeScript/commit/b3c5b33f6a0ea6994eec99976db8c88b75eca74a))
* **ui-mobile-base:** Android http request body was not sent if method was DELETE ([#9887](https://github.com/NativeScript/NativeScript/issues/9887)) ([647ed5c](https://github.com/Akylas/NativeScript/commit/647ed5cf7d0dc6ef4dccb12e7fd3f70a6c2a4919))
* **Utils:** dispatchToUIThread ([9089b2c](https://github.com/Akylas/NativeScript/commit/9089b2cf87ecc2644090da22ed8797f56db5c7bb))
* **Utils:** dispatchToUIThread ([4577410](https://github.com/Akylas/NativeScript/commit/45774103b6522f1487a5fae0dd2950a9dd23cf37))
* **webview:** android not loading local content ([#9923](https://github.com/NativeScript/NativeScript/issues/9923)) ([834b4bf](https://github.com/Akylas/NativeScript/commit/834b4bf5e1c92dad8cd7bfad2f329ba9d754c15e))

### Reverts

* "fix(ios): apply proper border radius to box shadow and view sublayers ([#9881](https://github.com/NativeScript/NativeScript/issues/9881))" ([#9917](https://github.com/NativeScript/NativeScript/issues/9917)) ([f2e47dd](https://github.com/Akylas/NativeScript/commit/f2e47dd045155faf3c9296860cda99e695d4f8e4))

## 8.2.3-core (2022-04-25)

### Features

* added Utils.executeOnUIThread ([36a55da](https://github.com/Akylas/NativeScript/commit/36a55dac7fd9db4ace98ac0a19286d8cfd0410bf))

### Bug Fixes

* **android:** ensure android application is created before setting listeners ([#9876](https://github.com/NativeScript/NativeScript/issues/9876)) ([54f454f](https://github.com/Akylas/NativeScript/commit/54f454f881204ec2a02ab1695819cf344c70dffe))
* **android:** improve content uri handling ([#9874](https://github.com/NativeScript/NativeScript/issues/9874)) ([a272296](https://github.com/Akylas/NativeScript/commit/a272296d875ca4bacf52c80dd568de6d3b73a4fc)), closes [#9871](https://github.com/NativeScript/NativeScript/issues/9871)
* **core:** allow View subclass to force onLayoutChangeListener ([8bc9f54](https://github.com/Akylas/NativeScript/commit/8bc9f547e548c867277507a51372ad1f5a4d1586))
* file access cross platform stub ([338ae56](https://github.com/Akylas/NativeScript/commit/338ae56a829d9badf22c458b01d88c1ca9f3e677))
* removed unecessary `console.log` ([#9877](https://github.com/NativeScript/NativeScript/issues/9877)) ([74e42fc](https://github.com/Akylas/NativeScript/commit/74e42fcb8b68cf5740b33f337f7cdea7b0b94e3b))

## 8.2.2-core (2022-04-07)

### Features

* **RootLayout:** added topmost method to retrieve view at top ([#9826](https://github.com/NativeScript/NativeScript/issues/9826)) ([3bb8fc2](https://github.com/Akylas/NativeScript/commit/3bb8fc28e998a153a561ef331645b84e58a827a3))
* **TouchManager:** touchDelay property for nested tap control ([c05145b](https://github.com/Akylas/NativeScript/commit/c05145bd9b62cb017349acf46827fec929b3289c))

### Bug Fixes

* **ActionItem:** rendering threw errors if it had a nested child. ([#9821](https://github.com/NativeScript/NativeScript/issues/9821)) ([efa80c7](https://github.com/Akylas/NativeScript/commit/efa80c728b172c4d2b6dfb7bb502f4b7e8871591))
* **android:** gesture events fix ([#9842](https://github.com/NativeScript/NativeScript/issues/9842)) ([2664783](https://github.com/Akylas/NativeScript/commit/2664783dfa773f373a93fd427b3d5c01964975b2))
* **core:** ios revert broken `lineHeight` ([fd0d6ee](https://github.com/Akylas/NativeScript/commit/fd0d6ee9870cc4313312246662ae8075f5657761))
* **core:** refactore to prevent Mem Leak ([c7a7139](https://github.com/Akylas/NativeScript/commit/c7a7139fc3167d17bb29651ad1c29b2384a997da))
* **core:** textfield getting focused again on focus clear ([c2496fd](https://github.com/Akylas/NativeScript/commit/c2496fd429a954cfb44245496f5f5a2372558e27))
* **css:** borderColor parse handling for hsl(a) color values ([#9857](https://github.com/NativeScript/NativeScript/issues/9857)) ([da3bd2c](https://github.com/Akylas/NativeScript/commit/da3bd2c6fb8e51b303b163812c348fb4ca938f5b))
* **ios:** navigation button now allows using custom icon ([#9835](https://github.com/NativeScript/NativeScript/issues/9835)) ([f88c158](https://github.com/Akylas/NativeScript/commit/f88c158b384fee7afec9770b257a4312e715b6ec))
* revert breaking change from [#9761](https://github.com/NativeScript/NativeScript/issues/9761) ([e3284a4](https://github.com/Akylas/NativeScript/commit/e3284a4a8aaebb19e44498b2c4663dcceb186969))
* **RootLayout:** close popup views on live-sync ([#9834](https://github.com/NativeScript/NativeScript/issues/9834)) ([6941466](https://github.com/Akylas/NativeScript/commit/694146689b7729280aa99cd393848ede78d6cd37))
* Utils.queueGC debounce and throttle with reuse of different settings ([#9852](https://github.com/NativeScript/NativeScript/issues/9852)) ([9ce7455](https://github.com/Akylas/NativeScript/commit/9ce745568f1dfdfa9b1d26021a83408a72db8e16))

### Performance Improvements

* Improved live-sync functionality for RootLayout ([#9836](https://github.com/NativeScript/NativeScript/issues/9836)) ([3537858](https://github.com/Akylas/NativeScript/commit/3537858b6dabe1d419a1ab2853d0188061d9fa23))

## 8.2.1-core (2022-03-09)

### Bug Fixes

* wrong thread when in Async task in a worker ([794a779](https://github.com/Akylas/NativeScript/commit/794a77900f183472a4cc33fa544cb396790d4166)), closes [#9819](https://github.com/NativeScript/NativeScript/issues/9819)

## 8.2.0-core (2022-03-08)

### ⚠ BREAKING CHANGES

* **android:** AndroidFragmentCallbacks now requires onResume as well

Migration steps:
specify onResume on custom fragment implementations

### Features

* allow better tree shaking ([#9798](https://github.com/NativeScript/NativeScript/issues/9798)) ([d3674de](https://github.com/Akylas/NativeScript/commit/d3674de88212db48409dd476e5450f4e7d8df0f0))
* **android:** content uri support for File ([#9807](https://github.com/NativeScript/NativeScript/issues/9807)) ([c68d002](https://github.com/Akylas/NativeScript/commit/c68d002c9ad332d4bf5ea6430c3cf852f5ef64df))
* **android:** tab view icon rendering mode ([#9605](https://github.com/NativeScript/NativeScript/issues/9605)) ([66d8aff](https://github.com/Akylas/NativeScript/commit/66d8afffc1a987b36605c7206b057268a38ecb06))
* background/foreground events ([#9763](https://github.com/NativeScript/NativeScript/issues/9763)) ([b553a90](https://github.com/Akylas/NativeScript/commit/b553a900d76893d1f49ea4a20fa361147585a451))
* **bindable:** allow "global" context for expressions inside bindings ([#9734](https://github.com/NativeScript/NativeScript/issues/9734)) ([2cbb135](https://github.com/Akylas/NativeScript/commit/2cbb135250252844ce8c7affabaf3140643ce7b4))
* binding expression parser additions and improvements ([#9791](https://github.com/NativeScript/NativeScript/issues/9791)) ([716b831](https://github.com/Akylas/NativeScript/commit/716b831523829dfa508d32efe0067060109ca574))
* **config:** add new option for pathsToClean ([08d5656](https://github.com/Akylas/NativeScript/commit/08d56568998dae416205fe7b0ada8334ebabb2e0))
* **config:** cli.additionalPathsToClean to clean other paths with 'ns clean' ([#9808](https://github.com/NativeScript/NativeScript/issues/9808)) ([3ec8c42](https://github.com/Akylas/NativeScript/commit/3ec8c429719a9a32238801ba3dd7c17c0b50ec72))
* **core:** add event when disposeNativeView is called ([f038e6b](https://github.com/Akylas/NativeScript/commit/f038e6ba66c319465bde251d1e540d4ee5981373))
* **core:** support RGB alpha notation ([#9699](https://github.com/NativeScript/NativeScript/issues/9699)) ([388d7ea](https://github.com/Akylas/NativeScript/commit/388d7eaa7d956e7785ad26399c14b925664f6a52))
* **datepicker:** ability to show time via showTime property ([#9570](https://github.com/NativeScript/NativeScript/issues/9570)) ([ab4e47a](https://github.com/Akylas/NativeScript/commit/ab4e47a1c1132f73648d76fa332c5633028182f7))
* **gestures:** GestureEvents.gestureAttached added to modify native recognizers when needed ([168a169](https://github.com/Akylas/NativeScript/commit/168a16972623109afadedabd32ff22d70555026b))
* improved background handling ([#9615](https://github.com/NativeScript/NativeScript/issues/9615)) ([dde9e02](https://github.com/Akylas/NativeScript/commit/dde9e02cac1f7f2b34ad7965eaada2661e636641))
* improved converter and function call parsing mechanism for XML expressions ([#9805](https://github.com/NativeScript/NativeScript/issues/9805)) ([c5856c6](https://github.com/Akylas/NativeScript/commit/c5856c6daee6901356a55868629484171e64daee))
* **ios:** allow dynamic ProMotion frame refresh rate changes ([#9775](https://github.com/NativeScript/NativeScript/issues/9775)) ([b292495](https://github.com/Akylas/NativeScript/commit/b2924955067c992caea5b14e37d705cea203a509))
* new expression parser for xml bindings ([#9729](https://github.com/NativeScript/NativeScript/issues/9729)) ([90ceed1](https://github.com/Akylas/NativeScript/commit/90ceed15d3b4f89f06b0a1f7f78724a37c9985e6))
* proper handling for bindings with converters that were undefined ([#9813](https://github.com/NativeScript/NativeScript/issues/9813)) ([a1772c0](https://github.com/Akylas/NativeScript/commit/a1772c00058d03ee1e4a6e3ba8f96ba2197e3f2b))
* **root-layout:** support gradient colors on shade cover ([#9626](https://github.com/NativeScript/NativeScript/issues/9626)) ([d756eb5](https://github.com/Akylas/NativeScript/commit/d756eb5574ab062fb4b4e8c994f3924380be9317))
* **switch:** :checked pseudo and color fixes ([#9790](https://github.com/NativeScript/NativeScript/issues/9790)) ([6437352](https://github.com/Akylas/NativeScript/commit/6437352feda731964728113b1b29cdeda1571666))
* testID property for use with e2e testing without interfering with a11y ([#9793](https://github.com/NativeScript/NativeScript/issues/9793)) ([8be543b](https://github.com/Akylas/NativeScript/commit/8be543bcc7da2634f9c627ea15b06e6dfef78b93)), closes [#9748](https://github.com/NativeScript/NativeScript/issues/9748)
* touch animations demo in toolbox ([d7916d7](https://github.com/Akylas/NativeScript/commit/d7916d77a147d1dcf203e18550ad3245bfdeb2f7))
* **types-ios:** reduced ios types to common types for optimized ts resolution ([#9809](https://github.com/NativeScript/NativeScript/issues/9809)) ([6cd8b8e](https://github.com/Akylas/NativeScript/commit/6cd8b8e804b5e237574108fbe7c5320acd0dbe31))
* **ui:** TouchManager for ease in adding interactivity ([26953ec](https://github.com/Akylas/NativeScript/commit/26953ec1f25ae673faedc5416880ebdfe9fcc8fd))
* Utils for queueGC, debounce and throttle ([40c5984](https://github.com/Akylas/NativeScript/commit/40c5984966231ef126e7d143be41c7c1d51085da))
* **webpack:** read nativescript.config.ts main if set before fallback to package.json ([#9769](https://github.com/NativeScript/NativeScript/issues/9769)) ([61ff7e4](https://github.com/Akylas/NativeScript/commit/61ff7e47622d0464b7f32b1ae7a6df1ce65141de)), closes [#9658](https://github.com/NativeScript/NativeScript/issues/9658)

### Bug Fixes

* **android:** a11y - do not provide content description for TextView elements ([#9673](https://github.com/NativeScript/NativeScript/issues/9673)) ([dbaf203](https://github.com/Akylas/NativeScript/commit/dbaf203a590b110a2e435e31748ae338bd2e1824)), closes [#9588](https://github.com/NativeScript/NativeScript/issues/9588)
* **android:** api17 crash on a11y service ([#9792](https://github.com/NativeScript/NativeScript/issues/9792)) ([2efcdf5](https://github.com/Akylas/NativeScript/commit/2efcdf57871cc7a8def6a83995cf6f0d7f66f925))
* **android:** boolean keyboardType should not set inputType ([#9795](https://github.com/NativeScript/NativeScript/issues/9795)) ([9e6371f](https://github.com/Akylas/NativeScript/commit/9e6371fdaf4a2ba62da9920d9011045a267f4e53))
* **android:** edge cases and compatibility with fragments 1.2.x ([#9782](https://github.com/NativeScript/NativeScript/issues/9782)) ([6b41268](https://github.com/Akylas/NativeScript/commit/6b41268a08fff0b82bf044f7a8a6c6f95fcd60f6))
* **android:** fragment creation loaded/unloaded protection ([ac2e944](https://github.com/Akylas/NativeScript/commit/ac2e944fd30107cfc1ee863b9245633e51e75450))
* **android:** nested frames were sometimes not recreated ([#9725](https://github.com/NativeScript/NativeScript/issues/9725)) ([902a4c6](https://github.com/Akylas/NativeScript/commit/902a4c6afc7442f92e345309d8d69f19a0fd1bdf))
* **android:** NullPointerException on navigation ([#9669](https://github.com/NativeScript/NativeScript/issues/9669)) ([9b5d125](https://github.com/Akylas/NativeScript/commit/9b5d125f42b4d2d27483ea2c0b1a8c3417556802)), closes [#8441](https://github.com/NativeScript/NativeScript/issues/8441)
* **android:** prevent error when detaching from unloaded ScrollView ([#9666](https://github.com/NativeScript/NativeScript/issues/9666)) ([e59f3ff](https://github.com/Akylas/NativeScript/commit/e59f3ff66984f19dbbc5c0067342c243f3788971))
* **android:** text-transform: capitalize behavior ([#9598](https://github.com/NativeScript/NativeScript/issues/9598)) ([aa1c631](https://github.com/Akylas/NativeScript/commit/aa1c631e6f3c38f56d4a84a20a3142289104ab0e)), closes [#7059](https://github.com/NativeScript/NativeScript/issues/7059)
* **android:** when hiding the keyboard make view lose focus to match ios behavior ([#9786](https://github.com/NativeScript/NativeScript/issues/9786)) ([b78996a](https://github.com/Akylas/NativeScript/commit/b78996a5690add6c978ee5867ddf666a3471f116))
* application instance creation occurs only within Application.run ([a518249](https://github.com/Akylas/NativeScript/commit/a518249958df933ca82f2f82f5efe023fa7ae695))
* **core:** animation iteration correct for android css animations and iOS rotation ([#9628](https://github.com/NativeScript/NativeScript/issues/9628)) ([608bb1e](https://github.com/Akylas/NativeScript/commit/608bb1ed24fd32ac6199e632d739e7a66a0da1c8)), closes [#7712](https://github.com/NativeScript/NativeScript/issues/7712)
* **core:** Application handling of nativeApp instance ([6c06c77](https://github.com/Akylas/NativeScript/commit/6c06c77618c92590d5aa441eac838c4330732753))
* **core:** parse template literal syntax with nested identifiers as expression. ([#9744](https://github.com/NativeScript/NativeScript/issues/9744)) ([57cc4ed](https://github.com/Akylas/NativeScript/commit/57cc4edc8c161b2ceb3b9a7842d627d66d65eb1d))
* ensure android can access native app instance before bootstrap ([f10cffc](https://github.com/Akylas/NativeScript/commit/f10cffcb02a1ae37b436ea22eaf1cf67804927fe))
* **fs:** wrong common paths ([51b92f3](https://github.com/Akylas/NativeScript/commit/51b92f355799409aba82eca4c951b394c4ef894c))
* **ios:** do not redraw if background image is 'none' ([#9800](https://github.com/NativeScript/NativeScript/issues/9800)) ([402a7bb](https://github.com/Akylas/NativeScript/commit/402a7bba2ee9435134d6697dbe5639bd096597f6))
* **ios:** force layout of view when changing the safe area insets ([#9773](https://github.com/NativeScript/NativeScript/issues/9773)) ([a1ba1f6](https://github.com/Akylas/NativeScript/commit/a1ba1f6d032ffd2abd17529fbcd782c0200ff6dd))
* **ios:** proper UITabBarAppearance handling ([6c71ce2](https://github.com/Akylas/NativeScript/commit/6c71ce21a20adba7ea350176fc5a81da646f594f))
* **ios:** tabview background color with appearance api in iOS 15+ ([#9617](https://github.com/NativeScript/NativeScript/issues/9617)) ([2749221](https://github.com/Akylas/NativeScript/commit/27492219e6f1903b4c3f744cfe9a5569ccc6a600))
* **ios:** UIImage memory leaking after Image is disposed ([#9777](https://github.com/NativeScript/NativeScript/issues/9777)) ([19d8869](https://github.com/Akylas/NativeScript/commit/19d8869f1dc64d64a8b295985514716be5012a2c))
* memory leaks around image picking/saving to device ([7dcfecf](https://github.com/Akylas/NativeScript/commit/7dcfecffab10c3b253975a84f711b46111070bf4))
* qualifier matcher did not support multiple qualifiers for a single file. ([#9720](https://github.com/NativeScript/NativeScript/issues/9720)) ([3d03f8f](https://github.com/Akylas/NativeScript/commit/3d03f8f06aa36852cbce82a319dcf9de79c929ac))
* tear down views after a modal is closed ([#9801](https://github.com/NativeScript/NativeScript/issues/9801)) ([b38337e](https://github.com/Akylas/NativeScript/commit/b38337e597a8288f6ab0c5058fa9addd622146be))
* **time-picker:** correction for super.disposeNativeView ([c41e702](https://github.com/Akylas/NativeScript/commit/c41e7027e45778c9c27fcbc701f56edebd57e33b))

### Performance Improvements

* **ios:** autoreleasepool for image extensions ([fbefea4](https://github.com/Akylas/NativeScript/commit/fbefea4dbad59e9b31ecd9311b1a16f40d041c9d))
* **ios:** prevent crash with image release ([1fb687d](https://github.com/Akylas/NativeScript/commit/1fb687df550e1c01c5901920e79487d220e834c4))
* **ios:** uifont and formatted string optimizations plus uiimage scaling ([#9761](https://github.com/NativeScript/NativeScript/issues/9761)) ([9d3977e](https://github.com/Akylas/NativeScript/commit/9d3977ea4fd6d6aedeab55e0472999c05ed5a7bd))
* **ios:** UIImage memory leaks ([#9783](https://github.com/NativeScript/NativeScript/issues/9783)) ([988f372](https://github.com/Akylas/NativeScript/commit/988f3727883bddd27dd6397d7dfeebeb9b20c559))

## 8.1.12 (2022-02-10)

### Bug Fixes

* **android:** if a page transition is cancelled , the end event wont be called. We need to handle it and call `transitionOrAnimationCompleted` ([aef6338](https://github.com/Akylas/NativeScript/commit/aef6338b304a4c0be7ddf84fe63b57d31cb34d41))
* **core:** add an fix for cancelled transitions stuck in a in-between state ([037bc61](https://github.com/Akylas/NativeScript/commit/037bc61a3a0a4917691ca13dbe22328530e05d30))
* rollback on last fix ([b592e66](https://github.com/Akylas/NativeScript/commit/b592e66e9b6602c7b8176a5a8d52bf447519864e))

## 8.1.10 (2022-02-10)

### Bug Fixes

* disable animations for all in between fragments during a transition ([80fe183](https://github.com/Akylas/NativeScript/commit/80fe1837ac1a4c4d239fa1221adbc0c855e04942))
* use hide to prevent black with OpenGL during a transition ([7933842](https://github.com/Akylas/NativeScript/commit/79338423e6290eb89b9e1ed786a8f4b7a5f66473))

## 8.1.9 (2022-02-01)

### Bug Fixes

* **android:** suspend fix ([e067111](https://github.com/Akylas/NativeScript/commit/e067111bbfcee8486f0a8394998f0ed4802ed48f))

## 8.1.8 (2022-02-01)

### Features

* new 'background/foreground` events for app ([16d4338](https://github.com/Akylas/NativeScript/commit/16d4338f96ad859a03e55a185eeed5958676533b))

### Bug Fixes

* **core:** android fix for entry cleared too late ([663ab77](https://github.com/Akylas/NativeScript/commit/663ab77a7d358a658d94fa5a71ca5212b1aca329))
* **core:** android fix for tabview error on unload ([eca1a21](https://github.com/Akylas/NativeScript/commit/eca1a21c4bf0367ea7f5606a8a43b63fbb57f930))

## 8.1.7 (2022-01-29)

### Bug Fixes

* accessibility import fix ([7351200](https://github.com/Akylas/NativeScript/commit/735120056801dcefb3b937a31de93eb924e2bea7))
* **core:** android fix for `foregroundActivity` not set on first `onNavigatingTo` ([9adb411](https://github.com/Akylas/NativeScript/commit/9adb411b162cb61af6010db5a20ff6f5fe1e7534))
* **core:** android fix for transitions not starting ([7e5314e](https://github.com/Akylas/NativeScript/commit/7e5314ef3768c4b4b27377c5f89675218fe972a7))

## 8.1.5 (2022-01-14)

### Bug Fixes

* **android:** version Android text-align justify ([3c049db](https://github.com/Akylas/NativeScript/commit/3c049dbfa6b724eba775af816281a5406d6d6e81))
* **ios:** box-shadow and border-radius ([#9612](https://github.com/NativeScript/NativeScript/issues/9612)) ([4832179](https://github.com/Akylas/NativeScript/commit/483217934c679222ed04387421d3a3c7241ae4cf))
* uglify fix ([05393d3](https://github.com/Akylas/NativeScript/commit/05393d3785abab28501882d4759ebc9240316d51))

## 8.1.5-core (2021-10-28)

### Bug Fixes

* **android:** autofillType on apiLevel < 26 ([b945d5a](https://github.com/Akylas/NativeScript/commit/b945d5a6651ac89453265954923893d08534a6d0))
* **android:** autofillType on apiLevel < 26 ([#9610](https://github.com/NativeScript/NativeScript/issues/9610)) ([8878c3b](https://github.com/Akylas/NativeScript/commit/8878c3bc6be5c061e95da74249998b51797d71d9))
* **android:** version Android text-align justify ([#9620](https://github.com/NativeScript/NativeScript/issues/9620)) ([2ad280d](https://github.com/Akylas/NativeScript/commit/2ad280deb0e9b6098d4ad76ccf703e257196a023))

## 8.1.4-core (2021-10-09)

### Features

* android openFile dialog title ([#9600](https://github.com/NativeScript/NativeScript/issues/9600)) ([77d2533](https://github.com/Akylas/NativeScript/commit/77d253379802487007c138ca025ac21f9bece002))
* **text:** add css text-align justify ([#9573](https://github.com/NativeScript/NativeScript/issues/9573)) ([1de5295](https://github.com/Akylas/NativeScript/commit/1de5295ad980b394460de7d9d4b884e5a3b5a679))

### Bug Fixes

* allow to disable load of polyfills ([d8ca36a](https://github.com/Akylas/NativeScript/commit/d8ca36a5aeabcb405ff163ee27b92291de7295d0))
* background parsing color [#9559](https://github.com/NativeScript/NativeScript/issues/9559) ([#9560](https://github.com/NativeScript/NativeScript/issues/9560)) ([3e21748](https://github.com/Akylas/NativeScript/commit/3e21748af4dcf76fec3822b4d5e9c844794eda1d))
* better native-api-usage ([2c7a8f1](https://github.com/Akylas/NativeScript/commit/2c7a8f1d769cdd0907178c375179a60c7d0ba13f))
* disabled default accessibility ([f7145d9](https://github.com/Akylas/NativeScript/commit/f7145d9fc29243012707bd4673b3fcf99b8d90b9))
* global __DEV__ variable type ([#9568](https://github.com/NativeScript/NativeScript/issues/9568)) ([61980fd](https://github.com/Akylas/NativeScript/commit/61980fd4a8573d93ed59348da76e5aca873b2eca))
* **ios:** flat property using new appearance api ([#9558](https://github.com/NativeScript/NativeScript/issues/9558)) ([183b4d4](https://github.com/Akylas/NativeScript/commit/183b4d4b10a4ec7f9527e5373c8ce723c3db0c3e))
* **ios:** TextView respect editable binding ([#9589](https://github.com/NativeScript/NativeScript/issues/9589)) ([2b2ce37](https://github.com/Akylas/NativeScript/commit/2b2ce377e6d7bd33de3fd8df9482772a650b75b5))
* metadata fixes ([4d1d02a](https://github.com/Akylas/NativeScript/commit/4d1d02ac0eeebffaf135e549dda6ca45b2d671ef))
* missing metadata ([0df4485](https://github.com/Akylas/NativeScript/commit/0df4485b1eadd0b74cb98d19647d70bf71e6a54f))
* missing native-api-usage ([be5514b](https://github.com/Akylas/NativeScript/commit/be5514beb0c5d06759345059426dc4bd88845f3c))
* new polyfill for formdata ([53f3219](https://github.com/Akylas/NativeScript/commit/53f3219b50b73101eccc4b182993d9877838a4e2))
* refactor to only use accessibility when actually used ([709c4bf](https://github.com/Akylas/NativeScript/commit/709c4bf04e445a01a041cc8d131fe15ae2290c8e))
* replace autofill string in textfield ([#9555](https://github.com/NativeScript/NativeScript/issues/9555)) ([889f6d7](https://github.com/Akylas/NativeScript/commit/889f6d73cf8bdc080c54387708562d00c2684e9b))
* **style:** CSS variables should be case-sensitive. ([#9603](https://github.com/NativeScript/NativeScript/issues/9603)) ([02aa0f6](https://github.com/Akylas/NativeScript/commit/02aa0f652a5637b089a8894f6635462073715205))

## 8.1.3-core (2021-09-18)

### Bug Fixes

* **android:** only attach if activity is CREATED ([#9552](https://github.com/NativeScript/NativeScript/issues/9552)) ([90b8718](https://github.com/Akylas/NativeScript/commit/90b8718138fc6e67e2141d9b77017b3d96e50d51))

## 8.1.2-core (2021-09-15)

### Bug Fixes

* **android:** background-image 'none' ([#9547](https://github.com/NativeScript/NativeScript/issues/9547)) ([a38e2ca](https://github.com/Akylas/NativeScript/commit/a38e2ca3b905a638c773352c98c5afa1ec99a5b6))
* **core:** Add missing required metadata filters ([#9543](https://github.com/NativeScript/NativeScript/issues/9543)) ([a51b628](https://github.com/Akylas/NativeScript/commit/a51b628532c616ba8523849ca86ae8716e05a431))

## 8.1.1-core (2021-09-10)

### Reverts

* feat: requestLayout performance improvements ([#9122](https://github.com/NativeScript/NativeScript/issues/9122)) ([eb0d000](https://github.com/Akylas/NativeScript/commit/eb0d000fe15309d80a1edddf0b243c3f88e8bf19))

## 8.1.0-core (2021-09-08)

## 8.1.0-rc.0-core (2021-09-08)

### Features

* Frame replacePage by entry ([#9460](https://github.com/NativeScript/NativeScript/issues/9460)) ([ffab4c3](https://github.com/Akylas/NativeScript/commit/ffab4c31658f9be2137cae5a824f8e8c9bf7aef2)), closes [#9497](https://github.com/NativeScript/NativeScript/issues/9497)

### Bug Fixes

* **ios:** actionitem coloring with 15+ ([86ff418](https://github.com/Akylas/NativeScript/commit/86ff418166d9963e7380aa69e7ae57a1abc24eb5))

## 8.1.0-alpha.8-core (2021-09-08)

### Bug Fixes

* **modal:** persist modal through configuration changes ([#9533](https://github.com/NativeScript/NativeScript/issues/9533)) ([4632aea](https://github.com/Akylas/NativeScript/commit/4632aeaae8a21984db59970ead3d932d4c0b1bf0))

### Reverts

* clipsToBounds support ([5532903](https://github.com/Akylas/NativeScript/commit/5532903ad895c1567f1e6feaa2afcc5569edaf4f))

## 8.1.0-alpha.7-core (2021-09-08)

### Bug Fixes

* **ios:** actionBar title to use appearance api on ios15+ ([#9534](https://github.com/NativeScript/NativeScript/issues/9534)) ([011e869](https://github.com/Akylas/NativeScript/commit/011e869cd576c80c7d72d7d8bc0eafded3478775))

## 8.1.0-alpha.6-core (2021-09-08)

### Bug Fixes

* **ios:** actionBar to use appearance api on ios13+ ([#9530](https://github.com/NativeScript/NativeScript/issues/9530)) ([2bfccbb](https://github.com/Akylas/NativeScript/commit/2bfccbbea67261e4bb8f0e5812a7afa104409a05))

## 8.1.0-alpha.5-core (2021-09-08)

### Bug Fixes

* Color.darken fix ([61c3a0a](https://github.com/Akylas/NativeScript/commit/61c3a0a6670c81d036aad0fb8fff7ef844d1b70b))
* **ios:** resiliency to frame controller viewDidDisappear ([6fc239d](https://github.com/Akylas/NativeScript/commit/6fc239dc56326b2ee13276537834d2b97ad99fa9))

## 8.1.0-alpha.4-core (2021-09-08)

## 8.1.0-alpha.3-core (2021-09-08)

### Bug Fixes

* allow ignoring `reduce-css-calc` w/ webpack without error ([#9510](https://github.com/NativeScript/NativeScript/issues/9510)) ([8c9407c](https://github.com/Akylas/NativeScript/commit/8c9407c48ed9d4ea416d821586f5d0a6f3f06b6a))
* css colors not parsed correctly within background property ([f554b79](https://github.com/Akylas/NativeScript/commit/f554b796ef925d7a279c3b41564266d8baf9ef56))
* **ios:** prevent views from being measured if no native view ([#9511](https://github.com/NativeScript/NativeScript/issues/9511)) ([b4dc45e](https://github.com/Akylas/NativeScript/commit/b4dc45edb35b5bc32dcf24425f64622e6bca2332))

## 8.1.0-alpha.1-core (2021-09-08)

## 8.1.0-alpha.0-core (2021-09-08)

### ⚠ BREAKING CHANGES

* **android:** * if you have broder-radius or clip-path, it will clip by default
* **android:** Changes the internal behavior of Android navigation:

* while navigating forward, the page navigated from is not unloaded anymore
* events order is changed in the sense that now `unloaded` happens after `navigatedFrom` instead of before

There are multiple plus sides to this:

* no more black views on navigation when using opengl (maps, ...)
* navigation is faster, especially the navigation back! No longer need to recreate the page anymore. Navigation forward also gets faster as we no longer unload the previous page
* navigatedFrom event happens faster
* this the default behavior used by most of the android native apps

### Features

* AbortController polyfill ([#9333](https://github.com/NativeScript/NativeScript/issues/9333)) ([58442fb](https://github.com/Akylas/NativeScript/commit/58442fb454d5933c98aabe6761ce8aa11c6c810b))
* **android:** fragment transactions to use 'add' instead of 'replace' on fwd navigation ([#8791](https://github.com/NativeScript/NativeScript/issues/8791)) ([e17e469](https://github.com/Akylas/NativeScript/commit/e17e46974b92143f3a1c0a23a94190bff31c735b))
* **android:** provide ability to get registered broadCastReceiver ([#9467](https://github.com/NativeScript/NativeScript/issues/9467)) ([f053001](https://github.com/Akylas/NativeScript/commit/f053001dc1a3eedb81c5baf984fd40aa1f01d0eb))
* **android:** support clipToBounds ([#9508](https://github.com/NativeScript/NativeScript/issues/9508)) ([1ffc162](https://github.com/Akylas/NativeScript/commit/1ffc1628d0f9d4b506da3c7c81d97c381ca1d001))
* **android:** vector drawable support ([#9464](https://github.com/NativeScript/NativeScript/issues/9464)) ([76499a5](https://github.com/Akylas/NativeScript/commit/76499a5367838651d8dcc235d590af21d228a8f9))
* autofillType property for edit text base ([969716e](https://github.com/Akylas/NativeScript/commit/969716e9f9691e70beedab68303e441089d9be4c))
* autofillType property for edit text base ([#9478](https://github.com/NativeScript/NativeScript/issues/9478)) ([d25cd5b](https://github.com/Akylas/NativeScript/commit/d25cd5bceea7108fff8bc25e2e9d015fb53fd513))
* **color:** added utilities and improved color parsing performance ([#9110](https://github.com/NativeScript/NativeScript/issues/9110)) ([c4db847](https://github.com/Akylas/NativeScript/commit/c4db847ded4a8af57fab54530c36daf9cb077570))
* **config:** added option for ignoredNativeDependencies ([65f9598](https://github.com/Akylas/NativeScript/commit/65f9598a0d016bebf61f89f08d50e9a011d33db0))
* **core:** make css parsers tree-shakable ([#9496](https://github.com/NativeScript/NativeScript/issues/9496)) ([dd5f24a](https://github.com/Akylas/NativeScript/commit/dd5f24a7377ec5735ec97d929241a5835e719c27))
* **image-source:** add saveToFileAsync, toBase64StringAsync & resizeAsync ([#9404](https://github.com/NativeScript/NativeScript/issues/9404)) ([b2f7923](https://github.com/Akylas/NativeScript/commit/b2f792324d54139d6ceae14a56136e3a96bb1e94))
* requestLayout performance improvements ([#9122](https://github.com/NativeScript/NativeScript/issues/9122)) ([4f5f0aa](https://github.com/Akylas/NativeScript/commit/4f5f0aae77dd3b59b8c3856193fdb77b8223262e))
* **webpack:** improved svelte HMR ([#9497](https://github.com/NativeScript/NativeScript/issues/9497)) ([59d9271](https://github.com/Akylas/NativeScript/commit/59d9271bce1c82486af78f993d034ce412d89cf2))

### Bug Fixes

* allow to ignore `reduce-css-calc` with webpack without error ([785b16a](https://github.com/Akylas/NativeScript/commit/785b16a642e3d29b4bfdca6352dfb2190e0460bd))
* android support for clipToBounds ([c9e87e8](https://github.com/Akylas/NativeScript/commit/c9e87e87f9c0d79c92cb6a1ea11a568d491b2028))
* **android:** allow 0-length properties ([#9485](https://github.com/NativeScript/NativeScript/issues/9485)) ([d45dea8](https://github.com/Akylas/NativeScript/commit/d45dea84710896d53f83e092262f349afa9adc03))
* **android:** do not call exitEvent on activity restart ([#9517](https://github.com/NativeScript/NativeScript/issues/9517)) ([2f630dc](https://github.com/Akylas/NativeScript/commit/2f630dc464e82a325e10343ee84deb5b666b2bfa))
* **android:** dont dispose fragment on onloaded ([#8793](https://github.com/NativeScript/NativeScript/issues/8793)) ([2dd2970](https://github.com/Akylas/NativeScript/commit/2dd2970c7d421021203e3342feb7666c3f333b2b))
* **android:** make less calls to native with getters around prop handling ([#9119](https://github.com/NativeScript/NativeScript/issues/9119)) ([a76815b](https://github.com/Akylas/NativeScript/commit/a76815b81e0dbbcfa9b3ba93e8857d44c4a01c30))
* **android:** onSaveInstanceState should not crash when no rootView is set ([#9447](https://github.com/NativeScript/NativeScript/issues/9447)) ([37c0731](https://github.com/Akylas/NativeScript/commit/37c0731a8a58cd4cc0a35b69962c1b7cbd464f22))
* **android:** prevent potential crash when app goes to background ([#9347](https://github.com/NativeScript/NativeScript/issues/9347)) ([e7b30af](https://github.com/Akylas/NativeScript/commit/e7b30af39472371919f364f46a869b68469aac9d))
* **android:** use `nativeTextViewProtected` internally ([#9483](https://github.com/NativeScript/NativeScript/issues/9483)) ([0d0d038](https://github.com/Akylas/NativeScript/commit/0d0d0382ad238e0df1332506741142e02e01e34c))
* autofillType pre 26 ([8f32241](https://github.com/Akylas/NativeScript/commit/8f322413eac93925575c1b9482008d2f644191d8))
* color fixes for hsl / hsv ([9664f4b](https://github.com/Akylas/NativeScript/commit/9664f4b9138ee970fc88e1358f667102e372f751))
* Color.darken fix ([da96e66](https://github.com/Akylas/NativeScript/commit/da96e661ce191d408748610d2f0f4b509b03a6e1))
* **core:** android broken navigation after go back to root on navDepth > 2 ([c945997](https://github.com/Akylas/NativeScript/commit/c945997332413b7e8df21abe6b8dca1f4d53b897))
* **core:** correctly export setAutoSystemAppearanceChanged ([#9489](https://github.com/NativeScript/NativeScript/issues/9489)) ([d0f00e2](https://github.com/Akylas/NativeScript/commit/d0f00e24d8a1b5019e51316e7a3a858ff1835075))
* **core:** prevent iOS views to be measured if no native view ([4e97e71](https://github.com/Akylas/NativeScript/commit/4e97e71da29d4642c9310b366bfc98ba16ca4d84))
* css colors not parsed correctly within background property ([433053c](https://github.com/Akylas/NativeScript/commit/433053cf6eefe47b874df3ff24ad765a86ced651))
* css faster color parsing ([2005bd5](https://github.com/Akylas/NativeScript/commit/2005bd59274c91adfb7f6838fc938fdce82b43ac))
* finally Color.hex should be good ([276b130](https://github.com/Akylas/NativeScript/commit/276b130ed8eebce1704dd995d34fe394f1667451))
* **frame:** improve weakref guards ([#9518](https://github.com/NativeScript/NativeScript/issues/9518)) ([b7b9d7c](https://github.com/Akylas/NativeScript/commit/b7b9d7c259a4e970675ebb727f9ffa47a1d80acd))
* hsl/hsv support for css % ([e2f579a](https://github.com/Akylas/NativeScript/commit/e2f579aa1bcaf2bfe2e03dca37f143a7c542b1ef))
* iOS crash on iOS 14 when onLayout is called without a nativeView ([ae19318](https://github.com/Akylas/NativeScript/commit/ae193189ae5b11a6f98ca516e96d04fd3b16ff7c))
* **ios:** backgroundColor property on Button ([#9524](https://github.com/NativeScript/NativeScript/issues/9524)) ([c3cadc7](https://github.com/Akylas/NativeScript/commit/c3cadc7fd5c7afab37daf667227b4d55d7e07196)), closes [NativeScript/NativeScript#9523](https://github.com/NativeScript/NativeScript/issues/9523)
* linear-gradient fix for hex colors with alpha ([02d90f7](https://github.com/Akylas/NativeScript/commit/02d90f7949c6dc74b71f7ba87fc28c84861594c5))
* **log:** Allow passing optional params for logs ([#9456](https://github.com/NativeScript/NativeScript/issues/9456)) ([7b80094](https://github.com/Akylas/NativeScript/commit/7b800945ddcec9efa8e7442a7f510913171b2b90))
* more text base fixes for plugins using `nativeTextViewProtected` ([2c8ff31](https://github.com/Akylas/NativeScript/commit/2c8ff3191c54d3b359486e024c60bfde38805e57))
* some color functions fixes ([ba773c7](https://github.com/Akylas/NativeScript/commit/ba773c78ae057fc9030cf92377d6fa640bbcba62))
* **styling:** change transform parameters parsing ([#9481](https://github.com/NativeScript/NativeScript/issues/9481)) ([2a45637](https://github.com/Akylas/NativeScript/commit/2a4563716aa15e4e774b1e033b36a178cf4d51e9)), closes [#5202](https://github.com/NativeScript/NativeScript/issues/5202)
* suspendRequestLayout not being reset to the right state ([46b4b64](https://github.com/Akylas/NativeScript/commit/46b4b6409fa3b5d113ff0ccedaaa4d251bbcd9f4))
* tsc errors fix ([00b0794](https://github.com/Akylas/NativeScript/commit/00b07947468017170235fc5fe5a9dd02f7224552))

### Reverts

* feat(android): fragment transactions to use 'add' instead of 'replace' on fwd navigation ([#8791](https://github.com/NativeScript/NativeScript/issues/8791)) ([3e98d1e](https://github.com/Akylas/NativeScript/commit/3e98d1e93409f9d3d6a6e08f2156662e83234b68))

## 8.0.8-core (2021-06-15)

### Features

* decimal keyboard ([d602d11](https://github.com/Akylas/NativeScript/commit/d602d112c5d68e1eb9fbd0a12991f92e4c18f540))

### Bug Fixes

* accessibilityIdentifier fix for nativeTextViewProtected ([e42e915](https://github.com/Akylas/NativeScript/commit/e42e9157c98eb7ef33f77fed034649d5d848c02c))
* **android:** accessibilityIdentifier ([#9432](https://github.com/NativeScript/NativeScript/issues/9432)) ([9f582ba](https://github.com/Akylas/NativeScript/commit/9f582ba168dd6f4366e2591a9fed10e1c2443ca4))
* color hex getter fix ([97a94e8](https://github.com/Akylas/NativeScript/commit/97a94e82a891a0383eeb0846158428d276db85e6))
* stop leaking style scopes ([#9444](https://github.com/NativeScript/NativeScript/issues/9444)) ([b8d8110](https://github.com/Akylas/NativeScript/commit/b8d8110994ecb5a882e89ae10e7b13070ae4d709)), closes [#9311](https://github.com/NativeScript/NativeScript/issues/9311)

## 8.0.7-core (2021-06-02)

### Features

* **WebView:** allow JS bound window frame navigation to be intercepted through loadStarted ([#9430](https://github.com/NativeScript/NativeScript/issues/9430)) ([3806b85](https://github.com/Akylas/NativeScript/commit/3806b85fcef01ad34327dda9cc2c88619b522c74))

### Bug Fixes

* **animations:** stop keyframe animations after View unloaded ([#9421](https://github.com/NativeScript/NativeScript/issues/9421)) ([04381fa](https://github.com/Akylas/NativeScript/commit/04381fa3e74e9c277970fb282223abedd937b4c1))
* **box-shadow:** support for 'none' ([#9418](https://github.com/NativeScript/NativeScript/issues/9418)) ([263c920](https://github.com/Akylas/NativeScript/commit/263c920cb8a4b22e257033006ce585ec32ca2605))
* **core:** guard unstable page/frame init contexts under async conditions ([#9428](https://github.com/NativeScript/NativeScript/issues/9428)) ([d3bc4d5](https://github.com/Akylas/NativeScript/commit/d3bc4d5b82879ccb83483f99585127d981b43b38))
* **core:** typings for Utils.queueMacrotask and static methods on Observable ([#9425](https://github.com/NativeScript/NativeScript/issues/9425)) ([d589ac6](https://github.com/Akylas/NativeScript/commit/d589ac600063416f3725c0abf8dfc88f556166db))

## 8.0.6-core (2021-05-20)

### Features

* **text-view:** add returnPress ([#9390](https://github.com/NativeScript/NativeScript/issues/9390)) ([64adf5e](https://github.com/Akylas/NativeScript/commit/64adf5ecfce5cae1582cbbf7d704e2ef9b75dd01)), closes [#4882](https://github.com/NativeScript/NativeScript/issues/4882)
* **Utils:** add dismissSoftInput helper ([#9392](https://github.com/NativeScript/NativeScript/issues/9392)) ([6cf4c59](https://github.com/Akylas/NativeScript/commit/6cf4c5981b866c8a164eea0d53fd4c93875e8ba0)), closes [#4594](https://github.com/NativeScript/NativeScript/issues/4594)
* **web-view:** disableZoom property ([#9391](https://github.com/NativeScript/NativeScript/issues/9391)) ([7e878f8](https://github.com/Akylas/NativeScript/commit/7e878f83a39478a7a33d89f08579df97db70fe00))

### Bug Fixes

* **a11y:** add missing application event for fontScaleChanged ([#9396](https://github.com/NativeScript/NativeScript/issues/9396)) ([dac36c6](https://github.com/Akylas/NativeScript/commit/dac36c68015512553689f6803d147da92f89cd93))
* **a11y:** font size ([#9395](https://github.com/NativeScript/NativeScript/issues/9395)) ([7a92c16](https://github.com/Akylas/NativeScript/commit/7a92c1646f92f8afb9f8a87306cc90e8d2043e91))
* **Device:** don't cache device language & region ([#9394](https://github.com/NativeScript/NativeScript/issues/9394)) ([95596e8](https://github.com/Akylas/NativeScript/commit/95596e82302bb945e6bf2126f19d9245e358cb79)), closes [#6082](https://github.com/NativeScript/NativeScript/issues/6082)
* **ios:** image with alpha resize ([#9386](https://github.com/NativeScript/NativeScript/issues/9386)) ([f380782](https://github.com/Akylas/NativeScript/commit/f380782766b7034e4f776ad78e941fd9ac405c0b)), closes [#9385](https://github.com/NativeScript/NativeScript/issues/9385)
* **RootLayout:** prevent android touch event to pass through views underneath ([#9389](https://github.com/NativeScript/NativeScript/issues/9389)) ([0b2c190](https://github.com/Akylas/NativeScript/commit/0b2c190662ceb63524049ac7792643414510858d))

## 8.0.5-core (2021-05-10)

### Bug Fixes

* **android:** image asset handling regarding requestLegacyExternalStorage ([#9373](https://github.com/NativeScript/NativeScript/issues/9373)) ([f311151](https://github.com/Akylas/NativeScript/commit/f3111514960ada615a69418b906620a638f8f476))

## 8.0.4-core (2021-05-05)

### Features

* add additional android global methods ([#9365](https://github.com/NativeScript/NativeScript/issues/9365)) ([a6cb46d](https://github.com/Akylas/NativeScript/commit/a6cb46dac2d671221d9c0e972e8db89961b3e7c2))

### Bug Fixes

* **core:** typings for showModal correction ([#9374](https://github.com/NativeScript/NativeScript/issues/9374)) ([9ec4042](https://github.com/Akylas/NativeScript/commit/9ec404225ef0cff5f82d759fcdc7b85952e65c0d))

## 8.0.3-core (2021-04-24)

### Bug Fixes

* **core:** protected class getter/setter webpack issue ([f781242](https://github.com/Akylas/NativeScript/commit/f781242b9a5a407a8673b0ffb5ae6b49f0750e27))
* **core:** typings issue around Trace.categories.All ([5fd821e](https://github.com/Akylas/NativeScript/commit/5fd821e5628dcbab280fcf15cb98e49822072d65))

## 8.0.2-core (2021-04-20)

### Features

* abortcontroller pollyfill ([de97f3b](https://github.com/Akylas/NativeScript/commit/de97f3b4c77d7b88b4743b8106037152019c044f))
* closingModally event ([9618a65](https://github.com/Akylas/NativeScript/commit/9618a65d86331a76ddfd88a35881cc928d96f921))
* **text-base:** allow subclass to override createFormattedTextNative ([#9334](https://github.com/NativeScript/NativeScript/issues/9334)) ([b29e145](https://github.com/Akylas/NativeScript/commit/b29e1452bda27183993c2f27ab13f95d9da5ceee))

### Bug Fixes

* **a11y:** Accessibility breaks limiting metadata ([#9332](https://github.com/NativeScript/NativeScript/issues/9332)) ([cbdff1f](https://github.com/Akylas/NativeScript/commit/cbdff1f1550a4e7cf06ccd4f01c5cd743c68e265))
* **a11y:** ios voiceover crash during touch ([#9318](https://github.com/NativeScript/NativeScript/issues/9318)) ([9a407ce](https://github.com/Akylas/NativeScript/commit/9a407ce98964832c52cd51dc0ab60662fc65abb5))
* allow subclass to override createFormattedTextNative ([ed154b8](https://github.com/Akylas/NativeScript/commit/ed154b8055ab4f1a3932294f08a444580c2fb596))
* **android:** prevent possible crash when app goes to background ([d551693](https://github.com/Akylas/NativeScript/commit/d5516937269f3169a6203da8a4f1065b2377993e))
* port boxshadow to background improvements ([3f5ec34](https://github.com/Akylas/NativeScript/commit/3f5ec3440d8ee1751075bd5d16450c697e6ef244))

## 8.0.1-core (2021-04-07)

### Features

* **core:** box shadow demo ([#9182](https://github.com/NativeScript/NativeScript/issues/9182)) ([3bd2d96](https://github.com/Akylas/NativeScript/commit/3bd2d96f296b57a1b7bedc48530e55c15f963ac2))
* **core:** box-shadow support ([#9161](https://github.com/NativeScript/NativeScript/issues/9161)) ([67e2fe4](https://github.com/Akylas/NativeScript/commit/67e2fe42b7dc8fcc907c40d8c27a08e1e6d3e683))
* **core:** convenient color utilities ([#9066](https://github.com/NativeScript/NativeScript/issues/9066)) ([304633d](https://github.com/Akylas/NativeScript/commit/304633d6b26e8181bdd052300e40f138c09ebddc))
* **core:** first class a11y support ([#8909](https://github.com/NativeScript/NativeScript/issues/8909)) ([d5a8a25](https://github.com/Akylas/NativeScript/commit/d5a8a25aba1ee38b62c7cf424047a5c65e3bd9e1))
* **core:** reusable views ([#9163](https://github.com/NativeScript/NativeScript/issues/9163)) ([6cc130f](https://github.com/Akylas/NativeScript/commit/6cc130fa6f9a716789e00e64f92a5b09dba7f358))
* **core:** RootLayout with api to fluidly handle dynamic layers ([#8980](https://github.com/NativeScript/NativeScript/issues/8980)) ([a90609a](https://github.com/Akylas/NativeScript/commit/a90609a670ebbdfda7f31bea0e42e7de93875e69))
* **core:** text-shadow support ([#8991](https://github.com/NativeScript/NativeScript/issues/8991)) ([a6b1bde](https://github.com/Akylas/NativeScript/commit/a6b1bde655aff61ac1afa682672026817971c2a5))
* implement BoxShadowDrawable ([9a7d3ec](https://github.com/Akylas/NativeScript/commit/9a7d3ecb34887fffa572ce105ebc23bf21ba11ec))
* implement spreadRadius ([fca3466](https://github.com/Akylas/NativeScript/commit/fca3466408f282d2763d4501b8489ece54d29905))
* improved css-shadow parser ([d2f50e5](https://github.com/Akylas/NativeScript/commit/d2f50e50bba6e3b11fee14fa2f64034f02f8672f))
* **observable-array:** findIndex now supported ([770030e](https://github.com/Akylas/NativeScript/commit/770030e7f61cd5006c67994051d4bfad5ce6c502))
* **view:** "hidden" property binding is now supported ([f00144e](https://github.com/Akylas/NativeScript/commit/f00144e872c908f98949e0173db778ccec8fdcf0))

### Bug Fixes

* **android:** accessibility crash on View not extending android.view.View ([#9303](https://github.com/NativeScript/NativeScript/issues/9303)) ([fde666d](https://github.com/Akylas/NativeScript/commit/fde666de28ae58cd00cae6ce37705427b579a58f))
* **android:** crash on slide transition ([#9289](https://github.com/NativeScript/NativeScript/issues/9289)) ([e73cebf](https://github.com/Akylas/NativeScript/commit/e73cebf7650474cb71de4a17576860a3499f9c05))
* **android:** crash with slide transition ([aae9273](https://github.com/Akylas/NativeScript/commit/aae9273aa25f497d4b1ff53a6a12f4d236f80179))
* **button:** ios let the gesture observer handles tap events ([a2d06a9](https://github.com/Akylas/NativeScript/commit/a2d06a9efeecc4fbd8f900560eb638863002bb86))
* **color:** support web standard [#rrggbbaa](https://github.com/NativeScript/NativeScript/issues/rrggbbaa) format ([aaeab99](https://github.com/Akylas/NativeScript/commit/aaeab990c8f73d206bf19e1c918ec45e30d9e3a5)), closes [#ff00ff00](https://github.com/NativeScript/NativeScript/issues/ff00ff00) [#ff00ff00](https://github.com/NativeScript/NativeScript/issues/ff00ff00) [#00ff00](https://github.com/NativeScript/NativeScript/issues/00ff00) [#00ff00](https://github.com/NativeScript/NativeScript/issues/00ff00)
* **core:** Enums deprecation adjustment ([#9306](https://github.com/NativeScript/NativeScript/issues/9306)) ([f42acd8](https://github.com/Akylas/NativeScript/commit/f42acd817f5353f86ba353ff483ff8d0e7bf7a61))
* **core:** stack layout padding ([#9183](https://github.com/NativeScript/NativeScript/issues/9183)) ([a12c188](https://github.com/Akylas/NativeScript/commit/a12c188d0fa752f35be3daeafd14099e8589d815)), closes [#8810](https://github.com/NativeScript/NativeScript/issues/8810)
* **core:** trace instead of throw ([cc592b6](https://github.com/Akylas/NativeScript/commit/cc592b63fddda324755f8abc0e0c4029a7dbeb22))
* **core:** type collisions with namespace ([#8809](https://github.com/NativeScript/NativeScript/issues/8809)) ([7330509](https://github.com/Akylas/NativeScript/commit/733050995c5b28692e11c3bc122430c8634e29d4))
* **ios:** gesture touch event coordinates improvements ([#8998](https://github.com/NativeScript/NativeScript/issues/8998)) ([d46f956](https://github.com/Akylas/NativeScript/commit/d46f9562b4cb5a6f31c0afd4b63ff640583193c3))
* **ios:** incorrect declaration of 'jsArrayToNSArray' and 'nsArrayToJSArray' ([#9277](https://github.com/NativeScript/NativeScript/issues/9277)) ([e9e4934](https://github.com/Akylas/NativeScript/commit/e9e4934fafdc10fca5892eccb3b40139c414d148))
* **layouts:** rootlayout not closing when no shadecover transition specified ([#9278](https://github.com/NativeScript/NativeScript/issues/9278)) ([3c569ef](https://github.com/Akylas/NativeScript/commit/3c569effedbc593e845c42bd396ff68a0d72171d))
* move BottomNavigation and Tabs to [@nativescript-community](https://github.com/nativescript-community) ([e62acba](https://github.com/Akylas/NativeScript/commit/e62acba79243a91da6a0e915b47751daac3c985e))
* prevent error if navigationTransition is null or undefined ([56a3f9b](https://github.com/Akylas/NativeScript/commit/56a3f9bd3cf3d2fe7a81c1fcacbcf822c4154cea))
* RootLayout default open options ([eeb68e9](https://github.com/Akylas/NativeScript/commit/eeb68e9ce242616cc0d0b05bc5667540fa7bd424))
* safeguards against invalid values ([f5db584](https://github.com/Akylas/NativeScript/commit/f5db58414a7d5ab7052c5fbd94a602fd870826b4))

## 7.3.0-core (2021-02-27)

### ⚠ BREAKING CHANGES

* **core:** AndroidTransitionType is now a static member of the Transition class.

BEFORE:

```
import { AndroidTransitionType } from '@nativescript/core/ui/transition';
```

AFTER:

```
import { Transition } from '@nativescript/core';
Transition.AndroidTransitionType.enter; // etc.
```
* **android:** If you were using`native.Array` for any of your own custom plugin typings, you can switch them to `androidNative.Array`

BEFORE:

```
public writeAsync(path: string, bytes: native.Array<number>) ...
```

AFTER:

```
public writeAsync(path: string, bytes: androidNative.Array<number>) ...
```

### Features

* **android:** Add possibility to choose theme in android dialogs ([#9212](https://github.com/NativeScript/NativeScript/issues/9212)) ([e7951b3](https://github.com/Akylas/NativeScript/commit/e7951b320f4178024a4cb5b92bab0761517a68bb))
* **android:** types for API Level 30 and cleanup ([#9219](https://github.com/NativeScript/NativeScript/issues/9219)) ([ebcc0e2](https://github.com/Akylas/NativeScript/commit/ebcc0e2cc0e14d2042582901d36d4cfece7fae58))
* **core:** allow property overrides at runtime ([#9241](https://github.com/NativeScript/NativeScript/issues/9241)) ([c04e1b5](https://github.com/Akylas/NativeScript/commit/c04e1b59e5f1a1fa48d2048c02821b97807a2c5e))

### Bug Fixes

* **android:** KeyboardType now respects numbers ([#9240](https://github.com/NativeScript/NativeScript/issues/9240)) ([f08fcb1](https://github.com/Akylas/NativeScript/commit/f08fcb17b49540126367f75d28499e5904e12106))
* **android:** NestedScrollView default ScrollBarEnabled is false ([3ce1caa](https://github.com/Akylas/NativeScript/commit/3ce1caa777575a530f3a8190c113687d5399de47))
* **android:** rewrote the transition system ([a4d7674](https://github.com/Akylas/NativeScript/commit/a4d7674abaac9f95f91112d0611d4f94eeb543dd))
* **android:** vertical scroll-view now uses NestedScrollView ([5baec25](https://github.com/Akylas/NativeScript/commit/5baec2579d8b5879080b2a97b91c0c1c0fb7ac46))
* automated tests are now passing ([016313b](https://github.com/Akylas/NativeScript/commit/016313bef1e139228a8d336c59f7d1d868b302de))
* **bottom-navigation:** fragment handling ([#9244](https://github.com/NativeScript/NativeScript/issues/9244)) ([c8ef6f2](https://github.com/Akylas/NativeScript/commit/c8ef6f2ab3d3cd854a92dfecd0e8b2605c00f3af))
* **core:** AndroidTransitionType symbol export handling ([#9252](https://github.com/NativeScript/NativeScript/issues/9252)) ([ac7f041](https://github.com/Akylas/NativeScript/commit/ac7f041deada46bfe3bbd8359c02e9224155efd8))
* refactor background handling. ([5fc7d1a](https://github.com/Akylas/NativeScript/commit/5fc7d1a4d4b784c755026cde6105b73cd6a65730))
* refactor background handling. ([d699bf0](https://github.com/Akylas/NativeScript/commit/d699bf0033d557d67e8f95d5111f651b00b6a58f))
* **xhr:** remove unnecessary throw when event not supported ([#9251](https://github.com/NativeScript/NativeScript/issues/9251)) ([11ef943](https://github.com/Akylas/NativeScript/commit/11ef94349588aca23e27b2cfaf0a3e4f93df649e))

## 7.2.1-core (2021-02-07)

### Features

* **android:** FlexboxLayout support for isPassThroughParentEnabled ([#8798](https://github.com/NativeScript/NativeScript/issues/8798)) ([5fe2742](https://github.com/Akylas/NativeScript/commit/5fe27428e07a267454a5fcfa8584ba688bf0baef))
* **core:** setSelection method for editable text components ([#9175](https://github.com/NativeScript/NativeScript/issues/9175)) ([58b2542](https://github.com/Akylas/NativeScript/commit/58b254299770b362e0c5baee36000ec81b57335a))
* **ios:** build TNSWidgets as XCFramework ([#9167](https://github.com/NativeScript/NativeScript/issues/9167)) ([04a7641](https://github.com/Akylas/NativeScript/commit/04a76415b785ca419d057d570fc71f61b7d3bb83))

### Bug Fixes

* **android:** prevent “flashing” activity on app start ([f80e6c6](https://github.com/Akylas/NativeScript/commit/f80e6c6be655c3c56be7da664bd2008c2eba478e))
* **core:** conflicting node global types ([#9197](https://github.com/NativeScript/NativeScript/issues/9197)) ([de7006b](https://github.com/Akylas/NativeScript/commit/de7006b04d1fb2209b8f6efeafbc2a16d4a1d83d))
* **core:** ObservableArray splice with start only ([#9159](https://github.com/NativeScript/NativeScript/issues/9159)) ([3ddfb5c](https://github.com/Akylas/NativeScript/commit/3ddfb5c34a3f7d7ad9d092a87b1cfebbc2ab5b07))
* **ios:** allow navigationFrom event for deep navigation within modal frame ([#9187](https://github.com/NativeScript/NativeScript/issues/9187)) ([8f1455e](https://github.com/Akylas/NativeScript/commit/8f1455eef71a4feaaffe4fb2aca4e49da0bc0670))
* **ios:** force release of nsdata after saving image ([#9177](https://github.com/NativeScript/NativeScript/issues/9177)) ([e002d72](https://github.com/Akylas/NativeScript/commit/e002d72d41b7a006788fcd38feb51a7b3c1ef870))
* **ios:** navigation via swipe crash fix ([#9132](https://github.com/NativeScript/NativeScript/issues/9132)) ([28061e3](https://github.com/Akylas/NativeScript/commit/28061e3d39fe713d78f1191a5c7e31dda7941ac1))
* **ios:** textfield resizing (auto width) on text change ([#9176](https://github.com/NativeScript/NativeScript/issues/9176)) ([c31bab1](https://github.com/Akylas/NativeScript/commit/c31bab1bf73af7f90ff3c5c90a22b86a682137ea))
* **page:** frame getter for custom Frames ([#9195](https://github.com/NativeScript/NativeScript/issues/9195)) ([6da7d90](https://github.com/Akylas/NativeScript/commit/6da7d90e256d220db79e245228b91d5fa8e41984))

### Performance Improvements

* **android:** faster background color setter ([#9120](https://github.com/NativeScript/NativeScript/issues/9120)) ([e501273](https://github.com/Akylas/NativeScript/commit/e501273d166b0e6f8b3746d508e97099525cea0a))
* **core:** no need for batchUpdated if no selector ([#9121](https://github.com/NativeScript/NativeScript/issues/9121)) ([3a14a0a](https://github.com/Akylas/NativeScript/commit/3a14a0a7609e3a63ab204993158c8fd6460422b3))

### Reverts

* perf(core): no need for batchUpdated if no selector ([#9121](https://github.com/NativeScript/NativeScript/issues/9121)) ([4b96d4b](https://github.com/Akylas/NativeScript/commit/4b96d4baa03d23b0488ec724f123caf2cb81a5f5))

## 7.1.4-core (2021-01-23)

### Bug Fixes

* added the same for didDisappear ([a58baac](https://github.com/Akylas/NativeScript/commit/a58baac2f18e8b6da8839699f177f1dd9e63fb51))
* all plugins to react on modal page close on ios ([777fdb9](https://github.com/Akylas/NativeScript/commit/777fdb91b0be2cc05cf0e7b832b073126bb13f3c))
* **ios:** getVisibleViewController maximum call stack exceeded ([#9168](https://github.com/NativeScript/NativeScript/issues/9168)) ([1a3523e](https://github.com/Akylas/NativeScript/commit/1a3523ef22f15574ce5658429a4c18eb141ab881))

## 7.1.3-core (2021-01-17)

### Bug Fixes

* **android:** BottomNavigation fragment child already has a parent ([#9148](https://github.com/NativeScript/NativeScript/issues/9148)) ([4690162](https://github.com/Akylas/NativeScript/commit/4690162384c731d6d652d90a9347cae06c0a0e0c))

## 7.1.2-core (2021-01-14)

### Features

* **core:** rollup additional Utils ([882aa42](https://github.com/Akylas/NativeScript/commit/882aa42e8573615aa5ba89396d0f0cdbb711bed3))

## 7.1.1-core (2021-01-13)

### Features

* **android:** setInterval closer to web spec ([#9044](https://github.com/NativeScript/NativeScript/issues/9044)) ([1769de9](https://github.com/Akylas/NativeScript/commit/1769de903392ab14ffb6c366ab86dc24b5289e81))
* color methods ([44ee97b](https://github.com/Akylas/NativeScript/commit/44ee97b29d18471afa3185fa4500bdc6f2773f89))
* color methods ([aa2ba2c](https://github.com/Akylas/NativeScript/commit/aa2ba2c3749e86404663051ee5b62c7988632652))
* **core:** allow app to start without a root view ([#9056](https://github.com/NativeScript/NativeScript/issues/9056)) ([bd7c686](https://github.com/Akylas/NativeScript/commit/bd7c686aaf55d26b2b483905bd5e0a453429cabd))
* **core:** queueMacroTask ([#8904](https://github.com/NativeScript/NativeScript/issues/8904)) ([e3dc89f](https://github.com/Akylas/NativeScript/commit/e3dc89fbfc4dd8030097c7831479eb18cf23d8eb))
* disableCss property for tests purpose ([4d608f3](https://github.com/Akylas/NativeScript/commit/4d608f39b8db6ee386801519b176d88172b2d4a3))
* **frame:** add navigatingTo and navigatedTo events ([#9025](https://github.com/NativeScript/NativeScript/issues/9025)) ([cf96e72](https://github.com/Akylas/NativeScript/commit/cf96e7252cdf66230cc03ddec907168e47d1f250))
* global autoRegisterUIModules to disable auto ui registering ([01e9d97](https://github.com/Akylas/NativeScript/commit/01e9d9706275d65b698e34ae1b5a409282868fe0))
* ios added ignoreSafeArea property ([6f9d052](https://github.com/Akylas/NativeScript/commit/6f9d0527c0d357f74b29627bebbc1d15a56d8b3e))
* iosIgnoreSafeArea property ([#9092](https://github.com/NativeScript/NativeScript/issues/9092)) ([ea67422](https://github.com/Akylas/NativeScript/commit/ea67422fcf3106db1359a358e897a63827a642f3))
* **ios:** types for latest ios 14.3 with Xcode 12.3 ([#9118](https://github.com/NativeScript/NativeScript/issues/9118)) ([9aad2db](https://github.com/Akylas/NativeScript/commit/9aad2dbdbcf7e786183af9abbf16b4009c756ae3))

### Bug Fixes

* added Color.mix ([619a3f0](https://github.com/Akylas/NativeScript/commit/619a3f014fe8d8f0ee0c1decd53ca5d2d861ba9a))
* added Color.mix ([75ceedf](https://github.com/Akylas/NativeScript/commit/75ceedf1abb44c33d597e971834fa2814f304d54))
* android ActivityIndicator custom color affecting other indicators on the page ([#9026](https://github.com/NativeScript/NativeScript/issues/9026)) ([e16bc60](https://github.com/Akylas/NativeScript/commit/e16bc606ef6ed506cbc38e50247a59637d898b50))
* android modal not following activity windowSoftInputMode ([#9042](https://github.com/NativeScript/NativeScript/issues/9042)) ([d09a564](https://github.com/Akylas/NativeScript/commit/d09a564296669dcffd03cd32b18f7a6454c7c472))
* android Tabs selected item color incorrectly applied ([#9040](https://github.com/NativeScript/NativeScript/issues/9040)) ([b47ce0a](https://github.com/Akylas/NativeScript/commit/b47ce0a97c38547d060fb4626df02d63f518f721))
* **android:** dont create a borderDrawable if not necessary. ([1894944](https://github.com/Akylas/NativeScript/commit/1894944b41010ce09b6a151d75a2d0cdf23d118f))
* **android:** refactor to make less calls to native ([ce84a20](https://github.com/Akylas/NativeScript/commit/ce84a200b0225e1fc09a2fda4cb74c5a4e1ac8cd))
* **android:** when possible only call setBackgroundColor ([96fac04](https://github.com/Akylas/NativeScript/commit/96fac04dd98327f88a9140c98f7be6c1057cba10))
* **compat:** add screen and device aliases ([#9088](https://github.com/NativeScript/NativeScript/issues/9088)) ([4204ac8](https://github.com/Akylas/NativeScript/commit/4204ac8308eda902efd787ce96971463eab343ab))
* **core:** const initializer in an ambient context ([#9136](https://github.com/NativeScript/NativeScript/issues/9136)) ([47ebb1d](https://github.com/Akylas/NativeScript/commit/47ebb1d262aa9ebf29fe445e57d19910612d047f)), closes [#9135](https://github.com/NativeScript/NativeScript/issues/9135)
* **core:** notify object now optional ([#9032](https://github.com/NativeScript/NativeScript/issues/9032)) ([539fd1e](https://github.com/Akylas/NativeScript/commit/539fd1eb293241dc067bfdcc77613b0eb67b099f))
* **core:** prevent circular reference Frame <> Page ([#9111](https://github.com/NativeScript/NativeScript/issues/9111)) ([9a380cd](https://github.com/Akylas/NativeScript/commit/9a380cd43e2ebff852155647e83b803b82a8a94b))
* default view to clickable so touches dont get “passed through” ([8aa2ef8](https://github.com/Akylas/NativeScript/commit/8aa2ef867c5e5b271f3a020152e101be3b051933))
* ensure it works when no viewControllerView ([ee544d7](https://github.com/Akylas/NativeScript/commit/ee544d788575a5ffef1a5555f12d6b58c7ea78a3))
* ensure we dont get udplicates in oldProperties and newPropertyValues ([ca1c9f2](https://github.com/Akylas/NativeScript/commit/ca1c9f25197ed2cada297187bfeac1ef6cc956aa))
* ensure we dont get udplicates in oldProperties and newPropertyValues ([512c552](https://github.com/Akylas/NativeScript/commit/512c552b5be05295695b2f7b920d6dc653b4c2ed))
* faster colors handling ([bb4468b](https://github.com/Akylas/NativeScript/commit/bb4468ba1e06a0f719bae8da17aa5baf5e93a795))
* first pass at improving requestLayout ([1582f6c](https://github.com/Akylas/NativeScript/commit/1582f6c035b424f428aeb8d0ec101841f78f917f))
* fix regression after colors simplifications ([5a61587](https://github.com/Akylas/NativeScript/commit/5a6158768d4fe30439de9f4e91da5914daacddb7))
* fix regression after colors simplifications ([9609989](https://github.com/Akylas/NativeScript/commit/96099892ba83d28062997707a2f3150acabacc91))
* fix tsc errors ([407d57f](https://github.com/Akylas/NativeScript/commit/407d57ff6244919d0668121ac5ad26f02e40b6e1))
* improve Color performances. ([4ef99ab](https://github.com/Akylas/NativeScript/commit/4ef99ab64fdcb75345b07e38bf1edd07db042132))
* improve Color performances. ([427001a](https://github.com/Akylas/NativeScript/commit/427001a5a4c4b8e7bfb8bf2840870d8f15725325))
* **ios:** ios 10 tab crash ([#9018](https://github.com/NativeScript/NativeScript/issues/9018)) ([b3f9c0d](https://github.com/Akylas/NativeScript/commit/b3f9c0d0ac656f413653d79d5eb9fcb1a6e1ca0f))
* **list-view:** handle reusing wrong view ([#9023](https://github.com/NativeScript/NativeScript/issues/9023)) ([64e0aa6](https://github.com/Akylas/NativeScript/commit/64e0aa6a114c414ad190696919d4b206b637f61f))
* make object optional in notify ([4033367](https://github.com/Akylas/NativeScript/commit/40333670b42bd895222ff525c7e1c1b023250f84))
* missing mix color typings ([2c59024](https://github.com/Akylas/NativeScript/commit/2c59024507f7b689181ba4dfb11e385c1852ff5c))
* missing mix color typings ([b6b36cf](https://github.com/Akylas/NativeScript/commit/b6b36cf943243a9756b93c5a14db837a00574680))
* more rollbacks ([22e686d](https://github.com/Akylas/NativeScript/commit/22e686d09827482bc12f2da710be948d75d83afb))
* no need for batchUdated if no selector ([1c85549](https://github.com/Akylas/NativeScript/commit/1c85549ed3acbb6eb93bab3d866f046f308c65e4))
* only require parsers if need be ([17658ed](https://github.com/Akylas/NativeScript/commit/17658ed7770926c382e4794bb96142554d83af43))
* prevent circular reference && Cannot access … before initialization ([3accdb3](https://github.com/Akylas/NativeScript/commit/3accdb3f067157d45c88e58e2cca924afe7bd2c6))
* Prior PR ([#8904](https://github.com/NativeScript/NativeScript/issues/8904)) has bad path for trace modules ([1a849f9](https://github.com/Akylas/NativeScript/commit/1a849f93028c6936d978956541093fdc644f794c))
* rollback animation lint which would break promise context ([b85d0e5](https://github.com/Akylas/NativeScript/commit/b85d0e5ee3ed71cfc59c3f3cecbd137772c74f33))
* rollback regexp eslint changes ([ca56a30](https://github.com/Akylas/NativeScript/commit/ca56a30d56e70bbeded27745e92758f81063c06a))
* rollback regexp eslint changes ([#9028](https://github.com/NativeScript/NativeScript/issues/9028)) ([6902770](https://github.com/Akylas/NativeScript/commit/6902770d90213016d61ca465c1198c37672e1b8b))
* **tabs:** ios safeArea calculation ([#9089](https://github.com/NativeScript/NativeScript/issues/9089)) ([9391b44](https://github.com/Akylas/NativeScript/commit/9391b44996e833fc63f0b2bc4c6c90e47c12a3b8))
* tslib broken in 2.0.3 ([5b782ff](https://github.com/Akylas/NativeScript/commit/5b782ffb2e81879b915601d02b0ce0adab2949fd))
* typo fix ([328feeb](https://github.com/Akylas/NativeScript/commit/328feeb9c13fa36fb5da6add5aaaf3032a5bf633))

### Performance Improvements

* faster color parsing ([#9001](https://github.com/NativeScript/NativeScript/issues/9001)) ([c569236](https://github.com/Akylas/NativeScript/commit/c5692363575821ef588b2260e80ad5bbffe45293))

## 7.0.13-core (2020-10-28)

### Features

* **core:** Repeater multiple item templates implementation ([#8981](https://github.com/NativeScript/NativeScript/issues/8981)) ([b113f19](https://github.com/Akylas/NativeScript/commit/b113f1916db591d23327e7eead498c722ce76876))

### Bug Fixes

* android cleanup after new fragment handling ([e6fc878](https://github.com/Akylas/NativeScript/commit/e6fc8784e10187be2365f78fbab0dd9618b79645))
* android default modal animation ([67ee01e](https://github.com/Akylas/NativeScript/commit/67ee01e5fefec3cb90bed4a86b4b3ca9ce2ef1f2))
* **core:** ListViewCell.initWithEmptyBackground ([#8985](https://github.com/NativeScript/NativeScript/issues/8985)) ([0eb2246](https://github.com/Akylas/NativeScript/commit/0eb2246b7dfc3eda731f8cb7ee1bbfcd36551dfa))
* **ios:** UIImage.imageWithData.async is not a function ([b966542](https://github.com/Akylas/NativeScript/commit/b96654276b8e423a21f95261449f578470e027d8))

## 7.0.12-core (2020-10-21)

### Features

* **core:** TypeScript 4 + cleanup ([#8967](https://github.com/NativeScript/NativeScript/issues/8967)) ([2243660](https://github.com/Akylas/NativeScript/commit/2243660080ce6877d68a3f32fd64625f86023f77))

### Bug Fixes

* **android:** BottomNavigation error on back press (application exit) ([#8970](https://github.com/NativeScript/NativeScript/issues/8970)) ([99bb067](https://github.com/Akylas/NativeScript/commit/99bb067420871078c40454eec842fad6cbede0f7))
* **core:** ObservableArray tests and a typo ([#8968](https://github.com/NativeScript/NativeScript/issues/8968)) ([5c1b7f6](https://github.com/Akylas/NativeScript/commit/5c1b7f6d76c19877da1f47a0696dfbbd89b5fd00))

## 7.0.11-core (2020-10-10)

### Bug Fixes

* **ios:** iOS 10 support with adjustment to UILayoutGuide ([#8954](https://github.com/NativeScript/NativeScript/issues/8954)) ([ad25759](https://github.com/Akylas/NativeScript/commit/ad2575991aa53c1a1806dfd5dc5e368e1674d73c))

## 7.0.10-core (2020-10-03)

### Bug Fixes

* **core:** ensure globals do not get tree shaked ([#8931](https://github.com/NativeScript/NativeScript/issues/8931)) ([bf772c4](https://github.com/Akylas/NativeScript/commit/bf772c46b77fafc1be6493d9d0d01139b9b49242))

## 7.0.9-core (2020-10-01)

### Bug Fixes

* **android:** fragment onPause ([#8919](https://github.com/NativeScript/NativeScript/issues/8919)) ([a55bcd8](https://github.com/Akylas/NativeScript/commit/a55bcd8561ee229a67a92578ba25a6439b860302))
* **android:** make findPageForFragment with fragmen add/remove ([17ddbbb](https://github.com/Akylas/NativeScript/commit/17ddbbb9c1551b79658179770d3030f7063c326c))
* **core:** ObservableArray splice ensure index is > 0 ([#8921](https://github.com/NativeScript/NativeScript/issues/8921)) ([6d135e5](https://github.com/Akylas/NativeScript/commit/6d135e5d63ee34270e6452d0184fe40f45e2b5ec))

## 7.0.8-core (2020-09-29)

### Bug Fixes

* **core:** global index typing fix for unit testing framework ([#8915](https://github.com/NativeScript/NativeScript/issues/8915)) ([806fc88](https://github.com/Akylas/NativeScript/commit/806fc880dd944a8808a0f407ae5d0c0d4be55d5d))
* **core:** Observable splice index > length  ([#8900](https://github.com/NativeScript/NativeScript/issues/8900)) ([65b1cdb](https://github.com/Akylas/NativeScript/commit/65b1cdbae0a9e873a3d2bc4636038423351b794e))
* emitDecoratorMetadata fix ([2c4a77b](https://github.com/Akylas/NativeScript/commit/2c4a77bde0baec72ddd54e34e39a5a9c7e25c9d2))
* fix grid layout animation ([34e9617](https://github.com/Akylas/NativeScript/commit/34e9617162ba0c62f2226fab20eb7afdb12b7b93))
* **ios:** Utils.openFile ([#8914](https://github.com/NativeScript/NativeScript/issues/8914)) ([647926e](https://github.com/Akylas/NativeScript/commit/647926ee281712a82238d5153522d9a07be5870c))

## 7.0.7-core (2020-09-26)

### Bug Fixes

* **core:** delegate should be set on nativeTextViewProtected ([#8881](https://github.com/NativeScript/NativeScript/issues/8881)) ([021c0bb](https://github.com/Akylas/NativeScript/commit/021c0bb9a24f15a9adf9d5e25a981ea53901e600))
* **core:** global handling with env.production flag ([#8903](https://github.com/NativeScript/NativeScript/issues/8903)) ([3437ed7](https://github.com/Akylas/NativeScript/commit/3437ed7e1483cddf75aeca9bd8ff475e449f110f))
* **ios:** preferredDatePickerStyle property ([#8899](https://github.com/NativeScript/NativeScript/issues/8899)) ([dbefc43](https://github.com/Akylas/NativeScript/commit/dbefc43b9bb9b907883990f8d40c178fc7ecea9c))

## 7.0.5-core (2020-09-23)

### Bug Fixes

* **core:** bundle entry points and global handling ([#8884](https://github.com/NativeScript/NativeScript/issues/8884)) ([1f790ed](https://github.com/Akylas/NativeScript/commit/1f790edc8032fd36bde4b7a24e4d1c1c4b4dea49))

## 7.0.4-core (2020-09-23)

### Features

* **core:** global event handling ([#8830](https://github.com/NativeScript/NativeScript/issues/8830)) ([eb676fd](https://github.com/Akylas/NativeScript/commit/eb676fdedf9e3db750bb1c0e7b48194faed2c772))

### Bug Fixes

* **android-transitions:** remove hard-coded flip transition duration/curve ([#8851](https://github.com/NativeScript/NativeScript/issues/8851)) ([5f8d3d0](https://github.com/Akylas/NativeScript/commit/5f8d3d03f7eac1bdcb1cf4c338734298d2ba86ab))
* **ios:** text-view color refreshes properly after setting the text to keep the styles ([#8863](https://github.com/NativeScript/NativeScript/issues/8863)) ([313f476](https://github.com/Akylas/NativeScript/commit/313f47637e2fd3d95acb56499cf72e8d6cde7aec))
* **ios:** time-picker and date-picker for iOS 14 ([#8877](https://github.com/NativeScript/NativeScript/issues/8877)) ([45fb6c4](https://github.com/Akylas/NativeScript/commit/45fb6c481b3ae7b3df2cd9f666e1813bdbaff0c7))

## 7.0.3-types-ios (2020-09-12)

### Bug Fixes

* add missing configuration keys and move profiling out of android key ([#8847](https://github.com/NativeScript/NativeScript/issues/8847)) ([d69e568](https://github.com/Akylas/NativeScript/commit/d69e568a4b6505e1ceef33a56100996199bf2d4b))
* **core:** autoSystemAppearanceChanged typings in ambient context fix ([08b3caf](https://github.com/Akylas/NativeScript/commit/08b3cafb543a2eae3bb078b5fc6b077fb9b1561c))
* **core:** bundle-config-loader global handling ([#8838](https://github.com/NativeScript/NativeScript/issues/8838)) ([bd00e1f](https://github.com/Akylas/NativeScript/commit/bd00e1fa87093889b10e63302a40e1ecdbdaaa5c))

## 7.0.2-core (2020-09-10)

### Features

* add enableMultithreadedJavascript flag to config definition ([4abfc8a](https://github.com/Akylas/NativeScript/commit/4abfc8a370e3402e9566de078473f9e8deceff8b))
* boolean to disable systemAppearanceChanged (theme) ([b8df0b3](https://github.com/Akylas/NativeScript/commit/b8df0b3ac051a3e4437e87ed87c9659652255e6c))
* **core:** boolean to disable systemAppearanceChanged (theme) ([#8827](https://github.com/NativeScript/NativeScript/issues/8827)) ([5286adf](https://github.com/Akylas/NativeScript/commit/5286adf081cb75ea17251edd498266be7fe7189a))
* **core:** export additional properties for plugin usage ([#8835](https://github.com/NativeScript/NativeScript/issues/8835)) ([a2e1aa2](https://github.com/Akylas/NativeScript/commit/a2e1aa246e6a9cbdd6d2c4647c9740ef411ad51a))
* **core:** nativescript.config and webpack updates ([#8801](https://github.com/NativeScript/NativeScript/issues/8801)) ([54cce4f](https://github.com/Akylas/NativeScript/commit/54cce4f20c142397fd31bba3300c27a3d7459420))

### Bug Fixes

* **android:** dont dispose fragment on onloaded ([3fbeace](https://github.com/Akylas/NativeScript/commit/3fbeacec41ff5068d1395e4366dda8ee65539321))
* **core:** autoSystemAppearanceChanged typings in ambient context fix ([c30a9c3](https://github.com/Akylas/NativeScript/commit/c30a9c3e3569e0367056bfd80fa730ae79e29066))
* **core:** bundle-config-loader global handling ([#8838](https://github.com/NativeScript/NativeScript/issues/8838)) ([1623a56](https://github.com/Akylas/NativeScript/commit/1623a567b6eaa195d075936103d2f7d829e1fa07))
* **ios:** stop using artificial state handler via animated setter on uiviewcontroller ([#8797](https://github.com/NativeScript/NativeScript/issues/8797)) ([967d652](https://github.com/Akylas/NativeScript/commit/967d652c61fbeed6c7e8bd568c893d40308b5b58))
* need to be a function to work ([43f1d50](https://github.com/Akylas/NativeScript/commit/43f1d50a36fb337148b355670b1b880537034c97))
