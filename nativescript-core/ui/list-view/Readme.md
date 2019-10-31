ListView module.
```js
    var lm  = require("ui/label");
    var lvm = require("ui/list-view");

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
