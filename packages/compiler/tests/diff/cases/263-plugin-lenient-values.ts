// @plugin
// A non-strict app using a plugin compiled from its source, as an app uses @nativescript/canvas's WebGPU classes:
// a getter whose field starts unset, a factory resolved through `as never`, options spread from an untyped value.
import { GPUDevice } from './helpers/plugin/device.ts';
import { GPUAdapter, GPUInfo, configure, layouts, messagesOf } from './helpers/plugin/gpu.ts';

const device = GPUDevice.fromNative({ queue: { id: 1 } });
device.queue.writeBuffer(4);
device.queue.writeBuffer(8);
console.log(device.queue.written);

console.log(configure({ device, format: 'bgra8unorm' }));
console.log(configure({ device, format: 'rgba8unorm', usage: 4 }));
console.log(layouts({ buffers: [{ arrayStride: 8, attributes: [{}, {}] }, { arrayStride: 4 }] }).join(' '));
console.log(messagesOf(GPUInfo.fromNative({}), ['a', 'b']));

const adapter = GPUAdapter.fromNative({
  info: { name: 'gpu' },
  requestAdapterInfo: () => ({ vendor: 'nstudio' }),
  requestDevice: (options, callback) => callback(null, { queue: {} }),
});
adapter.requestDevice().then((d) => console.log('device', d.label));
adapter.requestAdapterInfo().then((info) => console.log('vendor', info.vendor));
adapter.requestInfo().then((info) => console.log('info', info.messages.length));
adapter.emptyInfo().then((info) => console.log('empty', info.messages.length));
// Resolved with null in JavaScript; Swift's promise of an object refuses it with a TypeError. Neither prints.
try {
  void adapter.missingInfo();
} catch {}
