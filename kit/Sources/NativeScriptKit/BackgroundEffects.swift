import UIKit

// Box shadows, gradients and clip paths of styling/background.ios.

extension View {
    /// `_removeViewFromNativeVisualTree`: the native view and the shadow container
    /// drawn beside it leave the parent (the container stays the view's, as in core).
    func removeFromNativeVisualTree() {
        nativeView?.removeFromSuperview()
        backgroundLayers.outerShadowContainerLayer?.removeFromSuperlayer()
    }

    /// `drawBoxShadow`: a shadow layer per shadow in a container under the
    /// view's layer, each masked so a transparent view shows no shadow beneath.
    func drawBoxShadow() {
        guard let nativeView, let superlayer = nativeView.layer.superlayer else { return }
        let layer = nativeView.layer
        let layers = backgroundLayers
        let bounds = nativeView.bounds
        let group: CALayer
        if let existing = layers.outerShadowContainerLayer {
            group = existing
        } else {
            group = CALayer()
            superlayer.insertSublayer(group, below: layer)
            layers.outerShadowContainerLayer = group
        }
        let shadows = background.boxShadows
        let count = group.sublayers?.count ?? 0
        if count < shadows.count {
            for _ in 0..<(shadows.count - count) {
                let shadowLayer = CALayer()
                let mask = CAShapeLayer()
                mask.fillRule = .evenOdd
                shadowLayer.mask = mask
                group.addSublayer(shadowLayer)
            }
        } else if count > shadows.count, let sublayers = group.sublayers {
            for sublayer in sublayers.prefix(count - shadows.count) { sublayer.removeFromSuperlayer() }
        }
        for (shadowLayer, shadow) in zip(group.sublayers ?? [], shadows) {
            let paths = shadowLayerPaths(shadow, bounds)
            shadowLayer.allowsEdgeAntialiasing = true
            shadowLayer.contentsScale = UIScreen.main.scale
            shadowLayer.shadowOpacity = Float(shadow.alpha == 0 ? 1 : Double(shadow.alpha) / 255)
            // Half the blur radius imitates CSS's blur.
            shadowLayer.shadowRadius = dip(shadow.blurRadius) * 0.5
            shadowLayer.shadowColor = (CorePatches.opaqueShadowColor ? shadow.color?.withAlphaComponent(1) : shadow.color)?.cgColor
            shadowLayer.shadowOffset = CGSize(width: dip(shadow.offsetX), height: dip(shadow.offsetY))
            shadowLayer.shadowPath = paths.shadow
            (shadowLayer.mask as? CAShapeLayer)?.path = paths.mask
        }
        if backgroundLayers.maskType == .clipPath, let mask = layer.mask as? CAShapeLayer {
            if group.mask == nil { group.mask = CAShapeLayer() }
            (group.mask as? CAShapeLayer)?.path = mask.path
        }
        group.bounds = bounds
        group.transform = layer.transform
        group.anchorPoint = layer.anchorPoint
        group.position = nativeView.center
        group.zPosition = layer.zPosition
        group.opacity = layer.opacity
        group.isHidden = layer.isHidden
    }

    /// `layoutOuterShadows`: the shadow container follows the view.
    func layoutOuterShadows() {
        guard let nativeView, let group = backgroundLayers.outerShadowContainerLayer else { return }
        CATransaction.setDisableActions(true)
        group.bounds = nativeView.bounds
        group.position = nativeView.center
        CATransaction.setDisableActions(false)
    }

