import { Component, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';

const EMPTY_ERROR = {
  msg: 'DEBUGGER:ERROR-EMPTY-MSG',
  translate: true,
};

@Component({
  selector: 'flogo-flow-debug-panel-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorComponent implements OnChanges {
  @Input() errors: Array<string>;
  renderableError: {
    msg: string;
    translate: boolean;
  };

  ngOnChanges(simpleChanges) {
    let errorText;
    if (this.errors && this.errors.length > 0) {
      errorText = this.errors.join('\n');
    }

    if (errorText && errorText.trim()) {
      this.renderableError = {
        translate: false,
        msg: errorText,
      };
    } else {
      this.renderableError = EMPTY_ERROR;
    }
  }
}
