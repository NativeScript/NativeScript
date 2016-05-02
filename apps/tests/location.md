---
nav-title: "location How-To"
title: "Location"
description: "Examples for using location"
---
# Location
Using the location requires the Location module.
<snippet id='location-require'/>

## Other functions
### Test are location services available for this device
<snippet id='location-funcs'/>

### Get distance between two locations
<snippet id='location-distance'/>

## Getting location
### Receive continuous location updates
<snippet id='location-updates'/>

### Get last known location
<snippet id='location-last-known'/>

### Get location once
if there is `options.timeout` you will receive error on timeout. If `options.timeout` is 0 then the result is the same as the result from `LocationManager.lastKnownLocation`
and there will be no wait. You can use `options.maximumAge` to specify you don't want to receive locations older than specified time in ms.
<snippet id='location-timeour'/>
