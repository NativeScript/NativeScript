---
nav-title: "list-view How-To"
title: "list-view"
environment: nativescript
description: "Examples for using list-view"
previous_url: /ApiReference/ui/list-view/HOW-TO
---
# ListView
Using a ListView requires the ListView module.
{%snippet article-require-listview-module%}
Other modules which will be used in the code samples in this article:
{%snippet article-require-modules-listview%}
### Binding the ListView items property to collection in the view-model.
``` XML
<Page>
  {%raw%}<ListView items="{{ myItems }}" />{%endraw%}
</Page>
```
### Attaching event handler for the ListView itemTap event.
``` XML
<Page>
  {%raw%}<ListView items="{{ myItems }}" itemTap="listViewItemTap" />{%endraw%}
</Page>
```
{%snippet article-item-tap%}
### Attaching event handler for the ListView loadMoreItems event.
``` XML
<Page>
 {%raw%}<ListView items="{{ myItems }}" loadMoreItems="listViewLoadMoreItems" />{%endraw%}
</Page>
```
{%snippet article-load-items%}
### Define the ListView itemTemplate property.
``` XML
<Page>
 {%raw%}<ListView items="{{ myItems }}">
    <ListView.itemTemplate>
       <Label text="{{ title || 'Downloading...' }}" textWrap="true" class="title" />
    </ListView.itemTemplate>
 </ListView>{%endraw%}
</Page>
```
### Creating a ListView
{%snippet article-create-listview%}
### Using ListView with Array
The itemLoading event is used to create the UI for each item that is shown in the ListView.
{%snippet article-listview-array%}

> Note, that changing the array after the list view is shown will not update the UI.
You can force-update the UI using the refresh() method.
{%snippet article-change-refresh-listview%}

### Using ListView with ObservableArray
{%snippet article-listview-observablearray%}

> When using ObservableArray the list view will be automatically updated when items are added or removed form the array.
{%snippet article-push-in-observablearray%}

## Responding to other events
### ItemTap event
The event will be raise when an item inside the ListView is tapped.
{%snippet article-itemtap-event%}
### LoadMoreItems event
The event will be raised when the ListView is scrolled so that the last item is visible.
This even is intended to be used to add additional data in the ListView.
{%snippet article-loadmoreitems-event%}
