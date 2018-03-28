import { InjectionToken, Type } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Target } from './model/target.type';

export const BUSY_DEFAULT_GLOBAL_COMPONENT = new InjectionToken<Type<any>>('EFK3_BUSY_DEFAULT_GLOBAL_COMPONENT');
export const BUSY_DEFAULT_SPECIFIED_COMPONENT = new InjectionToken<Type<any>>('EFK3_BUSY_DEFAULT_SPECIFIED_COMPONENT');
export const BUSY_DATA = new InjectionToken<Object>('EFK3_BUSY_DATA');
export const BUSY_BLOCKER_COUNT = new InjectionToken<Observable<number>>('EFK3_BUSY_BLOCKER_COUNT');
export const BUSY_TARGET = new InjectionToken<Target>('EFK3_BUSY_TARGET');
