import { Subscription } from 'rxjs';
import { BlockInput } from './block-input.interface';

/**
 * Subscription trigger interface for block method
 */
export interface SubscriptionBlockInput extends BlockInput<Subscription> {
  /**
   * @deprecated in 1.2.0 and will be removed in 2.0.0. Use 'trigger' instead.
   */
  subscription: Subscription;
  callback?: () => void;
}
