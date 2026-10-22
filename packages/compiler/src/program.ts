import ts from 'typescript';
import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { foldPlatform, type Platform } from './platform.ts';
import { desugarConstructorFactories } from './constructor-factories.ts';
import { KIT_PLUGINS, NATIVE_CONTROLLERS, NATIVE_VIEWS, STUBBED_PLUGINS, nativeViewOf } from './core.ts';
import type { PluginSources } from './plugins/source.ts';
import { packageOf, runtimeFile } from './plugins/resolve.ts';
import { NATIVE_VIEWS_ANDROID } from './core-kotlin.ts';

const ANGULAR_RX_FILE = resolve(dirname(fileURLToPath(import.meta.url)), '../runtime/angular-rx.ts');
const PLUGIN_STUBS_FILE = resolve(dirname(fileURLToPath(import.meta.url)), '../runtime/binary-plugin-stubs.ts');
const ANGULAR_RX_MODULES = new Set(['@angular/common/http', '@angular/core/rxjs-interop', '@angular/router', '@nativescript/angular', '@angular#rx']);

/**
 * The release build's view of the framework APIs an app imports. Only their
 * types matter here: the translator recognizes the calls (`ref`, `signal`,
 * `createSignal`, `$state`, `$navigateTo`) and emits Swift for them.
 */
