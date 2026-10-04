import UIKit

/// The layers styling/background.ios adds to a native view for what
/// `layer.border*` cannot draw: per-side borders and their clipping mask.
final class BackgroundLayers {
    enum MaskType { case border, clipPath }

    var borderLayer: CAShapeLayer?
    var gradientLayer: CAGradientLayer?
    /// Box shadows sit in the parent's layer, below the view's, so borders and masks do not clip them.
    var outerShadowContainerLayer: CALayer?
    var hasNonUniformBorder = false
    var hasNonUniformBorderColor = false
    var maskType: MaskType?
    var originalMask: CALayer?
}

struct CornerRadii {
    var topLeft: CGFloat, topRight: CGFloat, bottomLeft: CGFloat, bottomRight: CGFloat
}

extension View {
    /// `ios.createBackgroundUIColor`: visual effects drawn, then the color to
    /// `apply`; a gradient background leaves the view's color as it was.
    func createBackgroundUIColor(_ apply: (UIColor?) -> Void) {
        guard nativeView != nil else { return }
        nativeView?.layer.backgroundColor = nil
        clearBackgroundVisualEffects()
        drawBackgroundVisualEffects()
        if background.image == nil { apply(background.color) }
    }

    /// `drawBackgroundVisualEffects`.
    func drawBackgroundVisualEffects() {
        guard let nativeView else { return }
        let layer = nativeView.layer
        if let gradient = background.image {
            if backgroundLayers.gradientLayer == nil {
                let gradientLayer = CAGradientLayer()
                layer.insertSublayer(gradientLayer, at: 0)
                backgroundLayers.gradientLayer = gradientLayer
            }
            if let gradientLayer = backgroundLayers.gradientLayer { gradient.draw(nativeView, gradientLayer) }
        }
        maskLayerIfNeeded()
        if background.hasUniformBorder {
            layer.borderColor = background.borderTopColor?.cgColor
            layer.borderWidth = CGFloat(LayoutHelper.toDeviceIndependentPixels(background.borderTopWidth))
            let bounds = layer.bounds.size
            let radius = CGFloat(LayoutHelper.toDeviceIndependentPixels(background.borderTopLeftRadius))
            layer.cornerRadius = min(min(bounds.width / 2, bounds.height / 2), radius)
            layer.cornerCurve = .circular
        } else {
            drawNonUniformBorders()
        }
        // The clip path follows the borders.
        if backgroundLayers.maskType == .clipPath, let mask = layer.mask as? CAShapeLayer {
            mask.path = background.clipPath?.path(layer.bounds)
        }
        if !background.boxShadows.isEmpty { drawBoxShadow() }
    }

    /// `clearBackgroundVisualEffects`.
    func clearBackgroundVisualEffects() {
        guard let nativeView else { return }
        let layers = backgroundLayers
        let needsMask: Bool
        switch layers.maskType {
        case .border: needsMask = !background.hasUniformBorder && background.hasBorderRadius
        case .clipPath: needsMask = background.clipPath != nil
        case nil: needsMask = false
        }
        if !needsMask {
            layers.outerShadowContainerLayer?.mask = nil
            nativeView.layer.mask = layers.originalMask
            layers.originalMask = nil
            layers.maskType = nil
        }
        if background.boxShadows.isEmpty {
            layers.outerShadowContainerLayer?.removeFromSuperlayer()
            layers.outerShadowContainerLayer = nil
        }
        if layers.hasNonUniformBorder {
            if layers.hasNonUniformBorderColor && background.hasUniformBorderColor {
                layers.borderLayer?.mask = nil
                layers.borderLayer?.sublayers = nil
                layers.hasNonUniformBorderColor = false
            }
            if background.hasUniformBorder {
                layers.borderLayer?.removeFromSuperlayer()
                layers.borderLayer = nil
                layers.hasNonUniformBorder = false
            }
        }
        if background.image == nil {
            layers.gradientLayer?.removeFromSuperlayer()
            layers.gradientLayer = nil
        }
    }

