import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  TriggerConfigureTab,
  TriggerConfigureTabType,
} from '../../../../core/interfaces';

@Component({
  selector: 'flogo-stream-triggers-configurator-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.less'],
})
export class TabsComponent {
  @Input() tabs: TriggerConfigureTab;
  @Input() currentTabType: TriggerConfigureTabType;
  @Output() tabSelected = new EventEmitter<TriggerConfigureTab>();

  selectTab(tab: TriggerConfigureTab) {
    if (tab.isEnabled) {
      this.tabSelected.emit(tab);
    }
  }

  trackTabsByFn(index, tab: TriggerConfigureTab) {
    return tab.type;
  }
}
