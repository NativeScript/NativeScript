RefreshableListView module. 
```js
    var lm  = require("ui/label");
    var lvm = require("ui/refreshable-list-view");

    var data = [];
    for(var i = 0, l = 1000; i < l; i++) {
       data.push(i);
    }

    var lv = new lvm.ListView();
    lv.items = data;
    lv.on(lvm.ListView.itemLoadingEvent, function(args){
        var label = args.view;
        if(!label) {
            label = new lm.Label();
            args.view = label;
        }
        label.text = "Item " + args.index;
    });
```

Just replace `ListView` in your XML file with `RefreshableListView` and add attribute `refresh="yourRefreshHandler"`
(while keep `ListView.itemTemplate` the same).

Example:
```xml
<!-- main-page.xml -->
<Page xmlns="http://www.nativescript.org/tns.xsd" loaded="pageLoaded">
    <StackLayout>
        <RefreshableListView
            items="{{ postList }}"
            isScrolling="{{ isScrolling }}"
            loadMoreItems="listViewLoadMoreItems"
            refresh="myRefreshFunction"
            >
            <ListView.itemTemplate>
                <!-- truncated -->
            </ListView.itemTemplate>
        </RefreshableListView>
    </StackLayout>
</Page>
```
```ts
// main-page.ts
export function myRefreshFunction(args: RefreshEventData) {
  mainViewModel.refresh()
  .then(()=>{
    args.done();
    })
  .catch(function(e) {
    setTimeout(function() { throw e; });
  });
  ;
}
```
