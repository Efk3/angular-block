import { ApplicationRef, ComponentFactoryResolver, EmbeddedViewRef, Inject, Injectable, Injector, Optional, Type } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { finalize } from 'rxjs/operators';
import { Block } from './block.interface';
import {
  BUSY_BLOCKER_COUNT,
  BUSY_TARGET,
  BUSY_DATA,
  BUSY_DEFAULT_GLOBAL_COMPONENT,
  BUSY_DEFAULT_SPECIFIED_COMPONENT,
} from './busy.provider';
import { doOnSubscribe } from './do-on-subscribe';
import { PortalInjector } from './portal-injector';
import { Target } from './target';
import { ObservableBlockInput, PromiseBlockInput, BlockInput } from './input-types';

@Injectable()
export class BusyService {
  private blocks = new WeakMap<Target, Block>();

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private applicationRef: ApplicationRef,
    private defaultInjector: Injector,
    @Optional()
    @Inject(BUSY_DEFAULT_GLOBAL_COMPONENT)
    private defaultGlobalComponent: Type<any>,
    @Optional()
    @Inject(BUSY_DEFAULT_SPECIFIED_COMPONENT)
    private defaultSpecifiedComponent: Type<any>
  ) {
    if (!defaultSpecifiedComponent) {
      this.defaultSpecifiedComponent = this.defaultGlobalComponent;
    }
  }

  /**
   * Block application or target(s)
   */
  public busy({ target = null, data = {}, component }: BlockInput = {}): void {
    for (const singleTarget of this.normalizeTargets(target)) {
      this.open(singleTarget, data, component);
    }
  }

  /**
   * Block application or target(s) by observable
   * The block effect will be triggered when the first subscription happens and will be completed when the observable completes or throws
   * an error
   */
  public busyObservable<T>({ observable, target, data, component }: ObservableBlockInput<T>): Observable<T> {
    return observable.pipe(doOnSubscribe(() => this.busy({ target, data, component })), finalize(() => this.done()));
  }

  /**
   * Block application or target(s) by promise
   * The block effect will be triggered instantly and will be completed when the promise returns or throws an error
   */
  public busyPromise<T>({ promise, target, data, component }: PromiseBlockInput<T>): Promise<T> {
    this.busy({ target, data, component });

    promise.then(() => this.done()).catch(() => this.done());

    return promise;
  }

  /**
   * Remove the block from application or target(s)
   */
  public done(target: Target | Target[] = null): void {
    for (const singleTarget of this.normalizeTargets(target)) {
      if (!this.modifyBlockerCount(singleTarget, -1)) {
        this.close(singleTarget);
      }
    }
  }

  /**
   * Get the count of blockers for the target as an observable
   */
  public getBlockerCount(target: Target): Observable<number> {
    if (!target) {
      return null;
    }

    return this.initOrGetBlock(target).count.asObservable();
  }

  /**
   * Get the count of blockers for the application as an observable
   */
  public getGlobalBlockerCount(): Observable<number> {
    return this.getBlockerCount(this.applicationRef);
  }

  private open(target: Target, data: any, component: Type<any>): void {
    if (!component) {
      component = target instanceof ApplicationRef ? this.defaultGlobalComponent : this.defaultSpecifiedComponent;
    }

    if (!component) {
      throw Error('Component is not defined for BusyModule!');
    }

    const block = this.initOrGetBlock(target);

    if (!this.blocks.get(target).component) {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
      const componentRef = componentFactory.create(new PortalInjector(this.defaultInjector, this.createInjectionMap(target, data)));
      const domElement = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;

      this.applicationRef.attachView(componentRef.hostView);

      if (target instanceof ApplicationRef) {
        // ApplicationRef
        document.body.appendChild(domElement);
      } else if (target['element']) {
        // ViewContainerRef
        target['element'].nativeElement.appendChild(domElement);
      } else if (target['nativeElement']) {
        // ElementRef
        target['nativeElement'].appendChild(domElement);
      }

      block.component = componentRef;
    }

    this.modifyBlockerCount(target, +1);
  }

  private close(target: Target): void {
    if (!this.blocks.has(target) || !this.blocks.get(target).component) {
      return;
    }

    this.blocks.get(target).component.destroy();

    if (this.blocks.get(target).count.observers.length === 0) {
      this.blocks.get(target).count.complete();
      this.blocks.delete(target);
    } else {
      this.blocks.get(target).component = null;
    }
  }

  /**
   * Util functions
   */
  private initOrGetBlock(target: Target): Block {
    if (!this.blocks.has(target)) {
      this.blocks.set(target, { component: null, count: new BehaviorSubject<number>(0) });
    }

    return this.blocks.get(target);
  }

  private modifyBlockerCount(target: Target, count: number): number {
    if (!this.blocks.has(target)) {
      return 0;
    }

    this.blocks.get(target).count.next(Math.max(0, this.blocks.get(target).count.value + count));

    return this.blocks.get(target).count.value;
  }

  private normalizeTargets(targets: Target | Target[]): Target[] {
    if (targets && !Array.isArray(targets)) {
      return [targets];
    }

    if (Array.isArray(targets)) {
      return targets;
    }

    return [this.applicationRef];
  }

  private createInjectionMap(target: Target, data: any = {}): WeakMap<any, any> {
    const map = new WeakMap<any, any>();
    map.set(BUSY_DATA, data);
    map.set(BUSY_BLOCKER_COUNT, this.blocks.get(target).count.asObservable());
    map.set(BUSY_TARGET, target);

    return map;
  }
}
