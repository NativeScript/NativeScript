---
nav-title: "application-settings How-To"
title: "application-settings"
environment: nativescript
description: "Examples for using application-settings"
previous_url: /ApiReference/application-settings/HOW-TO
---
# Application Settings
Using application settings methods requires to load "application settings" module.
{%snippet application-settings-require%}

## Working with string, number and boolean values
### Set and get boolean value and provide default value in case it is not set
{%snippet application-settings-boolean%}

### Set and get string value
{%snippet application-settings-string%}

### Set and get numeric value.
Use this method to set numbers with floating point and up to 9 digits long. For larger numbers use `setString`.
We use `toFixed()` here in order to avoid floating point errors - ex: `54.321` becoming `54.320999999537`.
Beware the result of `toFixed()` is a string not a number therefore you cannot use `===` or `!==` when comparing with a number.
{%snippet application-settings-number%}

### Reading values that are not set before while providing default value
{%snippet application-settings-notset%}

### Reading values that are not set before not providing default value
{%snippet application-settings-nodefault%}

## Other functions
### Checking for existence of value for key
{%snippet application-settings-haskey%}

### Removing value for key
{%snippet application-settings-removekey%}

### Removing all values
{%snippet application-settings-clear%}
