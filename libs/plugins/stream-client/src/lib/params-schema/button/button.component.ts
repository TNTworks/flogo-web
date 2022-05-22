import { Component, Input } from '@angular/core';
import { StreamMetadata } from '@flogo-web/plugins/stream-core';

@Component({
  selector: 'flogo-stream-params-schema-button',
  styleUrls: ['button.component.less'],
  templateUrl: 'button.component.html',
})
export class ButtonComponent {
  @Input()
  streamMetadata: StreamMetadata;
}
