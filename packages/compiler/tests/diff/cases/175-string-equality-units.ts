// Strings are equal when their UTF-16 code units are: a composed and a decomposed `é` differ, in `===`, `==`, `switch` and
// `includes`, as they do as Map and Set keys.
const nfc: string = '\u00e9', nfd: string = 'e\u0301';
const maybe: string | undefined = nfd;
console.log(nfc === nfd, nfc == nfd, nfc !== nfd, nfc === maybe, new Set([nfc, nfd]).size, [nfc].includes(nfd), [nfc].indexOf(nfd));
function kind(s: string): string {
  switch (s) {
    case '\u00e9': return 'composed';
    case 'K': return 'letter K';
    default: return 'other';
  }
}
function kindOf(s: string, composed: string): string {
  switch (s) {
    default: return 'other';
    case composed: return 'composed';
  }
}
const kelvin: string = '\u212a', question: string = 'a\u037e';
console.log(kind(nfc), kind(nfd), kind(kelvin), kindOf(nfd, nfc), kindOf(nfc, nfc), kelvin === 'K', question == 'a;');
