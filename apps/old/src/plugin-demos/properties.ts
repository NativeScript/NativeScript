import { Button, EventData, Page, Switch, View, getViewById, Observable, Label, PropertyChangeData } from '@nativescript/core';

class Profiler {
	private map: Record<string, number> = {};

	profile<T>(key: string, action: () => T) {
		const start = global.isIOS ? (global as any).performance.now() : __time();
		const returnValue = action();
		const stop = global.isIOS ? (global as any).performance.now() : __time();
		const period = stop - start;

		this.map[key] = (this.map[key] || 0) + period;

		// console.log(`[PROFILE] ${key}: ${stop - start} ms`);
		return returnValue;
	}

	flush() {
		const map = this.map;
		this.map = {};
		return map;
	}

	get(key: string) {
		return this.map[key];
	}

	report(map: Record<string, number> = this.map) {
		return Object.entries(map).sort(([, valueA], [, valueB]) => {
			return sortDescending(valueA, valueB);
		});
	}
}

function sortDescending(a: number, b: number): 1 | 0 | -1 {
	return a < b ? 1 : a > b ? -1 : 0;
}

const jamieProfiler = new Profiler();

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

		jamieProfiler.flush();

		console.log('BEGIN PROFILE');
		const time = profile(() => {
			for (let i = 0; i < 1000000; i++) {
				this.target.setProperty(propName, i);
			}
		});
		console.log('END PROFILE');

		console.log(
			jamieProfiler
				.report(jamieProfiler.flush())
				.map(([key, value]) => `${key}: ${value} ms`)
				.join('\n')
		);

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
