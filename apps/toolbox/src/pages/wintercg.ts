import { Page, EventData } from '@nativescript/core';

let page: Page;

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
}

export function createURL() {
	const url = new URL('../cats', 'http://www.example.com/dogs');
	console.log(url.hostname); // "www.example.com"
	console.log(url.pathname); // "/cats"

	if (URL.canParse('../cats', 'http://www.example.com/dogs')) {
		const url = new URL('../cats', 'http://www.example.com/dogs');
		console.log(url.hostname); // "www.example.com"
		console.log(url.pathname); // "/cats"
	} else {
		console.log('Invalid URL'); //Invalid URL
	}

	url.hash = 'tabby';
	console.log(url.href); // "http://www.example.com/cats#tabby"

	url.pathname = 'démonstration.html';
	console.log(url.href); // "http://www.example.com/d%C3%A9monstration.html"
}

let encoded;
let encodedBase64;
export function encode() {
	const encoder = new TextEncoder();
	encoded = encoder.encode(txt);
}

export function decode() {
	const decoder = new TextDecoder();
	const eq = decoder.decode(encoded) === txt;
	console.log('decode: equal', eq);
}

export function atobFunc() {
	const eq = atob(encodedBase64) === txt;

	console.log('atob: equal', eq);
}

export function btoaFunc() {
	encodedBase64 = btoa(txt);
}

const txt = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ac tortor congue, pharetra elit a, volutpat erat. Etiam vel ornare quam. Integer vitae sapien malesuada tellus iaculis ultrices. In hac habitasse platea dictumst. Nulla enim magna, blandit vel massa ac, bibendum viverra tortor. Nam accumsan mi eu risus pretium sollicitudin vitae ut nibh. Vivamus lorem diam, sagittis vel leo vel, pharetra aliquam ex. Aenean sollicitudin fringilla ex. Donec malesuada justo enim. Fusce elementum velit quis quam varius, sit amet feugiat sapien faucibus. Vestibulum nec tincidunt nibh, sit amet sagittis tellus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;

Vivamus vehicula eros et libero interdum, vitae volutpat augue finibus. Integer pretium, arcu sed blandit lobortis, tortor purus mollis eros, non fringilla leo arcu nec risus. Quisque cursus diam quam. Morbi id gravida quam, nec dapibus lorem. Duis egestas quis eros a aliquam. In suscipit est porta, dictum metus ac, efficitur odio. Aliquam convallis sem sit amet nunc malesuada placerat. Maecenas convallis, diam eu condimentum pulvinar, quam diam pretium justo, id mattis massa enim a erat.

Nulla maximus elementum turpis id elementum. Nulla enim est, vehicula a odio sed, aliquet posuere risus. Ut vitae cursus magna. Proin ut tortor non ipsum laoreet hendrerit nec tincidunt lectus. Vestibulum congue commodo purus vel condimentum. Ut ut mattis diam. Suspendisse sagittis viverra scelerisque. Donec mattis dictum efficitur. Nulla rhoncus ipsum eget finibus varius. Suspendisse cursus eget turpis congue rutrum. Proin scelerisque eget purus et ornare. Proin placerat turpis eu tortor placerat facilisis. Suspendisse potenti.

In lacinia finibus elit, id varius eros aliquam suscipit. Donec scelerisque felis at finibus molestie. Etiam suscipit lectus ac libero dignissim imperdiet. Nunc at sollicitudin elit, commodo tincidunt sapien. Vivamus tempor elit a mi dapibus, et sollicitudin felis aliquam. Pellentesque luctus malesuada urna, at semper sem ullamcorper a. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Quisque in vestibulum massa, et sollicitudin lorem. Integer euismod sem nec purus viverra laoreet. Nunc pretium commodo turpis, a auctor mi dictum sed. Maecenas egestas euismod volutpat.

Cras magna sapien, faucibus id molestie vel, ullamcorper non tortor. Vestibulum pulvinar tempus turpis ut congue. Etiam eu tristique diam. Curabitur nunc ipsum, dictum sit amet scelerisque sit amet, dictum ut est. Etiam eget dolor faucibus, iaculis nisi sed, dapibus mauris. Vivamus porttitor nunc in justo fringilla, ut pulvinar nulla sagittis. Integer fringilla turpis et metus fermentum, a volutpat neque iaculis.

Vivamus congue congue libero, lobortis fringilla felis rutrum eget. Etiam egestas augue id volutpat sagittis. Aenean eget felis euismod, faucibus mauris et, convallis tellus. Sed lectus tellus, mollis eu odio non, malesuada fermentum turpis. In eget varius elit, in consectetur odio. Nunc ullamcorper mauris pulvinar odio consectetur ultricies. Cras venenatis metus neque, a dignissim risus faucibus quis. Ut suscipit eros sit amet nisl sodales, vitae sollicitudin justo accumsan. Vivamus pellentesque convallis suscipit. Sed in velit dui.

Fusce nec sem fringilla, fringilla mi non, efficitur felis. Duis suscipit sit amet metus eu bibendum. Mauris ac mattis neque. Ut et lacus vitae lorem fermentum rutrum sit amet vitae purus. Cras eget nulla interdum, placerat nibh nec, auctor odio. Vivamus eget turpis eros. Nulla ut suscipit magna. Morbi vel ultrices tellus. Maecenas et dui vitae mi convallis laoreet eget eget nibh. Pellentesque auctor dui lacus, sit amet venenatis urna posuere in.

Aliquam consequat posuere ante id tristique. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nunc ac tellus arcu. Duis ac risus eleifend nisi molestie tincidunt. Morbi non lectus libero. Sed tellus est, scelerisque vel arcu vel, facilisis faucibus magna. Donec odio eros, tristique non tortor eu, ullamcorper lobortis purus. Nunc tristique metus sit amet lobortis consequat. Donec vitae lacinia sapien, eu dapibus justo. Donec mattis dolor molestie fringilla dapibus. Mauris tristique molestie porta. Suspendisse eget mattis justo, in varius metus. Phasellus faucibus ligula vitae maximus congue. Vestibulum arcu odio, viverra vitae dui sit amet, gravida congue ligula. Nulla est magna, rutrum eget neque ullamcorper, aliquam cursus odio.

Ut in est ipsum. Duis eget quam ex. Quisque dapibus imperdiet libero, a ullamcorper nunc consectetur ut. Integer sed ullamcorper orci. Vestibulum a enim sed odio convallis pulvinar. Duis pulvinar tempor porta. Cras sem nunc, aliquet nec placerat sed, mattis vel tortor. Donec mattis luctus finibus. Donec nibh eros, elementum eu quam quis, iaculis aliquam sapien. Donec vitae facilisis metus. Sed semper porttitor purus nec vestibulum. Proin mollis mauris sit amet mauris fringilla, fermentum dapibus lectus congue. Etiam in mauris ante. Nullam sit amet fermentum lorem, at vulputate mauris.

Integer magna quam, fringilla ut neque id, porta suscipit elit. Morbi feugiat mattis orci, ut hendrerit orci viverra nec. Curabitur laoreet laoreet molestie. Fusce condimentum feugiat lorem, vel vestibulum ante sodales bibendum. Aliquam quis semper libero. Fusce auctor nunc accumsan sagittis pharetra. Donec sagittis magna ac blandit lobortis. Nam volutpat posuere eros, vitae finibus ex aliquam a. Sed dapibus imperdiet nisi nec egestas. In et pharetra orci, ac gravida lacus. Donec condimentum velit libero, id venenatis odio lacinia quis.`;