    /// The clip path is the mask when there is one; otherwise rounded non-uniform borders are.
    private func maskLayerIfNeeded() {
        guard let layer = nativeView?.layer, !(layer.mask is CAShapeLayer) else { return }
        let layers = backgroundLayers
        if background.clipPath != nil {
            layers.maskType = .clipPath
        } else {
            layers.maskType = !background.hasUniformBorder && background.hasBorderRadius ? .border : nil
        }
        if layers.maskType != nil {
            layers.originalMask = layer.mask
            layer.mask = CAShapeLayer()
        }
    }

    private func drawNonUniformBorders() {
        guard let nativeView else { return }
        let layer = nativeView.layer
        let bounds = layer.bounds
        let layers = backgroundLayers
        layer.borderColor = nil
        layer.borderWidth = 0
        layer.cornerRadius = 0
        let radii = cappedRadii(bounds)
        if layers.maskType == .border, let mask = layer.mask as? CAShapeLayer {
            mask.path = View.outerClipPath(bounds, radii)
        }
        guard background.hasBorderWidth else { return }
        if !layers.hasNonUniformBorder {
            let borderLayer = CAShapeLayer()
            borderLayer.fillRule = .evenOdd
            layer.addSublayer(borderLayer)
            layers.borderLayer = borderLayer
            layers.hasNonUniformBorder = true
        }
        guard let borderLayer = layers.borderLayer else { return }
        let black = UIColor.black.cgColor
        if background.hasUniformBorderColor {
            // Rasterized, or the even-odd border draws incorrectly at times.
            borderLayer.shouldRasterize = true
            borderLayer.rasterizationScale = UIScreen.main.scale
            borderLayer.fillColor = background.borderTopColor?.cgColor ?? black
            borderLayer.path = innerClipPath(bounds, radii)
            return
        }
        var sides: [CAShapeLayer]
        if !layers.hasNonUniformBorderColor {
            let mask = CAShapeLayer()
            mask.fillRule = .evenOdd
            mask.shouldRasterize = true
            mask.rasterizationScale = UIScreen.main.scale
            borderLayer.mask = mask
            sides = (0..<4).map { _ in CAShapeLayer() }
            for side in sides { borderLayer.addSublayer(side) }
            layers.hasNonUniformBorderColor = true
        } else {
            sides = (borderLayer.sublayers ?? []).compactMap { $0 as? CAShapeLayer }
        }
        let paths = multiColorBorderPaths(bounds)
        let colors = [background.borderTopColor, background.borderRightColor, background.borderBottomColor, background.borderLeftColor]
        for (index, side) in sides.prefix(4).enumerated() {
            side.fillColor = colors[index]?.cgColor ?? black
            side.path = paths[index]
        }
        if let mask = borderLayer.mask as? CAShapeLayer { mask.path = innerClipPath(bounds, radii) }
    }

    func dip(_ px: Double) -> CGFloat { CGFloat(LayoutHelper.toDeviceIndependentPixels(px)) }

    /// `getBorderCapRadius`: a zero radius stays zero.
    static func capRadius(_ a: CGFloat, _ b: CGFloat, _ c: CGFloat) -> CGFloat { a == 0 ? 0 : min(a, min(b, c)) }

    /// `calculateNonUniformBorderCappedRadii`: radii scaled down where neighbors would overlap.
    func cappedRadii(_ bounds: CGRect) -> CornerRadii {
        let width = bounds.width, height = bounds.height
        let tl = dip(background.borderTopLeftRadius), tr = dip(background.borderTopRightRadius)
        let br = dip(background.borderBottomRightRadius), bl = dip(background.borderBottomLeftRadius)
        let top = tl + tr, right = tr + br, bottom = br + bl, left = bl + tl
        return CornerRadii(
            topLeft: View.capRadius(tl, (tl / top) * width, (tl / left) * height),
            topRight: View.capRadius(tr, (tr / top) * width, (tr / right) * height),
            bottomLeft: View.capRadius(bl, (bl / bottom) * width, (bl / left) * height),
            bottomRight: View.capRadius(br, (br / bottom) * width, (br / right) * height))
    }

