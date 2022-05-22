import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostBinding,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Trigger } from '@flogo-web/core';
import { ResourceWithPlugin } from '../../core/resource-with-plugin';
import { DeleteEvent } from '../delete-event';

@Component({
  selector: 'flogo-apps-resource-views-by-resource',
  templateUrl: 'group-by-resource.component.html',
  styleUrls: ['../group.component.less', 'group-by-resource.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourcesGroupByResourceComponent {
  @Input() public resource: ResourceWithPlugin;
  @Input() public triggers: Trigger[] | null;
  @Output() public resourceSelected = new EventEmitter<ResourceWithPlugin>();
  @Output() public deleteResource = new EventEmitter<DeleteEvent>();
  @HostBinding('class.flogo-group') hostClass = true;

  onSelect(resource: ResourceWithPlugin) {
    this.resourceSelected.emit(resource);
  }

  onDeleteFlow(resource: ResourceWithPlugin) {
    this.deleteResource.emit({ triggerId: null, resource: resource });
  }
}
