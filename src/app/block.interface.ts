import { ComponentRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export interface Block {
  component: ComponentRef<any>;
  count: BehaviorSubject<number>;
}
