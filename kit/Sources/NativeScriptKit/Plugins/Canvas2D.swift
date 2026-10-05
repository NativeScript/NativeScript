import UIKit

// @nativescript/canvas's view and its 2D context, on Core Graphics: the subset
// of CanvasRenderingContext2D a native build implements (the plugin's own
// renderer is Skia through CanvasNative.xcframework, whose JavaScript API binds
// to V8). Drawing goes to a bitmap the size of the surface (`width`/`height`,
// device pixels) and is shown once per run loop turn, as the plugin flushes once
// per frame. Gradients and antialiasing are Core Graphics', not Skia's.

private final class CanvasSurfaceView: UIView {
    weak var owner: Canvas?
    private var announced = false

    override func layoutSubviews() {
        super.layoutSubviews()
        // The plugin's `ready` comes from its surface once the view has a size.
        guard !announced, bounds.width > 0, bounds.height > 0 else { return }
        announced = true
        DispatchQueue.main.async { [weak self] in self?.owner?.surfaceReady() }
    }
}

open class Canvas: View {
    open override class var cssType: String { "Canvas" }
    private var context: CanvasRenderingContext2D?
    private var surfaceWidth = 0.0, surfaceHeight = 0.0

    open override func createNativeView() -> UIView? {
        let view = CanvasSurfaceView()
        view.owner = self
        view.backgroundColor = .clear
        view.isOpaque = false
        view.layer.contentsGravity = .resize
        return view
    }

    open override func setProperty(_ name: String, _ value: Any?) {
        switch name {
        case "ignoreTouchEvents": nativeView?.isUserInteractionEnabled = !(toBool(value) ?? false)
        default: super.setProperty(name, value)
        }
    }

    func surfaceReady() {
        if surfaceWidth == 0, let bounds = nativeView?.bounds {
            surfaceWidth = (Double(bounds.width) * Double(UIScreen.main.scale)).rounded()
            surfaceHeight = (Double(bounds.height) * Double(UIScreen.main.scale)).rounded()
        }
        emit("ready", nil)
    }

    /// The surface's size in device pixels; setting it clears the surface and resets the context.
    public var width: Double {
        get { surfaceWidth }
        set { surfaceWidth = max(0, newValue.rounded(.down)); context?.resize(Int(surfaceWidth), Int(surfaceHeight)) }
    }

    public var height: Double {
        get { surfaceHeight }
        set { surfaceHeight = max(0, newValue.rounded(.down)); context?.resize(Int(surfaceWidth), Int(surfaceHeight)) }
    }

    public func getContext(_ type: String, _ options: Any? = nil) -> CanvasRenderingContext2D? {
        guard type == "2d" else { return nil }
        if context == nil { context = CanvasRenderingContext2D(self, Int(surfaceWidth), Int(surfaceHeight)) }
        return context
    }

    fileprivate func present(_ image: CGImage?) {
        nativeView?.layer.contents = image
    }
}

/// `createRadialGradient`/`createLinearGradient`: color stops by offset.
public final class CanvasGradient {
    fileprivate enum Kind {
        case radial(CGPoint, CGFloat, CGPoint, CGFloat)
        case linear(CGPoint, CGPoint)
    }
    fileprivate let kind: Kind
    fileprivate var stops: [(Double, UIColor)] = []

    fileprivate init(_ kind: Kind) { self.kind = kind }

    public func addColorStop(_ offset: Double, _ color: String) {
        guard offset >= 0, offset <= 1, let c = Color.parse(color) else { return }
        stops.append((offset, c.uiColor))
        stops.sort { $0.0 < $1.0 }
    }

    fileprivate func cgGradient() -> CGGradient? {
        guard !stops.isEmpty else { return nil }
        return CGGradient(colorsSpace: CGColorSpace(name: CGColorSpace.sRGB), colors: stops.map { $0.1.cgColor } as CFArray, locations: stops.map { CGFloat($0.0) })
    }
}

