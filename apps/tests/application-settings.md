---
nav-title: "application-settings How-To"
title: "How-To"
description: "Examples for using application-settings"
---
# Application Settings
Using application settings methods requires to load "application settings" module.
<snippet id='application-settings-require'/>

## Working with string, number and boolean values
### Set and get boolean value and provide default value in case it is not set
<snippet id='application-settings-boolean'/>

### Set and get string value
<snippet id='application-settings-string'/>

### Set and get numeric value.
We use `toFixed()` here in order to avoid floating point errors - ex: `54.321` becoming `54.320999999537`.
Beware the result of `toFixed()` is a string not a number therefore you cannot use `===` or `!==` when comparing with a number.
<snippet id='application-settings-number'/>

### Reading values that are not set before while providing default value
<snippet id='application-settings-notset'/>

### Reading values that are not set before not providing default value
<snippet id='application-settings-nodefault'/>

## Other functions
### Checking for existence of value for key
<snippet id='application-settings-haskey'/>

### Removing value for key
<snippet id='application-settings-removekey'/>

### Removing all values
<snippet id='application-settings-clear'/>
