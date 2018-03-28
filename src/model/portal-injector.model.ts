/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injector } from '@angular/core';

export class PortalInjector implements Injector {
  constructor(private parentInjector: Injector, private customTokens: WeakMap<any, any>) {}

  public get(token: any, notFoundValue?: any): any {
    const value = this.customTokens.get(token);

    if (typeof value !== 'undefined') {
      return value;
    }

    return this.parentInjector.get<any>(token, notFoundValue);
  }
}
