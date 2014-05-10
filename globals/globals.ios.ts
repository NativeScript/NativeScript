/**
  * iOS specific global functions implementation.
  */
export function setTimeout(callback: Function, milliseconds: number): void {
    var target = Foundation.NSObject.extends({ tick: function (timer) { callback(); } }, { exposedMethods: { "tick:": "v@:@" } });
    Foundation.NSTimer.scheduledTimerWithTimeIntervalTargetSelectorUserInfoRepeats(milliseconds / 1000, new target(), "tick:", null, false);
}
