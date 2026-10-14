// @lenient
// `a?.b ?? fallback` and `untyped.b ?? fallback` give the fallback where the member is missing, before any conversion to its declared type.
class Failure {
  message: string;
}
function spacing(config: any): number {
  return config?.spacing ?? 8;
}
function described(e: Failure | null, fallback: string): string {
  return e?.message ?? fallback;
}
function mode(options: any): string {
  return options.mode ?? 'auto';
}
const failure = new Failure();
failure.message = 'boom';
console.log(spacing(undefined), spacing({}), spacing({ spacing: 0 }), spacing({ spacing: 4 }));
console.log(described(null, 'none'), described(failure, 'none'));
console.log(mode({}), mode({ mode: 'manual' }));
