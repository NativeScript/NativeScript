---
nav-title: "image-source How-To"
title: "image-source"
description: "Examples for using image-source"
previous_url: /ApiReference/image-source/HOW-TO
---
# Image source
Using the image source requires the image-source module.
<snippet id='imagesource-require'/>
The pre-required `imageSource` module is used throughout the following code snippets.
We also use fs module defined as follows:
<snippet id='imagesource-require-alt'/>

## Loading and saving images
### Load image using resource name
This is similar to loading Bitmap from `R.drawable.logo` on Android or calling `[UIImage imageNamed@"logo"]` on iOS
<snippet id='imagesource-resname'/>

### Load image from URL
<snippet id='imagesource-load-url'/>

### Save image source to PNG or JPG file
<snippet id='imagesource-save-to'/>

### Load image from a local file
<snippet id='imagesource-load-local'/>