    /// `generateShadowLayerPaths`.
    private func shadowLayerPaths(_ shadow: BoxShadow, _ bounds: CGRect) -> (mask: CGPath, shadow: CGPath) {
        let spread = dip(shadow.spreadRadius)
        let width = bounds.width, height = bounds.height
        let inner: CGPath, outer: CGPath
        if background.hasBorderRadius {
            var radii: CornerRadii
            if background.hasUniformBorder {
                let capped = View.capRadius(nativeView?.layer.cornerRadius ?? 0, width / 2, height / 2)
                radii = CornerRadii(topLeft: capped, topRight: capped, bottomLeft: capped, bottomRight: capped)
                inner = View.outerClipPath(bounds, radii)
                radii = CornerRadii(topLeft: capped + spread, topRight: capped + spread, bottomLeft: capped + spread, bottomRight: capped + spread)
            } else {
                radii = cappedRadii(bounds)
                inner = View.outerClipPath(bounds, radii)
                func grow(_ r: CGFloat) -> CGFloat { r > 0 ? r + spread : r }
                radii = CornerRadii(topLeft: grow(radii.topLeft), topRight: grow(radii.topRight), bottomLeft: grow(radii.bottomLeft), bottomRight: grow(radii.bottomRight))
            }
            outer = View.outerClipPath(bounds, radii, spread)
        } else {
            inner = CGPath(rect: bounds, transform: nil)
            outer = CGPath(rect: bounds.insetBy(dx: -spread, dy: -spread), transform: nil)
        }
        // Large enough not to clip the shadow's halo.
        let outerRadius = dip(shadow.blurRadius) * 3 + spread
        let mask = CGMutablePath()
        mask.addPath(inner)
        mask.addRect(bounds.insetBy(dx: -outerRadius, dy: -outerRadius).offsetBy(dx: dip(shadow.offsetX), dy: dip(shadow.offsetY)))
        return (mask, outer)
    }
}

/// A `box-shadow` entry, lengths in device pixels.
struct BoxShadow: Equatable {
    var offsetX: Double, offsetY: Double, blurRadius: Double, spreadRadius: Double
    var color: UIColor?
    var alpha: Int
    var inset: Bool

    /// The `boxShadow` converter: comma-separated shadows, last first.
    static func parseList(_ value: String) -> [BoxShadow] {
        var parts: [String] = []
        var current = ""
        var depth = 0
        for c in value {
            if c == "(" { depth += 1 } else if c == ")" { depth = max(0, depth - 1) }
            if c == "," && depth == 0 { parts.append(current); current = "" } else { current.append(c) }
        }
        parts.append(current)
        return parts.reversed().compactMap { part in
            guard let shadow = CSSShadow(css: part) else { return nil }
            return BoxShadow(offsetX: shadow.offsetX.toDevicePixels(auto: 0), offsetY: shadow.offsetY.toDevicePixels(auto: 0),
                             blurRadius: shadow.blurRadius.toDevicePixels(auto: 0), spreadRadius: shadow.spreadRadius.toDevicePixels(auto: 0),
                             color: shadow.color, alpha: Int(shadow.colorAlpha ?? 255), inset: shadow.inset)
        }
    }
}

/// `LinearGradient` from a CSS `linear-gradient(...)`; the angle in radians.
struct LinearGradient: Equatable {
    var angle: Double
    var stops: [(color: UIColor, offset: Double?)]

    static func == (a: LinearGradient, b: LinearGradient) -> Bool {
        a.angle == b.angle && a.stops.count == b.stops.count && zip(a.stops, b.stops).allSatisfy { $0.color == $1.color && $0.offset == $1.offset }
    }

    /// css/parser's `parseLinearGradient`: a direction or angle first, then color stops.
    init?(css text: String) {
        let trimmed = text.trimmingCharacters(in: .whitespaces)
        guard trimmed.hasPrefix("linear-gradient"), let open = trimmed.firstIndex(of: "("), trimmed.hasSuffix(")") else { return nil }
        let inner = String(trimmed[trimmed.index(after: open)..<trimmed.index(before: trimmed.endIndex)])
        var args: [String] = []
        var current = ""
        var depth = 0
        for c in inner {
            if c == "(" { depth += 1 } else if c == ")" { depth -= 1 }
            if c == "," && depth == 0 { args.append(current.trimmingCharacters(in: .whitespaces)); current = "" } else { current.append(c) }
        }
        args.append(current.trimmingCharacters(in: .whitespaces))
        angle = .pi
        stops = []
        for (index, arg) in args.enumerated() {
            if index == 0, let parsed = LinearGradient.angle(arg) ?? LinearGradient.direction(arg) {
                angle = parsed
                continue
            }
            guard let stop = LinearGradient.colorStop(arg) else { return nil }
            stops.append(stop)
        }
    }

