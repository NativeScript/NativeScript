Sample code:
```
var web_module = require("web_client");
var image_module = require("image");

var client = new web_module.tk.web.Client();
client.downloadString("http://www.reddit.com/r/aww.json?limit=10", 
	function(result) { 
		Log("Result:" + result);
	},
	function(e) { 
		Log("Error:" + e.message); 
	});
```

```

var client = new web_module.tk.web.Client();
client.downloadImage("http://www.telerik.com/sfimages/default-source/Homepage/hp_any_approachf6e4079a7a99493a8ab2e367b9cb3f7d.png", 
	function(image){ // This is image_module.tk.ui.Image
	},
	function(e) { 
		Log("Error:" + e.message); 
	});
```