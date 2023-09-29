import { Transition, PageTransition } from '@nativescript/core';

export class CustomTransition extends Transition {
	constructor();
	constructor(duration: number, curve: any);
}

export class CustomSharedElementPageTransition extends PageTransition {}
