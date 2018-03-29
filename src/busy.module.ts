import { ModuleWithProviders, NgModule } from '@angular/core';
import { BusyService } from './busy.service';
import { BusyDirective } from './busy.directive';

@NgModule({
  declarations: [BusyDirective],
  exports: [BusyDirective],
})
export class BusyModule {
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: BusyModule,
      providers: [BusyService],
    };
  }
}
