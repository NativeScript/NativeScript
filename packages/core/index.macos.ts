export * as ApplicationSettings from './application-settings';
export { File, FileSystemEntity, Folder, knownFolders, path, getFileAccess, AndroidDirectory } from './file-system';
export type { HttpRequestOptions, HttpResponse, Headers, HttpContent } from './http/http-interfaces';
export { HttpResponseEncoding } from './http/http-interfaces';
export * as Http from './http';
export { isAndroid, isIOS, isVisionOS, isApple, Screen, Device, platformNames } from './platform';
export type { IDevice } from './platform';
export * as Utils from './utils';
export * as Dialogs from './ui/dialogs';
