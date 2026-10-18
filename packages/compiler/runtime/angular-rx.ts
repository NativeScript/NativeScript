import { Observable, type OperatorFunction, ReplaySubject, type Subscription } from 'rxjs';
import { DestroyRef, effect, inject, InjectionToken, type Signal, signal } from '@angular/core';
import {
  KitActivatedRoute,
  KitHttpClient,
  KitNativeDialogRef,
  KitNativeDialogService,
  KitRouter,
  NavigationEnd,
  type RxObservable,
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

export class HttpHeaders {
  readonly headers?: Record<string, string>;
  constructor(headers?: Record<string, string>) {
    this.headers = headers;
  }
}

export class HttpClient {
  static readonly shared = new HttpClient();
  get<T = any>(url: string, options?: { headers?: Record<string, string> | HttpHeaders; responseType?: 'json' }): Observable<T>;
  get(url: string, options: { headers?: Record<string, string> | HttpHeaders; responseType: 'text' }): Observable<string>;
  get(url: string, options?: any): Observable<any> {
    return fromKit(KitHttpClient.shared.get(url, options));
  }
}

export function withInterceptorsFromDi(): any {
  return undefined;
}

export class ActivatedRoute {
  readonly _kit: KitActivatedRoute;
  readonly snapshot: { params: Record<string, string> };
  readonly params: Observable<Record<string, string>>;
  constructor(kit: KitActivatedRoute = KitActivatedRoute.current) {
    this._kit = kit;
    this.snapshot = { params: kit.snapshot.params };
    this.params = fromKit(kit.params);
  }
  static get shared(): ActivatedRoute {
    return new ActivatedRoute(KitActivatedRoute.current);
  }
}

export { NavigationEnd };
export type Event = NavigationEnd;

export class Router {
  static readonly shared = new Router();
  readonly events: Observable<Event> = fromKit(KitRouter.shared.events);
  get url(): string {
    return KitRouter.shared.url;
  }
  get router(): Router {
    return this;
  }
  navigate(commands: any[], extras?: any): Promise<boolean> {
    return KitRouter.shared.navigate(commands, extras);
  }
  navigateByUrl(url: string, extras?: any): Promise<boolean> {
    return KitRouter.shared.navigateByUrl(url, extras);
  }
  back(options?: { relativeTo?: any; outlets?: string[] }): void {
    KitRouter.shared.back(options);
  }
  canGoBack(): boolean {
    return KitRouter.shared.canGoBack();
  }
}

export type Routes = {
  path: string;
  component?: any;
  redirectTo?: string;
  pathMatch?: string;
  outlet?: string;
  children?: Routes;
  loadChildren?: () => Promise<any>;
  loadComponent?: () => Promise<any>;
}[];

export type NavigationExtras = any;
export { Router as RouterExtensions };

export type NativeDialogConfig = any;
export const NATIVE_DIALOG_DATA = new InjectionToken<any>('NativeDialogData');

export class NativeDialogRef<T = any, R = any> {
  readonly _kit: KitNativeDialogRef;
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
  open<T = any, R = any>(component: any, config?: NativeDialogConfig): NativeDialogRef<T, R> {
    return new NativeDialogRef(KitNativeDialogService.shared.open(component, config));
  }
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
export function provideNativeScriptHttpClient(..._features: any[]): any {
  return undefined;
}
export function provideNativeScriptRouter(_routes: any): any {
  return undefined;
}
export function bootstrapApplication(_component: any, _options?: any): Promise<any> {
  return Promise.resolve();
}
export const NativeScriptCommonModule: any = undefined;
export const NativeScriptModule: any = undefined;
export const NativeScriptRouterModule = {
  forRoot(_routes: any): any {
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
export function runNativeScriptAngularApp(_options: any): void {}
export const PageRouterOutlet: any = undefined;

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
