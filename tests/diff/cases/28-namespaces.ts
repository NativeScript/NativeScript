// Namespaces, and modules imported as namespace objects.
import * as measure from './helpers/measure.ts';

let scale = 0;
function screenScale(): number {
  return scale || (scale = 3);
}

export namespace layout {
  export const EXACTLY = 1 << measure.MODE_SHIFT;
  export const AT_MOST = 2 << measure.MODE_SHIFT;
  const hidden = 'kept inside';

  export function makeMeasureSpec(size: number, mode: number): number {
    return (Math.round(Math.max(0, size)) & ~measure.MODE_MASK) | (mode & measure.MODE_MASK);
  }

  // A member named as the imported module's function: the call is the module's.
  export function round(value: number): number {
    return measure.round(value);
  }

  export function toDevicePixels(value: number): number {
    return value * screenScale();
  }

  export function describe(): string {
    return `${hidden}, ${EXACTLY}, ${AT_MOST}`;
  }

  export namespace nested {
    export const label = 'nested';
    export let count = 0;
    export function bump(): number {
      return ++count;
    }
  }
}

export type Curve = 'linear' | 'easeIn';
export namespace Curve {
  export const linear: Curve = 'linear';
  export const easeIn: Curve = 'easeIn';
  export const all = [linear, easeIn];
}

export namespace Types {
  export type Unit = 'px' | 'dip';
  export interface Size { width: number; height: number }
}

const size: Types.Size = { width: 2, height: 3 };
const spec = layout.makeMeasureSpec(120.6, layout.AT_MOST);
console.log(spec, measure.sizeOf(spec), spec & measure.MODE_MASK, layout.EXACTLY);
console.log(layout.round(2.5), layout.round(-0.2), layout.round(0), measure.calls);
console.log(layout.toDevicePixels(10), layout.describe());
console.log(layout.nested.label, layout.nested.bump(), layout.nested.bump(), layout.nested.count);
layout.nested.count = 10;
console.log(layout.nested.bump());
const curve: Curve = Curve.easeIn;
console.log(curve, Curve.all.join(','), size.width * size.height);
const fn = layout.toDevicePixels;
console.log(fn(2));

// A namespace merged into a class: the class's static members, beside its own.
class Flex {
  static grow(n: number): number {
    return n * 2;
  }
  total(n: number): number {
    return Flex.grow(n) + Flex.baseline(n);
  }
}
namespace Flex {
  export function baseline(n: number): number {
    return n + 1;
  }
  export const unit = 3;
}
console.log(new Flex().total(5), Flex.baseline(1), Flex.unit, Flex.grow(4));
