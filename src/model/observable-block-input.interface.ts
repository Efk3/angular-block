import { Observable } from 'rxjs';
import { BlockInput } from './block-input.interface';

/**
 * Observable trigger interface for block method
 */
export interface ObservableBlockInput<T> extends BlockInput<T> {
  /**
   * @deprecated in 1.2.0 and will be removed in 2.0.0. Use 'trigger' instead.
   */
  observable: Observable<T>;
  callback?: () => void;
}
