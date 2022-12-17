import { PropertyChangeData } from '@nativescript/core/data/observable';
import { Observable, Button, EventData, Page, Switch, View, getViewById, ScrollEventData, ScrollView } from '@nativescript/core';

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;

	page.bindingContext = new DemoModel(page);
}

export class DemoModel extends Observable {
	private readonly manualProfiling: Switch;
	private readonly automatedProfiling: Button;
	private readonly scrollView: ScrollView;

	private automatedProfilingInProgress = false;

	constructor(container: View) {
		super();

		this.manualProfiling = getViewById(container, 'manual-profiling') as Switch;
		this.automatedProfiling = getViewById(container, 'automated-profiling') as Button;
		this.scrollView = getViewById(container, 'scrollview') as ScrollView;

		// sanity check
		this.scrollView.once('scroll', () => console.log('ONCE scroll'));
	}

	toggleManualProfiling({ value }: PropertyChangeData): void {
		console.log(`toggleManualProfiling changed to ${value}. manualProfiling:`, this.manualProfiling);
		this.updateAutomatedProfilingEnabled();
	}

	runAutomatedProfiling(): void {
		if (this.automatedProfilingInProgress) {
			return;
		}

		console.log(`runAutomatedProfiling. automatedProfiling:`, this.automatedProfiling);
		this.automatedProfilingInProgress = true;
		this.updateAutomatedProfilingEnabled();

		this.automatedProfilingInProgress = false;
		this.updateAutomatedProfilingEnabled();
	}

	onScroll(e: ScrollEventData): void {
		console.log(`[scroll]`);
	}

	private updateAutomatedProfilingEnabled(): void {
		this.automatedProfiling.isEnabled = !this.automatedProfilingInProgress && !this.manualProfiling.checked;
	}
}
