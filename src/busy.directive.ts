import { Directive, ElementRef, Input, Type } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BusyService } from './busy.service';
import { Subscription } from 'rxjs/Subscription';

/**
 * Directive driven block
 *
 * Block will be triggered every time when the [k3Busy] input changes
 * Only promises and observables are accepted as input
 *
 * The blocker component can be specified by [k3BusyComponent] input
 * Data for blocker component can be specified by [k3BusyData] input
 */
@Directive({
  selector: '[k3Busy]',
})
export class BusyDirective {
  @Input() public k3BusyComponent: Type<any>;
  @Input() public k3BusyData: any;
  private subscriptions = new Set<Subscription>();

  constructor(private busyService: BusyService, private elementRef: ElementRef) {}

  @Input()
  set k3Busy(busy: Promise<any> | Observable<any>) {
    if (!busy) {
      return;
    }

    const config = {
      target: this.elementRef,
      component: this.k3BusyComponent,
      data: this.k3BusyData,
    };

    if ('subscribe' in busy) {
      const subscription = this.busyService
        .busy({
          observable: <Observable<any>>busy,
          ...config,
        })
        .subscribe(null, () => this.removeSubscription(subscription), () => this.removeSubscription(subscription));
      this.subscriptions.add(subscription);

      return;
    }

    if ('then' in busy) {
      this.busyService.busy({
        promise: <Promise<any>>busy,
        ...config,
      });

      return;
    }

    throw new Error('Only Observable and Promise are accepted as trigger!');
  }

  private removeSubscription(subscription: Subscription) {
    subscription.unsubscribe();
    this.subscriptions.delete(subscription);
  }
}
