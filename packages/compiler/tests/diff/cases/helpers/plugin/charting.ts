// A plugin's top-level names that NativeScriptKit also declares: a namespace, an enum, an interface and a type.
export namespace Utils {
  export const unit = 2;
  export function scaled(n: number): number {
    return n * unit;
  }
}

export enum Trace {
  Off,
  Verbose = 5,
}

export interface Color {
  name: string;
  alpha: number;
}

export type Screen = { width: number; height: number };

export function describe(color: Color, screen: Screen, level: Trace): string {
  return `${color.name}@${color.alpha} ${screen.width}x${screen.height} ${Trace[level]} ${Utils.scaled(level)}`;
}
