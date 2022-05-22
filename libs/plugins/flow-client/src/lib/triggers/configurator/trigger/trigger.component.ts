import {
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { IconProvider } from '@flogo-web/lib-client/diagram';
import { TriggerStatus } from '@flogo-web/lib-client/trigger-shared';

@Component({
  selector: 'flogo-triggers-configure-trigger',
  templateUrl: 'trigger.component.html',
  styleUrls: ['trigger.component.less'],
})
export class ConfigureTriggerComponent {
  @Input()
  selectedTriggerId: string;
  @Input()
  triggerData: TriggerStatus;
  @Input() iconProvider?: IconProvider;
  @Output()
  selectTrigger: EventEmitter<string> = new EventEmitter<string>();

  @HostBinding('class.is-selected')
  get isSelected() {
    if (!this.triggerData || !this.selectedTriggerId) {
      return false;
    }
    return this.selectedTriggerId === this.triggerData.id;
  }

  @HostListener('click')
  onTriggerSelect() {
    this.selectTrigger.emit(this.triggerData.id);
  }
}
