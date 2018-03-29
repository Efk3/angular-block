import { Observable } from 'rxjs/Observable';
import { BlockInput } from './block-input.interface';

export interface ObservableBlockInput<T> extends BlockInput {
  observable: Observable<T>;
  callback?: () => void;
}
