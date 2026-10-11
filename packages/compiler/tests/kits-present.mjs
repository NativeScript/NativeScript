// Run before packing: the package ships both kits generated from core, from the same core release.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const kits = { iOS: 'kit-apple/Sources/NativeScriptKit/Core/manifest.json', Android: 'kit-android/generated/manifest.json' };
const cores = {};
for (const [platform, file] of Object.entries(kits)) {
  if (!existsSync(join(root, file))) {
    console.error(`${file} is missing: generate the ${platform} kit (npx nx run compiler:${platform === 'iOS' ? 'kit' : 'kit-android'}) before packing`);
    process.exit(1);
  }
  cores[platform] = JSON.parse(readFileSync(join(root, file), 'utf8')).core;
}
if (cores.iOS !== cores.Android) {
  console.error(`the kits come from different cores: iOS ${cores.iOS}, Android ${cores.Android}`);
  process.exit(1);
}
console.log(`kits generated from @nativescript/core ${cores.iOS}`);
