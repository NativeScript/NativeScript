import SwiftUI
import NativeScriptEmbedder
import UIKit

@available(iOS 14.0, *)
struct NativeScriptMainWindow: Scene {
    
    #if os(visionOS)
    // Environment control
    @State var openedScenes: [String:Bool] = [:]
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
                    NativeScriptStart.boot()
                }
            }.onReceive(NotificationCenter.default
                .publisher(for: NSNotification.Name("NativeScriptOpenScene")), perform: { obj in
                Task {
                    if let userInfo = obj.userInfo {
                        var sceneType: String = ""
                        var isImmersive = false
                        for (key, value) in userInfo {
                            let k = key as! String
                            if (k == "type") {
                                sceneType = value as! String
                            } else if (k == "isImmersive") {
                                isImmersive = value as! Bool
                            }
                        }
           
                        let isOpened = openedScenes[sceneType] ?? false
                        if isOpened {
                            openedScenes[sceneType] = false
                            if (isImmersive) {
                                await dismissImmersiveSpace()
                            } else {
                                dismissWindow(id: sceneType)
                            }
                        } else {
                            openedScenes[sceneType] = true
                            if (isImmersive) {
                                await openImmersiveSpace(id: sceneType)
                            } else {
                                openWindow(id: sceneType)
                            }
                        }
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
                    NativeScriptStart.boot()
                }
            }
        }
        #endif
    }

    init() {
        NativeScriptEmbedder.sharedInstance().setDelegate(NativeScriptViewRegistry.shared)
        NativeScriptStart.setup()
    }
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
        
        return NativeScriptViewRegistry.app.view
    }
    
    func updateUIView(_ uiView: UIView, context: Context) {
        print("NativeScriptAppView updateUIView")
        // could update data through the controller
    }
}

@available(iOS 13.0, *)
@objc public class NativeScriptViewRegistry: NSObject, NativeScriptEmbedderDelegate {
    @objc public static let shared = NativeScriptViewRegistry()
    @objc public static let app = UIKitContainerCtrl()

    @objc public let views = NSMutableDictionary()
    @objc public var callback: ((String, UIKitContainerView) -> Void)? = nil
    
    @available(iOS 15.0, *)
    @objc public static func getKeyWindow() -> UIWindow? {
        return UIApplication
            .shared
            .connectedScenes
            .compactMap { ($0 as? UIWindowScene)?.keyWindow }
            .last
    }
    
    public func presentNativeScriptApp(_ vc: UIViewController!) -> Any! {
        vc.view.frame = NativeScriptViewRegistry.app.view.bounds
        vc.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        NativeScriptViewRegistry.app.addChild(vc)
        NativeScriptViewRegistry.app.view.addSubview(vc.view)
        vc.didMove(toParent: NativeScriptViewRegistry.app)
        return NativeScriptViewRegistry.app
    }
}

// UIViewController
@objc public class UIKitContainerCtrl: UIViewController {
    // allow NativeScript to override updateData for custom handling
    @objc public var updateData: ((_ data: NSMutableDictionary) -> Void)? = nil
}

// UIView
@objc public class UIKitContainerView: UIView {
    // allow NativeScript to override updateData for custom handling
    @objc public var updateData: ((_ data: NSMutableDictionary) -> Void)? = nil
}

// Notes:
// importing RealityKit causes App protocol to fail:
// Type 'VisionProApp' does not conform to protocol 'App'
// (likely expected, just interesting)
//import RealityKit
