import base from './base';
import { IWebpackEnv } from '@nativescript/webpack';
import Config from 'webpack-chain';

// todo: add base configuration for angular
export default function (env: IWebpackEnv): Config {
	const config = base(env);

	return config;
}
