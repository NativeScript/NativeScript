import SwiftUI
import NativeScriptEmbedder
import UIKit

// Ensure runtime phases are called only once per app lifecycle
// In multi-scene apps, we need to ensure runtime doesn't reinit alongside main window
// For example, if @State is used to drive @Environment at the root level, we need to ensure
// a rerender of the main body doesn't cause runtime to cycle again
var hasMainInit = false
var hasMainBoot = false
var hasMainSetMainScene = false

@available(iOS 14.0, *)
struct NativeScriptMainWindow: Scene {
    
    #if os(visionOS)
    // Environment control
    @Environment(\.openWindow) private var openWindow
    @Environment(\.dismissWindow) private var dismissWindow
    @Environment(\.openImmersiveSpace) private var openImmersiveSpace
    @Environment(\.dismissImmersiveSpace) private var dismissImmersiveSpace
    #endif
    
    var body: some Scene {
        #if os(visionOS)
        // windowStyle is only supported on visionOS
        WindowGroup {
            NativeScriptAppView(found: { windowScene in
                if (!hasMainSetMainScene) {
                    hasMainSetMainScene = true
                    NativeScriptEmbedder.sharedInstance().setWindowScene(windowScene)
                }
            }).onAppear {
                // print("NativeScriptAppView onAppear")
                if (!hasMainBoot) {
                    hasMainBoot = true
                    DispatchQueue.main.async {
                        NativeScriptEmbedder.boot()
                    }
                 }
                // Must run synchronously here, before the boot() dispatched above executes:
                // the JS runtime cannot post window commands until it boots, so this ordering
                // guarantees the observers exist before the first command can arrive.
                NativeScriptWindowCommandCoordinator.shared.install(.init(
                    openWindow: openWindow,
                    dismissWindow: dismissWindow,
                    openImmersiveSpace: openImmersiveSpace,
                    dismissImmersiveSpace: dismissImmersiveSpace
                ))
            }
            .onOpenURL { (url) in
                NotificationCenter.default.post(name: Notification.Name("NativeScriptOpenURL"), object: nil, userInfo: ["url": url.absoluteString ])
            }
        }
        .windowStyle(.plain)
        #else
        WindowGroup {
            NativeScriptAppView(found: { windowScene in
                NativeScriptEmbedder.sharedInstance().setWindowScene(windowScene)
            }).onAppear {
                // print("NativeScriptAppView onAppear")
                DispatchQueue.main.async {
                    NativeScriptEmbedder.boot()
                }
                
            }
        }
        #endif
    }

    init() {
        if (!hasMainInit) {
            hasMainInit = true
            NativeScriptViewFactory.initShared()
            NativeScriptEmbedder.sharedInstance().setDelegate(NativeScriptViewFactory.shared)
            NativeScriptEmbedder.setup()
        }
    }

}

#if os(visionOS)
extension Notification.Name {
    static let nativeScriptWindowOpen = Notification.Name("NativeScriptWindowOpen")
    static let nativeScriptWindowClose = Notification.Name("NativeScriptWindowClose")
}

/// Routes window commands posted by the NativeScript runtime to SwiftUI environment actions.
/// The observers must outlive the view hierarchy: the main WindowGroup content can be torn
/// down and rebuilt (e.g. around immersive space transitions), and a view-scoped subscription
/// like .onReceive would miss commands posted during those gaps. Observers register once per
/// process, while the environment actions are rebound on every appearance so commands always
/// dispatch through actions from the current scene.
@MainActor
final class NativeScriptWindowCommandCoordinator {
    static let shared = NativeScriptWindowCommandCoordinator()

    struct Handlers {
        let openWindow: OpenWindowAction
        let dismissWindow: DismissWindowAction
        let openImmersiveSpace: OpenImmersiveSpaceAction
        let dismissImmersiveSpace: DismissImmersiveSpaceAction
    }

    private var handlers: Handlers?
    private var tokens: [NSObjectProtocol] = []

