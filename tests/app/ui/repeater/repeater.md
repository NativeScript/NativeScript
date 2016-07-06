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
