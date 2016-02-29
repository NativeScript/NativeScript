To run tests please build using one of the *_Tests build configurations and call runAll() method of the Tests module. For example:

##iOS
``` JavaScript
var app = require("application");
app.init(null);
var tests = require("Tests");
tests.runAll();
```

##Android
``` JavaScript
app.init({
	getActivity: function(intent) {
		return com.tns.NativeScriptActivity.extend({});
	},
	onCreate: function() {
		require("application").init(this);
		require("Tests").runAll();
	} 
});
```
