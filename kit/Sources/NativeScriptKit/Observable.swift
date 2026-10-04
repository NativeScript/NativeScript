import Foundation

/// What a listener receives: the object `notify` was called with. Core hands
/// listeners that object itself, so keys beyond `eventName`, `object` and
/// `value` (a drawer's `side`, a gesture handler's `data`) read by name.
public final class EventData: JSDynamic {
    public let eventName: String
    public let object: Observable
    public let value: Any?
    let fields: JSObject?

    public init(eventName: String, object: Observable, value: Any?) {
        self.eventName = eventName
        self.object = object
        self.value = value
        fields = nil
    }

    /// The object a `notify` was called with; `object` defaults to the notifier, as core's `notify` sets it.
    public init(js data: Any?, notifier: Observable) {
        let bag = jsFlat(data) as? JSDynamic
        eventName = (bag?[jsKey: "eventName"] as? String) ?? ""
        object = (bag?[jsKey: "object"] as? Observable) ?? notifier
        value = bag?[jsKey: "value"]
        if let o = bag as? JSObject { fields = o } else {
            let copy = JSObject()
            for key in bag?.jsKeys ?? [] { copy[key] = bag?[jsKey: key] }
            fields = copy
        }
    }

    public subscript(jsKey key: String) -> Any? {
        get {
            switch key {
            case "eventName": return eventName
            case "object": return object
            case "value" where fields == nil: return value
            default: return fields?[key]
            }
        }
        set { fields?[key] = newValue }
    }

    public var jsKeys: [String] { fields?.keys ?? ["eventName", "object", "value"] }
    public var jsClassName: String? { nil }
}

/// `Observable` from @nativescript/core's data/observable: listeners by event
/// name, each with the `this` it was added with; `notify` calls a copy of the
/// list in the order listeners were added.
open class Observable: NSObject, JSDynamic {
    public static let propertyChangeEvent = "propertyChange"

    final class Listener {
        let callback: (EventData) throws -> Void
        let thisArg: AnyObject?
        /// What identifies the callback for `off` (a method's name): Swift closures have no identity.
        let key: String?
        let once: Bool
        var isRemoved = false

        init(callback: @escaping (EventData) throws -> Void, thisArg: AnyObject?, key: String?, once: Bool) {
            self.callback = callback
            self.thisArg = thisArg
            self.key = key
            self.once = once
        }
    }

    private var observers: [String: [Listener]] = [:]
    /// Expando properties (`object.someKey = value` on a key the class does not declare).
    var expandos: JSObject?

    public override init() { super.init() }

    open func on(_ eventNames: String, _ callback: @escaping (EventData) throws -> Void, _ thisArg: Any? = nil, key: String? = nil) {
        addEventListener(eventNames, callback, thisArg, key: key)
    }

    open func once(_ eventNames: String, _ callback: @escaping (EventData) throws -> Void, _ thisArg: Any? = nil, key: String? = nil) {
        addEventListener(eventNames, callback, thisArg, once: true, key: key)
    }

    open func off(_ eventNames: String, _ callback: ((EventData) throws -> Void)? = nil, _ thisArg: Any? = nil, key: String? = nil) {
        removeEventListener(eventNames, callback, thisArg, key: key)
    }

    open func addEventListener(_ eventName: String, _ callback: @escaping (EventData) throws -> Void, _ thisArg: Any? = nil, once: Bool = false, key: String? = nil) {
        let this = (jsFlat(thisArg) as AnyObject?)
        var list = observers[eventName] ?? []
        if let key, list.contains(where: { $0.key == key && $0.thisArg === this }) { return }
        list.append(Listener(callback: callback, thisArg: this, key: key, once: once))
        observers[eventName] = list
        listenerAdded(eventName)
    }

