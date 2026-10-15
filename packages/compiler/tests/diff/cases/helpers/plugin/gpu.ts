// A plugin compiled from its source, written as @nativescript/canvas's WebGPU classes are: no strictNullChecks,
// factories that return null for a missing native object, fields set later, and options spread from untyped values.
import { GPUDevice } from './device.ts';
import { GPUAdapterInfo } from './info.ts';

const native_ = Symbol('native');
const messages_ = Symbol('messages');

export class GPUMessage {
  text = '';
  static fromNative(value) {
    const ret = new GPUMessage();
    ret.text = String(value);
    return ret;
  }
}

export class GPUInfo {
  [native_];
  [messages_]: GPUMessage[];
  get messages(): GPUMessage[] {
    if (!this[messages_]) {
      this[messages_] = (this[native_]?.messages ?? []).map((m) => GPUMessage.fromNative(m));
    }
    return this[messages_];
  }
  static fromNative(info) {
    if (info) {
      const ret = new GPUInfo();
      ret[native_] = info;
      return ret;
    }
    return null;
  }
}

interface GPUAdapterImpl {
  info: any;
  requestAdapterInfo(): object;
  requestDevice(options: object, callback: (error: string | null, device: object | null) => void): void;
}

export class GPUAdapter {
  [native_]: GPUAdapterImpl;
  requestInfo(): Promise<GPUInfo> {
    return new Promise((resolve, reject) => {
      const info = this[native_].info;
      resolve(GPUInfo.fromNative(info) as never);
    });
  }
  requestAdapterInfo(): Promise<GPUAdapterInfo> {
    return new Promise((resolve, reject) => {
      const info = this[native_].requestAdapterInfo();
      resolve(GPUAdapterInfo.fromNative(info) as never);
    });
  }
  requestDevice(): Promise<GPUDevice> {
    return new Promise((resolve, reject) => {
      this[native_].requestDevice({}, (error, device) => {
        if (error) {
          reject(error);
        } else {
          const ret = GPUDevice.fromNative(device);
          resolve(ret as never);
        }
      });
    });
  }
  missingInfo(): Promise<GPUInfo> {
    return Promise.resolve(GPUInfo.fromNative(null));
  }
  emptyInfo(): Promise<GPUInfo> {
    return Promise.resolve(GPUInfo.fromNative({ messages: [] }));
  }
  static fromNative(value) {
    const ret = new GPUAdapter();
    ret[native_] = value;
    return ret;
  }
}

export function configure(options: { device: GPUDevice; format: string; usage?: number }) {
  const opts = { usage: 16, colorSpace: 'srgb', ...options };
  return `${opts.device.label} ${opts.format} ${opts.usage} ${opts.colorSpace}`;
}

export function layouts(value: any) {
  return [...value.buffers].map((source) => {
    const buffer = { arrayStride: 0, attributes: [], ...source };
    return `${buffer.arrayStride}:${buffer.attributes.length}`;
  });
}

export function messagesOf(info: GPUInfo, raw: any) {
  info[messages_] = raw;
  return info.messages.map((m) => m.text).join(',');
}
