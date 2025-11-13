import { Observable, EventData, Page, SplitView, ItemEventData } from '@nativescript/core';
import { SplitViewBrief, broadcastSelection } from './split-view-root';

let page: Page;

const briefData: SplitViewBrief[] = [
	{
		id: 'brief-morning',
		title: 'Morning Briefing',
		category: 'Operations',
		status: 'Prep',
		summary: 'Snapshot of overnight metrics and open questions for the ops pod.',
		owner: 'Taylor Brooks',
		updated: 'Updated 9:41 AM',
		accent: '#0A84FF',
		tagline: 'Send digest to the exec channel by 11:00 AM.',
		notes: 'Pull final revenue numbers, plug in the refreshed engagement chart, and make sure automation stays enabled before the noon lock.',
		actions: ['Drop the updated charts into the keynote deck.', 'Verify Siri Shortcut triggers run on the new data set.', 'Line up quick talking points for the 11:00 AM call.'],
		highlights: [
			{ label: 'Focus', value: 'Engagement + device health' },
			{ label: 'Next Check-in', value: 'Ops sync at 2:30 PM' },
		],
		metrics: [
			{ label: 'Priority', value: 'High' },
			{ label: 'Delivery', value: 'Exec brief' },
			{ label: 'Attachments', value: '4 files' },
			{ label: 'Watchers', value: '6 people' },
		],
		contributors: ['Taylor', 'Morgan', 'Priya'],
		tags: ['Ops', 'Daily', 'Exec'],
	},
	{
		id: 'brief-design',
		title: 'Audit',
		category: 'Design',
		status: 'Assets',
		summary: 'Interaction audit for the compact-to-regular transition on iPadOS.',
		owner: 'Isla Raymond',
		updated: 'Updated 8:12 AM',
		accent: '#FF9F0A',
		tagline: 'Need sign-off from Brandon before handoff.',
		notes: 'Finalize the inspector column metrics cards and verify the peek gesture targets. Attach the quick recording from TestFlight build 4120.',
		actions: ['Export motion specs for the spring animation.', 'Confirm hit targets with accessibility review.', 'Share the color tokens with web once approved.'],
		highlights: [
			{ label: 'Focus', value: 'Regular width interactions' },
			{ label: 'Blocked by', value: 'Motion review @ 3:00 PM' },
		],
		metrics: [
			{ label: 'Priority', value: 'Medium' },
			{ label: 'Delivery', value: 'Design QA' },
			{ label: 'Attachments', value: '6 files' },
			{ label: 'Watchers', value: '4 people' },
		],
		contributors: ['Isla', 'Brandon', 'Nova'],
		tags: ['Design', 'QA'],
	},
	{
		id: 'brief-field',
		title: 'Research',
		category: 'Research',
		status: 'Synthesize',
		summary: 'Notes from three in-store sessions about the new onboarding.',
		owner: 'Sam Park',
		updated: 'Updated yesterday',
		accent: '#32D74B',
		tagline: 'Clips already in the shared Photos album.',
		notes: 'Pull direct quotes for friction points around quick actions, and pair with the heat map captures for the appendix slide.',
		actions: ['Flag standout clips for the highlight reel.', 'Post the transcript summary in #research.', 'Open follow-up tasks for the onboarding squad.'],
		highlights: [
			{ label: 'Focus', value: 'Onboarding swipes' },
			{ label: 'Next Check-in', value: 'Squad sync Friday' },
		],
		metrics: [
			{ label: 'Priority', value: 'Medium' },
			{ label: 'Delivery', value: 'Research recap' },
			{ label: 'Attachments', value: '9 clips' },
			{ label: 'Watchers', value: '3 people' },
		],
		contributors: ['Sam', 'Kaia'],
		tags: ['Research', 'Clips', 'Onboarding'],
	},
	{
		id: 'brief-gallery',
		title: 'Shortcuts',
		category: 'Product',
		status: 'Ready',
		summary: 'Curated cards for the iPad productivity spotlight next week.',
		owner: 'Luca Nguyen',
		updated: 'Updated Monday',
		accent: '#BF5AF2',
		tagline: 'Publishing window opens Thursday morning.',
		notes: 'Verify icon treatments render crisply on mini + 12.9 screens, and double-check localized copy for DE/JA.',
		actions: ['Ping localization for the remaining strings.', 'Preview the curated set on device.', 'Coordinate push copy with marketing.'],
		highlights: [
			{ label: 'Focus', value: 'Automation + Productivity' },
			{ label: 'Blocked by', value: 'Awaiting DE copy' },
		],
		metrics: [
			{ label: 'Priority', value: 'High' },
			{ label: 'Delivery', value: 'App Store' },
			{ label: 'Attachments', value: '12 shortcuts' },
			{ label: 'Watchers', value: '5 people' },
		],
		contributors: ['Luca', 'Amelia', 'Jo'],
		tags: ['Launch', 'Localization'],
	},
	{
		id: 'brief-incident',
		title: 'Incident Review',
		category: 'Engineering',
		status: 'Investigate',
		summary: "Postmortem on last night's crash spike affecting iPad split mode.",
		owner: 'Jordan Lee',
		updated: 'Updated 10 minutes ago',
		accent: '#FF453A',
		tagline: 'Root cause draft due by end of day.',
		notes: 'Correlate analytics events with OS version and displayMode usage. Reproduce with toolbox sample and capture sysdiagnose on iOS 17.5. Prepare a rollback plan for the converter change if needed.',
		actions: ['Add unit coverage around displayMode parsing for legacy values.', 'Record steps to reproduce on iPad mini + Stage Manager.', 'Compile candidate patch and run smoke on device farm.'],
		highlights: [
			{ label: 'Focus', value: 'Stability + Parsing' },
			{ label: 'Next Check-in', value: 'Eng sync at 4:00 PM' },
		],
		metrics: [
			{ label: 'Priority', value: 'Critical' },
			{ label: 'Delivery', value: 'Postmortem' },
			{ label: 'Attachments', value: '3 logs' },
			{ label: 'Watchers', value: '8 people' },
		],
		contributors: ['Jordan', 'Avery', 'Mina'],
		tags: ['Stability', 'iOS', 'SplitView'],
	},
];

export function navigatingTo(args: EventData) {
	page = <Page>args.object;
	page.bindingContext = new SplitViewPrimaryModel();
}

export class SplitViewPrimaryModel extends Observable {
	briefs: SplitViewBrief[] = briefData;

	constructor() {
		super();
		broadcastSelection(this.briefs[0]);
	}

	onItemTap(args: ItemEventData) {
		const selectedBrief = this.briefs[args.index];
		SplitView.getInstance()?.showSecondary();
		broadcastSelection(selectedBrief);
	}
}
