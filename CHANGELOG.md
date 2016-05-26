---
title: Modules Changelog
description: NativeScript Cross-Platform Modules Changelog
position: 4
slug: modules-changelog
publish: false
previous_url: /Changelogs/Cross-Platform Modules
---

Cross Platform Modules Changelog
==============================

##2.0.1 (2016, May 18)

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

##2.0.0 (2016, April 27)

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

##1.7.1 (2016, March 22)

### Fixed

- [(#1614)](https://github.com/NativeScript/NativeScript/issues/1614) App crashes after a while leaving it open and re-selecting it on Android

##1.7.0 (2016, March 16)

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


##1.6.0 (2016, February 17)

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

##1.5.2 (2016, January 27)

### Fixed

- [(#1447)](https://github.com/NativeScript/NativeScript/issues/1447) Application fails with Segmentation fault on iOS when using ScrollView

##1.5.1 (2015, November 14)

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

##1.5.0 (2015, November 24)

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

##1.4.0 (2015, October 12)

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

##1.3.0 (2015, September 16)

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

##1.2.1 (2015, August 18)

###Fixed

- [(#575)](https://github.com/NativeScript/NativeScript/issues/575) Application crashes in Android when there is an ActionBar on the first page

- [(#576)](https://github.com/NativeScript/NativeScript/issues/576) The app.css now applied when there is page-specific CSS

##1.2.0 (2015, July 24)

###New

- [(#393)](https://github.com/NativeScript/NativeScript/issues/393) Create application.android instance immediately and move all Android-specific events to application.android

- [(#391)](https://github.com/NativeScript/NativeScript/issues/391) Implement cancellable back button pressed for Android

- [(#304)](https://github.com/NativeScript/NativeScript/issues/304) Expose additional properties of NavBar/ActionBar

- [(#294)](https://github.com/NativeScript/NativeScript/issues/294) Add an optional fullscreen parameter to Page.showModal method

- [(#263)](https://github.com/NativeScript/NativeScript/issues/263) Provide per page option for manipulating NavigationBar

- [(#191)](https://github.com/NativeScript/NativeScript/issues/191) Extend the set of support CSS properties in {N}

###Fixed

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

##1.1.0 (2015, June 10)

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


##1.0.0 (2015, April 29)

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

##0.10.0 (2015, April 17)

### Fixed

### New

* In addition to binding converters introduced in version 0.42 static (global) place for most common converters is added. This place is named `application.resources`. More information about how to use it can be found in the special help topic: `Data binding`.

* Using plain objects (numbers, strings also an entire object) as binding context via `$value`. More information can be found at the dedicated `Data binding` help topic.

### Breaking changes

  * Image: `url` property renamed to `src`.
  * Image: `source` property renamed to `imageSource`.
  * TabView: `TabEntry` renamed to `TabViewItem`.
  * Module `local-settings` changed to `application-settings`. Only the name of the module is changed (API remains the same), hence the `require` statements must be updated, i.e., `require("local-settings")` should be changed to `require("application-settings")`.

