---
nav-title: "repeater How-To"
title: "repeater"
environment: nativescript
description: "Examples for using repeater"
previous_url: /ApiReference/ui/repeater/HOW-TO
---
# Repeater
Using a Repeater requires the repeater module.
{%snippet article-require-repeater-module%}
Other modules which will be used in the code samples in this article:
{%snippet article-require-modules-repeater%}
### Binding the Repeater items property to collection in the view-model.
``` XML
<Page>
  {%raw%}<Repeater items="{{ myItems }}" />{%endraw%}
</Page>
```
### Define the Repeater itemsLayout property. Default is StackLayout with orientation="vertical".
``` XML
<Page>
 {%raw%}<Repeater items="{{ myItems }}">
    <Repeater.itemsLayout>
       <StackLayout orientation="horizontal" />
    </Repeater.itemsLayout>
 </Repeater>{%endraw%}
</Page>
```
### Define the Repeater itemTemplate property.
``` XML
<Page>
 {%raw%}<Repeater items="{{ myItems }}">
    <Repeater.itemTemplate>
       <Label text="{{ title || 'Downloading...' }}" textWrap="true" class="title" />
    </Repeater.itemTemplate>
 </Repeater>{%endraw%}
</Page>
```
### Define multiple item templates and an item template selector in XML.
The itemTemplateSelector can be an expression specified directly in XML. The context of the expression is the data item for each row.
``` XML
<Page>
 {%raw%}<Repeater items="{{ myItems }}" itemTemplateSelector="age > 18 ? 'green' : 'red'">
    <Repeater.itemTemplates>
      <template key="green">
        <Label text="{{ age }}" style.backgroundColor="green" />
      </template>
      <template key="red">
        <Label text="{{ age }}" style.backgroundColor="red" />
      </template>
    </Repeater.itemTemplates>
 </Repeater>{%endraw%}
</Page>
```
### Specifying the item template selector as a function in the code-behind file
In case your item template selector involves complicated logic which cannot be expressed with an expression, you can create an item template selector function in the code behind of the page in which the RepeaterRepeater resides. The function receives the respective data item, the row index and the entire Repeater items collection as parameters. It has to return the the key of the template to be used based on the supplied information.
``` XML
<Page>
 {%raw%}<Repeater items="{{ myItems }}" itemTemplateSelector="selectItemTemplate">
    <Repeater.itemTemplates>
      <template key="green">
        <Label text="{{ age }}" style.backgroundColor="green" />
      </template>
      <template key="red">
        <Label text="{{ age }}" style.backgroundColor="red" />
      </template>
    </Repeater.itemTemplates>
 </Repeater>{%endraw%}
</Page>
```
{%snippet article-item-template-selector-function%}
### Alternating row colors
You can use the special value '$index' in the item template selector expression which represents the row index.
``` XML
<Page>
 {%raw%}<Repeater items="{{ myItems }}" itemTemplateSelector="$index % 2 === 0 ? 'even' : 'odd'">
    <Repeater.itemTemplates>
      <template key="even">
        <Label text="{{ age }}" style.backgroundColor="white" />
      </template>
      <template key="odd">
        <Label text="{{ age }}" style.backgroundColor="gray" />
      </template>
    </Repeater.itemTemplates>
 </Repeater>{%endraw%}
</Page>
```
### Repeater with WrapLayout inside ScrollView.
``` XML
<Page>
{%raw%}<ScrollView>
  <Repeater items="{{ myItems }}">
    <Repeater.itemsLayout>
       <WrapLayout />
    </Repeater.itemsLayout>
    <Repeater.itemTemplate>
       <Label text="{{ $value }}" margin="10" />
    </Repeater.itemTemplate>
  </Repeater>
 </ScrollView>{%endraw%}
</Page>
```
### Using Repeater with Array
{%snippet article-repeater-with-array%}
> Note, that changing the array after the repeater is shown will not update the UI.
You can force-update the UI using the refresh() method.
{%snippet artcle-array-push-element%}
### Using Repeater with different layout.
{%snippet article-repeater-layout%}
### Using Repeater with ObservableArray
{%snippet article-repeater-observablearray%}
> When using ObservableArray the repeater will be automatically updated when items are added or removed form the array.
{%snippet article-push-to-observablearray%}
