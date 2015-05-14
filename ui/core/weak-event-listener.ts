import observable = require("data/observable");
import definition = require("ui/core/weak-event-listener");
import types = require("utils/types");

var CLEAN_TRIGGER_DEFAULT = 1000;
export class WeakEventListener implements definition.WeakEventListener {
    private id: number;
    private targetRef: WeakRef<any>;
    private senderRef: WeakRef<observable.Observable>;
    private eventName: string;
    private handler: (eventData: observable.EventData) => void;

    static _idCounter: number = 0;
    static _weakEventListeners = {};
    static _cleanDeadReferencesCountTrigger = CLEAN_TRIGGER_DEFAULT;
    static get cleanDeadReferencesCountTrigger(): number {
        return WeakEventListener._cleanDeadReferencesCountTrigger;
    }
    static set cleanDeadReferencesCountTrigger(value: number) {
        WeakEventListener._cleanDeadReferencesCountTrigger = value;
    }

    private handlerCallback(eventData) {
        var target = this.targetRef.get();
        if (target) {
            this.handler.call(target, eventData);
        }
        else {
            // The target is dead - we can unsubscribe;
            WeakEventListener.removeWeakEventListener(this.id);
        }
    }

    private init(options: definition.WeakEventListenerOptions, listenerId: number) {
        this.id = listenerId;
        this.targetRef = new WeakRef(options.target);
        this.senderRef = new WeakRef(options.source);
        this.eventName = options.eventName;
        this.handler = options.handler;

        var sourceInstance = this.senderRef.get();
        if (sourceInstance) {
            sourceInstance.addEventListener(this.eventName, this.handlerCallback, this);
        }
    }

    private clear() {
        var sender = this.senderRef.get();
        if (sender) {
            sender.removeEventListener(this.eventName, this.handlerCallback, this);
        }

        this.targetRef.clear();
        this.targetRef = undefined;
        this.senderRef.clear();
        this.senderRef = undefined;

        this.eventName = undefined;
        this.handler = undefined;
    }

    static addWeakEventListener(options: definition.WeakEventListenerOptions) {
        if (types.isNullOrUndefined(options.target)) {
            throw new Error("targetWeakRef is null or undefined");
        }

        if (types.isNullOrUndefined(options.source)) {
            throw new Error("sourceWeakRef is null or undefined");
        }

        if (!types.isString(options.eventName)) {
            throw new Error("eventName is not a string");
        }

        if (!types.isFunction(options.handler)) {
            throw new Error("handler is not a function");
        }

        var listenerId = WeakEventListener._idCounter++;
        var weakEventListener = new WeakEventListener();
        weakEventListener.init(options, listenerId);

        WeakEventListener._weakEventListeners[listenerId] = new WeakRef(weakEventListener);

        if (WeakEventListener._cleanDeadReferencesCountTrigger &&
            (listenerId % WeakEventListener._cleanDeadReferencesCountTrigger) === 0) {
            WeakEventListener._cleanDeadReferences();
        }

        return listenerId;
    }

    static removeWeakEventListener(listenerId: number) {
        var listenerRef = <WeakRef<WeakEventListener>>WeakEventListener._weakEventListeners[listenerId];

        if (listenerRef) {
            var listener = <WeakEventListener>listenerRef.get();
            if (listener) {
                listener.clear();
            }
        }

        delete WeakEventListener._weakEventListeners[listenerId];
    }

    static _cleanDeadReferences() {
        var deadListeners = new Array<number>();
        for (var id in WeakEventListener._weakEventListeners) {
            var listenerRef = <WeakRef<WeakEventListener>>WeakEventListener._weakEventListeners[id];

            var listener = listenerRef.get();
            if (!listener || !listener.targetRef.get() || !listener.senderRef.get()) {
                deadListeners.push(id);
            }
        }

        for (var i = 0; i < deadListeners.length; i++) {
            WeakEventListener.removeWeakEventListener(deadListeners[i]);
        }
    }
}
