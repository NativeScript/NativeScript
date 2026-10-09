import XCTest

/// Drives the simulator for the comparison tools: taps, double taps, presses, drags, swipes
/// and typing at screen points (points of the device's screen, not pixels), whatever app is in front.
/// Commands are JSON files `cmd-<n>.json` in `DRIVER_DIR`; each is answered with
/// `done-<n>` holding "ok" or the error. `{"op":"stop"}` ends the session.
final class Driver: XCTestCase {
    func testServe() throws {
        guard let dir = ProcessInfo.processInfo.environment["DRIVER_DIR"] else { throw XCTSkip("DRIVER_DIR is not set") }
        let files = FileManager.default
        // SpringBoard covers the whole screen, so its coordinates are the screen's.
        let screen = XCUIApplication(bundleIdentifier: "com.apple.springboard")
        let origin = screen.coordinate(withNormalizedOffset: .zero)
        let point = { (x: Any?, y: Any?) in origin.withOffset(CGVector(dx: (x as? Double) ?? 0, dy: (y as? Double) ?? 0)) }
        try "ready".write(toFile: dir + "/ready", atomically: true, encoding: .utf8)
        while true {
            let pending = ((try? files.contentsOfDirectory(atPath: dir)) ?? []).filter { $0.hasPrefix("cmd-") && $0.hasSuffix(".json") }.sorted()
            for name in pending {
                let path = dir + "/" + name
                guard let data = files.contents(atPath: path), let command = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any] else { continue }
                try? files.removeItem(atPath: path)
                let id = name.dropFirst(4).dropLast(5)
                var result = "ok"
                switch command["op"] as? String {
                case "tap":
                    let at = point(command["x"], command["y"])
                    if let hold = command["duration"] as? Double, hold > 0.2 { at.press(forDuration: hold) } else { at.tap() }
                case "taps":
                    let at = point(command["x"], command["y"])
                    let count = (command["count"] as? Int) ?? 2
                    if count == 2 { at.doubleTap() } else { for _ in 0..<count { at.tap() } }
                case "drag":
                    // Moves at the speed the duration gives and holds still at the end, so the last move arrives before the touch lifts.
                    let from = point(command["x"], command["y"]), to = point(command["toX"], command["toY"])
                    let dx = ((command["toX"] as? Double) ?? 0) - ((command["x"] as? Double) ?? 0), dy = ((command["toY"] as? Double) ?? 0) - ((command["y"] as? Double) ?? 0)
                    let velocity = XCUIGestureVelocity((dx * dx + dy * dy).squareRoot() / max((command["duration"] as? Double) ?? 0.5, 0.05))
                    from.press(forDuration: 0.05, thenDragTo: to, withVelocity: velocity, thenHoldForDuration: (command["hold"] as? Double) ?? 0.3)
                case "swipe":
                    point(command["x"], command["y"]).press(forDuration: (command["hold"] as? Double) ?? 0.05, thenDragTo: point(command["toX"], command["toY"]))
                case "type":
                    guard let bundle = command["app"] as? String, let text = command["text"] as? String else { result = "type needs app and text"; break }
                    XCUIApplication(bundleIdentifier: bundle).typeText(text)
                case "stop":
                    try? "ok".write(toFile: "\(dir)/done-\(id)", atomically: true, encoding: .utf8)
                    return
                default:
                    result = "unknown op \(command["op"] ?? "nil")"
                }
                try? result.write(toFile: "\(dir)/done-\(id)", atomically: true, encoding: .utf8)
            }
            usleep(20_000)
        }
    }
}
