import { Button, StackLayout, GridLayout } from '@nativescript/core';

export interface MeasuredView {
	measureCount: number;
	arrangeCount: number;

	measured: boolean;
	arranged: boolean;

	measureHeight: number;
	measureWidth: number;

	widthMeasureSpec: number;
	heightMeasureSpec: number;

	layoutWidth: number;
	layoutHeight: number;
	layoutLeft: number;
	layoutTop: number;
}

export class MyButton extends Button implements MeasuredView {
	measureCount: number;
	arrangeCount: number;

	measured: boolean;
	arranged: boolean;

	measureHeight: number;
	measureWidth: number;

	widthMeasureSpec: number;
	heightMeasureSpec: number;

	layoutWidth: number;
	layoutHeight: number;
	layoutLeft: number;
	layoutTop: number;
}

export class MyStackLayout extends StackLayout implements MeasuredView {
	measureCount: number;
	arrangeCount: number;

	measured: boolean;
	arranged: boolean;

	measureHeight: number;
	measureWidth: number;

	widthMeasureSpec: number;
	heightMeasureSpec: number;

	layoutWidth: number;
	layoutHeight: number;
	layoutLeft: number;
	layoutTop: number;
}

export class MyGridLayout extends GridLayout implements MeasuredView {
	measureCount: number;
	arrangeCount: number;

	measured: boolean;
	arranged: boolean;

	measureHeight: number;
	measureWidth: number;

	widthMeasureSpec: number;
	heightMeasureSpec: number;

	layoutWidth: number;
	layoutHeight: number;
	layoutLeft: number;
	layoutTop: number;
}

export function assertMeasure(view: MeasuredView, width: number, height: number, name?: string);
export function assertLayout(view: MeasuredView, left: number, top: number, width: number, height: number, name?: string): void;
export function dip(value: number): number;
export function dp(value: number): number;
