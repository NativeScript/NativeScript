// @lenient
// @weak-fields Observer._target
// @weak-captures Observer._onLoaded
// Core's gesture bookkeeping (ui/core/view/view-common.ts `_observe`, ui/gestures/index.ios.ts): a view keeps its
// observers in a record of arrays declared through a cast, and an observer's loaded handler holds it weakly. The view
// owns its observers, so a handler registered before the first collection still fires afterwards, and a dropped view
// frees them.
const gc = (globalThis as any).gc as (() => void) | undefined;
enum GestureTypes {
  tap = 1 << 0,
  doubleTap = 1 << 1,
  pan = 1 << 3,
}
class View {
  private listeners: { [name: string]: Array<() => void> } = {};
  public readonly _gestureObservers = {} as Record<GestureTypes, Array<Observer>>;
  on(event: string, callback: () => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }
  notify(event: string) {
    (this.listeners[event] || []).forEach((callback) => callback());
  }
  _observe(type: GestureTypes, callback: (args: string) => void) {
    if (this._gestureObservers[type]?.find((observer) => observer.callback === callback)) return;
    if (!this._gestureObservers[type]) {
      this._gestureObservers[type] = [];
    }
    this._gestureObservers[type].push(observe(this, type, callback));
  }
  getGestureObservers(type: GestureTypes): Array<Observer> | undefined {
    return this._gestureObservers[type];
  }
}
class Observer {
  _target: View;
  _onLoaded: () => void;
  constructor(target: View, public callback: (args: string) => void) {
    this._target = target;
  }
  observe(type: GestureTypes) {
    this._onLoaded = () => {
      this.callback(`type ${type} loaded on a view with ${this._target.getGestureObservers(type).length} observer(s)`);
    };
    this._target.on('loaded', this._onLoaded);
  }
}
function observe(target: View, type: GestureTypes, callback: (args: string) => void): Observer {
  const observer = new Observer(target, callback);
  observer.observe(type);
  return observer;
}
let view = new View();
const handler = (text: string) => console.log('handler:', text);
view._observe(GestureTypes.tap, handler);
view._observe(GestureTypes.tap, handler);
view._observe(GestureTypes.pan, handler);
const refs = [GestureTypes.tap, GestureTypes.pan].map((type) => new WeakRef(view.getGestureObservers(type)[0]));
setTimeout(() => {
  gc?.();
  console.log('observers alive:', refs.filter((r) => r.deref() !== undefined).length);
  view.notify('loaded');
  view = null;
  setTimeout(() => {
    gc?.();
    console.log('dropped, alive:', refs.filter((r) => r.deref() !== undefined).length);
  }, 0);
}, 0);
