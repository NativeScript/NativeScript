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
        UIApplicationMain(CommandLine.argc, CommandLine.unsafeArgv, nil, NSStringFromClass(ApplicationDelegate.self))
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
        let configuration = UISceneConfiguration(name: nil, sessionRole: session.role)
        configuration.delegateClass = SceneDelegate.self
        return configuration
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
        if ProcessInfo.processInfo.environment["NS_TRACE"] != nil {
            DispatchQueue.main.asyncAfter(deadline: .now() + 3) { print("TREE", (window.value(forKey: "recursiveDescription") as? String) ?? "") }
        }
    }
}
