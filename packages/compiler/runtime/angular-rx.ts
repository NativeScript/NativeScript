import { Observable, type OperatorFunction, ReplaySubject, type Subscription } from 'rxjs';
import { DestroyRef, effect, inject, InjectionToken, type Signal, signal } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  bootstrapApplication,
  convertToParamMap,
  createRouterStateSnapshot,
  DefaultUrlSerializer,
  HTTP_INTERCEPTORS,
  HttpClientModule,
  HttpContext,
  HttpContextToken,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
  HttpRequest,
  HttpResponse,
  HttpStatusCode,
  KitActivatedRoute,
  KitHttpClient,
  KitNativeDialogRef,
  KitNativeDialogService,
  KitRouter,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  ParamMap,
  provideHttpClient,
  provideNativeScriptHttpClient,
  provideNativeScriptNgZone,
  provideNativeScriptRouter,
  provideRouter,
  ResolveEnd,
  ResolveStart,
  RoutesRecognized,
  runNativeScriptAngularApp,
  type RxObservable,
  UrlSegment,
  UrlTree,
  withFetch,
  withInterceptors,
  withInterceptorsFromDi,
} from '@nativescript/release';

export function fromKit<T>(kit: RxObservable<T>): Observable<T> {
  return new Observable<T>((subscriber) => {
    const sub = kit.subscribe(
      (value) => subscriber.next(value),
      (err) => subscriber.error(err),
      () => subscriber.complete(),
    );
    return () => sub.unsubscribe();
  });
}

export {
  ActivatedRouteSnapshot,
  bootstrapApplication,
  convertToParamMap,
  createRouterStateSnapshot,
  DefaultUrlSerializer,
  HTTP_INTERCEPTORS,
  HttpClientModule,
  HttpContext,
  HttpContextToken,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
  HttpRequest,
  HttpResponse,
  HttpStatusCode,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  ParamMap,
  provideHttpClient,
  provideNativeScriptHttpClient,
  provideNativeScriptNgZone,
  provideNativeScriptRouter,
  provideRouter,
  ResolveEnd,
  ResolveStart,
  RoutesRecognized,
  runNativeScriptAngularApp,
  UrlSegment,
  UrlTree,
  withFetch,
  withInterceptors,
  withInterceptorsFromDi,
};

export interface HttpHandler {
  handle(req: HttpRequest<any>): Observable<any>;
}

export interface HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any>;
}

export type HttpInterceptorFn = (req: HttpRequest<any>, next: (req: HttpRequest<any>) => Observable<any>) => Observable<any>;

export class HttpClient {
  static readonly shared = new HttpClient();

  request<T = any>(first: string | HttpRequest<any>, url?: string, options?: any): Observable<T> {
    if (first instanceof HttpRequest) {
      const interceptors = inject<HttpInterceptor[]>(HTTP_INTERCEPTORS as any, { optional: true } as any);
      if (Array.isArray(interceptors) && interceptors.length > 0) {
        let handler: HttpHandler = {
          handle: (r: HttpRequest<any>) => fromKit(KitHttpClient.shared.request(r)),
        };
        for (let i = interceptors.length - 1; i >= 0; i--) {
          const interceptor = interceptors[i];
          if (interceptor && typeof interceptor.intercept === 'function') {
            const next = handler;
            handler = { handle: (r: HttpRequest<any>) => interceptor.intercept(r, next) };
          }
        }
        return handler.handle(first);
      }
      return fromKit(KitHttpClient.shared.request(first));
    }
    const interceptors = inject<HttpInterceptor[]>(HTTP_INTERCEPTORS as any, { optional: true } as any);
    if (Array.isArray(interceptors) && interceptors.length > 0) {
      const observe = options?.observe || 'body';
      const req = new HttpRequest(first, url || '', options?.body ?? null, options);
      let handler: HttpHandler = {
        handle: (r: HttpRequest<any>) => fromKit(KitHttpClient.shared.request(r)),
      };
      for (let i = interceptors.length - 1; i >= 0; i--) {
        const interceptor = interceptors[i];
        if (interceptor && typeof interceptor.intercept === 'function') {
          const next = handler;
          handler = { handle: (r: HttpRequest<any>) => interceptor.intercept(r, next) };
        }
      }
      return new Observable<T>((subscriber) => {
        const sub = handler.handle(req).subscribe({
          next: (event: any) => {
            if (observe === 'response' || observe === 'events') {
              subscriber.next(event);
            } else if (event instanceof HttpResponse) {
              subscriber.next(event.body);
            } else {
              subscriber.next(event);
            }
          },
          error: (err: any) => subscriber.error(err),
          complete: () => subscriber.complete(),
        });
        return () => sub.unsubscribe();
      });
    }
    return fromKit(KitHttpClient.shared.request(first, url, options));
  }

