## [8.3.5](https://github.com/NativeScript/NativeScript/compare/8.3.4-core...8.3.5) (2022-09-23)


### Bug Fixes

* **animations:** error handling ([df31b2a](https://github.com/NativeScript/NativeScript/commit/df31b2a905cdbdacf3c31e7804a65401e3b498ab))
* **core:** WeakRef typings to include deref ([#10006](https://github.com/NativeScript/NativeScript/issues/10006)) ([5bed8b9](https://github.com/NativeScript/NativeScript/commit/5bed8b96d84cad8a4297fa8c63c078ba3bdeae51))
* **ios:** guard accessing actionbar ([#10033](https://github.com/NativeScript/NativeScript/issues/10033)) ([59fb3d9](https://github.com/NativeScript/NativeScript/commit/59fb3d9457dc88d7f20729c5d6c65298d2664932))
* **ios:** segmented bar nativeView check ([#10023](https://github.com/NativeScript/NativeScript/issues/10023)) ([3ce5362](https://github.com/NativeScript/NativeScript/commit/3ce5362a043c4c7513db98a76b341dc8f1791f50))


## [8.3.4](https://github.com/NativeScript/NativeScript/compare/8.3.3-core...8.3.4) (2022-08-20)


### Bug Fixes

* **android:** potential navigation crash ([#9996](https://github.com/NativeScript/NativeScript/issues/9996)) ([ca3d9bd](https://github.com/NativeScript/NativeScript/commit/ca3d9bdc13b86df2bbecb34e07141cea8fc9af7c))
* **ios:** ListView _prepareCell null safety ([#10001](https://github.com/NativeScript/NativeScript/issues/10001)) ([56f861d](https://github.com/NativeScript/NativeScript/commit/56f861df20212f2107bf2c4e0989ab4debadf423))


### Features

* **core:** make font style, weight, scale params optional ([#9993](https://github.com/NativeScript/NativeScript/issues/9993)) ([4b0c812](https://github.com/NativeScript/NativeScript/commit/4b0c8127073d91d15b36a1428fd23b4cf702cae9))



## [8.3.3](https://github.com/NativeScript/NativeScript/compare/8.3.2-core...8.3.3) (2022-08-11)


### Bug Fixes

* **android:** getScaledDimensions ([#9992](https://github.com/NativeScript/NativeScript/issues/9992)) ([944d542](https://github.com/NativeScript/NativeScript/commit/944d54257198708cabc49af19d7e5cdf39e3e1a1))
* **ios:** additional safe area insets were miscalculated if already set ([#9991](https://github.com/NativeScript/NativeScript/issues/9991)) ([be6efc3](https://github.com/NativeScript/NativeScript/commit/be6efc306708d65405e9cc89e4ef422feeb89df1))



## [8.3.2](https://github.com/NativeScript/NativeScript/compare/5.0.8-webpack...8.3.2) (2022-08-02)


### Bug Fixes

* **android:** FragmentCallbacksImplementation memory leak ([#9977](https://github.com/NativeScript/NativeScript/issues/9977)) ([286d36b](https://github.com/NativeScript/NativeScript/commit/286d36b03b2a6a740ed9a93d83ad36c7f649f6c9))
* **android:** FragmentClass memory leak ([#9983](https://github.com/NativeScript/NativeScript/issues/9983)) ([0548aaf](https://github.com/NativeScript/NativeScript/commit/0548aaf8da68f104d87d3e36ecc53b31e73028aa))
* **core:** Added ObservableArray constructor declarations to allow setting multiple arguments ([#9980](https://github.com/NativeScript/NativeScript/issues/9980)) ([d82f3d9](https://github.com/NativeScript/NativeScript/commit/d82f3d990dcbf84c0e6e32d98f2fb19a6532615d))
* revert "fix(ios): not responding after rotation ([#9931](https://github.com/NativeScript/NativeScript/issues/9931))" ([#9984](https://github.com/NativeScript/NativeScript/issues/9984)) ([54d3006](https://github.com/NativeScript/NativeScript/commit/54d300666a891820a0cae8ec1b410f90c77f96a6))



## [8.3.1](https://github.com/NativeScript/NativeScript/compare/8.3.0-core...8.3.1) (2022-07-21)


### Bug Fixes

* **core:** correct typings in ObservableArray ([#9961](https://github.com/NativeScript/NativeScript/issues/9961)) ([01643f5](https://github.com/NativeScript/NativeScript/commit/01643f513ed3e71b98c3a0bdd9fa15f0b1b7970d))
* **core:** correctly polyfill tslib ([#9894](https://github.com/NativeScript/NativeScript/issues/9894)) ([20efd36](https://github.com/NativeScript/NativeScript/commit/20efd3605e5c8c654bba26f6d1f1423d7af51747))
* **core:** FormattedString.spans is now restored ([#9960](https://github.com/NativeScript/NativeScript/issues/9960)) ([0477044](https://github.com/NativeScript/NativeScript/commit/0477044d6f41003d679ef3dd655643b380dca188))


# [8.3.0](https://github.com/NativeScript/NativeScript/compare/5.0.7-webpack...8.3.0) (2022-07-14)


### Bug Fixes

* **android:** connectivity reporting none on resume ([#9915](https://github.com/NativeScript/NativeScript/issues/9915)) ([413fa2e](https://github.com/NativeScript/NativeScript/commit/413fa2eb4b044163a701614a596a06512082ba8a))
* **android:** content uri handling improvements ([#9936](https://github.com/NativeScript/NativeScript/issues/9936)) ([9fcd440](https://github.com/NativeScript/NativeScript/commit/9fcd440690e894c80ca88a528309f619fc8997f9))
* **android:** device language and region from system configuration. ([#9868](https://github.com/NativeScript/NativeScript/issues/9868)) ([ad01e6b](https://github.com/NativeScript/NativeScript/commit/ad01e6b990e14f36e637886b2e0e0c9594daf246))
* **android:** font icons had incorrect fallback size ([#9914](https://github.com/NativeScript/NativeScript/issues/9914)) ([e8bed44](https://github.com/NativeScript/NativeScript/commit/e8bed44f5b82fda088aa9f6033a9ec76825811ee))
* **android:** Textfield focus fix ([#9885](https://github.com/NativeScript/NativeScript/issues/9885)) ([fbd1e23](https://github.com/NativeScript/NativeScript/commit/fbd1e23c1c9b63ddcab9b25812c10e62ca9f6da6))
* **core:** allow View subclass to force onLayoutChangeListener ([#9886](https://github.com/NativeScript/NativeScript/issues/9886)) ([6ccf5a2](https://github.com/NativeScript/NativeScript/commit/6ccf5a22e61b4950f549929f2e5c432bf3e03324))
* **core:** android wrong background state + current value accessors ([#9883](https://github.com/NativeScript/NativeScript/issues/9883)) ([58a7206](https://github.com/NativeScript/NativeScript/commit/58a720699fe012b382446533f29ef3382ddd862e))
* **core:** ensure platforms/android/core.aar is not included in pack ([a1dff9a](https://github.com/NativeScript/NativeScript/commit/a1dff9a1dbc5f8a32fffe28fa1d950ec12576061))
* **core:** import fix ([45dcada](https://github.com/NativeScript/NativeScript/commit/45dcada01ab6f44d7fdc9d28f3b40ce1015053bc))
* **core:** metadata filtering ([#9946](https://github.com/NativeScript/NativeScript/issues/9946)) ([4a5e2e2](https://github.com/NativeScript/NativeScript/commit/4a5e2e2ac0876a6697ebb468e2825f358c3a63e3))
* **core:** navigatingToEvent allows access to resolvedPage now ([#9954](https://github.com/NativeScript/NativeScript/issues/9954)) ([38142a6](https://github.com/NativeScript/NativeScript/commit/38142a6aebee4c66ce0ae189dd68e93ee2be2db8))
* **core:** trace log using a wrong parameter ([#9951](https://github.com/NativeScript/NativeScript/issues/9951)) ([cd5d2c2](https://github.com/NativeScript/NativeScript/commit/cd5d2c2f4df79cc2b7026d86c386a60adda414f6))
* ensure reusable ProxyViewContainer re-adds native children ([#9882](https://github.com/NativeScript/NativeScript/issues/9882)) ([0a082b3](https://github.com/NativeScript/NativeScript/commit/0a082b340305eac9b9b509225dcd1d5f58766be7))
* export 'dataSerialize' from utils ([#9909](https://github.com/NativeScript/NativeScript/issues/9909)) ([a85a72d](https://github.com/NativeScript/NativeScript/commit/a85a72d961185eb311df030b515decb4813d41c8))
* incorrect font icon size conversion to device pixels. ([#9910](https://github.com/NativeScript/NativeScript/issues/9910)) ([d3718e5](https://github.com/NativeScript/NativeScript/commit/d3718e5e5f6e6b241b2dec392cf53e65e869d6f5))
* **ios:** apply proper border radius to box shadow and view sublayers ([#9881](https://github.com/NativeScript/NativeScript/issues/9881)) ([b7e6128](https://github.com/NativeScript/NativeScript/commit/b7e612857681f8d778c42b3df211494067f911fd))
* **ios:** do not convert tap event data to device pixels twice ([#9935](https://github.com/NativeScript/NativeScript/issues/9935)) ([3681fd4](https://github.com/NativeScript/NativeScript/commit/3681fd43840e67aaccf6e2b2d5c47d72a09b78b4))
* **ios:** label measure correct height when using custom numberOfLines ([#9945](https://github.com/NativeScript/NativeScript/issues/9945)) ([2ff0891](https://github.com/NativeScript/NativeScript/commit/2ff0891f933dc0e717efce7e5daea8f8488d5fa9))
* **ios:** memory leak after using 'showModal' passing any Page as parameter ([#9939](https://github.com/NativeScript/NativeScript/issues/9939)) ([4db4e4a](https://github.com/NativeScript/NativeScript/commit/4db4e4af275048fb58ef0fab3a2ac7e3758ba783))
* **ios:** memory leak after using the 'presentViewControllerNavigation' ([#9934](https://github.com/NativeScript/NativeScript/issues/9934)) ([957af32](https://github.com/NativeScript/NativeScript/commit/957af328597c53a38a48c9c1133419a55cbbea25))
* **ios:** proper disposal and recreation of iOS native views ([#9879](https://github.com/NativeScript/NativeScript/issues/9879)) ([f548fdc](https://github.com/NativeScript/NativeScript/commit/f548fdc73512bb74e7ec500550e2db0166e7237b))
* **live-sync:** navigation history is now maintained ([#9889](https://github.com/NativeScript/NativeScript/issues/9889)) ([665009b](https://github.com/NativeScript/NativeScript/commit/665009b863c0589bf5921f512e3878471255ea82))
* **RootLayout:** resilience around shadeCover options ([e5fffa1](https://github.com/NativeScript/NativeScript/commit/e5fffa1dad2f7482387d396f8eaebabf96be5011))
* **TabView:** item styling improvements for iOS 15+ ([#9888](https://github.com/NativeScript/NativeScript/issues/9888)) ([7ccc949](https://github.com/NativeScript/NativeScript/commit/7ccc9497124528d7e83a8217ab80545dec6f6691))
* **ui-mobile-base:** Android http request body was not sent if method was DELETE ([#9887](https://github.com/NativeScript/NativeScript/issues/9887)) ([57e4973](https://github.com/NativeScript/NativeScript/commit/57e4973da5b06cf8e3950293c24361f5a677c245))
* **webpack:** NativeClass decorator should run after angular transformers in AOT mode ([#9908](https://github.com/NativeScript/NativeScript/issues/9908)) ([c9f77a0](https://github.com/NativeScript/NativeScript/commit/c9f77a0a22708cb07978c67c84ff010390e9f5f7))
* **webpack:** unit test runner with node 18+ ([#9952](https://github.com/NativeScript/NativeScript/issues/9952)) ([97a21bb](https://github.com/NativeScript/NativeScript/commit/97a21bb0d7e429e2a1aa6023c905ba02cd4be56b))


### Features

* **android:** runOnMain, postFrameCallback & removeFrameCallback ([#9943](https://github.com/NativeScript/NativeScript/issues/9943)) ([49343cb](https://github.com/NativeScript/NativeScript/commit/49343cb9b4ad5be895dd25ef28361b3a100d9249))
* **application:** expose `inBackground` and `suspended` ([#9897](https://github.com/NativeScript/NativeScript/issues/9897)) ([8987bab](https://github.com/NativeScript/NativeScript/commit/8987babb0801fbc3320bf50877bebefb9702a292))
* **core:** iterable ObservableArray ([#9824](https://github.com/NativeScript/NativeScript/issues/9824)) ([df74a8b](https://github.com/NativeScript/NativeScript/commit/df74a8baa8d815207c4edfa3909f57f497a9e63a))
* **core:** maxLines support for all text components ([#9884](https://github.com/NativeScript/NativeScript/issues/9884)) ([7ff7233](https://github.com/NativeScript/NativeScript/commit/7ff7233737e2bc12849e922bc2335d3756ff353d))
* **ios:** Utils.getRootViewController ([29004d9](https://github.com/NativeScript/NativeScript/commit/29004d9048ab84d774d6978e685ea7b0e47b625b))
* **mac:** support for Mac Catalyst with ui-mobile-base ([fc77c92](https://github.com/NativeScript/NativeScript/commit/fc77c92e114c8a021a6608bb9ff3c8857263abbd))
* **RootLayout:** add opened and closed events ([#9893](https://github.com/NativeScript/NativeScript/issues/9893)) ([7b11b6a](https://github.com/NativeScript/NativeScript/commit/7b11b6acfe1e71b803ef65f98b8ac5f271928d56))
* **types-minimal:** paired down typings optimized for smaller footprint editing environments ([#9947](https://github.com/NativeScript/NativeScript/issues/9947)) ([f49e412](https://github.com/NativeScript/NativeScript/commit/f49e412660d80ec55f7fd146b24ae1e77b0ecbea))
* **Utils:** dataSerialize, dataDeserialize, numberHasDecimals, numberIs64Bit ([cab5947](https://github.com/NativeScript/NativeScript/commit/cab59473f39066abb667d2039d5333be93488035))


### Performance Improvements

* cache UIFont construction based on FontDescriptor ([#9948](https://github.com/NativeScript/NativeScript/issues/9948)) ([8756df3](https://github.com/NativeScript/NativeScript/commit/8756df30d4b3b30e139065583ad57a015006a341))


### BREAKING CHANGES

* **core:** Method push will now handle arguments just like Array.prototype.push.
Certain existing methods will now return ObservableArray instance instead.
Callback arguments that contained an array argument themselves will now contain an ObservableArray argument.
* **android:** Exposes language and region values from android system configuration. If you were working around locale handling because this wasn't originally the case you can likely remove extra conditions as this should reflect more accurately now.
* **ios:** tapData.getX() and tapData.getY() will now return correctly in DIP, so any extra conversions (like calling toDevicePixels) twice must be changed.
* **core:** When using `navigatingToEvent` event.entry, the `backstackEntry` object is now returned which has an `entry` property on it if you still need it.



## [8.2.5](https://github.com/NativeScript/NativeScript/compare/8.2.4-core...8.2.5) (2022-06-15)


### Bug Fixes

* **color:** output from rgbToHsv and rgbToHsl is now correct ([#9933](https://github.com/NativeScript/NativeScript/issues/9933)) ([ef70956](https://github.com/NativeScript/NativeScript/commit/ef70956623f8eab23e3c245e543b0a1b45e94bf7))
* **ios:** not responding after rotation ([#9931](https://github.com/NativeScript/NativeScript/issues/9931)) ([aee1d05](https://github.com/NativeScript/NativeScript/commit/aee1d0565105158e84b6a752cc05ee0dc0577943))


### Features

* **core:** allow removal of specific CSS variables ([#9896](https://github.com/NativeScript/NativeScript/issues/9896)) ([32567ef](https://github.com/NativeScript/NativeScript/commit/32567ef36165c688f34b39d515790d4ce0836b4d))



## [8.2.4](https://github.com/NativeScript/NativeScript/compare/8.2.3-core...8.2.4) (2022-06-04)


### Bug Fixes

* **Utils:** dispatchToUIThread ([9089b2c](https://github.com/NativeScript/NativeScript/commit/9089b2cf87ecc2644090da22ed8797f56db5c7bb))
* **webview:** android not loading local content ([#9923](https://github.com/NativeScript/NativeScript/issues/9923)) ([834b4bf](https://github.com/NativeScript/NativeScript/commit/834b4bf5e1c92dad8cd7bfad2f329ba9d754c15e))


### Features

* **types-minimal:** minimal types for only the latest Android and iOS sdks ([#9927](https://github.com/NativeScript/NativeScript/issues/9927)) ([80e6b81](https://github.com/NativeScript/NativeScript/commit/80e6b8130a85fcd36d6e3bde581ae7d5e4bd1612))



## [8.2.3](https://github.com/NativeScript/NativeScript/compare/8.2.2-core...8.2.3) (2022-04-25)


### Bug Fixes

* **android:** ensure android application is created before setting listeners ([#9876](https://github.com/NativeScript/NativeScript/issues/9876)) ([54f454f](https://github.com/NativeScript/NativeScript/commit/54f454f881204ec2a02ab1695819cf344c70dffe))
* **android:** improve content uri handling ([#9874](https://github.com/NativeScript/NativeScript/issues/9874)) ([a272296](https://github.com/NativeScript/NativeScript/commit/a272296d875ca4bacf52c80dd568de6d3b73a4fc)), closes [#9871](https://github.com/NativeScript/NativeScript/issues/9871)
* file access cross platform stub ([338ae56](https://github.com/NativeScript/NativeScript/commit/338ae56a829d9badf22c458b01d88c1ca9f3e677))
* removed unecessary `console.log` ([#9877](https://github.com/NativeScript/NativeScript/issues/9877)) ([74e42fc](https://github.com/NativeScript/NativeScript/commit/74e42fcb8b68cf5740b33f337f7cdea7b0b94e3b))


### Features

* added Utils.executeOnUIThread ([36a55da](https://github.com/NativeScript/NativeScript/commit/36a55dac7fd9db4ace98ac0a19286d8cfd0410bf))



## [8.2.2](https://github.com/NativeScript/NativeScript/compare/8.2.1-core...8.2.2) (2022-04-07)


### Bug Fixes

* **ActionItem:** rendering threw errors if it had a nested child. ([#9821](https://github.com/NativeScript/NativeScript/issues/9821)) ([efa80c7](https://github.com/NativeScript/NativeScript/commit/efa80c728b172c4d2b6dfb7bb502f4b7e8871591))
* **android:** gesture events fix ([#9842](https://github.com/NativeScript/NativeScript/issues/9842)) ([2664783](https://github.com/NativeScript/NativeScript/commit/2664783dfa773f373a93fd427b3d5c01964975b2))
* **css:** borderColor parse handling for hsl(a) color values ([#9857](https://github.com/NativeScript/NativeScript/issues/9857)) ([da3bd2c](https://github.com/NativeScript/NativeScript/commit/da3bd2c6fb8e51b303b163812c348fb4ca938f5b))
* **ios:** navigation button now allows using custom icon ([#9835](https://github.com/NativeScript/NativeScript/issues/9835)) ([f88c158](https://github.com/NativeScript/NativeScript/commit/f88c158b384fee7afec9770b257a4312e715b6ec))
* **RootLayout:** close popup views on live-sync ([#9834](https://github.com/NativeScript/NativeScript/issues/9834)) ([6941466](https://github.com/NativeScript/NativeScript/commit/694146689b7729280aa99cd393848ede78d6cd37))
* Utils.queueGC debounce and throttle with reuse of different settings ([#9852](https://github.com/NativeScript/NativeScript/issues/9852)) ([9ce7455](https://github.com/NativeScript/NativeScript/commit/9ce745568f1dfdfa9b1d26021a83408a72db8e16))


### Features

* **RootLayout:** added topmost method to retrieve view at top ([#9826](https://github.com/NativeScript/NativeScript/issues/9826)) ([3bb8fc2](https://github.com/NativeScript/NativeScript/commit/3bb8fc28e998a153a561ef331645b84e58a827a3))
* **TouchManager:** touchDelay property for nested tap control ([c05145b](https://github.com/NativeScript/NativeScript/commit/c05145bd9b62cb017349acf46827fec929b3289c))


### Performance Improvements

* Improved live-sync functionality for RootLayout ([#9836](https://github.com/NativeScript/NativeScript/issues/9836)) ([3537858](https://github.com/NativeScript/NativeScript/commit/3537858b6dabe1d419a1ab2853d0188061d9fa23))



## [8.2.1](https://github.com/NativeScript/NativeScript/compare/8.2.0-core...8.2.1) (2022-03-09)


### Bug Fixes

* wrong thread when in Async task in a worker ([794a779](https://github.com/NativeScript/NativeScript/commit/794a77900f183472a4cc33fa544cb396790d4166)), closes [#9819](https://github.com/NativeScript/NativeScript/issues/9819)



# [8.2.0](https://github.com/NativeScript/NativeScript/compare/5.0.5-webpack...8.2.0) (2022-03-08)


### Bug Fixes

* **android:** a11y - do not provide content description for TextView elements ([#9673](https://github.com/NativeScript/NativeScript/issues/9673)) ([dbaf203](https://github.com/NativeScript/NativeScript/commit/dbaf203a590b110a2e435e31748ae338bd2e1824)), closes [#9588](https://github.com/NativeScript/NativeScript/issues/9588)
* **android:** api17 crash on a11y service ([#9792](https://github.com/NativeScript/NativeScript/issues/9792)) ([2efcdf5](https://github.com/NativeScript/NativeScript/commit/2efcdf57871cc7a8def6a83995cf6f0d7f66f925))
* **android:** boolean keyboardType should not set inputType ([#9795](https://github.com/NativeScript/NativeScript/issues/9795)) ([9e6371f](https://github.com/NativeScript/NativeScript/commit/9e6371fdaf4a2ba62da9920d9011045a267f4e53))
* **android:** edge cases and compatibility with fragments 1.2.x ([#9782](https://github.com/NativeScript/NativeScript/issues/9782)) ([6b41268](https://github.com/NativeScript/NativeScript/commit/6b41268a08fff0b82bf044f7a8a6c6f95fcd60f6))
* **android:** fragment creation loaded/unloaded protection ([ac2e944](https://github.com/NativeScript/NativeScript/commit/ac2e944fd30107cfc1ee863b9245633e51e75450))
* **android:** nested frames were sometimes not recreated ([#9725](https://github.com/NativeScript/NativeScript/issues/9725)) ([902a4c6](https://github.com/NativeScript/NativeScript/commit/902a4c6afc7442f92e345309d8d69f19a0fd1bdf))
* **android:** nested frames were sometimes not recreated ([#9748](https://github.com/NativeScript/NativeScript/issues/9748)) ([cb648e3](https://github.com/NativeScript/NativeScript/commit/cb648e309e3a0a9456c0dafabaebb1e9b7c95e1c))
* **android:** NullPointerException on navigation ([#9669](https://github.com/NativeScript/NativeScript/issues/9669)) ([9b5d125](https://github.com/NativeScript/NativeScript/commit/9b5d125f42b4d2d27483ea2c0b1a8c3417556802)), closes [#8441](https://github.com/NativeScript/NativeScript/issues/8441)
* **android:** prevent error when detaching from unloaded ScrollView ([#9666](https://github.com/NativeScript/NativeScript/issues/9666)) ([e59f3ff](https://github.com/NativeScript/NativeScript/commit/e59f3ff66984f19dbbc5c0067342c243f3788971))
* **android:** text-transform: capitalize behavior ([#9598](https://github.com/NativeScript/NativeScript/issues/9598)) ([aa1c631](https://github.com/NativeScript/NativeScript/commit/aa1c631e6f3c38f56d4a84a20a3142289104ab0e)), closes [#7059](https://github.com/NativeScript/NativeScript/issues/7059)
* **android:** when hiding the keyboard make view lose focus to match ios behavior ([#9786](https://github.com/NativeScript/NativeScript/issues/9786)) ([b78996a](https://github.com/NativeScript/NativeScript/commit/b78996a5690add6c978ee5867ddf666a3471f116))
* application instance creation occurs only within Application.run ([a518249](https://github.com/NativeScript/NativeScript/commit/a518249958df933ca82f2f82f5efe023fa7ae695))
* **core:** animation iteration correct for android css animations and iOS rotation ([#9628](https://github.com/NativeScript/NativeScript/issues/9628)) ([608bb1e](https://github.com/NativeScript/NativeScript/commit/608bb1ed24fd32ac6199e632d739e7a66a0da1c8)), closes [#7712](https://github.com/NativeScript/NativeScript/issues/7712)
* **core:** Application handling of nativeApp instance ([6c06c77](https://github.com/NativeScript/NativeScript/commit/6c06c77618c92590d5aa441eac838c4330732753))
* **core:** parse template literal syntax with nested identifiers as expression. ([#9744](https://github.com/NativeScript/NativeScript/issues/9744)) ([57cc4ed](https://github.com/NativeScript/NativeScript/commit/57cc4edc8c161b2ceb3b9a7842d627d66d65eb1d))
* ensure android can access native app instance before bootstrap ([f10cffc](https://github.com/NativeScript/NativeScript/commit/f10cffcb02a1ae37b436ea22eaf1cf67804927fe))
* **fs:** wrong common paths ([51b92f3](https://github.com/NativeScript/NativeScript/commit/51b92f355799409aba82eca4c951b394c4ef894c))
* **ios:** do not redraw if background image is 'none' ([#9800](https://github.com/NativeScript/NativeScript/issues/9800)) ([402a7bb](https://github.com/NativeScript/NativeScript/commit/402a7bba2ee9435134d6697dbe5639bd096597f6))
* **ios:** force layout of view when changing the safe area insets ([#9773](https://github.com/NativeScript/NativeScript/issues/9773)) ([a1ba1f6](https://github.com/NativeScript/NativeScript/commit/a1ba1f6d032ffd2abd17529fbcd782c0200ff6dd))
* **ios:** proper UITabBarAppearance handling ([6c71ce2](https://github.com/NativeScript/NativeScript/commit/6c71ce21a20adba7ea350176fc5a81da646f594f))
* **ios:** tabview background color with appearance api in iOS 15+ ([#9617](https://github.com/NativeScript/NativeScript/issues/9617)) ([2749221](https://github.com/NativeScript/NativeScript/commit/27492219e6f1903b4c3f744cfe9a5569ccc6a600))
* **ios:** UIImage memory leaking after Image is disposed ([#9777](https://github.com/NativeScript/NativeScript/issues/9777)) ([19d8869](https://github.com/NativeScript/NativeScript/commit/19d8869f1dc64d64a8b295985514716be5012a2c))
* memory leaks around image picking/saving to device ([7dcfecf](https://github.com/NativeScript/NativeScript/commit/7dcfecffab10c3b253975a84f711b46111070bf4))
* qualifier matcher did not support multiple qualifiers for a single file. ([#9720](https://github.com/NativeScript/NativeScript/issues/9720)) ([3d03f8f](https://github.com/NativeScript/NativeScript/commit/3d03f8f06aa36852cbce82a319dcf9de79c929ac))
* setup script to build only what's necessary ([b05650c](https://github.com/NativeScript/NativeScript/commit/b05650c4166f5ce04cb761e4f3730cf2656c8192))
* tear down views after a modal is closed ([#9801](https://github.com/NativeScript/NativeScript/issues/9801)) ([b38337e](https://github.com/NativeScript/NativeScript/commit/b38337e597a8288f6ab0c5058fa9addd622146be))
* **time-picker:** correction for super.disposeNativeView ([c41e702](https://github.com/NativeScript/NativeScript/commit/c41e7027e45778c9c27fcbc701f56edebd57e33b))


### Features

* **android:** content uri support for File ([#9807](https://github.com/NativeScript/NativeScript/issues/9807)) ([c68d002](https://github.com/NativeScript/NativeScript/commit/c68d002c9ad332d4bf5ea6430c3cf852f5ef64df))
* **android:** tab view icon rendering mode ([#9605](https://github.com/NativeScript/NativeScript/issues/9605)) ([66d8aff](https://github.com/NativeScript/NativeScript/commit/66d8afffc1a987b36605c7206b057268a38ecb06))
* **android:** update ui-mobile-base to gradle7 ([#9778](https://github.com/NativeScript/NativeScript/issues/9778)) ([c7df2d0](https://github.com/NativeScript/NativeScript/commit/c7df2d0d6f0539ba0db2eda9a5b2ce91a7d59f30))
* background/foreground events ([#9763](https://github.com/NativeScript/NativeScript/issues/9763)) ([b553a90](https://github.com/NativeScript/NativeScript/commit/b553a900d76893d1f49ea4a20fa361147585a451))
* **bindable:** allow "global" context for expressions inside bindings ([#9734](https://github.com/NativeScript/NativeScript/issues/9734)) ([2cbb135](https://github.com/NativeScript/NativeScript/commit/2cbb135250252844ce8c7affabaf3140643ce7b4))
* binding expression parser additions and improvements ([#9791](https://github.com/NativeScript/NativeScript/issues/9791)) ([716b831](https://github.com/NativeScript/NativeScript/commit/716b831523829dfa508d32efe0067060109ca574))
* **config:** add new option for pathsToClean ([08d5656](https://github.com/NativeScript/NativeScript/commit/08d56568998dae416205fe7b0ada8334ebabb2e0))
* **config:** cli.additionalPathsToClean to clean other paths with 'ns clean' ([#9808](https://github.com/NativeScript/NativeScript/issues/9808)) ([3ec8c42](https://github.com/NativeScript/NativeScript/commit/3ec8c429719a9a32238801ba3dd7c17c0b50ec72))
* **core:** add event when disposeNativeView is called ([f038e6b](https://github.com/NativeScript/NativeScript/commit/f038e6ba66c319465bde251d1e540d4ee5981373))
* **core:** support RGB alpha notation ([#9699](https://github.com/NativeScript/NativeScript/issues/9699)) ([388d7ea](https://github.com/NativeScript/NativeScript/commit/388d7eaa7d956e7785ad26399c14b925664f6a52))
* **datepicker:** ability to show time via showTime property ([#9570](https://github.com/NativeScript/NativeScript/issues/9570)) ([ab4e47a](https://github.com/NativeScript/NativeScript/commit/ab4e47a1c1132f73648d76fa332c5633028182f7))
* **gestures:** GestureEvents.gestureAttached added to modify native recognizers when needed ([168a169](https://github.com/NativeScript/NativeScript/commit/168a16972623109afadedabd32ff22d70555026b))
* improved background handling ([#9615](https://github.com/NativeScript/NativeScript/issues/9615)) ([dde9e02](https://github.com/NativeScript/NativeScript/commit/dde9e02cac1f7f2b34ad7965eaada2661e636641))
* improved converter and function call parsing mechanism for XML expressions ([#9805](https://github.com/NativeScript/NativeScript/issues/9805)) ([c5856c6](https://github.com/NativeScript/NativeScript/commit/c5856c6daee6901356a55868629484171e64daee))
* **ios:** allow dynamic ProMotion frame refresh rate changes ([#9775](https://github.com/NativeScript/NativeScript/issues/9775)) ([b292495](https://github.com/NativeScript/NativeScript/commit/b2924955067c992caea5b14e37d705cea203a509))
* new expression parser for xml bindings ([#9729](https://github.com/NativeScript/NativeScript/issues/9729)) ([90ceed1](https://github.com/NativeScript/NativeScript/commit/90ceed15d3b4f89f06b0a1f7f78724a37c9985e6))
* proper handling for bindings with converters that were undefined ([#9813](https://github.com/NativeScript/NativeScript/issues/9813)) ([a1772c0](https://github.com/NativeScript/NativeScript/commit/a1772c00058d03ee1e4a6e3ba8f96ba2197e3f2b))
* **root-layout:** support gradient colors on shade cover ([#9626](https://github.com/NativeScript/NativeScript/issues/9626)) ([d756eb5](https://github.com/NativeScript/NativeScript/commit/d756eb5574ab062fb4b4e8c994f3924380be9317))
* **switch:** :checked pseudo and color fixes ([#9790](https://github.com/NativeScript/NativeScript/issues/9790)) ([6437352](https://github.com/NativeScript/NativeScript/commit/6437352feda731964728113b1b29cdeda1571666))
* testID property for use with e2e testing without interfering with a11y ([#9793](https://github.com/NativeScript/NativeScript/issues/9793)) ([8be543b](https://github.com/NativeScript/NativeScript/commit/8be543bcc7da2634f9c627ea15b06e6dfef78b93)), closes [#9748](https://github.com/NativeScript/NativeScript/issues/9748)
* touch animations demo in toolbox ([d7916d7](https://github.com/NativeScript/NativeScript/commit/d7916d77a147d1dcf203e18550ad3245bfdeb2f7))
* **types-android:** updated types + api32 ([#9774](https://github.com/NativeScript/NativeScript/issues/9774)) ([2393dad](https://github.com/NativeScript/NativeScript/commit/2393dad6e137b84fc98efbc13abed55db6e227f5))
* **types-ios:** iOS 15.2 ([#9710](https://github.com/NativeScript/NativeScript/issues/9710)) ([25679a6](https://github.com/NativeScript/NativeScript/commit/25679a69820274a0628793668d600cc4e3e70307))
* **types-ios:** iOS 15.4 ([#9806](https://github.com/NativeScript/NativeScript/issues/9806)) ([39164ef](https://github.com/NativeScript/NativeScript/commit/39164effdf3d405d47c1e8c3b29479a7a91047a2))
* **types-ios:** reduced ios types to common types for optimized ts resolution ([#9809](https://github.com/NativeScript/NativeScript/issues/9809)) ([6cd8b8e](https://github.com/NativeScript/NativeScript/commit/6cd8b8e804b5e237574108fbe7c5320acd0dbe31))
* **ui:** TouchManager for ease in adding interactivity ([26953ec](https://github.com/NativeScript/NativeScript/commit/26953ec1f25ae673faedc5416880ebdfe9fcc8fd))
* Utils for queueGC, debounce and throttle ([40c5984](https://github.com/NativeScript/NativeScript/commit/40c5984966231ef126e7d143be41c7c1d51085da))


### Performance Improvements

* **ios:** autoreleasepool for image extensions ([fbefea4](https://github.com/NativeScript/NativeScript/commit/fbefea4dbad59e9b31ecd9311b1a16f40d041c9d))
* **ios:** prevent crash with image release ([1fb687d](https://github.com/NativeScript/NativeScript/commit/1fb687df550e1c01c5901920e79487d220e834c4))
* **ios:** uifont and formatted string optimizations plus uiimage scaling ([#9761](https://github.com/NativeScript/NativeScript/issues/9761)) ([9d3977e](https://github.com/NativeScript/NativeScript/commit/9d3977ea4fd6d6aedeab55e0472999c05ed5a7bd))
* **ios:** UIImage memory leaks ([#9783](https://github.com/NativeScript/NativeScript/issues/9783)) ([988f372](https://github.com/NativeScript/NativeScript/commit/988f3727883bddd27dd6397d7dfeebeb9b20c559))



## [8.1.5](https://github.com/NativeScript/NativeScript/compare/8.1.4-core...8.1.5) (2021-10-28)


### Bug Fixes

* **android:** autofillType on apiLevel < 26 ([#9610](https://github.com/NativeScript/NativeScript/issues/9610)) ([8878c3b](https://github.com/NativeScript/NativeScript/commit/8878c3bc6be5c061e95da74249998b51797d71d9))
* **android:** version Android text-align justify ([#9620](https://github.com/NativeScript/NativeScript/issues/9620)) ([2ad280d](https://github.com/NativeScript/NativeScript/commit/2ad280deb0e9b6098d4ad76ccf703e257196a023))



## [8.1.4](https://github.com/NativeScript/NativeScript/compare/8.1.3-core...8.1.4) (2021-10-09)


### Bug Fixes

* **android:** StringIndexOutOfBoundsException with invalid drawables ([#9563](https://github.com/NativeScript/NativeScript/issues/9563)) ([8e76bbe](https://github.com/NativeScript/NativeScript/commit/8e76bbe2515c5c743d3db30a940ccb8040314bea))
* background parsing color [#9559](https://github.com/NativeScript/NativeScript/issues/9559) ([#9560](https://github.com/NativeScript/NativeScript/issues/9560)) ([3e21748](https://github.com/NativeScript/NativeScript/commit/3e21748af4dcf76fec3822b4d5e9c844794eda1d))
* **ios:** ActionBar flat property using new appearance api for iOS 15 ([#9558](https://github.com/NativeScript/NativeScript/issues/9558)) ([183b4d4](https://github.com/NativeScript/NativeScript/commit/183b4d4b10a4ec7f9527e5373c8ce723c3db0c3e))
* **ios:** TextView respect editable binding ([#9589](https://github.com/NativeScript/NativeScript/issues/9589)) ([2b2ce37](https://github.com/NativeScript/NativeScript/commit/2b2ce377e6d7bd33de3fd8df9482772a650b75b5))
* **ios:** replace autofill string in textfield ([#9555](https://github.com/NativeScript/NativeScript/issues/9555)) ([889f6d7](https://github.com/NativeScript/NativeScript/commit/889f6d73cf8bdc080c54387708562d00c2684e9b))
* **style:** CSS variables should be case-sensitive. ([#9603](https://github.com/NativeScript/NativeScript/issues/9603)) ([02aa0f6](https://github.com/NativeScript/NativeScript/commit/02aa0f652a5637b089a8894f6635462073715205))


### Features

* **android** openFile dialog title ([#9600](https://github.com/NativeScript/NativeScript/issues/9600)) ([77d2533](https://github.com/NativeScript/NativeScript/commit/77d253379802487007c138ca025ac21f9bece002))
* **text:** add css text-align justify ([#9573](https://github.com/NativeScript/NativeScript/issues/9573)) ([1de5295](https://github.com/NativeScript/NativeScript/commit/1de5295ad980b394460de7d9d4b884e5a3b5a679))



## [8.1.3](https://github.com/NativeScript/NativeScript/compare/8.1.2-core...8.1.3) (2021-09-18)


### Bug Fixes

* **android:** only attach if activity is CREATED ([#9552](https://github.com/NativeScript/NativeScript/issues/9552)) ([90b8718](https://github.com/NativeScript/NativeScript/commit/90b8718138fc6e67e2141d9b77017b3d96e50d51))



## [8.1.2](https://github.com/NativeScript/NativeScript/compare/8.1.1-core...8.1.2) (2021-09-15)


### Bug Fixes

* **android:** background-image 'none' ([#9547](https://github.com/NativeScript/NativeScript/issues/9547)) ([a38e2ca](https://github.com/NativeScript/NativeScript/commit/a38e2ca3b905a638c773352c98c5afa1ec99a5b6))
* **core:** Add missing required metadata filters ([#9543](https://github.com/NativeScript/NativeScript/issues/9543)) ([a51b628](https://github.com/NativeScript/NativeScript/commit/a51b628532c616ba8523849ca86ae8716e05a431))



## [8.1.1](https://github.com/NativeScript/NativeScript/compare/5.0.0-rc.3-webpack...8.1.1) (2021-09-10)

### Reverts

* feat: requestLayout performance improvements ([#9122](https://github.com/NativeScript/NativeScript/issues/9122)) ([e4ce17e](https://github.com/NativeScript/NativeScript/commit/e4ce17e15641dc044e5b514aa1eb333b467d600d))

This commit breaks back-navigation in certain cases, most prominently with Button pseudo classes. Will target inclusion for 8.2.


# [8.1.0](https://github.com/NativeScript/NativeScript/compare/5.0.0-rc.1-webpack...8.1.0) (2021-09-08)


### Bug Fixes

* allow ignoring `reduce-css-calc` w/ webpack without error ([#9510](https://github.com/NativeScript/NativeScript/issues/9510)) ([0fd92b7](https://github.com/NativeScript/NativeScript/commit/0fd92b74821087787b62e063c160cb2811a14177))
* **android:** dont dispose fragment on onloaded ([#8793](https://github.com/NativeScript/NativeScript/issues/8793)) ([03b7715](https://github.com/NativeScript/NativeScript/commit/03b77157eac1f9d67b6fcadca1123987dc18beda))
* **android:** make less calls to native with getters around prop handling ([#9119](https://github.com/NativeScript/NativeScript/issues/9119)) ([bca4d95](https://github.com/NativeScript/NativeScript/commit/bca4d9583e949f6603ac77a5dbf62a10bdd82b66))
* **android:** onSaveInstanceState should not crash when no rootView is set ([#9447](https://github.com/NativeScript/NativeScript/issues/9447)) ([ee3c4c2](https://github.com/NativeScript/NativeScript/commit/ee3c4c2009d9b72479efe0899c1e9bc388993692))
* **android:** prevent potential crash when app goes to background ([#9347](https://github.com/NativeScript/NativeScript/issues/9347)) ([47df889](https://github.com/NativeScript/NativeScript/commit/47df889afab4e6b94fc895c984c5f1caba51ee1d))
* **android:** use `nativeTextViewProtected` internally ([#9483](https://github.com/NativeScript/NativeScript/issues/9483)) ([71b856c](https://github.com/NativeScript/NativeScript/commit/71b856c7817c39e98c5a0951e7114683799a89d6))
* backgroundGradient fix with android BorderDrawable ([41ce315](https://github.com/NativeScript/NativeScript/commit/41ce3152b6e8d1be3df24daff2588c44bb7f290a))
* Color.darken fix ([394209e](https://github.com/NativeScript/NativeScript/commit/394209e3f6bb323591571c3817fa555e2037f52e))
* css colors not parsed correctly within background property ([453ea18](https://github.com/NativeScript/NativeScript/commit/453ea18dc6bdd4abed539f13ac2b35d322b12fc4))
* include bundle-entry-points by default ([ea0b3b0](https://github.com/NativeScript/NativeScript/commit/ea0b3b0acdbe49dd9e122b8681695c216468923f))
* **ios:** actionBar title to use appearance api on ios15+ ([#9534](https://github.com/NativeScript/NativeScript/issues/9534)) ([4edeb19](https://github.com/NativeScript/NativeScript/commit/4edeb19bfe7adda31bae9977c9e2bec98fcada7d))
* **ios:** actionBar to use appearance api on ios13+ ([#9530](https://github.com/NativeScript/NativeScript/issues/9530)) ([8e3f16d](https://github.com/NativeScript/NativeScript/commit/8e3f16d4edba89a689133fb1079d472d9ac2d3f0))
* **ios:** actionitem coloring with 15+ ([7e35fdf](https://github.com/NativeScript/NativeScript/commit/7e35fdf143894f473a5140ceec4f26326164f393))
* **ios:** prevent views from being measured if no native view ([#9511](https://github.com/NativeScript/NativeScript/issues/9511)) ([56c50f2](https://github.com/NativeScript/NativeScript/commit/56c50f2bad75a5d8b808acfeb9342965a2ed680d))
* **ios:** resiliency to frame controller viewDidDisappear ([a5fd53b](https://github.com/NativeScript/NativeScript/commit/a5fd53b0168ab90d66d056973592ea64d821e016))
* **modal:** persist modal through configuration changes ([#9533](https://github.com/NativeScript/NativeScript/issues/9533)) ([f3cd3d3](https://github.com/NativeScript/NativeScript/commit/f3cd3d3375fbb42b9387e6b5654a3af9123a4417))
* **styling:** change transform parameters parsing ([#9481](https://github.com/NativeScript/NativeScript/issues/9481)) ([dbaab58](https://github.com/NativeScript/NativeScript/commit/dbaab585387578a142e35c70af8b8fd9e6be5b61)), closes [#5202](https://github.com/NativeScript/NativeScript/issues/5202)
* **webpack5:** angular scss rule not ignoring regular scss ([#9502](https://github.com/NativeScript/NativeScript/issues/9502)) ([093b369](https://github.com/NativeScript/NativeScript/commit/093b369b747135c53eb669c67488707d9dcd9f56))
* **webpack:** add virtualEntry before main entry ([5a3a35d](https://github.com/NativeScript/NativeScript/commit/5a3a35d3763a8a0c6452481a596e02a154e46d5f)), closes [#9469](https://github.com/NativeScript/NativeScript/issues/9469)
* **webpack:** use async type-checking in watch mode ([5309f2d](https://github.com/NativeScript/NativeScript/commit/5309f2d0a7de2e5eea87ab86afee371ea9e4110c))


### Features

* AbortController polyfill ([#9333](https://github.com/NativeScript/NativeScript/issues/9333)) ([af281dd](https://github.com/NativeScript/NativeScript/commit/af281dd098ab4ab47ec84235b53d80586266c9dd))
* **android:** support clipToBounds ([#9508](https://github.com/NativeScript/NativeScript/issues/9508)) ([5890667](https://github.com/NativeScript/NativeScript/commit/5890667b260fc988f1dd5e082c4ffcc6e6bc4cc0))
* **android:** vector drawable support ([#9464](https://github.com/NativeScript/NativeScript/issues/9464)) ([490f7dc](https://github.com/NativeScript/NativeScript/commit/490f7dce8004fb009733b0ed9611de478fe0dcbd))
* autofillType property for edit text base ([#9478](https://github.com/NativeScript/NativeScript/issues/9478)) ([4964d31](https://github.com/NativeScript/NativeScript/commit/4964d313c22d6afdb441bf146e08058d1dfdb3db))
* **color:** added utilities and improved color parsing performance ([#9110](https://github.com/NativeScript/NativeScript/issues/9110)) ([0ff2221](https://github.com/NativeScript/NativeScript/commit/0ff2221d6f809c917dc0227b6646ffb33a65100d))
* **config:** added option for ignoredNativeDependencies ([4cad76c](https://github.com/NativeScript/NativeScript/commit/4cad76cb6af4165291f5bdca17eb216a2438b93b))
* **core:** make css parsers tree-shakable ([#9496](https://github.com/NativeScript/NativeScript/issues/9496)) ([dce7408](https://github.com/NativeScript/NativeScript/commit/dce7408c05e35cbcfc1c066e9c9aca9f02da17ed))
* Frame replacePage by entry ([#9460](https://github.com/NativeScript/NativeScript/issues/9460)) ([4a5bec1](https://github.com/NativeScript/NativeScript/commit/4a5bec10cefaf17c9b8e06c2a102f701a6c79452)), closes [#9497](https://github.com/NativeScript/NativeScript/issues/9497)
* handle config name ([3bf55b7](https://github.com/NativeScript/NativeScript/commit/3bf55b7a0468afc4b4fd28ed479a63fd747caaa0))
* **image-source:** add saveToFileAsync, toBase64StringAsync & resizeAsync ([#9404](https://github.com/NativeScript/NativeScript/issues/9404)) ([36900d7](https://github.com/NativeScript/NativeScript/commit/36900d7c0512803395782a5fd1f55586d28cf3db))
* requestLayout performance improvements ([#9122](https://github.com/NativeScript/NativeScript/issues/9122)) ([e4ce17e](https://github.com/NativeScript/NativeScript/commit/e4ce17e15641dc044e5b514aa1eb333b467d600d))
* **types-android:** API 31 ([b5b46273b](https://github.com/NativeScript/NativeScript/pull/9542/commits/b5b46273bfb97c50cf71583e9aff9085997a297a))
* **types-ios:** iOS 15 ([cb8bf6f](https://github.com/NativeScript/NativeScript/commit/cb8bf6f930cab37160f318efb44fef17d9ed06e1))
* **webpack:** -v and --version flags ([7530ee4](https://github.com/NativeScript/NativeScript/commit/7530ee4bb5bc7893c15ef5cce84a34a1675674d3))
* **webpack:** export merge helper ([53492ea](https://github.com/NativeScript/NativeScript/commit/53492ea34ad66e263054af628208a20a32fb1cac))
* **webpack:** try resolving compiler, but don't fail if not found ([ff4359a](https://github.com/NativeScript/NativeScript/commit/ff4359abad6522522c325ae5264d07a0b110f63a))



## [8.0.11](https://github.com/NativeScript/NativeScript/compare/8.0.10-core...8.0.11) (2021-09-07)


### Bug Fixes

* **ios:** actionitem coloring with 15+ ([bf89aa2](https://github.com/NativeScript/NativeScript/commit/bf89aa2ff379242b3a6a283990d182106423672e))



## [8.0.10](https://github.com/NativeScript/NativeScript/compare/8.0.9-core...8.0.10) (2021-09-03)


### Bug Fixes

* **ios:** actionBar title to use appearance api on ios15+ ([#9534](https://github.com/NativeScript/NativeScript/issues/9534)) ([b4668ea](https://github.com/NativeScript/NativeScript/commit/b4668ea703f8e6fb1185c049594e5eb224d3db24))



## [8.0.9](https://github.com/NativeScript/NativeScript/compare/8.0.8-core...8.0.9) (2021-09-02)


### Bug Fixes

* **ios:** backport: actionBar to use appearance api on ios13+ ([#9530](https://github.com/NativeScript/NativeScript/issues/9530)) ([2b8783e](https://github.com/NativeScript/NativeScript/commit/2b8783e9eb97c1ed627dcf7b3413543bf9c5907d))



## [8.0.8](https://github.com/NativeScript/NativeScript/compare/8.0.7-core...8.0.8) (2021-06-15)


### Bug Fixes

* stop leaking style scopes ([#9444](https://github.com/NativeScript/NativeScript/issues/9444)) ([b8d8110](https://github.com/NativeScript/NativeScript/commit/b8d8110994ecb5a882e89ae10e7b13070ae4d709)), closes [#9311](https://github.com/NativeScript/NativeScript/issues/9311)
* **android:** accessibilityIdentifier ([#9432](https://github.com/NativeScript/NativeScript/issues/9432)) ([9f582ba](https://github.com/NativeScript/NativeScript/commit/9f582ba168dd6f4366e2591a9fed10e1c2443ca4))



## [8.0.7](https://github.com/NativeScript/NativeScript/compare/8.0.6-core...8.0.7) (2021-06-02)


### Bug Fixes

* **animations:** stop keyframe animations after View unloaded ([#9421](https://github.com/NativeScript/NativeScript/issues/9421)) ([04381fa](https://github.com/NativeScript/NativeScript/commit/04381fa3e74e9c277970fb282223abedd937b4c1))
* **box-shadow:** support for 'none' ([#9418](https://github.com/NativeScript/NativeScript/issues/9418)) ([263c920](https://github.com/NativeScript/NativeScript/commit/263c920cb8a4b22e257033006ce585ec32ca2605))
* **core:** guard unstable page/frame init contexts under async conditions ([#9428](https://github.com/NativeScript/NativeScript/issues/9428)) ([d3bc4d5](https://github.com/NativeScript/NativeScript/commit/d3bc4d5b82879ccb83483f99585127d981b43b38))
* **core:** typings for Utils.queueMacrotask and static methods on Observable ([#9425](https://github.com/NativeScript/NativeScript/issues/9425)) ([d589ac6](https://github.com/NativeScript/NativeScript/commit/d589ac600063416f3725c0abf8dfc88f556166db))


### Features

* **WebView:** allow JS bound window frame navigation to be intercepted through loadStarted ([#9430](https://github.com/NativeScript/NativeScript/issues/9430)) ([3806b85](https://github.com/NativeScript/NativeScript/commit/3806b85fcef01ad34327dda9cc2c88619b522c74))



## [8.0.6](https://github.com/NativeScript/NativeScript/compare/8.0.5-core...8.0.6) (2021-05-20)


### Bug Fixes

* **a11y:** add missing application event for fontScaleChanged ([#9396](https://github.com/NativeScript/NativeScript/issues/9396)) ([dac36c6](https://github.com/NativeScript/NativeScript/commit/dac36c68015512553689f6803d147da92f89cd93))
* **a11y:** font size ([#9395](https://github.com/NativeScript/NativeScript/issues/9395)) ([7a92c16](https://github.com/NativeScript/NativeScript/commit/7a92c1646f92f8afb9f8a87306cc90e8d2043e91))
* **Device:** don't cache device language & region ([#9394](https://github.com/NativeScript/NativeScript/issues/9394)) ([95596e8](https://github.com/NativeScript/NativeScript/commit/95596e82302bb945e6bf2126f19d9245e358cb79)), closes [#6082](https://github.com/NativeScript/NativeScript/issues/6082)
* **ios:** image with alpha resize ([#9386](https://github.com/NativeScript/NativeScript/issues/9386)) ([f380782](https://github.com/NativeScript/NativeScript/commit/f380782766b7034e4f776ad78e941fd9ac405c0b)), closes [#9385](https://github.com/NativeScript/NativeScript/issues/9385)
* **RootLayout:** prevent android touch event to pass through views underneath ([#9389](https://github.com/NativeScript/NativeScript/issues/9389)) ([0b2c190](https://github.com/NativeScript/NativeScript/commit/0b2c190662ceb63524049ac7792643414510858d))


### Features

* **text-view:** add returnPress ([#9390](https://github.com/NativeScript/NativeScript/issues/9390)) ([64adf5e](https://github.com/NativeScript/NativeScript/commit/64adf5ecfce5cae1582cbbf7d704e2ef9b75dd01)), closes [#4882](https://github.com/NativeScript/NativeScript/issues/4882)
* **Utils:** add dismissSoftInput helper ([#9392](https://github.com/NativeScript/NativeScript/issues/9392)) ([6cf4c59](https://github.com/NativeScript/NativeScript/commit/6cf4c5981b866c8a164eea0d53fd4c93875e8ba0)), closes [#4594](https://github.com/NativeScript/NativeScript/issues/4594)
* **web-view:** disableZoom property ([#9391](https://github.com/NativeScript/NativeScript/issues/9391)) ([7e878f8](https://github.com/NativeScript/NativeScript/commit/7e878f83a39478a7a33d89f08579df97db70fe00))



## [8.0.5](https://github.com/NativeScript/NativeScript/compare/8.0.4-core...8.0.5) (2021-05-10)


### Bug Fixes

* **android:** image asset handling regarding requestLegacyExternalStorage ([#9373](https://github.com/NativeScript/NativeScript/issues/9373)) ([f311151](https://github.com/NativeScript/NativeScript/commit/f3111514960ada615a69418b906620a638f8f476))


### Features

* **docs:** typedoc api reference ([#9378](https://github.com/NativeScript/NativeScript/issues/9378)) ([6d91c2a](https://github.com/NativeScript/NativeScript/commit/6d91c2a0195e07c182d2fccfb9c6f7d783acc4b7))



## [8.0.4](https://github.com/NativeScript/NativeScript/compare/8.0.3-core...8.0.4) (2021-05-05)


### Bug Fixes

* **core:** typings for showModal correction ([#9374](https://github.com/NativeScript/NativeScript/issues/9374)) ([9ec4042](https://github.com/NativeScript/NativeScript/commit/9ec404225ef0cff5f82d759fcdc7b85952e65c0d))


### Features

* add additional android global methods ([#9365](https://github.com/NativeScript/NativeScript/issues/9365)) ([a6cb46d](https://github.com/NativeScript/NativeScript/commit/a6cb46dac2d671221d9c0e972e8db89961b3e7c2))



## [8.0.3](https://github.com/NativeScript/NativeScript/compare/8.0.2-core...8.0.3) (2021-04-24)


### Bug Fixes

* **core:** protected class getter/setter webpack issue ([6076047](https://github.com/NativeScript/NativeScript/commit/6076047c4fa557e2eb1217e174c4b700ca4ab61c))
* **core:** typings issue around Trace.categories.All ([27c545d](https://github.com/NativeScript/NativeScript/commit/27c545db00bb57a8989612002aba859ff43581f2))



## [8.0.2](https://github.com/NativeScript/NativeScript/compare/8.0.1-core...8.0.2) (2021-04-20)


### Bug Fixes

* **a11y:** Accessibility breaks limiting metadata ([#9332](https://github.com/NativeScript/NativeScript/issues/9332)) ([cbdff1f](https://github.com/NativeScript/NativeScript/commit/cbdff1f1550a4e7cf06ccd4f01c5cd743c68e265))
* **a11y:** ios voiceover crash during touch ([#9318](https://github.com/NativeScript/NativeScript/issues/9318)) ([9a407ce](https://github.com/NativeScript/NativeScript/commit/9a407ce98964832c52cd51dc0ab60662fc65abb5))


### Features

* **text-base:** allow subclass to override createFormattedTextNative ([#9334](https://github.com/NativeScript/NativeScript/issues/9334)) ([b29e145](https://github.com/NativeScript/NativeScript/commit/b29e1452bda27183993c2f27ab13f95d9da5ceee))



## [8.0.1](https://github.com/NativeScript/NativeScript/compare/8.0.0-core...8.0.1) (2021-04-07)


### Bug Fixes

* **android:** accessibility crash on View not extending android.view.View ([#9303](https://github.com/NativeScript/NativeScript/issues/9303)) ([fde666d](https://github.com/NativeScript/NativeScript/commit/fde666de28ae58cd00cae6ce37705427b579a58f))
* **android:** crash on slide transition ([#9289](https://github.com/NativeScript/NativeScript/issues/9289)) ([e73cebf](https://github.com/NativeScript/NativeScript/commit/e73cebf7650474cb71de4a17576860a3499f9c05))
* **core:** Enums deprecation adjustment ([#9306](https://github.com/NativeScript/NativeScript/issues/9306)) ([f42acd8](https://github.com/NativeScript/NativeScript/commit/f42acd817f5353f86ba353ff483ff8d0e7bf7a61))



# [8.0.0](https://github.com/NativeScript/NativeScript/compare/7.3.0-core...8.0.0) (2021-04-06)


### Bug Fixes

* **color:** support web standard #rrggbbaa format ([aaeab99](https://github.com/NativeScript/NativeScript/commit/aaeab990c8f73d206bf19e1c918ec45e30d9e3a5)), closes [#ff00ff00](https://github.com/NativeScript/NativeScript/issues/ff00ff00) [#ff00ff00](https://github.com/NativeScript/NativeScript/issues/ff00ff00) [#00ff00](https://github.com/NativeScript/NativeScript/issues/00ff00) [#00ff00](https://github.com/NativeScript/NativeScript/issues/00ff00)
* **core:** stack layout padding ([#9183](https://github.com/NativeScript/NativeScript/issues/9183)) ([a12c188](https://github.com/NativeScript/NativeScript/commit/a12c188d0fa752f35be3daeafd14099e8589d815)), closes [#8810](https://github.com/NativeScript/NativeScript/issues/8810)
* **core:** trace instead of throw ([cc592b6](https://github.com/NativeScript/NativeScript/commit/cc592b63fddda324755f8abc0e0c4029a7dbeb22))
* **layouts:** rootlayout not closing when no shadecover transition specified ([#9278](https://github.com/NativeScript/NativeScript/issues/9278)) ([3c569ef](https://github.com/NativeScript/NativeScript/commit/3c569effedbc593e845c42bd396ff68a0d72171d))
* move BottomNavigation and Tabs to [@nativescript-community](https://github.com/nativescript-community) ([e62acba](https://github.com/NativeScript/NativeScript/commit/e62acba79243a91da6a0e915b47751daac3c985e))
* safeguards against invalid values ([f5db584](https://github.com/NativeScript/NativeScript/commit/f5db58414a7d5ab7052c5fbd94a602fd870826b4))
* **core:** type collisions with namespace ([#8809](https://github.com/NativeScript/NativeScript/issues/8809)) ([7330509](https://github.com/NativeScript/NativeScript/commit/733050995c5b28692e11c3bc122430c8634e29d4))
* **ios:** gesture touch event coordinates improvements ([#8998](https://github.com/NativeScript/NativeScript/issues/8998)) ([d46f956](https://github.com/NativeScript/NativeScript/commit/d46f9562b4cb5a6f31c0afd4b63ff640583193c3))


### Features

* **observable-array:** findIndex now supported ([770030e](https://github.com/NativeScript/NativeScript/commit/770030e7f61cd5006c67994051d4bfad5ce6c502))
* **view:** "hidden" property binding is now supported ([f00144e](https://github.com/NativeScript/NativeScript/commit/f00144e872c908f98949e0173db778ccec8fdcf0))
* implement BoxShadowDrawable ([9a7d3ec](https://github.com/NativeScript/NativeScript/commit/9a7d3ecb34887fffa572ce105ebc23bf21ba11ec))
* implement spreadRadius ([fca3466](https://github.com/NativeScript/NativeScript/commit/fca3466408f282d2763d4501b8489ece54d29905))
* improved css-shadow parser ([d2f50e5](https://github.com/NativeScript/NativeScript/commit/d2f50e50bba6e3b11fee14fa2f64034f02f8672f))
* **core:** box shadow demo ([#9182](https://github.com/NativeScript/NativeScript/issues/9182)) ([3bd2d96](https://github.com/NativeScript/NativeScript/commit/3bd2d96f296b57a1b7bedc48530e55c15f963ac2))
* **core:** box-shadow support ([#9161](https://github.com/NativeScript/NativeScript/issues/9161)) ([67e2fe4](https://github.com/NativeScript/NativeScript/commit/67e2fe42b7dc8fcc907c40d8c27a08e1e6d3e683))
* **core:** convenient color utilities ([#9066](https://github.com/NativeScript/NativeScript/issues/9066)) ([304633d](https://github.com/NativeScript/NativeScript/commit/304633d6b26e8181bdd052300e40f138c09ebddc))
* **core:** first class a11y support ([#8909](https://github.com/NativeScript/NativeScript/issues/8909)) ([d5a8a25](https://github.com/NativeScript/NativeScript/commit/d5a8a25aba1ee38b62c7cf424047a5c65e3bd9e1))
* **core:** reusable views ([#9163](https://github.com/NativeScript/NativeScript/issues/9163)) ([6cc130f](https://github.com/NativeScript/NativeScript/commit/6cc130fa6f9a716789e00e64f92a5b09dba7f358))
* **core:** RootLayout with api to fluidly handle dynamic layers ([#8980](https://github.com/NativeScript/NativeScript/issues/8980)) ([a90609a](https://github.com/NativeScript/NativeScript/commit/a90609a670ebbdfda7f31bea0e42e7de93875e69))
* **core:** text-shadow support ([#8991](https://github.com/NativeScript/NativeScript/issues/8991)) ([a6b1bde](https://github.com/NativeScript/NativeScript/commit/a6b1bde655aff61ac1afa682672026817971c2a5))

### BREAKING CHANGES

* **core:** `BottomNavigation` and `Tabs` moved to `@nativescript-community`

If using `BottomNavigation`, just install `@nativescript-community/ui-material-bottom-navigation` and update your imports to use it.

If using `Tabs`, just install `@nativescript-community/ui-material-tabs` and update your imports to use it.

* **core:** support web standard #rrggbbaa format

BEFORE:

```
// #aarrggbb

const color = new Color('#ff00ff00');

Label {
    background-color: #ff00ff00;
}
```

AFTER:

```
// #rrggbbaa

const color = new Color('#00ff00ff');

Label {
    background-color: #00ff00ff;
}
```


# [7.3.0](https://github.com/NativeScript/NativeScript/compare/7.2.2-core...7.3.0) (2021-02-27)


### Bug Fixes

* **core:** AndroidTransitionType symbol export handling ([#9252](https://github.com/NativeScript/NativeScript/issues/9252)) ([ac7f041](https://github.com/NativeScript/NativeScript/commit/ac7f041deada46bfe3bbd8359c02e9224155efd8))


### Features

* **android:** types for API Level 30 and cleanup ([#9219](https://github.com/NativeScript/NativeScript/issues/9219)) ([ebcc0e2](https://github.com/NativeScript/NativeScript/commit/ebcc0e2cc0e14d2042582901d36d4cfece7fae58))


### BREAKING CHANGES

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

## [7.2.2](https://github.com/NativeScript/NativeScript/compare/7.2.1-core...7.2.2) (2021-02-27)


### Bug Fixes

* **android:** KeyboardType now respects numbers ([#9240](https://github.com/NativeScript/NativeScript/issues/9240)) ([f08fcb1](https://github.com/NativeScript/NativeScript/commit/f08fcb17b49540126367f75d28499e5904e12106))
* **bottom-navigation:** fragment handling ([#9244](https://github.com/NativeScript/NativeScript/issues/9244)) ([c8ef6f2](https://github.com/NativeScript/NativeScript/commit/c8ef6f2ab3d3cd854a92dfecd0e8b2605c00f3af))
* **xhr:** remove unnecessary throw when event not supported ([#9251](https://github.com/NativeScript/NativeScript/issues/9251)) ([11ef943](https://github.com/NativeScript/NativeScript/commit/11ef94349588aca23e27b2cfaf0a3e4f93df649e))


### Features

* **android:** Add possibility to choose theme in android dialogs ([#9212](https://github.com/NativeScript/NativeScript/issues/9212)) ([e7951b3](https://github.com/NativeScript/NativeScript/commit/e7951b320f4178024a4cb5b92bab0761517a68bb))
* **core:** allow property overrides at runtime ([#9241](https://github.com/NativeScript/NativeScript/issues/9241)) ([c04e1b5](https://github.com/NativeScript/NativeScript/commit/c04e1b59e5f1a1fa48d2048c02821b97807a2c5e))
* add npm scripts for different package managers, ie: yarn, pnpm ([#9230](https://github.com/NativeScript/NativeScript/issues/9230)) ([d7b2c84](https://github.com/NativeScript/NativeScript/commit/d7b2c84da87f9f9381d04886a3ddb0c3f031abfa))



## [7.2.1](https://github.com/NativeScript/NativeScript/compare/7.2.0-core...7.2.1) (2021-02-07)


### Bug Fixes

* **core:** conflicting node global types ([#9197](https://github.com/NativeScript/NativeScript/issues/9197)) ([de7006b](https://github.com/NativeScript/NativeScript/commit/de7006b04d1fb2209b8f6efeafbc2a16d4a1d83d))



# [7.2.0](https://github.com/NativeScript/NativeScript/compare/7.1.4-core...7.2.0) (2021-02-05)


### Bug Fixes

* **core:** ObservableArray splice with start only ([#9159](https://github.com/NativeScript/NativeScript/issues/9159)) ([3ddfb5c](https://github.com/NativeScript/NativeScript/commit/3ddfb5c34a3f7d7ad9d092a87b1cfebbc2ab5b07))
* **ios:** allow navigationFrom event for deep navigation within modal frame ([#9187](https://github.com/NativeScript/NativeScript/issues/9187)) ([8f1455e](https://github.com/NativeScript/NativeScript/commit/8f1455eef71a4feaaffe4fb2aca4e49da0bc0670))
* **ios:** force release of nsdata after saving image ([#9177](https://github.com/NativeScript/NativeScript/issues/9177)) ([e002d72](https://github.com/NativeScript/NativeScript/commit/e002d72d41b7a006788fcd38feb51a7b3c1ef870))
* **ios:** navigation via swipe crash fix ([#9132](https://github.com/NativeScript/NativeScript/issues/9132)) ([28061e3](https://github.com/NativeScript/NativeScript/commit/28061e3d39fe713d78f1191a5c7e31dda7941ac1))
* **ios:** textfield resizing (auto width) on text change ([#9176](https://github.com/NativeScript/NativeScript/issues/9176)) ([c31bab1](https://github.com/NativeScript/NativeScript/commit/c31bab1bf73af7f90ff3c5c90a22b86a682137ea))
* **page:** frame getter for custom Frames ([#9195](https://github.com/NativeScript/NativeScript/issues/9195)) ([6da7d90](https://github.com/NativeScript/NativeScript/commit/6da7d90e256d220db79e245228b91d5fa8e41984))
* **webpack:** --env.uglify works properly now ([#9165](https://github.com/NativeScript/NativeScript/issues/9165)) ([be52cef](https://github.com/NativeScript/NativeScript/commit/be52cefe672aaca6d707c1c3b78cee7ee8abe8f1))
* **webpack:** Angular no longer has issues handling {N} plugins without nativescript in name ([#9172](https://github.com/NativeScript/NativeScript/issues/9172)) ([79a5fc8](https://github.com/NativeScript/NativeScript/commit/79a5fc89750ea467a2d44d5d9b5264c9fdad1a94))
* **webpack:** inspector_modules ([87418cd](https://github.com/NativeScript/NativeScript/commit/87418cdb119e4114285be81999968438d2094929))


### Features

* **android:** FlexboxLayout support for isPassThroughParentEnabled ([#8798](https://github.com/NativeScript/NativeScript/issues/8798)) ([5fe2742](https://github.com/NativeScript/NativeScript/commit/5fe27428e07a267454a5fcfa8584ba688bf0baef))
* **core:** setSelection method for editable text components ([#9175](https://github.com/NativeScript/NativeScript/issues/9175)) ([58b2542](https://github.com/NativeScript/NativeScript/commit/58b254299770b362e0c5baee36000ec81b57335a))
* **ios:** build TNSWidgets as XCFramework ([#9167](https://github.com/NativeScript/NativeScript/issues/9167)) ([04a7641](https://github.com/NativeScript/NativeScript/commit/04a76415b785ca419d057d570fc71f61b7d3bb83))
* **webpack:** allow passing env.appComponents and env.entries ([#8898](https://github.com/NativeScript/NativeScript/issues/8898)) ([90d208c](https://github.com/NativeScript/NativeScript/commit/90d208c115b582e37844494d10b0eaf6a3d74122))


### Performance Improvements

* **android:** faster background color setter ([#9120](https://github.com/NativeScript/NativeScript/issues/9120)) ([e501273](https://github.com/NativeScript/NativeScript/commit/e501273d166b0e6f8b3746d508e97099525cea0a))


## [7.1.4](https://github.com/NativeScript/NativeScript/compare/7.1.3-core...7.1.4) (2021-01-23)


### Bug Fixes

* **ios:** getVisibleViewController maximum call stack exceeded ([#9168](https://github.com/NativeScript/NativeScript/issues/9168)) ([1a3523e](https://github.com/NativeScript/NativeScript/commit/1a3523ef22f15574ce5658429a4c18eb141ab881))



## [7.1.3](https://github.com/NativeScript/NativeScript/compare/7.1.2-core...7.1.3) (2021-01-17)


### Bug Fixes

* **android:** BottomNavigation fragment child already has a parent ([#9148](https://github.com/NativeScript/NativeScript/issues/9148)) ([4690162](https://github.com/NativeScript/NativeScript/commit/4690162384c731d6d652d90a9347cae06c0a0e0c))



## [7.1.2](https://github.com/NativeScript/NativeScript/compare/7.1.1-core...7.1.2) (2021-01-14)


### Bug Fixes

* **webpack:** support other workspace config styles ([7a79a89](https://github.com/NativeScript/NativeScript/commit/7a79a8988b55e7e0896e7ad38f571aba6987edb5))


### Features

* **core:** rollup additional Utils ([882aa42](https://github.com/NativeScript/NativeScript/commit/882aa42e8573615aa5ba89396d0f0cdbb711bed3))



## [7.1.1](https://github.com/NativeScript/NativeScript/compare/7.1.0-core...7.1.1) (2021-01-13)


### Bug Fixes

* **core:** const initializer in an ambient context ([#9136](https://github.com/NativeScript/NativeScript/issues/9136)) ([47ebb1d](https://github.com/NativeScript/NativeScript/commit/47ebb1d262aa9ebf29fe445e57d19910612d047f)), closes [#9135](https://github.com/NativeScript/NativeScript/issues/9135)



# [7.1.0](https://github.com/NativeScript/NativeScript/compare/4.0.0-webpack...7.1.0) (2020-12-30)


### Bug Fixes

* **android:** modal not following activity windowSoftInputMode ([#9042](https://github.com/NativeScript/NativeScript/issues/9042)) ([d09a564](https://github.com/NativeScript/NativeScript/commit/d09a564296669dcffd03cd32b18f7a6454c7c472))
* **android:** ActivityIndicator custom color affecting other indicators on the page ([#9026](https://github.com/NativeScript/NativeScript/issues/9026)) ([e16bc60](https://github.com/NativeScript/NativeScript/commit/e16bc606ef6ed506cbc38e50247a59637d898b50))
* **android:** Tabs selected item color incorrectly applied ([#9040](https://github.com/NativeScript/NativeScript/issues/9040)) ([b47ce0a](https://github.com/NativeScript/NativeScript/commit/b47ce0a97c38547d060fb4626df02d63f518f721))
* **compat:** add screen and device aliases ([#9088](https://github.com/NativeScript/NativeScript/issues/9088)) ([4204ac8](https://github.com/NativeScript/NativeScript/commit/4204ac8308eda902efd787ce96971463eab343ab))
* **core:** notify object now optional ([#9032](https://github.com/NativeScript/NativeScript/issues/9032)) ([539fd1e](https://github.com/NativeScript/NativeScript/commit/539fd1eb293241dc067bfdcc77613b0eb67b099f))
* **ios:** ios 10 tab crash ([#9018](https://github.com/NativeScript/NativeScript/issues/9018)) ([b3f9c0d](https://github.com/NativeScript/NativeScript/commit/b3f9c0d0ac656f413653d79d5eb9fcb1a6e1ca0f))
* **list-view:** handle reusing wrong view ([#9023](https://github.com/NativeScript/NativeScript/issues/9023)) ([64e0aa6](https://github.com/NativeScript/NativeScript/commit/64e0aa6a114c414ad190696919d4b206b637f61f))
* **tabs:** ios safeArea calculation ([#9089](https://github.com/NativeScript/NativeScript/issues/9089)) ([9391b44](https://github.com/NativeScript/NativeScript/commit/9391b44996e833fc63f0b2bc4c6c90e47c12a3b8))

### Features

* **android:** setInterval closer to web spec ([#9044](https://github.com/NativeScript/NativeScript/issues/9044)) ([1769de9](https://github.com/NativeScript/NativeScript/commit/1769de903392ab14ffb6c366ab86dc24b5289e81))
* **ios:** types for latest ios 14.3 with Xcode 12.3 ([#9118](https://github.com/NativeScript/NativeScript/issues/9118)) ([9aad2db](https://github.com/NativeScript/NativeScript/commit/9aad2dbdbcf7e786183af9abbf16b4009c756ae3))
* **ios** iosIgnoreSafeArea property ([#9092](https://github.com/NativeScript/NativeScript/issues/9092)) ([ea67422](https://github.com/NativeScript/NativeScript/commit/ea67422fcf3106db1359a358e897a63827a642f3))
* **core:** queueMacroTask ([#8904](https://github.com/NativeScript/NativeScript/issues/8904)) ([e3dc89f](https://github.com/NativeScript/NativeScript/commit/e3dc89fbfc4dd8030097c7831479eb18cf23d8eb))
* **core:** allow app to start without a root view ([#9056](https://github.com/NativeScript/NativeScript/issues/9056)) ([bd7c686](https://github.com/NativeScript/NativeScript/commit/bd7c686aaf55d26b2b483905bd5e0a453429cabd))
* **frame:** add navigatingTo and navigatedTo events ([#9025](https://github.com/NativeScript/NativeScript/issues/9025)) ([cf96e72](https://github.com/NativeScript/NativeScript/commit/cf96e7252cdf66230cc03ddec907168e47d1f250))

### Performance

* faster color parsing ([c569236](https://github.com/NativeScript/NativeScript/commit/c5692363575821ef588b2260e80ad5bbffe45293))



## [7.0.13](https://github.com/NativeScript/NativeScript/compare/7.0.12-core...7.0.13) (2020-10-28)


### Bug Fixes

* **core:** ListViewCell.initWithEmptyBackground ([#8985](https://github.com/NativeScript/NativeScript/issues/8985)) ([0eb2246](https://github.com/NativeScript/NativeScript/commit/0eb2246b7dfc3eda731f8cb7ee1bbfcd36551dfa))
* **ios:** UIImage.imageWithData.async is not a function ([b966542](https://github.com/NativeScript/NativeScript/commit/b96654276b8e423a21f95261449f578470e027d8))


### Features

* **core:** Repeater multiple item templates implementation ([#8981](https://github.com/NativeScript/NativeScript/issues/8981)) ([b113f19](https://github.com/NativeScript/NativeScript/commit/b113f1916db591d23327e7eead498c722ce76876))



## [7.0.12](https://github.com/NativeScript/NativeScript/compare/7.0.11-core...7.0.12) (2020-10-21)


### Bug Fixes

* **android:** BottomNavigation error on back press (application exit) ([#8970](https://github.com/NativeScript/NativeScript/issues/8970)) ([99bb067](https://github.com/NativeScript/NativeScript/commit/99bb067420871078c40454eec842fad6cbede0f7))
* **core:** ObservableArray tests and a typo ([#8968](https://github.com/NativeScript/NativeScript/issues/8968)) ([5c1b7f6](https://github.com/NativeScript/NativeScript/commit/5c1b7f6d76c19877da1f47a0696dfbbd89b5fd00))


### Features

* **core:** TypeScript 4 + cleanup ([#8967](https://github.com/NativeScript/NativeScript/issues/8967)) ([2243660](https://github.com/NativeScript/NativeScript/commit/2243660080ce6877d68a3f32fd64625f86023f77))
* **webpack:** add svelte support ([#8963](https://github.com/NativeScript/NativeScript/issues/8963)) ([0afea86](https://github.com/NativeScript/NativeScript/commit/0afea8681c62071823804f392ab8d595e61190ff))



## [7.0.10](https://github.com/NativeScript/NativeScript/compare/7.0.10-core...7.0.10) (2020-10-10)


### Bug Fixes

* **ios:** iOS 10 support with adjustment to UILayoutGuide ([#8954](https://github.com/NativeScript/NativeScript/issues/8954)) ([ad25759](https://github.com/NativeScript/NativeScript/commit/ad2575991aa53c1a1806dfd5dc5e368e1674d73c))


### Features

* **webpack:** angular configuration schema validation compliance ([ee05b44](https://github.com/NativeScript/NativeScript/commit/ee05b4466336858bd7e2dcb651deb15ba74fc8c2))
* **webpack:** angular configuration support for environment handling ([#8938](https://github.com/NativeScript/NativeScript/issues/8938)) ([3f7bf67](https://github.com/NativeScript/NativeScript/commit/3f7bf676ff4321d7c490099e3c72687ad68d46a2))



## [7.0.10](https://github.com/NativeScript/NativeScript/compare/7.0.9-core...7.0.10) (2020-10-03)


### Bug Fixes

* **core:** ensure globals do not get tree shaked ([#8931](https://github.com/NativeScript/NativeScript/issues/8931)) ([bf772c4](https://github.com/NativeScript/NativeScript/commit/bf772c46b77fafc1be6493d9d0d01139b9b49242))



## [7.0.8](https://github.com/NativeScript/NativeScript/compare/7.0.8-core...7.0.8) (2020-10-01)


### Bug Fixes

* **android:** fragment onPause ([#8919](https://github.com/NativeScript/NativeScript/issues/8919)) ([a55bcd8](https://github.com/NativeScript/NativeScript/commit/a55bcd8561ee229a67a92578ba25a6439b860302))
* **core:** ObservableArray splice ensure index is > 0 ([#8921](https://github.com/NativeScript/NativeScript/issues/8921)) ([6d135e5](https://github.com/NativeScript/NativeScript/commit/6d135e5d63ee34270e6452d0184fe40f45e2b5ec))


### Features

* **ui-mobile-base:** enable bitcode ([#8917](https://github.com/NativeScript/NativeScript/issues/8917)) ([66cea78](https://github.com/NativeScript/NativeScript/commit/66cea78c4936910d547a18727be24749dec029b5))



## [7.0.8](https://github.com/NativeScript/NativeScript/compare/7.0.7-core...7.0.8) (2020-09-29)


### Bug Fixes

* **core:** global index typing fix for unit testing framework ([#8915](https://github.com/NativeScript/NativeScript/issues/8915)) ([806fc88](https://github.com/NativeScript/NativeScript/commit/806fc880dd944a8808a0f407ae5d0c0d4be55d5d))
* **core:** Observable splice index > length  ([#8900](https://github.com/NativeScript/NativeScript/issues/8900)) ([65b1cdb](https://github.com/NativeScript/NativeScript/commit/65b1cdbae0a9e873a3d2bc4636038423351b794e))
* **ios:** Utils.openFile ([#8914](https://github.com/NativeScript/NativeScript/issues/8914)) ([647926e](https://github.com/NativeScript/NativeScript/commit/647926ee281712a82238d5153522d9a07be5870c))



## [7.0.7](https://github.com/NativeScript/NativeScript/compare/7.0.6-core...7.0.7) (2020-09-26)


### Bug Fixes

* **ios:** preferredDatePickerStyle property ([#8899](https://github.com/NativeScript/NativeScript/issues/8899)) ([dbefc43](https://github.com/NativeScript/NativeScript/commit/dbefc43b9bb9b907883990f8d40c178fc7ecea9c))



## [7.0.6](https://github.com/NativeScript/NativeScript/compare/7.0.5-core...7.0.6) (2020-09-25)


### Bug Fixes

* **core:** delegate should be set on nativeTextViewProtected ([#8881](https://github.com/NativeScript/NativeScript/issues/8881)) ([021c0bb](https://github.com/NativeScript/NativeScript/commit/021c0bb9a24f15a9adf9d5e25a981ea53901e600))
* **core:** global handling with env.production flag ([#8903](https://github.com/NativeScript/NativeScript/issues/8903)) ([3437ed7](https://github.com/NativeScript/NativeScript/commit/3437ed7e1483cddf75aeca9bd8ff475e449f110f))



## [7.0.5](https://github.com/NativeScript/NativeScript/compare/7.0.4-core...7.0.5) (2020-09-23)


### Bug Fixes

* **core:** bundle entry points and global handling ([#8884](https://github.com/NativeScript/NativeScript/issues/8884)) ([1f790ed](https://github.com/NativeScript/NativeScript/commit/1f790edc8032fd36bde4b7a24e4d1c1c4b4dea49))



## [7.0.4](https://github.com/NativeScript/NativeScript/compare/7.0.3-types-ios...7.0.4) (2020-09-23)


### Bug Fixes

* **android-transitions:** remove hard-coded flip transition duration/curve ([#8851](https://github.com/NativeScript/NativeScript/issues/8851)) ([5f8d3d0](https://github.com/NativeScript/NativeScript/commit/5f8d3d03f7eac1bdcb1cf4c338734298d2ba86ab))
* **ios:** text-view color refreshes properly after setting the text to keep the styles ([#8863](https://github.com/NativeScript/NativeScript/issues/8863)) ([313f476](https://github.com/NativeScript/NativeScript/commit/313f47637e2fd3d95acb56499cf72e8d6cde7aec))
* **ios:** time-picker and date-picker for iOS 14 ([#8877](https://github.com/NativeScript/NativeScript/issues/8877)) ([45fb6c4](https://github.com/NativeScript/NativeScript/commit/45fb6c481b3ae7b3df2cd9f666e1813bdbaff0c7))


### Features

* **core:** global event handling ([#8830](https://github.com/NativeScript/NativeScript/issues/8830)) ([eb676fd](https://github.com/NativeScript/NativeScript/commit/eb676fdedf9e3db750bb1c0e7b48194faed2c772))



## [7.0.3](https://github.com/NativeScript/NativeScript/compare/7.0.0...7.0.3) (2020-09-12)


### Bug Fixes

* add missing configuration keys and move profiling out of android key ([#8847](https://github.com/NativeScript/NativeScript/issues/8847)) ([d69e568](https://github.com/NativeScript/NativeScript/commit/d69e568a4b6505e1ceef33a56100996199bf2d4b))



## [7.0.2](https://github.com/NativeScript/NativeScript/compare/7.0.0...7.0.2) (2020-09-10)


### Bug Fixes

* **core:** autoSystemAppearanceChanged typings in ambient context fix ([c30a9c3](https://github.com/NativeScript/NativeScript/commit/c30a9c3e3569e0367056bfd80fa730ae79e29066))
* **core:** bundle-config-loader global handling ([#8838](https://github.com/NativeScript/NativeScript/issues/8838)) ([1623a56](https://github.com/NativeScript/NativeScript/commit/1623a567b6eaa195d075936103d2f7d829e1fa07))
* **webpack:** verify now works properly ([f7713c4](https://github.com/NativeScript/NativeScript/commit/f7713c40a63959c2b5934a25bd3577f07d0401c0))



## [7.0.1](https://github.com/NativeScript/NativeScript/compare/7.0.0...7.0.1) (2020-09-09)


### Bug Fixes

* **webpack:** react config ([#8822](https://github.com/NativeScript/NativeScript/issues/8822)) ([354b935](https://github.com/NativeScript/NativeScript/commit/354b935c6a334de3d418495b11674a799293a8bd))
* invalid cli tag version ([#8821](https://github.com/NativeScript/NativeScript/issues/8821)) ([d51abef](https://github.com/NativeScript/NativeScript/commit/d51abef6bfeb66ed647d5bd2e1711d0ce9d07113))
* **webpack:** apply-css-loader not applying css ([#8811](https://github.com/NativeScript/NativeScript/issues/8811)) ([c1a2d54](https://github.com/NativeScript/NativeScript/commit/c1a2d543b8a9aad0551ae5bb445ef4e08bac99b2))
* **webpack:** Change NativeClass properties to enumerable ([#8813](https://github.com/NativeScript/NativeScript/issues/8813)) ([e4a2930](https://github.com/NativeScript/NativeScript/commit/e4a2930c6a019e3b65a7968afe4fa2653246ecf4))


### Features

* **core:** boolean to disable systemAppearanceChanged (theme) ([#8827](https://github.com/NativeScript/NativeScript/issues/8827)) ([5286adf](https://github.com/NativeScript/NativeScript/commit/5286adf081cb75ea17251edd498266be7fe7189a))
* **core:** export additional properties for plugin usage ([#8835](https://github.com/NativeScript/NativeScript/issues/8835)) ([a2e1aa2](https://github.com/NativeScript/NativeScript/commit/a2e1aa246e6a9cbdd6d2c4647c9740ef411ad51a))



# [7.0.0](https://github.com/NativeScript/NativeScript/compare/6.5.15...7.0.0) (2020-09-03)


### Bug Fixes

* **ios:** stop using artificial state handler via animated setter on uiviewcontroller ([#8797](https://github.com/NativeScript/NativeScript/issues/8797)) ([967d652](https://github.com/NativeScript/NativeScript/commit/967d652c61fbeed6c7e8bd568c893d40308b5b58))
* **webpack:** don't require ts transformer unless processing ts file ([fa9f095](https://github.com/NativeScript/NativeScript/commit/fa9f0957b86624532c4b18a6510bdf405ecbe931))


### Features

* **core:** es2017 targeting ([020ad4d](https://github.com/NativeScript/NativeScript/commit/020ad4da37f551e934cd6054ca983ab5083a4042))
* **core:** nativescript.config and webpack updates ([#8801](https://github.com/NativeScript/NativeScript/issues/8801)) ([54cce4f](https://github.com/NativeScript/NativeScript/commit/54cce4f20c142397fd31bba3300c27a3d7459420))
* add enableMultithreadedJavascript flag to config definition ([4abfc8a](https://github.com/NativeScript/NativeScript/commit/4abfc8a370e3402e9566de078473f9e8deceff8b))
* **webpack:** using new nativescript.config ([#8796](https://github.com/NativeScript/NativeScript/issues/8796)) ([33a703e](https://github.com/NativeScript/NativeScript/commit/33a703e1291b242fe7b218aa1e6bd746a5217f88))



## [6.5.15](https://github.com/NativeScript/NativeScript/compare/6.5.13...6.5.15) (2020-08-12)


### Bug Fixes

* **android:** list picker getTextColor api level issue ([#8755](https://github.com/NativeScript/NativeScript/issues/8755)) ([5c076de](https://github.com/NativeScript/NativeScript/commit/5c076de8560f71b59cf34124f47ebeafdc902658))



## [6.5.13](https://github.com/NativeScript/NativeScript/compare/6.5.12...6.5.13) (2020-08-07)


### Bug Fixes

* **android:** 'isEnabled' now works properly for SegmentedBar ([#8711](https://github.com/NativeScript/NativeScript/issues/8711)) ([0850252](https://github.com/NativeScript/NativeScript/commit/08502527eb25d074d5e29ede506f5fb88f47d088))
* **android:** line-height ([#8751](https://github.com/NativeScript/NativeScript/issues/8751)) ([4708ff4](https://github.com/NativeScript/NativeScript/commit/4708ff4e680669c3747837be036c6cb86b4b46c6))


### Features

* **ios:** dialog size can now use CSS or attribute like android ([#8710](https://github.com/NativeScript/NativeScript/issues/8710)) ([fc37b95](https://github.com/NativeScript/NativeScript/commit/fc37b958fe4fc9f83cace2965f73a81c802cac75))



## [6.5.12](https://github.com/NativeScript/NativeScript/compare/6.5.11...6.5.12) (2020-07-21)


### Bug Fixes

* **ios:** actionbar show/hide should trigger page layout ([#8726](https://github.com/NativeScript/NativeScript/issues/8726)) ([09d866c](https://github.com/NativeScript/NativeScript/commit/09d866cfcda7c0ea42622201eac50a1b8691a26b))



## [6.5.11](https://github.com/NativeScript/NativeScript/compare/6.5.10...6.5.11) (2020-07-20)


### Bug Fixes

* **android:** add check in ad.dismissSoftInput to make sure the dismissed nativeView has focus at that moment ([#8720](https://github.com/NativeScript/NativeScript/issues/8720)) ([4479096](https://github.com/NativeScript/NativeScript/commit/4479096b5631c0f3d311d8afef73a24dfb082c8f))



## [6.5.10](https://github.com/NativeScript/NativeScript/compare/6.5.9...6.5.10) (2020-07-11)


### Features

* **tabs:** add animationEnabled property ([#8704](https://github.com/NativeScript/NativeScript/issues/8704)) ([36aa181](https://github.com/NativeScript/NativeScript/commit/36aa181185cc097f5281cb113cd87aca183ee659))



## [6.5.9](https://github.com/NativeScript/NativeScript/compare/6.5.8...6.5.9) (2020-07-07)


### Bug Fixes

* **bindable:** parent referenced expression-values now load properly using an update call ([#8670](https://github.com/NativeScript/NativeScript/issues/8670)) ([6b0028a](https://github.com/NativeScript/NativeScript/commit/6b0028afd7b554914b039cdf371e8e30f6e02dac)), closes [#8666](https://github.com/NativeScript/NativeScript/issues/8666) [#6981](https://github.com/NativeScript/NativeScript/issues/6981) [#5054](https://github.com/NativeScript/NativeScript/issues/5054)
* **scroll-view:** android 'isScrollEnabled' will apply if changed while gesture is underway ([#8695](https://github.com/NativeScript/NativeScript/issues/8695)) ([02ec7f1](https://github.com/NativeScript/NativeScript/commit/02ec7f104d327df53df687ddd1b8ac5b1cdc04ba))
* **snapshots:** android is not defined ([#8691](https://github.com/NativeScript/NativeScript/issues/8691)) ([a8bbd7c](https://github.com/NativeScript/NativeScript/commit/a8bbd7c1e580e77e7ad5ddc7be6845e3d8fb02de))
* **text-view:** only reload text if hint is showing on ios ([#8662](https://github.com/NativeScript/NativeScript/issues/8662)) ([ec17727](https://github.com/NativeScript/NativeScript/commit/ec17727e91f7a3209ada2c7de0bcf59c98c4e62a))


### Features

* **connectivity:** getActiveNetworkInfo and NetworkInfo modern compliance [#8580](https://github.com/NativeScript/NativeScript/issues/8580) ([#8652](https://github.com/NativeScript/NativeScript/issues/8652)) ([635f31f](https://github.com/NativeScript/NativeScript/commit/635f31f81f7826112142c707aff2a66c2b480b0e))
* **dialog:** ios destructive style from options ([#8676](https://github.com/NativeScript/NativeScript/issues/8676)) ([bb531ce](https://github.com/NativeScript/NativeScript/commit/bb531ce71028f9c4fd4d753df16c82104f158e35))
* **ImageSource:** resize method ([#8678](https://github.com/NativeScript/NativeScript/issues/8678)) ([bd12baf](https://github.com/NativeScript/NativeScript/commit/bd12bafb4aae8f1c523be4c7e04fa73722092304))
* **text-view:** allow easy subclassing on ios ([#8663](https://github.com/NativeScript/NativeScript/issues/8663)) ([7d36447](https://github.com/NativeScript/NativeScript/commit/7d364474c23e17acf7696f159d3945d8a73d63e6))



## [6.5.8](https://github.com/NativeScript/NativeScript/compare/6.5.7...6.5.8) (2020-06-20)


### Bug Fixes

* **enums:** add Visibility.hidden ([#8655](https://github.com/NativeScript/NativeScript/issues/8655)) ([41a21ea](https://github.com/NativeScript/NativeScript/commit/41a21ea91651acef150605ecaa9d62e6093ec815)), closes [#8653](https://github.com/NativeScript/NativeScript/issues/8653)
* **module-name-resolver:** livesync page qualifier handling ([#8637](https://github.com/NativeScript/NativeScript/issues/8637)) ([4f64bac](https://github.com/NativeScript/NativeScript/commit/4f64bace62627a9c8e2a59a38bd53bbe1250a2ac))



## [6.5.7](https://github.com/NativeScript/NativeScript/compare/6.5.6...6.5.7) (2020-06-17)


### Bug Fixes

* **span:** value handling for strings and numbers ([#8651](https://github.com/NativeScript/NativeScript/issues/8651)) ([0ca838e](https://github.com/NativeScript/NativeScript/commit/0ca838ed0ced845b5a02300d31cbd1256e597a9d))



## [6.5.6](https://github.com/NativeScript/NativeScript/compare/6.5.5...6.5.6) (2020-06-16)


### Bug Fixes

* **ios:** gesture handling resilience when views are destroyed quickly ([#8645](https://github.com/NativeScript/NativeScript/issues/8645)) ([9afa15f](https://github.com/NativeScript/NativeScript/commit/9afa15fa710984c2769d42b1d9accf04d2ad52a8))
* **text-base:** apply dynamic text color change on button for ios ([#8635](https://github.com/NativeScript/NativeScript/issues/8635)) ([5cacc25](https://github.com/NativeScript/NativeScript/commit/5cacc25aa728b9ba869b7c7e4a8c0f361eb58583))


### Features

* **android:** Implementing 'onBackPressed' for frame-root ([#8634](https://github.com/NativeScript/NativeScript/issues/8634)) ([c73952f](https://github.com/NativeScript/NativeScript/commit/c73952f364dd76c0c65f20fe11247b9245cb80fd))



## [6.5.5](https://github.com/NativeScript/NativeScript/compare/6.5.4...6.5.5) (2020-06-10)


### Bug Fixes

* **text-base:** apply letter spacing in ios text field ([#8618](https://github.com/NativeScript/NativeScript/issues/8618)) ([e2a9af2](https://github.com/NativeScript/NativeScript/commit/e2a9af2bc74d0198882a9c1a57b7785d37ba947c))
* **text-base:** letter spacing for textfield ([#8627](https://github.com/NativeScript/NativeScript/issues/8627)) ([eb4c61f](https://github.com/NativeScript/NativeScript/commit/eb4c61fc413c9a2ee6a9ef6aef10a234644516df))
* **text-base:** update text color for ios ([#8617](https://github.com/NativeScript/NativeScript/issues/8617)) ([d3549ac](https://github.com/NativeScript/NativeScript/commit/d3549ac115ecd39967790eaca2ea85bb1b291bbc))


### Features

* **text-base:** Add Span vertical-align support ([#8257](https://github.com/NativeScript/NativeScript/issues/8257)) ([faa0181](https://github.com/NativeScript/NativeScript/commit/faa0181b9c95b0e0ca55e922f09bde804ac6537f))



## [6.5.4](https://github.com/NativeScript/NativeScript/compare/6.5.3...6.5.4) (2020-06-04)


### Bug Fixes

* **core:** pin typescript to 3.8.3 to avoid __exportStar issue ([#8612](https://github.com/NativeScript/NativeScript/issues/8612)) ([8931295](https://github.com/NativeScript/NativeScript/commit/8931295ab54e1522848ba4d3986f9ba02926644c))



## [6.5.3](https://github.com/NativeScript/NativeScript/compare/6.5.2...6.5.3) (2020-06-04)


### Bug Fixes

* **ios:** dialog handling with top view controller ([#8609](https://github.com/NativeScript/NativeScript/issues/8609)) ([b015eee](https://github.com/NativeScript/NativeScript/commit/b015eeed515b2b42f89bbe3e25a987fa3230706c))


## [6.5.2](https://github.com/NativeScript/NativeScript/compare/6.5.1...6.5.2) (2020-05-28)

### Features

* setProperty on Observable ([#8521](https://github.com/NativeScript/NativeScript/pull/8521))([7cf3c97](https://github.com/NativeScript/NativeScript/commit/7cf3c97))
 
### Bug Fixes

* fix ios hmr ([#8559](https://github.com/NativeScript/NativeScript/pull/8559)) ([446163d](https://github.com/NativeScript/NativeScript/commit/446163d))
* the css parser should handle empty nodes ([#8503](https://github.com/NativeScript/NativeScript/pull/8503)) ([f7ab4ba](https://github.com/NativeScript/NativeScript/commit/f7ab4ba))
* parse css selectors with escape sequences (for real) ([#8496](https://github.com/NativeScript/NativeScript/pull/8496)) ([50eb372](https://github.com/NativeScript/NativeScript/commit/50eb372))
* do not clear androidView._cachedDrawable ([#8475](https://github.com/NativeScript/NativeScript/pull/8475)) ([e421129](https://github.com/NativeScript/NativeScript/commit/e421129))
* call to nativeView ([#8488](https://github.com/NativeScript/NativeScript/pull/8488)) ([2b06adc](https://github.com/NativeScript/NativeScript/commit/2b06adc))
* dont default to Font.default ([#8401](https://github.com/NativeScript/NativeScript/pull/8401)) ([ad9daa8](https://github.com/NativeScript/NativeScript/commit/ad9daa8))
* **tabs:** dynamic styling fixes ([#8479](https://github.com/NativeScript/NativeScript/pull/8479)) ([fc8f769](https://github.com/NativeScript/NativeScript/commit/fc8f769))
* **android/TextField** dont default to Font.default ([#8525](https://github.com/NativeScript/NativeScript/pull/8525)) ([50e58fa](https://github.com/NativeScript/NativeScript/commit/50e58fa))


## [6.5.1](https://github.com/NativeScript/NativeScript/compare/6.5.0...6.5.1) (2020-03-30)


### Bug Fixes

* **tabs:** dynamic styling colors fixed ([#8460](https://github.com/NativeScript/NativeScript/issues/8460)) ([0a7bee6](https://github.com/NativeScript/NativeScript/commit/0a7bee6))



# [6.5.0](https://github.com/NativeScript/NativeScript/compare/6.4.2...6.5.0) (2020-03-18)


### Bug Fixes

* Fix issue for view not being removed from its parent ([#8432](https://github.com/NativeScript/NativeScript/issues/8432)) ([e081340](https://github.com/NativeScript/NativeScript/commit/e081340665605c54530587cc0cce9bc339585557))
* **d.ts:** Update iOS typings iOS 13.2 ([#8430](https://github.com/NativeScript/NativeScript/issues/8430)) ([18a9b1a](https://github.com/NativeScript/NativeScript/commit/18a9b1aea89ee9defee990ace7d2409327a47a28))
* **bottom-nav:** Android TabStripItems not aligned correctly when one of the image is smaller ([#8414](https://github.com/NativeScript/NativeScript/issues/8414))([9830be7](https://github.com/NativeScript/NativeScript/commit/9830be7230355638ace604145a3e3fad393c2a93))
* **tabs:** delay loadView when animation runs ([#8353](https://github.com/NativeScript/NativeScript/issues/8353)) ([e649a6c](https://github.com/NativeScript/NativeScript/commit/e649a6cfd618c86a1dc7fa84e3197dfb78c3bc74))


### Features

* **tabs:** Tabs styling improvements ([#8366](https://github.com/NativeScript/NativeScript/pull/8366))([4589431](https://github.com/NativeScript/NativeScript/commit/458943111e909fcdad47d12e7ee4bcd9732f4e90))
* **tabs:** Added selectedItemColor and unSelectedItemColor to the TabStrip ([#8435](https://github.com/NativeScript/NativeScript/issues/8435))([243dc98](https://github.com/NativeScript/NativeScript/commit/243dc98005d43617872da5cfc010e76178aa7f97))
* **gestures:** add locationX and locationY to double tap event data ([#8338](https://github.com/NativeScript/NativeScript/pull/8338))([5ff78e2](https://github.com/NativeScript/NativeScript/commit/5ff78e2ad2612259bff36d3aaf5a0292309f5a78))
* **tabs:** Added iconClass property to TabStripItem ([#8439](https://github.com/NativeScript/NativeScript/issues/8439))([270988d](https://github.com/NativeScript/NativeScript/commit/270988d26e1eeab97b4e5781451388e3a0a347e3))


## [6.4.2](https://github.com/NativeScript/NativeScript/compare/6.4.1...6.4.2) (2020-02-27)


### Bug Fixes

* **ios:** Ensure ObserverClass is initialized ([#8365](https://github.com/NativeScript/NativeScript/issues/8365)) ([06b9ecf](https://github.com/NativeScript/NativeScript/commit/06b9ecf))
* **tabs:** Tabs animation and selected index fixes ([#8377](https://github.com/NativeScript/NativeScript/issues/8377)) ([acaabb](https://github.com/NativeScript/NativeScript/commit/acaabb))
* XHR readystatechange event ([cff125d](https://github.com/NativeScript/NativeScript/commit/cff125d))
* guard cachedDrawable ([#8320](https://github.com/NativeScript/NativeScript/issues/8320)) ([dd11158](https://github.com/NativeScript/NativeScript/commit/dd11158))


### Features

* Add .kt extension to  known extensions map ([#8363](https://github.com/NativeScript/NativeScript/issues/8363)) ([398457c](https://github.com/NativeScript/NativeScript/commit/398457c))



## 6.4.1 (2020-02-17)


### Bug Fixes

* flipLeft and flipRight on Android ([#8307](https://github.com/NativeScript/NativeScript/issues/8307)) ([c13b104](https://github.com/NativeScript/NativeScript/commit/c13b104))
* **andoid:** crash when setting font on tab-item with no image ([2dd3bb2](https://github.com/NativeScript/NativeScript/commit/2dd3bb2))
* **android:** tap-trip-item title disappearing ([cb8cea8](https://github.com/NativeScript/NativeScript/commit/cb8cea8))
* **build:** Add platforms/android to NPM package ([#8312](https://github.com/NativeScript/NativeScript/issues/8312)) ([a644e40](https://github.com/NativeScript/NativeScript/commit/a644e40))

# 6.4.0 (2020-01-31)


### Bug Fixes

* button textAlignment on IOS (UIButton) ([#8181](https://github.com/NativeScript/NativeScript/issues/8181)) ([05ef9b0](https://github.com/NativeScript/NativeScript/commit/05ef9b0))
* **android:** crash on setting elevation on API21 ([#8269](https://github.com/NativeScript/NativeScript/issues/8269)) ([02763ec](https://github.com/NativeScript/NativeScript/commit/02763ec))
* **android:** Request Timeout [#6523](https://github.com/NativeScript/NativeScript/issues/6523) ([#8194](https://github.com/NativeScript/NativeScript/issues/8194)) ([d65a2db](https://github.com/NativeScript/NativeScript/commit/d65a2db))
* invoke done callback in image cache unit test for API Level < 20 ([#8267](https://github.com/NativeScript/NativeScript/issues/8267)) ([f293398](https://github.com/NativeScript/NativeScript/commit/f293398))
* make integer type visible ([ea8a436](https://github.com/NativeScript/NativeScript/commit/ea8a436))
* remove the password for TextField as well ([#8290](https://github.com/NativeScript/NativeScript/issues/8290)) ([0b50f3e](https://github.com/NativeScript/NativeScript/commit/0b50f3e))
* return default tab background color when the background color is not explicitely set through css ([#8240](https://github.com/NativeScript/NativeScript/issues/8240)) ([8569b51](https://github.com/NativeScript/NativeScript/commit/8569b51))
* **ios:** ActionBar style wrong after cancelled swipe back navigation ([#8252](https://github.com/NativeScript/NativeScript/issues/8252)) ([6133d6b](https://github.com/NativeScript/NativeScript/commit/6133d6b))
* **ios/bottom-navigation:** move TabStrip items event emitting to selectedIndex changed handler ([#8160](https://github.com/NativeScript/NativeScript/issues/8160)) ([8550c32](https://github.com/NativeScript/NativeScript/commit/8550c32))


### Features

* **html-view:** Additional properties for HtmlView component ([#8207](https://github.com/NativeScript/NativeScript/issues/8207)) ([9217094](https://github.com/NativeScript/NativeScript/commit/9217094))
* **http:** better binary support & XHR support ([#7707](https://github.com/NativeScript/NativeScript/issues/7707)) ([e293367](https://github.com/NativeScript/NativeScript/commit/e293367))
* **ios:** set preferredStatusBarStyle in Page VCs ([#8241](https://github.com/NativeScript/NativeScript/issues/8241)) ([4e48e68](https://github.com/NativeScript/NativeScript/commit/4e48e68))
* add longPress state with UIGestureRecognizer (iOS) ([416f1c8](https://github.com/NativeScript/NativeScript/commit/416f1c8))
* **textview:** added maxLines property ([#7943](https://github.com/NativeScript/NativeScript/issues/7943)) ([3c79ded](https://github.com/NativeScript/NativeScript/commit/3c79ded))
* Add 3D rotation to view - takeover of PR# 5950 ([#8136](https://github.com/NativeScript/NativeScript/issues/8136)) ([e8f5ac8](https://github.com/NativeScript/NativeScript/commit/e8f5ac8)), closes [#8076](https://github.com/NativeScript/NativeScript/issues/8076) [#8041](https://github.com/NativeScript/NativeScript/issues/8041)
* Add Android APIs usage list ([#8286](https://github.com/NativeScript/NativeScript/issues/8286)) ([f031f6f](https://github.com/NativeScript/NativeScript/commit/f031f6f))
* add integer only keyboard type for text-field and for all editable text components ([954e1c6](https://github.com/NativeScript/NativeScript/commit/954e1c6))
* Add iOS APIs usage list ([#8291](https://github.com/NativeScript/NativeScript/issues/8291)) ([3bb8a40](https://github.com/NativeScript/NativeScript/commit/3bb8a40))
* Make css-tree the default parser ([ab4c389](https://github.com/NativeScript/NativeScript/commit/ab4c389))

## [6.3.2](https://github.com/NativeScript/NativeScript/compare/6.3.1...6.3.2) (2019-12-20)


### Bug Fixes

* check is disposed fragment is in the FragmentManager ([#8201](https://github.com/NativeScript/NativeScript/issues/8201)) ([4b00376](https://github.com/NativeScript/NativeScript/commit/4b00376))
* handle fake attach after FragMgr is destroyed ([#8200](https://github.com/NativeScript/NativeScript/issues/8200)) ([d1858f8](https://github.com/NativeScript/NativeScript/commit/d1858f8))



## [6.3.1](https://github.com/NativeScript/NativeScript/compare/6.3.0...6.3.1) (2019-12-16)


### Bug Fixes

* null reference exception in view.android.onUnloaded ([#8153](https://github.com/NativeScript/NativeScript/issues/8153)) ([da639f2](https://github.com/NativeScript/NativeScript/commit/da639f2))



# [6.3.0](https://github.com/NativeScript/NativeScript/compare/6.2.2...6.3.0) (2019-12-06)


### Bug Fixes

* **android:** Fatal Exception: java.lang.OutOfMemoryError ([#8061](https://github.com/NativeScript/NativeScript/issues/8061)) ([8d382a6](https://github.com/NativeScript/NativeScript/commit/8d382a6b2e722e9298becdcfb3b43a41352a9136))
* **grid-layout:** value parser will now accept strings or numbers ([#8042](https://github.com/NativeScript/NativeScript/issues/8042)) ([3199a39](https://github.com/NativeScript/NativeScript/commit/3199a392b45635606e06119845099965246395c3))
* **iOS:** Opening alert/confirm on top most of modal dialogs ([#7982](https://github.com/NativeScript/NativeScript/issues/7982)) ([60ac4e7](https://github.com/NativeScript/NativeScript/commit/60ac4e7a05c9e627eb9fc7a1bdf004c7fca99817)), closes [#6939](https://github.com/NativeScript/NativeScript/issues/6939)
* nested css-calc and css-variables with fallback ([#7987](https://github.com/NativeScript/NativeScript/issues/7987)) ([fc2a233](https://github.com/NativeScript/NativeScript/commit/fc2a233e9598def50969247c1516c32260b7e283))


### Features

* **css:** Added optional css-tree parser ([#8076](https://github.com/NativeScript/NativeScript/issues/8076)) ([49a7607](https://github.com/NativeScript/NativeScript/commit/49a7607f4e0f3d359820b5ae731f806966de2921))
* **dialogs:** Setting the size of popup dialog thru dialog options ([#8041](https://github.com/NativeScript/NativeScript/issues/8041)) ([cd5703a](https://github.com/NativeScript/NativeScript/commit/cd5703a6b79598031ef334a9cf3132e688422aba))
* support requestAnimationFrame ([#8112](https://github.com/NativeScript/NativeScript/issues/8112)) ([2aa6e9b](https://github.com/NativeScript/NativeScript/commit/2aa6e9bf922286f9ffd747f901dbc922cd9446b9))
* System css classes for modals ([#8155](https://github.com/NativeScript/NativeScript/issues/8155)) ([7b78f3b](https://github.com/NativeScript/NativeScript/commit/7b78f3b0c640d9d43026744b919a03996191f788))
* **modal-view-ios:** handle iOS 13 dismiss modal gesture ([#8024](https://github.com/NativeScript/NativeScript/issues/8024)) ([c5df258](https://github.com/NativeScript/NativeScript/commit/c5df2580439c24c57fb364cba91050a00e391c35))



## [6.2.2](https://github.com/NativeScript/NativeScript/compare/6.2.1...6.2.2) (2019-11-25)


### Bug Fixes

* **android:** Fatal Exception: java.lang.OutOfMemoryError ([#8061](https://github.com/NativeScript/NativeScript/issues/8061)) ([#8098](https://github.com/NativeScript/NativeScript/issues/8098)) ([bca1271](https://github.com/NativeScript/NativeScript/commit/bca1271))
* **frame:** nested frame wrong background after parent navigation ([#8095](https://github.com/NativeScript/NativeScript/issues/8095)) ([d983f79](https://github.com/NativeScript/NativeScript/commit/d983f79))
* tab navigations don't work with lowercase xml ([#8016](https://github.com/NativeScript/NativeScript/issues/8016)) ([800f5bc](https://github.com/NativeScript/NativeScript/commit/800f5bc))
* **frame:** push recreated frame back in frameStack when Don't Keep Activities enabled ([#8096](https://github.com/NativeScript/NativeScript/issues/8096)) ([47f4c25](https://github.com/NativeScript/NativeScript/commit/47f4c25))
* **iOS:** check for iOS 13 APIs ([#8093](https://github.com/NativeScript/NativeScript/issues/8093)) ([b069ff3](https://github.com/NativeScript/NativeScript/commit/b069ff3))



<a name="6.2.1"></a>
## [6.2.1](https://github.com/NativeScript/NativeScript/compare/6.2.0...6.2.1) (2019-11-12)


### Bug Fixes

* **dark-mode:** formatted string and html view text color ([#8031](https://github.com/NativeScript/NativeScript/issues/8031)) ([0c7f838](https://github.com/NativeScript/NativeScript/commit/0c7f838))
* ensure @CallSuper native methods call superFunc ([#8025](https://github.com/NativeScript/NativeScript/issues/8025)) ([7fa9978](https://github.com/NativeScript/NativeScript/commit/7fa9978))
* **dev-tools:** use app root in getDocument() ([#8071](https://github.com/NativeScript/NativeScript/issues/8071)) ([f686472](https://github.com/NativeScript/NativeScript/commit/f686472))
* **gradient:** import LinearGradient with alias ([#8063](https://github.com/NativeScript/NativeScript/issues/8063)) ([eb33ede](https://github.com/NativeScript/NativeScript/commit/eb33ede))


### Features

* **application:** add system appearance changed event to typings ([#8034](https://github.com/NativeScript/NativeScript/issues/8034)) ([2a34368](https://github.com/NativeScript/NativeScript/commit/2a34368))



<a name="6.2.0"></a>
# [6.2.0](https://github.com/NativeScript/NativeScript/compare/6.1.2...6.2.0) (2019-10-24)


### Bug Fixes

* **action-bar:** font icon support to NavigationButton ([#7842](https://github.com/NativeScript/NativeScript/issues/7842)) ([4991e6d](https://github.com/NativeScript/NativeScript/commit/4991e6d)) ([#7918](https://github.com/NativeScript/NativeScript/issues/7918)) ([bdb411f](https://github.com/NativeScript/NativeScript/commit/bdb411f))
* **action-bar-ios13:** action bar items population ([#7965](https://github.com/NativeScript/NativeScript/issues/7965)) ([ce96dad](https://github.com/NativeScript/NativeScript/commit/ce96dad))
* **application-settings-android:** possible uninitialized sharedPreferences variable usage ([#7813](https://github.com/NativeScript/NativeScript/issues/7813)) ([4f421ff](https://github.com/NativeScript/NativeScript/commit/4f421ff))
* **css:** parse css selectors with escape sequences ([#7689](https://github.com/NativeScript/NativeScript/issues/7689)) ([5520213](https://github.com/NativeScript/NativeScript/commit/5520213))
* xml parsing when input value is reported as object instead of string ([#7916](https://github.com/NativeScript/NativeScript/issues/7916)) ([a06a5f9](https://github.com/NativeScript/NativeScript/commit/a06a5f9))
* **css-android:** restore elements' native features if offending css is removed while the app is running ([#7789](https://github.com/NativeScript/NativeScript/issues/7789)) ([2beae5b](https://github.com/NativeScript/NativeScript/commit/2beae5b))
* **css-calc:** reduce_css_calc_1.default is not a function ([#7787](https://github.com/NativeScript/NativeScript/issues/7787)) ([03d1ff0](https://github.com/NativeScript/NativeScript/commit/03d1ff0))
* **bottom-navigation-ios:** incorrect layout on orientation change ([#7927](https://github.com/NativeScript/NativeScript/issues/7927)) ([c9bfec1](https://github.com/NativeScript/NativeScript/commit/c9bfec1))


### Features

* **action-bar-android:** add properties to control the titleView content insets ([#7805](https://github.com/NativeScript/NativeScript/issues/7805)) ([57a8605](https://github.com/NativeScript/NativeScript/commit/57a8605))
* **css:** add attribute scoped css without global refresh ([#7907](https://github.com/NativeScript/NativeScript/issues/7907)) ([f791a40](https://github.com/NativeScript/NativeScript/commit/f791a40))
* **css:** Add HSL/HSLA support ([#7730](https://github.com/NativeScript/NativeScript/issues/7730)) ([3cabdde](https://github.com/NativeScript/NativeScript/commit/3cabdde))
* **dark-mode:** add system appearance property, event and CSS classes ([#7887](https://github.com/NativeScript/NativeScript/issues/7887)) ([5c9a217](https://github.com/NativeScript/NativeScript/commit/5c9a217))
* **file-system:** async read/write ([#7671](https://github.com/NativeScript/NativeScript/issues/7671)) ([2146ac9](https://github.com/NativeScript/NativeScript/commit/2146ac9))
* **dark-mode-ios:** adapt dynamic system colors ([#7826](https://github.com/NativeScript/NativeScript/issues/7826)) ([f82cf08](https://github.com/NativeScript/NativeScript/commit/f82cf08))
* **platform-declarations:** add android29 typings ([#7923](https://github.com/NativeScript/NativeScript/issues/7923)) ([dc65402](https://github.com/NativeScript/NativeScript/commit/dc65402))
* **platform-declarations:** generate typings from iOS 13.0 SDK ([#7817](https://github.com/NativeScript/NativeScript/issues/7817)) ([3e8d635](https://github.com/NativeScript/NativeScript/commit/3e8d635))
* **segmented-bar-ios:** add support for the new selectedSegmentTintColor property ([#7880](https://github.com/NativeScript/NativeScript/issues/7880)) ([ca7c46d](https://github.com/NativeScript/NativeScript/commit/ca7c46d))
* overhaul and streamline Android page navigation transitions ([#7925](https://github.com/NativeScript/NativeScript/issues/7925)) ([08e23bc](https://github.com/NativeScript/NativeScript/commit/08e23bc))
* Scoped Packages ([#7911](https://github.com/NativeScript/NativeScript/issues/7911)) ([cc97a16](https://github.com/NativeScript/NativeScript/commit/cc97a16))
* update material components dependency to 92.3 ([#7936](https://github.com/NativeScript/NativeScript/issues/7936)) ([866c2b0](https://github.com/NativeScript/NativeScript/commit/866c2b0))



<a name="6.1.2"></a>
## [6.1.2](https://github.com/NativeScript/NativeScript/compare/6.1.1...6.1.2) (2019-10-15)


### Bug Fixes

* expose orientation to application module ([#7832](https://github.com/NativeScript/NativeScript/issues/7832)) ([4166e2d](https://github.com/NativeScript/NativeScript/commit/4166e2d))
* **frame-android:** IllegalStateException: The specified child already has a parent ([#7948](https://github.com/NativeScript/NativeScript/issues/7948)) ([ff30c48](https://github.com/NativeScript/NativeScript/commit/ff30c48))
* **tabs-ios9:** no view controller managing visible view error ([#7837](https://github.com/NativeScript/NativeScript/issues/7837)) ([7fe8d1c](https://github.com/NativeScript/NativeScript/commit/7fe8d1c))


### Features

* **css:** add attribute scoped css without global refresh ([#7907](https://github.com/NativeScript/NativeScript/issues/7907)) ([#7947](https://github.com/NativeScript/NativeScript/issues/7947)) ([b377eb6](https://github.com/NativeScript/NativeScript/commit/b377eb6))



## [6.1.1](https://github.com/NativeScript/NativeScript/compare/6.1.0...6.1.1) (2019-09-11)


### Bug Fixes

* **android-list-picker:** NoSuchFieldException on api29 ([#7790](https://github.com/NativeScript/NativeScript/issues/7790)) ([997d6de](https://github.com/NativeScript/NativeScript/commit/997d6de))
* **css-calc:** reduce_css_calc_1.default is not a function ([#7787](https://github.com/NativeScript/NativeScript/issues/7787)) ([#7801](https://github.com/NativeScript/NativeScript/issues/7801)) ([20c0773](https://github.com/NativeScript/NativeScript/commit/20c0773))



<a name="6.1.0"></a>
# [6.1.0](https://github.com/NativeScript/NativeScript/compare/6.0.7...6.1.0) (2019-09-02)


### Bug Fixes

* dots can now be used in module names ([#7655](https://github.com/NativeScript/NativeScript/issues/7655)) ([b6ff4d3](https://github.com/NativeScript/NativeScript/commit/b6ff4d3))
* **css:** parse css selectors with escape sequences ([#7689](https://github.com/NativeScript/NativeScript/issues/7689)) ([#7732](https://github.com/NativeScript/NativeScript/issues/7732)) ([e3ed028](https://github.com/NativeScript/NativeScript/commit/e3ed028))
* **ios-tabs:** handle tabs extended layout for ios 10 ([f7f0612](https://github.com/NativeScript/NativeScript/commit/f7f0612))
* **ios-tabs:** crash when add tabstrip in loaded event ([#7743](https://github.com/NativeScript/NativeScript/issues/7743)) ([a66f2f2](https://github.com/NativeScript/NativeScript/commit/a66f2f2))
* **ios-tabs:** handle nesting proxy view container ([#7755](https://github.com/NativeScript/NativeScript/issues/7755)) ([92c3338](https://github.com/NativeScript/NativeScript/commit/92c3338))
* handle empty folders in non-bundle-compat ([#7649](https://github.com/NativeScript/NativeScript/issues/7649)) ([5fd7913](https://github.com/NativeScript/NativeScript/commit/5fd7913))


### Features

* implement css-variables and css-calc ([#7553](https://github.com/NativeScript/NativeScript/issues/7553)) ([673c808](https://github.com/NativeScript/NativeScript/commit/673c808))
* add CSS classes to app/modal root views to target platform/device/orientation/type ([#7606](https://github.com/NativeScript/NativeScript/issues/7606)) ([3adba68](https://github.com/NativeScript/NativeScript/commit/3adba68))
* **GridLayout:** Add synonym property column[Span] for col[Span] in GridLayout ([#7641](https://github.com/NativeScript/NativeScript/issues/7641)) ([d3c39c1](https://github.com/NativeScript/NativeScript/commit/d3c39c1))
* apply styles when adding them to the application scope ([#7652](https://github.com/NativeScript/NativeScript/issues/7652)) ([1d12136](https://github.com/NativeScript/NativeScript/commit/1d12136))
* expose application orientation ([#7602](https://github.com/NativeScript/NativeScript/issues/7602)) ([e2c3c8c](https://github.com/NativeScript/NativeScript/commit/e2c3c8c))
* **ios-bottom-navigation:** add icon rendering mode ([#7738](https://github.com/NativeScript/NativeScript/issues/7738)) ([ff6d89f](https://github.com/NativeScript/NativeScript/commit/ff6d89f))
* **android-tabs/bottom-navigation:** fix tab resource icon size based on specification ([#7737](https://github.com/NativeScript/NativeScript/issues/7737)) ([f436b6f](https://github.com/NativeScript/NativeScript/commit/f436b6f))
* **tabs/bottom-navigation:** introduce TabStrip.isIconSizeFixed property ([#7691](https://github.com/NativeScript/NativeScript/issues/7691)) ([8039c2c](https://github.com/NativeScript/NativeScript/commit/8039c2c))
* **tabs/bottom-navigation:** add support for custom tabstrip ([#7580](https://github.com/NativeScript/NativeScript/issues/7580)) ([acc3436](https://github.com/NativeScript/NativeScript/commit/acc3436))
* **tabs/bottom-navigation:** inherit TabContentItem from ContentView ([#7629](https://github.com/NativeScript/NativeScript/issues/7629)) ([72ca461](https://github.com/NativeScript/NativeScript/commit/72ca461))
* **tabs/bottom-navigation:** flexible font icon usage ([#7672](https://github.com/NativeScript/NativeScript/issues/7672)) ([c0b8db4](https://github.com/NativeScript/NativeScript/commit/c0b8db4))
* **tabs:** emit tabStripItem tap event ([#7693](https://github.com/NativeScript/NativeScript/issues/7693)) ([b0d1c91](https://github.com/NativeScript/NativeScript/commit/b0d1c91))
* **tabs/bottom-navigation:** add TabStrip.itemTap event ([#7711](https://github.com/NativeScript/NativeScript/issues/7711)) ([55c9cc9](https://github.com/NativeScript/NativeScript/commit/55c9cc9))


<a name="6.0.7"></a>
## [6.0.7](https://github.com/NativeScript/NativeScript/compare/6.0.4...6.0.7) (2019-08-22)


### Bug Fixes

* **bottom-navigation:** codebehind creation ([#7624](https://github.com/NativeScript/NativeScript/issues/7624)) ([056d0bf](https://github.com/NativeScript/NativeScript/commit/056d0bf))
* prevent plugin podfile platform version clash ([#7626](https://github.com/NativeScript/NativeScript/issues/7626)) ([49b3571](https://github.com/NativeScript/NativeScript/commit/49b3571))
* **hmr:** close modal views during livesync [#7668](https://github.com/NativeScript/NativeScript/issues/7668) ([#7679](https://github.com/NativeScript/NativeScript/issues/7679)) ([9877b20](https://github.com/NativeScript/NativeScript/commit/9877b20))
* **tabs-android:** tabStripItem color not applied ([#7617](https://github.com/NativeScript/NativeScript/issues/7617)) ([2518655](https://github.com/NativeScript/NativeScript/commit/2518655))



<a name="6.0.6"></a>
## [6.0.6](https://github.com/NativeScript/NativeScript/compare/6.0.5...6.0.6) (2019-08-08)


### Bug Fixes

* **tns-core-modules-widgets:** use correct version (6.0.6).



## [6.0.5](https://github.com/NativeScript/NativeScript/compare/6.0.4...6.0.5) (2019-08-02)


### Bug Fixes

* **bottom-navigation:** codebehind creation ([#7624](https://github.com/NativeScript/NativeScript/issues/7624)) ([056d0bf](https://github.com/NativeScript/NativeScript/commit/056d0bf))
* **tabs-android:** tabStripItem color not applied ([#7617](https://github.com/NativeScript/NativeScript/issues/7617)) ([2518655](https://github.com/NativeScript/NativeScript/commit/2518655))
* prevent plugin podfile platform version clash ([#7626](https://github.com/NativeScript/NativeScript/issues/7626)) ([49b3571](https://github.com/NativeScript/NativeScript/commit/49b3571))



<a name="6.0.5"></a>
## [6.0.5](https://github.com/NativeScript/NativeScript/compare/6.0.4...6.0.5) (2019-08-02)


### Bug Fixes

* **observable-array:** splice to notify correct amount of added items ([#7426](https://github.com/NativeScript/NativeScript/issues/7426)) ([5e14de6](https://github.com/NativeScript/NativeScript/commit/5e14de6))
* added missing openFile method in ios utils ([#7431](https://github.com/NativeScript/NativeScript/issues/7431)) ([cb58cab](https://github.com/NativeScript/NativeScript/commit/cb58cab))
* full Unicode support in xml ([#7428](https://github.com/NativeScript/NativeScript/issues/7428)) ([b8659e6](https://github.com/NativeScript/NativeScript/commit/b8659e6))
* **timer:** setTimeout/setInterval support for boolean period ([#7569](https://github.com/NativeScript/NativeScript/issues/7569)) ([a569bb2](https://github.com/NativeScript/NativeScript/commit/a569bb2))


### Features

* **bottom-navigation-ios:** limit to 5 items ([5815246](https://github.com/NativeScript/NativeScript/commit/5815246))
* split globals to support smaller worker chunks ([0ee0b67](https://github.com/NativeScript/NativeScript/commit/0ee0b67))



<a name="6.0.4"></a>
## [6.0.4](https://github.com/NativeScript/NativeScript/compare/6.0.3...6.0.4) (2019-07-30)


### Bug Fixes

* **ios:** 'ui/tabs' not found for element 'Tabs'


<a name="6.0.3"></a>
## [6.0.3](https://github.com/NativeScript/NativeScript/compare/6.0.2...6.0.3) (2019-07-29)


### Bug Fixes

* **ios:** move material design dependency to podfile ([#7592](https://github.com/NativeScript/NativeScript/issues/7592)) ([291e3b4](https://github.com/NativeScript/NativeScript/commit/291e3b4))



<a name="6.0.2"></a>
## [6.0.2](https://github.com/NativeScript/NativeScript/compare/6.0.0...6.0.2) (2019-07-26)


### Bug Fixes

* **android:** remove wait for doubletap if no gesture recognizer ([#7584](https://github.com/NativeScript/NativeScript/issues/7584)) ([9fd5ddc](https://github.com/NativeScript/NativeScript/commit/9fd5ddc))
* **bottom-navigation:** crash when tab selected with no item ([#7527](https://github.com/NativeScript/NativeScript/issues/7527)) ([46c17ca](https://github.com/NativeScript/NativeScript/commit/46c17ca))
* **tabs:** tab bar not visible when nested in layout ([#7544](https://github.com/NativeScript/NativeScript/issues/7544)) ([f00b370](https://github.com/NativeScript/NativeScript/commit/f00b370))
* **tabs-android:** wrong tabStripItem selected ([#7522](https://github.com/NativeScript/NativeScript/issues/7522)) ([ca22ba9](https://github.com/NativeScript/NativeScript/commit/ca22ba9))
* **tabs-ios:** crash when setting tabStripItems through items property ([#7548](https://github.com/NativeScript/NativeScript/issues/7548)) ([4511c76](https://github.com/NativeScript/NativeScript/commit/4511c76))
* **tabs-ios:** unable to return to tab after tab with nested frame visited ([#7574](https://github.com/NativeScript/NativeScript/issues/7574)) ([490cab0](https://github.com/NativeScript/NativeScript/commit/490cab0))



<a name="6.0.0"></a>
# [6.0.0](https://github.com/NativeScript/NativeScript/compare/5.4.2...6.0.0) (2019-06-28)


### Bug Fixes

* **bundle:** support for file qualifiers with webpack ([#7386](https://github.com/NativeScript/NativeScript/issues/7386)) ([9fcc1dd](https://github.com/NativeScript/NativeScript/commit/9fcc1dd))
* **bundle:** code-only typescript custom components with webpack ([#7321](https://github.com/NativeScript/NativeScript/issues/7321)) ([9fcc1dd](https://github.com/NativeScript/NativeScript/commit/9fcc1dd))
* **bundle:** component builder support for codeFile / cssFile / import with webpack ([#7324](https://github.com/NativeScript/NativeScript/issues/7324)) ([9fcc1dd](https://github.com/NativeScript/NativeScript/commit/9fcc1dd))
* **bundle:** different event order ([NativeScript/nativescript-cli#4633](https://github.com/NativeScript/nativescript-cli/issues/4633)) ([8851835](https://github.com/NativeScript/NativeScript/commit/8851835))
* restore TextField.textChange and Switch.checkedChange event syntax in xml ([#7403](https://github.com/NativeScript/NativeScript/issues/7403)) ([76b5089](https://github.com/NativeScript/NativeScript/commit/76b5089))
* **android:** ignore gzip content-encoding for status code 204 ([#7417](https://github.com/NativeScript/NativeScript/issues/7417)) ([4437cd6](https://github.com/NativeScript/NativeScript/commit/4437cd6))
* **android-transition:** exit transition not executed after app suspend resume ([#7402](https://github.com/NativeScript/NativeScript/issues/7402)) ([f08b491](https://github.com/NativeScript/NativeScript/commit/f08b491))
* **css-state:** _appliedSelectorsVersion assignment ([#7405](https://github.com/NativeScript/NativeScript/issues/7405)) ([9ecf07f](https://github.com/NativeScript/NativeScript/commit/9ecf07f))
* **observable-array**: splice to notify correct amount of added items ([#7426](https://github.com/NativeScript/NativeScript/pull/7426)) ([5e14de6](https://github.com/NativeScript/NativeScript/commit/5e14de6))
* cancel contradictory gesture events ([#7296](https://github.com/NativeScript/NativeScript/issues/7296)) ([b8a82f2](https://github.com/NativeScript/NativeScript/commit/b8a82f2))
* allow span descendants in FormattedString ([#7369](https://github.com/NativeScript/NativeScript/issues/7369)) ([01c4b8c](https://github.com/NativeScript/NativeScript/commit/01c4b8c))


### Features

* **bundle:** bundle workflow support ([#7320](https://github.com/NativeScript/NativeScript/issues/7320)) ([ecd9fc3](https://github.com/NativeScript/NativeScript/commit/ecd9fc3))
* **android:** androidX support ([#7039](https://github.com/NativeScript/NativeScript/issues/7039)) ([c5db112](https://github.com/NativeScript/NativeScript/commit/c5db112))
* **BETA/EXPERIMENTAL:** bottom navigation and tabs components ([#6967](https://github.com/NativeScript/NativeScript/issues/6967)) ([0c2c1cc](https://github.com/NativeScript/NativeScript/commit/0c2c1cc))
* add support for :focus pseudo class in TextField / TextView ([#7396](https://github.com/NativeScript/NativeScript/pull/7396)) ([0bfddab](https://github.com/NativeScript/NativeScript/commit/0bfddab))
* **animation:** support animating width/height properties ([#5147](https://github.com/NativeScript/NativeScript/pull/5147)) ([e7c575](https://github.com/NativeScript/NativeScript/commit/e7c575))

### BREAKING CHANGES

* `AndroidApplication.currentContext` in `tns-core-modules/application` module is now removed.

Use `AndroidApplication.startActivity`, `AndroidApplication.foregroundActivity`, or `AndroidApplication.context` properties instead.


* `start(...)` method in `tns-core-modules/application` module is now removed.

Use `application.run(...)` method instead. Check the "Flexible Frame Composition" section in [this document](https://docs.google.com/document/d/1Iia0yEr5seq4H9qk4oMuJs4-M8dgmne98fymCO5IczA/edit) that explains the full migration path from `application.start(...)` to `application.run(...)` and the implications from this change


* `loadPage(...)` method in `tns-core-modules/ui/builder` module is now removed.

Use `createViewFromEntry(entry: NavigationEntry)` method in `tns-core-modules/ui/builder` module instead.


* `tns-core-modules/ui/core/dependency-observable` module is now removed.

Use `tns-core-modules/ui/core/properties` module instead.


* `ViewBase.showModal()`, `ViewBase.showModal(moduleName: string, context: any, closeCallback: Function, fullscreen?: boolean, animated?: boolean, stretched?: boolean): ViewBase`, and `ViewBase.showModal(view: ViewBase, context: any, closeCallback: Function, fullscreen?: boolean, animated?: boolean, stretched?: boolean): ViewBase` method overloads are now removed.

Use `ViewBase.showModal(moduleName: string, modalOptions: ShowModalOptions): ViewBase` or `ViewBase.showModal(view: ViewBase, modalOptions: ShowModalOptions): ViewBase` instead.


* `Frame.androidOptionSelectedEvent` and `AndroidOptionEventData` interfrace in `tns-core-modules/ui/frame` module are now removed.

Event not raised by NativeScript core framework anymore.


* `AndroidFrame.cachePagesOnNavigate` in `tns-core-modules/ui/frame` module is now removed.

Not used internally in NativeScript core framework anymore.


* `stack()` method in `tns-core-modules/ui/frame` module is now removed.

Use `getFrameById(...)` method if you want to retrieve a frame different than the topmost one instead.


* `AndroidActivityCallbacks.onCreate(activity: any, savedInstanceState: any, superFunc: Function)` method overload in `tns-core-modules/ui/frame` module is now removed.

Use `AndroidActivityCallbacks.onCreate(activity: any, savedInstanceState: any, intent: any, superFunc: Function)` instead.


* `WebView.url` property in `tns-core-modules/ui/web-view` module is now removed.

Use `WebView.src` property instead.


* `ios.getter(...)` function in `tns-core-modules/utils` module is now removed.

Use the respective native property directly instead.


* `View.observe(...)` method in `tns-core-modules/ui/core/view` module is now removed.

Use `View.on(...)` method instead.

* The addedCount variable from ObservableArray.splice(...) change event is always the amount of added items.

Migration steps:
The old addedCount can be obtained by `const addedCount = event.addedCount - event.removed.length`

* Fix to cancel contradictory gesture events (e.g. tap and double tap) introduces the following behavior breaking change

Before:
* **iOS / Android**:
    * double tap: child tap -> parent tap -> child double tap -> parent double tap
    * tap: child tap -> parent tap

After:
* **iOS**:
    * double tap: child double tap
    * tap: child tap
* **Android**:
    * double tap: child double tap -> parent double tap
    * tap: child tap -> parent tap

Migration steps:
Move event handlers accordingly.



## [5.4.3](https://github.com/NativeScript/NativeScript/compare/5.4.2...5.4.3) (2019-06-21)


### Bug Fixes

* clear the `resolvedPage` when entry is being cleared, change the passed `View` to be a weak reference ([#7327](https://github.com/NativeScript/NativeScript/issues/7327)) ([dfe7621](https://github.com/NativeScript/NativeScript/commit/dfe7621))



<a name="5.4.2"></a>
## [5.4.2](https://github.com/NativeScript/NativeScript/compare/5.4.1...5.4.2) (2019-06-06)


### Bug Fixes

* **hmr:** support for multi module replacement ([7c22ffe](https://github.com/NativeScript/NativeScript/commit/7c22ffe))
* register layout child for nested custom components ([#7230](https://github.com/NativeScript/NativeScript/issues/7230)) ([3604df8](https://github.com/NativeScript/NativeScript/commit/3604df8))
* **ios:** potential memory leak with propertybag implementation ([#7298](https://github.com/NativeScript/NativeScript/issues/7298)) ([1c22a73](https://github.com/NativeScript/NativeScript/commit/1c22a73))
* **platform-declarations-ios:** Change 2^64-1 enum values to -1 ([6720139](https://github.com/NativeScript/NativeScript/commit/6720139))



## [5.4.1](https://github.com/NativeScript/NativeScript/compare/5.4.0...5.4.1) (2019-05-23)


### Bug Fixes

* **android:** CommonLayoutParams measure/layout child guard ([#7271](https://github.com/NativeScript/NativeScript/issues/7271)) ([333ab36](https://github.com/NativeScript/NativeScript/commit/333ab36))
* **android:** elevation should not require explicit dynamic elevation offset ([#7250](https://github.com/NativeScript/NativeScript/issues/7250)) ([be6e408](https://github.com/NativeScript/NativeScript/commit/be6e408))
* **hmr:** quick fade upon replace navigation ([#7251](https://github.com/NativeScript/NativeScript/issues/7251)) ([0aca087](https://github.com/NativeScript/NativeScript/commit/0aca087))



<a name="5.4.0"></a>
# [5.4.0](https://github.com/NativeScript/NativeScript/compare/5.3.2...5.4.0) (2019-05-14)


### Bug Fixes

* throw if failed to load component ([#7186](https://github.com/NativeScript/NativeScript/issues/7186)) ([b7abb3d](https://github.com/NativeScript/NativeScript/commit/b7abb3d))
* **android/button:** possible incorrect button visual state ([#7190](https://github.com/NativeScript/NativeScript/issues/7190)) ([2a02360](https://github.com/NativeScript/NativeScript/commit/2a02360))
* **devtools-ios:** Ensure UI modifications run on main thread ([c60f74d](https://github.com/NativeScript/NativeScript/commit/c60f74d)), closes [#7219](https://github.com/NativeScript/NativeScript/issues/7219)
* **ios:** add null check to TouchGestureRecognizer ([#7182](https://github.com/NativeScript/NativeScript/issues/7182)) ([7d3f0d9](https://github.com/NativeScript/NativeScript/commit/7d3f0d9))
* **ios:** application.displayedEvent does not depend on trace to fire ([#7141](https://github.com/NativeScript/NativeScript/issues/7141)) ([#7156](https://github.com/NativeScript/NativeScript/issues/7156)) ([4e56c89](https://github.com/NativeScript/NativeScript/commit/4e56c89))
* **ios:** image cache module not longer sets null in NSCache ([#7171](https://github.com/NativeScript/NativeScript/issues/7171)) ([4f79d2e](https://github.com/NativeScript/NativeScript/commit/4f79d2e))
* **ios-modal:** closeCallback not being called with popover presentation style ([#7189](https://github.com/NativeScript/NativeScript/issues/7189)) ([aa44eb9](https://github.com/NativeScript/NativeScript/commit/aa44eb9))
* **ios-tabview:** crash when setting tab text color ([#7188](https://github.com/NativeScript/NativeScript/issues/7188)) ([77c45da](https://github.com/NativeScript/NativeScript/commit/77c45da))
* **text:** crash when removing FormattedText ([#7237](https://github.com/NativeScript/NativeScript/issues/7237)) ([37b53c6](https://github.com/NativeScript/NativeScript/commit/37b53c6))


### Features

* **android:** elevation shadow support ([#7136](https://github.com/NativeScript/NativeScript/issues/7136)) ([cf533a7](https://github.com/NativeScript/NativeScript/commit/cf533a7))
* **android:** implement a 'activityNewIntent' event ([3efc06e](https://github.com/NativeScript/NativeScript/commit/3efc06e))
* **android:** implement BorderDrawable outline ([ec07a99](https://github.com/NativeScript/NativeScript/commit/ec07a99))
* **hmr:** preserve navigation history on applying changes ([#7146](https://github.com/NativeScript/NativeScript/issues/7146)) ([d35e14e](https://github.com/NativeScript/NativeScript/commit/d35e14e))
* **switch:** add property for off state background color ([#7138](https://github.com/NativeScript/NativeScript/issues/7138)) ([f0146f0](https://github.com/NativeScript/NativeScript/commit/f0146f0))



## [5.3.2](https://github.com/NativeScript/NativeScript/compare/5.3.1...5.3.2) (2019-05-03)


### Bug Fixes

* no trace message on empty app.css ([#7135](https://github.com/NativeScript/NativeScript/issues/7135)) ([170d2a8](https://github.com/NativeScript/NativeScript/commit/170d2a8))
* **ios:** application.displayedEvent does not depend on trace to fire ([#7141](https://github.com/NativeScript/NativeScript/issues/7141)) ([f6f7b51](https://github.com/NativeScript/NativeScript/commit/f6f7b51))
* **ios:** flat action bar incorrect layout after navigation ([#7077](https://github.com/NativeScript/NativeScript/issues/7077)) ([1dc3952](https://github.com/NativeScript/NativeScript/commit/1dc3952))
* **ios-http-get:** http failure during parsing xml ([#7175](https://github.com/NativeScript/NativeScript/issues/7175)) ([c227c50](https://github.com/NativeScript/NativeScript/commit/c227c50))



## [5.3.1](https://github.com/NativeScript/NativeScript/compare/5.3.0...5.3.1) (2019-03-28)


### Bug Fixes

* revert fromUrl deprecate warning ([#7082](https://github.com/NativeScript/NativeScript/issues/7082)) ([0a45540](https://github.com/NativeScript/NativeScript/commit/0a45540))


<a name="5.3.0"></a>
# [5.3.0](https://github.com/NativeScript/NativeScript/compare/5.2.1...5.3.0) (2019-03-21)


### Bug Fixes

* **android:** resource ID not found on navigation between pages with nested and single frames ([#6955](https://github.com/NativeScript/NativeScript/issues/6955)) ([33d6d1f](https://github.com/NativeScript/NativeScript/commit/33d6d1f))
* **android:** navigation between pages with single and nested frames ([#7011](https://github.com/NativeScript/NativeScript/issues/7011)) ([91d90cc](https://github.com/NativeScript/NativeScript/commit/91d90cc))
* **http:** ensure httpcontent.toFile() creates intermediate directories ([#6451](https://github.com/NativeScript/NativeScript/issues/6451)) ([d7fb9b8](https://github.com/NativeScript/NativeScript/commit/d7fb9b8))
* WrappedValue.unwrap empty string behavior ([#6900](https://github.com/NativeScript/NativeScript/issues/6900)) ([0482460](https://github.com/NativeScript/NativeScript/commit/0482460))
* **android-bottom-tabs:** use immediate transition on programmatic selectedIndex change ([#6942](https://github.com/NativeScript/NativeScript/issues/6942)) ([e9dfa20](https://github.com/NativeScript/NativeScript/commit/e9dfa20))
* **ios:** disable default tab reselect behavior ([#6968](https://github.com/NativeScript/NativeScript/issues/6968)) ([043cbf3](https://github.com/NativeScript/NativeScript/commit/043cbf3))
* **ios-webview:** report hostname lookup errors in loadFinished event ([#6988](https://github.com/NativeScript/NativeScript/issues/6988)) ([e6486f6](https://github.com/NativeScript/NativeScript/commit/e6486f6))
* **ios-webview:** loading of local-file dependency ([#6947](https://github.com/NativeScript/NativeScript/issues/6947)) ([dcad754](https://github.com/NativeScript/NativeScript/commit/dcad754)), closes [/github.com/NativeScript/NativeScript/issues/6377#issuecomment-433322681](https://github.com//github.com/NativeScript/NativeScript/issues/6377/issues/issuecomment-433322681) [#6377](https://github.com/NativeScript/NativeScript/issues/6377)
* set/unset touchListener.owner onLoaded/onUnloaded ([#6922](https://github.com/NativeScript/NativeScript/issues/6922)) ([f056167](https://github.com/NativeScript/NativeScript/commit/f056167))


### Features

* local icon handling in actionbar and tabview ([#7009](https://github.com/NativeScript/NativeScript/issues/7009)) ([cd66300](https://github.com/NativeScript/NativeScript/commit/cd66300))
* **android:** add openFile to utils ([#6895](https://github.com/NativeScript/NativeScript/issues/6895)) ([f8eee40](https://github.com/NativeScript/NativeScript/commit/f8eee40))
* **hmr:** style views at runtime ([#7012](https://github.com/NativeScript/NativeScript/issues/7012)) ([3c2c1d9](https://github.com/NativeScript/NativeScript/commit/3c2c1d9))
* **hmr:** apply changes in page styles at runtime when app root is a frame ([#6857](https://github.com/NativeScript/NativeScript/issues/6857)) ([44b8acd](https://github.com/NativeScript/NativeScript/commit/44b8acd))
* **view** expose missing backgroundSize, backgroundRepeat, and backgroundPosition properties on View class ([#7032](https://github.com/NativeScript/NativeScript/issues/7032)) ([88f2242](https://github.com/NativeScript/NativeScript/commit/88f2242))


<a name="5.2.2"></a>
## [5.2.2](https://github.com/NativeScript/NativeScript/compare/5.2.1...5.2.2) (2019-03-01)


### Bug Fixes

* **android:** resource ID [#0](https://github.com/NativeScript/NativeScript/issues/0)xffffffec not found on nav ([#6955](https://github.com/NativeScript/NativeScript/issues/6955)) ([33d6d1f](https://github.com/NativeScript/NativeScript/commit/33d6d1f))
* **android-animations:** reuse animatorSet to prevent high memory usage ([#6930](https://github.com/NativeScript/NativeScript/issues/6930)) ([7236d32](https://github.com/NativeScript/NativeScript/commit/7236d32))
* **ios:** opaque bars break ui layout ([#6929](https://github.com/NativeScript/NativeScript/issues/6929)) ([09fa085](https://github.com/NativeScript/NativeScript/commit/09fa085))
* **ios:** resize of scrollview content breaks layout ([#6965](https://github.com/NativeScript/NativeScript/issues/6965)) ([a9d2043](https://github.com/NativeScript/NativeScript/commit/a9d2043))



<a name="5.2.1"></a>
## [5.2.1](https://github.com/NativeScript/NativeScript/compare/5.2.0...5.2.1) (2019-02-19)


### Bug Fixes

* **css:** widget properties in css didn't work ([#6889](https://github.com/NativeScript/NativeScript/issues/6889)) ([8330ac0](https://github.com/NativeScript/NativeScript/commit/8330ac0))
* **frame-ios:** tearDownUI  when UINavigationController disappear ([#6892](https://github.com/NativeScript/NativeScript/issues/6892)) ([57f07a3](https://github.com/NativeScript/NativeScript/commit/57f07a3))
* **ios:** searcbar hint color before hint property ([#6902](https://github.com/NativeScript/NativeScript/issues/6902)) ([5dd01a3](https://github.com/NativeScript/NativeScript/commit/5dd01a3))
* **ios-textview:** text alignment reset to default on blur ([#6903](https://github.com/NativeScript/NativeScript/issues/6903)) ([0416f7e](https://github.com/NativeScript/NativeScript/commit/0416f7e))



<a name="5.2.0"></a>
# [5.2.0](https://github.com/NativeScript/NativeScript/compare/5.1.2...5.2.0) (2019-02-08)


### Bug Fixes

* **android:** raise resume event on activity.onPostResume() ([#6766](https://github.com/NativeScript/NativeScript/issues/6766)) ([46c9de0](https://github.com/NativeScript/NativeScript/commit/46c9de0))
* **android:** animator restore logic on simulated nav ([#6710](https://github.com/NativeScript/NativeScript/issues/6710)) ([c034d6e](https://github.com/NativeScript/NativeScript/commit/c034d6e))
* **android:** failure saving state in mixed parent/nested frame nav ([#6719](https://github.com/NativeScript/NativeScript/issues/6719)) ([4dc35a5](https://github.com/NativeScript/NativeScript/commit/4dc35a5))
* **android:** a crash on application restart after livesync changes ([#6756](https://github.com/NativeScript/NativeScript/issues/6756)) ([1f1d722](https://github.com/NativeScript/NativeScript/commit/1f1d722))
* **android:** use passwordHint for password placeholder ([25f4b56](https://github.com/NativeScript/NativeScript/commit/25f4b56))
* **android:** clear dialog fragment when closing modal view ([#6852](https://github.com/NativeScript/NativeScript/issues/6852)) ([8c80044](https://github.com/NativeScript/NativeScript/commit/8c80044))
* **android:** app crashes on ListView item template change ([#6634](https://github.com/NativeScript/NativeScript/issues/6634)) ([2085d1e](https://github.com/NativeScript/NativeScript/commit/2085d1e))
* **android:** fix a crash if modal is destroyed before dismissed ([#6723](https://github.com/NativeScript/NativeScript/issues/6723)) ([8a32102](https://github.com/NativeScript/NativeScript/commit/8a32102))
* **ios:** native view frame optimizations in nested scenario ([#6809](https://github.com/NativeScript/NativeScript/issues/6809)) ([08acd84](https://github.com/NativeScript/NativeScript/commit/08acd84))
* **ios:** textview content clipped on every other newline ([#6864](https://github.com/NativeScript/NativeScript/issues/6864)) ([23dc84d](https://github.com/NativeScript/NativeScript/commit/23dc84d))
* **ios:** tearDownUI and reset UINavigationController ([#6817](https://github.com/NativeScript/NativeScript/issues/6817)) ([cea97c6](https://github.com/NativeScript/NativeScript/commit/cea97c6))
* **action-bar:** flat mode breaks ios safe area ([#6862](https://github.com/NativeScript/NativeScript/issues/6862)) ([603c901](https://github.com/NativeScript/NativeScript/commit/603c901))
* **tab-view:** remove onBackPressed override ([#6755](https://github.com/NativeScript/NativeScript/issues/6755)) ([984f162](https://github.com/NativeScript/NativeScript/commit/984f162))
* call onNavigatingFrom event only if it exists ([#6773](https://github.com/NativeScript/NativeScript/issues/6773)) ([19dfd16](https://github.com/NativeScript/NativeScript/commit/19dfd16))
* app launch with application style hot module updates  ([7ced019](https://github.com/NativeScript/NativeScript/commit/7ced019))


### Features

* provide API to release the native object wrapped by a JS one ([#6873](https://github.com/NativeScript/NativeScript/issues/6873)) ([8b4a9b3](https://github.com/NativeScript/NativeScript/commit/8b4a9b3))
* **HMR:** apply changes in application styles at runtime ([42a1491](https://github.com/NativeScript/NativeScript/commit/42a1491))
* **dialog:** add decimal input type for prompt dialog ([#6805](https://github.com/NativeScript/NativeScript/issues/6805)) ([408614d](https://github.com/NativeScript/NativeScript/commit/408614d))
* **image-cache:** expose onError callback ([#6458](https://github.com/NativeScript/NativeScript/issues/6458)) ([3481e6f](https://github.com/NativeScript/NativeScript/commit/3481e6f))
* **android:** option to make dialogs cancelable ([#6765](https://github.com/NativeScript/NativeScript/issues/6765)) ([3a8c3fc](https://github.com/NativeScript/NativeScript/commit/3a8c3fc))
* add rebeccapurple to known css colors ([#6819](https://github.com/NativeScript/NativeScript/issues/6819)) ([672c821](https://github.com/NativeScript/NativeScript/commit/672c821))
* add OnDiscardedError typings and event ([#6777](https://github.com/NativeScript/NativeScript/issues/6777)) ([28db2af](https://github.com/NativeScript/NativeScript/commit/28db2af))



<a name="5.1.2"></a>
## [5.1.2](https://github.com/NativeScript/NativeScript/compare/5.1.1...5.1.2) (2019-01-13)


### Bug Fixes

* **list-view-android:** app crashes on ListView item template change ([#6634](https://github.com/NativeScript/NativeScript/issues/6634)) ([e03f5f9](https://github.com/NativeScript/NativeScript/commit/e03f5f9))



<a name="5.1.1"></a>
## [5.1.1](https://github.com/NativeScript/NativeScript/compare/5.1.0...5.1.1) (2018-12-19)


### Bug Fixes

* **android:** animator restore logic on simulated nav ([#6710](https://github.com/NativeScript/NativeScript/issues/6710)) ([54b6df6](https://github.com/NativeScript/NativeScript/commit/54b6df6))
* **android:** failure saving state in mixed parent/nested frame nav ([#6719](https://github.com/NativeScript/NativeScript/issues/6719)) ([e5f110f](https://github.com/NativeScript/NativeScript/commit/e5f110f))
* **android:** nested fragment disappears on parent fragment removal ([#6677](https://github.com/NativeScript/NativeScript/issues/6677)) ([c084660](https://github.com/NativeScript/NativeScript/commit/c084660))


### Features

* **tns-platform-declarations:** Generate iOS typings from iOS 12.1 SDK ([#6693](https://github.com/NativeScript/NativeScript/issues/6693)) ([1c0218e](https://github.com/NativeScript/NativeScript/commit/1c0218e))
* **view:** added iOS parameter for modal presentation style ([#6409](https://github.com/NativeScript/NativeScript/issues/6409)) ([540b2b4](https://github.com/NativeScript/NativeScript/commit/540b2b4))



<a name="5.1.0"></a>
# [5.1.0](https://github.com/NativeScript/NativeScript/compare/5.0.5...5.1.0) (2018-12-05)


### Bug Fixes

* **android-styling:** correctly detect if drawable uses ColorFilter ([#6342](https://github.com/NativeScript/NativeScript/issues/6342)) ([11d3884](https://github.com/NativeScript/NativeScript/commit/11d3884)), closes [#6341](https://github.com/NativeScript/NativeScript/issues/6341)
* **listview:** incorrect layout when scroll ([#6656](https://github.com/NativeScript/NativeScript/issues/6656)) ([63be78a](https://github.com/NativeScript/NativeScript/commit/63be78a))
* **modals:** regression with modals in angular ([#6655](https://github.com/NativeScript/NativeScript/issues/6655)) ([30df4d9](https://github.com/NativeScript/NativeScript/commit/30df4d9))
* **searchbar:** isEnabled and isUserInteractionEnabled ([#6636](https://github.com/NativeScript/NativeScript/issues/6636)) ([25c99d8](https://github.com/NativeScript/NativeScript/commit/25c99d8))
* **tests:** Sporadic failures after upgrade to WebKit 12.0 ([#6635](https://github.com/NativeScript/NativeScript/issues/6635)) ([65e3a19](https://github.com/NativeScript/NativeScript/commit/65e3a19))


### Features

* add hints options for username and password fields ([#6416](https://github.com/NativeScript/NativeScript/issues/6416)) ([c834181](https://github.com/NativeScript/NativeScript/commit/c834181))
* **ActionBar:** apply text color when largeTitletextAttribute is set on iOS ([#6631](https://github.com/NativeScript/NativeScript/issues/6631)) ([b58dff0](https://github.com/NativeScript/NativeScript/commit/b58dff0))
* **modals:** Enable modal dialog chaining in IOS ([#6637](https://github.com/NativeScript/NativeScript/issues/6637)) ([64bccb9](https://github.com/NativeScript/NativeScript/commit/64bccb9))
* **scrollbar:** add isScrollEnabled property ([#6640](https://github.com/NativeScript/NativeScript/issues/6640)) ([ae0fa90](https://github.com/NativeScript/NativeScript/commit/ae0fa90))
* **tabview:** add androidSwipeEnabled property ([#6652](https://github.com/NativeScript/NativeScript/issues/6652)) ([0b239d7](https://github.com/NativeScript/NativeScript/commit/0b239d7))



<a name="5.0.5"></a>
## [5.0.5](https://github.com/NativeScript/NativeScript/compare/5.0.4...5.0.5) (2018-11-26)



<a name="5.0.4"></a>
## [5.0.4](https://github.com/NativeScript/NativeScript/compare/5.0.3...5.0.4) (2018-11-26)


### Bug Fixes

* **android-fragment:** child already has a parent ([#6589](https://github.com/NativeScript/NativeScript/issues/6589)) ([5b9b335](https://github.com/NativeScript/NativeScript/commit/5b9b335))
* **back-navigation:** app freeze on going back in parent frame with states ([#6595](https://github.com/NativeScript/NativeScript/issues/6595)) ([fc1f8c1](https://github.com/NativeScript/NativeScript/commit/fc1f8c1))



<a name="5.0.3"></a>
## [5.0.3](https://github.com/NativeScript/NativeScript/compare/5.0.2...5.0.3) (2018-11-20)


### Bug Fixes

* crash on Android Tab-View [#6466](https://github.com/NativeScript/NativeScript/issues/6466) ([#6467](https://github.com/NativeScript/NativeScript/issues/6467)) ([db33cf3](https://github.com/NativeScript/NativeScript/commit/db33cf3)), closes [ac04ede#diff-f1459d509d1432b432c29bcd30e462fbL97](https://github.com/ac04ede/issues/diff-f1459d509d1432b432c29bcd30e462fbL97)
* doc of transitionAndroid property of NavigationEntry interface ([#6563](https://github.com/NativeScript/NativeScript/issues/6563)) ([efe3318](https://github.com/NativeScript/NativeScript/commit/efe3318))
* layoutChanged event in landscape ([#6520](https://github.com/NativeScript/NativeScript/issues/6520)) ([7fbdc7a](https://github.com/NativeScript/NativeScript/commit/7fbdc7a))
* nested frames order with tabs & suspend/resume ([#6528](https://github.com/NativeScript/NativeScript/issues/6528)) ([7df8038](https://github.com/NativeScript/NativeScript/commit/7df8038))
* Resolve incorrect name of listener when unsubscribing ([#6487](https://github.com/NativeScript/NativeScript/issues/6487)) ([af5eb73](https://github.com/NativeScript/NativeScript/commit/af5eb73))
* Resolve incorrect name of listener when unsubscribing ([#6487](https://github.com/NativeScript/NativeScript/issues/6487)) ([2933a9a](https://github.com/NativeScript/NativeScript/commit/2933a9a))
* **image:** uncaught error in promise with image handling ([#6453](https://github.com/NativeScript/NativeScript/issues/6453)) ([950fdcf](https://github.com/NativeScript/NativeScript/commit/950fdcf))
* **android:** back navigation on app suspend/resume ([#6489](https://github.com/NativeScript/NativeScript/issues/6489)) ([999e378](https://github.com/NativeScript/NativeScript/commit/999e378))
* **android:** back navigation on app suspend/resume ([#6489](https://github.com/NativeScript/NativeScript/issues/6489)) ([fac970e](https://github.com/NativeScript/NativeScript/commit/fac970e))
* **android:** IllegalStateException with tabview&nested frames ([#6495](https://github.com/NativeScript/NativeScript/issues/6495)) ([7d21b5c](https://github.com/NativeScript/NativeScript/commit/7d21b5c))
* **android:** IllegalStateException with tabview&nested frames ([#6495](https://github.com/NativeScript/NativeScript/issues/6495)) ([41ba93d](https://github.com/NativeScript/NativeScript/commit/41ba93d))
* **ios:** safe area handling in scrollview ([#6561](https://github.com/NativeScript/NativeScript/issues/6561)) ([51a191f](https://github.com/NativeScript/NativeScript/commit/51a191f))
* **ios:** scrollview safe area when no scroll ([#6568](https://github.com/NativeScript/NativeScript/issues/6568)) ([f90995f](https://github.com/NativeScript/NativeScript/commit/f90995f))


### Features

* add number and phone input types for prompt dialog ([#6365](https://github.com/NativeScript/NativeScript/issues/6365)) ([7e7c050](https://github.com/NativeScript/NativeScript/commit/7e7c050))



<a name="5.0.2"></a>
## [5.0.2](https://github.com/NativeScript/NativeScript/compare/5.0.1...5.0.2) (2018-11-07)


### Bug Fixes

* **android:** back navigation on app suspend/resume ([#6489](https://github.com/NativeScript/NativeScript/issues/6489)) ([999e378](https://github.com/NativeScript/NativeScript/commit/999e378))
* **android:** IllegalStateException with tabview and nested frames ([#6495](https://github.com/NativeScript/NativeScript/issues/6495)) ([7d21b5c](https://github.com/NativeScript/NativeScript/commit/7d21b5c))
* Resolve incorrect name of listener when unsubscribing ([#6487](https://github.com/NativeScript/NativeScript/issues/6487)) ([af5eb73](https://github.com/NativeScript/NativeScript/commit/af5eb73))



<a name="5.0.0"></a>
# [5.0.0](https://github.com/NativeScript/NativeScript/compare/4.2.1...5.0.0) (2018-11-01)

### Bug Fixes

* don't crash on missing resources in tab-view and action-bar ([#6388](https://github.com/NativeScript/NativeScript/issues/6388)) ([56a1b12](https://github.com/NativeScript/NativeScript/commit/56a1b12))
* nested fragments interact through child fragment manager ([#6293](https://github.com/NativeScript/NativeScript/issues/6293)) ([3071720](https://github.com/NativeScript/NativeScript/commit/3071720))
* Page and Frame isLoaded undefined checks ([#6255](https://github.com/NativeScript/NativeScript/issues/6255)) ([12fade7](https://github.com/NativeScript/NativeScript/commit/12fade7))
* **connectivity:** making startMonitoring() behave on iOS as on Android ([#6373](https://github.com/NativeScript/NativeScript/issues/6373)) ([a58fc52](https://github.com/NativeScript/NativeScript/commit/a58fc52))
* **observable-array:** reduce no longer ignores zero as initial value ([#6402](https://github.com/NativeScript/NativeScript/issues/6402)) ([c0438df](https://github.com/NativeScript/NativeScript/commit/c0438df))
* **modals:** application activityBackPressed event not fired for modals ([#6261](https://github.com/NativeScript/NativeScript/issues/6261)) ([8575c60](https://github.com/NativeScript/NativeScript/commit/8575c60))
* **list-view:** Layout list-view items on request ([#6159](https://github.com/NativeScript/NativeScript/issues/6159)) ([ec24c5a](https://github.com/NativeScript/NativeScript/commit/ec24c5a))
* **tab-view:** Title and icon positioning ([#6362](https://github.com/NativeScript/NativeScript/issues/6362)) ([e3d5f0d](https://github.com/NativeScript/NativeScript/commit/e3d5f0d))
* **tab-view:** change androidOffscreenTabLimit to 1 when using bottom tabs for android([#6476](https://github.com/NativeScript/NativeScript/issues/6476)) ([371fc9b](https://github.com/NativeScript/NativeScript/commit/371fc9b))
* **android:** HEAD request should return statusCode ([7e89f94](https://github.com/NativeScript/NativeScript/commit/7e89f94))
* **android:** nested frames on app suspend/resume ([#6339](https://github.com/NativeScript/NativeScript/issues/6339)) ([0bf6dc2](https://github.com/NativeScript/NativeScript/commit/0bf6dc2))
* **android:** parallel navigations should not be triggered ([#6275](https://github.com/NativeScript/NativeScript/issues/6275)) ([6c9fa16](https://github.com/NativeScript/NativeScript/commit/6c9fa16))
* **android:** suppress reflection for default animations ([#6141](https://github.com/NativeScript/NativeScript/issues/6141)) ([cc19b40](https://github.com/NativeScript/NativeScript/commit/cc19b40))
* **android/platform:** reinitialise screen metrics on orientation change ([#6164](https://github.com/NativeScript/NativeScript/issues/6164)) ([2ee1d7d](https://github.com/NativeScript/NativeScript/commit/2ee1d7d))
* **ios:** listview scrollToIndex crash with async data ([#6182](https://github.com/NativeScript/NativeScript/issues/6182)) ([a8d016c](https://github.com/NativeScript/NativeScript/commit/a8d016c))
* **ios:** nowrap label measure in horizontal stack layout ([#6186](https://github.com/NativeScript/NativeScript/issues/6186)) ([a1c570c](https://github.com/NativeScript/NativeScript/commit/a1c570c))
* **ios:** TimePicker minuteInterval property ([#6116](https://github.com/NativeScript/NativeScript/issues/6116)) ([88f7ed8](https://github.com/NativeScript/NativeScript/commit/88f7ed8))

### Features

* add ability to pass touch event through parent view ([#6204](https://github.com/NativeScript/NativeScript/issues/6204)) ([2625683](https://github.com/NativeScript/NativeScript/commit/2625683))
* implement capitalization type option for prompt dialogs ([#6325](https://github.com/NativeScript/NativeScript/issues/6325)) ([ae6a661](https://github.com/NativeScript/NativeScript/commit/ae6a661))
* **application-settings:** implemented allKeys method ([#6371](https://github.com/NativeScript/NativeScript/issues/6371)) ([829d18b](https://github.com/NativeScript/NativeScript/commit/829d18b))
* **frame:** add new actionBarVisibility property ([#6449](https://github.com/NativeScript/NativeScript/issues/6449)) ([0002624](https://github.com/NativeScript/NativeScript/commit/0002624))
* **frame:** hardware back in parent frame when back states available ([#6446](https://github.com/NativeScript/NativeScript/issues/6446)) ([af651d6](https://github.com/NativeScript/NativeScript/commit/af651d6))
* **grid:** implement addChildAtCell ([#6411](https://github.com/NativeScript/NativeScript/issues/6411)) ([a3f1493](https://github.com/NativeScript/NativeScript/commit/a3f1493))
* **image-asset-ios:** add autoScaleFactor option to switch auto scaling ([#6127](https://github.com/NativeScript/NativeScript/issues/6127)) ([81e63ee](https://github.com/NativeScript/NativeScript/commit/81e63ee))
* **styling:** Add two functions to control applicationAdditionalSelectors ([#6124](https://github.com/NativeScript/NativeScript/issues/6124)) ([85b8c01](https://github.com/NativeScript/NativeScript/commit/85b8c01))
* **tslib:** add tslib helpers to global ([#6351](https://github.com/NativeScript/NativeScript/issues/6351)) ([1232d1e](https://github.com/NativeScript/NativeScript/commit/1232d1e))
* **android:** add Bluetooth connectivity type for Android ([#6162](https://github.com/NativeScript/NativeScript/issues/6162)) ([f1bef48](https://github.com/NativeScript/NativeScript/commit/f1bef48))
* **android:** migrate to support library apis ([#6129](https://github.com/NativeScript/NativeScript/issues/6129)) ([cf034dd](https://github.com/NativeScript/NativeScript/commit/cf034dd))
* **android:** platform declarations for Android API 28 (Android 9) ([#6243](https://github.com/NativeScript/NativeScript/issues/6243)) ([b9fc373](https://github.com/NativeScript/NativeScript/commit/b9fc373))
* **iOS:** Safe Area Support ([#6230](https://github.com/NativeScript/NativeScript/issues/6230)) ([982acdc](https://github.com/NativeScript/NativeScript/commit/982acdc))
* **iOS:** update platform declarations ([f54f71b](https://github.com/NativeScript/NativeScript/commit/f54f71b))


### BREAKING CHANGES

* **android:** NativeScript core framework now extends support library APIs versus native framework classes as per Google's latest guidelines ([#6129](https://github.com/NativeScript/NativeScript/issues/6129)) ([cf034dd](https://github.com/NativeScript/NativeScript/commit/cf034dd)):
    - NativeScript activities now extend `android.support.v7.app.AppCompatActivity` (vs android.app.Activity)
    - NativeScript fragments now extend `android.support.v4.app.Fragment` (vs android.app.Fragment)
    - NativeScript now works internally with `android.support.v4.app.FragmentManager` (vs android.app.FragmentManager)

The implications of these changes should be mostly transparent to the developer except for the fact that the support library Fragment / FragmentManager work with Animation APIs versus Animator APIs.

For Android API Levels lower than 28 the new Fragment API uses a different fragment enter animation by default. You can customise the transition per navigation entry or globally via the [navigation transitions API](https://docs.nativescript.org/core-concepts/navigation#navigation-transitions)
Before:
Default fragment enter animation was fade animation

After:
Default fragment enter animation for API levels lower than 28 is now a fast "push fade" animation; default fragment enter animation for API levels equal to or greater than 28 remains fade animation

* Layout class (`tns-core-modules/ui/layouts/layout`) is now removed as it is not used in {N} framework any more.

Before:
Built-in {N} layouts GridLayout, StackLayout, WrapLayout, etc. extended `Layout` class

After:
Built-in {N} layouts GridLayout, StackLayout, WrapLayout, etc. now extend `LayoutBase` class

To migrate your code follow the example below:

Before:
``` ts
import { Layout } from "ui/layouts/layout";
// ...

let wrapLayout: Layout;

export function pageLoaded(args: EventData) {
     const page = <Page>args.object;
     wrapLayout = page.getViewById<Layout>("wrapLayout");
 }
```

After:
``` ts
import { LayoutBase } from "ui/layouts/layout-base"; // or import { WrapLayout } from "ui/layouts/wrap-layout;
// ...

let wrapLayout: LayoutBase; // or let wrapLayout: WrapLayout;

export function pageLoaded(args: EventData) {
     const page = <Page>args.object;
     wrapLayout = page.getViewById<LayoutBase>("wrapLayout"); // or wrapLayout = page.getViewById<WrapLayout>("wrapLayout");
 }
```
* **android:** change androidOffscreenTabLimit to 1 when using bottom tabs of tab-view([#6476](https://github.com/NativeScript/NativeScript/issues/6476)) ([371fc9b](https://github.com/NativeScript/NativeScript/commit/371fc9b))

* **ios:** widgets native view lifecycle refactoring - native view is now created right before they are added to visual tree ([#6102](https://github.com/NativeScript/NativeScript/issues/6102)) ([46705ee](https://github.com/NativeScript/NativeScript/commit/46705ee)):

The iOS widgets native view lifecycle now matches the Android widgets. Before, the iOS native view was created in the widget constructor and you could manipulate the native view right after the widget is instantiated. After the refactoring, the widget's native view will be created when it's added to the visual tree. The most correct way to manipulate the native view is in the `loaded` event handler.

Before:
``` ts
import { Button } from "ui/button";
// ...

const button = new Button();
button.nativeView.someNativeAPIMethod();
```

After:
``` ts
import { Button } from "ui/button";
// ...

const button = new Button();
button.on("loaded", () => {
    button.nativeView.someNativeAPIMethod();
});
```

* **ios:** Widgets that inherit the `ContainerView` class now overflow the safe area by default ([#6230](https://github.com/NativeScript/NativeScript/issues/6230)) ([982acdc](https://github.com/NativeScript/NativeScript/commit/982acdc)):

These are: `AbsoluteLayout`, `DockLayout`, `GridLayout`, `StackLayout`, `WrapLayout`, `FlexboxLayout`, `ScrollView`, `ListView`, `WebView` and `Repeater`.

The change is that now if these widgets touch the edge of the safe area, they will be automatically expanded to the edge of the screen. This will change their width and height. Margins and paddings will still be applied only in the safe area. This behavior can be reverted to the old one by setting the `iosOverflowSafeArea` property of the widget to `false`.

<a name="4.2.1"></a>
## [4.2.1](https://github.com/NativeScript/NativeScript/compare/4.2.0...4.2.1) (2018-09-18)

### Bug Fixes

* enable reportProgress property for NativeScirpt Angular's HTTPClient ([#6154](https://github.com/NativeScript/NativeScript/issues/6154)) ([349850f](https://github.com/NativeScript/NativeScript/commit/349850f))
* **ios:** listview scrollToIndex crash with async data ([#6182](https://github.com/NativeScript/NativeScript/issues/6182)) ([ca6cccb](https://github.com/NativeScript/NativeScript/commit/ca6cccb))
* **ios:** touch delegate does not call base class touch methods ([#6113](https://github.com/NativeScript/NativeScript/pull/6113)) ([284cd5](https://github.com/NativeScript/NativeScript/commit/284cd5))
* **ios:** TimePicker minuteInterval property ([#6116](https://github.com/NativeScript/NativeScript/issues/6116)) ([ca9bad6](https://github.com/NativeScript/NativeScript/commit/ca9bad6))
* **android:** parallel navigation actions should not be triggered ([#6275](https://github.com/NativeScript/NativeScript/issues/6275)) ([405ccae](https://github.com/NativeScript/NativeScript/commit/405ccae))
* **android:** HEAD request should return statusCode ([fe35567](https://github.com/NativeScript/NativeScript/commit/fe35567))
* observable array reduce bug ([#6219](https://github.com/NativeScript/NativeScript/issues/6219)) ([b028dd9](https://github.com/NativeScript/NativeScript/commit/b028dd9))
* Page and Frame isLoaded undefined checks ([#6255](https://github.com/NativeScript/NativeScript/issues/6255)) ([4a11cf9](https://github.com/NativeScript/NativeScript/commit/4a11cf9))
* **android/platform:** reinitialise screen metrics on orientation change ([#6164](https://github.com/NativeScript/NativeScript/issues/6164)) ([040781c](https://github.com/NativeScript/NativeScript/commit/040781c))
* **ios:** nowrap label measure in horizontal stack layout ([#6186](https://github.com/NativeScript/NativeScript/issues/6186)) ([efd5f8d](https://github.com/NativeScript/NativeScript/commit/efd5f8d))
* **list-view:** Layout list-view items on request ([#6159](https://github.com/NativeScript/NativeScript/issues/6159)) ([115a4c1](https://github.com/NativeScript/NativeScript/commit/115a4c1))
* **modals:** application activityBackPressed event not fired for modals ([#6261](https://github.com/NativeScript/NativeScript/issues/6261)) ([13d4f34](https://github.com/NativeScript/NativeScript/commit/13d4f34))


<a name="4.2.0"></a>
# [4.2.0](https://github.com/NativeScript/NativeScript/compare/4.1.1...4.2.0) (2018-08-08)

### Bug Fixes

* **action-bar:** navController may be null ([#6029](https://github.com/NativeScript/NativeScript/issues/6029)) ([324fdce](https://github.com/NativeScript/NativeScript/commit/324fdce))
* **android:** label width shrinking on shorter text change ([#5917](https://github.com/NativeScript/NativeScript/issues/5917)) ([0b9d4ae](https://github.com/NativeScript/NativeScript/commit/0b9d4ae))
* **android:** NavigationButton was read as "Button" by screenreaders ([#5949](https://github.com/NativeScript/NativeScript/issues/5949)) ([0e04cb4](https://github.com/NativeScript/NativeScript/commit/0e04cb4))
* **android:** prevent error during tear down ([#5947](https://github.com/NativeScript/NativeScript/issues/5947)) ([b0afd3a](https://github.com/NativeScript/NativeScript/commit/b0afd3a))
* **animation:** handle promise rejection and avoid throw ([#5861](https://github.com/NativeScript/NativeScript/issues/5861)) ([9308bab](https://github.com/NativeScript/NativeScript/commit/9308bab))
* **animations:** avoid steady mem consumption rise ([#6004](https://github.com/NativeScript/NativeScript/issues/6004)) ([bcadcbe](https://github.com/NativeScript/NativeScript/commit/bcadcbe))
* **core/properties:** typings for nativeValueChange ([#5791](https://github.com/NativeScript/NativeScript/issues/5791)) ([357c8ec](https://github.com/NativeScript/NativeScript/commit/357c8ec))
* **dialogs-ios:** dialogs not showing in single page apps (non Frame based apps) ([#6000](https://github.com/NativeScript/NativeScript/issues/6000)) ([0082dfb](https://github.com/NativeScript/NativeScript/commit/0082dfb))
* **image:** catch Response content may not be converted to an Image ([#5856](https://github.com/NativeScript/NativeScript/issues/5856)) ([5cd8a1f](https://github.com/NativeScript/NativeScript/commit/5cd8a1f))
* **ios:** safeAreaLayoutGuide fallback for iOS 10 cases ([#5960](https://github.com/NativeScript/NativeScript/issues/5960)) ([4b5754a](https://github.com/NativeScript/NativeScript/commit/4b5754a))
* **ios:** set current tab as topmost frame on load ([#5908](https://github.com/NativeScript/NativeScript/issues/5908)) ([b122bd4](https://github.com/NativeScript/NativeScript/commit/b122bd4))
* **ios:** translate transform breaks sequential animation set ([#5961](https://github.com/NativeScript/NativeScript/issues/5961)) ([6cfdc20](https://github.com/NativeScript/NativeScript/commit/6cfdc20))
* **ios-dialogs:** unable to show dialog from modal view without a page ([#5881](https://github.com/NativeScript/NativeScript/issues/5881)) ([e59d156](https://github.com/NativeScript/NativeScript/commit/e59d156))
* **modal:** parent page invalid hierarchy handling [extended] ([#5966](https://github.com/NativeScript/NativeScript/issues/5966)) ([b5b8d51](https://github.com/NativeScript/NativeScript/commit/b5b8d51))

### Features

* **typings:** add Android typings for API levels from 17 to 27 ([#5890](https://github.com/NativeScript/NativeScript/issues/5890)) ([398c9b3](https://github.com/NativeScript/NativeScript/commit/398c9b3))
* Flexible Error/Exception handling ([#5929](https://github.com/NativeScript/NativeScript/issues/5929)) ([3dc3a41](https://github.com/NativeScript/NativeScript/commit/3dc3a41))
* Pass NativeScript app to the native app instead of presenting it over the root ViewController ([#5967](https://github.com/NativeScript/NativeScript/issues/5967)) ([05c2460](https://github.com/NativeScript/NativeScript/commit/05c2460))
* **CSS:** import of relative paths ([#6023](https://github.com/NativeScript/NativeScript/issues/6023)) ([6ce1d22](https://github.com/NativeScript/NativeScript/commit/6ce1d22))
* **ListPicker:** add textField, valueField and selectedValue properties ([#6033](https://github.com/NativeScript/NativeScript/issues/6033)) ([9e2e8ec](https://github.com/NativeScript/NativeScript/commit/9e2e8ec))
* **ListView:** add animated scroll to index ([#6077](https://github.com/NativeScript/NativeScript/issues/6077)) ([1fac718](https://github.com/NativeScript/NativeScript/commit/1fac718))

### BREAKING CHANGES

* **typings:**
    * There is no longer added `I` prefix in the names of the interfaces. For example, `android.view.IMenuItem` is now `android.view.MenuItem`. This matches the original name of the interface in the Android framework.
    * We are now generating only **public** methods, so all the methods which you override when extending Android class should be **public**.
    * You need to use **Array\<string>** (lowercase **string**) instead of **Array\<String>** (uppercase **String**) when overriding a method accepting string array type.


<a name="4.1.1"></a>
# [4.1.1](https://github.com/NativeScript/NativeScript/compare/4.1.0...4.1.1) (2018-07-18)

### Bug Fixes
* require devtools-elements.js with the extension mentioned explicitly ([#6079](https://github.com/NativeScript/NativeScript/issues/6079)) ([1a15aa2](https://github.com/NativeScript/NativeScript/commit/1a15aa2))


<a name="4.1.0"></a>
# [4.1.0](https://github.com/NativeScript/NativeScript/compare/4.0.1...4.1.0) (2018-05-28)

### Bug Fixes

* **android:** fix sporadic issue with transition cleanup logic called twice ([#5805](https://github.com/NativeScript/NativeScript/issues/5805)) ([a86d41e](https://github.com/NativeScript/NativeScript/commit/a86d41e))
* **android:** lollipop crash on changing activity context after navigation w/transition ([#5700](https://github.com/NativeScript/NativeScript/issues/5700)) ([4f5887b](https://github.com/NativeScript/NativeScript/commit/4f5887b))
* **android-connectivity:** add ethernet connection type ([#5670](https://github.com/NativeScript/NativeScript/issues/5670)) ([1536d15](https://github.com/NativeScript/NativeScript/commit/1536d15))
* **android-textfield:** returnPress fired twice for GO/SEARCH/SEND ([#5727](https://github.com/NativeScript/NativeScript/issues/5727)) ([ca444aa](https://github.com/NativeScript/NativeScript/commit/ca444aa))
* **flexbox-ios:** resolve text size issue for ListView with flexbox layout template ([#5799](https://github.com/NativeScript/NativeScript/issues/5799)) ([a03065c](https://github.com/NativeScript/NativeScript/commit/a03065c))
* **flexbox:** label text wrapping inside flexbox layout ([#5781](https://github.com/NativeScript/NativeScript/issues/5781)) ([481043f](https://github.com/NativeScript/NativeScript/commit/481043f))
* **ios-image-asset:** getImageAsync() can retrieve assets stored remotely in iCloud ([#5705](https://github.com/NativeScript/NativeScript/issues/5705)) ([9e3da8e](https://github.com/NativeScript/NativeScript/commit/9e3da8e))
* **ios-searchbar:** fix searchbar auto sizing in iOS11 ([#5658](https://github.com/NativeScript/NativeScript/issues/5658)) ([555e592](https://github.com/NativeScript/NativeScript/commit/555e592))
* **list-view-ios:** fix rowHeight property to apply proper item size for iOS ([#5693](https://github.com/NativeScript/NativeScript/issues/5693)) ([b9806ba](https://github.com/NativeScript/NativeScript/commit/b9806ba))
* **modal:** exception when calling ViewBase.showModal(...) ([#5737](https://github.com/NativeScript/NativeScript/issues/5737)) ([451589d](https://github.com/NativeScript/NativeScript/commit/451589d))
* **modal:** innerView.closeModal(...) not passing back context ([#5833](https://github.com/NativeScript/NativeScript/issues/5833)) ([1365f13](https://github.com/NativeScript/NativeScript/commit/1365f13))
* **navigation:** fix frame.navigate call inside page.navigatedTo handler ([#5649](https://github.com/NativeScript/NativeScript/issues/5649)) ([cf950e1](https://github.com/NativeScript/NativeScript/commit/cf950e1))
* crash at application launch on Android P ([#5831](https://github.com/NativeScript/NativeScript/issues/5831)) ([7851629](https://github.com/NativeScript/NativeScript/commit/7851629))

### Features

* **file-system:** add ability to retrieve file size ([#5710](https://github.com/NativeScript/NativeScript/issues/5710)) ([6bdb5b5](https://github.com/NativeScript/NativeScript/commit/6bdb5b5))
* **tabview:** add tab text font size property ([#5752](https://github.com/NativeScript/NativeScript/issues/5752)) ([11f0d6e](https://github.com/NativeScript/NativeScript/commit/11f0d6e))
* **view:** introduce LayoutChanged event on every View component ([#5825](https://github.com/NativeScript/NativeScript/issues/5825)) ([0fc1547](https://github.com/NativeScript/NativeScript/commit/0fc1547))
* **css:** linear-gradient support for background and backgroundImage ([#5534](https://github.com/NativeScript/NativeScript/issues/5534)) ([5a83a1c](https://github.com/NativeScript/NativeScript/commit/5a83a1c))


# 4.0.1 (2018, May 18)

### Bug Fixes

* feat(builder): enable reading xml from bundle (#5668) ([1e682bf](https://github.com/NativeScript/NativeScript/commit/1e682bf)), closes [#5668](https://github.com/NativeScript/NativeScript/issues/5668)
* fix(layout): IOS Layout not invalidated with custom root (#5724) ([f1c0b85](https://github.com/NativeScript/NativeScript/commit/f1c0b85)), closes [#5724](https://github.com/NativeScript/NativeScript/issues/5724)

# 4.0.0 (2018, April 10)

A detailed list of the new features and changes coming with NativeScript 4.0 ca be found [here](https://docs.google.com/document/d/1Iia0yEr5seq4H9qk4oMuJs4-M8dgmne98fymCO5IczA/edit?usp=sharing).

You can also check the [NativeScript 4.0 is out blog post](https://www.nativescript.org/blog/nativescript-4.0-is-out) for highlights.

### Bug Fixes

* **android-images:** set decodeHeight/decodeWidth default values to dip ([#5490](https://github.com/NativeScript/NativeScript/issues/5490)) ([6509efa](https://github.com/NativeScript/NativeScript/commit/6509efa))
* **animations:** change throw -> trace to avoid unnecessary app crash ([#5475](https://github.com/NativeScript/NativeScript/issues/5475)) ([fa80355](https://github.com/NativeScript/NativeScript/commit/fa80355))
* **animations:** check if target is present before removing its animation ([#4586](https://github.com/NativeScript/NativeScript/issues/4586)) ([4bd3a94](https://github.com/NativeScript/NativeScript/commit/4bd3a94))
* **animations:** register both style's "name" and "cssName" ([#3810](https://github.com/NativeScript/NativeScript/issues/3810)) ([3ea7365](https://github.com/NativeScript/NativeScript/commit/3ea7365))
* **animations:** remove default getters for transform properties ([#4286](https://github.com/NativeScript/NativeScript/issues/4286)) ([26e2748](https://github.com/NativeScript/NativeScript/commit/26e2748))
* **css-animations:** convert transform value properly ([#4352](https://github.com/NativeScript/NativeScript/issues/4352)) ([b7c61ca](https://github.com/NativeScript/NativeScript/commit/b7c61ca))
* **date-picker:** Date picker changed check ([#4797](https://github.com/NativeScript/NativeScript/issues/4797)) ([d0b3e0c](https://github.com/NativeScript/NativeScript/commit/d0b3e0c))
* **es6:** object constructor assign ([3ef45c1](https://github.com/NativeScript/NativeScript/commit/3ef45c1))
* **file-system-access:** join paths without leading slash ([1a497b1](https://github.com/NativeScript/NativeScript/commit/1a497b1))
* TextField not secure when keyboardType="number" ([#5012](https://github.com/NativeScript/NativeScript/issues/5012)) ([3e6f465](https://github.com/NativeScript/NativeScript/commit/3e6f465))
* **frame:** add generic frame cleanup logic after modal dialog close ([#5479](https://github.com/NativeScript/NativeScript/issues/5479)) ([2704915](https://github.com/NativeScript/NativeScript/commit/2704915))
* **frame:** recreate frame if no cached one found on app resume [#5318](https://github.com/NativeScript/NativeScript/issues/5318) ([#5330](https://github.com/NativeScript/NativeScript/issues/5330)) ([9d7f0e5](https://github.com/NativeScript/NativeScript/commit/9d7f0e5))
* **frame:** root tabview with modal frame when suspend/resume app ([#5408](https://github.com/NativeScript/NativeScript/issues/5408)) ([2edef3d](https://github.com/NativeScript/NativeScript/commit/2edef3d))
* **image:** image aspect dimensions for ImageSource.fromAsset(...) ([#5556](https://github.com/NativeScript/NativeScript/issues/5556)) ([7506905](https://github.com/NativeScript/NativeScript/commit/7506905))
* **image-source:** Fix test for base64 image source for android API 26 ([#4741](https://github.com/NativeScript/NativeScript/issues/4741)) ([1171da2](https://github.com/NativeScript/NativeScript/commit/1171da2))
* **image-source:** throw if source is not a correct native instance ([#5273](https://github.com/NativeScript/NativeScript/issues/5273)) ([58d61ca](https://github.com/NativeScript/NativeScript/commit/58d61ca))
* **image:** apply tintColor correctly on iOS ([#5546](https://github.com/NativeScript/NativeScript/issues/5546)) ([75ee84c](https://github.com/NativeScript/NativeScript/commit/75ee84c))
* **inspector:** Fix --debug-brk issue with Inspector ([#5460](https://github.com/NativeScript/NativeScript/issues/5460)) ([0b34e67](https://github.com/NativeScript/NativeScript/commit/0b34e67))
* **iOS:** image._setColorTint is not a function fix ([465b5bf](https://github.com/NativeScript/NativeScript/commit/465b5bf))
* **ios-action-bar:** enable NavigationButton text change on first navigation ([#5458](https://github.com/NativeScript/NativeScript/issues/5458)) ([b878143](https://github.com/NativeScript/NativeScript/commit/b878143))
* **ios-action-bar:** NavigationButton cannot be hidden if navigating with transition ([#5451](https://github.com/NativeScript/NativeScript/issues/5451)) ([c54e069](https://github.com/NativeScript/NativeScript/commit/c54e069))
* **ios-frame:** do not update backstack when navigating the same page ([#5426](https://github.com/NativeScript/NativeScript/issues/5426)) ([714af6b](https://github.com/NativeScript/NativeScript/commit/714af6b))
* **layouts:** Set automaticallyAdjustsScrollViewInsets ([#5311](https://github.com/NativeScript/NativeScript/issues/5311)) ([b492996](https://github.com/NativeScript/NativeScript/commit/b492996))
* **livesync:** attach __onLiveSyncCore to global object ([#4215](https://github.com/NativeScript/NativeScript/issues/4215)) ([90a0da2](https://github.com/NativeScript/NativeScript/commit/90a0da2))
* **minor:** reword missing-xml-error to be clearer ([#4947](https://github.com/NativeScript/NativeScript/issues/4947)) ([374f31c](https://github.com/NativeScript/NativeScript/commit/374f31c))
* **profiling:** resetProfiles doesn't reset all profiles ([#5425](https://github.com/NativeScript/NativeScript/issues/5425)) ([68d86fb](https://github.com/NativeScript/NativeScript/commit/68d86fb))
* **slider:** correct maxValue setter for android  ([#4346](https://github.com/NativeScript/NativeScript/issues/4346)) ([6184338](https://github.com/NativeScript/NativeScript/commit/6184338)), closes [#4343](https://github.com/NativeScript/NativeScript/issues/4343)
* **style:** Styles are not applied to dialogs ([#5612](https://github.com/NativeScript/NativeScript/issues/5612)) ([38e6f66](https://github.com/NativeScript/NativeScript/commit/38e6f66))
* **style-scope:** remove isFileOrResourcePath check ([5746dc5](https://github.com/NativeScript/NativeScript/commit/5746dc5))
* **text:** Allow -1 to be a valid binding value for text views ([#5563](https://github.com/NativeScript/NativeScript/issues/5563)) ([7cd8e7e](https://github.com/NativeScript/NativeScript/commit/7cd8e7e)), closes [#5559](https://github.com/NativeScript/NativeScript/issues/5559)
* **uilabel:** line height setter should not break line break mode ([#5544](https://github.com/NativeScript/NativeScript/issues/5544)) ([75bd1d2](https://github.com/NativeScript/NativeScript/commit/75bd1d2))
* **webpack:** fix fragment css not being applied with webpack ([#5172](https://github.com/NativeScript/NativeScript/issues/5172)) ([60773e7](https://github.com/NativeScript/NativeScript/commit/60773e7))
* **webpack:** register wrap layout ([#5573](https://github.com/NativeScript/NativeScript/issues/5573)) ([0012bfd](https://github.com/NativeScript/NativeScript/commit/0012bfd))
* **xml parser:** Fix text node data event. ([67cfab2](https://github.com/NativeScript/NativeScript/commit/67cfab2))
* **xml parser:** Handle whitespace around attribute = ([2a2c0e5](https://github.com/NativeScript/NativeScript/commit/2a2c0e5))
* ActionItems lacks proper support for VoiceOver on iOS ([#2796](https://github.com/NativeScript/NativeScript/issues/2796)) ([#2799](https://github.com/NativeScript/NativeScript/issues/2799)) ([37d927b](https://github.com/NativeScript/NativeScript/commit/37d927b))
* ActionBar's title not updating in OnLoaded event ([1d63103](https://github.com/NativeScript/NativeScript/commit/1d63103))
* add css-agent declarations ([#4361](https://github.com/NativeScript/NativeScript/issues/4361)) ([c62e79e](https://github.com/NativeScript/NativeScript/commit/c62e79e))
* add dom-node declarations ([#4359](https://github.com/NativeScript/NativeScript/issues/4359)) ([08af2ef](https://github.com/NativeScript/NativeScript/commit/08af2ef))
* cleanup modaltest paths ([#5300](https://github.com/NativeScript/NativeScript/issues/5300)) ([8d59cc4](https://github.com/NativeScript/NativeScript/commit/8d59cc4))
* DatePicker month off by 1 in Android ([#4872](https://github.com/NativeScript/NativeScript/issues/4872)) ([1e47117](https://github.com/NativeScript/NativeScript/commit/1e47117))
* Fix scroll-view tests for ios 9 and 10 ([#5358](https://github.com/NativeScript/NativeScript/issues/5358)) ([464cdd5](https://github.com/NativeScript/NativeScript/commit/464cdd5))
* layoutParent crash with ProxyViewContainer ([#5315](https://github.com/NativeScript/NativeScript/issues/5315)) ([923d48b](https://github.com/NativeScript/NativeScript/commit/923d48b))
* Navigation test app added ([4d23e37](https://github.com/NativeScript/NativeScript/commit/4d23e37))
* Require core modules used for inspector lazily ([#4977](https://github.com/NativeScript/NativeScript/issues/4977)) ([0fe1806](https://github.com/NativeScript/NativeScript/commit/0fe1806))
* set default values to time widgets ([#4383](https://github.com/NativeScript/NativeScript/issues/4383)) ([14098d4](https://github.com/NativeScript/NativeScript/commit/14098d4))
* set tns-core-modules-widgets to 4.0.0 ([eff264e](https://github.com/NativeScript/NativeScript/commit/eff264e))
* throw if global css file is not found in webpack context ([#5186](https://github.com/NativeScript/NativeScript/issues/5186)) ([9ce0819](https://github.com/NativeScript/NativeScript/commit/9ce0819))
* typo on android utils, getPalleteColor to getPaletteColor ([#4687](https://github.com/NativeScript/NativeScript/issues/4687)) ([7b36461](https://github.com/NativeScript/NativeScript/commit/7b36461))
* uuid for ios changed on IOS v7 ([#4681](https://github.com/NativeScript/NativeScript/issues/4681)) ([92471c6](https://github.com/NativeScript/NativeScript/commit/92471c6))



### Features

* **navigation:** Flexible Frame Composition ([#48](https://github.com/NativeScript/NativeScript/issues/48))
* **angular xml:** Support [prop] and (tap) bindings ([fdd8c9b](https://github.com/NativeScript/NativeScript/commit/fdd8c9b))
* **frame:** handle back navigation when common layout is used as a root element ([#5608](https://github.com/NativeScript/NativeScript/issues/5608)) ([70f0112](https://github.com/NativeScript/NativeScript/commit/70f0112))
* **frame:** rework frame retrieval api ([#5527](https://github.com/NativeScript/NativeScript/issues/5527)) ([dfa70dd](https://github.com/NativeScript/NativeScript/commit/dfa70dd))
* **ios:** fire onDisplayed event when first frame is ready to be displayed ([#5344](https://github.com/NativeScript/NativeScript/issues/5344)) ([1c78e47](https://github.com/NativeScript/NativeScript/commit/1c78e47))
* **ios-image-source:** standardize quality scale in image-source  ([#5517](https://github.com/NativeScript/NativeScript/issues/5517)) ([319c153](https://github.com/NativeScript/NativeScript/commit/319c153)), closes [#5474](https://github.com/NativeScript/NativeScript/issues/5474)
* **ios-list-view:** introduce iosEstimatedRowHeight property. ([#5568](https://github.com/NativeScript/NativeScript/issues/5568)) ([52c0448](https://github.com/NativeScript/NativeScript/commit/52c0448))
* **listview:** add required interface for generalized list-view component ([#5524](https://github.com/NativeScript/NativeScript/issues/5524)) ([b29f04f](https://github.com/NativeScript/NativeScript/commit/b29f04f))
* **modal:** introduce stretched param to showModal method ([#5496](https://github.com/NativeScript/NativeScript/issues/5496)) ([0138873](https://github.com/NativeScript/NativeScript/commit/0138873))
* **observable:** Implement observable .once ([#5309](https://github.com/NativeScript/NativeScript/issues/5309)) ([2166d1e](https://github.com/NativeScript/NativeScript/commit/2166d1e))
* **style-scope:** Resolve css sheets from tns_modules ([414ebc6](https://github.com/NativeScript/NativeScript/commit/414ebc6))
* **tab-view-android:** enable tabs positioning at the bottom ([#5385](https://github.com/NativeScript/NativeScript/issues/5385)) ([f8dce08](https://github.com/NativeScript/NativeScript/commit/f8dce08))
* **view:** expose method for android back override ([#5537](https://github.com/NativeScript/NativeScript/issues/5537)) ([cf8dcfa](https://github.com/NativeScript/NativeScript/commit/cf8dcfa))
* **webpack:** mark the CSS type for stylable views explicitly ([#5257](https://github.com/NativeScript/NativeScript/issues/5257)) ([1cbb1e8](https://github.com/NativeScript/NativeScript/commit/1cbb1e8))
* **xml parser:** Only allow angular syntax extensions if configured. ([748b4f1](https://github.com/NativeScript/NativeScript/commit/748b4f1))
* Add methods to get the root view and set a different root view at run time ([#5386](https://github.com/NativeScript/NativeScript/issues/5386)) ([b113b00](https://github.com/NativeScript/NativeScript/commit/b113b00))
* Add require.context typings ([#5156](https://github.com/NativeScript/NativeScript/issues/5156)) ([0986315](https://github.com/NativeScript/NativeScript/commit/0986315))
* Register ./app.css instead of app.css so it can be provided by webpack context ([#5158](https://github.com/NativeScript/NativeScript/issues/5158)) ([d356339](https://github.com/NativeScript/NativeScript/commit/d356339))
* support intent replacement in the android activity ([#5337](https://github.com/NativeScript/NativeScript/issues/5337)) ([01fab68](https://github.com/NativeScript/NativeScript/commit/01fab68))


### BREAKING CHANGES

* **ios-layout** Frame, Page and TabView measure/layout methods no longer used. We now rely on the iOS to position these controls. As a result width, height, minWidth, minHeight, margins won't be respected on these controls
* **ios-layout** Layouts for ViewContollers now implemented with UILayoutGuide (requires iOS 9)
* **tabview** TabViewItems are now loaded/unloaded on demand - when they will be displayed.
* **webpack:** Extending classes requires marking the derived class with @CSSType
The root classes are not marked with CSSType and classes derived from ViewBase and View
will continue to work as expected. More concrete view classes (Button, Label, etc.) are
marked with @CSSType now and store their cssType on the prototype suppressing the previous
implementation that looked up the class function name. So clien classes that derive from one of
our @CSSType decorated classes will now have to be marked with @CSSType.
* **android-images:** change decodeHeight/decodeWidth properties to accept device independent pixels by default
* **image-source:** Change the return type of `setNativeSource` method from `boolean` to `void`.



## 3.4.1 (2018, February 20)

### New
- [(# 5337)](https://github.com/NativeScript/NativeScript/pull/5337) Support intent replacement in the android activity
- [(# 5344))](https://github.com/NativeScript/NativeScript/pull/5344) (iOS) Fire onDisplayed event when first frame is ready to be displayed

## 3.4.0 (2017, December 20)

## Fixed
- [(# 5047)](https://github.com/NativeScript/NativeScript/pull/5047) Android: Click next moves the focus to next focusable TextField
- [(# 5046)](https://github.com/NativeScript/NativeScript/pull/5046) Android: Fix search-bar bug
- [(# 5019)](https://github.com/NativeScript/NativeScript/issues/5019) IOS: App crash on low memory notification with custom fonts
- [(# 4993)](https://github.com/NativeScript/NativeScript/issues/4993) ScrollView base: Adding listener when you are supposed to remove it

### New
- [(# 4871)](https://github.com/NativeScript/NativeScript/issues/4871) Application Settings blocks UI thread
- [(# 2992)](https://github.com/NativeScript/NativeScript/issues/2992) CSS background shorthand property


## 3.3.0 (2017, October 25)

### Fixed
- [(# 4959)](https://github.com/NativeScript/NativeScript/pull/4959) Android: a crash related to ConstantState drawable on API 23
- [(# 4950)](https://github.com/NativeScript/NativeScript/issues/4950) Android: a crash when application is suspended
- [(# 4897)](https://github.com/NativeScript/NativeScript/issues/4897) Android: Button listener missing owner
- [(# 4851)](https://github.com/NativeScript/NativeScript/issues/4851) Android: DatePicker shows wrong month
- [(# 4895)](https://github.com/NativeScript/NativeScript/issues/4895) Android: default page transtion in app.ts is not working for the initial page & breaks navigation
- [(# 4963)](https://github.com/NativeScript/NativeScript/pull/4963) IOS: fix missing borderRadius on Image
- [(# 4740)](https://github.com/NativeScript/NativeScript/issues/4740) IOS: Button:highlighted stops working after 2nd click
- [(# 4678)](https://github.com/NativeScript/NativeScript/issues/4678) ListView w/"itemTemplates" (multiple templates) cannot be used with TabView

### New
- [(# 4767)](https://github.com/NativeScript/NativeScript/pull/4767) [(# 4721)](https://github.com/NativeScript/NativeScript/pull/4721) [(# 4715)](https://github.com/NativeScript/NativeScript/pull/4715) CSS related optimizations
- [(# 4930)](https://github.com/NativeScript/NativeScript/pull/4930) Chrome DevTools Elements tab support
- [(# 4922)](https://github.com/NativeScript/NativeScript/pull/4922) Update platform declarations to iOS 11
- [(# 3076)](https://github.com/NativeScript/nativescript-cli/issues/3076) Setup scripts now support Silent Install mode


## 3.2.0 (2017, September 07)

### Fixed

- [(# 4728)](https://github.com/NativeScript/NativeScript/issues/4728) Android: A crash where some Drawables do not implement getConstantState
- [(# 4424)](https://github.com/NativeScript/NativeScript/issues/4424) Android: Slider's value does not work when maxValue set
- [(# 4230)](https://github.com/NativeScript/NativeScript/issues/4230) IOS: A crash when setting FontFamily to Font-Awesome on a Span
- [(# 4733)](https://github.com/NativeScript/NativeScript/issues/4733) IOS: A TextView scrolling and sizing issue
- [(# 4302)](https://github.com/NativeScript/NativeScript/issues/4302) IOS: Icon fonts does not work for TabViewItem
- [(# 4582)](https://github.com/NativeScript/NativeScript/issues/4582) IOS: Label with formatted text and theme classes crashes
- [(# 4138)](https://github.com/NativeScript/NativeScript/issues/4138) Cannot change TabView icon
- [(# 4419)](https://github.com/NativeScript/NativeScript/issues/4419) Debugger.js exception for HTTP requests with no Content-Type
- [(# 4650)](https://github.com/NativeScript/NativeScript/issues/4650) Image replacement is not respected during tns run android
- [(# 3963)](https://github.com/NativeScript/NativeScript/issues/3963) ListView multiple item templates do not work inside a TabView
- [(# 4647)](https://github.com/NativeScript/NativeScript/issues/4647) Rename utils.ad.getPalleteColor to getPaletteColor
- [(# 4725)](https://github.com/NativeScript/NativeScript/pull/4725) Remove ListView selected state when rowHeight is set

### New
- [(# 4808)](https://github.com/NativeScript/NativeScript/issues/4808) Android: Keep nativeViews when navigating forward
- [(# 4464)](https://github.com/NativeScript/NativeScript/issues/4464) Enable overlap for custom transitions
- [(# 2181)](https://github.com/NativeScript/NativeScript/issues/2181) Focus and blur events

## 3.1.1 (2017, August 08)

### Fixed
- [(# 4514)](https://github.com/NativeScript/NativeScript/issues/4514) IOS: Text/xml content type not treated as text
- [(# 4450)](https://github.com/NativeScript/NativeScript/issues/4450) IOS: TNS 3.1 breaks background-color through css binding
- [(# 4443)](https://github.com/NativeScript/NativeScript/issues/4443) IOS: Can't load local files in a WebView on device
- [(# 4415)](https://github.com/NativeScript/NativeScript/issues/4415) Style error when setting background after upgrading to NS 3
- [(# 4342)](https://github.com/NativeScript/NativeScript/issues/4342) Unable to change the fontWeight.
- [(# 4322)](https://github.com/NativeScript/NativeScript/issues/4322) Flashing border on scroll within ListView on Android when border-radius is applied
- [(# 4283)](https://github.com/NativeScript/NativeScript/issues/4283) IOS: ActionBar will appear broken when internet sharing bar is displayed
- [(# 4046)](https://github.com/NativeScript/NativeScript/issues/4046) Animating a view is broken and freezes the animated properties

### New
- [(# 4522)](https://github.com/NativeScript/NativeScript/issues/4522) Allow toggling of ScrollBar indicators on ScrollView
- [(# 2740)](https://github.com/NativeScript/NativeScript/issues/2740) Improved ActionBar CSS Support
- [(# 1664)](https://github.com/NativeScript/NativeScript/issues/1664) Implemented css line-height property

## 3.1.0 (2017, June 22)

### Fixed

- [(# 4147)](https://github.com/NativeScript/NativeScript/issues/4147) SearchBar style creates error
- [(# 4272)](https://github.com/NativeScript/NativeScript/issues/4272) SearchBar is not displayed on Android API 24
- [(# 4287)](https://github.com/NativeScript/NativeScript/issues/4287) Margin value with TextWrap overlapping problem
- [(# 4266)](https://github.com/NativeScript/NativeScript/issues/4266) IOS: Wrapped text in Button not properly centered
- [(# 3354)](https://github.com/NativeScript/NativeScript/issues/3354) IOS: TextView hint becomes text

### New

- [(# 3614)](https://github.com/NativeScript/NativeScript/issues/3614) TextField `maxLength` property support
- [(# 3957)](https://github.com/NativeScript/NativeScript/issues/3957) http.getFile(url) should strip query string from saved file name

## 3.0.1 (2017, May 23)

### Fixed

- [(# 4103)](https://github.com/NativeScript/NativeScript/issues/4103) A problem with base64 encoded images in Image element
- [(# 4143)](https://github.com/NativeScript/NativeScript/issues/4143) Background Image Failing
- [(# 4127)](https://github.com/NativeScript/NativeScript/issues/4127) Binding to 'bindingContext' of View is not working
- [(# 4015)](https://github.com/NativeScript/NativeScript/issues/4015) Crash: View already has a parent on Android 7.0 with Split screen + pageTransitions
- [(# 3747)](https://github.com/NativeScript/NativeScript/issues/3747) Images randomly get swapped on Android
- [(# 3960)](https://github.com/NativeScript/NativeScript/issues/3960) TabView with ScrollView and MapView crashes
- [(# 3983)](https://github.com/NativeScript/NativeScript/issues/3983) TextField: "0000" hint truncated to "0"
- [(# 4135)](https://github.com/NativeScript/NativeScript/issues/4135) TextField: If the secure property is true, the text property doesn't work properly
- [(# 4123)](https://github.com/NativeScript/NativeScript/issues/4123) Android: Pressing ENTER key from hardware keyboard in TextView throws an exception
- [(# 4109)](https://github.com/NativeScript/NativeScript/issues/4109) Android: Formatted string does not work if defined in XML
- [(# 4022)](https://github.com/NativeScript/NativeScript/issues/4022) Android: TabView & ScrollView causes crash on resume
- [(# 4175)](https://github.com/NativeScript/NativeScript/issues/4175) IOS: Switch not visible
- [(# 4141)](https://github.com/NativeScript/NativeScript/issues/4141) IOS: ActionBar will be hidden after closeCallback of modal page
- [(# 4157)](https://github.com/NativeScript/NativeScript/issues/4157) IOS: Hidden ActionBar will be shown by showModal()
- [(# 4151)](https://github.com/NativeScript/NativeScript/issues/4151) IOS: Layout will not update on modal page

## 3.0.0 (2017, May 03)

### BREAKING CHANGES

A full list of breaking changes could be found [here](https://github.com/NativeScript/NativeScript/blob/v3.0.0/Modules30Changes.md).

### Fixed
- [(# 3941)](https://github.com/NativeScript/NativeScript/issues/3941) JS: Error: Failed to apply property [color] ... Invalid color: inherit
- [(# 3898)](https://github.com/NativeScript/NativeScript/issues/3898) IOS: http-request header User-Agent always reports iOS 6
- [(# 3775)](https://github.com/NativeScript/NativeScript/issues/3775) IOS: Slide page transition causes "snap" behaviour
- [(# 3654)](https://github.com/NativeScript/NativeScript/issues/3654) IOS: Button text disappears with "swipe left" gesture
- [(# 3584)](https://github.com/NativeScript/NativeScript/issues/3584) IOS: TextView hint din't display numeric
- [(# 3221)](https://github.com/NativeScript/NativeScript/issues/3221) IOS: Applying class to secure TextField randomly change it's font-size
- [(# 3538)](https://github.com/NativeScript/NativeScript/issues/3538) Page navigation with whole page 'background-image' is very slow
- [(# 3153)](https://github.com/NativeScript/NativeScript/issues/3153) Out of Memory Issues still in 2.4
- [(# 3058)](https://github.com/NativeScript/NativeScript/issues/3058) Image is broken in Empty cases
- [(# 2985)](https://github.com/NativeScript/NativeScript/issues/2985) Listpicker width does not compute properly
- [(# 2724)](https://github.com/NativeScript/NativeScript/issues/2724) tns-platform-declarations 2.3.0 ERROR on build [iOS]
- [(# 2095)](https://github.com/NativeScript/NativeScript/issues/2095) declarations.*.d.ts files missing from published package

### New
- [(# 3889)](https://github.com/NativeScript/NativeScript/issues/3889) Add support for both 'focusLost' and 'textChanged' events for Text input (or) add a focusLost/blur Event
- [(# 3872)](https://github.com/NativeScript/NativeScript/issues/3872) Can't load a local HTML file with querystring via WebView.src (WebView.url works but is removed)
- [(# 3118)](https://github.com/NativeScript/NativeScript/issues/3118) Feature: New Dialog-Prompt-Input-Type for E-Mails
- [(# 3642)](https://github.com/NativeScript/NativeScript/issues/3642) BREAKING: Make typings compatible with DOM and Node typings

## 2.5.3 (2017, June 29)

### Fixed

- [(#4342)](https://github.com/NativeScript/NativeScript/issues/4342) Unable to change the fontWeight for both iOS and Android

## 2.5.2 (2017, March 21)

### Fixed

- [(#3790)](https://github.com/NativeScript/NativeScript/pull/3790) Fix a crash in Android tabview when resetting font property

- [(#3675)](https://github.com/NativeScript/NativeScript/pull/3675) Fix a crash when nesting a ProxyViewContainer in FlexboxLayout

## 2.5.1 (2017, February 16)

### Fixed

- [(#3565)](https://github.com/NativeScript/NativeScript/issues/3565) Fix a crash when ActionBar transparent background

## 2.5.0 (2017, February 1)

### Fixed

- [(#3270)](https://github.com/NativeScript/NativeScript/issues/3270) Android platform.screen.mainScreen props are not invalidated after orientation change

- [(#3232)](https://github.com/NativeScript/NativeScript/issues/3232) CSS support for separatorColor property of ListView

- [(#3220)](https://github.com/NativeScript/NativeScript/issues/3220) Background of the buttons inside dialog can be modified with CSS

- [(#3218)](https://github.com/NativeScript/NativeScript/issues/3218) ListPicker foreground color doesnt change

- [(#3215)](https://github.com/NativeScript/NativeScript/issues/3215) StackLayout isUserInteractionEnabled="false" value is not working

- [(#3210)](https://github.com/NativeScript/NativeScript/issues/3210) Segmentedbar crash using a number as title

- [(#3181)](https://github.com/NativeScript/NativeScript/issues/3181) Cursor position resets on toggling value of secure property of TextField on Android

- [(#3175)](https://github.com/NativeScript/NativeScript/issues/3175) Invalid value 500 for property fontWeight in XML

- [(#3172)](https://github.com/NativeScript/NativeScript/issues/3172) Pseudo selectors not applying when app resumes

- [(#3163)](https://github.com/NativeScript/NativeScript/issues/3163) Issue with WHxxx calculations on android / wrong files loaded

- [(#3147)](https://github.com/NativeScript/NativeScript/issues/3147) Setting `setTypeface()` to null object

- [(#3137)](https://github.com/NativeScript/NativeScript/issues/3137) Ripple effect lost on Segmented-Bar with selectedBackgroundColor

- [(#3129)](https://github.com/NativeScript/NativeScript/issues/3129) Modal dialogs don't have background color

- [(#3113)](https://github.com/NativeScript/NativeScript/issues/3113) Transparent border rendered as black

- [(#3111)](https://github.com/NativeScript/NativeScript/issues/3111) TextView new line closes virtual keyboard on Android

- [(#3098)](https://github.com/NativeScript/NativeScript/issues/3098) Connectivity module always return undefined on android <= 4.4

- [(#3064)](https://github.com/NativeScript/NativeScript/issues/3064) Setting automationText to a number crashes the app on Android

- [(#3060)](https://github.com/NativeScript/NativeScript/issues/3060) CSS clip-path rect() shape function implemented incorrectly

- [(#3007)](https://github.com/NativeScript/NativeScript/issues/3007) java.lang.NumberFormatException when applying clip-path with percentage values

- [(#2980)](https://github.com/NativeScript/NativeScript/issues/2980) FlexboxLayout flex shrink factor is not multiplied by the flex base size

- [(#2941)](https://github.com/NativeScript/NativeScript/issues/2941) Using IconFonts in ActionBar + navigation leeds to displaced icons

- [(#2870)](https://github.com/NativeScript/NativeScript/issues/2870) [iOS] ActionBar w/translucent navigationBar set to false is creating whitish transition

- [(#2815)](https://github.com/NativeScript/NativeScript/issues/2815) TabView.androidOffscreenTabLimit property

- [(#2672)](https://github.com/NativeScript/NativeScript/issues/2672) Erratic action bar transition when using bound (or empty) title property

- [(#2179)](https://github.com/NativeScript/NativeScript/issues/2179) iOS ActionBarItems overlapping before page load

- [(#2116)](https://github.com/NativeScript/NativeScript/issues/2116) setInterval callback is not fired while touch events are being processed

- [(#1869)](https://github.com/NativeScript/NativeScript/issues/1869) ActionBar icons in iOS (back, hamburger icon) with different height are "jumping" when changing the screens

- [(#1799)](https://github.com/NativeScript/NativeScript/issues/1799) ActionBar drop shadow lost with background-color

- [(#1639)](https://github.com/NativeScript/NativeScript/issues/1639) Custom components within other custom components: occasionally not loaded "in time" and ignoring css

### New

- [(#2736)](https://github.com/NativeScript/NativeScript/issues/2736) CSS support for styling status bar; backgroundColor added in ActionBarStyler

- [(#2693)](https://github.com/NativeScript/NativeScript/issues/2693) CSS clip-path `inset` shape

- [(#2689)](https://github.com/NativeScript/NativeScript/issues/2689) TabView.iosIconRenderingMode property

## 2.4.3 (2016, December 15)

- [(#3170)](https://github.com/NativeScript/NativeScript/pull/3170) Export set function for cssFile and resources

## 2.4.2 (2016, December 7)

- [(#3242)](https://github.com/NativeScript/NativeScript/issues/3242) Setting placeholder color on text field crashes is there is no hint

## 2.4.1 (2016, December 2)

- [(#3217)](https://github.com/NativeScript/NativeScript/pull/3217) Properly extend Error so message and stack appear in error activity

## 2.4.0 (2016, November 16)

### Fixed

- [(#2942)](https://github.com/NativeScript/NativeScript/issues/2942) ListView with TextField in the Item template not showing Keyboard on Portrait mode

- [(#2911)](https://github.com/NativeScript/NativeScript/issues/2911) CSS scale breaks background properties on iOS

- [(#2884)](https://github.com/NativeScript/NativeScript/issues/2884) Dialogs stop working in android after another activity is shown

- [(#2879)](https://github.com/NativeScript/NativeScript/issues/2879) Function get allTouches() is not working on iOS 10

- [(#2873)](https://github.com/NativeScript/NativeScript/issues/2873) CSS padding requires background-color in latest tns-core-modules on Android

- [(#2850)](https://github.com/NativeScript/NativeScript/issues/2850) [iOS only] Percentage margin of layouts not possible

- [(#2834)](https://github.com/NativeScript/NativeScript/issues/2834) Animations: scale() syntax does not support only one argument

- [(#2813)](https://github.com/NativeScript/NativeScript/issues/2813) The Camera module in Android doesn't handle permissions for you

- [(#2789)](https://github.com/NativeScript/NativeScript/issues/2789) CSS border-width causes text to overflow TextView

- [(#2781)](https://github.com/NativeScript/NativeScript/issues/2781) CSS border-color does not recognize rgb and rgba values

- [(#2751)](https://github.com/NativeScript/NativeScript/issues/2751) Camera module not working on IOS 10 (only in devices) / It hangs and exit the app

- [(#2742)](https://github.com/NativeScript/NativeScript/issues/2742) A failure in the modules on debugging with NativeScript inspector

- [(#2741)](https://github.com/NativeScript/NativeScript/issues/2741) Memory leak when using slide transition on Android (API Level 23)

- [(#2735)](https://github.com/NativeScript/NativeScript/issues/2735) Navigation is slow on Android with tns-core-modules version 2.3.0

- [(#2733)](https://github.com/NativeScript/NativeScript/issues/2733) [2.3.0] Image gets covered with color of Page color property

- [(#2714)](https://github.com/NativeScript/NativeScript/issues/2714) NativeScript IOS Apps Broadcast as iPad in UserAgent String EVEN on iPhone Using http.getJSON()

- [(#2712)](https://github.com/NativeScript/NativeScript/issues/2712) Memory leak in GridLayout on Page Navigation

- [(#2661)](https://github.com/NativeScript/NativeScript/issues/2661) Styling ActionBar in css file carries over to other view

- [(#2596)](https://github.com/NativeScript/NativeScript/issues/2596) Cannot set View id to just a number

- [(#2571)](https://github.com/NativeScript/NativeScript/issues/2571) [Android] memory leak for Images

- [(#2460)](https://github.com/NativeScript/NativeScript/issues/2460) Taking several picture leads to OutOfMemory Exeption

### New

- [(#3044)](https://github.com/NativeScript/NativeScript/issues/3044) FlexboxLayout CSS properties

- [(#2986)](https://github.com/NativeScript/NativeScript/issues/2986) Enhancement: Page Imports

- [(#2820)](https://github.com/NativeScript/NativeScript/issues/2820) ListView item template selector

- [(#2796)](https://github.com/NativeScript/NativeScript/issues/2796) ActionItems lacks proper support for VoiceOver on iOS

- [(#2739)](https://github.com/NativeScript/NativeScript/issues/2739) Feature Request: SegmentedBar CSS Support

- [(#2738)](https://github.com/NativeScript/NativeScript/issues/2738) Feature Request: Improved TabView CSS Support

- [(#2656)](https://github.com/NativeScript/NativeScript/issues/2656) TextField Line Color

- [(#2621)](https://github.com/NativeScript/NativeScript/issues/2621) Feature request: Add accessibility labels to views.

- [(#2608)](https://github.com/NativeScript/NativeScript/issues/2608) Move the camera module to a plugin

- [(#1763)](https://github.com/NativeScript/NativeScript/issues/1763) Default design/theme for the cross-platform UI. A-la Bootstrap?

- [(#1650)](https://github.com/NativeScript/NativeScript/issues/1650) Flexbox Layout support

- [(#699)](https://github.com/NativeScript/NativeScript/issues/699) Suggestion : Add image rotate left/right

- [(#50)](https://github.com/NativeScript/NativeScript/issues/50) Support for pseudo/state selectors in CSS

## 2.3.0 (2016, September 16)

### Fixed

- [(#2657)](https://github.com/NativeScript/NativeScript/pull/2657) Handle native instances with weak refs in transition closures

- [(#2615)](https://github.com/NativeScript/NativeScript/issues/2615) Button with text-decoration cannot change its text

- [(#2601)](https://github.com/NativeScript/NativeScript/issues/2601) Text color of the Button not applied, when `text-transform` has been set.

- [(#2591)](https://github.com/NativeScript/NativeScript/pull/2591) Label zero height issue fixed.

- [(#2586)](https://github.com/NativeScript/NativeScript/pull/2586) Fixed issue when bind to bindingContext and other property.

### New

- [(#2649)](https://github.com/NativeScript/NativeScript/issues/2649) ImageView CSS color property support

- [(#2593)](https://github.com/NativeScript/NativeScript/issues/2593) Content type with "+json" structured syntax suffix not parsed

- [(#2356)](https://github.com/NativeScript/NativeScript/issues/2356) Integrate the iOS .d.ts generator

- [(#712)](https://github.com/NativeScript/NativeScript/issues/712) Ability to style EditableTextBase's hint property

## 2.2.0 (2016, August 10)

### Fixed

- [(#2427)](https://github.com/NativeScript/NativeScript/pull/2427) Refactor application of text decoration, text transform, letter spacing and formatted text
- [(#2414)](https://github.com/NativeScript/NativeScript/pull/2414) CSS background-image on Label not loading in iOS
- [(#2413)](https://github.com/NativeScript/NativeScript/pull/2413) Multiple HTTP response headers not returned correctly on Android
- [(#2391)](https://github.com/NativeScript/NativeScript/pull/2391) App crash when editing text and text-view is removed
- [(#2362)](https://github.com/NativeScript/NativeScript/pull/2362) Multiple ScrollViews on one page fires scrollEvent simultaneously
- [(#2173)](https://github.com/NativeScript/NativeScript/pull/2173) iOS onSuspend + showModal() returning "Error: This value is not a native object"
- [(#2121)](https://github.com/NativeScript/NativeScript/pull/2121) The navigation bar duplicates when going to TabView's "More" tab

### New

- [(#2528)](https://github.com/NativeScript/NativeScript/issues/2528) Letter spacing in EM units
- [(#2457)](https://github.com/NativeScript/NativeScript/issues/2457) Feature Request - Nested Bindable Observables
- [(#1278)](https://github.com/NativeScript/NativeScript/issues/1278) TabView button icons (iOS)
- [(#734)](https://github.com/NativeScript/NativeScript/issues/734) Add API to retrieve the following standard user directories under iOS
- [(#731)](https://github.com/NativeScript/NativeScript/issues/731) NavigationEntry.bindingContext property

## 2.1.0 (2016, June 30)

### Fixed

- [(#2383)](https://github.com/NativeScript/NativeScript/pull/2383) android LayoutParams are not overridden

- [(#2372)](https://github.com/NativeScript/NativeScript/issues/2372) Custom title on Android fails with exception

- [(#2367)](https://github.com/NativeScript/NativeScript/pull/2367) Android 6.0+ sets activity intent extras by default which breaks application resume

- [(#2344)](https://github.com/NativeScript/NativeScript/pull/2344) Action bar doesn't handle events properly when a custom button

- [(#1655)](https://github.com/nativescript/nativescript/issues/1655) Added CSS not cascadded after screen is built

- [(#2310)](https://github.com/NativeScript/NativeScript/pull/2310) Sorting issue with Css Selectors with same specificity.

- [(#2301)](https://github.com/NativeScript/NativeScript/pull/2301) Updated webinspector interfaces

- [(#2299)](https://github.com/NativeScript/NativeScript/pull/2299) Binding converter calls.

- [(#2286)](https://github.com/NativeScript/NativeScript/pull/2286) Visual glitch with manual iOS transitions

- [(#2268)](https://github.com/NativeScript/NativeScript/pull/2268) Undefined can be set as localValue to dependency observable

- [(#2266)](https://github.com/NativeScript/NativeScript/pull/2266) Animation value sync issues

- [(#2263)](https://github.com/NativeScript/NativeScript/pull/2263) Crash when ListView is used in a modal dialog (Android).

- [(#2262)](https://github.com/NativeScript/NativeScript/pull/2262) Crash in action bar on iOS 9.3

- [(#2256)](https://github.com/NativeScript/NativeScript/issues/2256) Custom ActionItem gets displaced in iOS

- [(#2250)](https://github.com/NativeScript/NativeScript/pull/2250) Ignore the case when getting a response header

- [(#2240)](https://github.com/NativeScript/NativeScript/issues/2240) Possible regex issue with CSS class names

- [(#2225)](https://github.com/NativeScript/NativeScript/issues/2225) The exit transition of the current page is not played when navigating with clearHistory.

- [(#2220)](https://github.com/NativeScript/NativeScript/pull/2220) Close current modal page on livesync

- [(#2209)](https://github.com/NativeScript/NativeScript/issues/2209) CSS-Animation w/ iteration-count:infinite is never reset causing OutOfMemory error

- [(#2191)](https://github.com/NativeScript/NativeScript/pull/2191) SegmentedBar unbound items not firing selectedIndex change events

- [(#2177)](https://github.com/NativeScript/NativeScript/issues/2177) iOS CSS Animation rotate() do not reset the value after 360 degrees rotation

- [(#2161)](https://github.com/NativeScript/NativeScript/issues/2161) TranslateX and Animate in iOS strange behaviour on 2.0

- [(#2151)](https://github.com/NativeScript/NativeScript/issues/2151) Add z-index to the public API

- [(#2053)](https://github.com/NativeScript/NativeScript/issues/2053) WebView still visible in chrome://inspect after page is destroyed

- [(#1948)](https://github.com/NativeScript/NativeScript/issues/1948) Navigation stops working after navigating with clearHistory and a transition

- [(#1899)](https://github.com/NativeScript/NativeScript/issues/1899) Android layerType should not be changed if there is no need

- [(#1807)](https://github.com/NativeScript/NativeScript/issues/1807) SearchBar.textFieldHintColor not respected on iOS

- [(#1425)](https://github.com/NativeScript/NativeScript/issues/1425) Images have margin when added to Layout

### New

- [(#1563)](https://github.com/NativeScript/NativeScript/issues/1563) Enable modules snapshot for Android

- [(#2339)](https://github.com/NativeScript/NativeScript/pull/2339) Implement the BorderDrawable class used in background.android.ts in Java

- [(#2322)](https://github.com/NativeScript/NativeScript/pull/2322) Added support for debugging TypeScript in WebInspector

- [(#2307)](https://github.com/NativeScript/NativeScript/pull/2307) Modules won't call android requestLayout anymore. Android will handle its layout when needed

- [(#2304)](https://github.com/NativeScript/NativeScript/pull/2304) Rename com.tns.Async.xxx to org.nativescript.widgets.Async.xxx

- [(#2298)](https://github.com/NativeScript/NativeScript/pull/2298) Move UILableImpl as TNSLabel in widgets.

- [(#2288)](https://github.com/NativeScript/NativeScript/pull/2288) Decouple Fragment implementation logic from the Extend call.

- [(#2271)](https://github.com/NativeScript/NativeScript/pull/2271) Extract the Activity implementation logic in a separate class.

- [(#2270)](https://github.com/NativeScript/NativeScript/pull/2270) Avoid excessive requestLayout calls

- [(#2269)](https://github.com/NativeScript/NativeScript/pull/2269) Label won't requestLayout when its text is changed if it has fixed size

- [(#2260)](https://github.com/NativeScript/NativeScript/pull/2260) Optimized DependencyObject setValue performance

- [(#2244)](https://github.com/NativeScript/NativeScript/pull/2244) Remove the android.app.Application extend from the core modules

- [(#2217)](https://github.com/NativeScript/NativeScript/issues/2217) Enable hardware acceleration for views animations in Android.

- [(#2198)](https://github.com/NativeScript/NativeScript/pull/2198) Image won't requestLayout when measured with 'exactly' spec

- [(#2174)](https://github.com/NativeScript/NativeScript/pull/2174) ListView views will apply CSS once per view.

- [(#2144)](https://github.com/NativeScript/NativeScript/issues/2144) Performance improvements



## 2.0.1 (2016, May 18)

### Fixed

- [(#2133)](https://github.com/NativeScript/NativeScript/pull/2133) Removed unnecessary view state creation.

- [(#2126)](https://github.com/NativeScript/NativeScript/pull/2126) zIndex fixed for Android buttons

- [(#2113)](https://github.com/NativeScript/NativeScript/issues/2113) Panning gesture in Android creates non-smooth delta coordinates.

- [(#2100)](https://github.com/NativeScript/NativeScript/pull/2100) Fix navigatedFrom event raised when Activity is destroyed without act…

- [(#2099)](https://github.com/NativeScript/NativeScript/pull/2099) Typo in Pointer.getY method for iOS

- [(#2084)](https://github.com/NativeScript/NativeScript/issues/2084) App crashes when animating ActionBar

- [(#2077)](https://github.com/NativeScript/NativeScript/issues/2077) Animations not working in 2.0.0 on android?

- [(#2076)](https://github.com/NativeScript/NativeScript/issues/2076) 2.0 Corrupted navigation stack

- [(#2062)](https://github.com/NativeScript/NativeScript/issues/2062) Cannot change the iOS status bar text color since 2.0

### New

- [(#2108)](https://github.com/NativeScript/NativeScript/pull/2108) Add Method to see if camera is available

- [(#2102)](https://github.com/NativeScript/NativeScript/pull/2102) clip-path support added

## 2.0.0 (2016, April 27)

### Fixed

- [(#2018)](https://github.com/NativeScript/NativeScript/issues/2018) Bold and italic do not work on Android when no font family is specified

- [(#1982)](https://github.com/NativeScript/NativeScript/issues/1982) UI not updated when propertyChange event of Observable is raised

- [(#1963)](https://github.com/NativeScript/NativeScript/issues/1963) Default SegmentedBar items to textwrap false, expose option to configure

- [(#1958)](https://github.com/NativeScript/NativeScript/issues/1958) Animate iterations property counts -1 on iOS when value is => 2

- [(#1916)](https://github.com/NativeScript/NativeScript/issues/1916) TimePicker minHour, maxHour are throwing exception when hour is out of their range

- [(#1912)](https://github.com/NativeScript/NativeScript/issues/1912) Text-transform not applied on text property change (label, button, etc.)

- [(#1905)](https://github.com/NativeScript/NativeScript/issues/1905) Visual states not working properly when the animation is canceled in Android

- [(#1902)](https://github.com/NativeScript/NativeScript/issues/1902) CSS text properties not applying on button when no other text element is used in page

- [(#1893)](https://github.com/NativeScript/NativeScript/issues/1893) CSS animations from the application-wide .css file do not aply

- [(#1887)](https://github.com/NativeScript/NativeScript/issues/1887) Parent directory not created by file-system.File.fromPath()

- [(#1878)](https://github.com/NativeScript/NativeScript/issues/1878) Multiple actionView items do not handle tap event correctly

- [(#1864)](https://github.com/NativeScript/NativeScript/issues/1864) Generic font families should use system fonts on iOS

- [(#1859)](https://github.com/NativeScript/NativeScript/issues/1859) CSS text-transform is not correctly applied in a virtualized ListView

- [(#1822)](https://github.com/NativeScript/NativeScript/issues/1822) verticalAlignment "middle" and "center" crash the app on Android

- [(#1820)](https://github.com/NativeScript/NativeScript/issues/1820) All topmost().navigate instances stop working after AdMob interstitial close

- [(#1813)](https://github.com/NativeScript/NativeScript/issues/1813) Add ability to set attributed text on button

- [(#1809)](https://github.com/NativeScript/NativeScript/issues/1809) Unable to show dialog from a modal page

- [(#1794)](https://github.com/NativeScript/NativeScript/issues/1794) Update TextBase/Button `text` property when `formattedText` changes

- [(#1792)](https://github.com/NativeScript/NativeScript/issues/1792) NSRangeException when typing in a TextField with formatted text

- [(#1788)](https://github.com/NativeScript/NativeScript/issues/1788) Difference in jpg resource syntax on iOS/Android

- [(#1787)](https://github.com/NativeScript/NativeScript/issues/1787) Going back with the stock "Back" button on iOS always animates the transition

- [(#1776)](https://github.com/NativeScript/NativeScript/issues/1776) Swipe back not working since 1.6

- [(#1775)](https://github.com/NativeScript/NativeScript/issues/1775) Using RGBA in CSS

- [(#1772)](https://github.com/NativeScript/NativeScript/issues/1772) Unable to open a page with FormattedText on iOS

- [(#1770)](https://github.com/NativeScript/NativeScript/issues/1770) Color animations are broken on Android

- [(#1570)](https://github.com/NativeScript/NativeScript/issues/1570) 1.6 navigation events firing out of order

### New

- [(#1943)](https://github.com/NativeScript/NativeScript/issues/1943) Publish @next builds

- [(#1862)](https://github.com/NativeScript/NativeScript/issues/1862) Support for all font-weight CSS values with the best mapping possible

- [(#1760)](https://github.com/NativeScript/NativeScript/issues/1760) Add public instance methods to View class for getting locations and sizes

- [(#1757)](https://github.com/NativeScript/NativeScript/issues/1757) Support letter-spacing property in CSS

- [(#1686)](https://github.com/NativeScript/NativeScript/issues/1686) Allow updates to application CSS

- [(#1660)](https://github.com/NativeScript/NativeScript/issues/1660) Feature request: Add CSS ability for other properties

- [(#1608)](https://github.com/NativeScript/NativeScript/issues/1608) Add support for CSS 3 animations and transitions

- [(#1451)](https://github.com/NativeScript/NativeScript/issues/1451) Enable Android 6 way for requesting permissions

- [(#828)](https://github.com/NativeScript/NativeScript/issues/828) Create a 'source'-like property on the View class for debugging

- [(#515)](https://github.com/NativeScript/NativeScript/issues/515) CSS style property "z-index"

## 1.7.1 (2016, March 22)

### Fixed

- [(#1614)](https://github.com/NativeScript/NativeScript/issues/1614) App crashes after a while leaving it open and re-selecting it on Android

## 1.7.0 (2016, March 16)

### Fixed

- [(#1737)](https://github.com/NativeScript/NativeScript/issues/1737) TypeError from fetch module due to no headers received

- [(#1721)](https://github.com/NativeScript/NativeScript/issues/1721) TextField returnPress event not working on Android

- [(#1695)](https://github.com/NativeScript/NativeScript/issues/1695) HTTP module does not support multiple headers with same name

- [(#1693)](https://github.com/NativeScript/NativeScript/issues/1693) "ui/frame".NavigationEntry.transitionAndroid is not supported

- [(#1692)](https://github.com/NativeScript/NativeScript/issues/1692) Apply visibility via binding fails [Android]

- [(#1691)](https://github.com/NativeScript/NativeScript/issues/1691) App crash if ActionBar includes an 'id' tag [Android]

- [(#1667)](https://github.com/NativeScript/NativeScript/issues/1667) Tap event does not fire when using codeFile in different directory

- [(#1631)](https://github.com/NativeScript/NativeScript/issues/1631) The dialogs.confirm throws exception when writing Angular 2 + {N} app

- [(#1624)](https://github.com/NativeScript/NativeScript/pull/1624) Fixed jumpy navigation between pages in iOS

- [(#1583)](https://github.com/NativeScript/NativeScript/pull/1583) Remove message escaping

- [(#1569)](https://github.com/NativeScript/NativeScript/issues/1569) Regression: back button breaks app on clearHistory: true (android)

- [(#1559)](https://github.com/NativeScript/NativeScript/issues/1559) Image rotation from camera

- [(#1543)](https://github.com/NativeScript/NativeScript/issues/1543) [Android] View._onDetached called twice when app is suspended

- [(#1389)](https://github.com/NativeScript/NativeScript/issues/1389) Frame navigate, while Android activity is paused, crash

- [(#1078)](https://github.com/NativeScript/NativeScript/issues/1078) FormattedText styling not working in iOS

### New

- [(#1602)](https://github.com/NativeScript/NativeScript/issues/1602) Request: AppSettings - clearAll

- [(#1488)](https://github.com/NativeScript/NativeScript/issues/1488) Ability to define a custom view in ActionItem

- [(#1330)](https://github.com/NativeScript/NativeScript/issues/1330) Allow NativeScript application to define different base class for activity and application

- [(#1267)](https://github.com/NativeScript/NativeScript/issues/1267) Implement icon font support for ActionBarItems

- [(#1076)](https://github.com/NativeScript/NativeScript/issues/1076) Feature request: Physics

- [(#704)](https://github.com/NativeScript/NativeScript/issues/704) Support of Px,rem


## 1.6.0 (2016, February 17)

### Breaking changes

- Up to v 1.6.0, the background drawable attribute of the buttons in Android was always replaced. To keep the consistency with the default platform-specific background, the attribute is not changed now and the button is only styled.

### Fixed

- [(#1534)](https://github.com/NativeScript/NativeScript/issues/1534) FileSystemAccess.fileExists returns true for directory as well

- [(#1524)](https://github.com/NativeScript/NativeScript/issues/1524) Label text="{{ anyField }}" should not print out "null" if the field is "null"

- [(#1520)](https://github.com/NativeScript/NativeScript/issues/1520) When using remote background images, positioning CSS properties ignored

- [(#1467)](https://github.com/NativeScript/NativeScript/pull/1467) Detect JSON response in XHR and auto-parse the response

- [(#1463)](https://github.com/NativeScript/NativeScript/issues/1463) fetch/XMLHttpRequest re-URL-encodes first % character in query string

- [(#1443)](https://github.com/NativeScript/NativeScript/issues/1443) Impossible to rotate 360 degrees on iOS

- [(#1426)](https://github.com/NativeScript/NativeScript/issues/1426) App crash when TabView has more than 5 items and different font-style

- [(#1415)](https://github.com/NativeScript/NativeScript/issues/1415) TabView crashes the app when "Don't keep activities" option is turned on

- [(#1405)](https://github.com/NativeScript/NativeScript/issues/1405) Complete app crash when tapping around a Textfield at times

- [(#1396)](https://github.com/NativeScript/NativeScript/pull/1396) Fixed bug in GridLayout

- [(#1381)](https://github.com/NativeScript/NativeScript/pull/1381) Fix originX/Y not applied when set before layout in Android

- [(#1371)](https://github.com/NativeScript/NativeScript/issues/1371) ListView Android bug and fix

- [(#1359)](https://github.com/NativeScript/NativeScript/issues/1359) Getting error when restore/opening minimized app first time after installation

- [(#1349)](https://github.com/NativeScript/NativeScript/issues/1349) FormattedText Span foregroundColor and backgroundColor cannot be set using known color

- [(#1340)](https://github.com/NativeScript/NativeScript/issues/1340) Remove global dependency from fetch library

- [(#1326)](https://github.com/NativeScript/NativeScript/pull/1326) Fix action-bar when app is put to background and restored (and Do not keep activities is TRUE)

- [(#1296)](https://github.com/NativeScript/NativeScript/issues/1296) Change Android button background method

- [(#1290)](https://github.com/NativeScript/NativeScript/issues/1290) ListView with rounded items cannot show the background of page

- [(#1280)](https://github.com/NativeScript/NativeScript/issues/1280) text-transform breaks child colors

- [(#1275)](https://github.com/NativeScript/NativeScript/issues/1275) ActionBar disappears when app closes with back button

- [(#1240)](https://github.com/NativeScript/NativeScript/issues/1240) Android 5.x: setting View.opacity (setAlpha) removes its background

- [(#1232)](https://github.com/NativeScript/NativeScript/issues/1232) WrapLayout crashes when itemWidth value is too high

- [(#1223)](https://github.com/NativeScript/NativeScript/issues/1223) Android image that has a complex background (i.e., with rounded corners) cannot animate opacity correctly

- [(#1218)](https://github.com/NativeScript/NativeScript/issues/1218) Setting and instantly animating a property fails for iOS

- [(#1177)](https://github.com/NativeScript/NativeScript/issues/1177) Alert dialog in SegmentedBar selectedIndexChanged event blocks navigation

- [(#1127)](https://github.com/NativeScript/NativeScript/issues/1127) Changing ActionBar title after page is loaded does not show the ActionBar

- [(#1123)](https://github.com/NativeScript/NativeScript/issues/1123) iOS: ActionBar covers the page

- [(#830)](https://github.com/NativeScript/NativeScript/issues/830) The border-radius on Android 4.4.4 (Samsung Tab) not applied to <Button>

- [(#758)](https://github.com/NativeScript/NativeScript/issues/758) The platformModule.device.language results are different in iOS and Android for the same language

- [(#659)](https://github.com/NativeScript/NativeScript/issues/659) Problem with iOS resizing when there is an activity running in background (active call, hotspot, etc.)

- [(#518)](https://github.com/NativeScript/NativeScript/issues/518) Allow ActionItems to be directly specified between the ActionBar opening and closing tags

### New

- [(#1433)](https://github.com/NativeScript/NativeScript/pull/1433) Binary sync read/write added

- [(#1429)](https://github.com/NativeScript/NativeScript/pull/1429) File download implemented

- [(#1366)](https://github.com/NativeScript/NativeScript/issues/1366) Export listeners/events for GestureStateType "began" and "ended"

- [(#1363)](https://github.com/NativeScript/NativeScript/issues/1363) Cross-platform animation-timing-function / easing

- [(#1357)](https://github.com/NativeScript/NativeScript/pull/1357) Frame.goBack can now accept an entry to navigate back to

- [(#1352)](https://github.com/NativeScript/NativeScript/issues/1352) Data URLs supported for Image object

- [(#1283)](https://github.com/NativeScript/NativeScript/issues/1283) Can't access args.object.page from ActionBar ActionItem tap event

- [(#1242)](https://github.com/NativeScript/NativeScript/issues/1242) Add Page `showingModally` event

- [(#1129)](https://github.com/NativeScript/NativeScript/issues/1129) Why are iOS modal animations disabled by default? Can we pass an option to enable it?

- [(#811)](https://github.com/NativeScript/NativeScript/issues/811) Page navigation transitions

- [(#733)](https://github.com/NativeScript/NativeScript/issues/733) Add API to open a file at a given path with the default application

- [(#714)](https://github.com/NativeScript/NativeScript/issues/714) Automation ids

- [(#709)](https://github.com/NativeScript/NativeScript/issues/709) API Stability Index (proposal)

- [(#520)](https://github.com/NativeScript/NativeScript/issues/520) XML declaration better error reporting for malformed attribute content

- [(#412)](https://github.com/NativeScript/NativeScript/issues/412) Feature request: support percentages for width and height

- [(#98)](https://github.com/NativeScript/NativeScript/issues/98) Support for advanced CSS selectors

## 1.5.2 (2016, January 27)

### Fixed

- [(#1447)](https://github.com/NativeScript/NativeScript/issues/1447) Application fails with Segmentation fault on iOS when using ScrollView

## 1.5.1 (2015, November 14)

### Fixed

- [(#1235)](https://github.com/NativeScript/NativeScript/issues/1235) ObservableArray does not raise its `change` event when its `length' property is set

- [(#1228)](https://github.com/NativeScript/NativeScript/pull/1228) URL with % fixed

- [(#1213)](https://github.com/NativeScript/NativeScript/issues/1213) Android build error when space exists in the folder

- [(#1186)](https://github.com/NativeScript/NativeScript/pull/1186) Fix currentEntry to return NavigationEntry instead of BackstackEntry

- [(#1179)](https://github.com/NativeScript/NativeScript/issues/1179) ListView doesn't seem to clear\reset

- [(#1168)](https://github.com/NativeScript/NativeScript/issues/1168) Alert with null value is not displayed

- [(#1160)](https://github.com/NativeScript/NativeScript/issues/1160) iOS: The image supplied to Label.backgroundImage is rendered upside down.

- [(#1149)](https://github.com/NativeScript/NativeScript/pull/1149) Correct TabView icon rendering mode

- [(#1142)](https://github.com/NativeScript/NativeScript/issues/1142) ObservableArray does not provide removed items through EventData when an UPDATE action occurs

- [(#1139)](https://github.com/NativeScript/NativeScript/issues/1139) Missing attributes in the NativeScript XSD schema

- [(#1018)](https://github.com/NativeScript/NativeScript/issues/1018) Using the background-position with negative values

- [(#754)](https://github.com/NativeScript/NativeScript/issues/754) The backgroundColor of a Label is not animatable in iOS

### New

- [(#1171)](https://github.com/NativeScript/NativeScript/issues/1171) Expose API to get the focus point of pinch gesture

- [(#1140)](https://github.com/NativeScript/NativeScript/issues/1140) Expose API for setting origin (a.k.a. pivot or anchor) point for view transformations

- [(#1136)](https://github.com/NativeScript/NativeScript/pull/1136) Add Template factory function and use it in the ui/builder, Repeater and ListView components

- [(#1109)](https://github.com/NativeScript/NativeScript/issues/1109) Min/Max and intervals values on date / time pickers

- [(#691)](https://github.com/NativeScript/NativeScript/issues/691) Visibility attribute on ActionItem element

- [(#685)](https://github.com/NativeScript/NativeScript/issues/685) Support CSS text-transform

- [(#501)](https://github.com/NativeScript/NativeScript/issues/501) Better XML declaration error reporting for non-existing element

## 1.5.0 (2015, November 24)

### Breaking changes
- The XML namespace (xmlns) of the validator XSD schema changed from
    `xmlns="http://www.nativescript.org/tns.xsd"` to
    `xmlns="http://schemas.nativescript.org/tns.xsd"`.
    For convenience, the file can now get downloaded via the [same URL](http://schemas.nativescript.org/tns.xsd).

### Fixed

- [(#1089)](https://github.com/NativeScript/NativeScript/pull/1089) HTTP toString will raise error if response cannot be converted to string

- [(#1082)](https://github.com/NativeScript/NativeScript/issues/1082) Null reference exception in view.android.setOnTouchListener method

- [(#1081)](https://github.com/NativeScript/NativeScript/pull/1081) File system writeTextSync will now unlock the file when it is done writing

- [(#1038)](https://github.com/NativeScript/NativeScript/issues/1038) WebView with HTML string source does not render on old Android

- [(#1028)](https://github.com/NativeScript/NativeScript/issues/1028) [iOS] SelectedIndex property of the TabView widget does not work

- [(#1021)](https://github.com/NativeScript/NativeScript/issues/1021) The page.loaded and page.navigatedTo events are fired twice on iOS

- [(#1019)](https://github.com/NativeScript/NativeScript/pull/1019) Search-bar color not applied correctly

- [(#1012)](https://github.com/NativeScript/NativeScript/issues/1012) TextField/TextView CSS color not applied to cursor

- [(#1010)](https://github.com/NativeScript/NativeScript/issues/1010) Slider CSS color/background-color support

- [(#1007)](https://github.com/NativeScript/NativeScript/issues/1007) When application.start() is called twice on iOS, a meaningful error should be thrown

- [(#1004)](https://github.com/NativeScript/NativeScript/issues/1004) ActivityIndicator CSS color support

- [(#1000)](https://github.com/NativeScript/NativeScript/issues/1000) Border radius is not working on Android API 17

- [(#998)](https://github.com/NativeScript/NativeScript/pull/998) WebView images now will be loaded correctly with base URL

- [(#993)](https://github.com/NativeScript/NativeScript/issues/993) CSS does not support new lowercase element names

- [(#990)](https://github.com/NativeScript/NativeScript/issues/990) Android 6 WebView onReceivedError

- [(#986)](https://github.com/NativeScript/NativeScript/issues/986) [iOS] The Switch widget does not show up on the page

- [(#973)](https://github.com/NativeScript/NativeScript/pull/973) iOS owner pattern changed to use WeakRef in order to prevent memory leaks

- [(#966)](https://github.com/NativeScript/NativeScript/issues/966) Observable emits two `propertyChange` events when created with JSON

- [(#963)](https://github.com/NativeScript/NativeScript/issues/963) Always set base URL in WebView

- [(#955)](https://github.com/NativeScript/NativeScript/pull/955) Gestures event arguments for Android fixed

- [(#941)](https://github.com/NativeScript/NativeScript/issues/941) global.ios missing (consistency)

- [(#940)](https://github.com/NativeScript/NativeScript/issues/940) ListView: inconsistency retrieving bindingContext in tap handler

- [(#936)](https://github.com/NativeScript/NativeScript/pull/936) Subsequent animation of transition and rotation or scale will appear jumpy in iOS

- [(#889)](https://github.com/NativeScript/NativeScript/issues/889) vertical-align CSS inconsistency

- [(#820)](https://github.com/NativeScript/NativeScript/issues/820) The x and y components of an Android translate or scale animation are not animated together when delay is specified

- [(#801)](https://github.com/NativeScript/NativeScript/issues/801) Chained animations lose state on iOS

- [(#789)](https://github.com/NativeScript/NativeScript/issues/789) Error in page navigating events order

- [(#781)](https://github.com/NativeScript/NativeScript/issues/781) iOS page.showModal platform inconsistancies & bugs

- [(#715)](https://github.com/NativeScript/NativeScript/issues/715) Frame crashes on app restore occasionally

- [(#642)](https://github.com/NativeScript/NativeScript/issues/642) Ability to style other native widgets

### New

- [(#1001)](https://github.com/NativeScript/NativeScript/pull/1001) Embed utility fonts: Awesome, Icons, etc.

- [(#1102)](https://github.com/NativeScript/NativeScript/issues/1102) Ability to specify an animation easing, i.e., curve in a platform-independent manner

- [(#1086)](https://github.com/NativeScript/NativeScript/pull/1086) This will now allow the dialog to call the resolve function when cancelled by clicking outside

- [(#1057)](https://github.com/NativeScript/NativeScript/issues/1057) Expose scroll event on ScrollView

- [(#1048)](https://github.com/NativeScript/NativeScript/issues/1048) Event for start/end of an event

- [(#1041)](https://github.com/NativeScript/NativeScript/issues/1041) Support binding for `class` property of views

- [(#1034)](https://github.com/NativeScript/NativeScript/issues/1034) Support CSS white-space: nowrap and normal

- [(#1020)](https://github.com/NativeScript/NativeScript/pull/1020) DatePicker and TimePicker stylers added

- [(#1014)](https://github.com/NativeScript/NativeScript/issues/1014) Button wrapText property

- [(#977)](https://github.com/NativeScript/NativeScript/issues/977) Smarter LiveSync

- [(#954)](https://github.com/NativeScript/NativeScript/pull/954) Added simple showModal() overload

- [(#926)](https://github.com/NativeScript/NativeScript/issues/926) Context as to whether a navigation was back or not

- [(#922)](https://github.com/NativeScript/NativeScript/issues/922) Feature request: add loading wheel to Dialogs module

- [(#875)](https://github.com/NativeScript/NativeScript/issues/875) CSS feature request: `text-decoration`

- [(#856)](https://github.com/NativeScript/NativeScript/issues/856) Android 6 support

- [(#849)](https://github.com/NativeScript/NativeScript/issues/849) Implement dismissSoftInput() for search-bar

- [(#841)](https://github.com/NativeScript/NativeScript/issues/841) Distribute TypeScript definitions

- [(#767)](https://github.com/NativeScript/NativeScript/issues/767) Change Android navigation and tabs title color

- [(#727)](https://github.com/NativeScript/NativeScript/issues/727) Provide a way to get a reference to the currently showing modal page instance

- [(#693)](https://github.com/NativeScript/NativeScript/issues/693) ListView - the position of the item after scroll down is not correct

- [(#597)](https://github.com/NativeScript/NativeScript/issues/597) Some complex properties are inconsistent with rest of API - discussion

- [(#551)](https://github.com/NativeScript/NativeScript/issues/551) Ship a verified image picker plugin

- [(#364)](https://github.com/NativeScript/NativeScript/issues/364) Ability to use built-in system icons on ActionBarItems

## 1.4.0 (2015, October 12)

### Fixed

- [(#904)](https://github.com/NativeScript/NativeScript/issues/904) Navigate clearHistory sometimes crashes Android with a null pointer exception

- [(#901)](https://github.com/NativeScript/NativeScript/issues/901) TypeError: using <Placeholder> example from docs

- [(#893)](https://github.com/NativeScript/NativeScript/pull/893) isLoaded is set before calling applyStyleFromScope

- [(#873)](https://github.com/NativeScript/NativeScript/issues/873) The Repeater is re-creating its children multiple times during initialization

- [(#867)](https://github.com/NativeScript/NativeScript/issues/867) The utils.ad.async method is not implemented

- [(#857)](https://github.com/NativeScript/NativeScript/issues/857) Android action dialog actions are not shown if message is provided

- [(#851)](https://github.com/NativeScript/NativeScript/issues/851) takePicture crashes iOS simulator

- [(#848)](https://github.com/NativeScript/NativeScript/issues/848) WebView loads local data with UTF-8

- [(#843)](https://github.com/NativeScript/NativeScript/issues/843) [iOS] Page is layouted as there is no NavigationBar

- [(#839)](https://github.com/NativeScript/NativeScript/pull/839) Page background now spans under ActionBar

- [(#837)](https://github.com/NativeScript/NativeScript/issues/837) Blank text attribute on SearchBar crashes app

- [(#835)](https://github.com/NativeScript/NativeScript/issues/835) iOS animations combining several affine transform properties set only the first property on our view after they finish

- [(#832)](https://github.com/NativeScript/NativeScript/pull/832) Transformations such as scale, translate, rotate won't be incorrectly affected by the layout

- [(#819)](https://github.com/NativeScript/NativeScript/issues/819) WebView check for http/https should be case insensitive

- [(#817)](https://github.com/NativeScript/NativeScript/issues/817) The timers.clearInterval doesn't work on Android

- [(#814)](https://github.com/NativeScript/NativeScript/issues/814) Ternary if and parenthesis makes UI not update

- [(#808)](https://github.com/NativeScript/NativeScript/issues/808) Segmentedbar selectedIndexChanged doesn't work

- [(#805)](https://github.com/NativeScript/NativeScript/issues/805) Missing console.dump on iOS...

- [(#793)](https://github.com/NativeScript/NativeScript/issues/793) Label.backgroundColor cannot be animated in iOS

- [(#790)](https://github.com/NativeScript/NativeScript/issues/790) Cannot use number values in EditableText's hint field

- [(#777)](https://github.com/NativeScript/NativeScript/issues/777) iOS Border-radius on Label

- [(#774)](https://github.com/NativeScript/NativeScript/issues/774) If an animation instance is played more than once, the same promise is resolved each time leading to unexpected results

- [(#772)](https://github.com/NativeScript/NativeScript/issues/772) Placeholder with an id attribute doesn't call creatingView handler

- [(#763)](https://github.com/NativeScript/NativeScript/issues/763) 1.3 - Cannot build new project due to missing App_Resources

- [(#759)](https://github.com/NativeScript/NativeScript/issues/759) Android animations that animate a property to its current value do not run

- [(#756)](https://github.com/NativeScript/NativeScript/issues/756) Add support for Nordic characters: "æøå"

- [(#744)](https://github.com/NativeScript/NativeScript/issues/744) iOS 9 issues

- [(#732)](https://github.com/NativeScript/NativeScript/issues/732) Closing an alert on the iPad crashes the whole app

- [(#605)](https://github.com/NativeScript/NativeScript/issues/605) Guard for "undefined" in Observables on and off

### New

- [(#890)](https://github.com/NativeScript/NativeScript/pull/890) Implement Page background option to span under status bar (iOS only)

- [(#766)](https://github.com/NativeScript/NativeScript/issues/766) Rename cssClass property to just class

- [(#740)](https://github.com/NativeScript/NativeScript/issues/740) Modules does not support iOS9

- [(#713)](https://github.com/NativeScript/NativeScript/issues/713) ReturnKeyType Listener

- [(#283)](https://github.com/NativeScript/NativeScript/issues/283) Cross-platform way to clear history

- [(#241)](https://github.com/NativeScript/NativeScript/issues/241) Set base URL in WebView to be able to load resources

### Breaking changes
-  [(#774)](https://github.com/NativeScript/NativeScript/issues/774) Animation class no longer has a **finished** property because an animation can be played multiple times. The **play** method now returns a new promise each time it is invoked. Use this to listen for the animation finishing or being cancelled. When upgrading to version 1.4.0 or above, simply remove **.finished** from your code.

**Old Code (JavaScript)**:
```JavaScript
animation1.play().finished.then(function () { console.log("Finished"); });
```
**New Code (JavaScript)**:
```JavaScript
animation1.play().then(function () { console.log("Finished"); });
```
**Old Code (TypeScript)**:
```JavaScript
animation1.play().finished.then(()=>console.log("Finished"));
```
**New Code (JavaScript)**:
```JavaScript
animation1.play().then(()=>console.log("Finished"));
```

## 1.3.0 (2015, September 16)

### Fixed

- [(#680)](https://github.com/NativeScript/NativeScript/issues/680) Fix dialogs module parameter positions and add title as optional parameter

- [(#667)](https://github.com/NativeScript/NativeScript/issues/667) Layout is not updated once Page is shown modally and layout is requested

- [(#654)](https://github.com/NativeScript/NativeScript/issues/654) Multiple gestures not working for Android

- [(#651)](https://github.com/NativeScript/NativeScript/issues/651) Using http getJSON never completes when response is not JSON

- [(#623)](https://github.com/NativeScript/NativeScript/issues/623) CSS inconsistency...

- [(#616)](https://github.com/NativeScript/NativeScript/issues/616) TitleView in ActionBar not taking full width in Android 5.1

- [(#613)](https://github.com/NativeScript/NativeScript/issues/613) WebView - support for loading local files

- [(#590)](https://github.com/NativeScript/NativeScript/issues/590) CSS not working on Repeater when bindingContext set on 'navigatingTo'

- [(#587)](https://github.com/NativeScript/NativeScript/issues/587) Animation promise in iOS may never be resolved nor rejected

- [(#581)](https://github.com/NativeScript/NativeScript/issues/581) HtmlView only for single line?

- [(#557)](https://github.com/NativeScript/NativeScript/issues/557) Handlebar syntax in view with comma breaks silently

- [(#540)](https://github.com/NativeScript/NativeScript/issues/540) The border-radius CSS property not applying properly to image on Android

- [(#537)](https://github.com/NativeScript/NativeScript/issues/537) FileSystemAccess.prototype.readText has an async interface, but is synchronous

- [(#535)](https://github.com/NativeScript/NativeScript/issues/535) Random exception when using http.getJSON()

- [(#513)](https://github.com/NativeScript/NativeScript/issues/513) Android backgroundColor animation is not gradual

- [(#508)](https://github.com/NativeScript/NativeScript/issues/508) iOS Page lack of a background screws the page transitions

- [(#411)](https://github.com/NativeScript/NativeScript/issues/411) Setting invalid value for CSS properties causes app to crash

- [(#408)](https://github.com/NativeScript/NativeScript/issues/408) ScrollView does not scroll

- [(#360)](https://github.com/NativeScript/NativeScript/issues/360) Changing wrap layout paddings and its view margins runtime causes a crash on iOS

### New

- [(#698)](https://github.com/NativeScript/NativeScript/issues/698) Implement events for the SegmentedBar similar to TabView

- [(#688)](https://github.com/NativeScript/NativeScript/issues/688) JSONP support for HTTP module

- [(#672)](https://github.com/NativeScript/NativeScript/issues/672) HtmlView doesn't open URLs

- [(#670)](https://github.com/NativeScript/NativeScript/issues/670) Add a cross-platform "openUrl"

- [(#634)](https://github.com/NativeScript/NativeScript/issues/634) Make SegmentedBarItem bindable

- [(#619)](https://github.com/NativeScript/NativeScript/issues/619) View.style is not consistent with Declarative UI .style property

- [(#615)](https://github.com/NativeScript/NativeScript/issues/615) View component consistancy

- [(#612)](https://github.com/NativeScript/NativeScript/issues/612) CSS @import: Make URL optional for local files

- [(#610)](https://github.com/NativeScript/NativeScript/issues/610) Hiding the ActionBar also hides the headers of a tab view

- [(#578)](https://github.com/NativeScript/NativeScript/issues/578) Add scrollToIndex method to ListView

- [(#558)](https://github.com/NativeScript/NativeScript/issues/558) Bind multiple events on one view

- [(#551)](https://github.com/NativeScript/NativeScript/issues/551) Implement an image picker

- [(#548)](https://github.com/NativeScript/NativeScript/issues/548) Expose public API controlling whether a Page should be added to the navigation backstack or not

- [(#541)](https://github.com/NativeScript/NativeScript/issues/541) Make TabViewItem properties data-bindable

- [(#530)](https://github.com/NativeScript/NativeScript/issues/530) Ability to set text size of searchBar

- [(#481)](https://github.com/NativeScript/NativeScript/issues/481) Support padding on TextField and Button elements

- [(#473)](https://github.com/NativeScript/NativeScript/issues/473) Add support for Notification Observers (iOS) and Broadcast Receivers (Android)

- [(#451)](https://github.com/NativeScript/NativeScript/issues/451) Improve the network stack

- [(#432)](https://github.com/NativeScript/NativeScript/issues/432) Expose all of the iOS UIApplicationDelegate methods as events in the application module

- [(#409)](https://github.com/NativeScript/NativeScript/issues/409) Support for modules that depend on Android AppCompat libraries

- [(#309)](https://github.com/NativeScript/NativeScript/issues/309) Support lower-case-dashed component declaration in the XML

- [(#305)](https://github.com/NativeScript/NativeScript/issues/305) Improve Android layout performance by reducing marshalling calls

- [(#255)](https://github.com/NativeScript/NativeScript/issues/255) Implement cross-platform animations support

- [(#169)](https://github.com/NativeScript/NativeScript/issues/169) Create a schema for the XML UI to enable IntelliSense inside AppBuilder and other IDEs

- [(#110)](https://github.com/NativeScript/NativeScript/issues/110) Add support for orientation changed event

- [(#69)](https://github.com/NativeScript/NativeScript/issues/69) Add rotate, translate & scale transforms properties on View

- [(#68)](https://github.com/NativeScript/NativeScript/issues/68) Create common UI module that includes most commonly used UI views


### Breaking changes
-  [(#473)](https://github.com/NativeScript/NativeScript/issues/473) The `application.ios.removeNotificationObserver` method now requires an observer instance to be supplied as the first argument. The observer instance is obtained from the `application.ios.addNotificationObserver` method:

```JavaScript
var observer = application.ios.addNotificationObserver(UIDeviceBatteryLevelDidChangeNotification,
    function (notification) {
        console.log(notification);
    });
application.ios.removeNotificationObserver(observer, UIDeviceBatteryLevelDidChangeNotification);
```

## 1.2.1 (2015, August 18)

### Fixed

- [(#575)](https://github.com/NativeScript/NativeScript/issues/575) Application crashes in Android when there is an ActionBar on the first page

- [(#576)](https://github.com/NativeScript/NativeScript/issues/576) The app.css now applied when there is page-specific CSS

## 1.2.0 (2015, July 24)

### New

- [(#393)](https://github.com/NativeScript/NativeScript/issues/393) Create application.android instance immediately and move all Android-specific events to application.android

- [(#391)](https://github.com/NativeScript/NativeScript/issues/391) Implement cancellable back button pressed for Android

- [(#304)](https://github.com/NativeScript/NativeScript/issues/304) Expose additional properties of NavBar/ActionBar

- [(#294)](https://github.com/NativeScript/NativeScript/issues/294) Add an optional fullscreen parameter to Page.showModal method

- [(#263)](https://github.com/NativeScript/NativeScript/issues/263) Provide per page option for manipulating NavigationBar

- [(#191)](https://github.com/NativeScript/NativeScript/issues/191) Extend the set of support CSS properties in {N}

### Fixed

- [(#423)](https://github.com/NativeScript/NativeScript/issues/423) Showing a modal page from another modal page results in error on iOS

- [(#422)](https://github.com/NativeScript/NativeScript/issues/422) Login dialog - iOS7: loginResult.userName returns password as a value instead of username

- [(#421)](https://github.com/NativeScript/NativeScript/issues/421) Page.showModal seems completely broken in iOS

- [(#406)](https://github.com/NativeScript/NativeScript/issues/406) Prompt dialog - iOS7: okButton returns result equal to false, cancelButton returns result equal to true

- [(#405)](https://github.com/NativeScript/NativeScript/pull/405) FPS module will now correctly count frames while scrolling in iOS

- [(#395)](https://github.com/NativeScript/NativeScript/issues/395) Using dialogs.action() causes app to crash on iPad

- [(#372)](https://github.com/NativeScript/NativeScript/issues/372) Simple location app doesn't perform until real GPS apps are also running

- [(#368)](https://github.com/NativeScript/NativeScript/issues/368) [Screen Builder] Model is not updated when an observable object property is used in two text fields

- [(#343)](https://github.com/NativeScript/NativeScript/issues/343) Not returning a view on the view parameter of the creatingView event handler of the placeholder crashes the application

- [(#322)](https://github.com/NativeScript/NativeScript/issues/322) Creating an observable by passing a JSON object in the constructor does not define the respective properties on the observable object instance

- [(#285)](https://github.com/NativeScript/NativeScript/issues/285) The `visibility` property inconsistent with CSS

- [(#270)](https://github.com/NativeScript/NativeScript/issues/270) BackgroundImage property does not respect the CornerRadius when set to Border

- [(#261)](https://github.com/NativeScript/NativeScript/issues/261) WebView crash when navigating back

### Breaking changes
-  [(#304)](https://github.com/NativeScript/NativeScript/issues/304) ActionBar/NavigationBar is now defined using the `page.actionBar` instead of `page.optionsMenu`. [See an example...](../ApiReference/ui/action-bar/HOW-TO.md)

### Known issues
-  ```tns debug ios``` command is not working. The workaround is to use ```tns debug ios --framework-path "__path to the iOS runtime__"```. A fix for this is coming in 1.2.1 which will be released the week of July 27th.

## 1.1.0 (2015, June 10)

### New
- [(#280)](https://github.com/NativeScript/NativeScript/issues/280) Change NativeActivity Pbase class in order to be compatible with Android runtime

- [(#244)](https://github.com/NativeScript/NativeScript/issues/244) Expose application-level events as real events [See an example...](https://github.com/NativeScript/NativeScript/blob/master/apps/tests/app/app.ts)

- [(#233)](https://github.com/NativeScript/NativeScript/issues/233) Application module event handlers are lacking in parameters [See an example...](https://github.com/NativeScript/NativeScript/blob/master/apps/tests/app/app.ts)

- [(#221)](https://github.com/NativeScript/NativeScript/pull/221) View parent exposed in itemLoading event

- [(#214)](https://github.com/NativeScript/NativeScript/pull/214) Repeater component added [Read more...](../cookbook/ui/repeater)

- [(#207)](https://github.com/NativeScript/NativeScript/pull/207) Optimizations

- [(#199)](https://github.com/NativeScript/NativeScript/issues/199) TabView.selectedIndexChanged event

- [(#184)](https://github.com/NativeScript/NativeScript/issues/184) Hint property for TextView

- [(#176)](https://github.com/NativeScript/NativeScript/issues/176) Implement navigatingTo, navigatedTo, navigatingFrom and navigatedFrom events on page

### Fixed
- [(#267)](https://github.com/NativeScript/NativeScript/issues/267) SegmentedBar CSS color not applied correctly when items are bound

- [(#257)](https://github.com/NativeScript/NativeScript/pull/257) Fix some crashes for ListView's iOS UITableView

- [(#242)](https://github.com/NativeScript/NativeScript/issues/242) Cannot attach gesture observer for more than one gesture (Android)

- [(#234)](https://github.com/NativeScript/NativeScript/issues/234) DatePicker and TimePicker property bindings do not work in Android 5.x

- [(#228)](https://github.com/NativeScript/NativeScript/issues/228) ListPicker for Android shows text after bound to an empty array

- [(#222)](https://github.com/NativeScript/NativeScript/issues/222) ListPicker showing number of items in list (Ticket938420)

- [(#196)](https://github.com/NativeScript/NativeScript/issues/196) Layout is incorrect after device rotation in iOS when there is navbar

- [(#193)](https://github.com/NativeScript/NativeScript/issues/193) Layout is broken when there is an optionsMenu on the first page in iOS

- [(#189)](https://github.com/NativeScript/NativeScript/issues/189) Changing `bindingContext` affects UI elements that has a binding to `bindingContext`

- [(#188)](https://github.com/NativeScript/NativeScript/issues/188) Remaining item when cleared page options menu in iOS

- [(#187)](https://github.com/NativeScript/NativeScript/issues/187) Custom source for UI element binding fails

- [(#186)](https://github.com/NativeScript/NativeScript/issues/186) Using object get property syntax for binding expressions

- [(#175)](https://github.com/NativeScript/NativeScript/issues/175) Implement weak event pattern on ListView (when bound to observable)


### Breaking changes
-  [(#242)](https://github.com/NativeScript/NativeScript/issues/242) View and GesturesObserver classes have some breaking changes related to gesture operations


## 1.0.0 (2015, April 29)

### New
* New options for camera module. Added a resizing options along with keep-aspect-ratio options. More information about how to use it can be found at the dedicated camera help article.
* First-file search order changed. Now package.json is searched first, then index.js and bootstrap.js is being searched last.

### Fixed
* Taking a full size picture in Android with NativeScript camera module.
* Pages no longer freeze on cancelling back-navigation via swipe gesture.
* Items having verticalAlignment set to center now have correct layout bounds.
* Camera for iOSs no longer throws a Null pointer error.
* iOS dialog OK button now appears last.

### Breaking changes
* `image-cache` now stores native image instances, i.e., `android.graphics.Bitmap` or `UIImage`.
* `Image.src` property is now of type `any` and can accept either a string containing an image url or a native image instance.
* Gesture-related enum values changed to start with a small letter in order to be consistent with all other enums within NativeScript. For example, "gesturesModule.GestureType.Tap" should be used like "gesturesModule.GestureType.tap".
* `knownEvents` modules within all UI controls are removed and replaced with a static string values. In that case, all possible events will be visible through the inheritance tree. These static strings have an `Event` suffix. Every place where `viewModule.knownEvents.loaded` is used should be changed to `viewModule.View.loadedEvent` or `pageModule.Page.loadedEvent`. This change is relevant to code-behind only (xml declaration will not be affected).

## 0.10.0 (2015, April 17)

### Fixed

### New

* In addition to binding converters introduced in version 0.42 static (global) place for most common converters is added. This place is named `application.resources`. More information about how to use it can be found in the special help topic: `Data binding`.

* Using plain objects (numbers, strings also an entire object) as binding context via `$value`. More information can be found at the dedicated `Data binding` help topic.

### Breaking changes

  * Image: `url` property renamed to `src`.
  * Image: `source` property renamed to `imageSource`.
  * TabView: `TabEntry` renamed to `TabViewItem`.
  * Module `local-settings` changed to `application-settings`. Only the name of the module is changed (API remains the same), hence the `require` statements must be updated, i.e., `require("local-settings")` should be changed to `require("application-settings")`.
