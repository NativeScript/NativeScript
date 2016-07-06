---
nav-title: "activity-indicator How-To"
title: "activity-indicator"
environment: nativescript
description: "Examples for using activity-indicator"
previous_url: /ApiReference/ui/activity-indicator/HOW-TO
---
# ActivityIndicator
Using the activity indicator requires the ActivityIndicator module.
{%snippet activity-indicator-require%}

### Binding the activity indicator busy property to a view-model property.
``` XML
<Page>
  {%raw%}<ActivityIndicator busy="{{ isLoading }}" />{%endraw%}
</Page>
```
### Creating an activity indicator
{%snippet activity-indicator-create%}

### Showing activity indicator while image is loading
{%snippet activity-indicator-loading%}
