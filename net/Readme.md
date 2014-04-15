Sample code:
```js
    var http = require("net").http;

    http.getString("http://www.reddit.com/").then(function(result) {
           // Result is string!
    }).fail(function(e) { console.log("Error:" + e.message); });
                                                      
    http.getJSON("http://www.reddit.com/r/aww.json?limit=10").then(function(result) {
           // Result is JSON!  
    }).fail(function(e) { console.log("Error:" + e.message); });

    http.getImage("http://www.google.com/images/errors/logo_sm_2.png").then(function(result) {
           // Result is tk.ui.Image!
    }).fail(function(e) { console.log("Error:" + e.message); });

```