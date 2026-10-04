import UIKit

/// The app entry point: `Application.run` from @nativescript/core without the
/// JavaScript runtime. Parses the app's CSS once and shows the root view in a
/// scene's window.
public enum NativeScriptApplication {
    static var makeRoot: (() -> View)?
    /// The app's CSS, for an entry that runs through `Application.run`.
    public static var css = ""

    public static func run(css: String, root: @escaping () -> View) -> Never {
        StyleSheet.app = StyleSheet(parsing: css)
        JSEventLoop.installRunLoopObserver()
        makeRoot = root
        Application.observeLifecycle()
        UIApplicationMain(CommandLine.argc, CommandLine.unsafeArgv, nil, NSStringFromClass(ApplicationDelegate.delegateClass()))
        fatalError("UIApplicationMain returned")
    }

    /// `getViewController`: a frame's or page's own controller, else a layout controller hosting the view.
    static func rootController(for view: View) -> UIViewController {
        if let controller = view.viewController { return controller }
        let controller = LayoutViewController(owner: view)
        view.viewController = controller
        if let nativeView = view.nativeView { controller.view.addSubview(nativeView) }
        return controller
    }
}

final class ApplicationDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, configurationForConnecting session: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        ApplicationDelegate.sceneConfiguration(session)
    }

    static func sceneConfiguration(_ session: UISceneSession) -> UISceneConfiguration {
        let configuration = UISceneConfiguration(name: nil, sessionRole: session.role)
        configuration.delegateClass = SceneDelegate.self
        return configuration
    }

    /// The class `UIApplicationMain` runs: the app's own (`Application.ios.delegate`) with the scene
    /// configuration installed where it has none, as core's `installSceneDelegateDefaults` does, else the kit's.
    static func delegateClass() -> AnyClass {
        guard let custom = iOSApplication.shared.delegate else { return ApplicationDelegate.self }
        let selector = #selector(UIApplicationDelegate.application(_:configurationForConnecting:options:))
        if !class_respondsToSelector(custom, selector), let method = class_getInstanceMethod(ApplicationDelegate.self, selector) {
            class_addMethod(custom, selector, method_getImplementation(method), method_getTypeEncoding(method))
        }
        return custom
    }
}

final class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?
    private var root: View?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene, let makeRoot = NativeScriptApplication.makeRoot else { return }
        let window = UIWindow(windowScene: windowScene)
        window.backgroundColor = .systemBackground
        Appearance.window = window
        let root = makeRoot()
        root.rootClasses = Appearance.rootClasses()
        Modal.root = root
        root.load()
        window.rootViewController = NativeScriptApplication.rootController(for: root)
        window.registerForTraitChanges([UITraitUserInterfaceStyle.self, UITraitLayoutDirection.self,
                                        UITraitHorizontalSizeClass.self, UITraitVerticalSizeClass.self]) { [weak root] (_: UIWindow, _: UITraitCollection) in
            if let root { Appearance.refresh(root) }
        }
        window.makeKeyAndVisible()
        self.window = window
        self.root = root
        Application.notify(JSObject([("eventName", Application.launchEvent), ("ios", UIApplication.shared)]))
        if let delay = ProcessInfo.processInfo.environment["NS_TRACE_TREE"].flatMap(Double.init) {
            DispatchQueue.main.asyncAfter(deadline: .now() + delay) { print("TREE", (window.value(forKey: "recursiveDescription") as? String) ?? "") }
        }
    }

    /// core's scene-delegate-bridge: a scene's URLs and activities go to the app delegate's legacy handlers.
    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        for context in URLContexts { forwardOpenURL(context.url, context.options) }
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        let selector = #selector(UIApplicationDelegate.application(_:continue:restorationHandler:))
        guard let delegate = UIApplication.shared.delegate, delegate.responds(to: selector) else { return }
        _ = delegate.application?(UIApplication.shared, continue: userActivity) { _ in }
        Microtasks.checkpoint()
    }

    private func forwardOpenURL(_ url: URL, _ options: UIScene.OpenURLOptions) {
        guard let delegate = UIApplication.shared.delegate, delegate.responds(to: #selector(UIApplicationDelegate.application(_:open:options:))) else { return }
        var legacy: [UIApplication.OpenURLOptionsKey: Any] = [:]
        if let source = options.sourceApplication { legacy[.sourceApplication] = source }
        if let annotation = options.annotation { legacy[.annotation] = annotation }
        legacy[.openInPlace] = options.openInPlace
        _ = delegate.application?(UIApplication.shared, open: url, options: legacy)
        Microtasks.checkpoint()
    }
}
