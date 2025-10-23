import { Application, SplitView } from '@nativescript/core';

// Application.run({ moduleName: 'app-root' });

SplitView.SplitStyle = 'triple';
Application.run({ moduleName: 'split-view/split-view-root' });
