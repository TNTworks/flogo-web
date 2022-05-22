import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'flogo-triggers-configuration-detail-action-buttons',
  templateUrl: './action-buttons.component.html',
  styleUrls: ['./action-buttons.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionButtonsComponent {
  @Input() status: { isDirty: boolean; isValid: boolean; isPending?: boolean };
  @Input() isSaving: boolean;
  @Output() discardChanges = new EventEmitter();
  @Output() save = new EventEmitter();
}