    /// `generateNonUniformBorderOuterClipPath`.
    static func outerClipPath(_ bounds: CGRect, _ radii: CornerRadii, _ offset: CGFloat = 0) -> CGPath {
        let left = bounds.minX - offset, top = bounds.minY - offset
        let right = bounds.minX + bounds.width + offset, bottom = bounds.minY + bounds.height + offset
        let path = CGMutablePath()
        path.move(to: CGPoint(x: left + radii.topLeft, y: top))
        path.addArc(tangent1End: CGPoint(x: right, y: top), tangent2End: CGPoint(x: right, y: top + radii.topRight), radius: radii.topRight)
        path.addArc(tangent1End: CGPoint(x: right, y: bottom), tangent2End: CGPoint(x: right - radii.bottomRight, y: bottom), radius: radii.bottomRight)
        path.addArc(tangent1End: CGPoint(x: left, y: bottom), tangent2End: CGPoint(x: left, y: bottom - radii.bottomLeft), radius: radii.bottomLeft)
        path.addArc(tangent1End: CGPoint(x: left, y: top), tangent2End: CGPoint(x: left + radii.topLeft, y: top), radius: radii.topLeft)
        path.closeSubpath()
        return path
    }

    /// `generateNonUniformBorderInnerClipPath`: the view's rect plus the area
    /// inside the borders, for an even-odd fill.
    private func innerClipPath(_ bounds: CGRect, _ radii: CornerRadii) -> CGPath {
        let width = bounds.width, height = bounds.height
        let left = bounds.minX, top = bounds.minY, bottom = bounds.minY + height, right = bounds.minX + width
        let topWidth = max(0, dip(background.borderTopWidth)), rightWidth = max(0, dip(background.borderRightWidth))
        let bottomWidth = max(0, dip(background.borderBottomWidth)), leftWidth = max(0, dip(background.borderLeftWidth))
        let vertical = topWidth + bottomWidth, horizontal = leftWidth + rightWidth
        let cappedTop = topWidth == 0 ? 0 : topWidth * min(1, height / vertical)
        let cappedRight = rightWidth == 0 ? 0 : rightWidth * min(1, width / horizontal)
        let cappedBottom = bottomWidth == 0 ? 0 : bottomWidth * min(1, height / vertical)
        let cappedLeft = leftWidth == 0 ? 0 : leftWidth * min(1, width / horizontal)

        func innerRadius(_ radius: CGFloat, _ insetX: CGFloat, _ insetY: CGFloat) -> (x: CGFloat, y: CGFloat, max: CGFloat) {
            let x = max(0, radius - insetX), y = max(0, radius - insetY)
            return (x, y, max(x, y))
        }
        func arc(_ path: CGMutablePath, _ r: (x: CGFloat, y: CGFloat, max: CGFloat), _ cx: CGFloat, _ cy: CGFloat, _ start: CGFloat, _ end: CGFloat) {
            let transform = CGAffineTransform(a: r.max == 0 ? 0 : r.x / r.max, b: 0, c: 0, d: r.max == 0 ? 0 : r.y / r.max, tx: cx, ty: cy)
            path.addArc(center: .zero, radius: r.max, startAngle: start, endAngle: end, clockwise: false, transform: transform)
        }

        let path = CGMutablePath()
        path.addRect(CGRect(x: bounds.minX, y: bounds.minY, width: width, height: height))
        if cappedTop > 0 || cappedLeft > 0 {
            path.move(to: CGPoint(x: left + radii.topLeft, y: top + cappedTop))
        } else {
            path.move(to: CGPoint(x: left, y: top))
        }
        if cappedTop > 0 || cappedRight > 0 {
            let r = innerRadius(radii.topRight, cappedRight, cappedTop)
            arc(path, r, right - cappedRight - r.x, top + cappedTop + r.y, .pi * 3 / 2, 0)
        } else {
            path.addLine(to: CGPoint(x: right, y: top))
        }
        if cappedBottom > 0 || cappedRight > 0 {
            let r = innerRadius(radii.bottomRight, cappedRight, cappedBottom)
            arc(path, r, right - cappedRight - r.x, bottom - cappedBottom - r.y, 0, .pi / 2)
        } else {
            path.addLine(to: CGPoint(x: right, y: bottom))
        }
        if cappedBottom > 0 || cappedLeft > 0 {
            let r = innerRadius(radii.bottomLeft, cappedLeft, cappedBottom)
            arc(path, r, left + cappedLeft + r.x, bottom - cappedBottom - r.y, .pi / 2, .pi)
        } else {
            path.addLine(to: CGPoint(x: left, y: bottom))
        }
        if cappedTop > 0 || cappedLeft > 0 {
            let r = innerRadius(radii.topLeft, cappedLeft, cappedTop)
            arc(path, r, left + cappedLeft + r.x, top + cappedTop + r.y, .pi, .pi * 3 / 2)
        } else {
            path.addLine(to: CGPoint(x: left, y: top))
        }
        path.closeSubpath()
        return path
    }

