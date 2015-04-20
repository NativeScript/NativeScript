Cross Platform Modules Changelog
==============================

0.10.0 (2015, April 17)
==

### Fixed

### New

* In addition to binding converters introduced in version 0.42 static (global) place for most common converters is added. This place is named `application.resources`. More information how to use it can be found in the special help topic regarding `Data binding`.

* Using plain objects (numbers, strings also an entire object) as binding context via `$value`. More information can be found at the dedicated `Data binding` help topic.

### Breaking Changes

  * Image: `url` property renamed to `src`
  * Image: `source` property renamed to `imageSource`
  * TabView: `TabEntry` renamed to `TabViewItem `
  
1.0 (2015, May)
==

### Fixed

* Taking a full size picture in Android with NativeScript camera module.

### New

* New options for camera module. Added a resizing options along with keep-aspect-ratio options. More information about how to use it can be found at the dedicated camera help article.

### Breaking changes
