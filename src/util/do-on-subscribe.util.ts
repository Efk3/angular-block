import { Observable, defer } from 'rxjs';

/**
 * Observable operator for onSubscribe event support
 */
export function doOnSubscribe<T>(onSubscribe: () => void): (source: Observable<T>) => Observable<T> {
  return function inner(source: Observable<T>): Observable<T> {
    return defer(() => {
      onSubscribe();

      return source;
    });
  };
}
