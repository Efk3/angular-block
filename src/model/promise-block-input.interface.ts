import { BlockInput } from './block-input.interface';

export interface PromiseBlockInput<T> extends BlockInput {
  promise: Promise<T>;
  callback?: () => void;
}