    private static func angle(_ text: String) -> Double? {
        guard let match = text.range(of: #"^[+\-]?(\d+\.\d+|\d+|\.\d+)[a-z]+$"#, options: .regularExpression), match == text.startIndex..<text.endIndex else { return nil }
        let unit = String(text.drop { !$0.isLetter })
        guard let value = Double(text.dropLast(unit.count)) else { return nil }
        switch unit {
        case "deg": return value / 180 * .pi
        case "rad": return value
        case "grad": return value / 200 * .pi
        case "turn": return value * .pi * 2
        default: return nil
        }
    }

    private static func direction(_ text: String) -> Double? {
        let words = text.split(whereSeparator: \.isWhitespace).map(String.init)
        guard words.first == "to", words.count == 2 || words.count == 3 else { return nil }
        let sides = ["top": 0.0, "right": .pi / 2, "bottom": .pi, "left": .pi * 3 / 2]
        if words.count == 2 { return sides[words[1]] }
        let corners: [String: [String: Double]] = [
            "top": ["right": .pi / 4, "left": .pi * 7 / 4], "right": ["top": .pi / 4, "bottom": .pi * 3 / 4],
            "bottom": ["right": .pi * 3 / 4, "left": .pi * 5 / 4], "left": ["top": .pi * 7 / 4, "bottom": .pi * 5 / 4],
        ]
        return corners[words[1]]?[words[2]]
    }

    /// A color and an optional offset; only a percentage offset is kept.
    private static func colorStop(_ text: String) -> (color: UIColor, offset: Double?)? {
        var colorText = text
        var offset: Double?
        if let space = text.lastIndex(where: \.isWhitespace), !text.hasSuffix(")") {
            let tail = String(text[text.index(after: space)...])
            if tail.range(of: #"^[+\-]?(\d+\.\d+|\d+|\.\d+)([a-zA-Z]+|%)?$"#, options: .regularExpression) != nil {
                colorText = String(text[..<space]).trimmingCharacters(in: .whitespaces)
                if tail.hasSuffix("%"), let value = Double(tail.dropLast()) { offset = value / 100 }
            }
        }
        guard let color = Color.parse(colorText)?.uiColor else { return nil }
        return (color, offset)
    }

    /// `resolveGradientStopOffsets`: a first stop without a position at 0, a last
    /// at 1, unpositioned runs spread evenly between their neighbours, and a
    /// position below an earlier one raised to it.
    func resolvedOffsets() -> [Double] {
        var offsets = stops.map(\.offset)
        guard !offsets.isEmpty else { return [] }
        if offsets[0] == nil { offsets[0] = 0 }
        if offsets[offsets.count - 1] == nil { offsets[offsets.count - 1] = 1 }
        var highest = offsets[0]!
        for i in 1..<offsets.count {
            if let value = offsets[i] { offsets[i] = max(value, highest); highest = offsets[i]! }
        }
        var start = 0
        for i in 1..<offsets.count {
            guard let end = offsets[i] else { continue }
            let from = offsets[start]!
            for k in (start + 1)..<i { offsets[k] = from + (end - from) * Double(k - start) / Double(i - start) }
            start = i
        }
        return offsets.map { $0! }
    }

    /// utils.ios `drawGradient`: locations only for the stops that give an offset.
    func draw(_ nativeView: UIView, _ layer: CAGradientLayer) {
        layer.bounds = nativeView.bounds
        layer.anchorPoint = .zero
        layer.allowsEdgeAntialiasing = true
        layer.contentsScale = UIScreen.main.scale
        layer.colors = stops.map(\.color.cgColor)
        if CorePatches.resolvedGradientStops {
            layer.locations = resolvedOffsets().map { NSNumber(value: $0) }
        } else {
            let locations = stops.compactMap { $0.offset.map { NSNumber(value: $0) } }
            if !locations.isEmpty { layer.locations = locations }
        }
        let alpha = angle / (.pi * 2)
        layer.startPoint = CGPoint(x: pow(sin(.pi * (alpha + 0.75)), 2), y: pow(sin(.pi * (alpha + 0.5)), 2))
        layer.endPoint = CGPoint(x: pow(sin(.pi * (alpha + 0.25)), 2), y: pow(sin(.pi * alpha), 2))
    }
}

/// A `clip-path` shape function and its rule.
struct ClipPath: Equatable {
    var shape: String
    var rule: String

