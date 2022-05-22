import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MetadataAttribute } from '../core/interfaces';

@Component({
  selector: 'flogo-run-flow',
  templateUrl: 'run-flow.component.html',
  styleUrls: ['run-flow.component.less'],
})
export class FlogoRunFlowComponent {
  @Input()
  flowInputs: MetadataAttribute[];
  @Input()
  disableRun: boolean;
  @Input() disableReason?: string;
  @Output()
  submit: EventEmitter<MetadataAttribute[]> = new EventEmitter<MetadataAttribute[]>();
  showRunFlow = false;
  runFlowFormGroup: FormGroup;

  get isValid(): boolean {
    return this.runFlowFormGroup && this.runFlowFormGroup.valid;
  }

  setRunFlowFormGroup(formGroup: FormGroup) {
    this.runFlowFormGroup = formGroup;
  }

  private resetRunFlowFormGroup() {
    this.runFlowFormGroup = undefined;
  }

  /*
   * Run Flow form is not shown when the flow does not have any input metadata for the flow.
   * The Run Flow button should directly run the flow
   */
  handleRunFlowClick() {
    if (this.flowInputs.length > 0) {
      this.showHideRun();
    } else {
      this.resetRunFlowFormGroup();
      this.onRunFlowSubmit();
    }
  }

  showHideRun() {
    this.showRunFlow = !this.showRunFlow;
  }

  setRunFlowFlag(val: boolean) {
    this.showRunFlow = val;
  }

  onRunFlowSubmit() {
    this.setRunFlowFlag(false);
    this.submit.emit(this.runFlowFormGroup ? this.runFlowFormGroup.value.formFields : []);
  }
}
