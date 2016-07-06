---
nav-title: "SegmentedBar How-To"
title: "segmented-bar"
environment: nativescript
description: "Examples for using SegmentedBar"
previous_url: /ApiReference/ui/segmented-bar/HOW-TO
---
# SegmentedBar
Using a SegmentedBar requires the "ui/segmented-bar" module.
{%snippet article-require-segmentedbar-module%}
## Creating a SegmentedBar
{%snippet article-create-segmentedbar%}
``` XML
<SegmentedBar>
  <SegmentedBar.items>
    <SegmentedBarItem title="Item 1" />
    <SegmentedBarItem title="Item 2" />
    <SegmentedBarItem title="Item 3" />
  </SegmentedBar.items>
</SegmentedBar>
```
### Creating segmentedBar.items
It is important that an items array gets created and filled with
items first and then assigned to the segmented bar.
{%snippet article-creating-segmentedbar-items%}
### Selecting an item programmatically
{%snippet artcile-selecting-item%}
