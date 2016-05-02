---
nav-title: "grid-layout How-To"
title: "GridLayout"
description: "Examples for using grid-layout"
---
## GridLayout sample
### Creating Grid Layout via code.
<snippet id='grid-layout-require'/>

### Create grid layout with an xml declaration
``` XML
<GridLayout columns="80, *, auto" rows="auto, *" >
 <Button col="0" />
 <Button col="1" />
 <Button col="2" />
 // by default column and row are set to 0
 <Button row="1" colSpan="3" />
</GridLayout>
```

### Add views to grid layout
<snippet id='grid-layout-addviews'/>

### Set column property on views - btn1 in first column, btn2 is second and btn3 in third
<snippet id='grid-layout-setcolumn'/>

### Set row property on btn4.
<snippet id='grid-layout-setrow'/>

### Set columnSpan property on btn4 to stretch into all columns
<snippet id='grid-layout-columnspan'/>

### Create ItemSpec for columns and rows 3 columns - 80px, *, auto size and 2 rows - 100px and auto size
<snippet id='grid-layout-itemspec'/>

### Add columns and rows to GridLayout
<snippet id='grid-layout-add-rowscols'/>
