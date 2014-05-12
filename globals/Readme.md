Globals module for defining functions part of the global context - you need only to call *require* for this module and all globals will be registered. For example:
```js
    require("globals");

	setTimeout(function(){ console.log("Test"); }, 2000);

```

Global functions/objects are: setTimeout, clearTimeout, setInterval, clearInterval and console. 