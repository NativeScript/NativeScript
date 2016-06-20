---
nav-title: "Image How-To"
title: "image"
environment: nativescript
description: "Examples for using Image"
previous_url: /ApiReference/ui/image/HOW-TO
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
### Creating an image and setting its source
<snippet id='img-create'/>

### Creating an image and setting its src
<snippet id='img-create-src'/>

### Creating an image and setting its src to a file within the application
<snippet id='img-create-local'/>

### Creating an image and setting its src to Data URI
<snippet id='img-create-datauri'/>

### Setting image stretching
<snippet id='img-set-stretch'/>
