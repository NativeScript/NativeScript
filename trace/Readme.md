The trace module is used to track code execution and to receive notifications for various events.
It is disabled by default and to enable it you will need to call its enable() method.

```js
import trace = require("trace");
trace.enable();
```

The module writes its output through a collection of TraceWriter objects. By default there is one ConsoleWriter instance added to the module. There is a filtering functionality which is implemented by the `setCategories(string)` method. The method argument is a string containing one or more comma-delimited categories: `"Layout,VisualTreeEvents"`.

How to specify category(s):

```js
import trace = require("trace");
// only the Layout messages are traced
trace.setCategories(trace.categories.Layout);
``` 

```js
import trace = require("trace");
// set Layout + VisualTreeEvents categories
trace.setCategories(trace.categories.concat(trace.categories.Layout, trace.categories.VisualTreeEvents));
```

```js
import trace = require("trace");
// trace everything
trace.setCategories(trace.categories.All);
```

How to trace:

```js
import trace = require("trace");
trace.write("tracing message", trace.categories.Layout);
```

The module also supports events notifications through the EventListener interface. You may call the `trace.notifyEvent` method and all registered listeners will receive a notification for the event.

How to create and register a listener:

```js
import trace = require("trace");

class Listener implements trace.EventListener {
    public filter: string;
    public receivedEvents: Array<{ sender: Object; name: string }> = [];

    constructor(filter: string) {
        this.filter = filter;
    }

    public on(object: Object, name: string) {
        this.receivedEvents.push({ sender: object, name: name });
    }

    public reset() {
        this.receivedEvents = [];
    }
}

// listen only for the _onAttached event
var listener = new Listener("_onAttached");

// register the listener
trace.addEventListener(listener);
```

How to raise events:

```js
import trace = require("trace");
import view = require("ui/core/view");

var newView = new view.View();
trace.notifyEvent(newView, "_viewCreated");
```