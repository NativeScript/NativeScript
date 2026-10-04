export const registry: string[] = [];

export function register(name: string) {
  registry.push(name);
}

console.log('registry module top');
register('registry');
