The trace module is used to track code execution and to receive notifications for various events.
It is disabled by default and to enable it you will need to call its enable() method.

```js
import { Trace } from "@nativescript/core";
Trace.enable();
```

The module writes its output through a collection of TraceWriter objects. By default there is one ConsoleWriter instance added to the module. There is a filtering functionality which is implemented by the `setCategories(string)` method. The method argument is a string containing one or more comma-delimited categories: `"Layout,VisualTreeEvents"`.

How to specify category(s):

```js
import { Trace } from "@nativescript/core";
// only the Layout messages are traced
Trace.setCategories(Trace.categories.Layout);
```

```js
import { Trace } from "@nativescript/core";
// set Layout + VisualTreeEvents categories
Trace.setCategories(Trace.categories.concat(Trace.categories.Layout, Trace.categories.VisualTreeEvents));
```

```js
import { Trace } from "@nativescript/core";
// trace everything
Trace.setCategories(Trace.categories.All);
```

How to trace:

```js
import { Trace } from "@nativescript/core";
Trace.write("tracing message", Trace.categories.Layout);
```

The module also supports events notifications through the EventListener interface. You may call the `trace.notifyEvent` method and all registered listeners will receive a notification for the event.

How to create and register a listener:

```js
import { Trace } from "@nativescript/core";

class Listener implements Trace.EventListener {
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
Trace.addEventListener(listener);
```

How to raise events:

```js
import { Trace, View } from "@nativescript/core";

var newView = new View();
Trace.notifyEvent(newView, "_viewCreated");
```
