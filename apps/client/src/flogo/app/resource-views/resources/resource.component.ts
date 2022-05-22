import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ChangeDetectionStrategy,
  ViewChild,
  HostListener,
} from '@angular/core';
import { ResourceWithPlugin } from '../../core/resource-with-plugin';

@Component({
  selector: 'flogo-apps-resource',
  templateUrl: 'resource.component.html',
  styleUrls: ['resource.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceComponent {
  @Input() public resource: ResourceWithPlugin;
  @Output() public resourceSelected = new EventEmitter<ResourceWithPlugin>();
  @Output() public deleteResource = new EventEmitter<ResourceWithPlugin>();
  @ViewChild('deleteBox', { static: true }) removeBox: ElementRef;

  @HostListener('click', ['$event'])
  onSelect(event: Event) {
    const wasRemoveButtonClicked =
      event.target === this.removeBox.nativeElement ||
      this.removeBox.nativeElement.contains(event.target);
    if (!wasRemoveButtonClicked) {
      this.resourceSelected.emit(this.resource);
    }
  }

  onDeleteResource(resource: ResourceWithPlugin) {
    this.deleteResource.emit(resource);
  }
}
