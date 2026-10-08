import UIKit

/// `requestAnimationFrame(callback)`: called on the next display frame with the frame's time in
/// milliseconds, as core's iOS implementation calls it from a CADisplayLink.
private final class FrameCallbacks: NSObject {
    static let shared = FrameCallbacks()
    private var link: CADisplayLink?
    private var callbacks: [(id: Double, fn: (Double) -> Void)] = []
    private var nextId = 0.0

    func add(_ fn: @escaping (Double) -> Void) -> Double {
        nextId += 1
        callbacks.append((nextId, fn))
        if link == nil {
            let link = CADisplayLink(target: self, selector: #selector(tick(_:)))
            link.add(to: .main, forMode: .common)
            self.link = link
        }
        return nextId
    }

    func remove(_ id: Double) { callbacks.removeAll { $0.id == id } }

    @objc private func tick(_ link: CADisplayLink) {
        let due = callbacks
        callbacks = []
        let time = link.timestamp * 1000
        for c in due { c.fn(time) }
        Microtasks.checkpoint()
        if callbacks.isEmpty {
            link.invalidate()
            self.link = nil
        }
    }
}

@discardableResult
public func jsRequestAnimationFrame(_ callback: @escaping (Double) -> Void) -> Double { FrameCallbacks.shared.add(callback) }

public func jsCancelAnimationFrame(_ id: Double) { FrameCallbacks.shared.remove(id) }
