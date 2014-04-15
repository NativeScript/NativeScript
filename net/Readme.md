Sample code:
```js
    var http = require("net").http;

    http.getString("http://www.reddit.com/").then(function(result) {
           // Result is string!
    }, function(e) { console.log("Error:" + e.message); });
                                                      
    http.getJSON("http://www.reddit.com/r/aww.json?limit=10").then(function(result) {
           // Result is JSON!  
    }, function(e) { console.log("Error:" + e.message); });

    http.getImage("http://www.telerik.com/sfimages/default-source/Homepage/hp_any_approachf6e4079a7a99493a8ab2e367b9cb3f7d.png").then(function(result) {
           // Result is tk.ui.Image!
    }, function(e) { console.log("Error:" + e.message); });

```