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
<snippet id='article-require-tabview-module'/>
### Binding TabView.items
<snippet id='article-binding-tabview-items'/>
### Selecting a tab programmatically
<snippet id='article-select-tab'/>
## Creating a TabView
<snippet id='article-create-tabview'/>
