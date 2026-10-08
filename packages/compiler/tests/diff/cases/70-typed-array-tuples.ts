// @swift
// A typed tuple is an array to typed arrays: set from it, and made from it.
type Rgb = [number, number, number];
const sky: Rgb = [0.25, 0.5, 0.75];
const scene = new Float32Array(8);
scene.set(sky, 4);
console.log(Array.from(scene).join(','));
console.log(Array.from(new Float64Array(sky)).join(','), new Uint8Array(sky).length);
