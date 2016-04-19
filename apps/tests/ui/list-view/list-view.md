---
nav-title: "list-view How-To"
title: "How-To"
description: "Examples for using list-view"
---
# ListView
Using a ListView requires the ListView module.
<snippet id='article-require-module'/>
Other modules which will be used in the code samples in this article:
<snippet id='article-require-modules'/>
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
<snippet id='article-item-tap'/>
### Attaching event handler for the ListView loadMoreItems event.
``` XML
<Page>
 {%raw%}<ListView items="{{ myItems }}" loadMoreItems="listViewLoadMoreItems" />{%endraw%}
</Page>
```
<snippet id='article-load-items'>
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
<snippet id='article-create-listview'/>
### Using ListView with Array
The itemLoading event is used to create the UI for each item that is shown in the ListView.
<snippet id='article-listview-array'/>

> Note, that changing the array after the list view is shown will not update the UI.
You can force-update the UI using the refresh() method.
<snippet id='article-change-refresh-listview'/>

### Using ListView with ObservableArray
<snippet id='article-listview-observablearray'/>

> When using ObservableArray the list view will be automatically updated when items are added or removed form the array.
<snippet id='article-push-in-observablearray'/>

## Responding to other events
### ItemTap event
The event will be raise when an item inside the ListView is tapped.
<snippet id='article-itemtap-event'/>
### LoadMoreItems event
The event will be raised when the ListView is scrolled so that the last item is visible.
This even is intended to be used to add additional data in the ListView.
<snippet id='article-loadmoreitems-event'/>
