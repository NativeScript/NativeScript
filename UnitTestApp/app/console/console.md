---
nav-title: "console How-To"
title: "console"
environment: nativescript
description: "Examples for using console"
previous_url: /ApiReference/console/HOW-TO
---
# Console
### Logging
Logging to the console does not require the "console" module since the console variable is global. It can be used anywhere within your code.
You can log your message in several different categories.
{%snippet console-log%}

### Time
Begins counting a time span for a given name (key).
{%snippet console-time%}

Ends a previously started time span through the time method.
{%snippet console-timeend%}

### Assert
Asserts a boolean condition and prints a message in case the assert fails.
{%snippet console-assert%}

### Dir
Prints the state of the specified object to the console.
{%snippet console-dir%}

### Trace
Prints the current stack trace in the console.
{%snippet console-trace%}
