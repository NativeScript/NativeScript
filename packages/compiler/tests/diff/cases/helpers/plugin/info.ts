const native_ = Symbol('native');

export class GPUAdapterInfo {
  [native_];
  get vendor() {
    return this[native_]?.vendor ?? '';
  }
  static fromNative(info) {
    if (info) {
      const ret = new GPUAdapterInfo();
      ret[native_] = info;
      return ret;
    }
    return null;
  }
}
