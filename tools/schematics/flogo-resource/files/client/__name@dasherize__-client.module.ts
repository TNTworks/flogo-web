import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DiagramModule } from '@flogo-web/lib-client/diagram';
import { MainComponent } from './main/main.component';

@NgModule({
  imports: [
    CommonModule,
    DiagramModule,
    RouterModule.forChild([
      {path: '', pathMatch: 'full', component: MainComponent}
    ]),
  ],
  declarations: [MainComponent],
})
export class <%= classify(name) %>ClientModule {}
