---
nav-title: "button How-To"
title: "button"
environment: nativescript
description: "Examples for using button"
previous_url: /ApiReference/ui/button/HOW-TO
---
# Button
### Declaring button module
Button module is required to use any button feature.
{%snippet button-require%}

Other frequently used modules when working with buttons include:
{%snippet button-require-others%}

### Attaching event handler for the button tap event.
``` XML
<Page>
  <Button tap="buttonTap" />
</Page>
```
### Creating a button
{%snippet button-create%}

### Setting the text of a button
{%snippet button-settext%}

### Responding to the tap event
{%snippet button-tap%}

### Binding text property directly to model
{%snippet button-bind%}
