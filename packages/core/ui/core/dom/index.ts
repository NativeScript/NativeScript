export { HTMLLabelElement } from './src/nodes/html-label-element/HTMLLabelELement';
import GlobalWindow from './src/window/Window';

export const Window = GlobalWindow;
new Window().bindToGlobal();
