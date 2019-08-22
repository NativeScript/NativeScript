---
nav-title: "image-source How-To"
title: "image-source"
environment: nativescript
description: "Examples for using image-source"
previous_url: /ApiReference/image-source/HOW-TO
---
# Image source
Using the image source requires the image-source module.
```TypeScript
import * as imageSource from "tns-core-modules/image-source";
```
```JavaScript
var imageSource = require("tns-core-modules/image-source");
```
The pre-required `imageSource` module is used throughout the following code snippets.
We also use fs module defined as follows:
```TypeScript
import * as fs from "tns-core-modules/file-system";
```
```JavaScript
var fs = require("tns-core-modules/file-system");
```

## Loading and saving images

### Load image using resource name
This is similar to loading Bitmap from `R.drawable.logo` on Android or calling `[UIImage imageNamed@"logo"]` on iOS.
The method `fromResource` creates an `ImageSource` instance and loads it from the specified resource name.
{%snippet imagesource-resname%}

### Save image to PNG or JPG file
The method `saveToFile(path: string, format: "png" | "jpeg" | "jpg", quality?: number): boolean` saves `ImageSource` instance to the specified file, using the provided image format and quality.
The supported formats are `png`, `jpeg`, and `jpg`. The quality parameter is optional and defaults to maximum quality. Returns `true` if the file is saved successfully.
{%snippet imagesource-save-to%}

### Load image from a local file
Use `fromFile(path: string): Promise<boolean>` to load an `ImageSource` instance from the specified file asynchronously.
{%snippet imagesource-load-local%}

### Load image from URL
Use `http.getImage(url: string): Promise<ImageSource>` to fetch `ImageSource` from online source.
{%snippet http-get-image%}

### Save image from image asset to PNG file
Use `fromAsset(asset: ImageAsset): Promise<ImageSource>` to load `ImageSource` from the specified `ImageAsset` asynchronously.
{%snippet imagesource-from-imageasset-save-to%}

### Creating base64 string from PNG image file
The method `toBase64String(format: "png" | "jpeg" | "jpg", quality?: number): string` converts the image to base64 encoded string, using the provided image format and quality.
The supported formats are `png`, `jpeg`, and `jpg`. The quality parameter is optional and defaults to maximum quality.
{%snippet imagesource-to-base-string%}

### Creating PNG image file from base64 string
The method `fromBase64(source: string): Promise<boolean>` loads this instance from the specified base64 encoded string asynchronously.
{%snippet imagesource-from-base-string%}
