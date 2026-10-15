// @lenient-kotlin
// Tests on values core's non-strict types call present: an unset `let x: boolean` (undefined until set) and a function
// declared boolean returning undefined, a callback the options may lack, and a partial override of a property's handlers.
let serviceEnabled: boolean;
function isServiceEnabled(): boolean {
  if (typeof serviceEnabled === 'boolean') {
    return serviceEnabled;
  }
  return undefined;
}
function setServiceEnabled(value: boolean): void {
  serviceEnabled = value;
}
let detections = 0;
function isAccessibilityEnabled(): boolean {
  const enabled = isServiceEnabled();
  if (typeof enabled === 'boolean') {
    return enabled;
  }
  detections++;
  setServiceEnabled(detections > 1);
  return !!serviceEnabled;
}
console.log(isServiceEnabled() === undefined, typeof isServiceEnabled());
console.log(isAccessibilityEnabled(), detections, isServiceEnabled());
console.log(isAccessibilityEnabled(), detections);

let density: number;
function densityOrDefault(): number {
  return typeof density === 'number' ? density : -1;
}
console.log(densityOrDefault());
density = 2;
console.log(densityOrDefault());

interface ModalOptions {
  context: any;
  closeCallback?: Function;
}
function closeModal(options: ModalOptions, ...args: any[]): string {
  if (typeof options.closeCallback === 'function') {
    options.closeCallback.apply(undefined, args);
  }
  return 'closed';
}
console.log(closeModal({ context: null }, 1));
console.log(closeModal({ context: null, closeCallback: (...a: any[]) => console.log('callback', a.length) }, 1, 2));

interface HandlerOptions {
  affectsLayout?: boolean;
  valueChanged?: (oldValue: string, newValue: string) => void;
}
class Prop {
  affectsLayout = true;
  valueChanged: (oldValue: string, newValue: string) => void = () => console.log('default valueChanged');
  overrideHandlers(options: HandlerOptions): void {
    if (typeof options.affectsLayout !== 'undefined') {
      this.affectsLayout = options.affectsLayout;
    }
    if (typeof options.valueChanged !== 'undefined') {
      this.valueChanged = options.valueChanged;
    }
  }
}
const prop = new Prop();
prop.overrideHandlers({ affectsLayout: false });
console.log(prop.affectsLayout);
prop.valueChanged('a', 'b');
prop.overrideHandlers({ valueChanged: (o, n) => console.log('override', o, n) });
console.log(prop.affectsLayout);
prop.valueChanged('a', 'b');
