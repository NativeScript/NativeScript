---
nav-title: "Border How-To"
title: "border"
environment: nativescript
description: "Examples for using Border"
previous_url: /ApiReference/ui/border/HOW-TO
---
# Border
Using borders requires the Border module.
{%snippet border-require%}

### Declaring a Border.
``` XML
 <Page>
     <Border borderRadius="10" borderWidth="2" borderColor="#FF0000">
         <Button text="OK"/>
     </Border>
 </Page>
```

> Note: Border module is **deprecated**! Use CSS properties instead.