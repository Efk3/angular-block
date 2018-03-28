import { Type } from '@angular/core';
import { Target } from './target.type';

export interface BlockInput {
  target?: Target | Target[];
  data?: any;
  component?: Type<any>;
}
