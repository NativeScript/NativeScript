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
### Define multiple item templates and an item template selector in XML.
The itemTemplateSelector can be an expression specified directly in XML. The context of the expression is the data item for each row.
``` XML
<Page>
 {%raw%}<ListView items="{{ myItems }}" itemTemplateSelector="age > 18 ? 'green' : 'red'">
    <ListView.itemTemplates>
      <template key="green">
        <Label text="{{ age }}" style.backgroundColor="green" />
      </template>
      <template key="red">
        <Label text="{{ age }}" style.backgroundColor="red" />
      </template>
    </ListView.itemTemplates>
 </ListView>{%endraw%}
</Page>
```
### Specifying the item template selector as a function in the code-behind file
In case your item template selector involves complicated logic which cannot be expressed with an expression, you can create an item template selector function in the code behind of the page in which the ListView resides. The function receives the respective data item, the row index and the entire ListView items collection as parameters. It has to return the the key of the template to be used based on the supplied information.
``` XML
<Page>
 {%raw%}<ListView items="{{ myItems }}" itemTemplateSelector="selectItemTemplate">
    <ListView.itemTemplates>
      <template key="green">
        <Label text="{{ age }}" style.backgroundColor="green" />
      </template>
      <template key="red">
        <Label text="{{ age }}" style.backgroundColor="red" />
      </template>
    </ListView.itemTemplates>
 </ListView>{%endraw%}
</Page>
```
{%snippet article-item-template-selector-function%}
### Alternating row colors
You can use the special value '$index' in the item template selector expression which represents the row index.
``` XML
<Page>
 {%raw%}<ListView items="{{ myItems }}" itemTemplateSelector="$index % 2 === 0 ? 'even' : 'odd'">
    <ListView.itemTemplates>
      <template key="even">
        <Label text="{{ age }}" style.backgroundColor="white" />
      </template>
      <template key="odd">
        <Label text="{{ age }}" style.backgroundColor="gray" />
      </template>
    </ListView.itemTemplates>
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