    func install(_ handlers: Handlers) {
        self.handlers = handlers
        guard tokens.isEmpty else { return }

        tokens.append(NotificationCenter.default.addObserver(forName: .nativeScriptWindowOpen, object: nil, queue: .main) { note in
            guard let (id, isImmersive) = Self.parse(note) else { return }
            Task { @MainActor in
                guard let handlers = Self.shared.handlers else { return }
                if isImmersive {
                    await handlers.openImmersiveSpace(id: id)
                } else {
                    handlers.openWindow(id: id)
                }
            }
        })
        tokens.append(NotificationCenter.default.addObserver(forName: .nativeScriptWindowClose, object: nil, queue: .main) { note in
            guard let (id, isImmersive) = Self.parse(note) else { return }
            Task { @MainActor in
                guard let handlers = Self.shared.handlers else { return }
                if isImmersive {
                    await handlers.dismissImmersiveSpace()
                } else {
                    handlers.dismissWindow(id: id)
                }
            }
        })
    }

    private nonisolated static func parse(_ note: Notification) -> (id: String, isImmersive: Bool)? {
        guard let id = note.userInfo?["type"] as? String, !id.isEmpty else { return nil }
        return (id, note.userInfo?["isImmersive"] as? Bool ?? false)
    }

    deinit {
        tokens.forEach(NotificationCenter.default.removeObserver)
    }
}
#endif

@available(iOS 13.0, *)
struct NativeScriptAppView: UIViewRepresentable {
    /// A closure that's called when the window is found.
    var found: ((UIWindowScene?) -> Void)
  
    func makeUIView(context: Context) -> UIView {
        // print("NativeScriptAppView makeUIView")
        var window: UIWindow? {
            guard let scene = UIApplication.shared.connectedScenes.first,
                  let windowSceneDelegate = scene.delegate as? UIWindowSceneDelegate,
                  let window = windowSceneDelegate.window else {
                return nil
            }
            return window
        }
        
        DispatchQueue.main.async {
            found(window?.windowScene)
        }
        
        return NativeScriptViewFactory.app!.view
    }
    
    func updateUIView(_ uiView: UIView, context: Context) {
        // print("NativeScriptAppView updateUIView")
        // could update data through the controller
    }
}

@available(iOS 13.0, *)
@objc public class NativeScriptViewFactory: NSObject, NativeScriptEmbedderDelegate {
    @objc static var shared: NativeScriptViewFactory?
    @objc static var app: NativeScriptContainerCtrl?
    
    // holds key/value map of views for lifecycle handling
    @objc public var views: NSMutableDictionary?

    // provided by NativeScript to coordinate view lifecycle
    @objc public var viewCreator: ((String) -> Void)? = nil
    @objc public var viewDestroyer: ((String) -> Void)? = nil

    // get or create (if needed) NativeScript views to represent in SwiftUI
    @objc public func getViewById(_ id: String) -> UIView {
        let vc = views!.object(forKey: id) as? UIView
        if (vc == nil) {
            // create the NativeScript view
            viewCreator!(id)
        }
        return views!.object(forKey: id) as! UIView
    }
    
    @available(iOS 15.0, *)
    @objc public static func getKeyWindow() -> UIWindow? {
        return UIApplication
            .shared
            .connectedScenes
            .compactMap { ($0 as? UIWindowScene)?.keyWindow }
            .last
    }

    @objc public static func initShared() {
        if (NativeScriptViewFactory.shared == nil) {
            NativeScriptViewFactory.app = NativeScriptContainerCtrl()
            NativeScriptViewFactory.shared = NativeScriptViewFactory()
            NativeScriptViewFactory.shared!.views = NSMutableDictionary()
        }
    }
    
    public func presentNativeScriptApp(_ vc: UIViewController!) -> Any! {
        vc.view.frame = NativeScriptViewFactory.app!.view.bounds
        vc.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        NativeScriptViewFactory.app!.addChild(vc)
        NativeScriptViewFactory.app!.view.addSubview(vc.view)
        vc.didMove(toParent: NativeScriptViewFactory.app)
        return NativeScriptViewFactory.app
    }
}

// UIViewController
@objc public class NativeScriptContainerCtrl: UIViewController {
    // allow NativeScript to override updateData for custom handling
    @objc public var updateData: ((_ data: NSMutableDictionary) -> Void)? = nil
}
