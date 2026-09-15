import { EventData, Observable, Page, ShownModallyData } from '@nativescript/core';
import { readEdges, readWindowInsets } from './shared';

export function shownModally(args: ShownModallyData) {
	const page = <Page>args.object;
	const { fullscreen, edge } = args.context ?? { fullscreen: true, edge: 'none' };
	const model = new Observable();

	model.set('edge', edge);
	model.set('title', `${fullscreen ? 'fullscreen' : 'floating'} modal - androidOverflowEdge="${edge}"`);
	model.set('padding', 'reading...');
	model.set('windowInsets', 'reading...');
	model.set('close', () => args.closeCallback(`${fullscreen ? 'fullscreen' : 'floating'} / ${edge}\n${model.get('padding')}`));
	page.bindingContext = model;

	setTimeout(() => {
		model.set('padding', readEdges(page.getViewById('probe')).padding);
		model.set('windowInsets', readWindowInsets(page));
	}, 120);
}

export function navigatingTo(_args: EventData) {}
