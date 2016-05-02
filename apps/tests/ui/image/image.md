---
nav-title: "Image How-To"
title: "Image"
description: "Examples for using Image"
---
# Image
Using an image requires the Image module to be loaded.
<snippet id='img-require'/>

Binding the image source property to a view-model property.
``` XML
<Page>
  <StackLayout>
     <!--Bind the image source property to view-model property -->
     {%raw%}<Image src="{{ thumbnailImageUrl }}" />{%endraw%}
     <!--Load form image from application -->
     <Image src="~/logo.png" stretch ="none" / > 
     <!--Load form image resource -->
     <Image src="res://logo.png" stretch ="none" / > 
     <!--Load form image URL-->
     <Image src="http://www.google.com/images/errors/logo_sm_2.png" stretch ="none" /> 
  </StackLayout>
</Page>
```
### How to create an image and set its source.
<snippet id='img-create'/>

### How to create an image and set its src.
<snippet id='img-create-src'/>

### How to create an image and set its src to file within the application.
<snippet id='img-create-local'/>

### How to create an image and set its src to Data URI.
<snippet id='img-create-datauri'/>

### How to set image stretching.
<snippet id='img-set-stretch'/>
