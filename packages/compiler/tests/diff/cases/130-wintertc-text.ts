// @swift
// TextEncoder, TextDecoder, btoa and atob as the NativeScript runtime has them (WinterTC).
const encoder = new TextEncoder();
const bytes = encoder.encode('héllo €😀');
console.log(encoder.encoding, bytes.length, bytes);
console.log(encoder.encode().length, encoder.encode('').byteLength);

const decoder = new TextDecoder();
console.log(decoder.encoding, decoder.decode(bytes));
console.log(decoder.decode(bytes.buffer), decoder.decode(new Uint8Array([0xef, 0xbb, 0xbf, 0x41, 0xff, 0x42])));
console.log(new TextDecoder('utf-8').decode(new DataView(bytes.buffer, 1, 2)), JSON.stringify(decoder.decode()));
console.log(decoder.decode(new Uint8Array([0xef, 0xbb, 0xbf, 0x41, 0xff, 0x42])) === 'A�B');

const encoded = btoa('Osei');
console.log(encoded, atob(encoded), atob(encoded) === 'Osei');
console.log(btoa(''), btoa('a'), btoa('ab'), btoa('éÿ\u0000'), atob('6f8A').length);
console.log(atob(' T3 Nl\naQ== '), atob('T3NlaQ'));
for (const input of ['€', '😀']) {
  try {
    btoa(input);
    console.log('encoded', input);
  } catch (e) {
    console.log('btoa threw', (e as Error).name);
  }
}
for (const input of ['T3NlaQ=', 'T', '*abc']) {
  try {
    console.log('decoded', atob(input));
  } catch (e) {
    console.log('atob threw', (e as Error).name);
  }
}
const strict = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });
console.log(strict.fatal, strict.ignoreBOM, decoder.fatal, JSON.stringify(strict.decode(new Uint8Array([0xef, 0xbb, 0xbf, 0x41]))));
try {
  strict.decode(new Uint8Array([0x41, 0xff]));
} catch (e) {
  console.log('decode threw', (e as Error).name);
}
console.log(decoder.decode(new Uint8Array([0xe2, 0x82, 0x41, 0xf0, 0x9f, 0x98, 0xc3])).length);
