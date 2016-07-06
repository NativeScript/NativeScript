---
nav-title: "slider How-To"
title: "slider"
environment: nativescript
description: "Examples for using slider"
previous_url: /ApiReference/ui/slider/HOW-TO
---
# Slider
Using a slider requires the Slider module.
{%snippet article-require-slider%}
### Binding the Progress and Slider value properties to a observable view-model property.
``` XML
<Page loaded="pageLoaded">
 <StackLayout orientation="vertical">
   {%raw%}<Progress value="{{ someProperty }}" />
   <Slider value="{{ someProperty }}" />{%endraw%}
 </StackLayout>
</Page>
```
{%snippet article-binding-slider-properties%}
### Creating a slider
{%snippet article-creating-slider%}
### Setting the slider value and bounds
{%snippet article-setting-slider-values%}
### Binding value property to a model
{%snippet article-binding-value-property%}
