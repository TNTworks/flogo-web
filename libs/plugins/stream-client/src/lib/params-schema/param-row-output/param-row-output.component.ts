import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'flogo-stream-params-schema-output-param-row',
  templateUrl: 'param-row-output.component.html',
  styleUrls: ['param-row-output.component.less'],
})

/**
 * @private
 */
export class ParamRowOutputComponent {
  @Input() paramGroup: FormGroup;
  @Input() dropdownOptions;
  @Input() inputIndex;
  @Output() removeParam: EventEmitter<number> = new EventEmitter<number>();
  isOpen: boolean;
  onRemoveParam() {
    this.removeParam.emit(this.inputIndex);
  }

  selectType(type) {
    this.paramGroup.patchValue({ type });
    this.isOpen = false;
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }
}
