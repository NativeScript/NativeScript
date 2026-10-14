export enum Kind { Small, Large }
export const limit = 1;
export function label(): string {
  return `one ${limit} ${Kind.Large}`;
}
export class Item {
  name = 'one';
}
