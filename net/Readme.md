Sample code:
```js
    var http = require("net");
    
    // Universal request method. You can use HttpRequestOptions to set varios properties like url, headers, etc., 
    // HttpResponse to get status code, headers and content and HttpContent to get body of response:

    interface HttpRequestOptions {
        url: string;
        method: string;
        headers?: any;
        content?: HttpContent;
    }

    interface HttpResponse {
        statusCode: number;
        headers: any;
        content?: HttpContent;
    }

    interface HttpContent {
        toString: () => string;
        toJSON: () => any;
        toImage: () => image_module.Image;
    }

    // Get request
    http.request({
       url: "http://ip.jsontest.com/",
       method: "GET",
       headers: { "Content-Type" : "application/json" }
    }).then(function (r) {
       var status = r.statusCode;

       for (var header in r.headers) {
           //
       }
     
       var result = r.content.toJSON();
    }).fail(function (e) {  });

    // Post request
    http.request({
        url: "http://posttestserver.com/post.php?dump&html&dir=test",
        method: "POST",
        headers: { "Content-Type" : "application/x-www-form-urlencoded" },
        content: "MyVariableOne=ValueOne&MyVariableTwo=ValueTwo"
    }).then(function (r) {
       var status = r.statusCode;

       for (var header in r.headers) {
           //
       }
     
       var result = r.content.toJSON();
    }).fail(function (e) { log(e) });

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