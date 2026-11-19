import { Component, inject, NO_ERRORS_SCHEMA } from '@angular/core';
import { NATIVE_DIALOG_DATA, NativeDialogRef } from '@nativescript/angular';

@Component({
	selector: 'InfoDialog',
	template: `
		<StackLayout class="p-4">
			<Label [text]="'Dialog opened at tap ' + data.count"></Label>
			<Button text="Close" (tap)="ref.close()"></Button>
		</StackLayout>
	`,
	schemas: [NO_ERRORS_SCHEMA],
})
export class InfoDialogComponent {
	readonly ref = inject(NativeDialogRef);
	readonly data = inject<{ count: number }>(NATIVE_DIALOG_DATA);
}
