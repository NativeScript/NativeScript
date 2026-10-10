// @swift
// Android's globals read by app code on iOS: not defined, as on the iOS JavaScript runtime.
function summary(): string {
  try {
    return String(android.os.Build.VERSION.SDK_INT);
  } catch (e) {
    return (e as Error).name + ': ' + (e as Error).message;
  }
}
console.log(summary(), typeof android);
