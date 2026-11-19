import { Component, inject, NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NativeScriptCommonModule } from '@nativescript/angular';

@Component({
	selector: 'Details',
	template: `
		<ActionBar>
			<Label [text]="'Details ' + id"></Label>
		</ActionBar>
		<StackLayout>
			<Label [text]="'Details for item ' + id" class="title"></Label>
		</StackLayout>
	`,
	imports: [NativeScriptCommonModule],
	schemas: [NO_ERRORS_SCHEMA],
})
export class DetailsComponent {
	readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id');
}
