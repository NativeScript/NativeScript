---
nav-title: "application How-To"
title: "Application"
description: "Examples for using application"
---
# Application
The Application module provides abstraction over the platform-specific Application implementations.
It is the main BCL module and is required for other BCL modules to work properly.
The default bootstrap.js implementation for each platform loads and initializes this module.
<snippet id='application-require'/>

The pre-required `app` module is used throughout the following code snippets.
### Checking the target platform
Use the following code in case you need to check somewhere in your code the platform you are running against:
<snippet id='application-app-check'/>

### Using the Android-specific implementation
Accessing the Android-specific object instance (will be undefined if running on iOS)

<snippet id='application-app-android'/>

### Using the Android Application context
<snippet id='application-app-android-context'/>

### Tracking the current Activity
<snippet id='application-app-android-current'/>

### Registering a Broadcast Receiver (Android)
<snippet id='application-app-android-broadcast'/>

### Adding a Notification Observer (iOS)
<snippet id='application-ios-observer'/>
