// The app's own top-level names that NativeScriptKit also declares.
export interface Page {
  title: string;
  depth: number;
}

export namespace Http {
  export function path(page: Page): string {
    return `/${page.title}/${page.depth}`;
  }
}

export enum Screen {
  Phone = 1,
  Tablet,
}

export namespace Settings {
  export interface Trace {
    level: number;
    label: string;
  }
  export function describe(trace: Trace): string {
    return `${trace.label}:${trace.level}`;
  }
}
