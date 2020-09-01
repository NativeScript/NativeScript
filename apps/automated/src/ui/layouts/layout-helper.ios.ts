import { Button, StackLayout, GridLayout } from '@nativescript/core';
import * as utils from '@nativescript/core/utils';
import * as TKUnit from '../../tk-unit';
import * as def from './layout-helper';

var DELTA = 0.1;

export class MyGridLayout extends GridLayout implements def.MyGridLayout {
	public measureCount: number = 0;
	public arrangeCount: number = 0;

	public widthMeasureSpec: number = Number.NaN;
	public heightMeasureSpec: number = Number.NaN;

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		super.onMeasure(widthMeasureSpec, heightMeasureSpec);
		this.widthMeasureSpec = widthMeasureSpec;
		this.heightMeasureSpec = heightMeasureSpec;
		this.measureCount++;
	}

	public onLayout(left: number, top: number, right: number, bottom: number): void {
		super.onLayout(left, top, right, bottom);
		this.arrangeCount++;
	}

	public get measured(): boolean {
		return this.measureCount > 0;
	}

	public get arranged(): boolean {
		return this.arrangeCount > 0;
	}

	public get measureWidth() {
		return utils.layout.getMeasureSpecSize(this.widthMeasureSpec);
	}

	public get measureHeight() {
		return utils.layout.getMeasureSpecSize(this.heightMeasureSpec);
	}

	get layoutWidth(): number {
		let bounds = this._getCurrentLayoutBounds();

		return bounds.right - bounds.left;
	}

	get layoutHeight(): number {
		let bounds = this._getCurrentLayoutBounds();

		return bounds.bottom - bounds.top;
	}

	get layoutLeft(): number {
		let bounds = this._getCurrentLayoutBounds();

		return bounds.left;
	}

	get layoutTop(): number {
		let bounds = this._getCurrentLayoutBounds();

		return bounds.top;
	}
}

export class MyStackLayout extends StackLayout implements def.MyStackLayout {
	public measureCount: number = 0;
	public arrangeCount: number = 0;

	public widthMeasureSpec: number = Number.NaN;
	public heightMeasureSpec: number = Number.NaN;

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		super.onMeasure(widthMeasureSpec, heightMeasureSpec);
		this.widthMeasureSpec = widthMeasureSpec;
		this.heightMeasureSpec = heightMeasureSpec;
		this.measureCount++;
	}

	public onLayout(left: number, top: number, right: number, bottom: number): void {
		super.onLayout(left, top, right, bottom);
		this.arrangeCount++;
	}

	public get measured(): boolean {
		return this.measureCount > 0;
	}

	public get arranged(): boolean {
		return this.arrangeCount > 0;
	}

	public get measureWidth() {
		return utils.layout.getMeasureSpecSize(this.widthMeasureSpec);
	}

	public get measureHeight() {
		return utils.layout.getMeasureSpecSize(this.heightMeasureSpec);
	}

	get layoutWidth(): number {
		let bounds = this._getCurrentLayoutBounds();

		return bounds.right - bounds.left;
	}

	get layoutHeight(): number {
		let bounds = this._getCurrentLayoutBounds();

		return bounds.bottom - bounds.top;
	}

	get layoutLeft(): number {
		let bounds = this._getCurrentLayoutBounds();

		return bounds.left;
	}

	get layoutTop(): number {
		let bounds = this._getCurrentLayoutBounds();

		return bounds.top;
	}
}

export class MyButton extends Button implements def.MyButton {
	public measureCount: number = 0;
	public arrangeCount: number = 0;

	public widthMeasureSpec: number = Number.NaN;
	public heightMeasureSpec: number = Number.NaN;

	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
		super.onMeasure(widthMeasureSpec, heightMeasureSpec);
		this.widthMeasureSpec = widthMeasureSpec;
		this.heightMeasureSpec = heightMeasureSpec;
		this.measureCount++;
	}

	public onLayout(left: number, top: number, right: number, bottom: number): void {
		super.onLayout(left, top, right, bottom);
		this.arrangeCount++;
	}

	public get measured(): boolean {
		return this.measureCount > 0;
	}

	public get arranged(): boolean {
		return this.arrangeCount > 0;
	}

	public get measureWidth() {
		return utils.layout.getMeasureSpecSize(this.widthMeasureSpec);
	}

	public get measureHeight() {
		return utils.layout.getMeasureSpecSize(this.heightMeasureSpec);
	}

	get layoutWidth(): number {
		let bounds = this._getCurrentLayoutBounds();

		return bounds.right - bounds.left;
	}

	get layoutHeight(): number {
		let bounds = this._getCurrentLayoutBounds();

		return bounds.bottom - bounds.top;
	}

	get layoutLeft(): number {
		let bounds = this._getCurrentLayoutBounds();

		return bounds.left;
	}

	get layoutTop(): number {
		let bounds = this._getCurrentLayoutBounds();

		return bounds.top;
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
	return utils.layout.toDeviceIndependentPixels(value);
}

export function dip(value: number): number {
	return utils.layout.toDevicePixels(value);
}
