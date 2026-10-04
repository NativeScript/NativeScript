import UIKit
import WebKit

/// `WebView` from web-view/index.ios: a WKWebView loading `src`, a URL or a
/// local path, or else HTML relative to the app folder; `loadStarted` and `loadFinished` follow its navigations.
open class WebView: View, WKNavigationDelegate, WKUIDelegate, UIScrollViewDelegate {
    open override class var cssType: String { "WebView" }
    open override class var overflowsSafeArea: Bool { true }

    private var webView: WKWebView? { nativeView as? WKWebView }
    private var zoom: (minimum: CGFloat, maximum: CGFloat, scale: CGFloat)?

    /// `knownFolders.currentApp().path`.
    private static var appPath: String { Bundle.main.bundlePath + "/app" }

    open override func createNativeView() -> UIView? {
        let source = "var meta = document.createElement('meta'); meta.setAttribute('name', 'viewport'); meta.setAttribute('content', 'initial-scale=1.0'); document.getElementsByTagName('head')[0].appendChild(meta);"
        let script = WKUserScript(source: source, injectionTime: .atDocumentEnd, forMainFrameOnly: true)
        let controller = WKUserContentController()
        controller.addUserScript(script)
        let configuration = WKWebViewConfiguration()
        configuration.userContentController = controller
        configuration.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        return WKWebView(frame: .zero, configuration: configuration)
    }

    open override func initNativeView() {
        webView?.navigationDelegate = self
        webView?.scrollView.delegate = self
        webView?.uiDelegate = self
    }

    open override func setProperty(_ name: String, _ value: Any?) {
        switch name {
        case "src":
            loadSource(toText(value) ?? "")
        case "disableZoom":
            if !(toBool(value) ?? false), let zoom, let scrollView = webView?.scrollView {
                scrollView.minimumZoomScale = zoom.minimum
                scrollView.maximumZoomScale = zoom.maximum
                scrollView.zoomScale = zoom.scale
                self.zoom = nil
            }
        default:
            super.setProperty(name, value)
        }
    }

    /// `srcProperty.setNative`.
    private func loadSource(_ value: String) {
        guard let webView else { return }
        webView.stopLoading()
        var src = value
        if src.hasPrefix("~/") {
            src = "file://\(WebView.appPath)/" + src.dropFirst(2)
        } else if src.hasPrefix("/") {
            src = "file://" + src
        }
        let lower = src.lowercased()
        if lower.hasPrefix("file:///") {
            src = src.addingPercentEncoding(withAllowedCharacters: WebView.encodeURIAllowed) ?? src
        }
        if lower.hasPrefix("http://") || lower.hasPrefix("https://") || lower.hasPrefix("file:///") {
            if lower.hasPrefix("file:///"), let url = URL(string: src) {
                let folder = String(src[..<(src.lastIndex(of: "/") ?? src.endIndex)])
                webView.loadFileURL(url, allowingReadAccessTo: URL(string: folder) ?? url)
            } else if let url = URL(string: src) {
                webView.load(URLRequest(url: url))
            }
        } else {
            webView.loadHTMLString(src, baseURL: URL(string: "file:///\(WebView.appPath)/"))
        }
    }

    /// The characters JavaScript's `encodeURI` leaves as they are.
    private static let encodeURIAllowed = CharacterSet(charactersIn: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789;,/?:@&=+$-_.!~*'()#")

    // MARK: WKNavigationDelegate, WKUIDelegate

    public func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        decisionHandler(.allow)
        if let url = navigationAction.request.url { emit("loadStarted", url.absoluteString) }
    }

    public func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        emit("loadFinished", webView.url?.absoluteString ?? toText(applied["src"]))
    }

    public func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        emit("loadFinished", webView.url?.absoluteString ?? toText(applied["src"]))
    }

    public func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        emit("loadFinished", webView.url?.absoluteString ?? toText(applied["src"]))
    }

    public func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if navigationAction.targetFrame == nil || navigationAction.targetFrame?.isMainFrame == false {
            webView.load(navigationAction.request)
        }
        return nil
    }

    // MARK: UIScrollViewDelegate

    private func handleDisableZoom(_ scrollView: UIScrollView) {
        guard toBool(applied["disableZoom"]) ?? false else { return }
        if zoom == nil { zoom = (scrollView.minimumZoomScale, scrollView.maximumZoomScale, scrollView.zoomScale) }
        scrollView.maximumZoomScale = 1
        scrollView.minimumZoomScale = 1
        scrollView.zoomScale = 1
    }

    public func scrollViewWillBeginZooming(_ scrollView: UIScrollView, with view: UIView?) { handleDisableZoom(scrollView) }

    public func scrollViewDidZoom(_ scrollView: UIScrollView) { handleDisableZoom(scrollView) }
}
