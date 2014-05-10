Globals module for defining functions part of the global context. For example setTimeout:
```js
    require("globals");
	setTimeout(function(){ log("Test"); }, 2000);
```