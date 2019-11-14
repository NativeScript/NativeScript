import { Component, ElementRef } from "@angular/core";
import { nsTestBedAfterEach, nsTestBedBeforeEach, nsTestBedRender } from "nativescript-angular/testing";

@Component({
	template: `
    <StackLayout>
        <Label text="Label"></Label>
    </StackLayout>`
})
export class StackLayoutComponent {
	constructor(public elementRef: ElementRef) { }
}

console.log("---> test example");

describe('Describe', function () {

	console.log("---> test describe");

	describe('StackLayoutComponent', function () {

		this.beforeEach(nsTestBedBeforeEach(
			[StackLayoutComponent]
		))
		this.afterEach(nsTestBedAfterEach());

		it('Render', function () {

			return nsTestBedRender(StackLayoutComponent).then((fixture) => {
				const componentRef = fixture.componentRef;
				const componentRoot = componentRef.instance.elementRef.nativeElement;
				console.log("---> tests componentRef", componentRef);
				console.log("---> tests componentRoot", componentRoot);
			});
		});
	});
});