    /// `generateNonUniformMultiColorBorderPaths`: a trapezoid per side, from
    /// widths scaled to fill the view, clipped by the inner path.
    private func multiColorBorderPaths(_ bounds: CGRect) -> [CGPath?] {
        let width = bounds.minX + bounds.width, height = bounds.minY + bounds.height
        let topWidth = max(0, dip(background.borderTopWidth)), rightWidth = max(0, dip(background.borderRightWidth))
        let bottomWidth = max(0, dip(background.borderBottomWidth)), leftWidth = max(0, dip(background.borderLeftWidth))
        let vertical = topWidth + bottomWidth, horizontal = leftWidth + rightWidth
        var verticalMultiplier = vertical > 0 ? height / vertical : 0
        var horizontalMultiplier = horizontal > 0 ? width / horizontal : 0
        if verticalMultiplier > 0 && verticalMultiplier < horizontalMultiplier { horizontalMultiplier -= horizontalMultiplier - verticalMultiplier }
        if horizontalMultiplier > 0 && horizontalMultiplier < verticalMultiplier { verticalMultiplier -= verticalMultiplier - horizontalMultiplier }
        let widths = (top: topWidth * verticalMultiplier, right: rightWidth * horizontalMultiplier,
                      bottom: bottomWidth * verticalMultiplier, left: leftWidth * horizontalMultiplier)

        let left = bounds.minX, top = bounds.minY, right = bounds.minX + bounds.width, bottom = bounds.minY + bounds.height
        let lto = CGPoint(x: left, y: top), lti = CGPoint(x: left + widths.left, y: top + widths.top)
        let rto = CGPoint(x: right, y: top), rti = CGPoint(x: right - widths.right, y: top + widths.top)
        let rbo = CGPoint(x: right, y: bottom), rbi = CGPoint(x: right - widths.right, y: bottom - widths.bottom)
        let lbo = CGPoint(x: left, y: bottom), lbi = CGPoint(x: left + widths.left, y: bottom - widths.bottom)

        func side(_ outerStart: CGPoint, _ outerEnd: CGPoint, _ innerEnd: CGPoint, _ innerStart: CGPoint, skipInnerStart: Bool) -> CGPath {
            let path = CGMutablePath()
            path.move(to: outerStart)
            path.addLine(to: outerEnd)
            path.addLine(to: innerEnd)
            if !skipInnerStart { path.addLine(to: innerStart) }
            path.addLine(to: outerStart)
            return path
        }
        var paths = [CGPath?](repeating: nil, count: 4)
        if widths.top > 0, background.borderTopColor != nil { paths[0] = side(lto, rto, rti, lti, skipInnerStart: rti.x == lti.x) }
        if widths.right > 0, background.borderRightColor != nil { paths[1] = side(rto, rbo, rbi, rti, skipInnerStart: rbi.y == rti.y) }
        if widths.bottom > 0, background.borderBottomColor != nil { paths[2] = side(rbo, lbo, lbi, rbi, skipInnerStart: lbi.x == rbi.x) }
        if widths.left > 0, background.borderLeftColor != nil { paths[3] = side(lbo, lto, lti, lbi, skipInnerStart: lti.y == lbi.y) }
        return paths
    }
}
