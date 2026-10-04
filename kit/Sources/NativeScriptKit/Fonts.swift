import CoreText
import Foundation

/// `registerCustomFonts` from styling/font.ios: the `.ttf` and `.otf` files in
/// the app's fonts folder, registered before the first font is resolved.
enum AppFonts {
    static let registered: Void = {
        guard let folder = Bundle.main.url(forResource: "fonts", withExtension: nil),
              let files = try? FileManager.default.contentsOfDirectory(at: folder, includingPropertiesForKeys: nil) else { return }
        for file in files where file.pathExtension == "ttf" || file.pathExtension == "otf" {
            guard let data = try? Data(contentsOf: file), let provider = CGDataProvider(data: data as CFData), let font = CGFont(provider) else { continue }
            CTFontManagerRegisterGraphicsFont(font, nil)
        }
    }()
}
