// crypto on Android: random values, UUIDs, digests, HMAC and RSA-OAEP (case 131 as Kotlin).
const uuid = crypto.randomUUID();
console.log(uuid.length, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(uuid), uuid !== crypto.randomUUID());

const lucky = new Uint32Array(64);
const same = crypto.getRandomValues(lucky);
console.log(same === lucky, lucky.length, lucky.some((n) => n !== 0));
const small = crypto.getRandomValues(new Uint8Array(16));
console.log(small.length, small.every((n) => n >= 0 && n < 256));
try {
  crypto.getRandomValues(new Uint8Array(65537));
} catch (e) {
  console.log('getRandomValues threw', (e as Error).name);
}

function hex(buffer: ArrayBuffer): string {
  let out = '';
  for (const b of new Uint8Array(buffer)) out += b.toString(16).padStart(2, '0');
  return out;
}
const text = 'An obscure body in the S-K System, your majesty. The inhabitants refer to it as the planet Earth.';

async function digests() {
  const data = new TextEncoder().encode(text);
  for (const name of ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']) {
    const hash = await crypto.subtle.digest(name, data);
    console.log(name, hash.byteLength, hex(hash));
  }
  const viaObject = await crypto.subtle.digest({ name: 'sha-256' }, data.buffer);
  console.log('object', hex(viaObject));
  console.log(new Uint8Array(await crypto.subtle.digest('SHA-256', new Uint8Array(0))));
}

async function hmac() {
  const encoded = new TextEncoder().encode('Hello World');
  for (const hash of ['SHA-256', 'SHA-512']) {
    const key = await crypto.subtle.generateKey({ name: 'HMAC', hash: { name: hash } }, true, ['sign', 'verify']);
    console.log(key.type, key.extractable, key.algorithm.name, key.usages, key.algorithm);
    const signature = await crypto.subtle.sign('HMAC', key, encoded);
    console.log(hash, signature.byteLength);
    console.log('gen_hmac is valid? ', await crypto.subtle.verify('HMAC', key, signature, encoded));
    console.log('tampered valid? ', await crypto.subtle.verify({ name: 'HMAC' }, key, signature, new TextEncoder().encode('Hello world')));
  }
}

async function rsa() {
  const message = 'Hello World';
  const encoded = new TextEncoder().encode(message);
  for (const hash of ['SHA-1', 'SHA-256']) {
    const kp = await crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash }, true, ['encrypt', 'decrypt']);
    console.log(kp.publicKey.type, kp.privateKey.type, kp.publicKey.algorithm.name, kp.publicKey.usages, kp.privateKey.usages, Object.keys(kp));
    console.log(kp.privateKey.algorithm);
    const ciphertext = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, kp.publicKey, encoded);
    console.log(hash, ciphertext.byteLength);
    const decrypted = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, kp.privateKey, ciphertext);
    const decryptedValue = new TextDecoder().decode(decrypted);
    console.log('decryptedValue', decryptedValue, decryptedValue === message);
    try {
      await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, kp.publicKey, ciphertext);
      console.log('decrypted with the public key');
    } catch (e) {
      console.log('decrypt threw', (e as Error).name);
    }
  }
}

async function unsupported() {
  try {
    await crypto.subtle.digest('MD5', new Uint8Array(1));
    console.log('digested MD5');
  } catch (e) {
    console.log('digest threw', (e as Error).name);
  }
}

digests().then(hmac).then(rsa).then(unsupported);
