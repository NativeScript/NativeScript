export function safeJsonStringify(obj: any): string {
  const cache = new Set();
  const result = JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        // Circular reference found, discard key
        return '[Circular]';
      }
      // Store value in our collection
      cache.add(value);
    }
    return value;
  });
  return result === undefined ? "undefined" : result;
} 