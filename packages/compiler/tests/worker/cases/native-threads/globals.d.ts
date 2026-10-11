// What an app's own typings declare (@types/node's `global`, the DOM's `onmessage`, the bundler's `import.meta.url`).
declare var global: typeof globalThis;
declare var onmessage: ((ev: any) => any) | null;
interface ImportMeta {
  readonly url: string;
}
