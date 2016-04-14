---
nav-title: "activity-indicator How-To"
title: "How-To"
description: "Examples for using activity-indicator"
---
# ActivityIndicator
Using the activity indicator requires the ActivityIndicator module.
<snippet id='activity-indicator-require'/>

### Binding the activity indicator busy property to a view-model property.
``` XML
<Page>
  {%raw%}<ActivityIndicator busy="{{ isLoading }}" />{%endraw%}
</Page>
```
### Creating an activity indicator
<snippet id='activity-indicator-create'/>

### Showing activity indicator while image is loading
<snippet id='activity-indicator-loading'/>
