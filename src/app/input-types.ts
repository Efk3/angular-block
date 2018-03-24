import { Type } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Target } from './target';

export interface BlockInput {
  target?: Target | Target[];
  data?: any;
  component?: Type<any>;
}

export interface ObservableBlockInput<T> extends BlockInput {
  observable: Observable<T>;
}

export interface PromiseBlockInput<T> extends BlockInput {
  promise: Promise<T>;
}
