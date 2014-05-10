Globals module for defining functions part of the global context - you need only to call *require* for this module and all globals will be registered. For example setTimeout:
```js
    require("globals");
	setTimeout(function(){ log("Test"); }, 2000);
```