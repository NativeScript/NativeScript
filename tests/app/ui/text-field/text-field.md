---
nav-title: "TextField How-To"
title: "text-field"
environment: nativescript
description: "Examples for using TextField"
previous_url: /ApiReference/ui/text-field/HOW-TO
---
# TextField
Using a TextField requires the text-field module.
{%snippet require-textfield%}
### Binding two TextFields text property to observable view-model property.
```XML
{%raw%}<TextField text="{{ someProperty }}" />
<TextField text="{{ someProperty }}" />{%endraw%}
```
{%snippet require-observable-binding-options-textfield%}
## Creating a TextField
{%snippet creating-textfield%}
### Setting the text of a TextField
{%snippet setting-text-property%}
### Setting the text of a TextField
{%snippet setting-hint-property%}
### Binding text property directly to model
{%snippet binding-text-property-second%}
### Setting the hint of a TextField
{%snippet setting-hint-text%}
### Binding hint property directly to model
{%snippet binding-hint-property-textfield%}
### Setting the secure property of a TextField
{%snippet setting-secure-property%}
### Binding secure property directly to model
{%snippet binding-secure-property%}
### Setting the maxLength property of a TextField
```
<TextField autocorrect="false" hint="Setting Max text length(max 3 characters)" maxLength="3" />
<TextField autocorrect="false"  hint="Setting Max text length(max 3 characters) with secure='true'" maxLength="3" secure="true" />
```