  get(url: string, options: { headers?: Record<string, string> | HttpHeaders; responseType: 'text'; params?: any; observe?: any; context?: HttpContext }): Observable<string>;
  get<T = any>(url: string, options?: any): Observable<T>;
  get(url: string, options?: any): Observable<any> {
    const interceptors = inject<HttpInterceptor[]>(HTTP_INTERCEPTORS as any, { optional: true } as any);
    if (Array.isArray(interceptors) && interceptors.length > 0) {
      return this.request('GET', url, options);
    }
    return fromKit(KitHttpClient.shared.get(url, options));
  }

  delete<T = any>(url: string, options?: any): Observable<T> {
    const interceptors = inject<HttpInterceptor[]>(HTTP_INTERCEPTORS as any, { optional: true } as any);
    if (Array.isArray(interceptors) && interceptors.length > 0) {
      return this.request('DELETE', url, options);
    }
    return fromKit(KitHttpClient.shared.delete(url, options));
  }

  head<T = any>(url: string, options?: any): Observable<T> {
    const interceptors = inject<HttpInterceptor[]>(HTTP_INTERCEPTORS as any, { optional: true } as any);
    if (Array.isArray(interceptors) && interceptors.length > 0) {
      return this.request('HEAD', url, options);
    }
    return fromKit(KitHttpClient.shared.head(url, options));
  }

  options<T = any>(url: string, options?: any): Observable<T> {
    const interceptors = inject<HttpInterceptor[]>(HTTP_INTERCEPTORS as any, { optional: true } as any);
    if (Array.isArray(interceptors) && interceptors.length > 0) {
      return this.request('OPTIONS', url, options);
    }
    return fromKit(KitHttpClient.shared.options(url, options));
  }

  post<T = any>(url: string, body: any, options?: any): Observable<T> {
    const interceptors = inject<HttpInterceptor[]>(HTTP_INTERCEPTORS as any, { optional: true } as any);
    if (Array.isArray(interceptors) && interceptors.length > 0) {
      return this.request('POST', url, { ...(options || {}), body });
    }
    return fromKit(KitHttpClient.shared.post(url, body, options));
  }

  put<T = any>(url: string, body: any, options?: any): Observable<T> {
    const interceptors = inject<HttpInterceptor[]>(HTTP_INTERCEPTORS as any, { optional: true } as any);
    if (Array.isArray(interceptors) && interceptors.length > 0) {
      return this.request('PUT', url, { ...(options || {}), body });
    }
    return fromKit(KitHttpClient.shared.put(url, body, options));
  }

  patch<T = any>(url: string, body: any, options?: any): Observable<T> {
    const interceptors = inject<HttpInterceptor[]>(HTTP_INTERCEPTORS as any, { optional: true } as any);
    if (Array.isArray(interceptors) && interceptors.length > 0) {
      return this.request('PATCH', url, { ...(options || {}), body });
    }
    return fromKit(KitHttpClient.shared.patch(url, body, options));
  }

  jsonp<T = any>(url: string, callbackParam: string): Observable<T> {
    return fromKit(KitHttpClient.shared.jsonp(url, callbackParam));
  }
}