    open func removeEventListener(_ eventName: String, _ callback: ((EventData) throws -> Void)? = nil, _ thisArg: Any? = nil, key: String? = nil) {
        guard var list = observers[eventName] else { return }
        let this = (jsFlat(thisArg) as AnyObject?)
        if callback == nil && key == nil {
            for entry in list { entry.isRemoved = true }
            list = []
        } else if let index = list.firstIndex(where: { ($0.key == key) && $0.thisArg === this }) {
            list[index].isRemoved = true
            list.remove(at: index)
        }
        observers[eventName] = list.isEmpty ? nil : list
    }

    /// A first listener for an event: views start observing a gesture.
    open func listenerAdded(_ eventName: String) {}

    /// `notify(data)`: `data` is the object listeners receive.
    public func notify(_ data: Any?) {
        let event = (jsFlat(data) as? EventData) ?? EventData(js: data, notifier: self)
        fire(event)
    }

    public func notifyPropertyChange(_ name: String, _ value: Any?, _ oldValue: Any? = nil) {
        notify(JSObject([("eventName", Observable.propertyChangeEvent), ("object", self), ("propertyName", name), ("value", value), ("oldValue", oldValue)]))
    }

    public func hasListeners(_ eventName: String) -> Bool { observers[eventName] != nil }

    var hasAnyListeners: Bool { !observers.isEmpty }

    public func _emit(_ eventName: String) { fire(EventData(eventName: eventName, object: self, value: nil)) }

    /// The listeners of an event, as `_getEventList` returns them (an array of entries).
    public func _getEventList(_ eventName: String, _ createIfNeeded: Bool? = nil) -> JSArray<Any?>? {
        guard let list = observers[eventName] else { return createIfNeeded == true ? JSArray() : nil }
        return JSArray(list.map { $0 as Any? })
    }

    func fire(_ event: EventData) {
        guard let observers = self.observers[event.eventName], !observers.isEmpty else { return }
        for entry in observers where !entry.isRemoved {
            if entry.once {
                entry.isRemoved = true
                self.observers[event.eventName]?.removeAll { $0 === entry }
                if self.observers[event.eventName]?.isEmpty == true { self.observers[event.eventName] = nil }
            }
            jsReport { try entry.callback(event) }
        }
    }

    /// `get(name)` / `set(name, value)` on a plain Observable: its own properties by name.
    open func get(_ name: String) -> Any? { self[jsKey: name] }

    open func set(_ name: String, _ value: Any?) {
        let old = self[jsKey: name]
        if jsStrictEquals(old, value) { return }
        self[jsKey: name] = value
        notifyPropertyChange(name, value, old)
    }

    // MARK: JSDynamic

    open subscript(jsKey key: String) -> Any? {
        get {
            switch key {
            // An Observable held untyped (`handler.on(…)` on an `any`): its listener methods by name.
            case "on", "once", "off", "addEventListener", "removeEventListener":
                return { [weak self] (args: [Any?]) throws -> Any? in
                    guard let self, let names = jsArg(args, 0) as? String else { return nil }
                    let fn = jsArg(args, 1)
                    let callback: (EventData) throws -> Void = { event in _ = try jsCall(fn, event) }
                    // A function's identity is the function value itself, as script compares it.
                    let identity = (jsFlat(fn) as AnyObject?).map { String(describing: ObjectIdentifier($0)) }
                    switch key {
                    case "on", "addEventListener": self.on(names, callback, jsArg(args, 2), key: identity)
                    case "once": self.once(names, callback, jsArg(args, 2), key: identity)
                    default: self.off(names, identity == nil ? nil : callback, jsArg(args, 2), key: identity)
                    }
                    return nil
                } as JSFunction
            case "notify": return { [weak self] (args: [Any?]) throws -> Any? in self?.notify(jsArg(args, 0)); return nil } as JSFunction
            default: return expandos?[key]
            }
        }
        set {
            if expandos == nil { expandos = JSObject() }
            expandos![key] = newValue
        }
    }

    open var jsKeys: [String] { expandos?.keys ?? [] }
    open var jsClassName: String? { String(describing: type(of: self)) }
}
