import { BlockInput } from './block-input.interface';

/**
 * Promise trigger interface for block method
 */
export interface PromiseBlockInput<T> extends BlockInput<T> {
  /**
   * @deprecated in 1.2.0 and will be removed in 2.0.0. Use 'trigger' instead.
   */
  promise: Promise<T>;
  callback?: () => void;
}
