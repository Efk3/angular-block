import { Observable, Subscription } from 'rxjs';

export type Trigger = Subscription | Observable<any> | Promise<any>;
