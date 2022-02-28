## @nativescript/permissions

Android and iOS permission handling with NativeScript.

* `npm install @nativescript/permissions`

Inspired by [react-native-permissions](https://github.com/yonahforst/react-native-permissions)

## API

### Permissions statuses

Promises resolve into ```[status:Status, always:boolean]``` where status is one of these statuses:

| Return value   | Notes                                                                                                                                                                                                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `authorized`   | User has authorized this permission                                                                                                                                                                                                                                    |
| `denied`       | User has denied this permission at least once. On iOS this means that the user will not be prompted again. Android users can be prompted multiple times until they select 'Never ask me again'                                                                          |
| `limited`   | **iOS** - this means the permission is granted but with limitations                                                                                                                                                                                                    |
| `restricted`   | **iOS** - this means user is not able to grant this permission, either because it's not supported by the device or because it has been blocked by parental controls. **Android** - this means that the user has selected 'Never ask me again' while denying permission |
| `undetermined` | User has not yet been prompted with a permission dialog                                                                                                                                                                                                                |

### Supported permissions types

The current supported permissions are:

|                    | Type                | iOS | Android |
| ------------------ | ------------------- | --- | ------- |
| Location           | `location`          | ✔  | ✔       |
| Camera             | `camera`            | ✔  | ✔       |
| Microphone         | `microphone`        | ✔  | ✔       |
| Photos             | `photo`             | ✔  | ✔       |
| Contacts           | `contacts`          | ✔  | ✔       |
| Events             | `event`             | ✔  | ✔       |
| Bluetooth          | `bluetooth`         | ✔  | ✔(api >= 31)      |
| Reminders          | `reminder`          | ✔  | ❌      |
| Push Notifications | `notification`      | ✔  | ❌      |
| Background Refresh | `backgroundRefresh` | ✔  | ❌      |
| Speech Recognition | `speechRecognition` | ✔  | ❌      |
| Media Library      | `mediaLibrary`      | ✔  | ❌      |
| Motion Activity    | `motion`            | ✔  | ❌      |
| Storage            | `storage`           | ❌️ | ✔       |
| Phone Call         | `callPhone`         | ❌️ | ✔       |
| Read SMS           | `readSms`           | ❌️ | ✔       |
| Receive SMS        | `receiveSms`        | ❌️ | ✔       |
| Media Location        | `mediaLocation`        | ❌️ | ✔(api >= 29)       |
| Bluetooth Scan        | `bluetoothScan`        | ❌️ | ✔(api >= 31)       |
| Bluetooth Connect        | `bluetoothConnect`        | ❌️ | ✔(api >= 31)       |

### Methods

| Method Name         | Arguments | Notes                                                                                                                                                                                                                                                                            |
| ------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `check()`           | `type`    | - Returns a promise with the permission status. See iOS Notes for special cases                                                                                                                                                                                                  |
| `request()`         | `type`    | - Accepts any permission type except `backgroundRefresh`. If the current status is `undetermined`, shows the permission dialog and returns a promise with the resulting status. Otherwise, immediately return a promise with the current status. See iOS Notes for special cases |
| `checkMultiple()`   | `[types]` | - Accepts an array of permission types and returns a promise with an object mapping permission types to statuses                                                                                                                                                                 |
| `getTypes()`        | _none_    | - Returns an array of valid permission types                                                                                                                                                                                                                                     |
| `openSettings()`    | _none_    | - _(iOS only - 8.0 and later)_ Switches the user to the settings page of your app                                                                                                                                                                                                |
| `canOpenSettings()` | _none_    | - _(iOS only)_ Returns a boolean indicating if the device supports switching to the settings page                                                                                                                                                                                |

### iOS Notes

* Permission type `bluetooth` represents the status of the
  `CBPeripheralManager`. Don't use this if only need `CBCentralManager`
* Permission type `location` accepts a second parameter for `request()` and
  `check()`; the second parameter is a string, either `always` or `whenInUse`
  (default).
* Permission type `notification` accepts a second parameter for `request()`. The
  second parameter is an array with the desired alert types. Any combination of
  `alert`, `badge` and `sound` (default requests all three).
* iOS 12+: The second parameter also takes this type inside of the array `providesAppNotificationSettings`.
* If you are not requesting mediaLibrary then you can remove MediaPlayer.framework from the xcode project

```js
import { Permissions } from '@nativescript/permissions';

// example
Permissions.check('location', { type: 'always' }).then(response => {
  this.setState({ locationPermission: response[0] })
})

Permissions.request('location', { type: 'always' }).then(response => {
  this.setState({ locationPermission: response[0] })
})

Permissions.request('notification', { type: ['alert', 'badge'] }).then(
  response => {
    this.setState({ notificationPermission: response[0] })
  },
)
```

* You cannot request microphone permissions on the simulator.
* With Xcode 8, you now need to add usage descriptions for each permission you
  will request. Open Xcode ➜ `Info.plist` ➜ Add a key (starting with "Privacy -
  ...") with your kit specific permission.

Example: If you need Contacts permission you have to add the key `Privacy -
Contacts Usage Description`.

<img width="338" alt="3cde3b44-7ffd-11e6-918b-63888e33f983" src="https://cloud.githubusercontent.com/assets/1440796/18713019/271be540-8011-11e6-87fb-c3828c172dfc.png">

#### App Store submission disclaimer

If you need to submit you application to the AppStore, you need to add to your
`Info.plist` all `*UsageDescription` keys with a string value explaining to the
user how the app uses this data. **Even if you don't use them**.

So before submitting your app to the App Store, make sure that in your
`Info.plist` you have the following keys:

```xml
<key>NSBluetoothPeripheralUsageDescription</key>
<string>Some description</string>
<key>NSCalendarsUsageDescription</key>
<string>Some description</string>
<key>NSCameraUsageDescription</key>
<string>Some description</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>Some description</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>Some description</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Some description</string>
<key>NSSpeechRecognitionUsageDescription</key>
<string>Some description</string>
<key>NSAppleMusicUsageDescription</key>
<string>Some description</string>
<key>NSMotionUsageDescription</key>
<string>Some description</string>
```
This is required because during the phase of processing in the App Store
submission, the system detects that you app contains code to request the
permission `X` but don't have the `UsageDescription` key and then it rejects the
build.

> Please note that it will only be shown to the users the usage descriptions of
> the permissions you really require in your app.

You can find more information about this issue in #46.

### Android Notes

* `check` and `request` also allows you to directly pass android permission(s) as a value or an array. This would allow to request any new permission without a required update of this plugin
* All required permissions also need to be included in the `AndroidManifest.xml`
  file before they can be requested. Otherwise `request()` will immediately
  return `denied`.
* You can request write access to any of these types by also including the
  appropriate write permission in the `AndroidManifest.xml` file. Read more
  [here](https://developer.android.com/guide/topics/security/permissions.html#normal-dangerous).

* Permissions are automatically accepted for **targetSdkVersion < 23** but you
  can still use `check()` to check if the user has disabled them from Settings.

You might need to elevate the **targetSdkVersion** version in your
`build.gradle`:

```groovy
android {
  compileSdkVersion 23 // ← set at least 23
  buildToolsVersion "23.0.1"  // ← set at least 23.0.0

  defaultConfig {
    minSdkVersion 16
    targetSdkVersion 23 // ← set at least 23
    // ...
```

## Troubleshooting

#### Q: iOS - App crashes as soon as I request permission

> A: Starting with Xcode 8, you need to add permission descriptions. See iOS
> notes for more details. Thanks to [@jesperlndk](https://github.com/jesperlndk)
> for discovering this.

#### Q: iOS - App crashes when I change permission from settings

> A: This is normal. iOS restarts your app when your privacy settings change.
> Just google "iOS crash permission change"
