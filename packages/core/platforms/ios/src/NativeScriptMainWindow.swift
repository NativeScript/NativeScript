import SwiftUI
import NativeScriptEmbedder
import UIKit

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
                NativeScriptEmbedder.sharedInstance().setWindowScene(windowScene)
            }).onAppear {
                // print("NativeScriptAppView onAppear")
                DispatchQueue.main.async {
                    NativeScriptEmbedder.boot()
                }
            }.onReceive(NotificationCenter.default
                .publisher(for: NSNotification.Name("NativeScriptWindowOpen")), perform: { obj in
                    let info = parseWindowInfo(obj: obj)
                    let id = info.keys.first
                    Task {
                        if (info[id!]!) {
                            await openImmersiveSpace(id: id!)
                        } else {
                            openWindow(id: id!)
                        }
                    }
            }).onReceive(NotificationCenter.default
                .publisher(for: NSNotification.Name("NativeScriptWindowClose")), perform: { obj in
                    let info = parseWindowInfo(obj: obj)
                    let id = info.keys.first
                    Task {
                        if (info[id!]!) {
                            await dismissImmersiveSpace()
                        } else {
                            dismissWindow(id: id!)
                        }
                    }
                })
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
        NativeScriptViewFactory.initShared()
        NativeScriptEmbedder.sharedInstance().setDelegate(NativeScriptViewFactory.shared)
        NativeScriptEmbedder.setup()
    }

    #if os(visionOS)
    func parseWindowInfo(obj: Notification, close: Bool = false) -> [String:Bool] {
        if let userInfo = obj.userInfo {
            var id: String = ""
            var isImmersive = false
            for (key, value) in userInfo {
                let k = key as! String
                if (k == "type") {
                    id = value as! String
                } else if (k == "isImmersive") {
                    isImmersive = value as! Bool
                }
            }
            return [id: isImmersive]
            
        }
        return ["_": false]
    }
    #endif
}

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
