import { Observable } from 'rxjs';
import { BlockInput } from './block-input.interface';

/**
 * Observable trigger interface for block method
 */
export interface ObservableBlockInput<T> extends BlockInput {
  observable: Observable<T>;
  callback?: () => void;
}
