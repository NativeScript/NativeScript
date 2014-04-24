Sample code:
```js
    var http = require("net");

    http.getString("http://www.reddit.com/").then(function(result) {
           // Result is string!
    }).fail(function(e) { console.log("Error:" + e.message); });
                                                      
    http.getJSON("http://www.reddit.com/r/aww.json?limit=10").then(function(result) {
           // Result is JSON!  
    }).fail(function(e) { console.log("Error:" + e.message); });

    http.getImage("http://www.google.com/images/errors/logo_sm_2.png").then(function(result) {
           // Result is tk.ui.Image!
    }).fail(function(e) { console.log("Error:" + e.message); });

    http.request({ url: "http://www.reddit.com/r/aww.json?limit=10", method: "GET" }).then(function(r) {
        console.log("Headers count:" + r.headers.length);
             
        for (var i = 0, l = r.headers.length; i < l; i++) {
            var header = r.headers[i];
            console.log(header.name + ":" + header.value);
        }
             
        log("Content:" + r.content.toString()); // You can use also toJSON() and toImage() to convert the content.
             
    }).fail(function(e) { console.log("Error:" + e.message); });

```