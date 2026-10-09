// `s.search(x)` with a string, which searches as `new RegExp(x)`, and with a RegExp.
const path = '/Users/me/Library/Developer/CoreSimulator/Devices/app';
console.log(path.search('Simulator'), path.search('Device.'), path.search('missing'), path.search(/core/i));
