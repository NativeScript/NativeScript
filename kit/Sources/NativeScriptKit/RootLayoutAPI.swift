import UIKit

/// root-layout-stack: every RootLayout in creation order.
private var rootLayouts: [Weak<RootLayout>] = []

func registerRootLayout(_ layout: RootLayout) {
    rootLayouts.removeAll { $0.value == nil }
    rootLayouts.append(Weak(layout))
}

/// `getRootLayout()`: the first RootLayout created that still exists, not the topmost.
public func getRootLayout() -> RootLayout! {
    rootLayouts.lazy.compactMap { $0.value }.first
}

/// `getRootLayoutById(id)`.
public func getRootLayoutById(_ id: String) -> RootLayout! {
    rootLayouts.lazy.compactMap { $0.value }.first { ($0.get("id") as? String) == id }
}

/// root-layout-common's `defaultTransitionAnimation`, with a script object's fields over it.
private struct Transition {
    var translateX = 0.0, translateY = 0.0, scaleX = 1.0, scaleY = 1.0, rotate = 0.0, opacity = 1.0, duration = 300.0
    var curve: Any? = "easeIn"

    init(_ script: Any? = nil, opacity: Double = 1) {
        self.opacity = opacity
        guard let script else { return }
        func number(_ key: String) -> Double? { ((try? jsGet(script, key)) ?? nil) as? Double }
        translateX = number("translateX") ?? translateX
        translateY = number("translateY") ?? translateY
        scaleX = number("scaleX") ?? scaleX
        scaleY = number("scaleY") ?? scaleY
        rotate = number("rotate") ?? rotate
        self.opacity = number("opacity") ?? self.opacity
        duration = number("duration") ?? duration
        if let c = (try? jsGet(script, "curve")) ?? nil { curve = c }
    }
}

private func field(_ object: Any?, _ key: String) -> Any? {
    guard let object else { return nil }
    return (try? jsGet(object, key)) ?? nil
}

extension RootLayout {
    private struct Popup {
        let view: View
        let options: Any?
    }

    /// `open(view, options)`: the view fades and moves in from `animation.enterFrom` after a tick,
    /// over a shade cover when `shadeCover` is given.
    public func open(_ view: Any?, _ options: Any? = nil) -> JSPromise<Void> {
        JSPromise { resolve, reject in
            guard let view = view as? View else { return reject(JSError("Invalid open view: \(jsToString(view))")) }
            if getChildIndex(view) >= 0 { return reject(JSError("View \(String(describing: type(of: view))) has already been added to the root layout")) }
            var toOpen: [JSPromise<Void>] = []
            let enterFrom = field(field(options, "animation"), "enterFrom")
            popups.append(Popup(view: view, options: options))
            view.set("opacity", 0.0)
            insertChild(view, getChildrenCount())
            if let shade = field(options, "shadeCover") {
                if let cover = shadeCover { toOpen.append(updateShadeCover(cover, shade)) } else { toOpen.append(openShadeCover(shade)) }
            }
            toOpen.append(JSPromise { res, rej in
                _ = jsSetTimeout({
                    self.applyInitialState(view, Transition(enterFrom))
                    _ = self.enterAnimation(view, Transition(enterFrom)).play().then({ _ in
                        self.applyDefaultState(view)
                        view.emit("opened", nil)
                        res(())
                    }, { error in rej(JSError("Error playing enter animation: \(jsToString(error))")) })
                }, 0)
            })
            _ = JSPromise.all(toOpen).then({ _ in resolve(()) }, { reject($0) })
        }
    }

    /// `close(view, exitTo)`: `exitTo` or the view's `animation.exitTo` from `open`.
    public func close(_ view: Any?, _ exitTo: Any? = nil) -> JSPromise<Void> {
        JSPromise { resolve, reject in
            guard let view = view as? View else { return reject(JSError("Invalid close view: \(jsToString(view))")) }
            if getChildIndex(view) < 0 { return reject(JSError("Unable to close popup. View \(String(describing: type(of: view))) not found")) }
            var toClose: [JSPromise<Void>] = []
            let index = popups.firstIndex { $0.view === view }
            let popped = index.map { popups[$0] }
            let exit = exitTo ?? field(field(popped?.options, "animation"), "exitTo")
            if let index { popups.remove(at: index) }
            toClose.append(JSPromise { res, rej in
                guard let exit else { return res(()) }
                _ = Animation([self.exitDefinition(view, Transition(exit))]).play().then({ _ in res(()) }, { error in
                    rej(JSError("Error playing exit animation: \(jsToString(error))"))
                })
            })
            if let cover = shadeCover {
                let poppedShade = field(popped?.options, "shadeCover")
                let restore = (field(poppedShade, "ignoreShadeRestore") as? Bool) != true
                if restore, let top = popups.last, let next = field(top.options, "shadeCover") {
                    toClose.append(updateShadeCover(cover, next))
                } else {
                    toClose.append(closeShadeCover(poppedShade))
                }
            }
            _ = JSPromise.all(toClose).then({ _ in
                view.emit("closed", nil)
                self.removeChild(view)
                resolve(())
            }, { reject($0) })
        }
    }

    /// `closeAll()`.
    public func closeAll() -> JSPromise<JSArray<Void>> {
        JSPromise.all(popups.map { close($0.view) })
    }

