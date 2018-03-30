import { BlockInput } from './block-input.interface';

/**
 * Promise trigger interface for block method
 */
export interface PromiseBlockInput<T> extends BlockInput {
  promise: Promise<T>;
  callback?: () => void;
}
