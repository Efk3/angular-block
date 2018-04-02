import { Directive, ElementRef, Input, Type } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BlockService } from './block.service';
import { Subscription } from 'rxjs/Subscription';

/**
 * Directive driven block
 *
 * Block will be triggered every time when the [k3Block] input changes
 * Only promises and observables are accepted as input
 *
 * The blocker component can be specified by [k3BlockerComponent] input
 * Data for blocker component can be specified by [k3BlockData] input
 */
@Directive({
  selector: '[k3Block]',
})
export class BlockDirective {
  @Input() public k3BlockerComponent: Type<any>;
  @Input() public k3BlockData: any;
  private subscriptions = new Set<Subscription>();

  constructor(private blockService: BlockService, private elementRef: ElementRef) {}

  @Input()
  set k3Block(trigger: Subscription | Promise<any> | Observable<any>) {
    if (!trigger) {
      return;
    }

    const config = {
      target: this.elementRef,
      component: this.k3BlockerComponent,
      data: this.k3BlockData,
    };

    if (trigger instanceof Observable) {
      const subscription = this.blockService
        .block({
          observable: trigger,
          ...config,
        })
        .subscribe(null, () => this.removeSubscription(subscription), () => this.removeSubscription(subscription));
      this.subscriptions.add(subscription);
    } else if (trigger instanceof Promise) {
      this.blockService.block({
        promise: trigger,
        ...config,
      });
    } else if (trigger instanceof Subscription) {
      this.blockService.block({
        subscription: trigger,
        ...config,
      });
    } else {
      throw new Error('Only Observable and Promise are accepted as trigger!');
    }
  }

  private removeSubscription(subscription: Subscription) {
    subscription.unsubscribe();
    this.subscriptions.delete(subscription);
  }
}
