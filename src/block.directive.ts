import { Directive, ElementRef, Input, Type } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { BlockService } from './block.service';
import { Trigger } from './model';

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
  set k3Block(trigger: Trigger) {
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
          trigger,
          ...config,
        })
        .subscribe(null, () => this.removeSubscription(subscription), () => this.removeSubscription(subscription));
      this.subscriptions.add(subscription);
    } else if (trigger instanceof Promise || trigger instanceof Subscription) {
      this.blockService.block({
        trigger,
        ...config,
      });
    } else {
      throw new Error('Only observables, promises and subscriptions are accepted as trigger!');
    }
  }

  private removeSubscription(subscription: Subscription) {
    subscription.unsubscribe();
    this.subscriptions.delete(subscription);
  }
}
