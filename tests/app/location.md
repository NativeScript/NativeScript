---
nav-title: "location How-To"
title: "location"
environment: nativescript
description: "Examples for using location"
previous_url: /ApiReference/location/HOW-TO
---
# Location
Using the location requires the Location module.
{%snippet location-require%}

## Other functions
### Test are location services available for this device
{%snippet location-funcs%}

### Get distance between two locations
{%snippet location-distance%}

## Getting location
### Receive continuous location updates
{%snippet location-updates%}

### Get last known location
{%snippet location-last-known%}

### Get location once
if there is `options.timeout` you will receive error on timeout. If `options.timeout` is 0 then the result is the same as the result from `LocationManager.lastKnownLocation`
and there will be no wait. You can use `options.maximumAge` to specify you don't want to receive locations older than specified time in ms.
{%snippet location-timeour%}
