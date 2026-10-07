// @lenient
// A method typed to give a number that gives undefined for no argument, overridden, as core maps a
// child's index to its native index: undefined there means "append", not index 0.
class Base {
  nativeIndex(index?: number): number {
    return index;
  }
}
class Layout extends Base {
  counts = [1, 2, 1];
  nativeIndex(index?: number): number {
    if (index === undefined) {
      return undefined;
    }
    let result = 0;
    for (let i = 0; i < index && i < this.counts.length; i++) {
      result += this.counts[i];
    }
    return super.nativeIndex(result);
  }
}
function insert(layout: Base, index?: number): string {
  const at = layout.nativeIndex(index);
  return typeof at !== 'number' ? 'append' : `at ${at}`;
}
console.log(insert(new Layout()), insert(new Layout(), 2), insert(new Base()), insert(new Base(), 1));
class View {
  add(child: string, atIndex?: number): string {
    return `${child}@${atIndex === undefined ? 'end' : atIndex}`;
  }
}
class Page extends View {
  add(child: string, atIndex: number): string {
    return typeof atIndex === 'number' ? `page ${child} at ${atIndex + 1}` : `page ${super.add(child, atIndex)}`;
  }
}
const page: View = new Page();
console.log(page.add('bar'), page.add('content', 0));
