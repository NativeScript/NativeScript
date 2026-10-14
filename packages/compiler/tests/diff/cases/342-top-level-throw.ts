// A module's top level with a `throw` statement (a configuration guard): it compiles, and runs through when it does not throw.
interface Config { apiUrl?: string; retries: number }
const config: Config = { apiUrl: 'https://example.org', retries: 3 };
if (!config.apiUrl) throw new Error('apiUrl is required');
if (config.retries < 0) throw new RangeError('retries must not be negative');
console.log('configured', config.apiUrl, config.retries);
let attempts = 0;
try {
  if (attempts === 0) throw new TypeError('not yet');
} catch (e) {
  console.log((e as Error).name, (e as Error).message);
}