const SHIMS: Record<string, string> = {
  '@nativescript/release': `
    export interface Sig<T> { value: T }
    export declare function $signal<T>(value: T): Sig<T>;
    /** Vue's ref: deeply reactive, so arrays and objects it holds notify on mutation. */
    export interface VueRef<T> { value: T }
    export declare function $ref<T>(value: T): VueRef<T>;
    import type { ItemEventData, PanGestureEventData, PinchGestureEventData, RotationGestureEventData, SwipeGestureEventData, TouchGestureEventData, Pointer as CorePointer } from '@nativescript/core';
    /** A template handler's \$event: whichever of core's event types the handler declares. */
    export type EventData = ItemEventData & PanGestureEventData & PinchGestureEventData & RotationGestureEventData & SwipeGestureEventData & TouchGestureEventData & { value: any; item: any };
    export type Pointer = CorePointer;
    export declare function $navigate(page: () => any): void;
    export interface WritableSignal<T> { (): T; set(value: T): void; update(fn: (value: T) => T): void; $write(value: T | ((previous: T) => T)): void }
    export declare function $writable<T>(value: T): WritableSignal<T>;
    /** Component state its handlers read as of the last commit: React's and Octane's \`useState\`, Solid's signals. */
    export declare function $state<T>(signal: WritableSignal<T>): WritableSignal<T>;
    export declare function $navigateTo(component: any, options?: { props?: Record<string, any> }): void;
    import type { Observable } from 'rxjs';
    /** Angular's async pipe at one binding site. */
    export declare class AsyncPipe { transform<T>(observable: Observable<T> | null | undefined): T | null }
    export declare class RxSubscription { readonly closed: boolean; unsubscribe(): void }
    export declare class RxObservable<T> {
      subscribe(next: (value: T) => void, error?: (err: any) => void, complete?: () => void): RxSubscription;
      mapValues<R>(transform: (value: T) => R): RxObservable<R>;
    }
    export declare class RxSubject<T> extends RxObservable<T> { next(value: T): void; asObservable(): RxObservable<T> }
    export declare class RxBehaviorSubject<T> extends RxSubject<T> { readonly value: T; getValue(): T }
    export declare class NavigationStart { readonly id: number; readonly url: string; readonly navigationTrigger?: string; readonly restoredState?: any; constructor(id: number, url: string) }
    export declare class NavigationEnd { readonly id: number; readonly url: string; readonly urlAfterRedirects: string; constructor(id: number, url: string, urlAfterRedirects?: string) }
    export declare class NavigationCancel { readonly id: number; readonly url: string; readonly reason: string; constructor(id: number, url: string, reason?: string) }
    export declare class NavigationError { readonly id: number; readonly url: string; readonly error: any; constructor(id: number, url: string, error?: any) }
    export declare class RoutesRecognized { readonly id: number; readonly url: string; readonly urlAfterRedirects: string; readonly state: any; constructor(id: number, url: string, urlAfterRedirects?: string, state?: any) }
    export declare class ResolveStart { readonly id: number; readonly url: string; readonly urlAfterRedirects: string; readonly state: any; constructor(id: number, url: string, urlAfterRedirects?: string, state?: any) }
    export declare class ResolveEnd { readonly id: number; readonly url: string; readonly urlAfterRedirects: string; readonly state: any; constructor(id: number, url: string, urlAfterRedirects?: string, state?: any) }
    export declare class ParamMap { constructor(params?: any); has(name: string): boolean; get(name: string): string | null; getAll(name: string): string[]; readonly keys: string[] }
    export declare function convertToParamMap(params: Record<string, any>): ParamMap;
    export declare class UrlSegment { readonly path: string; readonly parameters: Record<string, string>; readonly parameterMap: ParamMap; constructor(path: string, parameters?: Record<string, string>); toString(): string }
    export declare class UrlTree { queryParams: Record<string, any>; fragment: string | null; readonly queryParamMap: ParamMap; constructor(path?: string, queryParams?: Record<string, any>, fragment?: string | null); toString(): string }
    export declare class DefaultUrlSerializer { parse(url: string): UrlTree; serialize(tree: UrlTree): string }
    export declare class ActivatedRouteSnapshot {
      readonly params: Record<string, string>;
      readonly queryParams: Record<string, string>;
      readonly data: Record<string, any>;
      readonly url: UrlSegment[];
      readonly fragment: string | null;
      readonly outlet: string;
      readonly routeConfig: any;
      title?: string;
      readonly paramMap: ParamMap;
      readonly queryParamMap: ParamMap;
      readonly root: ActivatedRouteSnapshot;
      readonly parent: ActivatedRouteSnapshot | null;
      readonly firstChild: ActivatedRouteSnapshot | null;
      readonly children: ActivatedRouteSnapshot[];
      readonly pathFromRoot: ActivatedRouteSnapshot[];
    }
    export declare function createRouterStateSnapshot(url?: string): any;
    export declare class HttpHeaders {
      constructor(headers?: string | Record<string, string | number | (string | number)[]>);
      has(name: string): boolean;
      get(name: string): string | null;
      keys(): string[];
      getAll(name: string): string[] | null;
      append(name: string, value: string | string[]): HttpHeaders;
      set(name: string, value: string | string[]): HttpHeaders;
      delete(name: string, value?: string | string[]): HttpHeaders;
    }
    export declare class HttpParams {
      constructor(options?: { fromString?: string; fromObject?: Record<string, any> } | Record<string, any>);
      has(param: string): boolean;
      get(param: string): string | null;
      getAll(param: string): string[] | null;
      keys(): string[];
      append(param: string, value: string | number | boolean): HttpParams;
      appendAll(params: Record<string, any>): HttpParams;
      set(param: string, value: string | number | boolean): HttpParams;
      delete(param: string, value?: string | number | boolean): HttpParams;
      toString(): string;
    }
    export declare class HttpContextToken<T = any> { readonly defaultValue: () => any; constructor(defaultValue: () => T) }
    export declare class HttpContext {
      set<T>(token: HttpContextToken<T>, value: T): HttpContext;
      get(token: HttpContextToken<any>): any;
      delete(token: HttpContextToken<any>): HttpContext;
      has(token: HttpContextToken<any>): boolean;
    }
    export declare class HttpResponse<T = any> {
      readonly body: any;
      readonly headers: HttpHeaders;
      readonly status: number;
      readonly statusText: string;
      readonly url: string | null;
      readonly ok: boolean;
      readonly type: number;
      constructor(init?: { body?: T | null; headers?: HttpHeaders; status?: number; statusText?: string; url?: string });
      clone(update?: any): HttpResponse<any>;
    }
    export declare class HttpErrorResponse extends Error {
      readonly error: any;
      readonly headers: HttpHeaders;
      readonly status: number;
      readonly statusText: string;
      readonly url: string | null;
      readonly ok: boolean;
      constructor(init?: { error?: any; headers?: HttpHeaders; status?: number; statusText?: string; url?: string });
    }
    export declare class HttpRequest<T = any> {
      readonly method: string;
      readonly url: string;
      readonly body: any;
      readonly headers: HttpHeaders;
      readonly params: HttpParams;
      readonly context: HttpContext;
      readonly responseType: 'arraybuffer' | 'blob' | 'json' | 'text';
      readonly withCredentials: boolean;
      readonly reportProgress: boolean;
      readonly urlWithParams: string;
      constructor(method: string, url: string, third?: any, fourth?: any);
      clone(update?: any): HttpRequest<any>;
    }
    export declare const HTTP_INTERCEPTORS: import('@angular/core').InjectionToken<any[]>;
    export declare enum HttpStatusCode {
      Continue = 100,
      SwitchingProtocols = 101,
      Processing = 102,
      EarlyHints = 103,
      Ok = 200,
      Created = 201,
      Accepted = 202,
      NonAuthoritativeInformation = 203,
      NoContent = 204,
      ResetContent = 205,
      PartialContent = 206,
      MultiStatus = 207,
      AlreadyReported = 208,
      ImUsed = 226,
      MultipleChoices = 300,
      MovedPermanently = 301,
      Found = 302,
      SeeOther = 303,
      NotModified = 304,
      UseProxy = 305,
      Unused = 306,
      TemporaryRedirect = 307,
      PermanentRedirect = 308,
      BadRequest = 400,
      Unauthorized = 401,
      PaymentRequired = 402,
      Forbidden = 403,
      NotFound = 404,
      MethodNotAllowed = 405,
      NotAcceptable = 406,
      ProxyAuthenticationRequired = 407,
      RequestTimeout = 408,
      Conflict = 409,
      Gone = 410,
      LengthRequired = 411,
      PreconditionFailed = 412,
      PayloadTooLarge = 413,
      UriTooLong = 414,
      UnsupportedMediaType = 415,
      RangeNotSatisfiable = 416,
      ExpectationFailed = 417,
      ImATeapot = 418,
      MisdirectedRequest = 421,
      UnprocessableEntity = 422,
      Locked = 423,
      FailedDependency = 424,
      TooEarly = 425,
      UpgradeRequired = 426,
      PreconditionRequired = 428,
      TooManyRequests = 429,
      RequestHeaderFieldsTooLarge = 431,
      UnavailableForLegalReasons = 451,
      InternalServerError = 500,
      NotImplemented = 501,
      BadGateway = 502,
      ServiceUnavailable = 503,
      GatewayTimeout = 504,
      HttpVersionNotSupported = 505,
      VariantAlsoNegotiates = 506,
      InsufficientStorage = 507,
      LoopDetected = 508,
      NotExtended = 510,
      NetworkAuthenticationRequired = 511,
    }
    export declare function withInterceptors(fns: any[]): any;
    export declare function withInterceptorsFromDi(): any;
    export declare function withFetch(): any;
    export declare function provideHttpClient(...features: any[]): any;
    export declare function provideNativeScriptHttpClient(...features: any[]): any;
    export declare function provideNativeScriptNgZone(): any;
    export declare function provideRouter(routes: any, ...features: any[]): any;
    export declare function provideNativeScriptRouter(routes: any, ...features: any[]): any;
    export declare class HttpClientModule { static forRoot(): any }
    export declare function bootstrapApplication(component: any, options?: any): Promise<any>;
    export declare function runNativeScriptAngularApp(options: any): void;
    export declare class KitHttpClient {
      static readonly shared: KitHttpClient;
      request(first: any, url?: string, options?: any): RxObservable<any>;
      get(url: string, options?: any): RxObservable<any>;
      delete(url: string, options?: any): RxObservable<any>;
      head(url: string, options?: any): RxObservable<any>;
      options(url: string, options?: any): RxObservable<any>;
      post(url: string, body?: any, options?: any): RxObservable<any>;
      put(url: string, body?: any, options?: any): RxObservable<any>;
      patch(url: string, body?: any, options?: any): RxObservable<any>;
      jsonp(url: string, callbackParam: string): RxObservable<any>;
    }
    export declare class KitActivatedRoute {
      static current: KitActivatedRoute;
      readonly snapshot: ActivatedRouteSnapshot;
      readonly params: RxBehaviorSubject<Record<string, string>>;
      readonly queryParams: RxBehaviorSubject<Record<string, string>>;
      readonly data: RxBehaviorSubject<Record<string, any>>;
      readonly paramMap: RxBehaviorSubject<ParamMap>;
      readonly queryParamMap: RxBehaviorSubject<ParamMap>;
      readonly fragment: RxBehaviorSubject<string | null>;
      readonly title: RxBehaviorSubject<string | undefined>;
      readonly outlet: string;
      readonly routeConfig: any;
    }
    export declare class KitRouter {
      static readonly shared: KitRouter;
      readonly url: string;
      readonly routerState: any;
      readonly events: RxSubject<NavigationEnd>;
      createUrlTree(commands: any[], extras?: any): UrlTree;
      serializeUrl(url: any): string;
      parseUrl(url: string): UrlTree;
      isActive(url: any, exact?: any): boolean;
      navigate(commands: any[], extras?: any): Promise<boolean>;
      navigateByUrl(url: any, extras?: any): Promise<boolean>;
      back(options?: any): void;
      backToPreviousPage(): void;
      canGoBack(options?: any): boolean;
      canGoBackToPreviousPage(): boolean;
    }
    export declare class KitNativeDialogRef { static readonly current: KitNativeDialogRef; readonly data: any; close(result?: any): void; afterClosed(): RxObservable<any> }
    export declare class KitNativeDialogService { static readonly shared: KitNativeDialogService; open(component: any, config?: any): KitNativeDialogRef }
    /** A pure Angular pipe at one binding site: \`transform\` runs when an argument is no longer \`Object.is\` the last one. */
    export declare class PurePipeCache {
      pure1<A, R>(a: A, transform: (a: A) => R): R;
      pure2<A, B, R>(a: A, b: B, transform: (a: A, b: B) => R): R;
      pure3<A, B, C, R>(a: A, b: B, c: C, transform: (a: A, b: B, c: C) => R): R;
      pure4<A, B, C, D, R>(a: A, b: B, c: C, d: D, transform: (a: A, b: B, c: C, d: D) => R): R;
      pure5<A, B, C, D, E, R>(a: A, b: B, c: C, d: D, e: E, transform: (a: A, b: B, c: C, d: D, e: E) => R): R;
    }
  `,
  '@angular/common': `
    export declare class Location {
      path(includeHash?: boolean): string;
      go(path: string, query?: string, state?: any): void;
      replaceState(path: string, query?: string, state?: any): void;
      back(): void;
      forward(): void;
      static joinWithSlash(start: string, end: string): string;
      static stripTrailingSlash(url: string): string;
    }
    export declare function isPlatformBrowser(platformId: Object): boolean;
    export declare function isPlatformServer(platformId: Object): boolean;
    export declare const DOCUMENT: import('@angular/core').InjectionToken<any>;
    export declare const CommonModule: any;
    export declare const NgIf: any;
    export declare const NgFor: any;
    export declare const NgForOf: any;
    export declare const NgClass: any;
    export declare const NgStyle: any;
    export declare const NgSwitch: any;
    export declare const NgSwitchCase: any;
    export declare const NgSwitchDefault: any;
    export declare const NgTemplateOutlet: any;
    export declare const AsyncPipe: any;
    export declare const DatePipe: any;
    export declare const DecimalPipe: any;
    export declare const PercentPipe: any;
    export declare const CurrencyPipe: any;
    export declare const UpperCasePipe: any;
    export declare const LowerCasePipe: any;
    export declare const TitleCasePipe: any;
    export declare const SlicePipe: any;
    export declare const JsonPipe: any;
    export declare const KeyValuePipe: any;
  `,
  '@angular/common/http': `
    import type { Observable } from 'rxjs';
    import {
      HttpHeaders,
      HttpParams,
      HttpContextToken,
      HttpContext,
      HttpResponse,
      HttpErrorResponse,
      HttpRequest,
      HTTP_INTERCEPTORS,
      HttpStatusCode,
      withInterceptors,
      withInterceptorsFromDi,
      withFetch,
      provideHttpClient,
      HttpClientModule,
    } from '@nativescript/release';
    export {
      HttpHeaders,
      HttpParams,
      HttpContextToken,
      HttpContext,
      HttpResponse,
      HttpErrorResponse,
      HttpRequest,
      HTTP_INTERCEPTORS,
      HttpStatusCode,
      withInterceptors,
      withInterceptorsFromDi,
      withFetch,
      provideHttpClient,
      HttpClientModule,
    };
    export interface HttpHandler { handle(req: HttpRequest<any>): Observable<any> }
    export interface HttpInterceptor { intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> }
    export type HttpInterceptorFn = (req: HttpRequest<any>, next: (req: HttpRequest<any>) => Observable<any>) => Observable<any>;
    export type HttpEvent<T = any> = HttpResponse<T>;
    export declare class HttpClient {
      request<T = any>(first: string | HttpRequest<any>, url?: string, options?: any): Observable<T>;
      get<T = any>(url: string, options?: { headers?: Record<string, string> | HttpHeaders; params?: Record<string, any> | HttpParams; responseType?: 'json'; observe?: any; context?: HttpContext }): Observable<T>;
      get(url: string, options: { headers?: Record<string, string> | HttpHeaders; params?: Record<string, any> | HttpParams; responseType: 'text'; observe?: any; context?: HttpContext }): Observable<string>;
      delete<T = any>(url: string, options?: any): Observable<T>;
      head<T = any>(url: string, options?: any): Observable<T>;
      options<T = any>(url: string, options?: any): Observable<T>;
      post<T = any>(url: string, body: any, options?: any): Observable<T>;
      put<T = any>(url: string, body: any, options?: any): Observable<T>;
      patch<T = any>(url: string, body: any, options?: any): Observable<T>;
      jsonp<T = any>(url: string, callbackParam: string): Observable<T>;
    }
  `,
  '@angular/core': `
    import { RxSubscription } from '@nativescript/release';
    export type ValueEqualityFn<T> = (a: T, b: T) => boolean;
    export interface CreateComputedOptions<T> { equal?: ValueEqualityFn<T> }
    export interface CreateSignalOptions<T> { equal?: ValueEqualityFn<T> }
    export interface WritableSignal<T> { (): T; set(value: T): void; update(fn: (value: T) => T): void; asReadonly(): Signal<T> }
    export interface Signal<T> { (): T }
    /** \`$assign\`: a decorated input the component writes itself (\`this.x = v\`), until its parent's binding changes. */
    export interface InputSignal<T> { (): T; $assign(value: T): void }
    export interface ModelSignal<T> extends WritableSignal<T> { $assign(value: T): void; subscribe(fn: (value: T) => void): RxSubscription }
    export interface OutputEmitterRef<T> { emit(value: T): void; subscribe(fn: (value: T) => void): RxSubscription }
    export interface OutputRef<T> { subscribe(fn: (value: T) => void): RxSubscription }
    export declare function signal<T>(value: T, options?: CreateSignalOptions<T>): WritableSignal<T>;
    export declare function computed<T>(fn: () => T, options?: CreateComputedOptions<T>): Signal<T>;
    export declare function linkedSignal<T>(fn: () => T, options?: CreateComputedOptions<T>): WritableSignal<T>;
    export declare function isSignal(value: unknown): value is Signal<unknown>;
    export declare function isDevMode(): boolean;
    export declare function enableProdMode(): void;
    export type Provider = any;
    export type EnvironmentProviders = any;
    export interface ModuleWithProviders<T = any> { ngModule: any; providers?: any[] }
    export type Type<T = any> = any;
    export declare function makeEnvironmentProviders(providers: any[]): EnvironmentProviders;
    export declare function provideEnvironmentInitializer(fn: () => void): EnvironmentProviders;
    export declare function provideAppInitializer(fn: () => any): EnvironmentProviders;
    export declare function importProvidersFrom(...modules: any[]): EnvironmentProviders;
    export declare class ErrorHandler { handleError(error: any): void }
    export declare function input<T>(value: T, options?: any): InputSignal<T>;
    export declare function input<T>(): InputSignal<T | undefined>;
    export declare namespace input { function required<T>(options?: any): InputSignal<T>; }
    export declare function model<T>(value: T, options?: any): ModelSignal<T>;
    export declare function model<T>(): ModelSignal<T | undefined>;
    export declare namespace model { function required<T>(options?: any): ModelSignal<T>; }
    export declare function output<T = void>(options?: any): OutputEmitterRef<T>;
    export declare class InjectionToken<T = any> { readonly _desc: string; readonly _type?: T; constructor(description: string, options?: { providedIn?: 'root' | 'platform' | 'any' | null; factory: () => T }) }
    export declare function inject<T>(token: InjectionToken<T>): T;
    export declare function inject<T>(token: { prototype: T }): T;
    export declare function inject<T>(token: InjectionToken<T>, options: { optional: true; self?: boolean; skipSelf?: boolean; host?: boolean }): T | null;
    export declare function inject<T>(token: { prototype: T }, options: { optional: true; self?: boolean; skipSelf?: boolean; host?: boolean }): T | null;
    export declare function inject<T>(token: InjectionToken<T>, options?: any): T;
    export declare function inject<T>(token: { prototype: T }, options?: any): T;
    export declare function inject<T = any>(token: any, options?: any): T;
    export declare function runInInjectionContext<ReturnT>(injector: Injector, fn: () => ReturnT): ReturnT;
    export declare function forwardRef(forwardRefFn: () => any): any;
    export declare function resolveForwardRef<T>(type: T): T;
    export declare function Component(meta: any): <C>(c: C) => C;
    export declare function Injectable(meta?: any): <C>(c: C) => C;
    export declare const NO_ERRORS_SCHEMA: any;
    export declare const CUSTOM_ELEMENTS_SCHEMA: any;
    export declare function NgModule(meta: any): <C>(c: C) => C;
    export declare function Input(options?: any): any;
    export declare function Output(options?: any): any;
    export declare class EventEmitter<T = any> {
      constructor(isAsync?: boolean);
      emit(value?: T): void;
      next(value?: T): void;
      subscribe(next?: ((value: T) => void) | null, error?: ((error: any) => void) | null, complete?: (() => void) | null): RxSubscription;
      subscribe(observer?: { next?: (value: T) => void; error?: (e: any) => void; complete?: () => void } | null): RxSubscription;
    }
    export declare enum ChangeDetectionStrategy { OnPush = 0, Eager = 1, Default = 1 }
    export declare enum ViewEncapsulation { Emulated = 0, None = 2, ShadowDom = 3, ExperimentalIsolatedShadowDom = 4 }
    export declare function provideZoneChangeDetection(options?: any): any;
    export declare function provideZonelessChangeDetection(): any;
    export interface EffectRef { destroy(): void }
    export declare function effect(fn: (onCleanup: (cleanup: () => void) => void) => void, options?: any): EffectRef;
    export declare function untracked<T>(fn: () => T): T;
    export declare class Injector {
      static create(options: { providers: any[]; parent?: Injector; name?: string } | any[], parent?: Injector): Injector;
      get<T>(token: InjectionToken<T>, notFoundValue?: T, options?: any): T;
      get<T>(token: { prototype: T }, notFoundValue?: T, options?: any): T;
      get<T = any>(token: any, notFoundValue?: T, options?: any): T;
    }
    export declare class EnvironmentInjector extends Injector {}
    export declare function ViewChild(selector: any, options?: any): any;
    export declare function ViewChildren(selector: any, options?: any): any;
    export declare function ContentChild(selector: any, options?: any): any;
    export declare function ContentChildren(selector: any, options?: any): any;
    export declare function viewChild<T = any>(locator: any, options?: any): Signal<T | undefined>;
    export declare namespace viewChild { function required<T = any>(locator: any, options?: any): Signal<T>; }
    export declare function viewChildren<T = any>(locator: any, options?: any): Signal<readonly T[]>;
    export declare function contentChild<T = any>(locator: any, options?: any): Signal<T | undefined>;
    export declare namespace contentChild { function required<T = any>(locator: any, options?: any): Signal<T>; }
    export declare function contentChildren<T = any>(locator: any, options?: any): Signal<readonly T[]>;
    export declare function Pipe(meta: { name: string; pure?: boolean; standalone?: boolean }): <C>(c: C) => C;
    export interface PipeTransform { transform(value: any, ...args: any[]): any }
    export declare function Directive(meta?: any): <C>(c: C) => C;
    export declare function HostListener(event: string, args?: string[]): any;
    export declare function HostBinding(property?: string): any;
    export declare const Inject: { (token: any): any; new (token: any): any };
    export declare const Optional: { (): any; new (): any };
    export declare const Self: { (): any; new (): any };
    export declare const SkipSelf: { (): any; new (): any };
    export declare const Host: { (): any; new (): any };
    export declare const PLATFORM_ID: InjectionToken<Object>;
    export declare const APP_INITIALIZER: InjectionToken<readonly (() => any)[]>;
    export declare const ENVIRONMENT_INITIALIZER: InjectionToken<readonly (() => void)[]>;
    export declare abstract class ChangeDetectorRef { markForCheck(): void; detectChanges(): void; detach(): void; reattach(): void; checkNoChanges(): void }
    /** A template's view: what a native element is to Angular, read untyped (its type argument is the app's claim). */
    export declare class ElementRef<T = any> { constructor(nativeElement?: any); readonly nativeElement: any }
    export declare class TemplateRef<C = any> { readonly elementRef: ElementRef; constructor(elementRef?: ElementRef) }
    export declare class EmbeddedViewRef<C = any> { context: C; readonly rootNodes: any[]; readonly destroyed: boolean; destroy(): void; detectChanges(): void; markForCheck(): void }
    export declare class ComponentRef<C = any> { readonly instance: C; readonly location: ElementRef; readonly injector: Injector; readonly hostView: EmbeddedViewRef<C>; setInput(name: string, value: unknown): void; destroy(): void }
    export declare class ViewContainerRef {
      readonly element: ElementRef;
      readonly injector: Injector;
      readonly length: number;
      clear(): void;
      createEmbeddedView<C = any>(templateRef: TemplateRef<C>, context?: C, options?: any): EmbeddedViewRef<C>;
      createComponent<C = any>(componentType: Type<C>, options?: any): ComponentRef<C>;
      remove(index?: number): void;
    }
    export declare class ApplicationRef { readonly isStable: any; tick(): void; destroy(): void }
    export declare class SimpleChange { constructor(previousValue: any, currentValue: any, firstChange: boolean); previousValue: any; currentValue: any; firstChange: boolean; isFirstChange(): boolean }
    export type SimpleChanges<T = any> = { [propName: string]: SimpleChange };
    export interface OnChanges { ngOnChanges(changes: SimpleChanges): void }
    export declare class QueryList<T> {
      readonly length: number;
      readonly first: T;
      readonly last: T;
      readonly dirty: boolean;
      toArray(): T[];
      get(index: number): T | undefined;
      forEach(fn: (item: T, index: number, array: T[]) => void): void;
      map<U>(fn: (item: T, index: number, array: T[]) => U): U[];
      filter(fn: (item: T, index: number, array: T[]) => boolean): T[];
      find(fn: (item: T, index: number, array: T[]) => boolean): T | undefined;
      some(fn: (item: T, index: number, array: T[]) => boolean): boolean;
      notifyOnChanges(): void;
      readonly changes: { subscribe(observerOrNext?: ((value: QueryList<T>) => void) | { next?: (value: QueryList<T>) => void; error?: (e: any) => void; complete?: () => void } | null): { unsubscribe(): void } };
    }
    export declare class DestroyRef { onDestroy(callback: () => void): () => void }
    export declare class NgZone {
      static isInAngularZone(): boolean;
      readonly onStable: EventEmitter<any>;
      readonly onMicrotaskEmpty: EventEmitter<any>;
      readonly onUnstable: EventEmitter<any>;
      readonly onError: EventEmitter<any>;
      readonly isStable: boolean;
      run<T>(fn: () => T): T;
      runOutsideAngular<T>(fn: () => T): T;
      runGuarded<T>(fn: () => T): T;
      runTask<T>(fn: () => T): T;
    }
    export interface OnDestroy { ngOnDestroy(): void }
    export interface OnInit { ngOnInit(): void }
    export interface AfterViewInit { ngAfterViewInit(): void }
    export interface AfterContentInit { ngAfterContentInit(): void }
    export interface AfterViewChecked { ngAfterViewChecked(): void }
    export interface AfterContentChecked { ngAfterContentChecked(): void }
    export interface DoCheck { ngDoCheck(): void }
  `,
  '@angular/core/rxjs-interop': `
    import type { Observable, OperatorFunction } from 'rxjs';
    import type { Signal, DestroyRef } from '@angular/core';
    export declare function toSignal<T>(source: Observable<T>, options: { initialValue: T; injector?: any; requireSync?: boolean; manualCleanup?: boolean; equal?: any }): Signal<T>;
    export declare function toSignal<T>(source: Observable<T>, options: { requireSync: true; injector?: any; manualCleanup?: boolean; equal?: any }): Signal<T>;
    export declare function toSignal<T>(source: Observable<T>, options?: { injector?: any; requireSync?: boolean; manualCleanup?: boolean; equal?: any }): Signal<T | undefined>;
    export declare function toObservable<T>(source: Signal<T>, options?: { injector?: any }): Observable<T>;
    export declare function takeUntilDestroyed<T>(destroyRef?: DestroyRef): OperatorFunction<T, T>;
  `,
  '@angular/router': `
    import type { Observable } from 'rxjs';
    import {
      ActivatedRouteSnapshot,
      convertToParamMap,
      createRouterStateSnapshot,
      DefaultUrlSerializer,
      NavigationCancel,
      NavigationEnd,
      NavigationError,
      NavigationStart,
      ParamMap,
      provideRouter,
      ResolveEnd,
      ResolveStart,
      RoutesRecognized,
      UrlSegment,
      UrlTree,
    } from '@nativescript/release';
    export {
      ActivatedRouteSnapshot,
      convertToParamMap,
      createRouterStateSnapshot,
      DefaultUrlSerializer,
      NavigationCancel,
      NavigationEnd,
      NavigationError,
      NavigationStart,
      ParamMap,
      provideRouter,
      ResolveEnd,
      ResolveStart,
      RoutesRecognized,
      UrlSegment,
      UrlTree,
    };
    export declare class ActivatedRoute {
      snapshot: ActivatedRouteSnapshot;
      params: Observable<Record<string, string>>;
      queryParams: Observable<Record<string, string>>;
      data: Observable<Record<string, any>>;
      paramMap: Observable<ParamMap>;
      queryParamMap: Observable<ParamMap>;
      fragment: Observable<string | null>;
      title: Observable<string | undefined>;
      outlet: string;
      routeConfig: any;
      readonly root: ActivatedRoute;
      readonly parent: ActivatedRoute | null;
      readonly firstChild: ActivatedRoute | null;
      readonly children: ActivatedRoute[];
      readonly pathFromRoot: ActivatedRoute[];
    }
    export type Event = NavigationEnd | NavigationStart | NavigationCancel | NavigationError | RoutesRecognized | ResolveStart | ResolveEnd;
    export type NavigationExtras = any;
    export declare class Router {
      readonly url: string;
      readonly routerState: any;
      readonly events: Observable<Event>;
      createUrlTree(commands: any[], extras?: NavigationExtras): UrlTree;
      serializeUrl(url: UrlTree): string;
      parseUrl(url: string): UrlTree;
      isActive(url: string | UrlTree, exact?: any): boolean;
      navigate(commands: any[], extras?: NavigationExtras): Promise<boolean>;
      navigateByUrl(url: string | UrlTree, extras?: NavigationExtras): Promise<boolean>;
    }
    export type Routes = {
      path?: string;
      component?: any;
      redirectTo?: string;
      pathMatch?: string;
      outlet?: string;
      data?: Record<string, any>;
      canActivate?: any[];
      canActivateChild?: any[];
      canDeactivate?: any[];
      canMatch?: any[];
      resolve?: Record<string, any>;
      providers?: any[];
      children?: Routes;
      loadChildren?: () => any;
      loadComponent?: () => any;
      title?: any;
    }[];
    export type Route = Routes[number];
    export type Params = { [key: string]: any };
    export interface IsActiveMatchOptions { matrixParams: 'exact' | 'subset' | 'ignored'; queryParams: 'exact' | 'subset' | 'ignored'; paths: 'exact' | 'subset'; fragment: 'exact' | 'ignored' }
    export interface CanActivate { canActivate(route: ActivatedRouteSnapshot, state: any): any }
    export declare const RouterModule: { forRoot(routes: Routes, config?: any): any; forChild(routes: Routes): any };
    export declare function provideRouter(routes?: any, ...features: any[]): any;
    export declare const RouterOutlet: any;
    export declare const RouterLink: any;
    export declare const RouterLinkActive: any;
  `,
  '@angular/forms': `
    import type { EventEmitter } from '@angular/core';
    export type ValidationErrors = any;
    export type ValidatorFn = (control: any) => any;
    export type AsyncValidatorFn = (control: any) => any;
    export type FormControlStatus = 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED';
    export interface ControlValueAccessor {
      writeValue(obj: any): void;
      registerOnChange(fn: any): void;
      registerOnTouched(fn: any): void;
      setDisabledState?(isDisabled: boolean): void;
    }
    export declare const NG_VALUE_ACCESSOR: import('@angular/core').InjectionToken<readonly ControlValueAccessor[]>;
    export declare const NG_VALIDATORS: import('@angular/core').InjectionToken<readonly any[]>;
    export declare class Validators {
      static required(control: any): any;
      static requiredTrue(control: any): any;
      static minLength(minLength: number): ValidatorFn;
      static maxLength(maxLength: number): ValidatorFn;
      static min(min: number): ValidatorFn;
      static max(max: number): ValidatorFn;
      static pattern(pattern: string | RegExp): ValidatorFn;
      static email(control: any): any;
      static nullValidator(control: any): any;
      static compose(validators: (ValidatorFn | null | undefined)[] | null): ValidatorFn | null;
    }
    export declare class AbstractControl<TValue = any, TRawValue extends TValue = TValue> {
      value: any;
      readonly errors: ValidationErrors | null;
      readonly pristine: boolean;
      readonly dirty: boolean;
      readonly touched: boolean;
      readonly untouched: boolean;
      readonly status: FormControlStatus;
      readonly valid: boolean;
      readonly invalid: boolean;
      readonly disabled: boolean;
      readonly enabled: boolean;
      readonly valueChanges: EventEmitter<any>;
      readonly statusChanges: EventEmitter<FormControlStatus>;
      constructor(value?: any, validatorOrOpts?: any);
      setValue(value: any, options?: { onlySelf?: boolean; emitEvent?: boolean }): void;
      patchValue(value: any, options?: { onlySelf?: boolean; emitEvent?: boolean }): void;
      reset(value?: any, options?: { onlySelf?: boolean; emitEvent?: boolean }): void;
      markAsTouched(opts?: { onlySelf?: boolean }): void;
      markAllAsTouched(): void;
      markAsUntouched(opts?: { onlySelf?: boolean }): void;
      markAsDirty(opts?: { onlySelf?: boolean }): void;
      markAsPristine(opts?: { onlySelf?: boolean }): void;
      disable(opts?: { onlySelf?: boolean; emitEvent?: boolean }): void;
      enable(opts?: { onlySelf?: boolean; emitEvent?: boolean }): void;
      setValidators(validators: ValidatorFn | ValidatorFn[] | null): void;
      addValidators(validators: ValidatorFn | ValidatorFn[]): void;
      clearValidators(): void;
      setErrors(errors: ValidationErrors | null, opts?: { emitEvent?: boolean }): void;
      hasError(errorCode: string, path?: string | (string | number)[]): boolean;
      getError(errorCode: string, path?: string | (string | number)[]): any;
      get(path: Array<string | number> | string): AbstractControl | null;
      getRawValue(): any;
      updateValueAndValidity(opts?: { onlySelf?: boolean; emitEvent?: boolean }): void;
    }
    export declare class FormControl<TValue = any> extends AbstractControl<any> {
      readonly defaultValue: any;
      constructor(value?: TValue | { value: TValue; disabled?: boolean }, validatorOrOpts?: any, asyncValidator?: any);
    }
    export declare class UntypedFormControl extends FormControl<any> {}
    export declare class FormGroup<TControl = any> extends AbstractControl<any> {
      controls: Record<string, AbstractControl>;
      constructor(controls: any, validatorOrOpts?: any, asyncValidator?: any);
      registerControl(name: string, control: AbstractControl): AbstractControl;
      addControl(name: string, control: AbstractControl, options?: { emitEvent?: boolean }): void;
      removeControl(name: string, options?: { emitEvent?: boolean }): void;
      setControl(name: string, control: AbstractControl, options?: { emitEvent?: boolean }): void;
      contains(controlName: string): boolean;
    }
    export declare class UntypedFormGroup extends FormGroup<any> {}
    export declare class FormArray<TControl = any> extends AbstractControl<any> {
      controls: AbstractControl[];
      readonly length: number;
      constructor(controls: any[], validatorOrOpts?: any, asyncValidator?: any);
      at(index: number): AbstractControl;
      push(control: AbstractControl, options?: { emitEvent?: boolean }): void;
      insert(index: number, control: AbstractControl, options?: { emitEvent?: boolean }): void;
      removeAt(index: number, options?: { emitEvent?: boolean }): void;
      clear(options?: { emitEvent?: boolean }): void;
    }
    export declare class UntypedFormArray extends FormArray<any> {}
    export declare class FormBuilder {
      readonly nonNullable: NonNullableFormBuilder;
      control<T = any>(formState: T | { value: T; disabled: boolean }, validatorOrOpts?: any, asyncValidator?: any): FormControl<any>;
      group(controls: Record<string, any>, options?: any): FormGroup<any>;
      record(controls: Record<string, any>, options?: any): FormGroup<any>;
      array(controls: any[], validatorOrOpts?: any, asyncValidator?: any): FormArray<any>;
    }
    export declare class UntypedFormBuilder extends FormBuilder {}
    export declare class NonNullableFormBuilder extends FormBuilder {}
    export declare const FormsModule: any;
    export declare const ReactiveFormsModule: any;
    export declare const NgModel: any;
  `,
  '@nativescript/angular': `
    import type { Observable } from 'rxjs';
    import type { UrlTree } from '@nativescript/release';
    export type NavigationExtras = any;
    export declare class RouterExtensions {
      readonly router: { readonly url: string; readonly events: Observable<any>; readonly routerState: any };
      readonly url: string;
      readonly events: Observable<any>;
      navigate(commands: any[], extras?: NavigationExtras): Promise<boolean>;
      navigateByUrl(url: string | UrlTree, extras?: NavigationExtras): Promise<boolean>;
      back(options?: { relativeTo?: any; outlets?: string[] }): void;
      backToPreviousPage(): void;
      canGoBack(options?: any): boolean;
      canGoBackToPreviousPage(): boolean;
    }
    export declare const NativeDialogModule: any;
    export declare const NATIVE_DIALOG_DATA: import('@angular/core').InjectionToken<any>;
    export declare function registerElement(name: string, resolver: () => any, meta?: any): void;
    export declare function isAngularHmrRestoringRoute(): boolean;
    export declare const ActionBarComponent: any;
    export declare const ActionItemDirective: any;
    export declare const NavigationButtonDirective: any;
    export declare const TabViewDirective: any;
    export declare const TabViewItemDirective: any;
    export declare const NSEmptyOutletComponent: any;
    export declare function provideNativeScriptHttpClient(...features: any[]): any;
    export declare function provideNativeScriptRouter(routes?: any, ...features: any[]): any;
    export declare function provideNativeScriptNgZone(): any;
    export declare function bootstrapApplication(component: any, options?: any): Promise<any>;
    export type NativeDialogConfig<D = any> = { data?: D; nativeOptions?: any; [key: string]: any };
    export declare class NativeDialogRef<T = any, R = any> { readonly componentInstance: T; close(result?: R): void; afterClosed(): Observable<R | undefined> }
    export declare class NativeDialogService { open<T = any, D = any, R = any>(component: any, config?: NativeDialogConfig<D>): NativeDialogRef<T, R>; closeAll(): void }
    export { NativeDialogService as NativeDialog };
    export declare const NativeScriptCommonModule: any;
    export declare const NativeScriptFormsModule: any;
    export declare const NativeScriptHttpClientModule: any;
    export declare const NativeScriptModule: any;
    export declare const NativeScriptRouterModule: { forRoot(routes: any, config?: any): any; forChild(routes: any): any };
    export declare function platformNativeScript(): { bootstrapModule(module: any, options?: any): Promise<any> };
    export declare function runNativeScriptAngularApp(options: any): void;
    export declare const PageRouterOutlet: any;
    export declare const RouterOutlet: any;
    export declare const NSRouterLink: any;
    export declare const NSRouterLinkActive: any;
  `,
  'svelte': `
    export declare function tick(): Promise<void>;
  `,
  'svelte/store': `
    import type { Sig } from '@nativescript/release';
    export interface Writable<T> extends Sig<T> { set(value: T): void; update(fn: (value: T) => T): void }
    export declare function writable<T>(value: T): Writable<T>;
    export declare function get<T>(store: Writable<T>): T;
  `,
  '@nativescript-community/svelte-native': `
    export declare function navigate(options: { page: any; props?: Record<string, any> }): void;
    export declare function svelteNativeNoFrame(component: any, props: any): void;
  `,
  'nativescript-vue': `
    import type { VueRef } from '@nativescript/release';
    export type Ref<T> = VueRef<T>;
    export declare function ref<T>(value: T): VueRef<T>;
    export declare function computed<T>(fn: () => T): { readonly value: T };
    export declare function nextTick(): Promise<void>;
    export declare function $navigateTo(component: any, options?: { props?: Record<string, any> }): void;
    export interface ModalOptions { props?: Record<string, any>; fullscreen?: boolean; animated?: boolean; cancelable?: boolean; closeCallback?: (result?: any) => void }
    export declare function $showModal(component: any, options?: ModalOptions): { then(fn: (result?: any) => void): void };
    export declare function $closeModal(result?: any): void;
    export declare function createApp(component: any): { start(): void };
    export interface ListItem<T = any> { item: T; index: number; even: boolean; odd: boolean }
    import type { ItemEventData } from '@nativescript/core';
    export interface ListViewItemTapEvent<T = any> extends ItemEventData { item: T; value: any }
  `,
};

