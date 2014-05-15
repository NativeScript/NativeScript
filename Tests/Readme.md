To run tests please build using one of the *_Tests build configurations and call runAll() method of the Tests module. For example:

##iOS
```js
var app = require("application");
app.init(null);
var tests = require("Tests");
tests.runAll();
```

##Android
```js
app.init({
	getActivity: function(intent) {
		return com.tns.NativeScriptActivity.extends({});
	},
	onCreate: function() {
		require("application").init(this);
		require("Tests").runAll();
	} 
});
```