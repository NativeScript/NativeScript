import { Application, Trace } from '@nativescript/core';
Trace.enable();
Trace.addCategories(Trace.categories.Debug);
Application.run({ moduleName: 'app-root' });