export class ActivatedRoute {
  readonly _kit: KitActivatedRoute;
  readonly snapshot: ActivatedRouteSnapshot;
  readonly params: Observable<Record<string, string>>;
  readonly queryParams: Observable<Record<string, string>>;
  readonly data: Observable<Record<string, any>>;
  readonly paramMap: Observable<ParamMap>;
  readonly queryParamMap: Observable<ParamMap>;
  readonly fragment: Observable<string | null>;
  readonly title: Observable<string | undefined>;
  readonly outlet: string;
  readonly routeConfig: any;

  constructor(kit: KitActivatedRoute = KitActivatedRoute.current) {
    this._kit = kit;
    this.snapshot = kit.snapshot;
    this.params = fromKit(kit.params);
    this.queryParams = fromKit(kit.queryParams);
    this.data = fromKit(kit.data);
    this.paramMap = fromKit(kit.paramMap);
    this.queryParamMap = fromKit(kit.queryParamMap);
    this.fragment = fromKit(kit.fragment);
    this.title = fromKit(kit.title);
    this.outlet = kit.outlet;
    this.routeConfig = kit.routeConfig;
  }

  get root(): ActivatedRoute {
    return this;
  }

  get parent(): ActivatedRoute | null {
    return null;
  }

  get firstChild(): ActivatedRoute | null {
    return null;
  }

  get children(): ActivatedRoute[] {
    return [];
  }

  get pathFromRoot(): ActivatedRoute[] {
    return [this];
  }

  static get shared(): ActivatedRoute {
    return new ActivatedRoute(KitActivatedRoute.current);
  }
}

export type Event = NavigationEnd | NavigationStart | NavigationCancel | NavigationError | RoutesRecognized | ResolveStart | ResolveEnd;

export class Router {
  static readonly shared = new Router();
  readonly events: Observable<Event> = fromKit(KitRouter.shared.events);

  get url(): string {
    return KitRouter.shared.url;
  }

  get router(): Router {
    return this;
  }

  get routerState(): any {
    return KitRouter.shared.routerState;
  }

  createUrlTree(commands: any[], extras?: any): UrlTree {
    return KitRouter.shared.createUrlTree(commands, extras);
  }

  serializeUrl(url: UrlTree): string {
    return KitRouter.shared.serializeUrl(url);
  }

  parseUrl(url: string): UrlTree {
    return KitRouter.shared.parseUrl(url);
  }

  isActive(url: string | UrlTree, exact: any = false): boolean {
    return KitRouter.shared.isActive(url, exact);
  }

  navigate(commands: any[], extras?: any): Promise<boolean> {
    return KitRouter.shared.navigate(commands, extras);
  }

  navigateByUrl(url: string | UrlTree, extras?: any): Promise<boolean> {
    return KitRouter.shared.navigateByUrl(url, extras);
  }

  back(options?: { relativeTo?: any; outlets?: string[] }): void {
    KitRouter.shared.back(options);
  }

  backToPreviousPage(): void {
    KitRouter.shared.backToPreviousPage();
  }

  canGoBack(options?: any): boolean {
    return KitRouter.shared.canGoBack(options);
  }

