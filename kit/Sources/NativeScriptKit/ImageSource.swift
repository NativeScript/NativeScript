import UIKit

/// `ImageSource` from @nativescript/core's image-source (iOS): an image script made or loaded, `ios` its UIImage.
public final class ImageSource {
    public let ios: UIImage?

    init(_ image: UIImage?) { ios = image }

    /// `fromFileSync(path)`: a `~/` path is the app folder's, as core resolves it.
    public static func fromFileSync(_ path: String) -> ImageSource? {
        let resolved = path.hasPrefix("~/") ? Bundle.main.bundlePath + "/app/" + path.dropFirst(2) : path
        guard let image = UIImage(contentsOfFile: resolved) else { return nil }
        return ImageSource(image)
    }

    /// `fromUrl(url)`: the body of a GET, decoded as an image; rejects when the request fails or the body is no image.
    public static func fromUrl(_ url: String) -> JSPromise<ImageSource> {
        let (promise, resolvers) = JSPromise<ImageSource>.pending()
        guard let target = URL(string: url) else {
            resolvers.reject(JSError("Invalid URL: \(url)"))
            return promise
        }
        URLSession.shared.dataTask(with: target) { data, _, error in
            DispatchQueue.main.async {
                if let data, error == nil, let image = UIImage(data: data) {
                    resolvers.resolve(ImageSource(image))
                } else {
                    resolvers.reject(JSError(error?.localizedDescription ?? "Cannot create image from the response"))
                }
                Microtasks.checkpoint()
            }
        }.resume()
        return promise
    }

    /// `fromFontIconCodeSync(source, font, color)`: the glyphs drawn in the font, sized to fit.
    public static func fromFontIconCodeSync(_ source: String, _ font: CoreFont, _ color: Color?) -> ImageSource {
        let uiFont = font.uiFont
        var attributes: [NSAttributedString.Key: Any] = [.font: uiFont]
        if let color { attributes[.foregroundColor] = color.uiColor }
        let text = source as NSString
        let size = text.size(withAttributes: attributes)
        let image = UIGraphicsImageRenderer(size: size).image { _ in text.draw(at: .zero, withAttributes: attributes) }
        return ImageSource(image)
    }
}

/// `Font` from @nativescript/core's styling/font (`new Font(family, size, style, weight)`), for script.
public final class CoreFont {
    public let fontFamily: String?
    public let fontSize: Double
    public let fontStyle: String
    public let fontWeight: String

    public init(_ family: String?, _ size: Double, _ style: Any? = nil, _ weight: Any? = nil) {
        fontFamily = family
        fontSize = size
        fontStyle = (style as? String) ?? "normal"
        fontWeight = weight.map { jsToString($0) } ?? "normal"
    }

    var uiFont: UIFont {
        let size = CGFloat(fontSize)
        _ = AppFonts.registered
        if let family = fontFamily, let font = UIFont(name: family, size: size) { return font }
        let weights: [String: UIFont.Weight] = ["100": .ultraLight, "200": .thin, "300": .light, "400": .regular, "normal": .regular,
                                                 "500": .medium, "600": .semibold, "700": .bold, "bold": .bold, "800": .heavy, "900": .black]
        return UIFont.systemFont(ofSize: size, weight: weights[fontWeight] ?? .regular)
    }
}

/// `unescape(string)`: `%XX` and `%uXXXX` escapes as the code units they name.
public func jsUnescape(_ s: String) -> String {
    let units = Array(s.utf16)
    var out: [UInt16] = []
    var i = 0
    func hex(_ from: Int, _ count: Int) -> UInt16? {
        guard from + count <= units.count, let v = UInt16(String(decoding: units[from..<from + count], as: UTF16.self), radix: 16) else { return nil }
        return v
    }
    while i < units.count {
        if units[i] == 0x25 {
            if i + 5 < units.count, units[i + 1] == 0x75, let v = hex(i + 2, 4) { out.append(v); i += 6; continue }
            if let v = hex(i + 1, 2) { out.append(v); i += 3; continue }
        }
        out.append(units[i])
        i += 1
    }
    return String(decoding: out, as: UTF16.self)
}

/// `interop.Reference`: a cell a native out-parameter writes; `value` reads it as a number.
public final class InteropReference {
    public var value: Any?

    public init(_ value: Any? = nil) { self.value = value }

    public var cgFloat: CGFloat {
        get { CGFloat(jsToNumber(value)) }
        set { value = Double(newValue) }
    }
    public var int: Int {
        get { Int(jsToNumber(value)) }
        set { value = Double(newValue) }
    }
    public var bool: ObjCBool {
        get { ObjCBool(jsTruthy(value)) }
        set { value = newValue.boolValue }
    }
}