    init?(css value: String) {
        guard let open = value.firstIndex(of: "("), let close = value.lastIndex(of: ")") else { return nil }
        shape = value[..<open].trimmingCharacters(in: .whitespaces)
        guard ["rect", "circle", "ellipse", "polygon", "inset"].contains(shape) else { return nil }
        rule = String(value[value.index(after: open)..<close])
    }

    /// `cssValueToDeviceIndependentPixels`.
    private static func dip(_ source: String?, _ total: CGFloat) -> CGFloat {
        guard let source = source?.trimmingCharacters(in: .whitespaces) else { return .nan }
        if source.contains("px") { return CGFloat(LayoutHelper.toDeviceIndependentPixels(parseFloat(source.replacingOccurrences(of: "px", with: "")) ?? .nan)) }
        if source.contains("%") && total > 0 { return CGFloat((parseFloat(source.replacingOccurrences(of: "%", with: "")) ?? .nan) / 100) * total }
        return CGFloat(parseFloat(source) ?? .nan)
    }

    /// `generateClipPath` for the view's bounds.
    func path(_ bounds: CGRect) -> CGPath? {
        let left = bounds.minX, top = bounds.minY, right = bounds.width, bottom = bounds.height
        if right == 0 || bottom == 0 { return nil }
        let parts = rule.split(whereSeparator: \.isWhitespace).map(String.init)
        func at(_ i: Int) -> String? { i < parts.count ? parts[i] : nil }
        switch shape {
        case "rect":
            let t = ClipPath.dip(at(0), top), r = ClipPath.dip(at(1), right), b = ClipPath.dip(at(2), bottom), l = ClipPath.dip(at(3), left)
            return UIBezierPath(rect: CGRect(x: l, y: t, width: r - l, height: b - t)).cgPath
        case "inset":
            var (ts, rs, bs, ls) = (at(0), at(0), at(0), at(0))
            switch parts.count {
            case 2: (ts, rs, bs, ls) = (at(0), at(1), at(0), at(1))
            case 3: (ts, rs, bs, ls) = (at(0), at(1), at(2), at(1))
            case 4: (ts, rs, bs, ls) = (at(0), at(1), at(2), at(3))
            default: break
            }
            let t = ClipPath.dip(ts, bottom)
            let r = ClipPath.dip("100%", right) - ClipPath.dip(rs, right)
            let b = ClipPath.dip("100%", bottom) - ClipPath.dip(bs, bottom)
            let l = ClipPath.dip(ls, right)
            return UIBezierPath(rect: CGRect(x: l, y: t, width: r - l, height: b - t)).cgPath
        case "circle":
            let radius = ClipPath.dip(at(0), (right > bottom ? bottom : right) / 2)
            let y = ClipPath.dip(at(2), bottom), x = ClipPath.dip(at(3), right)
            return UIBezierPath(arcCenter: CGPoint(x: x, y: y), radius: radius, startAngle: 0, endAngle: 360, clockwise: true).cgPath
        case "ellipse":
            let rx = ClipPath.dip(at(0), right), ry = ClipPath.dip(at(1), bottom)
            let cx = ClipPath.dip(at(3), right), cy = ClipPath.dip(at(4), bottom)
            return UIBezierPath(ovalIn: CGRect(x: cx - rx, y: cy - ry, width: rx * 2, height: ry * 2)).cgPath
        case "polygon":
            let path = CGMutablePath()
            var first: CGPoint?
            for pair in rule.split(separator: ",") {
                let xy = pair.trimmingCharacters(in: .whitespaces).split(whereSeparator: \.isWhitespace).map(String.init)
                let point = CGPoint(x: ClipPath.dip(xy.first, right), y: ClipPath.dip(xy.count > 1 ? xy[1] : nil, bottom))
                if first == nil {
                    first = point
                    path.move(to: point)
                }
                path.addLine(to: point)
            }
            if let first { path.addLine(to: first) }
            return path
        default:
            return nil
        }
    }
}
