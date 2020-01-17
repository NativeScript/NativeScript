---
nav-title: "observable-array How-To"
title: "observable-array"
environment: nativescript
description: "Examples for using observable-array"
previous_url: /ApiReference/data/observable-array/HOW-TO
---
# Observable Array module
{%snippet observable-array-require%}

### Create ObservableArray from array.
{%snippet observable-array-create%}

### Create ObservableArray from arguments.
{%snippet observable-array-arguments%}

### Create ObservableArray with specific length.
{%snippet observable-array-length%}

### Set ObservableArray length to new value.
{%snippet observable-array-newvalue%}

### Get item at specified index using getItem(index) method.
{%snippet observable-array-getitem%}

### Set item at specified index using setItem(index, item) method.
{%snippet observable-array-setitem%}

### Set item at specified index using setItem(index, item) method and observe change event data.
{%snippet observable-array-eventdata%}

### Use concat() method to combine ObservableArray with array.
{%snippet observable-array-combine%}

### Use join() method to convert ObservableArray to comma separated string.
{%snippet observable-array-join%}

### Use join(separator) method to convert ObservableArray to string separated with specified separator.
{%snippet observable-array-join-separator%}

### Use pop() method to remove the last element.
{%snippet observable-array-join-pop%}

### Handle "change" event to know more info about the change after calling pop() method.
{%snippet observable-array-join-change%}

### Use push() method to add single element to the array.
{%snippet observable-array-push%}

### Handle "change" event to know more info about the change after calling push() method with single element.
{%snippet observable-array-change-push%}

### Use push() method to add multiple elements to the array.
{%snippet observable-array-push-multiple%}

### Handle "change" event to know more info about the change after calling push() method with multiple elements.
{%snippet observable-array-push-multiple-info%}

### Use push() method to add multiple elements from source array to the ObservableArray.
{%snippet observable-array-push-source%}

### Handle "change" event to know more info about the change after calling push() method with multiple elements from source array.
{%snippet observable-array-push-source-info%}

### Use reverse() method to reverse the elements order of the ObservableArray.
{%snippet observable-array-reverse%}

### Use shift() method to remove the first element of the array.
{%snippet observable-array-shift%}

### Handle "change" event to know more info about the change after calling shift() method.
{%snippet observable-array-shift-change%}

### Use slice() method to return array with all ObservableArray elements.
{%snippet observable-array-slice%}

### Use slice(star, end) method to return section of the array.
{%snippet observable-array-slice-args%}

### Use sort() method to sort the array.
{%snippet observable-array-sort%}

### Use sort(compareFunction) method to sort the array with your own comparing logic.
{%snippet observable-array-sort-comparer%}

### Use splice(start, deleteCount) method to delete elements in the array.
{%snippet observable-array-splice%}

### Handle "change" event to know more info about the change after calling splice(start, deleteCount) method.
{%snippet observable-array-splice-change%}

### Use splice(start, deleteCount, ...arguments) method to remove and insert elements in the array.
{%snippet observable-array-splice-args%}

### Handle "change" event to know more info about the change after calling splice(start, deleteCount, ...arguments) method.
{%snippet observable-array-splice-args-change%}

### Use unshift(item1, item2... itemN) method to insert elements from the start of the array.
{%snippet observable-array-unshift%}

### Handle "change" event to know more info about the change after calling unshift(item1, item2... itemN) method.
{%snippet observable-array-unshift-change%}

### Use indexOf(item) method to get the index of the desired item in the array.
{%snippet observable-array-indexof%}

### Use indexOf(item, fromIndex) method to get the index of the desired item in the array starting from specified index.
{%snippet observable-array-indexof-args%}

### Use lastIndexOf(item) method to get the last index of the desired item in the array.
{%snippet observable-array-lastindexof%}

### Use lastIndexOf(item, fromIndex) method to get the last index of the desired item in the array starting from specified index.
{%snippet observable-array-lastindexof-args%}