/** Globals NativeScript provides that neither the ES library nor core's declarations type. */
const GLOBALS = `
  declare var console: {
    log(...data: any[]): void; info(...data: any[]): void; warn(...data: any[]): void; error(...data: any[]): void; debug(...data: any[]): void;
    time(label?: string): void; timeLog(label?: string, ...data: any[]): void; timeEnd(label?: string): void;
    count(label?: string): void; countReset(label?: string): void; assert(condition?: boolean, ...data: any[]): void; dir(item?: any, options?: any): void; trace(...data: any[]): void;
  };
  declare function queueMicrotask(callback: () => void): void;
  // Core declares the delay required; JavaScript defaults it to 0.
  declare function setTimeout(callback: (...args: any[]) => void): number;
  declare function setInterval(callback: (...args: any[]) => void): number;
  /** What \`types: ["node"]\` gives an app for the timers' results. */
  declare namespace NodeJS { type Timeout = number; type Timer = number; type Immediate = number }
  declare var global: typeof globalThis;
  declare function requestAnimationFrame(callback: (frameTime: number) => void): number;
  declare function cancelAnimationFrame(id: number): void;
  declare function __nsRegisterAppModules(modules: any): void;
  declare function __nsClass(make: () => any): any;
  declare function atob(data: string): string;
  declare function btoa(data: string): string;
  interface TextEncoder { readonly encoding: string; encode(input?: string): Uint8Array<ArrayBuffer> }
  declare var TextEncoder: { prototype: TextEncoder; new (): TextEncoder };
  interface TextDecoderOptions { fatal?: boolean; ignoreBOM?: boolean }
  interface TextDecoder { readonly encoding: string; readonly fatal: boolean; readonly ignoreBOM: boolean; decode(input?: AllowSharedBufferSource): string }
  declare var TextDecoder: { prototype: TextDecoder; new (label?: string, options?: TextDecoderOptions): TextDecoder };
  type AllowSharedBufferSource = ArrayBufferLike | ArrayBufferView;
  type BufferSource = ArrayBufferView<ArrayBuffer> | ArrayBuffer;
  interface Algorithm { name: string }
  type AlgorithmIdentifier = Algorithm | string;
  type HashAlgorithmIdentifier = AlgorithmIdentifier;
  type BigInteger = Uint8Array<ArrayBuffer>;
  type KeyType = 'private' | 'public' | 'secret';
  type KeyUsage = 'decrypt' | 'deriveBits' | 'deriveKey' | 'encrypt' | 'sign' | 'unwrapKey' | 'verify' | 'wrapKey';
  interface KeyAlgorithm { name: string }
  interface HmacKeyGenParams extends Algorithm { hash: HashAlgorithmIdentifier; length?: number }
  interface RsaKeyGenParams extends Algorithm { modulusLength: number; publicExponent: BigInteger }
  interface RsaHashedKeyGenParams extends RsaKeyGenParams { hash: HashAlgorithmIdentifier }
  interface RsaOaepParams extends Algorithm { label?: BufferSource }
  interface CryptoKey { readonly algorithm: KeyAlgorithm; readonly extractable: boolean; readonly type: KeyType; readonly usages: KeyUsage[] }
  interface CryptoKeyPair { privateKey: CryptoKey; publicKey: CryptoKey }
  interface SubtleCrypto {
    digest(algorithm: AlgorithmIdentifier, data: BufferSource): Promise<ArrayBuffer>;
    generateKey(algorithm: RsaHashedKeyGenParams, extractable: boolean, keyUsages: ReadonlyArray<KeyUsage>): Promise<CryptoKeyPair>;
    generateKey(algorithm: HmacKeyGenParams, extractable: boolean, keyUsages: ReadonlyArray<KeyUsage>): Promise<CryptoKey>;
    sign(algorithm: AlgorithmIdentifier, key: CryptoKey, data: BufferSource): Promise<ArrayBuffer>;
    verify(algorithm: AlgorithmIdentifier, key: CryptoKey, signature: BufferSource, data: BufferSource): Promise<boolean>;
    encrypt(algorithm: AlgorithmIdentifier | RsaOaepParams, key: CryptoKey, data: BufferSource): Promise<ArrayBuffer>;
    decrypt(algorithm: AlgorithmIdentifier | RsaOaepParams, key: CryptoKey, data: BufferSource): Promise<ArrayBuffer>;
  }
  interface Crypto {
    readonly subtle: SubtleCrypto;
    getRandomValues<T extends ArrayBufferView | null>(array: T): T;
    randomUUID(): \`\${string}-\${string}-\${string}-\${string}-\${string}\`;
  }
  declare var crypto: Crypto;
`;

