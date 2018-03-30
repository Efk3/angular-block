import { Injector } from '@angular/core';

/**
 * Extended injector class for custom injections support
 * It is based on @angular/cdk PortalInjector class
 */
export class BlockComponentInjector implements Injector {
  constructor(private injector: Injector, private tokens: WeakMap<any, any>) {}

  public get(token: any, notFoundValue?: any): any {
    if (this.tokens.has(token)) {
      return this.tokens.get(token);
    }

    return this.injector.get<any>(token, notFoundValue);
  }
}
