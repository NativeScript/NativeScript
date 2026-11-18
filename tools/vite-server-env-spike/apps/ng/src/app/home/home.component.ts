import { Component, NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { NativeScriptCommonModule, NativeScriptRouterModule } from '@nativescript/angular';

@Component({
	selector: 'Home',
	templateUrl: './home.component.html',
	styleUrl: './home.component.css',
	imports: [NativeScriptCommonModule, NativeScriptRouterModule],
	schemas: [NO_ERRORS_SCHEMA],
})
export class HomeComponent {
	readonly count = signal(0);

	tap() {
		this.count.update((n) => n + 1);
	}
}
