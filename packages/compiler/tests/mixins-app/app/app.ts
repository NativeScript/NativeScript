import { Application } from '@nativescript/core';
import { installGlow } from './glow';
installGlow();
Application.run({ moduleName: 'app-root' });
