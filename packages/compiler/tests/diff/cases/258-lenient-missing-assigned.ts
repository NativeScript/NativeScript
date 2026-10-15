// @lenient-both
// A value core's types call present but that is missing, assigned to a member of an object Swift holds untyped:
// JavaScript stores undefined there, as core's clip-path and border masks store a layer's missing mask.
function attempt(label: string, f: () => unknown) {
  try {
    console.log(label, f());
  } catch (e) {
    console.log(label, (e as Error).name, (e as Error).message);
  }
}
class Layer {
  name = 'layer';
  mask: Layer;
}
interface Masked {
  maskType: string;
  originalMask: Layer;
}
function holderOf(view: any): any {
  return view.holder;
}
function maskIfNeeded(view: any, layer: Layer): string {
  const holder = <Masked>holderOf(view);
  holder.maskType = 'BORDER';
  holder.originalMask = layer.mask;
  layer.mask = new Layer();
  return holder.originalMask === undefined ? 'no original mask' : holder.originalMask.name;
}
const view = { holder: {} };
attempt('missing mask', () => maskIfNeeded(view, new Layer()));
const masked = new Layer();
masked.mask = new Layer();
masked.mask.name = 'original';
attempt('present mask', () => maskIfNeeded(view, masked));