/** What the Android kit's runtime adds (kit-android `runtime/Workers.kt`): workers compiled with the app, a transfer list copied. */
const ANDROID_GLOBALS = `
  interface MessageEvent<T = any> { readonly data: T }
  interface ErrorEvent { readonly message: string }
  interface Worker {
    onmessage: ((this: Worker, ev: MessageEvent) => any) | null;
    onerror: ((this: Worker, ev: ErrorEvent) => any) | null;
    postMessage(message: any, transfer?: any[]): void;
    terminate(): void;
  }
  declare var Worker: { prototype: Worker; new (scriptURL: string | URL): Worker };
  interface URL { readonly href: string; toString(): string }
  declare var URL: { prototype: URL; new (url: string | URL, base?: string | URL): URL };
  declare function postMessage(message: any, transfer?: any[]): void;
  declare function close(): void;
`;

/** The platform's native API typings, as an app's `references.d.ts` includes them. */
const PLATFORM_TYPES: Record<Platform, string> = { ios: '@nativescript/types-ios/index.d.ts', android: '@nativescript/types-android/index.d.ts' };

/** The nearest `node_modules` above `from` that has @nativescript/core. */
export function nodeModules(from: string): string {
  for (let dir = from; ; dir = dirname(dir)) {
    if (existsSync(resolve(dir, 'node_modules/@nativescript/core/package.json'))) return resolve(dir, 'node_modules');
    if (dirname(dir) === dir) throw new Error(`${from}: no node_modules with @nativescript/core above it`);
  }
}

