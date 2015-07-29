# Ani
```javascript
// put this in the bootstrap.js
var app = require("application");
var frameModule = require("ui/frame");

app.onLaunch = function(context) {
	var frame = new frameModule.Frame();
	frame.navigate("testPage");
}
```

