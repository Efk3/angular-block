import { BlockInput } from './block-input.interface';
import { Trigger } from './trigger.type';

export interface TriggerBlockInput<T extends Trigger> extends BlockInput<T> {
  trigger?: T;
  callback?: () => void;
}