  canGoBackToPreviousPage(): boolean {
    return KitRouter.shared.canGoBackToPreviousPage();
  }
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
export type NavigationExtras = any;
export type ParamMapType = ParamMap;
export { Router as RouterExtensions };

export type NativeDialogConfig<D = any> = {
  data?: D;
  nativeOptions?: any;
  [key: string]: any;
};
export const NATIVE_DIALOG_DATA = new InjectionToken<any>('NativeDialogData');

export class NativeDialogRef<T = any, R = any> {
  readonly _kit: KitNativeDialogRef;
  readonly componentInstance: T = undefined as any;
  constructor(kit: KitNativeDialogRef = KitNativeDialogRef.current) {
    this._kit = kit;
  }
  static get shared(): NativeDialogRef<any, any> {
    return new NativeDialogRef(KitNativeDialogRef.current);
  }
  close(result?: R): void {
    this._kit.close(result);
  }
  afterClosed(): Observable<R | undefined> {
    return fromKit(this._kit.afterClosed());
  }
}

export class NativeDialogService {
  static readonly shared = new NativeDialogService();
  open<T = any, D = any, R = any>(component: any, config?: NativeDialogConfig<D>): NativeDialogRef<T, R> {
    return new NativeDialogRef(KitNativeDialogService.shared.open(component, config));
  }
  closeAll(): void {}
}

export { NativeDialogService as NativeDialog };

export const NativeDialogModule: any = undefined;
export function registerElement(_name: string, _resolver: () => any, _meta?: any): void {}
export const ActionBarComponent: any = undefined;
export const ActionItemDirective: any = undefined;
export const NavigationButtonDirective: any = undefined;
export const TabViewDirective: any = undefined;
export const TabViewItemDirective: any = undefined;
export const NSEmptyOutletComponent: any = undefined;
export const NativeScriptCommonModule: any = undefined;
export const NativeScriptFormsModule: any = undefined;
export const NativeScriptHttpClientModule: any = undefined;
export const NativeScriptModule: any = undefined;
export const NativeScriptRouterModule = {
  forRoot(_routes: any, _config?: any): any {
    return undefined;
  },
  forChild(_routes: any): any {
    return undefined;
  },
};
export function platformNativeScript(): { bootstrapModule(module: any, options?: any): Promise<any> } {
  return {
    bootstrapModule(_module: any, _options?: any): Promise<any> {
      return Promise.resolve();
    },
  };
}
export const PageRouterOutlet: any = undefined;
export const RouterOutlet: any = undefined;
export const RouterLink: any = undefined;
export const RouterLinkActive: any = undefined;
export const NSRouterLink: any = undefined;
export const NSRouterLinkActive: any = undefined;

export function toSignal<T>(source: Observable<T>, options: { initialValue: T; injector?: any; requireSync?: boolean; manualCleanup?: boolean; equal?: any }): Signal<T>;
export function toSignal<T>(source: Observable<T>, options: { requireSync: true; injector?: any; manualCleanup?: boolean; equal?: any }): Signal<T>;
export function toSignal<T>(source: Observable<T>, options?: { initialValue?: T; injector?: any; requireSync?: boolean; manualCleanup?: boolean; equal?: any }): Signal<T | undefined>;
export function toSignal<T>(source: Observable<T>, options?: { initialValue?: T; injector?: any; requireSync?: boolean; manualCleanup?: boolean; equal?: any }): Signal<any> {
  const sig = signal<any>(options?.initialValue);
  const sub = source.subscribe((value) => {
    sig.set(value);
  });
  if (!options?.manualCleanup) {
    inject(DestroyRef).onDestroy(() => {
      sub.unsubscribe();
    });
  }
  return sig.asReadonly();
}

export function toObservable<T>(source: Signal<T>, _options?: { injector?: any }): Observable<T> {
  const subject = new ReplaySubject<T>(1);
  const ref = effect(() => {
    subject.next(source());
  });
  inject(DestroyRef).onDestroy(() => {
    ref.destroy();
    subject.complete();
  });
  return subject.asObservable();
}

export function takeUntilDestroyed<T>(destroyRef?: DestroyRef): OperatorFunction<T, T> {
  const ref = destroyRef ?? inject(DestroyRef);
  return (source: Observable<T>) =>
    new Observable<T>((subscriber) => {
      const sub = source.subscribe({
        next: (value) => subscriber.next(value),
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      });
      const stop = ref.onDestroy(() => {
        sub.unsubscribe();
        subscriber.complete();
      });
      return () => {
        stop();
        sub.unsubscribe();
      };
    });
}

export class AsyncPipe {
  private source: Observable<any> | null | undefined = null;
  private sub: Subscription | null = null;
  private latest = signal<any>(null);

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.dispose();
    });
  }

  transform<T>(observable: Observable<T> | null | undefined): T | null {
    if (observable !== this.source) {
      this.dispose();
      this.source = observable;
      if (observable) {
        this.sub = observable.subscribe((value) => {
          this.latest.set(value);
        });
      }
    }
    return this.latest();
  }

  private dispose(): void {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = null;
    }
    this.source = null;
    this.latest.set(null);
  }
}
