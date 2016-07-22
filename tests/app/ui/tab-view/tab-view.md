---
nav-title: "TabView How-To"
title: "tab-view"
environment: nativescript
description: "Examples for using TabView"
previous_url: /ApiReference/ui/tab-view/HOW-TO
---
# TabView
### Declaring the TabView in xml.
``` XML
<Page>
 <TabView>
   <TabView.items>
     <TabViewItem title="Tab 1">
       <TabViewItem.view>
          <Label text="Label in Tab1" />
       </TabViewItem.view>
     </TabViewItem>
     <TabViewItem title="Tab 2">
       <TabViewItem.view>
          <Label text="Label in Tab2" />
       </TabViewItem.view>
     </TabViewItem>
   </TabView.items>
 </TabView>
</Page>
```
Using a TabView requires the "ui/tab-view" module.
{%snippet article-require-tabview-module%}
### Binding TabView.items
{%snippet article-binding-tabview-items%}
### Selecting a tab programmatically
{%snippet article-select-tab%}
## Creating a TabView
{%snippet article-create-tabview%}
### Using selectedIndexChanged changed event
{%snippet article-tabview-selectedIndexChanged%}
### Using selectedIndexChanged event from xml
```XML
<Page>
 <TabView selectedIndexChanged="onSelectedIndexChanged">
   ...
 </TabView>
</Page>
```
```TypeScript
export function onSelectedIndexChanged(args) {...}
```
> Note: Initially selectedIndexChanged event will be raised just after adding a new items to TabView without any user interaction, which will happen on TabView loaded. SelectedIndexChanged event will be raised because value of the selectedIndex property is changed from undefined (default) (with no items) to 0 (first tab item). Depends on how TabView.items are set or added it may happen to raise one or two times selectedIndexChanged event even before page events (loaded, navigatingTo, navigatedTo, ...).
