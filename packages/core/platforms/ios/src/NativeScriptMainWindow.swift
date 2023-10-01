import SwiftUI
import NativeScriptEmbedder
import UIKit

struct NativeScriptMainWindow: Scene {
    var body: some Scene {
        // The main window that presents the app's modules.
        WindowGroup {
            NativeScriptAppView(found: { windowScene in
                NativeScriptEmbedder.sharedInstance().setWindowScene(windowScene)
            }).onAppear {
                print("NativeScriptAppView onAppear")
                DispatchQueue.main.async {
                    NativeScriptStart.boot()
                }
            }
        }
        .windowStyle(.plain)
    }

    init() {
        NativeScriptEmbedder.sharedInstance().setDelegate(NativeScriptViewRegistry.shared)
        NativeScriptStart.setup()
    }
}

// NOTE: this likely should go into @nativescript/swift-ui:
struct NativeScriptAppView: UIViewRepresentable {
    /// A closure that's called when the window is found.
    var found: ((UIWindowScene?) -> Void)
  
    func makeUIView(context: Context) -> UIView {
        print("make NativeScriptAppView")
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

@objc public class NativeScriptViewRegistry: NSObject, NativeScriptEmbedderDelegate {
    @objc public static let shared = NativeScriptViewRegistry()
    @objc public static let app = UIKitContainerCtrl()

    @objc public let views = NSMutableDictionary()
    @objc public var callback: ((String, UIKitContainerView) -> Void)? = nil
    
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
