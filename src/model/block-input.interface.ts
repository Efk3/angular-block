import { Type } from '@angular/core';
import { Target } from './target.type';

/**
 * Base interface for block method
 */
export interface BlockInput<T> {
  target?: Target | Target[];
  data?: any;
  component?: Type<any>;
  callback?: () => void;
}
