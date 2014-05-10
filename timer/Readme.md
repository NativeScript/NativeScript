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