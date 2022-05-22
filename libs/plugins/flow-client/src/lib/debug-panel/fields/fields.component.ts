import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FieldsInfo } from '../fields-info';

@Component({
  selector: 'flogo-flow-debug-panel-fields',
  templateUrl: './fields.component.html',
  styleUrls: ['./fields.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldsComponent {
  @Input() fields: FieldsInfo;
}
