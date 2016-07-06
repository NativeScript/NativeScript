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
{%snippet require-observable-textfield%}
### Binding two TextFields text property to observable view-model property.
```XML
 <Page loaded="pageLoaded">
  <StackLayout orientation="vertical">
    {%raw%}<TextView text="{{ someProperty }}" />
    <TextView text="{{ someProperty }}" />{%endraw%}
  </StackLayout>
 </Page>
```
{%snippet binding-text-property-textfield%}
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
