---
nav-title: "stack-layout How-To"
title: "How-To"
description: "Examples for using stack-layout"
---
### import StackLayout and Button classes
var StackLayout = require("ui/layouts/stack-layout").StackLayout;
var Button = require("ui/button").Button;
### Create StackLayout
<snippet id='stack-layout-new'/>
 
### Declaring a StackLayout.
``` XML
<Page>
  <StackLayout orientation="horizontal">
    <Label text="This is Label 1" />
  </StackLayout>
</Page>
```

### Add child view to layout
<snippet id='stack-layout-addchild'/>

### Remove child view from layout
<snippet id='stack-layout-remove'/>

### Change layout orientation to Horizontal
<snippet id='stack-layout-horizontal'/>

