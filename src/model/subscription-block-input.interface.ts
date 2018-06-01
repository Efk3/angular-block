import { Subscription } from 'rxjs';
import { BlockInput } from './block-input.interface';

/**
 * Subscription trigger interface for block method
 */
export interface SubscriptionBlockInput extends BlockInput {
  subscription: Subscription;
  callback?: () => void;
}
