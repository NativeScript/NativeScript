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

    /// A block as the method `selector` of `cls`, typed as UIApplicationDelegate declares it.
    private static func add(_ cls: AnyClass, _ selector: ObjectiveC.Selector, _ block: Any) {
        let types = protocol_getMethodDescription(UIApplicationDelegate.self, selector, false, true).types
        class_addMethod(cls, selector, imp_implementationWithBlock(block), types)
    }
}
