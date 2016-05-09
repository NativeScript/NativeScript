---
nav-title: "Label How-To"
title: "label"
description: "Examples for using Label"
---
# Label
Using a label requires the Label module.
<snippet id='label-require'/>

### Binding the Label text property to a view-model property.
``` XML
<Page>
  {%raw%}<Label text="{{ title }}" />{%endraw%}
</Page>
```
### Setting the  label text content
<snippet id='label-settext'/>

### Turning on text wrapping for a label
<snippet id='label-textwrap'/>

### Styling a label via css class
<snippet id='label-cssclass'/>

### Styling a label via css type
<snippet id='label-cssclass-type'/>

### Styling a label via css control identifier
<snippet id='label-css-identifier'/>

### Binding text property of a label to an observable model
<snippet id='label-observable'/>
