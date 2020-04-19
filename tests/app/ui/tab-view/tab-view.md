---
nav-title: "TabView How-To"
title: "tab-view"
environment: nativescript
description: "Examples for using TabView"
previous_url: /ApiReference/ui/tab-view/HOW-TO
---
# TabView
The TabView is a component, which allows to navigate between different views. The general behaviour of the TabView component is to load its items on demand. This means that every TabViewItem view will be loaded when it is shown and will be unloaded when it disappears. Respectively loaded and unloaded events will be fired while showing or hiding each view. However, there are some specifics for each platform(iOS and Android), which are described in the notes below.

> Note (iOS specific): `UITabBarController` is used in the implementation, which means that only one `TabViewItem` can be shown at a given time and only one needs to be loaded. When the user selects a new `TabViewItem`, we load the new item and unload the previous one.

> Note (Android specific): In the Android implementation is used `ViewPager` controller, which allows using the `swipe` gesture to navigate to the next or previous tab. This means that only one `TabViewItem` can be shown, but multiple `TabViewItems` need to be loaded. Otherwise, after left or right swipe, you will not see the `TabViewItem`'s contents, after the swiping. By default, the ViewPager controller will pre-load one `TabViewItem` on the left and on on the right. Regarding that, if one of the items is already pre-loaded, it will not be loaded again. In the Android, we have exposed a property called `androidOffscreenTabLimit`, which allow specifying, how many components should be pre-load on the left and right (if you are setting up `androidOffscreenTabLimit` to 0, the Android TabView will match to the iOS TabView).

The iOS and Android UX guidelines regarding the Tab controls differ greatly. The difference is described in the below points:

* The iOS tabs have their tab bar, which will be displayed always on the bottom and does not allow swipe gesture for changing tabs.
* The Android tabs are on top and will enable the swipe navigation between the tabs.
* For Android we have `androidTabsPosition` property which has two options `top`(default value) and `bottom`. Setting up this property to `bottom` allows mimicking Bottom Tab Navigation control(provided by android support library v25 release). Setting the Tabs at the bottom will disable the swipe navigation and the items preloading functionality.

### Declaring the TabView in xml.
``` XML
 <TabView>
     <TabViewItem title="Tab 1">
            // ...
     </TabViewItem>
     <TabViewItem title="Tab 2">
            // ...
     </TabViewItem>
 </TabView>
</Page>
```
Using a TabView requires the "ui/tab-view" module.
{%snippet article-require-tabview-module%}
### Binding TabView.items
{%snippet article-binding-tabview-items%}
### Selecting a tab programmatically
{%snippet article-select-tab%}
## Creating a TabView
{%snippet article-create-tabview%}
### Using selectedIndexChanged changed event
{%snippet article-tabview-selectedIndexChanged%}
### Using selectedIndexChanged event from xml
```XML
<TabView selectedIndexChanged="onSelectedIndexChanged">
    ...
</TabView>
```
```TypeScript
export function onSelectedIndexChanged(args) {...}
```
> Note: Initially selectedIndexChanged event will be raised just after adding a new items to TabView without any user interaction, which will happen on TabView loaded. SelectedIndexChanged event will be raised because value of the selectedIndex property is changed from undefined (default) (with no items) to 0 (first tab item). Depends on how TabView.items are set or added it may happen to raise one or two times selectedIndexChanged event even before page events (loaded, navigatingTo, navigatedTo, ...).

## Styling TabView

For the TabView component could be set three different styling properties

* `selectedTabTextColor` (corresponding CSS property `selected-tab-text-color `) - change the color of the text, while selecting some of the tabs.
* `tabBackgroundColor` (corresponding CSS property `tab-background-color`) - changing the background of the tabs.
* `textTransform` (corresponding CSS property `text-transform`) - setting up textTransform individual for every `TabViewItem`. Value options: `capitalize`, `lowercase`, `none`, `uppercase`.

```XML
<TabView selectedTabTextColor="#00FF00" tabBackgroundColor="#FF0000">
	<TabViewItem title="Tab 1" textTransform="lowercase">
		<Label text="Label in Tab1" />
	</TabViewItem>
	<TabViewItem title="Tab 2" textTransform="lowercase">
		<Label text="Label in Tab2" />
	</TabViewItem>
</TabView>

```

* `androidSelectedTabHighlightColor`<sup>android specific property</sup> (corresponding CSS property `android-selected-tab-highlight-color`) - setup underline color of the `Tab`s in Android.

```XML
<TabView androidSelectedTabHighlightColor="red">
	<TabViewItem title="Tab 1">
		<Label text="Label in Tab1" />
	</TabViewItem>
	<TabViewItem title="Tab 2">
		<Label text="Label in Tab2" />
	</TabViewItem>
</TabView>
```

## Tabs Limit <sup>Android Secific<sup>

Setting up the limit of the tabs, which should be pre-loaded on the left and right sides in Android.
```XML
<TabView id="tabViewContainer" androidOffscreenTabLimit="0">
	<TabViewItem title="NativeScript">
		<StackLayout>
			<Label text="NativeScript" class="m-15 h2 text-left" color="blue" />
			<ScrollView>
				<StackLayout height="100%">
					{% raw %}
					<Label text="{{content}}" textWrap="true" class="m-15" />
					{% endraw %}
				</StackLayout>
			</ScrollView>
		</StackLayout>
	</TabViewItem>
	<TabViewItem title="Icon">
		<StackLayout>
			<Image class="m-t-30 m-b-15" src="res://icon" width="80" height="80" />
			<Label text="NativeScript" textWrap="true" class="h2 m-x-auto" color="blue" />
		</StackLayout>
	</TabViewItem>
</TabView>
```

---

## Tabs Position <sup>Android Secific<sup>

Setting up the bottom Tabs position for Android.
```XML
<TabView id="tabViewContainer" androidTabsPosition="bottom">
	<TabViewItem title="NativeScript">
		<StackLayout>
			<Label text="NativeScript" class="m-15 h2 text-left" color="blue" />
			<ScrollView>
				<StackLayout height="100%">
					{% raw %}
					<Label text="{{content}}" textWrap="true" class="m-15" />
					{% endraw %}
				</StackLayout>
			</ScrollView>
		</StackLayout>
	</TabViewItem>
	<TabViewItem title="Icon">
		<StackLayout>
			<Image class="m-t-30 m-b-15" src="res://icon" width="80" height="80" />
			<Label text="NativeScript" textWrap="true" class="h2 m-x-auto" color="blue" />
		</StackLayout>
	</TabViewItem>
</TabView>

```
