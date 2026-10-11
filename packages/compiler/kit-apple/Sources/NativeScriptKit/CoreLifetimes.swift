import Foundation

/// Where core keeps a view in a cycle that JavaScript's collector frees and reference counting cannot
/// (tools/native-kit/modules.mts `counterparts`).
enum CoreLifetimes {
    /// `CssState.onUnloaded`, letting go of the match too: its change map keys the view and its ancestors,
    /// which hold the state. Loading again matches anew, as `_matchInvalid` asks.
    static func cssStateUnloaded(_ state: CssState) throws {
        try state.unsubscribeFromDynamicUpdates()
        try state.stopKeyframeAnimations()
        state._match = CssState.emptyMatch
        state._appliedChangeMap = CssState.emptyChangeMap
        state._matchInvalid = true
    }
}
