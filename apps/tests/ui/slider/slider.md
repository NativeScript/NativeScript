---
nav-title: "slider How-To"
title: "slider"
description: "Examples for using slider"
---
# Slider
Using a slider requires the Slider module.
<snippet id='article-require-slider'/>
### Binding the Progress and Slider value properties to a observable view-model property.
``` XML
<Page loaded="pageLoaded">
 <StackLayout orientation="vertical">
   {%raw%}<Progress value="{{ someProperty }}" />
   <Slider value="{{ someProperty }}" />{%endraw%}
 </StackLayout>
</Page>
```
<snippet id='article-binding-slider-properties'/>
### Creating a slider
<snippet id='article-creating-slider'/>
### Setting the slider value and bounds
<snippet id='article-setting-slider-values'/>
### Binding value property to a model
<snippet id='article-binding-value-property'/>