public final class CanvasRenderingContext2D {
    private weak var canvas: Canvas?
    private var bitmap: CGContext?
    private var transform = CGAffineTransform.identity
    private var fill: Any? = "#000000"
    private var scheduled = false

    fileprivate init(_ canvas: Canvas, _ width: Int, _ height: Int) {
        self.canvas = canvas
        resize(width, height)
    }

    fileprivate func resize(_ width: Int, _ height: Int) {
        bitmap = width > 0 && height > 0
            ? CGContext(data: nil, width: width, height: height, bitsPerComponent: 8, bytesPerRow: 0,
                        space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)
            : nil
        // Canvas coordinates are top-down.
        if let bitmap, height > 0 {
            bitmap.translateBy(x: 0, y: CGFloat(height))
            bitmap.scaleBy(x: 1, y: -1)
        }
        transform = .identity
        pathBox = CGMutablePath()
        changed()
    }

    public var fillStyle: Any? {
        get { fill }
        set {
            if newValue is CanvasGradient || (jsFlat(newValue) as? String).flatMap(Color.parse) != nil { fill = jsFlat(newValue) }
        }
    }

    public func scale(_ x: Double, _ y: Double) { transform = transform.scaledBy(x: x, y: y) }

    public func clearRect(_ x: Double, _ y: Double, _ width: Double, _ height: Double) {
        guard let bitmap else { return }
        bitmap.saveGState()
        bitmap.concatenate(transform)
        bitmap.clear(CGRect(x: x, y: y, width: width, height: height))
        bitmap.restoreGState()
        changed()
    }

    public func beginPath() { pathBox = CGMutablePath() }

    public func arc(_ x: Double, _ y: Double, _ radius: Double, _ startAngle: Double, _ endAngle: Double, _ counterclockwise: Bool = false) {
        currentPath.addArc(center: CGPoint(x: x, y: y), radius: CGFloat(radius), startAngle: CGFloat(startAngle), endAngle: CGFloat(endAngle), clockwise: counterclockwise, transform: transform)
    }

    public func fill(_ rule: String? = nil) {
        guard let bitmap else { return }
        bitmap.saveGState()
        bitmap.addPath(currentPath)
        if let gradient = fill as? CanvasGradient {
            bitmap.clip(using: rule == "evenodd" ? .evenOdd : .winding)
            bitmap.concatenate(transform)
            if let cg = gradient.cgGradient() {
                let options: CGGradientDrawingOptions = [.drawsBeforeStartLocation, .drawsAfterEndLocation]
                switch gradient.kind {
                case let .radial(c0, r0, c1, r1): bitmap.drawRadialGradient(cg, startCenter: c0, startRadius: r0, endCenter: c1, endRadius: r1, options: options)
                case let .linear(p0, p1): bitmap.drawLinearGradient(cg, start: p0, end: p1, options: options)
                }
            }
        } else if let color = (fill as? String).flatMap(Color.parse) {
            bitmap.setFillColor(color.uiColor.cgColor)
            bitmap.fillPath(using: rule == "evenodd" ? .evenOdd : .winding)
        }
        bitmap.restoreGState()
        changed()
    }

    public func createRadialGradient(_ x0: Double, _ y0: Double, _ r0: Double, _ x1: Double, _ y1: Double, _ r1: Double) -> CanvasGradient {
        CanvasGradient(.radial(CGPoint(x: x0, y: y0), CGFloat(r0), CGPoint(x: x1, y: y1), CGFloat(r1)))
    }

    public func createLinearGradient(_ x0: Double, _ y0: Double, _ x1: Double, _ y1: Double) -> CanvasGradient {
        CanvasGradient(.linear(CGPoint(x: x0, y: y0), CGPoint(x: x1, y: y1)))
    }

    /// The path `beginPath` started, in device space.
    private var pathBox = CGMutablePath()
    private var currentPath: CGMutablePath { pathBox }

    /// Shown once the run loop turn ends, as the plugin presents a frame once.
    private func changed() {
        guard !scheduled else { return }
        scheduled = true
        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            scheduled = false
            canvas?.present(bitmap?.makeImage())
        }
    }
}
