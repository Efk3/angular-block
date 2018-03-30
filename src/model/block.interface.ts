import { ComponentRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

/**
 * Inner class for store number of blocks and blocker component
 */
export interface Block {
  component: ComponentRef<any>;
  count: BehaviorSubject<number>;
}
