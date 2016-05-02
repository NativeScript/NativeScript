
---
nav-title: "dock-layout How-To"
title: "DockLayout"
description: "Examples for using dock-layout"
---
# DockLayout
Using a DockLayout requires the DockLayout module.
<snippet id='dock-layout-require'/>

### Declaring a DockLayout.
``` XML
<Page>
 <DockLayout stretchLastChild="true">
   <Button dock="left" text="left" style="background-color: red; margin: 5;" />
   <Button dock="top" text="top" style="background-color: lightblue; margin: 5;" />
   <Button dock="right" text="right" style="background-color: lightgreen; margin: 5;" />
   <Button dock="bottom" text="bottom" style="background-color: lightpink; margin: 5;" />
   <Button text="fill" style="background-color: wheat; margin: 5;" />
 </DockLayout>
</Page>
```

Other frequently used modules when working with a DockLayout include:
<snippet id='dock-layout-others'/>

## Create DockLayout
<snippet id='dock-layout-create'/>

## Add child view to layout
<snippet id='dock-layout-addchild'/>

## Remove child view from layout
<snippet id='dock-layout-removechild'/>

## Setting the dock property
<snippet id='dock-layout-setdocl'/>
