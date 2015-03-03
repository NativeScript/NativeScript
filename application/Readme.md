Use the frame in the following way:

### To navigate to the starting page of the application
```javascript
// put this in the bootstrap.js
var app = require("application");
var frameModule = require("ui/frame");

app.onLaunch = function(context) {
	var frame = new frameModule.Frame();
	frame.navigate("testPage");
}
```

