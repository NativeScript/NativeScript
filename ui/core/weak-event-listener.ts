import observable = require("data/observable");
import definition = require("ui/core/weak-event-listener");

export class WeakEventListener implements definition.WeakEventListener {
    private listener: WeakRef<any>;
    private sender: WeakRef<observable.Observable>;
    private eventName: string;
    private handler: (eventData: observable.EventData) => void;
    private handlerContext: any;

    static rootWeakEventListenersMap = new WeakMap();

    private handlerCallback(eventData) {
        if (this.handler) {
            if (this.handlerContext) {
                this.handler.call(this.handlerContext, eventData);
            }
            else {
                this.handler(eventData);
            }
        }
    }

    private init(options: definition.WeakEventListenerOptions) {
        this.listener = options.targetWeakRef;
        this.sender = options.sourceWeakRef;
        this.eventName = options.eventName;
        this.handler = options.handler;
        if (options.handlerContext) {
            this.handlerContext = options.handlerContext;
        }
        var sourceInstance = this.sender.get();
        if (sourceInstance) {
            sourceInstance.addEventListener(this.eventName, this.handlerCallback, this);
        }
    }

    static addWeakEventListener(options: definition.WeakEventListenerOptions) {
        if (options.targetWeakRef && options.sourceWeakRef && options.eventName && options.handler && options.key) {
            var weakEventListener = new WeakEventListener();
            weakEventListener.init(options);
            var targetWeakEventListenersMap = WeakEventListener.getWeakMapValueByKeys([options.sourceWeakRef, options.targetWeakRef]);
            targetWeakEventListenersMap[options.key] = weakEventListener;
            return true;
        }
        else {
            return false;
        }
    }

    private clear() {
        var sourceInstance = this.sender.get();
        if (sourceInstance) {
            sourceInstance.removeEventListener(this.eventName, this.handlerCallback, this);
            this.sender.clear();
        }
        this.listener = undefined;
        this.eventName = undefined;
        this.handler = undefined;
        this.handlerContext = undefined;
    }

    static getWeakMapValueByKeys(keys) {
        var result;
        if (!WeakEventListener.rootWeakEventListenersMap) {
            WeakEventListener.rootWeakEventListenersMap = new WeakMap();
        }
        var currentMap = WeakEventListener.rootWeakEventListenersMap;
        var i;
        for (i = 0; i < keys.length - 1; i++) {
            if (currentMap.has(keys[i])) {
                currentMap = <WeakMap<{}, {}>>currentMap.get(keys[i]);
            }
            else {
                var innerMap = new WeakMap();
                currentMap.set(keys[i], innerMap);
                currentMap = innerMap;
            }
        }

        if (currentMap.has(keys[keys.length - 1])) {
            result = currentMap.get(keys[keys.length - 1]);
        }

        if (!result) {
            result = {};
            currentMap.set(keys[keys.length - 1], result);
        }
        return result;
    }

    static removeWeakEventListener(options: definition.WeakEventListenerOptions) {
        if (options && options.sourceWeakRef && options.targetWeakRef && options.key) {
            var weakMapValueForKey = WeakEventListener.getWeakMapValueByKeys([options.sourceWeakRef, options.targetWeakRef]);
            if (weakMapValueForKey && weakMapValueForKey[options.key]) {
                if (weakMapValueForKey[options.key] instanceof definition.WeakEventListener) {
                    (<WeakEventListener>weakMapValueForKey[options.key]).clear();
                }
                delete weakMapValueForKey[options.key];
            }
        }
    }
}