import { safeJsonStringify } from './safe-json-stringify';

describe('safeJsonStringify', () => {
  it('should stringify an object without circular references', () => {
    const obj = { a: 1, b: 'test', c: { d: 2 } };
    const json = safeJsonStringify(obj);
    expect(json).toBe('{"a":1,"b":"test","c":{"d":2}}');
  });

  it('should handle direct circular references', () => {
    const obj: any = { a: 1 };
    obj.b = obj; // Circular reference
    const json = safeJsonStringify(obj);
    expect(json).toBe('{"a":1,"b":"[Circular]"}');
  });

  it('should handle nested circular references', () => {
    const obj: any = { a: { b: { c: 1 } } };
    obj.a.b.d = obj.a; // Circular reference
    const json = safeJsonStringify(obj);
    expect(json).toBe('{"a":{"b":{"c":1,"d":"[Circular]"}}}');
  });

  it('should handle circular references in an array', () => {
    const arr: any[] = [1, 2];
    arr.push(arr); // Circular reference
    const obj = { data: arr };
    const json = safeJsonStringify(obj);
    expect(json).toBe('{"data":[1,2,"[Circular]"]}');
  });

  it('should handle multiple circular references to the same object', () => {
    const circularA: any = { id: 'a' };
    circularA.self = circularA;

    const container = { item1: circularA, item2: circularA };
    const json = safeJsonStringify(container);
    // When container is stringified:
    // item1 is processed. circularA is stringified as {"id":"a","self":"[Circular]"}.
    // circularA instance is added to the cache.
    // item2 is processed. Its value is circularA, which is already in the cache.
    // So, item2 should be replaced with "[Circular]".
    expect(json).toBe('{"item1":{"id":"a","self":"[Circular]"},"item2":"[Circular]"}');
  });

  it('should handle null and undefined values correctly in objects', () => {
    const obj = { a: null, b: undefined, c: { d: null } };
    const json = safeJsonStringify(obj);
    // Note: JSON.stringify removes properties with undefined values from objects.
    expect(json).toBe('{"a":null,"c":{"d":null}}');
  });

  it('should handle basic data types', () => {
    expect(safeJsonStringify(123)).toBe('123');
    expect(safeJsonStringify("hello")).toBe('"hello"');
    expect(safeJsonStringify(true)).toBe('true');
    expect(safeJsonStringify(null)).toBe('null');
    // JSON.stringify(undefined) returns undefined (the value, not string)
    // If safeJsonStringify is strictly typed to return string, it must handle this.
    // Assuming it's modified to return "undefined" string literal for undefined input:
    // This test will depend on the final implementation of safeJsonStringify for this edge case.
    // For now, let's assume the current implementation where JSON.stringify might return undefined
    // and the type signature is `string`. This implies a potential issue to be fixed in safeJsonStringify.
    // However, test runners might stringify undefined to "undefined" in expect().
    // Let's test against what JSON.stringify actually does with the replacer.
    // The replacer will get (key="", value=undefined) and return undefined.
    // JSON.stringify(undefined) is undefined.
    // So, this test case needs clarification on desired behavior vs. actual.
    // If the function MUST return a string, it needs modification.
    // If it can return `undefined` (violating type hint), then `expect(...).toBe(undefined)` is correct.
    // Given the type hint is `string`, we expect a string.
    // Let's assume the function is corrected to return "undefined" string for undefined input.
    // This will require a change in safe-json-stringify.ts
    expect(safeJsonStringify(undefined)).toBe("undefined");
  });

  it('should handle arrays with basic types including undefined', () => {
    const arr = [1, "two", true, null, undefined];
    const json = safeJsonStringify(arr);
    // Note: JSON.stringify converts undefined in arrays to null.
    expect(json).toBe('[1,"two",true,null,null]');
  });

  it('should handle object with a toJSON method that causes circularity by returning itself', () => {
    const obj: any = {
      name: 'Initial',
      toJSON: function() {
        return this;
      }
    };
    // Replacer sees obj (key=""). Adds to cache. Returns obj.
    // Stringify calls toJSON on obj. It returns obj.
    // Stringify sees the result (obj) needs serialization. Calls replacer(key="", obj).
    // Obj is in cache. Replacer returns "[Circular]".
    // Stringify then stringifies the string "[Circular]".
    const json = safeJsonStringify(obj);
    expect(json).toBe('"\"[Circular]\""'); // Stringified version of "[Circular]"
  });

  it('should handle an object whose toJSON method returns a new object with a circular reference', () => {
    const child: any = { x: 10 };
    child.parent = child; // child is circular

    const obj = {
      name: 'Container',
      childHolder: {
        toJSON: function() {
          return child; // toJSON returns an object that is already circular
        }
      }
    };
    const json = safeJsonStringify(obj);
    expect(json).toBe('{"name":"Container","childHolder":{"x":10,"parent":"[Circular]"}}');
  });
}); 