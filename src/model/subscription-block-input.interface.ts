import { BlockInput } from './block-input.interface';
import { Subscription } from 'rxjs/Subscription';

/**
 * Subscription trigger interface for block method
 */
export interface SubscriptionBlockInput extends BlockInput {
  subscription: Subscription;
  callback?: () => void;
}
