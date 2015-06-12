Cross Platform Modules Changelog
==============================

##1.1.0 (2015, June 10)

### New
- [(#280)](https://github.com/NativeScript/NativeScript/issues/280) Change NativeActivity Pbase class in order to be compatible with Android runtime

- [(#244)](https://github.com/NativeScript/NativeScript/issues/244) Expose application level events as real events. [See an example...](https://github.com/NativeScript/NativeScript/blob/master/apps/tests/app/app.ts)

- [(#233)](https://github.com/NativeScript/NativeScript/issues/233) Application module event handlers are lacking in parameters. [See an example...](https://github.com/NativeScript/NativeScript/blob/master/apps/tests/app/app.ts)

- [(#221)](https://github.com/NativeScript/NativeScript/pull/221) view parent exposed in itemLoading event

- [(#214)](https://github.com/NativeScript/NativeScript/pull/214) Repeater component added. [Read more...](https://github.com/NativeScript/docs/blob/master/layouts.md#repeating-layout-children)

- [(#207)](https://github.com/NativeScript/NativeScript/pull/207) Optimizations

- [(#199)](https://github.com/NativeScript/NativeScript/issues/199) TabView.selectedIndexChanged event

- [(#184)](https://github.com/NativeScript/NativeScript/issues/184) Hint property for TextView

- [(#176)](https://github.com/NativeScript/NativeScript/issues/176) Implement navigatingTo, navigatedTo, navigatingFrom and navigatedFrom events on Page

### Fixed
- [(#267)](https://github.com/NativeScript/NativeScript/issues/267) SegmentedBar CSS color not applied correctly when items are bound

- [(#257)](https://github.com/NativeScript/NativeScript/pull/257) Fix some crashes for ListView's iOS UITableView

- [(#242)](https://github.com/NativeScript/NativeScript/issues/242) Cannot attach gesture observer for more than one gesture (Android).

- [(#234)](https://github.com/NativeScript/NativeScript/issues/234) DatePicker and TimePicker property bindings do not work in Android 5.x

- [(#228)](https://github.com/NativeScript/NativeScript/issues/228) ListPicker for Android shows text after bound to an empty array.

- [(#222)](https://github.com/NativeScript/NativeScript/issues/222) ListPicker showing number of items in list (Ticket938420)

- [(#196)](https://github.com/NativeScript/NativeScript/issues/196) Layout is incorrect after device rotation in iOS when there is navbar

- [(#193)](https://github.com/NativeScript/NativeScript/issues/193) Layout is broken when there is optionsMenu on the first page in iOS

- [(#189)](https://github.com/NativeScript/NativeScript/issues/189) Changing `bindingContext` affects UI elements that has a binding to `bindingContext`.

- [(#188)](https://github.com/NativeScript/NativeScript/issues/188) Remaining item when cleared page options menu in ios.

- [(#187)](https://github.com/NativeScript/NativeScript/issues/187) Custom source for UI element binding fails.

- [(#186)](https://github.com/NativeScript/NativeScript/issues/186) Using object get property syntax for binding expressions

- [(#175)](https://github.com/NativeScript/NativeScript/issues/175) Implement weak-event pattern on ListView (when bound to observable)


### Breaking changes
-  [(#242)](https://github.com/NativeScript/NativeScript/issues/242) View and GesturesObserver classes have some breaking changes related to gesture operations


##1.0.0 (2015, April 29)

### New
* New options for camera module. Added a resizing options along with keep-aspect-ratio options. More information about how to use it can be found at the dedicated camera help article.
* First-file search order changed. Now package.json is searched first, then index.js and bootstrap.js is being searched last.

### Fixed
* Taking a full size picture in Android with NativeScript camera module.
* Pages no more freeze on cancelling back-navigation via swipe gesture
* Items having verticalAlignment set to center now have correct layout bounds
* Camera for ios no more throws a Null pointer error
* iOS dialog OK button now appears last

### Breaking changes
* `image-cache` now stores native image instances, i.e. `android.graphics.Bitmap` or `UIImage`. 
* `Image.src` property is now of type `any` and can accept either a string containing an image url or a native image instance.
* Gesture related enum values changed to start with a small letter in order to be consistent with all other enums within NativeScript. For example "gesturesModule.GestureType.Tap" should be used like "gesturesModule.GestureType.tap".
* `knownEvents` modules within all UI controls are removed and replaced with a static string values. In that case all possible events will be visible through the inheritance tree. These static strings have an `Event` suffix. At every place where `viewModule.knownEvents.loaded` is used should be changed to `viewModule.View.loadedEvent` or `pageModule.Page.loadedEvent`. This change is relevant to code-behind only (xml declaration will not be affected).

##0.10.0 (2015, April 17)

### Fixed

### New

* In addition to binding converters introduced in version 0.42 static (global) place for most common converters is added. This place is named `application.resources`. More information how to use it can be found in the special help topic regarding `Data binding`.

* Using plain objects (numbers, strings also an entire object) as binding context via `$value`. More information can be found at the dedicated `Data binding` help topic.

### Breaking Changes

  * Image: `url` property renamed to `src`
  * Image: `source` property renamed to `imageSource`
  * TabView: `TabEntry` renamed to `TabViewItem`
  * Module `local-settings` changed to `application-settings`.Only the name of the module is changed (API remains the same), hence the `require` statements must be updated, i.e. `require("local-settings")` should be changed to `require("application-settings")`.
  