    /// `topmost()`: the last view opened that is still open.
    public func topmost() -> View! { popups.last?.view }

    public func getShadeCover() -> View! { shadeCover }

    /// `openShadeCover(options)`: below the first open popup.
    public func openShadeCover(_ options: Any? = nil) -> JSPromise<Void> {
        JSPromise { resolve, _ in
            let index = popups.first.map { getChildIndex($0.view) }.flatMap { $0 > -1 ? $0 : nil } ?? getChildrenCount()
            if shadeCover != nil { return resolve(()) }
            let cover = GridLayout()
            cover.set("verticalAlignment", "bottom")
            cover.on("loaded") { [weak self, weak cover] _ in
                guard let self, let cover else { return }
                self.applyShadeProperties(cover, Transition(field(field(options, "animation"), "enterFrom"), opacity: 0))
                _ = self.updateShadeCover(cover, options).then({ _ in resolve(()) })
            }
            cover.on("tap") { [weak self] _ in
                if self?.shadeTapCloses == true { _ = self?.closeAll() }
            }
            shadeCover = cover
            insertChild(cover, index)
        }
    }

    /// `closeShadeCover(options)`.
    public func closeShadeCover(_ options: Any? = nil) -> JSPromise<Void> {
        JSPromise { resolve, _ in
            guard let cover = shadeCover else { return resolve(()) }
            let exit = Transition(field(field(options, "animation"), "exitTo"), opacity: 0)
            UIView.animate(withDuration: exit.duration / 1000, animations: { self.applyShadeProperties(cover, exit) }, completion: { _ in
                if let cover = self.shadeCover, cover.parent != nil { self.removeChild(cover) }
                self.shadeCover = nil
                resolve(())
            })
        }
    }

    /// root-layout/index.ios `_updateShadeCover`: color and `opacity` animate in over the enter duration.
    private func updateShadeCover(_ cover: View, _ options: Any?) -> JSPromise<Void> {
        if let tap = field(options, "tapToClose") as? Bool { shadeTapCloses = tap }
        return JSPromise { resolve, _ in
            guard cover.nativeView != nil else { return }
            let duration = (field(field(field(options, "animation"), "enterFrom"), "duration") as? Double).flatMap { $0 != 0 ? $0 : nil } ?? 300
            let color = (field(options, "color") as? String) ?? "#000000"
            let opacity = field(options, "opacity") as? Double ?? 0
            UIView.animate(withDuration: duration / 1000, animations: {
                if let ui = Color(color)?.ios { cover.nativeView?.backgroundColor = ui }
                var state = Transition(opacity: opacity)
                state.duration = duration
                self.applyShadeProperties(cover, state)
            }, completion: { _ in resolve(()) })
        }
    }

    /// `_applyAnimationProperties`: the native transform and alpha, scale 0 read as 0.1.
    private func applyShadeProperties(_ cover: View, _ state: Transition) {
        guard let native = cover.nativeView else { return }
        let translate = CGAffineTransform(translationX: state.translateX, y: state.translateY)
        let scale = CGAffineTransform(scaleX: state.scaleX == 0 ? 0.1 : state.scaleX, y: state.scaleY == 0 ? 0.1 : state.scaleY)
        let rotate = CGAffineTransform(rotationAngle: state.rotate * .pi / 180)
        native.transform = rotate.concatenating(translate.concatenating(scale))
        native.alpha = state.opacity
    }

    private func applyInitialState(_ view: View, _ state: Transition) {
        view.set("translateX", state.translateX)
        view.set("translateY", state.translateY)
        view.set("scaleX", state.scaleX)
        view.set("scaleY", state.scaleY)
        view.set("rotate", state.rotate)
        view.set("opacity", state.opacity)
    }

    private func applyDefaultState(_ view: View) {
        applyInitialState(view, Transition())
    }

    private func enterAnimation(_ view: View, _ state: Transition) -> Animation {
        var definition = AnimationDefinition(target: view)
        definition.translate = (0, 0)
        definition.scale = (1, 1)
        definition.rotate = (0, 0, 0)
        definition.opacity = 1
        definition.duration = state.duration
        definition.curve = AnimationDefinition.resolveCurve(state.curve)
        return Animation([definition])
    }

    private func exitDefinition(_ view: View, _ state: Transition) -> AnimationDefinition {
        var definition = AnimationDefinition(target: view)
        definition.translate = (state.translateX, state.translateY)
        definition.scale = (state.scaleX, state.scaleY)
        definition.rotate = (0, 0, state.rotate)
        definition.opacity = state.opacity
        definition.duration = state.duration
        definition.curve = AnimationDefinition.resolveCurve(state.curve)
        return definition
    }

    private var popups: [Popup] {
        get { rootState.popups as? [Popup] ?? [] }
        set { rootState.popups = newValue }
    }
    private var shadeCover: View? {
        get { rootState.shadeCover }
        set { rootState.shadeCover = newValue }
    }
    private var shadeTapCloses: Bool {
        get { rootState.shadeTapCloses }
        set { rootState.shadeTapCloses = newValue }
    }
}

/// What a RootLayout keeps for `open` and `close`.
final class RootLayoutState {
    var popups: [Any] = []
    var shadeCover: View?
    var shadeTapCloses = false
}
