import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostBinding,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Trigger } from '@flogo-web/core';
import { DeleteEvent } from '../delete-event';
import { ResourceWithPlugin } from '../../core/resource-with-plugin';

@Component({
  selector: 'flogo-apps-resource-views-by-trigger',
  templateUrl: 'group-by-trigger.component.html',
  styleUrls: ['../group.component.less', 'group-by-trigger.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourcesGroupByTriggerComponent {
  @Input() public resources: Array<ResourceWithPlugin> = [];
  @Input() public trigger: Trigger;
  @Input() public iconUrl?: string;
  @Output() public resourceSelected = new EventEmitter<ResourceWithPlugin>();
  @Output() public deleteResource = new EventEmitter<DeleteEvent>();
  @Output() public addResource = new EventEmitter<Trigger>();
  @HostBinding('class.flogo-group') hostClass = true;

  onSelect(resource: ResourceWithPlugin) {
    this.resourceSelected.emit(resource);
  }

  onDeleteResource(resource: ResourceWithPlugin) {
    this.deleteResource.emit({
      triggerId: this.trigger ? this.trigger.id : null,
      resource,
    });
  }

  onAddResource() {
    this.addResource.emit(this.trigger);
  }
}
