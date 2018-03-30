import { InjectionToken, Type } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Target } from './model/target.type';

/**
 * Default global blocker component provider injection token
 */
export const BUSY_DEFAULT_GLOBAL_COMPONENT = new InjectionToken<Type<any>>('EFK3_BUSY_DEFAULT_GLOBAL_COMPONENT');

/**
 * Default specified target blocker component injection token
 */
export const BUSY_DEFAULT_SPECIFIED_COMPONENT = new InjectionToken<Type<any>>('EFK3_BUSY_DEFAULT_SPECIFIED_COMPONENT');

/**
 * Data from block config injection token
 */
export const BUSY_DATA = new InjectionToken<Object>('EFK3_BUSY_DATA');

/**
 * Blocker count observable injection token
 */
export const BUSY_BLOCKER_COUNT = new InjectionToken<Observable<number>>('EFK3_BUSY_BLOCKER_COUNT');

/**
 * Block target injection token
 */
export const BUSY_TARGET = new InjectionToken<Target>('EFK3_BUSY_TARGET');
