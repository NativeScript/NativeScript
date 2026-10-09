// An interface named as the class another module declares for it (sqlite's common and iOS files).
export interface Database {
  readonly path: string;
  count(): number;
}

export function describe(db: Database): string {
  return `${db.path}: ${db.count()}`;
}
