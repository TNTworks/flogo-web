import { NgModule } from '@angular/core';
import { MapperIconsService } from './mapper-icons.service';
import { MapperIconsComponent } from './mapper-icons.component';

@NgModule({
  declarations: [MapperIconsComponent],
  exports: [MapperIconsComponent],
  providers: [MapperIconsService],
})
export class MapperIconsModule {}
