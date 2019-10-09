---
nav-title: "Image How-To"
title: "image"
environment: nativescript
description: "Examples for using Image"
previous_url: /ApiReference/ui/image/HOW-TO
---

# Image

The purpose of this article is to show the basic functionality of the Image view. The snippets demonstrates some scenarios and the usage of the ImageView specifics properties

* [Binding image source property](#binding-image-source-property)
* [Loading an image from app resources](#loading-an-image-from-app-resources)
* [Loading an image from URL](#loading-an-image-from-url)
* [Loading an image from file within the application](#loading-an-image-from-file-within-the-application)
* [Loading an image from Data URI](#loading-an-image-from-data-uri)
* [Setting image stretching](#setting-image-stretching)
  * [via XML](#via-xml)
  * [via code-behind](#via-code-behind)

Using an image in the code behind requires the Image module to be loaded.

{%snippet img-require%}

### Binding image source property

Binding image source property to a view-model property.
``` XML
<Page xmlns="http://schemas.nativescript.org/tns.xsd" loaded="pageLoaded">
  <StackLayout>
     {%raw%}<Image src="{{ thumbnailImageUrl }}" />{%endraw%}
  </StackLayout>
</Page>
```
```TypeScript
import { Page } from 'ui/page';
import { fromObject, EventData } from "data/observable"
export function pageLoaded(args: EventData) {
    let page = <Page>args.object;

    page.bindingContext = fromObject({ thumbnailImageUrl:"res://icon" });
}

```
### Loading an image from app resources

``` XML
<Page>
  <StackLayout>
     {%raw%}<Image src="res://logo" stretch ="none" / >{%endraw%}
  </StackLayout>
</Page>
```

{%snippet img-create%}

The example demonstrates how we could load an image, which is available in the App_Resources. More about adding an image in `App_Resources` folder could be found [here]({% slug images %}).

### Loading an image from URL

``` XML
<Page>
  <StackLayout>
     {%raw%}<Image src="http://www.google.com/images/errors/logo_sm_2.png" stretch ="none" />{%endraw%}
  </StackLayout>
</Page>
```

{%snippet img-create-src%}

The sample above, demonstrates, how to load an image source while providing URL string.

### Loading an image from file within the application

``` XML
<Page>
  <StackLayout>
     {%raw%}<Image src="~/assets/logo.png" stretch ="none" / >{%endraw%}
  </StackLayout>
</Page>
```

{%snippet img-create-local%}

The Image source could be load also from a local file. The path to the image should start with a tilde(`~`) as it is shown in the example above. Using `~/` prefix, we can load images relative to the project `app` folder

### Loading an image from Data URI

{%snippet img-create-datauri%}

In the sample code is shown, how to load an image source data, while using data URI.

### Setting image stretching

The stretch functionality allows us to describe how content is resized to fill its allocated space.
The available options for this property are as follow:

* `none` - the image preserves its original size
* `fill` - the image is resized to fill the destination dimensions. In this case, the aspect ratio is not preserved.
* `aspectFit` - the image is resized to fit the destination dimensions while it preserves its native aspect ratio. If the aspect ratio of the destination rectangle differs from the image, the image will be clipped to fit in the destination.
* `aspectFill` - the image is resized to fill in the destination dimensions while it preserves its native aspect ratio.

The default value for this property is `aspectFit`.

Setting up the stretch property could be done via the XML code or while using code behind.

### via XML

```XML
<Page xmlns="http://schemas.nativescript.org/tns.xsd" navigatingTo="navigatingTo">
    <StackLayout class="p-20">
        <Image loaded="imgLoaded" src="~/images/logo.png" stretch="none"/>
    </StackLayout>
</Page>
```
This code snippet demonstrates the first scenario, when we setup the stretch in the XML. We setup it to `none`, which means that the image will be shown on the screen with its original size.

### via code-behind

{%snippet img-set-stretch%}

The second example shows, how we could set up the property via code behind. In this scenario, we get an instance of the image and set up the appropriate string value. The Image stretch could also be set by using `Stretch` enum. For example:

```TypeScript
import * as Enums from "tns-core-modules/ui/enums"

const image = new ImageModule.Image();
image.stretch=Enums.Stretch.none;
```


**API Reference for** [Image Class](http://docs.nativescript.org/api-reference/modules/_ui_image_.html)

**Native Component**

| Android                | iOS      |
|:-----------------------|:---------|
| [android.widget.ImageView](http://developer.android.com/reference/android/widget/ImageView.html) | [UIImageView](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIImageView_Class/) |

### See also

* [Working with Images]({% slug images %})
* [Image source](https://docs.nativescript.org/cookbook/image-source)
