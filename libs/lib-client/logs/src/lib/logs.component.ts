import { Component } from '@angular/core';
import { ChildWindowService, ChildWindow } from '@flogo-web/lib-client/core';

@Component({
  selector: 'flogo-logs',
  // moduleId: module.id,
  templateUrl: 'logs.component.html',
  styleUrls: ['logs.component.less'],
})
export class LogsComponent {
  messages: string[];
  searchValue = '';
  isOpen = false;
  childWindow: ChildWindow = null;

  constructor(private windowService: ChildWindowService) {
    this.childWindow = windowService.getChildWindow();
  }

  public windowAction(event) {
    switch (event) {
      case 'close':
        this.closeLogs();
        break;

      case 'maximize':
        this.closeLogs();
        setTimeout(() => this.open(), 100);
        break;

      case 'back':
        break;
    }
  }

  public toggleLogs() {
    if (this.isChildWindowOpen()) {
      this.open();
    } else {
      this.isOpen = !this.isOpen;
    }
  }

  public showLogs() {
    this.isOpen = true;
  }

  public closeLogs() {
    this.isOpen = false;
  }

  // --------- windows service

  public isChildWindowOpen() {
    return this.childWindow && this.childWindow.isOpen();
  }

  open() {
    if (!this.windowService.isSupported()) {
      console.log('Child window not supported');
      return;
    } else if (this.childWindow && this.childWindow.isOpen()) {
      return this.childWindow.focus();
    }

    this.childWindow = this.windowService.open('/logs?nonav=true', 'logs');
    this.childWindow.closed.subscribe(e => {
      this.childWindow = null;
    });
  }
}
