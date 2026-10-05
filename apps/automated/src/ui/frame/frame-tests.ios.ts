import { Frame, GridLayout, Label, TabView, View } from '@nativescript/core';
import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';

export * from './frame-tests-common';

function assertHostedBelowHeader(hosted: View) {
	const header = new Label();
	header.text = 'Header';
	const grid = new GridLayout();
	grid.rows = '50, *';
	GridLayout.setRow(hosted, 1);
	grid.addChild(header);
	grid.addChild(hosted);

	helper.buildUIAndRunTest(grid, () => {
		helper.waitUntilLayoutReady(hosted);

		const headerFrame = (header.nativeViewProtected as UIView).frame;
		const hostedFrame = (hosted.nativeViewProtected as UIView).frame;
		const container = (grid.nativeViewProtected as UIView).bounds;

		TKUnit.assertAreClose(hostedFrame.origin.y, headerFrame.origin.y + headerFrame.size.height, 0.5, 'top');
		TKUnit.assertAreClose(hostedFrame.origin.y + hostedFrame.size.height, container.size.height, 0.5, 'bottom');
		TKUnit.assertAreClose(hostedFrame.origin.x, 0, 0.5, 'left');
		TKUnit.assertAreClose(hostedFrame.size.width, container.size.width, 0.5, 'width');
	});
}

export function test_frame_hosted_in_layout_fills_its_cell() {
	assertHostedBelowHeader(new Frame());
}

export function test_tab_view_hosted_in_layout_fills_its_cell() {
	assertHostedBelowHeader(new TabView());
}
