import { Component, Input } from '@angular/core';
import { MapperController } from '@flogo-web/lib-client/mapper';

@Component({
  selector: 'flogo-flow-task-configurator-settings',
  templateUrl: 'settings.component.html',
})
export class SettingsComponent {
  @Input() mapperController: MapperController;
}
