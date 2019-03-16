import { Target } from './target.type';

export interface Unblock {
  callback: Function;
  ids: { target: Target; id: number }[];
}
