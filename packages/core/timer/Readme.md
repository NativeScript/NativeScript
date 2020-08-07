Timer module. Functions also can be availble in the global context if you require *globals* module.
```js
    require("globals");

	setTimeout(function(){ log("Test"); }, 2000);

	var id = setTimeout(function(){ log("Test"); }, 2000);
	...
	clearTimeout(id);

	setInterval(function(){ log("Test"); }, 2000);

	var intervalId = setInterval(function(){ log("Test"); }, 2000);
	...
	clearInterval(intervalId)
```
OR
```js
    var timer = require("timer");

	timer.setTimeout(function(){ log("Test"); }, 2000);

	var id = timer.setTimeout(function(){ log("Test"); }, 2000);
	...
	timer.clearTimeout(id);

	timer.setInterval(function(){ log("Test"); }, 2000);

	var intervalId = timer.setInterval(function(){ log("Test"); }, 2000);
	...
	timer.clearInterval(intervalId)
```

The second parameter for setTimeout and setInterval is optional with default value of 0.