export interface Program {
  program: ts.Program;
  checker: ts.TypeChecker;
  /** The app's files and the components' virtual files, in translation order. */
  files: ts.SourceFile[];
  /** The plugins' source files the program reached, beside the app's. */
  pluginFiles: string[];
  /** The file a module specifier resolved to from a file, as the program resolved it. */
  resolved: (containing: string, specifier: string) => string | undefined;
  /** The app's own configuration checks without strictNullChecks. */
  lenient: boolean;
}

const RXJS_SHIM = `
  export declare class Subscription { readonly closed: boolean; unsubscribe(): void }
  export interface OperatorFunction<T, R> { readonly __operator: [T, R] }
  export declare class Observable<T> {
    subscribe(next: (value: T) => void): Subscription;
    pipe<A>(a: OperatorFunction<T, A>): Observable<A>;
    pipe<A, B>(a: OperatorFunction<T, A>, b: OperatorFunction<A, B>): Observable<B>;
    pipe<A, B, C>(a: OperatorFunction<T, A>, b: OperatorFunction<A, B>, c: OperatorFunction<B, C>): Observable<C>;
  }
  export declare class Subject<T> extends Observable<T> { next(value: T): void; asObservable(): Observable<T> }
  export declare class BehaviorSubject<T> extends Subject<T> { constructor(value: T); readonly value: T; getValue(): T }
  export declare class ReplaySubject<T> extends Subject<T> { constructor(bufferSize?: number) }
  export declare function map<T, R>(project: (value: T, index: number) => R): OperatorFunction<T, R>;
  export declare function filter<T, S extends T>(predicate: (value: T, index: number) => value is S): OperatorFunction<T, S>;
  export declare function filter<T>(predicate: (value: T, index: number) => boolean): OperatorFunction<T, T>;
  export declare function take<T>(count: number): OperatorFunction<T, T>;
  export declare function firstValueFrom<T>(source: Observable<T>): Promise<T>;
`;

/**
 * Packages whose imports stay on their declarations: core and the plugins in
 * KIT_PLUGINS are NativeScriptKit, the frameworks are the front ends, and the
 * rest are typings or tooling.
 */
const NOT_PLUGINS = /^(@nativescript\/(core|types|types-ios|types-android|types-minimal|webpack|vite|tailwind|angular|android|ios)|octane|@nativescript-community\/(octane|solid-js|svelte-native|vite-octane)|nativescript-vue|react|react-nativescript|solid-js|svelte|@angular\/.*|tslib|typescript|vite)$/;
const notPlugin = (pkg: string, platform: Platform = 'ios') => NOT_PLUGINS.test(pkg) || KIT_PLUGINS.includes(pkg) || STUBBED_PLUGINS.has(pkg) || (platform === 'android' && pkg === 'rxjs');

/**
 * A program over the app's modules and the components' virtual classes,
 * typed by the real ES2022 library, @nativescript/core's own declarations
 * and the platform's native API typings.
 */
