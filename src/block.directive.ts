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
  set k3Block(trigger: Promise<any> | Observable<any>) {
    if (!trigger) {
      return;
    }

    const config = {
      target: this.elementRef,
      component: this.k3BlockerComponent,
      data: this.k3BlockData,
    };

    if ('subscribe' in trigger) {
      const subscription = this.blockService
        .block({
          observable: <Observable<any>>trigger,
          ...config,
        })
        .subscribe(null, () => this.removeSubscription(subscription), () => this.removeSubscription(subscription));
      this.subscriptions.add(subscription);

      return;
    }

    if ('then' in trigger) {
      this.blockService.block({
        promise: <Promise<any>>trigger,
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
