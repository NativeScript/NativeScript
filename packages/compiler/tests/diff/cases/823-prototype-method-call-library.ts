// @lenient-both
// As the kit is generated: every method a subclass overrides keeps a copy that `Base.prototype.m.call(obj, …)` reaches
// past the overrides of obj's class, including one returning a value and one reading another overridden method.
class Node2 {
  name = 'node';
  describe(prefix?: string): string {
    return `${prefix ?? ''}${this.name}:${this.kind()}`;
  }
  kind(): string {
    return 'node';
  }
  touch(times: number): number {
    return times;
  }
}

class Element2 extends Node2 {
  describe(prefix?: string): string {
    return `<${super.describe(prefix)}>`;
  }
  kind(): string {
    return 'element';
  }
  touch(times: number): number {
    return times * 10;
  }
}

class Button2 extends Element2 {
  describe(prefix?: string): string {
    return `[${Node2.prototype.describe.call(this, prefix)}|${Element2.prototype.describe.call(this, 'e:')}]`;
  }
  touch(times: number): number {
    return Node2.prototype.touch.apply(this, [times]) + Element2.prototype.touch.call(this, times);
  }
}

const b = new Button2();
console.log(b.describe(), b.describe('p:'), b.touch(3));
console.log(new Element2().describe(), new Node2().describe('x'));
