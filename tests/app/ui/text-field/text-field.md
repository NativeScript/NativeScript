---
nav-title: "TextField How-To"
title: "text-field"
environment: nativescript
description: "Examples for using TextField"
previous_url: /ApiReference/ui/text-field/HOW-TO
---
# TextField
Using a TextField requires the text-field module.
<snippet id='require-textfield'/>
<snippet id='require-observable-textfield'/>
### Binding two TextFields text property to observable view-model property.
```XML
 <Page loaded="pageLoaded">
  <StackLayout orientation="vertical">
    {%raw%}<TextView text="{{ someProperty }}" />
    <TextView text="{{ someProperty }}" />{%endraw%}
  </StackLayout>
 </Page>
```
<snippet id='binding-text-property-textfield'/>
## Creating a TextField
<snippet id='creating-textfield'/>
### Setting the text of a TextField
<snippet id='setting-text-property'/>
### Setting the text of a TextField
<snippet id='setting-hint-property'/>
### Binding text property directly to model
<snippet id='binding-text-property-second'/>
### Setting the hint of a TextField
<snippet id='setting-hint-text'/>
### Binding hint property directly to model
<snippet id='binding-hint-property-textfield'/>
### Setting the secure property of a TextField
<snippet id='setting-secure-property'/>
### Binding secure property directly to model
<snippet id='binding-secure-property'/>
