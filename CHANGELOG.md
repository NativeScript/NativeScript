Cross Platform Modules Changelog
==============================

1.0.0 (2015, April 29)

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

0.10.0 (2015, April 17)
==

### Fixed

### New

* In addition to binding converters introduced in version 0.42 static (global) place for most common converters is added. This place is named `application.resources`. More information how to use it can be found in the special help topic regarding `Data binding`.

* Using plain objects (numbers, strings also an entire object) as binding context via `$value`. More information can be found at the dedicated `Data binding` help topic.

### Breaking Changes

  * Image: `url` property renamed to `src`
  * Image: `source` property renamed to `imageSource`
  * TabView: `TabEntry` renamed to `TabViewItem`
  * Module `local-settings` changed to `application-settings`.Only the name of the module is changed (API remains the same), hence the `require` statements must be updated, i.e. `require("local-settings")` should be changed to `require("application-settings")`.
  
