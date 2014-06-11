
/**
This is currently for reference only. Use Observable instead. 
Unlike Observable, EventManager provides additional user data (called context)

Usage:

```
var eventManagerModule = require("ui/core/event-manager");

var eventManager = new eventManagerModule.EventManager();
eventManager.on("click", function(eventData, context) {
    console.log("clicked with data: " + eventData + ", context: " + context);
}, "context");

eventManager.emit("click");
eventManager.emit("click", "click1");

var f = function(eventData, context) {
    console.log("tested with data: " + eventData + ", context: " + context);
};
                                                
eventManager.on("test1, click", f);

eventManager.emit("click", "should be doubled");
eventManager.emit("test1");

eventManager.off("click", f);
eventManager.emit("click", "click3");

eventManager.off("test1");
eventManager.emit("test1", "test3");
```
*/
export interface EventHandler {
    (eventData?: any, context?: any): void;
}

interface Event {
    func: EventHandler;
    context: any;
}

export class EventManager {

    private events: any = {};

    public on(events: string, func: EventHandler, context?: any) {
        var eventNames: Array<string> = events.split(",");
        var that = this;
        eventNames.forEach(function (event: string) {
            var eventTrimmed = event.trim();
            var newEvent: Event = { func: func, context: context };
            var ev: Array<Event> = that.events[eventTrimmed];
            if (!ev) {
                ev = [newEvent];
                that.events[eventTrimmed] = ev;
            }
            else {
                ev.push(newEvent);
            }
        });
    }

    public off(events: string, func?: EventHandler) {
        var eventNames:Array<string> = events.split(",");
        var that = this;
        eventNames.forEach(function (event: string) {
            var eventTrimmed = event.trim();
            if (!func) {
                that.events[eventTrimmed] = undefined;
            }
            else {
                var ev: Array<Event> = that.events[eventTrimmed];
                if (ev) {
                    ev.forEach(function (e:Event, idx:number) {
                        if (e.func == func) {
                            ev.splice(idx, 1);
                            return;
                        }
                    });
                }
            }
        });
    }

    public emit(events: string, eventData?: any) {
        var eventNames:Array<string> = events.split(",");
        var that = this;
        eventNames.forEach(function (event: string) {
            var ev: Array<Event> = that.events[event.trim()];
            if (ev) {
                ev.forEach(function (e: Event) {
                    e.func(eventData, e.context);
                });
            }
        });
    }
}
