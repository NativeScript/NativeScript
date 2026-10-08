import Foundation
import ObjectiveC
import UIKit

/// core's `installSceneDelegateDefaults` and `warnAboutDelegateClass` (application.ios), which
/// patch and inspect the delegate class's prototype through the iOS runtime: here through the
/// Objective-C runtime, on the class UIApplicationMain is given.
enum ApplicationDelegateClass {
    private static var windowKey: UInt8 = 0

    /// The scene members and `window` UIKit asks a delegate for, added to the class where it
    /// (or a superclass) has none, so a delegate's own implementation is kept.
    static func installSceneDelegateDefaults(_ delegateClass: Any?) throws {
        guard let cls = jsFlat(delegateClass) as? AnyClass else { return }
        if Core_application_application.supportsScenes() {
            let configure = #selector(UIApplicationDelegate.application(_:configurationForConnecting:options:))
            if !class_respondsToSelector(cls, configure) {
                let body: @convention(block) (AnyObject, UIApplication, UISceneSession, UIScene.ConnectionOptions) -> UISceneConfiguration = { _, application, session, options in
                    // UIKit requires a configuration: where core's throws (reported), the session's default.
                    jsReported { try Core_application_application.Application.ios.defaultSceneConfiguration(application, session, options) }
                        ?? UISceneConfiguration(name: nil, sessionRole: session.role)
                }
                add(cls, configure, body)
            }
            let discard = #selector(UIApplicationDelegate.application(_:didDiscardSceneSessions:))
            if !class_respondsToSelector(cls, discard) {
                let body: @convention(block) (AnyObject, UIApplication, Set<UISceneSession>) -> Void = { _, application, sessions in
                    jsReport { try Core_application_application.Application.ios.defaultDiscardSceneSessions(application, sessions as NSSet) }
                }
                add(cls, discard, body)
            }
        }
        let getter = #selector(getter: UIApplicationDelegate.window)
        if !class_respondsToSelector(cls, getter) {
            // UIKit assigns `window` on apps without scenes and a delegate may assign it itself: the value is kept.
            let get: @convention(block) (AnyObject) -> UIWindow? = { this in
                objc_getAssociatedObject(this, &windowKey) as? UIWindow ?? jsReported { try Core_application_application.Application.ios.window }
            }
            let set: @convention(block) (AnyObject, UIWindow?) -> Void = { this, value in
                objc_setAssociatedObject(this, &windowKey, value, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
            }
            add(cls, getter, get)
            add(cls, #selector(setter: UIApplicationDelegate.window), set)
        }
    }

    /// Reports a delegate class that does not conform to UIApplicationDelegate, and one assigned
    /// once UIApplicationMain has been given a class, each once.
    static func warnAboutDelegateClass(_ delegateClass: Any?, _ alreadyStarted: Bool) throws {
        let conforms = (jsFlat(delegateClass) as? NSObject.Type)?.conforms(to: UIApplicationDelegate.self) ?? false
        if !Core_application_application.warnedAboutDelegateProtocols && !conforms {
            Core_application_application.warnedAboutDelegateProtocols = true
            try Core_application_application.warnAboutDelegate("Application.ios.delegate was set to a class that does not list UIApplicationDelegate in its static ObjCProtocols. Add `static ObjCProtocols = [UIApplicationDelegate];` to the class body: the Objective-C class is built from ObjCProtocols and cached, so conformance cannot be declared from here and UIKit may never dispatch the delegate methods.")
        }
        if alreadyStarted && !Core_application_application.warnedAboutDelegateAfterStart {
            Core_application_application.warnedAboutDelegateAfterStart = true
            try Core_application_application.warnAboutDelegate("Application.ios.delegate was set after the application started. UIApplicationMain has already been given a delegate class, so this assignment has no effect — set Application.ios.delegate before calling Application.run().")
        }
    }

    /// `Application.ios.delegate`: the class UIApplicationMain is given. Core's iOS runtime holds the
    /// class object itself, which its typings call an instance.
    private static var delegateClass: AnyClass?

    static func delegate(_ app: iOSApplication) throws -> AnyClass? { delegateClass }

    static func delegate(_ app: iOSApplication, _ value: Any?) throws {
        let cls = jsFlat(value) as? AnyClass
        if cls.map(ObjectIdentifier.init) == delegateClass.map(ObjectIdentifier.init) && (cls != nil || jsFlat(value) == nil) { return }
        delegateClass = cls
        if jsTruthy(value) {
            try warnAboutDelegateClass(value, app.started)
            try installSceneDelegateDefaults(value)
        }
    }

    /// `Application.ios.addDelegateHandler(name, handler)`: the delegate class's method `name` runs the
    /// class's own implementation, if it has one, and then each handler added for it, with the delegate
    /// as `this`; its result is the last handler's. Core chains them on the prototype; here the method is
    /// replaced through the Objective-C runtime, for the delegate methods known below.
    static func addDelegateHandler(_ app: iOSApplication, _ methodName: Any?, _ handler: Any?) throws {
        guard jsTypeof(handler) == "function" else { return }
        // Responder carries the defaults already: kept without the setter's warnings, as core does.
        if delegateClass == nil { delegateClass = Responder.self }
        let name = jsToString(methodName)
        let handlers = app._delegateHandlers.get(name) ?? JSArray<Any?>()
        if !app._delegateHandlers.has(name) {
            if !chain(delegateClass!, name, handlers) {
                try Core_application_application.warnAboutDelegate("Application.ios.addDelegateHandler('\(name)'): not a UIApplicationDelegate method the compiled app can add handlers to, so the handler never runs.")
            }
            _ = app._delegateHandlers.set(name, handlers)
        }
        _ = handlers.push(handler)
    }

    /// core's `getLegacyMethod` (scene-delegate-bridge): the delegate class's method that the bridge
    /// forwards a scene callback to, where the class implements it, as a function of the delegate as `this`.
    static func getLegacyMethod(_ delegate: AnyClass?, _ methodName: String) throws -> Any? {
        guard let cls = delegate else { return nil }
        let method: JSMethod
        switch methodName {
        case "applicationOpenURLOptions":
            method = { this, args in
                guard let target = jsFlat(this) as? UIApplicationDelegate, let app = jsFlat(jsArg(args, 0)) as? UIApplication, let url = jsFlat(jsArg(args, 1)) as? URL else { return nil }
                let options = (jsFlat(jsArg(args, 2)) as? NSDictionary) as? [UIApplication.OpenURLOptionsKey: Any] ?? [:]
                return target.application?(app, open: url, options: options)
            }
        case "applicationContinueUserActivityRestorationHandler":
            method = { this, args in
                guard let target = jsFlat(this) as? UIApplicationDelegate, let app = jsFlat(jsArg(args, 0)) as? UIApplication, let activity = jsFlat(jsArg(args, 1)) as? NSUserActivity else { return nil }
                let restoration = jsArg(args, 2)
                return target.application?(app, continue: activity, restorationHandler: { objects in jsReport { try callBack(restoration, objects as NSArray?) } })
            }
        case "applicationPerformActionForShortcutItemCompletionHandler":
            method = { this, args in
                guard let target = jsFlat(this) as? UIApplicationDelegate, let app = jsFlat(jsArg(args, 0)) as? UIApplication, let item = jsFlat(jsArg(args, 1)) as? UIApplicationShortcutItem else { return nil }
                let completion = jsArg(args, 2)
                target.application?(app, performActionFor: item, completionHandler: { handled in jsReport { try callBack(completion, handled) } })
                return nil
            }
        default:
            return nil
        }
        return class_respondsToSelector(cls, selector(methodName)) ? method : nil
    }

    /// A function script passed to a native method's callback parameter: a typed closure core made, or a script function.
    private static func callBack(_ function: Any?, _ value: Any?) throws {
        if let f = jsFlat(function) as? (Bool) throws -> Void { try f(jsTruthy(value)) } else { try jsCall(function, value) }
    }

    /// The selector of a delegate method script names (`applicationOpenURLOptions`).
    private static func selector(_ name: String) -> ObjectiveC.Selector {
        NSSelectorFromString(selectors[name] ?? name + ":")
    }

    private static let selectors = [
        "applicationWillFinishLaunchingWithOptions": "application:willFinishLaunchingWithOptions:",
        "applicationDidFinishLaunchingWithOptions": "application:didFinishLaunchingWithOptions:",
        "applicationOpenURLOptions": "application:openURL:options:",
        "applicationContinueUserActivityRestorationHandler": "application:continueUserActivity:restorationHandler:",
        "applicationPerformActionForShortcutItemCompletionHandler": "application:performActionForShortcutItem:completionHandler:",
        "applicationDidRegisterForRemoteNotificationsWithDeviceToken": "application:didRegisterForRemoteNotificationsWithDeviceToken:",
        "applicationDidFailToRegisterForRemoteNotificationsWithError": "application:didFailToRegisterForRemoteNotificationsWithError:",
        "applicationDidReceiveRemoteNotificationFetchCompletionHandler": "application:didReceiveRemoteNotification:fetchCompletionHandler:",
        "applicationHandleEventsForBackgroundURLSessionCompletionHandler": "application:handleEventsForBackgroundURLSession:completionHandler:",
        "applicationSupportedInterfaceOrientationsForWindow": "application:supportedInterfaceOrientationsForWindow:",
    ]

    /// The delegate methods taking only the application.
    private static let applicationOnly: Set<String> = [
        "applicationDidFinishLaunching", "applicationDidBecomeActive", "applicationWillResignActive", "applicationDidEnterBackground",
        "applicationWillEnterForeground", "applicationWillTerminate", "applicationDidReceiveMemoryWarning", "applicationSignificantTimeChange",
        "applicationProtectedDataWillBecomeUnavailable", "applicationProtectedDataDidBecomeAvailable",
    ]

    /// Replaces the method `name` of `cls` with one that runs the method it had and then `handlers`; false where `name` is not known here.
    private static func chain(_ cls: AnyClass, _ name: String, _ handlers: JSArray<Any?>) -> Bool {
        let sel = selector(name)
        func original<F>(_: F.Type) -> F? {
            class_respondsToSelector(cls, sel) ? class_getMethodImplementation(cls, sel).map { unsafeBitCast($0, to: F.self) } : nil
        }
        if applicationOnly.contains(name) {
            let own = original((@convention(c) (AnyObject, ObjectiveC.Selector, UIApplication) -> Void).self)
            let body: @convention(block) (AnyObject, UIApplication) -> Void = { this, app in
                own?(this, sel, app)
                _ = run(handlers, this, [app])
            }
            return replace(cls, sel, body)
        }
        switch name {
        case "applicationWillFinishLaunchingWithOptions", "applicationDidFinishLaunchingWithOptions":
            let own = original((@convention(c) (AnyObject, ObjectiveC.Selector, UIApplication, NSDictionary?) -> Bool).self)
            let body: @convention(block) (AnyObject, UIApplication, NSDictionary?) -> Bool = { this, app, options in
                _ = own?(this, sel, app, options)
                return jsTruthy(run(handlers, this, [app, options]))
            }
            return replace(cls, sel, body)
        case "applicationOpenURLOptions":
            let own = original((@convention(c) (AnyObject, ObjectiveC.Selector, UIApplication, NSURL, NSDictionary) -> Bool).self)
            let body: @convention(block) (AnyObject, UIApplication, NSURL, NSDictionary) -> Bool = { this, app, url, options in
                _ = own?(this, sel, app, url, options)
                return jsTruthy(run(handlers, this, [app, url, options]))
            }
            return replace(cls, sel, body)
        case "applicationContinueUserActivityRestorationHandler":
            typealias Restore = @convention(block) (NSArray?) -> Void
            let own = original((@convention(c) (AnyObject, ObjectiveC.Selector, UIApplication, NSUserActivity, Restore) -> Bool).self)
            let body: @convention(block) (AnyObject, UIApplication, NSUserActivity, @escaping Restore) -> Bool = { this, app, activity, restore in
                _ = own?(this, sel, app, activity, restore)
                let handler = { (args: [Any?]) throws -> Any? in restore(jsFlat(jsArg(args, 0)) as? NSArray); return nil } as JSFunction
                return jsTruthy(run(handlers, this, [app, activity, handler]))
            }
            return replace(cls, sel, body)
        case "applicationPerformActionForShortcutItemCompletionHandler":
            typealias Done = @convention(block) (Bool) -> Void
            let own = original((@convention(c) (AnyObject, ObjectiveC.Selector, UIApplication, UIApplicationShortcutItem, Done) -> Void).self)
            let body: @convention(block) (AnyObject, UIApplication, UIApplicationShortcutItem, @escaping Done) -> Void = { this, app, item, done in
                own?(this, sel, app, item, done)
                let handler = { (args: [Any?]) throws -> Any? in done(jsTruthy(jsArg(args, 0))); return nil } as JSFunction
                _ = run(handlers, this, [app, item, handler])
            }
            return replace(cls, sel, body)
        case "applicationDidRegisterForRemoteNotificationsWithDeviceToken", "applicationDidFailToRegisterForRemoteNotificationsWithError":
            let own = original((@convention(c) (AnyObject, ObjectiveC.Selector, UIApplication, NSObject) -> Void).self)
            let body: @convention(block) (AnyObject, UIApplication, NSObject) -> Void = { this, app, value in
                own?(this, sel, app, value)
                _ = run(handlers, this, [app, value])
            }
            return replace(cls, sel, body)
        case "applicationDidReceiveRemoteNotificationFetchCompletionHandler":
            typealias Fetched = @convention(block) (UInt) -> Void
            let own = original((@convention(c) (AnyObject, ObjectiveC.Selector, UIApplication, NSDictionary, Fetched) -> Void).self)
            let body: @convention(block) (AnyObject, UIApplication, NSDictionary, @escaping Fetched) -> Void = { this, app, payload, fetched in
                own?(this, sel, app, payload, fetched)
                let handler = { (args: [Any?]) throws -> Any? in fetched(UInt(exactly: jsToNumber(jsArg(args, 0))) ?? 0); return nil } as JSFunction
                _ = run(handlers, this, [app, payload, handler])
            }
            return replace(cls, sel, body)
        case "applicationHandleEventsForBackgroundURLSessionCompletionHandler":
            typealias Done = @convention(block) () -> Void
            let own = original((@convention(c) (AnyObject, ObjectiveC.Selector, UIApplication, NSString, Done) -> Void).self)
            let body: @convention(block) (AnyObject, UIApplication, NSString, @escaping Done) -> Void = { this, app, identifier, done in
                own?(this, sel, app, identifier, done)
                let handler = { (_: [Any?]) throws -> Any? in done(); return nil } as JSFunction
                _ = run(handlers, this, [app, identifier as String, handler])
            }
            return replace(cls, sel, body)
        case "applicationSupportedInterfaceOrientationsForWindow":
            let own = original((@convention(c) (AnyObject, ObjectiveC.Selector, UIApplication, UIWindow?) -> UInt).self)
            let body: @convention(block) (AnyObject, UIApplication, UIWindow?) -> UInt = { this, app, window in
                _ = own?(this, sel, app, window)
                return UInt(exactly: jsToNumber(run(handlers, this, [app, window]))) ?? 0
            }
            return replace(cls, sel, body)
        default:
            return false
        }
    }

    /// The handlers called in order with the delegate as `this`: the last one's result. What one throws is reported, and the rest don't run.
    private static func run(_ handlers: JSArray<Any?>, _ this: AnyObject, _ args: [Any?]) -> Any? {
        jsReported { () throws -> Any? in
            var result: Any? = nil
            for handler in handlers where jsTypeof(handler) == "function" {
                result = try jsCallMethod(handler, "apply", this, JSArray<Any?>(args))
            }
            return result
        } ?? nil
    }

    /// A block as the method `selector` of `cls`, typed as UIApplicationDelegate declares it.
    private static func add(_ cls: AnyClass, _ selector: ObjectiveC.Selector, _ block: Any) {
        let types = protocol_getMethodDescription(UIApplicationDelegate.self, selector, false, true).types
        class_addMethod(cls, selector, imp_implementationWithBlock(block), types)
    }

    /// A block as the method `selector` of `cls` in place of the one it has (its own or inherited).
    private static func replace(_ cls: AnyClass, _ selector: ObjectiveC.Selector, _ block: Any) -> Bool {
        let types = protocol_getMethodDescription(UIApplicationDelegate.self, selector, false, true).types
        class_replaceMethod(cls, selector, imp_implementationWithBlock(block), types)
        return true
    }
}
