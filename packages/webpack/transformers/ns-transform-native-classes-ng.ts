import * as ts from 'typescript';
import { AngularCompilerPlugin } from '@ngtools/webpack';
const nsTransformNativeClasses = require('./ns-transform-native-classes');

export function nsTransformNativeClassesNg(acp: AngularCompilerPlugin) {
	return nsTransformNativeClasses.default;
}
