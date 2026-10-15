const native_ = Symbol('native');

export class GPUQueue {
  [native_];
  written = 0;
  writeBuffer(size: number) {
    this.written += size;
  }
  static fromNative(value: any) {
    if (value) {
      const ret = new GPUQueue();
      ret[native_] = value;
      return ret;
    }
    return null;
  }
}

export class GPUDevice {
  [native_];
  label = 'device';
  private _queue: GPUQueue;
  get queue() {
    if (!this._queue) {
      this._queue = GPUQueue.fromNative(this[native_].queue);
    }
    return this._queue;
  }
  static fromNative(value) {
    if (value) {
      const ret = new GPUDevice();
      ret.label = value.label ?? ret.label;
      ret[native_] = value;
      return ret;
    }
    return null;
  }
}
