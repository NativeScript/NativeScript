// swift-tools-version: 5.9
import PackageDescription

// What a NativeScript app's release build links instead of a JavaScript
// runtime: @nativescript/core's views, layout and styling as UIKit, and the
// signals compiled components update them through.
let package = Package(
    name: "NativeScriptKit",
    platforms: [.iOS(.v17)],
    products: [.library(name: "NativeScriptKit", targets: ["NativeScriptKit"])],
    targets: [.target(name: "NativeScriptKit", exclude: ["Core/manifest.json"])]
)
