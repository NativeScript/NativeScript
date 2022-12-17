import { Button, EventData, Page, Switch, View, getViewById, Observable, Label, PropertyChangeData } from '@nativescript/core';

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;

	page.bindingContext = new DemoModel(page);
}

export class DemoModel extends Observable {
	private readonly manualProfiling: Switch;
	private readonly automatedProfiling: Button;
	private readonly target: Label;

	private automatedProfilingInProgress = false;

	constructor(container: View) {
		super();

		this.manualProfiling = getViewById(container, 'manual-profiling') as Switch;
		this.automatedProfiling = getViewById(container, 'automated-profiling') as Button;
		this.target = getViewById(container, 'target') as Label;
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

		const propName = 'arbitrary-prop';

		// Initialise the target property so that the first property-setting action
		// doesn't produce an outlier result due to taking a one-off code branch.
		this.target.setProperty(propName, -1);

		const onPropertyChange = () => {
			// No-op
		};

		this.target.addEventListener(Observable.propertyChangeEvent, onPropertyChange, null);

		const time = profile(() => {
			for (let i = 0; i < 1000000; i++) {
				this.target.setProperty(propName, i);
			}
		});

		this.target.removeEventListener(Observable.propertyChangeEvent, onPropertyChange, null);

		console.log(`1,000,000 runs of setProperty() took ${time} ms`);

		this.automatedProfilingInProgress = false;
		this.updateAutomatedProfilingEnabled();
	}

	private updateAutomatedProfilingEnabled(): void {
		this.automatedProfiling.isEnabled = !this.automatedProfilingInProgress && !this.manualProfiling.checked;
	}
}

function profile(action: () => void) {
	const start = global.isIOS ? (global as any).performance.now() : __time();
	action();
	const stop = global.isIOS ? (global as any).performance.now() : __time();

	return stop - start;
}
