import { Observable } from '@nativescript/core/data/observable';

var vm = new Observable();

export function onPageLoaded(args) {
	var page = args.object;
	vm.set('firstTitle', 'fiiiirst');
	vm.set('secondTitle', 'secondTitle');
	vm.set('secondIcon', 'res://icon');
	page.bindingContext = vm;
}
var i = 0;

export function onTap() {
	i++;
	vm.set('firstTitle', 'changed ' + i);
	if (i === 3) {
		vm.set('firstIcon', 'res://ic_action');
	}
	if (i === 4) {
		vm.set('firstIcon', '');
	}
}

export function setStyle(args) {
	var page = args.object.actionBar.page;

	page.css = 'TabView { color: red; }';
}

export function clearStyle(args) {
	var page = args.object.actionBar.page;

	page.css = 'Page { background-color: red; }';
}
