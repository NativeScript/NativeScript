---
nav-title: "virtual-array How-To"
title: "virtual-array"
environment: nativescript
description: "Examples for using virtual-array"
previous_url: /ApiReference/data/virtual-array/HOW-TO
---
# Virtual Array module
{%snippet virtual-array-require%}

### Handle "itemsLoading" event to load items on demand using load() method.
Use "length" property set via VirtualArray constructor to specify total number of items,
"loadSize" to specify number of items to be requested in a single request,
"itemsLoading" event to handle items request and "load()" method to copy items into the array.
All already loaded items are cached in -memory and when "getItem()" method is called
the array will raise "itemsLoading" event for still not loaded items.
{%snippet virtual-array-itemsloading%}

### Handle "change" event when you load items using load() method.
{%snippet virtual-array-change%}

### Handle "change" event when you increase "length" property.
{%snippet virtual-array-lenght%}

