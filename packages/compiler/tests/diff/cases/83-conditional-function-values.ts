// @lenient
// A choice between a namespace's function and the formatter another of its functions makes (core's errorFormat).
namespace formats {
  export interface Formatter {
    (e: Error, at: number): Error;
  }
  export function plain(e: Error, at: number): Error {
    return new Error(`${e.message} at ${at}`);
  }
  export function sourced(uri: string): Formatter {
    return (e: Error, at: number) => new Error(`${uri}:${at}: ${e.message}`);
  }
}
function formatterFor(debug: boolean, uri?: string): formats.Formatter {
  const format = debug && uri ? formats.sourced(uri) : formats.plain;
  return format;
}
console.log(formatterFor(true, 'main.xml')(new Error('bad'), 3).message, formatterFor(false)(new Error('bad'), 4).message);
