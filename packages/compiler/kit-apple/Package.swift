// swift-tools-version: 6.2
import PackageDescription

// What a NativeScript app's release build links instead of a JavaScript
// runtime: @nativescript/core's views, layout and styling as UIKit, and the
// signals compiled components update them through. Script is single-threaded,
// so the kit is isolated to the main actor. Its classes declare
// `nonisolated deinit {}`: an implicit deinit would be isolated, and each hop
// to the main actor it carries costs code.
let package = Package(
    name: "NativeScriptKit",
    platforms: [.iOS(.v17)],
    products: [.library(name: "NativeScriptKit", targets: ["NativeScriptKit"])],
    targets: [
        .target(name: "NativeScriptKit", exclude: ["Core/manifest.json"], swiftSettings: [.defaultIsolation(MainActor.self)])
    ]
)