export function createProgram(roots: string[], virtual: Map<string, string>, platform: Platform = 'ios', modulesDir?: string, plugins?: PluginSources, declarations: string[] = [], replacements: Record<string, string> = {}, overrides: ts.CompilerOptions = {}, aliased: (specifier: string) => string | undefined = () => undefined): Program {
  const shimPath = (m: string) => `/__shims__/${m.replace(/[@/]/g, '_')}.d.ts`;
  const shims: Record<string, string> = platform === 'android' || !plugins ? { ...SHIMS, rxjs: RXJS_SHIM } : SHIMS;
  const files = new Map<string, string>(virtual);
  for (const [m, text] of Object.entries(shims)) files.set(shimPath(m), text);
  files.set('/__shims__/globals.d.ts', platform === 'android' ? GLOBALS + ANDROID_GLOBALS : GLOBALS);
  const modules = modulesDir ?? nodeModules(dirname([...roots, ...virtual.keys()][0]));
  const platformTypes = resolve(modules, PLATFORM_TYPES[platform]);
  if (!existsSync(platformTypes)) throw new Error(`${platformTypes} is missing: install ${PLATFORM_TYPES[platform].split('/index')[0]}`);

  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
    // Of ES2024, only what both runtimes implement (groupBy, withResolvers): the rest would type-check and then not translate.
    strict: true, lib: ['lib.es2023.d.ts', 'lib.es2024.object.d.ts', 'lib.es2024.collection.d.ts', 'lib.es2024.promise.d.ts'], types: [], skipLibCheck: true, experimentalDecorators: true, noEmit: true, allowImportingTsExtensions: true, jsx: ts.JsxEmit.Preserve,
    // Each file is a module, as the bundler makes it: a file without imports does not merge into the platform's globals (`double`, `long`).
    moduleDetection: ts.ModuleDetectionKind.Force,
    // A lenient app's caught values are `any`, as its own build types them.
    ...(appStrictness(roots[0] ?? [...virtual.keys()][0]) ? { useUnknownInCatchVariables: false } : {}),
    ...overrides,
  };
  const host = ts.createCompilerHost(options);
  const readLib = host.getSourceFile.bind(host);
  // The app's declarations may reach `@nativescript/types`, which declares both platforms, as the app's own build reads them:
  // the other platform's types name what code for that platform holds (`signal<android.view.View | null>`).
  const pluginFiles = new Set<string>();
  const extraRoots = new Set<string>();
  const isSource = (name: string) => !name.startsWith('/__shims__/') && !name.endsWith('.d.ts') && !name.includes('/node_modules/');
  const isApp = (name: string) => isSource(name) && !pluginFiles.has(name);
  // The app's declarations are read for the native APIs they declare: the frameworks' own typings they reference would replace the shims.
  const appTypings = new Set(declarations);
  const nativeReferences = (text: string, file: string) => text.replace(/^\/\/\/\s*<reference\s+(path|types)="([^"]*)"\s*\/>.*$/gm, (line, kind: string, ref: string) => {
    const target = resolve(dirname(file), ref);
    const pkg = /[\\/]node_modules[\\/]((?:@[^\\/]+[\\/])?[^\\/]+)/.exec(target)?.[1].replace(/\\/g, '/');
    return kind === 'path' && (!pkg || pkg.startsWith('@nativescript/types') || !notPlugin(pkg, platform)) ? line : '';
  });
  const declaredExports = (name: string, code: string) => (pluginFiles.has(name) ? pluginDeclaredExports(code, name, platform) : code);
  host.getSourceFile = (name, version, onError) => {
    const text = files.get(name) ?? (isSource(name) && existsSync(name) ? readFileSync(name, 'utf8') : appTypings.has(name) ? nativeReferences(readFileSync(name, 'utf8'), name) : undefined);
    if (text === undefined) {
      // A package's own TypeScript source.
      if (!/\.tsx?$/.test(name) || name.endsWith('.d.ts') || !existsSync(name)) return readLib(name, version, onError);
      return ts.createSourceFile(name, desugarConstructorFactories(declaredExports(name, readFileSync(name, 'utf8')), name), version, true);
    }
    const code = /\.tsx?$/.test(name) && !name.endsWith('.d.ts') ? desugarConstructorFactories(declaredExports(name, text), name) : text;
    return ts.createSourceFile(name, isSource(name) ? foldPlatform(code, name, platform) : code, version, true);
  };
  const fileExists = host.fileExists.bind(host);
  host.fileExists = (name) => files.has(name) || fileExists(name);
  const readFile = host.readFile.bind(host);
  host.readFile = (name) => files.get(name) ?? readFile(name);
  const resolutions = new Map<string, string>();
  // A plugin's augmentations of other packages (`declare module '@nativescript/firebase-core'`), which its source keeps in
  // the declarations beside it (`index.d.ts`), apply as its published typings apply them.
  const augmenting = new Map<string, string | null>();
  const augmentations = (source: string) => {
    if (!augmenting.has(source)) {
      const beside = source.replace(/(\.(ios|android))?\.tsx?$/, '.d.ts');
      augmenting.set(source, beside !== source && existsSync(beside) && /^\s*declare module ['"]/m.test(readFileSync(beside, 'utf8')) ? beside : null);
    }
    return augmenting.get(source);
  };
  host.resolveModuleNameLiterals = (literals, containing) =>
    literals.map((lit) => {
      const r = resolveLiteral(lit, containing);
      if (r.resolvedModule) resolutions.set(`${containing}\0${lit.text}`, r.resolvedModule.resolvedFileName);
      return r;
    });
  const resolveLiteral = (lit: ts.StringLiteralLike, containing: string): ts.ResolvedModuleWithFailedLookupLocations => {
    {
      // The app's own tsconfig `paths` (`~/app/x`), as its bundler resolves them: plugins' sources have their own.
      const m = (isApp(containing) ? aliased(lit.text) : undefined) ?? lit.text;
      if (platform === 'ios' && plugins && ANGULAR_RX_MODULES.has(m)) {
        pluginFiles.add(ANGULAR_RX_FILE);
        return { resolvedModule: { resolvedFileName: ANGULAR_RX_FILE, extension: ts.Extension.Ts } };
      }
      if (m === '@angular#rx') return { resolvedModule: { resolvedFileName: shimPath('@nativescript/release'), extension: ts.Extension.Dts } };
      if (shims[m]) return { resolvedModule: { resolvedFileName: shimPath(m), extension: ts.Extension.Dts } };
      if (!m.startsWith('.') && !isAbsolute(m) && STUBBED_PLUGINS.has(packageOf(m))) {
        pluginFiles.add(PLUGIN_STUBS_FILE);
        return { resolvedModule: { resolvedFileName: PLUGIN_STUBS_FILE, extension: ts.Extension.Ts } };
      }
      // The build's own glue imports app modules by absolute path (`__elements.release.ts`).
      if (m.startsWith('.') || (isAbsolute(m) && !m.startsWith('/__shims__/'))) {
        const base = resolve(dirname(containing), m);
        // A platform's own file first, as NativeScript's bundler resolves `./x` to `x.ios.ts`.
        // A platform file importing its own module's name (`import type { HingeListener } from './hinge-tracker'` in
        // hinge-tracker.ios.ts) means the module's declarations: `x.d.ts`, else the platforms' shared `x.ts`.
        const typeOnly = (ts.isImportDeclaration(lit.parent) && !!lit.parent.importClause?.isTypeOnly) || (ts.isExportDeclaration(lit.parent) && lit.parent.isTypeOnly);
        // A type-only import is TypeScript's, which reads `x.d.ts` beside the platforms' files; only the bundler picks `x.ios.ts`.
        const own = containing === `${base}.${platform}.ts` || (typeOnly && existsSync(base + '.d.ts'));
        for (const candidate of own ? [base + '.d.ts', base + '.ts'] : [`${base}.${platform}.ts`, base + '.ts', base + '.tsx', `${base}/index.${platform}.ts`, base + '/index.ts', base.endsWith('.vue') ? base + '.ts' : '']) {
          if (candidate && (files.has(candidate) || existsSync(candidate))) {
            if (candidate.endsWith('.d.ts')) return { resolvedModule: { resolvedFileName: candidate, extension: ts.Extension.Dts } };
            // A plugin's own modules are compiled with it.
            if (pluginFiles.has(containing)) pluginFiles.add(candidate);
            return { resolvedModule: { resolvedFileName: candidate, extension: candidate.endsWith('.tsx') ? ts.Extension.Tsx : ts.Extension.Ts } };
          }
        }
      }
      // A package the app replaces for the native build is the app's module.
      const replacement = !m.startsWith('.') && !m.startsWith('/') ? replacements[packageOf(m)] : undefined;
      if (replacement) return { resolvedModule: { resolvedFileName: replacement, extension: ts.Extension.Ts } };
      // A plugin is compiled from its source: an import that reaches its code resolves to the file it was built from.
      // A type-only import still resolves to the source where the file also imports values from the package: TypeScript resolves a specifier once per file.
      const valueImport = (st: ts.Statement) => ts.isImportDeclaration(st) && !st.importClause?.isTypeOnly && ts.isStringLiteral(st.moduleSpecifier) && st.moduleSpecifier.text === m;
      const typeOnly = !containing.startsWith('/__shims__/') && ts.isImportDeclaration(lit.parent) && !!lit.parent.importClause?.isTypeOnly && !(lit.parent.parent && ts.isSourceFile(lit.parent.parent) && lit.parent.parent.statements.some(valueImport));
      // A plugin's augmentation of another's module augments the module the program compiles: that package's source.
      const augments = ts.isModuleDeclaration(lit.parent) && lit.parent.name === lit && !!plugins?.all().some((p) => containing.startsWith(p.root + '/'));
      if (plugins && (isSource(containing) || augments || containing.startsWith('/__shims__/')) && !m.startsWith('.') && !m.startsWith('/') && !notPlugin(packageOf(m), platform) && !typeOnly) {
        const js = runtimeFile(m, modules, platform);
        if (js) {
          plugins.get(js.packageDir);
          const source = plugins.sourceOf(js.file);
          if (source) {
            pluginFiles.add(source);
            for (const t of plugins.get(js.packageDir).typings) extraRoots.add(t);
            const beside = augmentations(source);
            if (beside) extraRoots.add(beside);
            return { resolvedModule: { resolvedFileName: source, extension: source.endsWith('.tsx') ? ts.Extension.Tsx : ts.Extension.Ts } };
          }
        }
      }
      // The shims import core's types from the app's node_modules; a plugin's source is typed against the app's packages.
      // Shims, plugins' sources and plugin components compiled with the app (outside its folder) import the app's packages.
      const from = containing.startsWith('/__shims__/') || pluginFiles.has(containing) || (!m.startsWith('.') && !containing.startsWith(dirname(modules) + '/')) ? resolve(modules, '..', 'index.ts') : containing;
      if (pluginFiles.has(containing) && m.startsWith('.')) return ts.resolveModuleName(m, containing, options, host);
      return ts.resolveModuleName(m, from, options, host);
    }
  };

  // An Android build types iOS API too, as an app's references to `@nativescript/types` do: code reaching it is code NativeScript runs only on iOS.
  // An iOS build types Android API where the app names it (`android.view.View` in code shared by both platforms), which is large to load otherwise.
  const namesAndroid = platform === 'ios' && roots.some((f) => /(?<![.\w$])(android|androidx|java|org)\.[a-z]/.test(ts.sys.readFile(f) ?? ''));
  const otherTypes = platform === 'android' || namesAndroid ? resolve(modules, PLATFORM_TYPES[platform === 'android' ? 'ios' : 'android']) : null;
  const rootNames = [...roots, ...virtual.keys(), '/__shims__/globals.d.ts', platformTypes, ...(otherTypes && existsSync(otherTypes) ? [otherTypes] : []), resolve(modules, '@nativescript/core/global-types.d.ts'), ...declarations];
  // A copy: a program keeps the array it is given, and a later program with equal root names reuses its files.
  let program = ts.createProgram([...rootNames], options, host);
  // A plugin's sources use frameworks the default typings leave out (CoreLocation): every framework's, where the package has them.
  const complete = platform === 'ios' ? resolve(dirname(platformTypes), 'complete.d.ts') : null;
  if (pluginFiles.size && complete && existsSync(complete)) extraRoots.add(complete);
  // A plugin's native API declarations (`typings/ios.d.ts`) are found as its sources are.
  if (extraRoots.size) {
    rootNames.push(...extraRoots);
    program = ts.createProgram(rootNames, options, host, program);
  }
  // `import * as fs from '@nativescript/core/file-system'` then `fs.knownFolders`: each member read as it would be imported by name.
  const named = coreNamespaceMembers(program, isSource);
  if (named.size) {
    for (const [name, text] of named) files.set(name, text);
    program = ts.createProgram(rootNames, options, host, program);
  }
  // kit-android does not compile core's fetch and XMLHttpRequest yet.
  const webGlobals = platform === 'ios' ? coreGlobalImports(program, isSource, modules) : new Map<string, string>();
  if (webGlobals.size) {
    for (const [name, text] of webGlobals) files.set(name, text);
    program = ts.createProgram(rootNames, options, host, program);
  }
  // `view.ios` is `any` in core's declarations: typed as the view's native class, everything read from it is typed too.
  const casts = nativeViewCasts(program, isSource, platform);
  if (casts.size) {
    for (const [name, text] of casts) files.set(name, text);
    program = ts.createProgram(rootNames, options, host, program);
  }
  // The build types the app strictly; an app whose own configuration is not strict is held only to what that configuration checks.
  const lenient = appStrictness(roots[0] ?? [...virtual.keys()][0]);
  const strictOnly = new Set([2322, 2345, 2531, 2532, 2533, 2454, 2564, 2722, 7005, 7006, 7008, 7015, 7031, 7034, 7053, 18047, 18048, 18049,
    // What JavaScript defines that a lenient app's own build does not check: a key a spread overwrites, a `??` that never applies,
    // an operand always nullish, truthy or falsy.
    2783, 2869, 2871, 2872, 2873]);
  // Strict narrowing leaves a lenient program's value `never` where its own build reads it as declared.
  const neverRead = (d: ts.Diagnostic) => d.code === 2339 && /on type 'never'/.test(ts.flattenDiagnosticMessageText(d.messageText, '\n'));
  // Another platform's file (`x.android.ts`, which a declaration file may import for its types) is not part of this build.
  const otherPlatform = platform === 'android' ? /\.ios\.tsx?$/ : /\.android\.tsx?$/;
  // The app is checked with its own configuration's checks; the program it is translated from stays strict, for the types it gives.
  // Class fields as the app's target defines them: a field redeclaring a base accessor is an error only where fields are defined (ES2022).
  const defineFields = appDefinesFields(roots[0] ?? [...virtual.keys()][0]);
  const checks: ts.CompilerOptions = {
    ...(lenient ? { strict: false, strictNullChecks: false, strictFunctionTypes: false, strictBindCallApply: false, strictPropertyInitialization: false, noImplicitAny: false, noImplicitThis: false, useUnknownInCatchVariables: false } : {}),
    ...(defineFields === false ? { useDefineForClassFields: false } : {}),
  };
  const checked = Object.keys(checks).length ? ts.createProgram([...rootNames], { ...options, ...checks }, host, program) : program;
  // A plugin's components (`<package>/angular`) compile with the app's but are typed by the plugin's own build, against its declarations
  // rather than this platform's implementation.
  const pluginRoots = (plugins?.all() ?? []).map((p) => p.root + '/');
  const ofPlugin = (name: string) => pluginRoots.some((r) => name.startsWith(r));
  const diagnostics = ts.getPreEmitDiagnostics(checked).filter((d) => d.category === ts.DiagnosticCategory.Error && (!d.file || (isApp(d.file.fileName) && !ofPlugin(d.file.fileName) && !otherPlatform.test(d.file.fileName))) && !(lenient && (strictOnly.has(d.code) || neverRead(d))));
  if (diagnostics.length) {
    const text = ts.formatDiagnostics(diagnostics.slice(0, Number(process.env.NS_NATIVE_DIAGNOSTICS ?? 12)), { getCanonicalFileName: (f) => f, getCurrentDirectory: () => '/', getNewLine: () => '\n' });
    throw new Error(`the app does not type-check as the release build sees it:\n${text}`);
  }
  const ordered = [...roots, ...virtual.keys(), ...pluginFiles].map((f) => program.getSourceFile(f)!).filter(Boolean);
  return { program, checker: program.getTypeChecker(), files: ordered, pluginFiles: [...pluginFiles], resolved: (containing, specifier) => resolutions.get(`${containing}\0${specifier}`), lenient };
}

/**
 * Each app file's text with a core module imported whole (`import * as fs from '@nativescript/core/file-system'`) read
 * by member: `fs.knownFolders` is `__fs_knownFolders`, imported by name from the same module, as the kit has each
 * member under its own name, not the module's. A member written to (`ns.x = …`) stays as it is.
 */
function coreNamespaceMembers(program: ts.Program, isApp: (name: string) => boolean): Map<string, string> {
  const checker = program.getTypeChecker();
  const out = new Map<string, string>();
  const writes = (sf: ts.SourceFile, symbol: ts.Symbol | undefined): boolean => {
    let found = false;
    const visit = (n: ts.Node) => {
      if (found) return;
      if (ts.isIdentifier(n) && checker.getSymbolAtLocation(n) === symbol && !ts.isVariableDeclaration(n.parent)) {
        const p = n.parent;
        found = (ts.isBinaryExpression(p) && p.left === n && p.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && p.operatorToken.kind <= ts.SyntaxKind.LastAssignment)
          || ((ts.isPrefixUnaryExpression(p) || ts.isPostfixUnaryExpression(p)) && (p.operator === ts.SyntaxKind.PlusPlusToken || p.operator === ts.SyntaxKind.MinusMinusToken));
      }
      ts.forEachChild(n, visit);
    };
    visit(sf);
    return found;
  };
  for (const sf of program.getSourceFiles()) {
    if (!isApp(sf.fileName)) continue;
    const edits: { at: number; end: number; text: string }[] = [];
    for (const st of sf.statements) {
      const clause = ts.isImportDeclaration(st) ? st.importClause : undefined;
      if (!clause || clause.isTypeOnly || !clause.namedBindings || !ts.isNamespaceImport(clause.namedBindings)) continue;
      const spec = (st as ts.ImportDeclaration).moduleSpecifier;
      if (!ts.isStringLiteral(spec) || !/^@nativescript\/core(\/|$)/.test(spec.text)) continue;
      const ns = clause.namedBindings.name;
      const local = checker.getSymbolAtLocation(ns);
      const members = new Map<string, string>();
      const renamed: string[] = [];
      const aliasOf = (member: string) => members.get(member) ?? (members.set(member, `__${ns.text}_${member}`), members.get(member)!);
      const visit = (n: ts.Node) => {
        // `const { Color } = colorModule`: each name bound to the member imported by name.
        if (ts.isVariableDeclaration(n) && ts.isObjectBindingPattern(n.name) && n.initializer && ts.isIdentifier(n.initializer) && checker.getSymbolAtLocation(n.initializer) === local
          && n.name.elements.every((el) => !el.dotDotDotToken && !el.initializer && ts.isIdentifier(el.name) && (!el.propertyName || ts.isIdentifier(el.propertyName)))) {
          const statement = n.parent.parent;
          // At the module's top, alone in its statement: the names imported, a class then the class itself, as an import is.
          if (ts.isVariableStatement(statement) && statement.parent === sf && statement.declarationList.declarations.length === 1) {
            for (const el of n.name.elements) renamed.push(`${((el.propertyName ?? el.name) as ts.Identifier).text} as ${(el.name as ts.Identifier).text}`);
            edits.push({ at: statement.getStart(), end: statement.getEnd(), text: ' '.repeat(statement.getEnd() - statement.getStart()) });
            return;
          }
          const bound = n.name.elements.map((el) => `${(el.name as ts.Identifier).text} = ${aliasOf(((el.propertyName ?? el.name) as ts.Identifier).text)}`);
          edits.push({ at: n.getStart(), end: n.getEnd(), text: bound.join(', ') });
          return;
        }
        // `var Color = colorModule.Color` at the module's top, never written again: imported under that name.
        if (ts.isVariableStatement(n) && n.parent === sf && n.declarationList.declarations.length === 1) {
          const d = n.declarationList.declarations[0];
          const init = d.initializer;
          if (ts.isIdentifier(d.name) && !d.type && init && ts.isPropertyAccessExpression(init) && ts.isIdentifier(init.expression) && checker.getSymbolAtLocation(init.expression) === local
            && !n.modifiers?.length && !writes(sf, checker.getSymbolAtLocation(d.name))) {
            renamed.push(`${init.name.text} as ${d.name.text}`);
            edits.push({ at: n.getStart(), end: n.getEnd(), text: ' '.repeat(n.getEnd() - n.getStart()) });
            return;
          }
        }
        if (ts.isPropertyAccessExpression(n) && ts.isIdentifier(n.expression) && checker.getSymbolAtLocation(n.expression) === local
          && !(ts.isBinaryExpression(n.parent) && n.parent.left === n && n.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken)) {
          const member = checker.getSymbolAtLocation(n.name);
          const target = member && member.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(member) : member;
          if (target && target.flags & ts.SymbolFlags.Value) {
            edits.push({ at: n.getStart(), end: n.getEnd(), text: aliasOf(n.name.text) });
            return;
          }
        }
        ts.forEachChild(n, visit);
      };
      visit(sf);
      const names = [...[...members].map(([m, a]) => `${m} as ${a}`), ...renamed];
      if (names.length) edits.push({ at: st.getEnd(), end: st.getEnd(), text: `\nimport { ${names.join(', ')} } from ${spec.getText()};` });
    }
    if (!edits.length) continue;
    let text = sf.text;
    for (const e of edits.sort((a, b) => b.at - a.at)) text = text.slice(0, e.at) + e.text + text.slice(e.end);
    out.set(sf.fileName, text);
  }
  return out;
}

/**
 * The globals core installs from its own modules (`globals/index.ts`), and the types the web names beside them
 * (`type`): what the NativeScript runtime runs for `fetch` or `new XMLHttpRequest()` is core's module.
 */
const CORE_GLOBALS: [module: string, names: string[]][] = [
  // core's ui index sets them on `global`.
  ['@nativescript/core/ui/dialogs', ['alert', 'confirm', 'prompt', 'login', 'action']],
  ['@nativescript/core/fetch', ['fetch', 'Headers', 'Request', 'Response', 'type BodyInit', 'type HeadersInit', 'type RequestInfo', 'type RequestInit', 'type ResponseInit']],
  ['@nativescript/core/xhr', ['XMLHttpRequest', 'FormData', 'Blob', 'File', 'FileReader']],
  ['@nativescript/core/abortcontroller', ['AbortController', 'AbortSignal']],
];

/**
 * Each app file's text with the core globals it names (and does not declare or import) imported from core's
 * modules at its end, where the import moves no line: `fetch(…)` is then core's `fetch`, as the kit has it.
 * A core whose module has no typed declarations (a fetch before core's own TypeScript one) is left out.
 */
function coreGlobalImports(program: ts.Program, isApp: (name: string) => boolean, modules: string): Map<string, string> {
  const checker = program.getTypeChecker() as ts.TypeChecker & { resolveName(name: string, at: ts.Node, meaning: ts.SymbolFlags, excludeGlobals: boolean): ts.Symbol | undefined };
  const available = CORE_GLOBALS.filter(([m]) => existsSync(resolve(modules, m, 'index.d.ts')));
  const wanted = new Map(available.flatMap(([m, names]) => names.map((n) => [n.replace(/^type /, ''), { module: m, spec: n }] as const)));
  const K = ts.SyntaxKind;
  const named = (n: ts.Identifier): boolean => {
    const p = n.parent;
    if (ts.isPropertyAccessExpression(p)) return p.name === n;
    if (ts.isQualifiedName(p)) return p.right === n;
    if (ts.isBindingElement(p)) return p.propertyName === n;
    if ([K.PropertyAssignment, K.PropertyDeclaration, K.PropertySignature, K.MethodDeclaration, K.MethodSignature, K.GetAccessor, K.SetAccessor, K.EnumMember, K.JsxAttribute].includes(p.kind)) return (p as ts.NamedDeclaration).name === n;
    return [K.ImportSpecifier, K.ExportSpecifier, K.ImportClause, K.NamespaceImport, K.LabeledStatement, K.BreakStatement, K.ContinueStatement].includes(p.kind);
  };
  // Undeclared (the DOM's names, which the program's library leaves out), or declared in the global scope by a declaration file.
  const global = (s: ts.Symbol | undefined) => !s || (!(s.flags & ts.SymbolFlags.Alias) && !(s as { parent?: ts.Symbol }).parent && !!s.declarations?.length && s.declarations.every((d) => d.getSourceFile().isDeclarationFile));
  const out = new Map<string, string>();
  for (const sf of program.getSourceFiles()) {
    if (!isApp(sf.fileName) || !wanted.size) continue;
    const used = new Map<string, Set<string>>();
    const visit = (n: ts.Node) => {
      if (ts.isImportDeclaration(n)) return;
      const want = ts.isIdentifier(n) ? wanted.get(n.text) : undefined;
      if (want && !named(n as ts.Identifier) && global(checker.resolveName((n as ts.Identifier).text, n, ts.SymbolFlags.Value | ts.SymbolFlags.Type, false))) {
        (used.get(want.module) ?? used.set(want.module, new Set()).get(want.module)!).add(want.spec);
      }
      ts.forEachChild(n, visit);
    };
    visit(sf);
    if (!used.size) continue;
    out.set(sf.fileName, sf.text + [...used].map(([m, names]) => `\nimport { ${[...names].join(', ')} } from '${m}';`).join(''));
  }
  return out;
}

/** Each app file's text with `x.ios` (x a core view) written `(x.ios as UILabel)`, or `x.android` as its Android class. */
function nativeViewCasts(program: ts.Program, isApp: (name: string) => boolean, platform: Platform): Map<string, string> {
  const members = platform === 'android' ? ['android', 'nativeView', 'nativeViewProtected'] : ['ios', 'nativeView', 'nativeViewProtected'];
  const table = platform === 'android' ? NATIVE_VIEWS_ANDROID : undefined;
  const checker = program.getTypeChecker();
  // The cast only where what the code reads of it is the native class's: a member newer than the typings
  // (`prominentTabIdentifier`), or a property called (`visibleCells()`), stays as untyped as core declares it.
  // A value given where a narrower type is declared (`let lb: LayoutBase = view.android`) stays untyped, as the app's assignment needs it.
  const fits = (n: ts.PropertyAccessExpression, native: string): boolean => {
    const cls = (checker as unknown as { resolveName(name: string, at: ts.Node, meaning: ts.SymbolFlags, excludeGlobals: boolean): ts.Symbol | undefined }).resolveName(native, n, ts.SymbolFlags.Type, false);
    if (!ts.isPropertyAccessExpression(n.parent) || n.parent.expression !== n) {
      const wanted = checker.getContextualType(n);
      if (!wanted || wanted.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) return true;
      // A qualified Java class (`android.view.View`): its namespaces' exports, one name at a time.
      const [first, ...rest] = native.split('.');
      let sym = rest.length ? (checker as unknown as { resolveName(name: string, at: ts.Node, meaning: ts.SymbolFlags, excludeGlobals: boolean): ts.Symbol | undefined }).resolveName(first, n, ts.SymbolFlags.Namespace, false) : cls;
      for (const part of rest) sym = sym && checker.getExportsOfModule(sym).find((s) => s.name === part);
      return !sym || checker.isTypeAssignableTo(checker.getDeclaredTypeOfSymbol(sym), wanted);
    }
    if (!cls) return false;
    const member = checker.getDeclaredTypeOfSymbol(cls).getProperty(n.parent.name.text);
    if (!member) return false;
    const called = ts.isCallExpression(n.parent.parent) && n.parent.parent.expression === n.parent;
    return !called || checker.getTypeOfSymbolAtLocation(member, n).getCallSignatures().length > 0;
  };
  const out = new Map<string, string>();
  for (const sf of program.getSourceFiles()) {
    if (!isApp(sf.fileName)) continue;
    const edits: { at: number; text: string }[] = [];
    const visit = (n: ts.Node) => {
      if (ts.isPropertyAccessExpression(n) && members.includes(n.name.text) && !ts.isAsExpression(n.parent)
        // An optional chain stays as written: a cast around it would stop TypeScript narrowing its root.
        && !n.questionDotToken
        && checker.getTypeAtLocation(n).flags & ts.TypeFlags.Any) {
        const native = nativeViewOf(checker, checker.getTypeAtLocation(n.expression), table ?? (n.name.text === 'ios' ? { ...NATIVE_VIEWS, ...NATIVE_CONTROLLERS } : NATIVE_VIEWS));
        if (native && fits(n, native)) edits.push({ at: n.getStart(), text: '(' }, { at: n.getEnd(), text: ` as ${native})` });
      }
      ts.forEachChild(n, visit);
    };
    visit(sf);
    if (!edits.length) continue;
    let text = sf.text;
    for (const e of edits.sort((a, b) => b.at - a.at)) text = text.slice(0, e.at) + e.text + text.slice(e.at);
    out.set(sf.fileName, text);
  }
  return out;
}

/** The declaration files the app's tsconfig.json includes (its `references.d.ts`, its own typings), outside node_modules. */
export function appDeclarations(app: string): string[] {
  const file = resolve(app, 'tsconfig.json');
  if (!existsSync(file)) return [];
  const parsed = ts.parseJsonConfigFileContent(ts.readConfigFile(file, ts.sys.readFile).config ?? {}, ts.sys, app);
  return parsed.fileNames.filter((f) => f.endsWith('.d.ts') && !f.includes('/node_modules/'));
}

/** Whether the app's tsconfig.json leaves strict checking off. */
/** Whether the app's configuration defines class fields (`useDefineForClassFields`, on from target ES2022); undefined where it has none. */
function appDefinesFields(from: string | undefined): boolean | undefined {
  if (!from) return undefined;
  for (let dir = dirname(from); dirname(dir) !== dir; dir = dirname(dir)) {
    const file = resolve(dir, 'tsconfig.json');
    if (!existsSync(file)) continue;
    const o = ts.parseJsonConfigFileContent(ts.readConfigFile(file, ts.sys.readFile).config ?? {}, ts.sys, dir).options;
    return o.useDefineForClassFields ?? (o.target ?? ts.ScriptTarget.ES5) >= ts.ScriptTarget.ES2022;
  }
  return undefined;
}

function appStrictness(from: string | undefined): boolean {
  if (!from) return false;
  for (let dir = dirname(from); dirname(dir) !== dir; dir = dirname(dir)) {
    const file = resolve(dir, 'tsconfig.json');
    if (!existsSync(file)) continue;
    const config = ts.readConfigFile(file, ts.sys.readFile).config ?? {};
    const o = config.compilerOptions ?? {};
    return !(o.strict || o.strictNullChecks);
  }
  return false;
}

/**
 * A plugin's platform file (`index.ios.ts`) with the exports of the declarations beside it (`index.d.ts`) that it
 * lacks: an app is written against those declarations, and the build compiles the platform file in their place. A
 * name the file declares or imports is exported as it is; a type only the declarations have is exported from them. A
 * value only the declarations have is left out: the platform's JavaScript doesn't define it either.
 */
export function pluginDeclaredExports(code: string, file: string, platform: Platform): string {
  const stem = file.endsWith(`.${platform}.ts`) ? file.slice(0, -`.${platform}.ts`.length) : null;
  if (!stem || !existsSync(`${stem}.d.ts`)) return code;
  const exportsOf = (sf: ts.SourceFile) => {
    const exported = new Set<string>(), local = new Map<string, 'type' | 'value'>(), stars = new Set<string>(), from = new Map<string, string>();
    for (const st of sf.statements) {
      const isExported = ts.canHaveModifiers(st) && !!ts.getModifiers(st)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      const names = ts.isVariableStatement(st) ? st.declarationList.declarations.flatMap((d) => (ts.isIdentifier(d.name) ? [d.name.text] : []))
        : (ts.isClassDeclaration(st) || ts.isFunctionDeclaration(st) || ts.isEnumDeclaration(st) || ts.isInterfaceDeclaration(st) || ts.isTypeAliasDeclaration(st)) && st.name ? [st.name.text] : [];
      for (const n of names) {
        local.set(n, ts.isInterfaceDeclaration(st) || ts.isTypeAliasDeclaration(st) ? 'type' : 'value');
        if (isExported) exported.add(n);
      }
      const spec = (ts.isImportDeclaration(st) || ts.isExportDeclaration(st)) && st.moduleSpecifier && ts.isStringLiteral(st.moduleSpecifier) ? st.moduleSpecifier.text : null;
      if (ts.isImportDeclaration(st) && spec) {
        const c = st.importClause;
        for (const n of [c?.name, c?.namedBindings && ts.isNamespaceImport(c.namedBindings) ? c.namedBindings.name : undefined, ...(c?.namedBindings && ts.isNamedImports(c.namedBindings) ? c.namedBindings.elements.map((e) => e.name) : [])]) {
          if (n) { local.set(n.text, 'value'); from.set(n.text, spec); }
        }
      } else if (ts.isExportDeclaration(st)) {
        if (!st.exportClause && spec) stars.add(spec);
        else if (st.exportClause && ts.isNamedExports(st.exportClause)) for (const e of st.exportClause.elements) {
          exported.add(e.name.text);
          if (spec && !e.propertyName) from.set(e.name.text, spec);
        }
      }
    }
    return { exported, local, stars, from };
  };
  const own = exportsOf(ts.createSourceFile(file, code, ts.ScriptTarget.Latest, false));
  const declared = exportsOf(ts.createSourceFile(`${stem}.d.ts`, readFileSync(`${stem}.d.ts`, 'utf8'), ts.ScriptTarget.Latest, false));
  const lines: string[] = [];
  for (const name of declared.exported) {
    if (own.exported.has(name)) continue;
    const spec = declared.from.get(name);
    if (own.local.has(name)) lines.push(`export { ${name} };`);
    else if (spec) lines.push(`export { ${name} } from ${JSON.stringify(spec)};`);
    else if (declared.local.get(name) === 'type') lines.push(`export type { ${name} } from ${JSON.stringify(`./${basename(stem)}`)};`);
  }
  for (const spec of declared.stars) if (!own.stars.has(spec)) lines.push(`export * from ${JSON.stringify(spec)};`);
  return lines.length ? `${code}\n${lines.join('\n')}\n` : code;
}
