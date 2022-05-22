import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LogService } from '@flogo-web/lib-client/core';

@Component({
  selector: 'flogo-logs-content',
  templateUrl: 'content.component.html',
  styleUrls: ['content.component.less'],
})
export class LogsContentComponent {
  @Output() windowAction: EventEmitter<string>;
  @Input() isExternal = false;
  messages: string[];
  searchValue = '';

  constructor(public logService: LogService) {
    this.windowAction = new EventEmitter();
  }

  close() {
    this.windowAction.emit('close');
  }

  back() {}

  maximize() {
    this.windowAction.emit('maximize');
  }

  public onKeyUp(event) {
    this.searchValue = event.target.value;
  }

  public isError(item) {
    const message = item.message || '';
    return message.indexOf('▶ ERROR') !== -1 || message.indexOf('▶ WARNI') !== -1;
  }
}
