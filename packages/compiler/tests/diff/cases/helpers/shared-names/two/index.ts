export enum Kind { Large = 5 }
export const limit = 2;
export function label(): string {
  return `two ${limit} ${Kind.Large}`;
}
export class Item {
  name = 'two';
}
