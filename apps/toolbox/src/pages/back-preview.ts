import { Application, Button, Frame, Label, Page, StackLayout } from '@nativescript/core';
import type { FrameBackPreview } from '@nativescript/core';

export function createPage(): Page {
	const page = new Page();
	page.actionBar.title = 'Frame back preview prototype';
	const content = new StackLayout();
	content.padding = 24;
	const status = new Label();
	status.text = 'Push a second page, then preview or recreate the Activity.';
	status.textWrap = true;
	content.addChild(status);
	let session: FrameBackPreview;
	const button = (text: string, run: () => void) => {
		const view = new Button();
		view.text = text;
		view.on('tap', run);
		content.addChild(view);
	};
	button('Push', () => page.frame.navigate({ create: createPage }));
	button('Preview 50%', () => {
		session?.dispose();
		session = page.frame.beginBackPreview({
			onDispose: () => {
				status.text = 'Preview disposed';
			},
		});
		session?.update(0.5, 'left');
		status.text = session ? `Snapshot: ${session.snapshotBytes} bytes` : 'No supported preview';
	});
	button('Cancel', () => session?.cancel());
	button('Finish and Back', () => {
		void session?.finish().then((completed) => {
			if (completed && session.active) page.frame.goBack();
		});
	});
	button('Recreate Activity', () => {
		if (__ANDROID__) Application.android.foregroundActivity.recreate();
	});
	page.on('loaded', () => {
		if (session && !session.active) status.text = 'Recreated: old preview disposed';
	});
	page.content = content;
	return page;
}
