export const { width, height } = { width: 3, height: 4 };
export const [first, second] = ['x', 'y'];
export function label(): string {
  return `three ${width}${first}`;
}
export function apply(f: () => string): string {
  return f();
}
export const labels = [label].map((f) => f());
