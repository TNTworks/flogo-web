import { Component } from '@angular/core';

@Component({
  selector: 'demo-context-panel',
  templateUrl: './context-panel.component.html',
  styleUrls: ['./context-panel.component.less'],
})
export class ContextPanelComponent {
  isOpen: boolean;
  title = 'Context Panel';
  triggerPosition = undefined;

  setPanelState(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  changeTitle() {
    this.title = 'I am a cool title';
  }

  changePosition() {
    this.triggerPosition = {
      left: '182px',
    };
  }
}
