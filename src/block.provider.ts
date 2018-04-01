import { InjectionToken, Type } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Target } from './model/target.type';

/**
 * Default global blocker component provider injection token
 */
export const BLOCK_DEFAULT_GLOBAL_COMPONENT = new InjectionToken<Type<any>>('EFK3_BLOCK_DEFAULT_GLOBAL_COMPONENT');

/**
 * Default specified target blocker component injection token
 */
export const BLOCK_DEFAULT_SPECIFIED_COMPONENT = new InjectionToken<Type<any>>('EFK3_BLOCK_DEFAULT_SPECIFIED_COMPONENT');

/**
 * Data from block config injection token
 */
export const BLOCK_DATA = new InjectionToken<Object>('EFK3_BLOCK_DATA');

/**
 * Blocker count observable injection token
 */
export const BLOCK_BLOCKER_COUNT = new InjectionToken<Observable<number>>('EFK3_BLOCK_BLOCKER_COUNT');

/**
 * Block target injection token
 */
export const BLOCK_TARGET = new InjectionToken<Target>('EFK3_BLOCK_TARGET');
