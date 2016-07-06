---
nav-title: "Label How-To"
title: "label"
environment: nativescript
description: "Examples for using Label"
previous_url: /ApiReference/ui/label/HOW-TO
---
# Label
Using a label requires the Label module.
{%snippet label-require%}

### Binding the Label text property to a view-model property.
``` XML
<Page>
  {%raw%}<Label text="{{ title }}" />{%endraw%}
</Page>
```
### Setting the  label text content
{%snippet label-settext%}

### Turning on text wrapping for a label
{%snippet label-textwrap%}

### Styling a label via css class
{%snippet label-cssclass%}

### Styling a label via css type
{%snippet label-cssclass-type%}

### Styling a label via css control identifier
{%snippet label-css-identifier%}

### Binding text property of a label to an observable model
{%snippet label-observable%}
