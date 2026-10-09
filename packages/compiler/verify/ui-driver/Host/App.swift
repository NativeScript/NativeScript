import SwiftUI

/// The app a UI test bundle needs to be built against; the driver taps other apps.
@main
struct UIDriverHost: App {
    var body: some Scene { WindowGroup { Text("UI driver") } }
}
