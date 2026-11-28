import { FlexboxLayout } from '@nativescript/core/ui/layouts/flexbox-layout';

function set(what: string) {
	return function (args) {
		const containerCss = ' #container { ' + args.object.tag + ' }';
		args.object.page.addCss(containerCss);
	};
}

export const flexDirection = set('flexDirection');
export const flexWrap = set('flexWrap');
export const justifyContent = set('justifyContent');
export const alignItems = set('alignItems');
export const alignContent = set('alignContent');

let lastSelection = null;
export function select(args) {
	if (lastSelection) {
		lastSelection.selected = 'no';
		lastSelection.notify({ eventName: 'selectedChange', object: lastSelection });
	}
	lastSelection = args.object;
	if (lastSelection) {
		lastSelection.selected = 'yes';
		lastSelection.notify({ eventName: 'selectedChange', object: lastSelection });
	}
}

const whenSelected = (handler) => (args) => lastSelection && handler(args);
const setProperty = (setter) => (value) => setter(lastSelection, value);
const intHandler =
	(handler) =>
	({ object }) =>
		handler(parseInt(object.text));
const stringHandler =
	(handler) =>
	({ object }) =>
		handler(object.text);
const booleanHandler =
	(handler) =>
	({ object }) =>
		handler(object.text === 'true');

export const order = whenSelected(intHandler(setProperty(FlexboxLayout.setOrder)));
export const flexGrow = whenSelected(intHandler(setProperty(FlexboxLayout.setFlexGrow)));
export const flexShrink = whenSelected(intHandler(setProperty(FlexboxLayout.setFlexShrink)));
export const alignSelf = whenSelected(stringHandler(setProperty(FlexboxLayout.setAlignSelf)));
export const flexWrapBefore = whenSelected(booleanHandler(setProperty(FlexboxLayout.setFlexWrapBefore)));
