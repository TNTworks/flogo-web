import {
  Component,
  ChangeDetectionStrategy,
  Input,
  EventEmitter,
  Output,
} from '@angular/core';

export type ResourceViewType = 'resources' | 'triggers';

@Component({
  selector: 'flogo-resource-views-selector',
  templateUrl: './resource-views-selector.component.html',
  styleUrls: ['./resource-views-selector.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceViewsSelectorComponent {
  isOpen = false;
  @Input() viewType: ResourceViewType;
  @Output() changeView = new EventEmitter<ResourceViewType>();

  closeViewsDropdown() {
    this.isOpen = false;
  }

  toggleViewsDropdown() {
    this.isOpen = !this.isOpen;
  }

  get selectedViewTranslateKey() {
    return this.viewType === 'resources'
      ? 'DETAILS-VIEW-MENU:FLOWS'
      : 'DETAILS-VIEW-MENU:TRIGGERS';
  }

  showDetailsView(viewType: ResourceViewType) {
    this.changeView.emit(viewType);
    this.isOpen = false;
  }
}
