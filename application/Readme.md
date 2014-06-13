To initialize the module put the following code in the main entry point file (app.js):
```js
    var appModule = require("application");
	appModule.init([native app instance]);
```

iOS example:
```js
var app = require("application");

var MyViewController = UIKit.UIViewController.extends({
  viewDidLoad: function() {
   this.title = "Home";

   var bm = require("ui/button");
   var button = new bm.Button();
   button.text = "test";
   button.ios.frame = Foundation.CGRectMake(100, 100, 100, 40);
   button.on("click", function(arg){
                require("ui/dialogs").alert("Some message");
             });
   button.addToParent(this.view);
  }
});

app.onLaunch = function(){
    return new MyViewController();
}

app.init();
```