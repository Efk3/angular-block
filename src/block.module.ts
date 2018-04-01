import { ModuleWithProviders, NgModule } from '@angular/core';
import { BlockService } from './block.service';
import { BlockDirective } from './block.directive';

@NgModule({
  declarations: [BlockDirective],
  exports: [BlockDirective],
})
export class BlockModule {
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: BlockModule,
      providers: [BlockService],
    };
  }
}
