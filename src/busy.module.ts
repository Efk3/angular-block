import { ModuleWithProviders, NgModule } from '@angular/core';
import { BusyService } from './busy.service';

@NgModule({})
export class BusyModule {
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: BusyModule,
      providers: [BusyService],
    };
  }
}
