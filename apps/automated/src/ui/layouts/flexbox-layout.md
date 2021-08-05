---
nav-title: "flexbox-layout How-To"
title: "flexbox-layout"
environment: nativescript
description: "Examples for using flexbox-layout"
---
# FlexboxLayout
Using a FlexboxLayout requires the FlexboxLayout module.
{%snippet flexbox-layout-require%}

Using the flexbox layout in the NativeScript framework requires the FlexboxLayout view with children.
The FlexboxLayout will automatically serve as if it were a *div* with `{ display: flex; }`.

[Here is a good guide on using flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/).

The FlexboxLayout implementation is based on existing Apache-2 licensed flexbox implementation hosted on
[github.com/google/flexbox-layout](https://github.com/google/flexbox-layout).

## Properties
The flexbox properties supported at the moment can be set in JavaScript, the NativeScript markup or in CSS.

The supported properties on the FlexboxLayout container are:
 - ~~**display:**~~ This works as if set to `flex` by default on the *FlexboxLayout*
 - **flex-direction:**
    - Set in CSS using `style="flex-direction: row;"`
    - Set in JavaScript using the property - `fb.flexDirection = FlexDirection.ROW`
    - Set in XML using the attribute - `<FlexboxLayout flexDirection="row">`
 - **flex-wrap:**
    - Set in CSS using `style="flex-wrap: wrap;"`
    - Set in JavaScript using the property - `fb.flexWrap = FlexWrap`
    - Set in XML using the attribute - `<FlexboxLayout flexWrap="wrap">`
 - **flex-flow:**
    - Set in CSS using `style="flex-flow: row wrap;"`
    - The shorthand property has no alternative in JavaScript or in the markup
 - **justify-content:**
    - Set in CSS using `style="justify-content: space-between;"`
    - Set in JavaScript using the property - `fb.justifyContent = JustifyContent.SPACE_BETWEEN`
    - Set in XML using the attribute - `<FlexboxLayout justifyContent = "space-between">`
 - **align-items:**
    - Set in CSS using `style="align-items: stretch;"`
    - Set in JavaScript using the property - `fb.alignItems = AlignItems.STRETCH`
    - Set in XML using the attribute - `<FlexboxLayout alignItems = "stretch">`
 - **align-content:**
    - Set in CSS using `style="align-content: space-between;"`
    - Set in JavaScript using the property - `fb.alignContent = AlignContent.SPACE_BETWEEN`
    - Set in XML using the attribute - `<FlexboxLayout alignContent = "space-between">`

> **NOTE:** There is a limitation for `align-items` in **iOS**, the `baseline` option can **not** be used.

The supported flexbox properties on child elements are as follow:
 - **order:**
    - Set in CSS using `style="order: 1;"`
    - Set in JavaScript using the method `flexbox.FlexboxLayout.setOrder(child, 1)`
    - Set in XML using the attribute `order="1"`
 - **flex-grow:**
    - Set in CSS using `style="flex-grow: 1;"`
    - Set in JavaScript using the method `flexbox.FlexboxLayout.setFlexGrow(child, 1)`
    - Set in XML using the attribute `flexGrow="1"`
 - **flex-shrink:**
    - Set in CSS using `style="flex-shrink: 1;"`
    - Set in JavaScript using the method `flexbox.FlexboxLayout.setFlexShrink(child, 1)`
    - Set in XML using the attribute `flexShrink="1"`
 - ~~**flex-basis:**~~ The NativeScript layout supports setting width or height as fixed values or percent, use them instead
 - **flex:**
    - Set in CSS using `style="flex: 1 1;"`
    - The shorthand property has no alternative in JavaScript or markup, set the `flex-grow`, `flex-shrink`, `width` or `height` instead
 - **align-self:**
    - Set in JavaScript using the method `flexbox.FlexboxLayout.setAlignSelf(child, AlignSelf.STRETCH)`
    - Set in XML using the attribute `<FlexboxLayout><Button alignSelf="stretch" /></FlexboxLayout>`
 - **flex-wrap-before:** Non-spec property controlling item wrapping, setting to *true* on flexbox child will force it to wrap on a new line
    - Set in CSS using: `style="flex-wrap-before: true"`
    - Set in JavaScript using the method `flexbox.FlexboxLayout.setFlexWrapBefore(child, true)`
    - Set in XML using the attribute `<FlexboxLayout><Button flexWrapBefore="true" /></FlexboxLayout>`

> **NOTE:** There is a limitation for `align-self` in **iOS**, the `baseline` option can **not** be used.

## Use in XML layout
{%snippet flexbox-layout-page%}
