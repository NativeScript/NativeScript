// @lenient
// `s.match(/x/g)` held as the string[] its declaration says (core's qualifier matcher), then each match replaced.
interface Spec {
  isMatch(path: string): boolean;
  getMatchOccurences(path: string): Array<string>;
}
const minW: Spec = {
  isMatch: function (path: string): boolean {
    return new RegExp(`.minW\\d+`).test(path);
  },
  getMatchOccurences: function (path: string): Array<string> {
    return path.match(new RegExp(`.minW\\d+`, 'g'));
  },
};
function strip(path: string): string {
  if (minW.isMatch(path)) {
    const occurences = minW.getMatchOccurences(path);
    for (let j = 0; j < occurences.length; j++) {
      path = path.replace(occurences[j], '');
    }
  }
  return path;
}
console.log(strip('main-page.minW400.xml'), strip('plain.xml'), minW.getMatchOccurences('a.minW1.minW22').length);
