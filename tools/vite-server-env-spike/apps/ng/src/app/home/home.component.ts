import { Component, inject, NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { HmrCacheService, NativeDialog, NativeScriptCommonModule, NativeScriptRouterModule } from '@nativescript/angular';
import { InfoDialogComponent } from './info-dialog.component';

@Component({
	selector: 'Home',
	templateUrl: './home.component.html',
	styleUrl: './home.component.css',
	imports: [NativeScriptCommonModule, NativeScriptRouterModule],
	schemas: [NO_ERRORS_SCHEMA],
})
export class HomeComponent {
	private readonly cache = inject(HmrCacheService).scope('home');
	private readonly dialog = inject(NativeDialog);
	readonly count = signal(this.cache.get<number>('count') ?? 0);

	tap() {
		this.count.update((n) => n + 1);
		this.cache.set('count', this.count());
	}

	openDialog() {
		this.dialog.open(InfoDialogComponent, { data: { count: this.count() }, preserveOnHmr: true });
	}
}
