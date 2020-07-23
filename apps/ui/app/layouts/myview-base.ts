import { LayoutBase, View, Observable } from '@nativescript/core';

export class ViewModelBase extends Observable {
	public onAlignments(args: { eventName: string; object: any }): void {
		var view: View = <View>args.object;
		this.setAllPositioningProperties(view);
	}

	public onCollapse(args: { eventName: string; object: any }): void {
		var view: View = <View>args.object;
		view.visibility = 'collapse';
	}

	public onVisibile(args: { eventName: string; object: any }): void {
		var view: View = <View>args.object;
		var layout = <LayoutBase>view.parent;

		var child = <View>layout.getViewById('collapse');
		child.visibility = 'visible';
	}

	// Layout properties
	public onPaddings(args: { eventName: string; object: any }): void {
		var layout = args.object.parent;
		if (layout.marginLeft !== 5) {
			this.setPaddings(layout, 5, 5, 5, 5);
		} else {
			this.setPaddings(layout, 0, 0, 0, 0);
		}
	}

	protected setWidthHeight(child: any, width: any, height: any) {
		child.width = width;
		child.height = height;
	}

	protected setMinWidthHeight(child: any, minWidth: any, minHeight: any) {
		child.minWidth = minWidth;
		child.minHeight = minHeight;
	}

	protected setMargins(child: any, marginLeft: any, marginTop: any, marginRight: any, marginBottom: any) {
		child.marginLeft = marginLeft;
		child.marginTop = marginTop;
		child.marginRight = marginRight;
		child.marginBottom = marginBottom;
	}

	protected setPaddings(child: any, paddingLeft: any, paddingTop: any, paddingRight: any, paddingBottom: any) {
		child.marginLeft = paddingLeft;
		child.marginTop = paddingTop;
		child.marginRight = paddingRight;
		child.marginBottom = paddingBottom;
	}

	protected setAllPositioningProperties(child: any) {
		if (child.horizontalAlignment === 'stretch') {
			child.horizontalAlignment = 'left';
			child.verticalAlignment = 'top';
		} else if (child.horizontalAlignment === 'left') {
			child.horizontalAlignment = 'center';
			child.verticalAlignment = 'middle';
		} else if (child.horizontalAlignment === 'center') {
			child.horizontalAlignment = 'right';
			child.verticalAlignment = 'bottom';
		} else {
			child.horizontalAlignment = 'stretch';
			child.verticalAlignment = 'stretch';
		}
	}

	protected toggleVisibility(child) {
		if (child.visibility === 'visible') {
			child.visibility = 'collapse';
		} else {
			child.visibility = 'visible';
		}
	}
}
