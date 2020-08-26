import { Button, StackLayout, GridLayout, Utils } from '@nativescript/core';

import * as TKUnit from '../../tk-unit';
import * as def from './layout-helper';

var DELTA = 0.1;

@NativeClass
class NativeButton extends android.widget.Button {
	constructor(context: android.content.Context, public owner: def.MeasuredView) {
		super(context);

		return global.__native(this);
	}

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		super.onMeasure(widthMeasureSpec, heightMeasureSpec);
		this.owner.widthMeasureSpec = widthMeasureSpec;
		this.owner.heightMeasureSpec = heightMeasureSpec;
		this.owner.measureCount++;
	}

	public onLayout(changed: boolean, left: number, top: number, right: number, bottom: number): void {
		super.onLayout(changed, left, top, right, bottom);
		this.owner.arrangeCount++;
	}
}

@NativeClass
class NativeStackLayout extends org.nativescript.widgets.StackLayout {
	constructor(context: android.content.Context, public owner: def.MeasuredView) {
		super(context);

		return global.__native(this);
	}

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		super.onMeasure(widthMeasureSpec, heightMeasureSpec);
		this.owner.widthMeasureSpec = widthMeasureSpec;
		this.owner.heightMeasureSpec = heightMeasureSpec;
		this.owner.measureCount++;
	}

	public onLayout(changed: boolean, left: number, top: number, right: number, bottom: number): void {
		super.onLayout(changed, left, top, right, bottom);
		this.owner.arrangeCount++;
	}
}

@NativeClass
class NativeGridLayout extends org.nativescript.widgets.GridLayout {
	constructor(context: android.content.Context, public owner: def.MeasuredView) {
		super(context);

		return global.__native(this);
	}

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		super.onMeasure(widthMeasureSpec, heightMeasureSpec);
		this.owner.widthMeasureSpec = widthMeasureSpec;
		this.owner.heightMeasureSpec = heightMeasureSpec;
		this.owner.measureCount++;
	}

	public onLayout(changed: boolean, left: number, top: number, right: number, bottom: number): void {
		super.onLayout(changed, left, top, right, bottom);
		this.owner.arrangeCount++;
	}
}

export class MyButton extends Button implements def.MyButton {
	nativeViewProtected: NativeButton;

	public createNativeView() {
		return new NativeButton(this._context, this);
	}

	public initNativeView(): void {
		this.nativeViewProtected.owner = this;
	}

	public disposeNativeView() {
		this.nativeViewProtected.owner = undefined;
	}

	public measureCount: number = 0;
	public arrangeCount: number = 0;

	public widthMeasureSpec: number = Number.NaN;
	public heightMeasureSpec: number = Number.NaN;

	public get measureWidth() {
		return Utils.layout.getMeasureSpecSize(this.widthMeasureSpec);
	}
	public get measureHeight() {
		return Utils.layout.getMeasureSpecSize(this.heightMeasureSpec);
	}

	public get measured(): boolean {
		return this.measureCount > 0;
	}

	public get arranged(): boolean {
		return this.arrangeCount > 0;
	}

	get layoutWidth(): number {
		return this.nativeViewProtected.getWidth();
	}

	get layoutHeight(): number {
		return this.nativeViewProtected.getHeight();
	}

	get layoutLeft(): number {
		return this.nativeViewProtected.getLeft();
	}

	get layoutTop(): number {
		return this.nativeViewProtected.getTop();
	}
}

export class MyStackLayout extends StackLayout implements def.MyStackLayout {
	nativeViewProtected: NativeStackLayout;

	public createNativeView() {
		return new NativeStackLayout(this._context, this);
	}

	public initNativeView(): void {
		this.nativeViewProtected.owner = this;
	}

	public disposeNativeView() {
		this.nativeViewProtected.owner = undefined;
	}

	public measureCount: number = 0;
	public arrangeCount: number = 0;

	public widthMeasureSpec: number = Number.NaN;
	public heightMeasureSpec: number = Number.NaN;

	public get measureWidth() {
		return Utils.layout.getMeasureSpecSize(this.widthMeasureSpec);
	}
	public get measureHeight() {
		return Utils.layout.getMeasureSpecSize(this.heightMeasureSpec);
	}

	public get measured(): boolean {
		return this.measureCount > 0;
	}

	public get arranged(): boolean {
		return this.arrangeCount > 0;
	}

	get layoutWidth(): number {
		return this.nativeViewProtected.getWidth();
	}

	get layoutHeight(): number {
		return this.nativeViewProtected.getHeight();
	}

	get layoutLeft(): number {
		return this.nativeViewProtected.getLeft();
	}

	get layoutTop(): number {
		return this.nativeViewProtected.getTop();
	}
}

export class MyGridLayout extends GridLayout implements def.MyGridLayout {
	nativeViewProtected: NativeGridLayout;

	public createNativeView() {
		return new NativeGridLayout(this._context, this);
	}

	public initNativeView(): void {
		this.nativeViewProtected.owner = this;
	}

	public disposeNativeView() {
		this.nativeViewProtected.owner = undefined;
	}

	public measureCount: number = 0;
	public arrangeCount: number = 0;

	public widthMeasureSpec: number = Number.NaN;
	public heightMeasureSpec: number = Number.NaN;

	public get measureWidth() {
		return Utils.layout.getMeasureSpecSize(this.widthMeasureSpec);
	}
	public get measureHeight() {
		return Utils.layout.getMeasureSpecSize(this.heightMeasureSpec);
	}

	public get measured(): boolean {
		return this.measureCount > 0;
	}

	public get arranged(): boolean {
		return this.arrangeCount > 0;
	}

	get layoutWidth(): number {
		return this.nativeViewProtected.getWidth();
	}

	get layoutHeight(): number {
		return this.nativeViewProtected.getHeight();
	}

	get layoutLeft(): number {
		return this.nativeViewProtected.getLeft();
	}

	get layoutTop(): number {
		return this.nativeViewProtected.getTop();
	}
}

export function assertMeasure(view: def.MeasuredView, width: number, height: number, name?: string) {
	name = name ? '[' + name + ']' : '';

	TKUnit.assertAreClose(view.measureWidth, width, DELTA, name + 'width');
	TKUnit.assertAreClose(view.measureHeight, height, DELTA, name + 'height');
}

export function assertLayout(view: def.MeasuredView, left: number, top: number, width: number, height: number, name?: string): void {
	name = name ? '[' + name + ']' : '';

	TKUnit.assertAreClose(view.layoutLeft, left, DELTA, name + 'left');
	TKUnit.assertAreClose(view.layoutTop, top, DELTA, name + 'top');
	TKUnit.assertAreClose(view.layoutWidth, width, DELTA, name + 'width');
	TKUnit.assertAreClose(view.layoutHeight, height, DELTA, name + 'height');
}

export function dp(value: number): number {
	return Utils.layout.toDeviceIndependentPixels(value);
}

export function dip(value: number): number {
	return Utils.layout.toDevicePixels(value);
}
