Sample code:
```
    var webClientModule = require("WebClient/web_client");
    var webClient = webClientModule.tk.web.Client;

    var client = new webClient();

    client.getString("http://www.reddit.com/", function(result) {
           // Result is string!
    }, function(e) { console.log("Error:" + e.message); });
                                                      
    client.getJSON("http://www.reddit.com/r/aww.json?limit=10", function(result) {
           // Result is JSON!  
    }, function(e) { console.log("Error:" + e.message); });

    client.getImage("http://www.telerik.com/sfimages/default-source/Homepage/hp_any_approachf6e4079a7a99493a8ab2e367b9cb3f7d.png", function(result) {
           // Result is tk.ui.Image!
    }, function(e) { console.log("Error:" + e.message); });

```