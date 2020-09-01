---
nav-title: "search-bar How-To"
title: "search-bar"
environment: nativescript
description: "Examples for using search-bar"
previous_url: /ApiReference/ui/search-bar/HOW-TO
---
# Declare SearchBar via XML
```XML
<Page xmlns="http://schemas.nativescript.org/tns.xsd" navigatingTo="navigatingTo" class="page">
    <StackLayout class="p-20">
       <SearchBar id="searchBar" hint="Search" text="" clear="onClear" submit="onSubmit" />
    </StackLayout>
</Page>
```
## SearchBar submit event
{%snippet searchbar-submit%}
## SearchBar clear event
{%snippet searchbar-clear%}
# SearchBar
Using the SearchBar requires the "ui/search-bar" module.
{%snippet article-require-searchbar-module%}
### Creating a SearchBar
{%snippet article-creating-searchbar%}
### Searching
{%snippet article-searching%}
