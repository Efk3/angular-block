import { ComponentRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Inner class for store number of blocks and blocker component
 */
export interface Block {
  id: number;
  component: ComponentRef<any>;
  count: BehaviorSubject<number>;
}
