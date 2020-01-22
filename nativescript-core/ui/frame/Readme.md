Use the frame in the following way:

### To navigate to the starting page of the application
```js
// put this in the bootstrap.js
var app = require("application");
var frameModule = require("ui/frame");

app.onLaunch = function(context) {
	var frame = new frameModule.Frame();
	frame.navigate("testPage");
}

// or use the mainModule property of the application module
// in this a Frame instance is internally created and used to navigate to the main page module
app.mainModule = "testPage";
```

### To navigate to a new Page
```js
// take the frame from an existing (and navigatedTo) Page instance
var frame = page.frame;
frame.navigate("newPage");
```

### To navigate to a new Activity (Android)
```js
// create a new Frame instance
var frameModule = require("ui/frame");
var frame = new frameModule.Frame();
frame.navigate("newPage");
```
