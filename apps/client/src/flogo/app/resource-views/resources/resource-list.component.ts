import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ResourceWithPlugin } from '../../core/resource-with-plugin';

@Component({
  selector: 'flogo-apps-resource-list',
  template: `
    <flogo-apps-resource
      class="resource qa-resource"
      *ngFor="let resource of resources; trackBy: trackByResourceId"
      [resource]="resource"
      (resourceSelected)="resourceSelected.emit($event)"
      (deleteResource)="deleteResource.emit($event)"
    ></flogo-apps-resource>
  `,
  styles: [
    `
      .resource + .resource {
        border-top: none;
      }

      .resource:not(:first-of-type) {
        border-top-right-radius: 0;
        border-top-left-radius: 0;
      }

      .resource:not(:last-of-type) {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceListComponent {
  @Input()
  public resources: Array<ResourceWithPlugin> = [];
  @Output()
  public resourceSelected = new EventEmitter<ResourceWithPlugin>();
  @Output()
  public deleteResource = new EventEmitter<ResourceWithPlugin>();
  trackByResourceId(index: number, resource: ResourceWithPlugin) {
    return resource ? resource.id : null;
  }
}
